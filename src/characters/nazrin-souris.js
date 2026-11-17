'use strict';
// ---- Nazrin : souris sentinelles, rappel, cône, pièce explosive
const mouseD=(x,y,a,al)=>{ctx.globalAlpha=al;ctx.fillStyle='#9a9aa8';ctx.beginPath();ctx.ellipse(x,y,8,5.5,a,0,TAU);ctx.fill();const hx=x+Math.cos(a)*7,hy=y+Math.sin(a)*7;ctx.beginPath();ctx.arc(hx,hy,4,0,TAU);ctx.fill();ctx.fillStyle='#ffb0c0';for(const s of[-1,1]){ctx.beginPath();ctx.arc(hx-Math.sin(a)*s*4-Math.cos(a)*2,hy+Math.cos(a)*s*4-Math.sin(a)*2,2.4,0,TAU);ctx.fill()}ln(x-Math.cos(a)*7,y-Math.sin(a)*7,x-Math.cos(a)*16+Math.sin(frame*.3)*3,y-Math.sin(a)*16,'#ffb0c0',1.5);ctx.globalAlpha=1};
DEFER(()=>{EST.nms=(e,o)=>{let tx=null,ty=null;const tg=o.chTgF>frame?P[o.chTg]:null;if(tg&&tg.state!=='dead'){tx=tg.x;ty=tg.y}else if(o.focus){tx=o.x+Math.cos(o.aim)*160+Math.cos(e.i)*18;ty=o.y+Math.sin(o.aim)*160+Math.sin(e.i)*18}
 if(tx!==null){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d>3){const s=Math.min(d,tg?4.5:3.5);e.x+=dx/d*s;e.y+=dy/d*s;e.a=Math.atan2(dy,dx)}}
 for(const q of P)if(foeQ(o,q)&&!((e.hc[q.id]||0)>frame)&&Math.hypot(q.x-e.x,q.y-e.y)<10+bodyR(q)){e.hc[q.id]=frame+40;chHitQ(o,q,q.x-e.x,q.y-e.y,2,3,10)}};});
DEFER(()=>{EDR.nms=e=>mouseD(e.x,e.y,e.a||e.i,e.t<60&&(frame>>2)%2?.4:1);});
DEFER(()=>{EST.nrc=(e,o)=>{const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy)||1;if(d<20){e.t=0;return}e.x+=dx/d*9;e.y+=dy/d*9;e.a=Math.atan2(dy,dx);
 for(const q of P)if(foeQ(o,q)&&!((e.hc[q.id]||0)>frame)&&Math.hypot(q.x-e.x,q.y-e.y)<10+bodyR(q)){e.hc[q.id]=frame+99;chHitQ(o,q,dx,dy,3,5,14)}};});
DEFER(()=>{EDR.nrc=e=>mouseD(e.x,e.y,e.a||0,1);});
DEFER(()=>{EDR.ncn=e=>{ctx.globalAlpha=e.t/16*.45;ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.arc(e.x,e.y,420,e.a-.5,e.a+.5);ctx.closePath();ctx.fill();ctx.globalAlpha=1};});
DEFER(()=>{EST.ncoin=(e,o)=>{const u=1-e.t/e.T;e.x=e.x0+(e.tx-e.x0)*u;e.y=e.y0+(e.ty-e.y0)*u;if(e.t!==1)return;for(const q of P)if(foeQ(o,q)){const dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1;if(d<70+bodyR(q))chHitQ(o,q,dx/d,dy/d,10,13,34)}burst(e.x,e.y,'#ffd23a',22);shake=Math.min(28,shake+6);sfx('se_enep01',.7)};});
DEFER(()=>{EDR.ncoin=e=>{const u=1-e.t/e.T,h=Math.sin(u*Math.PI)*50;ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.ellipse(e.x,e.y-h,8,8*Math.abs(Math.cos(frame*.3)),0,0,TAU);ctx.fill();ctx.strokeStyle='#a07a10';ctx.lineWidth=2;ctx.stroke()};});
DEFER(()=>{{const N0=EST.npd;EST.npd=(e,o)=>{N0(e,o);for(const s of ENT)if(s.k==='nms'&&s.o===e.o&&s.t>0&&Math.hypot(s.x-e.x,s.y-e.y)<(e.big?30:18)){s.t=0;const q=nearFoe(e.o,s.x,s.y,900),a=q?Math.atan2(q.y-s.y,q.x-s.x):e.a;xBall(o,s.x,s.y,a,9,6,{dmg:6,kb:7,stun:20,arm:0},{c:'#c8c8d8',life:80});sfx('se_cat00',.5)}}}});

