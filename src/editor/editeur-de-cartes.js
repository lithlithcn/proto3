'use strict';
// ---- éditeur de cartes : grille, murs, téléporteurs, item permanent
const CS=40;let CMAPS=[],CMAP=null,WG=null,TPS=[],MK=null;DEFER(()=>{try{CMAPS=JSON.parse(localStorage.getItem('sf_maps')||'[]')||[]}catch(e){}});
let NETMAP=null;const ALLM=()=>MAPS.concat(CMAPS,NETMAP?[NETMAP]:[]),saveMaps=()=>{try{localStorage.setItem('sf_maps',JSON.stringify(CMAPS))}catch(e){}};
const fixM=m=>{m.w=m.cw*CS;m.h=m.ch*CS;m.edge=100;m.walls=m.walls.filter(([x,y])=>x<m.cw&&y<m.ch);m.tps=m.tps.filter(([x,y])=>x<m.cw&&y<m.ch);return m};
const MAPM=()=>[{t:()=>'+ New map',f:()=>{const m=fixM({name:'Map '+(CMAPS.length+1),cw:40,ch:26,walls:[],tps:[],perm:''});CMAPS.push(m);saveMaps();openMaker(m)}}].concat(CMAPS.map(m=>({t:()=>'Edit: '+m.name+'  ('+m.cw+'×'+m.ch+')',f:()=>openMaker(m),del:()=>{CMAPS=CMAPS.filter(x=>x!==m);saveMaps();mapI=Math.min(mapI,ALLM().length-1)}})),[{t:()=>CMAPS.length?'(Backspace / Y on a map: delete it)':'',f:()=>{}}]);
function openMaker(m){mUp(m);MK={m,cx:m.cw>>1,cy:m.ch>>1,tool:0,foc:1,row:0,dn:0,tab:0,li:-1,ei:-1,scr:0};mode='maker'}
DEFER(()=>{addEventListener('wheel',e=>{if(MK&&mode==='maker'){MK.row=clamp(MK.row+(e.deltaY>0?1:-1),0,999);MK.foc=1}},{passive:true});});
const MKT=['Wall','Teleporter','Erase'],PERMK=()=>['',...ITEMS.map(i=>i.k)];
const mkCell=(m,x,y)=>{if(x<0||y<0||x>=m.cw||y>=m.ch)return;const has=a=>a.findIndex(([a1,b1])=>a1===x&&b1===y),wi=has(m.walls),ti=has(m.tps);
 if(MK.tool===0&&wi<0&&ti<0)m.walls.push([x,y]);if(MK.tool===1&&wi<0){if(ti>=0)m.tps.splice(ti,1);else if(m.tps.length<8)m.tps.push([x,y])}if(MK.tool===2){if(wi>=0)m.walls.splice(wi,1);if(ti>=0)m.tps.splice(ti,1)}saveMaps()};

DEFER(()=>{{const N0=nav;nav=ev=>{if(mode!=='maker')return N0(ev);const m=MK.m,L=MKR();
 if(ev==='tabL'||ev==='tabR'){MK.tool=(MK.tool+(ev==='tabL'?2:1))%3;sfx('se_select00',.6);return}
 if(MK.foc===0){if(ev==='up')MK.cy=(MK.cy+m.ch-1)%m.ch;if(ev==='down')MK.cy=(MK.cy+1)%m.ch;if(ev==='left')MK.cx=(MK.cx+m.cw-1)%m.cw;if(ev==='right')MK.cx=(MK.cx+1)%m.cw;
  if(ev==='ok')mkCell(m,MK.cx,MK.cy);if(ev==='reset'){const t=MK.tool;MK.tool=2;mkCell(m,MK.cx,MK.cy);MK.tool=t}if(ev==='back'){MK.foc=1;sfx('cancel00')}return}
 if(ev==='up'||ev==='down'){MK.row=(MK.row+(ev==='up'?L.length-1:1))%L.length;sfx('se_select00',.6)}
 if((ev==='left'||ev==='right')&&L[MK.row].lr){L[MK.row].lr(ev==='left'?-1:1);sfx('se_select00',.6)}if(ev==='ok'){sfx('ok00');const r=L[MK.row];r.f?r.f():r.lr(1)}if(ev==='back'){MK.foc=0;sfx('cancel00')}}}});
