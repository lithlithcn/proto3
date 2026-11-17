'use strict';
// ---- GAME! : bandes noires, éclair blanc, texte qui s'écrase, éclats
function drawGameEnd(){const t=winT,c=ctx;c.save();c.setTransform(1,0,0,1,0,0);const lb=clamp(t/10,0,1)*H*.12;c.fillStyle='#000';c.fillRect(0,0,W,lb);c.fillRect(0,H-lb,W,lb);
 if(t<6){c.globalAlpha=(1-t/6)*.7;c.fillStyle='#fff';c.fillRect(0,0,W,H);c.globalAlpha=1}
 const e=clamp(t/8,0,1),sc=e<1?3-2*e:1+.03*Math.sin(t*.3),sh=t<16?(Math.random()-.5)*20*(1-t/16):0,wc=winner>=0?(TEAMS?TCOL[TEAMA[winner]]:COLS[winner]):'#fff';
 c.translate(W/2+sh,H/2+sh);c.rotate(-.06);c.globalAlpha=.85;c.fillStyle='#05060c';skw(-W*.6,-H*.11,W*1.2*clamp(t/6,0,1),H*.22,H*.08);c.fill();c.fillStyle=wc;c.fillRect(-W*.6,-H*.11,W*1.2*clamp(t/6,0,1),5);c.fillRect(-W*.6,H*.11-5,W*1.2*clamp(t/6,0,1),5);c.globalAlpha=1;
 c.scale(sc,sc);c.font=UFI(Math.min(H*.2,W*.15));c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=16;c.strokeStyle='#05060c';c.strokeText('GAME!',0,0);if(!fxLow){c.fillStyle='#2df0ff';c.fillText('GAME!',-6,3);c.fillStyle='#ff2d6a';c.fillText('GAME!',6,-3)}c.fillStyle='#fff';c.fillText('GAME!',0,0);
 if(t>4&&t<40&&!fxLow){c.globalCompositeOperation='lighter';c.globalAlpha=.5;const tw=c.measureText('GAME!').width,sx=-tw/2+(t-4)/36*tw*1.3,gg=c.createLinearGradient(sx-50,0,sx+50,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'#fff');gg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gg;c.fillText('GAME!',0,0)}
 c.restore()}
function uiHeader(t,sub){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.textAlign='left';ctx.fillStyle='#05060c';skewRect(-20,H*.03,Math.max(W*.36,t.length*H*.032+W*.1),H*.075,H*.03);ctx.fill();ctx.fillStyle=UIC.acc;ctx.fillRect(0,H*.03+H*.075-4,Math.max(W*.34,t.length*H*.032+W*.08),4);ctx.font=UFI(H*.045);strokeTxt(t,W*.05,H*.088,6,'#05060c','#fff');if(sub){ctx.font=UF(800,H*.016);ctx.fillStyle=UIC.acc;ctx.fillText(sub,W*.05,H*.025)}ctx.restore()}
