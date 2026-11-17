'use strict';
// ================= Sons (intégrés, WebAudio) =================
let AC,SFX,SFXD;DEFER(()=>{AC=typeof AudioContext!=='undefined'?new AudioContext():null;SFX={};SFXD=typeof SFX_B64!=='undefined'?SFX_B64:{}});
DEFER(()=>{if(AC)for(const k in SFXD){const b=atob(SFXD[k]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
 AC.decodeAudioData(u.buffer).then(x=>SFX[k]=x).catch(e=>log('sound '+k+' unreadable: '+e))}});
const ALIAS={se_select00:'select00'}; // secours tant que ces 2 fichiers manquent // secours si un fichier manque
const SFXG={"se_changeitem":1.42,"cancel00":0.62,"roll":2.67,"loadvrai2":1.45,"tan00":0.6,"tan02":0.6,"tan01":0.6,"saigyou ayakashi spawn":3.06,"coin":0.6,"icebreak":1.45,"slice":3.83,"confirm":3.35,"select2":1.59,"weakslice":5.01,"electricity":1.83,"voosh":1.45,"bubble":3.08,"bonus":5.01,"windblow":2.58,"bombtick":1.74};
function sfx(k,vol=1,rate=1){vol*=SFXG[k]||1;const buf=SFX[k]||SFX[ALIAS[k]];if(!AC||!buf||AC.state!=='running')return;
 const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;s.playbackRate.value=rate;g.gain.value=vol*T.VOL;s.connect(g);if(mode==='game'&&TSTOP>0){const r=revNode();const d=AC.createGain();d.gain.value=.5;g.connect(d).connect(AC.destination);g.connect(r)}else g.connect(AC.destination);s.start();return s}
let REV=null;function revNode(){if(REV)return REV;const n=AC.sampleRate*2.6|0,b=AC.createBuffer(2,n,AC.sampleRate);let x=12345;for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++){x=(x*1103515245+12345)&0x7fffffff;d[i]=(x/0x3fffffff-1)*Math.pow(1-i/n,3.2)*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1)}}
 const cv=AC.createConvolver();cv.buffer=b;const w=AC.createGain();w.gain.value=.9;cv.connect(w).connect(AC.destination);REV=cv;return cv}
const sfxDmg=v=>{if(frame-sDmg<3)return;sDmg=frame;const f=1-clamp(v.hp/T.HP,0,1);sfx('damage00',T.SFX_DMG_MIN+(T.SFX_DMG_MAX-T.SFX_DMG_MIN)*f,1+.1*f)}; // plus aigu (max +10 %) quand la vie baisse
const brk=()=>{if(frame-sBrk>4){sBrk=frame;sfx('se_enep00',.6)}}; // grosse balle détruite
const flash=(a,c='#fff')=>{flashS=Math.max(flashS,a);flashCol=c};
const unlock=()=>{if(AC&&AC.state!=='running')AC.resume()};
DEFER(()=>{addEventListener('touchstart',unlock);});
