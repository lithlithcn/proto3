// @ts-nocheck — legacy drawView effect layers (FX, graze arcs, rings, KO beams, texts, impact lines, cracks, waves, inversion), copied verbatim. Not sim code.
import { FXF } from './fx';
import { COLS, LCOLS } from '../colors';
const TAU = 6.2832, T = { HP: 100, GRAZE_R: 27 };
let ctx, frame, P, FX, TX, RINGS, WAVES, LINES, KOFX, CRACK, GZ, invF, TSTOP, TSO, drawP, perfLow = false, YTBG = 0, CVINV = 0;
const hz=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)}; // legacy 2539
const GLR = null, glRing = null, glDot = null; // legacy WebGL particle path, dead code there (`if(0)`)
export const ctxViewFx = (c, f) => { ctx = c; frame = f; }; // world items draw magic circles without the full view bind
export const bindViewFx = (v) => { ({ ctx, frame, P, FX, TX, RINGS, WAVES, LINES, KOFX, CRACK, GZ, invF, TSTOP, TSO, drawP } = v); };
function hexHue(c){const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c||'');if(!m)return 300;const r=parseInt(m[1],16)/255,g=parseInt(m[2],16)/255,b=parseInt(m[3],16)/255,M=Math.max(r,g,b),n=Math.min(r,g,b),d=M-n;if(!d)return 0;let h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;return(h*60+360)%360}
function koBeam(k,w,len,f){const lo=FXF.low||perfLow,hu=k.hu!==undefined?k.hu:(k.hu=hexHue(k.c)),hs=(d,l)=>`hsl(${(hu+d+360)%360},100%,${l}%)`,al=Math.min(1,f*3);if(w<1)return;
 const Wd=(x,m,ph)=>w*m*(.45+.55*Math.min(1,x/200))*(1+.09*Math.sin(x*.018-frame*.8+ph)+.05*Math.sin(x*.051+frame*1.2+ph*2)+.03*Math.sin(x*.14-frame*2));
 const band=(m,col,a,ph)=>{ctx.globalAlpha=a*al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);for(let x=0;;x+=40){const X=Math.min(x,len);ctx.lineTo(X,-Wd(X,m,ph));if(X>=len)break}for(let x=len;;x-=40){const X=Math.max(x,0);ctx.lineTo(X,Wd(X,m,ph+1.9));if(X<=0)break}ctx.closePath();ctx.fill()};
 ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a);ctx.globalCompositeOperation='lighter';
 if(!lo){band(1.7,hs(-30,40),.16,0);band(1.38,hs(-12,48),.24,2)}band(1.1,hs(0,52),.55,1);band(.9,hs(14,62),.5,3);band(.7,hs(26,74),.5,4);band(.52,hs(10,90),.6,5);band(.36,'#fff',.9,6);
 if(!lo){ctx.lineWidth=2.5;for(const sg of[-1,1]){ctx.strokeStyle=hs(40,82);ctx.globalAlpha=.65*al;ctx.beginPath();for(let x=0;x<=len;x+=24)ctx.lineTo(x,sg*Math.sin(x*.016-frame*.55)*Wd(x,.82,0));ctx.stroke()}
  ctx.strokeStyle=hs(-20,85);ctx.lineWidth=1.8;const fr=frame>>1;for(let i=0;i<8;i++){const x0=hz(i,fr)*Math.max(1,len-200),sg=i%2?1:-1;ctx.globalAlpha=(.4+.5*hz(i,fr+7))*al;ctx.beginPath();for(let j=0;j<=7;j++){const x=x0+j*26;ctx.lineTo(x,sg*(Wd(x,1.12,0)+(hz(i*9+j,fr)-.5)*26))}ctx.stroke()}
  ctx.lineWidth=3;ctx.strokeStyle=hs(0,70);for(let i=0;i<6;i++){const px=((70-k.t)*45+i*560)%Math.max(1,len);ctx.globalAlpha=.45*f;ctx.beginPath();ctx.ellipse(px,0,16,Wd(px,1.5,0),0,0,TAU);ctx.stroke()}
  ctx.fillStyle='#fff';for(let i=0;i<36;i++){const px=(i*157+frame*38)%Math.max(1,len),py=Math.sin(i*12.9+frame*.21)*Wd(px,1.3,i);ctx.globalAlpha=(.4+.5*Math.sin(i+frame*.5))*al;ctx.fillRect(px,py-1,14+w*.15,2)}}
 if(k.edge){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*al;ctx.strokeStyle=k.edge;ctx.lineWidth=Math.max(3,w*.1);ctx.beginPath();ctx.moveTo(w*2,-w*1.15);ctx.lineTo(len,-w*1.15);ctx.moveTo(w*2,w*1.15);ctx.lineTo(len,w*1.15);ctx.stroke();ctx.globalCompositeOperation='lighter'}
 const g=ctx.createRadialGradient(0,0,0,0,0,w*2.3);g.addColorStop(0,'#fff');g.addColorStop(.4,hs(15,70));g.addColorStop(1,'hsla(0,0%,0%,0)');ctx.globalAlpha=al;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,w*2.3,0,TAU);ctx.fill();
 if(k.len!==undefined){const e=ctx.createRadialGradient(len,0,0,len,0,w*1.8);e.addColorStop(0,'#fff');e.addColorStop(.35,hs(20,70));e.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=e;ctx.beginPath();ctx.arc(len,0,w*1.8,0,TAU);ctx.fill()}
 ctx.restore();ctx.save();ctx.globalAlpha=.8*al;magicCircle(k.x,k.y,w*1.05,frame*.09,hs(20,80));magicCircle(k.x,k.y,w*.65,-frame*.14,'#fff');ctx.restore();ctx.globalAlpha=1}
