import { expect, it } from 'vitest';
import { makePair } from './harness';

/** Every ported item carries the legacy RUNTIME catalog text (ITEMS after the v4 description patch, line 2382): item list, guide, activation banner (drawActs) read it. */
it('item catalog: name / colour / description / character = legacy runtime ITEMS', () => {
  const k = makePair(['reimu', 'reimu'], 1), L = JSON.parse(k.legacy.eval('JSON.stringify(ITEMS)') as string) as { k: string; name: string; c: string; d: string; ch?: string }[];
  for (const [id, d] of k.world.registry.list<{ name: string; color: string; desc?: string; ch?: string }>('item')) {
    const key = id.split(':').pop()!, l = L.find(i => i.k === key);
    expect(l, key).toBeDefined();
    expect([d.name, d.color, d.desc ?? '', d.ch ?? ''], key).toEqual([l!.name, l!.c, l!.d, l!.ch ?? '']);
  }
});
