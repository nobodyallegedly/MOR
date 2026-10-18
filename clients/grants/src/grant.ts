// A person's grant to another identity (Agreements draft 14, rules 73 to 80;
// F128 "Grant keys for every identity"; decided by Nobody, allegedly, 17
// October 2026: "an example of grant"): the grantor signs a public grant,
// an everyday act of its own key, naming the grantee, what the grant reaches
// (field 6), its limits (fields 3 and 4, the grant limits cMIP) and a grant
// key the grantee made and keeps (field 9). The grantee accepts by its own
// signature act naming the grant (type 1). What the grantee then signs with
// the grant key is the grantor's own act: its signer the grantor, its
// binding the grant, citing `[grantor, grant]` in `objects` (Text rule 14's
// second case, F343), on the grantee's own strand. Every reader sees on
// whose authority: the grant names its grantee, who signed to accept it.
//
// Shared: Edubba's agents; Damgar's round 2 lanes (`lanes.ts`), a grant whose
// grantee is its own grantor, its key held by an app (F351).

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, makeEveryday, newSigningSecret, openWithKey, signaturePayload, signingPublic, unhex, withGrantLimits } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import type { Reference } from '../../genesis/src/identity.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { readStamps } from '../../../modules/timestamp/src/read.ts';
import { GRANT_LIMITS_SPEC, judge, limitsValue, readLimits, type Limits, type Verdict } from './limits.ts';

/** What a grant reaches (field 6): a layer, or one type of one specification. */
export type Kind = { layer: number } | { spec: string; type: number };

/** The kinds an owner may grant an agent, in plain words (Edubba's choices). */
export const GRANTABLE: { key: string; kind: Kind; words: string }[] = [
  { key: 'posts', kind: { spec: SPECS.text, type: 0 }, words: 'posts and messages (Text acts)' },
  { key: 'publications', kind: { spec: SPECS.envelopes, type: 0 }, words: 'publications, a picture among them (Envelopes)' },
  { key: 'money', kind: { layer: 2 }, words: 'money acts: promises to pay, claims and receipts (the Money layer)' },
];

const kindValue = (k: Kind) => ('layer' in k ? [0, k.layer] : [1, unhex(k.spec), k.type]);

export interface PersonGrant {
  grantee: string;
  /** What it reaches; none: every act but a decision (rule 73, reading). */
  kinds?: Kind[];
  limits?: Limits;
  /** The grant key's public part, as Identity's `[scheme, key]`. */
  key: [number, Uint8Array];
}

/** A person's grant (type 9), scope 2: acting for the grantor (posting, publishing, spending). */
export function personGrantPayload(g: PersonGrant): Uint8Array {
  const m = new Map<number, unknown>([
    [0, unhex(g.grantee)],
    [1, 2],
  ]);
  if (g.limits) {
    m.set(3, limitsValue(g.limits));
    m.set(4, unhex(GRANT_LIMITS_SPEC));
  }
  if (g.kinds?.length) m.set(6, g.kinds.map(kindValue));
  m.set(9, g.key);
  return cborEncode(m);
}

export interface GrantRead {
  grantee: string;
  scope: number;
  kinds: Kind[] | null;
  limits: Limits | null;
  /** Field 4 names another cMIP, or field 3 cannot be read: its acts are unknown under the limits. */
  limitsProblem: string | null;
  key: string;
}

