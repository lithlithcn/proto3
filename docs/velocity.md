# Velocity log

One line per task: date · task · time · result. The point: measure features shipped per session.

- 2026-11-17 · Proto4 transition (legacy split into 136 files by theme, load-order fix, regress + smoke + map, CI) · ~1 h 15 · game identical to the original (8 matches × 2400 frames), browser OK
- 2026-11-17 · Engine step 1: content folders (tools/content.cjs) + declared modes (src/engine/modes.js: step/render/nav/input/touch/hub tile EXTRAS; 6 one-line hooks in boucle, menus, controles-tactiles, hub-principal, boot) · ~5 min wall clock (16:27→16:32, git times) · regress PASS, smoke PASS incl. a test mode moved by keyboard; S1 skipped (not needed for modes)
- 2026-11-17 · GRAZE RUSH mini-game (content/graze-rush, 1 file) + EXTRAS menu in ONLINE style (desc, info, Back, quitting returns to EXTRAS) · ~5 min wall clock (16:35→16:40, git times) incl. tuning with a headless dodging bot · regress PASS, smoke PASS; 0 lines of the original game touched for the mini-game itself (engine contract was enough)
- 2026-11-17 · Fix: players could load a mix of old and new files for ~10 min after a deploy (GitHub Pages cache) → EXTRAS crash/empty list seen by the owner; CI now stamps every script URL with the commit (?v=sha) · ~5 min · smoke PASS
