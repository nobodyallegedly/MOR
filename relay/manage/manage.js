// src/api.ts
var DOMAIN = "MOR relay management, version 1\n";
var Refused = class extends Error {
  constructor(status2, message) {
    super(message);
    this.status = status2;
  }
};
var toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
async function newKey() {
  return await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
}
function requestBody(hello, time, nonce, op, args) {
  return new TextEncoder().encode(JSON.stringify({ relay: hello.relay, time, nonce: toHex(nonce), op, args }));
}
function signedBytes(body) {
  const d = new TextEncoder().encode(DOMAIN);
  const m2 = new Uint8Array(d.length + body.length);
  m2.set(d);
  m2.set(body, d.length);
  return m2;
}
var Manager = class _Manager {
  constructor(keys, publicKey, base) {
    this.keys = keys;
    this.publicKey = publicKey;
    this.base = base;
  }
  /** Seconds to add to this device's clock to read the relay's. */
  offset = 0;
  hello;
  static async open(keys, base = ".") {
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", keys.publicKey));
    const m2 = new _Manager(keys, toHex(raw), base.replace(/\/$/, ""));
    await m2.greet();
    return m2;
  }
  /** Learn the relay's id and clock again. */
  async greet() {
    const r = await fetch(`${this.base}/hello`, { cache: "no-store" });
    if (!r.ok) throw new Refused(r.status, `the relay did not answer (${r.status})`);
    this.hello = await r.json();
    this.offset = this.hello.time - Math.floor(Date.now() / 1e3);
    return this.hello;
  }
  /** Ask the relay to do something; returns its answer, or throws its refusal. */
  async ask(op, args = {}) {
    const time = Math.floor(Date.now() / 1e3) + this.offset;
    const body = requestBody(this.hello, time, crypto.getRandomValues(new Uint8Array(16)), op, args);
    const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, this.keys.privateKey, signedBytes(body)));
    const r = await fetch(`${this.base}/api`, {
      method: "POST",
      headers: { "content-type": "application/json", "mor-key": this.publicKey, "mor-signature": toHex(sig) },
      body,
      cache: "no-store"
    });
    let reply;
    try {
      reply = await r.json();
    } catch {
      throw new Refused(r.status, `the relay answered ${r.status}, not in JSON`);
    }
    if (!r.ok) throw new Refused(r.status, reply.error ?? `refused (${r.status})`);
    return reply.ok;
  }
};

