'use strict';
// ================= Menus (clavier, souris, manette) =================
let nP=2,nH=1,cpuLv=5,maxC=1,CARDS=[],TEAMS=false,NERV=10;let TEAMA,TCOL,TNAME;DEFER(()=>{TEAMA=Array.from({length:32},(_,i)=>i%2);TCOL=['#ff4a4a','#4a8aff','#ffd23a','#5cff8a'];TNAME=['RED','BLUE','YELLOW','GREEN']});
const teamTxt=n=>{if(!TEAMS)return 'OFF (free for all)';const g={};for(let i=0;i<n;i++)(g[TEAMA[i]]=g[TEAMA[i]]||[]).push('P'+(i+1));const v=Object.values(g);return v.length<2?'ON - all in the same team! (= free for all)':v.map(x=>x.join('+')).join(' vs ')};
const TEAMM=()=>[{t:()=>'Teams: '+(TEAMS?'ON':'OFF')+'  ◀ ▶',lr:()=>{TEAMS=!TEAMS;saveOpts()}}].concat([0,1,2,3,4,5,6,7].filter(i=>i<Math.max(2,nP)).map(i=>({t:()=>'P'+(i+1)+' team: '+TNAME[TEAMA[i]]+'  ◀ ▶',lr:d=>{TEAMA[i]=(TEAMA[i]+d+4)%4;TEAMS=true;saveOpts()}})),[{t:()=>'Preset 2 teams of 4 (8 players)',f:()=>{TEAMA.splice(0,8,0,1,0,1,0,1,0,1);TEAMS=true;saveOpts()}},{t:()=>'Preset 4 teams of 2 (8 players)',f:()=>{TEAMA.splice(0,8,0,0,1,1,2,2,3,3);TEAMS=true;saveOpts()}},{t:()=>'Preset 2v2: P1+P3 vs P2+P4',f:()=>{TEAMA.splice(0,4,0,1,0,1);TEAMS=true;saveOpts()}},{t:()=>'Preset 2v2: P1+P2 vs P3+P4',f:()=>{TEAMA.splice(0,4,0,0,1,1);TEAMS=true;saveOpts()}},{t:()=>'Preset 1v3: P1 vs everyone',f:()=>{TEAMA.splice(0,4,0,1,1,1);TEAMS=true;saveOpts()}},{t:()=>'Preset 1v2: P1 vs P2+P3',f:()=>{TEAMA.splice(0,4,0,1,1,2);TEAMS=true;saveOpts()}}]);let STOCKS;DEFER(()=>{STOCKS=Array.from({length:99},(_,i)=>i+1)});
const kP=()=>.6+.04*NERV,kB=()=>.5+.05*NERV,kS=()=>.6+.04*NERV,kV=()=>(.35+.065*NERV)*ACC.shk; // tempo : 0 = calme, 10 = nerveux
const MENU=[{t:()=>'FIGHT!',f:()=>start('game')},{t:()=>'ONLINE (2-8 players)',f:()=>onlOpen()},{t:()=>'TRAINING',f:()=>trainStart()},
 {t:()=>'Mode: '+(COMP?'COMPETITIVE (4 lives, 5 min, no items)':'CASUAL')+'  ◀ ▶',lr:()=>{COMP=!COMP;try{localStorage.setItem('sf_comp',COMP?1:0)}catch(e){}}},
 {t:()=>'Fighters: '+nP+'  ◀ ▶',lr:d=>{nP=clamp(nP+d,2,8);nH=Math.min(nH,nP)}},
 {t:()=>'Humans: '+nH+'  (CPU: '+(nP-nH)+')  ◀ ▶',lr:d=>{nH=clamp(nH+d,0,nP)}},
 {t:()=>'CPU level: '+cpuLv+(cpuLv===9?' (SUPERHUMAN)':'')+'  ◀ ▶',lr:d=>{cpuLv=clamp(cpuLv+d,1,9)}},
 {t:()=>'Lives: '+STOCKS[stI]+'  ◀ ▶',lr:d=>{stI=clamp(stI+d,0,STOCKS.length-1)}},
 {t:()=>'Timer: '+(TIMER?TIMER+' min':'OFF')+'  ◀ ▶',lr:d=>{TIMER=(TIMER+d+100)%100;try{localStorage.setItem('sf_timer',TIMER)}catch(e){}}},
 {t:()=>'Map: '+(ALLM()[mapI]||MAPS[0]).name+'  ◀ ▶',lr:d=>{const n=ALLM().length;mapI=((mapI|0)+d+n)%n}},
 {t:()=>'Map maker…',f:()=>openSub('MAP MAKER',MAPM)},
 {t:()=>'Items: '+(itemsOn?'ON':'OFF (card = Last Word)')+'  ◀ ▶',lr:()=>{itemsOn=!itemsOn}},
 {t:()=>'Cards at once: '+maxC+'  ◀ ▶',lr:d=>{maxC=clamp(maxC+d,1,64)}},
 {t:()=>'Teams: '+teamTxt(nP)+'  (Enter: edit)',lr:()=>{TEAMS=!TEAMS},f:()=>openSub('TEAMS',TEAMM)},
 {t:()=>'Tempo: '+NERV+'/10 '+(NERV<4?'(calm)':NERV<8?'(relaxed)':'(frantic)')+'  ◀ ▶',lr:d=>{NERV=clamp(NERV+d,0,10)}},
 {t:()=>'Item list…',f:()=>{mode='items';itemSel=0}},
 {t:()=>'Effects: '+(fxOff?'OFF (epilepsy safe)':fxLow?'REDUCED (sensitive)':'FULL')+'  ◀ ▶',lr:d=>{const v=((fxOff?2:fxLow?1:0)+((d|0)<0?2:1))%3;fxLow=v>0;fxOff=v===2;try{localStorage.setItem('sf_fxoff',fxOff?1:0)}catch(e){}}},
 {t:()=>'Sound…',f:()=>openSub('SOUND',SOUNDM)},
 {t:()=>'Profiles…',f:()=>openSub('PROFILES',PROFM)},
 {t:()=>'Controls',f:()=>{mode='binds';bind.wait=false}},
 {t:()=>'How to play (tutorial)',f:()=>tutStart()},
 {t:()=>'Guide',f:()=>{mode='info';infoP=0}}];
