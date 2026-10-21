// Kišib (𒈩, Sumerian kišib, "the cylinder seal"; F335): the one place where a chain key is
// used, from paper, and then forgotten. The same code runs in the program on
// the Mac and in the web client (testing only).
//
// It holds nothing between uses. Words typed are turned into keys for the
// act at hand and overwritten once it is signed; a review not confirmed
// within fifteen minutes is dropped with its words. What a sitting keeps
// while it lasts, in memory only, is said in its README: the signed bytes,
// to send again (never the chain key), and the new signing key until its
// words are shown and three of them typed back. Nothing is written to a
// folder or to the browser's storage, ever.
//
// What it does (F335): rotate an identity from its chain key's paper words,
// keeping every line (Identity rule 35), waiting for the homes' receipts and
// sending the same bytes again, never a second rotation (rule 29), then
// the new chain key's words first (a fresh paper at every change of keys,
// H79), written down and three typed back before the rotation is signed
// (Nobody, allegedly, 21 October 2026: "confirming the new chain key comes
// before signing the rotation, confirming the new signing key can come
// after"), then the new signing key's words once the receipts are in; rotate a collective from its
// members' paper shares (F337, `collective.ts`); escape a contested
// position with both keys (F299, section 11); declare a succession, which
// the successor confirms (F300). What it may do: check paper words without
// signing anything; show an identity's record.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { MIRS, SPECS, IDENTITY_TYPES, actId, cborDecode, cborEncode, describeAct, hex, lightningAddress, makeRotation, newSigningSecret, onchainAddress, randomBytes, readLightningAddress, readOnchainAddress, sha256, signingPublic, unhex, vaultDeclaration } from '../../genesis/src/core.ts';
import { SPEC as MONEY_SPECS } from '../../damgar/src/specs.ts';
import { UNITS_MODULES, say as sayAmount, unitOf } from '../../damgar/src/units.ts';
import type { Home } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { CODE, RelayError, relayAt, type Via } from '../../genesis/src/transport.ts';
import { checkWarned, planLines, readCards, type LinePlan } from '../../genesis/src/lines.ts';
import { threePositions, toWords, typedBack } from '../../../modules/carry/src/carry.ts';
import { readId } from '../../genesis/src/forms.ts';
import { lookCurrent, servedChain } from '../../dub/src/carryin.ts';
import { bindingOf, homesWords, linesUnder, placing, readIdentity, recordWords, served, type Read, type Served } from './read.ts';
import { chainKeyAt, freshSeed, indexOf, seedOf, spentPaper, wipe, Refused } from './words.ts';
import { fingerprint, grouped, type Line, type Review, type Section, type Sitting, type State } from './shapes.ts';
import { CollectiveSitting, EXPIRY, type CollectiveDeps } from './collective.ts';
import { addresses, holding, put, FORGOTTEN_SAY, NEW_CHAIN_WORDS_SAY, NEW_WORDS_SAY } from './common.ts';

export { addresses, holding, put, FORGOTTEN_SAY, NEW_CHAIN_WORDS_SAY, NEW_WORDS_SAY };

/** Said where words given are an earlier paper of the identity, spent by a later change of its keys (H79). */
export const SPENT_PAPER_SAY = (position: number) =>
  `These are an earlier chain-key paper of this identity: the change of its keys at position ${position + 1} used it and committed a key of a new paper, so it changes these keys no more. Use the newest paper, the chain key’s words Kišib showed at the last change. Nothing was signed, and the words are forgotten.`;

/** Said wherever a new paper is made (H79, Nobody, allegedly, 21 October 2026): when it starts to count, and what the old paper still does until then. */
export const PAPER_COUNTS_SAY =
  'This new paper becomes the one that counts once the homes accept the change; until then the old paper still works, but only to send this same change again. If Kišib is closed before the change is sent, nothing was signed: the next change starts over with another new paper, and the unused one is worthless.';

/** The sitting's lines while the new paper waits to be written, before anything is signed. */
const PAPER_LINES: Line[] = [
  { text: 'Nothing is signed yet. First, the new chain key’s words: write them down, then type three back. Only then does Kišib sign this change and send it.', tone: 'warn' },
  { text: PAPER_COUNTS_SAY },
];

/** Said in the review where the paper given already made an earlier change (Kišib reused one paper until 21 October 2026, H79): this change is its last. */
export const LAST_OF_OLD_PAPER_SAY =
  'This paper already made an earlier change of these keys: until 21 October 2026 Kišib reused one paper for every change. This change is its last. It commits a key of a new paper, whose words are shown once the homes’ receipts are in; this paper is spent after it.';

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const b64 = (b: Uint8Array) => {
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
};

/** How long a review waits for its confirmation, its words with it. */
const PLAN_LIFE = 15 * 60 * 1000;

/** What a review needs to run once confirmed. */
interface Plan {
  digest: string;
  expires: number;
  run(warned?: string): Promise<Sitting>;
  /** Overwrite what it holds: called once it ran, or expired, or was dropped. */
  wipe(): void;
}

/** What an identity's sitting holds, in memory only. */
interface Held {
  kind: Sitting['kind'];
  id: string;
  /** The act signed, exact bytes: sent again unchanged, never signed again (Identity rule 29). */
  bytes: Uint8Array | null;
  act: string | null;
  /** Where it goes, and the chain acts before it, oldest first, for a home that lacks them. */
  homes: Home[];
  before: Uint8Array[];
  /** Acts sent with it (an escape's endorsement), to every place. */
  with: { bytes: Uint8Array; to: string[] }[];
  /** Where it is read again to see whether it counts. */
  places: string[];
  /** The new signing key, until its words are shown and three typed back. */
  signing: Uint8Array | null;
  /** The new chain key's seed, a new paper (H79), until its words are shown and three typed back: before anything is signed. */
  chain: Uint8Array | null;
  /** Signs what the review showed, once the new paper is confirmed (the old paper's key held until then, in memory only); null once signed. */
  sign?: (() => Promise<void>) | null;
  /** Overwrites what `sign` holds, where the sitting ends before signing. */
  drop?: () => void;
  stage: Sitting['stage'];
  positions?: number[];
  title: string;
  lines: Line[];
  /** For a confirmation: the owner whose succession is confirmed. */
  owner?: string;
}

export interface Options {
  web?: boolean;
  /** This device's clock, in seconds (the one-time key's expiry, F337): MOR has none. */
  now?: () => number;
}

export class Kishib {
  private plans = new Map<string, Plan>();
  private held: Held | null = null;
  private col: CollectiveSitting | null = null;
  readonly web: boolean;
  readonly now: () => number;

