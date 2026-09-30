// A post with a picture, end to end: a test identity posts a text with a
// JPEG on a relay, and another client, knowing only the post's id and the
// relay, fetches it, verifies the post and the picture through the signer's
// identity chain and the publication's hashes, and shows it. Real homes and a
// real relay on local ports, run from the relay program of step 4.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import jpegjs from 'jpeg-js';
import { cborEncode, lockMedia, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { read } from '../../../modules/jpeg/src/jpeg.ts';
import { renderPage, renderPost } from '../src/html.ts';
import { listPosts, post, readPost, withdraw, type ShownPicture } from '../src/post.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT } from '../src/specs.ts';

const fixture = (name: string) =>
  new Uint8Array(readFileSync(new URL(`../../../modules/jpeg/test/fixtures/${name}`, import.meta.url)));
const decode = (b: Uint8Array) => jpegjs.decode(b, { useTArray: true, formatAsRGBA: true, tolerantDecoding: false });
const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((x, i) => x === b[i]);

let homes: Running[] = [];
let relay: Running;
let author: TestIdentity;
let other: TestIdentity;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  author = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await author.publishGenesis();
  other = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await other.publishGenesis();
  // The hand-made acts below do not carry their signer's chain, as post() does.
  for (const a of other.chainActs()) await relayAt(relay.base).putAct(a);
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

const pictureOf = (refs: unknown[]) => refs.find((r) => (r as ShownPicture).kind === 'picture') as ShownPicture;

/** A publication made by hand, as another client might: for the cases this client must refuse or flag. */
async function publishRaw(
  by: TestIdentity,
  bytes: Uint8Array,
  opts: { spec?: string; publicKey?: boolean; work?: string } = {},
): Promise<string> {
  const l = lockMedia(bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const m = new Map<number, unknown>([
    [0, unhex(opts.spec ?? POST_SPECS.jpeg)],
    [1, unhex(opts.work ?? l.workHash)],
    [2, unhex(l.lockedHash)],
    [3, bytes.length],
    [4, l.nonce],
  ]);
  if (opts.publicKey !== false) m.set(5, l.key);
  const made = await by.publish(POST_SPECS.envelope, PUBLICATION, cborEncode(m), { public: true, relays: [relay.base] });
  await relayAt(relay.base).putMedia(l.locked);
  return made.id;
}

async function textWith(by: TestIdentity, text: string, refs: string[]): Promise<string> {
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, text]])), {
    public: true,
    relays: [relay.base],
    refs,
  });
  return made.id;
}

test('a test identity posts text with a picture, and another client shows it, verified', async () => {
  const phone = fixture('phone.jpg');
  const r = await post(author, { text: 'Thank you for the shower…\nA test post.', jpeg: phone, relays: [relay.base] });
  assert.ok(r.picture);
  assert.deepEqual([...r.picture.removed].sort(), ['exif', 'exif-thumbnail', 'location']);

  // Another client, knowing only the post's id and the relay.
  const got = await readPost(r.id, [relay.base]);
  assert.equal(got.signer, author.id);
  assert.equal(got.standing, 'valid');
  assert.equal(got.text, 'Thank you for the shower…\nA test post.');
  assert.equal(got.refs.length, 1);
  const pic = pictureOf(got.refs);
  assert.equal(pic.publication, r.picture.id);
  assert.equal(pic.signer, author.id);
  assert.equal(pic.standing, 'valid');
  assert.equal(pic.problem, null);
  assert.equal(pic.withdrawn, null);
  assert.ok(pic.bytes && pic.picture);

  // What arrived is the picture alone: no location, no camera, no preview, turned as the camera said.
  assert.deepEqual(pic.picture.carries, []);
  assert.equal(pic.picture.orientation, 6);
  assert.equal(pic.picture.shownWidth, 48);
  assert.equal(pic.picture.shownHeight, 64);
  assert.ok(!Buffer.from(pic.bytes).includes('Model 9 Pro'));
  // The same pixels as the photo taken, by a second decoder.
  assert.ok(same(decode(pic.bytes).data as Uint8Array, decode(phone).data as Uint8Array));

  const h = renderPost(got);
  assert.match(h, /verified/);
  assert.match(h, /<img src="data:image\/jpeg;base64,[^"]+" width="48" height="64" alt="">/);
  assert.ok(h.includes(Buffer.from(pic.bytes).toString('base64')), 'the page shows the verified bytes');
  assert.doesNotMatch(h, /not by the poster/);
});

