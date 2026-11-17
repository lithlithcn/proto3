'use strict';
// ---- outils communs des persos (rayons, entités, effets de mêlée)
const foeQ=(p,q)=>q!==p&&q.state!=='dead'&&q.inv<=0&&foeOf(p.id,q);
const chHitQ=(p,q,dx,dy,dmg,kb,stun)=>{if(parryOn(q)){parryFx(q);return 0}hit(q,p,dx,dy,{dmg,kb,stun},1,true);return 1};
const myE=(p,k)=>ENT.filter(e=>e.k===k&&e.o===p.id&&e.t>0);
const capE=(p,k,n)=>{const L=myE(p,k);for(let i=0;i<L.length-n;i++)L[i].t=0};
const cdT=(p,n,f)=>txt(p.x,p.y-40,n+' '+Math.ceil((f-frame)/60)+'s','#888',13);
const cd2=(p,n)=>{if((p.chC2||0)>frame)return false;p.chC2=frame+n;return true};
const lbAt=(p,a,sp,d,r,life,x,y)=>{const b=lb(p,a,sp,d,r,life);if(b){b.x=x+Math.cos(a)*10;b.y=y+Math.sin(a)*10}return b};
const EST={},EDR={};
const stF=(x,y,r,c)=>{starPath(x,y,r,frame*.1);ctx.fillStyle=c||'#ffe14a';ctx.fill()};
// rayon soutenu : télégraphe puis touches répétées (ev = délai entre deux touches sur la même cible)
const LZ_TELE=60,LZ_GAP=60; // lasers droits Marisa/Okina : 1 s d'avertissement (tirets) puis 1 s de pause après le rayon
function chRay(p,o){if(p.__ech)o=Object.assign({},o,{follow:0});ENT.push(Object.assign({k:'cray',o:p.id,t:o.T,T:o.T,a:p.aim,w:10,len:900,tele:20,dmg:2,ev:6,kb:4,stun:14,c:'#fff',spin:0,follow:1,x:p.x,y:p.y,hc:{}},o))}
function chStep(){
 for(const e of ENT){if(e.t<=0)continue;const o=P[e.o];if(!o)continue;
  if(e.k==='cray'){if(e.follow){e.x=o.x;e.y=o.y}e.a+=e.spin;if(e.push&&!(e.warn&&e.T-e.t<e.tele)){o.vx-=Math.cos(e.a)*e.push;o.vy-=Math.sin(e.a)*e.push}
   if(e.T-e.t<e.tele)continue;const x2=e.x+Math.cos(e.a)*e.len,y2=e.y+Math.sin(e.a)*e.len;
   if(e.clr)for(const b of B)if(!b.dead&&!b.heavy&&b.owner!==e.o&&segD(b.x,b.y,e.x,e.y,x2,y2)<e.w+b.r)b.dead=1;
   for(const q of P)if(foeQ(o,q)&&!(e.nodash&&q.state==='dash')&&!((e.hc[q.id]||0)>frame)&&segD(q.x,q.y,e.x,e.y,x2,y2)<bodyR(q)+e.w){e.hc[q.id]=frame+e.ev;chHitQ(o,q,Math.cos(e.a),Math.sin(e.a),e.dmg,e.kb,e.stun)}}
  else if(EST[e.k])EST[e.k](e,o)}
 for(const b of B){if(b.dead)continue;
  if(b.mst!==undefined){const g=frame-b.mst,s=Math.hypot(b.vx,b.vy);if(g<14&&s>1.6){b.vx*=.9;b.vy*=.9}else if(g>24&&s<10){b.vx*=1.07;b.vy*=1.07}}
  if(b.acc){const s=Math.hypot(b.vx,b.vy);if(s<b.acc){b.vx*=1.05;b.vy*=1.05}}
  if(b.ct&&frame===b.ct){const a=Math.atan2(b.ty-b.y,b.tx-b.x);b.vx=Math.cos(a)*7;b.vy=Math.sin(a)*7}
  if(b.hgr)for(const q of P)if(q.id!==b.owner&&q.state!=='dead'&&foeOf(b.owner,q)){const dx=b.x-q.x,dy=b.y-q.y,d=Math.hypot(dx,dy);if(d<80&&d>1){q.vx+=dx/d*.22;q.vy+=dy/d*.22}}}}
