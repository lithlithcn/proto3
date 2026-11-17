'use strict';
// ===== Objets Touhou 13-16 + Yukari =====
DEFER(()=>{Object.assign(IM,{bite:{dmg:7,kb:6,stun:24},bolt:{dmg:12,kb:6,stun:30},elem:{dmg:9,kb:8,stun:26,arm:0},earth:{dmg:20,kb:12,stun:40,arm:0},pebble:{dmg:6,kb:5,stun:16,arm:0},
 kizaru:{dmg:14,kb:10,stun:30},eye:{dmg:6,kb:4,stun:16},string:{dmg:10,kb:8,stun:24},moon:{dmg:35,kb:20,stun:50},bfly:{dmg:6,kb:6,stun:18,arm:0},knife:{dmg:5,kb:4,stun:14,arm:0},
 backstab:{dmg:22,kb:16,stun:40},train:{dmg:40,kb:28,stun:60},splash:{dmg:8,kb:10,stun:24},leaf:{dmg:2,kb:2,stun:10,arm:0},dango:{dmg:3,kb:3,stun:12,arm:0},drum:{dmg:6,kb:10,stun:24}});});
const ELN=['FIRE','WATER','WIND','EARTH','ICE','DARK','LIGHT'],ELC2=['#ff5030','#3a7fff','#bff0c8','#a07040','#bff6ff','#7a2ab0','#fffbe0'];
const PROPH=[['P# WILL NOT BE HIT','homing'],['P# WILL HEAL','drain'],['I WILL LOSE','power'],['P# WILL ESCAPE','tether'],['P# WILL SHOOT WELL','blank'],['P# WILL STAND STILL','restless'],['NOBODY WILL DIE','reaper'],['P# WILL KEEP THEIR GAUGES','steal']];
const GAMES=[['ITEMS',['yellow','white','green','purple','blue','orange','mirror','world','gap','oni','clone','freeze','spark','elixir','bumpers','camera','reimu']],
 ['EoSD',['rumia','daiyousei','rin','meiling','koakuma','patchouli','remilia','flandre']],['PCB',['letty','chen','shanghai','hourai','lily','lunasa','merlin','lyrica','layla','youmu','ran','yuyuko','saigyou','yukari']],
 ['IN',['wriggle','mystia','keine','tewi','reisen','eirin','kaguya','mokou']],['PoFV',['medicine','komachi','eiki']],['MoF',['shizuha','minoriko','hina','nitori','momiji','sanae','kanako','suwako']],
 ['SA',['yamame','parsee','yuugi','satori','orin','okuu','koishi']],['UFO',['nazrin','kogasa','ichirin','minamitsu','shou','byakuren','nue']],['TD',['kyouko','yoshika','seiga','tojiko','futo','miko']],
 ['DDC',['wakasagi','sekibanki','kagerou','benben','yatsuhashi','seija','shinmyou','raiko']],['LoLK',['seiran','ringo','doremy','sagume','clown','junko','hecatia']],['HSiFS',['larva','nemuno','aunn','narumi','satono','mai','okina']]];
let PICKR=[];
DEFER(()=>{Object.assign(GIVE,{
 kyouko:p=>{p.fx.echoB=480;big('MOUNTAIN ECHO','#5cff7a',44)},
 yoshika:p=>{p.fx.jiang=600;big('JIANG-SHI: I CANNOT DIE','#7a9ac0',40)},
 seiga:p=>{ENT.push({k:'zombie',o:p.id,t:720,x:p.x+40,y:p.y,st:0});big('YOSHIKA, ATTACK!','#3a7fff',44)},
 tojiko:p=>{CX.storm={o:p.id,t:600};big('CHAIN THUNDER','#9ad0ff',44)},
 futo:p=>{p.fx.futo=600;big('BREAK THE PLATES!','#e8e8e8',40)},
 miko:p=>{CX.order={o:p.id,t:600,k:null,ph:0,n:frame+40};big('IMPERIAL ORDERS','#e8c040',44)},
 mamizou:p=>{p.fx.leaf=3;p.pick={t:300,tab:0,i:0};big('PICK A POWER! (5 s)','#c08040',40)},
 wakasagi:p=>{p.fx.mermaid=600;for(let i=0;i<6;i++){const[x,y]=xOnR(xR(),i/6+rng()*.1);const r=xR();ENT.push({k:'puddle',o:p.id,t:600,x:(x+(r[0]+r[2])/2)/2,y:(y+(r[1]+r[3])/2)/2})}sfx('water3',.7);big('PUDDLE NETWORK (HEAVY = DIVE)','#3a7fff',36)},
 sekibanki:p=>{p.fx.heads=600;for(let i=0;i<9;i++)ENT.push({k:'head',o:p.id,t:600,i,x:p.x,y:p.y,st:0,cd:i*9});big('NINE HEADS (DASH = SWAP)','#e04a4a',40)},
 kagerou:p=>{p.fx.wolf=600;sfx('louphowling');big('FULL MOON: AWOOO!','#c8c8ff',50)},
 benben:p=>{p.fx.reso=600;big('RESONANCE','#c06cff',44)},
 yatsuhashi:p=>{CX.koto={o:p.id,t:3*80+20,n:0};big('GLISSANDO: DASH THROUGH THE STRINGS!','#ff6b6b',34)},
 seija:p=>{CX.flip={o:p.id,t:600};big('REVERSE IDEOLOGY!','#ff4a4a',60);invF=12;chroma=60;zblur=.25;sfx('reverse')},
 shinmyou:p=>{p.fx.mallet=600;big('WONDER MALLET','#ffd23a',44)},
 raiko:p=>{tkStart(p);big('WAR DRUM: TAIKO TIME!','#ff7b2c',44);sfx('taikogrosrouge',.6)},
 seiran:p=>{p.fx.mochi=600;big('MOCHI POUNDING! (ATTACK)','#4ab3ff',40)},
 ringo:p=>{p.fx.dangoT=600;big('DANGO FEAST: YOUR BIG DANMAKU ARE DANGOS','#ffb04a',34)},
 doremy:p=>{const r=xR();for(let i=0;i<6;i++)ENT.push({k:'dream',o:p.id,t:720,bad:i%2,x:r[0]+rng()*(r[2]-r[0]),y:r[1]+rng()*(r[3]-r[1]),a:rng()*TAU,cd:{}});p.fx.dreamE=720;big('SWEET DREAMS... (HEAVY = EAT A DREAM)','#ffb0e0',34)},
 sagume:p=>{const q=nearFoe(p.id,p.x,p.y),[s,k]=PROPH[rng()*PROPH.length|0];CX.proph={o:p.id,t:600,k,v:q?q.id:p.id};big('"'+s.replace('#',q?q.id+1:'?')+'"','#e8e8ff',44);txt(p.x,p.y-60,'...the opposite will happen.','#e8e8ff',16);sfx('se_cat00')},
 clown:p=>{CX.moon={o:p.id,t:600};big("IT'S LUNATIC TIME!",'#ff4a4a',50)},
 junko:p=>{for(const q of P)q.purified=0;Object.assign(p,{spirit:T.SPIRIT_MAX,burst:T.BURST_MAX,power:T.POWER_MAX});p.fx.pure=600;big('PURE PURIFICATION','#ff3355',60);flash(.6,'#fff');sfx('se_enep01')},
 hecatia:p=>{p.fx.planets=600;big('THREE WORLDS','#ff4a4a',44)},
 larva:p=>{p.fx.larva=480;big('CHRYSALIS: MOVE NEAR FOE BULLETS!','#c8ff5a',40)},
 nemuno:p=>{ENT.push({k:'terr',o:p.id,t:600,x:p.x,y:p.y});big('MY TERRITORY!','#e04a4a',44)},
 aunn:p=>{ENT.push({k:'dog',o:p.id,t:720,x:p.x,y:p.y,cd:0});big('KOMAINU GUARD','#5cff7a',44)},
 narumi:p=>{p.fx.armor=600;big('LIVING STATUE: SUPER ARMOR','#a0a0a0',40)},
 satono:p=>{CX.dance={o:p.id,t:600};big('BACKSTAGE BEAT: DODGE THE NOTES!','#ff8fd0',40)},
 mai:p=>{const r=xR(),w=r[2]-r[0],h=r[3]-r[1],m=(r[1]+r[3])/2;for(let i=0;i<7;i++)ENT.push({k:'bamb',o:p.id,t:480+i*6,x:r[0]+(i+.5)*w/7,y:clamp(m+(i%2?1:-1)*h*.27+(rng()-.5)*40,r[1]+120,r[3]-30),sh:0});big('BAMBOO CHOREOGRAPHY','#5cff7a',44);sfx('aimreal',1.7)},
 okina:p=>{for(let i=0;i<3;i++){const r=xR();ENT.push({k:'mirr',o:p.id,t:600,x:r[0]+(i+.5)*(r[2]-r[0])/3,y:r[1]+(r[3]-r[1])*(i%2?.3:.7)})}big('SECRET DOORS: ENTER A MIRROR','#ffd23a',36)},
 yukari:p=>{CX.yuka={o:p.id,t:660};big('BOUNDARY OF EVERYTHING','#c020e0',44)}});});
