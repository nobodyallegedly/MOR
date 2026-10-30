// Every line of acts can be found by Kišib (H80's question 2, 21 October
// 2026): each app leaves every private act it signs at the identity's homes,
// locked, its content key delivered to the identity itself, so that the card
// each app shows names an act the homes hold, and the identity's other apps
// can follow the line. One identity with lines from Dub, Edubba, Damgar and
// Ummia, private acts on each; a change of keys in Kišib places every line,
// and the member's own new key acts for the collective (round 8: there are
// no member keys, rule 58; before, the member key for a collective was kept). Then, with one locked act
// removed from the homes on purpose, Kišib's review says so in red, and
// nothing is signed until it is read.
//
// Here because Ummia's tests are the ones that reach all four apps.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, SPECS, Verifier, describeAct } from '../../genesis/src/core.ts';
import { actsBy, readCards } from '../../genesis/src/lines.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { ACCEPTABLE, SPEC } from '../../damgar/src/specs.ts';
import { changeKeys } from '../../kishib/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { closeAll, damgar, dub, edubba, kishib, start, ummia, type Relay } from './world.ts';

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

type Line = { acts: number; latest: string | null; summary: string | null; atHomes: boolean | null; missing: number; hidden: number | null; card: string | null };

/** The private line's latest act is at every home, locked; the card names it, its app and its line (F376), and every card the app shows names the app. */
async function placed(line: Line, app: string, what: string): Promise<string> {
  assert.ok(line.latest, `${app}, ${what}: a line`);
  for (const h of homes) {
    const a = await relayAt(h.base).getAct(line.latest!);
    assert.ok(a, `${app}, ${what}: its latest act at ${h.base}`);
    assert.equal((describeAct(a!) as { public: boolean }).public, false, `${app}, ${what}: a private act, locked`);
  }
  assert.equal(line.atHomes, true, `${app}, ${what}: ${JSON.stringify(line)}`);
  assert.equal(line.missing, 0, `${app}, ${what}: nothing of the line missing from the homes`);
  const cards = readCards(line.card ?? '');
  const own = cards.find((c) => c.act === line.latest);
  assert.ok(own && own.summary === line.summary && own.line === 'private', `${app}, ${what}: a card names it, on the private line: ${line.card}`);
  assert.ok(cards.every((c) => c.app === app), `${app}, ${what}: each card names its app: ${line.card}`);
  return line.card!;
}

