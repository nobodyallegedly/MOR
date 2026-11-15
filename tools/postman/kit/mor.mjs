#!/usr/bin/env node
// The players' kit for MOR's round two: run it with Node.js inside your own
// folder, offline. `node kit/mor.mjs help` lists what it does. Your keys stay
// in keys/; acts you sign are kept in acts/; letters for the postman go to
// out/; its answers arrive in in/. TEST IDENTITIES ONLY.

import { existsSync, readFileSync } from 'node:fs';
import { Kit, describe, folderOf } from './lib/kit.mjs';
import { BANK, SPECS, b64, errorText, hex, isHash, mor, plain, unb64, unhex } from './lib/core.mjs';
import { MAX_SATS } from './lib/format.mjs';

const HELP = `MOR round two, the players' kit (offline; test identities only)

Identities (keys stay in keys/NAME.json, in this folder; keys/ holds identity files only):
  identity new NAME --home HOME [--home ...] [--scheme 2|3]
                                (HOME: a home's name from relays.md, read from its /info answer;
                                 the first time, the kit writes the /info letter and asks you to run again.
                                 Or OPERATOR@ADDRESS, written out)
  identity show NAME            identity list
  identity rotate NAME [--home OPERATOR@HINT ...]
  identity evidence NAME LETTER ...   (keep the identity records answered to GET /identity/ID and /identity/OPERATOR:
                                       after a rotation, the bank follows it only from its homes' receipts)

Acts (kept in acts/ID.mor; a private act's content key in acts/ID.key):
  post NAME TEXT [--refs ID,ID] [--private --to ID,ID --via RELAY]
                                (--refs: the acts it answers; --private --to … --via RELAY also seals it to them)
  sign NAME --spec HEX --type N (--payload-hex HEX | --payload-file FILE) [--private --to ID,ID] [--refs ID,ID] [--acks ID,ID]
  check FILE... [--key HEX]     (the core library's verdict on acts held together)

Sealing (private acts reach their recipients only sealed to their published encryption keys):
  identity enckey NAME          (a new encryption key; then: publish NAME --to HOME acts/ID.mor)
  seal NAME ACTFILE --to ID,ID --via RELAY   (where a recipient's key is not held yet, the kit writes the
                                letters asking for its record and seals on your next try, after a pass)
  open NAME (--letter LETTER | FILE)   (a sealed container, or a feed page from GET /feed?to=YOUR-ID)

The new Agreements acts (draft 25, encoding 2; the report block, proposal 4):
  agreements specs
  agreements words FILE         (the fingerprint of the words a Terms body names)
  agreements build terms|statement|report FIELDS.json
  agreements sign NAME terms|statement|report FIELDS.json [--held FILE[:KEYHEX] ...] [--private --to ID,ID]
                                (FIELDS.json: kit/AGREEMENTS-FIELDS.md, one worked example per act)
  agreements check FILE[:KEYHEX]...
  agreements ask ASK [ARG ...] --acts FILE[:KEYHEX] [FILE ...]   (agreements ask, alone: lists the asks)

cMIPs:
  spec hash FILE --creator ID [--kind N]   (the spec hash, as the core library computes it:
                                tagged_hash("MOR/spec", {0: kind, 1: creator, 9: text}); kind 0 by default)

Letters for the postman (written to out/; answers in in/):
  letter --to RELAY --get PATH
  letter --to RELAY --post PATH (--file FILE | --hex HEX | --text TEXT | --empty) [--content-type T] [--range bytes=A-B]
  publish NAME --to RELAY [--chain] [ACTFILE ...]   (one POST /acts letter per act; --chain sends the identity's chain acts first)
  chain ASK [ARG] [--verbose]    (getblockcount | getblockhash HEIGHT | getblockheader HASH | getblock HASH | getrawtransaction TXID)

The hosts' bank (orders signed by your identity's own key; whole sats only):
  bank open NAME                 bank balance NAME             bank address NAME
  bank invoice NAME --amount SATS [--memo TEXT | --hash HEX32] [--expiry SECONDS]
  bank pay NAME --invoice BOLT11 [--amount SATS] [--fee SATS]
  bank send NAME --address ADDRESS --amount SATS [--feerate SATS_PER_VBYTE]

Answers:
  read                  (every answer in in/, one line each)
  read LETTER [--save]  (one answer, its body described; --save keeps an act it carries in acts/)

  relays                (the relay names the hosts announce, from from-the-hosts/relays.md)

Everything stays in this folder. Never use /tmp: it is shared with other windows.
`;

