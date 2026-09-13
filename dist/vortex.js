'use strict';
window.createRoundCircleVortex=function(B,scene){
 B.Effect.ShadersStore.rcVortexVertexShader=`precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.);}`;
 B.Effect.ShadersStore.rcVortexFragmentShader=`precision highp float;
 varying vec2 vUV; uniform float time; uniform float flare; uniform vec3 tint; uniform vec3 secondary;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec2 p=(vUV-.5)*2.7;float r=length(p);if(r>1.3)discard;float a=atan(p.y,p.x);float t=time;
 float n=noise(p*6.+vec2(t*.18,-t*.23));float warp=sin(a*3.+t*.8+r*9.)*.025+n*.035;float rr=r+warp;
 float spiral=pow(.5+.5*sin(a*7.+log(max(rr,.025))*17.-t*3.2+n*2.),12.);
 float fine=pow(.5+.5*sin(a*13.+rr*43.-t*4.+n*3.),24.);
 float band=exp(-pow((rr-.79)*7.,2.));float lip=exp(-abs(rr-.93)*65.);
 float inner=pow(.5+.5*sin(log(max(rr,.04))*30.-t*3.+a*2.),10.)*smoothstep(.17,.5,rr)*(1.-smoothstep(.6,.9,rr));
 float sector=.4+.6*pow(.5+.5*sin(a*4.-t*.7),2.);
 vec3 col=mix(vec3(.005,.004,.013),secondary*.075,smoothstep(.14,.9,r));
 col+=tint*(spiral*band*.95+fine*band*.28+lip*sector*1.25+inner*.22);
 col+=secondary*pow(.5+.5*sin(a*5.-rr*21.+t*2.),18.)*band*.45;
 col+=tint*exp(-abs(r-1.01)*12.)*.09;
 col*=smoothstep(.13,.29,rr);col+=tint*flare*exp(-abs(rr-.86)*15.)*.7;
 float alpha=1.-smoothstep(1.05,1.3,r);gl_FragColor=vec4(col,alpha);}`;
 const root=new B.TransformNode('vortex',scene);
 const surface=B.MeshBuilder.CreateGround('vortex-accretion-disc',{width:2.7,height:2.7,subdivisions:1},scene);surface.parent=root;surface.position.y=.078;surface.isPickable=false;
 const material=new B.ShaderMaterial('vortex-flow',scene,{vertex:'rcVortex',fragment:'rcVortex'},{attributes:['position','uv'],uniforms:['worldViewProjection','time','flare','tint','secondary'],needAlphaBlending:true});material.backFaceCulling=false;surface.material=material;
 material.setFloat('time',0);material.setFloat('flare',0);material.setColor3('tint',B.Color3.FromHexString('#fa92db'));material.setColor3('secondary',B.Color3.FromHexString('#793e69'));
 const count=72,segments=5,paths=Array.from({length:count},()=>Array.from({length:segments},()=>B.Vector3.Zero()));
 const threads=B.MeshBuilder.CreateLineSystem('vortex-infall',{lines:paths,updatable:true},scene);threads.parent=root;threads.isPickable=false;threads.alpha=.55;
 const debrisMat=new B.StandardMaterial('vortex-debris',scene);debrisMat.diffuseColor=B.Color3.FromHexString('#615874');debrisMat.emissiveColor=B.Color3.FromHexString('#4b234e');
 const source=B.MeshBuilder.CreatePolyhedron('vortex-debris-source',{type:1,size:.035},scene);source.material=debrisMat;source.isVisible=false;source.isPickable=false;
 const debris=Array.from({length:16},(_,i)=>{const d=source.createInstance('orbiting-fragment-'+i);d.parent=root;d.isPickable=false;return d;});
 let flash=0;
 return {root,material,surface,threads,debris,
 palette(primary,accent){const c=B.Color3.FromHexString(primary);material.setColor3('tint',c);material.setColor3('secondary',B.Color3.FromHexString(accent));threads.color=c;debrisMat.emissiveColor=c.scale(.35);},
 burst(){flash=1;},
 update(t,r,dt,paused,particles){root.scaling.set(r,Math.min(r,2),r);if(!paused)flash=Math.max(0,flash-dt*1.7);material.setFloat('time',t);material.setFloat('flare',flash);threads.setEnabled(particles);if(particles){for(let i=0;i<count;i++){for(let j=0;j<segments;j++){const phase=((t*(.12+(i%5)*.016)+i/count-j*.004)%1+1)%1;const rad=.18+Math.pow(1-phase,.7)*1.12;const angle=i*2.39996+phase*5.7+t*.18;paths[i][j].set(Math.cos(angle)*rad,.12+Math.sin(phase*Math.PI)*(.25+(i%7)*.06),Math.sin(angle)*rad);}}B.MeshBuilder.CreateLineSystem('vortex-infall',{lines:paths,instance:threads},scene);}debris.forEach((d,i)=>{d.setEnabled(particles);let phase=(t*.07+i/16)%1,a=i*2.39996+t*(.35+i*.008)+phase*2,rad=1.19-phase*.77;d.position.set(Math.cos(a)*rad,.12+Math.sin(phase*Math.PI)*.55,Math.sin(a)*rad);d.rotation.set(t*.5+i,t*.7+i,t*.2);d.scaling.setAll((.5+Math.sin(phase*Math.PI))*1.3);});},
 dispose(){root.dispose();source.dispose();material.dispose();debrisMat.dispose();}
 };
};
