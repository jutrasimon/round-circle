(function(root){
'use strict';
function sections(r){const m=r.metrics,n=(x)=>x||0,sum=o=>Object.values(o).reduce((a,b)=>a+b,0);return [
 ['La partie', [['Temps de jeu',Math.floor(r.time/60)+' min '+Math.floor(r.time%60)+' s'],['Rayon final',r.radius],['Vagues lancées',m.wavesStarted],['Vagues éliminées',m.wavesCompleted],['Monstres encore vivants',r.monsters],['Bonus choisis',r.artifacts?.length||0]]],
 ['Combats', [['Monstres apparus',n(m.created.monster)],['Monstres éliminés',r.kills],['Dégâts infligés aux monstres',n(m.damage.monster)],['Dégâts reçus par le camp',sum(m.damage)-n(m.damage.monster)],['Tirs de locomotive',n(m.shots.train)],['Tirs de soldats',n(m.shots.actor)],['Tirs ennemis',n(m.shots.monster)],['Collisions',r.collisions]]],
 ['Soldats', [['Soldats créés',n(m.created.actor)],['Soldats perdus',n(m.lost.actor)],['Soldats survivants',r.population.total],['À bord',r.population.aboard],['À pied',r.population.walking],['Places disponibles',r.population.seats-r.population.aboard],['Capacité du convoi',r.population.seats],['Limite de soldats',r.population.limit],['Embarquements',m.boardings],['Dégâts reçus par les soldats',n(m.damage.actor)]]],
 ['Le convoi', [['HP locomotive',Math.ceil(r.train.hp)+' / '+r.train.maxHp],['Distance parcourue (unités)',m.distance],['Tours du cercle',m.distance/(2*Math.PI*6.95)],['Vitesse moyenne (unités/s)',r.time?m.distance/r.time:0],['Wagons créés (3 initiaux inclus)',n(m.created.wagon)],['Wagons produits par les maisons',m.wagonsProduced],['Wagons détruits',n(m.lost.wagon)],['Wagons restants',r.wagons],['Dégâts reçus par la locomotive',n(m.damage.train)],['Dégâts reçus par les wagons',n(m.damage.wagon)]]],
 ['Le village', [['Maisons créées (initiales incluses)',n(m.created.building)],['Maisons détruites',n(m.lost.building)],['Maisons debout',r.buildings],['HP régénérés',m.regenerated],['Dégâts reçus par les maisons',n(m.damage.building)]]],
 ['Bestiaire éliminé',Object.entries(root.RoundCircleSimulation?.types||{}).map(([id,t])=>[t.name,n(m.killsByType[id])])],
 ['Bonus cumulés',Object.entries(r.bonuses).map(([id,value])=>[root.RoundCircleRewards?.effects[id]||id,'×'+value.toLocaleString('fr-CA')])]
 ];}
function install(){const {sim,designer}=root.roundCircleLab,dialog=document.createElement('dialog');dialog.className='endgame';dialog.setAttribute('aria-labelledby','endgame-title');document.body.append(dialog);dialog.addEventListener('cancel',e=>e.preventDefault());let result;
 const element=(tag,text,parent)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;parent?.append(e);return e;};
 function finish(){if(sim.ended)return;sim.cfg.vortexRadius=6;result=sim.finishRun({artifacts:root.roundCircleLab.features?.rewards.artifacts||[]});
  dialog.replaceChildren();element('p','LE CERCLE EST REFERMÉ',dialog).className='endgame-eyebrow';element('h1','Partie terminée',dialog).id='endgame-title';element('p','Le vortex a atteint sa taille maximale. Voici le bilan de cette partie.',dialog);
  const actions=element('div',undefined,dialog);actions.className='row';const restart=element('button','Nouvelle partie',actions);restart.className='primary';restart.onclick=()=>{dialog.close();document.querySelector('#start').click();};
  const download=element('button','Exporter le bilan JSON',actions);download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'})),a=element('a');a.href=url;a.download='round-circle-bilan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const grid=element('div',undefined,dialog);grid.className='endgame-grid';for(const [title,rows] of sections(result)){const card=element('section',undefined,grid);element('h2',title,card);if(!rows.length)element('p','Aucun bonus choisi.',card);const list=element('dl',undefined,card);for(const [label,value] of rows){element('dt',label,list);element('dd',typeof value==='number'?value.toLocaleString('fr-CA',{maximumFractionDigits:1}):value,list);}}
  if(result.artifacts.length){element('h2','Artefacts de la partie',dialog);element('p',result.artifacts.map(b=>b.name+' ×'+b.factor).join(' · '),dialog);}
  element('p','Les créations initiales et les actions du terrain d’essai sont incluses. Les dégâts comptent uniquement les HP réellement retirés.',dialog);dialog.showModal();restart.focus();root.roundCircleAudio?.event({type:'wave-complete'});
 }
 const previous=sim.onReset;sim.onReset=()=>{previous?.();dialog.close();result=null;};root.roundCircleEnd={finish};
}
root.RoundCircleEndgame={sections};if(typeof module!=='undefined')module.exports=root.RoundCircleEndgame;
if(typeof window!=='undefined')window.addEventListener('round-circle-ready',install,{once:true});
})(typeof window!=='undefined'?window:globalThis);
