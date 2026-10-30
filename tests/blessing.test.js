import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TEMPLATES,BLESSING_ARABIC,defaultProject,newPage,newBlessingPage,matchingDesign,setBlessing,blessingOptions,hasBlessingHeading,prepareBulkProject,validateProject,applyArtwork} from '../src/data.js';
import {drawPage} from '../src/render.js';

test('opening blessings inherit each design and palette with editable text and no sample asset',()=>{
  for(const theme of TEMPLATES){
    const p=defaultProject();p.pages=[newPage(theme.id)];p.pages[0].accent='#aa3344';
    const result=setBlessing(p,0,{placement:'opening'});
    assert.equal(result.project.pages.length,2);
    const opening=result.project.pages[0];assert.equal(opening.template,theme.id);assert.equal(opening.accent,'#aa3344');assert.equal(opening.kind,'blessing');assert.equal(opening.mediaId,null);assert.equal(result.project.assets.length,0);
    assert.equal(opening.blocks[0].text,BLESSING_ARABIC);assert.equal(opening.blocks[0].font,'arabic');assert.ok(opening.blocks.every(b=>!b.hidden));
    assert.equal(p.pages.length,1,'preview leaves the original untouched');
  }
});
test('headings make room, editing replaces rather than duplicates, removal restores original layout after saving',()=>{
  const p=defaultProject(),positions=p.pages[0].blocks.map(b=>b.y);
  const heading=setBlessing(p,0,{placement:'heading'}).project;assert.ok(hasBlessingHeading(heading.pages[0]));assert.ok(heading.pages[0].blocks.filter(b=>!b.key.startsWith('blessing')).every(b=>b.y>=.35));
  const edited=setBlessing(heading,0,{placement:'heading',preset:'custom',text:'With love from our families'}).project;
  assert.equal(edited.pages[0].blocks.filter(b=>b.key.startsWith('blessing')).length,1);assert.equal(blessingOptions(edited.pages[0]).text,'With love from our families');
  const restored=setBlessing(validateProject(edited),0,{placement:'none'}).project;
  assert.deepEqual(restored.pages[0].blocks.map(b=>b.y),positions);assert.equal(restored.pages[0].ornament,p.pages[0].ornament);
});
test('moving a heading to an opening page and back preserves invitation wording and order',()=>{
  let p=defaultProject();p.pages.push(newPage('rosewater','rsvp'));
  const original=p.pages[0].blocks.map(b=>b.text);
  p=setBlessing(p,0,{placement:'heading'}).project;p=setBlessing(p,0,{placement:'opening',preset:'english'}).project;
  assert.equal(p.pages.length,3);assert.equal(p.pages[0].kind,'blessing');assert.deepEqual(p.pages[1].blocks.map(b=>b.text),original);assert.equal(p.pages[2].kind,'rsvp');
  p=setBlessing(p,1,{placement:'opening',preset:'arabic'}).project;assert.equal(p.pages.length,3,'editing from invitation reuses its opening');
  p=setBlessing(p,0,{placement:'heading',preset:'bilingual'}).project;assert.equal(p.pages.length,2);assert.ok(hasBlessingHeading(p.pages[0]));assert.equal(p.pages[1].kind,'rsvp');
});
test('custom frame backgrounds carry through while finished artwork is kept clear',()=>{
  const p=defaultProject();p.assets=[{id:'a',kind:'frame'}];applyArtwork(p.pages[0],p.assets[0]);
  assert.equal(setBlessing(p,0,{placement:'opening'}).project.pages[0].mediaId,'a');
  p.assets[0].kind='finished';assert.equal(setBlessing(p,0,{placement:'opening'}).project.pages[0].mediaId,null);
  assert.throws(()=>setBlessing(p,0,{placement:'heading'}),/already contains text/);
  assert.equal(p.pages[0].mediaId,'a');
});
test('bulk personalization skips editable opening blessings and avoids inline blessing text',()=>{
  const p=defaultProject();p.pages.unshift(newBlessingPage(p.pages[0]));const bulk=prepareBulkProject(p);
  assert.equal(bulk.pages[0].blocks.length,2);assert.equal(bulk.pages[1].blocks.at(-1).key,'recipient');
  const heading=prepareBulkProject(setBlessing(defaultProject(),0,{placement:'heading'}).project);
  assert.equal(heading.pages[0].blocks.at(-1).y,.32);
});
test('old sample openings migrate to editable blessings matching the next invitation',()=>{
  const p=defaultProject();p.pages[0]=newPage('rosewater');
  p.assets=[{id:'old',kind:'blessing',name:'Opening blessing',type:'image',src:'data:image/png;base64,AA=='}];const old=newPage('royal');applyArtwork(old,p.assets[0]);p.pages.unshift(old);
  const restored=validateProject(p);assert.equal(restored.pages[0].kind,'blessing');assert.equal(restored.pages[0].template,'rosewater');assert.equal(restored.pages[0].mediaId,null);assert.equal(restored.assets.length,0);
});
test('opening limits are enforced and removing the only blessing leaves a usable blank page',()=>{
  const p=defaultProject();p.pages=Array.from({length:12},()=>newPage());
  assert.throws(()=>setBlessing(p,0,{placement:'opening'}),/12 pages/);assert.equal(setBlessing(p,0,{placement:'heading'}).project.pages.length,12);
  p.pages=[newBlessingPage(p.pages[0])];assert.throws(()=>setBlessing(p,0,{placement:'heading'}),/invitation page first/);
  const empty=setBlessing(p,0,{placement:'none'}).project;assert.equal(empty.pages.length,1);assert.equal(empty.pages[0].kind,'blank');
  p.pages.push(newBlessingPage(p.pages[0],{preset:'custom',text:'Another opening'}));
  const remaining=setBlessing(p,0,{placement:'none'}).project;assert.equal(remaining.pages.length,1);assert.equal(remaining.pages[0].blocks[0].text,'Another opening','removing one blessing preserves other opening pages');
});
test('Arabic font, direction and custom wording survive save and load and render right to left',()=>{
  const p=setBlessing(defaultProject(),0,{placement:'opening',preset:'arabic',arabic:'بسم الله الرحمن الرحيم'}).project;
  const restored=validateProject(p),b=restored.pages[0].blocks[0];assert.equal(b.font,'arabic');assert.equal(b.direction,'rtl');assert.equal(b.text,'بسم الله الرحمن الرحيم');
  const draws=[];const ctx=new Proxy({measureText:text=>({width:text.length*10}),fillText(text){draws.push({text,font:this.font,direction:this.direction});}}, {get:(target,key)=>key in target?target[key]:()=>{}});
  drawPage({width:0,height:0,getContext:()=>ctx},restored,restored.pages[0]);assert.match(draws[0].font,/Amiri/);assert.equal(draws[0].direction,'rtl');
});
