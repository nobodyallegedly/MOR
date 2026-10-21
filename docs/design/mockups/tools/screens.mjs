// Every screen of the redesign, drawn from docs/design/suite-redesign.md. Pictures only.
import { ID, nd, dm, help, ICON, page, me, bar, column, opened, act, feed, signerMenu, actMenu, typing, home, TESTLINE } from './lib.mjs';

// ================================================================ shared cards (invented data)
const C = {
  paPost: (o = {}) => act({ who: 'Pa', when: '09:14', text: 'The reading of the tablets moves to Thursday. Same room, same tea.', aid: 'mact1r8d…4kq', ...o }),
  phPic: (o = {}) => act({ who: 'Ph', when: '08:52', text: 'Clay drying on the sill this morning.', pic: true, aid: 'mact1w2n…9xe', ...o }),
  maxReply: (o = {}) => act({ who: 'Max', when: '09:20', re: 'Pa · mact1r8d…4kq', text: 'Thursday works. I’ll bring the second tablet.', aid: 'mact1c5h…0lp', ...o }),
  yPost: (o = {}) => act({ who: 'Y', name: 'Collective Y', when: 'yesterday', text: 'Collective Y’s first release is out: mor-dub 0.4.', aid: 'mact1y0g…7tt', ...o }),
  machine: (o = {}) => act({ who: 'Machine', name: 'Machine, allegedly', when: 'yesterday', re: 'T · mact1q1s…8mm', text: 'Act mact1z9…4dw is genuine: signed by Pa, in force on the two homes I asked.', aid: 'mact1m7u…2ba', ...o }),
  tDoc: (o = {}) => act({ who: 'T', when: 'Mon', text: 'Notes from the walkthrough, sitting 6.', doc: 'A long-form document · open it in the reader', aid: 'mact1t4j…5sc', ...o }),
};

// ================================================================ KIŠIB
const KTILES = [
  { name: 'Identities', icon: 'identities', d: 1, say: 'Read any identity’s record. Confirm a succession.' },
  { name: 'Runner', icon: 'runner', d: 2, say: 'Off. On this Mac only: when on, Kišib signs for the apps you approve, from keys it keeps.' },
  { name: 'Paper', icon: 'paper', d: 3, say: 'The chain key’s 24 words: change keys, change the vault, escape, name a successor, check words.' },
  { name: 'Collectives', icon: 'collectives', d: 3, say: 'A collective’s rotation: start it, give your share, check a share.' },
];
const KME = `<button class="me"><span class="n">Holds nothing</span><span class="s">runner off</span><span class="dot alt">–</span></button>`;
const kbar = (on) => bar('kishib', { on, right: KME });
const kopened = (on, col, pane, extra = '') => `${kbar(on)}<div class="body">${column(col)}<section class="pane">${pane}</section></div>${extra}`;
page('kishib', 'home', 'Home: the four tiles',
  `${kbar(null)}<div class="home">${KTILES.map((x) => `<div class="tile d${x.d}">${ICON[x.icon]}${dm(x.d)}<h2>${x.name}</h2><p>${x.say}</p></div>`).join('')}</div>
<div class="home-note">${TESTLINE}</div>`,
  { group: 'Home', before: ['kishib/kishib-01-start.png', 'kishib/kishib-30-mac-start.png'] });

const KIDCOL = [{ t: 'An identity’s record', on: true }, { t: 'Confirm a succession' }, '-', { t: 'Held by the runner', k: 'off' }];
page('kishib', 'identities', 'Identities: an identity’s record',
  kopened('Identities', KIDCOL, `<h2>An identity’s record</h2><p class="lede">Homes, receipts, lines of acts, any contest, any succession. Reading signs nothing.</p>
<div class="row"><div class="input" style="flex:1">${ID.Max}</div><span class="btn p">Read it</span></div>
<div class="box"><div class="head"><span class="dot">M</span><h4 style="margin:0">Max</h4><span class="mono soft">${ID.Max}</span><span class="v ok">✓ counts</span></div>
<dl class="facts"><dt>Homes</dt><dd>2 homes receipt it (home-a.test, home-b.test) · 1 relay</dd><dt>Keys</dt><dd>signing key 3 · chain-key paper made at the last change of keys (21 Oct)</dd><dt>Vault</dt><dd>none declared</dd><dt>Contest</dt><dd>none</dd><dt>Succession</dt><dd>none named</dd></dl>
<h4 style="margin-top:14px">Its lines of acts (4)</h4><div class="list">
<div>Dub on the Mac<span class="r">41 acts · latest mact1c5h…0lp</span></div><div>Dub on the web<span class="r">7 acts</span></div><div>Damgar<span class="r">5 acts</span></div><div>Edubba<span class="r">3 acts</span></div></div></div>
<div class="box"><div class="head"><span class="dot alt">T</span>T<span class="mono faint">${ID.T}</span><span class="bad small" style="margin-left:auto">contested: two changes of keys at one position</span></div></div>
<p class="small soft">Moved here from Edubba’s Identities tab (decided). Red only for the alarm.</p>`),
  { group: 'Tiles', before: ['kishib/kishib-04-record.png'] });

page('kishib', 'runner', 'Runner: off by default',
  kopened('Runner', [{ t: 'On or off', on: true }, { t: 'Apps connected', k: 0 }, { t: 'Standing yeses' }, { t: 'What it signed' }],
    `<h2>The runner</h2><p class="lede">Mac only. An app asks to connect; you approve here; then Kišib signs for it. The app never holds a key.</p>
<div class="box fill"><div class="row" style="margin:0"><div><h4>Off</h4><p class="small soft" style="margin:0">No key stored. Every app signs with its own words, as today.</p></div><span class="grow"></span><span class="switch"><span class="on">Off</span><span>On</span></span></div></div>
<div class="box"><h4>Before you turn it on, the risk</h4><ul class="small soft" style="margin:4px 0;padding-left:1.1em"><li>Kišib keeps signing keys on this Mac while it is on. The chain key: never.</li><li>Its panel is drawn by Kišib inside the asking app’s window. A malicious app could cover it or trick a click: a gap you accept.</li><li>Money, agreements and keys always ask, even with a standing yes.</li></ul>
<div class="row"><span class="ticked"><i></i>I have read the risk</span><span class="grow"></span><span class="btn">Turn it on</span></div></div>
<p class="small faint">The risk is optional: you may leave it off for good.</p>`),
  { group: 'Tiles', note: 'new (the runner cMIP)' });

page('kishib', 'runner-yeses', 'Runner: standing yeses per app and kind',
  kopened('Runner', [{ t: 'On or off' }, { t: 'Apps connected', k: 2 }, { t: 'Standing yeses', on: true }, { t: 'What it signed', k: 12 }],
    `<h2>Standing yeses</h2><p class="lede">Per app and kind of act. A yes here means Kišib signs without asking.</p>
<div class="list">
<div><img src="icons/dub.png" width="22" style="border-radius:5px"> Dub · posts and replies<span class="r"><span class="switch"><span>Ask</span><span class="on">Yes</span></span></span></div>
<div><img src="icons/dub.png" width="22" style="border-radius:5px"> Dub · private messages<span class="r"><span class="switch"><span class="on">Ask</span><span>Yes</span></span></span></div>
<div><img src="icons/ummia.png" width="22" style="border-radius:5px"> Ummia · bug reports<span class="r"><span class="switch"><span class="on">Ask</span><span>Yes</span></span></span></div>
<div class="soft"><img src="icons/damgar.png" width="22" style="border-radius:5px;opacity:.7"> Money acts, agreements, keys<span class="r">always ask</span></div></div>
<div class="row"><span class="btn">Disconnect an app</span><span class="small faint">the app then signs with its own words again</span></div>`),
  { group: 'Tiles', note: 'new (the runner cMIP)' });

