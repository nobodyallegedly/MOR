// The rare acts in Kišib, against real homes and relays on local ports:
// the escape with both keys after someone else changed an identity's keys
// with its stolen paper words (Identity section 11); the escape out of a
// position contested at a self-hosted home (F299); a succession declared by
// a rotation and confirmed by the successor (F300).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECS, cborEncode, describeAct, signingPublic, unhex } from '../../genesis/src/core.ts';
import { Running } from '../../genesis/test/world.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { post as barebonePost } from '../../barebone/src/post.ts';
import { fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { chainKeyAt } from '../src/words.ts';
import { closeAll, dub, kishib, reader, refused, standing, start, type Relay } from './world.ts';
import type { Review, State } from '../src/shapes.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

/** Rotate in a Kišib to the end: reviewed, signed, counting, the new words shown and typed back. Returns the new signing words. */
async function rotateThrough(c: Awaited<ReturnType<typeof kishib>>['c'], op: string, args: Record<string, unknown>): Promise<{ review: Review; state: State; words: string[] }> {
  const review = await c.ask<Review>(op, args);
  assert.deepEqual(review.blocking, [], JSON.stringify(review.blocking));
  let state = await c.ask<State>('confirm', { plan: review.plan, digest: review.digest, ...(review.warning ? { warned: review.warning } : {}) });
  for (let i = 0; state.sitting!.stage === 'sent' && i < 3; i++) state = await c.ask<State>('resend');
  assert.equal(state.sitting!.stage, 'counts', JSON.stringify(state.sitting!.lines));
  const shown = await c.ask<{ words: string[] }>('words show');
  state = await c.ask<State>('words written');
  state = await c.ask<State>('words typed', { typed: state.sitting!.positions!.map((p) => shown.words[p - 1]) });
  assert.equal(state.sitting!.stage, 'done');
  await c.ask('forget');
  return { review, state, words: shown.words };
}

test('someone else changes the keys with stolen paper words; the owner escapes with both keys to a new home, abandoning that change; earlier posts stay valid', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const p = await a.c.ask<{ post: { id: string } }>('post', { text: 'Before the theft.' });
  const ownSigning = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');

  // The thief, with the stolen chain words, in a Kišib of its own: its change counts at the homes.
  const thief = await kishib();
  const stolen = await rotateThrough(thief.c, 'rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  const theft = stolen.state.sitting!.act!;
  assert.equal((await lookUp(a.id, H)).resolution.links.at(-1)!.act, theft);

  // The owner: a normal change now would be at the next position, after the thief's; the escape goes back to the owner's position.
  const k = await kishib();
  await refused(k.c.ask('escape plan', { id: a.id, address: H[0], words: a.chainWords.join(' '), signingWords: stolen.words.join(' '), homes: H[0] }), /Nothing contests your position/);
  await refused(k.c.ask('escape plan', { id: a.id, address: H[0], words: a.chainWords.join(' '), signingWords: ownSigning, homes: H[1] }), /one of the old homes/);
  const fresh = await start('home');
  try {
    const r = await k.c.ask<Review>('escape plan', { id: a.id, address: H[0], words: a.chainWords.join(' '), signingWords: ownSigning, homes: fresh.base });
    const contest = r.sections.find((s) => s.heading.startsWith('What contests position 1'))!;
    assert.equal(contest.lines.length, 1);
    assert.match(contest.lines[0].text, new RegExp(`${theft}.*it counts now`));
    assert.equal(contest.lines[0].tone, 'bad');
    assert.match(r.signs[1], /escape endorsement .* abandoned/);
    const kept = r.sections.find((s) => s.heading.startsWith('Your lines of acts'))!;
    assert.ok(kept.lines.some((l) => /Kept\.$/.test(l.text)), JSON.stringify(kept));
    let s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
    for (let i = 0; s.sitting!.stage === 'sent' && i < 3; i++) s = await k.c.ask<State>('resend');
    assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
    const escape = s.sitting!.act!;
    // As any reader sees it, from the new home and the relay: the escape counts, the thief's change is abandoned.
    const l = await lookUp(a.id, [fresh.base, relay.base, ...H]);
    assert.deepEqual(l.resolution.links.map((x) => x.act), [a.id, escape]);
    assert.match(l.resolution.links[1].how, /escape/);
    assert.equal(await standing(p.post.id, a.id, [relay.base, fresh.base, ...H]), 'valid', 'the earlier post, kept');
    const shown = await k.c.ask<{ words: string[] }>('words show');
    assert.equal(l.resolution.signingKey && Buffer.from(l.resolution.signingKey).toString('hex'), Buffer.from(signingPublic(fromWords(shown.words))).toString('hex'));
    s = await k.c.ask<State>('words written');
    await k.c.ask('words typed', { typed: s.sitting!.positions!.map((x) => shown.words[x - 1]) });
  } finally {
    await fresh.stop();
  }
});

test('F299: two rotations served at one position of a self-hosted identity are contested for good; the owner leaves by the escape, listing both as abandoned', async () => {
  const fresh = await start('home');
  // A self-hosted identity: its home is a relay it runs itself, as its own operator; its chain key on paper (the words seed Module, key 0).
  const port = 20000 + Math.floor(Math.random() * 20000);
  const base = `http://127.0.0.1:${port}`;
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const words = toWords(seed);
  const key0 = chainKeyAt(seed, 3, 0);
  const me = TestIdentity.create({ homes: [{ operator: null, hint: base }], chainKey: { scheme: 3, seeds: key0.seeds, commit: key0.commit } });
  const keys = mkdtempSync(join(tmpdir(), 'kishib-self-'));
  writeFileSync(join(keys, 'operator.key'), cborEncode(new Map<number, unknown>([[0, "The signing key of a MOR home's operator. Keep it secret."], [1, unhex(me.id)], [2, unhex(me.f.binding)], [3, unhex(me.f.signingSecret)]])));
  writeFileSync(join(keys, 'operator-chain.mor'), cborEncode(new Map([[0, me.chainActs()]])));
  const data = mkdtempSync(join(tmpdir(), 'kishib-self-home-'));
  execFileSync(fileURLToPath(new URL('../../../target/debug/mor-relay', import.meta.url)), ['init', '--dir', data, '--role', 'home', '--base', base, '--local-test', '--operator-key', join(keys, 'operator.key'), '--operator-chain', join(keys, 'operator-chain.mor')]);
  const own = new Running(data, port, base, null);
  await own.start();
  try {
    await me.publishGenesis();
    await me.publishRoutes([{ scope: null, hints: [base, relay.base], kind: 0 }]);
    const p = await barebonePost(me, { text: 'Self-hosted, before.', relays: [base] });
    const signing = toWords(Buffer.from(me.f.signingSecret, 'hex')).join(' ');

    // The owner's rotation, in Kišib: it counts on its own signatures.
    const k = await kishib();
    const mine = await rotateThrough(k.c, 'rotate plan', { id: me.id, address: base, words: words.join(' ') });
    // A thief with the same paper serves a rotation of its own at the same position, from a relay.
    const thief = new TestIdentity({ ...me.f, sequence: [], pending: null, safety: { scheme: 3, seeds: Buffer.from(key0.seeds).toString('hex') } });
    await thief.prepareRotation({ hints: [base] });
    await relayAt(relay.base).putAct(Uint8Array.from(Buffer.from(thief.f.pending!.rotation, 'base64')));

    // The record says so, in red; a normal rotation is refused.
    const rec = await k.c.ask<{ sections: { heading: string; lines: { text: string; tone?: string }[] }[] }>('record', { id: me.id, address: base });
    assert.ok(rec.sections.some((s) => s.lines.some((x) => /Contested at position 1/.test(x.text) && x.tone === 'bad')), JSON.stringify(rec.sections));
    const r0 = await k.c.ask<Review>('rotate plan', { id: me.id, address: base, words: words.join(' ') });
    assert.ok(r0.blocking.some((b) => /contested/.test(b)));
    await k.c.ask('forget');
    // The escape lists both rotations served there.
    const r = await k.c.ask<Review>('escape plan', { id: me.id, address: base, words: words.join(' '), signingWords: signing, homes: fresh.base });
    const contest = r.sections.find((s) => s.heading.startsWith('What contests position 1'))!;
    assert.equal(contest.lines.length, 2, JSON.stringify(contest));
    assert.ok(contest.lines.some((x) => x.text.includes(mine.state.sitting!.act!)));
    assert.ok(contest.lines.every((x) => /contested/.test(x.text)));
    let s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
    for (let i = 0; s.sitting!.stage === 'sent' && i < 3; i++) s = await k.c.ask<State>('resend');
    assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
    // As a reader of its homes and relays sees it (the gauntlet's 5.7f reader): the escape counts at the new home.
    const after = await reader(me.id, [base, relay.base, fresh.base]);
    assert.deepEqual(after.links.map((x) => x.act), [me.id, s.sitting!.act], 'with both rotations abandoned, the escape is the one left at the position: it counts');
    assert.equal(await standing(p.id, me.id, [base, fresh.base, relay.base]), 'valid');
  } finally {
    await own.stop();
    await fresh.stop();
  }
});

test('F300: a succession declared by a rotation in Kišib, shown as declared; confirmed by the successor in Kišib with its own signing words; followed only then', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const b = await dub([H[1]], [relay.base]);
  const k = await kishib();
  const declared = await rotateThrough(k.c, 'rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' '), successor: b.id });
  assert.ok(declared.review.sections.some((s) => s.lines.some((l) => /succession declared/.test(l.text) && /Nobody follows it until/.test(l.text))));
  assert.match(declared.review.signs[2], /successor signs nothing here/);
  const v = (await lookUp(a.id, H)).verifier;
  assert.equal((v.succession(a.id) as { state: string }).state, 'declared');
  const rec = await k.c.ask<{ sections: { heading: string; lines: { text: string }[] }[] }>('record', { id: a.id, address: H[0] });
  assert.match(rec.sections.find((s) => s.heading === 'Its succession')!.lines[0].text, /not yet confirmed/);

  // The successor confirms, with its own signing key's words: one act naming the rotation.
  const bWords = (await b.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await refused(k.c.ask('confirm plan', { owner: a.id, successor: a.id, address: H[0], words: bWords }), /names/);
  const r = await k.c.ask<Review>('confirm plan', { owner: a.id, successor: b.id, address: H[0], words: bWords });
  assert.ok(r.sections.some((s) => s.heading === 'Who signs what'));
  const s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  assert.ok(s.sitting!.lines.some((l) => /the succession is confirmed/.test(l.text)), JSON.stringify(s.sitting!.lines));
  const v2 = (await lookUp(a.id, H)).verifier;
  await lookUp(b.id, [...H, relay.base], {}, v2);
  const conf = await relayAt(H[1]).getAct(s.sitting!.act!);
  v2.add(conf!);
  assert.equal((v2.succession(a.id) as { state: string }).state, 'confirmed');
  void SPECS;
  void describeAct;
});
