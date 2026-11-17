'use strict';
// ---- jauge de spell 2x plus lente (tous les gains normaux sont divisés par 2 ; les remplissages volontaires restent entiers)
DEFER(()=>{{const S0=step;step=()=>{if(mode==='game')for(const p of P)p.spP=p.spirit;S0();if(mode!=='game')return;for(const p of P){const d=p.spirit-(p.spP??p.spirit);if(d>0&&d<25)p.spirit=p.spP+d*.5}}}});
