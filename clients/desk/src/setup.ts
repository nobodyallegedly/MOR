// The Identities tab as an identity setup page (F333, decided by Nobody,
// allegedly: "ok, so it becomes an identity setup page of sorts, and release
// for the people that could need it"). For the identity selected:
//
// - its record, in plain words: where it lives (its homes), where its acts
//   and its inbox are (its routes), its keys (signing, chain, encryption), its
//   display names, and every line of its acts with the latest act, position
//   and summary a rotation must be given to keep it (Identity rule 35; MOR
//   Safety will need them);
// - bringing an identity made elsewhere, by its ID and its signing key's
//   words (H15; the identity carry Module, draft 2, as Dub does);
// - relying on an act: a witness act (Identity type 15, F110), read back in
//   plain words and signed only once RELY is typed, as the genesis client's
//   command does (Identity rule 18c);
// - a release under its own name (H16): the folder chosen at each release,
//   every file listed with its size and fingerprint, and the libraries it
//   depends on, before anything is signed; the release before it chosen by
//   hand, pre-set to the last of the same name (decided by Nobody,
//   allegedly).
//
// TEST IDENTITIES ONLY: every key is held in software in Edubba's folder.

import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { IDENTITY_TYPES, SPECS, base64, cborDecode, describeAct, hex, sha256, signingPublic, unhex, workHash } from '../../genesis/src/core.ts';
import { TestIdentity, TEST_LABEL, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { lineWords, whatIs } from '../../genesis/src/lines.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { WITNESS_EXPLANATION } from '../../genesis/src/witness.ts';
import { Refused, fromWords, readId } from '../../../modules/carry/src/carry.ts';
import { carriedKey, lookCurrent, servedChain } from '../../dub/src/carryin.ts';
import { namesOf } from '../../dub/src/names.ts';
import { decodeManifest, gitSource, prepareRelease, publishPrepared, validPath, type FileIn, type Manifest, type Prepared, type Publisher } from '../../repo/src/release.ts';
import { readRelease } from '../../collective/src/explain.ts';
import { escapeControls } from '../../connector/src/words.ts';
import type { Desk, Done } from './desk.ts';
import type { Line } from '../../collective/src/explain.ts';
import type { OwnRelease, Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** What typing confirms a witness act, as the genesis client's command asks it. */
export const RELY = 'RELY';

/** Said where an identity is brought in (the carry Module, 5.1; Identity rule 35), as Dub says it. */
export const BRING_LINE_SAY =
  'Edubba keeps its own line of acts for this identity. If its signing key is ever changed (with the chain key, in MOR Safety), that change must keep this line, or every act signed here becomes void. Its record, on this tab, shows this line’s latest act, position and summary.';

/** One section of the record, in plain words. */
export interface RecordSection {
  heading: string;
  lines: Line[];
}

/** A line of acts, for a rotation to keep (Identity rule 35): its card, ready to copy. */
export interface RecordLine {
  own: boolean;
  readable: boolean;
  words: string;
  card: { act: string; position: number; summary: string } | null;
}

export interface IdentityRecord {
  id: string;
  kind: 'made' | 'brought';
  sections: RecordSection[];
  lines: RecordLine[];
  problems: string[];
}

/** A file of a release, as listed before anything is signed. */
export interface ListedFile {
  path: string;
  size: number;
  /** Its work hash, the fingerprint the manifest names. */
  fingerprint: string;
}

/** A release prepared and read back, not signed. */
export interface ReleaseReview {
  plan: string;
  digest: string;
  title: string;
  summary: string[];
  sections: RecordSection[];
  files: ListedFile[];
  dependencies: { registry: string; name: string; version: string }[];
  skipped: string[];
  blocking: string[];
}

interface ReleasePlan {
  identity: string;
  folder: string;
  how: 'git' | 'plain';
  prepared: Prepared;
  previous: string | null;
  digest: string;
  expires: number;
  blocking: string[];
}

/** How long a review stays good to sign, in milliseconds (as the collective client's). */
const PLAN_FOR = 15 * 60 * 1000;

import { folderOf } from './folders.ts';
export { folderOf };

/** Whether git tracks this folder: it is inside a git working tree. */
function inGit(folder: string): boolean {
  try {
    return execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: folder, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === 'true';
  } catch {
    return false;
  }
}

/**
 * The files a release of `folder` publishes (H16, decided by Nobody,
 * allegedly): in a git folder, every file git tracks there, as it is on disk;
 * in a plain folder, every file but hidden ones (a name starting with a dot,
 * and everything inside a hidden folder). Links are not followed: listed as
 * skipped, with why.
 */
export function filesOf(folder: string): { how: 'git' | 'plain'; files: FileIn[]; skipped: string[] } {
  const skipped: string[] = [];
  const byBytes = (a: FileIn, b: FileIn) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path));
  if (inGit(folder)) {
    const listed = execFileSync('git', ['ls-files', '-z'], { cwd: folder })
      .toString('utf8')
      .split('\0')
      .filter(Boolean);
    const files: FileIn[] = [];
    for (const p of listed) {
      const full = join(folder, p);
      if (!existsSync(full)) {
        skipped.push(`${p}: tracked by git, but not in the folder`);
        continue;
      }
      const st = lstatSync(full);
      if (!st.isFile()) {
        skipped.push(`${p}: ${st.isSymbolicLink() ? 'a link' : 'not a file'}, not followed`);
        continue;
      }
      files.push({ path: p, bytes: new Uint8Array(readFileSync(full)) });
    }
    return { how: 'git', files: files.sort(byBytes), skipped };
  }
  const files: FileIn[] = [];
  const walk = (dir: string, rel: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (e.name.startsWith('.')) continue;
      const p = rel ? `${rel}/${e.name}` : e.name;
      if (e.isSymbolicLink()) skipped.push(`${p}: a link, not followed`);
      else if (e.isDirectory()) walk(join(dir, e.name), p);
      else if (e.isFile()) files.push({ path: p, bytes: new Uint8Array(readFileSync(join(dir, e.name))) });
      else skipped.push(`${p}: not a file`);
    }
  };
  walk(folder, '');
  return { how: 'plain', files: files.sort(byBytes), skipped };
}

