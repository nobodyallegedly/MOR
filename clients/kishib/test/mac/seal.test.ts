// Kišib's seal, compiled from seal/main.swift, against Kišib's own program,
// on a Mac (GitHub's macOS machines: `.github/workflows/kishib-seal-macos.yml`,
// which builds it and names it in MOR_SEAL). What a machine without a screen
// can run: the seal's talk with the program, in its command-line modes (the
// same calls its menu makes): the states, Lock now, Turn off, Quit Kišib,
// quitting locking the runner, and a program not running said. What only a
// person on a Mac can check, the seal seen in the menu bar and its menu
// clicked, is in docs/runner-draft-3-report.md, section 5.

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, kishib, kishibAgain, PASS, runnerOn } from '../world.ts';

after(closeAll);

const SEAL = process.env.MOR_SEAL ?? '';

/** The seal asked once: its printed answer and exit code. */
function seal(dir: string, cmd: string): Promise<{ code: number; out: Record<string, unknown> }> {
  return new Promise((resolve) =>
    execFile(SEAL, ['--dir', dir, cmd], { timeout: 20_000 }, (e, stdout) => resolve({ code: e ? ((e as { code?: number }).code ?? 1) : 0, out: JSON.parse(stdout.trim() || '{}') as Record<string, unknown> })),
  );
}

test('the seal compiled for the Mac talks with Kišib’s program: its states, Lock now, Quit Kišib locking the runner, Turn off, a program not running said', async () => {
  assert.ok(SEAL && existsSync(SEAL), 'MOR_SEAL names the seal built from seal/main.swift');
  let k = await kishib();
  // Off: a hollow seal.
  assert.deepEqual(await seal(k.dir, '--state'), { code: 0, out: { held: 0, state: 'off', waiting: 0 } });
  // On, then a pairing waiting: a full seal, and a number.
  await runnerOn(k.c);
  k.app.runner.pair({ name: 'Probe', origin: 'http://127.0.0.1:1' });
  assert.deepEqual((await seal(k.dir, '--state')).out, { held: 0, state: 'on', waiting: 1 });
  // Open Kišib: a one-time pairing link to its page.
  assert.match(String((await seal(k.dir, '--open')).out.url), new RegExp(`^${k.app.base}/#pair=`));
  // Lock now: a padlock.
  assert.deepEqual((await seal(k.dir, '--lock')).out, { state: 'locked' });
  assert.equal((await seal(k.dir, '--state')).out.state, 'locked');
  await k.c.ask('runner unlock', { passphrase: PASS });
  // Quit Kišib: the program ends, the runner locked.
  assert.equal((await seal(k.dir, '--quit')).out.quit, true);
  for (let i = 0; i < 100 && existsSync(join(k.dir, 'seal.json')); i++) await new Promise((r) => setTimeout(r, 20));
  assert.deepEqual(await seal(k.dir, '--state'), { code: 1, out: { state: 'not running' } });
  k = await kishibAgain(k);
  assert.equal((await seal(k.dir, '--state')).out.state, 'locked', 'quitting locked the runner');
  // Turn off: everything erased, a hollow seal.
  assert.deepEqual((await seal(k.dir, '--off')).out, { state: 'off' });
  assert.ok(!existsSync(join(k.dir, 'runner.json')));
});
