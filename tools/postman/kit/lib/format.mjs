// The letter format of round two, shared by the players' kit (which writes
// letters and reads answers) and the postman (which reads letters and
// writes answers). Strict both ways: a letter with a field not listed here,
// or a value of the wrong kind, is refused whole, never repaired.
//
// One letter is one file in the tray's `out/` folder, named
// `NAME.letter.json`, NAME being 1 to 64 of a-z, A-Z, 0-9, "-" and "_".
// A body, if any, is either inline (`base64`) or the file `NAME.body` beside
// it (`"body": "file"`). The postman never opens a path a letter names: the
// body's file name follows from the letter's own name.
//
// The answer is `NAME.answer.json` in `in/`, and, when there are answer
// bytes, `NAME.answer.body` beside it, exactly as received.

export const LETTER_VERSION = 1;
export const NAME = /^[A-Za-z0-9_-]{1,64}$/;
export const LETTER_SUFFIX = '.letter.json';
export const BODY_SUFFIX = '.body';
export const ANSWER_SUFFIX = '.answer.json';
export const ANSWER_BODY_SUFFIX = '.answer.body';

/** The relay API's first path segments a letter may name (the reference relay, `relay/src/http.rs`). `probe` is the hosts' choice: off unless their configuration lists it. */
export const RELAY_PATHS = ['info', 'acts', 'sealed', 'media', 'feed', 'commitment', 'identity', 'log', 'proofs'];
/** A path: segments of letters, digits, ".", "_" and "-"; an optional query of the same and "=" and "&". No "..", no "//". */
export const PATH = /^(\/[A-Za-z0-9_.-]+)+(\?[A-Za-z0-9_.=&,-]*)?$/;
export const CONTENT_TYPES = ['application/cbor', 'application/octet-stream'];
export const RANGE = /^bytes=\d{1,15}-\d{0,15}$/;

/** What the postman's chain letters may ask the regtest chain (read-only). */
export const CHAIN_ASKS = {
  getblockcount: 'none',
  getblockhash: 'height',
  getblockheader: 'hash',
  getblock: 'hash',
  getrawtransaction: 'hash',
};

/** The kinds of bank order and the fields each carries besides `tray`, `n` and `do` (`BANK-ORDERS.md`). */
export const ORDERS = {
  open: {},
  balance: {},
  invoice: { amount: 'sats', memo: 'text?', hash: 'hash?', expiry: 'uint?' },
  pay: { invoice: 'text', amount: 'sats?', fee: 'uint?' },
  send: { address: 'text', amount: 'sats', feerate: 'uint?' },
  address: {},
};

/** The largest amount in sats any order may name (21 million bitcoin). */
export const MAX_SATS = 2_100_000_000_000_000;

