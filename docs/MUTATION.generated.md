# Detector mutation score
19/19 non-equivalent mutants noticed, 2 proven equivalent (16 games x 1200 frames). A SURVIVED row is a blind spot: fix the bots/invariants/tests, never the score.

| mutant | kind | verdict | first detection | time |
|---|---|---|---|---|
| hit-gain | balance | KILLED | 16 report(s) [diff], earliest f62: P#.spirit @flandre | 11s |
| graze-gain | balance | KILLED | 16 report(s) [diff], earliest f25: P#.spirit @marisa | 10s |
| respawn-inv-off1 | off-by-one | KILLED | 6 report(s) [diff], earliest f667: P#.inv @okina | 23s |
| dash-cost | balance | KILLED | 16 report(s) [diff], earliest f1: P#.boost @nue | 6s |
| parry-radius | balance | KILLED | 2 report(s) [diff], earliest f181: bullet count @nue | 19s |
| graze-boundary | boundary | EQUIVALENT | nothing noticed | 54s |
| hit-hp-drift | subtle-math | KILLED | 16 report(s) [diff], earliest f62: P#.hp @aya | 11s |
| damage-offset | subtle-math | KILLED | 16 report(s) [diff], earliest f62: P#.hp @aya | 11s |
| streak-not-reset | missing-effect | KILLED | 5 report(s) [diff], earliest f307: P#.spirit @flandre | 21s |
| inv-threshold | boundary | KILLED | 4 report(s) [diff], earliest f59: P#.x @marisa | 23s |
| inv-threshold-hit-fn | boundary | EQUIVALENT | nothing noticed | 55s |
| shot-cd-focus | balance | KILLED | 16 report(s) [diff], earliest f13: P#.shotCd @hecatia | 11s |
| hit-spirit-gain | subtle-math | KILLED | 16 report(s) [diff], earliest f62: P#.spirit @flandre | 12s |
| wall-bounce-damp | balance | KILLED | 2 report(s) [diff], earliest f602: P#.vx @flandre | 21s |
| heavy-fake-filter | regression(R112) | KILLED | 2 report(s) [diff], earliest f381: bullet count @marisa | 25s |
| caster-follow | regression(R113) | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 41s |
| heavy-arm-boundary | boundary | KILLED | 1 report(s) [diff], earliest f146: P#.spirit @reimu | 19s |
| spell-refuse-cd | off-by-one | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 42s |
| marisa-dashatk-kb | character | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 40s |
| math-atan2-zero | math | KILLED | 6 report(s) [diff], earliest f13: P#.vy @okina | 17s |
| fairy-steal | item | KILLED | 3 report(s) [diff], earliest f381: bullet count @marisa | 27s |
