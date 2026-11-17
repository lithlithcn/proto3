'use strict';
// ================= Tutoriel jouable : consignes progressives, il faut réussir pour avancer =================
let TUT=null;
const K=a=>{const k=KB[0]&&KB[0][a]?keyName(KB[0][a]):'',v=PAD[0]?PAD[0][a]:undefined,g=v!==undefined?[].concat(v).map(padName).join('+'):'';return'['+k+(g?' / pad '+g:'')+']'};
const TSTEPS=[
 {t:'MOVE',l:()=>['Welcome! Do what each step asks to go to the next one.','Move with '+K('up')+K('left')+K('down')+K('right')+' or the left stick.','Can\'t do a step? Stand in the SKIP zone (bottom-left) for 1 s.'],n:100,c:T=>T.mv/12},
 {t:'SHOOT',l:()=>['Hold Shot '+K('shot')+': you fire small danmaku at your foe.','Aiming is automatic. Small danmaku do little damage, but it adds up.','Deal 15 damage to the dummy.'],n:15,c:T=>T.dmg},
 {t:'SKILLS',l:()=>['Every character has 2 SKILLS, its own special moves.','Skill 1 '+K('prev')+'  ·  Skill 2 '+K('burst')+'  (the effect depends on your character).','Use both skills.'],n:2,c:T=>(T.s1?1:0)+(T.s2?1:0)},
 {t:'FOCUS',l:()=>['Hold Focus '+K('focus')+': you move slowly and precisely.','The white dot in your center is your ONLY hitbox.','Move while holding Focus for 2 s.'],n:120,c:T=>T.foc},
 {t:'GRAZE',dm:'shoot',l:()=>['The dummy shoots at you. Brush past bullets WITHOUT touching the white dot: that is a GRAZE.','Grazing fills your Spell gauge (blue bar under you).','Graze 12 bullets (Focus helps!).'],n:12,c:T=>T.gz},
 {t:'DASH',l:()=>['Press Dash '+K('dash')+' with a direction: a fast, invincible move.','You have 3 charges (white squares under you). They refill over time.','Dash 3 times.'],n:3,c:T=>T.dash},
 {t:'MELEE',l:()=>['Get close and press Melee '+K('melee')+'.','Holding a direction toward the foe changes the attack (jab, lunge, strong).','Hit the dummy with 3 melee attacks.'],n:3,c:T=>T.ml},
 {t:'HIT CANCEL',l:()=>['When a melee attack CONNECTS, press Dash during it:','you cancel the end of the attack and keep the pressure.','Land a melee hit then Dash right away — 2 times.'],n:2,c:T=>T.hc},
 {t:'BIG DANMAKU',l:()=>['Press Heavy '+K('heavy')+': you throw a BIG danmaku.','It hurts a lot, pushes hard, and erases the foe\'s small danmaku.','Hit the dummy 2 times with big danmaku.'],n:2,c:T=>T.hv},
 {t:'PARRY',dm:'heavy',l:()=>['The dummy throws big danmaku. Press Parry '+K('parry')+' RIGHT BEFORE it touches you:','it is reflected back at the thrower! Too early or too late = you get hit.','Reflect 3 big danmaku.'],n:3,c:T=>T.ref},
 {t:'PARRY MELEE',dm:'melee',l:()=>['Parry also blocks melee attacks: the attacker is STUNNED (grey) and open to a punish.','The dummy winds up a slow attack (yellow ring): press Parry when it turns RED.','Parry 2 melee attacks.'],n:2,c:T=>T.pst},
 {t:'RALLY',dm:'rally',l:()=>['The dummy also parries! Each reflection makes the big danmaku faster and stronger.','Keep reflecting it back. At x7 it becomes MAX POWER: unparryable, it one-shots!','Reach a rally of x4.'],n:4,c:T=>T.mr},
 {t:'GRAB',dm:'guard',l:()=>['The dummy keeps parrying. Beat it with a GRAB: hold Parry + press Melee.','A grab only catches someone who is parrying, and BREAKS their guard (long stun).','Grab the dummy 2 times.'],n:2,c:T=>T.sbG},
 {t:'BREAKER',dm:'guard',l:()=>['BREAKER: hold Parry + press Heavy. A black spiky big danmaku.','It passes through everyone… except those who parry: it breaks their guard. 1 s cooldown.','Break the dummy\'s guard with a breaker.'],n:1,c:T=>T.sbB},
 {t:'WALL PIPS',dm:'edge',set:(p,d)=>{d.hx=T.MAP_W-T.EDGE*.5;d.hy=T.MAP_H/2;d.x=d.hx;d.y=d.hy},l:()=>['The RED zone at the edges slowly hurts. Big hits there break WALL pips (red squares under you).','With 0 pips, a big hit at the edge = instant KO!','The dummy is in the red zone: hit it with a big danmaku or a strong melee to break 1 pip.'],n:1,c:(T,p,d)=>3-d.pips},
 {t:'KO BEAM',dm:'none',auto:1,l:()=>['When a fighter is KO\'d, they get a KO BEAM: a giant laser they aim for 2 s.','It pierces everything in its path. Watch the dummy get KO\'d and fire its beam!','(Dodge it, or try to Parry it.)'],n:1,c:T=>T.t>300?1:0},
 {t:'YOUR KO BEAM',dm:'idle',ko:1,l:()=>['Your turn: you will be KO\'d now.','While your beam charges, AIM it with your direction keys / stick at the dummy.','Hit the dummy with your KO beam (you will be KO\'d again until you do).'],n:1,c:T=>T.bh},
 {t:'REFLECT THE BEAM',dm:'none',l:()=>['A KO beam can be PARRIED: press Parry when it reaches you,','then hold a direction to send it wherever you want!','Pressing Parry while aiming your OWN beam cancels it. Reflect the dummy\'s beam!'],n:1,c:(T,p)=>KOB.some(k=>k.o===p.id&&k.dep>0)||T.refB?1:0},
 {t:'SPELL CARD',set:p=>{p.spirit=T.SPIRIT_MAX},l:()=>['Your Spell gauge is full: press Spell '+K('spell')+'.','A spell card unleashes a pattern of BIG danmaku. You are invincible for the first 2 s!','Cast a spell card.'],n:1,c:(T,p)=>p.state==='spell'?1:0},
 {t:'SPELL BREAKERS',set:p=>{p.spirit=T.SPIRIT_MAX},l:()=>['During a spell, HOLD Parry: every big danmaku of your spell becomes a BREAKER.','Great against a foe who parries everything!','Cast a spell while holding Parry.'],n:1,c:(T,p)=>p.state==='spell'&&B.some(b=>b.owner===p.id&&b.breaker)?1:0},
 {t:'SPELL BURST',dm:'combo',set:p=>{p.spirit=T.SPIRIT_MAX},l:()=>['Caught in a combo? Cast your SPELL CARD '+K('spell')+' when its gauge is full, even while being hit:','it starts with a shockwave that pushes everyone away. The dummy attacks you now.','Get hit, then cast your spell!'],n:1,c:(T,p)=>p.state==='spell'?1:0},
 {t:'TECH',dm:'none',l:()=>['When you are thrown into a wall, press Parry RIGHT before the impact: TECH.','You bounce off safely with no wall damage. You will be thrown now!','Tech 1 time.'],n:1,c:T=>T.tech},
 {t:'CARDS & POWERS',dm:'idle',cards:1,l:()=>['A CARD appears in the center every few seconds. Stand on it to capture it:','you get a random POWER (its rule is shown in the middle of the screen).','Capture a card!'],n:1,c:(T,p)=>p.lastIt!==T.li0||p.ult?1:0},
 {t:'DONE!',dm:'idle',l:()=>['Tutorial complete! You know all the basics.','Keep practicing here, try TRAINING to test every power, or FIGHT!','Pause (Esc / Start) → Menu to leave.'],n:1,c:()=>0,end:1}];
