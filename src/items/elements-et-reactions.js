'use strict';
// ===== Éléments et réactions =====
// 0 neutre · 1 feu · 2 eau · 3 glace · 4 foudre · 5 vent · 6 terre · 7 nature · 8 ténèbres · 9 lumière
const ELN9=['','FIRE','WATER','ICE','THUNDER','WIND','EARTH','NATURE','DARK','LIGHT'],ELC9=['#fff','#ff5030','#3a8aff','#9ae8ff','#f0e040','#9affc8','#c09060','#5cd040','#9a3ae0','#fff6b0'];
const SHOT_EL=false,SHOTEL=[5,4,9,6]; // idée gardée pour un futur personnage : Spread = vent · Needles = foudre · Amulets = lumière · Barrage = terre (désactivée : le perso actuel est un perso de test)
const ITEMEL={};DEFER(()=>{{const G={1:'mokou okuu orin elixir yuiman flandre orange clown patchouli',2:'nitori minamitsu wakasagi kogasa urumi yachie',3:'freeze letty',4:'tojiko raiko',
 5:'kanako camera momiji kyouko toyohime saki lunasa merlin lyrica layla yatsuhashi kutaka satono sanae ran chen youmu',6:'eika mayumi keiki suwako yuugi oni ariya ubame nareko enoko momoyo nemuno aunn narumi biten bumpers sekibanki',
 7:'takane lily shizuha minoriko saigyou wriggle medicine yamame larva mai chimi daiyousei green mamizou ringo tewi blue',8:'rumia remilia hina yuyuko koishi satori parsee seija hecatia zanmu hisami chiyari tsukasa kagerou mystia rin koakuma gap yukari nue doremy komachi purple mirror',
 9:'reimu spark junko shou byakuren miko eiki keine kaguya eirin reisen sagume seiran nina misumaru megumu chimata mike world clone ichirin rainbow'};for(const e in G)for(const k of G[e].split(' '))ITEMEL[k]=+e}});
const ally=(a,b)=>!!a&&!!b&&a!==b&&TEAMS&&TEAMA[a.id]===TEAMA[b.id],foeOf=(o,q)=>q.id!==o&&!ally(P[o],q);
const ENTEL={flake:3,fire:1,puddle:2,qtree:7,tree:7,smoke:5,darkz:8,steam:2,mud:6,clay:6,pillar:6,iceb:3,web:7,magma:1,sblood:8,geyser:1,blizz:3,whirl:2,sand:6};
const auraOf=t=>t.aura&&t.aura.t>frame?t.aura.el:t.burn>0?1:t.wet>frame?2:t.frozen>0?3:t.pois>0?7:0;
let RXN=0; // réactions sur cette image (plafond anti-chaos)
const RX={}; // RX[a*10+b] (a<b) = [nom, effet(x,y,o,t)]
const rx=(a,b,n,f)=>{RX[Math.min(a,b)*10+Math.max(a,b)]=[n,f]};
const xBoom=(x,y,o,r,m)=>{for(const q of P)if(q.state!=='dead'&&q.inv<=0&&foeOf(o,q)&&Math.hypot(q.x-x,q.y-y)<r+bodyR(q))hit(q,P[o]||q,q.x-x||1,q.y-y,m,1,true)};
const xZone=(k,x,y,o,t,r)=>{if(ENT.length<600)ENT.push({k,o,t,x,y,r})};
DEFER(()=>{rx(1,2,'STEAM',(x,y,o)=>xZone('steam',x,y,o,200,90));});
DEFER(()=>{rx(1,3,'MELT',(x,y,o,t)=>{if(t){if(t.frozen>0)xUnfreeze(t);t.hp-=12;t.flash=8}xZone('puddle',x,y,o,240)});});
DEFER(()=>{rx(1,4,'OVERLOAD',(x,y,o)=>{WAVES.push({x,y,t:14,T:14,spd:10,th:30,inv:1});shake=Math.min(30,shake+10);xBoom(x,y,o,110,{dmg:10,kb:18,stun:30})});});
DEFER(()=>{rx(1,5,'FIRESTORM',(x,y,o)=>{for(let i=0;i<6;i++)B.length<T.MAX_B&&B.push({x,y,vx:Math.cos(i*TAU/6)*4,vy:Math.sin(i*TAU/6)*4,r:9,owner:o,heavy:1,m:IM.elem,mult:1,dist:999,life:120,dead:0,seen:0,home:0,gr:0,el:1,rx:1,c:'#ff5030'})});});
DEFER(()=>{rx(1,6,'MAGMA',(x,y,o)=>xZone('magma',x,y,o,240,60));});
DEFER(()=>{rx(1,7,'WILDFIRE',(x,y,o,t)=>{if(t)t.burn=Math.max(t.burn,300);for(let i=0;i<6;i++)ENT.length<600&&ENT.push({k:'fire',o,t:180,x:x+Math.cos(i)*40,y:y+Math.sin(i)*40})});});
DEFER(()=>{rx(1,8,'HELLFIRE',(x,y,o,t)=>{if(t){t.burn=Math.max(t.burn,240);t.hp-=10;t.noAtk=frame+60}xBoom(x,y,o,60,{dmg:6,kb:8,stun:20})});});
DEFER(()=>{rx(1,9,'SOLAR BEAM',(x,y,o)=>{const q=P.filter(q=>q.state!=='dead'&&foeOf(o,q)).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(!q)return;const a=Math.atan2(q.y-y,q.x-x),x2=x+Math.cos(a)*2000,y2=y+Math.sin(a)*2000;
 warnBeam(o,x,y,x2,y2,'#ffe060',()=>{ENT.push({k:'lbeam',o,t:10,x,y,x2,y2});for(const c of P)if(c.state!=='dead'&&foeOf(o,c)&&c.inv<=0&&segD(c.x,c.y,x,y,x2,y2)<bodyR(c)+8)hit(c,P[o]||c,Math.cos(a),Math.sin(a),IM.kizaru,1,true)})});});
