'use strict';
// ---- profils : nom + touches + animation du nom
let PROF=[],SLOTP=[-1,-1,-1,-1],profE=0,TIMER=0,ENDK=1;DEFER(()=>{try{PROF=JSON.parse(localStorage.getItem('sf_prof')||'[]')||[];SLOTP=JSON.parse(localStorage.getItem('sf_slotp')||'[-1,-1,-1,-1]');TIMER=+(localStorage.getItem('sf_timer')||0)||0}catch(e){}});
const saveProf=()=>{try{localStorage.setItem('sf_prof',JSON.stringify(PROF));localStorage.setItem('sf_slotp',JSON.stringify(SLOTP))}catch(e){}},profOf=i=>PROF[SLOTP[i]]||null;
const NCOL=[0,'#ffffff','#ff5a5a','#ffa63a','#ffe83a','#7cff6a','#3affd0','#5ab0ff','#a07cff','#ff7ce0','rainbow'],NCN=['player color','white','red','orange','yellow','green','cyan','blue','purple','pink','rainbow'],NANIM=['still','bob','tilt','bob + tilt','wave','pulse','swing'];
const SV=()=>VOLS.sfx*VOLS.master*ENDK,saveVol=()=>{try{localStorage.setItem('sf_vol',JSON.stringify(VOLS))}catch(e){}};
let DEFB;DEFER(()=>{{const cp=o=>JSON.parse(JSON.stringify(o));DEFB={KB:cp(KB),PAD:cp(PAD)}}}); // touches par défaut (slots sans profil)
function applyBinds(){const cp=o=>JSON.parse(JSON.stringify(o));KB=cp(DEFB.KB);PAD=cp(DEFB.PAD);for(let i=0;i<4;i++){const f=profOf(i);if(!f)continue;if(f.kb&&KB[i])Object.assign(KB[i],f.kb);if(f.pad&&PAD[i])Object.assign(PAD[i],f.pad)}}
DEFER(()=>{saveBinds=()=>{const cp=o=>JSON.parse(JSON.stringify(o));for(let i=0;i<4;i++){const f=profOf(i);if(f){if(KB[i])f.kb=cp(KB[i]);f.pad=cp(PAD[i])}else{if(KB[i])DEFB.KB[i]=cp(KB[i]);DEFB.PAD[i]=cp(PAD[i])}}try{localStorage.setItem('sf_binds3',JSON.stringify(DEFB))}catch(e){}saveProf()};});
DEFER(()=>{applyBinds();});
const askName=d=>{const n=((typeof prompt==='function'?prompt('Name (12 characters max)',d):d)||'').trim().slice(0,12);return n||null};
const SOUNDM=()=>[['Master volume','master'],['Sound effects','sfx'],['Music','music']].map(([n,k])=>({t:()=>n+': '+Math.round(VOLS[k]*100)+'%  ◀ ▶',lr:d=>{VOLS[k]=clamp(Math.round(VOLS[k]*10+d)/10,0,1);saveVol()}})).concat(MSCRS.map(([k,n])=>({t:()=>'Music · '+n+': '+MUS.filter(t=>t.scr===k).length+' track(s)…',f:()=>openSub('MUSIC · '+n.toUpperCase(),()=>musRows(k))})));
const PROFM=()=>{const r=[];for(let i=0;i<4;i++)r.push({t:()=>'P'+(i+1)+': '+(profOf(i)?profOf(i).n:'(no profile)')+'  ◀ ▶',lr:d=>{let v=SLOTP[i]+d;if(v<-1)v=PROF.length-1;if(v>=PROF.length)v=-1;SLOTP[i]=v;saveProf();applyBinds()}});
 r.push({t:()=>'+ New profile',f:()=>txtInput('NEW PROFILE NAME','P'+(PROF.length+1),12,n=>{if(n){PROF.push({n,c:0,a:1});profE=PROF.length-1;saveProf()}})});
 if(PROF.length){const g=()=>PROF[profE=clamp(profE,0,PROF.length-1)];
  r.push({t:()=>'Edit: '+g().n+'  ◀ ▶',lr:d=>{profE=(profE+d+PROF.length)%PROF.length},prev:1},{t:()=>'   Rename…',f:()=>{const q=g();txtInput('RENAME PROFILE',q.n,12,n=>{if(n){q.n=n;saveProf()}})},prev:1},
   {t:()=>'   Name color: '+NCN[g().c]+'  ◀ ▶',lr:d=>{g().c=(g().c+d+NCOL.length)%NCOL.length;saveProf()},prev:1},{t:()=>'   Animation: '+NANIM[g().a]+'  ◀ ▶',lr:d=>{g().a=(g().a+d+NANIM.length)%NANIM.length;saveProf()},prev:1},
   {t:()=>'   Controls (saved in the profile of P1/P2…)',f:()=>{mode='binds';bind.wait=false}},{t:()=>'   Delete this profile',f:()=>{PROF.splice(profE,1);SLOTP=SLOTP.map(v=>v===profE?-1:v>profE?v-1:v);profE=0;saveProf();applyBinds()}})}
 return r};
