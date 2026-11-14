# ADR 0002 — Own deterministic math and RNG streams
Context: online rollback needs bit-identical results on every browser; engines may differ in `Math.sin/cos/atan2/pow/exp/log` last bits. The old code used them ~1,600 times plus `Math.random` 142 times.
Decision: `sim.math` implemented with only IEEE-exact operations (accuracy ~1e-15, tested at 1e-12); lint + runtime sanitizer ban the native ones; RNG = sfc32 streams per pack stored in state.
Consequence: results differ from the legacy game at ~1e-12, so parity is tolerance-based on short scenarios.
Rejected: fixed-point integers (rewrites all balance numbers, hurts readability); trusting engines to agree.
