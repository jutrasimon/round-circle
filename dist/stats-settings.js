(function(root){
'use strict';
const key='round-circle-default-stats-v1',clone=x=>JSON.parse(JSON.stringify(x));
const limits={trainHp:[1,5000],trainDamage:[0,500],trainSpeed:[1,60],trainRange:[0,15],trainCooldown:[.1,10],ramDamage:[0,30],ramSelfDamage:[0,1],wagonHp:[1,2000],capacity:[0,12],actorHp:[1,500],actorDamage:[0,100],actorSpeed:[0,8],actorRange:[0,15],actorCooldown:[.1,5],actorLimit:[1,300],monsterLimit:[1,300],buildingHp:[1,3000],buildingCount:[0,12],buildingPopInterval:[0,300],buildingRegen:[0,20],buildingSpawnRate:[0,60],vortexRadius:[.2,6]};
function validate(data){
 const {defaults,profileDefaults,types,redistribute}=root.RoundCircleSimulation;
 if(!data||data.version!==1||!data.simulation||!data.profile||!data.monsters)throw Error('Invalid stats file');
 function num(v,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error('Stat out of bounds');return v;}
 const simulation={...defaults};for(const [k,[min,max]] of Object.entries(limits))if(data.simulation[k]!==undefined)simulation[k]=num(data.simulation[k],min,max);
 for(const k of ['capacity','actorLimit','monsterLimit','buildingCount'])if(!Number.isInteger(simulation[k]))throw Error('Quantity must be an integer');
 for(const k of ['production','manualProduction','useBudget'])if(data.simulation[k]!==undefined){if(typeof data.simulation[k]!=='boolean')throw Error('Invalid option');simulation[k]=data.simulation[k];}
 if(data.balanceVersion!==1&&simulation.ramSelfDamage===.04)simulation.ramSelfDamage=.4;
 const profile=clone(profileDefaults);profile.budget=num(data.profile.budget,10,300);
 for(const k of Object.keys(profile.shares)){profile.shares[k]=num(data.profile.shares?.[k],1,96);profile.weights[k]=num(data.profile.weights?.[k],.25,5);}
 if(Math.abs(Object.values(profile.shares).reduce((a,b)=>a+b,0)-100)>.01)throw Error('Profile must total 100 points');redistribute(profile.shares,'hp',profile.shares.hp);
 const monsters=clone(types);for(const k of Object.keys(types))for(const [stat,min,max] of [['hp',1,2000],['damage',0,200],['speed',0,6],['range',.2,10],['cooldown',.1,5]])if(data.monsters[k]?.[stat]!==undefined)monsters[k][stat]=num(data.monsters[k][stat],min,max);
 for(const k of Object.keys(monsters))monsters[k].range=root.RoundCircleSimulation.migrateRange(k,monsters[k].range,data.combatVersion);
 const vortex=data.vortex?{rate:num(data.vortex.rate,0,10),startRadius:num(data.vortex.startRadius,.2,6)}:{rate:(6-simulation.vortexRadius)/5,startRadius:simulation.vortexRadius};
 if(vortex.startRadius>=6)vortex.startRadius=1.2;if(data.durationVersion!==1&&(!data.vortex||vortex.rate===.3))vortex.rate=(6-vortex.startRadius)/5;simulation.vortexRadius=vortex.startRadius;const result={version:1,combatVersion:2,balanceVersion:1,durationVersion:1,simulation,profile,monsters,vortex};
 if(data.settings){
  const settings=clone(data.settings),object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(!object(settings))throw Error('Invalid complete settings');
  for(const key of ['visual','waves','features','storage'])if(settings[key]!==undefined&&!object(settings[key]))throw Error('Settings '+key+' invalid');
  if(settings.waves){settings.waves.library=root.RoundCircleWaves.validateLibrary(settings.waves.library,types);if(settings.waves.draft)settings.waves.draft=root.RoundCircleWaves.validateWave(settings.waves.draft,types);}
  if(settings.features?.catalog)settings.features.catalog=root.RoundCircleRewards.validate(settings.features.catalog);
  if(settings.visual)for(const value of Object.values(settings.visual))if(!['number','string','boolean'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))throw Error('Invalid visual setting');
  result.settings=settings;
 }
 return result;
}
root.RoundCircleStats={key,validate};if(typeof module!=='undefined')module.exports=root.RoundCircleStats;
})(typeof window!=='undefined'?window:globalThis);
