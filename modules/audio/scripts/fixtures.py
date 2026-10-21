# Make the audio Module's test recordings, all synthetic: sine tones from
# ffmpeg, never anyone's real sound (the one picture, in the file refused for
# holding one, is ffmpeg's test pattern). The output is committed; running
# this again with another ffmpeg may give other bytes, and then
# `npm run vectors` must be run too.
#
#   python3 scripts/fixtures.py      (needs ffmpeg with aac, alac, libmp3lame, libx264)

import struct
import subprocess
from pathlib import Path

out = Path(__file__).resolve().parent.parent / "test" / "fixtures"
out.mkdir(parents=True, exist_ok=True)

EXACT = ["-fflags", "+bitexact", "-flags:a", "+bitexact", "-map_metadata", "-1"]
FAST = ["-movflags", "+faststart"]
M4A = ["-f", "ipod"]  # ffmpeg's M4A writer: the brand "M4A "
AAC = ["-c:a", "aac", "-b:a", "64k"]


def tone(seconds=2, rate=48000, frequency=440, layout=None):
    src = f"sine=frequency={frequency}:sample_rate={rate}:duration={seconds}"
    if layout:
        return ["-f", "lavfi", "-i", f"{src},aformat=channel_layouts={layout}"]
    return ["-f", "lavfi", "-i", src]


def ffmpeg(name, *args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args, str(out / name)], check=True)
    print(name, (out / name).stat().st_size)


# --- Boxes, to make what ffmpeg will not (as the video Module's fixtures do) --


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


# --- Recordings the Module plays ----------------------------------------------

# The simplest: mono at 44.1 kHz, the M4A brand, the index (moov) first.
ffmpeg("mono.m4a", *tone(rate=44100), "-ac", "1", *AAC, *EXACT, *FAST, *M4A)
# Stereo at 48 kHz, written as a plain MP4 (the brand "isom"), the index first.
ffmpeg("stereo.m4a", *tone(), "-ac", "2", *AAC, *EXACT, *FAST, "-f", "mp4")
# Mono at 32 kHz, the index after the media (as a recorder writes it).
ffmpeg("index-last.m4a", *tone(rate=32000), "-ac", "1", *AAC, *EXACT, *M4A)
# What a song or a voice memo carries: a title, an artist, an album, a date,
# a comment, a place, the encoder's name, and a cover picture (iTunes `covr`).
(out / "cover.png").write_bytes(b"")
subprocess.run(
    ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=size=64x64:duration=1", "-frames:v", "1", str(out / "cover.png")],
    check=True,
)
ffmpeg(
    "tagged.m4a", *tone(), "-i", str(out / "cover.png"), "-map", "0:a", "-map", "1:v", *AAC, "-c:v", "png",
    "-disposition:v", "attached_pic",
    "-metadata", "title=A song", "-metadata", "artist=Someone singing", "-metadata", "album=An album",
    "-metadata", "date=2026", "-metadata", "comment=Recorded on a phone", "-metadata", "location=+48.8584+002.2945/",
    *FAST, *M4A,
)
(out / "cover.png").unlink()

# Something hidden: data after the sound in free boxes, a box of unknown kind
# (`uuid`, where XMP goes) and media data no sample uses.
ffmpeg("hidden-src.m4a", *tone(seconds=1), "-ac", "1", *AAC, *EXACT, *M4A)
d = (out / "hidden-src.m4a").read_bytes()
(out / "hidden-src.m4a").unlink()
mdat = find(d, [b"mdat"])[0]
(ms,) = struct.unpack(">I", d[mdat : mdat + 4])
secret = b"A second recording, hidden where no sample points." * 4
d = d[: mdat + ms] + secret + d[mdat + ms :]  # inside mdat, after the last sample
d = grow(d, [mdat], len(secret))
note = b"Hidden note: not part of the sound."
d += struct.pack(">I4s", 8 + len(note), b"free") + note
d += struct.pack(">I4s", 8 + 16 + 5, b"uuid") + bytes(range(16)) + b"<xmp>"
(out / "hidden.m4a").write_bytes(d)
print("hidden.m4a", len(d))

# --- Recordings it refuses ----------------------------------------------------