function tutStart(){const sv=[nP,nH,mapI,TEAMS,TIMER];nP=2;nH=1;mapI=1;TEAMS=false;TIMER=0;start('game');[nP,nH,mapI,TEAMS,TIMER]=sv;
 TUT={i:0,cards:0};for(const q of P){q.stocks=99}P[1].cpu=true;tutEnter(0);sfx('ok00')}
function tutEnter(i){const p=P[0],d=P[1];TUT=Object.assign(TUT,{i,t:0,ok:0,sk:0,arm:0,mv:0,dmg:0,shots:new Set([p.shotT]),foc:0,gz:0,dash:0,ml:0,hc:0,hv:0,ref:0,pst:0,mr:0,sbG:0,sbB:0,bh:0,tech:0,refB:0,li0:p.lastIt,lk:-999,ps:p.state,ds:d.state});
 const S=TSTEPS[i];TUT.cards=!!S.cards;B=[];KOB=[];d.pips=p.pips=T.PIPS;d.hx=T.MAP_W*.68;d.hy=T.MAP_H/2;
 if(d.state!=='dead')Object.assign(d,{x:d.hx,y:d.hy,vx:0,vy:0,state:'idle'});if(p.state!=='dead'&&i>0)Object.assign(p,{x:T.MAP_W*.32,y:T.MAP_H/2,vx:0,vy:0});if(S.set)S.set(p,d);
 if(S.cards&&!CARDS.length)itemT=IE()-T.ITEM_WARN-50}
