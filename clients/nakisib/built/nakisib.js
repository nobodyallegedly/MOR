// ../kit/src/style.ts
var APPS = {
  kishib: { name: "Ki\u0161ib", colour: "#8ec5f0", pastel: "#cfe5f7", wash: "rgba(207,229,247,.075)", wash2: "rgba(207,229,247,.15)" },
  dub: { name: "Dub", colour: "#e9dfcd", pastel: "#efe8dc", wash: "rgba(239,232,220,.06)", wash2: "rgba(239,232,220,.13)" },
  damgar: { name: "Damgar", colour: "#e8b33a", pastel: "#f2d89c", wash: "rgba(242,216,156,.07)", wash2: "rgba(242,216,156,.15)" },
  edubba: { name: "Edubba", colour: "#48c08c", pastel: "#a9e3c7", wash: "rgba(169,227,199,.07)", wash2: "rgba(169,227,199,.15)" },
  ummia: { name: "Ummia", colour: "#ee8b74", pastel: "#f7c4b7", wash: "rgba(247,196,183,.07)", wash2: "rgba(247,196,183,.15)" }
};
var tints = Object.keys(APPS).map((a) => `.k-${a}{--k-c:${APPS[a].colour};--k-p:${APPS[a].pastel};--k-wash:${APPS[a].wash};--k-wash2:${APPS[a].wash2}}`).join("\n");
var KIT_STYLE = `@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(inter_light.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(inter_regular.woff2) format("woff2")}
:root{color-scheme:dark;--k-bg:#06080c;--k-raise:#0d1017;--k-raise2:#131720;--k-pop:#0f131a;--k-line:#232a35;--k-edge:#323a47;--k-text:#d6dae1;--k-soft:#8a919d;--k-faint:#4f5663;--k-ink:#0a0c10;--k-bad:#c4645f;--k-id:#9aa8b8;--k-c:#e9dfcd;--k-p:#efe8dc;--k-wash:rgba(239,232,220,.06);--k-wash2:rgba(239,232,220,.13)}
${tints}
.k-page,.k-page *{box-sizing:border-box}
html:has(.k-page),body:has(.k-page){margin:0;height:100%;background:var(--k-bg);color:var(--k-text);overflow:hidden}
.k-page{font:300 15px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--k-text);background:var(--k-bg);position:relative;display:flex;flex-direction:column;height:100vh;height:100dvh;max-width:none;margin:0;padding:0}
:where(.k-page) button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
:where(.k-page) button:disabled{opacity:.45;cursor:default}
:where(.k-page) :is(h1,h2,h3,h4){font-weight:300;margin:0;letter-spacing:.005em}
:where(.k-page) p{margin:6px 0}
:where(.k-page) a{color:var(--k-text);text-decoration:underline;text-decoration-color:var(--k-faint);text-underline-offset:3px}
:where(.k-page) :is(input,textarea,select){font:inherit;font-size:15px;color:var(--k-text);background:var(--k-raise);border:1px solid var(--k-edge);border-radius:10px;padding:8px 11px;width:100%}
:where(.k-page) :is(input,textarea,select):focus{outline:none;border-color:var(--k-p)}
:where(.k-page) input:is([type=checkbox],[type=radio]){width:auto;accent-color:var(--k-p)}
:where(.k-page) label{display:block;margin:10px 0 4px;font-size:13px;color:var(--k-soft)}
.k-page [hidden]{display:none!important}
.k-mono,:where(.k-page) code{font:12.5px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
.k-soft{color:var(--k-soft)}.k-faint{color:var(--k-faint)}.k-small{font-size:13px}
.k-grow{flex:1}
.k-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}
.k-bad{color:var(--k-bad)}
.k-offscreen{position:fixed;left:-9999px;top:0;opacity:0}

/* the top of every window: the app (or Contacts) left, a switch or tabs in the middle, the identity right */
.k-top{display:flex;align-items:center;gap:14px;height:56px;padding:0 20px;border-bottom:1px solid var(--k-line);flex:none;position:relative;z-index:5;background:var(--k-bg)}
.k-app{display:flex;align-items:center;gap:10px;font-size:16px;letter-spacing:.04em}
.k-app img{width:26px;height:26px;border-radius:6px}
.k-menu-btn{display:flex;align-items:center;gap:8px;color:var(--k-soft);font-size:14px;padding:6px 10px;border:1px solid var(--k-line);border-radius:10px}
.k-menu-btn:hover{color:var(--k-text)}
.k-switch{display:flex;border:1px solid var(--k-edge);border-radius:999px;padding:3px;gap:2px}
.k-switch button{padding:5px 18px;border-radius:999px;color:var(--k-soft);font-size:14px;display:flex;align-items:center;gap:6px}
.k-switch button.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}
.k-count{display:inline-block;min-width:1.4em;padding:0 6px;border-radius:999px;background:var(--k-edge);color:var(--k-text);font-size:11px;line-height:1.6;text-align:center}
.k-count:empty{display:none}
.k-on .k-count{background:var(--k-ink);color:var(--k-p)}
.k-me{display:flex;align-items:center;gap:10px;padding:4px 6px 4px 12px;border:1px solid var(--k-line);border-radius:999px;max-width:42%}
.k-me .k-n{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.k-me .k-s{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint);white-space:nowrap}
.k-dot{width:26px;height:26px;border-radius:50%;background:var(--k-p);color:var(--k-ink);display:grid;place-items:center;font-size:12px;font-weight:400;flex:none}
.k-dot.k-c{border-radius:7px}
.k-dot.k-alt{background:var(--k-raise2);color:var(--k-text);border:1px solid var(--k-edge)}
.k-body{flex:1;min-height:0;display:flex;position:relative}
.k-tabs{display:flex;gap:4px}
.k-tab{padding:6px 14px;border-radius:999px;color:var(--k-soft);font-size:14px;display:flex;align-items:center;gap:8px}
.k-tab.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}

/* tiles: big, an icon and words, danger marks; the edge thickens with the level; never red but for an alarm */
.k-home{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:18px;padding:24px 28px 12px}
.k-tile{position:relative;border-radius:22px;background:linear-gradient(160deg,var(--k-wash2),var(--k-wash) 55%,rgba(255,255,255,.015));border:1px solid var(--k-line);padding:26px 28px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;text-align:left}
.k-tile:hover,.k-tile:focus-visible{outline:1px solid var(--k-p);outline-offset:-1px}
.k-tile .k-ic{position:absolute;left:26px;top:24px;width:58px;height:58px;color:var(--k-p)}
.k-tile h2{font-size:34px;letter-spacing:.01em;color:var(--k-p)}
.k-tile p{color:var(--k-soft);font-size:14.5px;max-width:36em}
.k-tile .k-dm{position:absolute;right:24px;top:26px}
.k-tile.k-d2{border-color:rgba(255,255,255,.14);border-width:1.5px}
.k-tile.k-d3{border-color:rgba(255,255,255,.24);border-width:2.5px}
.k-tile.k-alarm{border-color:var(--k-bad)}
.k-tile .k-alert{position:absolute;right:24px;bottom:24px;color:var(--k-bad);font-size:13px;border:1px solid var(--k-bad);border-radius:999px;padding:2px 10px}
.k-dm{display:inline-flex;align-items:flex-end;gap:3px;height:20px}
.k-dm i{display:block;width:5px;border-radius:2px;background:var(--k-edge)}
.k-dm i:nth-child(1){height:8px}.k-dm i:nth-child(2){height:13px}.k-dm i:nth-child(3){height:19px}
.k-dm.k-l1 i:nth-child(1),.k-dm.k-l2 i:nth-child(-n+2),.k-dm.k-l3 i{background:var(--k-p)}

/* a tile opened: its column on the left, the part on the right; on a phone the column folds away once a part is chosen */
.k-col{width:248px;flex:none;border-right:1px solid var(--k-line);padding:18px 12px;display:flex;flex-direction:column;gap:2px;overflow:auto}
.k-col h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--k-faint);margin:14px 10px 6px}
.k-col h3:first-child{margin-top:0}
.k-col button{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;color:var(--k-soft);font-size:14.5px;text-align:left;width:100%}
.k-col button.k-on{background:var(--k-wash2);color:var(--k-text)}
.k-col button.k-on::before{content:"";width:3px;height:16px;border-radius:2px;background:var(--k-p);margin-left:-4px}
.k-col button .k-k{margin-left:auto;font-size:12px;color:var(--k-faint)}
.k-col .k-sep{height:1px;background:var(--k-line);margin:10px 8px}
.k-pane{flex:1;min-width:0;padding:22px 30px;overflow:auto;display:flex;flex-direction:column}
.k-pane>h2{font-size:24px;margin-bottom:4px}
.k-back{display:none;align-items:center;gap:6px;color:var(--k-soft);font-size:14px;margin:0 0 8px}

/* the feed box: fills its space and scrolls inside, never the page */
.k-feedwrap{flex:1;min-height:0;display:flex;flex-direction:column}
.k-controls{display:flex;align-items:center;gap:6px;margin:0 0 10px;flex-wrap:wrap}
.k-lens{padding:5px 14px;border-radius:999px;font-size:14px;color:var(--k-soft);border:1px solid var(--k-line);white-space:nowrap;display:inline-flex;gap:6px;align-items:center}
.k-lens.k-on{background:var(--k-p);color:var(--k-ink);border-color:var(--k-p)}
.k-point{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 8px;font-size:13px;color:var(--k-soft)}
.k-point .k-lbl{color:var(--k-faint);min-width:5.5em}
.k-feed{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;border:1px solid var(--k-line);border-radius:16px;padding:6px 14px;background:#080a0f;position:relative}
.k-feed::-webkit-scrollbar{width:8px}.k-feed::-webkit-scrollbar-thumb{background:var(--k-edge);border-radius:4px}.k-feed::-webkit-scrollbar-track,.k-feed::-webkit-scrollbar-corner{background:transparent}.k-feed::-webkit-scrollbar-button{display:none;height:0}
.k-empty{padding:28px 0;color:var(--k-faint);font-size:14px;text-align:center}
.k-clock{font-size:12px;color:var(--k-faint);margin:6px 2px 0}

/* the act card, the same in every app: the signer top left, the act bottom right, each its own menu */
.k-act{position:relative;padding:12px 2px 10px;border-bottom:1px solid var(--k-line)}
.k-act:last-child{border-bottom:0}
.k-act .k-signer{display:inline-flex;align-items:baseline;gap:9px;padding:2px 8px 2px 0;border-radius:8px;max-width:100%;flex-wrap:wrap;text-align:left}
.k-act .k-sid,.k-act .k-actid{font:12px ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id)}
.k-act .k-nm{font-size:15px;font-weight:400;color:var(--k-text)}
.k-act .k-dn{font-size:12.5px;color:var(--k-soft)}
.k-act .k-of{font-size:12.5px;color:var(--k-soft);border:1px solid var(--k-edge);border-radius:999px;padding:0 8px}
.k-act .k-hint{font-size:12px;color:var(--k-faint);margin:4px 0 0}
.k-act .k-when{float:right;font-size:12px;color:var(--k-faint)}
.k-act .k-txt{margin:4px 0 6px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.k-act .k-label{font-size:12.5px;color:var(--k-soft);margin:2px 0}
.k-act .k-label.k-warn{color:var(--k-c)}
.k-act .k-label.k-bad{color:var(--k-bad)}
.k-act .k-kind{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--k-soft);border:1px solid var(--k-line);border-radius:5px;padding:1px 6px;margin-right:6px}
.k-act .k-foot{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--k-faint);flex-wrap:wrap}
.k-act .k-actid{margin-left:auto;padding:2px 0 2px 8px;border-radius:8px}
.k-act .k-v{color:var(--k-p);font-size:12px}
.k-act .k-alarmline{color:var(--k-bad);font-size:12.5px}
.k-act .k-signer.k-open,.k-act .k-actid.k-open{background:var(--k-wash2);outline:1px solid var(--k-p)}
.k-act.k-sel{background:var(--k-wash);border-radius:12px;padding-left:10px;padding-right:10px;border-bottom-color:transparent}
.k-act figure{margin:8px 0 4px}
.k-act img,.k-act video{display:block;max-width:100%;max-height:60vh;height:auto;border-radius:12px;image-orientation:from-image}
.k-act audio{display:block;width:100%;margin:6px 0}
.k-act .k-doc{display:block;border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0;font-size:14px;text-decoration:none}
.k-act .k-box{border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0}

/* menus: what you take above a line, what changes something below */
.k-pop{position:fixed;z-index:40;min-width:236px;max-width:min(320px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
.k-pop .k-t{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint);padding:6px 10px 4px;overflow-wrap:anywhere}
.k-pop button{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;font-size:14px;color:var(--k-text);width:100%;text-align:left}
.k-pop button:hover,.k-pop button:focus-visible{background:var(--k-wash);outline:none}
.k-pop button:disabled{color:var(--k-faint);opacity:1}
.k-pop button .k-k{margin-left:auto;font-size:11.5px;color:var(--k-faint)}
.k-pop hr{border:0;border-top:1px solid var(--k-edge);margin:5px 4px}
.k-pop .k-own{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--k-p);padding:4px 10px 2px;opacity:.75}

/* the typing box: always in the same place, the bottom */
.k-typing{flex:none;display:flex;flex-direction:column;gap:6px;border:1px solid var(--k-edge);border-radius:16px;padding:10px 12px;margin-top:12px;background:var(--k-raise);position:relative}
.k-typing .k-line{display:flex;align-items:flex-end;gap:10px}
.k-typing textarea{flex:1;border:0;background:none;padding:2px 0;min-height:24px;max-height:30vh;resize:none;font-size:15px}
.k-typing .k-tools{display:flex;gap:8px;align-items:center;color:var(--k-soft);font-size:13px}
.k-typing .k-tools button,.k-typing .k-tools label{color:var(--k-soft);font-size:13px;margin:0;cursor:pointer;display:inline-flex;align-items:center}
.k-typing .k-tools button:hover,.k-typing .k-tools label:hover{color:var(--k-text)}
.k-typing input[type=file]{display:none}
.k-typing .k-opts{display:flex;gap:8px;flex-wrap:wrap}
.k-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid var(--k-edge);border-radius:999px;font-size:14px;color:var(--k-text)}
.k-btn.k-p{background:var(--k-p);border-color:var(--k-p);color:var(--k-ink);font-weight:400}
.k-btn.k-q{border-color:transparent;color:var(--k-soft)}
.k-btn.k-alarm{border-color:var(--k-bad);color:var(--k-bad)}
.k-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;border:1px solid var(--k-edge);font-size:13px;color:var(--k-soft)}
.k-chip.k-on{background:var(--k-wash2);border-color:transparent;color:var(--k-text)}
.k-chip .k-x{color:var(--k-faint)}

/* overlays: the pop-up thread, panels, frames */
.k-shade{position:fixed;inset:0;background:rgba(3,4,6,.66);z-index:30}
.k-shade.k-light{background:rgba(3,4,6,.45)}
.k-modal{position:fixed;z-index:31;left:50%;top:50%;transform:translate(-50%,-50%);width:min(600px,calc(100% - 28px));max-height:calc(100% - 60px);display:flex;flex-direction:column;background:#0b0e14;border:1px solid var(--k-edge);border-radius:18px;padding:16px 18px;box-shadow:0 24px 60px rgba(0,0,0,.7)}
.k-modal .k-mh{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.k-modal .k-mh h3{font-size:17px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-round{font-size:18px;color:var(--k-soft);width:30px;height:30px;border:1px solid var(--k-line);border-radius:50%;display:grid;place-items:center;flex:none}
.k-modal .k-mbody{min-height:0;overflow:auto;display:flex;flex-direction:column}
.k-modal .k-feed{max-height:60vh;flex:none}
.k-panel{position:fixed;z-index:32;right:16px;top:62px;width:360px;max-height:calc(100% - 78px);overflow:auto;background:#0e1118;border:1px solid var(--k-edge);border-radius:16px;padding:10px;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.k-panel.k-left{left:16px;right:auto}
.k-panel h4{font-size:16px;font-weight:300}
.k-idrow{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;width:100%;text-align:left}
.k-idrow.k-on{background:var(--k-wash2)}
.k-idrow .k-n{font-size:14.5px}
.k-idrow .k-s{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint)}
.k-idrow .k-tagc{font-size:11px;color:var(--k-soft);border:1px solid var(--k-line);border-radius:999px;padding:0 7px;margin-left:4px}
.k-idrow.k-sub{margin-left:26px;width:calc(100% - 26px)}
.k-idline{display:flex;align-items:center;gap:4px}
.k-idline>.k-idrow{flex:1;min-width:0}
.k-more{color:var(--k-soft);width:28px;height:28px;border-radius:8px;display:grid;place-items:center;border:1px solid var(--k-line);flex:none}
.k-sepline{height:1px;background:var(--k-line);margin:6px 4px}
.k-foot-note{font-size:12.5px;color:var(--k-faint);padding:6px 8px}
.k-panel .k-pane-in{padding:4px 6px}

/* the slot: another app's panel, drawn by that app in a frame this app cannot read or change */
.k-frame{position:fixed;z-index:50;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 28px));border-radius:20px;padding:4px;background:repeating-linear-gradient(45deg,var(--k-fc) 0 10px,var(--k-fc2) 10px 20px)}
.k-frame .k-by{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--k-ink);padding:4px 10px 6px;font-weight:400}
.k-frame iframe{display:block;width:100%;height:min(420px,70vh);border:0;border-radius:16px;background:#090c11}
.k-frame.k-kishib{--k-fc:#cfe5f7;--k-fc2:#9fc9ea}
.k-frame.k-damgar{--k-fc:#f2d89c;--k-fc2:#d9b55e}
.k-frame.k-edubba{--k-fc:#a9e3c7;--k-fc2:#76c9a0}
.k-frame.k-ummia{--k-fc:#f7c4b7;--k-fc2:#e99a86}
.k-frame.k-dub{--k-fc:#efe8dc;--k-fc2:#cfc4b0}

/* a disclaimer in one line; the "?" opens the rest */
.k-say{font-size:12.5px;color:var(--k-faint);margin:6px 0}
.k-say>summary{list-style:none;cursor:pointer;display:inline}
.k-say>summary::-webkit-details-marker{display:none}
.k-help{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;border:1px solid var(--k-edge);color:var(--k-soft);font-size:11px;margin-left:6px;vertical-align:1px}
.k-say[open]>summary .k-help{background:var(--k-wash2);color:var(--k-text)}
.k-say .k-more-text{margin:6px 0 2px;color:var(--k-soft);font-size:13px;max-width:48em}
.k-say .k-more-text p{margin:4px 0}
.k-alarmbox{border:1px solid var(--k-bad);border-radius:12px;padding:10px 12px;margin:8px 0;color:var(--k-text);font-size:14px}

/* notes the app says: done, error */
.k-note{margin:8px 0;padding:8px 12px;border-left:2px solid var(--k-line);font-size:14px;color:var(--k-soft)}
.k-note.k-done{border-left-color:var(--k-p);color:var(--k-text)}
.k-note.k-error{border-left-color:var(--k-bad);color:var(--k-text)}
.k-note ul{margin:4px 0 0;padding-left:1.1em}
.k-note li.k-bad,.k-note li.bad{color:var(--k-bad)}
.k-status{position:fixed;z-index:45;left:50%;top:64px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));max-height:40vh;overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
.k-status:empty{display:none}
.k-status .k-note{margin:0;border-left:0;padding:10px 40px 10px 14px}
.k-status .k-close{position:absolute;right:8px;top:8px}

/* the profile page: light and friendly */
.k-prof{max-width:760px;width:100%;margin:0 auto;flex:1;display:flex;flex-direction:column;min-height:0}
.k-prof .k-hero{display:flex;gap:18px;align-items:center;padding:8px 0 12px;flex-wrap:wrap}
.k-prof .k-hero .k-dot{width:64px;height:64px;font-size:26px;font-weight:300}
.k-prof .k-hero h2{font-size:30px;overflow-wrap:anywhere}
.k-prof .k-own-name{color:var(--k-soft);font-size:14px}

/* lists, words */
.k-list{border-top:1px solid var(--k-line)}
.k-list>div,.k-list>li{display:flex;align-items:center;gap:12px;padding:11px 2px;border-bottom:1px solid var(--k-line);font-size:14.5px;list-style:none}
.k-list .k-r{margin-left:auto;color:var(--k-soft);font-size:13px}
.k-words{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 16px;padding:14px 18px;border:1px solid var(--k-edge);border-radius:14px;font:14.5px ui-monospace,Menlo,monospace;margin:10px 0;background:var(--k-raise)}
.k-words b{display:inline-block;min-width:2em;color:var(--k-faint);font-weight:400}
.k-box{border:1px solid var(--k-line);border-radius:14px;padding:14px 16px;margin:10px 0}
.k-box.k-fill{background:var(--k-wash);border-color:transparent}
.k-facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;font-size:14px;margin:6px 0}
.k-facts dt{color:var(--k-faint)}.k-facts dd{margin:0;color:var(--k-soft);overflow-wrap:anywhere}

/* phone: one column; the column becomes the first screen and folds away once a part is chosen */
@media (max-width:600px){
  .k-top{height:52px;padding:0 10px;gap:8px}
  .k-app .k-nm,.k-hide-phone{display:none!important}
  .k-me{padding:3px;border:0}
  .k-me .k-n,.k-me .k-s{display:none}
  .k-menu-btn .k-l{display:none}
  .k-switch button{padding:4px 11px}
  .k-home{grid-template-columns:1fr;grid-template-rows:repeat(4,1fr);gap:10px;padding:12px}
  .k-tile{padding:16px 18px;border-radius:18px}
  .k-tile .k-ic{width:40px;height:40px;left:18px;top:16px}
  .k-tile h2{font-size:24px}
  .k-tile p{font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .k-tile .k-dm{right:16px;top:18px}
  .k-opened .k-col{width:100%;border-right:0;padding:12px}
  .k-opened .k-pane{display:none;padding:12px}
  .k-opened.k-chosen .k-col{display:none}
  .k-opened.k-chosen .k-pane{display:flex}
  .k-opened.k-chosen .k-back{display:inline-flex}
  .k-pane{padding:12px}
  .k-words{grid-template-columns:repeat(3,1fr);font-size:12.5px;padding:10px 12px;gap:4px 10px}
  .k-panel{left:8px;right:8px;width:auto;top:56px}
  .k-pop:not([data-k-suggest]){left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;max-width:none;width:auto;min-width:0;border-radius:16px}
  .k-modal{padding:12px;width:calc(100% - 16px);max-height:calc(100% - 24px)}
  .k-act .k-when{float:none;display:block;margin:0 0 2px}
  .k-feed{padding:4px 10px}
}
`;

