// Ummia's operations, by name, as the page asks for them: the same list for
// the program (`server.ts`, whose requests are signed by a paired browser)
// and the web client (`web/app.ts`). Each takes plain values from the page
// and nothing else. The folder ones (a release, `folders`) are the
// program's: the web client answers that releases need a computer.

import type { Ummia } from './ummia.ts';
import type { SpecForm } from './spec.ts';

const text = (v: unknown): string => (typeof v === 'string' ? v : '');
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : typeof v === 'string' ? v.split(/[\s,]+/).filter(Boolean) : []);
const nums = (v: unknown): number[] => list(v).map(Number).filter((n) => Number.isInteger(n) && n >= 0);

/** A specification form, from the page's fields. */
export function formOf(a: Record<string, unknown>): SpecForm {
  const types = text(a.types)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = /^(\d+)\s+(\S+)\s*(.*)$/.exec(l);
      if (!m) throw new Error(`An act type is written “number name schema”, as “0 note note = tstr”, not “${l}”.`);
      return [Number(m[1]), m[2], m[3] || `${m[2]} = any`] as [number, string, string];
    });
  const railKind = text(a.railKind);
  return {
    kind: Number(a.kind ?? 0),
    text: text(a.text),
    tasks: nums(a.tasks),
    types,
    dependencies: list(a.dependencies),
    implements: text(a.implements).trim() || null,
    predecessor: text(a.predecessor).trim() || null,
    layers: nums(a.layers),
    rail: railKind === '' ? null : { kind: Number(railKind), binds: nums(a.railBinds) },
    checker: a.checker === true,
  };
}

export const OPS = [
  'state',
  'bring',
  'renew',
  'use',
  'leave',
  'forget',
  'carry',
  'check',
  'acting',
  'collective add',
  'collective release standing',
  'settings',
  'confirm',
  'cancel',
  'spec choices',
  'spec prepare',
  'specs',
  'track',
  'acts of',
  'accepted',
  'rules',
  'rules approve',
  'accepted change',
  'accepted publish',
  'mips',
  'mip new',
  'mip save',
  'mip draft',
  'mip replies',
  'mip prepare',
  'reports',
  'report send',
  'releases',
  'release suggest',
  'release prepare',
  'release confirm',
  'release check',
  'anchor offers',
  'anchor ask',
  'look',
  'spec page',
  'clock words',
  'saved add',
  'saved remove',
  'contacts',
  'follow',
  'follow releases',
  'card prepare',
  'published here',
  'discussions',
  'reply',
  'rely',
  'runner',
  'runner pair',
  'runner take',
  'runner asking',
  'runner drop',
  'runner unpair',
] as const;

