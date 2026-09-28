const fs=require('node:fs'),{Worker,isMainThread,parentPort,workerData}=require('node:worker_threads');
if(!isMainThread){const {run}=require('./simulate-odds.cjs');parentPort.postMessage(workerData.jobs.map(j=>run(j.policy,j.seed,j.dt||.1,workerData.profile)));}
else{
 const profile=require('../dist/partie-temoin.json');
 const basePolicies=[{id:'random',mode:'random',bonus:'random'},...['guardian','watcher','gunner','scout'].map((id,unit)=>({id,unit})),{id:'mixed',mode:'mixed'},{id:'balanced',sequence:[0,1,2,3,1,2]},{id:'ranged',sequence:[0,1,2,1,2,3,1,2]},{id:'adaptive',ratios:[1,2,2,1]},{id:'adaptive-light',ratios:[1,3,3,1]},{id:'adaptive-gunners',ratios:[1,2,3,1]},{id:'adaptive-watchers',ratios:[1,3,2,1]}];
 const policies=basePolicies.flatMap(p=>p.id==='random'||p.id==='mixed'?[p]:['range','damage','defense','convoy'].map(bonusStyle=>({...p,id:p.id+'-'+bonusStyle,bonusStyle})));
 async function batch(jobs){const chunks=Array.from({length:4},()=>[]);jobs.forEach((j,i)=>chunks[i%4].push(j));return (await Promise.all(chunks.map(jobs=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{jobs,profile}});w.on('message',resolve);w.on('error',reject);w.on('exit',c=>{if(c)reject(Error(c));});})))).flat();}
 function summarize(rows,id){const n=rows.length,wins=rows.filter(r=>r.hp>0).length,p=wins/n,z=1.96,d=1+z*z/n,c=(p+z*z/(2*n))/d,m=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return {id,n,wins,survival:p,interval:[c-m,c+m],counts:Object.fromEntries(['defeat','departure','force','harmony'].map(k=>[k,rows.filter(r=>r.outcome===k).length])),meanTime:rows.reduce((a,r)=>a+r.time,0)/n,meanHP:rows.reduce((a,r)=>a+r.hp,0)/n,meanWaves:rows.reduce((a,r)=>a+r.cleared,0)/n};}
 (async()=>{
  console.log('Selecting policy: Expanded composition / bonus search x 40 calibration seeds, dt 0.1');
  const search=await batch(policies.flatMap(policy=>Array.from({length:40},(_,i)=>({policy,seed:54000+i}))));
  const ranking=policies.map(policy=>({...summarize(search.filter(r=>r.policy===policy.id),policy.id),policy})).sort((a,b)=>b.survival-a.survival||b.meanWaves-a.meanWaves||b.meanHP-a.meanHP);
  const best={...ranking[0].policy,id:'expert'};
  const cases=[{policy:best,n:300},{policy:policies[0],n:300},...['guardian','watcher','gunner','scout'].map(id=>({policy:{...ranking.find(r=>r.policy.id.startsWith(id+'-')).policy,id},n:100})),{policy:{id:'mixed',mode:'mixed'},n:100},{policy:{id:'casual',mode:'casual',interval:8,delay:10,bonus:'random'},n:100}];
  console.log('Independent validation: '+JSON.stringify(best)+'; 1200 new runs');
  const rows=await batch(cases.flatMap(({policy,n})=>Array.from({length:n},(_,i)=>({policy,seed:980000+i}))));
  const summary=cases.map(({policy})=>({...summarize(rows.filter(r=>r.policy===policy.id),policy.id),policy}));
  console.log(JSON.stringify(summary,null,2));
  const sensitivity=await batch([best,policies[0]].flatMap(policy=>Array.from({length:30},(_,i)=>({policy,seed:980000+i,dt:.05}))));
  const changes=sensitivity.filter(r=>rows.find(x=>x.seed===r.seed&&x.policy===r.policy).outcome!==r.outcome).length;
  const data={version:'040',profile,runs:search.length+rows.length+sensitivity.length,search,ranking,summary,rows,sensitivity,sensitivityChanges:changes,dt:.1,calibrationSeeds:[54000,54039],validationSeeds:[980000,980299],targets:{expert:.75,random:.15}};
  fs.mkdirSync('reports/balance-v040',{recursive:true});fs.writeFileSync('reports/balance-v040/results.json',JSON.stringify(data,null,2));
  fs.writeFileSync('reports/balance-v040/runs.csv','policy,seed,outcome,time,hp,houses,cleared,kills,recruited\n'+rows.map(r=>[r.policy,r.seed,r.outcome,r.time,r.hp,r.houses,r.cleared,r.kills,r.recruited].join(',')).join('\n'));
  console.log('FINISHED '+JSON.stringify({runs:data.runs,changes,expert:summary[0].survival,random:summary[1].survival}));
 })().catch(e=>{console.error(e);process.exitCode=1;});
}
