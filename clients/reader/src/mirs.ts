// The six MIRs this reader ships, and their spec hashes, recomputed from the
// texts (Development draft 10, rule 26; F324; the freeze suite v28, step
// 8.1). The root of trust is the six texts, not a list of hashes: the reader
// carries the texts as files beside its page (its build copies them from
// `spec/`, canonical text, no final line break), fetches them from its own
// folder, and computes each hash with the core library, `tagged_hash(
// "MOR/spec", {0: 4, 9: text})`. Two readers built by two people from the same
// texts show the same six hashes; two that differ, differ about a text.
//
// Until the freeze the texts are the current drafts, and the hashes the
// reader judges with are still the test values every client and relay
// shares (`clients/genesis/src/core.ts`, MIRS): the six shown are what the
// drafts would hash to, said as such, not yet the ones in use.

import { mirHash } from '../../genesis/src/core.ts';

/** The six, in the MICS's order, with the file each is shipped as. */
export const MIR_TEXTS = [
  { layer: 'Identity', file: 'MIR-identity-draft-13.md' },
  { layer: 'Envelopes', file: 'MIR-envelopes-draft-10.md' },
  { layer: 'Text', file: 'MIR-text-draft-8.md' },
  { layer: 'Money', file: 'MIR-money-draft-8.md' },
  { layer: 'Agreements', file: 'MIR-agreements-draft-14.md' },
  { layer: 'Development', file: 'MIR-development-draft-10.md' },
] as const;

export interface Recomputed {
  layer: string;
  file: string;
  /** The spec hash recomputed from the text, or null where it could not be. */
  hash: string | null;
  /** Why not, where it could not be. */
  problem: string | null;
}

/** The six hashes recomputed from the texts `read` gives (a fetch in the browser, the files in a test). */
export async function recompute(read: (file: string) => Promise<string>): Promise<Recomputed[]> {
  return Promise.all(
    MIR_TEXTS.map(async ({ layer, file }) => {
      try {
        return { layer, file, hash: mirHash(await read(file)) as string, problem: null };
      } catch (err) {
        return { layer, file, hash: null, problem: err instanceof Error ? err.message : String(err) };
      }
    }),
  );
}
