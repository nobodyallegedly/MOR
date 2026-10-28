// The kinds of act a collective's area may reach (hand test v3, H120,
// decided for the app): one choice per layer, Text, Envelopes, Money,
// Agreements and Development; under "Only some kinds of act", every type the
// layer's MIR defines, drawn from the core's own type tables
// (`core-types.ts`, generated from `core/src`), each named in words here.
// A type a later draft adds appears by itself, named by its constant until
// words are given it (and `test/core-types.test.ts` asks for them).
// Claims of works stay under Agreements, where the core puts them (his
// words: "My bad, move claim where it belongs.").

import { MIRS } from './mirs.ts';
import { CORE_TYPES } from './core-types.ts';

/** Each type's words, by layer and the core's constant. */
export const KIND_WORDS: Record<keyof typeof CORE_TYPES, Record<string, string>> = {
  text: { TEXT_ACT: 'posts and messages' },
  envelopes: {
    PUBLICATION: 'publications: files baked (texts, pictures, films, recordings)',
    KEY_DELIVERY: 'key deliveries: a file’s key to whoever bought it',
    WITHDRAWAL: 'withdrawals of a publication',
    ENCRYPTION_KEY: 'its encryption key, published',
    VOW: 'vows: something to come, named',
  },
  money: {
    PAYEE_POINTER: 'where it is paid (payee pointers)',
    OBLIGATION: 'debts (obligations)',
    RECEIPT: 'receipts',
    CLAIM: 'claims of a payment',
    RELEASE: 'a creditor’s releases of a debt',
  },
  agreements: {
    TERMS: 'agreements: their terms (collective, publishing and service agreements)',
    SIGNATURE: 'signatures of an agreement',
    KEEPER_RECORD: 'keepers’ records',
    WORK_CLAIM: 'work claims: a work bound to its creators',
    STAKE_TRANSFER: 'stake transfers',
    RELEASE: 'public domain releases',
    STANDING_OFFER: 'standing offers',
    SPLIT: 'splits',
    GRANT: 'grants: a key or a lane given',
    REVOCATION: 'revocations of a grant',
    LIVENESS: 'liveness: still here',
    DECLARATION: 'abandonment declarations',
    CONTEST: 'contests',
    RESIGNATION: 'resignations',
    RECORD: 'records: the collective’s everyday line',
    NEGOTIATION: 'negotiation messages',
    FORK: 'forks of a collective',
    CLOSING: 'the closing of a collective',
    SETTLEMENT_REQUEST: 'requests to settle a deal’s fork',
    FORK_SETTLEMENT: 'settlements of a deal’s fork',
    NOTICE: 'notices to a payer owed money back',
    JUDGE_REQUEST: 'requests to a judge',
    ISSUANCE_OFFER: 'issuance offers',
    PROXY: 'proxies',
    PROXY_REVOCATION: 'revocations of a proxy',
  },
};

/** The constant as words, where none are given yet: `KEEPER_RECORD`, "keeper record". */
const plain = (constant: string) => constant.toLowerCase().replace(/_/g, ' ');

/** One kind of act: the MIR it is under, its type, its words. */
export interface Kind {
  spec: string;
  type: number;
  name: string;
}

/** The layers the grid offers, one choice each (H120), in the core's numbering of areas (Agreements, "Layer": Envelopes and Text together are layer 1). */
export const GRID_LAYERS: { key: keyof typeof CORE_TYPES | 'development'; layer: number; name: string; say: string; kinds: Kind[] }[] = [
  { key: 'text', layer: 1, name: 'Text', say: 'posts and messages (the Text layer)', kinds: CORE_TYPES.text.map((t) => ({ spec: MIRS.text, type: t.type, name: KIND_WORDS.text[t.constant] ?? plain(t.constant) })) },
  { key: 'envelopes', layer: 1, name: 'Envelopes', say: 'media, their keys, vows (the Envelopes layer)', kinds: CORE_TYPES.envelopes.map((t) => ({ spec: MIRS.envelopes, type: t.type, name: KIND_WORDS.envelopes[t.constant] ?? plain(t.constant) })) },
  { key: 'money', layer: 2, name: 'Money', say: 'money (the Money layer)', kinds: CORE_TYPES.money.map((t) => ({ spec: MIRS.money, type: t.type, name: KIND_WORDS.money[t.constant] ?? plain(t.constant) })) },
  { key: 'agreements', layer: 3, name: 'Agreements', say: 'collective, publishing and service agreements, claims of works (the Agreements layer)', kinds: CORE_TYPES.agreements.map((t) => ({ spec: MIRS.agreements, type: t.type, name: KIND_WORDS.agreements[t.constant] ?? plain(t.constant) })) },
  // The Development MIR defines no act type of its own: a specification is published as a publication. Chosen whole.
  { key: 'development', layer: 4, name: 'Development', say: 'specifications (the Development layer)', kinds: [] },
];
