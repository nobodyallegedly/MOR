// The core library in a browser: the same WebAssembly as every other client
// (crate `mor-wasm`), fetched beside the page and started before anything
// else runs. The build puts this file in place of
// `clients/genesis/src/core.ts` wherever the shared client code imports it.

import init from '../../../genesis/wasm/mor_wasm.js';

await init({ module_or_path: new URL('mor_wasm_bg.wasm', document.baseURI) });

export * from '../../../genesis/wasm/mor_wasm.js';
export * from './common.ts';
