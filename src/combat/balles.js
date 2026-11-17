'use strict';
// ================= Balles =================
function fireLight(p){
 const S=SHOTS[p.shotT];p.shotCd=Math.round(S.cd*(p.focus?.75:1));
 S.f(p,p.aim,p.focus,pmul(p,0),p.power|0);if(p.clone>0){const c=cloneOf(p);S.f(c,c.aim,p.focus,pmul(p,0)*.7,p.power|0)}}
const pmul=(p,k)=>(p.buff==='PUISSANCE'?1.4:1)*(1+k*((p.power|0)-1)); // bonus de dégâts par niveau de puissance
function spawnH(p,m,a,pm,o={}){const sp=o.spd||m.spd,c=Math.cos(a),n=Math.sin(a),of=o.off||0;
 const b={x:p.x+c*20-n*of,y:p.y+n*20+c*of,vx:c*sp,vy:n*sp,r:o.r||m.r,owner:p.id,heavy:1,m,mult:pm*(o.k||1),dist:0,life:o.life||m.life||200,dead:0,seen:0,home:o.home||0,gr:0};tagB(p,b);if(B.length>=T.MAX_B){const k=B.findIndex(q=>!q.heavy);if(k>=0)B.splice(k,1);else return}B.push(b)} // plafond MAX_B : un tir lourd remplace la plus vieille balle légère
// Tirs lourds selon le type de tir choisi (N neutre, F vers l'adversaire, B en s'éloignant). k = part des dégâts par balle
const HEAVY=[
 {N:(p,m,a,k)=>{for(const o of[-.22,0,.22])spawnH(p,m,a+o,k,{k:.6})},F:(p,m,a,k)=>spawnH(p,m,a,k),B:(p,m,a,k)=>spawnH(p,m,a,k)}, // Éventail
 {N:(p,m,a,k)=>{for(let i=0;i<3;i++)spawnH(p,m,a,k,{spd:m.spd*(1+i*.25),r:7,k:.5})},F:(p,m,a,k)=>spawnH(p,m,a,k,{spd:16,r:6,k:.9}),B:(p,m,a,k)=>{for(const o of[-14,14])spawnH(p,m,a,k,{off:o,k:.6})}}, // Aiguilles
 {N:(p,m,a,k)=>spawnH(p,m,a,k,{spd:5,home:.03}),F:(p,m,a,k)=>{for(const o of[-.9,.9])spawnH(p,m,a+o,k,{spd:8,home:.05,k:.5})},B:(p,m,a,k)=>{for(let i=0;i<6;i++)spawnH(p,m,a+i*TAU/6,k,{spd:2.6,r:12,k:.33,life:300})}}, // Amulettes
 {N:(p,m,a,k)=>{for(const o of[-28,0,28])spawnH(p,m,a,k,{off:o,k:.55})},F:(p,m,a,k)=>{for(let i=0;i<3;i++)spawnH(p,m,a,k,{spd:m.spd*(1-i*.18),k:.55})},B:(p,m,a,k)=>{for(let i=-2;i<=2;i++)spawnH(p,m,a,k,{off:i*26,spd:2.8,r:10,k:.45,life:320})}}]; // Barrage
function fireHeavy(p,m){
 const hk=p.mvName.slice(-1);p.__nofq=1;try{HEAVY[p.shotT][hk](p,m,p.aim,pmul(p,.12))}finally{p.__nofq=0}if(p.fx&&p.fx.four>0&&!p.__ech){const C=xFour(p);C.forEach((c,k)=>FQ.push({f:frame+5+k*5,o:p.id,x:c[0],y:c[1],hk,mn:p.mvName}))}if(p.clone>0){const c=cloneOf(p);HEAVY[p.shotT][p.mvName.slice(-1)](c,m,c.aim,pmul(p,.12)*.7)}shake=Math.min(28,shake+2);chroma=Math.max(chroma,3);const r=T.RECOIL[p.mvName.slice(-1)]||0;p.vx-=Math.cos(p.aim)*r;p.vy-=Math.sin(p.aim)*r; // recul
 sfx('tan0'+(Math.random()*3|0),.7);RINGS.push({x:p.x+Math.cos(p.aim)*20,y:p.y+Math.sin(p.aim)*20,r:0,m:40,t:12,c:'#fff'})}
