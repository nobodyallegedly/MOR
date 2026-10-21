// Dub against real homes and a relay on local ports (the relay program
// of step 4), its program on another, and a client that signs its requests
// exactly as the page does (the desk's `src/page/api.ts`, run here in Node).
// Nothing is mocked. Test identities only, generated here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity, type IdentityFile } from '../../genesis/src/identity.ts';
import { describeAct, hex, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { post as barebonePost, readPost, type ShownPicture } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { read as readJpeg } from '../../../modules/jpeg/src/jpeg.ts';
import { encryptionSecret, fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { DOMAIN, serve, type Running } from '../src/server.ts';
import { CHAIN_WORDS_SAY, SPENT_SAY, TEST_ONLY } from '../src/dub.ts';
import { INDEX, SCHEME, keySeeds } from '../src/chainwords.ts';
import { chainKeyFromSeeds } from '../../genesis/src/core.ts';
import { readFollowList, readSealedList, PEOPLE_SPEC } from '../src/people.ts';
import { namesOf } from '../src/names.ts';
import { OPS } from '../src/ops.ts';
import { PUBLISH_WARNING, TEST_ONLY as SHOWN_TEST_ONLY } from '../src/page/view.ts';
import type { Item, Message, State } from '../src/shapes.ts';

const PHONE = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));

let homes: Relay[];
let relay: Relay;
const apps: Running[] = [];

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const a of apps) await a.close();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

type Lines = { lines: { text: string; tone?: string }[] };

/** A fresh Dub, in its own folder, and a paired client. */
async function dub(dir = mkdtempSync(join(tmpdir(), 'mor-dub-'))): Promise<{ app: Running; c: Client }> {
  const app = await serve({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  return { app, c };
}

/** A new identity made in a Dub: its chain key's words written, three typed back. */
async function made(c: Client, home = homes[0]): Promise<{ id: string; chainWords: string[] }> {
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes: [home.base], relays: [relay.base] });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  return { id: (await c.ask<State>('state')).identity!.id, chainWords: b.words };
}

const refused = async (p: Promise<unknown>, words: RegExp) => {
  await assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });
};

/** What the barebone reader, in this process and knowing only the relay, makes of a post. */
const reader = (id: string) => readPost(id, [relay.base]);
const feed = async (c: Client) => (await c.ask<{ items: Item[] }>('feed')).items;
const inbox = (c: Client) => c.ask<{ toYou: Item[]; messages: Message[]; encryption: boolean; hidden: number; problems: string[] }>('inbox');
const fileOf = (app: Running, id: string): IdentityFile => JSON.parse(readFileSync(app.store.path('identities', id, 'identity.json'), 'utf8'));

