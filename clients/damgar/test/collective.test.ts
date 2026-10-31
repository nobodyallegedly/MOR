// Damgar for a collective (round 3; F353; moved to the keyless collective,
// Agreements draft 17, rules 56 to 60, F402; the grant limits cMIP draft 2):
// a real collective founded in Edubba from the grid, its Money layer and a
// finer Money area (obligations) held by A and iPa, one signature, two above
// 10,000. A's Damgar acts for it with A's own identity's key, naming the
// collective: a promise within the cap counts alone; one above it counts
// only once iPa signs it with iPa's own key, in Dub's Signing tab. A member
// holding no box in the Money area is refused.
//
// Premises replaced (round 8, in plain words): the layers are renumbered
// (Text 1, Envelopes 2, Money 3, Agreements 4, Development 5), so the grid
// names Money as layer 3, a whole layer is the grid's layer row and a finer
// area names its kinds of act; and there are no member keys (rule 58), so
// where this test checked "each a member's own key" (byKey) and that the
// member key's secret never reached the page, it now checks two members'
// signatures and that the page is shown no key at all.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { apps, closeAll, damgar, dub, edubba, everything, kishib, moneyGrid, refused, start, type Relay } from './world.ts';
import { changeKeys } from '../../kishib/test/world.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { ACCEPTABLE } from '../src/specs.ts';
import { TestNode } from './node.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

// Every app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});

test('a member acts for the collective from Damgar with their own key: within the Money area’s cap alone, above it with a second key', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  void apps;
  const e = await edubba(H, R);
  const A = await dub(H, R);
  const iPa = await dub(H, R);
  const iPh = await dub(H, R);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.words, address: H[0], linked: false });
  const grid = moneyGrid(A.id, iPa.id, iPh.id);
  const rv = await e.c.ask<any>('real found prepare', { name: 'Three tablets', founder: A.id, members: [iPa.id, iPh.id], grid });
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [iPa, iPh]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const col = (await e.c.ask<any>('real found', { act: terms, read: true })).acts[0] as string;

  // A's Damgar: A brought by its words, the specifications accepted.
  const g = await damgar();
  await g.c.ask('bring', { id: A.id, words: A.words, address: H[0], relays: R.join(' ') });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const added = await g.c.ask<any>('collective add', { id: col });
  assert.match(added.lines[1].text, /Its Money area, “Money”: .*1 key; above 10,000 an act, one more/);

  // iPh publishes where it is paid: the promises are to iPh.
  const ph = await damgar();
  await ph.c.ask('bring', { id: iPh.id, words: iPh.words, address: H[0], relays: R.join(' ') });
  await ph.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const node = new TestNode();
  const rr = await ph.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await ph.c.ask('rails publish', { lightning: node.key, network: 3, digest: rr.digest });
  // iPh holds no box in Money: refused there.
  await refused(ph.c.ask('collective add', { id: col }), /You hold no box in its Money area/);

  // Within the cap: A's key alone.
  const small = { collective: col, to: iPh.id, value: '2000', unit: '', whatFor: 'clay' };
  const s1 = await g.c.ask<any>('collective promise read', small);
  assert.ok(s1.lines.some((l: any) => /Within the area: your key alone makes it count/.test(l.text)), JSON.stringify(s1.lines));
  await refused(g.c.ask('collective promise', { ...small, digest: '00'.repeat(32) }), /not the promise read back/);
  const p1 = await g.c.ask<any>('collective promise', { ...small, digest: s1.digest });
  assert.ok(p1.lines.some((l: any) => /It counts for the collective/.test(l.text)), JSON.stringify(p1.lines));

  // Above it: A's key, then iPa's, asked in iPa's Signing tab.
  const big = { collective: col, to: iPh.id, value: '50000', unit: '', whatFor: 'a kiln' };
  const s2 = await g.c.ask<any>('collective promise read', big);
  assert.ok(s2.lines.some((l: any) => /It is above the cap: it counts only with 2 keys/.test(l.text)), JSON.stringify(s2.lines));
  const p2 = await g.c.ask<any>('collective promise', { ...big, digest: s2.digest });
  assert.ok(p2.lines.some((l: any) => /Asked for their key/.test(l.text)), JSON.stringify(p2.lines));
  assert.ok(p2.lines.some((l: any) => /does not count yet: 1 of 2 keys/.test(l.text)), JSON.stringify(p2.lines));
  const ask = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === p2.act);
  assert.match(ask.reading.title, /Sign a money act of the collective: obligation/);
  const s = await iPa.c.ask<any>('accept', { thread: ask.thread });
  assert.match(s.lines[0].text, /Signed for the collective with your own key/);
  const shown = await g.c.ask<any>('collectives');
  const acts = shown.collectives[0].acts;
  assert.deepEqual(acts.map((a: any) => [a.amount.value, a.standing.met]).sort(), [[2000, true], [50000, true]].sort());
  assert.equal(acts.find((a: any) => a.amount.value === 50000).standing.areas[0].signers.length, 2, 'two signatures, each with a member’s own key (rule 58)');
  // No member keys: the page is shown no key of the collective's at all.
  assert.equal(shown.collectives[0].key, undefined);

  // H80: A's keys changed in Kišib, every line placed by the cards Dub, Edubba and Damgar show (H80's question 2: each
  // private act left at A's homes, so each card names an act they hold, and the counts add up). A's own key asks the
  // other holders, so the promise is refused before anything is signed, in Damgar's words; the new words given, it signs again.
  const cards = [
    (await A.c.ask<any>('state')).identity.line,
    (await g.c.ask<any>('state')).identity.line,
    (await e.c.ask<any>('state')).identities.find((i: any) => i.id === A.id).line,
  ]
    .map((l: any) => l.card)
    .filter(Boolean)
    .join('\n');
  assert.match(cards, / Edubba private\b/, 'Edubba’s card, naming its app and its private line (F376)');
  assert.match(cards, / Damgar private\b/, 'Damgar’s card, naming its app and its private line (F376)');
  const k = await kishib();
  const rv2 = await k.c.ask<any>('rotate plan', { id: A.id, address: H[0], words: A.chainWords.join(' '), cards });
  const said = JSON.stringify(rv2.sections);
  assert.equal(rv2.warning, null, `every line placed, nothing left out: ${said}`);
  assert.match(said, /Edubba’s private line\. A line Kišib cannot read[^"]*Kept by the card given/);
  assert.match(said, /Damgar’s private line\. A line Kišib cannot read[^"]*Kept by the card given/);
  assert.match(said, /more acts? Kišib cannot read[^"]*lie on the lines kept by the cards given/);
  const fresh = await changeKeys(k.c, rv2);
  const atHomes = async () => (await relayAt(H[0]).feed({ signer: A.id })).items.length;
  const before3 = await atHomes();
  await refused(g.c.ask('collective promise', { ...big, digest: s2.digest }), /changed elsewhere.*Nothing was signed/);
  assert.equal(await atHomes(), before3, 'nothing signed reached A’s homes');
  await g.c.ask('renew', { words: fresh.signing.join(' ') });
  assert.equal((await g.c.ask<any>('check')).current, true, 'the new words taken: Damgar signs again');
  // A's own key, the new one: Damgar signs for the collective with it, naming the collective.
  const p3 = await g.c.ask<any>('collective promise', { ...big, digest: s2.digest });
  assert.ok(p3.lines.some((l: any) => /Signed for the collective with your own key/.test(l.text)), JSON.stringify(p3.lines));
  void everything;
});
