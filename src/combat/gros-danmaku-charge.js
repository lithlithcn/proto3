'use strict';
// ---- gros danmaku chargé : maintenir Gros danmaku → niveaux 1-3
DEFER(()=>{{const U0=updP;updP=(p,o,I)=>{const b=I&&I.b;if(b&&!p.cpu&&p.state!=='dead'){const held=!!b.heavy,was=!!p.hHeld;p.hHeld=held;
  if(held&&!was&&!b.parry&&!(p.rifle>0)){p.hch=frame;b.heavy=false;if(p.buf)p.buf.heavy=undefined}else if(held&&p.hch!==undefined){b.heavy=false;if(p.buf)p.buf.heavy=undefined;const k=frame-p.hch;if(k===8)p.chS=sfx('charge',.5);if(k===60)txt(p.x,p.y-38,'LV 2','#ffd23a',13);if(k===120){sfx('aimreal',1.7);txt(p.x,p.y-38,'LV 3','#ff7ce0',15)}}
  else if(!held&&p.hch!==undefined){const k=frame-p.hch;p.hch=undefined;if(p.chS&&k<120){try{p.chS.stop()}catch(e){}}p.chS=null;p.hLv=k>=120&&p.spirit>=15?3:k>=60?2:1;if(p.hLv===3)p.spirit-=15;b.heavy=true;if(p.prev)p.prev.heavy=false;if(p.buf)p.buf.heavy=frame}}
 return U0(p,o,I)}}});
DEFER(()=>{{const A0=spawnH;spawnH=(p,m,a,pm,o)=>{A0(p,m,a,pm,o);const lv=p.hLv||1;if(lv<2||p.state!=='atk')return;const b=B[B.length-1];if(!b||b.owner!==p.id)return;
 if(lv===2){for(const d of[-.22,.22])A0(p,m,a+d,pm*.8,o);b.r*=1.2}
 else{b.r*=1.5;b.mult*=1.4;b.c='#ff7ce0';for(let i=1;i<8;i++)A0(p,m,a+i*TAU/8,pm*.7,o);sfx('strong_effect_attack',.4);RINGS.push({x:p.x,y:p.y,r:0,m:80,t:16,c:'#ff7ce0'})}}}});
DEFER(()=>{{const S2=startAtk;startAtk=(p,n)=>{const r=S2(p,n);if(!/^heavy/.test(n))p.hLv=1;return r}}});
