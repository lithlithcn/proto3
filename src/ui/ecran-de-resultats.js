'use strict';
// ---- écran de résultats : podium, panneaux ornés, stats, titres, courbe du match
let TLG=[],RAW=null;
DEFER(()=>{{const S0=start;start=(...a)=>{const r=S0(...a);TLG=[];RAW=null;return r}}});
DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode!=='game'||WT===w0||winner>=0)return;if(frame%30===0)TLG[frame/30|0]=P.map(p=>Math.max(0,(p.state==='dead'?Math.max(0,p.stocks):p.stocks-1))*T.HP+(p.state==='dead'?0:Math.max(0,p.hp)))}}});
DEFER(()=>{{const S0=startSpell;startSpell=(p,...a)=>{p.spN=(p.spN||0)+1;return S0(p,...a)}}});
// classement : vainqueur, puis sorti le plus tard ; à la fin du temps : vies, puis PV, puis KO/dégâts
/** Owner's ranking rule: lives left (more is better); among eliminated players (0 lives) the one eliminated later is better;
 *  then KOs (more), damage dealt (more), damage taken (less). The declared winner (or winning team) stays first. Works for any player count. */
function rankCmp(a,b){const st=p=>Math.max(0,p.stocks|0),out=p=>p.outAt||0;return st(b)-st(a)||(st(a)===0?out(b)-out(a):0)||(b.kos||0)-(a.kos||0)||(b.dmgDealt||0)-(a.dmgDealt||0)||(a.dmgTk||0)-(b.dmgTk||0)||a.id-b.id}
DEFER(()=>{rankList=function(){return [...P].sort((a,b)=>(TEAMS&&winner>=0?(TEAMA[b.id]===TEAMA[winner])-(TEAMA[a.id]===TEAMA[winner]):0)||(!TEAMS&&winner>=0?(b.id===winner)-(a.id===winner):0)||rankCmp(a,b))};});
function resAwards(){const L=P.filter(p=>p),A=new Map,give=(k,lab,col,f,lo)=>{let best=null,bv=lo?1e18:-1e18;for(const p of L){const v=f(p);if(v==null)continue;if(lo?v<bv:v>bv){bv=v;best=p}}if(best&&bv!==0&&(lo||bv>0)){const a=A.get(best.id)||[];if(a.length<2){a.push([lab,col]);A.set(best.id,a)}}};
 give('agr','MOST AGGRESSIVE','#ff5a6a',p=>p.dmgDealt||0);give('kos','KO MACHINE','#ffd23a',p=>p.kos||0);give('par','PARRY MASTER','#6ff',p=>p.parN||0);give('spl','SPELL ADDICT','#c08cff',p=>p.spN||0);
 give('big','HEAVY HITTER','#ff9a3a',p=>p.bigHit||0);give('wal','IRON WALL','#7fa8ff',p=>L.length>1?(p.dmgTk||0)+1:null,1);give('sd','OOPS…','#999',p=>p.sd||0);return A}
// cadre façon Limbus : coins coupés, double bordure, crochets et losange
function ornFrame(x,y,w,h,col,a){const c=ctx,k=Math.min(18,h*.12);c.save();c.globalAlpha*=a==null?1:a;const pth=(i)=>{c.beginPath();c.moveTo(x+k+i,y+i);c.lineTo(x+w-k-i,y+i);c.lineTo(x+w-i,y+k+i);c.lineTo(x+w-i,y+h-k-i);c.lineTo(x+w-k-i,y+h-i);c.lineTo(x+k+i,y+h-i);c.lineTo(x+i,y+h-k-i);c.lineTo(x+i,y+k+i);c.closePath()};
 const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'rgba(18,20,36,.94)');g.addColorStop(1,'rgba(8,9,18,.94)');c.fillStyle=g;pth(0);c.fill();c.strokeStyle=hexA(col,.85);c.lineWidth=2;pth(1);c.stroke();c.strokeStyle=hexA(col,.3);c.lineWidth=1;pth(6);c.stroke();
 c.strokeStyle=col;c.lineWidth=3;const L=Math.min(30,w*.12);for(const[sx,sy]of[[0,0],[1,0],[0,1],[1,1]]){const px=sx?x+w-4:x+4,py=sy?y+h-4:y+4,dx=sx?-1:1,dy=sy?-1:1;c.beginPath();c.moveTo(px+dx*(k+L),py);c.lineTo(px+dx*k,py);c.moveTo(px,py+dy*k);c.lineTo(px,py+dy*(k+L));c.stroke()}
 c.fillStyle=col;c.beginPath();c.moveTo(x+w/2,y-5);c.lineTo(x+w/2+7,y+1);c.lineTo(x+w/2,y+7);c.lineTo(x+w/2-7,y+1);c.fill();c.restore()}