  constructor(opts: Options = {}) {
    this.web = opts.web ?? false;
    this.now = opts.now ?? (() => Math.floor(Date.now() / 1000));
  }

  // ------------------------------------------------------------ state

  state(): State {
    this.expirePlans();
    const units = UNITS_MODULES.flatMap((m) => m.units.map((u) => ({ hash: u.hash, label: `${u.many} (${m.name})`, network: u.network ?? -1 })));
    units.sort((x, y) => Number(y.network === 3) - Number(x.network === 3));
    return { web: this.web, sitting: this.sitting(), expiry: EXPIRY, units };
  }

  private sitting(): Sitting | null {
    if (this.col) return this.col.view(this.now());
    const h = this.held;
    if (!h) return null;
    return { kind: h.kind, id: h.id, act: h.act, stage: h.stage, title: h.title, lines: h.lines, ...(h.positions ? { positions: h.positions } : {}), ...(h.chain || h.signing ? { words: h.chain ? ('chain' as const) : ('signing' as const) } : {}) };
  }

  /** Drop everything this sitting holds: words, keys, bytes. */
  forget(): State {
    for (const p of this.plans.values()) p.wipe();
    this.plans.clear();
    if (this.held) {
      wipe(this.held.signing, this.held.chain);
      this.held.drop?.();
    }
    this.held = null;
    this.col?.wipe();
    this.col = null;
    return this.state();
  }

  private busy(): void {
    if ((this.held && this.held.stage !== 'done') || (this.col && !this.col.over())) {
      throw new Error('Kišib is in the middle of another act: finish it, or forget it, first. One act at a time.');
    }
    this.held = null;
    this.col = null;
  }

  private expirePlans() {
    const t = Date.now();
    for (const [k, p] of this.plans) {
      if (p.expires < t) {
        p.wipe();
        this.plans.delete(k);
      }
    }
  }

  private plan(review: Omit<Review, 'plan'>, p: Omit<Plan, 'expires' | 'digest'>): Review {
    this.expirePlans();
    for (const old of this.plans.values()) old.wipe();
    this.plans.clear();
    const id = hex(randomBytes(16));
    this.plans.set(id, { ...p, digest: review.digest, expires: Date.now() + PLAN_LIFE });
    return { plan: id, ...review };
  }

  /** Sign what a review showed, exactly: refused if it changed, expired, or still has something blocking. */
  async confirm(a: { plan: string; digest: string; warned?: string }): Promise<State> {
    this.expirePlans();
    const p = this.plans.get(a.plan);
    if (!p) throw new Error('That review expired (fifteen minutes) or was replaced, and its words were forgotten. Nothing was signed: start again.');
    if (p.digest !== a.digest) throw new Error('What you confirm is not what was shown. Nothing was signed.');
    this.plans.delete(a.plan);
    try {
      await p.run(a.warned);
    } finally {
      p.wipe();
    }
    return this.state();
  }

  // ------------------------------------------------------------ may: check paper words, show a record

  /** Check the chain key's words without signing anything: which key of the identity they give, if any. */
  async checkWords(a: { id: string; address: string; words: string; via?: Via }): Promise<{ title: string; lines: Line[] }> {
    const id = readId(a.id);
    const seed = seedOf(a.words);
    try {
      const rd = await readIdentity(id, addresses(a.address), a.via ?? {}, SPECS.identity);
      const r = rd.look.resolution;
      const latest = r.links[r.links.length - 1];
      const idx = indexOf(seed, r.chainKeyScheme!, r.chainKeyCommit!, latest.position + 8);
      if (idx !== null) {
        return {
          title: 'These are the right words',
          lines: [
            { text: `They give the chain key this identity’s chain commits to now (key ${idx} of these words): the key the next change of its keys is signed with.`, tone: 'ok' },
            { text: 'That change makes a new paper and spends this one: keep this paper until then, and the new one after.' },
            { text: 'Nothing was signed, and the words are forgotten.' },
          ],
        };
      }
      const spent = spentPaper(seed, commits(rd), latest.position);
      if (spent !== null) {
        return {
          title: 'These words are spent',
          lines: [
            { text: SPENT_PAPER_SAY(spent).replace(/ Nothing was signed, and the words are forgotten\.$/, ''), tone: 'bad' },
            { text: 'Nothing was signed, and the words are forgotten.' },
          ],
        };
      }
      const earlier = rd.look.resolution.links.length;
      return {
        title: 'These are not the words this identity needs now',
        lines: [
          { text: `They do not give the chain key its chain commits to now (checked against keys 0 to ${latest.position + 8} of these words).`, tone: 'bad' },
          { text: `They may be another identity’s chain key words, its signing key’s words (which never change the keys), a new paper whose change was never sent (worthless: Kišib was closed before signing, and the next change makes another), or a word copied wrong that still passes the checksum. Its chain has ${earlier} act${earlier === 1 ? '' : 's'}.` },
          { text: 'Nothing was signed, and the words are forgotten.' },
        ],
      };
    } finally {
      wipe(seed);
    }
  }

  /** An identity's record in plain words: homes, receipts, lines, any contest. */
  async record(a: { id: string; address: string; via?: Via }): Promise<{ title: string; sections: Section[] }> {
    const id = readId(a.id);
    const rd = await readIdentity(id, addresses(a.address), a.via ?? {}, SPECS.identity);
    return { title: `The record of ${short(id)}`, sections: recordWords(rd) };
  }

  // ------------------------------------------------------------ must: rotate an identity

