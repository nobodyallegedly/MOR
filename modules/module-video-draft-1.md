# Module: Video

*Draft 1, 10 October 2026 (F243: the film on dubsar.org's front page). **Not yet approved.** Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v21, the Envelopes MIP draft 7, the Development MIP draft 6, the JPEG Module draft 1, the relay transport cMIP draft 3 and findings F1 to F243. Not core: a founding media type for task 5 (media interpretation), frozen at publication, competing with any other. Written on the pattern of the JPEG Module. The choices this draft makes where F243 is silent are listed in `docs/video-on-the-site.md`, for Nobody, allegedly, to confirm or change.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A film on MOR is published like any media: its bytes are locked, and a public publication describes them, with the key. This Module says what those bytes are when the publication names it: one MP4 file, the kind every phone and editing program writes, with its pictures coded as H.264 and, if it has sound, its sound coded as AAC. Every browser, and every iPhone, plays that kind of file.*

*An MP4 file is a set of nested boxes: one says what kind of file it is, one holds the index (which tracks, how big the pictures are, where each piece of the film is), and one or more hold the film's compressed pictures and sound. Before anything plays a film, a client reads the boxes and checks them: that the file is whole and holds together, that it is the kind of film this Module allows and no other, that nothing in it points outside the file, and that it is within the limits stated here. A file that fails is not played, and the client says why.*

*Like a photo, a film from a phone carries more than the film: where it was taken, when, the phone's name, titles and comments, and room where anything can hide. A client that publishes a film for its user strips it first, to the film alone, as it strips a picture. Nothing is re-encoded: every compressed picture and sound is copied byte for byte, so the stripped film plays exactly the same.*

## Purpose

This Module fills task 5 of the Envelopes MIP (Development, task table: media interpretation) for one media type. It defines:

- what the media object's bytes are;
- what a client checks before playing them, and what it refuses;
- what a player shows;
- what a publishing client removes before publishing.

It defines no act type. A film is a publication (Envelopes, type 0) whose media type (payload field 0) is this Module's spec hash, or a file of a website whose kind is a film (website cMIP, draft 4, rule 4).

## Dependencies

Envelopes (publication, media lock, work hash, withdrawal) and Development. The JPEG Module for a poster picture. The relay transport cMIP only to publish and fetch, as for any act and any media.

## Definitions

- **MP4.** A file in the ISO base media file format (ISO/IEC 14496-12), as the MP4 file format specifies it (ISO/IEC 14496-14), carrying H.264 as ISO/IEC 14496-15 specifies.
- **Box.** A four-byte size (or 1, followed by an eight-byte size), a four-character type (`uuid` followed by sixteen more bytes), and a body. A box's size counts its header.
- **The index.** The movie box (`moov`): the tracks, their sample descriptions and sample tables.
- **The film.** The pictures of the one picture track and the sound of the sound track, if there is one, decoded and timed as the index says.
- **Metadata.** Everything in the file that playing the film does not need: user data boxes (`udta`), metadata boxes (`meta`), free space (`free`, `skip`), boxes of kinds no player reads (`uuid`), an object descriptor box (`iods`), names in handler and sample description boxes, the dates in the movie, track and media headers, and media data that no sample uses.
- **H.264.** ITU-T H.264 (ISO/IEC 14496-10). **AAC-LC.** MPEG-4 audio (ISO/IEC 14496-3), audio object type 2.

## The media object

1. **One file.** The media object's plaintext is one MP4 file, whole. The work hash is taken over exactly those bytes (Envelopes, "Work hash"). There is no segmentation: the publication's fields describe the whole file.
   - A client reads the file box by box. The top-level boxes fill the file exactly; a box whose size is 0 (to the end of the file) may only be the last. A box that runs past its parent or past the end of the file, or bytes left over that are not a box, mean the file is not an MP4 this Module reads: the client says so, and plays nothing. *A film is fetched and checked whole before it plays (Envelopes: the work hash is over the complete plaintext), so a player never meets the end of a file it was not given.*

## What a client checks before playing

*Client conformance.* A client checks rules 2 to 9 on the bytes it will play, after checking them against the work hash and size, and before handing them to any decoder. A file that fails any rule is not played (rule 12).

2. **An MP4, whole, with one index.** The first box is the file type box (`ftyp`); its major brand is not `qt  ` (a QuickTime file), and its brands include at least one of `isom`, `iso2` to `iso6`, `mp41`, `mp42` or `avc1`. There is exactly one movie box (`moov`) and at least one media data box (`mdat`). The top level holds nothing else but metadata (`udta`, `meta`, `free`, `skip`, `uuid`). A fragmented file (`moof`, `mvex`, `mfra`, `sidx`, `styp`, `ssix`, `emsg`, `prft`) is refused: *it is what a live stream writes, and a film on MOR is a finished work.*

3. **Pictures, and at most one sound.** The index holds exactly one picture track (handler `vide`) and at most one sound track (handler `soun`), and no other track: no text, subtitles, chapters, timecode, metadata or hint track. Each track has one sample description and one data reference.

4. **Pictures in H.264.** The picture track's sample description is `avc1`, with its parameter sets in its configuration box (`avcC`): profile Baseline (66), Main (77) or High (100); colour sampled 4:2:0, 8 bits a sample; progressive (frames only, not interlaced). The size of the pictures is the size the first sequence parameter set codes, after its cropping; the profile and level in the configuration are the sequence parameter set's. *These are the pictures every phone's decoder plays in hardware. A picture track in another codec (HEVC, AV1, VP9, MPEG-4 part 2), H.264 with its parameter sets only in the stream (`avc3`), or encrypted (`encv`), is refused: each would need its own Module.*

5. **Sound in AAC-LC.** The sound track's sample description is `mp4a`, version 0 (an MP4 sound description, not QuickTime's), whose elementary stream descriptor names MPEG-4 audio (object type 0x40, stream type 5) and whose decoder configuration is AAC-LC (audio object type 2), mono or stereo (channel configuration 1 or 2). *MP3, AC-3, Opus, other kinds of AAC, more channels, or encrypted sound (`enca`), are refused.*

