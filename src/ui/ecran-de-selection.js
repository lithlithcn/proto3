'use strict';
// ===== Écran de sélection + « appuie pour rejoindre » (local) : chaque manette / clavier rejoint, choisit son tir, se met PRÊT
const SHD=['Wide fan · deadly up close','Fast stream · highest damage over time','Homing charms · safe and steady','Slow wall · zoning and area control'];
let DEVMAP=null,SELTY=null;const CSEL={sl:[],pv:{},cd:0,t0:0};
const devList=()=>{const L=['k0','k1'];pads().forEach((g,j)=>L.push('p'+j));return L};
const devName=d=>d==='k0'?'KEYBOARD 1':d==='k1'?'KEYBOARD 2':'PAD '+(+d.slice(1)+1);
function devIn(d){const I={x:0,y:0,a:0,b:0,s:0};if(d[0]==='k'){const m=KB[+d[1]];I.x=kd(m.right)-kd(m.left);I.y=kd(m.down)-kd(m.up);I.a=kd(m.shot)||d==='k0'&&(kd('Enter')||kd('Space'));I.b=kd(m.parry)||d==='k0'&&kd('Escape');I.s=d==='k0'&&kd('Enter')}
 else{const g=pads()[+d.slice(1)];if(!g)return I;const bt=n=>g.buttons[n]&&g.buttons[n].pressed;I.x=(Math.abs(g.axes[0]||0)>.5?Math.sign(g.axes[0]):0)||(bt(15)?1:bt(14)?-1:0);I.y=(Math.abs(g.axes[1]||0)>.5?Math.sign(g.axes[1]):0)||(bt(13)?1:bt(12)?-1:0);I.a=bt(0);I.b=bt(1);I.s=bt(9);I.y=bt(3)}return I}
function cselOpen(){CSEL.sl=[0,1,2,3,4,5,6,7].map(i=>({dev:null,ty:SELTY&&SELTY[i]>=CH0?SELTY[i]:CHL[i%CHL.length],rd:false}));CSEL.pv={};CSEL.cd=0;CSEL.t0=UNOW();for(const d of devList())CSEL.pv[d]=devIn(d);mode='csel';sfx('ok00')}
function cselTick(){const S=CSEL.sl;for(const d of devList()){const I=devIn(d),p=CSEL.pv[d]||{},e=k=>I[k]&&!p[k];CSEL.pv[d]=I;let i=S.findIndex(s=>s.dev===d);
  if(i<0){if(e('a')){const n=S.findIndex(s=>!s.dev);if(n>=0){S[n].dev=d;S[n].rd=false;if(nP<n+1)nP=n+1;sfx('joined',.7)}}else if(e('b')&&!S.some(s=>s.dev)){mode='menu';sfx('cancel00')}continue}
  const s=S[i];if(!s.rd&&I.x&&I.x!==p.x){{const j=Math.max(0,CHL.indexOf(s.ty));s.ty=CHL[(j+(I.x>0?1:CHL.length-1))%CHL.length]}sfx('se_select00',.5)}
  if(e('a')){if(!s.rd){s.rd=true;sfx('ok00')}}if(e('b')){if(s.rd)s.rd=false;else{s.dev=null;sfx('cancel00')}}if(e('s')&&s.rd)CSEL.cd=Math.min(CSEL.cd,1)}
 const J=S.filter(s=>s.dev);if(J.length&&J.every(s=>s.rd)){if(!CSEL.cd)CSEL.cd=50;if(--CSEL.cd<=0)cselGo()}else CSEL.cd=0}