test('the first screen says it, word for word; the page and the program name the same operations', () => {
  assert.equal(TEST_ONLY, 'Test identities only, until MOR is frozen');
  assert.equal(SHOWN_TEST_ONLY, TEST_ONLY);
  const ui = readFileSync(new URL('../src/page/ui.ts', import.meta.url), 'utf8');
  for (const op of [...ui.matchAll(/b\.ask(?:<[^>]*>)?\('([a-z]+)'/g)].map((m) => m[1])) {
    assert.ok([...OPS, 'code'].includes(op as never), `the page asks for ${op}, which no operation answers`);
  }
});

test('a new identity: the chain key’s words shown once and kept nowhere, three typed back before anything is published; then its inbox and encryption key at once', async () => {
  const { app, c } = await dub();
  assert.equal((await c.ask<State>('state')).stage, 'identity');
  assert.equal(statSync(app.store.dir).mode & 0o777, 0o700);

  const b = await c.ask<{ words: string[]; positions: number[]; say: string[] }>('begin', { homes: homes.map((h) => h.base), relays: [relay.base] });
  assert.equal(b.words.length, 24);
  assert.equal(b.positions.length, 3);
  assert.deepEqual(b.say, CHAIN_WORDS_SAY);
  assert.match(b.say[0], /These are the chain key’s words/);
  assert.match(b.say.join(' '), /Kišib/);
  const st = await c.ask<State>('state');
  assert.equal(st.stage, 'confirm');
  assert.ok(!JSON.stringify(st).includes(b.words.join(' ')), 'the words are not shown again');
  const id = st.confirm!.id;
  // The words are the chain key's, as the words seed Module derives key 0: nothing of them in the folder, before or after.
  const seed = fromWords(b.words);
  const chain = chainKeyFromSeeds(SCHEME, keySeeds(seed, SCHEME, INDEX)) as { commit: string; seeds: Uint8Array };
  const folder = () => listFiles(app.store.dir).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const secret of [hex(seed), b.words.join(' '), hex(chain.seeds)]) assert.ok(!folder().includes(secret), 'nothing of the chain key in the folder while it waits');

  const right = b.positions.map((p) => b.words[p - 1]);
  await refused(c.ask('confirm', { typed: [right[0], right[1]] }), /not words .* Nothing has been published/);
  await refused(c.ask('confirm', { typed: [right[0], right[1], right[0] === 'zoo' ? 'abandon' : 'zoo'] }), /Nothing has been published/);
  for (const h of homes) assert.equal(await relayAt(h.base).getAct(id), null, 'no genesis at any home');

  await c.ask('confirm', { typed: right.map((w) => ` ${w.toUpperCase()} `) });
  const ready = await c.ask<State>('state');
  assert.equal(ready.stage, 'ready');
  assert.equal(ready.identity!.id, id);
  assert.equal(ready.identity!.kind, 'made');
  assert.equal(ready.identity!.encryption, true);
  for (const secret of [hex(seed), b.words.join(' '), hex(chain.seeds)]) assert.ok(!folder().includes(secret), 'nothing of the chain key in the folder once born');
  const file = fileOf(app, id);
  assert.equal(file.safety.seeds, '');
  assert.equal(statSync(app.store.path('identities', id, 'identity.json')).mode & 0o777, 0o600);
  // The genesis committed the key the words give.
  const l = await lookUp(id, [homes[0].base]);
  assert.equal(l.resolution.chainKeyCommit, chain.commit);
  // An inbox and an encryption key at once, as the desk's identities: the one its signing key's words carry (the carry Module, draft 2).
  assert.deepEqual(l.inbox(POST_SPECS.text), [relay.base]);
  assert.equal(hex(l.encryptionKey!), hex(xwingPublic(encryptionSecret(unhex(file.signingSecret)))));
  // The signing key's words, on request, labelled as such; never the chain key's.
  const carried = await c.ask<{ words: string[]; say: string[] }>('carry');
  assert.equal(carried.words.join(' '), toWords(unhex(file.signingSecret)).join(' '));
  assert.notEqual(carried.words.join(' '), b.words.join(' '));
  assert.match(carried.say[0], /These are the signing key’s words/);
  assert.match(carried.say.join(' '), /post as this identity and read its private messages/);

  // A post, read back verified; with a phone photo, stripped; in the feed, newest first; a picture withdrawn.
  const p1 = await c.ask<{ post: Item }>('post', { text: 'Hello from Dub.' });
  assert.equal(p1.post.standing, 'valid');
  assert.equal(p1.post.text, 'Hello from Dub.');
  assert.equal((await reader(p1.post.id)).standing, 'valid');
  assert.ok(readJpeg(PHONE).carries.includes('location'));
  const p2 = await c.ask<{ post: Item } & Lines>('post', { text: 'With a picture.', jpeg: Buffer.from(PHONE).toString('base64') });
  assert.ok(p2.lines.some((l) => /the place the picture was taken \(GPS\)/.test(l.text)));
  assert.match(p2.post.pictures[0].src!, /^data:image\/jpeg;base64,/);
  assert.equal(p2.post.pictures[0].withdrawable, true);
  const pic = (await reader(p2.post.id)).refs[0] as ShownPicture;
  assert.deepEqual(pic.picture!.carries, [], 'no location, camera data or preview left');
  assert.deepEqual(
    (await feed(c)).map((p) => p.id),
    [p2.post.id, p1.post.id],
  );
  await c.ask('withdraw', { publication: p2.post.pictures[0].publication });
  const after = (await feed(c))[0];
  assert.equal(after.pictures[0].src, null);
  assert.match(after.pictures[0].problem!, /withdrawn by its signer/);
  const other = TestIdentity.create({ homes: [homes[0].home] });
  await other.publishGenesis();
  const theirs = await barebonePost(other, { text: 'Not yours.', jpeg: PHONE, relays: [relay.base] });
  await refused(c.ask('withdraw', { publication: theirs.picture!.id }), /another identity/);

  // Starting again before confirming forgets an identity never published; the one in use stays.
  await c.ask('begin', { homes: [homes[0].base], relays: [] });
  await c.ask('abandon');
  const back = await c.ask<State>('state');
  assert.equal(back.stage, 'ready');
  assert.equal(back.identity!.id, id);
});

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)]));
}

test('several identities held: made or brought, switched, forgotten; the window opens again with none', async () => {
  const { c } = await dub();
  const a = await made(c);
  const b = await made(c, homes[1]);
  let st = await c.ask<State>('state');
  assert.deepEqual(st.held.map((h) => h.id).sort(), [a.id, b.id].sort());
  assert.equal(st.identity!.id, b.id, 'the newest is in use');
  await c.ask('post', { text: 'As B.' });
  await c.ask('use', { id: a.id });
  st = await c.ask<State>('state');
  assert.equal(st.identity!.id, a.id);
  assert.ok((await feed(c)).every((p) => p.who.id === a.id), 'the feed is the identity in use');
  await refused(c.ask('use', { id: '0'.repeat(64) }), /does not hold/);
  await c.ask('forget', { id: a.id });
  st = await c.ask<State>('state');
  assert.equal(st.identity!.id, b.id, 'forgetting the one in use moves to another held');
  await c.ask('forget', { id: b.id });
  st = await c.ask<State>('state');
  assert.equal(st.stage, 'identity');
  assert.deepEqual(st.held, []);
});

