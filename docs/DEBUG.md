# Debugging (skeleton stage)
- Reproduce headless: `pnpm sim demo 600 1` writes `demo-replay.json`; `pnpm sim run file.json` prints final hash and checkpoint mismatches.
- Two runs diverge? `pnpm sim bisect a.json b.json` → first frame and fields.
- A hook/system keeps failing? `world.reports` lists frame, code, `pack:id`, message. Tests use `strict: true` to surface throws.
- Non-determinism suspected? Run with `sanitize: true`; any `Math.random`/`Date.now`/banned `Math.*` throws with a stack.
- Rollback bug? Compare `world.hash()` of straight run vs snapshot/restore run; `world.diff(a,b)` names the field. See `tests/kernel.test.ts`.
More tools (inspector, journal, deep links, lab) arrive with the dev-tools and lab packs (DESIGN §12–13, §19).
