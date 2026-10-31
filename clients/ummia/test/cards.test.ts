// Specification cards (the Dubsar Specification Card cMIP, draft 1), through
// Ummia's operations, against real homes and relays on local ports:
//
// - a cMIP published, its card offered and signed with a discussion thread,
//   found on its page (title, summary, release, vectors, discussion);
// - a second card from its creator replacing the first;
// - a card by someone else shown as their word, never the creator's;
// - a card naming a specification that does not exist shown so;
// - the eight texts' built-in titles, the MICS document's and the freeze
//   test suite's hashes computed again from their files;
// - a card read by Dub as a plain post;
// - Look's feed: the specification titled by its card, a release saying
//   what changed since the version before, pointed at a single ID and at
//   the release itself, filtered by kind and by layer; Follow their
//   releases adding to the same follow list Dub reads, and a saved point.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MIRS, cborEncode } from '../../genesis/src/core.ts';
import { specHash } from '../../site/src/listing.ts';
import { BUILT_IN, CARD_HEAD, MICS_HASH, SUITE_HASH, cardText, readCardText } from '../src/cards.ts';
import { changedSince } from '../src/look.ts';
import type { Looked } from '../src/look.ts';
import type { SpecPage } from '../src/look.ts';
import type { Done, Review } from '../src/shapes.ts';
import { closeAll, developer, folder, refused, start, type Relay } from './world.ts';

let homes: Relay[];
let relays: Relay[];

before(async () => {
  homes = [await start('home'), await start('home')];
  relays = [await start('relay'), await start('relay')];
});

// Every app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, ...relays]) await h?.stop().catch(() => undefined);
  }
});

const publish = async (c: { ask<T>(op: string, a?: Record<string, unknown>): Promise<T> }, op: string, a: Record<string, unknown>, confirm = 'confirm') => {
  const r = await c.ask<Review>(op, a);
  assert.deepEqual(r.blocking, [], JSON.stringify(r.blocking));
  return { review: r, done: await c.ask<Done>(confirm, { plan: r.plan, digest: r.digest }) };
};

test('a card’s text, written and read as draft 1 writes it', () => {
  const spec = 'ab'.repeat(32);
  const t = cardText({ spec, title: 'Dubsar Slots, draft 1', summary: 'A vow  sold\nmany times.', releases: ['cd'.repeat(32)], vectors: ['https://example.invalid/v.json'], discussion: 'ef'.repeat(32) });
  const lines = t.split('\n');
  assert.equal(lines[0], CARD_HEAD);
  assert.match(lines[1], /^Specification: mspec1/);
  assert.equal(lines[3], 'Summary: A vow sold many times.');
  const back = readCardText(t)!;
  assert.equal(back.spec, spec);
  assert.deepEqual(back.releases, ['cd'.repeat(32)]);
  assert.equal(back.discussion, 'ef'.repeat(32));
  // A key this draft does not know is skipped; a missing title is no card.
  assert.ok(readCardText(`${t}\nLater: something`));
  assert.equal(readCardText(t.replace(/\nTitle: .*/, '')), null);
  assert.equal(readCardText(`Not a card\n${lines.slice(1).join('\n')}`), null);
  assert.throws(() => cardText({ spec, title: 'x'.repeat(121), summary: null, releases: [], vectors: [], discussion: null }), /at most 120/);
});

