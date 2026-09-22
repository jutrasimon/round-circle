const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const {seed,migrateCatalog}=require('../dist/rewards.js');
const Stats=require('../dist/stats-settings.js');
test('base speed collisions cost two HP once per contact; faster impacts scale wear',()=>{
 for(const speed of [1,1.4,5,30,60]){
  const s=new Simulation({production:false,buildingCount:0,trainDamage:0,trainSpeed:speed});s.wagons=[];
  const m=s.spawn('brute',{hp:10000,damage:0,speed:0});m.x=6.95;m.z=0;
  s.tick(.02);assert.equal(m.hp,10000-speed*6);assert(Math.abs(s.train.hp-(200-Math.max(5,speed)*.4))<1e-8);
  s.tick(.02);assert.equal(s.collisions,1);
 }
 const s=new Simulation({ramSelfDamage:0});assert.equal(s.ramWear(1.4),0);assert.equal(s.ramWear(0),0);
});
test('default reward gains are halved and legacy catalogs migrate without mutating inputs',()=>{
 const old=seed.map(b=>({...b,factor:1+(b.factor-1)*2}));
 const snapshot=JSON.stringify(old);assert.deepEqual(migrateCatalog(old),seed);assert.equal(JSON.stringify(old),snapshot);
 assert.equal(seed.find(b=>b.id==='giants').factor,1.5);assert.equal(seed.find(b=>b.id==='horizon').factor,1.25);assert.equal(seed.find(b=>b.id==='ram').factor,2);
});
test('legacy wear defaults migrate while custom and new saved values remain intact',()=>{
 const data=structuredClone(require('../dist/stats-defaults.json'));delete data.balanceVersion;data.simulation.ramSelfDamage=.04;
 assert.equal(Stats.validate(data).simulation.ramSelfDamage,.4);
 data.simulation.ramSelfDamage=.1;assert.equal(Stats.validate(data).simulation.ramSelfDamage,.1);
 data.balanceVersion=1;data.simulation.ramSelfDamage=.04;assert.equal(Stats.validate(data).simulation.ramSelfDamage,.04);
});
