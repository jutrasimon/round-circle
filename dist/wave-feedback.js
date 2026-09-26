(function(root){
'use strict';
const defaults={duration:1.8,textScale:1,shake:10,flash:.35,chromatic:24,contrast:.65,color:'#ffb0e1',previewNumber:1};
function sanitize(data={}){const out={...defaults};for(const [key,min,max] of [['previewNumber',1,99],['duration',.4,5],['textScale',.5,1.8],['shake',0,30],['flash',0,1],['chromatic',0,80],['contrast',0,2]])if(Number.isFinite(data[key]))out[key]=Math.max(min,Math.min(max,data[key]));if(/^#[\da-f]{6}$/i.test(data.color))out.color=data.color;return out;}
function install({stage,host,control,group,scene,pipeline,getVisual}){
 const key='round-circle-wave-feedback-v1';let settings={...defaults};try{settings=sanitize(JSON.parse(localStorage.getItem(key))||{});}catch{}
 const overlay=document.createElement('div');overlay.className='wave-feedback';overlay.setAttribute('aria-hidden','true');overlay.innerHTML='<div class="wave-flash"></div><div class="wave-title"><span class="wave-kicker">LE SEUIL EST FRANCHI</span><strong></strong><span class="wave-underline"></span></div>';stage.append(overlay);
 const title=overlay.querySelector('.wave-title'),label=overlay.querySelector('strong'),flash=overlay.querySelector('.wave-flash');
 const announcer=document.createElement('span');announcer.className='wave-sr';announcer.setAttribute('role','status');announcer.setAttribute('aria-live','polite');stage.append(announcer);
 const canvas=stage.querySelector('canvas'),bars=stage.querySelector('#bars');
 const panel=group(host,'NEW WAVE · effets');host.prepend(panel);
 const help=document.createElement('p');help.textContent='Teste l’annonce sans faire apparaître de monstres, même en pause. Les réglages sont mémorisés dans ce navigateur.';panel.append(help);
 let active=null,queue=[],sessionId=null;
 function save(){try{localStorage.setItem(key,JSON.stringify(settings));}catch{}}
 const preview={number:settings.previewNumber};control(panel,'Numéro de vague à tester',preview,'number',1,99,1,()=>{settings.previewNumber=preview.number;save();});
 const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='▶ Tester NEW WAVE';panel.append(button);button.onclick=()=>{queue=[];begin({number:preview.number,preview:true});};
 const tweaks=group(panel,'Ajuster les effets');tweaks.open=false;
 for(const [k,n,min,max,step] of [['duration','Durée (s)',.4,5,.1],['textScale','Taille du texte',.5,1.8,.05],['shake','Vibration écran (px)',0,30,1],['flash','Intensité du flash',0,1,.05],['chromatic','Aberration chromatique',0,80,1],['contrast','Coup de contraste',0,2,.05]])control(tweaks,n,settings,k,min,max,step,save);
 control(tweaks,'Couleur du flash et du texte',settings,'color',0,0,0,save,'color');
 function begin(event){active={...event,elapsed:0};label.textContent='WAVE '+event.number;announcer.textContent='Wave '+event.number;overlay.style.display='block';}
 function neutral(){const base=getVisual();pipeline.chromaticAberration.aberrationAmount=base.chromatic;scene.imageProcessingConfiguration.contrast=base.contrast;canvas.style.transform='';if(bars)bars.style.transform='';overlay.style.display='none';}
 function clear(){active=null;queue=[];neutral();}
 function update(dt,paused){if(root.roundCircleLab?.features?.modalActive){neutral();return;}if(active)overlay.style.display='block';if(!active&&queue.length)begin(queue.shift());if(!active){neutral();return;}if(!paused||active.preview)active.elapsed+=dt;
  const t=active.elapsed,d=settings.duration,p=Math.min(1,t/d),impact=Math.exp(-p*10),entry=Math.min(1,p/.13),exit=Math.max(0,(p-.68)/.32),opacity=Math.min(1,entry*4)*(1-exit);
  const base=getVisual();pipeline.chromaticAberration.aberrationAmount=base.chromatic+settings.chromatic*impact;scene.imageProcessingConfiguration.contrast=base.contrast+settings.contrast*impact;
  const dx=Math.sin(t*81)*settings.shake*impact,dy=Math.cos(t*103)*settings.shake*.6*impact,transform='translate('+dx+'px,'+dy+'px)';canvas.style.transform=transform;if(bars)bars.style.transform=transform;
  overlay.style.setProperty('--wave-color',settings.color);title.style.opacity=opacity;title.style.transform='translate(-50%,-50%) translateX('+(Math.pow(1-entry,3)*-70+exit*70)+'px) scale('+(settings.textScale*(1+Math.pow(1-entry,3)*.65+exit*.15))+') rotate('+(-3*(1-entry))+'deg)';
  label.style.textShadow=(impact*12)+'px 0 #ff325f, '+(-impact*12)+'px 0 #5affeb';flash.style.opacity=settings.flash*Math.max(0,1-p/.2);overlay.querySelector('.wave-underline').style.transform='scaleX('+Math.min(1,p*6)+')';
  if(p>=1){active=null;neutral();}
 }
 return {settings,trigger(event){queue.push({number:event.number,preview:false});},session(id){if(sessionId!==id){sessionId=id;clear();}},update,clear,getActive:()=>active};
}
root.RoundCircleWaveFeedback={defaults,sanitize,install};if(typeof module!=='undefined')module.exports=root.RoundCircleWaveFeedback;
})(typeof window!=='undefined'?window:globalThis);
