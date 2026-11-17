'use strict';
// ================================================================ AYA : vitesse, appareil photo, vent
DEFER(()=>{CHR7.push({k:'aya',name:'Aya',col:'#e04a4a',spd:1.2,din:1.08,dout:1,role:'Speedster · Camera, wind, hit and run',
 d:'FOCUS (hold): aim the camera, the frame grows; release = PHOTO (erases bullets, stuns foes inside). DASH: gust pushes bullets aside. HEAVY: tornado / wind blade (toward) / gust (away). SKILL 2: Scoop! newspaper covers the foe. SKILL 1: 5 s tailwind pushes everyone.',
 cd:7,shot(p,a,f,pm,lv){for(let i=0;i<3;i++){const b=chB(p,a+(i-1)*.12,8,pm*(.45+.05*lv),5,90);if(b){b.wav=.3;b.ph=i*2.1;b.c='#5cc04a'}}},
 heavy:{N:(p,m,a,k)=>{ENT.push({k:'atn',o:p.id,t:180,x:p.x+Math.cos(a)*40,y:p.y+Math.sin(a)*40,vx:Math.cos(a)*2,vy:Math.sin(a)*2,hc:{},d:3*k});capE(p,'atn',2);sfx('windblow',.8)},
  F:(p,m,a,k)=>{spawnH(p,m,a,k,{spd:18,r:6,k:1});const b=B[B.length-1];if(b&&b.owner===p.id){b.pierce=1;b.c='#bfffe0'}},
  B:(p,m,a,k)=>{for(const q of P)if(foeQ(p,q)){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;if(d<220){q.vx+=dx/d*9;q.vy+=dy/d*9;if(d<120)chHitQ(p,q,dx/d,dy/d,3*k,12,18)}}
   for(const b of B)if(!b.dead&&b.owner!==p.id){const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;if(d<180){const s=Math.hypot(b.vx,b.vy);b.vx=dx/d*s;b.vy=dy/d*s}}
   WAVES.push({x:p.x,y:p.y,t:18,T:18,spd:14,th:22,inv:0,c:'#bfffe0'});sfx('roll',.8)}},
 melee:{jab:{start:4,act:5,rec:10,range:46,arc:2,dmg:5,kb:6,stun:20},lunge:{start:5,act:14,rec:18,range:42,arc:1.4,dmg:3,kb:3,stun:14,multi:1,every:4,move:20},
  strong:{start:12,act:5,rec:26,range:66,arc:6.2832,dmg:15,kb:20,stun:44,charge:40},dashatk:{start:2,act:6,rec:14,range:44,arc:1.2,dmg:7,kb:12,stun:24,keep:.95}},
 spell:{name:'Wind God「Illusionary Dominance」',loop:200,fn(p,o,k){if(k%14===0){const q=chFoe(p);if(q){const a=k*.9;chRay(p,{T:10,tele:7,w:12,len:1200,dmg:5,ev:99,kb:8,stun:20,c:'#ff6060',follow:0,x:q.x-Math.cos(a)*600,y:q.y-Math.sin(a)*600,a});sfx('roll',.6)}}}},
 special(p){if(!chCool(p,600))return cdT(p,'SCOOP',p.chCD);const q=chFoe(p);if(!q)return;ENT.push({k:'anw',o:p.id,t:150,tg:q.id,x:q.x,y:q.y});txt(q.x,q.y-40,'SCOOP!','#e04a4a',16);sfx('se_kira00',.6)},
 special2(p){if(!cd2(p,720))return cdT(p,'TAILWIND',p.chC2);for(const e of myE(p,'awd'))e.t=0;ENT.push({k:'awd',o:p.id,t:300,a:p.aim,x:p.x,y:p.y});sfx('roll',.8)},
 dashF(p){p.aG=frame+12;sfx('windblow',.4)},
 tick(p){const c=Math.cos(p.aim),s=Math.sin(p.aim);
  if(p.state!=='dash'){if(p.dashCd>0)p.dashCd--;p.boost=Math.min(T.DASH_CHARGES,p.boost+T.DASH_REGEN*2.5)} // recharge des dashs bien plus rapide
  if(p.state==='dash'&&!(p.aHy>frame-20))for(const e of myE(p,'atn'))if(Math.hypot(e.x-p.x,e.y-p.y)<60){const v=Math.hypot(p.vx,p.vy)||1;p.vx=p.vx/v*24;p.vy=p.vy/v*24;p.t=Math.max(p.t,16);p.inv=Math.max(p.inv,12);e.t=0;p.aHy=frame;RINGS.push({x:p.x,y:p.y,r:0,m:70,t:14,c:'#bfffe0'});txt(p.x,p.y-34,'HYPER DASH','#bfffe0',14);sfx('windblow',.9);shake=Math.min(28,shake+6);break}
  if(p.aHy>frame-16&&frame%2===0)ENT.push({k:'mtr',o:p.id,t:20,x:p.x,y:p.y,aya:1});
  if(p.focus&&p.state!=='spell'&&frame>=(p.aCd||0))p.aF=Math.min(140,(p.aF||30)+2);
  else if(p.aF&&!p.focus){const S=p.aF/2,D=50+S;let n=0;for(const b of B)if(!b.dead&&b.owner!==p.id){const u=(b.x-p.x)*c+(b.y-p.y)*s,v=-(b.x-p.x)*s+(b.y-p.y)*c;if(Math.abs(u-D)<S&&Math.abs(v)<S*.75){b.dead=1;n++}}
   for(const q of P)if(foeQ(p,q)){const u=(q.x-p.x)*c+(q.y-p.y)*s,v=-(q.x-p.x)*s+(q.y-p.y)*c;if(Math.abs(u-D)<S&&Math.abs(v)<S*.75){if(chHitQ(p,q,c,s,3,0,60)){q.vx=q.vy=0;txt(q.x,q.y-34,'STUN!','#fff',15)}}}
   ENT.push({k:'aph',o:p.id,t:12,x:p.x+c*D,y:p.y+s*D,a:p.aim,S});flash(.15,'#fff');sfx('photo',1);if(n)txt(p.x,p.y-36,'PHOTO x'+n,'#fff',13);p.aF=0;p.aCd=frame+90}
  if(p.aG>frame){const v=Math.hypot(p.vx,p.vy)||1,nx=-p.vy/v,ny=p.vx/v;for(const b of B)if(!b.dead&&b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<80){const sg=((b.x-p.x)*nx+(b.y-p.y)*ny)>0?1:-1;b.vx+=nx*sg*1.5;b.vy+=ny*sg*1.5}}},
 cpu(p,o,I,d){if(d>250&&d<500&&frame>=(p.aCd||0)&&(p.aF||0)<110)I.b.focus=true;if((p.chCD||0)<=frame&&d<500&&rng()<.01)I.b.next=true;else if((p.chC2||0)<=frame&&rng()<.005)I.b.prev=true},
 draw(q,R){EMB.aya(q,R);if(q.aF){const S=q.aF/2,D=50+S,c=Math.cos(q.aim),s=Math.sin(q.aim);ctx.save();ctx.translate(q.x+c*D,q.y+s*D);ctx.rotate(q.aim);ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.globalAlpha=.85;const w=S,h=S*.75,k=Math.min(w,h)*.35;
   for(const[sx,sy]of[[-1,-1],[1,-1],[1,1],[-1,1]]){ctx.beginPath();ctx.moveTo(sx*w,sy*h-sy*k);ctx.lineTo(sx*w,sy*h);ctx.lineTo(sx*w-sx*k,sy*h);ctx.stroke()}ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-w,-h,w*2,h*2);ctx.fillStyle='#ff3030';ctx.beginPath();ctx.arc(-w+8,-h+8,3,0,TAU);ctx.fill();ctx.restore()}
  mvFx(q,R,{jab:['arc','rgba(120,230,120,.4)',W_.fan],lunge:['thrust','#bfffe0'],strong:['ring','#e04a4a',(x,y,a,r)=>{for(let i=0;i<8;i++){const b=i*TAU/8+frame*.2;ln(x+Math.cos(b)*r*.5,y+Math.sin(b)*r*.5,x+Math.cos(b)*r,y+Math.sin(b)*r,'#bfffe0',2)}}],dashatk:['thrust','#e04a4a']})}});});
