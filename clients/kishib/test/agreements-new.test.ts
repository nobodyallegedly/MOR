// The new Agreements acts in Kišib (Agreements written from scratch, draft
// 25, in the bytes of encoding 2; the report, the report block's fourth
// proposal): Terms, a Statement and a report, each written from the
// binding's builders, checked before the identity's key signs anything,
// shown as written, and signed with the identity's own key, through the
// runner (an app's request, by its JSON door and by the panel's words in
// Kišib's page) and through the command line.
//
// - Every valid vector (core/vectors/agreements-new/valid.json): its
//   payload, signed through Kišib's runner by a test identity Kišib holds
//   (the case's earlier acts signed first, each naming the new one where it
//   named the old), passes, with the vector's notes.
// - Every invalid vector: Kišib's check gives the vector's verdict and the
//   rule it names; and, wherever what fails is something an app hands Kišib
//   (its spec, type, payload, objects, acks, the acts held), Kišib asked to
//   sign it refuses, naming that rule, nothing signed, nothing waiting.
// - Before a Terms act or an assent: no terms-reading cMIP for draft 25
//   exists, said; the Terms' fields as written; what draft 25 says a person
//   can do whatever Terms say, by rule; and what a pass does not mean.
//
// TEST IDENTITIES ONLY.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cborDecode, cborEncode, describeAct, hex, unhex, workHash } from '../../genesis/src/core.ts';
import { dub, everything, kishib, refused, runnerOn, start, stopAll, type Relay } from './world.ts';
import type { RunnerView } from '../src/runner.ts';
import { panel } from '../src/page/panel.ts';
import type { RunnerRequest } from '../src/runner-read.ts';
import { ALWAYS_SAY, GRAMMAR_SAY, NEW_SPECS, NO_READER_SAY, PASS_MEANS_SAY, check, isNewSpec, newActOf, opened, type Held } from '../src/agreements.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const vectors = (f: string) => JSON.parse(readFileSync(join(here, '../../core/vectors/agreements-new', f), 'utf8')) as { cases: Case[] };
interface Case {
  name: string;
  tests: string;
  acts: { bytes: string; id: string; key: string | null }[];
  answer: { verdict: string; rule: string | null; notes: string[]; says: string };
}

let homes: Relay[];
let relay: Relay;
let world: Awaited<ReturnType<typeof setUp>>;

const ORIGIN = 'http://127.0.0.1:1';

async function setUp() {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words });
  const probe = k.app.runner.pair({ name: 'Probe', origin: ORIGIN });
  k.app.runner.approve({ pairing: probe.pairing, identities: [a.id] });
  const binding = k.app.runner.paired(probe.token).identities[0].binding;
  return { a, words, k, token: probe.token, pairing: probe.pairing, binding, lines: { public: [] as string[], private: [] as string[] } };
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  world = await setUp();
});

after(async () => {
  await stopAll();
});

/** Asked of the runner, answered "Sign it" in Kišib's page: the act as the app gets it, and its content key. */
async function signThrough(req: RunnerRequest): Promise<{ act: Uint8Array; id: string; key: Uint8Array; words: string[] }> {
  const { k, token } = world;
  const a = await k.app.runner.ask(token, req, k.app.base);
  assert.ok('asks' in a, `an agreements act always asks: ${JSON.stringify(a)}`);
  assert.equal(a.asks.kind, 'agreements');
  const w = (await k.c.ask<RunnerView>('runner state')).waiting.find((x) => x.request === a.asks.request)!;
  assert.equal(w.always, true, 'no standing yes is offered for an agreements act');
  await k.c.ask('runner answer', { request: a.asks.request, yes: true });
  const r = await k.app.runner.result(token, { request: a.asks.request });
  assert.ok('signed' in r, JSON.stringify(r));
  return { act: Uint8Array.from(Buffer.from(r.signed.act, 'base64')), id: r.signed.id, key: Uint8Array.from(Buffer.from(r.signed.key, 'base64')), words: w.words };
}

