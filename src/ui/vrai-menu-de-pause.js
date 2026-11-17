'use strict';
// ---- vrai menu de pause : Reprendre / Recommencer / Son… / Quitter (avec confirmation). B = reprendre (plus de sortie accidentelle)
const PZ={sel:0,cf:0,why:''};
const pzItems=()=>[['RESUME',()=>{paused=false;sfx('ok00')}],...(NET?[]:[['RESTART MATCH',()=>{paused=false;start('game');sfx('ok00')}]]),['SOUND…',()=>{paused=false;openSub('SOUND',SOUNDM)}],[PZ.cf?'QUIT? PRESS AGAIN':'QUIT TO MENU',()=>{if(!PZ.cf){PZ.cf=1;sfx('cancel00');return}if(NET)onlClose();paused=false;mode='menu';sfx('cancel00')}]];
DEFER(()=>{{const N1=nav;nav=ev=>{if(mode==='game'&&paused&&winner<0&&!(TEST&&TEST.train)){const L=pzItems();PZ.sel=clamp(PZ.sel,0,L.length-1);
  if(ev==='up'||ev==='down'){PZ.sel=(PZ.sel+(ev==='up'?L.length-1:1))%L.length;PZ.cf=0;sfx('se_select00',.6)}else if(ev==='ok'){L[PZ.sel][1]()}else if(ev==='back'){paused=false;sfx('ok00')}return}return N1(ev)}}});
DEFER(()=>{{const P0=drawPause;drawPause=()=>{P0();if(!paused){PZ.sel=0;PZ.cf=0;return}const L=pzItems(),c=ctx;c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#05060c';c.fillRect(W*.06,H*.535,W*.5,H*.04);c.textAlign='left';c.font='bold '+Math.round(H*.019)+'px monospace';c.fillStyle='#ffd23a';c.fillText('▲▼ choose  ·  A / Enter confirm  ·  B / Esc resume',W*.07,H*.56);
  hot=hot||[];L.forEach(([t,f],i)=>{const y=H*.64+i*H*.068,on=i===PZ.sel,x=W*.06+(on?18:0);c.globalAlpha=on?1:.75;c.fillStyle=on?'#ff3355':'#14161f';c.fillRect(x,y-H*.04,W*.34,H*.056);c.fillStyle='#fff';c.font=(on?'bold ':'')+Math.round(H*.03)+'px monospace';c.fillText((on?'▶ ':'  ')+t,x+14,y);
   hot.push({x,y:y-H*.04,w:W*.34,h:H*.056,hover:()=>{if(PZ.sel!==i){PZ.sel=i;PZ.cf=0}},click:()=>{PZ.sel=i;f()}})});
  if(PZ.why){c.globalAlpha=1;c.fillStyle='#ff9a3a';c.font='bold '+Math.round(H*.024)+'px monospace';c.fillText(PZ.why,W*.07,H*.62-H*.04-H*.02)}c.restore()}}});
