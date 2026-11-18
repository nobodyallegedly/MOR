// The postman's careful handling of the trays (Fable's rules 3 and 4).
//
// In plain words: the postman looks only at the fixed folders `out/` and
// `in/` of each player's folder; it opens only files whose names it found
// there itself, never a path a letter names; it never follows a symbolic
// link, never opens anything but a plain file, never reads more than the
// size limit, and never overwrites a file in `in/`. A folder that is a link,
// or that turns out to lead anywhere but where it should, is refused whole.

import fs from 'node:fs';
import { join } from 'node:path';
import { ANSWER_BODY_SUFFIX, ANSWER_SUFFIX, BODY_SUFFIX, LETTER_SUFFIX, NAME } from '../kit/lib/format.mjs';

const { O_RDONLY, O_WRONLY, O_CREAT, O_EXCL, O_NOFOLLOW } = fs.constants;
const O_NONBLOCK = fs.constants.O_NONBLOCK ?? 0;

/** A refusal of the tray's handling: said in the log and, where there is a letter to answer, in its answer. */
export class TrayRefusal extends Error {}

/** That `path` is a plain folder (not a link), lying exactly where `expected` says once every link is resolved. */
export function realFolder(path, expected = path) {
  let st;
  try {
    st = fs.lstatSync(path);
  } catch {
    throw new TrayRefusal(`${path} does not exist`);
  }
  if (st.isSymbolicLink()) throw new TrayRefusal(`${path} is a symbolic link: refused, never followed`);
  if (!st.isDirectory()) throw new TrayRefusal(`${path} is not a folder`);
  if (fs.realpathSync(path) !== expected) throw new TrayRefusal(`${path} leads elsewhere than its own place: refused`);
  return st;
}

export class Tray {
  /** `root` is the round's folder, already resolved (no links); `name` the player's folder in it. */
  constructor(root, name) {
    if (!NAME.test(name) || name.startsWith('_')) throw new TrayRefusal(`"${name}" is not a tray name`);
    this.name = name;
    this.dir = join(root, name);
    this.out = join(this.dir, 'out');
    this.in = join(this.dir, 'in');
  }

  /** The tray's folder and its out/ and in/, made if missing, each checked to be a plain folder in its place. */
  open() {
    realFolder(this.dir);
    for (const d of [this.out, this.in]) {
      if (!fs.existsSync(d) && !isLink(d)) fs.mkdirSync(d);
      realFolder(d);
    }
  }

  /**
   * The letters waiting in out/, by file name (byte order), with anything
   * odd found among them: a letter's name that is a link or not a plain
   * file, or a name outside the letter alphabet.
   */
  waiting(settleMs, now = Date.now()) {
    realFolder(this.out);
    const letters = [];
    const odd = [];
    for (const e of fs.readdirSync(this.out, { withFileTypes: true })) {
      if (!e.name.endsWith(LETTER_SUFFIX)) continue;
      const stem = e.name.slice(0, -LETTER_SUFFIX.length);
      if (!NAME.test(stem)) {
        odd.push({ file: e.name, reason: 'a letter name is 1 to 64 of a-z, A-Z, 0-9, "-" and "_"' });
        continue;
      }
      if (e.isSymbolicLink()) {
        odd.push({ file: e.name, stem, reason: 'a symbolic link: refused, never followed' });
        continue;
      }
      if (!e.isFile()) {
        odd.push({ file: e.name, stem, reason: 'not a plain file' });
        continue;
      }
      let st;
      try {
        st = fs.lstatSync(join(this.out, e.name));
      } catch {
        continue;
      }
      if (settleMs > 0 && now - st.mtimeMs < settleMs) continue; // still being written: the next pass takes it
      letters.push(stem);
    }
    const order = (a, b) => (Buffer.compare(Buffer.from(a), Buffer.from(b)));
    letters.sort(order);
    odd.sort((a, b) => order(a.file, b.file));
    return { letters, odd };
  }

