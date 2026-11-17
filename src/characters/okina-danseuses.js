'use strict';
// ---- Okina : Satono (i0) et Mai (i1) dansent sur place, renvoient vers leur sœur
DEFER(()=>{EST.odn=(e,o)=>{const S=ENT.find(z=>z.k==='odn'&&z.o===e.o&&z.t>0&&z!==e);
 for(const q of P){if(!foeQ(o,q)||(e.hc[q.id]||0)>frame)continue;const d=Math.hypot(q.x-e.x,q.y-e.y);if(d>30+bodyR(q))continue;e.hc[q.id]=frame+20;
  let dx=S?S.x-e.x:q.x-e.x,dy=S?S.y-e.y:q.y-e.y;const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;if(chHitQ(o,q,dx,dy,5,S?Math.min(18,7+l/16):12,30)){burst(q.x,q.y,e.i?'#5cff7a':'#ff7ad0',10);sfx(e.i?'taikorouge':'taikobleu',.6)}}
 if(--e.cd<=0){e.cd=45;e.n++;for(let i=0;i<8;i++)xBall(o,e.x,e.y,i*TAU/8+e.n*.3+e.i,2.2,4,{dmg:2,kb:2,stun:8,arm:0},{c:e.i?'#5cff7a':'#ff7ad0',life:150});
  if(e.n%3===0)for(const s of[-1,1])xBall(o,e.x,e.y,e.n*.7+s*1.3,1.8,10,{dmg:4,kb:4,stun:14,arm:0},{c:'#ffd23a',life:200})}};});
DEFER(()=>{EDR.odn=e=>{const c=e.i?'#5cff7a':'#ff7ad0',b=Math.sin(frame*.25+e.i*2)*3,sp=frame*.15*(e.i?1:-1),S=ENT.find(z=>z.k==='odn'&&z.o===e.o&&z.t>0&&z!==e);
 if(S&&e.i){ctx.setLineDash([6,8]);ln(e.x,e.y,S.x,S.y,'rgba(255,230,140,.35)',2);ctx.setLineDash([])}
 ctx.strokeStyle=c;ctx.globalAlpha=.35;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,30,0,TAU);ctx.stroke();ctx.globalAlpha=1;
 ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(e.x-11,e.y+12+b);ctx.lineTo(e.x+11,e.y+12+b);ctx.lineTo(e.x,e.y-6+b);ctx.fill();ctx.fillStyle='#ffe0c0';ctx.beginPath();ctx.arc(e.x,e.y-11+b,6,0,TAU);ctx.fill();
 for(const s of[-1,1]){const a=sp+(s>0?0:Math.PI);ln(e.x,e.y-2+b,e.x+Math.cos(a)*15,e.y-2+b+Math.sin(a)*15,e.i?'#3ac05a':'#d04a8a',3);ctx.fillStyle=e.i?'#9aff8a':'#ff9ad0';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*16,e.y-2+b+Math.sin(a)*16,3.5,0,TAU);ctx.fill()}
 ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,34,-Math.PI/2,-Math.PI/2+TAU*e.t/300);ctx.stroke()};});
