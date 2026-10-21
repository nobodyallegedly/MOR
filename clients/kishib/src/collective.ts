// A collective's rotation in Kišib (F337), completing a member change
// proposed in Edubba and signed by every member in their own app.
//
// Remote, by default (F337: "as they went out at founding"):
//   1. The member who proposed the change (the founder, in Edubba) opens
//      Kišib, gives the collective's ID, their own paper share and their
//      signing key's words (decided by Nobody, allegedly, on the session's
//      proposal: only those open the change's answers in their inbox, with
//      the one-time keys the members' Dubs made for their new shares).
//      Kišib reads the change, its signatures and the collective's lines,
//      says plainly what this device will hold (F337's must-read screen),
//      and on confirmation makes a one-time key and announces the rotation:
//      the request (everything the rotation will say, but the keys it
//      creates) is left at the collective's relays, found by its
//      fingerprint, and a message in each member's thread says so.
//   2. Each other member opens their own Kišib, gives the collective and
//      the fingerprint, reads the rotation in plain words, types their
//      paper share and their own signing key's words; Kišib seals the share,
//      with the fingerprint, to the one-time key, in a small private act
//      signed by the member ("my share, for rotation F…"): MOR seals only
//      signed acts, and the act is also a record of who consented.
//   3. Once exactly the threshold is in (no more), the starter's Kišib, in
//      one sitting: rebuilds the chain key from the papers, checks it
//      against the commitment the collective's chain holds, creates the next
//      chain key and the new signing key, signs the rotation, deals the new
//      shares (each sealed to its member's one-time key, signed as the
//      founder, as at the founding; the starter's own, and any member's
//      without a one-time key, shown here once), and overwrites the key.
//      It keeps the signed bytes to send again, never the key.
// The waiting one-time key expires after an hour (F337: "an hour, say";
// stands, Nobody, allegedly): shares sealed to it can never be opened after.
//
// In the same room: the papers are typed one after another into one Kišib;
// nothing is sent, no signing words; every new share is shown here once.
//
// TEST COLLECTIVES ONLY, until MOR is frozen.

import {
  SPECS,
  actId,
  cborDecode,
  cborEncode,
  dealChainKey,
  describeAct,
  hex,
  lockMedia,
  makeRotation,
  newEncryptionSecret,
  newSigningSecret,
  openMedia,
  openSealed,
  pickupTag,
  readTerms,
  rebuildChainKey,
  rebuildChainKeyFromPaper,
  sha256,
  shareOnPaper,
  signingPublic,
  unhex,
  verifyShare,
  workHash,
  xwingPublic,
} from '../../genesis/src/core.ts';
import { TestIdentity, sealFor } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { actsBy, checkWarned, planLines, type LinePlan } from '../../genesis/src/lines.ts';
import { threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { readId } from '../../genesis/src/forms.ts';
import { lookCurrent, carriedKey, servedChain } from '../../dub/src/carryin.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, FOUNDING_AGREEMENT, REPO_SPECS } from '../../repo/src/specs.ts';
import { negotiate, oneTimeKeyOf, readMessage, sealShare, SIGNED } from '../../repo/src/proposals.ts';
import { readChanges } from '../../collective/src/explain.ts';
import { readIdentity, recordWords, type Read } from './read.ts';
import { paperOf, seedOf, wipe, Refused, type Paper } from './words.ts';
import { grouped, type Line, type Review, type Section, type Sitting } from './shapes.ts';
import { addresses, holding, put, FORGOTTEN_SAY, NEW_WORDS_SAY } from './common.ts';

/** How long a waiting one-time key lives (F337: "an hour, say"; stands). */
export const EXPIRY = 60 * 60;

/** The request's first field, word for word. */
export const REQUEST_LABEL = 'MOR Kišib collective rotation request, version 1';

/** The media spec of a member's share sealed to the one-time key: a test value, Kišib's own, until publication. */
export const CONTRIBUTION_MEDIA = sha256('Kišib: a paper share given to a collective rotation, test value until publication');

/**
 * F337, decided by Nobody, allegedly: "Kišib needs to lay all this properly
 * to its users." Said before a collective rotation, on a screen the person
 * must read and say they read.
 */
export const DEALER_SAY: Line[] = [
  { text: 'This device will hold the collective’s whole chain key for a moment: rebuilt from the members’ papers, used once to sign this rotation, then overwritten. It also creates the new chain key and deals its shares, so for that moment it knows the new key whole.', tone: 'bad' },
  { text: 'If this device were compromised, or the person holding it dishonest, they could keep the new key and later act alone, past the threshold the members agreed. Nothing can prove a device forgot a key (F97). Founding has the same moment, on the founder’s device.', tone: 'bad' },
  { text: 'So choose the cleanest device available: the app rather than the web page; ideally a device used for nothing else. The air-gapped way (an offline device, the bytes carried by QR code) is the gold standard, and comes later.', tone: 'warn' },
  { text: 'The practices Kišib follows: the key alive only in memory, the rotation signed at once, the new shares dealt, the key overwritten, never written anywhere; the signed bytes kept to send again, not the key; exactly the threshold of papers collected, no more; the waiting one-time key expiring after an hour, shares sealed to it unopenable after; rebuild, rotate and deal in one sitting.' },
  { text: 'Afterwards: every member writes their new share on new paper and destroys the old one (it opens nothing once the rotation counts); the new signing key’s words go to whoever holds that key (Edubba); every member’s Dub and Edubba show the rotation.' },
];

export interface CollectiveDeps {
  now: () => number;
  web: boolean;
}

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface Described {
  id: string;
  signer?: string;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  objects?: [string, string][];
}

/** The collective as read: its chain, the agreement in force and its terms, who holds the chain key's shares. */
interface ReadCollective {
  rd: Read;
  agreement: string;
  agreementPayload: Uint8Array;
  holders: string[];
  threshold: number;
  scheme: number;
  /** The key the collective's chain commits now: its index. */
  index: number;
  commit: string;
  latest: { act: string; position: number };
}

/** The member change waiting for its rotation, found from public acts. */
interface Change {
  clone: string;
  payload: Uint8Array;
  proposer: string;
  members: string[];
  threshold: number;
  holder: string;
  signers: string[];
  signatures: Record<string, string>;
  missing: string[];
}

/** The request members consent to: everything the rotation says, but the keys it creates (as the air-gapped Module's request hash leaves out the next commitment). */
interface Request {
  collective: string;
  previous: string;
  position: number;
  kept: [string, number, string][];
  clone: string;
  signatures: string[];
  members: string[];
  threshold: number;
  needed: number;
  oneTime: Uint8Array;
  expires: number;
  relays: string[];
  starter: string;
}

function encodeRequest(q: Request): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, REQUEST_LABEL],
      [1, unhex(q.collective)],
      [2, unhex(q.previous)],
      [3, q.position],
      [4, q.kept.map(([a, p, s]) => [unhex(a), p, unhex(s)])],
      [5, unhex(q.clone)],
      [6, q.signatures.map(unhex)],
      [7, q.members.map(unhex)],
      [8, q.threshold],
      [9, q.needed],
      [10, q.oneTime],
      [11, q.expires],
      [12, q.relays],
      [13, unhex(q.starter)],
    ]),
  );
}

