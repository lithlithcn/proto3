'use strict';
// ================================================================ MARISA : canon de verre, lasers, chaleur du Hakkero
DEFER(()=>{CHR7.push({k:'marisa',name:'Marisa',col:'#ffd23a',spd:1.04,din:1.1,dout:1,role:'Glass cannon · Lasers + Hakkero heat',
 d:'FOCUS: heat the Hakkero (bigger heavies, overheat burns you). HEAVY: Master Spark / Narrow Spark (toward) / Stardust Reverie (away), lasers show a 1 s warning, then need 1 s to recharge. DASH: Blazing Star, DASH + HEAVY = rear laser boost. SKILL 2: star potion. SKILL 1: Non-Directional Laser.',
 cd:9,shot(p,a,f,pm,lv){const n=2+Math.min(3,lv);for(let i=0;i<n;i++){const b=chB(p,a+(i/(n-1)-.5)*.7,7,pm*1.7/n,6,90);if(b){b.mst=frame;b.c=i%2?'#7cff7a':'#ffe14a'}}},
 heavy:{N:(p,m,a,k)=>{if(p.mLz>frame)return;const h=mHm(p);p.mLz=frame+LZ_TELE+44+LZ_GAP;chRay(p,{T:LZ_TELE+44,tele:LZ_TELE,warn:1,w:14*h,len:1000,dmg:1.5*h*k,ev:7,kb:6,stun:18,c:'#ffe060',push:.35,clr:1,a});sfx('heavymasterspark',.8);shake=Math.min(28,shake+6)},
  F:(p,m,a,k)=>{if(p.mLz>frame)return;const h=mHm(p);p.mLz=frame+LZ_TELE+7+LZ_GAP;chRay(p,{T:LZ_TELE+7,tele:LZ_TELE,warn:1,w:4*h,len:800,dmg:5*h*k,ev:99,kb:8,stun:22,c:'#fff6a0',a,follow:0});sfx('se_lazer00',.5)},
  B:(p,m,a,k)=>{const h=mHm(p);for(let i=0;i<7;i++){spawnH(p,m,a+(i-3)*.22,k,{spd:5.5,r:Math.round(9*Math.min(1.6,h)),k:.28*h});const b=B[B.length-1];if(b&&b.owner===p.id){b.mst=frame;b.c=['#ffe14a','#7cff7a','#4ab3ff'][i%3]}}}},
 melee:{jab:{start:5,act:5,rec:13,range:52,arc:2.2,dmg:6,kb:7,stun:22},lunge:{start:6,act:12,rec:20,range:40,arc:1.2,dmg:9,kb:11,stun:28,move:22},
  strong:{start:8,act:4,rec:26,range:70,arc:6.2832,dmg:14,kb:16,stun:40,charge:40},dashatk:{start:2,act:7,rec:18,range:50,arc:1.4,dmg:9,kb:12,stun:28,keep:.97}},
 spell:{name:'Love Sign「Final Spark」',loop:200,fn(p,o,k){if(k===0){chRay(p,{T:150,tele:36,w:52,len:1500,dmg:3,ev:5,kb:7,stun:18,c:'#fff3a0',a:p.aim-.5,spin:.007,clr:1});sfx('masterspark2',1)}}},
 special(p){if(!chCool(p,300))return cdT(p,'POTION',p.chCD);const q=chFoe(p);let tx=q?q.x:p.x+Math.cos(p.aim)*220,ty=q?q.y:p.y+Math.sin(p.aim)*220;const d=Math.hypot(tx-p.x,ty-p.y);if(d>260){tx=p.x+(tx-p.x)/d*260;ty=p.y+(ty-p.y)/d*260}
  ENT.push({k:'mpot',o:p.id,t:30,T:30,x0:p.x,y0:p.y,tx,ty,x:p.x,y:p.y});sfx('shoot3',.6)},
 special2(p){if(!cd2(p,480))return cdT(p,'LASER',p.chC2);for(let i=0;i<4;i++)chRay(p,{T:120,tele:14,w:4,len:120,dmg:1.5,ev:10,kb:3,stun:12,c:'#7cff7a',a:p.aim+i*TAU/4,spin:.045,nodash:1});sfx('se_lazer00',.6)},
 dashF(p){p.vx*=1.7;p.vy*=1.7;p.t=Math.round(p.t*1.5);p.mBS=frame+p.t;sfx('voosh',.5)},
 inp(p,o,I){const h=!!I.b.heavy,e=h&&!p.mHp;p.mHp=h;
  if(e&&p.state==='dash'&&!(p.mLz>frame)){const v=Math.hypot(p.vx,p.vy)||1,ux=p.vx/v,uy=p.vy/v;chRay(p,{T:28,tele:0,w:13,len:360,dmg:2,ev:7,kb:5,stun:16,c:'#ffe060',a:Math.atan2(-uy,-ux),clr:1});p.vx+=ux*7;p.vy+=uy*7;p.t+=10;p.mBS=frame+p.t;p.mLz=frame+90;sfx('mastersparkrelease',.7);shake=Math.min(28,shake+5);return{...I,b:{...I.b,heavy:false}}}
  if(h&&p.mLz>frame&&p.state==='idle'&&rel(I,p)!=='B'){if(e)cdT(p,'LASER',p.mLz);return{...I,b:{...I.b,heavy:false}}}
  return I},
 tick(p){if(p.focus&&p.state!=='spell'){p.mH=Math.min(130,(p.mH||0)+.8);if(p.mH>=100){p.hp=Math.max(1,p.hp-.06);if(frame%6===0&&FX.length<480)FX.push({x:p.x,y:p.y-10,vx:0,vy:-1.2,t:24,c:'#777'})}}else p.mH=Math.max(0,(p.mH||0)-.4);
  if(p.mBS){if(p.state==='dash'&&frame<p.mBS){if(frame%2===0)ENT.push({k:'mtr',o:p.id,t:40,x:p.x,y:p.y})}else if(frame<p.mBS+25){p.vx*=.8;p.vy*=.8}else p.mBS=0}},
 cpu(p,o,I,d){if((p.mH||0)<70&&d>420&&p.state==='idle')I.b.focus=true;if((p.chCD||0)<=frame&&d>150&&d<400&&rng()<.03)I.b.next=true;else if((p.chC2||0)<=frame&&d<170)I.b.prev=true},
 draw(q,R){EMB.marisa(q,R);if(q.mH>1){const k=Math.min(1,q.mH/100);ctx.strokeStyle=q.mH>=100?((frame>>2)%2?'#ff3030':'#fff'):k>.6?'#ff9a2a':'#ffe14a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,Math.PI*.75,Math.PI*.75+Math.PI*1.5*k);ctx.stroke()}
  mvFx(q,R,{jab:['arc','rgba(255,225,80,.45)',W_.broom],lunge:['thrust','#ffe14a',(x,y,a,l)=>{for(let i=0;i<5;i++)stF(x-Math.cos(a)*i*12,y-Math.sin(a)*i*12,5-i*.6)}],strong:['ring','#c070ff',W_.potion],dashatk:['thrust','#4ab3ff',W_.broom]})}});});
