# Make the video Module's test films, all synthetic: ffmpeg's test pattern
# (testsrc) and a sine tone, never anyone's real media. The output is
# committed; running this again with another ffmpeg may give other bytes,
# and then `npm run vectors` must be run too.
#
#   python3 scripts/fixtures.py      (needs ffmpeg with libx264, libx265, aac, libmp3lame)

import struct
import subprocess
from pathlib import Path

out = Path(__file__).resolve().parent.parent / "test" / "fixtures"
out.mkdir(parents=True, exist_ok=True)

EXACT = ["-fflags", "+bitexact", "-flags:v", "+bitexact", "-flags:a", "+bitexact", "-map_metadata", "-1"]
FAST = ["-movflags", "+faststart"]


def pattern(size="320x180", rate=25, seconds=2):
    return ["-f", "lavfi", "-i", f"testsrc=size={size}:rate={rate}:duration={seconds}"]


def tone(seconds=2, rate=48000):
    return ["-f", "lavfi", "-i", f"sine=frequency=440:sample_rate={rate}:duration={seconds}"]


H264 = ["-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p"]


def ffmpeg(name, *args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args, str(out / name)], check=True)
    print(name, (out / name).stat().st_size)


# --- Boxes, to make what ffmpeg will not ------------------------------------

CONTAINERS = {b"moov", b"trak", b"mdia", b"minf", b"dinf", b"stbl", b"edts"}


def boxes(d, o, e):
    while o < e:
        s, t = struct.unpack(">I4s", d[o : o + 8])
        yield o, s, t
        o += s


def find(d, path, o=0, e=None):
    """The offset of the first box along a path of types, and the offsets of its ancestors."""
    e = len(d) if e is None else e
    for bo, s, t in boxes(d, o, e):
        if t == path[0]:
            if len(path) == 1:
                return [bo]
            rest = find(d, path[1:], bo + 8, bo + s)
            if rest:
                return [bo] + rest
    return None


def grow(d, chain, by):
    """Add `by` to the size of every box at the offsets in `chain` (a box and its ancestors)."""
    d = bytearray(d)
    for o in chain:
        (s,) = struct.unpack(">I", d[o : o + 4])
        d[o : o + 4] = struct.pack(">I", s + by)
    return bytes(d)


# --- Films the Module plays -------------------------------------------------

# The simplest: pictures only, Baseline, the index (moov) first.
ffmpeg("plain.mp4", *pattern(), *H264, "-profile:v", "baseline", *EXACT, *FAST)
# Pictures and sound: High profile, AAC-LC in stereo.
ffmpeg("sound.mp4", *pattern(), *tone(), *H264, "-profile:v", "high", "-c:a", "aac", "-ac", "2", *EXACT, *FAST)
# Main profile, mono sound at 44.1 kHz, the index after the media (as a camera writes it).
ffmpeg("index-last.mp4", *pattern(size="256x144"), *tone(rate=44100), *H264, "-profile:v", "main", "-c:a", "aac", "-ac", "1", *EXACT)
# Turned a quarter turn clockwise, as a phone held upright records (the track's matrix).
# (ffmpeg would turn the pictures themselves when encoding, so the matrix is set on a copy.)
ffmpeg("turned-src.mp4", *pattern(size="320x180"), *H264, "-profile:v", "main", *EXACT, *FAST)
ffmpeg("turned.mp4", "-display_rotation", "-90", "-i", str(out / "turned-src.mp4"), "-c", "copy", *EXACT, *FAST)
(out / "turned-src.mp4").unlink()
# What a phone's film carries: a title, a place (3GPP `loci`), the encoder's name and handler names.
ffmpeg(
    "tagged.mp4", *pattern(), *tone(), *H264, "-c:a", "aac",
    "-metadata", "title=A holiday", "-metadata", "location=+48.8584+002.2945/", "-metadata", "comment=Taken on a phone",
    *FAST,
)

