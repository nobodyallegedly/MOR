// The core's objects written for people (Identity draft 14, "Written for
// people"; F349): bech32m, lowercase, a label per kind of thing hashed
// (`mid`, `mact`, `mkey`, `mspec`, `mwork`), a checksum; the where-it-lives
// form adds `?r=` hints outside the checksum; bare hex stays accepted. The
// encoding and every check is the core library's (`formEncode`,
// `formRead`, `formWithHints`); this file only names them for the apps.
//
// Every app shows the forms and takes them, and bare hex, wherever a person
// copies or types an identity, an act, a key, a specification or a work.

import { cborEncode, formEncode, formRead, formWithHints, unhex } from './core.ts';
import { Refused } from '../../../modules/carry/src/carry.ts';

export type Label = 'mid' | 'mact' | 'mkey' | 'mspec' | 'mwork';

/** An object's short form, from its hex. */
export const form = (label: Label, hex: string): string => formEncode(label, unhex(hex)) as string;
export const idForm = (id: string) => form('mid', id);
export const actForm = (id: string) => form('mact', id);
export const specForm = (hash: string) => form('mspec', hash);
export const workForm = (hash: string) => form('mwork', hash);

/** A public key's form: Identity's `[scheme, key]`, deterministic CBOR (scheme 1, a signing key; 4, an X-Wing encryption key). */
export const keyForm = (scheme: number, key: string): string => formEncode('mkey', cborEncode([scheme, unhex(key)])) as string;

/** An identity with where it lives: the short form, then each hint (one of its homes, a relay) after `?r=`. */
export const idWhere = (id: string, hints: string[]): string => formWithHints('mid', unhex(id), hints.filter((h) => /^https?:\/\//.test(h))) as string;

export interface FormRead {
  hex: string;
  hints: string[];
  bare: boolean;
}

/**
 * Read what a person typed or pasted where `want` is asked: its short form,
 * its where-it-lives form, or hex (spaces in it ignored, as an ID written
 * in groups of four). Refused, in the core library's words, otherwise: a
 * checksum broken, mixed case, another label, another kind ("this is an act
 * (mact), not an identity (mid)").
 */
export function readForm(typed: string, want: Label): FormRead {
  const t = typed.trim();
  const squeezed = t.replace(/\s+/g, '');
  if (want !== 'mkey' && /^[0-9a-fA-F]{64}$/.test(squeezed)) return { hex: squeezed.toLowerCase(), hints: [], bare: true };
  try {
    const r = formRead(t, want) as { data: string; hints: string[]; bare: boolean };
    return { hex: r.data, hints: r.hints, bare: r.bare };
  } catch (e) {
    throw new Refused(e instanceof Error ? e.message : String(e));
  }
}

/** An identity, as typed: its `mid` form or its hex (64 characters, spaces ignored). */
export const readId = (typed: string): string => readForm(typed, 'mid').hex;
/** An act, as typed: its `mact` form or its hex. */
export const readActId = (typed: string): string => readForm(typed, 'mact').hex;
/** A specification, as typed: its `mspec` form or its hex. */
export const readSpec = (typed: string): string => readForm(typed, 'mspec').hex;

/**
 * An identity with where it lives, as typed (H38): its where-it-lives form
 * (`mid1…?r=https://…`), or an ID (form or hex) with a home address beside
 * it ("ID https://home…"), or a reader-style link's `#ID?r=…`. The hints
 * guide where to look first; they never decide (Envelopes rule 6).
 */
export function readIdWhere(typed: string): { id: string; hints: string[] } {
  const t = typed.trim().replace(/^.*#/, '');
  const parts = t.split(/\s+/).filter(Boolean);
  const beside = parts.slice(1).filter((p) => /^https?:\/\//.test(p));
  const head = beside.length ? parts.filter((p) => !/^https?:\/\//.test(p)).join('') : t;
  const r = readForm(head, 'mid');
  return { id: r.hex, hints: [...new Set([...r.hints, ...beside])] };
}
