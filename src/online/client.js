'use strict';
// ---- client
function onlJoin(){if(!ONL)return;txtInput('ROOM CODE FROM YOUR FRIEND','',5,c=>{if(c&&ONL)onlJoin2(c.toUpperCase())},{up:true,allow:/^[A-Z0-9]$/,hint:'5 letters / digits'})}
async function onlJoin2(c){if(!ONL)return;ONL.st='join';ONL.code=c;onlLog('Connecting to '+c+'...');
 const p=await onlPeer();if(!ONL)return p&&p.destroy();if(!p){ONL.st='idle';return}ONL.peer=p;const cn=p.connect('shmupf-'+c,{reliable:false,serialization:'json'});ONL.conn=cn;
 const ping=[];cn.on('open',()=>{onlLog('Connected, waiting for the host...');try{cn.send({t:'nick',n:nickOf()});cn.send({t:'ch',c:myCh()});if(MYPIC)cn.send({t:'pic',v:MYPIC})}catch(e){} /* the host (and through it everyone) gets the joiner's picture at once */});
 cn.on('data',m=>{if(!m||!m.t||!ONL)return;if(m.t==='p0'){try{cn.send({t:'q0',s:m.s})}catch(e){}return}if(m.t==='q0'){ping.push(performance.now()-m.s);if(ping.length>12)ping.shift();ONL.rtt=medR(ping);return}
  if(m.t==='full'){onlLog('Room is full (32 players max online).');ONL.st='idle';return}
  if(m.t==='B'){if(NET)for(const x of m.a)netRecv(x);return}
  if(m.t==='hello'){ONL.id=m.id;ONL.st='lobbyc';try{const r=ONL.peer.connect('shmupf-'+ONL.code,{reliable:true,serialization:'json',label:'r',metadata:{rid:m.id}});ONL.rc=r;const parts=[];r.on('data',x=>{if(x&&ONL&&(x.t==='spec'||x.t==='spf')){specRecv(x);return}if(!x||x.t!=='mp'||!ONL)return;parts[x.i]=x.d;ONL.xfer={p:parts.filter(Boolean).length/x.n};if(parts.filter(v=>v!==undefined).length===x.n){const t=parts.join('');parts.length=0;ONL.xfer=null;let M;try{M=mapUnpack(JSON.parse(t),true)}catch(e){errRep('map receive',e);return}
    const ok=()=>{NETMAP=M;try{r.send({t:'mpok'})}catch(e){}onlLog('Map "'+M.name+'" received. Waiting for the host...')};if(M.js&&M.js.trim()){txtInput('THIS MAP RUNS CUSTOM CODE. TYPE YES TO ALLOW','',3,v=>{if(v&&v.toUpperCase()==='YES')ok();else{try{ONL.conn.send({t:'mpref'})}catch(e){}onlLog('You refused the map code.')}},{up:true,hint:'only accept maps from people you trust'})}else ok()}})}catch(e){}if(m.v!==NETV){onlLog('Different game versions: everyone must use the SAME file.');try{cn.send({t:'bye',why:'version'})}catch(e){}ONL.st='idle';return}onlLog('You are P'+(m.id+1)+'. Waiting for the host to start...');sfx('joined',.7);return}
  if(m.t==='go'){ONL.id=m.id;onlGo(m);return}
  if(onlMsg(m))return;
  if(m.t==='bye'){if(NET)NET.ended=true;onlLog('The host left.');if(mode!=='game'&&ONL)ONL.st='idle';return}
  if(NET)netRecv(m)});
 cn.on('close',()=>{if(NET)NET.ended=true;onlLog('Connection closed.');if(ONL&&mode!=='game')ONL.st='idle'});cn.on('error',e=>onlLog('Connection error: '+(e.type||e)));
 ONL.civ=setInterval(()=>{if(!ONL||ONL.conn!==cn){return}if(cn.open)try{cn.send({t:'p0',s:performance.now()})}catch(e){}if(NET)NET.rttC=ONL.rtt},300);
 setTimeout(()=>{if(ONL&&ONL.st==='join'){onlLog('No answer: wrong code, or the host left. Try again.');ONL.st='idle'}},15000)}
