'use strict';
// ===== lot 4 : montagne physique, Time Stop, Saigyou Ayakashi, train/fissures de Yukari, bâton Ruyi, effets =====
const SAIG='saigyou ayakashi spawn';
// --- Mountain Spirits : la montagne monte physiquement, l'eau dévale ses flancs par vagues
function mtnPts(Mn){const H2=T.MAP_H,x0=Mn.x-Mn.w/2,u=Mn.t<120?0:Math.min(1,(Mn.t-120)/50),top=H2+60-(H2+260)*(u*u*(3-2*u));return[[x0-80,H2+60],[x0+Mn.w*.2,top+130],[Mn.x,top],[x0+Mn.w*.78,top+95],[x0+Mn.w+80,H2+60]]}
function mtnY(Mn,x){const Q=mtnPts(Mn);for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return 1e9}
function mtnStep(al){const Mn=CX.mtn;if(!Mn)return;const o=P[Mn.o];Mn.t++;if(!o||Mn.t>660){CX.mtn=null;return}Mn.W=Mn.W||[];
 if(Mn.t===1)sfx('aimreal',1.7);if(Mn.t<120){if(Mn.t%20===0)shake=Math.min(20,shake+4);return}
 if(Mn.t===120){sfx('explosion3');shake=Math.min(50,shake+30);flash(.2,'#5a8a5a')}
 const rising=Mn.t<=170;
 for(const q of al){if(q===o||(TEAMS&&ally(q,o)))continue;const sy=mtnY(Mn,q.x);if(q.y+bodyR(q)<sy)continue;
  if(rising&&!(Mn.hit||(Mn.hit={}))[q.id]&&q.inv<=0){Mn.hit[q.id]=1;hit(q,o,0,-1,{dmg:99,kb:44,stun:90},1,true);if(q.state!=='dead'){q.hp=0;ko(q,'MOUNTAIN SPIRITS')}if(q.state!=='dead')Object.assign(q,{state:'hitstun',t:400,spit:1,vx:0,vy:-46});shake=Math.min(60,shake+20)}
  else if(!rising){q.y=sy-bodyR(q);if(q.vy>0)q.vy=0}}
 if(rising)return;
 for(const q of al)if(q!==o)q.vy+=.1;
 if(Mn.t%40===0)for(const s of[-1,1])Mn.W.push({s,u:0});if(Mn.t%45===0)sfx('water'+['','2','3'][Mn.t/45%3|0],.35);
 const Q=mtnPts(Mn);for(const w of Mn.W){w.u+=.012;const p=mtnWave(Mn,w,Q);w.x=p[0];w.y=p[1];w.a=p[2];for(const q of al){if(q===o)continue;if(Math.hypot(q.x-w.x,q.y-w.y)<70+bodyR(q)){q.vx+=Math.cos(w.a)*1.4;q.vy+=Math.sin(w.a)*1.4;if((q.wvCD||0)<frame){q.wvCD=frame+40;hit(q,o,Math.cos(w.a),Math.sin(w.a),{dmg:3,kb:6,stun:16},1,true)}}}}
 Mn.W=Mn.W.filter(w=>w.u<1)}
function mtnWave(Mn,w,Q){const pk=Q[2],sh=w.s<0?Q[1]:Q[3],bs=w.s<0?Q[0]:Q[4],end=[bs[0]+w.s*900,T.MAP_H*.7];const seg=[[pk,sh],[sh,bs],[bs,end]],L=seg.map(([a,b])=>Math.hypot(b[0]-a[0],b[1]-a[1])),tot=L[0]+L[1]+L[2];let d=w.u*tot;
 for(let i=0;i<3;i++){if(d<=L[i]||i===2){const [a,b]=seg[i],k=Math.min(1,d/L[i]);return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,Math.atan2(b[1]-a[1],b[0]-a[0])]}d-=L[i]}}
