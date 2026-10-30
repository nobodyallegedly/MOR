// The Linux desktop entry (scripts/make-desktop.sh), as scripts/make-app.sh
// makes the Mac's app: written under a home folder of the test's own, the
// entry names Dub and runs its launcher; the launcher, run as the desktop
// runs it, starts the program in its default folder and opens (here: prints)
// a one-time pairing link; then the program is stopped.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = fileURLToPath(new URL('../', import.meta.url));

test('make-desktop.sh: a desktop entry named Dub, running a launcher that starts the program and pairs by a one-time link', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dub-desktop-'));
  mkdirSync(join(home, 'Desktop'));
  const env = { ...process.env, HOME: home, XDG_DATA_HOME: '', XDG_CONFIG_HOME: join(home, '.config'), MOR_NO_BROWSER: '1' };
  const out = execFileSync('sh', ['scripts/make-desktop.sh'], { cwd: pkg, env, encoding: 'utf8' });
  const entry = join(home, '.local', 'share', 'applications', 'dub.desktop');
  assert.match(out, new RegExp(`made ${entry}`));
  const text = readFileSync(entry, 'utf8');
  assert.match(text, /^\[Desktop Entry\]\nType=Application\n/);
  assert.match(text, /\nName=Dub\n/);
  assert.match(text, /\nTerminal=false\n/);
  // H25: its own icon, copied beside the launcher.
  const icon = join(home, '.local', 'share', 'mor', 'dub.png');
  assert.ok(text.includes(`\nIcon=${icon}\n`), text);
  assert.deepEqual(readFileSync(icon), readFileSync(join(pkg, 'static', 'icon', 'dub.png')));
  const launch = join(home, '.local', 'share', 'mor', 'dub-launch.sh');
  assert.ok(text.includes(`\nExec="${launch}"\n`), text);
  assert.ok(statSync(launch).mode & 0o100, 'the launcher can be run');
  assert.match(readFileSync(launch, 'utf8'), new RegExp(`cd "${pkg.replace(/\/$/, '')}" && exec ".*node" --import tsx src/cli.ts open`));
  assert.equal(readFileSync(join(home, 'Desktop', 'dub.desktop'), 'utf8'), text, 'a copy on the desktop');
  try {
    execFileSync('desktop-file-validate', [entry], { stdio: 'pipe' });
  } catch (e) {
    if ((e as { code?: string }).code !== 'ENOENT') throw e;
  }

  // As the desktop runs it: the program starts in ~/mor-dub, its link in the launcher's log.
  execFileSync(launch, [], { env, cwd: home });
  const dir = join(home, 'mor-dub');
  // The program the launcher started is stopped whatever the outcome (Part 4).
  try {
    assert.ok(existsSync(join(dir, 'run.json')), 'the program runs in its default folder');
    const run = JSON.parse(readFileSync(join(dir, 'run.json'), 'utf8')) as { port: number; pid: number };
    assert.match(readFileSync(join(home, 'mor-dub-launcher.log'), 'utf8'), new RegExp(`127\\.0\\.0\\.1:${run.port}/#pair=`));
    const hello = (await (await fetch(`http://127.0.0.1:${run.port}/hello`)).json()) as { pid: number };
    assert.equal(hello.pid, run.pid);
  } finally {
    execFileSync(process.execPath, ['--import', 'tsx', 'src/cli.ts', 'stop', '--dir', dir], { cwd: pkg, env, encoding: 'utf8' });
  }
});

test('make-app.sh (H25): Dub.app carries its own icon, named in its Info.plist', () => {
  const home = mkdtempSync(join(tmpdir(), 'dub-app-'));
  const out = execFileSync('sh', ['scripts/make-app.sh'], { cwd: pkg, env: { ...process.env, HOME: home }, encoding: 'utf8' });
  const app = join(home, 'Applications', 'Dub.app');
  assert.match(out, new RegExp(`made ${app}`));
  assert.match(readFileSync(join(app, 'Contents', 'Info.plist'), 'utf8'), /<key>CFBundleIconFile<\/key><string>AppIcon<\/string>/);
  const icns = readFileSync(join(app, 'Contents', 'Resources', 'AppIcon.icns'));
  assert.deepEqual(icns, readFileSync(join(pkg, 'static', 'icon', 'dub.icns')));
  // The Mac's icon format: "icns", its whole length, then PNG entries up to 1024 pixels.
  assert.equal(icns.subarray(0, 4).toString('ascii'), 'icns');
  assert.equal(icns.readUInt32BE(4), icns.length);
  for (const t of ['ic07', 'ic08', 'ic09', 'ic10']) assert.ok(icns.includes(Buffer.from(t, 'ascii')), t);
});