let NETV;DEFER(()=>{NETV=(()=>{let h=7;try{for(const sc of document.scripts){const t=sc.text||'';h=(h*31+t.length)|0;for(let i=0;i<t.length;i+=997)h=(h*31+t.charCodeAt(i))|0}}catch(e){}return 'v'+(h>>>0).toString(36)})()});
function netBoot(o,id){TEST=null;PGM=0;/* left over from Training / item test / playtest: its pause menu gave items locally = desync */PICS=(o.pics||[]).map(v=>typeof v==='string'&&/^data:image\//.test(v)?v:null);Object.assign(itemOn,o.itemOn||{});({mapI,itemsOn,COMP,stI,TIMER,NERV,maxC}=o);nP=o.n||2;nH=nP;TEAMS=!!o.TEAMS;if(o.TEAMA)o.TEAMA.forEach((t,i)=>TEAMA[i]=t);if(o.cm&&id&&NETMAP)mapI=MAPS.length+CMAPS.length;const dn=Date.now,w0=W,M=ALLM()[mapI]||MAPS[0];Date.now=()=>o.dn;if(!M.w&&o.mw)W=o.mw*SC;
 try{start('game')}finally{Date.now=dn;W=w0}seed=o.seed;for(const p of P)p.cpu=false;if(Array.isArray(o.chars))P.forEach((p,i)=>{const c=o.chars[i];if(c!=null&&c>=CH0&&c<CH0+CHR.length){p.shotT=c;const C=chOf(p);p.spI=C.spI;C.init&&C.init(p)}})}
function onlGo(m){const o=m.o,id=m.id;if(o.v!==NETV){onlLog('Different game versions: everyone must use the SAME file.');try{ONL.conn&&ONL.conn.send({t:'bye',why:'version'})}catch(e){}ONL.st='idle';return}
 NETNAMES=o.names||null;ONL.rdy=new Set();ONL.hostRules=0;ONL.rsel=0;netBoot(o,id);const send=id===0?(x=>{for(const o of ONL.cl)onlOb(o,x)}):(x=>{try{const c=ONL.conn;if(!c.open)return;const dc=c.dataChannel;if(dc&&dc.bufferedAmount>16000)return;c.send(x)}catch(e){}});NET=netNew(id,send,o.D,o.n);NET.g=o.g;NET.lat=o.lat;NET.rtt=id===0?Math.max(...ONL.cl.map(k=>k.rtt||100)):ONL.rtt;NET.lastMsg=performance.now();ONL.st='game';ONL.id=id;
 big('ONLINE: YOU ARE P'+(id+1),COLS[id],40);sfx('ok00')}
DEFER(()=>{{const N0=nav;nav=ev=>{if(mode!=='online')return N0(ev);const L=onlItems();if(ev==='up'){ONL.sel=(ONL.sel+L.length-1)%L.length;sfx('se_select00',.6)}else if(ev==='down'){ONL.sel=(ONL.sel+1)%L.length;sfx('se_select00',.6)}else if(ev==='ok'){const it=L[ONL.sel];if(it&&it.f)it.f();sfx('ok00')}else if(ev==='back'){const host=ONL&&ONL.id===0&&ONL.cl&&ONL.cl.length,now=performance.now();if(host&&!(ONL.qc>now)){ONL.qc=now+2500;sfx('cancel00',.6);return}onlClose();mode='menu'}}}}); /* owner: the host must press BACK twice to close a room with players */
function onlItems(){const s=ONL.st;if(s==='idle')return[{t:'HOST A MATCH',f:onlHost},{t:'JOIN WITH A CODE',f:onlJoin},{t:'YOUR NAME: '+nickOf()+'  (Enter: edit)',f:()=>txtInput('YOUR NAME (seen by everyone)',nickOf(),24,v=>{if(v){NICK=v;try{localStorage.setItem('sf_nick',v)}catch(e){}}})},{t:'FULL SCREEN: '+(document.fullscreenElement?'ON':'OFF  (Enter)'),f:goFull},chRow(),{t:'PROFILE PICTURE: '+(MYPIC?'SET (Enter: change)':'NONE (Enter: choose, 1 MB max)'),f:picPick},{t:'BACK',f:()=>{onlClose();mode='menu'}}];
 if(s==='lobby')return[{t:ONL.cl.some(k=>k.ok)?'START THE MATCH ('+(ONL.cl.filter(k=>k.ok).length+1)+' players)':'(waiting for friends...)',f:onlStart},...(ONL.cl.filter(k=>k.ok).length+1>12?[{t:'⚠ MORE THAN 12 PLAYERS: AVERAGE PCs MAY LAG',f:()=>{}}]:[]),{t:'TEAMS: '+teamTxt(Math.min(32,ONL.cl.length+1))+'  (Enter: next)',f:()=>onlNextTeams(Math.min(32,ONL.cl.length+1))},chRow(),{t:'CANCEL',f:()=>{onlClose();onlOpen()}}];
 return[chRow(),{t:'CANCEL',f:()=>{onlClose();onlOpen()}}]}
function teamParts(n){const out=[];const rec=(a,m)=>{if(a.length===n){if(m>1)out.push(a.slice());return}for(let t=0;t<=m&&t<4;t++){a.push(t);rec(a,Math.max(m,t+1));a.pop()}};rec([],0);return out}
function onlNextTeams(n){if(n<3){TEAMS=false;return}const L=teamParts(n),cur=TEAMS?TEAMA.slice(0,n).join():'';let i=L.findIndex(p=>p.join()===cur);i=(i+1)%L.length;const p=L[i];p.forEach((t,j)=>TEAMA[j]=t);TEAMS=new Set(p).size<n;saveOpts()}
// cartes des joueurs du salon (style de la sélection : bandes, photo, ping, couronne de l'hôte)
function lobCards(L){const c=ctx,t=UNOW(),n=L.length,y0=ONL&&ONL.code&&ONL.id===0?(H>=600?H*.12+152:H*.3):H<600?H*.235:H*.25,y1=H*.53-8,cols=Math.min(n,Math.max(1,Math.floor(Math.min(W*.92,1100)/Math.min(230,W*.45)))),rows=Math.ceil(n/cols),cw=Math.min(230,Math.min(W*.92,1100)/cols),ch=Math.min(66,(y1-y0)/rows-6),x0=W/2-cols*cw/2;
 c.save();L.forEach((p,i)=>{const col=COLS[p.id]||'#fff',x=x0+(i%cols)*cw+4,y=y0+(i/cols|0)*(ch+6),w=cw-8,h=ch,e=eob(clamp((t-(UISUB.t0||0)-.1-i*.05)/.4,0,1));if(ch<14)return;c.save();c.globalAlpha=e;c.translate(x+w/2,y+h/2);c.scale(.6+.4*e,.6+.4*e);
  const g=c.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'rgba(10,12,22,.95)');g.addColorStop(1,hexA(col,.28));c.fillStyle=g;skewRect(-w/2,-h/2,w,h,h*.2);c.fill();c.fillStyle=col;skewRect(-w/2,-h/2,w,4,3);c.fill();c.strokeStyle=p.me?'#fff':hexA(col,.6);c.lineWidth=p.me?2.5:1.5;skewRect(-w/2,-h/2,w,h,h*.2);c.stroke();
  const R=h*.34,px=-w/2+h*.25+R;c.save();c.beginPath();c.arc(px,0,R,0,TAU);c.fillStyle='#14161f';c.fill();c.clip();let im=null;if(p.pic){im=PICC.get(p.pic);if(!im){im=new Image();im.src=p.pic;PICC.set(p.pic,im)}}if(im&&im.complete&&im.naturalWidth)c.drawImage(im,px-R,-R,R*2,R*2);else{c.fillStyle=col;c.font=UFI(R);c.textAlign='center';c.fillText(String((p.n||'?')[0]||'?').toUpperCase(),px,R*.36)}c.restore();c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(px,0,R,0,TAU);c.stroke();
  if(p.host){c.fillStyle='#ffd23a';c.beginPath();const cx=px,cy=-R-2,s=R*.5;c.moveTo(cx-s,cy);c.lineTo(cx-s,cy-s*.7);c.lineTo(cx-s*.5,cy-s*.3);c.lineTo(cx,cy-s);c.lineTo(cx+s*.5,cy-s*.3);c.lineTo(cx+s,cy-s*.7);c.lineTo(cx+s,cy);c.fill()}
  const tx=px+R+10;c.textAlign='left';c.font=UFI(Math.min(h*.3,16));c.fillStyle=col;c.fillText('P'+(p.id+1),tx,-h*.08);c.font='bold '+Math.round(Math.min(h*.26,15))+'px sans-serif';c.fillStyle='#fff';let nm=p.n||'';while(nm.length>2&&c.measureText(nm).width>w/2-tx-6)nm=nm.slice(0,-1);c.fillText(nm,tx+Math.min(h*.3,16)*1.5,-h*.08);
  c.font='bold '+Math.round(Math.min(h*.2,12))+'px monospace';if(p.host&&!p.rtt){c.fillStyle='#ffd23a';c.fillText(p.me?'HOST (YOU)':'HOST',tx,h*.28)}else if(!p.ok){c.fillStyle='#ccc';c.fillText('connecting'+'...'.slice(0,1+((t*3)|0)%3),tx,h*.28)}else{const r=(p.rtt||0)|0,pc=r<80?'#5cff8a':r<150?'#ffd23a':'#ff5a5a';c.fillStyle=pc;for(let k=0;k<3;k++){const bh=h*.08*(k+1);c.globalAlpha*=k<(r<80?3:r<150?2:1)?1:.25;c.fillRect(tx+k*5,h*.3-bh,3,bh);c.globalAlpha=e}c.fillText(r+' ms'+(p.me?'  · YOU':''),tx+18,h*.3)}
  c.restore()});c.restore()}
