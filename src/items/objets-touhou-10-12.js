'use strict';
// ===== Objets Touhou 10-12 + Reimu =====
const UFC=['#ff4a4a','#5cff7a','#4ab3ff'],BANS=['melee','heavy','dash','parry','shot'];
DEFER(()=>{Object.assign(GIVE,{
 shizuha:p=>{CX.leaf={o:p.id,t:480};big('FALLEN LEAVES','#ff8a2a',44)},
 minoriko:p=>{p.fx.harv=600;p.harvB=0;big('GREAT HARVEST','#e8c040',44)},
 hina:p=>{p.fx.hina=360;big('VORTEX OF MISFORTUNE','#c070ff',44)},
 nitori:p=>{p.fx.mech=900;big('KAPPA MECH!','#4ab3ff',54);sfx('se_powerup')},
 momiji:p=>{p.fx.guard=360;big('MOUNTAIN GUARD: AUTO-PARRY','#e0e6f0',40)},
 sanae:p=>{Object.assign(p,{state:'pray',t:180,vx:0,vy:0,charging:false});big('GATHERING THE WIND…','#5cff7a',40)},
 kanako:p=>{CX.onb={o:p.id,t:600};big('ONBASHIRA RAIN','#e04a4a',44)},
 suwako:p=>{p.fx.under=480;burst(p.x,p.y,'#8a9a50',30);big('UNDERGROUND','#c8b050',44)},
 yamame:p=>{const al=P.filter(q=>q.state!=='dead');for(let i=0;i<5&&al.length;i++){const q=al[rng()*al.length|0],a=rng()*Math.PI,cx=q.x+(rng()-.5)*300,cy=q.y+(rng()-.5)*300;
  ENT.push({k:'web',o:p.id,t:600,x1:clamp(cx-Math.cos(a)*300,0,T.MAP_W),y1:clamp(cy-Math.sin(a)*300,0,T.MAP_H),x2:clamp(cx+Math.cos(a)*300,0,T.MAP_W),y2:clamp(cy+Math.sin(a)*300,0,T.MAP_H)})}big('SPIDER WEBS','#e8e8c0',44)},
 parsee:p=>{p.fx.jeal=600;big('GREEN-EYED JEALOUSY','#5cff7a',44)},
 yuugi:p=>{p.fx.oni=600;big('ATTACK = ONI THROW','#e04a4a',44)},
 satori:p=>{CX.sat={o:p.id,t:480};big('I READ YOUR MIND: YOUR SHOTS AIM WHERE THEY WILL BE','#ff8fd0',36);const q=P.filter(q=>q!==p&&q.lastIt&&!['satori','rainbow'].includes(q.lastIt)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(q)give(p,q.lastIt)},
 orin:p=>{CX.hell={o:p.id,t:600,w:0};big('FIRES OF HELL','#ff5030',50);sfx('catorin')},
 okuu:p=>{const r=xR();CX.sun={o:p.id,t:600,x:(r[0]+r[2])/2,y:(r[1]+r[3])/2,r:30};big('NUCLEAR FUSION','#ffa63a',54);sfx('se_cat00')},
 koishi:p=>{p.fx.koishi=480;p.fx.invis=480;big('…','#7fe0a0',60)},
 nazrin:p=>{CX.dowse={o:p.id,t:600};p.dowseN=3;itemT=1e6;big('DOWSING!','#aaa',44)},
 kogasa:p=>{CX.rain={o:p.id,t:480};big('SURPRISE SHOWER!','#a060ff',44)},
 ichirin:p=>{p.fx.unzan=420;big('UNZAN, PUNCH!','#b0b8d0',50)},
 minamitsu:p=>{const r=xR();CX.flood={o:p.id,t:600,top:r[1]+(r[3]-r[1])*.45,y1:r[3],x0:r[0],x1:r[2],lvl:r[3]};big('SHIPWRECK! (HEAVY = ANCHOR)','#3a7fff',40)},
 shou:p=>{p.fx.shou=600;p.light=0;big('INNER LIGHT','#ffe83a',44)},
 byakuren:p=>{p.fx.sutra=300;big('READING THE SCROLL…','#c06cff',44)},
 nue:p=>{CX.nue={o:p.id,t:600};p.nueC=[0,0,0];for(let i=0;i<6;i++){const[x,y]=xOnR(xR(),rng());ENT.push({k:'ufo',o:p.id,t:600,col:i%3,hp:12,lv:1,ph:rng()*TAU,x,y,vx:(rng()<.5?-1:1)*2})}big('UNDEFINED FLYING OBJECTS','#c06cff',40)},
 reimu:p=>{p.fx.rei=420;p.reiHit=0;p.reiN=0;big('FANTASY SKY: DON\'T GET HIT, REACH THE CENTER','#ff4a4a',30)}});});
DEFER(()=>{Object.assign(IM,{yy:{dmg:24,kb:16,stun:40,arm:0},rocket:{dmg:14,kb:16,stun:40,arm:0},ufist:{dmg:16,kb:26,stun:46},onb:{dmg:18,kb:12,stun:40},frog:{dmg:14,kb:14,stun:36},
 shark:{dmg:22,kb:10,stun:40},thrown:{dmg:12,kb:14,stun:34},nueb:{dmg:9,kb:9,stun:30,arm:0},nova:{dmg:45,kb:22,stun:50},fh:{dmg:12,kb:10,stun:30,arm:0},sfrog:{dmg:6,kb:6,stun:20,arm:0}});});
const xBall=(p,x,y,a,v,r,m,o)=>{if(B.length<T.MAX_B)B.push(Object.assign({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r,owner:p.id,heavy:1,m,mult:1,dist:999,life:300,dead:0,seen:0,home:0,gr:0},o||{}))};
function updPray(p){p.vx*=.8;p.vy*=.8;if(--p.t>0)return;p.state='idle';big('LUCKY!','#5cff7a',80);flash(.6,'#fff');shake=60;sfx('se_enep01'); // Sanae
 for(const q of P){if(q===p||q.state==='dead')continue;for(let i=0;i<3;i++)LINES.push({x:q.x,y:q.y-400,a:Math.PI/2+(rng()-.5)*.2,t:20,T:20,len:420});WAVES.push({x:q.x,y:q.y,t:20,T:20,spd:14,th:40,inv:1});
  q.hp-=40;q.pips=0;q.flash=10;if(q.state!=='spell')Object.assign(q,{state:'hitstun',t:30,vx:0,vy:0,charging:false});txt(q.x,q.y-40,'-40  PIPS BROKEN','#5cff7a',18);if(q.hp<=0)ko(q,'LUCKY')}}
function xEmerge(p){p.fx.under=0;p.inv=10;burst(p.x,p.y,'#8a9a50',40);WAVES.push({x:p.x,y:p.y,t:20,T:20,spd:14,th:40,inv:1});shake=Math.min(40,shake+20);big('MISHAGUJI!','#c8b050',50);sfx('se_enep00');
 for(const q of P){if(q===p||q.state==='dead'||q.inv>0)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<200){if(parryOn(q))parryFx(q);else hit(q,p,dx,dy,IM.frog,1,true)}}
 for(let i=0;i<12;i++)xBall(p,p.x,p.y,i*TAU/12,3.5,12,IM.sfrog,{c:'#5cff7a',life:200})}
