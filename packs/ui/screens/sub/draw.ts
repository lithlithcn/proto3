import { UF, UFI, clamp, eo, hexA, lerp, skewRect, strokeTxt, type UiCtx } from '../../core';
import { uiBG } from '../../bg';
import { HUB } from '../hub/hub';
import { UISUB } from '../../trans';
import { PROFS, drawName, ncol } from '../../profiles';

/** Styled settings lists (legacy openSub / drawSub / splitRow / subAcc, line ~3905): rows "Label: value ◀ ▶", big value panel, description bar, breadcrumbs. */
export interface Row { t(): string; lr?(d: number): void; f?(): void; del?(): void }
export const SUB = { rows: null as (() => Row[]) | null, title: '', sel: 0, /** profiles list: preview the edited name */ prof: false, stack: [] as [() => Row[], string, number][], vals: {} as Record<string, number | string> };
export const RDESC: Record<string, string> = { Mode: 'CASUAL = your own rules. COMPETITIVE = 4 lives, 5 minutes, no items.', Fighters: 'How many fighters are in the arena (2 to 8).', Humans: 'How many of them are real players; the rest are CPUs.', 'CPU level': '9 = superhuman: perfect parries and reactions.', Lives: 'Number of stocks per fighter.', Timer: 'Match length in minutes (OFF = until the last one standing).', Map: 'Arena. Custom maps from the Map maker appear here too.', Items: 'Item cards that spawn during the match.', 'Cards at once': 'Maximum item cards on the map at the same time.', Teams: 'Enter to choose the team of each player.', Tempo: 'How fast cards spawn and how frantic the match gets.', Effects: 'REDUCED = fewer flashes and particles (photosensitive players).', Motion: 'SMOOTH = fluid on 120/144 Hz screens (shows the last frame blended, about 8 ms later). STRICT 60 = raw frames. AUTO = smooth only on fast screens.', 'Sound…': 'Volumes and custom music for each screen.', 'Profiles…': 'Player names, colors and name animations.', Controls: 'Keyboard / gamepad bindings.', 'How to play': 'Interactive tutorial.', Guide: 'Every mechanic explained.', 'Title screen': 'Back to the title screen.' };
export function splitRow(s0: string): { l: string; v: string; ar: boolean } {
  let s = String(s0); const ar = /\s*◀\s*▶\s*$/.test(s); s = s.replace(/\s*◀\s*▶\s*$/, ''); const i = s.indexOf(': ');
  return i > 0 && i < 34 ? { l: s.slice(0, i), v: s.slice(i + 2), ar } : { l: s, v: '', ar };
}
export function subAcc(fallback: string): string {
  const T = SUB.title.toUpperCase(), h = HUB.find(x => T.startsWith(x.t.replace('!', ''))); if (h) return h.c;
  if (/TEAM/.test(T)) return '#ffd23a'; if (/SOUND|PROFILE|CONTROL/.test(T)) return '#7fa8ff'; if (/MAP/.test(T)) return '#9b6bff'; if (/ONLINE/.test(T)) return '#29d4ff'; return fallback || '#ff3355';
}
/** `nav` routes clicks back through the keyboard path ('ok' / 'back'); `sfx` for hover. */
export function drawSub(u: UiCtx, nav: (ev: 'ok' | 'back') => void, sfx: (n: string, v?: number, r?: number) => void, frame = 0): void {
  const { c, W, H } = u; u.hot.length = 0; const L = SUB.rows!(); SUB.sel = clamp(SUB.sel, 0, L.length - 1); const t = u.now, tin = t - UISUB.t0, acc = u.acc = subAcc(u.acc), V = SUB.vals;
  uiBG(u, SUB.title.replace(/[^A-Z ]/gi, '').toUpperCase() + '  ');
  c.save(); c.textAlign = 'left'; c.fillStyle = '#05060c'; skewRect(c, -20, H * 0.04, W * 0.5, H * 0.075, H * 0.03); c.fill(); c.fillStyle = acc; c.fillRect(0, H * 0.04 + H * 0.075 - 4, W * 0.46, 4);
  c.font = UFI(H * 0.042); strokeTxt(c, SUB.title.toUpperCase(), W * 0.05, H * 0.095, 6, '#05060c', '#fff'); c.font = UF(800, H * 0.016); c.fillStyle = acc; c.fillText('MENU  ›  ' + (SUB.stack.length ? SUB.stack.map(s => s[1]).join('  ›  ') + '  ›  ' : '') + SUB.title.toUpperCase(), W * 0.05, H * 0.035); c.restore();
  const rh = Math.min(52, Math.max(34, H * 0.062)), y0 = H * 0.17, vis = Math.max(4, Math.floor((H * 0.72) / rh)), top = clamp(SUB.sel - Math.floor(vis / 2), 0, Math.max(0, L.length - vis)), x0 = W * 0.07, rw = Math.min(W * 0.6, 760);
  { const pe = eo(clamp(tin / 0.4, 0, 1)); c.save(); c.globalAlpha = pe; const pg2 = c.createLinearGradient(0, y0, 0, y0 + vis * rh); pg2.addColorStop(0, hexA(acc, 0.1)); pg2.addColorStop(1, 'rgba(255,255,255,.02)'); c.fillStyle = pg2; skewRect(c, x0 - 30, y0 - 16, rw + 80, Math.min(L.length, vis) * rh + 28, 40); c.fill(); c.strokeStyle = hexA(acc, 0.25); c.lineWidth = 1.5; skewRect(c, x0 - 30, y0 - 16, rw + 80, Math.min(L.length, vis) * rh + 28, 40); c.stroke(); c.restore(); }
  for (let j = 0; j < vis && top + j < L.length; j++) {
    const i = top + j, it = L[i]!, s = i === SUB.sel, raw = it.t(), R = splitRow(raw), ent = clamp((tin - j * 0.035) / 0.3, 0, 1), ee = 1 - Math.pow(1 - ent, 3), y = y0 + j * rh, A = V['a' + i] = lerp((V['a' + i] as number) || 0, s ? 1 : 0, 0.25); if (!raw) continue;
    c.save(); c.globalAlpha = ee; c.translate((1 - ee) * -120 + A * 18, 0); const h = rh - 8, k = h * 0.35;
    if (s) { c.save(); c.shadowColor = acc; c.shadowBlur = 22 + 6 * Math.sin(t * 4); const sgr = c.createLinearGradient(x0, 0, x0 + rw, 0); sgr.addColorStop(0, '#fff'); sgr.addColorStop(0.7, '#fff'); sgr.addColorStop(1, hexA(acc, 0.85)); c.fillStyle = sgr; skewRect(c, x0, y, rw + A * 20, h, k); c.fill(); c.restore(); }
    else { const gg2 = c.createLinearGradient(x0, y, x0 + rw, y + h); gg2.addColorStop(0, 'rgba(24,26,48,.78)'); gg2.addColorStop(1, 'rgba(10,12,22,.55)'); c.fillStyle = gg2; skewRect(c, x0, y, rw, h, k); c.fill(); c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(x0 + k, y, rw - k, 1); }
    if (s) { c.fillStyle = acc; skewRect(c, x0 - 14, y, 18, h, k); c.fill(); c.save(); skewRect(c, x0, y, rw + 20, h, k); c.clip(); const sw = ((t * 0.9) % 1.4) / 1.4 * (rw * 1.6) - rw * 0.3, gg = c.createLinearGradient(x0 + sw - 60, 0, x0 + sw + 60, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, hexA(acc, 0.35)); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(x0, y, rw + 20, h); c.restore(); }
    else { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; skewRect(c, x0, y, rw, h, k); c.stroke(); }
    c.textAlign = 'left'; c.font = s ? UFI(h * 0.46) : UF(800, h * 0.4); c.fillStyle = s ? '#05060c' : '#d8dbe6'; let lab = R.l; while (lab.length > 3 && c.measureText(lab).width > (R.v ? rw * 0.5 : rw * 0.9)) lab = lab.slice(0, -2); c.fillText(lab, x0 + k + 16, y + h * 0.68);
    if (R.v) {
      const vx = x0 + rw * 0.56, vw = rw * 0.42 - k, key = 'v' + i; if (V[key] !== R.v) { V[key] = R.v; V['p' + i] = t; } const pu = clamp((t - ((V['p' + i] as number) || 0)) / 0.25, 0, 1), pop = 1 + 0.15 * (1 - pu) * Math.sin(pu * Math.PI);
      c.save(); c.translate(vx + vw / 2, y + h / 2); c.scale(pop, pop); c.fillStyle = s ? acc : 'rgba(255,255,255,.06)'; skewRect(c, -vw / 2, -h * 0.36, vw, h * 0.72, h * 0.2); c.fill(); c.textAlign = 'center'; c.font = UF(900, h * 0.36); let v = R.v; while (v.length > 3 && c.measureText(v).width > vw - 50) v = v.slice(0, -2); c.fillStyle = s ? '#05060c' : '#fff'; c.fillText(v, 0, h * 0.13);
      if (R.ar) { const o = s ? Math.sin(t * 6) * 3 : 0; c.fillStyle = s ? '#05060c' : 'rgba(255,255,255,.4)'; c.font = UF(900, h * 0.34); c.fillText('◀', -vw / 2 + 16 - o, h * 0.12); c.fillText('▶', vw / 2 - 16 + o, h * 0.12); }
      c.restore();
    } else if (s && it.f) { c.textAlign = 'right'; c.font = UFI(h * 0.4); c.fillStyle = acc; c.fillText('>>>'.slice(0, 1 + ((t * 4 | 0) % 3)), x0 + rw - 10, y + h * 0.68); }
    c.restore(); const am = x0 + rw * 0.56 + (rw * 0.42 - k) / 2;
    u.hot.push({ x: x0, y, w: rw + 20, h, hover: () => { if (SUB.sel !== i) { SUB.sel = i; sfx('se_select00', 0.6); } }, click: (x?: number) => { if (x !== undefined && it.lr && R.v && x > x0 + rw * 0.56) { it.lr(x < am ? -1 : 1); sfx('changemenu', 0.8); } else nav('ok'); } });
  }
  if (L.length > vis) { c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x0 + rw + 34, y0, 4, vis * rh); c.fillStyle = acc; c.fillRect(x0 + rw + 34, y0 + top / L.length * vis * rh, 4, vis / L.length * vis * rh); }
  // big right panel: the selected value, huge
  const R = splitRow(L[SUB.sel]!.t()), pw = W - (x0 + rw + 60);
  if (pw > 220) {
    const px = x0 + rw + 60 + pw / 2, key = 'big' + SUB.sel + R.v; if (V['bk'] !== key) { V['bk'] = key; V['bt'] = t; } const uu = clamp((t - (V['bt'] as number)) / 0.35, 0, 1), e = 1 + 1.7 * Math.pow(uu - 1, 3) + 1.2 * Math.pow(uu - 1, 2);
    c.save(); c.translate(px, H * 0.45); c.rotate(-0.08); c.scale(e, e); c.textAlign = 'center'; c.font = UF(800, H * 0.022); c.fillStyle = acc; c.fillText(R.l.toUpperCase().slice(0, 26), 0, -H * 0.09);
    const v = (R.v || '▶').toUpperCase(); c.font = UFI(Math.min(H * 0.11, pw * 0.9 / Math.max(3, v.length * 0.62))); strokeTxt(c, v.slice(0, 22), 0, 0, 10, '#05060c', '#fff'); c.restore();
  }
  const d = RDESC[R.l] || RDESC[Object.keys(RDESC).find(k => R.l.startsWith(k)) ?? ''] || '', bh = H * 0.07; c.save(); c.fillStyle = 'rgba(5,6,12,.85)'; c.fillRect(0, H - bh, W, bh); c.fillStyle = acc; c.fillRect(0, H - bh, W, 3); c.textAlign = 'left'; c.font = UF(800, bh * 0.3); c.fillStyle = '#fff'; c.fillText(d || 'Enter: select · ◀ ▶: change', W * 0.035, H - bh * 0.38);
  c.textAlign = 'right'; c.font = '12px monospace'; c.fillStyle = '#999'; c.fillText('↑↓ select · ◀ ▶ change · Enter confirm · Esc back' + (L[SUB.sel]!.del ? ' · Backspace delete' : ''), W * 0.97, H - bh * 0.38); c.restore();
  if (SUB.title === 'PROFILES' && PROFS.list.length) { const g = PROFS.list[PROFS.edit]!; c.save(); c.translate(W * 0.82, H * 0.7); c.scale(2, 2); drawName(c, g.n, 0, 0, ncol(g.c, '#ffd23a', frame), g.a, t); c.restore(); }
  c.save(); c.textAlign = 'left'; c.font = UF(900, 15); c.fillStyle = '#fff'; c.fillText('◀ BACK', W * 0.05, H * 0.155); c.restore(); u.hot.push({ x: W * 0.04, y: H * 0.13, w: 110, h: 30, hover: () => {}, click: () => nav('back') });
}
