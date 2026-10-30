// What a person is asked to sign in their own To sign, from Edubba's
// Publishing tab (round 8, F407: the four ways in): a claim made with them,
// a work's ownership agreement naming them, a publication they are a party
// of (or the version that ends one). Read in plain words from the exact
// bytes of each act (Agreements rule 4: what you sign is what you saw).
// Dub's Signing tab and Edubba's To sign call it before their own readings
// (`../../dub/src/signing.ts`, `readProposal`); it returns null for any
// other act, which they read as before.
//
// Nothing here uses Node: the web clients use it as it is.
//
// TEST IDENTITIES ONLY.

import { MIRS, cborDecode, describeAct, hex, readTerms } from '../../genesis/src/core.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import type { Line, Names, Section } from '../../collective/src/explain.ts';

/** A reading as Dub's Signing tab shows it (`Reading` there): kind 'deal' signs every act the proposal names. */
export interface PublishingReading {
  kind: 'deal';
  title: string;
  summary: string[];
  sections: Section[];
  plain: { heading: string; text: string }[];
  risks: { text: string; rests: string }[];
  blocking: string[];
  collective: null;
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  objects?: [string, string][];
}

const pct = (n: number) => `${Number((n / 10_000).toFixed(4))}%`;
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
/** Every invisible control written out, so what is read is what is signed. */
const shown = (s: string) => s.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g, (c) => `[U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}]`);

async function fetchAct(id: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of hints) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (a && (describeAct(a) as Described).id === id) return a;
  }
  return null;
}

type Terms = { parties: string[]; text: string; parent?: string | null; target?: [string, string | null] | null; stakes?: [string | null, [string | null, number][]][] };

/** A work's ownership agreement's terms, or null (a collective's, or no terms). */
function ownership(payload: Uint8Array): Terms | null {
  try {
    const t = readTerms(payload, AGREEMENTS_SPECS) as Terms;
    return t.target?.[0] === 'claim' ? t : null;
  } catch {
    return null;
  }
}

/**
 * The reading of a claim, a work's ownership agreement or a publication
 * proposed to sign, with every other act the proposal names (`also`: a
 * vow's second version); null where the act is none of these.
 */