  /**
   * Review a rotation of an identity from its chain key's words: everything
   * read back in plain words before anything is signed. Optional: a
   * successor declared (F300), or the current succession ended; lines left
   * out by name; cards for lines another app made that cannot be read here.
   */
  async rotatePlan(a: { id: string; address: string; words: string; successor?: string; endSuccession?: boolean; leaveOut?: string[]; cards?: string; vault?: VaultChange; via?: Via }): Promise<Review> {
    this.busy();
    const via = a.via ?? {};
    const id = readId(a.id);
    let seed: Uint8Array | null = seedOf(a.words);
    try {
      const rd = await readIdentity(id, addresses(a.address), via, SPECS.identity);
      const r = rd.look.resolution;
      const latest = r.links[r.links.length - 1];
      const blocking: string[] = [];
      if (r.stop === 'contested') blocking.push('Its homes hold two rotations at one position (contested). A normal rotation cannot settle it: use “Escape a contested position”.');
      const waiting = rd.next.filter((s) => !r.links.some((l) => l.act === s.id));
      if (waiting.length > 1) {
        blocking.push(`${waiting.length} rotations with this chain key exist, waiting for their homes. Kišib never signs another (Identity rule 29). If you made only one, someone holds your chain key’s words: use “Escape a contested position”.`);
      }
      const idx = indexOf(seed, r.chainKeyScheme!, r.chainKeyCommit!, latest.position + 8);
      // An earlier paper, spent by a later change (H79): said plainly, before anything else.
      const earlier = spentPaper(seed, commits(rd), latest.position);
      if (idx === null && earlier !== null) throw new Refused(SPENT_PAPER_SAY(earlier));
      if (idx === null) {
        throw new Refused('These words do not give the chain key this identity’s chain commits to now: they may be another identity’s, its signing key’s words, or copied wrong. Nothing was signed, and the words are forgotten. (“Check paper words” says more.)');
      }
      // A change already signed with this paper's key waits for its homes (Kišib was closed before it counted): this paper now only sends that same change again (Identity rule 29).
      if (waiting.length === 1 && rd.chainActs.get(waiting[0].id)) return this.resendPlan(id, rd, waiting[0], idx, seed);
      let successor: string | null = null;
      if (a.successor?.trim()) {
        successor = readId(a.successor);
        if (successor === id) throw new Error('An identity cannot name itself as its successor.');
      }
      if (successor && a.endSuccession) throw new Error('Name a successor, or end the succession: not both.');
      const succNow = rd.look.verifier.succession(id) as { state: string; successor?: string };
      if (a.endSuccession && succNow.state === 'none') throw new Error('No succession is declared: there is none to end.');
      let plan: LinePlan;
      try {
        plan = planLines(rd.lines, { leaveOut: a.leaveOut, cards: a.cards?.trim() ? readCards(a.cards) : undefined, ...placing(rd, rd.binding) });
      } catch (e) {
        throw new Error(message(e));
      }
      const clock = declaresClock(rd);
      // The vault (Money rule 2: changed only with the chain key, so here; decided by Nobody, allegedly, 17 October 2026: "its setting belongs in Kišib").
      const vaultNow = rd.look.verifier.moneyVault(MIRS.money, id) as { entries: { unit: string; railModule: string; source: Uint8Array; limit: number }[] } | null;
      const vault = vaultPlan(a.vault, vaultNow?.entries ?? null);
      const sections: Section[] = [
        ...recordWords(rd).filter((s) => s.heading !== 'Its lines of acts (each app or device keeps one)'),
        { heading: 'Its lines of acts: what this rotation keeps (Identity rule 35)', lines: plan.shown.map((x) => ({ text: x.text.replace(/A line made elsewhere( that this device cannot read)?/, (_m: string, u?: string) => (u ? 'A line Kišib cannot read' : 'A line of acts')), tone: x.tone })) },
        {
          heading: 'What changes',
          lines: [
            { text: 'A new signing key, made now on this device. Its words are shown once, after the homes’ receipts are in. Dub, Edubba and every app holding the old signing key’s words stop signing until given the new ones.', tone: 'warn' },
            { text: `A new chain key, from a new paper made now on this device (key ${latest.position + 1} of its words). Its 24 words are shown first: you write them down and type three back, and only then does Kišib sign this change and send it. ${PAPER_COUNTS_SAY}`, tone: 'warn' },
            ...(earlier !== null ? [{ text: LAST_OF_OLD_PAPER_SAY, tone: 'warn' as const }] : []),
            { text: `${homesWords(r.homes, r.effective)} Unchanged.` },
            successor
              ? { text: `A succession declared: ${successor} is named as this identity’s successor. Nobody follows it until that identity confirms it, by an act of its own naming this rotation (F300; Kišib can make it, “Confirm a succession”). This identity goes on living.`, tone: 'warn' }
              : a.endSuccession
                ? { text: `The succession to ${succNow.successor ?? 'its successor'} is ended.`, tone: 'warn' }
                : { text: succNow.state === 'none' ? 'No succession.' : `The succession stays as it is (${succNow.state}).` },
            ...(clock ? [{ text: 'This identity declares a clock (Money rule 15): its client anchors each change of its keys on that clock. Kišib does not anchor: anchor it with the genesis client before relying on it.', tone: 'warn' as const }] : []),
          ],
        },
        { heading: 'The vault (Money: where payments above a limit must go)', lines: vault.lines },
      ];
      const signs = [
        `Kišib first shows the new paper’s words (a fresh seed, the air-gapped Module’s rule 3.3). Once three are typed back, it signs one rotation of ${short(id)} at position ${latest.position + 1}, with the chain key these words give (key ${idx}), revealed once, committing the new paper’s key.`,
        'It sends the exact same bytes to every home, and again, unchanged, if they stall: never a second rotation.',
        successor ? `Your rotation names ${short(successor)} as successor; the successor signs nothing here.` : 'It signs nothing else.',
      ];
      const digest = sha256(cborEncode(['MOR Kišib rotation, version 1', id, latest.act, plan.kept.map((k) => [k.act, k.position, k.summary]), successor ?? '', !!a.endSuccession, ...(vault.declaration ? [cborEncode([vault.declaration.kind, vault.declaration.cbor ?? null])] : [])]));
      const s0 = seed;
      seed = null;
      return this.plan(
        {
          digest,
          title: `Change the keys of ${short(id)}`,
          summary: [`Identity ${id}. Its chain was read from ${rd.places.join(', ')}, and judged by the core library.`, FORGOTTEN_SAY],
          sections,
          signs,
          warning: plan.warning,
          blocking,
        },
        {
          wipe: () => wipe(s0),
          run: async (warned) => {
            if (blocking.length) throw new Error(`Nothing was signed: ${blocking[0]}`);
            checkWarned(plan, warned);
            // H79: the next chain key comes from a new paper, never from the words just used (key n of the fresh seed, n this rotation's position);
            // its words are confirmed before anything is signed (Nobody, allegedly, 21 October 2026). The old paper's key waits in memory until then.
            const fresh = freshSeed();
            const next = chainKeyAt(fresh, r.chainKeyScheme!, latest.position + 1);
            const nextCommit = next.commit;
            wipe(next.seeds);
            const old = s0.slice();
            const signing = newSigningSecret();
            const h: Held = {
              kind: 'identity',
              id,
              bytes: null,
              act: null,
              homes: r.homes,
              before: chainBefore(rd),
              with: [],
              places: rd.places,
              signing,
              chain: fresh,
              stage: 'paper',
              title: `The rotation of ${short(id)}: first, the new paper`,
              lines: PAPER_LINES,
              drop: () => wipe(old),
              sign: async () => {
                const current = chainKeyAt(old, r.chainKeyScheme!, idx);
                try {
                  h.bytes = makeRotation({
                    identitySpec: SPECS.identity,
                    identity: id,
                    previous: latest.act,
                    position: latest.position + 1,
                    chainKeyScheme: r.chainKeyScheme!,
                    chainKeySeeds: current.seeds,
                    newSigningPublic: signingPublic(signing),
                    nextChainKeyScheme: r.chainKeyScheme!,
                    nextChainKeyCommit: nextCommit,
                    kept: plan.kept,
                    ...(successor ? { successor } : {}),
                    ...(a.endSuccession ? { endSuccession: true } : {}),
                    ...(vault.declaration ? { declarations: [vault.declaration] } : {}),
                  });
                } finally {
                  wipe(current.seeds, old);
                }
                h.act = actId(h.bytes);
                h.title = `The rotation of ${short(id)}`;
              },
            };
            this.held = h;
            return this.sitting()!;
          },
        },
      );
    } catch (e) {
      wipe(seed);
      throw e;
    }
  }

