import { type Schema, f64, f64s, i32, i32s } from '@kernel';

export const MAXP = 32;
export const MAX_B = 900;
export const NBTN = 10;
export const MAX_KB = 16;
export const MAX_ENT = 128;
export const MAX_CARD = 16;
export const MAX_ITEMS = 160;
/** Card kind of the Last Word (ultimate) card: not content, owned by combat. */
export const CARD_ULT = -2;
export const MAX_FX = 128;
/** Hit sources tracked for the stun-repeat reduction (see moves.ts `SRC`). */
export const NSRC = 128;
/** Player states (legacy strings → ints). */
export const PS = { idle: 0, dash: 1, dashlag: 2, dead: 3, hitstun: 4, atk: 5, spell: 6, parry: 7, parrylag: 8, parrystun: 9, eaten: 10, cocoon: 11, pray: 12, rifle: 13, bursting: 14, succeeded: 15, broken: 16 } as const;
export type PlayerState = (typeof PS)[keyof typeof PS];
/** Legacy bullet tags (b.star, b.note, b.flower ...) read by item rules and draws; `elset` = legacy b.el already assigned, `rxd` = legacy b.rxD (its element was applied). */
export const BT = { star: 1, note: 2, flower: 4, yy: 8, pure: 16, weird: 32, water: 64, coc: 128, anni: 256, gung: 512, sway: 1024, rxd: 2048, elset: 4096 } as const;
/** Bullet flags. */
export const BF = { heavy: 1, dead: 2, grazed: 4, breaker: 8, np: 16, frozen: 32, pierce: 64, oneshot: 128, rifle: 256, hgr: 512, fake: 1024, mute: 2048, dark: 4096 } as const;