export async function readPublishingProposal(act: Uint8Array, names: Names, hints: string[], via: Via = {}, also: string[] = []): Promise<PublishingReading | null> {
  const d = describeAct(act) as Described;
  if (!d.public || !d.payload || d.spec !== MIRS.agreements) return null;
  const base = (title: string, summary: string[], sections: Section[], plain: { heading: string; text: string }[] = [], blocking: string[] = []): PublishingReading => ({ kind: 'deal', title, summary, sections, plain, risks: [], blocking, collective: null });
  if (d.type === AGREEMENTS_TYPES.claim) {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const work = m.get(0) instanceof Uint8Array ? hex(m.get(0) as Uint8Array) : '?';
    const creators = ((m.get(1) as Uint8Array[]) ?? []).map(hex);
    return base(
      `A claim to sign: a work made with ${d.signer ? names(d.signer) : '?'}`,
      ['A claim: “we made this”, binding a work’s fingerprint to its creators (Agreements rule 7). It is bound once every creator it names has signed it.', 'It records who said it first on MOR, never who truly made it; it sells nothing, and gives nobody any money.'],
      [{ heading: 'What it names', lines: [{ text: `The work whose fingerprint is ${work.slice(0, 16)}… (its bake, or a vow’s name).` }, { text: `Its creators: ${creators.map(names).join(', ')}.` }, { text: 'Sign only if you made it with them.', tone: 'warn' }] }],
    );
  }
  if (d.type === AGREEMENTS_TYPES.terms) {
    const t = ownership(d.payload);
    if (!t) return null;
    const sections: Section[] = [];
    const blocking: string[] = [];
    let holders = (t.stakes?.[0]?.[1] ?? []).filter((x): x is [string, number] => typeof x[0] === 'string');
    for (const id of also) {
      const a = await fetchAct(id, hints, via);
      const x = a ? (describeAct(a) as Described) : null;
      const c = x?.payload && x.spec === MIRS.agreements && x.type === AGREEMENTS_TYPES.terms ? ownership(x.payload) : null;
      if (!c || c.parent !== d.id) {
        blocking.push(`An act it asks you to sign (${id}) is not a version of this ownership agreement.`);
        continue;
      }
      holders = (c.stakes?.[0]?.[1] ?? []).filter((y): y is [string, number] => typeof y[0] === 'string');
      sections.push({ heading: 'Its second version: the stake shared', lines: [{ text: 'The first version writes the vow’s stake wholly to its signer (Agreements rule 14); the second shares it. You sign both.' }] });
    }
    sections.unshift({ heading: 'Who owns it', lines: holders.map(([id, n]) => ({ text: `${names(id)}: ${pct(n)}.` })) });
    sections.push({ heading: 'Stated costs', lines: [{ text: 'Changing it later needs every owner: nobody’s share is lowered without them (rules 8, 47).', tone: 'warn' }, { text: 'Each publication of the work reads these shares: what it sells, with which partners and through which split service is the publication’s, which you sign separately.' }] });
    return base(
      `An ownership agreement to sign${t.text.startsWith('“') ? `: ${t.text.slice(0, t.text.indexOf('”') + 1)}` : ''}`,
      [`Who owns the work its claim names (${t.target?.[1] ? short(t.target[1]) : '?'}), and what share. Ownership only: no split, no fees, no split service (Agreements rule 7).`, 'It counts once every owner has signed it.'],
      sections,
      [{ heading: 'Its words, which every owner signs', text: shown(t.text) }],
      blocking,
    );
  }
  if (d.type === AGREEMENTS_TYPES.publication) {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const sold = Array.isArray(m.get(0)) ? (m.get(0) as unknown[][]) : null;
    const owners = m.get(1) instanceof Uint8Array ? hex(m.get(1) as Uint8Array) : null;
    const partners = (Array.isArray(m.get(2)) ? (m.get(2) as unknown[]) : []).filter((p): p is Map<number, unknown> => p instanceof Map).map((p) => ({ identity: hex(p.get(0) as Uint8Array), share: Number(p.get(1) ?? 0), label: typeof p.get(2) === 'string' ? (p.get(2) as string) : null }));
    const service = m.get(3) instanceof Uint8Array ? hex(m.get(3) as Uint8Array) : '?';
    const plan = m.get(4) instanceof Map ? (m.get(4) as Map<number, unknown>) : null;
    let referral = 0;
    for (const x of Array.isArray(plan?.get(0)) ? (plan!.get(0) as unknown[][]) : []) if (Array.isArray(x) && x.includes('referral') && typeof x.at(-1) === 'number') referral = x.at(-1) as number;
    const words = typeof m.get(5) === 'string' ? (m.get(5) as string) : null;
    const designated = m.get(10) instanceof Uint8Array ? hex(m.get(10) as Uint8Array) : null;
    const ends = !!sold && sold.length === 0;
    let holders: [string, number][] = [];
    if (owners) {
      const a = await fetchAct(owners, hints, via);
      const x = a ? (describeAct(a) as Described) : null;
      const t = x?.payload ? ownership(x.payload) : null;
      holders = (t?.stakes?.[0]?.[1] ?? []).filter((y): y is [string, number] => typeof y[0] === 'string');
    }
    const lines: Line[] = [];
    for (const s of sold ?? []) {
      if (s[0] === 0 && s[1] instanceof Uint8Array) lines.push({ text: `An upload (a bake), ${short(hex(s[1]))}.` });
      else if (s[0] === 3 && s[1] instanceof Uint8Array) lines.push({ text: `A vow, by its name, ${short(hex(s[1]))}.` });
      else lines.push({ text: 'A delivery proven under a cMIP’s terms.' });
    }
    return base(
      ends ? `The end of a publication to sign, drafted by ${d.signer ? names(d.signer) : '?'}` : `A publication to sign, drafted by ${d.signer ? names(d.signer) : '?'}`,
      ends
        ? ['A later version of a publication that sells nothing: once every party has signed it, the publication is ended for everyone (Agreements rule 11). Past sales stand.']
        : ['The publication is the offer: what is sold, with which partners, through which split service. Every payment goes to its split service, which pays everyone: the partners and a referral off the top, then the owners by their shares.', 'It sells once every party has signed it: each owner, each partner, the split service.'],
      [
        ...(ends ? [] : [{ heading: 'What it sells', lines }]),
        {
          heading: 'Who takes what',
          lines: [
            ...partners.map((p) => ({ text: `${names(p.identity)}${p.label ? ` (“${shown(p.label)}”)` : ''}: ${pct(p.share)} off the top, a partner.` })),
            ...(referral ? [{ text: `Off the top: ${pct(referral)} of each payment to whoever reposted it where the buyer found it.` }] : []),
            { text: owners ? `The rest, to the owners of the ownership agreement ${short(owners)}${holders.length ? `: ${holders.map(([id, n]) => `${names(id)} ${pct(n)}`).join(', ')}` : ' (not found here)'}.` : `The rest, to its drafter, ${d.signer ? names(d.signer) : '?'}, its lone owner.` },
            { text: `Its split service, ${names(service)}, receives every payment and pays everyone.` },
            ...(designated ? [{ text: `${names(designated)} may sign its price tags beside the split service (the party it designates).` }] : []),
          ],
        },
        { heading: 'Stated costs', lines: [{ text: 'The split service sees who pays, how much and for what; it holds the money until it pays each one.', tone: 'warn' }, { text: 'Ending it later takes a version every party signs: no party ends it alone.', tone: 'warn' }] },
      ],
      words ? [{ heading: 'Its words, which every party signs', text: shown(words) }] : [],
    );
  }
  return null;
}
