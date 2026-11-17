'use strict';
// ===== écran EN LIGNE : salon jusqu'à 4 joueurs (PeerJS = mise en relation, WebRTC = connexion directe ; l'hôte relaie) =====
const NET_ICE_DEFAULT=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}];
// relais TURN : Cloudflare (Worker sf-turn, proche de chaque joueur) puis Metered en secours
const NET_TURN_API=['https://sf-turn.arietbatiment5.workers.dev','https://veskifoundation.metered.live/api/v1/turn/credentials?apiKey=d68c6282e783996e6bc8f72070249b98d00b'];
let ONL=null;
function onlLog(s){if(ONL){ONL.msg=s;ONL.log.push(s);if(ONL.log.length>6)ONL.log.shift()}try{console.log('[online]',s)}catch(e){}}
async function onlIce(){let ice=NET_ICE_DEFAULT.slice();try{const c=localStorage.getItem('sf_turn');if(c)ice=ice.concat(JSON.parse(c))}catch(e){}
 let tk='';for(const u of NET_TURN_API)try{const r=await fetch(u);if(r.ok){const j=await r.json();if(Array.isArray(j)&&j.length){ice=ice.concat(j);tk=u.includes('workers.dev')?'cloudflare':'metered';window.TURNK=tk;break}}}catch(e){}if(!tk)onlLog('TURN unavailable, direct connection only');return ice}
function onlOpen(){goFull();ONL={sel:0,st:'idle',code:'',msg:'Host a match (2 to 32 players) or join a friend with their code.',log:[],peer:null,conn:null,cl:[],id:-1,rtt:100,gN:0};mode='online'}
function onlClose(){if(ONL){const m={t:'bye'};try{ONL.conn&&ONL.conn.send(m)}catch(e){}for(const c of ONL.cl)try{c.c.send(m)}catch(e){}try{ONL.peer&&ONL.peer.destroy()}catch(e){}}ONL=null;NET=null}
function onlCode(){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.random()*A.length|0];return s}
async function onlPeer(id){if(typeof Peer==='undefined'){onlLog('Online library missing.');return null}const ice=await onlIce();
 let po={};try{po=JSON.parse(localStorage.getItem('sf_peer')||'{}')}catch(e){}return new Promise(res=>{const p=new Peer(id,{...po,config:{iceServers:ice},debug:1});let ok=0;p.on('open',()=>{ok=1;res(p)});p.on('error',e=>{onlLog('Error: '+(e.type||e.message||e));if(!ok)res(null)});setTimeout(()=>{if(!ok){onlLog('Matchmaking server unreachable (check your internet).');res(null)}},12000)})}
const medR=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?b[b.length>>1]:100};
