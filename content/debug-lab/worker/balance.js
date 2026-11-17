'use strict';
/**
 * Balance lab (runs in the sandbox after driver.js). labBalance(cfg) plays one CPU match between the given characters and measures,
 * per fighter: damage dealt/taken and by SOURCE (melee:<move>, heavy, shot, spell, item:<name>, bullets/other), KOs and deaths with the
 * cause of the killing blow, parries, spells, items picked, time alive, stocks; per match: winner, length, timeout, first blood, comeback.
 * cfg: {seed, chars:[key...], cpu, items, lives (index), map, frames}
 */
const LBS = { on: false, S: null, hitF: [], imk: null, kit: new Map(), mw: new WeakMap() };
/** Bullets: their move object is often created inline, so it is named by the kit code that pushed the bullet (B.push hooked per match). */
function lbHookB() { if (B.__lb) return; const push = B.push; B.push = function (...x) { if (LBS.on) for (const b of x) if (b && b.m && typeof b.m === 'object' && !LBS.mw.has(b.m)) LBS.mw.set(b.m, lbWhere()); return push.apply(this, x); }; B.__lb = 1; }
function lbSrc(a, m, heavy) {
  if (!LBS.imk) { LBS.imk = new Map(); for (const k in IM) LBS.imk.set(IM[k], k); }
  if (HITMEL && a && a.mvName) return 'melee:' + a.mvName;
  if (m === IM.beam) return 'ko-laser'; if (LBS.imk.has(m)) return 'item:' + LBS.imk.get(m);
  if (m && typeof m === 'object' && !LBS.mw.has(m) && /updBullets/.test(new Error().stack)) return 'reflected bullet'; // parried bullets fly with a copied, boosted move
  const d = m && m.dmg || 0; return (a && a.state === 'spell' ? 'spell' : heavy ? (d < 3 ? 'beam/multi-hit' : 'heavy') : 'shot') + (lbKit(a, m) || (m && typeof m === 'object' && LBS.mw.get(m)) || lbWhere());
}
/** Name of a move object inside the attacker's kit (e.g. "heavy.m"), found by identity; cached per kit. */
function lbKit(a, m) { if (!a || !m) return ''; const C = chOf(a); if (!C) return ''; let M = LBS.kit.get(C);
  if (!M) { M = new Map(); const walk = (o, n, d) => { if (!o || typeof o !== 'object' || d > 3) return; if ('dmg' in o && !M.has(o)) M.set(o, n); for (const k in o) if (k !== 'k' && typeof o[k] === 'object') walk(o[k], n ? n + '.' + k : k, d + 1); }; walk(C, '', 0); LBS.kit.set(C, M); }
  return M.has(m) ? ' [' + M.get(m) + ']' : ''; }
