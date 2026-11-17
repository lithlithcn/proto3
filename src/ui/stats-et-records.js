'use strict';
// ===== Stats et records (sauvegardés, par nom de joueur local)
let STATS;DEFER(()=>{STATS=(()=>{try{return JSON.parse(localStorage.getItem('sf_stats')||'{}')}catch(e){return{}}})()});
const stSave=()=>{try{localStorage.setItem('sf_stats',JSON.stringify(STATS))}catch(e){}};
const ST0=()=>({m:0,w:0,ko:0,dmg:0,dth:0,sec:0,pmax:0,cmax:0,it:{}});
const STM={done:true,f0:0,pm:{},cm:{}};
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);if(mode==='game'){STM.done=!!(TEST&&TEST.train);STM.f0=frame;STM.pm={};STM.cm={}}return r}}});
DEFER(()=>{{const G0=give0;give0=(p,t)=>{if(p&&!p.cpu&&!RESIM&&mode==='game'&&(!NET||p.id===NET.L)){const k=pname(p);(STATS[k]=STATS[k]||ST0()).it[t]=(STATS[k].it[t]||0)+1}return G0(p,t)}}});
DEFER(()=>{{const S0=step;step=()=>{S0();if(mode!=='game'||RESIM)return;for(const p of P){if(p.pChain>(STM.pm[p.id]||0))STM.pm[p.id]=p.pChain;if(p.comboN>(STM.cm[p.id]||0))STM.cm[p.id]=p.comboN}
 if(winner>=0&&!STM.done){STM.done=true;const sec=Math.round((frame-STM.f0)/60),wt=TEAMS?TEAMA[winner]:winner;
  for(const p of P){if(p.cpu||NET&&p.id!==NET.L)continue;const k=pname(p),s=STATS[k]=STATS[k]||ST0();s.m++;if((TEAMS?TEAMA[p.id]:p.id)===wt)s.w++;s.ko+=p.kos||0;s.dmg+=Math.round(p.dmgDealt||0);s.dth+=Math.max(0,STOCKS[stI]-p.stocks);s.sec+=sec;s.pmax=Math.max(s.pmax,STM.pm[p.id]||0);s.cmax=Math.max(s.cmax,STM.cm[p.id]||0)}stSave()}}}});
const RECL=()=>{const L=Object.entries(STATS).sort((a,b)=>b[1].m-a[1].m);if(!L.length)return[{t:()=>'No match played yet: your records will appear here.'}];const R=[];
 for(const[k,s]of L.slice(0,6)){const top=Object.entries(s.it).sort((a,b)=>b[1]-a[1])[0],it=top&&ITEMS.find(i=>i.k===top[0]);
  R.push({t:()=>k+'  ·  '+s.m+' matches  ·  '+s.w+' wins ('+(s.m?Math.round(100*s.w/s.m):0)+'%)'},{t:()=>'   KO '+s.ko+'  ·  damage '+s.dmg+'  ·  lives lost '+s.dth+'  ·  '+Math.round(s.sec/60)+' min played'},{t:()=>'   best parry chain x'+s.pmax+'  ·  best combo '+s.cmax+(it?'  ·  favorite item: '+it.name:'')})}
 return R};
DEFER(()=>{{const i=MENU.findIndex(r=>/^Profiles/.test(r.t()));if(i>=0)MENU.splice(i,0,{t:()=>'Records…',f:()=>openSub('RECORDS',RECL)})}});
