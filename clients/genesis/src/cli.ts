#!/usr/bin/env -S node --import tsx
// mor-genesis: the genesis client from the command line. Test identities
// only: the safety key is held in software, in the identity file.

import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SPECS, WITNESS_EXPLANATION, cborEncode, hex, unhex } from './core.ts';
import { createInterface } from 'node:readline/promises';
import { TestIdentity, lookUp, type Home, type Submitted } from './identity.ts';
import { relayAt, type Via } from './transport.ts';

const HELP = `mor-genesis: create and run MOR test identities.

A TEST IDENTITY HOLDS ITS SAFETY KEY IN SOFTWARE, in its file. A prototype,
never for a real identity. Keep the file secret: it holds every key.

  new --file F --home URL [--home URL ...] [--rule R] [--scheme 2|3]
        Create an identity whose homes are these relays (each home's operator is
        read from its /info, then checked by its receipts), send the genesis to
        each, and save the file. --home self@URL declares a self-hosted home.
        R: majority (default with several homes), authoritative:INDEX, threshold:K.
  routes --file F [--outbox URL ...] [--inbox URL ...]
        Publish new routes: where this identity's content is, where to deliver to it.
  enckey --file F
        Publish a new encryption key (X-Wing); the private half stays in the file.
  rotate --file F [--home URL ...] [--rule R]
        Sign a rotation with the safety key and send it to every home; take on the
        new keys once it counts. If one is pending, send the same bytes again.
  spread --file F
        Send every home what it missed, and the other homes' receipts.
  check ID --at URL
        Look an identity up as any reader: which rotation counts, routes, key.
  deliver --file F --to ID --at URL --target ACT --key HEX [--media]
        Deliver a content key to an identity's inbox, sealed with X-Wing.
  inbox --file F [--at URL ...]
        Open what was delivered to this identity (key deliveries, and messages, their
        text with invisible characters shown as escapes); --at: where to find senders.
  witness --file F ACT [ACT ...] [--relay URL ...]
        Sign a witness act: "I received this act and rely on it" (Identity type 15).
        What it does is shown first, and nothing is signed until you type RELY.
  export-operator --file F --out DIR
        Write operator.key (the everyday signing key and its binding, no safety
        key) and operator-chain.mor, for \`mor-relay init --operator-key ...\`.
  show --file F

Every command takes --via URL=LOCAL to reach an address another way (for
example the onion home at its local port, on the machine that runs it).`;

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const flag = ['media', 'help'].includes(k);
      (opts[k] ??= []).push(flag ? 'true' : argv[++i]);
    } else pos.push(a);
  }
  return { pos, opts };
}

function rule(r: string | undefined): number[] | undefined {
  if (!r || r === 'majority') return undefined;
  const [kind, n] = r.split(':');
  if (kind === 'authoritative') return [0, Number(n)];
  if (kind === 'threshold') return [1, Number(n)];
  throw new Error(`unknown rule ${r}`);
}

async function homesOf(urls: string[], via: Via): Promise<Home[]> {
  const out: Home[] = [];
  for (const u of urls) {
    if (u.startsWith('self@')) {
      out.push({ operator: null, hint: u.slice(5) });
      continue;
    }
    const info = await relayAt(u, via).info();
    const op = info.get(0);
    if (!(op instanceof Uint8Array)) throw new Error(`${u} declares no operator: not a home`);
    out.push({ operator: hex(op), hint: u });
  }
  return out;
}

/**
 * A message's text for a terminal: control and bidirectional characters are
 * written as visible escapes (Text MIP, rule 5a), so a sender cannot reach the
 * terminal or reorder what it shows. Line breaks stay.
 */
export function shownPlain(t: string): string {
  return t.replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, (c) => `\\u{${c.codePointAt(0)!.toString(16)}}`);
}

function report(what: string, sent: Submitted[]) {
  for (const s of sent) {
    const how = s.result?.receipt ? 'receipt' : s.result ? 'held' : `refused (${s.code}): ${s.error}`;
    console.log(`  ${what} → ${s.home}: ${how}`);
  }
}

