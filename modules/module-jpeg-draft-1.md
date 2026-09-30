# Module: JPEG

*Draft 1, 30 September 2026 (roadmap step 9). Approved by Nobody, allegedly, 30 September 2026. Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v17, the Envelope MIP draft 6, the Text MIP draft 6, the Production MIP draft 4, the relay transport cMIP draft 2 and findings F1 to F102. Not core: a founding media type for task 5 (media interpretation), frozen at publication, competing with any other.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*A picture on MOR is published like any media: its bytes are locked, and a public publication describes them, with the key. This Module says what those bytes are when the publication names it: one JPEG file, the kind every camera and phone makes. It says which picture a reader shows from the file, which way up, and in what colours, so that two readers show the same picture.*

*A JPEG file can carry much more than the picture: where it was taken (GPS), the camera and its serial number, the date, a small preview picture that need not match the real one, comments, and further pictures hidden after the end. The Module accepts any JPEG (decided by Nobody, allegedly, 30 September 2026), but a client that posts a picture for its user strips it first, to the picture alone. What is taken out is said to the user. Which way is up is kept, and the colours, so the picture looks the same; the compressed picture itself is never touched.*

## Purpose

This Module fills task 5 of the Envelope MIP (Production, task table: media interpretation) for one media type. It defines:

- what the media object's bytes are;
- the picture a reader shows from them;
- what a posting client removes before publishing.

It defines no act type. A picture is a publication (Envelope, type 0) whose media type (payload field 0) is this Module's spec hash. *A post with a picture is a text act whose `refs` name that publication (F27); see "A picture in a post".*

## Dependencies

Envelope (publication, media lock, work hash, withdrawal) and Production. Text only for the post that shows a picture, and the relay transport cMIP only to publish and fetch, as for any act and any media.

## Definitions

- **JPEG.** A file in the interchange format of ISO/IEC 10918-1 (ITU-T T.81): a start marker (SOI, `FF D8`), marked segments, compressed data after each scan header, and an end marker (EOI, `FF D9`).
- **Segment.** A marker (`FF` and a byte, after any `FF` fill bytes) and, for every marker except SOI, EOI and the restarts, a two-byte length and a body.
- **The picture.** The image the first frame of the file decodes to.
- **Metadata.** Everything in the file that the picture's decoding does not need: application segments (APP0 to APP15) and comments (COM), and bytes after the EOI.
- **Orientation.** The value of the Exif tag `0x0112` (Orientation) in the first image file directory of the first Exif segment (APP1 beginning `Exif\0\0`), when it is a single SHORT from 1 to 8.

## The media object

1. **One file.** The media object's plaintext is one JPEG file, whole. The work hash is taken over exactly those bytes (Envelope, "Work hash"). There is no segmentation: the publication's fields describe the whole file.
   - A reader reads the file from SOI to the first EOI, segment by segment. A file that does not begin with SOI, has no frame header (SOF) before its first scan, ends before its EOI, or has a segment running past the end is not a JPEG this Module reads: the reader shows it as not a picture, and says so. *Bytes after the EOI are part of the work, and never part of the picture.*

## The picture

2. **The first frame, alone.** A reader shows the picture: the first frame, decoded as ISO/IEC 10918-1 says. It never shows a preview (an Exif thumbnail, a JFIF or JFXX thumbnail), a further picture (the multi-picture format, bytes after the EOI) or any text the file carries in place of the picture or beside it as if it were part of it. Pixels are shown square: a JFIF pixel density does not change the picture's shape. *Browsers already do this; the rule makes it the reader's duty, so no reader shows the preview a forger made to differ.*

3. **Which way up.** A reader turns and flips the picture as its orientation says (Exif: 1 as stored; 2 flipped left to right; 3 turned half a turn; 4 flipped top to bottom; 5 flipped along the top-left diagonal; 6 turned a quarter turn clockwise; 7 flipped along the top-right diagonal; 8 turned a quarter turn anticlockwise). Absent, or outside 1 to 8, it is 1. Only the first Exif segment counts. *Every current browser applies it by default (`image-orientation: from-image`); a reader that does not would show a phone's portrait photo on its side.*

4. **Colours.** A reader applies an embedded ICC colour profile (APP2 segments beginning `ICC_PROFILE\0`, in their sequence order) where it can; without one, it shows the picture as sRGB. Adobe's segment (APP14 beginning `Adobe`) says how the colour channels are coded, and a reader follows it. *A reader that cannot apply a profile shows the colours slightly off, never another picture.*

5. **What a reader cannot show.** *Client conformance.* A reader that cannot decode a picture (a process it does not implement, such as arithmetic coding or 12-bit samples; damaged data; a size beyond its own limits, read from the frame header before decoding) says so, and shows nothing in its place. It never shows part of a picture as the whole without saying so.

