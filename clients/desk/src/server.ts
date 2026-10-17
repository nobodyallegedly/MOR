// Edubba's program (called MOR Identities until 16 October 2026, F333): it
// holds the test keys, in its folder, and serves its
// page to the browser on this machine only (127.0.0.1). Every request from
// the page is signed by a paired browser, as in the collective client
// (step 11b), with the desk's own domain line, so a request or a pairing
// code made for one program is never good for the other.

import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Access, Refusal } from '../../collective/src/access.ts';
import { Desk } from './desk.ts';
import { type MachineOptions } from './machine.ts';
import { Agents } from './agents.ts';
import { Collectives } from './collectives.ts';
import { Setup } from './setup.ts';
import { Real } from './real.ts';
import { AfterKishib } from './kishib.ts';
import { Member } from './member.ts';
import { listFolders } from './folders.ts';
import { FONT_FILES, FONTS_DIR } from '../../dub/src/fonts.ts';
import { Store } from './store.ts';
import { STYLE } from './page/view.ts';
import { version } from './version.ts';
import { pageScript, serveLocal } from './local.ts';

export type { RunFile } from './local.ts';

/** What the browser's key signs, before the request body. */
export const DOMAIN = 'MOR desk, version 1\n';
export const CODE_LABEL = 'MOR desk pairing code';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

export interface Running {
  server: Server;
  port: number;
  base: string;
  store: Store;
  access: Access;
  desk: Desk;
  agents: Agents;
  collectives: Collectives;
  setup: Setup;
  real: Real;
  close(): Promise<void>;
}

const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : []);
const text = (v: unknown): string => (typeof v === 'string' ? v : '');

/** How often Machine, allegedly's answering looks for what it received, while it is on. */
export const MACHINE_EVERY = 60_000;

/**
 * Start the program on 127.0.0.1 at `port` (0: any free port), with its
 * folder at `dir`. `machineEvery`: how often Machine, allegedly's answering
 * looks (milliseconds; 0, never by itself); `machine`: where its API and key
 * are, for the tests.
 */