DEFER(()=>{rx(2,3,'FREEZE',(x,y,o,t)=>{if(t)t.frzPend=1;else xZone('iceb',x,y,o,300)});});
DEFER(()=>{rx(2,4,'ELECTRO-CHARGE',(x,y,o)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)&&q.inv<=0&&Math.hypot(q.x-x,q.y-y)<250){const w=auraOf(q)===2||q.wet>frame;q.hp-=w?14:7;q.flash=8;LINES.push({x,y,a:Math.atan2(q.y-y,q.x-x),t:10,T:10,len:Math.hypot(q.x-x,q.y-y)});if(q.state!=='spell')Object.assign(q,{state:'parrystun',t:20,vx:0,vy:0});if(q.hp<=0)ko(q,'ELECTROCUTED')}});});
DEFER(()=>{rx(2,5,'TYPHOON',(x,y,o)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)){const dx=q.x-x,dy=q.y-y,d=Math.hypot(dx,dy)||1;if(d<180){q.vx+=dx/d*12;q.vy+=dy/d*12}}RINGS.push({x,y,r:0,m:180,t:20,c:'#3a8aff'})});});
DEFER(()=>{rx(2,6,'MUD',(x,y,o)=>xZone('mud',x,y,o,300,80));});
DEFER(()=>{rx(2,7,'BLOOM',(x,y,o)=>{const p=P[o];if(p)p.hp=Math.min(T.HP,p.hp+8);ENT.push({k:'fruit',o,t:300,x,y:y-200})});});
DEFER(()=>{rx(2,8,'ABYSS',(x,y,o)=>xZone('whirl',x,y,o,120,200));});
DEFER(()=>{rx(2,9,'RAINBOW',(x,y,o)=>{const p=P[o];if(p){p.power=Math.min(T.POWER_MAX,p.power+.3);p.spirit=Math.min(T.SPIRIT_MAX,p.spirit+20)}for(let i=0;i<6;i++)RINGS.push({x,y,r:0,m:60+i*14,t:24,c:RB[i]})});});
DEFER(()=>{rx(3,4,'SUPERCONDUCT',(x,y,o,t)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)&&Math.hypot(q.x-x,q.y-y)<140)q.supc=frame+300});});
DEFER(()=>{rx(3,5,'BLIZZARD',(x,y,o)=>xZone('blizz',x,y,o,240,140));});
DEFER(()=>{rx(3,6,'PERMAFROST',(x,y,o)=>{for(let i=0;i<8;i++)B.length<T.MAX_B&&B.push({x,y,vx:Math.cos(i*TAU/8)*5,vy:Math.sin(i*TAU/8)*5,r:7,owner:o,heavy:1,m:IM.pebble,mult:1,dist:999,life:90,dead:0,seen:0,home:0,gr:0,el:3,rx:1,c:'#9ae8ff'})});});
DEFER(()=>{rx(3,7,'FROSTBITE',(x,y,o,t)=>{if(t){t.slowT=frame+180;t.hp-=6}});});
DEFER(()=>{rx(3,8,'CRYO-VOID',(x,y,o,t)=>{if(t){t.frzPend=1;t.noAtk=frame+150}});});
DEFER(()=>{rx(3,9,'PRISM',(x,y,o)=>{for(let i=0;i<8;i++){const a=i*TAU/8,x2=x+Math.cos(a)*500,y2=y+Math.sin(a)*500;warnBeam(o,x,y,x2,y2,'#c0f0ff',()=>{ENT.push({k:'lbeam',o,t:10,x,y,x2,y2});for(const c of P)if(c.state!=='dead'&&foeOf(o,c)&&c.inv<=0&&segD(c.x,c.y,x,y,x2,y2)<bodyR(c)+6)hit(c,P[o]||c,Math.cos(a),Math.sin(a),IM.eye,1,true)})}});});
DEFER(()=>{rx(4,5,'THUNDERSTORM',(x,y,o)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)&&Math.hypot(q.x-x,q.y-y)<500)ENT.push({k:'bolt',o,t:30,x:q.x,y:q.y})});});
DEFER(()=>{rx(4,6,'EMP',(x,y,o)=>{for(const b of B)if(Math.hypot(b.x-x,b.y-y)<200&&b.owner!==o)b.dead=1;for(const q of P)if(q.state!=='dead'&&foeOf(o,q)&&Math.hypot(q.x-x,q.y-y)<200&&q.state!=='spell')Object.assign(q,{state:'parrystun',t:24,vx:0,vy:0})});});
DEFER(()=>{rx(4,7,'QUICKEN',(x,y,o)=>{const p=P[o];if(p){p.fx.haste=Math.max(p.fx.haste||0,300);p.boost=T.DASH_CHARGES}});});
DEFER(()=>{rx(4,8,'BLACK LIGHTNING',(x,y,o,t)=>{if(t){t.hp-=18;t.flash=10;LINES.push({x:t.x,y:t.y-500,a:Math.PI/2,t:16,T:16,len:500});if(t.hp<=0)ko(t,'BLACK LIGHTNING')}});});
DEFER(()=>{rx(4,9,'PLASMA',(x,y,o)=>{B.length<T.MAX_B&&B.push({x,y,vx:0,vy:-2,r:22,owner:o,heavy:1,m:{dmg:16,kb:14,stun:36,arm:0},mult:1,dist:999,life:300,dead:0,seen:0,home:.08,gr:0,el:9,rx:1,c:'#fff6b0'})});});
DEFER(()=>{rx(5,6,'SANDSTORM',(x,y,o)=>xZone('sand',x,y,o,240,150));});
DEFER(()=>{rx(5,7,'POLLEN',(x,y,o)=>{if(CLOUDS.length<120)CLOUDS.push({x,y,r:70,t:240,o})});});
DEFER(()=>{rx(5,8,'SHADOW GALE',(x,y,o)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)){const dx=q.x-x,dy=q.y-y,d=Math.hypot(dx,dy)||1;if(d<260){q.vx+=dx/d*16;q.vy+=dy/d*16}}});});
DEFER(()=>{rx(5,9,'AURORA',(x,y,o)=>{const p=P[o];if(p){p.hp=Math.min(T.HP,p.hp+10);p.burn=0;p.pois=0;p.drug=null;p.ban=null}});});
DEFER(()=>{rx(6,7,'OVERGROWTH',(x,y,o)=>{for(const q of P)if(q.state!=='dead'&&foeOf(o,q)&&q.inv<=0&&Math.hypot(q.x-x,q.y-y)<120&&q.state!=='spell')Object.assign(q,{state:'parrystun',t:60,vx:0,vy:0,charging:false})});});
DEFER(()=>{rx(6,8,'SINKHOLE',(x,y,o)=>{HOLES.push({x,y,t:180,o,a:0})});});
DEFER(()=>{rx(6,9,'CRYSTAL',(x,y,o)=>{ENT.push({k:'crystal',o,t:400,x,y})});});
DEFER(()=>{rx(7,8,'ROT',(x,y,o,t)=>{if(t){t.pois=Math.max(t.pois,300);t.hp-=8;const p=P[o];if(p)p.hp=Math.min(T.HP,p.hp+8)}});});
DEFER(()=>{rx(7,9,'PHOTOSYNTHESIS',(x,y,o)=>{const p=P[o];if(p)p.hp=Math.min(T.HP,p.hp+12)});});
DEFER(()=>{rx(8,9,'ANNIHILATION',(x,y,o)=>{big('ANNIHILATION!','#fff',60);flash(.5,'#fff');shake=Math.min(50,shake+24);WAVES.push({x,y,t:24,T:24,spd:16,th:60,inv:1});xBoom(x,y,o,170,{dmg:20,kb:20,stun:40})});});
function xReact(a,b,x,y,o,t){if(!a||!b||a===b||RXN>=6||!isFinite(x)||!isFinite(y))return 0;const r=RX[Math.min(a,b)*10+Math.max(a,b)];if(!r)return 0;RXN++;
 txt(x,y-24,r[0]+'!',ELC9[a],16+(t?4:0));for(let i=0;i<10&&FX.length<500;i++){const g=Math.random()*TAU,s=1+Math.random()*3;FX.push({x,y,vx:Math.cos(g)*s,vy:Math.sin(g)*s,t:20,c:i%2?ELC9[a]:ELC9[b]})}
 RINGS.push({x,y,r:0,m:50,t:14,c:ELC9[b]});r[1](x,y,o,t||null);if(t&&t.hp<=0&&t.state!=='dead')ko(t,r[0]);return 1}
