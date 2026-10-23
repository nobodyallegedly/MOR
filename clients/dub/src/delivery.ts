// A sealed work's key, delivered to each buyer (round 2's pay-per-view, shared
// in round 3 with Edubba's Publishing tab). The seller's Damgar, once it has
// signed the receipt, tells the seller's apps of the sale (the money messages
// cMIP, type 6, sealed to oneself); the app holding the work's key delivers
// it: a key delivery (Envelopes type 1), a private act signed with the
// seller's own key, sealed to the buyer and left in its inbox, then kept at
// the seller's homes. The buyer opens the bytes and checks them against the
// work hash (Envelopes rule 21).
//
// TEST IDENTITIES ONLY.

import { SPECS, openSealed, unhex } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { leaveAtHomes } from '../../genesis/src/private.ts';
import { TYPES, readSale } from '../../damgar/src/messages.ts';
import { MESSAGES_SPEC } from '../../damgar/src/specs.ts';
import { KEY_DELIVERY, keyDeliveryPayload } from '../../barebone/src/sealed.ts';

/** Works sold by one identity, by publication: the key, and to whom it was delivered (buyer → the key delivery's id). */
export interface SoldWorks {
  [publication: string]: { key: string; offer: string; post?: string; media?: 'text' | 'picture' | 'video' | 'audio'; delivered: Record<string, string> };
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];

/** The sales the seller's Damgar told of (type 6, sealed to oneself, at the seller's homes): `[publication, buyer]`. */
export async function salesTold(me: TestIdentity, via: Via): Promise<{ publication: string; buyer: string }[]> {
  const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
  const out: { publication: string; buyer: string }[] = [];
  for (const h of me.f.homes.map((x) => x.hint)) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: me.id, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          for (const sec of secrets) {
            let o: { described: { signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
            try {
              o = openSealed(it.item, me.id, sec) as typeof o;
            } catch {
              continue;
            }
            const d = o.described;
            if (d.signer === me.id && d.spec === MESSAGES_SPEC && d.type === TYPES.sale && d.payload) {
              const x = readSale(d.payload);
              if (!out.some((y) => y.publication === x.publication && y.buyer === x.buyer)) out.push({ publication: x.publication, buyer: x.buyer });
            }
            break;
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that home is away
    }
  }
  return out;
}

/**
 * What signing a delivery needs: where to send, and `current`, the app's own
 * check that the signing key it holds is still the one the identity's homes
 * serve (F335; H80: a key delivery once signed with a retired key). It
 * throws, with the app's own words, where it is not; nothing is signed then.
 */
export interface Delivering {
  relays: string[];
  via: Via;
  save: () => Promise<void> | void;
  current: () => Promise<void>;
}

/** Deliver the key of every sale told of and not yet delivered; `sold` is updated in place. Lines say what was done. */
export async function deliverSold(me: TestIdentity, sold: SoldWorks, a: Delivering): Promise<string[]> {
  const out: string[] = [];
  let checked = false;
  for (const x of await salesTold(me, a.via)) {
    const mine = sold[x.publication];
    if (!mine || mine.delivered[x.buyer]) continue;
    // Checked once, before the first delivery, and outside the per-buyer catch: a key changed elsewhere stops them all.
    if (!checked) {
      await a.current();
      checked = true;
    }
    try {
      mine.delivered[x.buyer] = await deliverKey(me, x.buyer, x.publication, mine.key, { ...a, current: async () => undefined });
      out.push(`The key of your sealed ${mine.media === 'picture' ? 'picture' : 'post'} was delivered to ${x.buyer.slice(0, 8)}…, sealed to them: a sale your Damgar signed the receipt for.`);
    } catch (e) {
      out.push(`The key could not be delivered to ${x.buyer.slice(0, 8)}… yet: ${message(e)}`);
    }
  }
  return out;
}

/** One key delivery, sealed to the buyer at its inbox, kept at the seller's homes; its id. */
export async function deliverKey(me: TestIdentity, buyer: string, publication: string, key: string, a: Delivering): Promise<string> {
  await a.current();
  const hints = list([...me.f.homes.map((h) => h.hint), ...a.relays]);
  const l = await lookUp(buyer, hints, a.via);
  if (!l.encryptionKey) throw new Error('the buyer publishes no encryption key');
  const inbox = l.inbox(SPECS.envelopes) ?? [];
  if (!inbox.length) throw new Error('the buyer declares no inbox');
  let made: { act: Uint8Array; id: string; key: Uint8Array };
  try {
    made = me.sign(SPECS.envelopes, KEY_DELIVERY, keyDeliveryPayload(publication, key), { public: false, to: [buyer] });
  } finally {
    await a.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: buyer, key: l.encryptionKey }]);
  let left = 0;
  for (const h of inbox) {
    try {
      await relayAt(h, a.via).putSealed(sealed);
      left++;
    } catch {
      // away
    }
  }
  // At the seller's homes too, locked, its key delivered to the seller (H80's question 2): Kišib places the app's line by it.
  await leaveAtHomes(me, made, { via: a.via });
  await a.save();
  if (!left) throw new Error('its inbox took nothing');
  return made.id;
}
