// Members acting for a keyless collective (Agreements rules 56 to 60; the
// redesign, F402), in place of F353's member keys, which are gone: a real
// collective founded from the grid, every one of its five layers named, each
// member signing with their own key, no key named or sealed; then acts for
// the collective made by members with their own keys, naming it, judged by
// the core as anyone reads them. One Edubba (the founder, A) and two Dubs
// (iPa, iPh), against real homes and a relay on local ports.
//
// - The grid: Text and Envelopes, any one member; Money, A and iPa together,
//   with a finer area for its debts, any one of them up to 10,000 regtest
//   satoshis (the grant limits cMIP); Agreements, every member; Development,
//   iPh alone. What one member may do alone is read back, Money first.
// - No signature names a key (signature field 1 refused), no member key is
//   sealed anywhere.
// - A posts alone: the act names the collective and shows which member made it.
// - A promises 50,000: above the cap, A alone is not enough; iPa signs it in
//   Dub's Signing tab, with iPa's own key, and it counts.
// - iPh cannot act in Money, which iPh does not hold.
// - iPh leaves alone; the change without iPh is proposed from the grid.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborDecode, describeAct, hex, unhex } from '../../genesis/src/core.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { obligationPayload } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { chainFor, judgeCollective, publishAt, signAsMember } from '../../grants/src/member.ts';
import { MIRS, REGTEST_UNIT, evenPercent, kindsFor, type Grid } from '../src/grid.ts';
import { serve, type Running } from '../src/server.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

let homes: Relay[];
let relay: Relay;
const apps: { close(): Promise<void> }[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const a of apps) await a.close();
  for (const h of [...homes, relay]) await h.stop();
});

async function edubba(): Promise<{ app: Running; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'mk-edubba-')), 'edubba');
  const app = await serve({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts') });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  return { app, c, dir };
}

async function dub(): Promise<{ app: DubRunning; c: Client; dir: string; id: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'mk-dub-'));
  const app = await serveDub({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes: [homes[0].base], relays: [relay.base] });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  await c.ask('signing', { on: true });
  const id = (await c.ask<any>('state')).identity.id;
  return { app, c, dir, id };
}

function everything(dir: string): string {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(readFileSync(p).toString('latin1'));
    }
  };
  walk(dir);
  return out.join('\n');
}

