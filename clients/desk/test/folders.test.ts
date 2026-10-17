// Choosing a folder (H19, H23, H31), in Node: a path read as the Terminal or
// Finder writes it; a near match named where no folder is; the system's
// refusal said plainly; the picker's listing of a folder's sub-folders.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { folderOf, listFolders, nearMatch, readPath, refusedSay } from '../src/folders.ts';

test('a path read as the Terminal writes it: “\\ ” a space, quotes taken off, ~ the home folder, a file link decoded', () => {
  assert.equal(readPath('/Users/me/My\\ Projects/site'), '/Users/me/My Projects/site');
  assert.equal(readPath("'/Users/me/My Projects/site'"), '/Users/me/My Projects/site');
  assert.equal(readPath('"/Users/me/My Projects/site"\n'), '/Users/me/My Projects/site');
  assert.equal(readPath('  ~/Projects/site  '), join(homedir(), 'Projects', 'site'));
  assert.equal(readPath('~/testrelease\\ '), join(homedir(), 'testrelease '), 'an escaped space at the end is kept');
  assert.equal(readPath('~/testrelease '), join(homedir(), 'testrelease'), 'a bare space at the end is taken off');
  assert.equal(readPath('~/testrelease ', true), join(homedir(), 'testrelease '), '…unless kept on purpose');
  assert.equal(readPath('file:///Users/me/My%20Projects/'), '/Users/me/My Projects/');
  assert.equal(readPath('~'), homedir());
});

test('H23: where no folder is, a near match is named: a space at its end, other capital letters; a folder found as typed', () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'edubba-folders-')));
  mkdirSync(join(base, 'testrelease '));
  mkdirSync(join(base, 'Tablets'));
  writeFileSync(join(base, 'a-file'), 'x');
  assert.throws(() => folderOf(join(base, 'testrelease')), /There is no folder at .*testrelease\. Did you mean “testrelease ” \(with a space at the end\)\? Its whole path: .*testrelease /);
  assert.throws(() => folderOf(join(base, 'tablets', '')), /Did you mean “Tablets” \(in other capital letters\)/);
  assert.deepEqual(nearMatch(join(base, 'tablets')), { path: join(base, 'Tablets'), said: '“Tablets” (in other capital letters)' });
  assert.equal(nearMatch(join(base, 'nothing-like-it')), null);
  assert.throws(() => folderOf(join(base, 'nothing-like-it')), /^Error: There is no folder at .*nothing-like-it\.$/);
  // As typed, with the space at its end: from the Terminal ("\ "), or kept as pasted.
  assert.equal(folderOf(`${join(base, 'testrelease')}\\ `), join(base, 'testrelease '));
  assert.equal(folderOf(`${join(base, 'testrelease')} `), join(base, 'testrelease '));
  assert.throws(() => folderOf(join(base, 'a-file')), /is a file, not a folder/);
  assert.throws(() => folderOf('Projects/site'), /give the whole path, starting with \/ or ~\//);
  assert.throws(() => folderOf('   '), /Choose a folder/);
});

test('the system’s refusal said plainly, with how to allow it on a Mac', () => {
  const said = refusedSay('/Users/me/Desktop', 'EPERM');
  assert.match(said, /did not let Edubba read \/Users\/me\/Desktop \(operation not permitted\)/);
  if (process.platform === 'darwin') assert.match(said, /System Settings, Privacy & Security, Files and Folders/);
  // A folder its owner cannot read (not for root, whom no permission stops).
  if (process.getuid?.() !== 0) {
    const shut = join(mkdtempSync(join(tmpdir(), 'edubba-shut-')), 'shut');
    mkdirSync(shut);
    chmodSync(shut, 0);
    try {
      assert.throws(() => folderOf(shut), /did not let Edubba read .*shut \(permission denied\)/);
      assert.match(listFolders(shut).problem ?? '', /did not let Edubba read/);
    } finally {
      chmodSync(shut, 0o700);
    }
  }
});

test('H31: the picker lists a folder’s sub-folders, names as they are, git folders marked, hidden ones counted, files left out', () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'edubba-picker-')));
  mkdirSync(join(base, 'testrelease '));
  mkdirSync(join(base, 'b', '.git'), { recursive: true });
  mkdirSync(join(base, '.cache'));
  writeFileSync(join(base, 'notes.txt'), 'x');
  const l = listFolders(base);
  assert.equal(l.path, base);
  assert.equal(l.parent, join(base, '..'));
  assert.deepEqual(
    l.folders.map((f) => [f.name, f.git, f.spaced]),
    [
      ['b', true, null],
      ['testrelease ', false, 'with a space at the end'],
    ],
  );
  assert.equal(l.hidden, 1);
  assert.equal(l.problem, null);
  assert.equal(listFolders().path, homedir(), 'the home folder by default');
  assert.equal(listFolders('/').parent, null);
});