const xSz=p=>(p.sz||1)*(p.fat?1+.5*p.fat:1);
DEFER(()=>{{const K0=ko;ko=(p,why)=>{if(p.fx&&p.fx.jiang>0&&!p.jForce&&p.state!=='dead')return;K0(p,why)}}}); // Yoshika : ne peut pas mourir
DEFER(()=>{{const H0=chHit;chHit=(v,a,dx,dy,m,mult,heavy)=>{if(CX.pureIn)return 0; // Junko : rien n'arrête la pureté
 if(v.fx.armor>0){const d=chDmg(v,a,m.dmg*mult,heavy);v.hp-=d;v.flash=6;sfx('resist',.75,.95+Math.random()*.1);txt(v.x,v.y-30,'ARMOR','#aaa',12);if(v.hp<=0)ko(v,'K.O.');return 1} // Narumi
 if(a&&a.fx.armor>0&&!CX.kbIn&&a!==v){CX.kbIn=1;hit(v,a,dx,dy,{...m,kb:(m.kb||0)*2},mult,heavy);CX.kbIn=0;return 1}
 return H0(v,a,dx,dy,m,mult,heavy)}}});
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{
 if(a&&a!==v){if(a.fx.jiang>0)a.hp+=d*.5;if(a.fx.wolf>0&&a.state==='atk')a.hp=Math.min(T.HP,a.hp+4);d*=a.sz||1;if(a.okiB>frame&&a.state==='atk')d*=2;
  if(CX.flip){const al=P.filter(q=>q.state!=='dead');let lo=al[0],hi=al[0];for(const q of al){if(q.hp<lo.hp)lo=q;if(q.hp>hi.hp)hi=q}if(a===lo)d*=3;else if(a===hi)d*=.3} // Seija
  if(ENT.some(e=>e.k==='terr'&&e.o===a.id&&Math.hypot(a.x-e.x,a.y-e.y)<320))d*=2;
  if(CX.proph&&CX.proph.k==='power'&&a.id===CX.proph.o)d*=2;if(a.fx.mallet>0&&a.state==='atk'){a.sz=Math.min(2.5,(a.sz||1)+.15);v.sz=Math.max(.4,(v.sz||1)-.15)}}
 if(CX.proph){const R=CX.proph;if(R.k==='homing'&&v.id===R.v)d*=2;if(R.k==='power'&&v.id===R.o)d*=.5}
 d=D0(v,a,d,heavy);
 if(v.fx.echoB>0&&a&&a!==v)(CX.echoQ||(CX.echoQ=[])).push({t:frame+60,tg:a.id,d,x:v.x,y:v.y}); // Kyouko
 if(v.fx.drum>0&&a!==v&&!CX.drumIn){v.drumP=(v.drumP||0)*.6+d;const r=120+v.drumP*8;CX.drumIn=1;RINGS.push({x:v.x,y:v.y,r:0,m:r,t:16,c:'#ff7b2c'});txt(v.x,v.y-40,'BOOM!','#ff7b2c',18+Math.min(30,v.drumP));shake=Math.min(40,shake+6+v.drumP*.3);sfx('se_enep00',.5); // Raiko
  for(const q of P){if(q===v||q.state==='dead'||q.inv>0)continue;const dx=q.x-v.x,dy=q.y-v.y;if(Math.hypot(dx,dy)<r)hit(q,v,dx,dy,{dmg:5+v.drumP*.6,kb:10+v.drumP*.3,stun:24},1,true)}CX.drumIn=0}
 return d}}});
DEFER(()=>{{const C0=chBullet;chBullet=(b,t)=>{const o=P[b.owner];
 if(b.pure){if(b.heavy){CX.pureIn=1;hit(t,o,b.vx,b.vy,b.m,b.mult,true);CX.pureIn=0}else{t.hp-=b.dmg;t.flash=3;sfxDmg(t);if(t.hp<=0)ko(t,'PURIFIED')}b.dead=1;return 1}
 if(b.stone&&!b.stoneD){b.stoneD=1;const o=P[b.owner];if(o)for(let j=0;j<4;j++)sB(o,b.x,b.y,j*TAU/4+.3,4,{r:3,dmg:1,c:'#b0a080'});sfx('break',.5);burst(b.x,b.y,'#b0a080',14)}
 if(b.coc)return 1;
 if(ENT.some(e=>e.k==='terr'&&e.o===t.id&&Math.hypot(t.x-e.x,t.y-e.y)<320)&&!b.heavy)return 1; // Nemuno : ignore les petites balles chez elle
 if(b.leaf){t.tanuki=frame+300;t.fx.tiny=300;b.dead=1;big('POMF! TANUKI!','#c08040',40);burst(t.x,t.y,'#c08040',20);return 1} // Mamizou
 if(b.dango){t.fat=1;t.fatT=frame+420;b.dead=1;txt(t.x,t.y-40,'DANGO! FAT & SLOW','#ffb04a',18);sfx('tan01');return 1}
 if(b.elem!==undefined)xElemHit(b,t);
 return C0(b,t)}}});
function xElemHit(b,t){const e=b.elem; // Futo : éléments
 if(e===0)t.burn=Math.max(t.burn,180);else if(e===1){t.wet=frame+240;txt(t.x,t.y-30,'SPLASH!','#3a7fff',14)}
 else if(e===2){const l=Math.hypot(b.vx,b.vy)||1;Object.assign(t,{state:'hitstun',t:400,spit:2,vx:b.vx/l*30,vy:b.vy/l*30,charging:false});txt(t.x,t.y-30,'GUST!','#bff0c8',16)}
 else if(e===3)xShatter(b);else if(e===4)t.frzPend=1;else if(e===5)ENT.push({k:'darkz',o:b.owner,t:300,x:t.x,y:t.y})}
