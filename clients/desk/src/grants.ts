// An agent acting under its owner's grant (decided by Nobody, allegedly, 17
// October 2026, "an example of grant"; film 2): the owner grants an agent
// authority (what it may sign, how much it may spend, for how long); the
// agent accepts by signing; every act it signs under the grant shows on
// whose authority. Built on the shared piece, `clients/grants` (Agreements
// rules 73 to 80, F128; Text rule 14's second case, F343; the grant limits
// cMIP, F345), which Damgar's round 2 lanes reuse.
//
// The owner's grant is an everyday act of the owner's own key, public. The
// grant key is made here as the agent's (the grantee makes and holds it),
// its secret kept beside the agent's file, owner-only, never published.

import { MIRS, describeAct, sha256 } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import type { Reference } from '../../genesis/src/identity.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { GRANTABLE, acceptance, authorityOf, grantInWords, makeGrantKey, personGrantPayload, readGrant, revocationPayload, signUnderGrant, type Authority, type GrantKey, type Kind } from '../../grants/src/grant.ts';
import { refuseBeforeSigning, type Limits } from '../../grants/src/limits.ts';
import { BITCOIN_UNITS } from '../../damgar/src/units.ts';
import type { Desk, Done } from './desk.ts';
import type { Store } from './store.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
/** A revocation (Agreements type 10). */
const REVOCATION = 10;
const idOf = (act: Uint8Array) => (describeAct(act) as { id: string }).id;

/** A grant this agent holds from its owner, as kept here. */
export interface GrantHeld extends GrantKey {
  /** The grant's payload, base64. */
  payload: string;
  time: number;
  /** Its acceptance, signed by the agent, or why it declined. */
  accepted: string | null;
  declined: string | null;
  revoked: string | null;
}

/** Said where a grant is made. */
export const GRANT_SAY =
  'A grant lets your agent sign in your name, within what you choose: which acts, how much one act may move, until when. It holds a key of its own for it, never yours; every act it signs that way names the grant, so anyone reading it sees it was signed by your agent, on your authority. One revocation ends it.';

/** A unit's name, from the units Module Damgar knows. */
export const unitName = (u: string) => BITCOIN_UNITS.units.find((x) => x.hash === u)?.many ?? `units ${u.slice(0, 8)}…`;

/** A layer's number, as Agreements reads a kind (F106): Identity 0, Envelopes and Text 1, Money 2, Agreements 3, Development 4. */
const layerOf = (spec: string): number | null =>
  spec === MIRS.identity ? 0 : spec === MIRS.text || spec === MIRS.envelopes ? 1 : spec === MIRS.money ? 2 : spec === MIRS.agreements ? 3 : spec === MIRS.development ? 4 : null;

const reaches = (kinds: Kind[] | null, spec: string, type: number) => !kinds || kinds.some((k) => ('layer' in k ? layerOf(spec) === k.layer : k.spec === spec && k.type === type));

export interface GrantAsk {
  /** Keys of `GRANTABLE`: posts, publications, money. */
  kinds: string[];
  /** The most one act may move, in regtest satoshis unless a unit is named. */
  cap?: number | null;
  unit?: string;
  /** Until when, as a timestamp clock's identity and a time in seconds. */
  expiry?: { clock: string; time: number } | null;
}

export class AgentGrants {
  /** Grants shown and not yet signed: by the digest of exactly what would be signed, with the key made for it. */
  private shown = new Map<string, { agent: string; owner: string; payload: Uint8Array; secret: Uint8Array; time: number }>();

  constructor(
    private readonly desk: Desk,
    private readonly store: Store,
  ) {}

  held(agent: string): GrantHeld[] {
    return this.store.grants<GrantHeld>(agent);
  }

  private save(agent: string, g: GrantHeld[]): void {
    this.store.saveGrants(agent, g);
  }

  private limitsOf(a: GrantAsk): Limits | undefined {
    const l: Limits = {};
    if (a.cap !== undefined && a.cap !== null) {
      if (!Number.isSafeInteger(a.cap) || a.cap < 0) throw new Error('How much one act may move: a whole number.');
      l.cap = { unit: a.unit || BITCOIN_UNITS.units.find((u) => u.network === 3)!.hash, value: a.cap };
    }
    if (a.expiry) {
      if (!/^[0-9a-f]{64}$/.test(a.expiry.clock)) throw new Error('Until when: name the timestamp clock by its ID, the clock that will place each act.');
      if (!Number.isSafeInteger(a.expiry.time) || a.expiry.time <= now()) throw new Error('Until when: a time still to come.');
      l.expiry = { clock: 'timestamp', identity: a.expiry.clock, time: a.expiry.time };
    }
    return l.cap || l.expiry ? l : undefined;
  }