let CHR;DEFER(()=>{CHR=[
{k:'reimu',name:'Reimu',col:'#ff3a4a',spd:1,din:1,dout:1,role:'All-rounder · Yin-yang orbs + Borders',
 d:'SHOT: twin amulets + yin-yang options firing homing amulets. HEAVY (neutral, HOLD): 1 / 2 / 4 bouncing yin-yang orbs. FOCUS (4 s max): orbs turn to spirit and come to you, an arrow follows your stick, release = launch. DASH = teleport. SKILL 1: Cautionary Border blocks shots and stuns foes who melee inside it (5 s, 15 s cooldown). Dash cooldown 0.35 s.',
 cd:7,shot(p,a,f,pm,lv){const c=Math.cos(a),s=Math.sin(a);for(const o of[-10,10]){const b=chB(p,a,14,pm*.35,4,60);if(b){b.x-=s*o;b.y+=c*o;b.c='#ff5060';b.ofu=1}}
  for(let i=0;i<lv;i++){const[x,y]=rOpt(p,i,lv,f),b=lb(p,a,8,pm*.3,4,120);if(b){b.x=x+c*8;b.y=y+s*8;b.home=.06;b.c='#ffffff';b.ofu=1}}},
 heavy:{N:(p,m,a,k)=>rOrbs(p,1),
  F:(p,m,a,k)=>{for(let i=-2;i<=2;i++){spawnH(p,m,a+i*.09,k,{spd:10+Math.abs(i)*.6,r:8,k:.38});const b=B[B.length-1];if(b&&b.owner===p.id)b.c='#b04aff'}},
  B:(p,m,a,k)=>{for(const o of[-.5,0,.5]){spawnH(p,m,a+o,k,{spd:4,r:14,k:.45,life:200});const b=B[B.length-1];if(b&&b.owner===p.id){b.spl=frame+28;b.c='#8ab0ff'}}}},
 melee:{jab:{start:5,act:5,rec:12,range:48,arc:2.6,dmg:6,kb:6,stun:22},
  lunge:{start:6,act:8,rec:18,range:38,arc:1.2,dmg:8,kb:10,stun:28,move:13},
  strong:{start:5,act:8,rec:28,range:52,arc:6.2832,dmg:13,kb:18,stun:40,charge:40},
  dashatk:{start:2,act:6,rec:16,range:50,arc:2.2,dmg:8,kb:10,stun:26,keep:.5}},
 spell:{name:'Spirit Sign「Fantasy Seal」',loop:90,fn(p,o,k){if(k%45===0)for(let i=0;i<7;i++){const b0=B.length;addB(p,i*TAU/7,4.5,1,MOVES.heavyN,240);const b=B[b0];if(b){b.home=.035;b.c=RB[i%6]}}}},
 inp(p,o,I){const h=!!I.b.heavy,e=h&&!p.rHp;p.rHp=h;if(p.rG&&Math.hypot(I.x,I.y)>.3)p.rA=Math.atan2(I.y,I.x);
  if(p.rC>0){if(p.state!=='idle'){p.rC=0;return I}
   if(h){p.rC++;if(p.rC===25||p.rC===55){sfx('charge',.4);RINGS.push({x:p.x,y:p.y,r:0,m:p.rC>50?60:40,t:12,c:'#ff9aa8'})}return{x:I.x*.55,y:I.y*.55,b:{...I.b,heavy:false,shot:false}}}
   rOrbs(p,p.rC<25?1:p.rC<55?2:4);p.rC=0;p.shotCd=Math.max(p.shotCd,14);return{...I,b:{...I.b,heavy:false}}}
  if(e&&p.state==='idle'&&rel(I,p)==='N'&&!(p.rifle>0)&&!(p.cam>0)&&!(p.fx.gung>0)){p.rC=1;return{...I,b:{...I.b,heavy:false}}}
  return I},
 special(p){},
 special2(p){if(!cd2(p,900))return txt(p.x,p.y-40,'BORDER '+Math.ceil((p.chC2-frame)/60)+'s','#888',13);for(const e of ENT)if(e.k==='rbar'&&e.o===p.id)e.t=0;const a=p.aim;ENT.push({k:'rbar',o:p.id,t:300,x:p.x+Math.cos(a)*58,y:p.y+Math.sin(a)*58,a:a+Math.PI/2,w:62,h:18,hc:{}});sfx('blockshield',.9);RINGS.push({x:p.x+Math.cos(a)*58,y:p.y+Math.sin(a)*58,r:0,m:80,t:14,c:'#7cc8ff'})},
 tick(p){
  for(const b of B)if(b.spl&&b.owner===p.id&&!b.dead&&frame>=b.spl){b.dead=1;for(let i=0;i<6;i++)xBall(p,b.x,b.y,i*TAU/6+frame*.1,3.4,5,{dmg:3,kb:3,stun:12,arm:0},{c:'#9ab4ff',life:110})}
  const foe=q=>q!==p&&q.state!=='dead'&&q.inv<=0&&foeOf(p.id,q),
   os=ENT.filter(e=>e.k==='ryy'&&e.o===p.id&&e.t>0),bars=ENT.filter(e=>e.k==='rbar'&&e.o===p.id&&e.t>0),
   inS=(z,x,y,r)=>{const c=Math.cos(z.a),s=Math.sin(z.a),u=(x-z.x)*c+(y-z.y)*s,v=-(x-z.x)*s+(y-z.y)*c;return Math.abs(u)<z.w+r&&Math.abs(v)<z.h+r?(v||1e-3):0};
  if(!p.focus)p.rGW=0;
  if(p.rG){const out=frame-p.rGT>=240;if(!p.focus||out||!os.length||p.state==='spell'){for(const e of os){e.vx=Math.cos(p.rA)*6.5;e.vy=Math.sin(p.rA)*6.5;e.g=0;e.t=Math.max(e.t,240);e.hc={}}p.rG=0;p.rGC=frame+60;if(out)p.rGW=1;if(os.length){sfx('tan00',.6);RINGS.push({x:p.x,y:p.y,r:0,m:50,t:12,c:'#fff'})}}}
  else if(p.focus&&!p.rGW&&frame>=(p.rGC||0)&&os.length&&p.state!=='spell'){p.rG=1;p.rGT=frame;p.rA=p.aim;sfx('se_kira00',.4)}
  const ghost=!!p.rG;
  os.forEach((e,i)=>{e.g=ghost;
   if(ghost){const n=os.length,ra=n>1?34:0,tx=p.x+Math.cos(p.aim)*70+Math.cos(i*TAU/n+frame*.05)*ra,ty=p.y+Math.sin(p.aim)*70+Math.sin(i*TAU/n+frame*.05)*ra;e.x+=(tx-e.x)*.1;e.y+=(ty-e.y)*.1;return}
   e.x+=e.vx;e.y+=e.vy;const r=e.r;
   if(e.x<r){e.x=r;e.vx=Math.abs(e.vx)}else if(e.x>T.MAP_W-r){e.x=T.MAP_W-r;e.vx=-Math.abs(e.vx)}
   if(e.y<r){e.y=r;e.vy=Math.abs(e.vy)}else if(e.y>T.MAP_H-r){e.y=T.MAP_H-r;e.vy=-Math.abs(e.vy)}
   for(const z of bars)if(!(e.bc>frame)&&inS(z,e.x,e.y,r)){const q=nearFoe(p.id,e.x,e.y,900),sp=Math.min(10,Math.hypot(e.vx,e.vy)*1.4),a2=q?Math.atan2(q.y-e.y,q.x-e.x):Math.atan2(e.vy,e.vx)+Math.PI;e.vx=Math.cos(a2)*sp;e.vy=Math.sin(a2)*sp;e.bc=frame+20;RINGS.push({x:e.x,y:e.y,r:0,m:40,t:12,c:'#9fe0ff'});sfx('shoot3',.4)}
   if(Math.hypot(e.vx,e.vy)>4.6){e.vx*=.995;e.vy*=.995}
   for(const b of B)if(!b.dead&&!b.heavy&&b.owner!==p.id&&!(TEAMS&&ally(P[b.owner],p))&&Math.abs(b.x-e.x)<r+b.r&&Math.hypot(b.x-e.x,b.y-e.y)<r+b.r)b.dead=1;
   for(const q of P){if(!foe(q)||(e.hc[q.id]||0)>frame)continue;const dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1;if(d>r+bodyR(q))continue;e.hc[q.id]=frame+30;
    const s2=Math.hypot(e.vx,e.vy);e.vx=-dx/d*s2;e.vy=-dy/d*s2;if(parryOn(q)){parryFx(q);continue}hit(q,p,dx/d,dy/d,{dmg:8,kb:9,stun:26},1,true);burst(e.x,e.y,'#ff3a4a',8)}});
  for(const z of bars){for(const b of B)if(!b.dead&&b.owner!==p.id&&!(TEAMS&&ally(P[b.owner],p))&&inS(z,b.x,b.y,b.r)){b.dead=1;spark(b.x,b.y);z.fl=frame}
   for(const q of P)if(foe(q)&&q.state==='atk'&&q.mv&&!q.mv.spd&&q.t>=q.mv.start&&!((z.hc[q.id]||0)>frame)&&inS(z,q.x,q.y,bodyR(q)+q.mv.range*.8)){z.hc[q.id]=frame+90;z.fl=frame;hit(q,p,0,0,{dmg:2,kb:0,stun:75},1,true);q.mv=null;txt(q.x,q.y-34,'STUN!','#7cc8ff',16);burst(q.x,q.y,'#7cc8ff',16);sfx('shield-break',.7)}}
  for(const z of ENT)if(z.k==='rbnd'&&z.o===p.id&&z.t>0&&!z.hit){const q=P[z.tg];if(!q||q.state==='dead'){z.t=0;continue}const d=110*z.t/z.T,c=Math.cos(z.a),s=Math.sin(z.a),u=(q.x-z.x)*c+(q.y-z.y)*s,v=-(q.x-z.x)*s+(q.y-z.y)*c,R=bodyR(q);
   if(Math.abs(v)<48&&Math.abs(u)<d+R&&Math.abs(u)>d-R-4&&q.inv<=0){z.hit=1;z.t=Math.min(z.t,10);if(parryOn(q))parryFx(q);else{const sg=u<0?1:-1;hit(q,p,c*sg,s*sg,{dmg:11,kb:3,stun:42},1,true);burst(q.x,q.y,'#ff9aa8',16);sfx('shield-break',.6)}}}},
 cpu(p,o,I,d){if(p.rC>0)I.b.heavy=p.rC<58;
  if((p.chC2||0)<=frame&&B.filter(b=>!b.dead&&b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<140).length>=7)I.b.prev=true},
 draw(q,R){const t=frame*.05,lv=Math.max(1,Math.min(4,q.power|0));ctx.fillStyle='#ff3a4a';for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(q.x,q.y-R*.9);ctx.lineTo(q.x+s*R*1.15,q.y-R*1.55);ctx.lineTo(q.x+s*R*1.05,q.y-R*.75);ctx.fill()}
  if(q.state!=='spell')for(let i=0;i<lv;i++){const[x,y]=rOpt(q,i,lv,q.focus);rYY(x,y,5.5,t*4+i,.95)}
  rMel(q,R);
  if(q.rC>0){const n=q.rC<25?1:q.rC<55?2:4,f=Math.min(1,q.rC/55);ctx.strokeStyle=n>2?'#fff':'#ff9aa8';ctx.lineWidth=2;ctx.globalAlpha=.5+.3*Math.sin(frame*.5);ctx.beginPath();ctx.arc(q.x,q.y,R*2.6-f*R,0,TAU);ctx.stroke();ctx.globalAlpha=1;
   for(let i=0;i<n;i++){const a=t*3+i*TAU/n;rYY(q.x+Math.cos(a)*R*1.8,q.y+Math.sin(a)*R*1.8,5,a,1)}}
  if(q.rG){const os=ENT.filter(e=>e.k==='ryy'&&e.o===q.id&&e.t>0);if(os.length){let cx=0,cy=0;for(const e of os){cx+=e.x;cy+=e.y}cx/=os.length;cy/=os.length;const a=q.rA,L=34,c=Math.cos(a),s=Math.sin(a),x2=cx+c*(L+18),y2=cy+s*(L+18);
   ctx.lineCap='round';for(const[w,col]of[[7,'#7a0010'],[3.5,'#fff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(cx+c*18,cy+s*18);ctx.lineTo(x2,y2);ctx.moveTo(x2-c*11-s*8,y2-s*11+c*8);ctx.lineTo(x2,y2);ctx.lineTo(x2-c*11+s*8,y2-s*11-c*8);ctx.stroke()}ctx.lineCap='butt';
   const k=1-(frame-q.rGT)/240;ctx.strokeStyle=k<.25&&(frame>>2)%2?'#ff4060':'#fff';ctx.lineWidth=3;ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(q.x,q.y,R*1.9,-Math.PI/2,-Math.PI/2+TAU*Math.max(0,k));ctx.stroke();ctx.globalAlpha=1}}}},
...CHR7]});
DEFER(()=>{CHR.forEach((c,i)=>{SHOTS.push({name:c.name,cd:c.cd,f:c.shot});HEAVY.push(c.heavy);MELEE.push(c.melee||{});c.spI=SPELLS.length;SPELLS.push(c.spell)});});
let CHL;DEFER(()=>{CHL=CHR.map((c,i)=>CH0+i)});
// attribution au départ : choix du joueur (écran de sélection) sinon perso par défaut ; spell du perso
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);if(mode==='game'&&!(typeof TUT!=='undefined'&&TUT)){P.forEach((p,i)=>{if(p.shotT<CH0)p.shotT=p.cpu?CHL[(seed+i*3)%CHL.length]:CHL[i%CHL.length];const c=chOf(p);if(c){p.spI=c.spI;c.init&&c.init(p)}})}return r}}});
// Next / Prev : mécanique du perso (pendant les 2 premières secondes : changer de perso, utile en ligne)
DEFER(()=>{{const U0=updP;updP=(p,o,I)=>{const c=chOf(p);if(I&&I.b&&(I.b.burst||I.b.spell!==undefined)){if(typeof TUT==='object'&&TUT&&!p.cpu){if(I.b.prev)TUT.s1=1;if(I.b.next||I.b.burst)TUT.s2=1}if(I.b.burst)I={x:I.x,y:I.y,b:{...I.b,next:true,burst:false}};if(p.state==='hitstun'&&I.b.spell&&!p.spHv&&p.spirit>=T.SPELL_COST){p.state='idle';startSpell(p,o)}p.spHv=!!I.b.spell}if(c&&I&&I.b&&p.state!=='dead'){if(c.inp)I=c.inp(p,o,I);const nx=!!I.b.next,pv=!!I.b.prev,en=nx&&!p.chPN,ep=pv&&!p.chPP;p.chPN=nx;p.chPP=pv;
  if(en||ep){if(frame<120&&p.state==='idle'){const j=CHL.indexOf(p.shotT),k=CHL[(j+(en?1:CHL.length-1))%CHL.length];p.shotT=k;const c2=chOf(p);p.spI=c2.spI;c2.init&&c2.init(p);txt(p.x,p.y-34,c2.name,LCOLS[p.id],14);sfx('move',.7)}
   else if(p.state!=='spell'){if(ep&&c.special2)c.special2(p);else c.special(p)}}
  I={x:I.x,y:I.y,b:{...I.b,next:false,prev:false}}}return U0(p,o,I)}}});