DEFER(()=>{addEventListener('mousedown',e=>{if(MK&&e.button===0)MK.dn=1});});
// molette + Ctrl (ou pincement sur mobile) : zoom de la carte dans l'éditeur
function mkZoom(z,mx,my){const m=MK.m,sb=MK.sb||1,z0=MK.zm||1,z1=clamp(z,1,6),wx=(mx-20+(MK.pnx||0))/(sb*z0),wy=(my-60+(MK.pny||0))/(sb*z0);MK.zm=z1;
 MK.pnx=clamp(20+wx*sb*z1-mx,0,m.w*sb*(z1-1));MK.pny=clamp(60+wy*sb*z1-my,0,m.h*sb*(z1-1))}
DEFER(()=>{addEventListener('wheel',e=>{if(MK&&mode==='maker'&&e.ctrlKey){mkZoom((MK.zm||1)*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY)}},{passive:true});});DEFER(()=>{addEventListener('mouseup',()=>{if(MK)MK.dn=0});});
function drawMaker(){hot=[];const m=mUp(MK.m),pw=Math.min(430,W*.42),sb=Math.min((W-pw-50)/m.w,(H-90)/m.h),sc=sb*(MK.zm||1),ox=20-(MK.pnx||0),oy=60-(MK.pny||0),c=CS*sc;MK.sb=sb;MK.g={x:20,y:60,w:m.w*sb,h:m.h*sb};
 ctx.textAlign='left';ctx.fillStyle='#fff';ctx.font='bold 22px monospace';ctx.fillText('MAP MAKER · '+m.name,20,36);ctx.font='12px monospace';ctx.fillStyle='#888';ctx.fillText(m.cw+'×'+m.ch+' cells · '+m.layers.length+' layer(s) · '+m.ev.length+' rule(s)'+(m.js?' · script':'')+(m.mus?' · music':''),20,52);
 ctx.save();ctx.beginPath();ctx.rect(20,60,m.w*sb,m.h*sb);ctx.clip();ctx.fillStyle=m.bg||'#14161f';ctx.fillRect(ox,oy,m.w*sc,m.h*sc);
 const now=performance.now();for(const l of m.layers){if(l.hid)continue;const a=AST[l.a];if(!a||!a.img)continue;const im=a.img,cols=Math.max(1,l.cols|0),rows=Math.max(1,l.rows|0),n=clamp(l.n|0||1,1,cols*rows),fw=im.naturalWidth/cols,fh=im.naturalHeight/rows,f=n>1?Math.floor((now%Math.max(16,l.dur))/Math.max(16,l.dur)*n)%n:0,w=fw*l.sc*sc,h=fh*l.sc*sc;if(w<1||h<1)continue;
  const px=ox+(m.w/2*(1-l.par)+l.ox+l.sx*now/1000)*sc,py=oy+(m.h/2*(1-l.par)+l.oy+l.sy*now/1000)*sc;ctx.globalAlpha=l.al*(l.fg?.7:1);ctx.globalCompositeOperation=l.add?'lighter':'source-over';
  if(l.tile){const x0=px-Math.ceil((px-ox)/w)*w,y0=py-Math.ceil((py-oy)/h)*h;let k=0;for(let y=y0;y<oy+m.h*sc&&k<300;y+=h)for(let x=x0;x<ox+m.w*sc&&k<300;x+=w,k++)ctx.drawImage(im,(f%cols)*fw,(f/cols|0)*fh,fw,fh,x,y,w+.5,h+.5)}else ctx.drawImage(im,(f%cols)*fw,(f/cols|0)*fh,fw,fh,px,py,w,h)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 if(c>=4){ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<=m.cw;x++){ctx.moveTo(ox+x*c,oy);ctx.lineTo(ox+x*c,oy+m.h*sc)}for(let y=0;y<=m.ch;y++){ctx.moveTo(ox,oy+y*c);ctx.lineTo(ox+m.w*sc,oy+y*c)}ctx.stroke()}
 ctx.strokeStyle='rgba(255,80,80,.35)';ctx.strokeRect(ox+100*sc,oy+100*sc,(m.w-200)*sc,(m.h-200)*sc);
 ctx.fillStyle='#4a3f7a';for(const[x,y]of m.walls)ctx.fillRect(ox+x*c+(c>3?1:0),oy+y*c+(c>3?1:0),Math.max(1,c-(c>3?2:0)),Math.max(1,c-(c>3?2:0)));
 m.tps.forEach(([x,y],i)=>{ctx.strokeStyle=tpCol(i);ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox+(x+.5)*c,oy+(y+.5)*c,Math.max(3,c*.38),0,TAU);ctx.stroke();if(c>10){ctx.fillStyle=tpCol(i);ctx.font='bold '+Math.max(8,c*.4|0)+'px monospace';ctx.textAlign='center';ctx.fillText(1+(i>>1),ox+(x+.5)*c,oy+(y+.65)*c)}});
 ctx.restore();ctx.strokeStyle='#333';ctx.strokeRect(ox,oy,m.w*sc,m.h*sc);
 ctx.strokeStyle=MK.foc?'#888':'#ffd23a';ctx.lineWidth=2;ctx.strokeRect(ox+MK.cx*c,oy+MK.cy*c,Math.max(3,c),Math.max(3,c));
 hot.push({x:20,y:60,w:m.w*sb,h:m.h*sb,hover:()=>{MK.foc=0;MK.cx=clamp((MOUSE.x-ox)/c|0,0,m.cw-1);MK.cy=clamp((MOUSE.y-oy)/c|0,0,m.ch-1);if(MK.dn&&MK.tool!==1)mkCell(m,MK.cx,MK.cy)},click:(x,y)=>{if(x!==undefined){MK.cx=clamp((x-ox)/c|0,0,m.cw-1);MK.cy=clamp((y-oy)/c|0,0,m.ch-1)}mkCell(m,MK.cx,MK.cy)}});
 const px=W-pw-10,L=MKR(),rh=26,vis=Math.max(5,Math.floor((H-200)/rh));MK.row=clamp(MK.row,0,L.length-1);MK.scr=clamp(MK.scr||0,Math.max(0,MK.row-vis+1),Math.min(MK.row,Math.max(0,L.length-vis)));
 ctx.fillStyle='rgba(10,12,20,.9)';ctx.fillRect(px-10,62,pw+12,vis*rh+16);ctx.textAlign='left';
 MKTABS.forEach((t,i)=>{const tw=pw/MKTABS.length,x=px+i*tw,s=i===(MK.tab||0);ctx.fillStyle=s?'#ffd23a':'#1a1d2b';ctx.fillRect(x,40,tw-3,20);ctx.fillStyle=s?'#10121c':'#aaa';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(t,x+tw/2,54);hot.push({x,y:40,w:tw-3,h:20,hover:()=>{},click:()=>{MK.tab=i;MK.row=0;MK.scr=0;sfx('se_select00',.6)}})});ctx.textAlign='left';
 for(let j=0;j<vis&&MK.scr+j<L.length;j++){const i=MK.scr+j,r=L[i],y=86+j*rh,s=MK.foc===1&&i===MK.row;let tx=r.t();ctx.font=(s?'bold ':'')+'13px monospace';while(tx.length>4&&ctx.measureText(tx).width>pw-20)tx=tx.slice(0,-2);ctx.fillStyle=s?'#ffd23a':i===0?'#9fe0c0':'#bbb';ctx.fillText((s?'▶ ':'  ')+tx,px,y);
  hot.push({x:px,y:y-18,w:pw,h:rh,hover:()=>{MK.foc=1;MK.row=i},click:x=>{if(r.lr&&x!==undefined&&!r.f)r.lr(x<px+pw/2?-1:1);else nav('ok')}})}
 if(L.length>vis){ctx.fillStyle='#555';const sh=vis/L.length*(vis*rh);ctx.fillRect(px+pw-4,70+MK.scr/L.length*(vis*rh),3,sh)}
 ctx.font='11px monospace';ctx.fillStyle='#888';['Grid: arrows + Enter / mouse drag · Backspace: erase','Esc: grid ↔ panel · ◀ ▶ change · Shift: ×10','Q / E: tool · tabs at the top of the panel'].forEach((l,i)=>ctx.fillText(l,px,H-60+i*15))}
