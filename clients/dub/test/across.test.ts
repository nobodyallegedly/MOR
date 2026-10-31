// Finding each other across homes (H38, H39; Identity draft 14, F349):
// two people on separate homes and relays, as in the author's test of 18
// October, who could not find each other. Copy ID gives the ID written for
// people (mid1…) and the ID with where it lives (?r= hints); Follow and To…
// take either, or an ID with a home address beside it, or bare hex, and
// refuse an act's form where an identity is asked, saying so. An identity
// Dub made changes its relays (a new routes act, read back first); its
// homes point to Kišib; one brought here publishes no routes (reading 5).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { Client, newKey } from '../../desk/src/page/api.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { actForm } from '../../genesis/src/forms.ts';
import { DOMAIN, serve, type Running } from '../src/server.ts';
import type { Item, State } from '../src/shapes.ts';
import { stopAll } from './stop.ts';

const apps: Running[] = [];
let places: Relay[] = [];

before(async () => {
  places = [await start('home'), await start('relay'), await start('home'), await start('relay'), await start('relay')];
});

after(() => stopAll(...apps.map((a) => () => a.close()), ...(places ?? []).map((r) => () => r?.stop())));

async function made(home: string, relay: string): Promise<{ c: Client; id: string; state: State }> {
  const app = await serve({ dir: mkdtempSync(join(tmpdir(), 'mor-dub-across-')), port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes: [home], relays: [relay] });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  const state = await c.ask<State>('state');
  return { c, id: state.identity!.id, state };
}

const refused = async (p: Promise<unknown>, words: RegExp) =>
  assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });

test('H38: on separate homes and relays, they find each other by the ID with where it lives; an act’s form where an ID is asked is refused', async () => {
  const [homeA, relayA, homeB, relayB] = places.map((x) => x.base);
  const p = await made(homeA, relayA);
  const q = await made(homeB, relayB);
  assert.match(q.state.identity!.form, /^mid1[02-9ac-hj-np-z]{58}$/, 'the ID written for people');
  assert.match(q.state.identity!.where, new RegExp(`^${q.state.identity!.form}\\?r=`), 'the ID with where it lives');
  const posted = await q.c.ask<{ post: { id: string } }>('post', { text: 'From the other side.' });

  // Bare ID: not found from P's homes and relays (no directory: an ID says who, not where).
  await p.c.ask('follow', { id: q.id, name: 'Q' });
  let feed = (await p.c.ask<{ items: Item[] }>('feed', { fresh: true })).items;
  assert.ok(!feed.some((i) => i.id === posted.post.id), 'a bare ID carries no place');
  await p.c.ask('unfollow', { id: q.id });

  // An act's form where an identity is asked: refused, naming both.
  await refused(p.c.ask('follow', { id: actForm(posted.post.id) }), /this is an act \(mact\), not an identity \(mid\)/);
  // A mistyped form: refused by its checksum.
  const typo = q.state.identity!.form.replace(/.$/, (c) => (c === 'q' ? 'p' : 'q'));
  await refused(p.c.ask('follow', { id: typo }), /checksum does not hold/);

  // With where it lives: found, and its post in the feed.
  await p.c.ask('follow', { id: q.state.identity!.where, name: 'Q' });
  feed = (await p.c.ask<{ items: Item[] }>('feed', { fresh: true })).items;
  assert.ok(feed.some((i) => i.id === posted.post.id), 'found through the hints');

  // To…: an ID with a home address beside it.
  const back = await q.c.ask<{ lines: { text: string }[] }>('post', { text: 'Hello across.', to: `${p.state.identity!.form} ${homeA}` });
  assert.ok(back.lines.some((l) => /Left in the inbox/.test(l.text)), JSON.stringify(back.lines));
  // And bare hex still works where the place is known.
  await q.c.ask('follow', { id: p.id });
});

test('H39: an identity Dub made changes its relays, read back first; its homes point to Kišib', async () => {
  const [homeA, relayA, , , relayC] = places.map((x) => x.base);
  const p = await made(homeA, relayA);
  const r = await p.c.ask<{ digest: string; lines: { text: string }[] }>('relays review', { relays: [relayA, relayC] });
  const said = r.lines.map((l) => l.text).join(' ');
  assert.match(said, /A new routes act, version 2/);
  assert.match(said, /Kišib/);
  await refused(p.c.ask('relays publish', { relays: [relayC], digest: r.digest }), /not what was read back/);
  await p.c.ask('relays publish', { relays: [relayA, relayC], digest: r.digest });
  const l = await lookUp(p.id, [homeA], {});
  assert.deepEqual(l.routes.routes.find((x) => x.kind === 0)?.hints, [relayA, relayC]);
  assert.deepEqual((await p.c.ask<State>('state')).identity!.relays, [relayA, relayC]);
});
