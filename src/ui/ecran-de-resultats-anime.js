'use strict';
// ===== écran de résultats animé
let RSC=[];
const byKD=(a,b)=>(b.kos||0)-(a.kos||0)||(b.dmgDealt||0)-(a.dmgDealt||0)||(b.outAt||1e9)-(a.outAt||1e9)||a.id-b.id; // classement : KO, puis dégâts infligés
/** Winner at TIME UP = first by the owner's ranking (rankCmp: lives, KOs, damage dealt, damage taken); teams: summed the same way. */
function bestId(){if(!TEAMS)return [...P].sort(rankCmp)[0].id;const g={};for(const p of P){const k=TEAMA[p.id];g[k]=g[k]||{st:0,ko:0,d:0,tk:0,m:[]};g[k].st+=Math.max(0,p.stocks|0);g[k].ko+=p.kos||0;g[k].d+=p.dmgDealt||0;g[k].tk+=p.dmgTk||0;g[k].m.push(p)}return Object.values(g).sort((a,b)=>b.st-a.st||b.ko-a.ko||b.d-a.d||a.tk-b.tk||a.m[0].id-b.m[0].id)[0].m.sort(rankCmp)[0].id}
function rankList(){const out=p=>p.outAt||1e12;return [...P].sort((a,b)=>(TEAMS&&winner>=0?(TEAMA[b.id]===TEAMA[winner])-(TEAMA[a.id]===TEAMA[winner]):0)||(!TEAMS&&winner>=0?(b.id===winner)-(a.id===winner):0)||out(b)-out(a)||byKD(a,b))}
const eob=u=>{u=clamp(u,0,1);const c1=1.7,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2)},eo=u=>1-Math.pow(1-clamp(u,0,1),3);
function drawResults(){const t=winT-100,L=rankList(),n=L.length,M=['#ffd23a','#d8e0ea','#e09a5a','#8a8f9a'];
 const a=eo(t/20);ctx.save();ctx.fillStyle='rgba(4,5,12,'+(.72*a)+')';ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.07*a;ctx.fillStyle=TEAMS?TCOL[TEAMA[winner]]:COLS[winner];for(let i=-2;i<W/60+4;i++){const x=i*60+((t*1.2)%60);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+30,0);ctx.lineTo(x+30-H*.4,H);ctx.lineTo(x-H*.4,H);ctx.fill()}ctx.globalAlpha=1;
 if(t===1){RSC=[];for(let i=0;i<120;i++)RSC.push({x:Math.random()*W,y:-Math.random()*H*.6,vx:(Math.random()-.5)*2,vy:1+Math.random()*3,r:Math.random()*6.28,c:['#ffd23a','#ff5a7a','#5ab4ff','#5cff8a','#fff'][i%5]})}
 for(const c of RSC){c.x+=c.vx;c.y+=c.vy;c.r+=.1;if(c.y>H+20){c.y=-10;c.x=Math.random()*W}ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.fillStyle=c.c;ctx.globalAlpha=.85*a;ctx.fillRect(-4,-2,8,4);ctx.restore()}
 const wc=TEAMS?TCOL[TEAMA[winner]]:COLS[winner],title=(TEAMS?TNAME[TEAMA[winner]]+' TEAM':pname(P[winner]))+' WINS!',s=eob(t/22);
 ctx.save();ctx.translate(W/2,H*.17);ctx.scale(s,s);ctx.textAlign='center';ctx.font='bold 58px monospace';ctx.lineWidth=8;ctx.strokeStyle='#000';ctx.strokeText(title,0,0);ctx.fillStyle=wc;ctx.fillText(title,0,0);
 ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.15*Math.sin(t*.12);ctx.fillText(title,0,0);ctx.restore();
 const cw=Math.min(640,W-60),x0=W/2-cw/2;let y=H*.27;
 L.forEach((p,i)=>{const h=i?52:72,st=24+(n-1-i)*16,u=(t-st)/22,e=eob(u);if(u<=0){y+=h+12;return}const x=x0+(1-e)*(W*.7),c=COLS[p.id];
  ctx.save();ctx.globalAlpha=clamp(u*3,0,1);const g=ctx.createLinearGradient(x,0,x+cw,0);g.addColorStop(0,'rgba(20,22,34,.95)');g.addColorStop(1,'rgba(20,22,34,.6)');ctx.fillStyle=g;ctx.fillRect(x,y,cw,h);
  ctx.fillStyle=c;ctx.fillRect(x,y,6,h);if(i===0){ctx.strokeStyle=M[0];ctx.lineWidth=2+Math.sin(t*.15);ctx.shadowColor=M[0];ctx.shadowBlur=18;ctx.strokeRect(x,y,cw,h);ctx.shadowBlur=0;
   const sw=((t-st)*9)%(cw+300)-150;const sg=ctx.createLinearGradient(x+sw-60,0,x+sw+60,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.18)');sg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=sg;ctx.fillRect(x,y,cw,h)}
  ctx.beginPath();ctx.arc(x+40,y+h/2,h*.36,0,TAU);ctx.fillStyle=M[Math.min(i,3)];ctx.fill();ctx.fillStyle='#10121c';ctx.textAlign='center';ctx.font='bold '+(i?20:28)+'px monospace';ctx.fillText(i+1,x+40,y+h/2+(i?7:10));
  if(i===0){ctx.fillStyle=M[0];ctx.font='22px monospace';ctx.fillText('♛',x+40,y-2+Math.sin(t*.1)*2)}
  ctx.textAlign='left';ctx.fillStyle=c;ctx.font='bold '+(i?20:26)+'px monospace';ctx.fillText(pname(p),x+76,y+h/2+(i?2:4));
  if(TEAMS){ctx.fillStyle=TCOL[TEAMA[p.id]];ctx.font='11px monospace';ctx.fillText(TNAME[TEAMA[p.id]]+' TEAM',x+76,y+h-8)}
  ctx.textAlign='right';ctx.fillStyle='#ddd';ctx.font=(i?'':'bold ')+'15px monospace';const k=Math.round((p.kos||0)*clamp(u*1.5,0,1)),dm=Math.round((p.dmgDealt||0)*clamp(u*1.2,0,1));ctx.fillText(k+' KO  ·  '+dm+' dmg'+(p.sd?'  ·  '+p.sd+' self-KO':''),x+cw-16,y+h/2+5);
  if(NET&&ONL&&ONL.rdy&&ONL.rdy.has(p.id)){ctx.fillStyle='#5cff8a';ctx.font='bold 12px monospace';ctx.fillText('✔ READY',x+cw-16,y+14)}
  ctx.restore();y+=h+12});
 ctx.textAlign='center';const fy=Math.max(y+30,H*.8);
 if(NET&&ONL)onlResDraw(fy);else if(t>40){ctx.globalAlpha=clamp((t-40)/20,0,1);ctx.fillStyle='#ccc';ctx.font='16px monospace';ctx.fillText('Enter / A: rematch  ·  V / Y: replay  ·  M / B: menu',W/2,fy);ctx.globalAlpha=1}
 ctx.restore()}