6. **Which way up.** The picture track's header (`tkhd`) holds a matrix; it is one of the four quarter turns: as stored, a quarter turn clockwise, a half turn, or a quarter turn anticlockwise (its translation is not read). A player turns the pictures as it says. The movie header's (`mvhd`) matrix is the identity. Any other matrix (scaled, skewed, mirrored) is refused. *A phone held upright records its pictures on their side and a quarter turn in the matrix, as it does with a photo's orientation; every browser applies it.*

7. **The index holds together.** Every box in the index is one the Module reads, in its place, or metadata; a box of any other kind in the index is refused, naming it. The sample tables agree: the sample count of the timing table (`stts`) is the size table's (`stsz`); composition offsets (`ctts`), when present, count the same samples; key pictures (`stss`) are samples; the sample-to-chunk table (`stsc`) is in order, names the one sample description, and assigns every sample to a chunk. Every chunk of samples lies inside a media data box, and no two chunks overlap. *A player trusts the index to find each sample; an index that disagrees with itself is where decoders break.*

8. **Nothing from elsewhere, nothing that runs.** The film is entirely in the file:
   - each track's data reference is self-contained (`url ` or `urn ` with flag 1): a reference naming an address elsewhere is refused;
   - the sound's elementary stream descriptor sets no URL flag;
   - no metadata box holds a data reference (`dinf`);
   - no track is encrypted (its key would come from elsewhere);
   - no track is text, subtitles, a scene description or anything else a player would interpret rather than decode (rule 3).

   *MP4 has no scripts, but it can point elsewhere: a data reference can say the samples are at an address, which a player would fetch. Text tracks and scene descriptions carry links and styling a player renders. Refusing them leaves only pictures and sound, which a decoder turns into pixels and samples, and nothing else.*

9. **Limits.** A film is at most:
   - **67,108,848 bytes** (64 MiB less 16 bytes): the largest file that, locked (Envelopes, "Media": the 16-byte tag added), fits one media object of 64 MiB, what the homes accept by default (relay transport cMIP, `info`; relay README). *A relay may accept less; a film larger than a relay takes is published elsewhere, or not at all;*
   - **600 seconds** long, the longest of the movie's and its tracks' durations;
   - **1920 × 1080 pixels**, either way round: the long side at most 1920, the short side at most 1080;
   - **60 pictures a second**, on average over the picture track;
   - **level 4.2** of H.264;
   - sound sampled at **48,000 Hz** at most.

   *Every phone made since 2015 plays this. A longer or sharper film needs the media cMIP that serves one object in parts from many homes (F243), not yet written; it will raise the size limit, and this Module's next draft the others with it.*

## Stripping before publishing

10. *Client conformance.* **A client that publishes a film for its user MUST first strip it to the film alone**, and SHOULD tell the user what it removed. Stripping writes a new file:
    - the file type box, as it was;
    - the movie box, holding: the movie header with its dates set to zero; and for each track, the track header with its dates set to zero, its edit list, the media header with its dates set to zero, the handler with its name empty, the media information header, the data reference, and the sample tables, each as it was except: the picture description's compressor name set to zeros, and the chunk offsets rewritten;
    - one media data box, holding every chunk of samples the index names, byte for byte, in the order they were in the file.

    It removes everything else: every user data and metadata box (titles, comments, the place, the device, cover pictures), free space, boxes of kinds no player reads, the object descriptor, and media data no sample uses. The index comes first, before the media data.

    *Nothing is re-encoded: every compressed picture and sound is the same bytes, so the stripped file plays exactly the same, turned the same way. A client strips before locking: the work hash, the locked hash and the size published are those of the stripped file. Putting the index first costs nothing and lets a player start before it has every byte, once films are served in parts.*

    *No verifier can tell whether a film was stripped by choice or by accident, and a reader plays a film that still carries metadata (it never shows it), so this is conformance, as for pictures (JPEG Module, rule 6): it is the publisher's own client that protects the publisher.*