function xAura(t,e,o,x,y){if(!e)return;const au=auraOf(t);if(au&&au!==e&&xReact(e,au,x,y,o,t)){t.aura=null;return}t.aura={el:e,t:frame+240}} // aura élémentaire : le 2e élément déclenche la réaction
DEFER(()=>{{const C0=chBullet;chBullet=(b,t)=>{const r=C0(b,t);if((!r||b.yy||b.anni||b.pure)&&b.el&&!b.fake&&!b.rxD&&!b.flower){b.rxD=1;xAura(t,b.el,b.owner,t.x,t.y)}return r}}});
DEFER(()=>{{const H0=chHit;chHit=(v,a,dx,dy,m,mult,heavy)=>{if(a&&ally(a,v))return 1;if(a&&a!==v&&a.state==='atk'&&(v.mvEl||0)<frame){v.mvEl=frame+10;xAura(v,a.el,a.id,v.x,v.y)}return H0(v,a,dx,dy,m,mult,heavy)}}});
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{if(v.supc>frame)d*=1.5;return D0(v,a,d,heavy)}}});
DEFER(()=>{{const S0=chSpeed;chSpeed=p=>{let k=S0(p);if(p.slowT>frame)k*=.5;for(const e of ENT)if((e.k==='mud'||e.k==='blizz'||e.k==='sand')&&e.o!==p.id&&Math.hypot(p.x-e.x,p.y-e.y)<e.r){k*=e.k==='mud'?.4:.6;break}return k}}});
function chPre5(){RXN=0;
 for(const p of P){if(p.stk0!==undefined&&p.stocks>p.stk0&&p.state!=='dead')sfx('1up',.7);p.stk0=p.stocks;
  const a=p.lastIt&&ITEMEL[p.lastIt]&&Object.values(p.fx).some(v=>v>0);p.el=a?ITEMEL[p.lastIt]:SHOT_EL?SHOTEL[p.shotT]||0:0}
 if(frame%2)return; // contacts une image sur deux (performance)
 const G=new Map(),key=(x,y)=>((x/48|0)+1000)*4000+((y/48|0)+1000);
 for(const b of B){if(b.dead||b.fake)continue;if(b.el===undefined){b.el=b.elem!==undefined?[1,2,5,6,3,8,9][b.elem]:b.water?2:b.flower?7:b.yy||b.pure||b.star?9:b.dark||b.weird?8:b.note?5:b.coc?7:(P[b.owner]?P[b.owner].el:0)}
  if(!b.el||b.rxD)continue;const k=key(b.x,b.y);let c=G.get(k);if(!c)G.set(k,c=[]);c.push(b)}
 if(!G.size)return;
 for(const e of ENT){const el=ENTEL[e.k];if(!el||e.t<=0)continue;const R=e.r||(e.k==='qtree'||e.k==='tree'?40:24);
  for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++){const c=G.get(key(e.x+gx*48,e.y+gy*48));if(!c)continue;
   for(const b of c){if(b.dead||b.el===el||!(Math.hypot(b.x-e.x,b.y-e.y)<=R+b.r))continue; // balle contre élément du décor
    if(xReact(b.el,el,e.x,e.y,b.owner,null)){b.dead=1;if(b.el===1&&[3,7].includes(el)&&e.k!=='tree')e.t=0;else if(b.el===2&&el===1)e.t=0;else if(b.el===3&&e.k==='puddle'){e.k='iceb';e.t=300}}}}}
 for(const c of G.values())for(let i=0;i<c.length;i++){const a=c[i];if(a.dead||a.rxD)continue; // balle contre balle (même case)
  for(let j=i+1;j<c.length;j++){const b=c[j];if(b.dead||b.rxD||b.el===a.el||b.owner===a.owner||ally(P[a.owner],P[b.owner]))continue;if(!a.heavy&&!b.heavy&&rng()<.7)continue;
   if(Math.abs(a.x-b.x)<a.r+b.r+2&&Math.abs(a.y-b.y)<a.r+b.r+2){const hv=a.heavy?a:b;if(xReact(a.el,b.el,(a.x+b.x)/2,(a.y+b.y)/2,hv.owner,null)){a.dead=b.dead=1;break}}}}}
