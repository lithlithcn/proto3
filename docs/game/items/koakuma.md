# Devil Pact (Koakuma)
## Rule
10 s pact (status PACT). A K.O. credited to the holder (last hit within 4 s) ends the pact; at the next chPre: if the holder is behind the leader (most stocks, then HP, among fighters with stocks left), they swap stocks, spirit, burst, power and (if the leader is alive) HP — "PACT SEALED"; otherwise the holder loses a stock ("PACT BROKEN: -1 SOUL") or dies on the last one. Expiring unused only shows PACT EXPIRED.
## Legacy
`GIVE.koakuma` (882), `chKill` (992-993), `xPact` (986-988), `pactPend` in `chPre` (1005), `fxEnd` (995).
## Port
`packs/themed/koakuma.ts` (`pactKill` = rules `kill`, `pactPre` in `pre` before the status countdown), item `packs/themed/items/koakuma.ts`, status `packs/themed/statuses/pact.ts` (`FXS.pact`), `pactPend` column.
## Tests
`tests/parity/themed-a.test.ts` (Koakuma: behind → swap, leading → -1 life); render `PLAN=koakuma@100/0` (gate --items).
## Bugs
(none yet)
