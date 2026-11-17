'use strict';
// ===== Touhou 17-20 + entraînement =====
DEFER(()=>{Object.assign(IM,{boulder:{dmg:9,kb:9,stun:28,arm:0},haniwa:{dmg:4,kb:4,stun:14,arm:0},saki:{dmg:6,kb:10,stun:26},staff:{dmg:14,kb:18,stun:40},trap:{dmg:8,kb:2,stun:10},
 mag:{dmg:3,kb:2,stun:8,arm:0},magx:{dmg:30,kb:18,stun:46},fan:{dmg:6,kb:30,stun:60},lava:{dmg:16,kb:12,stun:36},shatter:{dmg:24,kb:16,stun:40},dragon:{dmg:12,kb:14,stun:34},sknife:{dmg:4,kb:3,stun:12,arm:0},star6:{dmg:9,kb:8,stun:26,arm:0}});});
const RES=['flake','petal','fire','gtrail','fruit','fish','shark','lbeam','fist','shell','coin','sblood','clay'];
DEFER(()=>{Object.assign(GIVE,{
 eika:p=>{p.fx.stack=600;p.stones=0;big('STONE TOWER: CATCH THE STONES!','#c8b8a0',40)},
 urumi:p=>{p.fx.wzone=600;const Z=[];for(let i=0;i<3;i++)Z.push({x:T.MAP_W*(.22+.28*i),y:T.MAP_H*(.3+rng()*.4),r:140});CX.wz={o:p.id,Z};big('CRUSHING WEIGHT','#8a7a6a',44);sfx('se_enep00',.5)},
 kutaka:p=>{for(let i=0;i<12;i++)ENT.push({k:'chick',o:p.id,t:600,x:p.x+(rng()-.5)*300,y:p.y+(rng()-.5)*300,ang:0,ph:rng()*TAU});big('COCK-A-DOODLE-DOO!','#ffd23a',44)},
 yachie:p=>{const q=nearFoe(p.id,p.x,p.y);if(q){q.ctr={o:p.id,t:frame+300};q.ctrSp=q.spirit;big('CONTRACT: P'+(q.id+1)+' MUST HIT P'+(p.id+1)+' IN 5 S!','#6a9a4a',34);sfx('se_kira00')}},
 mayumi:p=>{const q=nearFoe(p.id,p.x,p.y),a=q?Math.atan2(q.y-p.y,q.x-p.x):0;for(let i=0;i<8;i++){const o=(i-3.5)*36;ENT.push({k:'haniwa',o:p.id,t:600,hp:12,x:p.x-Math.sin(a)*o,y:p.y+Math.cos(a)*o,a,cd:i*6})}big('HANIWA ARMY','#c87a4a',44)},
 keiki:p=>{p.fx.sculpt=480;big('SCULPT THE ARENA','#5cff7a',44)},
 saki:p=>{p.fx.gallop=480;p.galV=6;big('FULL GALLOP!','#333',50)},
 yuuma:p=>{p.fx.devour=480;big('I DEVOUR EVERYTHING','#c03030',44)},
 mike:p=>{CX.coins={o:p.id,t:720};for(const q of P)q.coins=0;big('COIN RAIN! 100 COINS = +1 LIFE','#ffd23a',36)},
 takane:p=>{const r=xR();for(let i=0;i<6;i++)ENT.push({k:'qtree',o:p.id,t:720,hp:40,lv:1,x:r[0]+80+rng()*(r[2]-r[0]-160),y:r[1]+80+rng()*(r[3]-r[1]-160)});big('FOREST QI (WATER FEEDS, FIRE BURNS)','#3a9a3a',34)},
 sannyo:p=>{for(let i=0;i<4;i++){const q=nearFoe(p.id,p.x,p.y)||p;ENT.push({k:'smoke',o:p.id,t:600,x:q.x+(rng()-.5)*400,y:q.y+(rng()-.5)*300,a:rng()*TAU})}big('HYPNOTIC SMOKE','#c8a8ff',44)},
 misumaru:p=>{for(let i=0;i<6;i++)ENT.push({k:'jewel',o:p.id,t:240,x:p.x+Math.cos(i)*120,y:p.y+Math.sin(i)*120,ph:i,c:RB[i]});big('MAGATAMA JEWELS','#4ab3ff',44)},
 tsukasa:p=>{p.fx.whisper=600;big('*whisper whisper*','#e8e0a0',40)},
 megumu:p=>{p.fx.const6=900;p.stars6=[];big('HEAVY = PLACE A STAR (x6)','#4a6aff',40)},
 chimata:p=>{CX.owner={o:p.id,t:600};for(const q of P)if(q!==p&&q.state!=='dead'&&q.lastIt){const ks=Object.keys(q.fx).filter(k=>q.fx[k]>0);if(ks.length){q.fx={};ENT.push({k:'book',it:q.lastIt,g:frame*10+q.id,o:p.id,t:400,x:q.x+40,y:q.y})}}big('NOTHING BELONGS TO ANYONE','#ffd23a',40)},
 momoyo:p=>{const r=xR(),seg=[];for(let i=0;i<14;i++)seg.push({x:r[0],y:r[1]});ENT.push({k:'dragon',o:p.id,t:720,hp:80,x:r[0],y:r[1],a:0,seg});big('A DRAGON APPEARS!','#40c080',50)},
 biten:p=>{p.fx.staff=480;big('RUYI STAFF: ATTACK REACHES EVERYTHING','#e8a040',36)},
 enoko:p=>{for(let i=0;i<5;i++){const r=xR();ENT.push({k:'trap',o:p.id,t:720,x:r[0]+rng()*(r[2]-r[0]),y:r[1]+rng()*(r[3]-r[1])})}for(let i=0;i<3;i++)ENT.push({k:'hound',o:p.id,t:600,x:p.x,y:p.y,i});big('THE HUNT BEGINS','#a08060',44)},
 chiyari:p=>{p.fx.blood=600;big('BLOODTHIRST','#c01020',44)},
 hisami:p=>{const q=nearFoe(p.id,p.x,p.y);if(q){p.fx.chain=600;p.chT=q.id;q.chainP=0;big('YOU CAN NEVER ESCAPE ME','#8a4ac0',40)}},
 zanmu:p=>{CX.void={o:p.id,t:600,cells:[]};big('NOTHINGNESS','#222',60);flash(.5,'#000')},
 ubame:p=>{const al=P.filter(q=>q.state!=='dead'),r=xR(),mx=(r[0]+r[2])/2,my=(r[1]+r[3])/2,Q=al.length<=2?[[r[0],r[1],mx,r[3]],[mx,r[1],r[2],r[3]]]:[[r[0],r[1],mx,my],[mx,r[1],r[2],my],[r[0],my,mx,r[3]],[mx,my,r[2],r[3]]],z={},d0={};al.forEach((q,i)=>{const Z=Q[i];z[q.id]=Z;d0[q.id]=q.hp;Object.assign(q,{x:(Z[0]+Z[2])/2,y:(Z[1]+Z[3])/2,vx:0,vy:0});burst(q.x,q.y,COLS[q.id],12)});CX.tilt={o:p.id,t:0,z,d0,n:al.length};big('THE MOUNTAIN TILTS: MOST DAMAGED DIES','#8a6a4a',36);sfx('teleportation',.5)},
 chimi:p=>{const q=nearFoe(p.id,p.x,p.y),w=T.MAP_W/3,x=clamp(q?q.x:T.MAP_W/2,w/2,T.MAP_W-w/2),x0=x-w/2,x1=x+w/2;CX.mtn={o:p.id,t:0,x,w,rv:[[x0,T.MAP_H*.3,x0-1100,T.MAP_H*.95],[x1,T.MAP_H*.22,x1+1100,T.MAP_H*.9]]};big('THE MOUNTAIN SPIRITS AWAKEN','#5a8a5a',40)},
 nareko:p=>{const r0=xR(),mx=(r0[2]-r0[0])*.12,my=(r0[3]-r0[1])*.12,r=[r0[0]+mx,r0[1]+my,r0[2]-mx,r0[3]-my],cw=(r[2]-r[0])/6,ch=(r[3]-r[1])/4,c=[];const DI=[[1,0],[0,1],[-1,0],[0,-1]],dist=(i,j)=>Math.min(i,5-i,j,3-j);for(let i=0;i<6;i++)for(let j=0;j<4;j++){const k=dist(i,j),ok=[0,1,2,3].filter(d=>{const ni=i+DI[d][0],nj=j+DI[d][1];if(ni<0||ni>5||nj<0||nj>3)return k===0;return dist(ni,nj)<k});const d=ok.length?ok[rng()*ok.length|0]:0;c.push({x:r[0]+i*cw,y:r[1]+j*ch,w:cw,h:ch,a:d*Math.PI/2})}CX.road={o:p.id,t:600,c};for(const q of P)if(q!==p&&q.state!=='dead'){const C=c.find(C=>q.x>=C.x&&q.x<C.x+C.w&&q.y>=C.y&&q.y<C.y+C.h);if(C){q.x=C.x+C.w/2;q.y=C.y+C.h/2}}big('ONE WAY ONLY','#e8c040',44)},
 yuiman:p=>{p.fx.serp=600;p.serpV=0;big("SERPENT'S REBIRTH",'#ff5030',46);sfx('spawn2heavy',.5)},
 toyohime:p=>{const q=nearFoe(p.id,p.x,p.y),a=q?Math.atan2(q.y-p.y,q.x-p.x):p.aim,c=Math.cos(a),s=Math.sin(a);for(const b of B)if(b.owner!==p.id)b.dead=1;
  for(const r of P)if(r!==p&&r.state!=='dead'&&r.inv<=0){r.pips=Math.max(0,r.pips-1);hit(r,p,c,s,IM.fan,1,true);Object.assign(r,{state:'hitstun',t:400,spit:1,vx:c*13,vy:s*13})}ENT.push({k:'lfan',o:p.id,t:340,a});
  big('LUNAR FAN!','#e8e8ff',60);flash(.5,'#e8e8ff');for(let i=0;i<8;i++)LINES.push({x:p.x,y:p.y,a:a+(i-4)*.08,t:20,T:20,len:2000});sfx('se_enep01')},
 ariya:p=>{p.fx.gaze2=420;big('STONE GAZE: HIT THE STONES!','#b0a080',40);sfx('se_kira00',.5)},
 nina:p=>{CX.mirage={o:p.id,t:600};big('MIRAGE','#a0e0ff',50);{const it=ITEMS.filter(i=>!i.rare&&i.k!=='nina')[rng()*(ITEMS.length-2)|0]||ITEMS[0];CX.mirF={t:frame+50,it,o:p.id}}}});});
