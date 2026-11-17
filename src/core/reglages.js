'use strict';
// ================= RÉGLAGES : modifie ici pour tester les sensations =================
const T={
 MAP_W:2000,MAP_H:1350,EDGE:140,VIEW_H:600,      // carte, zone de bord, hauteur visible (unités monde)
 HP:100,STOCKS:3,RESPAWN_INV:120,
 SPEED:4.4,FOCUS_SPEED:2,
 BODY_R:16,CORE_R:3,GRAZE_R:27,                   // corps (mêlée) / cœur (balles) / graze
 DASH_CHARGES:3,DASH_COST:1,DASH_T:11,DASH_V:11,DASH_REGEN:0.0075,DASH_REGEN_DELAY:30,DASH_LAG:8, // 3 dashs, recharge lente (≈1,3 s/charge)
 DASH_REGEN_IDLE:2.2,RUN_SPEED:6.4,SLIDE_T:20,DASH_GRAZE:0.05,DASH_PARRY:1,BRAKE_MIN:5,RECOIL:{N:2,F:1,B:5},     // recharge x2,2 sans tirer · course · glissade
 POWER_MAX:4,POWER_GRAZE:0.04,POWER_HIT:0.35,      // puissance des tirs (monte au graze, baisse quand touché)
 SPIRIT_MAX:100,GRAZE_GAIN:1.2,SPELL_COST:100,CANCEL_COST:25,SHOT_GAIN:0.5,HIT_GAIN:0.3,HURT_GAIN:0.5, // Spirit : graze + coups donnés/reçus
 SPELL_CUTIN:50,SPELL_T:300,ULT_T:360,CAPTURE_GAIN:50,                                // spell card (cut-in, durée, bonus de capture)
 BURST_MAX:100,BURST_REGEN:0.08,BURST_HURT:0.6,BURST_START:8,BURST_REC:30,BURST_R:160,BURST_GAIN:20, // burst
 PARRY_ACT:7,PARRY_WHIFF:26,PARRY_STUN:50,PARRY_R:30,                      // parry (Rivals) : WHIFF = récupération si raté
 PIPS:3,PIP_DELAY:180,PIP_REGEN:90,WALL_MIN:3.5,  // garde murale
 ITEM_EVERY:420,ULT_EVERY:2100,ITEM_WARN:120,ITEM_CAP:60,LW_CAP:180,ITEM_R:44,BUFF_T:600,
 DI_MAX:0.35,SDI:1.2,STUN_DECAY:0.82,KB_SCALE:1.3,HITSTOP:4,
 LIGHT_CD:6,LIGHT_CD_F:4,MAX_B:900,CPU_PARRY:0.3,
 VOL:0.8,SFX_DMG_MIN:0.3,SFX_DMG_MAX:1.3,PARRY_FREEZE:13,BEAM_PARRY:16,EDGE_DMG:0.04,COMBO_WIN:8 // zone rouge : -2,4 PV/s · combo manette : 2 boutons à moins de 8 frames d'écart // son : volume global, volume du son de dégât (vie pleine -> vie basse)
};
const MAPS=[{name:'Large',w:2000,h:1350,edge:140},{name:'Screen (fixed camera)',w:0,h:0,edge:70}];
// Coups (frames à 60 fps). start = lancement, act = actif, rec = récupération, arm = distance avant que la lourde soit dangereuse
const MOVES={tslam:{start:32,act:5,rec:30,range:56,arc:2.2,dmg:6,kb:10,stun:30},grab:{start:4,act:5,rec:9,range:46,arc:2.2,dmg:0,kb:0,stun:0},
 heavyN:{start:10,rec:16,spd:7,r:11,dmg:9,kb:9,stun:30,arm:70},
 heavyF:{start:8,rec:20,spd:11,r:8,dmg:7,kb:7,stun:24,arm:60},          // vers l'adversaire : rapide
 heavyB:{start:14,rec:14,spd:3.5,r:17,dmg:11,kb:10,stun:34,arm:45,life:300}, // en s'éloignant : lente, zoning
 jab:{start:4,act:4,rec:10,range:34,arc:1.6,dmg:5,kb:5,stun:20},
 lunge:{start:7,act:5,rec:18,range:40,arc:1.2,dmg:8,kb:8,stun:26,move:9},
 strong:{start:6,act:5,rec:26,range:48,arc:1.8,dmg:12,kb:14,stun:38,charge:40},
 dashatk:{start:3,act:6,rec:16,range:40,arc:1.4,dmg:7,kb:9,stun:24,keep:.94}         // attaque en dash (garde l'élan)
};
// Corps à corps selon le type de tir (jab · lunge = vers l'adversaire · strong = Focus+Mêlée maintenue · dashatk = pendant un dash)
// kb négatif = attire · multi = touche plusieurs fois · spawn = anneau de balles · clear = efface les petites balles autour
const MELEE=[
 {}, // Éventail : coups de base
 {jab:{start:3,act:9,rec:10,range:36,arc:.9,dmg:2,kb:2,stun:12,multi:1,every:3},   // Aiguilles : rafale
  lunge:{start:6,act:4,rec:16,range:78,arc:.45,dmg:8,kb:9,stun:26,move:6},          // estoc longue portée
  strong:{start:8,act:4,rec:28,range:72,arc:.5,dmg:13,kb:17,stun:40,charge:40},     // percée
  dashatk:{start:2,act:8,rec:14,range:44,arc:.8,dmg:6,kb:7,stun:22,keep:.97}},      // traversée
 {jab:{start:5,act:6,rec:12,range:48,arc:2.6,dmg:5,kb:-5,stun:22},                  // Amulettes : balayage qui attire
  lunge:{start:8,act:5,rec:18,range:40,arc:1.4,dmg:7,kb:7,stun:24,move:7,spawn:1},  // sceau
  strong:{start:10,act:8,rec:24,range:58,arc:6.2832,dmg:11,kb:13,stun:36,charge:40},   // tourbillon 360°
  dashatk:{start:3,act:10,rec:16,range:40,arc:6.2832,dmg:6,kb:8,stun:22,keep:.92}},    // vrille
 {jab:{start:7,act:4,rec:14,range:38,arc:1.6,dmg:8,kb:11,stun:26},                  // Barrage : poussée lourde
  lunge:{start:9,act:6,rec:22,range:44,arc:1.2,dmg:11,kb:14,stun:32,move:13},       // charge d'épaule
  strong:{start:12,act:6,rec:30,range:82,arc:6.2832,dmg:14,kb:16,stun:40,charge:40,clear:130}, // onde de choc
  dashatk:{start:4,act:6,rec:20,range:44,arc:1.4,dmg:10,kb:13,stun:28,keep:.9}}];   // plaquage
