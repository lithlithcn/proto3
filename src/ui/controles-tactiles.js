'use strict';
// ================= Contrôles tactiles (mobile) =================
let TCH;DEFER(()=>{TCH={on:false,joy:null,jx:0,jy:0,b:{},ids:new Map(),auto:true}});
const tU=()=>Math.min(W,H)/7.2;
function tBtns(){const u=tU(),cx=W-2.1*u,cy=H-2.05*u,s=1.25*u,r=.68*u,y2=H-4.6*u;return[ // pavé façon manette : le pouce droit tourne autour d'ATK
 {k:'melee',x:cx+s,y:cy,r:r*1.12,l:'ATK',c:'#ff6a6a'},{k:'dash',x:cx,y:cy+s*.85,r,l:'DASH',c:'#6cf'},{k:'heavy',x:cx-s,y:cy,r,l:'HEAVY',c:'#ffa63a'},{k:'parry',x:cx,y:cy-s*.85,r,l:'PARRY',c:'#6ff'},
 {k:'focus',x:cx-s*2.1,y:cy+s*.6,r:r*.78,l:'FOCUS',c:'#ddd'},{k:'prev',x:cx-s*2.1,y:cy-s*.7,r:r*.62,l:'SKILL 1',c:'#c9f'},
 {k:'burst',x:W-3.6*u,y:y2,r:.55*u,l:'SKILL 2',c:'#fc4'},{k:'spell',x:W-2.3*u,y:y2,r:.55*u,l:'SPELL',c:'#f8f'},{k:'shot',x:W-1*u,y:y2,r:.5*u,l:'AUTO',c:'#8f8',tog:1},
 {k:'pause',x:W/2,y:H-.6*u,r:.42*u,l:'II',c:'#fff',tog:1}]}
const tOver=()=>!paused&&winner>=0&&winT>=100; // la pause a ses propres boutons (menu PAUSE) // boutons de l'écran de pause / fin
const tOvB=()=>{const u=tU();return[{x:W/2-3.1*u,y:H*.62,w:2.9*u,h:u,l:paused?'RESUME':'REMATCH',ev:'ok'},{x:W/2+.2*u,y:H*.62,w:2.9*u,h:u,l:'MENU',ev:'back'}]};
let UT;DEFER(()=>{UT=new Map()});
function cselTap(x,y){const S=CSEL.sl,n=cselN(),gw=Math.min(W*.96,n>4?1700:1100),cw=gw/n,x0=(W-gw)/2,y0=H*.22,ch=H*.56;
 if(y<y0*.85){const s=S.find(s=>s.dev==='k0');if(s){s.dev=null;s.rd=false;sfx('cancel00')}else if(!S.some(s=>s.dev)){mode='menu';sfx('cancel00')}return}
 const i=Math.floor((x-x0)/cw);if(i<0||i>=n)return;const s=S[i],lx=(x-(x0+i*cw))/cw;
 if(!s.dev){if(S.some(z=>z.dev==='k0'))return;s.dev='k0';s.rd=false;if(nP<i+1)nP=i+1;sfx('joined',.7);return}
 if(s.dev!=='k0')return;if(s.rd){if(y>y0+ch*.88)CSEL.cd=Math.min(CSEL.cd||1,1);else s.rd=false;return}
 if(y<y0+ch*.88&&(lx<.33||lx>.67)){const j=Math.max(0,CHL.indexOf(s.ty));s.ty=CHL[(j+(lx>.5?1:CHL.length-1))%CHL.length];sfx('select00',.5)}else{s.rd=true;sfx('ok00')}}
