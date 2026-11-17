'use strict';
// ================= Objets en jeu (lame, bombes, billes, fées, rayons de KO) =================
function stopRifle(p){if(p.rsrc){try{p.rsrc.stop()}catch(e){}p.rsrc=null}if(p.state==='rifle')p.state='idle'}
function fireRifle(p){stopRifle(p);p.rifle--;const c=Math.cos(p.aim),s=Math.sin(p.aim);
 B.push({x:p.x+c*22,y:p.y+s*22,vx:c*34,vy:s*34,r:5,owner:p.id,heavy:1,m:IM.rifle,mult:1,dist:0,life:90,dead:0,seen:0,home:0,gr:0,rifle:1,pierce:1});
 p.vx-=c*8;p.vy-=s*8;sfx('tan00');sfx('se_enep00',.5);shake=Math.min(28,shake+10);chroma=Math.max(chroma,12);flash(.2);
 for(let i=0;i<10;i++)LINES.push({x:p.x+c*22,y:p.y+s*22,a:p.aim+(Math.random()-.5)*1.2,t:10,T:10,len:50})}
const segD=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1,u=clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1);return Math.hypot(px-ax-u*dx,py-ay-u*dy)};
function hitFairy(b){for(const f of FAIRIES)if(f.o!==b.owner&&f.t>0&&Math.abs(f.x-b.x)<b.r+10&&Math.abs(f.y-b.y)<b.r+10){f.hp-=b.heavy?6:1;b.dead=1;spark(b.x,b.y);
 if(f.hp<=0){brk();txt(f.x,f.y-20,'FAIRY DOWN','#6cf',12);burst(f.x,f.y,'#6cf',14)}return}}
function hb(x,y,a,sp,o,c='#6cf'){if(B.length<T.MAX_B)B.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:12,owner:o,heavy:1,m:MOVES.heavyN,mult:.6,dist:0,life:320,dead:0,seen:0,home:0,gr:0,c})} // grosse balle de fée
function fb(x,y,a,sp,o,c){if(B.length<T.MAX_B)B.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:4,owner:o,heavy:0,dmg:1,life:150,dead:0,gr:0,home:0,c})}
const bodyR=p=>(p.giant>0?T.BODY_R*2:T.BODY_R)*(p.fx&&p.fx.tiny>0?.5:1)*xSz(p),coreR=p=>(p.giant>0?T.CORE_R*2.5:T.CORE_R)*(p.fx&&p.fx.tiny>0?.5:1)*xSz(p); // le géant est plus facile à toucher
function cloneOf(p){const x=T.MAP_W-p.x,y=T.MAP_H-p.y;let q=null,bd=1e9;for(const c of P)if(c!==p&&c.state!=='dead'){const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;q=c}}
 return{x,y,id:p.id,aim:q?Math.atan2(q.y-y,q.x-x):p.aim+Math.PI,buff:p.buff,power:p.power,focus:p.focus,mvName:p.mvName,shotT:p.shotT}} // clone miroir (symétrie par le centre)
function mirrorRef(b,t){sfx('katanazeroreflect',.6);const o=P[b.owner],a=o?Math.atan2(o.y-b.y,o.x-b.x):Math.atan2(-b.vy,-b.vx),s=Math.hypot(b.vx,b.vy)*1.1;
 Object.assign(b,{vx:Math.cos(a)*s,vy:Math.sin(a)*s,owner:t.id,gr:0});if(b.heavy)b.dist=b.m.arm;else b.c='#e0e6f0';spark(b.x,b.y);if(frame-sMir>3){sMir=frame;sfx('tan02',.3)}}
function snap(p){p.cam--;sfx('photo');const c=Math.cos(p.aim),s=Math.sin(p.aim),inF=(x,y)=>{const rx=x-p.x,ry=y-p.y;return Math.hypot(rx,ry)<380&&Math.abs(Math.atan2(ry*c-rx*s,rx*c+ry*s))<.55};
 sfx('tan02');sfx('se_kira00',.6);flash(.35);PHOTO.push({x:p.x,y:p.y,a:p.aim,t:20});
 for(const b of B)if(b.owner!==p.id&&inF(b.x,b.y))b.dead=1;
 for(const q of P)if(q!==p&&q.state!=='dead'&&q.inv<=0&&inF(q.x,q.y)){q.hp-=4;Object.assign(q,{state:'parrystun',t:40,vx:0,vy:0,charging:false});txt(q.x,q.y-30,'SNAP!','#d4a050',18)}}
let PERMFX,FXN;DEFER(()=>{PERMFX=new Set(['gung','kline','judge']);FXN={eat:'DARKNESS',pact:'PACT',four:'FOUR OF A KIND',winter:'WINTER',spin:'SPIN',ran:'KITSUNE',yslash:'SLASH',butter:'BUTTERFLY',notes:'MUSIC',immortal:'IMMORTAL',phoenix:'PHOENIX',smoke:'TOXIC',gung:'GUNGNIR',kline:'LINES',judge:'VERDICT',tiny:'TINY'}});
const gfx=(k,t,o)=>GFX.push({k,t,o}),gOn=(k,p)=>GFX.some(g=>g.k===k&&g.t>0&&g.o!==p.id); // effets globaux (touchent tout le monde sauf le lanceur)
const ELC=['#ff5030','#4ab3ff','#5cff7a','#e0e6f0','#c8a050']; // feu, eau, bois, métal, terre
function ring(x,y,n,sp,c,o,life=120,off=0,rad=0){for(let i=0;i<n&&B.length<T.MAX_B;i++){const a=off+i*TAU/n;B.push({x:x+Math.cos(a)*rad,y:y+Math.sin(a)*rad,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:4,owner:o,heavy:0,dmg:1,life,dead:0,gr:0,home:0,c:c||RB[i%6]})}}
const aimPt=o=>o.fx&&o.fx.invis>0?[o.x+Math.cos(frame*.013+o.id)*420,o.y+Math.sin(frame*.017+o.id*2)*320]:o.fx&&o.fx.illu>0?[o.x+Math.cos(frame*.04+o.id)*90,o.y+Math.sin(frame*.05+o.id*2)*90]:[o.x,o.y]; // Reisen : la visée vise l'illusion
function nearFoe(o,x,y,max=1e9){let q=null,bd=max;for(const c of P)if(c.id!==o&&c.state!=='dead'&&!ally(P[o],c)){const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;q=c}}return q}
function contact(p,m,cd){for(const q of P){if(q===p||q.state==='dead'||q.inv>0||(q[cd]||0)>frame)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<bodyR(p)+bodyR(q)+4){q[cd]=frame+20;hit(q,p,dx,dy,m,1,true)}}}
const GIVE={ // objets des personnages v3 : chaque objet renverse une règle
 rumia:p=>{p.fx.eat=480;big('THE DARKNESS FEEDS','#6b5bb0',40)},
 daiyousei:p=>{const r=xR();for(let i=0;i<7;i++){const[x,y]=xOnR(r,(i+.5)/7);ENT.push({k:'efairy',o:p.id,t:480,x,y,ph:i*5})}big('FAIRY AMBUSH!','#7fe0a0',44)},
 rin:p=>{CX.anon=480;for(let i=0;i<5;i++)ENT.push({k:'decoy',o:p.id,t:480,x:clamp(p.x+(rng()-.5)*700,40,T.MAP_W-40),y:clamp(p.y+(rng()-.5)*500,40,T.MAP_H-40),sx:rng()<.5?-1:1,sy:rng()<.5?-1:1,a:0});big('WHO IS WHO?','#9aa',56)},
 meiling:p=>{CX.wall={x:p.x,o:p.id,t:600};for(const q of P)q.gside=q.x>=p.x?1:-1;big('THE GATE IS CLOSED','#3fbf6f',44);shake=Math.min(30,shake+14)},
 koakuma:p=>{p.fx.pact=600;big('DEVIL PACT: K.O. SOMEONE IN 10 S','#c0392b',36)},
 patchouli:p=>{const o=[0,1,2,3,4].sort(()=>rng()-.5);CX.terr={o:p.id,t:720,ord:o,L:[o[0]]};big('PHILOSOPHER STONE: '+TN[o[0]],TC[o[0]],40)},
 remilia:p=>{p.fx.gung=2;big('HEAVY = GUNGNIR x2','#e0302f',40)},
 flandre:p=>{p.fx.four=600;big('FOUR OF A KIND','#ff3030',54)},
 letty:p=>{p.fx.winter=600;gfx('ice',600,p.id);big('ETERNAL WINTER','#cfe8ff',44)},
 chen:p=>{p.fx.spin=360;p.spinV=10;p.vx=Math.cos(p.aim)*10;p.vy=Math.sin(p.aim)*10},
 ran:p=>{p.fx.spin=600;p.fx.ran=600;p.spinV=9;p.vx=Math.cos(p.aim)*9;p.vy=Math.sin(p.aim)*9;big('ULTIMATE SHIKIGAMI','#f2c14e',44)},
 shanghai:p=>{const q=nearFoe(p.id,p.x,p.y);if(q){CX.swap={a:p.id,b:q.id,t:480};big('BODY SWAP!','#5aa0e0',56);flash(.3,'#5aa0e0')}},
 hourai:p=>{CX.link={o:p.id,t:480};const q=nearFoe(p.id,p.x,p.y);if(q)ENT.push({k:'voodoo',o:p.id,v:q.id,t:480,pins:0,x:clamp(p.x+Math.cos(p.aim)*120,40,T.MAP_W-40),y:clamp(p.y+Math.sin(p.aim)*120,40,T.MAP_H-40)});big('CURSED LINK','#e070a0',44)},
 lily:p=>{CX.spring={o:p.id,t:300};big('SPRING IS HERE!','#ffd6f0',54)},
 lunasa:p=>{CX.lun={o:p.id,t:360};p.fx.notes=360;p.noteC='#6a6ad8';big('TEMPO LENTO','#6a6ad8',44)},
 merlin:p=>{CX.mer={o:p.id,t:600};gfx('merlin',600,p.id);p.fx.notes=600;p.noteC='#e8e8ff';big('MANIA!!','#e8e8ff',60)},
 lyrica:p=>{CX.lyr={o:p.id,t:420};p.fx.notes=420;p.noteC='#ff6b6b';for(const b of B)if(b.owner!==p.id&&rng()<.5)b.fake=1;big('PHANTOM SOUNDS','#ff6b6b',44)},
 layla:p=>{CX.rhy={o:p.id,t:600,n:frame+60};big('FINAL CONCERT: PARRY ON THE BEAT!','#c8a0ff',34)},
 youmu:p=>{p.fx.yslash=600;p.myon=[];p.myx=p.x;p.myy=p.y;big('ATTACK = SLASH','#9fe0c0',40)},
 yuyuko:p=>{CX.yuyu={o:p.id,t:600};big('INVITATION TO DEATH','#ff9ad5',46)},
 saigyou:p=>{ENT.push({k:'tree',o:p.id,t:1e9,hp:150,x:item?item.x:T.MAP_W/2,y:item?item.y:T.MAP_H/2});big('SAIGYOU AYAKASHI: KILL OR DIE','#ffb7d5',40)},
 wriggle:p=>{Object.assign(p,{state:'cocoon',t:0,coc:0,cocDmg:0,cocQ:-1,vx:0,vy:0,charging:false});big('COCOON: WIGGLE THE STICK!','#c8ff5a',40)},
 mystia:p=>{CX.myst={o:p.id,t:480};big('NIGHT SPARROW','#b06cff',44)},
 keine:p=>xRewind(p),
 tewi:p=>{CX.rule={o:p.id,t:720,k:null}},
 reisen:p=>{CX.reis={o:p.id,t:480};for(const q of P)q.ofA=rng()*TAU;big('LUNATIC RED EYES','#ff3355',44)},
 eirin:p=>{CX.pill={o:p.id,t:600};big('PHARMACY OPEN','#7fa8ff',44)},
 kaguya:p=>{p.treas=0;p.fx.kline=3;TRE.forEach((n,i)=>ENT.push({k:'treasure',o:p.id,i,n,t:900,x:120+rng()*(T.MAP_W-240),y:120+rng()*(T.MAP_H-240)}));big('5 IMPOSSIBLE REQUESTS','#ffcf6a',40)},
 mokou:p=>{p.fx.phoenix=900;big('IMMORTAL KAMIKAZE','#ff4b1f',44)},
 medicine:p=>{p.fx.smoke=600;big('POISON TRAIL','#a050ff',40)},
 komachi:p=>{const r=xR();CX.shr={o:p.id,t:600,cx:(r[0]+r[2])/2,cy:(r[1]+r[3])/2};big('DISTANCE: ZERO','#e04a4a',54);sfx('se_cat00',.6)},
 eiki:p=>{p.fx.judge=5;p.jT=frame+20;big('VERDICT','#3a7f5a',56)}};
