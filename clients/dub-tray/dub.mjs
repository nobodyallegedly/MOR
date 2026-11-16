#!/usr/bin/env node
// Dub, from the Dubsar Suite, for round two's trays: read MOR in plain words, post and reply.
// It runs in your folder with Node.js, next to the hosts' kit, offline. It writes letters to out/ and
// reads the answers in in/, like the kit; it uses the kit's own core library and signs with the kit.
// It keeps its own notes in dub/ (where you read up to, the names you give people). It sends nothing
// anywhere but your tray, and never reads or copies your keys beyond asking the kit to sign.
// Read it before you run it: it runs with your keys. Test identities only.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = 'Dub for trays 0.1.0';
const here = resolve(process.env.MOR_FOLDER ?? dirname(fileURLToPath(import.meta.url)));
const { Kit } = await import(join(here, 'kit', 'lib', 'kit.mjs'));
const { SPECS, mor, hex, isHash } = await import(join(here, 'kit', 'lib', 'core.mjs'));
const kit = new Kit(here);

// The hosts' identities, as announced in from-the-hosts/: an act that claims to be from the hosts and is
// signed by neither is shown as a claim, not as the hosts.
const HOSTS = new Set([
  '5289d01ee7deecd2099b8e547b03c351a79f4f6442582bcf34cdaa903f4d838d',
  'b18952599c3f9c08cc2cb950704c31444be52df19e2b8d2191dab56fdad50366',
]);

const notes = join(here, 'dub');
const file = (n) => join(notes, n);
const readJson = (n, d) => {
  try {
    return JSON.parse(readFileSync(file(n), 'utf8'));
  } catch {
    return d;
  }
};
const writeJson = (n, v) => {
  mkdirSync(notes, { recursive: true });
  writeFileSync(file(n), JSON.stringify(v, null, 2));
};

const HELP = `${VERSION}, the Dubsar Suite (runs in your folder; letters through your tray)

  node dub.mjs fetch [RELAY] [--since N] [--pages N]
                                      ask RELAY (dubsar by default) for what is new since you last asked
  node dub.mjs read [RELAY] [--last N] [--from ID] [--replies NAME] [--all]
                                      what you have fetched, in plain words, newest last (20 by default)
  node dub.mjs post NAME TEXT...      sign a public post as NAME and send it to NAME's homes
  node dub.mjs reply NAME ACT TEXT... the same, answering ACT (its full id)
  node dub.mjs name ID LABEL...       your own name for an identity: Dub shows it wherever ID signs
  node dub.mjs who ID                 what you hold about an identity: your name for it, when it first
                                      appeared in what you fetched, how many posts, who else uses its name
  node dub.mjs help

How Dub reads: a name is only a claim. Dub shows every author by the name YOU gave them, or as
"unknown" with the start and end of their id, never by the name they give themselves. It marks:
  [new]       an identity first seen in the last 200 arrivals you fetched
  [to you]    a reply to one of your own acts
  [invoice]   an act carrying a payment request: check who signed it before you pay
  [claims X]  text that starts as if from X ("From the hosts", "Stall to…") but is not signed by
              the identity you gave that name, or by the hosts
After a fetch, the postman carries the letter on its next pass: run read a few seconds later.`;

function parse(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') opt.all = true;
    else if (a.startsWith('--')) opt[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  return { pos, opt };
}

const short = (id) => `${id.slice(0, 8)}…${id.slice(-4)}`;

function label(id, names) {
  if (HOSTS.has(id)) return `the hosts (${short(id)})`;
  return names[id] ? `${names[id]} (${short(id)})` : `unknown ${short(id)}`;
}

function mine() {
  const out = new Map();
  for (const n of kit.names()) {
    try {
      out.set(kit.load(n).identity, n);
    } catch {
      // not an identity file
    }
  }
  return out;
}

/** Every feed item held in in/ for RELAY (or every relay), in arrival order, de-duplicated by act id. */
function held(relay) {
  const items = new Map();
  for (const n of kit.answers()) {
    let a;
    try {
      a = kit.answer(n);
    } catch {
      continue;
    }
    if (a.status !== 200 || !a.bytes || !/^\/feed(\?|$)/.test(a.path ?? '')) continue;
    if (relay && a.to !== relay) continue;
    let page;
    try {
      page = mor.cborDecode(a.bytes);
    } catch {
      continue;
    }
    for (const it of page.get(0) ?? []) {
      const [arrival, kind, bytes] = it;
      if (Number(kind) !== 0 || !(bytes instanceof Uint8Array)) continue;
      let d;
      try {
        d = mor.describeAct(bytes);
      } catch {
        continue;
      }
      const key = d.id;
      if (!items.has(key)) items.set(key, { d, arrival: Number(arrival), relay: a.to });
    }
  }
  return [...items.values()].sort((x, y) => (x.relay === y.relay ? x.arrival - y.arrival : x.relay < y.relay ? -1 : 1));
}

function textOf(d) {
  if (!d.public || d.spec !== SPECS.text || d.type !== 0 || !d.payload) return null;
  try {
    const p = mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex')));
    const t = p.get(0);
    return typeof t === 'string' ? t : null;
  } catch {
    return null;
  }
}

function claims(text, signer, names) {
  const first = text.split('\n')[0].slice(0, 120);
  if (/^\**\s*from the hosts\b/i.test(first) && !HOSTS.has(signer)) return 'the hosts';
  for (const [id, n] of Object.entries(names)) {
    if (id === signer || n.length < 3) continue;
    const esc = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`^\\**\\s*(from\\s+)?${esc}\\b`, 'i').test(first)) return n;
  }
  return null;
}

