// Roadmap step 5, "done when": a test identity exists, rotates, and its homes
// serve it; a key delivered to it opens only with its key; and both X-Wing
// implementations agree on every key exchange in the tests.
//
// Three real homes under three test operators and one open relay (the inbox),
// run from the relay program of step 4. Every answer is judged by the core
// library's verifier, through WebAssembly, from the signed acts the homes
// hand back.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ml_kem768_x25519 as noble } from '@noble/post-quantum/hybrid.js';
import { start, type Running } from './world.ts';
import { TestIdentity, lookUp, receive, TEST_LABEL } from '../src/identity.ts';
import { SPECS, WITNESS_EXPLANATION, actId, cborEncode, openWithKey, xwingDecapsulate, xwingEncapsulate } from '../src/core.ts';
import { kexLog } from '../src/kex.ts';
import { relayAt } from '../src/transport.ts';
import { actsBy, ownLine, type FoundLine } from '../src/lines.ts';

let homes: Running[] = [];
let inbox: Running;
const dir = mkdtempSync(join(tmpdir(), 'mor-genesis-ids-'));

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  inbox = await start('relay');
  kexLog.recording = true;
});

after(async () => {
  for (const r of [...homes, inbox]) await r.stop();
});

const hints = () => homes.map((h) => h.base);

/** A test identity with the three homes (majority by default), an inbox and an encryption key. */
async function person(name: string): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  const path = join(dir, `${name}.json`);
  t.save(path);
  const sent = await t.publishGenesis();
  for (const s of sent) assert.ok(s.result?.receipt, `${name}: ${s.home} ${s.error}`);
  await t.publishRoutes([
    { scope: null, hints: [homes[0].base] },
    { scope: null, hints: [inbox.base], kind: 1 },
  ]);
  await t.publishEncryptionKey();
  t.save(path);
  return t;
}

let alice: TestIdentity;
let bob: TestIdentity;

test('a test identity is born: three homes each sign a receipt, and a reader sees it', async () => {
  alice = await person('alice');
  const path = join(dir, 'alice.json');
  const again = TestIdentity.load(path);
  assert.equal(again.f.label, TEST_LABEL);
  assert.equal(again.id, alice.id);

  const l = await lookUp(alice.id, [homes[1].base]);
  assert.deepEqual(l.unreachable, []);
  assert.equal(l.resolution.links.length, 1);
  assert.equal(l.resolution.links[0].how, 'genesis');
  assert.equal(l.resolution.stop, 'end');
  assert.equal(l.resolution.homes.length, 3);
  assert.match(l.resolution.effective ?? '', /Threshold\(2\)/, 'majority of three operators by default');
  // Routes and encryption key, as the core library chooses them.
  assert.equal(l.routes.act, alice.f.routes?.act);
  assert.deepEqual(l.inbox(SPECS.envelopes), [inbox.base]);
  assert.equal(l.encryptionKeyAct, alice.f.encryption[0].act);
  assert.equal(l.verifier.status(alice.f.routes!.act), 'valid');
});

test('every home serves the chain, its receipts, the routes and the encryption key', async () => {
  for (const h of homes) {
    const rec = await relayAt(h.base).identity(alice.id);
    assert.equal(rec.chain.length, 1);
    assert.equal(rec.receipts.length, 1);
    assert.equal(rec.routes.length, 1);
    assert.equal(rec.encryptionKeys.length, 1);
  }
});

test('the identity rotates: pending until the homes hold it, then it counts by majority', async () => {
  const path = join(dir, 'alice.json');
  const before = alice.f.binding;
  const rotation = await alice.prepareRotation();
  alice.save(path); // before sending: a retry sends the same bytes (rule 8a)
  await assert.rejects(alice.prepareRotation(), /never sign a second one/);

  const sent = await alice.submitRotation();
  assert.equal(sent.filter((s) => s.result?.receipt).length, 3);
  // Sending the same bytes again is harmless, and answers the same receipt.
  const again = await alice.submitRotation();
  assert.deepEqual(
    again.map((s) => s.result?.receipt),
    sent.map((s) => s.result?.receipt),
  );

  const { counts, lookup } = await alice.settleRotation();
  alice.save(path);
  assert.ok(counts);
  assert.equal(lookup.resolution.links.length, 2);
  assert.equal(lookup.resolution.links[1].act, rotation);
  assert.equal(lookup.resolution.links[1].how, 'homes');
  assert.equal(alice.f.binding, rotation);
  assert.notEqual(alice.f.binding, before);
  // The routes and encryption key made under the old key are kept by the rotation.
  assert.equal(lookup.verifier.status(alice.f.routes!.act), 'valid');
  assert.equal(lookup.encryptionKeyAct, alice.f.encryption[0].act);
});

