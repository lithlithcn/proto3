'use strict';
// ================================================================ FLANDRE : berserker, œil de la destruction
DEFER(()=>{CHR7.push({k:'flandre',name:'Flandre',col:'#ff3030',spd:1.02,din:1.05,dout:1,role:'Berserker · Eye of destruction + shotgun',
 d:'FOCUS: see the eye of things, focus melee = CRUSH (crit, destroys heavy shots). SHOT: rainbow shotgun. HEAVY: Starbow Break / Laevatein boomerang (toward) / Cranberry Trap (away). DASH chains speed up. SKILL 2: Four of a Kind. SKILL 1: Frenzy.',
 cd:13,shot(p,a,f,pm,lv){for(let i=0;i<7;i++){const b=chB(p,a+(i-3)*.09,11,pm*(.36+.04*lv),4,20);if(b)b.c=FLC[i]}},
 heavy:{N:(p,m,a,k)=>{const q=chFoe(p),cx=q?q.x:p.x+Math.cos(a)*250,cy=q?q.y:p.y+Math.sin(a)*250;for(let i=0;i<7;i++){const r=i?55+i*6:0;ENT.push({k:'fsb',o:p.id,t:22+i*5,T:22+i*5,x:cx+Math.cos(i*2.4)*r,y:cy+Math.sin(i*2.4)*r,c:FLC[i],d:6*k})}},
  F:(p,m,a,k)=>{for(const e of myE(p,'flv'))e.t=0;ENT.push({k:'flv',o:p.id,t:90,T:90,x:p.x,y:p.y,vx:Math.cos(a)*11,vy:Math.sin(a)*11,hc:{},d:5*k,sp:0});sfx('fire',.7)},
  B:(p,m,a,k)=>{for(let i=0;i<12;i++){const b=i*TAU/12;xBall(p,p.x+Math.cos(b)*170,p.y+Math.sin(b)*170,0,0,7,{dmg:5*k,kb:5,stun:18,arm:0},{c:'#ff2a5a',life:130,ct:frame+30,tx:p.x,ty:p.y})}sfx('tan01',.6)}},
 melee:{jab:{start:3,act:9,rec:10,range:40,arc:1.8,dmg:2.5,kb:2,stun:12,multi:1,every:3},lunge:{start:8,act:6,rec:20,range:84,arc:2.4,dmg:11,kb:12,stun:30},
  strong:{start:10,act:10,rec:28,range:100,arc:.55,dmg:16,kb:18,stun:44,charge:40},dashatk:{start:2,act:10,rec:16,range:42,arc:1.4,dmg:8,kb:10,stun:24,keep:1}},
 spell:{name:'Secret Barrage「And Then Will There Be None?」',loop:240,fn(p,o,k){if(k%8===0)for(let i=0;i<8;i++){addB(p,i*TAU/8+k*.07*((k>>3)%2?1:-1),3.6,0,null,200);const b=B[B.length-1];if(b&&b.owner===p.id)b.c=FLC[i%7]}}},
 doutM:(a,v,heavy)=>(!heavy&&a.focus?1.6:1)*(a.fFr>frame?1.35:1),spdM:p=>p.fFr>frame?1.25:1,
 onHit(a,v,heavy){if(!heavy&&a.focus){txt(v.x,v.y-30,'CRUSH!','#ff3030',16);burst(v.x,v.y,'#ff3030',18);shake=Math.min(28,shake+6);sfx('break',.6)}},
 dashF(p){const ch=frame-(p.fLD||-99)<45?Math.min(3,(p.fCh||1)+1):1;p.fCh=ch;p.fLD=frame;p.vx*=1+.2*(ch-1);p.vy*=1+.2*(ch-1);if(ch>1)txt(p.x,p.y-30,'x'+ch,'#ff7070',12)},
 special(p){if(!chCool(p,480))return cdT(p,'CLONES',p.chCD);const q=chFoe(p);if(!q)return;const a0=Math.atan2(p.y-q.y,p.x-q.x);for(let i=0;i<3;i++)ENT.push({k:'fcl',o:p.id,t:70,T:70,x:q.x+Math.cos(a0+i*TAU/3)*160,y:q.y+Math.sin(a0+i*TAU/3)*160,tg:q.id,vx:0,vy:0,hit:0});sfx('teleportation',.6)},
 special2(p){if(!cd2(p,600))return cdT(p,'FRENZY',p.chC2);p.hp=Math.max(1,p.hp-12);p.fFr=frame+240;burst(p.x,p.y,'#ff3030',24);txt(p.x,p.y-34,'FRENZY!','#ff3030',16);sfx('se_enep01',.6)},
 tick(p){p.chC=9;p.chM=1;if(p.focus&&p.state==='atk'&&p.mv&&p.t>=p.mv.start&&p.t<p.mv.start+p.mv.act){const r=p.mv.range+bodyR(p);for(const b of B)if(!b.dead&&b.heavy&&b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<r+b.r){b.dead=1;burst(b.x,b.y,'#ff3030',10);txt(b.x,b.y-14,'CRUSH','#ff6060',12)}}},
 cpu(p,o,I,d){if((p.chCD||0)<=frame&&d<420&&rng()<.03)I.b.next=true;else if((p.chC2||0)<=frame&&p.hp>50&&d<260&&rng()<.02)I.b.prev=true},
 draw(q,R){if(q.fFr>frame){ctx.globalAlpha=.3+.2*Math.sin(frame*.5);ctx.fillStyle='#ff2020';ctx.beginPath();ctx.arc(q.x,q.y,R*1.8,0,TAU);ctx.fill();ctx.globalAlpha=1}EMB.flandre(q,R);
  if(q.focus){const eye=(x,y,s)=>{ctx.fillStyle='#ff2020';ctx.beginPath();ctx.ellipse(x,y,s,s*.55,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,s*.35,0,TAU);ctx.fill()};
   for(const o of P)if(o!==q&&o.state!=='dead'&&foeOf(q.id,o)&&Math.hypot(o.x-q.x,o.y-q.y)<300)eye(o.x,o.y-bodyR(o)-14,7+Math.sin(frame*.3));for(const b of B)if(!b.dead&&b.heavy&&b.owner!==q.id&&Math.hypot(b.x-q.x,b.y-q.y)<220)eye(b.x,b.y,5)}
  mvFx(q,R,{jab:['arc','rgba(255,120,120,.4)',W_.claws],lunge:['arc','rgba(255,90,20,.5)',W_.laev],strong:['thrust','rgba(255,90,20,.55)',W_.laevP],dashatk:['thrust','#ff3030']})}});});