  /**
   * A change already signed with this paper's key waits for its homes (Kišib
   * was closed before it counted): the paper now only sends that same change
   * again, its exact bytes as the homes and relays serve them (Identity rule
   * 29). Nothing is signed; no new words are shown here (the new paper was
   * written before it was signed; its signing key, if lost, is replaced by
   * the next change, from that new paper).
   */
  private resendPlan(id: string, rd: Read, s: Served, idx: number, seed: Uint8Array): Review {
    wipe(seed);
    const bytes = rd.chainActs.get(s.id)!;
    const r = rd.look.resolution;
    const sections: Section[] = [
      ...recordWords(rd).filter((x) => !x.heading.startsWith('Its lines')),
      {
        heading: 'A change of keys already signed with this paper, waiting for its homes',
        lines: [
          { text: `Rotation ${s.id} at position ${s.position}, signed with the chain key these words give (key ${idx}), installing the signing key ${s.signingFingerprint}${s.homeless ? ' (homeless)' : ''}.`, tone: 'warn' },
          { text: 'This paper still works, but only to send this same change again: Kišib never signs a second change with the same key (Identity rule 29).' },
          { text: 'Once the homes accept it, the new paper written when it was signed is the one that counts, and this one is spent. If its signing key’s words were never shown, change the keys again from that new paper: it installs a key you hold.' },
          { text: 'If you did not make this change, someone holds your chain key’s words: do not send it; use “Escape a contested position”.', tone: 'bad' },
        ],
      },
    ];
    const digest = sha256(cborEncode(['MOR Kišib resend, version 1', id, s.id]));
    return this.plan(
      { digest, title: `Send the same change of ${short(id)}’s keys again`, summary: [`Identity ${id}. Its chain was read from ${rd.places.join(', ')}, and judged by the core library.`, FORGOTTEN_SAY], sections, signs: ['Kišib signs nothing: it sends the exact same bytes again, to every home.'], warning: null, blocking: [] },
      {
        wipe: () => undefined,
        run: async () => {
          this.held = { kind: 'identity', id, bytes, act: s.id, homes: r.homes, before: chainBefore(rd), with: [{ bytes, to: rd.places }], places: rd.places, signing: null, chain: null, stage: 'sent', title: `The rotation of ${short(id)}, sent again`, lines: [] };
          return this.send();
        },
      },
    );
  }

  /** Send the act held, the same bytes, to every home (a home lacking the acts before it gets them first), then see whether it counts. */
  private async send(): Promise<Sitting> {
    const h = this.held!;
    const lines: Line[] = [];
    for (const home of h.homes) {
      lines.push(await put(home.hint, h.bytes!, h.before));
    }
    for (const w of h.with) {
      for (const hint of w.to) {
        try {
          await relayAt(hint, {}).putAct(w.bytes);
        } catch {
          // that place is away: the others hold it
        }
      }
    }
    lines.push(
      h.signing
        ? { text: 'Keep Kišib open until the new signing key’s words are shown. Closed now, the new signing key is lost: the identity stays yours, and the next change, from the new paper you wrote, installs a key you hold.', tone: 'warn' }
        : { text: 'The signing key this change installs was shown, if at all, in the sitting that signed it: if it was lost, once this change counts, change the keys again from the new paper written then.', tone: 'warn' },
    );
    h.lines = lines;
    return this.refresh();
  }

  /** Send the exact same bytes again (Identity rule 29): never a second rotation. */
  async resend(): Promise<State> {
    if (this.col) {
      await this.col.resend();
      return this.state();
    }
    const h = this.held;
    if (!h || !h.bytes || h.stage !== 'sent') throw new Error('Nothing is waiting to be sent again.');
    await this.send();
    return this.state();
  }

  /** Look again: whether what was sent counts now. */
  async refresh(): Promise<Sitting> {
    if (this.col) {
      await this.col.refresh();
      return this.sitting()!;
    }
    const h = this.held;
    if (!h || !h.act) throw new Error('Nothing was sent.');
    if (h.kind === 'confirm') return this.sitting()!;
    const places = [...new Set([...h.homes.map((x) => x.hint), ...h.places])];
    let counts = false;
    let say: Line;
    try {
      // Read back as a reader of its homes and relays would, the new homes included.
      const l = (await readIdentity(h.id, places, {}, SPECS.identity)).look;
      counts = l.resolution.links.some((x) => x.act === h.act);
      say = counts
        ? { text: `It counts: the homes’ receipts are in (${l.resolution.links.find((x) => x.act === h.act)!.how}).`, tone: 'ok' }
        : { text: `It does not count yet: the receipts its home rule needs are not all in (${l.resolution.stop}). Send it again: the same bytes, never a new rotation.`, tone: 'warn' };
    } catch (e) {
      say = { text: `It could not be read back: ${message(e)}. Send it again: the same bytes.`, tone: 'warn' };
    }
    h.lines = [...h.lines.filter((x) => !/^It (counts|does not count|could not)/.test(x.text)), say];
    if (counts && h.stage === 'sent') {
      h.stage = h.signing ? 'counts' : 'done';
      if (!h.signing) h.lines = [...h.lines, { text: 'The new paper written when this change was signed is now the one that counts; the old paper is spent: destroy it.', tone: 'ok' }];
    }
    return this.sitting()!;
  }

  /**
   * The new words, once the rotation counts: the new chain key's first (a
   * new paper, H79), then, once three of them are typed back, the new
   * signing key's; each shown, then hidden before three are asked back.
   */
  showWords(): { words: string[]; say: string[]; holder?: string; which?: 'chain' | 'signing' } {
    if (this.col) return this.col.showWords();
    const h = this.held;
    if (!h || (!h.signing && !h.chain)) throw new Error('No new signing key is held here.');
    h.positions = undefined;
    // The new paper first, before anything is signed.
    if (h.chain) {
      h.stage = 'paper';
      return { words: toWords(h.chain), say: NEW_CHAIN_WORDS_SAY, which: 'chain' };
    }
    if (h.stage === 'sent') throw new Error('Not yet: the new signing key’s words are shown once the homes’ receipts are in, so they are never words of a key that does not count.');
    h.stage = 'counts';
    return { words: toWords(h.signing!), say: NEW_WORDS_SAY, which: 'signing' };
  }

