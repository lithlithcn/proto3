'use strict';
// ===== décor vivant : aurore, cercles qui tournent, particules ; teinte arc-en-ciel lente qui accélère vers la fin, couleur du joueur pendant une spell =====
const DBG={h:200,sp:null,k:0};
function hexHue(c){const m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c||'');if(!m)return 300;const r=parseInt(m[1],16)/255,g=parseInt(m[2],16)/255,b=parseInt(m[3],16)/255,M=Math.max(r,g,b),n=Math.min(r,g,b),d=M-n;if(!d)return 0;let h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;return(h*60+360)%360}
function dbgProg(){let p=0;if(TIMER>0&&typeof TN!=='undefined'){}const al=P.filter(q=>q.state!=='dead'||q.stocks>0);const s0=STOCKS[stI]||3;if(al.length){const mn=Math.min(...al.map(q=>q.stocks));p=Math.max(p,1-mn/Math.max(1,s0))}if(TIMER>0)p=Math.max(p,Math.min(1,frame/(TIMER*3600)));return Math.min(1,p)}
function dynBG(L,Tp,R,Bt){if(ENT.some(e=>e.k==='tree'))return;const now=performance.now(),dt=Math.min(50,now-(DBG.t||now));DBG.t=now;
 const sp=P.find(q=>q.state==='spell'),pr=dbgProg();DBG.h=(DBG.h+dt*.024*(1+pr*1.5))%360;DBG.k+=((sp?1:0)-DBG.k)*Math.min(1,dt*.004);if(sp)DBG.sh=hexHue(COLS[sp.id]);
 let h=DBG.h;if(DBG.k>.01&&DBG.sh!==undefined){let d=((DBG.sh-h+540)%360)-180;h=(h+d*DBG.k+360)%360}
 const lo=fxLow||perfLow,t=now*.001,W2=R-L,H2=Bt-Tp,cx=(L+R)/2,cy=(Tp+Bt)/2;ctx.save();
 const g=ctx.createLinearGradient(0,Tp,0,Bt);g.addColorStop(0,`hsla(${h},70%,28%,.30)`);g.addColorStop(.6,`hsla(${(h+40)%360},60%,14%,.12)`);g.addColorStop(1,`hsla(${(h+80)%360},70%,22%,.22)`);ctx.fillStyle=g;ctx.fillRect(L,Tp,W2,H2);
 ctx.globalCompositeOperation='lighter';
 if(!lo)for(let i=0;i<4;i++){const hh=(h+i*35)%360,yb=Tp+H2*(.22+i*.17)+Math.sin(t*.25+i*1.7)*H2*.08,a=Math.max(W2,H2),amp=H2*(.06+.03*i);ctx.fillStyle=`hsla(${hh},90%,60%,${.05+.02*(i%2)})`;ctx.beginPath();
  for(let k=0;k<=24;k++){const x=L-40+(W2+80)*k/24,y=yb+Math.sin(x*.0035+t*(.5+i*.13)+i)*amp+Math.sin(x*.009-t*.7)*amp*.4;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  for(let k=24;k>=0;k--){const x=L-40+(W2+80)*k/24,y=yb+H2*(.06+.02*i)+Math.sin(x*.003+t*(.42+i*.1)+i*2)*amp*1.2;ctx.lineTo(x,y)}ctx.closePath();ctx.fill()}
 {const g2=ctx.createLinearGradient(L,Tp,R,Bt);g2.addColorStop(0,`hsla(${(h+180)%360},70%,40%,.06)`);g2.addColorStop(.5,'hsla(0,0%,0%,0)');g2.addColorStop(1,`hsla(${(h+120)%360},80%,45%,.07)`);ctx.fillStyle=g2;ctx.fillRect(L,Tp,W2,H2);
  const g3=ctx.createLinearGradient(0,Bt-H2*.35,0,Bt);g3.addColorStop(0,'hsla(0,0%,0%,0)');g3.addColorStop(1,`hsla(${(h+30)%360},90%,55%,.09)`);ctx.fillStyle=g3;ctx.fillRect(L,Bt-H2*.35,W2,H2*.35)}
 if(!lo){for(let i=0;i<6;i++){const s1=hz(i,21),s2=hz(i,22),nx=T.MAP_W*(.5+.48*Math.sin(t*.021*(1+i*.27)+s1*6.3)),ny=T.MAP_H*(.5+.45*Math.cos(t*.017*(1+i*.31)+s2*6.3)),nr=650+s2*600;
   if(nx+nr<L||nx-nr>R||ny+nr<Tp||ny-nr>Bt)continue;const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr),hh=(h+50+i*60)%360,pu=.75+.25*Math.sin(t*.4+i*2);ng.addColorStop(0,`hsla(${hh},85%,60%,${.075*pu})`);ng.addColorStop(.45,`hsla(${(hh+35)%360},80%,45%,${.035*pu})`);ng.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=ng;ctx.fillRect(Math.max(L,nx-nr),Math.max(Tp,ny-nr),Math.min(R,nx+nr)-Math.max(L,nx-nr),Math.min(Bt,ny+nr)-Math.max(Tp,ny-nr))}
  for(let i=0;i<3;i++){const hh=(h+150+i*40)%360,yb=Tp+H2*(.12+i*.24)+Math.sin(t*.19+i*2.3)*H2*.06,ch=H2*(.22+.06*i),cg=ctx.createLinearGradient(0,0,0,1),M0=ctx.getTransform();cg.addColorStop(0,'hsla(0,0%,0%,0)');cg.addColorStop(.25,`hsla(${hh},95%,65%,.10)`);cg.addColorStop(.6,`hsla(${(hh+40)%360},90%,55%,.04)`);cg.addColorStop(1,'hsla(0,0%,0%,0)');ctx.fillStyle=cg;
   const n=90,sw=(W2+80)/n;for(let k=0;k<n;k++){const x=L-40+k*sw,w0=Math.sin(x*.004+t*(.35+i*.11)+i*3),y=yb+w0*H2*.05+Math.sin(x*.011-t*.6+i)*H2*.015,hh2=ch*(.45+.35*Math.sin(x*.017+t*(.9+i*.2))+.2*Math.sin(x*.043-t*1.3+i));ctx.globalAlpha=.3+.7*Math.max(0,Math.sin(x*.006-t*.5+i*1.7))*(.6+.4*Math.sin(k*1.7+t*3));ctx.translate(x,y-hh2*.25);ctx.scale(1,hh2*1.5);ctx.fillRect(0,0,sw*1.05,1);ctx.setTransform(M0)}ctx.globalAlpha=1}
  for(let i=0;i<3;i++){const P0=6+i*2.7,ph=(t+i*3.1)/P0,n=Math.floor(ph),u=ph-n;if(u>.1)continue;const v=u/.1,an=.35+hz(n,33+i)*.5,sx=L+W2*(.1+.7*hz(n,31+i)),sy=Tp+H2*.45*hz(n,32+i),ln=260+120*hz(n,34),hx=sx+Math.cos(an)*v*W2*.45,hy=sy+Math.sin(an)*v*W2*.45,tg=ctx.createLinearGradient(hx,hy,hx-Math.cos(an)*ln,hy-Math.sin(an)*ln);
   tg.addColorStop(0,`hsla(${(h+200)%360},100%,92%,${.55*(1-v*.6)})`);tg.addColorStop(1,'hsla(0,0%,0%,0)');ctx.strokeStyle=tg;ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-Math.cos(an)*ln,hy-Math.sin(an)*ln);ctx.stroke();ctx.fillStyle=`hsla(${(h+200)%360},100%,95%,${.7*(1-v*.5)})`;ctx.beginPath();ctx.arc(hx,hy,2.4,0,TAU);ctx.fill()}}
 if(!lo){const N=60;for(let i=0;i<N;i++){const s1=hz(i,11),s2=hz(i,12),x=L+((s1*W2+Math.sin(t*.6+i)*30)%W2+W2)%W2,y=Bt-((t*(18+s2*30)+s2*H2)%H2),r=.6+hz(i,13)*1.1,a=.18+.22*Math.sin(t*2+i);
  ctx.fillStyle=`hsla(${(h+s1*90)%360},90%,70%,${a*.4})`;ctx.beginPath();ctx.arc(x,y,r*3.2,0,TAU);ctx.fill();ctx.fillStyle=`hsla(${(h+s1*90)%360},80%,80%,${a})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}}
 if(DBG.k>.05){ctx.globalAlpha=DBG.k*.35;const rg=ctx.createRadialGradient(sp?sp.x:cx,sp?sp.y:cy,0,sp?sp.x:cx,sp?sp.y:cy,Math.max(W2,H2)*.7);rg.addColorStop(0,`hsla(${h},90%,60%,.5)`);rg.addColorStop(1,`hsla(${h},90%,40%,0)`);ctx.fillStyle=rg;ctx.fillRect(L,Tp,W2,H2)}
 ctx.restore()}
DEFER(()=>{BGH.unshift(dynBG);});

DEFER(()=>{{const S0=step;step=()=>{const w0=WT;S0();if(mode==='game'&&WT!==w0){actsPrune();for(const e of ENT)if(e.fl>0)e.fl--}}}});
DEFER(()=>{{const S0=step;let fzN=0,lf=-1;step=()=>{S0();if(mode!=='game'){fzN=0;return}for(const p of P)if(p.stocks<0)p.stocks=0;if(frame===lf){if(++fzN>600){errRep('freeze',new Error('frame stuck at '+frame+' slow='+slow+' hitstop='+hitstop+' cx='+Object.keys(CX).join(',')));slow=0;hitstop=0;fzN=0}}else{fzN=0;lf=frame}}}});
