(function(root){
'use strict';
const cues={
 ui:{label:'Clic / confirmation',file:'ui.wav',gap:.09,hz:720,duration:.055},
 shot:{label:'Tir',file:'shot.wav',gap:.12,hz:330,duration:.09},
 impact:{label:'Impact / collision',file:'impact.wav',gap:.16,hz:100,duration:.14},
 death:{label:'Mort / destruction',file:'death.wav',gap:.25,hz:150,duration:.28},
 spawn:{label:'Apparition / production',file:'spawn.wav',gap:.35,hz:480,duration:.16},
 wave:{label:'Début de vague',file:'wave.wav',gap:1,hz:210,duration:.5},
 reward:{label:'Récompense / bonus',file:'reward.wav',gap:.3,hz:660,duration:.4},
 dialogue:{label:'Réplique / réponse',file:'dialogue.wav',gap:.15,hz:400,duration:.085}
};
function cueFor(e){if(e.type==='shot')return 'shot';if(['hit','ram'].includes(e.type))return 'impact';if(e.type==='death')return 'death';if(['spawn','born','board','building-born','wagon-born','training-complete'].includes(e.type))return 'spawn';if(e.type==='wave-launched')return 'wave';if(['wave-complete','reward-chosen'].includes(e.type))return 'reward';return null;}
class Gate{
 constructor(){this.last={};this.recent=[];}
 allow(id,time){if(!cues[id]||time-(this.last[id]??-Infinity)<cues[id].gap)return false;this.recent=this.recent.filter(t=>time-t<.1);if(this.recent.length>=4)return false;this.last[id]=time;this.recent.push(time);return true;}
}
const defaultFiles={"ui":"select_1","shot":"laser_1","impact":"hurt_1","death":"soft_destruction","spawn":"bubble","wave":"siren","reward":"collect_1","dialogue":"note_C"};
function mixSettings(saved={}){return Object.fromEntries(Object.keys(cues).map(id=>[id,{file:typeof saved[id]?.file==='string'?saved[id].file:'arcade/'+defaultFiles[id]+'.wav',volume:Number.isFinite(saved[id]?.volume)?Math.max(0,Math.min(1,saved[id].volume)):.5}]));}
// Quadratic taper gives fine control at low volume; full scale is capped at half gain.
function musicGain(value){const level=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;return .5*level*level;}
function install(){
 const music=new Audio('assets/audio/fortress-of-bone.mp3');music.loop=true;music.preload='none';music.id='backgroundMusic';music.hidden=true;document.body.append(music);
 let settings={enabled:true,musicEnabled:true,effectsEnabled:true,music:.08,effects:.08,volumeVersion:2};try{const saved=JSON.parse(localStorage.getItem('round-circle-audio-v1'));if(saved){settings.enabled=saved.enabled!==false;settings.musicEnabled=saved.musicEnabled!==false;settings.effectsEnabled=saved.effectsEnabled===true;for(const k of ['music','effects'])if(saved.volumeVersion===2&&Number.isFinite(saved[k]))settings[k]=Math.max(0,Math.min(1,saved[k]));}}catch{}
 let mix=mixSettings();try{mix=mixSettings(JSON.parse(localStorage.getItem('round-circle-mix-v1'))||{});}catch{}const files=root.RoundCircleSoundFiles||[];for(const id in mix)if(!files.some(f=>f.file===mix[id].file))mix[id].file=cues[id].file;
 let ctx=null,bus=null,unlocked=false,duck=false;const buffers={},pending={},active=new Set(),gate=new Gate();
 const box=document.createElement('details');box.id='audioSettings';box.open=true;box.innerHTML='<summary>Musique et sons</summary><p>Fortress of Bone · musique en boucle. Huit effets réutilisés, avec fichier et volume au choix.</p>';
 document.querySelector('#play').prepend(box);
 const toggle=document.createElement('button');toggle.type='button';box.append(toggle);
 const switches={};for(const [key,title] of [['musicEnabled','Musique'],['effectsEnabled','Effets sonores']]){const row=document.createElement('label');row.textContent=title;const input=document.createElement('input');input.type='checkbox';input.checked=settings[key];input.setAttribute('aria-label',title);switches[key]=input;input.onchange=async()=>{settings[key]=input.checked;if(!settings.effectsEnabled)for(const node of active)try{node.stop();}catch{}if(input.checked){settings.enabled=true;await unlock();}else await playMusic();save();sync();};row.append(input);box.append(row);}
 const status=document.createElement('p');status.setAttribute('role','status');box.append(status);
 const quick=document.createElement('button');quick.type='button';quick.style.pointerEvents='auto';document.querySelector('#stage footer').append(quick);
 function save(){try{localStorage.setItem('round-circle-audio-v1',JSON.stringify(settings));}catch{}}
 function sync(){for(const key in switches)switches[key].checked=settings[key];music.volume=musicGain(settings.music)*(duck?.35:1);if(bus)bus.gain.setTargetAtTime(settings.effects,ctx.currentTime,.03);const label=settings.enabled&&unlocked?'Couper le son':'Activer le son';toggle.textContent=quick.textContent=label;toggle.setAttribute('aria-pressed',String(settings.enabled&&unlocked));quick.setAttribute('aria-pressed',String(settings.enabled&&unlocked));}
 async function playMusic(){if(!settings.enabled||!settings.musicEnabled||!unlocked||document.hidden||settings.music===0){music.pause();status.textContent=settings.enabled&&settings.effectsEnabled?'Effets actifs · musique coupée.':'Audio coupé.';return;}try{await music.play();status.textContent=settings.effectsEnabled?'Musique et effets actifs.':'Musique active · effets coupés.';}catch{status.textContent='Lecture bloquée : clique sur Activer le son pour réessayer.';}}
 function loadFile(file){if(buffers[file])return Promise.resolve(buffers[file]);if(pending[file])return pending[file];return pending[file]=(async()=>{try{const response=await fetch('assets/audio/'+file);if(!response.ok)throw Error();return buffers[file]=await ctx.decodeAudioData(await response.arrayBuffer());}catch{status.textContent='Impossible de charger '+file;return null;}finally{delete pending[file];}})();}
 function load(){return Promise.all(Object.values(mix).map(m=>loadFile(m.file)));}
 async function unlock(){try{if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();bus=ctx.createGain();bus.connect(ctx.destination);}unlocked=true;sync();const playing=playMusic();await ctx.resume();if(settings.effectsEnabled)void load();await playing;}catch{status.textContent='Audio indisponible dans ce navigateur.';}}
 async function change(){if(settings.enabled&&unlocked){settings.enabled=false;music.pause();for(const node of active)try{node.stop();}catch{}}else{settings.enabled=true;await unlock();}save();sync();}
 toggle.onclick=quick.onclick=change;
 for(const [key,title] of [['music','Volume musique'],['effects','Volume effets']]){const row=document.createElement('label');row.textContent=title;const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=1;slider.step=.01;slider.value=settings[key];slider.setAttribute('aria-label',title);const value=document.createElement('output');value.textContent=Math.round(settings[key]*100)+' %';slider.oninput=()=>{value.textContent=Math.round(Number(slider.value)*100)+' %';settings[key]=Number(slider.value);if(settings[key]>0){settings.enabled=true;if(key==='music')settings.musicEnabled=true;else settings.effectsEnabled=true;void unlock();}save();sync();if(key==='music')void playMusic();};row.append(slider,value);box.append(row);}
 let previewNode=null;
 function sound(id,preview=false){if(!unlocked||document.hidden||ctx.state!=='running'||(!preview&&(!settings.enabled||!settings.effectsEnabled||settings.effects===0||active.size>=12||!gate.allow(id,ctx.currentTime))))return;
  const config=mix[id],buffer=buffers[config.file];if(!buffer){void loadFile(config.file);return;}if(preview&&previewNode)try{previewNode.stop();}catch{}
  const node=ctx.createBufferSource(),gain=ctx.createGain();node.buffer=buffer;gain.gain.value=.55*config.volume*(preview?.25:1);gain.connect(preview?ctx.destination:bus);node.connect(gain);
  if(preview){previewNode=node;status.textContent='Préécoute : '+cues[id].label+' · '+Math.round(config.volume*100)+' %';}active.add(node);node.onended=()=>{active.delete(node);if(previewNode===node)previewNode=null;node.disconnect();gain.disconnect();};node.start();
 }
 const editor=document.createElement('details');editor.innerHTML='<summary>Régler chaque son</summary><p>Choisis un fichier, règle son volume puis utilise ▶. La préécoute fonctionne même si les effets du jeu sont coupés.</p>';box.append(editor);
 function saveMix(){try{localStorage.setItem('round-circle-mix-v1',JSON.stringify(mix));}catch{}}
 for(const [id,c] of Object.entries(cues)){
  const row=document.createElement('fieldset');row.style.cssText='margin:12px 0;padding:10px;border:1px solid #ffffff25;border-radius:5px;min-width:0';const title=document.createElement('legend');title.textContent=c.label;row.append(title);
  const select=document.createElement('select');select.setAttribute('aria-label','Fichier · '+c.label);select.style.cssText='width:100%;max-width:100%';
  for(const f of [{file:c.file,label:'Son initial'},...files]){const option=document.createElement('option');option.value=f.file;option.textContent=f.label;select.append(option);}select.value=mix[id].file;
  select.onchange=()=>{mix[id].file=select.value;saveMix();if(ctx)void loadFile(select.value);};row.append(select);
  const label=document.createElement('label'),volume=document.createElement('input'),value=document.createElement('output');volume.type='range';volume.min=0;volume.max=1;volume.step=.01;volume.value=mix[id].volume;volume.setAttribute('aria-label','Volume · '+c.label);value.textContent=Math.round(mix[id].volume*100)+' %';volume.oninput=()=>{mix[id].volume=Number(volume.value);value.textContent=Math.round(mix[id].volume*100)+' %';saveMix();};label.append(volume,value);row.append(label);
  const button=document.createElement('button');button.type='button';button.textContent='▶';button.setAttribute('aria-label','Écouter · '+c.label);button.onclick=async()=>{button.disabled=true;try{if(mix[id].volume===0){status.textContent='Volume individuel à 0 % : augmente-le pour écouter ce son.';return;}await unlock();const selected=mix[id].file;const buffer=await loadFile(selected);if(buffer&&mix[id].file===selected)sound(id,true);}finally{button.disabled=false;}};row.append(button);editor.append(row);
 }
 document.querySelector('#world')?.addEventListener('pointerdown',e=>{if(e.isTrusted&&!unlocked&&settings.enabled)void unlock();});
 document.addEventListener('click',e=>{if(!e.isTrusted)return;const button=e.target.closest('button');if(!button||box.contains(button)||button===quick)return;if(!unlocked&&settings.enabled)void unlock();if(!button.closest('.reward-card,.dialogue-host,[role="dialog"]'))sound('ui');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){music.pause();ctx?.suspend();}else if(unlocked&&settings.enabled){ctx?.resume().then(()=>playMusic()).catch(()=>{});}});
 music.addEventListener('error',()=>{status.textContent='La musique ne peut pas être chargée.';});
 root.roundCircleAudio={applySettings(values){if(!values)return;for(const key of ['music','effects']){if(Number.isFinite(values[key]))settings[key]=Math.max(0,Math.min(1,values[key]));const slider=box.querySelector('input[aria-label="Volume '+(key==='music'?'musique':'effets')+'"]');if(slider){slider.value=settings[key];slider.nextElementSibling.textContent=Math.round(settings[key]*100)+' %';}}sync();void playMusic();},captureSettings:()=>({settings:{...settings},mix:JSON.parse(JSON.stringify(mix))}),event(e){const id=cueFor(e);if(id)sound(id);},dialogue(state){duck=!!state;sync();if(state)sound('dialogue');}};
 status.textContent='Clique sur Activer le son. Les volumes à 0 % restent silencieux.';sync();
}
root.RoundCircleAudio={cues,cueFor,Gate,mixSettings,musicGain};
if(typeof module!=='undefined')module.exports=root.RoundCircleAudio;
if(typeof window!=='undefined'){if(root.roundCircleLab)install();else window.addEventListener('round-circle-ready',install,{once:true});}
})(typeof window!=='undefined'?window:globalThis);
