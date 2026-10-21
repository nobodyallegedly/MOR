// H80 (sitting 5 of the walkthrough): after a change of keys in Kišib,
// Edubba signed a reliance with the retired key. Against real homes and a
// relay on local ports, an identity whose chain key is on paper, brought
// into Edubba by its signing key's words, has its keys changed in Kišib;
// then every path of Edubba that signs with its own key refuses, in the
// same plain words (KEY_CHANGED_SAY), and nothing reaches any home or
// relay. Wrong words are refused and nothing is kept; the new words, given,
// let the next act sign. The shared key delivery (Dub's `delivery.ts`, used
// by Edubba's Publishing tab) refuses through its own check too.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { describeAct, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { post as postAs } from '../../barebone/src/post.ts';
import { encryptionSecret, toWords } from '../../../modules/carry/src/carry.ts';
import { deliverKey } from '../../dub/src/delivery.ts';
import { Kishib } from '../../kishib/src/kishib.ts';
import { chainKeyAt } from '../../kishib/src/words.ts';
import { newWordsHere } from '../../kishib/test/world.ts';
import { serve, type Running } from '../src/server.ts';
import { KEY_CHANGED_SAY } from '../src/desk.ts';
import { Client, newKey } from '../src/page/api.ts';

let homes: Relay[];
let relay: Relay;
let app: Running;
let c: Client;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  app = await serve({ dir: join(mkdtempSync(join(tmpdir(), 'edubba-h80-')), 'edubba'), port: 0, machineEvery: 0, drafts: mkdtempSync(join(tmpdir(), 'edubba-h80-drafts-')) });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'h80' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
});

after(async () => {
  await app.close();
  for (const h of [...homes, relay]) await h.stop();
});

/** Every act signed by `id` that the homes and the relay hold: where, and its ID. */
async function held(id: string): Promise<Set<string>> {
  const out = new Set<string>();
  for (const h of [...homes.map((x) => x.base), relay.base]) {
    let after: number | undefined;
    for (;;) {
      const page = await relayAt(h).feed({ signer: id, after });
      for (const it of page.items) if (it.kind === 'act') out.add(`${h} ${(describeAct(it.item) as { id: string }).id}`);
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  return out;
}

/** An identity made by the genesis client, its chain key on paper (the words seed Module, key 0), with routes and an encryption key. */
async function made(): Promise<{ g: TestIdentity; seed: Uint8Array }> {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const key0 = chainKeyAt(seed, 3, 0);
  const g = TestIdentity.create({ homes: homes.map((h) => h.home), chainKey: { scheme: 3, seeds: key0.seeds, commit: key0.commit } });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }, { scope: null, hints: [relay.base], kind: 1 }]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  return { g, seed };
}

const refusedChanged = async (p: Promise<unknown>, what: string) => {
  await assert.rejects(p, (e: Error) => {
    assert.ok(e.message.startsWith(KEY_CHANGED_SAY), `${what}: ${e.message}`);
    assert.match(e.message, /Nothing was signed\.$/, what);
    return true;
  });
};

