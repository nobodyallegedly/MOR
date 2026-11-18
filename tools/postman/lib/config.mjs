// The hosts' configuration (a JSON file kept with the hosts, never in the
// repository with real addresses): the round's folder, the trays in their
// fixed order, the relays by name, the limits and the wallet.

import fs from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { NAME, RELAY_PATHS } from '../kit/lib/format.mjs';

const home = (p) => (typeof p === 'string' && p.startsWith('~/') ? join(homedir(), p.slice(2)) : p);

export const DEFAULTS = {
  limits: {
    envelopeBytes: 1 << 20,
    bodyBytes: 16 << 20,
    answerBytes: 64 << 20,
    perTrayPerPass: 50,
    timeoutSeconds: 20,
    settleSeconds: 1,
  },
  everySeconds: 5,
  funding: { companySats: 2_000_000, publicFile: 'addresses.md' },
  bank: { defaultFeeLimit: 10, onchainFeeReserve: 5000, defaultFeerate: 1, maxFeerate: 1000, confirmations: 1, invoiceExpiry: 604800, maxInvoiceExpiry: 2592000 },
};

export function loadConfig(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return checkConfig(raw);
}

export function checkConfig(raw) {
  const fail = (m) => {
    throw new Error(`hosts' configuration: ${m}`);
  };
  const root = home(raw.root);
  if (typeof root !== 'string' || !isAbsolute(root)) fail('"root" is the round\'s folder, an absolute path or ~/…');
  if (!fs.existsSync(root)) fail(`"root" ${root} does not exist`);
  const realRoot = fs.realpathSync(root);
  const trays = raw.trays;
  if (!Array.isArray(trays) || !trays.length) fail('"trays" lists the players\' folders, in the fixed order the postman serves them');
  for (const t of trays) if (typeof t !== 'string' || !NAME.test(t) || t.startsWith('_')) fail(`"${t}" is not a tray name (letters, digits, "-", "_"; not starting with "_")`);
  if (new Set(trays).size !== trays.length) fail('a tray is listed twice');
  const relays = raw.relays ?? {};
  if (typeof relays !== 'object' || Array.isArray(relays)) fail('"relays" maps each relay\'s name to its local address');
  for (const [n, u] of Object.entries(relays)) {
    if (!NAME.test(n) || n === 'bank' || n === 'chain') fail(`"${n}" is not a relay name (and "bank" and "chain" are the postman's own)`);
    let url;
    try {
      url = new URL(u);
    } catch {
      fail(`relay "${n}": "${u}" is not an address`);
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) fail(`relay "${n}": an http or https address, no query`);
  }
  for (const k of ['companies', 'public']) {
    for (const t of raw[k] ?? []) if (!trays.includes(t)) fail(`"${k}" names "${t}", which is not in "trays"`);
  }
  const postmanDir = resolve(home(raw.postmanDir ?? join(realRoot, '_hosts', 'postman')));
  for (const t of trays) {
    const r = relative(join(realRoot, t), postmanDir);
    if (!r.startsWith('..') && !isAbsolute(r)) fail(`the postman's own folder ${postmanDir} lies inside the tray "${t}": players could write to it`);
  }
  const paths = raw.paths ?? RELAY_PATHS;
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string' && /^[a-z]+$/.test(p))) fail('"paths" lists the relay API\'s first path segments a letter may name');
  if (paths.includes('manage')) fail('"paths" never includes "manage": a relay\'s management page is the hosts\' tool');
  const wallet = raw.wallet ?? { kind: 'none' };
  if (!['none', 'lncli', 'mock'].includes(wallet.kind)) fail('"wallet"."kind" is "lncli", "mock" (tests only) or "none"');
  if (wallet.kind === 'lncli') {
    for (const k of ['lncli', 'btcctl', 'regtest']) if (typeof wallet[k] !== 'string') fail(`"wallet"."${k}" is a path`);
    for (const k of ['lncli', 'btcctl', 'regtest']) wallet[k] = home(wallet[k]);
    if (!wallet.nodes || typeof wallet.nodes !== 'object') fail('"wallet"."nodes" maps alice, bob and carol to their gRPC addresses');
    wallet.payFrom ??= 'alice';
    wallet.invoiceOn ??= ['bob', 'carol'];
    for (const n of [wallet.payFrom, ...wallet.invoiceOn]) if (typeof wallet.nodes[n] !== 'string') fail(`"wallet"."nodes" has no "${n}"`);
    if (wallet.invoiceOn.includes(wallet.payFrom)) fail('"wallet": invoices are made on nodes other than the one that pays');
    if (typeof wallet.btcd !== 'string') fail('"wallet"."btcd" is btcd\'s RPC address');
    wallet.rpcuser ??= 'u';
    wallet.rpcpass ??= 'p';
  }
  const limits = { ...DEFAULTS.limits, ...(raw.limits ?? {}) };
  for (const [k, v] of Object.entries(limits)) if (!(Number.isSafeInteger(v) && v >= 0)) fail(`"limits"."${k}" is a whole number`);
  return {
    root: realRoot,
    trays,
    companies: raw.companies ?? [],
    public: raw.public ?? [],
    relays,
    paths,
    postmanDir,
    limits,
    everySeconds: raw.everySeconds ?? DEFAULTS.everySeconds,
    funding: { ...DEFAULTS.funding, ...(raw.funding ?? {}) },
    bank: { ...DEFAULTS.bank, ...(raw.bank ?? {}) },
    wallet,
  };
}
