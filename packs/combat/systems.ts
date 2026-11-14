import type { SystemDef } from '@kernel';
import { combatOf } from './api';
import { bufferInputs } from './input';
import { updateBullets } from './bullets/update';
import { holdFrame } from './player/hitstun';
import { physics } from './player/physics';
import { updatePlayer } from './player/update';
import { pickTarget } from './target';
import { spiritBegin, spiritEnd } from './spirit';

/**
 * Frame gate (legacy start of `step`): KO slow-motion skips 2 of 3 steps WITHOUT advancing game time; hit-stop freezes the world.
 * `gf` is game time (legacy `frame`); the kernel frame keeps counting wall steps so inputs and rollback stay aligned.
 */
const gate: SystemDef = {
  id: 'gate', phase: 'pre',
  run(w) {
    const s = combatOf(w);
    s.skip = 0;
    if (s.slow > 0) { s.slow--; if (s.slow % 3) { s.skip = 1; return; } }
    s.gf++;
    for (let p = 0; p < s.n; p++) pickTarget(s, p);
    if (s.hitstop > 0) { holdFrame(w, s); s.skip = 1; }
  },
};
const players: SystemDef = { id: 'players', phase: 'sim', run(w) { const s = combatOf(w); if (s.skip) return; for (let p = 0; p < s.n; p++) updatePlayer(w, s, p); } };
const phys: SystemDef = { id: 'physics', phase: 'sim', after: ['players'], run(w) { const s = combatOf(w); if (s.skip) return; for (let p = 0; p < s.n; p++) physics(w, s, p); } };
const bullets: SystemDef = { id: 'bullets', phase: 'sim', after: ['physics'], run(w) { const s = combatOf(w); if (s.skip) return; updateBullets(w, s); } };
const buffer: SystemDef = { id: 'input-buffer', phase: 'sim', after: ['bullets'], run(w) { const s = combatOf(w); if (!s.skip) bufferInputs(w, s); } };
export const systems: SystemDef[] = [spiritBegin, gate, players, phys, bullets, buffer, spiritEnd];
