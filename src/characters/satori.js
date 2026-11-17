'use strict';
// ---- Satori : fantôme de prédiction (0,4 s) et visée dessus · Satono : notes à esquiver
DEFER(()=>{{const S1=step;step=()=>{const s=CX&&CX.sat,o=s&&P[s.o];for(const p of P){if(p.satM&&!(s&&o===p)){p.maim=null;p.satM=0}}
 if(mode==='game'&&o&&o.state!=='dead'){const q=nearFoe(o.id,o.x,o.y,2000);if(q){o.maim=[q.x+q.vx*24,q.y+q.vy*24];o.satM=1}}S1()}}});
DEFER(()=>{EST.snote=(e,o)=>{if(e.t!==1)return;let hit1=false;for(const q of P)if(foeQ(o,q)&&Math.hypot(q.x-e.x,q.y-e.y)<30+bodyR(q)){if(chHitQ(o,q,0,1,8,4,16))hit1=true}if(hit1)o.spirit=Math.min(T.SPIRIT_MAX,o.spirit+10);burst(e.x,e.y,'#ff8fd0',12);sfx('taikobleu',.5)};});
DEFER(()=>{EDR.snote=e=>{const u=e.t/e.T;ctx.strokeStyle='#ff8fd0';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,30*u+8,0,TAU);ctx.stroke();ctx.globalAlpha=1;const y=e.y-e.t*6;ctx.fillStyle='#ff8fd0';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('♪',e.x,y+10)};});
DEFER(()=>{{const D0=drawP;drawP=q=>{D0(q);const s=CX.sat;if(!s||q.id===s.o||q.state==='dead')return;const x=q.x+q.vx*24,y=q.y+q.vy*24;ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle='#ff8fd0';ctx.setLineDash([4,4]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,bodyR(q),0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(x,y);ctx.stroke();ctx.restore()}}});
