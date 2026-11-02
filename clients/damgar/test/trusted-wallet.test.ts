// A collective paid to one trusted wallet (decided by Nobody, allegedly,
// round 10: "A collective can rely on a single wallet if they wish. The
// core is more about what can be built on top, rather than what it can do
// itself"; round 9's question 2, (a)). A collective founded in Edubba whose
// Money layer A alone holds; its payee pointer, made in Edubba by A with
// A's own key for it, names A's own wallet (one trusted pointer). A buyer's
// Damgar pays the collective: the commitment names the collective as payee,
// and, the collective having no key to seal to (rule 58), the invoice
// request goes to A, the member whose wallet its pointer names. A's Damgar
// answers for the collective with an invoice from A's node, checks the
// buyer's claim, and signs the collective's receipt with A's own key,
// naming the collective (rules 58 and 60), which Agreements count. A member
// with no voice in Money is refused. Real homes and a relay, test Lightning
// nodes, regtest satoshis. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, damgar, dub, edubba, person, refused, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { ACCEPTABLE, SPEC } from '../src/specs.ts';
import type { Account, PaymentShown, ToSign } from '../src/shapes.ts';
import { moneyRead, openWithKey } from '../../genesis/src/core.ts';
import { collectivePlaces, collectiveVerifier, judgeCollective } from '../../grants/src/member.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';

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

