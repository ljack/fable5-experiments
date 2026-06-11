#!/usr/bin/env python3
"""Process Nano Banana viewmodel + item sheets: split panels, chroma-key
magenta -> alpha, export. Viewmodel frames keep full panel size so animation
frames stay aligned (anchored to screen bottom); items are trimmed.
Usage: python3 tools/process_viewmodels.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

def chroma_key(img):
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

def erase_corner(img, frac=0.14):
    """Kill generation smudges in the top-left corner (outside the gun)."""
    px = img.load()
    cw, ch = int(img.width * frac), int(img.height * frac)
    for y in range(ch):
        for x in range(cw):
            px[x, y] = (0, 0, 0, 0)
    return img

def grid(img, cols, rows):
    w, h = img.width // cols, img.height // rows
    return [img.crop((c * w, r * h, (c + 1) * w, (r + 1) * h))
            for r in range(rows) for c in range(cols)]

def save(img, name, max_h=512):
    if img.height > max_h:
        w = round(img.width * max_h / img.height)
        img = img.resize((w, max_h), Image.LANCZOS)
    img.save(os.path.join(OUT, name), optimize=True)
    print(f"{name}: {img.size}")

def trim(img, pad=2):
    bbox = img.getchannel('A').getbbox()
    if not bbox: return img
    x0, y0, x1, y1 = bbox
    return img.crop((max(0, x0 - pad), max(0, y0 - pad),
                     min(img.width, x1 + pad), min(img.height, y1 + pad)))

# viewmodels: full-panel frames (alignment matters)
for name, frames in [('pistol', ['idle', 'fire']),
                     ('shotgun', ['idle', 'fire', 'pump']),
                     ('plasma', ['idle', 'fire'])]:
    sheet = Image.open(f'{SRC}/vm_{name}_sheet.png')
    for frame, suffix in zip(grid(sheet, len(frames), 1), frames):
        save(erase_corner(chroma_key(frame)), f'vm_{name}_{suffix}.png')

# items: 4x2 grid, trimmed
ITEMS = ['gold', 'treasure', 'health', 'shells',
         'cells', 'keycard', 'shotgun', 'plasma']
sheet = Image.open(f'{SRC}/items_sheet.png')
for frame, kind in zip(grid(sheet, 4, 2), ITEMS):
    save(trim(chroma_key(frame)), f'item_{kind}.png', max_h=256)
print('done')
