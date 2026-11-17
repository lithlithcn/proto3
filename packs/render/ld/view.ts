// @ts-nocheck — legacy drawView (camera, floor, cards, light + heavy bullets, players, world items, effects, tags, indicators) and its helpers, copied verbatim. Not sim code.
import { FXF } from './fx';
import { COLS, LCOLS } from '../colors';
import { drawP } from './layers';
import { drawWorldItems } from './world';
import { koBeamL as koBeam, drawCrackL as drawCrack, hexHueL as hexHue } from './viewfx';
const TAU = 6.2832;
let ctx, frame, P, B, ENT, CX = {}, cams, MVIEW, T, BGH = [], TIMER = 0, STOCKS = [0], stI = 0, performance = { now: () => 0 }, CARDS = [], ITEMS = [], item = null, hitstop = 0, perfLow = false, debug = false, GLR = null, WARP = 0, TEAMS = 0, NET = null, fixedMap = 0, TCH = { on: false }, ACC = { shk: 1, ui: 1 };
let bodyR, coreR, FX, TX, RINGS, WAVES, LINES, KOFX, CRACK, GZ, invF, TSTOP, TSO, shake, kx, ky, zk, bgF, NERV, slow, LS;
let VIEW = 0, CVINV = 0; // CVINV: canvas invert, only with the YouTube background (YTBG, not ported)
 const CS = 40, CMAP = null, WG = null, TPS = [], OC = null, CTX0 = null, GFX = [], YTBG = 0, NETNAMES = null, TEAMA = [];
