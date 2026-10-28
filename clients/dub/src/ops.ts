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

/** An expiry, as seconds since 1970, from a number or a date the page sends; none where empty. */
const untilOf = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number') return Math.floor(v);
  const t = Date.parse(String(v));
  if (Number.isNaN(t)) throw new Error('Until: a date and time, or nothing.');
  return Math.floor(t / 1000);
};

/** The names of every operation, so a page and a test can be checked against them. */
export const OPS = [
  'state',
  'names',
  'runner',
  'runner pair',
  'runner take',
  'runner asking',
  'runner drop',
  'runner unpair',
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
  'leave read',
  'leave collective',
  'share',
  'shareback',
  'sharehand',
  'tip',
  'ask paid',
  'lane ask',
  'lanes',
  'tip now',
  'payments',
  'paid',
  'sell',
  'buy',
  'repost',
  'vow buy',
  'vows bought',
  'vow confirm',
  'vow contest',
  'purchase contest',
  'money look',
  'relays review',
  'relays publish',
  'open',
  'why',
  'profile',
  'rely read',
  'rely',
  'anchor offers',
  'anchor',
  'correct',
  'film',
  'recording',
  'sealed play',
  'clock',
  'collective add',
  'collective remove',
  'act as',
  'purchases',
  'pay ways',
  'pay',
  'damgar answer',
] as const;

const payKind = (v: unknown): 'tip' | 'buy' | 'vow' | 'pay' => (v === 'tip' || v === 'buy' || v === 'vow' || v === 'pay' ? v : 'pay');

