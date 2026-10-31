// A member acting for a collective (Agreements rules 56 to 60, the
// redesign; decided by Nobody, allegedly, 29 October 2026, F402).
//
// A collective has no signing key, and its members have no member keys:
// the member keys of F353 (signature field 1, the member keys cMIP) are
// gone. A member acts for the collective with their own key, the act naming
// the collective in `objects`, its identity as chain, citing the decision
// it acts under (the collective's latest record, grant or revocation, else
// its latest chain link); Agreements count it under the rule of the layer it
// falls in, or of the finer area within it (rule 60). Another member meets
// a rule of two with an ordinary signature act naming it (rule 6).
//
// Nothing here uses Node: the web clients use it as they are.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, readTerms, unhex, withGrantLimits } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { chainOf, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, FOUNDING_AGREEMENT, REPO_SPECS } from '../../repo/src/specs.ts';
import { allBy } from './grant.ts';
import { negotiate } from '../../repo/src/proposals.ts';

/** The decisions on a collective's chain (Agreements rule 58): grant, revocation, record. */
const DECISIONS: number[] = [AGREEMENTS_TYPES.grant, AGREEMENTS_TYPES.revocation, AGREEMENTS_TYPES.record];

/** The founding agreement a collective's genesis declares (key 4, Agreements' kind 0), and its chain's counted links, read from its homes. */
async function foundingOf(collective: string, hints: string[], via: Via): Promise<{ founding: string; links: string[] }> {
  const l = await lookUp(collective, hints, via);
  const links = l.resolution.links.map((x) => x.act);
  const chain = await chainOf(collective, hints, via);
  const g = chain.find((b) => (describeAct(b) as { id: string }).id === collective);
  const d = g ? (describeAct(g) as { payload?: Uint8Array }) : null;
  const decl = d?.payload ? ((cborDecode(d.payload) as Map<number, unknown>).get(4) as unknown[][] | undefined) : undefined;
  for (const x of decl ?? []) {
    if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Number(x[1]) === FOUNDING_AGREEMENT && x[2] instanceof Uint8Array) return { founding: hex(x[2]), links };
  }
  throw new Error('The collective’s genesis declares no founding agreement.');
}

/**
 * Where a member's act for the collective stands on its chain (rule 58): the
 * decision it acts under, the collective's latest (followed from its latest
 * chain link through each decision citing the one before), read from what
 * its members published. `strand` is kept for callers that pass it along:
 * a member's acts are on their own line, so it starts empty.
 */
export async function chainFor(collective: string, hints: string[], via: Via = {}): Promise<{ decision: string; strand: string[] }> {
  const { links } = await foundingOf(collective, hints, via);
  const { acts } = await collectiveVerifier(collective, hints, via);
  const cites = new Map<string, string[]>();
  for (const a of acts) {
    const d = describeAct(a) as { id: string; spec?: string; type?: number; objects?: [string, string][] };
    if (d.spec !== REPO_SPECS.agreements || !DECISIONS.includes(d.type ?? -1)) continue;
    for (const [chain, cited] of d.objects ?? []) if (chain === collective) cites.set(cited, [...(cites.get(cited) ?? []), d.id]);
  }
  let decision = links[links.length - 1];
  for (let i = 0; i < 1024; i++) {
    const next = cites.get(decision);
    if (!next?.length) break;
    decision = next[next.length - 1];
  }
  return { decision, strand: [] };
}

/**
 * An act for the collective made by a member with their own key (rule 58):
 * its signer the member, naming the collective and citing its latest
 * decision after the entries the act's type defines (for a text, its one
 * object, Text rule 14). Signed by the member's app, or by Kišib's runner
 * where the app holds no key.
 */
export async function signAsMember(
  collective: string,
  me: TestIdentity,
  at: { decision: string; strand: string[] },
  a: { spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[]; objects?: [string, string][]; refs?: (string | [string, string])[] },
): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
  const objects: [string, string][] = a.spec === MIRS.text && a.type === 0 ? [[collective, at.decision]] : [...(a.objects ?? []), [collective, at.decision]];
  const made = await me.signNow(a.spec, a.type, a.payload, {
    public: a.public,
    ...(a.to?.length ? { to: a.to } : {}),
    objects,
    ...(a.refs?.length ? { refs: a.refs as never } : {}),
  });
  at.strand.push(made.id);
  return made;
}

