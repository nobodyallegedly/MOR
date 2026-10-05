// What the reader shows: a text act (a long-form document or a post, with
// its pictures), fetched by id, judged through its signer's identity chain by
// the core library; and the documents of the identity the reader is the door
// of. The reading itself is the barebone client's (step 9), which renders
// the long-form format with the long-form client (step 8).

import { parse, title } from '../../longform/src/format.ts';
import { listPosts, readPost, type ShownPost } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import type { Via } from '../../genesis/src/transport.ts';

export interface Shown {
  post: ShownPost;
  /** The document's title: the first heading of a long-form text, else its first line. */
  title: string;
  /** Whether the signer is the identity this reader names in its settings. */
  byOwner: boolean;
}

export function titleOf(p: ShownPost): string {
  if (p.format === POST_SPECS.longform) {
    const t = title(parse(p.text));
    if (t) return t;
  }
  const first = p.text.split('\n').find((l) => l.trim()) ?? '';
  return first.length > 80 ? `${first.slice(0, 79)}…` : first || 'Untitled';
}

/** One act, by id, from the first of `relays` that holds it, verified. */
export async function show(id: string, relays: string[], owner: string, via: Via = {}): Promise<Shown> {
  const post = await readPost(id, relays, via);
  return { post, title: titleOf(post), byOwner: post.signer === owner };
}

/**
 * The owner's text acts, newest first: every relay's feed of the owner, in
 * turn, merged. A relay may hold only some; silence proves nothing.
 */
export async function documents(owner: string, relays: string[], via: Via = {}): Promise<string[]> {
  const seen: string[] = [];
  for (const r of relays) {
    try {
      for (const id of await listPosts(owner, r, via)) if (!seen.includes(id)) seen.push(id);
    } catch {
      // that relay is away: the others may hold them
    }
  }
  return seen.reverse();
}

/**
 * An identity hash as a fingerprint to compare by eye: the whole hash, in
 * sixteen groups of four. The identity hash is the identity (Identity,
 * "Definitions"); nothing shorter is shown as if it were it.
 */
export function fingerprint(identity: string): string {
  return identity.match(/.{1,4}/g)!.join(' ');
}

/** What the core library's standing of an act means, in plain words. */
export function standingWords(s: string): { ok: boolean; words: string } {
  switch (s) {
    case 'valid':
      return { ok: true, words: 'Verified: signed by this identity with a key its identity chain counts, checked in this browser.' };
    case 'pending':
      return { ok: false, words: 'Not verified yet: the identity chain it rests on is waiting for its homes to confirm it.' };
    case 'disputed':
      return { ok: false, words: 'Disputed: signed with a key the identity has since replaced; its owner did not keep it, but another identity acknowledged it or a keeper recorded it.' };
    case 'void':
      return { ok: false, words: 'Void: signed with a key the identity has since replaced, and its owner did not keep it.' };
    case 'invalid':
      return { ok: false, words: 'Invalid: the signature or the act does not check.' };
    case 'scoped':
      return { ok: false, words: "Signed with a grant key: a key of a collective scoped to one of its grants (Law, F128). Whether the grant backs it is Law's to say, and this reader does not judge Law." };
    default:
      return { ok: false, words: `Not verified (${s}): this browser could not establish who signed it.` };
  }
}
