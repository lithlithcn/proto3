// @ts-nocheck — legacy drawP layer chain (base + wrappers in file order), copied verbatim. Not sim code.
import { COLS, LCOLS } from '../colors';
const TAU = 6.2832, T = { GRAZE_R: 27, PARRY_R: 30 };
let ctx, frame, P, CX, chOf, bodyR, coreR, rnd, hitstop;
export const bindLayers = (v) => { ({ ctx, frame, P, CX, chOf, bodyR, coreR, rnd, hitstop } = v); };
const reisOff=q=>{if(!CX.reis||q.id===CX.reis.o)return null;const a=(q.ofA||0)+frame*.01;return[Math.cos(a)*80,Math.sin(a)*80]};
const PREV={homing:'TAKES x2 DAMAGE',drain:'LOSING HP',power:'',tether:'CAGED',blank:'BULLETS ARE FAKE',restless:'CANNOT STOP',reaper:'',steal:'GAUGES STOLEN'},PREVL={homing:'P# TAKES DOUBLE DAMAGE',drain:'P# LOSES HP EVERY SECOND',power:'SAGUME HITS x2 AND TAKES x0.5',tether:'P# IS LOCKED IN A CAGE',blank:"P#'S BULLETS DO NOTHING",restless:'P# CAN NEVER STOP MOVING',reaper:'EVERY FOE UNDER 50 HP DIES',steal:"P#'S GAUGES FLOW TO SAGUME"};
const SPAM={ysCD:90,ufCD:90,thCD:90,rkCD:90,anCD:90,stCD:90,bowCD:90,brCD:90};
function drawJunkoAura(p){const R=bodyR(p)*2.6;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.36,w=Math.sin(frame*.09+i*1.7),L=R*(1.15+.25*w)*(i%2?1:1.25),c=Math.cos(a),s=Math.sin(a),bx=p.x+c*R*.25,by=p.y+s*R*.25+6;
  const g=ctx.createLinearGradient(bx,by,bx+c*L,by+s*L);g.addColorStop(0,'rgba(255,120,220,.55)');g.addColorStop(.6,'rgba(200,80,255,.35)');g.addColorStop(1,'rgba(240,210,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx-s*9,by+c*9);ctx.quadraticCurveTo(bx+c*L*.5-s*(14+w*6),by+s*L*.5+c*(14+w*6),bx+c*L+s*w*10,by+s*L-c*w*10);ctx.quadraticCurveTo(bx+c*L*.5+s*(10-w*6),by+s*L*.5-c*(10-w*6),bx+s*9,by-c*9);ctx.fill()}
 ctx.globalAlpha=.25+.1*Math.sin(frame*.2);ctx.fillStyle='#ff9ad6';ctx.beginPath();ctx.arc(p.x,p.y,R,0,TAU);ctx.fill();ctx.restore()}
const dBase=(q)=>{
 if(q.state==='dead'||q.state==='eaten')return;const jt=hitstop>0?Math.min(3,hitstop*.25):0; // tremblement pendant le gel
 if(jt){ctx.save();ctx.translate((rnd()-.5)*jt*2,(rnd()-.5)*jt*2)}const c=CX.anon>0?'#9aa':COLS[q.id],R=bodyR(q),ro=reisOff(q);if(ro){ctx.save();ctx.translate(ro[0],ro[1])} // Rin : anonymes / Reisen : décalés
 if(q.inv>0&&(frame>>2)%2)ctx.globalAlpha=.45;if(q.fx.koishi>0)ctx.globalAlpha=.06;if(q.fx.under>0)ctx.globalAlpha=0;
 ctx.fillStyle=q.flash>0?'#fff':q.state==='parrystun'||q.state==='broken'?'#555':'#222';ctx.strokeStyle=c;ctx.lineWidth=3;
 ctx.beginPath();ctx.arc(q.x,q.y,R,0,TAU);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(q.x+Math.cos(q.aim)*R,q.y+Math.sin(q.aim)*R);ctx.lineTo(q.x+Math.cos(q.aim)*(R+10),q.y+Math.sin(q.aim)*(R+10));ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,coreR(q)+(q.focus?1.5:0),0,TAU);ctx.fill();
 if(q.focus){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q.x,q.y,T.GRAZE_R,0,TAU);ctx.stroke()}
 if(q.slide>0){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*4,q.y-q.vy*4);ctx.stroke()}
 if(q.state==='spell'){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(q.x,q.y,40+6*Math.sin(frame*.2),0,TAU);ctx.stroke();ctx.globalAlpha=1}
 if(q.state==='parry'||q.state==='parrylag'){const on=q.state==='parry';ctx.strokeStyle=on?'#6ff':'#355';ctx.lineWidth=on?4:2;ctx.beginPath();ctx.arc(q.x,q.y,T.PARRY_R,0,TAU);ctx.stroke()}
 if(q.state==='atk'&&q.mv){const m=q.mv;
  if(m.spd){if(q.t<m.start){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R+6+(m.start-q.t)*2,0,TAU);ctx.stroke()}}
  else if(q.charging){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R+4+q.charge*.6,0,TAU);ctx.stroke()}
  else{const live=q.t>m.start&&q.t<=m.start+m.act;
   ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.arc(q.x,q.y,m.range*(q.fx.laev>0?2.2:1)*(q.giant>0?1.6:1)+R,q.atkA-m.arc/2,q.atkA+m.arc/2);ctx.closePath();
   if(live){ctx.globalAlpha=.4;ctx.fillStyle=c;ctx.fill();ctx.globalAlpha=1}else if(q.t<=m.start){ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke()}}}
 if(q.state==='hitstun'){ctx.fillStyle='#fc3';ctx.fillRect(q.x-16,q.y-28,32*Math.min(1,q.t/40),3)}
 ctx.globalAlpha=1;if(ro)ctx.restore();if(jt)ctx.restore()}
