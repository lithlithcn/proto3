# Error codes
| Code | Meaning | Typical fix |
|---|---|---|
| E_PACK_DUP | same pack id loaded twice | remove duplicate |
| E_PACK_MISSING_DEP | `requires` names a pack that is not loaded | add the pack / fix id |
| E_PACK_VERSION | dependency version out of range | update the pack or its `requires` range |
| E_PACK_CYCLE | circular `requires` | split shared code into a third pack |
| E_PACK_OVERRIDE | content id replaced without `overrides`, or overriding something that does not exist yet | list it in `overrides`; check load order |
| E_CONTENT_DUP / E_CONTENT_TYPE | duplicate id / content type not declared by any pack | rename / declare it in `contentTypes` |
| E_ORDER_CYCLE | cycle in `after` of systems/hooks | remove one constraint |
| E_EVENT_UNKNOWN / E_EVENT_DEPTH | emit/hook on undeclared event / chain deeper than 32 | declare it in `events`; break the loop |
| E_HOOK_FAIL / E_SYSTEM_FAIL | hook/system threw and was disabled (see `world.reports`) | fix the throw |
| E_SANITIZER | banned non-deterministic API called in sim | use `sim.math`, `w.rng()`, frame counters |
| E_HANDLE_FULL | entity table full | raise max or fix a leak |
| E_REPLAY / E_STATE | replay/pack mismatch; unknown rng stream etc. | re-record; declare the stream |
