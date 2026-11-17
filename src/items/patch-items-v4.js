'use strict';
// ---- patch items v4
let SMR=[],RDK=[],FRZQ=null;
DEFER(()=>{{const G0=give0;give0=(p,t)=>{if(t==='clone')p.cloneHP=15;if(t==='camera')p.camDash=1;return G0(p,t)}}});
DEFER(()=>{Object.assign(GIVE,{
 keine:p=>{const S=gameSave();KEIS.set(frame,S);for(const k of KEIS.keys())if(k<frame-900)KEIS.delete(k);CX.kei={o:p.id,t:300,f:frame};big('HISTORY SAVED: REWRITE IN 5 S','#5a8cff',40);sfx('se_kira00');flash(.3,'#5a8cff')},
 elixir:p=>{p.fx.elx=300;big('HOURAI ELIXIR: IMMORTAL IN 5 S','#ffd23a',40)},
 mokou:p=>{p.fx.mkb=300;big('IMMORTAL KAMIKAZE: 5 S','#ff4b1f',44);sfx('fire',.6)},
 suwako:p=>{p.fx.under=480;p.suwN=3;burst(p.x,p.y,'#8a9a50',30);big('UNDERGROUND x3','#c8b050',44)}});});
DEFER(()=>{Object.assign(FXN,{elx:'ELIXIR BREWING',imm:'IMMORTAL',mkb:'BURNING'});});
DEFER(()=>{{const F0=fxEnd;fxEnd=(p,k)=>{F0(p,k);
 if(k==='elx'){p.fx.imm=600;big('IMMORTAL FOR 10 S!','#ffd23a',50);sfx('healing');flash(.3,'#ffd23a');RINGS.push({x:p.x,y:p.y,r:0,m:120,t:30,c:'#ffd23a'})}
 if(k==='mkb'&&p.state!=='dead'){big('FUJIYAMA VOLCANO!','#ff4b1f',70);sfx('explosion2');sfx('fire2');flash(.6,'#ff6a20');shake=Math.min(60,shake+40);chroma=Math.max(chroma,40);
  for(let i=0;i<4;i++)WAVES.push({x:p.x,y:p.y,t:24+i*6,T:24+i*6,spd:18+i*5,th:80,inv:0,c:['#ff4b1f','#ffa020','#ffe060','#fff'][i]});for(let i=0;i<60;i++){const a=rng()*TAU,v=3+rng()*9;FX.push({x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:40,c:['#ff4b1f','#ffa020','#ffe060'][i%3]})}
  for(const q of P){if(q===p||q.state==='dead'||q.inv>0||ally(q,p))continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<340)hit(q,p,dx,dy,{dmg:30,kb:26,stun:50},1,true)}rebirth(p)}}}});
DEFER(()=>{{const K0=ko;ko=(p,w)=>{if(p.fx&&p.fx.imm>0&&p.state!=='dead'){p.hp=1;p.inv=Math.max(p.inv,30);txt(p.x,p.y-44,'IMMORTAL!','#ffd23a',18);return}return K0(p,w)}}}); // Hourai Elixir : on ne peut plus perdre de vie
DEFER(()=>{{const C0=chSpeed;chSpeed=p=>C0(p)*(p.fx&&p.fx.mkb>0?.65:1)}});
DEFER(()=>{{const D0=dash;dash=(p,I)=>{D0(p,I);if(p.fx.guard>0){p.vx*=1.8;p.vy*=1.8;burst(p.x,p.y,'#e0e6f0',10)}}}}); // Momiji : dash 2x plus présent
DEFER(()=>{{const E0=xEmerge;xEmerge=p=>{E0(p);if((p.suwN||0)>1){p.suwN--;p.suwDive=frame+45}else p.suwN=0}}}); // Suwako : 3 attaques
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0)return;
 for(const p of P){if(p.state==='dead')continue;const f=p.fx;
  if(p.cam>0)p.boost=T.DASH_CHARGES; // Tengu Camera : dashs infinis
  if(p.suwDive===frame&&p.suwN>0){p.fx.under=240;burst(p.x,p.y,'#8a9a50',20);sfx('gapclosing',.5)}
  if(f.mkb>0){p.hp=Math.max(1,p.hp-.05);if(frame%3===0)FX.push({x:p.x+(rng()-.5)*20,y:p.y,vx:(rng()-.5),vy:-2-rng()*2,t:24,c:rng()<.5?'#ff4b1f':'#ffa020'});if(frame%40===0)sfx('fire'+(2+(rng()*4|0)),.25)}
  if(f.guard>0&&frame%45===0){const a=p.aim;SMR.push({x:p.x,y:p.y,a,t:14,w:1});sfx('swordheavy',.5);for(const q of P){if(q===p||q.state==='dead'||q.inv>0||ally(q,p))continue;const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),da=Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-a),Math.cos(Math.atan2(dy,dx)-a)));if(d<130&&da<1.1)hit(q,p,dx,dy,{dmg:10,kb:14,stun:30},1,true)}} // grande épée devant
  if(f.eat>0&&frame%28===0){for(let i=0;i<12;i++){const a=i*TAU/12+frame*.05;RDK.push({x:p.x,y:p.y,vx:Math.cos(a)*3.2,vy:Math.sin(a)*3.2,t:110,r:16})}RDK.push({x:p.x,y:p.y,w:1,t:34})} // Rumia : ténèbres sans dégâts
  if(p.clone>0)for(const b of B){if(b.dead||b.owner===p.id||b.fake||ally(P[b.owner]||p,p))continue;const x=T.MAP_W-p.x,y=T.MAP_H-p.y;if(Math.hypot(b.x-x,b.y-y)<b.r+T.BODY_R){b.dead=1;p.cloneHP-=b.heavy?5:1;burst(x,y,'#8a9a50',4);if(p.cloneHP<=0){p.clone=0;burst(x,y,'#fff',30);big('DOPPELGANGER DESTROYED','#aaa',34);break}}}}
 for(const u of BUMPS)if(u.vy){u.y+=u.vy;if(u.y<120||u.y>T.MAP_H-120)u.vy*=-1}
 if(FRZQ&&frame>=FRZQ.f&&!FRZ){const p=P[FRZQ.o];if(p){for(const b of B)if(b.owner!==p.id){b.fz=1;b.c='#bff6ff'}FRZ={t:90,o:p.id};big('PERFECT FREEZE x'+(4-FRZQ.n)+'!','#a8f0ff',50);sfx('get_freezed',.6)}if(--FRZQ.n>0)FRZQ.f=frame+130;else FRZQ=null}
 if(CX.kei&&--CX.kei.t<=0){const K=CX.kei;CX.kei=null;if(K.f!==undefined){CX.keiGo=K.f}else P.forEach((q,i)=>{const h=K.S[i];if(!h)return;if(!h.dead){if(q.state==='dead'){for(let j=KOB.length-1;j>=0;j--)if(KOB[j].o===q.id)KOB.splice(j,1);Object.assign(q,{state:'idle',t:0,inv:60})}Object.assign(q,{x:h.x,y:h.y,vx:0,vy:0})}
   Object.assign(q,{hp:h.hp,stocks:h.st,spirit:h.sp,burst:h.bu,pips:h.pi,power:h.pw});burst(q.x,q.y,'#5a8cff',20)});big('HISTORY REWRITTEN','#5a8cff',56);sfx('se_kira00');flash(.4,'#5a8cff');chroma=Math.max(chroma,20)}
 for(const r of RDK){r.t--;if(!r.w){r.x+=r.vx;r.y+=r.vy}}RDK=RDK.filter(r=>r.t>0);SMR=SMR.filter(m=>--m.t>0)}}});
