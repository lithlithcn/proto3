// @ts-nocheck — legacy drawWorldItems (+ its EDR / Reimu / UFO wrappers) and every entity drawing EDR.*, copied verbatim. Not sim code.
import { COLS, LCOLS } from '../colors';
import { W_ } from './chars';
import { ifxUnder, ifxOver } from './ifx';
import { chDraw, chDraw2, chDraw3, chDraw4, chDraw5 } from './themed';
const TAU = 6.2832, T = { MAP_W: 2000, MAP_H: 1350, BODY_R: 16, BEAM_PARRY: 12 }, RB = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'];
const FLC = ['#ff4a4a', '#ffa33a', '#ffe83a', '#5cff7a', '#4ab3ff', '#7a5cff', '#ff5cf0'], HEC = ['#4ab3ff', '#ffe88a', '#ff4a6a'], SEAC = ['#ffb0d6', '#ff7a3a', '#ffb04a', '#bfe8ff'];
let ctx, frame, P, ENT, KOB, HOLES, BUMPS, PHOTO, ZONES, ORBS, FAIRIES, CLOUDS = [], JUDG = [], SLASH = [], IM, CX = {}, bodyR, magicCircle, fxLow = false, perfLow = false;
let B = [], TEST = null; const TRX = {}, FC = [], mtnDraw = () => {}, zigzag = () => {}; // themed-item helpers (lot 3)
const rainbowCol = () => `hsl(${frame * 6 % 360},100%,65%)`;
const hz=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)}; // legacy 2539
export const bindWorld = (v) => { ({ ctx, frame, P, B, ENT, KOB, HOLES, BUMPS, PHOTO, ZONES, ORBS, FAIRIES, IM, bodyR, magicCircle } = v); };
const EDR = {};
function rYY(x,y,r,a,al){ctx.globalAlpha=al;const c=Math.cos(a)*r/2,s=Math.sin(a)*r/2;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x,y,r,a,a+Math.PI);ctx.fill();
 ctx.beginPath();ctx.arc(x+c,y+s,r/2,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-c,y-s,r/2,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x+c,y+s,r/6,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x-c,y-s,r/6,0,TAU);ctx.fill();
 ctx.strokeStyle='#300';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
function rBorder(e){const sp=Math.min(1,(300-e.t)/8),w=e.w*sp,h=e.h,fl=e.fl&&frame-e.fl<5;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.a);ctx.globalAlpha=e.t<60&&(frame>>2)%2?.5:1;ctx.globalCompositeOperation='lighter';
 for(let i=4;i>=1;i--){ctx.fillStyle=`rgba(40,120,255,${.06*(5-i)})`;ctx.fillRect(-w-i*6,-h-i*6,(w+i*6)*2,(h+i*6)*2)} // halo
 const g=ctx.createLinearGradient(0,-h,0,h);g.addColorStop(0,'rgba(170,230,255,.95)');g.addColorStop(.18,'rgba(60,150,255,.55)');g.addColorStop(.5,'rgba(30,110,255,.35)');g.addColorStop(.82,'rgba(60,150,255,.55)');g.addColorStop(1,'rgba(170,230,255,.95)');
 ctx.fillStyle=fl?'rgba(220,245,255,.85)':g;ctx.fillRect(-w,-h,w*2,h*2);ctx.strokeStyle='#d8f4ff';ctx.lineWidth=3;ctx.strokeRect(-w,-h,w*2,h*2);
 ctx.strokeStyle='rgba(200,240,255,.75)';ctx.lineWidth=1.5;ctx.strokeRect(-w+6,-h+5,w*2-12,h*2-10);ctx.strokeRect(-w+11,-h+9,w*2-22,h*2-18); // cadres intérieurs comme la porte
 ctx.strokeStyle='rgba(190,235,255,.35)';ctx.lineWidth=1;for(let x=-w+16;x<w-14;x+=9){ctx.beginPath();ctx.moveTo(x,-h+9);ctx.lineTo(x,h-9);ctx.stroke()}
 const s=(frame*3)%(w*2+60)-w-30;ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(Math.max(-w,s-7),-h,Math.min(14,w-s+7),h*2);ctx.restore()}
function sparkFX(p){const L=2600,lo=fxLow||perfLow,hw=118+Math.sin(frame*.9)*7; // Master Spark façon Touhou : cœur blanc, flammes orange/rose, runes néon, étoiles
 const W=(x,k,ph=0)=>hw*k*(.35+.65*Math.min(1,x/300))*(1+.1*Math.sin(x*.02-frame*.5+ph)+.06*Math.sin(x*.057+frame*.8+ph*2)+.04*Math.sin(x*.13-frame*1.3));
 const band=(k,col,al,ph)=>{ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);for(let x=0;x<=L;x+=40)ctx.lineTo(x,-W(x,k,ph));for(let x=L;x>=0;x-=40)ctx.lineTo(x,W(x,k,ph+1.7));ctx.closePath();ctx.fill()};
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spkA);ctx.globalCompositeOperation='lighter';
 if(!lo){band(1.45,'#ff2ab0',.22,0);band(1.25,'#ff40c8',.3,2)} // halo rose/magenta
 band(1.08,'#ff5a1a',.6,1);band(.9,'#ff9a30',.55,3);band(.72,'#ffd050',.5,4); // flammes orange → jaune
 band(.55,'#fff2c0',.6,5);band(.4,'#fff',.85,6); // cœur blanc brûlant
 const g=ctx.createRadialGradient(0,0,0,0,0,hw*1.6);g.addColorStop(0,'#fff');g.addColorStop(.45,'rgba(255,220,120,.9)');g.addColorStop(1,'rgba(255,60,180,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,hw*1.6,0,TAU);ctx.fill();
 ctx.globalCompositeOperation='source-over';if(!lo){const GL='マスタースパーク',NC=['#ff3ad0','#3affd0','#7cff3a','#ffe83a','#5ab0ff','#ff6a3a'];ctx.textAlign='center';ctx.textBaseline='middle'; // runes néon étirées, sur les bords
  for(let i=0;i<22;i++){const x=((i*173+frame*20)%(L-200))+60,side=i%2?1:-1,y=side*W(x,.7+((i*37)%55)/100,i),fl=.55+.45*Math.sin(frame*.7+i*2);ctx.save();ctx.translate(x,y);ctx.scale(.9,1.9);ctx.globalAlpha=fl;ctx.font='bold 16px monospace';ctx.fillStyle=NC[(i+(frame>>3))%NC.length];
   for(let c=0;c<5;c++)ctx.fillText(GL[(i*3+c+(frame>>4))%GL.length],0,(c-2)*15);ctx.restore()}}
 ctx.globalCompositeOperation='source-over';
 for(let i=0;i<(lo?14:40);i++){const t=(frame*.018+i*.137)%1,px=t*1700+(i*53)%120,py=Math.sin(i*7.7)*hw*(1.1+t*2.4),r=7+(i%5)*3; // étoiles arc-en-ciel
  ctx.globalAlpha=1-t*.7;ctx.fillStyle=RB[i%6];if(!lo&&i%3===0){ctx.globalAlpha*=.35;starPath(px,py,r*1.6,frame*.08+i);ctx.fill();ctx.globalAlpha=1-t*.7}starPath(px,py,r,frame*.08+i);ctx.fill();ctx.shadowBlur=0}
 ctx.restore();ctx.globalAlpha=1}
