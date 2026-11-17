'use strict';
// ---- IA : avec Barrage (balles lentes), le CPU anticipe le déplacement de sa cible au lieu de viser sa position actuelle
DEFER(()=>{{const C1=cpuInput;cpuInput=(p,o)=>{const I=C1(p,o);if(p.shotT===3&&o&&o.state!=='dead'&&!CX.don){const a=aimPt(o),d=Math.hypot(a[0]-p.x,a[1]-p.y),t=Math.min(70,d/4)*.7;p.maim=[a[0]+o.vx*t,a[1]+o.vy*t]}else if(p.cpu)p.maim=null;return I}}});
