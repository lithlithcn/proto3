'use strict';
// ---- frame data en Training
DEFER(()=>{{const M0=melee;melee=(p,o,m)=>{const h0=o.hp,st0=o.state;M0(p,o,m);if(TEST&&!p.cpu&&(o.hp<h0||o.state!==st0)){const end=m.start+(m.act||4)+Math.round((m.rec||0)*(m.spd?1:.8)),left=end-p.t,stun=o.state==='hitstun'?o.t>0?o.t:(m.stun||0):o.state==='parrystun'?-(o.t||0):0;
  FDATA={n:p.mvName,s:m.start,a:m.act||4,r:Math.round((m.rec||0)*(m.spd?1:.8)),adv:o.state==='hitstun'?(m.stun||0)-left:o.state==='parrystun'?'PARRIED':'—',f:frame}}}}});
let FDATA=null;
DEFER(()=>{{const D0=drawTimer;drawTimer=()=>{D0();if(REPLAY&&mode==='game'){ctx.save();ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillStyle=frame&32?'#ff5a5a':'#fff';ctx.fillText('▶ REPLAY',W/2,H-24);ctx.restore()}if(!TEST||!TEST.train||mode!=='game')return;const p=P.find(q=>!q.cpu);ctx.save();ctx.font='bold 13px monospace';ctx.textAlign='left';ctx.lineWidth=3;ctx.strokeStyle='#000';
 const L=[];if(p&&p.state==='atk'&&p.mv){const m=p.mv;L.push(p.mvName.toUpperCase()+'  frame '+p.t+' / '+(m.start+(m.act||4)+Math.round((m.rec||0)*.8)))}
 if(FDATA){L.push('LAST HIT: '+FDATA.n.toUpperCase()+'  startup '+FDATA.s+' · active '+FDATA.a+' · recovery '+FDATA.r);L.push('ON HIT: '+(typeof FDATA.adv==='number'?(FDATA.adv>=0?'+':'')+FDATA.adv+' frames':FDATA.adv))}
 L.push('F2: show hitboxes'+(debug?' (ON)':''));L.forEach((l,i)=>{const y=H-70+i*17;ctx.strokeText(l,14,y);ctx.fillStyle=i===L.length-1?'#888':'#6ff';ctx.fillText(l,14,y)});ctx.restore()}}});
