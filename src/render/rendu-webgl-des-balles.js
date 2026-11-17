'use strict';
// ================= rendu WebGL des balles et particules (même look, dessiné en 1 appel par vue) =================
let GLR;DEFER(()=>{GLR=(()=>{const c=document.getElementById('g');let gl=null;try{gl=c&&(c.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false,failIfMajorPerformanceCaveat:!/[?&]gl=1/.test(location.search)}))}catch(e){}if(!gl||typeof WebGLRenderingContext==='undefined'||!(gl instanceof WebGLRenderingContext))return null;{const FG=/[?&]gl=1/.test(location.search),x=gl.getExtension('WEBGL_debug_renderer_info'),rn=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL)+'':'';window.GLINFO=rn;if(!FG&&/swiftshader|llvmpipe|software|basic render/i.test(rn))return null} // pas de vrai GPU : le 2D est plus rapide
 const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null};
 const vs=sh(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 u;attribute float a;uniform vec2 r;varying vec2 vu;varying float va;void main(){vu=u;va=a;gl_Position=vec4(p.x/r.x*2.-1.,1.-p.y/r.y*2.,0.,1.);}'),
  fs=sh(gl.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D t;varying vec2 vu;varying float va;void main(){gl_FragColor=texture2D(t,vu)*va;}');if(!vs||!fs)return null;
 const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;gl.useProgram(pr);
 const AS=2048,AT=document.createElement('canvas');AT.width=AT.height=AS;const ax=AT.getContext('2d');let px=0,py=0,ph=0;const MAP=new Map();let dz=null;
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,AS,AS,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 const MQ=8000,F=new Float32Array(MQ*30),vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,F.byteLength,gl.DYNAMIC_DRAW);
 const lp=gl.getAttribLocation(pr,'p'),lu=gl.getAttribLocation(pr,'u'),la=gl.getAttribLocation(pr,'a'),ur=gl.getUniformLocation(pr,'r');
 gl.enableVertexAttribArray(lp);gl.enableVertexAttribArray(lu);gl.enableVertexAttribArray(la);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,20,0);gl.vertexAttribPointer(lu,2,gl.FLOAT,false,20,8);gl.vertexAttribPointer(la,1,gl.FLOAT,false,20,16);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
 let n=0,V=[],cur=null,lost=false;c.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true});c.addEventListener('webglcontextrestored',()=>location.reload());
 const reset=()=>{ax.clearRect(0,0,AS,AS);MAP.clear();px=py=ph=0;dz=[0,0,AS,AS];RS++;if(debug)log('GL atlas reset')};let RS=0,KEYS=null;
 return{
  get rs(){return RS},get AT(){return AT},get n(){return n},get V(){return V},get size(){return MAP.size},keys(){return[...MAP.keys()]},spr(key,w,h,draw){const z=cur?Math.min(4,Math.ceil(cur.k*2)/2):1;key+='@'+z;let s=MAP.get(key);if(s)return s;if(!(w>0&&w<600))w=8;if(!(h>0&&h<600))h=8;const lw=w,lh=h;w=Math.ceil(w*z);h=Math.ceil(h*z);if(px+w+2>AS){px=0;py+=ph+2;ph=0}if(py+h+2>AS){reset()}
   const x=px,y=py;ax.save();ax.translate(x,y);ax.beginPath();ax.rect(0,0,w,h);ax.clip();ax.scale(z,z);draw(ax,lw,lh);ax.restore();px+=w+2;ph=Math.max(ph,h);
   s={u0:x/AS,v0:y/AS,u1:(x+w)/AS,v1:(y+h)/AS,w:w/z,h:h/z};MAP.set(key,s);dz=dz?[Math.min(dz[0],x),Math.min(dz[1],y),Math.max(dz[2],x+w),Math.max(dz[3],y+h)]:[x,y,x+w,y+h];return s},
  begin(){n=0;V=[];cur=null;if(py>AS*.75)reset()}, // vidage de l'atlas entre deux images, jamais au milieu
  view(T,x,y,w,h){cur={T,x,y,w,h,s:n,k:Math.hypot(T.a,T.b),r:Math.atan2(T.b,T.a)};V.push(cur)},
  push(s,x,y,sc,rot,al){if(n>=MQ||!cur||al<=0)return;const T=cur.T,X=T.a*x+T.c*y+T.e,Y=T.b*x+T.d*y+T.f,k=cur.k*sc,hw=s.w*.5*k,hh=s.h*.5*k,ra=rot+cur.r,co=Math.cos(ra),si=Math.sin(ra);
   const ax1=-hw*co+hh*si,ay1=-hw*si-hh*co,bx=hw*co+hh*si,by=hw*si-hh*co,o=n*30; // coins : (-,-) (+,-) (+,+) (-,+)
   const P0x=X+ax1,P0y=Y+ay1,P1x=X+bx,P1y=Y+by,P2x=X-ax1,P2y=Y-ay1,P3x=X-bx,P3y=Y-by;
   F[o]=P0x;F[o+1]=P0y;F[o+2]=s.u0;F[o+3]=s.v0;F[o+4]=al;F[o+5]=P1x;F[o+6]=P1y;F[o+7]=s.u1;F[o+8]=s.v0;F[o+9]=al;F[o+10]=P2x;F[o+11]=P2y;F[o+12]=s.u1;F[o+13]=s.v1;F[o+14]=al;
   F[o+15]=P0x;F[o+16]=P0y;F[o+17]=s.u0;F[o+18]=s.v0;F[o+19]=al;F[o+20]=P2x;F[o+21]=P2y;F[o+22]=s.u1;F[o+23]=s.v1;F[o+24]=al;F[o+25]=P3x;F[o+26]=P3y;F[o+27]=s.u0;F[o+28]=s.v1;F[o+29]=al;n++},
  flush(){if(lost)return;if(c.width!==W||c.height!==H){c.width=W;c.height=H}gl.viewport(0,0,W,H);gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(!n)return;
   if(dz){const w=Math.min(AS,dz[2])-dz[0],h=Math.min(AS,dz[3])-dz[1];if(w>0&&h>0&&dz[0]>=0&&dz[1]>=0)gl.texSubImage2D(gl.TEXTURE_2D,0,dz[0],dz[1],gl.RGBA,gl.UNSIGNED_BYTE,ax.getImageData(dz[0],dz[1],w,h));dz=null} // seulement la zone qui a changé
   gl.uniform2f(ur,W,H);gl.bufferSubData(gl.ARRAY_BUFFER,0,F.subarray(0,n*30));gl.enable(gl.SCISSOR_TEST);
   V.forEach((v,i)=>{const e=i+1<V.length?V[i+1].s:n;if(e<=v.s)return;gl.scissor(v.x,H-(v.y+v.h),v.w,v.h);gl.drawArrays(gl.TRIANGLES,v.s*6,(e-v.s)*6)})}}})()});