function arrowMid(tx){const i=tx.lastIndexOf('◀'),fw=ctx.measureText(tx).width;if(i<0)return W/2;const x0=W/2-fw/2+ctx.measureText(tx.slice(0,i)).width;return x0+ctx.measureText('◀ ').width}
function saveOpts(){try{localStorage.setItem('sf_opts',JSON.stringify({nP,nH,stI,mapI,itemsOn,fxLow,itemOn,cpuLv,maxC,TEAMS,TEAMA,NERV}))}catch(e){}}
function loadOpts(){try{const o=JSON.parse(localStorage.getItem('sf_opts'));if(o){({nP,nH,stI,mapI,itemsOn,fxLow}=o);if(o.cpuLv)cpuLv=o.cpuLv;if(o.maxC)maxC=o.maxC;if(o.TEAMS!==undefined)TEAMS=o.TEAMS;if(Array.isArray(o.TEAMA))o.TEAMA.forEach((t,i)=>{if(i<8)TEAMA[i]=t&3});if(o.NERV!==undefined)NERV=o.NERV;Object.assign(itemOn,o.itemOn||{})}}catch(e){}}
function nav(ev){
 if(mode==='menu'){
  if(ev==='up'||ev==='down'){menuSel=(menuSel+(ev==='up'?MENU.length-1:1))%MENU.length;sfx('se_select00',.6)}
  if((ev==='left'||ev==='right')&&MENU[menuSel].lr){MENU[menuSel].lr(ev==='left'?-1:1);sfx('changemenu',.8);saveOpts()}
  if(ev==='ok'){sfx('ok00');const it=MENU[menuSel];it.f?it.f():(it.lr(1),saveOpts())}return}
 if(mode==='items'){const n=ITEMS.length,pg=itemSel/16|0,j=itemSel%16,col=j>=8,row=j%8,np=Math.ceil(n/16),at=(p,c,r)=>Math.min(n-1,((p+np)%np)*16+(c?8:0)+r);
  if(ev==='up'||ev==='down'){let r=(row+(ev==='up'?7:1))%8;while(at(pg,col,r)!==pg*16+(col?8:0)+r&&r>0)r--;itemSel=at(pg,col,r);sfx('se_select00',.6)} // grille 2 colonnes
  if(ev==='left'){itemSel=col?at(pg,0,row):at(pg-1,1,row);sfx('se_select00',.6)}if(ev==='right'){itemSel=!col&&pg*16+8+row<n?at(pg,1,row):at(pg+1,0,row);sfx('se_select00',.6)}
  if(ev==='tabL'||ev==='tabR'){itemSel=at(pg+(ev==='tabL'?-1:1),0,0);sfx('se_select00',.6)}
  if(ev==='ok'){const k=ITEMS[itemSel].k;itemOn[k]=!itemOn[k];sfx('se_changeitem',.6);saveOpts()}
  if(ev==='reset'){const all=ITEMS.every(i=>itemOn[i.k]);ITEMS.forEach(i=>itemOn[i.k]=!all);sfx('se_changeitem',.6);saveOpts()}
  if(ev==='back'){mode='menu';sfx('cancel00')}return}
 if(mode==='info'){if(ev==='back'){mode='menu';sfx('cancel00');return}
  if(ev==='up'||ev==='down'){infoScr=clamp(infoScr+(ev==='up'?-60:60),0,infoMax);return} // haut/bas : défiler le texte
  if(ev==='left')infoP=(infoP+INFO.length-1)%INFO.length;if(ev==='right'||ev==='ok')infoP=(infoP+1)%INFO.length;infoScr=0;sfx('se_select00',.6);return}
 if(mode==='binds'&&(ev==='tabL'||ev==='tabR')&&!bind.wait){togMouse();return}
 if(mode==='binds'){if(bind.wait)return;const n=ACTS.length;
  if(ev==='up'||ev==='down'){bind.row=(bind.row+(ev==='up'?n-1:1))%n;sfx('se_select00',.6)}
  if(ev==='left'||ev==='right'){bind.col=(bind.col+(ev==='left'?5:1))%6;sfx('se_select00',.6)}
  if(ev==='ok'&&!(bind.col>=2&&bind.row<4)){bind.wait=true;bind.pv=null;bind.combo=[];sfx('ok00')}
  if(ev==='reset'){resetBinds();saveBinds();sfx('cancel00')}
  if(ev==='back'){mode='menu';sfx('cancel00')}return}
 if(paused&&TEST&&TEST.train){const T2=TEST,L=GAMES[T2.tab][1].filter(k=>ITEMS.some(i=>i.k===k)); // navigation du menu d'entraînement
  {const n=L.length,c=T2.i%4,tab=d=>{T2.tab=(T2.tab+d+GAMES.length)%GAMES.length;return GAMES[T2.tab][1].filter(k=>ITEMS.some(i=>i.k===k)).length};
   if(ev==='tabL'||ev==='tabR'){tab(ev==='tabL'?-1:1);T2.i=0}
   if(ev==='left'){if(c===0){const m=tab(-1);T2.i=Math.min(m-1,(T2.i-c)+3)}else T2.i--}
   if(ev==='right'){if(c===3||T2.i>=n-1){const m=tab(1);T2.i=Math.min(m-1,T2.i-c)}else T2.i++}
   if(ev==='up')T2.i=T2.i>=4?T2.i-4:Math.min(n-1,c+4*Math.floor((n-1-c)/4));if(ev==='down')T2.i=T2.i+4<n?T2.i+4:c;T2.i=Math.max(0,T2.i)}
  if(ev==='ok'&&L[T2.i]){T2.k=L[T2.i];const p=P.find(q=>!q.cpu);if(p&&p.state!=='dead')give(p,T2.k);paused=false}if(ev==='back')paused=false;sfx('se_select00',.5);return}
 if(paused){if(ev==='ok'){paused=false;sfx('ok00')}if(ev==='back'){paused=false;mode='menu';sfx('cancel00')}return}
 if(winner>=0&&winT>=100){if(ev==='ok')start(mode);if(ev==='reset')startReplay();if(ev==='back'){mode='menu';sfx('cancel00')}}}
