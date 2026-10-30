import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject, validateProject, applyPageStyles} from '../src/data.js';
import {fontFamily} from '../src/render.js';
import {TRACKS} from '../src/music.js';

test('new script fonts survive project import and apply to all pages',()=>{
  for(const id of ['allura','greatvibes','parisienne','alexbrush','pinyonscript','sacramento','tangerine','arizonia']){
    const project=defaultProject();
    applyPageStyles(project,project.pages.map(p=>p.id),{font:id});
    assert.equal(validateProject(JSON.parse(JSON.stringify(project))).pages[0].blocks[0].font,id);
    assert.match(fontFamily(id),/Allura|Great Vibes|Parisienne|Alex Brush|Pinyon Script|Sacramento|Tangerine|Arizonia/);
  }
});

test('all built-in music selections survive project import',()=>{
  for(const track of TRACKS){
    const project=defaultProject();project.music.track=track.id;
    assert.equal(validateProject(JSON.parse(JSON.stringify(project))).music.track,track.id);
  }
});