/** A member's signature act naming `act`, with their own key: the second signer a rule of two asks for (rules 6, 60). */
export async function cosignAsMember(me: TestIdentity, act: string): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
  return me.signNow(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, cborEncode(new Map<number, unknown>([[0, unhex(act)]])), { public: true, objects: [[act, act]] });
}

/** Publish acts at places; returns where they were taken. */
export async function publishAt(acts: Uint8Array[], places: string[], via: Via = {}): Promise<string[]> {
  const ok: string[] = [];
  for (const p of places) {
    try {
      for (const a of acts) await relayAt(p, via).putAct(a);
      ok.push(p);
    } catch {
      // that place is away
    }
  }
  return ok;
}

/** Agreements' answer for an act of a collective (`agreementsConsent`), with each area's or layer's count: who signed, the limits' verdict. */
export interface ConsentRead {
  kind: string;
  agreement?: string | null;
  reason?: string | null;
  met: boolean;
  areas: { area: number; name: string; frozen: boolean; voices: string[]; needed: number; signers: string[]; limits?: string | null; met: boolean }[];
}

/**
 * A verifier holding what a collective's relays and homes hold, as anyone
 * reads them: its chain, the terms of its agreement chain, its parties'
 * acts (their acts for it, signatures, resignations: a collective signs
 * none itself), and `acts`; with every act it took.
 */
export async function collectiveVerifier(collective: string, hints: string[], via: Via = {}, acts: string[] = []): Promise<{ v: Verifier; founding: string; parties: string[]; acts: Uint8Array[] }> {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held: Uint8Array[] = [];
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
      held.push(a);
    } catch {
      // private, or held already
    }
  };
  const hold = async (id: string) => {
    let places = hints;
    try {
      const l = await lookUp(id, hints, via, v);
      places = [...new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
      // not found: its acts cannot count
    }
    for (const a of await allBy(id, places, via)) add(a);
  };
  await hold(collective);
  const { founding } = await foundingOf(collective, hints, via);
  const parties = new Set<string>();
  const seen = new Set<string>();
  const termsOfId = async (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const h of hints) {
      const a = await relayAt(h, via).getAct(id).catch(() => null);
      if (!a) continue;
      add(a);
      const d = describeAct(a) as { payload?: Uint8Array };
      if (d.payload) for (const p of (readTerms(d.payload, AGREEMENTS_SPECS) as { parties: string[] }).parties) parties.add(p);
      break;
    }
  };
  await termsOfId(founding);
  for (const a of await allBy(collective, hints, via)) {
    const d = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
    // Rotations declare clones (key 8), records name them: their terms are read too.
    if (d.spec === SPECS.identity && d.type === 1 && d.payload) {
      for (const x of ((cborDecode(d.payload) as Map<number, unknown>).get(8) as unknown[][] | undefined) ?? []) {
        if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Array.isArray(x[2])) await termsOfId(hex((x[2] as unknown[])[0] as Uint8Array));
      }
    }
  }
  for (const p of parties) await hold(p);
  for (const id of acts) {
    {
      for (const h of hints) {
        const a = await relayAt(h, via).getAct(id).catch(() => null);
        if (a) {
          add(a);
          break;
        }
      }
    }
  }
  return { v, founding, parties: [...parties], acts: held };
}

/** The agreement in force for a collective, who left, and the resignations its parties published (registered or not: rule 70, F187). */
export async function collectiveNow(collective: string, hints: string[], via: Via = {}): Promise<{ agreement: string | null; departed: string[]; resignations: { act: string; party: string; kind: string; agreement: string }[]; parties: string[] }> {
  const { v, parties } = await collectiveVerifier(collective, hints, via);
  const cur = v.agreementsCurrent(AGREEMENTS_SPECS, collective) as { agreement: string; departed: string[] } | null;
  let resignations: { act: string; party: string; kind: string; agreement: string }[] = [];
  try {
    resignations = v.agreementsPublishedResignations(AGREEMENTS_SPECS, collective) as typeof resignations;
  } catch {
    // none readable
  }
  return { agreement: cur?.agreement ?? null, departed: cur?.departed ?? [], resignations, parties };
}

