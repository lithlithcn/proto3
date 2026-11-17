'use strict';
// ---- HUD animé (état purement visuel, hors simulation)
const HUDS={};
function skw(x,y,w,h,k){ctx.beginPath();ctx.moveTo(x+k,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w-k,y+h);ctx.lineTo(x,y+h);ctx.closePath()}
function sbar(x,y,w,h,f,c1,c2,k){ctx.fillStyle='rgba(0,0,0,.55)';skw(x,y,w,h,k);ctx.fill();f=clamp(f,0,1);if(f>0){ctx.save();skw(x,y,w,h,k);ctx.clip();const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(x,y,w*f,h);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x,y,w*f,h*.35);ctx.restore()}}
DEFER(()=>{drawHUD=function(p,x,right,y=30){if(CX.anon>0||p.fx&&p.fx.koishi>0)return;const now=UNOW(),S=HUDS[p.id]||(HUDS[p.id]={hp:p.hp,tr:p.hp,trT:0,st:p.stocks,lost:[],hit:0,f0:frame,sp:p.spirit});
 if(frame<S.f0||frame-S.f0>100000){S.hp=S.tr=p.hp;S.st=p.stocks;S.f0=frame;S.lost=[]}
 const hpN=p.wsA?T.HP-Math.max(0,p.hp):Math.max(0,p.hp);if(hpN<S.hp-.5){S.hit=now;S.trT=now+.45}if(hpN>S.hp+.5)S.heal=now;S.hp=lerp(S.hp,hpN,.35);if(now>S.trT)S.tr=lerp(S.tr,S.hp,.08);if(S.tr<S.hp)S.tr=S.hp;
 if(p.stocks<S.st){for(let i=p.stocks;i<S.st;i++)S.lost.push({i,t:now})}S.st=p.stocks;S.lost=S.lost.filter(l=>now-l.t<.9);
 const w=250,X=right?x-w:x,c=COLS[p.id],tc=TEAMS?TCOL[TEAMA[p.id]]:c,ent=clamp((frame-S.f0)/30,0,1),ee=1-Math.pow(1-ent,3),hs=Math.max(0,1-(now-S.hit)/.35),sx=(Math.random()-.5)*hs*8,sy=(Math.random()-.5)*hs*5;
 ctx.save();ctx.translate((right?1:-1)*(1-ee)*(w+60)+sx,sy);
 ctx.globalAlpha*=.92;const g=ctx.createLinearGradient(X,0,X+w,0);g.addColorStop(right?1:0,hexA(c,.5));g.addColorStop(right?0:1,'rgba(4,5,11,.75)');ctx.fillStyle='rgba(4,5,11,.72)';skw(X-10,y-22,w+20,96,14);ctx.fill();ctx.fillStyle=g;skw(X-10,y-22,w+20,24,10);ctx.fill();
 ctx.fillStyle=tc;if(right)ctx.fillRect(X+w+4,y-22,5,96);else ctx.fillRect(X-16,y-22,5,96);if(typeof LS!=='undefined'&&LS.on&&p.stocks===1){ctx.save();ctx.globalAlpha=.4+.4*Math.pow(Math.max(0,Math.sin(now*Math.PI*2*1.1)),6);ctx.strokeStyle='#ff2d55';ctx.lineWidth=4;ctx.shadowColor='#ff2d55';ctx.shadowBlur=16;skw(X-10,y-22,w+20,96,14);ctx.stroke();ctx.restore()}
 if(hs>0){ctx.strokeStyle='rgba(255,255,255,'+hs+')';ctx.lineWidth=2+hs*3;skw(X-10,y-22,w+20,96,14);ctx.stroke()}
 ctx.font=UFI(17);ctx.textAlign=right?'right':'left';ctx.lineWidth=4;ctx.strokeStyle='#05060c';ctx.strokeText(pname(p),x,y-4);ctx.fillStyle='#fff';ctx.fillText(pname(p),x,y-4);
 const ns=Math.min(p.stocks,8);for(let i=0;i<ns;i++){const ix=right?X+6+i*13:X+w-6-i*13,iy=y-11,pu=1+.15*Math.sin(now*4+i);ctx.save();ctx.translate(ix,iy);ctx.rotate(Math.PI/4);ctx.scale(pu,pu);ctx.fillStyle=c;ctx.fillRect(-4,-4,8,8);ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.strokeRect(-4,-4,8,8);ctx.restore()}
 if(p.stocks>8){ctx.font=UF(900,11);ctx.fillStyle='#fff';ctx.textAlign=right?'left':'right';ctx.fillText('x'+p.stocks,right?X+6+8*13:X+w-6-8*13,y-7)}
 for(const l of S.lost){const u=(now-l.t)/.9,ix=right?X+6+l.i*13:X+w-6-l.i*13;ctx.save();ctx.globalAlpha=1-u;for(let k=0;k<4;k++){const a=k*Math.PI/2+.6;ctx.fillStyle=k%2?'#fff':c;ctx.fillRect(ix+Math.cos(a)*u*26-2,y-11+Math.sin(a)*u*26+u*u*30-2,4,4)}ctx.font=UFI(14);ctx.textAlign='center';ctx.fillStyle='#ff5a7a';ctx.fillText('-1',ix,y-16-u*18);ctx.restore()}
 const hf=hpN/T.HP,low=hf<.25,hc1=hf>.5?'#7dff8a':hf>.25?'#ffe066':'#ff5a5a',hc2=hf>.5?'#1fa64a':hf>.25?'#c98a12':'#a3121e';
 ctx.fillStyle='rgba(0,0,0,.55)';skw(X,y+2,w,16,6);ctx.fill();ctx.save();skw(X,y+2,w,16,6);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(X,y+2,w*clamp(S.tr/T.HP,0,1),16);ctx.fillStyle='#ff3d5a';ctx.globalAlpha=.85;ctx.fillRect(X,y+2,w*clamp(S.tr/T.HP,0,1),16);ctx.globalAlpha=1;ctx.restore();
 sbar(X,y+2,w,16,S.hp/T.HP,hc1,hc2,6);if(low){ctx.save();ctx.globalAlpha=.35+.35*Math.sin(now*9);ctx.strokeStyle='#ff3d5a';ctx.lineWidth=3;skw(X,y+2,w,16,6);ctx.stroke();ctx.restore()}
 if(S.heal&&now-S.heal<.5){ctx.save();ctx.globalAlpha=1-(now-S.heal)/.5;ctx.strokeStyle='#9dffb0';ctx.lineWidth=3;skw(X,y+2,w,16,6);ctx.stroke();ctx.restore()}
 for(let i=1;i<4;i++){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(X+w*i/4,y+2,1.5,16)}
 ctx.font=UFI(13);ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#05060c';const ht=Math.ceil(hpN)+' HP';ctx.strokeText(ht,X+w/2,y+15);ctx.fillStyle='#fff';ctx.fillText(ht,X+w/2,y+15);
 const sr=p.spirit>=T.SPELL_COST,sf=p.spirit/T.SPIRIT_MAX;if(p.ult){const h=(now*200)%360;sbar(X,y+22,w,10,sf,'hsl('+h+',100%,70%)','hsl('+(h+60)%360+',100%,45%)',4)}else sbar(X,y+22,w,10,sf,sr?'#ffb0f8':'#8ab4ff',sr?'#d040c0':'#3a5ad0',4);
 for(let k=T.SPELL_COST;k<T.SPIRIT_MAX;k+=T.SPELL_COST){ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(X+w*k/T.SPIRIT_MAX,y+22,1.5,10)}
 if(sr||p.ult){ctx.save();skw(X,y+22,w*sf,10,4);ctx.clip();const sw=((now*1.4)%1.2)/1.2*w*1.4-w*.2,gg=ctx.createLinearGradient(X+sw-40,0,X+sw+40,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.8)');gg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gg;ctx.fillRect(X,y+22,w,10);ctx.restore()}
 ctx.font=UF(900,9);ctx.fillStyle=sr||p.ult?'#05060c':'#fff';ctx.fillText(p.ult?'LAST WORD READY':sr?'SPELL READY':'SPELL '+Math.min(99,p.spirit/T.SPELL_COST*100|0)+'%',X+w/2,y+30);
 
 for(let i=0;i<T.DASH_CHARGES;i++){const f=clamp(p.boost-i,0,1),xx=X+w*.53+i*17;ctx.fillStyle='#262a33';skw(xx,y+36,14,9,3);ctx.fill();ctx.fillStyle=f>=1?'#fff':'#8a8f9a';ctx.save();skw(xx,y+36,14,9,3);ctx.clip();ctx.fillRect(xx,y+36,14*f,9);ctx.restore()}
 for(let i=0;i<T.PIPS;i++){const on=i<p.pips;ctx.fillStyle=on?'#ff5a6a':'#3a2226';skw(X+w-(T.PIPS-i)*15+3,y+36,12,9,3);ctx.fill();if(on){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(X+w-(T.PIPS-i)*15+5,y+36,8,3)}}
 ctx.fillStyle='#8a8f9a';ctx.font=UF(800,7);ctx.fillText('DASH',X+w*.53+25,y+53);ctx.fillText('WALL',X+w-22,y+53);
 ctx.textAlign=right?'right':'left';ctx.font=UF(800,10);ctx.fillStyle=LCOLS[p.id];ctx.fillText(SHOTS[p.shotT].name.toUpperCase()+'   P '+p.power.toFixed(1)+(p.pStk?'   ATK x'+Math.pow(1.3,p.pStk).toFixed(1):''),x,y+63);
 const st=[p.blade>0?'BLADE '+Math.ceil(p.blade/60)+'s':'',p.rifle?'RIFLE x'+p.rifle:'',p.bombs>0?'BOMBS '+Math.ceil(p.bombs/60)+'s':'',p.mirror>0?'MIRROR '+Math.ceil(p.mirror/60)+'s':'',p.giant>0?'GIANT '+Math.ceil(p.giant/60)+'s':'',p.clone>0?'CLONE '+Math.ceil(p.clone/60)+'s':'',p.star>0?'ELIXIR '+Math.ceil(p.star/60)+'s':'',p.cam?'CAMERA x'+p.cam:''].filter(Boolean).join('  ');
 if(st){ctx.fillStyle='#ffb0f0';ctx.font=UF(800,9);ctx.fillText(st.slice(0,48),x,y+73)}ctx.restore()};});
