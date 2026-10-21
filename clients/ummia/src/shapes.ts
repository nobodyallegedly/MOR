// What Ummia's code gives its page: plain values, the same from the program
// and the web client.

import type { LineShown } from '../../genesis/src/card-words.ts';
export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

export interface Who {
  id: string;
  short: string;
  me: boolean;
}

/** One entry of the accepted list, shown whole (F340: "Ummia shows it whole"). */
export interface AcceptedEntry {
  hash: string;
  label: string | null;
  /** Which app's part it is, where known (Damgar's Money part; others unknown). */
  part: string;
}

export interface State {
  web: boolean;
  /** The identity window first; then the app. */
  stage: 'identity' | 'ready';
  held: { id: string; grouped: string; short: string; active: boolean }[];
  identity: null | {
    id: string;
    grouped: string;
    short: string;
    homes: string[];
    relays: string[];
    encryption: boolean;
    /** Ummia's own line of acts, its card for Kišib (Identity rule 35), naming only an act the homes hold (H80's question 2). */
    line: LineShown;
  };
  /** Who acts (the shared chooser, `acting.ts`). */
  actors: import('./acting.ts').Actor[];
  acting: string | null;
  settings: { relays: string[]; track: string[]; reports: string | null };
  /** Releases need a folder on a computer: the web client has none. */
  releases: boolean;
  counts: { specs: number; releases: number; mips: number; reports: number };
}

/** A review: what would be signed, in plain words, with the digest of exactly that. Nothing is signed until confirmed. */
export interface Review {
  plan: string;
  digest: string;
  title: string;
  summary: string[];
  sections: { heading: string; lines: Line[] }[];
  blocking: string[];
  /** A specification's hash, before it is published. */
  hash?: string;
  /** A release's files, each with its size and fingerprint. */
  files?: { path: string; size: number; fingerprint: string }[];
  /** A release's libraries, from its lock files. */
  dependencies?: { registry: string; name: string; version: string }[];
  skipped?: string[];
}

export interface Done {
  title: string;
  lines: Line[];
  acts: string[];
  /** A specification's hash, once published. */
  hash?: string;
}
