(function(root){
'use strict';
const effects={actorDamage:'Dégâts des soldats',actorRate:'Cadence des soldats',actorRange:'Portée des soldats',actorHp:'Vie des soldats',production:'Production des maisons',buildingHp:'Vie des maisons',regen:'Régénération des maisons',trainDamage:'Dégâts de la locomotive',trainHp:'Vie du convoi',ram:'Dégâts de collision'};
const seed=[
 {id:'giants',name:'Syndicat des géants',icon:'✊',effect:'actorDamage',factor:1.5,description:'Chaque soldat frappe plus fort. Les recrues aussi.'},
 {id:'factory',name:'Quart de nuit',icon:'⌂',effect:'production',factor:1.5,description:'Les maisons accélèrent la production, jusqu’à la limite de population.'},
 {id:'frenzy',name:'Doigts sur la gâchette',icon:'ϟ',effect:'actorRate',factor:1.5,description:'La cadence des tirs explose. Les munitions ? On verra plus tard.'},
 {id:'horizon',name:'Le quartier nous appartient',icon:'◎',effect:'actorRange',factor:1.25,description:'Les soldats atteignent les ennemis bien au-delà de leur portée de base.'},
 {id:'titan',name:'Locataires indestructibles',icon:'♥',effect:'actorHp',factor:1.5,description:'Multiplie la vie maximale et la vie restante des soldats.'},
 {id:'fortress',name:'Béton armé de mauvaise foi',icon:'▣',effect:'buildingHp',factor:2,description:'Renforce la vie maximale et restante des maisons vivantes.'},
 {id:'repair',name:'Ça repousse',icon:'✚',effect:'regen',factor:2,description:'Les maisons se régénèrent beaucoup plus vite. Les ruines restent des ruines.'},
 {id:'cannon',name:'Canon de copropriété',icon:'◆',effect:'trainDamage',factor:2,description:'Multiplie les dégâts de chaque tir de la locomotive.'},
 {id:'convoy',name:'Train blindé',icon:'▰',effect:'trainHp',factor:1.5,description:'Multiplie la vie du convoi, wagons actuels et futurs compris.'},
 {id:'ram',name:'Priorité absolue',icon:'➤',effect:'ram',factor:2,description:'Multiplie les dégâts de collision contre les monstres, sans augmenter l’usure.'}
];
function validate(data){if(!Array.isArray(data)||data.length<3||data.length>100)throw Error('Prévoir 3 à 100 bonus');const ids=new Set();return data.map(b=>{if(!b||typeof b.id!=='string'||!/^[-\w]{1,60}$/.test(b.id)||ids.has(b.id)||typeof b.name!=='string'||!b.name.trim()||b.name.length>80||typeof b.description!=='string'||b.description.length>500||typeof b.icon!=='string'||b.icon.length>8||!Object.hasOwn(effects,b.effect)||!Number.isFinite(b.factor)||b.factor<1.25||b.factor>10)throw Error('Bonus invalide : nom, effet ou multiplicateur (1,25 à 10)');ids.add(b.id);return {...b};});}
function migrateCatalog(data){return validate(data.map(b=>({...b,factor:1+(b.factor-1)/2})));}
class Rewards{
 constructor(sim,{catalog=seed,random=Math.random,onChange=()=>{}}={}){this.sim=sim;this.catalog=validate(catalog);this.random=random;this.onChange=onChange;this.enabled=true;this.reset();}
 reset(){this.resetId=this.sim.resetId;this.queue=[];this.artifacts=[];this.seen=new Set();this.revision=(this.revision||0)+1;this.onChange();}
 offer(event){if(this.resetId!==this.sim.resetId)this.reset();if(!this.enabled||this.seen.has(event.id))return false;this.seen.add(event.id);const pool=this.catalog.map(b=>({...b})),choices=[];while(choices.length<3)choices.push(pool.splice(Math.min(pool.length-1,Math.floor(this.random()*pool.length)),1)[0]);this.queue.push({event:{...event},choices});this.revision++;this.onChange();return true;}
 get pending(){return this.queue[0]||null;}
 choose(id,revision){if(this.resetId!==this.sim.resetId){this.reset();return false;}if(revision!==this.revision)return false;const bonus=this.pending?.choices.find(b=>b.id===id);if(!bonus)return false;this.sim.applyRunBonus(bonus.effect,bonus.factor);this.artifacts.push({...bonus,wave:this.pending.event.name});this.queue.shift();this.revision++;this.onChange();return true;}
}
root.RoundCircleRewards={Rewards,seed,effects,validate,migrateCatalog};if(typeof module!=='undefined')module.exports=root.RoundCircleRewards;
})(typeof window!=='undefined'?window:globalThis);
