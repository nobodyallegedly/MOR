// The reader's settings: a small file served beside the page (`reader.json`),
// written by whoever deploys it, never built into the code. Nothing in it is
// signed: the identity is checked against what relays serve; the name, the
// contact address and the links are the deployer's word, and the page says so.

export interface Settings {
  /** The identity this reader is the door of: its documents are listed, messages go to it. */
  identity: string;
  /** What the deployer calls that identity. Unsigned: shown as the deployer's words. */
  name: string;
  /** Where acts are fetched first, and where the identity is looked up. */
  relays: string[];
  /** An email address to reach the identity's owner outside MOR. */
  email: string | null;
  /** Links shown on the front page (the code, the repository on MOR). */
  links: { label: string; href: string }[];
  /** Homes where a visitor's one-time identity is born, to sign a message. None: no messages. */
  messageHomes: string[];
}

const HEX64 = /^[0-9a-f]{64}$/;

/** A relay's base address: https, or http on this machine only (tests, a local relay). */
export function relayAddress(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  const local = u.hostname === '127.0.0.1' || u.hostname === 'localhost' || u.hostname === '[::1]';
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return null;
  if (u.username || u.password || u.search || u.hash) return null;
  return s.replace(/\/$/, '');
}

/** Only links a reader may follow on a click: https and mailto (as the long-form format's links). */
function safeHref(s: unknown): string | null {
  if (typeof s !== 'string') return null;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'mailto:' ? s : null;
  } catch {
    return null;
  }
}

/** Read and check the settings file; anything malformed is an error, not a guess. */
export function parseSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') throw new Error('the settings are not an object');
  const o = raw as Record<string, unknown>;
  const identity = o.identity;
  if (typeof identity !== 'string' || !HEX64.test(identity)) throw new Error('settings: "identity" must be 64 hex digits');
  const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'the owner of this identity';
  const list = (k: string) => (Array.isArray(o[k]) ? (o[k] as unknown[]) : []);
  const relays = list('relays').map(relayAddress);
  if (!relays.length || relays.some((r) => r === null)) throw new Error('settings: "relays" must list https addresses');
  const messageHomes = list('messageHomes').map(relayAddress);
  if (messageHomes.some((r) => r === null)) throw new Error('settings: "messageHomes" must list https addresses');
  let email: string | null = null;
  if (o.email !== undefined && o.email !== null) {
    if (typeof o.email !== 'string' || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(o.email)) throw new Error('settings: "email" is not an address');
    email = o.email;
  }
  const links = list('links').map((l) => {
    const x = l as Record<string, unknown>;
    const href = safeHref(x?.href);
    if (typeof x?.label !== 'string' || !href) throw new Error('settings: each link needs a "label" and an https "href"');
    return { label: x.label, href };
  });
  return { identity, name, relays: relays as string[], email, links, messageHomes: messageHomes as string[] };
}