function xShatter(b){for(let i=0;i<6;i++)xBall(P[b.owner],b.x,b.y,i*TAU/6+rng()*.4,4,7,IM.pebble,{c:'#a07040',life:120});b.elem=undefined}
DEFER(()=>{{const M0=chMelee;chMelee=p=>{if(p.tanuki>frame)return 1;return M0(p)}}});
DEFER(()=>{{const HI=heavyItem;heavyItem=(p,o)=>{const f=p.fx;if(p.tanuki>frame)return 1;
 if(f.leaf>0){f.leaf--;xBall(p,p.x,p.y,p.aim,9,10,IM.leaf,{leaf:1,c:'#5cff7a',life:120});sfx('tan01');return 1}
 if(f.dango>0){f.dango--;xBall(p,p.x,p.y,p.aim,8,12,IM.dango,{dango:1,c:'#ffb04a',life:140});sfx('tan01');return 1}
 if(f.mermaid>0){const ps=ENT.filter(e=>e.k==='puddle'&&e.o===p.id),cur=ps.find(e=>Math.hypot(e.x-p.x,e.y-p.y)<60);if(cur&&ps.length>1){const q=p.tgt;let best=null,bd=1e9;for(const e of ps)if(e!==cur){const d=q?Math.hypot(e.x-q.x,e.y-q.y):rng();if(d<bd){bd=d;best=e}}
   burst(p.x,p.y,'#3a7fff',20);sfx('water2',.7);p.x=best.x;p.y=best.y;p.inv=20;burst(p.x,p.y,'#3a7fff',20);sfx('water',.8);for(const q of P){if(q===p||q.state==='dead'||q.inv>0)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<110)hit(q,p,dx,dy,IM.splash,1,true)}return 1}}
 if(f.dreamE>0){let best=null,bd=420;for(const e of ENT)if(e.k==='dream'&&e.o===p.id){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;best=e}} // Doremy mange un rêve
  if(best){if(!p.eatD){p.eatD={e:best,t:0};sfx('ghost',.4)}return 1}}
 return HI(p,o)}}});
DEFER(()=>{{const I0=chInput;chInput=(p,I)=>{I=I0(p,I);
 if(p.tanuki>frame)I={x:I.x,y:I.y,b:{...I.b,shot:false,melee:false,heavy:false,spell:false,burst:false}};
 if(p.fear){const o=P[p.fear.o];if(--p.fear.t<=0||!o)p.fear=null;else{const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy)||1;I={x:dx/d,y:dy/d,b:{}}}} // Kagerou : terreur
 if(p.dance>0){p.dance--;I={x:Math.cos(frame*.15+p.id),y:Math.sin(frame*.15+p.id),b:{}}} // Satono
 if(CX.proph&&CX.proph.k==='restless'&&p.id===CX.proph.v){if(Math.hypot(I.x,I.y)>.3)p.hyd=[I.x,I.y];else if(p.hyd)I={x:p.hyd[0],y:p.hyd[1],b:I.b}}
 return I}}});
DEFER(()=>{{const S0=chSpeed;chSpeed=p=>{let k=S0(p);const f=p.fx;if(p.tanuki>frame)k*=.6;if(f.wolf>0)k*=1.5;if(f.armor>0)k*=.6;if(f.turret>0)k=0;if(p.fat)k*=Math.pow(.7,p.fat);if(CX.proph&&CX.proph.k==='power'&&p.id===CX.proph.o)k*=1.3;
 if(f.mermaid>0)k*=ENT.some(e=>e.k==='puddle'&&e.o===p.id&&Math.hypot(e.x-p.x,e.y-p.y)<60)?2:.8;if(ENT.some(e=>e.k==='terr'&&e.o!==p.id&&Math.hypot(p.x-e.x,p.y-e.y)<320))k*=.7;
 if(ENT.some(e=>e.k==='darkz'&&e.o!==p.id&&Math.hypot(p.x-e.x,p.y-e.y)<110))k*=.5;if(CX.proph&&CX.proph.k==='restless'&&p.id===CX.proph.v)k*=2;return k}}});
DEFER(()=>{{const E0=fxEnd;fxEnd=(p,k)=>{E0(p,k);if(k==='jiang'&&p.hp<=0){p.jForce=1;ko(p,'COLLAPSED');p.jForce=0}else if(k==='jiang')txt(p.x,p.y-40,'SURVIVED','#7a9ac0',16)}}});
function xPick(p,I,pr){const k=p.pick,G=GAMES[k.tab][1].filter(x=>ITEMS.some(i=>i.k===x)); // Mamizou : choix du pouvoir en pleine partie
 p.vx*=.9;p.vy*=.9;if(--k.t<=0||k.go!==undefined){const L=k.go!==undefined?[k.go]:G.length?G:['yellow'];const it=L[k.go!==undefined?0:rng()*L.length|0];p.pick=null;give(p,it);return}
 if(p.cpu){if(k.t<240){const L=GAMES[rng()*GAMES.length|0][1].filter(x=>ITEMS.some(i=>i.k===x)&&x!=='mamizou');k.go=L[rng()*L.length|0]||'yellow'}return}
 const sx=Math.abs(I.x)>.6?Math.sign(I.x):0,sy=Math.abs(I.y)>.6?Math.sign(I.y):0;
 if(sx&&sx!==k.px){k.tab=(k.tab+sx+GAMES.length)%GAMES.length;k.i=0;sfx('se_select00',.5)}if(sy&&sy!==k.py){const n=GAMES[k.tab][1].length;k.i=(k.i+sy+n)%n;sfx('se_select00',.5)}k.px=sx;k.py=sy;
 if(pr('melee')||pr('heavy')||pr('shot')||pr('parry')){const x=GAMES[k.tab][1][k.i];if(x&&x!=='mamizou'&&ITEMS.some(i=>i.k===x)){k.go=x;sfx('ok00')}}}