test('a folder from before: one identity at its top is moved under its ID, and in use', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mor-dub-old-'));
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  g.save(join(dir, 'identity.json'));
  writeFileSync(join(dir, 'settings.json'), JSON.stringify({ label: 'x', kind: 'made', relays: [relay.base], via: {} }));
  mkdirSync(dir, { recursive: true });
  const { c } = await dub(dir);
  const st = await c.ask<State>('state');
  assert.equal(st.identity!.id, g.id);
  assert.equal(st.identity!.oldChainKey, true, 'its chain key is left where it was, said, unused');
  assert.ok(existsSync(join(dir, 'identities', g.id, 'identity.json')));
  assert.ok(!existsSync(join(dir, 'identity.json')));
});

test('a public message: a post addressed to an identity, left unsealed in its inbox (F287); an ID that is no identity, or one with no inbox, refused before anything is signed', async () => {
  const { c } = await dub();
  const { id: me } = await made(c);
  const box = await start('relay');
  try {
    const reporting = TestIdentity.create({ homes: [homes[1].home] });
    await reporting.publishGenesis();
    await reporting.publishRoutes([
      { scope: null, hints: [relay.base], kind: 0 },
      { scope: null, hints: [box.base], kind: 1 },
    ]);
    for (const a of reporting.chainActs()) await relayAt(relay.base).putAct(a);
    const grouped = reporting.id.match(/.{1,4}/g)!.join(' ');
    const r = await c.ask<{ post: Item } & Lines>('post', { text: 'The page shows nothing on a phone.', to: grouped });
    assert.ok(r.lines.some((l) => l.tone === 'ok' && /Left in the inbox of .* unsealed/.test(l.text)), JSON.stringify(r.lines));
    const acts = (await relayAt(box.base).feed({ to: reporting.id })).items.filter((i) => i.kind === 'act').map((i) => describeAct(i.item) as { id: string; signer: string; public: boolean; to?: string[] });
    const left = acts.find((a) => a.id === r.post.id)!;
    assert.equal(left.public, true);
    assert.equal(left.signer, me);
    assert.deepEqual(left.to, [reporting.id]);
    assert.equal((await readPost(r.post.id, [box.base])).standing, 'valid');

    const before = (await feed(c)).length;
    await refused(c.ask('post', { text: 'x', to: 'REPORTS-IDENTITY' }), /To: an ID is 64 characters.*Nothing was posted/);
    await refused(c.ask('post', { text: 'x', to: me }), /this identity itself\. Nothing was posted/);
    const noInbox = TestIdentity.create({ homes: [homes[2].home] });
    await noInbox.publishGenesis();
    for (const a of noInbox.chainActs()) await relayAt(relay.base).putAct(a);
    await refused(c.ask('post', { text: 'x', to: noInbox.id }), /declares no inbox.*Nothing was posted/);
    assert.equal((await feed(c)).length, before, 'nothing was signed');
  } finally {
    await box.stop();
  }
});

