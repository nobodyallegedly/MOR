#!/usr/bin/env node
// The postman of MOR's round two, run by the hosts on the Mac, in Terminal.
// `node postman.mjs help` says what it does; README.md says it in plain words.

import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './lib/config.mjs';
import { Postman } from './lib/courier.mjs';
import { LncliWallet, MockWallet, lastJson } from './lib/wallet.mjs';
import { Tray } from './lib/trays.mjs';

const HELP = `The postman of round two (hosts only). Every command takes --config FILE (the hosts' configuration).

  run      carry letters, pass after pass, until Ctrl-C (it finishes the letter in hand, then stops)
  once     one pass, then stop
  check    the configuration, every tray, every relay's /info, and the wallet's nodes
  fund     the starting money it would credit (nothing moves); with --send, credit it
  bank     every account, the bank's total, and what the nodes hold
  kit      copy the players' kit and the tray guide into every tray that has none (with --send; without, only says where)
           with --update too: replace the kit's own files in every tray's kit/ (and from-the-hosts/tray-guide.md),
           never touching keys/, acts/, or any other file of the player's, in kit/ or elsewhere
`;

const here = dirname(fileURLToPath(import.meta.url));

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--send') o.send = true;
    else if (argv[i] === '--update') o.update = true;
    else if (argv[i] === '--config') o.config = argv[++i];
    else o._.push(argv[i]);
  }
  return o;
}

function walletOf(cfg) {
  if (cfg.wallet.kind === 'lncli') return new LncliWallet(cfg.wallet);
  if (cfg.wallet.kind === 'mock') return new MockWallet();
  return null;
}

/** One postman at a time: a lock file in its own folder, naming the process that holds it. */
function lock(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const p = join(dir, 'postman.lock');
  for (let i = 0; i < 2; i++) {
    try {
      fs.writeFileSync(p, String(process.pid), { flag: 'wx' });
      return () => fs.rmSync(p, { force: true });
    } catch {
      const pid = Number(fs.readFileSync(p, 'utf8'));
      try {
        process.kill(pid, 0);
        throw new Error(`another postman is running (process ${pid}); stop it first`);
      } catch (e) {
        if (e.code !== 'ESRCH') throw e;
        fs.rmSync(p, { force: true });
      }
    }
  }
  throw new Error('could not take the lock');
}

const line = (e) => {
  const what = e.event === 'carried' ? `${e.to}${e.method ? ` ${e.method} ${e.path}` : e.ask ? ` ${e.ask}` : ''} → ${e.outcome}${e.status ? ` ${e.status}` : ''}${e.reason ? `: ${e.reason}` : ''}` : `${e.event}${e.reason ? `: ${e.reason}` : ''}`;
  console.log(`${e.time.slice(11, 19)} [${e.tray ?? '-'}] ${e.letter ?? ''} ${what}`);
};