export class Setup {
  private plans = new Map<string, ReleasePlan>();

  constructor(
    readonly desk: Desk,
    readonly store: Store,
  ) {}

  private get via() {
    return this.store.settings().via;
  }

  private hintsFor(me: TestIdentity): string[] {
    const s = this.store.settings();
    return [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  private entry(id: string) {
    const e = this.store.book().identities.find((x) => x.id === id);
    if (!e) throw new Error(`Edubba does not hold ${id}`);
    return e;
  }

  // ------------------------------------------------------------ the record

  /**
   * The identity's record, in plain words, as its homes and relays show it
   * now: nothing here is signed. What could not be read is said, never
   * guessed.
   */
  async record(id: string): Promise<IdentityRecord> {
    const e = this.entry(id);
    const me = this.store.identity(id);
    const hints = this.hintsFor(me);
    const problems: string[] = [];
    const sections: RecordSection[] = [];
    const kind = e.kind ?? 'made';
    sections.push({
      heading: 'Where it came from',
      lines: [
        kind === 'made'
          ? { text: 'Made here, by Edubba. Its chain key is held in this program’s folder, in software, as every test identity’s is: a prototype, never for a real identity.' }
          : { text: 'Made elsewhere, brought here by its signing key’s words. Its chain key is not here: changing its keys is MOR Safety’s work, with the chain key’s words.' },
      ],
    });
    let look: Awaited<ReturnType<typeof lookUp>> | null = null;
    try {
      look = await lookUp(id, hints, this.via);
    } catch (x) {
      problems.push(`Its homes did not answer (${err(x)}): what it publishes cannot be shown now. Edubba’s own copy is shown.`);
    }
    const r = look?.resolution;
    const homes = r?.homes ?? me.f.homes;
    sections.push({
      heading: 'Its homes: where it lives, and anyone can check it',
      lines: [
        ...homes.map((h) => ({ text: `${h.hint}${h.operator ? `, run by ${short(h.operator)}` : ', run by itself'}` })),
        ...(look?.unreachable.length ? [{ text: `Did not answer now: ${look.unreachable.join(', ')}.`, tone: 'warn' as const }] : []),
      ],
    });
    const routes = look?.routes.routes ?? [];
    const out = [...new Set(routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints))];
    const inbox = [...new Set(routes.filter((x) => x.kind === 1).flatMap((x) => x.hints))];
    sections.push({
      heading: 'Its routes: where its acts are, and its inbox',
      lines: look
        ? [
            { text: out.length ? `Its acts are published at ${out.join(', ')}.` : 'It names no place for its acts: they are found at its homes.' },
            { text: inbox.length ? `Its inbox is at ${inbox.join(', ')}: messages for it are left there.` : 'It declares no inbox: nothing can be delivered to it.', tone: inbox.length ? undefined : 'warn' },
            ...(look.routes.act ? [{ text: `Declared by act ${look.routes.act}.` }] : []),
            ...(look.routes.contested ? [{ text: 'Two versions of its routes contest each other: readers cannot tell which counts.', tone: 'bad' as const }] : []),
          ]
        : [{ text: 'Not read.' }],
    });
    const held = hex(signingPublic(unhex(me.f.signingSecret)));
    const keys: Line[] = [];
    if (r) {
      const position = r.links.length ? r.links[r.links.length - 1].position : null;
      keys.push(
        r.signingKey && hex(r.signingKey) === held
          ? { text: `Signing key: the one Edubba holds, current${position !== null ? ` (key position ${position}, bound by ${r.links[r.links.length - 1].act})` : ''}.`, tone: 'ok' }
          : { text: 'Signing key: changed elsewhere. The one Edubba holds no longer counts: nothing more is signed with it here.', tone: 'bad' },
      );
      keys.push({ text: `Chain key: committed as ${r.chainKeyCommit ?? 'unknown'} (scheme ${r.chainKeyScheme ?? '?'}). ${me.f.safety.seeds ? 'Held in this program’s folder (a test identity).' : 'Not held here.'}` });
      if (r.stop !== 'end') keys.push({ text: `Its chain reads as “${r.stop}”.`, tone: r.stop === 'contested' ? 'bad' : 'warn' });
      if (r.waiting.length) keys.push({ text: `A change of its keys is waiting for its homes: ${r.waiting.join(', ')}.`, tone: 'warn' });
    } else keys.push({ text: `Signing key: ${short(held)}, as Edubba holds it.` });
    const enc = me.f.encryption.at(-1);
    if (look?.encryptionKeyAct) {
      const ours = me.f.encryption.some((x) => x.act === look!.encryptionKeyAct);
      keys.push({
        text: `Encryption key: published by ${look.encryptionKeyAct}. ${ours ? 'Edubba holds it: messages sealed to it open here.' : 'Edubba does not hold it: messages sealed to it cannot be opened here.'}`,
        tone: ours ? undefined : 'warn',
      });
    } else keys.push({ text: enc ? `Encryption key: version ${enc.version} held here, not found published now.` : 'Encryption key: none published: private messages cannot be sealed to it.', tone: 'warn' });
    sections.push({ heading: 'Its keys', lines: keys });
    try {
      const names = (await namesOf(id, hints, this.via)).map((n) => n.name);
      sections.push({
        heading: 'Its display names (the naming cMIP)',
        lines: [{ text: names.length ? `${names.map((n) => `“${n}”`).join(', ')}: shown beside its fingerprint, never instead of it. Anyone may take the same name.` : 'None published: its fingerprint alone.' }],
      });
    } catch (x) {
      problems.push(`Its display names could not be read: ${err(x)}.`);
    }
    let lines: RecordLine[] = [];
    try {
      lines = (await me.lines({ hints })).map((l) => ({ own: l.own, readable: l.readable, words: lineWords(l), card: l.card }));
    } catch (x) {
      problems.push(`Its lines of acts could not be read: ${err(x)}.`);
    }
    return { id, kind, sections, lines, problems };
  }

  // ------------------------------------------------------------ bringing an identity (H15)

  /**
   * Bring an identity made elsewhere (H15; the identity carry Module,
   * draft 2, section 4, as Dub does): its ID and its signing key's words; read
   * from its homes, starting at `address`, and kept only if the words give
   * its current signing key; with its encryption key where the words carry
   * the one that counts. Edubba starts its own line. Nothing is signed or
   * published: it publishes no routes and no encryption key (versioned acts
   * another app wrote).
   */
  bring(a: { name: string; id: string; words: string; address: string; linked: boolean }): Promise<Done> {
    const name = a.name.trim();
    if (!name) return Promise.reject(new Error('Give it a name, so you can tell it apart here. The name stays on this Mac unless you link it to Claude.'));
    return this.desk.serial(async () => {
      let id: string;
      let seed: Uint8Array;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      if (this.store.holds(id)) throw new Error('Edubba already holds this identity.');
      const s = this.store.settings();
      const address = a.address.trim();
      if (address && !/^https?:\/\//.test(address)) throw new Error('An address where it is found starts with https:// (or http://).');
      const hints = [...new Set([...(address ? [address] : []), ...s.relays, ...s.homes.map((h) => h.hint)])];
      if (!hints.length) throw new Error('Give an address where this identity is found (one of its homes), or name homes under Settings.');
      const look = await lookCurrent(id, seed, hints, s.via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, s.via);
      const enc = carriedKey(look, seed);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        // The chain key never travels (the carry Module, 1.3): none is held here.
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc ? [enc] : [],
        pending: null,
      };
      const held = new TestIdentity(f, s.via);
      this.store.saveIdentity(held);
      // What its homes hold now was made by the app it came from: kept, so it raises no warning of a stolen key (F152).
      let elsewhere: string[] = [];
      try {
        elsewhere = (await held.unrecognised()).map((u) => u.id);
      } catch {
        // its homes did not answer: the warning then names those acts, as it should
      }
      const b = this.store.book();
      b.identities.push({ id, name, linked: a.linked, kind: 'brought', elsewhere });
      this.store.saveBook(b);
      const inbox = look.inbox(SPECS.text);
      return {
        title: `“${name}” is here`,
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          enc
            ? { text: 'Its encryption key is the one the words carry: its private messages open here.', tone: 'ok' }
            : { text: 'Edubba holds no encryption key for it: its encryption key was not made from its signing key’s words, so its private messages cannot be opened here.', tone: 'warn' },
          { text: inbox?.length ? `Its inbox is at ${inbox.join(', ')}.` : 'It declares no inbox: nothing can be delivered to it.' },
          { text: a.linked ? 'Linked to Claude: Claude may prepare drafts for it, which you approve here.' : 'Not linked to Claude.' },
          { text: BRING_LINE_SAY, tone: 'warn' },
        ],
        acts: [id],
      };
    });
  }

