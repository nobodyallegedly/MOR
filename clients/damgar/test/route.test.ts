// Paying through a route (Money rule 24, decided by Nobody, allegedly, F414;
// the conversion cMIP draft 5; the suite's scenario 2, step 4l). A buyer
// pays a seller's vow through a conversion service, from Damgar: the
// payment is the service's own price tag, and the buyer's claim of that
// first hop keeps key 4 as the commitment names it (the service's tag) and
// cites the seller's tag in `refs`, carrying the referral the buyer
// followed. The service's receipt declaring the forward (field 7) and the
// seller's receipt of the onward hop (field 6) are made here with test
// identities, as a conversion service and a seller would sign them; the
// rail answers are stated to the core as the apps state them (`railValid`,
// `railPayments`, the Lightning Module's specification in `rails`). Then
// the core reads: the buyer is the route's first payer; their contest
// naming that claim is shown; a vow's sale through the route is confirmed
// by a later claim of theirs of that hop acknowledging the door's record;
// and the referral that claim carries fills the seller's role share. Real
// homes and a relay, a test Lightning node, regtest satoshis. Test
// identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, person, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { SPEC } from '../src/specs.ts';
import type { PaymentShown, ToSign } from '../src/shapes.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { MIRS, SPECS, Verifier, cborDecode, cborEncode, hex, lightningAddress, moneyPayload, moneyRead, openWithKey, publicationPayload, sha256, unhex } from '../../genesis/src/core.ts';
import { VOW, contestPurchase, vowPayload } from '../../dub/src/vows.ts';
import { putTag } from '../../barebone/src/tag.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP, splitPayload } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});

const R = SPEC.units.regtest;
const b64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
const json = (dir: string, id: string, name: string) => JSON.parse(readFileSync(join(dir, 'identities', id, `${name}.json`), 'utf8'));

/** A receipt (Money type 2) with a route's fields the binding does not write (field 6, the previous hop; field 7, a forward), encoded as the core reads them. */
function hopReceipt(r: { rail: string; proof: Uint8Array; payer: string; payee: string; value: number; fulfils: string; previous?: string; forward?: { next: string; value: number; agreement: string } }): Uint8Array {
  const made = moneyPayload({ type: 'receipt', rail: r.rail, proof: r.proof, payer: r.payer, payee: r.payee, amount: { unit: R, value: r.value }, fulfils: r.fulfils }) as { payload: Uint8Array };
  const m = cborDecode(made.payload) as Map<number, unknown>;
  if (r.previous) m.set(6, unhex(r.previous));
  if (r.forward) m.set(7, [unhex(r.forward.next), [unhex(R), r.forward.value], unhex(r.forward.agreement)]);
  return cborEncode(new Map([...m.entries()].sort(([a], [b]) => a - b)));
}