test('two people: follow by ID with a name kept here, a reply as a quick action, “to you”, mute and unmute', async () => {
  const { c: ca } = await dub();
  const { c: cb } = await dub();
  const a = await made(ca);
  const b = await made(cb, homes[1]);
  const pa = await ca.ask<{ post: Item }>('post', { text: 'A speaks.' });

  // B follows A by its ID, typed in groups, with a name of B's own.
  await refused(cb.ask('follow', { id: b.id }), /this identity itself/);
  await cb.ask('follow', { id: a.id.match(/.{4}/g)!.join(' '), name: 'Ada (work)' });
  let st = await cb.ask<State>('state');
  assert.deepEqual(st.identity!.follows.map((f) => [f.id, f.pet]), [[a.id, 'Ada (work)']]);
  assert.equal(st.identity!.list, 'private', 'the follow list is private by default');
  const fb = await feed(cb);
  const seenA = fb.find((p) => p.id === pa.post.id)!;
  assert.ok(seenA, 'A’s post in B’s feed');
  assert.equal(seenA.who.pet, 'Ada (work)');
  assert.equal(seenA.who.followed, true);
  assert.equal(seenA.who.short, `${a.id.slice(0, 8)}…${a.id.slice(-4)}`, 'the fingerprint, always');

  // B replies: the reply names A's post with its signer, is addressed to A, and is left in A's inbox.
  const r = await cb.ask<{ post: Item } & Lines>('post', { text: 'B answers.', reply: { id: pa.post.id, signer: a.id } });
  const d = describeAct((await relayAt(relay.base).getAct(r.post.id))!) as { refs?: string[]; refSigners?: string[]; to?: string[] };
  assert.deepEqual(d.refs, [pa.post.id]);
  assert.deepEqual(d.refSigners, [a.id]);
  assert.deepEqual(d.to, [a.id]);
  assert.ok(r.lines.some((l) => /Left in the inbox of/.test(l.text)));
  // In B's feed, the reply after what it answers, and naming it.
  const fb2 = await feed(cb);
  const reply = fb2.find((p) => p.id === r.post.id)!;
  assert.equal(reply.answers[0].id, pa.post.id);
  assert.equal(reply.answers[0].snippet, 'A speaks.');
  assert.ok(fb2.findIndex((p) => p.id === r.post.id) < fb2.findIndex((p) => p.id === pa.post.id), 'newest first, a reply after what it answers');

  // A, who follows nobody, finds it "to you", from its inbox, with a count until seen.
  const ia = await inbox(ca);
  const toA = ia.toYou.find((x) => x.id === r.post.id)!;
  assert.ok(toA, 'the reply is “to you”');
  assert.equal(toA.standing, 'valid');
  assert.equal(toA.seen, false);
  assert.equal(toA.answers[0].id, pa.post.id);
  await ca.ask('seen', { keys: [r.post.id] });
  assert.equal((await inbox(ca)).toYou.find((x) => x.id === r.post.id)!.seen, true);
  // A follows B from the act shown: B's posts join A's feed, the reply marked as answering A.
  await ca.ask('follow', { id: toA.who.id });
  const fa = await feed(ca);
  assert.equal(fa.find((p) => p.id === r.post.id)?.toMe, true);

  // A mutes B: nothing of B is shown, in the feed or "to you", though A follows it; nobody is told, nothing published.
  await ca.ask('mute', { id: b.id });
  assert.ok(!(await feed(ca)).some((p) => p.who.id === b.id));
  const muted = await inbox(ca);
  assert.ok(!muted.toYou.some((x) => x.who.id === b.id));
  assert.equal(muted.hidden, 1);
  assert.deepEqual((await ca.ask<State>('state')).identity!.muted.map((m) => m.id), [b.id]);
  for (const item of (await relayAt(relay.base).feed({ signer: a.id })).items) {
    const x = describeAct(item.item) as { spec?: string };
    assert.notEqual(x.spec, PEOPLE_SPEC, 'nothing of the people cMIP published');
  }
  await ca.ask('unmute', { id: b.id });
  assert.ok((await feed(ca)).some((p) => p.who.id === b.id));
  // Unfollow.
  await cb.ask('unfollow', { id: a.id });
  st = await cb.ask<State>('state');
  assert.deepEqual(st.identity!.follows, []);
  assert.ok(!(await feed(cb)).some((p) => p.id === pa.post.id));
});

test('the follow list: private by default, published only after its warning, versioned, back to private; the names given stay here', async () => {
  const { c } = await dub();
  const me = await made(c);
  const x = TestIdentity.create({ homes: [homes[0].home] });
  await x.publishGenesis();
  const y = TestIdentity.create({ homes: [homes[0].home] });
  await y.publishGenesis();
  await c.ask('follow', { id: x.id, name: 'Secret name' });
  assert.equal((await readFollowList(me.id, [relay.base])).version, 0, 'nothing published by default');
  await refused(c.ask('list', { published: true }), /only once its warning was shown/);
  const r = await c.ask<Lines>('list', { published: true, shown: PUBLISH_WARNING });
  assert.match(r.lines[0].text, /published \(version 1\)/);
  let l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.version, l.ids, l.withdrawn, l.forked], [1, [x.id], false, null]);
  // A change publishes the next version.
  await c.ask('follow', { id: y.id, name: 'Another' });
  l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.version, l.ids], [2, [x.id, y.id]]);
  // The names never leave the app.
  for (const item of (await relayAt(relay.base).feed({ signer: me.id })).items) {
    const d = describeAct(item.item) as { payload?: Uint8Array };
    if (d.payload) assert.ok(!Buffer.from(d.payload).includes(Buffer.from('Secret name')));
  }
  await c.ask('list', { published: false });
  l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.version, l.ids, l.withdrawn], [3, [], true]);
  await c.ask('unfollow', { id: y.id });
  assert.equal((await readFollowList(me.id, [relay.base])).version, 3, 'private again: nothing more published');
  assert.equal((await c.ask<State>('state')).identity!.list, 'private');
});

