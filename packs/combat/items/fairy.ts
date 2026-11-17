import { type World, atan2, cos, hypot, sin } from '@kernel';
import { burst, jfx, sfx, spark, txt } from '../jfx';
import { addEnt } from '../ents';
import { PS, type CombatState } from '../state';
import { T } from '../tuning';
import { bodyR } from '../stats';

/** Entity kind of the thief fairies (item `blue`). Ownerless (eo = -1): the holder is stored in `eg`; hp in `ew`; stolen loot in `er`. */
export const EK_FAIRY = 104;
export const FAIRY = { count: 3, hp: 6, life: 420, speed: 4.2, steal: 15, lootPower: 0.5, touch: 24, hitBox: 10, heavyDmg: 6 };

export function spawnFairies(s: CombatState, p: number): void {
  for (let i = 0; i < FAIRY.count; i++) { const e = addEnt(s, EK_FAIRY, -1, FAIRY.life, s.x[p]!, s.y[p]!); if (e >= 0) { s.eg[e] = p; s.ew[e] = FAIRY.hp; } }
}

/** Legacy updWorld fairy loop: each flies at the richest foe (spirit + power x 10), steals spirit/power, brings it home. `et` is ticked later by updateEnts, hence `et - 1`. */
export function updateFairies(w: World, s: CombatState): void {
  for (let i = 0; i < s.nent; i++) {
    if (s.ek[i] !== EK_FAIRY) continue;
    if (s.ew[i]! <= 0) s.et[i] = 0;
    if (s.et[i]! - 1 <= 0) { burst(w, s.ex[i]!, s.ey[i]!, '#6cf', 12); continue; }
    const o = s.eg[i]!, x = s.ex[i]!, y = s.ey[i]!;
    let tx: number, ty: number;
    if (s.er[i]! > 0) {
      tx = s.x[o]!; ty = s.y[o]!;
      if (hypot(tx - x, ty - y) < FAIRY.touch) { s.spirit[o] = Math.min(T.SPIRIT_MAX, s.spirit[o]! + s.er[i]!); s.power[o] = Math.min(T.POWER_MAX, s.power[o]! + FAIRY.lootPower); txt(w, s.x[o]!, s.y[o]! - 30, '+LOOT', '#6cf', 14); sfx(w, 'se_powerup', 0.4); s.er[i] = 0; }
    } else {
      let q = -1, bv = -1;
      for (let c = 0; c < s.n; c++) if (c !== o && s.state[c] !== PS.dead && s.spirit[c]! + s.power[c]! * 10 > bv) { bv = s.spirit[c]! + s.power[c]! * 10; q = c; }
      if (q < 0) { s.et[i] = 0; continue; }
      tx = s.x[q]!; ty = s.y[q]!;
      if (hypot(tx - x, ty - y) < bodyR(s, q) + 8) { const st = Math.min(s.spirit[q]!, FAIRY.steal); s.spirit[q] = s.spirit[q]! - st; s.power[q] = Math.max(1, s.power[q]! - FAIRY.lootPower); s.er[i] = st + 1; txt(w, s.x[q]!, s.y[q]! - 30, 'STOLEN!', '#6cf', 14); sfx(w, 'se_kira00', 0.4); }
    }
    const a = atan2(ty - y, tx - x);
    s.ex[i] = x + cos(a) * FAIRY.speed; s.ey[i] = y + sin(a) * FAIRY.speed;
  }
}

/** Legacy hitFairy: a foreign bullet touching a live fairy damages it (heavy 6, light 1) and vanishes. Returns true when the bullet was consumed. */
export function hitFairy(w: World, s: CombatState, i: number): boolean {
  const r = s.br[i]! + FAIRY.hitBox;
  for (let e = 0; e < s.nent; e++) {
    if (s.ek[e] !== EK_FAIRY || s.eg[e] === s.bowner[i] || s.et[e]! <= 0 || Math.abs(s.ex[e]! - s.bx[i]!) >= r || Math.abs(s.ey[e]! - s.by[i]!) >= r) continue;
    s.ew[e] = s.ew[e]! - (s.bflags[i]! & 1 ? FAIRY.heavyDmg : 1); spark(w, s.bx[i]!, s.by[i]!);
    if (s.ew[e]! <= 0) { jfx(w, 'brk'); txt(w, s.ex[e]!, s.ey[e]! - 20, 'FAIRY DOWN', '#6cf', 12); burst(w, s.ex[e]!, s.ey[e]!, '#6cf', 14); }
    return true;
  }
  return false;
}