/** Combat state slice. Players: struct-of-arrays indexed by player id. Bullets: struct-of-arrays, compacted every frame (order preserved). */
export const combatSchema: Schema = {
  // match scalars
  gf: i32(), n: i32(), nb: i32(), nextBid: i32(), nextEid: i32(), tempo: f64(10), mapW: f64(2000), mapH: f64(1350), edge: f64(140),
  teams: i32(), winner: i32(-1), winT: i32(), hitstop: f64(), slow: i32(), skip: i32(),
  // players (f64)
  x: f64s(MAXP), y: f64s(MAXP), vx: f64s(MAXP), vy: f64s(MAXP), hp: f64s(MAXP), boost: f64s(MAXP), spirit: f64s(MAXP), power: f64s(MAXP), burst: f64s(MAXP),
  aim: f64s(MAXP), shotCd: f64s(MAXP), dashCd: f64s(MAXP), slide: f64s(MAXP), inv: f64s(MAXP), flash: f64s(MAXP), t: f64s(MAXP), noSteer: f64s(MAXP),
  spP: f64s(MAXP), graze: f64s(MAXP), gStreak: f64s(MAXP), gLast: f64s(MAXP), techBuf: f64s(MAXP), comboT: f64s(MAXP),
  dmgDealt: f64s(MAXP), dmgTaken: f64s(MAXP), bigHit: f64s(MAXP), lastHitF: f64s(MAXP),
  kbx: f64s(MAXP), kby: f64s(MAXP), charge: f64s(MAXP), nextHit: f64s(MAXP), atkA: f64s(MAXP), carry: f64s(MAXP), lastByF: f64s(MAXP), stF: f64s(MAXP * NSRC), pg: f64s(MAXP), hch: f64s(MAXP), pLast: f64s(MAXP), pOK: f64s(MAXP), pStart: f64s(MAXP), pCnt: f64s(MAXP), sbT: f64s(MAXP), brCD: f64s(MAXP),
  // players (i32)
  state: i32s(MAXP), stocks: i32s(MAXP), run: i32s(MAXP), focus: i32s(MAXP), kicked: i32s(MAXP), spReady: i32s(MAXP), charIdx: i32s(MAXP), team: i32s(MAXP),
  cpu: i32s(MAXP), pips: i32s(MAXP), tgt: i32s(MAXP), prevB: i32s(MAXP), lastHit: i32s(MAXP), pStk: i32s(MAXP), outAt: i32s(MAXP), bufF: i32s(MAXP * NBTN),
  combo: i32s(MAXP), hHeld: i32s(MAXP), hLv: i32s(MAXP), parN: i32s(MAXP), pChain: i32s(MAXP), lstS: i32s(MAXP), bpv: i32s(MAXP), comboN: i32s(MAXP), mvId: i32s(MAXP), mvLast: i32s(MAXP), mvCh: i32s(MAXP), mHit: i32s(MAXP), hitDone: i32s(MAXP), charging: i32s(MAXP), diPend: i32s(MAXP), koPend: i32s(MAXP), bounceN: i32s(MAXP), lastBy: i32s(MAXP), stN: i32s(MAXP * NSRC),
  // spell cards
  spI: i32s(MAXP), ultS: i32s(MAXP), ult: i32s(MAXP), spN: i32s(MAXP), spHv: i32s(MAXP), spellHit: i32s(MAXP), spRef: f64s(MAXP), spPick: i32(-1), eLo: i32(0), eHi: i32(0), spSeed: i32(1),
  // players: KO tally, spit (thrown to the wall)
  kos: i32s(MAXP), sd: i32s(MAXP), spit: i32s(MAXP), beamPip: i32s(MAXP),
  // skills (next = skill 1, prev = skill 2): edge flags + cooldown deadlines
  skPN: i32s(MAXP), skPP: i32s(MAXP), slowT: f64s(MAXP), skC1: f64s(MAXP), skC2: f64s(MAXP),
  // entities (legacy ENT): small pool of typed world objects owned by a player, kind ids are defined by content
  nent: i32(), eid: i32s(MAX_ENT), eborn: i32s(MAX_ENT), ek: i32s(MAX_ENT), eo: i32s(MAX_ENT), eg: i32s(MAX_ENT), et: f64s(MAX_ENT), ex: f64s(MAX_ENT), ey: f64s(MAX_ENT), evx: f64s(MAX_ENT), evy: f64s(MAX_ENT), ea: f64s(MAX_ENT), er: f64s(MAX_ENT), ew: f64s(MAX_ENT), eh: f64s(MAX_ENT), ebc: f64s(MAX_ENT), efl: f64s(MAX_ENT), ed: f64s(MAX_ENT), ekb: f64s(MAX_ENT), est: f64s(MAX_ENT), ec: i32s(MAX_ENT), ehc: f64s(MAX_ENT * MAXP),
  // item cards (legacy CARDS/itemT/ultT) and item-granted timers
  itemT: i32(), ultT: i32(), maxC: i32(1), itemsOn: i32(1), ncard: i32(), cx: f64s(MAX_CARD), cy: f64s(MAX_CARD), ckind: i32s(MAX_CARD), con: i32s(MAX_CARD), cage: i32s(MAX_CARD), ccont: i32s(MAX_CARD), ccp: f64s(MAX_CARD * MAXP), itemOn: i32s(MAX_ITEMS),
  fx: i32s(MAXP * MAX_FX), frz: i32(), frzO: i32(), frzqN: i32(), frzqF: f64(), frzqO: i32(), hCD: f64s(MAXP), uCD: f64s(MAXP),
  mirror: i32s(MAXP), giant: i32s(MAXP), lastIt: i32s(MAXP), blade: i32s(MAXP), bombs: i32s(MAXP), bombN: i32s(MAXP), bA: f64s(MAXP), bCD: f64s(MAXP * MAXP), warp: i32(),
  // base items: rifle shots left, camera snaps left, clone (timer + hp), Master Spark (timer, aim, hit cooldown), The World (charge timer + holder, time stop timer + holder)
  rifle: i32s(MAXP), cam: i32s(MAXP), clone: i32s(MAXP), spk: i32s(MAXP), cloneHP: f64s(MAXP), spkA: f64s(MAXP), sCD: f64s(MAXP), zawT: i32(), zawO: i32(), tstop: i32(), tso: i32(-1),
  // KO beams
  nkb: i32(), kbO: i32s(MAX_KB), kbPP: i32s(MAX_KB), kbDep: i32s(MAX_KB), kbX: f64s(MAX_KB), kbY: f64s(MAX_KB), kbA: f64s(MAX_KB), kbT: f64s(MAX_KB), kbTT: f64s(MAX_KB),
  // bullets
  bx: f64s(MAX_B), by: f64s(MAX_B), bvx: f64s(MAX_B), bvy: f64s(MAX_B), br: f64s(MAX_B), bdmg: f64s(MAX_B), blife: f64s(MAX_B), bhome: f64s(MAX_B), bdist: f64s(MAX_B), bmult: f64s(MAX_B),
  bid: i32s(MAX_B), bborn: i32s(MAX_B), bowner: i32s(MAX_B), bflags: i32s(MAX_B), bcol: i32s(MAX_B), brefl: i32s(MAX_B), bmv: i32s(MAX_B), bkb: f64s(MAX_B), bstun: f64s(MAX_B), barm: f64s(MAX_B), bspl: f64s(MAX_B), bmst: f64s(MAX_B), bct: f64s(MAX_B), bsea: i32s(MAX_B), bnsf: f64s(MAX_B), bwav: f64s(MAX_B), bph: f64s(MAX_B), btx: f64s(MAX_B), bty: f64s(MAX_B),
  // programmable bullets (spell patterns): age, behaviour kind + params, steering, shape id, group tag
  /** legacy boolean bullet tags used by item rules (BT) and the element of the bullet (legacy b.el; BT.elset = assigned) */ btag: i32s(MAX_B), bel: i32s(MAX_B), /** legacy b.bf + 1 (0 = unset): frame stamped on the bullet at the first full step after its birth (wrapper line 2394; draws its appearance ring) */ bbf: i32s(MAX_B),
  bag: i32s(MAX_B), bkind: i32s(MAX_B), bsh: i32s(MAX_B), bgrp: i32s(MAX_B), bang: f64s(MAX_B), brot: f64s(MAX_B), bdrg: f64s(MAX_B), bacc: f64s(MAX_B), bvmax: f64s(MAX_B), bp0: f64s(MAX_B), bp1: f64s(MAX_B), bcast: i32s(MAX_B), bp2: f64s(MAX_B),
};

