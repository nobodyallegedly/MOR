// An identity's rotation in Kišib, against real homes and a relay on local
// ports: an identity made in Dub, its lines kept in three apps (Dub, a
// second Dub standing for the web client, whose code it is, and Edubba);
// paper words checked; the rotation read back, stalled, sent again with the
// same bytes, counting; the new words shown once, taken by Dub; every
// earlier act still valid; nothing kept in Kišib's folder. The web client
// itself, in a browser, is in `browser.test.ts`.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { describeAct, hex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { post as barebonePost } from '../../barebone/src/post.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { apps, changeKeys, closeAll, dub, dubBringing, edubba, everything, forms, kishib, refused, standing, start, type Relay, stopAll } from './world.ts';
import { chainKeyAt } from '../src/words.ts';
import type { Review, State } from '../src/shapes.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  // Part 4: every program, page and server this file started, stopped whatever the outcome (`world.ts`, stopAll).
  await stopAll();
});

test('a personal rotation from the chain key’s paper words keeps the lines of Dub, the web client’s code and Edubba; stalled, it is sent again with the same bytes; every earlier act stays valid', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const p1 = await a.c.ask<{ post: { id: string } }>('post', { text: 'From Dub, before.' });
  const signingWords = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  // A second Dub, as the web client is (the same code), brought by the signing words: its own line.
  const w = await dubBringing(a.id, signingWords, H[0]);
  const p2 = await w.c.ask<{ post: { id: string } }>('post', { text: 'From the web client’s code, before.' });
  // Edubba, brought by the same words, relies on someone else's post: a witness act in its own line.
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Mine', id: a.id, words: signingWords, address: H[0], linked: false });
  const other = TestIdentity.create({ homes: [homes[0].home] });
  await other.publishGenesis();
  await other.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const theirs = await barebonePost(other, { text: 'Someone else’s post.', relays: [relay.base] });
  const read = await e.c.ask<{ explanation: string }>('read act', { identity: a.id, act: theirs.id });
  const wit = await e.c.ask<{ id: string }>('witness', { identity: a.id, act: theirs.id, shown: read.explanation, typed: 'RELY' });

  const k = await kishib();
  const hints = [relay.base, ...H];

  // May: check paper words. The signing words are not the chain key's; the chain words are.
  const wrong = await k.c.ask<{ title: string }>('check words', { id: a.id, address: H[0], words: signingWords });
  assert.match(wrong.title, /not the words/);
  const right = await k.c.ask<{ title: string; lines: { text: string }[] }>('check words', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  assert.equal(right.title, 'These are the right words');
  assert.match(right.lines[0].text, /key 0 of these words/);
  await refused(k.c.ask('check words', { id: a.id, address: H[0], words: a.chainWords.slice(0, 23).join(' ') }), /24|words/);

  // May: the record, in plain words.
  const rec = await k.c.ask<{ sections: { heading: string; lines: { text: string }[] }[] }>('record', { id: a.id, address: H[0] });
  const lineSection = rec.sections.find((s) => s.heading.startsWith('Its lines'))!;
  assert.equal(lineSection.lines.length, 3, JSON.stringify(lineSection));

  // The rotation, read back: three lines, each kept, in plain words; nothing signed yet.
  const r = await k.c.ask<Review>('rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  const kept = r.sections.find((s) => s.heading.startsWith('Its lines of acts: what this rotation keeps'))!;
  assert.equal(kept.lines.filter((l) => /Kept\.$/.test(l.text)).length, 3, JSON.stringify(kept));
  assert.ok(kept.lines.some((l) => /a text, such as a post/.test(l.text)));
  assert.ok(kept.lines.some((l) => /a witness act/.test(l.text)));
  assert.deepEqual(r.blocking, []);
  assert.equal(r.warning, null);
  assert.match(r.signs[0], /one rotation .*\(key 0\)/);
  assert.equal((await lookUp(a.id, H)).resolution.links.length, 1, 'nothing signed while reviewing');
  await refused(k.c.ask('confirm', { plan: r.plan, digest: '00'.repeat(32) }), /not what was shown/);

  // H79 (decided by Nobody, allegedly, 21 October 2026: "A rotation generates two new sets of keys, chain and signing";
  // and: "From a safety point of view, confirming the new chain key comes before signing the rotation, confirming the new
  // signing key can come after"). Confirmed, the review signs nothing yet: the new paper comes first.
  assert.ok(r.sections.some((x) => x.lines.some((l) => /only then does Kišib sign this change and send it/.test(l.text))));
  let s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  assert.equal(s.sitting!.stage, 'paper');
  assert.equal(s.sitting!.act, null);
  assert.ok(s.sitting!.lines.some((l) => /becomes the one that counts once the homes accept the change; until then the old paper still works, but only to send this same change again/i.test(l.text)));
  await refused(k.c.ask('resend'), /Nothing is waiting/);
  const unused = await k.c.ask<{ words: string[]; which: string }>('words show');
  assert.equal(unused.which, 'chain');
  // Kišib closed here, the paper shown but the change never sent: nothing was signed, and that paper is worthless.
  assert.equal((await k.c.ask<State>('forget')).sitting, null);
  assert.equal((await lookUp(a.id, H)).resolution.links.length, 1, 'nothing signed');
  const worthless = await k.c.ask<{ title: string; lines: { text: string }[] }>('check words', { id: a.id, address: H[0], words: unused.words.join(' ') });
  assert.match(worthless.title, /not the words/);
  assert.match(worthless.lines[1].text, /a new paper whose change was never sent \(worthless/);

  // Starting over: a new review, a new paper. Stalled: two of three homes away. The new paper is written and typed back
  // before anything is signed; then the change is signed and sent, pending; sent again while away; the homes back, the same bytes count.
  const rr = await k.c.ask<Review>('rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  s = await k.c.ask<State>('confirm', { plan: rr.plan, digest: rr.digest });
  assert.equal(s.sitting!.stage, 'paper');
  const chainShown = await k.c.ask<{ words: string[]; say: string[]; which: string }>('words show');
  assert.equal(chainShown.which, 'chain');
  assert.equal(chainShown.words.length, 24);
  assert.notDeepEqual(chainShown.words, unused.words, 'another new paper');
  assert.match(chainShown.say[0], /new chain key’s words: a new paper, made for this identity now, before anything is signed/);
  assert.match(chainShown.say[1], /becomes the one that counts once the homes accept the change\. Until then the old paper still works, but only to send this same change again/);
  assert.match(chainShown.say[2], /closed before the change is sent, nothing was signed/);
  s = await k.c.ask<State>('words written');
  assert.equal(s.sitting!.stage, 'shown');
  await refused(k.c.ask('words typed', { typed: ['wrong', 'wrong', 'wrong'] }), /Not the words/);
  assert.equal((await lookUp(a.id, H)).resolution.links.length, 1, 'still nothing signed');
  await homes[1].stop();
  await homes[2].stop();
  try {
    s = await k.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((p) => chainShown.words[p - 1]) });
    assert.equal(s.sitting!.stage, 'sent');
    assert.equal(s.sitting!.words, 'signing');
    assert.ok(s.sitting!.lines.some((l) => /does not count yet/.test(l.text)), JSON.stringify(s.sitting!.lines));
    s = await k.c.ask<State>('resend');
    assert.equal(s.sitting!.stage, 'sent');
    await refused(k.c.ask('words show'), /Not yet/);
    await refused(k.c.ask('rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' ') }), /middle of another act/);
  } finally {
    await homes[1].start();
    await homes[2].start();
  }
  const act = s!.sitting!.act!;
  s = await k.c.ask<State>('resend');
  assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
  assert.equal(s.sitting!.act, act, 'the same rotation');
  for (const h of homes) {
    const chain = (await relayAt(h.base).identity(a.id)).chain.map((b) => (describeAct(b) as { id: string }).id);
    assert.deepEqual(chain, [a.id, act], `${h.base} holds one rotation: the same bytes everywhere`);
  }

  // Every earlier act still valid: the three lines kept.
  for (const [id, by] of [[p1.post.id, a.id], [p2.post.id, a.id], [wit.id, a.id]] as const) assert.equal(await standing(id, by, hints), 'valid', id);

  // The rotation committed a key of the new paper (key 1, its position), not of the old words.
  const newChain = fromWords(chainShown.words);
  const r1 = (await lookUp(a.id, H)).resolution;
  assert.equal(r1.chainKeyCommit, chainKeyAt(newChain, r1.chainKeyScheme!, 1).commit, 'the next chain key is the new paper’s');
  assert.notEqual(r1.chainKeyCommit, chainKeyAt(fromWords(a.chainWords), r1.chainKeyScheme!, 1).commit, 'never the old paper’s');

  // Then, once it counts, the new signing key's words, once; hidden; three typed back; forgotten.
  const shown = await k.c.ask<{ words: string[]; say: string[]; which: string }>('words show');
  assert.equal(shown.which, 'signing');
  assert.equal(shown.words.length, 24);
  assert.match(shown.say[0], /new signing key’s words/);
  assert.notDeepEqual(shown.words, chainShown.words);
  s = await k.c.ask<State>('words written');
  assert.equal(s.sitting!.stage, 'shown');
  s = await k.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((p) => shown.words[p - 1]) });
  assert.equal(s.sitting!.stage, 'done');
  assert.ok(s.sitting!.lines.some((l) => /two new papers/.test(l.text)));
  await refused(k.c.ask('words show'), /No new signing key/);

  // Dub takes them (its "renew"), and posts again in a new line.
  const renewed = await a.c.ask<{ lines: { text: string }[] }>('renew', { words: shown.words.join(' ') });
  assert.ok(renewed.lines.some((l) => /new line/.test(l.text)));
  const p3 = await a.c.ask<{ post: { id: string } }>('post', { text: 'From Dub, after.' });
  assert.equal(await standing(p3.post.id, a.id, hints), 'valid');

  // The old paper is spent: checked, it says so; it makes no further change of keys.
  const spent = await k.c.ask<{ title: string; lines: { text: string }[] }>('check words', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  assert.equal(spent.title, 'These words are spent');
  assert.match(spent.lines[0].text, /earlier chain-key paper .*position 1/);
  await refused(k.c.ask('rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' ') }), /earlier chain-key paper of this identity: the change of its keys at position 1 used it/);
  // The new paper makes the next change: key 1 of its words now.
  const nowRight = await k.c.ask<{ title: string; lines: { text: string }[] }>('check words', { id: a.id, address: H[0], words: chainShown.words.join(' ') });
  assert.equal(nowRight.title, 'These are the right words');
  assert.match(nowRight.lines[0].text, /key 1 of these words/);
  // The lines this identity holds now (Dub's new one included) are read back; the old lines Edubba and the web client's code stopped are kept by the first rotation.
  const r2 = await k.c.ask<Review>('rotate plan', { id: a.id, address: H[0], words: chainShown.words.join(' ') });
  assert.deepEqual(r2.blocking, []);
  assert.ok(!JSON.stringify(r2.sections).includes('already made an earlier change'), 'a paper made at a change is not an old paper reused');
  // This time Kišib is closed after the change was signed and sent, while it waits for its homes.
  s = await k.c.ask<State>('confirm', { plan: r2.plan, digest: r2.digest, ...(r2.warning ? { warned: r2.warning } : {}) });
  const p2Shown = await k.c.ask<{ words: string[] }>('words show');
  s = await k.c.ask<State>('words written');
  await homes[1].stop();
  await homes[2].stop();
  let waiting: string;
  try {
    s = await k.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((p) => p2Shown.words[p - 1]) });
    assert.equal(s.sitting!.stage, 'sent');
    waiting = s.sitting!.act!;
    assert.equal((await k.c.ask<State>('forget')).sitting, null);
  } finally {
    await homes[1].start();
    await homes[2].start();
  }
  // The old paper (the second) still works, but only to send this same change again: Kišib signs nothing.
  const again = await k.c.ask<Review>('rotate plan', { id: a.id, address: H[0], words: chainShown.words.join(' ') });
  assert.match(again.title, /Send the same change/);
  assert.deepEqual(again.signs, ['Kišib signs nothing: it sends the exact same bytes again, to every home.']);
  assert.ok(JSON.stringify(again.sections).includes(waiting!));
  assert.ok(JSON.stringify(again.sections).includes('This paper still works, but only to send this same change again'));
  s = await k.c.ask<State>('confirm', { plan: again.plan, digest: again.digest });
  for (let i = 0; (s.sitting!.stage as string) === 'sent' && i < 3; i++) s = await k.c.ask<State>('resend');
  assert.equal(s.sitting!.act, waiting!, 'the same change, its same bytes');
  assert.equal(s.sitting!.stage, 'done', 'it counts; its signing key was lost with the closed sitting');
  await refused(k.c.ask('words show'), /No new signing key/);
  for (const h of homes) assert.equal((await relayAt(h.base).identity(a.id)).chain.length, 3, `${h.base}: one second change, no other`);
  // The paper written before it was signed counts now, and makes the next change: it installs a signing key held again.
  const r2b = await k.c.ask<Review>('rotate plan', { id: a.id, address: H[0], words: p2Shown.words.join(' ') });
  const third = await changeKeys(k.c, r2b);
  const r3 = (await lookUp(a.id, H)).resolution;
  assert.equal(r3.links.length, 4);
  assert.equal(r3.chainKeyCommit, chainKeyAt(fromWords(third.chain), r3.chainKeyScheme!, 3).commit, 'the third change commits key 3 of a fourth paper');
  await refused(k.c.ask('rotate plan', { id: a.id, address: H[0], words: chainShown.words.join(' ') }), /earlier chain-key paper of this identity: the change of its keys at position 2 used it/);
  await refused(k.c.ask('rotate plan', { id: a.id, address: H[0], words: p2Shown.words.join(' ') }), /earlier chain-key paper of this identity: the change of its keys at position 3 used it/);
  await a.c.ask('renew', { words: third.signing.join(' ') });
  assert.equal(await standing((await a.c.ask<{ post: { id: string } }>('post', { text: 'From Dub, after the second change.' })).post.id, a.id, hints), 'valid');

  // Nothing kept: Kišib's folder read whole holds none of the words, nor the seed, nor the new key.
  const folder = everything(k.dir);
  for (const ws of [a.chainWords, unused.words, chainShown.words, shown.words, p2Shown.words, third.chain, third.signing]) for (const f of forms(ws, fromWords(ws))) assert.ok(!folder.includes(f), `“${f.slice(0, 20)}…” in Kišib’s folder`);
  assert.equal((await k.c.ask<State>('forget')).sitting, null);
  void apps;
  void hex;
});
