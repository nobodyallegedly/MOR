# mor-jpeg

The JPEG Module (roadmap step 9): the founding implementation of `modules/module-jpeg-draft-1.md`, a media type for task 5 of the Envelopes MIP. The barebone client (`clients/barebone`) posts and shows pictures with it; the web reader (step 10) will too.

## In plain words

A JPEG file is a list of marked pieces, then the compressed picture. This package reads the pieces: how big the picture is, which way up it goes, what colours it uses, and what else the file carries (where the photo was taken, the camera, previews, comments, hidden pictures). It can strip a file to the picture alone, before it is posted, without touching the compressed picture: the stripped file decodes to exactly the same pixels. It never decodes pixels itself; that is the reader's decoder's job.

## What is here

| File | What |
| --- | --- |
| `src/jpeg.ts` | `read()` (the Module's rules 1 to 5), `strip()` (rule 6), `orientationExif()`, `pictureBytes()`. |
| `src/cli.ts` | `mor-jpeg read <file.jpg>` and `mor-jpeg strip <in.jpg> <out.jpg>`. |
| `scripts/fixtures.py` | Makes the test pictures (Python 3 and Pillow). Its output is committed. |
| `test/fixtures/` | A phone photo with GPS, camera data, a rotation flag and a preview that is another picture; a progressive picture with a colour profile, XMP and a comment; grey; CMYK; a picture hiding another after its end; JFIF and JFXX previews with IPTC; non-square pixels; a truncated file; a file that is not a JPEG. |
| `vectors/jpeg.json`, `vectors/stripped/` | Test vectors (`npm run vectors` rewrites them). |
| `vectors/check.py` | Checks the vectors with Pillow, an independent reader. |

## Run

```
npm install
npm test                  # the fixtures, read and stripped; 20,000 damaged files
python3 vectors/check.py  # the vectors, by Pillow (pip install pillow)
npm run cli -- read test/fixtures/phone.jpg
```

## What the tests show

- Each fixture is read as the Module says: size, frame type, orientation, size as shown, what it carries.
- Stripping takes out everything but the picture, keeps the orientation (as a 32-byte Exif segment and nothing else), the colour profile and Adobe's segment, and copies the compressed picture byte for byte. A second decoder, jpeg-js (from Mozilla's pdf.js), decodes every fixture before and after stripping: the same pixels. Pillow, a third, agrees on the vectors.
- 20,000 randomly damaged files are each read or refused as "not a JPEG", never anything else; every one read strips clean.
