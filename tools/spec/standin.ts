/* Stand-in scan (pnpm spec standin): the legacy Doppelganger calls a character's shot/heavy with `cloneOf(p)`, a BARE object {x,y,id,aim,buff,power,focus,mvName,shotT}.
 * Every other `p.<field>` read by that code is `undefined` for the clone (and writes land on the throw-away object). That quirk caused 9 port divergences
 * (Okina season/cooldown, Nazrin Double Mice, Hecatia Trinity, Marisa laser lock...). This lists, per character, the fields shot/heavy read (one helper level deep)
 * that the stand-in lacks, and whether the port's character code mentions `clone` — so the whole family is reviewed in one command instead of found by fuzzing. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const HAS = new Set(['x', 'y', 'id', 'aim', 'buff', 'power', 'focus', 'mvName', 'shotT']);
/** Text of the balanced {...} block that starts at the first `{` at or after `from`. */
function block(src: string, from: number): string { const i = src.indexOf('{', from); let d = 0; for (let j = i; j < src.length; j++) { const c = src[j]; if (c === '{') d++; else if (c === '}' && --d === 0) return src.slice(i, j + 1); } return src.slice(i); }
const fnBody = (src: string, name: string): string => { const m = new RegExp(`function ${name}\\(([^)]*)\\)`).exec(src); return m ? block(src, m.index) : ''; };

export function standin(): string {
  const src = readFileSync('legacy/shmup-fighter.html', 'utf8'), heads = [...src.matchAll(/^\{k:'(\w+)',name:'[^']*',col:/gm)], out: string[] = [];
  heads.forEach((h, n) => {
    const seg = src.slice(h.index!, heads[n + 1]?.index ?? h.index! + 40000), id = h[1]!, parts: string[] = [];
    const si = seg.indexOf('shot(p,a,f,pm,lv)'); if (si >= 0) parts.push(block(seg, si));
    const hi = seg.indexOf(' heavy:{'); if (hi >= 0) parts.push(block(seg, hi));
    let text = parts.join('\n'); for (const f of new Set([...text.matchAll(/\b([a-zA-Z]\w*)\((?:p|c)[,)]/g)].map(x => x[1]!))) text += fnBody(src, f); // one helper level
    const fields = [...new Set([...text.matchAll(/\bp\.([a-zA-Z_]\w*)/g)].map(x => x[1]!))].filter(f => !HAS.has(f) && !['hp', 'state', 'vx', 'vy', 'inv', 't'].includes(f)).sort();
    const dir = `packs/touhou/characters/${id}`, port = existsSync(dir) ? readdirSync(dir).map(f => readFileSync(`${dir}/${f}`, 'utf8')).join('\n') : '', handled = /\bclone\b/.test(port);
    if (fields.length) out.push(`${id.padEnd(9)} ${handled ? 'port mentions clone' : 'port IGNORES clone'} | stand-in lacks: ${fields.join(' ')}`);
  });
  return `${out.join('\n')}\n\nReview each line: does the legacy code branch on that field in shot/heavy? If yes the clone takes the 'unset' branch (and its writes are lost): pass \`clone\` from the port's ShotCtx/HeavyCtx and mimic it (see okina/heavy.ts, nazrin/shot.ts).`;
}
