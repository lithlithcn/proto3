'use strict';
// ---- Reimu : yin-yang rebondissants (ENT 'ryy'), options, barrières (rbar / rbnd), dash = téléport, visuels de mêlée
function rOpt(p,i,n,f){const L=[[[0,30,0,20]],[[-30,8,-16,20],[30,8,16,20]],[[-30,8,-16,20],[30,8,16,20],[0,32,0,30]],[[-30,8,-16,20],[30,8,16,20],[-16,32,-8,30],[16,32,8,30]]][n-1][i],lx=f?L[2]:L[0],ly=f?L[3]:L[1],c=Math.cos(p.aim),s=Math.sin(p.aim);return[p.x-s*lx-c*ly,p.y+c*lx-s*ly]}
function rOrbs(p,n){const A=[[0],[-.35,.35],0,[-.6,-.2,.2,.6]][n-1];for(const o of A){const a=p.aim+o;ENT.push({k:'ryy',o:p.id,t:600,x:p.x+Math.cos(a)*24,y:p.y+Math.sin(a)*24,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,r:15,hc:{},bc:0,g:0})}
 const os=ENT.filter(e=>e.k==='ryy'&&e.o===p.id&&e.t>0);for(let i=0;i<os.length-4;i++)os[i].t=0;sfx('tan00',.6);shake=Math.min(28,shake+2)}
function rYY(x,y,r,a,al){ctx.globalAlpha=al;const c=Math.cos(a)*r/2,s=Math.sin(a)*r/2;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x,y,r,a,a+Math.PI);ctx.fill();
 ctx.beginPath();ctx.arc(x+c,y+s,r/2,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-c,y-s,r/2,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x+c,y+s,r/6,0,TAU);ctx.fill();ctx.fillStyle='#e8243a';ctx.beginPath();ctx.arc(x-c,y-s,r/6,0,TAU);ctx.fill();
 ctx.strokeStyle='#300';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();ctx.globalAlpha=1}
// gohei : manche + papiers en zigzag
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
DEFER(()=>{{const D0=dash;dash=(p,I)=>{const c=chOf(p);if(!c||c.k!=='reimu'||p.fx.heads>0)return D0(p,I);if(frame-(p.rDl||-99)<21)return;const x0=p.x,y0=p.y;D0(p,I);if(p.state!=='dash')return;p.rDl=frame;
 const v=Math.hypot(p.vx,p.vy)||1,ux=p.vx/v,uy=p.vy/v,R=bodyR(p);p.x=Math.max(R,Math.min(T.MAP_W-R,p.x+ux*150));p.y=Math.max(R,Math.min(T.MAP_H-R,p.y+uy*150));p.vx=ux*1.5;p.vy=uy*1.5;p.t=Math.min(p.t,7);p.inv=Math.max(p.inv,8);
 sfx('teleportation',.6);RINGS.push({x:x0,y:y0,r:0,m:44,t:14,c:'#ff9aa8'},{x:p.x,y:p.y,r:0,m:36,t:14,c:'#fff'});for(let i=0;i<8&&FX.length<480;i++)FX.push({x:x0+(p.x-x0)*i/7,y:y0+(p.y-y0)*i/7,vx:0,vy:0,t:10+i,c:'#ff9aa8'})}}});
function rBorder(e){const sp=Math.min(1,(300-e.t)/8),w=e.w*sp,h=e.h,fl=e.fl&&frame-e.fl<5;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.a);ctx.globalAlpha=e.t<60&&(frame>>2)%2?.5:1;ctx.globalCompositeOperation='lighter';
 for(let i=4;i>=1;i--){ctx.fillStyle=`rgba(40,120,255,${.06*(5-i)})`;ctx.fillRect(-w-i*6,-h-i*6,(w+i*6)*2,(h+i*6)*2)} // halo
 const g=ctx.createLinearGradient(0,-h,0,h);g.addColorStop(0,'rgba(170,230,255,.95)');g.addColorStop(.18,'rgba(60,150,255,.55)');g.addColorStop(.5,'rgba(30,110,255,.35)');g.addColorStop(.82,'rgba(60,150,255,.55)');g.addColorStop(1,'rgba(170,230,255,.95)');
 ctx.fillStyle=fl?'rgba(220,245,255,.85)':g;ctx.fillRect(-w,-h,w*2,h*2);ctx.strokeStyle='#d8f4ff';ctx.lineWidth=3;ctx.strokeRect(-w,-h,w*2,h*2);
 ctx.strokeStyle='rgba(200,240,255,.75)';ctx.lineWidth=1.5;ctx.strokeRect(-w+6,-h+5,w*2-12,h*2-10);ctx.strokeRect(-w+11,-h+9,w*2-22,h*2-18); // cadres intérieurs comme la porte
 ctx.strokeStyle='rgba(190,235,255,.35)';ctx.lineWidth=1;for(let x=-w+16;x<w-14;x+=9){ctx.beginPath();ctx.moveTo(x,-h+9);ctx.lineTo(x,h-9);ctx.stroke()}
 const s=(frame*3)%(w*2+60)-w-30;ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(Math.max(-w,s-7),-h,Math.min(14,w-s+7),h*2);ctx.restore()}
DEFER(()=>{{const W0=drawWorldItems;drawWorldItems=function(){W0();for(const e of ENT){if(e.t<=0)continue;
 if(e.k==='ryy'){const a=frame*.12+e.x*.01;ctx.save();if(!e.g){ctx.globalAlpha=.25;ctx.fillStyle='#ff3a4a';ctx.beginPath();ctx.arc(e.x,e.y,e.r+5,0,TAU);ctx.fill()}rYY(e.x,e.y,e.r,a,e.g?.3:e.t<60&&(frame>>2)%2?.5:1);if(e.g){ctx.globalAlpha=.6;ctx.setLineDash([4,4]);ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,e.r+3,0,TAU);ctx.stroke();ctx.setLineDash([])}ctx.restore()}
 else if(e.k==='rbar')rBorder(e);
 else if(e.k==='rbnd'){const d=110*e.t/e.T;ctx.save();for(const sg of[-1,1]){ctx.save();ctx.translate(e.x+Math.cos(e.a)*d*sg,e.y+Math.sin(e.a)*d*sg);ctx.rotate(e.a+Math.PI/2);ctx.globalAlpha=.85;ctx.fillStyle='rgba(255,120,140,.3)';ctx.fillRect(-48,-6,96,12);ctx.strokeStyle='#ffb0bc';ctx.lineWidth=2;ctx.strokeRect(-48,-6,96,12);ctx.fillStyle='#fff';for(let i=-40;i<48;i+=16)ctx.fillRect(i-3,-4,6,8);ctx.restore()}ctx.restore()}}}}});
DEFER(()=>{{const W0=drawWorldItems;drawWorldItems=function(){W0();for(const e of ENT)if(e.k==='nufo'){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#3a2a6a';ctx.beginPath();ctx.ellipse(0,0,16,6,0,0,TAU);ctx.fill();ctx.fillStyle='#9a6aff';ctx.beginPath();ctx.arc(0,-3,6,Math.PI,0);ctx.fill();ctx.fillStyle=(frame>>3)%2?'#ff4a6a':'#5cff7a';for(const x of[-10,0,10]){ctx.beginPath();ctx.arc(x,2,1.8,0,TAU);ctx.fill()}ctx.restore()}}}});

