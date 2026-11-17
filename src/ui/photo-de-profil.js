'use strict';
// ---- photo de profil (≤ 1 Mo, réduite en 96×96 JPEG) + nom / touches modifiables depuis les résultats en ligne
let MYPIC=null,PICS=[],BRET=0;let PICC;DEFER(()=>{PICC=new Map()});DEFER(()=>{try{MYPIC=localStorage.getItem('sf_pic')||null}catch(e){}});
function picImg(p){if(!p||p.cpu)return null;const v=NET?PICS[p.id]:(p.id===0?MYPIC:null);if(!v)return null;let im=PICC.get(v);if(!im){im=new Image();im.src=v;PICC.set(v,im)}return im.complete&&im.naturalWidth?im:null}
function picPick(){const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=()=>{const F=f.files&&f.files[0];if(!F)return;if(F.size>1048576){big('PICTURE TOO BIG (1 MB MAX)','#ff6060',30);return}
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),s=Math.min(im.width,im.height);g.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,96,96);
  MYPIC=c.toDataURL('image/jpeg',.75);try{localStorage.setItem('sf_pic',MYPIC)}catch(e){}if(ONL&&ONL.conn&&ONL.conn.open)try{ONL.conn.send({t:'pic',v:MYPIC})}catch(e){}if(NET&&ONL)PICS[NET.L]=MYPIC;sfx('ok00')};im.src=r.result};r.readAsDataURL(F)};f.click()}
function nickEdit(){txtInput('YOUR NAME (seen by everyone)',nickOf(),24,v=>{if(v){NICK=v;try{localStorage.setItem('sf_nick',v)}catch(e){}if(ONL&&ONL.conn&&ONL.conn.open)try{ONL.conn.send({t:'nick',n:v})}catch(e){}if(NET&&NETNAMES){NETNAMES[NET.L]=v}}})}
DEFER(()=>{{const R0=render;render=(...a)=>{if(BRET&&mode!=='binds'&&mode!=='sub'){if(NET)mode='game';BRET=0}return R0(...a)}}});
DEFER(()=>{setInterval(()=>{if(!NET||!ONL||mode==='game')return;try{if(ONL.id===0)onlBcast({t:'hb'});else if(ONL.conn&&ONL.conn.open)ONL.conn.send({t:'hb'})}catch(e){}},1000);}); // signe de vie hors partie (menus) : personne n'est retiré

// 9 à 32 joueurs (en ligne) : couleurs générées
DEFER(()=>{for(let i=8;i<32;i++){const hu=(i*137.5)%360;COLS.push(`hsl(${hu|0},85%,62%)`);LCOLS.push(`hsl(${hu|0},90%,82%)`)}});
DEFER(()=>{{const i=MENU.findIndex(r=>/^Effects/.test(r.t()));if(i>=0)MENU.splice(i+1,0,{t:()=>'Error report file: '+(ERRDL?'ON (downloads a .json when a bug happens)':'OFF')+'  ◀ ▶',lr:()=>{ERRDL=ERRDL?0:1;try{localStorage.setItem('sf_errdl',ERRDL)}catch(e){}},f:()=>{ERRDL=ERRDL?0:1;try{localStorage.setItem('sf_errdl',ERRDL)}catch(e){}}})}});
