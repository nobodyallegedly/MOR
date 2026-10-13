// The timestamp clock Module (modules/module-clock-timestamp-draft-1.md): the
// stamp's format, read and refused; an act placed at its earliest stamp, and
// at the earliest stamp of any act naming it; and the clock service against
// a real home and relays on local ports: stamping what it finds there, never
// its own stamps, each act once, never back in time, the acts it is given
// through its open form, and its stamps read back and judged through its
// chain by the core library, a stamp signed by another identity placing
// nothing. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, SPECS, Verifier, cborEncode, describeAct, unhex } from '../../../clients/genesis/src/core.ts';
import { TestIdentity, lookUp, type Lookup } from '../../../clients/genesis/src/identity.ts';
import { relayAt } from '../../../clients/genesis/src/transport.ts';
import { start, type Running } from '../../../clients/genesis/test/world.ts';
import { post } from '../../../clients/barebone/src/post.ts';
import { MOST_PER_STAMP, NotAStamp, STAMP_TYPE, TIMESTAMP_SPEC, decodeStamp, encodeStamp, reference } from '../src/stamp.ts';
import { asStamp, earliest, earliestByNames, readStamps, type Judging, type StampAct } from '../src/read.ts';
import { ClockService } from '../src/service.ts';

const id = (n: number) => n.toString(16).padStart(64, '0');

test('a stamp: its format read back, and every payload that is no stamp refused', () => {
  const s = { time: 1_760_000_000, acts: [id(1), id(2)] };
  assert.deepEqual(decodeStamp(encodeStamp(s)), s);
  const bad: [string, unknown][] = [
    ['not a map', [1, 2]],
    ['another field', new Map<number, unknown>([[0, 1], [1, [unhex(id(1))]], [2, 0]])],
    ['no time', new Map<number, unknown>([[1, [unhex(id(1))]]])],
    ['no act', new Map<number, unknown>([[0, 1], [1, []]])],
    ['an act that is no id', new Map<number, unknown>([[0, 1], [1, [new Uint8Array(31)]]])],
    ['an act twice', new Map<number, unknown>([[0, 1], [1, [unhex(id(1)), unhex(id(1))]]])],
    ['too many acts', new Map<number, unknown>([[0, 1], [1, Array.from({ length: MOST_PER_STAMP + 1 }, (_, i) => unhex(id(i + 1)))]])],
  ];
  for (const [why, payload] of bad) assert.throws(() => decodeStamp(cborEncode(payload) as Uint8Array), NotAStamp, why);
  // A time below zero, written by hand (the core's encoder writes none): {0: -1, 1: [id]}.
  assert.throws(() => decodeStamp(Uint8Array.from([0xa2, 0x00, 0x20, 0x01, 0x81, 0x58, 0x20, ...unhex(id(1))])), NotAStamp, 'a time below zero');
  assert.throws(() => decodeStamp(Uint8Array.from([0xff])), NotAStamp, 'not CBOR');
  assert.throws(() => encodeStamp({ time: 1, acts: ['xyz'] }));
  // The reference names the Module and the clock: two clocks never compare.
  assert.notEqual(reference(id(7)), reference(id(8)));
});

test("only the named clock's public stamps of this Module place anything", () => {
  const payload = encodeStamp({ time: 5, acts: [id(1)] });
  const ok: StampAct = { id: id(100), signer: id(9), public: true, spec: TIMESTAMP_SPEC, type: STAMP_TYPE, payload };
  assert.deepEqual(asStamp(ok, id(9)), { stamp: id(100), time: 5, acts: [id(1)] });
  assert.equal(asStamp(ok, id(8)), null, 'signed by another clock');
  assert.equal(asStamp({ ...ok, public: false }, id(9)), null, 'private');
  assert.equal(asStamp({ ...ok, type: 0 }, id(9)), null, 'another type');
  assert.equal(asStamp({ ...ok, spec: id(3) }, id(9)), null, 'another spec');
  assert.equal(asStamp({ ...ok, payload: new Uint8Array([1]) }, id(9)), null, 'no stamp inside');
});

test('an act is placed at its earliest stamp, and at the earliest stamp of any act naming it', () => {
  const own = earliest([
    { stamp: 's1', time: 50, acts: [id(1), id(2)] },
    { stamp: 's2', time: 30, acts: [id(2)] },
    { stamp: 's3', time: 20, acts: [id(3)] },
  ]);
  assert.deepEqual([...own], [[id(1), 50], [id(2), 30], [id(3), 20]]);
  // id(3) is a reply naming id(2), which names id(1); id(4) names id(1) and was never stamped.
  const acts = [
    { id: id(1), links: [] },
    { id: id(2), links: [id(1)] },
    { id: id(3), links: [id(2)] },
    { id: id(4), links: [id(1)] },
  ];
  const by = earliestByNames(acts, own);
  assert.equal(by.get(id(3)), 20);
  assert.equal(by.get(id(2)), 20, 'a reply stamped earlier: what it names existed by then');
  assert.equal(by.get(id(1)), 20);
  assert.equal(by.has(id(4)), false, 'nothing places an act no stamp reaches');
});

// ---------------------------------------------------------------- the service, on real relays

