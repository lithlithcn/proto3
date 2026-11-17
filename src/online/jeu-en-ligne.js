'use strict';
// ===== JEU EN LIGNE : rollback netcode 2 à 32 joueurs (entrées seulement, prédiction + retour arrière, relais par l'hôte) =====
let NET=null,RESIM=false;
const NMAXP=10,NSUMEV=60;
function netNew(L,send,D,n){n=n||2;const N={L,n,f:0,D:D||2,inp:[],pred:[],conf:[],rf:[],rc:[],drop:[],S:new Map(),rb:Infinity,send,rtt:100,lat:0,sums:new Map(),rsum:new Map(),prov:new Map(),desync:-1,stall:0,rbN:0,rbMax:0,pingT:0,skip:0,lastMsg:0,ended:false,miss:0,left:[]};
 for(let i=0;i<n;i++){N.inp.push(new Map());N.pred.push(new Map());N.conf.push(-1);N.rf.push(0);N.rc.push(null);N.drop.push(Infinity)}
 for(let f=0;f<N.D;f++)N.inp[L].set(f,netNeutral());N.conf[L]=N.D-1;return N}
function netDesyncRep(k,a,b){try{errRep('desync',new Error('online desync at frame '+k+' DIFF['+diffD(a,b)+'] (players '+NET.n+' ping '+(NET.rtt|0)+' delay '+NET.D+' rollbacks '+NET.rbN+' max '+NET.rbMax+' miss '+NET.miss+' stall '+NET.stall+')'))}catch(e){}}
function netNeutral(){return[0,0,0,0]}
function netCap(){const N=NET,sv=P.map(q=>q.cpu);P.forEach((q,i)=>{if(i!==N.L)q.cpu=true});const p=P[N.L],m=p&&p.maim;const I=readHumanBase(N.L);const e=encI(I,p);if(p)p.maim=m;P.forEach((q,i)=>q.cpu=sv[i]);return e}
function netGet(k,i){const N=NET;if(k>=N.drop[i])return netNeutral();const m=N.inp[i];if(m.has(k))return m.get(k);if(i===N.L)return netNeutral();let e=netNeutral(),c=N.conf[i];if(c>=0&&m.has(c))e=m.get(c);N.pred[i].set(k,e);return e}
function netSame(a,b){return a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&((a[3]||0)===(b[3]||0)||(a[3]&&b[3]&&a[3][0]===b[3][0]&&a[3][1]===b[3][1]))}
const netRem=N=>{const r=[];for(let i=0;i<N.n;i++)if(i!==N.L&&N.drop[i]===Infinity)r.push(i);return r};
function netConfAll(N){let c=Infinity;for(let i=0;i<N.n;i++)if(N.drop[i]===Infinity)c=Math.min(c,N.conf[i]);return c}
function netSim(k){const N=NET;N.S.set(k,gameSave());N.cur=k;step();if(CX.mer&&winner<0)step();
 if(k%NSUMEV===0&&!N.sums.has(k)){N.prov.set(k,gameSum());(N.provD||(N.provD=new Map())).set(k,gameSumD())}
 const old=k-NMAXP-6;if(N.S.has(old)&&old<netConfAll(N))N.S.delete(old)}
function netDrop(k,F){const N=NET;if(!N||N.drop[k]!==Infinity)return;N.drop[k]=F;N.left.push(k);if(F<N.f)N.rb=Math.min(N.rb,F);for(const[f]of N.pred[k])if(f>=F)N.pred[k].delete(f);big('P'+(k+1)+' LEFT THE MATCH',COLS[k],36)}
function netRecv(m){const N=NET;if(!N)return;if(m.g!==undefined&&N.g!==undefined&&m.g!==N.g)return;N.lastMsg=performance.now();
 if(m.t==='i'){const p=m.p;if(p===undefined||p===N.L||p>=N.n)return;(N.lm||(N.lm=[]))[p]=performance.now();for(const[f,e]of m.i){if(f>=N.drop[p]||N.inp[p].has(f))continue;N.inp[p].set(f,e);const q=N.pred[p].get(f);if(q!==undefined){N.pred[p].delete(f);if(!netSame(q,e)&&f<N.f)N.rb=Math.min(N.rb,f)}}
  let c=N.conf[p];while(N.inp[p].has(c+1))c++;N.conf[p]=c;N.rf[p]=m.cf;N.rc[p]=m.c}
 else if(m.t==='c'){let a=N.rsum.get(m.f);if(!a)N.rsum.set(m.f,a=[]);a.push(m.h);(N.rsumD||(N.rsumD=new Map())).set(m.f,m.d);if(N.rsumD.size>40)N.rsumD.delete(N.rsumD.keys().next().value);const h=N.sums.get(m.f);if(h!==undefined&&h!==m.h&&N.desync<0){N.desync=m.f;netDesyncRep(m.f,N.sumsD&&N.sumsD.get(m.f),m.d)}}
 else if(m.t==='drop')netDrop(m.k,m.f);
 else if(m.t==='bye'){N.ended=true}}