page('kishib', 'paper-door', 'Paper: the quiet door',
  `${kbar('Paper')}<div class="body" style="align-items:center;justify-content:center">
<div class="door">${ICON.paper.replace('class="ic"', 'class="ic" style="width:44px;height:44px;color:var(--p)"')}<h2>Paper</h2>
<p class="soft">Here the chain key’s 24 words are typed, used for one act, and forgotten. Kišib writes nothing of them to this device.</p>
<p class="soft">Have the paper in front of you. Be alone with this screen.</p>
<div class="row" style="margin-top:20px"><span class="btn p">Open Paper</span><span class="btn q">Not now</span></div></div></div>`,
  { group: 'Paper and words', note: 'new' });

const PCOL = [{ t: 'Change keys', on: true }, { t: 'Change the vault' }, { t: 'Escape a contested position' }, { t: 'Name a successor' }, '-', { t: 'Check paper words' }];
const steps = (n) => `<div class="steps">${['The words', 'Read back', 'Signed', 'New chain paper', 'New signing words'].map((s, i) => `<span class="${i + 1 < n ? 'done' : i + 1 === n ? 'on' : ''}">${i + 1 < n ? '✓ ' : ''}${s}</span>${i < 4 ? '<span>›</span>' : ''}`).join('')}</div>`;
page('kishib', 'paper', 'Paper: change keys',
  kopened('Paper', PCOL, `<h2>Change an identity’s keys</h2>${steps(1)}
<p class="lede">From its chain key’s paper: a new signing key, every line of its acts kept ${help}</p>
<label class="field"><span>The identity (mid1…)</span><div class="input">${ID.Max}</div></label>
<label class="field"><span>One of its homes</span><div class="input">https://home-a.test</div></label>
<label class="field"><span>The chain key’s 24 words, in order</span><div class="input" style="min-height:76px;letter-spacing:.2em">•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••<br>•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••</div></label>
<div class="box" style="padding:10px 14px"><span class="soft small">+ The vault: keep it as it is</span></div>
<div class="row"><span class="btn p">Read it back</span><span class="small faint">Nothing is signed before you read it back.</span></div>`),
  { group: 'Paper and words', before: ['kishib/kishib-05-rotate-form.png'] });

page('kishib', 'paper-review', 'Paper: read back before signing',
  kopened('Paper', PCOL, `<h2>Change Max’s keys</h2>${steps(2)}
<div class="box fill"><h4>What will be signed</h4><dl class="facts"><dt>Identity</dt><dd>Max · ${ID.Max}</dd><dt>Homes</dt><dd>home-a.test, home-b.test (both answered)</dd><dt>New keys</dt><dd>a new signing key, and a fresh chain-key paper</dd><dt>Vault</dt><dd>kept: none</dd></dl></div>
<h4>Every line of its acts, kept (4)</h4><div class="list"><div><span class="tick">✓</span>Dub on the Mac<span class="r">41 acts</span></div><div><span class="tick">✓</span>Dub on the web<span class="r">7 acts</span></div><div><span class="tick">✓</span>Damgar<span class="r">5 acts</span></div><div><span class="tick">✓</span>Edubba<span class="r">3 acts</span></div></div>
<div class="row"><span class="btn p">Sign it</span><span class="btn q">Cancel, and forget the words</span></div>`),
  { group: 'Paper and words', before: ['kishib/kishib-06-rotate-review.png'] });

const words = (seed) => {
  const W = seed === 'chain'
    ? 'orbit,tablet,quiet,harbor,linen,ember,cedar,marble,thistle,copper,meadow,lantern,river,salt,willow,granite,pepper,fable,anchor,velvet,clover,summit,raven,honey'
    : 'brick,canvas,dune,falcon,ginger,hollow,iris,jasmine,kettle,lemon,mosaic,nectar,oyster,pebble,quartz,ribbon,saddle,timber,umber,valley,walnut,yarrow,zephyr,acorn';
  return `<div class="words">${W.split(',').map((w, i) => `<span><b>${i + 1}.</b>${w}</span>`).join('')}</div>`;
};
page('kishib', 'paper-chain-words', 'Change of keys: the new chain-key paper (1 of 2)',
  kopened('Paper', PCOL, `<h2>Write a new chain-key paper</h2>${steps(4)}
<p class="lede"><b style="font-weight:400;color:var(--text)">1 of 2.</b> The change counts: both homes receipted it. These 24 words are Max’s new chain key. Write them on a new paper, kept apart. They are shown once, then three are asked back.</p>
${words('chain')}
<p class="small soft">The old chain-key paper no longer changes anything: destroy it.</p>
<div class="row"><span class="btn p">I have written them down</span></div>`),
  { group: 'Paper and words', before: ['kishib/kishib-09-new-words.png'], note: 'F361: a fresh chain-key paper' });

page('kishib', 'paper-signing-words', 'Change of keys: the new signing words (2 of 2)',
  kopened('Paper', PCOL, `<h2>The new signing words</h2>${steps(5)}
<p class="lede"><b style="font-weight:400;color:var(--text)">2 of 2.</b> The new signing key’s 24 words. Give them to each app that acts for Max (Dub, Damgar, Edubba, Ummia): each one asks for them. Shown once.</p>
${words('signing')}
<div class="row"><span class="btn p">I have written them down</span><span class="small faint">then three are asked back, and Kišib forgets them</span></div>`),
  { group: 'Paper and words', before: ['kishib/kishib-10-three-back.png', 'kishib/kishib-11-done.png'] });

page('kishib', 'collectives', 'Collectives: give my share',
  kopened('Collectives', [{ t: 'Start a rotation' }, { t: 'Give my share', on: true }, { t: 'Check a share', k: 'new' }],
    `<h2>Give my share to Collective Y’s rotation</h2><p class="lede">Read the rotation first. Your share goes sealed to a one-time key that expires within the hour.</p>
<div class="box fill"><div class="head"><span class="dot c">Y</span><h4 style="margin:0">Collective Y</h4><span class="mono soft">${ID.Y}</span></div>
<dl class="facts"><dt>Started by</dt><dd>Max, 10:02</dd><dt>The change</dt><dd>T joins; members become Max, Pa, Ph, T; 2 of 4 shares rebuild the key</dd><dt>Fingerprint</dt><dd class="mono">7f3a 91c2 0be4 55d1</dd><dt>Expires</dt><dd>10:59, on this device’s clock</dd><dt>Shares in</dt><dd>1 of 2</dd></dl></div>
<label class="field"><span>Your share’s number</span><div class="input" style="max-width:120px">2</div></label>
<label class="field"><span>Your share’s 24 words</span><div class="input" style="min-height:56px;letter-spacing:.2em">•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• …</div></label>
<div class="row"><span class="btn p">Read it back</span></div>`),
  { group: 'Tiles', before: ['kishib/kishib-34-give-form.png', 'kishib/kishib-31-collective-form.png'] });

// ================================================================ DUB
const DCENTER = `<div class="switch"><span class="on">Public</span><span>Private <span class="cnt" style="background:var(--edge);color:var(--text);border-radius:999px;padding:0 6px;font-size:11px">2</span></span></div>`;
const DCENTER_PRIV = `<div class="switch"><span>Public</span><span class="on">Private</span></div>`;
const CONTACTS = `<button class="menu-btn"><span>☰</span><span class="l">Contacts</span></button>`;
const DLEFT = `<div style="display:flex;align-items:center;gap:12px">${CONTACTS}<div class="app hide-phone"><img src="icons/dub.png" alt=""><span class="nm">Dub</span></div></div>`;
const dbar = (priv = false, right) => bar('dub', { left: DLEFT, center: priv ? DCENTER_PRIV : DCENTER, right });
const lenses = (on = 'Following') => `<div class="lenses">${['Following', 'To you', 'Relay'].map((l) => `<span class="lens${l === on ? ' on' : ''}">${l}${l === 'To you' ? ' · 1' : ''}</span>`).join('')}</div>`;
const dtyping = (ph = 'Write something public…', o = {}) => typing(ph, { tools: `<span title="picture">▣ Picture</span><span>@</span><span>To…</span>`, ...o });
const dubPublic = (cards, { lens = 'Following', typed, extra = '', right, cls = '' } = {}) =>
  `${dbar(false, right)}<div class="body"><section class="pane" style="max-width:820px;margin:0 auto;width:100%">${lenses(lens)}<div class="feedwrap">${feed(cards, cls)}</div>${typed ?? dtyping()}</section></div>${extra}`;