## Playing

11. **What a player shows.** *Client conformance.* A player shows the film: the picture track's pictures, decoded as H.264 says, turned as rule 6 says, with the sound track's sound in step, as the tracks' timing and edit lists say. It never shows the file's metadata as part of the film.
    - **On the viewer's action.** A player never starts a film with sound on its own: the film plays when the viewer asks. *A page that starts talking when it opens is a page people close; and fetching a film costs the viewer its size.*
    - **Inline.** A player on a phone plays the film where it is shown, and lets the viewer choose full screen. *Safari on an iPhone otherwise opens every film full screen.*
    - **The poster.** What a player shows before the film plays is a poster picture the publisher names (a JPEG, under the JPEG Module), or nothing; never a picture chosen from the file's metadata.

12. **What a player cannot play.** *Client conformance.* A player that cannot play a film (a file rule 2 to 9 refuses; a decoder that does not implement it; damaged data the decoder stops at) says so, with the reason where it has one, and shows nothing of the film in its place: only its poster, if it has one. It never shows part of a film as the whole without saying so. *A client that knows before fetching that it cannot decode the codecs named (such as a browser's `canPlayType` answering no) says so before fetching.*

## A film in a post

13. **By reference.** A post shows a film by naming its publication in the text act's `refs`, as it shows a picture (JPEG Module, rule 7): judged as any act through its own signer's identity chain, shown under that signer, its bytes checked against the locked hash, the work hash and the size before anything plays, and shown as not available once withdrawn. A client fetches a film's bytes only when the reader asks to play it. *Not built in this step: the display client of websites plays films (website cMIP, draft 4, rule 12a); the barebone client and the web reader do not yet.*

## Stated costs

- **The whole film before the first picture.** The work hash is over the whole file, so a client checks it only once every byte has arrived: nothing plays before then. A 23 MB film takes seconds on a good connection, longer on a phone's. *The media cMIP serving one object in parts, each with its own hash, will let a film start sooner.*
- **Some films from cameras and editors are refused as they are.** The Module reads only the boxes it names, and refuses others rather than guess. A file carrying another box (a QuickTime file, a camera's own boxes) is remuxed first, without re-encoding (`ffmpeg -i in.mov -c copy -map_metadata -1 out.mp4`), then stripped.
- **What the encoder writes inside the pictures stays.** H.264 can carry text inside the compressed stream (user data in SEI messages; x264 writes its settings there). Stripping never touches the compressed stream, so this stays. *It says how the film was encoded, not who filmed it or where; a client may say a film carries it.*
- **A film made by another client can carry metadata.** The Module plays a film that carries metadata; only conforming publishing clients strip. A player never shows it, but anyone who fetches the file gets it whole.
- **Two players may show a film slightly differently.** Decoders are exact for H.264 pictures but not for colour handling and scaling, and AAC decoders differ in their last bits. The Module fixes which film, which way up and what sound; not every pixel on every screen.
- **The Module does not decode.** A file can pass every rule and still hold a stream a decoder rejects; the player then says it cannot play it (rule 12). *Decoding is the decoder's work; rules 2 to 9 keep what reaches it to what it is built for.*
- **Size.** One file is one media object, limited by what a relay accepts for media, and by rule 9.

## Reasoning

- **One kind of film, the one every phone plays.** *H.264 with AAC in MP4 plays in every browser and on every phone, most in hardware. Newer codecs compress better, but not every phone plays them; each can have its own Module later, and compete.*
- **Refuse what is not read.** *An MP4 can hold far more than a film: tracks of text and links, references to elsewhere, scene descriptions, encryption. A player that met them would do something; the Module decides that it does nothing, by refusing the file, and says why. What is left is pictures and sound, which decode to pixels and samples and nothing else.*
- **Strip, never re-encode.** *Removing boxes and moving chunks leaves every compressed sample untouched: no loss, and a test can prove the samples are the same bytes. The same reasoning as for pictures.*
- **On the viewer's action.** *Nothing on MOR should spend a viewer's data or speak to them before they ask.*
- **Under its own signer.** *As for pictures: a film by reference is shown as its signer's, never the poster's.*

## Test vectors

`modules/video/vectors/video.json`: for each test film in `modules/video/test/fixtures/`, all made from ffmpeg's test pattern and a sine tone (never anyone's real media; `modules/video/scripts/fixtures.py`), what a client reads from it (codecs, profile, level, size, turn, duration, sound, what it carries besides the film) or why the Module refuses it, and, for each film, its stripped file in `modules/video/vectors/stripped/`. `modules/video/vectors/check.py` checks them with ffprobe and ffmpeg, readers independent of the founding implementation: every film's codecs, size, turn, duration and sound are what the vector says; every stripped file holds exactly the same packets as its original, decodes to the same frames, and carries nothing else; every refused file shows, to ffprobe too, what it is refused for.

## Readings

Where F243 and the texts were silent, this draft takes the readings listed in `docs/video-on-the-site.md`.
