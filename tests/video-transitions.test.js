import test from 'node:test';
import assert from 'node:assert/strict';
import {drawTimeline} from '../src/render.js';

function canvas() {
  const calls=[]; let alpha=1; const stack=[];
  const ctx={calls, setTransform(){}, clearRect(){}, scale(){}, fillRect(){},
    save(){stack.push(alpha);}, restore(){alpha=stack.pop();},
    measureText(text){return {width:text.length*10};},
    fillText(text){calls.push({text,alpha});}, drawImage() {},
    set globalAlpha(value){alpha=value;}, get globalAlpha(){return alpha;}};
  return {width:0,height:0,getContext(){return ctx;},calls};
}
function page(text,transition){return {duration:3,transition,animation:'gentle',background:'#fff',ink:'#000',accent:'#000',decoration:'royal',blocks:[{id:text,text,x:.5,y:.5,size:24,font:'serif'}]};}

test('three-page video keeps revealed text visible at both transition boundaries',()=>{
  const oldDocument=globalThis.document;
  globalThis.document={createElement:()=>canvas()};
  try {
    const project={aspect:'portrait',mode:'video',assets:[],pages:[page('first','fade'),page('second','slide'),page('third','none')]};
    for(const [time,text] of [[3,'second'],[6,'third']]){
      const output=canvas(); drawTimeline(output,project,time,{width:800});
      assert.equal(output.calls.find(c=>c.text===text)?.alpha,1,`${text} should remain visible after the transition`);
    }
    project.pages[0].transition='none';
    const cut=canvas(); drawTimeline(cut,project,3,{width:800});
    assert.equal(cut.calls.find(c=>c.text==='second')?.alpha,0,'a simple cut still starts the entrance animation');
  } finally {globalThis.document=oldDocument;}
});