// tick de chaque perso (seulement quand la partie avance vraiment)
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0)return;for(const p of P){const c=chOf(p);if(c&&c.tick&&p.state!=='dead')c.tick(p)}chStep();
 for(const e of ENT)if(e.k==='nufo'){const o=P[e.o];if(!o||o.state==='dead'){e.t=0;continue}e.y+=Math.sin(frame*.05+e.x)*.4;for(const b of B)if(!b.dead&&!b.heavy&&b.owner!==e.o&&Math.hypot(b.x-e.x,b.y-e.y)<22){b.dead=1;if(--e.hp<=0){e.t=0;burst(e.x,e.y,'#9a6aff',14);sfx('break',.5)}}
  if(--e.cd<=0){const q=nearFoe(e.o,e.x,e.y,700);e.cd=Math.max(20,40-(o.chS|0)*4);if(q){const a=Math.atan2(q.y-e.y,q.x-e.x);for(const da of[-.18,0,.18])xBall(o,e.x,e.y,a+da,4.2,7,{dmg:3.5,kb:5,stun:16,arm:0},{c:'#9a6aff',life:200});sfx('shoot3',.25)}}}
 for(const b of B)if(b.wav&&!b.dead){const s=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx)+Math.sin(frame*.25+(b.ph||0))*b.wav;b.vx=Math.cos(a)*s;b.vy=Math.sin(a)*s}
 for(const b of B)if(b.mouse&&!b.dead){const o=P[b.owner],q=o&&o.chTg!==undefined&&o.chTgF>frame?P[o.chTg]:null;b.home=q&&q.state!=='dead'?.09:.03}}}});
