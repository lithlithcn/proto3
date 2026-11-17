'use strict';
// ---- porte audio : le navigateur bloque le son tant qu'il n'y a ni clic ni touche (la manette ne compte pas) → écran clair « clique pour jouer »
let AGT=0,AGN=0;DEFER(()=>{for(const e of['pointerdown','mousedown','keydown','touchstart'])addEventListener(e,()=>{AGT=performance.now()},true);});
const aLock=()=>AC&&AC.state!=='running';
DEFER(()=>{{const T0=titleGo;titleGo=function(){if(aLock()){AGN=performance.now();return}return T0()}}});DEFER(()=>{for(const e of['pointerdown','mousedown','mouseup','click','keydown','keyup','touchstart','touchend'])addEventListener(e,ev=>{if(mode!=='title'||!aLock())return;ev.stopImmediatePropagation();if(e!=='keydown'||!/^F\d+$/.test(ev.key))ev.preventDefault();AC.resume().catch(()=>{});if(typeof MAUD!=='undefined'&&MAUD&&MAUD.pend&&MCUR){MAUD.pend=0;MAUD.play().catch(()=>{})}},true);});
DEFER(()=>{{const R0=render;render=()=>{R0();if(mode!=='title'||!aLock())return;const c=OC||CTX0,t=performance.now()/1000,n=Math.max(0,1-(performance.now()-AGN)/1500);c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=.78;c.fillStyle='#05030c';c.fillRect(0,0,W,H);c.globalAlpha=1;c.textAlign='center';
 const k=Math.min(W/1280,H/720),y=H*.74,p=1+.05*Math.sin(t*5)+n*.12*Math.sin(t*40);c.translate(W/2+n*Math.sin(t*60)*8,y);c.scale(p,p);
 c.font='bold '+(60*k|0)+'px sans-serif';c.lineWidth=8*k;c.strokeStyle='#000';c.fillStyle=n>0?'#ff5a7a':'#fff';c.strokeText('CLICK TO ENABLE SOUND',0,0);c.fillText('CLICK TO ENABLE SOUND',0,0);
 c.font=(22*k|0)+'px monospace';c.fillStyle=n>0?'#ffb0c0':'#c8b8ff';const m=n>0?'Your browser needs ONE mouse click or key press to turn the sound on':'or press any key on your keyboard';c.strokeText(m,0,50*k);c.fillText(m,0,50*k);c.restore()}}});

