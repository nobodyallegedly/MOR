// Round 3, part C, item 8: keepers, and a member's rotation disowning a
// signature, shown as a dispute, not a void.
//
// The cast (A in Edubba, iPa and iPh each in their own Dub) found a
// collective. Its money terms name a keeper, an Edubba agent. Every member
// signs them; Edubba records them; the agent keeps (Agreements rules 37,
// 40): it records each act around the collective as it arrives, its
// signers' rotations first, one public act per record (OF21 a, d). Then iPh
// changes their keys in Kišib, leaving out the line their Dub signed on (a
// phone lost, say): their signature on the money terms is void under
// Identity. The agent records the rotation after the signature. Edubba
// shows it as a dispute, not a void: the collective's line placed it before
// any line registering that rotation (C5, F302), and the keeper recorded it
// before the rotation (rule 41); the money terms stay in force.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectiveNow } from '../../grants/src/member.ts';
import { keeperLog } from '../../grants/src/keeper.ts';
import { closeAll, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import { changeKeys, kishib } from '../../kishib/test/world.ts';
import { closeAll as closeKishib } from '../../kishib/test/world.ts';
import { SplitService } from '../../split-service/src/service.ts';
import { foundCollective } from './cast.ts';
import type { Done } from '../src/page/api.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  await closeKishib();
  for (const h of [...homes, relay]) await h.stop();
});

const OWN = 'sk-ant-api03-FAKE-edubba-keeper-never-real-WXYZ';

test('keepers: an Edubba agent records the collective’s acts; a member’s rotation disowning their signature is shown as a dispute, not a void', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const A = await dub(H, RL);
  const [iPa, iPh] = [await dub(H, RL), await dub(H, RL)];
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.words, address: H[0] });
  const { collective } = await foundCollective(e, A.id, [iPa, iPh], [{ name: 'Publishing', layer: 1, holders: [A.id, iPa.id, iPh.id], number: 1 }]);

  // An Edubba agent, owned by A: the keeper.
  const add = await e.c.ask<{ agent: string; terms: { digest: string } }>('agent add', { name: 'Keeper of the tablets', owner: A.id, key: OWN, own: true });
  const keeper = add.agent;
  await e.c.ask('machine publish', { agent: keeper, owner: A.id, digest: add.terms.digest, own: true });

  // The money terms, naming the agent as keeper, signed by every member, recorded.
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), { nodeKey: async () => '02'.padEnd(66, '1'), addInvoice: async () => ({ invoice: '', hash: '' }), settled: async () => null, pay: async () => '' }, { homes: H, relays: RL });
  await svc.start();
  const review = await e.c.ask<any>('real money prepare', { collective, shares: { [A.id]: 50, [iPa.id]: 25, [iPh.id]: 25 }, referral: 0, service: svc.id, serviceKey: svc.grantKey(collective), keepers: [keeper], keepersNeeded: 1 });
  assert.deepEqual(review.reading.blocking, []);
  assert.match(JSON.stringify(review.reading), /Keeper of the tablets.*an act counts as recorded once every one of them recorded it/);
  const clone = (await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest })).acts[0];
  for (const m of [iPa, iPh]) {
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: clone });
  await e.c.ask<Done>('real money record', { act: clone });

  // The agent keeps: every act around the collective, each party's rotations first; a second round records nothing new.
  let k = await e.c.ask<any>('real keepers', { collective });
  assert.deepEqual(k.keepers.map((x: any) => [x.id, x.agent, x.here]), [[keeper, true, true]]);
  assert.equal(k.rule, 1);
  assert.deepEqual(k.disputes, []);
  const first = await e.c.ask<Done>('real keep', { collective, keeper });
  assert.ok(first.acts.length > 3, JSON.stringify(first.lines));
  assert.equal((await e.c.ask<Done>('real keep', { collective, keeper })).acts.length, 0);
  const log = (await keeperLog(keeper, [...H, ...RL])).map((x) => x.act);
  await assert.rejects(e.c.ask('real keep', { collective, keeper: iPa.id }), /no keeper its agreement in force names/);

  // iPh changes their keys in Kišib, leaving out the line their Dub signed the money terms on (a phone lost, say).
  const sig = (await e.c.ask<any>('real gather', { act: clone })).proposal.answers[iPh.id].signature as string;
  const kk = await kishib();
  const probe = await kk.c.ask<any>('rotate plan', { id: iPh.id, address: H[0], words: iPh.chainWords.join(' ') });
  const lines = probe.sections.find((x: any) => /Its lines/.test(x.heading)).lines.map((l: any) => l.text as string);
  await kk.c.ask('cancel', { plan: probe.plan }).catch(() => undefined);
  const where = lines.find((t: string) => t.includes(sig));
  const r = await kk.c.ask<any>('rotate plan', { id: iPh.id, address: H[0], words: iPh.chainWords.join(' '), leaveOut: where && /Kept\.$/.test(where) ? [sig] : [] });
  assert.deepEqual(r.blocking, []);
  assert.ok(r.warning, 'Kišib warns that a line left out becomes void');
  // H79: the new paper written before the change is signed, the new signing key's words once it counts.
  await changeKeys(kk.c, r);

  // The agent records the rotation, after the signature.
  const second = await e.c.ask<Done>('real keep', { collective, keeper });
  assert.ok(second.lines.some((l) => /A rotation of /.test(l.text)), JSON.stringify(second.lines));
  const log2 = (await keeperLog(keeper, [...H, ...RL])).map((x) => x.act);
  assert.deepEqual(log2.slice(0, log.length), log, 'the keeper’s sequence only grows');

  // Edubba: iPh's signature is void under Identity, shown as a dispute, not a void; the money terms stay in force.
  k = await e.c.ask<any>('real keepers', { collective });
  const d = k.disputes.find((x: any) => x.member === iPh.id);
  assert.ok(d, JSON.stringify(k.disputes));
  assert.match(d.status, /void|disputed/);
  assert.equal(d.version, clone);
  assert.equal(d.counts, true, 'the collective’s line placed it before any line registering the rotation (C5, F302)');
  assert.deepEqual(d.keepers, [keeper], 'the keeper recorded it before recording the rotation (rule 41)');
  assert.ok(log2.indexOf(d.signature) < log2.indexOf(d.rotation));
  assert.equal(k.disputes.filter((x: any) => x.member !== iPh.id).length, 0, 'the other members’ signatures stand');
  assert.equal((await collectiveNow(collective, [...H, ...RL])).agreement, clone, 'its money terms stay in force');
});
