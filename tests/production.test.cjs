const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const make=()=>{const s=new Simulation({buildingCount:1,production:true,manualProduction:false,buildingPopInterval:0});s.buildings[0].spawnRate=60;s.buildings[0].spawnProgress=0;return s;};
const fill=s=>{for(const w of s.wagons)while(s.passengers(w).length<w.capacity){const a=s.spawnActor();a.wagonId=w.id;}};
test('full train consumes one house production for one wagon, then resumes soldiers',()=>{
 const s=make(),b=s.buildings[0];fill(s);b.spawnProgress=.99;s.tick(.02);
 assert.equal(s.wagons.length,4);assert.equal(s.actors.length,12);assert.equal(b.spawnProgress,0);
 assert.equal(s.events.filter(e=>e.type==='wagon-born').length,1);
 b.spawnProgress=.99;s.tick(.02);assert.equal(s.wagons.length,4);assert.equal(s.actors.length,13);
});
test('simultaneous ready houses create only one wagon while it has free seats',()=>{
 const s=make();fill(s);const second=s.addBuilding();second.spawnRate=60;
 for(const b of s.buildings)b.spawnProgress=1;
 s.tick(.02);assert.equal(s.wagons.length,4);assert.equal(s.actors.length,13);
});
test('population reports live soldiers and actual wagon capacities after removal',()=>{
 const s=make();fill(s);s.capacity(s.wagons[0],2);s.spawnActor();
 assert.deepEqual(s.population(),{aboard:10,walking:3,total:13,limit:160,seats:10});
 s.damage(s.wagons[0],9999);assert.equal(s.population().seats,8);assert.equal(s.population().walking,5);
 s.damage(s.actors[0],9999);assert.equal(s.population().total,12);
});
test('production respects disabled mode, destroyed houses and wagon maximum',()=>{
 const s=make(),b=s.buildings[0];fill(s);b.spawnProgress=1;s.cfg.production=false;s.tick(.02);assert.equal(s.wagons.length,3);
 s.cfg.production=true;s.damage(b,9999);s.tick(.02);assert.equal(s.wagons.length,3);
 const t=make();while(t.wagons.length<16)t.addWagon();fill(t);t.buildings[0].spawnProgress=1;t.tick(.02);
 assert.equal(t.wagons.length,16);assert.equal(t.actors.length,65);
});
test('wagon production retains bonuses and can restore a train with no wagons',()=>{
 const s=make();while(s.wagons.length)s.removeWagon();s.applyRunBonus('trainHp',2);
 s.buildings[0].spawnProgress=.99;s.tick(.02);assert.equal(s.wagons.length,1);assert.equal(s.wagons[0].maxHp,200);
});
test('soldier limit preserves ready production and does not prevent wagon production',()=>{
 const s=make(),b=s.buildings[0];fill(s);s.cfg.actorLimit=12;b.spawnProgress=1;s.tick(.02);
 assert.equal(s.wagons.length,4);b.spawnProgress=1;s.tick(.02);assert.equal(b.spawnProgress,1);assert.equal(s.actors.length,12);
});
