import type { SystemDef, World } from '@kernel';
import { type CharacterDef, characters, charOf, combatOf } from './api';
import { PS, type CombatState } from './state';
import { EK_RAY, bulletMods, stepRay, waveBullets } from './rays';
import { updateClone } from './items/clone';
import { updateTimeStop } from './items/timestop';
import { bufferInputs } from './input';
import { updateBeams } from './kobeam';
import { tickFx } from './fx';
import { updateCards } from './items/cards';
import { updateItemWorld } from './items/world';
import { driftBumpers } from './items/bumpers';
import { updateFreezeQueue } from './items/freeze';
import { updateEnts } from './ents';
import { motion } from './bullets/pattern';
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
/** The World: time is stopped for everyone but the holder (legacy `fz`). */
const stopped = (s: CombatState, p: number): boolean => s.tstop > 0 && p !== s.tso;
const players: SystemDef = { id: 'players', phase: 'sim', run(w) { const s = combatOf(w); if (s.skip) return; for (let p = 0; p < s.n; p++) if (!stopped(s, p)) updatePlayer(w, s, p); } };
const phys: SystemDef = { id: 'physics', phase: 'sim', after: ['players'], run(w) { const s = combatOf(w); if (s.skip) return; for (let p = 0; p < s.n; p++) if (!stopped(s, p)) physics(w, s, p); } };
const bullets: SystemDef = { id: 'bullets', phase: 'sim', after: ['physics'], run(w) { const s = combatOf(w); if (s.skip || s.tstop > 0) return; updateBullets(w, s); } };
/** Character hooks (legacy `tick`): after the whole step, only on frames where time advances. */
const charTick: SystemDef = { id: 'char-tick', phase: 'sim', after: ['item-late'], run(w) { const s = combatOf(w); if (s.skip) return; settleSpirit(s); for (let p = 0; p < s.n; p++) if (s.state[p] !== PS.dead) charOf(w, s, p).tick?.(w, s, p); for (let p = 0; p < s.n; p++) s.spP[p] = s.spirit[p]!; } };
const items: SystemDef = { id: 'items', phase: 'sim', after: ['bullets'], run(w) { const s = combatOf(w); if (!s.skip) updateCards(w, s); } };
const itemWorld: SystemDef = { id: 'item-world', phase: 'sim', after: ['ko-beam'], run(w) { const s = combatOf(w); if (!s.skip) updateItemWorld(w, s); } };
const status: SystemDef = { id: 'status', phase: 'sim', after: ['item-world'], run(w) { const s = combatOf(w); if (!s.skip) tickFx(w, s); } };
/** Legacy end of the base `step` (where `stepFx` runs, also on hit-stop frames): presentation listeners tick their effects here; every later wrapper and `chStep` happen after it. */
const baseEnd: SystemDef = { id: 'base-end', phase: 'sim', after: ['bullet-motion', 'item-world', 'status'], run(w) { w.emit('combat:fx-tick', { gf: combatOf(w).gf }); } };
const itemLate: SystemDef = { id: 'item-late', phase: 'sim', after: ['base-end'], run(w) { const s = combatOf(w); if (!s.skip) { for (let p = 0; p < s.n; p++) if (s.state[p] !== PS.dead) updateClone(s, p); driftBumpers(s); updateFreezeQueue(s); updateTimeStop(w, s); } } };
/** Every legacy `step` wrapper (clone soak, bumpers, freeze queue, The World knives) runs AFTER the base step, bullet motion included -> item-late follows bullet-motion (this fixes the shared-rng draw order vs fn() callbacks). */
/** Legacy chStep: rays, per-bullet modifiers and entity handlers of characters, after every character hook. */
/** Legacy chStep entity loop: every entity (rays and character kinds alike) runs in creation order; entities spawned meanwhile run this same frame. */
const chars = (w: World): CharacterDef[] => characters(w).map(c => c[1]);
function entityPass(w: World, s: CombatState, post = false): void {
  for (let i = 0; i < s.nent; i++) {
    const o = s.eo[i]!, k = s.ek[i]!; if (k === EK_RAY) { if (!post) stepRay(w, s, i); continue; }
    if (s.state[o] === PS.dead) continue;
    const h = chars(w).find(c => { const r = post ? c.postKinds : c.entKinds; return r && k >= r[0] && k <= r[1]; });
    if (h) { s.eLo = i; s.eHi = i + 1; (post ? h.postEnts! : h.ents!)(w, s, o); }
  }
}
const rayStep: SystemDef = { id: 'ray-step', phase: 'sim', after: ['char-tick'], run(w) { const s = combatOf(w); if (s.skip) return; entityPass(w, s); bulletMods(s); entityPass(w, s, true); for (let p = 0; p < s.n; p++) if (s.state[p] !== PS.dead) charOf(w, s, p).post?.(w, s, p); waveBullets(s); for (let p = 0; p < s.n; p++) s.spP[p] = s.spirit[p]!; } };
const beams: SystemDef = { id: 'ko-beam', phase: 'sim', after: ['items'], run(w) { const s = combatOf(w); if (!s.skip) updateBeams(w, s); } };
const ents: SystemDef = { id: 'entities', phase: 'sim', after: ['status'], run(w) { const s = combatOf(w); if (!s.skip) updateEnts(s); } };
const buffer: SystemDef = { id: 'input-buffer', phase: 'sim', after: ['entities'], run(w) { const s = combatOf(w); if (!s.skip) bufferInputs(w, s); } };
const motionStep: SystemDef = { id: 'bullet-motion', phase: 'sim', after: ['input-buffer'], run(w) { const s = combatOf(w); if (!s.skip) motion(s, w); } };
export const systems: SystemDef[] = [spiritBegin, gate, players, phys, bullets, items, beams, itemWorld, status, ents, buffer, baseEnd, itemLate, motionStep, charTick, rayStep, spiritEnd];