const shN = (t, k) => Math.sin(t * 1.7 + k) * 0.5 + Math.sin(t * 2.9 + k * 3) * 0.3 + Math.sin(t * 5.3 + k * 7) * 0.2, kV = () => (0.35 + 0.065 * NERV) * ACC.shk, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TN = ['FIRE', 'WATER', 'WOOD', 'METAL', 'EARTH'], TC = ['#ff5030', '#3a7fff', '#5cff7a', '#e0e6f0', '#c8a050'];
const NCOL = [0, '#ffffff', '#ff5a5a', '#ffa63a', '#ffe83a', '#7cff6a', '#3affd0', '#5ab0ff', '#a07cff', '#ff7ce0', 'rainbow'];
const rainbowCol = () => `hsl(${frame * 6 % 360},100%,65%)`, itemCol = k => k === 'rainbow' ? rainbowCol() : (ITEMS.find(i => i.k === k) || {}).c || '#fff';
const capOf = it => it.type === 'rainbow' ? T.LW_CAP : T.ITEM_CAP, ally = (a, b) => !!a && !!b && a !== b && TEAMS && TEAMA[a.id] === TEAMA[b.id];
let profOf = () => null; export const setProfOf = (f) => { profOf = f; }; // player profiles (name, colour, animation) live in the ui pack
const mapLayers = () => {}, drawDebugWorld = () => {}, glShape = () => {}, glRing = () => {}, glHeavy = () => {}, glDot = () => {}, glBul = () => {}; // no profiles / maps / WebGL yet
let H = 720, SCv = 1;
const SPRC = new Map(), document = globalThis.document ?? { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => {} }) }) };
export const bindView = (v) => { ({ ctx, frame, P, CX, B, ENT, cams, MVIEW, T, CARDS, performance, STOCKS, stI, ITEMS, item, hitstop, FX, TX, RINGS, WAVES, LINES, KOFX, CRACK, GZ, invF, TSTOP, TSO, shake, kx, ky, zk, bgF, NERV, slow, WARP, TEAMS, H, SCv, bodyR, coreR } = v); };
function drawView0(v){
 const sw=CX.swap,vi=sw&&sw.a===v.i?sw.b:sw&&sw.b===v.i?sw.a:v.i,p=P[vi]||P[v.i],o=p.tgt||P[(v.i+1)%P.length],cam=cams[v.i],vw=v.w/SCv,vh=H/SCv;
 if(v.fixed){cam.x=T.MAP_W/2;cam.y=T.MAP_H/2}
 else{if(p.state!=='dead'){let ox=(o.x-p.x)*.3,oy=(o.y-p.y)*.3;const l=Math.hypot(ox,oy);if(l>220){ox*=220/l;oy*=220/l}
  cam.x+=(p.x+ox-cam.x)*.12;cam.y+=(p.y+oy-cam.y)*.12}
  cam.x=vw>=T.MAP_W?T.MAP_W/2:clamp(cam.x,vw/2,T.MAP_W-vw/2);cam.y=vh>=T.MAP_H?T.MAP_H/2:clamp(cam.y,vh/2,T.MAP_H-vh/2)}
 const fr=(FXF.low?.2:1)*kV(),sx=((shake?shN(frame*.9,1.3)*shake*.55:0)+kx)*fr,sy=((shake?shN(frame*.9+77,2.1)*shake*.55:0)+ky)*fr;
 ctx.save();ctx.beginPath();ctx.rect(v.x,0,v.w,H);ctx.clip();
 ctx.translate(v.x+v.w/2+sx,H/2+sy);ctx.scale(SCv,SCv);ctx.translate(-cam.x,-cam.y);MVIEW[v.i]={ox:v.x+v.w/2,oy:v.y+H/2,sc:SCv,cx:cam.x,cy:cam.y};if(GLR)GLR.view(ctx.getTransform(),v.x,v.y,v.w,v.h||H);
 const L=cam.x-vw/2,Tp=cam.y-vh/2,R=L+vw,Bt=Tp+vh;
 ctx.fillStyle='#14161f';ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 if(bgF.t>0){ctx.globalAlpha=bgF.t/12*(FXF.low?.08:.28);ctx.fillStyle=bgF.c;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);ctx.globalAlpha=1} // le sol réagit aux gros coups
 ctx.strokeStyle='#1f2333';ctx.lineWidth=1;ctx.beginPath();
 for(let x=Math.max(0,Math.ceil(L/100)*100);x<=Math.min(T.MAP_W,R);x+=100){ctx.moveTo(x,Math.max(0,Tp));ctx.lineTo(x,Math.min(T.MAP_H,Bt))}
 for(let y=Math.max(0,Math.ceil(Tp/100)*100);y<=Math.min(T.MAP_H,Bt);y+=100){ctx.moveTo(Math.max(0,L),y);ctx.lineTo(Math.min(T.MAP_W,R),y)}
 ctx.stroke();if(YTBG>0){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=YTBG;ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.restore()} // vidéo YouTube derrière le sol
 const E=T.EDGE;ctx.fillStyle=WARP>0?'rgba(180,90,255,'+(.12+.06*Math.sin(frame*.2))+')':'rgba(255,35,50,'+(.13+.03*Math.sin(frame*.06))+')';
 ctx.fillRect(0,0,T.MAP_W,E);ctx.fillRect(0,T.MAP_H-E,T.MAP_W,E);ctx.fillRect(0,E,E,T.MAP_H-2*E);ctx.fillRect(T.MAP_W-E,E,E,T.MAP_H-2*E);
 if(WARP<=0){ctx.save();ctx.strokeStyle='#ff2a3c';ctx.globalAlpha=.12+.05*Math.sin(frame*.06);ctx.lineWidth=14;ctx.strokeRect(E,E,T.MAP_W-2*E,T.MAP_H-2*E);ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.setLineDash([22,14]);ctx.lineDashOffset=-frame*.6;ctx.strokeRect(E,E,T.MAP_W-2*E,T.MAP_H-2*E);ctx.restore()}ctx.strokeStyle=WARP>0?'#b5f':'#ff2a3c';ctx.lineWidth=5;ctx.strokeRect(0,0,T.MAP_W,T.MAP_H);for(const f of BGH)f(L,Tp,R,Bt);
 for(const q of P)if(q.state==='spell'&&q.state!=='dead')spellCircle(q);for(const q of P.filter(q=>q.state==='spell').slice(-1)){ctx.fillStyle=q.id?'rgba(255,210,60,.025)':'rgba(255,70,90,.025)';ctx.fillRect(0,0,T.MAP_W,T.MAP_H); // fond de spell : rayons tournants (discrets)
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(frame*.01*(q.id?-1:1));ctx.fillStyle=COLS[q.id];ctx.globalAlpha=FXF.low?.02:.04;ctx.beginPath();
  for(let i=0;i<12;i++){const a=i*TAU/12;ctx.moveTo(0,0);ctx.arc(0,0,1600,a,a+TAU/24)}ctx.fill();ctx.restore();ctx.globalAlpha=1}
 {for(const c of CARDS){item=c;drawItem()}item=CARDS[0]||null}
 const inV=b=>b.x>L-30&&b.x<R+30&&b.y>Tp-30&&b.y<Bt+30;
 {const vp=P[VIEW];LPV=vp&&!vp.cpu?vp:null;for(LPASS=1;LPASS>=0;LPASS--){LPA=(LPASS?.45:1)*.8;ctx.globalAlpha=LPA; // balles alliées estompées
 if(GLR){for(const b of B)if(!b.heavy&&inV(b)&&LPF(b)){if(b.sh){const S=glShape(b);GLR.push(S,b.x,b.y,1,shRot(b),LPA)}else GLR.push(glBul(b.c||LCOLS[b.owner],b.r,b.owner),b.x,b.y,1,0,LPA)}}
 else for(const b of B)if(!b.heavy&&!b.sh&&inV(b)&&LPF(b)){const S=bSpr(b.c||LCOLS[b.owner],b.r,b.owner);ctx.drawImage(S,b.x-S.o,b.y-S.o)} // même rendu qu'avant, mis en cache
 if(!GLR)for(const b of B)if(b.sh&&!b.heavy&&inV(b)&&LPF(b))shB(b);
 }ctx.globalAlpha=1;if(!GLR)drawDanger()}
 for(const b of B)if(b.heavy&&inV(b))drawHeavy(b);
 drawMapObj(L,Tp,R,Bt);VIEW=p.id;for(const q of P)drawP(q);mapFG(L,Tp,R,Bt);
 drawWorldItems();drawViewFx(p,L,Tp,vw,vh);
 if(GLR){for(const f of FX){if(f.x<L-30||f.x>R+30||f.y<Tp-30||f.y>Bt+30)continue;const a=Math.min(1,f.t/15);if(f.r)GLR.push(glRing(f.c),f.x,f.y,f.r/16,0,a);else GLR.push(glDot(f.c),f.x,f.y,.6+a*.5,0,a)}}
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
 if(GLR&&OC)ovl(v,()=>{drawTags(L,R);drawDanger()});else drawTags(L,R);if(debug)drawDebugWorld();
 ctx.restore();
 for(const q of v.fixed?P:[p])if(q.state!=='dead'&&q.hp<T.HP*.3){ // vignette rouge quand la vie est basse
  const a=(.16+.08*Math.sin(frame*.2))*(1-q.hp/(T.HP*.3)),g=ctx.createRadialGradient(v.x+v.w/2,H/2,Math.min(v.w,H)*.35,v.x+v.w/2,H/2,Math.max(v.w,H)*.7);
  g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(v.x,0,v.w,H)}
 if(!v.fixed)drawIndicators(v,p,o,cam)}
function drawHeavy0(b){
 if(b.gung){const l=Math.hypot(b.vx,b.vy)||1;ctx.lineCap='round';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(b.x-b.vx/l*56,b.y-b.vy/l*56);ctx.lineTo(b.x+b.vx/l*14,b.y+b.vy/l*14);ctx.stroke();ctx.strokeStyle='#e0302f';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(b.x-b.vx/l*56,b.y-b.vy/l*56);ctx.lineTo(b.x+b.vx/l*14,b.y+b.vy/l*14);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();return}
 if(b.rifle){ctx.lineCap='round';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(b.x-b.vx*2,b.y-b.vy*2);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle=b.oneshot?'#f44':'#fff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(b.x-b.vx*2,b.y-b.vy*2);ctx.lineTo(b.x,b.y);ctx.stroke();return}
 const armed=b.dist>=b.m.arm,r=b.r*(armed?1:.35+.65*b.dist/b.m.arm),c=b.c||COLS[b.owner];
 ctx.beginPath();ctx.arc(b.x,b.y,r,0,TAU);
 if(armed){ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=b.refl?'#6ff':'#fff';ctx.lineWidth=2+(b.refl||0)*2;ctx.stroke();if(COLS[b.owner]){ctx.strokeStyle=COLS[b.owner];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,r+3,0,TAU);ctx.stroke()}
  ctx.globalAlpha=.1;ctx.beginPath();ctx.arc(b.x,b.y,r*1.45,0,TAU);ctx.fill();ctx.globalAlpha=1}
 else{ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke()}}
