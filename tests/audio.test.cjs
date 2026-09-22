const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {cues,cueFor,Gate}=require('../dist/audio.js');
test('eight reusable effects and music assets are present',()=>{
 assert.equal(Object.keys(cues).length,8);
 for(const c of Object.values(cues)){const b=fs.readFileSync('dist/assets/audio/'+c.file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');}
 assert(fs.statSync('dist/assets/audio/fortress-of-bone.mp3').size>1000000);
});
test('combat, production, waves and rewards use the shared cue routes',()=>{
 for(const [event,cue] of Object.entries({shot:'shot',hit:'impact',ram:'impact',death:'death',born:'spawn',spawn:'spawn',board:'spawn','building-born':'spawn','wagon-born':'spawn','wave-launched':'wave','wave-complete':'reward','reward-chosen':'reward'}))assert.equal(cueFor({type:event}),cue);
 assert.equal(cueFor({type:'unknown'}),null);
});
test('audio gate suppresses bursts and repeated contacts, then releases',()=>{
 const gate=new Gate();assert(gate.allow('shot',0));assert(!gate.allow('shot',.05));assert(gate.allow('shot',.13));
 const burst=new Gate();for(const id of ['shot','impact','spawn','ui'])assert(burst.allow(id,0));assert(!burst.allow('death',0));assert(burst.allow('death',.11));assert(!burst.allow('invalid',1));
});