const running: Running[] = [];
let home: Running;
let relay: Running;
let clockOut: Running;
let alice: TestIdentity;
let bob: TestIdentity;
let clockId: TestIdentity;
let other: TestIdentity;

/** The core library's judgment, as a reader makes it: one verifier, each identity looked up once from the home. */
class Judge implements Judging {
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  private looked = new Map<string, Promise<Lookup>>();
  async standing(act: Uint8Array, aid: string, signer: string): Promise<string> {
    if (!this.looked.has(signer)) this.looked.set(signer, lookUp(signer, [home.base], {}, this.v));
    await this.looked.get(signer);
    this.v.add(act);
    return this.v.status(aid);
  }
}

before(async () => {
  home = await start('home');
  relay = await start('relay');
  clockOut = await start('relay');
  running.push(home, relay, clockOut);
  for (const who of ['alice', 'bob', 'clock', 'other'] as const) {
    const t = TestIdentity.create({ homes: [home.home] });
    await t.publishGenesis();
    if (who === 'alice') alice = t;
    if (who === 'bob') bob = t;
    if (who === 'clock') clockId = t;
    if (who === 'other') other = t;
  }
  await clockId.publishRoutes([{ scope: null, hints: [clockOut.base] }]);
});

after(async () => {
  for (const r of running) await r.stop();
});

test('the clock service stamps what it finds and what it is given, each once, never its own, never back in time', async () => {
  let now = 1_760_000_000;
  const clock = new ClockService({ identity: clockId, outbox: [clockOut.base], watch: [relay.base, clockOut.base], now: () => now });
  const a1 = (await post(alice, { text: 'Alice, first.', relays: [relay.base] })).id;
  const b1 = (await post(bob, { text: 'Bob, first.', relays: [relay.base] })).id;

  const first = await clock.sweep();
  assert.equal(first.length, 1, 'one stamp for what was found at one time');
  assert.equal(first[0].time, now);
  assert.ok(first[0].acts.includes(a1) && first[0].acts.includes(b1));
  // Its stamp is at its outbox, which it also follows: never stamped.
  assert.deepEqual(await clock.sweep(), [], 'nothing new: nothing stamped, its own stamp left alone');

  // Its computer's clock set back: the next stamp is not earlier than the last.
  now -= 600;
  const a2 = (await post(alice, { text: 'Alice, second.', relays: [relay.base] })).id;
  const second = await clock.sweep();
  assert.deepEqual(second.map((s) => [s.acts, s.time]), [[[a2], now + 600]]);

  // Given through its open form: stamped once, and said when given again.
  now += 1200;
  const server = await clock.serve(0);
  const port = (server.address() as { port: number }).port;
  const ask = async (acts: string[]) =>
    (await fetch(`http://127.0.0.1:${port}/stamp`, { method: 'POST', body: JSON.stringify({ acts }) })).json() as Promise<{
      stamps: { stamp: string; time: number; acts: string[] }[];
      before: Record<string, number>;
    }>;
  const given = id(0xabc);
  const r1 = await ask([given, a1]);
  assert.deepEqual(r1.stamps.map((s) => [s.acts, s.time]), [[[given], now]]);
  assert.deepEqual(r1.before, { [a1]: first[0].time });
  const r2 = await ask([given]);
  assert.deepEqual(r2.stamps, []);
  assert.deepEqual(r2.before, { [given]: now });
  assert.equal((await fetch(`http://127.0.0.1:${port}/stamp`, { method: 'POST', body: '{"acts":["no"]}' })).status, 400);
  server.close();

  // Each stamp at the outbox: public, of this Module, signed by the clock.
  const page = await relayAt(clockOut.base).feed({ signer: clockId.id });
  const stamps = page.items.map((it) => describeAct(it.item) as StampAct).filter((d) => d.spec === TIMESTAMP_SPEC);
  assert.equal(stamps.length, 3);
  for (const d of stamps) assert.ok(d.public && d.type === STAMP_TYPE && d.signer === clockId.id);
  // None names a stamp.
  const named = stamps.flatMap((d) => decodeStamp(d.payload!).acts);
  assert.ok(!named.some((n) => stamps.some((d) => d.id === n)));
});

test("a reader reads the clock's stamps, judged through its chain; a stamp by another identity places nothing", async () => {
  const c1 = (await post(alice, { text: 'Alice, third.', relays: [relay.base] })).id;
  const clock = new ClockService({ identity: clockId, outbox: [clockOut.base], now: () => 1_760_100_000 });
  await clock.stamp([c1]);
  // Another identity signs a stamp of the same act, earlier, at the same relay: it is not the clock.
  const fake = other.sign(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: 1, acts: [c1] }), { public: true });
  await relayAt(clockOut.base).putAct(fake.act);

  const read = await readStamps(clockId.id, [clockOut.base, relay.base], new Judge());
  assert.equal(read.earliest.get(c1), 1_760_100_000, "the clock's stamp, not the other identity's");
  assert.ok(read.verified.length >= 1 && read.verified.length === read.found, 'every stamp of the clock found is verified');
  // Read as the other identity's clock instead: its stamp, and only its.
  const asOther = await readStamps(other.id, [clockOut.base], new Judge());
  assert.deepEqual([...asOther.earliest], [[c1, 1]]);
});
