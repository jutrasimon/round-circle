const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const B=require('../dist/babylon.js');
const {types}=require('../dist/sim.js');
const window={};
vm.runInNewContext(fs.readFileSync('dist/enemies.js','utf8'),{window});
for(const [type,stats] of Object.entries(types))test(type+' renders with compatible merged vertex attributes',()=>{
 const engine=new B.NullEngine();
 const scene=new B.Scene(engine);
 try {
  new B.FreeCamera('camera',new B.Vector3(0,5,-10),scene);
  const parent=new B.TransformNode('monster',scene);
  const materials=Object.fromEntries(['body','trim','dark','light','skin','metal'].map(key=>[key,new B.StandardMaterial(key,scene)]));
  const result=window.buildRoundCircleMonster(B,scene,parent,{...stats,type},materials);
  assert.equal(result.form.parent,parent);
  assert(parent.getChildMeshes().length>0);
  for(const mesh of parent.getChildMeshes())assert(mesh.getTotalVertices()>0);
  if(type==='carapace')assert(parent.getChildMeshes().some(mesh=>mesh.isVerticesDataPresent(B.VertexBuffer.ColorKind)),'preserve shell vertex colours');
  assert.doesNotThrow(()=>scene.render());
 } finally {scene.dispose();engine.dispose();}
});