test('the follow list sealed to the identity (people cMIP draft 2): kept at its homes with its names, read and changed by another Dub holding the identity; never in the clear', async () => {
  const { c: c1, app: app1 } = await dub();
  const me = await made(c1);
  const x = TestIdentity.create({ homes: [homes[0].home] });
  await x.publishGenesis();
  const y = TestIdentity.create({ homes: [homes[0].home] });
  await y.publishGenesis();
  const r = await c1.ask<Lines>('follow', { id: x.id, name: 'Mum (sealed)' });
  assert.ok(r.lines.some((l) => /sealed to this identity and kept at its homes \(version 1\)/.test(l.text)), JSON.stringify(r));
  assert.deepEqual((await c1.ask<State>('state')).identity!.sealed, { version: 1, forked: false });
  // At its home: sealed, addressed to itself; neither the name nor the ID in the clear, anywhere.
  for (const h of [homes[0], relay]) {
    for (const i of [...(await relayAt(h.base).feed({ to: me.id })).items, ...(await relayAt(h.base).feed({ signer: me.id })).items]) {
      assert.ok(!Buffer.from(i.item).includes(Buffer.from('Mum (sealed)')));
      assert.ok(!Buffer.from(i.item).includes(Buffer.from(x.id, 'hex')));
    }
  }
  assert.ok((await relayAt(homes[0].base).feed({ to: me.id })).items.some((i) => i.kind === 'sealed'));
  // Read as anyone holding the identity's encryption key reads it.
  const secret = encryptionSecret(unhex(fileOf(app1, me.id).signingSecret));
  const l = await readSealedList(me.id, [secret], [homes[0].base]);
  assert.deepEqual([l.version, l.follows], [1, [{ id: x.id, name: 'Mum (sealed)' }]]);
  // Nothing public: no published list.
  assert.equal((await readFollowList(me.id, [relay.base])).version, 0);

  // Another Dub, the identity brought by its signing key's words: it finds the list, names included.
  const { c: c2 } = await dub();
  const carried = await c1.ask<{ words: string[] }>('carry');
  await c2.ask('bring', { id: me.id, words: carried.words.join(' '), address: homes[0].base });
  await c2.ask('feed', { fresh: true });
  let st = await c2.ask<State>('state');
  assert.deepEqual(st.identity!.follows.map((f) => [f.id, f.pet]), [[x.id, 'Mum (sealed)']]);
  // A change there; the first Dub reads it on looking again.
  await c2.ask('follow', { id: y.id, name: 'Y' });
  await c2.ask('unfollow', { id: x.id });
  await c1.ask('feed', { fresh: true });
  st = await c1.ask<State>('state');
  assert.deepEqual(st.identity!.follows.map((f) => [f.id, f.pet]), [[y.id, 'Y']]);
  assert.deepEqual(st.identity!.sealed, { version: 3, forked: false });
  // A change in the first goes on from the version read.
  await c1.ask('call', { id: y.id, name: 'Yves' });
  assert.equal((await readSealedList(me.id, [secret], [homes[0].base])).version, 4);
});

test('the follow list carried over (people cMIP draft 2, 3.7): a list kept in the app before is sealed once, nothing removed', async () => {
  const { c, app } = await dub();
  const me = await made(c);
  const x = 'ab'.repeat(32);
  const y = 'cd'.repeat(32);
  // As Dub kept it before draft 2: in the app only.
  const file = app.store.path('identities', me.id, 'people.json');
  writeFileSync(file, JSON.stringify({ follows: [{ id: x, name: 'Old friend' }, { id: y, name: null }], muted: [], list: 'private', published: null, seen: [], inbox: { after: {}, items: [] }, sent: [] }));
  await c.ask('feed', { fresh: true });
  const secret = encryptionSecret(unhex(fileOf(app, me.id).signingSecret));
  const l = await readSealedList(me.id, [secret], [homes[0].base]);
  assert.deepEqual([l.version, l.follows], [1, [{ id: x, name: 'Old friend' }, { id: y, name: null }]]);
  // Read again: nothing new written.
  await c.ask('feed', { fresh: true });
  assert.equal((await readSealedList(me.id, [secret], [homes[0].base])).version, 1);
});

test('switching identity (H28): Dub leaves the one in use first, keeps its keys, then the window lists those held to choose', async () => {
  const { c } = await dub();
  const a = await made(c);
  const b = await made(c, homes[1]);
  await c.ask('leave');
  let st = await c.ask<State>('state');
  assert.equal(st.stage, 'identity');
  assert.equal(st.identity, undefined);
  assert.deepEqual(st.held.map((h) => h.id).sort(), [a.id, b.id].sort());
  assert.ok(st.held.every((h) => !h.active));
  await refused(c.ask('post', { text: 'nobody in use' }), /No identity in use/);
  await c.ask('use', { id: a.id });
  st = await c.ask<State>('state');
  assert.equal(st.stage, 'ready');
  assert.equal(st.identity!.id, a.id);
});

test('the relay view (H29): every public act at the identity’s relays, newest first, posts of anyone, other acts named; muted ones left out and counted', async () => {
  const { c: ca } = await dub();
  const { c: cb } = await dub();
  const a = await made(ca);
  const b = await made(cb, homes[1]);
  await cb.ask('post', { text: 'B, not followed by A, first.' });
  await cb.ask('post', { text: 'B, not followed by A, second.' });
  await cb.ask('name', { name: 'Bee' });
  type R = { items: Item[]; hidden: number; problems: string[] };
  let r = await ca.ask<R>('relay');
  assert.deepEqual(r.problems, []);
  const posts = r.items.filter((x) => !x.what);
  const i1 = posts.findIndex((x) => x.text === 'B, not followed by A, first.');
  const i2 = posts.findIndex((x) => x.text === 'B, not followed by A, second.');
  assert.ok(i2 >= 0 && i1 > i2, 'newest first');
  assert.equal(posts[i2].who.id, b.id);
  assert.equal(posts[i2].standing, 'valid');
  assert.equal(posts[i2].via, 'relay');
  assert.ok(r.items.some((x) => x.what === 'A display name' && x.who.id === b.id), JSON.stringify(r.items.map((x) => x.what)));
  assert.ok(r.items.findIndex((x) => x.what === 'A display name' && x.who.id === b.id) < i2 + (r.items.length - posts.length), 'the name, signed last, before the posts');
  assert.ok(!(await feed(ca)).some((x) => x.who.id === b.id), 'the feed itself is unchanged: B is not followed');
  await ca.ask('mute', { id: b.id });
  r = await ca.ask<R>('relay');
  assert.ok(!r.items.some((x) => x.who.id === b.id));
  assert.ok(r.hidden >= 3);
  await ca.ask('post', { text: 'A, after the mute.' });
  r = await ca.ask<R>('relay');
  assert.equal(r.items[0].text, 'A, after the mute.');
  assert.equal(r.items[0].who.id, a.id);
});

