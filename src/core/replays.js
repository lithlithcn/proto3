'use strict';
// ---- replays : on enregistre seulement les entrées (+ graine et options), puis on rejoue
let REC=null,REPLAY=null,LASTREC=null;DEFER(()=>{try{LASTREC=JSON.parse(localStorage.getItem('sf_rep')||'null')}catch(e){}});
const encI=(I,p)=>{let m=0;ACTS.forEach((a,k)=>{if(I&&I.b&&I.b[a])m|=1<<k});return[I?I.x||0:0,I?I.y||0:0,m,p&&p.maim?[p.maim[0],p.maim[1]]:0]};
const decI=e=>{const b={};ACTS.forEach((a,k)=>{if(e[2]>>k&1)b[a]=true});return{x:e[0],y:e[1],b}};
DEFER(()=>{{const S0=start;start=m=>{const dn=Date.now,R=REPLAY&&REPLAY.boot?REPLAY:null,t=R?R.dn:dn();Date.now=()=>t;try{S0(m)}finally{Date.now=dn}
 if(R){R.boot=0}else{REPLAY=null;REC=(m==='game'&&!TEST&&!TUT)?{dn:t,o:{nP,nH,stI,mapI,itemsOn,itemOn:JSON.parse(JSON.stringify(itemOn)),cpuLv,maxC,TEAMS,TEAMA:TEAMA.slice(),NERV,TIMER,COMP},f:{}}:null}}}});
const recIn=(p,I)=>{if(REPLAY){const e=REPLAY.f[frame]&&REPLAY.f[frame][p.id];const J=e?decI(e):{x:0,y:0,b:{}};p.maim=e&&e[3]?e[3]:null;return J}if(REC){(REC.f[frame]||(REC.f[frame]=[]))[p.id]=encI(I,p)}return I};
function startReplay(){const R=REC&&Object.keys(REC.f).length?REC:LASTREC;if(!R){big('NO REPLAY','#aaa',30);return}if(REC&&R===REC){LASTREC=REC;try{localStorage.setItem('sf_rep',JSON.stringify(REC))}catch(e){}}
 Object.assign(R,{boot:1});const sv={nP,nH,stI,mapI,itemsOn,cpuLv,maxC,TEAMS,NERV,TIMER,COMP},si=JSON.stringify(itemOn);({nP,nH,stI,mapI,itemsOn,cpuLv,maxC,TEAMS,NERV,TIMER,COMP}=R.o);COMP=!!COMP;if(R.o.itemOn)Object.assign(itemOn,R.o.itemOn);const sTA=TEAMA.slice();if(R.o.TEAMA)R.o.TEAMA.forEach((t,i)=>TEAMA[i]=t);REPLAY=R;REC=null;start('game');({nP,nH,stI,mapI,itemsOn,cpuLv,maxC,TEAMS,NERV,TIMER,COMP}=sv);sTA.forEach((t,i)=>TEAMA[i]=t);Object.assign(itemOn,JSON.parse(si));sfx('ok00')}
DEFER(()=>{{const W0=()=>{};const S1=step;step=()=>{S1();if(mode==='game'&&winner>=0&&REC&&!REC.saved){REC.saved=1;LASTREC=REC;try{localStorage.setItem('sf_rep',JSON.stringify(REC))}catch(e){}}}}});
