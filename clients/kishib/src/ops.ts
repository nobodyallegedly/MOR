// Kišib's operations, by name, as the page asks for them: the same list for
// the program on the Mac and Linux (`server.ts`, whose requests are signed
// by a paired browser) and for the web client (`web/app.ts`, in the
// browser). Each takes plain values from the page and nothing else.

import type { Kishib } from './kishib.ts';

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);

/** The vault's change, as the rotate form gives it: kept by default. */
function vaultOf(a: Record<string, unknown>): import('./kishib.ts').VaultChange {
  const c = text(a.vault);
  if (c === 'remove') return { change: 'remove' };
  if (c !== 'set') return { change: 'keep' };
  const n = (v: unknown) => Number(text(v) || '0');
  return {
    change: 'set',
    network: Number(text(a.vaultNetwork) || '3'),
    unit: text(a.vaultUnit),
    lightning: text(a.vaultNode) ? { node: text(a.vaultNode), limit: n(a.vaultLightningLimit) } : undefined,
    onchain: text(a.vaultKey) ? { key: text(a.vaultKey), request: text(a.vaultRequest), limit: n(a.vaultOnchainLimit) } : undefined,
  };
}

/** The runner's operations (the Dubsar runner cMIP): the program's only (`server.ts`), never the web client's, which has no runner (decided: never on the web). */
export const RUNNER_OPS = ['runner state', 'runner on', 'runner unlock', 'runner lock', 'quit', 'runner off', 'runner give', 'runner remove', 'runner approve', 'runner revoke', 'runner yes', 'runner opening', 'runner member answer', 'runner member remove', 'runner answer', 'runner cards', 'runner standing'] as const;

/** The names of every operation, so a page and a test can be checked against them. */
export const OPS = [
  'state',
  'forget',
  'check words',
  'record',
  'make plan',
  'check share',
  'rotate plan',
  'nakisib plan',
  'nakisib request',
  'nakisib answer',
  'escape plan',
  'confirm plan',
  'collective start',
  'collective read',
  'collective notices',
  'collective give',
  'confirm',
  'resend',
  'refresh',
  'words show',
  'words written',
  'words typed',
  'collective paper',
  'collective gather',
  'collective rotate',
  'collective share',
  'collective share written',
  'names',
  'contacts',
  'contact add',
  'contact nick',
  'contact remove',
] as const;

export async function run(k: Kishib, op: string, a: Record<string, unknown>): Promise<unknown> {
  // Where names are read (H106): the homes and relays given in a form, kept in memory only.
  k.heard(text(a.address), text(a.homes), text(a.relays));
  switch (op) {
    // Who is known (hand test v3, H96, H100, H106, H109): the kit's names and its one contacts list.
    case 'names':
      return k.names({ ids: list(a.ids), fresh: a.fresh === true, as: text(a.as) || undefined });
    case 'contacts':
      return k.contacts({ as: text(a.as) || undefined, fresh: a.fresh === true });
    case 'contact add':
      return k.contactChange({ op: 'add', id: text(a.id), nick: text(a.nick), as: text(a.as) || undefined });
    case 'contact nick':
      return k.contactChange({ op: 'nick', id: text(a.id), nick: text(a.nick), as: text(a.as) || undefined });
    case 'contact remove':
      return k.contactChange({ op: 'remove', id: text(a.id), as: text(a.as) || undefined });
    case 'state':
      return k.state();
    case 'forget':
      return k.forget();
    case 'check words':
      return k.checkWords({ id: text(a.id), address: text(a.address), words: text(a.words) });
    case 'record':
      return k.record({ id: text(a.id), address: text(a.address) });
    case 'make plan':
      return k.makePlan({ homes: text(a.homes), relays: text(a.relays), commitment: text(a.commitment) });
    case 'check share': {
      const numbers = Array.isArray(a.numbers) ? a.numbers.map(String) : [text(a.number)];
      const words = Array.isArray(a.shares) ? a.shares.map(String) : [text(a.shareWords)];
      return k.checkShare({ collective: text(a.collective), address: text(a.address), papers: numbers.map((n, i) => ({ number: n, words: words[i] ?? '' })) });
    }
    case 'rotate plan':
      return k.rotatePlan({ id: text(a.id), address: text(a.address), words: text(a.words), successor: text(a.successor), endSuccession: a.endSuccession === true, leaveOut: list(a.leaveOut), cards: text(a.cards), vault: vaultOf(a) });
    case 'nakisib plan':
      return k.nakisibPlan({ id: text(a.id), address: text(a.address), successor: text(a.successor), endSuccession: a.endSuccession === true, leaveOut: list(a.leaveOut), cards: text(a.cards), vault: vaultOf(a) });
    case 'nakisib request':
      return k.nakisibRequest();
    case 'nakisib answer':
      return k.nakisibAnswer({ answer: text(a.answer), request: text(a.request), id: text(a.id), address: text(a.address) });
    case 'escape plan':
      return k.escapePlan({ id: text(a.id), address: text(a.address), words: text(a.words), signingWords: text(a.signingWords), homes: text(a.homes), leaveOut: list(a.leaveOut), cards: text(a.cards) });
    case 'confirm plan':
      return k.confirmPlan({ owner: text(a.owner), successor: text(a.successor), address: text(a.address), words: text(a.words) });
    case 'collective start':
      return k.collectiveStart({ collective: text(a.collective), address: text(a.address), founder: text(a.founder), founderWords: text(a.founderWords), number: text(a.number), shareWords: text(a.shareWords), room: a.room === true, leaveOut: list(a.leaveOut) });
    // H97: the rotations waiting for the member, from their inbox (the rotation notice cMIP).
    case 'collective notices':
      return k.collectiveNotices({ member: text(a.member), address: text(a.address), words: text(a.words) });
    case 'collective read':
      return k.collectiveRead({ collective: text(a.collective), fingerprint: text(a.fingerprint), address: text(a.address) });
    case 'collective give':
      return k.collectiveGive({ collective: text(a.collective), fingerprint: text(a.fingerprint), address: text(a.address), member: text(a.member), memberWords: text(a.memberWords), number: text(a.number), shareWords: text(a.shareWords) });
    case 'confirm':
      return k.confirm({ plan: text(a.plan), digest: text(a.digest), warned: typeof a.warned === 'string' ? a.warned : undefined });
    case 'resend':
      return k.resend();
    case 'refresh':
      await k.refresh();
      return k.state();
    case 'words show':
      return k.showWords();
    case 'words written':
      return k.written();
    case 'words typed':
      return k.typed({ typed: list(a.typed) });
    case 'collective paper':
      return k.collectivePaper({ number: text(a.number), words: text(a.words) });
    case 'collective gather':
      return k.collectiveGather();
    case 'collective rotate':
      return k.collectiveRotate();
    case 'collective share':
      return k.collectiveShare({ holder: text(a.holder) });
    case 'collective share written':
      return k.collectiveShareWritten({ holder: text(a.holder) });
    default:
      throw new Error(`unknown operation ${op}`);
  }
}
