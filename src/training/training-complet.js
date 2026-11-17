'use strict';
// ===== Training complet : affichage des touches, hitbox, remise en place (touches I / H / R, ou boutons du panneau)
const TRX={inp:1,hb:0,log:[],pos:null};
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);TRX.log=[];TRX.pos=P.map(p=>[p.x,p.y]);return r}}});
const trReset=()=>{if(!(TEST&&TEST.train)||!TRX.pos)return;P.forEach((p,i)=>{const q=TRX.pos[i];if(!q)return;Object.assign(p,{x:q[0],y:q[1],vx:0,vy:0,hp:T.HP,state:'idle',t:0,inv:30});if(cams[i]){cams[i].x=p.x;cams[i].y=p.y}});for(const b of B)b.dead=1;sfx('ok00')};
DEFER(()=>{{const K0=onKey;onKey=c=>{if(mode==='game'&&NET&&c==='F9'){NET.dbg=!NET.dbg;return}if(mode==='game'&&TEST&&TEST.train&&!txtOpen()){if(c==='F7'){TRX.inp^=1;return}if(c==='F8'){TRX.hb^=1;return}if(c==='F9'){trReset();return}}return K0(c)}}});
function txtOpen(){return typeof TXI!=='undefined'&&TXI&&TXI.on}
DEFER(()=>{{const D0=drawWorldItems;drawWorldItems=function(){D0();if(!(TEST&&TEST.train&&TRX.hb))return;ctx.save();ctx.lineWidth=1.5;for(const p of P){if(p.state==='dead')continue;ctx.strokeStyle='#ff4060';ctx.beginPath();ctx.arc(p.x,p.y,bodyR(p),0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,T.CORE_R,0,TAU);ctx.fill();ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(120,220,255,.6)';ctx.beginPath();ctx.arc(p.x,p.y,T.GRAZE_R,0,TAU);ctx.stroke();ctx.setLineDash([])}
 ctx.strokeStyle='#ffd23a';let n=0;for(const b of B){if(b.dead||++n>500)continue;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.stroke()}ctx.restore()}}});
DEFER(()=>{{const R0=render;render=()=>{R0();if(mode!=='game'||!(TEST&&TEST.train))return;const p=P.find(q=>!q.cpu);if(!p||!p.in)return;const c=OC||CTX0,I=p.in,b=I.b||{},on=Object.keys(b).filter(k=>b[k]);
 const key=(I.x>.3?'→':I.x<-.3?'←':'')+(I.y>.3?'↓':I.y<-.3?'↑':'')+(on.length?' '+on.join('+'):'');const L=TRX.log;if(!L.length||L[0].k!==key){L.unshift({k:key,n:1});if(L.length>12)L.pop()}else if(!paused)L[0].n++;
 if(!TRX.inp)return;c.save();c.setTransform(1,0,0,1,0,0);const x=12,y=H*.3,w=310;c.globalAlpha=.8;c.fillStyle='#05060c';c.fillRect(x,y,w,24+L.length*17);c.globalAlpha=1;c.fillStyle='#6ff';c.font='bold 12px monospace';c.textAlign='left';c.fillText('INPUTS (F7)  ·  HITBOX (F8)  ·  RESET (F9)',x+6,y+15);
 c.font='12px monospace';L.forEach((e,i)=>{c.fillStyle=i?'#99a':'#fff';c.fillText(String(Math.min(99,e.n)).padStart(2,' ')+'  '+(e.k||'·'),x+8,y+32+i*17)});c.restore()}}});
