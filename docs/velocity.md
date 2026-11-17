# Velocity log

One line per task: date · task · time · result. The point: measure features shipped per session.

- 2026-11-17 · Proto4 transition (legacy split into 136 files by theme, load-order fix, regress + smoke + map, CI) · ~1 h 15 · game identical to the original (8 matches × 2400 frames), browser OK
- 2026-11-17 · Engine step 1: content folders (tools/content.cjs) + declared modes (src/engine/modes.js: step/render/nav/input/touch/hub tile EXTRAS; 6 one-line hooks in boucle, menus, controles-tactiles, hub-principal, boot) · ~35 min (16:27→17:02) · regress PASS, smoke PASS incl. a test mode moved by keyboard; S1 skipped (not needed for modes)
- 2026-11-17 · GRAZE RUSH mini-game (content/graze-rush, 1 file) + EXTRAS menu in ONLINE style (desc, info, Back, quitting returns to EXTRAS) · ~45 min (17:05→17:50) incl. tuning with a headless dodging bot · regress PASS, smoke PASS; 0 lines of the original game touched for the mini-game itself (engine contract was enough)
