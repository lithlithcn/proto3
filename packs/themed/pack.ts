import { definePack } from '@kernel';
import rules from './rules';
import rumia from './items/rumia';
import daiyousei from './items/daiyousei';
import rin from './items/rin';
import meiling from './items/meiling';
import koakuma from './items/koakuma';
import pact from './statuses/pact';
import eat from './statuses/eat';
import { themedSchema } from './state';

/** Themed items (one per Touhou character of the legacy game): items, their statuses, and the rule set that wires them into combat
 *  at the legacy extension points (chPre / chHit / chDmg / chBullet ...). Port in progress: docs/game/items/themed-plan.md. */
export default definePack({
  id: 'themed', version: '0.1.0', requires: ['combat@^0.1.0'], state: themedSchema,
  content: { rules: { themed: rules }, item: { rumia, daiyousei, rin, meiling, koakuma }, status: { eat, pact } },
  init(w) { w.slice<{ eatBy: Int32Array }>('themed').eatBy.fill(-1); },
});