const padNav={prev:{},next:0};
function pollNav(){const g=pads()[0];if(!g)return;const now=performance.now(),bt=n=>g.buttons[n]&&g.buttons[n].pressed,ax=g.axes[0]||0,ay=g.axes[1]||0;
 const s={up:bt(12)||ay<-.6,down:bt(13)||ay>.6,left:bt(14)||ax<-.6,right:bt(15)||ax>.6,ok:bt(0),back:bt(1),reset:bt(3),start:bt(9),sel:bt(8),tabL:bt(4),tabR:bt(5)};
 for(const k in s){const dir=k.length<6&&/up|down|left|right/.test(k);
  if(s[k]&&!padNav.prev[k]){if(dir)padNav.next=now+380;padEv(k)}else if(s[k]&&dir&&now>=padNav.next){padNav.next=now+140;padEv(k)}}
 padNav.prev=s}
function padEv(k){
 if(MODEX[mode]){nav(k);return} // declared modes (engine/modes.js) get every pad/touch event
 if(mode==='binds'&&bind.wait)return;
 if(k==='start'&&mode==='items'){testItem(ITEMS[itemSel].k);return}
 if(k==='start'||k==='sel'){if(mode==='menu'){sfx('ok00');start('game')}else if(mode!=='binds'){if(winner>=0){if(winT>=100)start(mode)}else{paused=!paused;sfx(paused?'cancel00':'ok00')}}return}
 if(mode!=='game'||paused||winner>=0)nav(k)}
