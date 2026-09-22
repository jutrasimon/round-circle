import {DialogueEngine,validateLibrary} from './dialogue/src/dialogue-core.js';
import {DialogueView,preloadAssets} from './dialogue/src/dialogue-view.js';

const $=s=>document.querySelector(s);
const el=(tag,text,parent)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;parent?.append(node);return node;};
function button(parent,text,fn){const b=el('button',text,parent);b.type='button';b.onclick=async()=>{try{await fn();}catch(e){status.textContent=e.message;const message=el('p',e.message,parent);message.setAttribute('role','alert');}};return b;}
function select(parent,label,items,value){const row=el('label',label,parent),s=el('select',undefined,row);s.setAttribute('aria-label',label);for(const [value,text] of items){const o=el('option',text,s);o.value=value;}s.value=value;return s;}
function numeric(parent,label,value,min,max,step=1){const row=el('label',label,parent),n=el('input',undefined,row);Object.assign(n,{type:'number',value,min,max,step});n.setAttribute('aria-label',label);return n;}
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function jsonWorkshop(parent,label,getData,apply){const box=el('details',undefined,parent);el('summary',label,box);const text=el('textarea',undefined,box);text.value=JSON.stringify(getData(),null,2);text.setAttribute('aria-label',label);text.spellcheck=false;
 const feedback=el('p','',box);feedback.setAttribute('role','status');
 const validate=async()=>{try{if(text.value.length>1000000)throw Error('Maximum 1 Mo');await apply(JSON.parse(text.value));feedback.textContent='Bibliothèque validée et appliquée.';}catch(e){feedback.textContent='Import refusé : '+e.message;}};
 button(box,'Valider et utiliser',validate);button(box,'Exporter JSON',()=>download(label+'.json',JSON.parse(text.value)));const input=el('input',undefined,box);input.type='file';input.accept='.json,application/json';input.hidden=true;input.onchange=async()=>{try{const f=input.files[0];if(!f)return;if(f.size>1000000)throw Error('Maximum 1 Mo');text.value=await f.text();status.textContent='Fichier chargé dans l’éditeur. Valide-le pour l’appliquer.';}catch(e){status.textContent=e.message;}finally{input.value='';}};button(box,'Importer JSON',()=>input.click());return text;
}
let status;
async function install(){
 const lab=window.roundCircleLab,{sim,designer}=lab,stage=$('#stage');
 function tab(id,title){const b=el('button',title,$('aside nav'));b.dataset.tab=id;const panel=el('section',undefined,$('aside'));panel.id=id;panel.className='tab';$('aside').insertBefore(panel,$('.panel-foot'));b.onclick=()=>{document.querySelectorAll('aside nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('aside .tab').forEach(x=>x.classList.toggle('active',x===panel));};return panel;}
 const bonusTab=tab('bonuses','Bonus'),dialogueTab=tab('dialogues','Dialogue');
 status=el('p','',dialogueTab);status.setAttribute('role','status');
 const {Rewards,seed,effects,validate}=RoundCircleRewards;
 let catalog=seed;try{const saved=localStorage.getItem('round-circle-bonuses-v2'),legacy=localStorage.getItem('round-circle-bonuses-v1');if(saved)catalog=validate(JSON.parse(saved));else if(legacy){catalog=RoundCircleRewards.migrateCatalog(JSON.parse(legacy));localStorage.setItem('round-circle-bonuses-v2',JSON.stringify(catalog));}}catch{}
 const rewards=new Rewards(sim,{catalog});
 const shelf=el('div',undefined,stage);shelf.className='artifact-shelf';shelf.setAttribute('aria-label','Artefacts de cette partie');
 const overlay=el('div',undefined,stage);overlay.className='reward-overlay';overlay.hidden=true;
 const panel=el('section',undefined,overlay);panel.className='reward-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','reward-title');
 el('span','LE QUARTIER VOUS DOIT QUELQUE CHOSE',panel).className='reward-eyebrow';
 const heading=el('h2','Choisis ton avantage déloyal.',panel);heading.id='reward-title';
 const subtitle=el('p','',panel),cards=el('div',undefined,panel);cards.className='reward-cards';
 el('p','Un choix. Toute la partie. Les multiplicateurs se cumulent.',panel).className='reward-footnote';
 const bonusSummary=el('p','',bonusTab);bonusSummary.className='feature-summary';
 let dialogEngine=null,view=null,dialogueSpeed=1,lastFocus=null,wasOpen=false,testId=0;
 const dialogueHost=el('div',undefined,stage);
 function renderRewards(){
  const pending=rewards.pending;overlay.hidden=!pending;dialogueHost.style.visibility=pending?'hidden':'';dialogueHost.inert=!!pending;
  shelf.replaceChildren();for(const b of rewards.artifacts){const item=button(shelf,b.icon,()=>{});item.className='artifact';item.setAttribute('aria-label',b.name+' · ×'+b.factor);const tip=el('span',b.name+' · ×'+b.factor+'\n'+effects[b.effect]+' : ×'+sim.multiplier(b.effect).toLocaleString('fr-CA'),item);tip.className='artifact-tip';}
  bonusSummary.textContent=rewards.artifacts.length+' artefacts · '+Object.entries(sim.bonuses).map(([k,v])=>effects[k]+' ×'+v.toLocaleString('fr-CA')).join(' · ');
  if(!pending){if(wasOpen){wasOpen=false;if(dialogEngine?.active)dialogueHost.querySelector('button')?.focus();else lastFocus?.focus();}return;}
  if(!wasOpen){lastFocus=document.activeElement;wasOpen=true;}
  subtitle.textContent=(pending.event.test?'Essai de bonus':pending.event.name+' · vague éliminée')+' — combat en pause';cards.replaceChildren();const revision=rewards.revision;
  for(const b of pending.choices){const card=button(cards,'',()=>rewards.choose(b.id,revision));card.className='reward-card';el('span',b.icon,card).className='reward-icon';el('strong',b.name,card);el('span','×'+b.factor,card).className='reward-factor';el('span',effects[b.effect]+' ×'+b.factor,card);el('p',b.description,card);el('small','Cumul : ×'+sim.multiplier(b.effect).toLocaleString('fr-CA')+' → ×'+Math.min(1000000,sim.multiplier(b.effect)*b.factor).toLocaleString('fr-CA'),card);}
  cards.querySelector('button')?.focus();
 }
 overlay.addEventListener('keydown',e=>{if(e.key==='Tab'){const buttons=[...cards.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?2:1))%3]?.focus();}});
 rewards.onChange=renderRewards;
 designer.runner.onWaveComplete=e=>{if(sim.train.hp>0)rewards.offer(e);};designer.runner.isBlocked=()=>!!rewards.pending;
 const previousReset=sim.onReset;sim.onReset=()=>{previousReset?.();dialogEngine?.reset();rewards.reset();};
 el('h2','Des bonus franchement cassés',bonusTab);
 el('p','Les bonus affectent les unités actuelles et futures. ×2 puis ×2 = ×4. Les stats de base restent intactes. Start efface les artefacts. Plafond de laboratoire : ×1 000 000 ; cadence maximale : un tir par pas de simulation ; la limite de population reste active.',bonusTab);
 const enabled=select(bonusTab,'Après chaque vague',[['yes','Proposer 3 bonus'],['no','Désactivé']], 'yes');enabled.onchange=()=>rewards.enabled=enabled.value==='yes';
 button(bonusTab,'Tester un choix de 3 bonus',()=>{rewards.offer({id:'test-'+(++testId),name:'Terrain d’essai',test:true});});
 let chosen=select(bonusTab,'Bonus à régler',rewards.catalog.map(b=>[b.id,b.name]),rewards.catalog[0].id);
 const multiplier=numeric(bonusTab,'Multiplicateur',rewards.catalog[0].factor,1.25,10,.25);
 chosen.onchange=()=>multiplier.value=rewards.catalog.find(b=>b.id===chosen.value).factor;
 const saveCatalog=data=>{const valid=validate(data);localStorage.setItem('round-circle-bonuses-v2',JSON.stringify(valid));rewards.catalog=valid;chosen.replaceChildren();for(const b of valid){const o=el('option',b.name,chosen);o.value=b.id;}chosen.onchange();};
 button(bonusTab,'Enregistrer le multiplicateur',()=>{const id=chosen.value;saveCatalog(rewards.catalog.map(b=>b.id===id?{...b,factor:Number(multiplier.value)}:b));bonusEditor.value=JSON.stringify(rewards.catalog,null,2);bonusSummary.textContent='Catalogue enregistré. Les prochains tirages utiliseront ces valeurs.';});
 const bonusEditor=jsonWorkshop(bonusTab,'Catalogue de bonus',()=>rewards.catalog,saveCatalog);
 el('p','Pour créer un bonus : ajouter un objet au catalogue avec un ID unique, un nom, une description, une icône, un effet et un multiplicateur. Effets : '+Object.keys(effects).join(', ')+'. Les tirages en cours gardent leurs valeurs.',bonusTab);
 el('h2','Rencontres au bord du cercle',dialogueTab);
 el('p','Une voix à la fois, des réponses et des conséquences narratives. Les résultats sont consignés ci-dessous ; aucun bonus de combat implicite.',dialogueTab);
 const speed=select(dialogueTab,'Pendant un dialogue',[['1','Normal'],['0.15','Ralenti ×0,15'],['0','Pause']], '1');speed.onchange=()=>dialogueSpeed=Number(speed.value);
 const trigger=select(dialogueTab,'Déclenchement automatique',[['radius','Au rayon du vortex'],['wave','Après une vague éliminée'],['manual','Manuel uniquement']], 'radius');
 const threshold=numeric(dialogueTab,'Seuil de déclenchement',2,.2,100,.1);let autoFired=false;
 const effectsLog=el('div',undefined,dialogueTab);effectsLog.className='narrative-log';effectsLog.setAttribute('aria-live','polite');
 let library,storySelect,nodeSelect,loadRevision=0;
 function triggerDialogue(){if(!autoFired&&dialogEngine&&storySelect){autoFired=true;dialogEngine.enqueue(storySelect.value,'configured-trigger');if(rewards.pending)renderRewards();}}
 const controller={rewards,get dialogue(){return dialogEngine;},timeScale(){if(rewards.pending)return 0;if(trigger.value==='radius'&&sim.cfg.vortexRadius>=Number(threshold.value))triggerDialogue();return dialogEngine?.active?dialogueSpeed:1;},event(e){if(e.type==='wave-complete'&&trigger.value==='wave'&&e.number>=Number(threshold.value))triggerDialogue();}};
 lab.features=controller;
 const reset=sim.onReset;sim.onReset=()=>{reset();autoFired=false;effectsLog.replaceChildren();};
 async function useLibrary(data){const valid=validateLibrary(data),revision=++loadRevision;await preloadAssets(valid,'dialogue/');if(revision!==loadRevision)return;view?.destroy();library=valid;dialogEngine=new DialogueEngine(valid,{onEffect:e=>{el('p',e.name+' : '+JSON.stringify(e.payload),effectsLog);},onError:e=>status.textContent=e.message});view=new DialogueView(dialogueHost,dialogEngine,{assetBase:'dialogue/',lettersPerSecond:45});autoFired=false;if(storySelect){storySelect.replaceChildren();for(const d of valid.dialogues){const o=el('option',d.title||d.id,storySelect);o.value=d.id;}renderNodes();}renderRewards();}
 function renderNodes(){nodeSelect.replaceChildren();const story=library.dialogues.find(d=>d.id===storySelect.value);for(const id of Object.keys(story.nodes)){const o=el('option',id,nodeSelect);o.value=id;}nodeSelect.value=story.start;}
 try{
  const response=await fetch('dialogue/data/dialogues.json',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Bibliothèque introuvable');await useLibrary(await response.json());
  storySelect=select(dialogueTab,'Dialogue',library.dialogues.map(d=>[d.id,d.title||d.id]),library.dialogues[0].id);
  nodeSelect=select(dialogueTab,'Nœud de départ',[], '');renderNodes();storySelect.onchange=renderNodes;
  button(dialogueTab,'Lancer la rencontre',()=>{dialogEngine.cancel();dialogEngine.start(storySelect.value);renderRewards();});
  button(dialogueTab,'Tester ce nœud',()=>{dialogEngine.cancel();dialogEngine.start(storySelect.value,nodeSelect.value);renderRewards();});
  button(dialogueTab,'Fermer le dialogue',()=>dialogEngine.cancel());
  button(dialogueTab,'Réarmer les rencontres',()=>{dialogEngine.reset();autoFired=false;effectsLog.replaceChildren();});
  jsonWorkshop(dialogueTab,'Bibliothèque de dialogues',()=>library,useLibrary);
  status.textContent='Kit chargé · 6 portraits · rencontre prête. Échap révèle le texte ; Tab navigue entre les réponses.';
 }catch(e){status.textContent='Dialogue indisponible : '+e.message+' Le jeu et les bonus restent disponibles.';}
 renderRewards();
}
if(!window.roundCircleLab)await new Promise(resolve=>window.addEventListener('round-circle-ready',resolve,{once:true}));
install().catch(e=>{console.error(e);if(status)status.textContent='Erreur des ateliers : '+e.message;});