async function main() {
  const { pos, opts } = parse(process.argv.slice(2));
  const cmd = pos[0];
  const one = (k: string) => opts[k]?.[0];
  const need = (k: string) => {
    const v = one(k);
    if (!v) throw new Error(`--${k} is needed`);
    return v;
  };
  const via: Via = Object.fromEntries((opts.via ?? []).map((v) => v.split('=') as [string, string]));
  const load = () => TestIdentity.load(need('file'), via);

  switch (cmd) {
    case 'new': {
      const file = need('file');
      if (existsSync(file)) throw new Error(`${file} exists: never overwrite an identity file`);
      const t = TestIdentity.create({
        homes: await homesOf(opts.home ?? [], via),
        rule: rule(one('rule')),
        scheme: one('scheme') === '3' ? 3 : 2,
        via,
      });
      t.save(file);
      console.log(`TEST identity ${t.id}`);
      report('genesis', await t.publishGenesis());
      break;
    }
    case 'routes': {
      const t = load();
      const routes = [
        ...(opts.outbox ?? []).map((h) => ({ scope: null, hints: [h] })),
        ...(opts.inbox ?? []).map((h) => ({ scope: null, hints: [h], kind: 1 as const })),
      ];
      const r = await t.publishRoutes(routes);
      t.save(need('file'));
      console.log(`routes ${r.id}`);
      report('routes', r.sent);
      break;
    }
    case 'enckey': {
      const t = load();
      const r = await t.publishEncryptionKey();
      t.save(need('file'));
      console.log(`encryption key ${r.id}`);
      report('encryption key', r.sent);
      break;
    }
    case 'rotate': {
      const t = load();
      if (!t.f.pending) {
        const homes = opts.home ? await homesOf(opts.home, via) : undefined;
        const id = t.prepareRotation({ homes, rule: one('rule') === 'majority' ? [] : rule(one('rule')) });
        t.save(need('file')); // before sending: a retry sends the same bytes
        console.log(`rotation ${id} signed with the safety key (held in software)`);
      } else console.log(`rotation ${t.f.pending.id} pending: sending the same bytes again`);
      report('rotation', await t.submitRotation());
      const { counts, lookup } = await t.settleRotation();
      t.save(need('file'));
      console.log(counts ? 'it counts: new keys in use' : `it does not count yet (${lookup.resolution.stop}); run rotate again`);
      break;
    }
    case 'spread': {
      const t = load();
      await t.spread();
      console.log('sent');
      break;
    }
    case 'check': {
      const id = pos[1];
      const l = await lookUp(id, opts.at ?? [], via);
      const r = l.resolution;
      console.log(`identity ${r.identity}`);
      for (const k of r.links) console.log(`  ${k.position}: ${k.act} (${k.how})`);
      console.log(`  then: ${r.stop}${r.waiting.length ? ' ' + r.waiting.join(', ') : ''}`);
      console.log(`  homes: ${r.homes.map((h) => `${h.hint} (${h.operator ?? 'self'})`).join(', ')}; rule ${r.effective}`);
      if (l.unreachable.length) console.log(`  not reached: ${l.unreachable.join(', ')}`);
      console.log(`  routes: ${l.routes.act ?? 'none'}${l.routes.contested ? ' (contested after it)' : ''}`);
      for (const x of l.routes.routes) console.log(`    ${x.kind === 1 ? 'inbox ' : 'outbox'} ${x.scope ?? '*'} ${x.hints.join(' ')}`);
      console.log(`  encryption key: ${l.encryptionKeyAct ?? 'none'}`);
      break;
    }
    case 'deliver': {
      const t = load();
      const r = await t.deliverKey({
        to: need('to'),
        hints: opts.at ?? [],
        target: need('target'),
        key: unhex(need('key')),
        media: one('media') === 'true',
      });
      t.save(need('file'));
      console.log(`key delivery ${r.delivery}, sealed ${r.sealed}, to ${r.inbox.join(', ')}`);
      break;
    }
    case 'inbox': {
      const t = load();
      const l = await lookUp(t.id, t.f.homes.map((h) => h.hint), via);
      const inbox = l.inbox(SPECS.envelope);
      if (!inbox) throw new Error('this identity declares no inbox');
      const got = await t.readInbox({ inbox, senderHints: [...(opts.at ?? []), ...t.f.homes.map((h) => h.hint)] });
      for (const g of got) {
        if (!g.opened) console.log(`${g.sealed}: not opened (${g.error})`);
        else
          console.log(
            `${g.sealed}: from ${g.from}, ${g.status}` +
              (g.delivery ? `, key for ${g.delivery.target}${g.delivery.media ? ' (media)' : ''}: ${hex(g.delivery.key)}` : '') +
              (g.text !== undefined ? `, a message:\n${shownPlain(g.text).replace(/^/gm, '  | ')}` : ''),
          );
      }
      break;
    }
    case 'witness': {
      const acts = pos.slice(1);
      if (!acts.length) throw new Error('name at least one act to witness');
      console.log(WITNESS_EXPLANATION);
      console.log(`Acts: ${acts.join(', ')}`);
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = (await rl.question('Type RELY to sign it, anything else to stop: ')).trim();
      rl.close();
      if (answer !== 'RELY') {
        console.log('Nothing signed.');
        break;
      }
      const t = load();
      const r = await t.witness(acts, { shown: WITNESS_EXPLANATION, relays: opts.relay ?? [] });
      t.save(need('file'));
      report('witness act', r.sent);
      console.log(`witness act ${r.id}`);
      break;
    }
    case 'export-operator': {
      const t = load();
      const out = need('out');
      // The relay's key file (relay/src/operator.rs, `Keys`): the everyday
      // signing key and the act that bound it. Never the safety key.
      const key = cborEncode(
        new Map<number, unknown>([
          [0, "The everyday signing key of a MOR home's operator. Keep it secret."],
          [1, unhex(t.id)],
          [2, unhex(t.f.binding)],
          [3, unhex(t.f.signingSecret)],
        ]),
      );
      writeFileSync(join(out, 'operator.key'), key, { mode: 0o600, flag: 'wx' });
      writeFileSync(join(out, 'operator-chain.mor'), cborEncode(new Map([[0, t.chainActs()]])), { flag: 'wx' });
      console.log(`wrote ${join(out, 'operator.key')} and ${join(out, 'operator-chain.mor')}`);
      break;
    }
    case 'show': {
      const t = load();
      console.log(`TEST identity ${t.id}`);
      console.log(`  position ${t.f.position}, binding ${t.f.binding}`);
      console.log(`  homes: ${t.f.homes.map((h) => `${h.hint} (${h.operator ?? 'self'})`).join(', ')}`);
      console.log(`  next safety key: scheme ${t.f.safety.scheme}, commitment ${t.nextSafety().commit}`);
      console.log(`  sequence: ${t.f.sequence.length} acts; routes v${t.f.routes?.version ?? 0}; encryption keys: ${t.f.encryption.length}`);
      if (t.f.pending) console.log(`  rotation pending: ${t.f.pending.id}`);
      break;
    }
    default:
      console.log(HELP);
  }
}

main().catch((e) => {
  console.error(`error: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
