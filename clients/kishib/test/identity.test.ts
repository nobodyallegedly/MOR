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
import { apps, closeAll, dub, dubBringing, edubba, everything, forms, kishib, refused, standing, start, type Relay } from './world.ts';
import type { Review, State } from '../src/shapes.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
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

  // Stalled: two of three homes away. Pending; sent again while away; then the homes are back, and the same bytes count.
  await homes[1].stop();
  await homes[2].stop();
  let s: State;
  try {
    s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
    assert.equal(s.sitting!.stage, 'sent');
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

  // The new signing key's words, once; hidden; three typed back; forgotten.
  const shown = await k.c.ask<{ words: string[]; say: string[] }>('words show');
  assert.equal(shown.words.length, 24);
  assert.match(shown.say[0], /new signing key’s words/);
  s = await k.c.ask<State>('words written');
  assert.equal(s.sitting!.stage, 'shown');
  await refused(k.c.ask('words typed', { typed: ['wrong', 'wrong', 'wrong'] }), /Not the words/);
  s = await k.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((p) => shown.words[p - 1]) });
  assert.equal(s.sitting!.stage, 'done');
  await refused(k.c.ask('words show'), /No new signing key/);

  // Dub takes them (its "renew"), and posts again in a new line.
  const renewed = await a.c.ask<{ lines: { text: string }[] }>('renew', { words: shown.words.join(' ') });
  assert.ok(renewed.lines.some((l) => /new line/.test(l.text)));
  const p3 = await a.c.ask<{ post: { id: string } }>('post', { text: 'From Dub, after.' });
  assert.equal(await standing(p3.post.id, a.id, hints), 'valid');
  // The next rotation is signed with key 1 of the same paper.
  const again = await k.c.ask<{ lines: { text: string }[] }>('check words', { id: a.id, address: H[0], words: a.chainWords.join(' ') });
  assert.match(again.lines[0].text, /key 1 of these words/);

  // Nothing kept: Kišib's folder read whole holds none of the words, nor the seed, nor the new key.
  const folder = everything(k.dir);
  for (const f of forms(a.chainWords, fromWords(a.chainWords), fromWords(shown.words))) assert.ok(!folder.includes(f), `“${f.slice(0, 20)}…” in Kišib’s folder`);
  assert.equal((await k.c.ask<State>('forget')).sitting, null);
  void apps;
  void hex;
});
