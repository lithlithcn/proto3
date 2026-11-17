'use strict';
// ---- pause automatique (local) : manette débranchée, fenêtre/onglet quitté
const autoPause=why=>{if(mode==='game'&&!NET&&winner<0&&!paused&&P.some(p=>!p.cpu)){paused=true;PZ.why=why;sfx('cancel00')}};
DEFER(()=>{addEventListener('gamepaddisconnected',()=>autoPause('CONTROLLER DISCONNECTED — plug it back in, then resume'));});
DEFER(()=>{addEventListener('gamepadconnected',()=>{if(PZ.why.startsWith('CONTROLLER'))PZ.why='CONTROLLER CONNECTED — press A to resume'});});
DEFER(()=>{if(document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause('PAUSED WHILE THE GAME WAS IN THE BACKGROUND')});});
DEFER(()=>{addEventListener('blur',()=>autoPause('PAUSED: THE WINDOW LOST FOCUS'));});
DEFER(()=>{{const S0=start;start=(...a)=>{PZ.why='';for(const k in SPEC)delete SPEC[k];return S0(...a)}}});