DEFER(()=>{{const H0=chHit;chHit=(v,a,dx,dy,m,mult,heavy)=>{
 if(v.fx.stones>0&&v.stones>0&&!CX.pureIn){v.stones--;txt(v.x,v.y-40,'STONE FALLS ('+v.stones+')','#c8b8a0',14);burst(v.x,v.y,'#c8b8a0',8);v.inv=10;return 1} // Eika : une pierre encaisse
 if(v.stoneF>frame&&heavy&&a&&a!==v){v.stoneF=0;mult*=3;big('SHATTER x3!','#b0a080',44)}
 return H0(v,a,dx,dy,m,mult,heavy)}}});
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{
 if(a&&a!==v){const hn=ENT.filter(e=>e.k==='haniwa'&&e.o===a.id).length;if(hn)d*=1+.1*hn;if(a.fx.stones>0||a.fx.stack>0)d*=1+.08*(a.stones||0);if(a.fx.will>0){v.willH=(v.willH||0)+1;txt(v.x,v.y-46,'WILL '+Math.min(3,v.willH)+'/3','#6a9a4a',14);if(v.willH>=3){v.willH=0;v.noAtk=Math.max(v.noAtk||frame,frame)+150;big('P'+(v.id+1)+' LOST THE WILL','#6a9a4a',34)}}if(a.dragonP>frame)d*=2;if(a.fx.blood>0)v.bleed=frame+300;
  if(a.fx.weight>0&&heavy)v.heavyT=frame+30}
 return D0(v,a,d,heavy)}}});