test('a display name (the naming cMIP): shown beside the fingerprint, renamed with the old one withdrawn, refused when malformed', async () => {
  const { c } = await dub();
  const me = await made(c);
  await refused(c.ask('name', { name: 'x'.repeat(49) }), /longer than 48 characters.*Nothing was signed/);
  await refused(c.ask('name', { name: 'two\nlines' }), /line break.*Nothing was signed/);
  await refused(c.ask('name', { name: 'a‮b' }), /direction override/);
  const r = await c.ask<Lines & { names: string[] }>('name', { name: '  Ada  ' });
  assert.deepEqual(r.names, ['Ada']);
  assert.match(r.lines[0].text, /beside your fingerprint, never instead of it/);
  let who = (await c.ask<State>('state')).identity!.who;
  assert.deepEqual(who.names, ['Ada']);
  assert.ok(who.short.length > 0);
  const renamed = await c.ask<Lines & { names: string[] }>('name', { name: 'Ada Lovelace' });
  assert.deepEqual(renamed.names, ['Ada Lovelace']);
  assert.ok(renamed.lines.some((l) => /“Ada” withdrawn/.test(l.text)));
  assert.deepEqual((await namesOf(me.id, [relay.base])).map((n) => n.name), ['Ada Lovelace'], 'read by anyone at the relay and homes');
  // Another Dub following it sees the name beside the fingerprint, never as its identity.
  const { c: other } = await dub();
  await made(other, homes[1]);
  await other.ask('follow', { id: me.id });
  await c.ask('post', { text: 'Named.' });
  const seen = (await feed(other)).find((p) => p.who.id === me.id)!;
  assert.deepEqual(seen.who.names, ['Ada Lovelace']);
  assert.equal(seen.who.pet, null);
  // No name: withdrawn, the fingerprint alone.
  await c.ask('name', { name: '' });
  who = (await c.ask<State>('state')).identity!.who;
  assert.deepEqual(who.names, []);
});

test('a display name at creation (H12): checked before anything is made, published right after the genesis', async () => {
  const { app, c } = await dub();
  await refused(c.ask('begin', { homes: [homes[0].base], relays: [relay.base], name: 'two\nlines' }), /line break.*Nothing was signed/);
  assert.equal((await c.ask<State>('state')).stage, 'identity', 'nothing waits for a refused name');
  assert.equal(await app.store.pending(), null);
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes: [homes[0].base], relays: [relay.base], name: '  Grace  ' });
  const r = await c.ask<Lines>('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  assert.ok(r.lines.some((l) => /Your display name is “Grace”/.test(l.text)));
  const st = await c.ask<State>('state');
  assert.deepEqual(st.identity!.who.names, ['Grace']);
  assert.deepEqual((await namesOf(st.identity!.id, [relay.base])).map((n) => n.name), ['Grace'], 'read by anyone');
  // Its sequence: genesis, routes, encryption key, then the name; nothing else.
  assert.equal(fileOf(app, st.identity!.id).sequence.length, 3);
  // No name given: none published.
  const { c: plain } = await dub();
  const p = await made(plain);
  assert.deepEqual(await namesOf(p.id, [relay.base]), []);
});

