import type { HookDef } from '@kernel';
import { CARD_ULT, PS, T, charOf, combatOf, itemActive, itemPool } from '@pack/combat/api';
import { COLS, LCOLS } from '../colors';
import { big, burst, crack, flash, juiceOf, tickJuice, txt, type Juice } from './state';

/** Event → presentation effects. Each hook is a line-for-line copy of the juice that the legacy sim sites triggered (docs/game/mechanics/render.md lists the source line of each). */
// Hooks run inside the sanitized sim window (no Math.random/sin/hypot): they only journal the event; handlers run later from syncJuice, in order, between the frame ticks.
/** Journal of one world; a headless run (no renderer draining it) never grows past 4096 events. */
const jq = (w: Parameters<typeof juiceOf>[0]): { ev: string; gf: number }[] => { const q = juiceOf(w).q; if (q.length > 4096) q.splice(0, 2048); return q; };
type Ev = Record<string, number | boolean | undefined> & { gf: number };
const H: Record<string, (j: Juice, e: never) => void> = {};
export const snd = (j: Juice, gf: number, n: string, v = 1, r = 1, k?: string): void => { j.SND.push(k ? { n, v, r, gf, k } : { n, v, r, gf }); if (j.SND.length > 256) j.SND.splice(0, 128); };
const on = <P>(id: string, event: string, f: (j: Juice, p: P & { gf: number }) => void): HookDef<P> => { H[event] = f as never; return { id, event, phase: 'after', run(w, ev) { const s = combatOf(w), p = ev.payload as Record<string, number>; const q = p['p'] ?? p['victim'], at = p['attacker']; jq(w).push({ ev: event, gf: s.gf, x: q !== undefined ? s.x[q]! : 0, y: q !== undefined ? s.y[q]! : 0, ...p, px: q !== undefined ? s.x[q]! : 0, py: q !== undefined ? s.y[q]! : 0, pa: q !== undefined ? s.aim[q]! : 0, pcpu: q !== undefined ? s.cpu[q]! : 0, ach: at !== undefined && at >= 0 ? charOf(w, s, at).name : '' } as never); } }; };
const col = (p: number): string => COLS[(p < 0 ? 0 : p) % 8]!;

interface HitP { victim: number; attacker: number; dmg: number; combo: number; heavy: boolean; x: number; y: number; dx: number; dy: number; ach: string }
const onHit = on<HitP>('juice-hit', 'combat:hit', (j, e) => {
  const { x, y, dmg, combo } = e, a = e.attacker, c = col(a), kn = Math.hypot(e.dx, e.dy) || 1;
  if (e.ach === 'Okina' && a !== e.victim) j.chG[a] = Math.min(100, (j.chG[a] ?? 0) + dmg * 0.8); // legacy hit wrapper (line 4706): shotT CH0+5
  j.kx += e.dx / kn * Math.min(14, dmg); j.ky += e.dy / kn * Math.min(14, dmg); j.zk = Math.min(0.3, j.zk + dmg * 0.008);
  if (dmg >= 7) { j.WAVES.push({ x, y, t: 12, T: 12, spd: 10, th: 18, inv: 1 }); j.chroma = Math.max(j.chroma, dmg); }
  if (dmg >= 10) { j.bright = Math.max(j.bright, 0.6); j.chroma = Math.max(j.chroma, 14); j.bgF = { c, t: 12 }; j.focusL = Math.max(j.focusL, 0.5); j.zblur = Math.max(j.zblur, 0.04); }
  if (dmg >= 13) { j.invF = Math.max(j.invF, 3); j.focusL = Math.max(j.focusL, 1); j.zblur = Math.max(j.zblur, 0.08); flash(j, 0.3, c); }
  j.shake = Math.min(28, j.shake + dmg * 1.6); burst(j, x, y, c, 8 + dmg | 0);
  if (dmg >= 7) for (let i = 0, o = j.rnd() * 6.2832; i < 8; i++) j.LINES.push({ x, y, a: o + i * 6.2832 / 8 + j.rnd() * 0.3, t: 12, T: 12, len: 50 + dmg * 6 });
  if (dmg >= 14) j.WAVES.push({ x, y, t: 10, T: 10, spd: 9, th: 14, inv: 1 });
  if (combo > 1) txt(j, x, y - 30, combo + ' HITS', '#fff', 14 + Math.min(16, combo * 2));
  if (combo >= 3) { big(j, combo + ' COMBO', c, 38 + Math.min(34, combo * 4), 'c' + a); j.borderF = { c, t: 18 }; j.chroma = Math.max(j.chroma, 8 + combo * 2); j.bright = Math.max(j.bright, 0.2 + combo * 0.05); }
});
const onBreak = on<{ victim: number }>('juice-spell-break', 'combat:spell-break', j => { big(j, 'SPELL BREAK', '#f8f', 56); j.invF = Math.max(j.invF, 3); j.chroma = Math.max(j.chroma, 16); });
const onPip = on<{ p: number; pips: number; x: number; y: number }>('juice-wall-pip', 'combat:wall-pip', (j, e) => { txt(j, e.x, e.y - 46, 'WALL ' + e.pips + '/' + T.PIPS, '#f66'); });

