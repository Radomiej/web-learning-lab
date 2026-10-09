"""Crop and center the ImageGen sheets explicitly requested by the user.

Usage: python tools/prepare-survival-atlases.py SOURCE_DIRECTORY
The mapping keeps the original outputs intact and produces 128px frames.
"""
import json
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "characters": "exec-ca605f71-56c2-4fdd-b9e6-d1d71a99a1a5.png",
    "combat": "exec-14ef1c54-efc1-48e6-bc02-c4909600fca1.png",
    "world": "exec-b23e29c6-ff17-4a20-8512-2db033f0ae7b.png",
    "ui": "exec-bf04c299-de5b-4236-876e-c1a09d630e18.png",
}
source_dir = Path(sys.argv[1])
output = ROOT / "public/game-assets"
output.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / "shared/lab-game-v2/assets/manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
manifest["assets"] = [a for a in manifest["assets"] if a["key"] not in {f"ui-bar-{kind}-{part}" for kind in ["health", "experience", "gold"] for part in ["frame", "fill", "track"]}]
for category, filename in SOURCES.items():
    image = Image.open(source_dir / filename).convert("RGBA")
    assert image.getchannel("A").getextrema()[0] == 0, f"{filename}: no transparency"
    atlas = Image.new("RGBA", (640, 640))
    for n in range(25):
        col, row = n % 5, n // 5
        cell = image.crop((round(col * image.width / 5), round(row * image.height / 5), round((col + 1) * image.width / 5), round((row + 1) * image.height / 5)))
        mask = cell.getchannel("A").point(lambda a: 255 if a > 16 else 0)
        bbox = mask.getbbox()
        assert bbox, f"{category} slot {n}: empty"
        sprite = cell.crop(bbox)
        scale = min(112 / sprite.width, 112 / sprite.height)
        sprite = sprite.resize((max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))), Image.Resampling.NEAREST)
        # Downsampling may remove a fine tip; measure again at shipping resolution.
        sprite.putalpha(sprite.getchannel("A").point(lambda a: a if a > 16 else 0))
        sprite = sprite.crop(sprite.getchannel("A").getbbox())
        frame = Image.new("RGBA", (128, 128))
        frame.alpha_composite(sprite, ((128 - sprite.width) // 2, (128 - sprite.height) // 2))
        atlas.alpha_composite(frame, (col * 128, row * 128))
    atlas.save(output / f"survival-{category}.png")
    if category == "ui":
        for n, a in enumerate([a for a in manifest["assets"] if a["category"] == "ui"][:25]):
            if a["key"].startswith(("ui-panel-", "ui-button-", "ui-slot-")):
                x, y = (n % 5) * 128, (n // 5) * 128
                bbox = atlas.crop((x, y, x+128, y+128)).getchannel("A").getbbox()
                a["frame"] = {"x": x+bbox[0], "y": y+bbox[1], "w": bbox[2]-bbox[0], "h": bbox[3]-bbox[1]}
                a["ninePatch"] = {"left": 12, "top": 12, "right": 12, "bottom": 12}

# Split generated progress bars into an outer frame, empty track and fill.
# Source interiors were measured on the generated UI sheet, after normalization.
ui = Image.open(output / "survival-ui.png").convert("RGBA")
for i, kind in enumerate(["health", "experience", "gold"]):
    slot = ui.crop((i * 128, 3 * 128, (i + 1) * 128, 4 * 128))
    visible = slot.getchannel("A").getbbox()
    tight = slot.crop(visible)
    w, h = tight.size
    # Conservative inset excludes caps and decorative corner pixels.
    left, top, right, bottom = round(w * .17), round(h * .24), round(w * .83), round(h * .74)
    fill = tight.crop((left, top, round(w * .43), bottom))
    track = tight.crop((round(w * .72), top, round(w * .79), bottom))
    border = tight.copy()
    border.paste((0, 0, 0, 0), (left, top, right, bottom))
    for part, piece in [("frame", border), ("fill", fill), ("track", track)]:
        key = f"ui-bar-{kind}-{part}"
        filename = key + ".png"
        piece.save(output / filename)
        manifest["assets"].append({"key": key, "constant": key.replace("-", "_").upper(), "source": filename, "frame": {"x": 0, "y": 0, "w": piece.width, "h": piece.height}, "pivot": {"x": .5, "y": .5}, "category": "ui", "barInset": {"left": left/w, "top": top/h, "right": (w-right)/w, "bottom": (h-bottom)/h}, "ninePatch": {"left": left, "top": top, "right": w-right, "bottom": h-bottom}})

# Keep useful existing terrain frames; they are part of the shared manifest too.
legacy = json.loads((Path(ROOT).parent / "java-lab/public/game-assets/atlas.json").read_text(encoding="utf-8"))
known = {a["key"] for a in manifest["assets"]}
for key, entry in legacy["frames"].items():
    if key not in known:
        manifest["assets"].append({"key": key, "constant": key.replace("-", "_").upper(), "source": entry.get("image", "atlas.svg"), "frame": entry["frame"], "pivot": {"x": .5, "y": .5}, "category": "terrain"})
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
atlas_data = {"frames": {a["key"]: {"image": a["source"], "frame": a["frame"]} for a in manifest["assets"]}}
for name, key in manifest["aliases"].items():
    atlas_data["frames"][name.lower()] = atlas_data["frames"][key]
(output / "atlas.json").write_text(json.dumps(atlas_data, indent=2) + "\n", encoding="utf-8")
print(f"Prepared {len(manifest['assets'])} assets")