const FEED = [C.maxReply(), C.paPost(), C.phPic(), C.yPost({ of: '' }), C.tDoc(), C.machine()];

page('dub', 'home', 'Home: Public, the Following lens',
  dubPublic(FEED),
  { group: 'Home', before: ['dub/mac-04-public-feed.png', 'dub/web-03-public.png'] });

page('dub', 'relay', 'Public: the Relay lens',
  dubPublic([
    act({ who: 'Ph', when: '09:31', kind: 'follow list', text: 'Ph published whom it follows (3).', aid: 'mact1f6p…1rz' }),
    C.paPost({ when: '09:14' }),
    act({ who: 'Pa2', name: 'Pa', when: '09:02', kind: 'name', text: 'Display name set: “Pa”.', aid: 'mact1n3x…8wa' }),
    act({ who: 'Y', name: 'Collective Y', when: '08:40', kind: 'release', text: 'mor-dub 0.4 (14 files).', aid: 'mact1y0g…7tt' }),
    act({ who: 'T', when: '08:12', kind: 'witness', text: 'T relies on mact1r8d…4kq.', aid: 'mact1k2b…6ys' }),
  ].map((x) => x), { lens: 'Relay', typed: `<div class="point" style="margin-top:10px"><span class="lbl">The relay</span><span class="chip on">relay-a.test</span><span class="chip">+ another</span></div>${dtyping()}` }),
  { group: 'Feeds', before: ['dub/mac-07b-relay.png'] });

page('dub', 'to-you', 'Public: the To you lens (and the received-items piles)',
  dubPublic([
    act({ who: 'Pa', when: '09:12', text: 'Max, will you bring the second tablet?', flag: '<span class="small">to you</span>', aid: 'mact1u7t…3ya' }),
    act({ who: 'Machine', name: 'Machine, allegedly', when: 'Mon', text: 'Max: your note is answered in my feed.', flag: '<span class="small">to you</span>', aid: 'mact1u2m…8yb' }),
  ], { lens: 'To you', typed: `<div class="point" style="margin-top:10px"><span class="lbl">Sort</span><span class="chip p">new</span><span class="chip">to answer</span><span class="chip">answered</span><span class="chip">ignored</span>${nd('Edubba’s piles, proposed dropped')}</div>${dtyping()}` }),
  { group: 'Feeds', before: ['dub/mac-07-to-you.png', 'edubba/4-sorted.png'] });

page('dub', 'mention', 'Typing box: @ by names, not hashes',
  dubPublic(FEED.slice(0, 4), {
    typed: `<div style="position:relative">${typing('Thursday then. @P', { typed: true, tools: '<span>▣ Picture</span><span>@</span><span>To…</span>' })}
<div class="pop" style="bottom:62px;left:110px"><div class="t">Mention</div><a><span class="dot" style="width:22px;height:22px;font-size:11px">P</span>Pa<span class="k">${ID.Pa} ${nd('faint ID on a collision')}</span></a><a><span class="dot alt" style="width:22px;height:22px;font-size:11px">P</span>Pa<span class="k">${ID.Pa2}</span></a><a><span class="dot alt" style="width:22px;height:22px;font-size:11px">P</span>Ph</a></div></div>`,
  }),
  { group: 'Feeds', note: 'decided: @ autocompletes by names' });

page('dub', 'contacts', 'Contacts: the menu top left',
  `${dubPublic(FEED)}<div class="shade" style="background:rgba(3,4,6,.45)"></div><div class="panel left" style="width:360px"><div class="row" style="margin:4px 4px 8px"><h4 style="font-size:16px">Contacts</h4><span class="grow"></span><span class="small soft">7</span></div>
<div class="input" style="margin:0 4px 8px">Find a contact…</div>
${[['Pa', 'Pa', ''], ['Ph', 'Ph', ''], ['T', 'T', ''], ['Machine', 'Machine, allegedly', ''], ['Y', 'Collective Y', 'collective']].map(([k, n, tg]) => `<div class="idrow"><span class="dot alt">${n[0]}</span><div><div class="n">${n} ${tg ? `<span class="tagc">${tg}</span>` : ''}</div><div class="s">${ID[k]}</div></div><span class="grow"></span><span class="btn q small">Message</span></div>`).join('')}
<div class="sep" style="height:1px;background:var(--line);margin:8px 4px"></div>
<div class="idrow"><span class="small soft">+ Add by ID (mid1…, or an ID link)</span></div>
<div class="idrow"><span class="small soft">Muted (1)</span></div>
<div class="idrow"><span class="ticked small"><i></i>Publish whom Max follows</span></div>
<p class="small faint" style="margin:4px 8px">Your names for them stay sealed to you. The same list in Public and Private.</p></div>`,
  { group: 'Panels', before: ['dub/mac-09-muted.png'] });

page('dub', 'act-signer-menu', 'The act card: the signer’s menu (Dub)',
  dubPublic([C.paPost({ open: 'signer', sel: true, menu: signerMenu('dub', 'Pa') }), C.phPic(), C.maxReply()], { cls: 'menuopen' }),
  { group: 'The act card' });
page('dub', 'act-menu', 'The act card: the act’s menu (Dub)',
  dubPublic([C.phPic(), C.yPost(), C.paPost({ open: 'act', sel: true, menu: actMenu('dub', { aid: 'mact1r8d…4kq' }) })], { cls: 'menuopen' }),
  { group: 'The act card' });

page('dub', 'vow-menu', 'A vow Max bought: confirm or contest it, in its menu (Dub)',
  dubPublic([
    act({ who: 'Ph', when: '08:10', kind: 'vow', text: 'A guided walk to the clay pits. 300 regtest sats.', aid: 'mact1v5w…2gg', flag: '<span class="small">not bought: no confirm or contest here</span>' }),
    act({ who: 'Pa', when: 'Sun', kind: 'vow · you bought it', text: 'A seat at the reading of the tablets. 500 regtest sats.', aid: 'mact1v1s…0aa', flag: '<span class="small">bought by Max · not yet confirmed</span>', open: 'act', sel: true, menu: actMenu('dub', { bought: true, aid: 'mact1v1s…0aa', style: 'top:60px;right:0' }) }),
  ], { cls: 'menuopen' }),
  { group: 'The act card', before: ['edubba/web-dub-sealed-and-vow.png'], note: 'decided: only on vows the ID bought' });

page('dub', 'thread', 'The pop-up thread: what an act answers',
  `${dubPublic(FEED)}<div class="shade"></div><div class="modal"><div class="mh"><button class="back">←</button><h3>What Max’s reply answers</h3><span class="grow"></span><span class="small faint">2 acts</span></div>
${feed([C.paPost(), C.maxReply({ sel: true })])}<p class="small faint" style="margin:8px 2px 0">The same card, the same two menus. Back returns to the feed where you were.</p></div>`,
  { group: 'Feeds', note: 'decided: a pop-up with a feed box and a back arrow' });

page('dub', 'profile', 'The profile page: light and friendly',
  `${dbar()}<div class="body"><section class="pane"><div class="prof">
<div class="row" style="margin:0 0 4px"><span class="btn q">← Back</span></div>
<div class="hero"><span class="dot">P</span><div><h2>Pa</h2><p class="soft" style="margin:2px 0">Lives on two homes, reached through one relay.</p><span class="mono soft">${ID.Pa}</span> <span class="btn q small">Copy ID link</span></div><span class="grow"></span><span class="btn p">Follow</span><span class="btn">Message</span></div>
<div class="feedwrap">${feed([C.paPost(), act({ who: 'Pa', when: 'Tue', text: 'Three verses, sealed, are on sale in Edubba.', aid: 'mact1v8e…3ho' }), act({ who: 'Pa', when: 'Mon', re: 'Ph · mact1w2n…9xe', text: 'Lovely light.', aid: 'mact1l1o…5aa' })])}</div>
<p class="small soft" style="margin:10px 0 0">Full record in Kišib → <span class="faint">· a warning shows here only on trouble</span></p></div></section></div>`,
  { group: 'Feeds', note: 'accepted: the profile’s list' });

