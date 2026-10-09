"""Validate actual PNG alpha geometry against the shared catalog."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'shared/lab-game-v2/assets/manifest.json').read_text(encoding='utf-8'))
results = []
for a in manifest['assets']:
    path = ROOT / 'public/game-assets' / a['source']
    assert path.exists(), f"Missing asset: {path}"
    if path.suffix != '.png':
        continue
    image = Image.open(path)
    assert image.mode == 'RGBA', f"{a['key']}: missing alpha"
    f = a['frame']
    assert f['x'] >= 0 and f['y'] >= 0 and f['x'] + f['w'] <= image.width and f['y'] + f['h'] <= image.height
    sprite = image.crop((f['x'], f['y'], f['x']+f['w'], f['y']+f['h']))
    alpha = sprite.getchannel('A')
    bbox = alpha.point(lambda v: 255 if v > 16 else 0).getbbox()
    assert bbox, f"{a['key']}: empty frame"
    w, h = sprite.size
    cx, cy = (bbox[0]+bbox[2])/2, (bbox[1]+bbox[3])/2
    assert abs(cx-w/2) <= max(1, w*.05) and abs(cy-h/2) <= max(1, h*.05), f"{a['key']}: not centered {bbox}"
    if a['category'] != 'ui':
        assert bbox[0] >= 1 and bbox[1] >= 1 and bbox[2] < w and bbox[3] < h, f"{a['key']}: clipped frame"
        assert alpha.getextrema()[0] == 0, f"{a['key']}: opaque background"
    pixels = list(alpha.get_flattened_data())
    mass = sum(pixels)
    centroid = [sum((i % w + .5) * v for i, v in enumerate(pixels)) / mass, sum((i // w + .5) * v for i, v in enumerate(pixels)) / mass]
    results.append({'key': a['key'], 'size': [w,h], 'bbox': bbox, 'center': [cx,cy], 'alphaCentroid': centroid, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
report = ROOT / 'docs/lab-game-v2-art-report.json'
report.write_text(json.dumps({'checkedPngFrames':len(results),'assets':results}, indent=2)+'\n', encoding='utf-8')
print(f"PASS: {len(results)} PNG frames, alpha, bounds and centered bounding boxes; centroid recorded")
