# ADR 0001 — Micro-kernel + packs
Context: the old game is one 1.2 MB script with 69 functions wrapped by later layers; behaviour depends on wrapper order and nothing can be tested or extended safely.
Decision: a tiny frozen kernel; every feature (built-in or mod) is a pack with the same manifest. Boundaries enforced by lint.
Rejected: keep patching the old file (unmaintainable); ECS framework (too heavy, still needs the same contracts); separate npm packages per pack (overhead for one app).
