// Damgar's web client as released: its built files are kept in `built/`, so
// the release names the exact bytes a server serves, as Dub's and Kišib's
// are. `mor-damgar check URL` compares a server with them.

import { fileURLToPath } from 'node:url';

/** The web client's files: its page, script, style and core library, then Inter and its licence, then its icon, as the tab's and as a phone's home screen's (H35). */
export const WEB_FILES = ['index.html', 'damgar.js', 'damgar.css', 'mor_wasm_bg.wasm', 'inter_light.woff2', 'inter_regular.woff2', 'inter_license.txt', 'icon.png', 'apple-touch-icon.png'] as const;

/** The web client as published in the release. */
export const BUILT = fileURLToPath(new URL('../../built', import.meta.url));
