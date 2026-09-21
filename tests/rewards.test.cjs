const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation,profileStats}=require('../dist/sim.js');
const {WaveRunner}=require('../dist/waves.js');
const {Rewards,seed,validate}=require('../dist/rewards.js');
const make=()=>new Simulation({production:false,trainDamage:0,trainRange:0,buildingCount:1});
const wave=(id='a',count=1)=>({id,name:id,groups:[{type:'maw',count,delay:0,interval:1,stats:{hp:10,damage:0}}]});
test('HP bonuses stack for living and future units without healing ruins or modifying defaults',()=>{
 const s=make(),a=s.spawnActor(),base=a.maxHp;s.damage(a,10);const cfg=JSON.stringify(s.cfg);
 s.applyRunBonus('actorHp',2);s.applyRunBonus('actorHp',2);assert.equal(a.maxHp,base*4);assert.equal(a.hp,(base-10)*4);assert.equal(s.spawnActor().maxHp,base*4);
 assert.equal(s.spawnActor(s.buildings[0]).maxHp,profileStats(s.profile).maxHp*4);
 const b=s.buildings[0];s.damage(b,9999);s.applyRunBonus('buildingHp',3);assert.equal(b.hp,0);assert.equal(s.addBuilding().maxHp,s.cfg.buildingHp*3);
 s.applyRunBonus('trainHp',2);assert.equal(s.addWagon().maxHp,s.cfg.wagonHp*2);assert.equal(JSON.stringify(s.cfg),cfg);
 s.reset();assert.equal(s.train.maxHp,s.cfg.trainHp);assert.equal(s.spawnActor().maxHp,base);assert.deepEqual(s.bonuses,{});
});
test('combat uses damage, range, cadence, ram, production and regeneration modifiers',()=>{
 const s=make(),a=s.spawnActor(),m=s.spawn('maw',{hp:10000,armor:0});s.applyRunBonus('actorDamage',2);s.applyRunBonus('actorRate',2);s.applyRunBonus('actorRange',1.5);
 s.fire(a,m);assert.equal(m.hp,10000-a.damage*2);assert.equal(a.timer,a.cooldown/2);assert.equal(s.attackRange(a),a.range*1.5);
 s.train.damage=7;s.applyRunBonus('trainDamage',3);const before=m.hp;s.fire(s.train,m);assert.equal(m.hp,before-21);
 s.cfg.production=true;const b=s.buildings[0];b.spawnRate=30;b.spawnProgress=0;b.hp=10;b.regen=1;s.applyRunBonus('production',2);s.applyRunBonus('regen',3);s.tick(.1);assert(Math.abs(b.spawnProgress-.1)<1e-9);assert(Math.abs(b.hp-10.3)<1e-8);
 const r=make();r.wagons=[];r.train.speed=60;const enemy=r.spawn('maw',{hp:10000,damage:0,speed:0,size:.2});enemy.x=Math.cos(.08)*6.95;enemy.z=Math.sin(.08)*6.95;r.applyRunBonus('ram',3);r.tick(.02);assert.equal(enemy.hp,10000-60*r.cfg.ramDamage*3);
});
test('three distinct choices, snapshot, queue and stale clicks',()=>{
 const s=make(),r=new Rewards(s,{random:()=>0});assert(r.offer({id:'one',name:'One'}));assert(!r.offer({id:'one'}));assert.equal(new Set(r.pending.choices.map(b=>b.id)).size,3);
 const revision=r.revision,id=r.pending.choices[0].id;r.catalog[0].factor=3;r.offer({id:'two',name:'Two'});assert(!r.choose(id,revision));const rev=r.revision;assert(r.choose(id,rev));assert.equal(s.multiplier('actorDamage'),2);assert(!r.choose(id,rev));assert.equal(r.artifacts.length,1);assert(r.pending);
 s.reset();assert(!r.choose(r.pending.choices[0].id,r.revision));assert.equal(r.pending,null);assert.equal(r.artifacts.length,0);
});
test('playlist waits for deaths and delayed spawns, then blocks the next wave until reward selected',()=>{
 const s=make(),runner=new WaveRunner(s),rewards=new Rewards(s,{random:()=>0});runner.onWaveComplete=e=>rewards.offer(e);runner.isBlocked=()=>!!rewards.pending;
 runner.start({version:1,waves:[wave('a',2),wave('b')],playlist:[{waveId:'a',mode:'clear',gap:0},{waveId:'b',mode:'clear',gap:0}]});runner.tick();s.damage(s.monsters[0],999);runner.tick();assert.equal(rewards.pending,null);
 s.time=1;runner.tick();assert.equal(rewards.pending,null);s.damage(s.monsters[1],999);runner.tick();assert(rewards.pending);assert.equal(runner.index,0);
 runner.tick();assert.equal(rewards.queue.length,1);rewards.choose(rewards.pending.choices[0].id,rewards.revision);runner.tick();runner.tick();assert.equal(runner.index,1);
 s.damage(s.monsters[2],999);runner.tick();assert(rewards.pending);rewards.choose(rewards.pending.choices[0].id,rewards.revision);runner.tick();assert.equal(runner.state,'Playlist terminée');
});
test('manual and vortex waves each complete exactly once, including cap deferral',()=>{
 for(const mode of ['manual','vortex']){const s=make(),r=new WaveRunner(s),events=[];s.cfg.monsterLimit=1;r.onWaveComplete=e=>events.push(e);
 if(mode==='manual')r.runWave(wave('a',2));else r.startVortex({version:1,waves:[wave('a',2)],playlist:[],vortex:{rate:0,startRadius:1,triggers:[{waveId:'a',radius:1}]}});
 r.tick();s.time=3;r.tick();assert.equal(events.length,0);s.damage(s.monsters[0],999);r.tick();assert.equal(events.length,0);s.damage(s.monsters[1],999);r.tick();r.tick();assert.equal(events.length,1);
 s.reset();r.tick();assert.equal(events.length,1);assert.equal(r.records.length,0);}
});
test('time mode may overlap waves but cannot reward surviving monsters',()=>{
 const s=make(),r=new WaveRunner(s),events=[];r.onWaveComplete=e=>events.push(e);r.start({version:1,waves:[wave()],playlist:[{waveId:'a',mode:'time',gap:0},{waveId:'a',mode:'time',gap:0}]});r.tick();r.tick();assert.equal(events.length,0);s.monsters.forEach(m=>s.damage(m,999));r.tick();assert.equal(events.length,2);assert.notEqual(events[0].id,events[1].id);
});
test('catalog rejects non-finite, weak, unknown and duplicate definitions',()=>{for(const change of [b=>b.factor=Infinity,b=>b.factor=1.08,b=>b.effect='unknown',b=>b.name='',b=>b.id=seed[1].id]){const data=structuredClone(seed);change(data[0]);assert.throws(()=>validate(data));}});