test('the eight texts: built-in titles, keyed by their test hashes; the MICS document’s and the suite’s computed from their files', () => {
  const file = (f: string, kind: number) => {
    let t = readFileSync(new URL(`../../../spec/${f}`, import.meta.url), 'utf8');
    if (t.endsWith('\n')) t = t.slice(0, -1);
    return { hash: specHash(cborEncode(new Map<number, unknown>([[0, kind], [9, t]]))), heading: t.split('\n')[0].replace(/^#\s*/, '') };
  };
  const mics = file('02-MOR-MICS-v30.md', 6);
  const suite = file('03-MOR-freeze-test-suite-v30.md', 7);
  assert.equal(MICS_HASH, mics.hash);
  assert.equal(SUITE_HASH, suite.hash);
  assert.equal(BUILT_IN.length, 8);
  for (const [hash, f] of [[MIRS.identity, 'MIR-identity-draft-15.md'], [MIRS.text, 'MIR-text-draft-11.md'], [MIRS.envelopes, 'MIR-envelopes-draft-11.md'], [MIRS.money, 'MIR-money-draft-11.md'], [MIRS.agreements, 'MIR-agreements-draft-17.md'], [MIRS.development, 'MIR-development-draft-11.md']] as const)
    assert.equal(BUILT_IN.find((b) => b.hash === hash)!.title, file(f, 4).heading);
  assert.equal(BUILT_IN.find((b) => b.hash === MICS_HASH)!.title, mics.heading);
  assert.equal(BUILT_IN.find((b) => b.hash === SUITE_HASH)!.title, suite.heading);
});

test('a release says what changed since the version before', () => {
  const f = (path: string, work: string) => ({ path, work, size: 1, locked: '00', nonce: new Uint8Array(24), key: new Uint8Array(32) });
  const before = { name: 'x', version: '0.3', previous: null, files: [f('a', '1'), f('b', '2'), f('c', '3'), f('d', '4')], dependencies: [] };
  const now = { name: 'x', version: '0.4', previous: 'aa'.repeat(32), files: [f('a', '9'), f('b', '8'), f('c', '7'), f('d', '4'), f('e', '5')], dependencies: [], implements: [{ spec: 'bb'.repeat(32) }] };
  assert.match(changedSince(now, before)!, /^What changed since 0\.3: 3 files changed, 1 added; now implements mspec1/);
  assert.equal(changedSince(before, null), null);
  assert.match(changedSince(now, null)!, /not found/);
});

test('cards: offered after a cMIP, signed with its thread, found on its page; replaced by a later one; another’s as their word; one naming nothing shown so; read by Dub as a post', async () => {
  const H = homes.map((h) => h.base);
  const R = relays.map((r) => r.base);
  const a = await developer(H, [R[0]], { track: R });
  const b = await developer(H, [R[1]], { track: R });
  const c = a.ummia.c;

  // The cMIP, then its card and a discussion thread, read back first.
  const spec = await publish(c, 'spec prepare', { kind: 0, text: '# cMIP: Dubsar Slots, draft 1\n\nA vow sold many times: one offer per slot.', types: '0 slot slot = tstr' });
  const hash = spec.done.hash!;
  const card = await c.ask<Review>('card prepare', { spec: hash, title: 'Dubsar Slots, draft 1', summary: 'A vow sold many times: one offer per slot.', vectors: ['https://example.invalid/slots-vectors.json'], discussion: 'new' });
  assert.deepEqual(card.blocking, []);
  const said = card.sections[0].lines.map((l) => l.text);
  assert.equal(said[0], CARD_HEAD);
  assert.ok(said.includes('Discussion: (the thread signed just before it)'));
  assert.match(card.summary[0], /You are its creator/);
  await refused(c.ask('confirm', { plan: card.plan, digest: '0'.repeat(64) }), /does not match/);
  const first = await c.ask<Done>('confirm', { plan: card.plan, digest: card.digest });
  assert.equal(first.acts.length, 2, 'the thread, then the card');

  // A release implementing it, then a page gathering it all.
  const rel = await c.ask<Review>('release prepare', { folder: folder(), name: 'mor-slots', version: '0.1', implements: [spec.done.acts[0]] });
  assert.deepEqual(rel.blocking, []);
  await c.ask('release confirm', { plan: rel.plan, digest: rel.digest });
  let page = await c.ask<SpecPage & { mine: boolean }>('spec page', { hash });
  assert.equal(page.found, true);
  assert.equal(page.title, 'Dubsar Slots, draft 1');
  assert.equal(page.own?.id, first.acts[1]);
  assert.equal(page.own?.fields.summary, 'A vow sold many times: one offer per slot.');
  assert.deepEqual(page.vectors, ['https://example.invalid/slots-vectors.json']);
  assert.equal(page.discussion?.id, first.acts[0]);
  assert.match(page.discussion?.text ?? '', /^Discussion of Dubsar Slots, draft 1\nmspec1/);
  assert.equal(page.creator, a.id);
  assert.ok(page.claimed);
  assert.ok(page.releases.some((r) => r.name === 'mor-slots' && r.version === '0.1'), JSON.stringify(page.releases));
  assert.equal(page.mine, true);

  // A second card from its creator replaces the first.
  const second = await publish(c, 'card prepare', { spec: hash, title: 'Dubsar Slots', summary: 'Seats, slots and tickets: one vow, many sales.', discussion: first.acts[0] });
  page = await c.ask<SpecPage & { mine: boolean }>('spec page', { hash });
  assert.equal(page.own?.id, second.done.acts[0]);
  assert.equal(page.title, 'Dubsar Slots');
  assert.equal(page.superseded, 1);
  assert.equal(page.ownAlso.length, 0);

  // Someone else's card: their word, never the creator's.
  const theirs = await publish(b.ummia.c, 'card prepare', { spec: hash, title: 'Slots, as Pa reads them', summary: 'My notes.' });
  assert.match(theirs.review.summary[0], /not its creator/);
  page = await c.ask<SpecPage & { mine: boolean }>('spec page', { hash });
  assert.equal(page.own?.id, second.done.acts[0], 'the creator’s card still counts');
  assert.equal(page.others.length, 1);
  assert.equal(page.others[0].signer, b.id);
  assert.equal(page.others[0].creators, false);
  assert.equal(page.title, 'Dubsar Slots');

  // A card naming a specification that does not exist: Ummia refuses to sign one; another client's is shown so.
  const nothing = 'cd'.repeat(32);
  await refused(b.ummia.c.ask('card prepare', { spec: nothing, title: 'Nothing' }), /No specification with this hash was found/);
  await b.dub.c.ask('post', { text: cardText({ spec: nothing, title: 'A specification nobody wrote', summary: null, releases: [], vectors: [], discussion: null }) });
  const none = await c.ask<SpecPage>('spec page', { hash: nothing });
  assert.equal(none.found, false);
  assert.match(none.lines[0].text, /No specification with this hash was found/);
  assert.equal(none.others.length, 1);
  assert.equal(none.others[0].fields.title, 'A specification nobody wrote');
  assert.match(none.title, /not found/);

  // A core text: its built-in card; anyone's card for it is their word.
  const money = await c.ask<SpecPage>('spec page', { hash: MIRS.money });
  assert.equal(money.title, 'MIR: Money');
  assert.ok(money.builtIn);
  assert.equal(money.own, null);
  const mine = await c.ask<Review>('card prepare', { spec: MIRS.money, title: 'Money, as I read it' });
  assert.match(mine.summary[0], /core’s texts/);

  // Dub reads the card as the plain post it is.
  await b.dub.c.ask('follow', { id: a.id });
  const prof = await b.dub.c.ask<{ items: { id: string; text: string }[] }>('profile', { id: a.id });
  const shown = prof.items.find((x) => x.id === second.done.acts[0]);
  assert.ok(shown, JSON.stringify(prof.items.map((x) => x.text)));
  assert.match(shown.text, /^Dubsar Specification Card\nSpecification: mspec1/);
});

test('Look: one feed, pointed and filtered; a release saying what changed; Follow their releases into the same follow list Dub reads', async () => {
  const H = homes.map((h) => h.base);
  const R = relays.map((r) => r.base);
  const a = await developer(H, [R[0]], { track: R });
  const b = await developer(H, [R[0]], { track: R });
  const c = a.ummia.c;
  const spec = await publish(c, 'spec prepare', { kind: 0, text: '# cMIP: Look test, draft 1\n\nFor the feed.', tasks: [] , types: '0 seen seen = tstr' });
  await publish(c, 'card prepare', { spec: spec.done.hash, title: 'Looked at', summary: 'A card’s title in the feed.' });
  const dir = folder({ files: { 'a.txt': 'one\n', 'b.txt': 'two\n' } });
  const r1 = await publish(c, 'release prepare', { folder: dir, name: 'mor-look', version: '0.3' }, 'release confirm');
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`${dir}/a.txt`, 'one, changed\n');
  writeFileSync(`${dir}/c.txt`, 'three\n');
  const r2 = await publish(c, 'release prepare', { folder: dir, name: 'mor-look', version: '0.4', previous: r1.done.acts[0] }, 'release confirm');

  // Pointed at A alone, every kind.
  const at = await b.ummia.c.ask<Looked>('look', { point: { kind: 'id', value: a.id }, filters: ['releases', 'cmips', 'modules', 'xtypes', 'extensions'] });
  const s = at.items.find((x) => x.hash === spec.done.hash);
  assert.ok(s, JSON.stringify(at.items.map((x) => x.title)));
  assert.equal(s.title, 'Looked at');
  assert.equal(s.kind, 'xtype');
  const newest = at.items.find((x) => x.id === r2.done.acts[0])!;
  assert.match(newest.text, /What changed since 0\.3: 1 file changed, 1 added/);
  assert.ok(at.items.every((x) => x.signer === a.id));
  // Filtered by releases only, then by a layer no release has.
  const rels = await b.ummia.c.ask<Looked>('look', { point: { kind: 'id', value: a.id }, filters: ['releases'] });
  assert.ok(rels.items.length >= 2 && rels.items.every((x) => x.kind === 'release'));
  const dev = await b.ummia.c.ask<Looked>('look', { point: { kind: 'id', value: a.id }, filters: ['cmips', 'xtypes'], layer: 'Development' });
  assert.ok(dev.items.some((x) => x.hash === spec.done.hash));
  const money = await b.ummia.c.ask<Looked>('look', { point: { kind: 'id', value: a.id }, filters: ['cmips', 'xtypes'], layer: 'Money' });
  assert.equal(money.items.length, 0);
  // Pointed at the release: it and its line.
  const line = await b.ummia.c.ask<Looked>('look', { point: { kind: 'release', value: r2.done.acts[0] } });
  assert.deepEqual(line.items.map((x) => x.title).sort(), ['mor-look 0.3', 'mor-look 0.4']);
  // Pointed at a relay.
  const relay = await b.ummia.c.ask<Looked>('look', { point: { kind: 'relay', value: R[0] }, filters: ['releases'] });
  assert.ok(relay.items.some((x) => x.id === r2.done.acts[0]));

  // Follow their releases: the same follow list Dub reads, and a saved point.
  const f = await b.ummia.c.ask<{ lines: { text: string }[] }>('follow releases', { id: a.id, name: 'Max' });
  assert.ok(f.lines.some((l) => /Added to your contacts/.test(l.text)), JSON.stringify(f.lines));
  const st = await b.ummia.c.ask<{ saved: { label: string; point: { kind: string; value: string }; filters: string[] }[] }>('state');
  assert.deepEqual(st.saved.map((x) => [x.label, x.point.kind, x.filters.join()]), [['Max’s releases', 'id', 'releases']]);
  const mine = await b.ummia.c.ask<{ contacts: { id: string; name: string | null }[] }>('contacts');
  assert.deepEqual(mine.contacts.map((x) => [x.id, x.name]), [[a.id, 'Max']]);
  const contacts = await b.ummia.c.ask<Looked>('look', { point: { kind: 'contacts', value: '' }, filters: ['releases'] });
  assert.ok(contacts.items.some((x) => x.id === r2.done.acts[0]));
  // Dub, holding the same identity, reads the follow list Ummia wrote.
  await b.dub.c.ask('feed', { fresh: true });
  const dubState = await b.dub.c.ask<{ identity: { follows: { id: string }[] } }>('state');
  assert.ok(dubState.identity.follows.some((x) => x.id === a.id), JSON.stringify(dubState.identity.follows));
});
