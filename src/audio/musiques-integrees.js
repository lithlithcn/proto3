'use strict';
// ===== MUSIQUES INTÉGRÉES (fichiers à côté du jeu, dossier music/, lues en streaming) + « DERNIÈRE VIE » en 1v1
const BMUS=[['menu','menumusiclofi'],['menu','menumusicupbeat'],['menu','menumusicmegaman'],['combat','fight1'],['combat','fight2'],['combat','fight4'],['combat','menumusicmegaman'],['combat','fight8'],['combat','fight9'],['combat','fight10'],['training','fight8'],['training','fight10'],['results','results'],['results','results2'],['last','1stockleft'],['last','1stockleft2'],['last','1stockleft3']];
let BFAIL;DEFER(()=>{BFAIL=new Set()});
const bTracks=scr=>BMUS.filter(b=>b[0]===scr&&!BFAIL.has(b[1])).map(b=>({id:'b:'+b[1],scr,url:'music/'+b[1]+'.ogg',w:5,name:b[1],b:1}));
DEFER(()=>{{const P0=musPick;musPick=scr=>{if(scr&&scr.startsWith('map:'))return P0(scr);const own=MUS.filter(t=>t.scr===scr),L=own.concat(bTracks(scr));if(!L.length)return null;const C=L.length>1?L.filter(t=>!MCUR||t.id!==MCUR.id):L;let r=Math.random()*C.reduce((a,t)=>a+t.w,0);for(const t of C)if((r-=t.w)<=0)return t;return C[0]}}});
DEFER(()=>{if(MAUD)MAUD.addEventListener('error',()=>{if(MCUR&&MCUR.b){BFAIL.add(MCUR.name);musPlay(musPick(MSCR))}});});