function cselGo(){const J=CSEL.sl.filter(s=>s.dev);nH=J.length;if(nP<nH)nP=nH;DEVMAP=J.map(s=>s.dev);SELTY=[...J.map(s=>s.ty),...CSEL.sl.filter(s=>!s.dev).map(()=>null)];saveOpts();sfx('title',1);start('game')}
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);if(mode==='game'&&SELTY&&!NET&&!(TEST&&TEST.train))P.forEach((p,i)=>{if(!p.cpu&&SELTY[i]!=null)p.shotT=SELTY[i]});return r}}});
const cselN=()=>nP>4||CSEL.sl.some((s,j)=>j>3&&s.dev)?8:4;
function drawCsel(){cselTick();if(mode!=='csel')return;UIC.acc='#ff3355';uiBG('SELECT  ');uiHeader('SELECT');const S=CSEL.sl,n=cselN(),gw=Math.min(W*.96,n>4?1700:1100),cw=gw/n,fk=Math.min(1,(cw-16)/250),x0=(W-gw)/2,y0=H*.22,ch=H*.56;ctx.save();ctx.textAlign='center';
 S.forEach((s,i)=>{if(i>=n)return;const x=x0+i*cw+8,w=cw-16,on=i<nP||s.dev,c=COLS[i];ctx.globalAlpha=on?1:.35;ctx.fillStyle='rgba(5,6,12,.82)';ctx.fillRect(x,y0,w,ch);ctx.fillStyle=c;ctx.fillRect(x,y0,w,6);ctx.strokeStyle=s.rd?'#5cff8a':c;ctx.lineWidth=s.rd?4:2;ctx.strokeRect(x,y0,w,ch);
  ctx.fillStyle=c;ctx.font='bold '+Math.round(fk*H*.05)+'px sans-serif';ctx.fillText((ACC.cb?CBS[i]+' ':'')+'P'+(i+1),x+w/2,y0+H*.08);
  if(s.dev){ctx.fillStyle='#ccd';ctx.font=Math.round(fk*H*.02)+'px monospace';ctx.fillText(devName(s.dev),x+w/2,y0+H*.12);
   const r=w*.22,cx=x+w/2,cy=y0+ch*.42;ctx.fillStyle=c;ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(cx,cy,r*1.3,0,TAU);ctx.fill();ctx.globalAlpha=on?1:.35;ctx.strokeStyle=c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
   {const C=CHR[s.ty-CH0];if(C){const fq={x:cx,y:cy,aim:-Math.PI/4,chM:(UNOW()/1.5|0)%3,chC:4,chG:70,chS:3,chT:0,state:'idle',fx:{}};ctx.save();ctx.translate(cx,cy);ctx.scale(2.2*fk,2.2*fk);ctx.translate(-cx,-cy);ctx.fillStyle='#222';ctx.strokeStyle=C.col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();C.draw(fq,T.BODY_R);ctx.restore()}}ctx.fillStyle='#fff';ctx.font='bold '+Math.round(fk*H*.034)+'px sans-serif';ctx.fillText((s.rd?'':'◀ ')+SHOTS[s.ty].name+(s.rd?'':' ▶'),x+w/2,y0+ch*.72);{const C=CHR[s.ty-CH0];ctx.fillStyle=C?C.col:'#aab';ctx.font='bold '+Math.round(fk*H*.016)+'px monospace';ctx.fillText(C?C.role:'',x+w/2,y0+ch*.78,w-10);if(C&&!s.rd){ctx.fillStyle='#99a';ctx.font=Math.round(fk*H*.0135)+'px monospace';const L=wrapT(C.d,w-16).slice(0,3);L.forEach((l,j)=>ctx.fillText(l,x+w/2,y0+ch*.82+j*H*.019,w-10))}}
   ctx.font='bold '+Math.round(fk*H*.028)+'px sans-serif';ctx.fillStyle=s.rd?'#5cff8a':'#ffd23a';ctx.fillText(s.rd?'READY!':TCH.on?'TAP HERE: READY':'A / ATTACK: READY',x+w/2,y0+ch*.965)}
  else{ctx.fillStyle=(UNOW()*2|0)%2&&!S.some(q=>q.dev)?'#fff':'#ccd';ctx.font='bold '+Math.round(fk*H*.028)+'px sans-serif';ctx.fillText(i<nP?'CPU  LV '+cpuLv:'—',x+w/2,y0+ch*.45);ctx.font=Math.round(fk*H*.02)+'px monospace';ctx.fillStyle='#aab';ctx.fillText(TCH.on?'TAP TO JOIN':n>4?'A = join':'press A / ATTACK to join',x+w/2,y0+ch*.55)}});
 ctx.globalAlpha=1;ctx.fillStyle='#aab';ctx.font=Math.round(H*.02)+'px monospace';ctx.fillText(TCH.on?'Tap a card = join  ·  tap its left / right side = character  ·  tap the middle = READY  ·  tap the top = back':'Each pad / keyboard: A or Attack = join, then READY  ·  ◀ ▶ character  ·  B / Parry = back'+(CSEL.cd?'':'  ·  nobody joined + B = leave'),W/2,H*.86);
 if(CSEL.cd){ctx.fillStyle='#5cff8a';ctx.font='bold '+Math.round(H*.06)+'px sans-serif';ctx.fillText('FIGHT IN '+Math.ceil(CSEL.cd/17),W/2,H*.94)}ctx.restore()}