function mtnDraw(){const Mn=CX.mtn;if(!Mn)return;const x0=Mn.x-Mn.w/2,H2=T.MAP_H;ctx.save();
 if(Mn.t<120){ctx.globalAlpha=.12+.14*((frame>>3)&1);ctx.fillStyle='#ff3030';ctx.fillRect(x0,0,Mn.w,H2);ctx.globalAlpha=.85;ctx.fillStyle='#ff6060';for(let i=0;i<4;i++){const y=H2-((Mn.t*6+i*200)%H2);ctx.beginPath();ctx.moveTo(Mn.x-40,y);ctx.lineTo(Mn.x,y-50);ctx.lineTo(Mn.x+40,y);ctx.fill()}
  ctx.globalAlpha=.6;ctx.fillStyle='#3a5a3a';const u=Mn.t/120,Q=[[x0-80,H2+60],[x0+Mn.w*.2,H2+60-40*u],[Mn.x,H2+60-70*u],[x0+Mn.w*.78,H2+60-50*u],[x0+Mn.w+80,H2+60]];ctx.beginPath();Q.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.fill();ctx.restore();return}
 const Q=mtnPts(Mn);const g=ctx.createLinearGradient(0,Q[2][1],0,H2);g.addColorStop(0,'#6a8a6a');g.addColorStop(.5,'#3e5e44');g.addColorStop(1,'#243a2a');ctx.fillStyle=g;ctx.beginPath();Q.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill();
 ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(Q[2][0],Q[2][1]);ctx.lineTo(Q[3][0],Q[3][1]);ctx.lineTo(Q[4][0],Q[4][1]);ctx.lineTo(Q[2][0]+20,H2+60);ctx.fill();
 ctx.fillStyle='#eef4f4';ctx.beginPath();ctx.moveTo(Q[2][0]-60,Q[2][1]+70);ctx.lineTo(Q[2][0],Q[2][1]);ctx.lineTo(Q[2][0]+55,Q[2][1]+62);ctx.lineTo(Q[2][0]+20,Q[2][1]+50);ctx.lineTo(Q[2][0]-10,Q[2][1]+66);ctx.closePath();ctx.fill();
 if(Mn.t<=175){const u=(Mn.t-120)/55;ctx.globalAlpha=1-u;ctx.fillStyle='#c8b090';for(let i=0;i<24;i++){const x=x0+((i*97)%Mn.w),y=mtnY(Mn,x)-((Mn.t*8+i*37)%90);ctx.fillRect(x,y,6,6)}ctx.globalAlpha=1}
 if(Mn.t>170){ctx.lineCap='round';for(const s of[-1,1]){const sh=s<0?Q[1]:Q[3],bs=s<0?Q[0]:Q[4];ctx.strokeStyle='rgba(80,150,255,.22)';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(Q[2][0],Q[2][1]);ctx.lineTo(sh[0],sh[1]);ctx.lineTo(bs[0],bs[1]);ctx.stroke()}
  for(const w of Mn.W||[]){if(w.x===undefined)continue;for(let k=6;k>=0;k--){const bx=w.x-Math.cos(w.a)*k*16,by=w.y-Math.sin(w.a)*k*16;ctx.globalAlpha=(1-k/7)*.55;ctx.fillStyle=k?'#3a7fff':'#bfe0ff';ctx.beginPath();ctx.ellipse(bx,by,62-k*5,34-k*3,w.a,0,TAU);ctx.fill()}
   ctx.globalAlpha=.8;ctx.strokeStyle='#e8f6ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(w.x,w.y,60,32,w.a,-1.2,1.2);ctx.stroke()}ctx.globalAlpha=1;ctx.lineCap='butt';
  ctx.strokeStyle='rgba(150,190,255,.45)';ctx.lineWidth=2;for(let k=0;k<60;k++){const x=(k*97.3)%T.MAP_W,y=((frame*9+k*173)%(H2+80))-40;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-3,y+18);ctx.stroke()}}
 ctx.restore()}
