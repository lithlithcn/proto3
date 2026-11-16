# Game knowledge base (English, for Claude and humans)

One short sheet per precise thing of the game. Rule: **a port/fix/feature is not done until its sheet exists or is updated** (DESIGN §21). Keep sheets short; do not paste code — point to it.

Layout: `mechanics/<name>.md` (cross-cutting rules), `characters/<id>.md`, `items/<id>.md`. Machine-readable sources of truth stay in `docs/quirks.json` (legacy oddities) and `docs/parity-ledger.json` (what is validated).

## Sheet template
```
# <Name>
## Rule            what the game does, observable behaviour
## Legacy          where it lives in legacy/shmup-fighter.html (function names / search strings, NOT line numbers) + oddities
## Port            files + function names that implement it (backticked paths are checked by tests/docs.test.ts)
## Tests           parity tests / regressions / scenarios covering it
## Bugs            one line per fixed bug: symptom -> cause -> report (tests/regressions/...)
```
Links to code use file paths and symbol names (stable), never line numbers (they rot). `tests/docs.test.ts` fails when a backticked `packs/`, `src/`, `tools/` or `tests/` path in a sheet no longer exists.

## Index
- [bugs.md](bugs.md) — every fixed bug: symptom, cause, failed attempts, fix
- [mechanics/frame-order.md](mechanics/frame-order.md) — legacy step order vs port systems (3 bugs came from this)
- [mechanics/render.md](mechanics/render.md) — view/camera/arena/actors, what is ported and what is not
- [mechanics/audio.md](mechanics/audio.md) — sound effects: sites, player, gains, cooldown, reverb, ENDK
- [mechanics/doppelganger.md](mechanics/doppelganger.md) — clone item and its bare stand-in
