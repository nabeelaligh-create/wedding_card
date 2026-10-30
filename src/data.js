export const TEMPLATES = [
  {id:'gulmohar',name:'Gulmohar',category:'floral',label:'Floral · warm & timeless',background:'#fff8ec',ink:'#5d694c',accent:'#b46843',decoration:'botanical'},
  {id:'royal',name:'Royal evening',category:'classic',label:'Classic · navy & gold',background:'#071e2a',ink:'#bca06a',accent:'#bca06a',decoration:'royal',asset:'./backg.png'},
  {id:'rosewater',name:'Rosewater',category:'floral',label:'Floral · soft & romantic',background:'#f8eeee',ink:'#785052',accent:'#b67b7e',decoration:'botanical'},
  {id:'marigold',name:'Marigold',category:'classic',label:'Festive · a little sunshine',background:'#fff3cd',ink:'#914d2b',accent:'#d58c28',decoration:'marigold'},
  {id:'garden',name:'Garden vows',category:'floral',label:'Botanical · sage & cream',background:'#edf0e3',ink:'#425e48',accent:'#778b60',decoration:'botanical'},
  {id:'paper',name:'Simply us',category:'modern',label:'Modern · less is lovely',background:'#f6f2eb',ink:'#44463f',accent:'#9e8c71',decoration:'minimal'},
  {id:'midnight',name:'Written in the stars',category:'modern',label:'Celestial · midnight blue',background:'#172a3b',ink:'#e6d9bc',accent:'#b7a277',decoration:'celestial'},
  {id:'terracotta',name:'Desert rose',category:'modern',label:'Modern · earthy & bold',background:'#b56e55',ink:'#fff0db',accent:'#e7bf91',decoration:'arches'},
];
export const ASPECTS={portrait:{name:'Portrait',w:5,h:7},square:{name:'Square',w:1,h:1},story:{name:'Story',w:9,h:16},landscape:{name:'Landscape',w:7,h:5}};
// Public artwork is limited to empty frames. Blessings are composed as editable text.
export const ORIGINALS=[
  {src:'./backg.png',name:'Royal frame',kind:'frame',frameStyle:'ornate',background:'#071e2a',ink:'#bca06a'},
  {src:'./15757-ai.png',name:'Pearl frame',kind:'frame',frameStyle:'ornate',background:'#071e2a',ink:'#bca06a'},
];
export function applyArtwork(page,asset){
  page.mediaId=asset.id;page.mediaFit=asset.frameStyle==='ornate'?'frame':'contain';page.overlay=0;
  if(asset.background)page.background=asset.background;
  if(asset.ink){page.ink=asset.ink;page.accent=asset.ink;}
  page.blocks.forEach(b=>{b.hidden=asset.kind!=='frame';});
}
export function setTextVisibility(page,visible){page.blocks.forEach(b=>{b.hidden=!visible;});}
export const uid=()=>globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const clone=value=>JSON.parse(JSON.stringify(value));
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function block(key,text,y,size,style='normal',extra={}){return {id:uid(),key,text,x:.5,y,size,style,font:'serif',align:'center',color:'',width:.73,...extra};}
export function newPage(template='gulmohar',kind='invitation') {
  const theme=TEMPLATES.find(t=>t.id===template)||TEMPLATES[0];
  let blocks;
  if(kind==='cover') blocks=[block('overline','YOU ARE INVITED',.31,17),block('name1','Aarav',.43,84,'italic'),block('ampersand','&',.51,36,'italic'),block('name2','Meera',.6,84,'italic'),block('footer','A NEW CHAPTER, TOGETHER',.75,14)];
  else if(kind==='schedule') blocks=[block('overline','LET THE CELEBRATIONS BEGIN',.23,13),block('name1','The wedding festivities',.33,49,'italic'),block('schedule','MEHNDI & SANGEET\n13 February · 6:00 PM\n\nWEDDING CEREMONY\n14 February · 4:00 PM\n\nDINNER & CELEBRATIONS\n14 February · 7:00 PM',.59,23),block('venue','The Leela Palace, Jaipur',.85,20,'italic')];
  else if(kind==='rsvp') blocks=[block('overline','WE SAVED YOU A SEAT',.26,14),block('name1','Come celebrate with us',.4,56,'italic'),block('message','Your presence would mean the world to us.\nKindly respond by 1 February 2027.',.57,23),block('venue','RSVP · The Sharma family',.73,23),block('footer','+91 90000 00000',.79,20)];
  else blocks=[block('overline','THE WEDDING CELEBRATION OF',.235,14),block('name1','Aarav',.335,80,'italic'),block('ampersand','&',.415,33,'italic'),block('name2','Meera',.495,80,'italic'),block('host','Together with their families',.59,20,'italic'),block('message','joyfully invite you to share in their love\nand celebrate their wedding',.64,18),block('date','SUNDAY, 14 FEBRUARY 2027',.735,16),block('time','4:00 PM ONWARDS',.77,13),block('venue','The Leela Palace',.835,27,'italic'),block('address','JAIPUR, RAJASTHAN',.873,12),block('footer','a lifetime of love, a day to remember',.925,15,'italic')];
  if(kind==='blessing')blocks=blessingBlocks();
  if(kind==='blank')blocks=[];
  return {id:uid(),kind,name:({invitation:'The invitation',cover:'A little beginning',schedule:'The celebrations',rsvp:'With love & RSVP',blessing:'Opening blessing',blank:'Your blank canvas'})[kind]||'Your page',occasion:'wedding',template:theme.id,background:theme.background,ink:theme.ink,accent:theme.accent,decoration:theme.decoration,border:true,ornament:kind!=='blessing',duration:kind==='blessing'?3:6,transition:'fade',animation:'gentle',mediaId:null,mediaFit:'cover',overlay:0,blocks};
}
export const BLESSING_ARABIC='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
export const BLESSING_ENGLISH='In the name of Allah,\nthe Most Gracious, the Most Merciful.';
export const BLESSING_PRESETS=[['bilingual','Arabic & English'],['arabic','Arabic only'],['english','English only'],['custom','My own opening words']];
export const isBlessingBlock=b=>['blessingArabic','blessingTranslation','blessingCustom'].includes(b.key);
export const hasBlessingHeading=p=>p.kind!=='blessing'&&p.blocks.some(isBlessingBlock);
export function blessingOptions(p){
  const arabic=p.blocks.find(b=>b.key==='blessingArabic'),english=p.blocks.find(b=>b.key==='blessingTranslation'),custom=p.blocks.find(b=>b.key==='blessingCustom');
  return {preset:custom?'custom':arabic?(english?'bilingual':'arabic'):'english',arabic:arabic?.text??BLESSING_ARABIC,translation:english?.text??BLESSING_ENGLISH,text:custom?.text??'With love and blessings'};
}
function blessingBlocks({preset='bilingual',arabic=BLESSING_ARABIC,translation=BLESSING_ENGLISH,text='With love and blessings'}={},heading=false){
  const both=preset==='bilingual',blocks=[];
  if(preset==='arabic'||both)blocks.push(block('blessingArabic',arabic,heading?(both ? .19 : .22):(both ? .43 : .5),heading?36:62,'normal',{font:'arabic',direction:'rtl',width:.77}));
  if(preset==='english'||both)blocks.push(block('blessingTranslation',translation,heading?(both ? .265 : .225):(both ? .565 : .5),heading?17:30,'italic',{width:heading ? .73 : .65}));
  if(preset==='custom')blocks.push(block('blessingCustom',text,heading ? .225 : .5,heading?25:48,'italic'));
  return blocks;
}
export function matchingDesign(project,source){
  const result=clone(source),asset=project.assets.find(a=>a.id===source.mediaId);
  if(asset&&asset.kind!=='frame'){result.mediaId=null;result.overlay=0;}
  return result;
}
export function withoutBlessingHeading(source){
  const p=clone(source);p.blocks=p.blocks.filter(b=>!isBlessingBlock(b)).map(b=>{if(Number.isFinite(b.beforeBlessingY)){b.y=b.beforeBlessingY;delete b.beforeBlessingY;}return b;});
  if(typeof p.beforeBlessingOrnament==='boolean'){p.ornament=p.beforeBlessingOrnament;delete p.beforeBlessingOrnament;}
  return p;
}
export function newBlessingPage(base,options={}){
  const p=withoutBlessingHeading(base);return {...p,id:uid(),kind:'blessing',name:'Opening blessing',ornament:false,duration:3,blocks:blessingBlocks(options)};
}
export function withBlessingHeading(base,options={}){
  const p=withoutBlessingHeading(base),visible=p.blocks.filter(b=>!b.hidden&&b.text.trim());
  const top=Math.min(...visible.map(b=>b.y)),bottom=Math.max(...visible.map(b=>b.y));
  for(const b of p.blocks){b.beforeBlessingY=b.y;if(visible.includes(b))b.y=bottom>top ? .35+(b.y-top)/(bottom-top)*.57 : .62;}
  p.beforeBlessingOrnament=p.ornament;p.ornament=false;p.blocks.unshift(...blessingBlocks(options,true));
  if(p.blocks.length>40)throw new Error('This page has too many text layers. Use a separate opening page for the blessing.');
  return p;
}
// Build the preview and committed result through the same path; opening pages never use sample images.
export function setBlessing(project,index,options={}){
  const draft={...project,pages:clone(project.pages)},current=draft.pages[index];
  const openingIndex=current.kind==='blessing'?index:index>0&&draft.pages[index-1].kind==='blessing'?index-1:-1;
  const opening=draft.pages[openingIndex];
  let target=current.kind==='blessing'?(draft.pages.slice(index+1).find(p=>p.kind!=='blessing')||draft.pages.slice(0,index).reverse().find(p=>p.kind!=='blessing')):current;
  const source=matchingDesign(draft,opening||target||current);
  if(opening)draft.pages.splice(openingIndex,1);
  if(options.placement==='none'){
    if(target){const i=draft.pages.indexOf(target);draft.pages[i]=withoutBlessingHeading(target);return {project:draft,index:i};}
    if(draft.pages.length)return {project:draft,index:Math.min(index,draft.pages.length-1)};
    source.kind='blank';source.name='Your blank canvas';source.blocks=[];draft.pages=[source];return {project:draft,index:0};
  }
  if(options.placement==='heading'){
    if(!target)throw new Error('Add an invitation page first, or keep the blessing as a separate opening page.');
    const asset=draft.assets.find(a=>a.id===target.mediaId);
    if(asset&&asset.kind!=='frame')throw new Error('Choose a separate opening page for artwork that already contains text.');
    const i=draft.pages.indexOf(target);draft.pages[i]=withBlessingHeading(target,options);return {project:draft,index:i};
  }
  if(target){const i=draft.pages.indexOf(target);target=withoutBlessingHeading(target);draft.pages[i]=target;}
  if(draft.pages.length>=12)throw new Error('Your invitation already has 12 pages. Put the blessing above the invitation, or remove a page first.');
  const insert=openingIndex>=0?Math.min(openingIndex,draft.pages.length):draft.pages.indexOf(target);
  const i=Math.max(0,insert);draft.pages.splice(i,0,newBlessingPage(source,options));return {project:draft,index:i};
}
export function defaultProject(){return {version:1,name:'Our wedding invitation',aspect:'portrait',mode:'image',music:{track:'none',volume:.2,customId:null},pages:[newPage()],assets:[]};}
export function dimensions(aspect,width=1080){const a=ASPECTS[aspect]||ASPECTS.portrait;return {width,height:Math.round(width*a.h/a.w/2)*2};}
export function personalize(text,guest){return String(text).replace(/\{\{\s*(name|family|event)\s*\}\}/gi,(_,key)=>guest?.[key.toLowerCase()]??({name:'Guest name',family:'& family',event:'Wedding celebration'})[key.toLowerCase()]);}

