// The author's identity as step 17 makes it, rehearsed with a test identity:
// its chain key made and kept only by the air-gapped chain key Module's own
// signer (`mor-signer`, modules/airgap), its seed written as 24 words (the
// words seed Module); the genesis built from the signer's commitment export,
// and a rotation signed by a second signer restored from those words alone,
// as after the loss of the first device.
//
// The genesis client cannot yet do the online side by itself (roadmap step
// 16b): `online_side` (modules/airgap/examples/online_side.rs) calls the
// Module's own `online` functions for it. The client keeps the signing key
// and sends and settles as it does for any identity; it never holds the
// chain key (its file's `safety.seeds` stays empty).

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SPECS,
  actId,
  base64,
  hex,
  makeGenesis,
  makeRotation,
  newSigningSecret,
  newTestChainKey,
  signingPublic,
  unhex,
} from '../../clients/genesis/src/core.ts';
import { TEST_LABEL, TestIdentity, type Home } from '../../clients/genesis/src/identity.ts';

export interface Tools {
  /** target/debug/mor-signer */
  signer: string;
  /** target/debug/examples/online_side */
  online: string;
  /** A folder of this run's, removed after it. */
  work: string;
}

const run = (bin: string, args: string[], input = '') => execFileSync(bin, args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });

/** A new seed on a signer: its 24 words, as the signer prints them for paper. */
export function newSeed(t: Tools, device: string): string[] {
  const out = run(t.signer, ['--dir', device, 'new', 'words'], 'WRITTEN\n');
  const words = [...out.matchAll(/^\s*(\d+)\. (\S+)$/gm)].map((m) => m[2]);
  if (words.length !== 24) throw new Error(`the signer showed ${words.length} words, not 24`);
  return words;
}

/** A signer restored from the words alone: a new device, nothing else carried. */
export function restore(t: Tools, device: string, words: string[]): void {
  run(t.signer, ['--dir', device, 'restore', 'words'], words.join(' ') + '\n');
}

/**
 * The author's genesis: the signer exports the commitment to key 0; the
 * online side builds the genesis on it, signed by a signing key made here.
 * Nothing is sent: `publishGenesis` sends it to both homes.
 */
export function authorIdentity(t: Tools, device: string, homes: Home[]): TestIdentity {
  const exported = join(t.work, 'commitment.mor');
  run(t.signer, ['--dir', device, 'export', exported]);
  const signingSecret = newSigningSecret();
  // The template carries the homes; its throwaway chain key is replaced by the export's.
  const throwaway = newTestChainKey(2) as { scheme: number; commit: string };
  const template = makeGenesis({
    identitySpec: SPECS.identity,
    signingSecret,
    chainKeyScheme: throwaway.scheme,
    chainKeyCommit: throwaway.commit,
    homes,
  });
  const tpl = join(t.work, 'genesis-template.act');
  const out = join(t.work, 'genesis.act');
  writeFileSync(tpl, template);
  const id = run(t.online, ['genesis', tpl, exported, hex(signingSecret), out]).trim();
  const genesis = new Uint8Array(readFileSync(out));
  if (actId(genesis) !== id) throw new Error('the genesis is not the one the online side made');
  return new TestIdentity({
    label: TEST_LABEL,
    identity: id,
    position: 0,
    binding: id,
    signingSecret: hex(signingSecret),
    // The chain key is on the signer, never here.
    safety: { scheme: 2, seeds: '' },
    chain: [base64(genesis)],
    homes,
    rule: null,
    clock: null,
    sequence: [],
    routes: null,
    encryption: [],
    pending: null,
  });
}

/**
 * A rotation of the author's identity, signed on `device` (a signer that
 * knows only the seed's words): the client plans it (new signing key, the
 * kept lines), the online side turns it into the Module's pending rotation,
 * the signer reviews and signs it with the committed key and commits the
 * next one itself, the online side checks what came back, and the client
 * sends it to both homes and settles it as any reader would.
 */
export async function rotateOnSigner(t: Tools, device: string, who: TestIdentity): Promise<{ id: string; summary: string; counts: boolean }> {
  const { plan } = await who.planRotation();
  if (plan.warning) throw new Error(`the rotation would leave lines out: ${plan.warning}`);
  const chain = who.chainActs();
  const previous = chain[chain.length - 1];
  const newSigning = newSigningSecret();
  const throwaway = newTestChainKey(2) as { scheme: number; seeds: Uint8Array; commit: string };
  const template = makeRotation({
    identitySpec: SPECS.identity,
    identity: who.id,
    previous: actId(previous),
    position: chain.length,
    chainKeyScheme: throwaway.scheme,
    chainKeySeeds: throwaway.seeds,
    newSigningPublic: signingPublic(newSigning),
    nextChainKeyScheme: throwaway.scheme,
    nextChainKeyCommit: throwaway.commit,
    kept: plan.kept,
  });
  const f = (n: string) => join(t.work, n);
  writeFileSync(f('previous.act'), previous);
  writeFileSync(f('rotation-template.act'), template);
  run(t.online, ['pending', f('previous.act'), f('rotation-template.act'), f('pending.mor')]);
  const summary = run(t.signer, ['--dir', device, 'sign', f('pending.mor'), f('signed.mor')], 'SIGN\n');
  const id = run(t.online, ['accept', f('pending.mor'), f('signed.mor'), f('rotation.act')]).trim();
  const rotation = new Uint8Array(readFileSync(f('rotation.act')));
  who.f.pending = {
    rotation: base64(rotation),
    id,
    signingSecret: hex(newSigning),
    safety: { scheme: 2, seeds: '' },
    homes: who.f.homes,
    rule: who.f.rule,
  };
  const sent = await who.submitRotation();
  const refused = sent.filter((s) => !s.result?.receipt);
  if (refused.length) throw new Error(`a home gave no receipt: ${refused.map((s) => `${s.home} ${s.error ?? ''}`).join('; ')}`);
  const { counts } = await who.settleRotation();
  return { id, summary, counts };
}

export { unhex };
