// The core library in the gateway's display client: the same WebAssembly as
// every other client (crate `mor-wasm`), fetched from the gateway's own
// folder, `/_mor/`, whatever the address of the page, and started before
// anything else runs. The build puts this file in place of
// `clients/genesis/src/core.ts`; the helpers are the web reader's. If the
// browser blocks WebAssembly, or the library does not start, the bar says so
// (`../shell/cannot.ts`) and nothing else runs.

import init from '../../../genesis/wasm/mor_wasm.js';
import { blocksWasm, cannotCheck, stillLoading } from '../shell/cannot.ts';

const slow = setTimeout(stillLoading, 20_000);
try {
  if (blocksWasm()) throw new Error('WebAssembly is turned off in this browser');
  await init({ module_or_path: new URL('/_mor/mor_wasm_bg.wasm', location.origin) });
} catch (err) {
  cannotCheck(err);
  throw err;
} finally {
  clearTimeout(slow);
}

export * from '../../../genesis/wasm/mor_wasm.js';
export * from '../../../reader/src/web/common.ts';
