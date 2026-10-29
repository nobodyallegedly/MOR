// The Dubsar runner, draft 3 (`cmips/cmip-runner-draft-3.md`; decided by
// Nobody, allegedly, 22 October 2026): opening chosen per identity, per app;
// Kišib holding an identity's own keys for its collectives and signing with
// them through its panel; the key of a payment made under the app's own lane
// delivered to the identity itself without a panel. Kišib's program, Dub's
// and Damgar's talk as they do on the Mac, against real homes and a relay on
// local ports.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { asking, clickPanel, closeAll, dub, dubBeside, everything, kishib, refused, runnerOn, start, type Relay } from './world.ts';
import { describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { idForm } from '../../genesis/src/forms.ts';
import { closeAll as closeOthers, dub as dubOf, edubba, person, testLink } from '../../damgar/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import { foundCollective } from '../../desk/test/cast.ts';
import { readMemberKeys } from '../../grants/src/member.ts';
import type { Done } from '../../desk/src/page/api.ts';
import type { LaneShown, ToSign } from '../../damgar/src/shapes.ts';
import { RUNNER_NO_OPEN_SAY } from '../../dub/src/dub.ts';
import { NO_MEMBER_SAY, type RunnerView } from '../src/runner.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  await closeOthers();
  for (const h of [...homes, relay]) await h.stop();
});

const secretForms = (b: Uint8Array) => [Buffer.from(b).toString('hex'), Buffer.from(b).toString('base64')];

const state = (c: { ask<T>(op: string, a?: unknown): Promise<T> }) => c.ask<RunnerView>('runner state');

test('opening per identity, per app: two identities used through Kišib by Dub, one allowed and one not; one’s private message read, the other’s not, said plainly', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const b = await dub(H, [relay.base]);
  const other = await dub(H, [relay.base]);
  const k = await kishib();
  await runnerOn(k.c);
  for (const x of [a, b]) await k.c.ask('runner give', { id: x.id, address: H[0], words: (await x.c.ask<{ words: string[] }>('carry')).words.join(' ') });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  // Approved for both identities; opening chosen for A only.
  const v = await k.c.ask<RunnerView>('runner approve', { pairing: p.id, identities: [a.id, b.id], opens: [a.id] });
  assert.deepEqual(v.apps[0].opens, [a.id]);
  await other.c.ask('message', { to: a.id, text: 'For A, sealed.' });
  await other.c.ask('message', { to: b.id, text: 'For B, sealed.' });

  // A: read.
  await d.c.ask('runner take', { id: a.id });
  const boxA = await d.c.ask<{ messages: { text: string }[]; encryption: boolean; opening: string | null }>('inbox');
  assert.equal(boxA.encryption, true);
  assert.ok(boxA.messages.some((m) => m.text === 'For A, sealed.'));
  // B: not read, said plainly.
  await d.c.ask('runner take', { id: b.id });
  let boxB = await d.c.ask<{ messages: { text: string; problem: string | null }[]; encryption: boolean; opening: string | null }>('inbox');
  assert.equal(boxB.encryption, false);
  assert.equal(boxB.opening, RUNNER_NO_OPEN_SAY);
  assert.ok(!boxB.messages.some((m) => m.text === 'For B, sealed.'));
  // Opened only for A, in Kišib's Signed.
  assert.ok((await state(k.c)).signed.filter((s) => s.opened).every((s) => s.identity === a.id));
  // B allowed, for this app and this identity only: then read.
  await k.c.ask('runner opening', { pairing: p.id, identity: b.id, on: true });
  assert.deepEqual((await state(k.c)).apps[0].opens.sort(), [a.id, b.id].sort());
  boxB = await d.c.ask('inbox');
  assert.ok(boxB.messages.some((m) => m.text === 'For B, sealed.'));
});