DEFER(()=>{{const S0=start;start=m=>{TUT=null;S0(m)}}});
DEFER(()=>{{const H0=hit;hit=(v,a,dx,dy,m,mult,heavy)=>{if(TUT&&a===P[0]&&v===P[1]){if(m&&m.arm!==undefined)TUT.hv++;else if(a.state==='atk'&&a.mvName!=='grab')TUT.ml++}return H0(v,a,dx,dy,m,mult,heavy)}}});
DEFER(()=>{{const R0=reflect;reflect=(b,t)=>{if(TUT&&t===P[0])TUT.ref++;return R0(b,t)}}});
DEFER(()=>{{const X0=xShieldBreak;xShieldBreak=(o,a)=>{if(TUT&&o===P[1]){if(P[0].state==='atk'&&P[0].mvName==='grab')TUT.sbG++;else TUT.sbB++}return X0(o,a)}}});
DEFER(()=>{{const U0=updItem;updItem=()=>{if(TUT&&!TUT.cards)return;return U0()}}});
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{if(!TUT||p!==P[1])return C0(p,o);const S=TSTEPS[TUT.i],m=S.dm||'idle',q=P[0],I={x:0,y:0,b:{}},f=frame;
 const home=()=>{const dx=p.hx-p.x,dy=p.hy-p.y,l=Math.hypot(dx,dy);if(l>12){I.x=dx/l;I.y=dy/l}};
 if(m==='idle'||m==='edge')home();
 else if(m==='shoot'){I.b.shot=true;I.y=Math.sin(f*.03);home();I.y=I.y||Math.sin(f*.03)}
 else if(m==='heavy'){home();if(f%80===0)I.b.heavy=true}
 else if(m==='melee'){const dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy)||1;if(l>48){I.x=dx/l;I.y=dy/l}else if(p.state==='idle'&&f%60===0)startAtk(p,'tslam')}
 else if(m==='guard'){home();I.b.parry=f%24<20}
 else if(m==='rally'||m==='combo'){const lv=cpuLv;cpuLv=m==='rally'?9:6;const J=C0(p,o);cpuLv=lv;if(m==='rally'){I.b.parry=!!J.b.parry;home();if(f%150===0&&!B.some(b=>b.heavy))I.b.heavy=true}else{Object.assign(I,J);I.b.spell=I.b.burst=false}}
 return I}}});
function tutTick(){const T2=TUT,p=P[0],d=P[1],S=TSTEPS[T2.i];T2.t++;
 for(const t of TX)if(!t.tu){t.tu=1;if(t.s==='HIT CANCEL')T2.hc++;if(t.s==='TECH')T2.tech++}
 for(const g of GZ)if(!g.tu&&g.p===p){g.tu=1;if(Math.hypot(p.vx,p.vy)>.5)T2.gz++}
 if(p.state!=='dead'){T2.mv+=Math.hypot(p.vx,p.vy)*.12;if(p.focus&&Math.hypot(p.vx,p.vy)>.3)T2.foc++;T2.shots.add(p.shotT)}
 if(p.state==='dash'&&T2.ps!=='dash')T2.dash++;T2.ps=p.state;
 if(d.state==='parrystun'&&T2.ds!=='parrystun'&&!((d.sbT||0)>frame+100))T2.pst++;T2.ds=d.state;
 for(const b of B)if(b.heavy&&(b.refl||0)>T2.mr)T2.mr=b.refl;
 const loss=d.state==='dead'?0:100-d.hp;if(loss>0){T2.dmg+=loss;if(p.state==='dead')T2.bh=1}if(d.state!=='dead'){d.hp=100;d.stocks=99}if(p.state!=='dead'&&!S.ko){p.hp=Math.max(p.hp,100);p.stocks=99}
 if(S.set&&T2.t%60===0&&(S.t==='SPELL CARD'||S.t==='SPELL BREAKERS')&&p.state!=='spell')p.spirit=T.SPIRIT_MAX;if(S.t==='BURST'&&p.state!=='bursting'&&T2.t%60===0)p.burst=T.BURST_MAX;
 // comportements spéciaux
 if(S.t==='KO BEAM'&&T2.t===60&&d.state!=='dead'){d.hp=0;d.lastByF=-1e9;ko(d,'K.O.')}
 if(S.ko&&!T2.bh&&p.state!=='dead'&&!KOB.some(k=>k.o===p.id)&&T2.t-T2.lk>50){T2.lk=T2.t;p.hp=0;p.fx.phoenix=0;ko(p,'YOUR TURN!')}
 if(S.t==='REFLECT THE BEAM'&&!KOB.some(k=>k.o===p.id&&k.dep>0)){if(KOB.some(k=>k.o===p.id))T2.refB=1;if(d.state!=='dead'&&p.state!=='dead'&&!KOB.some(k=>k.o===d.id)&&T2.t-T2.lk>90){T2.lk=T2.t;d.hp=0;ko(d,'K.O.')}}
 if(S.t==='TECH'&&p.state==='idle'&&T2.t-T2.lk>120){T2.lk=T2.t;const ax=p.x<T.MAP_W/2?-1:1;hit(p,d,ax,0,{dmg:3,kb:24,stun:46},1,true);txt(p.x,p.y-50,'PARRY BEFORE THE WALL!','#6ff',16)}
 if(S.cards&&!CARDS.length&&!item&&T2.t%60===0)itemT=Math.max(itemT,IE()-T.ITEM_WARN-50);
 // réussite → étape suivante
 if(!S.end&&!T2.ok&&S.c(T2,p,d)>=S.n){T2.ok=70;sfx('confirm');sfx('levelup2',.5);big('CLEAR!','#6f6',70)}
 if(T2.ok&&--T2.ok===0){tutEnter(T2.i+1);return}
 // zone SKIP en bas à gauche
 const z=tutZ(),inZ=p.x>z[0]&&p.x<z[0]+z[2]&&p.y>z[1]&&p.y<z[1]+z[3];if(!inZ)T2.arm=1;if(!S.end&&T2.arm&&p.state!=='dead'&&p.x>z[0]&&p.x<z[0]+z[2]&&p.y>z[1]&&p.y<z[1]+z[3]){if(++T2.sk>=60){sfx('select2',.6);tutEnter(T2.i+1)}}else T2.sk=0}
