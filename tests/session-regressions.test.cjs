const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation,types}=require('../dist/sim.js');
const {WaveRunner,seed}=require('../dist/waves.js');
require('../dist/rewards.js');
const {validate}=require('../dist/stats-settings.js');
const {progress}=require('../dist/production-panel.js');
const fs=require('node:fs');
test('saved defaults retain all setting groups and never resume a finished vortex',()=>{
 const data=JSON.parse(fs.readFileSync('dist/stats-defaults.json','utf8'));
 data.simulation.vortexRadius=6;data.vortex.startRadius=6;
 data.settings={visual:{ground:'#123456',zoom:30},waves:{library:structuredClone(seed),draft:structuredClone(seed.waves[0])},features:{dialogueSpeed:0,trigger:'wave',threshold:3},storage:{'round-circle-audio-v1':{music:.4,effects:.2},'round-circle-mix-v1':{shot:{file:'arcade/laser_1.wav',volume:.3}},'round-circle-production-layout-v1':{x:12,y:50,width:270,height:200}}};
 const result=validate(data);assert.equal(result.vortex.startRadius,1.2);assert.equal(result.simulation.vortexRadius,1.2);assert.deepEqual(result.settings,data.settings);data.settings.visual.zoom=12;assert.equal(result.settings.visual.zoom,30);
 assert.throws(()=>validate({...data,settings:{waves:{library:{}}}}));
});
test('manual waves do not cancel vortex growth or its scheduled thresholds',()=>{
 const s=new Simulation({production:false}),r=new WaveRunner(s),lib=structuredClone(seed);r.startVortex(lib);const plan=r.vortexPlan;r.runWave(lib.waves[0]);const radius=s.cfg.vortexRadius;s.tick(.5);r.tick();assert.equal(r.vortexPlan,plan);assert(s.cfg.vortexRadius>radius);
});
test('production window reflects construction, soldiers, full-train wagons and repair',()=>{
 const s=new Simulation({buildingCount:1,buildingPopInterval:30,production:true});const b=s.buildings[0];b.spawnProgress=.5;b.spawnRate=6;b.hp=b.maxHp-20;
 let rows=progress(s);assert(rows.some(r=>r.label.includes('maison')));assert(rows.some(r=>r.label.includes('soldat')&&r.value===.5&&r.detail.startsWith('5 s')));assert(rows.some(r=>r.label.startsWith('Réparation')));
 for(const w of s.wagons)while(s.passengers(w).length<w.capacity){const a=s.spawnActor();a.wagonId=w.id;}
 assert(progress(s).some(r=>r.label.includes('wagon')));s.cfg.production=false;assert(!progress(s).some(r=>r.label.startsWith('Production')));b.hp=0;assert(!progress(s).some(r=>r.label.startsWith('Réparation')));
});
for(const type of Object.keys(types))test(type+' fires at a reachable house even when a moving target is preferred',()=>{
 const s=new Simulation({buildingCount:0,buildingPopInterval:0,production:false,trainDamage:0,ramDamage:0});const b=s.addBuilding();b.x=9;b.z=0;b.regen=0;
 const m=s.spawn(type,{damage:10,range:2});m.x=9;m.z=1;m.timer=0;s.tick(.02);assert(b.hp<b.maxHp);
});