DEFER(()=>{EDR.cray=e=>{const age=e.T-e.t,x2=e.x+Math.cos(e.a)*e.len,y2=e.y+Math.sin(e.a)*e.len;ctx.save();ctx.lineCap='round';
 if(age<e.tele){if(e.warn){const pr=age/e.tele; // avertissement long : tirets, clignote de plus en plus vite, blancs juste avant le tir
  ctx.lineCap='butt';ctx.globalAlpha=.4+.35*(.5+.5*Math.sin(frame*(.3+pr*1.2)));ctx.strokeStyle=e.tele-age<10?'#fff':e.c;ctx.lineWidth=Math.max(3,e.w);ctx.setLineDash([16,12]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();return}
  ctx.globalAlpha=.35+.3*Math.sin(frame*.8);ctx.strokeStyle=e.c;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();return}
 const k=Math.min(1,e.t/6),fl=1+.12*Math.sin(frame*1.3);ctx.globalCompositeOperation='lighter';
 for(const[w,al,c]of[[e.w*2.6,.18,e.c],[e.w*1.7,.45,e.c],[e.w*.8,.9,'#fff']]){ctx.globalAlpha=al*k;ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,w*fl);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(x2,y2);ctx.stroke()}ctx.restore()};});
// effets de mêlée : forme (arc / thrust / ring), couleur, arme dessinée
function mvFx(q,R,S){if(q.state!=='atk'||!q.mv)return;const n=q.mvName,s=S[n];if(!s)return;const m=q.mv,t=q.t,A=m.start+m.act,a=q.atkA,on=t>=m.start&&t<A,L=R+m.range*.8;ctx.save();
 if(q.charging){const f=Math.min(1,(q.charge||0)/(m.charge||40));ctx.globalAlpha=.4+.5*f;ctx.strokeStyle=f>=1?'#fff':s[1];ctx.lineWidth=2+f*3;ctx.beginPath();ctx.arc(q.x,q.y,R*2.3-f*R*.7,frame*.3,frame*.3+TAU*(.25+.75*f));ctx.stroke();ctx.restore();return}
 if(t>A+7){ctx.restore();return}const pr=Math.min(1,Math.max(0,(t-m.start)/m.act));ctx.globalAlpha=on?.85:Math.max(0,.85*(1-(t-A)/7));
 if(s[0]==='arc'){const h=Math.min(m.arc,TAU)/2,a0=a-h,cur=a0+2*h*(t<m.start?0:pr);if(t>=m.start){ctx.fillStyle=s[1];ctx.beginPath();ctx.arc(q.x,q.y,L,a0,cur);ctx.arc(q.x,q.y,R*.8,cur,a0,true);ctx.fill()}ctx.globalAlpha=1;s[2]&&s[2](q.x,q.y,cur,L)}
 else if(s[0]==='thrust'){const l=R+m.range*(t<m.start?.35:1),c=Math.cos(a),sn=Math.sin(a);ctx.lineCap='round';ctx.strokeStyle=s[1];ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+c*l,q.y+sn*l);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1;s[2]&&s[2](q.x,q.y,a,l)}
 else{const r=R+m.range*(t<m.start?.2:pr);ctx.strokeStyle=s[1];ctx.lineWidth=7;ctx.beginPath();ctx.arc(q.x,q.y,r,0,TAU);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,r*.78,0,TAU);ctx.stroke();s[2]&&s[2](q.x,q.y,a,r)}
 ctx.restore()}
