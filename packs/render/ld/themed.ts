// @ts-nocheck — legacy chDraw..chDraw5 (themed item / character overlays inside drawWorldItems), copied verbatim. Their item state arrives with lot 3. Not sim code.
import { COLS, LCOLS } from '../colors';
const TAU = 6.2832;
let ctx, frame, P, ENT = [], B = [], CX = {}, bodyR;
let T = { MAP_W: 2000, MAP_H: 1350, BODY_R: 16, HP: 100 }, SMR = []; const RB = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'], clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rainbowCol = () => `hsl(${frame * 6 % 360},100%,65%)`;
// themed-item helpers / data: real versions arrive with lot 3 (until then their CX/ENT state never exists, so these are never reached)
const nop = () => {}, TUT = null, TSTEPS = [], TEAMS = 0, TEAMA = [], TCOL = [], ITEMS = [], UFC = [], STC = [], ELC9 = [], ELN9 = [], ELC2 = [], TC = [], RDK = [];
const yinYang = nop, xDrawGap = nop, xFour = () => [], tutZ = nop, nearFoe = () => null, laserFX = nop, drawYTrain = nop, drawUnzan = nop, drawTails = nop, drawMech = nop, drawFist = nop, drawDragon = nop, auraOf = () => null;
export const bindThemed = (v) => { ({ ctx, frame, P, CX, ENT, B, bodyR, T, SMR } = v); };
function chDraw(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.wall){const w=CX.wall;ctx.fillStyle='#3a2a1a';ctx.fillRect(w.x-10,0,20,T.MAP_H);ctx.fillStyle='#3fbf6f';for(let y=0;y<T.MAP_H;y+=60)ctx.fillRect(w.x-14,y,28,8)}
 for(const e of ENT){switch(e.k){
  case'book':{const it=ITEMS.find(i=>i.k===e.it),y=e.y+Math.sin(frame*.1+e.x)*3;ctx.fillStyle=it.c==='rainbow'?rainbowCol():it.c;ctx.fillRect(e.x-12,y-15,24,30);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(e.x-12,y-15,24,30);ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(it.name,e.x,y-22);break}
  case'efairy':ctx.fillStyle='rgba(127,224,160,.6)';ctx.beginPath();ctx.ellipse(e.x-8,e.y,9,5,-.5+Math.sin(frame*.4)*.3,0,TAU);ctx.ellipse(e.x+8,e.y,9,5,.5-Math.sin(frame*.4)*.3,0,TAU);ctx.fill();ctx.fillStyle='#7fe0a0';ctx.beginPath();ctx.arc(e.x,e.y,7,0,TAU);ctx.fill();break;
  case'decoy':ctx.save();ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText('???',e.x,e.y-T.BODY_R-18);ctx.fillText('???',e.x,e.y-T.BODY_R-18);ctx.restore();ctx.fillStyle='#222';ctx.strokeStyle='#9aa';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(e.x+Math.cos(e.a)*T.BODY_R,e.y+Math.sin(e.a)*T.BODY_R);ctx.lineTo(e.x+Math.cos(e.a)*(T.BODY_R+10),e.y+Math.sin(e.a)*(T.BODY_R+10));ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,T.CORE_R,0,TAU);ctx.fill();break;
  case'gtrail':ctx.globalAlpha=Math.min(.7,e.t/100);ctx.fillStyle='#e0302f';ctx.beginPath();ctx.arc(e.x,e.y,16+Math.sin(frame*.3+e.x)*3,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'flake':ctx.strokeStyle='#e8f6ff';ctx.lineWidth=2;for(let k=0;k<3;k++){const a=k*Math.PI/3+frame*.02;ctx.beginPath();ctx.moveTo(e.x-Math.cos(a)*8,e.y-Math.sin(a)*8);ctx.lineTo(e.x+Math.cos(a)*8,e.y+Math.sin(a)*8);ctx.stroke()}break;
  case'petal':ctx.fillStyle='#ffd6f0';ctx.beginPath();ctx.ellipse(e.x,e.y,7,4,frame*.05+e.ph,0,TAU);ctx.fill();break;
  case'fruit':ctx.fillStyle='#ff9a3a';ctx.beginPath();ctx.arc(e.x,e.y,9,0,TAU);ctx.fill();ctx.fillStyle='#5cff7a';ctx.fillRect(e.x-1,e.y-13,3,5);break;
  case'fakeitem':ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,T.ITEM_R,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.fillText('???',e.x,e.y+5);break;
  case'kline':ctx.globalAlpha=Math.min(1,e.t/60);ctx.strokeStyle='#ffcf6a';ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffcf6a';ctx.beginPath();ctx.arc(e.x1,e.y1,8,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'voodoo':{const q=P[e.v];if(q&&q.state!=='dead'){ctx.strokeStyle='rgba(224,112,160,.6)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([])}
   ctx.fillStyle='#e070a0';ctx.beginPath();ctx.moveTo(e.x,e.y-6);ctx.lineTo(e.x+11,e.y+16);ctx.lineTo(e.x-11,e.y+16);ctx.fill();ctx.fillStyle='#ffe';ctx.beginPath();ctx.arc(e.x,e.y-11,7,0,TAU);ctx.fill();
   if(e.fl>0){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,22,0,TAU);ctx.stroke()}break}
  case'tree':ctx.fillStyle='#222';ctx.fillRect(e.x-40,e.y+44,80,6);ctx.fillStyle='#ff7fb0';ctx.fillRect(e.x-40,e.y+44,80*Math.max(0,e.hp)/150,6);break;
  case'treasure':ctx.save();ctx.translate(e.x,e.y+Math.sin(frame*.08+e.i)*4);ctx.rotate(frame*.03);ctx.fillStyle=['#e8d48a','#ffcf6a','#ff6a3a','#7fd0ff','#f0f0f0'][e.i];ctx.beginPath();
   for(let k=0;k<10;k++){const r=k%2?7:16,a=k*Math.PI/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#ffcf6a';ctx.font='11px monospace';ctx.fillText(e.n,e.x,e.y-24);break}}
 if(CX.link){const L=al.filter(q=>q.id!==CX.link.o);ctx.strokeStyle='rgba(224,48,80,.7)';ctx.lineWidth=2;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){ctx.beginPath();ctx.moveTo(L[i].x,L[i].y);ctx.lineTo(L[j].x,L[j].y);ctx.stroke()}}
 for(const b of B)if(b.star){ctx.fillStyle=b.c;ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?4:10,a=k*Math.PI/5+frame*.1;ctx.lineTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r)}ctx.fill()}
 for(const b of B)if(b.note){ctx.fillStyle='#000';ctx.font='bold 20px monospace';ctx.fillText('♪',b.x,b.y+7)}
 if(CX.swap){const a=P[CX.swap.a],b=P[CX.swap.b];if(a&&b){ctx.font='bold 14px monospace';ctx.fillStyle=COLS[a.id];ctx.fillText('P'+(a.id+1)+' ?',b.x,b.y-36);ctx.fillStyle=COLS[b.id];ctx.fillText('P'+(b.id+1)+' ?',a.x,a.y-36)}}
 for(const p of al){const f=p.fx;
  if(f.eat>0){ctx.globalAlpha=.5;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+14+Math.sin(frame*.2)*3,0,TAU);ctx.fill();ctx.globalAlpha=1}
  if(p.dark>frame){ctx.fillStyle='#6b5bb0';ctx.font='bold 13px monospace';ctx.fillText('EDIBLE',p.x,p.y-34)}
  if(P.some(q=>q.state==='eaten'&&q.eatBy===p.id)){ctx.fillStyle='#6b5bb0';ctx.font='bold 16px monospace';ctx.fillText('*munch*',p.x,p.y-40+Math.sin(frame*.4)*3)}
  if(f.four>0){for(const c of xFour(p)){ctx.globalAlpha=.55;ctx.fillStyle='#222';ctx.strokeStyle='#ff3030';ctx.lineWidth=3;ctx.beginPath();ctx.arc(c[0],c[1],T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.globalAlpha=1}
   for(const q of al){if(q===p)continue;const ph=(frame+q.id*23)%90,on=ph>=80;ctx.strokeStyle=on?'#fff':'#ff3030';ctx.lineWidth=on?5:2;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(2,(1-ph/90)*150),0,TAU);ctx.stroke()}}
  if(f.spin>0&&f.ran>0)drawTails(p);
  else if(f.spin>0){ctx.strokeStyle='#d9534f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+5,frame*.5,frame*.5+4);ctx.stroke()}
  if(f.yslash>0){ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(p.myx,p.myy,12,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(p.myx-8,p.myy+4,7,0,TAU);ctx.fill()}
  if(p.state==='cocoon'){ctx.fillStyle='#8a9a50';ctx.beginPath();ctx.ellipse(p.x+(Math.random()-.5)*4,p.y,bodyR(p)+6,bodyR(p)+16,0,0,TAU);ctx.fill();ctx.strokeStyle='#c8ff5a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+24,-Math.PI/2,-Math.PI/2+TAU*p.coc/100);ctx.stroke();
   ctx.fillStyle='#c8ff5a';ctx.font='bold 13px monospace';ctx.fillText('WIGGLE! '+(25-p.cocDmg|0)+' HP',p.x,p.y-50)}
  if(f.butter>0){ctx.fillStyle='rgba(200,255,90,.55)';const w=Math.sin(frame*.4)*.4;ctx.beginPath();ctx.ellipse(p.x-22,p.y-6,24,14,-.6-w,0,TAU);ctx.ellipse(p.x+22,p.y-6,24,14,.6+w,0,TAU);ctx.fill()}
  if(p.frozen>0){ctx.fillStyle='rgba(190,230,255,.6)';ctx.fillRect(p.x-26,p.y-26,52,52);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(p.x-26,p.y-26,52,52)}
  if(p.cage){ctx.strokeStyle='#e0302f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.cage.x,p.cage.y,50+bodyR(p),0,TAU);ctx.stroke()}
  if(f.immortal>0){ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+8,0,TAU);ctx.stroke()}
  if(f.phoenix>0){ctx.strokeStyle='#ff4b1f';ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+12,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.kshield){ctx.strokeStyle='#e8d48a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+16,0,TAU);ctx.stroke()}
  let tag='';if(f.pact>0)tag+='PACT '+Math.ceil(f.pact/60)+' ';if(f.kline>0)tag+='LINES '+f.kline+' ';if(f.gung>0)tag+='GUNGNIR '+f.gung+' ';if(f.judge>0)tag+='JUDGE '+f.judge+' ';if(p.drug)tag+=p.drug.k+' ';if(p.vuln)tag+='♪x'+p.vuln+' ';if(p.lily)tag+='✿'+p.lily+' ';if(p.pStk)tag+='ATK x'+Math.pow(1.3,p.pStk).toFixed(1)+' ';
  if(ENT.some(e=>e.k==='treasure'&&e.o===p.id))tag+=p.treas+'/5';if(tag){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(tag,p.x,p.y+44)}
  if(CX.rhy&&p.id!==CX.rhy.o){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(p.x-60,p.y-84,120,16);ctx.fillStyle='#fff';ctx.fillRect(p.x-52,p.y-86,3,20);ctx.fillStyle='#c8a0ff';
   for(let k=0;k<4;k++){const dx=(CX.rhy.n+k*30-frame)/60*104;if(dx>=-4&&dx<=108){ctx.beginPath();ctx.arc(p.x-50+dx,p.y-76,6,0,TAU);ctx.fill()}}}}}
function chDraw2(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.sun){const S=CX.sun,g=ctx.createRadialGradient(S.x,S.y,S.r*.2,S.x,S.y,S.r*1.4);g.addColorStop(0,'#fff');g.addColorStop(.5,'#ffa63a');g.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(S.x,S.y,S.r*1.4,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.fillText('SUPERNOVA IN '+Math.ceil(S.t/60),S.x,S.y-S.r-20)}
 for(const e of ENT)switch(e.k){
  case'onbw':ctx.globalAlpha=.25+.4*(1-e.t/60);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x,e.y,34+(60-e.t)*.3,20,0,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#e04a4a';ctx.fillRect(e.x-14,e.y-e.t*8-60,28,60);break;
  case'pillar':ctx.fillStyle='#7a3a2a';ctx.beginPath();ctx.arc(e.x,e.y,34,0,TAU);ctx.fill();ctx.strokeStyle='#e04a4a';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#ffd23a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,22,0,TAU);ctx.stroke();break;
  case'web':ctx.strokeStyle='rgba(240,240,220,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();for(let i=1;i<6;i++){const x=e.x1+(e.x2-e.x1)*i/6,y=e.y1+(e.y2-e.y1)*i/6;ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.stroke()}break;
  case'ufo':ctx.fillStyle=UFC[e.col];ctx.beginPath();ctx.ellipse(e.x,e.y,20,8,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(e.x,e.y-5,8,Math.PI,0);ctx.fill();if(e.lv>1){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x,e.y,24+Math.sin(frame*.3)*3,0,TAU);ctx.stroke()}break;
  case'shark':ctx.fillStyle='#678';ctx.beginPath();ctx.ellipse(e.x,e.y,30,12,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(e.x-6,e.y-10);ctx.lineTo(e.x+4,e.y-28);ctx.lineTo(e.x+10,e.y-10);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(e.x+(e.vx>0?16:-24),e.y+2,8,3);break;
  case'fish':ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.ellipse(e.x,e.y,10,5,e.a,0,TAU);ctx.fill();break;
  case'fist':drawFist(e);break}
 for(const b of B){if(b.yy)yinYang(b.x,b.y,b.r,frame*.1,'#fff','#e02020');else if(b.anchor){ctx.strokeStyle='#ccd';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI);ctx.moveTo(b.x,b.y-14);ctx.lineTo(b.x,b.y+10);ctx.stroke()}}
 for(const p of al){const f=p.fx;
  if(f.hina>0){ctx.strokeStyle='#c070ff';ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(p.x,p.y,50+k*25,frame*.2+k,frame*.2+k+4);ctx.stroke()}}
  if(f.mech>0)drawMech(p);
  if(f.guard>0){ctx.strokeStyle='#e0e6f0';ctx.lineWidth=4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,p.y,T.PARRY_R,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.state==='pray'){ctx.strokeStyle='#5cff7a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+18,-Math.PI/2,-Math.PI/2+TAU*(1-p.t/180));ctx.stroke();ctx.fillStyle='#5cff7a';ctx.font='bold 13px monospace';ctx.fillText('FOCUSING '+Math.ceil(p.t/60),p.x,p.y-48)}
  if(f.under>0){ctx.strokeStyle='rgba(200,176,80,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,18+frame%20,8+frame%20/3,0,0,TAU);ctx.stroke()}
  if(f.unzan>0)drawUnzan(p);
  if(f.oni>0){ctx.fillStyle='#e04a4a';ctx.beginPath();ctx.moveTo(p.x-4,p.y-bodyR(p));ctx.lineTo(p.x,p.y-bodyR(p)-18);ctx.lineTo(p.x+4,p.y-bodyR(p));ctx.fill()}
  if(f.shou>0){const r=10+(p.light||0)*1.2,g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,255,200,.9)');g.addColorStop(1,'rgba(255,232,58,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill()}
  if(f.sutra>0||p.sutT>0){const y=p.y-70;ctx.fillStyle='#1a3a9a';ctx.strokeStyle='#000';ctx.lineWidth=2;for(const s of[-1,1]){ctx.beginPath();ctx.roundRect?ctx.roundRect(p.x+s*58-5,y-24,10,48,5):ctx.rect(p.x+s*58-5,y-24,10,48);ctx.fill();ctx.stroke()} // rouleau de sutra
   for(let i=0;i<6;i++){const x=p.x-45+i*18,yy=y+Math.sin(i*.6+frame*.05)*5;ctx.fillStyle=RB[(i+5)%6];ctx.fillRect(x-6,yy-10,12,4);ctx.fillRect(x-2,yy-6,4,12);ctx.beginPath();ctx.arc(x+4,yy+8,2.5,0,TAU);ctx.fill()}
   if(f.sutra>0){ctx.fillStyle='#c06cff';ctx.font='bold 12px monospace';ctx.fillText('RECITING… '+Math.ceil(f.sutra/60),p.x,y-32)}}
  if(f.rei>0){const n=4,sp=.02+.3*(1-f.rei/420);for(let i=0;i<n;i++){const a=frame*sp+i*TAU/n;yinYang(p.x+Math.cos(a)*44,p.y+Math.sin(a)*44,9,a,'#fff','#3a6aff')}
   ctx.fillStyle=p.reiHit?'#888':'#fff';ctx.font='bold 12px monospace';ctx.fillText(p.reiHit?'FAILED':'CENTER IN '+Math.ceil(f.rei/60),p.x,p.y+58)}
  if(p.fh>0){ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=6;ctx.beginPath();ctx.arc(p.x,p.y,60+Math.sin(frame*.3)*10,0,TAU);ctx.stroke()}
  if(p.ban){ctx.fillStyle='#c06cff';ctx.font='bold 13px monospace';ctx.fillText(p.ban.k.toUpperCase()+' ???',p.x,p.y-52)}
  if(p.pull){const o=P[p.pull.o];if(o){ctx.strokeStyle='#ccd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(o.x,o.y);ctx.stroke()}}
  if(CX.rain&&CX.rain.o===p.id){ctx.fillStyle='#a060ff';ctx.beginPath();ctx.arc(p.x,p.y-30,34,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x-8,p.y-42,4,0,TAU);ctx.fill();ctx.fillStyle='#f33';ctx.fillRect(p.x-14,p.y-36,28,4)}
  if(f.jeal>0)for(const q of al)if(q!==p&&(q.hp>p.hp||q.stocks>p.stocks)){ctx.fillStyle='#5cff7a';ctx.beginPath();ctx.arc(q.x-6,q.y-4,3,0,TAU);ctx.arc(q.x+6,q.y-4,3,0,TAU);ctx.fill()}
  if(p.nueC&&CX.nue&&CX.nue.o===p.id){ctx.font='bold 12px monospace';p.nueC.forEach((n,i)=>{ctx.fillStyle=UFC[i];ctx.fillText(n,p.x-14+i*14,p.y+58)})}}}
function chDraw3(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 for(const e of ENT)switch(e.k){
  case'zombie':ctx.fillStyle=e.st>frame?'#556':'#7a9ac0';ctx.beginPath();ctx.arc(e.x,e.y-Math.abs(Math.sin(frame*.2))*8,16,0,TAU);ctx.fill();ctx.fillStyle='#e8c040';ctx.fillRect(e.x-4,e.y-22-Math.abs(Math.sin(frame*.2))*8,8,14);ctx.strokeStyle='#7a9ac0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.x-8,e.y);ctx.lineTo(e.x-8+Math.cos(e.a||0)*26,e.y+Math.sin(e.a||0)*26);ctx.moveTo(e.x+8,e.y);ctx.lineTo(e.x+8+Math.cos(e.a||0)*26,e.y+Math.sin(e.a||0)*26);ctx.stroke();break;
  case'bolt':if(e.t>1){ctx.globalAlpha=.3+.4*((frame>>2)&1);ctx.strokeStyle='#9ad0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,50,0,TAU);ctx.stroke();ctx.globalAlpha=1}break;
  case'plate':ctx.fillStyle='#f0f0f0';ctx.beginPath();ctx.ellipse(e.x,e.y,16,7,frame*.2,0,TAU);ctx.fill();ctx.strokeStyle='#3a7fff';ctx.lineWidth=2;ctx.stroke();break;
  case'fire':ctx.globalAlpha=e.t/160;ctx.fillStyle=(frame+e.x|0)%2?'#ff5030':'#ffa63a';ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'darkz':break;
  case'lbeam':if(!e.staff)laserFX(e.x,e.y,Math.atan2(e.y2-e.y,e.x2-e.x),Math.hypot(e.x2-e.x,e.y2-e.y),5*e.t/10+1,COLS[e.o]||'#ffe8a0','#fff',1);break;
  case'puddle':ctx.fillStyle='rgba(58,127,255,.35)';ctx.beginPath();ctx.ellipse(e.x,e.y,56,34,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(160,210,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,30+frame%30,18+frame%30*.6,0,0,TAU);ctx.stroke();break;
  case'head':if(e.bm){ctx.strokeStyle='#ff4040';ctx.globalAlpha=.25+.35*((frame>>2)&1);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.bm.x2,e.bm.y2);ctx.stroke();ctx.globalAlpha=1}ctx.fillStyle='#e04a4a';ctx.beginPath();ctx.arc(e.x,e.y,11,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x-4,e.y-2,3,0,TAU);ctx.arc(e.x+4,e.y-2,3,0,TAU);ctx.fill();break;
  case'kstr':{ctx.strokeStyle='#ff6b6b';ctx.lineWidth=6;ctx.beginPath();if(e.h){ctx.moveTo(e.r[0],e.pos);ctx.lineTo(e.r[2],e.pos)}else{ctx.moveTo(e.pos,e.r[1]);ctx.lineTo(e.pos,e.r[3])}ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();break}
  case'moonf':{const k=1-e.t/90;ctx.globalAlpha=.25+.35*k;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.x,e.y,220,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#ffe8a0';ctx.beginPath();ctx.arc(e.x,e.y-(1-k)*600,40+180*k,0,TAU);ctx.fill();ctx.fillStyle='rgba(200,180,120,.6)';ctx.beginPath();ctx.arc(e.x-30*k,e.y-(1-k)*600-20*k,30*k,0,TAU);ctx.fill();break}
  case'terr':ctx.strokeStyle='#e04a4a';ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(e.x,e.y,320,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(224,74,74,.05)';ctx.fill();break;
  case'dog':ctx.fillStyle='#5cff7a';ctx.beginPath();ctx.arc(e.x,e.y,14,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(e.x-10,e.y-8);ctx.lineTo(e.x-6,e.y-22);ctx.lineTo(e.x-2,e.y-10);ctx.moveTo(e.x+10,e.y-8);ctx.lineTo(e.x+6,e.y-22);ctx.lineTo(e.x+2,e.y-10);ctx.fill();break;
  case'mirr':ctx.fillStyle='rgba(255,210,58,.25)';ctx.fillRect(e.x-22,e.y-36,44,72);ctx.strokeStyle='#ffd23a';ctx.lineWidth=4;ctx.strokeRect(e.x-22,e.y-36,44,72);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x-12,e.y-26);ctx.lineTo(e.x+4,e.y-6);ctx.stroke();break;
  case'dream':{ctx.globalAlpha=.32;ctx.fillStyle=e.bad?'#2a0a3a':'#ffd0f0';for(const[ox,oy,r]of[[0,0,90],[-50,-20,60],[50,-25,62],[0,-50,58],[-95,70,16],[-120,95,9]]){ctx.beginPath();ctx.arc(e.x+ox,e.y+oy,r,0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.fillStyle=e.bad?'#c06cff':'#fff';ctx.font='bold 14px monospace';ctx.fillText(e.bad?'NIGHTMARE':'DREAM',e.x,e.y);break}
  case'gapS':xDrawGap(e.x,e.y,120*Math.min(1,(150-e.t)/15,e.t/15),40,e.a);if(e.it){const it=ITEMS.find(i=>i.k===e.it);if(it){ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillStyle=it.c==='rainbow'?rainbowCol():it.c;ctx.fillText(it.name,e.x,e.y-50)}}break;
  case'train':{if(e.wait>0){ctx.globalAlpha=.3+.3*((frame>>2)&1);ctx.fillStyle='#c020e0';ctx.fillRect(e.x0+500,e.y-50,e.x1-e.x0-1000,100);ctx.globalAlpha=1;xDrawGap(e.x0+500,e.y,80,120,Math.PI/2)}else drawYTrain(e);break}}
 for(const e of ENT)if(e.k==='darkz'){ctx.globalAlpha=.75*Math.min(1,e.t/40);ctx.fillStyle='#1a0626';ctx.beginPath();ctx.arc(e.x,e.y,110,0,TAU);ctx.fill();ctx.strokeStyle='#7a2ab0';ctx.lineWidth=4;ctx.stroke();ctx.globalAlpha=1} // les ténèbres voilent ce qu'il y a dedans
 for(const b of B)if(b.elem!==undefined){ctx.strokeStyle=ELC2[b.elem];ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,0,TAU);ctx.stroke()}
 for(const p of al){const f=p.fx;
  if(f.jiang>0){ctx.fillStyle='#e8c040';ctx.fillRect(p.x-5,p.y-bodyR(p)-14,10,16);if(p.hp<=0){ctx.fillStyle='#f44';ctx.font='bold 13px monospace';ctx.fillText('HP '+(p.hp|0)+' !',p.x,p.y-42)}}
  if(f.echoB>0){ctx.strokeStyle='rgba(92,255,122,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+10+(frame%30),0,TAU);ctx.stroke()}
  if(p.tanuki>frame){ctx.fillStyle='#a06a30';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+4,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(p.x-8,p.y-12,5,0,TAU);ctx.arc(p.x+8,p.y-12,5,0,TAU);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(p.x-9,p.y-3,18,5)}
  if(f.wolf>0){const ba=p.aim+Math.PI,wg=Math.sin(frame*.25)*.35;ctx.strokeStyle='#c8c8ff';ctx.lineCap='round';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(p.x+Math.cos(ba)*12,p.y+Math.sin(ba)*12);ctx.quadraticCurveTo(p.x+Math.cos(ba+wg)*30,p.y+Math.sin(ba+wg)*30,p.x+Math.cos(ba+wg*2)*44,p.y+Math.sin(ba+wg*2)*44);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(p.x+Math.cos(ba+wg*1.6)*36,p.y+Math.sin(ba+wg*1.6)*36);ctx.lineTo(p.x+Math.cos(ba+wg*2)*46,p.y+Math.sin(ba+wg*2)*46);ctx.stroke();ctx.lineCap='butt';
   if(p.state==='atk'&&p.mv){const m=p.mv,u=Math.min(1,p.t/Math.max(1,m.start)),op=(1-u)*.7+.08,a=p.atkA??p.aim,R=(m.range||40)*1.6+8,c=Math.cos(a),s2=Math.sin(a),jx=p.x+c*R*.55,jy=p.y+s2*R*.55;for(const sg of[-1,1]){const ja=a+sg*op;ctx.fillStyle='#e8e8ff';ctx.beginPath();ctx.moveTo(p.x+c*10,p.y+s2*10);ctx.arc(p.x,p.y,R,ja-(sg>0?0:.25),ja+(sg>0?.25:0));ctx.closePath();ctx.fill();ctx.fillStyle='#fff';for(let k=1;k<=4;k++){const ta=ja-sg*.04,tr=R*(k/5);const tx=p.x+Math.cos(ta)*tr,ty=p.y+Math.sin(ta)*tr,ia=ta-sg*Math.PI/2;ctx.beginPath();ctx.moveTo(tx-Math.cos(ta)*4,ty-Math.sin(ta)*4);ctx.lineTo(tx+Math.cos(ta)*4,ty+Math.sin(ta)*4);ctx.lineTo(tx+Math.cos(ia)*9,ty+Math.sin(ia)*9);ctx.fill()}}}
   ctx.fillStyle='#c8c8ff';ctx.beginPath();ctx.moveTo(p.x-12,p.y-10);ctx.lineTo(p.x-8,p.y-28);ctx.lineTo(p.x-2,p.y-12);ctx.moveTo(p.x+12,p.y-10);ctx.lineTo(p.x+8,p.y-28);ctx.lineTo(p.x+2,p.y-12);ctx.fill()}
  if(p.fear){ctx.fillStyle='#c8c8ff';ctx.font='bold 14px monospace';ctx.fillText('!!',p.x,p.y-36)}
  if(p.dance>0){ctx.fillStyle='#ff8fd0';ctx.font='bold 16px monospace';ctx.fillText('♪',p.x+Math.cos(frame*.2)*24,p.y-30+Math.sin(frame*.2)*8)}
  if(f.turret>0){ctx.strokeStyle='#4ab3ff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(frame*.11)*34,p.y+Math.sin(frame*.11)*34);ctx.stroke()}
  if(f.planets>0)for(let i=0;i<3;i++){const a=frame*.03+i*TAU/3;ctx.fillStyle=['#3a9aff','#ffe8a0','#ff4a4a'][i];ctx.beginPath();ctx.arc(p.x+Math.cos(a)*150,p.y+Math.sin(a)*150,30,0,TAU);ctx.fill()}
  if(f.armor>0){ctx.strokeStyle='#aaa';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+4,0,TAU);ctx.stroke()}
  if(f.pure>0){ctx.strokeStyle='#ff3355';ctx.lineWidth=2;for(let i=0;i<6;i++){const a=frame*.05+i*TAU/6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(a)*40,p.y+Math.sin(a)*40);ctx.stroke()}}
  if(f.leaf>0||f.dango>0){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(f.leaf>0?'LEAF x'+f.leaf:'DANGO x'+f.dango,p.x,p.y+58)}
  
  if(CX.order&&CX.order.ph===2&&p.id!==CX.order.o){ctx.fillStyle=p.ordOK?'#9f9':'#f44';ctx.font='bold 13px monospace';ctx.fillText(CX.order.k,p.x,p.y-56)}}}
function chDraw4(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.road&&0)for(const c of CX.road.c){ctx.globalAlpha=.25;ctx.fillStyle='#e8c040';const cx=c.x+c.w/2,cy=c.y+c.h/2;for(let i=-1;i<=1;i++){ctx.save();ctx.translate(cx+Math.cos(c.a+Math.PI/2)*i*80,cy+Math.sin(c.a+Math.PI/2)*i*80);ctx.rotate(c.a);ctx.beginPath();ctx.moveTo(40,0);ctx.lineTo(-20,-30);ctx.lineTo(-20,30);ctx.fill();ctx.restore()}ctx.globalAlpha=1;ctx.strokeStyle='rgba(232,192,64,.4)';ctx.strokeRect(c.x,c.y,c.w,c.h)}
 if(CX.void)for(const c of CX.void.cells){const open=frame>=CX.void.open;ctx.globalAlpha=open?.95:.25+.25*((frame>>2)&1);ctx.fillStyle=open?'#000':'#401060';ctx.fillRect(c.x+2,c.y+2,c.w-4,c.h-4);ctx.globalAlpha=1}
 if(CX.slope){const S=CX.slope;ctx.globalAlpha=.15;ctx.strokeStyle='#c8a070';ctx.lineWidth=3;for(const q of al)for(let i=0;i<3;i++){const x=q.x+(i-1)*60,y=q.y-60;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(S.a)*40,y+Math.sin(S.a)*40);ctx.stroke()}ctx.globalAlpha=1}
 for(const e of ENT)switch(e.k){
  case'chick':ctx.fillStyle=e.angry?'#ff3030':'#fff';ctx.beginPath();ctx.arc(e.x,e.y,9,0,TAU);ctx.fill();ctx.fillStyle='#f33';ctx.fillRect(e.x-2,e.y-13,4,5);ctx.fillStyle='#fa0';ctx.fillRect(e.x+7,e.y-2,5,3);break;
  case'haniwa':ctx.fillStyle='#c87a4a';ctx.fillRect(e.x-9,e.y-14,18,28);ctx.fillStyle='#000';ctx.fillRect(e.x-5,e.y-8,3,3);ctx.fillRect(e.x+2,e.y-8,3,3);ctx.fillRect(e.x-3,e.y,6,3);break;
  case'clay':ctx.fillStyle=e.rock?'#5a4030':'#8a6a4a';ctx.beginPath();ctx.arc(e.x,e.y,12,0,TAU);ctx.fill();break;
  case'coin':ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.ellipse(e.x,e.y,7*Math.abs(Math.cos(frame*.15+e.x)),7,0,0,TAU);ctx.fill();break;
  case'qtree':{const s=Math.sqrt(e.lv);ctx.fillStyle='#5a3a20';ctx.fillRect(e.x-6*s,e.y-6,12*s,30*s);ctx.fillStyle='#3a9a3a';ctx.beginPath();ctx.arc(e.x,e.y-14*s,26*s,0,TAU);ctx.fill();ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(e.x,e.y,120*s,0,TAU);ctx.fill();ctx.globalAlpha=1;break}
  case'smoke':ctx.globalAlpha=.3;ctx.fillStyle='#c8a8ff';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(e.x+Math.cos(i*1.6+frame*.02)*40,e.y+Math.sin(i*1.6+frame*.02)*30,60,0,TAU);ctx.fill()}ctx.globalAlpha=1;break;
  case'jewel':ctx.fillStyle=e.c;ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(e.x+6,e.y+8,6,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.stroke();break;
  case'dragon':drawDragon(e);break;
  case'trap':ctx.globalAlpha=.35;ctx.strokeStyle='#a08060';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,14,0,TAU);ctx.stroke();ctx.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8;ctx.moveTo(e.x+Math.cos(a)*10,e.y+Math.sin(a)*10);ctx.lineTo(e.x+Math.cos(a)*18,e.y+Math.sin(a)*18)}ctx.stroke();ctx.globalAlpha=1;break;
  case'hound':ctx.fillStyle='#a08060';ctx.beginPath();ctx.ellipse(e.x,e.y,16,9,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(e.x+14,e.y-4,7,0,TAU);ctx.fill();break;
  case'sblood':ctx.fillStyle='rgba(160,10,20,.6)';ctx.beginPath();ctx.ellipse(e.x,e.y,9,5,0,0,TAU);ctx.fill();break;
  case'geyser':ctx.globalAlpha=.3+.4*((frame>>2)&1);ctx.fillStyle='#ff5030';ctx.beginPath();ctx.arc(e.x,e.y,60,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'lbeam':if(e.staff){ctx.strokeStyle='#e8a040';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke()}break}
 for(const p of al){const f=p.fx;
  if(f.stones>0)for(let i=0;i<p.stones;i++){ctx.fillStyle=i%2?'#c8b8a0':'#a09080';ctx.beginPath();ctx.ellipse(p.x,p.y-bodyR(p)-8-i*9,12-i*.5,5,0,0,TAU);ctx.fill()}
  if(f.whisper>0){ctx.fillStyle='#e8e0a0';ctx.font='12px monospace';ctx.fillText('*whisper*',p.x+30,p.y-30)}
  if(f.const6>0||p.constT>0){const S=p.stars6||(p.stars6=[]);ctx.strokeStyle='#9ab0ff';ctx.lineWidth=p.constT>0?4:1;ctx.beginPath();S.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));if(p.constT>0)ctx.closePath();ctx.stroke();
   for(const s of S){ctx.fillStyle='#fff';ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?5:12,a=k*Math.PI/5+frame*.05;ctx.lineTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r)}ctx.fill()}}
  if(f.chain>0){const q=P[p.chT];if(q){ctx.strokeStyle='#8a4ac0';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([])}}
  if(f.gallop>0){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText('SPEED '+(p.galV|0),p.x,p.y+46)}
  if(p.bleed>frame){ctx.fillStyle='#c01020';ctx.beginPath();ctx.arc(p.x+10,p.y-18,3,0,TAU);ctx.fill()}
  if(p.noAtk>frame){ctx.fillStyle='#6a9a4a';ctx.font='bold 12px monospace';ctx.fillText('NO WILL',p.x,p.y-42)}
  if(p.mags){ctx.fillStyle='#4ab3ff';for(let i=0;i<p.mags;i++){const a=frame*.1+i*TAU/5;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*24,p.y+Math.sin(a)*24,4,0,TAU);ctx.fill()}}
  if(CX.coins){ctx.fillStyle='#ffd23a';ctx.font='bold 12px monospace';ctx.fillText((p.coins||0)+'/100',p.x,p.y+46)}
  if(f.gaze>0){ctx.strokeStyle='rgba(176,160,128,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,500,0,TAU);ctx.stroke()}
  if(p.stoneF>frame){ctx.fillStyle='rgba(150,140,120,.8)';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+3,0,TAU);ctx.fill()}}
 if(CX.mirage){ctx.save();ctx.globalAlpha=1;const cx=T.MAP_W/2,cy=T.MAP_H/2;ctx.translate(cx,cy);ctx.scale(-1,1);ctx.rotate(Math.sin(frame*.01)*.2);ctx.translate(-cx,-cy); // Nina : mirage inversé
  for(const q of al){ctx.fillStyle='#222';ctx.strokeStyle=COLS[q.id];ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,T.CORE_R,0,TAU);ctx.fill()}
  for(let i=0;i<B.length;i+=2){const b=B[i];ctx.fillStyle=b.c||LCOLS[b.owner]||'#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill()}ctx.restore()}}
function chDraw5_0(){
 for(const b of B)if(b.breaker&&!b.dead){const t=frame*.12,r=b.r;ctx.save();ctx.translate(b.x,b.y); // breaker : bulle noire hérissée, contour blanc qui pulse
  ctx.fillStyle='rgba(10,0,20,.85)';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<16;i++){const a=t+i*TAU/16,q=i%2?r*.7:r*1.25;ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fff';ctx.globalAlpha=.6+.4*Math.sin(t*3);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.45,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-r*.3,-r*.3);ctx.lineTo(r*.3,r*.3);ctx.moveTo(r*.3,-r*.3);ctx.lineTo(-r*.3,r*.3);ctx.stroke();ctx.restore()}
 for(const e of ENT)switch(e.k){
  case'steam':ctx.globalAlpha=Math.min(.7,e.t/80);ctx.fillStyle='#e8eef8';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(e.x+Math.cos(i*1.7+frame*.02)*30,e.y+Math.sin(i*1.7+frame*.02)*24,e.r*.75,0,TAU);ctx.fill()}ctx.globalAlpha=1;break;
  case'mud':ctx.globalAlpha=.55;ctx.fillStyle='#5a4028';ctx.beginPath();ctx.ellipse(e.x,e.y,e.r,e.r*.7,0,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'magma':ctx.globalAlpha=.6;ctx.fillStyle=(frame>>3)%2?'#ff5030':'#ff8a30';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'blizz':ctx.globalAlpha=.25;ctx.fillStyle='#e0f6ff';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=1;for(let i=0;i<10;i++){const a=frame*.08+i,r=(frame*3+i*37)%e.r;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2,0,TAU);ctx.stroke()}break;
  case'sand':ctx.globalAlpha=.45;ctx.fillStyle='#c0a070';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'whirl':ctx.strokeStyle='#3a8aff';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(e.x,e.y,30+i*40,frame*.15+i,frame*.15+i+4);ctx.stroke()}break;
  case'iceb':ctx.fillStyle='rgba(160,230,255,.8)';ctx.fillRect(e.x-26,e.y-26,52,52);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(e.x-26,e.y-26,52,52);break;
  case'crystal':ctx.fillStyle='#e0c090';ctx.beginPath();ctx.moveTo(e.x,e.y-16);ctx.lineTo(e.x+10,e.y);ctx.lineTo(e.x,e.y+16);ctx.lineTo(e.x-10,e.y);ctx.fill();break}
 for(const p of P){if(p.state==='dead')continue;const au=auraOf(p);
  if(au){ctx.strokeStyle=ELC9[au];ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+5,Math.PI*.2,Math.PI*.8);ctx.stroke();ctx.globalAlpha=1}
  if(p.el){ctx.fillStyle=ELC9[p.el];ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(ELN9[p.el],p.x,p.y+bodyR(p)+22)}
  if(TEAMS){ctx.fillStyle=TCOL[TEAMA[p.id]];ctx.beginPath();ctx.moveTo(p.x-6,p.y-bodyR(p)-20);ctx.lineTo(p.x+6,p.y-bodyR(p)-20);ctx.lineTo(p.x,p.y-bodyR(p)-12);ctx.fill()}}}
function chDraw5_2174(){chDraw5_0();for(const q of P)if(q.state==='atk'&&q.mvName==='grab'){const m=q.mv,f=clamp(q.t/(m.start+m.act),0,1),R=(m.range||46)*(.4+.6*f);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.aim);ctx.strokeStyle='#c07aff';ctx.lineWidth=4;ctx.lineCap='round';ctx.globalAlpha=1-Math.max(0,q.t-m.start-m.act)/12; // griffe du grab
 for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(0,0,R,i*.45-.25,i*.45+.25);ctx.stroke()}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R,0,4,0,TAU);ctx.fill();ctx.restore()}}
