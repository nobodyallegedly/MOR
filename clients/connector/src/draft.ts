// Drafts: an act prepared for its owner to sign on their own signer, and
// submitted once signed. The connector never holds a key, so it never makes
// an act: it writes down what the act will say (its spec, type, payload,
// references), and the owner's signer, which keeps the owner's sequence,
// makes the act from it and signs it. Then the connector checks that the act
// says exactly what the draft said, and sends it to the relays.
//
// A draft is not an act and not part of the protocol: it is a handoff
// between two programs on the owner's machine (reading 1 in the README). It
// is deterministic CBOR, so its digest names it exactly, and both programs
// show that digest to compare by eye:
//
//   draft = {
//     0: "MOR connector draft, version 1",
//     1: signer,          ; the identity that is to sign it (32 bytes)
//     2: spec,            ; the act's spec hash
//     3: type,
//     4: payload,         ; the payload, as CBOR bytes, exactly as it will be inside
//     5: public,          ; true: the act carries its key
//     ? 6: [* act id],    ; refs
//     ? 7: [* [chain, predecessor]],   ; objects
//     8: [* relay],       ; where the connector sends it once signed
//   }
//
// The reading of a draft (`readDraft`) is made from these bytes alone, by
// whichever program reads them: the connector before handing it over, the
// signer again before signing. Neither trusts the other's words.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkText, cborDecode, cborEncode, describeAct, hex, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { parse, checkBound } from '../../longform/src/format.ts';
import { compose } from '../../longform/src/text.ts';
import { compareWithTree } from '../../repo/src/release.ts';
import { LAW_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { short, type Line, type Section } from '../../collective/src/explain.ts';
import { readAct, fetchFirst, describeChecked, type Told } from './read.ts';
import { countControls, escapeControls, groups } from './words.ts';

export const DRAFT_LABEL = 'MOR connector draft, version 1';

export interface Draft {
  signer: string;
  spec: string;
  type: number;
  payload: Uint8Array;
  public: boolean;
  refs: string[];
  objects: [string, string][];
  relays: string[];
}

const HEX64 = /^[0-9a-f]{64}$/;
const same = (a: Uint8Array, b: Uint8Array) => Buffer.from(a).equals(Buffer.from(b));
const err = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function encodeDraft(d: Draft): Uint8Array {
  const m = new Map<number, unknown>([
    [0, DRAFT_LABEL],
    [1, unhex(d.signer)],
    [2, unhex(d.spec)],
    [3, d.type],
    [4, d.payload],
    [5, d.public],
  ]);
  if (d.refs.length) m.set(6, d.refs.map(unhex));
  if (d.objects.length) m.set(7, d.objects.map(([c, p]) => [unhex(c), unhex(p)]));
  m.set(8, d.relays);
  return cborEncode(m);
}

/** Decode a draft strictly: the exact shape above, nothing else, in its one deterministic encoding. */
export function decodeDraft(bytes: Uint8Array): Draft {
  let m: Map<number, unknown>;
  try {
    m = cborDecode(bytes) as Map<number, unknown>;
  } catch (e) {
    throw new Error(`not a draft: ${err(e)}`);
  }
  if (!(m instanceof Map) || m.get(0) !== DRAFT_LABEL) throw new Error('not a MOR connector draft');
  for (const k of m.keys()) if (![0, 1, 2, 3, 4, 5, 6, 7, 8].includes(k)) throw new Error(`a draft with an unknown field ${k}`);
  const h = (v: unknown, what: string) => {
    if (!(v instanceof Uint8Array) || v.length !== 32) throw new Error(`a draft whose ${what} is not a hash`);
    return hex(v);
  };
  const type = m.get(3);
  const payload = m.get(4);
  const pub = m.get(5);
  const relays = m.get(8);
  if (typeof type !== 'number') throw new Error('a draft whose type is not a number');
  if (!(payload instanceof Uint8Array)) throw new Error('a draft without a payload');
  if (typeof pub !== 'boolean') throw new Error('a draft that does not say whether the act is public');
  if (!Array.isArray(relays) || !relays.length || !relays.every((r) => typeof r === 'string')) throw new Error('a draft that names no relay');
  const refs = m.has(6) ? (m.get(6) as unknown[]) : [];
  const objects = m.has(7) ? (m.get(7) as unknown[]) : [];
  if (!Array.isArray(refs) || !Array.isArray(objects)) throw new Error('a draft whose refs or objects are not lists');
  const d: Draft = {
    signer: h(m.get(1), 'signer'),
    spec: h(m.get(2), 'spec'),
    type,
    payload,
    public: pub,
    refs: refs.map((r) => h(r, 'reference')),
    objects: objects.map((o) => {
      if (!Array.isArray(o) || o.length !== 2) throw new Error('a draft whose objects are not pairs');
      return [h(o[0], 'object'), h(o[1], 'object')] as [string, string];
    }),
    relays: relays as string[],
  };
  if (!same(encodeDraft(d), bytes)) throw new Error('a draft not in its one deterministic encoding');
  return d;
}

/** The draft's digest: SHA-256 of its exact bytes. */
export const draftDigest = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

// ---------------------------------------------------------------- reading a draft

/** What signing a draft means, in plain words, from its bytes alone. */
export interface DraftReading {
  title: string;
  summary: string[];
  sections: Section[];
  /** Words to be signed or signed on, quoted as plain text, invisible controls as escapes. */
  quoted: { heading: string; text: string }[];
  /** Reasons not to sign it. While any remains, a signer refuses. */
  blocking: string[];
  /** The act it signs or refers to, as read now. */
  target?: Told;
}

/**
 * Read a draft. What can be prepared here is small on purpose: a public
 * text act (Text MIP), and a Law signature on a release or an agreement.
 * Anything else is refused (fail closed).
 */
export async function readDraft(d: Draft, hints: string[], via: Via = {}, opts: { checkout: string }): Promise<DraftReading> {
  const who: Line[] = [
    { text: `The identity ${d.signer} signs it, with its own signer, as the next act in its own sequence.` },
    { text: `Once signed, it is sent to ${d.relays.join(', ')}.` },
  ];
  if (d.spec === POST_SPECS.text && d.type === 0) return readTextDraft(d, who, hints, via);
  if (d.spec === REPO_SPECS.law && d.type === LAW_TYPES.signature) return readSignatureDraft(d, who, hints, via, opts.checkout);
  return {
    title: 'An act this connector does not prepare',
    summary: [],
    sections: [{ heading: 'Who signs', lines: who }],
    quoted: [],
    blocking: ['This connector prepares only public text acts and Law signatures on a release or an agreement; it does not sign anything else (fail closed).'],
  };
}

async function readTextDraft(d: Draft, who: Line[], hints: string[], via: Via): Promise<DraftReading> {
  const blocking: string[] = [];
  let p: Map<number, unknown> | null = null;
  try {
    p = cborDecode(d.payload) as Map<number, unknown>;
  } catch (e) {
    blocking.push(`Its payload is not deterministic CBOR: ${err(e)}.`);
  }
  const text = p?.get(0);
  const format = p?.get(1);
  if (typeof text !== 'string') blocking.push('It has no text.');
  if (p && [...p.keys()].some((k) => k !== 0 && k !== 1)) blocking.push('Its payload has fields the Text MIP does not define.');
  if (!d.public) blocking.push('It is private: this connector prepares public texts only, since a private one needs its key delivered.');
  if (d.objects.length) blocking.push('A text act names no objects.');
  const what: Line[] = [];
  if (typeof text === 'string') {
    try {
      checkText(text);
    } catch (e) {
      blocking.push(`Its text is not canonical text (Text MIP, rule 1): ${err(e)}.`);
    }
    if (format === undefined) what.push({ text: 'Plain text: what you read below is exactly what is published.' });
    else if (format instanceof Uint8Array && hex(format) === POST_SPECS.longform) {
      what.push({ text: 'Written in the long-form text format: readers render headings, emphasis and links from it; the plain text below is exactly what is signed.' });
      const breach = checkBound(parse(text));
      if (breach) blocking.push(`The long-form format would show it differently from its bytes (${breach}).`);
    } else blocking.push('It names a format this connector does not implement.');
    const n = countControls(text);
    if (n) what.push({ text: `It contains ${n} invisible character${n > 1 ? 's' : ''} that can make it display in another order than it is written, shown below as <U+…>.`, tone: 'warn' });
  }
  for (const r of d.refs) {
    const t = await readAct(r, hints, via, 0);
    what.push({ text: `It refers to ${t.title.replace(/^A /, 'a ').replace(/^An /, 'an ')} (${short(r)}): ${t.verdict}`, tone: t.counts === false ? 'warn' : undefined });
  }
  what.push({ text: 'It is public: anyone who fetches it can read it, and it cannot be unpublished; a later withdrawal only asks readers not to show it.' });
  return {
    title: 'A text, to be published',
    summary: [`Signing publishes this text, publicly, as the identity ${short(d.signer)}.`],
    sections: [
      { heading: 'Who signs', lines: who },
      { heading: 'What it is', lines: what },
    ],
    quoted: typeof text === 'string' ? [{ heading: 'The text, character for character', text: escapeControls(text) }] : [],
    blocking,
  };
}

async function readSignatureDraft(d: Draft, who: Line[], hints: string[], via: Via, checkout: string): Promise<DraftReading> {
  const blocking: string[] = [];
  const signed = d.objects[0]?.[0];
  if (d.objects.length !== 1 || !signed || d.objects[0][1] !== signed) {
    return { title: 'A signature', summary: [], sections: [{ heading: 'Who signs', lines: who }], quoted: [], blocking: ['A Law signature names exactly one act, as both chain and predecessor (Law, "Signatures").'] };
  }
  if (!same(d.payload, signaturePayload(signed))) blocking.push('Its payload is not the Law signature of the act it names.');
  if (!d.public) blocking.push('A signature on a release or an agreement must be visible: it is private.');
  if (d.refs.length) blocking.push('A signature refers to nothing else.');

  const t = await readAct(signed, [...new Set([...hints, ...d.relays])], via, 0);
  const sections: Section[] = [{ heading: 'Who signs', lines: who }];
  const lines: Line[] = [{ text: t.verdict }];
  let title = `A signature on act ${short(signed)}`;
  let summary: string[] = [];
  if (t.kind === 'release') {
    title = 'A signature on a release';
    summary = [`Signing says that the identity ${short(d.signer)}, as a member, agrees to this release: it counts towards the signatures its collective's agreement asks for.`];
    if (!t.agreement) blocking.push('It was released under one identity’s own name: no member signatures are asked for, so this signature would play no part.');
    else if (!t.parties?.includes(d.signer)) blocking.push(`The identity ${short(d.signer)} is not a member under the agreement the release was made under, so its signature would not count.`);
    if (t.signedBy?.includes(d.signer)) blocking.push('This identity has already signed this release.');
    const other = t.problems.filter((p) => !/^not a release: .* must sign it/.test(p));
    if (other.length) blocking.push(`The release does not verify, apart from its signatures: ${other.join('; ')}.`);
    // Release manifest cMIP, rule 4 (client conformance): every file checked, and compared with the member's own checkout.
    if (t.manifest) {
      if (!existsSync(checkout)) blocking.push(`The checkout to compare it with, ${checkout}, does not exist.`);
      else {
        const c = compareWithTree(t.manifest, checkout);
        if (c.differ.length || c.missing.length) {
          blocking.push(
            `It is not the code in your checkout at ${checkout}: ${c.differ.length} file${c.differ.length === 1 ? '' : 's'} differ, ${c.missing.length} ${c.missing.length === 1 ? 'is' : 'are'} missing (${[...c.differ, ...c.missing].slice(0, 10).join(', ')}). Bring the checkout to the commit the release was made from, or set MOR_CHECKOUT, and look again.`,
          );
        } else lines.push({ text: `Every one of its ${c.same} files is the same as in your checkout at ${checkout}.`, tone: 'ok' });
      }
    }
  } else if (t.kind === 'agreement') {
    title = `A signature on ${t.title.replace(/^An /, 'an ')}`;
    summary = [`Signing binds the identity ${short(d.signer)} to this agreement, as written (Law rule 1). It cannot be taken back: only a clone the parties sign changes it.`];
    if (!t.parties?.includes(d.signer)) blocking.push(`The identity ${short(d.signer)} is not a party to this agreement, so its signature would bind it to nothing.`);
    if (t.signedBy?.includes(d.signer)) blocking.push('This identity has already signed this agreement.');
    if (/^(REPLACED|NOT IN FORCE\.)/.test(t.verdict)) blocking.push(`The agreement cannot come into force: ${t.verdict}`);
    for (const p of t.problems) if (!blocking.some((b) => b.includes(p))) blocking.push(p);
  } else {
    blocking.push(`It signs ${t.title.toLowerCase()}: this connector prepares signatures on releases and agreements only.`);
  }
  sections.push({ heading: 'What it signs', lines }, ...t.sections.map((s) => ({ ...s, heading: `${s.heading} (of the act signed)` })));
  return { title, summary, sections, quoted: t.quoted, blocking, target: t };
}

// ---------------------------------------------------------------- making drafts

/** The signer's identity must be found, so the relays and readers can check what it signs. */
async function checkSigner(signer: string, hints: string[], via: Via): Promise<void> {
  if (!HEX64.test(signer)) throw new Error('the signer is an identity hash: 64 hex digits');
  try {
    await lookUp(signer, hints, via);
  } catch (e) {
    throw new Error(`the identity ${signer} was not found at ${hints.join(', ')}: ${err(e)}`);
  }
}

/**
 * A public text, as the barebone client posts it (Text MIP type 0), in plain
 * text or the long-form format. The text is composed first (Text rule 6),
 * and what composing changed is said.
 */
export async function postDraft(
  opts: { signer: string; text: string; format: 'plain' | 'long-form'; refs?: string[]; relays: string[] },
  hints: string[],
  via: Via = {},
): Promise<{ draft: Draft; changes: string[] }> {
  await checkSigner(opts.signer, hints, via);
  const { text, changes } = compose(opts.text);
  if (!text) throw new Error('the text is empty');
  for (const r of opts.refs ?? []) if (!HEX64.test(r)) throw new Error(`a reference is an act id, 64 hex digits: ${r}`);
  const payload = textPayload(text, opts.format === 'long-form' ? POST_SPECS.longform : null);
  return {
    draft: { signer: opts.signer, spec: POST_SPECS.text, type: 0, payload, public: true, refs: opts.refs ?? [], objects: [], relays: opts.relays },
    changes,
  };
}

/** A Law signature on a release or an agreement: an act of the signer following the act it signs. */
export async function signatureDraft(opts: { signer: string; act: string; relays: string[] }, hints: string[], via: Via = {}): Promise<Draft> {
  await checkSigner(opts.signer, hints, via);
  if (!HEX64.test(opts.act)) throw new Error('the act to sign is an act id: 64 hex digits');
  return {
    signer: opts.signer,
    spec: REPO_SPECS.law,
    type: LAW_TYPES.signature,
    payload: signaturePayload(opts.act),
    public: true,
    refs: [],
    objects: [[opts.act, opts.act]],
    relays: opts.relays,
  };
}

// ---------------------------------------------------------------- the drafts folder

export const draftFile = (dir: string, digest: string) => join(dir, `${digest}.mor-draft`);
/** Where a signer puts the act it signed from a draft. */
export const signedFile = (dir: string, digest: string) => join(dir, `${digest}.mor-act`);

export function saveDraft(dir: string, d: Draft): { digest: string; path: string; bytes: Uint8Array } {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const bytes = encodeDraft(d);
  const digest = draftDigest(bytes);
  const path = draftFile(dir, digest);
  writeFileSync(path, bytes);
  return { digest, path, bytes };
}

/** A draft by its digest, or the first characters of it (at least 8), or by its file's path. */
export function loadDraft(dir: string, which: string): { digest: string; path: string; draft: Draft; bytes: Uint8Array } {
  let path = which;
  if (!existsSync(path)) {
    const w = which.replace(/\s+/g, '').toLowerCase();
    if (!/^[0-9a-f]{8,64}$/.test(w)) throw new Error(`no draft ${which}`);
    const hits = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mor-draft') && f.startsWith(w)) : [];
    if (hits.length !== 1) throw new Error(hits.length ? `more than one draft starts with ${w}` : `no draft ${w} in ${dir}`);
    path = join(dir, hits[0]);
  }
  const bytes = new Uint8Array(readFileSync(path));
  const digest = draftDigest(bytes);
  return { digest, path, draft: decodeDraft(bytes), bytes };
}

// ---------------------------------------------------------------- submitting

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  objects?: [string, string][];
  refs?: string[];
  payload?: Uint8Array;
}