test('another client, in a separate process, shows it from the command line', async () => {
  const r = await post(author, { text: 'Seen from elsewhere.', jpeg: fixture('progressive.jpg'), relays: [relay.base] });
  const dir = mkdtempSync(join(tmpdir(), 'mor-post-'));
  const page = join(dir, 'post.html');
  const out = execFileSync(
    process.execPath,
    ['--import', 'tsx', 'src/cli.ts', 'show', r.id, '--relay', relay.base, '--out', page],
    { cwd: new URL('..', import.meta.url), encoding: 'utf8' },
  );
  assert.match(out, new RegExp(`by ${author.id}: verified`));
  assert.match(out, /\| Seen from elsewhere\./);
  assert.match(out, new RegExp(`picture ${r.picture!.id}: JPEG 80 x 60, verified`));
  const html = readFileSync(page, 'utf8');
  const b64 = html.match(/data:image\/jpeg;base64,([^"]+)"/)![1];
  const shown = new Uint8Array(Buffer.from(b64, 'base64'));
  assert.equal(read(shown).colourProfile, true, 'the colour profile is kept');
  assert.equal(decode(shown).width, 80);
});

test('the posting client itself works from the command line, and saves the identity', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mor-post-'));
  const file = join(dir, 'me.json');
  const me = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await me.publishGenesis();
  me.save(file);
  const pic = join(dir, 'hidden.jpg');
  writeFileSync(pic, fixture('hidden.jpg'));
  const cli = (args: string[]) =>
    execFileSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  const out = cli(['post', '--file', file, '--relay', relay.base, '--text', 'From the command line  \r\n', '--jpeg', pic]);
  assert.match(out, /text: line breaks converted to LF/);
  assert.match(out, /picture: removed further pictures \(multi-picture format\); bytes after the end of the picture/);
  const id = out.match(/^post ([0-9a-f]{64})$/m)![1];
  assert.equal(TestIdentity.load(file).f.sequence.length, 2, 'the publication and the post');
  const shown = cli(['feed', me.id, '--relay', relay.base]);
  assert.match(shown, new RegExp(`post ${id}`));
  assert.match(shown, /\| From the command line$/m);
});

test('posts without a picture, and in the long-form format, show too', async () => {
  const plain = await post(author, { text: 'Just words.', relays: [relay.base] });
  const lf = await post(author, { text: '# A heading\n\n*Some* words.', format: POST_SPECS.longform, relays: [relay.base] });
  const a = await readPost(plain.id, [relay.base]);
  assert.equal(a.refs.length, 0);
  assert.equal(a.standing, 'valid');
  const b = await readPost(lf.id, [relay.base]);
  assert.equal(b.format, POST_SPECS.longform);
  assert.match(renderPost(b), /<h1 dir="auto">A heading<\/h1>/);
  const ids = await listPosts(author.id, relay.base);
  assert.ok(ids.indexOf(plain.id) < ids.indexOf(lf.id));
});

test("a post showing someone else's picture shows it under that picture's signer", async () => {
  const r = await post(author, { text: 'Mine.', jpeg: fixture('grey.jpg'), relays: [relay.base] });
  const repost = await textWith(other, 'Look at this.', [r.picture!.id]);
  const got = await readPost(repost, [relay.base]);
  assert.equal(got.signer, other.id);
  const pic = pictureOf(got.refs);
  assert.equal(pic.signer, author.id);
  assert.ok(pic.bytes);
  assert.match(renderPost(got), /A picture by <code>[0-9a-f]{8}…[0-9a-f]{4}<\/code>, not by the poster\./);
});

test('a withdrawn picture is no longer shown; a withdrawal by anyone else changes nothing', async () => {
  const r = await post(author, { text: 'Soon gone.', jpeg: fixture('cmyk.jpg'), relays: [relay.base] });
  assert.ok(pictureOf((await readPost(r.id, [relay.base])).refs).bytes);

  await withdraw(other, r.picture!.id, [relay.base]);
  const still = pictureOf((await readPost(r.id, [relay.base])).refs);
  assert.ok(still.bytes, "another identity's withdrawal is no withdrawal");

  const w = await withdraw(author, r.picture!.id, [relay.base]);
  const got = await readPost(r.id, [relay.base]);
  const pic = pictureOf(got.refs);
  assert.equal(pic.withdrawn, w.id);
  assert.equal(pic.bytes, null);
  assert.equal(pic.problem, 'withdrawn by its signer');
  assert.equal(got.standing, 'valid', 'the post itself stands');
  assert.match(renderPost(got), /Picture not shown: withdrawn by its signer\./);
});

test('a picture from a client that did not strip it is shown, and what it still carries is said', async () => {
  const id = await publishRaw(other, fixture('phone.jpg'));
  const got = await readPost(await textWith(other, 'Unstripped.', [id]), [relay.base]);
  const pic = pictureOf(got.refs);
  assert.ok(pic.bytes);
  assert.deepEqual([...pic.picture!.carries].sort(), ['exif', 'exif-thumbnail', 'location']);
  assert.match(renderPost(got), /It still carries the place the picture was taken \(GPS\).*, not shown\./);
});

test('pictures this client must not show: said so, never shown', async () => {
  const cases: [string, Promise<string>, RegExp][] = [
    ['bytes that are not a JPEG', publishRaw(other, fixture('not-a-jpeg.jpg')), /^not a JPEG this client reads/],
    ['a truncated JPEG', publishRaw(other, fixture('truncated.jpg')), /^not a JPEG this client reads/],
    ['media of another type', publishRaw(other, fixture('grey.jpg'), { spec: 'cd'.repeat(32) }), /^media of a type this client does not implement$/],
    ['a locked picture', publishRaw(other, fixture('grey.jpg'), { publicKey: false }), /^the picture is locked/],
    ['a wrong work hash', publishRaw(other, fixture('grey.jpg'), { work: 'ef'.repeat(32) }), /do not match the work hash/],
  ];
  for (const [what, made, why] of cases) {
    const got = await readPost(await textWith(other, what, [await made]), [relay.base]);
    const pic = pictureOf(got.refs);
    assert.equal(pic.bytes, null, what);
    assert.match(pic.problem!, why, what);
    assert.doesNotMatch(renderPost(got), /<img/, what);
  }
});

test('references to acts that are not pictures are named, not shown', async () => {
  const first = await post(author, { text: 'First.', relays: [relay.base] });
  const got = await readPost(await textWith(other, 'A reply.', [first.id, 'aa'.repeat(32)]), [relay.base]);
  assert.deepEqual(
    got.refs.map((r) => (r.kind === 'act' ? r.what : r.kind)),
    ['a text act', 'not found at the relays asked'],
  );
  assert.ok(renderPage([got], 'A reply').includes('Refers to'));
});