DEFER(()=>{{const U0=updEnt;updEnt=e=>{if(!['steam','mud','iceb','magma','blizz','whirl','sand','crystal'].includes(e.k))return U0(e);e.t--;const al=P.filter(q=>q.state!=='dead');
 switch(e.k){
 case'steam':for(const q of al)if(foeOf(e.o,q)&&Math.hypot(q.x-e.x,q.y-e.y)<e.r)q.hp-=.04;break;
 case'magma':for(const q of al)if(foeOf(e.o,q)&&q.inv<=0&&Math.hypot(q.x-e.x,q.y-e.y)<e.r){q.hp-=.25;q.burn=Math.max(q.burn,60);if(q.hp<=0)ko(q,'MAGMA')}break;
 case'blizz':for(const q of al)if(foeOf(e.o,q)&&Math.hypot(q.x-e.x,q.y-e.y)<e.r)q.hp-=.05;break;
 case'sand':for(const q of al)if(foeOf(e.o,q)&&Math.hypot(q.x-e.x,q.y-e.y)<e.r)q.hp-=.04;break;
 case'whirl':for(const q of al)if(foeOf(e.o,q)){const dx=e.x-q.x,dy=e.y-q.y,d=Math.hypot(dx,dy)||1;if(d<e.r){q.vx+=dx/d*.7;q.vy+=dy/d*.7;if(d<30&&(q.whCD||0)<frame){q.whCD=frame+30;q.hp-=6;q.flash=6}}}break;
 case'iceb':for(const q of al){const dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1,R=26+bodyR(q);if(d<R){q.x=e.x+dx/d*R;q.y=e.y+dy/d*R}}for(const b of B)if(!b.dead&&Math.abs(b.x-e.x)<26+b.r&&Math.abs(b.y-e.y)<26+b.r)b.dead=1;break;
 case'crystal':for(const q of al)if(Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+14){e.t=0;q.kshield=1;txt(q.x,q.y-40,'CRYSTAL SHIELD','#c09060',16);sfx('se_powerup',.5);break}break}}}});
