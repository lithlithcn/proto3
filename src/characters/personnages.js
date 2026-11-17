'use strict';
// ===== PERSONNAGES (vague 1) : chaque perso a son kit complet (tir, gros tir, mêlée, spell, mécanique unique sur Next/Prev, stats). Index = p.shotT (4+)
let CH0;DEFER(()=>{CH0=SHOTS.length});
const chOf=p=>p&&p.shotT>=CH0?CHR[p.shotT-CH0]:null;
const chB=(p,a,sp,d,r,life,o)=>{const b=lb(p,a,sp,d,r,life);if(b&&o)Object.assign(b,o);return b};
// rayon instantané avec avertissement (lisible, imparable seulement en le parant)
function chBeam(p,a,len,w,dmg,c,tele,kb){const x=p.x,y=p.y,x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len,o=p.id;
 const fire=()=>{const P0=P[o];if(!P0||P0.state==='dead')return;ENT.push({k:'lbeam',o,t:12,x,y,x2,y2});sfx('se_lazer00',.5);
  for(const q of P)if(q!==P0&&q.state!=='dead'&&foeOf(o,q)&&q.inv<=0&&segD(q.x,q.y,x,y,x2,y2)<bodyR(q)+w){if(parryOn(q)){parryFx(q);continue}const st=P0.state;if(st==='atk')P0.state='idle';hit(q,P0,Math.cos(a),Math.sin(a),{dmg,kb:kb||8,stun:28},1,true);if(P0.state==='idle')P0.state=st}}; // le rayon n'est pas un coup de mêlée : pas de bonus de parades
 if(tele>0){sfx('aimreal',1.6);ENT.push({k:'wbeam',o,t:tele,x,y,x2,y2,c,fire})}else fire()}
const chCool=(p,n)=>{if((p.chCD||0)>frame)return false;p.chCD=frame+n;return true};
const chFoe=p=>nearFoe(p.id,p.x,p.y);

const EMB={rbar:(q,R)=>{const t=frame*.05,lv=Math.max(1,Math.min(4,q.power|0));ctx.fillStyle='#ff3a4a';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-R*.9);ctx.lineTo(q.x+s*R*1.15,q.y-R*1.55);ctx.lineTo(q.x+s*R*1.05,q.y-R*.75);ctx.fill()}
  if(q.state!=='spell')for(let i=0;i<lv;i++){const[x,y]=rOpt(q,i,lv,q.focus);rYY(x,y,5.5,t*4+i,.95)}
  rMel(q,R);
  if(q.rC>0){const n=q.rC<25?1:q.rC<55?2:4,f=Math.min(1,q.rC/55);ctx.strokeStyle=n>2?'#fff':'#ff9aa8';ctx.lineWidth=2;ctx.globalAlpha=.5+.3*Math.sin(frame*.5);ctx.beginPath();ctx.arc(q.x,q.y,R*2.6-f*R,0,TAU);ctx.stroke();ctx.globalAlpha=1;
   for(let i=0;i<n;i++){const a=t*3+i*TAU/n;rYY(q.x+Math.cos(a)*R*1.8,q.y+Math.sin(a)*R*1.8,5,a,1)}}
  if(q.rG){const os=ENT.filter(e=>e.k==='ryy'&&e.o===q.id&&e.t>0);if(os.length){let cx=0,cy=0;for(const e of os){cx+=e.x;cy+=e.y}cx/=os.length;cy/=os.length;const a=q.rA,L=34,c=Math.cos(a),s=Math.sin(a),x2=cx+c*(L+18),y2=cy+s*(L+18);
   ctx.lineCap='round';for(const[w,col]of[[7,'#7a0010'],[3.5,'#fff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+c*18,cy+s*18);ctx.lineTo(x2,y2);ctx.moveTo(x2-c*11-s*8,y2-s*11+c*8);ctx.lineTo(x2,y2);ctx.lineTo(x2-c*11+s*8,y2-s*11-c*8);ctx.stroke()}ctx.lineCap='butt';
   const k=1-(frame-q.rGT)/240;ctx.strokeStyle=k<.25&&(frame>>2)%2?'#ff4060':'#fff';ctx.lineWidth=3;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,k));ctx.stroke();ctx.globalAlpha=1}}},
