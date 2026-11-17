'use strict';
// ---- mode entraînement
function trainStart(){TEST={k:null,cd:0,t:0,train:1,inf:1,still:0,tab:0,i:0,prev:[nP,nH,cpuLv,stI,itemsOn,maxC]};nP=2;nH=1;stI=STOCKS.length-1;start('game');paused=true;sfx('ok00')}
function drawTrain(){if(!(TEST&&TEST.train&&paused&&mode==='game'))return;const w=Math.min(W-20,900),x0=(W-w)/2,y0=Math.max(10,H*.08),tw=w/GAMES.length,T2=TEST;
 ctx.fillStyle='rgba(6,6,14,.93)';ctx.fillRect(x0,y0,w,H*.84);ctx.strokeStyle='#6ff';ctx.lineWidth=2;ctx.strokeRect(x0,y0,w,H*.84);ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='#6ff';ctx.font='bold 20px monospace';ctx.fillText('TRAINING',W/2,y0+20);
 GAMES.forEach((g,i)=>{const x=x0+i*tw;ctx.fillStyle=i===T2.tab?'#2a6a7a':'#1a1a24';ctx.fillRect(x+1,y0+40,tw-2,28);ctx.fillStyle='#fff';ctx.font='bold '+Math.min(13,tw/5|0)+'px monospace';ctx.fillText(g[0],x+tw/2,y0+54);
  hot.push({x,y:y0+40,w:tw,h:28,hover:()=>{},click:()=>{T2.tab=i;T2.i=0;sfx('se_select00',.5)}})});
 const L=GAMES[T2.tab][1].filter(k=>ITEMS.some(i=>i.k===k)),cols=4,cw=w/cols,ch=Math.min(46,(H*.84-210)/Math.ceil(L.length/cols));
 L.forEach((k,i)=>{const I=ITEMS.find(z=>z.k===k),x=x0+(i%cols)*cw,y=y0+76+(i/cols|0)*ch,on=T2.k===k,sel=T2.i===i;ctx.fillStyle=on?'rgba(102,255,255,.25)':sel?'rgba(255,255,255,.12)':'rgba(255,255,255,.04)';ctx.fillRect(x+3,y,cw-6,ch-4);
  ctx.fillStyle=I.c==='rainbow'?rainbowCol():I.c;ctx.font='bold 13px monospace';ctx.fillText(I.name,x+cw/2,y+ch*.38,cw-10);ctx.fillStyle='#999';ctx.font='11px monospace';ctx.fillText(I.ch||'',x+cw/2,y+ch*.75,cw-10);
  hot.push({x:x+3,y,w:cw-6,h:ch-4,hover:()=>{T2.i=i},click:()=>{T2.k=k;T2.cd=0;const p=P.find(q=>!q.cpu);if(p&&p.state!=='dead')give(p,k);sfx('ok00')}})});
 const by=y0+H*.84-118,bw=w/6;[['CPU LV −',()=>{cpuLv=Math.max(1,cpuLv-1)}],['CPU LV '+cpuLv,()=>{}],['CPU LV +',()=>{cpuLv=Math.min(9,cpuLv+1)}],['CPU: '+['ACTIVE','STILL','SHOOT ONLY'][T2.still],()=>{T2.still=(T2.still+1)%3}],
  ['INFINITE: '+(T2.inf?'ON':'OFF'),()=>{T2.inf^=1}],['HEAL ALL',()=>{for(const q of P){q.hp=T.HP;q.spirit=T.SPIRIT_MAX;q.burst=T.BURST_MAX}}]].forEach(([s,f],i)=>{const x=x0+i*bw;
  ctx.fillStyle='#1e2a34';ctx.fillRect(x+4,by,bw-8,40);ctx.fillStyle='#fff';ctx.font='bold 13px monospace';ctx.fillText(s,x+bw/2,by+20,bw-12);hot.push({x:x+4,y:by,w:bw-8,h:40,hover:()=>{},click:()=>{f();sfx('se_select00',.5)}})});
 [['▶ RESUME',()=>{paused=false;sfx('ok00')}],['CLEAR POWER',()=>{T2.k=null;const p=P.find(q=>!q.cpu);if(p)p.fx={}}],['MENU',()=>{paused=false;mode='menu';sfx('cancel00')}]].forEach(([s,f],i)=>{const x=x0+i*w/3;
  ctx.fillStyle=i?'#2a1e24':'#1e3424';ctx.fillRect(x+4,by+50,w/3-8,44);ctx.fillStyle='#fff';ctx.font='bold 15px monospace';ctx.fillText(s,x+w/6,by+72);hot.push({x:x+4,y:by+50,w:w/3-8,h:44,hover:()=>{},click:f})});
 const I=T2.k&&ITEMS.find(z=>z.k===T2.k);ctx.fillStyle='#ccc';ctx.font='12px monospace';ctx.fillText(I?'Selected: '+I.name+' — '+wrapT(I.d,w-40)[0]+'…':'Click a power to equip it (it comes back forever if INFINITE is ON).',W/2,by-14,w-20);
 ctx.fillStyle='#888';ctx.font='11px monospace';ctx.fillText('Arrows: tabs / powers · Enter: equip · Esc / Start: resume',W/2,y0+H*.84-8);ctx.textBaseline='alphabetic'}

DEFER(()=>{GAMES.push(['WBaWC',['eika','urumi','kutaka','yachie','mayumi','keiki','saki','yuuma']],['UM',['mike','takane','sannyo','misumaru','tsukasa','megumu','chimata','momoyo']],['UDoALG',['biten','enoko','chiyari','hisami','zanmu']],['FW',['ubame','chimi','nareko','yuiman','toyohime','ariya','nina']]);});
