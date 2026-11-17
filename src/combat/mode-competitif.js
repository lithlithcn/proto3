'use strict';
// ===== mode compétitif + usure des combos =====
let CSAV=null;
DEFER(()=>{{const S0=start;start=m=>{if(m==='game'&&COMP&&!TEST){if(!CSAV)CSAV={TIMER};const a=stI,b=itemsOn;stI=3;itemsOn=false;TIMER=5;S0(m);stI=a;itemsOn=b}else{if(CSAV){TIMER=CSAV.TIMER;CSAV=null}S0(m)}}}});
DEFER(()=>{{const S0=step;step=()=>{if(COMP&&CSAV&&mode==='game'){CARDS.length=0;itemT=0}S0()}}});
DEFER(()=>{{const R0=render;render=()=>{if(CSAV&&mode!=='game'&&mode!=='pause'){TIMER=CSAV.TIMER;CSAV=null}R0()}}});
DEFER(()=>{{const T0=timeUp;timeUp=()=>{if(!COMP||TEAMS)return T0();const al=P.filter(p=>p.stocks>0||p.state!=='dead'),mx=Math.max(...al.map(p=>p.stocks)),top=al.filter(p=>p.stocks===mx);if(top.length<2)return T0();
 for(const p of P)if(!top.includes(p)&&p.state!=='dead'){p.stocks=0;p.inv=0;p.hp=0;ko(p,'TIME')}for(const p of top){p.stocks=1;p.hp=1}TIMER=0;big('SUDDEN DEATH!','#ff4040',90);flash(.3,'#ff4040')}}});
DEFER(()=>{{const H0=hit;hit=(v,a,dx,dy,m,mult,heavy)=>{if(a&&a!==v&&m&&m.stun){const M=v.stM||(v.stM=new Map()),r=M.get(m),n=r&&frame-r.f<120?r.n:0;M.set(m,{n:n+1,f:frame});if(n>0)m={...m,stun:m.stun*Math.max(.4,1-.08*n)}}return H0(v,a,dx,dy,m,mult,heavy)}}});
