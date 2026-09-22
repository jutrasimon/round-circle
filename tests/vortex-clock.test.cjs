const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation,types}=require('../dist/sim.js');
const {WaveRunner,seed,vortexRemaining,formatRemaining}=require('../dist/waves.js');
test('clock represents time to maximum radius in minutes and seconds',()=>{
 assert.equal(formatRemaining(vortexRemaining(1.2,.3)),'16:00');
 assert.equal(formatRemaining(vortexRemaining(3,.3)),'10:00');
 assert.equal(formatRemaining(vortexRemaining(3,.6)),'05:00');
 assert.equal(formatRemaining(vortexRemaining(6,0)),'00:00');
 assert.equal(formatRemaining(vortexRemaining(7,.3)),'00:00');
 assert.equal(formatRemaining(vortexRemaining(1,0)),'∞');
 assert.equal(formatRemaining(60.000000001),'01:00');
});
test('clock follows simulated growth, rate changes, blocked rewards and restart',()=>{
 const s=new Simulation({production:false,buildingCount:0,buildingPopInterval:0}),r=new WaveRunner(s);
 r.startVortex(structuredClone(seed));const remaining=()=>vortexRemaining(s.cfg.vortexRadius,r.vortexPlan.rate);
 for(let i=0;i<40;i++){s.tick(.25);r.tick();}assert(Math.abs(remaining()-290)<1e-6);
 r.isBlocked=()=>true;const before=remaining();s.tick(.25);r.tick();assert.equal(remaining(),before);
 r.setGrowthRate(.6);assert(Math.abs(remaining()-464)<1e-6);
 r.startVortex(structuredClone(seed));assert.equal(formatRemaining(remaining()),'05:00');
});

test('five-minute defaults migrate legacy growth once while preserving custom rates',()=>{
 const {validate}=require('../dist/stats-settings.js');const data=structuredClone(require('../dist/stats-defaults.json'));
 assert.equal(formatRemaining(vortexRemaining(data.vortex.startRadius,data.vortex.rate)),'05:00');
 delete data.durationVersion;data.vortex.rate=.3;assert.equal(validate(data).vortex.rate,.96);
 data.durationVersion=1;assert.equal(validate(data).vortex.rate,.3);
 delete data.durationVersion;data.vortex.rate=.7;assert.equal(validate(data).vortex.rate,.7);
 const s=new Simulation({production:false,buildingCount:0,buildingPopInterval:0}),r=new WaveRunner(s);r.startVortex(structuredClone(seed));
 for(let i=0;i<1200;i++){s.tick(.25);r.tick();}assert(Math.abs(s.cfg.vortexRadius-6)<1e-8);assert.equal(formatRemaining(vortexRemaining(s.cfg.vortexRadius,r.vortexPlan.rate)),'00:00');
});
