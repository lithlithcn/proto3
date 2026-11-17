'use strict';
// ---- écran titre : espace en particules (Tetris Effect) + horizon lumineux et braises (FFXVI)
let TSTAR,TGAL,TEMB;DEFER(()=>{TSTAR=[...Array(700)].map(()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()}));TGAL=[...Array(1500)].map((_,i)=>{const arm=i%3,r=Math.pow(Math.random(),.65);return{arm,r,a:arm*TAU/3+Math.log(.06+r)*2.4+(Math.random()-.5)*(.25+.5*(1-r)),o:(Math.random()-.5)*.08,s:1+Math.random()*2.2,ph:Math.random()*TAU}});TEMB=[...Array(90)].map(()=>({x:Math.random(),y:Math.random(),s:.015+Math.random()*.04,w:Math.random()*TAU,r:.8+Math.random()*2.2}))});
function titleBG(t){const c=ctx,lo=fxLow,mx=((MOUSE.x||W/2)/W-.5),my=((MOUSE.y||H/2)/H-.5),dt=Math.min(.05,t-(titleBG.lt||t));titleBG.lt=t;
 c.save();c.setTransform(1,0,0,1,0,0);let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02030a');g.addColorStop(.55,'#070a22');g.addColorStop(1,'#1a0c34');c.fillStyle=g;if(YTBG>0){c.clearRect(0,0,W,H);c.globalAlpha=1-YTBG*.8}c.fillRect(0,0,W,H);c.globalAlpha=1;
 c.globalCompositeOperation='lighter';
 // étoiles en 3D, avec un départ en vitesse lumière
 const warp=Math.max(0,1-t/1.4),sp=.025+warp*2.2,f=H*.9,cx=W/2-mx*40,cy=H*.42-my*30;
 for(let i=0;i<(lo?250:TSTAR.length);i++){const s=TSTAR[i],z0=s.z;s.z-=dt*sp;if(s.z<=.02){s.z=1;s.x=Math.random()*2-1;s.y=Math.random()*2-1}
  const px=cx+s.x/s.z*f*.5,py=cy+s.y/s.z*f*.5;if(px<-20||px>W+20||py<-20||py>H+20)continue;const b=Math.min(1,(1-s.z)*1.4),sz=Math.max(.6,(1-s.z)*2.4);
  c.globalAlpha=b*(.55+.45*Math.sin(t*3+i));c.fillStyle=i%7?'#bcd8ff':'#ffe7c2';
  if(warp>.05){const qx=cx+s.x/z0*f*.5,qy=cy+s.y/z0*f*.5;c.strokeStyle=c.fillStyle;c.lineWidth=sz;c.beginPath();c.moveTo(qx,qy);c.lineTo(px,py);c.stroke()}else c.fillRect(px,py,sz,sz)}
 // galaxie spirale (nuée de particules qui tourne)
 const gx=W*.74-mx*70,gy=H*.3-my*45,gr=Math.min(W,H)*.72,gin=clamp((t-.3)/1.6,0,1),rot=t*.05;
 const hz=c.createRadialGradient(gx,gy,0,gx,gy,gr*.9);hz.addColorStop(0,'rgba(140,215,255,'+.38*gin+')');hz.addColorStop(.3,'rgba(100,80,255,'+.16*gin+')');hz.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=1;c.fillStyle=hz;c.fillRect(0,0,W,H);
 for(let i=0;i<(lo?500:TGAL.length);i++){const p=TGAL[i],a=p.a+rot/(.25+p.r)+p.o,rr=p.r*gr*gin,x=gx+Math.cos(a)*rr,y=gy+Math.sin(a)*rr*.42-(1-p.r)*Math.sin(a)*6,k=p.r;
  c.globalAlpha=(.4+.6*(1-k))*(.6+.4*Math.sin(t*2+p.ph))*gin;c.fillStyle=k<.18?'#ffffff':k<.45?'#8fe3ff':p.arm===1?'#b48cff':'#5aa8ff';c.fillRect(x,y,p.s,p.s)}
 // planète et atmosphère
 const pr=Math.max(W,H)*1.05,pcx=W*.5-mx*20,hy=H*.83-my*12,pcy=hy+pr;
 const ain=clamp((t-.2)/1,0,1);
 for(let k=0;k<7;k++){const x=W*(.12+k*.13)+Math.sin(t*.3+k)*W*.02,w=W*(.02+.03*((k*37)%5)/5),rg=c.createLinearGradient(x,0,x+w,0);rg.addColorStop(0,'rgba(140,180,255,0)');rg.addColorStop(.5,'rgba(140,180,255,.12)');rg.addColorStop(1,'rgba(140,180,255,0)');c.fillStyle=rg;c.globalAlpha=(.4+.35*Math.sin(t*.7+k*1.7))*ain;c.fillRect(x,hy-H*.5,w,H*.5)}
 c.globalCompositeOperation='source-over';c.globalAlpha=1;g=c.createRadialGradient(pcx,pcy-pr*.55,pr*.2,pcx,pcy,pr);g.addColorStop(0,'#1c1650');g.addColorStop(.85,'#0b0b2a');g.addColorStop(1,'#2a2a8a');c.fillStyle=g;c.beginPath();c.arc(pcx,pcy,pr,0,TAU);c.fill();
 c.save();c.beginPath();c.arc(pcx,pcy,pr,0,TAU);c.clip();c.globalAlpha=.045;c.fillStyle='#8fb8ff';for(let k=0;k<9;k++){const yy=hy+H*.02+k*H*.035,o=(t*14*(1+k*.2))%W;c.beginPath();c.ellipse(pcx-W*.6+o+((k*211)%W),yy,W*.35,H*.008,0,0,TAU);c.fill()}c.restore();
 c.globalCompositeOperation='lighter';
 for(const[wd,al,col]of[[34,.16,'#3a7bff'],[14,.35,'#5fd0ff'],[4,.9,'#dff6ff']]){c.globalAlpha=al*ain;c.strokeStyle=col;c.lineWidth=wd;c.beginPath();c.arc(pcx,pcy,pr,-Math.PI*.5-.7,-Math.PI*.5+.7);c.stroke()}
 // ligne d'horizon (flare) qui s'ouvre depuis le centre
 const lw=W*.62*(1-Math.pow(1-clamp((t-.35)/.9,0,1),3)),fl=.75+.25*Math.sin(t*2.3);g=c.createLinearGradient(pcx-lw,0,pcx+lw,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,'+fl+')');g.addColorStop(1,'rgba(255,255,255,0)');
 c.globalAlpha=1;c.fillStyle=g;c.fillRect(pcx-lw,hy-1.5,lw*2,3);if(lw>1){c.save();c.translate(pcx,hy);c.scale(lw/40,1);g=c.createRadialGradient(0,0,0,0,0,40);g.addColorStop(0,'rgba(140,200,255,'+.4*fl+')');g.addColorStop(1,'rgba(80,140,255,0)');c.fillStyle=g;c.fillRect(-40,-40,80,80);c.restore()}
 const gl=c.createRadialGradient(pcx,hy,0,pcx,hy,H*.12*fl);gl.addColorStop(0,'rgba(255,255,255,'+.7*ain+')');gl.addColorStop(.25,'rgba(150,210,255,'+.25*ain+')');gl.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gl;c.fillRect(pcx-H*.3,hy-H*.3,H*.6,H*.6);
 // braises chaudes qui montent
 for(let i=0;i<(lo?30:TEMB.length);i++){const e=TEMB[i];e.y-=dt*e.s;if(e.y<-.05){e.y=1.05;e.x=Math.random()}const x=(e.x+Math.sin(t*.8+e.w)*.02)*W-mx*90,y=e.y*H-my*60,fk=.5+.5*Math.sin(t*6+e.w*3);
  c.globalAlpha=(.35+.5*fk)*clamp(e.y*1.4,0,1);c.fillStyle=i%3?'#ffb35a':'#ff6a3a';c.beginPath();c.arc(x,y,e.r*(.7+.3*fk),0,TAU);c.fill()}
 c.restore()}
