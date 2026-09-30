# Check the JPEG Module's test vectors with Pillow, a reader independent of
# the founding implementation (modules/jpeg/src/jpeg.ts):
#   - each picture's size, components and orientation are what the vector says;
#   - each stripped file decodes to exactly the same pixels as the original,
#     with the same orientation and colour profile, and carries no Exif but
#     the orientation, no location, no comment and nothing after its end.
#
#   pip install pillow && python3 vectors/check.py

import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image

here = Path(__file__).resolve().parent
v = json.loads((here / "jpeg.json").read_text())
fixtures = here.parent / v["fixtures"]
bad = 0


def fail(name, why):
    global bad
    bad += 1
    print(f"FAIL {name}: {why}")


for t in v["vectors"]:
    name = t["file"]
    raw = (fixtures / name).read_bytes()
    if hashlib.sha256(raw).hexdigest() != t["sha256"]:
        fail(name, "the fixture is not the one the vector names")
        continue
    if "notJpeg" in t:
        try:
            Image.open(io.BytesIO(raw)).load()
            fail(name, "Pillow reads it as a picture")
        except Exception:
            print(f"ok   {name} (not a picture)")
        continue
    p = t["picture"]
    im = Image.open(io.BytesIO(raw))
    if im.size != (p["width"], p["height"]):
        fail(name, f"size {im.size}")
    if len(im.getbands()) != p["components"]:
        fail(name, f"components {im.getbands()}")
    o = im.getexif().get(0x0112, 1)
    if not 1 <= o <= 8:
        o = 1
    if o != p["orientation"]:
        fail(name, f"orientation {o}")
    stripped = (here / t["stripped"]["file"]).read_bytes()
    if hashlib.sha256(stripped).hexdigest() != t["stripped"]["sha256"]:
        fail(name, "the stripped file is not the one the vector names")
        continue
    s = Image.open(io.BytesIO(stripped))
    if s.tobytes() != im.tobytes() or s.mode != im.mode:
        fail(name, "the stripped picture has other pixels")
    ex = s.getexif()
    if dict(ex) != ({0x0112: o} if o != 1 else {}):
        fail(name, f"the stripped Exif holds {dict(ex)}")
    if ex.get_ifd(0x8825):
        fail(name, "the stripped file has a location")
    if s.info.get("icc_profile") != im.info.get("icc_profile"):
        fail(name, "the colour profile changed")
    if "comment" in s.info or "exif" in s.info and len(s.info["exif"]) > 32:
        fail(name, "something besides the picture is left")
    if not stripped.endswith(b"\xff\xd9"):
        fail(name, "bytes after the end")
    print(f"ok   {name}")

print(f"{len(v['vectors']) - bad} of {len(v['vectors'])} vectors agree")
sys.exit(1 if bad else 0)