function parse(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const flags = ['private', 'chain', 'verbose', 'save', 'empty', 'json'];
      const many = ['acts', 'held'];
      if (flags.includes(k)) opt[k] = true;
      else if (many.includes(k)) {
        // every value up to the next flag: --acts A B C
        let n = 0;
        while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
          (opt[k] ??= []).push(argv[++i]);
          n++;
        }
        if (!n) throw new Error(`--${k} needs at least one file`);
      } else {
        const v = argv[++i];
        if (v === undefined) throw new Error(`--${k} needs a value`);
        (opt[k] ??= []).push(v);
      }
    } else pos.push(a);
  }
  return { pos, opt };
}

const one = (opt, k) => (opt[k] ? opt[k][opt[k].length - 1] : undefined);
const list = (opt, k) => (opt[k] ? opt[k].flatMap((v) => v.split(',')).filter(Boolean) : undefined);
const say = (v) => console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 2));

function sats(s, what = 'amount') {
  if (s === undefined) return undefined;
  if (!/^\d+$/.test(s)) throw new Error(`${what} is in whole sats only: "${s}" is not a whole number (1 sat = 1 euro cent; no fractions)`);
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n < 1 || n > MAX_SATS) throw new Error(`${what} is a whole number of sats from 1`);
  return n;
}

function uint(s, what) {
  if (s === undefined) return undefined;
  if (!/^\d+$/.test(s)) throw new Error(`${what} is a whole number`);
  return Number(s);
}

/** Homes as given: a home's name (resolved from a held /info answer), or OPERATOR@ADDRESS. `asked` lists the /info letters written for names not yet resolved. */
function homesOf(opt, kit) {
  const asked = [];
  const homes = (opt.home ?? []).map((h) => {
    const at = h.indexOf('@');
    if (at < 0 && !isHash(h)) {
      const r = kit.homeByName(h);
      if (r.ask) {
        asked.push(`${h}: ${r.ask}`);
        return null;
      }
      return { ...r.home, name: h };
    }
    const op = at < 0 ? h : h.slice(0, at);
    const hint = at < 0 ? '' : h.slice(at + 1);
    if (!isHash(op)) throw new Error(`--home is a home's name from relays.md, or OPERATOR@ADDRESS: "${h}"`);
    return { operator: op, hint };
  });
  if (asked.length) throw new Error(`the kit does not hold these homes' /info yet, so it wrote the letters asking for them (${asked.join('; ')}). After the postman's next pass, run the same command again. Nothing was made`);
  return homes;
}

/** An act file, with its content key: FILE or FILE:KEYHEX, or FILE with FILE's .key beside it. */
function heldOf(spec) {
  const m = /^(.*?)(?::([0-9a-f]{64}))?$/.exec(spec);
  const file = m[1];
  const act = new Uint8Array(readFileSync(file));
  let key = m[2] ? unhex(m[2]) : null;
  const kf = file.replace(/\.mor$/, '.key');
  if (!key && kf !== file && existsSync(kf)) key = unhex(readFileSync(kf, 'utf8').trim());
  return key ? { act, key } : { act };
}

function bytesOf(opt) {
  if (opt.file) return new Uint8Array(readFileSync(one(opt, 'file')));
  if (opt.hex) {
    const h = one(opt, 'hex');
    if (!/^([0-9a-fA-F]{2})*$/.test(h)) throw new Error('--hex is bytes in hexadecimal');
    return unhex(h.toLowerCase());
  }
  if (opt.text) return new Uint8Array(Buffer.from(one(opt, 'text'), 'utf8'));
  if (opt.empty) return new Uint8Array();
  return null;
}

