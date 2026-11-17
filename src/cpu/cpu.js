'use strict';
// ================= CPU =================
// Niveau CPU : k=0 (niv. 1) à 1 (niv. 9). Le CPU ne triche pas : il lit l'écran et appuie sur les mêmes boutons, seuls ses réflexes changent
const AIL=lv=>{const k=(lv-1)/8;return{k,react:lv>=9?1:Math.round(40*Math.pow(1-k,1.5))+2,parry:lv<=1?0:lv>=9?1:.02+.9*k*k*k,dodge:lv<=1?.03:lv>=9?1:.15+.8*k*k,think:lv>=9?1:Math.round(20*(1-k))+1,combo:lv<=1?.05:lv>=9?1:.15+.8*k,tech:lv<=1?0:lv>=9?1:.9*k*k,burst:lv<=1?0:lv>=9?1:.9*k}};
function tti(b,x,y,R){const rx=b.x-x,ry=b.y-y,a=b.vx*b.vx+b.vy*b.vy,bb=2*(rx*b.vx+ry*b.vy),c=rx*rx+ry*ry-R*R; // frames avant contact (joueur immobile)
 if(c<=0)return 0;if(bb>=0||a===0)return -1;const ds=bb*bb-4*a*c;return ds<0?-1:(-bb-Math.sqrt(ds))/(2*a)}
function hazard(p,x,y){let D=0; // dangers hors balles : rayons, zones, laser, trous, lames, élixir
 for(const k of KOB)if(k.o!==p.id&&k.t<40){const c=Math.cos(k.a),s=Math.sin(k.a),rx=x-k.x,ry=y-k.y;if(rx*c+ry*s>0&&Math.abs(ry*c-rx*s)<90)D+=25}
 for(const z of ZONES)if(z.o!==p.id&&z.t<50&&Math.hypot(x-z.x,y-z.y)<z.r+24)D+=15;
 for(const h of HOLES)if(h.o!==p.id&&Math.hypot(x-h.x,y-h.y)<140)D+=6;
 for(const j of JUDG)if(j.o!==p.id&&j.t>0&&j.t<40&&(Math.abs(x-j.x)<45||Math.abs(y-j.y)<45))D+=20;for(const c of CLOUDS)if(c.o!==p.id&&Math.hypot(x-c.x,y-c.y)<c.r+8)D+=3;
 for(const q of P){if(q===p||q.state==='dead')continue;
  if(q.spk>0&&q.spk<100){const c=Math.cos(q.spkA),s=Math.sin(q.spkA),rx=x-q.x,ry=y-q.y;if(rx*c+ry*s>0&&Math.abs(ry*c-rx*s)<80)D+=25}
  if((q.blade>0||q.star>0)&&Math.hypot(x-q.x,y-q.y)<80)D+=8}
 return D}