const TN=['FIRE','WATER','WOOD','METAL','EARTH'],TC=['#ff5030','#3a7fff','#5cff7a','#e0e6f0','#c8a050'],
 TRE=["Stone Bowl",'Jeweled Branch','Fire-Rat Robe','Dragon Jewel','Swallow Shell'],TRP=['SHIELD','REFLECT','FIRE & RED ZONE IMMUNE','HEAVY x1.5','SPELL FULL'],
 RULES=['GRAVITY','GIANTS','SHUFFLE','BULLETS x2','ITEM RAIN','TINY','HP ROTATE','REVERSE'];
const terrOn=(k,p)=>CX.terr&&CX.terr.L.includes(k)&&p.id!==CX.terr.o,tLucky=q=>CX.rule&&q.id===CX.rule.o&&CX.rule.luck,
 lunFz=id=>!!CX.lun&&id!==CX.lun.o&&id>=0&&frame%10<6+Math.min(3,(P[id]&&P[id].vuln)|0), // Lunasa : le temps ralentit pour les autres
 shrEdge=p=>{const s=CX.shr;return!!s&&s.x0!==undefined&&(p.x-s.x0<T.EDGE||s.x1-p.x<T.EDGE||p.y-s.y0<T.EDGE||s.y1-p.y<T.EDGE)},
 reisOff=q=>{if(!CX.reis||q.id===CX.reis.o)return null;const a=(q.ofA||0)+frame*.01;return[Math.cos(a)*80,Math.sin(a)*80]},
 xFour=p=>[0,1,2,3].map(k=>{const a=k*Math.PI/2+frame*.03;return[p.x+Math.cos(a)*90,p.y+Math.sin(a)*90]}),xPerfect=v=>(frame+v.id*23)%90>=80;
function xR(){let cx=0,cy=0,n=0;for(const q of P)if(q.state!=='dead'){cx+=q.x;cy+=q.y;n++}if(n){cx/=n;cy/=n}else{cx=T.MAP_W/2;cy=T.MAP_H/2} // rectangle "écran" autour des joueurs
 const hw=Math.min(T.MAP_W/2-20,600),hh=Math.min(T.MAP_H/2-20,340);cx=clamp(cx,hw+20,T.MAP_W-hw-20);cy=clamp(cy,hh+20,T.MAP_H-hh-20);return[cx-hw,cy-hh,cx+hw,cy+hh]}
function xOnR(r,u){const w=r[2]-r[0],h=r[3]-r[1];let d=u*2*(w+h);if(d<w)return[r[0]+d,r[1]];d-=w;if(d<h)return[r[2],r[1]+d];d-=h;if(d<w)return[r[2]-d,r[3]];d-=w;return[r[0],r[3]-d]}
function tagB(p,b){if(!p||!p.fx)return;if(CX.don){b.fake=1;b.don=1;b.home=0}if(p.fx.pure>0){b.pure=1;b.pierce=1}if(p.fx.four>0&&b.heavy){b.anni=1;b.pierce=1;b.r*=1.3;b.c='#ff3030'}
 if(CX.lyr&&p.id!==CX.lyr.o&&rng()<.5)b.fake=1;if(CX.rule&&CX.rule.k==='BULLETS x2'){b.vx*=2;b.vy*=2}if(CX.spring){b.flower=1;b.c='#ffb7d5'}}
function chInput(p,I){
 if(CX.rule&&CX.rule.k==='REVERSE'&&!tLucky(p))I={x:-I.x,y:-I.y,b:I.b};
 const d=p.drug;if(d){if(d.k==='DRUNK'){const a=Math.sin(frame*.06+p.id)*1.5,c=Math.cos(a),s=Math.sin(a);I={x:I.x*c-I.y*s,y:I.x*s+I.y*c,b:I.b}}
  else if(d.k==='HYPER'){if(Math.hypot(I.x,I.y)>.3)p.hyd=[I.x,I.y];else if(p.hyd)I={x:p.hyd[0],y:p.hyd[1],b:I.b}}}
 return I}