// A pasted list needs no header. Commas remain part of a person's name.
export function parseGuestList(source,defaultFamily=''){
  const lines=String(source).replace(/^\uFEFF/,'').split(/\r\n|\n|\r/).map(v=>v.trim()).filter(Boolean);
  if(!lines.length)throw new Error('Add at least one guest, with one name on each line.');
  if(lines.length>200)throw new Error('Please split your list into batches of 200 guests or fewer.');
  return lines.map((line,i)=>{
    const values=line.replace(/^(?:[-•*]\s+|\d+[.)]\s+)/,'').split('|').map(v=>v.trim());
    if(values.length>3)throw new Error(`Line ${i+1}: use Name | family | event, or just a name.`);
    const [name,family=defaultFamily,event='']=values;
    if(!name)throw new Error(`Guest name is empty on line ${i+1}.`);
    if([name,family,event].some(v=>v.length>250))throw new Error(`Line ${i+1} contains a value longer than 250 characters.`);
    return {name,family,event};
  });
}
export const hasGuestName=project=>project.pages.some(p=>p.blocks.some(b=>!b.hidden&&/\{\{\s*name\s*\}\}/i.test(b.text)));
export const bulkGreetingPage=project=>project.pages.find(p=>{
  const a=project.assets.find(a=>a.id===p.mediaId);return p.kind!=='blessing'&&p.blocks.length<40&&(!a||a.kind==='frame');
});
export function prepareBulkProject(project,{addGreeting=true,greeting='To,\n{{name}} {{family}}'}={}){
  const result={...project,pages:clone(project.pages)};
  const target=bulkGreetingPage(result);
  if(addGreeting&&!hasGuestName(result)&&target)target.blocks.push(block('recipient',greeting,hasBlessingHeading(target) ? .32 : .19,17,'italic'));
  return result;
}
export function familyInvitationPages(base,words,{sequence=false}={}){
  const make=(name,blocks)=>({...withoutBlessingHeading(base),id:uid(),kind:'invitation',name,ornament:false,blocks});
  const b=(key,y,size,style='normal')=>block(key,words[key]||'',y,size,style);
  if(!sequence)return [make('The family invitation',[
    b('recipient',.13,15),b('host',.205,24,'italic'),b('message',.255,17),b('eventTitle',.305,24),
    b('name1',.385,51,'italic'),b('family1',.445,17),b('ampersand',.495,23,'italic'),
    b('name2',.555,51,'italic'),b('family2',.615,17),b('date',.69,18),b('time',.73,16),
    b('venue',.775,24,'italic'),b('address',.815,14),b('rsvp',.865,15),b('compliments',.915,14,'italic')
  ])];
  return [make('The family invitation',[
    b('recipient',.2,21),b('host',.34,39,'italic'),b('message',.425,23),b('eventTitle',.5,32,'italic'),
    b('family1',.6,23),b('family2',.68,23)
  ]),make('The happy couple',[
    b('name1',.35,80,'italic'),b('ampersand',.49,34,'italic'),b('name2',.63,80,'italic')
  ]),make('Date, venue & RSVP',[
    b('date',.28,32),b('time',.355,24),b('venue',.45,38,'italic'),b('address',.52,21),
    b('rsvp',.665,25),b('compliments',.8,24,'italic')
  ])];
}

