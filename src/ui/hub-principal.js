'use strict';
// ---- hub principal
const HUB=[
 {k:'fight',t:'FIGHT!',c:'#ff3355',d:'Start a match right now with the current rules.',f:()=>{sfx('ok00');start('game')}},
 {k:'online',t:'ONLINE',c:'#29d4ff',d:'Play with friends over the internet (2 to 32 players).',f:()=>onlOpen()},
 {k:'train',t:'TRAINING',c:'#9dff3a',d:'Practice freely: test every item, infinite lives, dummies.',f:()=>trainStart()},
 {k:'rules',t:'RULES',c:'#ffd23a',d:'Fighters, CPUs, lives, timer, map, items, teams, tempo.',f:()=>openSub('RULES',RULESL)},
 {k:'items',t:'ITEMS',c:'#ff4fd8',d:'Turn each item on or off.',f:()=>{mode='items';itemSel=0}},
 {k:'maps',t:'MAP MAKER',c:'#9b6bff',d:'Build your own arenas: layers, music, rules, scripts, export.',f:()=>openSub('MAP MAKER',MAPM)},
 {k:'opt',t:'OPTIONS',c:'#7fa8ff',d:'Sound, profiles, controls, effects.',f:()=>openSub('OPTIONS',OPTL)},
 {k:'help',t:'HOW TO PLAY',c:'#ff9a3a',d:'Tutorial and full guide.',f:()=>openSub('HOW TO PLAY',HELPL)}];
const RULESL=()=>MENU.filter(r=>/^(Mode|Fighters|Humans|CPU level|Lives|Timer|Map:|Items:|Cards at once|Teams|Tempo)/.test(r.t()));
const OPTL=()=>MENU.filter(r=>/^(Effects|Full screen|Motion|Screen shake|Interface size|Color-blind|Error report|Sound…|Records…|Profiles…|Controls)/.test(r.t())).concat([{t:()=>'Title screen',f:()=>{mode='title';UITITLE.t0=UNOW()}}]);
const HELPL=()=>MENU.filter(r=>/^(How to play|Guide)/.test(r.t()));
const RDESC={Mode:'CASUAL = your own rules. COMPETITIVE = 4 lives, 5 minutes, no items.',Fighters:'How many fighters are in the arena (2 to 8).',Humans:'How many of them are real players; the rest are CPUs.','CPU level':'9 = superhuman: perfect parries and reactions.',Lives:'Number of stocks per fighter.',Timer:'Match length in minutes (OFF = until the last one standing).',Map:'Arena. Custom maps from the Map maker appear here too.',Items:'Item cards that spawn during the match.','Cards at once':'Maximum item cards on the map at the same time.',Teams:'Enter to choose the team of each player.',Tempo:'How fast cards spawn and how frantic the match gets.',Effects:'REDUCED = fewer flashes and particles (photosensitive players).',Motion:'SMOOTH = fluid on 120/144 Hz screens (shows the last frame blended, about 8 ms later). STRICT 60 = raw frames. AUTO = smooth only on fast screens.','Sound…':'Volumes and custom music for each screen.','Profiles…':'Player names, colors and name animations.',Controls:'Keyboard / gamepad bindings.','How to play':'Interactive tutorial.',Guide:'Every mechanic explained.','Title screen':'Back to the title screen.'};
// placement : grande carte à gauche, deux cartes à droite, ruban de petites cartes en bas
function hubLayout(){const SB=YTSB||0,m=Math.min(W-SB,H*1.9),x0=SB+(W-SB)/2-m*.47,y0=H*.17,ch=H*.5,R=[];
 R.push({i:0,x:x0,y:y0,w:m*.52,h:ch,rot:-.035,big:1});R.push({i:1,x:x0+m*.55,y:y0,w:m*.39,h:ch*.48,rot:.025});R.push({i:2,x:x0+m*.53,y:y0+ch*.53,w:m*.39,h:ch*.47,rot:-.02});
 const n=5,bw=m*.94/n;for(let j=0;j<n;j++)R.push({i:3+j,x:x0+j*bw+(j%2?6:0),y:y0+ch+H*.05+(j%2?H*.018:0),w:bw-14,h:H*.13,rot:(j%2?.03:-.03)});return R}
