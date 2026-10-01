// The core library in the gateway's display client: the same WebAssembly as
// every other client (crate `mor-wasm`), fetched from the gateway's own
// folder, `/_mor/`, whatever the address of the page, and started before
// anything else runs. The build puts this file in place of
// `clients/genesis/src/core.ts`; the helpers are the web reader's.

import init from '../../../genesis/wasm/mor_wasm.js';

await init({ module_or_path: new URL('/_mor/mor_wasm_bg.wasm', location.origin) });

export * from '../../../genesis/wasm/mor_wasm.js';
export * from '../../../reader/src/web/common.ts';