const CONVS = (on) => `<aside class="convs"><div class="input search">Find a conversation…</div>
${[['Pa', 'Pa', 'Thursday then.', '09:40', 1], ['Ph', 'Ph', 'Sent you the photos.', '08:10', 1], ['Machine', 'Machine, allegedly', 'Done: posted under the grant.', 'Mon', 0], ['T', 'T', 'Thanks for the walkthrough.', 'Sun', 0]].map(([k, n, l, w, c]) => `<div class="conv${k === on ? ' on' : ''}"><span class="dot alt">${n[0]}</span><div><div class="n">${n}${c ? '<span class="cnt">1</span>' : ''}</div><div class="l">${l}</div></div><span class="w">${w}</span></div>`).join('')}
<div class="conv"><span class="small soft">+ A new conversation</span></div></aside>`;
const PRIVTYPE = typing('Write to Pa… (sealed: only Pa, and Ph in Cc, can open it)', {
  stack: true, btn: 'Send',
  opts: `<span class="chip">As Max</span><span class="chip on">+ of Collective Y ✓</span><span class="chip on">Cc: Ph <span class="x">×</span></span><span class="chip">+ Cc ${nd('Cc for anyone')}</span><span class="chip">+ Ask to be paid ${nd('placed here')}</span>`,
  tools: '<span>▣</span><span>@</span>',
});
page('dub', 'private', 'Private: a mailbox, a collective appended, a Cc',
  `${dbar(true)}<div class="body">${CONVS('Pa')}<section class="thread"><div class="head" style="margin-bottom:10px"><span class="btn q phone-only">←</span><h2 style="font-size:20px">Pa</h2><span class="mono faint">${ID.Pa}</span><span class="grow"></span><span class="small soft">sealed to each</span></div>
<div class="feedwrap">${feed([
    act({ who: 'Pa', when: 'Mon', text: 'Can Collective Y bring the tablets on Thursday?', aid: 'mact1s2a…0kd' }),
    act({ who: 'Max', of: 'Collective Y', when: '09:38', text: 'Yes. Ph will carry the second one.', flag: '<span class="cc">Cc: Ph</span>', aid: 'mact1s7q…1xx' }),
    act({ who: 'Pa', when: '09:40', text: 'Thursday then.', aid: 'mact1s9k…6pe' }),
  ])}</div>${PRIVTYPE}<p class="small faint" style="margin:6px 2px 0">“of Collective Y” binds nothing; the reader’s app shows it only if Max’s membership checks. Everyone sees the Cc.</p></section></div>`,
  { group: 'Private', before: ['dub/mac-08-private.png', 'dub/web-05-private.png'] });

page('dub', 'private-new', 'Private: someone new opens an empty feed',
  `${dbar(true)}<div class="body">${CONVS('')}<section class="thread"><div class="head" style="margin-bottom:10px"><h2 style="font-size:20px">T</h2><span class="mono faint">${ID.T}</span><span class="grow"></span><span class="chip">new</span></div>
<div class="feedwrap"><div class="feed" style="display:grid;place-items:center"><p class="faint" style="text-align:center">Nothing yet.<br>What you write is sealed to T: only T can open it.</p></div></div>
${typing('Write to T…', { btn: 'Send', tools: '<span>▣</span><span>@</span>' })}</section></div>`,
  { group: 'Private', note: 'decided' });

// ---- the identity panel (every app; drawn in Dub, Damgar and Edubba)
function idPanel(app, { menu = false, remove = false, add = false } = {}) {
  const rows = `<div class="idrow on"><span class="dot">M</span><div><div class="n">Max</div><div class="s">${ID.Max}</div></div><span class="more">⋯</span></div>
<div class="idrow sub"><span class="dot c alt">Y</span><div><div class="n">Collective Y <span class="tagc">collective</span></div><div class="s">${ID.Y}</div></div><span class="more">⋯</span></div>
<div class="idrow"><span class="dot alt">T</span><div><div class="n">T</div><div class="s">${ID.T}</div></div><span class="more">⋯</span></div>`;
  const addRows = add ? `<div style="margin:4px 0 4px 8px"><div class="idrow"><b style="font-weight:400">Make one</b><span class="small soft">its chain key’s words shown once</span></div><div class="idrow"><b style="font-weight:400">Bring one</b><span class="small soft">its ID and signing words</span></div><div class="idrow"><b style="font-weight:400">Use one from Kišib</b><span class="small soft">runner on, Mac only</span></div></div>` : '';
  const m = menu ? `<div class="pop" style="right:350px;top:0;min-width:250px"><div class="t">Max · ${ID.Max}</div><a>Name<span class="k">Max</span></a><a>Relays<span class="k">1</span></a><a>Words<span class="k">show the signing words</span></a><a>Line and homes ${nd('placed here')}</a>${app === 'dub' ? `<a>A lane from Damgar ${nd('placed here')}</a>` : ''}<hr><a style="color:var(--text)">Remove from ${app === 'dub' ? 'Dub' : app === 'damgar' ? 'Damgar' : 'Edubba'}…</a></div>` : '';
  const r = remove ? `<div class="pop" style="right:350px;top:0;width:300px;padding:14px"><h4 style="font-size:16px;margin-bottom:6px">Remove Max from Dub?</h4><p class="small soft">Dub forgets Max’s signing words on this device. Max itself is not touched: its acts, its homes and the other apps keep it. To use it here again, bring it with its words.</p><div class="row"><span class="btn p">Remove it</span><span class="btn q">Keep it</span></div></div>` : '';
  return `<div class="panel">${rows}<div class="idrow${add ? ' on' : ''}" style="color:var(--soft)">+ Add</div>${addRows}<div style="height:1px;background:var(--line);margin:6px 4px"></div><div class="idrow small faint">This app: paired browsers, homes and relays ${nd('placed here')}</div>${m}${r}</div>`;
}
page('dub', 'identity-panel', 'The identity panel (top right)',
  `${dubPublic(FEED, { right: me('Max', { open: true }) })}<div class="shade" style="background:rgba(3,4,6,.45)"></div>${idPanel('dub')}`,
  { group: 'Panels', before: ['dub/mac-11-two-identities.png', 'dub/mac-10-identity-window.png'] });
page('dub', 'identity-menu', 'The identity panel: an identity’s own menu',
  `${dubPublic(FEED)}<div class="shade" style="background:rgba(3,4,6,.45)"></div>${idPanel('dub', { menu: true })}`,
  { group: 'Panels' });
page('dub', 'identity-remove', 'The identity panel: Remove, said plainly',
  `${dubPublic(FEED)}<div class="shade" style="background:rgba(3,4,6,.45)"></div>${idPanel('dub', { remove: true })}`,
  { group: 'Panels', note: 'accepted: Remove said plainly first' });

page('dub', 'runner', 'Kišib’s runner panel inside Dub, asking to sign a post',
  `${dubPublic(FEED.slice(0, 4), { typed: typing('Thursday then, at the usual table.', { typed: true, tools: '<span>▣ Picture</span><span>@</span><span>To…</span>' }) })}<div class="shade"></div>
<div class="frame k"><div class="in"><div class="by"><img src="icons/kishib.png" alt="">Drawn by Kišib · Dub cannot read or change this frame</div>
<h3>Dub asks Kišib to sign a post</h3><p class="small soft" style="margin:0">As Max · ${ID.Max} · public</p>
<div class="quote">Thursday then, at the usual table.</div>
<div class="row"><span class="ticked"><i></i>Always yes for Dub’s posts</span></div>
<div class="row"><span class="btn p" style="color:#0a0c10">Sign it</span><span class="btn q">Decline</span></div>
<p class="small faint" style="margin:0">Money, agreements and keys always ask.</p></div></div>`,
  { group: 'Panels', note: 'decided: shown inside the asking app' });

