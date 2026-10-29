// The Dubsar clock, relied on by every app by default (decided by Nobody,
// allegedly, 23 October 2026: "For now, the dubsar suite relies on the
// dubsar timestamp clock module with optional anchoring to BTC"). A test
// clock stands in for it, named in this program's memory only (its real
// identity is not in the repository). In Dub's feed: a post the clock
// stamped shows its time, "by the Dubsar clock", and sorts by it; a post not
// yet stamped shows the signer's own hint, labelled as the signer's; one
// with neither shows no time. Edubba reads the same clock for its cards.
// Real homes and relay. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { DUBSAR_CLOCK_ID, dubsarClock, newestFirst, useDubsarClock } from '../../barebone/src/clock.ts';
import { STAMP_TYPE, TIMESTAMP_SPEC, encodeStamp } from '../../../modules/timestamp/src/stamp.ts';
import { card } from '../../kit/src/html.ts';
import { itemAct } from '../../dub/src/page/view.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  useDubsarClock(null);
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

async function made(): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: [homes[0].home] });
  await t.publishGenesis();
  await t.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of t.chainActs()) await relayAt(relay.base).putAct(a);
  return t;
}

test('the Dubsar clock in Dub’s feed: a post it stamped shows its time and sorts by it; one not stamped shows the signer’s own hint, labelled; one with neither shows no time', async () => {
  // Its identity is written in the apps (decided 23 October 2026); a test names its own test clock in memory.
  assert.equal(DUBSAR_CLOCK_ID, '1c743854ba1884b470f02221395d18d1abe977631bf86f0f221e32e6d83cf453');
  assert.deepEqual(dubsarClock(), { identity: DUBSAR_CLOCK_ID, name: 'the Dubsar clock' });
  const clock = await made();
  useDubsarClock(clock.id);
  assert.deepEqual(dubsarClock(), { identity: clock.id, name: 'the Dubsar clock' });

  const river = await made();
  const pa = await made();
  // Signed in this order: River's first post, then Pa's, then two more of River's. Without a clock, River's first shows above Pa's; the clock says otherwise.
  const early = await river.publish(POST_SPECS.text, TEXT_ACT, textPayload('Stamped first.'), { public: true, relays: [relay.base] });
  const late = await pa.publish(POST_SPECS.text, TEXT_ACT, textPayload('Stamped last.'), { public: true, relays: [relay.base] });
  const hinted = await river.publish(POST_SPECS.text, TEXT_ACT, textPayload('Not stamped, with a hint.'), { public: true, relays: [relay.base], hint: '2026-10-23T10:05:00Z' });
  const bare = await river.publish(POST_SPECS.text, TEXT_ACT, textPayload('Neither.'), { public: true, relays: [relay.base] });
  const T = Math.floor(Date.parse('2026-10-23T10:00:00Z') / 1000);
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: T, acts: [early.id] }), { public: true, relays: [relay.base] });
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: T + 600, acts: [late.id] }), { public: true, relays: [relay.base] });

  const d = await dub([homes[0].base, homes[1].base], [relay.base]);
  await d.c.ask('follow', { id: river.id, name: 'River' });
  await d.c.ask('follow', { id: pa.id, name: 'Pa' });
  const f = await d.c.ask<{ items: any[]; clock: { name: string; placed: number; shown: number } | null }>('feed', { fresh: true });
  const at = (id: string) => f.items.findIndex((i) => i.id === id);
  const byId = (id: string) => f.items.find((i) => i.id === id);

  // Stamped: its time, by the Dubsar clock, and the feed ordered by it (newest first): Pa's post, stamped later, above River's first.
  assert.equal(byId(early.id)?.when, '23 Oct 2026, 10:00 UTC · by the Dubsar clock');
  assert.equal(byId(late.id)?.when, '23 Oct 2026, 10:10 UTC · by the Dubsar clock');
  assert.ok(at(early.id) >= 0 && at(late.id) >= 0 && at(late.id) < at(early.id), JSON.stringify(f.items.map((i) => [i.text, i.when])));
  assert.equal(f.clock?.name, 'the Dubsar clock');
  assert.equal(f.clock?.placed, 2);
  // River's own sequence kept: its later posts, not stamped, never above its first.
  assert.ok(at(hinted.id) < at(early.id) && at(bare.id) < at(hinted.id), 'not stamped first, in each signer’s own order');

  // On the cards: the clock's time, faint, top right; the signer's hint where the clock has not stamped; neither, nothing.
  const stamped = card(itemAct(byId(late.id)));
  assert.match(stamped, /class="k-when">23 Oct 2026, 10:10 UTC · by the Dubsar clock</);
  assert.doesNotMatch(stamped, /own hint/);
  const withHint = card(itemAct(byId(hinted.id)));
  assert.match(withHint, /the signer’s own hint: 2026-10-23T10:05:00Z/);
  assert.doesNotMatch(withHint, /k-when/);
  const neither = card(itemAct(byId(bare.id)));
  assert.doesNotMatch(neither, /k-when|own hint/);

  // No choice of clock on Dub's screens: This app names the Dubsar clock, with no form.
  const v = await import('../../dub/src/page/view.ts');
  const foot = v.appFoot((await d.c.ask<any>('state')) as never, false);
  assert.match(foot, /The Dubsar clock, the timestamp clock dubsar\.org’s feed names/);
  assert.doesNotMatch(foot, /<form id="clock"/);

  // Edubba reads the same clock for its cards.
  const e = await edubba([homes[0].base, homes[1].base], [relay.base]);
  const words = await e.c.ask<Record<string, string>>('clock words', { ids: [late.id, hinted.id] });
  assert.deepEqual(words, { [late.id]: '23 Oct 2026, 10:10 UTC · by the Dubsar clock' });
});