const dA=(p)=>{dBase(p);if(p.fat&&p.fatT>frame){ctx.globalAlpha=.25;ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+6,0,TAU);ctx.fill();ctx.globalAlpha=1}
 if(p.fx&&p.fx.devour>0){const a=p.state==='atk'?(p.atkA??p.aim)+(p.mv?(.9-1.8*Math.min(1,p.t/Math.max(1,p.mv.start+p.mv.act))):0):p.aim+.6,c=Math.cos(a),s=Math.sin(a);ctx.strokeStyle='#d8d8e0';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x+c*10,p.y+s*10);ctx.lineTo(p.x+c*52,p.y+s*52);ctx.stroke();ctx.lineCap='butt';
  ctx.save();ctx.translate(p.x+c*74,p.y+s*74);ctx.rotate(a);ctx.fillStyle='#e8e8f0';ctx.beginPath();ctx.ellipse(0,0,26,17,0,0,TAU);ctx.fill();ctx.fillStyle='#b0b0c0';ctx.beginPath();ctx.ellipse(2,0,18,11,0,0,TAU);ctx.fill();ctx.restore()}
 const R=CX.proph;if(R&&R.v===p.id&&R.k!=='power'&&R.k!=='reaper'){ctx.fillStyle='#e8e8ff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('PROPHECY: '+PREV[R.k],p.x,p.y-50)}};
const dJ=(p)=>{if(p.fx&&p.fx.pure>0&&p.state!=='dead')drawJunkoAura(p);dA(p);
 let cd=0;for(const k in SPAM)if(p[k]>frame)cd=Math.max(cd,(p[k]-frame)/SPAM[k]);if(p.mlPC>frame)cd=Math.max(cd,(p.mlPC-frame)/90);if(cd>0){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(p.x-18,p.y+bodyR(p)+4,36,4);ctx.fillStyle='#9fe0c0';ctx.fillRect(p.x-18,p.y+bodyR(p)+4,36*(1-cd),4)}
 if(p.fx&&p.fx.stack>0&&p.stones>0)for(let i=0;i<p.stones;i++){ctx.fillStyle=i%2?'#c8b8a0':'#a09080';ctx.beginPath();ctx.ellipse(p.x,p.y-bodyR(p)-8-i*9,12-i*.5,5,0,0,TAU);ctx.fill()}};
const dC=q=>{dJ(q);const c=chOf(q);if(!c||q.state==='dead'||q.state==='eaten'||CX.anon>0||q.fx.koishi>0||q.fx.under>0)return;ctx.save();const ro=reisOff(q);if(ro)ctx.translate(ro[0],ro[1]);if(q.inv>0&&(frame>>2)%2)ctx.globalAlpha=.45;c.draw(q,bodyR(q));ctx.restore()};
const dN=q=>{const c=chOf(q);if(q.nOrig!==undefined&&q.nD>frame&&P[q.nDid]){const j=q.nDid,a=COLS[q.id],b=LCOLS[q.id];COLS[q.id]=COLS[j];LCOLS[q.id]=LCOLS[j];try{dC(q)}finally{COLS[q.id]=a;LCOLS[q.id]=b}}else dC(q)};
const dT=q=>{dN(q);if(q.state==='dead')return;
 if(q.ctr&&q.ctr.t>frame){const k=(q.ctr.t-frame)/300,R=bodyR(q)*1.9;ctx.save();ctx.strokeStyle='#6a9a4a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R,-Math.PI/2,-Math.PI/2+TAU*k);ctx.stroke();ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillStyle='#b8e890';ctx.fillText('CONTRACT '+Math.ceil(k*5)+'s: HIT P'+(q.ctr.o+1),q.x,q.y-R-8);ctx.restore()}
 if(q.fx&&q.fx.larva>0){ctx.save();ctx.globalAlpha=.6+.4*Math.sin(frame*.25);ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#c8ff5a';ctx.fillText('MOVE!',q.x,q.y+bodyR(q)+22);ctx.restore()}};
const dS=q=>{dT(q);const s=CX.sat;if(!s||q.id===s.o||q.state==='dead')return;const x=q.x+q.vx*24,y=q.y+q.vy*24;ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle='#ff8fd0';ctx.setLineDash([4,4]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,bodyR(q),0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(x,y);ctx.stroke();ctx.restore()};
export const drawP = dS;
