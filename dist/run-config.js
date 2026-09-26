(function(root){
'use strict';
const copy=value=>JSON.parse(JSON.stringify(value));
const isObject=value=>value&&typeof value==='object'&&!Array.isArray(value);
const identifier=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value);
function validate(source){
 if(!isObject(source)||source.version!==1||!identifier(source.id)||typeof source.name!=='string'||!source.name.trim()||source.name.length>80)throw Error('Dictionnaire de partie invalide');
 const stats=root.RoundCircleStats.validate(source.stats);
 const waves=root.RoundCircleWaves.validateLibrary(source.waves,root.RoundCircleSimulation.types);
 if(Math.abs(stats.vortex.startRadius-waves.vortex.startRadius)>1e-9||Math.abs(stats.vortex.rate-waves.vortex.rate)>1e-9)throw Error('Horloges de partie incohérentes');
 if(!isObject(source.bonuses)||typeof source.bonuses.enabled!=='boolean')throw Error('Bonus de partie invalides');
 const bonuses={enabled:source.bonuses.enabled,catalog:root.RoundCircleRewards.validate(source.bonuses.catalog)};
 const dialogue=source.dialogue;
 if(!isObject(dialogue)||!isObject(dialogue.library)||!Array.isArray(dialogue.library.dialogues)||!dialogue.library.dialogues.length||!Array.isArray(dialogue.cues)||dialogue.cues.length>20||!Number.isFinite(dialogue.choiceScale)||dialogue.choiceScale<0||dialogue.choiceScale>1||!Number.isFinite(dialogue.autoAdvanceMs)||dialogue.autoAdvanceMs<0||dialogue.autoAdvanceMs>10000)throw Error('Narration de partie invalide');
 const dialogueIds=new Set(dialogue.library.dialogues.map(story=>story.id)),cueIds=new Set();let previous=-Infinity;
 const cues=dialogue.cues.map(cue=>{if(!isObject(cue)||!identifier(cue.id)||cueIds.has(cue.id)||!dialogueIds.has(cue.dialogueId)||!Number.isFinite(cue.radius)||cue.radius<stats.vortex.startRadius||cue.radius>=6||cue.radius<previous)throw Error('Déclencheur narratif invalide');cueIds.add(cue.id);previous=cue.radius;return {id:cue.id,dialogueId:cue.dialogueId,radius:cue.radius};});
 const soldiers=source.soldiers||root.RoundCircleSimulation.soldierProfiles,ids=new Set();
 if(!Array.isArray(soldiers)||soldiers.length!==4)throw Error('Quatre profils de soldats requis');
 for(const p of soldiers){if(!identifier(p.id)||ids.has(p.id)||typeof p.name!=='string'||typeof p.role!=='string'||!/^#[0-9a-f]{6}$/i.test(p.color)||!Number.isFinite(p.duration)||p.duration<1||p.duration>120)throw Error('Profil de soldat invalide');ids.add(p.id);for(const [k,min,max] of [['maxHp',1,2000],['damage',0,200],['speed',.1,10],['range',.1,15],['cooldown',.1,10]])if(!Number.isFinite(p.stats?.[k])||p.stats[k]<min||p.stats[k]>max)throw Error('Stat de profil invalide');}
 const audio=source.audio||{music:.08,effects:.08};for(const k of ['music','effects'])if(!Number.isFinite(audio[k])||audio[k]<0||audio[k]>1)throw Error('Volume invalide');
 const endings=source.endings;
 if(!isObject(endings)||!isObject(endings.harmony)||!isObject(endings.force)||!isObject(endings.departure)||!isObject(endings.defeat))throw Error('Fins de partie invalides');
 const validateText=entry=>{if(typeof entry.title!=='string'||!entry.title.trim()||entry.title.length>100||typeof entry.text!=='string'||!entry.text.trim()||entry.text.length>1000||typeof entry.eyebrow!=='string'||entry.eyebrow.length>100)throw Error('Texte de fin invalide');};
 for(const entry of Object.values(endings))validateText(entry);
 if(!Array.isArray(endings.harmony.requiredFlags)||!endings.harmony.requiredFlags.length||endings.harmony.requiredFlags.some(flag=>!identifier(flag))||!Number.isInteger(endings.harmony.minBuildings)||endings.harmony.minBuildings<0||endings.harmony.minBuildings>12||!identifier(endings.force.waveId)||!waves.waves.some(w=>w.id===endings.force.waveId))throw Error('Conditions de fin invalides');
 return copy({version:1,id:source.id,name:source.name,stats,waves,bonuses,soldiers,audio,dialogue:{library:dialogue.library,cues,choiceScale:dialogue.choiceScale,autoAdvanceMs:dialogue.autoAdvanceMs},endings});
}
async function load(url){const response=await fetch(url,{cache:'no-cache',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Dictionnaire de partie introuvable');const source=await response.json(),{validateLibrary}=await import('./dialogue/src/dialogue-core.js?v=028');source.dialogue.library=validateLibrary(source.dialogue.library);return validate(source);}
root.RoundCircleRunConfig={validate,load};if(typeof module!=='undefined')module.exports=root.RoundCircleRunConfig;
})(typeof window!=='undefined'?window:globalThis);
