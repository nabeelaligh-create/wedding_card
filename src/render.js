import {TEMPLATES,dimensions,personalize,hasBlessingHeading} from './data.js';
const imageCache=new Map();
export function loadImage(src){if(!imageCache.has(src))imageCache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imageCache.delete(src);reject(new Error('A background image could not be loaded.'));};img.src=src;}));return imageCache.get(src);}
export const assetMedia=new Map();
export async function prepareAssets(project){
  await Promise.all(project.pages.map(async p=>{const a=project.assets.find(a=>a.id===p.mediaId);if(a?.type==='image')await loadImage(a.src);else if(a?.type==='video'&&!assetMedia.has(a.id)){
    const v=document.createElement('video');v.src=a.src;v.muted=true;v.playsInline=true;v.loop=true;v.preload='auto';await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error(`Loading ${a.name} took too long. Try a smaller video.`)),20000);v.onloadeddata=()=>{clearTimeout(timeout);resolve();};v.onerror=()=>{clearTimeout(timeout);reject(new Error(`Cannot play ${a.name}. Try an MP4 (H.264) or WebM file.`));};});assetMedia.set(a.id,v);
  }else if(!a&&TEMPLATES.find(t=>t.id===p.template)?.asset)await loadImage(TEMPLATES.find(t=>t.id===p.template).asset);}));
}
function line(ctx,x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function flower(ctx,x,y,r,color,petals=8){
  ctx.save();ctx.translate(x,y);
  // Nested, offset petals keep the flowers organic at thumbnail and export sizes.
  for(let layer=0;layer<3;layer++){
    const scale=1-layer*.24;ctx.save();ctx.rotate(layer*.38);
    for(let i=0;i<petals;i++){
      ctx.save();ctx.rotate(i*Math.PI*2/petals);ctx.beginPath();
      ctx.ellipse(0,-r*.48*scale,r*.32*scale,r*.54*scale,0,0,Math.PI*2);
      ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.8;ctx.stroke();ctx.restore();
    }ctx.restore();
  }
  ctx.fillStyle='#d8b56f';ctx.beginPath();ctx.arc(0,0,r*.14,0,Math.PI*2);ctx.fill();
  for(let i=0;i<7;i++){const a=i*2.4;ctx.fillStyle='#8a7047';ctx.beginPath();ctx.arc(Math.cos(a)*r*.1,Math.sin(a)*r*.1,r*.027,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function leaf(ctx,x,y,length,angle,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(length*.2,-length*.38,length*.8,-length*.4,length,0);ctx.bezierCurveTo(length*.65,length*.22,length*.25,length*.2,0,0);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.7;line(ctx,2,0,length*.85,-length*.025,'rgba(255,255,255,.22)',.7);ctx.restore();}
export function floralLayout(template,w,h){
  // Size decorations from the shorter dimension; their anchors follow the card edges.
  const scale=Math.min(w/800,h/900)*.84;
  const opposite=template==='rosewater';
  return [{x:opposite?w*.955:w*.045,y:h*.04,scale,flipX:opposite?-1:1,flipY:1},
    {x:opposite?w*.045:w*.955,y:h*.96,scale,flipX:opposite?1:-1,flipY:-1}];
}
function cornerSpray(ctx,placement,ink,accent,style){
  ctx.save();ctx.translate(placement.x,placement.y);ctx.scale(placement.scale*placement.flipX,placement.scale*placement.flipY);
  const stems=[[[8,155],[0,75],[48,15],[148,12]],[[10,158],[55,112],[89,71],[125,52]],[[10,158],[4,118],[16,70],[9,28]]];
  for(const [start,c1,c2,end] of stems){ctx.beginPath();ctx.moveTo(...start);ctx.bezierCurveTo(...c1,...c2,...end);ctx.strokeStyle=ink;ctx.lineWidth=1.3;ctx.stroke();}
  const leaves=[[12,125,34,-2.1],[26,105,33,-.45],[37,65,34,-1.9],[56,40,36,-.5],[88,21,30,-1.2],[112,15,29,-.1],[57,111,34,.03],[76,88,31,-1.5],[98,70,27,-.25],[9,82,30,-2.05],[9,51,23,-1.35]];
  for(const [x,y,l,a] of leaves){ctx.globalAlpha=.74;leaf(ctx,x,y,l,a,ink);}ctx.globalAlpha=1;
  if(style==='garden'){
    for(const [x,y,r] of [[40,68,9],[93,28,7],[73,103,6]])flower(ctx,x,y,r,'#f9f7e8',6);
  }else{
    flower(ctx,39,55,26,accent,style==='rosewater'?10:7);flower(ctx,90,70,18,accent,8);flower(ctx,14,111,13,accent,7);
    for(const [x,y] of [[65,17],[121,45],[22,20]]){ctx.fillStyle=accent;ctx.beginPath();ctx.arc(x,y,3.4,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}
function arch(ctx,w,h,color,opening=false){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=.9;ctx.globalAlpha=.5;const x=w*.108,b=h*.947,r=w*.39,y=h*.08-(opening?r*.19:0);ctx.beginPath();ctx.moveTo(x,b);ctx.lineTo(x,y+r);ctx.bezierCurveTo(x,y-r*.08,w-x,y-r*.08,w-x,y+r);ctx.lineTo(w-x,b);ctx.closePath();ctx.stroke();ctx.globalAlpha=.24;ctx.strokeRect(w*.075,h*.045,w*.85,h*.91);ctx.restore();}
function emblem(ctx,w,h,accent){ctx.save();ctx.translate(w/2,h*.145);ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=1;for(let side of [-1,1]){ctx.save();ctx.scale(side,1);ctx.beginPath();ctx.moveTo(0,12);ctx.quadraticCurveTo(28,5,43,-19);ctx.stroke();for(let i=0;i<4;i++)leaf(ctx,13+i*7,7-i*5,12,-1.7,accent);ctx.restore();}flower(ctx,0,0,9,accent);ctx.restore();}
function decoration(ctx,p,w,h,t=0){const {accent,ink}=p;if(p.decoration==='royal')return;
  if(p.border){if(['botanical','marigold'].includes(p.decoration))arch(ctx,w,h,accent,hasBlessingHeading(p));else{ctx.strokeStyle=accent;ctx.globalAlpha=.45;ctx.lineWidth=1;ctx.strokeRect(w*.065,h*.055,w*.87,h*.89);ctx.globalAlpha=1;}}
  if(p.decoration==='botanical'){for(const placement of floralLayout(p.template,w,h))cornerSpray(ctx,placement,ink,accent,p.template); }
  if(p.decoration==='marigold'){
    const radius=Math.min(w,h),heading=hasBlessingHeading(p);
    for(let i=0;i<7;i++){const x=w*(.06+i*.146),y=h*(heading ? .075+(i%2)*.03 : .12+(i%2)*.04);ctx.strokeStyle=ink;ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x-20,y*.7,x,y);ctx.stroke();ctx.globalAlpha=1;flower(ctx,x,y,radius*.022,accent);}
    for(let i=0;i<9;i++)flower(ctx,w*(.03+i*.117),h*.98,radius*.026,accent);
  }
  if(p.decoration==='celestial'){ctx.fillStyle=accent;for(let i=0;i<65;i++){const x=((i*337+19)%997)/997*w,y=((i*211+87)%991)/991*h;if(x>w*.19&&x<w*.81&&y>h*.2&&y<h*.93)continue;ctx.globalAlpha=.3+(Math.sin(t*.7+i)+1)*.25;ctx.beginPath();ctx.arc(x,y,(i%3+1)*.65,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;const cy=hasBlessingHeading(p)?h*.1:h*.145,r=Math.min(w,h)*.032;ctx.beginPath();ctx.arc(w*.5,cy,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=p.background;ctx.beginPath();ctx.arc(w*.5+r*.375,cy-r*.28,r*.9375,0,Math.PI*2);ctx.fill();}
  if(p.decoration==='arches'){ctx.save();ctx.strokeStyle=accent;ctx.globalAlpha=.5;for(let i=0;i<4;i++){const pad=w*(.04+i*.013);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,h);ctx.lineTo(pad,w*.55);ctx.bezierCurveTo(pad,-w*.06,w-pad,-w*.06,w-pad,w*.55);ctx.lineTo(w-pad,h);ctx.stroke();}ctx.restore();}
  if(p.ornament&&!['celestial','marigold'].includes(p.decoration))emblem(ctx,w,h,accent);
}
export const fontFamily=font=>font==='arabic'?'"Amiri", serif':font==='sans'?'"DM Sans", "Amiri", Arial, sans-serif':font==='script'?'"Snell Roundhand", "Amiri", "URW Chancery L", cursive':'"Cormorant Garamond", "Amiri", Georgia, serif';
function drawFrame(ctx,source,w,h){
  // Nine-slice the empty artwork: corners keep their proportions in every card shape.
  const sw=source.naturalWidth,sh=source.naturalHeight,corner=Math.min(w,h)*.14;
  const sx=[0,sw*.14,sw*.86,sw],sy=[0,sh*.14,sh*.86,sh];
  const dx=[0,corner,w-corner,w],dy=[0,corner,h-corner,h];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)ctx.drawImage(source,sx[col],sy[row],sx[col+1]-sx[col],sy[row+1]-sy[row],dx[col],dy[row],dx[col+1]-dx[col],dy[row+1]-dy[row]);
}
function wrapLines(ctx,text,width){const lines=[];for(const paragraph of text.split('\n')){if(!paragraph){lines.push('');continue;}const words=paragraph.split(/\s+/);let line='';for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>width&&line){lines.push(line);line=word;}else line=test;}lines.push(line);}return lines;}
export function drawPage(canvas,project,page,{width=800,time=0,guest=null,selection=null,showSelection=false}={}){
  const {height}=dimensions(project.aspect,width);if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
  const ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);const w=800,h=800*height/width;ctx.scale(width/800,width/800);ctx.fillStyle=page.background;ctx.fillRect(0,0,w,h);
  const asset=project.assets.find(a=>a.id===page.mediaId),theme=TEMPLATES.find(t=>t.id===page.template);let source=null;
  if(asset?.type==='video')source=assetMedia.get(asset.id);else if(asset?.type==='image'){const promise=imageCache.get(asset.src);source=promise?._image;}else if(theme?.asset)source=imageCache.get(theme.asset)?._image;
  if(source&&(source.naturalWidth||source.videoWidth)){
    if((!asset&&page.decoration==='royal')||(asset?.frameStyle==='ornate'&&asset.type==='image'&&page.mediaFit==='frame'))drawFrame(ctx,source,w,h);
    else{const sw=source.naturalWidth||source.videoWidth,sh=source.naturalHeight||source.videoHeight;const scale=(page.mediaFit==='contain'&&asset?Math.min:Math.max)(w/sw,h/sh);ctx.drawImage(source,(w-sw*scale)/2,(h-sh*scale)/2,sw*scale,sh*scale);}
  }
  if(asset&&page.overlay){ctx.fillStyle=`rgba(0,0,0,${page.overlay})`;ctx.fillRect(0,0,w,h);}
  if(!asset)decoration(ctx,page,w,h,time);
  if(project.mode==='video'&&page.animation==='sparkle'){ctx.fillStyle=page.accent;for(let i=0;i<25;i++){const x=((i*167+31)%800),y=(((i*59-time*14)%h)+h)%h;ctx.globalAlpha=.12+.16*Math.sin(time+i)**2;ctx.beginPath();ctx.arc(x,y,1.4+(i%3),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  const bounds=[];const entrance=project.mode==='video'&&page.animation==='gentle'?Math.min(1,time/1.1):1;
  for(const b of page.blocks){if(b.hidden)continue;const text=personalize(b.text,guest);if(!text.trim())continue;ctx.save();const arabic=b.font==='arabic'||/[\u0600-\u06ff]/.test(text);ctx.direction=b.direction==='rtl'||b.direction==='ltr'?b.direction:arabic?'rtl':'ltr';let size=b.size*Math.min(1,h/1120);const maxWidth=w*(b.width||.73);const typeface=fontFamily(arabic?'arabic':b.font),style=!arabic&&b.style==='italic'?'italic ':'';ctx.font=`${style}${size}px ${typeface}`;let lines=wrapLines(ctx,text,maxWidth);
    // Long names and translated text shrink rather than overflowing the card.
    const leading=arabic?1.8:1.22;
    while((Math.max(...lines.map(l=>ctx.measureText(l).width))>maxWidth||lines.length*size*leading>h*.33)&&size>9){size-=1;ctx.font=`${style}${size}px ${typeface}`;lines=wrapLines(ctx,text,maxWidth);}
    const lineHeight=size*leading,totalHeight=lines.length*lineHeight;let x=b.x*w,y=b.y*h-totalHeight/2+size*(arabic?1.18:.82);if(entrance<1){ctx.globalAlpha=entrance;y+=(1-entrance)*12;}
    ctx.fillStyle=b.color||((b.key==='name1'||b.key==='name2'||b.key==='ampersand')?page.accent:page.ink);ctx.textAlign=b.align||'center';ctx.textBaseline='alphabetic';for(const l of lines){ctx.fillText(l,x,y);y+=lineHeight;}
    const actualWidth=Math.max(...lines.map(l=>ctx.measureText(l).width),20),left=b.align==='left'?x:b.align==='right'?x-actualWidth:x-actualWidth/2;const bound={id:b.id,x:left-8,y:b.y*h-totalHeight/2-3,width:actualWidth+16,height:totalHeight+6};bounds.push(bound);ctx.restore();
    if(showSelection&&selection===b.id){ctx.save();ctx.strokeStyle='#71895a';ctx.lineWidth=1.3;ctx.setLineDash([5,4]);ctx.strokeRect(bound.x,bound.y,bound.width,bound.height);ctx.restore();}
  }
  return bounds.map(b=>({...b,x:b.x/800,y:b.y/h,width:b.width/800,height:b.height/h}));
}
// Resolve decoded images synchronously during animation frames.
export async function readyImages(project){await prepareAssets(project);if(globalThis.document?.fonts&&project.pages.some(p=>p.blocks.some(b=>b.font==='arabic'||/[\u0600-\u06ff]/.test(b.text))))await document.fonts.load('42px "Amiri"');for(const [src,p] of imageCache){const img=await p;p._image=img;}return project;}
export function hitTest(bounds,x,y){return [...bounds].reverse().find(b=>x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height);}
export function totalDuration(project){return project.pages.reduce((sum,p)=>sum+p.duration,0);}
export function pageAtTime(project,seconds){let start=0;for(let i=0;i<project.pages.length;i++){const p=project.pages[i];if(seconds<start+p.duration||i===project.pages.length-1)return {page:p,index:i,time:Math.max(0,seconds-start),start};start+=p.duration;}return null;}
export function drawTimeline(canvas,project,seconds,{width=1080,guest=null}={}){
  const point=pageAtTime(project,seconds);drawPage(canvas,project,point.page,{width,time:point.time,guest});
  const transition=point.page.transition;const remaining=point.page.duration-point.time;if(remaining<.65&&point.index<project.pages.length-1&&transition!=='none'){
    const next=document.createElement('canvas');drawPage(next,project,project.pages[point.index+1],{width,time:1.1,guest});const ctx=canvas.getContext('2d');ctx.save();ctx.setTransform(1,0,0,1,0,0);const progress=1-remaining/.65;if(transition==='fade'){ctx.globalAlpha=progress;ctx.drawImage(next,0,0);}else ctx.drawImage(next,canvas.width*(1-progress),0);ctx.restore();
  }return point;
}
