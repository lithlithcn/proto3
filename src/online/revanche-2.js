'use strict';
// ===== En ligne : ping visible + émotes rapides (touches 1-4, manette : Select)
const EMO={},EML=['GG!','NICE!','WOW!','OOPS'];
const emoSend=k=>{if(!NET||mode!=='game')return;const m={t:'emo',g:NET.g,p:NET.L,k};try{NET.send(m)}catch(e){}EMO[NET.L]={k,t:UNOW()};sfx('se_select00',.4)};
DEFER(()=>{{const R0=netRecv;netRecv=m=>{if(m&&m.t==='emo'){if(typeof m.p==='number'&&m.p>=0&&m.p<4&&EML[m.k|0])EMO[m.p]={k:m.k|0,t:UNOW()};return}return R0(m)}}});
DEFER(()=>{{const K0=onKey;onKey=c=>{if(NET&&mode==='game'&&!txtOpen()&&/^Digit[1-4]$/.test(c||'')){emoSend(+c.slice(5)-1);return}return K0(c)}}});
let emoPad=false;
DEFER(()=>{{const R0=render;render=()=>{R0();if(mode!=='game'||!NET)return;const g=pads()[0],sel=!!(g&&g.buttons[8]&&g.buttons[8].pressed);if(sel&&!emoPad)emoSend(0);emoPad=sel;const c=OC||CTX0,v=Object.values(MVIEW)[0];c.save();c.setTransform(1,0,0,1,0,0);
 c.textAlign='right';c.font='bold 12px monospace';const r=Math.round(NET.rtt||0);c.fillStyle=r<80?'#5cff8a':r<150?'#ffd23a':'#ff5a5a';c.fillText('PING '+r+' ms',W-14,H-14);
 c.textAlign='center';for(const id in EMO){const e=EMO[id],q=P[id],age=UNOW()-e.t;if(age>2.2||!q||!v){if(age>2.2)delete EMO[id];continue}const x=(q.x-v.cx)*v.sc+v.ox,y=(q.y-v.cy)*v.sc+v.oy-70-age*10;c.globalAlpha=Math.min(1,(2.2-age)*3);c.fillStyle='#fff';c.strokeStyle=COLS[id];c.lineWidth=3;c.font='bold 18px sans-serif';const t=EML[e.k],tw=c.measureText(t).width+18;c.fillRect(x-tw/2,y-18,tw,26);c.strokeRect(x-tw/2,y-18,tw,26);c.fillStyle='#05060c';c.fillText(t,x,y+1)}c.restore()}}});
