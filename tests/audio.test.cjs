const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {cues,cueFor,Gate}=require('../dist/audio.js');
test('individual mixer settings retain silent volumes and selected files',()=>{
 const {mixSettings}=require('../dist/audio.js');
 const mix=mixSettings({shot:{file:'arcade/laser_2.wav',volume:0},impact:{volume:5}});
 assert.equal(mix.shot.file,'arcade/laser_2.wav');assert.equal(mix.shot.volume,0);assert.equal(mix.impact.volume,1);
 assert.equal(mix.ui.volume,.5);assert.deepEqual(mixSettings(JSON.parse(JSON.stringify(mix))),mix);
});
test('all arcade choices decode as PCM WAV with complete catalog entries',()=>{
 const vm=require('node:vm'),context={window:{}};vm.runInNewContext(fs.readFileSync('dist/arcade-catalog.js','utf8'),context);
 const files=context.window.RoundCircleSoundFiles;assert.equal(files.length,100);
 for(const f of files){const b=fs.readFileSync('dist/assets/audio/'+f.file);assert.equal(b.toString('ascii',0,4),'RIFF');assert(f.duration>0);}
});
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

test('music slider has fine low-volume control and a half-gain ceiling',()=>{
 const {musicGain}=require('../dist/audio.js');
 assert.equal(musicGain(0),0);assert(Math.abs(musicGain(.05)-.00125)<1e-12);
 assert.equal(musicGain(.5),.125);assert.equal(musicGain(1),.5);
 assert.equal(musicGain(2),.5);assert.equal(musicGain(-1),0);assert.equal(musicGain(NaN),0);
 for(let n=1;n<=100;n++)assert(musicGain(n/100)>musicGain((n-1)/100));
});