function chDraw5(){
 for(const b of B)if(b.breaker&&!b.dead){const t=frame*.12,r=b.r;ctx.save();ctx.translate(b.x,b.y); // breaker : bulle noire hérissée, contour blanc qui pulse
  ctx.fillStyle='rgba(10,0,20,.85)';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<16;i++){const a=t+i*TAU/16,q=i%2?r*.7:r*1.25;ctx.lineTo(Math.cos(a)*q,Math.sin(a)*q)}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fff';ctx.globalAlpha=.6+.4*Math.sin(t*3);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.45,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-r*.3,-r*.3);ctx.lineTo(r*.3,r*.3);ctx.moveTo(r*.3,-r*.3);ctx.lineTo(-r*.3,r*.3);ctx.stroke();ctx.restore()}
 for(const e of ENT)switch(e.k){
  case'steam':ctx.globalAlpha=Math.min(.7,e.t/80);ctx.fillStyle='#e8eef8';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(e.x+Math.cos(i*1.7+frame*.02)*30,e.y+Math.sin(i*1.7+frame*.02)*24,e.r*.75,0,TAU);ctx.fill()}ctx.globalAlpha=1;break;
  case'mud':ctx.globalAlpha=.55;ctx.fillStyle='#5a4028';ctx.beginPath();ctx.ellipse(e.x,e.y,e.r,e.r*.7,0,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'magma':ctx.globalAlpha=.6;ctx.fillStyle=(frame>>3)%2?'#ff5030':'#ff8a30';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'blizz':ctx.globalAlpha=.25;ctx.fillStyle='#e0f6ff';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=1;for(let i=0;i<10;i++){const a=frame*.08+i,r=(frame*3+i*37)%e.r;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,2,0,TAU);ctx.stroke()}break;
  case'sand':ctx.globalAlpha=.45;ctx.fillStyle='#c0a070';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'whirl':ctx.strokeStyle='#3a8aff';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(e.x,e.y,30+i*40,frame*.15+i,frame*.15+i+4);ctx.stroke()}break;
  case'iceb':ctx.fillStyle='rgba(160,230,255,.8)';ctx.fillRect(e.x-26,e.y-26,52,52);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(e.x-26,e.y-26,52,52);break;
  case'crystal':ctx.fillStyle='#e0c090';ctx.beginPath();ctx.moveTo(e.x,e.y-16);ctx.lineTo(e.x+10,e.y);ctx.lineTo(e.x,e.y+16);ctx.lineTo(e.x-10,e.y);ctx.fill();break}
 for(const p of P){if(p.state==='dead')continue;const au=auraOf(p);
  if(au){ctx.strokeStyle=ELC9[au];ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+5,Math.PI*.2,Math.PI*.8);ctx.stroke();ctx.globalAlpha=1}
  if(p.el){ctx.fillStyle=ELC9[p.el];ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(ELN9[p.el],p.x,p.y+bodyR(p)+22)}
  if(TEAMS){ctx.fillStyle=TCOL[TEAMA[p.id]];ctx.beginPath();ctx.moveTo(p.x-6,p.y-bodyR(p)-20);ctx.lineTo(p.x+6,p.y-bodyR(p)-20);ctx.lineTo(p.x,p.y-bodyR(p)-12);ctx.fill()}}}

DEFER(()=>{{const mv=(k,t)=>{for(const g of GAMES){const i=g[1].indexOf(k);if(i>=0)g[1].splice(i,1)}GAMES.find(g=>g[0]===t)[1].push(k)};mv('freeze','EoSD');mv('world','EoSD');mv('oni','PCB');mv('elixir','IN');mv('camera','MoF');mv('bumpers','MoF');GAMES[0][0]='GENERIC';
 for(const[k,c]of[['freeze','Cirno'],['spark','Marisa Kirisame'],['oni','Suika Ibuki'],['camera','Aya Shameimaru'],['bumpers','Nitori Kawashiro'],['elixir','Fujiwara no Mokou']]){const i=ITEMS.find(i=>i.k===k);if(i&&!i.ch)i.ch=c}
 const ord={};GAMES.forEach((g,gi)=>g[1].forEach((k,i)=>ord[k]=gi*100+i));ITEMS.sort((a,b)=>(ord[a.k]??9999)-(ord[b.k]??9999))}}); // objets rangés par jeu