const ln=(x,y,x2,y2,c,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()};
const W_={
 broom:(x,y,a,L)=>{const c=Math.cos(a),s=Math.sin(a);ln(x,y,x+c*L,y+s*L,'#8a5a2a',3);for(let i=-3;i<=3;i++)ln(x+c*L,y+s*L,x+c*(L+16)-s*i*3,y+s*(L+16)+c*i*3,'#d8b060',2)},
 claws:(x,y,a,L)=>{for(let i=-1;i<=1;i++){const b=a+i*.18;ln(x+Math.cos(b)*L*.6,y+Math.sin(b)*L*.6,x+Math.cos(b)*L,y+Math.sin(b)*L,'#ffd0d0',3)}},
 laev:(x,y,a,L)=>{const c=Math.cos(a),sn=Math.sin(a),pt=i=>{const d=L*i/12,o=Math.sin(i*1.4+frame*.5)*3.5;return[x+c*d-sn*o,y+sn*d+c*o]};ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.globalCompositeOperation='lighter';for(const[w,al,col]of[[16,.22,'#ff3a00'],[9,.5,'#ff7a10'],[4.5,.9,'#ffd060'],[1.6,1,'#fff']]){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();for(let i=0;i<=12;i++){const[px,py]=pt(i);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke()}
  for(let i=2;i<=12;i+=2){const[px,py]=pt(i),f=(Math.sin(frame*.9+i*3.1)+1)/2,h=6+f*9;ctx.globalAlpha=.75;ctx.fillStyle=i%4?'#ff9a20':'#ff4a10';ctx.beginPath();ctx.moveTo(px+sn*4,py-c*4);ctx.lineTo(px-sn*4,py+c*4);ctx.lineTo(px+c*h*.4-sn*h*(i%4?1:-1)*.6,py+sn*h*.4+c*h*(i%4?1:-1)*.6);ctx.fill()}
  const[tx,ty]=pt(12);ctx.fillStyle='#fff';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(tx,ty,4,0,TAU);ctx.fill();ctx.restore()},
 laevP:(x,y,a,L)=>{const c=Math.cos(a),sn=Math.sin(a);ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const d=L*(.2+i*.1),f=Math.sin(frame*.8+i*1.7);ctx.globalAlpha=.5-i*.03;ctx.fillStyle=i%2?'#ff9a20':'#ff3a10';ctx.beginPath();ctx.arc(x+c*d-sn*f*6,y+sn*d+c*f*6,10+i*1.4+f*3,0,TAU);ctx.fill()}ctx.restore();W_.laev(x,y,a,L*.7)},
 flail:(x,y,a,L)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;ctx.setLineDash([3,3]);ln(x,y,ex,ey,'#ccc',2);ctx.setLineDash([]);ctx.fillStyle='#4ab3ff';ctx.beginPath();ctx.arc(ex,ey,9,0,TAU);ctx.fill();ctx.fillStyle='#5cc04a';ctx.beginPath();ctx.arc(ex-3,ey-2,4,0,TAU);ctx.fill()},
 trident:(x,y,a,L)=>{const c=Math.cos(a),s=Math.sin(a),ex=x+c*L,ey=y+s*L;ln(x,y,ex,ey,'#8a2ad0',3);for(const o of[-7,0,7])ln(ex-s*o,ey+c*o,ex+c*12-s*o,ey+s*12+c*o,'#e0c0ff',2.5);ln(ex-s*7,ey+c*7,ex+s*7,ey-c*7,'#e0c0ff',2.5)},
 rods:(x,y,a,L)=>{for(const o of[-.25,.25]){const b=a+o,ex=x+Math.cos(b)*L,ey=y+Math.sin(b)*L;ln(x,y,ex,ey,'#d8d8e8',2.5);ln(ex,ey,ex+Math.cos(b+1.57)*8,ey+Math.sin(b+1.57)*8,'#d8d8e8',2.5)}},
 fan:(x,y,a,L)=>{ctx.fillStyle='#3a8a3a';ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,L*.55,a-.5,a+.5);ctx.closePath();ctx.fill();ctx.strokeStyle='#9aff8a';ctx.lineWidth=1.5;ctx.stroke()},
 drum:(x,y,a,L)=>{for(let i=1;i<=3;i++){ctx.globalAlpha=.6/i;ctx.strokeStyle='#ffd23a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,L*(.5+i*.18),a-.6,a+.6);ctx.stroke()}ctx.globalAlpha=1},
 potion:(x,y,a,L)=>{for(let i=0;i<10;i++){const b=i*TAU/10+frame*.2;ctx.fillStyle=i%2?'#7cff7a':'#c070ff';ctx.beginPath();ctx.arc(x+Math.cos(b)*L*.8,y+Math.sin(b)*L*.8,5,0,TAU);ctx.fill()}}};

const SEAC=['#ffb0d6','#ff7a3a','#ffb04a','#bfe8ff'];
const CHR7=[]; // the kits: one file per character (characters/<name>.js), pushed in this order
const FLC=['#ff4a4a','#ffa33a','#ffe83a','#5cff7a','#4ab3ff','#7a5cff','#ff5cf0'],HEC=['#4ab3ff','#ffe88a','#ff4a6a'];
function mHm(p){const h=1+Math.min(1.3,(p.mH||0)/100);p.mH=0;return h}
function hShot(p,a,pm,bd,x,y){if(bd===0)for(const o of[-.12,.12]){const b=lbAt(p,a+o,4.5,pm*.8,8,150,x,y);if(b){b.hgr=1;b.c=HEC[0]}}
 else if(bd===1)for(let i=0;i<3;i++){const b=lbAt(p,a+(i-1)*.06,4,pm*.45,3,110,x,y);if(b){b.acc=14;b.c=HEC[1]}}
 else for(let i=0;i<2;i++){const b=lbAt(p,a+(i-.5)*.2,6.5,pm*.7,6,120,x,y);if(b){b.wav=.1;b.ph=i*3;b.c=HEC[2]}}}
