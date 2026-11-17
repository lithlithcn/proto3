'use strict';
// ---- écran titre
let UITITLE;DEFER(()=>{UITITLE={t0:UNOW(),go:0}});
function drawTitle(){hot=[];const t=UNOW()-UITITLE.t0;UIC.acc='#ff3355';uiBG('SHMUP FIGHTER  ');ctx.save();ctx.textAlign='center';
 const e=clamp(t/.7,0,1),eb=1+2.7*Math.pow(e-1,3)+1.7*Math.pow(e-1,2);UITITLE.shk*=.9;const tsh=UITITLE.shk*9;ctx.translate(W/2+(Math.random()-.5)*tsh,H*.42+(Math.random()-.5)*tsh);ctx.rotate(-.06+(Math.random()-.5)*UITITLE.shk*.02);ctx.scale(eb,eb);
 ctx.fillStyle='#ff3355';skewRect(-W*.36,-H*.13,W*.72,H*.2,H*.05);ctx.fill();ctx.fillStyle='#05060c';skewRect(-W*.35+6,-H*.13+6,W*.72-12,H*.2-12,H*.05);ctx.fill();
 ctx.font=UFI(Math.min(W*.085,H*.15));strokeTxt('SHMUP FIGHTER',0,H*.025,10,'#05060c','#fff');ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.25*Math.sin(t*3);ctx.fillStyle='#ff3355';ctx.fillText('SHMUP FIGHTER',4,H*.025+3);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 ctx.font=UF(800,H*.03);ctx.fillStyle='#ffd23a';ctx.fillText('TOUHOU  DANMAKU  BRAWLER',0,H*.1);ctx.restore();
 if(t>.6){ctx.save();ctx.textAlign='center';ctx.globalAlpha=.55+.45*Math.sin(t*4.5);ctx.font=UFI(H*.042);strokeTxt('PRESS ANY BUTTON',W/2,H*.75,6,'#05060c','#fff');ctx.restore()}
 ctx.save();ctx.textAlign='center';ctx.font='12px monospace';ctx.fillStyle='#777';ctx.fillText('Fan game · not affiliated with Team Shanghai Alice',W/2,H-18);ctx.restore();
 hot.push({x:0,y:0,w:W,h:H,hover:()=>{},click:()=>titleGo()})}
function titleGo(){if(mode!=='title')return;mode='menu';sfx('ok00');sfx('se_cardget',.6)}
