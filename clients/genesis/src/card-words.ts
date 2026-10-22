// What an app's identity window says about its line's card for Kišib (H80's
// question 2). No imports: the apps' pages run it in the browser.

/** An app's line, as its state carries it. */
export interface LineShown {
  acts: number;
  latest: string | null;
  summary: string | null;
  atHomes?: boolean | null;
  missing?: number;
  card?: string | null;
}

/** Plain words, HTML-escaped by `e`: the card to give Kišib, or why there is none yet. */
export function cardWords(l: LineShown, app: string, e: (s: string) => string): string {
  const n = `${l.acts} act${l.acts === 1 ? '' : 's'}`;
  if (!l.latest) return n;
  const missing = l.missing ? ` ${l.missing === 1 ? 'One act' : `${l.missing} acts`} of this line ${l.missing === 1 ? 'is' : 'are'} not at your homes, and ${app} no longer holds ${l.missing === 1 ? 'it' : 'them'}: no reader can follow this line past ${l.missing === 1 ? 'it' : 'them'}, so a change of keys may lose what lives on it (a member key, notes, a list). Kišib says so in red.` : '';
  if (l.card) return `${n}: its card, for Kišib, <code class="card-line">${e(l.card)}</code>${missing ? `<br>${e(missing)}` : ''}`;
  if (l.atHomes === false) return `${n}: its latest act (<code>${e(l.latest)}</code>) is not at your homes yet, so there is no card for Kišib: ${e(app)} sends it again each time this window is read. Do not change your keys until the card shows.${missing ? `<br>${e(missing)}` : ''}`;
  return `${n}: your homes did not answer, so there is no card for Kišib now (latest <code>${e(l.latest)}</code>). Look again before changing your keys.`;
}
