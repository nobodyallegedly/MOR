// What Ummia's code gives its page: plain values, the same from the program
// and the web client.

import type { LineShown } from '../../genesis/src/card-words.ts';
import type { Named } from '../../kit/src/html.ts';
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
  /** Its layer, by its own fields as tracking reads them (Choose, by layer: decided); null where not found on the relays asked. */
  layer: string | null;
}

export interface State {
  web: boolean;
  /** Rules I follow (H93): the rules Ummia runs, and where each is followed. */
  rules?: import('../../kit/src/engine/rules.ts').RulesShown;
  /** The identity window first; then the app. */
  stage: 'identity' | 'ready';
  held: {
    id: string;
    grouped: string;
    short: string;
    /** Its ID written for people (`mid1…`). */
    form: string;
    /** Its ID link (`mid1…?r=…`): Share your ID link (H88). */
    link: string;
    /** Its names (H96): the name it published, or why none is shown. */
    named: Named;
    active: boolean;
    /** Used through Kišib's runner: no key of it here. */ runner?: boolean;
  }[];
  identity: null | {
    id: string;
    grouped: string;
    short: string;
    form: string;
    /** Its ID link, with one home and one relay (H88). */
    link: string;
    /** Its names (H96). */
    named: Named;
    homes: string[];
    relays: string[];
    encryption: boolean;
    /** Ummia's own line of acts, its card for Kišib (Identity rule 35), naming only an act the homes hold (H80's question 2). */
    line: LineShown;
    /** Used through Kišib's runner: Ummia holds none of its keys. */
    runner?: boolean;
  };
  /** Who acts (the shared chooser, `acting.ts`). */
  actors: import('./acting.ts').Actor[];
  acting: string | null;
  /** The names of the collectives it acts for (H96), by ID. */
  names?: Record<string, Named>;
  settings: { relays: string[]; track: string[]; reports: string | null };
  /** Look's saved points. */
  saved: import('./ummia.ts').Saved[];
  /** Releases need a folder on a computer: the web client has none. */
  releases: boolean;
  counts: { specs: number; releases: number; mips: number; reports: number; cards: number; anchors: number };
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
