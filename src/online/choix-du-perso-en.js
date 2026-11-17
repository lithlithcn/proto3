'use strict';
// ---- choix du perso en ligne (envoyé à l'hôte, appliqué au départ chez tout le monde) et en training
let MYCH;DEFER(()=>{MYCH=(()=>{try{return +localStorage.getItem('sf_ch')||0}catch(e){return 0}})()});
const myCh=()=>MYCH>=CH0&&MYCH<CH0+CHR.length?MYCH:CHL[0];
function chRow(){return{t:'YOUR FIGHTER: '+CHR[myCh()-CH0].name+'  (Enter: next)',f:()=>{const j=CHL.indexOf(myCh());MYCH=CHL[(j+1)%CHL.length];try{localStorage.setItem('sf_ch',MYCH)}catch(e){}if(ONL&&ONL.conn&&ONL.conn.open)try{ONL.conn.send({t:'ch',c:MYCH})}catch(e){}}}}
const chSet=(p,c)=>{if(!p)return;p.shotT=c;const C=chOf(p);p.spI=C.spI;C.init&&C.init(p);burst(p.x,p.y,C.col,16)};
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);if(mode==='game'&&TEST&&TEST.train){chSet(P[0],TRX.me||myCh());chSet(P[1],TRX.dum||CHL[1])}return r}}});
DEFER(()=>{{const T0=drawTrain;drawTrain=()=>{T0();if(!(TEST&&TEST.train&&paused&&mode==='game'))return;const w=Math.min(W-20,900),x0=(W-w)/2,y0=Math.max(10,H*.08),y=y0+H*.84+6;
 const B=[['YOU: ◀ '+(chOf(P[0])||{name:'?'}).name+' ▶',d=>{const j=CHL.indexOf(P[0].shotT);TRX.me=CHL[(j+d+CHL.length)%CHL.length];chSet(P[0],TRX.me)}],['DUMMY: ◀ '+(chOf(P[1])||{name:'?'}).name+' ▶',d=>{const j=CHL.indexOf(P[1].shotT);TRX.dum=CHL[(j+d+CHL.length)%CHL.length];chSet(P[1],TRX.dum)}]];
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';B.forEach(([t,f],i)=>{const x=x0+i*w/2;ctx.fillStyle='#24203a';ctx.fillRect(x+4,y,w/2-8,34);ctx.strokeStyle='#c070ff';ctx.lineWidth=1.5;ctx.strokeRect(x+4,y,w/2-8,34);ctx.fillStyle='#fff';ctx.font='bold 14px monospace';ctx.fillText(t,x+w/4,y+17);
  hot.push({x:x+4,y,w:w/4-4,h:34,hover:()=>{},click:()=>{f(-1);sfx('se_select00',.5)}});hot.push({x:x+w/4,y,w:w/4-4,h:34,hover:()=>{},click:()=>{f(1);sfx('se_select00',.5)}})});
 ctx.font='11px monospace';ctx.fillStyle='#aab';ctx.fillText('Click the left / right half to change · keys: [ ] you · ; and quote: dummy',W/2,y+46);ctx.restore()}}});
DEFER(()=>{{const K0=onKey;onKey=c=>{if(mode==='game'&&TEST&&TEST.train&&paused){const m={BracketLeft:[0,-1],BracketRight:[0,1],Semicolon:[1,-1],Quote:[1,1]}[c];if(m){const p=P[m[0]],j=CHL.indexOf(p.shotT),k=CHL[(j+m[1]+CHL.length)%CHL.length];if(m[0])TRX.dum=k;else TRX.me=k;chSet(p,k);sfx('se_select00',.5);return}}return K0(c)}}});
