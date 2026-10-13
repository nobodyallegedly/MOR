// A visitor writing to an identity a page names (website cMIP draft 7, rule
// 13b; F275), as the web reader writes to its owner: a one-time identity
// made in the visitor's browser signs one text act, and its keys are
// forgotten once it is sent; nothing is stored. Private: the act sealed to
// the recipient's encryption key and left in its inbox (the reader's own
// code, `clients/reader/src/message.ts`, used unchanged). Public: the same
// act, unsealed, carrying its key, addressed to the recipient and left in
// its inbox, readable by anyone who holds it; the feed shows it only beside
// a reply of an identity the page names that names it (rule 13a). The inbox
// is read from the recipient's routes, as the core library counts them.

import { SPECS, actId, checkText, hex, makeEveryday, makeGenesis, newSigningSecret, newTestChainKey } from '../../genesis/src/core.ts';
import { lookUp, type Home } from '../../genesis/src/lookup.ts';
import { RelayError, relayAt, type Via } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { compose } from '../../longform/src/text.ts';
import { MAX_MESSAGE, recipient, sendMessage } from '../../reader/src/message.ts';

export { MAX_MESSAGE };

export interface Written {
  /** The note: the text act's id. */
  note: string;
  /** The one-time identity that signed it. */
  sender: string;
  public: boolean;
  /** Inbox relays that took it, and those that did not, with their reason. */
  delivered: string[];
  failed: { relay: string; reason: string }[];
}

/** A home's operator, from its `info` (checked later by the receipts it signs). */
async function homeAt(hint: string, via: Via): Promise<Home> {
  const info = await relayAt(hint, via).info();
  const op = info.get(0);
  if (!(op instanceof Uint8Array)) throw new Error(`${hint} declares no operator: not a home`);
  return { operator: hex(op), hint };
}

/**
 * A one-time identity, as the reader makes one (copied from
 * `clients/reader/src/message.ts`, which keeps it inside its private send):
 * its genesis receipted by the homes given and carried to the inbox relays,
 * its chain key committed and forgotten at once, so it can never rotate.
 * The caller wipes the signing secret once the note is signed.
 */
async function oneTime(homes: string[], inbox: string[], via: Via): Promise<{ id: string; signingSecret: Uint8Array }> {
  const reached: Home[] = [];
  for (const h of homes) {
    try {
      reached.push(await homeAt(h, via));
    } catch {
      // away: the others may do
    }
  }
  if (!reached.length) throw new Error('no home could be reached to give the note a signer');
  const signingSecret = newSigningSecret();
  const chainKey = newTestChainKey(2) as { scheme: number; commit: string; seeds: Uint8Array };
  chainKey.seeds.fill(0);
  const genesis = makeGenesis({ identitySpec: SPECS.identity, signingSecret, chainKeyScheme: chainKey.scheme, chainKeyCommit: chainKey.commit, homes: reached });
  let receipted = 0;
  for (const h of reached) {
    try {
      if ((await relayAt(h.hint, via).putAct(genesis)).receipt) receipted++;
    } catch {
      // that home refused or is away
    }
  }
  if (!receipted) {
    signingSecret.fill(0);
    throw new Error('no home signed a receipt for the one-time identity');
  }
  for (const r of inbox) {
    try {
      await relayAt(r, via).putAct(genesis);
    } catch {
      // its policy: the homes serve it anyway
    }
  }
  return { id: actId(genesis), signingSecret };
}

/** The recipient's inbox for text, read from its routes; throws if it declares none. */
async function inboxOf(identity: string, places: string[], via: Via): Promise<string[]> {
  const l = await lookUp(identity, places, via);
  const inbox = l.inbox(SPECS.text);
  if (!inbox?.length) throw new Error('this identity declares no inbox, so it cannot receive notes');
  return inbox;
}

/**
 * Write to `to`: privately (sealed, the reader's message) or publicly (the
 * same act unsealed). The text is composed as canonical text and checked by
 * the core library first. Throws, having sent nothing, when the recipient
 * cannot receive or no home takes the one-time identity.
 */
export async function writeNote(o: { text: string; to: string; public: boolean; places: string[]; homes: string[]; via?: Via }): Promise<Written> {
  const via = o.via ?? {};
  if (!o.public) {
    const r = await recipient(o.to, o.places, via);
    if (r.warning) throw new Error(r.warning);
    const sent = await sendMessage({ text: o.text, to: r, homes: o.homes, via });
    return { note: sent.message, sender: sent.sender, public: false, delivered: sent.delivered, failed: sent.failed };
  }
  const { text } = compose(o.text);
  if (!text) throw new Error('the note is empty');
  if (text.length > MAX_MESSAGE) throw new Error(`the note is longer than ${MAX_MESSAGE} characters`);
  checkText(text);
  const inbox = await inboxOf(o.to, o.places, via);
  const who = await oneTime(o.homes, inbox, via);
  const made = makeEveryday({
    signingSecret: who.signingSecret,
    signer: who.id,
    binding: who.id,
    spec: SPECS.text,
    type: 0,
    payload: textPayload(text, null),
    sequence: [],
    public: true,
    to: [o.to],
  }) as { act: Uint8Array; id: string };
  who.signingSecret.fill(0);
  const out: Written = { note: made.id, sender: who.id, public: true, delivered: [], failed: [] };
  for (const r of inbox) {
    try {
      await relayAt(r, via).putAct(made.act);
      out.delivered.push(r);
    } catch (e) {
      out.failed.push({ relay: r, reason: e instanceof RelayError ? e.reason : 'not reachable' });
    }
  }
  if (!out.delivered.length) throw new Error(`no inbox relay took the note: ${out.failed.map((f) => `${f.relay} (${f.reason})`).join(', ')}`);
  return out;
}