/**
 * Make an act for the collective with this member's own key, publish it
 * where the collective's acts are, and ask the other members the layer's
 * or area's rule needs for their signature: each sent a negotiation message
 * naming the act and the collective, sealed to them, as Edubba sends a
 * release to sign. Their apps (Dub's Signing tab, Edubba's To sign) sign it
 * with their own keys.
 */
export async function signAndAsk(
  me: TestIdentity,
  collective: string,
  act: { spec: string; type: number; payload: Uint8Array },
  ask: string[],
  text: string,
  hints: string[],
  via: Via = {},
): Promise<{ act: string; places: string[]; asked: string[]; notAsked: string[] }> {
  const at = await chainFor(collective, hints, via);
  const made = await signAsMember(collective, me, at, { ...act, public: true });
  const places = await publishAt([made.act], hints, via);
  if (!places.length) throw new Error('No relay took the act: nothing counts. Try again.');
  const asked: string[] = [];
  const notAsked: string[] = [];
  for (const h of ask) {
    try {
      const l = await lookUp(h, hints, via);
      const inbox = l.inbox(REPO_SPECS.agreements) ?? l.routes.routes.flatMap((r) => r.hints);
      if (!l.encryptionKey || !inbox?.length) throw new Error('no inbox or encryption key');
      await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text, refs: [[made.id, collective], [collective, collective]] });
      asked.push(h);
    } catch {
      notAsked.push(h);
    }
  }
  return { act: made.id, places, asked, notAsked };
}

/** Where a payer pays a collective, as Agreements read its payee pointer (`collectivePointer`). */
export interface CollectiveChoice {
  to: 'flow' | 'vault' | 'nowhere';
  pointer?: string;
  rail?: number;
  declaredBy?: string;
  entry?: number;
  module?: string;
  address?: Uint8Array;
  why: string;
}

/**
 * A collective's payee pointer in force, as Agreements judge it (Money
 * draft 10, rule 7, F358, decided by Nobody, allegedly, 19 October 2026):
 * made by a member with their own key, naming the collective, it counts
 * where the rule of the Money layer, or of a finer area reaching payee
 * pointers, is met (Agreements rule 60). A
 * pointer moves no amount, so the grant limits cMIP (draft 2, 2.2) finds
 * each within an area's cap: stated so for every pointer the collective's
 * places hold. With `pay`, where a payer pays this amount (`agreementsChoose`).
 * Null where the identity is no collective.
 */
export async function collectivePointer(
  collective: string,
  hints: string[],
  via: Via = {},
  pay?: { amount: { unit: string; value: number }; accepted: string[] },
): Promise<{ pointer: string | null; version: number; why: string | null; choice: CollectiveChoice | null } | null> {
  const places = await collectivePlaces(collective, hints, via);
  const { v, founding } = await collectiveVerifier(collective, places, via).catch(() => ({ v: null, founding: null }));
  if (!v || !founding) return null;
  const pointers: [string, boolean][] = [];
  for (const a of (await collectiveVerifier(collective, places, via)).acts) {
    const d = describeAct(a) as { id: string; spec?: string; type?: number; objects?: [string, string][] };
    if (d.spec === MIRS.money && d.type === 0 && d.objects?.some(([c]) => c === collective)) pointers.push([d.id, true]);
  }
  const specs = withGrantLimits(AGREEMENTS_SPECS, pointers);
  const p = v.agreementsPointer(specs, collective) as { act: string | null; version: number; why: string | null };
  const choice = pay ? (v.agreementsChoose(specs, collective, pay.amount, pay.accepted) as CollectiveChoice) : null;
  return { pointer: p.act ?? null, version: p.version ?? 0, why: p.why ?? null, choice };
}

/**
 * How Agreements judge acts of a collective, from what its relays and homes hold
 * ([`collectiveVerifier`]). `limits`: an app's verdicts of the
 * cMIP an area names for its holders' keys (`[act, within]`; the grant limits
 * cMIP draft 2), the core answering unknown for an act not listed.
 */
export async function judgeCollective(collective: string, acts: string[], hints: string[], via: Via = {}, limits: [string, boolean][] = []): Promise<Map<string, ConsentRead>> {
  const { v } = await collectiveVerifier(collective, hints, via, acts);
  const out = new Map<string, ConsentRead>();
  for (const id of acts) {
    try {
      out.set(id, v.agreementsConsent(withGrantLimits(AGREEMENTS_SPECS, limits), id) as ConsentRead);
    } catch (e) {
      out.set(id, { kind: 'unread', reason: e instanceof Error ? e.message : String(e), met: false, areas: [] });
    }
  }
  return out;
}

