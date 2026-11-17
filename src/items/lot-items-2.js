'use strict';
// ===== lot items 2 : Unzan, Chain Thunder, Shaku, Lunar Fan, Dragon, Dreams, Serpent, Stone Gaze, Phantom Sounds, Crushing Weight =====
DEFER(()=>{Object.assign(IM,{pnote:{dmg:8,kb:9,stun:28,arm:0},serp:{dmg:14,kb:14,stun:36,arm:0},dfire:{dmg:3,kb:4,stun:14}});});
const hz=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)};
function zigzag(x1,y1,x2,y2,n,amp,sd){ctx.beginPath();ctx.moveTo(x1,y1);const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;for(let i=1;i<n;i++){const u=i/n,o=(hz(i,sd)-.5)*amp*2;ctx.lineTo(x1+dx*u+nx*o,y1+dy*u+ny*o)}ctx.lineTo(x2,y2);ctx.stroke()}
function zapP(q,o,sx,sy){if(!o||q===o||q.state==='dead'||q.inv>0||(q.zCD||0)>frame||(TEAMS&&ally(q,o)))return;q.zCD=frame+40;if(CX.storm)q.elec=frame+170;q.elecO=o.id;
 hit(q,o,(q.x-sx)||1,q.y-sy,IM.bolt,1,true);ENT.push({k:'zap',o:o.id,t:12,x:sx,y:sy,x2:q.x,y2:q.y,s:frame+q.id*7});sfx('electric'+(1+(rng()*5|0)),.55);
 for(let i=0;i<10;i++){const a=rng()*TAU,v=2+rng()*4;FX.push({x:q.x,y:q.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:18,c:i%2?'#cfe8ff':'#7fb8ff'})}}
function drawUnzan(p){const b=Math.sin(frame*.08)*4,ux=p.x-Math.cos(p.aim)*36,uy=p.y-Math.sin(p.aim)*36-44+b;ctx.save();ctx.globalAlpha=.88;ctx.fillStyle='#ff9ad6';
 for(const[ox,oy,r]of[[0,0,34],[-28,8,24],[28,8,24],[-16,-22,22],[18,-22,22],[0,24,22]]){ctx.beginPath();ctx.arc(ux+ox+Math.sin(frame*.05+ox)*2,uy+oy,r,0,TAU);ctx.fill()}
 ctx.restore()}
function drawFist(e){const o=P[e.o],k=e.t/14,u=1-k;ctx.save();ctx.globalAlpha=k*.5;ctx.strokeStyle='#ff9ad6';ctx.lineWidth=6;ctx.beginPath();ctx.arc(e.x,e.y,60+90*u,0,TAU);ctx.stroke();ctx.globalAlpha=1;
 if(o){const ux=o.x-Math.cos(o.aim)*36,uy=o.y-Math.sin(o.aim)*36-44;ctx.strokeStyle='#ff9ad6';ctx.lineCap='round';ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(ux,uy);ctx.quadraticCurveTo((ux+e.x)/2,(uy+e.y)/2-30,e.x-Math.cos(e.a)*30,e.y-Math.sin(e.a)*30);ctx.stroke();ctx.lineCap='butt'}
 ctx.translate(e.x,e.y);ctx.rotate(e.a);const z=1+.25*Math.max(0,k-.6);ctx.scale(z,z);ctx.fillStyle='#ffb0e0';ctx.strokeStyle='#c04890';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect?ctx.roundRect(-34,-30,60,60,16):ctx.rect(-34,-30,60,60);ctx.fill();ctx.stroke();
 for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(28,-22+i*14.7,9,0,TAU);ctx.fill();ctx.stroke()}ctx.beginPath();ctx.ellipse(-4,-34,16,9,.3,0,TAU);ctx.fill();ctx.stroke();ctx.restore()}
