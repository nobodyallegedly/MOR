// When the display client cannot run at all: the browser blocks WebAssembly
// (some privacy settings do, as do Tor Browser's Safer and Safest security
// levels), or the core library does not start for another reason. Without
// the core library nothing can be checked, so nothing from the site is
// shown; the bar says why, and how to see the site, instead of loading
// forever (onion check, 1 October 2026). Imports only the load hold, which
// imports nothing, so that it works before the core library has started.

import { releaseLoad } from './hold.ts';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The browser has no WebAssembly: it is turned off, not merely failing. */
export const blocksWasm = () => typeof WebAssembly !== 'object';

/** Whether an error from starting the core library is the browser refusing WebAssembly. */
function refused(err: unknown): boolean {
  if (blocksWasm()) return true;
  if (err instanceof WebAssembly.CompileError || err instanceof WebAssembly.LinkError) return true;
  return /wasm|webassembly/i.test(err instanceof Error ? `${err.name} ${err.message}` : String(err));
}

const ANOTHER_WAY =
  'or check the site without a browser, from a relay, with MOR\'s own tools (<code>mor-site verify</code>).';

/** Say on the bar that this page cannot be checked in this browser, and why. */
export function cannotCheck(err: unknown): void {
  releaseLoad();
  const bar = document.getElementById('mor-bar');
  if (!bar) return;
  const why = err instanceof Error ? err.message : String(err);
  const words = refused(err)
    ? `<p>This browser does not run WebAssembly, which the checker needs: it runs MOR's core library, the code that checks who signed this site and that each page is exactly what they signed. Some privacy settings turn WebAssembly off, as do Tor Browser's Safer and Safest security levels.</p>
<p>To see the site: allow WebAssembly for it (in Tor Browser, the Standard security level), or open it in another browser; ${ANOTHER_WAY}</p>`
    : `<p>MOR's core library, the code that checks who signed this site and that each page is exactly what they signed, could not be started in this browser${why ? ` (${esc(why)})` : ''}.</p>
<p>Reload the page to try again; open it in another browser; ${ANOTHER_WAY}</p>`;
  bar.className = 'bad';
  bar.innerHTML = `<div class="standing" id="mor-standing">${
    refused(err) ? 'This page cannot be checked in this browser, so it is not shown.' : 'This page cannot be checked: the checker could not start. Not shown.'
  }</div>
<details open id="mor-cannot"><summary>Why, and how to see it</summary>${words}<p>Nothing from the site is shown unchecked.</p></details>`;
  document.title = 'Not checked';
  document.getElementById('mor-view')?.replaceChildren();
}

/** Said while the core library is still loading after a while: slow connections, Tor among them, take time. */
export function stillLoading(): void {
  const standing = document.querySelector('#mor-bar.checking .standing');
  if (standing) standing.textContent = 'Still loading the core library… On a slow connection, such as Tor, this can take a minute.';
}
