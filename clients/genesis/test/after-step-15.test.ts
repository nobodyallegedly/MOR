// The step 15 decisions as a client meets them, through the core library's
// WebAssembly (Envelopes draft 10, Text draft 8; the freeze suite v28,
// "Envelopes and Text"):
//
// - Fable's E5, the clients' half: a client's verifier is told the Envelopes
//   and Text hashes, which every client holds, so a text act carrying `acks`
//   is invalid to it even without the Money and Agreements hashes.
// - F295, F296: a text act outside its format is invalid to every client.
//   Text rule 14 (draft 11) since allows exactly one object, [grantor, grant]
//   or [collective, decision]: a text act naming one chain in objects is
//   unknown to a verifier that does not hold that chain or does not read
//   Agreements, and any other objects (two of them) are invalid.
// - Fable's T5: a client composes text with the pinned Unicode tables, the
//   ones the core checks with (`nfc`).
// - F293: a sealed container is `[to, locked-act]`, no one-time key.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { start, type Running } from './world.ts';
import { TestIdentity } from '../src/identity.ts';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MIRS, SPECS, Verifier, cborDecode, cborEncode, makeEveryday, nfc, unhex } from '../src/core.ts';
import { compose } from '../../longform/src/text.ts';
import { sealFor, receive } from '../src/identity.ts';

let home: Running;
let writer: TestIdentity;

before(async () => {
  home = await start('home');
  writer = TestIdentity.create({ homes: [home.home] });
  await writer.publishGenesis();
});

after(async () => {
  await home.stop();
});

const text = (t: string, extra?: [number, unknown]) => cborEncode(new Map<number, unknown>([[0, t], ...(extra ? [extra] : [])]));

const verifier = (withHashes: boolean) => {
  const v = withHashes ? new Verifier(SPECS.identity, undefined, undefined, MIRS.envelopes, MIRS.text) : new Verifier(SPECS.identity);
  for (const a of writer.chainActs()) v.add(a);
  return v;
};

test('E5: a text act carrying acks is invalid to a client told the Envelopes and Text hashes, without Money and Agreements', async () => {
  const post = await writer.publish(SPECS.text, 0, text('a post'), { public: true, relays: [] });
  // This client refuses to make one (F110); another, careless, might: the
  // same identity's file, used through the core directly.
  const file = join(mkdtempSync(join(tmpdir(), 'mor-e5-')), 'writer.json');
  writer.save(file);
  const f = JSON.parse(readFileSync(file, 'utf8'));
  const like = makeEveryday({
    signingSecret: unhex(f.signingSecret),
    signer: f.identity,
    binding: f.binding,
    spec: SPECS.text,
    type: 0,
    payload: text('a like'),
    sequence: f.sequence,
    public: true,
    acks: [post.id],
  }) as { act: Uint8Array; id: string };
  const told = verifier(true);
  told.add(post.act);
  told.add(like.act);
  assert.equal(told.status(post.id), 'valid');
  assert.equal(told.status(like.id), 'invalid');
  const blind = verifier(false);
  blind.add(post.act);
  blind.add(like.act);
  assert.equal(blind.status(like.id), 'unknown', 'without the hashes it cannot tell');
});

test('F295, F296: a text act outside its format, or carrying more than one object, is invalid to every client; one object naming a chain not held is unknown (Text rule 14)', async () => {
  const v = verifier(true);
  const good = await writer.publish(SPECS.text, 0, text('fine', [1, new Uint8Array(32)]), { public: true, relays: [] });
  v.add(good.act);
  assert.equal(v.status(good.id), 'valid');
  const cases: [string, number, Uint8Array, [string, string][] | undefined][] = [
    ['no text', 0, cborEncode(new Map()), undefined],
    ['a field 2', 0, text('x', [2, 1]), undefined],
    ['field 0 not text', 0, cborEncode(new Map([[0, new Uint8Array([1])]])), undefined],
    ['a type Text does not define', 3, text('x'), undefined],
    // The premise changed (Text rule 14, draft 11): one object is no longer
    // invalid in itself, since a grantee's [grantor, grant] or a member's
    // [collective, decision] is allowed. Two objects are no allowed shape,
    // whatever they name, so they stay invalid to every client.
    ['two objects', 0, text('a reply in a thread'), [[good.id, good.id], [writer.id, good.id]]],
  ];
  for (const [what, type, payload, objects] of cases) {
    const a = await writer.publish(SPECS.text, type, payload, { public: true, relays: [], objects });
    v.add(a.act);
    assert.equal(v.status(a.id), 'invalid', what);
  }
  // One object naming a chain this verifier does not hold (and it reads no
  // Agreements): it cannot tell a collective's decision from anything else,
  // so it answers unknown, never valid (Text rule 14, the last sentences).
  const one = await writer.publish(SPECS.text, 0, text('a reply in a thread'), { public: true, relays: [], objects: [[good.id, good.id]] });
  v.add(one.act);
  assert.equal(v.status(one.id), 'unknown', 'one object naming a chain not held');
});

test('T5: compose normalizes with the pinned tables, as the core checks', () => {
  assert.equal(nfc('é'), 'é');
  const c = compose('café');
  assert.equal(c.text, 'café');
  assert.ok(c.changes.includes('normalized to NFC'));
});

test('F293: a sealed container is [to, locked-act], and still opens for its recipient', async () => {
  const bare = TestIdentity.newBareKey();
  const msg = await writer.publish(SPECS.text, 0, text('to a bare key'), { public: true, relays: [] });
  const sealed = sealFor(msg.act, undefined, [{ key: bare.public }]);
  const parts = cborDecode(sealed) as unknown[];
  assert.equal(parts.length, 2, 'no one-time key, no signature');
  const got = await receive(sealed, null, [bare.secret], [home.base]);
  assert.equal(got.opened, true, got.error);
  assert.equal(got.text, 'to a bare key');
  assert.equal(got.status, 'valid');
});
