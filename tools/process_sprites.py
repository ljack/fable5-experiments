#!/usr/bin/env python3
"""Split Nano Banana sprite sheets, chroma-key magenta -> alpha, trim, export.
Usage: python3 tools/process_sprites.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image, ImageFilter

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
            # magenta: high R, low G, high B
            if r > 120 and b > 120 and g < 0.6 * min(r, b):
                px[x, y] = (0, 0, 0, 0)
            elif r > 90 and b > 90 and g < 0.75 * min(r, b):
                # edge fringe: keep but desaturate magenta spill, reduce alpha
                m = (r + b) // 2
                px[x, y] = (m // 2, g, m // 2, 128)
    return img

def trim(img, pad=2):
    bbox = img.getchannel('A').getbbox()
    if not bbox: return img
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad); y1 = min(img.height, y1 + pad)
    return img.crop((x0, y0, x1, y1))

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

# monster sheets: 2x2 = idle, walk, attack, die
for mon in ['grunt', 'spitter', 'boss']:
    sheet = Image.open(f'{SRC}/{mon}_sheet.png')
    frames = grid(sheet, 2, 2)
    for frame, suffix in zip(frames, ['idle', 'walk', 'attack', 'die']):
        save(trim(chroma_key(frame)), f'{mon}_{suffix}.png')

# janitor: 1x2 = idle, talk
sheet = Image.open(f'{SRC}/janitor_sheet.png')
for frame, suffix in zip(grid(sheet, 2, 1), ['idle', 'talk']):
    save(trim(chroma_key(frame)), f'npc_{suffix}.png')

# barrel prop
save(trim(chroma_key(Image.open(f'{SRC}/barrel.png'))), 'barrel.png', max_h=384)

# skybox: keep as jpg, downscale
sky = Image.open(f'{SRC}/skybox.png').convert('RGB')
sky = sky.resize((2048, round(sky.height * 2048 / sky.width)), Image.LANCZOS)
sky.save(os.path.join(OUT, 'skybox.jpg'), quality=82, optimize=True)
print('skybox.jpg:', sky.size)

# decals sheet: chroma-key whole sheet, keep as one atlas
save(chroma_key(Image.open(f'{SRC}/decals.png')), 'decals.png', max_h=768)
print('done')
