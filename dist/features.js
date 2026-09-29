import {DialogueEngine,validateLibrary} from './dialogue/src/dialogue-core.js?v=042';
import {DialogueView,preloadAssets} from './dialogue/src/dialogue-view.js?v=042';

const $=s=>document.querySelector(s);
const el=(tag,text,parent)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;parent?.append(node);return node;};
function button(parent,text,fn){const b=el('button',text,parent);b.type='button';b.onclick=async()=>{try{await fn();}catch(e){status.textContent=e.message;const message=el('p',e.message,parent);message.setAttribute('role','alert');}};return b;}
function select(parent,label,items,value){const row=el('label',label,parent),s=el('select',undefined,row);s.setAttribute('aria-label',label);for(const [value,text] of items){const o=el('option',text,s);o.value=value;}s.value=value;return s;}
function numeric(parent,label,value,min,max,step=1){const row=el('label',label,parent),n=el('input',undefined,row);Object.assign(n,{type:'number',value,min,max,step});n.setAttribute('aria-label',label);return n;}
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function jsonWorkshop(parent,label,getData,apply){const box=el('details',undefined,parent);el('summary',label,box);const text=el('textarea',undefined,box);text.value=JSON.stringify(getData(),null,2);text.setAttribute('aria-label',label);text.spellcheck=false;
 const feedback=el('p','',box);feedback.setAttribute('role','status');
 const validate=async()=>{try{if(text.value.length>1000000)throw Error('Maximum 1 MB');await apply(JSON.parse(text.value));feedback.textContent='Library validated and applied.';}catch(e){feedback.textContent='Import rejected: '+e.message;}};
 button(box,'Validate and apply',validate);button(box,'Export JSON',()=>download(label+'.json',JSON.parse(text.value)));const input=el('input',undefined,box);input.type='file';input.accept='.json,application/json';input.hidden=true;input.onchange=async()=>{try{const f=input.files[0];if(!f)return;if(f.size>1000000)throw Error('Maximum 1 MB');text.value=await f.text();status.textContent='File loaded in the editor. Validate it to apply.';}catch(e){status.textContent=e.message;}finally{input.value='';}};button(box,'Import JSON',()=>input.click());return text;
}
let status;
async function install(){
 const lab=window.roundCircleLab,{sim,designer}=lab,stage=$('#stage'),saved=lab.startupSettings?.features;let activeRun=lab.runProfile||null;
 function tab(id,title){const b=el('button',title,$('aside nav'));b.dataset.tab=id;const panel=el('section',undefined,$('aside'));panel.id=id;panel.className='tab';$('aside').insertBefore(panel,$('.panel-foot'));b.onclick=()=>{document.querySelectorAll('aside nav button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('aside .tab').forEach(x=>x.classList.toggle('active',x===panel));};return panel;}
 const bonusTab=tab('bonuses','Bonus'),dialogueTab=tab('dialogues','Dialogue');
 status=el('p','',dialogueTab);status.setAttribute('role','status');
 const {Rewards,seed,effects,validate}=RoundCircleRewards;
 let catalog=seed;try{const saved=localStorage.getItem('round-circle-bonuses-v2'),legacy=localStorage.getItem('round-circle-bonuses-v1');if(saved)catalog=validate(JSON.parse(saved));else if(legacy){catalog=RoundCircleRewards.migrateCatalog(JSON.parse(legacy));localStorage.setItem('round-circle-bonuses-v2',JSON.stringify(catalog));}}catch{}
 if(saved?.catalog)catalog=validate(saved.catalog);let gymCatalog=catalog;const rewards=new Rewards(sim,{catalog:activeRun?.bonuses.catalog||catalog});
 const shelf=el('div',undefined,stage);shelf.className='artifact-shelf';shelf.setAttribute('aria-label','Artifacts from this run');
 const overlay=el('div',undefined,stage);overlay.className='reward-overlay';overlay.hidden=true;
 const panel=el('section',undefined,overlay);panel.className='reward-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','reward-title');
 el('span','THE NEIGHBOURHOOD OWES YOU SOMETHING',panel).className='reward-eyebrow';
 const heading=el('h2','Choose your unfair advantage.',panel);heading.id='reward-title';
 const subtitle=el('p','',panel),cards=el('div',undefined,panel);cards.className='reward-cards';
 el('p','One choice. The whole run. Each card previews your new total.',panel).className='reward-footnote';
 const bonusSummary=el('p','',bonusTab);bonusSummary.className='feature-summary';
 let dialogEngine=null,view=null,dialogueSpeed=0,lastFocus=null,wasOpen=false,testId=0;
 const dialogueHost=el('div',undefined,stage);
 function renderRewards(){
  const pending=dialogEngine?.active?null:rewards.pending;overlay.hidden=!pending;dialogueHost.style.visibility='';dialogueHost.inert=false;
  shelf.replaceChildren();const grouped=new Map();for(const b of rewards.artifacts){const group=grouped.get(b.id)||{...b,count:0};group.count++;grouped.set(b.id,group);}for(const b of grouped.values()){const description=b.name+' · '+b.count+' collected\n'+effects[b.effect]+' : ×'+sim.multiplier(b.effect).toLocaleString('en-CA')+'\n'+b.description;const show=()=>window.roundCircleHud?.showArtifact(description);const item=button(shelf,b.icon,show);item.className='artifact';item.setAttribute('aria-label',description);item.setAttribute('aria-describedby','artifactDetails');item.onpointerenter=show;item.onfocus=show;item.onpointerleave=()=>window.roundCircleHud?.hideArtifact();item.onblur=()=>window.roundCircleHud?.hideArtifact();if(b.count>1)el('small','×'+b.count,item);}
  bonusSummary.textContent=rewards.artifacts.length+' artifacts · '+Object.entries(sim.bonuses).map(([k,v])=>effects[k]+' ×'+v.toLocaleString('en-CA')).join(' · ');
  if(!pending){if(wasOpen){wasOpen=false;if(dialogEngine?.active)dialogueHost.querySelector('button')?.focus();else lastFocus?.focus();}return;}
  if(!wasOpen){lastFocus=document.activeElement;wasOpen=true;}
  subtitle.textContent=(pending.event.test?'Bonus preview':pending.event.name+' · wave cleared')+' — combat paused';cards.replaceChildren();const revision=rewards.revision;
  for(const b of pending.choices){const card=button(cards,'',()=>rewards.choose(b.id,revision));card.className='reward-card';el('span',b.icon,card).className='reward-icon';el('strong',b.name,card);el('span',window.RoundCircleSimulation.bonusLabel(b.effect,b.factor),card).className='reward-factor';el('span',effects[b.effect]+' '+window.RoundCircleSimulation.bonusLabel(b.effect,b.factor),card);el('p',b.description,card);el('small','Total: ×'+sim.multiplier(b.effect).toLocaleString('en-CA')+' → ×'+sim.previewBonus(b.effect,b.factor).toLocaleString('en-CA'),card);}
  cards.querySelector('button')?.focus();
 }
 overlay.addEventListener('keydown',e=>{if(e.key==='Tab'){const buttons=[...cards.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?2:1))%3]?.focus();}});
 rewards.onChange=renderRewards;
 designer.runner.onWaveComplete=e=>{if(sim.train.hp>0)rewards.offer(e);};designer.runner.isBlocked=()=>!!rewards.pending;
 const previousReset=sim.onReset;sim.onReset=()=>{previousReset?.();dialogEngine?.reset();rewards.reset();};
 el('h2','Delightfully broken bonuses',bonusTab);
 el('p','Bonuses affect current and future units. Soldier and house bonuses multiply: ×2 then ×2 = ×4. Convoy health, cannon and collision bonuses add their base increase: +100% then +100% = ×3 total. Base stats remain intact. Start clears artifacts. Laboratory cap: ×1,000,000; maximum fire rate: one shot per simulation step. The population limit still applies.',bonusTab);
 const enabled=select(bonusTab,'After each wave',[['yes','Offer 3 bonuses'],['no','Disabled']], 'yes');enabled.value=activeRun?activeRun.bonuses.enabled?'yes':'no':saved?.rewardsEnabled===false?'no':'yes';rewards.enabled=enabled.value==='yes';enabled.onchange=()=>rewards.enabled=enabled.value==='yes';
 button(bonusTab,'Preview three bonus choices',()=>{rewards.offer({id:'test-'+(++testId),name:'Testing ground',test:true});});
 let chosen=select(bonusTab,'Bonus to configure',rewards.catalog.map(b=>[b.id,b.name]),rewards.catalog[0].id);
 const multiplier=numeric(bonusTab,'Multiplier',rewards.catalog[0].factor,1.1,10,.05);
 chosen.onchange=()=>multiplier.value=rewards.catalog.find(b=>b.id===chosen.value).factor;
 const saveCatalog=data=>{const valid=validate(data);localStorage.setItem('round-circle-bonuses-v2',JSON.stringify(valid));rewards.catalog=valid;chosen.replaceChildren();for(const b of valid){const o=el('option',b.name,chosen);o.value=b.id;}chosen.onchange();};
 button(bonusTab,'Save multiplier',()=>{const id=chosen.value;saveCatalog(rewards.catalog.map(b=>b.id===id?{...b,factor:Number(multiplier.value)}:b));bonusEditor.value=JSON.stringify(rewards.catalog,null,2);bonusSummary.textContent='Catalog saved. Future offers will use these values.';});
 const bonusEditor=jsonWorkshop(bonusTab,'Bonus catalog',()=>rewards.catalog,saveCatalog);
 el('p','To create a bonus, add an entry with a unique ID, name, description, icon, effect and multiplier. Effects: '+Object.keys(effects).join(', ')+'. Current offers retain their values.',bonusTab);
 el('h2','Encounters at the edge',dialogueTab);
 el('p','One voice at a time, with responses and narrative consequences. Results are recorded below; there are no hidden combat bonuses.',dialogueTab);
 el('p','Dialogue pauses the game. Finish the encounter to return to the laboratory.',dialogueTab);
 const trigger=select(dialogueTab,'Automatic trigger',[['radius','At vortex radius'],['wave','After a wave is cleared'],['manual','Manual only']], 'radius');
 const threshold=numeric(dialogueTab,'Trigger threshold',2,.2,100,.1);let autoFired=false;
 const effectsLog=el('div',undefined,dialogueTab);effectsLog.className='narrative-log';effectsLog.setAttribute('aria-live','polite');
 let library,gymLibrary,storySelect,nodeSelect,loadRevision=0;
 function triggerDialogue(){if(!autoFired&&dialogEngine&&storySelect){autoFired=true;dialogEngine.enqueue(storySelect.value,'configured-trigger');if(rewards.pending)renderRewards();}}
 function triggerCues(){if(!activeRun||!dialogEngine)return;for(const cue of activeRun.dialogue.cues)if(sim.cfg.vortexRadius+1e-9>=cue.radius)dialogEngine.enqueue(cue.dialogueId,cue.id);}
 const controller={rewards,get dialogue(){return dialogEngine;},get modalActive(){return !!dialogEngine?.active||!!rewards.pending;},timeScale(){if(dialogEngine?.active)return 0;if(rewards.pending)return 0;if(activeRun)triggerCues();else if(trigger.value==='radius'&&sim.cfg.vortexRadius>=Number(threshold.value))triggerDialogue();return dialogEngine?.active?0:1;},event(e){if(!activeRun&&e.type==='wave-complete'&&trigger.value==='wave'&&e.number>=Number(threshold.value))triggerDialogue();}};
 lab.features=controller;
 const reset=sim.onReset;sim.onReset=()=>{reset();autoFired=false;effectsLog.replaceChildren();};
 async function useLibrary(data){const valid=validateLibrary(data),revision=++loadRevision;await preloadAssets(valid,'dialogue/');if(revision!==loadRevision)return;view?.destroy();library=valid;dialogEngine=new DialogueEngine(valid,{onEffect:e=>{el('p',e.name+' : '+JSON.stringify(e.payload),effectsLog);},onError:e=>status.textContent=e.message});dialogueHost.classList.remove('ambient');view=new DialogueView(dialogueHost,dialogEngine,{assetBase:'dialogue/',lettersPerSecond:45,autoAdvanceMs:0});const renderDialogue=dialogEngine.onChange;dialogEngine.onChange=state=>{renderDialogue(state);window.roundCircleAudio?.dialogue(state);renderRewards();};autoFired=false;if(storySelect){storySelect.replaceChildren();for(const d of valid.dialogues){const o=el('option',d.title||d.id,storySelect);o.value=d.id;}renderNodes();}renderRewards();}
 function renderNodes(){nodeSelect.replaceChildren();const story=library.dialogues.find(d=>d.id===storySelect.value);for(const id of Object.keys(story.nodes)){const o=el('option',id,nodeSelect);o.value=id;}nodeSelect.value=story.start;}
 try{
  const response=await fetch('dialogue/data/dialogues.json',{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Library not found');gymLibrary=saved?.library||await response.json();await useLibrary(activeRun?.dialogue.library||gymLibrary);
  storySelect=select(dialogueTab,'Dialogue',library.dialogues.map(d=>[d.id,d.title||d.id]),library.dialogues[0].id);
  nodeSelect=select(dialogueTab,'Starting node',[], '');renderNodes();storySelect.onchange=renderNodes;
  button(dialogueTab,'Start encounter',()=>{dialogEngine.cancel();dialogEngine.start(storySelect.value);renderRewards();});
  button(dialogueTab,'Test this node',()=>{dialogEngine.cancel();dialogEngine.start(storySelect.value,nodeSelect.value);renderRewards();});

  button(dialogueTab,'Reset encounters',()=>{dialogEngine.reset();autoFired=false;effectsLog.replaceChildren();});
  const dialogueEditor=jsonWorkshop(dialogueTab,'Dialogue library',()=>library,useLibrary);if(saved?.dialogueEditor)dialogueEditor.value=saved.dialogueEditor;controller.dialogueEditor=dialogueEditor;
  status.textContent='Ready · 6 portraits loaded. Escape reveals the text; Tab moves between responses.';
 }catch(e){status.textContent='Dialogue unavailable: '+e.message+' The game and bonuses remain available.';}
 if(saved){if(['radius','wave','manual'].includes(saved.trigger))trigger.value=saved.trigger;if(Number.isFinite(saved.threshold))threshold.value=saved.threshold;if(storySelect&&library.dialogues.some(d=>d.id===saved.story)){storySelect.value=saved.story;renderNodes();if([...nodeSelect.options].some(o=>o.value===saved.node))nodeSelect.value=saved.node;}if(saved.bonusEditor)bonusEditor.value=saved.bonusEditor;if(rewards.catalog.some(b=>b.id===saved.chosenBonus))chosen.value=saved.chosenBonus;if(Number.isFinite(saved.bonusMultiplier))multiplier.value=saved.bonusMultiplier;}
 controller.setRunProfile=async profile=>{if(!activeRun){gymCatalog=rewards.catalog;gymLibrary=library;}const previous=activeRun;activeRun=profile||null;const source=activeRun?activeRun.dialogue.library:gymLibrary;if(previous?.id!==activeRun?.id)await useLibrary(source);dialogueHost.classList.remove('ambient');rewards.catalog=validate(activeRun?.bonuses.catalog||gymCatalog);rewards.enabled=activeRun?activeRun.bonuses.enabled:saved?.rewardsEnabled!==false;enabled.value=rewards.enabled?'yes':'no';chosen.replaceChildren();for(const bonus of rewards.catalog){const option=el('option',bonus.name,chosen);option.value=bonus.id;}chosen.onchange();bonusEditor.value=JSON.stringify(rewards.catalog,null,2);for(const field of [trigger,threshold])field.closest('label').hidden=!!activeRun;status.textContent=activeRun?'Witness run · three encounters triggered by vortex radius. Read at your own pace while the game is paused. Bonus offers wait until the encounter ends.':'Free play · configurable encounters.';renderRewards();};
 for(const field of [trigger,threshold])field.closest('label').hidden=!!activeRun;
 controller.captureSettings=()=>({catalog:rewards.catalog,rewardsEnabled:rewards.enabled,dialogueSpeed,trigger:trigger.value,threshold:Number(threshold.value),library,story:storySelect?.value,node:nodeSelect?.value,bonusEditor:bonusEditor.value,dialogueEditor:controller.dialogueEditor?.value,chosenBonus:chosen.value,bonusMultiplier:Number(multiplier.value)});
 renderRewards();
}
if(!window.roundCircleLab)await new Promise(resolve=>window.addEventListener('round-circle-ready',resolve,{once:true}));
window.roundCircleFeaturesReady=install().catch(e=>{console.error(e);if(status)status.textContent='Workshop error: '+e.message;}).finally(()=>window.dispatchEvent(new Event('round-circle-features-ready')));