test('with one home switched off, two of three still make a rotation count', async () => {
  await homes[2].stop();
  try {
    const rotation = await alice.prepareRotation();
    const sent = await alice.submitRotation();
    assert.equal(sent.filter((s) => s.result?.receipt).length, 2);
    assert.ok(sent.find((s) => s.home === homes[2].base)?.error);
    const { counts, lookup } = await alice.settleRotation();
    assert.ok(counts);
    assert.deepEqual(lookup.unreachable, [homes[2].base]);
    assert.equal(lookup.resolution.links.at(-1)?.act, rotation);
    // Everyday acts under the new key are valid.
    const r = await alice.publishRoutes([
      { scope: null, hints: [homes[0].base] },
      { scope: null, hints: [inbox.base], kind: 1 },
    ]);
    const l = await lookUp(alice.id, [homes[0].base]);
    assert.equal(l.verifier.status(r.id), 'valid');
    assert.equal(l.routes.act, r.id);
  } finally {
    await homes[2].start();
  }
  // The home comes back; the owner's client sends it what it missed, the same
  // bytes, and the other homes' receipts.
  assert.equal((await relayAt(homes[2].base).identity(alice.id)).chain.length, 2);
  await alice.spread();
  const rec = await relayAt(homes[2].base).identity(alice.id);
  assert.equal(rec.chain.length, 3);
  assert.equal(rec.receipts.length, 3, 'its own receipt for the rotation it missed');
  assert.ok(rec.otherReceipts.length >= 4, 'and the other homes\' receipts');
});

test('one home of three is not a majority: the rotation stays pending', async () => {
  await homes[1].stop();
  await homes[2].stop();
  try {
    const rotation = await alice.prepareRotation();
    const sent = await alice.submitRotation();
    assert.equal(sent.filter((s) => s.result?.receipt).length, 1);
    const { counts, lookup } = await alice.settleRotation();
    assert.equal(counts, false);
    // A reader reaching the one home left still counts the earlier rotations,
    // from the other homes' receipts it serves; the new one waits.
    assert.equal(lookup.resolution.links.length, 3);
    assert.equal(lookup.resolution.stop, 'pending');
    assert.deepEqual(lookup.resolution.waiting, [rotation]);
    assert.ok(alice.f.pending, 'kept pending, to resend unchanged');
  } finally {
    await homes[1].start();
    await homes[2].start();
  }
  // Resent unchanged once the homes are back: it counts.
  await alice.submitRotation();
  const { counts } = await alice.settleRotation();
  assert.ok(counts);
  alice.save(join(dir, 'alice.json'));
});

test('a key delivered to an identity opens only with its key', async () => {
  bob = await person('bob');
  // Alice publishes a private post on her outbox relay, then delivers its key to Bob.
  const payload = cborEncode(new Map([[0, 'for Bob only']]));
  const post = await alice.publish(SPECS.envelopes, 99, payload, { public: false, relays: [homes[0].base] });
  const d = await alice.deliverKey({ to: bob.id, hints: [homes[0].base], target: post.id, key: post.key });
  assert.deepEqual(d.inbox, [inbox.base]);

  // What the inbox relay sees: a container for Bob, from nobody it can name.
  const feed = await relayAt(inbox.base).feed({ to: bob.id });
  const item = feed.items.find((i) => i.kind === 'sealed');
  assert.ok(item);
  assert.ok(!Buffer.from(item.item).includes(Buffer.from(alice.id, 'hex')), 'the sender is hidden from relays');

  const got = await bob.readInbox({ inbox: [inbox.base], senderHints: [homes[0].base] });
  assert.equal(got.length, 1);
  const r = got[0];
  assert.ok(r.opened, r.error);
  assert.equal(r.from, alice.id);
  assert.equal(r.status, 'valid', 'the sender and her act, judged from her chain');
  assert.equal(r.delivery?.target, post.id);
  const bytes = await relayAt(homes[0].base).getAct(post.id);
  const opened = openWithKey(bytes!, r.delivery!.key);
  assert.deepEqual(opened.payload, payload);

  // Nobody else's key opens it: not Carol's, not Alice's own.
  const carol = await person('carol');
  const carolSecrets = carol.f.encryption.map((e) => Buffer.from(e.secret, 'hex'));
  const asBob = await receive(item.item, bob.id, carolSecrets.map((b) => new Uint8Array(b)), []);
  assert.equal(asBob.opened, false);
  const asCarol = await receive(item.item, carol.id, carolSecrets.map((b) => new Uint8Array(b)), []);
  assert.equal(asCarol.opened, false);
});

