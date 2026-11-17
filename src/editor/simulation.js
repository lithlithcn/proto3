'use strict';
// ---- simulation : règles + script + dangers (tout dans CX => compatible rollback)
const MBI={dmg:6,kb:5,stun:18,arm:0};
function mapAct(a,p){const M=CMAP,cx=T.MAP_W/2,cy=T.MAP_H/2;
 if(a==='item'){const al=P.filter(q=>q.state!=='dead');const t=p||pickItem();if(!t)return;const x=al.length?al[(frame*7)%al.length].x:cx,y=al.length?al[(frame*7)%al.length].y-120:cy;CARDS.push({x:clamp(x,T.EDGE+60,T.MAP_W-T.EDGE-60),y:clamp(y,T.EDGE+60,T.MAP_H-T.EDGE-60),on:false,age:0,cp:P.map(()=>0),cont:false,type:t});sfx('se_cardget',.6)}
 else if(a==='ring'){const n=clamp(p|0,1,96);for(let i=0;i<n;i++){const an=i*TAU/n+frame*.01;mapB(cx,cy,Math.cos(an)*3.2,Math.sin(an)*3.2,9,'#ff5a8a')}sfx('tan00',.5)}
 else if(a==='rain'){const n=clamp(p|0,1,96);for(let i=0;i<n;i++)mapB(T.EDGE+rng()*(T.MAP_W-2*T.EDGE),T.EDGE+5,(rng()-.5)*.6,2.4+rng()*2,8,'#6ab4ff')}
 else if(a==='wind'){CX.mwind={a:(+p||0)*Math.PI/180,t:180}}
 else if(a==='pull'){CX.mpull={k:clamp(+p||3,1,10),t:180}}
 else if(a==='shake'){shake=Math.min(40,shake+(+p||20))}
 else if(a==='text'){big(String(p||'').slice(0,40),'#ffd23a',48)}
 else if(a==='sound'){sfx(String(p||'ok00'),.9)}
 else if(a==='layer'){const v=CX.mlv||(CX.mlv={});const i=p|0;v[i]=v[i]?0:1}
 else if(a==='heal'){for(const q of P)if(q.state!=='dead')q.hp=Math.min(T.HP,q.hp+(+p||20))}}
function mapB(x,y,vx,vy,r,c){const L=CX.mb||(CX.mb=[]);if(L.length<600)L.push({x,y,vx,vy,r,c,t:900})}
let MJS=null,MJSsrc=null;
function mapJS(){const M=CMAP;if(!M||!M.js||CX.mjsOff)return;if(MJSsrc!==M.js){MJSsrc=M.js;try{MJS=new Function('api','frame','P','B',M.js)}catch(e){MJS=null;errRep('map script (syntax)',e);CX.mjsOff=1;return}}if(!MJS)return;
 const api={frame,P,T,mem:CX.mjs||(CX.mjs={}),rng,item:(k,x,y)=>{mapAct('item',k||'')},ring:(n)=>mapAct('ring',n),rain:n=>mapAct('rain',n),bullet:(x,y,vx,vy,r,c)=>mapB(x,y,vx,vy,r||8,c||'#fff'),text:s=>mapAct('text',s),sound:k=>mapAct('sound',k),shake:n=>mapAct('shake',n),wind:a=>mapAct('wind',a),pull:k=>mapAct('pull',k),layer:(i,on)=>{const v=CX.mlv||(CX.mlv={});v[i|0]=on===undefined?(v[i|0]?0:1):(on?0:1)},heal:n=>mapAct('heal',n)};
 try{MJS(api,frame,P,B)}catch(e){errRep('map script',e);CX.mjsOff=1}}
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0||!CMAP||winner>=0)return;const M=CMAP;
 for(const e of M.ev||[]){if(e.off)continue;const n=Math.max(1,(+e.n||1)*60|0);if(e.w==='start'&&frame===2||e.w==='every'&&frame>2&&frame%n===0||e.w==='at'&&frame===n)mapAct(e.a,e.p)}
 mapJS();
 const w=CX.mwind;if(w){for(const q of P)if(q.state!=='dead'){q.vx+=Math.cos(w.a)*.35;q.vy+=Math.sin(w.a)*.35}if(--w.t<=0)CX.mwind=null}
 const pl=CX.mpull;if(pl){for(const q of P)if(q.state!=='dead'){const dx=T.MAP_W/2-q.x,dy=T.MAP_H/2-q.y,d=Math.hypot(dx,dy)||1;q.vx+=dx/d*pl.k*.08;q.vy+=dy/d*pl.k*.08}if(--pl.t<=0)CX.mpull=null}
 const L=CX.mb;if(L&&L.length){for(const b of L){b.x+=b.vx;b.y+=b.vy;b.t--;if(wallAt(b.x,b.y))b.t=0;for(const q of P){if(q.state==='dead'||q.inv>0||b.t<=0)continue;if(Math.hypot(q.x-b.x,q.y-b.y)<b.r+bodyR(q)){hit(q,q,b.vx||1,b.vy,MBI,1,false);b.t=0}}}
  CX.mb=L.filter(b=>b.t>0&&b.x>-50&&b.y>-50&&b.x<T.MAP_W+50&&b.y<T.MAP_H+50)}}}});
DEFER(()=>{{const K0=ko;ko=(...a)=>{const r=K0(...a);if(CMAP&&mode==='game')for(const e of CMAP.ev||[])if(!e.off&&e.w==='ko')mapAct(e.a,e.p);return r}}});
