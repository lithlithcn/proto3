import type { SystemDef } from '@kernel';
import { charOf, combatOf } from './api';
import { PS } from './state';
import { bufferInputs } from './input';
import { updateBeams } from './kobeam';
import { tickFx } from './fx';
import { updateCards } from './items/cards';
import { updateItemWorld } from './items/world';
import { driftBumpers } from './items/bumpers';
import { updateFreezeQueue } from './items/freeze';
import { updateEnts } from './ents';
import { behave } from './bullets/pattern';
import { updateBullets } from './bullets/update';
import { holdFrame } from './player/hitstun';
import { physics } from './player/physics';
import { updatePlayer } from './player/update';
import { pickTarget } from './target';
import { settleSpirit, spiritBegin, spiritEnd } from './spirit';

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
/** Character hooks (legacy `tick`): after the whole step, only on frames where time advances. */
const charTick: SystemDef = { id: 'char-tick', phase: 'sim', after: ['input-buffer'], run(w) { const s = combatOf(w); if (s.skip) return; settleSpirit(s); for (let p = 0; p < s.n; p++) if (s.state[p] !== PS.dead) charOf(w, s, p).tick?.(w, s, p); for (let p = 0; p < s.n; p++) s.spP[p] = s.spirit[p]!; } };
const items: SystemDef = { id: 'items', phase: 'sim', after: ['bullets'], run(w) { const s = combatOf(w); if (!s.skip) updateCards(w, s); } };
const itemWorld: SystemDef = { id: 'item-world', phase: 'sim', after: ['ko-beam'], run(w) { const s = combatOf(w); if (!s.skip) updateItemWorld(w, s); } };
const status: SystemDef = { id: 'status', phase: 'sim', after: ['item-world'], run(w) { const s = combatOf(w); if (!s.skip) tickFx(w, s); } };
const itemLate: SystemDef = { id: 'item-late', phase: 'sim', after: ['char-tick'], run(w) { const s = combatOf(w); if (!s.skip) { driftBumpers(s); updateFreezeQueue(s); } } };
const beams: SystemDef = { id: 'ko-beam', phase: 'sim', after: ['items'], run(w) { const s = combatOf(w); if (!s.skip) updateBeams(w, s); } };
const ents: SystemDef = { id: 'entities', phase: 'sim', after: ['status'], run(w) { const s = combatOf(w); if (!s.skip) updateEnts(s); } };
const buffer: SystemDef = { id: 'input-buffer', phase: 'sim', after: ['entities'], run(w) { const s = combatOf(w); if (!s.skip) bufferInputs(w, s); } };
const behaviours: SystemDef = { id: 'bullet-behaviours', phase: 'sim', after: ['item-late'], run(w) { const s = combatOf(w); if (!s.skip) behave(s); } };
export const systems: SystemDef[] = [spiritBegin, gate, players, phys, bullets, items, beams, itemWorld, status, ents, buffer, charTick, itemLate, behaviours, spiritEnd];