// --- Time Stop : 3 s d'attente (son), puis 4 s d'arrêt, de vrais couteaux
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0)return;const Z=CX.zaw;if(Z){if(--Z.t<=0){CX.zaw=null;const p=P[Z.o];if(p&&p.state!=='dead'){TSTOP=240;TSO=p.id;sfx('timestop',1);big('THE WORLD!','#00d0a0',80);WAVES.push({x:p.x,y:p.y,t:30,T:30,spd:60,th:120,inv:1});shake=Math.min(40,shake+20);flash(.3,'#fff')}}}
 if(TSTOP>0&&frame%3===0){const o=P[TSO];if(o)for(const q of P)if(q!==o&&q.state!=='dead'&&B.length<T.MAX_B)for(let j=0;j<2;j++){const a=rng()*TAU,r=110+rng()*170;B.push({x:q.x+Math.cos(a)*r,y:q.y+Math.sin(a)*r,vx:-Math.cos(a)*9,vy:-Math.sin(a)*9,r:6,owner:o.id,heavy:1,m:IM.sknife,mult:1,dist:999,life:200,dead:0,seen:0,home:0,gr:0,c:'#e8f4ff',knife:1})}}
 // gaps : traînées
 for(const p of P)if(p.state!=='dead'){const w=p.pwPrev??p.power;if(Math.floor(p.power+1e-9)>Math.floor(w+1e-9))sfx('bonus',.7);p.pwPrev=p.power;if(p.stPrev!==undefined&&p.stocks>p.stPrev)sfx('bonus',.8);p.stPrev=p.stocks}
 for(const e of ENT){if(e.k==='tree'&&!e.sp){e.sp=frame;flash(.45,'#ff9ad6');shake=Math.min(60,shake+30);for(let i=0;i<5;i++)RINGS.push({x:e.x,y:e.y,r:0,m:180+i*140,t:22+i*6,c:i%2?'#c060ff':'#ff9ad6'});CX.sgS=150}
  if(e.k==='stx'){const o=P[e.o];if(!o||o.state==='dead'){e.t=0;continue}e.x=o.x;e.y=o.y;e.len=e.t>18?Math.min(560,(e.len||0)+14):Math.max(0,e.len-28);const c=Math.cos(e.a),s=Math.sin(e.a),x2=o.x+c*e.len,y2=o.y+s*e.len;
   for(const q of P)if(q!==o&&q.state!=='dead'&&q.inv<=0&&!(e.hit||(e.hit={}))[q.id]&&segD(q.x,q.y,o.x,o.y,x2,y2)<bodyR(q)+9){e.hit[q.id]=1;if(parryOn(q))parryFx(q);else{hit(q,o,c,s,IM.staff,1,true);sfx('hit3')}}}
  if(e.k==='lfan'){if(e.t>=339&&!e.snd)e.snd=sfx('windblow',.6);if(e.t<=2&&e.snd){try{e.snd.stop()}catch(x){}e.snd=null}}}
 if(CX.sgS>0)CX.sgS--}}});
DEFER(()=>{{const C0=chMelee;chMelee=p=>{if(p.fx.staff>0){if((p.stCD||0)<frame){p.stCD=frame+150;ENT.push({k:'stx',o:p.id,t:60,a:p.aim,len:0,x:p.x,y:p.y});sfx('swordheavy',.5);shake=Math.min(30,shake+4)}return 1}return C0(p)}}});
// --- fond Saigyou Ayakashi (scène originale) + arbre géant
const BGH=[];
function sgBG(L,Tp,R,Bt){const e=ENT.find(e=>e.k==='tree');if(!e)return;const k=Math.min(1,(frame-(e.sp||frame))/60+.05);ctx.save();ctx.globalAlpha=k;
 const g=ctx.createLinearGradient(0,0,0,T.MAP_H);g.addColorStop(0,'#1a0a2e');g.addColorStop(.55,'#3a1048');g.addColorStop(1,'#140818');ctx.fillStyle=g;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 const mg=ctx.createRadialGradient(e.x,e.y-380,20,e.x,e.y-380,900);mg.addColorStop(0,'rgba(255,170,220,.35)');mg.addColorStop(.4,'rgba(200,90,255,.14)');mg.addColorStop(1,'rgba(40,0,60,0)');ctx.fillStyle=mg;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 for(const [c,a,o] of[['#24102e',.9,0],['#2e1438',.8,1]]){ctx.fillStyle=c;ctx.globalAlpha=k*a;ctx.beginPath();ctx.moveTo(0,T.MAP_H);for(let x=0;x<=T.MAP_W;x+=120){const y=T.MAP_H*(.55+o*.12)-Math.abs(Math.sin(x*.0021+o*2))*260-Math.sin(x*.007+o)*40;ctx.lineTo(x,y)}ctx.lineTo(T.MAP_W,T.MAP_H);ctx.fill()}
 ctx.globalAlpha=k;sgTree(e);
 ctx.fillStyle='#ffb7d5';for(let i=0;i<90;i++){const s=hz(i,1),x=(s*T.MAP_W+frame*(1+s)*1.2+Math.sin(frame*.02+i)*40)%T.MAP_W,y=(hz(i,2)*T.MAP_H+frame*(1.6+hz(i,3)*1.5))%T.MAP_H;ctx.globalAlpha=k*(.5+.5*hz(i,4));ctx.save();ctx.translate(x,y);ctx.rotate(frame*.03+i);ctx.beginPath();ctx.ellipse(0,0,7,3.5,0,0,TAU);ctx.fill();ctx.restore()}
 ctx.restore()}
