'use strict';
/**
 * Declared modes: a mini-game, boss fight, story chapter... lives in its own folder content/<name>/ and calls defMode({...}).
 * The engine gives it, without touching the rest of the game:
 *   - a 60 Hz step() (same fixed step as a match), its own render(ctx) on a cleared screen, the menu events (nav),
 *   - player controls through modeInput(slot) (keyboard / pad / phone joystick + buttons), the phone touch layer (touch:true),
 *   - an entry in the main hub, tile EXTRAS (list of every declared mode).
 * defMode({ id, name, desc, color, touch, enter(), step(), render(ctx), nav(ev) => true if handled, exit() })
 *   nav events: up/down/left/right/ok/back/reset/start/sel. Not handled 'back'/'start'/'sel' => closeMode() (back to the hub).
 * The game's mode variable is 'x:'+id while it runs (never collides with the original screens).
 */
const MODEX = {};
function defMode(m) { if (!m || !m.id) throw new Error('defMode: id required'); m.key = 'x:' + m.id; MODEX[m.key] = m; return m; }
function openMode(id) { const m = MODEX['x:' + id]; if (!m) throw new Error('unknown mode ' + id); paused = false; mode = m.key; if (m.enter) m.enter(); }
function closeMode() { const m = MODEX[mode]; mode = 'menu'; if (m && m.exit) m.exit(); }
/** Controls of local slot 0..3: keyboard set slot (0-1), pad n°slot, phone joystick/buttons for slot 0. {x,y in -1..1, b:{shot,heavy,melee,dash,parry,burst,spell,focus}} */
function modeInput(slot) {
  const I = { x: 0, y: 0, b: {} }, m = KB[slot];
  if (m) { I.x = kd(m.right) - kd(m.left); I.y = kd(m.down) - kd(m.up); for (const k of BTN) I.b[k] = kd(m[k]); }
  const g = pads()[slot], M = PAD[slot];
  if (g && M) { let ax = g.axes[0] || 0, ay = g.axes[1] || 0; if (Math.hypot(ax, ay) < .25) ax = ay = 0;
    const bt = n => g.buttons[n] && (g.buttons[n].pressed || g.buttons[n].value > .3);
    if (bt(12)) ay = -1; if (bt(13)) ay = 1; if (bt(14)) ax = -1; if (bt(15)) ax = 1; if (ax || ay) { I.x = ax; I.y = ay; }
    for (const k of BTN) { const v = M[k]; if (Array.isArray(v) ? v.every(bt) : bt(v)) I.b[k] = true; } }
  if (slot === 0 && TCH.on) { if (TCH.joy) { I.x = TCH.jx; I.y = TCH.jy; } for (const k in TCH.b) I.b[k] = true; }
  const l = Math.hypot(I.x, I.y); if (l > 1) { I.x /= l; I.y /= l; } return I;
}
// render: a declared mode draws on a cleared screen (same setup as the original character-select screen)
{const R0=render;render=()=>{const m=MODEX[mode];if(!m)return R0();musTick();if(OC)OC.clearRect(0,0,W,H);if(GLR){GLR.begin();GLR.flush()}ctx=CTX0;ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);setFilter('');hot=[];ctx.save();m.render(ctx);ctx.restore();if(m.touch)tDraw()}}
{const N0=nav;nav=ev=>{const m=MODEX[mode];if(!m)return N0(ev);if(m.nav&&m.nav(ev))return;if(ev==='back'||ev==='start'||ev==='sel'){sfx('cancel00');closeMode()}}}
// hub: one more tile (EXTRAS) at the end of the bottom row, listing the declared modes
HUB.push({k:'extra',t:'EXTRAS',c:'#3affc8',d:'Mini-games and extra modes.',f:()=>openSub('EXTRAS',()=>Object.values(MODEX).map(m=>({t:()=>m.name||m.id,f:()=>openMode(m.id)})))});
{const e=HUB.length-1;HUBG[e-1].r=e;HUBG[e]={u:2,l:e-1,r:3};HUBG[3].l=e}
{const I0=hubIcon;hubIcon=(k,x,y,s,c)=>{if(k!=='extra')return I0(k,x,y,s,c);ctx.save();ctx.translate(x,y);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=Math.max(2,s*.09);ctx.lineCap='round';
  ctx.beginPath();ctx.roundRect(-s*.45,-s*.22,s*.9,s*.46,s*.2);ctx.stroke();ctx.beginPath();ctx.moveTo(-s*.28,0);ctx.lineTo(-s*.1,0);ctx.moveTo(-s*.19,-s*.09);ctx.lineTo(-s*.19,s*.09);ctx.stroke();
  for(const [a,b] of [[.16,-.04],[.28,.06]]){ctx.beginPath();ctx.arc(s*a,s*b,s*.05,0,TAU);ctx.fill()}ctx.restore()}}
