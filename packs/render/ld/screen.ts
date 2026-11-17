// @ts-nocheck — legacy render() screen layers (border flash, speed lines, banners, flash/brightness, zoom blur, chroma split, spell UI, timer, item line), copied verbatim. Not sim code.
import { FXF } from './fx';
import { COLS, LCOLS } from '../colors';
import { UFI, UF } from '../ui';
const TAU = 6.2832;
let SPELLS = [], ULTN = 'Last Word「Prismatic Danmaku Storm」', ctx, cv, frame, P, W, H, T, borderF, focusL, BIG, flashS, flashCol, bright, zblur, chroma, NERV, slow, TSTOP, ITEMS, item, itemT, itemsOn, WARP, FAIRIES, TIMER = 0, TEST = null, TUT = null, CX = {}, bodyR, perfLow = false, TCH = { on: false }, ACC = { shk: 1, ui: 1 }, mode = 'game';
const kV = () => (0.35 + 0.065 * NERV) * ACC.shk, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), RB = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'];
function skw(x,y,w,h,k){ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x,y+h);ctx.closePath()}
const spD = p => p.ultS ? { name: ULTN } : SPELLS[(p.spI === undefined ? p.id : p.spI) % SPELLS.length] || { name: '' }, spT = p => p.ultS ? T.ULT_T : T.SPELL_T;
const pname = p => (p.cpu ? 'CPU ' : 'P') + (p.id + 1), xActive = () => false, keyName = c => c, padName = n => 'Button ' + n, pads = () => [], KB = [], PAD = [], TKB = [], ITEMK = {}, MVIEW = {}, NET = null, PREVL = {}, PROPH = [], shortD = it => it.d || '';
const rainbowCol = () => `hsl(${frame * 6 % 360},100%,65%)`, IE = () => itemsOn ? T.ITEM_EVERY : T.ULT_EVERY;
export const bindScreen = (v) => { ({ SPELLS, ctx, cv, frame, P, W, H, T, borderF, focusL, BIG, flashS, flashCol, bright, zblur, chroma, NERV, slow, TSTOP, ITEMS, item, itemT, itemsOn, WARP, FAIRIES, bodyR } = v); };
function drawPortrait(id,w,h,c){ // portrait temporaire (silhouette) : à remplacer par le vrai art
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(w*.15,h);ctx.lineTo(w*.3,h*.42);ctx.lineTo(w*.7,h*.42);ctx.lineTo(w*.88,h);ctx.fill();
 ctx.fillStyle=c;ctx.beginPath();ctx.arc(w*.5,h*.3,w*.17,0,TAU);ctx.fill();
 ctx.beginPath();
 if(id===0){ctx.moveTo(w*.5,h*.16);ctx.lineTo(w*.22,h*.05);ctx.lineTo(w*.28,h*.24);ctx.closePath();ctx.moveTo(w*.5,h*.16);ctx.lineTo(w*.78,h*.05);ctx.lineTo(w*.72,h*.24);ctx.closePath()} // nœud
 else{ctx.moveTo(w*.18,h*.2);ctx.lineTo(w*.82,h*.2);ctx.lineTo(w*.6,0);ctx.closePath()} // chapeau
 ctx.fill()}
function wrapT(str,mw){const out=[];let cur='';for(const wd of str.split(' ')){const t=cur?cur+' '+wd:wd;if(ctx.measureText(t).width>mw&&cur){out.push(cur);cur=wd}else cur=t}if(cur)out.push(cur);return out}
function drawBanners(){BIG.forEach((b,i)=>{const age=45-b.t,e=clamp(age/7,0,1),out=clamp(b.t/10,0,1),sc=Math.min(1,W/1100+.15)*(e<1?1+(1-e)*1.2:1+.06*Math.sin(Math.min(1,(age-7)/10)*Math.PI)),y=H*.3+i*b.z*1.25,c=b.c==='rainbow'?rainbowCol():b.c;
 ctx.save();ctx.translate(W/2+(1-out)*W*.6,y);ctx.rotate(-.05);const tw=(()=>{ctx.font=UFI(b.z);return ctx.measureText(b.s).width})()*sc;
 const bw=Math.min(W*1.1,tw+120),bh=b.z*sc*1.25,bx=-bw/2*Math.min(1,e*1.6);ctx.globalAlpha=.42*out;ctx.fillStyle='#05060c';skw(bx-10,-bh*.7,bw*Math.min(1,e*1.6)+20,bh,bh*.35);ctx.fill();ctx.globalAlpha=.6*out;ctx.fillStyle=c;ctx.fillRect(bx,-bh*.7,bw*Math.min(1,e*1.6),3);ctx.fillRect(bx,bh*.3-3,bw*Math.min(1,e*1.6),3);
 if(age<5){ctx.globalAlpha=(1-age/5)*.5;ctx.fillStyle='#fff';skw(-bw/2,-bh*.7,bw,bh,bh*.35);ctx.fill()}
 ctx.scale(sc,sc);ctx.font=UFI(b.z);ctx.textAlign='center';ctx.globalAlpha=Math.min(.75,out*.75);ctx.lineJoin='round';ctx.lineWidth=b.z*.16;ctx.strokeStyle='#05060c';ctx.strokeText(b.s,0,0);
 if(!FXF.low){ctx.globalAlpha*=.6;ctx.fillStyle='#ff2d6a';ctx.fillText(b.s,-3,0);ctx.fillStyle='#2df0ff';ctx.fillText(b.s,3,0);ctx.globalAlpha=Math.min(.75,out*.75)}ctx.fillStyle=c;ctx.fillText(b.s,0,0);
 if(age>4&&age<22&&!FXF.low){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5*out;const sx=-tw/sc/2+(age-4)/18*(tw/sc*1.2),gg=ctx.createLinearGradient(sx-40,0,sx+40,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.9)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillText(b.s,0,0);ctx.restore()}
 ctx.restore()})}
