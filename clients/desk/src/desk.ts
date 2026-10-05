// What the desk does (roadmap step 11c): it holds the owner's test
// identities; it shows each draft Claude prepared, read in plain words from
// the draft's own bytes, with its digest; on the owner's word it approves
// (signs and sends), declines, or sends the draft back with a note for
// Claude; and it gathers what each identity received, for the owner to sort.
//
// Signing follows the draft byte for byte: the owner approves a digest, the
// desk reads the file again, checks its bytes hash to that digest, reads it
// again, and signs only if nothing blocks it. What you sign is what you saw.

import { ACK_SPECS, IDENTITY_TYPES, SPECS, ENVELOPE_TYPES, cborDecode, describeAct, hex, openSealed, sealedParts } from '../../genesis/src/core.ts';
import { TestIdentity, sealFor, type Home } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, sealedId, RelayError, type Via } from '../../genesis/src/transport.ts';
import { record as recordKex } from '../../genesis/src/kex.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
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
import { DESK_SPECS } from './specs.ts';
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

export class Desk {
  /** One signing operation at a time. */
  private busy: Promise<unknown> = Promise.resolve();

  constructor(readonly store: Store) {}

  private serial<T>(f: () => Promise<T>): Promise<T> {
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
      const key = await id.publishEncryptionKey();
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
      lines.push({ text: `Its acts are found at, and its inbox is, ${relays.join(', ')}.` });
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

  /** Reasons the desk itself refuses a draft, beyond its reading. */
  private refusals(d: Draft): string[] {
    const out: string[] = [];
    const entry = this.store.book().identities.find((i) => i.id === d.signer);
    if (!entry || !this.store.holds(d.signer)) out.push(`This desk does not hold the identity ${d.signer}, so it cannot sign for it.`);
    else {
      if (!entry.linked) out.push(`“${entry.name}” is not linked to Claude: link it first if Claude may prepare its acts.`);
      if (this.store.identity(d.signer).f.pending) out.push('A rotation of this identity is waiting to count: nothing is signed with it until it does.');
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
      const made = me.sign(d.spec, d.type, d.payload, {
        public: d.public,
        to: d.to.length ? d.to : undefined,
        refs: d.refs.length ? d.refs : undefined,
        objects: d.objects.length ? d.objects : undefined,
      });
      // The sequence is saved before anything leaves, so no later act can fork from this one.
      this.store.saveIdentity(me);
      const rec: SignedRecord = { draft: digest, act: made.id, bytes: b64(made.act), relays: d.relays };
      if (d.media.length) rec.media = d.media.map(b64);
      if (recipient) {
        rec.sealed = b64(sealFor(made.act, made.key, [{ id: d.to[0], key: recipient.key }]));
        rec.key = b64(made.key);
        rec.inbox = recipient.inbox;
      }
      this.store.saveSigned(rec);
      const sent = await this.send(rec, me);
      this.answer({ draft: digest, verdict: 'approved', note: '', act: made.id, sent }, d, r.title);
      const lines: Line[] = sent.map((s) => ({ text: `${s.to}: ${s.answer}`, tone: s.accepted ? 'ok' : 'bad' }));
      if (!sent.some((s) => s.accepted)) lines.push({ text: 'Nothing accepted it: it is signed, but not delivered. Send it again when the relays are back.', tone: 'bad' });
      return { title: `Approved and signed: ${r.title.replace(/, to be \w+$/, '').toLowerCase()}`, lines, acts: [made.id] };
    });
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
      return out;
    }
    for (const hint of rec.relays) {
      await carry(hint);
      try {
        const got = await relayAt(hint, via).putAct(act);
        let answer = got.id === rec.act ? 'accepted' : `answered with another id, ${got.id}`;
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
      const hints = this.hints();
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
    // F110: only Identity, Finance and Law acts acknowledge; any other act
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
    else if (d.spec === DESK_SPECS.finance) item.kind = 'payment';
    else if (d.spec === SPECS.envelope && d.type === ENVELOPE_TYPES.keyDelivery) item.kind = 'key delivery';
    if (d.spec === SPECS.identity && d.type === IDENTITY_TYPES.witness) item.witness = true;
    if (!acksAllowed && d.acks?.length) item.problem = 'It carries acknowledgements, which only Identity, Finance and Law acts may carry (Envelope rule 4a, F110): it is invalid, and acknowledges nothing.';
    if (item.kind === 'payment') item.problem = 'A Finance act (a payment claim, a receipt or an obligation): this desk does not read Finance yet, nor check a rail’s proof (Lightning module, roadmap step 12). It is shown as received, not as paid.';
    if (d.spec === REPO_SPECS.law) item.problem = 'A Law act: read it in the collective client.';
    return item;
  }

  /**
   * The owner relies on an act it received: a witness act (Identity type
   * 15, F110), signed by this identity, public, sent to its homes and
   * relays. Never a side effect: the page shows `WITNESS_EXPLANATION` and
   * passes it back word for word, or nothing is signed (Identity rule 18c).
   */
  async witness(identity: string, act: string, shown: string): Promise<{ id: string }> {
    return this.serial(async () => {
      const me = this.store.identity(identity);
      const r = await me.witness([act], { shown, relays: this.store.settings().relays });
      this.store.saveIdentity(me);
      if (!r.sent.some((s) => s.result)) throw new Error(`No home took the witness act: ${r.sent.map((s) => `${s.home}: ${s.error}`).join('; ')}`);
      return { id: r.id };
    });
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
      return !!loadAnswer(this.store.settings().drafts, draft)?.sent?.some((x) => x.accepted);
    } catch {
      return false;
    }
  }

  state() {
    const b = this.store.book();
    const s = this.store.settings();
    const names = this.store.names();
    return {
      settings: s,
      identities: b.identities.map((i) => {
        const r = this.store.received(i.id);
        return {
          id: i.id,
          name: i.name,
          linked: i.linked,
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
