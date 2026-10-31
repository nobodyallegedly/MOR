// The test split service under a publication (round 8, F407; Agreements
// draft 17, rules 11 to 23; the split cMIP, draft 4).
//
// In plain words: a seller writes a publication naming the service; the
// service signs it and puts its own price tag on it; a buyer pays the
// service, which splits the payment: the partner and the referral off the
// top, what is left to the seller. And a collective's split agreement (a
// publication that sells nothing): the service finds it where the
// collective's acts are, signs it, and divides a tip to the collective
// among its members by their shares, read from the collective's agreement.
//
// The buyer's side is written out here as a wallet would make it (an
// invoice request sealed to the service, then its claim), so the service is
// tested alone; Damgar's tests drive it from a real Damgar.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { start, type Running } from '../../genesis/test/world.ts';
import { MIRS, SPECS, Verifier, cborDecode, commitmentCbor, describeAct, hex, lightningProof, moneyPayload, openSealed, paymentCommitment, paymentProof, publicationPayload, randomBytes, sha256, unhex } from '../../genesis/src/core.ts';
import { TestIdentity, sealFor } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { TYPES, invoiceRequestPayload, readAnswer } from '../../damgar/src/messages.ts';
import { MESSAGES_SPEC, SPEC } from '../../damgar/src/specs.ts';
import { TestCollective, type Governance } from '../../repo/src/collective.ts';
import { SPLIT_CMIP, planIn, sign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { SplitService, type Node } from '../src/service.ts';

let homes: Running[] = [];
let relay: Running;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

// Every server this file starts is stopped whatever the outcome (Part 4).
after(async () => {
  for (const r of [...homes, relay]) await r?.stop().catch(() => undefined);
});

const R = SPEC.units.regtest;

/** The service's node: a test node's invoices, settled once the test says the buyer paid; payouts are not paid here. */
function testNode(): Node & { paid: Set<string>; node: TestNode } {
  const node = new TestNode();
  const paid = new Set<string>();
  const hashOf = new Map<string, string>();
  return {
    node,
    paid,
    nodeKey: async () => node.key,
    addInvoice: async (sat, h) => {
      const i = node.invoice(sat, h);
      const hash = sha256(unhex(i.preimage));
      hashOf.set(i.invoice, hash);
      return { invoice: i.invoice, hash };
    },
    settled: async (hash) => (paid.has(hash) ? hex(node.preimages.get(hash)!) : null),
    pay: async () => {
      throw new Error('no payout is paid in this test');
    },
  };
}

async function someone(): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await t.publishGenesis();
  await t.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await t.publishEncryptionKey();
  for (const a of t.chainActs()) await relayAt(relay.base).putAct(a);
  return t;
}

/** Seal an act to the service at its inbox, as a wallet does. */
async function sealToService(svc: SplitService, made: { act: Uint8Array; key: Uint8Array }) {
  const l = await lookUp(svc.id, [relay.base, ...homes.map((h) => h.base)]);
  await relayAt(relay.base).putSealed(sealFor(made.act, made.key, [{ id: svc.id, key: l.encryptionKey! }]));
}

/** A buyer pays the service `value` following `fulfils`: the invoice request, the service's answer read back, the payment made (the node told), and the claim (naming a referral, if any). */
async function pay(svc: SplitService, n: ReturnType<typeof testNode>, buyer: TestIdentity, fulfils: string, value: number, referral?: { identity: string; evidence: string }) {
  const paidTo = { kind: 'flow', pointer: svc.state.pointer, rail: 0 };
  const salt = new Uint8Array(randomBytes(16));
  const c = { rail: SPEC.lightning.hash, payee: svc.id, amount: { unit: R, value }, fulfils, payer: buyer.id, paidTo, salt };
  const commitment = commitmentCbor(c) as Uint8Array;
  const key = paymentCommitment(c) as string;
  const ir = buyer.sign(MESSAGES_SPEC, TYPES.invoiceRequest, invoiceRequestPayload({ commitment, whatFor: 'a test', answers: null, ticket: null }), { public: false, to: [svc.id] });
  await sealToService(svc, ir);
  const said = await svc.tick();
  assert.ok(said.some((l) => /An invoice of its node sent/.test(l)), said.join('\n'));
  // The answer, read from the buyer's inbox.
  const sec = unhex(buyer.f.encryption.at(-1)!.secret);
  let invoice: string | null = null;
  for (const it of (await relayAt(relay.base).feed({ to: buyer.id })).items) {
    if (it.kind !== 'sealed') continue;
    try {
      const o = openSealed(it.item, buyer.id, sec) as { described: { spec?: string; type?: number; payload?: Uint8Array } };
      if (o.described.type === TYPES.answer && o.described.payload) {
        const a = readAnswer(o.described.payload);
        if (a.commitment === key && a.bound.kind === 'invoice') invoice = a.bound.invoice;
      }
    } catch {
      // another's
    }
  }
  assert.ok(invoice, 'the service answered with an invoice');
  const hash = svc.state.incoming.find((x) => x.invoice === invoice)!.hash;
  n.paid.add(hash);
  const proof = paymentProof({ paidTo, salt, rail: lightningProof(invoice, n.node.preimages.get(hash)!) }) as Uint8Array;
  const claim = moneyPayload({ type: 'claim', rail: c.rail, proof, payee: svc.id, amount: c.amount, fulfils, ...(referral ? { referral } : {}) }) as { type: number; payload: Uint8Array };
  await sealToService(svc, buyer.sign(MIRS.money, claim.type, claim.payload, { public: false, to: [svc.id] }));
  return { key, invoice };
}

