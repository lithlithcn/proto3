'use strict';
// ---- branchements : navigation, rendu, transitions
DEFER(()=>{{const N0=nav;nav=ev=>{if(mode==='title'){if(ev)titleGo();return}if(mode==='menu'){if(ev==='up')hubMove(0,-1);else if(ev==='down')hubMove(0,1);else if(ev==='left')hubMove(-1,0);else if(ev==='right')hubMove(1,0);else if(ev==='ok')hubGo();else if(ev==='back'){mode='title';UITITLE.t0=UNOW();sfx('cancel00')}else if(ev==='tabL'||ev==='tabR'){UIHUB.sel=(UIHUB.sel+(ev==='tabL'?HUB.length-1:1))%HUB.length;sfx('se_select00',.6)}return}return N0(ev)}}});
DEFER(()=>{{const K0=onKey;onKey=c=>{if(mode==='title'){if(c&&!/^F\d+$/.test(c)){unlock();titleGo()}return}K0(c)}}});
DEFER(()=>{{const R0=render;render=()=>{if(mode==='title'){musTick();if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();GLR.flush()}ctx.setTransform(1,0,0,1,0,0);setFilter('');drawTitle();uiTrans();return}R0();uiTrans()}}});
DEFER(()=>{mode='title';});