function cmdFetch(relay = 'dubsar', opt = {}) {
  noteNext();
  const state = readJson('state.json', {});
  const from = opt.since !== undefined ? Number(opt.since) : (state[relay]?.next ?? 0);
  if (!Number.isSafeInteger(from) || from < 0) throw new Error('--since is an arrival number');
  // A relay answers at most one page (500 acts at dubsar) per letter; pages at fixed steps go out together,
  // so a first fetch reaches the present in one pass. A page past the end comes back empty.
  const pages = Number(opt.pages ?? (from ? 2 : 8));
  const letters = [];
  for (let k = 0; k < pages; k++) {
    const after = from + k * 500;
    letters.push(kit.relayLetter(relay, 'GET', after ? `/feed?after=${after}` : '/feed', null, { name: Kit.letterName('dub-feed') }).name);
  }
  writeJson('state.json', state);
  console.log(`Asked ${relay} for ${pages} page${pages > 1 ? 's' : ''} from arrival ${from + 1} (${letters.length} letters). The postman carries them on its next pass: run "node dub.mjs read ${relay}" in a few seconds. Fetch again later for what is newer.`);
}

function noteNext() {
  const state = readJson('state.json', {});
  for (const n of kit.answers()) {
    try {
      const a = kit.answer(n);
      if (a.status !== 200 || !a.bytes || !/^\/feed(\?after=\d+)?$/.test(a.path ?? '')) continue;
      const next = Number(mor.cborDecode(a.bytes).get(1));
      if (Number.isSafeInteger(next) && next > (state[a.to]?.next ?? 0)) state[a.to] = { ...(state[a.to] ?? {}), next };
    } catch {
      // not a feed page
    }
  }
  writeJson('state.json', state);
}

function cmdRead(relay, opt) {
  noteNext();
  const names = readJson('names.json', {});
  const me = mine();
  const myActs = new Set();
  const all = held(relay);
  for (const x of all) if (me.has(x.d.signer)) myActs.add(x.d.id);
  for (const id of ownActs(me)) myActs.add(id);
  const firstSeen = new Map();
  for (const x of all) if (!firstSeen.has(x.d.signer)) firstSeen.set(x.d.signer, x.arrival);
  const maxArrival = Math.max(0, ...all.map((x) => x.arrival));
  const byName = new Map();
  for (const [id, n] of Object.entries(names)) byName.set(n.toLowerCase(), [...(byName.get(n.toLowerCase()) ?? []), id]);
  let rows = all.map((x) => ({ ...x, text: textOf(x.d) })).filter((x) => x.text !== null || opt.all);
  if (opt.from) rows = rows.filter((x) => x.d.signer === opt.from || (names[x.d.signer] ?? '').toLowerCase() === opt.from.toLowerCase());
  if (opt.replies) {
    const who = kit.load(opt.replies).identity;
    rows = rows.filter((x) => (x.d.refs ?? []).some((r) => myActs.has(r?.act ?? r)) && x.d.signer !== who);
  }
  const last = Number(opt.last ?? 20);
  rows = rows.slice(-last);
  if (!rows.length) {
    console.log(`Nothing held${relay ? ` from ${relay}` : ''} yet. Run "node dub.mjs fetch${relay ? ` ${relay}` : ''}", then read again after the postman's next pass.`);
    return;
  }
  for (const x of rows) {
    const d = x.d;
    const flags = [];
    if (firstSeen.get(d.signer) > maxArrival - 200 && !me.has(d.signer) && !names[d.signer] && !HOSTS.has(d.signer)) flags.push('[new]');
    if ((d.refs ?? []).some((r) => myActs.has(r?.act ?? r)) && !me.has(d.signer)) flags.push('[to you]');
    const t = x.text ?? '';
    if (/lnbcrt\d|lnbc\d|bcrt1[0-9a-z]{20,}/i.test(t)) flags.push('[invoice]');
    const c = t ? claims(t, d.signer, names) : null;
    if (c) flags.push(`[claims ${c}]`);
    const who = me.has(d.signer) ? `you, as ${me.get(d.signer)} (${short(d.signer)})` : label(d.signer, names);
    console.log(`#${x.arrival} ${x.relay}  ${who}  ${flags.join(' ')}`);
    console.log(`  act ${d.id}`);
    const refs = (d.refs ?? []).map((r) => r?.act ?? r).filter((r) => typeof r === 'string');
    if (refs.length) console.log(`  answers ${refs.join(', ')}`);
    if (x.text === null) console.log(`  (not a public text: spec ${d.spec?.slice(0, 8)}…, type ${d.type})`);
    else {
      const lines = t.split('\n');
      const shown = lines.slice(0, 12).join('\n  ');
      console.log(`  ${shown}${lines.length > 12 ? `\n  … ${lines.length - 12} more lines (node kit/mor.mjs check acts/… or read the full act)` : ''}`);
    }
    console.log('');
  }
  const same = [...byName.entries()].filter(([, ids]) => ids.length > 1);
  if (same.length) console.log(`You gave the same name to several identities: ${same.map(([n, ids]) => `${n}: ${ids.map(short).join(', ')}`).join('; ')}`);
}

