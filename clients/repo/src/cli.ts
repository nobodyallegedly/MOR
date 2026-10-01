#!/usr/bin/env -S node --import tsx
// mor-repo: the test collective and releases of the code, from the command
// line (roadmap step 5a). Test collectives only: every key and share is in
// the collective's file.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TestIdentity, type Home } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { hex } from '../../genesis/src/core.ts';
import { TestCollective, governanceText, type Governance } from './collective.ts';
import { compareWithTree, gitFiles, gitSource, publishRelease, signRelease, verifyRelease, type Verified } from './release.ts';

const HELP = `mor-repo: MOR governs its own code. A test collective publishes releases
as signed manifests; anyone fetches one and verifies every file.

A TEST COLLECTIVE HOLDS EVERY KEY IN SOFTWARE, in its file: its everyday key
and every member's share of its safety key. A prototype, never for a real
collective. Keep the file secret. Members are test identities made with the
genesis client (clients/genesis: mor-genesis new).

  found --file C --member M.json [--member M.json ...] --home URL [--home URL ...]
        --relay URL [--relay URL ...] [--safety K] [--release K] [--clone K] [--scheme 2|3]
        Found a collective: the first member proposes the founding agreement,
        every member signs it, the safety key is dealt as shares (any K of the
        members; default 2), and the collective's genesis declares the
        agreement. A release needs --release K members' signatures (default 2).
  change --file C --stay M.json [--stay M.json ...] [--join M.json ...] [--leave ID ...]
        Members leave and join: a clone of the agreement, proposed by the first
        --stay member and signed by every --stay and --join member, then a
        rotation of the collective declaring it, signed with the safety key
        rebuilt from the staying members' shares, the next key dealt to the new
        members only. If one is pending, resend it.
  release --file C --version V [--name N] [--root DIR]
        Publish every file git tracks under DIR (default: this repository) as a
        release of the collective. It counts once enough members sign it.
  sign --member M.json --release ID --at URL [--at URL ...] [--against DIR]
        As a member: fetch the release, check every file (and, with --against,
        compare them with a checkout), show it, then sign it.
  verify ID --at URL [--at URL ...] [--collective ID] [--out DIR] [--against DIR]
        As anyone, on any machine: fetch a release and verify it: the
        collective's chain, the member signatures its founding agreement
        requires, then every file against its hash. --out writes the files.
  show --file C

Every command takes --via URL=LOCAL to reach an address another way (for
example the onion home at its local port, on the machine that runs it).`;

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      (opts[k] ??= []).push(k === 'help' ? 'true' : argv[++i]);
    } else pos.push(a);
  }
  return { pos, opts };
}

