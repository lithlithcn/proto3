'use strict';
// ================= Rendu =================
function render(){musTick();if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();if(mode!=='game')GLR.flush()}
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(mode!=='game')setFilter('');
 if(mode==='items'||mode==='binds'||mode==='info'){UIC.acc=mode==='items'?'#ff4fd8':mode==='binds'?'#7fa8ff':'#ff9a3a';uiBG(mode==='items'?'ITEMS  ':mode==='binds'?'CONTROLS  ':'GUIDE  ')}else if(mode==='maker'){UIC.acc='#9b6bff';uiBG('')}
 if(mode==='menu')return drawMenu();
 if(mode==='binds')return drawBinds();
 if(mode==='items')return drawItemsMenu();
 if(mode==='info')return drawInfo();
 if(mode==='sub')return drawSub();
 if(mode==='maker')return drawMaker();
 hot=[];const hum=P.filter(p=>!p.cpu&&(!NET||p.id===NET.L)),views=fixedMap||hum.length<2||hum.length>4?[{x:0,y:0,w:W,h:H,i:hum.length?hum[0].id:0,fixed:fixedMap}] // 1 vue, 2 côte à côte, ou 4 quarts
  :hum.length===2?hum.map((p,k)=>({x:k?W/2+2:0,y:0,w:W/2-2,h:H,i:p.id})):hum.map((p,k)=>({x:k%2?W/2+2:0,y:k>1?H/2+2:0,w:W/2-2,h:H/2-2,i:p.id,q:1}));
 const H0=H;for(const v of views){ctx.save();ctx.translate(0,v.y);if(CX.flipA){const cx=v.x+v.w/2,cy=v.h/2;ctx.translate(cx,cy);ctx.rotate(CX.flipA);ctx.scale(1+.15*Math.sin(CX.flipA),1+.15*Math.sin(CX.flipA));ctx.translate(-cx,-cy)}H=v.h;SCv=v.h/T.VIEW_H*(v.q?1.2:1)*(1+zk*(fxLow?.2:1))*(typeof LSZoom==='function'?LSZoom():1);drawView(v);ctx.restore();H=H0}
 if(views.length>1){ctx.fillStyle='#555';ctx.fillRect(W/2-2,0,4,H);if(views.length>2)ctx.fillRect(0,H/2-2,W,4)}
 if(GLR&&OC){ctx=OC;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1} // tout le texte/HUD au-dessus des balles WebGL
 if(borderF.t>0){ctx.strokeStyle=borderF.c;ctx.globalAlpha=borderF.t/18*(fxLow?.2:1);ctx.lineWidth=34;ctx.strokeRect(0,0,W,H);ctx.globalAlpha=1}
 if(focusL>.05)focusLines(focusL*(fxLow?.2:1));
 drawBanners();
 if(flashS>.02){ctx.fillStyle=flashCol;ctx.globalAlpha=Math.min(1,flashS)*(fxLow?.15:1);
 if(bright>.03&&!fxLow){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=bright*.18;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}ctx.globalAlpha=Math.min(.32,flashS*.45)*(fxLow?.15:1);ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
 {const sv=ctx;ctx=CTX0; // les post-effets restent sur le décor
 if(zblur>.03&&!fxLow&&!perfLow){ctx.globalAlpha=.4;ctx.drawImage(cv,-W*zblur/2,-H*zblur/2,W*(1+zblur),H*(1+zblur));ctx.globalAlpha=1} // flou de zoom
 if(chroma>8&&!fxLow&&!perfLow){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.4;ctx.drawImage(cv,chroma*kV(),chroma*.2*kV());ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1} // dédoublement d'impact
 ctx=sv}
 screenFilter();
 for(const q of P)if(q.state==='spell')drawSpellUI(q);
 chScreen();drawTest();
 {const hk=(TCH.on?Math.min(.8,H/720):Math.min(1,W/1280+.1))*ACC.ui;ctx.save();ctx.globalAlpha=.85;ctx.scale(hk,hk);if(P.length>8||P.length>4&&(TCH&&TCH.on||W<900||H<520)){}else if(P.length>4){const k8=Math.min(hk,W/(4*282));ctx.scale(k8/hk,k8/hk);P.forEach((p,i)=>drawHUD(p,(12+(i%4)*W/4)/k8,false,(i<4?30:H-100)/k8))}else P.forEach((p,i)=>drawHUD(p,(i%2?W-12:12)/hk,i%2===1,(i<2?30:H-100)/hk));ctx.restore()} // HUD des bords (en plus de celui sous les joueurs)
 drawTimer();drawActs();drawTut();
 drawTrain();
 ctx.textAlign='center';ctx.font='13px monospace';ctx.fillStyle='#f8f';
 if(!TEST&&!(TUT&&!TUT.cards))ctx.fillText((item?ITEMS.find(i=>i.k===item.type).name.toUpperCase()+(item.on?' — grab it!':'…'):'Card in '+Math.ceil((IE()-T.ITEM_WARN-itemT)/60)+'s')+(WARP>0?'  ·  WARP '+Math.ceil(WARP/60)+'s':'')+(FAIRIES.length?'  ·  fairies '+FAIRIES.length:''),W/2,18);
 if(debug){ctx.textAlign='left';ctx.fillStyle='#0f0';ctx.font='12px monospace';
  ctx.fillText(`fps ${fps} | balles ${B.length} | frame ${frame} | hitstop ${hitstop} | fx ${FX.length}`,12,H-12-LOG.length*14);
  LOG.forEach((l,i)=>ctx.fillText(l,12,H-12-(LOG.length-1-i)*14));
  P.forEach((p,i)=>ctx.fillText(`P${i+1} actions: ${BTN.filter(k=>p.in.b[k]).join(' ')||'—'}  ·  burst ${p.burst|0}% spirit ${p.spirit|0}%`,12,140+i*14));drawPadTest(176)}
 if(paused&&!(TEST&&TEST.train))drawPause();
 if(winner>=0){
  if(winT<100)drawGameEnd()
  else drawResults()}
 tDraw();if(GLR){GLR.flush();ctx=CTX0}}

