# SHMUP FIGHTER — Proto3

Complete rewrite of SHMUP FIGHTER (Touhou fan game): deterministic micro-kernel + everything as packs/mods.

- Design guide: [`docs/DESIGN.md`](docs/DESIGN.md)
- Parity checklist: [`docs/INVENTORY.md`](docs/INVENTORY.md) (+ generated [`docs/INVENTORY.generated.md`](docs/INVENTORY.generated.md))
- Frozen old game (parity baseline): [`legacy/`](legacy/)
- Audit tools: `tools/audit/` (`python3 tools/audit/extract.py && node tools/audit/dump.js build/legacy-main.js && node tools/audit/gen-inventory.js`)

Status: **Phase 2 — skeleton** (kernel, tests, lint, CI; no gameplay yet). Old game stays the main link until Proto3 reaches full parity.

Commands: `pnpm install` · `pnpm check` · `pnpm dev` · `pnpm sim demo`. Docs for contributors (and Claude): `CLAUDE.md`, `PROJECT_MAP.md`, `docs/ARCHITECTURE.md`.
