# Module: Dubsar Audio

*Draft 1, 21 October 2026, a Dubsar Suite session (`docs/texts-r0-report.md`). **Not yet approved.** Decided by Nobody, allegedly, 21 October 2026: "let's have an audio module"; its format, M4A (accepted). Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against the Envelopes MIR draft 10, the Development MIR draft 10, the video Module draft 1 (whose pattern and code it follows), the JPEG Module draft 1 and the relay transport cMIP draft 5. Not core: a media type for task 5 (media interpretation), frozen at publication, competing with any other. Named with the house prefix "Dubsar" (F356). The code is `modules/audio/`, which uses the video Module's code (`modules/video/src/video.ts`) for everything the two Modules share. Not yet used by any app: the Publishing and Dub rounds will.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A recording on MOR (a song, a voice note, a talk) is published like any media: its bytes are locked, and a public publication describes them, with the key. This Module says what those bytes are when the publication names it: one M4A file, the kind every phone records and every music program writes, with its sound coded as AAC. Every browser, and every iPhone and Android phone, plays that kind of file.*

*An M4A file is an MP4 file holding sound and no pictures: a set of nested boxes, one saying what kind of file it is, one holding the index (the sound track, how its sound is coded, where each piece of it is), and one or more holding the compressed sound. Before anything plays a recording, a client reads the boxes and checks them: that the file is whole and holds together, that it holds one sound track of the kind this Module allows and nothing else (no pictures, no text, no chapters), that nothing in it points outside the file, and that it is within the limits stated here. A file that fails is not played, and the client says why, in plain words.*

*A recording from a phone or a music program carries more than the sound: a title, an artist, an album, dates, where it was recorded, a cover picture, the program's name, and room where anything can hide. A client that publishes a recording for its user strips it first, to the sound alone. Nothing is re-encoded: every compressed piece of sound is copied byte for byte, so the stripped recording sounds exactly the same.*

## Purpose

This Module fills task 5 of the Envelopes MIR (Development, task table: media interpretation) for one media type. It defines:

- what the media object's bytes are;
- what a client checks before playing them, and what it refuses;
- what a player does;
- what a publishing client removes before publishing.

It defines no act type. A recording is a publication (Envelopes, type 0) whose media type (payload field 0) is this Module's spec hash.

## Dependencies

Envelopes (publication, media lock, work hash, withdrawal) and Development. The JPEG Module for a cover picture. The relay transport cMIP only to publish and fetch, as for any act and any media.

## Definitions

- **M4A.** A file in the ISO base media file format (ISO/IEC 14496-12), as the MP4 file format specifies it (ISO/IEC 14496-14), holding sound only. *"M4A" is the name phones and music programs give such a file, and its usual file name ending (`.m4a`); the format is MP4's.*
- **Box.** A four-byte size (or 1, followed by an eight-byte size), a four-character type (`uuid` followed by sixteen more bytes), and a body. A box's size counts its header.
- **The index.** The movie box (`moov`): the track, its sample description and its sample tables.
- **The sound.** The samples of the one sound track, decoded and timed as the index says.
- **Metadata.** Everything in the file that playing the sound does not need: user data boxes (`udta`), metadata boxes (`meta`, which hold the iTunes-style tags: title, artist, album, cover picture), free space (`free`, `skip`), boxes of kinds no player reads (`uuid`), an object descriptor box (`iods`), the name in the handler box, the dates in the movie, track and media headers, and media data that no sample uses.
- **AAC-LC.** MPEG-4 audio (ISO/IEC 14496-3), audio object type 2.

## The media object

1. **One file.** The media object's plaintext is one M4A file, whole. The work hash is taken over exactly those bytes (Envelopes, "Work hash"). There is no segmentation: the publication's fields describe the whole file.
   - A client reads the file box by box. The top-level boxes fill the file exactly; a box whose size is 0 (to the end of the file) may only be the last. A box that runs past its parent or past the end of the file, or bytes left over that are not a box, mean the file is not an M4A this Module reads: the client says so, and plays nothing. *A recording is fetched and checked whole before it plays (Envelopes: the work hash is over the complete plaintext), so a player never meets the end of a file it was not given.*

