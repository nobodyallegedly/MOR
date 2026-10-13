// F272 and the readings taken with it (`docs/f272-build.md`), in the genesis
// client: a reference to a public act names its signer, written only for an
// act the client holds; following a reference by its signer; a lookup that
// asks the homes in force at each position (B2), does not try an address it
// cannot reach (B3) and asks side by side (B4); and the transport's client
// rule, a body larger than the relay's stated limits never sent (relay
// transport cMIP draft 3, "Clients", 6).
//
// Real homes and a relay on local ports, from the relay program.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { start, type Running } from './world.ts';
import { TestIdentity, followRef, lookUp, referTo, referenceTo, cannotReach } from '../src/identity.ts';
import { SPECS, cborEncode, describeAct } from '../src/core.ts';
import { CODE, RelayError, relayAt } from '../src/transport.ts';

let homes: Running[] = [];
let relay: Running;

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

const text = (t: string) => cborEncode(new Map<number, unknown>([[0, t]]));

async function person(homeSet: Running[] = homes, outbox: string[] = [homeSet[0].base]): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homeSet.map((h) => h.home) });
  await t.publishGenesis();
  await t.publishRoutes([{ scope: null, hints: outbox }]);
  return t;
}

/** A server that counts the requests it gets and answers none usefully. */
async function spy(): Promise<{ base: string; count: () => number; close: () => Promise<void> }> {
  let n = 0;
  const s: Server = createServer((_q, r) => {
    n++;
    r.statusCode = 404;
    r.end();
  });
  await new Promise<void>((ok) => s.listen(0, '127.0.0.1', () => ok()));
  const a = s.address() as { port: number };
  return { base: `http://127.0.0.1:${a.port}`, count: () => n, close: () => new Promise((ok) => s.close(() => ok())) };
}

test('a reference to a public act names its signer, and is written only for an act the client holds (F272)', async () => {
  const ana = await person();
  const post = await ana.publish(SPECS.text, 0, text('a post'), { public: true, relays: [homes[0].base] });
  // Held: named with its signer.
  const r = await referTo(post.id, [relay.base, homes[0].base]);
  assert.deepEqual(r.ref, [post.id, ana.id]);
  assert.equal(r.public, true);
  assert.deepEqual(referenceTo(post.act), [post.id, ana.id]);
  // A genesis is signed by the identity it makes.
  assert.deepEqual(referenceTo(ana.chainActs()[0]), [ana.id, ana.id]);
  // A private act: its signer is not named (the writer's choice; naming it would expose a sealed sender).
  const secret = await ana.publish(SPECS.text, 0, text('private'), { public: false, relays: [homes[0].base] });
  assert.equal((await referTo(secret.id, [homes[0].base])).ref, secret.id);
  // Not held anywhere asked: no reference is written.
  await assert.rejects(referTo('ab'.repeat(32), [homes[0].base, relay.base]), /only to an act this client holds/);
  // The signed form goes into an act as `[act, signer]` and reads back.
  const ben = await person();
  const reply = await ben.publish(SPECS.text, 0, text('a reply'), { public: true, relays: [homes[1].base], refs: [r.ref] });
  const d = describeAct(reply.act) as { refs: string[]; refSigners: (string | null)[] };
  assert.deepEqual(d.refs, [post.id]);
  assert.deepEqual(d.refSigners, [ana.id]);
  // An old bare reference reads as before, with no signer.
  const bare = await ben.publish(SPECS.text, 0, text('bare'), { public: true, relays: [homes[1].base], refs: [post.id] });
  assert.equal((describeAct(bare.act) as { refSigners: (string | undefined)[] }).refSigners[0] ?? null, null);
});

test('a reference is followed by the signer it names to an act no relay asked holds, and a wrong signer is said (F272)', async () => {
  // Ana keeps her posts at homes[2] only; the reader knows homes[0] and the relay.
  const ana = await person(homes, [homes[2].base]);
  const post = await ana.publish(SPECS.text, 0, text('kept at home 3'), { public: true, relays: [homes[2].base] });
  const hints = [relay.base, homes[0].base];
  assert.equal(await relayAt(homes[0].base).getAct(post.id), null);
  const f = await followRef([post.id, ana.id], hints);
  assert.equal(f.how, 'signer');
  assert.equal(f.at, homes[2].base);
  assert.equal(describeAct(f.act).id, post.id);
  // No signer named: nothing to look by.
  await assert.rejects(followRef(post.id, hints), /names no signer/);
  // A wrong signer: followed, the act shows its own, and the reference is said to be wrong.
  const carla = await person();
  await assert.rejects(followRef([post.id, carla.id], [homes[2].base]), /the reference is wrong/);
});

