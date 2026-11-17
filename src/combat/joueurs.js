'use strict';
// ================= Joueurs =================
const nearWall=(p,m)=>p.x<m||p.y<m||p.x>T.MAP_W-m||p.y>T.MAP_H-m;
const inEdge=p=>WARP<=0&&(nearWall(p,T.EDGE+(CX.hell?CX.hell.w:0))||shrEdge(p)); // pas de zone rouge pendant le Warp
const parryOn=p=>p.state==='parry'||!!(p.fx&&p.fx.guard>0); // Momiji : parade auto
function rel(I,p){const l=Math.hypot(I.x,I.y);if(l<.3)return'N';const d=(I.x*Math.cos(p.aim)+I.y*Math.sin(p.aim))/l;return d>.45?'F':d<-.45?'B':'N'}

function updP(p,o,I){
 
 I=chInput(p,I);
 const b=I.b,pv=p.prev,BF=p.buf||(p.buf={});for(const k in b)if(b[k]&&!pv[k]&&!NOBUF.has(k))BF[k]=frame;const pr=k=>NOBUF.has(k)?b[k]&&!pv[k]:BF[k]!==undefined&&frame-BF[k]<=(k==='parry'?3:8);p.prev={...b};if(pr('parry'))p.lpF=frame; // buffer d'entrées
 if(b.parry&&/^(idle|parry|parrylag|dashlag)$/.test(p.state)){if(pr('melee')){startAtk(p,'grab');sfx('catch',.6);txt(p.x,p.y-34,'GRAB','#c07aff',14);return} // grab : n'attrape QUE celui qui pare
  if(pr('heavy')&&(p.brCD||0)<frame){p.brCD=frame+90;p.state='idle';xBall(p,p.x,p.y,p.aim,6.5,17,{dmg:0,kb:0,stun:0,arm:0},{breaker:1,c:'#fff',life:200});sfx('shoot4',.7);return}} if(p.pick&&p.state!=='dead'){xPick(p,I,pr);return} // Mamizou : menu
 if(p.state==='dead'){if(p.stocks>0&&--p.t<=0)respawn(p,o);return}
 if(pr('dash')||pr('parry'))p.techBuf=10;else if(p.techBuf>0)p.techBuf--;
 if(p.inv>0)p.inv--;if(p.flash>0)p.flash--;if(p.comboT>0)p.comboT--;
 if(p.buffT>0&&--p.buffT===0)p.buff=null;
 if(p.state!=='dash'){if(p.dashCd>0)p.dashCd--;else p.boost=Math.min(T.DASH_CHARGES,p.boost+T.DASH_REGEN*(b.shot||p.state==='spell'?1:T.DASH_REGEN_IDLE)*(p.fx.haste>0?3:1))}
 if(pr('next')||pr('prev')){p.shotT=(p.shotT+(pr('next')?1:SHOTS.length-1))%SHOTS.length;txt(p.x,p.y-30,SHOTS[p.shotT].name,LCOLS[p.id],13);sfx('move',.7)}
 p.burst=Math.min(T.BURST_MAX,p.burst+T.BURST_REGEN);
 if(inEdge(p))p.edgeOut=0; // les pips ne reviennent qu'à la mort
 if(inEdge(p)&&p.inv<=0&&!p.krobe&&!(CX.hell&&CX.hell.o===p.id)){p.hp-=T.EDGE_DMG*(CX.hell?5:1);if(frame%8===0)FX.push({x:p.x+(Math.random()-.5)*20,y:p.y+(Math.random()-.5)*20,vx:0,vy:-1,t:16,c:'#f44'});if(p.hp<=0){ko(p,'K.O.');return}} // zone rouge
 {const ap=CX.don?[CX.don.x,CX.don.y-10]:p.state!=='spell'&&p.maim||aimPt(o);p.aim=Math.atan2(ap[1]-p.y,ap[0]-p.x)+(p.wsA||0)}  // Tsukasa : visée tordue
 p.focus=!!b.focus;
 const st=p.state;
 if(pr('burst'))log('BURST combo P'+(p.id+1)+' state '+st);if(pr('spell'))log('SPELL combo P'+(p.id+1)+' state '+st);
 if(pr('burst')&&p.burst>=T.BURST_MAX&&/^(idle|atk|hitstun|dashlag|parrylag|parry|dash)$/.test(st)){doBurst(p);return}
 if(pr('spell')&&p.ult&&/^(idle|dash|dashlag|parry|parrylag|atk)$/.test(st)){p.ult=0;startSpell(p,o,true);return} // ULTIME
 if(pr('spell')&&p.spirit>=T.SPELL_COST&&/^(idle|dash|dashlag|parry|parrylag|atk)$/.test(st)){if(st==='dash'&&T.DASH_T-p.t<10)p.boost=Math.min(T.DASH_CHARGES,p.boost+T.DASH_COST);startSpell(p,o);return}
 
 if(pr('spell')&&p.spirit<T.SPELL_COST&&!p.ult&&(p.spRef||0)<frame){p.spRef=frame+45;txt(p.x,p.y-30,'SPELL '+(p.spirit|0)+'%','#f8f',13);sfx('cancel00',.4);log('spell refused: spirit '+(p.spirit|0)+'%')}
 if(p.spirit>=T.SPELL_COST){if(!p.spReady){p.spReady=1;txt(p.x,p.y-50,'SPELL READY','#f8f',18);RINGS.push({x:p.x,y:p.y,r:0,m:80,t:24,c:'#f8f'});flash(.15,'#f8f')}}else p.spReady=0
 switch(st){
  case'hitstun':if(!p.spit){p.vx*=.93;p.vy*=.93}else{p.t=Math.max(p.t,2);p.inv=Math.max(p.inv,2)}if(--p.t<=0){p.state='idle';p.combo=0}return;
  case'eaten':updEaten(p);return;
  case'cocoon':updCocoon(p,I);return;
  case'pray':updPray(p);return;
  case'parrystun':p.vx*=.8;p.vy*=.8;if(--p.t<=0)p.state='idle';return;
  case'parry':p.vx*=.7;p.vy*=.7;if(++p.t>=T.PARRY_ACT){p.state='parrylag';p.t=T.PARRY_WHIFF}return; // parry Rivals
  case'parrylag':p.vx*=.7;p.vy*=.7;if(--p.t<=0)p.state='idle';return;
  case'dash':{
   if(p.noSteer>0)p.noSteer--;
   else if(Math.hypot(I.x,I.y)>.3){const s=Math.hypot(p.vx,p.vy),a=Math.atan2(p.vy,p.vx); // dash orientable (courbe)
    const da=((Math.atan2(I.y,I.x)-a)%TAU+TAU*1.5)%TAU-Math.PI,na=a+clamp(da,-.12,.12);p.vx=Math.cos(na)*s;p.vy=Math.sin(na)*s}
   if(pr('focus')){glide(p,I);return}            // glissade dans n'importe quelle direction
   if(pr('melee')){startAtk(p,'dashatk');return} // attaque en dash : garde l'élan
   if(--p.t<=0){if(b.dash){p.state='idle';p.run=true;p.vx*=.6;p.vy*=.6} // dash maintenu = course
    else{p.state='dashlag';p.t=T.DASH_LAG;p.vx*=.5;p.vy*=.5}}return}
  case'dashlag':if(pr('focus')){glide(p,I);return}p.vx*=.88;p.vy*=.88;if(--p.t<=0)p.state='idle';return;
  case'bursting':updBurst(p,o);return;
  case'spell':updSpell(p,o,I);return;
  case'rifle':p.t++;p.vx=p.vx*.8+I.x*.5;p.vy=p.vy*.8+I.y*.5;if(p.t>=IM.rifle.start)fireRifle(p);return; // fusil : visée puis tir
  case'atk':atk(p,o,I,pr);return}
 const il=Math.hypot(I.x,I.y);
 if(p.run&&(il<.3||p.focus||!b.dash))p.run=false;
 let sp=p.focus?T.FOCUS_SPEED:p.run?T.RUN_SPEED:T.SPEED;if(b.shot)sp*=.8;if(p.buff==='VITESSE')sp*=1.3;if(p.star>0)sp*=1.25;if(p.spk>0&&p.spk<90)sp*=.4;if(p.giant>0)sp*=.9;if(gOn('melan',p))sp*=.6;if(p.inCloud)sp*=.85;sp*=chSpeed(p);
 if(p.fx.spin>0){const V=p.spinV||9,l=Math.hypot(I.x,I.y);if(l>.3){p.vx+=(I.x/l*V-p.vx)*.06;p.vy+=(I.y/l*V-p.vy)*.06}const k=V/Math.max(.1,Math.hypot(p.vx,p.vy));p.vx*=k;p.vy*=k} // Chen : boule
 else if(p.slide>0){p.slide--;p.vx=p.vx*.955+I.x*sp*.1;p.vy=p.vy*.955+I.y*sp*.1} // glissade : élan conservé, actionnable
 else{const s=Math.hypot(p.vx,p.vy);
  if(!p.focus&&il>.3&&s>3&&(p.vx*I.x+p.vy*I.y)/(s*il)<-.6){p.vx=I.x/il*s*.9;p.vy=I.y/il*s*.9;burst(p.x,p.y,'#888',3)} // pivot instantané
  const ac=gOn('ice',p)||terrOn(1,p)||p.drug&&p.drug.k==='HYPER'||p.wet>frame?.04:p.focus?.5:p.run?.14:.24;p.vx+=(I.x*sp-p.vx)*ac;p.vy+=(I.y*sp-p.vy)*ac}
 if(p.run&&frame%4===0)FX.push({x:p.x,y:p.y,vx:0,vy:0,t:12,c:'#666'});
 if(pr('focus')&&Math.hypot(p.vx,p.vy)>T.BRAKE_MIN){p.vx*=.15;p.vy*=.15;p.slide=0;p.run=false;burst(p.x,p.y,'#aaa',5)} // freinage net
 if(p.shotCd>0)p.shotCd--;
 if(pr('parry')){p.state='parry';p.t=0;p.pStart=frame;p.run=false;p.pCnt=(p.pCnt||0)*.9+1;return}
 if(pr('dash')&&p.boost>=T.DASH_COST){if(p.focus){p.boost-=T.DASH_COST;p.dashCd=T.DASH_REGEN_DELAY;glide(p,I)}else dash(p,I);return} // Focus+Dash = glissade directe
 if(pr('melee')){if(chMelee(p))return;startAtk(p,p.focus?'strong':rel(I,p)==='F'?'lunge':'jab');return}
 if(pr('heavy')){if(p.rifle>0){p.state='rifle';p.t=0;p.rsrc=sfx('charge',.5);return}if(p.cam>0){snap(p);return}if(heavyItem(p,o))return;startAtk(p,'heavy'+rel(I,p));return}
 if(b.shot&&p.shotCd<=0&&!(p.spk>0&&p.spk<90))fireLight(p)}

