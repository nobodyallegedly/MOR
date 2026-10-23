// What Damgar can accept (F338: "a field to pick the cMIPs and modules it
// accepts"), each with its version and what it does. The spec hashes are
// the reference implementations' own (test values until their creators are
// named at step 17), read from the core library, never typed here; only the
// two cMIPs written by Damgar's build name theirs here, as the people cMIP
// does in Dub.
//
// Accepting is a person's choice, kept in the accepted list (the accepted
// cMIP, F340). A Money act under anything not accepted is shown unknown and
// is not signed (F338; Development rule 9).

import { MIRS, moneySpecs, sha256 } from '../../genesis/src/core.ts';
import { BITCOIN_UNITS, type UnitsModule } from './units.ts';
import { GRANT_LIMITS_SPEC, MESSAGES } from '../../grants/src/limits.ts';

export const MONEY = MIRS.money;

/** The money messages cMIP, draft 4 (`cmips/cmip-money-messages-draft-4.md`, F357: invoice requests to a split service; a purchase confirmed from another app): a test value until publication. Every message is written under it. Draft 5 (`cmips/cmip-money-messages-draft-5.md`: deals between separate people, a purchase's claim readable by every party) changes no format and keeps this value (its header). */
export const MESSAGES_SPEC = sha256('Money messages cMIP, draft 4, test value until publication');

/** Draft 3 (`cmips/cmip-money-messages-draft-3.md`, F352: the amount in an answer), still read: its types are draft 4's. */
export const MESSAGES_SPEC_3 = sha256('Money messages cMIP, draft 3, test value until publication');

/** Draft 2 (`cmips/cmip-money-messages-draft-2.md`: lane requests and sale notices), still read. */
export const MESSAGES_SPEC_2 = sha256('Money messages cMIP, draft 2, test value until publication');

/** Draft 1 (`cmips/cmip-money-messages-draft-1.md`), still read: its four types are draft 2's. */
export const MESSAGES_SPEC_1 = sha256('Money messages cMIP, draft 1, test value until publication');

/** Every draft of the money messages cMIP read here, newest first. */
export const MESSAGES_SPECS = [MESSAGES_SPEC, MESSAGES_SPEC_3, MESSAGES_SPEC_2, MESSAGES_SPEC_1];
// A message moves the amount it carries: a draft's, a request's, an invoice request's commitment's, an answer's (draft 3) (the grant limits cMIP, 2.1).
MESSAGES.specs = MESSAGES_SPECS;

/** The accepted cMIP, draft 1 (`cmips/cmip-accepted-draft-1.md`, F340): a test value until publication. */
export const ACCEPTED_SPEC = sha256('Accepted cMIP, draft 1, test value until publication');

interface Specs {
  payment: string;
  lightning: { hash: string; content: Uint8Array };
  onchain: { hash: string; content: Uint8Array };
  units: { bitcoin: string; testnet: string; signet: string; regtest: string };
  split: string;
  conversion: string;
  anchoring: string;
  bitcoinClock: string;
}

/** The Money layer's spec hashes, as the core library names them. */
export const SPEC: Specs = moneySpecs() as Specs;

/** One thing a person may accept: a cMIP, a rail Module, a units Module (several hashes), a clock. */
export interface Acceptable {
  /** Damgar's own short name for it. */
  key: string;
  name: string;
  kind: 'cMIP' | 'Module';
  /** Its text, in the repository, and its draft. */
  text: string;
  draft: number;
  /** The spec hashes it stands for (a units Module names one per unit). */
  hashes: string[];
  /** What it does, in plain words. */
  does: string;
  /** What Damgar does with it in round 1. */
  here: string;
  /** Damgar implements it in round 1; otherwise accepting it records the choice, and what depends on it stays unknown here. */
  built: boolean;
  /** The other things it needs accepted to be of use. */
  needs: string[];
}

const unitsEntry = (u: UnitsModule): Acceptable => ({
  key: u.key,
  name: u.name,
  kind: 'Module',
  text: u.text,
  draft: u.draft,
  hashes: u.units.map((x) => x.hash),
  does: u.does,
  here: 'Every amount names its unit; Damgar shows an amount in these units with their names, and never adds or compares amounts of different units.',
  built: true,
  needs: [],
});

