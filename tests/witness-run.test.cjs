const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const simulation=require('../dist/sim.js');
const waves=require('../dist/waves.js');
const rewards=require('../dist/rewards.js');
const stats=require('../dist/stats-settings.js');
global.RoundCircleSimulation=simulation;
global.RoundCircleWaves=waves;
global.RoundCircleRewards=rewards;
global.RoundCircleStats=stats;
const {validate}=require('../dist/run-config.js');
const {resolveOutcome}=require('../dist/endgame.js');
const source=require('../dist/partie-temoin.json');
const profile=validate(source);

test('witness dictionary validates every gameplay system and five-minute schedule',async()=>{
 const core=fs.readFileSync(path.join(__dirname,'../dist/dialogue/src/dialogue-core.js'),'utf8');
 const {validateLibrary}=await import('data:text/javascript,'+encodeURIComponent(core));
 assert.doesNotThrow(()=>validateLibrary(profile.dialogue.library));
 assert.equal(profile.stats.vortex.rate,.96);
 assert.equal(profile.waves.vortex.triggers.length,10);
 assert.equal(profile.dialogue.cues.length,3);
 assert.equal(profile.bonuses.catalog.length,10);
 assert.equal(profile.stats.simulation.manualProduction,true);
 assert.deepEqual(profile.audio,{music:.08,effects:.08});
 assert.equal(profile.soldiers.length,4);
 assert.throws(()=>validate({...source,soldiers:[source.soldiers[0]]}));
 assert.throws(()=>validate({...source,audio:{music:2,effects:.08}}));
 assert.deepEqual(Object.keys(source.stats.simulation).sort(),Object.keys(simulation.defaults).sort());
 assert.deepEqual(Object.keys(source.stats.monsters).sort(),Object.keys(simulation.types).sort());
 assert.equal(profile.waves.waves.flatMap(w=>w.groups).reduce((total,g)=>total+g.count,0),118);
 assert.deepEqual(new Set(profile.waves.waves.flatMap(w=>w.groups.map(g=>g.type))),new Set(Object.keys(simulation.types)));
 for(const asset of [...Object.values(profile.dialogue.library.backplates),...Object.values(profile.dialogue.library.characters).flatMap(character=>Object.values(character.poses))])assert(fs.existsSync(path.join(__dirname,'../dist/dialogue',asset)),asset);
});

test('witness stats and wave definitions drive a fresh simulation',()=>{
 const sim=new simulation.Simulation(profile.stats.simulation);
 sim.profile=structuredClone(profile.stats.profile);
 sim.monsterSpecs=structuredClone(profile.stats.monsters);
 const runner=new waves.WaveRunner(sim);
 runner.startRun(profile.waves);
 assert.equal(sim.train.maxHp,280);
 assert.equal(sim.buildings.length,5);
 assert.equal(waves.vortexRemaining(sim.cfg.vortexRadius,runner.vortexPlan.rate),300);
 for(let i=0;i<101;i++){sim.tick(.25);runner.tick();}
 assert.equal(runner.records[0].waveId,'arrival');
 assert.equal(runner.records[0].name,profile.waves.waves[0].name);
 const cathedral=sim.spawn('cathedral');
 assert.equal(cathedral.maxHp,420);
 assert.equal(cathedral.damage,14);
});

test('ending priority follows dialogue, village, final wave and train survival',()=>{
 const state={train:{hp:100},radius:6,buildings:2};
 const flags={listened:true,passage:true,invitation:true};
 const cleared=[{waveId:'threshold',done:true}];
 assert.equal(resolveOutcome(profile,flags,cleared,state),'harmony');
 assert.equal(resolveOutcome(profile,{...flags,passage:false},cleared,state),'force');
 assert.equal(resolveOutcome(profile,flags,[],{...state,buildings:0}),'departure');
 assert.equal(resolveOutcome(profile,{},[],state),'departure');
 assert.equal(resolveOutcome(profile,flags,cleared,{...state,train:{hp:0}}),'defeat');
 assert.equal(resolveOutcome(profile,flags,cleared,{...state,radius:5.9}),null);
});

test('a siege monster attacks a house within range before a nearby train',()=>{
 const sim=new simulation.Simulation({production:false,buildingCount:0,buildingPopInterval:0,trainDamage:0,ramDamage:0});
 const home=sim.addBuilding();home.x=9;home.z=0;home.regen=0;
 const monster=sim.spawn('spitter',{speed:0,range:5,damage:7});monster.x=8.5;monster.z=0;
 sim.train.x=6.95;sim.train.z=0;sim.wagons=[];
 sim.tick(.02);
 assert.equal(monster.targetId,home.id);
 assert.equal(home.hp,home.maxHp-7);
});