function drawOnline(){hot=[];uiHeader('ONLINE','UP TO 32 PLAYERS');ctx.textAlign='center';
 if(H>=600){ctx.font='14px monospace';ctx.fillStyle='#aaa';ctx.fillText('The host\'s settings are used (map, items, lives, timer, teams, casual / competitive).',W/2,H*.12+30)}
 if(ONL.code&&ONL.id===0){const cy=H>=600?H*.12+118:H*.2;ctx.font='bold 52px monospace';ctx.fillStyle='#ffd23a';ctx.fillText(ONL.code,W/2,cy);ctx.font='13px monospace';ctx.fillStyle='#888';ctx.fillText('ROOM CODE (copied to clipboard)',W/2,cy+20)}
 if(ONL.st==='lobby')lobCards([{id:0,n:nickOf(),host:1,me:1,ok:1,pic:MYPIC}].concat(ONL.cl.slice().sort((a,b)=>a.id-b.id).map(k=>({id:k.id,n:k.nick||'',rtt:k.rtt,ok:k.ok,pic:k.pic}))));
 if(ONL.st==='lobbyc'){if(ONL.lob)lobCards(ONL.lob.map(x=>({id:x[0],n:x[1],rtt:x[2],ok:1,host:!x[0],me:x[0]===ONL.id,pic:x[0]===ONL.id?MYPIC:ONL.pics&&ONL.pics[x[0]]||null})));else{ctx.font='bold 22px monospace';ctx.fillStyle=COLS[ONL.id]||'#fff';ctx.fillText('YOU ARE P'+(ONL.id+1),W/2,H*.3)}}
 if(!document.fullscreenElement){ctx.font='bold 15px monospace';ctx.fillStyle=(frame>>4)&1?'#ff6a6a':'#ffb0b0';ctx.fillText('⚠ ALL PLAYERS MUST BE IN FULL SCREEN (click here / F11)',W/2,H*.205);hot.push({x:W/2-300,y:H*.205-18,w:600,h:26,hover:()=>{},click:goFull})}else{ctx.font='13px monospace';ctx.fillStyle='#7fd08a';ctx.fillText('✔ Full screen. Every player must be in full screen too.',W/2,H*.205)}
 const L=onlItems(),lob=ONL.st==='lobby'||ONL.st==='lobbyc',sm=H<600,y0=sm&&!lob?H*.4:H*.56,rp=Math.min(44,(H*.95-y0)/Math.max(1,L.length)),tt=UNOW();L.forEach((it,i)=>{const y=y0+i*rp+(sm?rp*.6:0),s=i===ONL.sel,A=UISUB.vals['o'+i]=lerp(UISUB.vals['o'+i]||0,s?1:0,.25),rw=Math.min(520,W*.8)+A*30,h=Math.min(36,rp-5),x=W/2-rw/2;ctx.save();ctx.fillStyle=s?'#fff':'rgba(10,12,22,.82)';skewRect(x,y-27,rw,h,12);ctx.fill();if(s){ctx.fillStyle='#29d4ff';skewRect(x-14,y-27,18,h,12);ctx.fill()}ctx.textAlign='center';ctx.font=s?UFI(Math.min(19,h*.55)):UF(800,Math.min(17,h*.5));ctx.fillStyle=s?'#05060c':'#d8dbe6';ctx.fillText(it.t,W/2,y-27+h*.68);ctx.restore();
  hot.push({x:W/2-rw/2,y:y-28,w:rw,h:h+2,hover:()=>{if(ONL)ONL.sel=i},click:()=>{if(ONL){ONL.sel=i;nav('ok')}}})});
 ctx.font='15px monospace';ctx.fillStyle='#9fe0c0';if(!(sm&&lob))ctx.fillText(ONL.msg||'',W/2,sm?y0-16:H*.86);if(ONL.xfer){ctx.fillStyle='#333';ctx.fillRect(W/2-200,H*.9,400,10);ctx.fillStyle='#5cff8a';ctx.fillRect(W/2-200,H*.9,400*clamp(ONL.xfer.p||0,0,1),10)}if(ONL.id>0&&ONL.st!=='idle'){ctx.fillStyle='#888';ctx.font='13px monospace';ctx.fillText('ping to host '+(ONL.rtt|0)+' ms',W/2,H*.86+22)}
 backBtn()}
