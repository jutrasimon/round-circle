const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation,soldierProfiles}=require('../dist/sim.js');
const advance=(s,t)=>{for(let n=0;n<Math.ceil(t/.1);n++)s.tick(.1);};
const make=()=>new Simulation({buildingCount:2,buildingPopInterval:0,actorLimit:10});
test('manual houses remain idle until ordered and finish only one recruit',()=>{
 const s=make(),b=s.buildings[0];advance(s,60);assert.equal(s.actors.length,0);
 assert(s.queueTraining(b.id,'scout'));assert(!s.queueTraining(b.id,'sniper'));
 advance(s,5);assert.equal(s.actors.length,0);assert(b.training.elapsed>4.9);
 advance(s,1.1);assert.equal(s.actors.length,1);assert.equal(s.actors[0].profileId,'scout');assert.equal(b.training,null);
 advance(s,30);assert.equal(s.actors.length,1);assert.equal(s.events.filter(e=>e.type==='training-complete').length,1);
 assert(s.queueTraining(b.id,'guardian'));s.reset();assert(s.buildings.every(b=>!b.training&&!b.readyNotice));
});
test('all four profiles preserve their distinctive stats and production bonuses accelerate training',()=>{
 for(const p of soldierProfiles){const s=make(),b=s.buildings[0];s.applyRunBonus('production',2);assert(s.queueTraining(b.id,p.id));advance(s,p.duration/2+.1);const a=s.actors[0];assert(a);for(const key of Object.keys(p.stats))assert.equal(a[key],p.stats[key]);}
 assert.equal(soldierProfiles.length,4);assert(soldierProfiles.find(p=>p.id==='guardian').stats.maxHp>7*soldierProfiles.find(p=>p.id==='sniper').stats.maxHp);
});
test('orders reserve population slots and reject unavailable houses',()=>{
 const s=make();s.cfg.actorLimit=1;assert(s.queueTraining(s.buildings[0].id,'scout'));assert(!s.queueTraining(s.buildings[1].id,'scout'));
 assert(!s.queueTraining(999,'scout'));assert(!s.queueTraining(s.buildings[1].id,'unknown'));
 s.buildings[0].hp=0;advance(s,7);assert.equal(s.actors.length,0);assert(!s.queueTraining(s.buildings[0].id,'scout'));
 s.ended=true;assert(!s.queueTraining(s.buildings[1].id,'scout'));
});
test('a full train still produces the selected soldier alongside a new wagon',()=>{
 const s=make();s.cfg.actorLimit=30;for(const w of s.wagons)for(let i=0;i<w.capacity;i++)s.spawnActor().wagonId=w.id;
 assert(s.queueTraining(s.buildings[0].id,'sniper'));advance(s,20.1);assert.equal(s.wagons.length,4);assert.equal(s.actors.at(-1).profileId,'sniper');
});
