// Members' own keys (F353, decided by Nobody, allegedly, 18 and 19 October
// 2026; Agreements draft 16, rule 73; the member keys cMIP, draft 1).
//
// When a member signs a collective's founding, or a member change's clone,
// their app makes a key of their own and names its public half in that
// signature (signature field 1). The founding or clone is its grant, the
// signature its naming and acceptance; it counts once the founding or clone
// is complete, within the areas it gives the member, each act it signs
// counted as that member's signature there (rule 60). The private half is
// left as a private act sealed to the member themself, at their homes (the
// member keys cMIP): any of their apps holding their identity opens it
// (Dub, Edubba, Damgar, Ummia, on the Mac or the web). It stays the same
// through the member's own change of keys; Kišib seals it again to the new
// encryption key then. *Stated cost:* the key sits encrypted at the member's
// homes.
//
// Nothing here uses Node: the web clients use it as they are.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, makeEveryday, openSealed, readTerms, sha256, unhex, withGrantLimits, xwingPublic } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { chainOf, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, FOUNDING_AGREEMENT, REPO_SPECS } from '../../repo/src/specs.ts';
import { allBy, makeGrantKey } from './grant.ts';
import { negotiate } from '../../repo/src/proposals.ts';

/** The member keys cMIP, draft 1 (`cmips/cmip-member-keys-draft-1.md`): a test value until publication. */
export const MEMBER_KEYS_SPEC = sha256('Member keys cMIP, draft 1, test value until publication');

/** Its one act type: a member key, sealed to its holder. */
export const MEMBER_KEY = 0;

/** A member key as its holder's apps read it. */
export interface MemberKey {
  /** The sealed act holding it. */
  act: string;
  /** The founding or clone its holder signed, naming it. */
  terms: string;
  /** That signature act: what acts made with it name as their binding. */
  signature: string;
  public: [number, Uint8Array];
  secret: Uint8Array;
  /** Its place in the holder's sequence: the latest key is the one in force. */
  position: number;
}

/** A fresh member key: made by the member's app as it signs (scheme 1, as a grant key). */
export const makeMemberKey = makeGrantKey;

export function memberKeyPayload(k: { terms: string; signature: string; public: [number, Uint8Array]; secret: Uint8Array }): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(k.terms)],
      [1, unhex(k.signature)],
      [2, [k.public[0], k.public[1]]],
      [3, k.secret],
    ]),
  );
}

function readPayload(p: Uint8Array): Omit<MemberKey, 'act' | 'position'> | null {
  try {
    const m = cborDecode(p) as Map<number, unknown>;
    if (!(m instanceof Map) || [...m.keys()].some((k) => ![0, 1, 2, 3].includes(k))) return null;
    const [t, s, pub, sec] = [m.get(0), m.get(1), m.get(2) as unknown[], m.get(3)];
    if (!(t instanceof Uint8Array) || t.length !== 32 || !(s instanceof Uint8Array) || s.length !== 32) return null;
    if (!Array.isArray(pub) || typeof pub[0] !== 'number' || !(pub[1] instanceof Uint8Array) || !(sec instanceof Uint8Array)) return null;
    return { terms: hex(t), signature: hex(s), public: [pub[0], pub[1]], secret: sec };
  } catch {
    return null;
  }
}

/**
 * Seal a member key to its holder (the member keys cMIP, 2): a private act
 * of theirs, `to` themself, sealed to their current encryption key and left
 * at each of their homes. Returns the act's id.
 */
