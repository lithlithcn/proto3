'use strict';
// ================================================================ HECATIA : trois corps
DEFER(()=>{CHR7.push({k:'hecatia',name:'Hecatia',col:'#c070ff',spd:.9,din:.95,dout:1,role:'Stance master · Earth / Moon / Otherworld bodies',
 d:'FOCUS (tap): switch body Earth > Moon > Otherworld; the old body stays 3 s as a statue and keeps shooting. HEAVY: thrown planet orbits the foe / line of stars / planet ring shield. SKILL 2: Trinity (3 bodies fire). SKILL 1: swap with your statue.',
 cd:9,shot(p,a,f,pm,lv){if(p.hTr>frame)for(let b=0;b<3;b++)hShot(p,a,pm*.6,b,p.x,p.y);else hShot(p,a,pm,p.chM|0,p.x,p.y)},
 heavy:{N:(p,m,a,k)=>{const q=chFoe(p);ENT.push({k:'hpl',o:p.id,t:300,b:p.chM|0,tg:q?q.id:-1,ang:Math.atan2(p.y-(q?q.y:p.y),p.x-(q?q.x:p.x)),x:p.x,y:p.y,hc:{}});capE(p,'hpl',3);sfx('tan00',.6)},
  F:(p,m,a,k)=>{for(let i=0;i<6;i++){spawnH(p,m,a,k,{spd:6+i*.9,r:6,k:.22});const b=B[B.length-1];if(b&&b.owner===p.id)b.c=HEC[i%3]}},
  B:(p,m,a,k)=>{for(const e of myE(p,'hrg'))e.t=0;for(let i=0;i<3;i++)ENT.push({k:'hrg',o:p.id,t:240,i,x:p.x,y:p.y,hc:{}});sfx('blockshield',.6)}},
 melee:{jab:{start:6,act:6,rec:14,range:60,arc:2.6,dmg:7,kb:8,stun:24},lunge:{start:8,act:5,rec:20,range:100,arc:.35,dmg:7,kb:-10,stun:30},
  strong:{start:10,act:6,rec:30,range:84,arc:6.2832,dmg:15,kb:16,stun:42,charge:40}},
 spell:{name:'Trinity「Three-Body Crossfire」',loop:200,fn(p,o,k){if(k%10===0)for(let j=0;j<3;j++)for(let i=0;i<4;i++){addB(p,k*.04*(j-1||1)+i*TAU/4+j,3+j*.6,0,null,220);const b=B[B.length-1];if(b&&b.owner===p.id)b.c=HEC[j]}}},
 inp(p,o,I){const f=!!I.b.focus,e=f&&!p.hFp;p.hFp=f;if(e&&p.state!=='spell'&&p.state!=='dead'){for(const s of myE(p,'hst'))s.t=0;ENT.push({k:'hst',o:p.id,t:180,x:p.x,y:p.y,b:p.chM|0,cd:10});p.chM=((p.chM|0)+1)%3;RINGS.push({x:p.x,y:p.y,r:0,m:50,t:12,c:HEC[p.chM]});sfx('select00',.6)}return I},
 special(p){if(!chCool(p,720))return cdT(p,'TRINITY',p.chCD);p.hTr=frame+60;txt(p.x,p.y-36,'TRINITY!','#c070ff',16);sfx('se_enep00',.6)},
 special2(p){const s=myE(p,'hst')[0];if(!s)return txt(p.x,p.y-40,'NO STATUE','#888',13);if(!cd2(p,180))return cdT(p,'SWAP',p.chC2);const x=p.x,y=p.y;p.x=s.x;p.y=s.y;s.x=x;s.y=y;RINGS.push({x,y,r:0,m:40,t:12,c:'#c070ff'},{x:p.x,y:p.y,r:0,m:40,t:12,c:'#fff'});sfx('teleportation',.6)},
 tick(p){for(const q of P)if(q.hBurnBy===p.id&&q.hBurn>frame&&q.state!=='dead'&&frame%10===0){q.hp-=.8;q.flash=2;q.lastBy=p.id;if(q.hp<=0)ko(q,'K.O.')}},
 cpu(p,o,I,d){const want=d<200?2:d<450?1:0;if((p.chM|0)!==want&&frame%30===p.id)I.b.focus=true;if((p.chCD||0)<=frame&&d<500&&rng()<.02)I.b.next=true},
 draw(q,R){if(q.hTr>frame){for(let i=0;i<3;i++){const a=frame*.1+i*TAU/3;ctx.globalAlpha=.35;ctx.fillStyle=HEC[i];ctx.beginPath();ctx.arc(q.x+Math.cos(a)*R*1.4,q.y+Math.sin(a)*R*1.4,R*.8,0,TAU);ctx.fill()}ctx.globalAlpha=1}EMB.hecatia(q,R);
  mvFx(q,R,{jab:['arc','rgba(150,120,255,.4)',W_.flail],lunge:['thrust','#c070ff',W_.flail],strong:['ring',HEC[q.chM|0],(x,y,a,r)=>{for(let i=0;i<6;i++){const b=i*TAU/6;ctx.fillStyle='#8a7a6a';ctx.fillRect(x+Math.cos(b)*r-4,y+Math.sin(b)*r-4,8,8)}}]})}});});
