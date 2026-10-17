#!/usr/bin/env python3
"""Draw a percentage grid over an image so annotation coordinates can be read off.

Usage:
  python3 .claude/skills/annotate-case-study/scripts/grid.py <image> <out.png>

Lines every 5% (labels every 10%: red = x, blue = y), thumbnail ≤ 1100px. Open the
output with the Read tool and read target / empty-area positions as 0–1 fractions.
"""
import sys

from PIL import Image, ImageDraw

if len(sys.argv) < 3:
    sys.exit(__doc__)
im = Image.open(sys.argv[1]).convert("RGB")
print("source size:", im.size, "aspect", round(im.size[0] / im.size[1], 3))
im.thumbnail((1100, 1100))
w, h = im.size
d = ImageDraw.Draw(im)
for i in range(1, 20):
    x, y = int(w * i / 20), int(h * i / 20)
    major = i % 2 == 0
    d.line([(x, 0), (x, h)], fill=(255, 0, 0) if major else (255, 170, 170), width=1)
    d.line([(0, y), (w, y)], fill=(0, 0, 255) if major else (170, 170, 255), width=1)
    if major:
        d.text((x + 2, 2), str(i * 5), fill=(255, 0, 0))
        d.text((2, y + 2), str(i * 5), fill=(0, 0, 255))
im.save(sys.argv[2])
print("wrote", sys.argv[2])
