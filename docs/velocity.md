# Velocity log

One line per task: date · task · time · result. The point: measure features shipped per session.

- 2026-11-17 · Proto4 transition (legacy split into 136 files by theme, load-order fix, regress + smoke + map, CI) · ~1 h 15 · game identical to the original (8 matches × 2400 frames), browser OK
- 2026-11-17 · Engine step 1: content folders (tools/content.cjs) + declared modes (src/engine/modes.js: step/render/nav/input/touch/hub tile EXTRAS; 6 one-line hooks in boucle, menus, controles-tactiles, hub-principal, boot) · ~35 min (16:27→17:02) · regress PASS, smoke PASS incl. a test mode moved by keyboard; S1 skipped (not needed for modes)