test('a private message, sealed (F293): opened only by its recipient; the identity carried by its signing key’s words opens it too (the carry Module, draft 2)', async () => {
  const { c: ca } = await dub();
  const { c: cb } = await dub();
  const a = await made(ca);
  const b = await made(cb, homes[1]);
  await refused(ca.ask('message', { to: a.id, text: 'me' }), /this identity itself/);
  const r = await ca.ask<Lines>('message', { to: b.id, text: 'Only for B.' });
  assert.match(r.lines[0].text, /only it can open it/);
  // At the relay: sealed, never the text.
  const items = (await relayAt(relay.base).feed({ to: b.id })).items;
  assert.ok(items.some((i) => i.kind === 'sealed'));
  for (const i of items) assert.ok(!Buffer.from(i.item).includes(Buffer.from('Only for B.')));
  // B opens it, verified, with a count until seen.
  const ib = await inbox(cb);
  const m = ib.messages.find((x) => x.text === 'Only for B.')!;
  assert.equal(m.dir, 'in');
  assert.equal(m.who.id, a.id);
  assert.equal(m.standing, 'valid');
  assert.equal(m.seen, false);
  await cb.ask('seen', { keys: [m.key] });
  assert.equal((await inbox(cb)).messages.find((x) => x.key === m.key)!.seen, true);
  // A keeps it as sent.
  const ia = await inbox(ca);
  assert.ok(ia.messages.some((x) => x.dir === 'out' && x.text === 'Only for B.' && x.who.id === b.id));
  // B's identity, brought into a third Dub by its signing key's words: its private messages open there too.
  const words = (await cb.ask<{ words: string[] }>('carry')).words.join(' ');
  const { c: c3 } = await dub();
  const brought = await c3.ask<Lines>('bring', { id: b.id, words, address: homes[1].base });
  assert.ok(brought.lines.some((l) => /its private messages open here/.test(l.text)));
  assert.ok((await inbox(c3)).messages.some((x) => x.text === 'Only for B.'));
  // A muted sender's messages are not shown.
  await cb.ask('mute', { id: a.id });
  const hidden = await inbox(cb);
  assert.ok(!hidden.messages.some((x) => x.who.id === a.id));
  assert.equal(hidden.hidden, 1);
});

test('an identity made by the genesis client, brought by its words: refused sets; no private messages (its encryption key was not made from its words); two lines; a rotation elsewhere keeps them, and Dub says its key is spent, then takes the new words', async () => {
  const g = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await g.publishGenesis();
  await g.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await g.publishEncryptionKey();
  const gp = await barebonePost(g, { text: 'From the genesis client.', relays: [relay.base] });
  const words = toWords(unhex(g.f.signingSecret));

  const { app, c } = await dub();
  const stranger = TestIdentity.create({ homes: [homes[0].home] });
  await refused(
    c.ask('bring', { id: g.id, words: toWords(unhex(stranger.f.signingSecret)).join(' '), address: homes[1].base }),
    /do not give this identity’s current signing key.*Nothing was kept.*chain key’s words/,
  );
  await refused(c.ask('bring', { id: g.id, words: [...words.slice(0, 23), 'notaword'].join(' '), address: homes[1].base }), /word 24, “notaword”, is not on the list/);
  await refused(c.ask('bring', { id: g.id, words: words.slice(0, 12).join(' '), address: homes[1].base }), /12 words, not 24/);
  assert.equal((await c.ask<State>('state')).stage, 'identity', 'nothing kept');

  const r = await c.ask<Lines>('bring', { id: g.id.toUpperCase().match(/.{4}/g)!.join(' '), words: words.join('  ').toUpperCase(), address: homes[1].base });
  assert.ok(r.lines.some((l) => /must keep this line/.test(l.text)), 'rule 35’s warning');
  assert.ok(r.lines.some((l) => /private messages cannot be opened here/.test(l.text)), 'said: its encryption key is not carried');
  const st = await c.ask<State>('state');
  assert.equal(st.identity!.kind, 'brought');
  assert.equal(st.identity!.encryption, false);
  assert.deepEqual(st.identity!.relays, [relay.base]);
  assert.equal(fileOf(app, g.id).safety.seeds, '', 'no chain key here: it never travels');
  assert.equal(fileOf(app, g.id).encryption.length, 0);
  // It never publishes an encryption key of its own (the carry Module, 2a.3): its key stays the genesis client's.
  assert.equal(hex((await lookUp(g.id, [homes[0].base])).encryptionKey!), hex(xwingPublic(unhex(g.f.encryption[0].secret))));

  const bp = await c.ask<{ post: Item }>('post', { text: 'From Dub.' });
  const gp2 = await barebonePost(g, { text: 'From the genesis client again.', relays: [relay.base] });
  for (const id of [gp.id, bp.post.id, gp2.id]) assert.equal((await reader(id)).standing, 'valid', id);
  const position = async (id: string) => (describeAct((await relayAt(relay.base).getAct(id))!) as { position?: number }).position;
  assert.equal(await position(bp.post.id), 1, 'Dub starts its own line');

  // Rotation is not Dub's (F332, amended): the genesis client, standing in for Kišib, rotates and keeps every line.
  assert.deepEqual(await c.ask('check'), { current: true, say: null });
  await g.prepareRotation();
  await g.submitRotation();
  assert.ok((await g.settleRotation()).counts);
  for (const id of [gp.id, gp2.id, bp.post.id]) assert.equal((await reader(id)).standing, 'valid', `kept: ${id}`);
  await refused(c.ask('post', { text: 'After the rotation.' }), /changed elsewhere.*Nothing was signed.*Kišib/);
  assert.deepEqual(await c.ask('check'), { current: false, say: SPENT_SAY });
  // H80: the paths that once skipped the check refuse too: a vow's sale contested (public), and, with a sale to deliver, the key delivery (`delivery.ts`, run by itself on every refresh; its refusal is tested in Edubba's test/h80.test.ts).
  await refused(c.ask('vow contest', { vow: '7'.repeat(64), promise: '' }), /changed elsewhere.*Nothing was signed/);
  assert.deepEqual((await c.ask<Lines>('money look')).lines, [], 'nothing to deliver: nothing signed, nothing refused');
  // The old words again: refused. The new signing key's words: taken; a new line; posts again.
  await refused(c.ask('renew', { words: words.join(' ') }), /do not give this identity’s current signing key/);
  const renewed = await c.ask<Lines>('renew', { words: toWords(unhex(g.f.signingSecret)).join(' ') });
  assert.ok(renewed.lines.some((l) => /new line/.test(l.text)));
  assert.deepEqual(await c.ask('check'), { current: true, say: null });
  const after = await c.ask<{ post: Item }>('post', { text: 'With the new words.' });
  assert.equal((await reader(after.post.id)).standing, 'valid');
  assert.equal(await position(after.post.id), 1, 'a new line under the new binding');
});

