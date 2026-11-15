/* Legacy quirks knowledge base (docs/quirks.json): look up what is already known about a topic before investigating it. */
import { readFileSync } from 'node:fs';

export interface Quirk { id: string; tags: string[]; rule: string; port: string[]; family: string; tool?: string; found: string; superseded?: string }
export const quirks = (): Quirk[] => (JSON.parse(readFileSync('docs/quirks.json', 'utf8')) as { quirks: Quirk[] }).quirks;
/** Quirks whose id or tags contain any of the terms (case-insensitive). */
export function findQuirks(terms: string[]): Quirk[] {
  const ts = terms.map(t => t.toLowerCase()).filter(t => t.length > 2);
  return quirks().filter(q => !q.superseded && ts.some(t => q.id.toLowerCase().includes(t) || q.tags.some(g => g.toLowerCase() === t)));
}
export const fmt = (q: Quirk): string => `QUIRK ${q.id} [${q.family}]: ${q.rule}${q.port.length ? ` (port: ${q.port.slice(0, 3).join(', ')}${q.port.length > 3 ? ', …' : ''})` : ''}${q.tool ? ` — ${q.tool}` : ''}`;
