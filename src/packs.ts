import type { PackManifest } from '@kernel';

/** Pack discovery by folder convention (DESIGN §2.3): every `packs/<id>/pack.ts` is picked up, no hand-maintained registry. */
const found = import.meta.glob<{ default: PackManifest }>('../packs/*/pack.ts', { eager: true });
export const builtinPacks: PackManifest[] = Object.keys(found).sort().map(k => found[k]!.default); // sim-allow(boot-time)
