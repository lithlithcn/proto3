'use strict';
// ===== saisie de texte dans le jeu (pseudo, code de salle, noms) avec son de frappe
let TXI=null;
function txtInput(title,val,max,cb,o){TXI={title,val:val||'',max:max||12,cb,up:!!(o&&o.up),allow:(o&&o.allow)||/^[\w \-.!?'#&()+]$/,hint:(o&&o.hint)||'',t:0,sh:0}}
/** Adds pasted text (Ctrl+V) to the field, keeping only allowed characters. */
function txiPaste(t){const T=TXI;if(!T||!t)return;let n=0;for(let c of String(t)){if(T.up)c=c.toUpperCase();if(T.allow.test(c)&&T.val.length<T.max){T.val+=c;n++}}if(n){T.t=0;burstUI=8;sfx('se_select00',.55,1.3)}else{T.sh=8;sfx('cancel00',.25)}}
DEFER(()=>{addEventListener('paste',e=>{if(!TXI||TXI.dom&&e.target===TXI.dom)return;e.preventDefault();TXI.pq=0;txiPaste(e.clipboardData&&e.clipboardData.getData('text'))},true);
addEventListener('keydown',e=>{if(!TXI||TXI.dom&&e.target===TXI.dom)return;if((e.ctrlKey||e.metaKey)&&(e.key==='v'||e.key==='V')){TXI.pq=1;setTimeout(()=>{if(TXI&&TXI.pq){TXI.pq=0;try{navigator.clipboard.readText().then(txiPaste,()=>{})}catch(_){}}},60);return} /* the 'paste' event when the browser fires it, else the clipboard API */e.preventDefault();e.stopImmediatePropagation();const T=TXI;
 if(e.key==='Enter'){const v=T.val.trim();TXI=null;sfx('ok00');T.cb(v||null);return}
 if(e.key==='Escape'){TXI=null;sfx('cancel00');T.cb(null);return}
 if(e.key==='Backspace'){if(T.val.length){T.val=T.val.slice(0,-1);sfx('se_select00',.45,.8)}else T.sh=8;return}
 if(e.key&&e.key.length===1){let c=T.up?e.key.toUpperCase():e.key;if(!T.allow.test(c)||T.val.length>=T.max){T.sh=8;sfx('cancel00',.25);return}T.val+=c;T.t=0;sfx('se_select00',.55,1.15+Math.min(.6,T.val.length*.05));burstUI=8}},true);});
let burstUI=0;
function drawTXI(){const T=TXI;if(!T)return;T.t++;hot=[];const c=OC||CTX0;c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(5,6,12,.82)';c.fillRect(0,0,W,H);
 const bw=Math.min(620,W-40),bh=190,x=W/2-bw/2+(T.sh>0?Math.sin(T.sh--*2.5)*6:0),y=H/2-bh/2;c.fillStyle='#10121c';c.fillRect(x,y,bw,bh);c.strokeStyle='#ffd23a';c.lineWidth=2;c.strokeRect(x,y,bw,bh);
 c.textAlign='center';c.fillStyle='#fff';c.font='bold 22px monospace';c.fillText(T.title,W/2,y+40);
 c.fillStyle='#05060a';c.fillRect(x+30,y+64,bw-60,54);c.strokeStyle=burstUI>0?'#fff':'#555';c.lineWidth=burstUI>0?3:1;c.strokeRect(x+30,y+64,bw-60,54);if(burstUI>0)burstUI--;
 c.font='bold 30px monospace';c.fillStyle='#ffd23a';const tx=T.val+((T.t>>4)&1?'_':' ');c.fillText(tx,W/2,y+101);
 c.font='12px monospace';c.fillStyle='#888';c.fillText((T.hint?T.hint+'  ·  ':'')+T.val.length+'/'+T.max+'  ·  Enter: OK  ·  Esc: cancel',W/2,y+150);c.restore()}

// pseudo en ligne
let NICK='';DEFER(()=>{try{NICK=localStorage.getItem('sf_nick')||''}catch(e){}});
const nickOf=()=>NICK||(typeof profOf==='function'&&profOf(0)&&profOf(0).n)||'Player';
let NETNAMES=null;