test('every app leaves each private act at the homes, its card names it, and a change of keys in Kišib places every line, the member’s own new key acting for the collective', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const A = await dub(H, R);
  const iPa = await dub(H, R);
  const iPh = await dub(H, R);
  const e = await edubba(H, R);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.words, address: H[0], linked: false });

  // Dub: a sealed message, then the follow list sealed to itself.
  await A.c.ask('message', { to: iPa.id, text: 'Sealed, from A.' });
  const dubLine = async () => (await A.c.ask<{ identity: { line: Line } }>('state')).identity.line;
  const m = await dubLine();
  await placed(m, 'Dub', 'a sealed message');
  await A.c.ask('follow', { id: iPa.id, name: 'iPa' });
  const f = await dubLine();
  assert.notEqual(f.latest, m.latest, 'the follow list is a new act of the line');
  await placed(f, 'Dub', 'the follow list, sealed');

  // Edubba: first a payment prepared for Damgar (sealed to oneself), then a real collective founded with iPa and iPh:
  // its terms and A's signature, public, and the invitations and the founding's word (no member key now: rule 58),
  // sealed to them. The founding comes after a private act on purpose (F376): on one line, a public act behind a private
  // act was unknown to every other reader after a change of keys; on Edubba's public line, it stays valid.
  const edubbaLine = async () => (await e.c.ask<{ identities: { id: string; line: Line }[] }>('state')).identities.find((i) => i.id === A.id)!.line;
  const unit = (await e.c.ask<{ hash: string }[]>('money units'))[0].hash;
  await e.c.ask('money pay', { identity: A.id, to: iPa.id, value: '5', unit, whatFor: 'clay' });
  await placed(await edubbaLine(), 'Edubba', 'a payment prepared for Damgar');
  // The layers renumbered (Text 1, Envelopes 2, Money 3, Agreements 4, Development 5): Money is a layer row and a finer area of obligations with its cap.
  const all = [A.id, iPa.id, iPh.id];
  const grid = {
    members: all,
    constitution: { holders: all, number: 3 },
    chainKey: 2,
    absence: 2,
    layers: { 1: { holders: all, number: 1 }, 2: { holders: all, number: 1 }, 3: { holders: [A.id, iPa.id], number: 2 }, 4: { holders: all, number: 3 }, 5: { holders: [iPh.id], number: 1 } },
    areas: [{ name: 'Money', layer: 3, kinds: [`${MIRS.money}:1`], holders: [A.id, iPa.id], number: 1, cap: 10_000 }],
    clone: 2,
    shares: { [A.id]: 34, [iPa.id]: 33, [iPh.id]: 33 },
  };
  const rv = await e.c.ask<any>('real found prepare', { name: 'Three tablets', founder: A.id, members: [iPa.id, iPh.id], grid });
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  await placed(await edubbaLine(), 'Edubba', 'the invitations');
  for (const m of [iPa, iPh]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const col = (await e.c.ask<any>('real found', { act: terms, read: true })).acts[0] as string;
  await placed(await edubbaLine(), 'Edubba', 'the founding’s word to iPa');


  // Damgar: the accepted list, sealed to oneself; then a promise for the collective above its cap, iPa asked.
  const g = await damgar();
  await g.c.ask('bring', { id: A.id, words: A.words, address: H[0], relays: R.join(' ') });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const damgarLine = async () => (await g.c.ask<{ identity: { line: Line } }>('state')).identity.line;
  await placed(await damgarLine(), 'Damgar', 'the accepted list');
  await g.c.ask('collective add', { id: col });
  // iPa publishes where it is paid: the promise is to iPa.
  const pa = await damgar();
  await pa.c.ask('bring', { id: iPa.id, words: iPa.words, address: H[0], relays: R.join(' ') });
  await pa.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const node = new TestNode();
  const rr = await pa.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await pa.c.ask('rails publish', { lightning: node.key, network: 3, digest: rr.digest });
  const big = { collective: col, to: iPa.id, value: '50000', unit: '', whatFor: 'a kiln' };
  const s2 = await g.c.ask<any>('collective promise read', big);
  const p2 = await g.c.ask<any>('collective promise', { ...big, digest: s2.digest });
  assert.ok(p2.lines.some((l: any) => /Asked for their key/.test(l.text)), JSON.stringify(p2.lines));
  await placed(await damgarLine(), 'Damgar', 'its ask to iPa, sealed to iPa');

  // Ummia: the accepted list, one more specification added (Damgar's entries already hold the others).
  const more = '11'.repeat(32);
  const u = await ummia();
  await u.c.ask('bring', { id: A.id, words: A.words, address: H[0] });
  await u.c.ask('settings', { relays: R, track: R });
  await u.c.ask('accepted change', { add: [{ hash: more, label: 'A test specification' }] });
  const ummiaLine = async () => (await u.c.ask<{ identity: { line: Line } }>('state')).identity.line;
  await placed(await ummiaLine(), 'Ummia', 'the accepted list');

  // Kišib: the four cards, copied whole; every line placed, nothing left out, nothing to tick.
  const cards = (await Promise.all([dubLine(), edubbaLine(), damgarLine(), ummiaLine()])).map((l) => l.card).join('\n');
  const k = await kishib();
  const review = await k.c.ask<any>('rotate plan', { id: A.id, address: H[0], words: A.chainWords.join(' '), cards });
  const said = JSON.stringify(review.sections);
  assert.equal(review.warning, null, `every line placed: ${said}`);
  for (const app of ['Dub', 'Edubba', 'Damgar', 'Ummia']) assert.match(said, new RegExp(`${app}’s private line\\. [^"]*Kept`), `${app}’s private line kept`);
  for (const app of ['Dub', 'Edubba']) assert.match(said, new RegExp(`${app}’s public line\\. A line of acts[^"]*Kept`), `${app}’s public line read by Kišib itself, and kept`);
  assert.doesNotMatch(said, /left out|not placed|lie on no line/, said);
  const fresh = await changeKeys(k.c, review);

  // Every reader, holding no key of A's, follows A's public lines after the change: the founding's terms and A's signature,
  // signed after a private act, are valid, not unknown (F376).
  const reader = await lookUp(A.id, H, {}, new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text));
  const seen = await actsBy(A.id, [...H, ...R]);
  for (const x of seen) {
    try {
      reader.verifier.add(x);
    } catch {
      // private: a reader cannot open it
    }
  }
  const publicActs = seen.map((x) => describeAct(x) as { id: string; public: boolean; signer?: string }).filter((d) => d.public && d.signer === A.id);
  assert.ok(publicActs.some((d) => d.id === terms), 'the founding’s terms are among A’s public acts');
  for (const d of publicActs) assert.equal(reader.verifier.status(d.id), 'valid', `${d.id}: valid for every reader after A’s change of keys`);
  // Damgar takes the new words: it signs for the collective with A's own new key, naming the collective (rule 58: no member keys;
  // the premise "the member key kept" is replaced by this one: the member's own key, changed in Kišib, acts for the collective again).
  await g.c.ask('renew', { words: fresh.signing.join(' ') });
  const p3 = await g.c.ask<any>('collective promise', { ...big, digest: s2.digest });
  assert.ok(p3.lines.some((l: any) => /Signed for the collective with your own key/.test(l.text)), JSON.stringify(p3.lines));
  // Ummia too; its accepted list, sealed before the change, still reads.
  await u.c.ask('renew', { words: fresh.signing.join(' ') });
  const entries = (await u.c.ask<{ entries: { hash: string }[] }>('accepted')).entries.map((x) => x.hash);
  assert.ok(entries.includes(more) && entries.includes(SPEC.payment), JSON.stringify(entries));
});

