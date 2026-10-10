# Check the video Module's test vectors with ffprobe and ffmpeg, readers
# independent of the founding implementation (modules/video/src/video.ts):
#   - each film's codecs, profile, size, turn, duration and sound are what the
#     vector says;
#   - each stripped file holds exactly the same packets as the original (the
#     compressed pictures and sound untouched), decodes to the same frames,
#     carries no tags, no place and no dates, and has its index first;
#   - each refused file shows, to ffprobe too, what the Module refuses it for.
#
#   python3 vectors/check.py     (needs ffmpeg and ffprobe on the path)

import hashlib
import json
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
v = json.loads((here / "video.json").read_text())
fixtures = (here / v["fixtures"]).resolve()
bad = 0


def fail(name, why):
    global bad
    bad += 1
    print(f"FAIL {name}: {why}")


def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None


def framemd5(path, copy):
    """One line per packet (copy) or per decoded frame, without the header."""
    args = ["ffmpeg", "-v", "error", "-i", str(path), "-map", "0"]
    args += ["-c", "copy"] if copy else []
    r = subprocess.run(args + ["-f", "framemd5", "-"], capture_output=True, text=True)
    if r.returncode:
        return None
    return [l for l in r.stdout.splitlines() if not l.startswith("#")]


def rotation(stream):
    """Quarter turns clockwise, as the Module counts them (ffmpeg counts anticlockwise)."""
    for sd in stream.get("side_data_list", []):
        if "rotation" in sd:
            return int(-sd["rotation"]) % 360
    return 0


def top_boxes(b):
    o, out = 0, []
    while o + 8 <= len(b):
        size = int.from_bytes(b[o : o + 4], "big")
        out.append(b[o + 4 : o + 8].decode("latin1"))
        if size < 8:
            break
        o += size
    return out


# What ffprobe should see in each refused file: the reason, told by another reader.
REFUSED = {
    "external.mp4": lambda p: True,  # what ffprobe makes of an address varies; the address itself is checked below
    "fragmented.mp4": lambda p: p is not None,
    "hevc.mp4": lambda p: p["streams"][0]["codec_name"] == "hevc",
    "high-444.mp4": lambda p: p["streams"][0]["pix_fmt"] == "yuv444p",
    "mp3-sound.mp4": lambda p: any(s["codec_name"] == "mp3" for s in p["streams"]),
    "mpeg4-part2.mp4": lambda p: p["streams"][0]["codec_name"] == "mpeg4",
    "not-an-mp4.mp4": lambda p: p is None,
    "subtitles.mp4": lambda p: any(s["codec_type"] == "subtitle" for s in p["streams"]),
    "too-fast.mp4": lambda p: eval(p["streams"][0]["avg_frame_rate"]) > 60,
    "too-large.mp4": lambda p: p["streams"][0]["width"] > 1920,
    "too-long.mp4": lambda p: float(p["format"]["duration"]) > 600,
    "truncated.mp4": lambda p: True,  # ffprobe may read what is there; the Module reads the boxes
    "two-pictures.mp4": lambda p: sum(s["codec_type"] == "video" for s in p["streams"]) == 2,
}

for t in v["vectors"]:
    name = t["file"]
    raw = (fixtures / name).read_bytes()
    if hashlib.sha256(raw).hexdigest() != t["sha256"]:
        fail(name, "the fixture is not the one the vector names")
        continue
    p = probe(fixtures / name)
    if "refused" in t:
        check = REFUSED.get(name)
        if check is None:
            fail(name, "no independent check for this refusal")
        elif not check(p):
            fail(name, f"ffprobe does not show why it is refused ({t['refused']['reason']})")
        elif name == "fragmented.mp4" and "moof" not in top_boxes(raw):
            fail(name, "no fragment (moof) in the file")
        elif name == "external.mp4" and b"https://example.org/" not in raw:
            fail(name, "no address in the file")
        elif name == "truncated.mp4" and len(raw) >= len((fixtures / "plain.mp4").read_bytes()):
            fail(name, "not shorter than the film it was cut from")
        else:
            print(f"ok   {name} (refused: {t['refused']['reason']})")
        continue

    f = t["film"]
    if p is None:
        fail(name, "ffprobe cannot read it")
        continue
    vs = [s for s in p["streams"] if s["codec_type"] == "video"]
    aus = [s for s in p["streams"] if s["codec_type"] == "audio"]
    if len(vs) != 1 or vs[0]["codec_name"] != "h264":
        fail(name, "not one H.264 picture track")
        continue
    s = vs[0]
    prof = {"Baseline": ("Baseline", "Constrained Baseline"), "Main": ("Main",), "High": ("High",)}[f["video"]["profile"]]
    if s.get("profile") not in prof:
        fail(name, f"profile {s.get('profile')}")
    if s.get("level") != f["video"]["level"]:
        fail(name, f"level {s.get('level')}")
    if (s["width"], s["height"]) != (f["video"]["width"], f["video"]["height"]):
        fail(name, f"size {s['width']} x {s['height']}")
    if rotation(s) != f["video"]["rotation"]:
        fail(name, f"turned {rotation(s)}")
    if abs(float(p["format"]["duration"]) - f["duration"]) > 0.05:
        fail(name, f"duration {p['format']['duration']}")
    if f["audio"] is None:
        if aus:
            fail(name, "ffprobe finds sound")
    elif len(aus) != 1 or aus[0]["codec_name"] != "aac" or aus[0].get("profile") != "LC":
        fail(name, "not one AAC-LC sound track")
    elif (aus[0]["channels"], int(aus[0]["sample_rate"])) != (f["audio"]["channels"], f["audio"]["sampleRate"]):
        fail(name, f"sound {aus[0]['channels']} channels at {aus[0]['sample_rate']}")

    stripped = here / t["stripped"]["file"]
    sb = stripped.read_bytes()
    if hashlib.sha256(sb).hexdigest() != t["stripped"]["sha256"]:
        fail(name, "the stripped file is not the one the vector names")
        continue
    if framemd5(fixtures / name, True) != framemd5(stripped, True):
        fail(name, "the stripped file holds other packets")
    if framemd5(fixtures / name, False) != framemd5(stripped, False):
        fail(name, "the stripped file decodes to other frames")
    sp = probe(stripped)
    tags = dict(sp["format"].get("tags", {}))
    for st in sp["streams"]:
        tags.update({k: x for k, x in st.get("tags", {}).items() if k not in ("language", "handler_name", "vendor_id")})
        if st.get("tags", {}).get("handler_name"):
            fail(name, "the stripped file still names a handler")
    tags = {k: x for k, x in tags.items() if k not in ("major_brand", "minor_version", "compatible_brands")}
    if tags:
        fail(name, f"the stripped file still carries {sorted(tags)}")
    if rotation(sp["streams"][0]) != f["video"]["rotation"]:
        fail(name, "the stripped file lost its turn")
    if top_boxes(sb) != ["ftyp", "moov", "mdat"]:
        fail(name, f"the stripped file's boxes are {top_boxes(sb)}")
    if any(k in sb for k in (b"udta", b"loci", b"free", b"uuid", b"Lavf", b"Hidden", b"hidden where")):
        fail(name, "the stripped file still holds metadata, free space or the encoder's name")
    if not bad:
        print(f"ok   {name} ({f['type']}; stripped: same packets, same frames, nothing else)")

print(f"{len(v['vectors'])} vectors, {bad} failing")
sys.exit(1 if bad else 0)
