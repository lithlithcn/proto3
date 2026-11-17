'use strict';
// ---- dernière vie (1v1) : musique dédiée, zoom, flash, bannière, vignette qui bat comme un cœur
const LS={on:0,t0:0,id:null,init:0,p:-1};
function lsCheck(){if(mode!=='game'||TEST||(typeof TUT!=='undefined'&&TUT)){LS.on=0;return}if(LS.id!==MINTRO){LS.id=MINTRO;LS.on=0;LS.init=0}if(frame<10)LS.init=Math.max(LS.init,...P.map(p=>p.stocks));
 if(!LS.on&&winner<0&&P.length===2&&LS.init>1&&P.every(p=>p.stocks>0)){const q=P.find(p=>p.stocks===1);if(q){LS.on=1;LS.t0=UNOW();LS.p=q.id;sfx('critical_hit',1);sfx('alert',.8);sfx('se_enep01',.6)}}}
const LSZoom=()=>{if(!LS.on||mode!=='game')return 1;const d=UNOW()-LS.t0,env=d<.12?d/.12:d<.7?1:d<1.8?1-(d-.7)/1.1:0,beat=Math.pow(Math.max(0,Math.sin(UNOW()*Math.PI*2*1.1)),12);return 1+(fxLow?.12:.32)*env+.025*beat};
function drawLastStock(){if(!LS.on||mode!=='game'||winner>=0&&winT>=100)return;const c=OC||CTX0,t=UNOW(),d=t-LS.t0,q=P[LS.p];c.save();c.setTransform(1,0,0,1,0,0);
 const beat=Math.pow(Math.max(0,Math.sin(t*Math.PI*2*1.1)),8),vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(255,0,40,0)');vg.addColorStop(1,'rgba(255,0,40,'+(.12+.16*beat)+')');c.fillStyle=vg;c.fillRect(0,0,W,H);
 if(d<2.6){if(d<.18){c.globalAlpha=(1-d/.18)*.8;c.fillStyle='#fff';c.fillRect(0,0,W,H);c.globalAlpha=1}
  const inn=clamp(d/.2,0,1),out=clamp((d-2.1)/.5,0,1),lb=H*.13*inn*(1-out);c.fillStyle='#000';c.fillRect(0,0,W,lb);c.fillRect(0,H-lb,W,lb);
  for(let i=0;i<5;i++){const u=clamp((d-i*.05)/.35,0,1),x=-W+u*W*2.6;c.globalAlpha=.5*(1-out);c.fillStyle=i%2?'#ff2d55':'#fff';c.beginPath();c.moveTo(x,H*(.2+i*.13));c.lineTo(x+W*.6,H*(.16+i*.13));c.lineTo(x+W*.6,H*(.165+i*.13));c.lineTo(x,H*(.205+i*.13));c.fill()}c.globalAlpha=1;
  const e=clamp(d/.16,0,1),sc=e<1?2.6-1.6*e:1+.03*Math.sin(d*18),sh=d<.4?(Math.random()-.5)*18*(1-d/.4):0;c.translate(W/2+sh+out*W,H*.45+sh);c.rotate(-.07);c.globalAlpha=1-out;
  c.fillStyle='rgba(5,6,12,.88)';skw(-W*.42,-H*.1,W*.84,H*.2,H*.07);c.fill();c.fillStyle='#ff2d55';c.fillRect(-W*.42,-H*.1,W*.84,6);c.fillRect(-W*.42+H*.0,H*.1-6,W*.84,6);
  c.save();c.scale(sc,sc);c.font=UFI(Math.min(H*.14,W*.1));c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=14;c.strokeStyle='#05060c';c.strokeText('LAST STOCK!',0,0);if(!fxLow){c.fillStyle='#2df0ff';c.fillText('LAST STOCK!',-5,2);c.fillStyle='#ff2d6a';c.fillText('LAST STOCK!',5,-2)}c.fillStyle='#fff';c.fillText('LAST STOCK!',0,0);c.restore();
  if(q&&d>.25){const u=clamp((d-.25)/.25,0,1);c.globalAlpha=(1-out)*u;c.font=UF(900,H*.03);c.textAlign='center';c.fillStyle=COLS[q.id];c.fillText(pname(q).toUpperCase()+'  ·  ONE LIFE LEFT',(1-u)*80,H*.135)}}
 c.restore()}
DEFER(()=>{{const R0=render;render=()=>{lsCheck();R0();drawLastStock()}}});
