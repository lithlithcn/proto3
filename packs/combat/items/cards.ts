import { jfx } from '../jfx';
import { type World, cos, hypot, sin } from '@kernel';
import { spRand } from '../bullets/pattern';
import { itemPool } from '../api';
import { CARD_ULT, MAX_CARD, MAXP, PS, type CombatState } from '../state';
import { T, TAU } from '../tuning';

/** Hands an item to a player (legacy give0). `kind` = pool index, or CARD_ULT for the Last Word. */
export function giveItem(w: World, s: CombatState, p: number, kind: number, x: number, y: number): void {
  s.lastIt[p] = kind;
  w.emit('combat:item', { p, kind, x, y });
  if (kind === CARD_ULT) s.ult[p] = 1; else itemPool(w)[kind]?.give({ w, s, p, x, y });
}

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

/** Legacy updItem: spawns cards (every ITEM_EVERY frames, Last Word every ULT_EVERY), then fills the capture gauges of whoever stands on them. */
export function updateCards(w: World, s: CombatState): void {
  s.itemT++; s.ultT++;
  const pool = itemPool(w), every = s.itemsOn ? T.ITEM_EVERY : T.ULT_EVERY;
  if (s.ncard < Math.min(s.maxC, MAX_CARD) && s.itemT >= every * (s.ncard ? 0.5 : 1) - T.ITEM_WARN) {
    let rainbowOn = false;
    for (let i = 0; i < s.ncard; i++) if (s.ckind[i] === CARD_ULT) rainbowOn = true;
    const ultDue = !s.itemsOn || (s.ultT >= T.ULT_EVERY && !rainbowOn);
    let kind = CARD_ULT;
    if (!ultDue) { // pickItem: uniform over the enabled, non-rare items (legacy order)
      const L: number[] = [];
      for (let i = 0; i < pool.length; i++) if (s.itemOn[i] && !pool[i]!.rare) L.push(i);
      kind = L.length ? L[(spRand(s) * L.length) | 0]! : -1;
    }
    if (kind === -1) s.itemT = 0;
    else {
      if (kind === CARD_ULT) s.ultT = 0;
      s.itemT = 0;
      const m = s.edge + 60;
      let x = 0, y = 0, n = 0;
      for (let q = 0; q < s.n; q++) if (s.state[q] !== PS.dead) { x += s.x[q]!; y += s.y[q]!; n++; }
      n = n || s.n; x /= n; y /= n;
      if (s.ncard) { const a = spRand(s) * TAU, r = 220 + spRand(s) * 260; x += cos(a) * r; y += sin(a) * r; }
      const i = s.ncard++;
      s.cx[i] = clamp(x, m, s.mapW - m); s.cy[i] = clamp(y, m, s.mapH - m); s.ckind[i] = kind; s.con[i] = 0; s.cage[i] = 0; s.ccont[i] = 0; s.ccp.fill(0, i * MAXP, i * MAXP + MAXP);
      w.emit('combat:card-spawn', { i, kind, x: s.cx[i]!, y: s.cy[i]! });
    }
  }
  let prog = 0;
  for (let k = s.ncard - 1; k >= 0; k--) {
    if (!s.con[k]) { if (++s.cage[k]! >= T.ITEM_WARN) s.con[k] = 1; continue; }
    const cap = s.ckind[k] === CARD_ULT ? T.LW_CAP : T.ITEM_CAP, ins: boolean[] = [];
    let cnt = 0;
    for (let q = 0; q < s.n; q++) {
      const dx = s.x[q]! - s.cx[k]!, dy = s.y[q]! - s.cy[k]!, r = T.ITEM_R + T.BODY_R;
      const v = s.state[q] !== PS.dead && s.state[q] !== PS.hitstun && hypot(dx, dy) < r;
      ins.push(v); if (v) cnt++;
    }
    s.ccont[k] = cnt > 1 ? 1 : 0;
    for (let q = 0; q < s.n; q++) {
      const j = k * MAXP + q;
      if (ins[q] && !s.ccont[k]) { s.ccp[j] = s.ccp[j]! + (s.state[q] === PS.spell ? 0.4 : 1); prog = 1; }
      else if (!ins[q]) s.ccp[j] = Math.max(0, s.ccp[j]! - 2);
      if (s.ccp[j]! >= cap) {
        const kind = s.ckind[k]!, x = s.cx[k]!, y = s.cy[k]!;
        for (let c = k; c < s.ncard - 1; c++) { s.cx[c] = s.cx[c + 1]!; s.cy[c] = s.cy[c + 1]!; s.ckind[c] = s.ckind[c + 1]!; s.con[c] = s.con[c + 1]!; s.cage[c] = s.cage[c + 1]!; s.ccont[c] = s.ccont[c + 1]!; s.ccp.copyWithin(c * MAXP, (c + 1) * MAXP, (c + 2) * MAXP); }
        s.ncard--; s.ccp.fill(0, s.ncard * MAXP, s.ncard * MAXP + MAXP);
        giveItem(w, s, q, kind, x, y); s.itemT = 0;
        break;
      }
    }
  }
  jfx(w, 'load', prog); // legacy loadSrc: the capture loop sound plays while a gauge fills (line 831)
}