export async function sealMemberKey(me: TestIdentity, k: { terms: string; signature: string; public: [number, Uint8Array]; secret: Uint8Array }, save: () => Promise<void> | void): Promise<string> {
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, me.via);
  if (!look.encryptionKey || !me.f.encryption.some((e) => hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey!))) {
    throw new Error('The encryption key this identity publishes is not one this app holds: your member key cannot be sealed to you. Your signature stands; the key stays in this app only.');
  }
  let made: { act: Uint8Array; id: string; key: Uint8Array };
  try {
    made = me.sign(MEMBER_KEYS_SPEC, MEMBER_KEY, memberKeyPayload(k), { public: false, to: [me.id] });
  } finally {
    await save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  let left = 0;
  for (const h of homes) {
    try {
      await relayAt(h, me.via).putSealed(sealed);
      await relayAt(h, me.via).putAct(made.act);
      left++;
    } catch {
      // that home is away
    }
  }
  if (!left) throw new Error('No home took your member key. Your signature stands; the key stays in this app only until it is sent again.');
  return made.id;
}

/** Every member key sealed to `identity` at its homes, opened with the encryption keys an app holds (newest last, by position). */
export async function readMemberKeys(identity: string, secrets: Uint8Array[], homes: string[], via: Via = {}): Promise<MemberKey[]> {
  const out = new Map<string, MemberKey>();
  if (!secrets.length) return [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l: Awaited<ReturnType<typeof lookUp>>;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch {
    return [];
  }
  const at = [...new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          type Opened = { act: Uint8Array; key?: Uint8Array; described: { id: string; signer?: string; public: boolean; spec?: string; type?: number; position?: number; payload?: Uint8Array } };
          let o = null as Opened | null;
          for (const s of secrets) {
            try {
              o = openSealed(it.item, identity, s) as Opened;
              break;
            } catch {
              // the next key
            }
          }
          const d = o?.described;
          if (!o || !d || out.has(d.id) || d.public || d.signer !== identity || d.spec !== MEMBER_KEYS_SPEC || d.type !== MEMBER_KEY || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          // Valid under Identity, or void by a later change of keys that kept it (F57): the key itself is unchanged.
          const st = l.verifier.status(d.id);
          if (st !== 'valid' && st !== 'disputed') continue;
          const x = readPayload(d.payload);
          if (x) out.set(d.id, { ...x, act: d.id, position: d.position ?? 0 });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that home is away
    }
  }
  return [...out.values()].sort((a, b) => a.position - b.position);
}

/**
 * Kišib's part (F353): after the member's own change of keys, every member
 * key sealed to them is sealed again to their new encryption key, the same
 * act, so their apps holding only the new key still open it. Returns how
 * many were sealed again.
 */
export async function resealMemberKeys(identity: string, oldSecrets: Uint8Array[], newKey: Uint8Array, homes: string[], via: Via = {}): Promise<number> {
  let n = 0;
  for (const h of homes) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          for (const s of oldSecrets) {
            try {
              const o = openSealed(it.item, identity, s) as { act: Uint8Array; key?: Uint8Array; described: { spec?: string; type?: number; signer?: string } };
              if (o.described.spec !== MEMBER_KEYS_SPEC || o.described.type !== MEMBER_KEY || o.described.signer !== identity) break;
              await relayAt(h, via).putSealed(sealFor(o.act, o.key, [{ id: identity, key: newKey }]));
              n++;
              break;
            } catch {
              // the next key
            }
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that home is away
    }
  }
  return n;
}

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

/** The terms an act's lineage starts from: its founding. */
async function rootOf(terms: string, hints: string[], via: Via): Promise<string | null> {
  let cur = terms;
  for (let i = 0; i < 64; i++) {
    let a: Uint8Array | null = null;
    for (const h of hints) {
      a = await relayAt(h, via).getAct(cur).catch(() => null);
      if (a) break;
    }
    if (!a) return null;
    const d = describeAct(a) as { payload?: Uint8Array; spec?: string; type?: number };
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) return null;
    const t = readTerms(d.payload, AGREEMENTS_SPECS) as { parent: string | null };
    if (!t.parent) return cur;
    cur = t.parent;
  }
  return null;
}

/** The member key a member's app holds for `collective`: their latest whose founding or clone is that collective's. */
export async function memberKeyFor(keys: MemberKey[], collective: string, hints: string[], via: Via = {}): Promise<MemberKey | null> {
  const { founding } = await foundingOf(collective, hints, via);
  for (const k of [...keys].reverse()) if ((await rootOf(k.terms, hints, via)) === founding) return k;
  return null;
}

