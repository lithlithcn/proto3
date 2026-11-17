'use strict';
// ================= Touches (configurables, sauvegardées dans le navigateur) =================
const ACTS=['up','down','left','right','shot','heavy','melee','dash','parry','burst','spell','focus','prev','next'];
let BTN;DEFER(()=>{BTN=ACTS.slice(4)});
const ACT_FR={up:'Up',down:'Down',left:'Left',right:'Right',shot:'Shot',heavy:'Heavy',melee:'Melee',dash:'Dash',parry:'Parry',burst:'Skill 2',spell:'Spell card',focus:'Focus',prev:'Skill 1',next:'Skill 2 (alt)'};
const DEF_KB=[ // codes physiques : KeyW/A/S/D = Z/Q/S/D sur AZERTY
 {up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',shot:'KeyJ',heavy:'KeyK',melee:'KeyL',dash:'Space',parry:'KeyI',burst:'KeyU',spell:'KeyO',focus:'ShiftLeft',prev:'KeyE',next:'KeyR'},
 {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',shot:'Numpad1',heavy:'Numpad2',melee:'Numpad3',dash:'Numpad0',parry:'Numpad5',burst:'Numpad7',spell:'Numpad6',focus:'Numpad4',prev:'Numpad8',next:'Numpad9'}];
const DEF_PAD={shot:0,melee:1,heavy:2,parry:5,focus:6,dash:7,burst:3,spell:[4,5],prev:10,next:11}; // burst = bouton Y dédié · spell = LB+RB
let KB,PAD;
function resetBinds(){KB=JSON.parse(JSON.stringify(DEF_KB));PAD=[0,1,2,3].map(()=>JSON.parse(JSON.stringify(DEF_PAD)))}
function saveBinds(){try{localStorage.setItem('sf_binds3',JSON.stringify({KB,PAD}))}catch(e){}}
DEFER(()=>{resetBinds();});DEFER(()=>{try{const s=JSON.parse(localStorage.getItem('sf_binds3'));if(s){s.KB.forEach((x,i)=>KB[i]&&Object.assign(KB[i],x));s.PAD.forEach((x,i)=>PAD[i]&&Object.assign(PAD[i],x));PAD.forEach(M=>{if(Array.isArray(M.burst))M.burst=3;if(M.next===12)M.next=11})}}catch(e){}}); // ancien burst en combinaison → bouton Y
const LBL={};DEFER(()=>{try{navigator.keyboard&&navigator.keyboard.getLayoutMap().then(m=>m.forEach((v,k)=>LBL[k]=v.toUpperCase()))}catch(e){}});
const keyName=c=>LBL[c]||{Mouse0:'Mouse L',Mouse1:'Mouse M',Mouse2:'Mouse R',Mouse3:'Mouse 4',Mouse4:'Mouse 5',WheelUp:'Wheel ↑',WheelDown:'Wheel ↓',Space:'Space',ShiftLeft:'L Shift',ShiftRight:'R Shift',ControlLeft:'L Ctrl',ControlRight:'R Ctrl',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Enter:'Enter',Tab:'Tab'}[c]||c.replace(/^Key|^Digit/,'').replace('Numpad','Num ');
const PADN=['A','B','X','Y','LB','RB','LT','RT','Select','Start','L3','R3','↑','↓','←','→'];
let bind,padUsed,padT,padPB;DEFER(()=>{bind={row:0,col:0,wait:false,pv:null,combo:[]};padUsed=[0,1,2,3].map(()=>new Set());padT=[0,1,2,3].map(()=>[]);padPB=[0,1,2,3].map(()=>[])});
const padName=n=>(isPS()?PADNS:PADN)[n]||('Button '+n),PADNS=['✕','○','□','△','L1','R1','L2','R2','Share','Options','L3','R3','↑','↓','←','→'],isPS=()=>{try{return pads().some(g=>g&&/054c|sony|playstation|dualshock|dualsense|wireless controller/i.test(g.id))}catch(e){return false}};
const padOn=g=>g.buttons.map((b,n)=>b&&(b.pressed||b.value>.3)?n:-1).filter(n=>n>=0);
function drawPadTest(y){ // ce que le jeu reçoit réellement de chaque manette
 const ps=pads();ctx.textAlign='left';ctx.font='12px monospace';
 if(!ps.length){ctx.fillStyle='#f66';ctx.fillText('No gamepad detected: press a button on your pad',20,y);return}
 ps.slice(0,4).forEach((g,k)=>{const on=padOn(g),acts=BTN.filter(a=>[].concat(PAD[k][a]).every(n=>on.includes(n)));
  ctx.fillStyle=g.mapping==='standard'?'#6f6':'#fc4';
  ctx.fillText(`Pad ${k+1} [${g.mapping||'NON-STANDARD'}] ${g.id.slice(0,40)} : buttons ${on.map(n=>padName(n)+'('+n+')').join(' ')||'—'}  →  actions (Pad ${k+1} config): ${acts.map(a=>ACT_FR[a]).join(', ')||'—'}`,20,y+k*16)})}