function chSpeed(p){const f=p.fx,d=p.drug;let k=1;if(f.tiny>0)k*=1.3;if(f.winter>0)k*=1.4;if(f.butter>0)k*=1.3;if(p.lily)k*=1+.04*p.lily;if(d)k*=d.k==='GIANT'?.6:d.k==='HYPER'?1.5:1;return k}
function chHit(v,a,dx,dy,m,mult,heavy){
 if(v.fx.immortal>0)return 1;
 if(v.kshield){v.kshield=0;v.inv=20;txt(v.x,v.y-30,"STONE BOWL!",'#e8d48a',16);RINGS.push({x:v.x,y:v.y,r:0,m:60,t:16,c:'#e8d48a'});return 1}
 if(v.fx.spin>0&&v.state!=='hitstun'){const l=Math.hypot(dx,dy)||1,V=v.spinV||9;v.vx=dx/l*V;v.vy=dy/l*V;xSpinBounce(v);v.inv=8;txt(v.x,v.y-30,'BOING!','#f2c14e',16);sfx('se_kira00',.5);return 1} // Chen/Ran : ricochet
 if(v.state==='cocoon'){const d=chDmg(v,a,m.dmg*mult*2,heavy);v.hp-=d;v.cocDmg+=d;v.flash=6;sfxDmg(v);if(v.hp<=0)ko(v,'K.O.');return 1}
 if(a&&a.state==='atk'){
  if(a.fx.eat>0&&v.dark>frame){xSwallow(v,a);return 1}
  if(a.fx.four>0&&xPerfect(v)){v.hp=0;big('KYUU TO SHITE... DOKAN!!','#ff3030',60);flash(.5,'#ff3030');shake=60;ko(v,'DESTROYED');return 1}}
 return 0}
function chDmg(v,a,d,heavy){
 if(a&&a.pStk&&(a.state==='atk'||!heavy))d*=Math.pow(1.3,a.pStk); // parades cumulées
 if(a){if(a.fx.butter>0)d*=2;if(a.lily)d*=1+.05*a.lily;if(heavy&&a.kdrag>frame)d*=1.5;if(v.fx.phoenix>0&&(a.fx.winter>0||terrOn(1,v)))d*=2} // Mokou craint l'eau
 if(v.vuln)d*=1+.15*Math.min(5,v.vuln);if(v.drug&&v.drug.k==='TINY')d*=1.5;
 if(v.frozen>0&&heavy){d*=2.5;xUnfreeze(v);big('SHATTER!','#cfe8ff',40);sfx('se_enep00',.7)}
 if(a&&a!==v){v.pStk=0;a.dmgDealt=(a.dmgDealt||0)+d;v.dmgTk=(v.dmgTk||0)+d;if(d>(a.bigHit||0))a.bigHit=d;v.lastHit=a.id;v.lastHitF=frame}
 if(CX.link&&!CX.linkIn&&v.id!==CX.link.o){CX.linkIn=1;for(const q of P)if(q!==v&&q.id!==CX.link.o&&q.state!=='dead'){q.hp-=d;q.flash=4;if(FX.length<480)FX.push({x:q.x,y:q.y-10,vx:0,vy:-1,t:20,c:'#e070a0'});if(q.hp<=0)ko(q,'CURSED LINK')}CX.linkIn=0} // Hourai
 return d}
function chBullet(b,t){const o=P[b.owner];
 if(b.flower){t.hp=Math.min(T.HP,t.hp+(b.heavy?6:2));b.dead=1;if(FX.length<480)FX.push({x:b.x,y:b.y,vx:0,vy:-1,t:20,c:'#ffb7d5'});return 1} // Lily : les balles soignent
 if(t.fx.immortal>0){b.dead=1;return 1}
 if(t.kref>frame){const s=Math.hypot(b.vx,b.vy)*1.2;Object.assign(b,{owner:t.id,vx:-b.vx/Math.hypot(b.vx,b.vy)*s||0,vy:-b.vy/Math.hypot(b.vx,b.vy)*s||0,gr:0,dist:b.m?b.m.arm||0:0});burst(b.x,b.y,'#ffcf6a',6);return 1}
 if(b.pill){if(t.id!==b.owner)xDrug(t,b.pill);b.dead=1;return 1}
 if(t.fx.butter>0&&!b.heavy)return 1; // papillon : vole au-dessus des petites balles
 if(b.note)t.vuln=(t.vuln||0)+1;if(b.dark)t.dark=frame+300;
 if(b.anni){if(b.hitT&&b.hitT.has(t.id))return 1;(b.hitT||(b.hitT=new Set())).add(t.id);hit(t,o,b.vx,b.vy,b.m,b.mult,true);return 1}
 if(t.frozen>0&&o&&(o.fx.phoenix>0||o.star>0))xMelt(t);
 return 0}
function chMelee(p){const f=p.fx;
 if(f.kline>0){f.kline--;const c=Math.cos(p.aim),s=Math.sin(p.aim);ENT.push({k:'kline',o:p.id,t:600,x1:p.x,y1:p.y,x2:clamp(p.x+c*340,0,T.MAP_W),y2:clamp(p.y+s*340,0,T.MAP_H),id:frame+rng()});sfx('roll2');txt(p.x,p.y-30,'INSTANT LINE '+f.kline,'#ffcf6a',14);return 1}
 if(f.yslash>0){if((p.ysCD||0)>frame)return 1;p.ysCD=frame+90;xSlash(p,p.aim,false);p.myon.push({t:frame+24,a:p.aim});return 1}
 return 0}
function xSlash(p,a,my){const c=Math.cos(a),s=Math.sin(a),x0=my?p.myx:p.x,y0=my?p.myy:p.y,x2=clamp(x0+c*220,T.BODY_R,T.MAP_W-T.BODY_R),y2=clamp(y0+s*220,T.BODY_R,T.MAP_H-T.BODY_R);
 SLASH.push({x1:x0,y1:y0,x2,y2,t:22,o:p.id,tg:P.filter(q=>q!==p&&q.state!=='dead'&&segD(q.x,q.y,x0,y0,x2,y2)<bodyR(q)+30)});
 if(my){p.myx=x2;p.myy=y2}else{p.x=x2;p.y=y2;p.inv=Math.max(p.inv,8);p.vx=c*4;p.vy=s*4}sfx('roll2',.8)}
function xSwallow(v,a){Object.assign(v,{state:'eaten',eatBy:a.id,t:150,vx:0,vy:0,charging:false,dark:0});big('CHOMP!','#6b5bb0',60);sfx('hit3');shake=Math.min(30,shake+14);a.fx.eat=Math.max(a.fx.eat,160)}
function updEaten(p){const e=P[p.eatBy];p.inv=Math.max(p.inv,2);if(!e||e.state==='dead'){p.state='idle';return}p.x=e.x;p.y=e.y;
 if(p.t%10===0){p.hp-=2;e.hp=Math.min(T.HP,e.hp+2);if(p.hp<=0){p.inv=0;ko(p,'DIGESTED');return}}
 if(--p.t<=0){const c=Math.cos(e.aim),s=Math.sin(e.aim);Object.assign(p,{state:'hitstun',t:400,spit:1,x:e.x+c*36,y:e.y+s*36,vx:c*24,vy:s*24,inv:3});big('PTOOEY!','#6b5bb0',54);sfx('tan02');WAVES.push({x:e.x,y:e.y,t:14,T:14,spd:12,th:24,inv:1})}}
function xSpitWall(p,ax){if(p.spit===1&&p.hp<=0){p.spit=0;ko(p,'MAX POWER K.O.!');return}if(p.spit===2){if(p.beamPip){p.beamPip=0;p.pips=Math.max(0,p.pips-1);txt(p.x,p.y-46,'WALL '+p.pips+'/'+T.PIPS,'#f66');sfx('bord_brise',.8)}p.spit=0;p.state='idle';p.t=0;if(ax)p.vy=0;else p.vx=0;shake=Math.min(40,shake+16);burst(p.x,p.y,'#6ff',24);txt(p.x,p.y-40,'PUSHED TO THE EDGE!','#6ff',18);return} // poussé par le rayon parré
 p.spit=0;p.hp-=16;p.t=24;shake=Math.min(40,shake+20);flash(.3);burst(p.x,p.y,'#6b5bb0',30);big('SPLAT!','#fff',60);sfx('se_enep00');
 if(p.pips<=0||p.hp<=0){ko(p,p.hp<=0?'K.O.':'SPAT OUT!');return}p.pips--;txt(p.x,p.y-46,'WALL '+p.pips+'/'+T.PIPS,'#f66');if(ax)p.vy*=-.3;else p.vx*=-.3}
function updCocoon(p,I){p.vx*=.8;p.vy*=.8;p.t++;const l=Math.hypot(I.x,I.y); // Wriggle : secouer le stick pour éclore
 if(l>.6){const qd=Math.round(Math.atan2(I.y,I.x)/(Math.PI/2))&3;if(qd!==p.cocQ){if(p.cocQ>=0){p.coc+=5;if(FX.length<480)FX.push({x:p.x+(Math.random()-.5)*30,y:p.y+(Math.random()-.5)*30,vx:0,vy:-1,t:14,c:'#c8ff5a'})}p.cocQ=qd}}
 if(p.cocDmg>=25||p.t>480){p.state='parrystun';p.t=40;big('COCOON BROKEN...','#888',36);sfx('cancel00');return}
 if(p.coc>=100){p.state='idle';p.fx.butter=600;p.inv=30;big('BUTTERFLY!','#c8ff5a',60);flash(.3,'#c8ff5a');WAVES.push({x:p.x,y:p.y,t:24,T:24,spd:20,th:40,inv:1});sfx('se_powerup')}}
