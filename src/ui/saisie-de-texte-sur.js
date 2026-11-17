'use strict';
// ---- saisie de texte sur mobile : vrai champ (clavier du téléphone) + boutons OK / CANCEL partout
DEFER(()=>{{const isT=()=>('ontouchstart' in window)||navigator.maxTouchPoints>0||(typeof TCH!=='undefined'&&TCH&&TCH.on);
 const geo=()=>{const bw=Math.min(620,W-40),bh=190,x=W/2-bw/2,y=Math.min(H/2-bh/2,H*.12+10);return{bw,bh,x,y}};
 const txEnd=ok=>{const T=TXI;if(!T)return;TXI=null;if(T.dom){T.dom.remove();T.dom=null}sfx(ok?'ok00':'cancel00');T.cb(ok?(T.val.trim()||null):null)};
 const T0=txtInput;txtInput=(...a)=>{if(TXI&&TXI.dom)TXI.dom.remove();T0(...a);const T=TXI;if(!T||!isT())return;const i=document.createElement('input');T.dom=i;
  i.value=T.val;i.maxLength=T.max;i.setAttribute('autocomplete','off');i.setAttribute('autocorrect','off');i.setAttribute('spellcheck','false');if(T.up)i.setAttribute('autocapitalize','characters');
  i.style.cssText='position:fixed;z-index:30;background:#05060a;color:#ffd23a;border:2px solid #fff;outline:0;text-align:center;font:bold 20px monospace;border-radius:0;box-sizing:border-box;padding:0 8px';
  const place=()=>{const g=geo();i.style.left=(g.x+30)+'px';i.style.top=(g.y+64)+'px';i.style.width=(g.bw-60)+'px';i.style.height='54px'};place();
  i.oninput=()=>{let v='';for(let ch of i.value){if(T.up)ch=ch.toUpperCase();if(T.allow.test(ch)&&v.length<T.max)v+=ch}if(i.value!==v)i.value=v;if(v.length>T.val.length)sfx('se_select00',.55,1.15+Math.min(.6,v.length*.05));T.val=v;T.t=0};
  i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();txEnd(1)}else if(e.key==='Escape'){e.preventDefault();txEnd(0)}});
  for(const ev of['mousedown','pointerdown','touchstart','touchend','click','keydown','keyup','keypress'])i.addEventListener(ev,e=>e.stopPropagation());
  document.body.appendChild(i);i.focus();T.place=place};
 drawTXI=()=>{const T=TXI;if(!T)return;T.__d=1;T.t++;hot=[];const g=geo(),c=OC||CTX0;if(T.place)T.place();c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(5,6,12,.82)';c.fillRect(0,0,W,H);
  const x=g.x+(T.sh>0?Math.sin(T.sh--*2.5)*6:0),y=g.y;c.fillStyle='#10121c';c.fillRect(x,y,g.bw,g.bh);c.strokeStyle='#ffd23a';c.lineWidth=2;c.strokeRect(x,y,g.bw,g.bh);
  c.textAlign='center';c.fillStyle='#fff';c.font='bold '+(g.bw<420?17:22)+'px monospace';c.fillText(T.title,W/2,y+40);c.fillStyle='#05060a';c.fillRect(x+30,y+64,g.bw-60,54);c.strokeStyle=burstUI>0?'#fff':'#555';c.lineWidth=burstUI>0?3:1;c.strokeRect(x+30,y+64,g.bw-60,54);if(burstUI>0)burstUI--;
  if(!T.dom){c.font='bold 30px monospace';c.fillStyle='#ffd23a';c.fillText(T.val+((T.t>>4)&1?'_':' '),W/2,y+101)}
  c.font='12px monospace';c.fillStyle='#888';c.fillText((T.hint?T.hint+'  ·  ':'')+T.val.length+'/'+T.max+(T.dom?'':'  ·  Enter: OK  ·  Esc: cancel'),W/2,y+150);c.restore();
  const bw2=Math.min(200,(g.bw-30)/2),by=g.y+g.bh+12;c.save();c.setTransform(1,0,0,1,0,0);c.textAlign='center';c.font='bold 18px monospace';
  [['✔ OK','#ffd23a',1],['✖ CANCEL','#888',0]].forEach(([lb,col,ok],k)=>{const x=W/2+(k?8:-8-bw2);c.fillStyle='#10121c';c.fillRect(x,by,bw2,46);c.strokeStyle=col;c.lineWidth=2;c.strokeRect(x,by,bw2,46);c.fillStyle=col;c.fillText(lb,x+bw2/2,by+29);hot.push({x,y:by,w:bw2,h:46,hover:()=>{},click:()=>txEnd(ok)})});
  if(T.dom)hot.push({x:g.x,y:g.y,w:g.bw,h:g.bh,hover:()=>{},click:()=>T.dom.focus()});c.restore()}
 // certains écrans (sélection, playground…) ne dessinaient pas la boîte : on la force après chaque image
 {const R0=render;render=()=>{if(TXI)TXI.__d=0;R0();if(TXI&&!TXI.__d)drawTXI()}}}});
