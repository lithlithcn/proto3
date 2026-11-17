'use strict';
// ---- écran titre : le logo tremble quand on bouge, son « title » à la validation
DEFER(()=>{UITITLE.shk=0;});const titleShake=k=>{UITITLE.shk=Math.min(1.2,UITITLE.shk+k)};
DEFER(()=>{addEventListener('mousemove',e=>{if(mode==='title')titleShake(Math.min(.25,(Math.abs(e.movementX||0)+Math.abs(e.movementY||0))/120))});});
DEFER(()=>{titleGo=function(){if(mode!=='title')return;mode='menu';sfx('titleclick',1)};});
DEFER(()=>{{const N0=nav;nav=ev=>{if(mode==='title'){if(ev==='up'||ev==='down'||ev==='left'||ev==='right'||ev==='tabL'||ev==='tabR'){titleShake(.7);sfx('se_select00',.35,.8+Math.random()*.4);return}if(ev)titleGo();return}return N0(ev)}}});
DEFER(()=>{{const K0=onKey;onKey=c=>{if(mode==='title'&&/^(Arrow|Key[WASDQE]$)/.test(c||'')){unlock();nav({ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[c]||'left');return}K0(c)}}});
