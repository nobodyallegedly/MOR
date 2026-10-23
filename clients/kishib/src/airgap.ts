// Kišib's half of the air-gapped chain-key signer Module (draft 6), for the
// two ways with Nakišib: the Module's own `online` code (airgap/, built by
// scripts/build-airgap-wasm.sh into airgap/pkg), loaded only when one of
// those ways is used, so that every other path of Kišib, and every app that
// uses Kišib's code, runs without it. In a browser, the web client's build
// puts `web/airgap.ts` in place of this file. Imported by a computed address,
// so that a bundle of Kišib's page (which never calls it) does not look for it.

import { readFileSync } from 'node:fs';

type Airgap = typeof import('../airgap/pkg/kishib_airgap.js');
let loaded: Airgap | null = null;

export async function airgap(): Promise<Airgap> {
  if (!loaded) {
    const glue = new URL('../airgap/pkg/kishib_airgap.js', import.meta.url).href;
    const m = (await import(glue)) as Airgap;
    m.initSync({ module: readFileSync(new URL('../airgap/pkg/kishib_airgap_bg.wasm', import.meta.url)) });
    loaded = m;
  }
  return loaded;
}