function magicCircle(x,y,r,a,c){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.72,0,TAU);ctx.stroke();
 ctx.beginPath();for(let k=0;k<=96;k++){const aa=k*TAU/96,w=r*(.5+.12*Math.sin(aa*6+frame*.08));ctx.lineTo(Math.cos(aa)*w,Math.sin(aa)*w)}ctx.stroke();ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,r*1.12,k*TAU/3-a*2,k*TAU/3-a*2+.9);ctx.stroke()}ctx.lineWidth=2;for(let k=0;k<6;k++){const aa=k*TAU/6,c1=Math.cos(aa),s1=Math.sin(aa),px=-s1,py=c1;ctx.beginPath();ctx.moveTo(c1*r*.95+px*6,s1*r*.95+py*6);ctx.lineTo(c1*r*.8,s1*r*.8);ctx.lineTo(c1*r*.95-px*6,s1*r*.95-py*6);ctx.stroke()}for(let k=0;k<12;k++){const aa=k*TAU/12;ctx.fillStyle=c;ctx.fillRect(Math.cos(aa)*r*.86-2,Math.sin(aa)*r*.86-2,4,4)}ctx.restore()}
function drawCrack(c){const age=c.T-c.t,grow=Math.min(1,age/9),fade=Math.min(1,c.t/30);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(age<10){ctx.globalAlpha=(1-age/10)*.8;const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,260);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,260,0,TAU);ctx.fill()}
 for(const [col,lw,al] of[['rgba(160,220,255,1)',9,.25],['#fff',3,1]]){ctx.strokeStyle=col;ctx.lineWidth=lw*(.6+.4*fade);ctx.globalAlpha=al*fade;ctx.beginPath();for(const l of c.p){const n=(l.length/2-1)*grow;ctx.moveTo(l[0],l[1]);let i=1;for(;i<=Math.floor(n);i++)ctx.lineTo(l[i*2],l[i*2+1]);const f=n-Math.floor(n);if(f>0&&i*2+1<l.length)ctx.lineTo(l[i*2-2]+(l[i*2]-l[i*2-2])*f,l[i*2-1]+(l[i*2+1]-l[i*2-1])*f)}ctx.stroke()}
 for(const s of c.s){const t=age,x=s.x+s.vx*t,y=s.y+s.vy*t+.25*t*t;ctx.globalAlpha=Math.max(0,1-t/60)*.9;ctx.save();ctx.translate(x,y);ctx.rotate(s.rt*t);ctx.fillStyle='rgba(220,240,255,.35)';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<s.p.length;k+=2)k?ctx.lineTo(s.p[k],s.p[k+1]):ctx.moveTo(s.p[k],s.p[k+1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
 ctx.restore()}
export function drawJuiceWorld(L, Tp, R, Bt, vw, vh) {
 if(0){for(const f of FX){if(f.x<L-30||f.x>R+30||f.y<Tp-30||f.y>Bt+30)continue;const a=Math.min(1,f.t/15);if(f.r)GLR.push(glRing(f.c),f.x,f.y,f.r/16,0,a);else GLR.push(glDot(f.c),f.x,f.y,.6+a*.5,0,a)}}
 else for(const f of FX){if(f.x<L-30||f.x>R+30||f.y<Tp-30||f.y>Bt+30)continue;ctx.globalAlpha=Math.min(1,f.t/15);if(f.r){ctx.strokeStyle=f.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.stroke()}else{const z=1.4+ctx.globalAlpha*1.6;ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y,z,0,TAU);ctx.fill();if(!FXF.low&&!perfLow){ctx.globalAlpha*=.25;ctx.beginPath();ctx.arc(f.x,f.y,z*2.4,0,TAU);ctx.fill()}}}
 ctx.strokeStyle='#fff';ctx.lineWidth=2;for(const g of GZ){ctx.globalAlpha=g.t/10;ctx.beginPath();ctx.arc(g.p.x,g.p.y,T.GRAZE_R+10-g.t,g.a-.35,g.a+.35);ctx.stroke()} // arc de graze
 ctx.save();ctx.globalCompositeOperation='lighter';for(const r of RINGS){const u=Math.min(1,r.t/30);ctx.strokeStyle=r.c;ctx.globalAlpha=u*.22;ctx.lineWidth=14*u+2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,TAU);ctx.stroke();ctx.globalAlpha=u;ctx.lineWidth=4*u+1;ctx.stroke();ctx.globalAlpha=u*.6;ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke()}ctx.restore()
 const ray=(x,y,a,w,L)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a-w)*L,y+Math.sin(a-w)*L);ctx.lineTo(x+Math.cos(a+w)*L,y+Math.sin(a+w)*L);ctx.fill()};
 for(const k of KOFX){const f=k.t/70,w=90*Math.min(1,(70-k.t)/4)*(f<.45?Math.pow(f/.45,.7):1); // rayon de KO
  koBeam(k,w,k.len!==undefined?k.len:3400,f)}
 ctx.textAlign='center';for(const t of TX){ctx.globalAlpha=Math.min(1,t.t/20);ctx.font='bold '+t.z+'px monospace';ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y)}
 ctx.globalAlpha=1;
 ctx.strokeStyle='#fff';ctx.lineCap='round';for(const l of LINES){const f=l.t/l.T,r0=12+(1-f)*30,c=Math.cos(l.a),s=Math.sin(l.a); // lignes d'impact
  const ga=ctx.globalAlpha;ctx.beginPath();ctx.moveTo(l.x+c*r0,l.y+s*r0);ctx.lineTo(l.x+c*(r0+l.len*f),l.y+s*(r0+l.len*f));ctx.globalAlpha=ga*.25;ctx.lineWidth=13*f+1;ctx.stroke();ctx.globalAlpha=ga;ctx.lineWidth=5*f+.5;ctx.stroke()}
 for(const c of CRACK)if(c.s)drawCrack(c);ctx.globalAlpha=1;
 for(const w of WAVES){const f=w.t/w.T,r=(w.T-w.t)*w.spd,th=w.th*f+3; // ondes (inversion des couleurs si inv)
  ctx.beginPath();ctx.arc(w.x,w.y,r+th,0,TAU);ctx.arc(w.x,w.y,r,0,TAU,true);
  if(w.inv&&!FXF.low){if(YTBG>0){ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#14161f';ctx.fill()}ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fill();ctx.globalCompositeOperation='source-over'}
  else{ctx.globalAlpha=f*(FXF.low?.2:.6);ctx.fillStyle=w.c||'#fff';ctx.fill();ctx.globalAlpha=1}}
 if(invF>0&&!FXF.low){if(YTBG>0)CVINV=2;else{ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.globalCompositeOperation='source-over'}}
 if(TSTOP>0&&!FXF.off){if(YTBG>0)CVINV=2;else{ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.globalCompositeOperation='source-over';drawP(P[TSO])}} // The World : monde gris
}
export function drawVignette(v, H, p) {
 for(const q of [p])if(q.state!=='dead'&&q.hp<T.HP*.3){
  const a=(.16+.08*Math.sin(frame*.2))*(1-q.hp/(T.HP*.3)),g=ctx.createRadialGradient(v.x+v.w/2,H/2,Math.min(v.w,H)*.35,v.x+v.w/2,H/2,Math.max(v.w,H)*.7);
  g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(v.x,0,v.w,H)}
}
export const magicCircleL = magicCircle;
export const koBeamL = koBeam, drawCrackL = drawCrack, hexHueL = hexHue;
