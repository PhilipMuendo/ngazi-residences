"""Apply Ngazi's architectural grade to a folder of photos.

usage:  python scripts/grade.py <input-folder> <output-folder>
needs:  pip install Pillow

Calm, editorial architecture photography: saturation eased back, whites kept
clean and slightly cool, shadows open (never crushed), a soft S-curve.
Caps width at 2200px.
"""
import os
import sys

from PIL import Image, ImageEnhance

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)


def lut(lo, hi, sh, hl):
    out = []
    for i in range(256):
        t = i / 255.0
        s = t * t * (3 - 2 * t)
        t = 0.38 * s + 0.62 * t
        v = lo + t * (hi - lo) + sh * (1 - t) ** 2 + hl * t ** 2
        out.append(max(0, min(255, int(round(v)))))
    return out


R = lut(18, 247, -1, 0)
G = lut(19, 247, 0, 0)
B = lut(22, 250, 3, 2)


def grade(img):
    img = ImageEnhance.Color(img).enhance(0.78)
    r, g, b = img.split()
    return Image.merge("RGB", (r.point(R), g.point(G), b.point(B)))


for f in sorted(os.listdir(src)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    im = Image.open(os.path.join(src, f)).convert("RGB")
    if im.width > 2200:
        im = im.resize((2200, round(im.height * 2200 / im.width)), Image.LANCZOS)
    out = os.path.splitext(f)[0] + ".jpg"
    grade(im).save(os.path.join(dst, out), "JPEG", quality=80, optimize=True, progressive=True)
