// A fake of Anthropic's Messages API on a local port, for "ask about this
// deal": no network, no real key. It records each request and answers with
// what the test tells it to.

import { createServer, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface Seen {
  path: string;
  headers: IncomingHttpHeaders;
  body: any;
}

export interface Reply {
  status: number;
  body: unknown;
}

/** A Messages API response carrying `out` as its JSON text. */
export function answering(out: unknown, extra: Record<string, unknown> = {}): Reply {
  return {
    status: 200,
    body: {
      id: 'msg_fake',
      type: 'message',
      role: 'assistant',
      model: 'claude-opus-5-5',
      content: [{ type: 'thinking', thinking: '', signature: 'x' }, { type: 'text', text: typeof out === 'string' ? out : JSON.stringify(out) }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
      ...extra,
    },
  };
}

/** A Messages API response asking for tools: each `[name, input]` a tool_use block (H21's agents reading acts). */
export function usingTools(uses: [string, Record<string, unknown>][]): Reply {
  return {
    status: 200,
    body: {
      id: 'msg_fake_tools',
      type: 'message',
      role: 'assistant',
      model: 'claude-opus-5-5',
      content: [{ type: 'thinking', thinking: '', signature: 'x' }, ...uses.map(([name, input], i) => ({ type: 'tool_use', id: `toolu_fake_${i}`, name, input }))],
      stop_reason: 'tool_use',
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    },
  };
}

/** An API error response. */
export const failing = (status: number, type: string, message: string): Reply => ({ status, body: { type: 'error', error: { type, message } } });

export interface Fake {
  url: string;
  seen: Seen[];
  /** What the next requests get. */
  reply: Reply;
  /** Replies given first, one per request, before `reply` (a conversation of several turns). */
  queue: Reply[];
  stop(): Promise<void>;
}

export async function fakeApi(): Promise<Fake> {
  const fake = { seen: [] as Seen[], queue: [] as Reply[], reply: answering({ answer: '', restsOn: [], notClaimed: [] }) } as Fake;
  const server = createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      fake.seen.push({ path: req.url ?? '', headers: req.headers, body: raw ? JSON.parse(raw) : null });
      const r = fake.queue.shift() ?? fake.reply;
      res.writeHead(r.status, { 'content-type': 'application/json', 'request-id': 'req_fake' });
      res.end(JSON.stringify(r.body));
    });
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  fake.url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  fake.stop = () => new Promise<void>((ok) => server.close(() => ok()));
  return fake;
}
