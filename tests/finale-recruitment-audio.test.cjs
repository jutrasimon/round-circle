const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Simulation}=require('../dist/sim.js');
const {recruitmentState,progress}=require('../dist/production-panel.js');
const {audioSettings}=require('../dist/audio.js');
const {describe}=require('../dist/finale.js');
test('old loud preferences migrate to ten percent, quieter and new choices survive',()=>{
 assert.equal(audioSettings().music,.1);assert.equal(audioSettings().effects,.1);
 const migrated=audioSettings({volumeVersion:3,music:.46,effects:.56});assert.equal(migrated.music,.1);assert.equal(migrated.effects,.1);
 const quiet=audioSettings({volumeVersion:3,music:0,effects:.03,enabled:false});assert.equal(quiet.music,0);assert.equal(quiet.effects,.03);assert.equal(quiet.enabled,false);
 assert.equal(audioSettings({volumeVersion:4,music:.7}).music,.7);
});
test('reserved recruitment slots explain full state and a casualty reopens it',()=>{
 const sim=new Simulation({actorLimit:2,buildingCount:2});sim.spawnActor();assert(sim.queueTraining(sim.buildings[0].id,'scout'));
 assert.deepEqual([recruitmentState(sim).total,recruitmentState(sim).reserved,recruitmentState(sim).full],[1,1,true]);
 assert(progress(sim).some(r=>r.detail.includes('Recruitment full')));
 assert.equal(sim.queueTraining(sim.buildings[1].id,'scout'),false);
 sim.damage(sim.actors[0],999);assert.equal(recruitmentState(sim).full,false);assert(sim.queueTraining(sim.buildings[1].id,'scout'));
});
test('ending announcements distinguish mechanical causes from the peaceful resolution',()=>{
 assert.match(describe('defeat','defeat',4).cause,/0 HP/);
 assert.match(describe('defeat','defeat',4).eyebrow,/WAVE 4/);
 assert.match(describe('radius','departure',10).title,/MADE IT THROUGH/);
 assert.match(describe('radius','harmony',10).title,/OPENS/);
});
test('cinematic animates real Babylon nodes, preserves simulation state and restores camera on completion/reset',()=>{
 const B=require('../dist/babylon.js'),engine=new B.NullEngine(),scene=new B.Scene(engine);
 const {create}=require('../dist/finale.js');
 const element=()=>({hidden:false,style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(){},append(){},addEventListener(){},focus(){}});
 const oldDocument=global.document;global.document={createElement:element,body:element(),querySelector:()=>null};
 try{
  const camera=new B.ArcRotateCamera('test',0,.7,29,B.Vector3.Zero(),scene);camera.attachControl=()=>{};camera.detachControl=()=>{};
  const sim=new Simulation({buildingCount:1,production:false}),renderers=new Map(sim.all().map(e=>[e.id,{root:new B.TransformNode('entity-'+e.id,scene)}]));
  const vortexFx={radius:6,update(t,r){this.radius=r;}};const finale=create({B,scene,camera,sim,renderers,vortexFx});
  sim.damage(sim.train,9999);const report=sim.finishRun(),saved=JSON.stringify(report);let callbacks=0;
  finale.start({reason:'defeat',outcome:'defeat',wave:4,onComplete:()=>callbacks++});finale.frame(2);
  assert(finale.active);assert(camera.radius<29);assert(scene.meshes.filter(m=>m.name==='finale-debris').length===24);assert.equal(sim.time,0);
  finale.frame(6);assert(!finale.active);assert.equal(callbacks,1);assert.equal(camera.radius,29);assert.equal(scene.meshes.filter(m=>m.name==='finale-debris').length,0);assert.equal(JSON.stringify(report),saved);
  finale.start({reason:'radius',outcome:'departure',wave:10,onComplete:()=>callbacks++});finale.frame(4);assert(vortexFx.radius>6);assert(renderers.get(sim.buildings[0].id).root.scaling.x<1);finale.reset();assert.equal(callbacks,1);assert(!finale.active);
  finale.start({reason:'radius',outcome:'harmony',wave:10,onComplete:()=>callbacks++});finale.frame(4);assert(vortexFx.radius<6);finale.frame(4);assert.equal(callbacks,2);
 }finally{global.document=oldDocument;scene.dispose();engine.dispose();}
});
