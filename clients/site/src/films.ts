// Putting films into a site before it is published (website cMIP, draft 5,
// rules 6a, 12a and 12b): `mor-site films`. The publisher gives the main
// film, shown in the page, and the films listed under it, each with its
// poster and, for a listed film, its label. Each film is checked by the video
// Module (what it plays, and its limits: size, length, picture size, pictures
// a second) and each poster by the JPEG Module; both are stripped to the film
// and the picture alone (video Module rule 10, JPEG Module rule 6), and
// written into the site's folder under `films/`, the masters left untouched.
// The page gets the markup naming them, between two marks the page carries,
// so that nothing else in it is touched. Nothing is written unless every film
// and poster passes: every reason is said at once.

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { NotJpeg, strip as stripPicture, CARRIED_WORDS as PICTURE_CARRIED } from '../../../modules/jpeg/src/jpeg.ts';
import { CARRIED_WORDS as FILM_CARRIED, NotFilm, read, strip as stripFilm, type Film } from '../../../modules/video/src/video.ts';
import { kindOf } from './manifest.ts';

/** Where the films go in the site, and the marks in a page between which the tool writes. */
export const FILMS_FOLDER = 'films';
export const MARK_START = '<!-- mor-site films -->';
export const MARK_END = '<!-- /mor-site films -->';
/** A listed film's label is a button's words: short. */
export const MAX_LABEL = 40;

export interface FilmIn {
  /** The film's bytes (an MP4 the video Module plays). */
  film: Uint8Array;
  /** Its poster's bytes (a JPEG). */
  poster: Uint8Array;
  /** Its label: the words on its button, for a listed film; the main film's is optional (said to screen readers). */
  label?: string;
  /** Where the publisher's files are, to name them in reasons. */
  from?: { film: string; poster: string };
}

export interface Placed {
  /** The film's path in the site, and its poster's. */
  path: string;
  poster: string;
  label: string | null;
  main: boolean;
  film: Film;
  size: number;
  /** What stripping removed from the film, and from the poster, in words. */
  removed: string[];
}