test('after Bob changes his encryption key, new deliveries use it and old ones still open', async () => {
  await bob.publishEncryptionKey();
  const l = await lookUp(bob.id, [homes[0].base]);
  assert.equal(l.encryptionKeyAct, bob.f.encryption[1].act);
  const post = await alice.publish(SPECS.envelopes, 99, cborEncode(new Map([[0, 'second']])), {
    public: false,
    relays: [homes[0].base],
  });
  await alice.deliverKey({ to: bob.id, hints: [homes[0].base], target: post.id, key: post.key });
  const got = await bob.readInbox({ inbox: [inbox.base], senderHints: [homes[0].base] });
  assert.equal(got.length, 2);
  assert.ok(got.every((g) => g.opened && g.status === 'valid'));
  // The new one opens only with the new key.
  const newest = (await relayAt(inbox.base).feed({ to: bob.id })).items.at(-1)!;
  const oldKey = new Uint8Array(Buffer.from(bob.f.encryption[0].secret, 'hex'));
  assert.equal((await receive(newest.item, bob.id, [oldKey], [])).opened, false);
});

test('a key delivered to a bare key is found by its pickup tag and opens only with it', async () => {
  const buyer = TestIdentity.newBareKey();
  const post = await alice.publish(SPECS.envelopes, 99, cborEncode(new Map([[0, 'bought']])), {
    public: false,
    relays: [homes[0].base],
  });
  await alice.deliverKeyToBare({ bareKey: buyer.public, relays: [inbox.base], target: post.id, key: post.key });
  const page = await relayAt(inbox.base).feed({ pickup: buyer.pickup });
  assert.equal(page.items.length, 1);
  const r = await receive(page.items[0].item, null, [buyer.secret], [homes[0].base]);
  assert.ok(r.opened, r.error);
  assert.equal(r.status, 'valid');
  assert.equal(r.delivery?.target, post.id);
  // Scanning finds it too, and another bare key does not open it.
  const scan = await relayAt(inbox.base).feed({ unaddressed: true });
  assert.ok(scan.items.some((i) => Buffer.compare(Buffer.from(i.item), Buffer.from(page.items[0].item)) === 0));
  const other = TestIdentity.newBareKey();
  assert.equal((await receive(page.items[0].item, null, [other.secret], [])).opened, false);
});

test('only Identity, Money and Agreements acts acknowledge; reliance is a witness act, explained first (F110)', async () => {
  const text = (t: string) => cborEncode(new Map([[0, t]]));
  const post = await bob.publish(SPECS.text, 0, text('I will repay you on Friday.'), { public: true, relays: [inbox.base] });
  // A reply that acknowledges: refused, never signed.
  await assert.rejects(
    alice.publish(SPECS.text, 0, text('+1'), { public: true, relays: [inbox.base], acks: [post.id] }),
    /witness act/,
  );
  // A witness act the owner was not shown: refused.
  await assert.rejects(alice.witness([post.id], { shown: 'Like' }), /shown/);
  // Explained, then signed: public, held by Alice's homes, valid for a reader.
  const w = await alice.witness([post.id], { shown: WITNESS_EXPLANATION, relays: [inbox.base] });
  for (const s of w.sent) assert.ok(s.result, `${s.home}: ${s.error}`);
  const l = await lookUp(alice.id, hints());
  l.verifier.add(w.act);
  assert.equal(l.verifier.status(w.id), 'valid');
  // Signing for someone else to submit is held to the same rule.
  assert.throws(() => alice.sign(SPECS.envelopes, 0, text('a publication'), { public: true, acks: [post.id] }), /witness act/);
});