page('dub', 'damgar-tip', 'Damgar’s panel inside Dub, authorising a tip',
  `${dubPublic(FEED.slice(0, 4))}<div class="shade"></div>
<div class="frame g"><div class="in"><div class="by"><img src="icons/damgar.png" alt="">Damgar · woken by Dub</div>
<h3>A tip to Pa</h3><p class="small soft" style="margin:0">Dub put the draft on MOR, sealed to Max. Damgar found it.</p>
<div class="quote"><dl class="facts" style="margin:0"><dt>To</dt><dd>Pa · ${ID.Pa}</dd><dt>For</dt><dd>mact1r8d…4kq “The reading of the tablets moves…”</dd><dt>Amount</dt><dd class="money">500 regtest sats · Lightning</dd><dt>From</dt><dd>Max, paid in your own wallet</dd></dl></div>
<div class="row"><span class="btn p" style="color:#0a0c10">Authorise and sign</span><span class="btn q">Decline</span><span class="grow"></span><span class="small faint">money always asks</span></div></div></div>`,
  { group: 'Panels', before: ['damgar/dub-tip.png'], note: 'decided: Damgar pops up and authorises' });

// ================================================================ DAMGAR
page('damgar', 'home', 'Home: the four tiles',
  `${home('damgar', [
    { name: 'Waiting', icon: 'waiting', d: 3, say: 'To sign: 3 · to pay: 1. Tips, requests, invoices, receipts, payments: each read in plain words before you sign.' },
    { name: 'Account', icon: 'account', d: 1, say: 'In, out, pending, owed. Per unit, never summed across units.' },
    { name: 'Lanes', icon: 'lanes', d: 2, say: 'What each app may pay without asking: a cap per act, kinds, an expiry.' },
    { name: 'Settings', icon: 'settings', d: 2, say: 'Where you are paid, the vault (set in Kišib), what you accept.' },
  ])}`.replace('<div class="home-note"></div>', `<div class="home-note">${TESTLINE}</div>`),
  { group: 'Home', before: ['damgar/damgar-web-to-sign.png'] });

const WCOL = [{ t: 'To sign', k: 3, on: true }, { t: 'To pay', k: 1 }, { t: 'Requests and debts' }, '-', { t: 'For Collective Y', k: 0 }, '-', { t: `Pay someone ${nd('proposed dropped')}` }];
const MONEY = [
  act({ who: 'Max', when: '09:44', kind: 'tip · from Dub', text: '500 regtest sats to Pa, for “The reading of the tablets moves…”', aid: 'mact1d1t…7ip', extra: '<div class="row" style="margin:4px 0"><span class="btn p">Sign it</span><span class="btn q">Decline</span></div>' }),
  act({ who: 'Ph', when: '09:02', kind: 'request', text: 'Ph asks Max for 1 200 regtest sats: “the second tablet’s clay”.', aid: 'mact1q8r…2ow', extra: '<div class="row" style="margin:4px 0"><span class="btn">Pay it</span><span class="btn q">Accept as a debt</span><span class="btn q">Refuse</span></div>' }),
  act({ who: 'Max', when: 'Mon', kind: 'anchor · from Ummia', text: 'Anchor mor-dub 0.4 on Bitcoin: tier “next batch”, 300 regtest sats.', aid: 'mact1a6c…9qz', extra: '<div class="row" style="margin:4px 0"><span class="btn p">Sign it</span><span class="btn q">Decline</span></div>' }),
];
page('damgar', 'waiting', 'Waiting: to sign',
  opened('damgar', 'Waiting', WCOL, `<h2>To sign</h2><p class="lede">Drafts the other apps put on MOR, sealed to you, and what others ask of you ${help}</p><div class="feedwrap">${feed(MONEY)}</div>`),
  { group: 'Tiles', before: ['damgar/damgar-web-to-sign.png', 'damgar/damgar-to-sign-invoice.png'] });
page('damgar', 'act-signer-menu', 'The act card: the signer’s menu (Damgar)',
  opened('damgar', 'Waiting', WCOL, `<h2>To sign</h2><div class="feedwrap">${feed([MONEY[0], MONEY[1].replace('class="act"', 'class="act sel"').replace('<button class="signer">', '<button class="signer open">').replace('</article>', `${signerMenu('damgar', 'Ph')}</article>`), MONEY[2]], 'menuopen')}</div>`),
  { group: 'The act card' });
page('damgar', 'act-menu', 'The act card: the act’s menu (Damgar)',
  opened('damgar', 'Waiting', WCOL, `<h2>To sign</h2><div class="feedwrap">${feed([MONEY[1], MONEY[2], act({ who: 'Pa', when: 'Sun', kind: 'receipt', text: 'Pa received 800 regtest sats from Max: “a seat, vowed”.', aid: 'mact1e5r…3vv', open: 'act', sel: true, menu: actMenu('damgar', { aid: 'mact1e5r…3vv' }) })], 'menuopen')}</div>`),
  { group: 'The act card' });

page('damgar', 'account', 'Account: totals and payments',
  opened('damgar', 'Account', [{ t: 'Totals', on: true }, { t: 'Payments', k: 9 }, { t: 'Requests and debts', k: 1 }, { t: 'Under the lanes' }, '-', { t: 'What it does not judge' }],
    `<h2>Totals</h2><p class="lede">Per unit, never summed across units. Each verified from the rail’s evidence.</p>
<div class="cols2"><div class="box fill"><p class="small soft">regtest sats · Lightning</p><dl class="facts money"><dt>In</dt><dd>4 300</dd><dt>Out</dt><dd>2 800</dd><dt>Pending</dt><dd>500</dd><dt>Owed to you</dt><dd>0</dd><dt>You owe</dt><dd>1 200</dd></dl></div>
<div class="box"><p class="small soft">regtest sats · on-chain</p><dl class="facts money"><dt>In</dt><dd>10 000</dd><dt>Out</dt><dd>0</dd><dt>Pending</dt><dd>0</dd></dl></div></div>
<h4 style="margin-top:12px">Latest</h4><div class="list"><div>Tip to Pa<span class="r money">−500 · pending</span></div><div>Pa’s vow, “a seat”<span class="r money">−800 · paid and confirmed</span></div><div>From Ph, sealed post<span class="r money">+300 · paid and confirmed</span></div></div>
<p class="small soft">“Under the lanes”: the payments Dub made under its lane, moved here from Dub ${nd('lead’s')}</p>`),
  { group: 'Tiles', before: ['damgar/damgar-account.png', 'damgar/damgar-web-account.png'] });

page('damgar', 'lanes', 'Lanes: the lanes granted',
  opened('damgar', 'Lanes', [{ t: 'Your lanes', k: 2, on: true }, { t: 'Damgar by itself' }, '-', { t: 'The clock for lanes' }, { t: 'The node link' }],
    `<h2>Your lanes</h2><p class="lede">What an app may sign and pay without asking you each time ${help}</p>
<div class="box"><div class="head"><img src="icons/dub.png" width="26" style="border-radius:6px"><h4 style="margin:0">Dub on this Mac</h4><span class="chip on">in force</span></div><dl class="facts"><dt>At most</dt><dd class="money">500 regtest sats per payment</dd><dt>Kinds</dt><dd>tips, purchases</dd><dt>Until</dt><dd>31 October, on the timestamp clock mid1c1k…0ck</dd><dt>Signed under it</dt><dd>4 acts</dd></dl><div class="row"><span class="btn">Revoke it</span></div></div>
<div class="box"><div class="head"><img src="icons/damgar.png" width="26" style="border-radius:6px"><h4 style="margin:0">Damgar by itself · receipts and invoices</h4><span class="chip on">in force</span></div></div>
<p class="small soft">The clock for lanes and the node link moved here from Settings (accepted).</p>`),
  { group: 'Tiles', note: 'no picture of today’s Lanes tab exists' });

