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
  /** Its ID written for people (`mid1…`), what Copy ID copies. */
  form: string;
  /** Its ID link (`mid1…?r=…`, with where this app found it): what Copy ID link copies. */
  link: string;
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

/** A film a post shows (the video Module, rule 13): played only when asked, its bytes checked first. */
export interface FilmShown {
  publication: string;
  signer: string;
  size: number;
  problem: string | null;
  withdrawable: boolean;
}

/** A recording a post plays (the audio Module, rule 13): played only when asked, its bytes checked first, as a film is. */
export interface RecordingShown {
  publication: string;
  signer: string;
  size: number;
  problem: string | null;
  withdrawable: boolean;
}

/** A quiet label on a card: answers…, correction of…, signed under a grant, a pick or a nudge and who gave it (H65). `bad`: an alarm. */
export interface Label {
  text: string;
  tone?: 'warn' | 'bad';
}

/** A post, in the feed or "to you". */
export interface Item {
  id: string;
  /** Its ID written for people (`mact1…`): what Copy act ID copies (H49, H68). */
  form: string;
  /** When, by the clock this feed names (H54), in words; null where not stamped. */
  when?: string | null;
  /** The signer's own hint (field 9), as written: shown labelled as its own where no clock stamped the act. */
  hint?: string | null;
  /** Films it shows (H52). */
  films?: FilmShown[];
  /** Recordings it plays (the audio Module). */
  recordings?: RecordingShown[];
  /** Quiet labels (H65): a pick or a nudge and who gave it. */
  labels?: Label[];
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
  sealed?: { publication: string; offer: string | null; seller: string; price: string; words: string | null; state: 'for sale' | 'paying' | 'opened' | 'yours'; media: 'text' | 'picture' | 'video' | 'audio'; text: string | null; picture: string | null; problem: string | null } | null;
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
  /** Its ID written for people (`mact1…`), where it opened; empty for a container that did not. */
  form: string;
  who: Who;
  /** The conversation it belongs to: the other party (the sender of one received, the first recipient of one sent). */
  with: string;
  /** Everyone else it was sealed to (Cc): every recipient sees who else received it. */
  cc: Who[];
  /** A collective appended (the appended collective cMIP): shown only where the membership checks; `why` where it did not. */
  of: { id: string; name: string | null; checked: boolean; why: string | null } | null;
  dir: 'in' | 'out';
  text: string;
  standing: string;
  /** The signer's own hint (field 9), as written: shown labelled as its own, never as a time anyone checked. */
  hint?: string | null;
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
  kind: 'made' | 'brought' | 'runner';
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
    kind: 'made' | 'brought' | 'runner';
    homes: string[];
    relays: string[];
    /** Whether this app holds the identity's encryption key (the carry Module, draft 2, 2a). */
    /** Whether what is sealed to it opens here: with a key held here, or through Kišib's runner (draft 2). */
    encryption: boolean;
    /** Why it does not, in plain words; null where it does. */
    opening?: string | null;
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
    /** The collectives under this identity it can act as (with its own member key), added by ID. */
    collectives: Collective[];
    /** The collective it acts as now, or null: itself. */
    acting: string | null;
    /** The timestamp clock its feeds are ordered by (H54), or null: none named. */
    clock: { id: string; form: string; name: string } | null;
    /** The clock a lane's Until is prefilled with: the Dubsar clock (decided 23 October 2026: "Yes"), still written in the lane's words, since the grant signs it. */
    laneClock: { id: string; name: string } | null;
  };
  /** Proposals to sign waiting in this identity's inbox: signed in Edubba, Collectives › To sign (Dub's Signing tab removed, decided). */
  proposalsWaiting?: number;
}

/** A collective an identity can act as from here: its member key found at its homes. */
export interface Collective {
  id: string;
  form: string;
  name: string | null;
  /** Its member key is here and it holds an area reaching public posts. */
  available: boolean;
  why: string | null;
}

/** Addresses a web client's deployer suggests (`dub.json`), filled in. */
export interface Suggested {
  homes?: string[];
  relays?: string[];
}

/** The ways to pay open from Dub, for one payment (decided: three ways). */
export interface PayWays {
  lane: { open: boolean; why: string | null; label: string | null; perPayment: string | null; until: number | null; spent: string | null; /** The cap in all (the grant limits cMIP, draft 3), said, and what is left of it by Dub's own count; null where none was asked. */ total: string | null; left: string | null };
  damgar: { open: boolean; why: string | null; /** On this computer: Damgar is woken, and pops up here to authorise it (2A). */ wakes?: boolean };
  hand: { open: boolean; why: string | null };
  /** Under a deal between separate people: the one line said before paying ("This work is shared: X, Y, Z. The split service answers for it."); null for a person's own work. */
  shared?: string | null;
}

/** A file bought or a vow purchased, for Purchases. */
export interface Purchase {
  kind: 'file' | 'vow';
  /** The publication (a file) or the vow's name (a vow): the act its card shows. */
  id: string;
  form: string;
  seller: Who;
  /** What it is, in a word: text, picture, vow. */
  what: string;
  price: string | null;
  /** Where it stands, in words. */
  state: string;
  /** A file opened: its text, or its picture as a data link. */
  text: string | null;
  picture: string | null;
  /** A film or a recording opened, played when asked (checked by its Module first). */
  play?: { publication: string; seller: string; media: 'video' | 'audio' } | null;
  /** A vow: paid, and its sale as the relays read it; the buyer confirms or contests. */
  sale?: 'pending' | 'confirmed' | 'contested' | 'unknown' | null;
  paid?: boolean;
  /**
   * The buyer's contests shown beside this purchase (F386): `unknown` where
   * the core cannot say, never "none". Absent where not paid. For a vow,
   * those made in the purchase's form, which mark no sale.
   */
  contests?: { state: 'shown' | 'unknown'; contests: { act: string; promise: string | null }[]; why?: string } | null;
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
    kind: 'founding' | 'clone' | 'release' | 'act' | 'deal' | 'other';
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
