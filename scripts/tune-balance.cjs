const fs=require('node:fs'),{Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
if(!isMainThread){const {run}=require('./simulate-odds.cjs');parentPort.postMessage(workerData.jobs.map(j=>run(j.policy,j.seed,j.dt||.2,j.profile)));}
else{
const base=require('../reports/balance-v040/baseline-v039.json');
function candidate(damage,hp=1){const p=structuredClone(base);p.stats.simulation.actorLimit=30;
 const [g,w,u,s]=p.soldiers;g.duration=10;g.stats.guardRadius=3;g.role='Shields nearby allies from 40% of enemy fire. Protection does not stack.';
 w.stats.range=6;w.stats.minRange=3;w.stats.maxTargetSpeed=1.3;w.stats.damage=32;w.stats.armorPiercing=1;w.role='Pierces armour. Needs Scout marks to hit fast enemies. Minimum range: 3.';
 u.stats.damage=3;u.stats.cooldown=.22;
 s.stats.damage=7;s.duration=8;s.stats.markDuration=3;s.role='Marks enemies for 3 seconds: other attackers deal 35% more damage.';
 for(const wave of p.waves.waves)for(const group of wave.groups){const m=p.stats.monsters[group.type];group.stats.damage=(group.stats.damage??m.damage)*damage;group.stats.hp=Math.round((group.stats.hp??m.hp)*hp);}
 for(const m of Object.values(p.stats.monsters)){m.damage*=damage;m.hp=Math.round(m.hp*hp);}
 for(const b of p.bonuses.catalog){if(['actorDamage','actorRate'].includes(b.effect))b.factor=1.2;if(b.effect==='actorRange')b.factor=1.1;if(b.effect==='production')b.factor=1.5;if(['buildingHp','regen'].includes(b.effect))b.factor=2;if(b.effect==='trainDamage')b.factor=1.75;}
 return p;}
const policies=[{id:'random',mode:'random',bonus:'random'},{id:'mixed',mode:'mixed'},...['guardian','watcher','gunner','scout'].map((id,unit)=>({id,unit})),{id:'balanced',sequence:[0,1,2,3,1,2]},{id:'ranged',sequence:[0,1,2,1,2,3,1,2]},{id:'adaptive',ratios:[1,2,2,1]},{id:'adaptive-light',ratios:[1,3,3,1]},{id:'expert-damage',ratios:[1,3,3,1],bonusStyle:'damage'},{id:'expert-defense',ratios:[1,3,3,1],bonusStyle:'defense'},{id:'gunner-damage',unit:2,bonusStyle:'damage'},{id:'gunner-defense',unit:2,bonusStyle:'defense'}];
async function batch(jobs){const chunks=Array.from({length:4},()=>[]);jobs.forEach((j,i)=>chunks[i%4].push(j));return (await Promise.all(chunks.map(jobs=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{jobs}});w.on('message',resolve);w.on('error',reject);w.on('exit',c=>{if(c)reject(Error(c));});})))).flat();}
(async()=>{let results=[];for(const [damage,hp] of [[1.25,1.25],[1.35,1.25],[1.45,1.25]]){
 const p=candidate(damage,hp);const rows=await batch(policies.flatMap(policy=>Array.from({length:30},(_,i)=>({policy,seed:4000+i,profile:p}))));
 const summary=policies.map(policy=>({id:policy.id,survival:rows.filter(r=>r.policy===policy.id&&r.hp>0).length/30,time:Math.round(rows.filter(r=>r.policy===policy.id).reduce((a,r)=>a+r.time,0)/30)}));
 results.push({damage,hp,profile:p,summary});console.log(JSON.stringify({damage,hp,summary}));fs.mkdirSync('reports/balance-v040',{recursive:true});fs.writeFileSync('reports/balance-v040/tuning-utility.json',JSON.stringify(results,null,2));
}})().catch(e=>{console.error(e);process.exitCode=1;});
}
