'use strict';
// ---- sélection façon Smash + playground façon Rivals (local) : grille des persos en haut, joueurs en bas,
//      Parade (une fois prêt) = jouer son perso dans l'arène derrière l'écran, Start = sortir du playground / lancer le match
const CS2={sl:[],pv:{},on:false,key:'',acc:0,t0:0,nP0:2,map0:0};
function cssOpen(){CS2.sl=[0,1,2,3,4,5,6,7].map(i=>({dev:null,ty:SELTY&&SELTY[i]>=CH0?SELTY[i]:CHL[i%CHL.length],rd:false,pg:false}));CS2.pv={};CS2.on=false;CS2.key='';CS2.nP0=nP;CS2.map0=mapI;for(const d of devList())CS2.pv[d]=cssIn(d);mode='css';sfx('ok00')}
function cssIn(d){const I=devIn(d);if(d[0]==='k'){const m=KB[+d[1]];I.p=kd(m.parry);I.b=d==='k0'&&kd('Escape')||kd('Backspace')&&d==='k0'}else{const g=pads()[+d.slice(1)];if(g){const M=PAD[+d.slice(1)]||PAD[0];I.p=[].concat(M.parry).every(n=>g.buttons[n]&&g.buttons[n].pressed)}}return I}
function cssTick(){const S=CS2.sl;for(const d of devList()){const I=cssIn(d),p=CS2.pv[d]||{},e=k=>I[k]&&!p[k];CS2.pv[d]=I;const i=S.findIndex(s=>s.dev===d);
  if(i>=0&&CS2.tb&&e('yb')){S[i].tm=((S[i].tm|0)+1)%4;sfx('se_select00',.7)}
  if(i<0){if(d[0]==='p'&&e('s')&&!S.some(s=>s.dev&&!s.rd)){cssGo();return}if(e('a')){const n=S.findIndex(s=>!s.dev);if(n>=0){S[n].dev=d;S[n].rd=false;S[n].pg=false;sfx('joined',.7)}}else if(e('b')&&!S.some(s=>s.dev)){mode='menu';sfx('cancel00')}continue}
  const s=S[i];
  if(s.pg){if(e('s')||e('b')){s.pg=false;sfx('cancel00')}continue} // dans le playground : Start = revenir à la sélection
  if(!s.rd){const j=Math.max(0,CHL.indexOf(s.ty)),N=CHL.length,C=4;let k=j;if(I.x&&I.x!==p.x)k=(j+(I.x>0?1:N-1))%N;if(I.y&&I.y!==p.y)k=(j+(I.y>0?C:N-C))%N;if(k!==j){s.ty=CHL[k];sfx('se_select00',.5)}
   if(e('a')){s.rd=true;sfx('ok00')}if(e('b')){s.dev=null;sfx('cancel00')}}
  else{if(e('p')){s.pg=true;sfx('joined',.8)}else if(e('b')){s.rd=false;sfx('cancel00')}else if(e('s')||e('a')&&d==='k0'&&kd('Enter')){const J=S.filter(s=>s.dev);if(J.every(s=>s.rd)){cssGo();return}}}}
 // playground : la composition change -> on relance la petite partie derrière
 const G=S.map((s,i)=>s.dev&&s.pg?i:-1).filter(i=>i>=0),key=G.map(i=>i+':'+S[i].ty).join(',');
 if(key!==CS2.key){CS2.key=key;if(G.length){nP=G.length;nH=G.length;DEVMAP=G.map(i=>S[i].dev);SELTY=G.map(i=>S[i].ty);mapI=CS2.pgMap??0;const it=itemsOn;start('game');PGM=1;for(const q of P)q.stocks=99;mode='css';CS2.on=true;CS2.acc=0}else CS2.on=false}}