test('H110: two posts in a row, the second on top before the clock stamps it and after; said faint “not yet stamped by the Dubsar clock” until then; the same in the relay view and Ummia’s order', async () => {
  const clock = await made();
  useDubsarClock(clock.id);
  const other = await made();
  const d = await dub([homes[0].base, homes[1].base], [relay.base]);
  await d.c.ask('follow', { id: other.id, name: 'Other' });
  const T = Math.floor(Date.parse('2026-10-24T09:00:00Z') / 1000);
  // Someone else's post, stamped later than Carol's first: Carol's second, not stamped yet, still comes above her first.
  const theirs = await other.publish(POST_SPECS.text, TEXT_ACT, textPayload('Someone else, stamped.'), { public: true, relays: [relay.base] });
  const first = (await d.c.ask<{ post: { id: string } }>('post', { text: 'Carol, first.' })).post.id;
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: T, acts: [first] }), { public: true, relays: [relay.base] });
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: T + 60, acts: [theirs.id] }), { public: true, relays: [relay.base] });
  const second = (await d.c.ask<{ post: { id: string } }>('post', { text: 'Carol, second.' })).post.id;
  useDubsarClock(clock.id); // forget the stamps read a moment ago

  const order = async (op: 'feed' | 'relay') => (await d.c.ask<{ items: any[] }>(op, { fresh: true })).items;
  for (const op of ['feed', 'relay'] as const) {
    const items = await order(op);
    const ids = items.map((i) => i.id);
    assert.ok(ids.indexOf(second) >= 0 && ids.indexOf(second) < ids.indexOf(first), `${op}: ${JSON.stringify(items.map((i) => [i.text, i.when]))}`);
    const s = items.find((i) => i.id === second);
    assert.equal(s.when, null, op);
    assert.equal(s.unstamped, true, op);
    assert.match(card(itemAct(s)), /class="k-unstamped">not yet stamped by the Dubsar clock</, op);
    assert.doesNotMatch(card(itemAct(items.find((i) => i.id === first))), /not yet stamped/, op);
  }

  // Stamped now: the second keeps its place above the first, its label gone, the time shown.
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: T + 120, acts: [second] }), { public: true, relays: [relay.base] });
  useDubsarClock(clock.id);
  for (const op of ['feed', 'relay'] as const) {
    const items = await order(op);
    const ids = items.map((i) => i.id);
    assert.ok(ids.indexOf(second) < ids.indexOf(theirs.id) && ids.indexOf(theirs.id) < ids.indexOf(first), `${op}: ${JSON.stringify(items.map((i) => [i.text, i.when]))}`);
    const s = items.find((i) => i.id === second);
    assert.match(s.when, /by the Dubsar clock/);
    assert.doesNotMatch(card(itemAct(s)), /not yet stamped/);
  }
});

test('H110: the order shared by every feed: one signer’s sequence always holds, an act not stamped comes first, never by the signer’s hint', () => {
  const xs = [
    { id: 'a1', signer: 'A', position: 1 },
    { id: 'b1', signer: 'B', position: 1 },
    { id: 'a2', signer: 'A', position: 2 },
    { id: 'a3', signer: 'A', position: 3 },
  ];
  const o = { id: (x: (typeof xs)[number]) => x.id, signer: (x: (typeof xs)[number]) => x.signer, position: (x: (typeof xs)[number]) => x.position };
  // a3 not stamped: first. a2 stamped after b1 but a clock stamping one signer's acts out of order cannot break its sequence.
  const t = new Map([
    ['a1', 300],
    ['b1', 200],
    ['a2', 100],
  ]);
  assert.deepEqual(newestFirst(xs, t, o).map((x) => x.id), ['a3', 'b1', 'a2', 'a1']);
  assert.deepEqual(newestFirst(xs, new Map([['a1', 100], ['b1', 200]]), o).map((x) => x.id), ['a3', 'a2', 'b1', 'a1']);
  // No clock at all: the order given, each signer's own sequence kept in its places.
  assert.deepEqual(newestFirst(xs, new Map(), o).map((x) => x.id), ['a3', 'b1', 'a2', 'a1']);
});
