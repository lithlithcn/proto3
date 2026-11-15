import type { HookDef } from '@kernel';
import { PS, T, combatOf } from '@pack/combat/api';
import { COLS, LCOLS } from '../colors';
import { big, burst, crack, flash, juiceOf, tickJuice, txt, type Juice } from './state';

/** Event → presentation effects. Each hook is a line-for-line copy of the juice that the legacy sim sites triggered (docs/game/mechanics/render.md lists the source line of each). */
// Hooks run inside the sanitized sim window (no Math.random/sin/hypot): they only journal the event; handlers run later from syncJuice, in order, between the frame ticks.
/** Journal of one world; a headless run (no renderer draining it) never grows past 4096 events. */
const jq = (w: Parameters<typeof juiceOf>[0]): { ev: string; gf: number }[] => { const q = juiceOf(w).q; if (q.length > 4096) q.splice(0, 2048); return q; };
type Ev = Record<string, number | boolean | undefined> & { gf: number };
const H: Record<string, (j: Juice, e: never) => void> = {};
const on = <P>(id: string, event: string, f: (j: Juice, p: P & { gf: number }) => void): HookDef<P> => { H[event] = f as never; return { id, event, phase: 'after', run(w, ev) { const s = combatOf(w), p = ev.payload as Record<string, number>; const q = p['p']; jq(w).push({ ev: event, gf: s.gf, x: q !== undefined ? s.x[q]! : 0, y: q !== undefined ? s.y[q]! : 0, ...p, px: q !== undefined ? s.x[q]! : 0, py: q !== undefined ? s.y[q]! : 0, pa: q !== undefined ? s.aim[q]! : 0 } as never); } }; };
const col = (p: number): string => COLS[(p < 0 ? 0 : p) % 8]!;

