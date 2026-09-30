#!/usr/bin/env -S node --import tsx
// mor-post: the barebone client from the command line. It posts text with a
// picture, and shows posts, verified. Test identities only, made with
// mor-genesis (clients/genesis).

import { readFileSync, writeFileSync } from 'node:fs';
import { TestIdentity } from '../../genesis/src/identity.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { compose } from '../../longform/src/text.ts';
import { CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { listPosts, post, readPost, withdraw, type ShownPost } from './post.ts';
import { renderPage } from './html.ts';
import { POST_SPECS } from './specs.ts';

const HELP = `mor-post: post text with a picture, and show posts, verified.

  post --file F --relay URL [--relay URL ...] (--text T | --text-file PATH) [--jpeg PATH] [--longform]
        Post a text, and a JPEG with it. The JPEG is stripped to the picture
        alone first (location, camera data, previews, comments, hidden
        pictures: all taken out, and listed). --longform: the text is in the
        long-form format. Saves the identity file.
  show ID --relay URL [--relay URL ...] [--out page.html]
        Fetch a post, verify it and its picture, and show it.
  feed IDENTITY --relay URL [--out page.html]
        Every post of an identity at a relay, verified, oldest first.
  withdraw PUBLICATION --file F --relay URL [--relay URL ...]
        Withdraw a picture you published: readers stop showing it.

Every command takes --via URL=LOCAL to reach an address another way.`;

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const flag = ['longform', 'help'].includes(k);
      (opts[k] ??= []).push(flag ? 'true' : argv[++i]);
    } else pos.push(a);
  }
  return { pos, opts };
}

function summary(p: ShownPost): string {
  const lines = [
    `post ${p.id}`,
    `  by ${p.signer}: ${p.standing === 'valid' ? 'verified' : `NOT VERIFIED (${p.standing})`}`,
    ...p.text.split('\n').map((l) => `  | ${l}`),
  ];
  for (const r of p.refs) {
    if (r.kind === 'picture') {
      lines.push(
        r.bytes && r.picture
          ? `  picture ${r.publication}: JPEG ${r.picture.shownWidth} x ${r.picture.shownHeight}, verified` +
              (r.signer !== p.signer ? `, by ${r.signer}` : '')
          : `  picture ${r.publication}: not shown, ${r.problem}`,
      );
    } else lines.push(`  refers to ${r.id}: ${r.what}`);
  }
  return lines.join('\n');
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, opts } = parse(rest);
  const via: Via = Object.fromEntries((opts.via ?? []).map((v) => v.split('=') as [string, string]));
  const need = (k: string) => {
    const v = opts[k]?.[0];
    if (!v) throw new Error(`--${k} is needed`);
    return v;
  };
  const relays = opts.relay ?? [];
  switch (cmd) {
    case 'post': {
      if (!relays.length) throw new Error('--relay is needed');
      const file = need('file');
      const me = TestIdentity.load(file, via);
      const raw = opts.text?.[0] ?? (opts['text-file'] ? readFileSync(opts['text-file'][0], 'utf8') : null);
      if (raw === null) throw new Error('--text or --text-file is needed');
      const { text, changes } = compose(raw);
      for (const c of changes) console.log(`text: ${c}`);
      const jpeg = opts.jpeg ? new Uint8Array(readFileSync(opts.jpeg[0])) : undefined;
      const r = await post(me, { text, jpeg, relays, format: opts.longform ? POST_SPECS.longform : null });
      me.save(file);
      if (r.picture) {
        console.log(
          r.picture.removed.length
            ? `picture: removed ${r.picture.removed.map((c) => CARRIED_WORDS[c]).join('; ')}`
            : 'picture: nothing to remove',
        );
        console.log(`picture ${r.picture.id} (${r.picture.picture.shownWidth} x ${r.picture.picture.shownHeight}, ${r.picture.size} bytes)`);
      }
      console.log(`post ${r.id}`);
      return;
    }
    case 'show': {
      if (!pos[0] || !relays.length) throw new Error('usage: show ID --relay URL');
      const p = await readPost(pos[0], relays, via);
      console.log(summary(p));
      if (opts.out) writeFileSync(opts.out[0], renderPage([p], `A post by ${p.signer.slice(0, 8)}`));
      return;
    }
    case 'feed': {
      if (!pos[0] || !relays.length) throw new Error('usage: feed IDENTITY --relay URL');
      const ids = await listPosts(pos[0], relays[0], via);
      const posts: ShownPost[] = [];
      for (const id of ids) {
        const p = await readPost(id, relays, via);
        posts.push(p);
        console.log(summary(p));
      }
      if (!ids.length) console.log('no posts found there');
      if (opts.out) writeFileSync(opts.out[0], renderPage(posts, `Posts by ${pos[0].slice(0, 8)}`));
      return;
    }
    case 'withdraw': {
      if (!pos[0] || !relays.length) throw new Error('usage: withdraw PUBLICATION --file F --relay URL');
      const file = need('file');
      const me = TestIdentity.load(file, via);
      const r = await withdraw(me, pos[0], relays);
      me.save(file);
      console.log(`withdrawal ${r.id}`);
      return;
    }
    default:
      console.log(HELP);
      if (cmd && cmd !== 'help' && !opts.help) process.exit(2);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