# A picture track beside the sound: a film, the video Module's.
ffmpeg(
    "with-picture.m4a", "-f", "lavfi", "-i", "testsrc=size=160x90:rate=25:duration=1", *tone(seconds=1),
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", *AAC, *EXACT, *FAST, "-f", "mp4",
)
# Apple Lossless, what iTunes writes for lossless M4A files.
ffmpeg("alac.m4a", *tone(seconds=1), "-c:a", "alac", *EXACT, *M4A)
# MP3 inside an MP4 file.
ffmpeg("mp3.m4a", *tone(seconds=1), "-c:a", "libmp3lame", *EXACT, "-f", "mp4")
# AAC, but not AAC-LC: the Main profile (audio object type 1).
ffmpeg("aac-main.m4a", *tone(seconds=1), "-c:a", "aac", "-profile:a", "aac_main", *EXACT, *M4A)
# Six channels (5.1).
ffmpeg("surround.m4a", *tone(seconds=1, layout="5.1"), *AAC, *EXACT, *M4A)
# Sampled at 96 kHz, above 48 kHz.
ffmpeg("too-fine.m4a", *tone(seconds=1, rate=96000), "-ac", "1", *AAC, *EXACT, *M4A)
# Two sound tracks.
ffmpeg("two-sounds.m4a", *tone(seconds=1), *tone(seconds=1, frequency=660), "-map", "0", "-map", "1", *AAC, *EXACT, *M4A)
# Chapters, which ffmpeg writes as a text track.
(out / "chapters.txt").write_text(";FFMETADATA1\n[CHAPTER]\nTIMEBASE=1/1000\nSTART=0\nEND=1000\ntitle=The first part\n")
ffmpeg("chapters.m4a", *tone(seconds=1), "-i", str(out / "chapters.txt"), "-map", "0", "-map_chapters", "1", *AAC, "-fflags", "+bitexact", *M4A)
(out / "chapters.txt").unlink()
# A QuickTime file (.mov), not M4A.
ffmpeg("quicktime.m4a", *tone(seconds=1), *AAC, *EXACT, "-f", "mov")
# Fragmented: what a live stream writes.
ffmpeg("fragmented.m4a", *tone(seconds=1), *AAC, *EXACT, "-movflags", "frag_keyframe+empty_moov", "-f", "mp4")

# Longer than two hours: a short recording whose movie header says 7,201
# seconds (an hour of sound at the lowest rate would be megabytes).
ffmpeg("too-long-src.m4a", *tone(seconds=1), "-ac", "1", *AAC, *EXACT, *FAST, *M4A)
d = bytearray((out / "too-long-src.m4a").read_bytes())
(out / "too-long-src.m4a").unlink()
mvhd = find(d, [b"moov", b"mvhd"])[-1]
assert d[mvhd + 8] == 0  # version 0: timescale at body + 12, duration at body + 16
(scale,) = struct.unpack(">I", d[mvhd + 20 : mvhd + 24])
d[mvhd + 24 : mvhd + 28] = struct.pack(">I", 7201 * scale)
(out / "too-long.m4a").write_bytes(bytes(d))
print("too-long.m4a", len(d))

# A sample stored elsewhere: the track's data reference names an address
# instead of this file (the index is after the media, so no offset moves).
ffmpeg("external-src.m4a", *tone(seconds=1), "-ac", "1", *AAC, *EXACT, *M4A)
d = (out / "external-src.m4a").read_bytes()
(out / "external-src.m4a").unlink()
chain = find(d, [b"moov", b"trak", b"mdia", b"minf", b"dinf", b"dref"])
dref = chain[-1]
url = dref + 16
assert d[url + 4 : url + 8] == b"url " and d[url + 8 : url + 12] == b"\0\0\0\1"
location = b"https://example.org/the-real-sound.m4a\0"
entry = struct.pack(">I4sI", 12 + len(location), b"url ", 0) + location
d = d[:url] + entry + d[url + 12 :]
d = grow(d, chain, len(entry) - 12)
(out / "external.m4a").write_bytes(d)
print("external.m4a", len(d))

# Not whole, and not an M4A at all.
p = (out / "mono.m4a").read_bytes()
(out / "truncated.m4a").write_bytes(p[: len(p) * 2 // 3])
(out / "not-an-m4a.m4a").write_bytes(b"This is a text file with a recording's name.\n")
print("truncated.m4a, not-an-m4a.m4a")