export async function run(u: Ummia, op: string, a: Record<string, unknown>): Promise<unknown> {
  switch (op) {
    case 'state':
      return u.state();
    case 'rules':
      return u.rules();
    case 'rules approve':
      return u.approveRules({ keys: list(a.keys), where: a.where === 'list' ? 'list' : 'here', remove: a.remove === true });
    case 'bring':
      return u.bring({ id: text(a.id), words: text(a.words), address: text(a.address), relays: list(a.relays) });
    case 'renew':
      return u.renew(text(a.words));
    case 'use':
      return u.use(text(a.id));
    case 'leave':
      return u.leave();
    case 'forget':
      return u.forget(text(a.id));
    case 'carry':
      return u.carry();
    case 'check':
      return u.check();
    case 'acting':
      return u.setActing(text(a.id));
    case 'collective add':
      return u.collectiveAdd(text(a.id));
    case 'collective release standing':
      return u.collectiveReleaseStanding(text(a.id));
    case 'settings':
      return u.setSettings({ relays: a.relays === undefined ? undefined : list(a.relays), track: a.track === undefined ? undefined : list(a.track), reports: a.reports === undefined ? undefined : text(a.reports) });
    case 'confirm':
      return u.confirm(text(a.plan), text(a.digest));
    case 'cancel':
      return u.cancel(text(a.plan));
    case 'spec choices':
      return u.specChoices();
    case 'spec prepare':
      return u.prepareSpec(formOf(a));
    case 'specs':
      return u.specs();
    case 'track':
      return u.track({ relays: list(a.relays), signer: text(a.signer).trim() || undefined });
    case 'acts of':
      return u.actsOf({ spec: text(a.spec), type: text(a.type).trim() === '' ? null : Number(a.type), signer: text(a.signer).trim() || undefined, relays: list(a.relays) });
    case 'accepted':
      return u.accepted();
    case 'accepted change':
      return u.changeAccepted({
        add: Array.isArray(a.add) ? (a.add as { hash?: unknown; label?: unknown }[]).map((x) => ({ hash: text(x.hash), label: text(x.label) || null })) : [],
        remove: list(a.remove),
      });
    case 'accepted publish':
      return u.publishList(a.on === true);
    case 'mips':
      return u.mips();
    case 'mip new':
      return u.newMip({ title: text(a.title), forks: text(a.forks) });
    case 'mip save':
      return u.saveMip(text(a.key), text(a.text));
    case 'mip draft':
      return u.publishMipDraft(text(a.key));
    case 'mip replies':
      return u.mipReplies(text(a.key));
    case 'mip prepare':
      return u.prepareMip(text(a.key));
    case 'reports':
      return u.reports();
    case 'report send':
      return u.sendReport(text(a.text));
    case 'releases':
      return u.releases();
    case 'release suggest':
      return u.suggestRelease(text(a.folder));
    case 'release prepare':
      return u.prepareRelease({ folder: text(a.folder), name: text(a.name), version: text(a.version), previous: text(a.previous) || null, implements: list(a.implements) });
    case 'release confirm':
      return u.confirmRelease(text(a.plan), text(a.digest));
    case 'release check':
      return u.checkRelease(text(a.id));
    case 'anchor offers':
      return u.anchorOffers(text(a.service));
    case 'anchor ask':
      return u.anchorRelease({ release: text(a.release), service: text(a.service), offer: text(a.offer), tier: Number(a.tier ?? 0) });
    case 'look':
      return u.look({ point: (a.point ?? {}) as { kind?: string; value?: string }, filters: a.filters === undefined ? undefined : list(a.filters), layer: text(a.layer) || null });
    case 'spec page':
      return u.specPage({ hash: text(a.hash) });
    case 'clock words':
      return u.clockWords(list(a.ids));
    case 'saved add':
      return u.savedAdd({ label: text(a.label), point: { kind: text((a.point as { kind?: unknown })?.kind), value: text((a.point as { value?: unknown })?.value) }, filters: list(a.filters) });
    case 'saved remove':
      return u.savedRemove(text(a.key));
    case 'contacts':
      return u.contactsList();
    case 'follow':
      return u.follow({ id: text(a.id), name: text(a.name) || null });
    case 'follow releases':
      return u.followReleases({ id: text(a.id), name: text(a.name) || null });
    case 'card prepare':
      return u.prepareCard({ spec: text(a.spec), title: text(a.title), summary: text(a.summary), releases: list(a.releases), vectors: list(a.vectors), discussion: text(a.discussion) });
    case 'published here':
      return u.publishedHere();
    case 'discussions':
      return u.discussions();
    case 'reply':
      return u.reply({ to: text(a.to), text: text(a.text) });
    case 'rely':
      return u.rely({ id: text(a.id), typed: text(a.typed) });
    case 'runner':
      return u.runnerState();
    case 'runner pair':
      return u.runnerPair();
    case 'runner take':
      return u.runnerTake({ id: text(a.id) });
    case 'runner asking':
      return u.runnerAsking();
    case 'runner drop':
      return u.runnerDrop({ request: text(a.request) });
    case 'runner unpair':
      return u.runnerUnpair();
    default:
      throw new Error(`unknown operation ${op}`);
  }
}
