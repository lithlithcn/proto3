'use strict';
// ---- CPU 8-9 : parade parfaite garantie + pas d'attaque dans un coup qui arrive
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const I=C0(p,o);if(cpuLv<8||REPLAY||p.state==='dead')return I;const L9=cpuLv>=9;let th=99,mel=0;
 for(const b of B){if(!b.heavy||b.dead||b.owner===p.id||b.fz||b.fake||b.np||b.breaker)continue;if(TEAMS&&P[b.owner]&&ally(P[b.owner],p))continue;if(Math.abs(b.x-p.x)>420||Math.abs(b.y-p.y)>420)continue;const t=tti(b,p.x,p.y,b.r+T.PARRY_R-3);if(t>=0&&t<th&&t>=p.inv)th=t} // invincible à l'arrivée : inutile de parer
 for(const q of P){if(q===p||q.state!=='atk'||!q.mv||q.mv.spd||q.mvName==='grab'||ally(q,p))continue;const m=q.mv,d=Math.hypot(q.x-p.x,q.y-p.y);const ta=Math.max(1,m.start-q.t+1),fx=q.x+q.vx*ta-p.x-p.vx*ta,fy=q.y+q.vy*ta-p.y-p.vy*ta,df=Math.min(d,Math.hypot(fx,fy));if(df>(m.range||40)*(q.giant>0?1.6:1)*(q.fx&&q.fx.laev>0?2.2:1)+bodyR(p)+4)continue;{const da=Math.atan2(Math.sin(Math.atan2(p.y-q.y,p.x-q.x)-(q.atkA??q.aim)),Math.cos(Math.atan2(p.y-q.y,p.x-q.x)-(q.atkA??q.aim)));if(df>T.BODY_R*2&&Math.abs(da)>(m.arc||1.6)/2+.12)continue}if(q.hitDone||q.t>m.start+(m.act||4))continue;const t=Math.max(0,m.start-q.t);if(t<th&&m.start+(m.act||4)-q.t>p.inv){th=t;mel=1}} // coup déjà actif = menace immédiate
 if(L9&&th<=30&&(I.b.melee||I.b.heavy)&&!I.b.parry||!L9&&th<=9){I.b.melee=I.b.heavy=false} // ne lance pas d'attaque dans un coup qui arrive
 if(L9&&th<=20&&I.b.dash)I.b.dash=false;
 if(L9&&I.b.heavy&&o&&o.state!=='hitstun'&&o.state!=='parrystun'&&o.state!=='dead'&&Math.hypot(o.x-p.x,o.y-p.y)<bodyR(o)+bodyR(p)+80){I.b.heavy=false;if(Math.hypot(o.x-p.x,o.y-p.y)<bodyR(o)+bodyR(p)+40)I.b.melee=true} // la parade parfaite vaut mieux qu'un dash qui finit dans la balle
 if(L9&&I.b.parry&&p.inv>2&&p.state==='idle')I.b.parry=false;
 if(L9&&I.b.parry&&(th>2||hitstop>0)&&!KOB.length&&!KOFX.length&&p.state!=='parry')I.b.parry=false; // pas de parade trop tôt
 const can=p.state==='idle';if(p.state==='parry')I.b.parry=!!p.prev&&!!p.prev.parry; // déjà en parade : on maintient, sans nouvel appui
 if(can&&th<=(L9?1:2)&&!(L9&&hitstop>0)&&(L9||rng()<.85)){I.b.parry=true;I.b.melee=I.b.heavy=I.b.dash=false} // parade au dernier moment
 return I}}});
DEFER(()=>{{const T0=aiTune;aiTune=(p,o,ai,L,act)=>cpuLv>=8&&act&&CPUACT.includes(act)?(((ai.rep||(ai.rep={}))[act]=(ai.rep[act]||0)*.99+1)>6&&rng()<.3?T0(p,o,ai,L,act):act):T0(p,o,ai,L,act)}}); // niveaux 8-9 : pas d'action au hasard

