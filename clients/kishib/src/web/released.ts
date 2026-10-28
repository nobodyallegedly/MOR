// Kišib's web client as released: its built files are kept in `built/`, so
// the release names the exact bytes a server at kishib.dubsar.org serves, as
// Dub's are. `mor-kishib check URL` compares a server with them.

import { fileURLToPath } from 'node:url';

/** The web client's files: its page, script, style and core library, Kišib's half of the air-gapped Module (the ways with Nakišib), then the suite's type and its licences (H123), then its icon, as the tab's and as a phone's home screen's (H35). */
export const WEB_FILES = ['index.html', 'kishib.js', 'kishib.css', 'mor_wasm_bg.wasm', 'kishib_airgap_bg.wasm', 'atkinson_next.woff2', 'atkinson_next_license.txt', 'atkinson_mono.woff2', 'atkinson_mono_license.txt', 'gentium_book_plus_italic.woff2', 'gentium_book_plus_license.txt', 'icon.png', 'apple-touch-icon.png'] as const;

/** The web client as published in the release. */
export const BUILT = fileURLToPath(new URL('../../built', import.meta.url));