function drawDragon(e){const S=e.seg,n=S.length;ctx.save();ctx.lineCap='round';
 for(let i=n-1;i>=2;i-=2){const s=S[i],t=S[i-2],r=24*(1-i/n*.7);ctx.strokeStyle=(i>>1)%2?'#2f9a6a':'#3cb47e';ctx.lineWidth=r*2;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(t.x,t.y);ctx.stroke();
  if(i%8===0&&i<n-4){const a=Math.atan2(t.y-s.y,t.x-s.x)+Math.PI/2;ctx.fillStyle='#e8d070';ctx.beginPath();ctx.moveTo(s.x+Math.cos(a)*r*.6,s.y+Math.sin(a)*r*.6);ctx.lineTo(s.x+Math.cos(a)*(r+14),s.y+Math.sin(a)*(r+14));ctx.lineTo(s.x+Math.cos(a-1.2)*r*.6,s.y+Math.sin(a-1.2)*r*.6);ctx.fill()}}
 ctx.lineCap='butt';const a=e.a,c=Math.cos(a),s2=Math.sin(a),op=e.fire>0?.45:.12;ctx.translate(e.x,e.y);ctx.rotate(a);
 ctx.strokeStyle='#e8d070';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,-14);ctx.quadraticCurveTo(-30,-30,-44,-20);ctx.moveTo(-8,14);ctx.quadraticCurveTo(-30,30,-44,20);ctx.stroke();
 ctx.fillStyle='#3cb47e';ctx.beginPath();ctx.ellipse(0,0,30,20,0,0,TAU);ctx.fill();
 ctx.fillStyle='#2f9a6a';ctx.beginPath();ctx.moveTo(10,-6);ctx.lineTo(48,-10-op*20);ctx.lineTo(48,-2);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(10,6);ctx.lineTo(46,10+op*20);ctx.lineTo(46,2);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(18+i*7,-3-op*8);ctx.lineTo(21+i*7,3-op*8);ctx.lineTo(24+i*7,-3-op*8);ctx.fill()}
 ctx.fillStyle='#ffe040';ctx.beginPath();ctx.ellipse(6,-11,6,4,0,0,TAU);ctx.ellipse(6,11,6,4,0,0,TAU);ctx.fill();ctx.fillStyle='#200';ctx.beginPath();ctx.ellipse(7,-11,2,4,0,0,TAU);ctx.ellipse(7,11,2,4,0,0,TAU);ctx.fill();
 ctx.strokeStyle='#c8f0d8';ctx.lineWidth=2;ctx.beginPath();for(const sg of[-1,1]){ctx.moveTo(38,sg*8);ctx.quadraticCurveTo(52,sg*(30+Math.sin(frame*.1)*8),36,sg*(52+Math.sin(frame*.13)*6))}ctx.stroke();ctx.restore();
 ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('HP '+Math.max(0,e.hp|0),e.x,e.y-40)}
function fireCone(o,x,y,a,owner){FC.push({x,y,a});if(frame%2===0){const sp=a+(rng()-.5)*.7,v=6+rng()*4;FX.push({x:x+Math.cos(a)*20,y:y+Math.sin(a)*20,vx:Math.cos(sp)*v,vy:Math.sin(sp)*v,t:26,c:rng()<.5?'#ff8a20':'#ffd040'})}
 if(frame%6)return;for(const q of P){if(q.state==='dead'||q===owner||q.inv>0||(TEAMS&&owner&&ally(q,owner)))continue;const dx=q.x-x,dy=q.y-y,d=Math.hypot(dx,dy);if(d>250+bodyR(q))continue;const da=Math.abs(((Math.atan2(dy,dx)-a)%TAU+TAU*1.5)%TAU-Math.PI);if(da<.45)hit(q,o,dx,dy,IM.dfire,1,true)}}