/** Where in the code an attack comes from: the first stack frame in a character/item/content file (else the first non-generic one), as [file:line fn]. */
function lbWhere() { const F = []; for (const l of String(new Error().stack).split('\n').slice(2)) { const m = l.match(/at (?:([\w$.]+) )?\(?.*?([\w/-]+)\.js[^:]*:(\d+)/); if (m && !/debug-lab/.test(m[2])) F.push(m); }
  const g = m => !/^(chHitQ|updBullets|Object\.hit|hit|spawnH|step|fireHeavy|fireLight|atk|Array\.push)$/.test(m[1] || ''), f = F.find(m => /characters\/|items\/|content\//.test(m[2]) && g(m)) || F.find(g);
  return f ? ' [' + f[2].split('/').pop() + ':' + f[3] + (f[1] ? ' ' + f[1].replace(/^Object\./, '') : '') + ']' : ''; }
{ const H0 = hit; hit = (v, a, dx, dy, m, mult, heavy) => { if (!LBS.on || !v) return H0(v, a, dx, dy, m, mult, heavy); const hp = v.hp, r = H0(v, a, dx, dy, m, mult, heavy), d = hp - v.hp;
  if (d > 0 && a && a !== v && LBS.S[a.id] && LBS.S[v.id]) { const k = lbSrc(a, m, heavy), A = LBS.S[a.id]; A.out += d; A.src[k] = (A.src[k] || 0) + d; LBS.S[v.id].in += d; LBS.hitF[v.id] = (LBS.hitF[v.id] || 0) + d; v.__lbS = k; v.__lbF = frame; v.__lbA = a.id; }
  return r; }; }
{ const K0 = ko; ko = (p, why) => { if (LBS.on && p && p.state !== 'dead' && LBS.S[p.id] && !(p.fx && p.fx.phoenix > 0)) { const S = LBS.S, recent = p.__lbF > frame - 180, by = recent ? p.__lbA : p.lastByF > frame - 180 ? p.lastBy : -1, cause = recent ? p.__lbS : by >= 0 ? 'bullets/other' : 'self/stage';
  S[p.id].deaths++; S[p.id].deathBy[cause] = (S[p.id].deathBy[cause] || 0) + 1; if (why) S[p.id].why[why] = (S[p.id].why[why] || 0) + 1; if (by >= 0 && S[by] && by !== p.id) { S[by].kos++; S[by].koWith[cause] = (S[by].koWith[cause] || 0) + 1; } if (!LBS.fb) { LBS.fb = 1; if (by >= 0 && S[by]) S[by].firstBlood = 1; } }
  return K0(p, why); }; }
{ const P0 = parryFx; parryFx = (q, ...a) => { if (LBS.on && q && LBS.S[q.id]) LBS.S[q.id].parries++; return P0(q, ...a); }; }
{ const S0 = startSpell; startSpell = (p, o, u) => { if (LBS.on && p && LBS.S[p.id]) LBS.S[p.id][u ? 'ults' : 'spells']++; return S0(p, o, u); }; }
{ const G0 = give0; give0 = (p, k) => { if (LBS.on && p && LBS.S[p.id]) { LBS.S[p.id].items++; LBS.S[p.id].itemK[k] = (LBS.S[p.id].itemK[k] || 0) + 1; } return G0(p, k); }; }
function labBalance(c) {
  LAB.rng = (c.seed >>> 0) || 1; LAB.issues = []; LAB.seen.clear(); LAB.ev = []; NET = null; LBS.fb = 0; LBS.hitF = [];
  nP = c.chars.length; nH = 0; cpuLv = c.cpu || 9; itemsOn = !!c.items; for (const k in itemOn) itemOn[k] = true; maxC = 1; stI = c.lives ?? 2; TIMER = c.timer || 0; mapI = c.map || 0; NERV = 10; TEAMS = false; COMP = false;
  try { start('game'); seed = (c.seed % 100000) | 1; P.forEach((p, i) => { p.shotT = CH0 + CHR.findIndex(x => x.k === c.chars[i]); const C = chOf(p); p.spI = C.spI; C.init && C.init(p); }); }
  catch (e) { labIssue('crash', e, { phase: 'start' }); return { err: 1, issues: LAB.issues }; }
  LBS.S = P.map((p, i) => ({ char: c.chars[i], out: 0, in: 0, src: {}, kos: 0, deaths: 0, deathBy: {}, koWith: {}, why: {}, parries: 0, spells: 0, ults: 0, items: 0, itemK: {}, alive: 0, firstBlood: 0, behind: 0 }));
  lbHookB(); LBS.on = true; const prev = P.map(p => p.hp), cap = c.frames || 10800; let f = 0;
  try { while (f < cap && winner < 0) { LBS.hitF = []; step(); f++;
      P.forEach((p, i) => { const d = prev[i] - p.hp, h = LBS.hitF[i] || 0, S = LBS.S[i]; if (d > h + .01 && p.state !== 'dead') { const r = d - h, by = p.lastByF > frame - 60 ? p.lastBy : -1; S.in += r; if (by >= 0 && by !== i && LBS.S[by]) { LBS.S[by].out += r; LBS.S[by].src['bullets/other'] = (LBS.S[by].src['bullets/other'] || 0) + r; } }
        prev[i] = p.hp; if (p.state !== 'dead') S.alive++; });
      if (f % 30 === 0) { const st = P.map(p => p.stocks), mx = Math.max(...st); P.forEach((p, i) => { if (p.stocks < mx) LBS.S[i].behind = 1; }); labCheck(); } } }
  catch (e) { labIssue('crash', e); }
  LBS.on = false; const S = LBS.S;
  return { chars: c.chars, winner: winner >= 0 && winner < nP ? winner : -1, frames: f, timeout: winner < 0, stocksLeft: P.map(p => p.stocks), stats: S, comeback: winner >= 0 && S[winner] ? S[winner].behind : 0, issues: LAB.issues };
}
