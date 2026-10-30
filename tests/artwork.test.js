import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ORIGINALS,ASPECTS,newPage,block,defaultProject,applyArtwork,setTextVisibility,validateProject,dimensions} from '../src/data.js';
import {drawPage,readyImages,floralLayout} from '../src/render.js';

function testCanvas(){
  const text=[],images=[];
  const ctx=new Proxy({measureText:value=>({width:value.length*10}),fillText:value=>text.push(value),drawImage:(...args)=>images.push(args)}, {get:(target,key)=>key in target?target[key]:()=>{}});
  return {canvas:{width:0,height:0,getContext:()=>ctx},text,images};
}
test('public artwork contains empty frames without finished sample images',()=>{
  assert.equal(ORIGINALS.filter(a=>a.kind==='blessing').length,0);
  assert.equal(ORIGINALS.filter(a=>a.kind==='frame').length,2);
  assert.ok(ORIGINALS.every(a=>!a.src.includes('Hoda')&&a.kind!=='finished'));
});
test('finished artwork hides overlays without deleting wording and allows new text',()=>{
  const project=defaultProject(),page=project.pages[0],original=page.blocks.map(b=>b.text);
  const asset={id:'finished',kind:'finished',type:'image',src:'data:image/png;base64,AA=='};
  applyArtwork(page,asset);
  assert.equal(page.mediaFit,'contain');assert.deepEqual(page.blocks.map(b=>b.text),original);
  const {canvas,text}=testCanvas();assert.deepEqual(drawPage(canvas,project,page),[]);assert.deepEqual(text,[]);
  page.blocks.push(block('custom','Dear Aisha',.1,20));drawPage(canvas,project,page);
  assert.deepEqual(text,['Dear Aisha']);
  setTextVisibility(page,true);assert.ok(page.blocks.every(b=>!b.hidden));
});
test('an empty frame restores editable text and applies a legible matching palette',()=>{
  const page=newPage();setTextVisibility(page,false);
  applyArtwork(page,{id:'frame',kind:'frame',frameStyle:'ornate',background:'#071e2a',ink:'#bca06a'});
  assert.ok(page.blocks.every(b=>!b.hidden));assert.equal(page.mediaFit,'frame');
  assert.equal(page.background,'#071e2a');assert.equal(page.ink,'#bca06a');
});
test('artwork type, hidden layers and frame fit survive a project round trip',()=>{
  const project=defaultProject();project.assets=[{id:'blessing',name:'My uploaded blessing',type:'image',kind:'blessing',background:'#071e2a',ink:'#bca06a',src:'data:image/png;base64,AA=='}];
  applyArtwork(project.pages[0],project.assets[0]);
  const restored=validateProject(JSON.parse(JSON.stringify(project)));
  assert.equal(restored.assets[0].kind,'blessing');assert.equal(restored.pages[0].mediaFit,'contain');assert.ok(restored.pages[0].blocks.every(b=>b.hidden));
  applyArtwork(project.pages[0],{...project.assets[0],kind:'frame',frameStyle:'ornate'});
  assert.equal(validateProject(project).pages[0].mediaFit,'frame');
});
test('imports reject mismatched media, duplicate IDs and inherited aspect names',()=>{
  const project=defaultProject();project.assets=[{id:'media',type:'image',src:'data:audio/wav;base64,AA=='}];
  assert.throws(()=>validateProject(project),/unsupported format/);
  project.assets=[{id:'media',type:'image',src:'data:image/png;base64,AA=='}];project.assets.push({...project.assets[0]});assert.throws(()=>validateProject(project),/unique media ID/);
  project.assets=[];project.aspect='toString';assert.equal(validateProject(project).aspect,'portrait');
});
test('floral clusters stay within their corners across every supported card shape',()=>{
  for(const aspect of Object.keys(ASPECTS))for(const template of ['gulmohar','rosewater','garden']){
    const {width:w,height:h}=dimensions(aspect,800);
    for(const p of floralLayout(template,w,h)){
      // Each spray's complete geometry is enclosed by this local box.
      const xs=[p.x-24*p.scale,p.x+170*p.scale*p.flipX,p.x+24*p.scale];
      assert.ok(Math.min(...xs)>=0&&Math.max(...xs)<=w);
      const end=p.y+175*p.scale*p.flipY;
      assert.ok(Math.min(p.y,end)>=0&&Math.max(p.y,end)<=h);
      assert.ok(p.y<h*.1||p.y>h*.9,'corner anchors follow the card edge');
      assert.ok(p.scale*170<=w*.23,'flowers leave the center text column clear');
    }
  }
});
test('navy frames render nine sections and preserve the proportions of the corners',async()=>{
  const oldImage=globalThis.Image;
  globalThis.Image=class{constructor(){this.naturalWidth=2000;this.naturalHeight=2000;}set src(value){queueMicrotask(()=>this.onload());}};
  try{const project=defaultProject();project.pages=[newPage('royal')];await readyImages(project);
    for(const aspect of Object.keys(ASPECTS)){project.aspect=aspect;const {canvas,images}=testCanvas();drawPage(canvas,project,project.pages[0]);assert.equal(images.length,9);const corner=images[0];assert.equal(corner[3]/corner[4],corner[7]/corner[8]);}
    project.pages[0].border=false;
    const plain=testCanvas();drawPage(plain.canvas,project,project.pages[0]);assert.equal(plain.images.length,0,'hiding the built-in border hides the navy frame artwork');assert.ok(plain.text.length,'the editable invitation stays visible');
  }finally{globalThis.Image=oldImage;}
});
test('the Desert rose border toggle removes every decorative arch',()=>{
  const project=defaultProject(),page=newPage('terracotta');page.ornament=false;page.border=false;
  const strokes=[],ctx=new Proxy({measureText:value=>({width:value.length*10}),stroke:()=>strokes.push('stroke'),strokeRect:()=>strokes.push('rect')},{get:(t,key)=>key in t?t[key]:()=>{}});
  const canvas={width:0,height:0,getContext:()=>ctx};
  drawPage(canvas,project,page);assert.equal(strokes.length,0);
  page.border=true;drawPage(canvas,project,page);assert.ok(strokes.length>0);
});