let FC=[];
DEFER(()=>{{const H0=heavyItem;heavyItem=(p,o)=>{if(p.dragonP>frame){if((p.pfCD||0)<frame){p.pfCD=frame+100;p.pfire=50;sfx('fire2',.6)}return 1}return H0(p,o)}}});
DEFER(()=>{{const C0=chSpeed;chSpeed=p=>C0(p)*(p.eatD?.25:1)}});
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0)return;FC=[];const al=P.filter(q=>q.state!=='dead');
 // foudre : joueurs électrifiés
 for(const q of al)if(q.elec>frame){const o=P[q.elecO];if(!o)continue;for(const r of al)if(r!==q&&r!==o&&Math.hypot(r.x-q.x,r.y-q.y)<bodyR(q)+bodyR(r)+6)zapP(r,o,q.x,q.y);
  if((frame+q.id*11)%45===0){let b=null,bd=340;for(const r of al)if(r!==q&&r!==o){const d=Math.hypot(r.x-q.x,r.y-q.y);if(d<bd){bd=d;b=r}}if(b)zapP(b,o,q.x,q.y)}if(frame%40===0)sfx('electricity',.2)}
 // shaku, éventail, dragon, rêves, serpent, pierres, poids
 for(const e of ENT){if(e.k==='shaku'){const q=P[e.tg],o=P[e.o];if(q&&e.t>20){e.x=q.x;e.y=q.y}if(e.t===20&&q&&o&&q.state!=='dead'){const D=[[0,1],[0,-1],[1,0],[-1,0]][e.d];hit(q,o,D[0],D[1],{dmg:15,kb:30,stun:60},1,true);if(q.state!=='dead')Object.assign(q,{state:'hitstun',t:400,spit:1,vx:D[0]*34,vy:D[1]*34,charging:false});shake=Math.min(40,shake+16);flash(.15,'#f0e2b6');sfx('hit3');sfx('se_enep00',.5);big('SHAKU!','#f0e2b6',40)}}
  else if(e.k==='lfan'){const o=P[e.o];if(o&&e.t<320)for(const q of al)if(q!==o&&!(TEAMS&&ally(q,o))){q.vx+=Math.cos(e.a)*.55;q.vy+=Math.sin(e.a)*.55}if(e.t%40===0)sfx('voosh',.25)}
  else if(e.k==='dragon'){e.fcd=(e.fcd||60)-1;const o=P[e.o];if(e.fire>0){e.fire--;fireCone(o,e.x,e.y,e.a,o)}else if(e.fcd<=0){for(const q of al)if(q!==o&&Math.hypot(q.x-e.x,q.y-e.y)<300){e.fire=55;e.fcd=200;sfx('fire',.6);break}}}
  else if(e.k==='stone'){const o=P[e.o];if(o&&o.state==='atk'&&o.mv&&!o.mv.spd&&o.t>o.mv.start&&o.t<=o.mv.start+o.mv.act&&Math.hypot(e.x-o.x,e.y-o.y)<(o.mv.range||40)+e.r+bodyR(o)+6){const a=o.atkA??o.aim;xBall(o,e.x,e.y,a,9,e.r,{dmg:e.dmg,kb:5,stun:16,arm:0},{stone:1,c:'#a89880',life:160});e.t=0;sfx('hit2',.6);shake=Math.min(30,shake+4)}}}
 for(const p of al){
  if(p.pfire>0){p.pfire--;fireCone(p,p.x,p.y,p.aim,p)}
  if(p.eatD){const E=p.eatD,e=E.e;if(!ENT.includes(e)||e.t<=0||!p.in||!p.in.b.heavy||p.state==='hitstun'||p.state==='parrystun'||Math.hypot(e.x-p.x,e.y-p.y)>480){p.eatD=null;txt(p.x,p.y-40,'...','#ffb0e0',14)}
   else if(++E.t>=120){e.t=0;p.eatD=null;let n=0;for(const q of P)if(q!==p&&q.state!=='dead'&&Math.hypot(q.x-e.x,q.y-e.y)<110){q.inv=0;q.hp=0;ko(q,'EATEN IN A DREAM');n++}big('*GULP* DREAM EATEN','#ffb0e0',50);flash(.4,'#ffb0e0');sfx(n?'se_enep01':'eatingdream')}else{e.x+=(p.x-e.x)*.006;e.y+=(p.y-e.y)*.006}}
  if(p.fx.dreamE>0){const b=SFX.dreamsmoving;if(b&&(p.dmT||0)<=frame){p.dmT=frame+Math.max(30,Math.round(b.duration*60));sfx('dreamsmoving',.45)}}
  if(p.fx.serp>0){const h=frame*.05,S=p.serpS=[];for(let i=0;i<18;i++){const a=h-i*.2,r=78+Math.sin(frame*.1-i*.5)*10;S.push({x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r})}
   for(const b of B){if(b.dead||b.owner===p.id||b.fake||(TEAMS&&P[b.owner]&&ally(P[b.owner],p)))continue;if(Math.abs(b.x-p.x)>110||Math.abs(b.y-p.y)>110)continue;for(let i=0;i<18;i+=2){const s=S[i];if(Math.hypot(b.x-s.x,b.y-s.y)<b.r+13){b.dead=1;p.serpV+=b.heavy?3:1;FX.push({x:b.x,y:b.y,vx:0,vy:0,t:12,c:'#ff7a30',r:8});break}}}
   if(p.serpV>=3&&(p.spCD||0)<frame){const t=nearFoe(p.id,S[0].x,S[0].y);if(t){p.spCD=frame+22;p.serpV-=3;xBall(p,S[0].x,S[0].y,Math.atan2(t.y-S[0].y,t.x-S[0].x),12,15,IM.serp,{c:'#ff7a30',life:200});sfx('shoot4',.5)}}}else p.serpS=null
  if(p.fx.gaze2>0){for(const b of B){if(b.dead||b.owner===p.id||b.fake||b.stone||(TEAMS&&P[b.owner]&&ally(P[b.owner],p)))continue;if(Math.hypot(b.x-p.x,b.y-p.y)<210){b.dead=1;ENT.push({k:'stone',o:p.id,t:p.fx.gaze2+300,x:b.x,y:b.y,r:Math.max(9,b.r*1.3),dmg:(b.heavy&&b.m?b.m.dmg:9)*.35});if(frame%4===0)sfx('icebreak',.25)}}}}
 if(CX.wz){const o=P[CX.wz.o];if(!o||!(o.fx.wzone>0))CX.wz=null;else for(const b of B){if(b.dead)continue;if(!b.wt){for(const z of CX.wz.Z)if(Math.hypot(b.x-z.x,b.y-z.y)<z.r){b.wt=1;b.r=Math.min(36,b.r*1.6+2);if(b.heavy)b.mult=(b.mult||1)*2;else b.dmg=(b.dmg||1)*2;b.home=0;b.life=Math.max(b.life||0,400);break}}else{b.vy+=.45;b.vx*=.96}}}}}});
