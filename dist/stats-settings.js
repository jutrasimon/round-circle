(function(root){
'use strict';
const key='round-circle-default-stats-v1',clone=x=>JSON.parse(JSON.stringify(x));
const limits={trainHp:[1,5000],trainDamage:[0,500],trainSpeed:[1,60],trainRange:[0,15],trainCooldown:[.1,10],ramDamage:[0,30],ramSelfDamage:[0,1],wagonHp:[1,2000],capacity:[0,12],actorHp:[1,500],actorDamage:[0,100],actorSpeed:[0,8],actorRange:[0,15],actorCooldown:[.1,5],actorLimit:[1,300],monsterLimit:[1,300],buildingHp:[1,3000],buildingCount:[0,12],buildingPopInterval:[0,300],buildingRegen:[0,20],buildingSpawnRate:[0,60],vortexRadius:[.2,6]};
function validate(data){
 const {defaults,profileDefaults,types,redistribute}=root.RoundCircleSimulation;
 if(!data||data.version!==1||!data.simulation||!data.profile||!data.monsters)throw Error('Fichier de stats invalide');
 function num(v,min,max){if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error('Stat hors limites');return v;}
 const simulation={...defaults};for(const [k,[min,max]] of Object.entries(limits))if(data.simulation[k]!==undefined)simulation[k]=num(data.simulation[k],min,max);
 for(const k of ['capacity','actorLimit','monsterLimit','buildingCount'])if(!Number.isInteger(simulation[k]))throw Error('Une quantité doit être entière');
 for(const k of ['production','useBudget'])if(data.simulation[k]!==undefined){if(typeof data.simulation[k]!=='boolean')throw Error('Option invalide');simulation[k]=data.simulation[k];}
 if(data.balanceVersion!==1&&simulation.ramSelfDamage===.04)simulation.ramSelfDamage=.4;
 const profile=clone(profileDefaults);profile.budget=num(data.profile.budget,10,300);
 for(const k of Object.keys(profile.shares)){profile.shares[k]=num(data.profile.shares?.[k],1,96);profile.weights[k]=num(data.profile.weights?.[k],.25,5);}
 if(Math.abs(Object.values(profile.shares).reduce((a,b)=>a+b,0)-100)>.01)throw Error('Le profil doit totaliser 100 points');redistribute(profile.shares,'hp',profile.shares.hp);
 const monsters=clone(types);for(const k of Object.keys(types))for(const [stat,min,max] of [['hp',1,2000],['damage',0,200],['speed',0,6],['range',.2,10],['cooldown',.1,5]])if(data.monsters[k]?.[stat]!==undefined)monsters[k][stat]=num(data.monsters[k][stat],min,max);
 for(const k of Object.keys(monsters))monsters[k].range=root.RoundCircleSimulation.migrateRange(k,monsters[k].range,data.combatVersion);
 const vortex=data.vortex?{rate:num(data.vortex.rate,0,10),startRadius:num(data.vortex.startRadius,.2,6)}:{rate:.3,startRadius:simulation.vortexRadius};
 return {version:1,combatVersion:2,balanceVersion:1,simulation,profile,monsters,vortex};
}
root.RoundCircleStats={key,validate};if(typeof module!=='undefined')module.exports=root.RoundCircleStats;
})(typeof window!=='undefined'?window:globalThis);
