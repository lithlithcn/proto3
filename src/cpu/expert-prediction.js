'use strict';
// ---- CPU 8-9 : prédiction (vise là où tu SERAS, punit la fin de tes attaques)
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const I=C0(p,o);if(cpuLv<8||!o||o.state==='dead'||REPLAY)return I;const d=Math.hypot(o.x-p.x,o.y-p.y);
 const sp=(MOVES.heavyF&&MOVES.heavyF.spd)||7,t=clamp(d/sp,0,40);p.maim=[o.x+o.vx*t*.85,o.y+o.vy*t*.85]; // tir en avance

 return I}}});