/** A request for the identity Kišib holds, on its public or private line, continuing it. */
function request(o: { spec: string; type: number; payload: Uint8Array; public: boolean; to?: string[]; objects?: [string, string][]; acks?: string[]; held?: Held[]; termsWords?: string }): RunnerRequest {
  const line = o.public ? 'public' : 'private';
  return {
    identity: world.a.id,
    binding: world.binding,
    line,
    sequence: [...world.lines[line]],
    spec: o.spec,
    type: o.type,
    payload: o.payload,
    public: o.public,
    ...(o.public ? {} : { to: o.to?.length ? o.to : [world.a.id] }),
    ...(o.objects?.length ? { objects: o.objects } : {}),
    ...(o.acks?.length ? { acks: o.acks } : {}),
    ...(o.held ? { held: o.held } : {}),
    ...(o.termsWords !== undefined ? { termsWords: o.termsWords } : {}),
  };
}

/** Every fingerprint equal to an old act's id, anywhere in a value, replaced by the new act's id. */
function remap(v: unknown, ids: Map<string, string>): unknown {
  if (v instanceof Uint8Array) return v.length === 32 && ids.has(hex(v)) ? unhex(ids.get(hex(v))!) : v;
  if (Array.isArray(v)) return v.map((x) => remap(x, ids));
  if (v instanceof Map) return new Map([...v.entries()].map(([k, x]) => [k, remap(x, ids)]));
  return v;
}

/** The sets of each payload (encoding 2, E18), by key: sorted again once their ids were replaced, as a writer would write them. */
const SETS: Record<'terms' | 'statement' | 'report', number[]> = { terms: [3, 5, 7, 15, 17], statement: [7, 8, 10], report: [1] };
function sortedSets(spec: string, type: number, m: unknown): unknown {
  const act = newActOf(spec, type);
  if (!act || !(m instanceof Map)) return m;
  const order = (a: unknown, b: unknown) => Buffer.compare(Buffer.from(cborEncode(a)), Buffer.from(cborEncode(b)));
  for (const k of SETS[act]) if (Array.isArray(m.get(k))) m.set(k, [...(m.get(k) as unknown[])].sort(order));
  return m;
}

/**
 * A vector's acts, signed again through Kišib's runner as the identity it
 * holds, standing for the case's signer (the signer of its last act): each
 * of that signer's acts that passes on its own is signed in order, the
 * later payloads naming the new ids where they named the old; another
 * signer's act, and an act that does not pass on its own (a held act that
 * is rejected), is held as it is. The last act is returned unsigned, as the
 * request to make, with the acts held, and how many acts were signed.
 */
async function again(c: Case): Promise<{ last: RunnerRequest | null; held: Held[]; signed: number }> {
  const ids = new Map<string, string>();
  const held: Held[] = [];
  let signed = 0;
  const x0 = c.acts.at(-1)!;
  const signer = opened(unhex(x0.bytes), x0.key ? unhex(x0.key) : null)?.signer ?? (describeAct(unhex(x0.bytes)) as { signer?: string }).signer;
  const reqOf = (bytes: Uint8Array, key: Uint8Array | null) => {
    const o = opened(bytes, key);
    if (!o) return null;
    const d = describeAct(bytes) as { objects?: [string, string][]; acks?: string[] };
    const inside = key ? (opened(bytes, key) as unknown as { objects?: [string, string][]; acks?: string[] }) : d;
    let payload = o.payload;
    try {
      // Re-sorted only where an id was replaced: an invalid vector's own disorder (E18) is kept as it is.
      payload = ids.size ? cborEncode(sortedSets(o.spec, o.type, remap(cborDecode(o.payload), ids))) : cborEncode(cborDecode(o.payload));
    } catch {
      // a payload that is no CBOR value: as it is
    }
    return request({ spec: o.spec, type: o.type, payload, public: o.public, to: o.to?.filter((t) => t !== o.signer), objects: inside.objects, acks: inside.acks });
  };
  for (const x of c.acts.slice(0, -1)) {
    const bytes = unhex(x.bytes);
    const key = x.key ? unhex(x.key) : null;
    const own = (describeAct(bytes) as { signer?: string }).signer === signer;
    const req = own && check(bytes, key).verdict === 'pass' ? reqOf(bytes, key) : null;
    if (!req) {
      held.push({ act: bytes, ...(key ? { key } : {}) });
      continue;
    }
    const made = await signThrough({ ...req, held: [...held] });
    world.lines[req.line as 'public' | 'private'].push(made.id);
    ids.set(x.id, made.id);
    signed++;
    // A private act held without its key, as the vector holds it.
    held.push({ act: made.act, ...(key ? { key: made.key } : {}) });
  }
  const x = c.acts.at(-1)!;
  const last = reqOf(unhex(x.bytes), x.key ? unhex(x.key) : null);
  return { last: last ? { ...last, ...(held.length ? { held } : {}) } : null, held, signed };
}