/**
 * Where a member's act for the collective stands on its chain (rule 58): the
 * decision it acts under, the collective's latest (its latest record under
 * its latest key, else that key's link), and the strand of this member key
 * (the acts already bound to its signature, in order).
 */
export async function chainFor(collective: string, k: MemberKey, hints: string[], via: Via = {}): Promise<{ decision: string; strand: string[] }> {
  const { links } = await foundingOf(collective, hints, via);
  const latest = links[links.length - 1];
  let decision = latest;
  let best = -1;
  const strand: { id: string; position: number }[] = [];
  for (const a of await allBy(collective, hints, via)) {
    const d = describeAct(a) as { id: string; binding?: string; spec?: string; type?: number; position?: number };
    if (d.binding === latest && d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.record && (d.position ?? 0) > best) {
      best = d.position ?? 0;
      decision = d.id;
    }
    if (d.binding === k.signature && !strand.some((x) => x.id === d.id)) strand.push({ id: d.id, position: d.position ?? 0 });
  }
  return { decision, strand: strand.sort((a, b) => a.position - b.position).map((x) => x.id) };
}

/**
 * An act of the collective signed with a member's key (F353): its signer
 * the collective, its binding the member's signature naming the key, citing
 * the collective's latest decision (rule 58; for a text, its one object,
 * Text rule 14), on the key's own strand.
 */
export function signAsMember(
  collective: string,
  k: MemberKey,
  at: { decision: string; strand: string[] },
  a: { spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[]; objects?: [string, string][]; refs?: (string | [string, string])[] },
): { act: Uint8Array; id: string; key: Uint8Array } {
  const made = makeEveryday({
    signingSecret: k.secret,
    signer: collective,
    binding: k.signature,
    spec: a.spec,
    type: a.type,
    payload: a.payload,
    sequence: at.strand,
    public: a.public,
    to: a.to?.length ? a.to : undefined,
    objects: [...(a.objects ?? []), [collective, at.decision]],
    refs: a.refs?.length ? a.refs : undefined,
  }) as { act: Uint8Array; id: string; key: Uint8Array };
  at.strand.push(made.id);
  return made;
}