// effets des balles des persos : saisons d'Okina, cible de sourcier de Nazrin, cage de Flandre
DEFER(()=>{{const C0=chBullet;chBullet=(b,t)=>{const o=P[b.owner];if(b.fake){b.dead=1;return 1}if(o&&b.lp&&!b.heavy){const H=b.hitT||(b.hitT={});if(H[t.id])return 1;H[t.id]=1;t.hp-=chDmg(t,o,b.dmg,false);t.flash=3;sfxDmg(t);if(t.hp<=0)ko(t,'K.O.');return 1}if(o&&b.sea){const s=b.sea-1;if(s===0)o.hp=Math.min(T.HP,o.hp+.35);else if(s===2){const l=Math.hypot(b.vx,b.vy)||1;t.vx+=b.vx/l*1.6;t.vy+=b.vy/l*1.6}else if(s===3)t.slowT=Math.max(t.slowT||0,frame+45);o.chG=Math.min(100,(o.chG||0)+2.2)}
 if(o&&b.dows){o.chTg=t.id;o.chTgF=frame+120}return C0(b,t)}}});
DEFER(()=>{{const H0=hit;hit=(v,a,dx,dy,m,mult,heavy)=>{const hp=v.hp;const r=H0(v,a,dx,dy,m,mult,heavy);if(a&&a!==v&&v.hp<hp){const c=chOf(a);if(c&&a.shotT===CH0+5)a.chG=Math.min(100,(a.chG||0)+(hp-v.hp)*.8);if(c&&c.onMelee&&!heavy)c.onMelee(a);if(c&&c.onHit)c.onHit(a,v,heavy)}return r}}});
// stats : vitesse, dégâts infligés / subis, mêlée modifiée par le mode
DEFER(()=>{{const S0=chSpeed;chSpeed=p=>{let k=S0(p);const c=chOf(p);if(c){k*=c.spd*(c.spdM?c.spdM(p):1);if(c.k==='marisa'&&p.chT>frame)k*=.4}return k}}});
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{const cv=chOf(v),ca=a&&a!==v?chOf(a):null;if(ca)d*=ca.dout*(ca.doutM?ca.doutM(a,v,heavy):1);if(cv)d*=cv.din*(cv.dinM?cv.dinM(v):1);return D0(v,a,d,heavy)}}});
DEFER(()=>{{const A0=startAtk;startAtk=(p,n)=>{const r=A0(p,n);const c=chOf(p),M=c&&c.mel&&c.mel(p);if(M&&p.mv&&p.state==='atk'&&p.mv.range)p.mv={...p.mv,range:p.mv.range*M.range,dmg:p.mv.dmg*M.dmg};return r}}});
// tir bloqué pendant la barrière de Reimu
DEFER(()=>{{const F0=fireLight;fireLight=p=>{const c=chOf(p);if(c&&c.blockShot&&c.blockShot(p))return;return F0(p)}}});
// IA : plus de changement de type de tir ; utilise la mécanique de son perso
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const I=C0(p,o),c=chOf(p);if(c){I.b.next=false;I.b.prev=false;if(p.ai)p.ai.want=undefined;if(o&&frame>=120&&p.state!=='dead'&&p.state!=='spell')c.cpu&&c.cpu(p,o,I,Math.hypot(o.x-p.x,o.y-p.y))}return I}}});
// dessin : emblème de chaque perso par-dessus son corps + OVNI de Nue
DEFER(()=>{{const D0=drawP;drawP=q=>{D0(q);const c=chOf(q);if(!c||q.state==='dead'||q.state==='eaten'||CX.anon>0||q.fx.koishi>0||q.fx.under>0)return;ctx.save();const ro=reisOff(q);if(ro)ctx.translate(ro[0],ro[1]);if(q.inv>0&&(frame>>2)%2)ctx.globalAlpha=.45;c.draw(q,bodyR(q));ctx.restore()}}});

