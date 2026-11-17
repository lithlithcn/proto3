'use strict';
// ---- tutoriel : nouvelles étapes (charge, hit-confirm, clash, jauge de parade, chaîne d'annulation)
DEFER(()=>{{const ins=(after,st)=>{const i=TSTEPS.findIndex(x=>x.t===after);TSTEPS.splice(i+1,0,st)};
 ins('HIT CANCEL',{t:'HIT CONFIRM',l:()=>['Same idea with Heavy: when a melee attack CONNECTS, press Heavy '+K('heavy')+' during it.','The melee turns into a big danmaku right away: a real combo!','Do it 2 times ("CONFIRM!").'],n:2,c:T=>T.cf});
 ins('BIG DANMAKU',{t:'CHARGED SHOT',l:()=>['HOLD Heavy to charge, release to fire. Tap = normal shot.','Hold 0.3 s = LV 2 (3 bigger balls). Hold 0.8 s = LV 3 (8-ball ring, costs some Spell gauge).','Fire a LV 3 charged shot.'],set:p=>{p.spirit=Math.max(p.spirit,40)},n:1,c:T=>T.lv3});
 ins('PARRY MELEE',{t:'CLASH',dm:'melee',l:()=>['If two melee attacks hit at the same time, they CLASH: both fighters bounce back.','Instead of parrying the dummy\'s slow attack, ATTACK when its ring turns red.','Make 1 clash.'],n:1,c:T=>T.cl});
 ins('CLASH',{t:'GUARD GAUGE',gg:1,l:()=>['Parrying for nothing has a cost: the CYAN bar under you drops each time a parry whiffs.','At 0 your guard is CRUSHED (long stun). It refills fast when you stop parrying.','Whiff parries until the bar is under half, then let it refill.'],n:2,c:(T,p)=>T.gg}); 
 ins('BREAKER',{t:'CANCEL CHAIN',dm:'shoot',l:()=>['Your big danmaku erase the small enemy danmaku they touch.','Each one erased fills your Spell gauge ("CANCEL x…").','Erase 25 small danmaku with big danmaku.'],n:25,c:T=>T.cc})}});
DEFER(()=>{{const E0=tutEnter;tutEnter=i=>{E0(i);Object.assign(TUT,{cf:0,lv3:0,cl:0,gg:0,cc:0,cc0:P[0].ccT||0})}}});
DEFER(()=>{{const K0=tutTick;tutTick=()=>{const T2=TUT,p=P[0];K0();if(!TUT||TUT!==T2)return;for(const t of TX)if(!t.tu2){t.tu2=1;if(t.s==='CONFIRM!')T2.cf++;if(t.s==='CLASH!')T2.cl++}
 if(p.hLv===3&&p.state==='atk')T2.lv3=1;T2.cc=(p.ccT||0)-T2.cc0;const S=TSTEPS[T2.i];if(S.gg){if(T2.gg===0&&p.pg<50)T2.gg=1;if(T2.gg===1&&p.pg>=95)T2.gg=2}}}});