// src/keystore.ts
var DB = "mor-manage";
var STORE = "keys";
var NAME = "management-key";
function db() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function request(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function loadKey() {
  const d = await db();
  const held = await request(d.transaction(STORE).objectStore(STORE).get(NAME));
  if (held) return held;
  const keys = await newKey();
  await request(d.transaction(STORE, "readwrite").objectStore(STORE).put(keys, NAME));
  return keys;
}
async function forgetKey() {
  const d = await db();
  await request(d.transaction(STORE, "readwrite").objectStore(STORE).delete(NAME));
}

// src/view.ts
function e(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
function hash(h) {
  if (!h) return '<span class="small">none</span>';
  return `<code title="${e(h)}">${e(h.slice(0, 12))}\u2026${e(h.slice(-4))}</code>`;
}
function bytes(n) {
  if (n < 1024) return `${n} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let v = n / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[u]}`;
}
function when(unix) {
  return new Date(unix * 1e3).toLocaleString();
}
var IDENTITY_TYPES = {
  0: "genesis",
  1: "rotation",
  2: "receipt",
  3: "routes",
  4: "name",
  5: "name withdrawal",
  6: "link claim",
  7: "link confirmation",
  8: "link termination",
  9: "log summary",
  10: "cosignature",
  12: "objection",
  13: "absence statement",
  14: "escape endorsement"
};
var ENVELOPES_TYPES = { 0: "publication", 4: "encryption key" };
function what(it) {
  if (it.kind === "sealed") return "sealed container";
  if (it.kind === "media") return "media";
  if (it.spec === null) return "private act";
  if (it.spec === "identity") return `Identity: ${IDENTITY_TYPES[it.type ?? -1] ?? `type ${it.type}`}`;
  if (it.spec === "envelope") return `Envelopes: ${ENVELOPES_TYPES[it.type ?? -1] ?? `type ${it.type}`}`;
  return `spec ${it.spec.slice(0, 8)}\u2026, type ${it.type}`;
}
var note = (kind, html) => `<div class="note ${kind}">${html}</div>`;
function top(s, where2, role = s?.role) {
  const name = role === "home" ? "Home" : role === "relay" ? "Relay" : "Relay or home";
  return `<header class="top"><h1>${name} management</h1><span class="small">${e(s ? s.bases.join(", ") : where2)}</span></header>`;
}
function pairing(role, where2) {
  return `${top(null, where2, role)}
<section>
<h2>Pair this browser</h2>
<p>This page runs the ${role === "home" ? "home" : "relay"} at <code>${e(where2)}</code>. Only a browser paired with it may: pairing happens once, with a one-time code.</p>
<p>The ${role === "home" ? "home" : "relay"} printed a code when it was set up. For a new one, on the machine it runs on: <code>mor-relay pair --dir DIR</code>, or, from a browser already paired, "Pair another device" below its page. A code lasts an hour and pairs one browser.</p>
<form class="row" id="pair" autocomplete="off">
<input type="text" id="pair-code" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" required spellcheck="false" autocapitalize="characters">
<input type="text" id="pair-label" placeholder="A name for this browser, e.g. Mac, Safari" required maxlength="64">
<button type="submit">Pair</button>
</form>
<div id="pair-status" aria-live="polite"></div>
<p class="small">This browser has made a management key of its own for this address, kept so that even this page cannot read it out. Every request is signed with it, and the relay answers only keys it has paired. It is not an identity, and your identity's keys play no part.</p>
</section>`;
}
function frame(s) {
  const home = s.role === "home";
  return `${top(s, s.bases[0])}
<div id="status" aria-live="polite"></div>
<div class="row"><button class="quiet" data-action="refresh">Refresh</button><span class="small" id="refreshed"></span></div>
<section id="overview"></section>
${home ? '<section id="pending"></section>' : ""}
${home ? '<section id="identities"></section>' : ""}
<section id="allowlist"></section>
${home ? '<section id="newcomers"></section>' : ""}
<section id="recent"></section>
${home ? '<section id="operator"></section>' : ""}
<section id="managers"></section>`;
}
function overview(s) {
  const home = s.role === "home";
  const state = s.closed ? `<span class="tag bad">closed by its operator's rotation</span>` : '<span class="tag ok">running</span>';
  const rows = [
    ["State", state],
    ["Answers as", s.bases.map((b) => `<code>${e(b)}</code>`).join("<br>")],
    ["Kind", home ? "home (and relay)" : "basic relay"],
    ["Whose acts", s.policy === "open" ? "anyone's" : "listed identities only"],
    ["Its words", e(s.policyText ?? "")]
  ];
  if (home) rows.push(["Operator", `${hash(s.operator)}${s.holdsSafetyKey ? ' <span class="tag warn">test operator: safety key on this server</span>' : ""}`]);
  rows.push(
    ["Holds", `${s.counts.acts} acts, ${s.counts.sealed} sealed containers, ${s.counts.media} media (${bytes(s.counts.bytes)})`],
    ["Arrivals", String(s.arrivals)]
  );
  if (home) {
    rows.push(
      ["Identities served", String(s.served)],
      ["Receipt log", `${s.log} receipts`],
      [
        "New identities",
        `${s.newIdentitiesToday} in the last 24 hours${s.newIdentityLimit === null ? ", no limit" : `, at most ${s.newIdentityLimit}`}`
      ]
    );
  }
  rows.push(
    ["Limits", `acts up to ${bytes(s.limits.act)}, media up to ${bytes(s.limits.media)}`],
    ["Program", `mor-relay ${e(s.version)}`]
  );
  const alert = s.pending ? note("warn", `${s.pending} rotation${s.pending === 1 ? "" : "s"} waiting for your approval, below.`) : "";
  return `<h2>Overview</h2>${alert}<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}
function pending(list) {
  const intro = `<p class="small">For identities whose owners chose it, this home takes a rotation only once you approve it: a stand-in for proof from a registered device. Approve only a rotation the owner tells you, by another channel, is theirs: a thief holding the safety key can send one too. Once approved, the owner's client sends it again and the home takes it.</p>`;
  if (!list.length) return `<h2>Rotations waiting for approval</h2>${intro}<p class="small">None.</p>`;
  const rows = list.map((p) => {
    const homes = p.homes ? p.homes.map((h) => `${hash(h.operator)} <code>${e(h.hint)}</code>`).join("<br>") : '<span class="small">unchanged</span>';
    const flags = [p.homeless ? '<span class="tag warn">homeless</span>' : "", p.closure ? '<span class="tag bad">closure</span>' : ""].filter(Boolean).join(" ");
    const act2 = p.approved ? '<span class="tag ok">approved</span><div class="small">waiting for the owner to send it again</div>' : `<button data-action="approve" data-rotation="${e(p.rotation)}">Approve</button>`;
    return `<tr><td>${hash(p.identity)}</td><td>${p.position}</td><td>${hash(p.rotation)} ${flags}</td><td>${homes}</td><td>${e(when(p.at))}</td><td>${act2}</td></tr>`;
  }).join("");
  return `<h2>Rotations waiting for approval</h2>${intro}<div class="table"><table><thead><tr><th>Identity</th><th>Position</th><th>Rotation</th><th>New homes</th><th>Last sent</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
var SHOWN = 200;
function identities(list, policy) {
  const rows = list.slice(0, SHOWN).map((i) => {
    const last = i.chain[i.chain.length - 1];
    const receipted = i.operator || i.chain.every((c) => c.receipted) ? "" : ' <span class="small">(not all receipted here)</span>';
    const who = i.operator ? ' <span class="tag">operator</span>' : "";
    const strict = i.operator ? "" : `<button class="quiet" data-action="strict" data-identity="${e(i.identity)}" data-on="${i.strict ? "false" : "true"}">${i.strict ? "Approval required: stop" : "Require approval"}</button>`;
    const listed = policy === "allowlist" && !i.operator ? i.allowed ? ' <span class="tag ok">listed</span>' : ' <span class="tag bad">not listed</span>' : "";
    return `<tr><td>${hash(i.identity)}${who}${listed}</td><td>${last ? last.position : "-"}${receipted}</td><td>${strict}</td></tr>`;
  }).join("");
  const more2 = list.length > SHOWN ? `<p class="small">And ${list.length - SHOWN} more.</p>` : "";
  return `<h2>Identities this home serves</h2>
<p class="small">"Require approval" is the owner's choice of a device policy: ask them before turning it on. The position is that of the latest identity-chain act this home holds.</p>
<div class="table"><table><thead><tr><th>Identity</th><th>Position</th><th>Rotations</th></tr></thead><tbody>${rows || '<tr><td colspan="3" class="small">None.</td></tr>'}</tbody></table></div>${more2}`;
}
function allowlist(list, s) {
  const applies = s.policy === "allowlist" ? `This ${s.role} keeps only the acts of the identities listed here (and evidence about them)${s.role === "home" ? ", and takes the genesis and rotations of listed identities only" : ""}.` : `This ${s.role} is open to anyone, so the list has no effect now: it matters only for a ${s.role} set up for listed identities.`;
  const rows = list.map((i) => `<li class="row"><code>${e(i)}</code> <button class="quiet" data-action="disallow" data-identity="${e(i)}">Remove</button></li>`).join("");
  return `<h2>Listed identities</h2>
<p class="small">${applies}</p>
<form class="row" id="allow" autocomplete="off"><input type="text" class="wide" id="allow-identity" placeholder="An identity: 64 hexadecimal characters" pattern="[0-9a-fA-F]{64}" required spellcheck="false"><button type="submit">List</button></form>
<ul class="plain">${rows || '<li class="small">No one listed.</li>'}</ul>`;
}
function newcomers(s) {
  const now = s.newIdentityLimit === null ? "No limit: this home takes every new identity that names it." : `At most ${s.newIdentityLimit} new identities in any 24 hours; past that, a genesis is refused with "try again later" (error 10), and can go to another home.`;
  return `<h2>New identities</h2>
<p>${now} <span class="small">${s.newIdentitiesToday} taken in the last 24 hours. Identities already served are never limited.</span></p>
<p class="small">For a public home: every message sent from the reader's page leaves a new identity at the homes it names.</p>
<form class="row" id="limit"><input type="number" id="limit-n" min="0" step="1" placeholder="per 24 hours" value="${s.newIdentityLimit ?? ""}"><button type="submit">Set the limit</button><button type="button" class="quiet" data-action="no-limit">No limit</button></form>`;
}
function recent(items2, more2) {
  const rows = items2.map(
    (it) => `<tr><td>${it.arrival}</td><td>${e(what(it))}</td><td>${hash(it.id)}</td><td>${hash(it.signer)}</td><td>${bytes(it.size)}</td></tr>`
  ).join("");
  return `<h2>Latest arrivals</h2>
<div class="table"><table><thead><tr><th>#</th><th>What</th><th>Id</th><th>Signer</th><th>Size</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="small">Nothing yet.</td></tr>'}</tbody></table></div>
${more2 ? '<div class="row"><button class="quiet" data-action="older">Older</button></div>' : ""}`;
}
function operator(s) {
  if (s.closed) {
    return `<h2>Operator</h2><p>${hash(s.operator)}</p>${note("", "This home has closed by its operator's rotation: it holds nothing new and signs nothing more, and still serves what it held, so readers find the closure.")}`;
  }
  const own = s.holdsSafetyKey ? `<details><summary>Rotate the operator</summary>
<p>New keys for the operator, made on this server; the home's own acts are kept, and every receipt it signed still counts. Do it if the operator's everyday key may have leaked. Type <code>rotate</code> to confirm.</p>
<form class="row" id="rotate" autocomplete="off"><input type="text" id="rotate-confirm" placeholder="rotate" spellcheck="false"><button type="submit">Rotate</button></form>
</details>
<details><summary>Close this home for good</summary>
<p><strong>This cannot be undone.</strong> A closure is a rotation of the operator (Identity rule 8c): the home then holds no new identity-chain acts and signs no receipts, and the identities it served must leave it. Type <code>close</code> to confirm.</p>
<form class="row" id="close" autocomplete="off"><input type="text" id="close-confirm" placeholder="close" spellcheck="false"><button type="submit" class="danger">Close for good</button></form>
</details>` : `<p class="small">The operator's safety key is not on this server, as it should be: rotate (or close) where it is kept, then hand the rotation and the new key file to this home below.</p>`;
  return `<h2>Operator</h2>
<p>This home runs under the identity ${hash(s.operator)}. Its everyday key is on this server, to sign receipts around the clock.</p>
${own}
<details><summary>Hand over a rotation made elsewhere</summary>
<p>The operator rotated where its safety key is kept: give this home the rotation (a bundle holding that one act, <code>.mor</code>) and the new key file. It checks that both are the operator's and that the key is the one the rotation set.</p>
<form id="rotated"><div class="row"><label>Rotation <input type="file" id="rotated-rotation" required></label></div><div class="row"><label>Key file <input type="file" id="rotated-key" required></label></div><div class="row"><button type="submit">Hand over</button></div></form>
</details>`;
}
function managers(list) {
  const rows = list.map(
    (m2) => `<tr><td>${e(m2.label)}${m2.you ? ' <span class="tag">this browser</span>' : ""}</td><td>${e(when(m2.added))}</td><td>${hash(m2.key)}</td><td><button class="quiet" data-action="unpair" data-key="${e(m2.key)}" data-you="${m2.you}">Unpair</button></td></tr>`
  ).join("");
  return `<h2>Paired browsers</h2>
<div class="table"><table><thead><tr><th>Name</th><th>Paired</th><th>Key</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="row"><button class="quiet" data-action="code">Pair another device</button></div>
<div id="code"></div>`;
}
function code(c) {
  return note("done", `Open this page on the other device and enter <span class="code">${e(c.code)}</span>. It pairs one browser, once, until ${e(when(c.expires))}.`);
}

// src/app.ts
var app = document.getElementById("app");
var $ = (id) => document.getElementById(id);
var where = location.origin;
var m;
var status;
var items = [];
var more = false;
var PAGE = 50;
function say(kind, text) {
  const s = $("status");
  if (s) s.innerHTML = text ? note(kind, e(text)) : "";
}
function fail(err) {
  if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
    void start();
    return;
  }
  say("error", err instanceof Error ? err.message : String(err));
}
var fill = (id, html) => {
  const el = $(id);
  if (el) el.innerHTML = html;
};
async function refreshStatus() {
  status = await m.ask("status");
  fill("overview", overview(status));
  const r = $("refreshed");
  if (r) r.textContent = `as of ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`;
}
async function refreshPending() {
  if (status.role === "home") fill("pending", pending(await m.ask("pending")));
}
async function refreshRecent() {
  items = await m.ask("recent");
  more = items.length === PAGE;
  fill("recent", recent(items, more));
}
async function refresh() {
  await refreshStatus();
  const home = status.role === "home";
  const [allowed, paired] = await Promise.all([m.ask("allowlist"), m.ask("managers")]);
  fill("allowlist", allowlist(allowed, status));
  fill("managers", managers(paired));
  await refreshRecent();
  if (home) {
    await refreshPending();
    fill("identities", identities(await m.ask("identities"), status.policy));
    fill("newcomers", newcomers(status));
    fill("operator", operator(status));
  }
}
async function act(op, args, done) {
  try {
    await m.ask(op, args);
    await refresh();
    say("done", done);
  } catch (err) {
    fail(err);
  }
}
async function fileHex(id) {
  const f = $(id)?.files?.[0];
  if (!f) throw new Error("choose the file first");
  return toHex(new Uint8Array(await f.arrayBuffer()));
}
app.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-action]");
  if (!b) return;
  const d = b.dataset;
  switch (d.action) {
    case "refresh":
      try {
        await refresh();
        say("", "");
      } catch (err) {
        fail(err);
      }
      break;
    case "approve":
      await act("approve", { rotation: d.rotation }, "Approved. Once the owner's client sends the rotation again, this home takes it.");
      break;
    case "strict":
      await act(
        "strict",
        { identity: d.identity, on: d.on === "true" },
        d.on === "true" ? "Rotations of that identity now wait for your approval." : "Rotations of that identity no longer wait for approval."
      );
      break;
    case "disallow":
      if (confirm("Remove this identity from the list? Under a list-only policy, the relay will refuse its new acts."))
        await act("disallow", { identity: d.identity }, "Removed from the list.");
      break;
    case "no-limit":
      await act("limit", { perDay: null }, "No limit on new identities.");
      break;
    case "older":
      try {
        const older = await m.ask("recent", { before: items[items.length - 1]?.arrival });
        items = items.concat(older);
        more = older.length === PAGE;
        fill("recent", recent(items, more));
      } catch (err) {
        fail(err);
      }
      break;
    case "code":
      try {
        fill("code", code(await m.ask("code")));
      } catch (err) {
        fail(err);
      }
      break;
    case "unpair": {
      const you = d.you === "true";
      const q = you ? "Unpair this browser? It will need a new code to manage this relay again." : "Unpair that browser? It will need a new code to manage this relay again.";
      if (!confirm(q)) break;
      try {
        await m.ask("unpair", { key: d.key });
        if (you) {
          await forgetKey();
          await start();
        } else {
          await refresh();
          say("done", "Unpaired.");
        }
      } catch (err) {
        fail(err);
      }
      break;
    }
  }
});
app.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const value = (id) => $(id)?.value.trim() ?? "";
  switch (form.id) {
    case "pair": {
      const out = $("pair-status");
      try {
        await m.ask("pair", { code: value("pair-code"), label: value("pair-label") });
        await start();
        say("done", "This browser is paired.");
      } catch (err) {
        out.innerHTML = note("error", e(err instanceof Error ? err.message : String(err)));
      }
      break;
    }
    case "allow":
      await act("allow", { identity: value("allow-identity").toLowerCase() }, "Listed.");
      break;
    case "limit": {
      const n = value("limit-n");
      if (!/^\d+$/.test(n)) {
        say("error", "The limit is a whole number of new identities per 24 hours.");
        break;
      }
      await act("limit", { perDay: Number(n) }, `At most ${n} new identities in any 24 hours.`);
      break;
    }
    case "rotate":
      await act("rotate", { closure: false, confirm: value("rotate-confirm") }, "The operator has rotated: the home signs under its new key from now on.");
      break;
    case "close":
      await act("rotate", { closure: true, confirm: value("close-confirm") }, "The home is closed for good.");
      break;
    case "rotated":
      try {
        const args = { rotation: await fileHex("rotated-rotation"), key: await fileHex("rotated-key") };
        await act("rotated", args, "The home holds the operator's rotation and signs under the new key from now on.");
      } catch (err) {
        fail(err);
      }
      break;
  }
});
var timer;
async function start() {
  clearInterval(timer);
  if (!window.isSecureContext || !crypto?.subtle) {
    app.innerHTML = `${top(null, where)}${note("error", "This page signs requests with a key the browser keeps, which browsers allow only over https, or on the machine itself (http://127.0.0.1 or localhost). Open it that way.")}`;
    return;
  }
  let keys;
  try {
    keys = await loadKey();
  } catch (err) {
    app.innerHTML = `${top(null, where)}${note("error", `This browser cannot make or keep an Ed25519 key (${e(err instanceof Error ? err.message : String(err))}). A recent Firefox, Safari or Chrome can; a private window may not keep it.`)}`;
    return;
  }
  try {
    m = await Manager.open(keys);
  } catch (err) {
    app.innerHTML = `${top(null, where)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  try {
    status = await m.ask("status");
  } catch (err) {
    if (err instanceof Refused && err.status === 401 && /not paired/.test(err.message)) {
      app.innerHTML = pairing(m.hello.role, where);
      return;
    }
    app.innerHTML = `${top(null, where)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
    return;
  }
  app.innerHTML = frame(status);
  try {
    await refresh();
  } catch (err) {
    fail(err);
  }
  timer = setInterval(() => {
    if (document.visibilityState !== "visible") return;
    refreshStatus().then(refreshPending).catch(fail);
  }, 3e4);
}
void start();