export interface CombatState {
  gf: number; n: number; nb: number; nextBid: number; nextEid: number; tempo: number; mapW: number; mapH: number; edge: number; teams: number; winner: number; winT: number; hitstop: number; slow: number; skip: number;
  x: Float64Array; y: Float64Array; vx: Float64Array; vy: Float64Array; hp: Float64Array; boost: Float64Array; spirit: Float64Array; power: Float64Array; burst: Float64Array;
  aim: Float64Array; shotCd: Float64Array; dashCd: Float64Array; slide: Float64Array; inv: Float64Array; flash: Float64Array; t: Float64Array; noSteer: Float64Array;
  spP: Float64Array; graze: Float64Array; gStreak: Float64Array; gLast: Float64Array; techBuf: Float64Array; comboT: Float64Array;
  dmgDealt: Float64Array; dmgTaken: Float64Array; bigHit: Float64Array; lastHitF: Float64Array;
  kbx: Float64Array; kby: Float64Array; charge: Float64Array; nextHit: Float64Array; atkA: Float64Array; carry: Float64Array; lastByF: Float64Array; stF: Float64Array; pg: Float64Array; hch: Float64Array; pLast: Float64Array; pOK: Float64Array; pStart: Float64Array; pCnt: Float64Array; sbT: Float64Array; brCD: Float64Array;
  state: Int32Array; stocks: Int32Array; run: Int32Array; focus: Int32Array; kicked: Int32Array; spReady: Int32Array; charIdx: Int32Array; team: Int32Array;
  cpu: Int32Array; pips: Int32Array; tgt: Int32Array; prevB: Int32Array; lastHit: Int32Array; pStk: Int32Array; outAt: Int32Array; bufF: Int32Array;
  combo: Int32Array; hHeld: Int32Array; hLv: Int32Array; parN: Int32Array; pChain: Int32Array; lstS: Int32Array; bpv: Int32Array; comboN: Int32Array; mvId: Int32Array; mvLast: Int32Array; mvCh: Int32Array; mHit: Int32Array; hitDone: Int32Array; charging: Int32Array; diPend: Int32Array; koPend: Int32Array; bounceN: Int32Array; lastBy: Int32Array; stN: Int32Array;
  spI: Int32Array; ultS: Int32Array; ult: Int32Array; spN: Int32Array; spHv: Int32Array; spellHit: Int32Array; spRef: Float64Array; spPick: number; eLo: number; eHi: number; spSeed: number;
  kos: Int32Array; sd: Int32Array; spit: Int32Array; beamPip: Int32Array;
  skPN: Int32Array; skPP: Int32Array; slowT: Float64Array; skC1: Float64Array; skC2: Float64Array;
  nent: number; eid: Int32Array; eborn: Int32Array; ek: Int32Array; eo: Int32Array; eg: Int32Array; et: Float64Array; ex: Float64Array; ey: Float64Array; evx: Float64Array; evy: Float64Array; ea: Float64Array; er: Float64Array; ew: Float64Array; eh: Float64Array; ebc: Float64Array; efl: Float64Array; ed: Float64Array; ekb: Float64Array; est: Float64Array; ec: Int32Array; ehc: Float64Array;
  itemT: number; ultT: number; maxC: number; itemsOn: number; ncard: number; cx: Float64Array; cy: Float64Array; ckind: Int32Array; con: Int32Array; cage: Int32Array; ccont: Int32Array; ccp: Float64Array; itemOn: Int32Array;
  fx: Int32Array; frz: number; frzO: number; frzqN: number; frzqF: number; frzqO: number; hCD: Float64Array; uCD: Float64Array;
  mirror: Int32Array; giant: Int32Array; lastIt: Int32Array; blade: Int32Array; bombs: Int32Array; bombN: Int32Array; bA: Float64Array; bCD: Float64Array; warp: number;
  rifle: Int32Array; cam: Int32Array; clone: Int32Array; spk: Int32Array; cloneHP: Float64Array; spkA: Float64Array; sCD: Float64Array; zawT: number; zawO: number; tstop: number; tso: number;
  nkb: number; kbO: Int32Array; kbPP: Int32Array; kbDep: Int32Array; kbX: Float64Array; kbY: Float64Array; kbA: Float64Array; kbT: Float64Array; kbTT: Float64Array;
  bx: Float64Array; by: Float64Array; bvx: Float64Array; bvy: Float64Array; br: Float64Array; bdmg: Float64Array; blife: Float64Array; bhome: Float64Array; bdist: Float64Array; bmult: Float64Array;
  bid: Int32Array; bborn: Int32Array; bowner: Int32Array; bflags: Int32Array; bcol: Int32Array; brefl: Int32Array; bmv: Int32Array; bkb: Float64Array; bstun: Float64Array; barm: Float64Array; bspl: Float64Array; bmst: Float64Array; bct: Float64Array; bsea: Int32Array; bnsf: Float64Array; bwav: Float64Array; bph: Float64Array; btx: Float64Array; bty: Float64Array;
  btag: Int32Array; bel: Int32Array; bbf: Int32Array;
  bag: Int32Array; bkind: Int32Array; bsh: Int32Array; bgrp: Int32Array; bang: Float64Array; brot: Float64Array; bdrg: Float64Array; bacc: Float64Array; bvmax: Float64Array; bp0: Float64Array; bp1: Float64Array; bcast: Int32Array; bp2: Float64Array;
}
