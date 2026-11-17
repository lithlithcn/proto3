'use strict';
// ===== ÉDITEUR DE CARTES v2 : calques d'images (parallaxe, sprite sheets, GIF), musique, règles d'événements, script JS, export / import, envoi en ligne
const AST={};let ASTDB=null;
let astDB;DEFER(()=>{astDB=new Promise(r=>{try{const q=indexedDB.open('sf_massets',1);q.onupgradeneeded=()=>q.result.createObjectStore('a',{keyPath:'id'});q.onsuccess=()=>{ASTDB=q.result;r(q.result)};q.onerror=()=>r(null)}catch(e){r(null)}})});
DEFER(()=>{astDB.then(db=>{if(!db)return;const g=db.transaction('a').objectStore('a').getAll();g.onsuccess=()=>{for(const a of g.result)astSet(a.id,a.d,true)}});});
function astSet(id,d,noSave){const a=AST[id]={d,img:null};if(/^data:image/.test(d)&&typeof Image!=='undefined'){const i=new Image();i.onload=()=>{a.img=i};i.src=d}if(!noSave)astDB.then(db=>{if(db)db.transaction('a','readwrite').objectStore('a').put({id,d})});return id}
const newId=()=>'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const LDEF=()=>({name:'Layer',a:'',par:.5,sx:0,sy:0,al:1,sc:1,tile:1,fg:0,add:0,cols:1,rows:1,n:1,dur:1000,hid:0,ox:0,oy:0});
const EVW=['start','every','at','ko'],EVWN={start:'at start',every:'every N s',at:'at time N s',ko:'on each KO'};
const EVA=['item','ring','rain','wind','pull','shake','text','sound','layer','heal'],EVAN={item:'spawn item card',ring:'bullet ring (center)',rain:'bullet rain',wind:'wind (3 s)',pull:'pull to center (3 s)',shake:'screen shake',text:'show text',sound:'play sound',layer:'toggle layer',heal:'heal everyone'};
const EVP0={item:'',ring:16,rain:20,wind:0,pull:3,shake:20,text:'HELLO!',sound:'ok00',layer:0,heal:20};
function mUp(m){if(!m.layers)m.layers=[];if(!m.ev)m.ev=[];if(m.js===undefined)m.js='';if(m.mus===undefined)m.mus='';if(!m.bg)m.bg='#14161f';m.ver=2;return m}
DEFER(()=>{for(const m of CMAPS)mUp(m);});