function focusLines(a){ // lignes de vitesse (manga) depuis les bords
 const cx=W/2,cy=H/2,R=Math.hypot(W,H)/2;ctx.strokeStyle='#fff';ctx.globalAlpha=Math.min(1,a)*.9;ctx.lineWidth=2+a*2;ctx.beginPath();
 for(let i=0;i<70;i++){const t=Math.random()*TAU,r0=R*(.4+Math.random()*.35);ctx.moveTo(cx+Math.cos(t)*R,cy+Math.sin(t)*R);ctx.lineTo(cx+Math.cos(t)*r0,cy+Math.sin(t)*r0)}
 ctx.stroke();ctx.globalAlpha=1}
function drawSpellUI(p){ // déclaration de spell card façon Touhou
 const k=p.t,left=p.id%2===0,half=P.filter(q=>!q.cpu&&(!NET||q.id===NET.L)).length>1?W/2:W,X0=left?0:W-half,c=p.ultS?rainbowCol():COLS[p.id],name=spD(p).name;
 if(k<T.SPELL_CUTIN+25){
  const e=Math.min(1,k/14),out=k>T.SPELL_CUTIN?1-(k-T.SPELL_CUTIN)/25:1,ph=H*.8,pw=ph*.45;
  const x=left?-pw+e*pw*1.6+k*.6:W-e*pw*1.6-k*.6;
  ctx.save();ctx.globalAlpha=.25*out;ctx.fillStyle=c;ctx.translate(W/2,H*.55);ctx.rotate(left?-.18:.18);ctx.fillRect(-W,-50,W*2,100);ctx.restore();
  ctx.save();ctx.globalAlpha=.85*out;ctx.translate(x,H*.15);drawPortrait(p.id%2,pw,ph,c);ctx.restore()}
 const rem=Math.max(0,(T.SPELL_CUTIN+spT(p)-k)/60);
 ctx.font='bold 18px serif';
 const tw=ctx.measureText(name).width+40,bx=left?X0+12:X0+half-12-tw,by=k<20?H*.6-(H*.6-118)*k/20:118;
 ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(bx,by-22,tw,32);
 ctx.fillStyle=c;ctx.fillRect(bx,by+8,tw*rem/(spT(p)/60),3);
 ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText(name,bx+20,by);
 ctx.font='12px monospace';ctx.textAlign=left?'left':'right';ctx.fillText('SPELL CARD · '+rem.toFixed(1)+'s',left?bx:bx+tw,by+24)}
function drawTimer0(){if(!TIMER||TEST)return;const r=Math.max(0,TIMER*3600-frame),s=Math.ceil(r/60),lw=r<600;ctx.save();ctx.translate(W/2,44);if(lw){const z=1+.15*Math.max(0,1-(r%60)/20);ctx.scale(z,z)}
 ctx.textAlign='center';ctx.font='bold 24px monospace';ctx.lineWidth=5;ctx.strokeStyle='#000';const t=(s/60|0)+':'+String(s%60).padStart(2,'0');ctx.strokeText(t,0,0);ctx.fillStyle=r<1800?'#ff5a5a':'#fff';ctx.fillText(t,0,0);ctx.restore()}
function drawTimer_2534(...a){const T0=drawTimer0;T0(...a);const R=CX.proph;if(!R||mode!=='game')return;const L=PROPH.find(x=>x[1]===R.k);if(!L)return;const al=Math.min(1,R.t/30,(600-R.t)/20+.2),id=(P[R.v]?R.v+1:'?');ctx.save();ctx.globalAlpha=al;ctx.textAlign='center';ctx.fillStyle='rgba(10,10,24,.75)';ctx.fillRect(W/2-260,44,520,46);
 ctx.font='bold 13px monospace';ctx.fillStyle='#aab';ctx.fillText('PROPHECY: "'+L[0].replace('#',id)+'"  ('+Math.ceil(R.t/60)+'s)',W/2,62);ctx.font='bold 16px monospace';ctx.fillStyle='#ffe0ff';ctx.fillText('→ '+PREVL[R.k].replace('#',id),W/2,82);ctx.restore()}