DEFER(()=>{BGH.push(sgBG);});
function sgTree(e){const x=e.x,y=e.y,S=1.9,sw=Math.sin(frame*.015)*6;
 ctx.fillStyle='#2a1420';ctx.beginPath();ctx.moveTo(x-46*S,y+40);ctx.bezierCurveTo(x-20*S,y-10,x-26*S,y-70*S,x-14*S+sw,y-120*S);ctx.lineTo(x+14*S+sw,y-120*S);ctx.bezierCurveTo(x+24*S,y-70*S,x+18*S,y-10,x+50*S,y+40);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#3e2030';ctx.lineWidth=6;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(x+s*4*S+sw*.5,y-90*S);ctx.quadraticCurveTo(x+s*50*S,y-140*S,x+s*95*S+sw,y-150*S);ctx.stroke();ctx.beginPath();ctx.moveTo(x+s*6*S+sw*.6,y-110*S);ctx.quadraticCurveTo(x+s*30*S,y-170*S,x+s*55*S+sw,y-195*S);ctx.stroke()}
 const ry=y-44*S;ctx.strokeStyle='#e8dcb0';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x-30*S,ry);ctx.quadraticCurveTo(x,ry+12*S,x+30*S,ry);ctx.stroke();ctx.strokeStyle='#b8a878';ctx.lineWidth=3;for(let i=0;i<9;i++){const u=i/8,px=x-30*S+60*S*u,py=ry+12*S*4*u*(1-u);ctx.beginPath();ctx.moveTo(px-6,py-5);ctx.lineTo(px+6,py+5);ctx.stroke()}
 ctx.fillStyle='#fff';for(const u of[.2,.5,.8]){const px=x-30*S+60*S*u,py=ry+12*S*4*u*(1-u)+6;ctx.beginPath();ctx.moveTo(px-6,py);ctx.lineTo(px+6,py);ctx.lineTo(px,py+12);ctx.lineTo(px+6,py+12);ctx.lineTo(px-2,py+26);ctx.lineTo(px+4,py+26);ctx.lineTo(px-4,py+38);ctx.closePath();ctx.fill()}
 const cy=y-165*S,fl=e.fl>0;ctx.save();ctx.globalCompositeOperation='lighter';const ag=ctx.createRadialGradient(x,cy,30,x,cy,150*S);ag.addColorStop(0,'rgba(255,140,210,.35)');ag.addColorStop(1,'rgba(160,60,255,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(x,cy,150*S,0,TAU);ctx.fill();ctx.restore();
 for(let i=0;i<70;i++){const a=hz(i,5)*TAU,d=Math.sqrt(hz(i,6))*92*S,bx=x+Math.cos(a)*d*1.15+sw*(d/(92*S)),by=cy+Math.sin(a)*d*.62,r=(16+hz(i,7)*20)*S*.62;ctx.fillStyle=fl?'#fff':['#c23a7a','#d9508f','#f27ab0','#ff9ccb'][i%4];ctx.beginPath();ctx.arc(bx,by,r,0,TAU);ctx.fill()}
 for(let i=0;i<40;i++){const a=hz(i,8)*TAU,d=Math.sqrt(hz(i,9))*80*S;ctx.fillStyle='rgba(255,220,240,.55)';ctx.beginPath();ctx.arc(x+Math.cos(a)*d*1.1+sw,cy+Math.sin(a)*d*.55-10,(5+hz(i,10)*9)*S*.5,0,TAU);ctx.fill()}}
