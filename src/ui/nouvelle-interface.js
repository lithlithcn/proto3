'use strict';
// ===== NOUVELLE INTERFACE : écran titre, hub en « cartes de sort », sous-menus stylés, transitions
const UF=(w,s)=>(w||900)+' '+(s|0)+"px 'Arial Black','Segoe UI Black','Helvetica Neue',Impact,sans-serif",UFI=(s)=>'italic 900 '+(s|0)+"px 'Arial Black','Segoe UI Black',Impact,sans-serif";
const UNOW=()=>performance.now()/1000;let UIC={acc:'#ff3355',hue:350},UIT={key:'',t0:-9,acc:'#ff3355'},UIHUB={sel:0,a:{},desc:'',dt0:0},UISUB={key:'',t0:0,vals:{}};
const lerp=(a,b,k)=>a+(b-a)*k,hexA=(c,a)=>{if(c&&c[0]!=='#'){const m=/^hsla?\(([^,]+),([^,]+),([^,)]+)/.exec(c);return m?'hsla('+m[1]+','+m[2]+','+m[3]+','+a+')':c}const h=c.replace('#','');const f=h.length===3?h.split('').map(x=>x+x).join(''):h;return 'rgba('+parseInt(f.slice(0,2),16)+','+parseInt(f.slice(2,4),16)+','+parseInt(f.slice(4,6),16)+','+a+')'};
function skewRect(x,y,w,h,k){ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x,y+h);ctx.closePath()}
function strokeTxt(t,x,y,lw,sc,fc){ctx.lineJoin='round';ctx.lineWidth=lw;ctx.strokeStyle=sc;ctx.strokeText(t,x,y);ctx.fillStyle=fc;ctx.fillText(t,x,y)}