## What a client checks before playing

*Client conformance.* A client checks rules 2 to 9 on the bytes it will play, after checking them against the work hash and size, and before handing them to any decoder. A file that fails any rule is not played (rule 12).

2. **An M4A, whole, with one index.** The first box is the file type box (`ftyp`); its major brand is not `qt  ` (a QuickTime file), and its brands include at least one of `M4A `, `isom`, `iso2` to `iso6`, `mp41` or `mp42`. There is exactly one movie box (`moov`) and at least one media data box (`mdat`). The top level holds nothing else but metadata (`udta`, `meta`, `free`, `skip`, `uuid`). A fragmented file (`moof`, `mvex`, `mfra`, `sidx`, `styp`, `ssix`, `emsg`, `prft`) is refused: *it is what a live stream writes, and a recording on MOR is a finished work.* *Brands say which readers a file was written for; a file may name `M4A ` or a plain MP4 brand, since programs write either for the same sound. The brands are only a first check: rules 3 to 8 decide.*

3. **One sound track, nothing else.** The index holds exactly one track, and it is a sound track (handler `soun`): no picture track (handler `vide`, `pict` or `auxv`), and no text, subtitles, chapters, timecode, metadata or hint track. The track has one sample description and one data reference. *A file with pictures beside its sound is a film, and the video Module's. Chapters and lyrics are text a player would show: refused here, as subtitles are in a film.*

4. **Sound in AAC-LC.** The sound track's sample description is `mp4a`, version 0 (an MP4 sound description, not QuickTime's), whose elementary stream descriptor names MPEG-4 audio (object type 0x40, stream type 5) and whose decoder configuration is AAC-LC (audio object type 2), mono or stereo (channel configuration 1 or 2). *Apple Lossless (`alac`), MP3, AC-3, Opus, other kinds of AAC (Main, HE-AAC signalled as its own type), more channels, or encrypted sound (`enca`, and the `drms` of old protected music), are refused: each would need its own Module.*

5. **Nothing turned.** The track header's (`tkhd`) matrix and the movie header's (`mvhd`) matrix are the identity (their translation is not read, as in the video Module). *A matrix places pictures; a sound track has none, so any other matrix means a file this Module does not know.*

6. *(No rule: the video Module's rule 6, which way up, has no place here. The numbers follow the video Module's, so that a rule of one is found under the same number in the other.)*

7. **The index holds together.** Every box in the index is one the Module reads, in its place, or metadata; a box of any other kind in the index is refused, naming it. The sample tables agree: the sample count of the timing table (`stts`) is the size table's (`stsz`); composition offsets (`ctts`), when present, count the same samples; the sample-to-chunk table (`stsc`) is in order, names the one sample description, and assigns every sample to a chunk. Every chunk of samples lies inside a media data box, and no two chunks overlap. *A player trusts the index to find each sample; an index that disagrees with itself is where decoders break.*

8. **Nothing from elsewhere, nothing that runs.** The recording is entirely in the file:
   - the track's data reference is self-contained (`url ` or `urn ` with flag 1): a reference naming an address elsewhere is refused;
   - the sound's elementary stream descriptor sets no URL flag;
   - no metadata box holds a data reference (`dinf`);
   - the track is not encrypted (its key would come from elsewhere);
   - no track is text, chapters, a scene description or anything else a player would interpret rather than decode (rule 3).

   *MP4 has no scripts, but it can point elsewhere: a data reference can say the samples are at an address, which a player would fetch. Text tracks carry links a player renders. Refusing them leaves only sound, which a decoder turns into samples, and nothing else.*

9. **Limits.** A recording is at most:
   - **67,108,848 bytes** (64 MiB less 16 bytes): the largest file that, locked (Envelopes, "Media": the 16-byte tag added), fits one media object of 64 MiB, what the homes accept by default (relay transport cMIP, `info`; relay README). *A relay may accept less. At 128 kilobits a second, 64 MiB holds about seventy minutes of stereo;*
   - **7,200 seconds** (two hours) long, the longest of the movie's and its track's durations;
   - sound sampled at **48,000 Hz** at most.

   *Every phone plays this. Two hours covers a song, an album side, a talk or a long conversation; a longer recording at a low rate would fit 64 MiB but is a different object, served in parts (the media cMIP F243 foresees, not yet written), when this Module's next draft raises its limits with it.*

