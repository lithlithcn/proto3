"""Extract the main game script from legacy/shmup-fighter.html into build/legacy-main.js (audit + parity harness)."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parents[2]
html = (root / 'legacy' / 'shmup-fighter.html').read_text(encoding='utf-8')
scripts = [x for x in re.findall(r'<script>([\s\S]*?)</script>', html) if 'function start' in x]
out = root / 'build'; out.mkdir(exist_ok=True)
(out / 'legacy-main.js').write_text(scripts[0], encoding='utf-8')
print('legacy-main.js', len(scripts[0]))
