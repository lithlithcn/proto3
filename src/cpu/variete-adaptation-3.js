'use strict';
// ---- IA : si personne ne prend de dégâts pendant 12 s, les CPU passent en style « rush » jusqu'au prochain coup (évite les parties sans fin)
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const ai=p.ai;if(ai&&ai.style){if(ai.hp0!==p.hp){ai.hp0=p.hp;ai.lh=frame}const lh=Math.max(...P.map(q=>q.ai&&q.ai.lh||0));
 if(frame-lh>720){if(!ai.st0){ai.st0=ai.style;ai.style='rush'}}else if(ai.st0){ai.style=ai.st0;ai.st0=null}}return C0(p,o)}}});