function xFantasy(p){p.fh=300;p.inv=10;big('FANTASY SKY','#fff',90);flash(.7,'#fff');chroma=60;sfx('spellcardsultimespawn');for(let i=0;i<6;i++)WAVES.push({x:p.x,y:p.y,t:30+i*6,T:30+i*6,spd:20+i*6,th:50,inv:i%2,c:RB[i]})}
DEFER(()=>{{const H0=chHit;chHit=(v,a,dx,dy,m,mult,heavy)=>{
 if(v.fh>0||v.fx.under>0)return 1;
 if(v.fx.guard>0){parryFx(v);if(a&&a!==v&&a.state==='atk')Object.assign(a,{state:'parrystun',t:30,vx:0,vy:0,charging:false});return 1} // Momiji
 if(v.state==='pray'){v.state='idle';big('FOCUS INTERRUPTED','#888',40)}
 if(v.fx.rei>0&&a&&a.state==='atk'&&a!==v){v.reiHit=1;txt(v.x,v.y-50,'FANTASY SKY LOST','#888',14)}
 return H0(v,a,dx,dy,m,mult,heavy)}}});
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{if(v.fx.mech>0)d*=.3;if(a&&a.fx.unzan>0&&a.state==='atk')d*=1.5;d=D0(v,a,d,heavy);
 if(v.fx.shou>0)v.light=(v.light||0)+d;if(a&&a!==v&&a.fx.harv>0)a.harvB=(a.harvB||0)+d;return d}}});
DEFER(()=>{{const C0=chBullet;chBullet=(b,t)=>{const o=P[b.owner];
 if(b.yy){const m=b.yyT||(b.yyT={});if((m[t.id]||0)>frame)return 1;m[t.id]=frame+40;hit(t,o,b.vx,b.vy,b.m,b.mult||1,true);return 1} // yin-yang : rebondit, ne disparaît pas
 if(b.anchor){t.pull={o:b.owner,t:40};b.dead=1;txt(t.x,t.y-40,'ANCHORED!','#3a7fff',18);sfx('hit3');return 1}
 if(b.weird&&t.inv<=0&&t.state!=='dash'){const k=BANS[rng()*BANS.length|0];t.ban={k,t:360};txt(t.x,t.y-50,k.toUpperCase()+' = ???','#c06cff',18)}
 if(b.water&&t.fx.phoenix>0)t.hp-=b.dmg;
 return C0(b,t)}}});
