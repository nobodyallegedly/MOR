// The collective client's program (`clients/collective/src/server.ts`) in
// Edubba's web client: its page operations run only for a test-mode
// collective, which the web client does not offer (`../ops.ts`, WEB_OPS).
// The build puts this file in its place, so no server code reaches the
// browser.

import { ON_A_COMPUTER } from '../ops.ts';

export function collectiveApi(): (op: string, a: Record<string, unknown>) => Promise<unknown> {
  return async () => {
    throw new Error(ON_A_COMPUTER);
  };
}
