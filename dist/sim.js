(function(root){
'use strict';
const TAU=Math.PI*2,RAIL=6.95,STREET=7.8;
const clampTrainSpeed=value=>Number.isFinite(Number(value))?Math.max(1,Math.min(60,Number(value))):1;
const defaults={trainHp:200,trainDamage:12,trainSpeed:1.4,trainRange:6,trainCooldown:1.1,ramDamage:6,ramSelfDamage:.04,wagonHp:100,capacity:4,actorHp:35,actorDamage:7,actorSpeed:2.8,actorRange:5,actorCooldown:.8,actorLimit:160,monsterLimit:160,buildingHp:160,buildingCount:12,buildingRegen:1,buildingSpawnRate:3,production:true,useBudget:true,vortexRadius:1.2};
const types={crawler:{name:'Rampant',hp:35,damage:5,speed:.8,range:.9,cooldown:1.2,size:.55},runner:{name:'Sprinteur',hp:18,damage:3,speed:1.8,range:.8,cooldown:.7,size:.38},brute:{name:'Colosse',hp:150,damage:16,speed:.42,range:1.3,cooldown:1.8,size:1},maw:{name:'Gueule traînante',hp:65,damage:9,speed:1.2,range:.65,cooldown:.9,size:.85,behavior:'hunter'},spitter:{name:'Crache-bile',hp:48,damage:7,speed:.6,range:3.5,cooldown:1.8,size:.8,behavior:'siege'},carapace:{name:'Porte-cadavres',hp:180,damage:13,speed:.45,range:1,cooldown:1.5,size:1.1,behavior:'siege',armor:.4},cathedral:{name:'Cathédrale de chair',hp:650,damage:22,speed:.32,range:2.4,cooldown:2.4,size:1.85,elite:true,behavior:'siege',splash:1.6},widow:{name:'Veuve du seuil',hp:420,damage:15,speed:1.45,range:1.2,cooldown:.8,size:1.5,elite:true,behavior:'hunter'}};
const profileDefaults={budget:100,shares:{hp:20,damage:25,speed:15,range:20,rate:20},weights:{hp:1,damage:1.5,speed:1,range:1.5,rate:2}};
function clone(x){return JSON.parse(JSON.stringify(x));}
// Integer allocations, total 100, floor 1 per stat; largest remainder keeps rounding fair.
function redistribute(shares,key,value){
 if(!(key in shares)||!Number.isFinite(Number(value)))throw Error('Allocation invalide');
 const keys=Object.keys(shares).filter(k=>k!==key),next=Math.max(1,Math.min(100-keys.length,Math.round(Number(value)))),remaining=100-next-keys.length;
 const weights=keys.map(k=>Math.max(0,(Number(shares[k])||1)-1)),total=weights.reduce((a,b)=>a+b,0);
 const portions=keys.map((k,i)=>({k,value:remaining*(total?weights[i]/total:1/keys.length)}));
 for(const p of portions)shares[p.k]=1+Math.floor(p.value);
 let rest=100-next-keys.reduce((n,k)=>n+shares[k],0);
 portions.sort((a,b)=>(b.value%1)-(a.value%1));
 for(let i=0;i<rest;i++)shares[portions[i].k]++;
 shares[key]=next;return shares;
}
function profileStats(p){const points=k=>p.budget*p.shares[k]/100/Math.max(.1,p.weights[k]);return {maxHp:Math.round(15+points('hp')*2),damage:+(2+points('damage')*.4).toFixed(2),speed:+(1+points('speed')*.08).toFixed(2),range:+(1+points('range')*.12).toFixed(2),cooldown:+(1/(1+points('rate')*.06)).toFixed(3)};}
class Simulation{
 constructor(cfg={}){this.cfg={...defaults,...cfg};this.profile=clone(profileDefaults);this.nextId=1;this.reset();}
 entity(kind,name,stats){return {id:this.nextId++,kind,name,hp:stats.maxHp,maxHp:stats.maxHp,damage:0,speed:0,range:0,cooldown:1,timer:0,x:0,z:0,angle:0,...stats};}
 reset(){this.resetId=(this.resetId||0)+1;this.cfg.trainSpeed=clampTrainSpeed(this.cfg.trainSpeed);this.events=[];this.time=0;this.angle=0;this.kills=0;this.collisions=0;this.contacts=new Set();this.train=this.entity('train','Locomotive',{maxHp:this.cfg.trainHp,damage:this.cfg.trainDamage,speed:this.cfg.trainSpeed,range:this.cfg.trainRange,cooldown:this.cfg.trainCooldown});this.wagons=[];this.actors=[];this.monsters=[];this.buildings=Array.from({length:Math.max(0,Math.min(12,this.cfg.buildingCount))},(_,i)=>{let a=i/12*TAU+.3;return this.entity('building','Bâtiment '+(i+1),{maxHp:this.cfg.buildingHp,regen:this.cfg.buildingRegen,spawnRate:this.cfg.buildingSpawnRate,spawnProgress:i/12,angle:a,x:Math.cos(a)*9,z:Math.sin(a)*9,dead:false});});for(let i=0;i<3;i++)this.addWagon();this.positionTrain();}
 all(){return [this.train,...this.wagons,...this.actors,...this.monsters,...this.buildings];}
 get(id){return this.all().find(e=>e.id===id);}
 living(){return [this.train,...this.wagons,...this.actors,...this.buildings].filter(e=>e.hp>0&&!e.dead);}
 addWagon(){if(this.wagons.length>=16)return null;let w=this.entity('wagon','Wagon '+this.nextId,{maxHp:this.cfg.wagonHp,capacity:this.cfg.capacity});this.wagons.push(w);this.positionTrain();return w;}
 passengers(w){return w?this.actors.filter(a=>a.hp>0&&a.wagonId===w.id):[];}
 disembark(a,w){a.wagonId=null;a.angle=w.angle;a.radius=STREET;a.x=Math.cos(a.angle)*STREET;a.z=Math.sin(a.angle)*STREET;}
 removeWagon(id){let i=id===undefined?this.wagons.length-1:this.wagons.findIndex(w=>w.id===id);if(i<0)return;const w=this.wagons[i];this.passengers(w).forEach(a=>this.disembark(a,w));this.wagons.splice(i,1);this.positionTrain();}
 capacity(w,n){w.capacity=Math.max(0,Math.min(12,Math.floor(n)));this.passengers(w).slice(w.capacity).forEach(a=>this.disembark(a,w));}
 freeProfile(){return {maxHp:this.cfg.actorHp,damage:this.cfg.actorDamage,speed:this.cfg.actorSpeed,range:this.cfg.actorRange,cooldown:this.cfg.actorCooldown};}
 spawnActor(home=null,override=null){if(home&&(home.hp<=0||home.dead))return null;if(this.actors.filter(a=>a.hp>0).length>=this.cfg.actorLimit)return null;const stats=override||(home&&this.cfg.useBudget?profileStats(this.profile):this.freeProfile());const a=this.entity('actor','Soldat '+this.nextId,{...stats,wagonId:null,angle:home?home.angle:this.angle-.4,radius:home?8.4:STREET,homeId:home?.id??null});a.x=Math.cos(a.angle)*a.radius;a.z=Math.sin(a.angle)*a.radius;this.actors.push(a);this.events.push({type:'born',id:a.id,x:a.x,z:a.z});return a;}
 spawn(type,overrides={}){if(!types[type])throw Error('Type de monstre inconnu');if(this.monsters.filter(a=>a.hp>0).length>=this.cfg.monsterLimit)return null;const spec={...types[type],...overrides};const a=this.nextId*2.399963%TAU,r=this.cfg.vortexRadius*.55;const m=this.entity('monster',spec.name+' '+this.nextId,{...spec,type,maxHp:spec.hp,angle:a,x:Math.cos(a)*r,z:Math.sin(a)*r});this.monsters.push(m);this.events.push({type:'spawn',id:m.id,x:m.x,z:m.z});return m;}
 positionTrain(){[this.train,...this.wagons].forEach((w,i)=>{w.angle=this.angle-i*.22;w.x=Math.cos(w.angle)*RAIL;w.z=Math.sin(w.angle)*RAIL;});for(const a of this.actors)if(a.wagonId){const w=this.wagons.find(w=>w.id===a.wagonId);if(w){a.x=w.x;a.z=w.z;a.angle=w.angle;}}}
 damage(target,n){if(target.hp<=0||target.dead)return;target.hp=Math.max(0,target.hp-Math.max(0,n));this.events.push({type:'hit',id:target.id,x:target.x,z:target.z,amount:n});if(target.hp===0){this.events.push({type:'death',id:target.id,x:target.x,z:target.z});if(target.kind==='monster')this.kills++;if(target.kind==='building')target.dead=true;if(target.kind==='wagon')this.removeWagon(target.id);}}
 fire(source,target){this.events.push({type:'shot',from:{x:source.x,z:source.z},to:{x:target.x,z:target.z},hostile:source.kind==='monster'});this.damage(target,source.damage*(1-(target.armor||0)));if(source.splash)for(const other of this.living())if(other.id!==target.id&&(other.kind!=='actor'||!other.wagonId)&&this.distance(other,target)<=source.splash)this.damage(other,source.damage*.4);source.timer=Math.max(.05,source.cooldown);}
 killSoldiers(){const alive=this.actors.filter(a=>a.hp>0);for(const a of alive){this.damage(a,a.hp);a.wagonId=null;}return alive.length;}
 heal(){this.living().forEach(e=>e.hp=e.maxHp);if(this.train.hp<=0)this.train.hp=this.train.maxHp;}
 tick(dt){let remaining=Math.min(.25,Math.max(0,dt));while(remaining>1e-7){const step=Math.min(.02,remaining);this.step(step);remaining-=step;}}
 step(dt){this.time+=dt;const previous=this.angle;this.train.speed=clampTrainSpeed(this.train.speed);const speed=this.train.hp>0?this.train.speed:0;this.angle+=speed/RAIL*dt;this.positionTrain();
 for(const b of this.buildings){if(b.hp<=0){b.dead=true;continue;}if(b.dead)continue;b.hp=Math.min(b.maxHp,b.hp+Math.max(0,b.regen)*dt);if(this.cfg.production&&b.spawnRate>0){b.spawnProgress=Math.min(1,b.spawnProgress+dt*b.spawnRate/60);if(b.spawnProgress>=1&&this.spawnActor(b))b.spawnProgress=0;}}
 for(const a of this.actors){if(a.hp<=0||a.wagonId)continue;const old=a.angle;if(a.radius>STREET){a.radius=Math.max(STREET,a.radius-Math.min(a.speed,1.2)*dt);}else{a.angle+=a.speed/STREET*dt;for(let i=0;i<this.wagons.length;i++){const w=this.wagons[i];if(w.hp<=0||this.passengers(w).length>=w.capacity)continue;const start=previous-(i+1)*.22;const d=this.angleDelta(start,old),relative=(this.angle-previous)-(a.angle-old);const crossed=relative>=0?d>=-.09&&d<=relative+.09:d<=.09&&d>=relative-.09;if(crossed||Math.abs(this.angleDelta(a.angle,w.angle))<.09){a.wagonId=w.id;this.events.push({type:'board',id:a.id});break;}}}a.x=Math.cos(a.angle)*a.radius;a.z=Math.sin(a.angle)*a.radius;}
 this.positionTrain();
 for(const s of [this.train,...this.actors]){if(s.hp<=0)continue;s.timer-=dt;if(s.timer<=0){const t=this.nearest(s,this.monsters.filter(e=>e.hp>0));if(t&&this.distance(s,t)<=s.range)this.fire(s,t);}}
 for(const m of this.monsters){if(m.hp<=0)continue;m.timer-=dt;let choices=this.living().filter(e=>e.kind!=='actor'||!e.wagonId);if(m.behavior==='siege'){const b=choices.filter(e=>e.kind==='building');if(b.length)choices=b;}if(m.behavior==='hunter'){const prey=choices.filter(e=>e.kind==='actor');if(prey.length)choices=prey;}const target=this.nearest(m,choices);if(!target)continue;const d=this.distance(m,target);m.angle=Math.atan2(target.z-m.z,target.x-m.x);if(d>m.range){const step=Math.min(m.speed*dt,d-m.range);m.x+=(target.x-m.x)/d*step;m.z+=(target.z-m.z)/d*step;}else if(m.timer<=0)this.fire(m,target);}
 this.ram(previous,speed);
 }
 ram(previous,speed){const current=new Set(),vehicles=[this.train,...this.wagons];for(let i=0;i<vehicles.length;i++){const w=vehicles[i];if(w.hp<=0)continue;const end=this.angle-i*.22,start=previous-i*.22;for(const m of this.monsters){if(m.hp<=0)continue;const radius=Math.hypot(m.x,m.z),hitRadius=.43+m.size*.34;if(Math.abs(radius-RAIL)>hitRadius)continue;const angle=Math.atan2(m.z,m.x),delta=this.angleDelta(start,angle),travel=end-start,half=Math.sqrt(Math.max(0,hitRadius**2-(radius-RAIL)**2))/RAIL+.04;const swept=delta>=-half&&delta<=travel+half;const contact=Math.abs(this.angleDelta(end,angle))<=half;const key=w.id+':'+m.id;if(contact)current.add(key);if(speed>.01&&swept&&!this.contacts.has(key)){this.damage(m,speed*this.cfg.ramDamage*(1-(m.armor||0)));this.damage(w,speed*this.cfg.ramSelfDamage);this.collisions++;this.events.push({type:'ram',x:m.x,z:m.z,speed,id:w.id});if(w.hp<=0)break;}}}this.contacts=current;}
 angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
 distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
 nearest(a,list){return list.reduce((best,e)=>!best||this.distance(a,e)<this.distance(a,best)?e:best,null);}
}
root.RoundCircleSimulation={Simulation,defaults,types,profileDefaults,profileStats,redistribute};if(typeof module!=='undefined')module.exports=root.RoundCircleSimulation;
})(typeof window!=='undefined'?window:globalThis);