function setFilter(f){if(f!==cssF&&cv.style){cssF=f;cv.style.filter=f;const g=document.getElementById('g');if(g&&g.style)g.style.filter=f}}
var CVINV=0;function screenFilter(){const ci=CVINV>0;if(CVINV>0)CVINV--;const bf=slow>0&&!fxLow&&!perfLow?'saturate(2.2) contrast(1.3)':'';setFilter(ci?(bf+' invert(1)').trim():bf);const g=document.getElementById('g'),w=ci?cssF:mode==='game'&&TSTOP>0&&!fxOff?((cssF?cssF+' ':'')+'invert(1)'):(cssF||'');if(g&&g.style&&g.style.filter!==w)g.style.filter=w} // filtre plein écran seulement pendant le ralenti (la luminosité passe par un calque, moins coûteux)
function focusLines(a){ // lignes de vitesse (manga) depuis les bords
 const cx=W/2,cy=H/2,R=Math.hypot(W,H)/2;ctx.strokeStyle='#fff';ctx.globalAlpha=Math.min(1,a)*.9;ctx.lineWidth=2+a*2;ctx.beginPath();
 for(let i=0;i<70;i++){const t=Math.random()*TAU,r0=R*(.4+Math.random()*.35);ctx.moveTo(cx+Math.cos(t)*R,cy+Math.sin(t)*R);ctx.lineTo(cx+Math.cos(t)*r0,cy+Math.sin(t)*r0)}
 ctx.stroke();ctx.globalAlpha=1}
function drawSpellUI(p){ // déclaration de spell card façon Touhou
 const k=p.t,left=p.id%2===0,half=P.filter(q=>!q.cpu&&(!NET||q.id===NET.L)).length>1?W/2:W,X0=left?0:W-half,c=p.ultS?rainbowCol():COLS[p.id],name=spD(p).name;
 if(k<T.SPELL_CUTIN+25){
  const e=Math.min(1,k/14),out=k>T.SPELL_CUTIN?1-(k-T.SPELL_CUTIN)/25:1,ph=H*.8,pw=ph*.45;
  const x=left?-pw+e*pw*1.6+k*.6:W-e*pw*1.6-k*.6;
  ctx.save();ctx.globalAlpha=.25*out;ctx.fillStyle=c;ctx.translate(W/2,H*.55);ctx.rotate(left?-.18:.18);ctx.fillRect(-W,-50,W*2,100);ctx.restore();
  ctx.save();ctx.globalAlpha=.85*out;ctx.translate(x,H*.15);drawPortrait(p.id%2,pw,ph,c);ctx.restore()}
 const rem=Math.max(0,(T.SPELL_CUTIN+spT(p)-k)/60);
 ctx.font='bold 18px serif';
 const tw=ctx.measureText(name).width+40,bx=left?X0+12:X0+half-12-tw,by=k<20?H*.6-(H*.6-118)*k/20:118;
 ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(bx,by-22,tw,32);
 ctx.fillStyle=c;ctx.fillRect(bx,by+8,tw*rem/(spT(p)/60),3);
 ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(name,bx+20,by);
 ctx.font='12px monospace';ctx.textAlign=left?'left':'right';ctx.fillText('SPELL CARD · '+rem.toFixed(1)+'s',left?bx:bx+tw,by+24)}
function drawPortrait(id,w,h,c){ // portrait temporaire (silhouette) : à remplacer par le vrai art
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(w*.15,h);ctx.lineTo(w*.3,h*.42);ctx.lineTo(w*.7,h*.42);ctx.lineTo(w*.88,h);ctx.fill();
 ctx.fillStyle=c;ctx.beginPath();ctx.arc(w*.5,h*.3,w*.17,0,TAU);ctx.fill();
 ctx.beginPath();
 if(id===0){ctx.moveTo(w*.5,h*.16);ctx.lineTo(w*.22,h*.05);ctx.lineTo(w*.28,h*.24);ctx.closePath();ctx.moveTo(w*.5,h*.16);ctx.lineTo(w*.78,h*.05);ctx.lineTo(w*.72,h*.24);ctx.closePath()} // nœud
 else{ctx.moveTo(w*.18,h*.2);ctx.lineTo(w*.82,h*.2);ctx.lineTo(w*.6,0);ctx.closePath()} // chapeau
 ctx.fill()}