  /** The grant read back in plain words, with the digest of exactly what the owner would sign. Nothing is signed. */
  preview(agent: string, owner: string, a: GrantAsk): { lines: string[]; digest: string } {
    if (!this.store.isAgent(agent)) throw new Error('Not an agent of this desk.');
    const kinds = a.kinds.map((k) => {
      const g = GRANTABLE.find((x) => x.key === k);
      if (!g) throw new Error(`“${k}” is not something an agent can be granted here.`);
      return g.kind;
    });
    if (!kinds.length) throw new Error('Choose what it may sign.');
    const key = makeGrantKey();
    const payload = personGrantPayload({ grantee: agent, kinds, limits: this.limitsOf(a), key: key.public });
    const digest = sha256(payload);
    this.shown.set(digest, { agent, owner, payload, secret: key.secret, time: now() });
    const names = this.store.names();
    return { lines: [`Signed by ${names(owner)}, public: a grant (Agreements type 9).`, ...grantInWords(readGrant(payload), owner, names, unitName)], digest };
  }

  /**
   * The owner signs the grant shown, by its digest; then the agent is asked,
   * and signs its acceptance if it accepts (F128). `ask`: the agent's answer
   * (one call to Claude, under its cap).
   */
  async publish(agent: string, digest: string, ask: (words: string[]) => Promise<{ accept: boolean; why: string }>): Promise<Done & { grant: string; accepted: boolean }> {
    const s = this.shown.get(digest);
    if (!s || s.agent !== agent || now() - s.time > 15 * 60) throw new Error('This is not a grant shown in the last fifteen minutes: read it again. Nothing was signed.');
    this.shown.delete(digest);
    const names = this.store.names();
    const g = await this.desk.signAndSend(s.owner, { spec: MIRS.agreements, type: AGREEMENTS_TYPES.grant, payload: s.payload, public: true, to: [], refs: [] });
    const held: GrantHeld = { grant: g.id, grantor: s.owner, secret: Buffer.from(s.secret).toString('hex'), strand: [], payload: b64(s.payload), time: now(), accepted: null, declined: null, revoked: null };
    this.save(agent, [...this.held(agent), held]);
    this.store.record({ time: now(), draft: '', verdict: 'granted', agent, signer: s.owner, title: `${names(s.owner)} granted ${names(agent)} authority`, note: '', act: g.id });
    const lines: Done['lines'] = [{ text: `The grant ${short(g.id)}, signed by ${names(s.owner)} and published.`, tone: 'ok' }, ...g.sent.map((x) => ({ text: `${x.to}: ${x.answer}`, tone: (x.accepted ? 'ok' : 'bad') as 'ok' | 'bad' }))];
    let answer: { accept: boolean; why: string };
    try {
      answer = await ask(grantInWords(readGrant(s.payload), s.owner, names, unitName));
    } catch (e) {
      lines.push({ text: `${names(agent)} was not asked yet: ${e instanceof Error ? e.message : String(e)}. Ask it again from the grant.`, tone: 'bad' });
      return { title: 'Granted, not accepted yet', lines, acts: [g.id], grant: g.id, accepted: false };
    }
    return this.answered(agent, g.id, answer, lines);
  }

  /** Ask the agent again, for a grant it has not answered. */
  async askAgain(agent: string, grant: string, ask: (words: string[]) => Promise<{ accept: boolean; why: string }>): Promise<Done & { grant: string; accepted: boolean }> {
    const h = this.held(agent).find((x) => x.grant === grant);
    if (!h || h.accepted || h.revoked) throw new Error('No grant waiting for its answer.');
    return this.answered(agent, grant, await ask(grantInWords(readGrant(unb64(h.payload)), h.grantor, this.store.names(), unitName)), []);
  }

  private async answered(agent: string, grant: string, answer: { accept: boolean; why: string }, lines: Done['lines']): Promise<Done & { grant: string; accepted: boolean }> {
    const names = this.store.names();
    const all = this.held(agent);
    const h = all.find((x) => x.grant === grant)!;
    if (!answer.accept) {
      h.declined = answer.why || 'no reason given';
      this.save(agent, all);
      lines.push({ text: `${names(agent)} declined it: “${h.declined}”. Nothing was signed by it; the grant backs nothing until accepted. You may revoke it.`, tone: 'warn' });
      return { title: 'Granted, declined by the agent', lines, acts: [grant], grant, accepted: false };
    }
    const a = acceptance(grant);
    const s = await this.desk.signAndSend(agent, { ...a, public: true, to: [], refs: [] });
    h.accepted = s.id;
    h.declined = null;
    this.save(agent, all);
    this.store.record({ time: now(), draft: '', verdict: 'accepted', agent, signer: agent, title: `${names(agent)} accepted ${names(h.grantor)}’s grant`, note: answer.why, act: s.id, causeAct: grant });
    lines.push({ text: `${names(agent)} accepted it, by its own signature ${short(s.id)}: “${answer.why}”.`, tone: 'ok' });
    return { title: 'Granted and accepted', lines, acts: [grant, s.id], grant, accepted: true };
  }