function startAtk(p,n){Object.assign(p,{mHit:0,state:'atk',mv:(MELEE[p.shotT]||{})[n]||MOVES[n],nextHit:0,mvName:n,t:0,hitDone:false,atkA:p.aim,charge:0,charging:n==='strong',run:false,
 carry:Math.hypot(p.vx,p.vy)>5?.93:0})} // carry : une attaque lancée en mouvement garde l'élan
function glide(p,I){ // glissade (wavedash) : direction du stick, sinon élan actuel
 const l=Math.hypot(I.x,I.y),cs=Math.hypot(p.vx,p.vy),s=Math.max(cs,T.DASH_V*.85);
 let x,y;if(l>.3){x=I.x/l;y=I.y/l}else if(cs>1){x=p.vx/cs;y=p.vy/cs}else{x=-Math.cos(p.aim);y=-Math.sin(p.aim)}
 sfx('roll2',.6);Object.assign(p,{state:'idle',slide:T.SLIDE_T,run:false,vx:x*s,vy:y*s});
 for(let i=0;i<6;i++)FX.push({x:p.x,y:p.y,vx:-x*2+(Math.random()-.5)*3,vy:-y*2+(Math.random()-.5)*3,t:14,c:'#ccc'})}
function atk(p,o,I,pr){
 const m=p.mv;if(!m){p.state='idle';return} // sécurité
 if(p.charging){if(p.prev.melee&&p.charge<m.charge){p.charge++;p.vx*=.8;p.vy*=.8;return}p.charging=false}
 p.t++;const act=m.act||0;
 if(m.spd){p.vx*=.9;p.vy*=.9;if(p.t===m.start)fireHeavy(p,m)}
 else{const fr=m.keep||p.carry||.85;p.vx*=fr;p.vy*=fr;
  if(p.t===m.start&&m.move){p.vx=Math.cos(p.atkA)*m.move;p.vy=Math.sin(p.atkA)*m.move}
  if(m.spawn&&p.t===m.start)for(let i=0;i<10;i++)lb(p,p.atkA+i*TAU/10,4,.8,4,60); // sceau : anneau de balles
  if(m.clear&&p.t===m.start+1){for(const b of B)if(b.owner!==p.id&&!b.heavy&&Math.hypot(b.x-p.x,b.y-p.y)<m.clear)b.dead=1; // onde : efface les petites balles
   WAVES.push({x:p.x,y:p.y,t:14,T:14,spd:9,th:24,inv:1});shake=Math.min(28,shake+8);chroma=Math.max(chroma,8)}
  if(p.t>m.start&&p.t<=m.start+act&&!p.hitDone&&p.t>=p.nextHit)for(const q of P)if(q!==p&&!p.hitDone)melee(p,q,m)}
 if(m.spd&&p.t>m.start&&pr('dash')&&p.focus&&p.boost>=T.DASH_COST){p.boost-=T.DASH_COST;p.dashCd=T.DASH_REGEN_DELAY;glide(p,I);return} // glissade après un tir lourd
 if(p.mHit&&pr('heavy')&&!m.spd&&p.mvName!=='grab'){p.mHit=0;p.state='idle';p.buf={};txt(p.x,p.y-30,'CONFIRM!','#ffb040',13);if(heavyItem(p,o))return;startAtk(p,'heavy'+rel(I,p));return} // hit-confirm
 if(p.mHit&&pr('dash')&&p.boost>=T.DASH_COST&&!m.spd){p.mHit=0;txt(p.x,p.y-30,'HIT CANCEL','#7cf',13);dash(p,I);return} // coup qui touche → annulable en dash
 if(p.t>m.start+act&&pr('dash')&&p.spirit>=T.CANCEL_COST&&p.boost>=T.DASH_COST){
  p.spirit-=T.CANCEL_COST;txt(p.x,p.y-30,'CANCEL','#7cf');dash(p,I);return}
 if(p.t>=m.start+act+Math.round(m.rec*(m.spd?1:.8)))p.state='idle'}