// Types de tir légers (switch avec Tir précédent / suivant). f = focus
const SHOTS=[ // lv = niveau de puissance 1..4 : le motif évolue, dégâts totaux ~+20 %/niveau
 {name:'Spread',cd:6,f:(p,a,f,pm,lv)=>{const n=(f?[2,2,3,4]:[3,4,5,7])[lv-1],w=f?.04+.02*lv:.34+.08*lv,d=pm*(1+.2*(lv-1))*(f?2.9:3.4)/n;
  for(let i=0;i<n;i++)lb(p,a+(i/(n-1)-.5)*w,f?11:9,d,4,110)}},
 {name:'Needles',cd:3,f:(p,a,f,pm,lv)=>{const n=Math.min(lv,f?3:4),px=-Math.sin(a),py=Math.cos(a),j=f?0:(rng()-.5)*.14,d=pm*.6*(1+.2*(lv-1))*(1+.3*(n-1))/n;
  for(let i=0;i<n;i++){const k=(i-(n-1)/2)*(f?5:9),b=lb(p,a+j,14,d,3,80);if(b){b.x+=px*k;b.y+=py*k}}}},
 {name:'Amulets',cd:14,f:(p,a,f,pm,lv)=>{const n=(f?[1,1,2,2]:[2,2,3,4])[lv-1],w=f?.3:1,d=pm*1.3*(1+.2*(lv-1))*(f?1:2)/n;
  for(let i=0;i<n;i++){const b=lb(p,a+(n>1?(i/(n-1)-.5)*w:0),5,d,5,102);if(b)b.home=(f?.05:.03)+.004*lv}}},
 {name:'Barrage',cd:22,f:(p,a,f,pm,lv)=>{const n=(f?[3,3,4,5]:[5,6,7,9])[lv-1],px=-Math.sin(a),py=Math.cos(a),d=pm*1.2*(1+.2*(lv-1))*(f?3:5)/n;
  for(let i=0;i<n;i++){const k=(i-(n-1)/2)*16,b=lb(p,a,4,d,5,170);if(b){b.x+=px*k;b.y+=py*k}}}}];
function lb(p,a,sp,dmg,r,life){if(B.length>=T.MAX_B)return null;
 const b={x:p.x+Math.cos(a)*18,y:p.y+Math.sin(a)*18,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,owner:p.id,heavy:0,dmg,life,dead:0,gr:0,home:0};tagB(p,b);B.push(b);return b}
const COLS=['#ff4a5a','#ffd23a','#4ab3ff','#5cff8a','#ff8a2a','#c070ff','#3ae0e0','#ff6ec7'],LCOLS=['#ff9aa4','#ffe98a','#a6d8ff','#b0ffc8','#ffc08a','#e0b0ff','#a0f4f4','#ffb0e0'];