/** The name a listed film's files take in the site, from its label: "MOR use cases" is `films/mor-use-cases.mp4`. */
export function nameOf(label: string): string {
  return label
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function labelProblem(label: string | undefined, required: boolean): string | null {
  if (label === undefined) return required ? 'a listed film needs a label (--label)' : null;
  if (!label.trim()) return 'the label is empty';
  if (label !== label.trim() || /\s{2,}/.test(label)) return `the label "${label}" has spaces at its ends or two in a row`;
  if (/\p{C}/u.test(label)) return 'the label holds a control or invisible character';
  if (label.normalize('NFC') !== label) return 'the label is not in canonical form (NFC)';
  if ([...label].length > MAX_LABEL) return `the label "${label}" is ${[...label].length} characters long, beyond ${MAX_LABEL}`;
  return null;
}

/** The markup the page gets: the main film shown in it, the listed films under it, each as a button. */
export function filmsMarkup(placed: Placed[]): string {
  if (!placed.length) return `${MARK_START}\n${MARK_END}`;
  const main = placed.find((p) => p.main);
  const listed = placed.filter((p) => !p.main);
  const lines = [MARK_START, '<section class="films">'];
  if (main) lines.push(`<video src="/${main.path}" poster="/${main.poster}"${main.label ? ` title="${escape(main.label)}"` : ''}></video>`);
  if (listed.length) {
    lines.push('<p class="more-films">');
    for (const l of listed) lines.push(`<mor-film src="/${l.path}" poster="/${l.poster}">${escape(l.label!)}</mor-film>`);
    lines.push('</p>');
  }
  lines.push('</section>', MARK_END);
  return lines.join('\n');
}

/** The paths of the site a films block names: what an earlier run of the tool wrote. */
function namedIn(block: string): string[] {
  return [...block.matchAll(/(?:src|poster)="\/(films\/[a-z0-9._-]+)"/g)].map((m) => m[1]);
}

/**
 * Check, strip and place the films in the site folder `dir`, and write their
 * markup into `page` (by default the front page) between its marks. The files
 * an earlier run placed and this one does not are removed. With no films at
 * all, the page's block is emptied. Throws every reason at once, having
 * written nothing.
 */
export function placeFilms(dir: string, opts: { main?: FilmIn; listed?: FilmIn[]; page?: string }): Placed[] {
  const pagePath = opts.page ?? 'index.html';
  const problems: string[] = [];
  const pageFile = join(dir, pagePath);
  let html = '';
  if (kindOf(pagePath) !== 'page') problems.push(`${pagePath}: not a page of a site`);
  else if (!existsSync(pageFile)) problems.push(`${pagePath}: no such page in ${dir}`);
  else {
    html = readFileSync(pageFile, 'utf8');
    const a = html.indexOf(MARK_START);
    const b = html.indexOf(MARK_END);
    if (a < 0 || b < a || html.indexOf(MARK_START, a + 1) >= 0)
      problems.push(`${pagePath}: the page must hold the two marks, once each, where the films go: ${MARK_START} and ${MARK_END}`);
  }

  const all: { film: FilmIn; main: boolean; name: string }[] = [];
  if (opts.main) all.push({ film: opts.main, main: true, name: 'main' });
  for (const f of opts.listed ?? []) all.push({ film: f, main: false, name: f.label ? nameOf(f.label) : '' });

  const placed: Placed[] = [];
  const out: { path: string; bytes: Uint8Array }[] = [];
  const names = new Set<string>();
  for (const { film: f, main, name } of all) {
    const what = main ? 'the main film' : `the film "${f.label ?? '(no label)'}"`;
    const lp = labelProblem(f.label, !main);
    if (lp) problems.push(`${what}: ${lp}`);
    else if (!name) problems.push(`${what}: its label gives no name for its files (letters a to z or digits needed)`);
    else if (names.has(name)) problems.push(`${what}: its files would be named like another film's (${FILMS_FOLDER}/${name}.mp4)`);
    names.add(name);
    const filmName = f.from?.film ?? `${what}'s file`;
    const posterName = f.from?.poster ?? `${what}'s poster`;
    let film: Film | null = null;
    let stripped: Uint8Array | null = null;
    const removed: string[] = [];
    try {
      read(f.film); // what the video Module plays, within its limits (rules 2 to 9)
      const s = stripFilm(f.film);
      stripped = s.bytes;
      film = read(stripped);
      removed.push(...s.removed.map((c) => `from the film, ${FILM_CARRIED[c]}`));
    } catch (e) {
      problems.push(
        `${filmName}: ${e instanceof NotFilm ? `not a film the video Module plays: ${e.message}` : String(e)}` +
          (e instanceof NotFilm && e.kind !== 'limits' ? ' (a QuickTime file, or a camera\'s, may play once remuxed without re-encoding: ffmpeg -i IN -c copy -map_metadata -1 OUT.mp4)' : ''),
      );
    }
    let poster: Uint8Array | null = null;
    try {
      const s = stripPicture(f.poster);
      poster = s.bytes;
      removed.push(...s.removed.map((c) => `from the poster, ${PICTURE_CARRIED[c]}`));
    } catch (e) {
      problems.push(`${posterName}: ${e instanceof NotJpeg ? `not a JPEG: ${e.message}` : String(e)}`);
    }
    if (film && stripped && poster && name) {
      const path = `${FILMS_FOLDER}/${name}.mp4`;
      const posterPath = `${FILMS_FOLDER}/${name}.jpg`;
      placed.push({ path, poster: posterPath, label: f.label ?? null, main, film, size: stripped.length, removed });
      out.push({ path, bytes: stripped }, { path: posterPath, bytes: poster });
    }
  }
  if (problems.length) throw new Error(`the films cannot go into the site:\n  ${problems.join('\n  ')}`);

  const a = html.indexOf(MARK_START);
  const b = html.indexOf(MARK_END) + MARK_END.length;
  const written = new Set(out.map((o) => o.path));
  for (const old of namedIn(html.slice(a, b))) if (!written.has(old)) rmSync(join(dir, old), { force: true });
  for (const o of out) {
    mkdirSync(dirname(join(dir, o.path)), { recursive: true });
    writeFileSync(join(dir, o.path), o.bytes);
  }
  writeFileSync(pageFile, html.slice(0, a) + filmsMarkup(placed) + html.slice(b));
  return placed;
}