  /** Hide the words; three positions to type back. */
  written(): State {
    if (this.col) {
      this.col.written();
      return this.state();
    }
    const h = this.held;
    if (!h || (!h.signing && !h.chain) || (h.stage !== 'counts' && h.stage !== 'paper')) throw new Error('No words are shown.');
    h.positions = threePositions((n) => randomBytes(1)[0] % n);
    h.stage = 'shown';
    return this.state();
  }

  /**
   * The three words typed back: right, and Kišib forgets them. For the new
   * paper, it then signs the change and sends it; for the new signing key,
   * the sitting is done.
   */
  async typed(a: { typed: string[] }): Promise<State> {
    if (this.col) {
      this.col.typed(a.typed);
      return this.state();
    }
    const h = this.held;
    if (!h || (!h.signing && !h.chain) || h.stage !== 'shown' || !h.positions) throw new Error('No words are asked back.');
    if (!typedBack(toWords(h.chain ?? h.signing!), h.positions, a.typed)) throw new Error('Not the words asked for. Check the paper: they are shown again with “Show them again”.');
    if (h.chain) {
      // The new paper is written: forgotten here; only now is the change signed and sent.
      wipe(h.chain);
      h.chain = null;
      h.positions = undefined;
      const sign = h.sign;
      h.sign = null;
      h.drop = undefined;
      await sign!();
      h.stage = 'sent';
      await this.send();
      h.lines = [{ text: 'The new chain key’s words are written and forgotten here; then the change was signed and sent. Once the homes accept it, the new paper is the one that counts and the old one is spent: destroy it then.', tone: 'ok' }, ...h.lines];
      return this.state();
    }
    wipe(h.signing);
    h.signing = null;
    h.bytes = null;
    h.positions = undefined;
    h.stage = 'done';
    h.lines = [...h.lines, { text: 'The new signing key is forgotten here. Kišib holds nothing of this identity now: only your two new papers do, the chain key’s and the signing key’s.', tone: 'ok' }];
    return this.state();
  }

  // ------------------------------------------------------------ must: escape a contested position (F299)

