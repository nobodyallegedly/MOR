// A post with a picture, end to end: a test identity posts a text with a
// JPEG on a relay, and another client, knowing only the post's id and the
// relay, fetches it, verifies the post and the picture through the signer's
// identity chain and the bake's hashes, and shows it. Real homes and a
// real relay on local ports, run from the relay program of step 4.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import jpegjs from 'jpeg-js';
import { MIRS, SPECS, Verifier, cborEncode, describeAct, lockMedia, sha256, unhex, workHash } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { read } from '../../../modules/jpeg/src/jpeg.ts';
import { strip as stripSound } from '../../../modules/audio/src/audio.ts';
import { renderPage, renderPost } from '../src/html.ts';
import { Judge, listPosts, post, readPost, soundBytes, withdraw, type ShownPicture, type ShownRecording } from '../src/post.ts';
import { BAKE, POST_SPECS, RETIRED_WITHDRAWAL, TEXT_ACT } from '../src/specs.ts';
import { putTag, tagsOf, withdrawTag } from '../src/tag.ts';

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

// Every server stopped whatever the outcome: one that fails to stop does not keep the others running.
after(async () => {
  for (const r of [...homes, relay]) await r?.stop().catch(() => undefined);
});

const pictureOf = (refs: unknown[]) => refs.find((r) => (r as ShownPicture).kind === 'picture') as ShownPicture;

/** A bake made by hand, as another client might: for the cases this client must refuse or flag. */
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
  const made = await by.publish(POST_SPECS.envelopes, BAKE, cborEncode(m), { public: true, relays: [relay.base] });
  await relayAt(relay.base).putMedia(l.locked);
  return made.id;
}