function decodeRequest(b: Uint8Array): Request {
  const m = cborDecode(b) as Map<number, unknown>;
  if (m.get(0) !== REQUEST_LABEL) throw new Error('This is not a Kišib rotation request.');
  const h = (k: number) => hex(m.get(k) as Uint8Array);
  return {
    collective: h(1),
    previous: h(2),
    position: Number(m.get(3)),
    kept: (m.get(4) as unknown[][]).map((t) => [hex(t[0] as Uint8Array), Number(t[1]), hex(t[2] as Uint8Array)]),
    clone: h(5),
    signatures: (m.get(6) as Uint8Array[]).map(hex),
    members: (m.get(7) as Uint8Array[]).map(hex),
    threshold: Number(m.get(8)),
    needed: Number(m.get(9)),
    oneTime: m.get(10) as Uint8Array,
    expires: Number(m.get(11)),
    relays: m.get(12) as string[],
    starter: h(13),
  };
}

/** A fingerprint as typed: 64 hexadecimal characters, spaces ignored. */
function readFingerprint(typed: string): string {
  const h = typed.replace(/\s+/g, '').toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(h)) throw new Refused('The rotation’s fingerprint is 64 hexadecimal characters, as the starter’s message gives it (spaces do not matter)');
  return h;
}

const when = (t: number) => new Date(t * 1000).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

/** The latest declaration of the agreement a collective lives under, as its counted chain says (Agreements' kind 0). */
function declaredAgreement(rd: Read): string | null {
  let out: string | null = null;
  for (const l of rd.look.resolution.links) {
    const b = rd.chainActs.get(l.act);
    if (!b) continue;
    const d = describeAct(b) as Described;
    const m = cborDecode(d.payload!) as Map<number, unknown>;
    const decl = (d.type === 0 ? m.get(4) : m.get(8)) as unknown[][] | undefined;
    for (const x of decl ?? []) {
      if (hex(x[0] as Uint8Array) !== REPO_SPECS.agreements || Number(x[1]) !== FOUNDING_AGREEMENT || x[2] === null) continue;
      out = x[2] instanceof Uint8Array ? hex(x[2]) : hex((x[2] as unknown[])[0] as Uint8Array);
    }
  }
  return out;
}

async function fetchAct(id: string, places: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of places) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
      // the next place
    }
  }
  return null;
}

async function readCollective(id: string, address: string[], via: Via): Promise<ReadCollective> {
  const rd = await readIdentity(id, address, via, SPECS.identity);
  const r = rd.look.resolution;
  const agreement = declaredAgreement(rd);
  if (!agreement) throw new Error(`${short(id)} declares no agreement: it is not a collective Kišib can rotate.`);
  const bytes = await fetchAct(agreement, rd.places, via);
  if (!bytes) throw new Error(`Its agreement (${agreement}) was not found at ${rd.places.join(', ')}.`);
  const agreementPayload = (describeAct(bytes) as Described).payload!;
  const t = readTerms(agreementPayload, AGREEMENTS_SPECS) as { parties: string[]; grammar?: { chainKey: { form: string; threshold?: number; members?: string[] } } };
  const ck = t.grammar?.chainKey;
  if (!ck || ck.form !== 'shares' || !ck.threshold) throw new Error('Its agreement does not split the chain key into members’ shares: Kišib rotates only collectives whose key is on their members’ paper.');
  const latest = r.links[r.links.length - 1];
  return { rd, agreement, agreementPayload, holders: ck.members ?? t.parties, threshold: ck.threshold, scheme: r.chainKeyScheme!, index: latest.position, commit: r.chainKeyCommit!, latest };
}

/** Whether `a` is `signer`'s Agreements signature naming `act`. */
function signs(a: Uint8Array, signer: string, act: string): string | null {
  try {
    const d = describeAct(a) as Described;
    if (d.signer !== signer || d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.signature || !d.payload) return null;
    const named = (cborDecode(d.payload) as Map<number, unknown>).get(0);
    return named instanceof Uint8Array && hex(named) === act ? d.id : null;
  } catch {
    return null;
  }
}

/**
 * The member changes proposed under the agreement in force, from public
 * acts: clones naming it as parent, by any of its parties; for each, who
 * must sign (every voice its mark names, and each joining member) and the
 * signature acts found.
 */