  /**
   * Review an escape with both keys (Identity section 11): someone else
   * rotated with this identity's chain key (its paper words were stolen),
   * or two rotations contest one position of a self-hosted identity. The
   * owner, holding the chain key's words and the signing key's words bound
   * before that position, signs a homeless rotation to new homes and an
   * escape endorsement listing every rotation served at that position as
   * abandoned.
   */
  async escapePlan(a: { id: string; address: string; words: string; signingWords: string; homes: string; leaveOut?: string[]; cards?: string; via?: Via }): Promise<Review> {
    this.busy();
    const via = a.via ?? {};
    const id = readId(a.id);
    let seed: Uint8Array | null = seedOf(a.words);
    let signingSeed: Uint8Array | null = null;
    try {
      signingSeed = seedOf(a.signingWords);
      const rd = await readIdentity(id, addresses(a.address), via, SPECS.identity);
      const r = rd.look.resolution;
      // Which position the owner holds: the act that bound the signing key these words give.
      const pub = hex(signingPublic(signingSeed));
      const chain = orderedChain(rd);
      let q: { act: string; position: number; bytes: Uint8Array } | null = null;
      for (const c of chain) if (keyBoundBy(c.bytes) === pub) q = c;
      // A rival served beyond the counted chain (contested, or pending at a home) is at the next position.
      if (!q) throw new Refused('These signing words do not give a signing key this identity’s chain ever bound: they are another identity’s, or the chain key’s words in the wrong box. Nothing was signed, and the words are forgotten.');
      const p = q.position + 1;
      const rivals: Served[] = [];
      for (const b of rd.chainActs.values()) {
        const s = served(id, b, SPECS.identity);
        if (s && s.position === p && s.previous === q.act) rivals.push(s);
      }
      if (!rivals.length) throw new Error(`Nothing contests your position: no rotation is served after the act that bound your signing key (${q.act}). If you want to change your keys, use “Change an identity’s keys”.`);
      const commit = commitOf(q.bytes);
      const idx = indexOf(seed, commit.scheme, commit.commit, p + 8);
      if (idx === null) throw new Refused('These words do not give the chain key committed before the contested position. Nothing was signed, and the words are forgotten.');
      const oldHomes = new Set([...(r.homesAt ?? []).flat(), ...r.homes].map((h) => h.hint));
      const newHomes = await homesAt(addresses(a.homes), via);
      if (!newHomes.length) throw new Error('Give one or more new homes: an escape leaves the old homes, which hold the other rotation and refuse any other with the same key.');
      for (const h of newHomes) if (oldHomes.has(h.hint)) throw new Error(`${h.hint} is one of the old homes: it holds the other rotation, and refuses any other revealing the same chain key (Identity rule 30). Name new homes.`);
      let plan: LinePlan;
      try {
        plan = planLines(linesUnder(rd, q.act), { leaveOut: a.leaveOut, cards: a.cards?.trim() ? readCards(a.cards) : undefined, ...placing(rd, q.act) });
      } catch (e) {
        throw new Error(message(e));
      }
      const counted = (s: Served) => r.links.some((l) => l.act === s.id);
      const sections: Section[] = [
        ...recordWords(rd).filter((s) => !s.heading.startsWith('Its lines')),
        {
          heading: `What contests position ${p}`,
          lines: rivals.map((s) => ({
            text: `Rotation ${s.id}, revealing your chain key, installing the signing key ${s.signingFingerprint}${counted(s) ? ': it counts now' : r.stop === 'contested' ? ': contested' : ': served, not counting'}${s.homeless ? ' (homeless)' : ''}.`,
            tone: 'bad' as const,
          })),
        },
        { heading: 'Your lines of acts: what the escape keeps (Identity rule 35)', lines: plan.shown.map((x) => ({ text: x.text.replace(/A line made elsewhere( that this device cannot read)?/, (_m: string, u?: string) => (u ? 'A line Kišib cannot read' : 'A line of acts')), tone: x.tone })) },
        {
          heading: 'What changes',
          lines: [
            { text: `New homes: ${newHomes.map((h) => `${h.hint} (operator ${short(h.operator!)})`).join('; ')}. The old homes are left.`, tone: 'warn' },
            { text: 'Every rotation above is abandoned: it can never count afterwards (Identity section 11).', tone: 'warn' },
            { text: 'A new signing key, made now; its words are shown once the new homes’ receipts are in.' },
            { text: `A new chain key, from a new paper made now on this device (key ${p} of its words): its words are shown first, and only once three are typed back are the escape and its endorsement signed. The stolen paper is then spent: whoever holds it can derive nothing that counts after this escape. ${PAPER_COUNTS_SAY}`, tone: 'warn' },
          ],
        },
      ];
      const signs = [
        `With your chain key (key ${idx} of these words): one homeless rotation of ${short(id)} at position ${p}, naming the new homes.`,
        `With your signing key (bound by ${short(q.act)}): one escape endorsement naming that rotation and listing ${rivals.length === 1 ? 'the rotation above' : `the ${rivals.length} rotations above`} as abandoned.`,
        'Both keys together are the strongest proof of ownership MOR sees (Identity rule 53): an escape endorsed with the signing key cannot be voided by an objection. Someone holding both of your keys could do the same: keep them apart.',
      ];
      const digest = sha256(cborEncode(['MOR Kišib escape, version 1', id, q.act, rivals.map((s) => s.id).sort(), newHomes.map((h) => h.hint), plan.kept.map((k) => [k.act, k.position, k.summary])]));
      const s0 = seed;
      const g0 = signingSeed;
      seed = null;
      signingSeed = null;
      const qq = q;
      return this.plan(
        { digest, title: `Escape position ${p} of ${short(id)}, with both keys`, summary: [`Identity ${id}: someone else’s rotation revealing your chain key stands at position ${p}.`, FORGOTTEN_SAY], sections, signs, warning: plan.warning, blocking: [] },
        {
          wipe: () => wipe(s0, g0),
          run: async (warned) => {
            checkWarned(plan, warned);
            // H79: a new paper; above all here, where the old one was stolen (the air-gapped Module, rule 3.3: "a fresh seed if the current one may be exposed"),
            // confirmed before anything is signed; both old keys wait in memory until then.
            const fresh = freshSeed();
            const next = chainKeyAt(fresh, commit.scheme, p);
            const nextCommit = next.commit;
            wipe(next.seeds);
            const oldChain = s0.slice();
            const oldSigning = g0.slice();
            const signing = newSigningSecret();
            const everywhere = [...new Set([...newHomes.map((h) => h.hint), ...rd.places])];
            const h: Held = {
              kind: 'escape',
              id,
              bytes: null,
              act: null,
              homes: newHomes,
              before: chain.filter((c) => c.position <= qq.position).map((c) => c.bytes),
              with: [],
              places: [...newHomes.map((h) => h.hint), ...rd.places],
              signing,
              chain: fresh,
              stage: 'paper',
              title: `The escape of ${short(id)}: first, the new paper`,
              lines: PAPER_LINES,
              drop: () => wipe(oldChain, oldSigning),
              sign: async () => {
                const current = chainKeyAt(oldChain, commit.scheme, idx);
                let bytes: Uint8Array;
                let endorsement: Uint8Array;
                try {
                  bytes = makeRotation({
                    identitySpec: SPECS.identity,
                    identity: id,
                    previous: qq.act,
                    position: p,
                    chainKeyScheme: commit.scheme,
                    chainKeySeeds: current.seeds,
                    newSigningPublic: signingPublic(signing),
                    nextChainKeyScheme: commit.scheme,
                    nextChainKeyCommit: nextCommit,
                    kept: plan.kept,
                    homes: newHomes,
                    homeless: true,
                  });
                  const owner = holding(id, qq.act, oldSigning, chain.filter((c) => c.position <= qq.position).map((c) => c.bytes), newHomes);
                  endorsement = owner.sign(SPECS.identity, ESCAPE_ENDORSEMENT, cborEncode(new Map([[0, rivals.map((s) => unhex(s.id))]])), { public: true, objects: [[id, actId(bytes)]] }).act;
                } finally {
                  wipe(current.seeds, oldChain, oldSigning);
                }
                h.bytes = bytes;
                h.act = actId(bytes);
                h.title = `The escape of ${short(id)}`;
                // The escape goes to the old homes and relays too: a reader meets it there (an old home keeps it as evidence, Identity rule 48) and asks the new homes it names for its receipts.
                h.with = [
                  { bytes: endorsement, to: everywhere },
                  { bytes, to: rd.places },
                ];
                // The endorsement first, so a home judging the escape can hold it.
                for (const hint of everywhere) await relayAt(hint, via).putAct(endorsement).catch(() => undefined);
              },
            };
            this.held = h;
            return this.sitting()!;
          },
        },
      );
    } catch (e) {
      wipe(seed, signingSeed);
      throw e;
    }
  }

  // ------------------------------------------------------------ must: a succession, confirmed by the successor (F300)