  /** A letter's envelope, read with the rules of `readPlain`. */
  envelope(stem, max) {
    return readPlain(join(this.out, `${stem}${LETTER_SUFFIX}`), max);
  }

  /** A letter's body file, NAME.body: the name follows from the letter's own, never from what it says. */
  body(stem, max) {
    return readPlain(join(this.out, `${stem}${BODY_SUFFIX}`), max);
  }

  /** Write an answer to in/: its body first, then its envelope, each a new file; nothing in in/ is ever overwritten. */
  answer(stem, json, body = null) {
    realFolder(this.in);
    if (body) writeNew(join(this.in, `${stem}${ANSWER_BODY_SUFFIX}`), body);
    const part = join(this.in, `.${stem}.answer.part`);
    writeNew(part, Buffer.from(JSON.stringify(json, null, 2) + '\n'));
    try {
      fs.linkSync(part, join(this.in, `${stem}${ANSWER_SUFFIX}`));
    } catch (e) {
      throw new TrayRefusal(e.code === 'EEXIST' ? `in/${stem}${ANSWER_SUFFIX} already exists: the answer was not written over it` : `in/: ${e.message}`);
    } finally {
      try {
        fs.unlinkSync(part);
      } catch {
        // already gone
      }
    }
  }

  /** A file the player wrote for the hosts at the top of the folder (addresses.md), read with the same care. */
  topFile(name, max) {
    realFolder(this.dir);
    return readPlain(join(this.dir, name), max);
  }
}

function isLink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Read a plain file: never a link (refused, never followed, even if it
 * appears between the look and the opening), never a pipe or a device,
 * never a file with a second name (a hard link), never more than `max`
 * bytes.
 */
export function readPlain(path, max) {
  let st;
  try {
    st = fs.lstatSync(path);
  } catch {
    throw new TrayRefusal(`${base(path)} is missing`);
  }
  if (st.isSymbolicLink()) throw new TrayRefusal(`${base(path)} is a symbolic link: refused, never followed`);
  if (!st.isFile()) throw new TrayRefusal(`${base(path)} is not a plain file`);
  let fd;
  try {
    fd = fs.openSync(path, O_RDONLY | O_NOFOLLOW | O_NONBLOCK);
  } catch (e) {
    throw new TrayRefusal(e.code === 'ELOOP' || e.code === 'EMLINK' ? `${base(path)} is a symbolic link: refused, never followed` : `${base(path)} could not be opened (${e.code})`);
  }
  try {
    const s = fs.fstatSync(fd);
    if (!s.isFile()) throw new TrayRefusal(`${base(path)} is not a plain file`);
    if (s.nlink > 1) throw new TrayRefusal(`${base(path)} has more than one name (a hard link): refused`);
    if (s.size > max) throw new TrayRefusal(`${base(path)} is ${s.size} bytes, over the limit of ${max}`);
    const buf = Buffer.alloc(s.size);
    let off = 0;
    while (off < s.size) {
      const n = fs.readSync(fd, buf, off, s.size - off, off);
      if (n === 0) break;
      off += n;
    }
    if (off !== s.size) throw new TrayRefusal(`${base(path)} changed while it was read`);
    return new Uint8Array(buf);
  } finally {
    fs.closeSync(fd);
  }
}

/** Create a new file and write it: refused if anything, a link included, is already there. */
export function writeNew(path, bytes) {
  let fd;
  try {
    fd = fs.openSync(path, O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW, 0o644);
  } catch (e) {
    throw new TrayRefusal(e.code === 'EEXIST' ? `${base(path)} already exists: not written over` : `${base(path)} could not be written (${e.code})`);
  }
  try {
    fs.writeSync(fd, bytes);
  } finally {
    fs.closeSync(fd);
  }
}

const base = (p) => p.split('/').slice(-2).join('/');
