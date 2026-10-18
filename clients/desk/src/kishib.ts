// After Kišib (F335, F337): Edubba takes the new signing key's words Kišib
// showed once, for an identity it holds or for a real collective whose
// signing key it holds. Nothing else of Kišib's work comes here: the chain
// key, the paper shares and the members' new shares never do.
//
// - **An identity** whose signing key was changed in Kišib: its record says
//   "changed elsewhere"; the new words are checked as brought words are (the
//   carry Module, 4.2 and 4.6: they must give its current signing key), then
//   Edubba signs with them in a new line under the new binding, keeping what
//   it held. It renews the encryption key only where Edubba published the
//   last version (2a.4), as Dub does.
// - **A real collective** whose member change waited for Kišib: Edubba reads
//   the collective's chain from its homes and checks that its latest
//   rotation counts, declares the member change waiting here (its clone and
//   the signature acts), and installs the signing key the words give. Then
//   its copy of the collective follows: the members, the agreement in force,
//   the key's dealing, the key Edubba signs with. The change is in force.
//
// TEST IDENTITIES ONLY.

import { cborDecode, describeAct, hex, signingPublic, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { resealMemberKeys } from '../../grants/src/member.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { Refused, encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { carriedKey, lookCurrent, servedChain, NOT_CURRENT } from '../../dub/src/carryin.ts';
import { REPO_SPECS, FOUNDING_AGREEMENT } from '../../repo/src/specs.ts';
import type { Line } from '../../collective/src/explain.ts';
import type { Desk, Done } from './desk.ts';
import type { Real } from './real.ts';
import type { Store } from './store.ts';

const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');

/** Said where Edubba's signing key for an identity no longer counts: where the new words go. */
export const RENEW_SAY =
  'Its signing key was changed elsewhere (in Kišib, with the chain key’s words). Edubba signs nothing more with the old one. Give the new signing key’s words, as Kišib showed them once, to go on here.';

/** Said under a member change that waits for Kišib: where the collective's new words go once it counts. */
export const COLLECTIVE_RENEW_SAY =
  'When Kišib’s rotation counts, it shows the collective’s new signing key’s words once, for the member who holds that key (here). Give them below: Edubba then follows the change, and signs for the collective with the new key.';

function seedOf(words: string): Uint8Array {
  try {
    return fromWords(words);
  } catch (e) {
    if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
    throw e;
  }
}

export class AfterKishib {
  constructor(
    readonly desk: Desk,
    readonly store: Store,
    readonly real: Real,
  ) {}

  private get via() {
    return this.store.settings().via;
  }

  private hints(extra: string[] = []): string[] {
    const s = this.store.settings();
    return [...new Set([...extra, ...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  /** An identity held here takes its new signing key's words (the carry Module, 4.6). */
  renewIdentity(id: string, words: string): Promise<Done> {
    return this.desk.serial(async () => {
      const me = this.store.identity(id);
      const seed = seedOf(words);
      if (hex(seed) === me.f.signingSecret) throw new Error('These are the signing key’s words Edubba already holds, and they still count: nothing to change.');
      const look = await lookCurrent(id, seed, this.hints(me.f.homes.map((h) => h.hint)), this.via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      me.f.chain = (await servedChain(id, r.homes, this.via)).map(b64);
      me.f.position = binding.position;
      me.f.binding = binding.act;
      me.f.signingSecret = hex(seed);
      me.f.homes = r.homes;
      me.f.rule = r.rule ?? null;
      me.f.pending = null;
      // A new line under the new binding (the carry Module, 4.3): the old line ended with the old key.
      me.f.sequence = [];
      me.f.routes = me.f.routes && look.routes.act === me.f.routes.act ? me.f.routes : null;
      const lines: Line[] = [{ text: 'The new words give its current signing key. Edubba signs with them from now on, in a new line.', tone: 'ok' }];
      const carried = carriedKey(look, seed);
      const last = me.f.encryption.at(-1);
      if (carried) {
        if (!me.f.encryption.some((e) => e.act === carried.act)) me.f.encryption.push(carried);
        this.store.saveIdentity(me);
        lines.push({ text: 'Its encryption key is the one the new words carry.', tone: 'ok' });
      } else if (last && look.encryptionKeyAct === last.act) {
        this.store.saveIdentity(me);
        await me.publishEncryptionKey(encryptionSecret(seed));
        // F353: the member keys sealed to this identity, sealed again to its new encryption key (the member keys cMIP, 4.1).
        const resealed = await resealMemberKeys(me.id, me.f.encryption.slice(0, -1).map((e) => unhex(e.secret)), xwingPublic(encryptionSecret(seed)), me.f.homes.map((h) => h.hint), me.via).catch(() => 0);
        if (resealed) lines.push({ text: `Its ${resealed} member key${resealed === 1 ? '' : 's'} for collectives, sealed to it, sealed again to the new encryption key: unchanged, so its apps still act with them (F353).`, tone: 'ok' });
        this.store.saveIdentity(me);
        lines.push({ text: 'Its encryption key was renewed from the new words (Edubba published the last one): messages sealed from now on open only with them.', tone: 'ok' });
      } else {
        this.store.saveIdentity(me);
        lines.push({ text: 'Its encryption key is not one Edubba holds: its private messages cannot be opened here.', tone: 'warn' });
      }
      return { title: 'The new signing key is taken', lines, acts: [] };
    });
  }

  /** A real collective takes its new signing key's words, once Kišib's rotation completing a member change counts. */
  renewCollective(collective: string, words: string): Promise<Done> {
    return this.desk.serial(async () => {
      const c = this.real.collective(collective);
      const seed = seedOf(words);
      const look = await lookUp(collective, this.hints([...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)]), this.via);
      const r = look.resolution;
      if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing can be taken until they agree.');
      if (r.stop === 'pending' || r.waiting.length) throw new Error('Kišib’s rotation waits for its homes: give the words once it counts.');
      const latest = r.links[r.links.length - 1];
      if (latest.act === c.f.identity.binding || latest.position <= c.f.identity.position) throw new Error('The collective’s keys have not changed since Edubba’s copy: the rotation was not made, or does not count yet.');
      if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(seed))) throw new Error(NOT_CURRENT);
      // What the rotation declares: the member change waiting here.
      const bytes = (await servedChain(collective, r.homes, this.via)).find((b) => (describeAct(b) as { id: string }).id === latest.act);
      if (!bytes) throw new Error('Its latest rotation was not served by its homes.');
      const payload = cborDecode((describeAct(bytes) as { payload: Uint8Array }).payload) as Map<number, unknown>;
      let clone: string | null = null;
      for (const x of (payload.get(8) as unknown[][] | undefined) ?? []) {
        if (hex(x[0] as Uint8Array) === REPO_SPECS.agreements && Number(x[1]) === FOUNDING_AGREEMENT && Array.isArray(x[2])) clone = hex((x[2] as unknown[])[0] as Uint8Array);
      }
      const p = clone ? this.real.proposals().find((x) => x.act === clone && x.kind === 'clone' && x.collective === collective) : undefined;
      if (!clone || !p) throw new Error('Its latest rotation does not declare a member change proposed here: Edubba cannot tell what it changed. Nothing was kept.');
      const chain = await servedChain(collective, r.homes, this.via);
      const f = c.f.identity;
      f.chain = chain.map(b64);
      f.position = latest.position;
      f.binding = latest.act;
      f.signingSecret = hex(seed);
      f.homes = r.homes;
      f.rule = r.rule ?? null;
      f.pending = null;
      f.sequence = [];
      // A rotation is a decision: the collective's next actions cite it (F127).
      if (f.cites) f.cites = [latest.act];
      const governance = p.governance ?? c.f.governance;
      c.f.safety = { scheme: r.chainKeyScheme ?? c.f.safety.scheme, index: latest.position, threshold: governance.safetyThreshold, commit: r.chainKeyCommit ?? '', fingerprint: '', shares: [] };
      c.f.agreement = clone;
      c.f.agreements.push(clone);
      c.f.members = p.members;
      c.f.governance = governance;
      c.f.signingHolder = p.holder ?? c.f.signingHolder;
      c.f.pending = null;
      this.real.afterRotation(c, p.act, latest.act);
      const names = this.real.names();
      return {
        title: 'The member change is in force',
        lines: [
          { text: `Kišib’s rotation ${short(latest.act)} counts, declaring the change ${short(clone)}.`, tone: 'ok' },
          { text: `Its members now: ${p.members.map(names).join(', ')}. Its chain key: one share per member, on paper, any ${governance.safetyThreshold} rebuilding it (the new dealing’s fingerprint was shown in Kišib and in each member’s Dub).` },
          { text: 'Edubba signs for the collective with the new key, in a new line.', tone: 'ok' },
        ],
        acts: [],
      };
    });
  }
}