async function changesOf(c: ReadCollective, via: Via): Promise<Change[]> {
  const parties = (readTerms(c.agreementPayload, AGREEMENTS_SPECS) as { parties: string[] }).parties;
  const out: Change[] = [];
  const byMember = new Map<string, Uint8Array[]>();
  const actsOf = async (m: string) => {
    if (!byMember.has(m)) byMember.set(m, await actsBy(m, c.rd.places, via));
    return byMember.get(m)!;
  };
  for (const p of parties) {
    for (const a of await actsOf(p)) {
      let d: Described;
      try {
        d = describeAct(a) as Described;
      } catch {
        continue;
      }
      if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) continue;
      let t: { parties: string[]; parent?: string; mark?: { signers: string[] }[]; grammar?: { signing: { holder?: string }; chainKey: { threshold?: number } } };
      try {
        t = readTerms(d.payload, AGREEMENTS_SPECS) as typeof t;
      } catch {
        continue;
      }
      if (t.parent !== c.agreement) continue;
      const signers = [...new Set([...(t.mark ?? []).flatMap((e) => e.signers), ...t.parties])];
      const signatures: Record<string, string> = {};
      for (const s of signers) {
        for (const a2 of await actsOf(s)) {
          const id = signs(a2, s, d.id);
          if (id) signatures[s] = id;
        }
      }
      out.push({
        clone: d.id,
        payload: d.payload,
        proposer: d.signer!,
        members: t.parties,
        threshold: t.grammar?.chainKey.threshold ?? c.threshold,
        holder: t.grammar?.signing.holder ?? t.parties[0],
        signers,
        signatures,
        missing: signers.filter((s) => !signatures[s]),
      });
    }
  }
  return out;
}

/** What the answers in the founder's inbox carry for a change: each member's one-time key, and the thread to answer in. */
async function answersOf(founder: TestIdentity, secret: Uint8Array, clone: string, signatures: Record<string, string>, hints: string[], via: Via): Promise<Record<string, { oneTime?: Uint8Array; thread: string; previous: string }>> {
  let inbox: string[] = [];
  try {
    inbox = (await lookUp(founder.id, hints, via)).inbox(REPO_SPECS.agreements) ?? [];
  } catch {
    inbox = [];
  }
  const out: Record<string, { oneTime?: Uint8Array; thread: string; previous: string }> = {};
  for (const hint of inbox) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(hint, via).feed({ to: founder.id, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          let m: ReturnType<typeof readMessage> = null;
          try {
            m = readMessage((openSealed(it.item, founder.id, secret) as { described: Parameters<typeof readMessage>[0] }).described);
          } catch {
            continue;
          }
          if (!m || m.text.split('\n')[0] !== SIGNED) continue;
          const sig = /act ([0-9a-f]{64})/.exec(m.text)?.[1];
          if (!sig || signatures[m.from] !== sig) continue;
          const k = oneTimeKeyOf(m.text);
          out[m.from] = { ...(k ? { oneTime: k } : {}), thread: m.thread, previous: m.id };
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that inbox is away
    }
  }
  void clone;
  return out;
}

/** What a member's sealed share carries: the request's fingerprint, the share's number and value. */
function contributionBytes(fingerprint: string, p: Paper): Uint8Array {
  return cborEncode(new Map<number, unknown>([[0, unhex(fingerprint)], [1, p.x], [2, p.value]]));
}

export class CollectiveSitting {
  private c: ReadCollective | null = null;
  private change: Change | null = null;
  private plan: LinePlan | null = null;
  private room = false;
  private request: Request | null = null;
  private fingerprint = '';
  private oneTime: Uint8Array | null = null;
  private papers: (Paper & { from: string })[] = [];
  private founder: TestIdentity | null = null;
  private answers: Record<string, { oneTime?: Uint8Array; thread: string; previous: string }> = {};
  private stage: Sitting['stage'] = 'waiting';
  private lines: Line[] = [];
  private bytes: Uint8Array | null = null;
  private act: string | null = null;
  private signing: Uint8Array | null = null;
  private positions: number[] | undefined;
  /** New shares to show here once, by holder (the starter's own, and members without a one-time key). */
  private toShow = new Map<string, { share: Uint8Array; x: number; shown: boolean; fingerprint: string }>();
  private sharePositions = new Map<string, number[]>();

  constructor(readonly deps: CollectiveDeps) {}

  /** Whether nothing is left to do: the shares shown, the words typed back, or the request expired. */
  over(): boolean {
    return this.stage === 'expired' || (this.stage === 'done' && [...this.toShow.values()].every((s) => s.shown));
  }

  view(now: number): Sitting {
    if (this.stage === 'waiting' && this.request && now > this.request.expires) this.expire();
    const id = this.c?.rd.id ?? '';
    return {
      kind: 'collective',
      id,
      act: this.act,
      stage: this.stage,
      title: this.stage === 'waiting' ? `A rotation of ${short(id)} waits for its members’ shares` : this.stage === 'expired' ? 'The rotation request expired' : `The rotation of ${short(id)}`,
      lines: this.lines,
      ...(this.request || this.room
        ? {
            request: {
              fingerprint: grouped(this.fingerprint.slice(0, 32)),
              full: this.fingerprint,
              have: this.papers.length,
              need: this.c?.threshold ?? 0,
              expires: this.request?.expires ?? 0,
              room: this.room,
              from: this.papers.map((p) => p.from),
            },
          }
        : {}),
      ...(this.toShow.size ? { shares: [...this.toShow.entries()].map(([holder, s]) => ({ holder, x: s.x, shown: s.shown })) } : {}),
      ...(this.positions ? { positions: this.positions } : {}),
    };
  }

  private expire() {
    wipe(this.oneTime, ...this.papers.map((p) => p.value));
    this.oneTime = null;
    this.papers = [];
    this.stage = 'expired';
    this.lines = [{ text: 'The hour passed before enough shares were in. The one-time key is destroyed: shares sealed to it can never be opened, by anyone. Nothing was signed. Start again when the members are ready.', tone: 'warn' }];
    if (this.founder) this.founder.f.signingSecret = '';
  }

