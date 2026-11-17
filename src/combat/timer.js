'use strict';
// ---- timer, fin de match au temps, classement, montée du son en fin de partie
function drawTimer(){if(!TIMER||TEST)return;const r=Math.max(0,TIMER*3600-frame),s=Math.ceil(r/60),lw=r<600;ctx.save();ctx.translate(W/2,44);if(lw){const z=1+.15*Math.max(0,1-(r%60)/20);ctx.scale(z,z)}
 ctx.textAlign='center';ctx.font='bold 24px monospace';ctx.lineWidth=5;ctx.strokeStyle='#000';const t=(s/60|0)+':'+String(s%60).padStart(2,'0');ctx.strokeText(t,0,0);ctx.fillStyle=r<1800?'#ff5a5a':'#fff';ctx.fillText(t,0,0);ctx.restore()}
function timeUp(){const g={};for(const p of P){const k=TEAMS?TEAMA[p.id]:p.id;g[k]=g[k]||{k,st:0,hp:0,id:p.id};g[k].st+=Math.max(0,p.stocks);g[k].hp+=p.state==='dead'?0:Math.max(0,p.hp)}
 winner=bestId();winT=0;big('TIME UP!','#fff',100);sfx('timeout')}
DEFER(()=>{{const S0=step;step=()=>{const f0=frame;S0();if(mode!=='game'||TEST||frame===f0)return;
 if(TIMER&&winner<0){const r=TIMER*3600-frame;if(r<=0)timeUp()}
 const al=P.filter(q=>q.stocks>0),gr=new Set(al.map(q=>TEAMS?TEAMA[q.id]:q.id)).size,mh=Math.min(...al.map(q=>q.state==='dead'?T.HP:q.hp));
 const tg=gr===2&&al.every(q=>q.stocks===1)?1+.05*clamp((40-mh)/40,0,1):1;ENDK+=(tg-ENDK)*.02}}}); // derniers survivants, l'un presque mort : le son monte jusqu'à +5 %
function drawRank(){const L=[...P].sort((a,b)=>(b.kos||0)-(a.kos||0)||(b.outAt||1e9)-(a.outAt||1e9)||(b.dmgDealt||0)-(a.dmgDealt||0)),M=['#ffd23a','#c8d0d8','#d08a4a','#8a8f9a'];
 ctx.textAlign='center';L.forEach((p,i)=>{const y=H/2+80+i*30;ctx.font=(i?'':'bold ')+(22-i*2)+'px monospace';ctx.fillStyle=M[i];ctx.fillText('#'+(i+1)+'  '+pname(p)+'   '+(p.kos||0)+' KO'+(p.sd?'  ·  '+p.sd+' self-KO':''),W/2,y)})}


function actsPrune(){for(const q of P)if(q.acts&&q.acts.length)q.acts=q.acts.filter(a=>q.state!=='dead'&&frame-a.f<a.T+30&&!(frame-a.f>90&&!xActive(q)))}
function drawActs(){if(TEST&&TEST.k)return;const L=[];for(const q of P){const qa=(q.acts||[]).filter(a=>q.state!=='dead'&&frame-a.f<a.T+30&&!(frame-a.f>90&&!xActive(q)));for(const a of qa){const it=ITEMK[a.k];if(it)L.push([q,a,it])}}
 if(!L.length)return;const sc=Math.min(1,W/1100),w=Math.min(620,W-30);ctx.save();ctx.textAlign='center';ctx.lineJoin='round';
 const tm=a=>a.ht?'  '+Math.max(0,Math.ceil((a.T-(frame-a.f))/60))+'s':'',col=it=>it.c==='rainbow'?rainbowCol():it.c;
 const full=L.filter(([q,a])=>frame-a.f<200).slice(-2),chips=L.filter(x=>!full.includes(x)); // nouveaux pouvoirs : règle complète 3 s, ensuite une simple ligne
 const tx=(t,x,yy,c,lw)=>{ctx.lineWidth=lw;ctx.strokeStyle='rgba(0,0,0,.9)';ctx.strokeText(t,x,yy);ctx.fillStyle=c;ctx.fillText(t,x,yy)};
 if(chips.length){ctx.font='bold '+Math.round(12*sc+2)+'px monospace';const ln=chips.map(([q,a,it])=>[pname(q)+' · '+it.name+tm(a),col(it)]);ctx.globalAlpha=.7;ln.slice(0,6).forEach(([t,c],i)=>tx(t,W/2,70+i*15*sc+i*2,c,3))}
 if(full.length){const fs=Math.round(15*sc+1),B=full.map(([q,a,it])=>({it,t:pname(q)+' · '+it.name.toUpperCase()+tm(a),l:wrapT(shortD(it),w-30).slice(0,3),f:Math.min(1,(frame-a.f)/12)*Math.min(1,(200-(frame-a.f))/20)}));
  const hs=B.map(b=>(26+b.l.length*19)*sc),tot=hs.reduce((a,b)=>a+b+6,0);const sp=[];for(const v of Object.values(MVIEW))for(const q of P)if(q.state!=='dead')sp.push([v.ox+(q.x-v.cx)*v.sc,v.oy+(q.y-v.cy)*v.sc]);
  const hit=y0=>sp.some(([x,yy])=>Math.abs(x-W/2)<w/2+30&&yy>y0-40&&yy<y0+tot+40);let y=H*.62-tot/2;for(const c of[H*.62,H*.3,H*.78]){const y0=clamp(c-tot/2,60,H-tot-10);if(!hit(y0)){y=y0;break}}
  B.forEach((b,i)=>{const h=hs[i],c=col(b.it);ctx.globalAlpha=.16*b.f;ctx.fillStyle='#000';ctx.fillRect(W/2-w/2,y,w,h);ctx.globalAlpha=.92*b.f;ctx.font='bold '+(fs+1)+'px monospace';tx(b.t,W/2,y+18*sc,c,4);ctx.font='bold '+fs+'px monospace';b.l.forEach((l,j)=>tx(l,W/2,y+(38+j*19)*sc,'#fff',3.5));y+=h+6})}
 ctx.restore()}
