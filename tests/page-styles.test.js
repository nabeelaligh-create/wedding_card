import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,newPage,block,clone,applyPageStyles,validateProject} from '../src/data.js';

function invitation(){const p=defaultProject();p.pages.push(newPage('paper','cover'),newPage('royal','blessing'));return p;}

test('shared styling changes only selected pages, even after reordering',()=>{
  const p=invitation(),ids=[p.pages[0].id,p.pages[2].id],untouched=clone(p.pages[1]);
  p.pages.reverse();
  applyPageStyles(p,ids,{font:'sans',border:false,ornament:false,ink:'#123456',animation:'none'});
  assert.deepEqual(p.pages.find(page=>page.id===untouched.id),untouched);
  for(const page of p.pages.filter(page=>ids.includes(page.id))){
    assert.equal(page.border,false);assert.equal(page.ornament,false);assert.equal(page.ink,'#123456');assert.equal(page.animation,'none');
    for(const b of page.blocks)assert.equal(b.font,b.key==='blessingArabic'?'arabic':'sans');
  }
});

test('all-page font and size edits preserve hidden layers, Arabic and text placement',()=>{
  const p=invitation(),first=p.pages[0];
  first.blocks.push(block('custom','Hidden words',.5,30,'normal',{hidden:true,font:'script'}),block('custom','مرحبا',.7,22));
  const before=clone(p);
  applyPageStyles(p,p.pages.map(page=>page.id),{font:'script',sizeFactor:1.1});
  for(let i=0;i<p.pages.length;i++)for(let j=0;j<p.pages[i].blocks.length;j++){
    const b=p.pages[i].blocks[j],old=before.pages[i].blocks[j];
    assert.equal(b.text,old.text);assert.equal(b.x,old.x);assert.equal(b.y,old.y);
    if(b.hidden)assert.deepEqual(b,old);
    else {assert.equal(b.size,Math.round(old.size*11)/10);if(old.font==='arabic'||/[\u0600-\u06ff]/.test(old.text))assert.equal(b.font,old.font);else assert.equal(b.font,'script');}
  }
  const restored=validateProject(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(restored.pages.map(page=>page.blocks.map(b=>[b.text,b.size,b.font])),p.pages.map(page=>page.blocks.map(b=>[b.text,b.size,b.font])));
});

test('size controls clamp safely and an empty selection changes nothing',()=>{
  const p=invitation(),before=clone(p);
  applyPageStyles(p,[],{font:'sans',border:false,sizeFactor:1.1});assert.deepEqual(p,before);
  const b=p.pages[0].blocks[0];b.size=159;
  applyPageStyles(p,[p.pages[0].id],{sizeFactor:1.1});assert.equal(b.size,160);
  b.size=8;applyPageStyles(p,[p.pages[0].id],{sizeFactor:1/1.1});assert.equal(b.size,8);
  for(const sizeFactor of [NaN,Infinity,-1,0]){applyPageStyles(p,[p.pages[0].id],{sizeFactor});assert.equal(b.size,8);}
});