DEFER(()=>{{const D0=chDraw5;chDraw5=()=>{D0();
 if(P.some(p=>p.fx.rei>0&&p.state!=='dead')){const cx=T.MAP_W/2,cy=T.MAP_H/2,k=.5+.5*Math.sin(frame*.12);ctx.save();ctx.strokeStyle='rgba(255,74,74,'+(.5+.4*k)+')';ctx.lineWidth=4;ctx.setLineDash([16,10]);ctx.lineDashOffset=-frame;ctx.beginPath();ctx.arc(cx,cy,300,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,255,255,.05)';ctx.fill();ctx.fillStyle='rgba(255,120,120,.8)';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('FANTASY SKY · CENTER',cx,cy-310);ctx.restore()} // zone du centre
 for(const r of RDK){ctx.save();if(r.w){const u=1-r.t/34;ctx.globalAlpha=.35*(1-u);ctx.strokeStyle='#1a0628';ctx.lineWidth=40;ctx.beginPath();ctx.arc(r.x,r.y,30+u*900,0,TAU);ctx.stroke()}else{ctx.globalAlpha=.5*Math.min(1,r.t/30);const g=ctx.createRadialGradient(r.x,r.y,2,r.x,r.y,r.r);g.addColorStop(0,'#000');g.addColorStop(1,'#4a1a6a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,TAU);ctx.fill()}ctx.restore()}
 for(const m of SMR){const u=m.t/16,R=m.w?130:60;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);ctx.globalAlpha=u;ctx.lineCap='round';
  if(m.w){ctx.strokeStyle='#fff';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,0,R*.8,-1.1+(1-u)*.6,1.1-(1-u)*.2);ctx.stroke();ctx.strokeStyle='#9ab';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R*.62,-1,1);ctx.stroke()}
  else for(let i=0;i<6;i++){ctx.strokeStyle=RB[i];ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,R-i*6,-1.2+(1-u)*.8,1.2);ctx.stroke()}ctx.restore()} // traînées (kick arc-en-ciel, épée)
 for(const p of P){if(p.state==='dead')continue;
  if(p.spk>=90){const o=nearFoe(p.id,p.x,p.y);if(o){ctx.save();ctx.globalAlpha=.25+.35*Math.abs(Math.sin(frame*.4));ctx.strokeStyle=RB[(frame>>2)%6];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(p.spkA)*1600,p.y+Math.sin(p.spkA)*1600);ctx.stroke();ctx.beginPath();ctx.arc(o.x,o.y,24+6*Math.sin(frame*.3),0,TAU);ctx.stroke();ctx.restore()}} // Master Spark : visée
  if(p.clone>0){const x=T.MAP_W-p.x,y=T.MAP_H-p.y;ctx.fillStyle='#333';ctx.fillRect(x-20,y-32,40,4);ctx.fillStyle='#8a9a50';ctx.fillRect(x-20,y-32,40*Math.max(0,p.cloneHP)/15,4)}
  if(p.fx.imm>0||p.fx.elx>0){ctx.strokeStyle=p.fx.imm>0?(frame&4?'#ffd23a':'#fff'):'rgba(255,210,58,.4)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+8,0,TAU*(p.fx.imm>0?1:1-p.fx.elx/300));ctx.stroke()}}
 if(CX.myst)for(const p of P)if(p.state!=='dead'){ctx.strokeStyle=COLS[p.id];ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+3,0,TAU);ctx.stroke()}}}}); // Mystia : contours visibles

