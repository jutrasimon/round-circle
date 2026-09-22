const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const {WaveRunner,seed}=require('../dist/waves.js');
test('final result is a stable snapshot and simulation and waves stop until reset',()=>{
 const s=new Simulation({production:false}),runner=new WaveRunner(s);runner.startVortex(structuredClone(seed));s.tick(.1);runner.tick();
 s.cfg.vortexRadius=6;const result=s.finishRun({artifacts:[]}),time=s.time,angle=s.angle;
 s.tick(.25);runner.tick();assert.equal(s.time,time);assert.equal(s.angle,angle);assert.equal(s.finishRun(),result);
 s.metrics.distance=9999;assert.notEqual(result.metrics.distance,9999);
 s.reset();assert.equal(s.ended,false);assert.equal(s.result,null);assert.equal(s.metrics.created.wagon,3);assert.equal(s.metrics.distance,0);
});
test('combat metrics count actual HP loss and deaths once, including destroyed wagons',()=>{
 const s=new Simulation({production:false});const enemy=s.spawn('maw',{hp:10});s.damage(enemy,1000);s.damage(enemy,1000);
 assert.equal(s.metrics.damage.monster,10);assert.equal(s.metrics.lost.monster,1);assert.equal(s.metrics.killsByType.maw,1);
 const w=s.wagons[0];s.damage(w,9999);assert.equal(s.metrics.damage.wagon,100);assert.equal(s.metrics.lost.wagon,1);
 const result=s.finishRun();assert.equal(result.wagons,2);assert.equal(result.metrics.created.wagon,3);
});
test('regeneration measures recovered HP, while full buildings add none',()=>{
 const s=new Simulation({production:false,buildingCount:1,buildingRegen:10,trainDamage:0});const b=s.buildings[0];b.hp=b.maxHp-1;s.tick(.25);
 assert(Math.abs(s.metrics.regenerated-1)<1e-8);s.tick(.25);assert(Math.abs(s.metrics.regenerated-1)<1e-8);
});