test('every valid vector: its payload, signed through Kišib’s runner with the identity’s own key, passes the checker, with the vector’s notes', async () => {
  const { cases } = vectors('valid.json');
  assert.equal(cases.length, 44);
  for (const c of cases) {
    const { last, held } = await again(c);
    assert.ok(last, `${c.name}: readable`);
    const made = await signThrough(last);
    world.lines[last.line as 'public' | 'private'].push(made.id);
    const d = describeAct(made.act) as { signer: string; binding: string; spec: string };
    assert.equal(d.signer, world.a.id, `${c.name}: signed by the identity Kišib holds`);
    assert.equal(d.binding, world.binding, `${c.name}: under its key in force`);
    const a = check(made.act, last.public ? null : made.key, held);
    assert.equal(a.verdict, 'pass', `${c.name}: ${JSON.stringify(a)}`);
    assert.deepEqual(a.notes.map((n) => n.rule), c.answer.notes, `${c.name}: the vector's notes`);
    assert.ok(made.words.some((w) => w.startsWith('Checked before signing, as signed by a throwaway key, never this identity’s: PASS')), `${c.name}: the verdict shown`);
    assert.ok(made.words.includes(PASS_MEANS_SAY), `${c.name}: what a pass does not mean`);
  }
  const v = await world.k.c.ask<RunnerView>('runner state');
  assert.ok(v.signed.filter((s) => s.kind === 'agreements').length >= 44, "each listed in Signed");
});

/** Where what fails is in the bytes alone, not in anything an app hands Kišib: checked, never re-made. */
const ACT_LEVEL = new Set(['Envelopes rule 1', 'Envelopes rule 3', 'Envelopes rule 10', 'Envelopes rule 13', 'E1']);

