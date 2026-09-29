// Law acts as the test collective makes them (Law draft 6): terms, whether a
// founding agreement or a clone of one, and signature acts. The payloads are
// built here and checked by the core library (`checkTerms`) before anything
// is signed; the core library alone judges them afterwards.

import { cborEncode, checkTerms, signaturePayload, unhex } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { LAW_TYPES, REPO_SPECS } from './specs.ts';

/** `rule`: every party, any k of them, or named ones. */
export type Rule = { all: true } | { threshold: number } | { named: string[] };

const ruleValue = (r: Rule): unknown[] =>
  'all' in r ? [0] : 'threshold' in r ? [1, r.threshold] : [2, r.named.map(unhex)];

/** A founding agreement for a collective, or a clone of one (Law draft 6). */
export interface CollectiveTerms {
  /** The members, in order: the parties. */
  parties: string[];
  /** The terms in words, as canonical text. What every member reads before signing. */
  text: string;
  /** Which signatures make a clone complete (member changes). */
  clone: Rule;
  /** Who holds the collective's everyday signing key. */
  signingHolder: string;
  /** The safety key as shares: any `threshold` of these members rebuild it. */
  safety: { threshold: number; members: string[] };
  /** Act types that also require visible member signature acts, and which. */
  listed: { spec: string; type: number; rule: Rule }[];
  /** Who decides absence: a threshold of the other parties. */
  abandonment: { others: number; outcomes: number[] };
  /** Extensions: cMIPs outside the listed tasks (the release manifest cMIP). */
  extensions: string[];
  /** For a clone: the agreement it replaces. */
  parent?: string;
}

/** The terms payload, as CBOR, checked by the core library. */
export function termsPayload(t: CollectiveTerms): Uint8Array {
  const grammar = new Map<number, unknown>([
    [0, [0, unhex(t.signingHolder)]],
    [1, [1, t.safety.threshold, t.safety.members.map(unhex)]],
    [2, t.listed.map((l) => [unhex(l.spec), l.type, ruleValue(l.rule)])],
  ]);
  const m = new Map<number, unknown>([
    [0, t.parties.map(unhex)],
    [1, t.text],
    [2, new Map()],
    [4, [0]],
    [5, ruleValue(t.clone)],
    [9, new Map<number, unknown>([
      [0, [1, t.abandonment.others]],
      [1, t.abandonment.outcomes],
    ])],
    [12, grammar],
    [15, t.extensions.map(unhex)],
  ]);
  if (t.parent) m.set(11, unhex(t.parent));
  const payload = cborEncode(m);
  checkTerms(payload);
  return payload;
}

/**
 * Carry an identity's chain acts (genesis, rotations: the same bytes) to the
 * relays it publishes on, so a reader who knows only a relay finds its
 * genesis, and from it its homes. Any relay may carry them; a refusal is
 * the relay's policy.
 */
export async function carryChain(by: TestIdentity, relays: string[]): Promise<void> {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
        // that relay's policy, or it is away
      }
    }
  }
}

/** Propose terms: an act of the proposer, public so anyone can check the collective. */
export async function propose(by: TestIdentity, t: CollectiveTerms, relays: string[]) {
  const objects: [string, string][] | undefined = t.parent ? [[t.parent, t.parent]] : undefined;
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.terms, termsPayload(t), { public: true, relays, objects });
}

/** Sign an act: a Law signature act that follows the act it signs. */
export async function sign(by: TestIdentity, act: string, relays: string[]) {
  await carryChain(by, relays);
  return by.publish(REPO_SPECS.law, LAW_TYPES.signature, signaturePayload(act), {
    public: true,
    relays,
    objects: [[act, act]],
  });
}