async function textWith(by: TestIdentity, text: string, refs: string[]): Promise<string> {
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, text]])), {
    public: true,
    relays: [relay.base],
    refs: refs.length ? refs : undefined,
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
  assert.equal(pic.bake, r.picture.id);
  assert.equal(pic.publication, r.picture.id, 'the same id under its name from before');
  assert.equal(pic.signer, author.id);
  assert.equal(pic.standing, 'valid');
  assert.equal(pic.problem, null);
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

// The premise changed (decided 28 October 2026; Envelopes rule 24, the
// withdrawal retired): a bake is never withdrawn by the protocol. This test
// used to withdraw the picture and see it hidden. Now an act of the retired
// type 3, by its uploader or anyone, is invalid and changes nothing: the
// picture stays shown wherever its bytes are, and stops being shown only
// where homes and relays no longer hold its bytes, which is said.
test('a bake is never withdrawn: the retired withdrawal is invalid and changes nothing; a picture is not shown only where its bytes are gone', async () => {
  const r = await post(author, { text: 'Never gone by an act.', jpeg: fixture('cmyk.jpg'), relays: [relay.base] });
  assert.ok(pictureOf((await readPost(r.id, [relay.base])).refs).bytes);

  // This client refuses to sign one, saying why, and signs nothing.
  const before = (await relayAt(relay.base).feed({ signer: author.id })).items.length;
  await assert.rejects(withdraw(author, r.picture!.id, [relay.base]), /A bake is never withdrawn by the protocol: its bytes stay where they were uploaded unless homes and relays drop them\. .*Nothing was signed\./);
  assert.equal((await relayAt(relay.base).feed({ signer: author.id })).items.length, before, 'nothing signed');

  // Another client, careless, signs one anyway, by its uploader and by someone else: both invalid; the picture stays shown.
  const judge = new Judge([relay.base], {});
  for (const by of [author, other]) {
    const w = await by.publish(POST_SPECS.envelopes, RETIRED_WITHDRAWAL, cborEncode(new Map()), { public: true, relays: [relay.base], objects: [[r.picture!.id, r.picture!.id]] });
    assert.equal(await judge.standing(w.act, w.id, by.id), 'invalid', 'an act of type 3 is invalid (Envelopes rule 24)');
  }
  const got = await readPost(r.id, [relay.base]);
  const pic = pictureOf(got.refs);
  assert.ok(pic.bytes, 'still shown');
  assert.equal(pic.problem, null);
  assert.equal(got.standing, 'valid');

  // Its bytes uploaded only to a relay that is gone (it dropped them): the post and the bake are still read elsewhere; the picture is not shown, and why is said.
  const gone = await start('relay');
  let p2;
  try {
    p2 = await post(author, { text: 'Uploaded to one relay only.', jpeg: fixture('cmyk.jpg'), relays: [gone.base] });
  } finally {
    await gone.stop();
  }
  for (const a of [p2.picture!.act, p2.act]) await relayAt(relay.base).putAct(a);
  const lost = await readPost(p2.id, [relay.base]);
  assert.equal(lost.standing, 'valid');
  assert.equal(pictureOf(lost.refs).standing, 'valid', 'the bake stands');
  assert.equal(pictureOf(lost.refs).problem, 'its bytes were not found');
  assert.match(renderPost(lost), /Picture not shown: its bytes were not found\./);
});

// What can end is named by its layer (decided 28 October 2026): a price tag
// on a bare bake is withdrawn by its signer, a version with no price (Money
// rule 18). It replaces "withdrawn by its signer", which a bake no longer is.
test('a price tag is withdrawn by its signer: a later version with no price; another identity’s tag on the bake is nobody’s offer; the picture is shown throughout', async () => {
  const r = await post(author, { text: 'For sale, then not.', jpeg: fixture('cmyk.jpg'), relays: [relay.base] });
  const bake = r.picture!.id;
  const unit = sha256('a test unit');
  const t1 = await putTag(author, { bake }, { price: { unit, value: 300 }, relays: [relay.base] });
  assert.equal(t1.version, 1);
  assert.equal(t1.payee, author.id);
  const theirs = await putTag(other, { bake }, { price: { unit, value: 5 }, relays: [relay.base] });
  let read = await tagsOf({ bake }, author.id, [relay.base]);
  assert.equal(read.latest?.id, t1.id);
  assert.deepEqual(read.latest?.price, { unit, value: 300 });

  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const a of [...author.chainActs(), ...other.chainActs(), r.picture!.act, t1.act, theirs.act]) v.add(a);
  assert.equal(v.bakeUploader(bake), author.id, 'its uploader is its signer');
  assert.equal(v.priceTag(t1.id), 'counts', 'the uploader’s tag counts on a bare bake');
  assert.equal(v.priceTag(theirs.id), "nobody's offer", 'a tag by anyone else is nobody’s offer');

  // Only its signer may withdraw it; this client refuses another's, signing nothing.
  await assert.rejects(withdrawTag(other, read.latest!, [relay.base]), /signed by another identity/);
  const w = await withdrawTag(author, read.latest!, [relay.base]);
  assert.equal(w.version, 2);
  assert.equal(w.price, null);
  v.add(w.act);
  assert.equal(v.status(w.id), 'valid', 'a later version naming [first, previous]');
  read = await tagsOf({ bake }, author.id, [relay.base]);
  assert.equal(read.latest?.id, w.id, 'the latest version counts');
  assert.equal(read.latest?.price, null, 'withdrawn: no price');
  await assert.rejects(withdrawTag(author, read.latest!, [relay.base]), /withdrawn already/);
  // The bake is untouched: still shown.
  assert.ok(pictureOf((await readPost(r.id, [relay.base])).refs).bytes);
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

test("a post names its picture's signer beside it, and a reader follows a reference by its signer to another home (F272)", async () => {
  // The picture is a public act the poster holds: the post's reference names its signer.
  const r = await post(author, { text: 'With a named picture.', jpeg: fixture('grey.jpg'), relays: [relay.base] });
  const d = describeAct((await relayAt(relay.base).getAct(r.id))!) as { refs: string[]; refSigners: string[] };
  assert.deepEqual(d.refs, [r.picture!.id]);
  assert.deepEqual(d.refSigners, [author.id]);

  // An identity keeping its posts at the second home only, its routes saying so.
  const far = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await far.publishGenesis();
  await far.publishRoutes([{ scope: null, hints: [homes[1].base] }]);
  const kept = await far.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, 'Kept at home two.']])), { public: true, relays: [homes[1].base] });
  // A reply kept at the first home names it with its signer; a stranger knowing only that home follows it
  // through the signer's identity (whose chain that home serves) and routes, to the second.
  const reply = await other.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, 'An answer.']])), { public: true, relays: [homes[0].base], refs: [[kept.id, far.id]] });
  assert.equal(await relayAt(homes[0].base).getAct(kept.id), null);
  const got = await readPost(reply.id, [homes[0].base]);
  assert.deepEqual(
    got.refs.map((x) => (x.kind === 'act' ? [x.id, x.signer, x.what] : x.kind)),
    [[kept.id, far.id, 'a text act']],
  );
  // The same reply without the signer: nothing to look by.
  const bare = await other.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, 'A bare answer.']])), { public: true, relays: [homes[0].base], refs: [kept.id] });
  assert.deepEqual((await readPost(bare.id, [homes[0].base])).refs.map((x) => (x.kind === 'act' ? x.what : x.kind)), ['not found at the relays asked']);
  // A wrong signer is said, the act fetched showing its own.
  const wrong = await other.publish(POST_SPECS.text, TEXT_ACT, cborEncode(new Map([[0, 'Wrong.']])), { public: true, relays: [relay.base], refs: [[r.picture!.id, other.id]] });
  const w = await readPost(wrong.id, [relay.base]);
  assert.match((w.refs[0] as { what: string }).what, /the reference is wrong/);
  assert.equal(w.standing, 'valid', 'a wrong signer never makes the act naming it invalid');
});