# Something hidden: data after the films in free boxes, a box of unknown kind
# (`uuid`, where XMP goes) and media data no sample uses.
ffmpeg("hidden-src.mp4", *pattern(seconds=1), *H264, "-profile:v", "baseline", *EXACT)
d = (out / "hidden-src.mp4").read_bytes()
(out / "hidden-src.mp4").unlink()
mdat = find(d, [b"mdat"])[0]
(ms,) = struct.unpack(">I", d[mdat : mdat + 4])
secret = b"A second picture, hidden where no sample points." * 4
d = d[: mdat + ms] + secret + d[mdat + ms :]  # inside mdat, after the last sample
d = grow(d, [mdat], len(secret))
note = b"Hidden note: not part of the film."
d += struct.pack(">I4s", 8 + len(note), b"free") + note
d += struct.pack(">I4s", 8 + 16 + 5, b"uuid") + bytes(range(16)) + b"<xmp>"
(out / "hidden.mp4").write_bytes(d)
print("hidden.mp4", len(d))

# --- Films it refuses -------------------------------------------------------

# Another video codec: MPEG-4 part 2, and HEVC.
ffmpeg("mpeg4-part2.mp4", *pattern(seconds=1), "-c:v", "mpeg4", *EXACT, *FAST)
ffmpeg("hevc.mp4", *pattern(seconds=1), "-c:v", "libx265", "-x265-params", "log-level=none", "-tag:v", "hvc1", *EXACT, *FAST)
# H.264 that phones do not all play: High 4:4:4.
ffmpeg("high-444.mp4", *pattern(seconds=1), "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv444p", *EXACT, *FAST)
# Sound that is not AAC: MP3.
ffmpeg("mp3-sound.mp4", *pattern(seconds=1), *tone(seconds=1), *H264, "-c:a", "libmp3lame", *EXACT, *FAST)
# A third track, of subtitles.
(out / "subs.srt").write_text("1\n00:00:00,000 --> 00:00:01,000\nWords over the picture\n")
ffmpeg("subtitles.mp4", *pattern(seconds=1), "-i", str(out / "subs.srt"), *H264, "-c:s", "mov_text", *EXACT, *FAST)
(out / "subs.srt").unlink()
# Two picture tracks.
ffmpeg("two-pictures.mp4", *pattern(seconds=1), *pattern(size="160x90", seconds=1), "-map", "0", "-map", "1", *H264, *EXACT, *FAST)
# Fragmented: what a live stream writes.
ffmpeg("fragmented.mp4", *pattern(seconds=1), *H264, *EXACT, "-movflags", "frag_keyframe+empty_moov")
# Pictures larger than 1920 x 1080.
ffmpeg("too-large.mp4", *pattern(size="2560x1440", seconds=0.2), *H264, *EXACT, *FAST)
# Longer than ten minutes (tiny, one picture a second).
ffmpeg("too-long.mp4", *pattern(size="64x36", rate=1, seconds=601), *H264, "-g", "600", *EXACT, *FAST)
# More than 60 pictures a second.
ffmpeg("too-fast.mp4", *pattern(size="64x36", rate=120, seconds=1), *H264, *EXACT, *FAST)

# A sample stored elsewhere: the data reference of the picture track names an
# address instead of this file (the index is after the media, so no offset moves).
ffmpeg("external-src.mp4", *pattern(seconds=1), *H264, "-profile:v", "baseline", *EXACT)
d = (out / "external-src.mp4").read_bytes()
(out / "external-src.mp4").unlink()
chain = find(d, [b"moov", b"trak", b"mdia", b"minf", b"dinf", b"dref"])
dref = chain[-1]
url = dref + 16
assert d[url + 4 : url + 8] == b"url " and d[url + 8 : url + 12] == b"\0\0\0\1"
location = b"https://example.org/the-real-film.mp4\0"
entry = struct.pack(">I4sI", 12 + len(location), b"url ", 0) + location
d = d[:url] + entry + d[url + 12 :]
d = grow(d, chain, len(entry) - 12)
(out / "external.mp4").write_bytes(d)
print("external.mp4", len(d))

# Not whole, and not an MP4 at all.
p = (out / "plain.mp4").read_bytes()
(out / "truncated.mp4").write_bytes(p[: len(p) * 2 // 3])
(out / "not-an-mp4.mp4").write_bytes(b"This is a text file with a film's name.\n")
print("truncated.mp4, not-an-mp4.mp4")
