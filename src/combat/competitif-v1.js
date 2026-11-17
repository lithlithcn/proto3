'use strict';
// ---- compétitif v1 : buffer, jauge de parade, annulation, lisibilité
let NOBUF;DEFER(()=>{NOBUF=new Set(['next','prev','shot','focus'])});let LPASS=0,LPA=1,LPV=null;
const LPF=b=>{if(!LPV)return LPASS===0;const al=b.owner===LPV.id||(TEAMS&&P[b.owner]&&ally(P[b.owner],LPV));return LPASS?al:!al};
function drawDanger(){const v=LPV;if(!v||v.state==='dead')return;ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=1.6; // danger proche : contour net
 for(const b of B){if(b.dead||b.heavy&&b.breaker)continue;if(b.owner===v.id||TEAMS&&P[b.owner]&&ally(P[b.owner],v))continue;const d=Math.hypot(b.x-v.x,b.y-v.y);if(d>72)continue;ctx.globalAlpha=Math.min(1,(72-d)/40);ctx.beginPath();ctx.arc(b.x,b.y,(b.heavy?b.r:b.r)+2.5,0,TAU);ctx.stroke()}
 for(const b of B)if(!b.dead&&b.bf!==undefined&&frame-b.bf<7){const u=(frame-b.bf)/7;ctx.globalAlpha=.7*(1-u);ctx.strokeStyle=b.c||COLS[b.owner]||'#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*(2.6-1.6*u),0,TAU);ctx.stroke()} // apparition
 ctx.restore()}
DEFER(()=>{{const U0=updP;updP=(p,o,I)=>{const s0=p.state,t0=p.t;U0(p,o,I);if(p.buf&&(p.state!==s0&&p.state!=='idle'||p.state==='atk'&&p.t<t0))p.buf={}}}}); // une action lancée vide le buffer
DEFER(()=>{{const F0=parryFx;parryFx=(t,...a)=>{t.pOK=frame;return F0(t,...a)}}});
DEFER(()=>{{const S0=step;step=()=>{for(const b of B)if(b.bf===undefined)b.bf=frame;S0();if(mode!=='game')return;
 for(const p of P){if(p.pg===undefined)p.pg=100;if(p.in&&p.in.b){const bb=p.in.b,pv=p.bpv||{},BF=p.buf||(p.buf={});for(const k in bb)if(bb[k]&&!pv[k]&&!NOBUF.has(k)&&!(k==='heavy'&&!p.cpu)&&!(frame-BF[k]<=8))BF[k]=frame;p.bpv={...bb}} // entrées gardées même pendant le hitstop
  if(p.lstS==='parry'&&p.state!=='parry'&&!((p.pOK||-1)>=(p.pStart||0))&&p.state!=='dead'&&(!TUT||TSTEPS[TUT.i].gg)){p.pg-=28;if(p.pg<=0){p.pg=55;xShieldBreak(p,null);big('GUARD CRUSH!','#6ff',40)}else if(p.pg<35)txt(p.x,p.y-40,'GUARD LOW','#6ff',12)} // parade ratée : use la jauge
  if(p.state!=='parry')p.pg=Math.min(100,p.pg+.45);p.lstS=p.state;
  if(p.cc&&frame-p.ccF>18){if(p.cc>=5){txt(p.x,p.y-52,'CANCEL x'+p.cc,'#ffd23a',p.cc>=20?18:14);}p.cc=0}}}}});

