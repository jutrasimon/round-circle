const {test}=require('node:test'),assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const make=()=>new Simulation({buildingCount:0,buildingPopInterval:0,trainDamage:0,ramDamage:0,production:false});
test('a nearby Guardian reduces hostile fire by 40 percent without stacking or self protection',()=>{
 const s=make(),target=s.train;target.x=0;target.z=0;
 const guard=s.spawnActor(null,{maxHp:220,guardRadius:3});guard.x=1;guard.z=0;
 const m=s.spawn('crawler',{damage:20});let before=target.hp;s.fire(m,target);assert.equal(before-target.hp,12);
 const second=s.spawnActor(null,{maxHp:220,guardRadius:3});second.x=2;second.z=0;before=target.hp;s.fire(m,target);assert.equal(before-target.hp,12);
 second.hp=0;assert.equal(s.guardedDamage(guard,20),20);
 guard.x=4;assert.equal(s.guardedDamage(target,20),20);
});
test('Scout marks amplify other profiles, expire, and Watcher shots pierce armour',()=>{
 const s=make(),m=s.spawn('carapace',{hp:1000});m.armor=.4;
 const scout=s.spawnActor(null,{profileId:"scout",maxHp:65,damage:10,markDuration:3,cooldown:1});
 const watcher=s.spawnActor(null,{profileId:"sniper",maxHp:28,damage:40,armorPiercing:1,cooldown:4});
 s.fire(scout,m);assert(Math.abs(m.hp-995.2)<1e-8);s.fire(scout,m);assert(Math.abs(m.hp-990.4)<1e-8);
 s.fire(watcher,m);assert(Math.abs(m.hp-936.4)<1e-8);s.time=4;s.fire(watcher,m);assert(Math.abs(m.hp-896.4)<1e-8);
});
test('a Watcher cannot acquire unmarked fast targets or enemies inside its dead zone',()=>{
 const s=make();s.train.hp=0;s.wagons=[];
 const w=s.spawnActor(null,{maxHp:28,damage:40,speed:0,range:8,minRange:3,maxTargetSpeed:1.3,cooldown:4});w.radius=7.8;w.angle=0;w.x=7.8;w.z=0;
 const m=s.spawn('runner',{hp:100,damage:0,speed:1.8});m.x=3;m.z=0;
 s.tick(.02);assert.equal(m.hp,100);
 m.markUntil=s.time+3;m.markSource=999;s.tick(.02);assert.equal(m.hp,46);
 w.timer=0;m.x=7;m.z=0;s.tick(.02);assert.equal(m.hp,46);
});

test('Scouts cannot amplify one another with their marks',()=>{
 const s=make(),m=s.spawn('crawler',{hp:1000});m.armor=0;
 const a=s.spawnActor(null,{profileId:'scout',maxHp:65,damage:10,markDuration:3});
 const b=s.spawnActor(null,{profileId:'scout',maxHp:65,damage:10,markDuration:3});
 s.fire(a,m);s.fire(b,m);assert.equal(m.hp,980);
});

test('convoy upgrades add base bonuses instead of compounding, with matching previews',()=>{
 const s=make();const hp=s.train.maxHp;
 s.applyRunBonus('trainHp',1.5);assert.equal(s.previewBonus('trainHp',1.5),2);s.applyRunBonus('trainHp',1.5);assert.equal(s.train.maxHp,hp*2);
 for(const key of ['trainDamage','ram']){s.applyRunBonus(key,3);s.applyRunBonus(key,3);assert.equal(s.multiplier(key),5);}
 const {bonusLabel}=require('../dist/sim.js');assert.equal(bonusLabel('trainHp',1.5),'+50% base');assert.equal(bonusLabel('actorDamage',1.2),'×1.2');
});

test('precision damage needs a spotter mark when configured',()=>{
 const s=make(),m=s.spawn('crawler',{hp:1000});m.armor=0;
 const w=s.spawnActor(null,{profileId:'sniper',maxHp:28,damage:32,unmarkedDamage:.5});s.fire(w,m);assert.equal(m.hp,984);
 m.markUntil=3;m.markProfile='scout';m.markSource=999;s.fire(w,m);assert(Math.abs(m.hp-940.8)<1e-8);
});
