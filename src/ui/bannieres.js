'use strict';
// ---- bannières (big) : bande oblique qui claque, texte qui rebondit, reflet, sortie en glissade
function drawBanners(){BIG.forEach((b,i)=>{const age=45-b.t,e=clamp(age/7,0,1),out=clamp(b.t/10,0,1),sc=Math.min(1,W/1100+.15)*(e<1?1+(1-e)*1.2:1+.06*Math.sin(Math.min(1,(age-7)/10)*Math.PI)),y=H*.3+i*b.z*1.25,c=b.c==='rainbow'?rainbowCol():b.c;
 ctx.save();ctx.translate(W/2+(1-out)*W*.6,y);ctx.rotate(-.05);const tw=(()=>{ctx.font=UFI(b.z);return ctx.measureText(b.s).width})()*sc;
 const bw=Math.min(W*1.1,tw+120),bh=b.z*sc*1.25,bx=-bw/2*Math.min(1,e*1.6);ctx.globalAlpha=.42*out;ctx.fillStyle='#05060c';skw(bx-10,-bh*.7,bw*Math.min(1,e*1.6)+20,bh,bh*.35);ctx.fill();ctx.globalAlpha=.6*out;ctx.fillStyle=c;ctx.fillRect(bx,-bh*.7,bw*Math.min(1,e*1.6),3);ctx.fillRect(bx,bh*.3-3,bw*Math.min(1,e*1.6),3);
 if(age<5){ctx.globalAlpha=(1-age/5)*.5;ctx.fillStyle='#fff';skw(-bw/2,-bh*.7,bw,bh,bh*.35);ctx.fill()}
 ctx.scale(sc,sc);ctx.font=UFI(b.z);ctx.textAlign='center';ctx.globalAlpha=Math.min(.75,out*.75);ctx.lineJoin='round';ctx.lineWidth=b.z*.16;ctx.strokeStyle='#05060c';ctx.strokeText(b.s,0,0);
 if(!fxLow){ctx.globalAlpha*=.6;ctx.fillStyle='#ff2d6a';ctx.fillText(b.s,-3,0);ctx.fillStyle='#2df0ff';ctx.fillText(b.s,3,0);ctx.globalAlpha=Math.min(.75,out*.75)}ctx.fillStyle=c;ctx.fillText(b.s,0,0);
 if(age>4&&age<22&&!fxLow){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5*out;const sx=-tw/sc/2+(age-4)/18*(tw/sc*1.2),gg=ctx.createLinearGradient(sx-40,0,sx+40,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.9)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillText(b.s,0,0);ctx.restore()}
 ctx.restore()})}
