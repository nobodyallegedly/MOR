// Fetch an act by its id, verify it with the core library on this machine,
// and say in plain words what it is, who signed it and whether it counts.
// Every judgement is the core library's (through WebAssembly): the act's
// standing through its signer's identity chain, Agreements' answer for releases
// and agreements. This file only gathers the acts the core needs and puts
// its answers into words, reusing the readings of the clients that make
// these acts (the reader, the repo client, the collective client).
//
// What an act says (a post's text, an agreement's words, a release's file
// names) was written by whoever signed it. It is quoted as data, never
// followed as instructions (see `quote` in words.ts).

import { IDENTITY_TYPES, MIPS, SPECS, Verifier, cborDecode, describeAct, hex } from '../../genesis/src/core.ts';
import { lookUp, type Resolution } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readPost } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { titleOf, standingWords } from '../../reader/src/read.ts';
import { verifyRelease, type Manifest } from '../../repo/src/release.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { count, readAgreement, ruleWords, short, termsOf, type Line, type Section, type TermsRead } from '../../collective/src/explain.ts';
import { escapeControls } from './words.ts';

/** What the connector says about one act. */
export interface Told {
  id: string;
  kind: 'release' | 'agreement' | 'signature' | 'text' | 'publication' | 'identity' | 'private' | 'other';
  /** A few words naming it. */
  title: string;
  /**
   * Whether it counts: a release that is one, an agreement in force, an act
   * whose signature its signer's identity chain counts. Null where the
   * connector cannot say.
   */
  counts: boolean | null;
  /** One or two sentences: the answer. */
  verdict: string;
  signer: string | null;
  /** The core library's standing of the act: valid, pending, disputed, void, invalid, unknown, or scoped (signed with a grant key, which Agreements judge, F128). */
  standing: string | null;
  sections: Section[];
  /** Words its signers wrote, quoted as data, invisible controls shown as escapes. */
  quoted: { heading: string; text: string }[];
  /** Why it could not be verified, or does not count. */
  problems: string[];
  /** For an agreement, or a release under one: the parties, and who of them signed. */
  parties?: string[];
  signedBy?: string[];
  /** For a release: its manifest, and the agreement it was released under. */
  manifest?: Manifest;
  agreement?: string;
}

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  objects?: [string, string][];
  refs?: string[];
  payload?: Uint8Array;
}

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function fetchFirst(id: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
      // not reachable: try the next
    }
  }
  return null;
}

/** Every act the relays asked hold signed by `signer`, each relay page by page. */
async function allBy(signer: string, hints: string[], via: Via): Promise<Uint8Array[]> {
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
      // that relay is away: the others may hold them
    }
  }
  return out;
}

/** Decode an act and check it is the one asked for: a relay's answer is never trusted for its id. */
export function describeChecked(act: Uint8Array, id: string): Described {
  const d = describeAct(act) as Described;
  if (d.id !== id) throw new Error(`the relay answered with act ${d.id}, not ${id}`);
  if (d.public && !d.payload) throw new Error('the act carries its key but does not open: it is not a valid act');
  return d;
}

/** One verifier, with each identity looked up once. */
class Judge {
  readonly v = new Verifier(SPECS.identity, MIPS.money, MIPS.agreements);
  private looked = new Map<string, Resolution | null>();
  constructor(
    readonly hints: string[],
    readonly via: Via,
  ) {}

  async lookUp(identity: string): Promise<Resolution | null> {
    if (!this.looked.has(identity)) {
      try {
        this.looked.set(identity, (await lookUp(identity, this.hints, this.via, this.v)).resolution);
      } catch {
        this.looked.set(identity, null);
      }
    }
    return this.looked.get(identity)!;
  }

  async standing(act: Uint8Array, d: Described): Promise<string> {
    if (d.signer) await this.lookUp(d.signer);
    try {
      this.v.add(act);
    } catch {
      return 'invalid';
    }
    return this.v.status(d.id);
  }

  add(acts: Uint8Array[]): void {
    for (const a of acts) {
      try {
        this.v.add(a);
      } catch {
        // a private act, or malformed: it proves nothing here
      }
    }
  }
}

const names = (id: string) => short(id);

function told(id: string, over: Partial<Told>): Told {
  return { id, kind: 'other', title: 'An act', counts: null, verdict: '', signer: null, standing: null, sections: [], quoted: [], problems: [], ...over };
}

