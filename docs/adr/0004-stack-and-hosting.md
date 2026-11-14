# ADR 0004 — TypeScript strict + Vite, GitHub Pages, sim on main thread
Decision: TypeScript strict, Vite, Vitest (+ Playwright later), static hosting on GitHub Pages deployed by Actions after all checks pass. Pages cannot send COOP/COEP headers, so no SharedArrayBuffer: the sim stays on the main thread; a Worker clock keeps hidden tabs ticking.
Online keeps PeerJS + Cloudflare TURN (`legacy/workers/turn-worker.js`, allow-listed to lithlithcn.github.io which also hosts Proto3).
Rejected: Rust/WASM (slower iteration, game not CPU-bound); PixiJS (only if a benchmark justifies it).
