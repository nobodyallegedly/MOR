# Check the audio Module's test vectors with ffprobe and ffmpeg, readers
# independent of the founding implementation (modules/audio/src/audio.ts):
#   - each recording's codec, channels, sampling rate and duration are what
#     the vector says, and it holds one sound stream and nothing else;
#   - each stripped file holds exactly the same packets as the original (the
#     compressed sound untouched), decodes to the same sound, carries no tags,
#     no cover picture and no place, and has its index first;
#   - each refused file shows, to ffprobe too, what the Module refuses it for.
#
#   python3 vectors/check.py     (needs ffmpeg and ffprobe on the path)

import hashlib
import json
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
v = json.loads((here / "audio.json").read_text())
fixtures = (here / v["fixtures"]).resolve()
bad = 0


def fail(name, why):
    global bad
    bad += 1
    print(f"FAIL {name}: {why}")


def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", "-show_chapters", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else None


def framemd5(path, copy):
    """One line per packet (copy) or per decoded frame, without the header."""
    args = ["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a"]
    args += ["-c", "copy"] if copy else []
    r = subprocess.run(args + ["-f", "framemd5", "-"], capture_output=True, text=True)
    if r.returncode:
        return None
    return [l for l in r.stdout.splitlines() if not l.startswith("#")]


def top_boxes(b):
    o, out = 0, []
    while o + 8 <= len(b):
        size = int.from_bytes(b[o : o + 4], "big")
        out.append(b[o + 4 : o + 8].decode("latin1"))
        if size < 8:
            break
        o += size
    return out


def movie_seconds(b):
    """The movie header's own duration (moov, mvhd), read here: ffprobe reports the stream's."""
    o = 0
    while o + 8 <= len(b):
        size, kind = int.from_bytes(b[o : o + 4], "big"), b[o + 4 : o + 8]
        if kind == b"moov":
            m = o + 8
            if b[m + 4 : m + 8] == b"mvhd" and b[m + 8] == 0:
                return int.from_bytes(b[m + 24 : m + 28], "big") / int.from_bytes(b[m + 20 : m + 24], "big")
        if size < 8:
            break
        o += size
    return None


def kinds(p):
    return [s["codec_type"] for s in p["streams"]]


# What ffprobe should see in each refused file: the reason, told by another reader.
REFUSED = {
    "aac-main.m4a": lambda p: p["streams"][0]["codec_name"] == "aac" and p["streams"][0].get("profile") == "Main",
    "alac.m4a": lambda p: p["streams"][0]["codec_name"] == "alac",
    "chapters.m4a": lambda p: bool(p.get("chapters")) and "data" in kinds(p),
    "external.m4a": lambda p: True,  # what ffprobe makes of an address varies; the address itself is checked below
    "fragmented.m4a": lambda p: p is not None,
    "mp3.m4a": lambda p: p["streams"][0]["codec_name"] == "mp3",
    "not-an-m4a.m4a": lambda p: p is None,
    "quicktime.m4a": lambda p: p["format"]["tags"].get("major_brand", "").strip() == "qt",
    "surround.m4a": lambda p: p["streams"][0]["channels"] == 6,
    "too-fine.m4a": lambda p: int(p["streams"][0]["sample_rate"]) == 96000,
    "too-long.m4a": lambda p: True,  # its movie header says so: read below, not by ffprobe, which reports the stream's duration
    "truncated.m4a": lambda p: True,  # ffprobe may read what is there; the Module reads the boxes
    "two-sounds.m4a": lambda p: kinds(p).count("audio") == 2,
    "with-picture.m4a": lambda p: "video" in kinds(p),
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
        elif name == "fragmented.m4a" and "moof" not in top_boxes(raw):
            fail(name, "no fragment (moof) in the file")
        elif name == "external.m4a" and b"https://example.org/" not in raw:
            fail(name, "no address in the file")
        elif name == "too-long.m4a" and not (movie_seconds(raw) or 0) > 7200:
            fail(name, "its movie header does not say more than 7200 seconds")
        elif name == "truncated.m4a" and len(raw) >= len((fixtures / "mono.m4a").read_bytes()):
            fail(name, "not shorter than the recording it was cut from")
        else:
            print(f"ok   {name} (refused: {t['refused']['reason']})")
        continue

    s = t["sound"]
    if p is None:
        fail(name, "ffprobe cannot read it")
        continue
    aus = [x for x in p["streams"] if x["codec_type"] == "audio"]
    if len(aus) != 1 or aus[0]["codec_name"] != "aac" or aus[0].get("profile") != "LC":
        fail(name, "not one AAC-LC sound stream")
        continue
    a = aus[0]
    if (a["channels"], int(a["sample_rate"])) != (s["audio"]["channels"], s["audio"]["sampleRate"]):
        fail(name, f"sound {a['channels']} channels at {a['sample_rate']}")
    if abs(float(p["format"]["duration"]) - s["duration"]) > 0.05:
        fail(name, f"duration {p['format']['duration']}")
    if p["format"]["tags"].get("major_brand", "").strip() != s["brand"].strip():
        fail(name, f"brand {p['format']['tags'].get('major_brand')}")

    stripped = here / t["stripped"]["file"]
    sb = stripped.read_bytes()
    if hashlib.sha256(sb).hexdigest() != t["stripped"]["sha256"]:
        fail(name, "the stripped file is not the one the vector names")
        continue
    if framemd5(fixtures / name, True) != framemd5(stripped, True):
        fail(name, "the stripped file holds other packets")
    if framemd5(fixtures / name, False) != framemd5(stripped, False):
        fail(name, "the stripped file decodes to other sound")
    sp = probe(stripped)
    if kinds(sp) != ["audio"]:
        fail(name, f"the stripped file holds {kinds(sp)}")
    tags = dict(sp["format"].get("tags", {}))
    for st in sp["streams"]:
        tags.update({k: x for k, x in st.get("tags", {}).items() if k not in ("language", "handler_name", "vendor_id")})
        if st.get("tags", {}).get("handler_name"):
            fail(name, "the stripped file still names a handler")
    tags = {k: x for k, x in tags.items() if k not in ("major_brand", "minor_version", "compatible_brands")}
    if tags:
        fail(name, f"the stripped file still carries {sorted(tags)}")
    if top_boxes(sb) != ["ftyp", "moov", "mdat"]:
        fail(name, f"the stripped file's boxes are {top_boxes(sb)}")
    if any(k in sb for k in (b"udta", b"ilst", b"covr", b"loci", b"free", b"uuid", b"Lavf", b"PNG", b"Hidden", b"hidden where")):
        fail(name, "the stripped file still holds metadata, a cover, free space or the encoder's name")
    if not bad:
        print(f"ok   {name} ({s['type']}; stripped: same packets, same sound, nothing else)")

print(f"{len(v['vectors'])} vectors, {bad} failing")
sys.exit(1 if bad else 0)
