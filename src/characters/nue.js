'use strict';
// ================================================================ NUE : l'inconnue
DEFER(()=>{CHR7.push({k:'nue',name:'Nue',col:'#4a4aff',spd:1,din:1,dout:1,role:'Trickster · Unknown bullets, clouds, UFOs, disguise',
 d:'FOCUS: bullets become UNKNOWN black shapes, most are harmless decoys. STAND STILL: dark clouds gather, shooting launches them. HEAVY: UFO / trident (toward) / storm trap (away). SKILL 2: disguise as another player. SKILL 1: swap with a UFO.',
 cd:8,shot(p,a,f,pm,lv){const dz=p.nD>frame&&P[p.nDid],oc=dz&&chOf(dz);if(oc&&oc.k!=='nue'){oc.shot(p,a,f,pm,lv);for(const b of B)if(b.owner===p.id&&!b.seen&&!b.nc){b.nc=1}return}
  const cl=myE(p,'ncl');if(cl.length){for(const e of cl){xBall(p,e.x,e.y,a+(e.i%5-2)*.08,6.5,8,{dmg:4,kb:5,stun:16,arm:0},{c:'#2a1a4a',life:160});e.t=0}sfx('shoot3',.5)}
  for(let i=0;i<3;i++){const b=chB(p,a+(i-1)*.25,6,pm*.6,5,120);if(b){b.wav=.12;b.ph=i*2;b.c=f?'#141018':'#4a4aff'}}
  if(f)for(let i=0;i<6;i++){const b=chB(p,a+(i-2.5)*.18,6,0,5,120);if(b){b.wav=.12;b.ph=i;b.c='#141018';b.fake=1}}},
 heavy:{N:(p,m,a,k)=>{ENT.push({k:'nufo',o:p.id,t:480,x:p.x+Math.cos(a)*30,y:p.y+Math.sin(a)*30,hp:4,cd:30});capE(p,'nufo',3);sfx('se_enep00',.5)},
  F:(p,m,a,k)=>{spawnH(p,m,a,k,{spd:13,r:7,k:1});const b=B[B.length-1];if(b&&b.owner===p.id){b.pierce=1;b.c='#c03aff'}},
  B:(p,m,a,k)=>{ENT.push({k:'nst',o:p.id,t:360,x:p.x-Math.cos(a)*60,y:p.y-Math.sin(a)*60,d:10*k});capE(p,'nst',2)}},
 melee:{jab:{start:5,act:4,rec:12,range:72,arc:.5,dmg:6,kb:7,stun:22},lunge:{start:7,act:8,rec:20,range:50,arc:1,dmg:9,kb:11,stun:28,move:16},
  strong:{start:8,act:12,rec:24,range:64,arc:6.2832,dmg:3,kb:4,stun:14,multi:1,every:4,charge:40},dashatk:{start:3,act:6,rec:16,range:70,arc:1.2,dmg:6,kb:-9,stun:28,keep:.9}},
 spell:{name:'Nue Sign「Undefined Darkness」',loop:200,fn(p,o,k){if(k%7===0)for(let i=0;i<6;i++){addB(p,i*TAU/6+k*.05,3.2,0,null,240);const b=B[B.length-1];if(b&&b.owner===p.id)b.c=i%2?'#6a2aff':'#ff2a6a'}}},
 special(p){if(!chCool(p,600))return cdT(p,'DISGUISE',p.chCD);const L=P.filter(q=>q!==p&&q.state!=='dead');if(!L.length)return;const q=L[frame%L.length];p.nD=frame+240;p.nDid=q.id;{const oc=chOf(q);if(oc&&oc.k!=='nue'&&p.nOrig===undefined){p.nOrig=p.shotT;p.nOsp=p.spI;p.shotT=q.shotT;p.spI=q.spI}}burst(p.x,p.y,'#2a1a4a',20);sfx('teleportation',.5)},
 special2(p){const U=myE(p,'nufo');if(!U.length)return txt(p.x,p.y-40,'NO UFO','#888',13);if(!cd2(p,240))return cdT(p,'SWAP',p.chC2);let u=U[0],bd=-1e9;for(const e of U){const d=(e.x-p.x)*Math.cos(p.aim)+(e.y-p.y)*Math.sin(p.aim);if(d>bd){bd=d;u=e}}const x=p.x,y=p.y;p.x=u.x;p.y=u.y;u.x=x;u.y=y;burst(x,y,'#2a1a4a',14);sfx('teleportation',.6)},
 dashF(p){p.inv=Math.max(p.inv,10);p.nDs=frame+14},
 tick(p){if(Math.hypot(p.vx,p.vy)<.6&&p.state==='idle'){p.nS=(p.nS||0)+1;if(p.nS%20===0&&myE(p,'ncl').length<8)ENT.push({k:'ncl',o:p.id,t:900,i:p.nS/20|0,x:p.x,y:p.y})}else p.nS=0;
  if(p.nDs>frame&&frame%2===0&&FX.length<480)FX.push({x:p.x,y:p.y,vx:0,vy:0,t:18,c:'#1a1028'})},
 cpu(p,o,I,d){if((p.chCD||0)<=frame&&d<500&&rng()<.01)I.b.next=true;else if((p.chC2||0)<=frame&&d<140&&myE(p,'nufo').length)I.b.prev=true;if(d>500&&rng()<.3)I.b.focus=true},
 draw(q,R){const dz=q.nD>frame&&P[q.nDid],oc=dz&&chOf(dz);if(oc&&oc.k!=='nue')oc.draw(q,R);else EMB.nue(q,R);
  if(q.state==='spell'){ctx.save();ctx.fillStyle='rgba(0,0,0,.8)';ctx.beginPath();ctx.rect(q.x-5000,q.y-5000,10000,10000);ctx.arc(q.x,q.y,150,0,TAU,true);ctx.fill('evenodd');ctx.restore()}
  mvFx(q,R,{jab:['thrust','#8a2ad0',W_.trident],lunge:['thrust','#4a4aff',W_.trident],strong:['arc','rgba(140,60,255,.45)',W_.trident],dashatk:['arc','rgba(60,200,90,.5)',(x,y,a,L)=>{ctx.beginPath();for(let i=0;i<=12;i++){const d=L*i/12,o=Math.sin(i*1.2+frame*.4)*6;ctx.lineTo(x+Math.cos(a)*d-Math.sin(a)*o,y+Math.sin(a)*d+Math.cos(a)*o)}ctx.strokeStyle='#3ac05a';ctx.lineWidth=4;ctx.stroke()}]})}});});