// dash propre à chaque perso · dessin des entités des persos · déguisement de Nue (couleurs échangées au rendu seulement)
DEFER(()=>{{const D0=dash;dash=(p,I)=>{const c=chOf(p);D0(p,I);if(c&&c.dashF&&p.state==='dash')c.dashF(p)}}});
DEFER(()=>{{const W0=drawWorldItems;drawWorldItems=function(){W0();for(const e of ENT)if(e.t>0&&EDR[e.k]){ctx.save();EDR[e.k](e);ctx.restore()}}}});
DEFER(()=>{{const D0=drawP;drawP=q=>{const c=chOf(q);if(q.nOrig!==undefined&&q.nD>frame&&P[q.nDid]){const j=q.nDid,a=COLS[q.id],b=LCOLS[q.id];COLS[q.id]=COLS[j];LCOLS[q.id]=LCOLS[j];try{D0(q)}finally{COLS[q.id]=a;LCOLS[q.id]=b}}else D0(q)}}});
// la spell card fait l'effet de l'ancien burst : repousse, coupe les attaques, efface les balles proches (utilisable même en plein combo)
DEFER(()=>{{const S0=startSpell;startSpell=(p,o,u)=>{S0(p,o,u);if(p.state!=='spell')return;for(const q of P)if(q!==p&&q.state!=='dead'&&foeOf(p.id,q)){const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;if(d<T.BURST_R+bodyR(q)){q.vx+=dx/d*14;q.vy+=dy/d*14;if(q.state==='atk'){q.mv=null;q.state='idle'}}}
 for(const b of B)if(!b.dead&&b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<T.BURST_R)b.dead=1;RINGS.push({x:p.x,y:p.y,r:0,m:T.BURST_R,t:22,c:'#f8f'});shake=Math.min(28,shake+10)}}});
// plus de Burst commun : la jauge reste vide et l'action est neutralisée (le bouton sert au Skill 2)
DEFER(()=>{doBurst=()=>{};});DEFER(()=>{{const S1=step;step=()=>{for(const p of P)p.burst=0;S1()}}});