function laserFX(x,y,a,len,w,c,core='#fff',al=1,edge){if(w<.5||al<=0||len<=0)return;const lo=fxLow||perfLow;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.globalCompositeOperation='lighter'; // laser lumineux : halo en couches + cœur + reflets + étincelles
 for(const[k,o]of lo?[[1.4,.3],[1,.45]]:[[3.2,.06],[2.2,.12],[1.5,.22],[1,.4]]){ctx.globalAlpha=o*al;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-w*k*.35);ctx.lineTo(w*2,-w*k);ctx.lineTo(len,-w*k);ctx.lineTo(len,w*k);ctx.lineTo(w*2,w*k);ctx.lineTo(0,w*k*.35);ctx.fill()}
 ctx.globalAlpha=.95*al;ctx.fillStyle=core;ctx.beginPath();ctx.moveTo(0,-w*.15);ctx.lineTo(w*2,-w*.42);ctx.lineTo(len,-w*.42);ctx.lineTo(len,w*.42);ctx.lineTo(w*2,w*.42);ctx.lineTo(0,w*.15);ctx.fill();
 if(!lo){ctx.globalAlpha=.55*al;ctx.strokeStyle=core;ctx.lineWidth=Math.max(1,w*.07);for(const sg of[-1,1]){ctx.beginPath();for(let i=0;i<=len;i+=36)ctx.lineTo(i,sg*w*(.66+.14*Math.sin(i*.025+frame*.45*sg)));ctx.stroke()}
  ctx.fillStyle=core;const n=Math.min(48,len/50|0);for(let i=0;i<n;i++){const px=(i*137+frame*31)%len,py=Math.sin(i*12.9+frame*.27)*w*1.35;ctx.globalAlpha=(.5+.5*Math.sin(i+frame*.4))*al;ctx.fillRect(px,py-1,10+w*.18,2)}}
 if(edge){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*al;ctx.strokeStyle=edge;ctx.lineWidth=Math.max(3,w*.12);ctx.beginPath();ctx.moveTo(w*2,-w*1.05);ctx.lineTo(len,-w*1.05);ctx.moveTo(w*2,w*1.05);ctx.lineTo(len,w*1.05);ctx.stroke();ctx.globalCompositeOperation='lighter'} // contour du joueur qui a renvoyé
 const g=ctx.createRadialGradient(0,0,0,0,0,w*2.4);g.addColorStop(0,core);g.addColorStop(.35,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=al;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,w*2.4,0,TAU);ctx.fill();ctx.restore()}
function starPath(x,y,r,a){ctx.beginPath();for(let k=0;k<10;k++){const rr=k%2?r*.42:r,aa=a+k*Math.PI/5;ctx.lineTo(x+Math.cos(aa)*rr,y+Math.sin(aa)*rr)}ctx.closePath()}
function sparkFX(p){const L=2600,lo=fxLow||perfLow,hw=118+Math.sin(frame*.9)*7; // Master Spark façon Touhou : cœur blanc, flammes orange/rose, runes néon, étoiles
 const W=(x,k,ph=0)=>hw*k*(.35+.65*Math.min(1,x/300))*(1+.1*Math.sin(x*.02-frame*.5+ph)+.06*Math.sin(x*.057+frame*.8+ph*2)+.04*Math.sin(x*.13-frame*1.3));
 const band=(k,col,al,ph)=>{ctx.globalAlpha=al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);for(let x=0;x<=L;x+=40)ctx.lineTo(x,-W(x,k,ph));for(let x=L;x>=0;x-=40)ctx.lineTo(x,W(x,k,ph+1.7));ctx.closePath();ctx.fill()};
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spkA);ctx.globalCompositeOperation='lighter';
 if(!lo){band(1.45,'#ff2ab0',.22,0);band(1.25,'#ff40c8',.3,2)} // halo rose/magenta
 band(1.08,'#ff5a1a',.6,1);band(.9,'#ff9a30',.55,3);band(.72,'#ffd050',.5,4); // flammes orange → jaune
 band(.55,'#fff2c0',.6,5);band(.4,'#fff',.85,6); // cœur blanc brûlant
 const g=ctx.createRadialGradient(0,0,0,0,0,hw*1.6);g.addColorStop(0,'#fff');g.addColorStop(.45,'rgba(255,220,120,.9)');g.addColorStop(1,'rgba(255,60,180,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,hw*1.6,0,TAU);ctx.fill();
 ctx.globalCompositeOperation='source-over';if(!lo){const GL='マスタースパーク',NC=['#ff3ad0','#3affd0','#7cff3a','#ffe83a','#5ab0ff','#ff6a3a'];ctx.textAlign='center';ctx.textBaseline='middle'; // runes néon étirées, sur les bords
  for(let i=0;i<22;i++){const x=((i*173+frame*20)%(L-200))+60,side=i%2?1:-1,y=side*W(x,.7+((i*37)%55)/100,i),fl=.55+.45*Math.sin(frame*.7+i*2);ctx.save();ctx.translate(x,y);ctx.scale(.9,1.9);ctx.globalAlpha=fl;ctx.font='bold 16px monospace';ctx.fillStyle=NC[(i+(frame>>3))%NC.length];
   for(let c=0;c<5;c++)ctx.fillText(GL[(i*3+c+(frame>>4))%GL.length],0,(c-2)*15);ctx.restore()}}
 ctx.globalCompositeOperation='source-over';
 for(let i=0;i<(lo?14:40);i++){const t=(frame*.018+i*.137)%1,px=t*1700+(i*53)%120,py=Math.sin(i*7.7)*hw*(1.1+t*2.4),r=7+(i%5)*3; // étoiles arc-en-ciel
  ctx.globalAlpha=1-t*.7;ctx.fillStyle=RB[i%6];if(!lo&&i%3===0){ctx.globalAlpha*=.35;starPath(px,py,r*1.6,frame*.08+i);ctx.fill();ctx.globalAlpha=1-t*.7}starPath(px,py,r,frame*.08+i);ctx.fill();ctx.shadowBlur=0}
 ctx.restore();ctx.globalAlpha=1}