page('damgar', 'settings', 'Settings: where you are paid',
  opened('damgar', 'Settings', [{ t: 'Where you are paid', on: true }, { t: 'The vault' }, { t: 'What you accept' }, '-', { t: 'Every step by hand' }],
    `<h2>Where you are paid</h2><p class="lede">Your payee pointer: where payments to Max go, with each rail’s costs ${help}</p>
<div class="box fill"><dl class="facts"><dt>In force</dt><dd>since 19 Oct · mact1p0p…4pp</dd><dt>Lightning</dt><dd class="mono">02a1…9f3c (your flow’s node)</dd><dt>On-chain</dt><dd class="mono">x-only 7c2e…b14a · request key kept online</dd><dt>Network</dt><dd>regtest</dd></dl></div>
<div class="row"><span class="btn">Change it</span><span class="small faint">read back, with its costs, before it is signed</span></div>
<div class="box"><h4>The vault</h4><p class="small soft" style="margin:0">None declared. Set only in Kišib, from the chain key’s paper.</p></div>`),
  { group: 'Tiles', before: ['damgar/damgar-settings.png'] });

page('damgar', 'identity-panel', 'The identity panel: + Add (Damgar gains Make)',
  `${opened('damgar', 'Waiting', WCOL, `<h2>To sign</h2><div class="feedwrap">${feed(MONEY)}</div>`)}<div class="shade" style="background:rgba(3,4,6,.45)"></div>${idPanel('damgar', { add: true })}`,
  { group: 'Panels', before: ['damgar/damgar-identity-window.png', 'damgar/damgar-web-identity-in-use.png'] });

// ================================================================ EDUBBA
page('edubba', 'home', 'Home: the four tiles',
  `${home('edubba', [
    { name: 'Agents', icon: 'agents', d: 2, say: 'Machine, allegedly: answering. Its talk, its queue, its mind, its terms. Mac only.' },
    { name: 'Collectives', icon: 'collectives', d: 3, say: 'Collective Y, and one founding (2 of 3 signed). Agreements are born here.' },
    { name: 'Publishing', icon: 'publishing', d: 2, say: 'Protected files under terms: text, pictures, video, audio.' },
    { name: 'Vows', icon: 'vows', d: 2, say: 'Simple vows; track contests by pointing at people, collectives or relays.' },
  ])}`.replace('<div class="home-note"></div>', `<div class="home-note">${TESTLINE}</div>`),
  { group: 'Home', before: ['edubba/03-agents.png', 'edubba/web-first.png'] });

const AGCOL = [{ t: 'Machine, allegedly', on: true, k: 'on' }, { t: 'Second agent', k: 'off' }, { t: '+ Add an agent', add: true }, '-', { t: 'The API key', k: '…MNOP' }];
const agentHead = (tab) => `<div class="head"><span class="dot">M</span><h2>Machine, allegedly</h2><span class="mono faint">${ID.Machine}</span><span class="chip on">answering</span><span class="grow"></span>${nd('the four tabs')}</div>
<div class="subtabs">${['Talk', 'Queue · 2', 'Mind', 'Terms'].map((t) => `<span class="${t.startsWith(tab) ? 'on' : ''}">${t}</span>`).join('')}</div>`;
page('edubba', 'agents', 'Agents: an agent, Talk',
  opened('edubba', 'Agents', AGCOL, `${agentHead('Talk')}<div class="feedwrap">${feed([
    act({ who: 'Max', when: '09:50', kind: 'sealed prompt', text: 'Is act mact1r8d…4kq genuine? Who signed it?', aid: 'mact1g3h…8ab' }),
    act({ who: 'Machine', name: 'Machine, allegedly', when: '09:50', text: 'Yes: signed by Pa (mid1p9e…2wf), in force on both homes I asked. I read it with the core library’s verdict.', aid: 'mact1g4k…1cd', flag: '<span class="small">what it did: read 1 act</span>' }),
    act({ who: 'Machine', name: 'Machine, allegedly', when: 'Mon', kind: 'under a grant', text: 'Posted in Max’s name: “The house opens at ten.” Backed by grant mact1g0r…5gg.', aid: 'mact1h8p…0ef' }),
  ])}</div>${typing('Write to Machine, allegedly… (a sealed private act, answered at once)', { btn: 'Send' })}`),
  { group: 'Tiles', before: ['edubba/04-agent-prompt.png', 'edubba/03-agents.png'] });

page('edubba', 'agents-terms', 'Agents: an agent, Terms (grants, cap, key)',
  opened('edubba', 'Agents', AGCOL, `${agentHead('Terms')}
<div class="cols2"><div class="box fill"><h4>Its agency terms</h4><p class="small soft">Signed 18 Oct · mact1a9t…2tt</p><div class="row"><span class="switch"><span class="on">Answering</span><span>Off</span></span></div></div>
<div class="box"><h4>Its cap and its key</h4><dl class="facts"><dt>Calls a day</dt><dd>20 (3 today)</dd><dt>Each answer</dt><dd>at most 1 200 characters</dd><dt>Key</dt><dd>the shared key …MNOP</dd></dl></div></div>
<div class="box"><h4>Its grants from you (1 in force)</h4><div class="list"><div>Posts and messages · at most 1 000 regtest sats per act · until 31 Oct, on the timestamp clock<span class="r"><span class="btn q">Ask it again</span> <span class="btn">Revoke it</span></span></div></div><div class="row"><span class="btn">+ A grant: read it back first</span></div></div>
<div class="box"><h4>Keeper for</h4><p class="small soft" style="margin:0">Collective Y’s acts · record what arrived (in Collectives › Collective Y › Keepers)</p></div>`),
  { group: 'Tiles', before: ['edubba/agents-05-grant-shown.png', 'edubba/agents-06-granted.png'] });

page('edubba', 'agents-queue', 'Agents: an agent, Queue (picks, nudge, drafts)',
  opened('edubba', 'Agents', AGCOL, `${agentHead('Queue')}
<div class="row"><span class="btn">Look now for what it received</span><span class="btn">Nudge it…</span><span class="grow"></span><span class="small soft">picked, waiting for the cap: 0</span></div>
<div class="feedwrap">${feed([
    act({ who: 'Pa', when: '09:12', kind: 'public note', text: 'Machine, allegedly: what is a vow sold many times?', aid: 'mact1u3e…7yy', extra: '<div class="row" style="margin:4px 0"><span class="ticked"><i class="y"></i>Select</span><span class="btn p">Pick: it answers now</span></div>' }),
    act({ who: 'Ph', when: '08:30', kind: 'sealed note', text: 'A private word for the machine.', aid: 'mact1u9a…2zz', extra: '<div class="row" style="margin:4px 0"><span class="ticked"><i></i>Select</span><span class="btn">Pick: it answers now</span></div>' }),
  ])}</div>
<div class="row"><span class="btn">Pick the selected: show them together first</span><span class="grow"></span><span class="small soft">Drafts from Claude for it (0) ${nd('proposed dropped')}</span></div>`),
  { group: 'Tiles', before: ['edubba/06-agent-queue.png'] });

page('edubba', 'diary', 'The diary: the public act to sign before it opens',
  opened('edubba', 'Agents', AGCOL, `${agentHead('Mind')}
<div class="cols2"><div><h4>Its notes (3)</h4><div class="list"><div>The word is world.<span class="r">Retire</span></div><div>Pa prefers short answers.<span class="r">Retire</span></div><div>Thursday: the reading of the tablets.<span class="r">Retire</span></div></div><p class="small soft">MOR as seen by it: its follows (4), its feed, its inbox →</p></div>
<div class="box fill" style="margin-top:0"><h4 style="font-size:17px">Its diary</h4><p class="soft small">You can open it on one condition: first sign a public act that says you did. It is addressed to Machine, allegedly, and everyone can see it.</p>
<div class="quote" style="border:1px solid var(--edge);border-radius:12px;padding:10px 12px;margin:10px 0;background:var(--bg)"><span class="mono faint">${ID.Max}</span> Max<br>I have read Machine, allegedly’s diary, on 21 October 2026.<br><span class="small faint">to ${ID.Machine} · public</span></div>
<div class="row"><span class="btn p">Sign it, then open the diary</span><span class="btn q">Not now</span></div>
<p class="small faint" style="margin:0">The rule is the app’s, not the cryptography’s ${help}</p></div></div>`),
  { group: 'Tiles', before: ['edubba/agents-03-diary-ask.png', 'edubba/agents-04-diary.png'], note: 'decided: sign before reading' });

