// How long a lookup takes when every home is far away: three local test
// homes, each behind a proxy that waits before every request, and an
// identity with a genesis, routes, an encryption key and one rotation.
// Prints the median of several lookups and the requests each made.
//
//   node --import tsx scripts/measure-lookup.ts [delay in ms, default 50] [runs, default 5]
//
// Reading B4 of docs/f272-build.md: run on main and on the branch to compare.

import { createServer } from 'node:http';
import { start } from '../test/world.ts';
import { TestIdentity, lookUp } from '../src/identity.ts';

const delay = Number(process.argv[2] ?? 50);
const runs = Number(process.argv[3] ?? 5);

async function delayed(target: string, ms: number) {
  let n = 0;
  const s = createServer(async (q, r) => {
    n++;
    const chunks: Buffer[] = [];
    for await (const c of q) chunks.push(c as Buffer);
    await new Promise((ok) => setTimeout(ok, ms));
    const a = await fetch(target + q.url, {
      method: q.method,
      headers: { 'content-type': q.headers['content-type'] ?? 'application/cbor' },
      body: q.method === 'GET' ? undefined : Buffer.concat(chunks),
    });
    r.statusCode = a.status;
    r.end(Buffer.from(await a.arrayBuffer()));
  });
  await new Promise<void>((ok) => s.listen(0, '127.0.0.1', () => ok()));
  const port = (s.address() as { port: number }).port;
  return { base: `http://127.0.0.1:${port}`, count: () => n, reset: () => (n = 0), close: () => new Promise<void>((ok) => s.close(() => ok())) };
}

const homes = [await start('home'), await start('home'), await start('home')];
try {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await t.publishGenesis();
  await t.publishRoutes([{ scope: null, hints: [homes[0].base] }, { scope: null, hints: [homes[1].base], kind: 1 }]);
  await t.publishEncryptionKey();
  await t.prepareRotation();
  await t.submitRotation();
  await t.settleRotation();
  const proxies = await Promise.all(homes.map((h) => delayed(h.base, delay)));
  const via = Object.fromEntries(homes.map((h, i) => [h.base, proxies[i].base]));
  const times: number[] = [];
  let requests = 0;
  for (let i = 0; i < runs; i++) {
    proxies.forEach((p) => p.reset());
    const t0 = performance.now();
    const l = await lookUp(t.id, [homes[0].base], via);
    times.push(performance.now() - t0);
    requests = proxies.reduce((n, p) => n + p.count(), 0);
    if (l.resolution.links.length !== 2) throw new Error('the rotation does not count');
  }
  times.sort((a, b) => a - b);
  console.log(`delay ${delay} ms per request: median ${Math.round(times[Math.floor(runs / 2)])} ms over ${runs} lookups (min ${Math.round(times[0])}, max ${Math.round(times[runs - 1])}), ${requests} requests each`);
  for (const p of proxies) await p.close();
} finally {
  for (const h of homes) await h.stop();
}
