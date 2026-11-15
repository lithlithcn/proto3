# Detector mutation score
17/19 mutants noticed (16 games x 1200 frames). Survivors are blind spots OR equivalent mutants: inspect each.

| mutant | kind | verdict | first detection | time |
|---|---|---|---|---|
| hit-gain | balance | KILLED | 16 report(s) [diff], earliest f62: P#.spirit @flandre | 12s |
| graze-gain | balance | KILLED | 16 report(s) [diff], earliest f25: P#.spirit @marisa | 11s |
| respawn-inv-off1 | off-by-one | KILLED | 6 report(s) [diff], earliest f667: P#.inv @okina | 24s |
| dash-cost | balance | KILLED | 16 report(s) [diff], earliest f1: P#.boost @nue | 6s |
| parry-radius | balance | KILLED | 2 report(s) [diff], earliest f181: bullet count @nue | 19s |
| graze-boundary | boundary | SURVIVED | nothing noticed | 50s |
| hit-hp-drift | subtle-math | KILLED | 16 report(s) [diff], earliest f62: P#.hp @aya | 13s |
| damage-offset | subtle-math | - | SKIPPED: pattern not found (code moved?) | |
| streak-not-reset | missing-effect | KILLED | 5 report(s) [diff], earliest f307: P#.spirit @flandre | 22s |
| inv-threshold | boundary | SURVIVED | nothing noticed | 51s |
| shot-cd-focus | balance | KILLED | 16 report(s) [diff], earliest f13: P#.shotCd @hecatia | 11s |
| hit-spirit-gain | subtle-math | KILLED | 16 report(s) [diff], earliest f62: P#.spirit @flandre | 12s |
| wall-bounce-damp | balance | KILLED | 2 report(s) [diff], earliest f602: P#.vx @flandre | 21s |
| heavy-fake-filter | regression(R112) | KILLED | 2 report(s) [diff], earliest f381: bullet count @marisa | 26s |
| caster-follow | regression(R113) | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 36s |
| heavy-arm-boundary | boundary | KILLED | 1 report(s) [diff], earliest f146: P#.spirit @reimu | 20s |
| spell-refuse-cd | off-by-one | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 37s |
| marisa-dashatk-kb | character | KILLED | caught by frozen regression / contract tests only (campaign saw nothing) | 34s |
| math-atan2-zero | math | KILLED | 6 report(s) [diff], earliest f13: P#.vy @okina | 17s |
| fairy-steal | item | KILLED | 3 report(s) [diff], earliest f381: bullet count @marisa | 27s |
