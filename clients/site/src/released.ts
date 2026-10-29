// The display client as released (website cMIP, rule 20; roadmap step 10a):
// its built files are published in the release, in `built/`, so that the
// release names the exact bytes a gateway serves. A gateway serves them by
// default, and `mor-site check` compares a gateway with them by default.

import { fileURLToPath } from 'node:url';

/**
 * The suite's type (hand test v3, H123: "dubsar.org's display client the
 * same pair"): Atkinson Hyperlegible Next for words, its Mono for IDs,
 * hashes and code, each with its licence (SIL Open Font License 1.1), served
 * by the gateway itself, nothing loaded from elsewhere. Copied from the kit's
 * fonts at each build.
 */
export const FONT_FILES = ['atkinson_next.woff2', 'atkinson_next_license.txt', 'atkinson_mono.woff2', 'atkinson_mono_license.txt'] as const;

/** The display client's files, in the order they are listed. */
export const DISPLAY_FILES = ['index.html', 'gateway.js', 'gateway.css', 'mor_wasm_bg.wasm', ...FONT_FILES] as const;

/** The display client as published in the release. */
export const BUILT = fileURLToPath(new URL('../built', import.meta.url));
