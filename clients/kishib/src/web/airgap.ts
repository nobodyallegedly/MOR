// Kišib's half of the air-gapped chain-key signer Module in a browser: its
// WebAssembly fetched beside the page, once, when a way with Nakišib is
// first used. The build puts this file in place of `../airgap.ts`.

import init, * as m from '../../airgap/pkg/kishib_airgap.js';

let started: Promise<unknown> | null = null;

export async function airgap(): Promise<typeof m> {
  started ??= init({ module_or_path: new URL('kishib_airgap_bg.wasm', document.baseURI) });
  await started;
  return m;
}
