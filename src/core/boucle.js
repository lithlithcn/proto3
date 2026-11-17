'use strict';
// ================= Boucle =================
function step(){
 if(slow>0){slow--;if(slow%3)return} // ralenti du KO
 frame++;
 for(const p of P){tgt(p);p.in=p.cpu?(item=nearCard(p),TEST&&TEST.still?{x:0,y:0,b:TEST.still===2?{shot:true}:{}}:cpuInput(p,p.tgt)):readHuman(p.id)}item=CARDS[0]||null; // chaque CPU vise la carte la plus proche
 if(CX.swap){const a=P[CX.swap.a],b=P[CX.swap.b];if(a&&b){const t=a.in;a.in=b.in;b.in=t}} // Shanghai : échange de corps
 if(hitstop>0){ // gel d'impact : micro-esquive (SDI) possible
  hitstop=Math.max(0,hitstop-1-(10-NERV)*.15);for(const p of P)if(p.diPend){p.x=clamp(p.x+p.in.x*T.SDI,T.BODY_R,T.MAP_W-T.BODY_R);p.y=clamp(p.y+p.in.y*T.SDI,T.BODY_R,T.MAP_H-T.BODY_R)}
  if(hitstop<=0)for(const p of P)resolveHit(p);
  stepFx();return}
 const fz=p=>TSTOP>0&&p.id!==TSO||lunFz(p.id); // temps arrêté pour les autres
 for(const p of P)if(!fz(p))updP(p,p.tgt,p.in);
 for(const p of P)if(!fz(p))physics(p);
 if(TSTOP<=0)updBullets();updItem();updWorld();testTick();stepFx()}
const STEP=1000/60;let acc,last,fps,fA,fN,padPrev;DEFER(()=>{acc=0;last=performance.now();fps=60;fA=0;fN=0;padPrev=false});
function loop(now){
 let dt=Math.min(250,now-last);last=now;acc+=dt;fA+=dt;fN++;if(fA>500){fps=Math.round(fN*1000/fA);fA=fN=0;if(mode==='game'&&fps<45){if(++lowT>4&&!perfLow){perfLow=true;log('low fps: heavy effects disabled')}}else{lowT=0;if(perfLow&&fps>=58&&++hiT>20){perfLow=false;hiT=0;log('fps ok: effects back')}}}
 pollNav();
 if(mode==='binds'&&bind.wait&&bind.col>=2){const ps=pads(),gp=ps[bind.col-2]||ps[0]; // assignation manette (2 boutons pour burst/spell)
  if(gp){const now=gp.buttons.map(x=>x.pressed),a=ACTS[bind.row],cb=a==='spell';
   if(bind.pv)for(let n=0;n<now.length&&bind.wait;n++)if(now[n]&&!bind.pv[n]){
    if(cb&&!bind.combo.includes(n))bind.combo.push(n);
    if(!cb||bind.combo.length===2){PAD[bind.col-2][a]=cb?bind.combo.slice():n;bind.wait=false;saveBinds();sfx('ok00')}}
   bind.pv=now}}
 let n=0;while(acc>=STEP&&n<5){try{if(MODEX[mode]){if(!paused&&MODEX[mode].step)MODEX[mode].step()}else if(mode==='game'&&(!paused||NET)){if(winner<0){if(NET)netTick();else{step();if(CX.mer&&winner<0)step()}}else{if(NET)netTick();stepFx();winT++}}}catch(e){errRep('step',e)}acc-=STEP;n++;tapQ.clear()}
 if(acc>STEP)acc=STEP;
 try{render()}catch(e){errRep('render',e);try{ctx=CTX0;ctx.restore();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}catch(x){}}errDraw();requestAnimationFrame(loop)}