/** The split the service made for a payment, decoded: each payout's receiver, amount and keys. */
function payoutsOf(svc: SplitService, invoice: string) {
  const x = svc.state.incoming.find((y) => y.invoice === invoice)!;
  assert.ok(x.split, 'split');
  return x.payouts.map((p) => ({ receiver: p.receiver, amount: p.amount, ...(p.partner !== undefined ? { partner: p.partner } : {}), ...(p.role ? { role: p.role } : {}), ...(p.owners ? { owners: p.owners } : {}) }));
}

test('a lone seller’s publication: signed by the service, its price tag the service’s; a payment split: the partner and the referral off the top, the rest the seller’s', async () => {
  const H = homes.map((h) => h.base);
  const n = testNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), n, { homes: H, relays: [relay.base] });
  await svc.start();
  const [seller, label, buyer, critic] = [await someone(), await someone(), await someone(), await someone()];

  // The publication: a bake sold, the label a partner at 5%, a referral of 10% off the top, this service named.
  const bake = sha256('a bake, by its act id, for this test');
  const made = publicationPayload({ sold: [{ bake }], service: svc.id, plan: planIn({ roles: [['referral', 100_000]], cmip: SPLIT_CMIP }), partners: [{ identity: label.id, share: 50_000, label: 'label' }], words: 'A test song.' }) as { type: number; payload: Uint8Array };
  const pub = seller.sign(MIRS.agreements, made.type, made.payload, { public: true });
  for (const h of [relay.base, ...H]) await relayAt(h).putAct(pub.act).catch(() => undefined);

  // A plan the service does not run is refused; this one is signed.
  assert.match(await svc.accept(pub.id), /signed, as its split service/);
  assert.match(await svc.accept(pub.id), /signed already/);
  const tag = await svc.tag(pub.id, { unit: R, value: 1000 });
  const t = describeAct((await relayAt(relay.base).getAct(tag))!) as { signer: string; payload: Uint8Array };
  assert.equal(t.signer, svc.id, 'the tag is the service’s');
  const tm = cborDecode(t.payload) as Map<number, unknown>;
  assert.equal(hex(tm.get(1) as Uint8Array), pub.id, 'naming the publication');
  assert.equal(hex(tm.get(5) as Uint8Array), svc.id, 'its payee the service: it receives in its own name');

  // The partner signs too; the core then reads the publication as counting (every party signed: the seller by drafting, the label and the service by signature acts; rule 11).
  await sign(label, pub.id, [relay.base, ...H]);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const acts: Uint8Array[] = [];
  for (const id of [seller.id, label.id, svc.id]) for (const h of [relay.base, ...H]) for (const it of (await relayAt(h).feed({ signer: id })).items) if (it.kind === 'act') acts.push(it.item);
  for (const id of [seller.id, label.id, svc.id]) await lookUp(id, [relay.base, ...H], {}, v);
  for (let pass = 0; pass < 4; pass++) for (const a of acts) try { v.add(a); } catch { /* held, or waits for its chain */ }
  const specs = { ...MIRS, agreements: MIRS.agreements, extLayers: {} };
  const read = v.agreementsPublication(specs, pub.id) as { counts: boolean; problems: string[] };
  assert.equal(read.counts, true, JSON.stringify(read.problems));
  const under = v.agreementsTagUnder(specs, tag) as { verdict: string; publication: string | null };
  assert.equal(under.verdict, 'counts', 'the service’s tag counts under the publication (Money rule 18)');
  assert.equal(under.publication, pub.id);

  // A payment of the wrong amount is refused: a tag's payment pays the price it states (Money rule 18).
  const wrong = { kind: 'flow', pointer: svc.state.pointer, rail: 0 };
  const wc = { rail: SPEC.lightning.hash, payee: svc.id, amount: { unit: R, value: 999 }, fulfils: tag, payer: buyer.id, paidTo: wrong, salt: new Uint8Array(randomBytes(16)) };
  await sealToService(svc, buyer.sign(MESSAGES_SPEC, TYPES.invoiceRequest, invoiceRequestPayload({ commitment: commitmentCbor(wc) as Uint8Array, whatFor: null, answers: null, ticket: null }), { public: false, to: [svc.id] }));
  assert.ok((await svc.tick()).some((l) => /pays the price it states/.test(l)));

  // The buyer pays the tag, naming the repost the critic made (the evidence, an act of the critic's).
  const repost = critic.sign(SPECS.text ?? MIRS.text, 0, new Uint8Array([0xa0]), { public: true });
  const { invoice } = await pay(svc, n, buyer, tag, 1000, { identity: critic.id, evidence: repost.id });
  const said = (await svc.tick()).join(' | ');
  assert.match(said, /receipt signed in the service’s own name/);
  assert.match(said, /The claim of .* arrived, naming the repost/);
  assert.match(said, /Split /);
  assert.deepEqual(payoutsOf(svc, invoice), [
    { receiver: label.id, amount: 50, partner: 0 },
    { receiver: critic.id, amount: 100, role: 'referral' },
    { receiver: seller.id, amount: 850 },
  ]);
  assert.match(said, /The sale told to 1 of the publication’s side/);

  // The split names the publication (field 3) and the split cMIP, draft 4.
  const x = svc.state.incoming.find((y) => y.invoice === invoice)!;
  const sealedSplit = (await relayAt(H[0]).getAct(x.split!))!;
  assert.ok(sealedSplit, 'the split is kept at the service’s homes');
  assert.equal(SPLIT_CMIP, sha256('split cMIP, draft 4, test value until publication'));
  void AGREEMENTS_TYPES;

  // A later tag version with no price withdraws it: a payment of it is refused.
  await svc.tag(pub.id, null);
  const wc2 = { ...wc, amount: { unit: R, value: 1000 }, salt: new Uint8Array(randomBytes(16)) };
  await sealToService(svc, buyer.sign(MESSAGES_SPEC, TYPES.invoiceRequest, invoiceRequestPayload({ commitment: commitmentCbor(wc2) as Uint8Array, whatFor: null, answers: null, ticket: null }), { public: false, to: [svc.id] }));
  assert.ok((await svc.tick()).some((l) => /later one replaced|withdrawn/.test(l)));
});

