// The runner's panel (the Dubsar runner cMIP, section 4): drawn by Kišib's
// program inside the asking app's window, in the kit's slot. Plain HTML, no
// script: the person's click is a form sent from inside the frame, carrying
// a single-use value written here and nowhere else (4.4). Served only into a
// frame of the pairing's origin (`frame-ancestors`, 4.2).

import { e } from '../../../kit/src/html.ts';

/** The panel: who asks, for whom, the act in plain words, Sign it and Decline. */
export function panel(o: { request: string; nonce: string; title: string; as: string; words: string[]; always: string | null }): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Kišib</title><link rel="stylesheet" href="/runner/panel.css"></head>
<body class="k-runner-panel k-kishib"><main class="k-rp" data-runner-panel="${e(o.request)}">
<h3>${e(o.title)}</h3><p class="k-small k-soft">${e(o.as)}</p>
<div class="k-rp-words" id="words">${o.words.map((w) => `<p dir="auto">${e(w)}</p>`).join('')}</div>
<form method="post" action="/runner/panel/${e(o.request)}" class="k-rp-form">
<input type="hidden" name="n" value="${e(o.nonce)}">
${o.always ? `<label class="k-rp-check"><input type="checkbox" name="always" value="on"> ${e(o.always)}</label>` : ''}
<div class="k-row"><button type="submit" name="answer" value="sign" class="k-btn k-p">Sign it</button><button type="submit" name="answer" value="decline" class="k-btn k-q">Decline</button></div>
</form>
<p class="k-small k-faint">Money, agreements, relying on another’s act, and keys always ask.</p></main></body></html>`;
}

/** What the frame shows once answered, or where no request waits. */
export function panelSaid(o: { title: string; text: string }): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Kišib</title><link rel="stylesheet" href="/runner/panel.css"></head>
<body class="k-runner-panel k-kishib"><main class="k-rp" data-runner-said><h3>${e(o.title)}</h3><p class="k-small k-soft">${e(o.text)}</p></main></body></html>`;
}

/** The panel's style, beside Kišib's page style. */
export const PANEL_STYLE = `
body.k-runner-panel{margin:0;background:#0b0e14;color:var(--k-text);font:300 15px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.k-rp{padding:14px 18px 10px}
.k-rp h3{font-weight:300;font-size:19px;margin:0 0 2px}
.k-rp p{margin:4px 0}
.k-rp-words{border:1px solid var(--k-edge);border-radius:10px;padding:8px 12px;margin:10px 0;max-height:40vh;overflow:auto;background:var(--k-raise)}
.k-rp-check{display:flex;gap:8px;align-items:center;font-size:14px;color:var(--k-text);margin:8px 0}
.k-rp .k-btn{border-radius:999px;padding:8px 16px;font:inherit;cursor:pointer;border:1px solid var(--k-edge);background:none;color:var(--k-text)}
.k-rp .k-btn.k-p{background:var(--k-p);color:#0a0c10;border-color:var(--k-p)}
.k-rp .k-btn.k-q{border-color:transparent;color:var(--k-soft)}`;