const hotAt=(x,y)=>hot.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
const MOUSE={x:0,y:0,b:{},t:-1e9},MVIEW={};let MOUSEON=false;DEFER(()=>{try{MOUSEON=localStorage.getItem('sf_mouse')==='1'}catch(e){}}); // souris en jeu : désactivée par défaut (option) // souris : le curseur vise · gauche = mêlée · droite = gros danmaku · milieu = parry
DEFER(()=>{addEventListener('mousemove',e=>{MOUSE.x=e.clientX;MOUSE.y=e.clientY;if(mode==='game'&&!paused)MOUSE.t=performance.now();const h=hotAt(e.clientX,e.clientY);if(h)h.hover()});});
DEFER(()=>{addEventListener('mousedown',e=>{unlock();if(mode==='binds'&&bind.wait&&bind.col<2){KB[bind.col][ACTS[bind.row]]='Mouse'+e.button;bind.wait=false;saveBinds();sfx('ok00');return}if(mode==='game')keys.add('Mouse'+e.button);MOUSE.x=e.clientX;MOUSE.y=e.clientY;if(MOUSEON&&mode==='game'&&!paused&&!(TEST&&TEST.train&&paused)){MOUSE.b[e.button]=1;MOUSE.t=performance.now();if(!hotAt(e.clientX,e.clientY))return}if(mode==='binds'&&bind.wait)return;const h=hotAt(e.clientX,e.clientY);if(h){h.hover();h.click(e.clientX,e.clientY)}});});
DEFER(()=>{addEventListener('mouseup',e=>{MOUSE.b[e.button]=0;keys.delete('Mouse'+e.button)});});
DEFER(()=>{addEventListener('wheel',e=>{const c=e.deltaY<0?'WheelUp':'WheelDown';if(mode==='binds'&&bind.wait&&bind.col<2){KB[bind.col][ACTS[bind.row]]=c;bind.wait=false;saveBinds();sfx('ok00');return}if(mode==='game')tapQ.add(c)},{passive:true});});
DEFER(()=>{addEventListener('contextmenu',e=>{if(mode==='game')e.preventDefault()});});DEFER(()=>{addEventListener('contextmenu',e=>{if(mode==='game')e.preventDefault()});});
function mkP(id,x,y){return{id,x,y,vx:0,vy:0,hp:T.HP,stocks:STOCKS[stI],blade:0,bA:0,bCD:[],rifle:0,bombs:0,ult:0,ultS:false,rsrc:null,spirit:0,boost:T.DASH_CHARGES,dashCd:0,slide:0,shotT:0,power:1,graze:0,run:false,pStart:-99,pChain:0,pLast:-999,gStreak:0,gLast:-99,spReady:0,kicked:false,noSteer:0,carry:0,pips:T.PIPS,edgeOut:0,
 state:'idle',t:0,mv:null,mvName:'',hitDone:false,charge:0,charging:false,atkA:0,combo:0,comboN:0,comboT:0,inv:60,techBuf:0,
 shotCd:0,focus:false,kbx:0,kby:0,diPend:false,koPend:false,buff:null,buffT:0,flash:0,aim:0,cpu:false,prev:{},
 burst:T.BURST_MAX,bGold:false,bHit:false,spellHit:false,
 mirror:0,giant:0,clone:0,spk:0,spkA:0,star:0,cam:0,fx:{},histBuf:[],posBuf:[],inCloud:false,eaten:0,qiBank:0,eyeCD:{},burn:0,pois:0,sleep:0,sins:0,frozen:0,vuln:0,lily:0,dark:0,dmgDealt:0,slotT:0,slotMsgT:0,
 in:{x:0,y:0,b:{}},ai:{di:[0,0],diSet:0}}}