function chScreen(){PICKR=[]; // interface plein écran : sélecteur de Mamizou + voile de Seija
 if(CX.flip&&0){const e=600-CX.flip.t,k=Math.min(1,e/30,CX.flip.t/30);ctx.globalAlpha=.35*k;const g=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,(frame>>3)%2?'rgba(255,40,60,1)':'rgba(40,80,255,1)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
 let row=0;for(const p of P){if(!p.pick)continue;const k=p.pick,w=Math.min(W-20,760),x0=(W-w)/2,y0=70+row*150+(TEST?110:0),tw=w/GAMES.length;row++;
  ctx.fillStyle='rgba(10,8,20,.88)';ctx.fillRect(x0,y0,w,140);ctx.strokeStyle=COLS[p.id];ctx.lineWidth=3;ctx.strokeRect(x0,y0,w,140);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=COLS[p.id];ctx.fillRect(x0,y0+136,w*k.t/300,4);
  GAMES.forEach((g,i)=>{const x=x0+i*tw;ctx.fillStyle=i===k.tab?'#c08040':'#222';ctx.fillRect(x+1,y0+2,tw-2,26);ctx.fillStyle='#fff';ctx.font='bold '+Math.min(12,tw/5|0)+'px monospace';ctx.fillText(g[0],x+tw/2,y0+15);PICKR.push({x,y:y0,w:tw,h:28,p:p.id,tab:i})});
  const L=GAMES[k.tab][1],cw=w/Math.min(6,L.length);L.forEach((it,i)=>{const I=ITEMS.find(z=>z.k===it);if(!I)return;const x=x0+(i%6)*cw,y=y0+36+(i/6|0)*32;ctx.fillStyle=i===k.i?'rgba(255,255,255,.2)':'rgba(255,255,255,.04)';ctx.fillRect(x+2,y,cw-4,28);
   ctx.fillStyle=I.c==='rainbow'?rainbowCol():I.c;ctx.font=(i===k.i?'bold ':'')+'11px monospace';ctx.fillText((I.ch?I.ch.split(' ')[0]+': ':'')+I.name,x+cw/2,y+14,cw-8);PICKR.push({x,y,w:cw,h:28,p:p.id,tab:k.tab,i,it})});
  ctx.fillStyle='#aaa';ctx.font='11px monospace';ctx.fillText(pname(p)+' — stick: tabs/items · attack: choose · '+Math.ceil(k.t/60)+' s',W/2,y0+126);ctx.textBaseline='alphabetic'}}
function chPre3(){
 for(const k of['storm','order','koto','flip','proph','moon','dance','yuka'])if(CX[k]&&--CX[k].t<=0){CX[k]=null}
 const al=P.filter(q=>q.state!=='dead');
 if(CX.echoQ){for(const e of CX.echoQ)if(frame>=e.t){const q=P[e.tg];e.t=-1;if(q&&q.state!=='dead'&&q.inv<=0){q.hp-=e.d;q.flash=8;RINGS.push({x:q.x,y:q.y,r:0,m:80,t:14,c:'#5cff7a'});txt(q.x,q.y-40,'ECHO -'+(e.d|0),'#5cff7a',16);sfxDmg(q);if(e.d>5&&q.state!=='spell')Object.assign(q,{state:'hitstun',t:14,charging:false});if(q.hp<=0)ko(q,'ECHO')}}CX.echoQ=CX.echoQ.filter(e=>e.t>0)}
 {const f=CX.flip,e=f?600-f.t:0,ez=u=>1+2.7*Math.pow(u-1,3)+1.7*Math.pow(u-1,2);CX.flipA=f?Math.PI*(e<45?ez(e/45):f.t<45?ez(f.t/45):1):0; // Seija : rotation souple
  if(f&&(e===1||f.t===44)){invF=14;chroma=70;zblur=.3;focusL=2;shake=40;big('REVERSE!','#ff4a4a',90);WAVES.push({x:al[0]?al[0].x:0,y:al[0]?al[0].y:0,t:40,T:40,spd:60,th:120,inv:1});sfx('se_enep00')}if(f&&(e<45||f.t<45))chroma=Math.max(chroma,20)}
 if(CX.storm&&CX.storm.t%50===0){for(const q of al)if(q.id!==CX.storm.o)ENT.push({k:'bolt',o:CX.storm.o,t:45,x:clamp(q.x+q.vx*22+(rng()-.5)*50,20,T.MAP_W-20),y:clamp(q.y+q.vy*22+(rng()-.5)*50,20,T.MAP_H-20)});const r=xR();ENT.push({k:'bolt',o:CX.storm.o,t:45,x:r[0]+rng()*(r[2]-r[0]),y:r[1]+rng()*(r[3]-r[1])});sfx('aimreal',1.7)}
 if(CX.order){const O=CX.order,o=O.o;if(frame===O.n){O.k=['STOP!','MOVE!','NO SHOOTING!','DASH!','PARRY!'][rng()*5|0];O.ph=1;big('NEXT ORDER: '+O.k,'#e8c040',44);sfx('se_select00')} // Miko
  if(O.ph===1&&frame===O.n+40){O.ph=2;big(O.k,'#fff',80);for(const q of al)q.ordOK=O.k==='STOP!'||O.k==='NO SHOOTING!';sfx('se_cat00',.6)}
  if(O.ph===2){if(frame>O.n+55)for(const q of al){if(q.id===o)continue;const v=Math.hypot(q.vx,q.vy);if(O.k==='STOP!'&&v>1.5||O.k==='NO SHOOTING!'&&q.in.b.shot)q.ordOK=false;if(O.k==='MOVE!'&&v>2||O.k==='DASH!'&&q.state==='dash'||O.k==='PARRY!'&&q.state==='parry')q.ordOK=true}
   if(frame===O.n+100){O.ph=0;O.n=frame+30;for(const q of al)if(q.id!==o){if(q.ordOK)txt(q.x,q.y-40,'OBEYED','#9f9',14);else{txt(q.x,q.y-40,'DISOBEY!','#f44',20);ENT.push({k:'shaku',o,tg:q.id,t:50,d:rng()*4|0,x:q.x,y:q.y});sfx('swordheavy',.5)}}}}}
 if(CX.koto&&CX.koto.t%80===0&&CX.koto.n<3){const r=xR(),n=CX.koto.n,h=n!==1,d=n===2?-1:1;ENT.push({k:'kstr',o:CX.koto.o,t:400,h,d,pos:h?(d>0?r[1]:r[3]):r[0],r});CX.koto.n++;sfx('se_kira00',.4)}
 if(CX.moon&&CX.moon.t%150===0){const fs=al.filter(q=>q.id!==CX.moon.o);if(fs.length){const q=fs[rng()*fs.length|0];ENT.push({k:'moonf',o:CX.moon.o,t:90,x:q.x,y:q.y});big('THE MOON IS FALLING!','#ffe8a0',40);sfx('timeout',.6)}}
 if(CX.dance&&CX.dance.t%180===90)for(const q of al)if(q.id!==CX.dance.o&&q.state!=='spell')ENT.push({k:'snote',o:CX.dance.o,t:45,T:45,x:q.x,y:q.y})
 if(CX.proph){const R=CX.proph,v=P[R.v],o=P[R.o];
  if(v&&v.state!=='dead'){if(R.k==='homing')for(const b of B)if(b.owner!==v.id&&!b.fake){const s=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx),da=((Math.atan2(v.y-b.y,v.x-b.x)-a)%TAU+TAU*1.5)%TAU-Math.PI,na=a+clamp(da,-.04,.04);b.vx=Math.cos(na)*s;b.vy=Math.sin(na)*s}
   if(R.k==='drain'){v.hp-=.2;if(v.hp<=0)ko(v,'PROPHECY')}if(R.k==='tether'){if(!R.c)R.c={x:v.x,y:v.y,t:600};v.cage={x:R.c.x,y:R.c.y,t:2}}
   if(R.k==='blank')for(const b of B)if(b.owner===v.id)b.fake=1;if(R.k==='steal'&&o){const s=Math.min(v.spirit,.5);v.spirit-=s;o.spirit=Math.min(T.SPIRIT_MAX,o.spirit+s);v.burst=Math.max(0,v.burst-.4);v.power=Math.max(1,v.power-.002)}}
  if(R.k==='reaper'&&!R.done){R.done=1;for(const q of al)if(q.id!==R.o&&q.hp<50){q.inv=0;q.hp=0;ko(q,'NOBODY WILL DIE')}}}
 if(CX.yuka){const Y=CX.yuka,o=P[Y.o];if(Y.t>140&&Y.t%60===0){const r=xR(),L=SPELLS.concat([ULT]);ENT.push({k:'gapS',o:Y.o,t:150,x:r[0]+60+rng()*(r[2]-r[0]-120),y:r[1]+60+rng()*(r[3]-r[1]-120),s:L[rng()*L.length|0],k2:0,a:rng()*TAU});sfx('spellcardspawn1',.5)}
  if(Y.t===130){const r=xR();big('THE TRAIN IS COMING','#c020e0',50);for(let i=0;i<3;i++){const fs=al.filter(q=>q.id!==Y.o),q=fs[rng()*fs.length|0]||o;ENT.push({k:'train',o:Y.o,t:40+i*45+80,wait:40+i*45,y:q.y,x:r[0]-500,x0:r[0]-500,x1:r[2]+500})}}}
 for(const p of al){const f=p.fx;
  if(p.pick&&p.state==='dead')p.pick=null;if(p.frzPend){p.frzPend=0;xFreeze(p);txt(p.x,p.y-50,'ICE PRISON!','#bff6ff',18)}
  if(f.futo>0&&f.futo%45===0){const r=xR(),l=rng()<.5;ENT.push({k:'plate',o:p.id,t:400,x:l?r[0]:r[2],y:r[1]+rng()*(r[3]-r[1]),vx:(l?1:-1)*(2+rng()*2),vy:(rng()-.5)*2})}
  if(f.wolf>0){if(p.state==='atk'&&p.mv&&!p.mv.spd&&p.t>p.mv.start+p.mv.act)p.state='idle';if(f.wolf%180===90){big('AWOOOOO!','#c8c8ff',50);sfx('se_cat00',.5);RINGS.push({x:p.x,y:p.y,r:0,m:350,t:24,c:'#c8c8ff'});for(const q of al)if(q!==p&&Math.hypot(q.x-p.x,q.y-p.y)<350)q.fear={o:p.id,t:90}}}
  if(f.reso>0)for(const b of B){if(b.owner!==p.id||b.dead||(b.gen||0)>=3)continue;let hitW=0;if(b.x<4||b.x>T.MAP_W-4){b.vx=-b.vx;b.x=clamp(b.x,4,T.MAP_W-4);hitW=1}if(b.y<4||b.y>T.MAP_H-4){b.vy=-b.vy;b.y=clamp(b.y,4,T.MAP_H-4);hitW=1}
   if(hitW&&B.length<T.MAX_B){b.gen=(b.gen||0)+1;b.life=Math.max(b.life,120);const a=Math.atan2(b.vy,b.vx),s=Math.hypot(b.vx,b.vy);B.push({...b,vx:Math.cos(a+.35)*s,vy:Math.sin(a+.35)*s,hitT:null});b.vx=Math.cos(a-.35)*s;b.vy=Math.sin(a-.35)*s}}
  if(f.turret>0){p.vx=p.vy=0;if(frame%4===0)for(let i=0;i<3&&B.length<T.MAX_B;i++){const a=frame*.11+i*TAU/3;B.push({x:p.x,y:p.y,vx:Math.cos(a)*6,vy:Math.sin(a)*6,r:4,owner:p.id,heavy:0,dmg:3,life:160,dead:0,gr:0,home:0,c:'#4ab3ff'})}if(frame%30===0&&p.tgt)xBall(p,p.x,p.y,Math.atan2(p.tgt.y-p.y,p.tgt.x-p.x),7,12,MOVES.heavyN,{c:'#4ab3ff',life:200})}
  if(f.larva>0&&frame%30===0){let n=0;for(const b of B){if(n>=40)break;if(b.dead||b.owner===p.id||b.coc||b.yy||b.fake||Math.hypot(b.x-p.x,b.y-p.y)>450)continue;b.coc=frame+120;b.cocO=p.id;b.vx=b.vy=0;b.c='#8aa050';b.life=9999;n++}}
  if(f.cage>0&&f.cage%120===0)for(const q of al)if(q!==p)for(let i=0;i<16&&B.length<T.MAX_B;i++)B.push({x:q.x,y:q.y,vx:0,vy:0,r:5,owner:p.id,heavy:0,dmg:2,life:200,dead:0,gr:0,home:0,c:'#5cff7a',cg:{x:q.x,y:q.y,r:220,a:i*TAU/16}});
  if(f.planets>0)for(let i=0;i<3;i++){const a=frame*.03+i*TAU/3,x=p.x+Math.cos(a)*150,y=p.y+Math.sin(a)*150; // Hecatia
   for(const q of al){if(q===p||q.inv>0)continue;const dx=x-q.x,dy=y-q.y,d=Math.hypot(dx,dy)||1;if(i===0&&d<320){q.vx+=dx/d*.6;q.vy+=dy/d*.6}
    if(d<30+bodyR(q)&&(q.plCD||0)<frame){q.plCD=frame+40;if(i===2){const r=xR();burst(q.x,q.y,'#ff4a4a',16);q.x=r[0]+rng()*(r[2]-r[0]);q.y=r[1]+rng()*(r[3]-r[1]);q.hp-=8;txt(q.x,q.y-30,'OTHERWORLD!','#ff4a4a',16)}else hit(q,p,-dx,-dy,IM.splash,1,true)}}
   if(i===1)for(const b of B)if(b.owner!==p.id&&!b.dead&&Math.abs(b.x-x)<34&&Math.abs(b.y-y)<34){b.owner=p.id;b.vx=-b.vx*1.2;b.vy=-b.vy*1.2;b.gr=0;if(b.heavy)b.dist=999}}
  if(f.pure>0)p.pureT=1;else p.pureT=0;
  if(!f.mallet&&p.sz&&p.sz!==1){p.sz+=(1-p.sz)*.02;if(Math.abs(p.sz-1)<.02)p.sz=1}
  if(p.fat&&p.fatT<frame)p.fat=0;
  if(p.wet>frame&&frame%6===0)FX.push({x:p.x,y:p.y+10,vx:0,vy:0,t:14,c:'#3a7fff'})}
 for(const q of al)if(q.sz&&q.sz!==1&&!P.some(p=>p.fx.mallet>0)){q.sz+=(1-q.sz)*.02;if(Math.abs(q.sz-1)<.02)q.sz=1}
 for(const b of B){if(b.dead)continue;
  if(b.coc&&frame>=b.coc){const o=P[b.cocO]||P[0];b.coc=0;Object.assign(b,{owner:o.id,heavy:1,m:IM.bfly,mult:1,dist:999,r:8,home:.06,life:240,c:'#c8ff5a',seen:0,gr:0});const a=rng()*TAU;b.vx=Math.cos(a)*3.5;b.vy=Math.sin(a)*3.5}
  if(b.cg){b.cg.r-=2.2;b.cg.a+=.03;b.x=b.cg.x+Math.cos(b.cg.a)*b.cg.r;b.y=b.cg.y+Math.sin(b.cg.a)*b.cg.r;b.vx=b.vy=0;if(b.cg.r<8)b.dead=1}
  if(b.elem===0&&frame%3===0&&ENT.length<450)ENT.push({k:'fire',o:b.owner,t:120,x:b.x,y:b.y});
  if(b.elem===3&&b.life<=2)xShatter(b);
  if(P[b.owner]&&P[b.owner].fx.pure>0&&!b.pure){b.pure=1;b.pierce=1}}}
