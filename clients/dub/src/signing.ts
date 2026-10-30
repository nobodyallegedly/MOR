// Dub's Signing tab (H18, decided by Nobody, allegedly: "an optional tab only
// available via settings clearly labeled as even more experimental"): what a
// proposal asks a member to sign, read in plain words from the exact bytes
// of the act it names, before anything is signed. Runs on the Mac and in the
// web client alike: nothing from Node.
//
// What may be proposed: founding terms (Agreements type 0, no parent), a
// clone of a collective's agreement (a member change: type 0 with a
// parent), or a collective's release (an Envelopes publication of the
// release manifest cMIP). Anything else is shown as such, and cannot be
// signed here.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { MIRS, SPECS, cborDecode, describeAct, hex, moneyRead, openMedia, workHash } from '../../genesis/src/core.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { assess } from '../../assess/src/assess.ts';
import { readChanges, readRelease, termsOf, type Line, type Names, type Section } from '../../collective/src/explain.ts';
import { decodeManifest } from '../../repo/src/manifest.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { escapeControls } from '../../connector/src/words.ts';
import { labelOf } from '../../damgar/src/specs.ts';
import { dealName } from '../../grants/src/deal.ts';
import { readPublishingProposal } from '../../grants/src/publishing-read.ts';

/** Said at the top of the Signing tab, and where it is turned on, word for word. */
export const SIGNING_SAY =
  'Even more experimental than Dub itself. Here you sign agreements for real collectives: founding one, changing its members, its releases. A signature binds you, and it is public. Read every proposal in full before signing; when in doubt, decline.';

/** Said where the tab is off and proposals wait. */
export const SIGNING_OFF_SAY = 'Signing is off: proposals to sign wait in your inbox, unread, until you turn Signing on in the identity window.';

/** Said where a share of a collective's chain key is shown, once. */
export const SHARE_SAY = [
  'This is your share of the collective’s chain key: its number and 24 words. Write both on paper, in order, and keep the paper away from anything that goes online.',
  'It is shown once. Dub keeps nothing of it: once you have typed three words back, the one-time key it came sealed to is destroyed, and the copy on the relays can never be opened again.',
  'With enough members’ papers, the collective’s keys can be changed (in Kišib, later). A lost paper weakens that, as the collective’s rule allows; never type these words into Dub again.',
  'It is not your own chain key, nor your signing key, nor a Bitcoin wallet.',
];

export type ProposalKind = 'founding' | 'clone' | 'release' | 'act' | 'deal' | 'other';

/** A proposal read in plain words. */
export interface Reading {
  kind: ProposalKind;
  title: string;
  summary: string[];
  sections: Section[];
  /** Words signed by others, as plain text, every invisible control written out. */
  plain: { heading: string; text: string }[];
  /** The risks the deal-assessment tool flags, each with the rule it rests on. */
  risks: { text: string; rests: string }[];
  /** Why it cannot be signed here, if so. */
  blocking: string[];
  /** For a clone or a release: the collective it concerns. */
  collective: string | null;
}

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  objects?: [string, string][];
}

/** The act a proposal names, fetched by its id from the first place that holds it, and checked to be it. */
export async function fetchAct(id: string, hints: string[], via: Via = {}): Promise<{ act: Uint8Array; at: string } | null> {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a && (describeAct(a) as Described).id === id) return { act: a, at: h };
    } catch {
      // away: the next
    }
  }
  return null;
}