DEFER(()=>{{const M0=chMelee;chMelee=p=>{const f=p.fx;
 if(f.under>0){xEmerge(p);return 1}
 if(f.unzan>0){if((p.ufCD||0)>frame)return 1;p.ufCD=frame+90;const c=Math.cos(p.aim),s=Math.sin(p.aim),x=p.x+c*90,y=p.y+s*90; // Ichirin : poing géant d'Unzan
  ENT.push({k:'fist',o:p.id,t:14,x,y,a:p.aim});shake=Math.min(40,shake+14);sfx('hit3');sfx('se_enep00',.5);
  for(const q of P){if(q===p||q.state==='dead'||q.inv>0)continue;if(Math.hypot(q.x-x,q.y-y)<110+bodyR(q)){if(parryOn(q))parryFx(q);else hit(q,p,q.x-p.x,q.y-p.y,IM.ufist,1,true)}}return 1}
 if(f.oni>0){const q=nearFoe(p.id,p.x,p.y,80);if(q&&q.inv<=0&&q.state!=='spell'&&(p.thCD||0)<frame){p.thCD=frame+90;const c=Math.cos(p.aim),s=Math.sin(p.aim); // Yuugi : lancer
   Object.assign(q,{state:'hitstun',t:400,spit:1,thrownBy:p.id,x:p.x+c*40,y:p.y+s*40,vx:c*26,vy:s*26,charging:false,inv:3});big('ONI THROW!','#e04a4a',50);sfx('tan02');shake=Math.min(40,shake+12);return 1}}
 return M0(p)}}});
DEFER(()=>{{const HI=heavyItem;heavyItem=(p,o)=>{const f=p.fx;
 if(f.under>0){xEmerge(p);return 1}
 if(f.mech>0){if((p.rkCD||0)<frame){p.rkCD=frame+90;xBall(p,p.x,p.y,p.aim,14,30,IM.rocket,{boomer:35,c:'#9ab'});sfx('tan01');big('ROCKET PUNCH!','#4ab3ff',36)}return 1}
 if(CX.flood&&CX.flood.o===p.id){if((p.anCD||0)<frame){p.anCD=frame+90;xBall(p,p.x,p.y,p.aim,12,14,IM.rocket,{anchor:1,life:80,c:'#334'});sfx('tan00')}return 1}
 return HI(p,o)}}});
DEFER(()=>{{const I0=chInput;chInput=(p,I)=>{I=I0(p,I);
 if(p.ibuf)p.ibuf=null;
 if(p.ban){if(--p.ban.t<=0)p.ban=null;else if(I.b[p.ban.k])I={x:I.x,y:I.y,b:{...I.b,[p.ban.k]:false}}} // Nue : attaque non identifiable
 return I}}});
DEFER(()=>{{const S0=chSpeed;chSpeed=p=>{let k=S0(p);if(p.fx.mech>0)k*=.75;if(p.fx.under>0)k*=1.3;if(CX.rain&&p.id!==CX.rain.o)k*=.8;if(CX.flood&&p.id!==CX.flood.o&&p.y>CX.flood.lvl)k*=.6;return k}}});
DEFER(()=>{{const E0=fxEnd;fxEnd=(p,k)=>{E0(p,k);
 if(k==='harv'){const h=(p.harvB||0)*2;p.hp=Math.min(T.HP,p.hp+h);big('HARVEST +'+(h|0)+' HP','#e8c040',50);sfx('se_powerup');p.harvB=0}
 else if(k==='under')xEmerge(p);
 else if(k==='shou'){const L=p.light||0,r=Math.min(1000,80+L*6),dm=Math.min(90,10+L*.8);p.light=0;big('INNER FLASH!','#ffe83a',60);flash(.7,'#ffe83a');shake=60;sfx('se_enep01'); // Shou
  WAVES.push({x:p.x,y:p.y,t:30,T:30,spd:r/30,th:80,inv:1,c:'#ffe83a'});for(const q of P){if(q===p||q.state==='dead'||q.inv>0)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<r)hit(q,p,dx,dy,{dmg:dm,kb:14+L*.1,stun:40},1,true)}}
 else if(k==='sutra'){const L=SPELLS.concat([ULT]),s=L[rng()*L.length|0];p.sutS=s;p.sutK=0;p.sutT=300;big(s.name+' x5','#c06cff',34);sfx('se_cat00');flash(.4,'#c06cff')}
 else if(k==='rei'){for(const b of B)if(b.yy&&b.yyO===p.id)b.dead=1;const d=Math.hypot(p.x-T.MAP_W/2,p.y-T.MAP_H/2);
  if(!p.reiHit&&d<300)xFantasy(p);else big(p.reiHit?'FANTASY SKY FAILED (HIT)':'FANTASY SKY FAILED (GO TO THE CENTER)','#888',30)}}}});
function chEnd2(k,v){
 if(k==='sun'){const o=P[v.o];big('SUPERNOVA!!','#fff',90);flash(.9,'#fff');shake=70;chroma=60;sfx('se_enep01');for(let i=0;i<4;i++)WAVES.push({x:v.x,y:v.y,t:40+i*8,T:40+i*8,spd:40,th:120,inv:i%2,c:'#ffa63a'});
  if(o)for(const q of P){if(q===o||q.state==='dead'||q.inv>0)continue;hit(q,o,q.x-v.x||1,q.y-v.y,IM.nova,1,true)}}
 else if(k==='sat')for(const q of P)q.ibuf=null}
