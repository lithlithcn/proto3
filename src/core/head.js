'use strict';
/** Load-time statements of every file, run in the original order by core/boot.js once all files are loaded (see docs/ARCHITECTURE.md). */
const DEFQ=[];function DEFER(f){DEFQ.push(f)}

'use strict';
let STEP0;DEFER(()=>{STEP0=step}); // pas de base (avant toute surcouche) : utilisé pendant le gel/ralenti