let SUB=null,subSel=0,subT='',SUBS=[];function openSub(t,f){if(mode==='sub')SUBS.push([SUB,subT,subSel]);else SUBS=[];SUB=f;subT=t;subSel=0;mode='sub'}
DEFER(()=>{{const N0=nav;nav=ev=>{if(mode!=='sub')return N0(ev);const L=SUB();subSel=clamp(subSel,0,L.length-1);
 if(ev==='up'||ev==='down'){subSel=(subSel+(ev==='up'?L.length-1:1))%L.length;sfx('se_select00',.6)}
 if((ev==='left'||ev==='right')&&L[subSel].lr){L[subSel].lr(ev==='left'?-1:1);sfx('changemenu',.8)}
 if(ev==='ok'){sfx('ok00');const it=L[subSel];it.f?it.f():it.lr&&it.lr(1)}if(ev==='reset'&&L[subSel].del){L[subSel].del();sfx('cancel00')}if(ev==='back'){const q=SUBS.pop();if(q){[SUB,subT,subSel]=q}else mode='menu';sfx('cancel00')}}}});
function drawSub(){hot=[];const L=SUB();subSel=clamp(subSel,0,L.length-1);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 34px monospace';ctx.fillText(subT,W/2,H*.12);
 const y0=H*.22,sp=Math.min(40,H*.6/L.length);
 L.forEach((it,i)=>{const y=y0+i*sp,s=i===subSel;ctx.font=(s?'bold ':'')+'19px monospace';ctx.fillStyle=s?'#ffd23a':'#aaa';const tx=(s?'▶ ':'')+it.t();ctx.fillText(tx,W/2,y);const am=arrowMid(tx);
  hot.push({x:W/2-300,y:y-sp*.72,w:600,h:sp,hover:()=>{if(subSel!==i){subSel=i;sfx('se_select00',.6)}},click:x=>{if(x!==undefined&&it.lr){it.lr(x<am?-1:1);sfx('changemenu',.8)}else nav('ok')}})});
 if(TCH.on&&L[subSel].lr){const y=y0+subSel*sp-6;ctx.font='bold 34px monospace';ctx.fillStyle='#ffd23a';ctx.fillText('◀',W/2-320,y+10);ctx.fillText('▶',W/2+320,y+10);
  hot.push({x:0,y:y-40,w:W/2-270,h:80,hover:()=>{},click:()=>nav('left')},{x:W/2+270,y:y-40,w:W/2-270,h:80,hover:()=>{},click:()=>nav('right')})}
 if(SUB===PROFM&&PROF.length){const g=PROF[profE];ctx.save();ctx.translate(W/2,H-90);ctx.scale(2,2);drawName(g.n,0,0,ncol(g.c,'#ffd23a'),g.a,performance.now()/1000);ctx.restore()} // aperçu du nom animé
 backBtn();ctx.textAlign='center';ctx.font='12px monospace';ctx.fillStyle='#888';ctx.fillText('Up/Down: select · Left/Right: change · Enter: confirm · Esc: back',W/2,H-30)}
const ncol=(c,d)=>NCOL[c]==='rainbow'?rainbowCol():NCOL[c]||d;
function drawName(s,x,y,c,a,t,sx=1){ctx.save();ctx.translate(x,y);
 if(a===1||a===3)ctx.translate(0,Math.sin(t*3)*3);if(a===2||a===3)ctx.rotate(Math.sin(t*2.2)*.15);if(a===5){const z=1+.1*Math.sin(t*4);ctx.scale(z,z)}if(a===6){ctx.translate(Math.sin(t*2)*5,0);ctx.rotate(Math.sin(t*2)*.1)}
 ctx.scale(sx,1);ctx.font='bold 17px monospace';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.85)';ctx.fillStyle=c;
 if(a===4){let px=-ctx.measureText(s).width/2;ctx.textAlign='left';for(let i=0;i<s.length;i++){const yy=Math.sin(t*5-i*.6)*3;ctx.strokeText(s[i],px,yy);ctx.fillText(s[i],px,yy);px+=ctx.measureText(s[i]).width}}
 else{ctx.textAlign='center';ctx.strokeText(s,0,0);ctx.fillText(s,0,0)}ctx.restore()}
