'use strict';
function drawYTrain(e){const x=e.x,y=e.y,w=600,h=w*204/640;ctx.save();
 xDrawGap(e.x0+500,y,80,120,Math.PI/2);xDrawGap(e.x1-500,y,80,120,Math.PI/2);
 if(TRIMG.complete&&TRIMG.width){for(let i=4;i>=1;i--){ctx.globalAlpha=.16*(1-i/5);ctx.drawImage(TRIMG,x-w+14-i*70,y-h/2,w,h)}ctx.globalAlpha=1;ctx.drawImage(TRIMG,x-w+14,y-h/2,w,h)}
 else{ctx.fillStyle='#bbb';ctx.fillRect(x-w+14,y-h/2,w,h)}
 ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;for(let i=0;i<10;i++){const yy=y-h/2+hz(i,frame>>1)*h,L=80+hz(i,3)*160;ctx.beginPath();ctx.moveTo(x-w-20-hz(i,4)*200,yy);ctx.lineTo(x-w-20-hz(i,4)*200-L,yy);ctx.stroke()}
 ctx.fillStyle='#ffd080';for(let i=0;i<8;i++){const sx=x-w+60+hz(i,frame)*(w-80);ctx.globalAlpha=.8;ctx.fillRect(sx,y+h/2-8-hz(i,frame+1)*10,3,3)}ctx.globalAlpha=1;ctx.restore()}
// --- Time Stop : rendu de l'attente, couteaux, arbre/bâton/éclairage dramatique
DEFER(()=>{{const R0=drawWorldItems;drawWorldItems=(...a)=>{R0(...a);ctx.save();const Z=CX.zaw;
 if(Z){const p=P[Z.o];if(p){const u=1-Z.t/180;ctx.strokeStyle='#00d0a0';ctx.lineWidth=3;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,p.y,60+u*40,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const aa=i*TAU/12;ctx.beginPath();ctx.moveTo(p.x+Math.cos(aa)*(56+u*40),p.y+Math.sin(aa)*(56+u*40));ctx.lineTo(p.x+Math.cos(aa)*(66+u*40),p.y+Math.sin(aa)*(66+u*40));ctx.stroke()}
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(u*TAU*3-Math.PI/2)*(48+u*30),p.y+Math.sin(u*TAU*3-Math.PI/2)*(48+u*30));ctx.stroke();ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(u*TAU*.25-Math.PI/2)*34,p.y+Math.sin(u*TAU*.25-Math.PI/2)*34);ctx.stroke();
  ctx.globalAlpha=.08+.25*u;ctx.fillStyle='#00d0a0';ctx.beginPath();ctx.arc(p.x,p.y,120+u*900,0,TAU);ctx.fill()}}
 for(const e of ENT)if(e.k==='stx'){const o=P[e.o];if(!o)continue;const c=Math.cos(e.a),s=Math.sin(e.a);ctx.lineCap='round';ctx.strokeStyle='#7a3a10';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+c*e.len,o.y+s*e.len);ctx.stroke();ctx.strokeStyle='#e8b040';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+c*e.len,o.y+s*e.len);ctx.stroke();
  for(const d of[0,e.len]){ctx.fillStyle='#ffd040';ctx.beginPath();ctx.arc(o.x+c*d,o.y+s*d,9,0,TAU);ctx.fill()}ctx.lineCap='butt'}
 ctx.restore()}}});
DEFER(()=>{{const H0=drawHeavy;drawHeavy=b=>{if(!b.knife)return H0(b);const a=Math.atan2(b.vy,b.vx);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillStyle='#e8f4ff';ctx.strokeStyle=COLS[b.owner]||'#9ab';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-2,-4);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#556';ctx.fillRect(-12,-2.5,10,5);ctx.fillStyle='#ffd040';ctx.fillRect(-3,-6,2,12);ctx.restore()}}});
DEFER(()=>{{const R0=render;render=()=>{R0();if(CX.sgS>0&&mode==='game'){const c=OC||CTX0,u=CX.sgS/150;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='lighter';const g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,150,220,'+(.35*u)+')');g.addColorStop(.5,'rgba(170,70,255,'+(.22*u)+')');g.addColorStop(1,'rgba(60,0,90,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.globalAlpha=.25*u;c.fillStyle='#ffc8ec';for(let i=0;i<14;i++){const a=i*TAU/14+frame*.004;c.beginPath();c.moveTo(W/2,H/2);c.arc(W/2,H/2,Math.max(W,H),a,a+.06);c.fill()}c.restore()}}}});
// --- cassure d'écran : progressive, lumineuse, éclats qui tombent
function crack(x,y){const pl=[],sh=[];for(let i=0;i<9;i++){let a=i*TAU/9+(Math.random()-.5)*.5,cx=x,cy=y;const l=[cx,cy];for(let j=0;j<10;j++){a+=(Math.random()-.5)*.7;const d=50+Math.random()*130;cx+=Math.cos(a)*d;cy+=Math.sin(a)*d;l.push(cx,cy)}pl.push(l)}
 for(let i=0;i<22;i++){const a=Math.random()*TAU,d=20+Math.random()*260,r=8+Math.random()*26,p=[];for(let k=0;k<3+(Math.random()*2|0);k++){const b=k*TAU/4+Math.random();p.push(Math.cos(b)*r,Math.sin(b)*r)}sh.push({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,vx:Math.cos(a)*(1+Math.random()*3),vy:Math.sin(a)*2-2-Math.random()*3,rt:(Math.random()-.5)*.3,p})}
 CRACK.push({p:pl,s:sh,x,y,t:75,T:75})}
function drawCrack(c){const age=c.T-c.t,grow=Math.min(1,age/9),fade=Math.min(1,c.t/30);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 if(age<10){ctx.globalAlpha=(1-age/10)*.8;const g=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,260);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,260,0,TAU);ctx.fill()}
 for(const [col,lw,al] of[['rgba(160,220,255,1)',9,.25],['#fff',3,1]]){ctx.strokeStyle=col;ctx.lineWidth=lw*(.6+.4*fade);ctx.globalAlpha=al*fade;ctx.beginPath();for(const l of c.p){const n=(l.length/2-1)*grow;ctx.moveTo(l[0],l[1]);let i=1;for(;i<=Math.floor(n);i++)ctx.lineTo(l[i*2],l[i*2+1]);const f=n-Math.floor(n);if(f>0&&i*2+1<l.length)ctx.lineTo(l[i*2-2]+(l[i*2]-l[i*2-2])*f,l[i*2-1]+(l[i*2+1]-l[i*2-1])*f)}ctx.stroke()}
 for(const s of c.s){const t=age,x=s.x+s.vx*t,y=s.y+s.vy*t+.25*t*t;ctx.globalAlpha=Math.max(0,1-t/60)*.9;ctx.save();ctx.translate(x,y);ctx.rotate(s.rt*t);ctx.fillStyle='rgba(220,240,255,.35)';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<s.p.length;k+=2)k?ctx.lineTo(s.p[k],s.p[k+1]):ctx.moveTo(s.p[k],s.p[k+1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
 ctx.restore()}

