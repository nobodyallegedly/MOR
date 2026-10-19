// Edubba's operations by name, the same for the program on a computer
// (`server.ts`, each request signed by a paired browser) and for the web
// client (`web/app.ts`, run in the browser itself). The web client answers
// only the operations in `WEB_OPS`: no agents, no API key, no drafts from
// Claude's connector, no test collective, no folder (decided by Nobody,
// allegedly, 17 and 18 October 2026: a web Edubba without the Agents tab,
// "so I can access it from other devices than the Mac"). Any other is
// refused there in plain words.
//
// Nothing here imports the agents' code or the pairing's: they are given by
// the program only, so the web client's bundle holds neither.

import type { Access } from '../../collective/src/access.ts';
import type { Agents } from './agents.ts';
import type { Collectives } from './collectives.ts';
import type { Corrections } from './corrections.ts';
import type { Desk } from './desk.ts';
import type { AfterKishib } from './kishib.ts';
import type { Publishing } from './publishing.ts';
import type { Member } from './member.ts';
import type { EdubbaMoney } from './money.ts';
import type { Real } from './real.ts';
import type { Setup } from './setup.ts';
import type { Store } from './store.ts';
import type { Listing } from './folders.ts';
import type { Grid } from './grid.ts';

/** What the operations act on. The program gives every part; the web client neither the agents, the pairing, money nor the folder picker. */
export interface Parts {
  store: Store;
  desk: Desk;
  setup: Setup;
  real: Real;
  after: AfterKishib;
  member: Member;
  /** The Publishing tab (round 3, part B). */
  publishing: Publishing;
  corrections: Corrections;
  collectives: Collectives;
  agents: Agents | null;
  access: Access | null;
  money: EdubbaMoney | null;
  folders: ((path: string) => Listing) | null;
  /** A refusal with its status, as the program answers one (`Refusal`), or a plain error in the browser. */
  refuse: (status: number, message: string) => Error;
}

/**
 * The operations the web client answers. Everything else (agents, the API
 * key, drafts from Claude, making an identity, test collectives, money
 * drafts, a release from a folder, pairing) needs Edubba on a computer.
 */
export const WEB_OPS: readonly string[] = [
  'state',
  'publishing',
  'publishing act as',
  'publishing collective add',
  'publishing work read',
  'publishing confirm',
  'publishing deliver',
  'publishing vow read',
  'publishing vow sales',
  'publishing contest',
  'publishing confirm sale',
  'keys check',
  'identity posts',
  'identity correct',
  'collective constitution',
  'collective permissions',
  'collective posts',
  'collective bring',
  'settings',
  'rename',
  'drafts',
  'waiting',
  'refresh',
  'sort',
  'witness',
  'read act',
  'record',
  'bring',
  'fold',
  'acting as',
  'member proposals',
  'member accept',
  'member decline',
  'member leave read',
  'member leave',
  'member share',
  'member shareback',
  'member sharehand',
  'identity renew',
  'real collective renew',
  'real lists',
  'real contacts',
  'real contact add',
  'real contact remove',
  'real found prepare',
  'real change prepare',
  'real grid',
  'real confirm',
  'real cancel',
  'real gather',
  'real by hand',
  'real found',
  'real to show',
  'real show share',
  'real share back',
  'real release standing',
  'real collective',
  'real register resignation',
];

/** Said where a collective's release would be made: the web client chooses no folder (`docs/edubba-web-report.md`, "Releases"). */
export const RELEASE_ON_WEB =
  'A collective’s release is made in Ummia, the developers’ app, on a computer (the Mac, or Linux), by a member holding the area that reaches its releases, with their own key for the collective (F339, F353). A release proposed there is signed here, in “To sign”, and checked as anyone would.';