/** Where a collective is found: the places given, with its homes and its routes' relays as its record names them. */
export async function collectivePlaces(collective: string, hints: string[], via: Via = {}): Promise<string[]> {
  try {
    const l = await lookUp(collective, hints, via);
    return [...new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
  } catch {
    return [...new Set(hints)];
  }
}

/** The layer of an act, as Agreements read it from its spec (MICS, "Structure"): Text 1, Envelopes 2, Money 3, Agreements 4, Development 5. */
const LAYER_OF: Record<string, number> = { [MIRS.text]: 1, [MIRS.envelopes]: 2, [MIRS.money]: 3, [MIRS.agreements]: 4, [MIRS.development]: 5 };
const LAYER_NAME: Record<number, string> = { 1: 'Text', 2: 'Envelopes', 3: 'Money', 4: 'Agreements', 5: 'Development' };

/** An area of a collective's agreement in force, or a layer's rule read as one (its lane), as an app shows it. */
export interface AreaHere {
  id: number;
  name: string;
  holders: string[];
  number: number;
  /** Where it is a layer's rule (field 19), not a finer area: that layer. */
  layer?: number;
}

/**
 * Who acts for the collective on an act of `spec` and `type` (rule 60): the
 * finer area of its agreement in force reaching that kind of act, else the
 * rule of the act's layer, read as an area (its holders the parties the rule
 * counts among, its number what it asks). Null where the agreement is not
 * read. With the agreement's id.
 */
export async function areaReaching(collective: string, places: string[], kind: { spec: string; type: number }, via: Via = {}): Promise<{ agreement: string | null; area: AreaHere | null }> {
  const now = await collectiveNow(collective, places, via);
  if (!now.agreement) return { agreement: null, area: null };
  for (const h of places) {
    const a = await relayAt(h, via).getAct(now.agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a) as { payload?: Uint8Array };
    if (!d.payload) break;
    type RuleRead = { form: string; threshold?: number | null; named?: string[] | null };
    const t = readTerms(d.payload, AGREEMENTS_SPECS) as {
      parties: string[];
      layers: [number, RuleRead][];
      areas: { id: number; name: string; holders: string[]; threshold: number; kinds: { form: string; spec?: string | null; type?: number | null }[] }[];
    };
    const x = t.areas.find((r) => r.kinds.some((k) => k.spec === kind.spec && k.type === kind.type));
    if (x) return { agreement: now.agreement, area: { id: x.id, name: x.name, holders: x.holders, number: x.threshold } };
    const layer = LAYER_OF[kind.spec];
    const r = t.layers.find(([l]) => l === layer)?.[1];
    if (!r) return { agreement: now.agreement, area: null };
    const voices = t.parties.filter((p) => !now.departed.includes(p));
    const holders = r.form === 'named' ? (r.named ?? []) : voices;
    const number = r.form === 'threshold' ? (r.threshold ?? 1) : holders.length;
    return { agreement: now.agreement, area: { id: -layer, name: `the ${LAYER_NAME[layer]} layer`, holders, number, layer } };
  }
  return { agreement: now.agreement, area: null };
}

/** An agreement's terms, fetched at these places and read by the core: null where none holds it. */
export async function termsAt(agreement: string, places: string[], via: Via = {}): Promise<Record<string, unknown> | null> {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a) as { payload?: Uint8Array; spec?: string; type?: number };
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) return null;
    try {
      return readTerms(d.payload, AGREEMENTS_SPECS) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * The split service of a publication (Agreements type 6, field 3) and its
 * backups (field 11): the publication carries them now; terms fields 14 and
 * 29 are withdrawn. Null where the publication is not found.
 */
export async function splitServiceOf(publication: string, places: string[], via: Via = {}): Promise<{ service: string; backups: string[] } | null> {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(publication).catch(() => null);
    if (!a) continue;
    const d = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.publication || !d.payload) return null;
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const service = m.get(3);
    if (!(service instanceof Uint8Array)) return null;
    const backups = ((m.get(11) as Uint8Array[] | undefined) ?? []).filter((x) => x instanceof Uint8Array).map(hex);
    return { service: hex(service), backups };
  }
  return null;
}
