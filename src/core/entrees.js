'use strict';
// ================= Entrées =================
let keys,tapQ;DEFER(()=>{keys=new Set();tapQ=new Set()});
DEFER(()=>{addEventListener('keydown',e=>{if(e.key&&e.key.length===1&&e.key!==' ')LBL[e.code]=e.key.toUpperCase();
 if(!e.repeat){tapQ.add(e.code);onKey(e.code)}keys.add(e.code);
 if(/^Arrow|^Space$|^F2$|^Tab$|^Backspace$/.test(e.code))e.preventDefault()});});
DEFER(()=>{addEventListener('keyup',e=>keys.delete(e.code));});
DEFER(()=>{addEventListener('blur',()=>keys.clear());});
const kd=c=>keys.has(c)||tapQ.has(c);
const pads=()=>navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[];
function readHuman(i){
 // clavier : J1/J2 humains · manettes : les derniers humains en reçoivent une (seul humain = clavier + manette 1)
 const I={x:0,y:0,b:{}},ps=pads(),hum=P.filter(p=>!p.cpu).map(p=>p.id),h=hum.indexOf(i),pi=h-Math.max(0,hum.length-ps.length);
 if(h>=0&&h<2){const m=KB[h];I.x=kd(m.right)-kd(m.left);I.y=kd(m.down)-kd(m.up);for(const k of BTN)I.b[k]=kd(m[k])}
 const g=pi>=0?ps[pi]:null;
 if(g){let ax=g.axes[0]||0,ay=g.axes[1]||0;if(Math.hypot(ax,ay)<0.25)ax=ay=0;
  const bt=n=>g.buttons[n]&&(g.buttons[n].pressed||g.buttons[n].value>.3),M=PAD[pi]||DEF_PAD,used=new Set(BTN.flatMap(k=>[].concat(M[k])));
  if(!used.has(12)&&bt(12))ay=-1;if(!used.has(13)&&bt(13))ay=1;if(!used.has(14)&&bt(14))ax=-1;if(!used.has(15)&&bt(15))ax=1; // croix = déplacement si libre
  if(ax||ay){I.x=ax;I.y=ay}
  const pt=padT[pi],pb=padPB[pi];for(let n=0;n<g.buttons.length;n++){const on=bt(n);if(on&&!pb[n])pt[n]=frame;pb[n]=on} // instant d'appui de chaque bouton
  const cs=padUsed[pi];for(const n of cs)if(!bt(n))cs.delete(n); // boutons d'un combo ignorés jusqu'au relâchement
  for(const k of BTN){const v=M[k];if(Array.isArray(v)&&v.every(bt)&&(v.every(n=>cs.has(n))||Math.abs((pt[v[0]]||0)-(pt[v[1]]||0))<=T.COMBO_WIN)){I.b[k]=true;v.forEach(n=>cs.add(n))}}
  for(const k of BTN){const v=M[k];if(!Array.isArray(v)&&bt(v)&&!cs.has(v))I.b[k]=true}}
 if(h===0&&MOUSEON&&performance.now()-MOUSE.t<4000&&mode==='game'){I.b.melee=I.b.melee||!!MOUSE.b[0];I.b.heavy=I.b.heavy||!!MOUSE.b[2];I.b.parry=I.b.parry||!!MOUSE.b[1];const v=MVIEW[i]||Object.values(MVIEW)[0];if(v)P[i].maim=[(MOUSE.x-v.ox)/v.sc+v.cx,(MOUSE.y-v.oy)/v.sc+v.cy]}else if(P[i])P[i].maim=null;
 if(TCH.on&&h===0){if(TCH.joy){I.x=TCH.jx;I.y=TCH.jy}for(const k in TCH.b)I.b[k]=true;if(TCH.auto)I.b.shot=true} // tactile = joueur 1
 const l=Math.hypot(I.x,I.y);if(l>1){I.x/=l;I.y/=l}return I}