export async function run(dub: Dub, op: string, a: Record<string, unknown>, p: Platform): Promise<unknown> {
  switch (op) {
    case 'names':
      return dub.names_({ ids: Array.isArray(a.ids) ? a.ids.map(String) : [], fresh: a.fresh === true });
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
      return dub.relay(30, Array.isArray(a.layers) ? list(a.layers) : undefined);
    case 'forget':
      await dub.forget(text(a.id));
      return {};
    // An identity used through Kišib's runner (the Dubsar runner cMIP): the computer's program only, never the web client.
    case 'runner':
      return dub.runnerState();
    case 'runner pair':
      return dub.runnerPair();
    case 'runner take':
      return dub.runnerTake({ id: text(a.id) });
    case 'runner asking':
      return dub.runnerAsking();
    case 'runner drop':
      await dub.runnerDrop({ request: text(a.request) });
      return {};
    case 'runner unpair':
      await dub.runnerUnpair();
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
        mp4: text(a.mp4) ? p.bytes(text(a.mp4)) : undefined,
        m4a: text(a.m4a) ? p.bytes(text(a.m4a)) : undefined,
        to: Array.isArray(a.to) ? list(a.to) : text(a.to),
        reply: reply ? { id: text(reply.id), signer: text(reply.signer) } : undefined,
      });
    }
    case 'feed':
      return dub.feed(a.fresh === true);
    case 'inbox':
      return dub.inbox();
    case 'message':
      return dub.message({ to: text(a.to), text: text(a.text), cc: list(a.cc), collective: text(a.collective) || null });
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
    case 'leave read':
      return dub.leaveRead(text(a.thread));
    case 'leave collective':
      return dub.leaveCollective(text(a.thread), text(a.digest));
    case 'share':
      return dub.shareShow(text(a.thread));
    case 'shareback':
      return dub.shareConfirm(text(a.thread), list(a.typed));
    case 'sharehand':
      return dub.shareByHand(text(a.thread));
    case 'tip':
      return dub.moneyDraft({ what: 'pay', other: text(a.signer), post: text(a.post), value: text(a.value), unit: text(a.unit), whatFor: text(a.whatFor) });
    case 'relays review':
      return dub.relaysReview(list(a.relays));
    case 'relays publish':
      return dub.relaysPublish(list(a.relays), text(a.digest));
    case 'lane ask':
      return dub.laneAsk({ label: text(a.label), cap: text(a.cap), total: text(a.total), unit: text(a.unit), until: untilOf(a.until), clock: text(a.clock) });
    case 'lanes':
      return dub.lanes();
    case 'tip now':
      return dub.tipNow({ post: text(a.post), signer: text(a.signer), value: text(a.value), unit: text(a.unit), whatFor: text(a.whatFor) });
    case 'payments':
      return dub.payments();
    case 'paid':
      return dub.paidNow(text(a.key), text(a.proof));
    case 'sell':
      return dub.sell({ text: text(a.text), teaser: text(a.teaser), value: text(a.value), unit: text(a.unit), referral: text(a.referral) });
    case 'buy':
      return dub.buy({ publication: text(a.publication), seller: text(a.seller), post: text(a.post) || undefined, repost: text(a.repost) || undefined, reposter: text(a.reposter) || undefined });
    case 'vow buy':
      return dub.buyVow({ vow: text(a.vow), seller: text(a.seller), post: text(a.post) });
    case 'vows bought':
      return dub.vowsBought();
    case 'vow confirm':
      return dub.confirmVow(text(a.vow));
    case 'vow contest':
      return dub.contestVow(text(a.vow), text(a.promise));
    case 'purchase contest':
      return dub.contestFile(text(a.publication), text(a.promise));
    case 'repost':
      return dub.repost({ post: text(a.post), signer: text(a.signer) });
    case 'money look':
      return dub.moneyLook();
    case 'ask paid':
      return dub.moneyDraft({ what: 'ask', other: text(a.to), value: text(a.value), unit: text(a.unit), whatFor: text(a.whatFor) });
    case 'open':
      return dub.open({ id: text(a.id), signer: text(a.signer) || undefined });
    case 'why':
      return dub.why({ id: text(a.id), signer: text(a.signer) || undefined });
    case 'profile':
      return dub.profile({ id: text(a.id) });
    case 'rely read':
      return dub.relyRead({ id: text(a.id), signer: text(a.signer) || undefined });
    case 'rely':
      return dub.rely({ id: text(a.id), signer: text(a.signer) || undefined, typed: text(a.typed) });
    case 'anchor offers':
      return dub.anchorOffers({ service: text(a.service) });
    case 'anchor':
      return dub.anchor({ id: text(a.id), service: text(a.service), offer: text(a.offer), tier: Number(a.tier) });
    case 'correct':
      return dub.correct({ id: text(a.id), text: text(a.text) });
    case 'film':
      return dub.film({ publication: text(a.publication), signer: text(a.signer) || undefined });
    case 'sealed play':
      return dub.sealedPlay({ publication: text(a.publication), seller: text(a.seller) });
    case 'recording':
      return dub.recording({ publication: text(a.publication), signer: text(a.signer) || undefined });
    case 'clock':
      return dub.setClock({ id: text(a.id), name: text(a.name) });
    case 'collective add':
      return dub.collectiveAdd({ id: text(a.id) });
    case 'collective remove':
      return dub.collectiveRemove({ id: text(a.id) });
    case 'act as':
      return dub.actAs({ id: text(a.id) || null });
    case 'purchases':
      return dub.purchases();
    case 'damgar answer':
      return dub.damgarAnswer(text(a.request));
    case 'pay ways':
      return dub.payWays({ kind: payKind(a.kind), post: text(a.post) || undefined, signer: text(a.signer) || undefined });
    case 'pay':
      return dub.pay({
        how: a.how === 'lane' || a.how === 'damgar' || a.how === 'hand' ? a.how : (() => { throw new Error('Choose a way to pay.'); })(),
        kind: payKind(a.kind),
        signer: text(a.signer),
        post: text(a.post) || undefined,
        publication: text(a.publication) || undefined,
        vow: text(a.vow) || undefined,
        repost: text(a.repost) || undefined,
        reposter: text(a.reposter) || undefined,
        value: text(a.value),
        unit: text(a.unit),
        whatFor: text(a.whatFor),
      });
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

export { PUBLISH_WARNING };