test('through a conversion service: the buyer’s claim of the first hop cites the seller’s tag, so the buyer contests, confirms the vow’s sale and carries the referral', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const at = [...RL, ...H];
  const buyer = await person(H, RL);
  const svc = await person(H, RL);
  const node = new TestNode();
  const rv = await svc.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await svc.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });

  // The conversion service's publication (a lone seller of its swap) and its price tag: the most one conversion takes in.
  const svcPath = join(svc.damgar.dir, 'identities', svc.id, 'identity.json');
  const svcKey = TestIdentity.load(svcPath);
  const sp = publicationPayload({ sold: [{ cmip: SPEC.conversion, params: cborEncode('Lightning to Lightning, for buyers') }], service: svc.id, plan: { shares: [], cmip: SPLIT_CMIP }, words: 'A swap: what you pay here, less 50, paid on to the seller you name.' }) as { type: number; payload: Uint8Array };
  const svcPub = await svcKey.publish(MIRS.agreements, sp.type, sp.payload, { public: true, relays: at });
  const svcTag = await putTag(svcKey, { publication: svcPub.id }, { price: { unit: R, value: 100_000 }, payee: svc.id, relays: at });
  svcKey.save(svcPath);

  // The seller (a test identity): a pointer, a vow, a lone seller's publication selling it with a referral share of 10%, its tag of 900.
  const seller = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await seller.publishGenesis();
  const sellerNode = new TestNode();
  const sptr = await seller.publish(MIRS.money, 0, (moneyPayload({ type: 'pointer', payee: seller.id, version: 1, previous: null, rails: [{ module: SPEC.lightning.hash, address: lightningAddressOf(sellerNode.key) }] }) as { payload: Uint8Array }).payload, { public: true, relays: at });
  const vow = await seller.publish(SPECS.envelopes, VOW, vowPayload('A seat at the concert, 20 December'), { public: true, relays: at });
  const pp = publicationPayload({ sold: [{ vow: vow.id }], service: seller.id, plan: { shares: [{ role: 'referral', part: 100_000 }], cmip: SPLIT_CMIP }, words: 'A vow: a seat at the concert. For 900 regtest satoshis; 10% to whoever led you here.' }) as { type: number; payload: Uint8Array };
  const pub = await seller.publish(MIRS.agreements, pp.type, pp.payload, { public: true, relays: at });
  const tag = await putTag(seller, { publication: pub.id }, { price: { unit: R, value: 900 }, payee: seller.id, relays: at });
  // Whoever led the buyer there: a repost of the publication, the act the buyer's claim names as its referral.
  const reposter = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await reposter.publishGenesis();
  const repost = await reposter.publish(sha256('a repost, test value'), 0, cborEncode(new Map([[0, 'a seat worth having']])), { public: true, relays: at, refs: [pub.id] });

  // The buyer, in Damgar: pays the service's tag, 950, for the seller's tag, citing it; the referral they followed in the claim.
  const asked = await buyer.damgar.c.ask<{ key: string; lines: { text: string }[] }>('pay tag', { tag: svcTag.id, payee: svc.id, cites: tag.id, value: '950', referral: { identity: reposter.id, evidence: repost.id }, whatFor: 'a seat, through a swap' });
  assert.ok(asked.lines.some((l) => /cites the seller’s tag/.test(l.text)), JSON.stringify(asked.lines));
  await svc.damgar.c.ask('look');
  const inv = (await svc.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv, 'the service is asked for an invoice');
  const made = node.invoice(950, inv.descriptionHash!);
  await svc.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  await buyer.damgar.c.ask('look');
  const pay = (await buyer.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.ok(pay.lines.some((l) => /your claim of this first hop cites it, so you are the buyer at the seller/.test(l.text)), JSON.stringify(pay.lines));
  const paid = await buyer.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: pay.key, proof: made.preimage });
  assert.ok(paid.lines.some((l) => /It cites the seller’s price tag/.test(l.text)), JSON.stringify(paid.lines));

  // The buyer's claim, as Damgar signed it: key 4 the service's tag (the commitment's), the seller's tag in refs, the referral in key 6.
  const book = json(buyer.damgar.dir, buyer.id, 'book') as { payments: Record<string, { claims: string[] }>; acts: Record<string, { act: string; key?: string }> };
  const claimId = book.payments[pay.key].claims[0];
  const ck = book.acts[claimId];
  const cd = openWithKey(b64(ck.act), b64(ck.key!)) as { signer: string; payload: Uint8Array; refs?: string[] };
  const c = (moneyRead(3, cd.payload) as { act: { fulfils: string; proof: Uint8Array; referral?: { identity: string } | null } }).act;
  assert.equal(c.fulfils, svcTag.id, 'key 4 stays the commitment’s: the service’s tag (a request rail refuses another)');
  assert.deepEqual(cd.refs, [tag.id], 'the seller’s tag cited in refs');
  assert.equal(c.referral?.identity, reposter.id);

  // The service's receipt of the first hop, declaring the forward to the seller (field 7); the seller's receipt of the onward hop (field 6).
  const svcKey2 = TestIdentity.load(svcPath);
  const r1 = await svcKey2.publish(MIRS.money, 2, hopReceipt({ rail: SPEC.lightning.hash, proof: new Uint8Array(c.proof), payer: buyer.id, payee: svc.id, value: 950, fulfils: svcTag.id, forward: { next: seller.id, value: 900, agreement: svcPub.id } }), { public: true, relays: at });
  svcKey2.save(svcPath);
  const onward = new TextEncoder().encode('the swap pays the seller, for the seat');
  const r2 = await seller.publish(MIRS.money, 2, hopReceipt({ rail: SPEC.lightning.hash, proof: onward, payer: svc.id, payee: seller.id, value: 900, fulfils: tag.id, previous: r1.id }), { public: true, relays: at, objects: [[r1.id, r1.id]] });

  // Everything a reader holds: the chains, the public acts, and the buyer's claim with its key (it is sealed to the service).
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const signers = [buyer.id, svc.id, seller.id, reposter.id];
  const hold = async () => {
    for (const id of signers) await lookUp(id, at, {}, v);
    for (const h of at) {
      for (const id of signers) {
        for (const it of (await relayAt(h).feed({ signer: id })).items) {
          if (it.kind !== 'act') continue;
          try {
            v.add(it.item);
          } catch {
            // private, or held
          }
        }
      }
    }
    v.addWithKey(b64(ck.act), b64(ck.key!));
  };
  await hold();
  const svcPtr = (v.moneyPointer(MIRS.money, svc.id) as { act: string }).act;
  const first = sha256('the first hop, one Lightning payment');
  const second = sha256('the onward hop, one payment');
  const specs = (extra: string[] = []) => ({
    ...AGREEMENTS_SPECS,
    rails: [hex(SPEC.lightning.content)],
    railValid: [[claimId, svcPtr, null], [r1.id, svcPtr, null], [r2.id, sptr.id, null], ...extra.map((x) => [x, svcPtr, null])],
    railPayments: [[hex(new Uint8Array(c.proof)), first], [hex(onward), second]],
  });

  // (a) The buyer is the route's first payer; their contest naming that claim is shown beside the purchase.
  const rb = v.moneyRouteBuyer(specs(), r2.id) as { buyer: string; payer: string; claim: string };
  assert.deepEqual([rb.buyer, rb.payer, rb.claim], ['the first payer', buyer.id, claimId], JSON.stringify(rb));
  const buyerPath = join(buyer.damgar.dir, 'identities', buyer.id, 'identity.json');
  const buyerKey = TestIdentity.load(buyerPath);
  const contest = await contestPurchase(buyerKey, { purchase: claimId, promise: 'Not the seat promised.', relays: at });
  buyerKey.save(buyerPath);
  await hold();
  assert.deepEqual(v.agreementsPurchaseContests(specs(), claimId), [contest], 'the first payer’s contest is shown');

  // (b) The vow's sale through the route: the buyer's, pending; confirmed by a later claim of theirs of that hop acknowledging the door's record.
  const vowSales = (x: string[] = []) => (v.agreementsVow(specs(x), vow.id) as { sales: { act: string; buyer: string; state: string }[] }).sales.map((s) => [s.act, s.buyer, s.state]);
  assert.deepEqual(vowSales(), [[claimId, buyer.id, 'pending']]);
  const door = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await door.publishGenesis();
  signers.push(door.id);
  const scanned = await door.publish(sha256('a ticketing Module, test'), 0, cborEncode(new Map([[0, 'seat 3, scanned']])), { public: true, relays: at, refs: [vow.id] });
  const confirmed = await buyer.damgar.c.ask<{ claim: string }>('confirm purchase', { key: pay.key, acks: [scanned.id] });
  await hold();
  // The sale's act is the buyer's citing claim of the first hop with the smallest id (S7j, question 4, as built): the first claim
  // or the confirming one, whichever id sorts first.
  const after = vowSales([confirmed.claim]);
  assert.equal(after.length, 1, JSON.stringify(after));
  assert.ok([claimId, confirmed.claim].includes(after[0][0]), JSON.stringify(after));
  assert.deepEqual(after[0].slice(1), [buyer.id, 'confirmed'], 'confirmed by the later claim of the first hop, citing the tag');

  // (c) The referral the first hop's claim carries fills the seller's role share: the seller's split of the onward receipt.
  const split = await seller.publish(MIRS.agreements, AGREEMENTS_TYPES.split, splitPayload({ receipt: r2.id, payouts: [{ receiver: reposter.id, amount: 90, role: 'referral', evidence: repost.id }, { receiver: seller.id, amount: 810 }], cmip: SPLIT_CMIP, publication: pub.id, number: 1 }), { public: true, relays: at });
  await hold();
  const e = v.agreementsSplit(specs([confirmed.claim]), split.id) as { unevidenced: string[]; problems: string[] };
  assert.deepEqual(e.unevidenced, [], `the referral is the first payer’s, carried by their claim of the first hop: ${JSON.stringify(e)}`);
});

/** A Lightning payee address on regtest, as the rail Module writes it. */
function lightningAddressOf(nodeKey: string): Uint8Array {
  return lightningAddress({ network: 3, node: nodeKey }) as Uint8Array;
}
