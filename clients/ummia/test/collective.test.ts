// Ummia's round 2 (F339, F353): a collective's releases, moved here from
// Edubba, signed with the member's own key. A collective founded from
// Edubba's grid: Publishing held by A and iPa, two keys; Development by iPh.
// A adds it in Ummia, acts for it, and releases a folder: the release is the
// collective's act, signed with A's key, counting once iPa signs it in Dub's
// Signing tab with iPa's own key. iPh, holding no box in Publishing, cannot
// add it; a specification is published as oneself only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, dub, edubba, folder, refused, start, ummia, type Relay } from './world.ts';
import type { Done, Review, State } from '../src/shapes.ts';

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

test('a collective’s release from Ummia, signed with a member’s own key; a second key from Dub', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const e = await edubba(H, R);
  const A = await dub(H, R);
  const iPa = await dub(H, R);
  const iPh = await dub(H, R);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.words, address: H[0], linked: false });
  const grid = {
    members: [A.id, iPa.id, iPh.id],
    constitution: { holders: [A.id, iPa.id, iPh.id], number: 3 },
    chainKey: 2,
    absence: 2,
    areas: [
      { name: 'Publishing', layer: 1, holders: [A.id, iPa.id], number: 2 },
      { name: 'Development', layer: 4, holders: [iPh.id], number: 1 },
    ],
    clone: 2,
  };
  const rv = await e.c.ask<any>('real found prepare', { name: 'Three tablets', founder: A.id, members: [iPa.id, iPh.id], grid });
  assert.deepEqual(rv.reading.blocking, []);
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [iPa, iPh]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const col = (await e.c.ask<any>('real found', { act: terms, read: true })).acts[0] as string;

  // A in Ummia: the collective added by its ID, chosen under Who acts.
  const u = await ummia();
  await u.c.ask('bring', { id: A.id, words: A.words, address: H[0] });
  await u.c.ask('settings', { relays: R, track: R });
  const added = await u.c.ask<{ lines: { text: string }[] }>('collective add', { id: col });
  assert.match(added.lines[0].text, /its releases go through its area “Publishing”, 2 keys of 2/);
  let st = await u.c.ask<State>('state');
  assert.ok(st.actors.some((a) => a.id === col && a.kind === 'collective' && a.available));
  await u.c.ask('acting', { id: col });
  st = await u.c.ask<State>('state');
  assert.equal(st.acting, col);
  await refused(u.c.ask('spec prepare', { kind: 0, name: 'x', text: 'x' }), /published as yourself/);

  // The release: read back as the collective's, then signed with A's key.
  const dir = folder();
  const r = await u.c.ask<Review>('release prepare', { folder: dir, name: 'tablets', version: '1', previous: '' });
  assert.match(r.title, /^Publish tablets 1 for the collective/);
  assert.ok(r.sections.some((s) => s.lines.some((l) => /signed with your own key for it \(F353\).*“Publishing” is met, 2 keys of 2/.test(l.text))), JSON.stringify(r.sections.map((s) => s.lines)));
  const d = await u.c.ask<Done>('release confirm', { plan: r.plan, digest: r.digest });
  const rel = d.acts[0];
  assert.match(d.title, /is published for the collective/);
  assert.ok(d.lines.some((l) => /Asked for their key: /.test(l.text)), JSON.stringify(d.lines));
  assert.ok(d.lines.some((l) => /does not count yet: 1 of 2 keys/.test(l.text)), JSON.stringify(d.lines));
  // Listed among the collective's releases, checked as anyone would.
  const listed = await u.c.ask<{ releases: { id: string; collective?: string }[] }>('releases');
  assert.equal(listed.releases[0].id, rel);
  assert.equal(listed.releases[0].collective, col);
  const early = await u.c.ask<{ ok: boolean; problems: string[] }>('release check', { id: rel });
  assert.equal(early.ok, false);
  assert.match(early.problems[0], /any 2 of the Publishing area's holders must sign it; 1 did/);

  // iPa signs it in Dub's Signing tab, with iPa's own key: it counts.
  const p = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === rel);
  assert.equal(p.reading.kind, 'release');
  const signed = await iPa.c.ask<any>('accept', { thread: p.thread });
  assert.match(signed.lines[0].text, /Signed for the collective with your own key/);
  const standing = await u.c.ask<{ met: boolean; lines: { text: string }[] }>('collective release standing', { id: rel });
  assert.equal(standing.met, true, JSON.stringify(standing.lines));
  assert.match(standing.lines[0].text, /2 of 2 keys, 2 with their own key/);
  const checked = await u.c.ask<{ ok: boolean }>('release check', { id: rel });
  assert.equal(checked.ok, true, JSON.stringify(checked));

  // iPh holds no box in Publishing: refused in Ummia.
  const u2 = await ummia();
  await u2.c.ask('bring', { id: iPh.id, words: iPh.words, address: H[0] });
  await refused(u2.c.ask('collective add', { id: col }), /You hold no box in the area reaching its releases/);
});