test('member keys: an identity used through Kišib, a member of a collective; its key added in Kišib; a post as the collective from Dub signed through the panel with the member key; nothing of the key in the clear or in Dub', async () => {
  const H = homes.map((h) => h.base);
  const e = await edubba(H, [relay.base]);
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const max = await dubOf(H, [relay.base]);
  const pa = await dubOf(H, [relay.base]);
  const { collective } = await foundCollective(e, A, [max, pa], [{ name: 'Posts', layer: 1, holders: [A, max.id, pa.id], number: 1 }], { name: 'Collective Y' });
  // Max's own member key, sealed to Max at its homes.
  const keys = await readMemberKeys(max.id, [encryptionSecret(fromWords(max.words))], H);
  assert.equal(keys.length, 1);
  const secret = keys[0].secret;

  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: max.id, address: H[0], words: max.words });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  await k.c.ask('runner approve', { pairing: p.id, identities: [max.id] });
  await d.c.ask('runner take', { id: max.id });

  // Dub asks Kišib to add the collective's key: waiting in Kišib.
  const added = await d.c.ask<{ lines: { text: string }[] }>('collective add', { id: collective });
  assert.match(added.lines[0].text, /asked Kišib to add it/);
  await refused(d.c.ask('act as', { id: collective }), /asked Kišib to add it/);
  let v = await state(k.c);
  assert.equal(v.memberAsks.length, 1);
  assert.equal(v.memberAsks[0].collective, collective);
  // Approved in Kišib: Kišib opens it from Max's homes and keeps it with Max.
  v = await k.c.ask<RunnerView>('runner member answer', { ask: v.memberAsks[0].id, yes: true });
  assert.deepEqual(v.held[0].members.map((m) => m.collective), [collective]);

  // Acting as the collective in Dub: a post, Kišib's panel, signed with the member key.
  await d.c.ask('act as', { id: collective });
  const posting = d.c.ask<{ post: { id: string }; lines: { text: string }[] }>('post', { text: 'From the collective, through Kišib.' });
  const ask = await asking(d.c);
  assert.equal(ask.title, 'Dub asks Kišib to sign a post as a collective');
  const html = await (await fetch(ask.panel, { headers: { 'sec-fetch-dest': 'iframe' } })).text();
  assert.match(html, /As the collective/);
  assert.match(html, /own member key/);
  // Which key signs, said plainly: Max's own member key for the collective, the collective's ID and Max's each a tap showing it whole.
  assert.match(html, /signed with [^<]+’s own member key for it/);
  assert.ok(html.includes(`<span class="k-whole">${idForm(collective)}</span>`), 'the collective’s ID, a tap');
  assert.ok(html.includes(`<span class="k-whole">${idForm(max.id)}</span>`), 'the member’s ID, a tap');
  const waits = (await state(k.c)).waiting;
  assert.match(waits[0].as ?? '', new RegExp(`^As the collective .*${idForm(collective)}, signed with .*own member key for it \\(${idForm(max.id)}\\)`));
  assert.ok(!/Always yes/.test(html), 'an act as a collective always shows the panel');
  assert.match(await clickPanel(ask.panel, 'sign'), /Signed/);
  const posted = await posting;
  assert.match(posted.lines[0].text, /Posted as the collective/);
  // The act at the relays: signed by the collective, bound to Max's signature naming the member key.
  const bytes = await relayAt(relay.base).getAct(posted.post.id);
  const dsc = describeAct(bytes!) as { signer: string; binding: string };
  assert.equal(dsc.signer, collective);
  assert.equal(dsc.binding, keys[0].signature);
  v = await state(k.c);
  assert.equal(v.signed[0].as, collective);

  // Nothing of the member key in Kišib's folder in the clear, nor anywhere in Dub's.
  for (const f of secretForms(secret)) {
    assert.ok(!everything(k.dir).includes(f), 'no member key in Kišib’s folder in the clear');
    assert.ok(!everything(d.dir).includes(f), 'no member key in Dub’s folder');
  }
});

test('an act as a collective whose key Kišib does not hold is refused, said', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words: (await a.c.ask<{ words: string[] }>('carry')).words.join(' ') });
  const probe = k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  k.app.runner.approve({ pairing: probe.pairing, identities: [a.id] });
  const req = { identity: a.id, as: 'cd'.repeat(32), line: 'member' as const, binding: 'ef'.repeat(32), sequence: [], spec: 'ab'.repeat(32), type: 0, payload: new Uint8Array([0xa0]), public: true };
  await assert.rejects(k.app.runner.ask(probe.token, req, 'http://127.0.0.1:1'), (e: Error) => e.message === NO_MEMBER_SAY);
  // What it gives an app of the identity: never a secret.
  const said = JSON.stringify(k.app.runner.paired(probe.token));
  const seed = fromWords((await a.c.ask<{ words: string[] }>('carry')).words.join(' '));
  for (const f of [...secretForms(seed), ...secretForms(encryptionSecret(seed))]) assert.ok(!said.includes(f));
});