test('a collective paid to one trusted wallet: the member whose wallet its pointer names answers for it, and signs its receipt naming it', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const e = await edubba(H, RL);
  const A = await person(H, RL);
  const iPa = await dub(H, RL);
  const iPh = await dub(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.dub.words, address: H[0], linked: false });
  const all = [A.id, iPa.id, iPh.id];
  // Money: A alone, one key (the collective relies on A's wallet); every other layer as the collective tests found them.
  const grid = {
    members: all,
    constitution: { holders: all, number: 3 },
    chainKey: 2,
    absence: 2,
    layers: { 1: { holders: all, number: 1 }, 2: { holders: all, number: 1 }, 3: { holders: [A.id], number: 1 }, 4: { holders: all, number: 3 }, 5: { holders: [iPh.id], number: 1 } },
    areas: [],
    clone: 2,
    shares: { [A.id]: 34, [iPa.id]: 33, [iPh.id]: 33 },
  };
  const rv = await e.c.ask<any>('real found prepare', { name: 'One wallet', founder: A.id, members: [iPa.id, iPh.id], grid });
  const terms = (await e.c.ask<any>('real confirm', { plan: rv.plan, digest: rv.digest })).acts[0];
  for (const m of [iPa, iPh]) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    await m.c.ask('accept', { thread: p.thread });
  }
  await e.c.ask('real gather', { act: terms });
  const col = (await e.c.ask<any>('real found', { act: terms, read: true })).acts[0] as string;

  // A's wallet: A's own pointer, from A's Damgar; then the collective's pointer names it (Edubba's one trusted pointer).
  const node = new TestNode();
  const rr = await A.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await A.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rr.digest });
  const mp = await e.c.ask<any>('real money prepare', { collective: col, way: 'pointer', wallet: A.id, by: A.id });
  assert.deepEqual(mp.reading.blocking, []);
  assert.ok(JSON.stringify(mp.reading).includes('Every payment trusts one member'), 'its stated cost, said in Edubba');
  const ptr = (await e.c.ask<any>('real confirm', { plan: mp.plan, digest: mp.digest })).acts[0] as string;
  await A.damgar.c.ask('collective add', { id: col });

  // A buyer tips the collective from Damgar: the invoice request goes to A, the commitment naming the collective.
  const buyer = await person(H, RL);
  await buyer.damgar.c.ask('tip', { to: col, value: '2100', unit: R, whatFor: 'for the collective' });
  const draft = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
  const signed = await buyer.damgar.c.ask<{ lines: { text: string }[] }>('sign draft', { id: draft.id });
  assert.ok(signed.lines.some((l) => new RegExp(`${A.id.slice(0, 8)}.*the member whose wallet its pointer names, answers for it`).test(l.text)), JSON.stringify(signed.lines));

  // A's Damgar answers for the collective, with an invoice from A's node.
  await A.damgar.c.ask('look');
  const inv = (await A.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv, 'A is asked for an invoice, for the collective');
  const made = node.invoice(2100, inv.descriptionHash!);
  await A.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  const inA = (await A.damgar.c.ask<Account>('account')).payments.find((p) => p.side === 'in')!;
  assert.ok(inA.lines.some((l) => /To the collective .*whose pointer names your wallet: you answer for it/.test(l.text)), JSON.stringify(inA.lines));

  // The buyer pays; the claim goes to A; A checks it and signs the collective's receipt, by hand, naming the collective.
  await buyer.damgar.c.ask('look');
  const pay = (await buyer.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.equal(pay.other.id, col, 'the payee is the collective');
  assert.ok(pay.lines.some((l) => /answers for .*a collective paid to one member’s wallet/.test(l.text)), JSON.stringify(pay.lines));
  await buyer.damgar.c.ask('paid', { key: pay.key, proof: made.preimage });
  await A.damgar.c.ask('look');
  const rec = (await A.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'receipt')!;
  assert.ok(rec, 'the collective’s receipt waits for A, by hand');
  const r = await A.damgar.c.ask<{ lines: { text: string }[] }>('sign receipt', { key: rec.id });
  assert.ok(r.lines.some((l) => /for the collective .*with your own key, naming it/.test(l.text)), JSON.stringify(r.lines));

  // The buyer's account: settled, the claim valid; the receipt A signed for the collective, its payee the collective.
  await buyer.damgar.c.ask('look');
  const bp = (await buyer.damgar.c.ask<Account>('account')).payments.find((p) => p.key === pay.key)!;
  assert.equal(bp.stage, 'settled', JSON.stringify(bp));
  const claim = bp.proofs.find((x) => x.kind === 'claim')!;
  assert.equal(claim.rail.answer, 'valid');
  const receipt = bp.proofs.find((x) => x.kind === 'receipt')!;
  assert.equal(receipt.by.id, A.id, 'signed by A');
  assert.equal(receipt.rail.answer, 'valid', JSON.stringify(receipt));
  const book = JSON.parse(readFileSync(join(buyer.damgar.dir, 'identities', buyer.id, 'book.json'), 'utf8')) as { acts: Record<string, { act: string; key?: string }> };
  const k = book.acts[receipt.act];
  const rd = openWithKey(b64(k.act), b64(k.key!)) as { signer: string; payload: Uint8Array; objects?: [string, string][] };
  const ra = (moneyRead(2, rd.payload) as { act: { payee: string; payer: string } }).act;
  assert.deepEqual([rd.signer, ra.payee, ra.payer], [A.id, col, buyer.id]);
  assert.ok(rd.objects?.some(([c]) => c === col), 'it names the collective in objects (rule 58)');
  // Agreements: the receipt is the collective's act, its rule for Money met by A's key alone (rule 60); so is its pointer.
  const places = await collectivePlaces(col, [...RL, ...H]);
  const { v } = await collectiveVerifier(col, places);
  v.addWithKey(b64(k.act), b64(k.key!));
  const consent = v.agreementsConsent(AGREEMENTS_SPECS, receipt.act) as { kind: string; met: boolean };
  assert.equal(consent.met, true, `the collective’s receipt counts on A’s key: ${JSON.stringify(consent)}`);
  assert.equal((await judgeCollective(col, [ptr], places)).get(ptr)!.met, true, 'and its pointer');

  // iPh holds no voice in Money: their Damgar does not answer for the collective.
  const ph = await damgar();
  await ph.c.ask('bring', { id: iPh.id, words: iPh.words, address: H[0], relays: RL.join(' ') });
  await ph.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  await refused(ph.c.ask('collective add', { id: col }), /You hold no box in its Money area/);
});