/** fx-tick: also carries the per-player trails legacy physics() pushed (dash afterimages, ejection trail) — only on frames the players moved. */
/** Legacy ENDK (line 2006): when two survivors remain, both on their last stock, sounds swell up to +5 % as the weaker one nears 0 HP. Teams count as one side (TODO lot 4: team ids once team modes are ported). */
function endK(j: Juice, e: { pw: number[]; hp: number[]; tm: number }): void {
  let n = 0, last = true, mh: number = T.HP; for (let p = 0; p * 2 < e.pw.length; p++) { const st = e.pw[p * 2 + 1]!; if (st <= 0) continue; n++; if (st !== 1) last = false; mh = Math.min(mh, e.hp[p]!); }
  const tg = !e.tm && n === 2 && last ? 1 + 0.05 * Math.min(1, Math.max(0, (40 - mh) / 40)) : 1; j.endk += (tg - j.endk) * 0.02;
}
H['combat:fx-tick'] = ((j: Juice, e: { gf: number; wt: number; sk: number; ia: number[]; tr: number[]; pos: number[]; cn: string[]; pw: number[]; hp: number[]; tm: number }) => {
  for (let p = 0; p * 2 < e.pw.length; p++) { const pw = e.pw[p * 2]!, st = e.pw[p * 2 + 1]!, o = j.pw[p]; if (pw >= 0) { if (o && Math.floor(pw + 1e-9) > Math.floor(o[0] + 1e-9)) snd(j, e.gf, 'bonus', 0.7); if (o && st > o[1]) snd(j, e.gf, 'bonus', 0.8); j.pw[p] = [pw, st]; } } // wrapper line 2735
  { const k = e.gf + e.wt * 1e7; if (k === j.lastGf) return; j.lastGf = k; } // after the match ends gf stops but the effects keep ticking (winT counts)
  if (e.gf === 1) snd(j, e.gf, 'ready', 0.9); else if (e.gf === 55) { snd(j, e.gf, 'se_cardget', 0.8); snd(j, e.gf, 'ok00', 0.7); } // match intro (legacy drawIntro, line 3990)
  tickJuice(j, !e.sk); endK(j, e);
  if (!e.sk) { j.ia = e.ia; j.SMR = j.SMR.filter(m => --(m['t'] as number) > 0); } // legacy SMR tick (step wrapper, line 2289)
  if (!e.sk) e.ia.forEach((a, p) => { const l = j.acts[p]; if (l?.length) j.acts[p] = l.filter(x => a >= 0 && e.gf - x.f < x.T + 30 && !(e.gf - x.f > 90 && !a)); }); // legacy actsPrune (step wrapper, line 2828)
  for (let p = 0; p * 2 < e.pos.length; p++) if ((j.nds[p] ?? 0) > e.gf && e.cn[p] === 'Nue' && e.gf % 2 === 0 && j.FX.length < 480) j.FX.push({ x: e.pos[p * 2]!, y: e.pos[p * 2 + 1]!, vx: 0, vy: 0, t: 18, c: '#1a1028' }); // Nue dash shadow (tick, line 4458)
  for (let p = 0; p * 2 < e.pos.length; p++) { const c = j.cc[p] ?? 0; if (c && e.gf - j.ccF[p]! > 18) { if (c >= 5) txt(j, e.pos[p * 2]!, e.pos[p * 2 + 1]! - 52, 'CANCEL x' + c, '#ffd23a', c >= 20 ? 18 : 14); j.cc[p] = 0; } } // step wrapper line 2398, after stepFx
}) as never;
const onTick: HookDef<{ gf: number }> = { id: 'juice-tick', event: 'combat:fx-tick', phase: 'after', run(w, ev) {
  const s = combatOf(w), tr: number[] = [];
  const pos: number[] = [], cn: string[] = [], pw: number[] = [], hp: number[] = []; for (let p = 0; p < s.n; p++) { pos.push(s.x[p]!, s.y[p]!); cn.push(charOf(w, s, p).name); pw.push(s.state[p] === PS.dead ? -1 : s.power[p]!, s.stocks[p]!); hp.push(s.state[p] === PS.dead ? T.HP : s.hp[p]!); }
  const sk = (ev.payload as { sk?: number }).sk ?? 0, ia: number[] = []; if (!sk) for (let p = 0; p < s.n; p++) ia.push(s.state[p] === PS.dead ? -1 : itemActive(w, s, p) ? 1 : 0);
  jq(w).push({ ev: 'combat:fx-tick', gf: ev.payload.gf, wt: (ev.payload as { wt?: number }).wt ?? 0, sk, ia, tr, pos, cn, pw, hp, tm: s.teams } as never);
} };
type Pp = { p: number; px: number; py: number; pa: number; pcpu: number };
const onGraze = on<Pp & { x: number; y: number; k: number; streak: number }>('juice-graze', 'combat:graze', (j, e) => {
  if (e.gf - (j.sl['graze'] ?? -99) > 2) { j.sl['graze'] = e.gf; snd(j, e.gf, 'graze', 0.7, e.k > 1 ? 0.85 : 1); }
  burst(j, e.x, e.y, '#bdf', 2); if (e.k > 1) burst(j, e.x, e.y, '#fff', 4);
  if (j.GZ.length < 60) j.GZ.push({ x: e.px, y: e.py, p: e.p, a: Math.atan2(e.y - e.py, e.x - e.px), t: e.k > 1 ? 12 : 8 });
  if (e.streak % 20 === 0) { txt(j, e.px, e.py - 46, 'GRAZE x' + e.streak, LCOLS[e.p % 8]!, 13); j.chroma = Math.max(j.chroma, 6); }
});
const onPower = on<Pp>('juice-power', 'combat:power-up', (j, e) => {
  snd(j, e.gf, 'se_powerup');
  const c = LCOLS[e.p % 8]!; big(j, 'POWER UP', c, 44); j.RINGS.push({ x: e.px, y: e.py, r: 0, m: 90, t: 24, c }); j.WAVES.push({ x: e.px, y: e.py, t: 16, T: 16, spd: 12, th: 26, inv: 1 });
  flash(j, 0.25, c); j.chroma = Math.max(j.chroma, 10);
});
const onRefused = on<Pp & { spirit: number }>('juice-refused', 'combat:spell-refused', (j, e) => { txt(j, e.px, e.py - 30, 'SPELL ' + (e.spirit | 0) + '%', '#f8f', 13); snd(j, e.gf, 'cancel00', 0.4); });
const onParry = on<Pp & { k: number }>('juice-parry', 'combat:parry', (j, e) => {
  const K = e.k, u = (K - 1) / 6, x = e.px, y = e.py;
  snd(j, e.gf, 'parry4', 0.8 + 0.2 * u, 1 + 0.03 * (K - 1)); if (K === 7) snd(j, e.gf, 'se_enep00', 0.8);
  j.shake = Math.min(70, j.shake + 4 + K * 6); j.zk = Math.min(0.6, j.zk + 0.05 + u * 0.3); j.zblur = Math.max(j.zblur, 0.02 + u * 0.16); j.chroma = Math.max(j.chroma, 6 + K * 9); j.bright = Math.max(j.bright, 0.2 + u * 0.7); j.focusL = Math.max(j.focusL, 0.3 + u * 2.2);
  flash(j, 0.12 + u * 0.5, K === 7 ? '#fff' : '#6ff'); if (K >= 4) j.invF = Math.max(j.invF, K);
  j.WAVES.push({ x, y, t: 14 + K * 5, T: 14 + K * 5, spd: 10 + K * 7, th: 22 + K * 16, inv: 1 }); j.RINGS.push({ x, y, r: 0, m: 80 + K * 30, t: 20, c: '#6ff' });
  for (let i = 0; i < 6 + K * 4; i++) j.LINES.push({ x, y, a: i * 6.2832 / (6 + K * 4), t: 14 + K * 2, T: 14 + K * 2, len: 60 + K * 45 });
  if (K >= 5) crack(j, x, y);
  txt(j, x, y - 56, 'BASE ATK x' + Math.pow(1.3, K).toFixed(1) + (K === 7 ? ' MAX' : ''), '#6ff', 14 + K * 2);
  big(j, K === 7 ? 'MAX POWER!!!' : K > 1 ? 'PARRY x' + K : 'PARRY!', K === 7 ? '#fff' : '#6ff', 34 + K * 8, 'p');
});
const RB = ['#ff4a4a', '#ffa63a', '#ffe83a', '#5cff7a', '#4ab3ff', '#c06cff'];
const onLight = on<{ victim: number }>('juice-hit-light', 'combat:hit-light', j => { j.shake = Math.min(28, j.shake + 1.5); });
const onSpell = on<Pp & { ult: boolean; cut: number[] }>('juice-spell', 'combat:spell', (j, e) => {
  const x = e.px, y = e.py, c = col(e.p);
  if (e.ult) snd(j, e.gf, 'spellcardsultimespawn'); snd(j, e.gf, 'se_cat00');
  if (e.ult) { big(j, 'LAST WORD!', RB[(e.gf >> 2) % 6]!, 86); j.bright = Math.max(j.bright, 0.8); for (let i = 0; i < 6; i++) j.WAVES.push({ x, y, t: 24 + i * 5, T: 24 + i * 5, spd: 18 + i * 4, th: 40, inv: 0, c: RB[i] }); }
  for (let i = 0; i < e.cut.length; i += 3) burst(j, e.cut[i]!, e.cut[i + 1]!, '#bdf', 2);
  flash(j, 0.6, c); j.chroma = Math.max(j.chroma, 24); j.focusL = 1; j.zblur = Math.max(j.zblur, 0.12); j.invF = Math.max(j.invF, 3); j.shake += 14;
  j.WAVES.push({ x, y, t: 36, T: 36, spd: 30, th: 90, inv: 0, c }, { x, y, t: 24, T: 24, spd: 24, th: 50, inv: 1 });
  j.RINGS.push({ x, y, r: 0, m: T.BURST_R, t: 22, c: '#f8f' }); j.shake = Math.min(28, j.shake + 10); // startSpell wrapper (line 4723)
});
const onCapture = on<Pp>('juice-capture', 'combat:spell-capture', (j, e) => { if (j.sl['cap'] !== e.gf) { j.sl['cap'] = e.gf; snd(j, e.gf, 'se_cardget'); } txt(j, e.px, e.py - 50, 'SPELL CAPTURED!', '#f8f', 20); big(j, 'SPELL CAPTURED', '#f8f', 50); flash(j, 0.3, '#f8f'); j.focusL = 1; });
const onGrab = on<Pp>('juice-grab', 'combat:grab', (j, e) => { snd(j, e.gf, 'catch', 0.6); txt(j, e.px, e.py - 34, 'GRAB', '#c07aff', 14); });
const onHeavy = on<Pp>('juice-heavy', 'combat:heavy', (j, e) => { snd(j, e.gf, 'tan0' + (j.rnd() * 3 | 0), 0.7); j.shake = Math.min(28, j.shake + 2); j.chroma = Math.max(j.chroma, 3); j.RINGS.push({ x: e.px + Math.cos(e.pa) * 20, y: e.py + Math.sin(e.pa) * 20, r: 0, m: 40, t: 12, c: '#fff' }); });
const onBClash = on<{ x: number; y: number }>('juice-bullet-clash', 'combat:bullet-clash', (j, e) => { j.chroma = Math.max(j.chroma, 10); j.shake = Math.min(28, j.shake + 6); j.WAVES.push({ x: e.x, y: e.y, t: 10, T: 10, spd: 8, th: 12, inv: 1 }); burst(j, e.x, e.y, '#fff', 12); });
const onCancelB = on<Pp>('juice-bullet-cancel', 'combat:bullet-cancel', (j, e) => { j.cc[e.p] = (j.cc[e.p] ?? 0) + 1; j.ccF[e.p] = e.gf; });
const onCd = on<Pp & { left: number; n: string }>('juice-skill-cd', 'combat:skill-cooldown', (j, e) => txt(j, e.px, e.py - 40, e.n + ' ' + Math.ceil(e.left / 60) + 's', '#888', 13));
const onKick = on<Pp>('juice-wall-kick', 'combat:wall-kick', (j, e) => { txt(j, e.px, e.py - 26, 'WALL KICK', '#fff', 13); burst(j, e.px, e.py, '#fff', 12); j.shake += 6; j.chroma = Math.max(j.chroma, 6); j.WAVES.push({ x: e.px, y: e.py, t: 10, T: 10, spd: 8, th: 14, inv: 1 }); });
const onGlide = on<Pp & { dx: number; dy: number }>('juice-glide', 'combat:glide', (j, e) => { for (let i = 0; i < 6; i++) j.FX.push({ x: e.px, y: e.py, vx: -e.dx * 2 + (j.rnd() - 0.5) * 3, vy: -e.dy * 2 + (j.rnd() - 0.5) * 3, t: 14, c: '#ccc' }); });
const onPivot = on<Pp>('juice-pivot', 'combat:pivot', (j, e) => burst(j, e.px, e.py, '#888', 3));
/** Generic presentation commands (combat/jfx.ts): the legacy juice line, replayed verbatim. */
const onFx = on<{ op: string; a: (number | string)[]; gf: number }>('juice-fx', 'combat:fx', (j, e) => {
  const a = e.a, J = j as unknown as Record<string, number>;
  switch (e.op) {
    case 'burst': burst(j, a[0] as number, a[1] as number, a[2] as string, a[3] as number); break;
    case 'txt': txt(j, a[0] as number, a[1] as number, a[2] as string, a[3] as string, a[4] as number); break;
    case 'big': big(j, a[0] as string, a[1] as string, a[2] as number, (a[3] as string) || undefined); break;
    case 'flash': flash(j, a[0] as number, a[1] as string); break;
    case 'add': { const n = a[0] as string, v = J[n]! + (a[1] as number), cap = a[2] as number; J[n] = cap ? Math.min(cap, v) : v; break; }
    case 'max': J[a[0] as string] = Math.max(J[a[0] as string]!, a[1] as number); break;
    case 'edge': j.FX.push({ x: (a[0] as number) + (j.rnd() - 0.5) * 20, y: (a[1] as number) + (j.rnd() - 0.5) * 20, vx: 0, vy: -1, t: 16, c: '#f44' }); break; // red-zone damage sparks (line 357)
    case 'chg': j.chG[a[0] as number] = Math.min(100, (j.chG[a[0] as number] ?? 0) + (a[1] as number)); break; // Okina season gauge (presentation only in legacy)
    case 'nds': j.nds[a[0] as number] = a[1] as number; break;
    case 'trail': { const k = a[2] as number; j.FX.push(k >= 0 ? { x: a[0] as number, y: a[1] as number, vx: 0, vy: 0, t: 12, c: col(k), r: T.BODY_R } : { x: a[0] as number, y: a[1] as number, vx: 0, vy: 0, t: 18, c: '#999' }); break; }
    case 'camsnap': j.camSnap.push(a[0] as number); break;
    case 'brk': if (e.gf - (j.sl['brk'] ?? -99) > 4) { j.sl['brk'] = e.gf; snd(j, e.gf, 'se_enep00', 0.6); } break; // legacy brk(): big bullet destroyed
    case 'mir': if (e.gf - (j.sl['mir'] ?? -99) > 3) { j.sl['mir'] = e.gf; snd(j, e.gf, 'tan02', 0.3); } break; // legacy mirrorRef sMir throttle
    case 'kira': if (e.gf - (j.sl['kira'] ?? -99) > 40) { j.sl['kira'] = e.gf; snd(j, e.gf, 'se_kira00', 0.7); } break;
    case 'sfxk': snd(j, e.gf, a[1] as string, a[2] as number, 1, a[0] as string); break; // keyed: a later sfxstop with the same key cuts it
    case 'sfxstop': j.stop.push(a[0] as string); break;
    case 'sfx': snd(j, e.gf, a[0] as string, a[1] as number, a[2] as number); break;
    case 'sfxr': snd(j, e.gf, (a[0] as string) + ((a[3] as number) + (j.rnd() * (a[1] as number) | 0)), a[2] as number); break;
    case 'sfxdmg': { if (e.gf - (j.sl['dmg'] ?? -99) < 3) break; j.sl['dmg'] = e.gf; const f = 1 - Math.min(1, Math.max(0, (a[0] as number) / T.HP)); snd(j, e.gf, 'damage00', 0.3 + (1.3 - 0.3) * f, 1 + 0.1 * f); /* legacy T.SFX_DMG_MIN/MAX */ break; }
    case 'crack': crack(j, a[0] as number, a[1] as number); break;
    case 'pushc': { const L = (j as unknown as Record<string, unknown[]>)[a[0] as string]!; if (L.length >= (a[1] as number)) break; const o: Record<string, unknown> = {}; for (let i = 2; i + 1 < a.length; i += 2) o[a[i] as string] = a[i + 1]; L.push(o); break; } // push only while the list is shorter than the cap (legacy `if(FX.length<480)FX.push`)
    case 'push': { const o: Record<string, unknown> = {}; for (let i = 1; i + 1 < a.length; i += 2) o[a[i] as string] = a[i + 1]; (j as unknown as Record<string, unknown[]>)[a[0] as string]!.push(o); break; }
  }
});
const onReady = on<Pp>('juice-spell-ready', 'combat:spell-ready', (j, e) => { txt(j, e.px, e.py - 50, 'SPELL READY', '#f8f', 18); j.RINGS.push({ x: e.px, y: e.py, r: 0, m: 80, t: 24, c: '#f8f' }); flash(j, 0.15, '#f8f'); });
const onCancel = on<Pp & { kind: string }>('juice-cancel', 'combat:cancel', (j, e) => { if (e.kind === 'confirm') txt(j, e.px, e.py - 30, 'CONFIRM!', '#ffb040', 13); else if (e.kind === 'hit') txt(j, e.px, e.py - 30, 'HIT CANCEL', '#7cf', 13); else txt(j, e.px, e.py - 30, 'CANCEL', '#7cf'); });
const onClash = on<{ x: number; y: number }>('juice-clash', 'combat:clash', (j, e) => {
  snd(j, e.gf, 'swordclash'); const x = e.x, y = e.y; burst(j, x, y, '#fff', 24); j.WAVES.push({ x, y, t: 14, T: 14, spd: 14, th: 24, inv: 1 }); for (let i = 0; i < 10; i++) j.LINES.push({ x, y, a: i * 6.2832 / 10, t: 12, T: 12, len: 90 });
  j.shake = Math.min(40, j.shake + 16); j.invF = Math.max(j.invF, 4); txt(j, x, y - 30, 'CLASH!', '#fff', 20);
});
const onChip = on<Pp & { dmg: number }>('juice-spell-chip', 'combat:spell-chip', (j, e) => { txt(j, e.px, e.py - 40, '-' + Math.round(e.dmg), '#f8f', 14); snd(j, e.gf, 'hit1', 0.5); });
const onKo = on<Pp & { why: string; x: number; y: number }>('juice-ko', 'combat:ko', (j, e) => { j.koN++; j.acts[e.p] = []; // legacy ko (lines 705-715): the activation list empties
  const x = e.x, y = e.y, why = e.why || 'K.O.', c = col(e.p);
  snd(j, e.gf, 'charge', 0.8); snd(j, e.gf, 'aimreal', 1.7); snd(j, e.gf, 'se_pldead00');
  big(j, why, '#fff', why.length > 6 ? 72 : 110); if (!e.pcpu) big(j, 'AIM YOUR KO BEAM!', c, 30, 'kb' + e.p);
  j.zk = 0.35; flash(j, 0.8); j.invF = Math.max(j.invF, 6); j.chroma = Math.max(j.chroma, 32); j.focusL = 1.5; j.zblur = 0.18; j.bright = 1; crack(j, x, y); crack(j, x, y);
  j.WAVES.push({ x, y, t: 50, T: 50, spd: 55, th: 160, inv: 1 }, { x, y, t: 36, T: 36, spd: 30, th: 70, inv: 1 }, { x, y, t: 24, T: 24, spd: 14, th: 30, inv: 1 });
  j.shake = 60; txt(j, x, y - 40, why, '#fff', 28); burst(j, x, y, c, 60); j.RINGS.push({ x, y, r: 0, m: 260, t: 30, c });
});
const onRespawn = on<Pp & { x: number; y: number }>('juice-respawn', 'combat:respawn', (j, e) => { j.RINGS.push({ x: e.x, y: e.y, r: 0, m: 120, t: 30, c: '#fff' }); j.WAVES.push({ x: e.x, y: e.y, t: 20, T: 20, spd: 14, th: 30, inv: 1 }); flash(j, 0.2, col(e.p)); });
const onSB = on<Pp>('juice-shield-break', 'combat:shield-break', (j, e) => { // xShieldBreak (lines 1920-1921)
  const x = e.px, y = e.py; big(j, 'SHIELD BREAK!', '#fff', 60); j.shake = Math.min(50, j.shake + 20); flash(j, 0.3, '#fff'); j.chroma = Math.max(j.chroma, 30); snd(j, e.gf, 'shield-break', 1); snd(j, e.gf, 'shieldbreaketoiles', 0.6);
  for (let i = 0; i < 10; i++) j.FX.push({ x, y, vx: Math.cos(i * 6.2832 / 10) * 3, vy: Math.sin(i * 6.2832 / 10) * 3, t: 30, c: '#ffd23a' }); j.WAVES.push({ x, y, t: 16, T: 16, spd: 12, th: 30, inv: 1 });
});
const onBeamCancel = on<{ p: number; kx: number; ky: number }>('juice-kobeam-cancel', 'combat:kobeam-cancel', (j, e) => txt(j, e.kx, e.ky - 40, 'BEAM CANCELED', '#aaa', 16));
// KO beam visuals (legacy fireBeam, line 1911): KOFX gets the beam; a reflected beam keeps the original colour, edged with the reflector's.
const bcol: string[] = [], bedge: (string | null)[] = [];
const onFire = on<{ o: number; x: number; y: number; a: number; dep: number }>('juice-kobeam-fire', 'combat:kobeam-fire', (j, e) => { j.KOFX.push({ x: e.x, y: e.y, a: e.a, t: 70, c: e.dep ? bcol[e.o] ?? col(e.o) : col(e.o), edge: e.dep ? bedge[e.o] ?? null : null }); });
const onRefl = on<{ p: number; o: number; dep: number; x: number; y: number; a: number; len: number }>('juice-kobeam-reflect', 'combat:kobeam-reflect', (j, e) => {
  const d0 = e.dep - 1, c = d0 ? bcol[e.o] ?? col(e.o) : col(e.o);
  j.KOFX.push({ x: e.x, y: e.y, a: e.a, t: 70, c, edge: d0 ? bedge[e.o] ?? null : null, len: e.len }); big(j, d0 ? 'REFLECTED x' + (d0 + 1) + '!' : 'BEAM PARRIED!', '#6ff', 50);
  bcol[e.p] = c; bedge[e.p] = col(e.p);
});
/** Legacy give0 (line 838): pickup feedback (sounds, NAME! banner, ring, flash, the item's own sound) before the item's effect. Name / colour / sound are journaled here (the handler has no world). */
const onItem0 = on<{ p: number; kind: number; nm: string; c: string; sf: string; px: number; py: number; ik: string; iT: number; iht: number }>('juice-item', 'combat:item', (j, e) => {
  j.gives.push({ p: e.p, kind: e.kind }); if (j.gives.length > 64) j.gives.splice(0, 32);
  if (e.ik) { const l = (j.acts[e.p] ?? []).filter(a => a.k !== e.ik); l.push({ k: e.ik, f: e.gf, T: e.iT, ht: !!e.iht }); j.acts[e.p] = l; } // legacy give0 wrapper (line 1979): the item activation list
  const u = e.kind === CARD_ULT, c = u ? '#fff' : e.c;
  snd(j, e.gf, 'se_cardget'); snd(j, e.gf, 'se_changeitem', 0.7); big(j, e.nm.toUpperCase() + '!', u ? '#ffe83a' : e.c, 52); j.RINGS.push({ x: e.px, y: e.py, r: 0, m: 140, t: 30, c }); flash(j, 0.25, c);
  if (e.sf) snd(j, e.gf, e.sf, 0.7);
});
const onItem: HookDef = { ...onItem0, run(w, ev) {
  const p = ev.payload as { p: number; kind: number }, d = p.kind === CARD_ULT ? null : itemPool(w)[p.kind], id = d ? w.registry.list<typeof d>('item').find(e => e[1] === d)![0] : 'rainbow', m = /(\d+(?:\.\d+)?) ?s\b/.exec(d ? d.desc ?? '' : 'Every 35 s, takes 3 s to grab. Unlocks your LAST WORD: press Spell.');
  onItem0.run(w, { ...ev, payload: { ...p, nm: d ? d.name : 'Last Word', c: d ? d.color : '', sf: d?.sfx ?? '', ik: id.split(':').pop()!, iT: m ? Math.round(+m[1]! * 60) : 420, iht: m ? 1 : 0 } as never });
} };
export const juiceHooks: HookDef[] = [onItem, onFire, onRefl, onSB, onBeamCancel, onRespawn, onKo, onChip, onCancel, onClash, onReady, onFx, onPivot, onCancelB, onCd, onKick, onGlide, onGrab, onHeavy, onBClash, onLight, onSpell, onCapture, onTick, onHit, onBreak, onPip, onGraze, onPower, onRefused, onParry];
export { on as juiceHook };
export function runJuiceEvent(j: Juice, e: { ev: string }): void { (H[e.ev] as ((j: Juice, e: unknown) => void) | undefined)?.(j, e); }
export type { Ev };