DEFER(()=>{{const R0=drawWorldItems;drawWorldItems=(...a)=>{R0(...a);ctx.save();
 if(CX.wz)for(const z of CX.wz.Z){ctx.globalAlpha=.16;ctx.fillStyle='#4a3a2a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.globalAlpha=.6;ctx.strokeStyle='#8a7a6a';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#8a7a6a';for(let i=0;i<3;i++){const y=z.y-40+((frame*1.5+i*30)%90);ctx.beginPath();ctx.moveTo(z.x-12+(i-1)*40,y);ctx.lineTo(z.x+12+(i-1)*40,y);ctx.lineTo(z.x+(i-1)*40,y+14);ctx.fill()}}
 for(const e of ENT){
  if(e.k==='zap'){ctx.globalAlpha=Math.min(1,e.t/6);ctx.lineJoin='round';ctx.strokeStyle='#7fb8ff';ctx.lineWidth=e.big?12:7;zigzag(e.x,e.y,e.x2,e.y2,e.big?12:7,e.big?36:16,e.s+(frame>>1));ctx.strokeStyle='#fff';ctx.lineWidth=e.big?4:2.5;zigzag(e.x,e.y,e.x2,e.y2,e.big?12:7,e.big?36:16,e.s+(frame>>1))}
  else if(e.k==='shaku'){const q=P[e.tg];if(!q)continue;const D=[[0,1],[0,-1],[1,0],[-1,0]][e.d],ba=Math.atan2(D[1],D[0]),u=e.t>20?(50-e.t)/30:1,sw=e.t>20?-1.7*Math.min(1,u*1.6):e.t>14?-1.7*(e.t-14)/6:0,px=e.x-D[0]*100,py=e.y-D[1]*100;
   ctx.globalAlpha=Math.min(1,e.t/8,u*3);ctx.translate(px,py);ctx.rotate(ba+sw);ctx.fillStyle='#f0e2b6';ctx.strokeStyle='#9a7a40';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect?ctx.roundRect(-10,-11,125,22,11):ctx.rect(-10,-11,125,22);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(154,122,64,.35)';ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(108,0);ctx.stroke();ctx.restore();ctx.save()}
  else if(e.k==='lfan'){const o=P[e.o];if(!o)continue;const sw=e.t>320?(340-e.t)/20:1,fx=o.x-Math.cos(e.a)*58,fy=o.y-Math.sin(e.a)*58-40,ra=e.a+(e.t>320?-1.4+2.4*sw:Math.sin(frame*.55)*.4);ctx.globalAlpha=Math.min(1,e.t/20);
   ctx.translate(fx,fy);ctx.rotate(ra);ctx.fillStyle='#f4f0ff';ctx.strokeStyle='#8a6ad8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,64,-1.1,1.1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffb0d8';ctx.beginPath();ctx.arc(0,0,64,-1.1,1.1);ctx.arc(0,0,48,1.1,-1.1,true);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#6a4a9a';for(let i=0;i<=8;i++){const a=-1.1+i*2.2/8;ctx.beginPath();ctx.moveTo(4*Math.cos(a),4*Math.sin(a));ctx.lineTo(64*Math.cos(a),64*Math.sin(a));ctx.stroke()}ctx.fillStyle='#6a4a9a';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.restore();ctx.save();
   if(e.t<320){ctx.strokeStyle='rgba(232,232,255,.35)';ctx.lineWidth=2;const c=Math.cos(e.a),s=Math.sin(e.a);for(let i=0;i<14;i++){const d=(frame*9+i*137)%1400,o2=(hz(i,3)-.5)*700;const x=o.x+c*d-s*o2,y=o.y+s*d+c*o2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+c*50,y+s*50);ctx.stroke()}}}
  else if(e.k==='stone'){ctx.globalAlpha=Math.min(1,e.t/30);ctx.fillStyle='#9a8c78';ctx.strokeStyle='#5a5044';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7,r=e.r*(.8+.35*hz(i,e.x|0));i?ctx.lineTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r):ctx.moveTo(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(e.x-e.r*.4,e.y-e.r*.2);ctx.lineTo(e.x+e.r*.1,e.y+e.r*.1);ctx.lineTo(e.x+e.r*.3,e.y-e.r*.4);ctx.stroke()}}
 ctx.globalAlpha=1;
 for(const f of FC){const g=ctx.createRadialGradient(f.x,f.y,10,f.x,f.y,250);g.addColorStop(0,'rgba(255,240,160,.55)');g.addColorStop(.5,'rgba(255,140,30,.35)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,250,f.a-.45,f.a+.45);ctx.closePath();ctx.fill()}
 for(const p of P){if(p.state==='dead')continue;
  if(p.elec>frame){ctx.strokeStyle='#bfe0ff';ctx.lineWidth=2;for(let i=0;i<3;i++){const a=hz(i,frame>>2)*TAU,r=bodyR(p)+6;zigzag(p.x+Math.cos(a)*r*.3,p.y+Math.sin(a)*r*.3,p.x+Math.cos(a)*(r+12),p.y+Math.sin(a)*(r+12),4,5,frame+i)}}
  if(p.fx.gaze2>0){ctx.globalAlpha=.12;ctx.fillStyle='#b0a080';ctx.beginPath();ctx.arc(p.x,p.y,210,0,TAU);ctx.fill();ctx.globalAlpha=.55;ctx.setLineDash([10,8]);ctx.strokeStyle='#b0a080';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
  if(p.serpS){const S=p.serpS;for(let i=S.length-1;i>=0;i--){const s=S[i],r=14-i*.45;ctx.fillStyle=i%2?'#c8401c':'#ff7a30';ctx.beginPath();ctx.arc(s.x,s.y,r,0,TAU);ctx.fill()}const h=S[0],a=Math.atan2(S[0].y-S[1].y,S[0].x-S[1].x);
   ctx.save();ctx.translate(h.x,h.y);ctx.rotate(a);ctx.fillStyle='#ff7a30';ctx.beginPath();ctx.ellipse(4,0,18,12,0,0,TAU);ctx.fill();ctx.fillStyle='#ffe040';ctx.beginPath();ctx.arc(8,-6,3,0,TAU);ctx.arc(8,6,3,0,TAU);ctx.fill();if((frame>>3)%3===0){ctx.strokeStyle='#ff3050';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(32,0);ctx.lineTo(36,-4);ctx.moveTo(32,0);ctx.lineTo(36,4);ctx.stroke()}ctx.restore();
   if(p.serpV>0){ctx.fillStyle='#ffb080';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('VENOM '+p.serpV,p.x,p.y+62)}}
  if(p.eatD){const E=p.eatD,e=E.e,u=E.t/120;ctx.strokeStyle='#ffb0e0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+14,-Math.PI/2,-Math.PI/2+u*TAU);ctx.stroke();
   for(let k=0;k<14;k++){const w=(frame*.025+k/14)%1,sw=(1-w)*2.4+k,x=e.x+(p.x-e.x)*w+Math.cos(sw)*60*(1-w),y=e.y+(p.y-e.y)*w+Math.sin(sw)*60*(1-w);ctx.globalAlpha=.3+.6*w;ctx.fillStyle=k%3?'#ffd0f0':'#c06cff';ctx.beginPath();ctx.arc(x,y,7*(1-w)+2,0,TAU);ctx.fill()}ctx.globalAlpha=1}}
 ctx.restore()}}});
DEFER(()=>{{const H0=drawHeavy;drawHeavy=b=>{if(!b.stone)return H0(b);ctx.fillStyle='#9a8c78';ctx.strokeStyle=COLS[b.owner]||'#5a5044';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<7;i++){const a=i*TAU/7+frame*.2,r=b.r*(.85+.3*hz(i,7));i?ctx.lineTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r):ctx.moveTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.stroke()}}});