function main(argv) {
  const { pos, opt } = parse(argv);
  const [cmd, sub, ...rest] = pos;
  const kit = new Kit(folderOf(), process.env.MOR_TRAY);
  kitRef = kit;
  kit.names(); // warns of anything in keys/ that is not an identity file
  const relaysSaid = () => kit.relaysNote() ?? 'The hosts have not written from-the-hosts/relays.md yet: ask them for the relay names.';
  if (!cmd || cmd === 'help') return say(`${HELP}\nRelay names, as the hosts announce them:\n${relaysSaid()}`);
  if (cmd === 'relays') return say(relaysSaid());

  if (cmd === 'identity') {
    if (sub === 'new') {
      const f = kit.newIdentity(rest[0], homesOf(opt, kit), { scheme: Number(one(opt, 'scheme') ?? 2) });
      return say({ made: rest[0], identity: f.identity, genesis: `acts/${f.identity}.mor`, keys: `keys/${rest[0]}.json`, next: `publish its genesis to its homes: node kit/mor.mjs publish ${rest[0]} --to HOME --chain` });
    }
    if (sub === 'show') {
      const f = kit.load(rest[0]);
      const r = kit.resolve(rest[0]);
      return say({ name: rest[0], identity: f.identity, binding: f.binding, chain: r.links.map((l) => l.act), stop: r.stop, homes: f.homes, lines: Object.fromEntries(Object.entries(f.lines).map(([k, l]) => [k, l.length])), bankOrders: f.bankN ?? 0 });
    }
    if (sub === 'list') return say(kit.names().map((n) => `${n} ${kit.load(n).identity}`).join('\n') || 'no identities yet');
    if (sub === 'enckey') {
      const e = kit.encryptionKey(rest[0]);
      return say({ encryptionKey: e.id, version: e.version, file: `acts/${e.id}.mor`, next: `publish it to every home: node kit/mor.mjs publish ${rest[0]} --to HOME acts/${e.id}.mor` });
    }
    if (sub === 'evidence') {
      const [name, ...letters] = rest;
      const bodies = letters.map((l) => {
        const a = kit.answer(l);
        if (!a.bytes) throw new Error(`the answer to ${l} carries no body`);
        return a.bytes;
      });
      return say({ kept: kit.evidence(name, bodies), for: name, note: 'bank orders now carry these acts, so the bank can follow the chain' });
    }
    if (sub === 'rotate') {
      const homes = opt.home ? homesOf(opt, kit) : undefined;
      const r = kit.rotate(rest[0], { homes });
      return say({ rotated: rest[0], rotation: r.id, file: `acts/${r.id}.mor`, next: `send it to every home (node kit/mor.mjs publish ${rest[0]} --to HOME acts/${r.id}.mor); then ask each home for /identity/${kit.load(rest[0]).identity} and /identity/OPERATOR and keep the answers (identity evidence ${rest[0]} LETTER ...) before the next bank order` });
    }
  }

  if (cmd === 'post') {
    const [name, ...words] = [sub, ...rest];
    const to = list(opt, 'to');
    const via = one(opt, 'via');
    if (opt.private && via && !to?.length) throw new Error('a private post sealed --via a relay names its recipients with --to');
    if (opt.private && via) {
      const missing = kit.missingKeys(to);
      if (missing.length) {
        const r = kit.askRecords(name, missing, via);
        return say({ notYet: `nothing was signed: the kit does not hold the encryption key of ${missing.join(', ')}. It wrote letters asking ${r.at.join(', ')} for their records. After the postman's next pass, run the same command again: it will sign and seal then. If a record shows no encryption key, that identity has to publish one first (identity enckey)`, letters: r.letters });
      }
      const no = kit.refusesSealed(via);
      if (no) throw new Error(`${via} answered ${no} to a sealed container before: it does not take sealed containers (POST /sealed). Use --via a relay or home that does. Nothing was signed`);
    }
    const made = kit.post(name, words.join(' '), { isPublic: !opt.private, to, refs: list(opt, 'refs') });
    const out = { signed: made.id, file: `acts/${made.id}.mor`, ...(opt.private ? { key: hex(made.key) } : {}) };
    if (opt.private && via) {
      const s = kit.seal(made.act, to, via, made.key);
      Object.assign(out, { sealed: s.file.slice(kit.folder.length + 1), letter: s.letter.name, to: s.to });
    } else if (opt.private) out.next = `sealed to nobody yet: node kit/mor.mjs seal ${name} acts/${made.id}.mor --to ${to?.join(',') ?? 'ID'} --via RELAY`;
    return say(out);
  }

  if (cmd === 'seal') {
    const [name, file] = [sub, ...rest];
    const to = list(opt, 'to');
    if (!name || !file || !to?.length) throw new Error('seal NAME ACTFILE --to ID,ID --via RELAY');
    const h = heldOf(file);
    const missing = kit.missingKeys(to);
    if (missing.length) {
      const r = kit.askRecords(name, missing, one(opt, 'via'));
      return say({ notYet: `nothing was sealed: the kit does not hold the encryption key of ${missing.join(', ')}. It wrote letters asking ${r.at.join(', ') || 'nobody (give --via RELAY)'} for their records. After the postman's next pass, run the same command again`, letters: r.letters });
    }
    const s = kit.seal(h.act, to, one(opt, 'via'), h.key ?? null);
    return say({ sealed: s.file.slice(kit.folder.length + 1), letter: s.letter?.name ?? 'none: give --via RELAY to send it', to: s.to });
  }

  if (cmd === 'open') {
    const name = sub;
    let bytes;
    if (opt.letter) {
      const a = kit.answer(one(opt, 'letter'));
      if (!a.bytes) throw new Error('that answer carries no body');
      bytes = a.bytes;
    } else if (rest[0]) bytes = new Uint8Array(readFileSync(rest[0]));
    else throw new Error('open NAME --letter LETTER, or open NAME FILE');
    return say(kit.open(name, bytes));
  }

  if (cmd === 'sign') {
    const spec = one(opt, 'spec');
    if (!isHash(spec)) throw new Error('--spec is a spec hash, 64 hexadecimal characters');
    const payload = opt['payload-file'] ? new Uint8Array(readFileSync(one(opt, 'payload-file'))) : unhex(one(opt, 'payload-hex') ?? '');
    const made = kit.sign(sub, { spec, type: uint(one(opt, 'type'), '--type') ?? 0, payload, isPublic: !opt.private, to: list(opt, 'to'), refs: list(opt, 'refs'), acks: list(opt, 'acks') });
    return say({ signed: made.id, file: `acts/${made.id}.mor`, ...(opt.private ? { key: hex(made.key) } : {}) });
  }

  if (cmd === 'check') {
    const files = [sub, ...rest].filter(Boolean);
    const v = new mor.Verifier(SPECS.identity, SPECS.money, SPECS.agreements, SPECS.envelopes, SPECS.text);
    const ids = files.map((f) => {
      const h = heldOf(f);
      return h.key ? v.addWithKey(h.act, h.key) : v.add(h.act);
    });
    return say(ids.map((id, i) => ({ file: files[i], id, status: v.status(id) })));
  }

  if (cmd === 'agreements') {
    if (sub === 'specs') return say(Kit.agreementsSpecs());
    if (sub === 'words') return say({ words: mor.workHash(new Uint8Array(readFileSync(rest[0]))), of: rest[0], note: 'the fingerprint a Terms body names in "words": the file’s bytes, exactly' });
    if (sub === 'build') return say(hex(Kit.agreementsBuild(rest[0], JSON.parse(readFileSync(rest[1], 'utf8')))));
    if (sub === 'check') {
      const held = rest.map(heldOf);
      const answers = held.length > 1 ? mor.agreementsNewCheckHeld(held) : [Kit.agreementsCheck(held[0].act, held[0].key ?? null)];
      return say(answers);
    }
    if (sub === 'sign') {
      const [name, act, fieldsFile] = rest;
      const held = (opt.held ?? []).map(heldOf);
      const r = kit.agreementsSign(name, act, JSON.parse(readFileSync(fieldsFile, 'utf8')), { held, isPublic: !opt.private, to: list(opt, 'to') });
      if (!r.signed) {
        say({ refused: `nothing was signed: the check ${r.stage} answered ${r.check.verdict}${r.check.rule ? `, ${r.check.rule}` : ''}`, check: r.check });
        process.exitCode = 1;
        return;
      }
      return say({ signed: r.signed.id, file: `acts/${r.signed.id}.mor`, check: r.check, note: 'A pass means only that the bytes are well formed and signed; the grammar’s answers are agreements ask.', ...(r.assent ? { notInForceYet: r.assent.says, signYourAssent: r.assent.command } : {}) });
    }
    if (sub === 'questions') return say(JSON.parse(mor.agreementsNewQuestions()));
    if (sub === 'ask' && !rest.length) return say({ asks: JSON.parse(mor.agreementsNewQuestions()), usage: 'agreements ask ASK [ARG ...] --acts FILE[:KEYHEX] ...' });
    if (sub === 'ask') {
      const [ask, ...args] = rest;
      const acts = (opt.acts ?? []).map(heldOf).map((h) => ({ bytes: h.act, ...(h.key ? { key: h.key } : {}) }));
      return say(JSON.parse(mor.agreementsNewAsk({ acts, ask, args })));
    }
  }

  if (cmd === 'spec' && sub === 'hash') {
    const file = rest[0];
    const creator = one(opt, 'creator');
    if (!file || !isHash(creator)) throw new Error('spec hash FILE --creator ID (the creator: an identity hash)');
    const raw = readFileSync(file, 'utf8');
    const text = raw.endsWith('\r\n') ? raw.slice(0, -2) : raw.endsWith('\n') ? raw.slice(0, -1) : raw; // at most one final line break, as Development rule 26 reads a file
    mor.checkText(text);
    const kind = uint(one(opt, 'kind'), '--kind') ?? 0;
    const content = mor.cborEncode(new Map([[0, kind], [1, unhex(creator)], [9, text]]));
    const d = mor.decodeSpec(content);
    return say({ hash: d.hash, kind: d.kind, creator: d.creator, textBytes: Buffer.byteLength(text), computed: 'by the core library (decodeSpec): tagged_hash("MOR/spec", {0: kind, 1: creator, 9: text}), the file read as Development rule 26 reads it (at most one final line break removed)' });
  }

  if (cmd === 'letter') {
    const to = one(opt, 'to');
    if (!to) throw new Error('letter --to RELAY: the relay by its name in the hosts’ list');
    if (opt.get) return say(kit.relayLetter(to, 'GET', one(opt, 'get'), null, { range: one(opt, 'range') }));
    if (opt.post) {
      const body = bytesOf(opt);
      if (body === null) throw new Error('a POST carries --file FILE, --hex HEX, --text TEXT or --empty');
      return say(kit.relayLetter(to, 'POST', one(opt, 'post'), body, { contentType: one(opt, 'content-type') }));
    }
    throw new Error('letter --to RELAY --get PATH, or --post PATH with a body');
  }

  if (cmd === 'publish') {
    const to = one(opt, 'to');
    if (!to) throw new Error('publish NAME --to RELAY');
    const acts = [...(opt.chain ? kit.chainActs(sub) : []), ...rest.map((f) => new Uint8Array(readFileSync(f)))];
    if (!acts.length) throw new Error('nothing to publish: give act files, or --chain');
    return say(kit.publish(to, acts).map((l) => l.name));
  }

  if (cmd === 'chain') {
    const arg = rest[0] === undefined ? undefined : sub === 'getblockhash' ? uint(rest[0], 'the height') : rest[0];
    return say(kit.chainLetter(sub, arg, opt.verbose ? true : undefined));
  }

  if (cmd === 'bank') {
    const name = rest[0];
    const fields = {};
    if (sub === 'invoice') {
      fields.amount = sats(one(opt, 'amount'));
      fields.memo = one(opt, 'memo');
      if (opt.hash) {
        const h = one(opt, 'hash');
        if (!isHash(h)) throw new Error('--hash is a description hash, 64 hexadecimal characters');
        fields.hash = unhex(h);
      }
      fields.expiry = uint(one(opt, 'expiry'), '--expiry');
    } else if (sub === 'pay') {
      fields.invoice = one(opt, 'invoice');
      fields.amount = sats(one(opt, 'amount'));
      fields.fee = uint(one(opt, 'fee'), '--fee');
    } else if (sub === 'send') {
      fields.address = one(opt, 'address');
      fields.amount = sats(one(opt, 'amount'));
      fields.feerate = uint(one(opt, 'feerate'), '--feerate');
    } else if (!['open', 'balance', 'address'].includes(sub)) throw new Error('bank open | balance | invoice | pay | send | address');
    return say(kit.bankOrder(name, sub, fields));
  }

  if (cmd === 'read') {
    if (!sub) {
      const lines = kit.answers().map((n) => {
        const a = kit.answer(n);
        return `${n}  ${a.outcome}${a.status !== undefined ? ` ${a.status}` : ''}  ${a.to ?? ''}${a.path ? ` ${a.method} ${a.path}` : ''}${a.reason ? `  ${a.reason}` : ''}`;
      });
      return say(lines.join('\n') || 'no answers yet in in/');
    }
    const a = kit.answer(sub);
    const { bytes, ...rest2 } = a;
    const out = { ...rest2 };
    if (bytes) {
      const d = describe(bytes);
      out.body = d;
      if (opt.save && d.act) out.saved = `acts/${kit.saveAct(bytes)}.mor`;
    }
    return say(out);
  }

  throw new Error(`unknown command "${cmd}": node kit/mor.mjs help`);
}

let kitRef = null;
try {
  main(process.argv.slice(2));
} catch (e) {
  console.error(`mor: ${errorText(e)}`);
  process.exitCode = 1;
} finally {
  for (const w of kitRef?.warnings ?? []) console.error(`mor: note: ${w}`);
}
