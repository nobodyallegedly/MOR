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
import { join } from 'node:path';
import { ml_kem768_x25519 as noble } from '@noble/post-quantum/hybrid.js';
import { start, type Running } from './world.ts';
import { TestIdentity, lookUp, receive, TEST_LABEL } from '../src/identity.ts';
import { SPECS, WITNESS_EXPLANATION, cborEncode, openWithKey, xwingDecapsulate, xwingEncapsulate } from '../src/core.ts';
import { kexLog } from '../src/kex.ts';
import { relayAt } from '../src/transport.ts';

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
  assert.deepEqual(l.inbox(SPECS.envelope), [inbox.base]);
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
  const rotation = alice.prepareRotation();
  alice.save(path); // before sending: a retry sends the same bytes (rule 8a)
  assert.throws(() => alice.prepareRotation(), /never sign a second one/);

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
    const rotation = alice.prepareRotation();
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
    const rotation = alice.prepareRotation();
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
  const post = await alice.publish(SPECS.envelope, 99, payload, { public: false, relays: [homes[0].base] });
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
  const post = await alice.publish(SPECS.envelope, 99, cborEncode(new Map([[0, 'second']])), {
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
  const post = await alice.publish(SPECS.envelope, 99, cborEncode(new Map([[0, 'bought']])), {
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

test('only Identity, Finance and Law acts acknowledge; reliance is a witness act, explained first (F110)', async () => {
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
  assert.throws(() => alice.sign(SPECS.envelope, 0, text('a publication'), { public: true, acks: [post.id] }), /witness act/);
});

test('a private link counts only once published at its signer\'s homes, where its owner sees it (F152)', async () => {
  // Nothing at Alice's homes that she did not make.
  assert.deepEqual(await alice.unrecognised(), []);
  // A thief holding a copy of Alice's signing key confirms a link (Identity
  // type 7), privately, for Bob alone: a bank, shown "the same person".
  const thief = new TestIdentity(JSON.parse(JSON.stringify(alice.f)));
  const claim = 'ab'.repeat(32);
  const made = thief.sign(SPECS.identity, 7, cborEncode(new Map()), { public: false, to: [bob.id], objects: [[claim, claim]] });
  const shown = await lookUp(alice.id, hints());
  shown.verifier.addWithKey(made.act, made.key);
  assert.equal(shown.verifier.status(made.id), 'invalid', 'shown to one party only, it counts for nothing');
  // To count, it must be published at Alice's homes; there Alice's client sees it.
  await relayAt(homes[0].base).putAct(made.act);
  assert.deepEqual(await alice.unrecognised(), [{ id: made.id, home: homes[0].base, private: true }]);
  const found = await lookUp(alice.id, hints());
  found.verifier.addWithKey(made.act, made.key);
  assert.equal(found.verifier.status(made.id), 'valid');
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
