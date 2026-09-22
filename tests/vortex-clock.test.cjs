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
 for(let i=0;i<40;i++){s.tick(.25);r.tick();}assert(Math.abs(remaining()-950)<1e-6);
 r.isBlocked=()=>true;const before=remaining();s.tick(.25);r.tick();assert.equal(remaining(),before);
 r.setGrowthRate(.6);assert(Math.abs(remaining()-475)<1e-6);
 r.startVortex(structuredClone(seed));assert.equal(formatRemaining(remaining()),'16:00');
});
