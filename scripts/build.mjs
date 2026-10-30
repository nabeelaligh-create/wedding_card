import {cp,mkdir,readFile,rm,writeFile,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ORIGINALS} from '../src/data.js';
import {makeZip} from '../src/export.js';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const output=join(root,'dist');
const publicFiles=['index.html','styles.css','favicon.svg','.nojekyll','src','assets',...ORIGINALS.map(a=>a.src.slice(2))];
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const name of publicFiles)await cp(join(root,name),join(output,name),{recursive:true});
await writeFile(join(output,'404.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · Mehfil</title><body style="font:18px Georgia,serif;text-align:center;padding:15vh 24px;background:#fafaf6;color:#344e41"><h1>Let's get back to your invitation.</h1><p>This page couldn't be found.</p><a href="./">Open Mehfil</a></body></html>`);
const files=[];
async function collect(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const full=join(dir,entry.name);if(entry.isDirectory())await collect(full);else files.push({name:relative(output,full).split('\\').join('/'),blob:new Blob([await readFile(full)])});}}
await collect(output);
const zip=await makeZip(files);
await writeFile(join(root,'mehfil-github-pages.zip'),new Uint8Array(await zip.arrayBuffer()));
console.log(`Built ${files.length} public files in dist/ (${(zip.size/1024/1024).toFixed(1)} MB).`);
console.log('Ready to upload: mehfil-github-pages.zip. Unzip it and upload its contents to your GitHub Pages repository.');
