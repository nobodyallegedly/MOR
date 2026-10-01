// A signer for drafts, on the owner's own machine: it holds the owner's keys,
// the connector does not. It is the genesis client's test identity file
// (step 5), so it is for TEST IDENTITIES ONLY, like every key in software in
// this repository; the real identity's everyday key lives on its owner's
// phone (step 16b).
//
// It trusts nothing the connector or Claude said. It decodes the draft
// itself, reads it in plain words from its bytes (fetching the act a
// signature names), shows the plain text with every invisible control as an
// escape (Text rule 5a, Law rule 4a), refuses what it must not sign, and
// signs only on its owner's word. It makes the act as the next in the
// identity's own sequence, saves the identity file, and only then writes the
// signed act out, so no later act can fork from it.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { TestIdentity } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { decodeDraft, draftDigest, readDraft, signedFile, type Draft, type DraftReading } from '../src/draft.ts';

export interface Signed {
  id: string;
  /** Where the signed act was written: the connector picks it up from there. */
  path: string;
}

/**
 * Sign a draft with a test identity. `confirm` is shown the reading and the
 * draft's digest, and says yes or no; nothing is signed on no, or while the
 * reading has any reason not to sign.
 */
export async function signDraft(opts: {
  identity: string;
  draft: string;
  hints: string[];
  via?: Via;
  /** The owner's checkout, to compare a release with before signing it. */
  checkout: string;
  confirm: (r: DraftReading, digest: string, d: Draft) => Promise<boolean>;
}): Promise<Signed> {
  const bytes = new Uint8Array(readFileSync(opts.draft));
  const d = decodeDraft(bytes);
  const digest = draftDigest(bytes);
  const out = signedFile(dirname(opts.draft), digest);
  if (existsSync(out)) throw new Error(`this draft was already signed: ${out}. Nothing was signed again.`);

  const me = TestIdentity.load(opts.identity, opts.via ?? {});
  if (me.id !== d.signer) throw new Error(`the draft is for the identity ${d.signer}; this file holds ${me.id}. Nothing was signed.`);
  if (me.f.pending) throw new Error('a rotation of this identity is waiting to count: resend it first. Nothing was signed.');

  const reading = await readDraft(d, [...new Set([...opts.hints, ...d.relays])], opts.via ?? {}, { checkout: opts.checkout });
  if (reading.blocking.length) throw new Error(`not signed: ${reading.blocking.join(' ')}`);
  if (!(await opts.confirm(reading, digest, d))) throw new Error('not signed: declined.');

  const made = me.sign(d.spec, d.type, d.payload, {
    public: d.public,
    refs: d.refs.length ? d.refs : undefined,
    objects: d.objects.length ? d.objects : undefined,
  });
  me.save(opts.identity);
  writeFileSync(out, made.act);
  return { id: made.id, path: out };
}