function xSpinBounce(p){if(p.fx.ran>0)p.spinV=Math.min(24,(p.spinV||9)*1.05);burst(p.x,p.y,'#f2c14e',4)}
function xSpinRam(p){for(const q of P){if(q===p||q.state==='dead'||q.inv>0||(q.cCD||0)>frame)continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;
 if(d<bodyR(p)+bodyR(q)+4){q.cCD=frame+20;hit(q,p,dx,dy,IM.spin,p.fx.ran>0?1.4:1,true);const V=p.spinV||9;p.vx=-dx/d*V;p.vy=-dy/d*V;xSpinBounce(p)}}}
function xFreeze(q){Object.assign(q,{frozen:150,state:'parrystun',t:150,vx:0,vy:0,charging:false,still:0});txt(q.x,q.y-30,'FROZEN!','#cfe8ff',18);sfx('se_kira00',.6)}
function xUnfreeze(q){q.frozen=0;q.frzImm=frame+90;if(q.state==='parrystun'){q.state='idle';q.t=0}}
function xMelt(q){xUnfreeze(q);q.burn=120;txt(q.x,q.y-30,'MELTED!','#ff7b2c',16)}
function xDrug(q,c){const k=c===1?(rng()<.5?'GIANT':'HYPER'):(rng()<.5?'TINY':'DRUNK');q.drug={k,t:360};if(k==='GIANT')q.giant=Math.max(q.giant,360);if(k==='TINY')q.fx.tiny=360;
 txt(q.x,q.y-40,k+'!',c===1?'#ff3355':'#3a7fff',20);sfx('se_powerup',.5)}
function xRewind(p){for(const q of P){if(q===p||!q.h10||!q.h10.length)continue;const h=q.h10[0]; // Keine : les autres reviennent 10 s en arrière
  if(!h.dead){if(q.state==='dead'){for(let i=KOB.length-1;i>=0;i--)if(KOB[i].o===q.id)KOB.splice(i,1);Object.assign(q,{state:'idle',t:0,inv:60})}Object.assign(q,{x:h.x,y:h.y,vx:0,vy:0})}
  Object.assign(q,{hp:h.hp,stocks:h.st,spirit:h.sp,burst:h.bu,pips:h.pi,power:h.pw});q.h10=[];burst(q.x,q.y,'#5a8cff',20)}
 big('HISTORY REWRITTEN','#5a8cff',56);sfx('se_kira00');WAVES.push({x:p.x,y:p.y,t:40,T:40,spd:40,th:90,inv:1});flash(.4,'#5a8cff');chroma=Math.max(chroma,20)}
function xPact(k){let t=null;for(const q of P)if(q!==k&&q.stocks>0&&(!t||q.stocks>t.stocks||q.stocks===t.stocks&&q.hp>t.hp))t=q; // Koakuma
 if(t&&(t.stocks>k.stocks||t.stocks===k.stocks&&t.hp>k.hp)){for(const f of['stocks','spirit','burst','power']){const v=k[f];k[f]=t[f];t[f]=v}if(t.state!=='dead'){const h=k.hp;k.hp=t.hp;t.hp=h}big('PACT SEALED: P'+(k.id+1)+' <-> P'+(t.id+1),'#c0392b',44)}
 else{if(k.stocks>1){k.stocks--;big('PACT BROKEN: -1 SOUL','#c0392b',44)}else{k.hp=0;ko(k,'PACT BROKEN')}}flash(.4,'#c0392b');sfx('se_cat00');WAVES.push({x:k.x,y:k.y,t:30,T:30,spd:30,th:60,inv:1})}
function xTrial(J){const al=P.filter(q=>q.state!=='dead');if(al.length<2)return;let g=al[0],n=al[0];for(const q of al){if((q.dmgDealt||0)>(g.dmgDealt||0))g=q;if((q.dmgDealt||0)<(n.dmgDealt||0))n=q} // Eiki
 if(J&&(g===J||TEAMS&&TEAMA[g.id]===TEAMA[J.id])){big('NOT GUILTY: NO VERDICT','#3a7f5a',40);return} // Eiki juge : son porteur (et son équipe) ne peut pas être condamné
 if(g===n)g=al[rng()*al.length|0];if(n===g)n=al.find(q=>q!==g);big('GUILTY: P'+(g.id+1)+'  /  INNOCENT: P'+(n.id+1),'#3a7f5a',40);n.stocks++;txt(n.x,n.y-40,'+1 LIFE','#9f9',20);g.inv=0;ko(g,'GUILTY!')}
function chKill(v){const k=v.lastHit!==undefined&&frame-v.lastHitF<240?P[v.lastHit]:null;if(!k||k===v)return;
 if(k.fx.pact>0){k.fx.pact=0;k.pactPend=1}
 for(const e of ENT)if(e.k==='tree'&&e.o===k.id&&e.t>0){e.t=0;big('THE TREE IS SATISFIED','#ffb7d5',40);burst(e.x,e.y,'#ffb7d5',40)}}