/** The standing in words, as the reader says it, with whether it counts. */
function standingLine(s: string): Line {
  const w = standingWords(s);
  return { text: w.words.replace('checked in this browser', 'checked on this machine by the core library'), tone: w.ok ? 'ok' : 'bad' };
}

/**
 * Read one act: fetch it from the first relay that holds it, check it is
 * the act asked for, and say what it is. `depth` limits how far an act
 * that names another (a signature) is followed.
 */
export async function readAct(id: string, hints: string[], via: Via = {}, depth = 1): Promise<Told> {
  const act = await fetchFirst(id, hints, via);
  if (!act) {
    return told(id, {
      title: 'Not found',
      verdict: `The act ${id} was not found at ${hints.join(', ')}. Silence proves nothing: another relay may hold it.`,
      problems: ['not found'],
    });
  }
  let d: Described;
  try {
    d = describeChecked(act, id);
  } catch (e) {
    return told(id, { title: 'Not a valid act', counts: false, verdict: `What the relay served is not a valid act: ${err(e)}.`, problems: [err(e)] });
  }
  const judge = new Judge(hints, via);

  if (!d.public) {
    const standing = await judge.standing(act, d);
    return told(id, {
      kind: 'private',
      title: 'A private act',
      signer: d.signer ?? null,
      standing,
      counts: standing === 'valid',
      verdict: `A private act: its content is locked, and only those it was delivered to can read it. ${standingWords(standing).words}`,
      sections: [{ heading: 'What can be said', lines: [standingLine(standing), ...(d.to?.length ? [{ text: `Addressed to ${d.to.map(names).join(', ')}.` }] : [])] }],
    });
  }
  if (d.spec === POST_SPECS.text && d.type === 0) return text(id, hints, via);
  if (d.spec === SPECS.envelopes && d.type === 0) {
    const media = cborDecode(d.payload!) as Map<number, unknown>;
    const spec = media.get(0);
    if (spec instanceof Uint8Array && hex(spec) === REPO_SPECS.manifest) return release(id, hints, via);
    return publication(act, d, judge, spec instanceof Uint8Array ? hex(spec) : null);
  }
  if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.terms) return agreement(act, d, judge);
  if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.signature) return signature(act, d, judge, depth);
  if (d.spec === SPECS.identity) return identityAct(act, d, judge);

  const standing = await judge.standing(act, d);
  return told(id, {
    signer: d.signer ?? null,
    standing,
    counts: null,
    title: 'An act of a specification this connector does not implement',
    verdict: `An act of type ${d.type} of a specification this connector does not implement (${short(d.spec ?? '')}). It can say who signed it, not what it means. ${standingWords(standing).words}`,
    sections: [{ heading: 'Who signed', lines: [{ text: `Signed by the identity ${d.signer}.` }, standingLine(standing)] }],
  });
}

// ---------------------------------------------------------------- a text act

async function text(id: string, hints: string[], via: Via): Promise<Told> {
  let p;
  try {
    p = await readPost(id, hints, via);
  } catch (e) {
    return told(id, { kind: 'text', title: 'A text act', counts: false, verdict: `A text act that could not be read: ${err(e)}.`, problems: [err(e)] });
  }
  const ok = p.standing === 'valid';
  const lines: Line[] = [{ text: `Signed by the identity ${p.signer}.` }, standingLine(p.standing)];
  const format =
    p.format === POST_SPECS.longform ? 'It is written in the long-form text format (formatted text).' : p.format ? `It names a format this connector does not implement (${short(p.format)}); its text is shown plain.` : 'It is plain text.';
  const refs: Line[] = p.refs.map((r) =>
    r.kind === 'picture'
      ? { text: r.problem ? `It shows a picture (${short(r.publication)}) that is not shown: ${r.problem}.` : `It shows a picture (${short(r.publication)}), ${r.picture?.width}×${r.picture?.height}, verified.`, tone: r.problem ? 'warn' : undefined }
      : { text: `It refers to act ${short(r.id)}: ${r.what}.` },
  );
  return told(id, {
    kind: 'text',
    title: 'A text',
    signer: p.signer,
    standing: p.standing,
    counts: ok,
    verdict: ok ? `A text, verified: its signer's identity chain counts the key that signed it.` : `A text, not verified: ${standingWords(p.standing).words}`,
    sections: [
      { heading: 'Who signed', lines },
      { heading: 'What it is', lines: [{ text: format }, ...refs] },
    ],
    quoted: [
      { heading: 'Its title, as a reader shows it', text: escapeControls(titleOf(p)) },
      { heading: 'The text, as its signer wrote it', text: escapeControls(p.text) },
    ],
  });
}

