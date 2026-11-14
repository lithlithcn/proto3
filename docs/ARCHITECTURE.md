# Architecture (as built)

```
src/kernel   frozen micro-kernel: loop, math, rng, schema/state, handles, pack loader, events, world, input, replay, sanitizer
packs/*      everything else (content, systems, UI, render, audio, online…), one folder per pack, same format for built-ins and mods
src/main.ts  browser boot; src/packs.ts discovers packs by folder convention
tools/       lint rules, headless sim CLI, legacy audit
legacy/      frozen old game + workers (parity baseline)
```

## Data flow of one sim step (`World.step`)
input frame → `frame` event → systems by phase `input → pre → sim → post` (ordered by `after`, ties by pack load order) → hooks fire synchronously from `emit` (`before → apply → after`; emits inside hooks are queued FIFO, depth ≤ 32) → previous-buttons updated → `frame++`.
All mutable state is in `world.state[<pack id>]` slices described by schemas; `snapshot()/restore()` copy slices without allocation; `hash()` is FNV-1a over schema fields; `diff()` names differing fields.

## Failure containment
A throwing hook/system is disabled from that frame on (flag stored in state, so rollback and every client agree) and reported in `world.reports`; `strict` rethrows (tests). With `sanitize`, non-deterministic APIs throw inside a step.

## Not built yet (see DESIGN)
Bullet storage, spatial grid, statuses/stat pipeline, commands, history service, time scale, worlds/flows, UI screens, renderer, audio, online (rollback driver), lab, dev-tools, mods loader, i18n.