function starPath(x,y,r,a){ctx.beginPath();for(let k=0;k<10;k++){const rr=k%2?r*.42:r,aa=a+k*Math.PI/5;ctx.lineTo(x+Math.cos(aa)*rr,y+Math.sin(aa)*rr)}ctx.closePath()}
function rGohei(x,y,a,L){const c=Math.cos(a),s=Math.sin(a),tx=x+c*L,ty=y+s*L;ctx.strokeStyle='#8a5a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
 ctx.strokeStyle='#fff';ctx.lineWidth=2.5;for(const sg of[-1,1]){ctx.beginPath();ctx.moveTo(tx,ty);for(let i=1;i<=4;i++){const d=i*5,o=(i%2?7:3)*sg;ctx.lineTo(tx-c*d-s*o,ty-s*d+c*o)}ctx.stroke()}}
const planet=(x,y,b,r)=>{ctx.fillStyle=HEC[b];ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle=b===0?'#5cc04a':b===1?'#c8b870':'#ffb030';ctx.beginPath();ctx.arc(x-r*.3,y-r*.2,r*.35,0,TAU);ctx.arc(x+r*.35,y+r*.3,r*.22,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke()};
const mouseD=(x,y,a,al)=>{ctx.globalAlpha=al;ctx.fillStyle='#9a9aa8';ctx.beginPath();ctx.ellipse(x,y,8,5.5,a,0,TAU);ctx.fill();const hx=x+Math.cos(a)*7,hy=y+Math.sin(a)*7;ctx.beginPath();ctx.arc(hx,hy,4,0,TAU);ctx.fill();ctx.fillStyle='#ffb0c0';for(const s of[-1,1]){ctx.beginPath();ctx.arc(hx-Math.sin(a)*s*4-Math.cos(a)*2,hy+Math.cos(a)*s*4-Math.sin(a)*2,2.4,0,TAU);ctx.fill()}ln(x-Math.cos(a)*7,y-Math.sin(a)*7,x-Math.cos(a)*16+Math.sin(frame*.3)*3,y-Math.sin(a)*16,'#ffb0c0',1.5);ctx.globalAlpha=1};
const ln=(x,y,x2,y2,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()};
const stF=(x,y,r,c)=>{starPath(x,y,r,frame*.1);ctx.fillStyle=c||'#ffe14a';ctx.fill()};
EDR.cray=e=>{const age=e.T-e.t,x2=e.x+Math.cos(e.a)*e.len,y2=e.y+Math.sin(e.a)*e.len;ctx.save();ctx.lineCap='round';
 if(age<e.tele){if(e.warn){const pr=age/e.tele; // avertissement long : tirets, clignote de plus en plus vite, blancs juste avant le tir
  ctx.lineCap='butt';ctx.globalAlpha=.4+.35*(.5+.5*Math.sin(frame*(.3+pr*1.2)));ctx.strokeStyle=e.tele-age<10?'#fff':e.c;ctx.lineWidth=Math.max(3,e.w);ctx.setLineDash([16,12]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();return}
  ctx.globalAlpha=.35+.3*Math.sin(frame*.8);ctx.strokeStyle=e.c;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();return}
 const k=Math.min(1,e.t/6),fl=1+.12*Math.sin(frame*1.3);ctx.globalCompositeOperation='lighter';
 for(const[w,al,c]of[[e.w*2.6,.18,e.c],[e.w*1.7,.45,e.c],[e.w*.8,.9,'#fff']]){ctx.globalAlpha=al*k;ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,w*fl);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke()}ctx.restore()};
EDR.mtr=e=>{if(e.aya){ctx.globalAlpha=e.t/20*.6;ctx.fillStyle='#bfffe0';ctx.beginPath();ctx.arc(e.x,e.y,8,0,TAU);ctx.fill();ctx.globalAlpha=1;return}ctx.globalAlpha=e.t/40;stF(e.x,e.y,3+e.t/10);ctx.globalAlpha=1};
EDR.mpot=e=>{const u=1-e.t/e.T,h=Math.sin(u*Math.PI)*40;ctx.fillStyle='#c070ff';ctx.beginPath();ctx.arc(e.x,e.y-h,6,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(e.x-2,e.y-h-10,4,5)};
EDR.mpud=e=>{ctx.globalAlpha=.55;ctx.fillStyle='#7a3ad0';ctx.beginPath();ctx.ellipse(e.x,e.y,44,30,0,0,TAU);ctx.fill();ctx.globalAlpha=1;for(let i=0;i<4;i++){const a=frame*.05+i*1.6;stF(e.x+Math.cos(a)*22,e.y+Math.sin(a)*14,4)}};
EDR.fsb=e=>{const u=e.t/e.T;ctx.strokeStyle=e.c;ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,30*u+8,0,TAU);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=e.c;const y=e.y-e.t*5;ctx.beginPath();ctx.moveTo(e.x,y-9);ctx.lineTo(e.x+5,y);ctx.lineTo(e.x,y+9);ctx.lineTo(e.x-5,y);ctx.fill()};
EDR.fcl=e=>{const age=e.T-e.t;ctx.globalAlpha=age<30?age/30*.7:.7;ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.arc(e.x,e.y,13,0,TAU);ctx.fill();ctx.fillStyle='#d02020';ctx.fillRect(e.x-10,e.y-15,20,6);for(const s of[-1,1])for(let i=0;i<3;i++){ctx.fillStyle=FLC[i*2+(s>0)];ctx.beginPath();ctx.arc(e.x+s*(14+i*5),e.y-4+i*4,3,0,TAU);ctx.fill()}ctx.globalAlpha=1};
EDR.hst=e=>{ctx.globalAlpha=.35+.15*Math.sin(frame*.2);ctx.fillStyle=HEC[e.b];ctx.beginPath();ctx.arc(e.x,e.y,14,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1};
EDR.hpl=e=>{ctx.globalAlpha=.3;ctx.fillStyle=HEC[e.b];ctx.beginPath();ctx.arc(e.x,e.y,22,0,TAU);ctx.fill();ctx.globalAlpha=1;planet(e.x,e.y,e.b,14)};
EDR.hrg=e=>planet(e.x,e.y,e.i,10);
EDR.ncl=e=>{ctx.globalAlpha=.7;for(let i=0;i<3;i++){ctx.fillStyle=i?'#2a1a40':'#120a20';ctx.beginPath();ctx.arc(e.x+(i-1)*6,e.y+(i%2)*3,7-i,0,TAU);ctx.fill()}ctx.fillStyle=(frame>>3)%2?'#ff2a4a':'#4a6aff';ctx.beginPath();ctx.arc(e.x,e.y,1.6,0,TAU);ctx.fill();ctx.globalAlpha=1};
EDR.nst=e=>{ctx.globalAlpha=.75;for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#2a2a3a':'#1a1a28';ctx.beginPath();ctx.arc(e.x+(i-2)*10,e.y+Math.sin(i)*5,12-Math.abs(i-2)*2,0,TAU);ctx.fill()}if((frame%40)<3){ctx.strokeStyle='#e0e0ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+6,e.y+12);ctx.lineTo(e.x-3,e.y+18);ctx.stroke()}ctx.globalAlpha=1};
EDR.odr=e=>{ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='rgba(255,210,60,.18)';ctx.fillRect(e.x-18,e.y-26,36,52);ctx.fillStyle='#0a0612';ctx.fillRect(e.x-11,e.y-19,22,38);ctx.strokeStyle='#ffd23a';ctx.lineWidth=3;ctx.strokeRect(e.x-13,e.y-21,26,42);
 ctx.globalAlpha=.5+.3*Math.sin(frame*.1);ctx.strokeStyle='#fff6c0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x,e.y,8,0,TAU);ctx.stroke();ctx.restore()};
EDR.obd=e=>{ctx.save();ctx.translate(e.x,e.y);const s=Math.min(1,(e.T-e.t)/8);ctx.scale(s,s);ctx.fillStyle='#0a0612';ctx.fillRect(-22,-32,44,64);ctx.strokeStyle='#ffd23a';ctx.lineWidth=4;ctx.strokeRect(-24,-34,48,68);
 ctx.strokeStyle='rgba(255,230,120,.6)';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<3;i++)ctx.arc(0,0,10+i*7,frame*.2+i,frame*.2+i+4);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(e.n,0,48);ctx.restore()};
EDR.odn_old=e=>{const c=e.i?'#ff5cf0':'#5cff7a';ctx.fillStyle=c;ctx.beginPath();ctx.arc(e.x,e.y,9,0,TAU);ctx.fill();ctx.fillStyle='#ffe0c0';ctx.beginPath();ctx.arc(e.x,e.y-11,6,0,TAU);ctx.fill();ln(e.x+8,e.y,e.x+18,e.y-14,e.i?'#c070ff':'#3ac05a',3)};
EDR.npd=e=>{const r=e.big?26:14;ln(e.ax,e.ay,e.x,e.y,'#ccc',e.big?3:2);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.moveTo(e.x,e.y-r);ctx.lineTo(e.x+r*.7,e.y);ctx.lineTo(e.x,e.y+r*1.3);ctx.lineTo(e.x-r*.7,e.y);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke()};
EDR.npg=e=>{const o=P[e.o];if(o)ln(o.x,o.y,e.x,e.y,'rgba(200,200,220,.5)',1.5);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.moveTo(e.x,e.y-10);ctx.lineTo(e.x+7,e.y);ctx.lineTo(e.x,e.y+12);ctx.lineTo(e.x-7,e.y);ctx.fill()};
EDR.ntr=e=>{const o=P[e.o];if(!o||!o.focus)return;const d=Math.hypot(e.x-o.x,e.y-o.y);if(d>170)return;ctx.globalAlpha=(1-d/170)*.9;ctx.strokeStyle='#ffd23a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,6+(frame%24),0,TAU);ctx.stroke();stF(e.x,e.y,5);ctx.globalAlpha=1};
EDR.atn=e=>{ctx.save();ctx.globalAlpha=.6;for(let i=0;i<6;i++){const r=10+i*6,y=e.y-i*7;ctx.strokeStyle=i%2?'#bfffe0':'#5cc04a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x+Math.sin(frame*.3+i)*4,y,r,r*.35,0,frame*.4+i,frame*.4+i+4.5);ctx.stroke()}ctx.restore()};
EDR.aph=e=>{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.a);ctx.globalAlpha=e.t/12;ctx.fillStyle='#fff';ctx.fillRect(-e.S,-e.S*.75,e.S*2,e.S*1.5);ctx.restore()};
EDR.anw=e=>{ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(frame*.05)*.05);const s=Math.min(1,(150-e.t)/8);ctx.scale(s,s);ctx.globalAlpha=e.t<20?e.t/20:1;ctx.fillStyle='#f4efe2';ctx.fillRect(-120,-85,240,170);ctx.fillStyle='#e04a4a';ctx.fillRect(-120,-85,240,26);
 ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('BUNBUNMARU',0,-66);ctx.fillStyle='#888';for(let i=0;i<7;i++)ctx.fillRect(-108,-48+i*17,i%3?216:100,6);ctx.fillStyle='#aaa';ctx.fillRect(4,-48,104,60);ctx.restore()};
EDR.awd=e=>{const c=Math.cos(e.a),s=Math.sin(e.a);ctx.strokeStyle='rgba(200,255,230,.35)';ctx.lineWidth=2;for(const q of P){if(q.state==='dead')continue;for(let i=0;i<4;i++){const k=((frame*6+i*53+q.id*31)%160)-80,o=(i-1.5)*18;const x=q.x+c*k-s*o,y=q.y+s*k+c*o;ln(x,y,x-c*26,y-s*26,'rgba(200,255,230,.35)',2)}}};
EDR.odn=e=>{const c=e.i?'#5cff7a':'#ff7ad0',b=Math.sin(frame*.25+e.i*2)*3,sp=frame*.15*(e.i?1:-1),S=ENT.find(z=>z.k==='odn'&&z.o===e.o&&z.t>0&&z!==e);
 if(S&&e.i){ctx.setLineDash([6,8]);ln(e.x,e.y,S.x,S.y,'rgba(255,230,140,.35)',2);ctx.setLineDash([])}
 ctx.strokeStyle=c;ctx.globalAlpha=.35;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,30,0,TAU);ctx.stroke();ctx.globalAlpha=1;
 ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(e.x-11,e.y+12+b);ctx.lineTo(e.x+11,e.y+12+b);ctx.lineTo(e.x,e.y-6+b);ctx.fill();ctx.fillStyle='#ffe0c0';ctx.beginPath();ctx.arc(e.x,e.y-11+b,6,0,TAU);ctx.fill();
 for(const s of[-1,1]){const a=sp+(s>0?0:Math.PI);ln(e.x,e.y-2+b,e.x+Math.cos(a)*15,e.y-2+b+Math.sin(a)*15,e.i?'#3ac05a':'#d04a8a',3);ctx.fillStyle=e.i?'#9aff8a':'#ff9ad0';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*16,e.y-2+b+Math.sin(a)*16,3.5,0,TAU);ctx.fill()}
 ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,34,-Math.PI/2,-Math.PI/2+TAU*e.t/300);ctx.stroke()};
EDR.ffl=e=>{const k=e.t/45;ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const f=Math.sin(frame*.7+e.x+i*2);ctx.globalAlpha=k*(.5-i*.12);ctx.fillStyle=['#ff3a10','#ff9a20','#ffe080'][i];ctx.beginPath();ctx.ellipse(e.x+f*2,e.y-i*4-(1-k)*8,9-i*2.5,12-i*3,0,0,TAU);ctx.fill()}};
EDR.flv=e=>{ctx.translate(e.x,e.y);ctx.rotate(e.sp);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.fillStyle='#ff5a10';ctx.beginPath();ctx.arc(0,0,30,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';W_.laev(-28,0,0,56)};
EDR.nms=e=>mouseD(e.x,e.y,e.a||e.i,e.t<60&&(frame>>2)%2?.4:1);
EDR.nrc=e=>mouseD(e.x,e.y,e.a||0,1);
EDR.ncn=e=>{ctx.globalAlpha=e.t/16*.45;ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.arc(e.x,e.y,420,e.a-.5,e.a+.5);ctx.closePath();ctx.fill();ctx.globalAlpha=1};
EDR.ncoin=e=>{const u=1-e.t/e.T,h=Math.sin(u*Math.PI)*50;ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.ellipse(e.x,e.y-h,8,8*Math.abs(Math.cos(frame*.3)),0,0,TAU);ctx.fill();ctx.strokeStyle='#a07a10';ctx.lineWidth=2;ctx.stroke()};
EDR.snote=e=>{const u=e.t/e.T;ctx.strokeStyle='#ff8fd0';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,30*u+8,0,TAU);ctx.stroke();ctx.globalAlpha=1;const y=e.y-e.t*6;ctx.fillStyle='#ff8fd0';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('♪',e.x,y+10)};
{const E0=EDR.odr;EDR.odr=e=>{E0(e);if(e.hp!==undefined&&e.hp<50){ctx.fillStyle='#000';ctx.fillRect(e.x-16,e.y-32,32,5);ctx.fillStyle='#ffd23a';ctx.fillRect(e.x-16,e.y-32,32*Math.max(0,e.hp)/50,5)}}}
function W_base(){
 for(const c of CLOUDS){ctx.globalAlpha=Math.min(.35,c.t/180*.5);ctx.fillStyle='#a050ff';const fy=Math.sin(frame*.04+(c.ph||0))*5,K=c.k||[1,1,1,1,1];ctx.beginPath();for(let i=0;i<5;i++){const a=i*TAU/5+(c.ph||0)+frame*.01,x=c.x+Math.cos(a)*c.r*.45,y=c.y+fy+Math.sin(a)*c.r*.4,r=c.r*.62*K[i];ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU)}ctx.fill()}ctx.globalAlpha=1; // nuages difformes qui flottent
 for(const j of JUDG){if(j.t>0){const f=1-j.t/70;ctx.globalAlpha=.08+.12*f;ctx.fillStyle='#3a7f5a';ctx.fillRect(0,j.y-32,T.MAP_W,64);ctx.fillRect(j.x-32,0,64,T.MAP_H);
   ctx.globalAlpha=.4+.6*f;ctx.fillStyle='#9f9';ctx.fillRect(0,j.y-1-f*2,T.MAP_W,2+f*4);ctx.fillRect(j.x-1-f*2,0,2+f*4,T.MAP_H)}
  else{const w=32*(1+j.t/14);ctx.globalAlpha=1;ctx.fillStyle='#d9ffe6';ctx.fillRect(0,j.y-w,T.MAP_W,w*2);ctx.fillRect(j.x-w,0,w*2,T.MAP_H)}}ctx.globalAlpha=1;
 ctx.lineCap='round';for(const s of SLASH){ctx.strokeStyle=COLS[s.o];ctx.globalAlpha=s.t>10?.5:s.t/10;ctx.lineWidth=(s.t>10?2:14*s.t/10+2)+6;ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.strokeStyle='#fff';if(s.t>10){ctx.globalAlpha=.4;ctx.lineWidth=2}else{ctx.globalAlpha=s.t/10;ctx.lineWidth=14*s.t/10+2}ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke()}ctx.globalAlpha=1;
 chDraw();chDraw2();chDraw3();chDraw4();chDraw5();

 for(const h of HOLES){const r=h.r||30;ctx.save();ctx.translate(h.x,h.y);for(let i=0;i<3;i++){ctx.rotate(h.a*.3);ctx.strokeStyle=['#ffb050','#ff6a20','#ffe0a0'][i];ctx.globalAlpha=.55-i*.12;ctx.lineWidth=6-i*1.5;ctx.beginPath();ctx.ellipse(0,0,r*(1.9+i*.35),r*(.55+i*.12),i*.6,0,TAU);ctx.stroke()} // disque d'accrétion
  ctx.globalAlpha=1;const g=ctx.createRadialGradient(0,0,r*.6,0,0,r*1.25);g.addColorStop(0,'#000');g.addColorStop(.8,'#000');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.25,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,220,160,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.restore()}
 for(const u of BUMPS){ctx.fillStyle=u.hit?'#fff':'#1fb5a5';ctx.beginPath();ctx.arc(u.x,u.y,u.r+(u.hit?4:0),0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#0a3';ctx.beginPath();ctx.arc(u.x,u.y,8,0,TAU);ctx.fill()}
 for(const ph of PHOTO){ctx.save();ctx.translate(ph.x,ph.y);ctx.rotate(ph.a);ctx.globalAlpha=ph.t/20*.6;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,380,-.55,.55);ctx.closePath();ctx.fill();
  ctx.globalAlpha=ph.t/20;ctx.strokeStyle='#d4a050';ctx.lineWidth=4;ctx.strokeRect(200,-110,170,220);ctx.restore();ctx.globalAlpha=1}
 for(const p of P){if(p.state==='dead')continue;
  if(p.clone>0){const x=T.MAP_W-p.x,y=T.MAP_H-p.y;ctx.globalAlpha=.45;ctx.fillStyle='#8a8f9a';ctx.beginPath();ctx.arc(x,y,T.BODY_R,0,TAU);ctx.fill();ctx.strokeStyle=COLS[p.id];ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1}
  if(p.mirror>0){ctx.strokeStyle='#e0e6f0';ctx.lineWidth=3;ctx.globalAlpha=.55+.45*Math.sin(frame*.4);ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+9,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.star>0){ctx.strokeStyle=frame&4?'#ff5030':'#ffd23a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+6,0,TAU);ctx.stroke()}
  if(p.spk>0){if(p.spk>=90){const f=(390-p.spk)/300;ctx.globalAlpha=.4+.6*f;magicCircle(p.x,p.y,40+f*50,frame*.08,RB[(frame>>2)%6]);magicCircle(p.x,p.y,(40+f*50)*.6,-frame*.12,'#fff');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x+Math.cos(p.aim)*24,p.y+Math.sin(p.aim)*24,6+f*26,0,TAU);ctx.fill();ctx.globalAlpha=1}
   else sparkFX(p)}}
 for(const z of ZONES){const f=z.t/180;ctx.globalAlpha=.12+.2*((frame>>3)&1)*(1-f);ctx.fillStyle='#ff9a2a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle='#ff9a2a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(z.x,z.y,z.r,-Math.PI/2,-Math.PI/2+TAU*f);ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 40px monospace';ctx.textAlign='center';ctx.fillText(Math.ceil(z.t/60),z.x,z.y+14)}
 ctx.lineWidth=2;ctx.strokeStyle='#fff';for(const o of ORBS){ctx.globalAlpha=o.t<60&&(frame>>2)&1?.4:1;ctx.fillStyle='#5cff8a';ctx.beginPath();ctx.arc(o.x,o.y,7,0,TAU);ctx.fill();ctx.stroke()}ctx.globalAlpha=1;
 for(const f of FAIRIES){const w=Math.sin(frame*.5)*.4;ctx.fillStyle='rgba(120,200,255,.5)';
  for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(f.x+sd*9,f.y-3,8,4,sd*(.5-w),0,TAU);ctx.fill()}
  ctx.fillStyle='#6cf';ctx.beginPath();ctx.arc(f.x,f.y,8,0,TAU);ctx.fill();ctx.fillStyle=COLS[f.o];ctx.beginPath();ctx.arc(f.x,f.y,3,0,TAU);ctx.fill()}
 for(const p of P){if(p.state==='dead')continue;
  if(p.blade>0)for(let k=0;k<2;k++){const a=p.bA+k*Math.PI,c=Math.cos(a),s=Math.sin(a);ctx.lineCap='round';ctx.strokeStyle='#ffe23a';ctx.lineWidth=8;
   ctx.beginPath();ctx.moveTo(p.x+c*26,p.y+s*26);ctx.lineTo(p.x+c*62,p.y+s*62);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke()}
  if(p.state==='rifle'){const f=p.t/IM.rifle.start,c=Math.cos(p.aim),s=Math.sin(p.aim);ctx.strokeStyle=f>.75&&(frame>>1)&1?'#f44':'#fff';ctx.globalAlpha=.25+f*.75;ctx.lineWidth=1+f*2;
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+c*2400,p.y+s*2400);ctx.stroke();ctx.globalAlpha=1}
  if(p.ult){ctx.strokeStyle=rainbowCol();ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,26+3*Math.sin(frame*.2),0,TAU);ctx.stroke()}
  if(p.bombs>0){ctx.strokeStyle='#ff9a2a';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(p.x,p.y,30,0,TAU);ctx.stroke();ctx.setLineDash([])}}
 for(const k of KOB){const f=k.t/(k.T||120),e=1-f,col=COLS[k.o]; // visée du rayon de KO
  ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.03+.08*e;ctx.fillStyle=col;ctx.fillRect(0,-90*e,3000,180*e);ctx.globalAlpha=.2+.5*e;ctx.fillRect(0,-2-e*3,3000,4+e*6);ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=.3+.4*e;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-86);ctx.lineTo(3000,-86);ctx.moveTo(0,86);ctx.lineTo(3000,86);ctx.stroke();
  ctx.globalAlpha=.75;ctx.lineWidth=3;ctx.beginPath();for(let x=frame*6%120+40;x<3000;x+=120){ctx.moveTo(x-12,-14);ctx.lineTo(x,0);ctx.lineTo(x-12,14)}ctx.stroke(); // chevrons
  for(let i=2;i>=0;i--){ctx.globalAlpha=(.3+.3*e)/(i+1);ctx.fillStyle=i?col:'#fff';ctx.beginPath();ctx.arc(0,0,(8+e*24)*(1+i*.7),0,TAU);ctx.fill()} // orbe qui charge
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=col;for(let i=0;i<14;i++){const a=i*TAU/14+frame*.12*(i%2?1:-1),r=18+((f*70+i*11)%80);ctx.globalAlpha=.25+.6*e;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.5+e*2.5,0,TAU);ctx.fill()}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.35+.55*e;magicCircle(0,0,26+e*34,frame*.1,col);magicCircle(0,0,(26+e*34)*.62,-frame*.16,'#fff') // énergie aspirée
  ctx.restore();ctx.globalAlpha=1;
  if(k.t<=T.BEAM_PARRY&&(frame>>1)&1){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(k.x,k.y,26,0,TAU);ctx.stroke();ctx.fillStyle='#6ff';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText('PARRY NOW!',k.x,k.y-40)}}}