function drawHeavy_2513(b){const D0=drawHeavy0;if(GLR&&ctx===CTX0&&!b.gung&&!b.rifle&&!b.breaker&&!b.kn&&b.dist>=b.m.arm){GLR.push(glHeavy(b.c||COLS[b.owner],b.r,b.owner,b.refl),b.x,b.y,1,0,ctx.globalAlpha);return}D0(b)}
function drawHeavy_2520(b){const H0=drawHeavy_2513;if(!b.dango)return H0(b);const a=Math.atan2(b.vy,b.vx),c=Math.cos(a),s=Math.sin(a),r=b.r*.62;ctx.strokeStyle='#a0703a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x-c*r*3.4,b.y-s*r*3.4);ctx.lineTo(b.x+c*r*2.6,b.y+s*r*2.6);ctx.stroke();
 const C=['#ff9ec4','#fff4e0','#8fd46a'];for(let i=0;i<3;i++){const k=(i-1)*r*1.7;ctx.fillStyle=C[i];ctx.beginPath();ctx.arc(b.x+c*k,b.y+s*k,r,0,TAU);ctx.fill();ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=2;ctx.stroke()}}
function drawHeavy_2608(b){const H0=drawHeavy_2520;if(!b.stone)return H0(b);ctx.fillStyle='#9a8c78';ctx.strokeStyle=COLS[b.owner]||'#5a5044';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7+frame*.2,r=b.r*(.85+.3*hz(i,7));i?ctx.lineTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r):ctx.moveTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke()}
function drawHeavy_2787(b){const H0=drawHeavy_2608;if(!b.knife)return H0(b);const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#e8f4ff';ctx.strokeStyle=COLS[b.owner]||'#9ab';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-2,-4);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#556';ctx.fillRect(-12,-2.5,10,5);ctx.fillStyle='#ffd040';ctx.fillRect(-3,-6,2,12);ctx.restore()}
const drawHeavy=drawHeavy_2787;
function sgTree(e){const x=e.x,y=e.y,S=1.9,sw=Math.sin(frame*.015)*6;
 ctx.fillStyle='#2a1420';ctx.beginPath();ctx.moveTo(x-46*S,y+40);ctx.bezierCurveTo(x-20*S,y-10,x-26*S,y-70*S,x-14*S+sw,y-120*S);ctx.lineTo(x+14*S+sw,y-120*S);ctx.bezierCurveTo(x+24*S,y-70*S,x+18*S,y-10,x+50*S,y+40);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#3e2030';ctx.lineWidth=6;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+s*4*S+sw*.5,y-90*S);ctx.quadraticCurveTo(x+s*50*S,y-140*S,x+s*95*S+sw,y-150*S);ctx.stroke();ctx.beginPath();ctx.moveTo(x+s*6*S+sw*.6,y-110*S);ctx.quadraticCurveTo(x+s*30*S,y-170*S,x+s*55*S+sw,y-195*S);ctx.stroke()}
 const ry=y-44*S;ctx.strokeStyle='#e8dcb0';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x-30*S,ry);ctx.quadraticCurveTo(x,ry+12*S,x+30*S,ry);ctx.stroke();ctx.strokeStyle='#b8a878';ctx.lineWidth=3;for(let i=0;i<9;i++){const u=i/8,px=x-30*S+60*S*u,py=ry+12*S*4*u*(1-u);ctx.beginPath();ctx.moveTo(px-6,py-5);ctx.lineTo(px+6,py+5);ctx.stroke()}
 ctx.fillStyle='#fff';for(const u of[.2,.5,.8]){const px=x-30*S+60*S*u,py=ry+12*S*4*u*(1-u)+6;ctx.beginPath();ctx.moveTo(px-6,py);ctx.lineTo(px+6,py);ctx.lineTo(px,py+12);ctx.lineTo(px+6,py+12);ctx.lineTo(px-2,py+26);ctx.lineTo(px+4,py+26);ctx.lineTo(px-4,py+38);ctx.closePath();ctx.fill()}
 const cy=y-165*S,fl=e.fl>0;ctx.save();ctx.globalCompositeOperation='lighter';const ag=ctx.createRadialGradient(x,cy,30,x,cy,150*S);ag.addColorStop(0,'rgba(255,140,210,.35)');ag.addColorStop(1,'rgba(160,60,255,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(x,cy,150*S,0,TAU);ctx.fill();ctx.restore();
 for(let i=0;i<70;i++){const a=hz(i,5)*TAU,d=Math.sqrt(hz(i,6))*92*S,bx=x+Math.cos(a)*d*1.15+sw*(d/(92*S)),by=cy+Math.sin(a)*d*.62,r=(16+hz(i,7)*20)*S*.62;ctx.fillStyle=fl?'#fff':['#c23a7a','#d9508f','#f27ab0','#ff9ccb'][i%4];ctx.beginPath();ctx.arc(bx,by,r,0,TAU);ctx.fill()}
 for(let i=0;i<40;i++){const a=hz(i,8)*TAU,d=Math.sqrt(hz(i,9))*80*S;ctx.fillStyle='rgba(255,220,240,.55)';ctx.beginPath();ctx.arc(x+Math.cos(a)*d*1.1+sw,cy+Math.sin(a)*d*.55-10,(5+hz(i,10)*9)*S*.5,0,TAU);ctx.fill()}}
const DBG={h:200,sp:null,k:0};
function dbgProg(){let p=0;if(TIMER>0&&typeof TN!=='undefined'){}const al=P.filter(q=>q.state!=='dead'||q.stocks>0);const s0=STOCKS[stI]||3;if(al.length){const mn=Math.min(...al.map(q=>q.stocks));p=Math.max(p,1-mn/Math.max(1,s0))}if(TIMER>0)p=Math.max(p,Math.min(1,frame/(TIMER*3600)));return Math.min(1,p)}
function dynBG(L,Tp,R,Bt){if(ENT.some(e=>e.k==='tree'))return;const now=performance.now(),dt=Math.min(50,now-(DBG.t||now));DBG.t=now;
 const sp=P.find(q=>q.state==='spell'),pr=dbgProg();DBG.h=(DBG.h+dt*.024*(1+pr*1.5))%360;DBG.k+=((sp?1:0)-DBG.k)*Math.min(1,dt*.004);if(sp)DBG.sh=hexHue(COLS[sp.id]);
 let h=DBG.h;if(DBG.k>.01&&DBG.sh!==undefined){let d=((DBG.sh-h+540)%360)-180;h=(h+d*DBG.k+360)%360}
 const lo=FXF.low||perfLow,t=now*.001,W2=R-L,H2=Bt-Tp,cx=(L+R)/2,cy=(Tp+Bt)/2;ctx.save();
 const g=ctx.createLinearGradient(0,Tp,0,Bt);g.addColorStop(0,`hsla(${h},70%,28%,.30)`);g.addColorStop(.6,`hsla(${(h+40)%360},60%,14%,.12)`);g.addColorStop(1,`hsla(${(h+80)%360},70%,22%,.22)`);ctx.fillStyle=g;ctx.fillRect(L,Tp,W2,H2);
 ctx.globalCompositeOperation='lighter';
 if(!lo)for(let i=0;i<4;i++){const hh=(h+i*35)%360,yb=Tp+H2*(.22+i*.17)+Math.sin(t*.25+i*1.7)*H2*.08,a=Math.max(W2,H2),amp=H2*(.06+.03*i);ctx.fillStyle=`hsla(${hh},90%,60%,${.05+.02*(i%2)})`;ctx.beginPath();
  for(let k=0;k<=24;k++){const x=L-40+(W2+80)*k/24,y=yb+Math.sin(x*.0035+t*(.5+i*.13)+i)*amp+Math.sin(x*.009-t*.7)*amp*.4;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  for(let k=24;k>=0;k--){const x=L-40+(W2+80)*k/24,y=yb+H2*(.06+.02*i)+Math.sin(x*.003+t*(.42+i*.1)+i*2)*amp*1.2;ctx.lineTo(x,y)}ctx.closePath();ctx.fill()}
 {const g2=ctx.createLinearGradient(L,Tp,R,Bt);g2.addColorStop(0,`hsla(${(h+180)%360},70%,40%,.06)`);g2.addColorStop(.5,'hsla(0,0%,0%,0)');g2.addColorStop(1,`hsla(${(h+120)%360},80%,45%,.07)`);ctx.fillStyle=g2;ctx.fillRect(L,Tp,W2,H2);
  const g3=ctx.createLinearGradient(0,Bt-H2*.35,0,Bt);g3.addColorStop(0,'hsla(0,0%,0%,0)');g3.addColorStop(1,`hsla(${(h+30)%360},90%,55%,.09)`);ctx.fillStyle=g3;ctx.fillRect(L,Bt-H2*.35,W2,H2*.35)}
 if(!lo){for(let i=0;i<6;i++){const s1=hz(i,21),s2=hz(i,22),nx=T.MAP_W*(.5+.48*Math.sin(t*.021*(1+i*.27)+s1*6.3)),ny=T.MAP_H*(.5+.45*Math.cos(t*.017*(1+i*.31)+s2*6.3)),nr=650+s2*600;
   if(nx+nr<L||nx-nr>R||ny+nr<Tp||ny-nr>Bt)continue;const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr),hh=(h+50+i*60)%360,pu=.75+.25*Math.sin(t*.4+i*2);ng.addColorStop(0,`hsla(${hh},85%,60%,${.075*pu})`);ng.addColorStop(.45,`hsla(${(hh+35)%360},80%,45%,${.035*pu})`);ng.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=ng;ctx.fillRect(Math.max(L,nx-nr),Math.max(Tp,ny-nr),Math.min(R,nx+nr)-Math.max(L,nx-nr),Math.min(Bt,ny+nr)-Math.max(Tp,ny-nr))}
  for(let i=0;i<3;i++){const hh=(h+150+i*40)%360,yb=Tp+H2*(.12+i*.24)+Math.sin(t*.19+i*2.3)*H2*.06,ch=H2*(.22+.06*i),cg=ctx.createLinearGradient(0,0,0,1),M0=ctx.getTransform();cg.addColorStop(0,'hsla(0,0%,0%,0)');cg.addColorStop(.25,`hsla(${hh},95%,65%,.10)`);cg.addColorStop(.6,`hsla(${(hh+40)%360},90%,55%,.04)`);cg.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=cg;
   const n=90,sw=(W2+80)/n;for(let k=0;k<n;k++){const x=L-40+k*sw,w0=Math.sin(x*.004+t*(.35+i*.11)+i*3),y=yb+w0*H2*.05+Math.sin(x*.011-t*.6+i)*H2*.015,hh2=ch*(.45+.35*Math.sin(x*.017+t*(.9+i*.2))+.2*Math.sin(x*.043-t*1.3+i));ctx.globalAlpha=.3+.7*Math.max(0,Math.sin(x*.006-t*.5+i*1.7))*(.6+.4*Math.sin(k*1.7+t*3));ctx.translate(x,y-hh2*.25);ctx.scale(1,hh2*1.5);ctx.fillRect(0,0,sw*1.05,1);ctx.setTransform(M0)}ctx.globalAlpha=1}
  for(let i=0;i<3;i++){const P0=6+i*2.7,ph=(t+i*3.1)/P0,n=Math.floor(ph),u=ph-n;if(u>.1)continue;const v=u/.1,an=.35+hz(n,33+i)*.5,sx=L+W2*(.1+.7*hz(n,31+i)),sy=Tp+H2*.45*hz(n,32+i),ln=260+120*hz(n,34),hx=sx+Math.cos(an)*v*W2*.45,hy=sy+Math.sin(an)*v*W2*.45,tg=ctx.createLinearGradient(hx,hy,hx-Math.cos(an)*ln,hy-Math.sin(an)*ln);
   tg.addColorStop(0,`hsla(${(h+200)%360},100%,92%,${.55*(1-v*.6)})`);tg.addColorStop(1,'hsla(0,0%,0%,0)');ctx.strokeStyle=tg;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-Math.cos(an)*ln,hy-Math.sin(an)*ln);ctx.stroke();ctx.fillStyle=`hsla(${(h+200)%360},100%,95%,${.7*(1-v*.5)})`;ctx.beginPath();ctx.arc(hx,hy,2.4,0,TAU);ctx.fill()}}
 if(!lo){const N=60;for(let i=0;i<N;i++){const s1=hz(i,11),s2=hz(i,12),x=L+((s1*W2+Math.sin(t*.6+i)*30)%W2+W2)%W2,y=Bt-((t*(18+s2*30)+s2*H2)%H2),r=.6+hz(i,13)*1.1,a=.18+.22*Math.sin(t*2+i);
  ctx.fillStyle=`hsla(${(h+s1*90)%360},90%,70%,${a*.4})`;ctx.beginPath();ctx.arc(x,y,r*3.2,0,TAU);ctx.fill();ctx.fillStyle=`hsla(${(h+s1*90)%360},80%,80%,${a})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}}
 if(DBG.k>.05){ctx.globalAlpha=DBG.k*.35;const rg=ctx.createRadialGradient(sp?sp.x:cx,sp?sp.y:cy,0,sp?sp.x:cx,sp?sp.y:cy,Math.max(W2,H2)*.7);rg.addColorStop(0,`hsla(${h},90%,60%,.5)`);rg.addColorStop(1,`hsla(${h},90%,40%,0)`);ctx.fillStyle=rg;ctx.fillRect(L,Tp,W2,H2)}
 ctx.restore()}
function sgBG(L,Tp,R,Bt){const e=ENT.find(e=>e.k==='tree');if(!e)return;const k=Math.min(1,(frame-(e.sp||frame))/60+.05);ctx.save();ctx.globalAlpha=k;
 const g=ctx.createLinearGradient(0,0,0,T.MAP_H);g.addColorStop(0,'#1a0a2e');g.addColorStop(.55,'#3a1048');g.addColorStop(1,'#140818');ctx.fillStyle=g;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 const mg=ctx.createRadialGradient(e.x,e.y-380,20,e.x,e.y-380,900);mg.addColorStop(0,'rgba(255,170,220,.35)');mg.addColorStop(.4,'rgba(200,90,255,.14)');mg.addColorStop(1,'rgba(40,0,60,0)');ctx.fillStyle=mg;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 for(const [c,a,o] of[['#24102e',.9,0],['#2e1438',.8,1]]){ctx.fillStyle=c;ctx.globalAlpha=k*a;ctx.beginPath();ctx.moveTo(0,T.MAP_H);for(let x=0;x<=T.MAP_W;x+=120){const y=T.MAP_H*(.55+o*.12)-Math.abs(Math.sin(x*.0021+o*2))*260-Math.sin(x*.007+o)*40;ctx.lineTo(x,y)}ctx.lineTo(T.MAP_W,T.MAP_H);ctx.fill()}
 ctx.globalAlpha=k;sgTree(e);
 ctx.fillStyle='#ffb7d5';for(let i=0;i<90;i++){const s=hz(i,1),x=(s*T.MAP_W+frame*(1+s)*1.2+Math.sin(frame*.02+i)*40)%T.MAP_W,y=(hz(i,2)*T.MAP_H+frame*(1.6+hz(i,3)*1.5))%T.MAP_H;ctx.globalAlpha=k*(.5+.5*hz(i,4));ctx.save();ctx.translate(x,y);ctx.rotate(frame*.03+i);ctx.beginPath();ctx.ellipse(0,0,7,3.5,0,0,TAU);ctx.fill();ctx.restore()}
 ctx.restore()}
function bar(x,y,w,h,f,c){ctx.fillStyle='#222';ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,w*clamp(f,0,1),h)}
function ovl(v,fn){const T=ctx.getTransform(),sv=ctx;ctx=OC;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(v.x,v.y,v.w,v.h||H);ctx.clip();ctx.setTransform(T);try{fn()}finally{ctx.restore();ctx=sv}}
const NOBUF=new Set(['next','prev','shot','focus']);let LPASS=0,LPA=1,LPV=null;
const LPF=b=>{if(!LPV)return LPASS===0;const al=b.owner===LPV.id||(TEAMS&&P[b.owner]&&ally(P[b.owner],LPV));return LPASS?al:!al};
const tpCol=i=>'hsl('+((i>>1)*80+180)%360+',90%,65%)';
function spellCircle(q){const c=COLS[q.id],hu=hexHue(c),r=bodyR(q)*2.4+30+Math.sin(frame*.12)*3,a=frame*.025*(q.id%2?-1:1),hs=(d,l,al)=>`hsla(${(hu+d+360)%360},100%,${l}%,${al})`;ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';
 const g=ctx.createRadialGradient(0,0,r*.3,0,0,r*1.35);g.addColorStop(0,'hsla(0,0%,0%,0)');g.addColorStop(.7,hs(0,60,.16));g.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.35,0,TAU);ctx.fill();
 ctx.rotate(a);ctx.strokeStyle=hs(0,65,.25);ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.strokeStyle=hs(10,80,.9);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,r*.8,0,TAU);ctx.stroke();
 ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<36;k++){const aa=k*TAU/36,l=k%3?.9:.82;ctx.moveTo(Math.cos(aa)*r*l,Math.sin(aa)*r*l);ctx.lineTo(Math.cos(aa)*r*.97,Math.sin(aa)*r*.97)}ctx.stroke();
 ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=hs(30,85,.8);const GL='風火水雷光速力夢';for(let k=0;k<8;k++){const aa=k*TAU/8+TAU/16;ctx.save();ctx.rotate(aa);ctx.translate(0,-r*.885);ctx.fillText(GL[(k+(frame>>5))%8],0,0);ctx.restore()}
 ctx.rotate(-a*2.4);ctx.strokeStyle=hs(-15,75,.85);ctx.lineWidth=1.6;ctx.beginPath();for(let k=0;k<=140;k++){const aa=k*TAU/140,w=r*(.62+.1*Math.sin(aa*7+frame*.1)*Math.cos(aa*2-frame*.03));ctx.lineTo(Math.cos(aa)*w,Math.sin(aa)*w)}ctx.stroke();ctx.setLineDash([6,8]);ctx.beginPath();ctx.arc(0,0,r*.5,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(0,0,r*.3,0,TAU);ctx.stroke();
 ctx.fillStyle=hs(20,90,.95);for(let k=0;k<7;k++){const aa=k*TAU/7-Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(aa)*r*.76,Math.sin(aa)*r*.76,2.6,0,TAU);ctx.fill()}
 ctx.rotate(a*3.4);for(let k=0;k<4;k++){const aa=k*TAU/4;ctx.globalAlpha=.6+.4*Math.sin(frame*.2+k);ctx.beginPath();ctx.arc(Math.cos(aa)*r*1.12,Math.sin(aa)*r*1.12,3,0,TAU);ctx.fill()}ctx.restore()}
const shRot=b=>b.sh==='star'?frame*.08+b.x*.01:b.sh==='pill'?(b.ang||0)+frame*.04:(b.ang||0);
const pname=p=>{if(typeof NET!=='undefined'&&NET&&NETNAMES&&NETNAMES[p.id])return NETNAMES[p.id];const f=!p.cpu&&profOf(p.id);return f?f.n:(p.cpu?'CPU ':'P')+(p.id+1)}; // nom du profil si assigné
const ncol=(c,d)=>NCOL[c]==='rainbow'?rainbowCol():NCOL[c]||d;
function miniHUD(q,R,el,er){const hide=CX.anon>0||q.fx&&q.fx.koishi>0,flip=q.y>T.MAP_H-150/SCv,w=116,x=clamp(0,el+64,er-64)-w/2,y=flip?-R-84:R+10; // près du bas : HUD au-dessus du nom
 if(!hide){ctx.globalAlpha=.6;ctx.fillStyle='rgba(4,5,11,.4)';ctx.fillRect(x-4,y-4,w+8,47);ctx.strokeStyle=COLS[q.id];ctx.lineWidth=1.5;ctx.strokeRect(x-4,y-4,w+8,47);
  const hp=q.wsA?T.HP-Math.max(0,q.hp):Math.max(0,q.hp);ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillStyle='#ff7090';ctx.fillText(q.stocks>4?'♥x'+q.stocks:'♥'.repeat(Math.max(0,q.stocks)),x,y+8);
  bar(x,y+11,w,11,hp/T.HP,hp>50?'#4e6':hp>25?'#ec4':'#f44');ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.font='bold 10px monospace';ctx.strokeText(Math.ceil(hp),0,y+20);ctx.fillStyle='#fff';ctx.fillText(Math.ceil(hp),0,y+20);
  bar(x,y+24,w,4,q.spirit/T.SPIRIT_MAX,q.ult?rainbowCol():q.spirit>=T.SPELL_COST?'#f8f':'#58c');
  bar(x,y+30,w*.36,4,q.burst/T.BURST_MAX,q.burst>=T.BURST_MAX?'#fc4':'#7a5a30');
  for(let i=0;i<T.DASH_CHARGES;i++){ctx.fillStyle=q.boost-i>=1?'#fff':'#444';ctx.fillRect(x+w*.41+i*10,y+30,8,4)}
  for(let i=0;i<T.PIPS;i++){ctx.fillStyle=i<q.pips?'#f55':'#3a2226';ctx.fillRect(x+w-(T.PIPS-i)*10+2,y+30,8,4)}
  bar(x,y+37,w,3,(q.pg??100)/100,(q.pg??100)<35?(frame&8?'#6ff':'#244'):'#6ff')}
 ctx.globalAlpha=1}
function mapFG(L,Tp,R,Bt){if(!CMAP)return;mapLayers(true,L,Tp,R,Bt);const mb=CX.mb;if(mb&&mb.length){ctx.save();for(const b of mb){ctx.fillStyle=b.c;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(b.x,b.y,b.r*1.8,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.55,0,TAU);ctx.fill();ctx.strokeStyle=b.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.stroke()}ctx.restore()}
 const w=CX.mwind;if(w&&!FXF.low){ctx.save();ctx.strokeStyle='rgba(220,240,255,.25)';ctx.lineWidth=2;for(let i=0;i<30;i++){const x=L+((i*137+frame*9*Math.cos(w.a))%(R-L+400)+(R-L+400))%(R-L+400)-200,y=Tp+((i*97+frame*9*Math.sin(w.a))%(Bt-Tp+400)+(Bt-Tp+400))%(Bt-Tp+400)-200;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(w.a)*60,y-Math.sin(w.a)*60);ctx.stroke()}ctx.restore()}}
const hz=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)};
function chView(L,Tp,vw,vh){ // voiles plein écran (coordonnées monde)
 if(CX.terr)for(const k of CX.terr.L){ctx.globalAlpha=.06;ctx.fillStyle=TC[k];ctx.fillRect(L,Tp,vw,vh)}ctx.globalAlpha=1;
 if(CX.shr&&CX.shr.x0!==undefined){const s=CX.shr;ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(L,Tp,vw,s.y0-Tp);ctx.fillRect(L,s.y1,vw,Tp+vh-s.y1);ctx.fillRect(L,s.y0,s.x0-L,s.y1-s.y0);ctx.fillRect(s.x1,s.y0,L+vw-s.x1,s.y1-s.y0);
  ctx.strokeStyle='#e04a4a';ctx.lineWidth=4;ctx.strokeRect(s.x0,s.y0,s.x1-s.x0,s.y1-s.y0)}
 if(CX.myst){const o=P[CX.myst.o];if(o&&o.state!=='dead'){const e=480-CX.myst.t,r=70+(1-Math.min(1,e/180))*1500,g=ctx.createRadialGradient(o.x,o.y,r,o.x,o.y,r+60); // Mystia
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.985*Math.min(1,CX.myst.t/30))+')');ctx.fillStyle=g;ctx.fillRect(L,Tp,vw,vh)}}
 ctx.textAlign='center';ctx.font='bold 22px monospace';let y=Tp+70;
 if(CX.terr){ctx.fillStyle='#b07cd8';ctx.fillText(CX.terr.L.map(k=>TN[k]).join(' + '),L+vw/2,y);y+=26}
 if(CX.rule&&CX.rule.k){ctx.fillStyle='#ff8fb0';ctx.fillText('RULE: '+CX.rule.k,L+vw/2,y);y+=26}
 if(CX.yuyu){ctx.fillStyle='#ff9ad5';ctx.fillText('DEATH IN '+Math.ceil(CX.yuyu.t/60)+' — LOWEST HP DIES',L+vw/2,y)}}
function chView2(L,Tp,vw,vh){
 if(CX.hell){const w=T.EDGE+CX.hell.w;ctx.fillStyle='rgba(255,80,30,'+(.18+.06*Math.sin(frame*.2))+')';ctx.fillRect(0,0,T.MAP_W,w);ctx.fillRect(0,T.MAP_H-w,T.MAP_W,w);ctx.fillRect(0,w,w,T.MAP_H-2*w);ctx.fillRect(T.MAP_W-w,w,w,T.MAP_H-2*w)}
 if(CX.flood){const F=CX.flood;ctx.fillStyle='rgba(40,100,255,.28)';ctx.fillRect(0,F.lvl,T.MAP_W,T.MAP_H-F.lvl);ctx.strokeStyle='rgba(160,210,255,.8)';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=T.MAP_W;x+=40)ctx.lineTo(x,F.lvl+Math.sin(x*.02+frame*.08)*5);ctx.stroke()}
 if(CX.leaf){ctx.fillStyle='rgba(255,140,40,.08)';ctx.fillRect(L,Tp,vw,vh);for(let i=0;i<40;i++){const x=L+((i*137+frame*(1+i%3))%vw),y=Tp+((i*89+frame*(2+i%4))%vh);ctx.fillStyle=['#ff8a2a','#e0502a','#ffc040'][i%3];ctx.beginPath();ctx.ellipse(x,y,7,3.5,frame*.05+i,0,TAU);ctx.fill()}}
 if(CX.rain){ctx.fillStyle='rgba(60,80,140,.12)';ctx.fillRect(L,Tp,vw,vh)}}
const CBS=['▲','■','●','◆','★','✚','◐','✦'];
function bSpr(col,r,o){const rr=Math.round(r*2)/2,key=col+rr+'|'+o;let S=SPRC.get(key);if(S)return S;const p=Math.ceil(rr+3),c=document.createElement('canvas');c.width=c.height=p*2;const x=c.getContext('2d');
 x.globalAlpha=.8;x.fillStyle=COLS[o]||'#fff';x.beginPath();x.arc(p,p,rr+1.8,0,TAU);x.fill();x.globalAlpha=1;x.fillStyle=col;x.beginPath();x.arc(p,p,rr,0,TAU);x.fill();
 if(rr>=3){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(p,p,rr*.5,0,TAU);x.fill()}c.o=p;if(SPRC.size>600)SPRC.clear();SPRC.set(key,c);return c}
function shB(b){const c=b.c||LCOLS[b.owner],oc=COLS[b.owner]||'#fff',r=b.r;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.sh==='star'?frame*.08+b.x*.01:b.ang||0);ctx.lineWidth=1.5;ctx.strokeStyle=oc;ctx.fillStyle=c;ctx.beginPath();
 if(b.sh==='rice'){ctx.ellipse(0,0,r*2.1,r*1.15,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*.5,0,0,TAU);ctx.fill()}
 else if(b.sh==='kunai'){ctx.moveTo(r*3,0);ctx.lineTo(-r*1.6,r*1.3);ctx.lineTo(-r*.7,0);ctx.lineTo(-r*1.6,-r*1.3);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(r*2.2,0);ctx.lineTo(-r*.5,0);ctx.stroke()}
 else if(b.sh==='star'){for(let i=0;i<10;i++){const q=i%2?r*.9:r*2.1,a=i*Math.PI/5;ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.6,0,TAU);ctx.fill()}
 else if(b.sh==='bubble'){ctx.globalAlpha=.4;ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.78,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-r*.35,-r*.35,r*.2,0,TAU);ctx.fill()}
 else if(b.sh==='pill'){ctx.rotate(frame*.04);const w=r*1.25,h=r*.62;ctx.fillStyle=b.pill===1?'#ff3355':'#3a7fff';ctx.beginPath();ctx.arc(-w*.5,0,h,Math.PI/2,Math.PI*1.5);ctx.lineTo(0,-h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();ctx.fillStyle=b.pill===1?'#3a7fff':'#ff3355';ctx.beginPath();ctx.arc(w*.5,0,h,-Math.PI/2,Math.PI/2);ctx.lineTo(0,h);ctx.lineTo(0,-h);ctx.closePath();ctx.fill();
  ctx.strokeStyle=oc;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-w*.5,0,h,Math.PI/2,Math.PI*1.5);ctx.lineTo(w*.5,-h);ctx.arc(w*.5,0,h,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(-w*.7,-h*.55,w*1.1,h*.3)}
 else{ctx.arc(0,0,r+1,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.5,0,TAU);ctx.fill()}ctx.restore()}
function drawItem(){
 const s=14+3*Math.sin(frame*.15),ic=itemCol(item.type);
 ctx.save();ctx.translate(item.x,item.y);
 ctx.strokeStyle=ic;ctx.lineWidth=2;ctx.setLineDash(item.on?[]:[6,6]);ctx.beginPath();ctx.arc(0,0,T.ITEM_R,0,TAU);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle=ic;ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(ITEMS.find(i=>i.k===item.type).name,0,-T.ITEM_R-34); // nom de l'objet
 if(item.on){ctx.rotate(frame*.03);ctx.fillStyle=ic;ctx.fillRect(-s/2,-s*.7,s,s*1.4);ctx.rotate(-frame*.03);
  item.cp.forEach((cp,i)=>{if(cp<=0)return;const f=cp/capOf(item),r=T.ITEM_R+12+i*10,a0=-Math.PI/2; // chargement de la prise
   ctx.lineWidth=8;ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
   ctx.globalAlpha=.35;ctx.lineWidth=16;ctx.strokeStyle=COLS[i];ctx.beginPath();ctx.arc(0,0,r,a0,a0+TAU*f);ctx.stroke();
   ctx.globalAlpha=1;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,r,a0,a0+TAU*f);ctx.stroke();
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(Math.cos(a0+TAU*f)*r,Math.sin(a0+TAU*f)*r,5,0,TAU);ctx.fill();
   ctx.fillStyle=COLS[i];ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText((f*100|0)+'%',0,T.ITEM_R+40+i*10)});
  if(item.cont){ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('CONTESTED',0,-T.ITEM_R-16)}}
 ctx.restore()}
function drawDanger(){const v=LPV;if(!v||v.state==='dead')return;ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=1.6; // danger proche : contour net
 for(const b of B){if(b.dead||b.heavy&&b.breaker)continue;if(b.owner===v.id||TEAMS&&P[b.owner]&&ally(P[b.owner],v))continue;const d=Math.hypot(b.x-v.x,b.y-v.y);if(d>72)continue;ctx.globalAlpha=Math.min(1,(72-d)/40);ctx.beginPath();ctx.arc(b.x,b.y,(b.heavy?b.r:b.r)+2.5,0,TAU);ctx.stroke()}
 for(const b of B)if(!b.dead&&b.bf!==undefined&&frame-b.bf<7){const u=(frame-b.bf)/7;ctx.globalAlpha=.7*(1-u);ctx.strokeStyle=b.c||COLS[b.owner]||'#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*(2.6-1.6*u),0,TAU);ctx.stroke()} // apparition
 ctx.restore()}
function drawViewFx(p,L,Tp,vw,vh){
 if(GFX.some(g=>g.k==='ice')){ctx.fillStyle='rgba(180,225,255,.08)';ctx.fillRect(L,Tp,vw,vh)}
 chView(L,Tp,vw,vh);chView2(L,Tp,vw,vh)}
function drawTags(VL,VR){const k=1/SCv,now=performance.now()/1000;
 for(const q of P){const dead=q.state==='dead',dp=dead&&q.dX!==undefined,x=dp?q.dX:q.x,y=dp?q.dY:q.y,R=bodyR(q)*SCv;
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);
  const f=!q.cpu&&profOf(q.id);let al=1,sx=1,dy=0;
  if(dead){const u=Math.min(1,(now-(q.dRT||0)/1000)/1.3),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;sx=Math.cos(e*TAU*2);dy=-24*e;al=1-(q.stocks>0?.45:.7)*e} // mort : spin fluide du nom
  if(q.fx&&q.fx.koishi>0)al*=.3;ctx.globalAlpha=al;
  drawName(CX.anon>0?'???':(ACC.cb?CBS[q.id%8]+' ':'')+pname(q),0,-R-18+dy,f?ncol(f.c,COLS[q.id]):COLS[q.id],f?f.a:0,now+q.id,sx);
  if(!dead&&q.state!=='eaten')miniHUD(q,R,(VL-x)*SCv,(VR-x)*SCv);ctx.restore()}ctx.globalAlpha=1}
function drawName(s,x,y,c,a,t,sx=1){ctx.save();ctx.translate(x,y);
 if(a===1||a===3)ctx.translate(0,Math.sin(t*3)*3);if(a===2||a===3)ctx.rotate(Math.sin(t*2.2)*.15);if(a===5){const z=1+.1*Math.sin(t*4);ctx.scale(z,z)}if(a===6){ctx.translate(Math.sin(t*2)*5,0);ctx.rotate(Math.sin(t*2)*.1)}
 ctx.scale(sx,1);ctx.font='bold 17px monospace';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.85)';ctx.fillStyle=c;
 if(a===4){let px=-ctx.measureText(s).width/2;ctx.textAlign='left';for(let i=0;i<s.length;i++){const yy=Math.sin(t*5-i*.6)*3;ctx.strokeText(s[i],px,yy);ctx.fillText(s[i],px,yy);px+=ctx.measureText(s[i]).width}}
 else{ctx.textAlign='center';ctx.strokeText(s,0,0);ctx.fillText(s,0,0)}ctx.restore()}
function drawIndicators(v,p,o,cam){
 if(p.state==='dead')return;const pad=28,cx=v.x+v.w/2,cy=H/2;
 const edge=(x,y,col,label,sz)=>{
  const sx=cx+(x-cam.x)*SCv,sy=cy+(y-cam.y)*SCv;
  if(sx>v.x+pad&&sx<v.x+v.w-pad&&sy>pad&&sy<H-pad)return false;
  const dx=sx-cx,dy=sy-cy,k=Math.min((v.w/2-pad)/Math.abs(dx||1e-6),(H/2-pad)/Math.abs(dy||1e-6)),ex=cx+dx*k,ey=cy+dy*k,a=Math.atan2(dy,dx);
  ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(sz,0);ctx.lineTo(-sz,-sz*.7);ctx.lineTo(-sz,sz*.7);ctx.fill();ctx.restore();
  if(label){ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText(label,ex-Math.cos(a)*26,ey-Math.sin(a)*26+4)}return true};
 for(const q of P)if(q!==p&&q.state!=='dead')edge(q.x,q.y,COLS[q.id],Math.round(Math.hypot(q.x-p.x,q.y-p.y)/10)+'m',14);
 let n=0;for(const b of B){if(!b.heavy||b.owner===p.id||n>5)continue; // alerte lourde hors-champ
  const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy),sp=Math.hypot(b.vx,b.vy);
  if(d>900||(b.vx*dx+b.vy*dy)/(d*sp)<.8)continue;if(edge(b.x,b.y,'#f33','!',9))n++}
 if(item)edge(item.x,item.y,'#f8f','',10)}
function drawMapObj(L,Tp,R,Bt){if(!WG)return;const M=CMAP;ctx.fillStyle='#2b2546';ctx.strokeStyle='#7a6aff';ctx.lineWidth=2;
 for(let gy=Math.max(0,Tp/CS|0);gy<=Math.min(M.ch-1,Bt/CS|0);gy++)for(let gx=Math.max(0,L/CS|0);gx<=Math.min(M.cw-1,R/CS|0);gx++)if(WG[gy*M.cw+gx]){ctx.fillRect(gx*CS,gy*CS,CS,CS);ctx.strokeRect(gx*CS+1,gy*CS+1,CS-2,CS-2)}
 for(const t of TPS){const c=tpCol(t.i);ctx.strokeStyle=c;ctx.lineWidth=3;for(let k=0;k<2;k++){ctx.beginPath();ctx.arc(t.x,t.y,16+k*6,frame*.05*(k?-1:1),frame*.05*(k?-1:1)+TAU*.75);ctx.stroke()}ctx.globalAlpha=.25;ctx.fillStyle=c;ctx.beginPath();ctx.arc(t.x,t.y,14,0,TAU);ctx.fill();ctx.globalAlpha=1}}
BGH = [dynBG, sgBG, (L,Tp,R,Bt)=>{const D=CX.don;if(!D)return;}, (L,Tp,R,Bt)=>{if(CMAP){}}]; // + donation box / custom map backgrounds (lot 3/4)
export { drawView0 as drawView };
