'use strict';
// ================= Effets =================
const txt=(x,y,s,c,z=16)=>TX.push({x,y,s,c,z,t:50});
function burst(x,y,c,n){for(let i=0;i<n&&FX.length<500;i++){const a=Math.random()*TAU,s=2+Math.random()*4;FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:20+Math.random()*15|0,c})}}
const spark=(x,y)=>burst(x,y,'#bdf',2);
function stepFx(){
 for(const f of FX){if(f.vx){f.x+=f.vx;f.vx*=.92}if(f.vy){f.y+=f.vy;f.vy*=.92}f.t--}
 for(const t of TX){t.y-=.6;t.t--}
 for(const r of RINGS){r.r+=(r.m-r.r)*.25;r.t--}
 for(const k of KOFX)k.t--;for(const w of WAVES)w.t--;for(const l of LINES)l.t--;if(invF>0)invF--;kx*=.8;ky*=.8;for(const c of CRACK)c.t--;for(const g of GZ)g.t--;for(const b of BIG)b.t--;chroma*=.85;bright*=.85;focusL*=.9;zblur*=.85;borderF.t--;bgF.t--;
 for(const a of [FX,TX,RINGS,KOFX,WAVES,LINES,CRACK,GZ,BIG]){let w=0;for(const x of a)if(x.t>0)a[w++]=x;a.length=w}if(LINES.length>240)LINES.splice(0,LINES.length-240);if(RINGS.length>120)RINGS.splice(0,RINGS.length-120);if(WAVES.length>60)WAVES.splice(0,WAVES.length-60);if(TX.length>80)TX.splice(0,TX.length-80)
 shake=shake>.3?shake*.86:0;zk*=.9;flashS*=.85}