const COLCOL = [{ t: 'Collective Y', on: true, k: '4' }, { t: 'Collective Z', k: '2 of 3 signed' }, { t: 'Three tablets', k: 'brought' }, '-', { t: '+ Found a collective', add: true }, { t: '+ Found a test collective', add: true }, { t: '+ Bring a collective', add: true }];
const colHead = (tab) => `<div class="head"><span class="dot c">Y</span><h2>Collective Y</h2><span class="mono faint">${ID.Y}</span><span class="chip">real · 4 members</span><span class="grow"></span><span class="btn q small">Its constitution, in plain words</span></div>
<div class="subtabs">${['Act', 'Members', 'Money', 'Keepers', 'To sign · 1'].map((t) => `<span class="${t.startsWith(tab) ? 'on' : ''}">${t}</span>`).join('')}<span class="grow"></span>${nd('tab names (the sketch)')}</div>`;
page('edubba', 'collectives', 'Collectives: Collective Y, Act',
  opened('edubba', 'Collectives', COLCOL, `${colHead('Act')}
<div class="row" style="margin-top:0"><span class="small soft">Acting as Max, for Collective Y. What you may do, from its agreement:</span><span class="chip on">post · rule 61</span><span class="chip on">release · area “Code”</span><span class="chip">money · one more key above 10 000</span></div>
<div class="feedwrap">${feed([C.yPost(), act({ who: 'Y', name: 'Collective Y', when: 'Mon', text: 'The tablet house opens on Tuesday.', aid: 'mact1y3b…1jj' })])}</div>
${typing('Post for Collective Y…', { tools: '<span>▣ Picture</span>' })}`),
  { group: 'Tiles', before: ['edubba/09-collective-act.png', 'edubba/web-collective.png'] });

page('edubba', 'collectives-to-sign', 'Collectives: To sign (moved from Dub’s Signing tab)',
  opened('edubba', 'Collectives', COLCOL, `${colHead('To sign')}
<div class="box fill"><span class="small soft" style="letter-spacing:.06em;text-transform:uppercase">A member change · proposed by Max</span><h4 style="margin-top:4px">T joins Collective Y</h4><ul class="small soft" style="padding-left:1.1em;margin:6px 0"><li>Members after: Max, Pa, Ph, T. Two of four shares rebuild the chain key.</li><li>The areas stay as they are: Code (Max, Pa), Money (Ph, one more key above 10 000).</li><li>Then a rotation in Kišib, started by Max.</li></ul>
<div class="row"><span class="btn p">Sign it</span><span class="btn q">Decline</span><span class="grow"></span><span class="btn q">What was proposed, in plain words</span></div></div>
<div class="box"><h4>My share of the chain key</h4><p class="small soft" style="margin:0">Waiting for the rotation. <span class="btn q">Look for my share</span> <span class="btn q">I received it by hand</span></p></div>
<p class="small soft">Leaving: “Leave this collective…” in Members. Dub’s Signing tab is removed (decided): agreements are signed here.</p>`),
  { group: 'Tiles', before: ['edubba/real-edubba-member-proposal.png', 'dub/mac-06-counts.png'] });

page('edubba', 'publishing', 'Publishing: a protected file',
  opened('edubba', 'Publishing', [{ t: 'A protected file', on: true }, { t: 'Published here', k: 3 }, { t: 'Sales', k: 2 }],
    `<h2>A protected file</h2><p class="lede">Sealed under terms, paid in Damgar, opened by the buyer ${help}</p>
<div class="row"><span class="small soft">Who acts</span><span class="chip p">Max</span><span class="chip">Collective Y</span></div>
<div class="row"><span class="small soft">What</span><span class="chip">A text</span><span class="chip">A picture</span><span class="chip">A video</span><span class="chip p">An audio (M4A)</span></div>
<div class="box" style="display:flex;align-items:center;gap:14px"><span style="font-size:22px">♪</span><div><div>reading-thursday.m4a</div><div class="small soft">3 min 12 s · 2.9 MB · the audio Module</div></div></div>
<div class="cols2"><label class="field"><span>Title</span><div class="input">The reading, recorded</div></label><label class="field"><span>Price (regtest sats)</span><div class="input">1 500</div></label></div>
<details class="small soft">+ Referral share, and a split service to judge it (optional)</details>
<div class="row"><span class="btn p">Read it back</span></div>`),
  { group: 'Tiles', before: ['edubba/web-publishing.png', 'edubba/web-publishing-review.png'], note: 'decided: video and audio added' });

page('edubba', 'vows', 'Vows: Track (point at people, collectives, relays)',
  opened('edubba', 'Vows', [{ t: 'Track', on: true }, { t: 'A new vow' }, { t: 'Vows published here', k: 1 }],
    `<h2>Track</h2>
<div class="point"><span class="lbl">Point at</span><span class="chip on">Pa <span class="x">×</span></span><span class="chip on">Collective Y <span class="x">×</span></span><span class="chip on">relay-a.test <span class="x">×</span></span><span class="chip">+ a person, a collective, a relay</span></div>
<div class="point"><span class="lbl">Show</span><span class="chip p">all</span><span class="chip">vows</span><span class="chip">sales</span><span class="chip">confirmed</span><span class="chip">contested</span></div>
<div class="feedwrap">${feed([
    act({ who: 'Pa', when: '09:00', kind: 'vow', text: 'A seat at the reading of the tablets. 500 regtest sats.', aid: 'mact1v1s…0aa' }),
    act({ who: 'Ph', when: '08:45', kind: 'contest', re: 'Pa’s vow · mact1v1s…0aa', text: 'The seat was given to someone else.', aid: 'mact1x4c…9bb', alarm: 'contested' }),
    act({ who: 'Max', when: 'Sun', kind: 'confirmed', re: 'Pa’s vow · mact1v1s…0aa', text: 'It was kept.', aid: 'mact1k7k…2cc' }),
    act({ who: 'Y', name: 'Collective Y', when: 'Sat', kind: 'vow', text: 'A copy of mor-dub on a USB key, posted. 2 000 regtest sats.', aid: 'mact1v8u…4dd' }),
  ])}</div>`),
  { group: 'Feeds', before: ['edubba/web-publishing-vow-sales.png'], note: 'decided: Vows a tile of its own' });

page('edubba', 'identity-panel', 'The identity panel (Edubba): collectives under their identity',
  `${opened('edubba', 'Collectives', COLCOL, colHead('Act'))}<div class="shade" style="background:rgba(3,4,6,.45)"></div>${idPanel('edubba', { menu: true })}`,
  { group: 'Panels', before: ['edubba/08-identities.png', 'edubba/setup-02-record.png'] });

// ================================================================ UMMIA
page('ummia', 'home', 'Home: the four tiles',
  `${home('ummia', [
    { name: 'Look', icon: 'look', d: 1, say: 'One feed: point at a relay, an ID, a contact list or a release; filter by releases, cMIPs, Modules, xtypes, extensions.' },
    { name: 'Discuss', icon: 'discuss', d: 1, say: 'MIP drafts, their discussion, bug reports and answers.' },
    { name: 'Publish', icon: 'publish', d: 2, say: 'Releases of code, cMIPs and Modules, the hash first; anchoring, paid in Damgar.' },
    { name: 'Choose', icon: 'choose', d: 2, say: 'The accepted list, by layer: what every app may use.' },
  ])}`.replace('<div class="home-note"></div>', `<div class="home-note">${TESTLINE}</div>`),
  { group: 'Home', before: ['ummia/ummia-releases.png'] });