function dash(p,I){if(p.fx.heads>0&&xHeadSwap(p,I))return;let x=I.x,y=I.y;if(Math.hypot(x,y)<.3){x=-Math.cos(p.aim);y=-Math.sin(p.aim)}
 const l=Math.hypot(x,y),v=T.DASH_V*(p.buff==='VITESSE'?1.15:1);

 sfx('roll',.6);Object.assign(p,{state:'dash',t:T.DASH_T,vx:x/l*v,vy:y/l*v,charging:false,slide:0,run:false,kicked:false,noSteer:0,dashCd:T.DASH_REGEN_DELAY});p.boost-=T.DASH_COST}

function melee(p,o,m){
 if(o.state==='dead'||o.inv>0)return;
 const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1;
 if(p.fx.wolf>0)m={...m,range:m.range*1.6,dmg:m.dmg*1.4,arc:Math.max(m.arc,1.8)};if(p.fx.devour>0)m={...m,range:m.range*1.9,dmg:0,kb:(m.kb||5)*2.6+4,stun:(m.stun||12)+12,arc:Math.max(m.arc,2.2)};
 if(d>m.range*(p.giant>0?1.6:1)*(p.fx.laev>0?2.2:1)+bodyR(o))return;
 const da=Math.abs(((Math.atan2(dy,dx)-p.atkA)%TAU+TAU*1.5)%TAU-Math.PI);
 if(da>m.arc/2&&d>T.BODY_R*2)return;
 if(p.mvName==='grab'){if(parryOn(o)||o.state==='parrylag'){p.hitDone=true;xShieldBreak(o,p)}return} // le grab passe à travers ceux qui ne parent pas
 if(o.state==='atk'&&o.mv&&!o.mv.spd&&!m.spd&&o.mvName!=='grab'&&o.t>=o.mv.start-3&&o.t<=o.mv.start+(o.mv.act||4)+2){p.hitDone=o.hitDone=true;const dx=o.x-p.x,dy=o.y-p.y,l=Math.hypot(dx,dy)||1; // clash : les deux coups s'annulent
  for(const[q,s2]of[[p,-1],[o,1]])Object.assign(q,{state:'idle',t:0,vx:dx/l*9*s2,vy:dy/l*9*s2,inv:10,buf:{}});const cx=(p.x+o.x)/2,cy=(p.y+o.y)/2;burst(cx,cy,'#fff',24);WAVES.push({x:cx,y:cy,t:14,T:14,spd:14,th:24,inv:1});for(let i=0;i<10;i++)LINES.push({x:cx,y:cy,a:i*TAU/10,t:12,T:12,len:90});
  shake=Math.min(40,shake+16);invF=Math.max(invF||0,4);sfx('swordclash');txt(cx,cy-30,'CLASH!','#fff',20);return}
 p.hitDone=true;
 if(parryOn(o)){ // parry d'un coup de mêlée : l'attaquant est sans défense
  Object.assign(p,{state:'parrystun',t:T.PARRY_STUN,vx:0,vy:0});o.state='idle';o.inv=12;
  burst(o.x,o.y,'#6ff',14);parryFx(o);log('melee parry P'+(o.id+1));return}
 const mult=(1+p.charge/(m.charge||1)*.7)*(p.buff==='PUISSANCE'?1.4:1)*(p.giant>0?1.5:1)*(p.fx.laev>0?1.4:1);
 sfx('hit'+(1+Math.random()*3|0),.8);sfx(p.mvName==='strong'?'strongslice':p.mvName==='lunge'?'slice':'weakslice',.35);p.mHit=1;HITMEL=1;try{hit(o,p,dx,dy,m,mult,p.mvName!=='jab')}finally{HITMEL=0};if(m.multi){p.hitDone=false;p.nextHit=p.t+m.every}}

