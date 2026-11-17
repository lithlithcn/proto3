'use strict';
// ---- Effects OFF : à l'affichage seulement (la simulation reste identique en ligne), on coupe tremblements, flashs, zooms, particules et ondes
DEFER(()=>{{const R0=render;render=(...a)=>{if(!(fxOff&&mode==='game'))return R0(...a);const k={shake,zk,zblur,chroma,bright,focusL,flashS,invF,FX,RINGS,KOFX,CRACK,LINES};
 shake=0;zk=0;zblur=0;chroma=0;bright=0;focusL=0;flashS=Math.min(flashS,.06);invF=0;FX=[];RINGS=[];KOFX=[];CRACK=[];LINES=[];
 try{return R0(...a)}finally{({shake,zk,zblur,chroma,bright,focusL,flashS,invF,FX,RINGS,KOFX,CRACK,LINES}=k)}}}});