export async function serve(opts: { dir: string; port: number; drafts?: string; machineEvery?: number; machine?: MachineOptions; collective?: string }): Promise<Running> {
  const store = new Store(opts.dir);
  if (opts.drafts) store.saveSettings({ ...store.settings(), drafts: opts.drafts });
  const access = new Access(opts.dir, { domain: DOMAIN, label: CODE_LABEL });
  const desk = new Desk(store);
  const agents = new Agents(desk, store, opts.machine);
  // The collective client's folder, read where it is (~/mor-collective), or
  // inside this one for a new install (src/cli.ts).
  const collectives = new Collectives(opts.collective ?? join(opts.dir, 'collective'), store);
  const setup = new Setup(desk, store);
  const real = new Real(desk, store);
  // After Kišib: the new signing key's words, for an identity or a real collective held here (`kishib.ts`).
  const after = new AfterKishib(desk, store, real);
  // H33: Edubba signs as a member, with Dub's own code, for any identity it holds; the names it shows are Edubba's own.
  const member = new Member(store, desk, () => [...store.book().identities.map((i) => ({ id: i.id, name: i.name })), ...real.contacts().map((c) => ({ id: c.id, name: c.name }))]);
  /** A real collective founded here, read as anyone reads it (its relays and homes), with its founder as the member held here. */
  const realRead = (id: string) => {
    if (!real.isReal(id)) return undefined;
    const c = real.collective(id);
    const p = real.collectives().find((x) => x.id === id)!;
    return { id, name: p.name, member: p.founder, hints: [...c.f.relays, ...c.f.identity.homes.map((h) => h.hint)] };
  };
  const agentOf = (a: Record<string, unknown>) => agents.for(text(a.agent) || null);
  const num = (v: unknown): number => (typeof v === 'number' ? v : Number(text(v)));
  const script = await pageScript(here('src/page/app.ts'));
  const index = readFileSync(here('static/index.html'), 'utf8');
  const built = await version();

  const api = async (op: string, a: Record<string, unknown>, key: string): Promise<unknown> => {
    switch (op) {
      case 'pair':
        access.pair(key, text(a.code), text(a.label));
        return {};
      case 'state':
        return {
          ...desk.state(),
          machine: agents.for(null).state(),
          agents: agents.list(),
          sharedKey: agents.sharedKey(),
          collectives: [...collectives.list(), ...real.collectives().map((c) => ({ id: c.id, name: c.name, closed: false, members: c.members, real: true }))],
          proposals: real.proposals().map((p) => ({ ...p, standing: real.standing(p) })),
          contacts: real.contacts(),
          acting: await member.acting(),
          paired: access.paired().map((p) => ({ ...p, you: p.key === key })),
        };
      // An agent's answering: `agent` names it; without, the first agent (as MOR Identities had one).
      case 'machine terms': {
        const agent = text(a.agent);
        return agents.for(store.isAgent(agent) ? agent : null).previewTerms(agent, text(a.owner));
      }
      case 'machine publish':
        return agents.publishTerms(text(a.agent), text(a.owner), text(a.digest), a.own === true);
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
        return agents.details(text(a.agent));
      case 'agent add':
        return agents.add({ name: text(a.name), agent: text(a.agent), owner: text(a.owner), ownerName: text(a.ownerName), key: text(a.key), own: a.own === true });
      case 'agent name':
        return agents.name(text(a.agent));
      case 'agent key':
        return agents.setKey(text(a.agent), { own: a.own === true, key: text(a.key) });
      case 'shared key':
        return agents.saveKey(null, text(a.key));
      case 'agent prompt':
        return agents.prompt(text(a.agent), text(a.text));
      case 'agent follow':
        agents.follow(text(a.agent), text(a.id), text(a.name));
        return {};
      case 'agent unfollow':
        agents.unfollow(text(a.agent), text(a.id));
        return {};
      case 'agent view':
        return agents.view(text(a.agent));
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
        await desk.setSettings({ homes: list(a.homes), relays: list(a.relays), via, drafts: text(a.drafts) });
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
      case 'bring':
        return setup.bring({ name: text(a.name), id: text(a.id), words: text(a.words), address: text(a.address), linked: a.linked === true });
      case 'release folder':
        return setup.suggest(text(a.identity), text(a.folder));
      case 'release prepare':
        return setup.prepareRelease({ identity: text(a.identity), folder: text(a.folder), name: text(a.name), version: text(a.version), previous: text(a.previous) || null });
      case 'release confirm':
        return setup.confirmRelease(text(a.plan), text(a.digest));
      case 'release cancel':
        setup.cancelRelease(text(a.plan));
        return {};
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
          rules: { safety: num(a.safety), release: num(a.release), clone: num(a.clone), others: num(a.others) },
          words: text(a.words),
        });
      case 'real change prepare':
        return real.prepareChange({ collective: text(a.collective), members: list(a.members) });
      case 'real release prepare':
        return real.prepareRelease({ collective: text(a.collective), folder: text(a.folder), name: text(a.name), version: text(a.version) });
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
        return real.found(text(a.act));
      case 'real to show':
        return real.toShow(text(a.collective));
      case 'real show share':
        return real.showShare(text(a.collective), text(a.member));
      case 'real share back':
        return real.confirmShare(text(a.collective), text(a.member), list(a.typed));
      case 'real release standing':
        return real.releaseStanding(text(a.act));
      case 'real collective': {
        const c = real.collective(text(a.collective));
        return { id: c.identity, members: c.f.members, holder: c.f.signingHolder, agreement: c.f.agreement, relays: c.f.relays, threshold: c.f.safety.threshold, fingerprint: c.f.safety.fingerprint, pending: !!c.f.pending, releases: c.f.releases.map((r) => ({ id: r.id, version: r.version })), toShow: real.toShow(c.identity) };
      }
      case 'collective bring':
        return collectives.bring({ id: text(a.id), name: text(a.name) });
      case 'sort':
        desk.sort(text(a.identity), text(a.key), text(a.sorted));
        return {};
      case 'code':
        return { code: access.newCode() };
      case 'unpair':
        access.unpair(text(a.key));
        return {};
      default:
        // The collective client's own operations, for the Collectives tab (its code is the library Edubba uses).
        if (op.startsWith('collective ')) return collectives.api(op.slice('collective '.length), a);
        throw new Refusal(400, `unknown operation ${op}`);
    }
  };

  // Inter, bundled with Dub (F332), served from this page's own origin too.
  const fonts = Object.fromEntries(
    Object.entries(FONT_FILES).map(([name, type]) => [`/${name}`, { type, body: readFileSync(fileURLToPath(new URL(`../../dub/${FONTS_DIR}/${name}`, import.meta.url))) }]),
  );
  const local = await serveLocal({ dir: opts.dir, port: opts.port, access, index, script, style: STYLE, version: built, api, files: fonts, limit: 32 << 20 });
  // Each agent's answering looks by itself while the program runs; a failure is kept for the page to show, never thrown away silently.
  const every = opts.machineEvery ?? MACHINE_EVERY;
  const timer = every > 0 ? setInterval(() => void agents.tickAll(), every) : null;
  timer?.unref();
  return {
    server: local.server,
    port: local.port,
    base: local.base,
    store,
    access,
    desk,
    agents,
    collectives,
    setup,
    real,
    async close() {
      if (timer) clearInterval(timer);
      await local.close();
    },
  };
}