function chDraw3(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 for(const e of ENT)switch(e.k){
  case'zombie':ctx.fillStyle=e.st>frame?'#556':'#7a9ac0';ctx.beginPath();ctx.arc(e.x,e.y-Math.abs(Math.sin(frame*.2))*8,16,0,TAU);ctx.fill();ctx.fillStyle='#e8c040';ctx.fillRect(e.x-4,e.y-22-Math.abs(Math.sin(frame*.2))*8,8,14);ctx.strokeStyle='#7a9ac0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.x-8,e.y);ctx.lineTo(e.x-8+Math.cos(e.a||0)*26,e.y+Math.sin(e.a||0)*26);ctx.moveTo(e.x+8,e.y);ctx.lineTo(e.x+8+Math.cos(e.a||0)*26,e.y+Math.sin(e.a||0)*26);ctx.stroke();break;
  case'bolt':if(e.t>1){ctx.globalAlpha=.3+.4*((frame>>2)&1);ctx.strokeStyle='#9ad0ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,50,0,TAU);ctx.stroke();ctx.globalAlpha=1}break;
  case'plate':ctx.fillStyle='#f0f0f0';ctx.beginPath();ctx.ellipse(e.x,e.y,16,7,frame*.2,0,TAU);ctx.fill();ctx.strokeStyle='#3a7fff';ctx.lineWidth=2;ctx.stroke();break;
  case'fire':ctx.globalAlpha=e.t/160;ctx.fillStyle=(frame+e.x|0)%2?'#ff5030':'#ffa63a';ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'darkz':break;
  case'lbeam':if(!e.staff)laserFX(e.x,e.y,Math.atan2(e.y2-e.y,e.x2-e.x),Math.hypot(e.x2-e.x,e.y2-e.y),5*e.t/10+1,COLS[e.o]||'#ffe8a0','#fff',1);break;
  case'puddle':ctx.fillStyle='rgba(58,127,255,.35)';ctx.beginPath();ctx.ellipse(e.x,e.y,56,34,0,0,TAU);ctx.fill();ctx.strokeStyle='rgba(160,210,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,30+frame%30,18+frame%30*.6,0,0,TAU);ctx.stroke();break;
  case'head':if(e.bm){ctx.strokeStyle='#ff4040';ctx.globalAlpha=.25+.35*((frame>>2)&1);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.bm.x2,e.bm.y2);ctx.stroke();ctx.globalAlpha=1}ctx.fillStyle='#e04a4a';ctx.beginPath();ctx.arc(e.x,e.y,11,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x-4,e.y-2,3,0,TAU);ctx.arc(e.x+4,e.y-2,3,0,TAU);ctx.fill();break;
  case'kstr':{ctx.strokeStyle='#ff6b6b';ctx.lineWidth=6;ctx.beginPath();if(e.h){ctx.moveTo(e.r[0],e.pos);ctx.lineTo(e.r[2],e.pos)}else{ctx.moveTo(e.pos,e.r[1]);ctx.lineTo(e.pos,e.r[3])}ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();break}
  case'moonf':{const k=1-e.t/90;ctx.globalAlpha=.25+.35*k;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.x,e.y,220,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#ffe8a0';ctx.beginPath();ctx.arc(e.x,e.y-(1-k)*600,40+180*k,0,TAU);ctx.fill();ctx.fillStyle='rgba(200,180,120,.6)';ctx.beginPath();ctx.arc(e.x-30*k,e.y-(1-k)*600-20*k,30*k,0,TAU);ctx.fill();break}
  case'terr':ctx.strokeStyle='#e04a4a';ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(e.x,e.y,320,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(224,74,74,.05)';ctx.fill();break;
  case'dog':ctx.fillStyle='#5cff7a';ctx.beginPath();ctx.arc(e.x,e.y,14,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(e.x-10,e.y-8);ctx.lineTo(e.x-6,e.y-22);ctx.lineTo(e.x-2,e.y-10);ctx.moveTo(e.x+10,e.y-8);ctx.lineTo(e.x+6,e.y-22);ctx.lineTo(e.x+2,e.y-10);ctx.fill();break;
  case'mirr':ctx.fillStyle='rgba(255,210,58,.25)';ctx.fillRect(e.x-22,e.y-36,44,72);ctx.strokeStyle='#ffd23a';ctx.lineWidth=4;ctx.strokeRect(e.x-22,e.y-36,44,72);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x-12,e.y-26);ctx.lineTo(e.x+4,e.y-6);ctx.stroke();break;
  case'dream':{ctx.globalAlpha=.32;ctx.fillStyle=e.bad?'#2a0a3a':'#ffd0f0';for(const[ox,oy,r]of[[0,0,90],[-50,-20,60],[50,-25,62],[0,-50,58],[-95,70,16],[-120,95,9]]){ctx.beginPath();ctx.arc(e.x+ox,e.y+oy,r,0,TAU);ctx.fill()}ctx.globalAlpha=1;ctx.fillStyle=e.bad?'#c06cff':'#fff';ctx.font='bold 14px monospace';ctx.fillText(e.bad?'NIGHTMARE':'DREAM',e.x,e.y);break}
  case'gapS':xDrawGap(e.x,e.y,120*Math.min(1,(150-e.t)/15,e.t/15),40,e.a);if(e.it){const it=ITEMS.find(i=>i.k===e.it);if(it){ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillStyle=it.c==='rainbow'?rainbowCol():it.c;ctx.fillText(it.name,e.x,e.y-50)}}break;
  case'train':{if(e.wait>0){ctx.globalAlpha=.3+.3*((frame>>2)&1);ctx.fillStyle='#c020e0';ctx.fillRect(e.x0+500,e.y-50,e.x1-e.x0-1000,100);ctx.globalAlpha=1;xDrawGap(e.x0+500,e.y,80,120,Math.PI/2)}else drawYTrain(e);break}}
 for(const e of ENT)if(e.k==='darkz'){ctx.globalAlpha=.75*Math.min(1,e.t/40);ctx.fillStyle='#1a0626';ctx.beginPath();ctx.arc(e.x,e.y,110,0,TAU);ctx.fill();ctx.strokeStyle='#7a2ab0';ctx.lineWidth=4;ctx.stroke();ctx.globalAlpha=1} // les ténèbres voilent ce qu'il y a dedans
 for(const b of B)if(b.elem!==undefined){ctx.strokeStyle=ELC2[b.elem];ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+5,0,TAU);ctx.stroke()}
 for(const p of al){const f=p.fx;
  if(f.jiang>0){ctx.fillStyle='#e8c040';ctx.fillRect(p.x-5,p.y-bodyR(p)-14,10,16);if(p.hp<=0){ctx.fillStyle='#f44';ctx.font='bold 13px monospace';ctx.fillText('HP '+(p.hp|0)+' !',p.x,p.y-42)}}
  if(f.echoB>0){ctx.strokeStyle='rgba(92,255,122,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+10+(frame%30),0,TAU);ctx.stroke()}
  if(p.tanuki>frame){ctx.fillStyle='#a06a30';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+4,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(p.x-8,p.y-12,5,0,TAU);ctx.arc(p.x+8,p.y-12,5,0,TAU);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(p.x-9,p.y-3,18,5)}
  if(f.wolf>0){const ba=p.aim+Math.PI,wg=Math.sin(frame*.25)*.35;ctx.strokeStyle='#c8c8ff';ctx.lineCap='round';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(p.x+Math.cos(ba)*12,p.y+Math.sin(ba)*12);ctx.quadraticCurveTo(p.x+Math.cos(ba+wg)*30,p.y+Math.sin(ba+wg)*30,p.x+Math.cos(ba+wg*2)*44,p.y+Math.sin(ba+wg*2)*44);ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(p.x+Math.cos(ba+wg*1.6)*36,p.y+Math.sin(ba+wg*1.6)*36);ctx.lineTo(p.x+Math.cos(ba+wg*2)*46,p.y+Math.sin(ba+wg*2)*46);ctx.stroke();ctx.lineCap='butt';
   if(p.state==='atk'&&p.mv){const m=p.mv,u=Math.min(1,p.t/Math.max(1,m.start)),op=(1-u)*.7+.08,a=p.atkA??p.aim,R=(m.range||40)*1.6+8,c=Math.cos(a),s2=Math.sin(a),jx=p.x+c*R*.55,jy=p.y+s2*R*.55;for(const sg of[-1,1]){const ja=a+sg*op;ctx.fillStyle='#e8e8ff';ctx.beginPath();ctx.moveTo(p.x+c*10,p.y+s2*10);ctx.arc(p.x,p.y,R,ja-(sg>0?0:.25),ja+(sg>0?.25:0));ctx.closePath();ctx.fill();ctx.fillStyle='#fff';for(let k=1;k<=4;k++){const ta=ja-sg*.04,tr=R*(k/5);const tx=p.x+Math.cos(ta)*tr,ty=p.y+Math.sin(ta)*tr,ia=ta-sg*Math.PI/2;ctx.beginPath();ctx.moveTo(tx-Math.cos(ta)*4,ty-Math.sin(ta)*4);ctx.lineTo(tx+Math.cos(ta)*4,ty+Math.sin(ta)*4);ctx.lineTo(tx+Math.cos(ia)*9,ty+Math.sin(ia)*9);ctx.fill()}}}
   ctx.fillStyle='#c8c8ff';ctx.beginPath();ctx.moveTo(p.x-12,p.y-10);ctx.lineTo(p.x-8,p.y-28);ctx.lineTo(p.x-2,p.y-12);ctx.moveTo(p.x+12,p.y-10);ctx.lineTo(p.x+8,p.y-28);ctx.lineTo(p.x+2,p.y-12);ctx.fill()}
  if(p.fear){ctx.fillStyle='#c8c8ff';ctx.font='bold 14px monospace';ctx.fillText('!!',p.x,p.y-36)}
  if(p.dance>0){ctx.fillStyle='#ff8fd0';ctx.font='bold 16px monospace';ctx.fillText('♪',p.x+Math.cos(frame*.2)*24,p.y-30+Math.sin(frame*.2)*8)}
  if(f.turret>0){ctx.strokeStyle='#4ab3ff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(frame*.11)*34,p.y+Math.sin(frame*.11)*34);ctx.stroke()}
  if(f.planets>0)for(let i=0;i<3;i++){const a=frame*.03+i*TAU/3;ctx.fillStyle=['#3a9aff','#ffe8a0','#ff4a4a'][i];ctx.beginPath();ctx.arc(p.x+Math.cos(a)*150,p.y+Math.sin(a)*150,30,0,TAU);ctx.fill()}
  if(f.armor>0){ctx.strokeStyle='#aaa';ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+4,0,TAU);ctx.stroke()}
  if(f.pure>0){ctx.strokeStyle='#ff3355';ctx.lineWidth=2;for(let i=0;i<6;i++){const a=frame*.05+i*TAU/6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(a)*40,p.y+Math.sin(a)*40);ctx.stroke()}}
  if(f.leaf>0||f.dango>0){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(f.leaf>0?'LEAF x'+f.leaf:'DANGO x'+f.dango,p.x,p.y+58)}
  
  if(CX.order&&CX.order.ph===2&&p.id!==CX.order.o){ctx.fillStyle=p.ordOK?'#9f9':'#f44';ctx.font='bold 13px monospace';ctx.fillText(CX.order.k,p.x,p.y-56)}}}
function xDrawGap(x,y,w,h,a){if(w<2)return;ctx.save();ctx.translate(x,y);ctx.rotate(a); // fissure de Yukari : bande ondulée remplie d'yeux
 const path=()=>{ctx.beginPath();ctx.moveTo(-w,0);ctx.bezierCurveTo(-w*.5,-h*1.2,w*.5,h*.4,w,-h*.2);ctx.bezierCurveTo(w*.5,h*1.2,-w*.5,h*.2,-w,0)};
 path();ctx.strokeStyle='#a020e0';ctx.lineWidth=14;ctx.stroke();ctx.fillStyle='#3a0820';ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.stroke();ctx.save();path();ctx.clip();
 for(let i=0;i<5;i++){const ex=-w*.7+i*w*.35,ey=Math.sin(i*1.7)*h*.25;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ex,ey,h*.45,h*.22,i,0,TAU);ctx.fill();ctx.fillStyle='#d01020';ctx.beginPath();ctx.arc(ex,ey,h*.17,0,TAU);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex,ey,h*.06,0,TAU);ctx.fill()}
 ctx.restore();ctx.fillStyle='#ff2050';for(const s of[-1,1]){ctx.beginPath();ctx.arc(s*w,s>0?-h*.2:0,7,0,TAU);ctx.fill()}ctx.restore()}