DEFER(()=>{{const R0=render;render=()=>{if(mode==='online'&&ONL){ctx.setTransform(1,0,0,1,0,0);UIC.acc='#29d4ff';uiBG('ONLINE  ');if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();GLR.flush()}drawOnline();return}
 if(NET&&mode!=='game'&&!(ONL&&ONL.rules&&mode==='sub')){onlClose()}R0();if(NET&&mode==='game'&&ONL){const N=NET,c=OC||CTX0;if(N.id!==0&&ONL.rtt)N.rtt=ONL.rtt;c.save();c.setTransform(1,0,0,1,0,0);c.textAlign='left';c.font='11px monospace';c.fillStyle='rgba(200,255,220,.75)';
  c.fillText('ONLINE '+N.n+'P  ping '+(N.rtt|0)+'ms  delay '+N.D+'  rollbacks '+N.rbN+' (max '+N.rbMax+')'+(N.desync>=0?'  DESYNC @'+N.desync:''),8,H-8);const q=performance.now()-N.lastMsg;
  if(N.ended||q>2500){c.textAlign='center';c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,H/2-40,W,80);c.fillStyle='#ffd23a';c.font='bold 26px monospace';c.fillText(N.ended?'THE HOST LEFT · press Esc':'CONNECTION LOST... waiting',W/2,H/2+8);if(q>9000&&!N.ended)N.ended=true}
  else if(N.stT&&performance.now()-N.stT>400&&N.stW!==undefined){c.textAlign='center';c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,H*.2-22,W,34);c.fillStyle='#ffd23a';c.font='bold 18px monospace';c.fillText('Waiting for P'+(N.stW+1)+(NETNAMES&&NETNAMES[N.stW]?' ('+NETNAMES[N.stW]+')':'')+'… '+((performance.now()-N.stT)/1000).toFixed(1)+'s',W/2,H*.2)}
  if(N.dbg){c.textAlign='left';c.font='12px monospace';c.fillStyle='rgba(0,0,0,.7)';c.fillRect(6,H*.3-16,600,40+N.n*16);c.fillStyle='#9ff';c.fillText('NET DEBUG (F9)  frame '+N.f+'  sim '+(N.tms||0).toFixed(1)+'ms  stalls '+N.stall,12,H*.3);for(let i=0;i<N.n;i++){const lm=N.lm&&N.lm[i]?performance.now()-N.lm[i]:0;c.fillStyle=i===N.L?'#fff':lm>1000?'#f66':'#cfc';c.fillText('P'+(i+1)+(i===N.L?' (you)':'')+'  behind '+(N.f-N.conf[i])+'f  last msg '+(i===N.L?'-':(lm|0)+'ms')+(N.rttP&&N.rttP[i]?'  ping '+(N.rttP[i]|0):'')+(ONL.diag&&ONL.diag[i]?(ONL.diag[i].relay?'  RELAY (TURN server)':'  direct')+'  '+(ONL.diag[i].rtt|0)+'ms  '+ONL.diag[i].kbs.toFixed(1)+'KB/s':''),12,H*.3+16+i*16)}c.fillStyle='#aaa';c.fillText(ONL.id===0?'(host: you see every link)':'(only your link to the host is shown, the host sees all)',12,H*.3+16+N.n*16)}
  if(ONL.diag&&Object.values(ONL.diag).some(d=>d.relay)){c.textAlign='right';c.fillStyle='#f66';c.font='bold 12px monospace';c.fillText('⚠ a player goes through a relay server (slower) · F9',W-8,H-8)}c.restore()}}}});

// enregistrement des replays : en DERNIER pour capturer l'entrée finale
DEFER(()=>{{const H0=readHuman;readHuman=i=>{const I=H0(i);return P[i]?recIn(P[i],I):I}}});
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>recIn(p,C0(p,o))}});

function rebirth(p){Object.assign(p,{hp:T.HP,pips:T.PIPS,state:'idle',vx:0,vy:0,inv:60,diPend:false,koPend:false,combo:0}); // Mokou
 big('PHOENIX REBIRTH!','#ff4b1f',56);sfx('se_enep01');flash(.4,'#ff4b1f');shake=Math.min(40,shake+20);WAVES.push({x:p.x,y:p.y,t:30,T:30,spd:20,th:60,inv:0,c:'#ff4b1f'});burst(p.x,p.y,'#ff4b1f',40);
 for(const q of P){if(q===p||q.state==='dead'||q.inv>0)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<170)hit(q,p,dx,dy,IM.phoenix,1,true)}}
function drawViewFx(p,L,Tp,vw,vh){
 if(GFX.some(g=>g.k==='ice')){ctx.fillStyle='rgba(180,225,255,.08)';ctx.fillRect(L,Tp,vw,vh)}
 chView(L,Tp,vw,vh);chView2(L,Tp,vw,vh)}