DEFER(()=>{{const U0=updEnt;updEnt=e=>{const p=P[e.o];
 if(!['onbw','pillar','web','ufo','shark','fish','fist'].includes(e.k))return U0(e);
 e.t--;if(!p||p.state==='dead'){e.t=0;return}
 switch(e.k){
 case'onbw':if(e.t===1){e.k='pillar';e.t=600;shake=Math.min(40,shake+16);sfx('se_enep00',.7);burst(e.x,e.y,'#e04a4a',20); // Kanako : le pilier s'écrase
   for(const q of P){if(q.id===e.o||q.state==='dead'||q.inv>0)continue;const dx=q.x-e.x,dy=q.y-e.y;if(Math.hypot(dx,dy)<60+bodyR(q))hit(q,p,dx||1,dy,IM.onb,1,true)}}break;
 case'pillar':for(const q of P){if(q.state==='dead')continue;const dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1,R=34+bodyR(q);if(d<R){q.x=e.x+dx/d*R;q.y=e.y+dy/d*R;const dot=q.vx*dx/d+q.vy*dy/d;if(dot<0){q.vx-=2*dot*dx/d;q.vy-=2*dot*dy/d}}}
  for(const b of B)if(!b.dead&&Math.abs(b.x-e.x)<34+b.r&&Math.abs(b.y-e.y)<34+b.r&&Math.hypot(b.x-e.x,b.y-e.y)<34+b.r)b.dead=1;break;
 case'web':for(const q of P){if(q.id===e.o||q.state==='dead'||q.inv>0||(q.wbCD||0)>frame)continue;if(segD(q.x,q.y,e.x1,e.y1,e.x2,e.y2)<bodyR(q)){q.wbCD=frame+90;q.pois=Math.max(q.pois,240);
   if(q.state!=='spell')Object.assign(q,{state:'parrystun',t:70,vx:0,vy:0,charging:false});txt(q.x,q.y-40,'STUCK + SICK!','#e8e8c0',18);sfx('se_kira00',.4)}}break;
 case'ufo':{e.x+=e.vx*e.lv;e.y+=Math.sin(frame*.07+e.ph)*2.5*e.lv;if(e.x<30||e.x>T.MAP_W-30)e.vx*=-1;e.x=clamp(e.x,30,T.MAP_W-30);e.y=clamp(e.y,30,T.MAP_H-30);
  if((frame+(e.ph*10|0))%Math.max(18,50/e.lv|0)===0){const fs=P.filter(q=>q.id!==e.o&&q.state!=='dead');if(fs.length){const q=fs[rng()*fs.length|0];xBall(p,e.x,e.y,Math.atan2(q.y-e.y,q.x-e.x)+(rng()-.5)*.8,3.2*e.lv,13,IM.nueb,{weird:1,ph:rng()*TAU,c:UFC[e.col],life:260})}}
  for(const b of B){if(b.dead||b.fake||b.weird||Math.abs(b.x-e.x)>b.r+18||Math.abs(b.y-e.y)>b.r+12)continue;b.dead=1;e.hp-=b.heavy?4:b.dmg;if(e.hp<=0)break}
  if(e.hp<=0){e.t=0;burst(e.x,e.y,UFC[e.col],30);sfx('se_enep00',.6);big('THE UFOS GET EXCITED!','#c06cff',36);for(const u of ENT)if(u.k==='ufo'&&u!==e)u.lv*=1.3;break}
  for(const q of P){if(q.state==='dead'||Math.hypot(q.x-e.x,q.y-e.y)>bodyR(q)+16)continue;e.t=0;
   if(q===p){p.nueC[e.col]++;txt(e.x,e.y-30,['RED','GREEN','BLUE'][e.col]+' '+p.nueC[e.col]+'/3',UFC[e.col],16);sfx('se_powerup',.5);if(p.nueC[e.col]>=3){p.nueC=[0,0,0];p.ult=1;big('UNDEFINED LAST WORD!',RB[2],50);sfx('spellcardsultimespawn')}}
   else{if(rng()<.5)xDrug(q,rng()<.5?1:2);else{const k=BANS[rng()*BANS.length|0];q.ban={k,t:360};txt(q.x,q.y-50,k.toUpperCase()+' = ???','#c06cff',18)}}break}break}
 case'shark':{const F=CX.flood;if(!F){e.t=0;break}e.x+=e.vx;const q=P.find(q=>q.id===e.tg&&q.state!=='dead');if(q)e.y+=clamp(q.y-e.y,-2.5,2.5);e.y=Math.max(e.y,F.lvl+10); // Minamitsu : requins
  if(e.x<-60||e.x>T.MAP_W+60)e.t=0;for(const q of P){if(q.id===e.o||q.state==='dead'||q.inv>0||(q.skCD||0)>frame)continue;if(Math.hypot(q.x-e.x,q.y-e.y)<40){q.skCD=frame+50;big('CHOMP!','#3a7fff',44);hit(q,p,e.vx,0,IM.shark,1,true)}}break}
 case'fish':{const F=CX.flood;if(!F){e.t=0;break}e.x+=Math.cos(e.a)*1.4;e.y+=Math.sin(e.a)*1.4;e.a+=(rng()-.5)*.2;if(e.y<F.lvl+12)e.a=Math.abs(e.a);if(e.x<20||e.x>T.MAP_W-20)e.a=Math.PI-e.a;
  for(const b of B){if(b.dead||b.fake||Math.abs(b.x-e.x)>b.r+12||Math.abs(b.y-e.y)>b.r+10)continue;b.dead=1;e.t=0;const k=P[b.owner];if(k&&k.state!=='dead'){k.hp=Math.min(T.HP,k.hp+15);txt(k.x,k.y-30,'FISH +15','#5f8',16);sfx('se_powerup',.4)}break}break}}}}});
