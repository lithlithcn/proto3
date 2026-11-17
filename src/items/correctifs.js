'use strict';
// ---- correctifs : History Rewritten complet, Contrat de Yachie, items qui se décollent, anti-boucle de parade, ordre d'élimination, portes d'Okina, déguisement de Nue
let KEIS;DEFER(()=>{KEIS=new Map()});
DEFER(()=>{{const S1=step;step=()=>{
 if(mode==='game'&&CX.keiGo!==undefined){const S=KEIS.get(CX.keiGo),fr=frame,wt=WT;delete CX.keiGo;if(S){gameLoad(S);frame=fr;WT=wt;CX.kei=null;for(const q of P)if(q.state!=='dead')burst(q.x,q.y,'#5a8cff',20);big('HISTORY REWRITTEN','#5a8cff',56);sfx('se_kira00');flash(.4,'#5a8cff');chroma=Math.max(chroma,20)}}
 const w0=WT;S1();if(mode!=='game'||WT===w0)return;
 for(const q of P){
  if(q.state==='dead'&&q.stocks<=0&&!q.outAt)q.outAt=frame; // ordre d'élimination (classement)
  if(q.ctr){if(q.ctr.t>frame){const dl=q.spirit-q.ctrSp;if(dl>0)q.spirit=Math.min(T.SPIRIT_MAX,q.spirit+dl);q.ctrSp=q.spirit}else{q.noAtk=Math.max(q.noAtk||frame,frame)+150;big('P'+(q.id+1)+' LOST THE WILL TO FIGHT','#6a9a4a',34);sfx('cancel00',.6);q.ctr=null}}
  if(/^parry/.test(q.state)){q.__pk=(q.__pk||0)+1;if(q.__pk>600){q.__pk=0;q.state='hitstun';q.t=30;q.inv=0;q.vx=q.vy=0;txt(q.x,q.y-40,'LOOP BROKEN','#fff',14)}}else if(q.state==='idle')q.__pk=0; // parade en boucle (carte en wrap + laser) : stop au bout de 10 s
  if(q.nOrig!==undefined&&!(q.nD>frame)){q.shotT=q.nOrig;q.spI=q.nOsp;q.nOrig=undefined;burst(q.x,q.y,'#2a1a4a',14)}}
 for(let i=0;i<CARDS.length;i++){const a=CARDS[i];let ov=false;for(let j=0;j<CARDS.length;j++){if(i===j)continue;const b=CARDS[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<46){ov=true;if((a.ovT||0)>180){const k=d>.5?1:0,ux=k?dx/d:Math.cos(i*2.4),uy=k?dy/d:Math.sin(i*2.4);a.x=clamp(a.x+ux*1.2,T.EDGE+40,T.MAP_W-T.EDGE-40);a.y=clamp(a.y+uy*1.2,T.EDGE+40,T.MAP_H-T.EDGE-40)}}}a.ovT=ov?(a.ovT||0)+1:0}}}}); // items collés plus de 3 s : ils s'écartent doucement
DEFER(()=>{{const D0=chDmg;chDmg=(v,a,d,heavy)=>{if(a&&a.ctr&&a.ctr.t>frame){d*=1.2;if(v&&v.id===a.ctr.o){a.ctr=null;txt(a.x,a.y-40,'CONTRACT FULFILLED','#6a9a4a',14)}}return D0(v,a,d,heavy)}}});
DEFER(()=>{EST.odr=(e,o)=>{if(e.hp===undefined)return;for(const b of B)if(!b.dead&&b.owner!==e.o&&!(TEAMS&&ally(P[b.owner],o))&&Math.abs(b.x-e.x)<14+b.r&&Math.abs(b.y-e.y)<22+b.r){b.dead=1;e.hp-=b.heavy?(b.m&&b.m.dmg)||6:(b.dmg||1.5)}
 for(const q of P)if(foeQ(o,q)&&q.state==='atk'&&q.mv&&!q.mv.spd&&q.t>=q.mv.start&&q.t<q.mv.start+q.mv.act&&!((e.hc[q.id]||0)>frame)&&Math.hypot(q.x-e.x,q.y-e.y)<(q.mv.range||40)+bodyR(q)+16){e.hc[q.id]=frame+20;e.hp-=q.mv.dmg||5}
 if(e.hp<=0){e.t=0;burst(e.x,e.y,'#ffd23a',18);sfx('break',.6);txt(e.x,e.y-30,'DOOR BROKEN','#ffd23a',13)}};});
DEFER(()=>{{const E0=EDR.odr;EDR.odr=e=>{E0(e);if(e.hp!==undefined&&e.hp<50){ctx.fillStyle='#000';ctx.fillRect(e.x-16,e.y-32,32,5);ctx.fillStyle='#ffd23a';ctx.fillRect(e.x-16,e.y-32,32*Math.max(0,e.hp)/50,5)}}}});
DEFER(()=>{{const D0=drawP;drawP=q=>{D0(q);if(q.state==='dead')return;
 if(q.ctr&&q.ctr.t>frame){const k=(q.ctr.t-frame)/300,R=bodyR(q)*1.9;ctx.save();ctx.strokeStyle='#6a9a4a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,R,-Math.PI/2,-Math.PI/2+TAU*k);ctx.stroke();ctx.font='bold 13px monospace';ctx.textAlign='center';ctx.fillStyle='#b8e890';ctx.fillText('CONTRACT '+Math.ceil(k*5)+'s: HIT P'+(q.ctr.o+1),q.x,q.y-R-8);ctx.restore()}
 if(q.fx&&q.fx.larva>0){ctx.save();ctx.globalAlpha=.6+.4*Math.sin(frame*.25);ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillStyle='#c8ff5a';ctx.fillText('MOVE!',q.x,q.y+bodyR(q)+22);ctx.restore()}}}});