const keep=a=>{let w=0;for(const x of a)if(x.t>0)a[w++]=x;a.length=w};
function updWorld(){
 if(TSTOP>0&&--TSTOP===0){big('TIME RESUMES','#00d0a0',40);sfx('se_kira00')}
 if(FRZ&&--FRZ.t<=0){for(const b of B)if(b.fz){const a=rng()*TAU,v=2+rng()*2.5;Object.assign(b,{fz:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,owner:FRZ.o,gr:0,home:0});if(b.heavy)b.dist=b.m.arm} // le gel éclate
  sfx('se_enep00');big('SHATTER!','#a8f0ff',44);FRZ=null}
 for(const h of HOLES){h.t--;h.a+=.1; // trou (Gap) : attire et blesse au centre
  h.m=h.m||0;const hr=26+Math.min(60,Math.sqrt(h.m)*3.5),G=Math.min(1.8,1+h.m*.01);h.r=hr; // plus il absorbe, plus il grossit et attire
  for(const q of P){if(q.id===h.o||q.state==='dead')continue;const dx=h.x-q.x,dy=h.y-q.y,d=Math.hypot(dx,dy)||1,f=.12*G/(1+d/300);q.vx+=dx/d*f;q.vy+=dy/d*f;
   if(d<hr+6&&(q.hCD||0)<frame&&q.inv<=0){q.hCD=frame+35;hit(q,P[h.o],-dx,-dy,IM.hole,1,false)}}
  for(const b of B){if(b.owner===h.o||b.fz)continue;const dx=h.x-b.x,dy=h.y-b.y,d=Math.hypot(dx,dy)||1,f=.12*G/(1+d/500);b.vx+=dx/d*f;b.vy+=dy/d*f;if(d<hr*.8){b.dead=1;h.m+=b.heavy?4:1}}}
 keep(HOLES);
 for(const u of BUMPS){u.t--;if(u.hit>0)u.hit--; // bumpers
  for(const q of P){if(q.id===u.o||q.state==='dead')continue;const dx=q.x-u.x,dy=q.y-u.y,d=Math.hypot(dx,dy)||1;
   if(d<u.r+bodyR(q)&&(q.uCD||0)<frame){q.uCD=frame+12;q.vx=dx/d*15;q.vy=dy/d*15;q.hp-=3;u.hit=10;if(q.state!=='spell')Object.assign(q,{state:'hitstun',t:14,run:false,slide:0,charging:false});sfx('se_kira00',.5);shake=Math.min(28,shake+4)}}
  for(const b of B){const dx=b.x-u.x,dy=b.y-u.y,d=Math.hypot(dx,dy);if(d<u.r+b.r&&d>0){const nx=dx/d,ny=dy/d,dt=b.vx*nx+b.vy*ny;if(dt<0){b.vx-=2*dt*nx;b.vy-=2*dt*ny}}}}
 keep(BUMPS);for(const ph of PHOTO)ph.t--;keep(PHOTO);
 for(const p of P){if(p.state==='dead')continue;
  if(p.mirror>0)p.mirror--;if(p.giant>0)p.giant--;if(p.clone>0)p.clone--;
  if(p.star>0){p.star--;p.inv=Math.max(p.inv,2); // Hourai Elixir : invincible, brûle au contact
   if(frame%2)FX.push({x:p.x+(Math.random()-.5)*24,y:p.y+(Math.random()-.5)*24,vx:0,vy:-1.5,t:18,c:Math.random()<.5?'#ff5030':'#ffd23a'});
   for(const q of P){if(q===p||q.state==='dead'||q.inv>0||(q.eCD||0)>frame)continue;const dx=q.x-p.x,dy=q.y-p.y;if(Math.hypot(dx,dy)<bodyR(p)+bodyR(q)+4){q.eCD=frame+20;hit(q,p,dx,dy,IM.star,1,true)}}}
  if(p.spk>0){p.spk--; // Master Spark : charge 1 s puis laser 1,5 s
   if(p.spk>=90)p.spkA=p.aim;else{const da=((p.aim-p.spkA)%TAU+TAU*1.5)%TAU-Math.PI;p.spkA+=clamp(da,-.012,.012);
    if(p.spk===89){if(p.rsrc){try{p.rsrc.stop()}catch(e){}p.rsrc=null}sfx('se_enep01');sfx('mastersparkrelease');big('MASTER SPARK!','#fff5a0',62);flash(.4,'#fff5a0');chroma=Math.max(chroma,18);zblur=Math.max(zblur,.1)}
    shake=Math.min(30,shake+1.2);const c=Math.cos(p.spkA),s=Math.sin(p.spkA);
    if(frame%3===0)for(let i=0;i<3&&B.length<T.MAX_B;i++){const a=rng()*TAU,v=2.2+rng()*2;B.push({x:p.x,y:p.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:6,owner:p.id,heavy:0,dmg:1,life:220,dead:0,gr:0,home:0,star:1,c:RB[rng()*6|0]})} // étoiles tout autour
    for(const b of B)if(b.owner!==p.id&&!b.fz){const rx=b.x-p.x,ry=b.y-p.y;if(rx*c+ry*s>0&&Math.abs(ry*c-rx*s)<110)b.dead=1}
    for(const q of P){if(q===p||q.state==='dead'||q.inv>0||(q.sCD||0)>frame)continue;const rx=q.x-p.x,ry=q.y-p.y;
     if(rx*c+ry*s>0&&Math.abs(ry*c-rx*s)<100+bodyR(q)){q.sCD=frame+12;if(parryOn(q)){parryFx(q);continue}hit(q,p,c,s,IM.spark,1.4,false)}}}}}
 if(WARP>0&&--WARP===0)big('WARP OVER','#b45cff',36);
 for(const p of P){if(p.state==='dead')continue;
  if(p.blade>0){p.blade--;p.bA+=.13;for(let k=0;k<2;k++){const a=p.bA+k*Math.PI,bx=p.x+Math.cos(a)*48,by=p.y+Math.sin(a)*48; // lame
   for(const q of P){if(q===p||q.state==='dead'||q.inv>0||(p.bCD[q.id]||0)>frame)continue;
    if(Math.hypot(q.x-bx,q.y-by)<T.BODY_R+12){p.bCD[q.id]=frame+24;if(parryOn(q)){parryFx(q);continue}sfx('hit'+(1+Math.random()*3|0),.7);hit(q,p,q.x-p.x,q.y-p.y,IM.blade,1,false)}}}}
  if(p.bombs>0&&(p.bombs--,(p.bombN=(p.bombN||1)-1)<=0)){p.bombN=Math.round(10+70*p.bombs/480);sfx('bombtick',.7);const al=P.filter(q=>q!==p&&q.state!=='dead');if(al.length){const q=al[rng()*al.length|0]; // zones explosives
   ZONES.push({x:clamp(q.x+(rng()-.5)*220,40,T.MAP_W-40),y:clamp(q.y+(rng()-.5)*220,40,T.MAP_H-40),r:90,t:180,o:p.id})}}}
 for(const z of ZONES){if(--z.t>0){if(z.t%60===0)sfx('timeout',.35);continue}
  WAVES.push({x:z.x,y:z.y,t:16,T:16,spd:9,th:40,inv:1});burst(z.x,z.y,'#ff9a2a',30);sfx('se_enep00',.8);shake=Math.min(30,shake+10);chroma=Math.max(chroma,10);
  for(const q of P){if(q.id===z.o||q.state==='dead'||q.inv>0)continue;const dx=q.x-z.x,dy=q.y-z.y;
   if(Math.hypot(dx,dy)<z.r+T.BODY_R){if(parryOn(q)){parryFx(q);continue}hit(q,P[z.o]||q,dx,dy,IM.bomb,1,true)}}}
 keep(ZONES);
 for(const o of ORBS){o.x+=o.vx;o.y+=o.vy;o.t--;if(o.x<10||o.x>T.MAP_W-10)o.vx*=-1;if(o.y<10||o.y>T.MAP_H-10)o.vy*=-1; // billes de soin
  for(const q of P)if(q.state!=='dead'&&Math.hypot(q.x-o.x,q.y-o.y)<T.BODY_R+8){q.hp=Math.min(T.HP,q.hp+100);o.t=0;txt(q.x,q.y-30,'+100','#5f8',22);burst(o.x,o.y,'#5f8',8);sfx('se_powerup',.35);break}}
 keep(ORBS);
 for(const f of FAIRIES){f.t--;if(f.hp<=0)f.t=0;if(f.t<=0){burst(f.x,f.y,'#6cf',12);continue} // fées voleuses
  const own=P[f.o];let tx,ty;
  if(f.loot){tx=own.x;ty=own.y;if(Math.hypot(tx-f.x,ty-f.y)<24){own.spirit=Math.min(T.SPIRIT_MAX,own.spirit+f.loot);own.power=Math.min(T.POWER_MAX,own.power+.5);txt(own.x,own.y-30,'+LOOT','#6cf',14);sfx('se_powerup',.4);f.loot=0}}
  else{let q=null,bv=-1;for(const c of P)if(c.id!==f.o&&c.state!=='dead'&&c.spirit+c.power*10>bv){bv=c.spirit+c.power*10;q=c}if(!q){f.t=0;continue}tx=q.x;ty=q.y;
   if(Math.hypot(tx-f.x,ty-f.y)<bodyR(q)+8){const st=Math.min(q.spirit,15);q.spirit-=st;q.power=Math.max(1,q.power-.5);f.loot=st+1;txt(q.x,q.y-30,'STOLEN!','#6cf',14);sfx('se_kira00',.4)}}
  const a=Math.atan2(ty-f.y,tx-f.x);f.x+=Math.cos(a)*4.2;f.y+=Math.sin(a)*4.2}
 keep(FAIRIES);
 for(const k of KOB){const p=P[k.o]; // rayon de KO : visée pendant 2 s puis tir
  {const pp=!!(p.in&&p.in.b&&p.in.b.parry);if(pp&&!k.pp&&(k.T||120)-k.t>8){k.t=-1;txt(k.x,k.y-40,'BEAM CANCELED','#aaa',16);sfx('se_invalid',.6);continue}k.pp=pp} // Parry : annule le rayon
  if(p.cpu){const q=tgt(p);if(q)k.a+=clamp(((Math.atan2(q.y-k.y,q.x-k.x)-k.a)%TAU+TAU*1.5)%TAU-Math.PI,-.04,.04)}
  else if(Math.hypot(p.in.x,p.in.y)>.3)k.a=Math.atan2(p.in.y,p.in.x);
  if(k.b!==undefined){const da=((k.a-k.b)%TAU+TAU*1.5)%TAU-Math.PI;k.a=k.b+clamp(da,-.6,.6)} // rayon renvoyé : légèrement orientable
  if(--k.t>0)continue;
  sfx('se_enep01');shake=Math.min(60,shake+30);flash(.5,COLS[k.o]);chroma=Math.max(chroma,24);focusL=1;zblur=Math.max(zblur,.1);fireBeam(k.x,k.y,k.a,k.o,k.col||COLS[k.o],k.edge||null,k.dep||0)}
 keep(KOB);
 for(const g of GFX)g.t--;keep(GFX);
 if(frame%4===0){const g=GFX.find(g=>g.k==='sakura');if(g&&B.length<T.MAX_B){const a=Math.PI/2+(rng()-.5)*.8;B.push({x:rng()*T.MAP_W,y:4,vx:Math.cos(a)*2.6,vy:Math.sin(a)*2.6,r:4,owner:g.o,heavy:0,dmg:1,life:700,dead:0,gr:0,home:0,c:'#ffb7d5'})}}
 if(frame%3===0&&GFX.some(g=>g.k==='ice'))FX.push({x:rng()*T.MAP_W,y:rng()*T.MAP_H,vx:(rng()-.5),vy:1.5,t:60,c:'#fff'});
 chPre();chPre2();chPre3();chPre4();chPre5();
 for(const c of CLOUDS){c.t--;for(const q of P)if(q.id!==c.o&&q.state!=='dead'&&q.inv<=0&&Math.hypot(q.x-c.x,q.y-c.y)<c.r){q.hp-=.12;q.inCloud=true;if(q.hp<=0)ko(q,'K.O.')}}keep(CLOUDS);
 for(const s of SLASH)if(--s.t===10){for(const q of s.tg)if(q.state!=='dead'&&q.inv<=0){if(parryOn(q)){parryFx(q);continue}hit(q,P[s.o],s.x2-s.x1,s.y2-s.y1,IM.slash,1,true)}sfx('hit3');shake=Math.min(28,shake+10);flash(.2)}
 keep(SLASH);
 for(const j of JUDG)if(--j.t===0){for(const q of P)if(q.id!==j.o&&q.state!=='dead'&&q.inv<=0&&(Math.abs(q.x-j.x)<32+bodyR(q)||Math.abs(q.y-j.y)<32+bodyR(q))){if(parryOn(q)){parryFx(q);continue}{const sn=Math.min(q.sins,6);hit(q,P[j.o],q.x-j.x||1,q.y-j.y||1,{dmg:6+sn*4,kb:12+sn,stun:30},1,true);q.sins=0}}
  sfx('se_enep01',.6);shake=Math.min(30,shake+12);flash(.25,'#9f9')}
 {let w=0;for(const j of JUDG)if(j.t>-14)JUDG[w++]=j;JUDG.length=w}
 for(const e of ENT)updEnt(e);keep(ENT)}