  /** The owner revokes a grant: a decision ending powers (rule 76), an everyday act of the owner's own key. */
  async revoke(agent: string, grant: string): Promise<Done> {
    const all = this.held(agent);
    const h = all.find((x) => x.grant === grant);
    if (!h) throw new Error('No such grant.');
    if (h.revoked) throw new Error('This grant is revoked already.');
    const s = await this.desk.signAndSend(h.grantor, { spec: MIRS.agreements, type: REVOCATION, payload: revocationPayload(grant), public: true, to: [], refs: [] });
    h.revoked = s.id;
    this.save(agent, all);
    return { title: 'Grant revoked', lines: [{ text: `Revoked by ${short(s.id)}: its key backs nothing after it (Agreements rule 76).`, tone: 'ok' }], acts: [s.id] };
  }

  /** A live grant reaching this kind of act: accepted, not revoked. */
  live(agent: string, spec: string, type: number): GrantHeld | null {
    return (
      this.held(agent)
        .filter((h) => h.accepted && !h.revoked)
        .reverse()
        .find((h) => reaches(readGrant(unb64(h.payload)).kinds, spec, type)) ?? null
    );
  }

  /** A live grant's words, for the agent (a nudge may then post in its owner's name). */
  wordsOf(h: GrantHeld): string[] {
    return grantInWords(readGrant(unb64(h.payload)), h.grantor, this.store.names(), unitName);
  }

  /**
   * The agent signs under the grant: refused, before anything is signed,
   * where the grant is not accepted or revoked, does not reach this kind of
   * act, or its limits refuse it (the grant limits cMIP, 5.1); otherwise
   * signed with the grant key on its strand, the strand kept first, then
   * published at the relays. Returns the act and on whose authority it
   * stands, as any reader would judge it.
   */
  async sign(agent: string, grant: string, a: { spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[]; refs?: Reference[] }): Promise<Done & { act: string; authority: Authority | null }> {
    const all = this.held(agent);
    const h = all.find((x) => x.grant === grant);
    if (!h) throw new Error('No such grant.');
    if (!h.accepted) throw new Error('The agent has not accepted this grant: nothing is signed under it.');
    if (h.revoked) throw new Error('This grant is revoked: nothing is signed under it.');
    const g = readGrant(unb64(h.payload));
    if (!reaches(g.kinds, a.spec, a.type)) throw new Error('The grant does not reach this kind of act. Nothing was signed.');
    const no = refuseBeforeSigning(g.limits, a, MIRS.money, now());
    if (no) throw new Error(no);
    const made = signUnderGrant(h, a);
    this.save(agent, all);
    this.store.keepAct(made.id, made.act, a.public ? undefined : made.key);
    const names = this.store.names();
    const lines: Done['lines'] = [];
    for (const r of this.store.settings().relays) {
      try {
        await relayAt(r, this.desk.places.via).putAct(made.act);
        lines.push({ text: `${r}: accepted`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `${r}: ${e instanceof Error ? e.message : String(e)}`, tone: 'bad' });
      }
    }
    const authority = await this.authority(made.act, a.public ? undefined : made.key);
    this.store.record({ time: now(), draft: '', verdict: 'under grant', agent, signer: h.grantor, title: `${names(agent)} signed in ${names(h.grantor)}’s name, under the grant ${short(grant)}`, note: authority?.words ?? '', act: made.id, causeAct: grant });
    if (authority) lines.unshift({ text: authority.words, tone: authority.backing === 'backed' || authority.backing === 'binds' ? 'ok' : 'warn' });
    return { title: 'Signed under the grant', lines, acts: [made.id], act: made.id, authority };
  }

  /** On whose authority an act stands, read as anyone would: from the relays and homes Edubba asks. */
  async authority(act: Uint8Array, key?: Uint8Array): Promise<Authority | null> {
    return authorityOf(act, this.desk.places.hints, this.desk.places.via, { key, names: this.store.names() });
  }

  /** The grants of one agent, for its details: each in plain words, its standing, and the acts signed under it with their authority. */
  async list(agent: string) {
    const names = this.store.names();
    const out = [];
    for (const h of this.held(agent)) {
      const acts = [];
      for (const id of h.strand) {
        const kept = this.store.keptActs().find((k) => idOf(k.act) === id);
        const au = kept ? await this.authority(kept.act, kept.key).catch(() => null) : null;
        acts.push({ act: id, words: au?.words ?? 'Not read.', backing: au?.backing ?? 'unknown', limits: au?.limits ?? null });
      }
      out.push({
        grant: h.grant,
        grantor: h.grantor,
        grantorName: names(h.grantor),
        words: grantInWords(readGrant(unb64(h.payload)), h.grantor, names, unitName),
        accepted: h.accepted,
        declined: h.declined,
        revoked: h.revoked,
        acts,
      });
    }
    return out;
  }
}