## Stripping before posting

6. *Client conformance.* **A client that publishes a picture for its user MUST first strip it to the picture alone**, and SHOULD tell the user what it removed. Stripping keeps, in order and byte for byte:
   - SOI; every segment the picture's decoding needs (quantization and Huffman tables, the frame header, scan headers with their compressed data and restarts, the restart interval, DNL); EOI;
   - the first JFIF segment (APP0 beginning `JFIF\0`), with its thumbnail removed (its width and height set to 0, its pixels dropped);
   - the ICC colour profile, and Adobe's segment (rule 4): they change how the picture's colours are read;
   - the orientation, if it is not 1, rewritten as the only entry of a new Exif segment: `Exif\0\0`, a big-endian TIFF header, one image file directory with the single entry `0x0112`, SHORT, count 1, the value, and no next directory (32 bytes), placed after the JFIF segment, or first if there is none.

   It removes everything else: every other application segment (Exif with its location, camera, dates and thumbnail; XMP; IPTC; the multi-picture format; any other), every comment, and every byte after the EOI.

   *The compressed picture is copied as it was, so the stripped file decodes to exactly the same pixels, turned and coloured the same way. Nothing is re-encoded, so nothing is lost. A client strips before locking: the work hash, the locked hash and the size in the publication are those of the stripped file.*

   *No verifier can tell whether a picture was stripped by choice or by accident, and the Module accepts any JPEG (rule 1), so this is conformance, like the Text MIP's rule 5a: it is the poster's own client that protects the poster.*

## A picture in a post

7. **By reference.** A post shows a picture by naming its publication in the text act's `refs` (Envelope, "References"; F27). A client that shows a referenced picture:
   - judges the publication as any act, through its own signer's identity chain, and shows the picture only if the publication counts;
   - shows it under the publication's own signer: a picture by another identity is shown as theirs, not the poster's (a repost is a reference, Envelope);
   - fetches its locked bytes, checks them against the locked hash, opens them with the publication's key and nonce, and checks the plaintext against the work hash and the size before showing anything (Envelope rule 14 asks this of purchases; a reader asks it of every picture);
   - shows it as not available once the publication is withdrawn (Envelope, "Withdrawal"), wherever it finds the withdrawal; the post itself stands.
   *A client without this Module still shows the post's text, and the reference as a reference (Text MIP, rule 3; Envelope rule 11).*

## Stated costs

- **A picture made by another client can carry metadata.** The Module accepts any JPEG; only conforming posting clients strip. A reader never shows metadata (rule 2), but anyone who fetches the file gets it whole. *A reader may say what a picture still carries; the founding client does.*
- **Two readers may show a picture slightly differently.** JPEG decoders are not bit-exact (ISO/IEC 10918-2 allows small differences), colour management varies, and not every reader implements every process. The Module fixes which picture, which way up and which colours; not every pixel's exact value.
- **The work is the stripped file.** A photographer's original, metadata included, has another work hash than the picture posted. *A work that must keep its original bytes is a different use from a picture for display.*
- **An ICC profile is kept as it is.** Its description and copyright text travel with it. They describe the colour space, not the photographer; a client that strips them too must keep the profile's colours exact.
- **Size.** One file is one media object, limited by what a relay accepts for media (relay transport cMIP, `info`).

## Reasoning

- **Any JPEG, stripped on posting.** *A strict subset would have made every reader show exactly the same picture, at the cost of refusing files people already have. Accepting any JPEG keeps every camera's files usable; stripping on posting takes the location and the rest out where it matters most, at the poster's own client (decided by Nobody, allegedly, 30 September 2026).*
- **Strip, never re-encode.** *Removing segments leaves the compressed picture untouched: no loss, and a test can prove the pixels are the same. Keeping the orientation as a one-entry Exif segment avoids re-encoding to turn the picture, and leaks nothing.*
- **The preview is never the picture.** *A file can carry a preview that shows something else; a viewer that trusted it would show one picture while the bytes say another. What you see is what was signed, for pictures as for text.*
- **Under its own signer.** *A reference is "look at this", never a claim. Showing a picture under the identity that published it keeps a repost from passing someone else's picture off as the poster's, and a forged picture from being pinned on its victim.*

## Test vectors

`modules/jpeg/vectors/jpeg.json`: for each test picture in `modules/jpeg/test/fixtures/`, what a reader reads from it (size, orientation, size as shown, components, colour profile), what it carries besides the picture, and its stripped file in `modules/jpeg/vectors/stripped/`. `modules/jpeg/vectors/check.py` checks them with Pillow, a reader independent of the founding implementation: every stripped file decodes to the same pixels as its original, with the same orientation and colour profile, and nothing else.

## Readings

Where the texts were silent, this draft takes the readings listed in `clients/barebone/README.md`.