DEFER(()=>{{const I0=chInput;chInput=(p,I)=>{I=I0(p,I);
 if(p.noAtk>frame)I={x:I.x,y:I.y,b:{...I.b,shot:false,melee:false,heavy:false,spell:false,burst:false}}; // Yachie
 if(CX.road&&p.id!==CX.road.o){const c=CX.road.c.find(c=>p.x>=c.x&&p.x<c.x+c.w&&p.y>=c.y&&p.y<c.y+c.h);if(c){const ux=Math.cos(c.a),uy=Math.sin(c.a),d=I.x*ux+I.y*uy;I={x:ux*Math.max(0,d),y:uy*Math.max(0,d),b:I.b}}} // Nareko : sens unique
 if(p.fx.gallop>0){if(Math.hypot(I.x,I.y)>.3)p.hyd=[I.x,I.y];I={x:p.hyd?p.hyd[0]:Math.cos(p.aim),y:p.hyd?p.hyd[1]:Math.sin(p.aim),b:I.b}}
 return I}}});
DEFER(()=>{{const S0=chSpeed;chSpeed=p=>{let k=S0(p);if(ENT.some(e=>e.k==='smoke'&&e.o!==p.id&&Math.hypot(p.x-e.x,p.y-e.y)<110))k*=.6;if(CX.void&&false)k*=1;
 const u=P.find(q=>q.fx.weight>0&&q!==p);if(u)k*=.5;if(p.fx.gallop>0)k*=(p.galV||6)/T.SPEED;return k}}});
DEFER(()=>{{const C0=chBullet;chBullet=(b,t)=>{
 if(CX.owner&&b.owner===t.id&&t.id!==CX.owner.o)return 0;
 if(b.stick){t.mags=(t.mags||0)+1;b.dead=1;txt(t.x,t.y-40,'MAGATAMA '+t.mags+'/5','#4ab3ff',16);if(t.mags>=5){t.mags=0;big('MAGATAMA BURST!','#4ab3ff',50);WAVES.push({x:t.x,y:t.y,t:20,T:20,spd:14,th:40,inv:1});hit(t,P[b.owner],0,1,IM.magx,1,true)}return 1}
 return C0(b,t)}}});
DEFER(()=>{{const HI=heavyItem;heavyItem=(p,o)=>{const f=p.fx;
 if(f.const6>0&&(p.stars6||(p.stars6=[])).length<6){if(frame<(p.st6T||0))return 1;p.st6T=frame+20;p.stars6.push({x:p.x,y:p.y});RINGS.push({x:p.x,y:p.y,r:0,m:60,t:16,c:'#4a6aff'});sfx('se_kira00');txt(p.x,p.y-40,'STAR '+p.stars6.length+'/6','#9ab0ff',16);
  if(p.stars6.length===6){p.constT=600;big('CONSTELLATION!','#4a6aff',60);flash(.3,'#4a6aff');sfx('se_cat00');sfx('saigyou ayakashi spawn',.9)}return 1}
 return HI(p,o)}}});
DEFER(()=>{{const M0=chMelee;chMelee=p=>{if(p.fx.staff>0&&(p.stCD||0)<frame){p.stCD=frame+90;const c=Math.cos(p.aim),s=Math.sin(p.aim),x2=p.x+c*620,y2=p.y+s*620; // Son Biten : le bâton s'allonge
  ENT.push({k:'lbeam',o:p.id,t:12,x:p.x,y:p.y,x2,y2,staff:1});sfx('hit3');shake=Math.min(30,shake+8);
  for(const q of P)if(q!==p&&q.state!=='dead'&&q.inv<=0&&segD(q.x,q.y,p.x,p.y,x2,y2)<bodyR(q)+9){if(parryOn(q))parryFx(q);else hit(q,p,c,s,IM.staff,1,true)}return 1}
 return M0(p)}}});