function drawTimer_2675(...a){const T0=drawTimer_2534;T0(...a);const K=CX.taiko;if(!K||mode!=='game')return;const x0=W*.08,x1=W*.92,y=130,jx=x0+70,tl=a=>TCH.on?{heavy:'HEAVY',melee:'ATK',parry:'PARRY'}[a]:pads().length?padName([].concat(PAD[0][a])[0]):keyName(KB[0][a]);ctx.save();ctx.fillStyle='rgba(20,16,24,.9)';ctx.fillRect(x0,y-50,x1-x0,100);ctx.strokeStyle='#ffb040';ctx.lineWidth=4;ctx.strokeRect(x0,y-50,x1-x0,100);
 ctx.strokeStyle=(frame>>3)%2?'#fff':'#ffb040';ctx.lineWidth=4;ctx.beginPath();ctx.arc(jx,y,40,0,TAU);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.arc(jx,y,33,0,TAU);ctx.fill();
 const sp=(x1-jx)/140;for(const n of K.N){const dt=n.t-frame;if(dt>140||dt<-12)continue;const done=Object.keys(n.res).length&&P.every(q=>q.id===K.o||q.state==='dead'||n.res[q.id]);if(done&&dt<0)continue;const x=jx+dt*sp,r=n.k==='R'?42:30;
  ctx.fillStyle=n.k==='b'?'#4ad0e0':'#f24a2a';ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.stroke();const lb=tl(TKB[n.k]);ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold '+(lb.length>3?14:22)+'px monospace';ctx.strokeText(lb,x,y+1);ctx.fillText(lb,x,y+1);ctx.textBaseline='alphabetic'}
 ctx.font='bold 17px monospace';ctx.textAlign='center';ctx.fillStyle='#ffd8a0';ctx.fillText('PRESS THE BUTTON WRITTEN ON THE NOTE WHEN IT REACHES THE CIRCLE!   RED = '+tl('heavy')+'   BLUE = '+tl('melee')+'   BIG = '+tl('parry'),(x0+x1)/2,y+72);ctx.textAlign='center';
 for(const f of K.fb){ctx.globalAlpha=Math.min(1,f.t/10);ctx.fillStyle=COLS[f.p]||'#fff';ctx.font='bold 13px monospace';ctx.fillText('P'+(f.p+1)+' '+f.s,jx+f.p*0+(f.p-1.5)*0,y-36-(40-f.t)*.4-f.p*13)}ctx.restore()}
const drawTimer=drawTimer_2675;
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
export function drawScreen(){
 if(borderF.t>0){ctx.strokeStyle=borderF.c;ctx.globalAlpha=borderF.t/18*(FXF.low?.2:1);ctx.lineWidth=34;ctx.strokeRect(0,0,W,H);ctx.globalAlpha=1}
 if(focusL>.05)focusLines(focusL*(FXF.low?.2:1));
 drawBanners();
 if(flashS>.02){ctx.fillStyle=flashCol;ctx.globalAlpha=Math.min(1,flashS)*(FXF.low?.15:1);
 if(bright>.03&&!FXF.low){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=bright*.18;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}ctx.globalAlpha=Math.min(.32,flashS*.45)*(FXF.low?.15:1);ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
 {const sv=ctx; // les post-effets restent sur le décor
 if(zblur>.03&&!FXF.low&&!perfLow){ctx.globalAlpha=.4;ctx.drawImage(cv,-W*zblur/2,-H*zblur/2,W*(1+zblur),H*(1+zblur));ctx.globalAlpha=1} // flou de zoom
 if(chroma>8&&!FXF.low&&!perfLow){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.4;ctx.drawImage(cv,chroma*kV(),chroma*.2*kV());ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1} // dédoublement d'impact
 }
 for(const q of P)if(q.state==='spell')drawSpellUI(q);
}
export function drawScreenTop(){
 drawTimer();drawActs();
 ctx.textAlign='center';ctx.font='13px monospace';ctx.fillStyle='#f8f';
 if(!TEST&&!(TUT&&!TUT.cards))ctx.fillText((item?ITEMS.find(i=>i.k===item.type).name.toUpperCase()+(item.on?' — grab it!':'…'):'Card in '+Math.ceil((IE()-T.ITEM_WARN-itemT)/60)+'s')+(WARP>0?'  ·  WARP '+Math.ceil(WARP/60)+'s':'')+(FAIRIES.length?'  ·  fairies '+FAIRIES.length:''),W/2,18);
}
export function screenFilterOf(){const bf=slow>0&&!FXF.low&&!perfLow?'saturate(2.2) contrast(1.3)':'';return TSTOP>0&&!FXF.off?((bf?bf+' ':'')+'invert(1)'):bf}
