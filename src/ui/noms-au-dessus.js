'use strict';
// ---- noms au-dessus, HUD + pouvoirs actifs en dessous (taille fixe à l'écran)
const SDC={},shortD=it=>SDC[it.k]||(SDC[it.k]=(()=>{let r=it.d.trim().replace(/^\d+(\.\d+)? ?s ?: ?/,'');r=r[0].toUpperCase()+r.slice(1);if(r.length>150){r=r.slice(0,148);r=r.slice(0,r.lastIndexOf(' '))+'…'}return r})());
DEFER(()=>{{const G0=give0;give0=(p,t)=>{const r=G0(p,t),it=ITEMS.find(i=>i.k===t);if(it&&p){const m=/(\d+(?:\.\d+)?) ?s\b/.exec(it.d);p.acts=(p.acts||[]).filter(a=>a.k!==t);p.acts.push({k:t,f:frame,T:m?Math.round(m[1]*60):420,ht:!!m})}return r}}});
function drawTags(VL,VR){const k=1/SCv,now=performance.now()/1000;
 for(const q of P){const dead=q.state==='dead',dp=dead&&q.dX!==undefined,x=dp?q.dX:q.x,y=dp?q.dY:q.y,R=bodyR(q)*SCv;
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);
  const f=!q.cpu&&profOf(q.id);let al=1,sx=1,dy=0;
  if(dead){const u=Math.min(1,(now-(q.dRT||0)/1000)/1.3),e=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;sx=Math.cos(e*TAU*2);dy=-24*e;al=1-(q.stocks>0?.45:.7)*e} // mort : spin fluide du nom
  if(q.fx&&q.fx.koishi>0)al*=.3;ctx.globalAlpha=al;
  drawName(CX.anon>0?'???':(ACC.cb?CBS[q.id%8]+' ':'')+pname(q),0,-R-18+dy,f?ncol(f.c,COLS[q.id]):COLS[q.id],f?f.a:0,now+q.id,sx);
  if(!dead&&q.state!=='eaten')miniHUD(q,R,(VL-x)*SCv,(VR-x)*SCv);ctx.restore()}ctx.globalAlpha=1}
function miniHUD(q,R,el,er){const hide=CX.anon>0||q.fx&&q.fx.koishi>0,flip=q.y>T.MAP_H-150/SCv,w=116,x=clamp(0,el+64,er-64)-w/2,y=flip?-R-84:R+10; // près du bas : HUD au-dessus du nom
 if(!hide){ctx.globalAlpha=.6;ctx.fillStyle='rgba(4,5,11,.4)';ctx.fillRect(x-4,y-4,w+8,47);ctx.strokeStyle=COLS[q.id];ctx.lineWidth=1.5;ctx.strokeRect(x-4,y-4,w+8,47);
  const hp=q.wsA?T.HP-Math.max(0,q.hp):Math.max(0,q.hp);ctx.font='bold 12px monospace';ctx.textAlign='left';ctx.fillStyle='#ff7090';ctx.fillText(q.stocks>4?'♥x'+q.stocks:'♥'.repeat(Math.max(0,q.stocks)),x,y+8);
  bar(x,y+11,w,11,hp/T.HP,hp>50?'#4e6':hp>25?'#ec4':'#f44');ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.font='bold 10px monospace';ctx.strokeText(Math.ceil(hp),0,y+20);ctx.fillStyle='#fff';ctx.fillText(Math.ceil(hp),0,y+20);
  bar(x,y+24,w,4,q.spirit/T.SPIRIT_MAX,q.ult?rainbowCol():q.spirit>=T.SPELL_COST?'#f8f':'#58c');
  bar(x,y+30,w*.36,4,q.burst/T.BURST_MAX,q.burst>=T.BURST_MAX?'#fc4':'#7a5a30');
  for(let i=0;i<T.DASH_CHARGES;i++){ctx.fillStyle=q.boost-i>=1?'#fff':'#444';ctx.fillRect(x+w*.41+i*10,y+30,8,4)}
  for(let i=0;i<T.PIPS;i++){ctx.fillStyle=i<q.pips?'#f55':'#3a2226';ctx.fillRect(x+w-(T.PIPS-i)*10+2,y+30,8,4)}
  bar(x,y+37,w,3,(q.pg??100)/100,(q.pg??100)<35?(frame&8?'#6ff':'#244'):'#6ff')}
 ctx.globalAlpha=1}
