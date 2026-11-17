'use strict';
// ---- ralenti du KO / gel d'impact : seul le pas de base tourne (les surcouches d'items ne doivent pas agir sur une frame figée, sinon boucle infinie parry/ralenti)
DEFER(()=>{{const S0=step;step=()=>{if(mode==='game'&&(hitstop>0||(slow>0&&(slow-1)%3)))return STEP0();return S0()}}});