function W_2526(...a){const R0=W_base;R0(...a);if(!CX.echoQ)return;for(const e of CX.echoQ){const q=P[e.tg];if(!q)continue;const u=Math.max(0,Math.min(1,1-(e.t-frame)/60)),k=u*u*(3-2*u);
 for(let j=6;j>=0;j--){const w=Math.max(0,k-j*.035),x=e.x+(q.x-e.x)*w,y=e.y+(q.y-e.y)*w;ctx.globalAlpha=(1-j/7)*.7;ctx.fillStyle=j?'#5cff7a':'#eaffef';ctx.beginPath();ctx.arc(x,y,(j?7:9)-j*.6,0,TAU);ctx.fill()}
 const x=e.x+(q.x-e.x)*k,y=e.y+(q.y-e.y)*k;ctx.globalAlpha=.5;ctx.strokeStyle='#5cff7a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,14+6*Math.sin(frame*.4),0,TAU);ctx.stroke();ctx.globalAlpha=.15;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=1}}
function W_2586(...a){const R0=W_2526;R0(...a);ctx.save();
 if(CX.wz)for(const z of CX.wz.Z){ctx.globalAlpha=.16;ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.globalAlpha=.6;ctx.strokeStyle='#8a7a6a';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#8a7a6a';for(let i=0;i<3;i++){const y=z.y-40+((frame*1.5+i*30)%90);ctx.beginPath();ctx.moveTo(z.x-12+(i-1)*40,y);ctx.lineTo(z.x+12+(i-1)*40,y);ctx.lineTo(z.x+(i-1)*40,y+14);ctx.fill()}}
 for(const e of ENT){
  if(e.k==='zap'){ctx.globalAlpha=Math.min(1,e.t/6);ctx.lineJoin='round';ctx.strokeStyle='#7fb8ff';ctx.lineWidth=e.big?12:7;zigzag(e.x,e.y,e.x2,e.y2,e.big?12:7,e.big?36:16,e.s+(frame>>1));ctx.strokeStyle='#fff';ctx.lineWidth=e.big?4:2.5;zigzag(e.x,e.y,e.x2,e.y2,e.big?12:7,e.big?36:16,e.s+(frame>>1))}
  else if(e.k==='shaku'){const q=P[e.tg];if(!q)continue;const D=[[0,1],[0,-1],[1,0],[-1,0]][e.d],ba=Math.atan2(D[1],D[0]),u=e.t>20?(50-e.t)/30:1,sw=e.t>20?-1.7*Math.min(1,u*1.6):e.t>14?-1.7*(e.t-14)/6:0,px=e.x-D[0]*100,py=e.y-D[1]*100;
   ctx.globalAlpha=Math.min(1,e.t/8,u*3);ctx.translate(px,py);ctx.rotate(ba+sw);ctx.fillStyle='#f0e2b6';ctx.strokeStyle='#9a7a40';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect?ctx.roundRect(-10,-11,125,22,11):ctx.rect(-10,-11,125,22);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(154,122,64,.35)';ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(108,0);ctx.stroke();ctx.restore();ctx.save()}
  else if(e.k==='lfan'){const o=P[e.o];if(!o)continue;const sw=e.t>320?(340-e.t)/20:1,fx=o.x-Math.cos(e.a)*58,fy=o.y-Math.sin(e.a)*58-40,ra=e.a+(e.t>320?-1.4+2.4*sw:Math.sin(frame*.55)*.4);ctx.globalAlpha=Math.min(1,e.t/20);
   ctx.translate(fx,fy);ctx.rotate(ra);ctx.fillStyle='#f4f0ff';ctx.strokeStyle='#8a6ad8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,64,-1.1,1.1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffb0d8';ctx.beginPath();ctx.arc(0,0,64,-1.1,1.1);ctx.arc(0,0,48,1.1,-1.1,true);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#6a4a9a';for(let i=0;i<=8;i++){const a=-1.1+i*2.2/8;ctx.beginPath();ctx.moveTo(4*Math.cos(a),4*Math.sin(a));ctx.lineTo(64*Math.cos(a),64*Math.sin(a));ctx.stroke()}ctx.fillStyle='#6a4a9a';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.restore();ctx.save();
   if(e.t<320){ctx.strokeStyle='rgba(232,232,255,.35)';ctx.lineWidth=2;const c=Math.cos(e.a),s=Math.sin(e.a);for(let i=0;i<14;i++){const d=(frame*9+i*137)%1400,o2=(hz(i,3)-.5)*700;const x=o.x+c*d-s*o2,y=o.y+s*d+c*o2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+c*50,y+s*50);ctx.stroke()}}}
  else if(e.k==='stone'){ctx.globalAlpha=Math.min(1,e.t/30);ctx.fillStyle='#9a8c78';ctx.strokeStyle='#5a5044';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7,r=e.r*(.8+.35*hz(i,e.x|0));i?ctx.lineTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r):ctx.moveTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(e.x-e.r*.4,e.y-e.r*.2);ctx.lineTo(e.x+e.r*.1,e.y+e.r*.1);ctx.lineTo(e.x+e.r*.3,e.y-e.r*.4);ctx.stroke()}}
 ctx.globalAlpha=1;
 for(const f of FC){const g=ctx.createRadialGradient(f.x,f.y,10,f.x,f.y,250);g.addColorStop(0,'rgba(255,240,160,.55)');g.addColorStop(.5,'rgba(255,140,30,.35)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,250,f.a-.45,f.a+.45);ctx.closePath();ctx.fill()}
 for(const p of P){if(p.state==='dead')continue;
  if(p.elec>frame){ctx.strokeStyle='#bfe0ff';ctx.lineWidth=2;for(let i=0;i<3;i++){const a=hz(i,frame>>2)*TAU,r=bodyR(p)+6;zigzag(p.x+Math.cos(a)*r*.3,p.y+Math.sin(a)*r*.3,p.x+Math.cos(a)*(r+12),p.y+Math.sin(a)*(r+12),4,5,frame+i)}}
  if(p.fx.gaze2>0){ctx.globalAlpha=.12;ctx.fillStyle='#b0a080';ctx.beginPath();ctx.arc(p.x,p.y,210,0,TAU);ctx.fill();ctx.globalAlpha=.55;ctx.setLineDash([10,8]);ctx.strokeStyle='#b0a080';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
  if(p.serpS){const S=p.serpS;for(let i=S.length-1;i>=0;i--){const s=S[i],r=14-i*.45;ctx.fillStyle=i%2?'#c8401c':'#ff7a30';ctx.beginPath();ctx.arc(s.x,s.y,r,0,TAU);ctx.fill()}const h=S[0],a=Math.atan2(S[0].y-S[1].y,S[0].x-S[1].x);
   ctx.save();ctx.translate(h.x,h.y);ctx.rotate(a);ctx.fillStyle='#ff7a30';ctx.beginPath();ctx.ellipse(4,0,18,12,0,0,TAU);ctx.fill();ctx.fillStyle='#ffe040';ctx.beginPath();ctx.arc(8,-6,3,0,TAU);ctx.arc(8,6,3,0,TAU);ctx.fill();if((frame>>3)%3===0){ctx.strokeStyle='#ff3050';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(32,0);ctx.lineTo(36,-4);ctx.moveTo(32,0);ctx.lineTo(36,4);ctx.stroke()}ctx.restore();
   if(p.serpV>0){ctx.fillStyle='#ffb080';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('VENOM '+p.serpV,p.x,p.y+62)}}
  if(p.eatD){const E=p.eatD,e=E.e,u=E.t/120;ctx.strokeStyle='#ffb0e0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+14,-Math.PI/2,-Math.PI/2+u*TAU);ctx.stroke();
   for(let k=0;k<14;k++){const w=(frame*.025+k/14)%1,sw=(1-w)*2.4+k,x=e.x+(p.x-e.x)*w+Math.cos(sw)*60*(1-w),y=e.y+(p.y-e.y)*w+Math.sin(sw)*60*(1-w);ctx.globalAlpha=.3+.6*w;ctx.fillStyle=k%3?'#ffd0f0':'#c06cff';ctx.beginPath();ctx.arc(x,y,7*(1-w)+2,0,TAU);ctx.fill()}ctx.globalAlpha=1}}
 ctx.restore()}
function W_2660(...a){const R0=W_2586;R0(...a);ctx.save();
 const Z=CX.tilt;if(Z){for(const q of P){const z=Z.z[q.id];if(!z)continue;ctx.strokeStyle=COLS[q.id];ctx.lineWidth=6;ctx.globalAlpha=.8;ctx.strokeRect(z[0]+3,z[1]+3,z[2]-z[0]-6,z[3]-z[1]-6);ctx.globalAlpha=.06;ctx.fillStyle=COLS[q.id];ctx.fillRect(z[0],z[1],z[2]-z[0],z[3]-z[1]);ctx.globalAlpha=1;ctx.fillStyle=COLS[q.id];ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.fillText('DMG '+Math.max(0,Z.d0[q.id]-(q.state==='dead'?0:q.hp)|0),(z[0]+z[2])/2,z[1]+40)}
  ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.fillText('MOST DAMAGED IN '+Math.ceil((420-Z.t)/60)+' s = ONE SHOT',(Z.z[Z.o][0]+Z.z[Z.o][2])/2,Z.z[Z.o][3]-24)}
 if(CX.tiltB){const z=CX.tiltB.z,u=1-CX.tiltB.t/50;ctx.fillStyle='#000';ctx.globalAlpha=.6*u;ctx.fillRect(z[0],z[1],z[2]-z[0],z[3]-z[1]);ctx.globalAlpha=1}
 mtnDraw();
 const Rd=CX.road;if(Rd)for(const c of Rd.c){const cx=c.x+c.w/2,cy=c.y+c.h/2;ctx.globalAlpha=.12;ctx.strokeStyle='#e8c040';ctx.lineWidth=2;ctx.strokeRect(c.x,c.y,c.w,c.h);ctx.globalAlpha=.4;ctx.fillStyle='#e8c040';ctx.save();ctx.translate(cx,cy);ctx.rotate(c.a);ctx.beginPath();ctx.moveTo(26,0);ctx.lineTo(-10,-18);ctx.lineTo(-4,0);ctx.lineTo(-10,18);ctx.closePath();ctx.fill();ctx.restore()}
 ctx.globalAlpha=1;
 for(const e of ENT){
  if(e.k==='bamb'){const fall=e.t>440?(e.t-440)/40:0;if(fall>0){ctx.globalAlpha=.35*(1-fall);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x,e.y+4,16,6,0,0,TAU);ctx.fill();ctx.globalAlpha=1}const y=e.y-fall*500,sx=e.sh?Math.sin(e.sh*2)*3:0;
   ctx.fillStyle='#3a9a4a';ctx.fillRect(e.x-9+sx,y-110,18,112);ctx.fillStyle='#5cff7a';ctx.fillRect(e.x-9+sx,y-110,5,112);ctx.fillStyle='#2a6a34';for(let i=0;i<4;i++)ctx.fillRect(e.x-10+sx,y-108+i*28,20,4);ctx.fillStyle='#5cff7a';ctx.beginPath();ctx.ellipse(e.x+14+sx,y-104,14,4,-.5,0,TAU);ctx.fill();if(!fall){ctx.globalAlpha=.3;ctx.fillStyle='#3a2a1a';ctx.beginPath();ctx.ellipse(e.x,e.y+2,14,5,0,0,TAU);ctx.fill();ctx.globalAlpha=1}}
  else if(e.k==='fstone'){const u=1-e.t/45;ctx.globalAlpha=.25+.4*u;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x,e.y,30*u+8,10*u+3,0,0,TAU);ctx.fill();ctx.globalAlpha=1;const y=e.y-(1-u*u)*600;ctx.fillStyle='#a09080';ctx.strokeStyle='#5a5044';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,y-10,26,16,0,0,TAU);ctx.fill();ctx.stroke()}
  else if(e.k==='mochi'){const T2=e.tr,h=Math.min(1,(e.hits||0)/6),col=h>.66?'255,80,40':h>.33?'255,190,60':'255,255,255';if(T2&&e.sp>4){const n=Math.min(T2.length/2,6+e.sp*.5|0);ctx.lineCap='round';for(let i=n-1;i>0;i--){const u=1-i/n;ctx.strokeStyle='rgba('+col+','+(u*.55)+')';ctx.lineWidth=36*u;ctx.beginPath();ctx.moveTo(T2[i*2-2],T2[i*2-1]);ctx.lineTo(T2[i*2],T2[i*2+1]);ctx.stroke()}ctx.lineCap='butt';if(e.sp>16){const a=Math.atan2(e.vy,e.vx),c=Math.cos(a),s2=Math.sin(a);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;for(let i=0;i<5;i++){const o=(i-2)*9,L=e.sp*3+(i%2)*20;ctx.beginPath();ctx.moveTo(e.x-c*20-s2*o,e.y-s2*20+c*o);ctx.lineTo(e.x-c*(20+L)-s2*o,e.y-s2*(20+L)+c*o);ctx.stroke()}}}
   if(h>0&&e.sp>6){ctx.globalAlpha=.35;ctx.fillStyle='rgb('+col+')';ctx.beginPath();ctx.arc(e.x,e.y,26+6*Math.sin(frame*.5),0,TAU);ctx.fill();ctx.globalAlpha=1}const sq=Math.min(.45,e.sp*.012),a=Math.atan2(e.vy,e.vx);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1+sq,1-sq);ctx.fillStyle='#fbf7ef';ctx.strokeStyle='#d8cfc0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18,0,TAU);ctx.fill();ctx.stroke();ctx.restore();ctx.fillStyle='#ffb0c8';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(e.x-8,e.y+4,3.5,0,TAU);ctx.arc(e.x+8,e.y+4,3.5,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#333';ctx.fillRect(e.x-6,e.y-3,3,2);ctx.fillRect(e.x+3,e.y-3,3,2)}
  else if(e.k==='mallet'){const p=P[e.o];if(!p)continue;const u=1-e.t/16,sw=(u<.4?-1.2+u*1.2/.4*2.2:1-((u-.4)/.6)*.3),a=e.a+sw,c=Math.cos(a),s=Math.sin(a);ctx.save();ctx.strokeStyle='#8a5a2a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x+c*8,p.y+s*8);ctx.lineTo(p.x+c*70,p.y+s*70);ctx.stroke();ctx.translate(p.x+c*78,p.y+s*78);ctx.rotate(a+Math.PI/2);ctx.fillStyle='#c08850';ctx.strokeStyle='#6a4020';ctx.lineWidth=3;ctx.fillRect(-26,-15,52,30);ctx.strokeRect(-26,-15,52,30);ctx.fillStyle='#a06a3a';ctx.fillRect(-26,-15,8,30);ctx.fillRect(18,-15,8,30);ctx.restore()}}
 ctx.restore()}
function W_2681(...a){const R0=W_2660;R0(...a);const K=CX.taiko;if(!K)return;for(const s of K.S){const r=s.k==='R'?20:13;ctx.fillStyle=s.k==='b'?'#4ad0e0':'#f24a2a';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,r,0,TAU);ctx.fill();ctx.stroke()}}
function W_2687(...a){const R0=W_2681;R0(...a);for(const e of ENT)if(e.k==='wbeam'&&e.fire){const u=1-e.t/36;ctx.save();ctx.globalAlpha=.25+.45*u*((frame>>2)&1?1:.6);ctx.strokeStyle=e.c;ctx.lineWidth=1.5+u*5;ctx.setLineDash([14,10]);ctx.lineDashOffset=-frame*3;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke();ctx.restore()}}
function W_2780(...a){const R0=W_2687;R0(...a);ctx.save();const Z=CX.zaw;
 if(Z){const p=P[Z.o];if(p){const u=1-Z.t/180;ctx.strokeStyle='#00d0a0';ctx.lineWidth=3;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,p.y,60+u*40,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const aa=i*TAU/12;ctx.beginPath();ctx.moveTo(p.x+Math.cos(aa)*(56+u*40),p.y+Math.sin(aa)*(56+u*40));ctx.lineTo(p.x+Math.cos(aa)*(66+u*40),p.y+Math.sin(aa)*(66+u*40));ctx.stroke()}
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(u*TAU*3-Math.PI/2)*(48+u*30),p.y+Math.sin(u*TAU*3-Math.PI/2)*(48+u*30));ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(u*TAU*.25-Math.PI/2)*34,p.y+Math.sin(u*TAU*.25-Math.PI/2)*34);ctx.stroke();
  ctx.globalAlpha=.08+.25*u;ctx.fillStyle='#00d0a0';ctx.beginPath();ctx.arc(p.x,p.y,120+u*900,0,TAU);ctx.fill()}}
 for(const e of ENT)if(e.k==='stx'){const o=P[e.o];if(!o)continue;const c=Math.cos(e.a),s=Math.sin(e.a);ctx.lineCap='round';ctx.strokeStyle='#7a3a10';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+c*e.len,o.y+s*e.len);ctx.stroke();ctx.strokeStyle='#e8b040';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+c*e.len,o.y+s*e.len);ctx.stroke();
  for(const d of[0,e.len]){ctx.fillStyle='#ffd040';ctx.beginPath();ctx.arc(o.x+c*d,o.y+s*d,9,0,TAU);ctx.fill()}ctx.lineCap='butt'}
 ctx.restore()}
