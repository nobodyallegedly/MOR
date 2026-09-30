// The web reader in the browser: read the settings, then show what the link
// in the address bar names. Everything is fetched and checked here, in the
// visitor's browser, with the core library; the server that serves the page
// only serves these files.

import { escapeHtml as e } from '../../longform/src/html.ts';
import { makeLink, parseLink, relaysFor } from './link.ts';
import { documents, show } from './read.ts';
import { parseSettings, type Settings } from './settings.ts';
import { recipient, sendMessage } from './message.ts';
import { documentItem, documentPage, errorPage, frontPage, note } from './view.ts';

const root = document.getElementById('app')!;
const MAX_LISTED = 30;
let shown = 0; // which route is on screen, so a late answer never paints over a newer page

async function loadSettings(): Promise<Settings> {
  const r = await fetch('reader.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error(`the reader's settings could not be read (HTTP ${r.status})`);
  return parseSettings(await r.json());
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

async function route(settings: Settings): Promise<void> {
  const me = ++shown;
  let link;
  try {
    link = parseLink(location.hash);
  } catch (err) {
    root.innerHTML = errorPage(settings, message(err));
    return;
  }
  if (!link.act) {
    document.title = `MOR reader · ${settings.name}`;
    root.innerHTML = frontPage(settings);
    wireMessage(settings);
    const list = document.getElementById('docs')!;
    const ids = (await documents(settings.identity, settings.relays)).slice(0, MAX_LISTED);
    if (me !== shown) return;
    list.innerHTML = ids.length ? '' : '<li class="small">No documents found at these relays.</li>';
    for (const id of ids) {
      try {
        const s = await show(id, settings.relays, settings.identity);
        if (me !== shown) return;
        list.insertAdjacentHTML('beforeend', documentItem(s, makeLink(location.href, id)));
      } catch (err) {
        if (me !== shown) return;
        list.insertAdjacentHTML('beforeend', `<li class="small">Act <code>${e(id)}</code>: ${e(message(err))}</li>`);
      }
    }
    return;
  }
  document.title = 'MOR reader';
  root.innerHTML = `<p class="small">Fetching and verifying <code>${e(link.act)}</code>…</p>`;
  try {
    const s = await show(link.act, relaysFor(settings.relays, link), settings.identity);
    if (me !== shown) return;
    document.title = `${s.title} · MOR reader`;
    root.innerHTML = documentPage(s, settings);
    wireMessage(settings);
  } catch (err) {
    if (me !== shown) return;
    root.innerHTML = errorPage(settings, `This act could not be shown: ${message(err)}.`);
    wireMessage(settings);
  }
}

function wireMessage(settings: Settings): void {
  const form = document.getElementById('message') as HTMLFormElement | null;
  if (!form) return;
  const text = document.getElementById('message-text') as HTMLTextAreaElement;
  const status = document.getElementById('message-status')!;
  const button = form.querySelector('button')!;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    button.disabled = true;
    try {
      status.innerHTML = note('', `Looking up ${e(settings.name)}'s encryption key and inbox…`);
      const to = await recipient(settings.identity, settings.relays);
      if (to.warning && !confirm(`${to.warning}\n\nSend anyway?`)) {
        status.innerHTML = note('error', 'Not sent.');
        return;
      }
      status.innerHTML = note('', 'Making a one-time identity, sealing and sending…');
      const sent = await sendMessage({ text: text.value, to, homes: settings.messageHomes });
      if (!sent.delivered.length) {
        status.innerHTML = note('error', `Not delivered: ${sent.failed.map((f) => `${e(f.relay)}: ${e(f.reason)}`).join('; ')}.`);
        return;
      }
      text.value = '';
      status.innerHTML = note(
        'done',
        `Sent, sealed, to ${sent.delivered.map(e).join(' and ')}. Message <code>${e(sent.message)}</code>, signed by the one-time identity <code>${e(sent.sender)}</code>; its keys are forgotten.`,
      );
    } catch (err) {
      status.innerHTML = note('error', `Not sent: ${e(message(err))}.`);
    } finally {
      button.disabled = false;
    }
  });
}

async function main(): Promise<void> {
  let settings: Settings;
  try {
    settings = await loadSettings();
  } catch (err) {
    root.innerHTML = errorPage(null, message(err));
    return;
  }
  window.addEventListener('hashchange', () => void route(settings));
  await route(settings);
}

void main();
