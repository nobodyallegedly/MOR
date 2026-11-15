// `mor-kishib agreements …`: the new Agreements acts from the command line,
// for the person on this computer (the runner's request path is the apps'
// way: `runner.ts`). Build an act's payload from its fields, check an act's
// bytes, or write, check and sign one with an identity's signing key.
//
// Signing takes the identity's signing key's words (or its `morsk1` string)
// on the first line of standard input, never as an argument, never echoed
// where the input is a terminal; they are checked against the key the
// identity's homes serve, used for this one act, and overwritten. Before
// anything is signed with that key, the act is checked (signed with a
// throwaway key), and the screen says the verdict, what it does not mean,
// and, for an act that binds the signer to Terms, the Terms as written and
// what draft 25 says the person can do whatever Terms say. Then it asks,
// with nothing preselected: type "sign" to sign it; anything else declines.
// The act is written to standard output (or `--out`), in hex, with its
// content key where it is private; Kišib sends it nowhere.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { hex, makeEveryday, unhex } from '../../genesis/src/core.ts';
import { readId } from '../../genesis/src/forms.ts';
import { fromCarried } from '../../../modules/carry/src/string.ts';
import { Refused as WordsRefused } from '../../../modules/carry/src/carry.ts';
import { lookCurrent, NOT_CURRENT } from '../../dub/src/carryin.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { AgreementsRefusal, NEW_ACTS, NEW_SPECS, PASS_MEANS_SAY, build, check, postcheck, precheckDraft, screen, verdictLine, type Held, type NewAct } from './agreements.ts';

export const AGREEMENTS_HELP = `mor-kishib agreements: the new Agreements acts (draft 25, encoding 2; the report, a proposal).
TEST IDENTITIES ONLY, until MOR is frozen. A pass means only that the bytes are well formed and signed.

  agreements specs                         The spec hash and type of each act.
  agreements build ACT FIELDS.json         The act's payload, in hex, built by the core library's
                                           builder (ACT: terms, statement or report).
  agreements check ACT.hex [--key HEX] [--held ACT.hex[,KEY]]...
                                           The checker's verdict about the act, and the rule it names.
  agreements sign ACT FIELDS.json --id ID --home URL [--sequence ID,ID] [--private] [--to ID,ID]
                  [--held ACT.hex[,KEY]]... [--words FILE] [--out FILE]
                                           Write the act, check it, show it, and sign it with the
                                           identity's signing key: its words (or its morsk1 string)
                                           on the first line of standard input; then type "sign".
                                           --words FILE: the Terms' words, shown where they match.`;

/** The command line's input and output, so a test can drive it. */
export interface Io {
  out: (s: string) => void;
  err: (s: string) => void;
  /** The next line of standard input (null at its end); `hidden`: not echoed where it is a terminal. */
  line: (prompt: string, hidden: boolean) => Promise<string | null>;
  via?: Via;
}

function opts(argv: string[]): { pos: string[]; o: Record<string, string[]>; flags: Set<string> } {
  const pos: string[] = [];
  const o: Record<string, string[]> = {};
  const flags = new Set<string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--private') flags.add('private');
    else if (a.startsWith('--')) (o[a.slice(2)] ??= []).push(argv[++i] ?? '');
    else pos.push(a);
  }
  return { pos, o, flags };
}

const bytesOf = (file: string): Uint8Array => {
  const t = readFileSync(file, 'utf8').trim();
  if (!/^([0-9a-f]{2})+$/i.test(t)) throw new Error(`${file}: not an act in hex`);
  return unhex(t.toLowerCase());
};

const heldOf = (v: string[] | undefined): Held[] =>
  (v ?? []).map((x) => {
    const [file, key] = x.split(',');
    return { act: bytesOf(file), ...(key ? { key: unhex(key) } : {}) };
  });

const list = (v: string[] | undefined) => (v ?? []).flatMap((x) => x.split(',')).map((x) => x.trim()).filter(Boolean);

/** Run `agreements …`; the exit code. */
export async function agreementsCli(argv: string[], io: Io): Promise<number> {
  const { pos, o, flags } = opts(argv);
  const [cmd, ...rest] = pos;
  try {
    switch (cmd) {
      case 'specs':
        for (const a of NEW_ACTS) io.out(`${a}: spec ${NEW_SPECS[a].spec}, type ${NEW_SPECS[a].type}`);
        return 0;
      case 'build': {
        const [act, file] = rest;
        io.out(hex(build(act as NewAct, JSON.parse(readFileSync(file, 'utf8')))));
        return 0;
      }
      case 'check': {
        const [file] = rest;
        if (!file) throw new Error('agreements check ACT.hex: the act to check');
        const a = check(bytesOf(file), o.key?.[0] ? unhex(o.key[0]) : null, heldOf(o.held));
        io.out(verdictLine(a));
        for (const i of a.invalid.slice(1)) io.out(`  also ${i.rule}: ${i.says}`);
        io.out(a.verdict === 'pass' ? PASS_MEANS_SAY : 'Kišib signs nothing that does not pass.');
        return a.verdict === 'pass' ? 0 : 1;
      }
      case 'sign':
        return await sign(rest, o, flags, io);
      default:
        io.out(AGREEMENTS_HELP);
        return cmd ? 2 : 0;
    }
  } catch (e) {
    io.err(e instanceof Error ? e.message : String(e));
    return 1;
  }
}