function W_4117(){ifxUnder();W_2780();ifxOver()} // dim() is a no-op without CanvasRenderingContext2D (legacy harness); IFX in ./ifx
function W_4257(...a){const D0=W_4117;D0();if(!(TEST&&TEST.train&&TRX.hb))return;ctx.save();ctx.lineWidth=1.5;for(const p of P){if(p.state==='dead')continue;ctx.strokeStyle='#ff4060';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p),0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,T.CORE_R,0,TAU);ctx.fill();ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(120,220,255,.6)';ctx.beginPath();ctx.arc(p.x,p.y,T.GRAZE_R,0,TAU);ctx.stroke();ctx.setLineDash([])}
 ctx.strokeStyle='#ffd23a';let n=0;for(const b of B){if(b.dead||++n>500)continue;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.stroke()}ctx.restore()}
function W_4720(...a){const W0=W_4257;W0();for(const e of ENT)if(e.t>0&&EDR[e.k]){ctx.save();EDR[e.k](e);ctx.restore()}}
function W_4758(...a){const W0=W_4720;W0();for(const e of ENT){if(e.t<=0)continue;
 if(e.k==='ryy'){const a=frame*.12+e.x*.01;ctx.save();if(!e.g){ctx.globalAlpha=.25;ctx.fillStyle='#ff3a4a';ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,TAU);ctx.fill()}rYY(e.x,e.y,e.r,a,e.g?.3:e.t<60&&(frame>>2)%2?.5:1);if(e.g){ctx.globalAlpha=.6;ctx.setLineDash([4,4]);ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,TAU);ctx.stroke();ctx.setLineDash([])}ctx.restore()}
 else if(e.k==='rbar')rBorder(e);
 else if(e.k==='rbnd'){const d=110*e.t/e.T;ctx.save();for(const sg of[-1,1]){ctx.save();ctx.translate(e.x+Math.cos(e.a)*d*sg,e.y+Math.sin(e.a)*d*sg);ctx.rotate(e.a+Math.PI/2);ctx.globalAlpha=.85;ctx.fillStyle='rgba(255,120,140,.3)';ctx.fillRect(-48,-6,96,12);ctx.strokeStyle='#ffb0bc';ctx.lineWidth=2;ctx.strokeRect(-48,-6,96,12);ctx.fillStyle='#fff';for(let i=-40;i<48;i+=16)ctx.fillRect(i-3,-4,6,8);ctx.restore()}ctx.restore()}}}
function W_4762(...a){const W0=W_4758;W0();for(const e of ENT)if(e.k==='nufo'){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#3a2a6a';ctx.beginPath();ctx.ellipse(0,0,16,6,0,0,TAU);ctx.fill();ctx.fillStyle='#9a6aff';ctx.beginPath();ctx.arc(0,-3,6,Math.PI,0);ctx.fill();ctx.fillStyle=(frame>>3)%2?'#ff4a6a':'#5cff7a';for(const x of[-10,0,10]){ctx.beginPath();ctx.arc(x,2,1.8,0,TAU);ctx.fill()}ctx.restore()}}
export const drawWorldItems = W_4762;
