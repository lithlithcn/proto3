'use strict';
// ================= Spell card au centre =================
let TEST=null,infoScr=0,infoMax=0;
function testItem(k){TEST={k,cd:0,t:0,prev:[nP,nH,cpuLv,stI,itemsOn,maxC]};nP=2;nH=1;cpuLv=1;stI=STOCKS.length-1;start('game');sfx('ok00')} // essai : contre un CPU niv. 1, pouvoir à l'infini
const xActive=p=>Object.values(p.fx).some(v=>v>0)||['blade','rifle','bombs','ult','mirror','giant','clone','spk','star','cam','fh','sutT'].some(k=>p[k]>0)||Object.values(CX).some(v=>v&&typeof v==='object'&&v.o===p.id)||CX.anon>0||
 ENT.some(e=>e.o===p.id&&!['flake','petal','fire','gtrail','fruit','fish','shark','lbeam','fist','shell'].includes(e.k))||FAIRIES.some(f=>f.o===p.id)||HOLES.some(h=>h.o===p.id)||BUMPS.some(b=>b.o===p.id)||ORBS.length||ZONES.some(z=>z.o===p.id)||TSTOP>0||FRZ||WARP>0||GFX.some(g=>g.o===p.id&&g.t>0)||['pray','cocoon','spell'].includes(p.state)||!!p.pick;
function testTick(){if(!TEST||!TEST.k||TEST.train&&!TEST.inf)return;const p=P.find(q=>!q.cpu);if(!p||p.state==='dead')return;if(++TEST.t===40||TEST.t>40&&frame>TEST.cd&&!xActive(p)){give(p,TEST.k);TEST.cd=frame+90}}
function testEnd(){if(TEST){[nP,nH,cpuLv,stI,itemsOn,maxC]=TEST.prev;TEST=null}}
function drawTest(){if(!TEST||mode!=='game'||!TEST.k||TEST.train&&paused)return;const it=ITEMS.find(i=>i.k===TEST.k);let w=Math.min(640,W-500),y=TCH.on?8:54;if(w<380){w=Math.min(W-40,640);y=TCH.on?8:150}const x=(W-w)/2;ctx.font='13px monospace';const L=wrapT(it.d,w-24),h=40+L.length*17;
 ctx.fillStyle='rgba(8,8,16,.82)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=it.c==='rainbow'?rainbowCol():it.c;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);ctx.textAlign='center';
 ctx.fillStyle=ctx.strokeStyle;ctx.font='bold 15px monospace';ctx.fillText('TEST: '+it.name+(it.ch?'  ('+it.ch+')':'')+'  —  infinite',W/2,y+20);ctx.fillStyle='#ddd';ctx.font='13px monospace';L.forEach((l,i)=>ctx.fillText(l,W/2,y+40+i*17));
 ctx.fillStyle='#888';ctx.font='11px monospace';ctx.fillText('Pause (Esc / Start / II) then Menu to quit',W/2,y+h+14)}
function updItem(){ // plusieurs cartes possibles en même temps (option)
 if(TEST)return;
 itemT++;ultT++;
 if(CARDS.length<maxC&&itemT>=IE()*(CARDS.length?.5:1)-T.ITEM_WARN){const ultDue=!itemsOn||(ultT>=T.ULT_EVERY&&itemOn.rainbow&&!CARDS.some(c=>c.type==='rainbow')),type=ultDue?'rainbow':pickItem();
  if(!type){itemT=0;return}if(type==='rainbow')ultT=0;itemT=0;
  const m=T.EDGE+60,al=P.filter(p=>p.state!=='dead'),n=al.length||1,it=ITEMS.find(i=>i.k===type);let x=al.reduce((s,p)=>s+p.x,0)/n,y=al.reduce((s,p)=>s+p.y,0)/n;
  if(CARDS.length){const a=rng()*TAU,r=220+rng()*260;x+=Math.cos(a)*r;y+=Math.sin(a)*r}
  const c={x:clamp(x,m,T.MAP_W-m),y:clamp(y,m,T.MAP_H-m),on:false,age:0,cp:P.map(()=>0),cont:false,type};CARDS.push(c);{const dz=P.find(q=>q.dowseN>0&&q.state!=='dead');if(dz){c.x=dz.x;c.y=dz.y;dz.dowseN--}} // Nazrin
  if(type==='rainbow'){sfx('spellcardsultimespawn');big('LAST WORD CARD!',RB[0],56,'u');flash(.35);focusL=1;chroma=Math.max(chroma,16);bright=Math.max(bright,.6);
   for(let i=0;i<6;i++)WAVES.push({x:c.x,y:c.y,t:20+i*6,T:20+i*6,spd:10+i*4,th:30,inv:0,c:RB[i]})}
  else{sfx('spellcardspawn'+(1+(Math.random()*2|0)));focusL=Math.max(focusL,.4);WAVES.push({x:c.x,y:c.y,t:20,T:20,spd:14,th:30,inv:0,c:it.c})}
  txt(c.x,c.y-56,it.name.toUpperCase(),it.c==='rainbow'?RB[2]:it.c,20)}
 let prog=false;
 for(let k=CARDS.length-1;k>=0;k--){const c=CARDS[k];item=c;if(!c.on){if(++c.age>=T.ITEM_WARN)c.on=true;continue}
  const ins=P.map(p=>p.state!=='dead'&&p.state!=='hitstun'&&Math.hypot(p.x-c.x,p.y-c.y)<T.ITEM_R+T.BODY_R);c.cont=ins.filter(Boolean).length>1;
  for(let i=0;i<P.length;i++){if(ins[i]&&!c.cont){c.cp[i]+=P[i].state==='spell'?.4:1;prog=true}else if(!ins[i])c.cp[i]=Math.max(0,c.cp[i]-2);
   if(c.cp[i]>=capOf(c)){CARDS.splice(k,1);give(P[i],c.type);itemT=0;break}}}
 item=CARDS[0]||null;
 if(prog&&!loadSrc)loadSrc=sfx('loadvrai2',.6);else if(!prog)stopLoad()} // son de chargement tant qu'on remplit une jauge
