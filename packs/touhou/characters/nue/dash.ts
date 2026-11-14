import { type PCtx, PS } from '@pack/combat/api';

/** Nue's dash grants 10 frames of invincibility. */
export function nueDash(c: PCtx, base: (c: PCtx) => void): void {
  base(c);
  if (c.s.state[c.p] === PS.dash) c.s.inv[c.p] = Math.max(c.s.inv[c.p]!, 10);
}
