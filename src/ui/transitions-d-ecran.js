'use strict';
// ---- transitions d'écran : 3 bandes obliques qui balayent
function uiTrans(){const key=mode==='sub'?'sub:'+subT:mode;if(key!==UIT.key){const from=UIT.key;UIT.key=key;if(from&&!(from==='game'&&key==='game'))UIT.t0=UNOW();UIT.acc=UIC.acc;UIT.lab=mode==='sub'?subT.toUpperCase():({menu:'MENU',game:'FIGHT!',items:'ITEMS',binds:'CONTROLS',info:'GUIDE',maker:'MAP MAKER',online:'ONLINE',title:'SHMUP FIGHTER'})[mode]||'';UISUB.t0=UNOW()}
 const u=(UNOW()-UIT.t0)/.55;if(u<0||u>1)return;const c=OC||CTX0;c.save();c.setTransform(1,0,0,1,0,0);const cols=['#05060c',UIT.acc,'#05060c'],bh=H/3+2,sk=H*.18;
 for(let i=0;i<3;i++){const p=clamp(u*1.45-i*.13,0,1),e=p<.5?1-Math.pow(1-p*2,3):1+Math.pow((p-.5)*2,3),x=W*1.15-e*W*1.25,y=i*(H/3);c.fillStyle=cols[i];c.beginPath();c.moveTo(x+sk,y);c.lineTo(x+W*1.25+sk,y);c.lineTo(x+W*1.25,y+bh);c.lineTo(x,y+bh);c.fill();
  c.fillStyle=i===1?'#fff':UIT.acc;c.fillRect(x+sk*.5,y+(i===1?0:bh-4),W*1.25,4);if(i===1&&UIT.lab){c.font=UFI(bh*.55);c.textAlign='left';c.fillStyle='#05060c';c.fillText(UIT.lab,x+W*.32,y+bh*.7)}}
 c.restore()}
