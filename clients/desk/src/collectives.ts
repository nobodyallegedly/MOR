// Edubba's Collectives tab (F333, decided by Nobody, allegedly: "one section
// is collectives"; the collective client taken in as its constitution
// sub-tab). The collective client's folder is read where it is
// (~/mor-collective), and its code is the library this uses: its `Actions`
// for every reviewed operation, its `collectiveApi` for the page's requests.
//
// - Act: what this user may do for each collective, text and pictures for
//   now, each permission naming the rule it rests on (`Actions.permissions`),
//   a post reviewed before it is signed (`Actions.preparePost`), and the
//   collective's own posts.
// - Its latest constitutional agreement, as a pop-up in plain words: the
//   deal-assessment tool's reading (`clients/assess`).
// - Constitution: everything the collective client does, through its API.

import { Actions } from '../../collective/src/actions.ts';
import { Store as CollectiveStore } from '../../collective/src/store.ts';
import { collectiveApi } from '../../collective/src/server.ts';
import { assess } from '../../assess/src/assess.ts';
import { gather } from '../../assess/src/gather.ts';
import { readFeed } from '../../site/src/feed.ts';
import { escapeControls } from '../../connector/src/words.ts';
import { MIRS, SPECS, Verifier, cborDecode, describeAct } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { allBy } from '../../repo/src/release.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { termsOf, type Line, type TermsRead } from '../../collective/src/explain.ts';
import type { Done } from './desk.ts';
import type { BroughtCollective, Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

export class Collectives {
  readonly store: CollectiveStore;
  readonly actions: Actions;
  readonly api: (op: string, a: Record<string, unknown>) => Promise<unknown>;

  constructor(
    readonly dir: string,
    private readonly desk: Store,
  ) {
    this.store = new CollectiveStore(dir);
    this.actions = new Actions(this.store);
    const api = collectiveApi(this.actions, this.store);
    this.api = (op, a) => {
      this.places();
      return api(op, a);
    };
  }

  /** A folder with no places yet takes the desk's, so the person names them once. */
  private places(): void {
    const s = this.store.settings();
    const d = this.desk.settings();
    if (!s.homes.length && !s.relays.length && (d.homes.length || d.relays.length)) this.store.saveSettings({ ...s, homes: d.homes, relays: d.relays, via: d.via });
  }

  /** Collectives brought here by their ID (H15), held by none of their keys. */
  brought(): BroughtCollective[] {
    return this.desk.book().collectives ?? [];
  }

  private broughtOne(id: string): BroughtCollective | undefined {
    return this.brought().find((x) => x.id === id);
  }

  /** Where to read: the desk's places and the collective client's. */
  private hints(extra: string[] = []): string[] {
    const s = this.store.settings();
    const d = this.desk.settings();
    return [...new Set([...extra, ...d.relays, ...d.homes.map((h) => h.hint), ...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  /**
   * A collective read from its homes and relays alone, as anyone could read
   * it, with none of its keys: its chain, the agreement its genesis or its
   * latest rotation declares, its parties' chains and acts, and Agreements'
   * own reading of the agreement in force.
   */
  private async read(id: string, extra: string[] = []): Promise<{ v: Verifier; hints: string[]; agreement: string; terms: { payload: Uint8Array; t: TermsRead }; frozen: number[]; closed: string | null }> {
    const via = this.desk.settings().via;
    const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
    let hints = this.hints(extra);
    let look;
    try {
      look = await lookUp(id, hints, via, v);
    } catch (e) {
      throw new Error(`No collective ${short(id)} was found at ${hints.join(', ')}: ${err(e)}. Nothing was kept.`);
    }
    hints = [...new Set([...hints, ...look.resolution.homes.map((h) => h.hint), ...look.routes.routes.flatMap((r) => r.hints)])];
    const added = new Set<string>();
    const addAll = async (who: string) => {
      if (added.has(who)) return;
      added.add(who);
      if (who !== id) {
        try {
          await lookUp(who, hints, via, v);
        } catch {
          // not found: its acts cannot count
        }
      }
      for (const a of await allBy(who, hints, via)) {
        try {
          v.add(a);
        } catch {
          // a private act, or malformed
        }
      }
    };
    await addAll(id);
    // Agreements count signature acts by the parties: each party's acts are read, until the agreement in force names no one new.
    const termsAt = async (agreement: string) => {
      for (const h of hints) {
        try {
          const a = await relayAt(h, via).getAct(agreement);
          if (!a) continue;
          const d = describeAct(a) as { public: boolean; spec?: string; type?: number; payload?: Uint8Array };
          if (d.public && d.spec === REPO_SPECS.agreements && d.type === 0 && d.payload) {
            try {
              v.add(a);
            } catch {
              // held already
            }
            return { payload: d.payload, t: termsOf(d.payload) };
          }
        } catch {
          // away: the next
        }
      }
      return null;
    };
    type Current = { agreement: string; frozen: number[]; closed: string | null };
    let cur = null as Current | null;
    // Agreements name what they miss: the agreement its chain declares, then the parties' signature acts on it.
    for (let round = 0; round < 8; round++) {
      try {
        cur = (v.agreementsCurrent(AGREEMENTS_SPECS, id) as Current | null) ?? null;
      } catch (e) {
        const missing = /act ([0-9a-f]{64}) is not held/.exec(err(e))?.[1];
        const terms = missing ? await termsAt(missing) : null;
        if (!terms) throw new Error(`Agreements cannot read ${short(id)} as a collective: ${err(e)}. Nothing was kept.`);
        for (const p of terms.t.parties) await addAll(p);
        continue;
      }
      if (!cur) break;
      const terms = await termsAt(cur.agreement);
      if (!terms) break;
      const fresh = terms.t.parties.filter((p) => !added.has(p));
      if (!fresh.length) return { v, hints, agreement: cur.agreement, terms, frozen: cur.frozen ?? [], closed: cur.closed ?? null };
      for (const p of fresh) await addAll(p);
    }
    if (!cur) throw new Error(`${short(id)} is not read as a collective here: Agreements find no agreement in force for it at ${hints.join(', ')}. Nothing was kept.`);
    throw new Error(`Its agreement in force (${short(cur.agreement)}) was not found at ${hints.join(', ')}. Nothing was kept.`);
  }

  /**
   * Bring an existing collective by its ID (H15): read from its homes and
   * relays, and kept only if one of the person's identities, held by Edubba
   * or in the collective client's folder, is a party of its agreement in
   * force. Nothing is signed; none of its keys is held here.
   */
  async bring(a: { id: string; name: string }): Promise<Done> {
    const id = a.id.replace(/\s+/g, '').toLowerCase();
    const name = a.name.trim();
    if (!/^[0-9a-f]{64}$/.test(id)) throw new Error('A collective is named by its ID: 64 hexadecimal characters.');
    if (!name) throw new Error('Give it a name, so you can tell it apart here. The name stays on this Mac.');
    if (this.list().some((x) => x.id === id)) throw new Error('This collective is already here.');
    const r = await this.read(id);
    const parties = r.terms.t.parties;
    const mine = [...this.desk.book().identities.map((i) => i.id), ...this.store.book().identities.filter((i) => i.mine).map((i) => i.id)];
    const member = parties.find((p) => mine.includes(p));
    const names = this.names();
    if (!member) {
      throw new Error(`None of your identities here is a party of its agreement in force (${short(r.agreement)}), whose parties are ${parties.map(names).join(', ')}. Bring the identity that is a member first. Nothing was kept.`);
    }
    if (r.closed) throw new Error(`It was ended by its fork or closing ${short(r.closed)} (Agreements rule 47a). Nothing was kept.`);
    const b = this.desk.book();
    b.collectives = [...(b.collectives ?? []), { id, name, hints: r.hints, member }];
    this.desk.saveBook(b);
    return {
      title: `“${name}” is here`,
      lines: [
        { text: `Read from ${r.hints.join(', ')}: its agreement in force is ${r.agreement}, as Agreements read it.`, tone: 'ok' },
        { text: `${names(member)} is a party of it: ${parties.length} part${parties.length === 1 ? 'y' : 'ies'} in all.` },
        { text: 'Edubba holds none of its keys: it shows what its agreement says and what it posts, and signs nothing for it.', tone: 'warn' },
      ],
      acts: [id],
    };
  }

  /** Names for identities: the desk's, then the collective client's. */
  private names(): (id: string) => string {
    const d = this.desk.book();
    const c = this.store.names();
    return (id: string) => {
      const i = d.identities.find((x) => x.id === id);
      return i ? `${i.name} [${short(id)}]` : c(id);
    };
  }

  /** What its agreement in force says, for a collective brought here: read only, nothing can be signed for it here. */
  private async broughtPermissions(b: BroughtCollective) {
    const names = this.names();
    const out = { collective: b.id, name: b.name, agreement: null as string | null, you: [b.member], items: [] as { what: string; state: 'yes' | 'with others' | 'no'; lines: Line[]; needs: never[] }[], notes: [] as Line[] };
    out.notes.push({ text: 'Brought here by its ID: Edubba holds none of its keys, so nothing can be signed for it from here. This is what its agreement in force says.', tone: 'warn' });
    let r;
    try {
      r = await this.read(b.id, b.hints);
    } catch (e) {
      out.notes.push({ text: err(e).replace(/ Nothing was kept\.$/, ''), tone: 'bad' });
      return out;
    }
    out.agreement = r.agreement;
    const t = r.terms.t;
    const you = t.parties.filter((p) => p === b.member);
    out.notes.push({ text: you.length ? `${names(b.member)} is a party of it.` : `${names(b.member)} is no longer a party of its agreement in force.`, tone: you.length ? undefined : 'bad' });
    const signing = t.grammar?.signing as { form?: string; holder?: string | null; custodian?: string | null; threshold?: number; members?: string[] } | undefined;
    const keyWords = !signing
      ? 'Its key grammar could not be read.'
      : signing.form === 'one'
        ? `Its signing key is held by ${names(signing.holder!)} (Agreements rule 59, key grammar).`
        : signing.form === 'custodian'
          ? `Its signing key is held by ${names(signing.custodian!)}, as custodian (Agreements rule 59).`
          : `Its signing key is held as a threshold: any ${signing.threshold} of ${(signing.members ?? []).map(names).join(', ')} (Agreements rule 59).`;
    for (const [what, kinds] of [
      ['Post a text for it', [[SPECS.text, 0, 'a text']]],
      ['Post a picture for it', [[SPECS.envelopes, 0, 'a picture’s publication'], [SPECS.text, 0, 'the text showing it']]],
    ] as [string, [string, number, string][]][]) {
      const lines: Line[] = [{ text: `${keyWords} It is not held here: Edubba cannot sign for it.` }];
      for (const [spec, type, label] of kinds) {
        const areas = t.areas.filter((x) => x.kinds.some((k) => (k.form === 'layer' && k.layer === 1) || (k.form === 'type' && k.spec === spec && k.type === type)));
        if (!areas.length) lines.push({ text: `No area reaches ${label}: it counts on the collective’s own signature (Agreements rule 60).` });
        for (const x of areas)
          lines.push({
            text: `The “${x.name}” area reaches ${label}: any ${x.threshold} of ${x.holders.map(names).join(', ')} must sign (Agreements rule 60).${x.holders.includes(b.member) ? ' You hold this area.' : ''}${r.frozen.includes(x.id) ? ' It stands frozen (rule 71).' : ''}`,
          });
      }
      out.items.push({ what, state: 'no', lines, needs: [] });
    }
    return out;
  }

  /** The list on top of the Collectives tab: each collective by its ID and the name given here. */
  list(): { id: string; name: string; closed: boolean; members: number; brought?: boolean }[] {
    return [...this.held(), ...this.brought().map((x) => ({ id: x.id, name: x.name, closed: false, members: 0, brought: true }))];
  }

  private held(): { id: string; name: string; closed: boolean; members: number }[] {
    return this.store.book().collectives.map((x) => {
      try {
        const c = this.store.collective(x.id);
        return { id: x.id, name: x.name, closed: !!c.f.closed, members: c.f.members.length };
      } catch {
        return { id: x.id, name: x.name, closed: false, members: 0 };
      }
    });
  }

  /**
   * Its latest constitutional agreement (the agreement in force, as
   * Agreements read it from its relays and homes), in plain words: the
   * deal-assessment tool's reading, its flags each with the rule it rests on.
   */
  async constitution(collective: string) {
    this.places();
    const b = this.broughtOne(collective);
    if (b) {
      const r = await this.read(collective, b.hints);
      const g = await gather(r.agreement, r.hints, this.desk.settings().via, this.names());
      const a = assess(g.payload, this.names(), g.found);
      return { agreement: r.agreement, inForce: true, note: 'Read from its relays and homes: Edubba holds none of its keys.', ...a, plain: a.plain.map((p) => ({ ...p, text: escapeControls(p.text) })) };
    }
    const c = this.store.collective(collective);
    const names = this.store.names();
    const ag = await this.actions.agreementsOf(c);
    const id = ag.agreement ?? c.f.agreement;
    let found = null;
    let payload = ag.terms?.payload ?? null;
    try {
      const g = await gather(id, [...new Set([...c.f.relays, ...this.store.settings().relays, ...this.store.settings().homes.map((h) => h.hint)])], this.store.settings().via, names);
      found = g.found;
      payload = g.payload;
    } catch (e) {
      if (!payload) throw new Error(`Its agreement ${short(id)} was not found: ${err(e)}`);
    }
    const a = assess(payload!, names, found);
    return {
      agreement: id,
      inForce: !!ag.agreement,
      note: ag.agreement ? null : `Agreements' reading could not be had (${ag.broken ?? ag.unread ?? 'nothing found'}): this is the agreement this device holds in force.`,
      ...a,
      plain: a.plain.map((p) => ({ ...p, text: escapeControls(p.text) })),
    };
  }

  permissions(collective: string) {
    this.places();
    const b = this.broughtOne(collective);
    if (b) return this.broughtPermissions(b);
    return this.actions.permissions(collective);
  }

  /** The collective's own posts, as the site's feed reads them (it shown as an identity). */
  async posts(collective: string): Promise<{ items: { id: string; text: string; standing: string; pictures: string[] }[]; problems: string[] }> {
    this.places();
    const b = this.broughtOne(collective);
    const s = this.store.settings();
    const places = b ? this.hints(b.hints) : (() => {
      const c = this.store.collective(collective);
      return [...new Set([...c.f.relays, ...s.relays, ...s.homes.map((h) => h.hint), ...c.f.identity.homes.map((h) => h.hint)])];
    })();
    try {
      const f = await readFeed([{ identity: collective, name: null }], places, b ? this.desk.settings().via : s.via);
      return {
        items: f.posts.map((x) => ({
          id: x.id,
          text: escapeControls(x.post?.text ?? ''),
          standing: x.post?.standing ?? x.problem ?? 'unknown',
          pictures: (x.post?.refs ?? []).flatMap((r) => (r.kind === 'picture' && r.bytes ? [`data:image/jpeg;base64,${Buffer.from(r.bytes).toString('base64')}`] : [])),
        })),
        problems: f.authors.filter((a) => a.problem).map((a) => a.problem!),
      };
    } catch (e) {
      return { items: [], problems: [err(e)] };
    }
  }
}
