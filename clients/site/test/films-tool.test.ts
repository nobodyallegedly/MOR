// Putting films into a site before publishing it (website cMIP, draft 5;
// `mor-site films`, src/films.ts): each film checked by the video Module and
// within its limits, each poster by the JPEG Module, both stripped and
// written under films/, the page's block between its marks written, and
// nothing written at all when anything fails. Synthetic films only (ffmpeg's
// test pattern and a tone: modules/video/test/fixtures).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { strip as stripPicture } from '../../../modules/jpeg/src/jpeg.ts';
import { MAX_BYTES, read, strip as stripFilm } from '../../../modules/video/src/video.ts';
import { MARK_END, MARK_START, nameOf, placeFilms, type FilmIn } from '../src/films.ts';
import { checkFiles, readFolder } from '../src/publish.ts';
import { SITE_DIR } from './world.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const fixture = (name: string) => fileURLToPath(new URL(`../../../modules/video/test/fixtures/${name}`, import.meta.url));
const picture = (name: string) => fileURLToPath(new URL(`../../../modules/jpeg/test/fixtures/${name}`, import.meta.url));
const bytes = (f: string) => new Uint8Array(readFileSync(f));
const film = (name: string, poster = 'phone.jpg', label?: string): FilmIn => ({ film: bytes(fixture(name)), poster: bytes(picture(poster)), label });

/** A copy of the dubsar.org folder, with its films block empty, as in the repository. */
function copy(): string {
  const dir = mkdtempSync(join(tmpdir(), 'mor-films-'));
  cpSync(SITE_DIR, dir, { recursive: true });
  return dir;
}
const block = (dir: string) => {
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  return html.slice(html.indexOf(MARK_START), html.indexOf(MARK_END) + MARK_END.length);
};

test("dubsar.org's front page carries the films block, empty: published as it is, it shows no film and no button", () => {
  assert.equal(block(SITE_DIR), `${MARK_START}\n${MARK_END}`);
  assert.ok(!existsSync(join(SITE_DIR, 'films')));
});

test('the main film and two listed films go in: checked, stripped, under films/, named in the page between its marks', () => {
  const dir = copy();
  const before = readFileSync(join(dir, 'index.html'), 'utf8');
  const placed = placeFilms(dir, {
    main: film('tagged.mp4'),
    listed: [film('sound.mp4', 'grey.jpg', 'MOR use cases'), film('turned.mp4', 'phone.jpg', 'The unwritten layer')],
  });
  assert.deepEqual(
    placed.map((p) => [p.path, p.poster, p.label, p.main]),
    [
      ['films/main.mp4', 'films/main.jpg', null, true],
      ['films/mor-use-cases.mp4', 'films/mor-use-cases.jpg', 'MOR use cases', false],
      ['films/the-unwritten-layer.mp4', 'films/the-unwritten-layer.jpg', 'The unwritten layer', false],
    ],
  );
  // Stripped: the film to the film alone, the poster to the picture alone; the masters untouched.
  assert.deepEqual(bytes(join(dir, 'films/main.mp4')), stripFilm(bytes(fixture('tagged.mp4'))).bytes);
  assert.deepEqual(bytes(join(dir, 'films/main.jpg')), stripPicture(bytes(picture('phone.jpg'))).bytes);
  assert.ok(placed[0].removed.some((r) => r.startsWith('from the film, ')), placed[0].removed.join('; '));
  assert.ok(placed[0].removed.some((r) => r.startsWith('from the poster, ')), placed[0].removed.join('; '));
  assert.deepEqual(read(bytes(join(dir, 'films/main.mp4'))).carried, []);
  assert.deepEqual(bytes(fixture('tagged.mp4')), new Uint8Array(readFileSync(fixture('tagged.mp4'))));
  // The page: only the block changed.
  const after = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.equal(after.replace(block(dir), ''), before.replace(`${MARK_START}\n${MARK_END}`, ''));
  assert.equal(
    block(dir),
    [
      MARK_START,
      '<section class="films">',
      '<video src="/films/main.mp4" poster="/films/main.jpg"></video>',
      '<p class="more-films">',
      '<mor-film src="/films/mor-use-cases.mp4" poster="/films/mor-use-cases.jpg">MOR use cases</mor-film>',
      '<mor-film src="/films/the-unwritten-layer.mp4" poster="/films/the-unwritten-layer.jpg">The unwritten layer</mor-film>',
      '</p>',
      '</section>',
      MARK_END,
    ].join('\n'),
  );
  // And the folder publishes: every file one the site may hold, stripped.
  checkFiles(readFolder(dir));
});