function fxEnd(p,k){if(k==='pact')txt(p.x,p.y-40,'PACT EXPIRED','#888',16);else if(k==='spin')p.spinV=0;else if(k==='yslash')p.myon=[]}
function chEnd(k){if(k==='yuyu'){const al=P.filter(q=>q.state!=='dead');if(al.length>1){let m=al[0];for(const q of al)if(q.hp<m.hp)m=q;big('DEATH TAKES P'+(m.id+1),'#ff9ad5',56);m.inv=0;ko(m,'INVITED TO DEATH')}}}
function chPre(){
 for(const k of['wall','swap','link','spring','lun','mer','lyr','rhy','yuyu','myst','rule','reis','pill','shr','terr'])if(CX[k]&&--CX[k].t<=0){CX[k]=null;chEnd(k)}
 if(CX.anon>0)CX.anon--;
 if(frame%6===0)for(const q of P){(q.h10||(q.h10=[])).push({x:q.x,y:q.y,hp:q.hp,st:q.stocks,sp:q.spirit,bu:q.burst,pi:q.pips,pw:q.power,dead:q.state==='dead'});if(q.h10.length>100)q.h10.shift()}
 const al=P.filter(q=>q.state!=='dead'),abs=[];
 for(const b of B){if(b.dead)continue;if(b.sway)b.vx=Math.sin((frame+b.y)*.03)*1.4;if(b.dark||b.anni)abs.push(b);if(b.gung&&frame%3===0&&ENT.length<400)ENT.push({k:'gtrail',o:b.owner,t:300,x:b.x,y:b.y});if(CX.spring&&!b.flower){b.flower=1;b.c='#ffb7d5'}}
 for(const a of abs)for(const b of B){if(b===a||b.dead||b.owner===a.owner||b.fake)continue;const rr=a.r+b.r;if(Math.abs(b.x-a.x)<rr&&Math.abs(b.y-a.y)<rr&&Math.hypot(b.x-a.x,b.y-a.y)<rr){b.dead=1;if(a.dark)a.r=Math.min(46,a.r+.5)}} // ténèbres / destruction : effacent les balles
 for(const p of al){const f=p.fx;p.inCloud=p.pois>0;
  if(p.pactPend){p.pactPend=0;xPact(p)}
  for(const k in f)if(f[k]>0&&!PERMFX.has(k)){if(--f[k]===0)fxEnd(p,k)}
  if(p.burn>0){p.burn--;if(!p.krobe){p.hp-=.08;if(frame%4===0)FX.push({x:p.x+(rng()-.5)*16,y:p.y,vx:0,vy:-1.4,t:14,c:'#ff7b2c'});if(p.hp<=0){ko(p,'BURNT');continue}}}
  if(p.pois>0){p.pois--;p.hp-=.1;if(p.hp<=0){ko(p,'POISONED');continue}}
  if(p.lily>0&&--p.lilyT<=0)p.lily=0;if(p.drug&&--p.drug.t<=0)p.drug=null;
  if(p.frozen>0&&--p.frozen===0)xUnfreeze(p);
  if(p.cage){if(--p.cage.t<=0)p.cage=null;else{const dx=p.x-p.cage.x,dy=p.y-p.cage.y,d=Math.hypot(dx,dy);if(d>50){p.x=p.cage.x+dx/d*50;p.y=p.cage.y+dy/d*50;p.vx*=-.5;p.vy*=-.5}}}
  if(f.eat>0&&f.eat%50===0&&B.length<T.MAX_B){const q=nearFoe(p.id,p.x,p.y),a=q?Math.atan2(q.y-p.y,q.x-p.x):p.aim;B.push({x:p.x,y:p.y,vx:Math.cos(a)*2.6,vy:Math.sin(a)*2.6,r:24,owner:p.id,heavy:1,m:IM.dark,mult:1,dist:999,life:300,dead:0,seen:0,home:.01,gr:0,dark:1,c:'#1a0f2e'})}
  if(f.spin>0)xSpinRam(p);
  if(f.ran>0&&frame%9===0)for(let i=0;i<3;i++)hb(p.x,p.y,frame*.13+i*TAU/3,3.4,p.id,'#f2c14e');
  if(f.four>0&&p.state==='atk'&&p.mv&&!p.mv.spd){const m=p.mv;if(p.t>m.start&&p.t<=m.start+m.act)for(const c of xFour(p))for(const q of al){if(q===p||q.inv>0||(q.fCD||0)>frame)continue;
   if(Math.hypot(q.x-c[0],q.y-c[1])<(m.range||40)+bodyR(q)+10){q.fCD=frame+20;hit(q,p,q.x-c[0],q.y-c[1],m,1,false)}}}
  if(f.winter>0){for(const q of al)if(q!==p&&!(q.frozen>0)&&(q.frzImm||0)<frame){if(Math.hypot(q.vx,q.vy)<.6&&q.state==='idle'){if((q.still=(q.still||0)+1)>=60)xFreeze(q)}else q.still=0}
   if(frame%7===0&&al.length){const q=al[rng()*al.length|0];ENT.push({k:'flake',o:p.id,t:360,x:q.x+(rng()-.5)*900,y:q.y-380-rng()*100,ph:rng()*TAU})}}
  if(f.yslash>0){if(!p.myon){p.myon=[];p.myx=p.x;p.myy=p.y}const tx=p.x-Math.cos(p.aim)*42,ty=p.y-Math.sin(p.aim)*42;p.myx+=(tx-p.myx)*.1;p.myy+=(ty-p.myy)*.1;
   for(const s of p.myon)if(frame>=s.t){xSlash(p,s.a,true);s.t=-1}p.myon=p.myon.filter(s=>s.t>=0)}
  if(f.smoke>0&&Math.hypot(p.vx,p.vy)>1&&frame%5===0&&CLOUDS.length<120)CLOUDS.push({x:p.x,y:p.y,r:22+rng()*18,t:200,o:p.id,ph:rng()*TAU,k:[0,1,2,3,4].map(()=>.6+rng()*.6)});
  if(f.immortal>0){p.inv=Math.max(p.inv,3);for(const q of al)if(q!==p&&q.inv<=0&&q.state!=='dead'&&Math.hypot(q.x-p.x,q.y-p.y)<bodyR(p)+bodyR(q)+4){q.hp=0;ko(q,'IMPERISHABLE')}}
  if(f.notes>0&&f.notes%45===0&&B.length<T.MAX_B){const fs=al.filter(q=>q!==p);if(fs.length){const q=fs[rng()*fs.length|0],a=rng()*TAU,x=clamp(q.x+Math.cos(a)*300,20,T.MAP_W-20),y=clamp(q.y+Math.sin(a)*300,20,T.MAP_H-20),b=Math.atan2(q.y-y,q.x-x);
   B.push({x,y,vx:Math.cos(b)*2.4,vy:Math.sin(b)*2.4,r:16,owner:p.id,heavy:1,m:IM.note,mult:1,dist:999,life:320,dead:0,seen:0,home:.006,gr:0,note:1,c:p.noteC})}}
  if(f.judge>0&&frame>=p.jT){const fs=al.filter(q=>q!==p);if(fs.length){const q=fs[(5-f.judge)%fs.length];JUDG.push({x:q.x,y:q.y,t:70,o:p.id});txt(q.x,q.y-40,'FOULS x'+Math.min(q.sins||0,6),'#9f9',16);sfx('se_kira00',.5)}
   if(--f.judge===0)p.trialT=frame+110;p.jT=frame+30}
  if(p.trialT&&frame>=p.trialT){p.trialT=0;xTrial(p)}}
 if(!CX.lun&&!CX.mer&&!CX.lyr)for(const q of P)q.vuln=0;
 if(CX.swap){const a=P[CX.swap.a],b=P[CX.swap.b];if(!a||!b||a.state==='dead'||b.state==='dead')CX.swap=null}
 if(CX.wall){const w=CX.wall,o=P[w.o];if(!o||o.state==='dead')CX.wall=null;else{o.gside=o.x>=w.x?1:-1; // Meiling : la porte
  for(const q of al){if(q===o||q.state==='dead')continue;const R=bodyR(q);if(q.gside===undefined)q.gside=q.x>=w.x?1:-1;if(q.gside>0&&q.x<w.x+R){q.x=w.x+R;wall(q,0)}else if(q.gside<0&&q.x>w.x-R){q.x=w.x-R;wall(q,0)}
   if(q.state!=='dead'&&q.gside===o.gside&&Math.hypot(q.x-o.x,q.y-o.y)<bodyR(q)+bodyR(o)+18&&(q.mkCD||0)<frame&&q.inv<=0&&o.state!=='hitstun'){q.mkCD=frame+70;SMR.push({x:o.x,y:o.y,a:Math.atan2(q.y-o.y,q.x-o.x),t:16});sfx('swordheavy',.6);txt(o.x,o.y-40,'RAINBOW KICK!',RB[frame%6],16);if(parryOn(q))parryFx(q);else hit(q,o,q.x-o.x,q.y-o.y,IM.mkick,1,true)}}
  for(const b of B)if(b.owner!==w.o&&(b.x-w.x)*(b.x-b.vx-w.x)<0){b.dead=1;if(FX.length<480)FX.push({x:b.x,y:b.y,vx:0,vy:0,t:10,c:'#3fbf6f'})}}}
 if(CX.spring&&CX.spring.t%15===0){const o=P[CX.spring.o];ENT.push({k:'petal',o:o.id,t:420,x:o.x+(rng()-.5)*700,y:o.y-420,ph:rng()*TAU})}
 if(CX.lyr){const L=CX.lyr,o=P[L.o],fs=al.filter(q=>q!==o); // Lyrica : illusions
  if(fs.length&&frame%5===0&&B.length<T.MAX_B){const q=fs[rng()*fs.length|0],a=rng()*TAU,x=q.x+Math.cos(a)*350,y=q.y+Math.sin(a)*350,b=Math.atan2(q.y-y,q.x-x),hv=rng()<.3,ow=P[rng()*P.length|0].id;
   B.push({x,y,vx:Math.cos(b)*3,vy:Math.sin(b)*3,r:hv?12:4,owner:ow,heavy:hv?1:0,m:MOVES.heavyN,mult:1,dist:999,dmg:0,life:200,dead:0,seen:0,gr:1,home:0,fake:1})}
  if(L.t%140===70){big('K.O.!','#fff',110);sfx('se_enep01',.4);flash(.3)}
  if(L.t%200===100&&fs.length){const q=fs[rng()*fs.length|0];ENT.push({k:'fakeitem',o:o.id,t:240,x:clamp(q.x+(rng()-.5)*300,40,T.MAP_W-40),y:clamp(q.y+(rng()-.5)*300,40,T.MAP_H-40)})}}
 if(CX.rhy){const R=CX.rhy;if(frame===R.n)sfx('se_select00',.4);if(frame===R.n+8){for(const q of al)if(q.id!==R.o){if(Math.abs((q.lpF||-99)-R.n)<=8)txt(q.x,q.y-60,'PERFECT','#fff',16); // Layla
    else{q.hp-=6;q.flash=6;txt(q.x,q.y-60,'MISS','#c8a0ff',18);sfxDmg(q);if(q.hp<=0)ko(q,'OUT OF TUNE')}}R.n+=30}}
 if(CX.yuyu){const Y=CX.yuyu,o=P[Y.o];if(Y.t%60===0)big(''+(Y.t/60),'#ff9ad5',90,'yuyu');
  if(frame%3===0)for(let i=0;i<2&&B.length<T.MAX_B;i++){if(!al.length)break;const q=al[rng()*al.length|0];B.push({x:q.x+(rng()-.5)*1000,y:q.y-420,vx:0,vy:2.3,r:5,owner:o.id,heavy:0,dmg:1,life:400,dead:0,gr:0,home:0,sway:1,c:'#ffb7d5'})}
  if(frame%36===0){ring(o.x,o.y,14,2.2,'#ff9ad5',o.id,240,frame*.05);ring(o.x,o.y,14,3,'#ffd0e8',o.id,240,-frame*.05)}
  if(frame%80===0&&al.length){const q=al[rng()*al.length|0];ENT.push({k:'fruit',o:o.id,t:400,x:q.x+(rng()-.5)*500,y:q.y-400})}}
 if(CX.rule){const r=CX.rule;if((720-r.t)%120===1){r.k=RULES[rng()*RULES.length|0];r.luck=rng()<.5;big('RULE: '+r.k+(r.luck?'  (TEWI IS LUCKY)':''),'#ff8fb0',44);sfx('se_cardget',.7);xRule(r,al)} // Tewi
  if(r.k==='GRAVITY')for(const q of al)if(!tLucky(q))q.vy+=.45;
  if(r.k==='GIANTS')for(const q of al)q.giant=Math.max(q.giant,2);
  if(r.k==='TINY')for(const q of al)if(!tLucky(q))q.fx.tiny=Math.max(q.fx.tiny||0,2)}
 if(CX.pill&&frame%16===0&&B.length<T.MAX_B){const o=P[CX.pill.o],fs=al.filter(q=>q!==o);if(fs.length){const[x,y]=xOnR(xR(),rng()),q=fs[rng()*fs.length|0],a=Math.atan2(q.y-y,q.x-x)+(rng()-.5)*.5,k=rng()<.5?1:2; // Eirin
  B.push({x,y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,r:9,owner:o.id,heavy:0,dmg:0,life:500,dead:0,gr:1,home:0,pill:k,sh:'pill',ang:a,c:k===1?'#ff3355':'#3a7fff'})}}
 if(CX.shr){const s=CX.shr,k=Math.min(1,(600-s.t)/45,s.t/45); // Komachi : l'arène rétrécit
  Object.assign(s,{x0:(s.cx-280)*k,x1:T.MAP_W+(s.cx+280-T.MAP_W)*k,y0:(s.cy-190)*k,y1:T.MAP_H+(s.cy+190-T.MAP_H)*k});
  for(const q of al){if(q.state==='dead')continue;const R=bodyR(q);if(q.x<s.x0+R){q.x=s.x0+R;wall(q,0)}else if(q.x>s.x1-R){q.x=s.x1-R;wall(q,0)}if(q.state==='dead')continue;if(q.y<s.y0+R){q.y=s.y0+R;wall(q,1)}else if(q.y>s.y1-R){q.y=s.y1-R;wall(q,1)}}
  for(const b of B)if(b.x<s.x0-10||b.x>s.x1+10||b.y<s.y0-10||b.y>s.y1+10)b.dead=1}
 if(CX.terr){const r=CX.terr,e=720-r.t; // Patchouli : les terrains s'accumulent
  if(e>0&&e%144===0&&r.L.length<5){const k=r.ord[r.L.length];r.L.push(k);big('+ '+TN[k],TC[k],44);sfx('se_kira00')}
  for(const q of al){if(q.id===r.o||q.state==='dead')continue;const v=Math.hypot(q.vx,q.vy);
   if(r.L.includes(0)&&v<1.2&&!q.krobe){q.hp-=.12;if(frame%5===0)FX.push({x:q.x+(rng()-.5)*20,y:q.y+8,vx:0,vy:-1.5,t:16,c:'#ff5030'});if(q.frozen>0)xMelt(q);if(q.hp<=0){ko(q,'BURNT');continue}}
   if(r.L.includes(1)&&q.fx.phoenix>0)q.hp-=.08;
   if(r.L.includes(2)){if((q.root||0)<0)q.root++;else if(v<1&&q.state==='idle'){if((q.root=(q.root||0)+1)>=45){q.root=-90;Object.assign(q,{state:'parrystun',t:50,vx:0,vy:0});txt(q.x,q.y-30,'ROOTED!','#5cff7a',16)}}else q.root=0}}
  if(r.L.includes(3))for(const b of B){if(b.x<6||b.x>T.MAP_W-6){b.vx=-b.vx;b.x=clamp(b.x,6,T.MAP_W-6);b.life=Math.max(b.life,60)}if(b.y<6||b.y>T.MAP_H-6){b.vy=-b.vy;b.y=clamp(b.y,6,T.MAP_H-6);b.life=Math.max(b.life,60)}}
  if(r.L.includes(4)&&e%120===60){shake=Math.min(40,shake+20);sfx('se_enep00',.6);for(const q of al)if(q.id!==r.o&&q.state!=='spell'&&q.state!=='dead'&&q.inv<=0){const a=rng()*TAU;q.vx+=Math.cos(a)*11;q.vy+=Math.sin(a)*11;q.hp-=3;Object.assign(q,{state:'hitstun',t:16,charging:false})}}}}
