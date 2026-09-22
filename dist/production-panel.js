(function(root){
'use strict';
function progress(sim){
 const rows=[],cfg=sim.cfg,homes=sim.buildings.filter(b=>b.hp>0&&!b.dead),p=sim.population();
 if(sim.freeBuildingSlot()!==undefined&&cfg.buildingPopInterval>0)rows.push({label:'Construction : prochaine maison',value:sim.buildingPopElapsed/cfg.buildingPopInterval,detail:Math.ceil(Math.max(0,cfg.buildingPopInterval-sim.buildingPopElapsed))+' s restantes'});
 const producers=homes.filter(b=>b.spawnRate>0);
 if(cfg.production&&producers.length){const next=producers.reduce((best,b)=>{const eta=x=>(1-x.spawnProgress)*60/(x.spawnRate*sim.multiplier('production'));return !best||eta(b)<eta(best)?b:best;},null);const wagon=sim.train.hp>0&&cfg.capacity>0&&p.aboard>=p.seats&&sim.wagons.length<16,seconds=Math.ceil(Math.max(0,(1-next.spawnProgress)*60/(next.spawnRate*sim.multiplier('production'))));rows.push({label:wagon?'Production : nouveau wagon':'Production : prochain soldat',value:next.spawnProgress,detail:!wagon&&p.total>=p.limit?'Limite de soldats atteinte':seconds+' s · '+next.name});}
 const damaged=homes.filter(b=>b.hp<b.maxHp&&b.regen>0);for(const b of damaged)rows.push({label:'Réparation : '+b.name,value:b.hp/b.maxHp,detail:Math.ceil(b.hp)+' / '+Math.ceil(b.maxHp)+' HP · '+Math.ceil((b.maxHp-b.hp)/(b.regen*sim.multiplier('regen')))+' s'});
 return rows;
}
function install(){const panel=document.createElement('div');panel.id='productionPanel';panel.innerHTML='<button id="productionHandle" type="button" aria-label="Déplacer la fenêtre de production">⠿ PRODUCTION EN COURS</button><div id="productionRows"></div><button id="productionResize" type="button" aria-label="Redimensionner la fenêtre de production">◢</button>';const stage=document.querySelector('#stage');stage.append(panel);root.installDrivingPanel(panel,stage,{key:'round-circle-production-layout-v1',handle:'#productionHandle',resize:'#productionResize'});let previous='';
 root.roundCircleProduction={update(){const rows=progress(root.roundCircleLab.sim),signature=JSON.stringify(rows);if(signature===previous)return;previous=signature;const host=panel.querySelector('#productionRows');host.replaceChildren();if(!rows.length){host.textContent='Aucune production active';return;}for(const row of rows){const block=document.createElement('div'),label=document.createElement('strong'),bar=document.createElement('progress'),detail=document.createElement('small');label.textContent=row.label;bar.max=1;bar.value=Math.max(0,Math.min(1,row.value));bar.setAttribute('aria-label',row.label);detail.textContent=row.detail;block.append(label,bar,detail);host.append(block);}}};root.roundCircleProduction.update();
}
root.RoundCircleProduction={progress};if(typeof module!=='undefined')module.exports=root.RoundCircleProduction;if(typeof window!=='undefined')window.addEventListener('round-circle-ready',install,{once:true});
})(typeof window!=='undefined'?window:globalThis);