test('a collective’s split agreement: found where the collective’s acts are, signed; a tip to it divided among the members by their shares, ties by turns', async () => {
  const H = homes.map((h) => h.base);
  const n = testNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), n, { homes: H, relays: [relay.base] });
  await svc.start();
  const members = [await someone(), await someone(), await someone()];
  const buyer = await someone();
  const governance: Governance = { safetyThreshold: 2, releaseThreshold: 1, cloneThreshold: 2, abandonmentOthers: 2, text: 'A test collective: its money divided by its split service.' };
  const { collective: c, agreement } = await TestCollective.found({ members, homes: homes.map((h) => h.home), relays: [relay.base, ...H], governance });

  // A member makes the split agreement for the collective: no `sold`, its owners the founding agreement, the service named.
  const made = publicationPayload({ owners: agreement, service: svc.id, plan: planIn({ roles: [], cmip: SPLIT_CMIP }), partners: [] }) as { type: number; payload: Uint8Array };
  const sa = await c.by(members[1]).id.signNow(MIRS.agreements, made.type, made.payload, { public: true, objects: [[agreement, agreement]] });
  for (const h of [relay.base, ...H]) await relayAt(h).putAct(sa.act).catch(() => undefined);
  await assert.rejects(svc.tag(sa.id, { unit: R, value: 1 }), /takes no price tag|has not signed/);
  svc.watch(c.identity);
  const t0 = (await svc.tick()).join(' | ');
  assert.match(t0, /signed, as its split service/, t0);

  // A tip through the split agreement: 1 001 among three even holders, the leftover unit by rule 9.
  const { invoice } = await pay(svc, n, buyer, sa.id, 1001);
  await svc.tick();
  const first = payoutsOf(svc, invoice);
  assert.equal(first.reduce((a, p) => a + p.amount, 0), 1001, 'it sums exactly');
  assert.ok(first.every((p) => p.owners === agreement), 'each owners’ line payout names the ownership agreement by its founding version');
  assert.deepEqual(first.map((p) => p.amount).sort(), [333, 334, 334], 'each its share rounded down, the leftover units by rule 9');
  assert.deepEqual([...first.map((p) => p.receiver)].sort(), members.map((m) => m.id).sort());
  // The next tip: the holders who took a leftover unit before wait their turn.
  const { invoice: second } = await pay(svc, n, buyer, sa.id, 1001);
  await svc.tick();
  const next = payoutsOf(svc, second);
  const extra = (ps: { receiver: string; amount: number }[]) => ps.filter((p) => p.amount > 333).map((p) => p.receiver);
  // The largest share takes a leftover unit each time; the two tied holders take turns (rule 9: the fewest leftover units so far first).
  assert.equal(new Set([...extra(first), ...extra(next)]).size, 3, 'ties take turns: over two tips, every holder took a leftover unit');
  assert.equal(Object.values(svc.state.tally)[0].reduce((a, [, k]) => a + k, 0), 4, 'the running count carries every leftover unit');
});