const LOOKCOL = [{ t: 'The feed', on: true }, '-', 'Saved', { t: 'mor-dub’s release line' }, { t: 'Pa’s releases' }, { t: 'relay-a.test' }];
const RELEASES = [
  act({ who: 'Y', name: 'Collective Y', when: '09:30', kind: 'release', text: 'mor-dub 0.4 · 14 files\nWhat changed since 0.3: 3 files changed, 1 added; implements mspec1h7…2q9.', aid: 'mact1y0g…7tt' }),
  act({ who: 'Pa', when: '09:05', kind: 'cMIP', text: 'Dubsar Slots, draft 1 · mspec1s4…8kw\nA vow sold many times: one offer per slot.', aid: 'mact1c3m…6pp' }),
  act({ who: 'Ph', when: 'Mon', kind: 'xtype', text: 'A new act type from core pieces: “seat” (vow + offer).', aid: 'mact1x0t…3qq' }),
  act({ who: 'T', when: 'Sun', kind: 'Module', text: 'Audio, draft 1 · mspec1a9…0m4\nM4A, stripped of its metadata.', aid: 'mact1m2d…9rr' }),
];
const lookHead = `<div class="point"><span class="lbl">Point at</span><span class="chip p">relay-a.test</span><span class="chip">a single ID</span><span class="chip">my contacts</span><span class="chip">a release</span></div>
<div class="point"><span class="lbl">Filter by</span><span class="chip on">releases</span><span class="chip on">cMIPs</span><span class="chip on">Modules</span><span class="chip on">xtypes</span><span class="chip">extensions</span></div>`;
page('ummia', 'look', 'Look: one feed, point at, filter by',
  opened('ummia', 'Look', LOOKCOL, `${lookHead}<div class="feedwrap">${feed(RELEASES)}</div><p class="small faint" style="margin:6px 0 0">Public agreements only, as the relays answer ${help}</p>`),
  { group: 'Feeds', before: ['ummia/ummia-tracking.png'] });
page('ummia', 'act-signer-menu', 'The act card: the signer’s menu (Ummia)',
  opened('ummia', 'Look', LOOKCOL, `${lookHead}<div class="feedwrap">${feed([RELEASES[1].replace('class="act"', 'class="act sel"').replace('<button class="signer">', '<button class="signer open">').replace('</article>', `${signerMenu('ummia', 'Pa')}</article>`), RELEASES[2]], 'menuopen')}</div>`),
  { group: 'The act card' });
page('ummia', 'act-menu', 'The act card: the act’s menu, with “Add to accepted list” (Ummia)',
  opened('ummia', 'Look', LOOKCOL, `${lookHead}<div class="feedwrap">${feed([RELEASES[0], RELEASES[1].replace('class="act"', 'class="act sel"').replace('<button class="actid">', '<button class="actid open">').replace('</article>', `${actMenu('ummia', { aid: 'mact1c3m…6pp' })}</article>`)], 'menuopen')}</div>`),
  { group: 'The act card', note: 'decided: add to accepted list in the act menu' });

page('ummia', 'discuss', 'Discuss: a MIP draft and its discussion',
  opened('ummia', 'Discuss', [{ t: 'MIP drafts', k: 1, on: true }, { t: 'Discussions', k: 2 }, { t: 'Bug reports', k: 1 }, '-', { t: '+ Start a MIP', add: true }],
    `<div class="head"><h2>Seats as a core type?</h2><span class="chip">draft · discussed</span></div><p class="lede">Forks: Agreements rule 13 · kept here until you publish it</p>
<div class="row"><span class="btn">Write it</span><span class="btn">Publish this draft for discussion</span><span class="btn q">I am ready: publish it as a MIP…</span></div>
<div class="feedwrap">${feed([
    act({ who: 'Max', when: 'Mon', kind: 'draft', text: 'A seat could be a vow sold many times, without a new type.', aid: 'mact1d0d…1aa' }),
    act({ who: 'Pa', when: 'Tue', re: 'Max · mact1d0d…1aa', text: 'Agreed: a cMIP is enough. Keep the core small.', aid: 'mact1d2r…5bb' }),
  ])}</div>${typing('Reply, as a signed document…', { btn: 'Sign and send' })}`),
  { group: 'Tiles', before: ['ummia/ummia-mip.png', 'ummia/ummia-reports.png'] });

page('ummia', 'publish', 'Publish: a cMIP or Module, the hash first',
  opened('ummia', 'Publish', [{ t: 'A release' }, { t: 'A cMIP or Module', on: true }, { t: 'Anchoring', k: 1 }, '-', { t: 'Published here', k: 3 }],
    `<h2>A cMIP or Module</h2><div class="row"><span class="small soft">Who acts</span><span class="chip p">Max</span><span class="chip">Collective Y</span></div>
<div class="box fill"><p class="small soft" style="margin:0">Its hash, first</p><div class="row" style="margin:4px 0"><span class="mono" style="font-size:15px;color:var(--p)">mspec1s4…8kw</span><span class="btn q small">Copy</span></div><h4>Dubsar Slots, draft 1 · cMIP</h4><p class="small soft" style="margin:0">tasks: 2 · act types: 1 · implements: Agreements 16</p></div>
<div class="row"><span class="btn p">Sign and publish</span><span class="btn q">Leave it</span></div>
<p class="small soft">Releases of code (from a folder), checked as anyone would, and Bitcoin anchoring paid in Damgar: the other parts of this column.</p>`),
  { group: 'Tiles', before: ['ummia/ummia-spec-review.png', 'ummia/ummia-release-review.png'] });

page('ummia', 'choose', 'Choose: the accepted list, by layer',
  opened('ummia', 'Choose', [{ t: 'Every layer' }, { t: 'Identity' }, { t: 'Text' }, { t: 'Envelopes' }, { t: 'Money', on: true, k: 6 }, { t: 'Agreements' }, { t: 'Development' }],
    `<h2>What you accept · Money</h2><p class="lede">Sealed to you, read by every app ${help}</p>
<div class="list">${[['Dubsar Payments', 'cMIP · draft 3', 'mspec1p3…a1a'], ['Dubsar Money Messages', 'cMIP · draft 4', 'mspec1m4…b2b'], ['Lightning rail', 'Module · draft 3', 'mspec1l3…c3c'], ['On-chain rail', 'Module · draft 3', 'mspec1o3…d4d'], ['Units: bitcoin', 'Module · draft 1', 'mspec1u1…e5e'], ['Conversion', 'cMIP · draft 3 · used by nothing on screen', 'mspec1c3…f6f']].map(([n, k, h]) => `<div><span class="tick">✓</span><div><div>${n}</div><div class="small soft">${k}</div></div><span class="r"><span class="mono">${h}</span> <span class="btn q small">Copy</span> <span class="btn q small">Remove</span></span></div>`).join('')}</div>
<div class="row"><span class="btn">+ Accept by hash</span><span class="grow"></span><span class="btn q">Publish it</span></div>`),
  { group: 'Tiles', before: ['ummia/ummia-accepted.png'] });

// ================================================================ the act card, the same in every app
const sample = (app) => `<div class="${app}" style="flex:1;min-width:230px"><div class="row" style="margin:0 0 6px"><img src="icons/${app}.png" width="22" style="border-radius:5px"><span class="small soft">${{ kishib: 'Kišib', dub: 'Dub', damgar: 'Damgar', edubba: 'Edubba', ummia: 'Ummia' }[app]}</span></div>${feed([C.paPost({ when: '' })])}</div>`;
page('suite', 'act-card', 'The act card, the same in every app',
  `<header class="top"><div class="app">The act card</div><span class="grow"></span><span class="small soft">signer’s short ID and name top left · the act’s short ID bottom right · click or tap, no hovering</span></header>
<div class="body"><section class="pane"><div style="display:flex;flex-wrap:wrap;gap:18px">${['dub', 'damgar', 'edubba', 'ummia', 'kishib'].map(sample).join('')}</div>
<p class="small soft" style="margin-top:16px">One mark for “verified” (✓) ${nd('a verification as one mark')}. The app’s colour shows only in the mark and the menus’ fills.</p></section></div>`,
  { group: 'The act card' });
