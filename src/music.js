// Original, procedurally composed instrumentals. No recordings or external audio services.
const bufferCache=new Map();
export const TRACKS=[{id:'none',name:'A quiet moment',description:'No background music',icon:'♧'},{id:'petals',name:'Falling petals',description:'Airy bells · soft & unhurried',icon:'♬'},{id:'sitar',name:'Golden hour',description:'Plucked strings · a gentle celebration',icon:'♪'},{id:'piano',name:'Always, together',description:'Warm keys · a little romance',icon:'♫'},{id:'moonlight',name:'Moonlit vows',description:'Gentle chimes · dreamy & calm',icon:'☾'},{id:'garden',name:'Garden gathering',description:'Bright plucked notes · joyful & light',icon:'✿'},{id:'serenade',name:'A little serenade',description:'Soft melody · slow & romantic',icon:'♡'},{id:'celebration',name:'Celebration lights',description:'Sparkling notes · festive & warm',icon:'✧'}];
const frequency=n=>440*2**((n-69)/12);
async function compose(track,duration){
  const key=`${track}:${Math.ceil(duration)}`;if(bufferCache.has(key))return bufferCache.get(key);
  const promise=(async()=>{const Offline=globalThis.OfflineAudioContext||globalThis.webkitOfflineAudioContext;if(!Offline)throw new Error('This browser cannot create instrumental audio. Try uploading an audio file.');const ctx=new Offline(2,Math.ceil((duration+1)*22050),22050);
    const master=ctx.createGain();master.gain.value=.25;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=track==='sitar'?2800:1800;filter.connect(master);master.connect(ctx.destination);
    const delay=ctx.createDelay(1);delay.delayTime.value=.32;const echo=ctx.createGain();echo.gain.value=.18;filter.connect(delay);delay.connect(echo);echo.connect(master);
    const arrangements={
      sitar:{melody:[62,66,69,74,69,66,64,69,71,69,66,64,62,66,69,66],step:.65,roots:[50,50,55,50],attack:.018},
      piano:{melody:[60,64,67,72,71,67,64,62,57,60,64,69,67,64,62,60],step:.82,roots:[48,48,45,45],attack:.018},
      petals:{melody:[72,76,79,83,79,76,74,79,81,79,76,74,72,76,79,76],step:.94,roots:[50,50,50,50],attack:.09},
      moonlight:{melody:[76,79,83,79,74,78,81,78,72,76,79,76,71,74,78,74],step:1.05,roots:[52,50,48,47],attack:.12},
      garden:{melody:[67,71,74,79,76,74,71,69,65,69,72,77,74,72,69,67],step:.58,roots:[48,43,45,41],attack:.025},
      serenade:{melody:[69,72,76,74,72,69,67,64,65,69,72,71,69,67,64,60],step:1.02,roots:[45,41,48,43],attack:.08},
      celebration:{melody:[74,78,81,86,83,81,78,76,74,78,81,83,81,78,76,74],step:.52,roots:[50,45,47,43],attack:.02}
    };
    const {melody,step,roots,attack}=arrangements[track]||arrangements.petals;
    function note(n,start,length,volume){for(let harmonic=1;harmonic<=3;harmonic++){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=frequency(n)*harmonic;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume/(harmonic*harmonic),start+attack);gain.gain.exponentialRampToValueAtTime(.0001,start+length);osc.connect(gain);gain.connect(filter);osc.start(start);osc.stop(start+length+.03);}}
    for(let i=0;i*step<duration;i++){const t=i*step;note(melody[i%melody.length],t,step*2.7,.52);if(i%4===0){const root=roots[Math.floor(i/4)%roots.length];note(root,t,step*4,.22);note(root+7,t+.04,step*3.8,.12);}}
    return ctx.startRendering();})();bufferCache.set(key,promise);try{return await promise;}catch(e){bufferCache.delete(key);throw e;}
}
export async function createMusicSession(project,duration,{audible=false}={}){
  if(project.music.track==='none')return null;
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)throw new Error('This browser does not support audio mixing.');
  const ctx=new Audio();await ctx.resume();try{let buffer;if(project.music.track==='custom'){
    const asset=project.assets.find(a=>a.id===project.music.customId&&a.type==='audio');if(!asset)throw new Error('Upload a music file or select a built-in track.');const bytes=await (await fetch(asset.src)).arrayBuffer();buffer=await ctx.decodeAudioData(bytes);
  }else buffer=await compose(project.music.track,duration);
  const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;const gain=ctx.createGain();gain.gain.value=0;source.connect(gain);const destination=ctx.createMediaStreamDestination();gain.connect(destination);if(audible)gain.connect(ctx.destination);let started=false;
  return {stream:destination.stream,start(offset=0){if(started)return;started=true;const now=ctx.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(project.music.volume,now+Math.min(1,duration/3));gain.gain.setValueAtTime(project.music.volume,now+Math.max(1,duration-1));gain.gain.linearRampToValueAtTime(0,now+duration);source.start(0,offset%buffer.duration);},setVolume(volume){gain.gain.setTargetAtTime(volume,ctx.currentTime,.1);},async stop(){if(started){try{source.stop();}catch{}}destination.stream.getTracks().forEach(t=>t.stop());await ctx.close();}};
  }catch(e){await ctx.close();throw e;}
}
