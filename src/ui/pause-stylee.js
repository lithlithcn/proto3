'use strict';
// ---- pause stylée
function drawPause(){const t=UNOW()-(UIP.t0||(UIP.t0=UNOW())),e=1-Math.pow(1-clamp(t/.3,0,1),3);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(4,5,12,'+(.65*e)+')';ctx.fillRect(0,0,W,H);
 ctx.translate((1-e)*-W*.5,0);ctx.fillStyle='#05060c';skw(-40,H*.36,W*.62,H*.22,H*.08);ctx.fill();ctx.fillStyle='#ff3355';ctx.fillRect(0,H*.36,W*.58,5);ctx.fillRect(0,H*.58-5,W*.55,5);
 ctx.font=UFI(H*.13);ctx.textAlign='left';ctx.textBaseline='alphabetic';strokeTxt('PAUSE',W*.06,H*.52,10,'#05060c','#fff');ctx.font=UF(800,H*.022);ctx.fillStyle='#ffd23a';ctx.fillText('ESC / A  ·  RESUME          M / B  ·  MENU',W*.07,H*.56);
 ctx.restore();ctx.save();ctx.globalAlpha=.15*e;ctx.font=UFI(H*.4);ctx.textAlign='right';ctx.lineWidth=3;ctx.strokeStyle='#ff3355';ctx.strokeText('PAUSE',W+((UNOW()*40)%200)-100,H*.98);ctx.restore()}
let UIP={};
DEFER(()=>{backBtn=function(){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.textAlign='left';ctx.font=UF(900,15);ctx.fillStyle='#fff';ctx.fillText('◀ BACK',W*.05,H*.15);ctx.restore();hot.push({x:W*.04,y:H*.125,w:110,h:30,hover:()=>{},click:()=>nav('back')})};});
DEFER(()=>{{const R0=render;render=()=>{if(!paused)UIP.t0=0;R0();if(mode==='game')drawIntro()}}});