async function sign(rest: string[], o: Record<string, string[]>, flags: Set<string>, io: Io): Promise<number> {
  const [act, file] = rest;
  if (!NEW_ACTS.includes(act as NewAct) || !file) throw new Error('agreements sign ACT FIELDS.json: ACT is terms, statement or report');
  const id = readId(o.id?.[0] ?? '');
  const homes = list(o.home);
  if (!homes.length) throw new Error('--home URL: one of the identity’s homes, where its key is read');
  const held = heldOf(o.held);
  const words = o.words?.[0] ? readFileSync(o.words[0], 'utf8').replace(/\n$/, '') : undefined;
  // Built first: a payload the encoding would reject is refused before any word is asked.
  const payload = build(act as NewAct, JSON.parse(readFileSync(file, 'utf8')));
  const typed = await io.line('The identity’s signing key’s words (or its morsk1 string), used for this act and forgotten: ', true);
  if (!typed) throw new Error('No signing key’s words were given on standard input. Nothing was signed.');
  let seed: Uint8Array;
  try {
    seed = fromCarried(typed);
  } catch (e) {
    throw new Error(`${e instanceof WordsRefused ? e.message : String(e)}. Nothing was signed.`);
  }
  try {
    let look;
    try {
      look = await lookCurrent(id, seed, homes, io.via ?? {});
    } catch (e) {
      throw new Error(e instanceof Error && e.message === NOT_CURRENT ? `${NOT_CURRENT} Kišib signs with a signing key’s words only, never the chain key’s. Nothing was signed.` : `${e instanceof Error ? e.message : e} Nothing was signed.`);
    }
    const r = look.resolution;
    const d = {
      identity: id,
      binding: r.links[r.links.length - 1].act,
      spec: NEW_SPECS[act as NewAct].spec,
      type: NEW_SPECS[act as NewAct].type,
      payload,
      sequence: list(o.sequence),
      public: !flags.has('private'),
      ...(list(o.to).length ? { to: list(o.to).map(readId) } : {}),
    };
    if (!d.public && !d.to?.length) d.to = [id];
    const { answer, draft } = precheckDraft(d, held);
    for (const l of screen(d, answer, held, words, draft)) io.out(l);
    io.out(d.sequence.length ? `On the line you named, at position ${d.sequence.length + 1}.` : 'On a line of its own (position 1): no app continues it. Kišib sends it nowhere: it is written out, for you to send.');
    const yes = await io.line('Type “sign” to sign it with this identity’s key; anything else declines: ', false);
    if ((yes ?? '').trim() !== 'sign') {
      io.out('Declined. Nothing was signed.');
      return 3;
    }
    const made = makeEveryday({ signingSecret: seed, signer: d.identity, binding: d.binding, spec: d.spec, type: d.type, payload: d.payload, sequence: d.sequence, public: d.public, to: d.to }) as { act: Uint8Array; id: string; key: Uint8Array };
    const after = postcheck(made.act, d.public ? null : made.key, held);
    const lines = [`act ${hex(made.act)}`, `id ${made.id}`, ...(d.public ? [] : [`key ${hex(made.key)}`])];
    if (o.out?.[0]) writeFileSync(o.out[0], lines.join('\n') + '\n', { mode: 0o600 });
    else for (const l of lines) io.out(l);
    io.out(`Signed: ${made.id}. Checked again: ${verdictLine(after)}.`);
    return 0;
  } catch (e) {
    if (e instanceof AgreementsRefusal) throw new Error(e.message);
    throw e;
  } finally {
    seed.fill(0);
  }
}

/** Standard input and output, as a person uses them: words not echoed where the input is a terminal. */
export function terminalIo(): Io {
  const lines: string[] = [];
  const waiting: ((l: string | null) => void)[] = [];
  let ended = false;
  let rl: ReturnType<typeof createInterface> | null = null;
  let muted = false;
  const start = () => {
    if (rl) return;
    const output = process.stdin.isTTY ? { write: (s: string) => (muted ? true : process.stdout.write(s)) } : undefined;
    rl = createInterface({ input: process.stdin, output: output as unknown as NodeJS.WritableStream, terminal: !!process.stdin.isTTY });
    rl.on('line', (l) => (waiting.length ? waiting.shift()!(l) : lines.push(l)));
    rl.on('close', () => {
      ended = true;
      for (const w of waiting.splice(0)) w(null);
    });
  };
  return {
    out: (s) => console.log(s),
    err: (s) => console.error(s),
    line: (prompt, hidden) => {
      start();
      if (process.stdin.isTTY) process.stdout.write(prompt);
      muted = hidden;
      return new Promise((resolve) => {
        const done = (l: string | null) => {
          muted = false;
          if (process.stdin.isTTY && hidden) process.stdout.write('\n');
          resolve(l);
        };
        if (lines.length) done(lines.shift()!);
        else if (ended) done(null);
        else waiting.push(done);
      });
    },
  };
}

/** Close standard input once done, so the program can end. */
export const endInput = () => process.stdin.destroy();