function uiTS(t){const x=t.clientX,y=t.clientY,id=t.identifier;
 if(mode==='csel'){cselTap(x,y);return true}
 if(mode==='maker'&&MK&&MK.g){const g=MK.g;if(x>=g.x&&x<=g.x+g.w&&y>=g.y&&y<=g.y+g.h){UT.set(id,{g:1,x,y});const G=[...UT.values()].filter(u=>u.g);
   if(G.length>=2){MK.dn=0;const[a,b]=G;MK.pin={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:MK.zm||1}}else{MOUSE.x=x;MOUSE.y=y;MK.dn=1;const hh=hotAt(x,y);if(hh){hh.hover();if(MK.tool===1)hh.click(x,y)}}return true}}
 const hh=hotAt(x,y);if(hh)hh.hover();UT.set(id,{x0:x,y0:y,y,acc:0,mv:0});return true}
function uiTM(t){const u=UT.get(t.identifier);if(!u)return false;const x=t.clientX,y=t.clientY;
 if(u.g){u.x=x;u.y=y;const G=[...UT.values()].filter(v=>v.g);if(MK.pin&&G.length>=2){const[a,b]=G;mkZoom(MK.pin.z*Math.hypot(a.x-b.x,a.y-b.y)/MK.pin.d,(a.x+b.x)/2,(a.y+b.y)/2)}else if(!MK.pin){MOUSE.x=x;MOUSE.y=y;const hh=hotAt(x,y);if(hh)hh.hover()}return true}
 u.acc+=y-u.y;u.y=y;if(Math.hypot(x-u.x0,y-u.y0)>14)u.mv=1;while(u.acc>42){nav('up');u.acc-=42}while(u.acc<-42){nav('down');u.acc+=42}return true}
function uiTE(t){const u=UT.get(t.identifier);if(!u)return;UT.delete(t.identifier);if(u.g){if(![...UT.values()].some(v=>v.g)){MK.dn=0;MK.pin=null}return}
 if(!u.mv){const hh=hotAt(u.x0,u.y0);if(hh){hh.hover();hh.click(u.x0,u.y0);fsTry()}}}
function tHit(x,y){let best=null,bd=1e9;for(const b of tBtns()){const d=Math.hypot(x-b.x,y-b.y);if(d<b.r*1.3&&d<bd){bd=d;best=b}}return best}
function tSync(){const nb={};for(const t of TCH.ids.values())if(t.k)nb[t.k]=1;for(const k in nb)if(!TCH.b[k]&&navigator.vibrate)try{navigator.vibrate(8)}catch(e){}TCH.b=nb}
function tJoy(t){const j=TCH.joy,R=tU()*1.1;let dx=t.clientX-j.x0,dy=t.clientY-j.y0,l=Math.hypot(dx,dy);
 if(l>R*1.4){j.x0+=dx/l*(l-R*1.4);j.y0+=dy/l*(l-R*1.4);dx=t.clientX-j.x0;dy=t.clientY-j.y0;l=Math.hypot(dx,dy)} // la base suit le pouce
 const k=l<R*.18?0:Math.min(1,l/R)/l;TCH.jx=dx*k;TCH.jy=dy*k;j.x=t.clientX;j.y=t.clientY}
function fsTry(){try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)d.requestFullscreen().then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}}
DEFER(()=>{addEventListener('touchstart',e=>{TCH.on=true;unlock();e.preventDefault();
 for(const t of e.changedTouches){const x=t.clientX,y=t.clientY;if(TCH.joy&&t.identifier===TCH.joy.id||TCH.ids.has(t.identifier))continue;
  if(mode!=='game'){if(mode==='binds'&&bind.wait)continue;TCH.sy=y;if(mode!=='info'&&uiTS(t))continue;const h=hotAt(x,y);if(h){h.hover();h.click(x,y);fsTry()}continue}
  if(paused&&TEST&&TEST.train){uiTS(t);continue}
  if(mode==='game'&&paused&&typeof hot!=='undefined'&&hot.length){const h=hot.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(h){if(h.hover)h.hover();h.click();continue}}
  if(tOver()){const o=tOvB().find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(o)nav(o.ev);continue}
  {const pk=!NET&&PICKR.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(pk){const q=P[pk.p];if(q&&q.pick){if(pk.it){if(pk.it!=='mamizou')q.pick.go=pk.it}else{q.pick.tab=pk.tab;q.pick.i=0}}continue}} // menu de Mamizou au toucher
  const b=tHit(x,y);
  if(b&&b.tog){if(b.k==='shot'){TCH.auto=!TCH.auto;sfx('move',.6)}else padEv('start');continue}
  if(!b&&!TCH.joy&&x<W*.5&&y>H*.15){TCH.joy={id:t.identifier,x0:x,y0:y,x,y};TCH.jx=TCH.jy=0;continue}
  TCH.ids.set(t.identifier,{k:b?b.k:null})}tSync()},{passive:false});});
