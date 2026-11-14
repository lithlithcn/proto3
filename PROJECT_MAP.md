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
