// Bitcoin anchoring of a release, as an option (F338: "only as an option for
// the release and the collectives acts"; F339: releases and their anchoring
// move from Edubba to Ummia). Ummia signs no money act. It prepares the
// anchor's payment as a draft of the money messages cMIP, sealed to the
// identity itself at its homes; Damgar, holding the same identity, reads it,
// checks the service's ticket, and signs it or not (the working rule: the
// layers apart, talking through MOR).
//
// As Edubba does for a collective's act (`clients/desk/src/money.ts`): the
// leaf is the release's id mixed with a random blind Ummia keeps (the
// anchoring cMIP, item 5 and client conformance), so the service never
// learns which act it anchors; then Ummia follows the anchor: the service's
// publication of the batch holding the leaf (with the key its output is
// tweaked from, F341), and, against the chain Ummia follows (on a computer,
// the regtest node given), the act's batch anchor under the Bitcoin clock
// Module's rule. The web client follows no chain, and says so.
//
// Nothing from Node: the web client runs it too (the chain is the program's).
//
// TEST IDENTITIES ONLY, and test networks only.

import { MIRS, anchoringBatch, anchoringLeaf, anchoringReadOffer, anchoringReadPublication, batchAnchor, batchAnchorCheck, describeAct, hex, merkleBranch, randomBytes, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { sendDraft } from '../../damgar/src/messages.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import { say } from '../../damgar/src/units.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import type { Line } from './shapes.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Said where anchoring is offered, beside a release (the anchoring cMIP). */
export const ANCHOR_SAY = [
  'Optional. An anchor puts this release’s fingerprint on the Bitcoin chain through a pooled anchoring service, so anyone can later see it existed by a given block.',
  'The service is sent a leaf: the release’s id mixed with a random secret (the blind) Ummia keeps. It never learns the release. A lost blind loses the anchor’s use.',
  'You pay the service’s price in Damgar, following its standing offer: Ummia prepares the payment, sealed to you, and signs no money act. The service’s ticket promises a batch and a deadline (a block).',
  'Round 1 runs on regtest, with a test anchoring service of ours, labelled: its coins are worth nothing.',
];

/** An anchor asked, as kept: with its blind, which never leaves this app. */
export interface Asked {
  act: string;
  label: string;
  blind: string;
  leaf: string;
  service: string;
  offer: string;
  tier: number;
  draft: string;
  at: number;
}

export interface Offer {
  act: string;
  tiers: { price: number; blocks: number }[];
  unit: string;
  network: number | null;
  words: string | null;
}

export interface AnchorShown {
  act: string;
  label: string;
  service: string;
  tier: number;
  state: 'asked' | 'published' | 'anchored' | 'pending' | 'invalid' | 'unknown';
  lines: Line[];
}

/** Where a service's acts are: its outbox routes, its homes, and the places given. */
async function placesOf(service: string, hints: string[], via: Via) {
  const l = await lookUp(service, hints, via);
  const places = [...new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...hints])];
  return { l, places };
}

/** A service's standing offers under the anchoring cMIP (Agreements standing offers), read from its public acts (the feed's `signer` and `spec` filters). */
export async function offers(service: string, hints: string[], via: Via = {}): Promise<Offer[]> {
  const { l, places } = await placesOf(service, hints, via);
  const out = new Map<string, Offer>();
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via).feed({ signer: service, spec: MIRS.agreements })).items) {
        if (it.kind !== 'act') continue;
        try {
          const o = anchoringReadOffer(it.item) as Offer & { id: string };
          l.verifier.add(it.item);
          if (l.verifier.status(o.id) === 'valid') out.set(o.id, { act: o.id, tiers: o.tiers, unit: o.unit, network: o.network, words: o.words });
        } catch {
          // not an anchoring offer
        }
      }
    } catch {
      // that place is away
    }
  }
  return [...out.values()];
}

/**
 * Ask for an anchor of an act (a release): a fresh blind, the leaf, and a
 * draft for Damgar paying the tier's price under the service's offer,
 * sealed to the identity itself. Returns what to keep.
 */