/** Read the act a proposal names, from its exact bytes (Agreements rule 4: what you sign is what you saw). `also`: the other acts a deal's proposal names (its second version, its offer), each read and checked to be the deal's. */
export async function readProposal(act: Uint8Array, names: Names, hints: string[], via: Via = {}, also: string[] = []): Promise<Reading> {
  const d = describeAct(act) as Described;
  const blocking: string[] = [];
  if (!d.public || !d.payload) {
    return { kind: 'other', title: 'A private act', summary: ['It cannot be read here, so it cannot be signed here.'], sections: [], plain: [], risks: [], blocking: ['It is private.'], collective: null };
  }
  // Edubba's Publishing (F407): a claim, a work's ownership agreement, a publication or its ending, read with every act the proposal names.
  const pub = await readPublishingProposal(act, names, hints, via, also);
  if (pub) return pub;
  if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.terms) {
    const a = assess(d.payload, names);
    const t = termsOf(d.payload);
    const parent = t.parent;
    const sections: Section[] = [...a.sections];
    const collective: string | null = null;
    let kind: ProposalKind = 'founding';
    if (parent) {
      kind = 'clone';
      const p = await fetchAct(parent, hints, via);
      const pd = p ? (describeAct(p.act) as Described) : null;
      if (pd?.payload) sections.unshift({ heading: 'What it changes', lines: readChanges(pd.payload, d.payload, names) });
      else blocking.push(`The agreement it changes (${parent}) was not found, so what it changes cannot be shown.`);
    }
    // A deal between separate people (this round): read with every act it asks to sign.
    if (!t.grammar && !parent) return readDealProposal(d, a, names, hints, via, also);
    if (!t.grammar) blocking.push('These terms found no collective: Dub signs collectives’ agreements only.');
    if (a.problem) blocking.push(`Agreements refuse these terms: ${a.problem}`);
    return {
      kind,
      title: kind === 'founding' ? `Found a collective: ${a.title}` : `Change a collective’s agreement: ${a.title}`,
      summary: a.summary,
      sections,
      plain: a.plain.map((x) => ({ heading: x.heading, text: escapeControls(x.text) })),
      risks: a.flags.map((f) => ({ text: f.text, rests: f.rests })),
      blocking,
      collective,
    };
  }
  if (d.spec === SPECS.envelopes && d.type === 0) {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    if (hex(m.get(0) as Uint8Array) !== REPO_SPECS.manifest) {
      return { kind: 'other', title: 'A publication', summary: ['It is no release: nothing to sign here.'], sections: [], plain: [], risks: [], blocking: ['Not a release.'], collective: null };
    }
    const lockedHash = hex(m.get(2) as Uint8Array);
    let manifest = null;
    for (const h of [...new Set([...((m.get(6) as string[]) ?? []), ...hints])]) {
      try {
        const locked = await relayAt(h, via).getMedia(lockedHash);
        if (!locked) continue;
        const plain = openMedia(locked, m.get(5) as Uint8Array, m.get(4) as Uint8Array) as Uint8Array;
        if (workHash(plain) !== hex(m.get(1) as Uint8Array)) continue;
        manifest = decodeManifest(plain);
        break;
      } catch {
        // the next place
      }
    }
    if (!manifest) {
      return { kind: 'release', title: 'A release', summary: ['Its manifest was not found, so what it releases cannot be shown.'], sections: [], plain: [], risks: [], blocking: ['Its manifest was not found.'], collective: d.signer ?? null };
    }
    const files: Line[] = manifest.files.slice(0, 200).map((f) => ({ text: `${f.path}: ${f.size} bytes, fingerprint ${f.work.slice(0, 16)}…` }));
    if (manifest.files.length > 200) files.push({ text: `And ${manifest.files.length - 200} more files.` });
    return {
      kind: 'release',
      title: `Sign a release: ${manifest.name} ${manifest.version}`,
      summary: [
        `Published by the collective ${names(d.signer!)}. It counts as the collective’s release once enough holders of its Releases area have signed it, each with an act of their own (Agreements rule 60).`,
        'Dub cannot compare these files with a copy of your own: sign only if you checked them elsewhere (each file’s fingerprint is listed).',
      ],
      sections: [...readRelease(manifest, null), { heading: `Its files (${manifest.files.length})`, lines: files }],
      plain: [],
      risks: [],
      blocking,
      collective: d.signer ?? null,
    };
  }
  // Round 3 (F353): an act of a collective an area reaches, made with one
  // member's key, waiting for another holder's key (rule 60): read in plain
  // words from its bytes, then signed as the collective with your own key.
  const act2 = actOfCollective(d, names);
  if (act2) return act2;
  return { kind: 'other', title: 'An act Dub does not sign', summary: ['Dub signs founding terms, clones of a collective’s agreement, releases, and a collective’s acts waiting for a second key.'], sections: [], plain: [], risks: [], blocking: ['Not something Dub signs.'], collective: null };
}

