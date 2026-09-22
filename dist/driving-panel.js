/* Floating controls: pointer capture supports mouse, pen and touch. */
window.installDrivingPanel=function(panel,stage,options={}){
 const key=options.key||'round-circle-driving-layout-v1';
 let layout=null,gesture=null;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function apply(next){
  const bounds=stage.getBoundingClientRect(),margin=8;
  const maxWidth=Math.max(1,bounds.width-margin*2),maxHeight=Math.max(1,bounds.height-margin*2);
  layout={width:clamp(next.width,Math.min(240,maxWidth),maxWidth),height:clamp(next.height,Math.min(112,maxHeight),maxHeight)};
  layout.x=clamp(next.x,margin,Math.max(margin,bounds.width-layout.width-margin));
  layout.y=clamp(next.y,margin,Math.max(margin,bounds.height-layout.height-margin));
  Object.assign(panel.style,{left:layout.x+'px',top:layout.y+'px',width:layout.width+'px',height:layout.height+'px',bottom:'auto',transform:'none'});
 }
 function save(){try{localStorage.setItem(key,JSON.stringify(layout));}catch{}}
 const rect=panel.getBoundingClientRect(),bounds=stage.getBoundingClientRect();
 let initial={x:rect.left-bounds.left,y:rect.top-bounds.top,width:rect.width,height:rect.height};
 try{const stored=JSON.parse(localStorage.getItem(key));if(stored&&['x','y','width','height'].every(k=>Number.isFinite(stored[k])))initial=stored;}catch{}
 apply(initial);panel.roundCircleLayout=()=>({...layout});
 function bind(handle,resize){
  handle.addEventListener('pointerdown',e=>{if(e.button!==0||gesture)return;e.preventDefault();handle.focus();gesture={id:e.pointerId,x:e.clientX,y:e.clientY,start:{...layout}};handle.setPointerCapture(e.pointerId);});
  handle.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,start=gesture.start;apply(resize?{...start,width:start.width+dx,height:start.height+dy}:{...start,x:start.x+dx,y:start.y+dy});});
  const finish=e=>{if(gesture?.id!==e.pointerId)return;gesture=null;save();};
  handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);
  handle.addEventListener('keydown',e=>{const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();const step=e.shiftKey?30:10;apply(resize?{...layout,width:layout.width+delta[0]*step,height:layout.height+delta[1]*step}:{...layout,x:layout.x+delta[0]*step,y:layout.y+delta[1]*step});save();});
 }
 bind(panel.querySelector(options.handle||'#driveHandle'),false);bind(panel.querySelector(options.resize||'#driveResize'),true);
 new ResizeObserver(()=>{apply(layout);}).observe(stage);
};
