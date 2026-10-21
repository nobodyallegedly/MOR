# mor-audio

The audio Module: the founding implementation of `modules/module-audio-draft-1.md`, a media type for task 5 of the Envelopes MIR. **No app uses it yet**: the Publishing round (Edubba) and a Dub round will, as the site uses the video Module.

## In plain words

An M4A file is an MP4 file holding sound and no pictures: a set of nested boxes saying what kind of file it is, an index (the sound track, how it is coded, where each piece of it lies), and the compressed sound. This package reads the boxes and checks them, without decoding any sound: that the file is whole and holds together; that it holds exactly one sound track in AAC-LC, mono or stereo, and no picture, text or chapter track; that nothing in it points outside the file; and that it is within the Module's limits (64 MiB less 16 bytes, two hours, 48,000 Hz). It says why it refuses a file.

It can also strip a recording to the sound alone before it is published: the title, the artist, the album, the cover picture, where it was recorded, dates, the software's names, free space and hidden data go; every compressed piece of sound is copied byte for byte, so the recording sounds exactly the same.

## One code with the video Module

An M4A file is read with the video Module's own code (`../video/src/video.ts`): its box reader, its reading of a track and of the AAC configuration, its checks of the sample tables and the data reference, and its stripping, used as they are. `src/audio.ts` adds only what differs: the brands, exactly one sound track and no picture, a sound track's matrix, the limits, and the words (the one shared refusal that says "a film" is said here of "a recording"). The video Module accepts and refuses exactly what it did: its code only gained `export` on what is shared, and its stripping was split in two (`strip` reads, then `stripped` writes), its vectors unchanged byte for byte; the part of it the display client bundles is byte for byte as released.

## What is here

| File | What |
| --- | --- |
| `src/audio.ts` | `read()` (the Module's rules 1 to 9), `strip()` (rule 10), `trackData()` (the samples, for tests), `NotSound`, the limits, `CARRIED_WORDS`. Runs in Node and in a browser. |
| `src/cli.ts` | `mor-audio read <sound.m4a>` and `mor-audio strip <in.m4a> <out.m4a>`. |
| `scripts/fixtures.py` | Makes the test recordings with ffmpeg, all synthetic (sine tones). Its output is committed. |
| `test/fixtures/` | Recordings it plays: mono at 44.1 kHz (the M4A brand); stereo at 48 kHz (a plain MP4 brand); mono at 32 kHz with the index after the sound; tagged with a title, an artist, an album, a date, a comment, a place and a cover picture; with data hidden in free space, an unknown box and unused media data. Recordings it refuses: with a picture track, Apple Lossless, MP3, AAC Main, six channels, 96 kHz, two sound tracks, a chapter track, a QuickTime file, fragmented, an external data reference, longer than two hours (its header says so), truncated, not an M4A. |
| `vectors/audio.json`, `vectors/stripped/` | Test vectors (`npm run vectors` rewrites them). |
| `vectors/check.py` | Checks the vectors with ffprobe and ffmpeg, independent readers. |

## Run

```
npm install
npm test                  # the fixtures, read, refused and stripped; 20,000 damaged files
python3 vectors/check.py  # the vectors, by ffprobe and ffmpeg
npm run cli -- read test/fixtures/stereo.m4a
```

## What the tests show

- Each fixture is read, or refused, exactly as its vector says, and each refusal names its rule; the one refusal worded by the shared code (a sound naming a stream elsewhere) is said in this Module's words.
- The video Module refuses every recording this one plays (no picture track), and this one refuses the video Module's films (a picture track).
- Stripping keeps every sample byte for byte, removes everything else (no `udta`, `ilst`, cover, place, `free`, `uuid`, handler names, encoder name, hidden note or unused data left), puts the index first, and changes nothing when run twice. ffmpeg agrees: the same packets and the same decoded sound before and after, one sound stream, and no tags left.
- 20,000 randomly damaged recordings are each read or refused as not a recording, never anything else; every one read strips clean, with the same samples.