test("a post made before its signer's rotation is judged with the signer's sequence, as any reader would (Identity draft 13, F298)", async () => {
  const me = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await me.publishGenesis();
  const first = await textWith(me, 'Before the rotation, the first.', []);
  await textWith(me, 'Before the rotation, the second.', []);
  await textWith(me, 'Before the rotation, the third: the tip the rotation keeps.', []);
  await me.prepareRotation({ hints: [relay.base] });
  await me.submitRotation();
  assert.equal((await me.settleRotation()).counts, true);
  for (const a of me.chainActs()) await relayAt(relay.base).putAct(a);
  // The first post is kept only through the second and the third, the tip
  // the rotation names: a reader holding the first alone could not rebuild
  // the line to the tip's running summary, so it fetches the signer's
  // sequence before judging.
  const shown = await readPost(first, [relay.base]);
  assert.equal(shown.standing, 'valid');
});

// ---------------------------------------------------------------- a recording (the audio Module)

const sound = (name: string) => new Uint8Array(readFileSync(new URL(`../../../modules/audio/test/fixtures/${name}`, import.meta.url)));
const recordingOf = (refs: unknown[]) => refs.find((r) => (r as ShownRecording).kind === 'recording') as ShownRecording;
const latin1 = (b: Uint8Array) => Buffer.from(b).toString('latin1');