function chDraw5_2248(){chDraw5_2174();if(!TUT)return;{const d=P[1];if(d.state==='atk'&&d.mvName==='tslam'&&d.t<32){const f=d.t/32;ctx.save();ctx.strokeStyle=f>.75?'#f44':'#ffd23a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(d.x,d.y,56+60*(1-f),0,TAU);ctx.stroke();ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.fillStyle=ctx.strokeStyle;ctx.fillText(f>.75?'PARRY NOW!':'!',d.x,d.y-40);ctx.restore()}} // attaque téléphonée
 if(TSTEPS[TUT.i].end)return;const z=tutZ(),f=TUT.sk/60;ctx.save();ctx.globalAlpha=.85;ctx.setLineDash([8,6]);ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.strokeRect(z[0],z[1],z[2],z[3]);ctx.setLineDash([]);
 ctx.fillStyle='rgba(255,210,58,.35)';ctx.fillRect(z[0],z[1]+z[3]*(1-f),z[2],z[3]*f);ctx.fillStyle='#ddd';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('SKIP STEP',z[0]+z[2]/2,z[1]+z[3]/2-4);ctx.font='10px monospace';ctx.fillText('stand here 1 s',z[0]+z[2]/2,z[1]+z[3]/2+12);ctx.restore()}
function chDraw5_2290(){chDraw5_2248();
 if(P.some(p=>p.fx.rei>0&&p.state!=='dead')){const cx=T.MAP_W/2,cy=T.MAP_H/2,k=.5+.5*Math.sin(frame*.12);ctx.save();ctx.strokeStyle='rgba(255,74,74,'+(.5+.4*k)+')';ctx.lineWidth=4;ctx.setLineDash([16,10]);ctx.lineDashOffset=-frame;ctx.beginPath();ctx.arc(cx,cy,300,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,.05)';ctx.fill();ctx.fillStyle='rgba(255,120,120,.8)';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('FANTASY SKY · CENTER',cx,cy-310);ctx.restore()} // zone du centre
 for(const r of RDK){ctx.save();if(r.w){const u=1-r.t/34;ctx.globalAlpha=.35*(1-u);ctx.strokeStyle='#1a0628';ctx.lineWidth=40;ctx.beginPath();ctx.arc(r.x,r.y,30+u*900,0,TAU);ctx.stroke()}else{ctx.globalAlpha=.5*Math.min(1,r.t/30);const g=ctx.createRadialGradient(r.x,r.y,2,r.x,r.y,r.r);g.addColorStop(0,'#000');g.addColorStop(1,'#4a1a6a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,TAU);ctx.fill()}ctx.restore()}
 for(const m of SMR){const u=m.t/16,R=m.w?130:60;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);ctx.globalAlpha=u;ctx.lineCap='round';
  if(m.w){ctx.strokeStyle='#fff';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,0,R*.8,-1.1+(1-u)*.6,1.1-(1-u)*.2);ctx.stroke();ctx.strokeStyle='#9ab';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R*.62,-1,1);ctx.stroke()}
  else for(let i=0;i<6;i++){ctx.strokeStyle=RB[i];ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,R-i*6,-1.2+(1-u)*.8,1.2);ctx.stroke()}ctx.restore()} // traînées (kick arc-en-ciel, épée)
 for(const p of P){if(p.state==='dead')continue;
  if(p.spk>=90){const o=nearFoe(p.id,p.x,p.y);if(o){ctx.save();ctx.globalAlpha=.25+.35*Math.abs(Math.sin(frame*.4));ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.spkA)*1600,p.y+Math.sin(p.spkA)*1600);ctx.stroke();ctx.beginPath();ctx.arc(o.x,o.y,24+6*Math.sin(frame*.3),0,TAU);ctx.stroke();ctx.restore()}} // Master Spark : visée
  if(p.clone>0){const x=T.MAP_W-p.x,y=T.MAP_H-p.y;ctx.fillStyle='#333';ctx.fillRect(x-20,y-32,40,4);ctx.fillStyle='#8a9a50';ctx.fillRect(x-20,y-32,40*Math.max(0,p.cloneHP)/15,4)}
  if(p.fx.imm>0||p.fx.elx>0){ctx.strokeStyle=p.fx.imm>0?(frame&4?'#ffd23a':'#fff'):'rgba(255,210,58,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+8,0,TAU*(p.fx.imm>0?1:1-p.fx.elx/300));ctx.stroke()}}
 if(CX.myst)for(const p of P)if(p.state!=='dead'){ctx.strokeStyle=COLS[p.id];ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+3,0,TAU);ctx.stroke()}}
function chDraw5_2370(){chDraw5_2290();
 if(CX.terr){const r=CX.terr,o=P[r.o];if(o&&o.state!=='dead')r.L.forEach((k,i)=>{const a=frame*.03+i*TAU/r.L.length,x=o.x+Math.cos(a)*74,y=o.y+Math.sin(a)*74,s=1+.1*Math.sin(frame*.1+i);ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=TC[k];ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(9,0);ctx.lineTo(0,14);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()})} // cristaux
 if(CX.lyr2){const L=CX.lyr2;ctx.save();ctx.strokeStyle='rgba(220,220,220,.6)';ctx.lineWidth=5;for(let i=0;i<5;i++){const y=T.MAP_H*.88-i*(T.MAP_H*.76/4);ctx.beginPath();ctx.moveTo(-200,y);ctx.lineTo(T.MAP_W+200,y);ctx.stroke()} // portée
  for(const n of L.N){const sx=Math.sin(frame*1.3)*n.shk*.5,sy=Math.cos(frame*1.7)*n.shk*.3,z=1+n.shk*.02;ctx.save();ctx.translate(n.x+sx,n.y+sy);ctx.scale(z,z);ctx.rotate(-.35);ctx.strokeStyle=STC[n.p];ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(0,0,36,25,0,0,TAU);ctx.stroke();ctx.restore();ctx.strokeStyle=STC[n.p];ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(n.x+sx+34,n.y+sy-6);ctx.lineTo(n.x+sx+36,n.y+sy-150);ctx.stroke()}ctx.restore()}
 if(CX.mn)for(const n of CX.mn){ctx.save();ctx.translate(n.x,n.y);ctx.rotate(Math.sin(frame*.06+n.ph)*.4);ctx.fillStyle=n.c;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,9,6.5,-.35,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=n.c;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(8,-26);ctx.quadraticCurveTo(14,-20,18,-14);ctx.stroke();ctx.restore()}
 if(CX.rab)for(const r of CX.rab)if(r.x!==undefined){ctx.save();ctx.translate(r.x,r.y-r.h);ctx.fillStyle='#fff';ctx.strokeStyle='#e08aa0';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,10,8,0,0,TAU);ctx.fill();ctx.stroke();for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(s*4,-12,2.6,8,s*.2,0,TAU);ctx.fill();ctx.stroke()}ctx.fillStyle='#e03050';ctx.beginPath();ctx.arc(-3,-2,1.4,0,TAU);ctx.arc(3,-2,1.4,0,TAU);ctx.fill();ctx.restore()} // lapins
 for(const p of P){if(p.state==='dead')continue;
  if(p.kKnife&&p.fx.koishi>0){const k=p.kKnife;ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a+Math.PI/2);ctx.fillStyle='#dfe';ctx.strokeStyle='#7fe0a0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(4,0);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#355';ctx.fillRect(-2,0,4,9);ctx.globalAlpha=.5+.5*Math.sin(frame*.3);ctx.fillStyle='#fff';ctx.fillRect(-1,-10,1.5,6);ctx.restore()} // couteau planté
  if(CX.pill&&CX.pill.o===p.id){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.aim);ctx.strokeStyle='#d8f0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(8,0,30,-1.1,1.1);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8+30*Math.cos(1.1),-30*Math.sin(1.1));ctx.lineTo(8+30*Math.cos(1.1),30*Math.sin(1.1));ctx.stroke();ctx.restore()}} // arc d'Eirin
 for(const b of B)if(b.cos&&!b.dead){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(160,200,255,.7)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*7,b.y-b.vy*7);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore()}}
const chDraw5 = chDraw5_2370;
export { chDraw, chDraw2, chDraw3, chDraw4, chDraw5 };