rbnd:(q,R)=>{const t=frame*.05,lv=Math.max(1,Math.min(4,q.power|0));ctx.fillStyle='#ff3a4a';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-R*.9);ctx.lineTo(q.x+s*R*1.15,q.y-R*1.55);ctx.lineTo(q.x+s*R*1.05,q.y-R*.75);ctx.fill()}
  if(q.state!=='spell')for(let i=0;i<lv;i++){const[x,y]=rOpt(q,i,lv,q.focus);rYY(x,y,5.5,t*4+i,.95)}
  rMel(q,R);
  if(q.rC>0){const n=q.rC<25?1:q.rC<55?2:4,f=Math.min(1,q.rC/55);ctx.strokeStyle=n>2?'#fff':'#ff9aa8';ctx.lineWidth=2;ctx.globalAlpha=.5+.3*Math.sin(frame*.5);ctx.beginPath();ctx.arc(q.x,q.y,R*2.6-f*R,0,TAU);ctx.stroke();ctx.globalAlpha=1;
   for(let i=0;i<n;i++){const a=t*3+i*TAU/n;rYY(q.x+Math.cos(a)*R*1.8,q.y+Math.sin(a)*R*1.8,5,a,1)}}
  if(q.rG){const os=ENT.filter(e=>e.k==='ryy'&&e.o===q.id&&e.t>0);if(os.length){let cx=0,cy=0;for(const e of os){cx+=e.x;cy+=e.y}cx/=os.length;cy/=os.length;const a=q.rA,L=34,c=Math.cos(a),s=Math.sin(a),x2=cx+c*(L+18),y2=cy+s*(L+18);
   ctx.lineCap='round';for(const[w,col]of[[7,'#7a0010'],[3.5,'#fff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+c*18,cy+s*18);ctx.lineTo(x2,y2);ctx.moveTo(x2-c*11-s*8,y2-s*11+c*8);ctx.lineTo(x2,y2);ctx.lineTo(x2-c*11+s*8,y2-s*11-c*8);ctx.stroke()}ctx.lineCap='butt';
   const k=1-(frame-q.rGT)/240;ctx.strokeStyle=k<.25&&(frame>>2)%2?'#ff4060':'#fff';ctx.lineWidth=3;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,k));ctx.stroke();ctx.globalAlpha=1}}},
marisa:(q,R)=>{ctx.fillStyle='#1a1a24';ctx.strokeStyle='#ffd23a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x-R*1.3,q.y-R*.7);ctx.lineTo(q.x+R*1.3,q.y-R*.7);ctx.lineTo(q.x+R*.2,q.y-R*2.3);ctx.closePath();ctx.fill();ctx.stroke();
  const a=frame*.08;starPath(q.x+Math.cos(a)*R*1.8,q.y+Math.sin(a)*R*1.8,5,a);ctx.fillStyle='#ffe37a';ctx.fill();
  if(q.chT>frame){const u=1-(q.chT-frame)/50;ctx.globalAlpha=.3+u*.6;ctx.fillStyle='#fff59a';ctx.beginPath();ctx.arc(q.x+Math.cos(q.aim)*24,q.y+Math.sin(q.aim)*24,4+u*18,0,TAU);ctx.fill();ctx.globalAlpha=.15+u*.3;ctx.strokeStyle='#fff59a';ctx.lineWidth=2+u*10;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+Math.cos(q.chA)*1000,q.y+Math.sin(q.chA)*1000);ctx.stroke();ctx.globalAlpha=1}},
flandre:(q,R)=>{const cs=['#ff4a4a','#ffa33a','#ffe83a','#5cff7a','#4ab3ff','#7a5cff','#ff5cf0'];for(const s of[-1,1]){ctx.strokeStyle='#3a1a24';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+s*R*.6,q.y-R*.3);ctx.quadraticCurveTo(q.x+s*R*1.6,q.y-R*1.6,q.x+s*R*2.4,q.y-R*.6);ctx.stroke();
  for(let i=0;i<4;i++){const u=(i+1)/4.5,x=q.x+s*R*(.8+u*1.6),y=q.y-R*(.5+Math.sin(u*Math.PI)*.9)+R*.45,on=i<(q.chC|0);ctx.fillStyle=on?cs[(i*2+(s>0?1:0))%7]:'#333';ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+3,y+2);ctx.lineTo(x,y+8);ctx.lineTo(x-3,y+2);ctx.fill()}}
  if(!q.chM){const a=q.aim+Math.sin(frame*.15)*.3;ctx.strokeStyle='#ff9a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(q.x+Math.cos(a)*R,q.y+Math.sin(a)*R);ctx.lineTo(q.x+Math.cos(a)*R*2.3,q.y+Math.sin(a)*R*2.3);ctx.stroke()}else{ctx.strokeStyle='rgba(255,154,154,.5)';ctx.lineWidth=1.5;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(q.x,q.y,R*1.5,i*Math.PI/2+frame*.02,i*Math.PI/2+frame*.02+.9);ctx.stroke()}}},
hecatia:(q,R)=>{const C=['#4ab3ff','#ffe88a','#ff4a6a'];for(let i=0;i<3;i++){const a=frame*.03+i*TAU/3,on=i===(q.chM|0),r=on?7:4.5,x=q.x+Math.cos(a)*R*(on?1.6:1.9),y=q.y+Math.sin(a)*R*(on?1.6:1.9);ctx.fillStyle=C[i];ctx.globalAlpha=on?1:.6;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();if(on){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke()}}ctx.globalAlpha=1},
nue:(q,R)=>{for(const s of[-1,1])for(let i=0;i<3;i++){const a=(s>0?0:Math.PI)+(i-1)*.5+Math.sin(frame*.1+i)*.12,x0=q.x+Math.cos(a)*R,y0=q.y+Math.sin(a)*R;ctx.strokeStyle=s>0?'#4ab3ff':'#ff3a4a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,y0);
   if(s>0){for(let j=1;j<=4;j++)ctx.lineTo(x0+Math.cos(a)*j*5+Math.cos(a+1.57)*((j%2)*2-1)*4,y0+Math.sin(a)*j*5+Math.sin(a+1.57)*((j%2)*2-1)*4)}else{ctx.lineTo(x0+Math.cos(a)*18,y0+Math.sin(a)*18);ctx.lineTo(x0+Math.cos(a+.3)*13,y0+Math.sin(a+.3)*13)}ctx.stroke()}
  const s=q.chS|0;for(let i=0;i<s;i++){const a=frame*.02+i*TAU/5;ctx.fillStyle='rgba(40,20,70,.75)';ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*2.2,q.y+Math.sin(a)*R*1.6,7,0,TAU);ctx.fill()}},
