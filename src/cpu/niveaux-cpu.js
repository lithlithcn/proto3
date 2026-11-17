'use strict';
// ---- niveaux CPU : filtre débutant (1-3) et mode expert (8-9)
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const I=C0(p,o),ai=p.ai;if(p.state==='dead')return I;
 if(cpuLv<=3){const n=(4-cpuLv)/3,r=v=>rng()<v; // 1 : joueur qui ne connaît pas les touches
  if(ai.hes>0){ai.hes--;I.x=I.y=0;I.b={shot:ai.hs};return I}if(r(.012*n)){ai.hes=25+rng()*50|0;ai.hs=r(.4)}
  for(const k of['parry','dash','burst','spell','focus','next','prev'])if(I.b[k]&&r(n))I.b[k]=false;if(I.b.heavy&&r(.8*n))I.b.heavy=false;if(I.b.melee&&r(.5*n))I.b.melee=false;
  if(((frame+p.id*37)%120)<60*n)I.b.shot=false; // tire par à-coups
  ai.lx=(ai.lx||0)+(I.x-(ai.lx||0))*(.06+.9*(1-n));ai.ly=(ai.ly||0)+(I.y-(ai.ly||0))*(.06+.9*(1-n));I.x=ai.lx*(1-.4*n);I.y=ai.ly*(1-.4*n)}
 else if(cpuLv>=8){if(p.state==='idle'&&!I.b.melee&&!I.b.heavy)I.b.shot=true; // pression constante
  if(cpuLv>=9&&p.state==='idle'&&o.state!=='dead'){const d=Math.hypot(o.x-p.x,o.y-p.y);if(o.state==='idle'&&d>300&&(ai.aggro||0)<frame)ai.aggro=frame+120;
   if(p.spirit>=T.SPELL_COST&&(o.state==='hitstun'||o.state==='parrystun'||o.state==='dashlag')&&d<350)I.b.spell=true}} // spell sur ouverture
 return I}}});

