'use strict';
// ================================================================ NAZRIN : trésors, souris, pendules
DEFER(()=>{CHR7.push({k:'nazrin',name:'Nazrin',col:'#a0a0b0',spd:1.02,din:1,dout:1,role:'Mouse boss · Sentinels, pendulum, thief',
 d:'SHOT: mice that stay on the ground as sentinels (max 6) and bite. FOCUS: the pendulum points, sentinels rush there. HEAVY: Nazrin Pendulum (launches sentinels it hits) / detection cone marks the foe (toward) / Pendulum Guard (away). TOWARD+MELEE: steal spell gauge. SKILL 2: dig up a bonus (1 s, vulnerable). SKILL 1: recall every mouse.',
 cd:11,shot(p,a,f,pm,lv){const n=p.nDbl>frame?4:2;for(let i=0;i<n;i++){const b=chB(p,a+(i/(n-1)-.5)*.5,5.5,pm*(.6+.08*lv),5,60);if(b){b.mouse=1;b.home=.03;b.c='#9a9aa8';b.nsF=frame+34}}},
 heavy:{N:(p,m,a,k)=>{for(const e of myE(p,'npd'))if(!e.big)e.t=0;ENT.push({k:'npd',o:p.id,t:180,ax:p.x+Math.cos(a)*30,ay:p.y+Math.sin(a)*30,a,L:95,x:p.x,y:p.y,hc:{},d:6*k});sfx('tan00',.5)},
  F:(p,m,a,k)=>{let best=null,bd=1e9;for(const q of P)if(foeQ(p,q)){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);let da=Math.abs(Math.atan2(dy,dx)-a);da=Math.min(da,TAU-da);if(d<420&&da<.5&&d<bd){bd=d;best=q}}
   ENT.push({k:'ncn',o:p.id,t:16,x:p.x,y:p.y,a});if(best){p.chTg=best.id;p.chTgF=frame+200;txt(best.x,best.y-36,'FOUND!','#ffd23a',15);sfx('aimreal',1)}else sfx('se_invalid',.5)},
  B:(p,m,a,k)=>{for(const e of myE(p,'npg'))e.t=0;for(let i=0;i<3;i++)ENT.push({k:'npg',o:p.id,t:200,i,x:p.x,y:p.y,hc:{}});sfx('blockshield',.5)}},
 melee:{jab:{start:4,act:8,rec:12,range:44,arc:1.6,dmg:3.5,kb:4,stun:16,multi:1,every:4},lunge:{start:7,act:5,rec:18,range:56,arc:.8,dmg:5,kb:5,stun:24},strong:{start:10,act:6,rec:28,range:76,arc:2,dmg:13,kb:16,stun:42,charge:40}},
 spell:{name:'Dowsing「Nazrin Pendulum」',loop:200,fn(p,o,k){if(k===0)ENT.push({k:'npd',o:p.id,t:200,ax:p.x,ay:p.y,a:p.aim,L:300,big:1,x:p.x,y:p.y,hc:{},d:9});if(k%20===10)for(let i=0;i<10;i++)xBall(p,p.x,p.y,i*TAU/10+k,4.5,5,{dmg:3,kb:3,stun:12,arm:0},{c:'#ffd23a',life:140})}},
 onHit(a,v,heavy){if(!heavy&&a.mvName==='lunge'){const s=Math.min(v.spirit||0,25);if(s>0){v.spirit-=s;a.spirit=Math.min(T.SPIRIT_MAX,a.spirit+s)}txt(v.x,v.y-30,'STOLEN!','#ffd23a',14);for(let i=0;i<5;i++)FX.length<480&&FX.push({x:v.x,y:v.y,vx:(a.x-v.x)*.04+Math.cos(i)*1.5,vy:(a.y-v.y)*.04+Math.sin(i)*1.5,t:24,c:'#ffd23a'})}},
 spdM:p=>p.nSpd>frame?1.3:1,
 inp(p,o,I){if(p.nDig>frame)return{x:0,y:0,b:{}};return I},
 special(p){if(!chCool(p,600))return cdT(p,'DIG',p.chCD);p.nDig=frame+60;sfx('throw',.5);txt(p.x,p.y-36,'DIGGING…','#c8a060',13)},
 special2(p){if(!cd2(p,300))return cdT(p,'RECALL',p.chC2);const S=myE(p,'nms');for(const e of S){e.t=0;ENT.push({k:'nrc',o:p.id,t:120,x:e.x,y:e.y,hc:{}})}if(S.length)sfx('se_cat00',.6)},
 tick(p){
  for(const b of B)if(b.nsF&&b.owner===p.id&&!b.dead&&frame>=b.nsF){b.dead=1;ENT.push({k:'nms',o:p.id,t:900,x:b.x,y:b.y,hc:{},i:frame%7});capE(p,'nms',6)}
  if(p.nDig&&p.nDig<=frame){p.nDig=0;const r=rng()*4|0;burst(p.x,p.y,'#c8a060',14);
   if(r===0){p.nSpd=frame+300;txt(p.x,p.y-36,'SPEED!','#7cff7a',15)}else if(r===1){p.nSh=1;txt(p.x,p.y-36,'SHIELD!','#7ae0ff',15)}else if(r===2){p.nDbl=frame+480;txt(p.x,p.y-36,'DOUBLE MICE!','#ccc',15)}
   else{const q=chFoe(p);ENT.push({k:'ncoin',o:p.id,t:36,T:36,x0:p.x,y0:p.y,tx:q?q.x:p.x+Math.cos(p.aim)*200,ty:q?q.y:p.y+Math.sin(p.aim)*200,x:p.x,y:p.y});txt(p.x,p.y-36,'BOMB COIN!','#ffd23a',15)}sfx('se_kira00',.7)}},
 dinM:v=>{if(v.nSh){v.nSh=0;burst(v.x,v.y,'#7ae0ff',16);txt(v.x,v.y-34,'BLOCKED','#7ae0ff',13);return 0}return 1},
 cpu(p,o,I,d){if((p.chCD||0)<=frame&&d>420&&rng()<.02)I.b.next=true;else if((p.chC2||0)<=frame&&myE(p,'nms').length>=4&&d<300)I.b.prev=true;if(myE(p,'nms').length>=3&&d<400&&rng()<.3)I.b.focus=true},
 draw(q,R){EMB.nazrin(q,R);if(q.nSh){ctx.strokeStyle='#7ae0ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R*1.7,0,TAU);ctx.stroke()}
  if(q.nDig>frame){for(let i=0;i<4;i++){const a=frame*.4+i*1.6;ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*1.3,q.y+R+Math.sin(a)*4,3,0,TAU);ctx.fill()}}
  if(q.focus){const tx=q.x+Math.cos(q.aim)*160,ty=q.y+Math.sin(q.aim)*160,sw=Math.sin(frame*.15)*8;ln(q.x,q.y,tx+sw,ty,'rgba(220,220,240,.4)',1.5);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.moveTo(tx+sw,ty-9);ctx.lineTo(tx+sw+6,ty);ctx.lineTo(tx+sw,ty+11);ctx.lineTo(tx+sw-6,ty);ctx.fill()}
  mvFx(q,R,{jab:['arc','rgba(220,220,240,.4)',W_.rods],lunge:['thrust','#ffd23a',(x,y,a,l)=>{ctx.fillStyle='#9a9aa8';ctx.beginPath();ctx.arc(x+Math.cos(a)*l,y+Math.sin(a)*l,7,0,TAU);ctx.fill()}],strong:['arc','rgba(120,220,255,.45)',(x,y,a,L)=>{ln(x,y,x+Math.cos(a)*L,y+Math.sin(a)*L,'#ccc',2);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.arc(x+Math.cos(a)*L,y+Math.sin(a)*L,10,0,TAU);ctx.fill()}]})}});});