function xRule(r,al){const o=P[r.o];
 if(r.k==='SHUFFLE'&&al.length>1){const ps=al.map(q=>[q.x,q.y]);al.forEach((q,i)=>{const s=ps[(i+1)%ps.length];burst(q.x,q.y,'#ff8fb0',10);q.x=s[0];q.y=s[1];q.vx=q.vy=0})}
 else if(r.k==='BULLETS x2')for(const b of B){b.vx*=2;b.vy*=2}
 else if(r.k==='ITEM RAIN'){const L=ITEMS.filter(i=>!i.rare&&i.k!=='tewi');for(let i=0;i<3;i++)ENT.push({k:'book',it:L[rng()*L.length|0].k,g:frame*10+i,o:o.id,t:400,x:clamp(o.x+(rng()-.5)*700,40,T.MAP_W-40),y:clamp(o.y+(rng()-.5)*500,40,T.MAP_H-40)})}
 else if(r.k==='HP ROTATE'){const L=al.filter(q=>!(r.luck&&q===o));if(L.length>1){const h=L.map(q=>q.hp);L.forEach((q,i)=>q.hp=h[(i+1)%h.length])}}}
function heavyItem(p,o){const f=p.fx; // objets déclenchés par le bouton Lourde
 if(f.gung>0){f.gung--;const c=Math.cos(p.aim),s=Math.sin(p.aim);B.push({x:p.x+c*30,y:p.y+s*30,vx:c*15,vy:s*15,r:34,owner:p.id,heavy:1,m:IM.gung,mult:1,dist:999,life:160,dead:0,seen:0,home:0,gr:0,pierce:1,anni:1,gung:1,c:'#e0302f'});
  sfx('tan00');sfx('se_enep00',.6);big('SPEAR THE GUNGNIR!','#e0302f',54);shake=Math.min(30,shake+12);flash(.25,'#e0302f');return 1}
 return 0}