function crack(x,y){const pl=[]; // fissures de KO
 for(let i=0;i<7;i++){let a=Math.random()*TAU,cx=x,cy=y;const l=[cx,cy];for(let j=0;j<12;j++){a+=(Math.random()-.5)*.8;const d=80+Math.random()*160;cx+=Math.cos(a)*d;cy+=Math.sin(a)*d;l.push(cx,cy)}pl.push(l)}
 CRACK.push({p:pl,t:60})}
function parryFx(p,rk){ // parade : sobre au 1er renvoi, de plus en plus violente jusqu'au 7e (façon Lethal League)
 if(p.buf)p.buf.parry=undefined; // parade réussie : pas de re-parade fantôme depuis le tampon
 p.parN=(p.parN||0)+1;p.pChain=frame-p.pLast<150?p.pChain+1:1;p.pLast=frame;p.boost=Math.min(T.DASH_CHARGES,p.boost+T.DASH_PARRY);p.pStk=Math.min(7,(p.pStk||0)+1);const K=Math.min(7,rk||p.pChain),u=(K-1)/6; // K = renvois de cette balle (ou parades enchaînées)
 sfx('parry4',.8+.2*u,1+.03*(K-1));hitstop=Math.max(hitstop,6+K*2);shake=Math.min(70,shake+4+K*6);zk=Math.min(.6,zk+.05+u*.3);zblur=Math.max(zblur,.02+u*.16);chroma=Math.max(chroma,6+K*9);bright=Math.max(bright,.2+u*.7);focusL=Math.max(focusL,.3+u*2.2);
 flash(.12+u*.5,K===7?'#fff':'#6ff');if(K>=4)invF=Math.max(invF,K);
 WAVES.push({x:p.x,y:p.y,t:14+K*5,T:14+K*5,spd:10+K*7,th:22+K*16,inv:1});RINGS.push({x:p.x,y:p.y,r:0,m:80+K*30,t:20,c:'#6ff'});for(let i=0;i<6+K*4;i++)LINES.push({x:p.x,y:p.y,a:i*TAU/(6+K*4),t:14+K*2,T:14+K*2,len:60+K*45});
 if(K>=5)crack(p.x,p.y);txt(p.x,p.y-56,'BASE ATK x'+Math.pow(1.3,K).toFixed(1)+(K===7?' MAX':''),'#6ff',14+K*2);
 big(K===7?'MAX POWER!!!':K>1?'PARRY x'+K:'PARRY!',K===7?'#fff':'#6ff',34+K*8,'p');if(K===7){slow=Math.max(slow,36);sfx('se_enep00',.8)}else if(K>=4)slow=Math.max(slow,K*4)}
function graze(t,b,k){
 t.graze++;spark(b.x,b.y);if(k>1)burst(b.x,b.y,'#fff',4);
 t.spirit=Math.min(T.SPIRIT_MAX,t.spirit+T.GRAZE_GAIN*k);t.boost=Math.min(T.DASH_CHARGES,t.boost+T.DASH_GRAZE*k);
 if(frame-sGraze>2){sGraze=frame;sfx('graze',.7,k>1?.85:1)}if(GZ.length<60)GZ.push({p:t,a:Math.atan2(b.y-t.y,b.x-t.x),t:k>1?12:8});
 t.gStreak=frame-t.gLast<30?t.gStreak+1:1;t.gLast=frame;if(t.gStreak%20===0){txt(t.x,t.y-46,'GRAZE x'+t.gStreak,LCOLS[t.id],13);chroma=Math.max(chroma,6)}
 const lv=t.power|0;t.power=Math.min(T.POWER_MAX,t.power+T.POWER_GRAZE*k);
 if((t.power|0)>lv){big('POWER UP',LCOLS[t.id],44);RINGS.push({x:t.x,y:t.y,r:0,m:90,t:24,c:LCOLS[t.id]});WAVES.push({x:t.x,y:t.y,t:16,T:16,spd:12,th:26,inv:1});
  flash(.25,LCOLS[t.id]);chroma=Math.max(chroma,10);sfx('se_powerup');log('power '+(t.power|0)+' P'+(t.id+1))}}
