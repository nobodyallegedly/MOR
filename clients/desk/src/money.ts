// Money, prepared in Edubba and signed in Damgar (F338; the working rule of
// 17 October 2026: the test apps keep the layers apart and talk through
// MOR). Edubba signs no money act. It prepares:
//
// - **a payment** from one of the identities it holds to another identity
//   (a member of a collective, say): a draft of the money messages cMIP,
//   sealed to that identity itself at its homes, for its Damgar to read,
//   sign or decline. Payments by a collective itself are round 2 (decided
//   by Nobody, allegedly, 17 October 2026).
// - **Bitcoin anchoring of a collective's act**, an option only (F338: "only
//   as an option for the release and the collectives acts"; releases and
//   their anchoring move to Ummia, F339): the leaf (the act's id mixed with
//   a random blind Edubba keeps, so the service never learns the act; the
//   anchoring cMIP, item 5 and client conformance), the service's standing
//   offer and the tier chosen, and the price, in a draft for Damgar. Then
//   Edubba follows the anchor: the service's publication of the batch
//   holding the leaf, and, against the chain Edubba follows (on this
//   computer, the regtest node given), the act's batch anchor under the
//   Bitcoin clock Module's rule.
//
// Kept in Edubba's folder, `money/anchors.json`: each anchor asked, with its
// blind (a lost blind loses the anchor's use). TEST IDENTITIES ONLY.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { anchoringBatch, anchoringLeaf, anchoringReadOffer, anchoringReadPublication, batchAnchor, batchAnchorCheck, describeAct, hex, merkleBranch, randomBytes } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { readId } from '../../genesis/src/forms.ts';
import { sendDraft } from '../../damgar/src/messages.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import { UNITS_MODULES, readValue, say } from '../../damgar/src/units.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import type { Line } from '../../collective/src/explain.ts';
import type { Desk, Done } from './desk.ts';
import type { Real } from './real.ts';
import type { Store } from './store.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Said wherever Edubba prepares money. */
export const MONEY_SAY = 'Prepared here, not signed here: Edubba seals a draft to the identity at its homes, and Damgar, holding the same identity, reads it to you and signs it or not. Edubba signs no money act and holds no wallet.';

/** Said where anchoring is offered (F338, the anchoring cMIP). */
export const ANCHOR_SAY = [
  'Optional. An anchor puts this act’s fingerprint on the Bitcoin chain through a pooled anchoring service, so anyone can later see it existed by a given block.',
  'The service is sent a leaf: the act’s id mixed with a random secret (the blind) Edubba keeps. It never learns the act. A lost blind loses the anchor’s use.',
  'You pay the service’s price in Damgar, following its standing offer; its ticket promises a batch and a deadline (a block). Left out of its batch, or late, the price is owed back under its offer.',
  'Round 1 runs on regtest, with a test anchoring service of ours, labelled: its coins are worth nothing.',
];

interface Asked {
  collective: string;
  act: string;
  label: string;
  /** The blind, hex: kept here, never sent. */
  blind: string;
  leaf: string;
  service: string;
  offer: string;
  tier: number;
  identity: string;
  draft: string;
  at: number;
}

export interface AnchorShown {
  act: string;
  label: string;
  service: string;
  tier: number;
  state: 'asked' | 'published' | 'anchored' | 'pending' | 'invalid' | 'unknown';
  lines: Line[];
}

export class EdubbaMoney {
  constructor(
    readonly desk: Desk,
    readonly store: Store,
    readonly real: Real,
    readonly chain: ChainSource | null = null,
  ) {}

  private get via() {
    return this.store.settings().via;
  }

  private file() {
    const d = this.store.path('money');
    mkdirSync(d, { recursive: true, mode: 0o700 });
    return join(d, 'anchors.json');
  }

  private asked(): Asked[] {
    return existsSync(this.file()) ? (JSON.parse(readFileSync(this.file(), 'utf8')) as Asked[]) : [];
  }