function hubIcon(k,x,y,s,c){ctx.save();ctx.translate(x,y);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=Math.max(2,s*.09);ctx.lineCap='round';
 if(k==='fight'){for(const sg of[-1,1]){ctx.beginPath();ctx.moveTo(-s*.45*sg,-s*.45);ctx.lineTo(s*.4*sg,s*.4);ctx.stroke();ctx.beginPath();ctx.moveTo(s*.22*sg,s*.42);ctx.lineTo(s*.42*sg,s*.22);ctx.stroke()}}
 else if(k==='online'){ctx.beginPath();ctx.arc(0,0,s*.42,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,s*.18,s*.42,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-s*.42,0);ctx.lineTo(s*.42,0);ctx.stroke()}
 else if(k==='train'){for(const r of[.42,.26,.1]){ctx.beginPath();ctx.arc(0,0,s*r,0,TAU);ctx.stroke()}}
 else if(k==='rules'){for(let i=0;i<3;i++){const yy=(i-1)*s*.3;ctx.beginPath();ctx.moveTo(-s*.42,yy);ctx.lineTo(s*.42,yy);ctx.stroke();ctx.beginPath();ctx.arc([-.2,.25,-.05][i]*s,yy,s*.09,0,TAU);ctx.fill()}}
 else if(k==='items'){ctx.save();ctx.rotate(-.2);ctx.strokeRect(-s*.26,-s*.38,s*.52,s*.76);ctx.beginPath();ctx.arc(0,0,s*.13,0,TAU);ctx.fill();ctx.restore()}
 else if(k==='maps'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)if((i+j)%2===0)ctx.fillRect((i-1.5)*s*.27,(j-1.5)*s*.27,s*.25,s*.25);else ctx.strokeRect((i-1.5)*s*.27,(j-1.5)*s*.27,s*.25,s*.25)}
 else if(k==='opt'){ctx.beginPath();for(let i=0;i<16;i++){const r=i%2?s*.42:s*.3,a=i*TAU/16+UNOW()*.4;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,s*.12,0,TAU);ctx.stroke()}
 else if(k==='help'){ctx.font=UFI(s*.9);ctx.textAlign='center';ctx.fillText('?',0,s*.32)}ctx.restore()}