function resPortrait(p,cx,cy,s){const C=chOf(p);if(!C)return;const fq={x:cx,y:cy,aim:-Math.PI/2+Math.sin(UNOW()*1.3+p.id)*.4,chM:(UNOW()/1.5|0)%3,chC:4,chG:70,chS:3,chT:0,state:'idle',fx:{}};ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.translate(-cx,-cy);ctx.fillStyle='#222';ctx.strokeStyle=C.col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,T.BODY_R,0,TAU);ctx.fill();ctx.stroke();try{C.draw(fq,T.BODY_R)}catch(e){}ctx.restore()}
DEFER(()=>{drawResults=function(){const t=winT-100,L=rankList(),n=L.length,MED=['#ffd23a','#d8e0ea','#e09a5a'],c=ctx;if(t===1||!RAW){RAW=resAwards();TLG.push(P.map(p=>Math.max(0,p.state==='dead'?Math.max(0,p.stocks):p.stocks-1)*T.HP+(p.state==='dead'?0:Math.max(0,p.hp))))}
 const a=eo(t/20),wc=TEAMS?TCOL[TEAMA[winner]]:COLS[winner];c.save();c.fillStyle='rgba(4,5,12,'+(.8*a)+')';c.fillRect(0,0,W,H);
 c.globalAlpha=.08*a;c.fillStyle=wc;for(let i=-2;i<W/60+4;i++){const x=i*60+((t*1.2)%60);c.beginPath();c.moveTo(x,0);c.lineTo(x+30,0);c.lineTo(x+30-H*.4,H);c.lineTo(x-H*.4,H);c.fill()}c.globalAlpha=1;
 const rg=c.createRadialGradient(W*.28,H*.55,0,W*.28,H*.55,H*.6);rg.addColorStop(0,hexA(wc,.22*a));rg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=rg;c.fillRect(0,0,W,H);
 if(t===1){RSC=[];for(let i=0;i<(fxLow?40:140);i++)RSC.push({x:Math.random()*W,y:-Math.random()*H*.6,vx:(Math.random()-.5)*2,vy:1+Math.random()*3,r:Math.random()*6.28,c:['#ffd23a','#ff5a7a','#5ab4ff','#5cff8a','#fff'][i%5]})}
 for(const q of RSC){q.x+=q.vx;q.y+=q.vy;q.r+=.1;if(q.y>H+20){q.y=-10;q.x=Math.random()*W}c.save();c.translate(q.x,q.y);c.rotate(q.r);c.fillStyle=q.c;c.globalAlpha=.8*a;c.fillRect(-4,-2,8,4);c.restore()}
 const port=W/H<1.25,sc=Math.min(1.25,Math.max(.62,Math.min(W/1500,H/850)));
 // bandeau du vainqueur
 const title=(TEAMS?TNAME[TEAMA[winner]]+' TEAM':pname(P[winner]))+' WINS!',bs=eob(t/22),by=H*(port?.08:.11);c.save();c.translate(W/2,by);c.scale(bs,bs);c.rotate(-.02);c.textAlign='center';let fs=Math.min(H*.085,W*.075);c.font=UFI(fs);while(c.measureText(title).width>W*.86&&fs>14){fs*=.92;c.font=UFI(fs)}
 const tw=c.measureText(title).width;c.fillStyle='#05060c';skewRect(-tw/2-40,-fs*.95,tw+80,fs*1.3,fs*.3);c.fill();c.fillStyle=wc;skewRect(-tw/2-40,fs*.3,tw+80,5,4);c.fill();strokeTxt(title,0,0,9,'#05060c','#fff');c.globalCompositeOperation='lighter';c.globalAlpha=.25+.15*Math.sin(t*.12);c.fillStyle=wc;c.fillText(title,3,2);
 const sw=((t*12)%(tw*3))-tw*1.5,sg=c.createLinearGradient(sw-60,0,sw+60,0);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.35)');sg.addColorStop(1,'rgba(255,255,255,0)');c.globalAlpha=1;c.fillStyle=sg;c.fillText(title,0,0);c.restore();
 // podium
 const pw=port?W*.96:W*.42,px0=port?W*.02:W*.04,pbase=port?H*.44:H*.78,stepW=Math.min(pw/3.3,220*sc),order=[1,0,2],hs=[1,.62,.42],ph=(port?H*.17:H*.3);
 order.forEach((ri,col)=>{const p=L[ri];if(!p)return;const st=18+col*10+(ri===0?24:0),u=clamp((t-st)/28,0,1),e=eob(u),cx=px0+pw/2+(col-1)*(stepW+14*sc),h=ph*hs[ri]*e,x=cx-stepW/2,y=pbase-h,mc=MED[ri],pc=COLS[p.id];if(u<=0)return;
  const g=c.createLinearGradient(x,y,x+stepW,y+h);g.addColorStop(0,hexA(mc,.95));g.addColorStop(.5,hexA(mc,.55));g.addColorStop(1,hexA(mc,.85));c.fillStyle='#05060c';c.fillRect(x-3,y-3,stepW+6,h+3);c.fillStyle=g;c.fillRect(x,y,stepW,h);
  c.save();c.beginPath();c.rect(x,y,stepW,h);c.clip();c.globalAlpha=.18;c.fillStyle='#000';for(let q=-4;q<10;q++){const xx=x+q*24+((t*.6)%24);c.beginPath();c.moveTo(xx,y);c.lineTo(xx+10,y);c.lineTo(xx-30,y+h);c.lineTo(xx-40,y+h);c.fill()}c.restore();
  c.fillStyle=pc;c.fillRect(x,y,stepW,5);c.textAlign='center';c.font=UFI(Math.min(h*.55,stepW*.5));if(h>30)strokeTxt(String(ri+1),cx,y+h*.62,6,'#05060c','#fff');
  const pu=clamp((t-st-14)/20,0,1),pe=eob(pu);if(pu>0){const pr=(ri===0?1.25:1)*stepW*.3,py=y-pr-30-(1-pe)*H*.3+Math.sin(UNOW()*2+ri)*3;c.save();c.globalAlpha=pu;
   if(ri===0){c.globalCompositeOperation='lighter';const hg=c.createRadialGradient(cx,py,0,cx,py,pr*2.2);hg.addColorStop(0,hexA(mc,.55));hg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=hg;c.fillRect(cx-pr*2.2,py-pr*2.2,pr*4.4,pr*4.4);c.globalCompositeOperation='source-over';
    c.save();c.translate(cx,py-pr-8);c.rotate(Math.sin(UNOW()*2)*.08);c.fillStyle=mc;c.beginPath();c.moveTo(-pr*.5,0);c.lineTo(-pr*.5,-pr*.35);c.lineTo(-pr*.25,-pr*.15);c.lineTo(0,-pr*.45);c.lineTo(pr*.25,-pr*.15);c.lineTo(pr*.5,-pr*.35);c.lineTo(pr*.5,0);c.closePath();c.fill();c.strokeStyle='#05060c';c.lineWidth=3;c.stroke();c.restore()}
   c.strokeStyle=pc;c.lineWidth=4;c.beginPath();c.arc(cx,py,pr,0,TAU);c.stroke();resPortrait(p,cx,py,pr/T.BODY_R*.8);
   c.font=UFI(Math.max(12,stepW*.12));c.textAlign='center';strokeTxt(pname(p).slice(0,14),cx,y-6+(ri===0?0:0)+ (h<40?-4:0)-0,5,'#05060c',pc);c.restore()}});
 if(n>3){const u=clamp((t-60)/20,0,1);c.save();c.globalAlpha=u;c.textAlign='left';c.font='bold '+Math.round(13*sc)+'px monospace';let xx=px0,yy=pbase+22*sc;for(let i=3;i<n;i++){const p=L[i],s=(i+1)+'. '+pname(p),w=c.measureText(s).width+20;if(xx+w>px0+pw){xx=px0;yy+=24*sc}c.fillStyle='rgba(20,22,34,.9)';c.fillRect(xx,yy-15*sc,w,20*sc);c.fillStyle=COLS[p.id];c.fillRect(xx,yy-15*sc,3,20*sc);c.fillText(s,xx+10,yy);xx+=w+8}c.restore()}
 // panneau des stats + titres
 const fx=port?W*.03:W*.5,fw=port?W*.94:W*.47,fy0=port?H*.52:H*.2,rowH=Math.max(22,Math.min(40*sc,(port?H*.26:H*.38)/Math.max(n,1)-4)),fh=34*sc+n*(rowH+4)+12,fu=eo(clamp((t-30)/25,0,1));
 if(fu>0){c.save();c.translate((1-fu)*W*.3,0);ornFrame(fx,fy0,fw,fh,wc,fu);const cols=[['KO',p=>p.kos||0],['DMG',p=>p.dmgDealt||0],['TAKEN',p=>p.dmgTk||0],['PARRY',p=>p.parN||0],['SPELL',p=>p.spN||0],['BEST',p=>p.bigHit||0]],nx=fx+fw*.36,cw=(fw*.62)/cols.length;
  c.font='bold '+Math.round(11*sc+2)+'px monospace';c.textAlign='center';c.fillStyle=hexA(wc,.9);cols.forEach((q,j)=>c.fillText(q[0],nx+cw*(j+.5),fy0+24*sc));c.textAlign='left';c.fillText('RESULTS',fx+20,fy0+24*sc);
  L.forEach((p,i)=>{const ry=fy0+34*sc+i*(rowH+4),u=clamp((t-40-i*6)/18,0,1);if(u<=0)return;c.save();c.globalAlpha*=u;c.translate((1-eo(u))*40,0);c.fillStyle=i===0?hexA(MED[0],.14):'rgba(255,255,255,.04)';c.fillRect(fx+12,ry,fw-24,rowH);c.fillStyle=COLS[p.id];c.fillRect(fx+12,ry,4,rowH);
   c.font=UFI(rowH*.55);c.fillStyle=MED[i]||'#8a8f9a';c.fillText(String(i+1),fx+24,ry+rowH*.72);c.font='bold '+Math.round(rowH*.42)+'px sans-serif';c.fillStyle=COLS[p.id];c.fillText(pname(p).slice(0,12),fx+24+rowH*.75,ry+rowH*.48);
   const aw=RAW.get(p.id);if(aw){c.font='bold '+Math.round(rowH*.24+3)+'px monospace';let ax=fx+24+rowH*.75;for(const[lb,ac]of aw){const w=c.measureText(lb).width+10;if(ax+w>nx-4)break;c.fillStyle=hexA(ac,.2);c.fillRect(ax,ry+rowH*.58,w,rowH*.34);c.fillStyle=ac;c.fillText(lb,ax+5,ry+rowH*.85);ax+=w+5}}
   c.textAlign='center';c.font='bold '+Math.round(rowH*.42)+'px monospace';const cu=clamp((t-46-i*6)/40,0,1);cols.forEach((q,j)=>{const v=Math.round(q[1](p)*cu);c.fillStyle=v?'#fff':'#667';c.fillText(String(v),nx+cw*(j+.5),ry+rowH*.66)});c.textAlign='left';
   if(NET&&ONL&&ONL.rdy&&ONL.rdy.has(p.id)){c.fillStyle='#5cff8a';c.font='bold '+Math.round(rowH*.3)+'px monospace';c.textAlign='right';c.fillText('✔ READY',fx+fw-20,ry+rowH*.35);c.textAlign='left'}c.restore()});
  c.restore()}
 // courbe du match
 const gy0=fy0+fh+18*sc,gh=port?0:Math.min(H*.86-gy0-40*sc,H*.22);if(!port&&gh>60&&TLG.length>1){const gu=eo(clamp((t-70)/30,0,1));if(gu>0){c.save();ornFrame(fx,gy0,fw,gh,'#7fa8ff',gu);const ix=fx+22,iw=fw-44,iy=gy0+28*sc,ih=gh-40*sc,S=TLG.filter(Boolean),mx=Math.max(1,...S.flat());
  c.font='bold '+Math.round(11*sc+2)+'px monospace';c.fillStyle='#7fa8ff';c.fillText('MATCH FLOW',ix,gy0+20*sc);c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;for(let k=0;k<=4;k++){const yy=iy+ih*k/4;c.beginPath();c.moveTo(ix,yy);c.lineTo(ix+iw,yy);c.stroke()}
  const rv=clamp((t-80)/70,0,1);c.beginPath();c.rect(ix-4,iy-6,iw*rv+8,ih+12);c.clip();for(const p of P){const col=COLS[p.id];c.strokeStyle=col;c.lineWidth=2.5;c.shadowColor=col;c.shadowBlur=8;c.beginPath();S.forEach((s,k)=>{const xx=ix+iw*k/(S.length-1),yy=iy+ih*(1-(s[p.id]||0)/mx);k?c.lineTo(xx,yy):c.moveTo(xx,yy)});c.stroke()}c.shadowBlur=0;c.restore()}}
 c.textAlign='center';const fyB=port?Math.min(H-40,fy0+fh+40):Math.max(H*.9,Math.min(H-30,gy0+gh+40));
 if(NET&&ONL)onlResDraw(fyB);else if(t>40){c.globalAlpha=clamp((t-40)/20,0,1);c.fillStyle='#ccc';c.font='bold '+Math.round(14*sc+2)+'px monospace';c.fillText((TCH&&TCH.on?'Tap: rematch':'Enter / A: rematch  ·  V / Y: replay  ·  M / B: menu'),W/2,fyB);c.globalAlpha=1}
 c.restore()};});
