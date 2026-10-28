// Nakišib's page and program as built: built/ is exactly what the sources
// give (the program carries it inside itself, so what is checked here is
// what runs on the offline Mac); the page names no address but its own;
// the program holds no network client, by its code and its dependencies;
// and Nakišib has no web client, and must never have one.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const FILES = ['index.html', 'nakisib.js', 'nakisib.css', 'atkinson_next.woff2', 'atkinson_next_license.txt', 'atkinson_mono.woff2', 'atkinson_mono_license.txt', 'gentium_book_plus_italic.woff2', 'gentium_book_plus_license.txt', 'icon.png'];

test('built/ is what the sources give, built twice in two folders the same; the program carries exactly these files', () => {
  const a = mkdtempSync(join(tmpdir(), 'nakisib-a-'));
  const b = mkdtempSync(join(tmpdir(), 'nakisib b-'));
  for (const d of [a, b]) execFileSync(process.execPath, ['--import', 'tsx', 'scripts/build.ts', '--out', d], { cwd: here, stdio: 'ignore' });
  assert.deepEqual(readdirSync(join(here, 'built')).sort(), [...FILES].sort());
  for (const f of FILES) {
    assert.deepEqual(readFileSync(join(a, f)), readFileSync(join(b, f)), `${f}, built twice`);
    assert.deepEqual(readFileSync(join(a, f)), readFileSync(join(here, 'built', f)), `${f}: built/ is out of date (npm run build)`);
  }
  const main = readFileSync(join(here, 'src/main.rs'), 'utf8');
  for (const f of FILES) assert.ok(main.includes(`include_bytes!("../built/${f}")`), `the program carries ${f}`);
  assert.deepEqual(readFileSync(join(here, 'built/icon.png')), readFileSync(join(here, 'static/icon/nakisib.png')));
  const js = readFileSync(join(here, 'built/nakisib.js'), 'utf8');
  assert.ok(!/\/(home|Users|root)\//.test(js), 'no build machine folder in the script');
  assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie|caches\./.test(readFileSync(join(here, 'src/page/app.ts'), 'utf8')), 'no browser storage');
});

test('no network: the page names no address; the program has no network client in its code or its dependencies', () => {
  for (const f of ['index.html', 'nakisib.js', 'nakisib.css']) {
    const t = readFileSync(join(here, 'built', f), 'utf8');
    assert.ok(!/\bhttps?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(t), `${f} names an address`);
    assert.ok(!/\bwss?:\/\//.test(t), `${f} names a socket`);
  }
  for (const f of readdirSync(join(here, 'src')).filter((x) => x.endsWith('.rs'))) {
    const t = readFileSync(join(here, 'src', f), 'utf8');
    assert.ok(!/TcpStream::connect|UdpSocket|ToSocketAddrs|lookup_host/.test(t), `${f} connects somewhere`);
  }
  const main = readFileSync(join(here, 'src/main.rs'), 'utf8');
  assert.match(main, /TcpListener::bind\(SocketAddr::from\(\(\[127, 0, 0, 1\], port\)\)\)/, 'it listens on 127.0.0.1 only');
  const tree = execFileSync('cargo', ['tree', '--locked', '--edges', 'normal', '--prefix', 'none', '--manifest-path', join(here, 'Cargo.toml')], { encoding: 'utf8' });
  for (const c of ['reqwest', 'hyper', 'ureq', 'curl', 'tokio', 'async-std', 'mio', 'socket2', 'native-tls', 'rustls', 'openssl', 'h2']) {
    assert.ok(!new RegExp(`^${c} v`, 'm').test(tree), `${c} among its dependencies`);
  }
});

test('Nakišib has no web client, and must never have one', () => {
  const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.release, undefined);
  assert.ok(!existsSync(join(here, 'dist-web')) && !existsSync(join(here, 'built/BUILT-WITH.txt')));
  const workflows = join(here, '../../.github/workflows');
  for (const f of readdirSync(workflows)) assert.ok(!/release-nakisib/.test(f), f);
});
