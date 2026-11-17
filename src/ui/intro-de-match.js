'use strict';
// ---- intro de match : READY? → FIGHT!  (affichage seulement, la partie tourne déjà)
let MINTRO={sid:-1,snd:0};DEFER(()=>{{const S0=start;start=m=>{S0(m);MINTRO={sid:frame,snd:0,on:mode==='game'&&!TEST&&!(typeof TUT!=='undefined'&&TUT)}}}});
function drawIntro(){if(!MINTRO.on||mode!=='game'||frame>110||winner>=0)return;const f=frame,c=OC||CTX0;
 if(f>=1&&!MINTRO.snd){MINTRO.snd=1;sfx('ready',.9)}if(f>=55&&MINTRO.snd===1){MINTRO.snd=2;sfx('se_cardget',.8);sfx('ok00',.7)}
 c.save();c.setTransform(1,0,0,1,0,0);const go=f>=55,u=go?(f-55)/55:f/55;
 const bh=H*.2,ein=clamp(u*5,0,1),eout=go?clamp((u-.6)/.4,0,1):0,bx=-W*(1-ein)+eout*W*1.2;
 c.globalAlpha=go?.85*(1-eout):.8;c.fillStyle='#05060c';c.beginPath();c.moveTo(bx,H/2-bh/2-20);c.lineTo(bx+W*1.2,H/2-bh/2-40);c.lineTo(bx+W*1.2,H/2+bh/2-40);c.lineTo(bx,H/2+bh/2-20);c.fill();
 const ac=go?'#ff3355':'#ffd23a';c.fillStyle=ac;c.fillRect(bx,H/2-bh/2-24,W*1.2,5);c.fillRect(bx,H/2+bh/2-30,W*1.2,5);c.globalAlpha=1;
 const txt=go?'FIGHT!':'READY?',sc=go?(u<.12?1+(1-u/.12)*1.4:1+.04*Math.sin(u*20)):(.9+ein*.1),sh=go&&u<.2?(Math.random()-.5)*14*(1-u/.2):0;
 c.translate(W/2+sh+(go?eout*W:0),H/2-20+sh);c.rotate(-.04);c.scale(sc,sc);c.font=UFI(Math.min(H*.17,W*.13));c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=14;c.strokeStyle='#05060c';c.globalAlpha=1-eout;c.strokeText(txt,0,0);
 if(!fxLow){c.fillStyle='#2df0ff';c.fillText(txt,-5,2);c.fillStyle='#ff2d6a';c.fillText(txt,5,-2)}c.fillStyle='#fff';c.fillText(txt,0,0);
 if(go&&u<.15){c.globalAlpha=(1-u/.15)*.6;c.setTransform(1,0,0,1,0,0);c.fillStyle='#fff';c.fillRect(0,0,W,H)}c.restore()}
