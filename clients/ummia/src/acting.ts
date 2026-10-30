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

/** Said where the chooser is shown, word for word (round 2: collectives, F353). */
export const COLLECTIVES_LATER =
  'A collective you belong to acts here through you: you sign with your own identity’s key, naming the collective (a collective has no key of its own, and its members no member keys; Agreements rule 58). Your act counts as your signature in the layers and areas you hold; where one asks more signatures, its other holders are asked, and sign in their own apps (Dub’s Signing tab, Edubba). Add a collective by its ID.';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** The choices: the identities an app holds, each as itself; then the collectives the one in use acts for (round 2), each available where its key was found. */
export function actors(held: string[], collectives: { id: string; available: boolean; why: string | null }[] = []): Actor[] {
  return [
    ...held.map((id) => ({ id, short: short(id), kind: 'self' as const, available: true, why: null })),
    ...collectives.map((c) => ({ id: c.id, short: short(c.id), kind: 'collective' as const, available: c.available, why: c.why })),
  ];
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
  return `<section class="card acting"><h3>${esc(o.title ?? 'Who acts')}</h3><form id="acting">${rows || '<p class="small">No identity held here.</p>'}</form><p class="small">${esc(COLLECTIVES_LATER)}</p>
<form id="collective-add" class="row"><input name="collective" type="text" class="grow" placeholder="A collective’s ID (mid1… or hex)" autocomplete="off" spellcheck="false" required><button type="submit">Act for it</button></form></section>`;
}