## Stripping before publishing

10. *Client conformance.* **A client that publishes a recording for its user MUST first strip it to the sound alone**, and SHOULD tell the user what it removed. Stripping writes a new file:
    - the file type box, as it was;
    - the movie box, holding: the movie header with its dates set to zero; and for the track, the track header with its dates set to zero, its edit list, the media header with its dates set to zero, the handler with its name empty, the media information header, the data reference, and the sample tables, each as it was except the chunk offsets, rewritten;
    - one media data box, holding every chunk of samples the index names, byte for byte, in the order they were in the file.

    It removes everything else: every user data and metadata box (titles, the artist, the album, comments, the place, the device, the cover picture, the lyrics), free space, boxes of kinds no player reads, the object descriptor, and media data no sample uses. The index comes first, before the media data. *This is the video Module's rule 10, applied to one sound track; the founding implementations share its code.*

    *Nothing is re-encoded: every compressed piece of sound is the same bytes, so the stripped file sounds exactly the same. A client strips before locking: the work hash, the locked hash and the size published are those of the stripped file.*

    *No verifier can tell whether a recording was stripped by choice or by accident, and a reader plays a recording that still carries metadata (it never shows it), so this is conformance, as for pictures and films (JPEG Module, rule 6; video Module, rule 10): it is the publisher's own client that protects the publisher.*

## Playing

11. **What a player does.** *Client conformance.* A player plays the sound track's sound, decoded as AAC says, timed as the track's timing and edit list say. It never shows the file's metadata as part of the recording: a title or an artist shown beside it comes from the publication and its signer, never from inside the file.
    - **On the listener's action.** A player never starts a recording on its own: it plays when the listener asks. *A page that starts talking when it opens is a page people close; and fetching a recording costs the listener its size.*
    - **The cover.** What a player shows beside a recording is a cover picture the publisher names (a JPEG, under the JPEG Module), or nothing; never a picture taken from the file's metadata, which stripping removes.

