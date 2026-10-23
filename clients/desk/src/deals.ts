// Edubba: a deal between separate people, set up when a work, a vow or a
// plain post is published (decided by Nobody, allegedly, 22 October 2026:
// "Edubba is the place"; the reading, `docs/splits-reading.md`). "Who shares
// in it", under Details: the people by contact name (never by hash alone),
// each one's share (adding to 100), the referral off the top, the split
// service and the key it made for the deal's payee.
//
// In plain words: Edubba makes one more identity for the deal, **the deal's
// own payee**, held here, whose pointer leads to the split service; buyers
// and tippers pay it, the service divides each payment and pays each owner.
// Nobody's own wallet changes. You sign first; each other person is sent the
// deal and signs in their own Edubba's To sign; the work is announced (its
// post, its locked bytes) only once every one of them has signed. Said
// before anything is signed: the work then belongs to the deal, and every
// payment for it goes to the service.
//
// Precisely, the acts, in this order (each a public act unless said):
// 1. the deal's payee: its genesis, routes, encryption key; its payee
//    pointer naming the split service's own rails (the pointer check,
//    Agreements rule 16); its grant to the service naming "this agreement"
//    by null (Grant, "A payee's grant in a deal");
// 2. the work's act, signed by you: a publication made `for` the deal's
//    payee (Envelopes: payment goes to the identity in `for`), its bytes not
//    yet uploaded, the deal's stake in its work hash; or a vow, the stake in
//    its name; a plain post's words are only hashed, the stake in that hash;
// 3. the founding terms (`../../grants/src/deal.ts`), signed by you and the
//    deal's payee; for a vow, the clone sharing its stake (rule 14), signed
//    likewise;
// 4. the offer (a work, a vow): yours, under the version, paying the deal's
//    payee (field 3), citing it; signed by the deal's payee too;
// 5. to each other person, an Agreements negotiation message (rule 52),
//    sealed to them, naming every act to sign in `refs`;
// 6. once each person's signature acts on every one are found: the locked
//    bytes uploaded, the post (naming the publication and the offer, the vow
//    and the offer, or the deal itself for a plain post), and the work's key
//    sealed to every person (they co-own it).
//
// TEST IDENTITIES ONLY, regtest only.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { MIRS, SPECS, cborDecode, describeAct, hex, moneyPayload, moneyRead, sha256, unhex, workHash } from '../../genesis/src/core.ts';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import { lookUp, referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readId as readIdForm } from '../../genesis/src/forms.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { assess } from '../../assess/src/assess.ts';
import { carryChain, dealGrantPayload, sign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate } from '../../repo/src/proposals.ts';
import { allBy } from '../../grants/src/grant.ts';
import { dealClonePayload, dealProblem, dealTermsPayload, dealWords, pct, type DealDraft } from '../../grants/src/deal.ts';
import { OFFER, offerPayload, type SealedMedia } from '../../barebone/src/sealed.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { VOW, vowPayload } from '../../dub/src/vows.ts';
import { deliverKey } from '../../dub/src/delivery.ts';
import { REGTEST_UNIT } from './grid.ts';
import type { Line, Section } from '../../collective/src/explain.ts';
import type { Desk } from './desk.ts';
import type { Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];
const now = () => Math.floor(Date.now() / 1000);

/** Said under Details, "Who shares in it", word for word. */
export const SHARES_SAY = [
  'Name each person you share it with by their name in your contacts, and each one’s share: the shares, yours included, add up to 100.',
  'The work then belongs to the deal: every payment for it, a tip included, goes to the split service, which divides it and pays each of you. Edubba makes one more identity for the deal, its own payee, held here: its pointer leads to the service, so nobody’s own wallet changes.',
  'Each person signs it in their own Edubba (To sign). Nothing is announced until every one of them has signed.',
];

