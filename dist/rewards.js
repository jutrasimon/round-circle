(function(root){
'use strict';
const effects={actorDamage:'Soldier damage',actorRate:'Soldier fire rate',actorRange:'Soldier range',actorHp:'Soldier health',production:'House production',buildingHp:'House health',regen:'House regeneration',trainDamage:'Locomotive damage',trainHp:'Convoy health',ram:'Collision damage'};
const seed=[
 {id:'giants',name:'Union of Giants',icon:'✊',effect:'actorDamage',factor:1.5,description:'Every soldier hits harder. Future recruits included.'},
 {id:'factory',name:'Night Shift',icon:'⌂',effect:'production',factor:1.5,description:'Houses recruit faster, up to the population limit.'},
 {id:'frenzy',name:'Trigger Fingers',icon:'ϟ',effect:'actorRate',factor:1.5,description:'Fire rates soar. Ammunition? We will worry about that later.'},
 {id:'horizon',name:'This Neighbourhood Is Ours',icon:'◎',effect:'actorRange',factor:1.25,description:'Soldiers reach enemies well beyond their base range.'},
 {id:'titan',name:'Unbreakable Tenants',icon:'♥',effect:'actorHp',factor:1.5,description:'Multiplies maximum and remaining soldier health.'},
 {id:'fortress',name:'Reinforced Denial',icon:'▣',effect:'buildingHp',factor:2,description:'Increases maximum and remaining health of standing houses.'},
 {id:'repair',name:'It Grows Back',icon:'✚',effect:'regen',factor:2,description:'Houses regenerate much faster. Ruins remain ruins.'},
 {id:'cannon',name:'Condominium Cannon',icon:'◆',effect:'trainDamage',factor:2,description:"Adds locomotive damage based on its starting value. Repeated upgrades add rather than multiply."},
 {id:'convoy',name:'Armoured Train',icon:'▰',effect:'trainHp',factor:1.5,description:"Adds convoy health based on its starting value, including future carriages. Repeated upgrades add rather than multiply."},
 {id:'ram',name:'Absolute Right of Way',icon:'➤',effect:'ram',factor:2,description:"Adds collision damage based on its starting value, without increasing wear. Repeated upgrades add rather than multiply."}
];
function validate(data){if(!Array.isArray(data)||data.length<3||data.length>100)throw Error('Provide 3 to 100 bonuses');const ids=new Set();return data.map(b=>{if(!b||typeof b.id!=='string'||!/^[-\w]{1,60}$/.test(b.id)||ids.has(b.id)||typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.description!=='string'||b.description.length>500||typeof b.icon!=='string'||b.icon.length>8||!Object.hasOwn(effects,b.effect)||!Number.isFinite(b.factor)||b.factor<1.1||b.factor>10)throw Error('Invalid bonus: name, effect or multiplier (1.1 to 10)');ids.add(b.id);return {...b};});}
function migrateCatalog(data){return validate(data.map(b=>({...b,factor:1+(b.factor-1)/2})));}
class Rewards{
 constructor(sim,{catalog=seed,random=Math.random,onChange=()=>{}}={}){this.sim=sim;this.catalog=validate(catalog);this.random=random;this.onChange=onChange;this.enabled=true;this.reset();}
 reset(){this.resetId=this.sim.resetId;this.queue=[];this.artifacts=[];this.seen=new Set();this.revision=(this.revision||0)+1;this.onChange();}
 offer(event){if(this.resetId!==this.sim.resetId)this.reset();if(!this.enabled||this.seen.has(event.id))return false;this.seen.add(event.id);const pool=this.catalog.map(b=>({...b})),choices=[];while(choices.length<3)choices.push(pool.splice(Math.min(pool.length-1,Math.floor(this.random()*pool.length)),1)[0]);this.queue.push({event:{...event},choices});this.revision++;this.onChange();return true;}
 get pending(){return this.queue[0]||null;}
 choose(id,revision){if(this.resetId!==this.sim.resetId){this.reset();return false;}if(revision!==this.revision)return false;const bonus=this.pending?.choices.find(b=>b.id===id);if(!bonus)return false;this.sim.applyRunBonus(bonus.effect,bonus.factor);this.sim.events.push({type:'reward-chosen',id:bonus.id});this.artifacts.push({...bonus,wave:this.pending.event.name});this.queue.shift();this.revision++;this.onChange();return true;}
}
root.RoundCircleRewards={Rewards,seed,effects,validate,migrateCatalog};if(typeof module!=='undefined')module.exports=root.RoundCircleRewards;
})(typeof window!=='undefined'?window:globalThis);
