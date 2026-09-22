const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const advance=(s,t)=>{for(let i=0;i<t/.02;i++)s.tick(.02);};
const make=()=>new Simulation({production:false,trainDamage:0,buildingCount:0,buildingPopInterval:0,ramDamage:0,ramSelfDamage:0});
test('enemy attacks at a floating-point range boundary instead of stalling',()=>{
 const s=make(),b=s.addBuilding();b.x=9;b.z=0;b.regen=0;
 const m=s.spawn('carapace',{speed:1,range:.9999999999999999,damage:10});m.x=8;m.z=0;
 s.tick(.02);assert.equal(b.hp,b.maxHp-10);
});
test('enemy abandons an empty interception point and attacks an actual house',()=>{
 const s=make();s.cfg.buildingPopInterval=0;s.train.hp=0;s.wagons=[];
 const b=s.addBuilding();b.x=9;b.z=0;b.regen=0;
 const a=s.spawnActor();a.speed=.01;a.damage=0;a.angle=Math.PI;a.radius=7.8;a.x=-7.8;a.z=0;
 const m=s.spawn('maw',{speed:2,range:.6,damage:10});m.x=7.8;m.z=0;
 advance(s,6);assert(b.hp<b.maxHp);assert.equal(m.targetId,b.id);
});
test('wagons of a destroyed locomotive are stationary targets, not future interceptions',()=>{
 const s=make();s.train.hp=0;const w=s.wagons[0];const m=s.spawn('maw',{speed:2,range:.5});m.x=-6.95;m.z=0;
 advance(s,10);assert(s.wagons.some(v=>v.hp<v.maxHp)||s.wagons.length<3);
});
test('destroying a committed building retargets an existing live building',()=>{
 const s=make();s.train.hp=0;s.wagons=[];const old=s.addBuilding(),next=s.addBuilding();old.x=8;old.z=0;next.x=9;next.z=0;next.regen=0;
 const m=s.spawn('maw',{speed:2,damage:20});m.siegeTargetId=old.id;m.x=7.8;m.z=0;s.damage(old,9999);
 advance(s,2);assert.equal(m.targetId,next.id);assert(next.hp<next.maxHp);assert.equal(old.hp,0);
});
test('without buildings or other living targets enemies never target unbuilt slots',()=>{
 const s=make();s.train.hp=0;s.wagons=[];const m=s.spawn('carapace');advance(s,3);assert.equal(m.targetId,null);const b=s.addBuilding();b.regen=0;b.hp=b.maxHp=10000;advance(s,35);assert.equal(m.targetId,b.id);assert(b.hp<b.maxHp);
});