const ERRS=[];let errV=0;function errRep(w,e){const st=((e&&e.stack)||'').split('\n').slice(1,5).map(l=>l.trim().replace(/^at /,'').replace(/\(?(file|https?):[^)]*\/([^/:]+):(\d+):(\d+)\)?/,'@$3:$4')).join(' < '),m=w+' · '+((e&&e.message)||e)+' · '+st;const o=ERRS.find(x=>x.m===m);if(o){o.n++;return}
 ERRS.push({m,n:1,f:frame,mode,t:new Date().toISOString().slice(11,19),ctx:mode==='game'?{nP,map:mapI,items:itemsOn,cx:Object.keys(CX).join(','),it:item&&item.k,B:B.length,ent:ENT.map(e=>e.k).slice(0,8).join(','),st:P.map(p=>p.state+':'+(p.hp|0)).join(' ')}:null});if(ERRS.length>12)ERRS.shift();errV=600;try{console.error('[SF BUG]',m,e)}catch(x){}try{localStorage.setItem('sf_err',JSON.stringify(ERRS))}catch(x){}if(ERRDL&&performance.now()-(errDT||-1e9)>10000){errDT=performance.now();try{const b=new Blob([JSON.stringify({ver:typeof NETV!=='undefined'?NETV:'',ua:navigator.userAgent,net:NET?{n:NET.n,f:NET.f,rtt:NET.rtt|0,desync:NET.desync}:null,errs:ERRS},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='shmup-fighter-error-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(a);a.click();a.remove()}catch(x){}}}
let ERRDL=0,errDT=0;DEFER(()=>{try{ERRDL=+localStorage.getItem('sf_errdl')||0}catch(e){}});
function errDraw(){if(!ERRS.length||errV<=0)return;errV--;const c=OC||CTX0;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=Math.min(1,errV/60);c.globalCompositeOperation='source-over';c.font='11px monospace';c.textAlign='left';const L=ERRS.slice(-3);c.fillStyle='rgba(60,0,0,.85)';c.fillRect(0,0,W,14+L.length*14);c.fillStyle='#ff8a8a';c.fillText('BUG caught (game keeps running) · F9 = copy report · '+ERRS.length+' kind(s)',6,11);L.forEach((x,i)=>c.fillText(('x'+x.n+' ').padEnd(5)+x.m.slice(0,170),6,25+i*14));c.restore()}
DEFER(()=>{addEventListener('error',e=>errRep('global',e.error||e.message));});DEFER(()=>{addEventListener('unhandledrejection',e=>errRep('promise',e.reason));});
let F9T=0;function bugReport(){const N=typeof NET!=='undefined'&&NET?{rtt:NET.rtt|0,D:NET.D,f:NET.f,conf:NET.conf,rbN:NET.rbN,rbMax:NET.rbMax,desync:NET.desync,miss:NET.miss||0,stall:NET.stall}:null;return JSON.stringify({ver:typeof NETV!=='undefined'?NETV:'',ua:navigator.userAgent,gl:!!GLR,fps,mode,frame,map:mapI,nP,net:N,errs:ERRS},null,1)}
function copyTxt(t){const fb=()=>{try{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();return ok}catch(x){return false}};try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>{F9T=-Math.abs(F9T)},()=>{fb()});return true}}catch(x){}return fb()}
DEFER(()=>{addEventListener('keydown',e=>{if(e.code==='F9'||e.key==='F9'){e.preventDefault();copyTxt(bugReport());F9T=300}},true);});
DEFER(()=>{{const R0=render;render=()=>{R0();drawTXI();if(F9T!==0){const c=OC||CTX0,n=Math.abs(F9T);F9T=F9T>0?F9T-1:F9T+1;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=Math.min(1,n/40);c.fillStyle='rgba(0,0,0,.85)';c.fillRect(W/2-300,H/2-60,600,120);c.strokeStyle='#ffd23a';c.lineWidth=2;c.strokeRect(W/2-300,H/2-60,600,120);c.textAlign='center';c.fillStyle='#ffd23a';c.font='bold 20px monospace';c.fillText('BUG REPORT COPIED (F9)',W/2,H/2-22);c.font='13px monospace';c.fillStyle='#ddd';c.fillText(ERRS.length?ERRS.length+' bug(s) recorded - paste it to Claude (Ctrl+V)':'No bug recorded - report still copied (Ctrl+V)',W/2,H/2+6);if(NET)c.fillText('online: ping '+(NET.rtt|0)+'ms  rollbacks '+NET.rbN+'  desync '+(NET.desync>=0?'@'+NET.desync:'none'),W/2,H/2+30);c.restore()}}}});