test('lanes through Kišib: a payment under Dub’s lane, its key delivered to the identity by Kišib with no panel, counted in Signed; Damgar keeping the record; any other key delivery still asking', async () => {
  const H = homes.map((h) => h.base);
  const R = SPEC.units.regtest;
  const node = new TestNode();
  const link = testLink(node);
  const alice = await person(H, [relay.base]);
  const bob = await person(H, [relay.base], { link: link.factory });
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' });

  // Alice's words in Kišib; a Dub beside it using Alice through Kišib.
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: alice.id, address: H[0], words: alice.dub.words });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await state(k.c)).apps[0];
  // Opening allowed for Alice: Dub reads what she accepts (sealed to herself), as it does for an identity it holds.
  await k.c.ask('runner approve', { pairing: p.id, identities: [alice.id], opens: [alice.id] });
  await d.c.ask('runner take', { id: alice.id });

  // The lane asked from that Dub: a money act, asked in Kišib's panel.
  const askingLane = d.c.ask('lane ask', { label: 'Dub through Kišib', cap: '2000', unit: R });
  assert.match(await clickPanel((await asking(d.c)).panel, 'sign'), /Signed/);
  await askingLane;
  // Granted in Alice's Damgar, which holds her words.
  await alice.damgar.c.ask('look');
  const lane = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  assert.ok(lane, 'the lane waits in Damgar');
  await alice.damgar.c.ask('grant lane', { id: lane.id });

  // A tip under the lane, from the Dub using Alice through Kišib: no panel at all.
  const before = (await state(k.c)).signed.length;
  const t = await d.c.ask<{ lines: { text: string }[] }>('tip now', { post: post.post.id, signer: bob.id, value: '1500', unit: R, whatFor: 'for the post' });
  assert.match(t.lines[0].text, /under the lane/);
  assert.equal((await d.c.ask<{ asking: unknown }>('runner asking')).asking, null, 'no panel was asked for');
  const v = await state(k.c);
  const rec = v.signed.slice(0, v.signed.length - before).find((s) => s.lane);
  assert.ok(rec, JSON.stringify(v.signed.slice(0, 3)));
  assert.equal(rec.standing, true);
  assert.equal(rec.app, 'Dub');
  assert.match(rec.words.join(' '), /under its own lane, delivered to the identity itself/);
  assert.match(rec.words.join(' '), /moves no money/);

  // Damgar keeps the record: the payment read, nothing left sealed.
  await alice.damgar.c.ask('look');
  const al = (await alice.damgar.c.ask<{ lanes: LaneShown[] }>('lanes')).lanes.find((l) => l.label === 'Dub through Kišib')!;
  assert.equal(al.payments?.length, 1, JSON.stringify(al));
  assert.equal(al.sealed ?? 0, 0);

  // Any other key delivery to the identity itself still asks: a key for an act that is no lane's.
  const probe = k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  k.app.runner.approve({ pairing: probe.pairing, identities: [alice.id] });
  const { keyDeliveryPayload, ENVELOPES_TYPES, SPECS } = await import('../../genesis/src/core.ts');
  const look = k.app.runner.paired(probe.token);
  const binding = look.identities[0].binding;
  const answer = await k.app.runner.ask(
    probe.token,
    { identity: alice.id, line: 'apart', binding, sequence: [], spec: SPECS.envelopes, type: ENVELOPES_TYPES.keyDelivery, payload: keyDeliveryPayload(post.post.id, new Uint8Array(32), false), public: false, to: [alice.id] },
    'http://127.0.0.1:1',
  );
  assert.ok('asks' in answer, 'a key delivery that is no lane’s record asks in the panel');
});
