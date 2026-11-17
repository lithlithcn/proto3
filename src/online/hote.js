'use strict';
// ---- hôte
async function onlHost(){if(!ONL)return;ONL.st='lobby';ONL.id=0;ONL.code=onlCode();onlLog('Creating room...');const p=await onlPeer('shmupf-'+ONL.code);if(!ONL)return p&&p.destroy();if(!p){ONL.st='idle';return}ONL.peer=p;
 onlLog('Room '+ONL.code+' ready: give this code to your friends (up to 3).');try{navigator.clipboard&&navigator.clipboard.writeText(ONL.code).catch(()=>{})}catch(e){}
 p.on('connection',c=>{if(c.label==='r'){c.on('open',()=>{const k=ONL&&ONL.cl.find(q=>q.id===(c.metadata&&c.metadata.rid));if(k)k.r=c});c.on('data',m=>{if(m&&m.t==='mpok'&&ONL){const k=ONL.cl.find(q=>q.r===c);if(k){k.mpok=1;k.mh=k.mhp}}});return}if(!ONL||ONL.st!=='lobby'||ONL.cl.length>=31){c.on('open',()=>{try{c.send({t:'full'})}catch(e){}setTimeout(()=>c.close(),300)});return}onlHostConn(c)});
 ONL.piv=setInterval(()=>{if(!ONL){return}const now=performance.now();for(const k of ONL.cl)if(k.c.open)try{k.c.send({t:'p0',s:now})}catch(e){}if(!ONL.lt||now-ONL.lt>900){ONL.lt=now;onlBcast({t:'lobby',L:[[0,nickOf(),0]].concat(ONL.cl.filter(k=>k.ok).map(k=>[k.id,k.nick||'',k.rtt|0]))})}},300)}
function onlHostConn(c){const used=new Set(ONL.cl.map(k=>k.id));let id=1;while(used.has(id))id++;const k={c,id,ping:[],ok:false};ONL.cl.push(k);
 c.on('open',()=>{k.ok=true;try{c.send({t:'hello',id,v:NETV})}catch(e){}onlLog('P'+(id+1)+' joined.');sfx('joined',.7)});
 c.on('data',m=>{if(!m||!m.t||!ONL)return;k.lm=performance.now();if(m.t==='q0'){k.ping.push(performance.now()-m.s);if(k.ping.length>12)k.ping.shift();k.rtt=medR(k.ping);if(NET){NET.rttP=NET.rttP||[];NET.rttP[k.id]=k.rtt;NET.rtt=Math.max(...ONL.cl.map(q=>q.rtt||0),1)}return}
  if(m.t==='p0'){try{c.send({t:'q0',s:m.s})}catch(e){}return}
  if(m.t==='bye'){onlHostLost(k,m.why);return}
  if(m.t==='mpref'){k.mpok=-2;return}
  if((m.t==='i'||m.t==='rdy')&&m.p!==k.id)return;
  if(m.t==='hb')return;if(m.t==='nick'||m.t==='ch'||m.t==='pic'){onlMsg(m,k);return}if(!onlMsg(m,k)&&NET)netRecv(m);onlRelay(m,k)});
 c.on('close',()=>onlHostLost(k));c.on('error',e=>onlLog('Connection error: '+(e.type||e)))}
function onlHostLost(k,why){if(!ONL||!ONL.cl.includes(k))return;ONL.cl=ONL.cl.filter(x=>x!==k);onlLog(why==='version'?'P'+(k.id+1)+' has a different game version (must be the SAME file).':'P'+(k.id+1)+' left.');
 if(NET&&mode==='game'&&NET.drop[k.id]===Infinity){const F=NET.conf[k.id]+1;netDrop(k.id,F);onlBcast({t:'drop',k:k.id,f:F})}}
// relais de l'hôte : messages d'entrées regroupés par client (1 paquet par frame, seule la dernière entrée de chaque joueur compte)
// et jamais envoyés si le tampon du canal déborde (sinon la latence s'empile = gels de plusieurs secondes à 4 joueurs)
function onlOb(o,m){const b=o.ob||(o.ob=[]);if(m.t==='i'){const j=b.findIndex(x=>x.t==='i'&&x.p===m.p);if(j>=0){b[j]=m;return}}b.push(m);if(b.length>40)b.splice(b.findIndex(x=>x.t==='c'),1)}
function onlRelay(m,k){const net=m.t==='i'||m.t==='c';for(const o of ONL.cl)if(o!==k&&o.c.open){if(net)onlOb(o,m);else try{o.c.send(m)}catch(e){}}}
function onlFlush(){if(!ONL||!ONL.cl)return;for(const o of ONL.cl){if(!o.ob||!o.ob.length||!o.c.open)continue;const dc=o.c.dataChannel;if(dc&&dc.bufferedAmount>16000)continue;try{o.c.send({t:'B',a:o.ob})}catch(e){}o.ob=[]}}
DEFER(()=>{setInterval(()=>{if(NET&&ONL&&ONL.id===0)onlFlush()},20);});
// diagnostic : connexion directe ou relayée par un serveur TURN (plus lent), ping réel, débit — toutes les 2 s, hors simulation
async function onlLink(c){try{const pc=c&&c.peerConnection;if(!pc)return null;const st=await pc.getStats();let pr=null,lo={},re={};st.forEach(r=>{if(r.type==='candidate-pair'&&r.state==='succeeded'&&(r.nominated||r.selected)&&(!pr||r.bytesSent>pr.bytesSent))pr=r});if(!pr)return null;
 st.forEach(r=>{if(r.id===pr.localCandidateId)lo=r;if(r.id===pr.remoteCandidateId)re=r});return{relay:lo.candidateType==='relay'||re.candidateType==='relay',rtt:(pr.currentRoundTripTime||0)*1000,b:(pr.bytesSent||0)+(pr.bytesReceived||0),t:performance.now()}}catch(e){return null}}
