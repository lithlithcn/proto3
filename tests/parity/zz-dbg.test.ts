import { it } from 'vitest';
import { giveItem } from '../../packs/combat/api';
import { makePair } from './harness';
it('dbg', () => {
  const k = makePair(['reimu', 'reimu'], 31, { items: ['green'] }); const kind = k.kind('rumia');
  for (let f = 1; f <= 700; f++) {
    if (f === 60) { k.legacy.eval(`give(P[0],'rumia')`); giveItem(k.world, k.s, 0, kind, k.s.x[0]!, k.s.y[0]!); }
    k.step([() => ({}), () => ({})], f);
    if (f % 50 === 0) console.log(f, k.legacy.eval('JSON.stringify({p0:[P[0].x|0,P[0].y|0],p1:[P[1].x|0,P[1].y|0,P[1].hp|0,P[1].dark|0],o:B.filter(b=>b.dark).map(b=>[b.x|0,b.y|0,b.r|0,b.life])})'));
  }
});
