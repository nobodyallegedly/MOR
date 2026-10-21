// What Dub's page is told, the same from the program on the Mac and from the
// web client. Plain data and words only: this file imports nothing, so the page on the
// Mac (built without Node) and Dub's own code share it. Never a key, and
// never a word, except the words a person asked to see.

import type { LineShown } from '../../genesis/src/card-words.ts';
/** Said before a follow list is first published (the people cMIP, 3.5), word for word. */
export const PUBLISH_WARNING =
  'Anyone can read whom this identity follows, now and for good: a later change of mind stops new versions, it does not take this one back. The names you gave them stay in this app.';

export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

/** An identity as shown: its fingerprint always, its display names (the naming cMIP) and the person's own name for it beside it. */
export interface Who {
  id: string;
  /** The fingerprint: the ID's first eight and last four characters. */
  short: string;
  /** Its display names that count (the naming cMIP, section 3): free text, not unique. */
  names: string[];
  /** The name the person gave it in this app (the people cMIP), never published. */
  pet: string | null;
  me: boolean;
  followed: boolean;
  muted: boolean;
}

/** A picture of a post, checked as the JPEG Module and the barebone reader say. */
export interface Pic {
  /** The verified JPEG, as a data link; null where it is not shown. */
  src: string | null;
  width: number;
  height: number;
  publication: string;
  /** Why it is not shown, if so. */
  problem: string | null;
  /** This identity's own picture, which it may withdraw. */
  withdrawable: boolean;
}

/** A post, in the feed or "to you". */
export interface Item {
  id: string;
  who: Who;
  /** Its standing for its signer's chain, as the core library judges it ("valid" shown as nothing). */
  standing: string;
  text: string;
  /** A long-form document: not shown in the feed; a link opens it in the reader. */
  doc: { title: string; link: string } | null;
  pictures: Pic[];
  /** The posts it answers. */
  answers: { id: string; who: Who | null; snippet: string | null }[];
  /** It answers one of this identity's posts, or is addressed to it. */
  toMe: boolean;
  /** Signed under a grant (F128, F343): by whom, in whose name, and whether the grant backs it (Agreements rule 80). */
  authority?: { words: string; backed: boolean } | null;
  /** A correction (the corrections cMIP, F344): the act of its own signer it corrects; labelled "Correction". */
  corrects?: string | null;
  /** Its corrections the feed holds: shown "corrected by", the post itself as signed. */
  correctedBy?: string[];
  /** Where it was found: the feed, this identity's inbox, or the relay view (H29). */
  via: 'feed' | 'inbox' | 'relay';
  /** A sealed post (pay-per-view, round 2): its price, its state, its text once opened. */
  /** A vow the post names (round 3), with its offer. */
  vow?: { vow: string; offer: string | null; seller: string; words: string; price: string; state: 'for sale' | 'paying' | 'bought' | 'yours'; problem: string | null } | null;
  sealed?: { publication: string; offer: string | null; seller: string; price: string; words: string | null; state: 'for sale' | 'paying' | 'opened' | 'yours'; media: 'text' | 'picture'; text: string | null; picture: string | null; problem: string | null } | null;
  /** A repost of a sealed post: who reposted it, whose it is. */
  repost?: { by: Who; of: Who } | null;
  /** In the relay view, an act that is not a post: what it is, in a few words. */
  what?: string | null;
  problem: string | null;
  seen: boolean;
}

/** A private message, received or sent here. */
export interface Message {
  key: string;
  who: Who;
  dir: 'in' | 'out';
  text: string;
  standing: string;
  /** When this app found or sent it, in seconds since 1970: this app's time, not a signed one. */
  at: number;
  seen: boolean;
  problem: string | null;
}

export interface Held {
  id: string;
  grouped: string;
  who: Who;
  active: boolean;
  kind: 'made' | 'brought';
}

export interface State {
  /** The identity window (no identity in use), three words to type back, or the app. */
  stage: 'identity' | 'confirm' | 'ready';
  /** The units a money draft may name (Damgar's units Modules), regtest first, each with how Dub writes it. */
  units?: { hash: string; label: string }[];
  confirm?: { positions: number[]; id: string };
  held: Held[];
  identity?: {
    id: string;
    grouped: string;
    /** Its ID written for people (Identity draft 14, F349): `mid1…`. */
    form: string;
    /** With where it lives (H38): one of its homes, one relay, as `?r=` hints. */
    where: string;
    who: Who;
    kind: 'made' | 'brought';
    homes: string[];
    relays: string[];
    /** Whether this app holds the identity's encryption key (the carry Module, draft 2, 2a). */
    encryption: boolean;
    /** An identity made by Dub on the Mac before 16 October 2026 keeps its chain key in the app's folder, unused. */
    oldChainKey: boolean;
    /** This app's line; its card for Kišib names only an act the homes hold (H80's question 2). */
    line: LineShown;
    list: 'private' | 'published';
    /** The follow list sealed to this identity at its homes (the people cMIP, draft 2): its version, and whether it was found forked; null until written. */
    sealed: { version: number; forked: boolean } | null;
    /** The Signing tab is on (H18; off by default). */
    signing: boolean;
    follows: Who[];
    muted: Who[];
  };
}

/** Addresses a web client's deployer suggests (`dub.json`), filled in. */
export interface Suggested {
  homes?: string[];
  relays?: string[];
}

/** A proposal to sign, in the Signing tab (H18): the act it names, read in plain words from its bytes. */
export interface Proposal {
  /** The proposal's thread: its first message. */
  thread: string;
  from: Who;
  /** The proposer's words with it, and any later ones in the thread. */
  text: string;
  later: string[];
  /** The act to sign. */
  act: string;
  collective: string | null;
  reading: {
    kind: 'founding' | 'clone' | 'release' | 'act' | 'other';
    title: string;
    summary: string[];
    sections: { heading: string; lines: Line[] }[];
    plain: { heading: string; text: string }[];
    risks: { text: string; rests: string }[];
    blocking: string[];
  } | null;
  /** Why it could not be read. */
  problem: string | null;
  answer: { verdict: 'signed' | 'declined'; signature?: string } | null;
  /** Its share of a collective's chain key: none asked, waiting for it, there to be shown, shown (three words to type back), written down, or received by hand. */
  share: 'none' | 'waiting' | 'ready' | 'shown' | 'received' | 'byHand';
  /** Once shown: the three positions asked back. */
  positions: number[] | null;
  seen: boolean;
  /** A collective left alone from here (rule 70): the resignation. */
  left?: string | null;
}

/** A share of a collective's chain key, shown once (H18). */
export interface ShareShown {
  thread: string;
  /** Its number, and the number of shares, and how many rebuild the key. */
  x: number;
  holders: number;
  threshold: number;
  words: string[];
  /** The dealing's fingerprint: the same for every member, to compare. */
  fingerprint: string;
  collective: string | null;
  say: string[];
  positions: number[];
}