function chPre4(){
 for(const k of['coins','owner','void','slope','mimic','road','erupt','mirage'])if(CX[k]&&--CX[k].t<=0)CX[k]=null;
 const al=P.filter(q=>q.state!=='dead');
 if(TSTOP>0&&frame%5===0&&0){const o=P[TSO];if(o)for(const q of al)if(q!==o&&B.length<T.MAX_B){const a=rng()*TAU,r=130+rng()*150; // Sakuya : couteaux figés pendant l'arrêt du temps
   B.push({x:q.x+Math.cos(a)*r,y:q.y+Math.sin(a)*r,vx:-Math.cos(a)*7,vy:-Math.sin(a)*7,r:5,owner:o.id,heavy:1,m:IM.sknife,mult:1,dist:999,life:200,dead:0,seen:0,home:0,gr:0,c:'#c8e8ff',knife:1})}}
 if(CX.coins){const C=CX.coins;for(let i=0;i<2;i++){const q=al[rng()*al.length|0];if(q&&ENT.length<700)ENT.push({k:'coin',o:C.o,t:200,x:q.x+(rng()-.5)*700,y:q.y-350-rng()*80,vy:2.5+rng()*2})}} // Mike
 if(CX.void){const V=CX.void,e=600-V.t;if(e%90===10){const r=xR(),n=7,m=4,cw=(r[2]-r[0])/n,ch=(r[3]-r[1])/m;V.cells=[];for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(rng()<.4)V.cells.push({x:r[0]+i*cw,y:r[1]+j*ch,w:cw,h:ch});V.open=frame+60;sfx('timeout',.6)} // Zanmu
  if(frame===V.open){shake=40;sfx('se_enep01');for(const q of al)if(q.id!==V.o&&q.inv<=0&&V.cells.some(c=>q.x>=c.x&&q.x<c.x+c.w&&q.y>=c.y&&q.y<c.y+c.h)){q.hp=0;q.fx.phoenix=0;big('ERASED','#000',70);ko(q,'NOTHINGNESS')}
   for(const b of B)if(V.cells.some(c=>b.x>=c.x&&b.x<c.x+c.w&&b.y>=c.y&&b.y<c.y+c.h))b.dead=1}
  if(frame>V.open+20)V.cells=[]}
 if(CX.slope){const S=CX.slope;S.a+=.004;const gx=Math.cos(S.a)*.35,gy=Math.sin(S.a)*.35;for(const q of al)if(q.id!==S.o){q.vx+=gx;q.vy+=gy}for(const b of B){b.vx+=gx*.15;b.vy+=gy*.15}} // Ubame
 if(CX.erupt&&CX.erupt.t%45===0)for(const q of al)if(q.id!==CX.erupt.o)ENT.push({k:'geyser',o:CX.erupt.o,t:50,x:q.x,y:q.y});
 if(CX.mimic)for(const c of CARDS){const o=CX.mimic.o;for(const q of al)if(q.id!==o&&q.inv<=0&&Math.hypot(q.x-c.x,q.y-c.y)<T.ITEM_R+T.BODY_R&&(q.mmCD||0)<frame){q.mmCD=frame+40;c.cp[q.id]=0;big('MIMIC!','#5a8a5a',40);hit(q,P[o],q.x-c.x||1,q.y-c.y,IM.bite,1.5,true)}}
 for(const p of al){const f=p.fx;
  if(f.stones>0&&f.stones%60===0&&p.stones<10){p.stones++;txt(p.x,p.y-40,'STONE '+p.stones,'#c8b8a0',14)}
  if(f.stones===1&&p.stones>0){const q=p.tgt;for(let i=0;i<p.stones;i++)xBall(p,p.x,p.y,(q?Math.atan2(q.y-p.y,q.x-p.x):p.aim)+(i-p.stones/2)*.15,6+i*.3,16,IM.boulder,{c:'#a09080',life:200});big('TOWER THROWN!','#c8b8a0',40);p.stones=0}
  if(f.weight>0){for(const b of B)if(b.owner===p.id&&b.heavy){b.r=Math.min(30,b.r+.03);b.mult=Math.min(3,(b.mult||1)+.004)}}
  if(f.sculpt>0&&frame%3===0&&Math.hypot(p.vx,p.vy)>1&&ENT.length<600)ENT.push({k:'clay',o:p.id,t:480,x:p.x-p.vx*3,y:p.y-p.vy*3}); // Keiki
  if(f.gallop>0){p.galV=Math.min(16,(p.galV||6)+.05);if(p.galV>8||p.state==='dash')for(const q of al){if(q===p||q.inv>0||(q.skCD2||0)>frame)continue;if(Math.hypot(q.x-p.x,q.y-p.y)<bodyR(p)+bodyR(q)+(p.state==='dash'?10:4)){q.skCD2=frame+30;const dk=p.state==='dash'?1.6:1;hit(q,p,q.x-p.x,q.y-p.y,{dmg:IM.saki.dmg*p.galV/8*dk,kb:IM.saki.kb*p.galV/8*dk,stun:30},1,true);if(p.galV>=15)big('STAMPEDE!','#fff',40);p.galV=6}}}
  if(f.devour>0){for(const b of B)if(b.owner!==p.id&&!b.dead&&Math.hypot(b.x-p.x,b.y-p.y)<220){const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy)||1;b.vx+=dx/d*.22;b.vy+=dy/d*.22;if(d<30){b.dead=1;p.hp=Math.min(T.HP,p.hp+.5);p.spirit=Math.min(T.SPIRIT_MAX,p.spirit+.5)}} // Yuuma
   for(const c of CARDS)if(Math.hypot(c.x-p.x,c.y-p.y)<400){c.x+=(p.x-c.x)*.012;c.y+=(p.y-c.y)*.012}
   for(const q of al){if(q===p||(q.dvCD||0)>frame)continue;if(Math.hypot(q.x-p.x,q.y-p.y)<bodyR(p)+bodyR(q)+6){q.dvCD=frame+90;const ks=Object.keys(q.fx).filter(k=>q.fx[k]>0&&!['tiny','invis'].includes(k));if(ks.length){for(const k of ks){p.fx[k]=q.fx[k];q.fx[k]=0;if(k==='yslash'){p.myon=[];p.myx=p.x;p.myy=p.y}else if(k==='const6')p.stars6=[]}big('DEVOURED '+ks.length+' POWERS!','#c03030',44)}}}}
  if(f.whisper>0&&frame%120===0)for(const q of al)if(q!==p)q.wsA=(rng()<.5?1:-1)*Math.PI/2; // Tsukasa
  if(p.wsA&&!P.some(o=>o.fx.whisper>0))p.wsA=0;
  if(p.constT>0){p.constT--;const S=p.stars6||[];for(let i=0;i<S.length;i++){const a=S[i],b=S[(i+1)%S.length];if(!a||!b)continue;for(const q of al)if(q!==p&&q.inv<=0&&(q.csCD||0)<frame&&segD(q.x,q.y,a.x,a.y,b.x,b.y)<bodyR(q)+4){q.csCD=frame+20;hit(q,p,q.x-a.x,q.y-a.y,IM.star6,1,true)}} // Megumu
   if(p.constT%40===0&&al.length>1){const fs=al.filter(q=>q!==p),q=fs[rng()*fs.length|0];xBall(p,q.x-300,q.y-400,Math.atan2(400,300),9,10,IM.star6,{c:'#c8d8ff',life:120})}
   if(p.constT===0){p.stars6=[];p.fx.const6=0}}
  if(f.blood>0)for(const q of al)if(q!==p&&q.bleed>frame&&Math.hypot(q.vx,q.vy)>1){q.hp-=.12;if(frame%6===0)ENT.push({k:'sblood',o:p.id,t:300,x:q.x,y:q.y});if(q.hp<=0)ko(q,'BLED OUT')} // Chiyari
  if(f.chain>0){const q=P[p.chT];if(!q||q.state==='dead'){f.chain=0}else{const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>70){p.x+=dx/d*(d-70)*.25;p.y+=dy/d*(d-70)*.25}q.hp-=.06;if(q.hp<=0)ko(q,'CHAINED')} // Hisami
   if(q&&q.state==='parry'&&q.t===1){q.chainP=(q.chainP||0)+1;txt(q.x,q.y-40,'CHAIN '+q.chainP+'/3','#8a4ac0',16);if(q.chainP>=3){f.chain=0;big('CHAIN BROKEN!','#fff',44)}}}
  if(f.gaze>0)for(const q of al){if(q===p||q.stoneF>frame||(q.gzCD||0)>frame)continue;const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;if(d<500&&(q.vx*dx+q.vy*dy)/d>2.5){q.gzCD=frame+120;q.stoneF=frame+90;Object.assign(q,{state:'parrystun',t:90,vx:0,vy:0,charging:false});txt(q.x,q.y-40,'PETRIFIED!','#b0a080',18);sfx('se_kira00',.5)}} // Ariya
  if(p.mags&&!P.some(o=>o.state!=='dead'&&ENT.some(e=>e.k==='jewel'&&e.o===o.id))&&frame%600===0)p.mags=0}}