DEFER(()=>{setInterval(async()=>{if(!ONL||!NET)return;const L=ONL.id===0?ONL.cl.map(k=>[k.id,k.c]):[[0,ONL.conn]],D=ONL.diag||(ONL.diag={});for(const[i,c]of L){const r=await onlLink(c);if(!r)continue;const o=D[i];r.kbs=o&&r.t>o.t?(r.b-o.b)/((r.t-o.t)/1000)/1024:0;D[i]=r}},2000);});
DEFER(()=>{setInterval(()=>{if(!NET||!ONL||ONL.id!==0||mode!=='game')return;const t=performance.now();for(const k of ONL.cl.slice())if(k.lm&&t-k.lm>5000)onlHostLost(k,'timeout')},1000);});
function onlBcast(m){for(const o of ONL.cl)if(o.c.open)try{o.c.send(m)}catch(e){}}
function onlDelayN(){const r=ONL.cl.map(k=>k.rtt||100).sort((a,b)=>b-a),w=r.length>1?(r[0]+r[1])/2:r[0]||100;return {D:clamp(Math.round(w/2/16.67),2,5),lat:w/2}}
function onlStart(){if(!ONL||ONL.id!==0)return;const M=ALLM()[mapI];if(M&&M.walls&&!ONL.mapSent){onlSendMap(M);return}ONL.mapSent=0;const cl=ONL.cl.filter(k=>k.ok&&k.c.open);if(!cl.length){onlLog('Wait for at least one friend.');return}
 cl.sort((a,b)=>a.id-b.id);const map={0:0};cl.forEach((k,i)=>map[k.id]=i+1);for(const k of cl)k.id=map[k.id]; // numéros sans trou
 const n=cl.length+1,{D,lat}=onlDelayN(),tm=TEAMA.slice(0,n);let teams=TEAMS&&n>2&&new Set(tm).size>1;
 const names=[nickOf()].concat(cl.map(k=>k.nick||('P'+(k.id+1))));ONL.gN=(ONL.gN||0)+1;const o={v:NETV,g:ONL.gN,names,pics:[MYPIC||null].concat(cl.map(k=>k.pic||null)),chars:[myCh()].concat(cl.map(k=>k.ch==null?null:k.ch)),dn:Date.now(),mw:Math.round(W/SC),n,D,lat,TEAMS:teams,TEAMA:tm,mapI,itemsOn,itemOn:{...itemOn},COMP,stI,TIMER,NERV,maxC,seed:(Math.random()*1e9|0)||1};
 if(M&&M.walls)o.cm=1;for(const k of cl)try{k.c.send({t:'go',o,id:k.id})}catch(e){}onlGo({o,id:0})}
function onlSendMap(M){const cl=ONL.cl.filter(k=>k.ok&&k.c.open);const t=JSON.stringify(mapPack(M)),CH=15000,n=Math.ceil(t.length/CH);ONL.xfer={p:0,n,t0:performance.now()};onlLog('Sending the map to everyone ('+Math.round(t.length/1024)+' KB)...');
 let h=7;for(let i=0;i<t.length;i+=7)h=(h*31+t.charCodeAt(i))|0;for(const k of cl){if(k.mh===h){k.mpok=1;continue}k.mpok=0;k.mhp=h;let i=0;const t0=performance.now(),go=()=>{if(!ONL)return;if(k.r&&k.r.open)pump();else if(performance.now()-t0<12000)setTimeout(go,200);else k.mpok=-1};const pump=()=>{if(!ONL)return;try{while(i<n&&(!k.r.dataChannel||k.r.dataChannel.bufferedAmount<1e6)){k.r.send({t:'mp',i,n,d:t.slice(i*CH,(i+1)*CH)});i++}}catch(e){}if(ONL.xfer)ONL.xfer.p=Math.max(ONL.xfer.p,i/n);if(i<n)setTimeout(pump,30)};go()}
 const iv=setInterval(()=>{if(!ONL){clearInterval(iv);return}const c2=ONL.cl.filter(k=>k.ok&&k.c.open);const bad=c2.filter(k=>k.mpok===-1||k.mpok===-2);if(bad.length){clearInterval(iv);ONL.xfer=null;onlLog(bad.map(k=>'P'+(k.id+1)).join(', ')+(bad.some(k=>k.mpok===-2)?' refused the map\'s custom code.':' could not receive the map (no reliable channel).'));return}
  if(c2.every(k=>k.mpok===1)){clearInterval(iv);ONL.xfer=null;ONL.mapSent=1;onlStart()}else if(performance.now()-ONL.xfer.t0>90000){clearInterval(iv);ONL.xfer=null;onlLog('Map transfer timed out.')}},100)}
