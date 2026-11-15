// @ts-nocheck — legacy presentation code, copied verbatim (parity-checked by `pnpm render compare`). Not sim code.
import { COLS, LCOLS } from '../colors';
const TAU = 6.2832, T = { VIEW_H: 600 };
let ctx, frame, P, B, ENT, CX, chOf, foeOf, bodyR, coreR;
export const bindChars = (v) => { ({ ctx, frame, P, B, ENT, CX, chOf, foeOf, bodyR, coreR } = v); };
function starPath(x,y,r,a){ctx.beginPath();for(let k=0;k<10;k++){const rr=k%2?r*.42:r,aa=a+k*Math.PI/5;ctx.lineTo(x+Math.cos(aa)*rr,y+Math.sin(aa)*rr)}ctx.closePath()}
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
const FLC=['#ff4a4a','#ffa33a','#ffe83a','#5cff7a','#4ab3ff','#7a5cff','#ff5cf0'],HEC=['#4ab3ff','#ffe88a','#ff4a6a'];
function rOpt(p,i,n,f){const L=[[[0,30,0,20]],[[-30,8,-16,20],[30,8,16,20]],[[-30,8,-16,20],[30,8,16,20],[0,32,0,30]],[[-30,8,-16,20],[30,8,16,20],[-16,32,-8,30],[16,32,8,30]]][n-1][i],lx=f?L[2]:L[0],ly=f?L[3]:L[1],c=Math.cos(p.aim),s=Math.sin(p.aim);return[p.x-s*lx-c*ly,p.y+c*lx-s*ly]}
function rYY(x,y,r,a,al){ctx.globalAlpha=al;const c=Math.cos(a)*r/2,s=Math.sin(a)*r/2;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x,y,r,a,a+Math.PI);ctx.fill();
 ctx.beginPath();ctx.arc(x+c,y+s,r/2,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-c,y-s,r/2,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x+c,y+s,r/6,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x-c,y-s,r/6,0,TAU);ctx.fill();
 ctx.strokeStyle='#300';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
function rGohei(x,y,a,L){const c=Math.cos(a),s=Math.sin(a),tx=x+c*L,ty=y+s*L;ctx.strokeStyle='#8a5a2a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();
 ctx.strokeStyle='#fff';ctx.lineWidth=2.5;for(const sg of[-1,1]){ctx.beginPath();ctx.moveTo(tx,ty);for(let i=1;i<=4;i++){const d=i*5,o=(i%2?7:3)*sg;ctx.lineTo(tx-c*d-s*o,ty-s*d+c*o)}ctx.stroke()}}