test('every invalid vector: Kišib’s check gives its verdict and rule; asked to sign what an app can hand it, Kišib refuses, naming that rule, nothing signed or waiting', async () => {
  const { cases } = vectors('invalid.json');
  assert.equal(cases.length, 116);
  let made = 0;
  let heldSigned = 0;
  const notMade: string[] = [];
  const signedBefore = (await world.k.c.ask<RunnerView>('runner state')).signed.length;
  for (const c of cases) {
    const acts = c.acts.map((x) => ({ act: unhex(x.bytes), ...(x.key ? { key: unhex(x.key) } : {}) }));
    const last = acts.at(-1)!;
    const a = check(last.act, last.key ?? null, acts.slice(0, -1));
    assert.equal(a.verdict, c.answer.verdict, `${c.name}: verdict`);
    assert.equal(a.rule, c.answer.rule, `${c.name}: rule`);
    // Not of the new acts' spec at all (another specification), or failing in the bytes alone (a signature, the format, the lock, no key).
    const o = opened(last.act, last.key ?? null);
    if (ACT_LEVEL.has(c.answer.rule ?? '') || c.answer.verdict === 'not this encoding' || c.answer.verdict === 'unknown' || !o || !isNewSpec(o.spec)) {
      notMade.push(c.name);
      continue;
    }
    const { last: req, signed } = await again(c);
    heldSigned += signed;
    assert.ok(req, c.name);
    const said = await world.k.app.runner.ask(world.token, req, world.k.app.base).then(
      (r) => assert.fail(`${c.name}: not refused, ${JSON.stringify(r)}`),
      (e: Error) => e.message,
    );
    assert.match(said, new RegExp(`(does not pass|could not write)[^]*${(c.answer.rule ?? '').replace(/[.()]/g, '\\$&')}[^]*Nothing was signed`), c.name);
    made++;
  }
  const v = await world.k.c.ask<RunnerView>('runner state');
  // The held acts of the G6.1 cases were signed (they pass); nothing of the refused ones.
  assert.equal(v.signed.length - signedBefore, heldSigned, 'only the earlier acts the G6.1 cases hold were signed');
  assert.deepEqual(v.waiting, [], 'nothing waiting');
  assert.equal(made, cases.length - notMade.length);
  assert.ok(made >= 80, `refused by the runner: ${made}; checked only: ${notMade.join('; ')}`);
  // Checked only, never re-made (twelve): the bytes are no deterministic CBOR or not the act's shape (Envelopes rule 1, two), the lock or the commitment changed (rule 3, two),
  // a private act with no key (rule 10), another specification, an outside naming no signer, a signature that does not verify or of a scheme not implemented (E1, three), prev absent or of two (rule 13, two).
  assert.equal(notMade.length, 12, notMade.join('; '));
  assert.ok(heldSigned > 0, 'the G6.1 cases’ earlier acts of the same signer were signed again');
});

const h = (n: number) => Buffer.alloc(32, n).toString('hex');
const WORDS = 'Each of us gives the other a test loaf; nothing real is owed.';