test('after a rotation made elsewhere with the chain key’s words, Dub takes the new signing words and renews the encryption key it published (the carry Module, draft 2, 2a.4)', async () => {
  const { app, c } = await dub();
  const a = await made(c);
  const { c: cb } = await dub();
  await made(cb, homes[1]);
  await cb.ask('message', { to: a.id, text: 'Before the rotation.' });
  assert.ok((await inbox(c)).messages.some((m) => m.text === 'Before the rotation.'));
  const p = await c.ask<{ post: Item }>('post', { text: 'Before.' });
  // Kišib, as the genesis client's code stands in for it: the identity from its homes, the chain key from its paper words.
  const f = fileOf(app, a.id);
  const safety = new TestIdentity({ ...f, sequence: [], encryption: [], routes: null, safety: { scheme: SCHEME, seeds: hex(keySeeds(fromWords(a.chainWords), SCHEME, INDEX)) } });
  await safety.prepareRotation({ hints: [relay.base] });
  await safety.submitRotation();
  assert.ok((await safety.settleRotation()).counts);
  assert.equal((await reader(p.post.id)).standing, 'valid', 'Dub’s line kept');
  const renewed = await c.ask<Lines>('renew', { words: toWords(unhex(safety.f.signingSecret)).join(' ') });
  assert.ok(renewed.lines.some((l) => /encryption key was renewed/.test(l.text)), JSON.stringify(renewed.lines));
  const l = await lookUp(a.id, [homes[0].base]);
  assert.equal(hex(l.encryptionKey!), hex(xwingPublic(encryptionSecret(unhex(safety.f.signingSecret)))));
  // Old messages still open; new ones are sealed to the new key and open too.
  await cb.ask('message', { to: a.id, text: 'After the rotation.' });
  const msgs = (await inbox(c)).messages.map((m) => m.text);
  assert.ok(msgs.includes('Before the rotation.') && msgs.includes('After the rotation.'));
});

test('the feed shows simple text and JPEG pictures; a long-form document is not shown, a link opens it in the reader', async () => {
  const { c } = await dub();
  await made(c);
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const doc = await barebonePost(g, { text: '# Running your own relay\n\nA long text.', format: POST_SPECS.longform, relays: [relay.base] });
  await barebonePost(g, { text: 'A short note.', relays: [relay.base] });
  await c.ask('follow', { id: g.id });
  const items = await feed(c);
  const d = items.find((p) => p.id === doc.id)!;
  assert.equal(d.text, '', 'not shown in the feed');
  assert.equal(d.doc!.title, 'Running your own relay');
  assert.equal(d.doc!.link, `https://reader.dubsar.org/#${doc.id}`);
  assert.ok(items.some((p) => p.text === 'A short note.'));
});

test('requests from an unpaired browser are refused', async () => {
  const { app } = await dub();
  const stranger = await Client.open(await newKey(), app.base, DOMAIN);
  await refused(stranger.ask('state'), /not paired/);
  await refused(stranger.ask('begin', { homes: [homes[0].base] }), /not paired/);
  const desk = await Client.open(await newKey(), app.base);
  await refused(desk.ask('pair', { code: app.access.newCode(), label: 'x' }), /signature does not match/);
  const r = await fetch(`${app.base}/api`, { method: 'POST', body: '{}' });
  assert.equal(r.status, 401);
  assert.equal((await fetch(`${app.base}/local/code`, { method: 'POST' })).status, 401);
  const page = await fetch(`${app.base}/`);
  assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'none'; script-src 'self'/);
});

test('nothing listens beyond 127.0.0.1', async () => {
  const { app } = await dub();
  const a = app.server.address();
  assert.ok(a && typeof a === 'object');
  assert.equal(a.address, '127.0.0.1');
  const others = Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && i.address !== '127.0.0.1')
    .map((i) => i!.address);
  for (const host of others) {
    await assert.rejects(fetch(`http://${host}:${app.port}/hello`), `nothing at ${host}`);
  }
  const status = await new Promise<number>((resolve, reject) => {
    const q = request({ host: '127.0.0.1', port: app.port, path: '/hello', headers: { host: `evil.example:${app.port}` } }, (res) => resolve(res.statusCode ?? 0));
    q.on('error', reject);
    q.end();
  });
  assert.equal(status, 421);
});
