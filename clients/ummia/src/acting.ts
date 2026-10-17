// Who acts (F339: "Log in the devs app, your collectives show there, decide
// if you act for yourself or a collective"): a shared piece, built here for
// Ummia and to be reused by Edubba's Publishing tab ("With option to select
// the identity that acts (collective or individual)"). Nothing from Node, and
// nothing of any app's own: it takes the identities an app holds and gives
// the choices, and their HTML in the family's look, with the classes Dub's
// style defines (`.card`, `.small`, `.check`).
//
// Round 1 (decided by Nobody, allegedly, 17 October 2026: "Keep collectives
// for a second round of development"): one acts as oneself. The place for
// the collectives one belongs to is kept, and said, so the piece does not
// change shape when they come.

/** One who may act. */
export interface Actor {
  id: string;
  short: string;
  kind: 'self' | 'collective';
  /** Whether it can be chosen now, and why not where it cannot. */
  available: boolean;
  why: string | null;
}

/** Said where the chooser is shown, word for word. */
export const COLLECTIVES_LATER =
  'Acting as a collective you belong to comes in a second round: its act would be proposed here and signed by its members in their own apps (Dub’s Signing tab, Edubba). For now, a collective’s releases are made in Edubba’s Collectives tab.';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** The choices, from the identities an app holds: each as itself. Collectives: round 2. */
export function actors(held: string[]): Actor[] {
  return held.map((id) => ({ id, short: short(id), kind: 'self' as const, available: true, why: null }));
}

/** Who acts, given the one chosen: the chosen if it can act, else the first that can. */
export function chosen(all: Actor[], wanted: string | null): Actor | null {
  return all.find((a) => a.id === wanted && a.available) ?? all.find((a) => a.available) ?? null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The chooser, as HTML: a form `acting` with one radio `actor` per choice; the page names what each submit does. */
export function chooserHtml(all: Actor[], now: string | null, o: { title?: string } = {}): string {
  const rows = all
    .map(
      (a) =>
        `<label class="check"><input type="radio" name="actor" value="${esc(a.id)}"${a.id === now ? ' checked' : ''}${a.available ? '' : ' disabled'}> <span class="fp" title="${esc(a.id)}">${esc(a.short)}</span> <span class="small">${a.kind === 'self' ? 'yourself' : 'a collective'}${a.why ? `: ${esc(a.why)}` : ''}</span></label>`,
    )
    .join('');
  return `<section class="card acting"><h3>${esc(o.title ?? 'Who acts')}</h3><form id="acting">${rows || '<p class="small">No identity held here.</p>'}</form><p class="small">${esc(COLLECTIVES_LATER)}</p></section>`;
}
