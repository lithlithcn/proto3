# ADR 0003 — Schema-declared plain-data state
Context: the old netcode snapshots the whole object graph generically, including visual state; anything forgotten silently desyncs, and hashing is ad hoc.
Decision: each pack declares a schema (numbers + typed arrays). Snapshot, restore, hash and diff are generated from it with no per-frame allocation.
Consequence: no objects/classes in state; variable-size collections need fixed capacity (bullets: struct-of-arrays, later).
Rejected: generic deep-walk snapshots (slow, hides omissions); JSON hashing (order/locale hazards).