function spellCircle(q){const c=COLS[q.id],hu=hexHue(c),r=bodyR(q)*2.4+30+Math.sin(frame*.12)*3,a=frame*.025*(q.id%2?-1:1),hs=(d,l,al)=>`hsla(${(hu+d+360)%360},100%,${l}%,${al})`;ctx.save();ctx.translate(q.x,q.y);ctx.globalCompositeOperation='lighter';
 const g=ctx.createRadialGradient(0,0,r*.3,0,0,r*1.35);g.addColorStop(0,'hsla(0,0%,0%,0)');g.addColorStop(.7,hs(0,60,.16));g.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.35,0,TAU);ctx.fill();
 ctx.rotate(a);ctx.strokeStyle=hs(0,65,.25);ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.strokeStyle=hs(10,80,.9);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,r*.8,0,TAU);ctx.stroke();
 ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<36;k++){const aa=k*TAU/36,l=k%3?.9:.82;ctx.moveTo(Math.cos(aa)*r*l,Math.sin(aa)*r*l);ctx.lineTo(Math.cos(aa)*r*.97,Math.sin(aa)*r*.97)}ctx.stroke();
 ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=hs(30,85,.8);const GL='風火水雷光速力夢';for(let k=0;k<8;k++){const aa=k*TAU/8+TAU/16;ctx.save();ctx.rotate(aa);ctx.translate(0,-r*.885);ctx.fillText(GL[(k+(frame>>5))%8],0,0);ctx.restore()}
 ctx.rotate(-a*2.4);ctx.strokeStyle=hs(-15,75,.85);ctx.lineWidth=1.6;ctx.beginPath();for(let k=0;k<=140;k++){const aa=k*TAU/140,w=r*(.62+.1*Math.sin(aa*7+frame*.1)*Math.cos(aa*2-frame*.03));ctx.lineTo(Math.cos(aa)*w,Math.sin(aa)*w)}ctx.stroke();ctx.setLineDash([6,8]);ctx.beginPath();ctx.arc(0,0,r*.5,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(0,0,r*.3,0,TAU);ctx.stroke();
 ctx.fillStyle=hs(20,90,.95);for(let k=0;k<7;k++){const aa=k*TAU/7-Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(aa)*r*.76,Math.sin(aa)*r*.76,2.6,0,TAU);ctx.fill()}
 ctx.rotate(a*3.4);for(let k=0;k<4;k++){const aa=k*TAU/4;ctx.globalAlpha=.6+.4*Math.sin(frame*.2+k);ctx.beginPath();ctx.arc(Math.cos(aa)*r*1.12,Math.sin(aa)*r*1.12,3,0,TAU);ctx.fill()}ctx.restore()}
function koBeam(k,w,len,f){const lo=fxLow||perfLow,hu=k.hu!==undefined?k.hu:(k.hu=hexHue(k.c)),hs=(d,l)=>`hsl(${(hu+d+360)%360},100%,${l}%)`,al=Math.min(1,f*3);if(w<1)return;
 const Wd=(x,m,ph)=>w*m*(.45+.55*Math.min(1,x/200))*(1+.09*Math.sin(x*.018-frame*.8+ph)+.05*Math.sin(x*.051+frame*1.2+ph*2)+.03*Math.sin(x*.14-frame*2));
 const band=(m,col,a,ph)=>{ctx.globalAlpha=a*al;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);for(let x=0;;x+=40){const X=Math.min(x,len);ctx.lineTo(X,-Wd(X,m,ph));if(X>=len)break}for(let x=len;;x-=40){const X=Math.max(x,0);ctx.lineTo(X,Wd(X,m,ph+1.9));if(X<=0)break}ctx.closePath();ctx.fill()};
 ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a);ctx.globalCompositeOperation='lighter';
 if(!lo){band(1.7,hs(-30,40),.16,0);band(1.38,hs(-12,48),.24,2)}band(1.1,hs(0,52),.55,1);band(.9,hs(14,62),.5,3);band(.7,hs(26,74),.5,4);band(.52,hs(10,90),.6,5);band(.36,'#fff',.9,6);
 if(!lo){ctx.lineWidth=2.5;for(const sg of[-1,1]){ctx.strokeStyle=hs(40,82);ctx.globalAlpha=.65*al;ctx.beginPath();for(let x=0;x<=len;x+=24)ctx.lineTo(x,sg*Math.sin(x*.016-frame*.55)*Wd(x,.82,0));ctx.stroke()}
  ctx.strokeStyle=hs(-20,85);ctx.lineWidth=1.8;const fr=frame>>1;for(let i=0;i<8;i++){const x0=hz(i,fr)*Math.max(1,len-200),sg=i%2?1:-1;ctx.globalAlpha=(.4+.5*hz(i,fr+7))*al;ctx.beginPath();for(let j=0;j<=7;j++){const x=x0+j*26;ctx.lineTo(x,sg*(Wd(x,1.12,0)+(hz(i*9+j,fr)-.5)*26))}ctx.stroke()}
  ctx.lineWidth=3;ctx.strokeStyle=hs(0,70);for(let i=0;i<6;i++){const px=((70-k.t)*45+i*560)%Math.max(1,len);ctx.globalAlpha=.45*f;ctx.beginPath();ctx.ellipse(px,0,16,Wd(px,1.5,0),0,0,TAU);ctx.stroke()}
  ctx.fillStyle='#fff';for(let i=0;i<36;i++){const px=(i*157+frame*38)%Math.max(1,len),py=Math.sin(i*12.9+frame*.21)*Wd(px,1.3,i);ctx.globalAlpha=(.4+.5*Math.sin(i+frame*.5))*al;ctx.fillRect(px,py-1,14+w*.15,2)}}
 if(k.edge){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.9*al;ctx.strokeStyle=k.edge;ctx.lineWidth=Math.max(3,w*.1);ctx.beginPath();ctx.moveTo(w*2,-w*1.15);ctx.lineTo(len,-w*1.15);ctx.moveTo(w*2,w*1.15);ctx.lineTo(len,w*1.15);ctx.stroke();ctx.globalCompositeOperation='lighter'}
 const g=ctx.createRadialGradient(0,0,0,0,0,w*2.3);g.addColorStop(0,'#fff');g.addColorStop(.4,hs(15,70));g.addColorStop(1,'hsla(0,0%,0%,0)');ctx.globalAlpha=al;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,w*2.3,0,TAU);ctx.fill();
 if(k.len!==undefined){const e=ctx.createRadialGradient(len,0,0,len,0,w*1.8);e.addColorStop(0,'#fff');e.addColorStop(.35,hs(20,70));e.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=e;ctx.beginPath();ctx.arc(len,0,w*1.8,0,TAU);ctx.fill()}
 ctx.restore();ctx.save();ctx.globalAlpha=.8*al;magicCircle(k.x,k.y,w*1.05,frame*.09,hs(20,80));magicCircle(k.x,k.y,w*.65,-frame*.14,'#fff');ctx.restore();ctx.globalAlpha=1}
