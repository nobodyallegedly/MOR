# mor-video

The video Module (F243): the founding implementation of `modules/module-video-draft-1.md`, a media type for task 5 of the Envelopes MIP. The website display client (`clients/site`) checks every film with it before playing, and `mor-site publish` refuses a film it would not play or that still carries more than the film.

## In plain words

An MP4 file is a set of nested boxes: what kind of file it is, an index (the tracks, the size of the pictures, where each piece of the film lies), and the compressed pictures and sound. This package reads the boxes and checks them, without decoding a single picture: that the file is whole and holds together; that it holds one picture track in H.264 and at most one sound track in AAC; that nothing in it points outside the file; and that it is within the Module's limits (64 MiB less 16 bytes, ten minutes, 1920 × 1080, 60 pictures a second). It says why it refuses a file.

It can also strip a film to the film alone before it is published: titles, the place it was filmed, dates, the software's names, free space and hidden data go; every compressed picture and sound is copied byte for byte, so the film plays exactly the same.

## What is here

| File | What |
| --- | --- |
| `src/video.ts` | `read()` (the Module's rules 1 to 9), `strip()` (rule 10), `trackData()` (each track's samples, for tests), `NotFilm`, the limits. Runs in Node and in a browser. |
| `src/cli.ts` | `mor-video read <film.mp4>` and `mor-video strip <in.mp4> <out.mp4>`. |
| `scripts/fixtures.py` | Makes the test films with ffmpeg, all synthetic (the test pattern and a sine tone). Its output is committed. |
| `test/fixtures/` | Films it plays: pictures only (Baseline); pictures and stereo sound (High); Main with mono sound, the index after the media; turned a quarter turn; tagged with a title, a place and a comment; with data hidden in free space, an unknown box and unused media data. Films it refuses: an external data reference, fragmented, HEVC, MPEG-4 part 2, H.264 4:4:4, MP3 sound, a subtitle track, two picture tracks, 2560 × 1440, 601 seconds, 120 pictures a second, truncated, not an MP4. |
| `vectors/video.json`, `vectors/stripped/` | Test vectors (`npm run vectors` rewrites them). |
| `vectors/check.py` | Checks the vectors with ffprobe and ffmpeg, independent readers. |

## Run

```
npm install
npm test                  # the fixtures, read, refused and stripped; 20,000 damaged files
python3 vectors/check.py  # the vectors, by ffprobe and ffmpeg
npm run cli -- read test/fixtures/sound.mp4
```

## What the tests show

- Each fixture is read, or refused, exactly as its vector says, and each refusal names its rule.
- Stripping keeps every track's samples byte for byte, removes everything else (no `udta`, place, `free`, `uuid`, handler names, encoder name, hidden note or unused data left), puts the index first, and changes nothing when run twice. ffmpeg agrees: the same packets and the same decoded frames before and after, and no tags left.
- 20,000 randomly damaged films are each read or refused as not a film, never anything else; every one read strips clean, with the same samples.
