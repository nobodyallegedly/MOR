// The postman's own files, in its own folder outside every tray: its state
// (written whole, through a temporary file and a rename) and its logs
// (appended, one JSON line per event, never rewritten).

import fs from 'node:fs';
import { dirname } from 'node:path';

export function readJson(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return fallback;
    throw e;
  }
}

export function writeJson(path, value) {
  fs.mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  const fd = fs.openSync(tmp, 'w', 0o600);
  try {
    fs.writeSync(fd, JSON.stringify(value, null, 1) + '\n');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, path);
}

export function appendLine(path, value) {
  fs.mkdirSync(dirname(path), { recursive: true });
  const fd = fs.openSync(path, 'a', 0o600);
  try {
    fs.writeSync(fd, JSON.stringify(value) + '\n');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

export const now = () => new Date().toISOString();
