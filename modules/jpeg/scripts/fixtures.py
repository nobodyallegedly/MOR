# Test pictures for the JPEG Module (modules/module-jpeg-draft-1.md). Each
# carries something a posting client must strip, or something a reader must
# get right. Run with Python 3 and Pillow; the files it writes are committed,
# so the tests need neither.
#
#   python3 scripts/fixtures.py

import io
import struct
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw

out = Path(__file__).resolve().parent.parent / "test" / "fixtures"
out.mkdir(parents=True, exist_ok=True)


def picture(w=64, h=48, mode="RGB"):
    """A picture whose orientation shows: an arrow pointing up, a red corner at top left."""
    im = Image.new("RGB", (w, h), (40, 90, 160))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w // 4, h // 4], fill=(220, 30, 30))
    d.polygon([(w // 2, 4), (w // 2 - 10, 20), (w // 2 + 10, 20)], fill=(250, 250, 250))
    d.rectangle([w // 2 - 3, 20, w // 2 + 3, h - 6], fill=(250, 250, 250))
    return im.convert(mode)


def jpeg(im, **kw):
    b = io.BytesIO()
    im.save(b, "JPEG", quality=85, **kw)
    return b.getvalue()


def segment(marker, body):
    return bytes([0xFF, marker]) + struct.pack(">H", len(body) + 2) + body


def insert_after_soi(data, *segs):
    assert data[:2] == b"\xff\xd8"
    return data[:2] + b"".join(segs) + data[2:]


def drop_app0(data):
    """Remove Pillow's own JFIF segment, to put another in its place."""
    assert data[2:4] == b"\xff\xe0"
    n = struct.unpack(">H", data[4:6])[0]
    return data[:2] + data[4 + n :]


def tiff_ifd(entries, next_offset, base):
    """One IFD, big-endian. entries: (tag, type, count, value bytes). Values
    over 4 bytes go after the IFD, at offsets from the TIFF header (base)."""
    head = struct.pack(">H", len(entries))
    size = 2 + 12 * len(entries) + 4
    extra = b""
    body = b""
    for tag, typ, count, value in entries:
        if len(value) <= 4:
            body += struct.pack(">HHI", tag, typ, count) + value.ljust(4, b"\0")
        else:
            body += struct.pack(">HHII", tag, typ, count, base + size + len(extra))
            extra += value + (b"\0" if len(value) % 2 else b"")
    return head + body + struct.pack(">I", next_offset) + extra


def exif(orientation, gps=True, thumbnail=None):
    """An Exif segment body: camera, date, orientation, GPS, and optionally a thumbnail in IFD1."""
    ascii_ = lambda s: s.encode() + b"\0"
    rational = lambda *pairs: b"".join(struct.pack(">II", a, b) for a, b in pairs)
    # Layout: header 8, IFD0 at 8, GPS IFD after, IFD1 after.
    ifd0_entries = [
        (0x010F, 2, 9, ascii_("Examplco")),
        (0x0110, 2, 12, ascii_("Model 9 Pro")),
        (0x0112, 3, 1, struct.pack(">H", orientation)),
        (0x0132, 2, 20, ascii_("2026:09:30 12:34:56")),
    ]
    if gps:
        ifd0_entries.append((0x8825, 4, 1, b"\0\0\0\0"))  # patched below
    ifd0 = tiff_ifd(ifd0_entries, 0, 8)
    gps_off = 8 + len(ifd0)
    gps_ifd = b""
    if gps:
        gps_ifd = tiff_ifd(
            [
                (0x0001, 2, 2, b"N\0"),
                (0x0002, 5, 3, rational((46, 1), (12, 1), (3456, 100))),
                (0x0003, 2, 2, b"E\0"),
                (0x0004, 5, 3, rational((6, 1), (8, 1), (4321, 100))),
            ],
            0,
            gps_off,
        )
    ifd1_off = gps_off + len(gps_ifd)
    ifd1 = b""
    if thumbnail is not None:
        ifd1 = tiff_ifd(
            [
                (0x0201, 4, 1, struct.pack(">I", ifd1_off + 2 + 12 * 2 + 4)),
                (0x0202, 4, 1, struct.pack(">I", len(thumbnail))),
            ],
            0,
            ifd1_off,
        ) + thumbnail
    # Patch: the GPS pointer, and IFD0's next-IFD offset.
    entries = [e for e in ifd0_entries if e[0] != 0x8825]
    if gps:
        entries.append((0x8825, 4, 1, struct.pack(">I", gps_off)))
    ifd0 = tiff_ifd(entries, ifd1_off if thumbnail is not None else 0, 8)
    assert 8 + len(ifd0) == gps_off
    return b"Exif\0\0" + b"MM\0\x2a" + struct.pack(">I", 8) + ifd0 + gps_ifd + ifd1


def jfif(thumb_w=0, thumb_h=0, density=(72, 72)):
    body = b"JFIF\0" + bytes([1, 2, 1]) + struct.pack(">HH", *density) + bytes([thumb_w, thumb_h])
    return body + bytes([200, 30, 30]) * (thumb_w * thumb_h)


def write(name, data):
    (out / name).write_bytes(data)
    print(f"{name}: {len(data)} bytes")


# 1. A phone photo: Exif with camera, date, GPS and a rotation flag (6: turn
#    right to show), and a thumbnail that is a different picture (all green).
green = jpeg(Image.new("RGB", (16, 12), (0, 200, 0)))
base = jpeg(picture())
write("phone.jpg", insert_after_soi(base, segment(0xE1, exif(6, thumbnail=green))))

# 2. Progressive, with an sRGB colour profile, XMP and a comment.
srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
prog = jpeg(picture(80, 60), progressive=True, icc_profile=srgb)
xmp = b"http://ns.adobe.com/xap/1.0/\0" + b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>A Name</dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>'
write("progressive.jpg", insert_after_soi(prog, segment(0xE1, xmp), segment(0xFE, b"Shot at 12 Example Street")))

# 3. Grey, nothing to strip.
write("grey.jpg", jpeg(picture(mode="L")))

# 4. CMYK, with Adobe's segment (needed to read its colours: kept).
write("cmyk.jpg", jpeg(picture(mode="CMYK")))

# 5. A second picture hidden after the end, announced by a multi-picture segment.
mpf = b"MPF\0" + b"MM\0\x2a" + struct.pack(">I", 8) + tiff_ifd([(0xB000, 7, 4, b"0100")], 0, 8)
write("hidden.jpg", insert_after_soi(base, segment(0xE2, mpf)) + green)

# 6. A JFIF thumbnail (a red square) and a JFXX extension, IPTC in Photoshop's segment.
jfxx = b"JFXX\0" + bytes([0x10]) + green
iptc = b"Photoshop 3.0\0" + b"8BIM\x04\x04\0\0" + struct.pack(">I", 12) + b"\x1c\x02\x50\0\x08A Person"
write(
    "jfif-thumbnail.jpg",
    insert_after_soi(drop_app0(base), segment(0xE0, jfif(4, 3)), segment(0xE0, jfxx), segment(0xED, iptc)),
)

# 7. Non-square pixels declared in JFIF (2:1), and a rotation flag of 8 (turn left).
write("aspect.jpg", insert_after_soi(drop_app0(base), segment(0xE0, jfif(density=(2, 1))), segment(0xE1, exif(8, gps=False))))

# 8. Not pictures.
write("truncated.jpg", base[: len(base) // 2])
write("not-a-jpeg.jpg", b"\x89PNG\r\n\x1a\n" + b"\0" * 32)