var HITMEL=0;function hit(v,a,dx,dy,m,mult,heavy){if(a&&a!==v&&a.id!==undefined){v.lastBy=a.id;v.lastByF=frame}
 if(v.inv>0||v.state==='dead'||v.fx&&v.fx.immortal>0)return;
 if(chHit(v,a,dx,dy,m,mult,heavy))return;
 stopRifle(v);
 if(v.state==='spell'&&a&&!HITMEL){const raw=(m.dmg||0)*(mult||1);if(raw<16&&v.hp>raw*1.6){const dmg=chDmg(v,a,raw,heavy);v.hp-=dmg;v.flash=8;a.spirit=Math.min(T.SPIRIT_MAX,a.spirit+dmg*T.HIT_GAIN);txt(v.x,v.y-40,'-'+Math.round(dmg),'#f8f',14);sfx('hit1',.5);return}} // une spell n'est cassée que par la mêlée ou un très gros coup
 if(v.state==='spell'){endSpell(v,a,false);big('SPELL BREAK','#f8f',56);invF=Math.max(invF,3);chroma=Math.max(chroma,16);log('spell break P'+(v.id+1))}
 if(a.state==='spell')v.spellHit=true;
 a.sins=(a.sins||0)+1;const dmg=chDmg(v,a,m.dmg*mult,heavy);v.hp-=dmg;v.flash=8;v.combo++;a.comboN=v.combo;a.comboT=100;v.charging=false;v.mv=null;
 a.spirit=Math.min(T.SPIRIT_MAX,a.spirit+dmg*T.HIT_GAIN);v.spirit=Math.min(T.SPIRIT_MAX,v.spirit+dmg*T.HURT_GAIN);
 if(m.spd)sfxDmg(v);const kn=Math.hypot(dx,dy)||1;kx+=dx/kn*Math.min(14,dmg);ky+=dy/kn*Math.min(14,dmg); // coup de caméra
 v.burst=Math.min(T.BURST_MAX,v.burst+dmg*T.BURST_HURT);v.power=Math.max(1,v.power-T.POWER_HIT);v.run=false;v.slide=0;zk=Math.min(.3,zk+dmg*.008);
 if(dmg>=7){WAVES.push({x:v.x,y:v.y,t:12,T:12,spd:10,th:18,inv:1});chroma=Math.max(chroma,dmg)}
 if(dmg>=10){bright=Math.max(bright,.6);chroma=Math.max(chroma,14);bgF={c:COLS[a.id],t:12};focusL=Math.max(focusL,.5);zblur=Math.max(zblur,.04)}
 if(dmg>=13){invF=Math.max(invF,3);focusL=Math.max(focusL,1);zblur=Math.max(zblur,.08);flash(.3,COLS[a.id])}
 if(item)item.cp[v.id]=0;
 if(heavy&&inEdge(v)&&v.pips>0){v.pips--;txt(v.x,v.y-46,'WALL '+v.pips+'/'+T.PIPS,'#f66')}
 const n=Math.hypot(dx,dy)||1,s=(.7+.03*NERV)*m.kb*(1+T.KB_SCALE*(1-Math.max(0,v.hp)/T.HP))*(v.giant>0?.5:1);if(s*(mult||1)>20){v.bounceN=3;sfx(s*(mult||1)>34||v.hp<=0?'superheavyhit':'strongslice',s*(mult||1)>34||v.hp<=0?.7:.3)} // superheavyhit : coups vraiment mortels seulement
 Object.assign(v,{kbx:dx/n*s,kby:dy/n*s,diPend:true,vx:0,vy:0,state:'hitstun',t:Math.round(m.stun*Math.pow(T.STUN_DECAY,v.combo-1)*kS())});
 if(v.hp<=0)v.koPend=true;
 hitstop=Math.max(hitstop,T.HITSTOP+Math.round(dmg*.35));shake=Math.min(28,shake+dmg*1.6);
 burst(v.x,v.y,COLS[a.id],8+dmg|0);
 if(dmg>=7)for(let i=0,o=Math.random()*TAU;i<8;i++)LINES.push({x:v.x,y:v.y,a:o+i*TAU/8+Math.random()*.3,t:12,T:12,len:50+dmg*6}); // lignes d'impact
 if(dmg>=14)WAVES.push({x:v.x,y:v.y,t:10,T:10,spd:9,th:14,inv:1});
 if(v.combo>1)txt(v.x,v.y-30,v.combo+' HITS','#fff',14+Math.min(16,v.combo*2));if(v.combo>=3){big(v.combo+' COMBO',COLS[a.id],38+Math.min(34,v.combo*4),'c'+a.id);borderF={c:COLS[a.id],t:18};chroma=Math.max(chroma,8+v.combo*2);bright=Math.max(bright,.2+v.combo*.05)}}