interface HitP { victim: number; attacker: number; dmg: number; combo: number; heavy: boolean; x: number; y: number; dx: number; dy: number }
const onHit = on<HitP>('juice-hit', 'combat:hit', (j, e) => {
  const { x, y, dmg, combo } = e, a = e.attacker, c = col(a), kn = Math.hypot(e.dx, e.dy) || 1;
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
H['combat:fx-tick'] = ((j: Juice, e: { gf: number; tr: number[]; pos: number[] }) => {
  if (e.gf === j.lastGf) return; j.lastGf = e.gf;
  for (let i = 0; i < e.tr.length; i += 4) { const k = e.tr[i + 3]!; j.FX.push(k >= 0 ? { x: e.tr[i]!, y: e.tr[i + 1]!, vx: 0, vy: 0, t: 12, c: col(k), r: T.BODY_R } : { x: e.tr[i]!, y: e.tr[i + 1]!, vx: 0, vy: 0, t: 18, c: '#999' }); }
  tickJuice(j);
  for (let p = 0; p * 2 < e.pos.length; p++) { const c = j.cc[p] ?? 0; if (c && e.gf - j.ccF[p]! > 18) { if (c >= 5) txt(j, e.pos[p * 2]!, e.pos[p * 2 + 1]! - 52, 'CANCEL x' + c, '#ffd23a', c >= 20 ? 18 : 14); j.cc[p] = 0; } } // step wrapper line 2398, after stepFx
}) as never;
const onTick: HookDef<{ gf: number }> = { id: 'juice-tick', event: 'combat:fx-tick', phase: 'after', run(w, ev) {
  const s = combatOf(w), tr: number[] = [];
  if (!s.skip) for (let p = 0; p < s.n; p++) {
    if (s.tstop > 0 && p !== s.tso) continue;
    if (s.state[p] === PS.dash) tr.push(s.x[p]!, s.y[p]!, 0, p);
    if (s.state[p] === PS.hitstun && s.vx[p]! * s.vx[p]! + s.vy[p]! * s.vy[p]! > 49 && s.gf % 2) tr.push(s.x[p]!, s.y[p]!, 0, -1);
  }
  const pos: number[] = []; for (let p = 0; p < s.n; p++) pos.push(s.x[p]!, s.y[p]!);
  jq(w).push({ ev: 'combat:fx-tick', gf: ev.payload.gf, tr, pos } as never);
} };
type Pp = { p: number; px: number; py: number; pa: number };
const onGraze = on<Pp & { x: number; y: number; k: number; streak: number }>('juice-graze', 'combat:graze', (j, e) => {
  burst(j, e.x, e.y, '#bdf', 2); if (e.k > 1) burst(j, e.x, e.y, '#fff', 4);
  if (j.GZ.length < 60) j.GZ.push({ x: e.px, y: e.py, p: e.p, a: Math.atan2(e.y - e.py, e.x - e.px), t: e.k > 1 ? 12 : 8 });
  if (e.streak % 20 === 0) { txt(j, e.px, e.py - 46, 'GRAZE x' + e.streak, LCOLS[e.p % 8]!, 13); j.chroma = Math.max(j.chroma, 6); }
});
const onPower = on<Pp>('juice-power', 'combat:power-up', (j, e) => {
  const c = LCOLS[e.p % 8]!; big(j, 'POWER UP', c, 44); j.RINGS.push({ x: e.px, y: e.py, r: 0, m: 90, t: 24, c }); j.WAVES.push({ x: e.px, y: e.py, t: 16, T: 16, spd: 12, th: 26, inv: 1 });
  flash(j, 0.25, c); j.chroma = Math.max(j.chroma, 10);
});
const onRefused = on<Pp & { spirit: number }>('juice-refused', 'combat:spell-refused', (j, e) => txt(j, e.px, e.py - 30, 'SPELL ' + (e.spirit | 0) + '%', '#f8f', 13));
const onParry = on<Pp & { k: number }>('juice-parry', 'combat:parry', (j, e) => {
  const K = e.k, u = (K - 1) / 6, x = e.px, y = e.py;
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
  if (e.ult) { big(j, 'LAST WORD!', RB[(e.gf >> 2) % 6]!, 86); j.bright = Math.max(j.bright, 0.8); for (let i = 0; i < 6; i++) j.WAVES.push({ x, y, t: 24 + i * 5, T: 24 + i * 5, spd: 18 + i * 4, th: 40, inv: 0, c: RB[i] }); }
  for (let i = 0; i < e.cut.length; i += 3) burst(j, e.cut[i]!, e.cut[i + 1]!, '#bdf', 2);
  flash(j, 0.6, c); j.chroma = Math.max(j.chroma, 24); j.focusL = 1; j.zblur = Math.max(j.zblur, 0.12); j.invF = Math.max(j.invF, 3); j.shake += 14;
  j.WAVES.push({ x, y, t: 36, T: 36, spd: 30, th: 90, inv: 0, c }, { x, y, t: 24, T: 24, spd: 24, th: 50, inv: 1 });
  j.RINGS.push({ x, y, r: 0, m: T.BURST_R, t: 22, c: '#f8f' }); j.shake = Math.min(28, j.shake + 10); // startSpell wrapper (line 4723)
});
const onCapture = on<Pp>('juice-capture', 'combat:spell-capture', (j, e) => { txt(j, e.px, e.py - 50, 'SPELL CAPTURED!', '#f8f', 20); big(j, 'SPELL CAPTURED', '#f8f', 50); flash(j, 0.3, '#f8f'); j.focusL = 1; });
const onGrab = on<Pp>('juice-grab', 'combat:grab', (j, e) => txt(j, e.px, e.py - 34, 'GRAB', '#c07aff', 14));
const onHeavy = on<Pp>('juice-heavy', 'combat:heavy', (j, e) => { j.shake = Math.min(28, j.shake + 2); j.chroma = Math.max(j.chroma, 3); j.RINGS.push({ x: e.px + Math.cos(e.pa) * 20, y: e.py + Math.sin(e.pa) * 20, r: 0, m: 40, t: 12, c: '#fff' }); });
const onBClash = on<{ x: number; y: number }>('juice-bullet-clash', 'combat:bullet-clash', (j, e) => { j.chroma = Math.max(j.chroma, 10); j.shake = Math.min(28, j.shake + 6); j.WAVES.push({ x: e.x, y: e.y, t: 10, T: 10, spd: 8, th: 12, inv: 1 }); burst(j, e.x, e.y, '#fff', 12); });
const onCancelB = on<Pp>('juice-bullet-cancel', 'combat:bullet-cancel', (j, e) => { j.cc[e.p] = (j.cc[e.p] ?? 0) + 1; j.ccF[e.p] = e.gf; });
const onCd = on<Pp & { left: number; n: string }>('juice-skill-cd', 'combat:skill-cooldown', (j, e) => txt(j, e.px, e.py - 40, e.n + ' ' + Math.ceil(e.left / 60) + 's', '#888', 13));
const onKick = on<Pp>('juice-wall-kick', 'combat:wall-kick', (j, e) => { txt(j, e.px, e.py - 26, 'WALL KICK', '#fff', 13); burst(j, e.px, e.py, '#fff', 12); j.shake += 6; j.chroma = Math.max(j.chroma, 6); j.WAVES.push({ x: e.px, y: e.py, t: 10, T: 10, spd: 8, th: 14, inv: 1 }); });
const onGlide = on<Pp & { dx: number; dy: number }>('juice-glide', 'combat:glide', (j, e) => { for (let i = 0; i < 6; i++) j.FX.push({ x: e.px, y: e.py, vx: -e.dx * 2 + (j.rnd() - 0.5) * 3, vy: -e.dy * 2 + (j.rnd() - 0.5) * 3, t: 14, c: '#ccc' }); });
const onPivot = on<Pp>('juice-pivot', 'combat:pivot', (j, e) => burst(j, e.px, e.py, '#888', 3));
/** Generic presentation commands (combat/jfx.ts): the legacy juice line, replayed verbatim. */
const onFx = on<{ op: string; a: (number | string)[] }>('juice-fx', 'combat:fx', (j, e) => {
  const a = e.a, J = j as unknown as Record<string, number>;
  switch (e.op) {
    case 'burst': burst(j, a[0] as number, a[1] as number, a[2] as string, a[3] as number); break;
    case 'txt': txt(j, a[0] as number, a[1] as number, a[2] as string, a[3] as string, a[4] as number); break;
    case 'big': big(j, a[0] as string, a[1] as string, a[2] as number, (a[3] as string) || undefined); break;
    case 'flash': flash(j, a[0] as number, a[1] as string); break;
    case 'add': { const n = a[0] as string, v = J[n]! + (a[1] as number), cap = a[2] as number; J[n] = cap ? Math.min(cap, v) : v; break; }
    case 'max': J[a[0] as string] = Math.max(J[a[0] as string]!, a[1] as number); break;
    case 'crack': crack(j, a[0] as number, a[1] as number); break;
    case 'push': { const o: Record<string, unknown> = {}; for (let i = 1; i + 1 < a.length; i += 2) o[a[i] as string] = a[i + 1]; (j as unknown as Record<string, unknown[]>)[a[0] as string]!.push(o); break; }
  }
});
const onReady = on<Pp>('juice-spell-ready', 'combat:spell-ready', (j, e) => { txt(j, e.px, e.py - 50, 'SPELL READY', '#f8f', 18); j.RINGS.push({ x: e.px, y: e.py, r: 0, m: 80, t: 24, c: '#f8f' }); flash(j, 0.15, '#f8f'); });
const onCancel = on<Pp & { kind: string }>('juice-cancel', 'combat:cancel', (j, e) => { if (e.kind === 'confirm') txt(j, e.px, e.py - 30, 'CONFIRM!', '#ffb040', 13); else if (e.kind === 'hit') txt(j, e.px, e.py - 30, 'HIT CANCEL', '#7cf', 13); else txt(j, e.px, e.py - 30, 'CANCEL', '#7cf'); });
const onClash = on<{ x: number; y: number }>('juice-clash', 'combat:clash', (j, e) => {
  const x = e.x, y = e.y; burst(j, x, y, '#fff', 24); j.WAVES.push({ x, y, t: 14, T: 14, spd: 14, th: 24, inv: 1 }); for (let i = 0; i < 10; i++) j.LINES.push({ x, y, a: i * 6.2832 / 10, t: 12, T: 12, len: 90 });
  j.shake = Math.min(40, j.shake + 16); j.invF = Math.max(j.invF, 4); txt(j, x, y - 30, 'CLASH!', '#fff', 20);
});
export const juiceHooks: HookDef[] = [onCancel, onClash, onReady, onFx, onPivot, onCancelB, onCd, onKick, onGlide, onGrab, onHeavy, onBClash, onLight, onSpell, onCapture, onTick, onHit, onBreak, onPip, onGraze, onPower, onRefused, onParry];
export { on as juiceHook };
export function runJuiceEvent(j: Juice, e: { ev: string }): void { (H[e.ev] as ((j: Juice, e: unknown) => void) | undefined)?.(j, e); }
export type { Ev };
