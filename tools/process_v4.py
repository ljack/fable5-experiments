#!/usr/bin/env python3
"""One-off v4 asset pass: drone monster sheet, gore gibs sheet, pipe bomb
viewmodels + pickup. Reuses the chroma-key/trim/save/grid approach from
tools/process_sprites.py / tools/process_viewmodels.py.
Usage: python3 tools/process_v4.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

def chroma_key(img):
    """Magenta-ish pixels -> transparent, with soft edge handling."""
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 120 and b > 120 and g < 0.6 * min(r, b):
                px[x, y] = (0, 0, 0, 0)
            elif r > 90 and b > 90 and g < 0.75 * min(r, b):
                m = (r + b) // 2
                px[x, y] = (m // 2, g, m // 2, 128)
    return img

def trim(img, pad=2):
    bbox = img.getchannel('A').getbbox()
    if not bbox: return img
    x0, y0, x1, y1 = bbox
    return img.crop((max(0, x0 - pad), max(0, y0 - pad),
                     min(img.width, x1 + pad), min(img.height, y1 + pad)))

def save(img, name, max_h=512):
    if img.height > max_h:
        w = round(img.width * max_h / img.height)
        img = img.resize((w, max_h), Image.LANCZOS)
    img.save(os.path.join(OUT, name), optimize=True)
    print(f"{name}: {img.size}")

def grid(img, cols, rows):
    w, h = img.width // cols, img.height // rows
    return [img.crop((c * w, r * h, (c + 1) * w, (r + 1) * h))
            for r in range(rows) for c in range(cols)]

def erase_corner(img, frac=0.14):
    """Kill generation smudges in the top-left corner (outside the gun)."""
    px = img.load()
    cw, ch = int(img.width * frac), int(img.height * frac)
    for y in range(ch):
        for x in range(cw):
            px[x, y] = (0, 0, 0, 0)
    return img

# drone monster: 2x2 = idle, fly->walk, attack, destroyed->die
sheet = Image.open(f'{SRC}/drone_sheet.png')
for frame, suffix in zip(grid(sheet, 2, 2), ['idle', 'walk', 'attack', 'die']):
    save(trim(chroma_key(frame)), f'drone_{suffix}.png')

# gore gibs: 2x2 = 4 different chunks, tiny debris
sheet = Image.open(f'{SRC}/gibs_sheet.png')
for i, frame in enumerate(grid(sheet, 2, 2)):
    save(trim(chroma_key(frame)), f'gib_{i}.png', max_h=128)

# pipe bomb viewmodels: full-panel frames (alignment matters), like other vm_*
for suffix in ['idle', 'fire']:
    img = Image.open(f'{SRC}/vm_pipebomb_{suffix}.png')
    save(erase_corner(chroma_key(img)), f'vm_pipebomb_{suffix}.png')

# pipe bomb pickup item, trimmed like other items
save(trim(chroma_key(Image.open(f'{SRC}/item_pipebomb.png'))),
     'item_pipebomb.png', max_h=256)
print('done')