/** A refusal of the format: what was wrong, in plain words. */
export class FormatError extends Error {}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Read and check a letter's envelope (already parsed JSON). Returns it as one of three kinds; throws FormatError. */
export function readEnvelope(v, relayNames, paths = RELAY_PATHS) {
  if (!isObject(v)) throw new FormatError('a letter is a JSON object');
  if (v.letter !== LETTER_VERSION) throw new FormatError(`a letter says "letter": ${LETTER_VERSION}`);
  if (typeof v.to !== 'string') throw new FormatError('a letter names where it goes in "to"');
  const only = (keys) => {
    for (const k of Object.keys(v)) if (!keys.includes(k)) throw new FormatError(`a letter to ${v.to === 'bank' || v.to === 'chain' ? `the ${v.to}` : 'a relay'} carries no field "${k}"`);
  };
  if (v.to === 'bank') {
    only(['letter', 'to', 'order', 'chain']);
    if (typeof v.order !== 'string' || !isB64(v.order)) throw new FormatError('a bank letter carries its signed order as base64 in "order"');
    if (v.chain !== undefined && (!Array.isArray(v.chain) || v.chain.length > 256 || !v.chain.every((c) => typeof c === 'string' && isB64(c))))
      throw new FormatError('"chain" is a list of at most 256 acts showing the identity’s chain (its chain acts, its homes’ receipts, their operators’ chain acts), each base64');
    return { kind: 'bank', order: v.order, chain: v.chain ?? [] };
  }
  if (v.to === 'chain') {
    only(['letter', 'to', 'ask', 'arg', 'verbose']);
    const want = CHAIN_ASKS[v.ask];
    if (!want || !Object.hasOwn(CHAIN_ASKS, v.ask)) throw new FormatError(`a chain letter asks one of: ${Object.keys(CHAIN_ASKS).join(', ')}`);
    if (want === 'none' && v.arg !== undefined) throw new FormatError(`${v.ask} takes no "arg"`);
    if (want === 'height' && !(Number.isSafeInteger(v.arg) && v.arg >= 0)) throw new FormatError(`${v.ask} takes a block height, a whole number, in "arg"`);
    if (want === 'hash' && !(typeof v.arg === 'string' && /^[0-9a-f]{64}$/.test(v.arg))) throw new FormatError(`${v.ask} takes a hash, 64 lowercase hexadecimal characters, in "arg"`);
    if (v.verbose !== undefined && (typeof v.verbose !== 'boolean' || !['getblock', 'getrawtransaction', 'getblockheader'].includes(v.ask)))
      throw new FormatError('"verbose" is true or false, for getblock, getblockheader and getrawtransaction only');
    return { kind: 'chain', ask: v.ask, arg: v.arg, verbose: v.verbose ?? false };
  }
  only(['letter', 'to', 'method', 'path', 'contentType', 'range', 'body', 'base64']);
  if (!relayNames.includes(v.to)) throw new FormatError(`no relay is named "${v.to}" in the hosts' list (${relayNames.join(', ') || 'none'})`);
  if (v.method !== 'GET' && v.method !== 'POST') throw new FormatError('"method" is GET or POST');
  if (typeof v.path !== 'string' || v.path.length > 512 || !PATH.test(v.path) || v.path.includes('..')) throw new FormatError('"path" is a relay API path such as /acts or /feed?signer=…: letters, digits, ".", "_", "-", "=", "&", one "?", no ".."');
  const first = v.path.slice(1).split(/[/?]/)[0];
  if (!paths.includes(first)) throw new FormatError(`the postman carries letters to these parts of the relay API only: /${paths.join(', /')}`);
  if (/[?&]wait=(?!0(&|$))/.test(v.path)) throw new FormatError('the postman does not hold a line open: ask the feed without "wait" (or wait=0)');
  if (v.contentType !== undefined && !CONTENT_TYPES.includes(v.contentType)) throw new FormatError(`"contentType" is one of ${CONTENT_TYPES.join(', ')}`);
  if (v.range !== undefined && (typeof v.range !== 'string' || !RANGE.test(v.range))) throw new FormatError('"range" is "bytes=FROM-" or "bytes=FROM-TO"');
  if (v.body !== undefined && v.body !== 'file') throw new FormatError('"body": "file" means the file NAME.body beside the letter; nothing else');
  if (v.base64 !== undefined && (typeof v.base64 !== 'string' || !isB64(v.base64))) throw new FormatError('"base64" is the body, in base64');
  if (v.body !== undefined && v.base64 !== undefined) throw new FormatError('a body is in "base64" or in NAME.body, not both');
  if (v.method === 'GET' && (v.body !== undefined || v.base64 !== undefined)) throw new FormatError('a GET carries no body');
  return { kind: 'relay', to: v.to, method: v.method, path: v.path, contentType: v.contentType, range: v.range, body: v.body === 'file' ? 'file' : v.base64 !== undefined ? 'inline' : 'none', base64: v.base64 };
}

export function isB64(s) {
  return s.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(s);
}

/**
 * Read a bank order's payload (a decoded CBOR Map with text keys). Throws
 * FormatError. Amounts are whole sats: unsigned integers, never text,
 * fractions or anything else.
 */
export function readOrder(m) {
  if (!(m instanceof Map)) throw new FormatError('an order is a CBOR map with text keys');
  for (const k of m.keys()) if (typeof k !== 'string') throw new FormatError('an order is a CBOR map with text keys');
  const kind = m.get('do');
  if (typeof kind !== 'string' || !Object.hasOwn(ORDERS, kind)) throw new FormatError(`an order's "do" is one of: ${Object.keys(ORDERS).join(', ')}`);
  const tray = m.get('tray');
  if (typeof tray !== 'string' || !NAME.test(tray)) throw new FormatError('an order names its tray in "tray"');
  const n = m.get('n');
  if (!(Number.isSafeInteger(n) && n >= 1)) throw new FormatError('an order is numbered in "n", a whole number from 1, each larger than the last');
  const fields = ORDERS[kind];
  for (const k of m.keys()) if (!['do', 'tray', 'n', ...Object.keys(fields)].includes(k)) throw new FormatError(`an order to ${kind} carries no field "${k}"`);
  const out = { do: kind, tray, n };
  for (const [k, t] of Object.entries(fields)) {
    const v = m.get(k);
    const optional = t.endsWith('?');
    if (v === undefined) {
      if (!optional) throw new FormatError(`an order to ${kind} names "${k}"`);
      continue;
    }
    const base = optional ? t.slice(0, -1) : t;
    if (base === 'sats') {
      if (typeof v === 'bigint' || !Number.isSafeInteger(v) || v < 1 || v > MAX_SATS) throw new FormatError(`"${k}" is in whole sats only: a whole number from 1, never a fraction, text or anything else`);
    } else if (base === 'uint') {
      if (!Number.isSafeInteger(v) || v < 0) throw new FormatError(`"${k}" is a whole number`);
    } else if (base === 'text') {
      if (typeof v !== 'string' || v.length > 2048) throw new FormatError(`"${k}" is text (at most 2,048 characters)`);
    } else if (base === 'hash') {
      if (!(v instanceof Uint8Array) || v.length !== 32) throw new FormatError(`"${k}" is 32 bytes`);
    }
    out[k] = v;
  }
  if (kind === 'invoice' && out.memo !== undefined && out.hash !== undefined) throw new FormatError('an invoice carries a memo or a description hash, not both');
  return out;
}