  wipe(): void {
    wipe(this.oneTime, this.signing, ...this.papers.map((p) => p.value), ...[...this.toShow.values()].map((s) => s.share));
    this.oneTime = null;
    this.signing = null;
    this.papers = [];
    this.toShow.clear();
    if (this.founder) this.founder.f.signingSecret = '';
    this.founder = null;
  }

  // ---------------------------------------------------------------- the starter

  /** The starter's review: the change, its signatures, the lines kept, and F337's plain words, before anything is done. */
  async start(a: { collective: string; address: string; founder?: string; founderWords?: string; number: string; shareWords: string; room?: boolean; leaveOut?: string[]; via?: Via }): Promise<Omit<Review, 'plan'>> {
    const via = a.via ?? {};
    const id = readId(a.collective);
    this.room = !!a.room;
    const own = paperOf(a.number, a.shareWords);
    let founderSeed: Uint8Array | null = null;
    try {
      const c = await readCollective(id, addresses(a.address), via);
      this.c = c;
      const r = c.rd.look.resolution;
      const blocking: string[] = [];
      if (r.stop === 'contested') blocking.push('Its homes hold two rotations at one position (contested): no rotation can count until that ends.');
      if (c.rd.next.some((s) => !r.links.some((l) => l.act === s.id))) blocking.push('A rotation of this collective already waits for its homes: send that one again; Kišib never signs a second with the same key.');
      const changes = (await changesOf(c, via)).sort((x, y) => x.missing.length - y.missing.length);
      if (!changes.length) throw new Error('No member change is proposed under the agreement in force: propose one in Edubba (the collective’s page, “Change its members”), have every member sign it, then come back.');
      const ch = changes[0];
      this.change = ch;
      if (ch.missing.length) blocking.push(`The member change ${short(ch.clone)} is not signed by everyone it needs yet: waiting for ${ch.missing.map(short).join(', ')}.`);
      if (changes.filter((x) => !x.missing.length).length > 1) blocking.push('Several member changes are fully signed under the same agreement: Kišib cannot tell which one the members mean. Say which in Edubba.');
      this.plan = planLines(c.rd.lines, { leaveOut: a.leaveOut });
      const names = (m: string) => (m === id ? 'the collective' : short(m));
      const shown: Line[] = [];
      if (!this.room) {
        if (!a.founder?.trim() || !a.founderWords?.trim()) throw new Refused('Remote, the member who proposed the change gives their signing key’s words: only they open the members’ answers, with the one-time keys for their new shares. In the same room, tick “Everyone is here”.');
        const founder = readId(a.founder);
        if (founder !== ch.proposer) throw new Error(`The change was proposed by ${short(ch.proposer)}: that member starts the rotation, since the members’ answers, with their one-time keys, are in their inbox.`);
        founderSeed = seedOf(a.founderWords);
        const look = await lookCurrent(founder, founderSeed, c.rd.places, via);
        const enc = carriedKey(look, founderSeed);
        if (!enc) throw new Error('These words do not carry the encryption key this identity uses now, so the members’ answers cannot be opened here. Rotate in the same room instead (every new share shown on this screen).');
        const chain = await servedChain(founder, look.resolution.homes, via);
        const f = holding(founder, look.resolution.links[look.resolution.links.length - 1].act, founderSeed, chain, look.resolution.homes);
        this.founder = f;
        const secret = unhex(enc.secret);
        this.answers = await answersOf(f, secret, ch.clone, ch.signatures, [...c.rd.places, ...look.resolution.homes.map((h) => h.hint)], via);
        wipe(secret);
        for (const m of ch.members) {
          if (m === founder) shown.push({ text: `${names(m)} (you, the starter): your new share is shown on this screen, once.` });
          else shown.push(this.answers[m]?.oneTime ? { text: `${names(m)}: sealed to the one-time key its Dub made when it signed, as at the founding.`, tone: 'ok' } : { text: `${names(m)}: no one-time key found in its answer: its new share is shown on this screen, once, to hand over in person.`, tone: 'warn' });
        }
        const others = c.holders.filter((h) => h !== founder);
        for (const h of others) if (!this.answers[h]) blocking.push(`No answer from ${short(h)} was found in your inbox: Kišib cannot tell it the rotation waits. Have it sign the change in Dub first.`);
      } else {
        for (const m of ch.members) shown.push({ text: `${names(m)}: its new share is shown on this screen, once, to write down here.` });
      }
      this.papers = [{ ...own, from: this.room ? 'typed here' : (this.founder?.id ?? '') }];
      this.oneTime = this.room ? null : newEncryptionSecret();
      const relays = [...new Set(c.rd.places)];
      this.request = this.room
        ? null
        : {
            collective: id,
            previous: c.latest.act,
            position: c.latest.position + 1,
            kept: this.plan.kept.map((k) => [k.act, k.position, k.summary]),
            clone: ch.clone,
            signatures: ch.signers.map((s) => ch.signatures[s]).filter(Boolean),
            members: ch.members,
            threshold: ch.threshold,
            needed: c.threshold,
            oneTime: xwingPublic(this.oneTime!),
            expires: this.deps.now() + EXPIRY,
            relays,
            starter: this.founder!.id,
          };
      this.fingerprint = this.request ? sha256(encodeRequest(this.request)) : sha256(cborEncode(['room', id, c.latest.act, ch.clone]));
      const sections: Section[] = [
        { heading: 'Before you start: what this device will hold (F337)', lines: DEALER_SAY },
        ...recordWords(c.rd).filter((s) => !s.heading.startsWith('Its lines')),
        { heading: 'The member change it completes', lines: [{ text: `Clone ${ch.clone}, proposed by ${short(ch.proposer)}.` }, ...readChanges(c.agreementPayload, ch.payload, names), { text: `Signed by ${Object.keys(ch.signatures).length} of the ${ch.signers.length} it needs: ${ch.signers.map((s) => `${short(s)} ${ch.signatures[s] ? '✓' : '(not yet)'}`).join(', ')}.`, tone: ch.missing.length ? 'warn' : 'ok' }] },
        { heading: 'The papers', lines: [{ text: `Exactly ${c.threshold} of the ${c.holders.length} members’ paper shares rebuild the chain key (its agreement’s rule); no more are collected.` }, { text: `Yours: share ${own.x}.` }, this.room ? { text: 'In the same room: the others type theirs into this Kišib, one after another. Nothing is sent.' } : { text: `Remote: each other member gives theirs in their own Kišib, sealed to a one-time key made here, within an hour (until ${when(this.request!.expires)} by this device’s clock; MOR has no clock).` }] },
        { heading: 'Its lines of acts: what the rotation keeps (Identity rule 35)', lines: this.plan.shown.map((x) => ({ text: x.text.replace(/^A line made elsewhere( that this device cannot read)?/, (_m: string, u?: string) => (u ? 'A line Kišib cannot read' : 'A line of acts')), tone: x.tone })) },
        { heading: 'The new shares', lines: [{ text: `A new chain key, created here at the moment of signing, dealt to ${ch.members.length} members, any ${ch.threshold} rebuilding it.` }, ...shown] },
      ];
      const signs = [
        `Kišib signs one rotation of the collective ${short(id)}, with its chain key rebuilt here from exactly ${c.threshold} paper shares, then overwritten.`,
        `The rotation declares the member change (clone ${short(ch.clone)}) with its ${ch.signers.length} signatures, keeps the collective’s lines, installs a new signing key (its words shown once, for ${short(ch.holder)}, who holds it) and commits a new chain key.`,
        this.room ? 'Nothing is signed with anyone’s signing key.' : `As ${short(this.founder!.id)}: one message in each member’s thread announcing the rotation, and, after it, each new share sealed to its member’s one-time key, as at the founding. These acts start a new line of your acts; your next change of keys keeps it if it names it.`,
      ];
      const s0 = founderSeed;
      founderSeed = null;
      wipe(s0);
      return {
        digest: sha256(cborEncode(['MOR Kišib collective rotation, version 1', this.fingerprint, this.room])),
        title: `Rotate the collective ${short(id)}`,
        summary: [`Collective ${id}. Fingerprint of this rotation: ${grouped(this.fingerprint.slice(0, 32))}.`, FORGOTTEN_SAY],
        sections,
        signs,
        warning: this.plan.warning,
        blocking,
      };
    } catch (e) {
      wipe(founderSeed, own.value, this.oneTime);
      throw e;
    }
  }

