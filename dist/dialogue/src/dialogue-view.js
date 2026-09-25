export class DialogueView{
 constructor(host,engine,{assetBase='./',onOpen=()=>{},onClose=()=>{},lettersPerSecond=45,autoAdvanceMs=0}={}){
  this.host=host;this.engine=engine;this.options={assetBase,onOpen,onClose,lettersPerSecond,autoAdvanceMs};this.timer=null;this.advanceTimer=null;this.wasOpen=false;this.lastFocus=null;
  host.classList.add('rct-dialogue');host.hidden=true;host.innerHTML='<div class="rct-dimmer"></div><img class="rct-backplate" alt=""><img class="rct-portrait" alt=""><section class="rct-panel" role="dialog" aria-modal="true" aria-labelledby="rct-speaker"><header><h2 id="rct-speaker"></h2><span class="rct-turn"></span></header><p class="rct-text" aria-live="polite"></p><div class="rct-actions"></div><details class="rct-history"><summary>Historique</summary><div></div></details></section>';
  this.panel=host.querySelector('.rct-panel');this.text=host.querySelector('.rct-text');this.actions=host.querySelector('.rct-actions');
  this.keyHandler=e=>{if(host.hidden)return;if(e.key==='Tab'){const focusable=[...host.querySelectorAll('button:not(:disabled),summary')];if(!focusable.length)return;const i=focusable.indexOf(document.activeElement),next=e.shiftKey?(i<=0?focusable.length-1:i-1):(i+1)%focusable.length;e.preventDefault();focusable[next].focus();}else if(e.key==='Escape'){e.preventDefault();this.reveal();}};
  host.addEventListener('keydown',this.keyHandler);engine.onChange=s=>this.render(s);this.render(engine.state());
 }
 reveal(){if(!this.state)return;clearInterval(this.timer);this.timer=null;this.text.textContent=this.state.node.text;this.actions.querySelectorAll('button').forEach(b=>b.disabled=false);if(this.options.autoAdvanceMs&&this.state.node.type!=='choice'){clearTimeout(this.advanceTimer);const revision=this.state.revision;this.advanceTimer=setTimeout(()=>this.engine.advance(revision),this.options.autoAdvanceMs);}}
 render(state){clearInterval(this.timer);clearTimeout(this.advanceTimer);this.state=state;if(!state){this.host.hidden=true;if(this.wasOpen){this.wasOpen=false;this.options.onClose();this.lastFocus?.focus();}return;}
  if(!this.wasOpen){this.wasOpen=true;this.lastFocus=document.activeElement;this.options.onOpen();}this.host.hidden=false;
  const n=state.node,portrait=this.host.querySelector('.rct-portrait'),url=this.options.assetBase+state.character.poses[n.pose];this.host.classList.toggle('choice',n.type==='choice');
  if(portrait.getAttribute('src')!==url){portrait.src=url;portrait.classList.remove('rct-enter');void portrait.offsetWidth;portrait.classList.add('rct-enter');}portrait.alt=state.character.name+' : '+n.pose;this.host.querySelector('.rct-backplate').src=this.options.assetBase+state.backplate;
  this.host.querySelector('h2').textContent=state.character.name;this.host.querySelector('.rct-turn').textContent=n.type==='choice'?'VOTRE RÉPONSE':state.character.role==='player'?'VOUS PARLEZ':'ELLE PARLE';
  this.actions.replaceChildren();const add=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;this.actions.append(b);return b;};
  if(n.type==='choice')for(const c of state.choices)add(c.text,()=>this.engine.choose(c.id,state.revision));else add(n.type==='end'?'Terminer':'Continuer ›',()=>{if(this.timer){this.reveal();return;}this.engine.advance(state.revision);});
  const speed=this.options.lettersPerSecond;
  if(n.type!=='choice'&&speed>0){const chars=Array.from(n.text);let count=0;this.text.textContent='';this.timer=setInterval(()=>{count=Math.min(chars.length,count+1);this.text.textContent=chars.slice(0,count).join('');if(count===chars.length)this.reveal();},1000/speed);}else this.text.textContent=n.text;
  const history=this.host.querySelector('.rct-history div');history.replaceChildren();for(const h of this.engine.history){const p=document.createElement('p');p.textContent=(this.engine.library.characters[h.speaker]?.name||h.speaker)+' : '+h.text;history.append(p);}
  if(!this.options.autoAdvanceMs||n.type==='choice')this.actions.querySelector('button')?.focus();
 }
 destroy(){clearInterval(this.timer);clearTimeout(this.advanceTimer);this.engine.onChange=()=>{};this.host.removeEventListener('keydown',this.keyHandler);this.host.hidden=true;if(this.wasOpen)this.options.onClose();this.lastFocus?.focus();}
}
export async function preloadAssets(library,base='./'){
 const paths=[...Object.values(library.backplates),...Object.values(library.characters).flatMap(c=>Object.values(c.poses))];
 await Promise.all([...new Set(paths)].map(path=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(new Error('Asset introuvable : '+path));image.src=base+path;})));
}
