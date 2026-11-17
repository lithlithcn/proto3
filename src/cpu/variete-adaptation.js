'use strict';
// ---- IA : variété, adaptation, attirance pour les cartes
const CPUACT=['jab','lunge','strong','dashin','heavyF','glide','grab','breaker','heavyN'];
function aiTune(p,o,ai,L,act){if(!ai.w){ai.w={};ai.rep={};ai.lastEvt=frame;ai.hpS=p.hp;ai.ddS=p.dmgDealt||0;ai.styleI=0}
 for(const k in ai.rep)ai.rep[k]*=.993;
 if(Math.abs(p.hp-ai.hpS)>.5||(p.dmgDealt||0)!==ai.ddS){ai.lastEvt=frame;ai.hpS=p.hp;ai.ddS=p.dmgDealt||0}
 if(ai.pend&&frame-ai.pend.f>55){const g=((p.dmgDealt||0)-ai.pend.dd)-(ai.pend.hp-p.hp)*.8,a=ai.pend.a;ai.w[a]=clamp((ai.w[a]||1)*.75+.25*(1+g/8),.15,3);ai.pend=null} // apprend ce qui marche
 if(frame-ai.lastEvt>300){ai.lastEvt=frame;ai.style=['zoner','mid','rush'][(++ai.styleI)%3];ai.s=-ai.s||1;for(const k in ai.w)ai.w[k]=(ai.w[k]+1)/2;ai.aggro=frame+200;ai.want=rng()*4|0} // ça stagne : on change de plan
 if(!act||!CPUACT.includes(act))return act;
 const ok=a=>{const w=ai.w[a]||1,r=ai.rep[a]||0;return rng()<clamp(w/(1+r*.55),.18,1)};
 if(!ok(act)){const alt=CPUACT.filter(a=>a!==act&&(a!=='strong'||o.state==='hitstun')&&(a!=='grab'||o.state==='parry')&&(a!=='breaker'||o.pCnt>1));act=alt.length&&rng()<.6?alt[rng()*alt.length|0]:null}
 if(act){ai.rep[act]=(ai.rep[act]||0)+1;ai.pend={a:act,f:frame,dd:p.dmgDealt||0,hp:p.hp}}return act}

