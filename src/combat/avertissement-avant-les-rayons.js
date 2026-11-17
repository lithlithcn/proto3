'use strict';
// ===== avertissement avant les rayons instantanés =====
function warnBeam(o,x,y,x2,y2,c,fire){if(!P[o])return fire();sfx('aimreal',1.7);ENT.push({k:'wbeam',o,t:36,x,y,x2,y2,c,fire})}
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0)return;for(const e of ENT)if(e.k==='wbeam'&&e.t===1&&e.fire){const f=e.fire;e.fire=null;f()}}}});
DEFER(()=>{{const R0=drawWorldItems;drawWorldItems=(...a)=>{R0(...a);for(const e of ENT)if(e.k==='wbeam'&&e.fire){const u=1-e.t/36;ctx.save();ctx.globalAlpha=.25+.45*u*((frame>>2)&1?1:.6);ctx.strokeStyle=e.c;ctx.lineWidth=1.5+u*5;ctx.setLineDash([14,10]);ctx.lineDashOffset=-frame*3;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x2,e.y2);ctx.stroke();ctx.restore()}}}});

DEFER(()=>{{const H0=hazard;hazard=(p,x,y)=>{let D=H0(p,x,y);for(const e of ENT)if(e.k==='wbeam'&&e.fire&&e.o!==p.id&&segD(x,y,e.x,e.y,e.x2,e.y2)<bodyR(p)+14)D+=60;return D}}});
