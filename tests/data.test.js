import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,personalize,defaultProject,validateProject,dimensions,safeFilename} from '../src/data.js';
import {makeZip,crc32} from '../src/export.js';

test('guest CSV supports BOM, quoted commas, quotes, CRLF and Unicode names',()=>{
  const guests=parseCSV('\uFEFFname,family,event\r\n"Khan, Aisha",& family,Walima\r\n"Meera ""M"" Shah",,Sangeet\r\nआरव,,Wedding\r\n');
  assert.deepEqual(guests,[{name:'Khan, Aisha',family:'& family',event:'Walima'},{name:'Meera "M" Shah',family:'',event:'Sangeet'},{name:'आरव',family:'',event:'Wedding'}]);
});
test('guest CSV supports quoted multiline values',()=>assert.equal(parseCSV('name,family\n"Aarav\nSharma",& family')[0].name,'Aarav\nSharma'));
test('invalid guest lists fail with actionable errors',()=>{
  assert.throws(()=>parseCSV('guest\nAarav'),/column named name/);
  assert.throws(()=>parseCSV('name,family\n,A family'),/empty on row 2/);
  assert.throws(()=>parseCSV('name,family\nAarav,family,extra'),/Row 2/);
  assert.throws(()=>parseCSV('name\n"Aarav'),/closing quote/);
  assert.throws(()=>parseCSV('name\n'+Array(201).fill('Guest').join('\n')),/200/);
});
test('guest placeholders substitute safely and preserve ordinary braces',()=>{
  assert.equal(personalize('Dear {{ NAME }} {{family}} — {{event}} {other}',{name:'Aisha',family:'& family',event:'Nikah'}),'Dear Aisha & family — Nikah {other}');
  assert.equal(personalize('{{name}}',null),'Guest name');
});
test('projects round-trip and clamp imported layout values',()=>{
  const p=defaultProject();p.pages[0].blocks[0].size=1000;p.pages[0].duration=100;
  const restored=validateProject(JSON.parse(JSON.stringify(p)));assert.equal(restored.pages[0].blocks[0].size,160);assert.equal(restored.pages[0].duration,20);assert.equal(restored.name,p.name);assert.equal(restored.pages[0].template,'gulmohar');
});
test('project imports reject executable or remote asset references',()=>{
  const p=defaultProject();p.assets=[{id:'x',type:'image',src:'https://example.com/tracking.png'}];assert.throws(()=>validateProject(p),/unsupported format/);
  p.assets[0].src='data:image/svg+xml;base64,PHN2Zz4=';assert.throws(()=>validateProject(p),/unsupported format/);
  assert.throws(()=>validateProject({...p,pages:[]}),/supported Mehfil project/);
});
test('card dimensions preserve the selected shape',()=>{
  assert.deepEqual(dimensions('portrait',1080),{width:1080,height:1512});assert.deepEqual(dimensions('story',1080),{width:1080,height:1920});assert.deepEqual(dimensions('square',1080),{width:1080,height:1080});assert.deepEqual(dimensions('landscape',1080),{width:1080,height:772});
  for(const shape of ['portrait','story','square','landscape'])for(const width of [720,1080,1440,2160])assert.equal(dimensions(shape,width).height%2,0,'video codecs need even dimensions');
});
test('ZIP encodes checksums, UTF-8 paths, central directory and file contents',async()=>{
  const text=new TextEncoder().encode('hello wedding');const archive=await makeZip([{name:'001-आरव/card.png',blob:new Blob([text])},{name:'002-Aisha/card.png',blob:new Blob(['second card'])}]);
  const bytes=new Uint8Array(await archive.arrayBuffer()),v=new DataView(bytes.buffer);assert.equal(v.getUint32(0,true),0x04034b50);assert.equal(v.getUint32(14,true),crc32(text));assert.equal(v.getUint16(6,true),0x800);const nameLength=v.getUint16(26,true);assert.equal(new TextDecoder().decode(bytes.slice(30,30+nameLength)),'001-आरव/card.png');assert.deepEqual(bytes.slice(30+nameLength,30+nameLength+text.length),text);
  assert.equal(v.getUint32(bytes.length-22,true),0x06054b50);assert.equal(v.getUint16(bytes.length-12,true),2);const central=v.getUint32(bytes.length-6,true);assert.equal(v.getUint32(central,true),0x02014b50);
});
test('filenames cannot escape their guest folder',()=>{assert.equal(safeFilename('../../Aisha <Khan>'),'Aisha-Khan');assert.equal(safeFilename('आरव शर्मा'),'आरव-शर्मा');});