const colQ=c=>{const m=/^hsl\((\d+)/.exec(c);return m?'hsl('+(Math.round(m[1]/20)*20)+c.slice(c.indexOf(',')):c}; // couleurs arc-en-ciel regroupées (sinon l'atlas déborde)
function glBul(col,r,o){col=colQ(col);const rr=Math.round(r*2)/2,p=Math.ceil(rr+3);return GLR.spr('b'+col+rr+'|'+o,p*2,p*2,x=>{x.globalAlpha=.8;x.fillStyle=COLS[o]||'#fff';x.beginPath();x.arc(p,p,rr+1.8,0,TAU);x.fill();x.globalAlpha=1;x.fillStyle=col;x.beginPath();x.arc(p,p,rr,0,TAU);x.fill();if(rr>=3){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(p,p,rr*.5,0,TAU);x.fill()}})}
function glHeavy(c,r,o,refl){c=colQ(c);const rr=Math.round(r),rf=Math.min(7,refl||0),p=Math.ceil(rr*1.45+4+rf*2);return GLR.spr('h'+c+rr+'|'+o+'|'+rf,p*2,p*2,x=>{x.fillStyle=c;x.beginPath();x.arc(p,p,rr,0,TAU);x.fill();x.strokeStyle=rf?'#6ff':'#fff';x.lineWidth=2+rf*2;x.stroke();if(COLS[o]){x.strokeStyle=COLS[o];x.lineWidth=2.5;x.beginPath();x.arc(p,p,rr+3,0,TAU);x.stroke()}x.globalAlpha=.1;x.beginPath();x.arc(p,p,rr*1.45,0,TAU);x.fill()})}
function glShape(b){const col=colQ(b.c||LCOLS[b.owner]),rr=Math.round(b.r*2)/2,p=Math.ceil(rr*3.4+3);return GLR.spr('s'+b.sh+col+rr+'|'+b.owner+'|'+(b.pill||0),p*2,p*2,x=>{const sv=ctx,sf=frame;ctx=x;frame=0;try{shB({x:p,y:p,r:rr,sh:b.sh,c:col,owner:b.owner,ang:0,pill:b.pill})}finally{ctx=sv;frame=sf}})}
const shRot=b=>b.sh==='star'?frame*.08+b.x*.01:b.sh==='pill'?(b.ang||0)+frame*.04:(b.ang||0);
function glDot(c){c=colQ(c);return GLR.spr('d'+c,10,10,x=>{const g=x.createRadialGradient(5,5,0,5,5,5);g.addColorStop(0,'#fff');g.addColorStop(.3,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,10,10)})}
function glRing(c){c=colQ(c);return GLR.spr('r'+c,36,36,x=>{x.strokeStyle=c;x.lineWidth=2;x.beginPath();x.arc(18,18,16,0,TAU);x.stroke()})}
function ovl(v,fn){const T=ctx.getTransform(),sv=ctx;ctx=OC;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(v.x,v.y,v.w,v.h||H);ctx.clip();ctx.setTransform(T);try{fn()}finally{ctx.restore();ctx=sv}}
DEFER(()=>{{const D0=drawHeavy;drawHeavy=b=>{if(GLR&&ctx===CTX0&&!b.gung&&!b.rifle&&!b.breaker&&!b.kn&&b.dist>=b.m.arm){GLR.push(glHeavy(b.c||COLS[b.owner],b.r,b.owner,b.refl),b.x,b.y,1,0,ctx.globalAlpha);return}D0(b)}}});
DEFER(()=>{{const M0=drawMenu;drawMenu=()=>{M0();if(!GLR){ctx.save();ctx.font='12px monospace';ctx.textAlign='left';ctx.fillStyle='#f88';ctx.fillText('WebGL unavailable — 2D mode',12,H-12);ctx.restore()}}}});


let WT=0;DEFER(()=>{{const W0=updWorld;updWorld=(...a)=>{WT++;return W0(...a)}}});