test('B2: a lookup asks the homes in force at each position, never a home only a rotation that does not count names', async () => {
  const s = await spy();
  try {
    const ana = await person();
    await homes[1].stop();
    await homes[2].stop();
    try {
      // A rotation naming a new home, held by one home of three: pending, not counting.
      await ana.prepareRotation({ homes: [...homes.map((h) => h.home), { operator: null, hint: s.base }] });
      await ana.submitRotation(); // the owner sends it to every home it names, the new one too
      const before = s.count();
      const l = await lookUp(ana.id, [homes[0].base]);
      assert.equal(l.resolution.stop, 'pending');
      assert.equal(s.count(), before, 'a reader does not ask the home only the pending rotation names');
    } finally {
      await homes[1].start();
      await homes[2].start();
    }
    // Once it counts, the new home is in force at the latest position, and asked.
    await ana.submitRotation();
    const { counts } = await ana.settleRotation();
    assert.ok(counts);
    const l = await lookUp(ana.id, [homes[0].base]);
    assert.equal(l.resolution.links.length, 2);
    assert.deepEqual(
      l.resolution.homesAt?.map((hs) => hs.map((h) => h.hint)),
      [homes.map((h) => h.base), [...homes.map((h) => h.base), s.base]],
    );
    assert.ok(l.unreachable.includes(s.base));
  } finally {
    await s.close();
  }
});

test('B3: an onion home is not tried, and the lookup says so instead of failing', async () => {
  const onion = 'http://exampleexampleexampleexampleexampleexampleexample7ad.onion';
  const t = TestIdentity.create({ homes: [...homes.map((h) => h.home), { operator: null, hint: onion }] });
  await t.publishGenesis();
  const l = await lookUp(t.id, [homes[0].base, onion]);
  assert.deepEqual(l.notTried.map((n) => n.hint), [onion]);
  assert.match(l.notTried[0].why, /onion address/);
  assert.ok(!l.unreachable.includes(onion));
  assert.equal(l.resolution.links.length, 1);
  // Mapped to a way in (the onion home's local port), it is tried.
  assert.equal(cannotReach(onion, { [onion]: 'http://127.0.0.1:1' }), null);
  assert.equal(cannotReach(homes[0].base), null);
});

test('B4: the requests of a lookup go out side by side', async () => {
  // Three homes behind a delay: the lookup takes a few delays, not one per request.
  const delay = 150;
  const proxies = await Promise.all(homes.map((h) => delayed(h.base, delay)));
  try {
    const via = Object.fromEntries(homes.map((h, i) => [h.base, proxies[i].base]));
    const ana = await person();
    const t0 = Date.now();
    const l = await lookUp(ana.id, [homes[0].base, homes[1].base, homes[2].base], via);
    const took = Date.now() - t0;
    assert.equal(l.resolution.links.length, 1);
    const requests = proxies.reduce((n, p) => n + p.count(), 0);
    assert.ok(requests >= 6, `${requests} requests`);
    // One after another, these requests would take requests × delay.
    assert.ok(took < (requests * delay) / 2, `${took} ms for ${requests} requests of ${delay} ms`);
  } finally {
    for (const p of proxies) await p.close();
  }
});

test('the transport does not send a body larger than the relay states it accepts (relay transport cMIP draft 3, "Clients", 6)', async () => {
  const r = relayAt(relay.base);
  const l = await r.limits();
  assert.ok(l && l.act > 0 && l.media > 0);
  await assert.rejects(r.putAct(new Uint8Array(l.act + 1)), (e: unknown) => e instanceof RelayError && e.code === CODE.tooLarge && /not sent/.test(e.reason));
  await assert.rejects(r.putSealed(new Uint8Array(l.act + 1)), (e: unknown) => e instanceof RelayError && /not sent/.test(e.reason));
  await assert.rejects(r.putMedia(new Uint8Array(l.media + 1)), (e: unknown) => e instanceof RelayError && /not sent/.test(e.reason));
  // Within the limit, the relay answers for itself.
  await assert.rejects(r.putAct(new Uint8Array(10)), (e: unknown) => e instanceof RelayError && !/not sent/.test(e.reason));
});

/** A forwarding proxy that waits `ms` before each request: a home far away. */
async function delayed(target: string, ms: number): Promise<{ base: string; count: () => number; close: () => Promise<void> }> {
  let n = 0;
  const s = createServer(async (q, r) => {
    n++;
    const chunks: Buffer[] = [];
    for await (const c of q) chunks.push(c as Buffer);
    await new Promise((ok) => setTimeout(ok, ms));
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const a = await fetch(target + q.url, { method: q.method, headers: { 'content-type': q.headers['content-type'] ?? 'application/cbor' }, body: q.method === 'GET' ? undefined : body });
    r.statusCode = a.status;
    r.end(Buffer.from(await a.arrayBuffer()));
  });
  await new Promise<void>((ok) => s.listen(0, '127.0.0.1', () => ok()));
  const a = s.address() as { port: number };
  return { base: `http://127.0.0.1:${a.port}`, count: () => n, close: () => new Promise((ok) => s.close(() => ok())) };
}