DEFER(()=>{{const R0=render;render=()=>{if(mode==='csel'){render0csel();return}R0()}}});
function render0csel(){musTick();if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();GLR.flush()}ctx=CTX0;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);setFilter('');hot=[];drawCsel()}
DEFER(()=>{{const N2=nav;nav=ev=>{if(mode==='csel')return;return N2(ev)}}});
DEFER(()=>{{const i=HUB.findIndex(h=>h.k==='fight');if(i>=0){const f0=HUB[i].f;HUB[i].d='Choose your shot, join with any pad or keyboard, then fight.';HUB[i].f=()=>cselOpen();HUB[i].quick=f0}}});
DEFER(()=>{{const R1=readHuman;readHuman=i=>{if(DEVMAP&&!NET&&mode==='game'){const hum=P.filter(p=>!p.cpu).map(p=>p.id),h=hum.indexOf(i);if(h>=0&&hum.length===DEVMAP.length&&DEVMAP[h])return readDev(DEVMAP[h],i,h)}return R1(i)}}});
function readDev(d,i,h){const I={x:0,y:0,b:{}};
 if(d[0]==='k'){const m=KB[+d[1]];I.x=kd(m.right)-kd(m.left);I.y=kd(m.down)-kd(m.up);for(const k of BTN)I.b[k]=kd(m[k]);
  if(d==='k0'&&MOUSEON&&performance.now()-MOUSE.t<4000){I.b.melee=I.b.melee||!!MOUSE.b[0];I.b.heavy=I.b.heavy||!!MOUSE.b[2];I.b.parry=I.b.parry||!!MOUSE.b[1];const v=MVIEW[i]||Object.values(MVIEW)[0];if(v)P[i].maim=[(MOUSE.x-v.ox)/v.sc+v.cx,(MOUSE.y-v.oy)/v.sc+v.cy]}else P[i].maim=null}
 else{const pi=+d.slice(1),g=pads()[pi];if(g){let ax=g.axes[0]||0,ay=g.axes[1]||0;if(Math.hypot(ax,ay)<.25)ax=ay=0;const bt=n=>g.buttons[n]&&(g.buttons[n].pressed||g.buttons[n].value>.3),M=PAD[pi]||PAD[0],used=new Set(BTN.flatMap(k=>[].concat(M[k])));
  if(!used.has(12)&&bt(12))ay=-1;if(!used.has(13)&&bt(13))ay=1;if(!used.has(14)&&bt(14))ax=-1;if(!used.has(15)&&bt(15))ax=1;if(ax||ay){I.x=ax;I.y=ay}
  const pt=padT[pi]||(padT[pi]=[]),pb=padPB[pi]||(padPB[pi]=[]);for(let n=0;n<g.buttons.length;n++){const on=bt(n);if(on&&!pb[n])pt[n]=frame;pb[n]=on}const cs=padUsed[pi]||(padUsed[pi]=new Set());for(const n of cs)if(!bt(n))cs.delete(n);
  for(const k of BTN){const v=M[k];if(Array.isArray(v)&&v.every(bt)&&(v.every(n=>cs.has(n))||Math.abs((pt[v[0]]||0)-(pt[v[1]]||0))<=T.COMBO_WIN)){I.b[k]=true;v.forEach(n=>cs.add(n))}}for(const k of BTN){const v=M[k];if(!Array.isArray(v)&&bt(v)&&!cs.has(v))I.b[k]=true}}P[i].maim=null}
 if(TCH.on&&h===0){if(TCH.joy){I.x=TCH.jx;I.y=TCH.jy}for(const k in TCH.b)I.b[k]=true;if(TCH.auto)I.b.shot=true}
 const l=Math.hypot(I.x,I.y);if(l>1){I.x/=l;I.y/=l}return I}