DEFER(()=>{{const U0=updEnt;updEnt=e=>{const p=P[e.o];
 if(!['zombie','bolt','plate','fire','darkz','lbeam','puddle','head','kstr','moonf','terr','dog','mirr','dream','gapS','train'].includes(e.k))return U0(e);
 e.t--;if(!p||p.state==='dead'){e.t=0;return}const al=P.filter(q=>q.state!=='dead'&&q.id!==e.o);
 switch(e.k){
 case'zombie':{if(e.st>frame)break;let q=null,bd=1e9;for(const c of al){const d=Math.hypot(c.x-e.x,c.y-e.y);if(d<bd){bd=d;q=c}}if(!q)break;e.a=Math.atan2(q.y-e.y,q.x-e.x);if(frame%20<12){e.x+=Math.cos(e.a)*4.4;e.y+=Math.sin(e.a)*4.4}
  if(bd<32&&(q.zCD||0)<frame&&q.inv<=0){q.zCD=frame+40;q.pois=Math.max(q.pois,180);hit(q,p,q.x-e.x,q.y-e.y,IM.bite,1,true);txt(q.x,q.y-40,'BITE!','#7a9ac0',16)}
  for(const b of B)if(!b.dead&&b.owner!==e.o&&!b.fake&&Math.abs(b.x-e.x)<b.r+16&&Math.abs(b.y-e.y)<b.r+16){b.dead=1;if(b.heavy){e.st=frame+40;txt(e.x,e.y-30,'STUNNED','#888',12)}}break}
 case'bolt':if(e.t===1){ENT.push({k:'zap',o:e.o,t:14,x:e.x+(rng()-.5)*60,y:e.y-760,x2:e.x,y2:e.y,s:frame,big:1});RINGS.push({x:e.x,y:e.y,r:0,m:70,t:16,c:'#cfe8ff'});shake=Math.min(30,shake+7);flash(.12,'#cfe8ff');sfx('electricheavy',.55);for(const q of al)if(q.id!==e.o&&Math.hypot(q.x-e.x,q.y-e.y)<55+bodyR(q))zapP(q,p,e.x,e.y)}break;
 case'plate':e.x+=e.vx;e.y+=e.vy+Math.sin(frame*.1+e.x*.01)*1.5;if(e.x<0||e.x>T.MAP_W)e.t=0;
  {let br=Math.hypot(p.x-e.x,p.y-e.y)<bodyR(p)+16;if(!br)for(const b of B)if(b.owner===e.o&&!b.dead&&!b.elem&&Math.abs(b.x-e.x)<b.r+16&&Math.abs(b.y-e.y)<b.r+10){b.dead=1;br=1;break}
   if(br){e.t=0;burst(e.x,e.y,'#fff',14);sfx('se_enep00',.5);let q=null,bd=1e9;for(const c of al){const d=Math.hypot(c.x-e.x,c.y-e.y);if(d<bd){bd=d;q=c}}const el=rng()*7|0,a=q?Math.atan2(q.y-e.y,q.x-e.x):0;txt(e.x,e.y-30,ELN[el]+'!',ELC2[el],16);
    if(el===6){if(q){const x2=e.x+Math.cos(a)*2000,y2=e.y+Math.sin(a)*2000,ex=e.x,ey=e.y,eo=e.o;warnBeam(eo,ex,ey,x2,y2,'#fff8c0',()=>{ENT.push({k:'lbeam',o:eo,t:10,x:ex,y:ey,x2,y2});for(const c of P)if(c!==p&&c.state!=='dead'&&segD(c.x,c.y,ex,ey,x2,y2)<bodyR(c)+8&&c.inv<=0){if(parryOn(c))parryFx(c);else hit(c,p,Math.cos(a),Math.sin(a),IM.kizaru,1,true)}sfx('tan02')})}} // lumière : rayon instantané
    else xBall(p,e.x,e.y,a,el===3?5:7,el===3?20:13,el===3?IM.earth:IM.elem,{elem:el,c:ELC2[el],life:el===3?110:220})}}break;
 case'fire':for(const q of al)if(q.inv<=0&&(q.fiCD||0)<frame&&Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+10){q.fiCD=frame+30;q.burn=Math.max(q.burn,120);q.hp-=2}break;
 case'darkz':for(const q of al)if(q.inv<=0&&Math.hypot(q.x-e.x,q.y-e.y)<110){q.hp-=.35;if(q.hp<=0)ko(q,'SWALLOWED BY DARKNESS')}break;
 case'lbeam':break;case'puddle':break;case'terr':
  if(frame%20===0)for(const q of al)if(Math.hypot(q.x-e.x,q.y-e.y)<320){const a=rng()*TAU;xBall(p,q.x+Math.cos(a)*250,q.y+Math.sin(a)*250,a+Math.PI,7,7,IM.knife,{c:'#ddd',life:80});if(frame%60===0)txt(q.x,q.y-40,'TRESPASSER!','#e04a4a',16)}break;
 case'head':{const o=p;if(e.st>0){e.st--;const q=P[e.tg];if(q){e.x+=(q.x-e.x)*.04;e.y+=(q.y-e.y)*.04;if(Math.hypot(q.x-e.x,q.y-e.y)<26&&q.inv<=0&&(q.hdCD||0)<frame){q.hdCD=frame+60;hit(q,o,q.x-o.x,q.y-o.y,{...IM.eye,dmg:IM.eye.dmg*.5},1,true)}}}
  else{const a=frame*.04+e.i*TAU/9;e.x+=(o.x+Math.cos(a)*90-e.x)*.2;e.y+=(o.y+Math.sin(a)*90-e.y)*.2;if(e.bm&&frame>=e.bm.t){const m=e.bm,q=P[m.tg];e.bm=null;ENT.push({k:'lbeam',o:e.o,t:8,x:e.x,y:e.y,x2:m.x2,y2:m.y2});sfx('se_lazer00',.4);if(q&&q.state!=='dead'&&segD(q.x,q.y,e.x,e.y,m.x2,m.y2)<bodyR(q)+6&&q.inv<=0)hit(q,o,q.x-e.x,q.y-e.y,{...IM.eye,dmg:IM.eye.dmg*.5},1,true)}
   if(++e.cd%240===0&&al.length&&!e.bm){const q=al[rng()*al.length|0];if(rng()<.5){e.st=90;e.tg=q.id}else{e.bm={t:frame+45,tg:q.id,x2:e.x+(q.x-e.x)*3,y2:e.y+(q.y-e.y)*3};sfx('aimreal',1.7)}}}break}
 case'kstr':{const d=e.d||1;e.pos+=7*d;const end=d<0?e.r[1]:e.h?e.r[3]:e.r[2];if(d>0?e.pos>end:e.pos<end)e.t=0;for(const q of al){if(q.state==='dash'||q.inv>0||(q.ksCD||0)>frame)continue;const d=e.h?Math.abs(q.y-e.pos):Math.abs(q.x-e.pos);if(d<bodyR(q)+7){q.ksCD=frame+20;hit(q,p,e.h?0:1,e.h?1:0,IM.string,1,true)}}
  for(const q of al)if(q.state==='dash'&&(e.h?Math.abs(q.y-e.pos):Math.abs(q.x-e.pos))<bodyR(q)+7&&(q.ksOK||0)<frame){q.ksOK=frame+20;txt(q.x,q.y-30,'NICE!','#fff',14)}break}
 case'moonf':if(e.t===1){shake=70;flash(.6,'#ffe8a0');sfx('se_enep01');for(let i=0;i<3;i++)WAVES.push({x:e.x,y:e.y,t:30+i*8,T:30+i*8,spd:20+i*6,th:60,inv:i%2,c:'#ffe8a0'});crack(e.x,e.y); // Clownpiece : la lune tombe
  for(const q of al)if(q.inv<=0&&Math.hypot(q.x-e.x,q.y-e.y)<220+bodyR(q)){if(parryOn(q))parryFx(q);else hit(q,p,q.x-e.x||1,q.y-e.y,IM.moon,1,true)}}break;
 case'dog':{let q=null,bd=1e9;for(const c of al){const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<bd){bd=d;q=c}}bd=bd||1;const tx=q?p.x+(q.x-p.x)/bd*55:p.x+40,ty=q?p.y+(q.y-p.y)/bd*55:p.y; /* bd||1: foe exactly on the owner gave 0/0 = NaN */e.x+=(tx-e.x)*.2;e.y+=(ty-e.y)*.2; // Aunn
  for(const b of B)if(!b.dead&&b.owner!==e.o&&!b.fake&&Math.abs(b.x-e.x)<b.r+22&&Math.abs(b.y-e.y)<b.r+22){b.dead=1;burst(b.x,b.y,'#5cff7a',4)}
  if(q&&Math.hypot(q.x-e.x,q.y-e.y)<60&&(q.dgCD||0)<frame&&q.inv<=0){q.dgCD=frame+40;hit(q,p,q.x-e.x,q.y-e.y,IM.bite,1,true);txt(q.x,q.y-40,'WOOF!','#5cff7a',16)}break}
 case'mirr':if(Math.hypot(p.x-e.x,p.y-e.y)<34&&(p.mrCD||0)<frame){const q=nearFoe(p.id,p.x,p.y);if(q){p.mrCD=frame+60;burst(p.x,p.y,'#ffd23a',16);const a=q.aim+Math.PI;p.x=clamp(q.x+Math.cos(a)*50,T.BODY_R,T.MAP_W-T.BODY_R);p.y=clamp(q.y+Math.sin(a)*50,T.BODY_R,T.MAP_H-T.BODY_R);burst(p.x,p.y,'#ffd23a',16); // Okina
   big('BACK DOOR!','#ffd23a',44);sfx('hit3');if(q.inv<=0){if(parryOn(q))parryFx(q);else hit(q,p,q.x-p.x,q.y-p.y,IM.backstab,1,true)}}}break;
 case'dream':e.x+=Math.cos(e.a)*.6;e.y+=Math.sin(e.a)*.6;e.a+=(rng()-.5)*.05;if(e.x<120||e.x>T.MAP_W-120)e.a=Math.PI-e.a;if(e.y<120||e.y>T.MAP_H-120)e.a=-e.a; // Doremy
  for(const q of P){if(q.state==='dead'||Math.hypot(q.x-e.x,q.y-e.y)>100||(e.cd[q.id]||0)>frame)continue;e.cd[q.id]=frame+180;
   if(!e.bad){const r=rng()*5|0;if(r===0)q.hp=Math.min(T.HP,q.hp+25);else if(r===1)q.spirit=Math.min(T.SPIRIT_MAX,q.spirit+50);else if(r===2)q.fx.haste=300;else if(r===3)q.kshield=1;else q.power=Math.min(T.POWER_MAX,q.power+.5);txt(q.x,q.y-40,['+25 HP','+50 SPELL','HASTE','SHIELD','+POWER'][r],'#ffd0f0',16)}
   else{const r=rng()*5|0;if(r===0)xDrug(q,rng()<.5?1:2);else if(r===1){q.ban={k:BANS[rng()*5|0],t:300}}else if(r===2)q.burn=180;else if(r===3)xFreeze(q);else{q.hp-=15;if(q.hp<=0)ko(q,'NIGHTMARE')}txt(q.x,q.y-40,'NIGHTMARE!','#c06cff',16)}}break;
 case'gapS':{const k=150-e.t;if(k===16){const o=P[e.o];if(o&&o.state!=='dead'){const L=ITEMS.map(i=>i.k).filter(x=>!YBAN.has(x)),t=L[rng()*L.length|0],sx=o.x,sy=o.y,si=item;o.x=e.x;o.y=e.y;item={x:e.x,y:e.y,cp:[],on:true};try{give0(o,t)}catch(er){}item=si;if(o.state==='idle'||o.state==='hitstun'||o.state==='atk'){o.x=sx;o.y=sy}e.it=t}}break} // Yukari : chaque fissure libère un pouvoir au hasard
 case'train':if(e.wait>0){if(--e.wait===0){sfx('se_enep01');shake=40}break}e.x+=45;if(e.x>e.x1){e.t=0;break}
  for(const q of al)if(q.inv<=0&&Math.abs(q.y-e.y)<46+bodyR(q)&&q.x<e.x+14&&q.x>e.x-600&&(q.trCD||0)<frame){q.trCD=frame+30;big('TRAIN!!','#c020e0',60);hit(q,p,1,0,IM.train,1,true)}break}}}});