function drawWorldItems(){
 for(const c of CLOUDS){ctx.globalAlpha=Math.min(.35,c.t/180*.5);ctx.fillStyle='#a050ff';const fy=Math.sin(frame*.04+(c.ph||0))*5,K=c.k||[1,1,1,1,1];ctx.beginPath();for(let i=0;i<5;i++){const a=i*TAU/5+(c.ph||0)+frame*.01,x=c.x+Math.cos(a)*c.r*.45,y=c.y+fy+Math.sin(a)*c.r*.4,r=c.r*.62*K[i];ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU)}ctx.fill()}ctx.globalAlpha=1; // nuages difformes qui flottent
 for(const j of JUDG){if(j.t>0){const f=1-j.t/70;ctx.globalAlpha=.08+.12*f;ctx.fillStyle='#3a7f5a';ctx.fillRect(0,j.y-32,T.MAP_W,64);ctx.fillRect(j.x-32,0,64,T.MAP_H);
   ctx.globalAlpha=.4+.6*f;ctx.fillStyle='#9f9';ctx.fillRect(0,j.y-1-f*2,T.MAP_W,2+f*4);ctx.fillRect(j.x-1-f*2,0,2+f*4,T.MAP_H)}
  else{const w=32*(1+j.t/14);ctx.globalAlpha=1;ctx.fillStyle='#d9ffe6';ctx.fillRect(0,j.y-w,T.MAP_W,w*2);ctx.fillRect(j.x-w,0,w*2,T.MAP_H)}}ctx.globalAlpha=1;
 ctx.lineCap='round';for(const s of SLASH){ctx.strokeStyle=COLS[s.o];ctx.globalAlpha=s.t>10?.5:s.t/10;ctx.lineWidth=(s.t>10?2:14*s.t/10+2)+6;ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.strokeStyle='#fff';if(s.t>10){ctx.globalAlpha=.4;ctx.lineWidth=2}else{ctx.globalAlpha=s.t/10;ctx.lineWidth=14*s.t/10+2}ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke()}ctx.globalAlpha=1;
 chDraw();chDraw2();chDraw3();chDraw4();chDraw5();

 for(const h of HOLES){const r=h.r||30;ctx.save();ctx.translate(h.x,h.y);for(let i=0;i<3;i++){ctx.rotate(h.a*.3);ctx.strokeStyle=['#ffb050','#ff6a20','#ffe0a0'][i];ctx.globalAlpha=.55-i*.12;ctx.lineWidth=6-i*1.5;ctx.beginPath();ctx.ellipse(0,0,r*(1.9+i*.35),r*(.55+i*.12),i*.6,0,TAU);ctx.stroke()} // disque d'accrétion
  ctx.globalAlpha=1;const g=ctx.createRadialGradient(0,0,r*.6,0,0,r*1.25);g.addColorStop(0,'#000');g.addColorStop(.8,'#000');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.25,0,TAU);ctx.fill();ctx.strokeStyle='rgba(255,220,160,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();ctx.restore()}
 for(const u of BUMPS){ctx.fillStyle=u.hit?'#fff':'#1fb5a5';ctx.beginPath();ctx.arc(u.x,u.y,u.r+(u.hit?4:0),0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#0a3';ctx.beginPath();ctx.arc(u.x,u.y,8,0,TAU);ctx.fill()}
 for(const ph of PHOTO){ctx.save();ctx.translate(ph.x,ph.y);ctx.rotate(ph.a);ctx.globalAlpha=ph.t/20*.6;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,380,-.55,.55);ctx.closePath();ctx.fill();
  ctx.globalAlpha=ph.t/20;ctx.strokeStyle='#d4a050';ctx.lineWidth=4;ctx.strokeRect(200,-110,170,220);ctx.restore();ctx.globalAlpha=1}
 for(const p of P){if(p.state==='dead')continue;
  if(p.clone>0){const x=T.MAP_W-p.x,y=T.MAP_H-p.y;ctx.globalAlpha=.45;ctx.fillStyle='#8a8f9a';ctx.beginPath();ctx.arc(x,y,T.BODY_R,0,TAU);ctx.fill();ctx.strokeStyle=COLS[p.id];ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1}
  if(p.mirror>0){ctx.strokeStyle='#e0e6f0';ctx.lineWidth=3;ctx.globalAlpha=.55+.45*Math.sin(frame*.4);ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+9,0,TAU);ctx.stroke();ctx.globalAlpha=1}
  if(p.star>0){ctx.strokeStyle=frame&4?'#ff5030':'#ffd23a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p)+6,0,TAU);ctx.stroke()}
  if(p.spk>0){if(p.spk>=90){const f=(390-p.spk)/300;ctx.globalAlpha=.4+.6*f;magicCircle(p.x,p.y,40+f*50,frame*.08,RB[(frame>>2)%6]);magicCircle(p.x,p.y,(40+f*50)*.6,-frame*.12,'#fff');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x+Math.cos(p.aim)*24,p.y+Math.sin(p.aim)*24,6+f*26,0,TAU);ctx.fill();ctx.globalAlpha=1}
   else sparkFX(p)}}
 for(const z of ZONES){const f=z.t/180;ctx.globalAlpha=.12+.2*((frame>>3)&1)*(1-f);ctx.fillStyle='#ff9a2a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,TAU);ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle='#ff9a2a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(z.x,z.y,z.r,-Math.PI/2,-Math.PI/2+TAU*f);ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 40px monospace';ctx.textAlign='center';ctx.fillText(Math.ceil(z.t/60),z.x,z.y+14)}
 ctx.lineWidth=2;ctx.strokeStyle='#fff';for(const o of ORBS){ctx.globalAlpha=o.t<60&&(frame>>2)&1?.4:1;ctx.fillStyle='#5cff8a';ctx.beginPath();ctx.arc(o.x,o.y,7,0,TAU);ctx.fill();ctx.stroke()}ctx.globalAlpha=1;
 for(const f of FAIRIES){const w=Math.sin(frame*.5)*.4;ctx.fillStyle='rgba(120,200,255,.5)';
  for(const sd of[-1,1]){ctx.beginPath();ctx.ellipse(f.x+sd*9,f.y-3,8,4,sd*(.5-w),0,TAU);ctx.fill()}
  ctx.fillStyle='#6cf';ctx.beginPath();ctx.arc(f.x,f.y,8,0,TAU);ctx.fill();ctx.fillStyle=COLS[f.o];ctx.beginPath();ctx.arc(f.x,f.y,3,0,TAU);ctx.fill()}
 for(const p of P){if(p.state==='dead')continue;
  if(p.blade>0)for(let k=0;k<2;k++){const a=p.bA+k*Math.PI,c=Math.cos(a),s=Math.sin(a);ctx.lineCap='round';ctx.strokeStyle='#ffe23a';ctx.lineWidth=8;
   ctx.beginPath();ctx.moveTo(p.x+c*26,p.y+s*26);ctx.lineTo(p.x+c*62,p.y+s*62);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke()}
  if(p.state==='rifle'){const f=p.t/IM.rifle.start,c=Math.cos(p.aim),s=Math.sin(p.aim);ctx.strokeStyle=f>.75&&(frame>>1)&1?'#f44':'#fff';ctx.globalAlpha=.25+f*.75;ctx.lineWidth=1+f*2;
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+c*2400,p.y+s*2400);ctx.stroke();ctx.globalAlpha=1}
  if(p.ult){ctx.strokeStyle=rainbowCol();ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,26+3*Math.sin(frame*.2),0,TAU);ctx.stroke()}
  if(p.bombs>0){ctx.strokeStyle='#ff9a2a';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(p.x,p.y,30,0,TAU);ctx.stroke();ctx.setLineDash([])}}
 for(const k of KOB){const f=k.t/(k.T||120),e=1-f,col=COLS[k.o]; // visée du rayon de KO
  ctx.save();ctx.translate(k.x,k.y);ctx.rotate(k.a);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.03+.08*e;ctx.fillStyle=col;ctx.fillRect(0,-90*e,KOLEN(),180*e);ctx.globalAlpha=.2+.5*e;ctx.fillRect(0,-2-e*3,KOLEN(),4+e*6);ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=.3+.4*e;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-86);ctx.lineTo(KOLEN(),-86);ctx.moveTo(0,86);ctx.lineTo(KOLEN(),86);ctx.stroke();
  ctx.globalAlpha=.75;ctx.lineWidth=3;ctx.beginPath();for(let x=frame*6%120+40;x<KOLEN();x+=120){ctx.moveTo(x-12,-14);ctx.lineTo(x,0);ctx.lineTo(x-12,14)}ctx.stroke(); // chevrons
  for(let i=2;i>=0;i--){ctx.globalAlpha=(.3+.3*e)/(i+1);ctx.fillStyle=i?col:'#fff';ctx.beginPath();ctx.arc(0,0,(8+e*24)*(1+i*.7),0,TAU);ctx.fill()} // orbe qui charge
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=col;for(let i=0;i<14;i++){const a=i*TAU/14+frame*.12*(i%2?1:-1),r=18+((f*70+i*11)%80);ctx.globalAlpha=.25+.6*e;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.5+e*2.5,0,TAU);ctx.fill()}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.35+.55*e;magicCircle(0,0,26+e*34,frame*.1,col);magicCircle(0,0,(26+e*34)*.62,-frame*.16,'#fff') // énergie aspirée
  ctx.restore();ctx.globalAlpha=1;
  if(k.t<=T.BEAM_PARRY&&(frame>>1)&1){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(k.x,k.y,26,0,TAU);ctx.stroke();ctx.fillStyle='#6ff';ctx.font='bold 22px monospace';ctx.textAlign='center';ctx.fillText('PARRY NOW!',k.x,k.y-40)}}}
{const D0=drawOnline;drawOnline=()=>{D0();if(ONL&&ONL.qc>performance.now()){ctx.save();ctx.fillStyle='rgba(5,6,12,.88)';ctx.fillRect(0,H*.42,W,H*.14);ctx.textAlign='center';ctx.fillStyle='#ff5a6e';ctx.font=UFI(Math.min(34,W*.035));ctx.fillText('LEAVE AND CLOSE THE ROOM?',W/2,H*.48);ctx.fillStyle='#fff';ctx.font=UF(800,16);ctx.fillText('Press BACK again to confirm (everyone is disconnected)',W/2,H*.52);ctx.restore()}}}
