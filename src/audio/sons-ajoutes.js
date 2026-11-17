'use strict';
// ---- sons ajoutés : couches sur les sons existants + sons sur les textes d'événement

const SCD={};DEFER(()=>{{const S0=sfx;sfx=(k,v=1,r=1)=>{const nw=performance.now();if(SCD[k]>nw)return;SCD[k]=nw+45;return S0(k,v*SV(),r)}}}); // 1 action = 1 son
DEFER(()=>{{const B0=big;big=(s,c,z,key)=>{B0(s,c,z,key);if(BIG.length>2)BIG.splice(0,BIG.length-2)}}}); // 2 gros textes max à la fois
let VOLS={master:1,sfx:1,music:.7};DEFER(()=>{try{Object.assign(VOLS,JSON.parse(localStorage.getItem('sf_vol')||'{}'))}catch(e){}});
