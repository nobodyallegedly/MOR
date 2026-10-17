// Damgar's operations, by name, as the page asks for them: the same list
// for the program (`server.ts`, whose requests are signed by a paired
// browser) and the web client (`web/app.ts`). Each takes plain values from
// the page and nothing else.

import type { Damgar } from './damgar.ts';

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : []);

export const OPS = [
  'state',
  'bring',
  'renew',
  'use',
  'leave',
  'forget',
  'carry',
  'check',
  'accept',
  'publish list',
  'look',
  'to sign',
  'sign draft',
  'decline',
  'accept debt',
  'pay request',
  'answer invoice',
  'refuse invoice',
  'pay',
  'paid',
  'recheck',
  'sign receipt',
  'account',
  'rails',
  'rails review',
  'rails publish',
  'relays',
] as const;

export async function run(d: Damgar, op: string, a: Record<string, unknown>): Promise<unknown> {
  switch (op) {
    case 'state':
      return d.state();
    case 'bring':
      return d.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list(a.relays) });
    case 'renew':
      return d.renew(text(a.words));
    case 'use':
      return d.use(text(a.id));
    case 'leave':
      return d.leave();
    case 'forget':
      return d.forget(text(a.id));
    case 'carry':
      return d.carry();
    case 'check':
      return d.check();
    case 'accept':
      return d.setAccepted(list(a.keys));
    case 'publish list':
      return d.publishList(a.on === true);
    case 'look':
      return d.look();
    case 'to sign':
      return d.toSign();
    case 'sign draft':
      return d.signDraft(text(a.id));
    case 'decline':
      return d.decline(text(a.id));
    case 'accept debt':
      return d.acceptDebt(text(a.id));
    case 'pay request':
      return d.payRequest(text(a.id));
    case 'answer invoice':
      return d.answerInvoice(text(a.id), text(a.invoice));
    case 'refuse invoice':
      return d.refuseInvoice(text(a.id), text(a.why));
    case 'pay':
      return d.pay();
    case 'paid':
      return d.paid(text(a.key), text(a.proof));
    case 'recheck':
      return d.recheck(text(a.key));
    case 'sign receipt':
      return d.signReceipt(text(a.key));
    case 'account':
      return d.account();
    case 'rails':
      return d.rails();
    case 'rails review':
      return d.railsReview({ lightning: text(a.lightning), onchain: text(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true });
    case 'rails publish':
      return d.publishRails({ lightning: text(a.lightning), onchain: text(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true, digest: text(a.digest) });
    case 'relays':
      return d.setRelays(list(a.relays));
    default:
      throw new Error(`unknown operation ${op}`);
  }
}