const root = new URL('../../../', import.meta.url).pathname;

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, opts } = parse(rest);
  const one = (k: string) => opts[k]?.[0];
  const need = (k: string) => {
    const v = one(k);
    if (!v) throw new Error(`--${k} is required`);
    return v;
  };
  const num = (k: string, d: number) => (one(k) ? Number(one(k)) : d);
  const via: Via = {};
  for (const v of opts.via ?? []) {
    const [from, to] = v.split('=');
    via[from] = to;
  }
  const member = (path: string) => TestIdentity.load(path, via);

  switch (cmd) {
    case 'found': {
      const file = need('file');
      if (existsSync(file)) throw new Error(`${file} exists`);
      const paths = opts.member ?? [];
      if (paths.length < 2) throw new Error('a collective has at least two members (--member)');
      const members = paths.map(member);
      const homes: Home[] = [];
      for (const hint of opts.home ?? []) {
        const info = await relayAt(hint, via).info();
        const op = info.get(0);
        if (!(op instanceof Uint8Array)) throw new Error(`${hint} declares no operator`);
        homes.push({ operator: hex(op), hint });
      }
      if (!homes.length) throw new Error('--home is required');
      const relays = opts.relay ?? homes.map((h) => h.hint);
      const k = num('safety', 2);
      const rules = {
        safetyThreshold: k,
        releaseThreshold: num('release', 2),
        cloneThreshold: num('clone', 2),
        abandonmentOthers: members.length - 1,
      };
      const governance: Governance = { ...rules, text: governanceText(rules) };
      console.log('The founding agreement, as every member signs it:\n');
      console.log(governance.text + '\n');
      const got = await TestCollective.found({
        members,
        homes,
        relays,
        governance,
        scheme: (num('scheme', 2) as 2 | 3),
        via,
      });
      got.collective.save(file);
      paths.forEach((p, i) => members[i].save(p));
      console.log(`collective ${got.collective.identity}`);
      console.log(`founding agreement ${got.agreement}, signed by ${got.signed.length} members`);
      console.log(`safety key dealt: any ${k} of ${members.length}; dealing ${got.collective.f.safety.fingerprint}`);
      for (const s of got.sent) console.log(`  ${s.home}: ${s.result?.receipt ? 'receipt' : `refused (${s.code ?? '?'}) ${s.error ?? ''}`}`);
      break;
    }
    case 'change': {
      const file = need('file');
      const c = TestCollective.load(file, via);
      if (!c.f.pending) {
        const stayPaths = opts.stay ?? [];
        const joinPaths = opts.join ?? [];
        const stay = stayPaths.map(member);
        const join = joinPaths.map(member);
        const leave = new Set(opts.leave ?? []);
        const members = [...c.f.members.filter((x) => !leave.has(x)), ...join.map((j) => j.id)];
        for (const s of stay) if (!c.f.members.includes(s.id)) throw new Error(`${s.id} is not a member`);
        const got = await c.changeMembers({
          members,
          proposer: stay[0],
          signers: [...stay, ...join],
          rebuilders: stay.map((s) => s.id),
        });
        c.save(file);
        stayPaths.forEach((p, i) => stay[i].save(p));
        joinPaths.forEach((p, i) => join[i].save(p));
        console.log(`clone ${got.clone}\nrotation ${got.rotation}`);
      } else {
        await c.id.submitRotation();
      }
      const counts = await c.settle();
      c.save(file);
      console.log(counts ? `the change counts; members: ${c.f.members.join(', ')}` : 'pending: run the same command again once the homes are back');
      break;
    }
    case 'release': {
      const file = need('file');
      const c = TestCollective.load(file, via);
      const dir = resolve(one('root') ?? root);
      const files = gitFiles(dir);
      const p = await publishRelease(c, {
        name: one('name') ?? 'MOR',
        version: need('version'),
        files,
        source: gitSource(dir),
        via,
      });
      c.save(file);
      console.log(`release ${p.id}`);
      console.log(`${p.manifest.files.length} files (${p.uploaded} new), ${p.manifest.dependencies.length} dependencies, previous ${p.manifest.previous ?? 'none'}`);
      for (const r of p.refused) console.log(`  refused: ${r}`);
      console.log(`It counts once ${c.f.governance.releaseThreshold} members sign it: mor-repo sign --member M.json --release ${p.id} --at ${c.f.relays[0]}`);
      break;
    }
    case 'sign': {
      const path = need('member');
      const m = member(path);
      const id = need('release');
      const at = opts.at ?? [];
      const v = await verifyRelease(id, at, { via });
      const onlyUnsigned = v.problems.every((p) => p.startsWith('not a release:'));
      report(v);
      if (!v.manifest || !onlyUnsigned) throw new Error('not signed: the release does not check');
      if (one('against')) {
        const cmp = compareWithTree(v.manifest, resolve(one('against')!));
        console.log(`against ${one('against')}: ${cmp.same} the same, ${cmp.differ.length} differ, ${cmp.missing.length} missing`);
        for (const d of [...cmp.differ, ...cmp.missing]) console.log(`  ${d}`);
        if (cmp.differ.length || cmp.missing.length) throw new Error('not signed: the release differs from your checkout');
      }
      const s = await signRelease(m, id, at);
      m.save(path);
      console.log(`signed: ${s.id}`);
      break;
    }
    case 'verify': {
      const id = pos[0];
      if (!id) throw new Error('which release?');
      const v = await verifyRelease(id, opts.at ?? [], { via, out: one('out'), collective: one('collective') });
      report(v);
      if (v.manifest && one('against')) {
        const cmp = compareWithTree(v.manifest, resolve(one('against')!));
        console.log(`against ${one('against')}: ${cmp.same} the same, ${cmp.differ.length} differ, ${cmp.missing.length} missing`);
        for (const d of [...cmp.differ, ...cmp.missing]) console.log(`  ${d}`);
      }
      if (!v.ok) process.exitCode = 1;
      break;
    }
    case 'show': {
      const c = TestCollective.load(need('file'), via);
      console.log(JSON.stringify({
        collective: c.identity,
        members: c.f.members,
        signingHolder: c.f.signingHolder,
        agreement: c.f.agreement,
        agreements: c.f.agreements,
        safety: { index: c.f.safety.index, threshold: c.f.safety.threshold, fingerprint: c.f.safety.fingerprint },
        relays: c.f.relays,
        releases: c.f.releases.map((r) => ({ id: r.id, version: r.version })),
        pending: !!c.f.pending,
      }, null, 2));
      break;
    }
    default:
      console.log(HELP);
  }
}

function report(v: Verified) {
  console.log(`release ${v.release}`);
  if (v.collective) console.log(`  by ${v.collective}`);
  if (v.manifest) {
    const m = v.manifest;
    console.log(`  ${m.name} ${m.version}, ${m.files.length} files, ${m.dependencies.length} dependencies, previous ${m.previous ?? 'none'}${m.source ? `, from ${m.source}` : ''}`);
  }
  if (v.agreement) console.log(`  under agreement ${v.agreement}: ${v.rule}`);
  console.log(`  signed by ${v.signers.length ? v.signers.join(', ') : 'no member'}`);
  console.log(`  ${v.checked} files checked against their hashes`);
  for (const p of v.problems) console.log(`  PROBLEM: ${p}`);
  console.log(v.ok ? 'VERIFIED' : 'NOT VERIFIED');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