function reflect(b,t){;
b.mult=(b.mult||1)*1.3;if(b.dmg)b.dmg*=1.3;// chaque parade : dégâts et recul x1.3 (cumulatif)
 const o=P[b.owner],s=Math.min(44,Math.hypot(b.vx,b.vy)*1.3),a=Math.atan2(o.y-b.y,o.x-b.x);
 Object.assign(b,{owner:t.id,vx:Math.cos(a)*s,vy:Math.sin(a)*s,dist:b.m.arm,life:200,seen:0,gr:0,home:Math.max(b.home||0,.03),refl:(b.refl||0)+1,oneshot:b.rifle?1:b.oneshot}); // fusil renvoyé = tue son tireur // x1,3 à chaque renvoi + guidage léger
 t.state='idle';t.inv=10;parryFx(t,b.refl);if(b.refl>=7){b.np=1;b.c='#fff';big('MAX POWER! (CAN\'T BE PARRIED)','#fff',50)}burst(b.x,b.y,'#6ff',12);log('parry reflect P'+(t.id+1))}
function updBullets(){
 for(const b of B){
  if(b.dead||b.fz||lunFz(b.owner))continue; // balle gelée (Perfect Freeze)
  if(b.home){const q=P[b.owner].tgt||P[(b.owner+1)%P.length];if(q.state!=='dead'){const s=Math.hypot(b.vx,b.vy),a=Math.atan2(b.vy,b.vx); // tir téléguidé
   const da=((Math.atan2(q.y-b.y,q.x-b.x)-a)%TAU+TAU*1.5)%TAU-Math.PI,na=a+clamp(da,-b.home,b.home);b.vx=Math.cos(na)*s;b.vy=Math.sin(na)*s}}
  {const k=kB();b.x+=b.vx*k;b.y+=b.vy*k;if(b.heavy)b.dist+=Math.hypot(b.vx,b.vy)*k}
  if(b.split&&--b.split===0){const a=Math.atan2(b.vy,b.vx),v=Math.hypot(b.vx,b.vy);b.vx=Math.cos(a-.3)*v;b.vy=Math.sin(a-.3)*v;if(B.length<T.MAX_B)B.push({...b,vx:Math.cos(a+.3)*v,vy:Math.sin(a+.3)*v,split:0})} // Ran
  if(b.refl&&FX.length<500)FX.push({x:b.x,y:b.y,vx:0,vy:0,t:8+b.refl*3,c:'#6ff',r:b.r*(1+b.refl*.3)});
  if((b.life-=kB())<=0||b.x<-20||b.y<-20||b.x>T.MAP_W+20||b.y>T.MAP_H+20){b.dead=1;continue}
  const fast=b.vx*b.vx+b.vy*b.vy>144; // balle rapide : collision sur le trajet de la frame (pas de traversée)
  for(const t of P){if(TEAMS&&ally(P[b.owner],t)||t.id===b.owner&&!(CX.owner&&t.id!==CX.owner.o&&(b.age=(b.age||0)+1)>40)||t.state==='dead'||b.dead||b.fake||t.state==='eaten')continue; // Chimata : sa propre balle peut blesser
  {const ax=t.x-b.x,ay=t.y-b.y,mg=82+(fast?Math.abs(b.vx)+Math.abs(b.vy):0);if(ax>mg||ax<-mg||ay>mg||ay<-mg)continue} // rejet rapide sans racine carrée
  const d=fast?segD(t.x,t.y,b.x-b.vx,b.y-b.vy,b.x,b.y):Math.hypot(t.x-b.x,t.y-b.y);if(d>80)continue;
  if(b.heavy){
   if(b.breaker){if(parryOn(t)&&d<b.r+T.PARRY_R){b.dead=1;xShieldBreak(t,P[b.owner])}continue} // breaker : n'affecte que celui qui pare
   if(t.mirror>0&&d<bodyR(t)+b.r&&!b.pure){mirrorRef(b,t);continue}
   if(parryOn(t)&&d<b.r+T.PARRY_R&&!b.pure&&!b.np){reflect(b,t);continue} // MAX POWER : imparable
   if(b.dist>=b.m.arm&&t.inv<=0&&d<b.r*.82+coreR(t)){if(chBullet(b,t))continue;b.dead=1;if(b.oneshot){t.hp=0;big('ONE SHOT!','#fff',84)}if(b.refl>=7){t.hp=0;t.fx.phoenix=0;big('MAX POWER K.O.!','#fff',90);flash(.8,'#fff');shake=80;invF=14;chroma=80;sfx('superheavyhit');for(let i=0;i<4;i++)WAVES.push({x:t.x,y:t.y,t:20+i*8,T:20+i*8,spd:20+i*8,th:60,inv:i%2});crack(t.x,t.y);t.kbx=b.vx;t.kby=b.vy;ko(t,'MAX POWER K.O.!')} // K.O. instantané
    else hit(t,P[b.owner],b.vx,b.vy,b.refl?{...b.m,kb:b.m.kb*(1+.35*b.refl),stun:b.m.stun*(1+.1*b.refl)}:b.m,b.mult,true)}
   else if(!b.gr&&b.dist>=b.m.arm&&d<b.r+T.GRAZE_R){b.gr=1;graze(t,b,2)} // graze d'une grosse balle : double gain
  }else{
   if(t.mirror>0&&d<bodyR(t)+b.r){mirrorRef(b,t);continue}
   if(parryOn(t)&&d<T.PARRY_R&&!b.pure&&!b.np){b.dead=1;continue}
   if(!b.gr&&d<b.r+T.GRAZE_R){b.gr=1;graze(t,b,1)}
   if(t.state!=='dash'&&t.inv<=0&&d<b.r*.68+coreR(t)){if(chBullet(b,t))continue;b.dead=1;t.hp-=chDmg(t,P[b.owner],b.dmg,false);t.flash=3;sfxDmg(t);{const a=P[b.owner];a.spirit=Math.min(T.SPIRIT_MAX,a.spirit+T.SHOT_GAIN)};shake=Math.min(28,shake+1.5);t.burst=Math.min(T.BURST_MAX,t.burst+b.dmg*T.BURST_HURT);if(b.refl){const sp=Math.hypot(b.vx,b.vy)||1,k=2.2*(b.mult||1);t.vx+=b.vx/sp*k;t.vy+=b.vy/sp*k} // balle parée : recul x1.3 par parade
    if(P[b.owner].state==='spell')t.spellHit=true;if(t.hp<=0)ko(t,'K.O.')}}}
  if(FAIRIES.length&&!b.dead)hitFairy(b)}
 const Hv=B.filter(b=>b.heavy&&!b.dead&&!b.fake&&!b.breaker); // clash + lourdes effacent les légères adverses
 for(let i=0;i<Hv.length;i++){const h=Hv[i];if(h.dead)continue;
  for(let j=i+1;j<Hv.length;j++){const k=Hv[j];if(k.dead||k.owner===h.owner)continue;
   if(Math.hypot(h.x-k.x,h.y-k.y)<h.r+k.r){if(h.pierce||k.pierce){(h.pierce?k:h).dead=1;brk();if(h.dead)break;continue} // le fusil transperce
    if(h.el&&k.el&&h.el!==k.el)xReact(h.el,k.el,(h.x+k.x)/2,(h.y+k.y)/2,h.owner,null);if(h.refl&&!k.refl)k.dead=1;else if(k.refl&&!h.refl)h.dead=1;else h.dead=k.dead=1;brk(); chroma=Math.max(chroma,10);shake=Math.min(28,shake+6);WAVES.push({x:(h.x+k.x)/2,y:(h.y+k.y)/2,t:10,T:10,spd:8,th:12,inv:1});burst((h.x+k.x)/2,(h.y+k.y)/2,'#fff',12);break}}
  if(h.dead)continue;const rr=h.r+4;
  for(const b of B)if(!b.heavy&&!b.dead&&b.owner!==h.owner&&Math.abs(b.x-h.x)<rr&&Math.abs(b.y-h.y)<rr){b.dead=1;{const w=P[h.owner];if(w){w.cc=(w.cc||0)+1;w.ccT=(w.ccT||0)+1;w.ccF=frame;w.spirit=Math.min(T.SPIRIT_MAX,w.spirit+.3)}}if(b.el&&h.el&&b.el!==h.el&&!h.rxE){h.rxE=1;xReact(h.el,b.el,b.x,b.y,h.owner,null)}}}
 let w=0;for(const b of B)if(!b.dead)B[w++]=b;B.length=w}