async function main() {
  const o = args(process.argv.slice(2));
  const cmd = o._[0];
  if (!cmd || cmd === 'help') return console.log(HELP);
  if (!o.config) throw new Error('give --config FILE, the hosts’ configuration (see hosts.example.json)');
  const cfg = loadConfig(o.config);
  const wallet = walletOf(cfg);

  if (cmd === 'check') {
    console.log(`round folder: ${cfg.root}\npostman's folder: ${cfg.postmanDir} (its log: ${join(cfg.postmanDir, 'log', 'carried.jsonl')})`);
    for (const t of cfg.trays) {
      try {
        new Tray(cfg.root, t).open();
        console.log(`tray ${t}: ok`);
      } catch (e) {
        console.log(`tray ${t}: ${e.message}`);
      }
    }
    for (const [n, u] of Object.entries(cfg.relays)) {
      try {
        const r = await fetch(`${u.replace(/\/+$/, '')}/info`, { signal: AbortSignal.timeout(5000) });
        console.log(`relay ${n}: answers (${r.status})`);
      } catch (e) {
        console.log(`relay ${n}: no answer (${e?.cause?.code ?? e.name})`);
      }
    }
    if (wallet) for (const n of wallet.nodes()) {
      const w = await wallet.getInfo(n);
      const j = lastJson(w.stdout);
      console.log(`node ${n}: ${w.code === 0 && j ? `synced ${j.synced_to_chain}, height ${j.block_height}` : `no answer (${w.stderr.trim() || w.error || w.code})`}`);
    }
    else console.log('wallet: none (bank letters are refused)');
    return;
  }

  if (cmd === 'kit') {
    const src = join(here, 'kit');
    for (const t of cfg.trays) {
      const tray = new Tray(cfg.root, t);
      tray.open();
      const dest = join(tray.dir, 'kit');
      const has = fs.existsSync(dest) || isLink(dest);
      if (has && !o.update) {
        console.log(`${t}: has a kit/ already, left as it is (--update replaces its files)`);
        continue;
      }
      if (!o.send) {
        console.log(`${t}: would ${has ? 'replace the kit’s files in' : 'copy the kit to'} ${dest}`);
        continue;
      }
      try {
        const n = placeTree(src, dest);
        const fh = join(tray.dir, 'from-the-hosts');
        if (fs.existsSync(fh) && !isLink(fh) && fs.lstatSync(fh).isDirectory()) placeFile(join(here, 'kit', 'TRAY-GUIDE.md'), join(fh, 'tray-guide.md'), o.update);
        console.log(`${t}: kit ${has ? 'updated' : 'copied'} (${n} files)`);
      } catch (e) {
        console.log(`${t}: refused: ${e.message}`);
      }
    }
    return;
  }

  const unlock = lock(cfg.postmanDir);
  try {
    const pm = new Postman(cfg, { wallet, say: line });
    if (cmd === 'once') {
      const n = await pm.pass();
      console.log(`one pass: ${n} letter(s) carried`);
    } else if (cmd === 'run') {
      let stop = false;
      process.on('SIGINT', () => {
        if (stop) process.exit(130);
        stop = true;
        console.log('stopping after the letter in hand (Ctrl-C again to stop at once)');
      });
      console.log(`postman running: ${cfg.trays.length} trays, ${Object.keys(cfg.relays).length} relays, a pass every ${cfg.everySeconds} s. Ctrl-C stops it. Log: ${join(cfg.postmanDir, 'log', 'carried.jsonl')}`);
      while (!stop) {
        await pm.pass();
        for (let i = 0; i < cfg.everySeconds * 10 && !stop; i++) await new Promise((r) => setTimeout(r, 100));
      }
      console.log('postman stopped');
    } else if (cmd === 'fund') {
      if (!pm.bank) throw new Error('no wallet is configured: there is no bank to fund');
      const plan = pm.bank.fund({ send: !!o.send, readTop: (tray, file) => new Tray(cfg.root, tray).topFile(file, 1 << 20) });
      for (const p of plan) console.log(p.amount ? `${p.done ? 'CREDITED' : 'WOULD CREDIT'} ${p.amount} sats to ${p.tray} ${p.identity}` : `${p.wait ? 'WAITING' : 'SKIPPED'} ${p.tray}${p.identity ? ` ${p.identity}` : ''}: ${p.wait ?? p.skip}${p.line ? ` (“${p.line.trim()}”)` : ''}`);
      if (!o.send) console.log('Nothing credited. Run again with --send.');
      else pm.deliverNotices();
    } else if (cmd === 'bank') {
      if (!pm.bank) throw new Error('no wallet is configured');
      console.log(JSON.stringify(await pm.bank.summary(), null, 2));
    } else throw new Error(`unknown command ${cmd}`);
  } finally {
    unlock();
  }
}

function isLink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Put the kit's files at `dest`: folders made where missing (a link or a
 * file where a folder should be is refused), each of the kit's own files
 * replaced (a link in its place is removed, never followed). Nothing else
 * in `dest` is touched.
 */
function placeTree(src, dest) {
  if (isLink(dest)) throw new Error(`${dest} is a symbolic link: not followed, not replaced`);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest);
  else if (!fs.lstatSync(dest).isDirectory()) throw new Error(`${dest} is not a folder`);
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const s = join(src, e.name);
    const d = join(dest, e.name);
    if (e.isDirectory()) n += placeTree(s, d);
    else if (e.isFile()) {
      placeFile(s, d, true);
      n++;
    }
  }
  return n;
}

function placeFile(s, d, replace) {
  if (fs.existsSync(d) || isLink(d)) {
    if (!replace) return;
    const st = fs.lstatSync(d);
    if (st.isDirectory()) throw new Error(`${d} is a folder where the kit has a file`);
    fs.unlinkSync(d);
  }
  fs.copyFileSync(s, d, fs.constants.COPYFILE_EXCL);
}

main().catch((e) => {
  console.error(`postman: ${e.message}`);
  process.exitCode = 1;
});