// ---------------------------------------------------------------- a publication

async function publication(act: Uint8Array, d: Described, judge: Judge, media: string | null): Promise<Told> {
  const standing = await judge.standing(act, d);
  const what = media === POST_SPECS.jpeg ? 'a picture (a JPEG)' : `media of a kind this connector does not implement (${media ? short(media) : 'none named'})`;
  return told(d.id, {
    kind: 'publication',
    title: `A publication of ${what}`,
    signer: d.signer ?? null,
    standing,
    counts: standing === 'valid',
    verdict: `A publication of ${what}. ${standingWords(standing).words}`,
    sections: [{ heading: 'Who signed', lines: [{ text: `Signed by the identity ${d.signer}.` }, standingLine(standing)] }],
  });
}

// ---------------------------------------------------------------- a release

/** A release, verified as a fresh machine does (repo client, step 5a), then read. */
export async function release(id: string, hints: string[], via: Via): Promise<Told> {
  const v = await verifyRelease(id, hints, { via });
  const sections: Section[] = [];
  const quoted: Told['quoted'] = [];
  const who: Line[] = [];
  const t = v.agreement ? await termsAt(v.agreement, hints, via) : null;
  if (v.collective) who.push({ text: `Published by the identity ${v.collective}.` });
  const st = releaseStanding(v);
  if (st) who.push(standingLine(st));
  if (v.agreement) {
    who.push({ text: `It is a collective's release, under its agreement ${short(v.agreement)}, the one the collective's record named as in force when the release was made: a release counts only once ${v.rule} have signed it.` });
    who.push({
      text: v.signers.length ? `Signed by ${v.signers.length} member${v.signers.length > 1 ? 's' : ''}: ${v.signers.map(names).join(', ')}.` : 'No member has signed it.',
      tone: v.signers.length ? undefined : 'warn',
    });
    const yet = (t?.parties ?? []).filter((x) => !v.signers.includes(x));
    if (yet.length) who.push({ text: `Members who have not signed it: ${yet.map(names).join(', ')}.` });
  } else if (v.rule) {
    who.push({ text: `Released under ${v.rule}.` });
  }
  if (who.length) sections.push({ heading: 'Who signed', lines: who });
  if (v.manifest) {
    // Counts only: the release's name, version and source are its signer's words, quoted below.
    const m = v.manifest;
    sections.push({
      heading: 'What is released',
      lines: [
        { text: `${count(m.files.length, 'file')}, and ${count(m.dependencies.length, 'library', 'libraries')} it depends on.` },
        { text: m.previous ? `It follows release ${short(m.previous)}; read that one to see what changed.` : 'It is the first release: it names no release before it.' },
      ],
    });
    quoted.push({ heading: 'Its name, version and source, as the release states them', text: escapeControls(`${v.manifest.name} ${v.manifest.version}${v.manifest.source ? `, from ${v.manifest.source}` : ''}`) });
    sections.push({ heading: 'Files', lines: [{ text: `${v.checked} of ${v.manifest.files.length} files fetched and checked against their fingerprints.`, tone: v.checked === v.manifest.files.length ? 'ok' : 'bad' }] });
  }
  if (t) {
    const r = readAgreement(t, names);
    sections.push({ heading: 'The agreement it was released under', lines: r.sections.flatMap((s) => s.lines) });
    quoted.push({ heading: "The agreement's words", text: escapeControls(t.text) });
  }
  const title = 'A release';
  const unsigned = v.problems.length === 1 && /^not a release: /.test(v.problems[0]);
  const verdict = v.ok
    ? `VERIFIED. It is a release: ${v.agreement ? `${v.rule} signed it, as its collective's agreement asks` : 'signed by its publisher'}, and every one of its ${v.checked} files matches its fingerprint.`
    : unsigned
      ? `NOT A RELEASE YET. Its publisher's signature and all ${v.checked} of its files check, but its collective's agreement asks for ${v.rule} to sign it, and ${v.signers.length === 1 ? '1 signature was' : `${v.signers.length} signatures were`} found at the relays asked.`
      : `NOT VERIFIED. ${v.problems.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('. ')}.`;
  return told(id, {
    kind: 'release',
    title,
    signer: v.collective ?? null,
    standing: releaseStanding(v),
    counts: v.ok,
    verdict,
    sections,
    quoted,
    problems: v.problems,
    parties: t?.parties,
    signedBy: v.signers,
    manifest: v.manifest,
    agreement: v.agreement,
  });
}