let AIN;DEFER(()=>{AIN=new Float64Array(512*7)});
function cpuInput(p,o){
 const I={x:0,y:0,b:{}},ai=p.ai,L=AIL(cpuLv),roll=v=>rng()<v;
 if(!ai.seen){Object.assign(ai,{seen:new Map(),dec:new Map(),held:{},style:['zoner','mid','rush'][rng()*3|0],mx:0,my:0,mf:false,th:0,gT:0,s:1,swT:0})}
 const out=()=>{cpuLate(p,I);for(const k of['heavy','melee','burst','spell','dash','next','prev']){if(I.b[k]&&ai.held[k])I.b[k]=false;ai.held[k]=!!I.b[k]}if(I.b.parry&&ai.held.parry&&!ai.keepP)I.b.parry=false;ai.held.parry=!!I.b.parry;ai.keepP=0;return I}; // relâcher entre deux appuis
 if(ai.seen.size>300){ai.seen.clear();ai.dec.clear()}
 if(p.state==='dead')return out();
 if(cpuCh(p,I))return out();
 const st=p.state,dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
 // ---- touché : DI vers le centre et loin de l'attaquant, tech au mur, burst
 if(st==='hitstun'){
  if(!ai.diSet){const kx=p.diPend?p.kbx:p.vx,ky=p.diPend?p.kby:p.vy,kl=Math.hypot(kx,ky)||1,px=-ky/kl,py=kx/kl,cx=T.MAP_W/2-p.x,cy=T.MAP_H/2-p.y,
   sc=g=>px*g*cx+py*g*cy-(px*g*dx+py*g*dy)*.6,g=sc(1)>sc(-1)?1:-1;ai.di=roll(L.k)?[px*g,py*g]:[rng()*2-1,rng()*2-1];ai.diSet=1}
  I.x=ai.di[0];I.y=ai.di[1];
  if(Math.hypot(p.vx,p.vy)>T.WALL_MIN){const R=T.BODY_R,fx=p.vx>0?(T.MAP_W-R-p.x)/p.vx:p.vx<0?(p.x-R)/-p.vx:99,fy=p.vy>0?(T.MAP_H-R-p.y)/p.vy:p.vy<0?(p.y-R)/-p.vy:99;
   if(Math.min(fx,fy)<=3&&roll(L.tech))I.b.parry=true}
  if(p.burst>=T.BURST_MAX&&(p.combo>=2||p.hp<30||inEdge(p)&&p.pips<=1)&&roll(L.burst*.3))I.b.burst=true;
  return out()}
 ai.diSet=0;
 let act=null,thr=null;
 // ---- menaces : grosses balles (parry au bon moment ou esquive)
 for(const b of B){if(!b.heavy||b.owner===p.id||b.fz)continue;{const ax=b.x-p.x,ay=b.y-p.y;if(ax>420||ax<-420||ay>420||ay<-420)continue}const t=tti(b,p.x,p.y,b.r+T.PARRY_R-4);if(t<0||t>30)continue;
  const t2=tti(b,p.x,p.y,b.r+coreR(p)+5);if(t2<0||b.dist+Math.hypot(b.vx,b.vy)*t2<b.m.arm)continue;
  if(!ai.seen.has(b))ai.seen.set(b,frame);if(frame-ai.seen.get(b)<L.react)continue;
  if(!thr||t<thr.t)thr={t,b}}
 if(st==='idle'){
  if(thr){let dc=ai.dec.get(thr.b);if(dc===undefined){dc=roll(L.parry)?'parry':'dodge';ai.dec.set(thr.b,dc)}
   if(thr.b.np||thr.b.breaker)dc='dodge';if(dc==='parry'&&thr.t<=3){I.b.parry=true;return out()}
   if(dc==='dodge'&&thr.t<9&&p.boost>=T.DASH_COST&&roll(L.dodge*(thr.b.np?1:.4))){const b=thr.b,v=Math.hypot(b.vx,b.vy)||1;I.x=-b.vy/v;I.y=b.vx/v;I.b.dash=true;return out()}}
  for(const q of P){if(q===p||q.state!=='atk'||!q.mv||q.mv.spd)continue; // coups de mêlée
   const m=q.mv,qd=Math.hypot(q.x-p.x,q.y-p.y),reach=m.range*(q.giant>0?1.6:1)+bodyR(p)+(m.move||0)*4+8;
   if(q.charging){if(qd<reach+40)act='away';continue}
   const fa=m.start-q.t;if(qd<reach&&fa>=0&&fa<=2&&q.t>=L.react-2){if(roll(L.parry)){I.b.parry=true;return out()}act='away'}}
  for(const k of KOB)if(k.o!==p.id&&k.t<=6){const c=Math.cos(k.a),s=Math.sin(k.a),rx=p.x-k.x,ry=p.y-k.y; // rayon de KO
   if(rx*c+ry*s>0&&Math.abs(ry*c-rx*s)<70+T.BODY_R&&roll(L.parry)){I.b.parry=true;return out()}}}
 // ---- punir / combo
 const vul=o.state==='hitstun'||o.state==='parrystun'||o.state==='parrylag'||o.state==='dashlag'||o.state==='bursting'&&!o.bHit&&o.t>T.BURST_START||o.state==='atk'&&o.mv&&o.t>o.mv.start+(o.mv.act||0);
 if(!act&&vul&&o.state!=='dead'&&roll(L.combo)){
  const rem=o.state==='atk'?o.mv.start+(o.mv.act||0)+o.mv.rec-o.t:o.state==='bursting'?T.BURST_START+T.BURST_REC-o.t:o.t;
  const fl=n=>o.state==='hitstun'?(1-Math.pow(.93,n))/.07:n*.4,pd=n=>Math.hypot(o.x+o.vx*fl(n)-p.x,o.y+o.vy*fl(n)-p.y); // position prévue
  const MS=MELEE[p.shotT]||{},J=MS.jab||MOVES.jab,LU=MS.lunge||MOVES.lunge,SG=MS.strong||MOVES.strong,rr=p.giant>0?1.6:1;
  if(st==='idle'){
   if(o.state==='hitstun'&&inEdge(o)&&o.pips<=1&&pd(SG.start+1)<SG.range*rr+bodyR(o)&&rem>SG.start+1)act='strong'; // fin au mur
   else if(pd(J.start+1)<J.range*rr+bodyR(o)-2&&rem>J.start)act='jab';
   else if(pd(LU.start+1)<LU.range*rr+(LU.move||0)*5+bodyR(o)-4&&rem>LU.start+1)act='lunge';
   else if(pd(10)<240&&p.boost>=T.DASH_COST&&rem>8)act='dashin';
   else if(rem>10&&d>200)act='heavyF'}
  else if(st==='dash'&&d<62)act='dashatk';
  else if(st==='atk'&&p.mv&&!p.mv.spd&&p.t>p.mv.start+(p.mv.act||0)&&d>70&&p.spirit>=T.CANCEL_COST&&p.boost>=T.DASH_COST&&roll(L.k))act='cancel'}
 // ---- neutre
 if(!act&&st==='idle'){
  if(p.ult&&roll(.1))I.b.spell=true;
  else if(p.spirit>=T.SPELL_COST&&d>120&&o.state!=='spell'&&roll(.03+.1*L.k))I.b.spell=true;
  else if((p.rifle>0&&d>250||p.fx.warp>0&&d>150||p.fx.slash>0&&d<260||p.fx.gung>0&&d<600||p.fx.mech>0&&d<500||p.fx.under>0&&d<130||CX.flood&&CX.flood.o===p.id&&d<450)&&roll(.04))I.b.heavy=true;
  else if(p.fx.hist>0&&p.histBuf.length&&p.histBuf[0].hp>p.hp+25&&roll(.1))I.b.heavy=true;
  else if(p.cam>0&&d<320&&roll(.04))I.b.heavy=true;
  else if(o.state==='dash'&&d<220&&(o.vx*-ux+o.vy*-uy)>0&&roll(L.k*.5))act='heavyF'; // le lourd bat le dash
  else if(o.state==='atk'&&o.charging&&d<80&&p.burst>=T.BURST_MAX&&roll(L.k*.2))I.b.burst=true;
  else if(d<(MELEE[p.shotT].jab||MOVES.jab).range+T.BODY_R+6&&o.state==='idle'&&roll(.05+.15*L.k))act='jab';
  else if(d>140&&roll(.006+.02*L.k)){I.b.heavy=true;const v=d>350?-1:0;I.x=ux*v;I.y=uy*v;return out()}
  else if(ai.style==='rush'&&d>160&&p.boost>=2&&roll(.01+.03*L.k))act=cpuLv>=6&&roll(.5)?'glide':'dashin';
  if(cpuLv>=4&&--ai.swT<=0){ai.swT=120+rng()*120|0;const want=roll(.3)?rng()*4|0:d>380?(roll(.5)?3:2):d>180?0:1;if(want!==p.shotT)ai.want=want}
  if(ai.want!==undefined&&ai.want!==p.shotT&&frame%12===0)I.b.next=true}
 I.b.shot=st!=='spell'&&d<800&&!(L.k>.6&&p.boost<1.5&&!vul); // le CPU fort arrête de tirer pour recharger son dash
 // ---- exécution des actions
 act=aiTune(p,o,ai,L,act);
 if(!act&&st==='idle'&&o.state==='parry'&&d<70&&roll(.5+.5*L.k))act='grab'; // l'adversaire pare : on l'attrape
 if(!act&&st==='idle'&&(o.pCnt||0)>1&&d>120&&d<500&&(p.brCD||0)<frame&&roll(.01+.03*L.k))act='breaker';
 if(!act&&st==='idle'&&ai.aggro>frame&&d>90&&p.boost>=T.DASH_COST&&roll(.05))act='dashin';
 if(act==='grab'||act==='breaker'){ai.keepP=1;I.b.parry=true;I.b[act==='grab'?'melee':'heavy']=true;ai.held[act==='grab'?'melee':'heavy']=false;return out()}
 if(act==='heavyN'){I.b.heavy=true;return out()}
 if(act==='jab'||act==='lunge'||act==='dashatk'){I.b.melee=true;I.b.focus=false;if(act==='lunge'){I.x=ux;I.y=uy}return out()}
 if(act==='strong'){I.b.melee=true;I.b.focus=true;return out()}
 if(act==='heavyF'){I.b.heavy=true;I.x=ux;I.y=uy;return out()}
 if(act==='dashin'||act==='cancel'||act==='glide'){I.b.dash=true;I.b.focus=act==='glide';I.x=ux;I.y=uy;return out()}
 // ---- déplacement : objectif + esquive par échantillonnage de trajectoires
 let gx,gy;const tr=ENT.find(e=>e.k==='treasure'&&e.o===p.id)||ENT.find(e=>e.k==='book');if(tr&&!vul){gx=tr.x;gy=tr.y}else if(item&&!(vul&&d<150)){gx=item.x;gy=item.y;if(Math.hypot(o.x-item.x,o.y-item.y)<T.ITEM_R+T.BODY_R&&d<260&&st==='idle'&&roll(.15))I.b.heavy=true} // attiré par les cartes
 else{if(--ai.gT<=0){ai.gT=40+rng()*60|0;ai.s=rng()<.5?1:-1}const want=({zoner:340,mid:210,rush:70})[ai.style]*(act==='away'?2:1);gx=o.x-ux*want-uy*ai.s*90;gy=o.y-uy*want+ux*ai.s*90}
 const mg=T.EDGE+70;gx=clamp(gx,mg,T.MAP_W-mg);gy=clamp(gy,mg,T.MAP_H-mg);
 if(--ai.th<=0||thr){ai.th=L.think;let nn=0;const CR=coreR(p),NB=AIN; // balles proches copiées dans un tableau typé (x,y,vx,vy,hr,lim²,poids)
  const vr=gOn('blind',p)?150:260;for(const b of B){if(b.owner===p.id||b.fz)continue;const ex=b.x-p.x,ey=b.y-p.y;if(ex*ex+ey*ey<vr*vr&&roll(L.dodge)&&nn<512){const hr=b.r+CR+(b.heavy?6:3),lm=hr+T.GRAZE_R,o=nn++*7;NB[o]=b.x;NB[o+1]=b.y;NB[o+2]=b.vx;NB[o+3]=b.vy;NB[o+4]=hr+4;NB[o+5]=lm*lm;NB[o+6]=b.heavy?3:1}}
  let best=1e9;const sps=cpuLv>=4&&nn>3?[T.SPEED,T.FOCUS_SPEED]:[T.SPEED],G6=cpuLv>=6,HZ=KOB.length||ZONES.length||HOLES.length||JUDG.length||CLOUDS.length||P.some(q=>q.spk>0||q.blade>0||q.star>0)||ENT.some(e=>e.k==='wbeam'||e.k==='moonf'||e.k==='onbw'||e.k==='bolt'||e.k==='geyser'||e.k==='sand'||e.k==='whirl')||!!(CX.void&&CX.void.cells.length)||!!CX.mtn; // dangers présents ?
  for(const spd of sps)for(let i=-1;i<8;i++){const cx=i<0?0:Math.cos(i*Math.PI/4),cy=i<0?0:Math.sin(i*Math.PI/4);let D=0;
   for(const s of[3,6,10,15]){const x=p.x+cx*spd*s,y=p.y+cy*spd*s;
    if(WARP<=0&&(x<T.EDGE||y<T.EDGE||x>T.MAP_W-T.EDGE||y>T.MAP_H-T.EDGE))D+=4;if(HZ)D+=hazard(p,x,y)*(5/(s+2));
    const ks=20/(s+5);for(let o=0,e7=nn*7;o<e7;o+=7){const ex=NB[o]+NB[o+2]*s-x,ey=NB[o+1]+NB[o+3]*s-y,e2=ex*ex+ey*ey;if(e2>NB[o+5])continue;const e=Math.sqrt(e2),h4=NB[o+4]; // rejet sans racine carrée
     if(e<h4)D+=(h4-e)*NB[o+6]*ks;else if(G6)D-=.05}} // frôler sans toucher = graze
   D+=Math.hypot(gx-(p.x+cx*spd*10),gy-(p.y+cy*spd*10))*.01;
   if(D<best){best=D;ai.mx=cx;ai.my=cy;ai.mf=spd===T.FOCUS_SPEED}}}
 I.x=ai.mx;I.y=ai.my;I.b.focus=ai.mf;
 return out()}