test('a private link counts only once published at its signer\'s homes, where its owner sees it (F152, F159)', async () => {
  // Nothing at Alice's homes that she did not make.
  assert.deepEqual(await alice.unrecognised(), []);
  // A thief holding a copy of Alice's signing key confirms a link (Identity
  // type 7), privately, for Bob alone: a bank, shown "the same person".
  const thief = new TestIdentity(JSON.parse(JSON.stringify(alice.f)));
  const claim = 'ab'.repeat(32);
  const made = thief.sign(SPECS.identity, 7, cborEncode(new Map()), { public: false, to: [bob.id], objects: [[claim, claim]] });
  const shown = await lookUp(alice.id, hints());
  shown.verifier.addWithKey(made.act, made.key);
  assert.equal(shown.verifier.status(made.id), 'unknown', 'shown to one party only, it counts for nothing: unknown, never invalid');
  // To count, it must be published at the homes Alice's chain names at its
  // binding; there Alice's client sees it.
  await relayAt(homes[0].base).putAct(made.act);
  assert.deepEqual(await alice.unrecognised(), [{ id: made.id, home: homes[0].base, private: true }]);
  const found = await lookUp(alice.id, hints());
  found.verifier.addWithKey(made.act, made.key);
  assert.equal(found.verifier.status(made.id), 'valid');
  // What this reader found at the home is its own input: nothing binding
  // rests on that fetch alone (F159).
  assert.equal(found.verifier.bindingStatus(made.id), 'unknown');
});

test('every key exchange in these tests agrees with a second implementation (noble)', () => {
  const entries = kexLog.entries;
  const enc = entries.filter((e) => e.kind === 'encapsulate');
  const dec = entries.filter((e) => e.kind === 'decapsulate');
  assert.ok(enc.length >= 3 && dec.length >= 6, `${enc.length} encapsulations, ${dec.length} decapsulations`);
  for (const e of entries) {
    if (e.kind === 'encapsulate') {
      const a = xwingEncapsulate(e.publicKey, e.eseed);
      const b = noble.encapsulate(e.publicKey, e.eseed);
      assert.deepEqual(a.ct, e.ct, 'the capsule is what the core library makes');
      assert.deepEqual(b.cipherText, e.ct, 'and what noble makes');
      assert.deepEqual(a.ss, b.sharedSecret);
    } else {
      assert.deepEqual(xwingDecapsulate(e.secret, e.ct), noble.decapsulate(e.ct, e.secret));
    }
  }
});

// ------------------------------------------------------------ the clock (Money rule 15, F176 to F181)

/** A test anchoring cMIP on one reference: it records what it anchors. */
function testAnchoring(name: string, fails = false) {
  const reference = { cmip: sha256Hex('a test anchoring cMIP'), params: Buffer.from(cborEncode(name)).toString('hex') };
  const anchored: string[] = [];
  return {
    reference,
    anchored,
    async anchor(act: string): Promise<Uint8Array> {
      if (fails) throw new Error(`${name} is down`);
      anchored.push(act);
      return Uint8Array.from(Buffer.from(`${name}:${act}`));
    },
  };
}