function start(m){mode=m;seed=(Date.now()%100000)|1;const M=ALLM()[mapI]||MAPS[0];fixedMap=!M.w;CMAP=M.walls?M:null;WARP=0;ultT=0;TSTOP=0;FRZ=null;HOLES=[];BUMPS=[];PHOTO=[];GFX=[];ENT=[];SLASH=[];JUDG=[];CLOUDS=[];ECHO=[];THR=[];CX={};KOB=[];ORBS=[];FAIRIES=[];ZONES=[];stopLoad();sDmg=sGraze=sKira=sBrk=-99;CRACK=[];GZ=[];BIG=[];chroma=bright=focusL=zblur=0;borderF={t:0};bgF={t:0};T.MAP_W=M.w||Math.round(W/SC);T.MAP_H=M.h||T.VIEW_H;T.EDGE=M.edge;kx=ky=0;P=[];for(let i=0;i<nP;i++){const a=Math.PI+i/nP*TAU;P.push(mkP(i,T.MAP_W/2+Math.cos(a)*300,T.MAP_H/2+Math.sin(a)*Math.min(300,T.MAP_H*.3)));P[i].cpu=i>=nH}
 B=[];FX=[];TX=[];RINGS=[];LOG=[];KOFX=[];WAVES=[];LINES=[];invF=0;hitstop=0;shake=0;slow=0;zk=0;flashS=0;item=null;CARDS=[];itemT=0;winner=-1;winT=0;paused=false;frame=0;
 for(const p of P){cams[p.id].x=p.x;cams[p.id].y=p.y}log('start '+m)}
function onKey(c){
 unlock();
 if(mode==='binds'&&bind.wait){if(c==='Escape'){bind.wait=false;sfx('cancel00')}else if(bind.col<2){KB[bind.col][ACTS[bind.row]]=c;bind.wait=false;saveBinds();sfx('ok00')}return}
 if(mode==='menu'){if(c==='Digit1'||c==='Numpad1'){menuSel=0;nav('ok');return}}
 const ev={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'ok',Space:'ok',Escape:'back',Backspace:'reset',PageUp:'tabL',PageDown:'tabR',KeyQ:'tabL',KeyE:'tabR',Delete:'reset'}[c];
 if(mode==='items'&&c==='KeyT'){testItem(ITEMS[itemSel].k);return}
 if(mode!=='game'){if(ev)nav(ev);return}
 if(paused&&TEST&&TEST.train&&ev&&c!=='Escape'){nav(ev);return}
 if(c==='F2')debug=!debug;
 if(c==='Escape'&&winner<0){paused=!paused;sfx(paused?'cancel00':'ok00')}
 if((paused||winner>=0)&&c==='KeyM'){if(NET)onlClose();mode='menu';paused=false;sfx('cancel00')}
 if(winner>=0&&winT>=100&&!NET&&(c==='Enter'||c==='KeyR'))start(mode);if(winner>=0&&winT>=100&&!NET&&c==='KeyV')startReplay()}