test('H80: after a change of keys in Kišib, every path of Edubba that signs with the identity’s own key refuses, in the same words, and nothing reaches any home; the new words, given where the warning is, let it sign again', async () => {
  const H = homes.map((h) => h.base);
  const { g, seed } = await made();
  const other = (await made()).g;
  const theirs = await postAs(other, { text: 'Someone else’s post, to rely on.', relays: [relay.base] });
  const mine = await postAs(g, { text: 'A post of its own, to correct later.', relays: [relay.base] });
  const oldWords = toWords(unhex(g.f.signingSecret)).join(' ');
  await c.ask('bring', { name: 'Changed in Kišib', id: g.id, words: oldWords, address: H[0], linked: false });

  // Before the change: Edubba relies on the act, and it counts.
  const read = await c.ask<{ explanation: string }>('read act', { identity: g.id, act: theirs.id });
  const before1 = await c.ask<{ id: string }>('witness', { identity: g.id, act: theirs.id, shown: read.explanation, typed: 'RELY' });
  {
    const l = await lookUp(g.id, [...H, relay.base]);
    l.verifier.add((await relayAt(relay.base).getAct(before1.id))!);
    assert.equal(l.verifier.status(before1.id), 'valid');
  }

  // Kišib changes its keys from the paper words; Edubba is not told.
  const k = new Kishib();
  const r = await k.rotatePlan({ id: g.id, address: H[0], words: toWords(seed).join(' ') });
  let s = await k.confirm({ plan: r.plan, digest: r.digest, ...(r.warning ? { warned: r.warning } : {}) });
  for (let i = 0; (s.sitting!.stage as string) === 'sent' && i < 3; i++) s = await k.resend();
  assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
  const fresh = newWordsHere(k);

  // On opening, said, with the kind of key (the page offers the box for the new words beside it).
  const changed = await c.ask<{ id: string; say: string; kind: string }[]>('keys check');
  assert.deepEqual(changed.map((x) => [x.id, x.kind]), [[g.id, 'identity']]);
  assert.equal(changed[0].say, KEY_CHANGED_SAY);

  const atHomes = await held(g.id);

  // The reliance (H80 itself): refused as the correction is, nothing signed.
  await refusedChanged(c.ask('witness', { identity: g.id, act: theirs.id, shown: read.explanation, typed: 'RELY' }), 'the reliance');
  // A correction (it always checked).
  await refusedChanged(c.ask('identity correct', { identity: g.id, act: mine.id, text: 'A correction.' }), 'a correction');
  // A payment prepared for Damgar, sealed to itself.
  const unit = (await c.ask<{ hash: string }[]>('money units'))[0].hash;
  await refusedChanged(c.ask('money pay', { identity: g.id, to: other.id, value: '5', unit, whatFor: '' }), 'a payment prepared for Damgar');
  // Publishing as itself: a protected work, and a vow.
  await c.ask('publishing act as', { id: g.id });
  const work = await c.ask<{ plan: string; digest: string; reading: { blocking: string[] } }>('publishing work read', { media: 'text', data: Buffer.from('A recipe, sealed.').toString('base64'), title: 'A recipe', price: '1000' });
  assert.deepEqual(work.reading.blocking, []);
  await refusedChanged(c.ask('publishing confirm', { plan: work.plan, digest: work.digest }), 'a protected work published as itself');
  const vow = await c.ask<{ plan: string; digest: string; reading: { blocking: string[] } }>('publishing vow read', { words: 'I will read your tablet aloud.', title: 'A reading', price: '500' });
  assert.deepEqual(vow.reading.blocking, []);
  await refusedChanged(c.ask('publishing confirm', { plan: vow.plan, digest: vow.digest }), 'a vow published as itself');
  // A sale contested, and a sale confirmed (prepared for Damgar), as the buyer.
  const some = '7'.repeat(64);
  await refusedChanged(c.ask('publishing contest', { vow: some, sale: some, buyer: g.id, promise: '' }), 'a sale contested');
  await refusedChanged(c.ask('publishing confirm sale', { vow: some, sale: some, buyer: g.id, seller: other.id, unit, value: 500 }), 'a sale confirmed');
  // Founding a real collective: the founder's own key proposes and signs.
  const founding = await c.ask<{ plan: string; digest: string; reading: { blocking: string[] } }>('real found prepare', { name: 'Two tablets', founder: g.id, members: [other.id], safety: 1, release: 1, clone: 2, others: 1 });
  assert.deepEqual(founding.reading.blocking, []);
  await refusedChanged(c.ask('real confirm', { plan: founding.plan, digest: founding.digest }), 'a founding');

  // Nothing reached any home or the relay.
  assert.deepEqual([...(await held(g.id))].sort(), [...atHomes].sort(), 'nothing signed with the retired key reached a home or the relay');

  // The key delivery Edubba's Publishing tab and Dub share refuses through its own check, before signing.
  const seq = g.f.sequence.length;
  await assert.rejects(deliverKey(g, other.id, some, '00'.repeat(32), { relays: [relay.base], via: {}, save: () => undefined, current: async () => { throw new Error(`${KEY_CHANGED_SAY} Nothing was signed.`); } }), /changed elsewhere/);
  assert.equal(g.f.sequence.length, seq, 'the delivery was not signed');

  // The new words, where the warning is: wrong words (the old signing key's, or the new chain key's) refused, nothing kept.
  await assert.rejects(c.ask('identity renew', { identity: g.id, words: oldWords }), /already holds/);
  await assert.rejects(c.ask('identity renew', { identity: g.id, words: fresh.chain.join(' ') }), /current signing key/);
  assert.equal((await c.ask<unknown[]>('keys check')).length, 1, 'still the old key: nothing kept');
  await refusedChanged(c.ask('witness', { identity: g.id, act: theirs.id, shown: read.explanation, typed: 'RELY' }), 'the reliance, still');
  // The right words: taken, and the next reliance signs, valid.
  await c.ask('identity renew', { identity: g.id, words: fresh.signing.join(' ') });
  assert.deepEqual(await c.ask('keys check'), []);
  const after1 = await c.ask<{ id: string }>('witness', { identity: g.id, act: theirs.id, shown: read.explanation, typed: 'RELY' });
  const l = await lookUp(g.id, [...H, relay.base]);
  l.verifier.add((await relayAt(relay.base).getAct(after1.id))!);
  assert.equal(l.verifier.status(after1.id), 'valid', 'signed with the new key, in a new line');
});
