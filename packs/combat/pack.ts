import { cos, definePack, sin, PI } from '@kernel';
import { combatSchema, MAXP, PS, type CombatState } from './state';
import { MAP_LARGE, T, TAU } from './tuning';
import { systems } from './systems';
import { characters, spellPool } from './api';

/** World config read by this pack (DESIGN §20.2): `players: [{char, team?, cpu?}]`, `map?: {w,h,edge}`, `tempo?`, `stocks?`, `teams?`. */
interface PlayerCfg { char: string; team?: number; cpu?: boolean }

export default definePack({
  id: 'combat',
  version: '0.1.0',
  contentTypes: ['character', 'spell'],
  events: [
    'combat:graze', 'combat:power-up', 'combat:hit-light', 'combat:ko:before', 'combat:ko', 'combat:respawn', 'combat:spell-ready',
    'combat:dash', 'combat:glide', 'combat:wall-kick', 'combat:hit', 'combat:wall-pip', 'combat:tech', 'combat:wall-bounce', 'combat:cancel', 'combat:parry', 'combat:shield-break', 'combat:clash', 'combat:grab', 'combat:reflect', 'combat:heavy', 'combat:kobeam-fire', 'combat:kobeam-reflect', 'combat:kobeam-cancel', 'combat:wall-push', 'combat:spell', 'combat:spell-break', 'combat:spell-capture', 'combat:spell-refused', 'combat:spell-chip', 'combat:skill-cooldown', 'combat:ent-spawn',
  ],
  state: combatSchema,
  systems,
  init(w) {
    const s = w.slice<CombatState>('combat'), cfg = w.cfg.world ?? {}, ps = (cfg['players'] as PlayerCfg[] | undefined) ?? [];
    const map = { ...MAP_LARGE, ...((cfg['map'] as object | undefined) ?? {}) };
    const n = Math.min(MAXP, ps.length || w.players), chars = characters(w);
    s.spSeed = (w.cfg.seed ?? 1) | 0; s.n = n; s.mapW = map.w; s.mapH = map.h; s.edge = map.edge; s.tempo = (cfg['tempo'] as number | undefined) ?? 10; s.teams = cfg['teams'] ? 1 : 0;
    const stocks = (cfg['stocks'] as number | undefined) ?? T.STOCKS;
    const pool = spellPool(w);
    for (let i = 0; i < n; i++) {
      const own = pool.indexOf(chars[Math.max(0, chars.findIndex(c => c[0] === (ps[i]?.char ?? chars[0]?.[0] ?? '')))]?.[1]?.spell as never);
      const a = PI + i / n * TAU;
      s.x[i] = s.mapW / 2 + cos(a) * 300; s.y[i] = s.mapH / 2 + sin(a) * Math.min(300, s.mapH * 0.3);
      s.hp[i] = T.HP; s.stocks[i] = stocks; s.boost[i] = T.DASH_CHARGES; s.power[i] = 1; s.pips[i] = T.PIPS; s.inv[i] = 60; s.state[i] = PS.idle;
      s.burst[i] = T.BURST_MAX; s.pg[i] = 100; s.pLast[i] = -9999; s.pOK[i] = -1; s.gLast[i] = -99; s.tgt[i] = -1; s.lastHit[i] = -1; s.lastBy[i] = -1; s.spI[i] = own >= 0 ? own : -1; s.lastByF[i] = -1e9;
      const pc = ps[i], id = pc?.char ?? chars[0]?.[0] ?? '';
      s.charIdx[i] = Math.max(0, chars.findIndex(c => c[0] === id)); s.team[i] = pc?.team ?? i; s.cpu[i] = pc?.cpu ? 1 : 0;
    }
  },
});
