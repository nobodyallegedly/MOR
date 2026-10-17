// The test wallet's page: plain JavaScript, no build. Each form asks the
// program (src/server.ts), which asks the chosen regtest node.

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const num = (n) => Number(n).toLocaleString('en').replace(/,/g, ' ');
let node = sessionStorage.getItem('testwallet:node') || 'alice';

async function ask(op, args = {}) {
  const r = await fetch('/api', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-wallet': '1' }, body: JSON.stringify({ op, node, ...args }) });
  const j = await r.json().catch(() => ({ error: `answered ${r.status}` }));
  if (j.error) throw new Error(j.error);
  return j.ok;
}

const out = (id, html, error = false) => {
  $(id).innerHTML = `<div class="out${error ? ' error' : ''}">${html}</div>`;
};

async function busy(id, f) {
  document.querySelectorAll('button').forEach((b) => (b.disabled = true));
  try {
    await f();
  } catch (e) {
    out(id, esc(e.message), true);
  } finally {
    document.querySelectorAll('button').forEach((b) => (b.disabled = false));
  }
}

async function nodes() {
  const list = await ask('nodes');
  if (!list.some((n) => n.name === node)) node = list[0]?.name;
  $('nodes').innerHTML =
    list
      .map(
        (n) => `<label class="node"><input type="radio" name="node" value="${esc(n.name)}"${n.name === node ? ' checked' : ''}><strong>${esc(n.name)}</strong>
 · in channels ${num(n.channels)} · on-chain ${num(n.onchain)}${n.unconfirmed ? ` (+${num(n.unconfirmed)} unconfirmed)` : ''} regtest sat
<br><span class="mono small">${esc(n.key)}</span></label>`,
      )
      .join('') + `<p class="small">Block ${num(list[0]?.height ?? 0)}. Alice pays; bob and carol are paid (bob: a payee's flow node, carol: a vault node). Every amount here is regtest satoshis.</p>`;
}

document.addEventListener('change', (ev) => {
  if (ev.target.name === 'node') {
    node = ev.target.value;
    try {
      sessionStorage.setItem('testwallet:node', node);
    } catch {
      // no session storage: the choice lasts until the page is reloaded
    }
  }
});

let reading = '';
document.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const v = Object.fromEntries(new FormData(f));
  const fid = f.getAttribute('id');
  if (fid === 'read')
    busy('pay-out', async () => {
      const d = await ask('decode', { invoice: v.invoice });
      reading = String(v.invoice).trim();
      out(
        'pay-out',
        `<p><strong>${num(d.sat)} regtest sat</strong> to <code>${esc(d.destination)}</code></p>
<p class="small">${d.descriptionHash ? `Description hash <code>${esc(d.descriptionHash)}</code> (what Damgar checks against the payment)` : `Description: ${esc(d.description || 'none')}`}</p>
<p class="small">Paid from <strong>${esc(node)}</strong>.</p><button id="pay-it" type="button">Pay it</button>`,
      );
    });
  else if (fid === 'invoice')
    busy('invoice-out', async () => {
      const r = await ask('invoice', { sat: v.sat, descriptionHash: v.descriptionHash });
      out('invoice-out', `<p class="small">Made by <strong>${esc(node)}</strong>; paste it into Damgar:</p><code id="made-invoice">${esc(r.invoice)}</code>`);
      await nodes();
    });
  else if (fid === 'send')
    busy('send-out', async () => {
      const r = await ask('send', { address: v.address, sat: v.sat });
      out('send-out', `<p class="small">Sent from <strong>${esc(node)}</strong>. The transaction's id, to paste into Damgar (then mine six blocks):</p><code id="sent-txid">${esc(r.txid)}</code>`);
      await nodes();
    });
  else if (fid === 'mine')
    busy('mine-out', async () => {
      const r = await ask('mine', { blocks: v.blocks });
      out('mine-out', `Mined ${r.blocks} block${r.blocks === 1 ? '' : 's'}.`);
      await nodes();
    });
});

document.addEventListener('click', (ev) => {
  const id = ev.target.id;
  if (id === 'pay-it')
    busy('pay-out', async () => {
      const r = await ask('pay', { invoice: reading });
      out('pay-out', `<p>Paid from <strong>${esc(node)}</strong>${r.fee ? `, fee ${num(r.fee)} sat` : ''}. The preimage, the proof of payment, to paste into Damgar:</p><code id="preimage">${esc(r.preimage)}</code>`);
      $('pay-invoice').value = '';
      await nodes();
    });
  else if (id === 'new-key')
    busy('send-out', async () => {
      const r = await ask('key');
      out('send-out', `<p class="small">A Bitcoin key of <strong>${esc(node)}</strong>'s wallet, x-only: give it to Damgar's Settings (On-chain) to be paid to it. Its coins can be spent only by a wallet told each payment's commitment, which round 1 does not show.</p><code id="bitcoin-key">${esc(r.key)}</code>`);
    });
  else if (id === 'new-address')
    busy('send-out', async () => {
      const r = await ask('address');
      out('send-out', `<p class="small">A fresh address of <strong>${esc(node)}</strong>:</p><code>${esc(r.address)}</code>`);
    });
});

busy('nodes', nodes);