function resolveHit(p){ // fin du hitstop : application de la DI
 if(!p.diPend)return;p.diPend=false;
 let x=p.kbx,y=p.kby;const s=Math.hypot(x,y),il=Math.hypot(p.in.x,p.in.y);
 if(il>.3&&s>0){const a=T.DI_MAX*(x*p.in.y-y*p.in.x)/(s*il),c=Math.cos(a),sn=Math.sin(a);[x,y]=[x*c-y*sn,x*sn+y*c]}
 p.vx=x;p.vy=y;if(p.koPend){p.koPend=false;ko(p,'K.O.')}}

function physics(p){
 if(p.state==='dead')return;
 p.x+=p.vx*kP();p.y+=p.vy*kP();const R=T.BODY_R;
 if(WARP>0){const ox=p.x,oy=p.y; // Warp : on ressort de l'autre côté
  if(p.x<0)p.x+=T.MAP_W;else if(p.x>T.MAP_W)p.x-=T.MAP_W;if(p.y<0)p.y+=T.MAP_H;else if(p.y>T.MAP_H)p.y-=T.MAP_H;
  if(ox!==p.x||oy!==p.y){sfx('wrap_teleportation',.6);burst(ox,oy,'#b45cff',10);burst(p.x,p.y,'#b45cff',10);if(p.id===0||!p.cpu)cams[p.id].x=p.x,cams[p.id].y=p.y}}
 else{if(p.x<R){p.x=R;wall(p,0)}else if(p.x>T.MAP_W-R){p.x=T.MAP_W-R;wall(p,0)}
 if(p.state==='dead')return;
 if(p.y<R){p.y=R;wall(p,1)}else if(p.y>T.MAP_H-R){p.y=T.MAP_H-R;wall(p,1)}}
 if(p.state==='dash')FX.push({x:p.x,y:p.y,vx:0,vy:0,t:12,c:COLS[p.id],r:T.BODY_R}); // images rémanentes
 if(p.state==='hitstun'&&p.vx*p.vx+p.vy*p.vy>49&&frame%2)FX.push({x:p.x,y:p.y,vx:0,vy:0,t:18,c:'#999'})} // traînée d'éjection


