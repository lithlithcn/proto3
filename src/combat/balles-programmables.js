'use strict';
// ---- balles programmables (inspiré des MoveParams de Taisei) + nouvelles spell cards
const RBC=['#ff4a4a','#ffa63a','#ffe83a','#5aff7a','#3ad0ff','#5a7aff','#c07aff'];
const sB=(p,x,y,a,sp,o)=>{if(B.length>=T.MAX_B||x<0||y<0||x>T.MAP_W||y>T.MAP_H)return null;const b=Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:4,owner:p.id,heavy:0,dmg:1,life:320,dead:0,gr:0,ag:0,ang:a},o);B.push(b);return b};
const SPH={start:0,rec:0,spd:0,r:11,dmg:5,kb:7,stun:24,arm:0},hB=(p,x,y,a,sp,o)=>{const m=SPH,n=B.length;xBall(p,x,y,a,sp,m.r,m,Object.assign({life:320,breaker:p.state==='spell'&&p.in&&p.in.b&&p.in.b.parry?1:0},o));const h=B.length>n?B[B.length-1]:null;if(h){h.ang=a;h.ag=0}return h}; // gros danmaku placé n'importe où
const setV=(b,a,sp)=>{b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp;b.ang=a},hlB=b=>{FX.push({x:b.x,y:b.y,r:7,t:8,c:'#fff'})},tgA=(p,o,x,y)=>Math.atan2((o||p).y-y,(o||p).x-x);
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(WT===w0)return;for(const b of B){if(b.dead||b.orb||!(b.rot||b.drg||b.acc||b.fn))continue; /* b.orb: held by Hina, its motion is the orbit (acc on a zero speed gave NaN) */if(b.rot){const c=Math.cos(b.rot),s=Math.sin(b.rot),vx=b.vx;b.vx=vx*c-b.vy*s;b.vy=vx*s+b.vy*c}
 if(b.drg){b.vx*=b.drg;b.vy*=b.drg}if(b.acc){const l=Math.hypot(b.vx,b.vy)||1e-3,n=clamp(l+b.acc,0,b.vmax||9);b.vx*=n/l;b.vy*=n/l;if(l<2e-3)setV(b,b.ang,n)}
 if(b.fn){b.ag++;b.fn(b)}if(b.vx||b.vy)b.ang=Math.atan2(b.vy,b.vx)}}}});
function shB(b){const c=b.c||LCOLS[b.owner],oc=COLS[b.owner]||'#fff',r=b.r;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.sh==='star'?frame*.08+b.x*.01:b.ang||0);ctx.lineWidth=1.5;ctx.strokeStyle=oc;ctx.fillStyle=c;ctx.beginPath();
 if(b.sh==='rice'){ctx.ellipse(0,0,r*2.1,r*1.15,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(0,0,r*1.2,r*.5,0,0,TAU);ctx.fill()}
 else if(b.sh==='kunai'){ctx.moveTo(r*3,0);ctx.lineTo(-r*1.6,r*1.3);ctx.lineTo(-r*.7,0);ctx.lineTo(-r*1.6,-r*1.3);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(r*2.2,0);ctx.lineTo(-r*.5,0);ctx.stroke()}
 else if(b.sh==='star'){for(let i=0;i<10;i++){const q=i%2?r*.9:r*2.1,a=i*Math.PI/5;ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.6,0,TAU);ctx.fill()}
 else if(b.sh==='bubble'){ctx.globalAlpha=.4;ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.78,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-r*.35,-r*.35,r*.2,0,TAU);ctx.fill()}
 else if(b.sh==='pill'){ctx.rotate(frame*.04);const w=r*1.25,h=r*.62;ctx.fillStyle=b.pill===1?'#ff3355':'#3a7fff';ctx.beginPath();ctx.arc(-w*.5,0,h,Math.PI/2,Math.PI*1.5);ctx.lineTo(0,-h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();ctx.fillStyle=b.pill===1?'#3a7fff':'#ff3355';ctx.beginPath();ctx.arc(w*.5,0,h,-Math.PI/2,Math.PI/2);ctx.lineTo(0,h);ctx.lineTo(0,-h);ctx.closePath();ctx.fill();
  ctx.strokeStyle=oc;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-w*.5,0,h,Math.PI/2,Math.PI*1.5);ctx.lineTo(w*.5,-h);ctx.arc(w*.5,0,h,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(-w*.7,-h*.55,w*1.1,h*.3)}
 else{ctx.arc(0,0,r+1,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.5,0,TAU);ctx.fill()}ctx.restore()}
