(function(root){
'use strict';
const defaults={trainHp:200,trainDamage:12,trainSpeed:1.4,trainRange:6,trainCooldown:1.1,wagonHp:100,capacity:4,actorHp:35,actorDamage:7,actorSpeed:2.8,actorRange:5,actorCooldown:.8,buildingHp:160,vortexRadius:1.2};
const types={crawler:{name:'Rampant',hp:35,damage:5,speed:.8,range:.9,cooldown:1.2,size:.55},runner:{name:'Sprinteur',hp:18,damage:3,speed:1.8,range:.8,cooldown:.7,size:.38},brute:{name:'Colosse',hp:150,damage:16,speed:.42,range:1.3,cooldown:1.8,size:1}};
class Simulation{
 constructor(cfg={}){this.cfg={...defaults,...cfg};this.nextId=1;this.events=[];this.reset();}
 entity(kind,name,stats){return {id:this.nextId++,kind,name,hp:stats.maxHp,maxHp:stats.maxHp,damage:0,speed:0,range:0,cooldown:1,timer:0,x:0,z:0,angle:0,...stats};}
 reset(){this.events=[];this.time=0;this.angle=0;this.kills=0;this.train=this.entity('train','Locomotive',{maxHp:this.cfg.trainHp,damage:this.cfg.trainDamage,speed:this.cfg.trainSpeed,range:this.cfg.trainRange,cooldown:this.cfg.trainCooldown});this.wagons=[];this.actors=[];this.monsters=[];this.buildings=Array.from({length:12},(_,i)=>this.entity('building','Bâtiment '+(i+1),{maxHp:this.cfg.buildingHp,angle:i/12*Math.PI*2+.3,x:Math.cos(i/12*Math.PI*2+.3)*9,z:Math.sin(i/12*Math.PI*2+.3)*9}));for(let i=0;i<3;i++)this.addWagon();this.positionTrain();}
 all(){return [this.train,...this.wagons,...this.actors,...this.monsters,...this.buildings];}
 get(id){return this.all().find(e=>e.id===id);}
 living(){return [this.train,...this.wagons,...this.actors,...this.buildings].filter(e=>e.hp>0);}
 addWagon(){if(this.wagons.length>=16)return null;const w=this.entity('wagon','Wagon '+this.nextId,{maxHp:this.cfg.wagonHp,capacity:this.cfg.capacity});this.wagons.push(w);this.positionTrain();return w;}
 passengers(w){return this.actors.filter(a=>a.hp>0&&a.wagonId===w.id);}
 disembark(a,w){a.wagonId=null;a.angle=w.angle;a.x=Math.cos(a.angle)*7.8;a.z=Math.sin(a.angle)*7.8;}
 removeWagon(id){let i=id===undefined?this.wagons.length-1:this.wagons.findIndex(w=>w.id===id);if(i<0)return;let w=this.wagons[i];this.passengers(w).forEach(a=>this.disembark(a,w));this.wagons.splice(i,1);this.positionTrain();}
 capacity(w,n){w.capacity=Math.max(0,Math.min(12,Math.floor(n)));this.passengers(w).slice(w.capacity).forEach(a=>this.disembark(a,w));}
 spawnActor(){if(this.actors.filter(a=>a.hp>0).length>=100)return null;let a=this.entity('actor','Attaquant '+this.nextId,{maxHp:this.cfg.actorHp,damage:this.cfg.actorDamage,speed:this.cfg.actorSpeed,range:this.cfg.actorRange,cooldown:this.cfg.actorCooldown,wagonId:null,angle:this.angle-.4});a.x=Math.cos(a.angle)*7.8;a.z=Math.sin(a.angle)*7.8;this.actors.push(a);return a;}
 spawn(type,overrides={}){if(this.monsters.filter(a=>a.hp>0).length>=100)return null;let spec={...types[type],...overrides};let a=(this.nextId*2.399963)% (Math.PI*2),r=this.cfg.vortexRadius*.55;let m=this.entity('monster',spec.name+' '+this.nextId,{...spec,type,maxHp:spec.hp,angle:a,x:Math.cos(a)*r,z:Math.sin(a)*r});this.monsters.push(m);this.events.push({type:'spawn',id:m.id,x:m.x,z:m.z});return m;}
 positionTrain(){[this.train,...this.wagons].forEach((w,i)=>{w.angle=this.angle-i*.22;w.x=Math.cos(w.angle)*6.95;w.z=Math.sin(w.angle)*6.95;});this.actors.filter(a=>a.wagonId).forEach(a=>{let w=this.wagons.find(w=>w.id===a.wagonId);if(w){a.x=w.x;a.z=w.z;a.angle=w.angle;}});}
 damage(target,n){if(target.hp<=0)return;target.hp=Math.max(0,target.hp-n);this.events.push({type:'hit',id:target.id,x:target.x,z:target.z,amount:n});if(target.hp===0){this.events.push({type:'death',id:target.id,x:target.x,z:target.z});if(target.kind==='monster')this.kills++;if(target.kind==='wagon')this.removeWagon(target.id);}}
 fire(source,target){this.events.push({type:'shot',from:{x:source.x,z:source.z},to:{x:target.x,z:target.z},hostile:source.kind==='monster'});this.damage(target,source.damage);source.timer=source.cooldown;}
 heal(){this.all().forEach(e=>e.hp=e.maxHp);}
 tick(dt){dt=Math.min(.1,Math.max(0,dt));this.time+=dt;if(this.train.hp>0)this.angle+=this.train.speed/6.95*dt;this.positionTrain();
 for(let a of this.actors){if(a.hp<=0)continue;if(a.wagonId)continue;const free=this.wagons.filter(w=>w.hp>0&&this.passengers(w).length<w.capacity);let target=free.sort((a1,b)=>Math.abs(this.angleDelta(a.angle,a1.angle))-Math.abs(this.angleDelta(a.angle,b.angle)))[0];if(target){let diff=this.angleDelta(a.angle,target.angle);a.angle+=Math.sign(diff)*Math.min(Math.abs(diff),a.speed/7.8*dt);if(Math.abs(this.angleDelta(a.angle,target.angle))<.13){a.wagonId=target.id;this.events.push({type:'board',id:a.id});}}else a.angle+=a.speed/7.8*dt;a.x=Math.cos(a.angle)*7.8;a.z=Math.sin(a.angle)*7.8;}
 this.positionTrain();
 for(let s of [this.train,...this.actors]){if(s.hp<=0)continue;s.timer-=dt;if(s.timer<=0){let t=this.nearest(s,this.monsters.filter(e=>e.hp>0));if(t&&this.distance(s,t)<=s.range)this.fire(s,t);}}
 for(let m of this.monsters){if(m.hp<=0)continue;m.timer-=dt;let candidates=this.living().filter(e=>e.kind!=='actor'||!e.wagonId),t=this.nearest(m,candidates);if(!t)continue;let d=this.distance(m,t);m.angle=Math.atan2(t.z-m.z,t.x-m.x);if(d>m.range){let step=Math.min(m.speed*dt,d-m.range);m.x+=(t.x-m.x)/d*step;m.z+=(t.z-m.z)/d*step;}else if(m.timer<=0)this.fire(m,t);}
 }
 angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
 distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
 nearest(a,list){return list.reduce((best,e)=>!best||this.distance(a,e)<this.distance(a,best)?e:best,null);}
}
root.RoundCircleSimulation={Simulation,defaults,types};if(typeof module!=='undefined')module.exports=root.RoundCircleSimulation;
})(typeof window!=='undefined'?window:globalThis);
