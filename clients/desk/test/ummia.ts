// A collective's release, made through Ummia's program (round 3: releases
// moved from Edubba to Ummia, F339, signed there with the member's own key,
// F353), for Edubba's tests: the member's identity brought into an Ummia of
// its own by its signing words, the collective added, chosen under Who acts,
// a folder released; then how it stands, as anyone reads it.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unhex } from '../../genesis/src/core.ts';
import { toWords } from '../../../modules/carry/src/carry.ts';
import { serve as serveUmmia, DOMAIN as UMMIA_DOMAIN } from '../../ummia/src/server.ts';
import { Client, newKey } from '../src/page/api.ts';

/** An Ummia for a member, its words given (or its signing secret, hex), acting for the collective. */
export async function ummiaFor(o: { id: string; words?: string; secret?: string; home: string; relays: string[]; collective: string; apps: { close(): Promise<void> }[] }) {
  const dir = join(mkdtempSync(join(tmpdir(), 'edubba-ummia-')), 'mor-ummia');
  const app = await serveUmmia({ dir, port: 0 });
  o.apps.push(app);
  const c = await Client.open(await newKey(), app.base, UMMIA_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('bring', { id: o.id, words: o.words ?? toWords(unhex(o.secret!)).join(' '), address: o.home });
  await c.ask('settings', { relays: o.relays, track: o.relays });
  await c.ask('collective add', { id: o.collective });
  await c.ask('acting', { id: o.collective });
  return {
    c,
    /** A folder of one file released for the collective; its act id. */
    async release(name: string, version: string, text: string): Promise<string> {
      const folder = join(mkdtempSync(join(tmpdir(), 'edubba-ummia-release-')), name);
      mkdirSync(folder);
      writeFileSync(join(folder, 'clay.txt'), text);
      const r = await c.ask<{ plan: string; digest: string }>('release prepare', { folder, name, version, previous: '' });
      return (await c.ask<{ acts: string[] }>('release confirm', { plan: r.plan, digest: r.digest })).acts[0];
    },
    standing: (id: string) => c.ask<{ met: boolean; lines: { text: string }[] }>('collective release standing', { id }),
    check: (id: string) => c.ask<{ ok: boolean; problems: string[] }>('release check', { id }),
  };
}