function rMel(q,R){if(q.state!=='atk'||!q.mv||!/^(jab|lunge|strong|dashatk)$/.test(q.mvName))return;const m=q.mv,t=q.t,a=q.atkA,A=m.start+m.act,on=t>=m.start&&t<A,k=Math.min(1,t/A),n=q.mvName;ctx.save();
 if(n==='jab'||n==='dashatk'){const sw=n==='jab'?1.4:1.1,a0=n==='jab'?a-sw:a-Math.PI*.9,a1=a+sw,cur=a0+(a1-a0)*(t<m.start?.05*t/m.start:Math.min(1,(t-m.start)/m.act)),L=R+m.range*.75;
  if(t>=m.start&&t<A+6){ctx.globalAlpha=on?.75:.75*(1-(t-A)/6);ctx.fillStyle=n==='jab'?'rgba(255,255,255,.55)':'rgba(255,90,110,.55)';ctx.beginPath();ctx.arc(q.x,q.y,L+6,a0,cur);ctx.arc(q.x,q.y,R*.9,cur,a0,true);ctx.fill();ctx.globalAlpha=1}
  rGohei(q.x,q.y,cur,L);if(n==='dashatk'&&on&&t===m.start+1){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x+Math.cos(a)*L,q.y+Math.sin(a)*L,14,0,TAU);ctx.fill()}}
 else if(n==='lunge'){const c=Math.cos(a),s=Math.sin(a);for(let i=1;i<=5;i++){ctx.globalAlpha=.35-i*.05;ctx.fillStyle='#e8d8c0';ctx.beginPath();ctx.arc(q.x-c*i*9+Math.sin(i*7+t)*5,q.y-s*i*9+Math.cos(i*5+t)*5,4+i*1.6,0,TAU);ctx.fill()}
  ctx.globalAlpha=on?1:.5;ctx.strokeStyle='#ff3a4a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+c*(R+m.range*.6),q.y+s*(R+m.range*.6));ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
  if(on){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(q.x-c*20-s*i*7,q.y-s*20+c*i*7);ctx.lineTo(q.x-c*48-s*i*7,q.y-s*48+c*i*7);ctx.stroke()}}}
 else{if(q.charging){const f=Math.min(1,(q.charge||0)/(m.charge||40));ctx.globalAlpha=.4+.4*f;ctx.strokeStyle=f>=1?'#fff':'#ff8a3a';ctx.lineWidth=2+f*3;ctx.beginPath();ctx.arc(q.x,q.y,R*2.4-f*R*.8,frame*.3,frame*.3+TAU*(.3+.7*f));ctx.stroke()}
  else if(t>=m.start&&t<A+8){const p=(t-m.start)/m.act,rr=R+m.range*.8*Math.min(1,p*1.3);ctx.globalAlpha=on?1:1-(t-A)/8;for(let j=0;j<3;j++){ctx.strokeStyle=['#ffd040','#ff7a20','#ff2a2a'][j];ctx.lineWidth=7-j*2;ctx.beginPath();const b=t*.6+j*2.1;ctx.arc(q.x,q.y,rr-j*6,b,b+Math.PI*1.3);ctx.stroke()}
   ctx.fillStyle='rgba(255,140,40,.25)';ctx.beginPath();ctx.arc(q.x,q.y,rr,0,TAU);ctx.fill();rGohei(q.x,q.y,a+t*.7,R+20)}}
 ctx.restore()}
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
// ---- outils communs des persos (rayons, entités, effets de mêlée)
const stF=(x,y,r,c)=>{starPath(x,y,r,frame*.1);ctx.fillStyle=c||'#ffe14a';ctx.fill()};
export const CHDRAW={marisa:function(q,R){EMB.marisa(q,R);if(q.mH>1){const k=Math.min(1,q.mH/100);ctx.strokeStyle=q.mH>=100?((frame>>2)%2?'#ff3030':'#fff'):k>.6?'#ff9a2a':'#ffe14a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,Math.PI*.75,Math.PI*.75+Math.PI*1.5*k);ctx.stroke()}
  mvFx(q,R,{jab:['arc','rgba(255,225,80,.45)',W_.broom],lunge:['thrust','#ffe14a',(x,y,a,l)=>{for(let i=0;i<5;i++)stF(x-Math.cos(a)*i*12,y-Math.sin(a)*i*12,5-i*.6)}],strong:['ring','#c070ff',W_.potion],dashatk:['thrust','#4ab3ff',W_.broom]})},
flandre:function(q,R){if(q.fFr>frame){ctx.globalAlpha=.3+.2*Math.sin(frame*.5);ctx.fillStyle='#ff2020';ctx.beginPath();ctx.arc(q.x,q.y,R*1.8,0,TAU);ctx.fill();ctx.globalAlpha=1}EMB.flandre(q,R);
  if(q.focus){const eye=(x,y,s)=>{ctx.fillStyle='#ff2020';ctx.beginPath();ctx.ellipse(x,y,s,s*.55,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,s*.35,0,TAU);ctx.fill()};
   for(const o of P)if(o!==q&&o.state!=='dead'&&foeOf(q.id,o)&&Math.hypot(o.x-q.x,o.y-q.y)<300)eye(o.x,o.y-bodyR(o)-14,7+Math.sin(frame*.3));for(const b of B)if(!b.dead&&b.heavy&&b.owner!==q.id&&Math.hypot(b.x-q.x,b.y-q.y)<220)eye(b.x,b.y,5)}
  mvFx(q,R,{jab:['arc','rgba(255,120,120,.4)',W_.claws],lunge:['arc','rgba(255,90,20,.5)',W_.laev],strong:['thrust','rgba(255,90,20,.55)',W_.laevP],dashatk:['thrust','#ff3030']})},
hecatia:function(q,R){if(q.hTr>frame){for(let i=0;i<3;i++){const a=frame*.1+i*TAU/3;ctx.globalAlpha=.35;ctx.fillStyle=HEC[i];ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*1.4,q.y+Math.sin(a)*R*1.4,R*.8,0,TAU);ctx.fill()}ctx.globalAlpha=1}EMB.hecatia(q,R);
  mvFx(q,R,{jab:['arc','rgba(150,120,255,.4)',W_.flail],lunge:['thrust','#c070ff',W_.flail],strong:['ring',HEC[q.chM|0],(x,y,a,r)=>{for(let i=0;i<6;i++){const b=i*TAU/6;ctx.fillStyle='#8a7a6a';ctx.fillRect(x+Math.cos(b)*r-4,y+Math.sin(b)*r-4,8,8)}}]})},
nue:function(q,R){const dz=q.nD>frame&&P[q.nDid],oc=dz&&chOf(dz);if(oc&&oc.k!=='nue')oc.draw(q,R);else EMB.nue(q,R);
  if(q.state==='spell'){ctx.save();ctx.fillStyle='rgba(0,0,0,.8)';ctx.beginPath();ctx.rect(q.x-5000,q.y-5000,10000,10000);ctx.arc(q.x,q.y,150,0,TAU,true);ctx.fill('evenodd');ctx.restore()}
  mvFx(q,R,{jab:['thrust','#8a2ad0',W_.trident],lunge:['thrust','#4a4aff',W_.trident],strong:['arc','rgba(140,60,255,.45)',W_.trident],dashatk:['arc','rgba(60,200,90,.5)',(x,y,a,L)=>{ctx.beginPath();for(let i=0;i<=12;i++){const d=L*i/12,o=Math.sin(i*1.2+frame*.4)*6;ctx.lineTo(x+Math.cos(a)*d-Math.sin(a)*o,y+Math.sin(a)*d+Math.cos(a)*o)}ctx.strokeStyle='#3ac05a';ctx.lineWidth=4;ctx.stroke()}]})},
okina:function(q,R){EMB.okina(q,R);mvFx(q,R,{jab:['ring','#ffd23a',W_.drum],lunge:['arc','rgba(255,210,60,.35)',W_.drum],strong:['ring',SEAC[q.chM|0],W_.drum]})},
nazrin:function(q,R){EMB.nazrin(q,R);if(q.nSh){ctx.strokeStyle='#7ae0ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R*1.7,0,TAU);ctx.stroke()}
  if(q.nDig>frame){for(let i=0;i<4;i++){const a=frame*.4+i*1.6;ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*1.3,q.y+R+Math.sin(a)*4,3,0,TAU);ctx.fill()}}
  if(q.focus){const tx=q.x+Math.cos(q.aim)*160,ty=q.y+Math.sin(q.aim)*160,sw=Math.sin(frame*.15)*8;ln(q.x,q.y,tx+sw,ty,'rgba(220,220,240,.4)',1.5);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.moveTo(tx+sw,ty-9);ctx.lineTo(tx+sw+6,ty);ctx.lineTo(tx+sw,ty+11);ctx.lineTo(tx+sw-6,ty);ctx.fill()}
  mvFx(q,R,{jab:['arc','rgba(220,220,240,.4)',W_.rods],lunge:['thrust','#ffd23a',(x,y,a,l)=>{ctx.fillStyle='#9a9aa8';ctx.beginPath();ctx.arc(x+Math.cos(a)*l,y+Math.sin(a)*l,7,0,TAU);ctx.fill()}],strong:['arc','rgba(120,220,255,.45)',(x,y,a,L)=>{ln(x,y,x+Math.cos(a)*L,y+Math.sin(a)*L,'#ccc',2);ctx.fillStyle='#7ae0ff';ctx.beginPath();ctx.arc(x+Math.cos(a)*L,y+Math.sin(a)*L,10,0,TAU);ctx.fill()}]})},
aya:function(q,R){EMB.aya(q,R);if(q.aF){const S=q.aF/2,D=50+S,c=Math.cos(q.aim),s=Math.sin(q.aim);ctx.save();ctx.translate(q.x+c*D,q.y+s*D);ctx.rotate(q.aim);ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.globalAlpha=.85;const w=S,h=S*.75,k=Math.min(w,h)*.35;
   for(const[sx,sy]of[[-1,-1],[1,-1],[1,1],[-1,1]]){ctx.beginPath();ctx.moveTo(sx*w,sy*h-sy*k);ctx.lineTo(sx*w,sy*h);ctx.lineTo(sx*w-sx*k,sy*h);ctx.stroke()}ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(-w,-h,w*2,h*2);ctx.fillStyle='#ff3030';ctx.beginPath();ctx.arc(-w+8,-h+8,3,0,TAU);ctx.fill();ctx.restore()}
  mvFx(q,R,{jab:['arc','rgba(120,230,120,.4)',W_.fan],lunge:['thrust','#bfffe0'],strong:['ring','#e04a4a',(x,y,a,r)=>{for(let i=0;i<8;i++){const b=i*TAU/8+frame*.2;ln(x+Math.cos(b)*r*.5,y+Math.sin(b)*r*.5,x+Math.cos(b)*r,y+Math.sin(b)*r,'#bfffe0',2)}}],dashatk:['thrust','#e04a4a']})},
reimu:function(q,R){const t=frame*.05,lv=Math.max(1,Math.min(4,q.power|0));ctx.fillStyle='#ff3a4a';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-R*.9);ctx.lineTo(q.x+s*R*1.15,q.y-R*1.55);ctx.lineTo(q.x+s*R*1.05,q.y-R*.75);ctx.fill()}
  if(q.state!=='spell')for(let i=0;i<lv;i++){const[x,y]=rOpt(q,i,lv,q.focus);rYY(x,y,5.5,t*4+i,.95)}
  rMel(q,R);
  if(q.rC>0){const n=q.rC<25?1:q.rC<55?2:4,f=Math.min(1,q.rC/55);ctx.strokeStyle=n>2?'#fff':'#ff9aa8';ctx.lineWidth=2;ctx.globalAlpha=.5+.3*Math.sin(frame*.5);ctx.beginPath();ctx.arc(q.x,q.y,R*2.6-f*R,0,TAU);ctx.stroke();ctx.globalAlpha=1;
   for(let i=0;i<n;i++){const a=t*3+i*TAU/n;rYY(q.x+Math.cos(a)*R*1.8,q.y+Math.sin(a)*R*1.8,5,a,1)}}
  if(q.rG){const os=ENT.filter(e=>e.k==='ryy'&&e.o===q.id&&e.t>0);if(os.length){let cx=0,cy=0;for(const e of os){cx+=e.x;cy+=e.y}cx/=os.length;cy/=os.length;const a=q.rA,L=34,c=Math.cos(a),s=Math.sin(a),x2=cx+c*(L+18),y2=cy+s*(L+18);
   ctx.lineCap='round';for(const[w,col]of[[7,'#7a0010'],[3.5,'#fff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+c*18,cy+s*18);ctx.lineTo(x2,y2);ctx.moveTo(x2-c*11-s*8,y2-s*11+c*8);ctx.lineTo(x2,y2);ctx.lineTo(x2-c*11+s*8,y2-s*11-c*8);ctx.stroke()}ctx.lineCap='butt';
   const k=1-(frame-q.rGT)/240;ctx.strokeStyle=k<.25&&(frame>>2)%2?'#ff4060':'#fff';ctx.lineWidth=3;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,k));ctx.stroke();ctx.globalAlpha=1}}},};
export { EMB, mvFx, W_ };