function cpuCh(p,I){if(p.state==='cocoon'){const a=frame*(.15+.05*cpuLv);I.x=Math.cos(a);I.y=Math.sin(a);return 1}return 0}
function cpuLate(p,I){if(CX.rhy&&p.id!==CX.rhy.o&&CX.rhy.n-frame===1&&rng()<.35+.07*cpuLv)I.b.parry=true}
function updEnt(e){const p=P[e.o];e.t--;if(!p||p.state==='dead'){e.t=0;return}
 const touch=(r,fn)=>{for(const q of P)if(q.state!=='dead'&&Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+r){fn(q);return}};
 switch(e.k){
 case'book':touch(16,q=>{for(const o of ENT)if(o.k==='book'&&o.g===e.g)o.t=0;txt(q.x,q.y-50,q===p?'Good choice!':'STOLEN!','#c0392b',16);give(q,e.it)});break;
 case'efairy':if((frame+e.ph)%26===0){const fs=P.filter(q=>q.id!==e.o&&q.state!=='dead');if(fs.length){const q=fs[rng()*fs.length|0],a=Math.atan2(q.y-e.y,q.x-e.x),r=rng();
   if(r<.4)hb(e.x,e.y,a,3.2,e.o,'#7fe0a0');else if(r<.7)ring(e.x,e.y,8,2.4,'#bff0c8',e.o,200,rng()*TAU);else for(let i=-2;i<=2;i++)fb(e.x,e.y,a+i*.18,3.6,e.o,'#7fe0a0')}}break;
 case'decoy':e.x+=p.vx*e.sx;e.y+=p.vy*e.sy;if(e.x<30||e.x>T.MAP_W-30)e.sx*=-1;if(e.y<30||e.y>T.MAP_H-30)e.sy*=-1;e.x=clamp(e.x,30,T.MAP_W-30);e.y=clamp(e.y,30,T.MAP_H-30);e.a=Math.atan2(Math.sin(p.aim)*e.sy,Math.cos(p.aim)*e.sx);break;
 case'gtrail':for(const q of P){if(q.id===e.o||q.state==='dead'||q.inv>0||(q.gtCD||0)>frame)continue;if(Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+18){q.gtCD=frame+45;if(parryOn(q)){parryFx(q);continue}
   hit(q,p,q.x-e.x||1,q.y-e.y,IM.gtr,1,true);q.cage={x:q.x,y:q.y,t:150};txt(q.x,q.y-40,'CAGED!','#e0302f',18)}}break;
 case'flake':e.y+=1.5;e.x+=Math.sin(frame*.05+e.ph)*.8;for(const q of P){if(q.id===e.o||q.state==='dead'||q.inv>0||Math.hypot(q.x-e.x,q.y-e.y)>bodyR(q)+10)continue;e.t=0;
   if(q.fx.phoenix>0){q.hp-=8;q.flash=6;txt(q.x,q.y-30,'EXTINGUISHED!','#7fd0ff',16);if(q.hp<=0)ko(q,'K.O.')}else if(q.star>0)txt(q.x,q.y-30,'MELT','#ff7b2c',14);else if(!(q.frozen>0)&&(q.frzImm||0)<frame)xFreeze(q);break}break;
 case'petal':e.y+=1.2;e.x+=Math.sin(frame*.04+e.ph);touch(12,q=>{e.t=0;q.lily=(q.lily||0)+1;q.lilyT=1200;txt(q.x,q.y-30,'SPRING +'+q.lily,'#ffd6f0',14);sfx('se_kira00',.3)});break;
 case'fruit':e.y+=1.6;touch(14,q=>{e.t=0;q.hp=Math.min(T.HP,q.hp+15);txt(q.x,q.y-30,'+15','#5f8',16);sfx('se_powerup',.4)});break;
 case'fakeitem':touch(20,q=>{e.t=0;txt(q.x,q.y-40,'FAKE!','#ff6b6b',22);if(q!==p&&q.state!=='spell')Object.assign(q,{state:'parrystun',t:40,vx:0,vy:0,charging:false});sfx('cancel00')});break;
 case'kline':for(const q of P){if(q.id===e.o||q.state==='dead'||(q.klCD||0)>frame)continue;if(Math.hypot(q.x-e.x1,q.y-e.y1)>50&&segD(q.x,q.y,e.x1,e.y1,e.x2,e.y2)<bodyR(q)+6){q.klCD=frame+40;burst(q.x,q.y,'#ffcf6a',12);q.x=e.x1;q.y=e.y1;burst(q.x,q.y,'#ffcf6a',12);txt(q.x,q.y-30,'INSTANT!','#ffcf6a',16)}}
  for(const b of B){if(b.dead||b.kl===e.id)continue;if(Math.hypot(b.x-e.x1,b.y-e.y1)>40&&segD(b.x,b.y,e.x1,e.y1,e.x2,e.y2)<b.r+6){b.kl=e.id;b.x=e.x1;b.y=e.y1}}break;
 case'voodoo':{const v=P[e.v];if(!v||v.state==='dead'){e.t=0;break}
  for(const b of B){if(b.dead||b.fake||b.owner===e.v||Math.abs(b.x-e.x)>b.r+16||Math.abs(b.y-e.y)>b.r+16)continue;b.dead=1;e.pins++;e.fl=6;const a=P[b.owner]||p;
   for(const w of P){if(w.state==='dead'||w===a||(w!==v&&w.inv>0))continue;if(b.heavy)hit(w,a,b.vx,b.vy,b.m,b.mult*(w===v?1.5:1),true);else{w.hp-=chDmg(w,a,b.dmg*(w===v?1.5:1),false);w.flash=3;sfxDmg(w);if(w.hp<=0)ko(w,'CURSED')}}}break} // la poupée fait mal à tout le monde
 case'tree':{e.hp-=.12;if(frame%5===0)for(let i=0;i<5&&B.length<T.MAX_B;i++){const t=frame*.06+i*TAU/5,s=1.6+1.4*Math.abs(Math.cos(2.5*t+frame*.02));B.push({x:e.x,y:e.y-20,vx:Math.cos(t)*s,vy:Math.sin(t)*s,r:5,owner:e.o,heavy:0,dmg:1,life:260,dead:0,gr:0,home:0,c:'#ff7fb0'})}
  for(const b of B){if(b.dead||b.owner===e.o||b.fake||Math.abs(b.x-e.x)>b.r+40||Math.abs(b.y-e.y)>b.r+44)continue;b.dead=1;e.hp-=b.heavy?b.m.dmg*b.mult:b.dmg;e.last=b.owner;e.lf=frame;e.fl=4}
  for(const q of P){if(q.id===e.o||q.state!=='atk'||!q.mv||q.mv.spd)continue;const m=q.mv;if(q.t>m.start&&q.t<=m.start+m.act&&Math.hypot(q.x-e.x,q.y-e.y)<(m.range||40)+50&&(e.mcd||0)<frame){e.mcd=frame+15;e.hp-=m.dmg;e.last=q.id;e.lf=frame;e.fl=4}}
  if(e.hp<=0){e.t=0;burst(e.x,e.y,'#ffb7d5',60);WAVES.push({x:e.x,y:e.y,t:30,T:30,spd:30,th:60,inv:1});const k=e.lf===frame?P[e.last]:p;if(k&&k.state!=='dead'){k.inv=0;k.fx.phoenix=0;big(k===p?'THE TREE TAKES ITS SUMMONER':'THE TREE CURSES ITS KILLER','#ffb7d5',40);ko(k,'SAIGYOU AYAKASHI')}}break}
 case'treasure':for(const q of P){if(q.state==='dead'||Math.hypot(q.x-e.x,q.y-e.y)>bodyR(q)+16)continue;e.t=0;
   if(q===p){p.treas++;const i=e.i;if(i===0)p.kshield=1;else if(i===1)p.kref=frame+480;else if(i===2)p.krobe=1;else if(i===3)p.kdrag=frame+900;else p.spirit=T.SPIRIT_MAX;txt(e.x,e.y-30,e.n+': '+TRP[i],'#ffcf6a',15);sfx('se_powerup',.6);
    if(p.treas>=5){p.fx.immortal=600;p.hp=T.HP;big('IMPERISHABLE!','#ffcf6a',70);flash(.4,'#ffcf6a');WAVES.push({x:p.x,y:p.y,t:30,T:30,spd:30,th:60,inv:1});sfx('spellcardsultimespawn')}}
   else{txt(e.x,e.y-30,'LOST!','#888',16);sfx('cancel00',.5)}break}break}}
function chView(L,Tp,vw,vh){ // voiles plein écran (coordonnées monde)
 if(CX.terr)for(const k of CX.terr.L){ctx.globalAlpha=.06;ctx.fillStyle=TC[k];ctx.fillRect(L,Tp,vw,vh)}ctx.globalAlpha=1;
 if(CX.shr&&CX.shr.x0!==undefined){const s=CX.shr;ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(L,Tp,vw,s.y0-Tp);ctx.fillRect(L,s.y1,vw,Tp+vh-s.y1);ctx.fillRect(L,s.y0,s.x0-L,s.y1-s.y0);ctx.fillRect(s.x1,s.y0,L+vw-s.x1,s.y1-s.y0);
  ctx.strokeStyle='#e04a4a';ctx.lineWidth=4;ctx.strokeRect(s.x0,s.y0,s.x1-s.x0,s.y1-s.y0)}
 if(CX.myst){const o=P[CX.myst.o];if(o&&o.state!=='dead'){const e=480-CX.myst.t,r=70+(1-Math.min(1,e/180))*1500,g=ctx.createRadialGradient(o.x,o.y,r,o.x,o.y,r+60); // Mystia
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.985*Math.min(1,CX.myst.t/30))+')');ctx.fillStyle=g;ctx.fillRect(L,Tp,vw,vh)}}
 ctx.textAlign='center';ctx.font='bold 22px monospace';let y=Tp+70;
 if(CX.terr){ctx.fillStyle='#b07cd8';ctx.fillText(CX.terr.L.map(k=>TN[k]).join(' + '),L+vw/2,y);y+=26}
 if(CX.rule&&CX.rule.k){ctx.fillStyle='#ff8fb0';ctx.fillText('RULE: '+CX.rule.k,L+vw/2,y);y+=26}
 if(CX.yuyu){ctx.fillStyle='#ff9ad5';ctx.fillText('DEATH IN '+Math.ceil(CX.yuyu.t/60)+' — LOWEST HP DIES',L+vw/2,y)}}