function chPre2(){
 for(const k of['leaf','onb','hell','sun','dowse','rain','flood','nue','sat'])if(CX[k]&&--CX[k].t<=0){const v=CX[k];CX[k]=null;chEnd2(k,v)}
 const al=P.filter(q=>q.state!=='dead');
 if(CX.leaf){const o=CX.leaf.o;for(const b of B)if(b.owner!==o&&!b.yy){b.vy+=.3;b.vx*=.97;b.life-=2}for(const q of P)if(q.id!==o&&q.state!=='dead'&&!ally(q,P[o])){q.vy+=.28;if(frame%30===0&&q.inv<=0){q.hp-=1.5;if(q.hp<=0)ko(q,'FALLEN')}} // Shizuha : tout tombe
  for(const q of al)if(q.id!==o){q.spirit=Math.max(0,q.spirit-.15);q.burst=Math.max(0,q.burst-.12)}
  if(frame%3===0&&FX.length<480&&al.length){const q=al[Math.random()*al.length|0];FX.push({x:q.x+(Math.random()-.5)*800,y:q.y-300,vx:Math.random()-.5,vy:1.5,t:120,c:Math.random()<.5?'#ff8a2a':'#d9a03a'})}}
 if(CX.onb&&CX.onb.t%50===0){const fs=al.filter(q=>q.id!==CX.onb.o);if(fs.length){const q=fs[rng()*fs.length|0];ENT.push({k:'onbw',o:CX.onb.o,t:60,x:clamp(q.x+(rng()-.5)*160,40,T.MAP_W-40),y:clamp(q.y+(rng()-.5)*160,40,T.MAP_H-40)})}}
 if(CX.hell)CX.hell.w=Math.min(260,CX.hell.w+.45);
 if(CX.sun){const S=CX.sun;S.r=Math.min(200,S.r+.3);for(const q of al){if(q.id===S.o)continue;const dx=S.x-q.x,dy=S.y-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*.5;q.vy+=dy/d*.5; // Okuu
   if(d<S.r+bodyR(q)&&q.inv<=0){q.hp-=.3;if(frame%4===0)FX.push({x:q.x,y:q.y,vx:0,vy:-1.5,t:14,c:'#ffa63a'});if(q.hp<=0)ko(q,'MELTED BY THE SUN')}}
  for(const b of B)if(b.owner!==S.o&&Math.abs(b.x-S.x)<S.r&&Math.hypot(b.x-S.x,b.y-S.y)<S.r)b.dead=1}
 if(CX.dowse){const o=P[CX.dowse.o];for(const c of CARDS){const dx=o.x-c.x,dy=o.y-c.y,d=Math.hypot(dx,dy);if(d>4){c.x+=dx/d*.45;c.y+=dy/d*.45}}}
 if(CX.rain){const o=CX.rain.o;if(frame%2===0&&al.length)for(let i=0;i<2&&B.length<T.MAX_B;i++){const q=al[rng()*al.length|0];B.push({x:q.x+(rng()-.5)*900,y:q.y-400,vx:-.8,vy:6,r:3,owner:o,heavy:0,dmg:1,life:160,dead:0,gr:0,home:0,c:'#7fb0ff'})}
  if(CX.rain.t%120===60){const fs=al.filter(q=>q.id!==o);if(fs.length){const q=fs[rng()*fs.length|0];if(q.inv<=0&&q.state!=='spell')Object.assign(q,{state:'parrystun',t:40,vx:0,vy:0,charging:false});big('BOO!','#a060ff',90);txt(q.x,q.y-40,'SURPRISED!','#a060ff',18);sfx('se_cat00',.5)}}}
 if(CX.flood){const F=CX.flood;F.lvl=F.y1-(F.y1-F.top)*Math.min(1,(600-F.t)/180);
  for(const b of B)if(b.y>F.lvl&&!b.anchor){b.x-=b.vx*.5;b.y-=b.vy*.5} // les balles ralentissent dans l'eau
  for(const q of al)if(q.id!==F.o&&q.y>F.lvl){q.hp-=.05;if(q.hp<=0)ko(q,'DROWNED')}
  if(F.t%90===45){const fs=al.filter(q=>q.id!==F.o&&q.y>F.lvl);if(fs.length){const q=fs[rng()*fs.length|0],l=rng()<.5;ENT.push({k:'shark',o:F.o,t:300,tg:q.id,x:l?F.x0-40:F.x1+40,y:q.y,vx:l?7:-7})}}
  if(F.t%70===0&&ENT.filter(e=>e.k==='fish').length<6)ENT.push({k:'fish',o:F.o,t:500,x:F.x0+rng()*(F.x1-F.x0),y:F.y1-20-rng()*60,a:rng()*TAU})}
 for(const p of al){const f=p.fx;
  if(f.hina>120){let n=0;for(const b of B)if(b.orb&&b.orb.o===p.id)n++; // Hina : capture puis relâche
   for(const b of B){if(n>=160)break;if(b.dead||b.orb||b.owner===p.id||b.yy||b.fake)continue;const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<450){b.orb={o:p.id,a:Math.atan2(dy,dx),r:d,i:n++};b.owner=p.id;b.c='#c070ff';b.life=9999;b.gr=1}}}
  if(f.hina===120){for(const b of B)if(b.orb&&b.orb.o===p.id){const a=b.orb.a;b.vx=Math.cos(a)*11-Math.sin(a)*3;b.vy=Math.sin(a)*11+Math.cos(a)*3;b.life=300;b.orb=null;b.c='#e070ff';if(b.heavy)b.dist=999}big('MISFORTUNE RELEASED!','#e070ff',80);sfx('explosion3');flash(.6,'#c070ff');shake=Math.min(70,shake+45);chroma=Math.max(chroma,60);zblur=Math.max(zblur,.15);
   for(let i=0;i<5;i++)WAVES.push({x:p.x,y:p.y,t:16+i*5,T:16+i*5,spd:28+i*8,th:70,inv:i%2,c:i%2?'#fff':'#c070ff'});for(let i=0;i<24;i++)LINES.push({x:p.x,y:p.y,a:i*TAU/24,t:18,T:18,len:260});for(const q of P){if(q===p||q.state==='dead'||q.inv>0||ally(q,p))continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<240)hit(q,p,dx,dy,{dmg:14,kb:24,stun:44},1,true)}}
  if(f.mech>0){p.giant=Math.max(p.giant,2);if(frame%4===0&&B.length<T.MAX_B&&p.tgt){const q=p.tgt,a=Math.atan2(q.y-p.y,q.x-p.x)+(rng()-.5)*.3;B.push({x:p.x,y:p.y,vx:Math.cos(a)*10,vy:Math.sin(a)*10,r:6,owner:p.id,heavy:0,dmg:3,life:90,dead:0,gr:0,home:0,water:1,c:'#4ab3ff'})}}
  if(f.under>0)p.inv=Math.max(p.inv,2);
  if(f.jeal>0)for(const q of al){if(q===p)continue;const r=Math.max(0,q.hp-p.hp)*.0006+Math.max(0,q.stocks-p.stocks)*.03;if(r>0){q.hp-=r;if(frame%10===0)FX.push({x:q.x,y:q.y-20,vx:0,vy:-1,t:20,c:'#5cff7a'});if(q.hp<=0)ko(q,'JEALOUSY')}}
  if(p.pull){const o=P[p.pull.o];if(!o||--p.pull.t<=0||Math.hypot(o.x-p.x,o.y-p.y)<50)p.pull=null;else{const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);p.vx=dx/d*18;p.vy=dy/d*18}}
  if(p.spit&&p.thrownBy!==undefined)for(const q of al){if(q===p||q.id===p.thrownBy||q.inv>0||(q.thCD||0)>frame)continue;if(Math.hypot(q.x-p.x,q.y-p.y)<bodyR(p)+bodyR(q)+4){q.thCD=frame+30;hit(q,P[p.thrownBy]||p,p.vx,p.vy,{dmg:14,kb:22,stun:44},1,true); // un corps éjecté percute ceux sur son chemin
   shake=Math.min(60,shake+24);flash(.4,'#fff');chroma=Math.max(chroma,40);sfx(q.hp<=0?'superheavyhit':'hit3',q.hp<=0?.8:.7);for(let i=0;i<12;i++)LINES.push({x:q.x,y:q.y,a:i*TAU/12,t:16,T:16,len:120});big('CRASH!','#fff',60)}}
  if(!p.spit)p.thrownBy=undefined;
  if(p.sutT>0){p.sutT--;const o=p.tgt||al.find(q=>q!==p)||p;for(let j=0;j<5;j++)p.sutS.fn(p,o,p.sutK*5+j);p.sutK++} // Byakuren : spell x5
  if(f.rei>0&&f.rei%60===0&&p.reiN<5){p.reiN++;const[x,y]=xOnR(xR(),rng());xBall(p,x,y,rng()*TAU,1.6,24,IM.yy,{yy:1,yyO:p.id,life:420,c:'#fff'});sfx('tan01',.6)} // Reimu
  if(p.fh>0){p.fh--;p.inv=Math.max(p.inv,2);if(p.fh%4===0)for(let i=0;i<8;i++)xBall(p,p.x,p.y,i*TAU/8+p.fh*.06*(i%2?1:-1),4+(i%2),18,IM.fh,{c:RB[(i+(p.fh>>2))%6],life:240});
   shake=Math.min(30,shake+1);if(p.fh===0)for(const q of al)if(q!==p&&q.state!=='dead'){q.inv=0;q.fx.phoenix=0;q.hp=0;ko(q,'FANTASY SKY')}}}
 for(const b of B){if(b.dead)continue;
  if(b.orb){const o=P[b.orb.o];if(!o||o.state==='dead'){b.orb=null;continue}b.orb.a+=.07;b.orb.r+=(60+(b.orb.i%4)*18-b.orb.r)*.05;b.x=o.x+Math.cos(b.orb.a)*b.orb.r;b.y=o.y+Math.sin(b.orb.a)*b.orb.r;b.vx=b.vy=0}
  if(b.yy){if(b.x<b.r||b.x>T.MAP_W-b.r){b.vx=-b.vx;b.x=clamp(b.x,b.r,T.MAP_W-b.r)}if(b.y<b.r||b.y>T.MAP_H-b.r){b.vy=-b.vy;b.y=clamp(b.y,b.r,T.MAP_H-b.r)}if(Math.hypot(b.vx,b.vy)<9){b.vx*=1.006;b.vy*=1.006}}
  if(b.weird){const a=Math.sin(frame*.1+b.ph)*.09,c=Math.cos(a),s=Math.sin(a),vx=b.vx;b.vx=vx*c-b.vy*s;b.vy=vx*s+b.vy*c}
  if(b.boomer&&--b.boomer===0)b.ret=1;
  if(b.ret){const o=P[b.owner];if(!o||o.state==='dead'){b.dead=1;continue}const dx=o.x-b.x,dy=o.y-b.y,d=Math.hypot(dx,dy)||1;b.vx=dx/d*13;b.vy=dy/d*13;b.life=Math.max(b.life,5);if(d<30)b.dead=1}}}
