(function(root){
'use strict';
function itchPage(referrer){try{const u=new URL(referrer);return u.protocol==='https:'&&(u.hostname==='itch.io'||u.hostname.endsWith('.itch.io'))?u.href:null;}catch{return null;}}
const projectPage='https://lm-vg.itch.io/round-circle';
function exitDestination(referrer){return itchPage(referrer)||projectPage;}
function install(){
 const controls=document.createElement('div');controls.id='screenControls';controls.innerHTML='<button type="button" id="screenToggle">Fullscreen</button><button type="button" id="exitGame">Exit game</button>';document.body.append(controls);
 const menu=document.createElement('dialog');menu.id='exitMenu';menu.setAttribute('aria-labelledby','exitTitle');menu.innerHTML='<h2 id="exitTitle">Take a break.</h2><p>Your run is paused while this menu is open.</p><div class="exit-actions"><button type="button" data-action="continue" class="primary">Continue playing</button><button type="button" data-action="screen">Exit fullscreen</button><button type="button" data-action="title">Return to title</button></div><p class="exit-warning">Returning to the title or itch.io ends this run.</p><p class="exit-help" role="status"></p>';document.body.append(menu);
 const full=()=>document.fullscreenElement||document.webkitFullscreenElement;
 const help=menu.querySelector('.exit-help');
 async function exitFullscreen(){try{const fn=document.exitFullscreen||document.webkitExitFullscreen;if(fn)await fn.call(document);}catch{help.textContent='Use Return to itch.io to leave the game. Esc also exits native browser fullscreen.';}}
 function sync(){document.querySelector('#screenToggle').textContent=full()?'Exit fullscreen':'Fullscreen';menu.querySelector('[data-action="screen"]').hidden=!full();}
 function open(){if(menu.open)menu.close();help.textContent='Return to itch.io closes this run and opens the game page.';menu.showModal();sync();menu.querySelector('[data-action="continue"]').focus();}
 function addExitButton(parent){const b=document.createElement('button');b.type='button';b.textContent='Exit game';b.onclick=open;parent.append(b);}
 document.querySelector('#exitGame').onclick=open;
 document.querySelector('#screenToggle').onclick=async()=>{if(full())await exitFullscreen();else try{const fn=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(!fn)throw Error('unavailable');await fn.call(document.documentElement);}catch{open();help.textContent='Fullscreen is unavailable here. Use the fullscreen control on the hosting page.';}sync();};
 menu.querySelector('[data-action="continue"]').onclick=()=>menu.close();
 menu.querySelector('[data-action="screen"]').onclick=exitFullscreen;
 menu.querySelector('[data-action="title"]').onclick=async()=>{await exitFullscreen();root.location.reload();};
 const host=exitDestination(document.referrer);{const link=document.createElement('a');link.href=host;link.target='_top';link.textContent='Return to itch.io';link.className='exit-host';menu.querySelector('.exit-actions').append(link);}
 document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
 root.RoundCircleScreen={isOpen:()=>menu.open,addExitButton};sync();
}
if(typeof module!=='undefined')module.exports={itchPage,exitDestination};
if(root.document)install();
})(typeof window!=='undefined'?window:globalThis);
