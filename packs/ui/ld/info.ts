// @ts-nocheck — legacy guide pages copied verbatim (legacy lines 3714-3778: dC/dL/dT/fig helpers + INFO: title, text lines, animated diagram per page).
// Presentation art only; bound to a ctx by bindInfo. Text edits go here (one entry per page).
let ctx, COLS, LCOLS, ITEMS = [], T = { MAP_W: 2000, MAP_H: 1350 }, frame = 0;
const TAU = 6.2832;
// legacy data the pages print (shot names, first spell card, element reactions)
const SHOTS = [{"name": "Spread"}, {"name": "Needles"}, {"name": "Amulets"}, {"name": "Barrage"}, {"name": "Reimu"}, {"name": "Marisa"}, {"name": "Flandre"}, {"name": "Hecatia"}, {"name": "Nue"}, {"name": "Okina"}, {"name": "Nazrin"}, {"name": "Aya"}], SPELLS = [{"name": "Spirit Sign「Fantasy Seal」"}], RX = {"12": ["STEAM"], "13": ["MELT"], "14": ["OVERLOAD"], "15": ["FIRESTORM"], "16": ["MAGMA"], "17": ["WILDFIRE"], "18": ["HELLFIRE"], "19": ["SOLAR BEAM"], "23": ["FREEZE"], "24": ["ELECTRO-CHARGE"], "25": ["TYPHOON"], "26": ["MUD"], "27": ["BLOOM"], "28": ["ABYSS"], "29": ["RAINBOW"], "34": ["SUPERCONDUCT"], "35": ["BLIZZARD"], "36": ["PERMAFROST"], "37": ["FROSTBITE"], "38": ["CRYO-VOID"], "39": ["PRISM"], "45": ["THUNDERSTORM"], "46": ["EMP"], "47": ["QUICKEN"], "48": ["BLACK LIGHTNING"], "49": ["PLASMA"], "56": ["SANDSTORM"], "57": ["POLLEN"], "58": ["SHADOW GALE"], "59": ["AURORA"], "67": ["OVERGROWTH"], "68": ["SINKHOLE"], "69": ["CRYSTAL"], "78": ["ROT"], "79": ["PHOTOSYNTHESIS"], "89": ["ANNIHILATION"]}, ELC9 = ['#fff','#ff5030','#3a8aff','#9ae8ff','#f0e040','#9affc8','#c09060','#5cd040','#9a3ae0','#fff6b0'], ELN9 = ["", "FIRE", "WATER", "ICE", "THUNDER", "WIND", "EARTH", "NATURE", "DARK", "LIGHT"];
export const bindInfo = (v) => { ({ ctx, COLS, LCOLS, frame } = v); };
const dC=(x,y,r,c,f=1)=>{ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(f){ctx.fillStyle=c;ctx.fill()}else{ctx.strokeStyle=c;ctx.stroke()}};
const dL=(x1,y1,x2,y2,c,w=2)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
const dT=(s,x,y,c='#fff',z=14)=>{ctx.fillStyle=c;ctx.font='bold '+z+'px monospace';ctx.textAlign='center';ctx.fillText(s,x,y)};
const fig=(x,y,c,core=1)=>{dC(x,y,14,'#222');ctx.lineWidth=3;dC(x,y,14,c,0);if(core)dC(x,y,3,'#fff')};
/** Pages; the item pages are built from the item catalog (6 per page). */
export const buildInfo = (I) => { ITEMS = I; return [
 {t:'Goal',l:['Knock out the other fighters!','Each fighter has LIVES (1 to 99, set in the menu).','You lose a life when your HP reaches 0,','or when you get STREET SMASHED into a wall.','The last fighter with lives left wins.','2 to 8 fighters, humans and/or CPU.'],
  d:(t,w,h)=>{const k=t%4,a=w*.22,b=w*.75;fig(a,h/2,COLS[0]);const hp=Math.max(0,1-Math.floor(k)/3);fig(b+(k>3?(k-3)*60:0),h/2,k>3?'#fff':COLS[1]);
   if(k<3)dC(a+(b-a)*(k%1),h/2,9,COLS[0]);ctx.fillStyle='#333';ctx.fillRect(b-30,h/2-36,60,6);ctx.fillStyle='#5e5';ctx.fillRect(b-30,h/2-36,60*hp,6);if(k>3)dT('K.O.',w/2,50,'#fff',34)}},
 {t:'Moving & dashing',l:['Move with the stick or the keys.','DASH: a quick burst of speed. You have 3 charges (white bars).','Charges refill slowly, twice as fast when you are not shooting.','Grazing refills a little, a successful parry refills a full charge.','Hold DASH after a dash to RUN. You can steer a dash while it moves.'],
  d:(t,w,h)=>{const k=t%1.5,x=w*.2+w*.6*((t%3)/3),y=h/2+Math.sin(t*2)*30;if(k<.3)for(let i=1;i<5;i++){ctx.globalAlpha=.5-i*.1;ctx.lineWidth=2;dC(x-i*14,y,14,COLS[0],0)}ctx.globalAlpha=1;fig(x,y,COLS[0]);
   for(let i=0;i<3;i++){ctx.fillStyle=i<3-Math.floor(k/.5)?'#fff':'#555';ctx.fillRect(w/2-48+i*34,h-30,28,6)}dT('dash charges',w/2,h-40,'#aaa',12)}},
 {t:'Focus & your core',l:['Hold FOCUS: you move slowly and precisely, your shots get tighter.','Your small white CORE is the ONLY part bullets can hit.','Melee attacks hit your whole BODY (the circle).','Focus while moving fast = instant BRAKE.'],
  d:(t,w,h)=>{fig(w*.3,h/2,COLS[1]);dT('normal',w*.3,h/2+44,'#aaa',12);fig(w*.7,h/2,COLS[1]);ctx.lineWidth=1;dC(w*.7,h/2,22,'rgba(255,255,255,.5)',0);dC(w*.7,h/2,4.5,'#fff');dT('FOCUS',w*.7,h/2+44,'#aaa',12);
   for(let i=0;i<6;i++)dC(w*.7+(i%2?10:-10),(t*120+i*60)%h,4,LCOLS[0]);dT('bullets only hit the white core',w/2,28,'#fff',13)}},
 {t:'Advanced movement',l:['SLIDE (wavedash): Focus+Dash, or Focus during / right after a dash.','The slide goes where your stick points, and you can act during it.','PIVOT: reverse direction while running to turn around instantly.','WALL KICK: dash into a wall to bounce off it (refunds half a charge).','Heavy shots push you back: shooting AWAY gives a big recoil jump.'],
  d:(t,w,h)=>{const k=t%2.4;let x;if(k<.4)x=w*.45+k/.4*w*.3;else x=w*.75-Math.min(1,(k-.4)/1.4)*w*.55;
   if(k<.4){for(let i=1;i<4;i++){ctx.globalAlpha=.4-i*.1;ctx.lineWidth=2;dC(x-i*16,h/2,14,COLS[2],0)}ctx.globalAlpha=1;dT('DASH',x,h/2-28,'#fff',13)}
   else if(k<1.8){dL(x,h/2,x+44,h/2,'rgba(255,255,255,.6)',3);dT('SLIDE',x,h/2-28,'#fff',13)}fig(x,h/2,COLS[2])}},
 {t:'Light & heavy shots',l:['SHOT: light bullets. Chip damage and NO hitstun.','HEAVY: big bullets. They cause HITSTUN, which opens combos.','Heavy bullets arm after a short distance: point-blank they can\'t hurt.','Two heavy bullets that meet cancel each other out (CLASH).'],
  d:(t,w,h)=>{const ax=w*.15,bx=w*.85,y1=h*.3,y2=h*.72;fig(ax,y1,COLS[0]);fig(bx,y1,COLS[1]);for(let i=0;i<5;i++)dC(ax+((t*300+i*70)%(bx-ax)),y1,4,LCOLS[0]);dT('light: chip, no stun',w/2,y1-26,'#ccc',12);
   const k=t%2,x=ax+(bx-ax)*Math.min(1,k/1.4),arm=Math.min(1,(x-ax)/90),hk=k>1.4;fig(ax,y2,COLS[0]);fig(bx+(hk?(k-1.4)*80:0),y2,hk?'#fff':COLS[1]);
   if(!hk){ctx.lineWidth=2;dC(x,y2,11*(.35+.65*arm),COLS[0],arm>=1)}dT('heavy: arms, then HITSTUN',w/2,y2-26,'#ccc',12)}},
 {t:'Directions',l:['Heavy shots and melee change with your stick,','relative to your opponent:','  toward = fast   ·   neutral = standard   ·   away = slow and big.','You always aim at the nearest opponent automatically.'],
  d:(t,w,h)=>{const x=w*.18,y=h/2,k=t%1.6;fig(x,y,COLS[0]);fig(w*.88,y,COLS[1]);[[-70,11,8,'toward'],[0,7,11,'neutral'],[70,3.5,17,'away']].forEach(([dy,sp,r,n])=>{const bx=x+24+k*sp*40;dC(bx,y+dy,r,COLS[0]);dT(n,bx,y+dy-r-6,'#aaa',11)})}},
 {t:'Shot types & power',l:['4 shot types: Spread, Needles, Amulets, Barrage (Prev / Next shot).','Each type changes your light shots, your heavy shots AND your melee.','POWER (P, 1 to 4) rises when you graze and drops when you get hit.','More power = bigger patterns and more damage.'],
  d:(t,w,h)=>{const ty=Math.floor(t/2)%4,k=t%2,x=w*.12,y=h/2;fig(x,y,COLS[0]);dT(SHOTS[ty].name,w/2,28,'#ffd23a',16);
   for(let j=0;j<4;j++){const d=((k*1.5+j*.35)%1.4)*w*.55;
    if(ty===0)for(const a of[-.3,-.15,0,.15,.3])dC(x+20+d*Math.cos(a),y+d*Math.sin(a),4,LCOLS[0]);
    if(ty===1)for(const o of[-6,0,6])dC(x+20+d,y+o,3,LCOLS[0]);
    if(ty===2)for(const sd of[-1,1])dC(x+20+d,y+sd*Math.sin(d/w*Math.PI*1.6)*h*.3,5,LCOLS[0]);
    if(ty===3)for(let i=-2;i<=2;i++)dC(x+20+d*.6,y+i*16,5,LCOLS[0])}}},
 {t:'Melee',l:['JAB: melee button. LUNGE: melee + push toward the opponent.','STRONG: Focus + hold melee, release to strike (charge for more).','DASH ATTACK: melee during a dash, keeps your momentum.','Spread: basic set · Needles: fast, long reach, multi-hit','Amulets: wide, pulls, 360° spins · Barrage: heavy, shockwave'],
  d:(t,w,h)=>{const k=t%1.6,ax=w*.35+(k<.3?k/.3*30:30),y=h/2,hk=k>.35&&k<.6;fig(ax,y,COLS[3]);fig(w*.62+(k>.35?Math.min(1,(k-.35)*3)*60:0),y,hk?'#fff':COLS[1]);
   if(hk){ctx.globalAlpha=.4;ctx.fillStyle=COLS[3];ctx.beginPath();ctx.moveTo(ax,y);ctx.arc(ax,y,64,-.7,.7);ctx.closePath();ctx.fill();ctx.globalAlpha=1}}},
 {t:'Graze',l:['Brush bullets with your core without being hit = GRAZE. Your light shots that hit also fill the gauge a little.','Each graze fills your spell card gauge, a bit of dash and power.','Heavy bullets count double.','So zoning feeds your opponent: they graze it to fight back!'],
  d:(t,w,h)=>{const x=w/2+Math.sin(t*3)*24,y=h*.68;fig(x,y,COLS[0]);for(let i=0;i<7;i++){const by=(t*160+i*45)%h,bx=w/2+(i%2?28:-28);dC(bx,by,4,LCOLS[1]);
   if(Math.abs(by-y)<16&&Math.abs(bx-x)<28){const a=Math.atan2(by-y,bx-x);ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(x,y,26,a-.4,a+.4);ctx.stroke()}}
   ctx.fillStyle='#6af';ctx.fillRect(20,20,(t*40)%(w-40),6);dT('spell card gauge',w/2,44,'#6af',12)}},
 {t:'Parry',l:['PARRY: a short window. Press it right before a hit lands.','Heavy bullets bounce back 1.3x faster each time,','slightly homing toward the shooter.','Parry a melee hit: the attacker is stunned, punish them!','Miss it: long recovery, you are open.'],
  d:(t,w,h)=>{const k=t%2.4,ax=w*.15,bx=w*.8,y=h/2;fig(ax,y,COLS[1]);fig(bx,y,COLS[0]);const x=k<1.2?ax+(bx-ax)*k/1.2:bx-(bx-ax)*Math.min(1,(k-1.2)/.6);
   dC(x,y,11,k<1.2?COLS[1]:COLS[0]);if(k>1.05&&k<1.4){ctx.lineWidth=4;dC(bx,y,30,'#6ff',0);dT('PARRY!',bx,y-42,'#6ff',18)}}},
 {t:'Getting hit',l:['Heavy hits launch you, farther when your HP is low.','DI: hold a direction to bend your launch angle.','During the hit freeze, tap a direction to nudge yourself (SDI).','TECH: press Dash or Parry right before you hit a wall.','Combos weaken with each hit, so they always end.'],
  d:(t,w,h)=>{const k=t%2,x0=w*.3,y0=h*.65;fig(w*.15,y0,COLS[0]);const d=Math.min(1,k/1.2)*w*.5;dL(x0,y0,x0+w*.5,y0,'rgba(255,255,255,.2)',2);
   dL(x0,y0,x0+w*.5*Math.cos(-.35),y0+w*.5*Math.sin(-.35),'rgba(108,255,255,.4)',2);fig(x0+d*Math.cos(-.35),y0+d*Math.sin(-.35),'#fff');dT('DI bends the launch',w/2,30,'#6ff',13)}},
 {t:'Burst',l:['BURST (orange gauge): refills slowly, faster when you get hit.','It pushes everyone away and breaks a combo.','Used in neutral and it connects = spell card gauge bonus.','If it hits nobody: long recovery.'],
  d:(t,w,h)=>{const k=t%2,x=w*.45,y=h/2;fig(x,y,COLS[1]);if(k<.8){ctx.lineWidth=5;dC(x,y,Math.min(1,k/.4)*90,'#fc4',0)}fig(x+40+(k>.2?Math.min(1,(k-.2)*3)*120:0),y,COLS[0]);dT('BURST',x,40,'#fc4',22)}},
 {t:'Spell cards',l:['SPELL CARD: needs a full spell card gauge (blue bar, pink when full).','Your fighter declares it and fires a big pattern for 5 s.','Hit the caster with a heavy shot = SPELL BREAK.','Survive it without getting hit = SPELL CAPTURED (+gauge).'],
  d:(t,w,h)=>{const x=w/2,y=h/2+10;fig(x,y,COLS[0]);for(let i=0;i<40;i++){const a=i*.4+t*.8,r=(t*60+i*12)%200;dC(x+Math.cos(a)*r,y+Math.sin(a)*r,4,LCOLS[0])}
   ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(10,10,w-20,26);dT(SPELLS[0].name,w/2,28,'#fff',14)}},
 {t:'Walls & red zone',l:['The RED ZONE along the walls slowly drains your HP.','Each heavy hit you take there breaks a WALL PIP (3 pips).','0 pips + slammed into a wall = STREET SMASH: you lose a life.','Pips NEVER come back until you lose a life: the KO beam can wear down a foe\'s defense even after you died.'],
  d:(t,w,h)=>{ctx.fillStyle='rgba(255,60,70,.15)';ctx.fillRect(w-70,0,70,h);dL(w-2,0,w-2,h,'#d33',4);const n=Math.min(3,Math.floor((t%3)/.8)),x=w-40;fig(w*.4,h/2,COLS[0]);fig(x,h/2,n<3?COLS[1]:'#fff');
   for(let i=0;i<3;i++){ctx.fillStyle=i<3-n?'#f55':'#422';ctx.fillRect(x-24+i*16,h/2-36,12,6)}if(n>=3)dT('STREET SMASH!',w/2,40,'#fff',22)}},
 {t:'KO beam',l:['When you lose a life, a beam charges where you died.','For 2 seconds, aim it with your stick (a dashed line shows it).','Then it fires: big damage and a big launch.','It can be parried: parry when "PARRY NOW!" flashes (a bit early is fine).'],
  d:(t,w,h)=>{const k=t%3,x=w*.12,y=h*.75,a=-.45+Math.sin(t*1.5)*.25;fig(w*.75,h*.35,COLS[1]);
   if(k<2){ctx.setLineDash([14,10]);dL(x,y,x+Math.cos(a)*w,y+Math.sin(a)*w,COLS[0],2+k*3);ctx.setLineDash([]);dT('AIM ('+Math.ceil(2-k)+')',w/2,30,COLS[0],14)}
   else{ctx.globalAlpha=1-(k-2);ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=COLS[0];ctx.fillRect(0,-30,w*1.3,60);ctx.restore();ctx.globalAlpha=1}}},
 {t:'The center card',l:['Items ON: a card every 7 s, and the LAST WORD card every 35 s.','Stand on it for 1 s to take it (blocked if 2+ fighters are on it).','Getting hit resets your progress.','Items OFF: only the LAST WORD card, every 35 s.','The card\'s color tells you which item it is.'],
  d:(t,w,h)=>{const x=w/2,y=h/2,k=t%3;ctx.lineWidth=2;dC(x,y,44,'#ffe23a',0);ctx.fillStyle='#ffe23a';ctx.fillRect(x-7,y-10,14,20);fig(x-(k<1.5?0:60),y+(k<1.5?0:10),COLS[0]);
   if(k<1.5){ctx.lineWidth=4;ctx.strokeStyle=COLS[0];ctx.beginPath();ctx.arc(x,y,50,-Math.PI/2,-Math.PI/2+TAU*k/1.5);ctx.stroke()}else{fig(x+50,y,COLS[1]);dT('CONTESTED',x,y-62,'#fff',14)}}},
 ...Array.from({length:Math.ceil(ITEMS.length/6)},(_,n)=>{const L=ITEMS.slice(n*6,n*6+6);return{it:L,t:'Items ('+(n+1)+'/'+Math.ceil(ITEMS.length/6)+')',l:L.map(i=>i.name+(i.ch?' ('+i.ch+')':'')+': '+i.d),
  d:(t,w,h)=>{L.forEach((it,i)=>{const cx=w*(.2+(i%3)*.3),cy=h*(i<3?.3:.7);ctx.fillStyle=it.c==='rainbow'?`hsl(${t*360%360},100%,65%)`:it.c;ctx.fillRect(cx-10,cy-16,20,32);dT(it.name,cx,cy+36,'#ccc',13);if(it.ch)dT(it.ch,cx,cy+52,'#888',11);dT('▶ TEST',cx,cy-24,'#6ff',11)});dT('click a card to TEST it',260,330,'#6ff',12)}}}),
 {t:'Elements & reactions',l:['Items carry ELEMENTS. While an item is active, your bullets and attacks take its element (shown under your fighter). Without an active item, your attacks are neutral.','A hit leaves an elemental AURA on the target (small colored arc). The next hit with ANOTHER element triggers a REACTION. Two bullets of different elements that meet also react, and so do bullets hitting elemental things (snowflakes, fire, puddles, trees...).',...Object.entries(RX).map(([k,v])=>ELN9[k/10|0]+' + '+ELN9[k%10]+' = '+v[0])],
  d:(t,w,h)=>{for(let i=1;i<10;i++){const a=i*TAU/9+t*.3;dC(w/2+Math.cos(a)*110,h/2+Math.sin(a)*110,16,ELC9[i]);dT(ELN9[i],w/2+Math.cos(a)*110,h/2+Math.sin(a)*110+32,ELC9[i],11)}dT('REACTION!',w/2,h/2,ELC9[1+(t|0)%9],22)}},
 {t:'Options',l:['Menu: fighters, humans, lives, map, items, effects.','Effects REDUCED: much softer flashes, shakes and distortions.','Controls: rebind 2 keyboards and up to 4 gamepads.','Burst has its own button (pad: Y). Spell: LB+RB together. Hold Parry + Attack = Grab, Hold Parry + Heavy = Breaker. Mouse: aim with the cursor, left = Attack, right = Heavy, middle = Parry.','CPU level 1 to 9. Level 9 is superhuman: no cheating, just inhuman reflexes.','Esc / Start: pause · F2: debug view.'],
  d:(t,w,h)=>{dT('SHMUP FIGHTER',w/2,h/2,`hsl(${t*60%360},80%,70%)`,26)}}]; };