const tpCol=i=>'hsl('+((i>>1)*80+180)%360+',90%,65%)';
// carte en jeu : murs solides, téléporteurs, item permanent
DEFER(()=>{{const S0=start;start=m=>{S0(m);WG=null;TPS=[];if(!CMAP)return;const M=CMAP;WG=new Uint8Array(M.cw*M.ch);for(const[x,y]of M.walls)WG[y*M.cw+x]=1;TPS=M.tps.map(([x,y],i)=>({x:(x+.5)*CS,y:(y+.5)*CS,i}));
 for(const p of P)if(wallAt(p.x,p.y)){let best=null,bd=1e9;for(let y=0;y<M.ch;y++)for(let x=0;x<M.cw;x++)if(!WG[y*M.cw+x]){const cx=(x+.5)*CS,cy=(y+.5)*CS,d=Math.hypot(cx-p.x,cy-p.y);if(d<bd){bd=d;best=[cx,cy]}}if(best){p.x=best[0];p.y=best[1]}}}}});
const wallAt=(x,y)=>{if(!WG)return 0;const gx=x/CS|0,gy=y/CS|0;return gx>=0&&gy>=0&&gx<CMAP.cw&&gy<CMAP.ch&&WG[gy*CMAP.cw+gx]};
function mapPhys(){if(!WG)return;const M=CMAP;
 for(const p of P){if(p.state==='dead')continue;const R=bodyR(p);for(let gy=Math.floor((p.y-R)/CS);gy<=Math.floor((p.y+R)/CS);gy++)for(let gx=Math.floor((p.x-R)/CS);gx<=Math.floor((p.x+R)/CS);gx++){if(gx<0||gy<0||gx>=M.cw||gy>=M.ch||!WG[gy*M.cw+gx])continue;
   const nx=clamp(p.x,gx*CS,gx*CS+CS),ny=clamp(p.y,gy*CS,gy*CS+CS);let dx=p.x-nx,dy=p.y-ny,d=Math.hypot(dx,dy);if(d>=R)continue;if(d<.01){dx=p.x-(gx+.5)*CS;dy=p.y-(gy+.5)*CS;d=Math.hypot(dx,dy)||1}
   const ux=dx/d,uy=dy/d,pen=R-Math.min(d,R);p.x+=ux*pen;p.y+=uy*pen;const vn=p.vx*ux+p.vy*uy;if(vn<0){const k=p.state==='hitstun'?1.6:1;p.vx-=vn*ux*k;p.vy-=vn*uy*k;if(p.state==='hitstun'&&vn<-8){shake=Math.min(30,shake+8);crack(p.x-ux*R,p.y-uy*R);sfx('bord_brise2',.4)}}}
  if((p.tpCD||0)<frame)for(const t of TPS){const o=TPS[t.i^1];if(!o||Math.hypot(p.x-t.x,p.y-t.y)>22)continue;burst(p.x,p.y,tpCol(t.i),16);p.x=o.x;p.y=o.y;p.tpCD=frame+45;burst(p.x,p.y,tpCol(t.i),16);sfx('wrap_teleportation',.6);break}
  if(p.tpCD>frame&&p.tpCD-frame<2&&TPS.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<26))p.tpCD=frame+2} // ne repart pas tant qu'on reste dessus
 for(const b of B)if(!b.dead&&wallAt(b.x,b.y)){b.dead=1;if(b.heavy)burst(b.x,b.y,'#7a6aff',8)}}
