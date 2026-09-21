const copy=x=>JSON.parse(JSON.stringify(x));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const id=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(x);
const fail=m=>{throw new Error(m);};
function validateEffects(effects=[]){if(!Array.isArray(effects)||effects.length>20)fail('Effets invalides');for(const e of effects){if(!e||!['set','add','emit'].includes(e.type))fail('Effet inconnu');if(e.type==='emit'){if(!id(e.name))fail('Nom événement invalide');if(e.payload!==undefined&&(!e.payload||typeof e.payload!=='object'||Array.isArray(e.payload)))fail('Payload invalide');}else{if(!id(e.key)||['__proto__','constructor','prototype'].includes(e.key))fail('Clé interdite');if(e.type==='add'&&!Number.isFinite(e.value))fail('Addition invalide');if(e.type==='set'&&!['string','number','boolean'].includes(typeof e.value))fail('Valeur invalide');if(typeof e.value==='number'&&!Number.isFinite(e.value))fail('Valeur non finie');}}}
function condition(c){if(!c||!id(c.key)||!['eq','gte'].includes(c.op)||!['string','number','boolean'].includes(typeof c.value))fail('Condition invalide');if(c.op==='gte'&&!Number.isFinite(c.value))fail('Condition numérique invalide');}
export function validateLibrary(source){
 const d=copy(source);if(d.version!==1||!d.characters||!d.backplates||!Array.isArray(d.dialogues)||!d.dialogues.length||d.dialogues.length>100)fail('Bibliothèque invalide');
 const asset=s=>typeof s==='string'&&/^assets\/[a-zA-Z0-9_./-]+\.(png|svg|webp)$/.test(s)&&!s.includes('..');
 for(const [k,c] of Object.entries(d.characters)){if(!id(k)||!c||typeof c.name!=='string'||!['player','npc'].includes(c.role)||!c.poses||!own(c.poses,'neutral'))fail('Personnage invalide');for(const [p,path] of Object.entries(c.poses))if(!id(p)||!asset(path))fail('Pose invalide');}
 for(const path of Object.values(d.backplates))if(!asset(path))fail('Habillage invalide');
 const ids=new Set();for(const story of d.dialogues){if(!id(story.id)||ids.has(story.id)||!story.nodes||Object.keys(story.nodes).length>200||!own(story.nodes,story.start))fail('Dialogue invalide');ids.add(story.id);
  const link=k=>{if(!id(k)||!own(story.nodes,k))fail('Lien absent : '+k);};
  for(const [k,n] of Object.entries(story.nodes)){if(!id(k)||!['line','choice','end'].includes(n.type)||!own(d.characters,n.speaker)||typeof n.text!=='string'||n.text.length>2000)fail('Nœud invalide : '+k);const c=d.characters[n.speaker];if(!own(c.poses,n.pose)||!own(d.backplates,n.backplate))fail('Asset inconnu : '+k);validateEffects(n.effects);
   if(n.type==='line')link(n.next);
   if(n.type==='choice'){if(c.role!=='player'||!Array.isArray(n.choices)||n.choices.length<1||n.choices.length>3)fail('Choix invalides');const choices=new Set();let fallback=false;for(const ch of n.choices){if(!id(ch.id)||choices.has(ch.id)||typeof ch.text!=='string'||!ch.text.trim()||ch.text.length>240)fail('Réponse invalide');choices.add(ch.id);link(ch.next);validateEffects(ch.effects);if(ch.when)condition(ch.when);else fallback=true;}if(!fallback)fail('Au moins une réponse doit rester disponible');}
  }
 }
 return d;
}
export class DialogueEngine{
 constructor(library,{onChange=()=>{},onEffect=()=>{},onError=console.error}={}){this.library=validateLibrary(library);this.onChange=onChange;this.onEffect=onEffect;this.onError=onError;this.flags={};this.history=[];this.queue=[];this.triggered=new Set();this.revision=0;this.run=0;this.active=null;}
 notify(){this.onChange(this.state());}
 state(){if(!this.active)return null;const {story,nodeId}=this.active,n=story.nodes[nodeId];return {revision:this.revision,dialogueId:story.id,nodeId,node:copy(n),character:copy(this.library.characters[n.speaker]),backplate:this.library.backplates[n.backplate],choices:n.type==='choice'?n.choices.filter(c=>this.available(c)).map(copy):[],flags:copy(this.flags)};}
 available(c){if(!c.when)return true;const w=c.when,v=this.flags[w.key];return w.op==='eq'?v===w.value:typeof v==='number'&&v>=w.value;}
 start(dialogueId,nodeId){if(this.active)fail('Une conversation est déjà active');const story=this.library.dialogues.find(d=>d.id===dialogueId);if(!story||!own(story.nodes,nodeId||story.start))fail('Dialogue ou nœud absent');this.active={story:copy(story),nodeId:nodeId||story.start};this.run++;this.enter();}
 enqueue(dialogueId,triggerId){if(!id(triggerId))fail('ID de déclencheur invalide');if(!this.library.dialogues.some(d=>d.id===dialogueId))fail('Dialogue absent');if(this.triggered.has(triggerId))return false;this.triggered.add(triggerId);if(this.active)this.queue.push(dialogueId);else this.start(dialogueId);return true;}
 enter(){this.revision++;const n=this.active.story.nodes[this.active.nodeId];this.history.push({speaker:n.speaker,text:n.text,nodeId:this.active.nodeId});this.notify();}
 effects(list,context){for(const [i,e] of (list||[]).entries()){if(e.type==='set')this.flags[e.key]=e.value;if(e.type==='add')this.flags[e.key]=(typeof this.flags[e.key]==='number'?this.flags[e.key]:0)+e.value;if(e.type==='emit'){try{this.onEffect({...copy(e),eventId:`${this.run}:${context}:${i}`});}catch(err){this.onError(err);}}}}
 advance(revision){const s=this.state();if(!s||revision!==this.revision||s.node.type==='choice')return false;this.commit(s,null);return true;}
 choose(choiceId,revision){const s=this.state();if(!s||revision!==this.revision||s.node.type!=='choice')return false;const choice=s.choices.find(c=>c.id===choiceId);if(!choice)return false;this.commit(s,choice);return true;}
 commit(s,choice){this.revision++; // invalidate the old screen BEFORE dispatching effects
  this.effects(s.node.effects,s.revision+':node');if(choice){this.history.push({speaker:s.node.speaker,text:choice.text,choice:choice.id});this.effects(choice.effects,s.revision+':choice');}
  if(s.node.type==='end'){this.active=null;this.notify();const next=this.queue.shift();if(next)this.start(next);return;}
  this.active.nodeId=choice?choice.next:s.node.next;this.enter();
 }
 cancel(){this.active=null;this.queue=[];this.revision++;this.notify();}
 reset(){this.cancel();this.flags={};this.history=[];this.triggered.clear();}
 exportFlags(){return copy(this.flags);}
}
