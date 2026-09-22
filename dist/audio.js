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
function cueFor(e){if(e.type==='shot')return 'shot';if(['hit','ram'].includes(e.type))return 'impact';if(e.type==='death')return 'death';if(['spawn','born','board','building-born','wagon-born'].includes(e.type))return 'spawn';if(e.type==='wave-launched')return 'wave';if(['wave-complete','reward-chosen'].includes(e.type))return 'reward';return null;}
class Gate{
 constructor(){this.last={};this.recent=[];}
 allow(id,time){if(!cues[id]||time-(this.last[id]??-Infinity)<cues[id].gap)return false;this.recent=this.recent.filter(t=>time-t<.1);if(this.recent.length>=4)return false;this.last[id]=time;this.recent.push(time);return true;}
}
function install(){
 const music=new Audio('assets/audio/fortress-of-bone.mp3');music.loop=true;music.preload='none';
 let settings={enabled:true,musicEnabled:true,effectsEnabled:false,music:.28,effects:.25};try{const saved=JSON.parse(localStorage.getItem('round-circle-audio-v1'));if(saved){settings.enabled=saved.enabled!==false;settings.musicEnabled=saved.musicEnabled!==false;settings.effectsEnabled=saved.effectsEnabled===true;for(const k of ['music','effects'])if(Number.isFinite(saved[k]))settings[k]=Math.max(0,Math.min(1,saved[k]));}}catch{}
 let ctx=null,bus=null,unlocked=false,duck=false,loading=null;const buffers={},active=new Set(),gate=new Gate();
 const box=document.createElement('details');box.id='audioSettings';box.innerHTML='<summary>Musique et sons</summary><p>Fortress of Bone · musique en boucle. Huit sons provisoires partagés entre les actions.</p>';
 document.querySelector('#play').prepend(box);
 const toggle=document.createElement('button');toggle.type='button';box.append(toggle);
 const switches={};for(const [key,title] of [['musicEnabled','Musique'],['effectsEnabled','Effets sonores']]){const row=document.createElement('label');row.textContent=title;const input=document.createElement('input');input.type='checkbox';input.checked=settings[key];input.setAttribute('aria-label',title);switches[key]=input;input.onchange=async()=>{settings[key]=input.checked;if(!settings.effectsEnabled)for(const node of active)try{node.stop();}catch{}if(input.checked){settings.enabled=true;await unlock();}else await playMusic();save();sync();};row.append(input);box.append(row);}
 const status=document.createElement('p');status.setAttribute('role','status');box.append(status);
 const quick=document.createElement('button');quick.type='button';quick.style.pointerEvents='auto';document.querySelector('#stage footer').append(quick);
 function save(){try{localStorage.setItem('round-circle-audio-v1',JSON.stringify(settings));}catch{}}
 function sync(){for(const key in switches)switches[key].checked=settings[key];music.volume=settings.music*(duck?.35:1);if(bus)bus.gain.setTargetAtTime(settings.effects,ctx.currentTime,.03);const label=settings.enabled&&unlocked?'Couper le son':'Activer le son';toggle.textContent=quick.textContent=label;toggle.setAttribute('aria-pressed',String(settings.enabled&&unlocked));quick.setAttribute('aria-pressed',String(settings.enabled&&unlocked));}
 async function playMusic(){if(!settings.enabled||!settings.musicEnabled||!unlocked||document.hidden||settings.music===0){music.pause();status.textContent=settings.enabled&&settings.effectsEnabled?'Effets actifs · musique coupée.':'Audio coupé.';return;}try{await music.play();status.textContent=settings.effectsEnabled?'Musique et effets actifs.':'Musique active · effets coupés.';}catch{status.textContent='Lecture bloquée : clique sur Activer le son pour réessayer.';}}
 function load(){if(loading)return loading;loading=Promise.all(Object.entries(cues).map(async([id,c])=>{try{const response=await fetch('assets/audio/'+c.file);if(!response.ok)throw Error();buffers[id]=await ctx.decodeAudioData(await response.arrayBuffer());}catch{status.textContent='Un effet est indisponible ; son provisoire utilisé.';}}));return loading;}
 async function unlock(){try{if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();bus=ctx.createGain();bus.connect(ctx.destination);}await ctx.resume();unlocked=true;sync();if(settings.effectsEnabled)void load();await playMusic();}catch{status.textContent='Audio indisponible dans ce navigateur.';}}
 async function change(){if(settings.enabled&&unlocked){settings.enabled=false;music.pause();for(const node of active)try{node.stop();}catch{}}else{settings.enabled=true;await unlock();}save();sync();}
 toggle.onclick=quick.onclick=change;
 for(const [key,title] of [['music','Volume musique'],['effects','Volume effets']]){const row=document.createElement('label');row.textContent=title;const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=1;slider.step=.01;slider.value=settings[key];slider.setAttribute('aria-label',title);slider.oninput=()=>{settings[key]=Number(slider.value);save();sync();if(key==='music')void playMusic();};row.append(slider);box.append(row);}
 function sound(id){if(!settings.enabled||!settings.effectsEnabled||!unlocked||document.hidden||ctx.state!=='running'||settings.effects===0||active.size>=12||!gate.allow(id,ctx.currentTime))return;let node;const gain=ctx.createGain();gain.connect(bus);gain.gain.value=.55;
  if(buffers[id]){node=ctx.createBufferSource();node.buffer=buffers[id];node.connect(gain);}
  else{node=ctx.createOscillator();node.frequency.value=cues[id].hz;node.connect(gain);gain.gain.setValueAtTime(.08,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+cues[id].duration);}
  active.add(node);node.onended=()=>{active.delete(node);node.disconnect();gain.disconnect();};node.start();node.stop(ctx.currentTime+Math.min(2,buffers[id]?.duration||cues[id].duration));
 }
 const tests=document.createElement('details');tests.innerHTML='<summary>Écouter les 8 sons</summary>';box.append(tests);
 for(const [id,c] of Object.entries(cues)){const button=document.createElement('button');button.type='button';button.textContent=c.label;button.onclick=async()=>{if(!settings.effectsEnabled){status.textContent='Active Effets sonores pour écouter un effet.';return;}settings.enabled=true;await unlock();await load();sound(id);};tests.append(button);}
 document.addEventListener('click',e=>{if(!e.isTrusted)return;const button=e.target.closest('button');if(!button||box.contains(button)||button===quick)return;if(!unlocked&&settings.enabled)void unlock();if(!button.closest('.reward-card,.dialogue-host,[role="dialog"]'))sound('ui');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){music.pause();ctx?.suspend();}else if(unlocked&&settings.enabled){ctx?.resume().then(()=>playMusic()).catch(()=>{});}});
 music.addEventListener('error',()=>{status.textContent='La musique ne peut pas être chargée.';});
 root.roundCircleAudio={event(e){const id=cueFor(e);if(id)sound(id);},dialogue(state){duck=!!state;sync();if(state)sound('dialogue');}};
 status.textContent='Le son démarre au premier clic sur une commande.';sync();
}
root.RoundCircleAudio={cues,cueFor,Gate};
if(typeof module!=='undefined')module.exports=root.RoundCircleAudio;
if(typeof window!=='undefined'){if(root.roundCircleLab)install();else window.addEventListener('round-circle-ready',install,{once:true});}
})(typeof window!=='undefined'?window:globalThis);
