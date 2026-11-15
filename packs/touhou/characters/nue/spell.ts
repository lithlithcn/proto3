import { type SpellDef, TAU, addB } from '@pack/combat/api';

/** Nue Sign「Undefined Darkness」: every 7 frames a spinning ring of 6 slow red / violet bullets. */
export const nueSpell: SpellDef = {
  name: 'Nue Sign「Undefined Darkness」', loop: 200,
  fn({ s, p, k }) {
    if (k % 7) return;
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + k * 0.05; addB(s, p, a, 3.2, { life: 240, col: i % 2 ? 0x6a2aff : 0xff2a6a }); }
  },
};