/**
 * A deal between separate people, proposed to you (this round; the reading,
 * `docs/splits-reading.md`, question 1): its founding terms, read by the
 * deal-assessment tool, and every other act the proposal names (a vow's
 * second version sharing its stake, the offer selling the work), each read
 * from its exact bytes and checked to belong to the deal. Said first: the
 * work then belongs to the deal, and every payment for it goes to its split
 * service. Signing signs each of them (Agreements rule 47: every party).
 */
async function readDealProposal(d: Described, a: ReturnType<typeof assess>, names: Names, hints: string[], via: Via, also: string[]): Promise<Reading> {
  const blocking: string[] = [];
  const sections: Section[] = [];
  const lines: Line[] = [];
  let version = d.id;
  for (const id of also) {
    const got = await fetchAct(id, hints, via);
    const x = got ? (describeAct(got.act) as Described) : null;
    if (!x?.payload) {
      blocking.push(`An act it asks you to sign (${id}) was not found, so it cannot be read.`);
      continue;
    }
    if (x.spec === REPO_SPECS.agreements && x.type === AGREEMENTS_TYPES.terms) {
      const c = termsOf(x.payload);
      if (c.parent !== d.id) {
        blocking.push(`An act it asks you to sign (${id}) is a version of another agreement.`);
        continue;
      }
      version = x.id;
      const shared = (c.stakes?.[0]?.[1] ?? []).map(([h, n]) => `${h ? names(h) : 'the collective'} ${(n / 10_000).toLocaleString('en')}%`).join(', ');
      sections.unshift({ heading: 'Its second version: the stake shared', lines: [{ text: `The first version writes the vow’s stake wholly to its signer (Agreements rule 14); this second one shares it: ${shared}. You sign both.` }, ...readChanges(d.payload!, x.payload, names)] });
      continue;
    }
    // The deal's publication (Agreements type 6, which replaced the standing offer): its owners the deal, its split service paying everyone; its price a price tag the service signs.
    if (x.spec === REPO_SPECS.agreements && x.type === AGREEMENTS_TYPES.publication) {
      const m = cborDecode(x.payload) as Map<number, unknown>;
      const owners = m.get(1);
      const service = m.get(3);
      if (!(owners instanceof Uint8Array) || (hex(owners) !== d.id && hex(owners) !== version)) {
        blocking.push(`An act it asks you to sign (${id}) is a publication under another ownership agreement.`);
        continue;
      }
      lines.push({ text: `Its publication, always public, its owners this deal${service instanceof Uint8Array ? `, its split service ${names(hex(service))}, which receives every payment and pays everyone` : ''}. Its price is a price tag the split service signs. Every party signs the publication (Agreements, Publication: “every party of it has signed it”).` });
      if (typeof m.get(5) === 'string') lines.push({ text: `Its words: “${escapeControls(m.get(5) as string)}”` });
      continue;
    }
    blocking.push(`An act it asks you to sign (${id}) is neither a version of the deal nor its publication.`);
  }
  if (lines.length) sections.unshift({ heading: 'What it sells', lines });
  if (a.problem) blocking.push(`Agreements refuse these terms: ${a.problem}`);
  return {
    kind: 'deal',
    title: `A shared deal: ${dealName(termsOf(d.payload!).text ?? '') ? `“${dealName(termsOf(d.payload!).text ?? '')}”` : a.title}`,
    summary: [
      'A deal between separate people (no collective): every party signs it, and every version of it.',
      'Before you sign: the work then belongs to the deal, and every payment for it, a tip included, goes to its split service, which divides it and pays each owner by their share. A tip to you personally still goes to your own pointer.',
      ...a.summary,
    ],
    sections: [...sections, ...a.sections],
    plain: a.plain.map((x) => ({ heading: x.heading, text: escapeControls(x.text) })),
    risks: a.flags.map((f) => ({ text: f.text, rests: f.rests })),
    blocking,
    collective: null,
  };
}

