// A message to the reader's owner, over MOR (decided by Nobody, allegedly,
// 30 September 2026): a private text act addressed to the owner, sealed with
// X-Wing to the owner's current encryption key, and put in the owner's inbox.
// Relays see a container for the owner and its size; never the text, nor
// who sent it (Envelopes, "Sealed containers").
//
// Every act has a signer, so the visitor needs an identity. The page makes a
// one-time identity for each message: a genesis at the homes the settings
// name, a signing key held in this page's memory only, and a safety key
// committed and then forgotten, so the identity can never rotate. When the
// message is sent, the page forgets every key; nothing is stored.

import {
  SPECS,
  actId,
  checkText,
  hex,
  makeEveryday,
  makeGenesis,
  newSigningSecret,
  newTestSafetyKey,
  randomBytes,
  seal,
  sealedParts,
} from '../../genesis/src/core.ts';
import { record } from '../../genesis/src/kex.ts';
import { lookUp, type Home } from '../../genesis/src/lookup.ts';
import { RelayError, relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { compose } from '../../longform/src/text.ts';

/** The longest message the page sends, in characters: far below any relay's act limit. */
export const MAX_MESSAGE = 10_000;

export interface Recipient {
  identity: string;
  inbox: string[];
  key: Uint8Array;
  /** Set when the recipient's current state rests on a homeless rotation accepted on this browser's own failed attempt. */
  warning: string | null;
}

/** Look the recipient up, as any reader: its current encryption key and inbox, as the core library counts them. */
export async function recipient(identity: string, hints: string[], via: Via = {}): Promise<Recipient> {
  const l = await lookUp(identity, hints, via);
  if (!l.encryptionKey) throw new Error('this identity has published no encryption key that counts, so it cannot receive messages');
  const inbox = l.inbox(SPECS.text);
  if (!inbox?.length) throw new Error('this identity declares no inbox, so it cannot receive messages');
  const last = l.resolution.links.at(-1);
  const warning =
    last?.how === 're-homed without audit'
      ? 'This identity was re-homed without audit: it moved to new homes because its old homes could not be reached from here. That may be a thief. The message may go to whoever moved it.'
      : null;
  return { identity, inbox, key: l.encryptionKey, warning };
}

/** A home's operator, from its `info` (checked later by the receipts the home signs). */
async function homeAt(hint: string, via: Via): Promise<Home> {
  const info = await relayAt(hint, via).info();
  const op = info.get(0);
  if (!(op instanceof Uint8Array)) throw new Error(`${hint} declares no operator: not a home`);
  return { operator: hex(op), hint };
}

export interface Sent {
  /** The message: the private text act's id. */
  message: string;
  /** The one-time identity that signed it. */
  sender: string;
  /** The sealed container's id, as relays see it. */
  sealed: string;
  /** Inbox relays that took the container. */
  delivered: string[];
  /** Inbox relays that did not, with their reason. */
  failed: { relay: string; reason: string }[];
}

/**
 * Send a message. The text is composed as canonical text first (Text MIP,
 * rule 6) and checked by the core library. Throws, having sent nothing
 * private, if the recipient cannot receive or no home takes the genesis.
 */
export async function sendMessage(o: { text: string; to: Recipient; homes: string[]; via?: Via }): Promise<Sent> {
  const via = o.via ?? {};
  const { text } = compose(o.text);
  if (!text) throw new Error('the message is empty');
  if (text.length > MAX_MESSAGE) throw new Error(`the message is longer than ${MAX_MESSAGE} characters`);
  checkText(text);

  // The one-time identity: its genesis at every home the settings name.
  const homes: Home[] = [];
  for (const h of o.homes) {
    try {
      homes.push(await homeAt(h, via));
    } catch {
      // away: the others may do
    }
  }
  if (!homes.length) throw new Error('no home could be reached to give the message a signer');
  const signingSecret = newSigningSecret();
  const safety = newTestSafetyKey(2) as { scheme: number; commit: string; seeds: Uint8Array };
  safety.seeds.fill(0); // forgotten: this identity never rotates
  const genesis = makeGenesis({
    identitySpec: SPECS.identity,
    signingSecret,
    safetyScheme: safety.scheme,
    safetyCommit: safety.commit,
    homes,
  });
  const sender = actId(genesis);
  let receipted = 0;
  for (const h of homes) {
    try {
      if ((await relayAt(h.hint, via).putAct(genesis)).receipt) receipted++;
    } catch {
      // that home refused or is away
    }
  }
  if (!receipted) throw new Error('no home signed a receipt for the one-time identity');
  // Carried to the inbox relays too, so the recipient finds the sender's genesis where the message is.
  for (const r of o.to.inbox) {
    try {
      await relayAt(r, via).putAct(genesis);
    } catch {
      // its policy: the homes serve it anyway
    }
  }

  const made = makeEveryday({
    signingSecret,
    signer: sender,
    binding: sender,
    spec: SPECS.text,
    type: 0,
    payload: textPayload(text, null),
    sequence: [],
    public: false,
    to: [o.to.identity],
  }) as { act: Uint8Array; id: string; key: Uint8Array };
  const eseed = randomBytes(64);
  const sealed = seal({
    act: made.act,
    key: made.key,
    recipients: [{ id: o.to.identity, key: o.to.key }],
    random: { containerKey: randomBytes(32), nonce: randomBytes(24), eseeds: [eseed], oneTimeSecret: newSigningSecret() },
  });
  record({ kind: 'encapsulate', publicKey: o.to.key, eseed, ct: (sealedParts(sealed) as { capsules: Uint8Array[] }).capsules[0] });
  signingSecret.fill(0);

  const out: Sent = { message: made.id, sender, sealed: sealedId(sealed), delivered: [], failed: [] };
  for (const r of o.to.inbox) {
    try {
      await relayAt(r, via).putSealed(sealed);
      out.delivered.push(r);
    } catch (e) {
      out.failed.push({ relay: r, reason: e instanceof RelayError ? e.reason : 'not reachable' });
    }
  }
  return out;
}