  // ------------------------------------------------------------ relying on an act

  /**
   * An act read back before relying on it (Identity rule 18c): what it is,
   * who signed it, its standing through its signer's chain, a text's words as
   * plain text; and what a witness act does. Nothing is signed. Relying on an
   * act that cannot be read here is refused: what is signed must be what was
   * read.
   */
  async readAct(identity: string, act: string): Promise<{ act: string; lines: Line[]; text: string | null; explanation: string; blocking: string[] }> {
    const me = this.store.identity(identity);
    const id = act.trim().toLowerCase();
    const blocking: string[] = [];
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('An act is named by its id: 64 hexadecimal characters.');
    const hints = this.hintsFor(me);
    let bytes: Uint8Array | null = null;
    for (const h of hints) {
      try {
        bytes = await relayAt(h, this.via).getAct(id);
        if (bytes) break;
      } catch {
        // away, or not there: the next
      }
    }
    const lines: Line[] = [];
    if (!bytes) {
      blocking.push(`It was not found at ${hints.join(', ')}: Edubba relies only on an act it has read. Find where it is published, and add that relay under Settings.`);
      return { act: id, lines, text: null, explanation: WITNESS_EXPLANATION, blocking };
    }
    const d = describeAct(bytes) as { id: string; signer?: string; public: boolean; spec?: string; type?: number; payload?: Uint8Array };
    if (d.id !== id) throw new Error('The relay gave another act than the one asked for.');
    const names = this.store.names();
    lines.push({ text: `It is ${whatIs(d)}.` });
    if (d.signer) {
      lines.push({ text: `Signed by ${names(d.signer)}.` });
      if (d.signer === identity) blocking.push('It is this identity’s own act: a witness act names other identities’ acts.');
      try {
        const them = await lookUp(d.signer, hints, this.via);
        them.verifier.add(bytes);
        const standing = them.verifier.status(d.id);
        lines.push(standing === 'valid' ? { text: 'Valid, through its signer’s identity chain.', tone: 'ok' } : { text: `Its standing through its signer’s chain: ${standing}.`, tone: 'bad' });
      } catch (e) {
        lines.push({ text: `Its signer was not found: its standing cannot be told (${err(e)}).`, tone: 'warn' });
      }
    }
    if (me.f.sequence.includes(id)) blocking.push('It is this identity’s own act: a witness act names other identities’ acts.');
    let text: string | null = null;
    if (d.public && d.spec === SPECS.text && d.type === 0 && d.payload) {
      try {
        const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
        if (typeof t === 'string') text = escapeControls(t);
      } catch {
        // its words are not readable as text: the reading above stands
      }
    }
    if (d.spec === SPECS.identity && d.type === IDENTITY_TYPES.witness) lines.push({ text: 'It is itself a witness act: relying on it says you received its reliance.' });
    return { act: id, lines, text, explanation: WITNESS_EXPLANATION, blocking: [...new Set(blocking)] };
  }