test('through the runner’s door, by their fields: Terms, an assent to them and a report, built by the binding, checked, shown as written, signed with the identity’s key; refused, naming the rule, when they do not pass', async () => {
  const { k, token, a } = world;
  const ask = async (body: Record<string, unknown>) => {
    const r = await fetch(`${k.app.base}/runner/ask`, { method: 'POST', headers: { 'content-type': 'application/json', 'mor-runner': token }, body: JSON.stringify(body) });
    return { status: r.status, body: (await r.json()) as Record<string, unknown> };
  };
  const base = (line: 'public' | 'private') => ({ identity: a.id, binding: world.binding, line, sequence: [...world.lines[line]], public: line === 'public', ...(line === 'private' ? { to: [a.id] } : {}) });
  const signed = async (asked: { body: Record<string, unknown> }, line: 'public' | 'private') => {
    const req = (asked.body.asks as { request: string; panel: string }).request;
    const view = await k.c.ask<RunnerView>('runner state');
    const w = view.waiting.find((x) => x.request === req)!;
    // The panel Kišib draws inside the app's window carries the same words.
    const x = k.app.runner.panelFor(req)!;
    const html = panel({ request: req, nonce: x.nonce, ...k.app.runner.panelWords(x) });
    await k.c.ask('runner answer', { request: req, yes: true });
    const r = await fetch(`${k.app.base}/runner/answer`, { method: 'POST', headers: { 'content-type': 'application/json', 'mor-runner': token }, body: JSON.stringify({ request: req }) });
    const s = ((await r.json()) as { signed: { act: string; id: string; key: string } }).signed;
    world.lines[line].push(s.id);
    return { act: Uint8Array.from(Buffer.from(s.act, 'base64')), key: Uint8Array.from(Buffer.from(s.key, 'base64')), id: s.id, words: w.words, html };
  };
  const terms = {
    parties: [{ signer: a.id }, { signer: h(2) }],
    authors: [0],
    body: { words: workHash(new TextEncoder().encode(WORDS)), cmip: h(4), params: 'f6' },
    previous: null,
  };
  // Terms, with their words given.
  const t1 = await ask({ ...base('public'), agreements: { act: 'terms', input: terms }, termsWords: WORDS });
  assert.equal(t1.status, 200, JSON.stringify(t1.body));
  const T = await signed(t1, 'public');
  assert.equal(check(T.act).verdict, 'pass');
  assert.equal((describeAct(T.act) as { signer: string }).signer, a.id);
  assert.equal((describeAct(T.act) as { spec: string }).spec, NEW_SPECS.terms.spec);
  for (const said of [`${NO_READER_SAY}:`, `The words, as given to Kišib, matching that fingerprint: “${WORDS}”`, PASS_MEANS_SAY, ...ALWAYS_SAY]) assert.ok(T.words.includes(said), `said before Terms: ${said}`);
  assert.ok(T.words.some((w) => w.startsWith(`parties: 0. a signer, ${a.id}; 1. a signer, ${h(2)}`)), 'the parties as written');
  assert.ok(T.words.some((w) => /in_force: not written\. Draft 25’s default.*\(G4\.1\)/.test(w)), 'the default draft 25 gives, said as its own');
  for (const rule of ['G5.1', 'G5.3', 'G4.3', 'G4.10', 'G11.8', 'G5.5', 'G4.9', 'G4.11(e)']) assert.ok(T.words.join(' ').includes(`(${rule}`) || T.words.join(' ').includes(` ${rule}`), `cites ${rule}`);
  // The read-only grammar's answers that matter to the signer, each with its word, rule and qualifier, said to be provisional.
  assert.ok(T.words.includes(GRAMMAR_SAY), 'the grammar’s answers, said provisional');
  assert.ok(T.words.some((w) => /^Whether these Terms are in force once you sign them \(in_force\): NOT SHOWN, G4\.1, as shown: /.test(w)), 'in force: not by signing them alone');
  assert.ok(T.words.some((w) => /^Whether you are bound by them once you sign \(bound\): NOT SHOWN, G5\.1, /.test(w)), 'bound: not shown');
  assert.ok(T.words.indexOf(GRAMMAR_SAY) < T.words.indexOf(ALWAYS_SAY[0]), 'before what you can always do');
  assert.ok(T.html.includes('No terms-reading cMIP for Agreements draft 25 exists yet: this is the text as written, not a reading of it'), 'in the panel too');
  assert.ok(!T.html.includes('Always yes for'), 'no standing yes in the panel');
  // An assent to them, private, the Terms handed to Kišib: the Terms shown as written.
  const assent = { agreement: T.id, terms: T.id, kind: 'assent', previous: null };
  const s1 = await ask({ ...base('private'), agreements: { act: 'statement', input: assent }, held: [{ act: Buffer.from(T.act).toString('base64') }], termsWords: WORDS });
  assert.equal(s1.status, 200, JSON.stringify(s1.body));
  const S = await signed(s1, 'private');
  assert.equal(check(S.act, S.key).verdict, 'pass');
  assert.ok(S.words.includes(`An assent: you agree to the Terms ${T.id}. ${NO_READER_SAY}:`), 'the Terms it agrees to, shown');
  assert.ok(S.words.some((w) => w.startsWith('parties: 0. a signer')), 'their fields as written');
  for (const said of ALWAYS_SAY) assert.ok(S.words.includes(said));
  assert.ok(S.words.some((w) => w.startsWith('Whether the Terms you assent to are in force once you sign (in_force): ')), 'the grammar asked of the Terms assented to');
  // A resolve (encoding 2, kind 3): a resolving update in the signer's own line, by its fields.
  const tips = [h(14), h(15)].sort();
  const rv = await ask({ ...base('public'), agreements: { act: 'statement', input: { agreement: T.id, terms: T.id, kind: 'resolve', previous: T.id, resolves: tips, continues: tips[0] } }, held: [{ act: Buffer.from(T.act).toString('base64') }] });
  assert.equal(rv.status, 200, JSON.stringify(rv.body));
  const RV = await signed(rv, 'public');
  assert.equal(check(RV.act).verdict, 'pass');
  assert.ok(RV.words.some((w) => w.startsWith('A resolve: a resolving update in your own line.')), 'a resolve, said');
  assert.ok(RV.words.includes('kind: resolve'));
  assert.ok(RV.words.some((w) => w.startsWith('What this resolve resolves (resolution): ')), 'the grammar asked what it resolves');
  // A resolve with content is refused by the builder (E20).
  const rc = await ask({ ...base('public'), agreements: { act: 'statement', input: { agreement: T.id, terms: T.id, kind: 'resolve', content: 'f6', previous: T.id, resolves: tips, continues: tips[0] } } });
  assert.equal(rc.status, 400);
  assert.match(String(rc.body.error), /E20/);
  // An assent whose Terms Kišib is not given: said plainly that it cannot show them.
  const s2 = await ask({ ...base('public'), agreements: { act: 'statement', input: { ...assent, terms: h(7), agreement: h(7) } } });
  const req2 = (s2.body.asks as { request: string }).request;
  const w2 = (await k.c.ask<RunnerView>('runner state')).waiting.find((x) => x.request === req2)!;
  assert.ok(w2.words.some((w) => w.includes('Kišib does not hold these Terms: it cannot show them. Signing binds you to Terms not shown here.')), 'not shown, said');
  await k.c.ask('runner answer', { request: req2, yes: false });
  // A report (a proposal): its fields as written, and what it is.
  const report = { call: { act: h(11) }, lines: [{ line: 'received', amount: { unit: h(12), value: 5 }, by: h(13) }] };
  const r1 = await ask({ ...base('public'), agreements: { act: 'report', input: report } });
  const R = await signed(r1, 'public');
  assert.equal(check(R.act).verdict, 'pass');
  assert.equal((describeAct(R.act) as { spec: string }).spec, NEW_SPECS.report.spec);
  assert.ok(R.words.some((w) => w.includes('a proposal of the report block (proposal 4), not yet written into any spec text')));
  assert.ok(R.words.includes(`line 0: received, 5 of the unit ${h(12)}, by ${h(13)}`));
  // Refused by the builder, naming the rule (E19: Terms with no previous).
  const bad = await ask({ ...base('public'), agreements: { act: 'terms', input: { ...terms, previous: undefined, replaces: h(1) } } });
  assert.equal(bad.status, 400);
  assert.match(String(bad.body.error), /^Kišib could not build this Terms act: E19: .*Nothing was signed\.$/);
  // Refused by the check before signing (invalid, G4.2: a party by role and no in_force).
  const role = { ...terms, parties: [{ signer: a.id }, { role: { kind: 'future', spot: { cmip: h(5), params: 'f6' } } }] };
  const inv = await ask({ ...base('public'), agreements: { act: 'terms', input: role } });
  assert.equal(inv.status, 400);
  assert.match(String(inv.body.error), /does not pass: INVALID, G4\.2: .*Kišib signs only what passes\. Nothing was signed\./);
  // The same, written as a raw payload under the new spec: checked all the same.
  const { build } = await import('../src/agreements.ts');
  const raw = await ask({ ...base('public'), spec: NEW_SPECS.terms.spec, type: 0, payload: Buffer.from(build('terms', role)).toString('base64') });
  assert.equal(raw.status, 400);
  assert.match(String(raw.body.error), /G4\.2/);
  // A standing yes for agreements is never given.
  await refused(k.c.ask('runner yes', { pairing: world.pairing, kind: 'agreements', on: true }), /always ask/);
  // Nothing of the words or keys in Kišib's folder.
  assert.ok(!everything(k.dir).includes(world.words.split(' ').slice(0, 6).join(' ')), 'no signing words in the folder');
});

