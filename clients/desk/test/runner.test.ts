// Use one from Kišib (round 4): an identity Kišib's runner holds, used in
// Edubba on the same computer, Edubba holding none of its keys (the Dubsar
// runner cMIP, as Dub and Damgar use it). Pairing started in Edubba and
// approved in Kišib; the identity taken; a founding proposed to it signed in
// To sign through Kišib's panel with the identity's own key (decided on
// draft 3's question 1: signing with the member key Kišib holds comes in a
// later round); every other path refused in plain words, nothing signed.
// Kišib's, Dub's and Edubba's programs, real homes and a relay; the panel
// answered as its frame answers it.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apps, clickPanel, closeAll, dub, edubba, everything, kishib, runnerOn, start, type Relay } from '../../kishib/test/world.ts';
import { serve } from '../src/server.ts';
import { Client, newKey, type State } from '../src/page/api.ts';
import { RUNNER_HERE_SAY } from '../src/desk.ts';
import type { RunnerView } from '../../kishib/src/runner.ts';

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

test('an identity used through Kišib: paired, approved, taken; a founding signed in To sign through Kišib’s panel; every other signing path refused; no key of it in Edubba’s folder', async () => {
  const H = homes.map((h) => h.base);
  // Pa: made in Dub, its signing words given to Kišib's runner.
  const pa = await dub(H, [relay.base]);
  const paWords = (await pa.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: pa.id, address: H[0], words: paWords });

  // Pa's own Edubba, on the same computer as Kišib.
  const dir = join(mkdtempSync(join(tmpdir(), 'edubba-runner-')), 'edubba');
  const app = await serve({ dir, port: 0, machineEvery: 0, kishib: k.dir });
  apps.push(app);
  const b = await Client.open(await newKey(), app.base);
  await b.ask('pair', { code: app.access.newCode(), label: 'test' });
  await b.ask('settings', { homes: H, relays: [relay.base], via: [], drafts: '' });

  const { code } = await b.ask<{ code: string }>('runner pair');
  let v = await k.c.ask<RunnerView>('runner state');
  const p = v.apps.find((x) => x.code === code)!;
  assert.equal(p.name, 'Edubba');
  // To sign reads proposals sealed to Pa: Kišib lets Edubba open them (draft 2, section 8), never its key.
  await k.c.ask('runner approve', { pairing: p.id, identities: [pa.id], opens: [pa.id] });
  const r = await b.ask<{ identities: { id: string; held: boolean }[]; state: string }>('runner');
  assert.equal(r.state, 'approved');
  assert.deepEqual(r.identities.map((x) => x.id), [pa.id]);
  const took = await b.ask<{ lines: { text: string }[] }>('runner take', { id: pa.id });
  assert.match(took.lines.map((l) => l.text).join(' '), /Edubba uses .* through Kišib’s runner: Kišib holds its signing key, Edubba none/);
  let s = await b.ask<State>('state');
  const held = s.identities.find((i) => i.id === pa.id)!;
  assert.equal(held.kind, 'runner');
  assert.equal(s.acting, pa.id);

  // Every path but To sign is refused, plainly, nothing signed.
  await b.ask('publishing act as', { id: pa.id });
  const vow = await b.ask<{ plan: string; digest: string; reading: { blocking: string[] } }>('publishing vow read', { words: 'A seat at the reading.', title: 'A seat', price: '10' });
  await assert.rejects(b.ask('publishing confirm', { plan: vow.plan, digest: vow.digest }), new RegExp(RUNNER_HERE_SAY.slice(0, 40)));

  // A founding proposed to Pa from another Edubba.
  const e = await edubba(H, [relay.base]);
  const f = await dub(H, [relay.base]);
  const fWords = (await f.c.ask<{ words: string[] }>('carry')).words.join(' ');
  await e.c.ask('bring', { name: 'Max', id: f.id, words: fWords, address: H[0], linked: false });
  const ana = await dub(H, [relay.base]);
  const rv = await e.c.ask<{ plan: string; digest: string; reading: { blocking: string[] } }>('real found prepare', { name: 'The tablet house', founder: f.id, members: [pa.id, ana.id], safety: 2, release: 2, clone: 2, others: 2 });
  assert.deepEqual(rv.reading.blocking, []);
  const terms = (await e.c.ask<{ acts: string[] }>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];

  // In Pa's Edubba, To sign: read in plain words; signing asks Kišib's panel, which signs with Pa's own key.
  const proposals = await b.ask<{ proposals: { act: string; thread: string; reading: { title: string } | null }[] }>('member proposals');
  const it = proposals.proposals.find((x) => x.act === terms)!;
  assert.ok(it?.reading, 'the founding is read in plain words');
  // Each act asks Kišib's panel: the signature, its own key sealed to itself, the answer to the founder.
  let finished = false;
  const signing = b.ask<{ lines: { text: string; tone?: string }[] }>('member accept', { thread: it.thread }).finally(() => (finished = true));
  const titles: string[] = [];
  while (!finished) {
    const w = (await b.ask<{ asking: { request: string; panel: string; title: string } | null }>('runner asking')).asking;
    if (!w || titles.includes(w.request)) {
      await new Promise((r) => setTimeout(r, 50));
      continue;
    }
    titles.push(w.request);
    assert.match(await clickPanel(w.panel, 'sign'), /[Ss]igned/);
  }
  const done = await signing;
  assert.ok(titles.length >= 2, 'Kišib’s panel asked for each act');
  assert.ok(!done.lines.some((l) => l.tone === 'bad'), done.lines.map((l) => l.text).join(' | '));
  const g = await e.c.ask<{ standing: { signed: string[] } }>('real gather', { act: terms });
  assert.ok(g.standing.signed.includes(pa.id), 'the founder’s Edubba counts Pa’s signature');

  // No key of Pa in Edubba's folder.
  assert.ok(!everything(dir).includes(paWords.split(' ').slice(0, 6).join(' ')), 'no signing words of Pa in Edubba’s folder');
  s = await b.ask<State>('state');
  assert.equal(s.identities.find((i) => i.id === pa.id)?.kind, 'runner');
  v = await k.c.ask<RunnerView>('runner state');
  assert.ok(v.apps.some((x) => x.name === 'Edubba' && x.state === 'approved'));
});