// --- fissures (gaps) de Yukari : belles, animées, traînées et images rémanentes
function xDrawGap(x,y,w,h,a){if(w<2)return;ctx.save();ctx.translate(x,y);ctx.rotate(a);const t=frame*.06;
 const path=(k=1)=>{ctx.beginPath();ctx.moveTo(-w*k,0);ctx.bezierCurveTo(-w*.5*k,-h*1.15*k,w*.5*k,-h*.9*k,w*k,0);ctx.bezierCurveTo(w*.5*k,h*.9*k,-w*.5*k,h*1.15*k,-w*k,0)};
 for(let i=3;i>0;i--){const k=1+((frame*.02+i/3)%1)*.6;ctx.globalAlpha=.35*(1-((frame*.02+i/3)%1));path(k);ctx.strokeStyle=i%2?'#c040ff':'#ff60c0';ctx.lineWidth=3;ctx.stroke()}ctx.globalAlpha=1;
 ctx.save();ctx.globalCompositeOperation='lighter';path(1.12);ctx.strokeStyle='rgba(200,80,255,.55)';ctx.lineWidth=18;ctx.stroke();ctx.restore();
 path();const ig=ctx.createLinearGradient(-w,0,w,0);ig.addColorStop(0,'#1a0028');ig.addColorStop(.5,'#3a0846');ig.addColorStop(1,'#1a0028');ctx.fillStyle=ig;ctx.fill();ctx.save();path();ctx.clip();
 for(let i=0;i<7;i++){const ex=-w*.8+((i*w*.27+frame*.6)%(w*1.6)),ey=Math.sin(i*1.7+t)*h*.3,bl=Math.max(.12,Math.abs(Math.sin(t*.7+i*2.1)));ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ex,ey,h*.42,h*.2*bl,Math.sin(i),0,TAU);ctx.fill();if(bl>.3){ctx.fillStyle='#d01030';ctx.beginPath();ctx.arc(ex+Math.sin(t+i)*h*.08,ey,h*.15,0,TAU);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex+Math.sin(t+i)*h*.08,ey,h*.05,0,TAU);ctx.fill()}}
 for(let i=0;i<14;i++){const u=(frame*.01+i/14)%1;ctx.globalAlpha=.5*(1-u);ctx.fillStyle='#ff9ae0';ctx.beginPath();ctx.arc(-w+2*w*u,Math.sin(u*9+i)*h*.4,2+2*(1-u),0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.restore();
 path();ctx.strokeStyle='#f0c0ff';ctx.lineWidth=2.5;ctx.stroke();
 for(const s of[-1,1]){ctx.save();ctx.translate(s*w,0);ctx.rotate(Math.sin(t*2+s)*.25);ctx.fillStyle='#ff3060';ctx.strokeStyle='#fff';ctx.lineWidth=1.5;for(const q of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(s*14,q*16,s*4,q*22);ctx.quadraticCurveTo(-s*6,q*10,0,0);ctx.fill();ctx.stroke()}ctx.beginPath();ctx.arc(0,0,4,0,TAU);ctx.fill();ctx.restore()}
 for(let i=0;i<10;i++){const u=(frame*.015+i/10)%1,aa=i*2.4+frame*.03;ctx.globalAlpha=.6*(1-u);ctx.fillStyle=i%2?'#c060ff':'#ff70d0';ctx.beginPath();ctx.arc(Math.cos(aa)*w*(.6+u*.9),Math.sin(aa)*h*(1+u*2),3*(1-u)+1,0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.restore()}
// --- le train (image fournie)
