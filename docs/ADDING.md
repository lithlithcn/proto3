# Adding things (recipes; grows with the project)
**New pack:** create `packs/<id>/pack.ts` with `definePack({ id, version, requires?, state?, systems?, hooks?, events?, rng?, content? })`. It is auto-discovered. Declare every event and RNG stream. Add a test next to it (`*.test.ts`). Keep ≤ 400 lines per file.
**New content type:** a pack lists it in `contentTypes`; any pack then adds `content: { <type>: { <name>: {...} } }` → id `<pack>:<name>`. Replacing existing content requires `overrides`.
**New system:** `systems: [{ id, phase, after?, run(w) }]`; read inputs via `w.x/y/buttons/held/pressed`, randomness via `w.rng('<pack>:<stream>')`, math via `w.math`.
**New hook:** `hooks: [{ id, event, phase: 'before'|'apply'|'after', after?, run(w, ev) }]`; only `before` may mutate/cancel.
Scaffolding commands (`pnpm new …`) come later (DESIGN §19).
