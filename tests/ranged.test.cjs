const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation,types}=require('../dist/sim.js');
const Stats=require('../dist/stats-settings.js');
const {validateLibrary,seed}=require('../dist/waves.js');
const clone=x=>JSON.parse(JSON.stringify(x));

for(const type of Object.keys(types))test(type+' attacks a distant building without approaching contact',()=>{
 const s=new Simulation({production:false,buildingCount:0,buildingPopInterval:0});
 s.train.hp=0;s.wagons=[];
 const b=s.addBuilding();b.x=9;b.z=0;b.regen=0;
 const m=s.spawn(type);m.x=9-m.range+.1;m.z=0;
 const start=m.x;s.events=[];s.tick(.02);
 assert(m.range>=3);assert.equal(m.x,start);assert(b.hp<b.maxHp);
 const shot=s.events.find(e=>e.type==='shot'&&e.hostile);
 assert(shot);assert(Math.hypot(shot.to.x-shot.from.x,shot.to.z-shot.from.z)>2);
});

test('legacy saved ranges migrate but custom and current ranges survive roundtrip',()=>{
 const data=clone(require('../dist/stats-defaults.json'));delete data.combatVersion;
 data.monsters.carapace.range=1;data.monsters.maw.range=2.7;
 const migrated=Stats.validate(data);
 assert.equal(migrated.monsters.carapace.range,4);assert.equal(migrated.monsters.maw.range,2.7);
 migrated.monsters.carapace.range=1;
 assert.equal(Stats.validate(migrated).monsters.carapace.range,1);
 const lib=clone(seed);delete lib.combatVersion;
 lib.waves[0].groups[0].type='carapace';lib.waves[0].groups[0].stats={range:1};
 const upgraded=validateLibrary(lib,types);
 assert.equal(upgraded.waves[0].groups[0].stats.range,4);
 upgraded.waves[0].groups[0].stats.range=1;
 assert.equal(validateLibrary(upgraded,types).waves[0].groups[0].stats.range,1);
});