DEFER(()=>{{const D0=drawTitle;drawTitle=()=>{const t=UNOW()-UITITLE.t0,u=uiBG;uiBG=()=>{titleBG(t);const c=ctx,e=clamp(t/.9,0,1);c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='lighter';const h=c.createRadialGradient(W/2,H*.43,0,W/2,H*.43,W*.42);h.addColorStop(0,'rgba(255,60,100,'+.32*e+')');h.addColorStop(.5,'rgba(120,40,160,'+.12*e+')');h.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=h;c.fillRect(0,0,W,H);c.restore()};
 try{D0()}finally{uiBG=u}
 if(t>.6){const c=ctx;c.save();c.setTransform(1,0,0,1,0,0);c.font=UFI(H*.042);const tw=c.measureText('PRESS ANY BUTTON').width/2+26,a=clamp((t-.6)/.6,0,1),L=W*.22*a,y=H*.75-H*.014;c.globalCompositeOperation='lighter';
  for(const sg of[-1,1]){const x0=W/2+sg*tw,g=c.createLinearGradient(x0,0,x0+sg*L,0);g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(120,190,255,0)');c.fillStyle=g;c.fillRect(Math.min(x0,x0+sg*L),y-1,L,2);
   const px=x0+sg*L*((t*.35)%1);c.globalAlpha=.8;c.fillStyle='#fff';c.beginPath();c.arc(px,y,2.2,0,TAU);c.fill();c.globalAlpha=1}c.restore()}}}});
