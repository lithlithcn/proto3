'use strict';
// ---- Flandre : Laevatein lancée en boomerang + traînée de flammes
DEFER(()=>{EST.flv=(e,o)=>{const age=e.T-e.t;e.sp+=.45;if(age<30){e.vx*=.965;e.vy*=.965}else{const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy)||1;e.vx+=(dx/d*12-e.vx)*.15;e.vy+=(dy/d*12-e.vy)*.15;if(d<22){e.t=0;return}}e.x+=e.vx;e.y+=e.vy;
 if(age%4===0)ENT.push({k:'ffl',o:e.o,t:45,x:e.x,y:e.y});
 for(const q of P)if(foeQ(o,q)&&!((e.hc[q.id]||0)>frame)&&Math.hypot(q.x-e.x,q.y-e.y)<26+bodyR(q)){e.hc[q.id]=frame+18;chHitQ(o,q,e.vx,e.vy,e.d,7,20)}};});
DEFER(()=>{EST.ffl=(e,o)=>{for(const q of P)if(foeQ(o,q)&&Math.hypot(q.x-e.x,q.y-e.y)<12+bodyR(q)){const H=o.fHc||(o.fHc={});if((H[q.id]||0)<=frame){H[q.id]=frame+30;chHitQ(o,q,0,0,2,1,10)}}};});
DEFER(()=>{EDR.ffl=e=>{const k=e.t/45;ctx.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const f=Math.sin(frame*.7+e.x+i*2);ctx.globalAlpha=k*(.5-i*.12);ctx.fillStyle=['#ff3a10','#ff9a20','#ffe080'][i];ctx.beginPath();ctx.ellipse(e.x+f*2,e.y-i*4-(1-k)*8,9-i*2.5,12-i*3,0,0,TAU);ctx.fill()}};});
DEFER(()=>{EDR.flv=e=>{ctx.translate(e.x,e.y);ctx.rotate(e.sp);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35;ctx.fillStyle='#ff5a10';ctx.beginPath();ctx.arc(0,0,30,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';W_.laev(-28,0,0,56)};});