// ../kit/src/html.ts
var e = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function top(o) {
  return `<header class="k-top">${o.left}<span class="k-grow"></span>${o.center ?? ""}<span class="k-grow"></span>${o.right}</header>`;
}
function appMark(name, icon) {
  return `<div class="k-app">${icon ? `<img src="${e(icon)}" alt="">` : ""}<span class="k-nm">${e(name)}</span></div>`;
}
var danger = (l) => `<span class="k-dm k-l${l}" title="danger ${l} of 3" aria-label="danger ${l} of 3"><i></i><i></i><i></i></span>`;
function tiles(ts) {
  return `<div class="k-home">${ts.map((t) => `<button type="button" class="k-tile k-d${t.danger}${t.alert ? " k-alarm" : ""}" data-k-tile="${e(t.key)}">${ICONS[t.icon]}${danger(t.danger)}<h2>${e(t.name)}</h2><p>${e(t.say)}</p>${t.alert ? `<span class="k-alert">${e(t.alert)}</span>` : ""}</button>`).join("")}</div>`;
}
function opened(column, on, pane) {
  const col = column.map((c) => c === "-" ? '<div class="k-sep"></div>' : typeof c === "string" ? `<h3>${e(c)}</h3>` : `<button type="button" data-k-col="${e(c.key)}" class="${c.key === on ? "k-on" : ""}">${e(c.label)}${c.k != null ? `<span class="k-k">${e(c.k)}</span>` : ""}</button>`).join("");
  return `<div class="k-body k-opened${on ? " k-chosen" : ""}"><aside class="k-col">${col}</aside><section class="k-pane"><button type="button" class="k-back" data-k-back="column">\u2190 Back</button>${pane}</section></div>`;
}
function say(line, more) {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join("") : more;
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span></summary><div class="k-more-text">${rest}</div></details>`;
}
var note = (kind, html) => `<div class="k-note${kind ? ` k-${kind}` : ""}" role="status">${html}</div>`;
var SVG = (d) => `<svg class="k-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
var ICONS = {
  identities: SVG('<circle cx="24" cy="17" r="8"/><path d="M9 41c2-9 8-13 15-13s13 4 15 13"/>'),
  runner: SVG('<rect x="7" y="13" width="20" height="22" rx="4"/><path d="M27 20h6a6 6 0 0 1 0 12h-6M33 26h8M14 22h6M14 27h6"/>'),
  paper: SVG('<path d="M13 6h16l8 8v28H13z"/><path d="M29 6v8h8M18 22h14M18 28h14M18 34h9"/>'),
  collectives: SVG('<circle cx="16" cy="18" r="5.5"/><circle cx="32" cy="18" r="5.5"/><circle cx="24" cy="12" r="5"/><path d="M6 38c1-7 5-10 10-10s7 2 8 5c1-3 3-5 8-5s9 3 10 10"/>'),
  waiting: SVG('<path d="M14 6h20M14 42h20M16 6c0 10 16 12 16 18S16 32 16 42M32 6c0 10-16 12-16 18s16 8 16 18"/>'),
  account: SVG('<rect x="8" y="9" width="32" height="30" rx="4"/><path d="M8 17h32M15 25h8M15 31h12M31 25h3M31 31h3"/>'),
  lanes: SVG('<path d="M14 42 19 6M34 42 29 6M24 10v4M24 21v5M24 33v6"/>'),
  settings: SVG('<path d="M10 14h28M10 24h28M10 34h28"/><circle cx="18" cy="14" r="3.5"/><circle cx="31" cy="24" r="3.5"/><circle cx="22" cy="34" r="3.5"/>'),
  agents: SVG('<rect x="10" y="12" width="28" height="24" rx="7"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M24 6v6M6 22v6M42 22v6"/>'),
  publishing: SVG('<path d="M8 30v8h32v-8M24 30V8M15 17l9-9 9 9"/>'),
  vows: SVG('<circle cx="24" cy="22" r="12"/><path d="M18 22l4 4 8-8M17 33l-3 9 10-5 10 5-3-9"/>'),
  look: SVG('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/>'),
  discuss: SVG('<path d="M6 10h24v16H16l-6 6v-6H6z"/><path d="M34 18h8v16h-4v6l-6-6H22v-4"/>'),
  publish: SVG('<path d="M10 40h28M24 32V8M15 17l9-9 9 9"/>'),
  choose: SVG('<path d="M8 12l3 3 6-6M8 24l3 3 6-6M8 36l3 3 6-6M22 12h18M22 24h18M22 36h18"/>')
};

// src/page/view.ts
var NAME = "Naki\u0161ib";
var STONE = { colour: "#b9b2a5", pastel: "#ddd8ce", wash: "rgba(221,216,206,.06)", wash2: "rgba(221,216,206,.13)" };
var NEVER = "This Mac should never connect again.";
var NEVER_MORE = [
  "Naki\u0161ib opens no connection: not to a home, a relay, a font or an update. Its page is served on this Mac alone (127.0.0.1).",
  "Keep Wi-Fi off and Bluetooth off, and plug in nothing but the USB stick that carries files between this Mac and Ki\u0161ib.",
  "It keeps nothing secret: a paper\u2019s words are typed for one use and overwritten once used. It keeps only its memory of what it signed, so it never signs two different changes for one key. A stolen Mac gives nothing.",
  "Test identities only, until the step 17 rehearsal."
];
var STYLE = `${KIT_STYLE}
.k-nakisib{--k-c:${STONE.colour};--k-p:${STONE.pastel};--k-wash:${STONE.wash};--k-wash2:${STONE.wash2}}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.nk-never{flex:none;margin:0;padding:8px 20px;border-bottom:1px solid var(--k-line);font-size:14px;color:var(--k-text)}
.nk-never strong{font-weight:400;color:var(--k-p);letter-spacing:.01em}
.nk-holds{white-space:nowrap;padding:4px 14px;border:1px solid var(--k-line);border-radius:999px;font-size:13px;color:var(--k-soft)}
.nk-steps{display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--k-faint);margin:2px 0 10px}
.nk-steps .nk-done{color:var(--k-soft)}.nk-steps .nk-now{color:var(--k-text)}
.nk-loud{border:1px solid var(--k-p);border-radius:14px;padding:12px 16px;margin:10px 0}
.nk-loud h3{margin:0 0 6px;font-size:13px;letter-spacing:.08em;color:var(--k-p);font-weight:400}
.nk-loud p{margin:4px 0;color:var(--k-text)}
.nk-plain p{margin:3px 0}
.nk-apart{border-left:2px dashed var(--k-edge);padding:4px 12px;margin:10px 0}
.nk-id{font:12.5px ui-monospace,Menlo,monospace;color:var(--k-id);word-break:break-all}
.nk-typed{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.nk-sign input{max-width:12em;font:15px ui-monospace,Menlo,monospace;letter-spacing:.1em}
.nk-pane{padding:20px 28px;overflow:auto;max-width:860px}
.nk-list{list-style:none;padding:0;margin:0}
.nk-list li{border:1px solid var(--k-line);border-radius:14px;padding:10px 14px;margin:8px 0}
.k-home.nk-three>.k-tile:last-child{grid-column:1 / -1}
.nk-homefoot{flex:none;padding:0 28px 10px}
.nk-foot{flex:none;display:flex;gap:10px;align-items:center;padding:8px 20px;border-top:1px solid var(--k-line)}
@media (max-width:700px){.k-home.nk-three>.k-tile:last-child{grid-column:auto}.nk-typed{grid-template-columns:1fr}.nk-pane{padding:14px}}
`;
var p = (t, cls = "") => `<p${cls ? ` class="${cls}"` : ""}>${e(t)}</p>`;
var btn = (action, label, primary = false, extra = "") => `<button type="button" class="k-btn${primary ? " k-p" : ""}" data-action="${action}"${extra}>${e(label)}</button>`;
var ROTATION_STEPS = ["Read", "Its summary", "Your paper", "The new paper", "SIGN", "Write"];
var FIRST_STEPS = ["The paper", "Three asked back", "The commitment"];
function steps(all, at) {
  return `<div class="nk-steps" aria-label="Steps">${all.map((s, i) => `<span class="${i < at ? "nk-done" : i === at ? "nk-now" : ""}">${i < at ? "\u2713 " : ""}${e(s)}</span>${i < all.length - 1 ? "<span>\u203A</span>" : ""}`).join("")}</div>`;
}
function summary(s, id = "summary") {
  return `<div id="${id}">${s.prominent.length ? `<div class="nk-loud"><h3>CONSEQUENTIAL \u2014 READ BEFORE SIGNING</h3>${s.prominent.map((t) => p(t)).join("")}</div>` : ""}
<div class="nk-plain">${s.plain.map((t) => p(t)).join("")}</div>
${s.notChecked.length ? `<div class="k-box"><h3>Naki\u0161ib did NOT check</h3>${s.notChecked.map((t) => p(t, "k-small k-soft")).join("")}</div>` : ""}
${s.context.length ? `<div class="nk-apart"><p class="k-small k-faint">Ki\u0161ib\u2019s own words, NOT checked, never trusted:</p>${s.context.map((t) => p(t, "k-small k-soft")).join("")}</div>` : ""}</div>`;
}
function topBar() {
  return top({ left: `<button type="button" class="k-btn k-q" data-action="home" title="The first screen">${appMark(NAME, "icon.png")}</button>`, right: '<span class="nk-holds">Offline \xB7 keeps nothing secret</span>' });
}
var NEVER_LINE = `<div class="nk-never" role="note"><strong>${e(NEVER)}</strong></div>`;
var FOOT = `<div class="nk-foot"><span class="k-small k-faint k-grow">Closing Naki\u0161ib forgets everything it holds now.</span>${btn("forget", "Forget")}${btn("quit", "Quit Naki\u0161ib")}</div>`;
function home() {
  return `${topBar()}${NEVER_LINE}<div class="k-body k-col-flex">${tiles([
    { key: "rotation", name: "Change keys", say: "Read a request from Ki\u0161ib: your paper, a new paper, SIGN.", icon: "paper", danger: 3 },
    { key: "first", name: "A new identity", say: "Its first paper, and the commitment Ki\u0161ib makes the identity from.", icon: "identities", danger: 3 },
    { key: "signed", name: "What it signed", say: "Its memory: each change it signed. Nothing secret in it.", icon: "choose", danger: 1 }
  ]).replace('class="k-home"', 'class="k-home nk-three"')}</div><div class="nk-homefoot">${say("What \u201Cnever connect\u201D means, and what Naki\u0161ib keeps", NEVER_MORE)}</div>${FOOT}`;
}
var COLUMN = ["Naki\u0161ib", { key: "rotation", label: "Change keys" }, { key: "first", label: "A new identity" }, { key: "signed", label: "What it signed" }];
function frame(on, pane) {
  return `${topBar()}${NEVER_LINE}${opened(COLUMN, on, `<div class="nk-pane" id="pane">${pane}</div>`)}${FOOT}`;
}
function fileRow(action, label, typed) {
  return `<div class="k-row">${btn(action, label, true)}</div>${typed ? `<form data-path="${action}" autocomplete="off"><label>Or type the file\u2019s path</label><div class="k-row"><input name="path" spellcheck="false" autocomplete="off"><button type="submit" class="k-btn">${e(label.replace("\u2026", ""))}</button></div></form>` : ""}`;
}
function rotationStart(typed) {
  return `${steps(ROTATION_STEPS, 0)}<h2>Read a request from Ki\u0161ib</h2>
${p("Ki\u0161ib wrote it to the USB stick (Change keys with Naki\u0161ib, \u201CWrite the request for Naki\u0161ib\u201D). Naki\u0161ib believes none of it: it reads the exact bytes itself, and shows what they really say.", "k-soft")}
${fileRow("read", "Choose the file\u2026", typed)}`;
}
function preview(s) {
  const v = s.preview;
  const already = v.already === "same" ? note("done", `Naki\u0161ib signed this same request before. It answers with the same signed bytes, without your paper: ${btn("same", "Answer it again: the same bytes", true)}`) : v.already === "other" ? note("error", `This chain key already signed a different change of keys (${e(v.otherAct ?? "")}). Naki\u0161ib signs no other with it, and will refuse once your paper is typed. If you did not make that change, someone holds your paper: use Ki\u0161ib\u2019s \u201CEscape a contested position\u201D.`) : "";
  return `${steps(ROTATION_STEPS, 1)}<h2>What these bytes say</h2>
${p(`Naki\u0161ib\u2019s own reading of the request, before any paper: identity ${v.identity}, the change of its keys at position ${v.position}, signed with its chain key number ${v.index}.`, "k-small k-soft")}
${already}${summary(v.summary, "preview")}
${v.already === "same" ? "" : paperForm()}`;
}
function paperForm() {
  return `<form id="paper" class="k-box k-fill" autocomplete="off"><h3>Your paper</h3>${p("The chain key\u2019s paper this identity uses now: its 24 words, or the 72 characters of a hex paper. Naki\u0161ib uses it for this request only and overwrites it once signed; the Module checks again everything above with it.", "k-small k-soft")}
<label>The paper</label><textarea name="words" rows="4" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Use this paper</button><span class="k-small k-faint">Nothing is signed yet.</span></div></form>`;
}
function reviewed(s) {
  return `${steps(ROTATION_STEPS, 3)}<h2>The paper is the right one</h2>
${note("done", "It gives the chain key this request is signed with. The Module has checked the request again with it, and built the change of keys it will sign.")}
${p("Next, a new paper: the next change of keys needs it. It is drawn now on this Mac, shown once, then hidden; three of its parts are asked back. Nothing is signed before.", "k-soft")}
<div class="k-row">${btn("show", "Show the new paper", true)}</div>`;
}
function shown(w, first) {
  const hex = w.module === "hex";
  return `${first ? steps(FIRST_STEPS, 0) : steps(ROTATION_STEPS, 3)}<h2>${first ? "The first paper of a new identity" : "The new paper"}</h2>${w.say.map((t) => p(t, "k-small k-soft")).join("")}
<div class="k-words" id="words">${w.parts.map((x, i) => `<span><b>${hex ? i * 4 + 1 : i + 1}.</b>${e(x)}</span>`).join("")}</div>
${hex ? p("Each group is four characters; the numbers are each group\u2019s first character.", "k-small k-faint") : ""}
<div class="k-row">${btn("hide", "I have written it down", true)}</div>`;
}
function askBack(asked, first, hex) {
  const what = hex ? "Group" : "Word";
  return `${first ? steps(FIRST_STEPS, 1) : steps(ROTATION_STEPS, 3)}<h2>Three parts, from your paper</h2>${p(`The paper is hidden. Type the ${hex ? "groups" : "words"} asked, from what you wrote.`, "k-small k-soft")}
<form id="typed" autocomplete="off"><div class="nk-typed">${asked.map((n) => `<label>${what} ${n}<input name="t${n}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></label>`).join("")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Check</button>${btn("show", "Show it again")}</div></form>`;
}
function signScreen(s) {
  return `${steps(ROTATION_STEPS, 4)}<h2>${s.repeat ? "Signed before: the same bytes" : "Sign this change of keys"}</h2>
${s.repeat ? note("done", "ALREADY SIGNED: Naki\u0161ib answers with the same signed bytes; it signs nothing new.") : note("done", "The new paper is written: three of its parts matched. Below, the Module\u2019s own summary of the exact bytes it will sign.")}
${summary(s.summary, "module-summary")}
<form id="sign" class="nk-sign" autocomplete="off"><label>Type SIGN to sign exactly this</label><div class="k-row"><input name="word" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="submit" class="k-btn k-p">Sign</button>${btn("forget", "Cancel, and forget both papers")}</div></form>`;
}
function signed(s, typed) {
  const w = s.written ?? [];
  return `${steps(ROTATION_STEPS, w.length ? 6 : 5)}<h2>${w.length ? "Written" : "Signed"}</h2>
${note("done", `The change of keys is signed (act <span class="nk-id">${e(s.act ?? "")}</span>). Both papers\u2019 words are forgotten here; Naki\u0161ib\u2019s memory holds what it signed, nothing secret.`)}
${w.length ? `${p(`Written to ${w.join(", ")}.`)}${p("Carry the stick to Ki\u0161ib: \u201CRead Naki\u0161ib\u2019s answer\u201D. Ki\u0161ib checks it is the change it asked for, then sends it to every home. Keep the new paper apart from every device: the next change of keys needs it.", "k-soft")}` : p("Write the signed change of keys to the USB stick, for Ki\u0161ib.", "k-soft")}
${fileRow("write", w.length ? "Write it again elsewhere\u2026" : "Choose where to write it\u2026", typed)}
${w.length ? `<div class="k-row">${btn("forget", "Done", true)}</div>` : ""}`;
}
function firstStart() {
  return `${steps(FIRST_STEPS, 0)}<h2>A new identity\u2019s first paper</h2>
${p("For an identity Ki\u0161ib makes (\u201CMake an identity with Naki\u0161ib\u201D): Naki\u0161ib draws the paper here, shows it once, asks three parts back, then writes only its commitment for Ki\u0161ib. The paper never leaves this Mac, and Naki\u0161ib forgets it.", "k-soft")}
<div class="k-row">${btn("first", "Draw a paper of 24 words", true, ' data-module="words"')}${btn("first", "Draw a hex paper (72 characters)", false, ' data-module="hex"')}</div>`;
}
function firstReady(s, typed) {
  const w = s.written ?? [];
  return `${steps(FIRST_STEPS, 2)}<h2>${w.length ? "The commitment is written" : "The paper is written"}</h2>
${note("done", "Three parts matched. Naki\u0161ib has forgotten the paper; only its commitment is left, which is not secret.")}
${p("Its commitment, for Ki\u0161ib to make the identity from (compare it on Ki\u0161ib\u2019s screen):", "k-small k-soft")}<p class="nk-id" id="commit">${e(s.commit ?? "")}</p>
${w.length ? p(`Written to ${w.join(", ")}. In Ki\u0161ib: Identities, \u201CMake an identity with Naki\u0161ib\u201D, read this file.`, "k-soft") : ""}
${fileRow("write", w.length ? "Write it again elsewhere\u2026" : "Choose where to write the commitment\u2026", typed)}
${w.length ? `<div class="k-row">${btn("forget", "Done", true)}</div>` : ""}`;
}
function signedList(list, typed) {
  return `<h2>What it signed</h2>${p("Naki\u0161ib\u2019s memory, from its folder: each change of keys it signed, by chain key. Nothing secret is in it. Asked again for the same request, it gives the same bytes; asked for a different change with the same key, it refuses.", "k-small k-soft")}
${list.length ? `<ul class="nk-list" id="signed-list">${list.map((x) => `<li><p>Identity <span class="nk-id">${e(x.identity ?? "?")}</span>, position ${e(x.position ?? "?")}${x.homeless ? " (homeless)" : ""}</p><p class="k-small k-soft">Act <span class="nk-id">${e(x.act)}</span> \xB7 chain key ${e(x.key)}\u2026</p><div class="k-row">${btn("again", "Write it again\u2026", false, ` data-act="${e(x.act)}"`)}</div></li>`).join("")}</ul>${typed ? `<form data-path="again" autocomplete="off"><label>Path to write to (Write it again)</label><input name="path" spellcheck="false" autocomplete="off"></form>` : ""}` : p("Nothing yet.", "k-faint")}`;
}
function error(t) {
  return note("error", e(t));
}

// ../kit/src/dom.ts
function attachColumn(root, chose) {
  root.addEventListener("click", (ev) => {
    const t = ev.target;
    const c = t.closest("[data-k-col]");
    const opened2 = t.closest(".k-opened");
    if (c && opened2) {
      opened2.querySelectorAll("[data-k-col]").forEach((x) => x.classList.toggle("k-on", x === c));
      opened2.classList.add("k-chosen");
      chose(c.dataset.kCol);
      return;
    }
    if (t.closest('[data-k-back="column"]') && opened2) opened2.classList.remove("k-chosen");
  });
}

// src/page/app.ts
var app = document.getElementById("app");
var view = "home";
var typedPaths = false;
var shownWords = null;
var message = "";
async function ask(op, body = {}) {
  const r = await fetch(`/api/${op}`, { method: "POST", headers: { "x-nakisib": "1", "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "refused");
  return j;
}
async function draw() {
  const s = await ask("state");
  if (view === "home") {
    app.innerHTML = home();
    return;
  }
  let pane = "";
  if (view === "signed") {
    const m = await ask("memory");
    pane = signedList(m.signed, typedPaths);
  } else if (view === "rotation") {
    if (s.kind !== "rotation") pane = rotationStart(typedPaths);
    else if (s.stage === "read") pane = preview(s);
    else if (s.stage === "review") pane = reviewed(s);
    else if (s.stage === "paper" && shownWords) pane = shown(shownWords, false);
    else if (s.stage === "shown") pane = askBack(s.asked ?? [], false, s.preview?.summary ? isHex() : false);
    else if (s.stage === "sign") pane = signScreen(s);
    else if (s.stage === "signed" || s.stage === "written") pane = signed(s, typedPaths);
    else pane = reviewed(s);
  } else {
    if (s.kind !== "first") pane = firstStart();
    else if (s.stage === "paper" && shownWords) pane = shown(shownWords, true);
    else if (s.stage === "shown") pane = askBack(s.asked ?? [], true, s.module === "hex");
    else if (s.stage === "ready" || s.stage === "written") pane = firstReady(s, typedPaths);
    else pane = firstStart();
  }
  app.innerHTML = frame(view, (message ? error(message) : "") + pane);
  message = "";
  attachColumn(app, (key) => go(key));
}
var hexPaper = false;
var isHex = () => hexPaper;
function go(to) {
  view = to;
  void draw();
}
async function act(f) {
  try {
    await f();
  } catch (x) {
    if (x instanceof Error && x.message === "ended") return;
    message = x instanceof Error ? x.message : String(x);
  }
  await draw();
}
async function chosen(forWrite, name) {
  const r = await ask("choose", { for: forWrite ? "write" : "read", name });
  if (!r.dialog) {
    typedPaths = true;
    return null;
  }
  return r.path;
}
async function withFile(action, path, data) {
  if (action === "read") await ask("read", { path });
  else if (action === "write") await ask("write", { path });
  else if (action === "again") {
    const r = await ask("again", { path, act: data.act ?? pendingAct });
    message = "";
    alertDone = `Written again to ${r.written}.`;
  }
}
var pendingAct = "";
var alertDone = "";
app.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-action],[data-k-tile]");
  if (!t) return;
  if (t.dataset.kTile) return go(t.dataset.kTile);
  const a = t.dataset.action;
  void act(async () => {
    switch (a) {
      case "home":
        view = "home";
        return;
      case "forget":
        shownWords = null;
        await ask("forget");
        return;
      case "quit":
        shownWords = null;
        await ask("quit");
        app.innerHTML = '<div class="nk-pane"><h2>Naki\u0161ib has ended</h2><p>It forgot everything it held. Close this window.</p></div>';
        throw new Error("ended");
      case "same":
        await ask("same");
        return;
      case "show": {
        shownWords = await ask("show");
        hexPaper = shownWords.module === "hex";
        return;
      }
      case "hide":
        shownWords = null;
        await ask("hide");
        return;
      case "first":
        await ask("first", { module: t.dataset.module });
        shownWords = await ask("show");
        hexPaper = shownWords.module === "hex";
        return;
      case "read":
      case "write":
      case "again": {
        if (a === "again") pendingAct = t.dataset.act ?? "";
        const name = a === "read" ? "" : view === "first" ? "nakisib-commitment.mor" : "nakisib-answer.mor";
        const p2 = await chosen(a !== "read", name) ?? (typedPaths ? document.querySelector(`form[data-path="${a}"] input[name=path]`)?.value.trim() || null : null);
        if (p2) await withFile(a, p2, t.dataset);
        else if (typedPaths) throw new Error("This Mac shows no file dialog here: type the file\u2019s path in the field below, then press the button again.");
        return;
      }
    }
  }).then(() => {
    if (alertDone) {
      const n = document.getElementById("pane");
      n?.insertAdjacentHTML("afterbegin", `<div class="k-note k-done" role="status">${alertDone}</div>`);
      alertDone = "";
    }
  });
});
app.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const data = new FormData(f);
  const values = [...f.querySelectorAll("input,textarea")].map((i) => {
    const x = i.value;
    i.value = "";
    return [i.name, x];
  });
  void act(async () => {
    if (f.id === "paper") {
      const w = values.find(([n]) => n === "words")?.[1] ?? "";
      hexPaper = w.trim().split(/\s+/).length !== 24;
      await ask("paper", { words: w });
    } else if (f.id === "typed") {
      await ask("typed", { typed: values.map(([, x]) => x) });
    } else if (f.id === "sign") {
      await ask("sign", { word: values[0]?.[1] ?? "" });
    } else if (f.dataset.path) {
      await withFile(f.dataset.path, String(data.get("path") ?? values[0]?.[1] ?? ""), { act: pendingAct });
    }
  }).then(() => {
    if (alertDone) {
      document.getElementById("pane")?.insertAdjacentHTML("afterbegin", `<div class="k-note k-done" role="status">${alertDone}</div>`);
      alertDone = "";
    }
  });
});
void (async () => {
  if (!/Mac/.test(navigator.platform)) typedPaths = true;
  await draw();
})();
