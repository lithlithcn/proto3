'use strict';
// ---- IA : les CPU évitent aussi les dangers annoncés des items (montagne, vide, lune, piliers, éclairs, rayons)
DEFER(()=>{{const FO=(o,p)=>o!==p.id&&o>=0&&!(TEAMS&&TEAMA[o]===TEAMA[p.id]);const H0=hazard;hazard=(p,x,y)=>{let D=H0(p,x,y);
 for(const e of ENT){if(!FO(e.o,p))continue;switch(e.k){
  case'wbeam':if(e.t<34&&segD(x,y,e.x,e.y,e.x2,e.y2)<44)D+=25;break;
  case'moonf':{const m=250-Math.hypot(x-e.x,y-e.y);if(e.t<80&&m>0)D+=15+m*.1;break}
  case'onbw':if(e.t<60&&Math.hypot(x-e.x,y-e.y)<80)D+=20;break;
  case'bolt':if(e.t<45&&Math.hypot(x-e.x,y-e.y)<66)D+=20;break;
  case'geyser':if(e.t<45&&Math.hypot(x-e.x,y-e.y)<76)D+=20;break;
  case'sand':case'whirl':if(Math.hypot(x-e.x,y-e.y)<(e.r||80))D+=4;break}}
 const V=CX.void;if(V&&V.cells.length&&FO(V.o,p)&&frame<=V.open+2){let m=0;for(const c of V.cells){const k=Math.min(x-c.x+16,c.x+c.w+16-x,y-c.y+16,c.y+c.h+16-y);if(k>m)m=k}if(m>0)D+=25+m*.15}
 const M=CX.mtn;if(M&&FO(M.o,p)&&M.t<175){const m=M.w/2+50-Math.abs(x-M.x);if(m>0)D+=25+m*.12}
 return D}}});