/**
 * Check that a signed act says exactly what its draft said: the same
 * signer, spec, type, payload, references and objects, public, addressed
 * to no one. Returns the act's id. What the signer adds (its sequence, the
 * key that binds it, the salt, the lock) is the signer's.
 */
export function matchDraft(d: Draft, act: Uint8Array): string {
  let x: Described;
  try {
    x = describeAct(act) as Described;
  } catch (e) {
    throw new Error(`not a valid act: ${err(e)}`);
  }
  const differ: string[] = [];
  if (x.signer !== d.signer) differ.push(`it is signed by ${x.signer ?? 'no one'}, not ${d.signer}`);
  if (x.public !== d.public || (d.public && !x.payload)) differ.push('it is not public as drafted');
  if (x.to?.length) differ.push('it is addressed to someone');
  if (x.spec !== d.spec || x.type !== d.type) differ.push('it is of another kind');
  if (!x.payload || !same(x.payload, d.payload)) differ.push('its payload differs');
  if (JSON.stringify(x.refs ?? []) !== JSON.stringify(d.refs)) differ.push('its references differ');
  if (JSON.stringify(x.objects ?? []) !== JSON.stringify(d.objects)) differ.push('its objects differ');
  if (differ.length) throw new Error(`the signed act is not the act drafted: ${differ.join('; ')}. Nothing was sent.`);
  return x.id;
}

