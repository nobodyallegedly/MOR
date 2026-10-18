// A reader link. The act id travels in the fragment, after `#`, which a
// browser never sends to the server that serves the page: the server learns
// that someone opened the reader, not what they read. The relays asked do
// learn which act is fetched (stated in the README).
//
//   https://reader.dubsar.org/#ACT_ID
//   https://reader.dubsar.org/#ACT_ID?r=https://relay.example&r=...
//
// ACT_ID is the act's id written for people (`mact1…`, Identity draft 14,
// F349: a link's fragment is then exactly the act's where-it-lives form),
// or its 64 hex digits, as links made before carry; both are read, by the
// core library.

import { formRead } from '../../genesis/src/core.ts';
import { relayAddress } from './settings.ts';

export interface Link {
  /** The act to show; null for the front page. */
  act: string | null;
  /** Relays the link names, beside the reader's own. */
  relays: string[];
}

export function parseLink(hash: string): Link {
  const h = hash.replace(/^#/, '');
  if (!h) return { act: null, relays: [] };
  const q = h.indexOf('?');
  const head = q < 0 ? h : h.slice(0, q);
  let id: string;
  try {
    id = (formRead(head, 'mact') as { data: string }).data;
  } catch (e) {
    throw new Error(`this link does not name an act id: ${e instanceof Error ? e.message : String(e)}`);
  }
  const relays: string[] = [];
  if (q >= 0) {
    for (const r of new URLSearchParams(h.slice(q + 1)).getAll('r')) {
      const a = relayAddress(r);
      if (a && !relays.includes(a)) relays.push(a);
    }
  }
  return { act: id, relays };
}

/**
 * A link to an act. Its id in hex, for now: a reader already served before
 * F349 opens only hex links. Every reader from this one opens both; once
 * every served reader does (a server session), links carry `mact1…`.
 */
export function makeLink(page: string, act: string, relays: string[] = []): string {
  const base = page.replace(/#.*$/, '');
  const q = relays.length ? '?' + relays.map((r) => `r=${encodeURIComponent(r)}`).join('&') : '';
  return `${base}#${act}${q}`;
}

/** The relays to ask: the reader's own first, then those the link names. */
export function relaysFor(own: string[], link: Link): string[] {
  return [...own, ...link.relays.filter((r) => !own.includes(r))];
}