/** An act of a collective, in plain words, where Dub can read it: a Money act, a post, a publication, an offer. */
function actOfCollective(d: Described, names: Names): Reading | null {
  if (!d.signer || !d.payload) return null;
  const by = d.binding && d.binding !== d.signer ? ' It was made with one member’s own key (F353).' : '';
  const base = (title: string, lines: string[], plain: { heading: string; text: string }[] = []): Reading => ({
    kind: 'act',
    title,
    summary: [`An act of the collective ${names(d.signer!)}, waiting for your signature: the area that reaches it asks one more key than it has.${by} Signing adds yours, with your own key for this collective where your apps hold it (Agreements rule 60, F353).`],
    sections: [{ heading: 'What it is', lines: lines.map((text) => ({ text })) }],
    plain,
    risks: [],
    blocking: [],
    collective: d.signer!,
  });
  try {
    if (d.spec === MIRS.money) {
      const r = (moneyRead(d.type!, d.payload) as { act: Record<string, unknown> & { type: string } }).act;
      const amount = r.amount as { unit: string; value: number } | undefined;
      const lines = [`A Money act: ${r.type}.`];
      if (amount) lines.push(`Amount: ${amount.value.toLocaleString('en')} in unit ${amount.unit.slice(0, 12)}… (the Bitcoin units Module names regtest satoshis so).`);
      for (const k of ['payer', 'payee', 'debtor', 'creditor'] as const) if (typeof r[k] === 'string') lines.push(`${k[0].toUpperCase()}${k.slice(1)}: ${names(r[k] as string)}.`);
      // A payee pointer (Money draft 10, rule 7, F358): where the collective's money goes, read before signing it.
      if (r.type === 'pointer') {
        const rails = (r.rails ?? []) as { module: string; address: Uint8Array }[];
        lines.push(`Where payments to the collective go from now on (its payee pointer, version ${r.version}${r.previous ? `, replacing ${String(r.previous).slice(0, 12)}…` : ''}):`);
        for (const [i, x] of rails.entries()) lines.push(`Rail ${i + 1}: ${labelOf(x.module) ?? `a rail Module not known here (${x.module.slice(0, 12)}…)`}, address ${hex(new Uint8Array(x.address)).slice(0, 24)}…`);
        lines.push('Signing it with your key counts as your consent in the area reaching Money: check that these rails are the ones the collective agreed (its split service’s, say).');
      }
      return base(`Sign a money act of the collective: ${r.type}`, lines);
    }
    if (d.spec === SPECS.text && d.type === 0) {
      const m = cborDecode(d.payload) as Map<number, unknown>;
      const text = typeof m.get(0) === 'string' ? (m.get(0) as string) : '';
      return base('Sign a post of the collective', ['A post (Text), in the collective’s name.'], [{ heading: 'Its words', text: escapeControls(text) }]);
    }
    if (d.spec === SPECS.envelopes && d.type === 0) return base('Sign an upload of the collective', ['A bake (Envelopes): an upload, in the collective’s name. It carries no price: a price is a price tag.']);
    if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.publication) {
      const m = cborDecode(d.payload) as Map<number, unknown>;
      return base('Sign a publication of the collective', ['A publication (Agreements), always public: what is sold, on which terms, which split service pays everyone. Its price is a price tag naming it.'], typeof m.get(5) === 'string' ? [{ heading: 'Its words', text: escapeControls(m.get(5) as string) }] : []);
    }
  } catch {
    return null;
  }
  return null;
}

/** Whether `member` holds an area in the terms `act` names (F353: a holder names a key of their own in their signature). */
export async function holdsAnArea(act: string, hints: string[], member: string, via: Via = {}): Promise<boolean> {
  const got = await fetchAct(act, hints, via);
  const d = got ? (describeAct(got.act) as Described) : null;
  if (!d?.payload || d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms) return false;
  try {
    return termsOf(d.payload).areas.some((a) => a.holders.includes(member));
  } catch {
    return false;
  }
}