  private keep(xs: Asked[]) {
    const tmp = `${this.file()}.tmp`;
    writeFileSync(tmp, JSON.stringify(xs, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, this.file());
  }

  /** The units a draft may name, regtest first. */
  units(): { hash: string; label: string }[] {
    const all = UNITS_MODULES.flatMap((m) => m.units.map((u) => ({ hash: u.hash, label: `${u.many} (${m.name})`, regtest: u.network === 3 })));
    all.sort((a, b) => Number(b.regtest) - Number(a.regtest));
    return all.map(({ hash, label }) => ({ hash, label }));
  }

  /** A payment from an identity held here to another identity, prepared as a draft for Damgar. */
  pay(a: { identity: string; to: string; value: string; unit: string; whatFor?: string }): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.store.identity(a.identity);
      let to: string;
      try {
        to = readId(a.to);
      } catch (e) {
        throw new Error(`To: ${message(e)}. Nothing was prepared.`);
      }
      if (to === me.id) throw new Error('That is this identity itself. Nothing was prepared.');
      if (!this.units().some((u) => u.hash === a.unit)) throw new Error('Choose a unit. Nothing was prepared.');
      const value = readValue(a.value);
      const r = await sendDraft(me, { what: 'pay', other: to, amount: { unit: a.unit, value }, whatFor: a.whatFor?.trim().slice(0, 280) || null, app: 'Edubba', anchor: null }, { via: this.via, save: async () => this.store.saveIdentity(me) });
      return {
        title: 'Prepared for Damgar',
        acts: [r.id],
        lines: [
          { text: `Prepared, not signed: a payment of ${say({ unit: a.unit, value }, new Set([a.unit]))} to ${short(to)}, sealed to ${short(me.id)} at its homes (${r.left.join(', ')}).`, tone: 'ok' },
          { text: 'Open Damgar with this identity: it waits there, in To sign.' },
        ],
      };
    });
  }

  /** The acts of a real collective held here that may be anchored: its genesis, its agreement in force and its member changes. Never its releases (Ummia's, F339). */
  anchorable(collective: string): { act: string; label: string }[] {
    const c = this.real.collective(collective);
    const out = [{ act: collective, label: 'Its founding: the collective’s genesis' }];
    if (c.f.agreement) out.push({ act: c.f.agreement, label: 'Its agreement in force' });
    for (const a of c.f.agreements ?? []) if (a !== c.f.agreement && !out.some((x) => x.act === a)) out.push({ act: a, label: `An earlier agreement (${a.slice(0, 8)}…)` });
    return out;
  }

  /** A service's standing offers under the anchoring cMIP, read from its public acts. */
  async offers(service: string): Promise<{ act: string; tiers: { price: number; blocks: number }[]; unit: string; network: number | null; words: string | null }[]> {
    const id = readId(service);
    const s = this.store.settings();
    const l = await lookUp(id, [...s.relays, ...s.homes.map((h) => h.hint)], this.via);
    const places = [...new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...s.relays])];
    const out = new Map<string, { act: string; tiers: { price: number; blocks: number }[]; unit: string; network: number | null; words: string | null }>();
    for (const h of places) {
      try {
        for (const it of (await relayAt(h, this.via).feed({ signer: id })).items) {
          if (it.kind !== 'act') continue;
          try {
            const o = anchoringReadOffer(it.item) as { id: string; tiers: { price: number; blocks: number }[]; unit: string; network: number | null; words: string | null };
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
   * Ask for an anchor of a collective's act: a fresh blind (32 random bytes,
   * the anchoring cMIP's client conformance), the leaf, and a draft for
   * Damgar paying the tier's price under the service's offer, sealed to the
   * identity acting here.
   */
  ask(a: { identity: string; collective: string; act: string; service: string; offer: string; tier: number }): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.store.identity(a.identity);
      const act = this.anchorable(a.collective).find((x) => x.act === a.act);
      if (!act) throw new Error('That is not an act of this collective that may be anchored here.');
      const service = readId(a.service);
      const offer = (await this.offers(service)).find((o) => o.act === a.offer);
      if (!offer) throw new Error('No such standing offer of that service was found under the anchoring cMIP.');
      const tier = offer.tiers[a.tier];
      if (!tier) throw new Error('The offer has no such tier.');
      const blind = new Uint8Array(randomBytes(32));
      const leaf = anchoringLeaf(a.act, blind) as string;
      const r = await sendDraft(me, { what: 'anchor', other: service, amount: { unit: offer.unit, value: tier.price }, whatFor: `an anchor of ${act.label.toLowerCase()}`, app: 'Edubba', anchor: { offer: offer.act, tier: a.tier, leaf } }, { via: this.via, save: async () => this.store.saveIdentity(me) });
      this.keep([...this.asked(), { collective: a.collective, act: a.act, label: act.label, blind: hex(blind), leaf, service, offer: offer.act, tier: a.tier, identity: me.id, draft: r.id, at: Math.floor(Date.now() / 1000) }]);
      return {
        title: 'An anchor asked',
        acts: [r.id],
        lines: [
          { text: `Asked: ${act.label.toLowerCase()} (${a.act.slice(0, 8)}…), anchored by ${short(service)}, tier ${a.tier} (within ${tier.blocks} blocks), for ${say({ unit: offer.unit, value: tier.price }, new Set([offer.unit]))}.`, tone: 'ok' },
          { text: 'The payment is prepared, not signed: it waits in Damgar, in To sign, for this identity. The blind is kept here.' },
        ],
      };
    });
  }

  /** Where each anchor asked for this collective stands: published in a batch, then anchored, checked against the chain Edubba follows. */
  async anchors(collective: string): Promise<AnchorShown[]> {
    const out: AnchorShown[] = [];
    for (const x of this.asked().filter((y) => y.collective === collective)) {
      const shown: AnchorShown = { act: x.act, label: x.label, service: x.service, tier: x.tier, state: 'asked', lines: [] };
      try {
        const pub = await this.publication(x);
        if (!pub) {
          shown.lines.push({ text: 'Not in a published batch yet: paid in Damgar? The service publishes each batch it anchors.' });
        } else {
          shown.state = 'published';
          shown.lines.push({ text: `In the service’s batch ${pub.batch}, published, its transaction ${pub.tx.slice(0, 12)}… (output ${pub.output}).`, tone: 'ok' });
          if (!pub.key) {
            shown.state = 'unknown';
            shown.lines.push({ text: 'The publication does not name the key its output is tweaked from (the anchoring cMIP draft 5 has no such field): the anchor cannot be checked from the service’s acts alone.', tone: 'warn' });
          } else if (!this.chain) {
            shown.state = 'unknown';
            shown.lines.push({ text: 'Edubba follows no chain here: the anchor cannot be checked against Bitcoin. Open Edubba with --regtest.', tone: 'warn' });
          } else {
            const v = await this.check(x, pub);
            shown.state = v.answer === 'valid' ? 'anchored' : (v.answer as AnchorShown['state']);
            shown.lines.push(v.answer === 'valid' ? { text: `Anchored at block ${v.point}, on the chain followed (${this.chain.said}): checked by the Bitcoin clock Module’s rule.`, tone: 'ok' } : { text: `Not yet anchored: ${v.answer}, ${v.why}.`, tone: v.answer === 'invalid' ? 'bad' : 'warn' });
          }
        }
      } catch (e) {
        shown.state = 'unknown';
        shown.lines.push({ text: message(e), tone: 'warn' });
      }
      out.push(shown);
    }
    return out;
  }

  private async publication(x: Asked): Promise<{ batch: number; leaves: string[]; tx: string; output: number; key: string | null } | null> {
    const s = this.store.settings();
    const l = await lookUp(x.service, [...s.relays, ...s.homes.map((h) => h.hint)], this.via);
    const places = [...new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...s.relays])];
    for (const h of places) {
      try {
        for (const it of (await relayAt(h, this.via).feed({ signer: x.service })).items) {
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

  private async check(x: Asked, pub: { leaves: string[]; tx: string; output: number; key: string | null }) {
    const chain = this.chain!;
    // Bitcoin writes txids reversed: the publication holds the core's byte order.
    const shownTxid = hex(Uint8Array.from(Buffer.from(pub.tx, 'hex')).reverse());
    const t = await chain.tx(shownTxid);
    const headers = await chain.headers();
    const batch = anchoringBatch(pub.leaves) as { count: number; branches: string[][] };
    const index = pub.leaves.indexOf(x.leaf);
    let block;
    if (t.block) block = { index: t.block.index, branch: merkleBranch(t.block.txids, t.block.index) as Uint8Array[], headers: headers.headers.slice(t.block.height - headers.start, t.block.height - headers.start + 6) };
    const proof = batchAnchor({ blind: Buffer.from(x.blind, 'hex'), index, count: batch.count, branch: batch.branches[index], key: pub.key!, tx: t.raw, output: pub.output, block }) as Uint8Array;
    return batchAnchorCheck(x.act, proof, headers) as { answer: string; why: string; point?: number };
  }
}