/** What "Who shares in it" was given. */
export interface SharesIn {
  /** Each other person, by a contact's name (or an identity held here, by its name), and their share in %. */
  with: { who: string; share: string }[];
  /** Your own share, in %. */
  mine: string;
  referral: string;
  service: string;
  serviceKey: string;
}

/** A deal set up here, waiting for its signatures or done. */
export interface DealHere {
  /** The founding terms. */
  id: string;
  /** A vow's second version, sharing its stake (rule 14). */
  clone: string | null;
  /** The version an offer is under and a tip fulfils. */
  version: string;
  kind: 'work' | 'vow' | 'post';
  title: string;
  founder: string;
  payee: string;
  service: string;
  shares: [string, number][];
  referral: number;
  grant: string;
  offer: string | null;
  /** Every act each other person signs: the terms, the clone, the offer. */
  acts: string[];
  /** Each other person's signature acts found, by the act they sign. */
  signed: Record<string, Record<string, string>>;
  threads: Record<string, string>;
  state: 'waiting' | 'announced';
  /** What waits to be announced. */
  work: { publication: string; media: SealedMedia; locked: string; key: string; price: number; words: string } | null;
  vow: { vow: string; words: string; price: number; offerWords: string } | null;
  post: { text: string; id: string | null };
  at: number;
}

/** Where everything the deal's payee and its deals are kept: owner-only. */
const DIR = 'deals';

export class Deals {
  constructor(
    private desk: Desk,
    private store: Store,
    private contacts: () => { id: string; name: string }[],
    private settings: () => { relays: string[]; homes: string[]; via: Via },
  ) {
    mkdirSync(store.path(DIR, 'next'), { recursive: true, mode: 0o700 });
  }

  private file(...p: string[]) {
    return this.store.path(DIR, ...p);
  }

