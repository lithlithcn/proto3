# PROJECT_MAP — to change X, open Y

| I want to… | Open |
|---|---|
| change the fixed loop / timing | `src/kernel/loop.ts` |
| change deterministic math | `src/kernel/math.ts` (+ `tests/math.test.ts`; golden snapshot must be updated deliberately) |
| change RNG streams | `src/kernel/rng.ts` |
| change state schema types, snapshot, hash, diff | `src/kernel/schema.ts` |
| change entity handles | `src/kernel/handles.ts` |
| change pack manifest / load order / content registry / overrides | `src/kernel/pack.ts` |
| change event dispatch, system ordering, stepping, rollback API | `src/kernel/world.ts` |
| change input frame / buttons | `src/kernel/input.ts` |
| change replay / bug-report format | `src/kernel/replay.ts` |
| add a sim rule check (banned API, boundaries, file size) | `tools/lint/check.mjs` |
| run / compare replays headless | `tools/sim/cli.ts` (`pnpm sim …`) |
| change movement / dash / glide / walls | `packs/combat/player/{idle,dash,physics}.ts` |
| change a balance constant | `packs/combat/tuning.ts` (parity-tested against legacy) |
| change bullets (spawn, move, graze, damage) | `packs/combat/bullets/`, `packs/combat/player/{graze,damage}.ts` |
| change hits, hit-stun, DI, knockback, combos | `packs/combat/player/{hit,hitstun}.ts` (+ `moves.ts` data) |
| change melee moves | `packs/combat/moves.ts` (defaults), `packs/combat/player/{melee,atkstart}.ts`, per-character `melee` in `CharacterDef` |
| change parry / grab / guard gauge | `packs/combat/player/parry.ts` |
| change KO / respawn | `packs/combat/player/{ko,respawn}.ts` |
| add or change a character | `packs/touhou/characters/<id>/` (+ `CharacterDef` in `packs/combat/character.ts`) |
| compare with the old game | `tests/parity/` + `tools/parity/legacy.cjs` |
| see how a pack looks | `packs/sandbox/pack.ts` (demo only) |
| boot the game in the browser | `src/main.ts`, `src/packs.ts` (auto-discovers `packs/*/pack.ts`) |
| CI / deploy | `.github/workflows/ci.yml` |
| old-game behaviour (parity reference) | `legacy/shmup-fighter.html`, `docs/INVENTORY*.md`, `tools/audit/` |
| old Workers (TURN, playlist proxy) | `legacy/workers/` |
| design decisions | `docs/DESIGN.md`, `docs/adr/` |

Everything gameplay-related will live under `packs/<id>/` (see DESIGN §2.2, §15).

- Heavy shots: `packs/combat/player/heavy.ts` (fire, recoil), `packs/combat/bullets/heavy.ts` (contact, reflect, clash), charge logic in `packs/combat/input.ts`; per-char: `packs/touhou/characters/<c>/heavy.ts` + `tick.ts`.
- KO beam: `packs/combat/kobeam.ts` (aim/fire/reflect), winner ranking `packs/combat/rank.ts`, wall push in `player/physics.ts` (`spit`).
- Spell cards: `packs/combat/player/spell.ts` (cast/update/end/input), card data per character in `packs/touhou/characters/<c>/spell.ts`, shared cards = content type `spell`.
- Entities (orbs, bars…): `packs/combat/ents.ts`; Reimu's in `packs/touhou/characters/reimu/{orbs,inp,border,tick}.ts`; character hooks `inp/skill1/skill2` in `packs/combat/character.ts`.
- Item cards / give: `packs/combat/items/cards.ts`; item defs (one file each, content type `item`): `packs/touhou/items/<id>.ts`; per-item logic: `items/{blade,bombs,hole,bumpers,freeze,rifle(+camera snap),fairy,clone,spark,timestop}.ts` (K.O./respawn reset list: `items/reset.ts`), orchestrated in `items/world.ts` (legacy updWorld order); mirror bounce: `bullets/mirror.ts`. Rays: `packs/combat/rays.ts`; Marisa: `packs/touhou/characters/marisa/` (heavy, dash, skills, ents, spell). Flandre: `packs/touhou/characters/flandre/`; Hecatia: `packs/touhou/characters/hecatia/`; shared hazard hit: `packs/combat/chhit.ts`. Nue: `packs/touhou/characters/nue/` (+ `packs/touhou/systems/disguise.ts`). Okina: `packs/touhou/characters/okina/`.
- Statuses (`fx`): framework `packs/combat/fx.ts` (slots `FXS`, tick, end hooks), one file per status in `packs/touhou/statuses/<id>.ts` (content type `status`), KO guards as hooks in `packs/touhou/hooks/`.
- Bullet patterns/behaviours: `packs/combat/bullets/pattern.ts`; per-bullet columns list `bullets/arrays.ts`; shared cards `packs/touhou/spells/NN-name.ts`.