const nearCard=p=>{let b=null,bd=1e9;for(const c of CARDS){const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<bd){bd=d;b=c}}return b};
const capOf=it=>it.type==='rainbow'?T.LW_CAP:T.ITEM_CAP; // la carte Last Word est plus longue à prendre
const IE=()=>itemsOn?T.ITEM_EVERY:T.ULT_EVERY; // délai avant la prochaine carte
function stopLoad(){if(loadSrc){try{loadSrc.stop()}catch(e){}loadSrc=null}}
function pickItem(){const L=ITEMS.filter(i=>itemOn[i.k]&&!i.rare);return L.length?L[rng()*L.length|0].k:null} // objets normaux ; l'Ultime a son propre minuteur
function give(p,type){if(!item){item={x:p.x,y:p.y,cp:[]};give0(p,type);item=null}else give0(p,type)} // objet donné hors carte (livres, machine à sous)
function give0(p,type){const it=ITEMS.find(i=>i.k===type);p.lastIt=type;
 sfx('se_cardget');sfx('se_changeitem',.7);big(it.name.toUpperCase()+'!',type==='rainbow'?RB[2]:it.c,52);RINGS.push({x:p.x,y:p.y,r:0,m:140,t:30,c:type==='rainbow'?'#fff':it.c});flash(.25,type==='rainbow'?'#fff':it.c);log('item '+type+' P'+(p.id+1));if(GIVE[type]){if(ISFX[type])sfx(ISFX[type],.7);return GIVE[type](p)}
 if(type==='yellow')p.blade=600;else if(type==='white')p.rifle=2;else if(type==='orange')p.bombs=480;else if(type==='rainbow')p.ult=1;
 else if(type==='purple')WARP=600;
 else if(type==='mirror')p.mirror=480;else if(type==='oni')p.giant=600;else if(type==='clone')p.clone=600;else if(type==='elixir')p.star=360;else if(type==='camera')p.cam=3;
 else if(type==='spark'){p.spk=390;p.spkA=p.aim;p.rsrc=sfx('charge',.6);sfx('aimreal',1.7)}
 else if(type==='world'){CX.zaw={o:p.id,t:180};sfx('charge',.6);big('TIME... STOP!','#00d0a0',50)}
 else if(type==='gap')HOLES.push({x:item.x,y:item.y,t:360,o:p.id,a:0});
 else if(type==='freeze'){for(const b of B)if(b.owner!==p.id){b.fz=1;b.c='#bff6ff'}FRZ={t:90,o:p.id};big('PERFECT FREEZE!','#a8f0ff',56);sfx('se_kira00');sfx('get_freezed',.6);FRZQ={o:p.id,n:2,f:frame+130}}
 else if(type==='bumpers')for(let i=0;i<5;i++){let x,y,n=0;do{x=150+rng()*(T.MAP_W-300);y=150+rng()*(T.MAP_H-300)}while(n++<20&&P.some(q=>Math.hypot(q.x-x,q.y-y)<120));BUMPS.push({x,y,r:26,t:420,o:p.id,hit:0,vy:(rng()<.5?-1:1)*.7})}
 else if(type==='green')for(let i=0;i<12;i++){const a=i*TAU/12;ORBS.push({x:item.x,y:item.y,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,t:600})}
 else if(type==='blue')for(let i=0;i<3;i++)FAIRIES.push({o:p.id,x:p.x,y:p.y,hp:6,t:420,tx:p.x,ty:p.y,k:i*20})}