function netTick(){const N=NET;if(!N||N.ended)return;
 if(N.rb<N.f){const k=N.rb;N.rb=Infinity;const S=N.S.get(k);if(!S)N.miss++;if(S){const cs=cams.map(c=>[c.x,c.y]),sk=[shake,kx,ky,flashS,chroma,zblur,bright,focusL];gameLoad(S);RESIM=true;const n=N.f-k;for(let j=k;j<N.f;j++)netSim(j);RESIM=false;cams.forEach((c,i)=>{if(cs[i]){c.x=cs[i][0];c.y=cs[i][1]}});[shake,kx,ky,flashS,chroma,zblur,bright,focusL]=sk.map((v,i)=>Math.max(v,[shake,kx,ky,flashS,chroma,zblur,bright,focusL][i]));N.rbN++;N.rbMax=Math.max(N.rbMax,n)}}
 const ca=netConfAll(N);for(const[k,h]of N.prov)if(k<=ca&&k<N.f){N.prov.delete(k);N.sums.set(k,h);const d=N.provD&&N.provD.get(k);if(N.provD)N.provD.delete(k);(N.sumsD||(N.sumsD=new Map())).set(k,d);if(N.sumsD.size>40)N.sumsD.delete(N.sumsD.keys().next().value);N.send({t:'c',g:N.g,p:N.L,f:k,h,d});const r=N.rsum.get(k);if(r&&r.some(x=>x!==h)&&N.desync<0){N.desync=k;netDesyncRep(k,d,N.rsumD&&N.rsumD.get(k))}}
 if(winner>=0){netSend();return}
 const R=netRem(N);let mc=Infinity,mf=Infinity;for(const i of R){mc=Math.min(mc,N.conf[i]);mf=Math.min(mf,N.rf[i])}
 if(R.length&&N.f-mc>NMAXP+N.D){N.stall++;N.stT=N.stT||performance.now();N.stW=R.find(i=>N.conf[i]===mc);netSend();return}
 if(R.length){const adv=N.f-(mf+(N.lat||N.rtt/2)/16.67);if(adv>2&&(++N.skip%4===0)){netSend();return}}
 const tf=N.f+N.D;if(!N.inp[N.L].has(tf)){N.inp[N.L].set(tf,netCap());let c=N.conf[N.L];while(N.inp[N.L].has(c+1))c++;N.conf[N.L]=c}
 N.stT=0;netSend();netSim(N.f);N.f++}
DEFER(()=>{{const T0=netTick;netTick=()=>{const t=performance.now();T0();if(ONL&&ONL.id===0)onlFlush();if(NET)NET.tms=(NET.tms||0)*.95+(performance.now()-t)*.05}}});
// le jeu continue de tourner quand l'onglet est caché / la fenêtre masquée (sinon TOUT LE MONDE gèle) : un Worker donne le tempo
let MAINT=0;DEFER(()=>{{const R1=render;render=(...a)=>{MAINT=performance.now();return R1(...a)}}});
DEFER(()=>{{try{const u=URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),8)'],{type:'text/javascript'}));const wk=new Worker(u);let last=performance.now(),a2=0;
 wk.onmessage=()=>{const now=performance.now(),dt=Math.min(250,now-last);last=now;if(!(NET&&mode==='game')||now-MAINT<120){a2=0;return}a2+=dt;let n=0;while(a2>=STEP&&n<8){try{netTick()}catch(e){errRep('step',e)}a2-=STEP;n++}if(a2>STEP)a2=STEP}}catch(e){}}});
function netSend(){const N=NET,a=[];let ack=Infinity;for(const i of netRem(N))ack=Math.min(ack,N.rc[i]?N.rc[i][N.L]:-1);if(ack===Infinity)ack=N.f;
 for(let f=Math.max(ack+1,N.f+N.D-60);f<=N.f+N.D;f++)if(N.inp[N.L].has(f))a.push([f,N.inp[N.L].get(f)]);N.send({t:'i',g:N.g,p:N.L,i:a,c:N.conf,cf:N.f})}
let readHumanBase;DEFER(()=>{readHumanBase=readHuman});
DEFER(()=>{{const H0=readHuman;readHuman=i=>{if(NET&&mode==='game'){const e=netGet(NET.cur,i);if(P[i])P[i].maim=e[3]?e[3]:null;return decI(e)}return H0(i)}}});
DEFER(()=>{{const S0=sfx;sfx=(...a)=>RESIM?null:S0(...a)}});