/** The publication's standing, as the release verifier found it: it stops at the first check that fails. */
function releaseStanding(v: { collective?: string; problems: string[] }): string | null {
  const m = v.problems.map((p) => /^the publication is (\w+), not valid/.exec(p)).find(Boolean);
  if (m) return m[1];
  if (!v.collective || v.problems.some((p) => /not found|not a public act|not a publication|not a release manifest|has no signer/.test(p))) return null;
  return 'valid';
}

async function termsAt(id: string, hints: string[], via: Via): Promise<TermsRead | null> {
  const a = await fetchFirst(id, hints, via);
  if (!a) return null;
  try {
    const d = describeChecked(a, id);
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms) return null;
    return termsOf(d.payload!);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- an agreement

interface AgreementOut {
  id: string;
  parties: string[];
  signed: string[];
  /** Founding terms and deals: whether it exists. A collective's clone: null, put in force only by the collective's record. */
  exists: boolean | null;
  /** A collective's clone: everyone its mark names, and everyone it adds, has signed it. */
  ready: boolean;
  /** Why Agreements find it invalid against its parent and lineage, if it does. */
  invalid: string | null;
  parent: string | null;
  collective: boolean;
}

/**
 * An agreement (Agreements terms, draft 8): who is bound, what each rule does (the
 * collective client's reading, from the core's own decoding of the bytes),
 * who signed, whether it exists (rules 1 and 45) or, for a collective's
 * clone, whether it is ready for the collective's record to put it in force
 * (rule 37c, F109), and whether a clone found among its parties' acts
 * replaced it.
 */
async function agreement(act: Uint8Array, d: Described, judge: Judge): Promise<Told> {
  let t: TermsRead;
  try {
    t = termsOf(d.payload!);
  } catch (e) {
    return told(d.id, {
      kind: 'agreement',
      title: 'An agreement',
      signer: d.signer ?? null,
      counts: false,
      verdict: `An agreement that cannot be read here: ${err(e)}. Agreements leaves some fields' formats open; terms that use them are not read.`,
      problems: [err(e)],
    });
  }
  const standing = await judge.standing(act, d);
  // The chain of agreements back to the founding one, their parties, and every act of theirs.
  const terms = new Map<string, TermsRead>([[d.id, t]]);
  const parties = new Set<string>(t.parties);
  let p = t.parent;
  while (p && !terms.has(p)) {
    const pa = await fetchFirst(p, judge.hints, judge.via);
    if (!pa) break;
    try {
      const pd = describeChecked(pa, p);
      const pt = termsOf(pd.payload!);
      await judge.standing(pa, pd);
      terms.set(p, pt);
      for (const x of pt.parties) parties.add(x);
      p = pt.parent;
    } catch {
      break;
    }
  }
  const clones: string[] = [];
  for (const party of parties) {
    await judge.lookUp(party);
    const acts = await allBy(party, judge.hints, judge.via);
    judge.add(acts);
    for (const a of acts) {
      try {
        const x = describeAct(a) as Described;
        if (x.spec !== REPO_SPECS.agreements || x.type !== AGREEMENTS_TYPES.terms || !x.payload) continue;
        if (termsOf(x.payload).parent === d.id && !clones.includes(x.id)) clones.push(x.id);
      } catch {
        // not terms this connector reads
      }
    }
  }
  const parent = t.parent ? terms.get(t.parent) ?? null : null;
  const reading = readAgreement(t, names, parent);
  let agreements: AgreementOut | null = null;
  const problems: string[] = [];
  try {
    agreements = judge.v.agreementsAgreement(AGREEMENTS_SPECS, d.id) as AgreementOut;
    if (agreements.invalid) problems.push(`Agreements find it invalid: ${agreements.invalid}`);
  } catch (e) {
    problems.push(`Agreements: ${err(e)}`);
  }
  // A clone replaces it once the clone exists. A collective's clone never
  // exists by signatures alone: the collective's record puts it in force
  // (F109), so it is only said to be ready.
  let replaced: string | null = null;
  const ready: string[] = [];
  for (const c of clones) {
    try {
      const x = judge.v.agreementsAgreement(AGREEMENTS_SPECS, c) as AgreementOut;
      if (x.exists === true) replaced = c;
      else if (x.exists === null && x.ready && !x.invalid) ready.push(c);
    } catch {
      // a broken clone replaces nothing
    }
  }
  if (t.problem) problems.push(`Agreements refuse these terms: ${t.problem}`);

  const signedLines: Line[] = [];
  if (agreements) {
    const missing = t.parties.filter((x) => !agreements!.signed.includes(x));
    signedLines.push({ text: agreements.signed.length ? `Signed by ${agreements.signed.length} of its ${t.parties.length} parties: ${agreements.signed.map(names).join(', ')}.` : 'No party has signed it.' });
    if (missing.length) signedLines.push({ text: `Not signed by ${missing.map(names).join(', ')}: none of it binds them (Agreements rule 1).`, tone: 'warn' });
  }
  signedLines.push({ text: `Proposed by the identity ${d.signer}.` }, standingLine(standing));
  if (t.grammar || t.parent) {
    signedLines.push({ text: "If a collective lives under it, the agreement in force for that collective is the one the collective's own record names, whatever is found here: read the collective's identity to know." });
  }
  if (ready.length) {
    signedLines.push({
      text: `A clone signed by everyone it needs, ready for the collective's record to put it in force: ${ready.map(short).join(', ')}. Until a record names it, this one stays in force (Agreements rule 37c, F109).`,
    });
  }
  const pending = clones.filter((c) => c !== replaced && !ready.includes(c));
  if (pending.length) signedLines.push({ text: `A clone that would replace it is proposed and not yet in force: ${pending.map(short).join(', ')}.` });

  const all = t.parties.length === 1 ? 'its one party' : `all ${t.parties.length} parties`;
  const how = t.parent
    ? `once the parties its mark names, and every party it adds, have signed it (Agreements rule 45)`
    : `once ${t.signing ? ruleWords(t.signing, t.parties, names) : all} have signed it`;
  const collectiveClone = agreements?.exists === null;
  let verdict: string;
  let counts: boolean;
  if (problems.length) {
    counts = false;
    verdict = `NOT IN FORCE. ${problems.join('; ')}.`;
  } else if (replaced) {
    counts = false;
    verdict = `REPLACED. It came into force, and has since been replaced by the clone ${replaced}, which its parties signed (Agreements rule 45).`;
  } else if (collectiveClone) {
    counts = false;
    verdict = agreements!.ready
      ? `NOT IN FORCE YET: READY TO BE RECORDED, as far as the relays asked show. Everyone it needs has signed it; a collective's clone comes into force only when the collective's own record names it (Agreements rule 37c, F109). Read the collective's identity to know which agreement its record names.`
      : `NOT IN FORCE YET, as far as the relays asked show. It is a collective's clone: it comes into force ${how}, and then only when the collective's own record names it (Agreements rule 37c, F109).`;
  } else if (agreements?.exists) {
    counts = true;
    verdict = `IN FORCE, as far as the relays asked show. It exists ${how.replace(/^once/, 'since')}, and no clone replacing it was found among its parties' acts there (a relay's silence proves nothing).`;
  } else {
    counts = false;
    verdict = `NOT IN FORCE YET, as far as the relays asked show. It comes into force ${how}.`;
  }
  return told(d.id, {
    kind: 'agreement',
    title: t.parent ? 'An agreement: a clone' : t.grammar ? "An agreement: a collective's founding agreement" : 'An agreement',
    signer: d.signer ?? null,
    standing,
    counts,
    verdict,
    sections: [{ heading: 'Who signed', lines: signedLines }, ...reading.sections],
    quoted: [{ heading: 'Its words, as written', text: escapeControls(t.text) }],
    problems: [...problems, ...reading.blocking.filter((b) => !problems.some((p) => b.includes(p)))],
    parties: t.parties,
    signedBy: agreements?.signed ?? [],
  });
}

// ---------------------------------------------------------------- a signature

/** An Agreements signature: who signs which act; that act read in turn. */
async function signature(act: Uint8Array, d: Described, judge: Judge, depth: number): Promise<Told> {
  const standing = await judge.standing(act, d);
  const signed = d.objects?.[0]?.[0] ?? null;
  const lines: Line[] = [{ text: `Signed by the identity ${d.signer}.` }, standingLine(standing)];
  let of = signed ? `act ${short(signed)}` : 'an act it does not name';
  const sections: Section[] = [{ heading: 'Who signed', lines }];
  if (signed && depth > 0) {
    const inner = await readAct(signed, judge.hints, judge.via, depth - 1);
    of = `${inner.title.replace(/^A /, 'a ').replace(/^An /, 'an ')} (${short(signed)})`;
    sections.push({ heading: 'What it signs', lines: [{ text: inner.verdict }] });
    if (inner.kind === 'agreement' || inner.kind === 'release') {
      sections.push({
        heading: 'Whether this signature plays a part',
        lines: [{ text: 'A signature counts only while its signer’s chain counts it, and only from a party the agreement names (Agreements rules 1, 36). Read the act it signs for the full answer.' }],
      });
    }
  }
  return told(d.id, {
    kind: 'signature',
    title: `A signature on ${of}`,
    signer: d.signer ?? null,
    standing,
    counts: standing === 'valid',
    verdict: `A signature (Agreements): the identity ${short(d.signer ?? '')} signs ${of}. ${standingWords(standing).words}`,
    sections,
  });
}

// ---------------------------------------------------------------- identities

const CHAIN_NAMES: Record<number, string> = {
  [IDENTITY_TYPES.genesis]: 'the genesis of an identity',
  [IDENTITY_TYPES.rotation]: 'a rotation (new keys or homes) of an identity',
  [IDENTITY_TYPES.receipt]: "a home's receipt",
  [IDENTITY_TYPES.routes]: 'the routes of an identity (where its acts are found)',
};

async function identityAct(act: Uint8Array, d: Described, judge: Judge): Promise<Told> {
  const what = CHAIN_NAMES[d.type ?? -1] ?? `an Identity act of type ${d.type}`;
  const who = d.signer ?? d.id;
  const told_ = await identity(who, judge.hints, judge.via, judge);
  const standing = d.type === IDENTITY_TYPES.genesis ? null : await judge.standing(act, d);
  return told(d.id, {
    kind: 'identity',
    title: what.charAt(0).toUpperCase() + what.slice(1),
    signer: who,
    standing,
    counts: standing ? standing === 'valid' : told_.counts,
    verdict: `This is ${what}${d.type === IDENTITY_TYPES.receipt ? '' : ` (${short(who)})`}. ${told_.verdict}`,
    sections: told_.sections,
  });
}

/** Look an identity up at its homes and say what its chain shows (Identity, "Reaching an identity"). */
export async function identity(id: string, hints: string[], via: Via = {}, judge = new Judge(hints, via)): Promise<Told> {
  const r = await judge.lookUp(id);
  if (!r) return told(id, { kind: 'identity', title: 'An identity', counts: false, verdict: `The identity ${id} was not found at ${hints.join(', ')}.`, problems: ['not found'] });
  const lines: Line[] = [
    { text: `Its identity chain has ${r.links.length === 1 ? '1 act that counts' : `${r.links.length} acts that count`}: the genesis${r.links.length > 1 ? ` and ${r.links.length - 1} rotation${r.links.length > 2 ? 's' : ''}` : ''}.` },
    { text: `Its homes: ${r.homes.map((h) => h.hint).join(', ') || 'none named'}.` },
  ];
  const stop: Record<string, [string, Line['tone']]> = {
    end: ['Its chain is settled: every act in it counts.', 'ok'],
    pending: ['A rotation is waiting for its homes to confirm it: until they do, the earlier key still counts.', 'warn'],
    contested: ['Its chain is contested: two rotations compete, and acts after the fork are not settled.', 'bad'],
    invalid: ['Its chain is broken: an act in it does not check.', 'bad'],
    'no-genesis': ['Its genesis was not found.', 'bad'],
    unknown: ['Its chain could not be judged.', 'bad'],
  };
  const [w, tone] = stop[r.stop] ?? [`Its chain stops: ${r.stop}.`, 'warn'];
  lines.push({ text: w, tone });
  const latest = r.links.at(-1);
  let declared: string | null = null;
  if (latest) {
    try {
      declared = judge.v.agreementsDeclared(AGREEMENTS_SPECS, id, latest.act) ?? null;
    } catch {
      declared = null;
    }
  }
  if (declared) {
    lines.push({ text: `It is a collective: it declares that it lives under the agreement ${declared} (Agreements).` });
    lines.push({ text: 'That is the agreement in force for it: for a collective, the one its record names, as far as the relays asked show.' });
  }
  return told(id, {
    kind: 'identity',
    title: declared ? 'A collective' : 'An identity',
    signer: id,
    counts: r.stop === 'end' || r.stop === 'pending',
    verdict: `${declared ? 'A collective' : 'An identity'} found at its homes. ${w}`,
    sections: [{ heading: 'Its identity chain', lines }],
  });
}