export function readGrant(payload: Uint8Array): GrantRead {
  const m = cborDecode(payload) as Map<number, unknown>;
  if (!(m instanceof Map)) throw new Error('not a grant');
  const grantee = m.get(0);
  if (!(grantee instanceof Uint8Array)) throw new Error('a grant names its grantee');
  const kinds = m.has(6)
    ? (m.get(6) as unknown[]).map((k) => {
        const a = k as unknown[];
        return a[0] === 0 ? { layer: a[1] as number } : { spec: hex(a[1] as Uint8Array), type: a[2] as number };
      })
    : null;
  let limits: Limits | null = null;
  let limitsProblem: string | null = null;
  if (m.has(3) || m.has(4)) {
    const cmip = m.get(4);
    if (!(cmip instanceof Uint8Array) || hex(cmip) !== GRANT_LIMITS_SPEC) limitsProblem = 'its limits are under a cMIP this app does not implement';
    else {
      try {
        limits = readLimits(m.get(3));
      } catch (e) {
        limitsProblem = `its limits cannot be read: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
  }
  const key = m.get(9) as [number, Uint8Array];
  return { grantee: hex(grantee), scope: m.get(1) as number, kinds, limits, limitsProblem, key: hex(key[1]) };
}

/** Kinds in plain words. */
export function kindWords(k: Kind): string {
  const g = GRANTABLE.find((x) => JSON.stringify(x.kind) === JSON.stringify(k));
  if (g) return g.words;
  if ('layer' in k) return `every act of layer ${k.layer}`;
  return `acts of type ${k.type} of the specification ${k.spec.slice(0, 8)}…`;
}

/** A grant in plain words: who may act in whose name, what, how much, until when, and what it can never do. */
export function grantInWords(g: GrantRead, grantor: string, names: (id: string) => string, unitName: (unit: string) => string = (u) => `units ${u.slice(0, 8)}…`): string[] {
  const out = [`${names(grantor)} grants ${names(g.grantee)} authority to sign in ${names(grantor)}’s name, with a key of ${names(g.grantee)}’s own (Agreements rule 73; F128).`];
  out.push(g.kinds?.length ? `What it may sign: ${g.kinds.map(kindWords).join('; ')}.` : 'What it may sign: every act but a decision (no grant, revocation or record).');
  if (g.limits?.cap) out.push(`How much one act may move: at most ${g.limits.cap.value} ${unitName(g.limits.cap.unit)} (the grant limits cMIP, 2).`);
  if (g.limits?.expiry?.clock === 'timestamp') out.push(`Until: ${new Date(g.limits.expiry.time * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC, by the timestamp clock ${names(g.limits.expiry.identity)}; an act that clock has not stamped is unknown under the expiry (3.1).`);
  if (g.limits?.expiry?.clock === 'height') out.push(`Until: block ${g.limits.expiry.height} on the Bitcoin clock (3.2).`);
  if (g.limitsProblem) out.push(`Its limits: ${g.limitsProblem}; its acts are unknown under them.`);
  out.push('Every act it signs this way is shown as signed under this grant, naming both. It never signs a grant, a revocation or a record; it ends with one revocation (rule 76).');
  out.push('Public: anyone who checks its acts reads the grant (rule 73: a private grant backs nothing).');
  return out;
}

/** The grantee's acceptance: a signature act (type 1) naming the grant (F128). */
export function acceptance(grant: string): { spec: string; type: number; payload: Uint8Array; objects: [string, string][] } {
  return { spec: REPO_SPECS.agreements, type: AGREEMENTS_TYPES.signature, payload: signaturePayload(grant) as Uint8Array, objects: [[grant, grant]] };
}

/** Agreements' revocation type. */
export const REVOCATION = 10;

/** A revocation (type 10), signed by the grantor: an everyday act of its own key (rule 73). */
export function revocationPayload(grant: string): Uint8Array {
  return cborEncode(new Map<number, unknown>([[0, unhex(grant)]]));
}

/** What the grantee keeps of a grant: its key's secret and its strand. */
export interface GrantKey {
  grant: string;
  grantor: string;
  secret: string;
  /** The acts it signed with this key, in order: its strand (rule 75). */
  strand: string[];
}

/**
 * Sign with a grant key: the grantor's own act, its binding the grant,
 * citing `[grantor, grant]` (F343), next on the grantee's strand. The
 * strand is pushed; the caller keeps it before anything leaves.
 */
export function signUnderGrant(k: GrantKey, a: { spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[]; refs?: Reference[] }): { act: Uint8Array; id: string; key: Uint8Array } {
  const made = makeEveryday({
    signingSecret: unhex(k.secret),
    signer: k.grantor,
    binding: k.grant,
    spec: a.spec,
    type: a.type,
    payload: a.payload,
    sequence: k.strand,
    public: a.public,
    to: a.to?.length ? a.to : undefined,
    objects: [[k.grantor, k.grant]],
    refs: a.refs?.length ? a.refs : undefined,
  }) as { act: Uint8Array; id: string; key: Uint8Array };
  k.strand.push(made.id);
  return made;
}

/** A fresh grant key, made by its grantee (F128): its secret, and its public part as Identity's `[scheme, key]` (scheme 1, as the genesis client's). */
export function makeGrantKey(): { secret: Uint8Array; public: [number, Uint8Array] } {
  const secret = newSigningSecret();
  return { secret, public: [1, signingPublic(secret) as Uint8Array] };
}

/** On whose authority an act stands, as any reader can tell it. */
export interface Authority {
  grant: string;
  grantor: string;
  grantee: string;
  /** A lane: a grant whose grantee is its grantor (F351). */
  lane: boolean;
  /** Agreements' verdict (rule 80): backed, binds, not-backed, unknown. */
  backing: string;
  reason: string | null;
  limits: Verdict | null;
  words: string;
}

/** Every act the places hold signed by `signer` (as the repo client's `allBy`, here without anything from Node, for the web clients). */
export async function allBy(signer: string, hints: string[], via: Via): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const h of hints) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer, after });
        for (const it of page.items) if (it.kind === 'act') out.push(it.item);
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that place is away: the others may hold them
    }
  }
  return out;
}

export const fetchAct = async (id: string, hints: string[], via: Via): Promise<Uint8Array | null> => {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
      // not there
    }
  }
  return null;
};

/** Each act's earliest time on a timestamp clock, from its verified stamps at the places given. */
export async function stampsOf(clock: string, hints: string[], via: Via = {}): Promise<Map<string, number>> {
  const judgeStamp = {
    standing: async (act: Uint8Array, id: string, signer: string) => {
      const l = await lookUp(signer, hints, via);
      l.verifier.add(act);
      return l.verifier.status(id);
    },
  };
  return (await readStamps(clock, hints, judgeStamp, via)).earliest;
}

/**
 * Whether an act signed with a grant key stands, and on whose authority:
 * the grant and the grantee's acceptance looked for at `hints`, the
 * grantor's and grantee's chains looked up, the limits judged here (the
 * grant limits cMIP) and handed to the core, then Agreements' backing (rule
 * 80). Null for an act not signed under a grant.
 */
export async function authorityOf(act: Uint8Array, hints: string[], via: Via = {}, opts: { key?: Uint8Array; names?: (id: string) => string; stamps?: Map<string, Map<string, number>> } = {}): Promise<Authority | null> {
  // A private act is judged by its inside: its amount is there (the cap, 2.1).
  const d = (opts.key ? openWithKey(act, opts.key) : describeAct(act)) as { id: string; signer?: string; binding?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (!d.signer || !d.binding) return null;
  const grantBytes = await fetchAct(d.binding, hints, via);
  if (!grantBytes) return null;
  const gd = describeAct(grantBytes) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (gd.spec !== MIRS.agreements || gd.type !== AGREEMENTS_TYPES.grant || !gd.payload) return null;
  const g = readGrant(gd.payload);
  const names = opts.names ?? ((id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const id of [d.signer, g.grantee]) {
    try {
      await lookUp(id, hints, via, v);
    } catch {
      // not found: what it signed cannot count
    }
  }
  v.add(grantBytes);
  // The grantee's acceptance (F128), and the grantor's revocations of this grant (rule 76): an act its revocation's history does not hold is void.
  for (const a of await allBy(g.grantee, hints, via)) {
    const x = describeAct(a) as { spec?: string; type?: number; objects?: [string, string][] };
    if (x.spec === MIRS.agreements && x.type === AGREEMENTS_TYPES.signature && x.objects?.some((o) => o[0] === d.binding)) v.add(a);
  }
  for (const a of await allBy(d.signer, hints, via)) {
    const x = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
    if (x.spec !== MIRS.agreements || x.type !== REVOCATION || !x.payload) continue;
    const named = (cborDecode(x.payload) as Map<number, unknown>).get(0);
    if (named instanceof Uint8Array && hex(named) === d.binding) v.add(a);
  }
  if (opts.key) v.addWithKey(act, opts.key);
  else v.add(act);
  let limits: Verdict | null = null;
  if (g.limits) {
    let stamps = opts.stamps;
    if (g.limits.expiry?.clock === 'timestamp' && !stamps?.has(g.limits.expiry.identity)) {
      stamps = new Map(stamps ?? []);
      try {
        stamps.set(g.limits.expiry.identity, await stampsOf(g.limits.expiry.identity, hints, via));
      } catch {
        // the clock's stamps could not be read: the expiry stays unknown
      }
    }
    limits = judge(g.limits, d, MIRS.money, { stamps });
  }
  const verdicts: [string, boolean][] = limits && limits.within !== null ? [[d.id, limits.within]] : [];
  const b = v.agreementsBacking(withGrantLimits(AGREEMENTS_SPECS, verdicts), d.id) as { kind: string; grant?: string; reason?: string };
  const lane = g.grantee === d.signer;
  const by = lane ? `Signed under a lane of ${names(d.signer)} (a grant to itself, ${d.binding.slice(0, 8)}…, its key held by an app; F351)` : `Signed by ${names(g.grantee)} in ${names(d.signer)}’s name, under ${names(d.signer)}’s grant ${d.binding.slice(0, 8)}…`;
  const plain =
    b.kind === 'backed' || b.kind === 'binds'
      ? `${by}: backed (Agreements rule 80).`
      : b.kind === 'not-backed'
        ? `${by}, which does not back it: ${b.reason}.`
        : `${by}: whether it backs it is unknown (${b.reason ?? 'not readable'}).`;
  return { grant: d.binding, grantor: d.signer, grantee: g.grantee, lane, backing: b.kind, reason: b.reason ?? null, limits, words: plain };
}

/** On whose authority an act stands, by its id: fetched where acts are looked for, then read as `authorityOf` does. Null where not found, or not under a grant. */
export async function authorityOfId(id: string, hints: string[], via: Via = {}, opts: { names?: (id: string) => string } = {}): Promise<Authority | null> {
  const act = await fetchAct(id, hints, via);
  return act ? authorityOf(act, hints, via, opts) : null;
}