// RFC 4180-style quoted fields, including commas, escaped quotes and newlines.
export function parseCSV(source){
  const rows=[];let row=[],field='',quoted=false;const text=String(source).replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!quoted&&field.trim())throw new Error('Unexpected quote in CSV. Put quoted values inside double quotes.');else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw new Error('An opening quote in your CSV is missing its closing quote.');
  row.push(field);if(row.some(v=>v.trim()))rows.push(row);
  if(rows.length<2)throw new Error('Include a name column and at least one guest.');
  const headers=rows.shift().map(h=>h.trim().toLowerCase());if(!headers.includes('name'))throw new Error('Your CSV needs a column named name. Optional columns: family, event.');
  const guests=rows.map((r,i)=>{if(r.length!==headers.length)throw new Error(`Row ${i+2} has ${r.length} fields; the header has ${headers.length}.`);const o={name:'',family:'',event:''};headers.forEach((h,j)=>{if(['name','family','event'].includes(h))o[h]=r[j].trim();});if(!o.name)throw new Error(`Guest name is empty on row ${i+2}.`);if(Object.values(o).some(v=>v.length>250))throw new Error(`Row ${i+2} contains a value longer than 250 characters.`);return o;});
  if(guests.length>200)throw new Error('Please split your list into batches of 200 guests or fewer.');return guests;
}
const safeColor=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
export function validateProject(input){
  if(!input||input.version!==1||!Array.isArray(input.pages)||!input.pages.length||input.pages.length>12)throw new Error('This is not a supported Mehfil project (1–12 pages required).');
  const result=defaultProject();result.name=String(input.name||'My invitation').slice(0,80);result.aspect=Object.hasOwn(ASPECTS,input.aspect)?input.aspect:'portrait';result.mode=input.mode==='video'?'video':'image';
  const incomingAssets=Array.isArray(input.assets)?input.assets:[];
  if(incomingAssets.length>24)throw new Error('A project can contain up to 24 media uploads.');
  let mediaSize=0;const seenIds=new Set();
  result.assets=incomingAssets.map(a=>{
    const match=typeof a?.src==='string'&&a.src.match(/^data:(image\/(png|jpeg|webp|gif)|video\/(mp4|webm|quicktime)|audio\/[a-z0-9.+-]+);base64,[A-Za-z0-9+/=\r\n]+$/);
    if(!a||!['image','video','audio'].includes(a.type)||!match||!match[1].startsWith(a.type+'/')||a.src.length>112000000)throw new Error('A project asset has an unsupported format.');
    const id=String(a.id||'').slice(0,100);if(!id||seenIds.has(id))throw new Error('Every project upload needs a unique media ID.');seenIds.add(id);
    mediaSize+=a.src.length;if(mediaSize>160000000)throw new Error('This project contains too much media (120 MB maximum).');
    const original=ORIGINALS.find(o=>o.name===a.name||o.src.split('/').pop()===a.name);
    return {id,name:String(a.name||'Upload').slice(0,150),type:a.type,src:a.src,kind:['frame','finished','blessing'].includes(a.kind)?a.kind:original?.kind||'finished',...(a.frameStyle==='ornate'||original?.frameStyle==='ornate'?{frameStyle:'ornate'}:{}),...(safeColor(a.background)?{background:a.background}:{}),...(safeColor(a.ink)?{ink:a.ink}:{})};
  });
  const assetIds=new Set(result.assets.map(a=>a.id));
  result.pages=input.pages.map(p=>{const out=newPage(p.template);out.id=uid();out.kind=['invitation','cover','schedule','rsvp','blessing','blank'].includes(p.kind)?p.kind:'invitation';out.name=String(p.name||'Your page').slice(0,80);out.occasion=String(p.occasion||'custom').slice(0,30);for(const c of ['background','ink','accent'])if(safeColor(p[c]))out[c]=p[c];
    for(const k of ['border','ornament'])out[k]=p[k]!==false;out.duration=Math.min(20,Math.max(2,Number(p.duration)||6));out.transition=['fade','slide','none'].includes(p.transition)?p.transition:'fade';out.animation=['gentle','sparkle','none'].includes(p.animation)?p.animation:'gentle';out.mediaId=assetIds.has(p.mediaId)?p.mediaId:null;out.mediaFit=['contain','frame'].includes(p.mediaFit)?p.mediaFit:'cover';out.overlay=Math.min(.9,Math.max(0,Number(p.overlay)||0));
    if(typeof p.beforeBlessingOrnament==='boolean')out.beforeBlessingOrnament=p.beforeBlessingOrnament;
    out.blocks=(Array.isArray(p.blocks)?p.blocks:[]).slice(0,40).map(b=>block(String(b.key||'custom').slice(0,50),String(b.text??'').slice(0,2000),Math.min(.97,Math.max(.03,Number(b.y)||.5)),Math.min(160,Math.max(8,Number(b.size)||20)),b.style==='italic'?'italic':'normal',{x:Math.min(.95,Math.max(.05,Number(b.x)||.5)),align:['left','center','right'].includes(b.align)?b.align:'center',font:['serif','sans','script','arabic'].includes(b.font)?b.font:'serif',direction:['rtl','ltr'].includes(b.direction)?b.direction:'auto',color:safeColor(b.color)?b.color:'',width:Math.min(.95,Math.max(.15,Number(b.width)||.73)),hidden:b.hidden===true,...(Number.isFinite(b.beforeBlessingY)?{beforeBlessingY:Math.min(.97,Math.max(.03,b.beforeBlessingY))}:{})}));return out;});
  // Upgrade only the old built-in sample used as a standalone opening; preserve visitors' uploads.
  const upgraded=new Set();result.pages=result.pages.map((p,i)=>{
    const asset=result.assets.find(a=>a.id===p.mediaId);
    if(asset?.kind!=='blessing'||!['Opening blessing','first.png'].includes(asset.name)||p.blocks.some(b=>!b.hidden&&b.text.trim()))return p;
    const neighbor=result.pages.slice(i+1).find(q=>result.assets.find(a=>a.id===q.mediaId)?.kind!=='blessing')||p;
    upgraded.add(asset.id);const opening=newBlessingPage(matchingDesign(result,neighbor));opening.duration=p.duration;return opening;
  });
  result.assets=result.assets.filter(a=>!upgraded.has(a.id)||result.pages.some(p=>p.mediaId===a.id));
  const m=input.music||{};result.music={track:['none','petals','sitar','piano','custom'].includes(m.track)?m.track:'none',volume:Math.min(1,Math.max(0,Number(m.volume)||0)),customId:assetIds.has(m.customId)?m.customId:null};return result;
}
export function safeFilename(value){return String(value).normalize('NFKC').replace(/[^\p{L}\p{M}\p{N} _-]/gu,'').trim().replace(/\s+/g,'-').slice(0,70)||'invitation';}