  /** On confirmation: the request left at the collective's relays, and a message in each member's thread (remote); or the papers awaited here (same room). */
  async announce(): Promise<void> {
    const c = this.c!;
    if (this.room) {
      this.lines = [{ text: `Share ${this.papers[0].x} is in. ${c.threshold - 1} more to type here, one after another.` }];
      return;
    }
    const q = this.request!;
    const blob = encodeRequest(q);
    const left: string[] = [];
    for (const hint of q.relays) {
      try {
        await relayAt(hint, {}).putMedia(blob);
        left.push(hint);
      } catch {
        // that relay is away: the others hold it
      }
    }
    if (!left.length) throw new Error(`No relay took the rotation request (${q.relays.join(', ')}). Nothing was signed.`);
    const f = this.founder!;
    const lines: Line[] = [{ text: `The request is at ${left.join(', ')}. Fingerprint: ${this.fingerprint}.`, tone: 'ok' }];
    for (const m of c.holders) {
      if (m === f.id) continue;
      const a = this.answers[m];
      if (!a) continue;
      try {
        const look = await lookUp(m, c.rd.places, {});
        const inbox = look.inbox(REPO_SPECS.agreements) ?? [];
        if (!look.encryptionKey || !inbox.length) throw new Error('it declares no inbox or encryption key');
        await negotiate(f, { id: m, key: look.encryptionKey, inbox }, {
          thread: a.thread,
          previous: a.previous,
          acks: [a.previous],
          text: [
            `A rotation of the collective ${c.rd.id} waits for your paper share, in Kišib.`,
            `Fingerprint: ${this.fingerprint}`,
            `Open Kišib, choose “Give my share to a collective’s rotation”, and give the collective and this fingerprint. Kišib shows the rotation in plain words before you type anything.`,
            `It expires at ${when(q.expires)}.`,
          ].join('\n'),
          // Kišib makes no line an app continues: its acts stay off the starter's homes (README, cost of point 7).
          home: false,
        });
        lines.push({ text: `${short(m)}: told, in its thread.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `${short(m)}: could not be told (${message(e)}). Give it the fingerprint another way.`, tone: 'warn' });
      }
    }
    this.lines = lines;
  }

  /** In the same room: one more paper. Exactly the threshold, no more. */
  async paper(a: { number: string; words: string }): Promise<void> {
    if (this.stage !== 'waiting') throw new Error('No rotation waits for papers here.');
    if (!this.room) throw new Error('Remote, each member gives their share in their own Kišib.');
    const p = paperOf(a.number, a.words);
    if (this.papers.some((x) => x.x === p.x)) {
      wipe(p.value);
      throw new Error(`Share ${p.x} is already typed in.`);
    }
    if (this.papers.length >= this.c!.threshold) {
      wipe(p.value);
      throw new Error('Enough shares are in: no more are taken.');
    }
    this.papers.push({ ...p, from: 'typed here' });
    this.lines = [{ text: `${this.papers.length} of ${this.c!.threshold} shares are in.`, tone: this.papers.length >= this.c!.threshold ? 'ok' : undefined }];
  }

  /** Look for members' shares sealed to the one-time key, until exactly the threshold is in. */
  async gather(): Promise<void> {
    if (this.stage !== 'waiting' || this.room) return;
    const q = this.request!;
    if (this.deps.now() > q.expires) {
      this.expire();
      return;
    }
    const c = this.c!;
    const tag = pickupTag(q.oneTime);
    const said: Line[] = [];
    for (const hint of q.relays) {
      let items: { kind: string; item: Uint8Array }[] = [];
      try {
        items = (await relayAt(hint, {}).feed({ pickup: tag })).items;
      } catch {
        continue;
      }
      for (const it of items) {
        if (this.papers.length >= c.threshold) break;
        if (it.kind !== 'sealed') continue;
        let o: { described: Described };
        try {
          o = openSealed(it.item, undefined, this.oneTime!) as { described: Described };
        } catch {
          continue;
        }
        const d = o.described;
        if (d.spec !== SPECS.envelopes || d.type !== 0 || !d.payload || !d.signer) continue;
        const m = cborDecode(d.payload) as Map<number, unknown>;
        if (hex(m.get(0) as Uint8Array) !== CONTRIBUTION_MEDIA) continue;
        let locked: Uint8Array | null = null;
        for (const h of q.relays) {
          locked = await relayAt(h, {}).getMedia(hex(m.get(2) as Uint8Array)).catch(() => null);
          if (locked) break;
        }
        if (!locked) continue;
        const inner = openMedia(locked, m.get(5) as Uint8Array, m.get(4) as Uint8Array) as Uint8Array;
        if (workHash(inner) !== hex(m.get(1) as Uint8Array)) continue;
        const g = cborDecode(inner) as Map<number, unknown>;
        if (hex(g.get(0) as Uint8Array) !== this.fingerprint) continue;
        const x = Number(g.get(1));
        const value = g.get(2) as Uint8Array;
        if (this.papers.some((p) => p.x === x)) continue;
        if (!c.holders.includes(d.signer)) {
          said.push({ text: `A share from ${short(d.signer)}, who holds no share of this collective: not taken.`, tone: 'warn' });
          continue;
        }
        if (this.papers.some((p) => p.from === d.signer)) continue;
        this.papers.push({ x, value, from: d.signer });
        said.push({ text: `Share ${x} from ${short(d.signer)}${c.holders[x - 1] !== d.signer ? ` (numbered for ${short(c.holders[x - 1] ?? '?')}: taken; the rebuild check decides)` : ''}.`, tone: 'ok' });
      }
    }
    this.lines = [...this.lines.filter((l) => !/ shares are in\.$/.test(l.text)), ...said, { text: `${this.papers.length} of ${c.threshold} shares are in.`, tone: this.papers.length >= c.threshold ? 'ok' : undefined }];
  }

  /** Rebuild, rotate and deal, in one sitting (F337). */
  async rotate(): Promise<void> {
    const c = this.c!;
    const ch = this.change!;
    if (this.stage === 'waiting' && this.request && this.deps.now() > this.request.expires) this.expire();
    if (this.stage !== 'waiting') throw new Error('No rotation waits here.');
    if (this.papers.length !== c.threshold) throw new Error(`${this.papers.length} of ${c.threshold} shares are in: exactly ${c.threshold} are needed.`);
    checkWarned(this.plan!, this.plan!.warning ?? undefined);
    let rebuilt: { scheme: number; seeds: Uint8Array; commit: string };
    try {
      rebuilt = rebuildChainKeyFromPaper({ seedModule: 'words', scheme: c.scheme, index: c.index, commit: c.commit, papers: this.papers.map((p) => ({ x: p.x, value: p.value })) }) as typeof rebuilt;
    } catch {
      wipe(...this.papers.map((p) => p.value));
      this.papers = this.room ? [] : [];
      this.lines = [{ text: 'These papers do not rebuild the collective’s chain key: one is copied wrong, or belongs to another dealing. Which one cannot be told. Nothing was signed; the papers are forgotten. Type them again (in the same room) or start again.', tone: 'bad' }];
      if (!this.room) this.expire();
      return;
    }
    wipe(...this.papers.map((p) => p.value));
    const dealt = dealChainKey({ seedModule: 'words', scheme: c.scheme, index: c.index + 1, threshold: ch.threshold, holders: ch.members.map((m) => ({ role: 0, identity: m })) }) as { shares: Uint8Array[]; scheme: number; commit: string; fingerprint: string };
    for (const s of dealt.shares) if ((verifyShare(s) as { fingerprint: string }).fingerprint !== dealt.fingerprint) throw new Error('A new share does not lie on its dealing: nothing was signed.');
    const check = rebuildChainKey(dealt.shares.slice(0, ch.threshold)) as { commit: string };
    if (check.commit !== dealt.commit) throw new Error('The new shares do not rebuild the new key: nothing was signed.');
    const signing = newSigningSecret();
    let bytes: Uint8Array;
    try {
      bytes = makeRotation({
        identitySpec: SPECS.identity,
        identity: c.rd.id,
        previous: c.latest.act,
        position: c.latest.position + 1,
        chainKeyScheme: rebuilt.scheme,
        chainKeySeeds: rebuilt.seeds,
        newSigningPublic: signingPublic(signing),
        nextChainKeyScheme: dealt.scheme,
        nextChainKeyCommit: dealt.commit,
        kept: this.plan!.kept,
        declarations: [{ spec: REPO_SPECS.agreements, kind: FOUNDING_AGREEMENT, value: ch.clone, signatures: ch.signers.map((s) => ch.signatures[s]) }],
      });
    } finally {
      wipe(rebuilt.seeds);
    }
    this.papers = [];
    wipe(this.oneTime);
    this.oneTime = null;
    this.bytes = bytes;
    this.act = actId(bytes);
    this.signing = signing;
    const lines: Line[] = [{ text: `Signed: rotation ${this.act}. The chain key is overwritten; the papers are forgotten; the one-time key is destroyed.`, tone: 'ok' }];
    const chain = orderedChain(c.rd);
    for (const h of c.rd.look.resolution.homes) lines.push(await put(h.hint, bytes, chain));
    // The new shares: sealed to one-time keys as at the founding, or kept to be shown here once.
    const relays = [...new Set([...c.rd.places, ...(this.founder ? this.founder.f.homes.map((h) => h.hint) : [])])];
    dealt.shares.forEach((s, i) => void i);
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      const share = dealt.shares[i];
      const k = this.answers[m]?.oneTime;
      if (!this.room && this.founder && m !== this.founder.id && k) {
        try {
          const r = await sealShare(this.founder, share, k, relays);
          lines.push({ text: `${short(m)}: its new share is sealed to its one-time key, at ${r.left.join(', ')}. Its Dub shows it once.`, tone: 'ok' });
          wipe(share);
          continue;
        } catch (e) {
          lines.push({ text: `${short(m)}: its share could not be left (${message(e)}): shown here instead.`, tone: 'warn' });
        }
      }
      this.toShow.set(m, { share, x: i + 1, shown: false, fingerprint: dealt.fingerprint });
    }
    if (this.founder) this.founder.f.signingSecret = '';
    this.founder = null;
    lines.push({ text: `The new dealing’s fingerprint, for every member to compare: ${grouped(dealt.fingerprint.slice(0, 32))}.` });
    lines.push({ text: 'Keep Kišib open until the new shares and the collective’s new words are shown. Closed now, what is not yet shown is lost (the shares sealed to members’ Dubs are safe): the collective must then be rotated again, from enough of the new papers that reached their members.', tone: 'warn' });
    this.lines = lines;
    this.stage = 'sent';
    await this.refresh();
  }

  async resend(): Promise<void> {
    if (!this.bytes || this.stage !== 'sent') throw new Error('Nothing is waiting to be sent again.');
    const c = this.c!;
    const chain = orderedChain(c.rd);
    const lines: Line[] = [];
    for (const h of c.rd.look.resolution.homes) lines.push(await put(h.hint, this.bytes, chain));
    this.lines = [...this.lines.filter((l) => !/^It (counts|does not count)/.test(l.text) && !c.rd.look.resolution.homes.some((h) => l.text.startsWith(`${h.hint}:`))), ...lines];
    await this.refresh();
  }

  async refresh(): Promise<void> {
    if (!this.act || this.stage !== 'sent') return;
    const c = this.c!;
    let counts = false;
    try {
      const l = await lookUp(c.rd.id, c.rd.places, {});
      counts = l.resolution.links.some((x) => x.act === this.act);
    } catch {
      counts = false;
    }
    this.lines = [...this.lines.filter((l) => !/^It (counts|does not count)/.test(l.text)), counts ? { text: 'It counts: the homes’ receipts are in. The member change is in force.', tone: 'ok' } : { text: 'It does not count yet: send it again (the same bytes).', tone: 'warn' }];
    if (counts) this.stage = 'counts';
  }

  showWords(): { words: string[]; say: string[]; holder?: string } {
    if (!this.signing) throw new Error('No new signing key is held here.');
    if (this.stage === 'sent' || this.stage === 'waiting') throw new Error('Not yet: the collective’s new words are shown once the homes’ receipts are in.');
    this.stage = 'counts';
    this.positions = undefined;
    return { words: toWords(this.signing), holder: this.change!.holder, say: [`These are the collective’s new signing key’s words, for ${short(this.change!.holder)}, who holds that key under the agreement: carry them to Edubba (the collective’s page, “take the new words”).`, ...NEW_WORDS_SAY.slice(1)] };
  }

  written(): void {
    if (!this.signing || this.stage !== 'counts') throw new Error('No words are shown.');
    this.positions = threePositions((n) => crypto.getRandomValues(new Uint8Array(1))[0] % n);
    this.stage = 'shown';
  }

  typed(t: string[]): void {
    if (!this.signing || this.stage !== 'shown' || !this.positions) throw new Error('No words are asked back.');
    if (!typedBack(toWords(this.signing), this.positions, t)) throw new Error('Not the words asked for. Check the paper: they are shown again with “Show them again”.');
    wipe(this.signing);
    this.signing = null;
    this.bytes = null;
    this.positions = undefined;
    this.stage = 'done';
    this.lines = [...this.lines, { text: 'The collective’s new signing key is forgotten here.', tone: 'ok' }];
  }

  shareShow(holder: string): { x: number; words: string[]; fingerprint: string; say: string[] } {
    const s = this.toShow.get(holder);
    if (!s || s.shown) throw new Error('No share for this member waits to be shown here.');
    const p = shareOnPaper(s.share) as { x: number; value: Uint8Array };
    return {
      x: p.x,
      words: toWords(p.value),
      fingerprint: grouped(s.fingerprint.slice(0, 32)),
      say: [`The new share ${p.x} of the collective’s chain key, for ${short(holder)}. Write its number and its 24 words on new paper, labelled with the collective, and destroy the old paper.`, 'It is shown once: when you say it is written, it is forgotten here.'],
    };
  }

  shareWritten(holder: string): void {
    const s = this.toShow.get(holder);
    if (!s || s.shown) throw new Error('No share for this member waits here.');
    wipe(s.share);
    s.shown = true;
  }

  // ---------------------------------------------------------------- a member

  /** A member reads a waiting rotation in plain words, by the collective and the fingerprint. */
  static async readRequest(a: { collective: string; fingerprint: string; address: string; via?: Via }, now: number): Promise<{ q: Request; c: ReadCollective; sections: Section[]; change: Change | null }> {
    const via = a.via ?? {};
    const id = readId(a.collective);
    const fp = readFingerprint(a.fingerprint);
    const c = await readCollective(id, addresses(a.address), via);
    let blob: Uint8Array | null = null;
    for (const h of c.rd.places) {
      blob = await relayAt(h, via).getMedia(fp).catch(() => null);
      if (blob) break;
    }
    if (!blob) throw new Error(`No rotation request with this fingerprint was found at ${c.rd.places.join(', ')}. Check the fingerprint, or ask the starter.`);
    const q = decodeRequest(blob);
    if (q.collective !== id) throw new Error('This request is for another collective.');
    if (now > q.expires) throw new Error(`This request expired at ${when(q.expires)}: its one-time key is destroyed. Ask the starter to begin again.`);
    if (q.previous !== c.latest.act) throw new Error('The collective’s keys changed since this request was made: it is stale, and its rotation could never count.');
    const change = (await changesOf(c, via)).find((x) => x.clone === q.clone) ?? null;
    const names = (m: string) => (m === id ? 'the collective' : short(m));
    const sections: Section[] = [
      { heading: 'The rotation you are asked to give your share to', lines: [{ text: `Collective ${id}, its keys changed at position ${q.position}, started by ${short(q.starter)}.` }, { text: `Fingerprint: ${fp}. Compare it with the starter’s message, character by character.`, tone: 'warn' }, { text: `It expires at ${when(q.expires)} (this device’s clock).` }] },
      { heading: 'The member change it completes', lines: change ? [{ text: `Clone ${q.clone}.` }, ...readChanges(c.agreementPayload, change.payload, names), { text: `It declares ${q.signatures.length} signatures.` }] : [{ text: `Clone ${q.clone}, not found here: Kišib cannot read it back to you. Do not give your share unless you know it.`, tone: 'bad' }] },
      { heading: 'What it keeps and creates', lines: [{ text: `It keeps ${q.kept.length} line${q.kept.length === 1 ? '' : 's'} of the collective’s acts.` }, { text: `A new chain key, created on the starter’s device and dealt to ${q.members.length} members (${q.members.map(short).join(', ')}), any ${q.threshold} rebuilding it; ${q.needed} of the current papers rebuild the old one.` }] },
      { heading: 'What the starter’s device will hold (F337)', lines: DEALER_SAY.slice(0, 2) },
    ];
    return { q, c, sections, change };
  }

  /** Given everything: the member's review, and what runs once confirmed (the share sealed to the one-time key, signed by the member). */
  static async give(deps: CollectiveDeps, a: { collective: string; fingerprint: string; address: string; member: string; memberWords: string; number: string; shareWords: string; via?: Via }, done: (r: { title: string; lines: Line[] }) => void): Promise<{ review: Omit<Review, 'plan'>; run: () => Promise<void>; wipe: () => void }> {
    const via = a.via ?? {};
    const paper = paperOf(a.number, a.shareWords);
    let seed: Uint8Array | null = null;
    try {
      const { q, c, sections } = await CollectiveSitting.readRequest(a, deps.now());
      const member = readId(a.member);
      if (!c.holders.includes(member)) throw new Error(`${short(member)} holds no share of this collective’s chain key now.`);
      if (c.holders[paper.x - 1] && c.holders[paper.x - 1] !== member) sections.push({ heading: 'Your paper', lines: [{ text: `Share ${paper.x} was dealt to ${short(c.holders[paper.x - 1])}, not to you: check the paper. If it is yours, give it; the rebuild decides.`, tone: 'warn' }] });
      seed = seedOf(a.memberWords);
      const look = await lookCurrent(member, seed, [...new Set([...addresses(a.address), ...c.rd.places])], via);
      const fp = sha256(encodeRequest(q));
      const s0 = seed;
      seed = null;
      return {
        review: {
          digest: sha256(cborEncode(['MOR Kišib share given, version 1', fp, member, paper.x])),
          title: `Give share ${paper.x} to the rotation of ${short(c.rd.id)}`,
          summary: [FORGOTTEN_SAY],
          sections,
          signs: [`You sign, as ${short(member)}, one private act carrying your share ${paper.x} and this rotation’s fingerprint, sealed to the starter’s one-time key: only the starter’s Kišib can open it, and only within the hour.`, 'It starts a new line of your acts; nobody else can read it, and it voids nothing if your next change of keys leaves it out.'],
          warning: null,
          blocking: [],
        },
        wipe: () => wipe(s0, paper.value),
        run: async () => {
          if (deps.now() > q.expires) throw new Error('The request expired: nothing was sent.');
          const r = look.resolution;
          const chain = await servedChain(member, r.homes, via);
          const me = holding(member, r.links[r.links.length - 1].act, s0, chain, r.homes);
          const inner = contributionBytes(fp, paper);
          wipe(paper.value, s0);
          const l = lockMedia(inner) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
          wipe(inner);
          const payload = cborEncode(new Map<number, unknown>([[0, unhex(CONTRIBUTION_MEDIA)], [1, unhex(l.workHash)], [2, unhex(l.lockedHash)], [3, inner.length], [4, l.nonce], [5, l.key], [6, q.relays]]));
          const made = me.sign(SPECS.envelopes, 0, payload, { public: false });
          me.f.signingSecret = '';
          const sealed = sealFor(made.act, made.key, [{ key: q.oneTime }]);
          const tag = pickupTag(q.oneTime);
          const left: string[] = [];
          for (const hint of q.relays) {
            try {
              const rr = relayAt(hint, via);
              await rr.putMedia(l.locked);
              await rr.putSealed(sealed, [tag]);
              left.push(hint);
            } catch {
              // that relay is away
            }
          }
          if (!left.length) throw new Error(`No relay took your share (${q.relays.join(', ')}).`);
          done({
            title: `Share ${paper.x} is given`,
            lines: [
              { text: `Sealed to the starter’s one-time key and left at ${left.join(', ')}. Only the starter’s Kišib can open it, until ${when(q.expires)}.`, tone: 'ok' },
              { text: 'Your paper share and your signing words are forgotten here. Keep your paper until the rotation counts: then your new share arrives in Dub (or is handed to you), and the old paper opens nothing.' },
            ],
          });
        },
      };
    } catch (e) {
      wipe(seed, paper.value);
      throw e;
    }
  }
}

/** The counted chain acts of a read identity, oldest first. */
function orderedChain(rd: Read): Uint8Array[] {
  return rd.look.resolution.links.map((l) => rd.chainActs.get(l.act)!).filter(Boolean);
}

export { TestIdentity };
