'use strict';
// ---- lisibilité : les lignes de vitesse (parry) laissent un espace clair autour de chaque combattant ; les mini-panneaux de vie s'estompent au corps à corps
let GAD;DEFER(()=>{GAD=typeof CanvasRenderingContext2D!=='undefined'&&Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalAlpha')});
function withAlpha(k,f){const c=ctx;if(!GAD||!(c instanceof CanvasRenderingContext2D)||k>=1)return f();Object.defineProperty(c,'globalAlpha',{configurable:true,get(){return GAD.get.call(c)},set(v){GAD.set.call(c,v*k)}});try{return f()}finally{delete c.globalAlpha}}
DEFER(()=>{{const F0=focusLines;focusLines=a=>{const v=typeof MVIEW!=='undefined'&&Object.values(MVIEW)[0];if(!v||Object.keys(MVIEW).length>1)return F0(a);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);
 for(const q of P)if(q.state!=='dead'){const x=(q.x-v.cx)*v.sc+v.ox,y=(q.y-v.cy)*v.sc+v.oy,r=Math.max(70,bodyR(q)*v.sc*3.2);ctx.moveTo(x+r,y);ctx.arc(x,y,r,0,TAU,true)}ctx.clip('evenodd');try{F0(a)}finally{ctx.restore()}}}});
DEFER(()=>{{const M0=miniHUD;miniHUD=(q,...a)=>{const near=P.some(o=>o!==q&&o.state!=='dead'&&Math.hypot(o.x-q.x,o.y-q.y)<150);return near?withAlpha(.4,()=>M0(q,...a)):M0(q,...a)}}});
