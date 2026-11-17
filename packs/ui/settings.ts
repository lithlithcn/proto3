/** Match rules + player options chosen in the menus (legacy globals nP, nH, cpuLv, stI, TIMER, mapI, itemsOn, COMP, TEAMS, TEAMA, NERV, maxC, fxLow/fxOff).
 *  Persisted with the legacy localStorage keys and formats so an old save imports as is (sf_opts, sf_comp, sf_timer, sf_fxoff, sf_stats, sf_nick, sf_pic). */
export const MAPS = [{ name: 'Large', w: 2000, h: 1350, edge: 140 }, { name: 'Screen (fixed camera)', w: 0, h: 0, edge: 70 }];
export const STOCKS = Array.from({ length: 99 }, (_, i) => i + 1);
export const SET = {
  nP: 2, nH: 1, cpuLv: 5, maxC: 1, stI: 2, timer: 0, mapI: 0, itemsOn: true, comp: false, teams: false, teamA: Array.from({ length: 32 }, (_, i) => i % 2), nerv: 10,
  fxLow: false, fxOff: false, itemOn: {} as Record<string, boolean>,
  /** stats (wins, KOs, matches) for the hub profile card */ st: { w: 0, k: 0, m: 0 }, nick: '', pic: null as string | null,
};
/** Maps the menu can pick (custom maps from the map maker join in lot 4). */
export const allMaps = (): { name: string }[] => MAPS;

type Store = Pick<Storage, 'getItem' | 'setItem'>;
const get = (s: Store, k: string): string | null => { try { return s.getItem(k); } catch { return null; } };
const put = (s: Store, k: string, v: string): void => { try { s.setItem(k, v); } catch { /* private mode / quota: settings stay in memory */ } };

export function loadSettings(s: Store): void {
  try {
    const o = JSON.parse(get(s, 'sf_opts') ?? 'null') as Record<string, unknown> | null;
    if (o) {
      for (const k of ['nP', 'nH', 'stI', 'mapI'] as const) if (typeof o[k] === 'number') SET[k] = o[k] as number;
      if (typeof o['itemsOn'] === 'boolean') SET.itemsOn = o['itemsOn']; if (typeof o['fxLow'] === 'boolean') SET.fxLow = o['fxLow'];
      if (o['cpuLv']) SET.cpuLv = o['cpuLv'] as number; if (o['maxC']) SET.maxC = o['maxC'] as number; if (o['TEAMS'] !== undefined) SET.teams = !!o['TEAMS'];
      if (Array.isArray(o['TEAMA'])) (o['TEAMA'] as number[]).forEach((t, i) => { if (i < 8) SET.teamA[i] = t & 3; });
      if (o['NERV'] !== undefined) SET.nerv = o['NERV'] as number; Object.assign(SET.itemOn, o['itemOn'] ?? {});
    }
  } catch { /* corrupt save: defaults */ }
  SET.comp = get(s, 'sf_comp') === '1'; SET.timer = +(get(s, 'sf_timer') ?? 0) || 0; SET.fxOff = get(s, 'sf_fxoff') === '1';
  try { Object.assign(SET.st, JSON.parse(get(s, 'sf_stats') ?? '{}')); } catch { /* keep zeros */ }
  SET.nick = get(s, 'sf_nick') ?? ''; SET.pic = get(s, 'sf_pic');
}
export function saveSettings(s: Store): void {
  put(s, 'sf_opts', JSON.stringify({ nP: SET.nP, nH: SET.nH, stI: SET.stI, mapI: SET.mapI, itemsOn: SET.itemsOn, fxLow: SET.fxLow, itemOn: SET.itemOn, cpuLv: SET.cpuLv, maxC: SET.maxC, TEAMS: SET.teams, TEAMA: SET.teamA, NERV: SET.nerv }));
  put(s, 'sf_comp', SET.comp ? '1' : '0'); put(s, 'sf_timer', String(SET.timer)); put(s, 'sf_fxoff', SET.fxOff ? '1' : '0');
}