function drawView(v){
 const sw=CX.swap,vi=sw&&sw.a===v.i?sw.b:sw&&sw.b===v.i?sw.a:v.i,p=P[vi]||P[v.i],o=p.tgt||P[(v.i+1)%P.length],cam=cams[v.i],vw=v.w/SCv,vh=H/SCv;
 if(v.fixed){cam.x=T.MAP_W/2;cam.y=T.MAP_H/2}
 else{if(p.state!=='dead'){let ox=(o.x-p.x)*.3,oy=(o.y-p.y)*.3;const l=Math.hypot(ox,oy);if(l>220){ox*=220/l;oy*=220/l}
  cam.x+=(p.x+ox-cam.x)*.12;cam.y+=(p.y+oy-cam.y)*.12}
  cam.x=vw>=T.MAP_W?T.MAP_W/2:clamp(cam.x,vw/2,T.MAP_W-vw/2);cam.y=vh>=T.MAP_H?T.MAP_H/2:clamp(cam.y,vh/2,T.MAP_H-vh/2)}
 const fr=(fxLow?.2:1)*kV(),sx=((shake?shN(frame*.9,1.3)*shake*.55:0)+kx)*fr,sy=((shake?shN(frame*.9+77,2.1)*shake*.55:0)+ky)*fr;
 ctx.save();ctx.beginPath();ctx.rect(v.x,0,v.w,H);ctx.clip();
 ctx.translate(v.x+v.w/2+sx,H/2+sy);ctx.scale(SCv,SCv);ctx.translate(-cam.x,-cam.y);MVIEW[v.i]={ox:v.x+v.w/2,oy:v.y+H/2,sc:SCv,cx:cam.x,cy:cam.y};if(GLR)GLR.view(ctx.getTransform(),v.x,v.y,v.w,v.h||H);
 const L=cam.x-vw/2,Tp=cam.y-vh/2,R=L+vw,Bt=Tp+vh;
 ctx.fillStyle='#14161f';ctx.fillRect(0,0,T.MAP_W,T.MAP_H);
 if(bgF.t>0){ctx.globalAlpha=bgF.t/12*(fxLow?.08:.28);ctx.fillStyle=bgF.c;ctx.fillRect(0,0,T.MAP_W,T.MAP_H);ctx.globalAlpha=1} // le sol réagit aux gros coups
 ctx.strokeStyle='#1f2333';ctx.lineWidth=1;ctx.beginPath();
 for(let x=Math.max(0,Math.ceil(L/100)*100);x<=Math.min(T.MAP_W,R);x+=100){ctx.moveTo(x,Math.max(0,Tp));ctx.lineTo(x,Math.min(T.MAP_H,Bt))}
 for(let y=Math.max(0,Math.ceil(Tp/100)*100);y<=Math.min(T.MAP_H,Bt);y+=100){ctx.moveTo(Math.max(0,L),y);ctx.lineTo(Math.min(T.MAP_W,R),y)}
 ctx.stroke();if(YTBG>0){ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=YTBG;ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.restore()} // vidéo YouTube derrière le sol
 const E=T.EDGE;ctx.fillStyle=WARP>0?'rgba(180,90,255,'+(.12+.06*Math.sin(frame*.2))+')':'rgba(255,35,50,'+(.13+.03*Math.sin(frame*.06))+')';
 ctx.fillRect(0,0,T.MAP_W,E);ctx.fillRect(0,T.MAP_H-E,T.MAP_W,E);ctx.fillRect(0,E,E,T.MAP_H-2*E);ctx.fillRect(T.MAP_W-E,E,E,T.MAP_H-2*E);
 if(WARP<=0){ctx.save();ctx.strokeStyle='#ff2a3c';ctx.globalAlpha=.12+.05*Math.sin(frame*.06);ctx.lineWidth=14;ctx.strokeRect(E,E,T.MAP_W-2*E,T.MAP_H-2*E);ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.setLineDash([22,14]);ctx.lineDashOffset=-frame*.6;ctx.strokeRect(E,E,T.MAP_W-2*E,T.MAP_H-2*E);ctx.restore()}ctx.strokeStyle=WARP>0?'#b5f':'#ff2a3c';ctx.lineWidth=5;ctx.strokeRect(0,0,T.MAP_W,T.MAP_H);for(const f of BGH)f(L,Tp,R,Bt);
 for(const q of P)if(q.state==='spell'&&q.state!=='dead')spellCircle(q);for(const q of P.filter(q=>q.state==='spell').slice(-1)){ctx.fillStyle=q.id?'rgba(255,210,60,.025)':'rgba(255,70,90,.025)';ctx.fillRect(0,0,T.MAP_W,T.MAP_H); // fond de spell : rayons tournants (discrets)
  ctx.save();ctx.translate(q.x,q.y);ctx.rotate(frame*.01*(q.id?-1:1));ctx.fillStyle=COLS[q.id];ctx.globalAlpha=fxLow?.02:.04;ctx.beginPath();
  for(let i=0;i<12;i++){const a=i*TAU/12;ctx.moveTo(0,0);ctx.arc(0,0,1600,a,a+TAU/24)}ctx.fill();ctx.restore();ctx.globalAlpha=1}
 {for(const c of CARDS){item=c;drawItem()}item=CARDS[0]||null}
 const inV=b=>b.x>L-30&&b.x<R+30&&b.y>Tp-30&&b.y<Bt+30;
 {const vp=P[VIEW];LPV=vp&&!vp.cpu?vp:null;for(LPASS=1;LPASS>=0;LPASS--){LPA=(LPASS?.45:1)*.8;ctx.globalAlpha=LPA; // balles alliées estompées
 if(GLR){for(const b of B)if(!b.heavy&&inV(b)&&LPF(b)){if(b.sh){const S=glShape(b);GLR.push(S,b.x,b.y,1,shRot(b),LPA)}else GLR.push(glBul(b.c||LCOLS[b.owner],b.r,b.owner),b.x,b.y,1,0,LPA)}}
 else for(const b of B)if(!b.heavy&&!b.sh&&inV(b)&&LPF(b)){const S=bSpr(b.c||LCOLS[b.owner],b.r,b.owner);ctx.drawImage(S,b.x-S.o,b.y-S.o)} // même rendu qu'avant, mis en cache
 if(!GLR)for(const b of B)if(b.sh&&!b.heavy&&inV(b)&&LPF(b))shB(b);
 }ctx.globalAlpha=1;if(!GLR)drawDanger()}
 for(const b of B)if(b.heavy&&inV(b))drawHeavy(b);
 drawMapObj(L,Tp,R,Bt);VIEW=p.id;for(const q of P)drawP(q);mapFG(L,Tp,R,Bt);
 drawWorldItems();drawViewFx(p,L,Tp,vw,vh);
 if(GLR){for(const f of FX){if(f.x<L-30||f.x>R+30||f.y<Tp-30||f.y>Bt+30)continue;const a=Math.min(1,f.t/15);if(f.r)GLR.push(glRing(f.c),f.x,f.y,f.r/16,0,a);else GLR.push(glDot(f.c),f.x,f.y,.6+a*.5,0,a)}}
 else for(const f of FX){if(f.x<L-30||f.x>R+30||f.y<Tp-30||f.y>Bt+30)continue;ctx.globalAlpha=Math.min(1,f.t/15);if(f.r){ctx.strokeStyle=f.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.stroke()}else{const z=1.4+ctx.globalAlpha*1.6;ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y,z,0,TAU);ctx.fill();if(!fxLow&&!perfLow){ctx.globalAlpha*=.25;ctx.beginPath();ctx.arc(f.x,f.y,z*2.4,0,TAU);ctx.fill()}}}
 ctx.strokeStyle='#fff';ctx.lineWidth=2;for(const g of GZ){ctx.globalAlpha=g.t/10;ctx.beginPath();ctx.arc(g.p.x,g.p.y,T.GRAZE_R+10-g.t,g.a-.35,g.a+.35);ctx.stroke()} // arc de graze
 ctx.save();ctx.globalCompositeOperation='lighter';for(const r of RINGS){const u=Math.min(1,r.t/30);ctx.strokeStyle=r.c;ctx.globalAlpha=u*.22;ctx.lineWidth=14*u+2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,TAU);ctx.stroke();ctx.globalAlpha=u;ctx.lineWidth=4*u+1;ctx.stroke();ctx.globalAlpha=u*.6;ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke()}ctx.restore()
 const ray=(x,y,a,w,L)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a-w)*L,y+Math.sin(a-w)*L);ctx.lineTo(x+Math.cos(a+w)*L,y+Math.sin(a+w)*L);ctx.fill()};
 for(const k of KOFX){const f=k.t/70,w=90*Math.min(1,(70-k.t)/4)*(f<.45?Math.pow(f/.45,.7):1); // rayon de KO
  koBeam(k,w,k.len!==undefined?k.len:3400,f)}
 ctx.textAlign='center';for(const t of TX){ctx.globalAlpha=Math.min(1,t.t/20);ctx.font='bold '+t.z+'px monospace';ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y)}
 ctx.globalAlpha=1;
 ctx.strokeStyle='#fff';ctx.lineCap='round';for(const l of LINES){const f=l.t/l.T,r0=12+(1-f)*30,c=Math.cos(l.a),s=Math.sin(l.a); // lignes d'impact
  const ga=ctx.globalAlpha;ctx.beginPath();ctx.moveTo(l.x+c*r0,l.y+s*r0);ctx.lineTo(l.x+c*(r0+l.len*f),l.y+s*(r0+l.len*f));ctx.globalAlpha=ga*.25;ctx.lineWidth=13*f+1;ctx.stroke();ctx.globalAlpha=ga;ctx.lineWidth=5*f+.5;ctx.stroke()}
 for(const c of CRACK)if(c.s)drawCrack(c);ctx.globalAlpha=1;
 for(const w of WAVES){const f=w.t/w.T,r=(w.T-w.t)*w.spd,th=w.th*f+3; // ondes (inversion des couleurs si inv)
  ctx.beginPath();ctx.arc(w.x,w.y,r+th,0,TAU);ctx.arc(w.x,w.y,r,0,TAU,true);
  if(w.inv&&!fxLow){if(YTBG>0){ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#14161f';ctx.fill()}ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fill();ctx.globalCompositeOperation='source-over'}
  else{ctx.globalAlpha=f*(fxLow?.2:.6);ctx.fillStyle=w.c||'#fff';ctx.fill();ctx.globalAlpha=1}}
 if(invF>0&&!fxLow){if(YTBG>0)CVINV=2;else{ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.globalCompositeOperation='source-over'}}
 if(TSTOP>0&&!fxOff){if(YTBG>0)CVINV=2;else{ctx.globalCompositeOperation='difference';ctx.fillStyle='#fff';ctx.fillRect(L-60,Tp-60,vw+120,vh+120);ctx.globalCompositeOperation='source-over';drawP(P[TSO])}} // The World : monde gris
 if(GLR&&OC)ovl(v,()=>{drawTags(L,R);drawDanger()});else drawTags(L,R);if(debug)drawDebugWorld();
 ctx.restore();
 for(const q of v.fixed?P:[p])if(q.state!=='dead'&&q.hp<T.HP*.3){ // vignette rouge quand la vie est basse
  const a=(.16+.08*Math.sin(frame*.2))*(1-q.hp/(T.HP*.3)),g=ctx.createRadialGradient(v.x+v.w/2,H/2,Math.min(v.w,H)*.35,v.x+v.w/2,H/2,Math.max(v.w,H)*.7);
  g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,0,0,${a})`);ctx.fillStyle=g;ctx.fillRect(v.x,0,v.w,H)}
 if(!v.fixed)drawIndicators(v,p,o,cam)}

function drawHeavy(b){
 if(b.gung){const l=Math.hypot(b.vx,b.vy)||1;ctx.lineCap='round';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(b.x-b.vx/l*56,b.y-b.vy/l*56);ctx.lineTo(b.x+b.vx/l*14,b.y+b.vy/l*14);ctx.stroke();ctx.strokeStyle='#e0302f';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(b.x-b.vx/l*56,b.y-b.vy/l*56);ctx.lineTo(b.x+b.vx/l*14,b.y+b.vy/l*14);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();return}
 if(b.rifle){ctx.lineCap='round';ctx.strokeStyle=COLS[b.owner]||'#fff';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(b.x-b.vx*2,b.y-b.vy*2);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle=b.oneshot?'#f44':'#fff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(b.x-b.vx*2,b.y-b.vy*2);ctx.lineTo(b.x,b.y);ctx.stroke();return}
 const armed=b.dist>=b.m.arm,r=b.r*(armed?1:.35+.65*b.dist/b.m.arm),c=b.c||COLS[b.owner];
 ctx.beginPath();ctx.arc(b.x,b.y,r,0,TAU);
 if(armed){ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=b.refl?'#6ff':'#fff';ctx.lineWidth=2+(b.refl||0)*2;ctx.stroke();if(COLS[b.owner]){ctx.strokeStyle=COLS[b.owner];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(b.x,b.y,r+3,0,TAU);ctx.stroke()}
  ctx.globalAlpha=.1;ctx.beginPath();ctx.arc(b.x,b.y,r*1.45,0,TAU);ctx.fill();ctx.globalAlpha=1}
 else{ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke()}}

function drawP(q){
 if(q.state==='dead'||q.state==='eaten')return;const jt=hitstop>0?Math.min(3,hitstop*.25):0; // tremblement pendant le gel
 if(jt){ctx.save();ctx.translate((Math.random()-.5)*jt*2,(Math.random()-.5)*jt*2)}const c=CX.anon>0?'#9aa':COLS[q.id],R=bodyR(q),ro=reisOff(q);if(ro){ctx.save();ctx.translate(ro[0],ro[1])} // Rin : anonymes / Reisen : décalés
 if(q.inv>0&&(frame>>2)%2)ctx.globalAlpha=.45;if(q.fx.koishi>0)ctx.globalAlpha=.06;if(q.fx.under>0)ctx.globalAlpha=0;
 ctx.fillStyle=q.flash>0?'#fff':q.state==='parrystun'||q.state==='broken'?'#555':'#222';ctx.strokeStyle=c;ctx.lineWidth=3;
 ctx.beginPath();ctx.arc(q.x,q.y,R,0,TAU);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(q.x+Math.cos(q.aim)*R,q.y+Math.sin(q.aim)*R);ctx.lineTo(q.x+Math.cos(q.aim)*(R+10),q.y+Math.sin(q.aim)*(R+10));ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y,coreR(q)+(q.focus?1.5:0),0,TAU);ctx.fill();
 if(q.focus){ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(q.x,q.y,T.GRAZE_R,0,TAU);ctx.stroke()}
 if(q.slide>0){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*4,q.y-q.vy*4);ctx.stroke()}
 if(q.state==='spell'){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(q.x,q.y,40+6*Math.sin(frame*.2),0,TAU);ctx.stroke();ctx.globalAlpha=1}
 if(q.state==='parry'||q.state==='parrylag'){const on=q.state==='parry';ctx.strokeStyle=on?'#6ff':'#355';ctx.lineWidth=on?4:2;ctx.beginPath();ctx.arc(q.x,q.y,T.PARRY_R,0,TAU);ctx.stroke()}
 if(q.state==='atk'&&q.mv){const m=q.mv;
  if(m.spd){if(q.t<m.start){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R+6+(m.start-q.t)*2,0,TAU);ctx.stroke()}}
  else if(q.charging){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,R+4+q.charge*.6,0,TAU);ctx.stroke()}
  else{const live=q.t>m.start&&q.t<=m.start+m.act;
   ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.arc(q.x,q.y,m.range*(q.fx.laev>0?2.2:1)*(q.giant>0?1.6:1)+R,q.atkA-m.arc/2,q.atkA+m.arc/2);ctx.closePath();
   if(live){ctx.globalAlpha=.4;ctx.fillStyle=c;ctx.fill();ctx.globalAlpha=1}else if(q.t<=m.start){ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke()}}}
 if(q.state==='hitstun'){ctx.fillStyle='#fc3';ctx.fillRect(q.x-16,q.y-28,32*Math.min(1,q.t/40),3)}
 ctx.globalAlpha=1;if(ro)ctx.restore();if(jt)ctx.restore()}

function drawItem(){
 const s=14+3*Math.sin(frame*.15),ic=itemCol(item.type);
 ctx.save();ctx.translate(item.x,item.y);
 ctx.strokeStyle=ic;ctx.lineWidth=2;ctx.setLineDash(item.on?[]:[6,6]);ctx.beginPath();ctx.arc(0,0,T.ITEM_R,0,TAU);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle=ic;ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText(ITEMS.find(i=>i.k===item.type).name,0,-T.ITEM_R-34); // nom de l'objet
 if(item.on){ctx.rotate(frame*.03);ctx.fillStyle=ic;ctx.fillRect(-s/2,-s*.7,s,s*1.4);ctx.rotate(-frame*.03);
  item.cp.forEach((cp,i)=>{if(cp<=0)return;const f=cp/capOf(item),r=T.ITEM_R+12+i*10,a0=-Math.PI/2; // chargement de la prise
   ctx.lineWidth=8;ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
   ctx.globalAlpha=.35;ctx.lineWidth=16;ctx.strokeStyle=COLS[i];ctx.beginPath();ctx.arc(0,0,r,a0,a0+TAU*f);ctx.stroke();
   ctx.globalAlpha=1;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,r,a0,a0+TAU*f);ctx.stroke();
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(Math.cos(a0+TAU*f)*r,Math.sin(a0+TAU*f)*r,5,0,TAU);ctx.fill();
   ctx.fillStyle=COLS[i];ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText((f*100|0)+'%',0,T.ITEM_R+40+i*10)});
  if(item.cont){ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('CONTESTED',0,-T.ITEM_R-16)}}
 ctx.restore()}

function drawIndicators(v,p,o,cam){
 if(p.state==='dead')return;const pad=28,cx=v.x+v.w/2,cy=H/2;
 const edge=(x,y,col,label,sz)=>{
  const sx=cx+(x-cam.x)*SCv,sy=cy+(y-cam.y)*SCv;
  if(sx>v.x+pad&&sx<v.x+v.w-pad&&sy>pad&&sy<H-pad)return false;
  const dx=sx-cx,dy=sy-cy,k=Math.min((v.w/2-pad)/Math.abs(dx||1e-6),(H/2-pad)/Math.abs(dy||1e-6)),ex=cx+dx*k,ey=cy+dy*k,a=Math.atan2(dy,dx);
  ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(sz,0);ctx.lineTo(-sz,-sz*.7);ctx.lineTo(-sz,sz*.7);ctx.fill();ctx.restore();
  if(label){ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText(label,ex-Math.cos(a)*26,ey-Math.sin(a)*26+4)}return true};
 for(const q of P)if(q!==p&&q.state!=='dead')edge(q.x,q.y,COLS[q.id],Math.round(Math.hypot(q.x-p.x,q.y-p.y)/10)+'m',14);
 let n=0;for(const b of B){if(!b.heavy||b.owner===p.id||n>5)continue; // alerte lourde hors-champ
  const dx=p.x-b.x,dy=p.y-b.y,d=Math.hypot(dx,dy),sp=Math.hypot(b.vx,b.vy);
  if(d>900||(b.vx*dx+b.vy*dy)/(d*sp)<.8)continue;if(edge(b.x,b.y,'#f33','!',9))n++}
 if(item)edge(item.x,item.y,'#f8f','',10)}

function bar(x,y,w,h,f,c){ctx.fillStyle='#222';ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,w*clamp(f,0,1),h)}
function drawHUD(p,x,right,y=30){if(CX.anon>0||p.fx&&p.fx.koishi>0)return; // HUD : panneau lisible, chaque jauge est nommée
 const w=250,X=right?x-w:x,c=COLS[p.id],hp=p.wsA?T.HP-Math.max(0,p.hp):Math.max(0,p.hp),box=(a,b,ww,hh)=>{ctx.beginPath();ctx.roundRect?ctx.roundRect(a,b,ww,hh,7):ctx.rect(a,b,ww,hh)};
 ctx.save();ctx.globalAlpha=.5;ctx.fillStyle='#04050b';box(X-8,y-20,w+16,94);ctx.fill();ctx.globalAlpha=.8;ctx.strokeStyle=TEAMS?TCOL[TEAMA[p.id]]:c;ctx.lineWidth=2;box(X-8,y-20,w+16,94);ctx.stroke();ctx.globalAlpha=1;
 ctx.font='bold 15px monospace';ctx.textAlign=right?'right':'left';ctx.fillStyle=c;ctx.fillText(pname(p),x,y-3);{const im=picImg(p);if(im){const s=48,px=right?X+w+14:X-14-s,py=y-20;ctx.save();ctx.beginPath();ctx.arc(px+s/2,py+s/2,s/2,0,TAU);ctx.clip();try{ctx.drawImage(im,px,py,s,s)}catch(e){}ctx.restore();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+s/2,py+s/2,s/2,0,TAU);ctx.stroke()}}
 ctx.textAlign=right?'left':'right';ctx.fillStyle='#ff7090';ctx.fillText(p.stocks>6?'♥ x'+p.stocks:'♥'.repeat(Math.max(0,p.stocks)),right?X:X+w,y-3);
 const hc=hp>50?'#4e6':hp>25?'#ec4':'#f44';bar(X,y+3,w,14,hp/T.HP,hc);ctx.textAlign='center';ctx.font='bold 11px monospace';ctx.fillStyle='#000';ctx.fillText(Math.ceil(hp)+' HP',X+w/2,y+14);
 const sr=p.spirit>=T.SPELL_COST;bar(X,y+21,w,10,p.spirit/T.SPIRIT_MAX,p.ult?rainbowCol():sr?'#f8f':'#58c');ctx.font='bold 9px monospace';ctx.fillStyle=sr||p.ult?'#000':'#fff';ctx.fillText(p.ult?'LAST WORD READY':sr?'SPELL READY':'SPELL '+Math.min(99,p.spirit/T.SPELL_COST*100|0)+'%',X+w/2,y+29);
 
 for(let i=0;i<T.DASH_CHARGES;i++){const f=clamp(p.boost-i,0,1),xx=X+w*.53+i*17;ctx.fillStyle='#262a33';ctx.fillRect(xx,y+35,14,9);ctx.fillStyle=f>=1?'#fff':'#8a8f9a';ctx.fillRect(xx,y+35,14*f,9)}
 for(let i=0;i<T.PIPS;i++){ctx.fillStyle=i<p.pips?'#f55':'#3a2226';ctx.fillRect(X+w-(T.PIPS-i)*15+3,y+35,12,9)}
 ctx.fillStyle='#8a8f9a';ctx.font='8px monospace';ctx.fillText('DASH',X+w*.53+25,y+52);ctx.fillText('WALL',X+w-22,y+52);
 ctx.textAlign=right?'right':'left';ctx.font='11px monospace';ctx.fillStyle=LCOLS[p.id];ctx.fillText(SHOTS[p.shotT].name+'  P '+p.power.toFixed(1)+(p.pStk?'  ATK x'+Math.pow(1.3,p.pStk).toFixed(1):''),x,y+60);
 const s=[p.ult?'LAST WORD READY':'',p.spirit>=T.SPELL_COST?'SPELL READY':'',p.burst>=T.BURST_MAX?'BURST':'',p.blade>0?'BLADE '+Math.ceil(p.blade/60)+'s':'',p.rifle?'RIFLE x'+p.rifle:'',p.bombs>0?'BOMBS '+Math.ceil(p.bombs/60)+'s':'',p.mirror>0?'MIRROR '+Math.ceil(p.mirror/60)+'s':'',p.giant>0?'GIANT '+Math.ceil(p.giant/60)+'s':'',p.clone>0?'CLONE '+Math.ceil(p.clone/60)+'s':'',p.star>0?'ELIXIR '+Math.ceil(p.star/60)+'s':'',p.cam?'CAMERA x'+p.cam:'',p.spk>0?'SPARK!':'',...Object.keys(p.fx).filter(k=>p.fx[k]>0&&FXN[k]).map(k=>FXN[k]+(PERMFX.has(k)?' x'+p.fx[k]:' '+Math.ceil(p.fx[k]/60)+'s')),p.comboT>0&&p.comboN>1?p.comboN+' HITS':''].filter(Boolean).join(' · ');
 ctx.fillStyle='#ffb0f0';ctx.font='10px monospace';ctx.fillText(s.length>46?s.slice(0,45)+'…':s,x,y+71);ctx.restore()}

function drawDebugWorld(){
 ctx.lineWidth=1;ctx.font='10px monospace';ctx.textAlign='center';
 for(const p of P){if(p.state==='dead')continue;
  ctx.strokeStyle='#0f0';ctx.beginPath();ctx.arc(p.x,p.y,T.BODY_R,0,TAU);ctx.stroke();
  ctx.strokeStyle='#08f';ctx.beginPath();ctx.arc(p.x,p.y,T.GRAZE_R,0,TAU);ctx.stroke();
  ctx.fillStyle='#0f0';ctx.fillText(`${p.state}${p.mvName&&p.state==='atk'?':'+p.mvName:''} t${p.t} c${p.combo} hp${p.hp|0} P${p.power.toFixed(2)} run${+p.run} sl${p.slide} br${p.burst|0} tech${p.techBuf}`,p.x,p.y+34)}
 ctx.strokeStyle='#f0f';for(const b of B)if(b.heavy){ctx.beginPath();ctx.arc(b.x,b.y,b.r+T.CORE_R,0,TAU);ctx.stroke()}}

function overlay(a,b){ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';ctx.fillStyle='#fff';
 ctx.font='bold 42px monospace';ctx.fillText(a,W/2,H/2);ctx.font='16px monospace';ctx.fillText(b,W/2,H/2+36)}
function drawMenu(){testEnd();
 hot=[];ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 44px monospace';ctx.fillText('SHMUP FIGHTER',W/2,H*.12);
 const y0=H*.21,sp=Math.min(38,H*.68/MENU.length);
 MENU.forEach((it,i)=>{const y=y0+i*sp,s=i===menuSel;ctx.font=(s?'bold ':'')+'20px monospace';ctx.fillStyle=s?'#ffd23a':'#aaa';const tx=(s?'▶ ':'')+it.t();ctx.fillText(tx,W/2,y);const am=arrowMid(tx);
  hot.push({x:W/2-280,y:y-sp*.72,w:560,h:sp,hover:()=>{if(menuSel!==i){menuSel=i;sfx('se_select00',.6)}},click:x=>{if(x!==undefined&&it.lr){it.lr(x<am?-1:1);sfx('changemenu',.8);saveOpts()}else nav('ok')}})});
 if(TCH.on&&MENU[menuSel].lr){const y=y0+menuSel*sp-6;ctx.font='bold 34px monospace';ctx.fillStyle='#ffd23a';ctx.fillText('◀',W/2-300,y+10);ctx.fillText('▶',W/2+300,y+10); // gros boutons tactiles ◀ ▶
  hot.push({x:0,y:y-40,w:W/2-250,h:80,hover:()=>{},click:()=>nav('left')},{x:W/2+250,y:y-40,w:W/2-250,h:80,hover:()=>{},click:()=>nav('right')})}
 ctx.font='12px monospace';ctx.fillStyle='#888';ctx.fillText(TCH.on?'Tap a line · tap its left / right side (or the big arrows) to change it':'Up/Down: select · Left/Right: change · Enter / A / click: confirm · Start: fight',W/2,H-36);
 if(AC&&AC.state!=='running'){ctx.fillStyle='#f8f';ctx.fillText('Press a key or click to enable sound',W/2,H-16)}}
function backBtn(){ctx.textAlign='left';ctx.font='16px monospace';ctx.fillStyle='#aaa';ctx.fillText('◀ Back',20,40);hot.push({x:10,y:15,w:120,h:36,hover:()=>{},click:()=>nav('back')})}
function drawItemsMenu(){
 hot=[];ctx.textAlign='center';ctx.fillStyle='#fff';uiHeader('ITEMS');
 ctx.font='14px monospace';ctx.fillStyle=itemsOn?'#9f9':'#f88';ctx.fillText(itemsOn?'Items are ON (change it in RULES)':'Items are OFF: the center card always gives the LAST WORD',W/2,86);
 const per=16,pg=Math.floor(itemSel/per),np=Math.ceil(ITEMS.length/per),rows=8,cw=Math.min(620,(W-60)/2),sp=Math.min(62,(H-210)/rows);
 ITEMS.slice(pg*per,pg*per+per).forEach((it,j)=>{const i=pg*per+j,x=j<rows?W/2-10-cw:W/2+10,y=128+(j%rows)*sp,sel=i===itemSel,c=it.c==='rainbow'?rainbowCol():it.c;
  if(sel){ctx.fillStyle='#222';ctx.fillRect(x,y-26,cw,sp-4)}
  ctx.fillStyle=c;ctx.fillRect(x+10,y-18,18,28);ctx.textAlign='left';ctx.font='bold 16px monospace';ctx.fillStyle=sel?'#ffd23a':'#fff';ctx.fillText(it.name,x+40,y);
  if(it.ch){const w=ctx.measureText(it.name).width;ctx.font='12px monospace';ctx.fillStyle='#888';ctx.fillText('('+it.ch+')',x+48+w,y)}
  if(sp>=34){ctx.font='11px monospace';ctx.fillStyle='#aaa';const wl=wrapT(it.d,cw-110);ctx.fillText(wl[0]+(wl.length>1?'…':''),x+40,y+16)}
  ctx.textAlign='right';ctx.font='bold 16px monospace';ctx.fillStyle=itemOn[it.k]?'#6f6':'#f55';ctx.fillText(itemOn[it.k]?'ON':'OFF',x+cw-10,y);
  ctx.fillStyle=sel?'#6ff':'#488';ctx.fillText('▶TEST',x+cw-56,y);hot.push({x:x+cw-130,y:y-26,w:76,h:sp-4,hover:()=>{itemSel=i},click:()=>testItem(it.k)}); // essayer l'objet
  hot.push({x,y:y-26,w:cw,h:sp-4,hover:()=>{if(itemSel!==i){itemSel=i;sfx('se_select00',.6)}},click:()=>nav('ok')})});
 backBtn();ctx.textAlign='center';ctx.fillStyle='#ffd23a';ctx.font='15px monospace';ctx.fillText('Page '+(pg+1)+'/'+np+'  ◀ ▶',W/2,H-50);{const bw=Math.max(56,H*.08),by=H-50-bw*.62;[[-1,W/2-150-bw],[1,W/2+150]].forEach(([d,x])=>{ctx.fillStyle='rgba(10,12,22,.85)';ctx.fillRect(x,by,bw,bw*.8);ctx.strokeStyle='#ffd23a';ctx.lineWidth=2;ctx.strokeRect(x,by,bw,bw*.8);ctx.fillStyle='#ffd23a';ctx.textAlign='center';ctx.font='bold '+Math.round(bw*.4)+'px monospace';ctx.fillText(d<0?'◀':'▶',x+bw/2,by+bw*.55);hot.push({x,y:by,w:bw,h:bw*.8,hover:()=>{},click:()=>{const n=ITEMS.length,np=Math.ceil(n/16);itemSel=Math.min(n-1,((((itemSel/16|0)+d)%np+np)%np)*16);sfx('se_select00',.6)}})})}
 ctx.fillStyle='#888';ctx.font='13px monospace';ctx.fillText('Up/Down: select · Left/Right: page · Enter / A / click: toggle · Y / Backspace: all ON/OFF · T / Start: TEST · Esc / B: back',W/2,H-24)}