function sha256Hex(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

test('after a rotation the owner\'s client anchors its home quorum on the declared clock, the backup only when the main fails (F179, F181)', async () => {
  const main = testAnchoring('the main clock');
  const backup = testAnchoring('the backup clock');
  const t = TestIdentity.create({ homes: homes.map((h) => h.home), clock: { main: main.reference, backup: backup.reference } });
  assert.equal(t.clockWarning(), null);
  for (const s of await t.publishGenesis()) assert.ok(s.result?.receipt, s.error);
  const l0 = await lookUp(t.id, hints());
  assert.equal(l0.verifier.status(t.id), 'valid', 'the genesis carrying a clock is valid');

  const r1 = await t.prepareRotation();
  const sent = await t.submitRotation();
  const receipts = sent.map((s) => actId(s.result!.receipt as Uint8Array)).sort();
  const one = await t.settleRotation([main, backup]);
  assert.ok(one.counts);
  assert.equal(one.unanchored, undefined);
  // The quorum the core names: each home's receipt for the rotation.
  const q = one.lookup.verifier.quorum(t.id, r1) as { kind: string; need: number; supports: string[][] };
  assert.equal(q.kind, 'homes');
  assert.equal(q.need, 2);
  assert.deepEqual(q.supports.flat().sort(), receipts);
  assert.deepEqual([...main.anchored].sort(), receipts, 'every receipt of the quorum, on the main clock');
  assert.deepEqual(backup.anchored, [], 'never on the backup while the main one works');
  assert.ok(one.anchored.every((a) => a.on === 'main'));
  assert.equal(t.f.anchored?.length, 3);

  // The main clock is down: the backup, once.
  const down = testAnchoring('the main clock', true);
  await t.prepareRotation();
  const sent2 = await t.submitRotation();
  const two = await t.settleRotation([down, backup]);
  assert.ok(two.counts);
  assert.deepEqual([...backup.anchored].sort(), sent2.map((s) => actId(s.result!.receipt as Uint8Array)).sort());
  assert.ok(two.anchored.every((a) => a.on === 'backup'));
  // Neither: the rotation counts, and the owner is told it is not anchored.
  await t.prepareRotation();
  await t.submitRotation();
  const three = await t.settleRotation([]);
  assert.ok(three.counts);
  assert.match(three.unanchored ?? '', /could not be anchored/);
});

test('before a genesis or rotation leaving no clock, the client says plainly that a theft\'s loss will be the owner\'s (Money rule 14b, F181)', async () => {
  const main = testAnchoring('the main clock');
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  assert.match(t.clockWarning() ?? '', /no clock.*your loss/s);
  assert.equal(t.clockWarning({ main: main.reference }), null, 'a rotation declaring one');
  const c = TestIdentity.create({ homes: homes.map((h) => h.home), clock: { main: main.reference } });
  assert.match(c.clockWarning(null) ?? '', /no clock/, 'a rotation removing it');
  for (const s of await t.publishGenesis()) assert.ok(s.result?.receipt, s.error);
  await t.prepareRotation();
  await t.submitRotation();
  const r = await t.settleRotation([main]);
  assert.ok(r.counts);
  assert.deepEqual(r.anchored, [], 'no clock declared: nothing to compare on');
  assert.deepEqual(main.anchored, []);
});

// ---------------------------------------------------------------- Identity rule 35 (was 17) in the clients

/** A text act's payload (Text MIR, type 0). */
const said = (text: string) => cborEncode(new Map([[0, text]]));

/** An identity whose acts are found at the relay its routes name, as an app's posts are. */
async function withLines(): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  for (const s of await t.publishGenesis()) assert.ok(s.result?.receipt, s.error);
  await t.publishRoutes([{ scope: null, hints: [inbox.base] }]);
  await t.publish(SPECS.text, 0, said('From the genesis client.'), { public: true, relays: [inbox.base] });
  return t;
}

/** Another app holding the same identity's signing key, keeping its own line (as MOR Post does). It holds no chain key. */
function otherApp(t: TestIdentity): TestIdentity {
  const f = structuredClone(t.f);
  return new TestIdentity({ ...f, sequence: [], routes: null, encryption: [], pending: null, safety: { scheme: 0, seeds: '' } });
}

/** An act's standing, as a reader holding every act of the identity at its homes and relay judges it. */
async function standing(t: TestIdentity, id: string, key?: Uint8Array): Promise<string> {
  const l = await lookUp(t.id, hints());
  for (const a of await actsBy(t.id, [...hints(), inbox.base])) {
    try {
      if (key && actId(a) === id) l.verifier.addWithKey(a, key);
      else l.verifier.add(a);
    } catch {
      // a private act this reader cannot open: held as it is, or not at all
    }
  }
  return l.verifier.status(id);
}

const rotate = async (t: TestIdentity, opts: Parameters<TestIdentity['prepareRotation']>[0] = {}) => {
  await t.prepareRotation(opts);
  await t.submitRotation();
  assert.ok((await t.settleRotation()).counts);
};