DEFER(()=>{addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){if(uiTM(t))continue;if(mode==='info'&&TCH.sy!=null){infoScr=clamp(infoScr-(t.clientY-TCH.sy),0,infoMax);TCH.sy=t.clientY;continue}if(TCH.joy&&t.identifier===TCH.joy.id){tJoy(t);continue}
 const s=TCH.ids.get(t.identifier);if(s){const b=tHit(t.clientX,t.clientY);s.k=b&&!b.tog?b.k:null}}tSync()},{passive:false});}); // glisser d'un bouton à l'autre
const tEnd=e=>{for(const t of e.changedTouches){uiTE(t);if(TCH.joy&&t.identifier===TCH.joy.id){TCH.joy=null;TCH.jx=TCH.jy=0}TCH.ids.delete(t.identifier)}tSync()};
DEFER(()=>{addEventListener('touchend',tEnd);});DEFER(()=>{addEventListener('wheel',e=>{if(mode==='info')infoScr=clamp(infoScr+e.deltaY,0,infoMax)},{passive:true});});DEFER(()=>{addEventListener('touchcancel',tEnd);});
function tDraw(){if(!TCH.on)return;const u=tU(),me=P.find(p=>!p.cpu);ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
 if(H>W){ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 22px monospace';ctx.fillText('↻ Turn your phone sideways',W/2,H/2);ctx.restore();return}
 if(mode==='game'&&tOver()){for(const r of tOvB()){ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#fff';ctx.font='bold '+(u*.38|0)+'px monospace';ctx.fillText(r.l,r.x+r.w/2,r.y+r.h/2)}}
 else if(mode==='game'&&!paused){
  const j=TCH.joy,bx=j?j.x0:1.8*u,by=j?j.y0:H-1.9*u,R=u*1.1;ctx.globalAlpha=j?.4:.13;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(bx,by,R,0,TAU);ctx.stroke(); // joystick
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx+TCH.jx*R,by+TCH.jy*R,R*.45,0,TAU);ctx.fill();
  for(const b of tBtns()){const on=b.tog?b.k==='shot'&&TCH.auto:TCH.b[b.k];ctx.globalAlpha=on?.45:.13;ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
   ctx.globalAlpha=on?.9:.3;ctx.strokeStyle=b.c;ctx.lineWidth=2;ctx.stroke();
   if(me&&(b.k==='spell'||b.k==='burst')){const f=b.k==='spell'?(me.ult?1:me.spirit/T.SPELL_COST):1,full=f>=1;ctx.globalAlpha=.6;ctx.lineWidth=3;ctx.strokeStyle=full?'#fff':b.c;ctx.beginPath();ctx.arc(b.x,b.y,b.r+3,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,f));ctx.stroke();
    if(full&&(frame>>3)%2){ctx.globalAlpha=.18;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill()}}
   ctx.globalAlpha=on?1:.8;ctx.fillStyle='#fff';ctx.font='bold '+Math.max(10,b.r*.42|0)+'px monospace';ctx.fillText(b.k==='spell'&&me&&me.ult?'LAST':b.l,b.x,b.y)}}
 ctx.restore()}