nufo:(q,R)=>{for(const s of[-1,1])for(let i=0;i<3;i++){const a=(s>0?0:Math.PI)+(i-1)*.5+Math.sin(frame*.1+i)*.12,x0=q.x+Math.cos(a)*R,y0=q.y+Math.sin(a)*R;ctx.strokeStyle=s>0?'#4ab3ff':'#ff3a4a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,y0);
   if(s>0){for(let j=1;j<=4;j++)ctx.lineTo(x0+Math.cos(a)*j*5+Math.cos(a+1.57)*((j%2)*2-1)*4,y0+Math.sin(a)*j*5+Math.sin(a+1.57)*((j%2)*2-1)*4)}else{ctx.lineTo(x0+Math.cos(a)*18,y0+Math.sin(a)*18);ctx.lineTo(x0+Math.cos(a+.3)*13,y0+Math.sin(a+.3)*13)}ctx.stroke()}
  const s=q.chS|0;for(let i=0;i<s;i++){const a=frame*.02+i*TAU/5;ctx.fillStyle='rgba(40,20,70,.75)';ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*2.2,q.y+Math.sin(a)*R*1.6,7,0,TAU);ctx.fill()}},
okina:(q,R)=>{const s=q.chM|0,C=['#ffb0d6','#ff7a3a','#ffb04a','#bfe8ff'][s];ctx.fillStyle='#2a2a10';ctx.beginPath();ctx.ellipse(q.x,q.y-R*1.05,R*1.25,R*.35,0,0,TAU);ctx.fill();ctx.fillStyle='#ffd23a';ctx.fillRect(q.x-R*.5,q.y-R*1.7,R,R*.65);
  ctx.strokeStyle=C;ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R*1.6,-Math.PI/2,-Math.PI/2+TAU*(q.chG|0)/100);ctx.stroke();ctx.globalAlpha=.35;ctx.lineWidth=1;ctx.beginPath();ctx.arc(q.x,q.y,R*1.6,0,TAU);ctx.stroke();ctx.globalAlpha=1},
nazrin:(q,R)=>{ctx.fillStyle='#8a8a9a';for(const s of[-1,1]){ctx.beginPath();ctx.arc(q.x+s*R*.85,q.y-R*.95,R*.5,0,TAU);ctx.fill()}ctx.fillStyle='#ffb0c0';for(const s of[-1,1]){ctx.beginPath();ctx.arc(q.x+s*R*.85,q.y-R*.95,R*.25,0,TAU);ctx.fill()}
  const sw=Math.sin(frame*.12)*.8,px=q.x+Math.sin(sw)*R*1.9,py=q.y+Math.cos(sw)*R*1.9;ctx.strokeStyle='#ccc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle='#ff4a6a';ctx.beginPath();ctx.moveTo(px,py-5);ctx.lineTo(px+4,py+3);ctx.lineTo(px-4,py+3);ctx.fill();
  if(q.chT>frame){const a=frame*.25;ctx.fillStyle='#ff4a6a';for(let i=0;i<2;i++){const x=q.x+Math.cos(a+i*Math.PI)*48,y=q.y+Math.sin(a+i*Math.PI)*48;ctx.beginPath();ctx.moveTo(x,y-11);ctx.lineTo(x+8,y+6);ctx.lineTo(x-8,y+6);ctx.fill()}}},
aya:(q,R)=>{ctx.fillStyle='#e04a4a';ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;ctx.lineTo(q.x+Math.cos(a)*R*.42,q.y-R*1.15+Math.sin(a)*R*.42)}ctx.fill();
  const a=q.aim+1.9;ctx.fillStyle='#2a8a4a';ctx.beginPath();ctx.moveTo(q.x+Math.cos(a)*R,q.y+Math.sin(a)*R);for(let i=-2;i<=2;i++)ctx.lineTo(q.x+Math.cos(a+i*.18)*R*2.1,q.y+Math.sin(a+i*.18)*R*2.1);ctx.fill();
  const g=(q.chG|0)/100;ctx.strokeStyle='#d0f0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R*1.55,Math.PI*.75,Math.PI*.75+Math.PI*1.5*g);ctx.stroke();
  if(q.chF&&q.chF>frame){ctx.globalAlpha=.25;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.arc(q.x,q.y,520,q.chA2-.55,q.chA2+.55);ctx.fill();ctx.globalAlpha=1}}};
