'use strict';
// ---- mode spectateur : un joueur local éliminé (grande carte) suit le combattant de son choix (◀ ▶ / Next-Prev). Local uniquement : ne touche jamais la partie
const SPEC={};
const specOut=p=>p&&!p.cpu&&p.state==='dead'&&p.stocks<=0&&winner<0&&!fixedMap;
const specAlive=()=>P.filter(q=>q.state!=='dead'||q.stocks>0);
function specPick(id,d){const L=specAlive().filter(q=>q.id!==id);if(!L.length)return null;const S=SPEC[id]||(SPEC[id]={t:null,px:0,pb:{}});let i=L.findIndex(q=>q.id===S.t);
 if(i<0){const k=P[id]&&P[id].lastBy>=0&&L.find(q=>q.id===P[id].lastBy);const al=TEAMS&&L.find(q=>TEAMA[q.id]===TEAMA[id]);S.t=(al||k||L.slice().sort((a,b)=>b.stocks-a.stocks||b.hp-a.hp)[0]).id}
 else if(d){S.t=L[(i+d+L.length)%L.length].id;sfx('se_select00',.5)}return S.t}
DEFER(()=>{{const D0=drawView;drawView=v=>{const p=P[v.i];if(mode==='game'&&!v.fixed&&specOut(p)){const S=SPEC[p.id]||(SPEC[p.id]={t:null,px:0,pb:{}}),I=p.in||{x:0,b:{}},b=I.b||{};
  const dx=I.x>.6?1:I.x<-.6?-1:0,nx=b.next&&!S.pb.next?1:b.prev&&!S.pb.prev?-1:0;let d=0;if(dx&&dx!==S.px)d=dx;else if(nx)d=nx;S.px=dx;S.pb={next:!!b.next,prev:!!b.prev};
  const t=specPick(p.id,d);if(t!==null&&P[t]){v.spec=t;return D0({...v,i:t})}}return D0(v)}}});
DEFER(()=>{{const R0=render;render=()=>{R0();if(mode!=='game'||winner>=0)return;const c=OC||CTX0;for(const id in SPEC){const p=P[id],S=SPEC[id];if(!specOut(p)||S.t===null||!P[S.t])continue;
  c.save();c.setTransform(1,0,0,1,0,0);c.textAlign='center';const y=H*.12,w=Math.min(W*.6,440);c.globalAlpha=.85;c.fillStyle='#05060c';c.fillRect(W/2-w/2,y-22,w,36);c.fillStyle=COLS[S.t];c.fillRect(W/2-w/2,y+12,w,3);c.globalAlpha=1;
  c.font='bold 17px monospace';c.fillStyle='#fff';c.fillText('SPECTATING  ◀ '+pname(P[S.t])+' ▶',W/2,y+2);c.font='11px monospace';c.fillStyle='#aab';c.fillText(pname(p)+' is out  ·  stick / Next-Prev: switch',W/2,y+28);c.restore();break}}}});