function magicCircle(x,y,r,a,c){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.72,0,TAU);ctx.stroke();
 ctx.beginPath();for(let k=0;k<=96;k++){const aa=k*TAU/96,w=r*(.5+.12*Math.sin(aa*6+frame*.08));ctx.lineTo(Math.cos(aa)*w,Math.sin(aa)*w)}ctx.stroke();ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,r*1.12,k*TAU/3-a*2,k*TAU/3-a*2+.9);ctx.stroke()}ctx.lineWidth=2;for(let k=0;k<6;k++){const aa=k*TAU/6,c1=Math.cos(aa),s1=Math.sin(aa),px=-s1,py=c1;ctx.beginPath();ctx.moveTo(c1*r*.95+px*6,s1*r*.95+py*6);ctx.lineTo(c1*r*.8,s1*r*.8);ctx.lineTo(c1*r*.95-px*6,s1*r*.95-py*6);ctx.stroke()}for(let k=0;k<12;k++){const aa=k*TAU/12;ctx.fillStyle=c;ctx.fillRect(Math.cos(aa)*r*.86-2,Math.sin(aa)*r*.86-2,4,4)}ctx.restore()}

function fireBeam(x,y,a,o,col,edge,dep){ // rayon de KO : traverse ; s'arrête et rebondit sur celui qui le pare (à l'infini)
 const kf={x,y,a,t:70,c:col,edge};KOFX.push(kf);const c=Math.cos(a),s=Math.sin(a),own=P[o];
 const L=P.filter(q=>q.id!==o&&q.state!=='dead'&&q.inv<=0&&!ally(own,q)).map(q=>{const rx=q.x-x,ry=q.y-y;return{q,d:rx*c+ry*s,e:Math.abs(ry*c-rx*s)}}).filter(h=>h.d>0&&h.e<70+T.BODY_R).sort((u,v)=>u.d-v.d);
 for(const{q,d}of L){if((parryOn(q)||frame-q.pStart<=T.BEAM_PARRY)&&dep<30){kf.len=d;q.state='idle';parryFx(q,Math.min(7,dep+1));big(dep?'REFLECTED x'+(dep+1)+'!':'BEAM PARRIED!','#6ff',50);
   Object.assign(q,{state:'hitstun',t:400,spit:2,beamPip:1,thrownBy:o,vx:c*28,vy:s*28,charging:false});sfx('katanazeroreflect',.8); // éjecté au bord (le pip saute au contact du mur)
   const ra=q.in&&Math.hypot(q.in.x,q.in.y)>.3?Math.atan2(q.in.y,q.in.x):dep?q.aim:-Math.PI/2; // renvoyé dans la direction du stick
   q.pStart=-999;KOB.push({o:q.id,x:q.x,y:q.y,a:ra,t:40,T:40,col,edge:COLS[q.id],dep:dep+1});return} // le rayon renvoyé se recharge 0,7 s : la cible peut le parer à son tour
  hit(q,own||q,c,s,IM.beam,1,true)}}


function xShieldBreak(o,a){if(o.state==='dead')return;Object.assign(o,{state:'parrystun',t:110,vx:0,vy:0,charging:false});o.inv=0;big('SHIELD BREAK!','#fff',60);sfx('shield-break');sfx('shieldbreaketoiles',.6);
 shake=Math.min(50,shake+20);flash(.3,'#fff');chroma=Math.max(chroma,30);for(let i=0;i<10;i++)FX.push({x:o.x,y:o.y,vx:Math.cos(i*TAU/10)*3,vy:Math.sin(i*TAU/10)*3,t:30,c:'#ffd23a'});WAVES.push({x:o.x,y:o.y,t:16,T:16,spd:12,th:30,inv:1});o.sbT=frame+110}