  list(): DealHere[] {
    const f = this.file('deals.json');
    return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as DealHere[]) : [];
  }

  private save(ds: DealHere[]) {
    writeFileSync(this.file('deals.json'), `${JSON.stringify(ds, null, 2)}\n`, { mode: 0o600 });
  }

  /** The names this Edubba gives: the identities held, then its contacts. */
  names(): (id: string) => string {
    const held = this.store.names();
    const cs = this.contacts();
    return (id: string) => {
      const c = cs.find((x) => x.id === id);
      return this.store.holds(id) || !c ? held(id) : `${c.name} [${short(id)}]`;
    };
  }

  /**
   * The deal's payee waiting for `founder`'s next deal: made here (an
   * identity like any, its homes the founder's), not yet published, so its
   * ID can be given to the split service before the deal is read back
   * (`mor-split-service key ID`). Kept until a deal takes it.
   */
  nextPayee(founder: TestIdentity): TestIdentity {
    const f = this.file('next', `${founder.id}.json`);
    if (existsSync(f)) return TestIdentity.load(f, founder.via);
    const homes: Home[] = founder.f.homes.map((h) => ({ ...h }));
    const t = TestIdentity.create({ homes, via: founder.via });
    t.save(f);
    return t;
  }

  /** "Who shares in it", resolved: each person by a name given here, never by hash alone; shares in millionths. */
  resolve(founder: string, a: SharesIn): { shares: [string, number][]; referral: number; problems: string[] } {
    const problems: string[] = [];
    const cs = this.contacts();
    const heldNames = this.store.book().identities;
    const shares: [string, number][] = [];
    const part = (s: string, what: string): number => {
      const n = Number(s.trim().replace('%', ''));
      if (!Number.isFinite(n) || n <= 0 || n >= 100) {
        problems.push(`${what}: a share is a percentage above 0 and under 100.`);
        return 0;
      }
      return Math.round(n * 10_000);
    };
    shares.push([founder, part(a.mine, 'Your share')]);
    for (const w of a.with) {
      const name = w.who.trim();
      if (!name) continue;
      const c = cs.find((x) => x.name === name) ?? heldNames.find((x) => x.name === name && x.id !== founder);
      if (!c) {
        problems.push(/^(mid1|[0-9a-f]{64})/.test(name) ? `“${short(name)}”: name a person as your contacts name them, never by an ID alone. Add them to your contacts first (Follow: add to contacts).` : `“${name}” is not a name in your contacts.`);
        continue;
      }
      shares.push([c.id, part(w.share, name)]);
    }
    const r = a.referral.trim() ? Number(a.referral.trim().replace('%', '')) : 0;
    if (!Number.isFinite(r) || r < 0 || r >= 100) problems.push('A referral share is a percentage from 0 to under 100.');
    const referral = Math.round((Number.isFinite(r) ? r : 0) * 10_000);
    const p = dealProblem({ shares, referral });
    if (p) problems.push(p);
    return { shares, referral, problems };
  }

  /**
   * The read-back of a deal before anything is signed (Agreements rule 4):
   * who shares in it, its payee, its service; the deal-assessment tool's
   * reading of the terms everyone signs, and its risks. Blocking reasons
   * said in plain words.
   */
  reading(o: { founder: TestIdentity; title: string; what: string; kind: DealHere['kind']; a: SharesIn; object: string }): { sections: Section[]; blocking: string[]; summary: string; draft: DealDraft | null; payee: string; service: string | null } {
    const names = this.names();
    const r = this.resolve(o.founder.id, o.a);
    const blocking = [...r.problems];
    const payee = this.nextPayee(o.founder);
    let service: string | null = null;
    const typed = o.a.service.trim();
    if (!typed) blocking.push('Name the split service that divides each payment: its ID.');
    else {
      try {
        service = readIdOrNull(typed);
        if (!service) throw new Error('not an ID');
      } catch {
        blocking.push('The split service: give its ID (mid1… or 64 hexadecimal characters).');
      }
    }
    if (service && r.shares.some(([id]) => id === service)) blocking.push('The split service cannot be one of the people sharing in it: the service is no party to the deal (Agreements, Grant: “the service is no party to the deal”).');
    if (service && service === payee.id) blocking.push('The split service cannot be the deal’s own payee.');
    const key = o.a.serviceKey.trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(key)) blocking.push(`The key the service made for the deal’s payee: 64 hexadecimal characters. Ask the service for one for the deal’s payee, ${payee.id} (mor-split-service key ${payee.id}).`);
    const draft: DealDraft = { title: o.title || '…', what: o.what, shares: r.shares, payee: payee.id, object: o.object, referral: r.referral, grant: sha256(`a grant to come, ${key}`) };
    const words = dealWords(draft, (id) => short(id));
    const sections: Section[] = [
      {
        heading: 'Who shares in it',
        lines: [
          ...r.shares.map(([id, n]) => ({ text: `${names(id)}: ${pct(n)} of what is left after the top${id === o.founder.id ? ' (you)' : ''}.` })),
          ...(r.referral ? [{ text: `Off the top: ${pct(r.referral)} of each payment to whoever reposted it where the buyer found it (their claim names the repost).` }] : [{ text: 'Nothing off the top.' }]),
        ],
      },
      {
        heading: 'Who is paid, and who divides it',
        lines: [
          { text: `The deal’s own payee, ${short(payee.id)}: an identity made for this deal and held in this Edubba. Every payment for the work, a tip included, is paid to it; its payee pointer names the split service’s own rails, so the money arrives at the service.`, tone: 'warn' },
          { text: `The split service, ${service ? names(service) : '…'}, holds a key the deal’s payee grants it (${key ? `${key.slice(0, 16)}…` : '…'}): it signs receipts in the payee’s name for money coming in under this deal only (Agreements rule 16), publishes each split and pays each of you.` },
          { text: 'The work then belongs to the deal: every payment for it goes to the service. A tip to any of you personally still goes to your own pointer.', tone: 'warn' },
        ],
      },
      {
        heading: 'Who signs, and when it counts',
        lines: [
          { text: 'You sign the terms first, and the deal’s payee signs them too (Edubba holds its keys); each other person is sent them, sealed, and signs in their own Edubba’s To sign.' },
          { text: o.kind === 'vow' ? 'A vow’s stake is first written to its signer, you (Agreements rule 14), then shared by a second version everyone signs at the same time.' : 'One version, signed by every party (rule 47).' },
          { text: 'It counts once every one has signed (Agreements rule 1). Until then the offer counts for nothing, and the work is not announced: its post and its locked bytes wait here.' },
        ],
      },
      {
        heading: 'Stated costs',
        lines: [
          { text: 'This Edubba holds the deal’s payee’s keys: whoever holds them could stop the deal’s income (by revoking its grant) or point it elsewhere, which every Agreements app shows as bypassing the service.', tone: 'warn' },
          { text: 'One silent party blocks every later change to the deal; nobody’s share is lowered without them (rules 47, 48).', tone: 'warn' },
          { text: 'The service sees who pays, how much, and for what; never the work. Every one of you sees who bought (the buyer’s claim is sealed to each of you).', tone: 'warn' },
        ],
      },
    ];
    try {
      const payload = dealTermsPayload(draft, words, o.kind === 'vow' ? o.founder.id : null);
      const a = assess(payload, (id) => (id === payee.id ? `the deal’s own payee [${short(id)}]` : names(id)));
      sections.push({ heading: 'The deal-assessment tool’s reading', lines: [...a.summary.map((t) => ({ text: t })), ...a.flags.map((f) => ({ text: `${f.text} (${f.rests})`, tone: 'warn' as const }))] });
    } catch (e) {
      blocking.push(`Agreements refuse these terms: ${err(e)}`);
    }
    return { sections, blocking, summary: words, draft: blocking.length ? null : { ...draft }, payee: payee.id, service };
  }

  /**
   * Sign and send a deal, as read back. `work`: what waits to be announced.
   * The deal's payee is published, its pointer and grant first; then the
   * work's act, the terms (and a vow's clone), the offer; then the proposal
   * to each other person.
   */
  async start(me: TestIdentity, o: { kind: DealHere['kind']; title: string; what: string; draft: DealDraft; service: string; key: string; work?: { media: SealedMedia; payload: Uint8Array; locked: Uint8Array; key: string; price: number; words: string; work: string }; vow?: { words: string; price: number; offerWords: string }; post: string }): Promise<{ deal: DealHere; lines: Line[] }> {
    const s = this.settings();
    const names = this.names();
    const lines: Line[] = [];
    await this.desk.keyCurrent(me.id);
    await carryChain(me, s.relays);
    // 1. The deal's payee, made public: its chain, routes, encryption key, pointer, grant.
    const payee = this.nextPayee(me);
    const pf = this.file(`${payee.id}.json`);
    payee.save(pf);
    const save = () => payee.save(pf);
    try {
      await payee.publishGenesis();
      await payee.publishRoutes([
        { scope: null, hints: s.relays, kind: 0 },
        { scope: null, hints: s.relays, kind: 1 },
      ]);
      await payee.publishEncryptionKey(encryptionSecret(unhex(payee.f.signingSecret)));
      for (const r of s.relays) for (const act of payee.chainActs()) await relayAt(r, s.via).putAct(act).catch(() => undefined);
      const rails = await serviceRails(o.service, list([...s.relays, ...s.homes]), s.via);
      if (!rails.length) throw new Error('the split service publishes no payee pointer with a Lightning rail: its own rails could not be read, so the deal’s payee cannot point at them');
      const ptr = moneyPayload({ type: 'pointer', payee: payee.id, version: 1, rails }) as { type: number; payload: Uint8Array };
      await payee.publish(MIRS.money, ptr.type, ptr.payload, { public: true, relays: s.relays });
      const grant = await payee.publish(MIRS.agreements, AGREEMENTS_TYPES.grant, dealGrantPayload(o.service, [1, unhex(o.key)]), { public: true, relays: s.relays });
      save();
      const draft: DealDraft = { ...o.draft, payee: payee.id, grant: grant.id };
      lines.push({ text: `The deal’s own payee, ${short(payee.id)}, is published: its pointer names the service’s rails, its grant names the key the service made for it.`, tone: 'ok' });
      // 2. The work's act: a publication made for the deal's payee, or a vow. A plain post's words are only hashed.
      let publication: string | null = null;
      let vow: string | null = null;
      if (o.work) {
        publication = (await me.publish(POST_SPECS.envelopes, PUBLICATION, o.work.payload, { public: true, relays: s.relays })).id;
        // The stake is in the work, by its hash (the publication's field 1): what a purchase of it pays for (Agreements rule 12; the core's reading).
        draft.object = o.work.work;
      } else if (o.vow) {
        vow = (await me.publish(SPECS.envelopes, VOW, vowPayload(o.vow.words), { public: true, relays: s.relays })).id;
        draft.object = vow;
      } else draft.object = workHash(new TextEncoder().encode(o.post.normalize('NFC'))) as string;
      // 3. The terms, signed by you and the deal's payee; a vow's clone likewise.
      const words = dealWords(draft, (id) => short(id));
      const t = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, dealTermsPayload(draft, words, vow ? me.id : null), { public: true, relays: s.relays, refs: [referenceTo(grant.act)] });
      await sign(me, t.id, s.relays);
      await sign(payee, t.id, s.relays);
      let clone: string | null = null;
      if (vow) {
        const c = await me.publish(MIRS.agreements, AGREEMENTS_TYPES.terms, dealClonePayload(draft, words, t.id), { public: true, relays: s.relays, objects: [[t.id, t.id]] });
        await sign(me, c.id, s.relays);
        await sign(payee, c.id, s.relays);
        clone = c.id;
      }
      const version = clone ?? t.id;
      // 4. The offer, under the version, paying the deal's payee; signed by the payee too.
      let offer: string | null = null;
      if (publication || vow) {
        const price = { unit: REGTEST_UNIT, value: (o.work?.price ?? o.vow?.price)! };
        const off = await me.publish(MIRS.agreements, OFFER, offerPayload({ sells: publication ? { publication } : { vow: vow! }, price, words: (o.work?.words ?? o.vow?.offerWords)!, under: version, payee: payee.id }), { public: true, relays: s.relays, objects: [[version, version]] });
        await sign(payee, off.id, s.relays);
        offer = off.id;
      }
      save();
      const acts = [t.id, ...(clone ? [clone] : []), ...(offer ? [offer] : [])];
      lines.push({ text: `The deal ${short(t.id)} is signed by you and its payee${clone ? `, with its second version ${short(clone)} sharing the vow’s stake` : ''}${offer ? `, and its offer ${short(offer)}` : ''}.`, tone: 'ok' });
      // 5. To each other person, sealed, naming every act to sign.
      const threads: Record<string, string> = {};
      for (const [id] of draft.shares.filter(([x]) => x !== me.id)) {
        try {
          const l = await lookUp(id, list([...s.relays, ...s.homes]), s.via);
          const inbox = l.inbox(REPO_SPECS.agreements);
          if (!l.encryptionKey || !inbox?.length) throw new Error('it publishes no encryption key or inbox');
          const text = `A shared deal to sign: “${o.title}”, proposed by ${short(me.id)}. Read it in To sign, from its exact bytes, and sign each act it names, or decline.`;
          const sent = await negotiate(me, { id, key: l.encryptionKey, inbox }, { text, refs: acts.map((a) => [a, me.id] as [string, string]) });
          threads[id] = sent.id;
          lines.push({ text: sent.left.length ? `Sent to ${names(id)}, sealed, in their inbox.` : `Not delivered to ${names(id)}: ${sent.failed.map((f) => `${f.relay}: ${f.reason}`).join('; ')}.`, tone: sent.left.length ? 'ok' : 'bad' });
        } catch (e) {
          lines.push({ text: `Not sent to ${names(id)}: ${err(e)}`, tone: 'bad' });
        }
      }
      const deal: DealHere = {
        id: t.id,
        clone,
        version,
        kind: o.kind,
        title: o.title,
        founder: me.id,
        payee: payee.id,
        service: o.service,
        shares: draft.shares,
        referral: draft.referral,
        grant: grant.id,
        offer,
        acts,
        signed: {},
        threads,
        state: 'waiting',
        work: o.work && publication ? { publication, media: o.work.media, locked: Buffer.from(o.work.locked).toString('base64'), key: o.work.key, price: o.work.price, words: o.work.words } : null,
        vow: o.vow && vow ? { vow, words: o.vow.words, price: o.vow.price, offerWords: o.vow.offerWords } : null,
        post: { text: o.post, id: null },
        at: now(),
      };
      this.save([deal, ...this.list()]);
      // The next deal gets a payee of its own.
      rmSync(this.file('next', `${me.id}.json`), { force: true });
      lines.push({ text: 'Nothing is announced until every person has signed: their signatures are looked for each time Publishing opens (or with “Look for signatures”).' });
      return { deal, lines };
    } finally {
      save();
      this.store.saveIdentity(me);
    }
  }

  /**
   * Look for each other person's signature acts on every act of each deal
   * waiting, at their places (Agreements rule 1: "A party is bound by an
   * agreement only through its own signature act"); a deal every person has
   * signed is announced. `announce` publishes the work.
   */
  async gather(announce: (d: DealHere) => Promise<Line[]>): Promise<{ lines: Line[] }> {
    const s = this.settings();
    const names = this.names();
    const ds = this.list();
    const lines: Line[] = [];
    for (const d of ds.filter((x) => x.state === 'waiting')) {
      for (const [id] of d.shares.filter(([x]) => x !== d.founder)) {
        let places = list([...s.relays, ...s.homes]);
        try {
          const l = await lookUp(id, places, s.via);
          places = list([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)]);
        } catch {
          // asked where we look
        }
        for (const a of await allBy(id, places, s.via)) {
          const x = describeAct(a) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
          if (x.signer !== id || x.spec !== REPO_SPECS.agreements || x.type !== AGREEMENTS_TYPES.signature || !x.payload) continue;
          const named = (cborDecode(x.payload) as Map<number, unknown>).get(0);
          const act = named instanceof Uint8Array ? hex(named) : null;
          if (act && d.acts.includes(act)) (d.signed[id] ??= {})[act] = x.id;
        }
      }
      const missing = d.shares.filter(([x]) => x !== d.founder && d.acts.some((a) => !d.signed[x]?.[a]));
      if (missing.length) {
        lines.push({ text: `“${d.title}”: waiting for ${missing.map(([x]) => names(x)).join(', ')} to sign. Nothing is announced yet.` });
        continue;
      }
      try {
        lines.push(...(await announce(d)));
        d.state = 'announced';
        lines.push({ text: `“${d.title}” is announced: every person signed the deal.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `“${d.title}”: every person signed, but it could not be announced yet: ${err(e)}`, tone: 'warn' });
      }
    }
    this.save(ds);
    return { lines };
  }

  /** Announce a deal every person signed: the locked bytes, the post, the work's key sealed to every person. */
  async announce(me: TestIdentity, d: DealHere): Promise<{ post: string; lines: Line[] }> {
    const s = this.settings();
    const names = this.names();
    const lines: Line[] = [];
    await this.desk.keyCurrent(me.id);
    try {
      await carryChain(me, s.relays);
      const fetch = async (id: string) => {
        for (const h of list([...s.relays, ...s.homes])) {
          const a = await relayAt(h, s.via).getAct(id).catch(() => null);
          if (a) return a;
        }
        throw new Error(`the act ${short(id)} was not found where Edubba looks`);
      };
      let post: string;
      if (d.work) {
        for (const h of s.relays) await relayAt(h, s.via).putMedia(Uint8Array.from(Buffer.from(d.work.locked, 'base64')));
        post = (await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(d.post.text), { public: true, relays: s.relays, refs: [referenceTo(await fetch(d.work.publication)), referenceTo(await fetch(d.offer!))] })).id;
        // The work's key to every person sharing in it: they co-own it.
        for (const [id] of d.shares.filter(([x]) => x !== me.id)) {
          try {
            await deliverKey(me, id, d.work.publication, d.work.key, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current: () => this.desk.keyCurrent(me.id) });
            lines.push({ text: `Its key is sealed to ${names(id)}, who shares in it.`, tone: 'ok' });
          } catch (e) {
            lines.push({ text: `Its key could not be sealed to ${names(id)}: ${err(e)}`, tone: 'warn' });
          }
        }
      } else if (d.vow) {
        post = (await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(d.post.text), { public: true, relays: s.relays, refs: [referenceTo(await fetch(d.vow.vow)), referenceTo(await fetch(d.offer!))] })).id;
      } else {
        post = (await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(d.post.text), { public: true, relays: s.relays, refs: [referenceTo(await fetch(d.id))] })).id;
      }
      d.post.id = post;
      return { post, lines };
    } finally {
      this.store.saveIdentity(me);
    }
  }

  /** The deal's payee held here, to deliver as it or read what is sealed to it. */
  payee(id: string): TestIdentity | null {
    const f = this.file(`${id}.json`);
    return existsSync(f) ? TestIdentity.load(f) : null;
  }

  /** Whether an ID is a deal's payee held here (so it is never shown as a person). */
  isPayee(id: string): boolean {
    return this.list().some((d) => d.payee === id);
  }

  /** The deals this identity proposed. */
  of(founder: string): DealHere[] {
    return this.list().filter((d) => d.founder === founder);
  }

  /** Who has signed a deal, in plain words. */
  signedWords(d: DealHere): string {
    const names = this.names();
    return d.shares
      .filter(([x]) => x !== d.founder)
      .map(([x]) => `${names(x)}: ${d.acts.every((a) => d.signed[x]?.[a]) ? 'signed' : 'not yet'}`)
      .join(' · ');
  }
}

/** An ID typed as mid1… or hex, or null. */
function readIdOrNull(typed: string): string | null {
  const t = typed.trim().toLowerCase();
  if (/^[0-9a-f]{64}$/.test(t)) return t;
  try {
    return readIdForm(typed.trim());
  } catch {
    return null;
  }
}

/** The split service's own rails, from its latest payee pointer at these places: what the deal's payee points at (the pointer check, rule 16). */
export async function serviceRails(service: string, places: string[], via: Via): Promise<{ module: string; address: Uint8Array }[]> {
  let hints = places;
  try {
    const l = await lookUp(service, places, via);
    hints = list([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)]);
  } catch {
    // asked where we look
  }
  let best: { version: number; rails: { module: string; address: Uint8Array }[] } | null = null;
  for (const a of await allBy(service, hints, via)) {
    const d = describeAct(a) as { signer?: string; spec?: string; type?: number; payload?: Uint8Array };
    if (d.signer !== service || d.spec !== MIRS.money || d.type !== 0 || !d.payload) continue;
    try {
      const p = (moneyRead(0, d.payload) as { act: { payee: string; version: number; rails: { module: string; address: Uint8Array }[] } }).act;
      if (p.payee === service && (!best || p.version > best.version)) best = { version: p.version, rails: p.rails.map((r) => ({ module: r.module, address: new Uint8Array(r.address) })) };
    } catch {
      // not a pointer this reads
    }
  }
  return best?.rails ?? [];
}