function doBurst(p){
 const gold=p.state!=='hitstun'; // burst en neutre (or) : rend du Spirit s'il touche
 Object.assign(p,{burst:0,state:'bursting',t:0,inv:T.BURST_START+6,combo:0,vx:0,vy:0,diPend:false,charging:false,bGold:gold,bHit:false});
 flash(.6,gold?'#fc4':'#4af');chroma=Math.max(chroma,22);focusL=1;zblur=Math.max(zblur,.1);bright=Math.max(bright,.5);shake+=16;hitstop=Math.max(hitstop,6);
 RINGS.push({x:p.x,y:p.y,r:0,m:T.BURST_R,t:22,c:gold?'#fc4':'#4af'});WAVES.push({x:p.x,y:p.y,t:24,T:24,spd:16,th:60,inv:1});big('BURST',gold?'#fc4':'#4af',64);sfx('burst');log('burst P'+(p.id+1)+(gold?' (neutral)':' (combo)'))}
function updBurst(p){
 p.t++;p.vx*=.8;p.vy*=.8;
 if(p.t===T.BURST_START){
  for(const b of B)if(b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<T.BURST_R){b.dead=1;spark(b.x,b.y);if(b.heavy)brk()}
  for(const o of P){if(o===p)continue;const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1;
   if(d<T.BURST_R+T.BODY_R&&o.state!=='dead'&&o.inv<=0){if(o.state==='spell')endSpell(o,p,false);
    Object.assign(o,{vx:dx/d*13,vy:dy/d*13,state:'hitstun',t:32,charging:false,mv:null,run:false,slide:0});
    p.bHit=true;if(p.bGold)p.spirit=Math.min(T.SPIRIT_MAX,p.spirit+T.BURST_GAIN)}}} // raté = longue récupération
 if(p.t>=T.BURST_START+(p.bHit?10:T.BURST_REC))p.state='idle'}