function chView2(L,Tp,vw,vh){
 if(CX.hell){const w=T.EDGE+CX.hell.w;ctx.fillStyle='rgba(255,80,30,'+(.18+.06*Math.sin(frame*.2))+')';ctx.fillRect(0,0,T.MAP_W,w);ctx.fillRect(0,T.MAP_H-w,T.MAP_W,w);ctx.fillRect(0,w,w,T.MAP_H-2*w);ctx.fillRect(T.MAP_W-w,w,w,T.MAP_H-2*w)}
 if(CX.flood){const F=CX.flood;ctx.fillStyle='rgba(40,100,255,.28)';ctx.fillRect(0,F.lvl,T.MAP_W,T.MAP_H-F.lvl);ctx.strokeStyle='rgba(160,210,255,.8)';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=T.MAP_W;x+=40)ctx.lineTo(x,F.lvl+Math.sin(x*.02+frame*.08)*5);ctx.stroke()}
 if(CX.leaf){ctx.fillStyle='rgba(255,140,40,.08)';ctx.fillRect(L,Tp,vw,vh);for(let i=0;i<40;i++){const x=L+((i*137+frame*(1+i%3))%vw),y=Tp+((i*89+frame*(2+i%4))%vh);ctx.fillStyle=['#ff8a2a','#e0502a','#ffc040'][i%3];ctx.beginPath();ctx.ellipse(x,y,7,3.5,frame*.05+i,0,TAU);ctx.fill()}}
 if(CX.rain){ctx.fillStyle='rgba(60,80,140,.12)';ctx.fillRect(L,Tp,vw,vh)}}