const tutZ=()=>[T.EDGE+12,T.MAP_H-T.EDGE-122,110,110];
DEFER(()=>{{const S1=step;step=()=>{S1();if(TUT&&mode==='game'&&!paused)tutTick()}}});
DEFER(()=>{{const D0=chDraw5;chDraw5=()=>{D0();if(!TUT)return;{const d=P[1];if(d.state==='atk'&&d.mvName==='tslam'&&d.t<32){const f=d.t/32;ctx.save();ctx.strokeStyle=f>.75?'#f44':'#ffd23a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(d.x,d.y,56+60*(1-f),0,TAU);ctx.stroke();ctx.font='bold 26px monospace';ctx.textAlign='center';ctx.fillStyle=ctx.strokeStyle;ctx.fillText(f>.75?'PARRY NOW!':'!',d.x,d.y-40);ctx.restore()}} // attaque téléphonée
 if(TSTEPS[TUT.i].end)return;const z=tutZ(),f=TUT.sk/60;ctx.save();ctx.globalAlpha=.85;ctx.setLineDash([8,6]);ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.strokeRect(z[0],z[1],z[2],z[3]);ctx.setLineDash([]);
 ctx.fillStyle='rgba(255,210,58,.35)';ctx.fillRect(z[0],z[1]+z[3]*(1-f),z[2],z[3]*f);ctx.fillStyle='#ddd';ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillText('SKIP STEP',z[0]+z[2]/2,z[1]+z[3]/2-4);ctx.font='10px monospace';ctx.fillText('stand here 1 s',z[0]+z[2]/2,z[1]+z[3]/2+12);ctx.restore()}}});
function drawTut(){if(!TUT||mode!=='game')return;const S=TSTEPS[TUT.i],L=S.l(),w=Math.min(820,W-30);ctx.save();ctx.font='bold 15px monospace';const ls=L.flatMap(l=>wrapT(l,w-40)),h=48+ls.length*20+14,x=W/2-w/2,y=8;
 ctx.globalAlpha=.78;ctx.fillStyle='#05060c';ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;ctx.strokeStyle=TUT.ok?'#6f6':'#6ff';ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
 ctx.textAlign='left';ctx.font='bold 18px monospace';ctx.fillStyle=TUT.ok?'#6f6':'#6ff';ctx.fillText('TUTORIAL '+(TUT.i+1)+'/'+TSTEPS.length+' — '+S.t+(TUT.ok?'  ✓':''),x+16,y+26);
 const pr=S.end?1:clamp(S.c(TUT,P[0],P[1])/S.n,0,1);if(!S.end){ctx.textAlign='right';ctx.font='bold 15px monospace';ctx.fillStyle='#ffd23a';ctx.fillText(S.n>=12?Math.round(pr*100)+'%':Math.min(S.n,Math.floor(S.c(TUT,P[0],P[1])))+' / '+S.n,x+w-16,y+26)}
 ctx.textAlign='left';ctx.font='bold 15px monospace';ls.forEach((l,i)=>{ctx.lineWidth=4;ctx.strokeStyle='#000';ctx.strokeText(l,x+16,y+50+i*20);ctx.fillStyle=i===ls.length-1&&!S.end?'#ffe9a0':'#fff';ctx.fillText(l,x+16,y+50+i*20)});
 ctx.fillStyle='#222';ctx.fillRect(x,y+h-6,w,6);ctx.fillStyle=TUT.ok?'#6f6':'#ffd23a';ctx.fillRect(x,y+h-6,w*pr,6);ctx.restore()}