function startSpell(p,o,ult){
 if(!ult)p.spirit-=T.SPELL_COST;p.ultS=!!ult;if(!ult)p.spI=p.spI===undefined?rng()*SPELLS.length|0:(p.spI+1+(rng()*(SPELLS.length-1)|0))%SPELLS.length;p.spL=[];
 if(ult){sfx('spellcardsultimespawn');big('LAST WORD!',RB[(frame>>2)%6],86);bright=Math.max(bright,.8);for(let i=0;i<6;i++)WAVES.push({x:p.x,y:p.y,t:24+i*5,T:24+i*5,spd:18+i*4,th:40,inv:0,c:RB[i]})}
Object.assign(p,{state:'spell',t:0,inv:Math.max(120,T.SPELL_CUTIN+10),vx:0,vy:0,charging:false});for(const q of P)q.spellHit=false;
 for(const b of B)if(b.owner!==p.id&&Math.hypot(b.x-p.x,b.y-p.y)<220){b.dead=1;spark(b.x,b.y);if(b.heavy)brk()}
 sfx('se_cat00');flash(.6,COLS[p.id]);chroma=Math.max(chroma,24);focusL=1;zblur=Math.max(zblur,.12);invF=Math.max(invF,3);shake+=14;WAVES.push({x:p.x,y:p.y,t:36,T:36,spd:30,th:90,inv:0,c:COLS[p.id]},{x:p.x,y:p.y,t:24,T:24,spd:24,th:50,inv:1});log('spell card P'+(p.id+1))}
function updSpell(p,o,I){
 p.t++;if(p.t<=T.SPELL_CUTIN){p.vx*=.8;p.vy*=.8;return}
 p.vx+=(I.x*T.FOCUS_SPEED-p.vx)*.35;p.vy+=(I.y*T.FOCUS_SPEED-p.vy)*.35;
 spD(p).fn(p,o,p.t-T.SPELL_CUTIN-1);
 {const k=p.t-T.SPELL_CUTIN-1;if(k>0&&k%spD(p).loop===0&&frame-sKira>40){sKira=frame;sfx('se_kira00',.7)}} // le motif recommence
 const rem=T.SPELL_CUTIN+spT(p)-p.t;if(rem<=180&&rem%60===0)sfx('timeout',.6);
 if(p.t>=T.SPELL_CUTIN+spT(p))endSpell(p,o,true)}
function endSpell(p,o,timeout){
 p.state='idle';p.ultS=false;if(!timeout)return;let any=0;
 for(const q of P)if(q!==p&&!q.spellHit&&q.state!=='dead'&&q.stocks>0){any=1;q.spirit=Math.min(T.SPIRIT_MAX,q.spirit+T.CAPTURE_GAIN);txt(q.x,q.y-50,'SPELL CAPTURED!','#f8f',20);log('capture P'+(q.id+1))}
 if(any){sfx('se_cardget');big('SPELL CAPTURED','#f8f',50);flash(.3,'#f8f');focusL=1}}