export interface Sent {
  id: string;
  standing: string;
  /** What each relay answered. */
  relays: { relay: string; accepted: boolean; answer: string }[];
  /** The act as read back from a relay that accepted it. */
  readBack: Told | null;
}

/**
 * Submit a signed act: check it against its draft, judge it through its
 * signer's identity chain (it must be valid: a relay may hold what does not
 * count, but the connector does not send it), carry the signer's chain acts
 * to each relay so a reader who knows only that relay finds them, send the
 * act, and read it back from a relay that took it.
 */
export async function submit(d: Draft, act: Uint8Array, hints: string[], via: Via = {}): Promise<Sent> {
  const id = matchDraft(d, act);
  const places = [...new Set([...hints, ...d.relays])];
  const l = await lookUp(d.signer, places, via);
  try {
    l.verifier.add(act);
  } catch (e) {
    throw new Error(`the signed act does not check: ${err(e)}. Nothing was sent.`);
  }
  const standing = l.verifier.status(id);
  if (standing !== 'valid') throw new Error(`the signed act is ${standing}, not valid, for its signer's identity chain. Nothing was sent.`);

  const chain: Uint8Array[] = [];
  for (const link of l.resolution.links) {
    const a = await fetchFirst(link.act, [...l.resolution.homes.map((h) => h.hint), ...places], via);
    if (a) chain.push(a);
  }
  const out: Sent = { id, standing, relays: [], readBack: null };
  for (const r of d.relays) {
    const relay = relayAt(r, via);
    for (const c of chain) {
      try {
        await relay.putAct(c);
      } catch {
        // that relay's policy, or it holds it already
      }
    }
    try {
      const got = await relay.putAct(act);
      out.relays.push({ relay: r, accepted: true, answer: got.id === id ? 'accepted' : `answered with another id, ${got.id}` });
    } catch (e) {
      out.relays.push({ relay: r, accepted: false, answer: `refused; the relay said “${err(e).replace(/[\r\n]+/g, ' ').slice(0, 200)}”` });
    }
  }
  const took = out.relays.filter((x) => x.accepted).map((x) => x.relay);
  if (took.length) {
    const back = await fetchFirst(id, took, via);
    if (back) describeChecked(back, id);
    out.readBack = await readAct(id, [...took, ...places.filter((p) => !took.includes(p))], via);
  }
  return out;
}

export { groups };
