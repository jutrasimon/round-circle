// Seeded bot benchmark of the shipped engine. No modified combat stats.
const fs=require('node:fs'),path=require('node:path');
const {Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
const {Simulation}=require('../dist/sim.js');
const {WaveRunner}=require('../dist/waves.js');
const {Rewards}=require('../dist/rewards.js');
const {resolveOutcome}=require('../dist/endgame.js');
const profile=require('../dist/partie-temoin.json');
const mulberry=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const priorities={actorRange:10,actorDamage:9,actorRate:8,trainHp:7,actorHp:6,production:5,buildingHp:4,trainDamage:3,regen:2,ram:1};
function run(policy,seed,dt=.2){
 const rng=mulberry(seed),decisions=mulberry(seed^0x7539a);Math.random=rng;
 const sim=new Simulation(profile.stats.simulation);sim.profile=structuredClone(profile.stats.profile);sim.monsterSpecs=structuredClone(profile.stats.monsters);sim.soldierProfiles=structuredClone(profile.soldiers);
 const runner=new WaveRunner(sim);runner.startRun(profile.waves);const rewards=new Rewards(sim,{catalog:profile.bonuses.catalog,random:rng});runner.onWaveComplete=e=>{if(sim.train.hp>0)rewards.offer(e);};runner.isBlocked=()=>!!rewards.pending;
 let next=policy.delay||0,flags={},seen=new Set(),recruited=0;
 while(sim.cfg.vortexRadius<6-1e-9&&sim.train.hp>0){
  if(policy.mode!=='idle'&&sim.time+1e-9>=next){
   const homes=sim.buildings.filter(b=>b.hp>0&&!b.dead&&!b.training);
   if(policy.mode==='casual')homes.splice(1);
   for(const home of homes){let index;
    if(policy.mode==='random'||policy.mode==='casual')index=Math.floor(decisions()*4);
    else if(policy.mode==='mixed')index=recruited%4;
    else if(policy.weights){let x=decisions()*policy.weights.reduce((a,b)=>a+b);index=policy.weights.findIndex(w=>(x-=w)<0);}
    else index=policy.unit;
    if(sim.queueTraining(home.id,sim.soldierProfiles[index].id))recruited++;
   }
   next=sim.time+(policy.interval||.4);
  }
  if(sim.time>600)throw Error('Run did not terminate');sim.tick(Math.min(dt,(6-sim.cfg.vortexRadius)*60/profile.waves.vortex.rate));runner.tick();
  for(const cue of profile.dialogue.cues)if(!seen.has(cue.id)&&sim.cfg.vortexRadius>=cue.radius){seen.add(cue.id);const story=profile.dialogue.library.dialogues.find(d=>d.id===cue.dialogueId);const choices=Object.values(story.nodes).find(n=>n.type==='choice').choices;const choice=choices[policy.dialogue==='open'?0:policy.dialogue==='closed'?1:Math.floor(decisions()*choices.length)];for(const effect of choice.effects||[])if(effect.type==='set')flags[effect.key]=effect.value;}
  while(rewards.pending){const choices=rewards.pending.choices;const choice=policy.bonus==='random'?choices[Math.floor(decisions()*choices.length)]:[...choices].sort((a,b)=>(priorities[b.effect]||0)-(priorities[a.effect]||0))[0];rewards.choose(choice.id,rewards.revision);}
  sim.events.length=0;
 }
 const state={train:sim.train,radius:sim.cfg.vortexRadius,buildings:sim.buildings.filter(b=>b.hp>0&&!b.dead).length};
 const outcome=resolveOutcome(profile,flags,runner.records,state);if(!outcome)throw Error('Missing terminal outcome');
 return {seed,policy:policy.id,outcome,time:sim.time,hp:sim.train.hp,houses:state.buildings,cleared:sim.metrics.wavesCompleted,kills:sim.kills,recruited:sim.metrics.created.actor||0,flags,allOpenOutcome:resolveOutcome(profile,{listened:true,passage:true,invitation:true},runner.records,state),closedOutcome:resolveOutcome(profile,{},runner.records,state)};
}
if(!isMainThread){parentPort.postMessage(workerData.map(job=>run(job.policy,job.seed,job.dt)));}
else{
 const output=path.resolve(__dirname,'../reports/balance-v039');fs.mkdirSync(output,{recursive:true});
 async function batch(jobs){const count=Math.min(4,jobs.length),chunks=Array.from({length:count},()=>[]);jobs.forEach((j,i)=>chunks[i%count].push(j));return (await Promise.all(chunks.map(chunk=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:chunk});w.on('message',resolve);w.on('error',reject);w.on('exit',code=>{if(code)reject(Error('Worker exit '+code));});})))).flat();}
 function aggregate(rows){const n=rows.length,counts=Object.fromEntries(['defeat','departure','force','harmony'].map(k=>[k,rows.filter(r=>r.outcome===k).length]));return {n,counts,survival:rows.filter(r=>r.hp>0).length/n,meanTime:rows.reduce((a,r)=>a+r.time,0)/n,meanCleared:rows.reduce((a,r)=>a+r.cleared,0)/n,meanHouses:rows.reduce((a,r)=>a+r.houses,0)/n,meanHP:rows.reduce((a,r)=>a+r.hp,0)/n};}
 (async()=>{
  const candidates=[];for(let i=0;i<4;i++)candidates.push({id:'search-unit-'+i,unit:i,dialogue:'open'});
  for(const weights of [[1,1,1,1],[1,3,1,1],[1,1,3,1],[1,1,1,3],[0,1,1,0],[0,2,1,1],[0,1,2,1],[1,2,2,0]])candidates.push({id:'search-'+weights.join(''),weights,dialogue:'open'});
  console.log('Search: 12 policies x 20 seeds = 240 runs');
  const search=await batch(candidates.flatMap(policy=>Array.from({length:20},(_,i)=>({policy,seed:1000+i}))));
  const ranking=candidates.map(p=>({policy:p,...aggregate(search.filter(r=>r.policy===p.id))})).sort((a,b)=>b.survival-a.survival||b.meanCleared-a.meanCleared||b.meanHP-a.meanHP);
  const best={...ranking[0].policy,id:'best-tested',dialogue:'random'};
  const policies=[{id:'idle',mode:'idle',dialogue:'random'},{id:'casual',mode:'casual',interval:8,delay:10,bonus:'random',dialogue:'random'},{id:'random',mode:'random',bonus:'random',dialogue:'random'},{id:'mixed',mode:'mixed',dialogue:'random'},...['guardian','watcher','gunner','scout'].map((id,unit)=>({id,unit,dialogue:'random'})),best];
  console.log('Holdout: 9 policies x 100 NEW seeds = 900 runs; best = '+JSON.stringify(best));
  const rows=await batch(policies.flatMap(policy=>Array.from({length:100},(_,i)=>({policy,seed:90000+i}))));
  console.log('Timestep sensitivity: 20 paired runs at 0.1 s');
  const sensitivity=await batch([policies[2],best].flatMap(policy=>Array.from({length:10},(_,i)=>({policy,seed:90000+i,dt:.1}))));
  const summary=policies.map(policy=>({policy,...aggregate(rows.filter(r=>r.policy===policy.id))}));
  const report={version:'039',runs:search.length+rows.length+sensitivity.length,dt:.2,substep:.02,searchSeeds:[1000,1019],holdoutSeeds:[90000,90099],ranking,summary,sensitivity,rows,search,assumptions:['Exact shipped simulation, waves, recruitment and reward implementations. No combat buffs or free recruits.','Randomness: house slots, reward offers and bot decisions; enemy spawn positions use engine entity IDs.','Open and closed endings are counterfactual classifications of the same combat, since dialogue has no combat effects.','Search selects from 12 simple policies; best-tested is not a proven global optimum.','Bots react on simulation-time schedules; they do not model reading, misclicks, frame stalls or human behaviour.']};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(output,'runs.csv'),'policy,seed,outcome,time,hp,houses,cleared,kills,recruited,allOpenOutcome,closedOutcome\n'+rows.map(r=>[r.policy,r.seed,r.outcome,r.time,r.hp,r.houses,r.cleared,r.kills,r.recruited,r.allOpenOutcome,r.closedOutcome].join(',')).join('\n'));
  console.log(JSON.stringify({runs:report.runs,summary,sensitivityChanges:sensitivity.filter(r=>rows.find(x=>x.seed===r.seed&&x.policy===r.policy).outcome!==r.outcome).length},null,2));
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
