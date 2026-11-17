'use strict';
// ===== ANIMATIONS v3 : navigation du hub, titre vivant, HUD animé, bannières, intro de match, GAME!, pause
const HUBG={0:{r:1,d:3},1:{l:0,d:2},2:{l:0,u:1,d:6},3:{u:0,l:7,r:4},4:{u:0,l:3,r:5},5:{u:0,l:4,r:6},6:{u:2,l:5,r:7},7:{u:2,l:6,r:3}};
DEFER(()=>{hubMove=(dx,dy)=>{const g=HUBG[UIHUB.sel]||{},k=dx>0?'r':dx<0?'l':dy>0?'d':'u';if(g[k]!==undefined){UIHUB.sel=g[k];sfx('se_select00',.6)}else{UIHUB.bump=UNOW();UIHUB.bd=[dx,dy];sfx('se_select00',.3,.7)}};});