DEFER(()=>{{const L0=cpuLate;cpuLate=(p,I)=>{L0(p,I);const O=CX.order;if(O&&O.ph===2&&p.id!==O.o&&rng()<.5+.05*cpuLv){if(O.k==='STOP!'){I.x=I.y=0}else if(O.k==='NO SHOOTING!')I.b.shot=false;else if(O.k==='MOVE!'&&Math.hypot(I.x,I.y)<.5)I.x=1;else if(O.k==='DASH!')I.b.dash=frame%10<2;else if(O.k==='PARRY!')I.b.parry=frame%10<2}}}});
function xHeadSwap(p,I){const hs=ENT.filter(e=>e.k==='head'&&e.o===p.id);if(!hs.length)return 0;let h=hs[0],bd=-1e9;for(const e of hs){const d=(e.x-p.x)*I.x+(e.y-p.y)*I.y;if(d>bd){bd=d;h=e}} // Sekibanki : échange avec une tête
 const x=p.x,y=p.y;burst(x,y,'#e04a4a',12);p.x=clamp(h.x,T.BODY_R,T.MAP_W-T.BODY_R);p.y=clamp(h.y,T.BODY_R,T.MAP_H-T.BODY_R);h.x=x;h.y=y;p.inv=Math.max(p.inv,10);p.boost-=T.DASH_COST;burst(p.x,p.y,'#e04a4a',12);sfx('roll2');return 1}
