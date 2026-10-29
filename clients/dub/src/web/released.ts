// Dub's web client as released: its built files are kept in `built/`, so the
// release names the exact bytes a server at dub.dubsar.org serves, as the
// display client's are (website cMIP, rule 20; F281: "served as a signed,
// checkable release"). `mor-dub check URL` compares a server with them.

import { fileURLToPath } from 'node:url';

/** The web client's files, in the order they are listed: its page, script, style and core library, then Inter and its licence (`../fonts.ts`), then its icon, as the tab's and as a phone's home screen's (H35). */
export const WEB_FILES = ['index.html', 'dub.js', 'dub.css', 'mor_wasm_bg.wasm', 'atkinson_next.woff2', 'atkinson_next_license.txt', 'atkinson_mono.woff2', 'atkinson_mono_license.txt', 'gentium_book_plus_italic.woff2', 'gentium_book_plus_license.txt', 'icon.png', 'apple-touch-icon.png'] as const;

/** The web client as published in the release. */
export const BUILT = fileURLToPath(new URL('../../built', import.meta.url));