/** A signature act of the collective, made with a member's key, naming `act`: the second key an area of two asks for (rule 60, F353). */
export function cosignAsMember(collective: string, k: MemberKey, at: { decision: string; strand: string[] }, act: string): { act: Uint8Array; id: string; key: Uint8Array } {
  return signAsMember(collective, k, at, {
    spec: REPO_SPECS.agreements,
    type: AGREEMENTS_TYPES.signature,
    payload: cborEncode(new Map<number, unknown>([[0, unhex(act)]])),
    public: true,
    objects: [[act, act]],
  });
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

/** Agreements' answer for an act of a collective (`agreementsConsent`), with each area's count: who signed, who with their own key (F353), the limits' verdict. */
export interface ConsentRead {
  kind: string;
  agreement?: string | null;
  reason?: string | null;
  met: boolean;
  areas: { area: number; name: string; frozen: boolean; voices: string[]; needed: number; signers: string[]; byKey: string[]; limits?: string | null; met: boolean }[];
}

/**
 * A verifier holding what a collective's relays and homes hold, as anyone
 * reads them: its chain and acts, the terms of its agreement chain, its
 * parties' acts (their signatures, resignations), and `acts`.
 */
export async function collectiveVerifier(collective: string, hints: string[], via: Via = {}, acts: string[] = []): Promise<{ v: Verifier; founding: string; parties: string[] }> {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const add = (a: Uint8Array) => {
    try {
      v.add(a);
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
  return { v, founding, parties: [...parties] };
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
 * Sign an act of the collective with this member's own key for it, publish
 * it where the collective's acts are, and ask the other holders of the area
 * reaching it for their key where it needs more than one: each sent a
 * negotiation message naming the act and the collective, sealed to them, as
 * Edubba sends a release to sign (F353). Their apps (Dub's Signing tab,
 * Edubba's To sign) sign it with their own keys.
 */
export async function signAndAsk(
  me: TestIdentity,
  collective: string,
  key: MemberKey,
  act: { spec: string; type: number; payload: Uint8Array },
  ask: string[],
  text: string,
  hints: string[],
  via: Via = {},
): Promise<{ act: string; places: string[]; asked: string[]; notAsked: string[] }> {
  const at = await chainFor(collective, key, hints, via);
  const made = signAsMember(collective, key, at, { ...act, public: true });
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
 * signed with the member keys of its area reaching Money type 0, it is
 * scoped and counts where that area's holders and threshold are met. A
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
  for (const a of await allBy(collective, places, via)) {
    const d = describeAct(a) as { id: string; spec?: string; type?: number };
    if (d.spec === MIRS.money && d.type === 0) pointers.push([d.id, true]);
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

/** The layer of an act, as Agreements read it from its spec (Agreements, "Layer"): Envelopes and Text 1, Money 2, Agreements 3, Development 4. */
const LAYER_OF: Record<string, number> = { [MIRS.text]: 1, [MIRS.envelopes]: 1, [MIRS.money]: 2, [MIRS.agreements]: 3, [MIRS.development]: 4 };

/** An area of a collective's agreement in force, as an app shows it. */
export interface AreaHere {
  id: number;
  name: string;
  holders: string[];
  number: number;
}

/**
 * The area of a collective's agreement in force reaching an act of `spec`
 * and `type` (rule 60: a whole layer, or that kind of act); null where none
 * does, or the agreement is not read. With the agreement's id.
 */
export async function areaReaching(collective: string, places: string[], kind: { spec: string; type: number }, via: Via = {}): Promise<{ agreement: string | null; area: AreaHere | null }> {
  const now = await collectiveNow(collective, places, via);
  if (!now.agreement) return { agreement: null, area: null };
  for (const h of places) {
    const a = await relayAt(h, via).getAct(now.agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a) as { payload?: Uint8Array };
    if (!d.payload) break;
    const t = readTerms(d.payload, AGREEMENTS_SPECS) as { areas: { id: number; name: string; holders: string[]; threshold: number; kinds: { form: string; layer?: number | null; spec?: string | null; type?: number | null }[] }[] };
    const x = t.areas.find((r) => r.kinds.some((k) => (k.form === 'layer' && k.layer === LAYER_OF[kind.spec]) || (k.spec === kind.spec && k.type === kind.type)));
    return { agreement: now.agreement, area: x ? { id: x.id, name: x.name, holders: x.holders, number: x.threshold } : null };
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
 * The split service an agreement names (terms field 14; the money messages
 * cMIP, draft 4, 4.4, F357): in a collective, the grantee of its one grant;
 * in a deal, the grantee of the grant `payee` gave (one per payee). Null
 * where it names none, or the grant is not found.
 */
export async function splitServiceOf(agreement: string, payee: string, places: string[], via: Via = {}): Promise<{ service: string; grant: string } | null> {
  const t = (await termsAt(agreement, places, via)) as { splitGrant?: string | null; payeeGrants?: string[] | null } | null;
  if (!t) return null;
  const grants = t.splitGrant ? [t.splitGrant] : (t.payeeGrants ?? []);
  for (const g of grants) {
    for (const h of places) {
      const a = await relayAt(h, via).getAct(g).catch(() => null);
      if (!a) continue;
      const d = describeAct(a) as { signer?: string; payload?: Uint8Array };
      if (!d.payload) break;
      // In a deal, each payee's own grant; in a collective, the collective's one.
      if (!t.splitGrant && d.signer !== payee) break;
      const grantee = (cborDecode(d.payload) as Map<number, unknown>).get(0);
      if (grantee instanceof Uint8Array) return { service: hex(grantee), grant: g };
      break;
    }
  }
  return null;
}