test('films over the video Module\'s limits, or of a kind it does not play, are refused, every reason at once, and nothing is written', () => {
  const dir = copy();
  const before = readFileSync(join(dir, 'index.html'), 'utf8');
  const big = new Uint8Array(MAX_BYTES + 1);
  big.set(bytes(fixture('sound.mp4')));
  assert.throws(
    () =>
      placeFilms(dir, {
        main: film('too-long.mp4'),
        listed: [
          film('too-large.mp4', 'phone.jpg', 'Too sharp'),
          film('too-fast.mp4', 'phone.jpg', 'Too fast'),
          { film: big, poster: bytes(picture('phone.jpg')), label: 'Too big' },
          film('hevc.mp4', 'phone.jpg', 'Another codec'),
          film('sound.mp4', 'not-a-jpeg.jpg', 'A poster that is not one'),
        ],
      }),
    (e: Error) => {
      for (const why of ['601 seconds long, beyond 600', '2560 x 1440, beyond 1920 x 1080', '120 pictures a second, beyond 60', '67108848', 'hvc1', 'not a JPEG'])
        assert.ok(e.message.includes(why), `${why} in: ${e.message}`);
      return true;
    },
  );
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), before, 'the page untouched');
  assert.ok(!existsSync(join(dir, 'films')), 'no film written');
});

test('a listed film needs a short label of its own; the page needs its marks', () => {
  const dir = copy();
  const refused = (opts: Parameters<typeof placeFilms>[1], why: RegExp, d = dir) => assert.throws(() => placeFilms(d, opts), why);
  refused({ listed: [film('sound.mp4')] }, /needs a label/);
  refused({ listed: [film('sound.mp4', 'phone.jpg', '')] }, /the label is empty/);
  refused({ listed: [film('sound.mp4', 'phone.jpg', 'A label far, far longer than any button wants')] }, /beyond 40/);
  refused({ listed: [film('sound.mp4', 'phone.jpg', 'Two  spaces')] }, /two in a row/);
  refused({ listed: [film('sound.mp4', 'phone.jpg', '¿¡')] }, /gives no name/);
  refused({ listed: [film('sound.mp4', 'phone.jpg', 'Use cases'), film('plain.mp4', 'phone.jpg', 'Use cases!')] }, /named like another film/);
  refused({ main: film('sound.mp4'), listed: [film('plain.mp4', 'phone.jpg', 'Main')] }, /named like another film/);
  const bare = mkdtempSync(join(tmpdir(), 'mor-films-'));
  writeFileSync(join(bare, 'index.html'), '<!doctype html><title>No marks</title>');
  refused({ main: film('sound.mp4') }, /must hold the two marks/, bare);
  assert.equal(nameOf('The unwritten layer'), 'the-unwritten-layer');
  assert.equal(nameOf('Café, & more'), 'cafe-more');
});

test('a label is written as text, never as markup', () => {
  const dir = copy();
  placeFilms(dir, { listed: [film('sound.mp4', 'phone.jpg', 'Films <b>& "more"</b>')] });
  assert.match(block(dir), /<mor-film src="\/films\/films-b-more-b\.mp4" poster="\/films\/films-b-more-b\.jpg">Films &lt;b&gt;&amp; &quot;more&quot;&lt;\/b&gt;<\/mor-film>/);
});

test('run again, the block is written anew and the films it no longer names are removed; with none, it is empty', () => {
  const dir = copy();
  placeFilms(dir, { main: film('sound.mp4'), listed: [film('plain.mp4', 'phone.jpg', 'MOR use cases'), film('turned.mp4', 'phone.jpg', 'The unwritten layer')] });
  writeFileSync(join(dir, 'films', 'mine.txt'), 'a file of the publisher, not the tool’s');
  placeFilms(dir, { main: film('sound.mp4'), listed: [film('plain.mp4', 'phone.jpg', 'MOR use cases')] });
  assert.deepEqual(readdirSync(join(dir, 'films')).sort(), ['main.jpg', 'main.mp4', 'mine.txt', 'mor-use-cases.jpg', 'mor-use-cases.mp4']);
  assert.ok(!block(dir).includes('unwritten'));
  placeFilms(dir, {});
  assert.equal(block(dir), `${MARK_START}\n${MARK_END}`);
  assert.deepEqual(readdirSync(join(dir, 'films')), ['mine.txt']);
});

test('from the command line: the three films, each with its poster, and the main one marked', async () => {
  const dir = copy();
  const run = (...args: string[]) => promisify(execFile)('node', ['--import', 'tsx', 'src/cli.ts', 'films', '--dir', dir, ...args], { cwd: here });
  const { stdout } = await run(
    '--main', fixture('sound.mp4'), '--main-poster', picture('phone.jpg'),
    '--film', fixture('plain.mp4'), '--poster', picture('grey.jpg'), '--label', 'MOR use cases',
    '--film', fixture('turned.mp4'), '--poster', picture('phone.jpg'), '--label', 'The unwritten layer',
  );
  assert.match(stdout, /^main film: films\/main\.mp4 \(poster films\/main\.jpg\)$/m);
  assert.match(stdout, /^listed, "MOR use cases": films\/mor-use-cases\.mp4/m);
  assert.match(stdout, /^listed, "The unwritten layer": films\/the-unwritten-layer\.mp4/m);
  assert.match(stdout, /bytes, [0-9.]+ s, [0-9]+ x [0-9]+, (Baseline|Main|High) /);
  assert.equal((block(dir).match(/<mor-film /g) ?? []).length, 2);
  await assert.rejects(run('--film', fixture('plain.mp4'), '--label', 'MOR use cases'), /each --film needs its --poster and its --label/);
  await assert.rejects(run('--main', fixture('too-long.mp4'), '--main-poster', picture('phone.jpg')), /601 seconds long, beyond 600/);
});