test('Identity rule 35 (was 17): before a rotation the client reads every line from the homes and relays, and keeps them all', async () => {
  const t = await withLines();
  const app = otherApp(t);
  const a1 = await app.publish(SPECS.text, 0, said('From another app.'), { public: true, relays: [inbox.base] });
  const a2 = await app.publish(SPECS.text, 0, said('From another app, again.'), { public: true, relays: [inbox.base] });
  const lines = await t.lines();
  assert.equal(lines.length, 2, 'this client’s line and the other app’s');
  const own = lines.find((l) => l.own)!;
  assert.deepEqual(own.card, ownLine(t.f.sequence).card, 'its own line, as its sequence holds it');
  const other = lines.find((l) => !l.own)!;
  assert.ok(other.readable);
  assert.deepEqual(other.card, ownLine(app.f.sequence).card, 'the other app’s line, followed back by prev: the same card it shows');
  assert.equal(other.tip, a2.id);
  assert.match(other.latest, /a text/);
  await rotate(t);
  for (const id of [a1.id, a2.id, ...t.f.sequence]) assert.equal(await standing(t, id), 'valid', id);
});

test('a line left out on purpose: the client warns that its acts become void, and only then leaves it out', async () => {
  const t = await withLines();
  const app = otherApp(t);
  const a1 = await app.publish(SPECS.text, 0, said('A line the owner does not recognise.'), { public: true, relays: [inbox.base] });
  const other = (await t.lines()).find((l) => !l.own)!;
  // Not without the warning, shown and passed back.
  await assert.rejects(t.prepareRotation({ leaveOut: [other.tip] }), /Nothing was signed.*becomes void/s);
  assert.equal(t.f.pending, null, 'nothing signed');
  const { plan } = await t.planRotation({ leaveOut: [other.tip] });
  assert.match(plan.warning!, new RegExp(`${other.tip}.*becomes void`, 's'));
  assert.ok(plan.shown.some((l) => l.tone === 'bad' && /Left out by name/.test(l.text)));
  await assert.rejects(t.prepareRotation({ leaveOut: [other.tip], warned: 'something else' }), /Nothing was signed/);
  await rotate(t, { leaveOut: [other.tip], warned: plan.warning! });
  assert.notEqual(await standing(t, a1.id), 'valid', 'left out: void');
  assert.equal(await standing(t, t.f.sequence.at(-1)!), 'valid', 'its own line kept');
  await assert.rejects(t.planRotation({ leaveOut: ['00'.repeat(32)] }), /no line found ends at/);
});

test('a line this client cannot read (a private act made elsewhere) is shown as such, and its card asked for and accepted', async () => {
  const t = await withLines();
  const app = otherApp(t);
  const p1 = await app.publish(SPECS.text, 0, said('Public, from another app.'), { public: true, relays: [inbox.base] });
  const x = await app.publish(SPECS.text, 0, said('Private, from another app.'), { public: false, relays: [inbox.base] });
  const lines = await t.lines();
  const unread = lines.find((l) => l.tip === x.id) as FoundLine;
  assert.ok(unread, 'shown');
  assert.equal(unread.readable, false);
  assert.equal(unread.card, null);
  assert.match(unread.why ?? '', /private act made elsewhere/);
  assert.match(unread.latest, /private/);
  // Asked for, never refused, never a warning alone: given nothing, it is
  // left out only after the warning.
  const asked = await t.planRotation();
  assert.ok(asked.plan.shown.some((l) => /cannot read.*Give its card/s.test(l.text)));
  assert.match(asked.plan.warning ?? '', new RegExp(`${x.id}.*becomes void`, 's'));
  await assert.rejects(t.prepareRotation(), /Nothing was signed/);
  // A card that contradicts a line read here is refused.
  await assert.rejects(t.planRotation({ cards: [{ act: p1.id, position: 2, summary: '00'.repeat(32) }] }), /does not match/);
  // Its card, copied from the app that made it: kept.
  const card = ownLine(app.f.sequence).card!;
  const { plan } = await t.planRotation({ cards: [card] });
  assert.equal(plan.warning, null, 'nothing left out');
  assert.ok(plan.kept.some((k) => k.act === x.id && k.position === 2));
  await rotate(t, { cards: [card] });
  assert.equal(await standing(t, x.id, x.key), 'valid', 'the private act, kept by its card');
  assert.equal(await standing(t, p1.id), 'valid');
});
