(function(root){
'use strict';
function describe(reason,outcome,wave){
 const defeat=reason==='defeat',harmony=outcome==='harmony';
 return {title:defeat?'THE CONVOY IS LOST':harmony?'THE CIRCLE OPENS':outcome==='force'?'YOU HELD THE LINE':'YOU MADE IT THROUGH',
  cause:defeat?'The locomotive reached 0 HP. The convoy can go no further.':harmony?'The vortex reached its limit. Your three invitations and a surviving home turn the ending into a shared beginning.':'Five minutes survived. '+(outcome==='force'?'Final wave defeated. ':'')+'The vortex takes the city, but your convoy endured.',
  eyebrow:'END OF THE JOURNEY · WAVE '+wave};
}
function create({B,scene,camera,sim,renderers,vortexFx}){
 const overlay=document.createElement('section');overlay.className='finale';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','End of the journey');
 const eyebrow=document.createElement('p'),title=document.createElement('h1'),cause=document.createElement('p'),skip=document.createElement('button');cause.className='finale-cause';skip.textContent='View run report →';overlay.append(eyebrow,title,cause,skip);document.body.append(overlay);
 let state=null;const debris=[];
 const material=new B.StandardMaterial('finale-fragments',scene);material.diffuseColor=B.Color3.FromHexString('#ffbd91');material.emissiveColor=B.Color3.FromHexString('#ca705e');
 function clean(){for(const mesh of debris)mesh.dispose();debris.length=0;if(state){camera.alpha=state.camera.alpha;camera.beta=state.camera.beta;camera.radius=state.camera.radius;camera.setTarget(state.camera.target);camera.attachControl(document.querySelector('#world'),true);}state=null;overlay.hidden=true;document.body.classList.remove('ending-cinematic');}
 function complete(){if(!state)return;const done=state.done;clean();done();}
 skip.onclick=complete;
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();complete();}if(e.key==='Tab'){e.preventDefault();skip.focus();}});
 function start({reason,outcome,wave,onComplete}){
  clean();const words=describe(reason,outcome,wave);eyebrow.textContent=words.eyebrow;title.textContent=words.title;cause.textContent=words.cause;
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  state={reason,outcome,time:0,duration:reduced?2.5:7,reduced,done:onComplete,camera:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius,target:camera.target.clone()},target:reason==='defeat'?new B.Vector3(sim.train.x,.5,sim.train.z):B.Vector3.Zero()};
  camera.detachControl();camera.inertialAlphaOffset=camera.inertialBetaOffset=camera.inertialRadiusOffset=0;overlay.hidden=false;document.body.classList.add('ending-cinematic');overlay.style.setProperty('--ending-progress',0);skip.focus();
  if(reason==='defeat'&&!reduced)for(let i=0;i<24;i++){const mesh=B.MeshBuilder.CreateBox('finale-debris',{size:.13+(i%4)*.045},scene);mesh.material=material;mesh.isPickable=false;debris.push(mesh);}
 }
 function frame(dt){if(!state)return;state.time+=dt;const t=state.time,p=Math.min(1,t/state.duration),ease=1-Math.pow(1-Math.min(1,t/2.4),3);overlay.style.setProperty('--ending-progress',p);
  if(!state.reduced){camera.setTarget(B.Vector3.Lerp(state.camera.target,state.target,ease*.82));camera.radius=state.camera.radius+(state.reason==='defeat'?12-state.camera.radius:19-state.camera.radius)*ease;camera.beta=state.camera.beta+(.78-state.camera.beta)*ease;camera.alpha=state.camera.alpha+Math.min(t,5)*.035;
   if(state.reason==='defeat'){
    const train=renderers.get(sim.train.id)?.root;if(train){train.setEnabled(t<1.3);train.scaling.setAll(1);train.rotation.z=Math.min(t,1.3)*.24;}
    // Easing stretches the explosion across several seconds, independent of game speed.
    const slow=Math.max(0,t-.7)*.28;debris.forEach((mesh,i)=>{const a=i*2.39996,force=1.5+(i%5)*.42;mesh.setEnabled(t>=.7);mesh.position.set(sim.train.x+Math.cos(a)*force*slow,.4+(2+i%3)*slow-1.3*slow*slow,sim.train.z+Math.sin(a)*force*slow);mesh.rotation.set(slow*(i%3),slow*2,slow);mesh.scaling.setAll(Math.max(0,1-Math.max(0,t-4)/2));});
   }else{
    const closing=Math.max(0,Math.min(1,(t-1.3)/4.5)),harmonious=state.outcome==='harmony';
    vortexFx.update(sim.time+t*.18,harmonious?6*(1-closing*.94):6+closing*7,dt*.18,false,true);
    if(!harmonious)for(const e of sim.all()){const node=renderers.get(e.id)?.root;if(!node||e.hp<=0)continue;const q=Math.pow(closing,1.7),a=q*1.5;node.position.set((e.x*Math.cos(a)-e.z*Math.sin(a))*(1-q),.11-q*2,(e.x*Math.sin(a)+e.z*Math.cos(a))*(1-q));node.scaling.setAll(Math.max(.015,1-q));node.rotation.y+=q*3;}
   }
  }
  if(t>=state.duration)complete();
 }
 return {start,frame,reset:clean,get active(){return !!state;}};
}
root.RoundCircleFinale={describe,create};if(typeof module!=='undefined')module.exports=root.RoundCircleFinale;
})(typeof window!=='undefined'?window:globalThis);