  /**
   * The witness act, signed only once the owner typed RELY after reading the
   * act back (the genesis client's `witness`, Identity rule 18c). Public, to
   * its homes and the relays.
   */
  async witness(identity: string, act: string, shown: string, typed: string): Promise<{ id: string }> {
    if (typed.trim() !== RELY) throw new Error(`Type ${RELY} to sign the witness act. Nothing was signed.`);
    const read = await this.readAct(identity, act);
    if (read.blocking.length) throw new Error(`${read.blocking.join(' ')} Nothing was signed.`);
    return this.desk.witness(identity, read.act, shown);
  }

  // ------------------------------------------------------------ releases under one's own name (H16)

  /** This identity's releases, newest first, for the "release before" list. */
  releases(identity: string): { id: string; name: string; version: string; folder: string }[] {
    return [...(this.entry(identity).releases ?? [])].reverse().map(({ id, name, version, folder }) => ({ id, name, version, folder }));
  }

  /** The folder's name, to suggest as a release's name, and the release before it pre-set by that name (decided by Nobody, allegedly). */
  suggest(identity: string, typed: string): { folder: string; how: 'git' | 'plain'; name: string; previous: string | null } {
    const folder = folderOf(typed);
    const name = basename(folder);
    const prior = [...(this.entry(identity).releases ?? [])].reverse().find((x) => x.name === name);
    return { folder, how: inGit(folder) ? 'git' : 'plain', name, previous: prior?.id ?? null };
  }

