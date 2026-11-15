import { describe, expect, it } from 'vitest';
import { World, newInput } from '@kernel';
import combat from '../packs/combat/pack';
import touhou from '../packs/touhou/pack';
import type { CombatState } from '../packs/combat/state';

const mk = (): { w: World; s: CombatState } => { const w = new World({ packs: [combat, touhou], seed: 1, players: 2, diag: 2, world: { players: [{ char: 'touhou:reimu' }, { char: 'touhou:marisa' }], items: false } }); return { w, s: w.slice<CombatState>('combat') }; };
describe('invariant engine: each injected fault is reported with array, index and value', () => {
  it('a clean match raises nothing', () => { const { w } = mk(); for (let f = 0; f < 300; f++) w.step(newInput(2)); expect(w.reports).toEqual([]); });
  it('NaN in a float array → E_NONFINITE', () => { const { w, s } = mk(); s.hp[1] = NaN; w.step(newInput(2)); expect(w.reports.map(r => r.message)).toContain('combat.hp[1] = NaN'); });
  it('bullet with an impossible owner / speed', () => { const { w, s } = mk(); s.nb = 1; s.bowner[0] = 7; s.br[0] = 4; s.bvx[0] = 500; s.blife[0] = 100; s.bx[0] = 500; s.by[0] = 500; w.step(newInput(2)); const m = w.reports.map(r => r.message).join('|'); expect(m).toMatch(/bowner\[0\] = 7/); expect(m).toMatch(/bv\[0\]/); });
  it('player out of range: spirit, state, self-target', () => { const { w, s } = mk(); s.spirit[0] = 250; s.state[1] = 99; s.tgt[0] = 0; w.step(newInput(2)); const m = w.reports.map(r => r.message).join('|'); expect(m).toMatch(/spirit\[0\] = 250/); expect(m).toMatch(/state\[1\] = 99/); expect(m).toMatch(/tgt\[0\] targets itself/); });
  it('repeated violations are de-duplicated', () => { const { w, s } = mk(); for (let f = 0; f < 50; f++) { s.hp[1] = NaN; w.step(newInput(2)); } expect(w.reports.filter(r => r.code === 'E_NONFINITE').length).toBe(1); });
});
