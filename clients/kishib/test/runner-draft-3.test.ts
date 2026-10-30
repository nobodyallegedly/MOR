// The Dubsar runner, draft 3 (`cmips/cmip-runner-draft-3.md`; decided by
// Nobody, allegedly, 22 October 2026): opening chosen per identity, per app;
// the key of a payment made under the app's own lane
// delivered to the identity itself without a panel. Kišib's program, Dub's
// and Damgar's talk as they do on the Mac, against real homes and a relay on
// local ports. Draft 3's member keys are gone (draft 5): see below.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { asking, clickPanel, closeAll, dub, dubBeside, everything, kishib, refused, runnerOn, start, type Relay, stopAll } from './world.ts';
import { describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { idForm } from '../../genesis/src/forms.ts';
import { closeAll as closeOthers, dub as dubOf, edubba, person, testLink } from '../../damgar/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { LaneShown, ToSign } from '../../damgar/src/shapes.ts';
import { RUNNER_NO_OPEN_SAY } from '../../dub/src/dub.ts';
import type { RunnerView } from '../src/runner.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  // Part 4: every program, page and server this file started, stopped whatever the outcome (`world.ts`, stopAll).
  await stopAll(() => closeOthers());
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

// Draft 3's two member-key tests ("member keys: … signed through the panel with the member key" and
// "an act as a collective whose key Kišib does not hold is refused") are replaced: their premise, a
// member key per collective held in Kišib, no longer exists (the redesign: no member keys, Agreements
// rule 58). Their new equivalents, asserting the new rule (the member's own key, the collective named in
// the act's objects, the panel always; draft 3's member line and ask refused), are in
// `runner-draft-5.test.ts`, the founding row kept as it was here.

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