DEFER(()=>{{const S1=step;step=()=>{const w0=WT;S1();if(mode!=='game'||WT===w0)return;mapPhys();
 if(CMAP&&CMAP.perm&&itemsOn!==false&&frame%30===0)for(const p of P)if(p.state==='idle'&&!(p.acts||[]).some(a=>a.k===CMAP.perm))give(p,CMAP.perm)}}}); // item de la carte toujours actif pour tous
DEFER(()=>{{const C0=cpuInput;cpuInput=(p,o)=>{const I=C0(p,o);if(WG&&Math.hypot(I.x,I.y)>.1){const a=Math.atan2(I.y,I.x),l=Math.hypot(I.x,I.y);for(const da of[0,.7,-.7,1.4,-1.4,2.2,-2.2]){const x=p.x+Math.cos(a+da)*38,y=p.y+Math.sin(a+da)*38;if(!wallAt(x,y)){I.x=Math.cos(a+da)*l;I.y=Math.sin(a+da)*l;break}}}return I}}}); // contourne les murs
function drawMapObj(L,Tp,R,Bt){if(!WG)return;const M=CMAP;ctx.fillStyle='#2b2546';ctx.strokeStyle='#7a6aff';ctx.lineWidth=2;
 for(let gy=Math.max(0,Tp/CS|0);gy<=Math.min(M.ch-1,Bt/CS|0);gy++)for(let gx=Math.max(0,L/CS|0);gx<=Math.min(M.cw-1,R/CS|0);gx++)if(WG[gy*M.cw+gx]){ctx.fillRect(gx*CS,gy*CS,CS,CS);ctx.strokeRect(gx*CS+1,gy*CS+1,CS-2,CS-2)}
 for(const t of TPS){const c=tpCol(t.i);ctx.strokeStyle=c;ctx.lineWidth=3;for(let k=0;k<2;k++){ctx.beginPath();ctx.arc(t.x,t.y,16+k*6,frame*.05*(k?-1:1),frame*.05*(k?-1:1)+TAU*.75);ctx.stroke()}ctx.globalAlpha=.25;ctx.fillStyle=c;ctx.beginPath();ctx.arc(t.x,t.y,14,0,TAU);ctx.fill();ctx.globalAlpha=1}}