function hubChips(){const M=ALLM()[mapI]||MAPS[0];return [nP+' FIGHTERS',(nP-nH)+' CPU'+(nP-nH>0?' LV'+cpuLv:''),STOCKS[stI]+' LIVES',TIMER?TIMER+' MIN':'NO TIMER',M.name.toUpperCase().slice(0,18),COMP?'COMPETITIVE':itemsOn?'ITEMS ON':'ITEMS OFF',TEAMS?'TEAMS':'FREE FOR ALL']}
function drawMenu(){if(typeof testEnd==='function')testEnd();hot=[];const t=UNOW(),L=hubLayout(),S=UIHUB.sel=clamp(UIHUB.sel,0,HUB.length-1),cur=HUB[S];UIC.acc=cur.c;
 uiBG(cur.t.replace('!','')+'  ');const tin=UNOW()-UISUB.t0;
 ctx.save();ctx.textAlign='left';ctx.translate((YTSB||0)+W*.035,H*.085);ctx.rotate(-.04);ctx.font=UFI(H*.055);strokeTxt('SHMUP FIGHTER',0,0,7,'#05060c','#fff');ctx.font=UF(800,H*.018);ctx.fillStyle=cur.c;ctx.fillText('TOUHOU DANMAKU BRAWLER',4,H*.03);ctx.restore();
 L.forEach((r,j)=>{const it=HUB[r.i],sel=r.i===S,A=UIHUB.a[it.k]=lerp(UIHUB.a[it.k]||0,sel?1:0,.22),ent=clamp((tin-j*.05)/.35,0,1),ee=1-Math.pow(1-ent,3);if(ent<=0)return;
  const cx=r.x+r.w/2,cy=r.y+r.h/2,sc=(1+A*.045)*(.85+.15*ee),bob=sel?Math.sin(t*3)*3:0,k=r.h*.18;
  ctx.save();ctx.globalAlpha=ee;ctx.translate(cx+(1-ee)*-60,cy+bob);ctx.rotate(r.rot*(1+A*.4));ctx.scale(sc,sc);
  ctx.shadowColor=sel?it.c:'rgba(0,0,0,.6)';ctx.shadowBlur=sel?30:12;ctx.shadowOffsetY=sel?0:8;ctx.fillStyle='#05060c';skewRect(-r.w/2-4,-r.h/2-4,r.w+8,r.h+8,k);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  const g=ctx.createLinearGradient(-r.w/2,-r.h/2,r.w/2,r.h/2);g.addColorStop(0,it.c);g.addColorStop(1,hexA(it.c,.55+A*.3));ctx.fillStyle=g;skewRect(-r.w/2,-r.h/2,r.w,r.h,k);ctx.fill();
  ctx.save();skewRect(-r.w/2,-r.h/2,r.w,r.h,k);ctx.clip();ctx.globalAlpha=.16;ctx.fillStyle='#000';for(let q=-8;q<12;q++){const xx=-r.w/2+q*r.h*.32+((t*(sel?60:15))%(r.h*.32));ctx.beginPath();ctx.moveTo(xx,-r.h/2);ctx.lineTo(xx+r.h*.14,-r.h/2);ctx.lineTo(xx+r.h*.14-r.h*.4,r.h/2);ctx.lineTo(xx-r.h*.4,r.h/2);ctx.fill()}
   ctx.globalAlpha=1;ctx.fillStyle='rgba(5,6,12,'+(.55-A*.25)+')';skewRect(-r.w/2+r.w*.04,r.h*.12,r.w*.92,r.h*.34,k*.5);if(r.big)ctx.fill();
   if(sel){const sw=((t*.8)%1.6)/1.6,sx=-r.w/2+sw*(r.w*1.6)-r.w*.3,gg=ctx.createLinearGradient(sx-60,0,sx+60,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.35)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillRect(-r.w/2,-r.h/2,r.w,r.h)}ctx.restore();
  ctx.lineWidth=sel?4:2;ctx.strokeStyle=sel?'#fff':hexA('#ffffff',.25);skewRect(-r.w/2,-r.h/2,r.w,r.h,k);ctx.stroke();
  const is=r.big?r.h*.3:r.h*.42;hubIcon(it.k,r.big?r.w*.28:-r.w/2+k+is*.75,r.big?-r.h*.18:0,is,'rgba(5,6,12,.75)');
  ctx.textAlign='left';let fs=r.big?Math.min(r.h*.26,r.w*.2):Math.min(r.h*.34,r.w*.12);ctx.font=UFI(fs);const tx=it.t;while(ctx.measureText(tx).width>r.w*(r.big?.8:.6)&&fs>8){fs*=.9;ctx.font=UFI(fs)}
  const lx=r.big?-r.w/2+r.w*.07:-r.w/2+k+is*1.6,ly=r.big?-r.h*.06:fs*.36;strokeTxt(tx,lx,ly,r.big?12:7,'#05060c','#fff');
  if(r.big){ctx.font=UF(800,Math.max(10,r.h*.045));const ch=hubChips();let xx=-r.w/2+r.w*.07,yy=r.h*.2;for(const c of ch){const w=ctx.measureText(c).width+18;if(xx+w>r.w*.44){xx=-r.w/2+r.w*.07;yy+=r.h*.085}ctx.fillStyle=sel?'#fff':'rgba(255,255,255,.75)';skewRect(xx,yy-r.h*.055,w,r.h*.07,6);ctx.fill();ctx.fillStyle='#05060c';ctx.fillText(c,xx+9,yy);xx+=w+8}
   if(sel){ctx.font=UFI(r.h*.06);ctx.fillStyle='#fff';const ar='>>>'.slice(0,1+((t*4|0)%3));ctx.fillText(ar,r.w*.3,r.h*.42)}}
  ctx.restore();
  const bx={x:r.x,y:r.y,w:r.w,h:r.h};hot.push({...bx,hover:()=>{if(UIHUB.sel!==r.i){UIHUB.sel=r.i;sfx('se_select00',.6)}},click:()=>{UIHUB.sel=r.i;hubGo()}})});
 // barre de description (texte qui glisse)
 if(UIHUB.desc!==cur.d){UIHUB.desc=cur.d;UIHUB.dt0=t}const du=clamp((t-UIHUB.dt0)/.25,0,1),bh=H*.07;ctx.save();ctx.fillStyle='rgba(5,6,12,.85)';ctx.fillRect(0,H-bh,W,bh);ctx.fillStyle=cur.c;ctx.fillRect(0,H-bh,W,3);
 ctx.textAlign='left';ctx.font=UF(800,bh*.32);ctx.globalAlpha=du;ctx.fillStyle='#fff';ctx.fillText(cur.d,(YTSB||0)+W*.035+(1-du)*30,H-bh*.38);ctx.globalAlpha=1;{const hs=TCH&&TCH.on?'tap a card':(window.YTP&&!YTP.Y.gone?'L1/R1 · Q/E: music · Select: pause · ':'')+'arrows / stick: move · Enter / A: open · Start: quick fight · Esc: title',dw=ctx.measureText(cur.d).width;ctx.textAlign='right';ctx.font='12px monospace';ctx.fillStyle='#999';if((YTSB||0)+W*.035+dw+24<W*.97-ctx.measureText(hs).width)ctx.fillText(hs,W*.97,H-bh*.38)}ctx.restore();
 if(AC&&AC.state!=='running'){ctx.save();ctx.textAlign='center';ctx.font='13px monospace';ctx.fillStyle='#f8f';ctx.fillText('Press a key or click to enable sound',W/2,H*.13);ctx.restore()}}
function hubGo(){const it=HUB[UIHUB.sel];sfx('ok00');it.f()}
function hubMove(dx,dy){const L=hubLayout(),c=L.find(r=>r.i===UIHUB.sel),cx=c.x+c.w/2,cy=c.y+c.h/2;let best=null,bd=1e9;for(const r of L){if(r.i===c.i)continue;const x=r.x+r.w/2-cx,y=r.y+r.h/2-cy,along=x*dx+y*dy;if(along<=4)continue;const side=Math.abs(x*dy-y*dx),d=along+side*2.2;if(d<bd){bd=d;best=r}}if(best){UIHUB.sel=best.i;sfx('se_select00',.6)}}
