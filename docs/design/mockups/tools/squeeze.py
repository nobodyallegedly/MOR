# Run: python3 -I docs/design/mockups/tools/squeeze.py SRC DST MAXWIDTH COLOURS (SRC may equal DST)
# Quantize PNGs to a small palette (dark UIs survive it well); optionally scale down to a max width.
import sys, os
from PIL import Image
src, dst, maxw, colors = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
for dirpath, _, files in os.walk(src):
    for f in files:
        if not f.endswith('.png'): continue
        p = os.path.join(dirpath, f); rel = os.path.relpath(p, src)
        out = os.path.join(dst, rel); os.makedirs(os.path.dirname(out), exist_ok=True)
        im = Image.open(p).convert('RGB')
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        im.quantize(colors=colors, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(out, optimize=True)
