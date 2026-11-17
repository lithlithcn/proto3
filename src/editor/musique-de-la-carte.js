'use strict';
// ---- musique de la carte
function mapMusic(){return mode==='game'&&CMAP&&CMAP.mus&&AST[CMAP.mus]&&!(winner>=0&&winT>=100)?'map:'+CMAP.mus:null}