export async function ask(me: TestIdentity, a: { act: string; label: string; service: string; offer: Offer; tier: number; hints: string[]; via: Via; save: () => Promise<void> }): Promise<{ asked: Asked; lines: Line[] }> {
  const tier = a.offer.tiers[a.tier];
  if (!tier) throw new Error('The offer has no such tier.');
  const blind = new Uint8Array(randomBytes(32));
  const leaf = anchoringLeaf(a.act, blind) as string;
  const r = await sendDraft(me, { what: 'anchor', other: a.service, amount: { unit: a.offer.unit, value: tier.price }, whatFor: `an anchor of ${a.label}`, app: 'Ummia', anchor: { offer: a.offer.act, tier: a.tier, leaf } }, { via: a.via, save: a.save });
  const asked: Asked = { act: a.act, label: a.label, blind: hex(blind), leaf, service: a.service, offer: a.offer.act, tier: a.tier, draft: r.id, at: Math.floor(Date.now() / 1000) };
  return {
    asked,
    lines: [
      { text: `Asked: an anchor of ${a.label} (${a.act.slice(0, 8)}…), by ${short(a.service)}, tier ${a.tier} (within ${tier.blocks} blocks), for ${say({ unit: a.offer.unit, value: tier.price }, new Set([a.offer.unit]))}.`, tone: 'ok' },
      { text: `The payment is prepared, not signed: sealed to you at your homes (${r.left.join(', ')}), it waits in Damgar, in To sign. The blind is kept here.` },
    ],
  };
}

/** The service's publication of the batch holding this leaf, if published. */
async function publication(x: Asked, hints: string[], via: Via): Promise<{ batch: number; leaves: string[]; tx: string; output: number; key: string | null } | null> {
  const { l, places } = await placesOf(x.service, hints, via);
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via).feed({ signer: x.service, spec: SPEC.anchoring, type: 3 })).items) {
        if (it.kind !== 'act') continue;
        const d = describeAct(it.item) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
        if (d.spec !== SPEC.anchoring || d.type !== 3 || !d.payload) continue;
        l.verifier.add(it.item);
        if (l.verifier.status(d.id) !== 'valid') continue;
        const p = anchoringReadPublication(d.payload) as { offer: string; batch: number; leaves: string[]; tx: string; output: number; key: string | null } | null;
        if (p && p.offer === x.offer && p.leaves.includes(x.leaf)) return p;
      }
    } catch {
      // that place is away
    }
  }
  return null;
}

/** Where an anchor asked stands: published in a batch, then anchored, checked against the chain followed. */
export async function standing(x: Asked, hints: string[], via: Via, chain: ChainSource | null): Promise<AnchorShown> {
  const shown: AnchorShown = { act: x.act, label: x.label, service: x.service, tier: x.tier, state: 'asked', lines: [] };
  try {
    const pub = await publication(x, hints, via);
    if (!pub) {
      shown.lines.push({ text: 'Not in a published batch yet: paid in Damgar? The service publishes each batch it anchors.' });
      return shown;
    }
    shown.state = 'published';
    shown.lines.push({ text: `In the service’s batch ${pub.batch}, published, its transaction ${pub.tx.slice(0, 12)}… (output ${pub.output}).`, tone: 'ok' });
    if (!pub.key) {
      shown.state = 'unknown';
      shown.lines.push({ text: 'The publication does not name the key its output is tweaked from (F341): the anchor cannot be checked from the service’s acts alone.', tone: 'warn' });
      return shown;
    }
    if (!chain) {
      shown.state = 'unknown';
      shown.lines.push({ text: 'Ummia follows no chain here: the anchor cannot be checked against Bitcoin. On a computer, open Ummia with --regtest.', tone: 'warn' });
      return shown;
    }
    // Bitcoin writes txids reversed: the publication holds the core's byte order.
    const t = await chain.tx(hex(unhex(pub.tx).reverse()));
    const headers = await chain.headers();
    const batch = anchoringBatch(pub.leaves) as { count: number; branches: string[][] };
    const index = pub.leaves.indexOf(x.leaf);
    let block;
    if (t.block) block = { index: t.block.index, branch: merkleBranch(t.block.txids, t.block.index) as Uint8Array[], headers: headers.headers.slice(t.block.height - headers.start, t.block.height - headers.start + 6) };
    const proof = batchAnchor({ blind: unhex(x.blind), index, count: batch.count, branch: batch.branches[index], key: pub.key, tx: t.raw, output: pub.output, block }) as Uint8Array;
    const v = batchAnchorCheck(x.act, proof, headers) as { answer: string; why: string; point?: number };
    shown.state = v.answer === 'valid' ? 'anchored' : (v.answer as AnchorShown['state']);
    shown.lines.push(v.answer === 'valid' ? { text: `Anchored at block ${v.point}, on the chain followed (${chain.said}): checked by the Bitcoin clock Module’s rule.`, tone: 'ok' } : { text: `Not yet anchored: ${v.answer}, ${v.why}.`, tone: v.answer === 'invalid' ? 'bad' : 'warn' });
  } catch (e) {
    shown.state = 'unknown';
    shown.lines.push({ text: message(e), tone: 'warn' });
  }
  return shown;
}
