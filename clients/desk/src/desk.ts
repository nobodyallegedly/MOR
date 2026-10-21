// What the desk does (roadmap step 11c): it holds the owner's test
// identities; it shows each draft Claude prepared, read in plain words from
// the draft's own bytes, with its digest; on the owner's word it approves
// (signs and sends), declines, or sends the draft back with a note for
// Claude; and it gathers what each identity received, for the owner to sort.
//
// Signing follows the draft byte for byte: the owner approves a digest, the
// desk reads the file again, checks its bytes hash to that digest, reads it
// again, and signs only if nothing blocks it. What you sign is what you saw.

import { ACK_SPECS, IDENTITY_TYPES, SPECS, ENVELOPES_TYPES, cborDecode, describeAct, hex, openSealed, sealedParts, signingPublic, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { NAME, namePayload, readName } from '../../dub/src/names.ts';
import { TestIdentity, sealFor, type Home, type Reference } from '../../genesis/src/identity.ts';
import { carryChains, lookUp, refAct } from '../../genesis/src/lookup.ts';
import { relayAt, sealedId, RelayError, type Via } from '../../genesis/src/transport.ts';
import { record as recordKex } from '../../genesis/src/kex.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { leaveAtHomes, lineReader, noLine, sendWaiting, type LineAtHomes } from '../../genesis/src/private.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { dealRoot, sellerAlarm, splitGaps } from '../../repo/src/deal.ts';
import type { Line, Section } from '../../collective/src/explain.ts';
import {
  ANSWER_LABEL,
  decodeDraft,
  listDrafts,
  loadAnswer,
  loadDraft,
  readDraft,
  recipientOf,
  saveAnswer,
  saveLinked,
  type Answer,
  type Draft,
  type DraftReading,
} from '../../connector/src/draft.ts';
import { escapeControls } from '../../connector/src/words.ts';
import { beforeSigning } from '../../assess/src/assess.ts';
import { DESK_SPECS } from './specs.ts';
import { NUDGE_SPECS, NUDGE_TYPES, TEXT_ACT } from '../../nudge/src/specs.ts';
import { Reading } from '../../nudge/src/nudge.ts';
import type { Item, Kind, Received, SignedRecord, Sorted, Store } from './store.ts';

const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const now = () => Math.floor(Date.now() / 1000);

/** The longest note the owner sends back with a draft. */
export const MAX_NOTE = 4000;

export interface Done {
  title: string;
  lines: Line[];
  acts: string[];
}

/** A draft as the page shows it. */
export interface DraftView {
  digest: string;
  time: number;
  signer: string;
  signerName: string;
  kind: DraftReading['kind'];
  title: string;
  summary: string[];
  sections: Section[];
  plain: { heading: string; text: string }[];
  blocking: string[];
  /** Claude's note to the owner: Claude's words, never signed. */
  note: string | null;
  /** The draft this one reworks, with the owner's note on it and its text, to compare. */
  reworks: { digest: string; note: string; text: string | null } | null;
  /** A picture to be published, as a data link the page can show. */
  picture: { src: string; width: number; height: number } | null;
}

export const SORTED: Sorted[] = ['new', 'to answer', 'answered', 'ignored'];

/** Said where an identity's signing key was changed elsewhere (F335): where a change of keys is done, and how Edubba goes on. */
export const KEY_CHANGED_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key’s paper words: a change of keys is done in Kišib, never in Edubba. The key Edubba holds no longer counts, so Edubba signs nothing more with it. If you did not change it, someone holding the chain key’s words may have: open Kišib. To go on here, give the new signing key’s words in the identity’s record (Identities tab).';

/** Said where a real collective's own signing key, held here, was changed in Kišib (H80): where the collective's new words go. */
export const COLLECTIVE_KEY_CHANGED_SAY =
  'This collective’s signing key was changed elsewhere, in Kišib, with its members’ paper shares. The key Edubba holds for it no longer counts, so Edubba signs nothing more for it with that key. To go on here, give the collective’s new signing key’s words under its member change (Collectives tab).';

/** Said where an identity's homes hold two rotations at one position: nothing is signed until it is settled (as Dub says). */
export const CONTESTED_SAY = 'Its homes disagree about its keys (contested): nothing is signed with them until it is settled, in Kišib (“Escape a contested position”).';

/**
 * Whether `secret` still gives the signing key the identity's homes serve:
 * null where it does, or where nothing answered (the act's own check after
 * signing still runs where there is one); `say` where another key counts; `CONTESTED_SAY`
 * where its homes disagree.
 */
async function keyChangedAt(id: string, secret: string, hints: string[], via: Via, say: string): Promise<string | null> {
  let r: { signingKey?: Uint8Array; stop?: string };
  try {
    r = (await lookUp(id, [...new Set(hints)], via)).resolution;
  } catch {
    return null;
  }
  if (r.stop === 'contested') return CONTESTED_SAY;
  return r.signingKey && hex(r.signingKey) !== hex(signingPublic(unhex(secret))) ? say : null;
}

export class Desk {
  /** This desk's line of each identity as the homes hold it, for its card (H80's question 2). */
  private readonly line = lineReader('Edubba');
  /** One signing operation at a time. */
  private busy: Promise<unknown> = Promise.resolve();

  constructor(readonly store: Store) {}

  /** One signing operation at a time, for every part of Edubba that signs with the identities held here. */
  serial<T>(f: () => Promise<T>): Promise<T> {
    const p = this.busy.then(f, f);
    this.busy = p.catch(() => undefined);
    return p;
  }

  private get via(): Via {
    return this.store.settings().via;
  }

  /** Where identities are looked up and acts fetched: the relays, then the homes. */
  private hints(): string[] {
    const s = this.store.settings();
    return [...new Set([...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  // ------------------------------------------------------------ settings and identities

  async setSettings(a: { homes: string[]; relays: string[]; via: Record<string, string>; drafts: string }): Promise<void> {
    const homes: Home[] = [];
    for (const hint of a.homes) {
      let info: Map<number, unknown>;
      try {
        info = (await relayAt(hint, a.via).info()) as Map<number, unknown>;
      } catch (e) {
        throw new Error(`${hint} did not answer: ${err(e)}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      homes.push({ operator: hex(op), hint });
    }
    const old = this.store.settings();
    this.store.saveSettings({ homes, relays: a.relays, via: a.via, drafts: a.drafts.trim() || old.drafts });
    this.writeLinked();
  }

  /** Tell the connector, through the drafts folder, which identities it may prepare drafts for. */
  private writeLinked(): void {
    const b = this.store.book();
    saveLinked(
      this.store.settings().drafts,
      b.identities.filter((i) => i.linked).map((i) => ({ id: i.id, name: i.name })),
    );
  }

  /**
   * A new test identity: its genesis at the homes, then its routes (acts
   * found at the relays, and an inbox there) and an encryption key, so it can
   * publish and receive messages. Pressing Create is the owner's word.
   */
  async createIdentity(a: { name: string; linked: boolean }): Promise<Done> {
    const s = this.store.settings();
    const name = a.name.trim();
    if (!name) throw new Error('Give it a name, so you can tell it apart here. The name stays on this device unless you link it to Claude.');
    if (!s.homes.length) throw new Error('Name the homes first, under Settings: a genesis names at least one.');
    const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
    return this.serial(async () => {
      const id = TestIdentity.create({ homes: s.homes, via: s.via, scheme: 3 });
      this.store.saveIdentity(id);
      const b = this.store.book();
      b.identities.push({ id: id.id, name, linked: a.linked });
      this.store.saveBook(b);
      const sent = await id.publishGenesis();
      const lines: Line[] = sent.map((x) => ({
        text: `${x.home}: ${x.result?.receipt ? 'receipt signed' : `refused (${x.code ?? '?'}) ${x.error ?? ''}`}`,
        tone: x.result?.receipt ? 'ok' : 'bad',
      }));
      const routes = await id.publishRoutes([
        { scope: null, hints: relays, kind: 0 },
        { scope: null, hints: relays, kind: 1 },
      ]);
      this.store.saveIdentity(id);
      // Its encryption key is the one its signing key's words carry (the
      // identity carry Module, draft 2, 2a.2), as Dub's identities get theirs:
      // the same words then open its private messages in another app.
      const key = await id.publishEncryptionKey(encryptionSecret(unhex(id.f.signingSecret)));
      this.store.saveIdentity(id);
      for (const r of relays) {
        for (const act of id.chainActs()) {
          try {
            await relayAt(r, s.via).putAct(act);
          } catch {
            // that relay's policy: the homes serve it anyway
          }
        }
      }
      lines.push({ text: `Its acts are found at, and its inbox is, ${relays.join(', ')}. Its encryption key is the one its signing key’s words carry.` });
      lines.push({ text: a.linked ? 'Linked to Claude: Claude may prepare drafts for it, which you approve here.' : 'Not linked to Claude.' });
      this.writeLinked();
      return { title: `“${name}” is born`, lines, acts: [id.id, routes.id, key.id] };
    });
  }

  rename(id: string, name: string): void {
    if (!name.trim()) throw new Error('A name cannot be empty.');
    const b = this.store.book();
    const i = b.identities.find((x) => x.id === id);
    if (i) i.name = name.trim();
    else b.names[id] = name.trim();
    this.store.saveBook(b);
    this.writeLinked();
  }

  link(id: string, on: boolean): void {
    const b = this.store.book();
    const i = b.identities.find((x) => x.id === id);
    if (!i) throw new Error(`this desk does not hold ${id}`);
    i.linked = on;
    this.store.saveBook(b);
    this.writeLinked();
  }

  // ------------------------------------------------------------ drafts

  /** Whether this desk answers as `id`, an agent whose terms were signed here (Edubba keeps several, F333). */
  private isAgent(id: string): boolean {
    return this.store.isAgent(id) && !!this.store.agent(id, () => ({ terms: null as string | null })).terms;
  }

  /**
   * Publish a display name for an identity held here (the naming cMIP,
   * draft 1; F333: an agent is named when it is added, decided by Nobody,
   * allegedly, "(a) Published"): an Identity name act (type 4) naming the
   * cMIP, public, at its homes and the relays. Not unique: always shown
   * beside the fingerprint, never instead of it.
   */
  async publishName(identity: string, typed: string): Promise<{ act: string; name: string; sent: number }> {
    const name = readName(typed);
    return this.serial(async () => {
      const me = this.store.identity(identity);
      if (me.f.pending) throw new Error('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
      await this.keyCurrent(me.id);
      const made = me.sign(SPECS.identity, NAME, namePayload(name), { public: true });
      this.store.saveIdentity(me);
      this.store.keepAct(made.id, made.act);
      let sent = 0;
      for (const h of [...new Set([...me.f.homes.map((x) => x.hint), ...this.store.settings().relays])]) {
        try {
          await relayAt(h, this.via).putAct(made.act);
          sent++;
        } catch {
          // that place is away: the others hold it
        }
      }
      if (!sent) throw new Error('No home or relay took the name. It is signed, not published.');
      this.store.record({ time: now(), draft: '', verdict: 'named', signer: identity, title: `Display name “${name}” published`, note: '', act: made.id });
      return { act: made.id, name, sent };
    });
  }

  /**
   * The nudge cMIP draft 3's client conformance (Q2, decided by Nobody,
   * allegedly: "it should not exist without a nudge", read with the pick
   * as the other cause): the agent's client MUST NOT sign a text act its
   * terms do not let go out freely without an allowed nudge or pick that
   * allows it. Under Machine, allegedly's terms, that is no reply or
   * message to anyone but its owner without his nudge or pick. The act is
   * read as it would be once signed, as the next of the agent's sequence,
   * against every act this desk holds for the answering. Null where it may
   * be signed; else why not.
   */
  private agency(signer: string, a: { spec: string; type: number; public: boolean; to: string[]; refs: Reference[] }): string | null {
    if (!this.isAgent(signer) || a.spec !== NUDGE_SPECS.text || a.type !== TEXT_ACT) return null;
    const r = new Reading(this.store.names());
    for (const k of this.store.keptActs()) r.add(k.act, k.key);
    for (const it of this.store.received(signer).items) if (it.raw) r.add(unb64(it.raw.act), it.raw.key ? unb64(it.raw.key) : undefined);
    const seq = this.store.identity(signer).f.sequence;
    const may = r.maySign({ signer, public: a.public, to: a.to, refs: a.refs.map(refAct), prev: seq[seq.length - 1] });
    return may.ok ? null : `Its agency terms do not let it be signed (nudge cMIP draft 3, client conformance): ${may.why}`;
  }

  /** Reasons the desk itself refuses a draft, beyond its reading. */
  private refusals(d: Draft): string[] {
    const out: string[] = [];
    const entry = this.store.book().identities.find((i) => i.id === d.signer);
    if (!entry || !this.store.holds(d.signer)) out.push(`This desk does not hold the identity ${d.signer}, so it cannot sign for it.`);
    else {
      if (!entry.linked) out.push(`“${entry.name}” is not linked to Claude: link it first if Claude may prepare its acts.`);
      if (this.store.identity(d.signer).f.pending) out.push('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
      const agency = this.agency(d.signer, d);
      if (agency) out.push(agency);
    }
    return out;
  }

  private async view(digest: string, time: number): Promise<DraftView> {
    const dir = this.store.settings().drafts;
    const names = this.store.names();
    const { draft: d } = loadDraft(dir, digest);
    const r = await readDraft(d, this.hints(), this.via);
    let reworks: DraftView['reworks'] = null;
    if (d.reworks) {
      const old = loadAnswer(dir, d.reworks);
      let text: string | null = null;
      try {
        const od = loadDraft(dir, d.reworks).draft;
        const t = (cborDecode(od.payload) as Map<number, unknown>).get(0);
        if (typeof t === 'string') text = escapeControls(t);
      } catch {
        // the old draft is gone: only its note is shown
      }
      reworks = { digest: d.reworks, note: old?.verdict === 'sent back' ? old.note : '', text };
      if (old?.verdict !== 'sent back') r.blocking.push(`It says it reworks draft ${d.reworks.slice(0, 12)}, which you did not send back.`);
    }
    return {
      digest,
      time,
      signer: d.signer,
      signerName: names(d.signer),
      kind: r.kind,
      title: r.title,
      summary: r.summary,
      sections: r.sections,
      plain: r.quoted,
      blocking: [...r.blocking, ...this.refusals(d)],
      note: d.note,
      reworks,
      picture: r.picture ? { src: `data:image/jpeg;base64,${b64(r.picture.jpeg)}`, width: r.picture.width, height: r.picture.height } : null,
    };
  }

  /** The drafts waiting for an answer, newest first, each read now from its bytes. */
  /** The digests of the drafts waiting, from the folder alone: cheap enough to ask every few seconds. */
  waiting(): string[] {
    const dir = this.store.settings().drafts;
    return listDrafts(dir)
      .filter(({ digest }) => !loadAnswer(dir, digest))
      .map(({ digest }) => digest);
  }

  async drafts(): Promise<DraftView[]> {
    const dir = this.store.settings().drafts;
    const out: DraftView[] = [];
    for (const { digest, time } of listDrafts(dir)) {
      if (loadAnswer(dir, digest)) continue;
      try {
        out.push(await this.view(digest, time));
      } catch (e) {
        out.push({
          digest,
          time,
          signer: '',
          signerName: '',
          kind: 'refused',
          title: 'A file that is not a draft the desk can read',
          summary: [],
          sections: [],
          plain: [],
          blocking: [err(e)],
          note: null,
          reworks: null,
          picture: null,
        });
      }
    }
    return out;
  }

  private answered(digest: string): void {
    if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error('Give the whole digest of the draft.');
    if (loadAnswer(this.store.settings().drafts, digest)) throw new Error(`Draft ${digest.slice(0, 12)} was already answered.`);
  }

  private answer(a: Omit<Answer, 'format' | 'time'>, d: Draft, title: string): void {
    const time = now();
    saveAnswer(this.store.settings().drafts, { format: ANSWER_LABEL, time, ...a });
    this.store.record({ time, draft: a.draft, verdict: a.verdict, signer: d.signer, title, note: a.note, act: a.act });
  }

  /** Send a draft back to Claude with the owner's note, saying what to change. Nothing is signed. */
  async sendBack(digest: string, note: string): Promise<Done> {
    return this.serial(async () => {
      this.answered(digest);
      const n = note.trim();
      if (!n) throw new Error('Write a note: it is what Claude reworks the draft from.');
      if (n.length > MAX_NOTE) throw new Error(`The note is longer than ${MAX_NOTE} characters.`);
      const { draft: d } = loadDraft(this.store.settings().drafts, digest);
      const r = await readDraft(d, this.hints(), this.via);
      this.answer({ draft: digest, verdict: 'sent back', note: n }, d, r.title);
      return { title: 'Sent back to Claude', lines: [{ text: 'Nothing was signed. Claude reads your note when it next asks the connector what the desk answered, and prepares a new draft that names this one.' }], acts: [] };
    });
  }

  /** Decline a draft. Nothing is signed; Claude is told, with the note if one is given. */
  async decline(digest: string, note: string): Promise<Done> {
    return this.serial(async () => {
      this.answered(digest);
      const { draft: d } = loadDraft(this.store.settings().drafts, digest);
      const r = await readDraft(d, this.hints(), this.via);
      this.answer({ draft: digest, verdict: 'declined', note: note.trim().slice(0, MAX_NOTE) }, d, r.title);
      return { title: 'Declined', lines: [{ text: 'Nothing was signed.' }], acts: [] };
    });
  }

  /**
   * Approve a draft: sign it with the identity it names, as the next act of
   * that identity's sequence, and send it. Refused if the digest is not the
   * whole digest of a draft in the folder, the file's bytes do not hash to
   * it, it was already answered, or anything blocks it now.
   */
  async approve(digest: string): Promise<Done> {
    return this.serial(async () => {
      this.answered(digest);
      const dir = this.store.settings().drafts;
      const { draft: d, digest: got } = loadDraft(dir, digest);
      if (got !== digest) throw new Error('The draft in the folder is not the one shown. Nothing was signed.');
      const r = await readDraft(d, this.hints(), this.via);
      const blocking = [...r.blocking, ...this.refusals(d)];
      if (blocking.length) throw new Error(`This cannot be signed: ${blocking.join(' ')} Nothing was signed.`);

      const me = this.store.identity(d.signer);
      let recipient: Awaited<ReturnType<typeof recipientOf>> | null = null;
      if (r.kind === 'message') recipient = await recipientOf(d.to[0], this.hints(), this.via);
      await this.keyCurrent(me.id);
      const made = me.sign(d.spec, d.type, d.payload, {
        public: d.public,
        to: d.to.length ? d.to : undefined,
        refs: d.refs.length ? d.refs : undefined,
        objects: d.objects.length ? d.objects : undefined,
      });
      // The sequence is saved before anything leaves, so no later act can fork from this one.
      this.store.saveIdentity(me);
      // The agent's acts are kept for the readings, so its picks and nudges are counted (item 13).
      if (this.isAgent(d.signer)) this.store.keepAct(made.id, made.act, d.public ? undefined : made.key);
      const rec = await this.record(digest, made, d.public, d.to, d.relays, recipient);
      if (d.media.length) rec.media = d.media.map(b64);
      this.store.saveSigned(rec);
      const sent = await this.send(rec, me);
      this.answer({ draft: digest, verdict: 'approved', note: '', act: made.id, sent }, d, r.title);
      const lines: Line[] = sent.map((s) => ({ text: `${s.to}: ${s.answer}`, tone: s.accepted ? 'ok' : 'bad' }));
      if (!sent.some((s) => s.accepted && s.to !== 'its homes')) lines.push({ text: 'Nothing accepted it: it is signed, but not delivered. Send it again when the relays are back.', tone: 'bad' });
      return { title: `Approved and signed: ${r.title.replace(/, to be \w+$/, '').toLowerCase()}`, lines, acts: [made.id] };
    });
  }

  /**
   * What is sent of an act just signed: a message sealed to its recipient;
   * a public act to the relays, and, where it names recipients (a reply,
   * a nudge, a pick), a copy sealed to each in its inbox.
   */
  private async record(
    key: string,
    made: { act: Uint8Array; id: string; key: Uint8Array },
    pub: boolean,
    to: string[],
    relays: string[],
    recipient: Awaited<ReturnType<typeof recipientOf>> | null,
  ): Promise<SignedRecord> {
    const rec: SignedRecord = { draft: key, act: made.id, bytes: b64(made.act), relays };
    if (recipient) {
      rec.sealed = b64(sealFor(made.act, made.key, [{ id: to[0], key: recipient.key }]));
      rec.key = b64(made.key);
      rec.inbox = recipient.inbox;
    } else if (pub && to.length) {
      // Reading B1 (docs/f272-build.md; Envelopes, "How acts reach people"):
      // a reply concerns the identity whose act it answers, so a copy goes
      // to its inbox, sealed to it (a public act: no key in the container).
      rec.copies = [];
      rec.noCopy = [];
      for (const t of to) {
        try {
          const r = await recipientOf(t, this.hints(), this.via);
          rec.copies.push({ to: t, sealed: b64(sealFor(made.act, undefined, [{ id: t, key: r.key }])), inbox: r.inbox });
        } catch (e) {
          rec.noCopy.push({ to: t, why: err(e) });
        }
      }
    }
    return rec;
  }

  /**
   * Sign an act with an identity this desk holds and send it at once, with
   * no draft: for Machine, allegedly's terms and answers, and the owner's
   * nudges and picks (src/machine.ts). The caller has shown or decided what
   * it signs; this only signs, keeps and delivers, as an approved draft is.
   */
  async signAndSend(
    signer: string,
    a: { spec: string; type: number; payload: Uint8Array; public: boolean; to: string[]; refs: Reference[]; objects?: [string, string][] },
  ): Promise<{ id: string; act: Uint8Array; key: Uint8Array; sent: NonNullable<Answer['sent']> }> {
    return this.serial(async () => {
      if (!this.store.holds(signer)) throw new Error(`This desk does not hold the identity ${signer}.`);
      const me = this.store.identity(signer);
      if (me.f.pending) throw new Error('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
      const agency = this.agency(signer, a);
      if (agency) throw new Error(`${agency} Nothing was signed.`);
      const recipient = a.public ? null : await recipientOf(a.to[0], this.hints(), this.via);
      await this.keyCurrent(me.id);
      const made = me.sign(a.spec, a.type, a.payload, { public: a.public, to: a.to.length ? a.to : undefined, refs: a.refs.length ? a.refs : undefined, objects: a.objects?.length ? a.objects : undefined });
      // The sequence is saved before anything leaves, so no later act can fork from this one.
      this.store.saveIdentity(me);
      this.store.keepAct(made.id, made.act, a.public ? undefined : made.key);
      const rec = await this.record(made.id, made, a.public, a.to, a.public ? this.store.settings().relays : [], recipient);
      this.store.saveSigned(rec);
      const sent = await this.send(rec, me);
      return { id: made.id, act: made.act, key: made.key, sent };
    });
  }

  /**
   * Sign a private act of an identity held here, addressed to itself, and
   * leave it sealed to its own current encryption key at its homes, with its
   * locked act beside it (Identity rule 35): an agent's notes and diary
   * (H22), as Damgar's drafts travel (the money messages cMIP's
   * `sendToSelf`). Refused, before anything is signed, where the encryption
   * key its homes serve is not one held here: nothing sealed to it could be
   * opened again.
   */
  async sealToSelf(signer: string, a: { spec: string; type: number; payload: Uint8Array }): Promise<{ id: string; left: string[] }> {
    return this.serial(async () => {
      if (!this.store.holds(signer)) throw new Error(`This desk does not hold the identity ${signer}.`);
      const me = this.store.identity(signer);
      if (me.f.pending) throw new Error('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
      const homes = me.f.homes.map((h) => h.hint);
      const look = await lookUp(me.id, homes, this.via);
      if (!look.encryptionKey) throw new Error('This identity publishes no encryption key, so nothing can be sealed to it. Nothing was signed.');
      if (!me.f.encryption.some((e) => hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey!))) {
        throw new Error('The encryption key this identity publishes is not one Edubba holds: what is sealed to it would not open here. Nothing was signed.');
      }
      await this.keyCurrent(me.id);
      const made = me.sign(a.spec, a.type, a.payload, { public: false, to: [me.id] });
      this.store.saveIdentity(me);
      this.store.keepAct(made.id, made.act, made.key);
      const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
      const left: string[] = [];
      for (const h of homes) {
        try {
          await relayAt(h, this.via).putSealed(sealed);
          left.push(h);
        } catch {
          // that home is away: the others hold it
        }
      }
      // Its locked act beside it (H80's question 2): the latest act of this desk's line, which Kišib must find at the homes.
      await leaveAtHomes(me, made, { via: this.via, sealed: left.length > 0 });
      this.store.saveIdentity(me);
      if (!left.length) throw new Error(`No home took it (${homes.join(', ')}): it was signed but went nowhere.`);
      return { id: made.id, left };
    });
  }

  /**
   * Whether the signing key Edubba holds for an identity is still the one
   * its homes serve (F335: a change of keys is Kišib's, and Dub and Edubba
   * warn on opening and before every act). Null where it is, or where its
   * homes do not answer (the act's own check after signing still runs);
   * otherwise the warning, in plain words. *Cost:* one look-up per act.
   */
  async keyChanged(identity: string): Promise<string | null> {
    const me = this.store.identity(identity);
    return keyChangedAt(me.id, me.f.signingSecret, [...me.f.homes.map((h) => h.hint), ...this.hints()], this.via, KEY_CHANGED_SAY);
  }

  /**
   * Refuse, before anything is signed, where the signing key held here for
   * `identity` no longer counts (F335). Every path of Edubba that signs with
   * an identity's own key calls it first (H80: the reliance once did not).
   */
  async keyCurrent(identity: string): Promise<void> {
    const w = await this.keyChanged(identity);
    if (w) throw new Error(`${w} Nothing was signed.`);
  }

  /** The same for a real collective whose own signing key Edubba holds: Kišib changes it at a member change. */
  async collectiveKeyCurrent(c: { id: string; signingSecret: string; homes: Home[]; relays?: string[] }): Promise<void> {
    const w = await keyChangedAt(c.id, c.signingSecret, [...c.homes.map((h) => h.hint), ...(c.relays ?? []), ...this.hints()], this.via, COLLECTIVE_KEY_CHANGED_SAY);
    if (w) throw new Error(`${w} Nothing was signed.`);
  }

  /** Where acts are looked for: the relays, then the homes. */
  get places(): { hints: string[]; via: Via } {
    return { hints: this.hints(), via: this.via };
  }

  /** Send again an act signed from a draft: the same bytes, the same sealed container. */
  async resend(digest: string): Promise<Done> {
    return this.serial(async () => {
      const rec = this.store.signed(digest);
      if (!rec) throw new Error(`No act was signed from draft ${digest.slice(0, 12)}.`);
      const me = this.store.identity(decodeDraft(loadDraft(this.store.settings().drafts, digest).bytes).signer);
      const sent = await this.send(rec, me);
      const dir = this.store.settings().drafts;
      const a = loadAnswer(dir, digest);
      if (a) saveAnswer(dir, { ...a, sent });
      return { title: 'Sent again', lines: sent.map((s) => ({ text: `${s.to}: ${s.answer}`, tone: s.accepted ? 'ok' : 'bad' })), acts: [rec.act] };
    });
  }

  private async send(rec: SignedRecord, me: TestIdentity): Promise<NonNullable<Answer['sent']>> {
    const via = this.via;
    const act = unb64(rec.bytes);
    // Checked before it leaves: its signer's identity chain counts it.
    const l = await lookUp(me.id, this.hints(), via);
    if (rec.key) l.verifier.addWithKey(act, unb64(rec.key));
    else l.verifier.add(act);
    // The acts it names in `objects` that this desk signed and kept: a
    // withdrawal is judged against its publication, unknown without it
    // (Envelopes rule 24; Identity draft 13, F298).
    const named = new Set(((describeAct(act) as { objects?: [string, string][] }).objects ?? []).map((o) => o[1]));
    if (named.size) {
      for (const k of this.store.keptActs()) {
        const id = (describeAct(k.act) as { id: string }).id;
        if (!named.has(id)) continue;
        if (k.key) l.verifier.addWithKey(k.act, k.key);
        else l.verifier.add(k.act);
        named.delete(id);
      }
      // Not kept here: looked for where acts are looked for.
      for (const id of named) {
        for (const hint of this.hints()) {
          try {
            const b = await relayAt(hint, via).getAct(id);
            if (!b) continue;
            l.verifier.add(b);
            break;
          } catch {
            // not at that place
          }
        }
      }
    }
    const standing = l.verifier.status(rec.act);
    if (standing !== 'valid') throw new Error(`the signed act is ${standing}, not valid, for its signer's identity chain. Nothing was sent.`);

    const out: NonNullable<Answer['sent']> = [];
    const carry = async (hint: string) => {
      for (const c of me.chainActs()) {
        try {
          await relayAt(hint, via).putAct(c);
        } catch {
          // that relay's policy, or it holds it already
        }
      }
    };
    if (rec.sealed) {
      for (const hint of rec.inbox ?? []) {
        await carry(hint);
        try {
          await relayAt(hint, via).putSealed(unb64(rec.sealed));
          out.push({ to: `inbox ${hint}`, accepted: true, answer: 'sealed and delivered' });
        } catch (e) {
          out.push({ to: `inbox ${hint}`, accepted: false, answer: `refused: ${e instanceof RelayError ? e.reason : err(e)}` });
        }
      }
      // The act itself, locked, goes to the sender's homes too (Identity rule
      // 35; what the Dub report left for the desk), its content key delivered
      // to the sender itself (H80's question 2): Kišib places this desk's line
      // by it, and the identity's other apps follow the line through it. The
      // homes see that a private act exists, never what it says or to whom.
      const homes = rec.key ? await leaveAtHomes(me, { act, id: rec.act, key: unb64(rec.key) }, { via }) : [];
      this.store.saveIdentity(me);
      if (out.length) out.push({ to: 'its homes', accepted: homes.length > 0, answer: homes.length ? `its locked act kept at ${homes.join(', ')}, so its line stays readable (Identity rule 35)` : 'no home took its locked act: its line is read by its card (Identity rule 35)' });
      return out;
    }
    // The identity chains of the signers its public references name, carried to
    // the relays where it is published, so each can be looked up there (relay
    // transport cMIP draft 4, "Clients", 7, a SHOULD; F272 build, Question 2).
    const chains = rec.relays.length ? await carryChains(act, rec.relays, this.hints(), via) : null;
    const chainWords = (hint: string): string => {
      const r = chains?.relays.find((x) => x.hint === hint);
      if (!chains?.signers.length || !r) return '';
      const whose = chains.signers.map((x) => `${x.slice(0, 12)}…`).join(', ');
      return `; the identity chain of ${whose}, whose act it names, carried: ${r.kept} ${r.kept === 1 ? 'act' : 'acts'} kept${r.refused.length ? `, ${r.refused.length} refused (${r.refused[0]})` : ''}`;
    };
    for (const n of chains?.notFound ?? []) out.push({ to: `the identity ${n.signer.slice(0, 12)}…`, accepted: false, answer: `its identity chain was not found, so not carried: ${n.why}` });
    for (const hint of rec.relays) {
      await carry(hint);
      try {
        const got = await relayAt(hint, via).putAct(act);
        let answer = (got.id === rec.act ? 'accepted' : `answered with another id, ${got.id}`) + chainWords(hint);
        for (const m of rec.media ?? []) {
          try {
            await relayAt(hint, via).putMedia(unb64(m));
            answer += ', and the picture';
          } catch (e) {
            answer += `; the picture refused: ${e instanceof RelayError ? e.reason : err(e)}`;
          }
        }
        out.push({ to: hint, accepted: got.id === rec.act, answer });
      } catch (e) {
        out.push({ to: hint, accepted: false, answer: `refused: ${e instanceof RelayError ? e.reason : err(e)}` });
      }
    }
    // A reply's copies, each sealed to the identity it answers, in its inbox.
    for (const c of rec.copies ?? []) {
      for (const hint of c.inbox) {
        await carry(hint);
        try {
          await relayAt(hint, via).putSealed(unb64(c.sealed));
          out.push({ to: `inbox ${hint}`, accepted: true, answer: `a copy sealed to ${c.to.slice(0, 12)}…, whose act it answers` });
        } catch (e) {
          out.push({ to: `inbox ${hint}`, accepted: false, answer: `the copy for ${c.to.slice(0, 12)}… refused: ${e instanceof RelayError ? e.reason : err(e)}` });
        }
      }
    }
    for (const n of rec.noCopy ?? []) out.push({ to: `inbox of ${n.to.slice(0, 12)}…`, accepted: false, answer: `no copy left: ${n.why}` });
    return out;
  }

  // ------------------------------------------------------------ what each identity received

  /**
   * Gather what an identity received since last time: everything its inbox
   * relays hold addressed to it, sealed or not. Each item is opened with the
   * identity's encryption keys, its signer looked up, its act judged by the
   * core library, and its kind told from what it says. Silence proves
   * nothing: what was not delivered to the inbox is not found here.
   */
  async refresh(identity: string): Promise<{ added: number; problems: string[] }> {
    return this.serial(async () => {
      const me = this.store.identity(identity);
      const via = this.via;
      // An identity brought here may live at other homes than those in Settings (H15).
      const hints = [...new Set([...this.hints(), ...me.f.homes.map((h) => h.hint)])];
      const l = await lookUp(identity, hints, via);
      const inbox = [...new Set(l.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints))];
      const rec = this.store.received(identity);
      const mine = new Set(me.f.sequence);
      const secrets = [...me.f.encryption].reverse().map((e) => Uint8Array.from(Buffer.from(e.secret, 'hex')));
      const problems: string[] = inbox.length ? [] : ['This identity declares no inbox: nothing can be delivered to it.'];
      let added = 0;
      for (const hint of inbox) {
        let after = rec.after[hint];
        try {
          for (;;) {
            const page = await relayAt(hint, via).feed({ to: identity, after });
            for (const it of page.items) {
              const item = await this.readItem(it.kind, it.item, identity, secrets, mine, hints);
              // Its own acts sealed to itself (the follow list, people cMIP draft 2) are not something it received.
              if (item.from === identity) continue;
              if (!rec.items.some((x) => x.key === item.key)) {
                rec.items.push(item);
                added++;
              }
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
          if (after !== undefined) rec.after[hint] = after;
        } catch (e) {
          problems.push(`${hint}: ${err(e)}`);
        }
      }
      // F188 (DQ6), client conformance: a holder's client raises the alarm
      // where the numbers on the splits it receives from one service under
      // one deal skip: splits are being made where it is not shown.
      const groups = new Map<string, Item[]>();
      for (const it of rec.items) {
        if (!it.split) continue;
        const root = (await dealRoot(it.split.agreement, hints, via)) ?? it.split.agreement;
        const k = `${it.split.service}/${root}`;
        groups.set(k, [...(groups.get(k) ?? []), it]);
      }
      for (const items of groups.values()) {
        const numbers = items.map((x) => x.split!.number).filter((n): n is number => n !== null);
        const gaps = splitGaps(numbers);
        const unnumbered = items.filter((x) => x.split!.number === null).length;
        // QF4 (decided by Nobody, allegedly, 9 October 2026, F190): a split
        // with no number, or a number two splits carry, is a deviation that
        // breaks the plan, as a reset of the tally chain is (F171).
        const repeated = [...new Set(numbers.filter((n, i) => numbers.indexOf(n) !== i))].sort((a, b) => a - b);
        const top = items.reduce((a, b) => ((b.split!.number ?? 0) > (a.split!.number ?? 0) ? b : a));
        for (const x of items) if (x.alarm?.startsWith('ALARM (Agreements rule 15a')) delete x.alarm;
        if (gaps.length || unnumbered || repeated.length) {
          top.alarm = [
            gaps.length
              ? `ALARM (Agreements rule 15a, F188): this service's splits under this deal skip: ${gaps.length === 1 ? `the split numbered ${gaps[0]} was` : `the splits numbered ${gaps.join(', ')} were`} never delivered here. Splits are being made where this identity is not shown: the deal may have a branch hidden from it.`
              : 'ALARM (Agreements rule 15a, QF4): the numbers on this service\'s splits under this deal break the plan.',
            unnumbered
              ? `${unnumbered} split${unnumbered === 1 ? '' : 's'} of this service under this deal carr${unnumbered === 1 ? 'ies' : 'y'} no number: a deviation that breaks the plan (Agreements rule 15a, QF4).`
              : '',
            ...repeated.map(
              (n) => `The number ${n} is carried by ${numbers.filter((m) => m === n).length} splits: a deviation that breaks the plan (Agreements rule 15a, QF4).`,
            ),
            'Look at the whole deal with every party, and ask the service for the splits missing or repeated.',
          ]
            .filter(Boolean)
            .join(' ');
        }
      }
      // F152: a private link counts only once published at its signer's
      // homes, so a thief using a stolen signing key leaves something here:
      // any act its homes hold, signed with its key, that this desk did not
      // make. Content unread; its existence is the warning.
      // An identity brought here (H15): the acts its homes held when it was brought were made by the app it came from, and are no warning.
      const entry = this.store.book().identities.find((x) => x.id === identity);
      const before = new Set(entry?.elsewhere ?? []);
      for (const u of (await me.unrecognised()).filter((x) => !before.has(x.id))) {
        problems.push(
          entry?.kind === 'brought'
            ? `Its home ${u.home} holds ${u.private ? 'a private act' : 'an act'} signed with this identity's key that this desk did not make (${short(u.id)}), since it was brought here. If the app it came from made it, all is well; if no app of yours did, the signing key may be stolen: change its keys in Kišib, from the chain key’s paper words.`
            : `Its home ${u.home} holds ${u.private ? 'a private act' : 'an act'} signed with this identity's key that this desk did not make (${short(u.id)}). If you did not make it elsewhere, the signing key may be stolen: change its keys in Kišib, from the chain key’s paper words.`,
        );
      }
      this.store.saveReceived(identity, rec);
      return { added, problems };
    });
  }

  private async readItem(kind: 'act' | 'sealed', bytes: Uint8Array, me: string, secrets: Uint8Array[], mine: Set<string>, hints: string[]): Promise<Item> {
    const base = { found: now(), sorted: 'new' as Sorted, answers: [] as string[], acknowledges: [] as string[], refs: [] as string[] };
    let act: Uint8Array;
    let key: Uint8Array | undefined;
    let d: Described;
    if (kind === 'sealed') {
      const id = sealedId(bytes);
      type Opened = { act: Uint8Array; key?: Uint8Array; described: Described };
      let why = 'no key opens it';
      const open = (): Opened | null => {
        for (const s of secrets) {
          try {
            const parts = sealedParts(bytes) as { to: string[]; capsules: Uint8Array[] };
            const i = parts.to.indexOf(me);
            if (i >= 0) recordKex({ kind: 'decapsulate', secret: s, ct: parts.capsules[i] });
            return openSealed(bytes, me, s) as Opened;
          } catch (e) {
            why = err(e);
          }
        }
        return null;
      };
      const opened = open();
      if (!opened) return { ...base, key: `sealed:${id}`, kind: 'other', from: null, act: null, private: true, standing: 'unknown', problem: `A sealed container addressed to this identity that does not open: ${why}.` };
      act = opened.act;
      key = opened.key;
      d = opened.described;
    } else {
      act = bytes;
      try {
        d = describeAct(bytes) as Described;
      } catch (e) {
        return { ...base, key: `act:${Buffer.from(bytes.subarray(0, 16)).toString('hex')}`, kind: 'other', from: null, act: null, private: false, standing: 'invalid', problem: `Not a valid act: ${err(e)}.` };
      }
    }
    let standing = 'unknown';
    if (d.signer) {
      try {
        const them = await lookUp(d.signer, hints, this.via);
        if (key) them.verifier.addWithKey(act, key);
        else them.verifier.add(act);
        standing = them.verifier.status(d.id);
      } catch (e) {
        standing = `its signer was not found (${err(e)})`;
      }
    }
    const refs = d.refs ?? [];
    // F110: only Identity, Money and Agreements acts acknowledge; any other act
    // carrying acks is invalid and acknowledges nothing.
    const acksAllowed = !d.spec || ACK_SPECS.includes(d.spec);
    const acks = acksAllowed ? (d.acks ?? []) : [];
    const item: Item = {
      ...base,
      key: d.id,
      kind: 'other',
      from: d.signer ?? null,
      act: d.id,
      private: !d.public,
      standing,
      answers: refs.filter((r) => mine.has(r)),
      acknowledges: acks.filter((r) => mine.has(r)),
      refs: refs.filter((r) => !mine.has(r)),
    };
    if (!d.payload) {
      item.problem = 'A private act addressed to this identity, whose key was not delivered with it: it cannot be read here.';
      return item;
    }
    // A reply answers one of this identity's acts; an acknowledgement only says it received one; a message is any other text.
    const isText = d.spec === SPECS.text && d.type === 0;
    if (isText) {
      const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
      if (typeof t === 'string') item.text = t;
    }
    if (isText && item.answers.length) item.kind = 'reply';
    else if (item.acknowledges.length) item.kind = 'acknowledgement';
    else if (isText) item.kind = 'message';
    else if (d.spec === DESK_SPECS.money) item.kind = 'payment';
    else if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery) item.kind = 'key delivery';
    if (d.spec === SPECS.identity && d.type === IDENTITY_TYPES.witness) item.witness = true;
    // The nudge cMIP's acts (cmips/cmip-nudge-draft-2.md): read by Machine, allegedly's answering (src/machine.ts).
    if (d.spec === NUDGE_SPECS.nudge) {
      item.kind = d.type === NUDGE_TYPES.nudge ? 'nudge' : d.type === NUDGE_TYPES.pick ? 'pick' : d.type === NUDGE_TYPES.terms ? 'terms' : 'other';
    }
    if (isText || d.spec === NUDGE_SPECS.nudge) item.raw = { act: b64(act), key: key ? b64(key) : undefined };
    if (!acksAllowed && d.acks?.length) item.problem = 'It carries acknowledgements, which only Identity, Money and Agreements acts may carry (Envelopes rule 4a, F110): it is invalid, and acknowledges nothing.';
    if (item.kind === 'payment') {
      item.problem = 'A Money act (a payment claim, a receipt or an obligation): this desk does not read Money yet, nor check a rail’s proof (Lightning module, roadmap step 12). It is shown as received, not as paid. It does check the version of a deal a payment names.';
      // Client conformance (Agreements rule 45b, F186): a seller's client raises
      // the alarm when a payment names a version of the deal that does not
      // descend from the version it holds, showing both branches.
      try {
        const alarm = await sellerAlarm(me, act, hints, this.via);
        // F188 (DQ7): an older version raises a plain notice; the alarm is kept for forks.
        if (alarm?.kind === 'older') item.notice = alarm.words.join(' ');
        else if (alarm) item.alarm = alarm.words.join(' ');
      } catch (e) {
        item.alarm = `The version of the deal this payment names could not be checked (${err(e)}): look at the deal before relying on it (Agreements rule 45b, F186).`;
      }
    }
    if (d.spec === REPO_SPECS.agreements) item.problem = 'An Agreements act: read it in the collective client.';
    if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.terms) {
      // The deal-assessment tool (roadmap step 14), offered before signing: the
      // shares and fees, and the risks, read by the core from the terms' bytes.
      item.problem = 'Agreements terms: assessed below. They are signed in the collective client, never here.';
      item.assessment = beforeSigning(d.payload, this.store.names());
    }
    if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.split && d.signer) {
      // F188 (DQ6): a split's number, read for the holder's alarm.
      try {
        const m = cborDecode(d.payload) as Map<number, unknown>;
        const ag = m.get(3);
        const n = m.get(5);
        if (ag instanceof Uint8Array) item.split = { service: d.signer, agreement: hex(ag), number: typeof n === 'number' ? n : typeof n === 'bigint' ? Number(n) : null };
        item.kind = 'split';
      } catch {
        // not a split this desk reads
      }
    }
    return item;
  }

  /**
   * The owner relies on an act it received: a witness act (Identity type
   * 15, F110), signed by this identity, public, sent to its homes and
   * relays. Never a side effect: the page shows `WITNESS_EXPLANATION` and
   * passes it back word for word, or nothing is signed (Identity rule 18c).
   * Refused, before anything is signed, where the signing key held here no
   * longer counts (H80: this path once skipped the check every other one
   * makes, and signed with a retired key).
   */
  async witness(identity: string, act: string, shown: string): Promise<{ id: string }> {
    return this.serial(async () => {
      const me = this.store.identity(identity);
      if (me.f.pending) throw new Error('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
      await this.keyCurrent(me.id);
      const r = await me.witness([act], { shown, relays: this.store.settings().relays });
      this.store.saveIdentity(me);
      if (!r.sent.some((s) => s.result)) throw new Error(`No home took the witness act: ${r.sent.map((s) => `${s.home}: ${s.error}`).join('; ')}`);
      return { id: r.id };
    });
  }

  /** H14, H26, H34: a fold open or closed, as the person left it: a collective's "What you may do for it" by its ID, every other fold by its name. */
  fold(key: string, open: boolean): void {
    if (!/^[0-9a-f]{64}$/.test(key) && !/^[a-z][a-z-]{0,40}(:[0-9a-f]{64})?$/.test(key)) throw new Error('not a fold');
    const b = this.store.book();
    b.unfolded = { ...(b.unfolded ?? {}), [key]: open };
    this.store.saveBook(b);
  }

  /** The owner sorts one received item. */
  sort(identity: string, key: string, sorted: string): void {
    if (!SORTED.includes(sorted as Sorted)) throw new Error(`sort into one of: ${SORTED.join(', ')}`);
    const rec = this.store.received(identity);
    const it = rec.items.find((x) => x.key === key);
    if (!it) throw new Error('No such item.');
    it.sorted = sorted as Sorted;
    this.store.saveReceived(identity, rec);
  }

  // ------------------------------------------------------------ the page's state

  /** Whether anything accepted the act signed from a draft, as the desk's answer records it. */
  private delivered(draft: string): boolean {
    try {
      return !!loadAnswer(this.store.settings().drafts, draft)?.sent?.some((x) => x.accepted && x.to !== 'its homes');
    } catch {
      return false;
    }
  }

  /**
   * This desk's line of each identity it holds, its card naming only an act
   * the homes hold (H80's question 2): what waits sent first, in its turn.
   */
  async lines(): Promise<Record<string, LineAtHomes>> {
    const out: Record<string, LineAtHomes> = {};
    for (const i of this.store.book().identities) {
      if (!this.store.holds(i.id)) continue;
      if (Object.keys(this.store.identity(i.id).f.unsent ?? {}).length) {
        await this.serial(async () => {
          const me = this.store.identity(i.id);
          // Sending signs a key delivery to oneself: only with a key still current (H80).
          await this.keyCurrent(i.id);
          await sendWaiting(me, this.via);
          this.store.saveIdentity(me);
        }).catch(() => undefined);
      }
      const me = this.store.identity(i.id);
      out[i.id] = await this.line(me, this.via).catch(() => noLine(me.f.sequence));
    }
    return out;
  }

  state() {
    const b = this.store.book();
    const s = this.store.settings();
    const names = this.store.names();
    return {
      settings: s,
      unfolded: b.unfolded ?? {},
      identities: b.identities.map((i) => {
        const r = this.store.received(i.id);
        // F152: this desk's own line of acts for the identity, so the owner
        // can tell it from a thief's, and keep it at a key change (Identity
        // rule 35): the card the rotating client reads it by.
        const own = ownLine(this.store.identity(i.id).f.sequence);
        return {
          id: i.id,
          name: i.name,
          linked: i.linked,
          kind: i.kind ?? 'made',
          line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
          releases: [...(i.releases ?? [])].reverse().map(({ id, name, version, folder }) => ({ id, name, version, folder })),
          received: r.items.map((x) => ({ ...x, fromName: x.from ? names(x.from) : null, text: x.text === undefined ? undefined : escapeControls(x.text) })),
        };
      }),
      history: this.store
        .history()
        .slice(-50)
        .reverse()
        .map((h) => ({ ...h, signerName: names(h.signer), resend: h.verdict === 'approved' && !!this.store.signed(h.draft) && !this.delivered(h.draft) })),
    };
  }
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  refs?: string[];
  acks?: string[];
  payload?: Uint8Array;
}

export type { Kind };
