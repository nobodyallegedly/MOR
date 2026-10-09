// Holding the window's load event until the page's icon is known (website
// cMIP, rule 16a). Safari's engine, WebKit, which every browser on an iPhone
// uses, reads a page's icon once, just before the window's load event, and
// never again: an icon set later from a script is ignored (WebKit,
// Document::implicitClose). So the display client keeps the load event back
// until the icon's bytes are checked and on the tab, or until it knows there
// is none, and only then lets the page finish loading. It does so with a
// hidden frame of its own, opened for writing and left open: a window does
// not finish loading while one of its frames is still being written. Run
// first, before the core library starts (app.ts imports it first); imports
// nothing.

/** No longer than this: past it, the page finishes loading anyway, and WebKit shows no icon. */
const LONGEST = 30_000;

const frame = document.createElement('iframe');
frame.hidden = true;
frame.setAttribute('aria-hidden', 'true');
frame.title = 'Holding the page until its icon is checked';
document.body.append(frame);
frame.contentDocument?.open();
let held = true;
const cap = setTimeout(() => releaseLoad(), LONGEST);

/** Let the window finish loading: the icon is set, there is none, or the page is not shown. Safe to call more than once. */
export function releaseLoad(): void {
  if (!held) return;
  held = false;
  clearTimeout(cap);
  frame.contentDocument?.close();
  frame.remove();
}