function cssGo(){const S=CS2.sl,J=S.filter(s=>s.dev);PGM=0;TEAMS=!!CS2.tb;if(TEAMS){const O=[...J,...S.filter(s=>!s.dev)];O.forEach((s,k)=>{TEAMA[k]=s.tm|0});if(new Set(O.slice(0,Math.max(CS2.nP0,J.length)).map(s=>s.tm|0)).size<2)TEAMS=false}CS2.on=false;nH=J.length;nP=Math.max(CS2.nP0,nH);mapI=CS2.map0;DEVMAP=J.map(s=>s.dev);SELTY=[...J.map(s=>s.ty),...S.filter(s=>!s.dev).map(()=>null)];saveOpts();sfx('title',1);start('game')}
let PGM=0;
DEFER(()=>{{const S1=step;step=()=>{S1();if(PGM&&mode==='game'){winner=-1;for(const q of P){if(q.stocks<50)q.stocks=99}}}}});
function drawCss(){cssTick();if(mode!=='css')return;const S=CS2.sl,N=CHL.length,C=4,R=Math.min(52,W*.04,H*.06),gx=W/2-(C*R*2.6)/2+R*1.3,gy=CS2.on?R*1.6:H*.2;
 if(!CS2.on){UIC.acc='#ff3355';uiBG('SELECT  ')}
 ctx.save();ctx.textAlign='center';
 if(CS2.on){ctx.fillStyle='rgba(5,6,12,.6)';ctx.fillRect(gx-R*1.6,gy-R*1.4,C*R*2.6+R*.6,Math.ceil(N/C)*R*2.6+R*.4)}
 else{ctx.font='bold '+Math.round(H*.05)+'px sans-serif';ctx.fillStyle='#fff';ctx.fillText('CHOOSE YOUR FIGHTER',W/2,gy-R*1.6)}
 for(let j=0;j<N;j++){const x=gx+(j%C)*R*2.6,y=gy+(j/C|0)*R*2.6,ch=CHR[CHL[j]-CH0];
  ctx.fillStyle='rgba(10,12,22,.9)';ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();ctx.strokeStyle=ch.col;ctx.lineWidth=3;ctx.stroke();
  const q={x,y,id:900+j,aim:-Math.PI/2,state:'idle',power:4,fx:{}};try{ctx.save();ch.draw(q,R*.45)}catch(e){}ctx.restore();
  ctx.fillStyle=ch.col;ctx.beginPath();ctx.arc(x,y,R*.2,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold '+Math.round(R*.28)+'px monospace';ctx.fillText(ch.name.toUpperCase(),x,y+R+R*.34);
  // jetons des joueurs qui survolent / ont choisi ce perso
  let k=0;S.forEach((s,i)=>{if(!s.dev||s.ty!==CHL[j])return;const a=-Math.PI*.8+k*.55,tx=x+Math.cos(a)*R,ty=y+Math.sin(a)*R;k++;ctx.fillStyle=COLS[i];ctx.beginPath();ctx.arc(tx,ty,R*.26,0,TAU);ctx.fill();ctx.strokeStyle=s.rd?'#fff':'#000';ctx.lineWidth=s.rd?3:1.5;ctx.stroke();ctx.fillStyle='#000';ctx.font='bold '+Math.round(R*.24)+'px monospace';ctx.fillText('P'+(i+1),tx,ty+R*.09)})}
 // cartes des joueurs en bas
 const n=Math.max(4,S.filter(s=>s.dev).length,Math.min(8,CS2.nP0)),cw=Math.min(240,(W-40)/n),ch=Math.min(H*.2,130),y0=H-ch-14,x0=W/2-cw*n/2;
 for(let i=0;i<n;i++){const s=S[i],x=x0+i*cw+5,w=cw-10,c=COLS[i];ctx.globalAlpha=s.dev||i<CS2.nP0?1:.4;ctx.fillStyle=CS2.on?'rgba(5,6,12,.72)':'rgba(5,6,12,.85)';ctx.fillRect(x,y0,w,ch);ctx.fillStyle=c;ctx.fillRect(x,y0,w,5);ctx.strokeStyle=s.pg?'#ffd23a':s.rd?'#5cff8a':c;ctx.lineWidth=s.rd||s.pg?3:1.5;ctx.strokeRect(x,y0,w,ch);
  ctx.fillStyle=c;ctx.font='bold 18px sans-serif';ctx.fillText('P'+(i+1),x+w/2,y0+26);ctx.font='12px monospace';
  if(s.dev){const chN=CHR[s.ty-CH0];ctx.fillStyle='#ccd';ctx.fillText(devName(s.dev),x+w/2,y0+44);ctx.fillStyle=chN.col;ctx.font='bold 16px sans-serif';ctx.fillText(chN.name,x+w/2,y0+70);
   ctx.font='bold 12px monospace';ctx.fillStyle=s.pg?'#ffd23a':s.rd?'#5cff8a':'#aab';ctx.fillText(s.pg?'IN THE ARENA · START = BACK':s.rd?'READY · PARRY = TRY IT':'◀ ▶ ▲ ▼ · ATTACK = PICK',x+w/2,y0+ch-14)}
  else{ctx.fillStyle='#889';ctx.fillText(i<CS2.nP0?'CPU LV '+cpuLv:'ATTACK = JOIN',x+w/2,y0+ch/2+6)}}
 ctx.globalAlpha=1;const J=S.filter(s=>s.dev);ctx.font='bold 15px monospace';ctx.fillStyle=J.length&&J.every(s=>s.rd)?'#5cff8a':'#aab';
 ctx.fillText(J.length&&J.every(s=>s.rd)?'EVERYONE READY: PRESS START TO FIGHT!':'Join with Attack · pick your fighter · Parry = try it in the arena · B / Esc = back',W/2,y0-12);ctx.restore()}
DEFER(()=>{{const R0=render;render=(...a)=>{if(mode!=='css')return R0(...a);
 if(CS2.on){const now=performance.now();CS2.acc=Math.min(STEP*5,CS2.acc+(now-(CS2.lt||now)));CS2.lt=now;let k=0;while(CS2.acc>=STEP&&k<5){mode='game';try{step()}catch(e){errRep('step',e)}mode='css';CS2.acc-=STEP;k++}
  mode='game';try{R0(...a)}catch(e){errRep('render',e)}mode='css';ctx=CTX0;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;setFilter('');hot=[];drawCss();return}
 CS2.lt=0;musTick();if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();GLR.flush()}ctx=CTX0;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);setFilter('');hot=[];drawCss()}}});
DEFER(()=>{{const N2=nav;nav=ev=>{if(mode==='css')return;return N2(ev)}}});
DEFER(()=>{{const i=HUB.findIndex(h=>h.k==='fight');if(i>=0)HUB[i].f=()=>TCH.on?cselOpen():cssOpen()}});