/** Said for any other operation the web client does not answer. */
export const ON_A_COMPUTER =
  'This needs Edubba on a computer: the web client has no agents, no API key, no drafts from Claude’s connector, no test collective and no money drafts, and makes no identity (bring one you have).';

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Edubba's operations: `web` answers only `WEB_OPS`. */
export function operations(p: Parts, opts: { web: boolean }): (op: string, a: Record<string, unknown>, key: string) => Promise<unknown> {
  const { store, desk, setup, real, after, member, publishing, corrections, collectives, agents, access, money } = p;
  const web = opts.web;
  /** A real collective founded here, read as anyone reads it (its relays and homes), with its founder as the member held here. */
  const realRead = (id: string) => {
    if (!real.isReal(id)) return undefined;
    const c = real.collective(id);
    const x = real.collectives().find((y) => y.id === id)!;
    return { id, name: x.name, member: x.founder, hints: [...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)] };
  };
  const agentOf = (a: Record<string, unknown>) => agents!.for(text(a.agent) || null);
  const num = (v: unknown): number => (typeof v === 'number' ? v : Number(text(v)));
  const listFolders = (path: string) => {
    if (!p.folders) throw p.refuse(400, ON_A_COMPUTER);
    return p.folders(path);
  };

  return async (op, a, key) => {
    if (web && !WEB_OPS.includes(op)) throw p.refuse(400, op === 'real release prepare' ? RELEASE_ON_WEB : ON_A_COMPUTER);
    // On the web, no drafts folder is read: Claude's connector runs on a computer.
    if (web && (op === 'drafts' || op === 'waiting')) return [];
    switch (op) {
      case 'pair':
        access!.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return {
          ...p.desk.state(),
          machine: agents ? agents.for(null).state() : null,
          agents: agents ? agents.list() : [],
          sharedKey: agents ? agents.sharedKey() : { found: false, from: '' },
          // On the web, no test collective: only the real ones founded here and those brought by their ID.
          collectives: [...(web ? collectives.list().filter((c) => c.brought) : collectives.list()), ...real.collectives().map((c) => ({ id: c.id, name: c.name, closed: false, members: c.members, real: true }))],
          proposals: real.proposals().map((x) => ({ ...x, standing: real.standing(x) })),
          contacts: real.contacts(),
          acting: await member.acting(),
          paired: access ? access.paired().map((x) => ({ ...x, you: x.key === key })) : [],
          web,
        };
      // An agent's answering: `agent` names it; without, the first agent (as MOR Identities had one).
      case 'machine terms': {
        const agent = text(a.agent);
        return agents!.for(p.store.isAgent(agent) ? agent : null).previewTerms(agent, text(a.owner));
      }
      case 'machine publish':
        return agents!.publishTerms(text(a.agent), text(a.owner), text(a.digest), a.own === true);
      case 'machine on':
        agentOf(a).setOn(a.on === true);
        return {};
      case 'machine cap':
        agentOf(a).setCap({ callsPerDay: num(a.callsPerDay), maxChars: num(a.maxChars) });
        return {};
      case 'machine look':
        return agentOf(a).tick();
      case 'machine pick':
        return agentOf(a).pick(text(a.key));
      case 'machine picks':
        return agentOf(a).previewPicks(a.keys);
      case 'machine pick many':
        return agentOf(a).pickMany(a.keys, text(a.digest));
      case 'machine nudge':
        return agentOf(a).nudge(num(a.count), text(a.context));
      case 'machine retry':
        return agentOf(a).retry(text(a.act));
      case 'agent':
        return agents!.details(text(a.agent));
      case 'agent add':
        return agents!.add({ name: text(a.name), agent: text(a.agent), owner: text(a.owner), ownerName: text(a.ownerName), key: text(a.key), own: a.own === true });
      case 'agent name':
        return agents!.name(text(a.agent));
      case 'agent key':
        return agents!.setKey(text(a.agent), { own: a.own === true, key: text(a.key) });
      case 'shared key':
        return agents!.saveKey(null, text(a.key));
      case 'agent prompt':
        return agents!.prompt(text(a.agent), text(a.text));
      case 'agent follow':
        agents!.follow(text(a.agent), text(a.id), text(a.name));
        return {};
      case 'agent unfollow':
        agents!.unfollow(text(a.agent), text(a.id));
        return {};
      case 'agent view':
        return agents!.view(text(a.agent));
      case 'agent grant preview':
        return agents!.grantPreview(text(a.agent), {
          kinds: list(a.kinds),
          cap: a.cap === undefined || a.cap === null || a.cap === '' ? null : num(a.cap),
          expiry: text(a.clock) ? { clock: text(a.clock).toLowerCase(), time: num(a.until) } : null,
        });
      case 'agent grant publish':
        return agents!.grantPublish(text(a.agent), text(a.digest));
      case 'agent grant ask':
        return agents!.grantAsk(text(a.agent), text(a.grant));
      case 'agent grant revoke':
        return agents!.grants.revoke(text(a.agent), text(a.grant));
      case 'agent grants':
        return agents!.grants.list(text(a.agent));
      case 'keys check': {
        // F335: on opening, every identity held here whose signing key was changed elsewhere, said; a change of keys is Kišib's.
        const out: { id: string; name: string; say: string }[] = [];
        for (const i of store.book().identities) {
          if (!store.holds(i.id)) continue;
          const w = await desk.keyChanged(i.id);
          if (w) out.push({ id: i.id, name: i.name, say: w });
        }
        return out;
      }
      case 'identity posts':
        return corrections.posts(text(a.identity));
      case 'identity correct':
        return corrections.correct(text(a.identity), text(a.act), text(a.text));
      case 'agent notes':
        return agents!.notes(text(a.agent));
      case 'agent note retire':
        return agents!.retireNote(text(a.agent), text(a.note), text(a.why));
      case 'agent diary':
        // H22, 6: shown only by this one deliberate action, `reading` set once the page said what it means.
        return agents!.diary(text(a.agent), a.reading === true);
      case 'collective constitution':
        return collectives.constitution(text(a.collective), realRead(text(a.collective)));
      case 'collective permissions':
        return collectives.permissions(text(a.collective), realRead(text(a.collective)));
      case 'collective posts':
        return collectives.posts(text(a.collective), realRead(text(a.collective)));
      case 'settings': {
        const via: Record<string, string> = {};
        for (const line of list(a.via)) {
          const [from, to] = line.split('=').map((s) => s.trim());
          if (!from || !to) throw new Error(`“${line}”: write it as address=where to reach it`);
          via[from] = to;
        }
        // On the web, no other way to reach an address (a browser reaches https only), and no drafts folder.
          await desk.setSettings(web ? { homes: list(a.homes), relays: list(a.relays), via: {}, drafts: p.store.settings().drafts } : { homes: list(a.homes), relays: list(a.relays), via, drafts: text(a.drafts) });
        return {};
      }
      case 'identity':
        return desk.createIdentity({ name: text(a.name), linked: a.linked === true });
      case 'rename':
        desk.rename(text(a.id), text(a.name));
        return {};
      case 'link':
        desk.link(text(a.id), a.on === true);
        return {};
      case 'drafts':
        return desk.drafts();
      case 'waiting':
        return desk.waiting();
      case 'approve':
        return desk.approve(text(a.digest));
      case 'decline':
        return desk.decline(text(a.digest), text(a.note));
      case 'send back':
        return desk.sendBack(text(a.digest), text(a.note));
      case 'resend':
        return desk.resend(text(a.digest));
      case 'refresh':
        return desk.refresh(text(a.identity));
      case 'witness':
        // Read back first, then signed only once RELY is typed (as the genesis client's command; Identity rule 18c).
        return setup.witness(text(a.identity), text(a.act), text(a.shown), text(a.typed));
      case 'read act':
        return setup.readAct(text(a.identity), text(a.act));
      case 'record':
        return setup.record(text(a.identity));
      case 'bring': {
        const d = await setup.bring({ name: text(a.name), id: text(a.id), words: text(a.words), address: text(a.address), linked: !web && a.linked === true });
        // On the web, Claude's connector is out of the picture: nothing said of it.
        return web ? { ...d, lines: d.lines.filter((l) => !/linked to Claude/.test(l.text)) } : d;
      }
      case 'fold':
        // H14, H26, H34: a fold as the person left it; a collective's "What you may do for it" by the collective's ID, every other by its name.
        desk.fold(text(a.key) || text(a.collective), a.open === true);
        return {};
      case 'folders':
        // H31: the Mac's folders, browsed by the program for the page, which cannot open the Mac's own dialog.
        return listFolders(text(a.path));
      case 'acting as':
        await member.actAs(text(a.id));
        return { acting: await member.acting() };
      case 'member proposals':
        return member.as((d) => d.proposals());
      case 'member accept':
        return member.as((d) => d.signProposal(text(a.thread)));
      case 'member decline':
        return member.as((d) => d.declineProposal(text(a.thread), text(a.why)));
      case 'member leave read':
        return member.as((d) => d.leaveRead(text(a.thread)));
      case 'member leave':
        return member.as((d) => d.leaveCollective(text(a.thread), text(a.digest)));
      case 'member share':
        return member.as((d) => d.shareShow(text(a.thread)));
      case 'member shareback':
        return member.as((d) => d.shareConfirm(text(a.thread), list(a.typed)));
      case 'member sharehand':
        return member.as((d) => d.shareByHand(text(a.thread)));
      case 'identity renew':
        return after.renewIdentity(text(a.identity), text(a.words));
      case 'real collective renew':
        return after.renewCollective(text(a.collective), text(a.words));
      case 'real lists':
        return real.readLists();
      case 'real contacts':
        return real.contacts();
      case 'real contact add':
        return real.addContact(text(a.id), text(a.name));
      case 'real contact remove':
        real.removeContact(text(a.id));
        return {};
      case 'real found prepare':
        return real.prepareFounding({
          name: text(a.name),
          founder: text(a.founder),
          members: list(a.members),
          ...(a.grid ? { grid: a.grid as Grid } : { rules: { safety: num(a.safety), release: num(a.release), clone: num(a.clone), others: num(a.others) } }),
          words: text(a.words),
        });
      case 'real change prepare':
        return real.prepareChange({ collective: text(a.collective), members: list(a.members), ...(a.grid ? { grid: a.grid as Grid } : {}) });
      case 'real grid':
        // The grid a member change starts from: the agreement in force's, its columns these members (round 3).
        return real.gridFor(text(a.collective), list(a.members));
      case 'real release prepare':
        // Round 3 (F339): a collective's releases moved to Ummia, signed there with the member's own key.
        throw p.refuse(400, RELEASE_ON_WEB);
      case 'real confirm':
        return real.confirm(text(a.plan), text(a.digest));
      case 'real cancel':
        real.cancel(text(a.plan));
        return {};
      case 'real gather': {
        const r = await real.gather(text(a.act));
        return { ...r, standing: real.standing(r.proposal) };
      }
      case 'real by hand':
        return real.byHand(text(a.act), text(a.member), a.on === true);
      case 'real found':
        return real.found(text(a.act), a.read === true);
      case 'real to show':
        return real.toShow(text(a.collective));
      case 'real show share':
        return real.showShare(text(a.collective), text(a.member));
      case 'real share back':
        return real.confirmShare(text(a.collective), text(a.member), list(a.typed));
      case 'real release standing':
        return real.releaseStanding(text(a.act));
      case 'real register resignation':
        return real.registerResignation(text(a.collective), text(a.act));
      case 'real collective': {
        const c = real.collective(text(a.collective));
        return { id: c.identity, members: c.f.members, holder: c.f.signingHolder, agreement: c.f.agreement, relays: c.f.relays, threshold: c.f.safety.threshold, fingerprint: c.f.safety.fingerprint, pending: !!c.f.pending, releases: c.f.releases.map((r) => ({ id: r.id, version: r.version })), toShow: real.toShow(c.identity), resigned: await real.resignations(c.identity).catch(() => []) };
      }
      case 'publishing':
        return publishing.state();
      case 'publishing act as':
        return publishing.actAs(text(a.id));
      case 'publishing collective add':
        return publishing.collectiveAdd(text(a.id));
      case 'publishing work read':
        return publishing.prepareWork({ media: text(a.media), data: text(a.data), title: text(a.title), price: text(a.price), referral: text(a.referral) });
      case 'publishing confirm':
        return publishing.confirm(text(a.plan), text(a.digest));
      case 'publishing deliver':
        return publishing.deliver();
      case 'publishing vow read':
        return publishing.prepareVow({ words: text(a.words), title: text(a.title), price: text(a.price) });
      case 'publishing vow sales':
        return publishing.vowSales({ identity: text(a.identity), relays: list(a.relays) });
      case 'publishing confirm sale':
        return publishing.confirmSale({ vow: text(a.vow), sale: text(a.sale), buyer: text(a.buyer), seller: text(a.seller), unit: text(a.unit), value: num(a.value) });
      case 'publishing contest':
        return publishing.contestSale({ vow: text(a.vow), sale: text(a.sale), buyer: text(a.buyer), promise: text(a.promise) });
      case 'money units':
        return money!.units();
      case 'money pay':
        return money!.pay({ identity: text(a.identity), to: text(a.to), value: text(a.value), unit: text(a.unit), whatFor: text(a.whatFor) });
      case 'money anchorable':
        return money!.anchorable(text(a.collective));
      case 'money offers':
        return money!.offers(text(a.service));
      case 'money anchor':
        return money!.ask({ identity: text(a.identity), collective: text(a.collective), act: text(a.act), service: text(a.service), offer: text(a.offer), tier: num(a.tier) });
      case 'money anchors':
        return money!.anchors(text(a.collective));
      case 'collective bring':
        return collectives.bring({ id: text(a.id), name: text(a.name) });
      case 'sort':
        desk.sort(text(a.identity), text(a.key), text(a.sorted));
        return {};
      case 'code':
        return { code: access!.newCode() };
      case 'unpair':
        access!.unpair(text(a.key));
        return {};
      default:
        // The collective client's own operations, for the Collectives tab (its code is the library Edubba uses).
        if (op.startsWith('collective ')) return collectives.api(op.slice('collective '.length), a);
        throw p.refuse(400, `unknown operation ${op}`);
    }
  };
}
