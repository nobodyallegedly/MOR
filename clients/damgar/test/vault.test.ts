// The vault (Money rules 2 and 3): declared with the chain key, so in Kišib
// (decided by Nobody, allegedly, 17 October 2026: "its setting belongs in
// Kišib"), shown in Damgar's Settings, read but never changed there; a
// payment above its limit goes to the vault, bound by the vault's own node,
// and verifies there; one at or below it goes to the flow.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, kishib, person, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { Account, PaymentShown, Rails, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';

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
  let s = await k.c.ask<any>('confirm', { plan: review.plan, digest: review.digest });
  if (s.sitting.stage === 'sent') s = await k.c.ask<any>('resend');
  assert.equal(s.sitting.stage, 'counts', JSON.stringify(s.sitting.lines));
  const words = (await k.c.ask<{ words: string[] }>('words show')).words;
  s = await k.c.ask<any>('words written');
  await k.c.ask('words typed', { typed: s.sitting.positions.map((p: number) => words[p - 1]) });
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
});
