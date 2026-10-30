import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseGuestList,defaultProject,newPage,block,applyArtwork,prepareBulkProject,hasGuestName,familyInvitationPages,validateProject,personalize} from '../src/data.js';

test('plain lists accept pasted names, numbered lists, Unicode, couples and commas without a CSV header',()=>{
  const guests=parseGuestList('\uFEFF1. Ahmed Khan\r\n\r\n2) Priya Sharma\n• Meera & Rohan\nKhan, Aisha\nआरव शर्मा','& family');
  assert.deepEqual(guests.map(g=>g.name),['Ahmed Khan','Priya Sharma','Meera & Rohan','Khan, Aisha','आरव शर्मा']);
  assert.ok(guests.every(g=>g.family==='& family'));
});
test('plain lists keep duplicates and support individual family and event wording',()=>{
  const guests=parseGuestList('Ahmed | & family | Nikah\nPriya | | Walima\nAhmed','& spouse');
  assert.deepEqual(guests,[{name:'Ahmed',family:'& family',event:'Nikah'},{name:'Priya',family:'',event:'Walima'},{name:'Ahmed',family:'& spouse',event:''}]);
  assert.throws(()=>parseGuestList('  \n'),/at least one/);
  assert.throws(()=>parseGuestList('Name | family | event | extra'),/Line 1/);
  assert.throws(()=>parseGuestList('| family'),/empty on line 1/);
  assert.throws(()=>parseGuestList('A'.repeat(251)),/250/);
  assert.throws(()=>parseGuestList(Array(201).fill('Guest').join('\n')),/200/);
});
test('automatic bulk greeting skips opening artwork and leaves the original template untouched',()=>{
  const p=defaultProject(),blessing=newPage('royal');p.assets=[{id:'blessing',kind:'blessing'}];applyArtwork(blessing,p.assets[0]);p.pages.unshift(blessing);
  const before=JSON.stringify(p),bulk=prepareBulkProject(p,{greeting:'To,\n{{name}} {{family}}'});
  assert.equal(JSON.stringify(p),before);assert.equal(bulk.pages[0].blocks.filter(b=>!b.hidden).length,0);
  assert.equal(bulk.pages[1].blocks.at(-1).key,'recipient');assert.ok(hasGuestName(bulk));
  for(const guest of parseGuestList('Aisha\nMeera & Rohan'))assert.equal(personalize(bulk.pages[1].blocks.at(-1).text,guest),`To,\n${guest.name} `);
});
test('bulk honors a placed greeting, ignores hidden placeholders and requires editable space',()=>{
  const p=defaultProject();p.pages[0].blocks.push(block('recipient','Dear {{name}}',.15,17));
  assert.equal(prepareBulkProject(p).pages[0].blocks.length,p.pages[0].blocks.length);
  p.pages[0].blocks.at(-1).hidden=true;assert.equal(hasGuestName(p),false);
  const bulk=prepareBulkProject(p);assert.equal(bulk.pages[0].blocks.length,p.pages[0].blocks.length+1);
  p.assets=[{id:'finished',kind:'finished'}];applyArtwork(p.pages[0],p.assets[0]);assert.equal(hasGuestName(prepareBulkProject(p)),false);
  p.pages[0].blocks.push(block('custom','To {{name}}',.8,20));assert.equal(hasGuestName(prepareBulkProject(p)),true);
});
const words={recipient:'To,\n{{name}} {{family}}',host:'Mr. & Mrs. Khan',message:'request the honour of your presence at the',eventTitle:'Walima Reception',name1:'Person One',family1:'Son of Mr. & Mrs. Khan',ampersand:'&',name2:'Person Two',family2:'Daughter of Mr. Khan & late Mrs. Khan',date:'14 February 2027',time:'Lunch, 1 PM',venue:'The venue',address:'The address',rsvp:'RSVP: Family\n+91 90000 00000',compliments:'With best compliments from,\nFamily & friends'};
test('family wording and script sequence retain all editable details through save and restore',()=>{
  for(const sequence of [false,true]){
    const p=defaultProject(),original=JSON.stringify(p.pages[0]);p.pages=familyInvitationPages(p.pages[0],words,{sequence});
    assert.equal(p.pages.length,sequence?3:1);
    const restored=validateProject(p),blocks=restored.pages.flatMap(p=>p.blocks);
    for(const [key,text] of Object.entries(words))assert.equal(blocks.find(b=>b.key===key)?.text,text,key);
    assert.equal(new Set(blocks.map(b=>b.id)).size,blocks.length);
    assert.ok(hasGuestName(restored));assert.equal(prepareBulkProject(restored).pages.flatMap(p=>p.blocks).length,blocks.length,'no second greeting');
    assert.ok(!original.includes('Person One'));
  }
});
test('custom blank uploads preserve the complete background without stretching it as an ornate frame',()=>{
  const p=newPage();applyArtwork(p,{id:'photo',type:'image',kind:'frame'});assert.equal(p.mediaFit,'contain');assert.ok(p.blocks.every(b=>!b.hidden));
});
