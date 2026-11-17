'use strict';
// ---- rendu lissé (écrans 120/144 Hz) : la partie reste à 60 étapes/s ; à l'affichage seulement, positions interpolées entre les deux dernières étapes
let MOTION;DEFER(()=>{MOTION=(()=>{try{return +localStorage.getItem('sf_motion')||0}catch(e){return 0}})()}); // 0 auto · 1 lissé · 2 strict 60
let IP,IPL;DEFER(()=>{IP=new WeakMap();IPL=()=>[P,B,ENT,ORBS,FAIRIES]});let ipT,ipD;DEFER(()=>{ipT=0;ipD=STEP});
const ipOn=()=>mode==='game'&&(MOTION===1||MOTION===0&&fps>75);
DEFER(()=>{{const S0=step;step=()=>{if(mode==='game'&&!(hitstop>0||slow>0&&(slow-1)%3)){for(const L of IPL())for(const o of L)if(o&&typeof o.x==='number'){let r=IP.get(o);if(!r){r=[0,0];IP.set(o,r)}r[0]=o.x;r[1]=o.y}ipT=performance.now();ipD=STEP*(slow>0?3:1)/(CX.mer?2:1)}return S0()}}});
DEFER(()=>{{const R0=render;render=()=>{if(!ipOn())return R0();const a=Math.min(1,Math.max(0,(performance.now()-ipT)/ipD)),sv=[];
 for(const L of IPL())for(const o of L){const r=o&&IP.get(o);if(!r)continue;const dx=o.x-r[0],dy=o.y-r[1];if(dx*dx+dy*dy>14400||!dx&&!dy)continue;sv.push(o,o.x,o.y);o.x=r[0]+dx*a;o.y=r[1]+dy*a}
 try{R0()}finally{for(let i=0;i<sv.length;i+=3){sv[i].x=sv[i+1];sv[i].y=sv[i+2]}}}}});
DEFER(()=>{{const i=MENU.findIndex(r=>/^Effects/.test(r.t()));if(i>=0)MENU.splice(i+1,0,{t:()=>'Full screen: '+(document.fullscreenElement?'ON':'OFF')+'  (Enter)',f:()=>{try{if(document.fullscreenElement)document.exitFullscreen();else goFull()}catch(e){}}},{t:()=>'Motion: '+['AUTO','SMOOTH','STRICT 60'][MOTION]+'  ◀ ▶',lr:d=>{MOTION=(MOTION+(d>0?1:2))%3;try{localStorage.setItem('sf_motion',MOTION)}catch(e){}}})}});
