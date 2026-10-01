// The display client as released (website cMIP, rule 20; roadmap step 10a):
// its built files are published in the release, in `built/`, so that the
// release names the exact bytes a gateway serves. A gateway serves them by
// default, and `mor-site check` compares a gateway with them by default.

import { fileURLToPath } from 'node:url';

/** The display client's files, in the order they are listed. */
export const DISPLAY_FILES = ['index.html', 'gateway.js', 'gateway.css', 'mor_wasm_bg.wasm'] as const;

/** The display client as published in the release. */
export const BUILT = fileURLToPath(new URL('../built', import.meta.url));
