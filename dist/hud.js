(function(root){
'use strict';
function install(){
 const $=s=>document.querySelector(s),lab=root.roundCircleLab,{sim,designer}=lab;
 const top=document.createElement('div');top.id='hudTop';top.innerHTML='<div id="convoyStatus"><b>CONVOI <span id="convoyHp"></span></b><progress id="convoyLife" max="1" aria-label="Vie du convoi"></progress><small id="populationStatus"></small></div><div id="journeyStatus"><b id="waveStatus"></b></div><div id="hudActions"></div>';document.body.append(top);
 $('#journeyStatus').append($('#runTimer'));$('#hudActions').append($('#pause'));
 const options=document.createElement('button');options.id='optionsToggle';options.textContent='Options';options.setAttribute('aria-expanded','false');options.setAttribute('aria-controls','laboratory');$('#hudActions').append(options);
 const drawer=$('aside');drawer.id='laboratory';drawer.hidden=true;drawer.setAttribute('aria-label','Options et laboratoire');const close=document.createElement('button');close.className='drawer-close';close.textContent='Fermer les options ×';drawer.prepend(close);const diagnostics=document.createElement('div');diagnostics.className='hud-diagnostics';diagnostics.append($('#caption'),$('#fps'));drawer.querySelector('.panel-foot').append(diagnostics);
 function drawerOpen(open){drawer.hidden=!open;options.setAttribute('aria-expanded',String(open));if(open){houses(false);root.roundCircleProduction?.clearSelection();close.focus();}else options.focus();}
 options.onclick=()=>drawerOpen(drawer.hidden);close.onclick=()=>drawerOpen(false);
 const bottom=document.createElement('div');bottom.id='hudBottom';bottom.innerHTML='<div id="bonusDock"><b>BONUS <span id="bonusCount">0</span></b><span id="bonusEmpty">Aucun pour le moment</span></div><div id="speedDock"></div><button id="housesToggle" aria-expanded="false" aria-controls="productionPanel">Maisons</button>';document.body.append(bottom);
 $('#speedDock').append($('#driving'));$('#driveHandle').setAttribute('aria-label','Allure du convoi');$('#driveHandle').removeAttribute('title');$('#driveHandle').disabled=true;$('#driveHandle').firstChild.textContent='ALLURE DU CONVOI ';const version=document.createElement('small');version.textContent='Round Circle · 032';drawer.querySelector('.session-meta').prepend(version);
 const tooltip=document.createElement('div');tooltip.id='artifactDetails';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');document.body.append(tooltip);
 const homes=$('#productionPanel');homes.hidden=true;$('#productionHandle').textContent='MAISONS';$('#productionHandle').disabled=true;$('#productionHandle').setAttribute('aria-label','Récapitulatif des maisons');
 const dismiss=document.createElement('button');dismiss.className='houses-close';dismiss.textContent='×';dismiss.setAttribute('aria-label','Fermer les maisons');dismiss.onclick=()=>houses(false);homes.append(dismiss);
 function houses(open){homes.hidden=!open;$('#housesToggle').setAttribute('aria-expanded',String(open));if(open){drawer.hidden=true;options.setAttribute('aria-expanded','false');tooltip.hidden=true;root.roundCircleProduction?.clearSelection();}}
 $('#housesToggle').onclick=()=>houses(homes.hidden);
 let reset=sim.resetId,modal=false;
 function frame(){const next=!!lab.features?.modalActive||sim.ended;if(next!==modal){modal=next;document.body.classList.toggle('game-modal',modal);top.inert=bottom.inert=drawer.inert=modal;if(modal){houses(false);drawer.hidden=true;options.setAttribute('aria-expanded','false');tooltip.hidden=true;}else $('#pause').focus();}}
 function update(){if(reset!==sim.resetId){reset=sim.resetId;houses(false);drawer.hidden=true;options.setAttribute('aria-expanded','false');tooltip.hidden=true;}const p=sim.population();$('#convoyHp').textContent=Math.ceil(sim.train.hp)+' / '+Math.ceil(sim.train.maxHp);$('#convoyLife').value=sim.train.hp/sim.train.maxHp;$('#populationStatus').textContent='Soldats '+p.total+'/'+p.limit+' · '+p.aboard+'/'+p.seats+' à bord';const count=lab.currentRunProfile?.waves.waves.length||designer.runner.vortexPlan?.triggers.length||0;$('#waveStatus').textContent='VAGUE '+(designer.runner.waveNumber||0)+(count?' / '+count:'');const jobs=sim.buildings.filter(b=>b.hp>0&&b.training).length,free=sim.buildings.filter(b=>b.hp>0&&!b.training).length;$('#housesToggle').textContent='Maisons · '+jobs+' en cours';$('#housesToggle').title=free+' disponibles';const n=lab.features?.rewards.artifacts.length||0;$('#bonusCount').textContent=n;$('#bonusEmpty').hidden=n>0;frame();}
 function showArtifact(text){tooltip.textContent=text;tooltip.hidden=false;}
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.artifact,#artifactDetails'))tooltip.hidden=true;if(!e.target.closest('#productionPanel,#housesToggle'))houses(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal){tooltip.hidden=true;houses(false);if(!drawer.hidden)drawerOpen(false);}});
 root.roundCircleHud={update,frame,showArtifact,hideArtifact(){tooltip.hidden=true;},openLab:()=>drawerOpen(true),closeHouses:()=>houses(false)};
 window.addEventListener('round-circle-features-ready',()=>{const shelf=$('.artifact-shelf');if(shelf)$('#bonusDock').append(shelf);update();},{once:true});update();
}
window.addEventListener('round-circle-ready',install,{once:true});
})(window);