test('F402, rules 56 to 60: members found the collective naming all five layers, and act for it each with their own key', async () => {
  const e = await edubba();
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const iPa = await dub();
  const iPh = await dub();
  const hints = [relay.base, ...homes.map((h) => h.base)];
  const all = [A, iPa.id, iPh.id];
  const debts = kindsFor(3).filter((k) => k.type === 1).map((k) => `${k.spec}:${k.type}`);
  const grid: Grid = {
    members: all,
    constitution: { holders: [...all], number: 3 },
    chainKey: 2,
    absence: 2,
    layers: { 1: { holders: [...all], number: 1 }, 2: { holders: [...all], number: 1 }, 3: { holders: [A, iPa.id], number: 2 }, 4: { holders: [...all], number: 3 }, 5: { holders: [iPh.id], number: 1 } },
    areas: [{ name: 'Debts', layer: 3, kinds: debts, holders: [A, iPa.id], number: 1, cap: 10_000 }],
    clone: 2,
    shares: evenPercent(all),
  };
  const review = await e.c.ask<any>('real found prepare', { name: 'Three tablets', founder: A, members: [iPa.id, iPh.id], grid });
  assert.deepEqual(review.reading.blocking, []);
  const said = review.reading.sections.map((s: any) => s.heading);
  assert.deepEqual(said.slice(0, 6), ['What one member may do alone, layer by layer', 'The constitution', 'The judges', 'Finer areas', 'Shares', 'Each member']);
  assert.match(review.reading.sections[0].lines[0].text, /^Money: no member alone \(save “Debts”, a finer area\)/, 'Money first');
  assert.ok(review.reading.sections[3].lines.some((l: any) => /“Debts”, within Money: .*above 10,000 regtest satoshis an act, 2 of them/.test(l.text)));
  assert.ok(review.reading.summary.some((x: string) => /no signing key of its own: each member acts for it with their own key/.test(x)));
  const proposed = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const terms = proposed.acts[0];
  for (const m of [iPa, iPh]) {
    const p = (await m.c.ask<any>('proposals')).proposals[0];
    await m.c.ask<any>('accept', { thread: p.thread });
  }
  const g = await e.c.ask<any>('real gather', { act: terms });
  assert.equal(g.standing.enough, true);
  const col = (await e.c.ask<Done & { show: string[] }>('real found', { act: terms, read: true })).acts[0];

  // No signature names a key (signature field 1 is refused: no member keys, rule 58); no member key is sealed anywhere.
  for (const id of all) {
    const sig = (await relayAt(relay.base).feed({ signer: id })).items.map((x) => describeAct(x.item) as any).find((d) => d.spec === REPO_SPECS.agreements && d.type === 1);
    const m = cborDecode(sig.payload) as Map<number, unknown>;
    assert.equal(hex(m.get(0) as Uint8Array), terms);
    assert.equal(m.get(1), undefined, `${id.slice(0, 8)}'s signature names no key`);
  }
  for (const h of homes) for (const id of all) assert.ok(!(await relayAt(h.base).feed({ to: id })).items.some((x) => x.kind === 'sealed' && /member key/i.test(String(x))), 'no member key sealed');
  void everything;
  void readFileSync;

  // A posts alone, under Text's rule: an act of A's own key, naming the collective (rule 58).
  const me = e.app.store.identity(A);
  const atA = await chainFor(col, hints);
  const post = await signAsMember(col, me, atA, { spec: MIRS.text, type: 0, payload: textPayload('Posted by A, with A’s own key, for the collective.'), public: true });
  e.app.store.saveIdentity(me);
  assert.equal((describeAct(post.act) as any).signer, A, 'signed by A');
  assert.deepEqual((describeAct(post.act) as any).objects, [[col, atA.decision]], 'naming the collective, its one object (Text rule 14)');
  assert.ok((await publishAt([post.act], hints)).length);
  let j = await judgeCollective(col, [post.id], hints);
  assert.equal(j.get(post.id)!.met, true, JSON.stringify(j.get(post.id)));
  assert.deepEqual(j.get(post.id)!.areas[0].signers, [A]);

  // A promises 50,000 in the Debts area: above its cap one member is not enough.
  const big = await signAsMember(col, me, await chainFor(col, hints), { spec: MIRS.money, type: 1, payload: obligationPayload({ debtor: col, creditor: iPh.id, unit: REGTEST_UNIT, value: 50_000, pointer: '11'.repeat(32) }), public: true });
  e.app.store.saveIdentity(me);
  assert.ok((await publishAt([big.act], hints)).length);
  j = await judgeCollective(col, [big.id], hints, {}, [[big.id, false]]);
  assert.equal(j.get(big.id)!.met, false);
  assert.deepEqual([j.get(big.id)!.areas[0].needed, j.get(big.id)!.areas[0].limits], [2, 'above']);
  assert.equal((await judgeCollective(col, [big.id], hints)).get(big.id)!.areas[0].limits, 'unknown', 'no verdict of the limits cMIP: unknown, never counted');

  // A asks iPa to sign it too; iPa signs it in Dub with iPa's own key.
  const reach = { id: iPa.id, key: (await lookUp(iPa.id, hints)).encryptionKey!, inbox: [relay.base] };
  await negotiate(me, reach, { text: 'A promise of 50,000 regtest satoshis: above the Debts area’s cap, it needs your signature too.', refs: [[big.id, col], [col, col]] });
  e.app.store.saveIdentity(me);
  const p = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === big.id);
  assert.equal(p.reading.kind, 'act');
  assert.match(p.reading.title, /Sign a money act of the collective: obligation/);
  assert.ok(p.reading.sections[0].lines.some((l: any) => /50,000/.test(l.text)));
  const signed = await iPa.c.ask<any>('accept', { thread: p.thread });
  assert.match(signed.lines[0].text, /your own key/);
  j = await judgeCollective(col, [big.id], hints, {}, [[big.id, false]]);
  assert.equal(j.get(big.id)!.met, true, JSON.stringify(j.get(big.id)));
  assert.deepEqual([...j.get(big.id)!.areas[0].signers].sort(), [A, iPa.id].sort(), 'two members, each with their own key');

  // iPh cannot act in Money, which iPh does not hold.
  const ph = (await iPh.app.store.identity(iPh.id))!;
  const stray = await signAsMember(col, ph, await chainFor(col, hints), { spec: MIRS.money, type: 1, payload: obligationPayload({ debtor: col, creditor: iPa.id, unit: REGTEST_UNIT, value: 10, pointer: '11'.repeat(32) }), public: true });
  await iPh.app.store.saveIdentity(ph);
  await publishAt([stray.act], hints);
  j = await judgeCollective(col, [stray.id], hints, {}, [[stray.id, true]]);
  assert.equal(j.get(stray.id)!.met, false);

  // Rule 70 (F354): iPh leaves alone, from Dub's Signing tab: read back, then signed; the founder told.
  const founding = (await iPh.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
  const lr = await iPh.c.ask<any>('leave read', { thread: founding.thread });
  assert.ok(lr.lines.some((l: any) => /You resign from the collective mid1.*alone: nobody else’s signature is needed/.test(l.text)), JSON.stringify(lr.lines));
  assert.ok(lr.lines.some((l: any) => /departed holder/.test(l.text)));
  await assert.rejects(iPh.c.ask('leave collective', { thread: founding.thread, digest: '00'.repeat(32) }), /changed since it was read back/);
  const left = await iPh.c.ask<any>('leave collective', { thread: founding.thread, digest: lr.digest });
  assert.ok(left.lines.some((l: any) => /The founder was told/.test(l.text)), JSON.stringify(left.lines));

  // A's Edubba registers it at the collective's line (any member draws a record), then proposes the change without iPh.
  const reg = await e.c.ask<Done>('real register resignation', { collective: col, act: left.resignation });
  assert.match(reg.lines[0].text, /counts in no rule and no area/);
  const back = (await e.c.ask<{ grid: Grid }>('real grid', { collective: col, members: [A, iPa.id] })).grid;
  assert.deepEqual(back.layers[5].holders, [], 'Development, iPh’s alone, left with nobody');
  assert.deepEqual(back.departed, [iPh.id], 'iPh keeps their share, a departed holder (H101)');
  const refused = await e.c.ask<any>('real change prepare', { collective: col, members: [A, iPa.id], grid: back });
  assert.ok(refused.reading.blocking.some((b: string) => /Development: fill at least one member’s box/.test(b)), JSON.stringify(refused.reading.blocking));
  assert.ok(refused.reading.blocking.some((b: string) => /Rebuild the chain key: with 2 of 2/.test(b)));
  back.layers[5] = { holders: [iPa.id], number: 1 };
  back.chainKey = 1;
  back.absence = 1;
  const change = await e.c.ask<any>('real change prepare', { collective: col, members: [A, iPa.id], grid: back });
  assert.deepEqual(change.reading.blocking, []);
  const cl = (await e.c.ask<Done>('real confirm', { plan: change.plan, digest: change.digest })).acts[0];
  const pa = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === cl);
  assert.equal(pa.reading.kind, 'clone');
  await iPa.c.ask<any>('accept', { thread: pa.thread });
  const g2 = await e.c.ask<any>('real gather', { act: cl });
  assert.equal(g2.standing.enough, true, 'every voice that remains signed: iPh’s is no longer counted');
});