function chDraw(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.wall){const w=CX.wall;ctx.fillStyle='#3a2a1a';ctx.fillRect(w.x-10,0,20,T.MAP_H);ctx.fillStyle='#3fbf6f';for(let y=0;y<T.MAP_H;y+=60)ctx.fillRect(w.x-14,y,28,8)}
 for(const e of ENT){switch(e.k){
  case'book':{const it=ITEMS.find(i=>i.k===e.it),y=e.y+Math.sin(frame*.1+e.x)*3;ctx.fillStyle=it.c==='rainbow'?rainbowCol():it.c;ctx.fillRect(e.x-12,y-15,24,30);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(e.x-12,y-15,24,30);ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(it.name,e.x,y-22);break}
  case'efairy':ctx.fillStyle='rgba(127,224,160,.6)';ctx.beginPath();ctx.ellipse(e.x-8,e.y,9,5,-.5+Math.sin(frame*.4)*.3,0,TAU);ctx.ellipse(e.x+8,e.y,9,5,.5-Math.sin(frame*.4)*.3,0,TAU);ctx.fill();ctx.fillStyle='#7fe0a0';ctx.beginPath();ctx.arc(e.x,e.y,7,0,TAU);ctx.fill();break;
  case'decoy':ctx.save();ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText('???',e.x,e.y-T.BODY_R-18);ctx.fillText('???',e.x,e.y-T.BODY_R-18);ctx.restore();ctx.fillStyle='#222';ctx.strokeStyle='#9aa';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(e.x+Math.cos(e.a)*T.BODY_R,e.y+Math.sin(e.a)*T.BODY_R);ctx.lineTo(e.x+Math.cos(e.a)*(T.BODY_R+10),e.y+Math.sin(e.a)*(T.BODY_R+10));ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,T.CORE_R,0,TAU);ctx.fill();break;
  case'gtrail':ctx.globalAlpha=Math.min(.7,e.t/100);ctx.fillStyle='#e0302f';ctx.beginPath();ctx.arc(e.x,e.y,16+Math.sin(frame*.3+e.x)*3,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'flake':ctx.strokeStyle='#e8f6ff';ctx.lineWidth=2;for(let k=0;k<3;k++){const a=k*Math.PI/3+frame*.02;ctx.beginPath();ctx.moveTo(e.x-Math.cos(a)*8,e.y-Math.sin(a)*8);ctx.lineTo(e.x+Math.cos(a)*8,e.y+Math.sin(a)*8);ctx.stroke()}break;
  case'petal':ctx.fillStyle='#ffd6f0';ctx.beginPath();ctx.ellipse(e.x,e.y,7,4,frame*.05+e.ph,0,TAU);ctx.fill();break;
  case'fruit':ctx.fillStyle='#ff9a3a';ctx.beginPath();ctx.arc(e.x,e.y,9,0,TAU);ctx.fill();ctx.fillStyle='#5cff7a';ctx.fillRect(e.x-1,e.y-13,3,5);break;
  case'fakeitem':ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,T.ITEM_R,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.fillText('???',e.x,e.y+5);break;
  case'kline':ctx.globalAlpha=Math.min(1,e.t/60);ctx.strokeStyle='#ffcf6a';ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(e.x1,e.y1);ctx.lineTo(e.x2,e.y2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffcf6a';ctx.beginPath();ctx.arc(e.x1,e.y1,8,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'voodoo':{const q=P[e.v];if(q&&q.state!=='dead'){ctx.strokeStyle='rgba(224,112,160,.6)';ctx.lineWidth=1;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([])}
   ctx.fillStyle='#e070a0';ctx.beginPath();ctx.moveTo(e.x,e.y-6);ctx.lineTo(e.x+11,e.y+16);ctx.lineTo(e.x-11,e.y+16);ctx.fill();ctx.fillStyle='#ffe';ctx.beginPath();ctx.arc(e.x,e.y-11,7,0,TAU);ctx.fill();
   if(e.fl>0){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,22,0,TAU);ctx.stroke()}break}
  case'tree':ctx.fillStyle='#222';ctx.fillRect(e.x-40,e.y+44,80,6);ctx.fillStyle='#ff7fb0';ctx.fillRect(e.x-40,e.y+44,80*Math.max(0,e.hp)/150,6);break;
  case'treasure':ctx.save();ctx.translate(e.x,e.y+Math.sin(frame*.08+e.i)*4);ctx.rotate(frame*.03);ctx.fillStyle=['#e8d48a','#ffcf6a','#ff6a3a','#7fd0ff','#f0f0f0'][e.i];ctx.beginPath();
   for(let k=0;k<10;k++){const r=k%2?7:16,a=k*Math.PI/5;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#ffcf6a';ctx.font='11px monospace';ctx.fillText(e.n,e.x,e.y-24);break}}
 if(CX.link){const L=al.filter(q=>q.id!==CX.link.o);ctx.strokeStyle='rgba(224,48,80,.7)';ctx.lineWidth=2;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){ctx.beginPath();ctx.moveTo(L[i].x,L[i].y);ctx.lineTo(L[j].x,L[j].y);ctx.stroke()}}
 for(const b of B)if(b.star){ctx.fillStyle=b.c;ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?4:10,a=k*Math.PI/5+frame*.1;ctx.lineTo(b.x+Math.cos(a)*r,b.y+Math.sin(a)*r)}ctx.fill()}
 for(const b of B)if(b.note){ctx.fillStyle='#000';ctx.font='bold 20px monospace';ctx.fillText('♪',b.x,b.y+7)}
 if(CX.swap){const a=P[CX.swap.a],b=P[CX.swap.b];if(a&&b){ctx.font='bold 14px monospace';ctx.fillStyle=COLS[a.id];ctx.fillText('P'+(a.id+1)+' ?',b.x,b.y-36);ctx.fillStyle=COLS[b.id];ctx.fillText('P'+(b.id+1)+' ?',a.x,a.y-36)}}
 for(const p of al){const f=p.fx;
  if(f.eat>0){ctx.globalAlpha=.5;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+14+Math.sin(frame*.2)*3,0,TAU);ctx.fill();ctx.globalAlpha=1}
  if(p.dark>frame){ctx.fillStyle='#6b5bb0';ctx.font='bold 13px monospace';ctx.fillText('EDIBLE',p.x,p.y-34)}
  if(P.some(q=>q.state==='eaten'&&q.eatBy===p.id)){ctx.fillStyle='#6b5bb0';ctx.font='bold 16px monospace';ctx.fillText('*munch*',p.x,p.y-40+Math.sin(frame*.4)*3)}
  if(f.four>0){for(const c of xFour(p)){ctx.globalAlpha=.55;ctx.fillStyle='#222';ctx.strokeStyle='#ff3030';ctx.lineWidth=3;ctx.beginPath();ctx.arc(c[0],c[1],T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.globalAlpha=1}
   for(const q of al){if(q===p)continue;const ph=(frame+q.id*23)%90,on=ph>=80;ctx.strokeStyle=on?'#fff':'#ff3030';ctx.lineWidth=on?5:2;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(2,(1-ph/90)*150),0,TAU);ctx.stroke()}}
  if(f.spin>0&&f.ran>0)drawTails(p);
  else if(f.spin>0){ctx.strokeStyle='#d9534f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+5,frame*.5,frame*.5+4);ctx.stroke()}
  if(f.yslash>0){ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(p.myx,p.myy,12,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(p.myx-8,p.myy+4,7,0,TAU);ctx.fill()}
  if(p.state==='cocoon'){ctx.fillStyle='#8a9a50';ctx.beginPath();ctx.ellipse(p.x+(Math.random()-.5)*4,p.y,bodyR(p)+6,bodyR(p)+16,0,0,TAU);ctx.fill();ctx.strokeStyle='#c8ff5a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+24,-Math.PI/2,-Math.PI/2+TAU*p.coc/100);ctx.stroke();
   ctx.fillStyle='#c8ff5a';ctx.font='bold 13px monospace';ctx.fillText('WIGGLE! '+(25-p.cocDmg|0)+' HP',p.x,p.y-50)}
  if(f.butter>0){ctx.fillStyle='rgba(200,255,90,.55)';const w=Math.sin(frame*.4)*.4;ctx.beginPath();ctx.ellipse(p.x-22,p.y-6,24,14,-.6-w,0,TAU);ctx.ellipse(p.x+22,p.y-6,24,14,.6+w,0,TAU);ctx.fill()}
  if(p.frozen>0){ctx.fillStyle='rgba(190,230,255,.6)';ctx.fillRect(p.x-26,p.y-26,52,52);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(p.x-26,p.y-26,52,52)}
  if(p.cage){ctx.strokeStyle='#e0302f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.cage.x,p.cage.y,50+bodyR(p),0,TAU);ctx.stroke()}
  if(f.immortal>0){ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+8,0,TAU);ctx.stroke()}
  if(f.phoenix>0){ctx.strokeStyle='#ff4b1f';ctx.globalAlpha=.6;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+12,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.kshield){ctx.strokeStyle='#e8d48a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+16,0,TAU);ctx.stroke()}
  let tag='';if(f.pact>0)tag+='PACT '+Math.ceil(f.pact/60)+' ';if(f.kline>0)tag+='LINES '+f.kline+' ';if(f.gung>0)tag+='GUNGNIR '+f.gung+' ';if(f.judge>0)tag+='JUDGE '+f.judge+' ';if(p.drug)tag+=p.drug.k+' ';if(p.vuln)tag+='♪x'+p.vuln+' ';if(p.lily)tag+='✿'+p.lily+' ';if(p.pStk)tag+='ATK x'+Math.pow(1.3,p.pStk).toFixed(1)+' ';
  if(ENT.some(e=>e.k==='treasure'&&e.o===p.id))tag+=p.treas+'/5';if(tag){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText(tag,p.x,p.y+44)}
  if(CX.rhy&&p.id!==CX.rhy.o){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(p.x-60,p.y-84,120,16);ctx.fillStyle='#fff';ctx.fillRect(p.x-52,p.y-86,3,20);ctx.fillStyle='#c8a0ff';
   for(let k=0;k<4;k++){const dx=(CX.rhy.n+k*30-frame)/60*104;if(dx>=-4&&dx<=108){ctx.beginPath();ctx.arc(p.x-50+dx,p.y-76,6,0,TAU);ctx.fill()}}}}}
