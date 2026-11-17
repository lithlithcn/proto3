'use strict';
// ---- cache des petites balles (rendu identique à l'ancien, juste plus rapide) + tremblement fluide
let SPRC,shN;DEFER(()=>{SPRC=new Map();shN=(t,k)=>Math.sin(t*1.7+k)*.5+Math.sin(t*2.9+k*3)*.3+Math.sin(t*5.3+k*7)*.2});
function bSpr(col,r,o){const rr=Math.round(r*2)/2,key=col+rr+'|'+o;let S=SPRC.get(key);if(S)return S;const p=Math.ceil(rr+3),c=document.createElement('canvas');c.width=c.height=p*2;const x=c.getContext('2d');
 x.globalAlpha=.8;x.fillStyle=COLS[o]||'#fff';x.beginPath();x.arc(p,p,rr+1.8,0,TAU);x.fill();x.globalAlpha=1;x.fillStyle=col;x.beginPath();x.arc(p,p,rr,0,TAU);x.fill();
 if(rr>=3){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(p,p,rr*.5,0,TAU);x.fill()}c.o=p;if(SPRC.size>600)SPRC.clear();SPRC.set(key,c);return c}

