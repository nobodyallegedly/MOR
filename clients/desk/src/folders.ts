// Choosing a folder in Edubba (H19, H23, H31). A page in the browser cannot
// open the Mac's own folder dialog, so the program, which runs on the Mac,
// browses its folders for the page (`listFolders`). A path typed or pasted
// is read as the Terminal or Finder writes it (`readPath`): "\ " is a space,
// quotes around it are taken off, `~` is the home folder. When no folder is
// there, a near match is named (`folderOf`): a name with a space at its end
// or start, or in other letter case, as the author's "testrelease " was
// (H23). When macOS refuses to let Edubba read a folder, that is said
// plainly, with how to allow it.

import { existsSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';

/** Said when the system refuses to let Edubba read a folder. */
export function refusedSay(path: string, code: string): string {
  if (platform() === 'darwin') {
    return `macOS did not let Edubba read ${path} (${code === 'EPERM' ? 'operation not permitted' : 'permission denied'}). macOS guards the Desktop, Documents and Downloads folders, and removable disks, until you allow a program to read them. To allow it: open System Settings, Privacy & Security, Files and Folders; find node (the program Edubba runs) and turn on the folder it needs; or add node under Full Disk Access. Then choose the folder again. Or move what you release to a folder of its own in your home folder.`;
  }
  return `This system did not let Edubba read ${path} (${code === 'EPERM' ? 'operation not permitted' : 'permission denied'}): check the folder's permissions, or choose another folder.`;
}

const codeOf = (e: unknown) => (e as { code?: string })?.code ?? '';
const refused = (e: unknown) => ['EPERM', 'EACCES'].includes(codeOf(e));

/**
 * A path as typed or pasted, read as the Terminal or Finder writes it: one
 * line; quotes around it taken off; outside quotes, a backslash makes the
 * next character plain ("\ " a space, as Terminal writes it); `file://`
 * links decoded; `~` the home folder. `keepEnd`: keep spaces at its end, for
 * a folder whose name ends with one.
 */
export function readPath(typed: string, keepEnd = false): string {
  let t = typed.replace(/[\r\n]+/g, '').replace(/^\s+/, '');
  if (!keepEnd) t = t.replace(/(?<!\\)\s+$/, '');
  if (/^file:\/\//.test(t)) {
    try {
      t = decodeURIComponent(new URL(t).pathname);
    } catch {
      // not a link after all: read as typed
    }
  } else if (t.length >= 2 && (t[0] === '"' || t[0] === "'") && t.at(-1) === t[0]) {
    t = t.slice(1, -1);
  } else {
    t = t.replace(/\\(.)/g, '$1');
  }
  if (t === '~') return homedir();
  if (t.startsWith('~/')) return join(homedir(), t.slice(2));
  return t;
}

/** How a name differs from what was typed, in plain words. */
function difference(name: string, typed: string): string {
  const parts: string[] = [];
  const end = name.length - name.trimEnd().length;
  const start = name.length - name.trimStart().length;
  if (end) parts.push(end === 1 ? 'with a space at the end' : `with ${end} spaces at the end`);
  if (start) parts.push(start === 1 ? 'with a space at the start' : `with ${start} spaces at the start`);
  if (name.trim() !== typed.trim() && name.trim().toLowerCase() === typed.trim().toLowerCase()) parts.push('in other capital letters');
  if (!parts.length && name.normalize('NFC') === typed.normalize('NFC')) parts.push('its accents written another way');
  return parts.join(', ');
}

/** The entries of a folder, or why not. */
function entries(dir: string): string[] | { refused: string } {
  try {
    return readdirSync(dir);
  } catch (e) {
    if (refused(e)) return { refused: codeOf(e) };
    return [];
  }
}

/**
 * Where a path stops existing, the name there that nearly matches what was
 * typed (a space at its end or start, other capital letters, accents
 * written another way), and the whole path with it.
 */
export function nearMatch(p: string): { path: string; said: string } | { refused: string; at: string } | null {
  const parts = resolve(p).split(sep).filter(Boolean);
  let at: string = sep;
  let said = '';
  for (const part of parts) {
    const next = join(at, part);
    if (existsSync(next)) {
      at = next;
      continue;
    }
    const here = entries(at);
    if (!Array.isArray(here)) return { refused: here.refused, at };
    const near = here.filter((n) => n !== part && (n.trim() === part.trim() || n.trim().toLowerCase() === part.trim().toLowerCase() || n.normalize('NFC') === part.normalize('NFC')));
    if (near.length !== 1) return null;
    said ||= `“${near[0]}” (${difference(near[0], part)})`;
    at = join(at, near[0]);
  }
  return said ? { path: at, said } : null;
}

/**
 * The folder a release is made from, as typed, pasted or chosen (H19, H23):
 * read as the Terminal writes paths; first with the spaces at its end taken
 * off, then as typed; where none is there, a near match is named; where the
 * system refuses to read it, said, with how to allow it.
 */
export function folderOf(typed: string): string {
  if (!typed.trim()) throw new Error('Choose a folder: with “Choose a folder…”, or its path, as Finder or the Terminal shows it (for example ~/Projects/site).');
  const tries = [...new Set([readPath(typed), readPath(typed, true)])];
  const shown = tries[0];
  if (!isAbsolute(shown)) throw new Error(`“${typed.trim()}”: give the whole path, starting with / or ~/, or use “Choose a folder…”.`);
  for (const p of tries) {
    let isDir = false;
    try {
      isDir = statSync(p).isDirectory();
    } catch (e) {
      if (refused(e)) throw new Error(refusedSay(p, codeOf(e)));
      continue;
    }
    if (!isDir) throw new Error(`${p} is a file, not a folder.`);
    try {
      readdirSync(p);
    } catch (e) {
      if (refused(e)) throw new Error(refusedSay(p, codeOf(e)));
      throw e;
    }
    return realpathSync(resolve(p));
  }
  const near = nearMatch(shown);
  if (near && 'refused' in near) throw new Error(refusedSay(near.at, near.refused));
  if (near) throw new Error(`There is no folder at ${shown}. Did you mean ${near.said}? Its whole path: ${near.path}. Choose it with “Choose a folder…”, where the names are shown as they are.`);
  throw new Error(`There is no folder at ${shown}.`);
}

/** A folder's sub-folders, for the folder picker (H31). */
export interface Listing {
  path: string;
  parent: string | null;
  /** The home folder and its usual folders, to start from. */
  places: { name: string; path: string }[];
  folders: { name: string; path: string; git: boolean; spaced: string | null }[];
  /** Hidden folders (a name starting with a dot), not listed. */
  hidden: number;
  problem: string | null;
}

/** The folders inside `path` (the home folder by default), hidden ones counted, not listed. Links are not followed. */
export function listFolders(path?: string): Listing {
  const home = homedir();
  const places = [{ name: 'Home', path: home }, ...['Desktop', 'Documents', 'Downloads'].map((n) => ({ name: n, path: join(home, n) })).filter((x) => existsSync(x.path))];
  const at = path?.trim() ? resolve(readPath(path, true)) : home;
  const out: Listing = { path: at, parent: dirname(at) === at ? null : dirname(at), places, folders: [], hidden: 0, problem: null };
  let names: { name: string; dir: boolean }[];
  try {
    names = readdirSync(at, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() }));
  } catch (e) {
    out.problem = refused(e) ? refusedSay(at, codeOf(e)) : `${at} cannot be read: ${e instanceof Error ? e.message : String(e)}`;
    return out;
  }
  for (const n of names.filter((x) => x.dir)) {
    if (n.name.startsWith('.')) {
      out.hidden++;
      continue;
    }
    const full = join(at, n.name);
    out.folders.push({ name: n.name, path: full, git: existsSync(join(full, '.git')), spaced: n.name.trim() !== n.name ? difference(n.name, n.name.trim()) : null });
  }
  out.folders.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}
