// What an identity held here received, read for the seller's alarm
// (Agreements rule 45b, client conformance) and the assessment of terms
// received: kept when Claude's drafts and the received-items piles were
// removed (round 4 of the redesign, decided: "Drafts can be removed"; "It's
// a mailbox behavior type of things"). The desk's program, through the
// page's requests.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDENTITY_TYPES, MIRS, SPECS, WITNESS_EXPLANATION, cborEncode, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { readPost } from '../../barebone/src/post.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { decodeDraft, encodeDraft, loadAnswer, loadLinked, saveDraft, type Draft } from '../../connector/src/draft.ts';
import { DESK_SPECS } from '../src/specs.ts';
import type { Done } from '../src/page/api.ts';
import { handed, state, waiting, words, world, type World } from './setup.ts';

let w: World;
/** The author's identity, and "Machine, allegedly", both held at the desk. */
let me: string;
let machine: string;

before(async () => {
  w = await world();
  const a = await w.client.ask<Done>('identity', { name: 'Me', linked: false });
  const b = await w.client.ask<Done>('identity', { name: 'Machine, allegedly', linked: true });
  me = a.acts[0];
  machine = b.acts[0];
});

after(async () => {
  await w?.stop();
});

test('a payment naming the other branch of a forked deal raises the alarm at the desk', async () => {
  const { lonePublicationPayload, SPLIT_CMIP, splitPayload } = await import('../../repo/src/agreements.ts');
  const relays = [w.relay.base];
  const seller = w.app.store.identity(machine);
  const service = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await service.publishGenesis();
  for (const a of service.chainActs()) await relayAt(w.relay.base).putAct(a);
  // The seller's own publication of a song (a lone seller's: it takes the owners' line), its split service named.
  const p = await seller.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.publication, lonePublicationPayload({ sold: [{ bake: 'b'.repeat(64) }], service: service.id, plan: { roles: [], cmip: SPLIT_CMIP } }), { public: true, relays });
  w.app.store.saveIdentity(seller);
  for (const n of [1, 3]) {
    const s = splitPayload({ receipt: `${n}`.padStart(64, '0'), payouts: [{ receiver: machine, amount: 1 }], cmip: 'c'.repeat(64), publication: p.id, number: n });
    await service.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, s, { public: true, relays, to: [machine] });
  }
  await w.client.ask('refresh', { identity: machine });
  const got = (await state(w.client)).identities.find((i) => i.id === machine)!.received;
  const splits = got.filter((x) => x.from === service.id);
  assert.equal(splits.length, 2);
  const alarm = splits.map((x) => x.alarm ?? '').join(' ');
  assert.match(alarm, /ALARM .*split numbered 2 .*not shown/);
  // QF4 (decided by Nobody, allegedly, 9 October 2026, F190): a repeated
  // number is a deviation that breaks the plan.
  const s = splitPayload({ receipt: '9'.padStart(64, '0'), payouts: [{ receiver: machine, amount: 1 }], cmip: 'c'.repeat(64), publication: p.id, number: 3 });
  await service.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, s, { public: true, relays, to: [machine] });
  await w.client.ask('refresh', { identity: machine });
  const again = (await state(w.client)).identities.find((i) => i.id === machine)!.received.filter((x) => x.from === service.id);
  assert.match(again.map((x) => x.alarm ?? '').join(' '), /number 3 is carried by 2 splits: a deviation that breaks the plan/);
});
