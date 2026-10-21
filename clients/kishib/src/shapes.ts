// What Kišib's page is told: plain data, shared by the page and Kišib's
// code, the program on the Mac and the web client alike. And two small
// helpers both sides use.

import { sha256, unhex } from '../../genesis/src/core.ts';

/** One line said to the person, with its tone: red only for a contest, a void act or a stolen key. */
export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

export interface Section {
  heading: string;
  lines: Line[];
}

/** A review of what would be signed, in plain words, and the digest that confirms exactly it. Nothing is signed until confirmed. */
export interface Review {
  plan: string;
  digest: string;
  title: string;
  summary: string[];
  sections: Section[];
  /** What signing it means, word for word, shown before the button. */
  signs: string[];
  /** Said before signing where a line of acts is left out: passed back word for word to sign. */
  warning: string | null;
  /** What stops it: nothing is signed while any is here. */
  blocking: string[];
}

/** Where a sitting stands: what Kišib holds now, in memory only, and what comes next. */
export interface Sitting {
  kind: 'identity' | 'escape' | 'collective' | 'confirm';
  /** The identity or collective. */
  id: string;
  /** The act signed, if any: the rotation (or escape, or confirmation). */
  act: string | null;
  stage:
    | 'paper' // the new chain key's words to write down and type back: nothing signed yet (H79)
    | 'sent' // signed and sent, waiting for the homes' receipts
    | 'counts' // the homes' receipts are in: the new words can be shown
    | 'shown' // the new words shown, hidden now, three asked back
    | 'done' // nothing held any more
    | 'waiting' // a collective rotation waits for its members' shares
    | 'expired'; // the one-time key expired: nothing can be opened any more
  title: string;
  lines: Line[];
  /** For a collective rotation waiting for shares: its fingerprint, how many are in of how many needed, and when it expires (this device's clock). */
  request?: { fingerprint: string; full: string; have: number; need: number; expires: number; room: boolean; from: string[] };
  /** New shares to show here, once each, by holder. */
  shares?: { holder: string; x: number; shown: boolean }[];
  /** Three positions to type back, once the words are hidden. */
  positions?: number[];
  /** Which new words are next, while any are held (H79): the new chain key's, then the new signing key's. */
  words?: 'chain' | 'signing';
}

export interface State {
  web: boolean;
  sitting: Sitting | null;
  /** How long a waiting one-time key lives, in seconds (F337). */
  expiry: number;
  /** The units a vault entry may be in (Damgar's units Modules), with the network each is of. */
  units?: { hash: string; label: string; network: number }[];
}

/** A tagged hash (Identity, "Hashes"): SHA-256(SHA-256(tag) ‖ SHA-256(tag) ‖ data), in hex. */
export function taggedHash(tag: string, data: Uint8Array): string {
  const t = unhex(sha256(tag));
  const all = new Uint8Array(t.length * 2 + data.length);
  all.set(t, 0);
  all.set(t, t.length);
  all.set(data, t.length * 2);
  return sha256(all);
}

/** A key's fingerprint as the air-gapped Module writes it (section 3.1): 16 bytes of a tagged hash of scheme and key, in eight groups of four. */
export function fingerprint(scheme: number, key: Uint8Array): string {
  const d = new Uint8Array(1 + key.length);
  d[0] = scheme;
  d.set(key, 1);
  return grouped(taggedHash('MOR/module/airgap/fingerprint', d).slice(0, 32));
}

/** Hexadecimal text in groups of four. */
export const grouped = (h: string): string => h.match(/.{1,4}/g)!.join(' ');