DEFER(()=>{{const U0=updEnt;updEnt=e=>{const p=P[e.o];
 if(!['chick','haniwa','clay','coin','qtree','smoke','jewel','dragon','trap','hound','sblood','geyser'].includes(e.k))return U0(e);
 e.t--;if(!p||p.state==='dead'){e.t=0;return}const al=P.filter(q=>q.state!=='dead'&&q.id!==e.o);
 switch(e.k){
 case'chick':{let q=P.find(c=>c.id===e.tg&&c.state!=='dead'&&c.id!==e.o);if(!q){q=al[rng()*al.length|0];if(!q)break;e.tg=q.id} // Kutaka : poulets
  const v=e.angry?6.5:2.6,a=Math.atan2(q.y-e.y,q.x-e.x)+Math.sin(frame*.2+e.ph)*.8;e.x+=Math.cos(a)*v;e.y+=Math.sin(a)*v;
  if(Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+10&&(q.ckCD||0)<frame){q.ckCD=frame+(e.angry?10:20);const r=rng()*TAU,f=e.angry?12:7;q.vx+=Math.cos(r)*f;q.vy+=Math.sin(r)*f;txt(q.x,q.y-30,e.angry?'PECK PECK!':'peck','#ffd23a',12)}
  for(const b of B)if(!b.dead&&!b.fake&&Math.abs(b.x-e.x)<b.r+10&&Math.abs(b.y-e.y)<b.r+10){b.dead=1;if(!e.angry){e.angry=1;txt(e.x,e.y-20,'!!','#f33',16)}}
  for(const c of P)if(c.state==='atk'&&c.mv&&!c.mv.spd&&Math.hypot(c.x-e.x,c.y-e.y)<(c.mv.range||40)+12&&c.t>c.mv.start&&c.t<=c.mv.start+c.mv.act)e.angry=1;break}
 case'haniwa':{if(e.hp<=0){e.t=0;burst(e.x,e.y,'#c87a4a',14);break}const q=nearFoe(e.o,e.x,e.y);if(q){e.a=Math.atan2(q.y-e.y,q.x-e.x);e.x+=Math.cos(e.a)*1.2;e.y+=Math.sin(e.a)*1.2;if(++e.cd%50===0)xBall(p,e.x,e.y,e.a,5,8,IM.haniwa,{c:'#c87a4a',life:160})}
  for(const b of B)if(!b.dead&&b.owner!==e.o&&!b.fake&&Math.abs(b.x-e.x)<b.r+12&&Math.abs(b.y-e.y)<b.r+14){b.dead=1;e.hp-=b.heavy?4:b.dmg}
  p.hani=ENT.filter(x=>x.k==='haniwa'&&x.o===e.o&&x.t>0).length;break}
 case'clay':for(const q of P){if(q.id===e.o||q.state==='dead')continue;const dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy)||1,R=12+bodyR(q);if(d<R){q.x=e.x+dx/d*R;q.y=e.y+dy/d*R;const dot=q.vx*dx/d+q.vy*dy/d;if(dot<0){q.vx-=dot*dx/d;q.vy-=dot*dy/d}}}
  for(const b of B)if(!b.dead&&b.owner!==e.o&&Math.abs(b.x-e.x)<12+b.r&&Math.abs(b.y-e.y)<12+b.r)b.dead=1;break;
 case'coin':e.y+=e.vy;for(const q of P){if(q.state==='dead'||Math.hypot(q.x-e.x,q.y-e.y)>bodyR(q)+12)continue;e.t=0;q.coins=(q.coins||0)+1;if(q.coins%10===0)txt(q.x,q.y-40,q.coins+' coins','#ffd23a',14);sfx('coin'+(q.coins%4?q.coins%4+1:''),.2);
   if(q.coins>=100){q.coins=0;q.stocks++;big(pname(q)+': 100 COINS = +1 LIFE!','#ffd23a',44);sfx('se_cardget')}break}break;
 case'qtree':{let fire=0,water=0;for(const b of B){if(b.dead||Math.abs(b.x-e.x)>b.r+34||Math.abs(b.y-e.y)>b.r+40)continue;if(b.elem===0||(P[b.owner]&&(P[b.owner].fx.phoenix>0||P[b.owner].star>0)))fire+=b.heavy?20:6;else if(b.water||b.elem===1)water++;if(b.owner!==e.o){b.dead=1;sfx('resist',.35,1.1)}} // Takane
  for(const z of ENT)if(z.k==='fire'&&Math.hypot(z.x-e.x,z.y-e.y)<40)fire+=1;if(terrOn(0,{id:-1})||CX.terr&&CX.terr.L.includes(0))fire+=.05;if(CX.rain||CX.flood||CX.terr&&CX.terr.L.includes(1))water+=.02;
  if(water){e.lv=Math.min(4,e.lv+water*.15);e.hp=Math.min(40*e.lv,e.hp+water*4)}if(fire){e.hp-=fire;burst(e.x,e.y,'#ff5030',3);if(e.hp<=0){e.t=0;txt(e.x,e.y-30,'BURNT DOWN','#ff5030',16);break}}
  for(const q of al)if(Math.hypot(q.x-e.x,q.y-e.y)<120*e.lv**.5){const d=.15*e.lv;q.spirit=Math.max(0,q.spirit-d);q.burst=Math.max(0,q.burst-d*.6);p.spirit=Math.min(T.SPIRIT_MAX,p.spirit+d)}break}
 case'smoke':e.x+=Math.cos(e.a)*.5;e.y+=Math.sin(e.a)*.5;e.a+=(rng()-.5)*.1;for(const b of B)if(!b.dead&&b.owner!==e.o&&!b.fake&&P[b.owner]&&Math.hypot(b.x-e.x,b.y-e.y)<110&&Math.hypot(P[b.owner].x-e.x,P[b.owner].y-e.y)<110){b.owner=e.o;b.c='#c8a8ff';b.gr=0;if(b.heavy)b.dist=999}break; // Sannyo
 case'jewel':{e.y+=Math.sin(frame*.05+e.ph)*.6;e.x+=Math.cos(frame*.03+e.ph)*.6; // Misumaru
  for(const q of al)if(Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+12){e.t=0;burst(e.x,e.y,e.c,14);const it=q.lastIt&&!['mamizou','rainbow','misumaru'].includes(q.lastIt)?q.lastIt:null;if(it){big('COPIED: '+ITEMS.find(i=>i.k===it).name+'!','#4ab3ff',40);give(p,it)}else txt(q.x,q.y-40,'nothing to copy','#888',14);return}
  if(e.t===1){const q=nearFoe(e.o,e.x,e.y);if(q)xBall(p,e.x,e.y,Math.atan2(q.y-e.y,q.x-e.x),6,9,IM.mag,{stick:1,home:.05,c:e.c,life:240})}break}
 case'dragon':{if(e.hp<=0){e.t=0;big('THE DRAGON FALLS','#40c080',44);break}const q=al[(frame/180|0)%Math.max(1,al.length)]||p;e.a+=((Math.atan2(q.y-e.y,q.x-e.x)-e.a+Math.PI*3)%TAU-Math.PI)*.05;e.x+=Math.cos(e.a)*4.5;e.y+=Math.sin(e.a)*4.5; // Momoyo
  e.seg.unshift({x:e.x,y:e.y});e.seg.length=Math.min(e.seg.length,14*4);
  for(let i=0;i<e.seg.length;i+=4){const s=e.seg[i];for(const r of al)if(r.inv<=0&&(r.drCD||0)<frame&&Math.hypot(r.x-s.x,r.y-s.y)<bodyR(r)+22){r.drCD=frame+40;hit(r,p,r.x-s.x||1,r.y-s.y,IM.dragon,1,true)}}
  for(const b of B)if(!b.dead&&!b.fake&&Math.abs(b.x-e.x)<b.r+28&&Math.abs(b.y-e.y)<b.r+28){b.dead=1;e.hp-=b.heavy?4:b.dmg}
  if(Math.hypot(p.x-e.x,p.y-e.y)<bodyR(p)+30){e.t=0;p.dragonP=frame+480;p.hp=T.HP;p.giant=Math.max(p.giant,480);big('DRAGON EATEN! x2 POWER','#40c080',54);flash(.4,'#40c080');sfx('se_powerup')}break}
 case'trap':for(const q of al)if(q.inv<=0&&Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+12){e.t=0;Object.assign(q,{state:'parrystun',t:190,vx:0,vy:0,charging:false,x:e.x,y:e.y});hit(q,p,0,1,IM.trap,1,false);if(q.state==='hitstun')Object.assign(q,{state:'parrystun',t:190});big('TRAPPED!','#a08060',40);break}break; // Enoko
 case'hound':{const q=al.sort((a,b)=>a.hp-b.hp)[0];if(!q)break;const tr=ENT.filter(t=>t.k==='trap'&&t.o===e.o).sort((a,b)=>Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y))[0];
  const tx=tr?q.x+(q.x-tr.x)/(Math.hypot(q.x-tr.x,q.y-tr.y)||1)*60:q.x,ty=tr?q.y+(q.y-tr.y)/(Math.hypot(q.x-tr.x,q.y-tr.y)||1)*60:q.y;e.x+=(tx-e.x)*.06+Math.cos(e.i*2+frame*.05)*2;e.y+=(ty-e.y)*.06+Math.sin(e.i*2+frame*.05)*2;
  if(Math.hypot(q.x-e.x,q.y-e.y)<bodyR(q)+14&&(q.hnCD||0)<frame){q.hnCD=frame+30;if(tr){const dx=tr.x-q.x,dy=tr.y-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*9;q.vy+=dy/d*9}txt(q.x,q.y-30,'GRR!','#a08060',12)}break}
 case'sblood':if(Math.hypot(p.x-e.x,p.y-e.y)<bodyR(p)+10&&p.fx.blood>0){e.t=0;p.hp=Math.min(T.HP,p.hp+2);p.spirit=Math.min(T.SPIRIT_MAX,p.spirit+2)}break;
 case'geyser':if(e.t===1){shake=Math.min(30,shake+8);burst(e.x,e.y,'#ff5030',30);for(const q of al)if(q.inv<=0&&Math.hypot(q.x-e.x,q.y-e.y)<60+bodyR(q))hit(q,p,0,-1,IM.lava,1,true);ENT.push({k:'clay',o:-1,t:400,x:e.x,y:e.y,rock:1})}break}}}});
