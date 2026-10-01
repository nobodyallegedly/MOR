// What someone hands the connector to look at: an act id (64 hex digits), or
// a link that carries one, such as a reader link
// (`https://reader.dubsar.org/#ACT_ID?r=RELAY`, step 10). Only the id and the
// relays a link names are taken from it; the page the link points to is
// never fetched and has no say in what the act is.

import { parseLink } from '../../reader/src/link.ts';

export interface Target {
  id: string;
  /** Relays the link names, to ask beside the connector's own. */
  relays: string[];
}

const HEX64 = /^[0-9a-f]{64}$/;

export function parseTarget(s: string): Target {
  const t = s.trim();
  if (HEX64.test(t.toLowerCase())) return { id: t.toLowerCase(), relays: [] };
  const hash = t.indexOf('#');
  if (hash >= 0) {
    const l = parseLink(t.slice(hash));
    if (l.act) return { id: l.act, relays: l.relays };
  }
  // A link of another shape: the one act id it carries, if exactly one.
  const ids = [...new Set(t.toLowerCase().match(/(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])/g) ?? [])];
  if (ids.length === 1) return { id: ids[0], relays: [] };
  if (ids.length > 1) throw new Error('this link names more than one act id: give the one to read');
  throw new Error('this is neither an act id (64 hex digits) nor a link that carries one');
}
