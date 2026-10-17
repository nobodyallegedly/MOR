// Dub's operations, by name, as the page asks for them: the same list for
// the program on the Mac (`server.ts`, whose requests are signed by a
// paired browser) and for the web client (`web/app.ts`, in the browser).
// Each takes plain values from the page and nothing else.

import type { Dub } from './dub.ts';
import { PUBLISH_WARNING } from './people.ts';

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);

export interface Platform {
  /** A picture sent as base64, as bytes. */
  bytes(b64: string): Uint8Array;
  /** Other ways to reach an address (the Mac only), or none. */
  via(v: unknown): Record<string, string>;
}

/** The names of every operation, so a page and a test can be checked against them. */
export const OPS = [
  'state',
  'begin',
  'confirm',
  'abandon',
  'bring',
  'renew',
  'use',
  'leave',
  'relay',
  'forget',
  'carry',
  'check',
  'name',
  'post',
  'feed',
  'inbox',
  'message',
  'seen',
  'follow',
  'unfollow',
  'call',
  'mute',
  'unmute',
  'list',
  'withdraw',
  'signing',
  'proposals',
  'accept',
  'decline',
  'share',
  'shareback',
  'sharehand',
] as const;

export async function run(dub: Dub, op: string, a: Record<string, unknown>, p: Platform): Promise<unknown> {
  switch (op) {
    case 'state':
      return dub.state();
    case 'begin':
      return dub.begin({ homes: list(a.homes), relays: list(a.relays), via: p.via(a.via), name: text(a.name) });
    case 'confirm':
      return dub.confirm(list(a.typed));
    case 'abandon':
      await dub.abandon();
      return {};
    case 'bring':
      return dub.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list(a.relays), via: p.via(a.via) });
    case 'renew':
      return dub.renew(text(a.words));
    case 'use':
      await dub.use(text(a.id));
      return {};
    case 'leave':
      await dub.leave();
      return {};
    case 'relay':
      return dub.relay();
    case 'forget':
      await dub.forget(text(a.id));
      return {};
    case 'carry':
      return dub.carry();
    case 'check':
      return dub.check();
    case 'name':
      return dub.setName(text(a.name));
    case 'post': {
      const reply = a.reply && typeof a.reply === 'object' ? (a.reply as Record<string, unknown>) : null;
      return dub.post({
        text: text(a.text),
        jpeg: text(a.jpeg) ? p.bytes(text(a.jpeg)) : undefined,
        to: text(a.to),
        reply: reply ? { id: text(reply.id), signer: text(reply.signer) } : undefined,
      });
    }
    case 'feed':
      return dub.feed(a.fresh === true);
    case 'inbox':
      return dub.inbox();
    case 'message':
      return dub.message({ to: text(a.to), text: text(a.text) });
    case 'seen':
      await dub.seen(list(a.keys));
      return {};
    case 'follow':
      return dub.follow({ id: text(a.id), name: text(a.name) });
    case 'unfollow':
      return dub.unfollow(text(a.id));
    case 'call':
      return dub.callIt({ id: text(a.id), name: text(a.name) });
    case 'mute':
      return dub.mute(text(a.id));
    case 'unmute':
      return dub.unmute(text(a.id));
    case 'list':
      return dub.listOption({ published: a.published === true, shown: text(a.shown) });
    case 'withdraw':
      return dub.withdraw(text(a.publication));
    case 'signing':
      return dub.setSigning(a.on === true);
    case 'proposals':
      return dub.proposals();
    case 'accept':
      return dub.signProposal(text(a.thread));
    case 'decline':
      return dub.declineProposal(text(a.thread), text(a.why));
    case 'share':
      return dub.shareShow(text(a.thread));
    case 'shareback':
      return dub.shareConfirm(text(a.thread), list(a.typed));
    case 'sharehand':
      return dub.shareByHand(text(a.thread));
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

export { PUBLISH_WARNING };
