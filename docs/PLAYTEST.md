# Playtest reports (owner -> Claude)
Play https://lithlithcn.github.io/proto3/ . When something looks or feels wrong: press **F8** (downloads `proto3-match-<seed>-f<frames>.json`: character config + every input frame) and send that file with one sentence ("at ~30 s Reimu's dash looked wrong").
Claude runs `pnpm match <file>`: the same inputs replay against the legacy game, frame by frame (sim differences), and the render is checked separately (render parity). Controls: P1 WASD + J/K/L, Space dash, I parry, U burst, O spell, Shift focus, E/R skills; P2 arrows + numpad.
