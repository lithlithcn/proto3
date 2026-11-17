'use strict';
// ================= Outils =================
let seed=1;const rng=()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,TAU=6.2832;
let cv;DEFER(()=>{cv=document.getElementById('c')});let ctx;DEFER(()=>{ctx=cv.getContext('2d')});let CTX0,OCV,OC;DEFER(()=>{CTX0=ctx;OCV=document.getElementById('o');OC=OCV?OCV.getContext('2d'):null});let W,H,SC; // ctx bascule vers la couche du dessus pour le HUD
function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;if(OCV){OCV.width=W;OCV.height=H}SC=H/T.VIEW_H}
DEFER(()=>{addEventListener('resize',resize);});DEFER(()=>{resize();});
