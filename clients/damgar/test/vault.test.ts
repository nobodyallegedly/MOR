// The vault (Money rules 2 and 3): declared with the chain key, so in Kišib
// (decided by Nobody, allegedly, 17 October 2026: "its setting belongs in
// Kišib"), shown in Damgar's Settings, read but never changed there; a
// payment above its limit goes to the vault, bound by the vault's own node,
// and verifies there; one at or below it goes to the flow.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, kishib, person, start, type Relay } from './world.ts';
import { changeKeys } from '../../kishib/test/world.ts';
import { TestNode } from './node.ts';
import type { Account, PaymentShown, Rails, ToSign } from '../src/shapes.ts';
import { MONEY, SPEC } from '../src/specs.ts';
import { Store } from '../src/store.ts';
import { lightningProof, moneyPayload, paymentCommitment, paymentProof, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { randomBytes } from 'node:crypto';

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

const items = async (p: Awaited<ReturnType<typeof person>>) => {
  await p.damgar.c.ask('look');
  return (await p.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
};

test('a vault declared in Kišib, shown in Damgar; above its limit, a payment goes to the vault and verifies there', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const alice = await person(H, R);
  const bob = await person(H, R);
  const flow = new TestNode();
  const vault = new TestNode();
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: flow.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: flow.key, network: 3, digest: rv.digest });
  assert.equal((await bob.damgar.c.ask<Rails>('rails')).vault, null);

  // Kišib: the change of keys, declaring a vault on the vault's node, limit 1 000.
  const k = await kishib();
  // Damgar's line is mostly sealed: Kišib keeps it from the card Damgar shows (its identity window).
  const line = (await bob.damgar.c.ask<{ identity: { line: { acts: number; latest: string; summary: string } } }>('state')).identity.line;
  const cards = `${line.latest} ${line.acts} ${line.summary}`;
  const review = await k.c.ask<{ plan: string; digest: string; sections: { heading: string; lines: { text: string }[] }[] }>('rotate plan', { id: bob.id, address: H[0], words: bob.dub.chainWords.join(' '), cards, vault: 'set', vaultUnit: SPEC.units.regtest, vaultNetwork: '3', vaultNode: vault.key, vaultLightningLimit: '1000' });
  const v = review.sections.find((s) => s.heading.startsWith('The vault'))!;
  assert.ok(v.lines.some((l) => /a single payment above 1 000 regtest satoshis must go to the vault/.test(l.text)), JSON.stringify(v));
  // H79: the new chain key's words first, before signing (a new paper), then the signing key's once it counts.
  const words = (await changeKeys(k.c, review)).signing;
  // Damgar takes the new words; its Settings show the vault, read, never changed there.
  await bob.damgar.c.ask('renew', { words: words.join(' ') });
  await bob.dub.c.ask('renew', { words: words.join(' ') });
  const r = await bob.damgar.c.ask<Rails>('rails');
  assert.deepEqual(r.vault?.entries.map((e) => e.said), ['a single payment above 1 000 regtest satoshis goes to your vault, not your flow']);

  // A tip of 5 000: to the vault, bound by the vault's node; one of 800: to the flow.
  for (const [value, node, to] of [[5000, vault, 'vault'], [800, flow, 'flow']] as const) {
    await alice.dub.c.ask('tip', { post: (await bob.dub.c.ask<{ post: { id: string } }>('post', { text: `${value}` })).post.id, signer: bob.id, value: String(value), unit: SPEC.units.regtest });
    const d = (await items(alice)).find((i) => i.kind === 'draft')!;
    assert.ok(d.lines.some((l) => new RegExp(`On Lightning, to their ${to}`).test(l.text)), JSON.stringify(d.lines));
    await alice.damgar.c.ask('sign draft', { id: d.id });
    const inv = (await items(bob)).find((i) => i.kind === 'invoice')!;
    const made = node.invoice(value, inv.descriptionHash!);
    await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
    await alice.damgar.c.ask('look');
    const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
    assert.equal(p.to, to);
    await alice.damgar.c.ask('paid', { key: p.key, proof: made.preimage });
    await bob.damgar.c.ask('sign receipt', { key: (await items(bob)).find((i) => i.kind === 'receipt')!.id });
  }
  await alice.damgar.c.ask('look');
  const a = await alice.damgar.c.ask<Account>('account');
  for (const p of a.payments) for (const x of p.proofs) {
    assert.equal(x.rail.answer, 'valid', JSON.stringify(x));
    assert.equal(x.beside.answer, 'valid', `${p.to}: as the vault in force allows (${x.beside.why})`);
  }

  // H46 (F355): Bob moves 3 000 from his wallet to his own vault. Read back first: the vault, the amount, the fee as far as Damgar can say, and that the money is spent only with the chain key and its record.
  const tr = await bob.damgar.c.ask<{ digest: string; lines: { text: string }[]; costs: { text: string }[]; blocking: string[] }>('vault transfer read', { entry: 0, value: '3000' });
  assert.deepEqual(tr.blocking, []);
  const said = tr.lines.map((l) => l.text).join(' ');
  assert.match(said, /To your vault: the entry on Lightning, its node/);
  assert.match(said, /3 000 regtest satoshis, from your wallet/);
  assert.match(said, /The fee: your wallet’s routing fee/);
  assert.match(tr.costs.map((l) => l.text).join(' '), /spent only with the chain key and its record/);
  assert.match(tr.costs.map((l) => l.text).join(' '), /One way only/);
  assert.deepEqual((await bob.damgar.c.ask<any>('vault transfer read', { entry: 0, value: '0' })).blocking, ['An amount is a whole number above zero.']);
  await assert.rejects(bob.damgar.c.ask('vault transfer', { entry: 0, value: '3000', digest: '00'.repeat(32) }), /not what was read back/);
  const bound = await bob.damgar.c.ask<{ key: string; lines: { text: string }[] }>('vault transfer', { entry: 0, value: '3000', digest: tr.digest });
  // The vault's node makes the invoice (on regtest, the test wallet on the vault's node); an invoice from the flow's node is refused.
  let mine = (await bob.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((x) => x.key === bound.key)!;
  assert.equal(mine.to, 'vault');
  assert.equal(mine.vaultInvoice?.descriptionHash, bound.key);
  await assert.rejects(bob.damgar.c.ask('vault invoice', { key: bound.key, invoice: flow.invoice(3000, bound.key).invoice }), /not your vault’s node/);
  const vi = vault.invoice(3000, bound.key);
  await bob.damgar.c.ask('vault invoice', { key: bound.key, invoice: vi.invoice });
  mine = (await bob.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((x) => x.key === bound.key)!;
  assert.equal(mine.pay?.invoice, vi.invoice);
  // Paid in the wallet, the preimage pasted back: checked by the rail Module, the record (the claim) sealed to Bob at his homes.
  await bob.damgar.c.ask('paid', { key: bound.key, proof: vi.preimage });
  const acc = await bob.damgar.c.ask<Account>('account');
  const rec = acc.payments.find((x) => x.key === bound.key)!;
  assert.equal(rec.stageSaid, 'moved to your vault: its record sealed to you at your homes');
  assert.equal(rec.proofs[0].rail.answer, 'valid', JSON.stringify(rec.proofs));
  const sealedAtHome = (await (await import('../../genesis/src/transport.ts')).relayAt(H[0]).feed({ to: bob.id })).items.filter((i) => i.kind === 'sealed').length;
  assert.ok(sealedAtHome > 0, 'the record sealed to Bob at his home');
  // The payment cMIP, draft 4 (F355): the transfer names the act that declared the vault as what it follows (step 4a), not Bob's payee pointer.
  const declaredBy = r.vault!.declaredBy;
  assert.match(tr.lines.map((l) => l.text).join(' '), /a transfer to yourself, which buys nothing/);
  const accepted = { money: MONEY, accepted: [SPEC.payment, SPEC.lightning.hash, SPEC.units.regtest] };
  // A claim into Bob's vault, as an outsider reads it: signed by `who`, naming `fulfils`.
  const claimInto = async (who: string, dir: string, fulfils: string, value: number) => {
    const signer = (await new Store(dir).identity(who))!;
    const amount = { unit: SPEC.units.regtest, value };
    const paidTo = { kind: 'vault', declaredBy, entry: 0 };
    const salt = new Uint8Array(randomBytes(16));
    const key = paymentCommitment({ rail: SPEC.lightning.hash, payee: bob.id, amount, fulfils, payer: who, paidTo, salt }) as string;
    const inv = vault.invoice(value, key);
    const rail = lightningProof(inv.invoice, unhex(inv.preimage)) as Uint8Array;
    const made = moneyPayload({ type: 'claim', rail: SPEC.lightning.hash, proof: paymentProof({ paidTo, salt, rail }), payee: bob.id, amount, fulfils }) as { type: number; payload: Uint8Array };
    const act = signer.sign(MONEY, made.type, made.payload, { public: true });
    const l = await lookUp(bob.id, H);
    if (who !== bob.id) await lookUp(who, H, {}, l.verifier);
    l.verifier.add(act.act);
    return (l.verifier.moneyJudge(act.id, accepted) as { rail: { answer: string; why: string } }).rail;
  };
  // Bob's own transfer, as its claim says it: valid.
  assert.equal((await claimInto(bob.id, bob.damgar.dir, declaredBy, 1200)).answer, 'valid');
  // Naming the vault declaration, but paid by Alice: invalid (step 4a), though the rail carried it.
  const byAlice = await claimInto(alice.id, alice.damgar.dir, declaredBy, 1200);
  assert.equal(byAlice.answer, 'invalid', JSON.stringify(byAlice));
  assert.match(byAlice.why, /step 4a/);
  // Draft 3's form, still read: Bob's own payee pointer as what it follows.
  const pointer = (await bob.damgar.c.ask<Rails>('rails')).pointer!.act;
  assert.equal((await claimInto(bob.id, bob.damgar.dir, pointer, 1300)).answer, 'valid');
});