  /**
   * A release of a folder under this identity's own name, made and read back,
   * not signed (H16): every file listed with its size and fingerprint, and
   * the libraries it depends on, if any; what changed since the release
   * before it, chosen by hand (`previous`, or none: a new release line).
   */
  async prepareRelease(a: { identity: string; folder: string; name: string; version: string; previous: string | null }): Promise<ReleaseReview> {
    const e = this.entry(a.identity);
    const me = this.store.identity(a.identity);
    const s = this.store.settings();
    const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
    const folder = folderOf(a.folder);
    const name = a.name.trim();
    const version = a.version.trim();
    const blocking: string[] = [];
    if (!name) blocking.push('Give the release a name (by default, the folder’s).');
    if (!version) blocking.push('Give the release a version, for example 1.0.');
    if (!relays.length) blocking.push('Name at least one relay first, under Settings: the files go there.');
    if (me.f.pending) blocking.push('A change of this identity’s keys is waiting to count: nothing is signed with it until it does.');
    const all = e.releases ?? [];
    const before = a.previous ? all.find((x) => x.id === a.previous) : undefined;
    if (a.previous && !before) throw new Error('That release before it is not one of this identity’s releases here.');
    if (all.some((x) => x.name === name && x.version === version)) blocking.push(`${name} ${version} was already released by this identity. Choose another version.`);
    const { how, files, skipped } = filesOf(folder);
    if (!files.length) blocking.push(how === 'git' ? 'Git tracks no file in this folder.' : 'This folder holds no file but hidden ones.');
    const bad = files.filter((f) => !validPath(f.path)).map((f) => f.path);
    if (bad.length) blocking.push(`These names cannot be in a release (release manifest cMIP, paths): ${bad.slice(0, 10).join(', ')}${bad.length > 10 ? ', …' : ''}.`);
    const source = how === 'git' ? gitSource(folder) : undefined;
    const p: Publisher = { id: me, relays, releases: before ? [{ id: before.id, version: before.version, manifest: before.manifest }] : [] };
    const prepared = prepareRelease(p, { name: name || basename(folder), version: version || '0', files: files.filter((f) => validPath(f.path)), source });
    const m = prepared.manifest;
    const digest = sha256(Buffer.concat([Buffer.from('MOR Edubba release review, version 1\n'), Buffer.from(a.identity), prepared.payload, prepared.encoded]));
    const plan = sha256(`${digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(plan, { identity: a.identity, folder, how, prepared, previous: before?.id ?? null, digest, expires: Date.now() + PLAN_FOR, blocking });
    const names = this.store.names();
    const who: Line[] = [
      { text: `It is published under ${names(a.identity)}’s own name, signed by this identity alone: a release as soon as it is published (release manifest cMIP, “What counts as a release”).` },
      { text: `The manifest and every new file go to ${relays.join(', ')}. Anyone can then fetch the release by its id and check every file against the list.` },
    ];
    const line: Line[] = before
      ? [{ text: `It follows ${before.name} ${before.version} (${before.id}), released from ${before.folder}: that release is named as the one before it, and what changed is said below.` }]
      : [{ text: 'It names no release before it: it starts a new release line.' }];
    const sections: RecordSection[] = [
      { heading: 'Where its files come from', lines: [{ text: how === 'git' ? `${folder} is in a git folder: every file git tracks there, as it is on disk.` : `${folder} is a plain folder: every file in it, except hidden ones (a name starting with a dot, and what is inside a hidden folder).` }] },
      { heading: 'The release before it', lines: line },
      ...readRelease(m, prepared.before),
      { heading: 'Who signs', lines: who },
    ];
    return {
      plan,
      digest,
      title: `Publish ${m.name} ${m.version} under ${names(a.identity).replace(/ \[[0-9a-f]{8}…[0-9a-f]{4}\]$/, '')}’s own name`,
      summary: [
        `${plural(m.files.length, 'file')} listed below, each with its size and fingerprint (its work hash, as the manifest names it)${m.dependencies.length ? `, and ${plural(m.dependencies.length, 'library', 'libraries')} it depends on, from its lock files` : ''}. ${plural(prepared.upload.length, 'file is', 'files are')} new since the release before it and uploaded.`,
        'Nothing is signed until you press Sign and publish.',
      ],
      sections,
      files: m.files.map((f) => ({ path: f.path, size: f.size, fingerprint: f.work })),
      dependencies: m.dependencies.map((d) => ({ registry: d.registry, name: d.name, version: d.version })),
      skipped,
      blocking,
    };
  }

  /**
   * Sign and publish a release exactly as reviewed: only with the review's
   * digest, within 15 minutes, once, and only if every file is still as it
   * was read (each file read again and compared with its fingerprint).
   */
  confirmRelease(planId: string, digest: string): Promise<Done> {
    return this.desk.serial(async () => {
      const plan = this.plans.get(planId);
      if (!plan || plan.expires < Date.now()) {
        this.plans.delete(planId);
        throw new Error('This review is no longer good: review the release again. Nothing was signed.');
      }
      if (plan.digest !== digest) throw new Error('The digest is not the review’s. Nothing was signed.');
      if (plan.blocking.length) throw new Error(`${plan.blocking.join(' ')} Nothing was signed.`);
      this.plans.delete(planId);
      const now = filesOf(plan.folder);
      const listed = plan.prepared.manifest.files;
      const changed =
        now.files.length !== listed.length ||
        now.files.some((f, i) => f.path !== listed[i].path || f.bytes.length !== listed[i].size || workHash(f.bytes) !== listed[i].work);
      if (changed) throw new Error(`Files in ${plan.folder} changed since the review: review the release again. Nothing was signed.`);
      const me = this.store.identity(plan.identity);
      const s = this.store.settings();
      const relays = s.relays.length ? s.relays : s.homes.map((h) => h.hint);
      const e = this.entry(plan.identity);
      const before = plan.previous ? (e.releases ?? []).find((x) => x.id === plan.previous) : undefined;
      const p: Publisher = { id: me, relays, releases: before ? [{ id: before.id, version: before.version, manifest: before.manifest }] : [] };
      let out;
      try {
        out = await publishPrepared(p, plan.prepared, s.via);
      } finally {
        this.store.saveIdentity(me);
      }
      const rel: OwnRelease = { id: out.id, name: out.manifest.name, version: out.manifest.version, manifest: Buffer.from(plan.prepared.encoded).toString('base64'), folder: plan.folder };
      const b = this.store.book();
      const entry = b.identities.find((x) => x.id === plan.identity)!;
      entry.releases = [...(entry.releases ?? []), rel];
      this.store.saveBook(b);
      this.store.record({ time: Math.floor(Date.now() / 1000), draft: '', verdict: 'released', signer: plan.identity, title: `${rel.name} ${rel.version} released under its own name`, note: '', act: out.id });
      return {
        title: `${rel.name} ${rel.version} is published`,
        lines: [
          { text: `Release ${out.id}.`, tone: 'ok' },
          { text: `${plural(out.manifest.files.length, 'file')}, ${out.uploaded} uploaded new.` },
          ...out.refused.map((r) => ({ text: `Refused by ${r}`, tone: 'warn' as const })),
        ],
        acts: [out.id],
      };
    });
  }

  cancelRelease(plan: string): void {
    this.plans.delete(plan);
  }
}

/** A manifest kept here, read again (for tests and the page's list). */
export const manifestOf = (r: OwnRelease): Manifest => decodeManifest(unb64(r.manifest));