  /**
   * Review the successor's confirmation of a succession declared by
   * another identity's rotation (Identity section 8): the successor's own
   * signing key's words, and an act of the successor naming that rotation.
   */
  async confirmPlan(a: { owner: string; successor: string; address: string; words: string; via?: Via }): Promise<Review> {
    this.busy();
    const via = a.via ?? {};
    const owner = readId(a.owner);
    const successor = readId(a.successor);
    let seed: Uint8Array | null = seedOf(a.words);
    try {
      const rd = await readIdentity(owner, addresses(a.address), via, SPECS.identity);
      const s = rd.look.verifier.succession(owner) as { state: string; rotation?: string; successor?: string };
      if (s.state === 'none') throw new Error(`No succession is declared by ${short(owner)}: there is nothing to confirm.`);
      if (s.successor !== successor) throw new Error(`The succession ${short(owner)} declares names ${s.successor ? short(s.successor) : 'another protocol'}, not ${short(successor)}.`);
      if (s.state === 'confirmed') throw new Error('This succession is already confirmed.');
      const look = await lookCurrent(successor, seed, [...new Set([...addresses(a.address), ...rd.places])], via);
      const sections: Section[] = [
        { heading: 'What it confirms', lines: [{ text: `${short(owner)} declared, in its rotation ${s.rotation}, that ${short(successor)} succeeds it.` }, { text: 'Until the successor confirms, clients show it as declared and follow nobody (F300).', tone: 'warn' }] },
        { heading: 'Who signs what', lines: [{ text: `${short(owner)} signed the rotation that declares the succession, with its chain key. It signs nothing now.` }, { text: `You, ${short(successor)}, sign one act with your signing key: a confirmation (Identity type 7) naming that rotation. It needs nothing from ${short(owner)}.` }, { text: `${short(owner)} goes on living: succession does not end it (Identity rule 39). Its followers and agreements may move across to you.` }] },
        { heading: 'A line of your acts', lines: [{ text: 'This act starts a new line of your acts, made here. Your next change of keys keeps it only if it names it: Kišib finds every line when it rotates.', tone: 'warn' }] },
      ];
      const digest = sha256(cborEncode(['MOR Kišib succession confirmation, version 1', owner, successor, s.rotation!]));
      const s0 = seed;
      seed = null;
      const r = look.resolution;
      return this.plan(
        { digest, title: `Confirm that ${short(successor)} succeeds ${short(owner)}`, summary: [FORGOTTEN_SAY], sections, signs: [`You sign, as ${short(successor)}, one confirmation naming the rotation ${s.rotation}.`], warning: null, blocking: [] },
        {
          wipe: () => wipe(s0),
          run: async () => {
            const chain = await servedChain(successor, r.homes, via);
            const binding = r.links[r.links.length - 1].act;
            const me = holding(successor, binding, s0, chain, r.homes);
            const made = me.sign(SPECS.identity, LINK_CONFIRMATION, cborEncode(new Map()), { public: true, objects: [[owner, s.rotation!]] });
            wipe(s0, unhex(me.f.signingSecret));
            me.f.signingSecret = '';
            const to = [...new Set([...r.homes.map((h) => h.hint), ...rd.places])];
            const lines: Line[] = [];
            for (const hint of to) lines.push(await put(hint, made.act, chain));
            this.held = { kind: 'confirm', id: successor, owner, bytes: null, act: made.id, homes: r.homes, before: [], with: [], places: to, signing: null, chain: null, stage: 'done', title: `${short(successor)} confirmed the succession`, lines };
            const v = await lookUp(owner, to, via);
            await lookUp(successor, to, via, v.verifier);
            v.verifier.add(made.act);
            const now = v.verifier.succession(owner) as { state: string };
            lines.push(now.state === 'confirmed' ? { text: 'Read back as anyone would: the succession is confirmed, and clients follow it.', tone: 'ok' } : { text: `Read back: ${now.state}.`, tone: 'warn' });
            lines.push({ text: 'Your signing words are forgotten here.', tone: 'ok' });
            return this.sitting()!;
          },
        },
      );
    } catch (e) {
      wipe(seed);
      throw e;
    }
  }

  // ------------------------------------------------------------ must: rotate a collective (F337)

  private deps(): CollectiveDeps {
    return { now: this.now, web: this.web };
  }

  /** Start a collective's rotation: the starter's review (F337's plain words first). */
  async collectiveStart(a: Parameters<CollectiveSitting['start']>[0]): Promise<Review> {
    this.busy();
    const c = new CollectiveSitting(this.deps());
    const review = await c.start(a);
    const plan = this.plan(review, {
      wipe: () => (this.col === c ? undefined : c.wipe()),
      run: async () => {
        this.col = c;
        await c.announce();
        return this.sitting()!;
      },
    });
    return plan;
  }

  /** In the same room: one more paper typed into this Kišib. */
  async collectivePaper(a: { number: string; words: string }): Promise<State> {
    if (!this.col) throw new Error('No collective rotation is waiting here.');
    await this.col.paper(a);
    return this.state();
  }

  /** Look for the members' shares sealed to the one-time key. */
  async collectiveGather(): Promise<State> {
    if (!this.col) throw new Error('No collective rotation is waiting here.');
    await this.col.gather();
    return this.state();
  }

  /** Rebuild, rotate and deal, in one sitting, once exactly the threshold is in. */
  async collectiveRotate(): Promise<State> {
    if (!this.col) throw new Error('No collective rotation is waiting here.');
    await this.col.rotate();
    return this.state();
  }

  /** A new share shown here once (the starter's own, or a member's by hand). */
  collectiveShare(a: { holder: string }): { x: number; words: string[]; fingerprint: string; say: string[] } {
    if (!this.col) throw new Error('No collective rotation here.');
    return this.col.shareShow(a.holder);
  }

  collectiveShareWritten(a: { holder: string }): State {
    if (!this.col) throw new Error('No collective rotation here.');
    this.col.shareWritten(a.holder);
    return this.state();
  }

  /** A member: read a rotation waiting for its share, by the collective and its fingerprint, before typing anything. */
  async collectiveRead(a: { collective: string; fingerprint: string; address: string; via?: Via }): Promise<{ title: string; sections: Section[] }> {
    const { c, sections } = await CollectiveSitting.readRequest(a, this.now());
    return { title: `A rotation of ${short(c.rd.id)} asks for your share`, sections };
  }

  /** A member's share: reviewed with the paper and signing words, then, confirmed, sealed to the starter's one-time key. */
  async collectiveGive(a: { collective: string; fingerprint: string; address: string; member: string; memberWords: string; number: string; shareWords: string; via?: Via }): Promise<Review> {
    this.busy();
    let sent: { title: string; lines: Line[] } | null = null;
    const g = await CollectiveSitting.give(this.deps(), a, (r) => (sent = r));
    return this.plan(g.review, {
      wipe: g.wipe,
      run: async () => {
        await g.run();
        const s = sent as { title: string; lines: Line[] } | null;
        this.held = { kind: 'collective', id: readId(a.collective), bytes: null, act: null, homes: [], before: [], with: [], places: [], signing: null, chain: null, stage: 'done', title: s!.title, lines: s!.lines };
        return this.sitting()!;
      },
    });
  }
}

// ---------------------------------------------------------------- helpers

/** Identity's escape endorsement (type 14) and link confirmation (type 7). */
const ESCAPE_ENDORSEMENT = 14;
const LINK_CONFIRMATION = 7;

/** Each home's operator, as it declares itself (relay transport cMIP, `info`). */
async function homesAt(hints: string[], via: Via): Promise<Home[]> {
  const out: Home[] = [];
  for (const hint of hints) {
    let info: Map<number, unknown>;
    try {
      info = (await relayAt(hint, via).info()) as Map<number, unknown>;
    } catch (e) {
      throw new Error(`${hint} did not answer: ${message(e)}`);
    }
    const op = info.get(0);
    if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
    out.push({ operator: hex(op), hint });
  }
  return out;
}

/** The counted chain acts, oldest first, with their positions. */
function orderedChain(rd: Read): { act: string; position: number; bytes: Uint8Array }[] {
  return rd.look.resolution.links.map((l) => ({ act: l.act, position: l.position, bytes: rd.chainActs.get(l.act)! })).filter((c) => c.bytes);
}

/** The chain acts up to the latest that counts, for a home that lacks them. */
function chainBefore(rd: Read): Uint8Array[] {
  return orderedChain(rd).map((c) => c.bytes);
}

