// Round 3, part A (F353; Agreements draft 16): a real collective founded from
// the grid, each member naming a key of their own in their signature, made
// as they sign, its private half sealed to themself; then the collective's
// acts made with those keys, judged by the core as anyone reads them. One
// Edubba (the founder, A) and two Dubs (iPa, iPh), against real homes and a
// relay on local ports.
//
// - The grid of the author's cast: Publishing, everyone, one key; Money, A
//   and iPa, one key, two above 10,000 regtest satoshis (the grant limits
//   cMIP, draft 2); Development, iPh alone.
// - Each signature names a key; each key opens from its holder's homes with
//   the holder's own encryption key, and nowhere is its secret kept in a folder.
// - A's key posts alone; the act shows which member signed.
// - A's key moves 50,000: above the cap, one key is not enough; iPa signs it
//   in Dub's Signing tab, with iPa's own key, and it counts.
// - iPh's key cannot act in Money, an area iPh does not hold.

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
import { chainFor, judgeCollective, memberKeyFor, publishAt, readMemberKeys, signAsMember } from '../../grants/src/member.ts';
import { MIRS, REGTEST_UNIT, type Grid } from '../src/grid.ts';
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

test('F353: members name their own keys as they sign the founding, and act for the collective with them', async () => {
  const e = await edubba();
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const iPa = await dub();
  const iPh = await dub();
  const hints = [relay.base, ...homes.map((h) => h.base)];

  const grid: Grid = {
    members: [A, iPa.id, iPh.id],
    constitution: { holders: [A, iPa.id, iPh.id], number: 3 },
    chainKey: 2,
    absence: 2,
    areas: [
      { name: 'Publishing', layer: 1, holders: [A, iPa.id, iPh.id], number: 1 },
      { name: 'Money', layer: 2, holders: [A, iPa.id], number: 1, cap: 10_000 },
      { name: 'Development', layer: 4, holders: [iPh.id], number: 1 },
    ],
    clone: 2,
  };
  const review = await e.c.ask<any>('real found prepare', { name: 'Three tablets', founder: A, members: [iPa.id, iPh.id], grid });
  assert.deepEqual(review.reading.blocking, []);
  const said = review.reading.sections.map((s: any) => s.heading);
  assert.deepEqual(said.slice(0, 4), ['The constitution', 'The judges', 'The areas', 'Each member']);
  assert.ok(review.reading.sections[2].lines.some((l: any) => /“Money”: all money .*above 10,000 regtest satoshis an act, 2 keys/.test(l.text)));
  const proposed = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const terms = proposed.acts[0];
  assert.ok(proposed.lines.some((l) => /^A .*’s own key for this collective is named in the signature and sealed/.test(l.text)), JSON.stringify(proposed.lines));

  // Each member reads it, the areas in plain words, and signs: a key of their own, named and sealed.
  for (const m of [iPa, iPh]) {
    const p = (await m.c.ask<any>('proposals')).proposals[0];
    assert.ok(p.reading.sections.some((s: any) => s.lines.some((l: any) => /Above 10,000 an act, one more holder's key/.test(l.text))), 'the cap read back in Dub');
    const r = await m.c.ask<any>('accept', { thread: p.thread });
    assert.ok(r.lines.some((l: any) => /Your own key for this collective was made and named in your signature/.test(l.text)), JSON.stringify(r.lines));
  }
  const g = await e.c.ask<any>('real gather', { act: terms });
  assert.equal(g.standing.enough, true);
  const col = (await e.c.ask<Done & { show: string[] }>('real found', { act: terms, read: true })).acts[0];

  // Every signature names a key (signature field 1).
  for (const id of [A, iPa.id, iPh.id]) {
    const sig = (await relayAt(relay.base).feed({ signer: id })).items.map((x) => describeAct(x.item) as any).find((d) => d.spec === REPO_SPECS.agreements && d.type === 1);
    const m = cborDecode(sig.payload) as Map<number, unknown>;
    assert.equal(hex(m.get(0) as Uint8Array), terms);
    assert.ok(Array.isArray(m.get(1)), `${id.slice(0, 8)}'s signature names a key`);
  }

  // Each key opens from its holder's homes, with its holder's own encryption key; no folder keeps its secret.
  const secretsOf = (dir: string, id: string, file = join(dir, 'identities', id, 'identity.json')) => (JSON.parse(readFileSync(file, 'utf8')).encryption as { secret: string }[]).map((x) => unhex(x.secret));
  const aFile = join(e.dir, 'identities', `${A}.json`);
  const keyA = (await readMemberKeys(A, secretsOf('', A, aFile), [homes[0].base, homes[1].base]))[0];
  const keyPa = (await readMemberKeys(iPa.id, secretsOf(iPa.dir, iPa.id), [homes[0].base]))[0];
  const keyPh = (await readMemberKeys(iPh.id, secretsOf(iPh.dir, iPh.id), [homes[0].base]))[0];
  for (const k of [keyA, keyPa, keyPh]) assert.equal(k?.terms, terms);
  assert.equal((await memberKeyFor([keyA], col, hints))?.act, keyA.act);
  const folders = [everything(e.dir), everything(iPa.dir), everything(iPh.dir)].join('\n');
  for (const k of [keyA, keyPa, keyPh]) assert.ok(!folders.includes(hex(k.secret)) && !folders.includes(Buffer.from(k.secret).toString('base64')), 'a member key’s secret is in no folder: sealed at the homes only');
  // Another member's encryption key opens none of them.
  assert.equal((await readMemberKeys(A, secretsOf(iPa.dir, iPa.id), [homes[0].base])).length, 0);

  // A's key posts alone in Publishing: the act shows which member signed.
  const atA = await chainFor(col, keyA, hints);
  const post = signAsMember(col, keyA, atA, { spec: MIRS.text, type: 0, payload: textPayload('Posted by A, with A’s own key.'), public: true });
  assert.ok((await publishAt([post.act], hints)).length);
  let j = await judgeCollective(col, [post.id], hints);
  assert.equal(j.get(post.id)!.met, true, JSON.stringify(j.get(post.id)));
  assert.deepEqual(j.get(post.id)!.areas[0].byKey, [A]);

  // A's key promises 50,000: above Money's cap one key is not enough.
  const big = signAsMember(col, keyA, atA, { spec: MIRS.money, type: 1, payload: obligationPayload({ debtor: col, creditor: iPh.id, unit: REGTEST_UNIT, value: 50_000, pointer: '11'.repeat(32) }), public: true });
  assert.ok((await publishAt([big.act], hints)).length);
  j = await judgeCollective(col, [big.id], hints, {}, [[big.id, false]]);
  assert.equal(j.get(big.id)!.met, false);
  assert.deepEqual([j.get(big.id)!.areas[0].needed, j.get(big.id)!.areas[0].limits], [2, 'above']);
  // No verdict of the limits cMIP: unknown, never counted.
  assert.equal((await judgeCollective(col, [big.id], hints)).get(big.id)!.areas[0].limits, 'unknown');

  // A asks iPa for the second key, as a release is asked; iPa signs it in Dub with iPa's own key.
  const me = e.app.store.identity(A);
  const reach = { id: iPa.id, key: (await lookUp(iPa.id, hints)).encryptionKey!, inbox: [relay.base] };
  await negotiate(me, reach, { text: 'A promise of 50,000 regtest satoshis: above the Money area’s cap, it needs your key too.', refs: [[big.id, col], [col, col]] });
  e.app.store.saveIdentity(me);
  const p = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === big.id);
  assert.equal(p.reading.kind, 'act');
  assert.match(p.reading.title, /Sign a money act of the collective: obligation/);
  assert.ok(p.reading.sections[0].lines.some((l: any) => /50,000/.test(l.text)));
  const signed = await iPa.c.ask<any>('accept', { thread: p.thread });
  assert.match(signed.lines[0].text, /Signed for the collective with your own key/);
  j = await judgeCollective(col, [big.id], hints, {}, [[big.id, false]]);
  assert.equal(j.get(big.id)!.met, true, JSON.stringify(j.get(big.id)));
  assert.deepEqual([...j.get(big.id)!.areas[0].byKey].sort(), [A, iPa.id].sort(), 'two keys, each a member’s own');

  // iPh's key cannot act in Money, an area iPh does not hold.
  const atPh = await chainFor(col, keyPh, hints);
  const stray = signAsMember(col, keyPh, atPh, { spec: MIRS.money, type: 1, payload: obligationPayload({ debtor: col, creditor: iPa.id, unit: REGTEST_UNIT, value: 10, pointer: '11'.repeat(32) }), public: true });
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
  assert.equal((await iPh.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms).left, left.resignation);
  await assert.rejects(iPh.c.ask('leave read', { thread: founding.thread }), /already published its resignation/);

  // A's Edubba finds it, registers it at the collective's line, then proposes the change without iPh.
  let rc = await e.c.ask<any>('real collective', { collective: col });
  assert.deepEqual(rc.resigned.map((r: any) => [r.member, r.act, r.registered]), [[iPh.id, left.resignation, null]]);
  const reg = await e.c.ask<Done>('real register resignation', { collective: col, act: left.resignation });
  assert.match(reg.lines[0].text, /counts in no rule and no area/);
  rc = await e.c.ask<any>('real collective', { collective: col });
  assert.equal(rc.resigned[0].registered, reg.acts[0]);
  const back = (await e.c.ask<{ grid: Grid }>('real grid', { collective: col, members: [A, iPa.id] })).grid;
  assert.deepEqual(back.areas.map((l) => [l.name, l.holders.length]), [['Publishing', 2], ['Money', 2], ['Development', 0]], 'iPh’s area left with nobody');
  const refused = await e.c.ask<any>('real change prepare', { collective: col, members: [A, iPa.id], grid: back });
  assert.ok(refused.reading.blocking.some((b: string) => /“Development”: fill at least one member’s box/.test(b)), JSON.stringify(refused.reading.blocking));
  assert.ok(refused.reading.blocking.some((b: string) => /Rebuild the chain key: with 2 of 2/.test(b)));
  back.areas[2].holders = [iPa.id];
  back.chainKey = 1;
  back.absence = 1;
  const change = await e.c.ask<any>('real change prepare', { collective: col, members: [A, iPa.id], grid: back });
  assert.deepEqual(change.reading.blocking, []);
  const cl = (await e.c.ask<Done>('real confirm', { plan: change.plan, digest: change.digest })).acts[0];
  const pa = (await iPa.c.ask<any>('proposals')).proposals.find((x: any) => x.act === cl);
  assert.equal(pa.reading.kind, 'clone');
  const r2 = await iPa.c.ask<any>('accept', { thread: pa.thread });
  assert.ok(r2.lines.some((l: any) => /Your own key for this collective was made and named in your signature/.test(l.text)), 'a new key at the member change');
  const g2 = await e.c.ask<any>('real gather', { act: cl });
  assert.equal(g2.standing.enough, true, 'every voice that remains signed: iPh’s is no longer counted');
});