function yinYang(x,y,r,a,c1,c2){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=c1;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,0,r,-Math.PI/2,Math.PI/2);ctx.arc(0,r/2,r/2,Math.PI/2,-Math.PI/2,true);ctx.arc(0,-r/2,r/2,Math.PI/2,-Math.PI/2);ctx.fill();
 ctx.fillStyle=c1;ctx.beginPath();ctx.arc(0,-r/2,r/6,0,TAU);ctx.fill();ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,r/2,r/6,0,TAU);ctx.fill();ctx.restore()}
function chDraw2(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.sun){const S=CX.sun,g=ctx.createRadialGradient(S.x,S.y,S.r*.2,S.x,S.y,S.r*1.4);g.addColorStop(0,'#fff');g.addColorStop(.5,'#ffa63a');g.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(S.x,S.y,S.r*1.4,0,TAU);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.fillText('SUPERNOVA IN '+Math.ceil(S.t/60),S.x,S.y-S.r-20)}
 for(const e of ENT)switch(e.k){
  case'onbw':ctx.globalAlpha=.25+.4*(1-e.t/60);ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(e.x,e.y,34+(60-e.t)*.3,20,0,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#e04a4a';ctx.fillRect(e.x-14,e.y-e.t*8-60,28,60);break;
  case'pillar':ctx.fillStyle='#7a3a2a';ctx.beginPath();ctx.arc(e.x,e.y,34,0,TAU);ctx.fill();ctx.strokeStyle='#e04a4a';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#ffd23a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,22,0,TAU);ctx.stroke();break;
  case'web':ctx.strokeStyle='rgba(240,240,220,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();for(let i=1;i<6;i++){const x=e.x1+(e.x2-e.x1)*i/6,y=e.y1+(e.y2-e.y1)*i/6;ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.stroke()}break;
  case'ufo':ctx.fillStyle=UFC[e.col];ctx.beginPath();ctx.ellipse(e.x,e.y,20,8,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(e.x,e.y-5,8,Math.PI,0);ctx.fill();if(e.lv>1){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x,e.y,24+Math.sin(frame*.3)*3,0,TAU);ctx.stroke()}break;
  case'shark':ctx.fillStyle='#678';ctx.beginPath();ctx.ellipse(e.x,e.y,30,12,0,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(e.x-6,e.y-10);ctx.lineTo(e.x+4,e.y-28);ctx.lineTo(e.x+10,e.y-10);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(e.x+(e.vx>0?16:-24),e.y+2,8,3);break;
  case'fish':ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.ellipse(e.x,e.y,10,5,e.a,0,TAU);ctx.fill();break;
  case'fist':drawFist(e);break}
 for(const b of B){if(b.yy)yinYang(b.x,b.y,b.r,frame*.1,'#fff','#e02020');else if(b.anchor){ctx.strokeStyle='#ccd';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI);ctx.moveTo(b.x,b.y-14);ctx.lineTo(b.x,b.y+10);ctx.stroke()}}
 for(const p of al){const f=p.fx;
  if(f.hina>0){ctx.strokeStyle='#c070ff';ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(p.x,p.y,50+k*25,frame*.2+k,frame*.2+k+4);ctx.stroke()}}
  if(f.mech>0)drawMech(p);
  if(f.guard>0){ctx.strokeStyle='#e0e6f0';ctx.lineWidth=4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(p.x,p.y,T.PARRY_R,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.state==='pray'){ctx.strokeStyle='#5cff7a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+18,-Math.PI/2,-Math.PI/2+TAU*(1-p.t/180));ctx.stroke();ctx.fillStyle='#5cff7a';ctx.font='bold 13px monospace';ctx.fillText('FOCUSING '+Math.ceil(p.t/60),p.x,p.y-48)}
  if(f.under>0){ctx.strokeStyle='rgba(200,176,80,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,18+frame%20,8+frame%20/3,0,0,TAU);ctx.stroke()}
  if(f.unzan>0)drawUnzan(p);
  if(f.oni>0){ctx.fillStyle='#e04a4a';ctx.beginPath();ctx.moveTo(p.x-4,p.y-bodyR(p));ctx.lineTo(p.x,p.y-bodyR(p)-18);ctx.lineTo(p.x+4,p.y-bodyR(p));ctx.fill()}
  if(f.shou>0){const r=10+(p.light||0)*1.2,g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,255,200,.9)');g.addColorStop(1,'rgba(255,232,58,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill()}
  if(f.sutra>0||p.sutT>0){const y=p.y-70;ctx.fillStyle='#1a3a9a';ctx.strokeStyle='#000';ctx.lineWidth=2;for(const s of[-1,1]){ctx.beginPath();ctx.roundRect?ctx.roundRect(p.x+s*58-5,y-24,10,48,5):ctx.rect(p.x+s*58-5,y-24,10,48);ctx.fill();ctx.stroke()} // rouleau de sutra
   for(let i=0;i<6;i++){const x=p.x-45+i*18,yy=y+Math.sin(i*.6+frame*.05)*5;ctx.fillStyle=RB[(i+5)%6];ctx.fillRect(x-6,yy-10,12,4);ctx.fillRect(x-2,yy-6,4,12);ctx.beginPath();ctx.arc(x+4,yy+8,2.5,0,TAU);ctx.fill()}
   if(f.sutra>0){ctx.fillStyle='#c06cff';ctx.font='bold 12px monospace';ctx.fillText('RECITING… '+Math.ceil(f.sutra/60),p.x,y-32)}}
  if(f.rei>0){const n=4,sp=.02+.3*(1-f.rei/420);for(let i=0;i<n;i++){const a=frame*sp+i*TAU/n;yinYang(p.x+Math.cos(a)*44,p.y+Math.sin(a)*44,9,a,'#fff','#3a6aff')}
   ctx.fillStyle=p.reiHit?'#888':'#fff';ctx.font='bold 12px monospace';ctx.fillText(p.reiHit?'FAILED':'CENTER IN '+Math.ceil(f.rei/60),p.x,p.y+58)}
  if(p.fh>0){ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=6;ctx.beginPath();ctx.arc(p.x,p.y,60+Math.sin(frame*.3)*10,0,TAU);ctx.stroke()}
  if(p.ban){ctx.fillStyle='#c06cff';ctx.font='bold 13px monospace';ctx.fillText(p.ban.k.toUpperCase()+' ???',p.x,p.y-52)}
  if(p.pull){const o=P[p.pull.o];if(o){ctx.strokeStyle='#ccd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(o.x,o.y);ctx.stroke()}}
  if(CX.rain&&CX.rain.o===p.id){ctx.fillStyle='#a060ff';ctx.beginPath();ctx.arc(p.x,p.y-30,34,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x-8,p.y-42,4,0,TAU);ctx.fill();ctx.fillStyle='#f33';ctx.fillRect(p.x-14,p.y-36,28,4)}
  if(f.jeal>0)for(const q of al)if(q!==p&&(q.hp>p.hp||q.stocks>p.stocks)){ctx.fillStyle='#5cff7a';ctx.beginPath();ctx.arc(q.x-6,q.y-4,3,0,TAU);ctx.arc(q.x+6,q.y-4,3,0,TAU);ctx.fill()}
  if(p.nueC&&CX.nue&&CX.nue.o===p.id){ctx.font='bold 12px monospace';p.nueC.forEach((n,i)=>{ctx.fillStyle=UFC[i];ctx.fillText(n,p.x-14+i*14,p.y+58)})}}}
