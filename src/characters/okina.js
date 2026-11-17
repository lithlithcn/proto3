'use strict';
// ================================================================ OKINA : portes, saisons, danseurs
DEFER(()=>{CHR7.push({k:'okina',name:'Okina',col:'#ffd23a',spd:.98,din:1,dout:1,role:'Controller · Doors, seasons, backup dancers',
 d:'SKILL 2: place a door (max 3); every door copies all your shots, aimed at the nearest foe. FOCUS: only the doors shoot. DASH: travel through a door. SHOT: season changes every 5 s (spring heals, summer fast, autumn pushes, winter slows). HEAVY: big door swallows and spits bullets / ray through doors (1 s warning, then 1 s recharge) / leaf whirl. SKILL 1: place Satono, SKILL 1 again: place Mai (5 s). They dance in place, shoot easy patterns and kick anyone close toward their sister.',
 cd:8,shot(p,a,f,pm,lv){const s=p.chM|0,D=myE(p,'odr'),src=(f&&D.length?[]:[[p.x,p.y,1]]).concat(D.map(d=>[d.x,d.y,0])),k=pm*(src.length>1?1.3/src.length:1);
  for(const[x,y,me]of src){const q=me?null:nearFoe(p.id,x,y,1500),aa=q?Math.atan2(q.y-y,q.x-x):a,mk=(o,sp,dm,r)=>{const b=lbAt(p,aa+o,sp,dm,r,120,x,y);if(b){b.c=SEAC[s];if(s!==1)b.sea=[1,0,3,4][s];if(s===2){b.wav=.1;b.ph=o*9}}};
   if(s===0)for(const o of[-.1,.1])mk(o,6,k*.55,5);else if(s===1)for(const o of[-.08,0,.08])mk(o,11,k*.4,4);else if(s===2)for(const o of[-.15,0,.15])mk(o,5,k*.5,5);else for(const o of[-.08,.08])mk(o,7,k*.55,5)}},
 heavy:{N:(p,m,a,k)=>{ENT.push({k:'obd',o:p.id,t:90,T:90,x:p.x+Math.cos(a)*60,y:p.y+Math.sin(a)*60,a,n:0});sfx('blockshield',.6)},
  F:(p,m,a,k)=>{if(p.oLz>frame)return;p.oLz=frame+LZ_TELE+8+LZ_GAP;chRay(p,{T:LZ_TELE+8,tele:LZ_TELE,warn:1,w:8,len:900,dmg:8*k,ev:99,kb:8,stun:24,c:'#ffd23a',a,follow:0});for(const d of myE(p,'odr')){const q=nearFoe(p.id,d.x,d.y,1500);if(q)chRay(p,{T:LZ_TELE+8,tele:LZ_TELE,warn:1,w:7,len:900,dmg:6*k,ev:99,kb:8,stun:24,c:'#ffd23a',a:Math.atan2(q.y-d.y,q.x-d.x),follow:0,x:d.x,y:d.y})}sfx('se_lazer00',.6)},
  B:(p,m,a,k)=>{for(let i=0;i<12;i++){spawnH(p,m,a+i*TAU/12,k,{spd:3,r:7,k:.15,life:200});const b=B[B.length-1];if(b&&b.owner===p.id){b.wav=.08;b.ph=i;b.c='#ffb04a'}}}},
 melee:{jab:{start:5,act:4,rec:14,range:46,arc:6.2832,dmg:5,kb:9,stun:20},lunge:{start:8,act:8,rec:18,range:110,arc:.6,dmg:8,kb:10,stun:26},strong:{start:12,act:6,rec:28,range:72,arc:6.2832,dmg:13,kb:16,stun:40,charge:40}},
 spell:{name:'Secret Ceremony「Four Seasons at Once」',loop:200,fn(p,o,k){if(k%6===0)for(let i=0;i<4;i++){addB(p,k*.05+i*TAU/4,3.4,0,null,220);const b=B[B.length-1];if(b&&b.owner===p.id){b.c=SEAC[i];if(i!==1)b.sea=[1,0,3,4][i]}}}},
 inp(p,o,I){const h=!!I.b.heavy,e=h&&!p.oHp;p.oHp=h; // rayon droit : 1 s de pause entre deux rayons
  if(h&&p.oLz>frame&&p.state==='idle'&&rel(I,p)==='F'){if(e)cdT(p,'LASER',p.oLz);return{...I,b:{...I.b,heavy:false}}}
  return I},
 special(p){if(!chCool(p,40))return;ENT.push({k:'odr',o:p.id,t:1800,x:p.x,y:p.y,hp:50,hc:{}});capE(p,'odr',3);RINGS.push({x:p.x,y:p.y,r:0,m:40,t:12,c:'#ffd23a'});sfx('gapopening',.6)},
 special2(p){const D=myE(p,'odn');
  if(D.length===1&&D[0].i===0&&!p.oMai){ENT.push({k:'odn',o:p.id,t:300,i:1,x:p.x,y:p.y,hc:{},cd:30,n:0});D[0].t=Math.max(D[0].t,300);p.oMai=1;sfx('taikorouge',.8);return}
  if((p.chC2||0)>frame)return cdT(p,'DANCERS',p.chC2);for(const e of D)e.t=0;ENT.push({k:'odn',o:p.id,t:300,i:0,x:p.x,y:p.y,hc:{},cd:30,n:0});p.oMai=0;p.chC2=frame+600;sfx('taikobleu',.8)},
 dashF(p){const D=myE(p,'odr');if(!D.length)return;const v=Math.hypot(p.vx,p.vy)||1;let best=null,bd=.2;for(const d of D){const dx=d.x-p.x,dy=d.y-p.y,l=Math.hypot(dx,dy);if(l<40)continue;const s=(dx*p.vx+dy*p.vy)/(l*v);if(s>bd){bd=s;best=d}}
  if(best){RINGS.push({x:p.x,y:p.y,r:0,m:36,t:12,c:'#ffd23a'});p.x=best.x;p.y=best.y;p.vx*=.3;p.vy*=.3;p.inv=Math.max(p.inv,8);RINGS.push({x:p.x,y:p.y,r:0,m:36,t:12,c:'#fff'});sfx('teleportation',.6)}},
 tick(p){p.chM=((frame/300)|0)%4},
 cpu(p,o,I,d){if((p.chCD||0)<=frame&&myE(p,'odr').length<3&&rng()<.01)I.b.next=true;else if((p.chC2||0)<=frame&&d<400&&rng()<.02)I.b.prev=true;if(myE(p,'odr').length>=2&&rng()<.4)I.b.focus=true},
 draw(q,R){EMB.okina(q,R);mvFx(q,R,{jab:['ring','#ffd23a',W_.drum],lunge:['arc','rgba(255,210,60,.35)',W_.drum],strong:['ring',SEAC[q.chM|0],W_.drum]})}});});