/** Everything Damgar lists, in the order shown (F338: "Lightning rail, on-chain rail, Bitcoin units, split, conversion, anchoring"). */
export const ACCEPTABLE: Acceptable[] = [
  {
    key: 'payment',
    name: 'Payment',
    kind: 'cMIP',
    text: 'cmips/cmip-payment-draft-3.md',
    draft: 3,
    hashes: [SPEC.payment],
    does: 'The common language of a payment: the commitment a rail carries (who pays whom, how much, for what), the proof a receipt or claim carries, and how both are checked by the rail Module they name.',
    here: 'Needed for every payment: without it, every receipt and claim is unknown here.',
    built: true,
    needs: [],
  },
  {
    key: 'lightning',
    name: 'Lightning rail',
    kind: 'Module',
    text: 'modules/module-lightning-rail-draft-3.md',
    draft: 3,
    hashes: [SPEC.lightning.hash],
    does: 'Payments over Lightning: the payee’s node signs an invoice committing to the payment; paying it reveals a secret (the preimage), which is the proof. A request rail, its proof binding the payee and the purpose (its fields 11 and 13).',
    here: 'You are shown an invoice to pay in your own wallet, and paste back the preimage; to be paid, you paste an invoice your wallet made.',
    built: true,
    needs: ['payment', 'bitcoin-units'],
  },
  {
    key: 'onchain',
    name: 'On-chain rail',
    kind: 'Module',
    text: 'modules/module-onchain-rail-draft-3.md',
    draft: 3,
    hashes: [SPEC.onchain.hash],
    does: 'Payments on the Bitcoin chain itself: a fresh address bound to each payment (pay-to-contract, no OP_RETURN), the transaction and its block as the proof, counted at six confirmations. A request rail, its proof binding the payee and the purpose.',
    here: 'You are shown an address bound to the payment, to pay from your own wallet, and paste back the transaction’s id. Checked against the chain Damgar follows: on this computer, the regtest node you name; in the web client, none (paid, not yet checked against the chain).',
    built: true,
    needs: ['payment', 'bitcoin-units'],
  },
  unitsEntry(BITCOIN_UNITS),
  {
    key: 'split',
    name: 'Split',
    kind: 'cMIP',
    text: 'cmips/cmip-split-draft-3.md',
    draft: 3,
    hashes: [SPEC.split],
    does: 'How a payment to a collective or a deal is divided among its owners by a split service: an agreement’s choice, defined with the agreement.',
    here: 'Not used in round 1: splits are defined in Edubba’s Collectives tab, in round 2, and never approved here. Accepting it records your choice for the apps that read it.',
    built: false,
    needs: ['payment'],
  },
  {
    key: 'conversion',
    name: 'Conversion',
    kind: 'cMIP',
    text: 'cmips/cmip-conversion-draft-3.md',
    draft: 3,
    hashes: [SPEC.conversion],
    does: 'A conversion service that receives on one rail or unit and pays on another, at the rate of its own offer: the only way two amounts of different units are ever read together.',
    here: 'Not used in round 1. Accepting it records your choice.',
    built: false,
    needs: ['payment'],
  },
  {
    key: 'anchoring',
    name: 'Anchoring',
    kind: 'cMIP',
    text: 'cmips/cmip-anchoring-draft-5.md',
    draft: 5,
    hashes: [SPEC.anchoring],
    does: 'Putting an act’s fingerprint on a clock everyone can read (the Bitcoin chain), through a pooled service paid per fingerprint: its offer, the ticket it signs for each paid fingerprint, the batches it publishes.',
    here: 'Edubba asks for an anchor of a collective’s act, Ummia of a release; the payment for it arrives here, and is signed here. Its ticket is shown with it.',
    built: true,
    needs: ['payment', 'lightning', 'bitcoin-units', 'bitcoin-clock'],
  },
  {
    key: 'bitcoin-clock',
    name: 'Bitcoin clock',
    kind: 'Module',
    text: 'modules/module-bitcoin-clock-draft-3.md',
    draft: 3,
    hashes: [SPEC.bitcoinClock],
    does: 'The Bitcoin chain read as a clock: a moment on it is a block. The clock an anchoring service’s offer names; and the clock an owner may declare, so that a theft’s window ends at a block (Money rule 29).',
    here: 'Shown with an anchor’s ticket (its deadline is a block). Damgar does not judge Money rule 29, which needs Agreements’ reading of the payee’s acts: said where it applies.',
    built: true,
    needs: ['anchoring'],
  },
  {
    key: 'messages',
    name: 'Money messages',
    kind: 'cMIP',
    text: 'cmips/cmip-money-messages-draft-5.md',
    draft: 5,
    hashes: [MESSAGES_SPEC, MESSAGES_SPEC_3, MESSAGES_SPEC_2, MESSAGES_SPEC_1],
    does: 'The messages between apps and people: a draft sealed to yourself by Dub or Edubba, a request to be paid, an invoice request and its answer (draft 1); a lane asked by an app, and a sale told to your own Dub (draft 2); the amount in an answer, so a lane’s cap is judged on it (draft 3); an invoice request sent to a collective’s split service, and a purchase confirmed from Edubba (draft 4); a deal between separate people, its tips to the deal, and a purchase’s claim readable by every party or member (draft 5, no format change). Written by Damgar’s builds, awaiting approval.',
    here: 'Needed to receive drafts from Dub and Edubba, requests from others, and to pay or be paid at all: without it, nothing arrives here.',
    built: true,
    needs: ['payment'],
  },
  {
    key: 'grant-limits',
    name: 'Grant limits',
    kind: 'cMIP',
    text: 'cmips/cmip-grant-limits-draft-1.md',
    draft: 1,
    hashes: [GRANT_LIMITS_SPEC],
    does: 'A grant’s limits: how much one act may move, in a named unit, and until when, on a named clock. Written by Edubba’s agents session (F345).',
    here: 'Every lane (round 2) carries its limits under it: a cap per act, and an expiry if you give one. Without it, an act under a lane is unknown here, and no lane is granted.',
    built: true,
    needs: ['payment'],
  },
];

export const acceptable = (key: string): Acceptable => ACCEPTABLE.find((a) => a.key === key)!;

/** Every hash Damgar lists: the part of the accepted list it understands and may change (the accepted cMIP, 1.3). */
export const OURS: Set<string> = new Set(ACCEPTABLE.flatMap((a) => a.hashes));

/** The label an entry carries in the accepted list (the accepted cMIP, 1.1). */
export const labelOf = (hash: string): string | undefined => {
  const a = ACCEPTABLE.find((x) => x.hashes.includes(hash));
  if (!a) return undefined;
  if (a.hashes.length === 1) return `${a.name} ${a.kind}, draft ${a.draft}`;
  const u = BITCOIN_UNITS.units.find((x) => x.hash === hash);
  return `${a.name}, draft ${a.draft}: ${u?.name ?? 'a unit'}`;
};

/** Whether everything an entry stands for is accepted. */
export const isAccepted = (a: Acceptable, accepted: Set<string>) => a.hashes.every((h) => accepted.has(h));
