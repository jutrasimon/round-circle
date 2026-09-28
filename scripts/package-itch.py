"""Package the current browser build and marketing kit using only Python stdlib."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
KIT = ROOT / 'marketing' / 'itch-io'
OUT = ROOT / 'releases'
html = (DIST / 'index.html').read_text(encoding='utf-8-sig')
version = re.search(r'Witness run (\d+)', html).group(1)
files = sorted(p for p in DIST.rglob('*') if p.is_file())
names = {p.relative_to(DIST).as_posix() for p in files}
assert 'index.html' in names and 'babylon.js' in names, 'Missing entry point or engine; run prepare-engine.mjs first'
assert len(files) <= 1000, 'Too many files for itch.io HTML5'
assert sum(p.stat().st_size for p in files) <= 500 * 1024**2
assert all(p.stat().st_size <= 200 * 1024**2 for p in files)
assert all(len(n) <= 240 for n in names)
for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
    if ref.startswith(('data:', 'https:', '#')):
        continue
    assert ref.split('?')[0] in names, f'Missing entry asset or case mismatch: {ref}'
OUT.mkdir(exist_ok=True)
game = OUT / f'round-circle-v{version}-itch.zip'
with zipfile.ZipFile(game, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for path in files:
        z.write(path, path.relative_to(DIST).as_posix())
with zipfile.ZipFile(game) as z:
    assert z.testzip() is None
    assert 'index.html' in z.namelist()
report = {
    'version': version, 'file_count': len(files),
    'uncompressed_bytes': sum(p.stat().st_size for p in files),
    'zip_bytes': game.stat().st_size,
    'sha256': hashlib.sha256(game.read_bytes()).hexdigest(),
    'checks': ['root index.html', 'engine included', 'entry references exact case', 'itch archive limits', 'ZIP CRC'],
    'not_tested': ['Upload and execution on itch.io hosting'],
}
(KIT / 'BUILD-REPORT.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
bundle = OUT / f'round-circle-v{version}-marketing-kit.zip'
with zipfile.ZipFile(bundle, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for path in sorted(KIT.rglob('*')):
        if path.is_file():
            z.write(path, 'marketing/itch-io/' + path.relative_to(KIT).as_posix())
    z.write(game, 'releases/' + game.name)
    z.write(Path(__file__), 'scripts/package-itch.py')
with zipfile.ZipFile(bundle) as z:
    assert z.testzip() is None
print(json.dumps(report, indent=2))
print(f'Marketing kit: {bundle.name} ({bundle.stat().st_size:,} bytes)')