test('a recording is stripped before it is locked, shown by reference, and its bytes checked by the audio Module before it plays', async () => {
  const tagged = sound('tagged.m4a');
  const r = await post(author, { text: 'A song.', m4a: tagged, relays: [relay.base] });
  const rec = r.recording!;
  // Rule 10: the work hash, the locked hash and the size published are the stripped file's.
  const s = stripSound(tagged);
  assert.deepEqual(rec.removed, ['metadata', 'location', 'names', 'free']);
  assert.equal(rec.size, s.bytes.length);
  assert.ok(rec.size < tagged.length);
  assert.equal(rec.work, workHash(s.bytes));
  const got = await readPost(r.id, [relay.base]);
  assert.equal(got.standing, 'valid');
  const shown = recordingOf(got.refs);
  assert.equal(shown.publication, rec.id);
  assert.equal(shown.problem, null);
  assert.equal(shown.size, s.bytes.length);
  // Played only when asked: its bytes fetched, checked against the publication, read by the Module.
  const played = await soundBytes(shown.publication, shown.signer, [relay.base]);
  assert.ok(same(played.bytes, s.bytes), 'the stripped bytes are the ones published');
  assert.deepEqual(played.sound.carried, [], 'nothing left besides the sound');
  for (const tag of ['A song', 'Someone singing', 'An album', 'Recorded on a phone', '+48.8584', 'udta', 'ilst']) assert.ok(!latin1(played.bytes).includes(tag), `no ${tag} left`);
  assert.equal(played.sound.type, 'audio/mp4; codecs="mp4a.40.2"');
  const out = execFileSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'show', r.id, '--relay', relay.base, '--out', join(mkdtempSync(join(tmpdir(), 'mor-post-')), 'post.html')], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
  assert.match(out, new RegExp(`recording ${rec.id}: ${rec.size} bytes, its bytes checked when played`));
  // The premise changed (Envelopes rule 24, the withdrawal retired): this
  // used to withdraw the recording and see it hidden. A bake is never
  // withdrawn: an act of the retired type 3 is invalid, and it stays shown.
  const w = await author.publish(POST_SPECS.envelopes, RETIRED_WITHDRAWAL, cborEncode(new Map()), { public: true, relays: [relay.base], objects: [[rec.id, rec.id]] });
  assert.equal(await new Judge([relay.base], {}).standing(w.act, w.id, author.id), 'invalid');
  assert.equal(recordingOf((await readPost(r.id, [relay.base])).refs).problem, null, 'still shown');
});

test('a file the audio Module refuses is refused in plain words, and nothing is published', async () => {
  const before = await listPosts(author.id, relay.base);
  for (const [name, why] of [
    ['with-picture.m4a', /a picture track/],
    ['mp3.m4a', /not MPEG-4 audio/],
    ['truncated.m4a', /runs past/],
  ] as const) {
    await assert.rejects(post(author, { text: `Not this: ${name}.`, m4a: sound(name), relays: [relay.base] }), (e: Error) => {
      assert.match(e.message, /^not a recording the audio Module plays: /);
      assert.match(e.message, why);
      assert.match(e.message, /Nothing was published\.$/);
      return true;
    });
  }
  assert.deepEqual(await listPosts(author.id, relay.base), before, 'no post');
});

test('a damaged recording another client published is not played, saying why', async () => {
  for (const [name, why] of [
    ['truncated.m4a', /^not a recording the audio Module plays: /],
    ['with-picture.m4a', /^not a recording the audio Module plays: a picture track/],
  ] as const) {
    const id = await publishRaw(other, sound(name), { spec: POST_SPECS.audio });
    const got = await readPost(await textWith(other, `Damaged: ${name}`, [id]), [relay.base]);
    const shown = recordingOf(got.refs);
    assert.equal(shown.problem, null, 'judged as any act; its bytes are checked when asked to play');
    await assert.rejects(soundBytes(shown.publication, shown.signer, [relay.base]), (e: Error) => (assert.match(e.message, why), true));
  }
  const wrong = await publishRaw(other, sound('mono.m4a'), { spec: POST_SPECS.audio, work: 'ef'.repeat(32) });
  await assert.rejects(soundBytes(wrong, other.id, [relay.base]), /do not match the work hash/);
  const locked = await publishRaw(other, sound('mono.m4a'), { spec: POST_SPECS.audio, publicKey: false });
  assert.match(recordingOf((await readPost(await textWith(other, 'Locked.', [locked]), [relay.base])).refs).problem!, /^the recording is locked/);
});