/** Kišib's command line, as a person runs it: `mor-kishib agreements …`, with standard input. */
function cli(args: string[], input: string): Promise<{ code: number; out: string; err: string }> {
  return new Promise((resolve) => {
    const p = execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'agreements', ...args], { cwd: here, timeout: 120_000 }, (e, out, err) => resolve({ code: e ? Number((e as { code?: number }).code ?? 1) : 0, out, err }));
    p.stdin!.end(input);
  });
}

test('through the command line: Terms written, checked, shown as written and signed with the signing key’s words from standard input; declined, nothing signed; refused, naming the rule, before any word is asked', async () => {
  const { a, words } = world;
  const dir = mkdtempSync(join(tmpdir(), 'kishib-cli-'));
  const terms = { parties: [{ signer: a.id }], authors: [0], body: { words: workHash(new TextEncoder().encode(WORDS)), cmip: h(4), params: 'f6' }, previous: null };
  writeFileSync(join(dir, 'terms.json'), JSON.stringify(terms));
  writeFileSync(join(dir, 'words.txt'), WORDS);
  const H = homes.map((x) => x.base);
  const args = ['sign', 'terms', join(dir, 'terms.json'), '--id', a.id, '--home', H[0], '--words', join(dir, 'words.txt')];
  const yes = await cli(args, `${words}\nsign\n`);
  assert.equal(yes.code, 0, yes.err + yes.out);
  for (const said of [`${NO_READER_SAY}:`, `The words, as given to Kišib, matching that fingerprint: “${WORDS}”`, PASS_MEANS_SAY, GRAMMAR_SAY, ...ALWAYS_SAY]) assert.ok(yes.out.includes(said), `said: ${said}`);
  assert.ok(!yes.out.includes(words) && !yes.err.includes(words), 'the words never written out');
  const act = unhex(/^act ([0-9a-f]+)$/m.exec(yes.out)![1]);
  assert.equal(check(act).verdict, 'pass');
  assert.equal((describeAct(act) as { signer: string }).signer, a.id, 'signed with the identity’s own key');
  // Its bytes, checked by the command line: PASS, and what a pass is not.
  writeFileSync(join(dir, 'act.hex'), hex(act));
  const checked = await cli(['check', join(dir, 'act.hex')], '');
  assert.equal(checked.code, 0);
  assert.match(checked.out, /^PASS: a Terms act/);
  assert.ok(checked.out.includes(PASS_MEANS_SAY));
  // Declined: anything but "sign", nothing preselected.
  const no = await cli(args, `${words}\n\n`);
  assert.equal(no.code, 3);
  assert.match(no.out, /Declined\. Nothing was signed\./);
  assert.doesNotMatch(no.out, /^act /m);
  // The chain key's words: refused, nothing signed.
  const chain = await cli(args, `${a.chainWords.join(' ')}\nsign\n`);
  assert.equal(chain.code, 1);
  assert.match(chain.err, /never the chain key’s\. Nothing was signed\./);
  // Refused by the builder before any word is read (E19), and by the check (G3.1: an author beyond the parties).
  writeFileSync(join(dir, 'e19.json'), JSON.stringify({ ...terms, body: undefined }));
  const e19 = await cli(['sign', 'terms', join(dir, 'e19.json'), '--id', a.id, '--home', H[0]], '');
  assert.equal(e19.code, 1);
  assert.match(e19.err, /E19: .*Nothing was signed\./);
  writeFileSync(join(dir, 'g31.json'), JSON.stringify({ ...terms, authors: [3] }));
  const g31 = await cli(['sign', 'terms', join(dir, 'g31.json'), '--id', a.id, '--home', H[0]], `${words}\nsign\n`);
  assert.equal(g31.code, 1);
  assert.match(g31.err, /does not pass: INVALID, G3\.1: .*Nothing was signed\./);
  // Every invalid vector, checked by the command line: its verdict, its rule, and never signed.
  for (const c of vectors("invalid.json").cases) {
    const files = c.acts.map((x, i) => {
      const f = join(dir, `v${i}.hex`);
      writeFileSync(f, x.bytes);
      return x.key ? `${f},${x.key}` : f;
    });
    const last = files.pop()!;
    const [file, key] = last.split(',');
    const r = await cli(['check', file, ...(key ? ['--key', key] : []), ...files.flatMap((f) => ['--held', f])], '');
    assert.equal(r.code, 1, c.name);
    assert.ok(r.out.startsWith(`${c.answer.verdict.toUpperCase()}, ${c.answer.rule}: `), `${c.name}: ${r.out}`);
    assert.match(r.out, /Kišib signs nothing that does not pass\./);
  }
});