function chDraw4(){const al=P.filter(q=>q.state!=='dead');ctx.textAlign='center';
 if(CX.road&&0)for(const c of CX.road.c){ctx.globalAlpha=.25;ctx.fillStyle='#e8c040';const cx=c.x+c.w/2,cy=c.y+c.h/2;for(let i=-1;i<=1;i++){ctx.save();ctx.translate(cx+Math.cos(c.a+Math.PI/2)*i*80,cy+Math.sin(c.a+Math.PI/2)*i*80);ctx.rotate(c.a);ctx.beginPath();ctx.moveTo(40,0);ctx.lineTo(-20,-30);ctx.lineTo(-20,30);ctx.fill();ctx.restore()}ctx.globalAlpha=1;ctx.strokeStyle='rgba(232,192,64,.4)';ctx.strokeRect(c.x,c.y,c.w,c.h)}
 if(CX.void)for(const c of CX.void.cells){const open=frame>=CX.void.open;ctx.globalAlpha=open?.95:.25+.25*((frame>>2)&1);ctx.fillStyle=open?'#000':'#401060';ctx.fillRect(c.x+2,c.y+2,c.w-4,c.h-4);ctx.globalAlpha=1}
 if(CX.slope){const S=CX.slope;ctx.globalAlpha=.15;ctx.strokeStyle='#c8a070';ctx.lineWidth=3;for(const q of al)for(let i=0;i<3;i++){const x=q.x+(i-1)*60,y=q.y-60;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(S.a)*40,y+Math.sin(S.a)*40);ctx.stroke()}ctx.globalAlpha=1}
 for(const e of ENT)switch(e.k){
  case'chick':ctx.fillStyle=e.angry?'#ff3030':'#fff';ctx.beginPath();ctx.arc(e.x,e.y,9,0,TAU);ctx.fill();ctx.fillStyle='#f33';ctx.fillRect(e.x-2,e.y-13,4,5);ctx.fillStyle='#fa0';ctx.fillRect(e.x+7,e.y-2,5,3);break;
  case'haniwa':ctx.fillStyle='#c87a4a';ctx.fillRect(e.x-9,e.y-14,18,28);ctx.fillStyle='#000';ctx.fillRect(e.x-5,e.y-8,3,3);ctx.fillRect(e.x+2,e.y-8,3,3);ctx.fillRect(e.x-3,e.y,6,3);break;
  case'clay':ctx.fillStyle=e.rock?'#5a4030':'#8a6a4a';ctx.beginPath();ctx.arc(e.x,e.y,12,0,TAU);ctx.fill();break;
  case'coin':ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.ellipse(e.x,e.y,7*Math.abs(Math.cos(frame*.15+e.x)),7,0,0,TAU);ctx.fill();break;
  case'qtree':{const s=Math.sqrt(e.lv);ctx.fillStyle='#5a3a20';ctx.fillRect(e.x-6*s,e.y-6,12*s,30*s);ctx.fillStyle='#3a9a3a';ctx.beginPath();ctx.arc(e.x,e.y-14*s,26*s,0,TAU);ctx.fill();ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(e.x,e.y,120*s,0,TAU);ctx.fill();ctx.globalAlpha=1;break}
  case'smoke':ctx.globalAlpha=.3;ctx.fillStyle='#c8a8ff';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(e.x+Math.cos(i*1.6+frame*.02)*40,e.y+Math.sin(i*1.6+frame*.02)*30,60,0,TAU);ctx.fill()}ctx.globalAlpha=1;break;
  case'jewel':ctx.fillStyle=e.c;ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(e.x+6,e.y+8,6,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,10,0,TAU);ctx.stroke();break;
  case'dragon':drawDragon(e);break;
  case'trap':ctx.globalAlpha=.35;ctx.strokeStyle='#a08060';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,14,0,TAU);ctx.stroke();ctx.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8;ctx.moveTo(e.x+Math.cos(a)*10,e.y+Math.sin(a)*10);ctx.lineTo(e.x+Math.cos(a)*18,e.y+Math.sin(a)*18)}ctx.stroke();ctx.globalAlpha=1;break;
  case'hound':ctx.fillStyle='#a08060';ctx.beginPath();ctx.ellipse(e.x,e.y,16,9,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(e.x+14,e.y-4,7,0,TAU);ctx.fill();break;
  case'sblood':ctx.fillStyle='rgba(160,10,20,.6)';ctx.beginPath();ctx.ellipse(e.x,e.y,9,5,0,0,TAU);ctx.fill();break;
  case'geyser':ctx.globalAlpha=.3+.4*((frame>>2)&1);ctx.fillStyle='#ff5030';ctx.beginPath();ctx.arc(e.x,e.y,60,0,TAU);ctx.fill();ctx.globalAlpha=1;break;
  case'lbeam':if(e.staff){ctx.strokeStyle='#e8a040';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke()}break}
 for(const p of al){const f=p.fx;
  if(f.stones>0)for(let i=0;i<p.stones;i++){ctx.fillStyle=i%2?'#c8b8a0':'#a09080';ctx.beginPath();ctx.ellipse(p.x,p.y-bodyR(p)-8-i*9,12-i*.5,5,0,0,TAU);ctx.fill()}
  if(f.whisper>0){ctx.fillStyle='#e8e0a0';ctx.font='12px monospace';ctx.fillText('*whisper*',p.x+30,p.y-30)}
  if(f.const6>0||p.constT>0){const S=p.stars6||(p.stars6=[]);ctx.strokeStyle='#9ab0ff';ctx.lineWidth=p.constT>0?4:1;ctx.beginPath();S.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));if(p.constT>0)ctx.closePath();ctx.stroke();
   for(const s of S){ctx.fillStyle='#fff';ctx.beginPath();for(let k=0;k<10;k++){const r=k%2?5:12,a=k*Math.PI/5+frame*.05;ctx.lineTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r)}ctx.fill()}}
  if(f.chain>0){const q=P[p.chT];if(q){ctx.strokeStyle='#8a4ac0';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([])}}
  if(f.gallop>0){ctx.fillStyle='#fff';ctx.font='bold 12px monospace';ctx.fillText('SPEED '+(p.galV|0),p.x,p.y+46)}
  if(p.bleed>frame){ctx.fillStyle='#c01020';ctx.beginPath();ctx.arc(p.x+10,p.y-18,3,0,TAU);ctx.fill()}
  if(p.noAtk>frame){ctx.fillStyle='#6a9a4a';ctx.font='bold 12px monospace';ctx.fillText('NO WILL',p.x,p.y-42)}
  if(p.mags){ctx.fillStyle='#4ab3ff';for(let i=0;i<p.mags;i++){const a=frame*.1+i*TAU/5;ctx.beginPath();ctx.arc(p.x+Math.cos(a)*24,p.y+Math.sin(a)*24,4,0,TAU);ctx.fill()}}
  if(CX.coins){ctx.fillStyle='#ffd23a';ctx.font='bold 12px monospace';ctx.fillText((p.coins||0)+'/100',p.x,p.y+46)}
  if(f.gaze>0){ctx.strokeStyle='rgba(176,160,128,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,500,0,TAU);ctx.stroke()}
  if(p.stoneF>frame){ctx.fillStyle='rgba(150,140,120,.8)';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+3,0,TAU);ctx.fill()}}
 if(CX.mirage){ctx.save();ctx.globalAlpha=1;const cx=T.MAP_W/2,cy=T.MAP_H/2;ctx.translate(cx,cy);ctx.scale(-1,1);ctx.rotate(Math.sin(frame*.01)*.2);ctx.translate(-cx,-cy); // Nina : mirage inversé
  for(const q of al){ctx.fillStyle='#222';ctx.strokeStyle=COLS[q.id];ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,T.CORE_R,0,TAU);ctx.fill()}
  for(let i=0;i<B.length;i+=2){const b=B[i];ctx.fillStyle=b.c||LCOLS[b.owner]||'#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill()}ctx.restore()}}
