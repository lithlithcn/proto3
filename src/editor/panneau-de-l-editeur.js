'use strict';
// ---- panneau de l'éditeur
const MKTABS=['GRID','LAYERS','MUSIC','RULES','SCRIPT','FILE'];
function mkStep(d){return d*(MK&&MK.sh?10:1)}
DEFER(()=>{addEventListener('keydown',e=>{if(MK)MK.sh=e.shiftKey},true);});DEFER(()=>{addEventListener('keyup',e=>{if(MK)MK.sh=e.shiftKey},true);});
const MKR=()=>{const m=mUp(MK.m),pk=PERMK(),pn=k=>k?(ITEMS.find(i=>i.k===k)||{name:k}).name:'none',tab=MK.tab||0;
 const R=[{t:()=>'◀ '+MKTABS[tab]+' ▶   ('+(tab+1)+'/'+MKTABS.length+')',lr:d=>{MK.tab=(tab+d+MKTABS.length)%MKTABS.length;MK.row=0}}];
 if(tab===0)R.push(
  {t:()=>'Name: '+m.name,f:()=>txtInput('MAP NAME',m.name,20,n=>{if(n){m.name=n;saveMaps()}})},
  {t:()=>'Width: '+m.cw+' cells ('+m.cw*CS+' px) ◀ ▶',lr:d=>{m.cw=clamp(m.cw+mkStep(d),8,1000);fixM(m);MK.cx=Math.min(MK.cx,m.cw-1);saveMaps()}},
  {t:()=>'Height: '+m.ch+' cells ('+m.ch*CS+' px) ◀ ▶',lr:d=>{m.ch=clamp(m.ch+mkStep(d),6,1000);fixM(m);MK.cy=Math.min(MK.cy,m.ch-1);saveMaps()}},
  {t:()=>'Tool: '+MKT[MK.tool]+' ◀ ▶',lr:d=>{MK.tool=(MK.tool+d+3)%3}},
  {t:()=>'Permanent item: '+pn(m.perm)+' ◀ ▶',lr:d=>{const i=pk.indexOf(m.perm||'');m.perm=pk[(i+d+pk.length)%pk.length];saveMaps()}},
  {t:()=>'Background color: '+m.bg+' ◀ ▶',lr:d=>{const C=['#14161f','#0a0a14','#1a0f22','#0f1a22','#22140f','#0f2214','#202020','#000000'];m.bg=C[(C.indexOf(m.bg)+d+C.length)%C.length];saveMaps()}},
  {t:()=>'Clear walls & teleporters',f:()=>{m.walls=[];m.tps=[];saveMaps()}});
 if(tab===1){R.push({t:()=>'+ Add image / sprite sheet / GIF…',f:()=>addLayer(m)});m.layers.forEach((l,i)=>{const s=i===MK.li;R.push({t:()=>(s?'▼ ':'▸ ')+(i+1)+'. '+l.name+(l.fg?' [front]':'')+(l.hid?' [hidden]':''),f:()=>{MK.li=s?-1:i}});
  if(s)R.push({t:()=>'   Parallax: '+l.par.toFixed(2)+(l.par===0?' (fixed on screen)':l.par===1?' (moves with map)':'')+' ◀ ▶',lr:d=>{l.par=clamp(Math.round((l.par+d*.05)*100)/100,0,2);saveMaps()}},
   {t:()=>'   Auto-scroll X: '+l.sx+' px/s ◀ ▶',lr:d=>{l.sx=clamp(l.sx+mkStep(d)*5,-2000,2000);saveMaps()}},{t:()=>'   Auto-scroll Y: '+l.sy+' px/s ◀ ▶',lr:d=>{l.sy=clamp(l.sy+mkStep(d)*5,-2000,2000);saveMaps()}},
   {t:()=>'   Offset X: '+l.ox+' ◀ ▶',lr:d=>{l.ox+=mkStep(d)*10;saveMaps()}},{t:()=>'   Offset Y: '+l.oy+' ◀ ▶',lr:d=>{l.oy+=mkStep(d)*10;saveMaps()}},
   {t:()=>'   Scale: '+l.sc.toFixed(2)+' ◀ ▶',lr:d=>{l.sc=clamp(Math.round((l.sc+d*(MK.sh?.5:.05))*100)/100,.05,20);saveMaps()}},{t:()=>'   Opacity: '+Math.round(l.al*100)+'% ◀ ▶',lr:d=>{l.al=clamp(Math.round((l.al+d*.05)*100)/100,0,1);saveMaps()}},
   {t:()=>'   Repeat (tile): '+(l.tile?'ON':'OFF')+' ◀ ▶',lr:()=>{l.tile=l.tile?0:1;saveMaps()}},{t:()=>'   Position: '+(l.fg?'IN FRONT of players':'behind')+' ◀ ▶',lr:()=>{l.fg=l.fg?0:1;saveMaps()}},{t:()=>'   Blend: '+(l.add?'ADDITIVE (glow)':'normal')+' ◀ ▶',lr:()=>{l.add=l.add?0:1;saveMaps()}},
   {t:()=>'   Sheet columns: '+l.cols+' ◀ ▶',lr:d=>{l.cols=clamp(l.cols+d,1,256);l.n=Math.min(l.n,l.cols*l.rows);if(l.n<=1)l.n=l.cols*l.rows;saveMaps()}},{t:()=>'   Sheet rows: '+l.rows+' ◀ ▶',lr:d=>{l.rows=clamp(l.rows+d,1,256);l.n=l.cols*l.rows;saveMaps()}},
   {t:()=>'   Frames: '+l.n+' ◀ ▶',lr:d=>{l.n=clamp(l.n+d,1,l.cols*l.rows);saveMaps()}},{t:()=>'   Animation length: '+l.dur+' ms ('+(l.n>1?(l.n*1000/l.dur).toFixed(1)+' fps':'static')+') ◀ ▶',lr:d=>{l.dur=clamp(l.dur+mkStep(d)*50,16,600000);saveMaps()}},
   {t:()=>'   Visible at start: '+(l.hid?'NO':'YES')+' ◀ ▶',lr:()=>{l.hid=l.hid?0:1;saveMaps()}},{t:()=>'   Rename…',f:()=>txtInput('LAYER NAME',l.name,20,n=>{if(n){l.name=n;saveMaps()}})},
   {t:()=>'   Move up / down ◀ ▶',lr:d=>{const j=i+d;if(j<0||j>=m.layers.length)return;m.layers.splice(i,1);m.layers.splice(j,0,l);MK.li=j;saveMaps()}},{t:()=>'   Delete layer',f:()=>{m.layers.splice(i,1);MK.li=-1;saveMaps()}})})}
 if(tab===2)R.push({t:()=>'Music: '+(m.mus?(m.musN||'custom track'):'none (normal combat music)'),f:()=>pickFile('audio/*',(d,f)=>{m.mus=astSet(newId(),d);m.musN=f.name.slice(0,30);saveMaps();sfx('ok00')})},{t:()=>m.mus?'Remove music':'(Enter on the line above: choose an audio file)',f:()=>{m.mus='';saveMaps()}});
 if(tab===3){R.push({t:()=>'+ Add a rule',f:()=>{m.ev.push({w:'every',n:10,a:'ring',p:16});MK.ei=m.ev.length-1;saveMaps()}});m.ev.forEach((e,i)=>{const s=i===MK.ei,pp=()=>e.a==='item'?pn(e.p):e.a==='layer'?'#'+((e.p|0)+1)+' '+((m.layers[e.p|0]||{}).name||'?'):e.a==='wind'?e.p+'°':e.p;
  R.push({t:()=>(s?'▼ ':'▸ ')+(e.off?'(off) ':'')+EVWN[e.w].replace('N',e.n)+' → '+EVAN[e.a]+' '+pp(),f:()=>{MK.ei=s?-1:i}});
  if(s)R.push({t:()=>'   When: '+EVWN[e.w]+' ◀ ▶',lr:d=>{e.w=EVW[(EVW.indexOf(e.w)+d+EVW.length)%EVW.length];saveMaps()}},{t:()=>'   N = '+e.n+' s ◀ ▶',lr:d=>{e.n=clamp(e.n+mkStep(d),1,3600);saveMaps()}},
   {t:()=>'   Do: '+EVAN[e.a]+' ◀ ▶',lr:d=>{e.a=EVA[(EVA.indexOf(e.a)+d+EVA.length)%EVA.length];e.p=EVP0[e.a];saveMaps()}},
   {t:()=>'   Value: '+pp()+(e.a==='text'?'  (Enter: type)':' ◀ ▶'),f:()=>{if(e.a==='text')txtInput('TEXT TO SHOW',e.p,40,v=>{if(v){e.p=v;saveMaps()}})},lr:d=>{if(e.a==='item'){const j=pk.indexOf(e.p||'');e.p=pk[(j+d+pk.length)%pk.length]}else if(e.a==='sound'){const K=Object.keys(SFX).sort();e.p=K[(K.indexOf(e.p)+d+K.length)%K.length];sfx(e.p,.7)}else if(e.a==='wind')e.p=((+e.p||0)+d*45+360)%360;else if(e.a==='layer')e.p=clamp((e.p|0)+d,0,Math.max(0,m.layers.length-1));else if(e.a!=='text')e.p=clamp((+e.p||0)+mkStep(d),1,200);saveMaps()}},
   {t:()=>'   Enabled: '+(e.off?'NO':'YES')+' ◀ ▶',lr:()=>{e.off=e.off?0:1;saveMaps()}},{t:()=>'   Delete rule',f:()=>{m.ev.splice(i,1);MK.ei=-1;saveMaps()}})})}
 if(tab===4)R.push({t:()=>'Edit the JavaScript code…  ('+(m.js?m.js.split('\n').length+' lines':'empty')+')',f:()=>codeEdit(m)},{t:()=>m.js?'Delete the code':'(runs every frame · see the help in the editor)',f:()=>{if(m.js){m.js='';saveMaps()}}});
 if(tab===5)R.push({t:()=>'Export this map to a file (.sfmap.json)',f:()=>mapExport(m)},{t:()=>'Import a map from a file…',f:mapImport},{t:()=>'Duplicate this map',f:()=>{const c=mapUnpack(mapPack(m),true);c.name=(m.name+' copy').slice(0,20);CMAPS.push(c);saveMaps();big('DUPLICATED','#5cff8a',30)}});
 R.push({t:()=>'▶ Play this map',f:()=>{saveMaps();mapI=MAPS.length+CMAPS.indexOf(m);saveOpts();start('game')}},{t:()=>'Done',f:()=>{saveMaps();mode='sub';MK=null}});return R};