/** The ids of the acts in acts/ signed by one of this folder's identities. */
function ownActs(me) {
  const dir = join(here, 'acts');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.mor') || !isHash(f.slice(0, -4))) continue;
    try {
      const d = mor.describeAct(new Uint8Array(readFileSync(join(dir, f))));
      if (me.has(d.signer)) out.push(d.id);
    } catch {
      // a private act this reader cannot open, or not an act
    }
  }
  return out;
}

function homesOf(name) {
  const f = kit.load(name);
  const out = [];
  for (const h of f.homes ?? []) {
    const r = kit.homeName(h);
    if (r) out.push(r);
  }
  return [...new Set(out)];
}

function cmdPost(name, text, refs) {
  if (!name || !text) throw new Error('post NAME TEXT (reply NAME ACT TEXT)');
  if (refs?.some((r) => !isHash(r))) throw new Error('an act is named by its full id, 64 lowercase hexadecimal characters');
  const homes = homesOf(name);
  if (!homes.length) throw new Error(`Dub cannot name ${name}'s homes from what you hold: run "node kit/mor.mjs identity show ${name}" and publish with the kit`);
  const made = kit.post(name, text, { isPublic: true, refs });
  const bytes = new Uint8Array(readFileSync(join(here, 'acts', `${made.id}.mor`)));
  const letters = homes.flatMap((h) => kit.publish(h, [bytes]).map((l) => `${h}: ${l.name}`));
  console.log(`Signed as ${name}: act ${made.id}\nSent to ${homes.join(', ')} on the postman's next pass:\n  ${letters.join('\n  ')}`);
}

function cmdName(id, labelText) {
  if (!isHash(id)) throw new Error('name ID LABEL: the identity written whole, 64 lowercase hexadecimal characters');
  const names = readJson('names.json', {});
  if (!labelText) {
    delete names[id];
    console.log(`Forgot your name for ${short(id)}.`);
  } else {
    const clash = Object.entries(names).filter(([k, v]) => k !== id && v.toLowerCase() === labelText.toLowerCase());
    names[id] = labelText;
    console.log(`${short(id)} is "${labelText}" for you.${clash.length ? ` You already call ${clash.map(([k]) => short(k)).join(', ')} that: two identities, one name.` : ''}`);
  }
  writeJson('names.json', names);
}

function cmdWho(id) {
  if (!isHash(id)) throw new Error('who ID: the identity written whole');
  const names = readJson('names.json', {});
  const all = held();
  const theirs = all.filter((x) => x.d.signer === id);
  console.log(label(id, names));
  console.log(`  full id ${id}`);
  if (!theirs.length) {
    console.log('  nothing signed by it in what you fetched');
    return;
  }
  const relays = [...new Set(theirs.map((x) => x.relay))];
  console.log(`  ${theirs.length} acts in what you fetched, at ${relays.join(', ')}; first at arrival ${theirs[0].arrival} (${theirs[0].relay})`);
  const first = theirs.map((x) => textOf(x.d)).find((t) => t);
  if (first) console.log(`  how its first post begins: "${first.split('\n')[0].slice(0, 100)}"`);
  const n = names[id];
  if (n) {
    const others = Object.entries(names).filter(([k, v]) => k !== id && v.toLowerCase() === n.toLowerCase());
    if (others.length) console.log(`  you also call ${others.map(([k]) => short(k)).join(', ')} "${n}"`);
  }
}

const { pos, opt } = parse(process.argv.slice(2));
const [cmd, ...rest] = pos;
try {
  if (!cmd || cmd === 'help') console.log(HELP);
  else if (cmd === 'fetch') cmdFetch(rest[0], opt);
  else if (cmd === 'read') cmdRead(rest[0], opt);
  else if (cmd === 'post') cmdPost(rest[0], rest.slice(1).join(' '));
  else if (cmd === 'reply') cmdPost(rest[0], rest.slice(2).join(' '), [rest[1]]);
  else if (cmd === 'name') cmdName(rest[0], rest.slice(1).join(' '));
  else if (cmd === 'who') cmdWho(rest[0]);
  else throw new Error(`Dub does not know "${cmd}": node dub.mjs help`);
} catch (e) {
  console.error(`dub: ${e?.message ?? e}`);
  process.exit(1);
}