12. **What a player cannot play.** *Client conformance.* A player that cannot play a recording (a file rules 2 to 9 refuse; a decoder that does not implement it; damaged data the decoder stops at) says so, in plain words, with the reason where it has one, and plays nothing of it. It never plays part of a recording as the whole without saying so. *A client that knows before fetching that it cannot decode the codec named (such as a browser's `canPlayType` answering no for `audio/mp4; codecs="mp4a.40.2"`) says so before fetching.*

## A recording in a post

13. **By reference.** A post plays a recording by naming its publication in the text act's `refs`, as it shows a picture (JPEG Module, rule 7) or a film (video Module, rule 13): judged as any act through its own signer's identity chain, shown under that signer, its bytes checked against the locked hash, the work hash and the size before anything plays, and shown as not available once withdrawn. A client fetches a recording's bytes only when the reader asks to play it. *Not built: no app uses this Module yet; the Publishing and Dub rounds will.*

## The refusals, in plain words

*What a client says, in substance, for each refusal (the founding implementation's words are in its vectors, `modules/audio/vectors/audio.json`):*

| The file | What the client says |
| --- | --- |
| Not an MP4 file at all, or cut short | It is not a recording this app can read: it is damaged or of another kind. |
| A QuickTime file (`.mov`) | It is a QuickTime file, not M4A: save it again as M4A. |
| Pictures beside the sound | It holds pictures too: it is a film, for the video Module. |
| Chapters, lyrics or text | It holds text beside the sound, which is not played. |
| Two sound tracks, or none | It must hold exactly one sound. |
| Apple Lossless, MP3, or another codec | Its sound is not coded as AAC: save it again as AAC (AAC-LC). |
| Another kind of AAC, or more than two channels | Its sound is AAC of another kind, or surround: save it again as AAC-LC, mono or stereo. |
| Encrypted sound | Its sound is locked by its maker, and cannot be played here. |
| Sound stored at an address elsewhere | Part of it is somewhere else, which is not fetched. |
| A fragmented file | It is a live stream's recording, not a finished one: save it again as one whole file. |
| Too large, too long, sampled too finely | It is beyond the limits: 64 MiB, two hours, 48,000 Hz. |

## Stated costs

- **The whole recording before the first sound.** The work hash is over the whole file, so a client checks it only once every byte has arrived: nothing plays before then. *The media cMIP serving one object in parts will let a recording start sooner.*
- **Some recordings are refused as they are.** Lossless files (Apple Lossless), MP3 files, surround sound and files from programs that write their own boxes are refused rather than guessed at. A refused file is converted first: AAC-LC without re-encoding where it already is (`ffmpeg -i in.mov -c copy -map_metadata -1 out.m4a`), otherwise re-encoded by the publisher's own choice, then stripped.
- **Gapless playback information in the metadata goes.** Music programs write how many silent samples the encoder added at the start and end (iTunes' `iTunSMPB` tag) in the metadata, which stripping removes. The edit list, which programs also write for the same purpose, is kept. *A song played after another may then start a few milliseconds late on a player that reads only the tag.*
- **What the encoder writes inside the sound stays.** AAC can carry bytes inside the compressed stream (fill elements, data stream elements). Stripping never touches the compressed stream, so these stay. *They say how the sound was encoded, at most; a client may say a recording carries them.*
- **A recording made by another client can carry metadata.** The Module plays a recording that carries metadata; only conforming publishing clients strip. A player never shows it, but anyone who fetches the file gets it whole.
- **Two players may sound slightly different.** AAC decoders differ in their last bits. The Module fixes which recording and what sound; not every sample on every device.
- **The Module does not decode.** A file can pass every rule and still hold a stream a decoder rejects; the player then says it cannot play it (rule 12).
- **Size.** One file is one media object, limited by what a relay accepts for media, and by rule 9.

## Reasoning

- **One kind of recording, the one every phone plays.** *AAC-LC in MP4 plays in every browser and on every phone. Opus compresses better, FLAC and Apple Lossless keep everything; each can have its own Module later, and compete.*
- **Sound only.** *A file with pictures is a film, and the video Module already checks films; letting this Module play pictures too would give two Modules two readings of the same file. A cover is the publisher's own JPEG, named beside the recording, so it is judged under its signer, as a film's poster is.*
- **Refuse what is not read.** *An MP4 can hold far more than sound: text, chapters, links, references to elsewhere, encryption. The Module decides that a player does nothing with them, by refusing the file, and says why.*
- **Strip, never re-encode.** *Removing boxes and moving chunks leaves every compressed sample untouched: no loss, and a test can prove the samples are the same bytes.*
- **One code for two Modules.** *The boxes, the track, the AAC configuration and the stripping are the video Module's own code, used unchanged; this Module's code adds only what differs (the brands, one sound track and no picture, the limits, the words). A fix to the shared reading reaches both.*

## Test vectors

`modules/audio/vectors/audio.json`: for each test recording in `modules/audio/test/fixtures/`, all made from sine tones (never anyone's real sound; `modules/audio/scripts/fixtures.py`), what a client reads from it (codec, channels, sampling rate, duration, brand, what it carries besides the sound) or why the Module refuses it, and, for each recording, its stripped file in `modules/audio/vectors/stripped/`. `modules/audio/vectors/check.py` checks them with ffprobe and ffmpeg, readers independent of the founding implementation: every recording's codec, channels, rate, duration and brand are what the vector says; every stripped file holds exactly the same packets as its original, decodes to the same sound, holds one sound stream and nothing else (no tags, no cover, no place); every refused file shows, to ffprobe or to the check's own reading of its boxes, what it is refused for.

## Readings

Where the decision ("an audio module", M4A) was silent, this draft takes these readings, each for Nobody, allegedly, to confirm or change (`docs/texts-r0-report.md`, questions):

1. **The limits:** 64 MiB less 16 bytes (as the video Module), two hours, 48,000 Hz. *Two hours confirmed by Nobody, allegedly, 21 October 2026 ("Agreed").*
2. **Both brands:** a file naming `M4A ` or a plain MP4 brand (`isom`, `mp42`…) is read alike.
3. **No chapters:** a chapter track is refused, as subtitles are in a film.
