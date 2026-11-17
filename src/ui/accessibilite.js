'use strict';
// ===== Accessibilité : secousses, taille de l'interface, repères pour daltoniens (sauvegardés)
let ACC;DEFER(()=>{ACC=(()=>{const d={shk:1,ui:1,cb:0};try{return Object.assign(d,JSON.parse(localStorage.getItem('sf_acc')||'{}'))}catch(e){return d}})()});
const accSave=()=>{try{localStorage.setItem('sf_acc',JSON.stringify(ACC))}catch(e){}};
const CBS=['▲','■','●','◆','★','✚','◐','✦'];
DEFER(()=>{{const i=MENU.findIndex(r=>/^Motion/.test(r.t()));if(i>=0)MENU.splice(i+1,0,
 {t:()=>'Screen shake: '+Math.round(ACC.shk*100)+'%  ◀ ▶',lr:d=>{ACC.shk=clamp(Math.round((ACC.shk+(d>0?.25:-.25))*100)/100,0,1.5);accSave()}},
 {t:()=>'Interface size: '+Math.round(ACC.ui*100)+'%  ◀ ▶',lr:d=>{ACC.ui=clamp(Math.round((ACC.ui+(d>0?.1:-.1))*10)/10,.7,1.5);accSave()}},
 {t:()=>'Color-blind marks: '+(ACC.cb?'ON ▲■●◆':'OFF')+'  ◀ ▶',lr:()=>{ACC.cb^=1;accSave()}})}});