test('a locked act removed from the homes on purpose: Kišib’s review says so in red, and nothing is signed until it is read', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const B = await dub(H, R);
  const g = await damgar();
  await g.c.ask('bring', { id: B.id, words: B.words, address: H[0], relays: R.join(' ') });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const line = (await g.c.ask<{ identity: { line: Line } }>('state')).identity.line;
  const card = await placed(line, 'Damgar', 'the accepted list');
  const cards = [(await B.c.ask<{ identity: { line: Line } }>('state')).identity.line.card, card].join('\n');

  // On purpose: Damgar's latest act taken from both homes after its card was copied.
  for (const h of homes) await h.drop(line.latest!);
  assert.equal(await relayAt(H[0]).getAct(line.latest!), null);

  const k = await kishib();
  const review = await k.c.ask<any>('rotate plan', { id: B.id, address: H[0], words: B.chainWords.join(' '), cards });
  assert.match(review.warning ?? '', /Damgar’s private line is not placed: its latest act \([0-9a-f]{64}\) is not at the identity's homes, so no reader can follow it\./);
  assert.match(review.warning, /the accepted list/, 'what lives on it, in plain words');
  assert.match(review.warning, /a member key for a collective would be lost with it/, 'what leaving it out would mean');
  assert.match(review.warning, /Open Damgar first/);
  const red = (review.sections as { lines: { text: string; tone?: string }[] }[]).flatMap((s) => s.lines).filter((l) => /Damgar’s private line is not placed/.test(l.text));
  assert.ok(red.length && red.every((l) => l.tone === 'bad'), 'said in red');

  // Not read (not passed back): refused, nothing signed, the homes' chain as it was.
  const chainAt = async () => (await relayAt(H[0]).identity(B.id)).chain.length;
  const before2 = await chainAt();
  await assert.rejects(k.c.ask('confirm', { plan: review.plan, digest: review.digest }), /Nothing was signed\. .*Damgar’s private line is not placed/);
  assert.equal(await chainAt(), before2, 'nothing signed reached the homes');
  // Read (the review shown again, the refusal having ended it): the change goes on, its new paper shown first, still nothing signed.
  const again = await k.c.ask<any>('rotate plan', { id: B.id, address: H[0], words: B.chainWords.join(' '), cards });
  assert.equal(again.warning, review.warning);
  const s = await k.c.ask<any>('confirm', { plan: again.plan, digest: again.digest, warned: again.warning });
  assert.equal(s.sitting.stage, 'paper');
  assert.equal(s.sitting.act, null);
});