DEFER(()=>{SPELLS.length=0;}); // spell cards : les GROS danmaku forment le motif (ils font mal), les petits sont le décor
const homeT=(b,p,o,n,tr)=>{if(b.ag<n){const t=tgA(p,o,b.x,b.y),d=Math.atan2(Math.sin(t-b.ang),Math.cos(t-b.ang)),l=Math.hypot(b.vx,b.vy);setV(b,b.ang+clamp(d,-tr,tr),l)}};
DEFER(()=>{SPELLS.push(
 {name:'Spirit Sign「Fantasy Seal」',loop:40,fn(p,o,k){ // orbes sacrés qui se courbent vers la cible
  if(k%40===0){for(let i=0;i<8;i++)hB(p,p.x,p.y,k*.02+i*TAU/8,2.7,{c:RBC[i%7],fn(b){homeT(b,p,o,80,.022)}});sfx('tan02',.5)}
  if(k%3===0)for(let i=0;i<4;i++)sB(p,p.x,p.y,k*.09+i*Math.PI/2,3,{c:'#ffd0e0',life:240})}},
 {name:'Magic Sign「Starlight Rain」',loop:40,fn(p,o,k){ // anneaux d'étoiles géantes alternés + trio visé
  if(k%20===0)for(let i=0;i<8;i++)hB(p,p.x,p.y,i*TAU/8+(k%40?TAU/16:0),2.8,{c:k%40?'#ffe83a':'#5ab0ff'});
  if(k%20===10)for(let i=0;i<16;i++)sB(p,p.x,p.y,i*TAU/16+k*.03,3.2,{sh:'star',r:3.5,c:'#fff7b0'});
  if(k%40===30){const a=tgA(p,o,p.x,p.y);for(let i=-1;i<=1;i++)hB(p,p.x,p.y,a+i*.2,4.2,{c:'#ff7ce0'})}}},
 {name:'Frost Sign「Perfect Rainbow Freeze」',loop:200,fn(p,o,k){const t=k%200,L=p.spL||(p.spL=[]); // gerbe arc-en-ciel → gel → éclatement
  if(t===0)L.length=0;
  if(t<60&&t%3===0){const b=hB(p,p.x,p.y,rng()*TAU,1.4+rng()*2.8,{c:RBC[rng()*7|0],life:420});if(b)L.push(b)}
  if(t<60&&t%2===0)for(let i=0;i<2;i++){const b=sB(p,p.x,p.y,rng()*TAU,1+rng()*3.5,{c:RBC[rng()*7|0],life:420});if(b)L.push(b)}
  if(t===80){for(const b of L)if(!b.dead){b.vx=b.vy=0;b.c='#eaf6ff';hlB(b)}sfx('get_freezed',.5)}
  if(t===140){for(const b of L)if(!b.dead){b.ang=rng()*TAU;b.acc=b.heavy?.04:.05;b.vmax=b.heavy?2.8:3.2;if(b.heavy)b.c=RBC[rng()*7|0]}sfx('icebreak',.5)}
  if(t>=95&&t<135&&t%8===0){const a=tgA(p,o,p.x,p.y);for(let i=-2;i<=2;i++)sB(p,p.x,p.y,a+i*.12,4.2,{sh:'rice',c:'#7fd8ff'})}}},
 {name:'Thunder Sign「Electromagnetic Induction」',loop:48,fn(p,o,k){ // spirales de gros danmaku qui s'enroulent
  if(k%24===0){const w=k/24|0,dir=w%2?-1:1;for(let i=0;i<5;i++)hB(p,p.x,p.y,i*TAU/5+w*.35,2.3,{rot:dir*.011,c:dir>0?'#5ab0ff':'#a07cff',life:400});if(w%2===0)sfx('electric'+(1+rng()*5|0),.35)}
  if(k%6===3)for(let i=0;i<5;i++)sB(p,p.x,p.y,i*TAU/5+k*.02+TAU/10,2,{rot:.008,c:'#cfe0ff',life:300})}},
 {name:'Moth Sign「Moths to a Flame」',loop:70,fn(p,o,k){ // les papillons géants foncent vers la flamme et éclatent
  if(k%70===0){const a0=rng()*TAU;for(let i=0;i<16;i++){const a=a0+i*TAU/16;hB(p,p.x+Math.cos(a)*400,p.y+Math.sin(a)*400,a+Math.PI/2,.9,{c:'#ffb070',life:500,fn(b){if(b.ag===45)b.c='#ff5a2a';if(b.ag>45){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1,f=Math.min(.3,(b.ag-45)*.005);b.vx=b.vx*.97+dx/d*f*3;b.vy=b.vy*.97+dy/d*f*3;
   if(d<24){b.dead=1;burst(b.x,b.y,'#ff9a6a',6);for(let j=0;j<3;j++)sB(p,b.x,b.y,b.ang+Math.PI+(j-1)*.8,.4,{sh:'flea',r:2.5,c:'#ff9a6a',acc:.03,vmax:2.4,life:300})}}}})}sfx('ghost',.3)}
  if(k%35===17){const a0=rng()*TAU;for(let i=0;i<20;i++){const a=a0+i*TAU/20;sB(p,p.x+Math.cos(a)*300,p.y+Math.sin(a)*300,a-Math.PI/2,1.2,{sh:'rice',c:'#ffd0a0',life:300})}}}},
 {name:'Orbit Sign「Kepler\'s Rings」',loop:60,fn(p,o,k){ // anneaux de gros danmaku en orbite, lâchés en tangente
  if(k%60===0)for(let r=0;r<3;r++){const dir=r%2?-1:1,a0=rng()*TAU;for(let i=0;i<8;i++){const ph=a0+i*TAU/8;hB(p,p.x,p.y,0,0,{c:RBC[(r*2+4)%7],life:480,fn(b){if(b.ag<80){const a=ph+dir*b.ag*.04,R=30+b.ag*(1+r*.55);b.x=p.x+Math.cos(a)*R;b.y=p.y+Math.sin(a)*R;b.vx=b.vy=0;b.ang=a+dir*Math.PI/2}else if(b.ag===80){setV(b,b.ang,2.6);hlB(b)}}})}}
  if(k%30===15)for(let i=0;i<12;i++)sB(p,p.x,p.y,i*TAU/12+k,1.6,{c:'#e0f0ff'})}},
 {name:'Ice Sign「Crystal Rain」',loop:40,fn(p,o,k){o=o||p; // grêle de gros cristaux au-dessus de la cible
  if(k%7===0)hB(p,o.x+(rng()*2-1)*560,Math.max(14,o.y-470),Math.PI/2+(rng()-.5)*.2,1.2,{c:'#bfe9ff',acc:.06,vmax:5,life:300});
  if(k%3===0)sB(p,o.x+(rng()*2-1)*600,Math.max(4,o.y-480),Math.PI/2,1.5,{sh:'kunai',c:'#e8f8ff',acc:.08,vmax:6.5,life:260});
  if(k%40===0)for(let i=0;i<24;i++)sB(p,p.x,p.y,i*TAU/24+k*.05,2.2,{c:'#7fd8ff'})}},
 {name:'Flower Sign「Blooming Rose Curve」',loop:110,fn(p,o,k){if(k%110)return;const rt=k*.013,cx=p.x,cy=p.y; // rose de gros danmaku qui s'épanouit
  for(let i=0;i<40;i++){const th=i*TAU/40,R=135*Math.abs(Math.cos(2.5*th)),a=th+rt;hB(p,cx+Math.cos(a)*R,cy+Math.sin(a)*R,a,0,{c:i%2?'#ff7ce0':'#ffb0e8',life:400,fn(b){if(b.ag===30){setV(b,a,.5+R/55);hlB(b)}}})}
  for(let i=0;i<48;i++){const th=i*TAU/48,R=60*Math.abs(Math.cos(2.5*th)),a=th+rt+TAU/80;sB(p,cx+Math.cos(a)*R,cy+Math.sin(a)*R,a,0,{sh:'rice',c:'#fff0fa',life:360,fn(b){if(b.ag===30)setV(b,a,.4+R/50)}})}sfx('se_kira00',.4)}},
 {name:'Fate Sign「Wheel of Fortune」',loop:100,fn(p,o,k){const dir=(k/100|0)%2?-1:1,base=k*.03*dir; // rayons de gros danmaku qui tournent
  if(k%12===0)for(let i=0;i<4;i++)hB(p,p.x,p.y,base+i*TAU/4,2.8,{c:RBC[i*2%7]});
  if(k%4===0)for(let i=0;i<4;i++)sB(p,p.x,p.y,base+i*TAU/4+TAU/8,3.4,{sh:'rice',c:'#fff3c0'});if(k%100===0)sfx('se_kira00',.4)}},
 {name:'Illusion Sign「Killing Doll Redirect」',loop:55,fn(p,o,k){if(k%55)return; // poupées géantes freinées, figées, renvoyées sur la cible
  const a0=rng()*TAU;for(let i=0;i<16;i++)hB(p,p.x,p.y,a0+i*TAU/16,5,{c:'#d8e0ff',drg:.92,life:320,fn(b){if(b.ag===34){b.drg=0;setV(b,tgA(p,o,b.x,b.y)+(rng()-.5)*.1,0);b.acc=.12;b.vmax=5.2;b.c='#ff5a7a';hlB(b);if(i===0)sfx('slice',.4)}}});
  for(let i=0;i<24;i++)sB(p,p.x,p.y,a0+i*TAU/24+TAU/48,4,{sh:'kunai',c:'#f0f4ff',drg:.93,life:260,fn(b){if(b.ag===34){b.drg=0;setV(b,b.ang+Math.PI*.5,0);b.acc=.1;b.vmax=4}}});sfx('throw',.4)}},
 {name:'Star Sign「Meteor Shower Spiral」',loop:120,fn(p,o,k){ // double spirale de météores qui ralentissent puis repartent
  if(k%7===0)for(let j=0;j<2;j++)hB(p,p.x,p.y,k*.065+j*Math.PI,3,{c:RBC[(k/7|0)%7],drg:.985,fn(b){if(b.ag===70){b.drg=0;b.acc=.035;b.vmax=3.4;hlB(b)}}});
  if(k%4===0)for(let j=0;j<2;j++)sB(p,p.x,p.y,-k*.05+j*Math.PI,2.6,{sh:'star',r:3.5,c:'#fff7b0'})}});});

DEFER(()=>{{const D0=chDraw5;chDraw5=()=>{D0();for(const q of P)if(q.state==='atk'&&q.mvName==='grab'){const m=q.mv,f=clamp(q.t/(m.start+m.act),0,1),R=(m.range||46)*(.4+.6*f);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.aim);ctx.strokeStyle='#c07aff';ctx.lineWidth=4;ctx.lineCap='round';ctx.globalAlpha=1-Math.max(0,q.t-m.start-m.act)/12; // griffe du grab
 for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(0,0,R,i*.45-.25,i*.45+.25);ctx.stroke()}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R,0,4,0,TAU);ctx.fill();ctx.restore()}}}});

function togMouse(){MOUSEON=!MOUSEON;try{localStorage.setItem('sf_mouse',MOUSEON?'1':'0')}catch(e){}sfx('se_select00',.6)}