/** The signing key a genesis or rotation binds, hex; null for a chain signature. */
function keyBoundBy(bytes: Uint8Array): string | null {
  const d = describeAct(bytes) as { type?: number; payload?: Uint8Array };
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  if (d.type === IDENTITY_TYPES.genesis) return hex((m.get(0) as unknown[])[1] as Uint8Array);
  if (d.type === IDENTITY_TYPES.rotation) return hex((m.get(2) as unknown[])[1] as Uint8Array);
  return null;
}

/** The chain-key commitment a genesis, rotation or chain signature makes. */
function commitOf(bytes: Uint8Array): { scheme: number; commit: string } {
  const d = describeAct(bytes) as { type?: number; payload?: Uint8Array };
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  const c = (d.type === IDENTITY_TYPES.genesis ? m.get(1) : d.type === IDENTITY_TYPES.rotation ? m.get(3) : m.get(2)) as unknown[];
  return { scheme: Number(c[0]), commit: hex(c[1] as Uint8Array) };
}

/** Every counted chain act's chain-key commitment, with its position: what a paper's keys are compared with. */
function commits(rd: Read): { position: number; scheme: number; commit: string }[] {
  return orderedChain(rd).map((c) => ({ position: c.position, ...commitOf(c.bytes) }));
}

/** Whether the identity declares a clock (Money's declaration, kind 1), as its chain shows. */
function declaresClock(rd: Read): boolean {
  for (const c of orderedChain(rd)) {
    const d = describeAct(c.bytes) as { type?: number; payload?: Uint8Array };
    const m = cborDecode(d.payload!) as Map<number, unknown>;
    const decl = (d.type === IDENTITY_TYPES.genesis ? m.get(4) : m.get(8)) as unknown[][] | undefined;
    for (const x of decl ?? []) if (Number(x[1]) === 1 && x[2] !== null) return true;
  }
  return false;
}

export { fingerprint, grouped, bindingOf };

/** A change of the vault in a rotation: kept as it is (the default), removed, or declared anew, its entries on the Lightning or on-chain rail Modules, each with its limit. */
export type VaultChange =
  | { change: 'keep' }
  | { change: 'remove' }
  | { change: 'set'; network: number; unit: string; lightning?: { node: string; limit: number }; onchain?: { key: string; request: string; limit: number } };

const NETWORK = ['Bitcoin', 'testnet', 'signet', 'regtest'];

/** An entry of a vault in words: its unit, its rail, and what its limit means for a payment. */
function vaultEntryWords(e: { unit: string; railModule: string; source: Uint8Array; limit: number }): string {
  const units = new Set([e.unit]);
  const rail = e.railModule === MONEY_SPECS.lightning.hash ? 'on Lightning' : e.railModule === MONEY_SPECS.onchain.hash ? 'on-chain' : `on rail Module ${e.railModule.slice(0, 8)}…`;
  const where = e.railModule === MONEY_SPECS.lightning.hash ? (readLightningAddress(e.source) as { node: string } | null)?.node.slice(0, 16) : (readOnchainAddress(e.source) as { key: string } | null)?.key.slice(0, 16);
  const unit = unitOf(e.unit)?.unit.name ?? `unit ${e.unit.slice(0, 8)}…`;
  return `${unit}, ${rail} (${where ?? '?'}…): ${e.limit === 0 ? 'every payment in this unit goes to the vault (flow off)' : `a single payment above ${sayAmount({ unit: e.unit, value: e.limit }, units)} must go to the vault, not the flow`}.`;
}

/** The vault this rotation leaves, in words, and the declaration it carries (none where it keeps the vault). */
export function vaultPlan(v: VaultChange | undefined, now: { unit: string; railModule: string; source: Uint8Array; limit: number }[] | null): { lines: Line[]; declaration: { spec: string; kind: number; cbor?: Uint8Array } | null } {
  const change = v ?? { change: 'keep' };
  if (change.change === 'keep') {
    return { lines: now ? [{ text: 'Kept as it is:' }, ...now.map((e) => ({ text: vaultEntryWords(e) }))] : [{ text: 'None declared, and none is declared now: every payment goes to the flow; no protection chosen (Money rule 3).' }], declaration: null };
  }
  if (change.change === 'remove') {
    if (!now) throw new Error('This identity declares no vault: there is none to remove.');
    return {
      lines: [{ text: 'Removed: from this rotation on, every payment goes to the flow, whatever its size, and a thief holding the signing key could point the flow anywhere (Money rule 3).', tone: 'warn' }],
      declaration: vaultDeclaration(MIRS.money, null) as { spec: string; kind: number },
    };
  }
  if (!unitOf(change.unit)) throw new Error('Choose the vault’s unit.');
  const entries: { unit: string; railModule: string; source: Uint8Array; limit: number }[] = [];
  const limit = (n: number) => {
    if (!Number.isInteger(n) || n < 0) throw new Error('A limit is a whole number, 0 or more (0: every payment goes to the vault).');
    return n;
  };
  if (change.lightning?.node?.trim()) entries.push({ unit: change.unit, railModule: MONEY_SPECS.lightning.hash, source: lightningAddress({ network: change.network, node: change.lightning.node.trim().toLowerCase() }) as Uint8Array, limit: limit(change.lightning.limit) });
  if (change.onchain?.key?.trim()) entries.push({ unit: change.unit, railModule: MONEY_SPECS.onchain.hash, source: onchainAddress({ network: change.network, key: change.onchain.key.trim().toLowerCase(), request: change.onchain.request.trim().toLowerCase() }) as Uint8Array, limit: limit(change.onchain.limit) });
  if (!entries.length) throw new Error('A vault names at least one rail: its node (Lightning) or its Bitcoin key (on-chain).');
  if (unitOf(change.unit)?.unit.network !== change.network) throw new Error(`The unit is not the ${NETWORK[change.network]} network’s.`);
  return {
    lines: [
      { text: 'Declared anew, with the chain key (Money rule 2): only another change of keys can change it.', tone: 'warn' },
      ...entries.map((e) => ({ text: vaultEntryWords(e) })),
      ...(entries.length > 1 ? [{ text: 'Several entries for one unit: the smallest limit applies (F114).' }] : []),
      { text: 'A payment in a unit the vault has no entry for cannot be paid to the flow at all (fail closed, Money rule 3).' },
      { text: 'The vault’s node or key should be another than the flow’s: the vault is only as safe as the key it names.', tone: 'warn' },
    ],
    declaration: vaultDeclaration(
      MIRS.money,
      entries.map((e) => ({ unit: e.unit, railModule: e.railModule, source: e.source, limit: e.limit })),
    ) as { spec: string; kind: number; cbor: Uint8Array },
  };
}
