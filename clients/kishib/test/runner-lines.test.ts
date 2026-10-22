// The lines an identity held by the runner signs on (the Dubsar runner
// cMIP, section 7): Dub, holding no key, posts and messages through Kišib;
// then the identity's keys are changed from paper, in Kišib. Every line is
// placed (Dub's own, the runner-signed Dub's public and private lines, by
// the cards the runner gives), nothing in red; the runner then refuses until
// it is given the new words (3.5, H80), and Dub goes on in new lines.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readCards } from '../../genesis/src/lines.ts';
import { asking, clickPanel, closeAll, changeKeys, dub, dubBeside, kishib, refused, standing, start, runnerOn, type Relay } from './world.ts';
import { SPECS } from '../../genesis/src/core.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { RUNNER_SPENT_SAY, type RunnerView } from '../src/runner.ts';
import { RUNNER_OLD_KEY_SAY } from '../../dub/src/dub.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

type Line = { card: string | null; latest: string | null };

test('an identity held by the runner posts and messages from Dub; its keys changed from paper, every line is placed, nothing in red; the runner refuses until given the new words', async () => {
  const H = homes.map((h) => h.base);
  const all = [...H, relay.base];
  const a = await dub(H, [relay.base]);
  const before1 = (await a.c.ask<{ post: { id: string } }>('post', { text: 'From A’s own Dub.' })).post.id;
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const other = await dub(H, [relay.base]);

  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words });
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  const p = (await k.c.ask<RunnerView>('runner state')).apps[0];
  await k.c.ask('runner approve', { pairing: p.id, identities: [a.id] });
  await k.c.ask('runner yes', { pairing: p.id, kind: 'posts', on: true });
  await d.c.ask('runner take', { id: a.id });

  // A post (a standing yes) and a message (asked), through the runner.
  const post = (await d.c.ask<{ post: { id: string } }>('post', { text: 'Through the runner, public.' })).post.id;
  const sending = d.c.ask('message', { to: other.id, text: 'Through the runner, private.' });
  await clickPanel((await asking(d.c)).panel, 'sign');
  await sending;

  // Dub's own cards, and the runner's: the same lines.
  const dl = (await d.c.ask<{ identity: { line: Line } }>('state')).identity.line;
  const fromDub = readCards(dl.card ?? '');
  const fromRunner = readCards((await k.c.ask<{ cards: string }>('runner cards', { id: a.id })).cards);
  assert.deepEqual(fromRunner.map((c) => [c.act, c.position, c.summary, c.line]).sort(), fromDub.map((c) => [c.act, c.position, c.summary, c.line]).sort(), 'the runner gives the cards Dub shows');
  assert.equal(fromRunner.length, 2, 'Dub’s public line and its private line');

  // The change of keys from paper: A's own Dub's cards and the runner's, every line placed.
  const ownCards = (await a.c.ask<{ identity: { line: Line } }>('state')).identity.line.card ?? '';
  const cards = [ownCards, (await k.c.ask<{ cards: string }>('runner cards', { id: a.id })).cards].filter(Boolean).join('\n');
  const review = await k.c.ask<any>('rotate plan', { id: a.id, address: H[0], words: a.chainWords.join(' '), cards });
  const said = JSON.stringify(review.sections);
  assert.equal(review.warning, null, `nothing in red: ${said}`);
  assert.deepEqual(review.blocking, []);
  assert.doesNotMatch(said, /left out|not placed|lie on no line/, said);
  const fresh = await changeKeys(k.c, review);

  // Every act kept.
  for (const x of [before1, post]) assert.equal(await standing(x, a.id, all), 'valid');

  // The runner holds the old key: it refuses, and so does Dub, until the new words are given in Kišib.
  await refused(d.c.ask('post', { text: 'After the change, old key.' }), new RegExp(RUNNER_OLD_KEY_SAY.slice(0, 40)));
  // Asked directly by another app paired with it, the runner checks its key first (3.5): it no longer counts.
  const probe = k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  k.app.runner.approve({ pairing: probe.pairing, identities: [a.id] });
  await refused(k.app.runner.ask(probe.token, { identity: a.id, binding: a.id, line: 'public', sequence: [], spec: SPECS.text, type: 0, payload: textPayload('x'), public: true }, ''), new RegExp(RUNNER_SPENT_SAY.slice(0, 40)));
  let v = await k.c.ask<RunnerView>('runner state');
  assert.equal(v.held[0].spent, true, 'said in Kišib: its key no longer counts');
  await k.c.ask('runner give', { id: a.id, address: H[0], words: fresh.signing.join(' ') });
  v = await k.c.ask<RunnerView>('runner state');
  assert.equal(v.held[0].spent, false);
  const after1 = (await d.c.ask<{ post: { id: string } }>('post', { text: 'After the change, the new key.' })).post.id;
  assert.equal(await standing(after1, a.id, all), 'valid');
  // Dub goes on in new lines, and the runner's cards follow them.
  const newCards = readCards((await k.c.ask<{ cards: string }>('runner cards', { id: a.id })).cards);
  assert.deepEqual(newCards.map((c) => [c.position, c.line]), [[1, 'public']]);
  assert.match(RUNNER_SPENT_SAY, /new signing key’s words/);
});
