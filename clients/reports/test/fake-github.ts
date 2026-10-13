// A fake of the few calls of GitHub's REST API the mirror makes, on a local
// port: issues, comments and labels of one repository, kept in memory. It
// answers only a request carrying the token it was given, and keeps every
// request (method, path, headers and body) for the tests to look into.

import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface FakeIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: string;
  labels: string[];
  comments: { id: number; body: string; author: string }[];
  pull?: boolean;
}

export interface Seen {
  method: string;
  path: string;
  authorization: string;
  body: string;
}

export class FakeGitHub {
  issues: FakeIssue[] = [];
  labels = new Set<string>();
  seen: Seen[] = [];
  /** When set, every call answers this status (as GitHub does when it refuses a token). */
  refuse: number | null = null;
  private server: Server;
  private next = 1;
  private nextComment = 1000;
  base = '';

  constructor(
    readonly token: string,
    readonly repository: string,
    readonly login = 'mirror-account',
  ) {
    this.server = createServer((req, res) => {
      this.handle(req)
        .then(([status, json]) => {
          res.writeHead(status, { 'content-type': 'application/json' });
          res.end(JSON.stringify(json));
        })
        .catch((e) => {
          res.writeHead(500);
          res.end(String(e));
        });
    });
  }

  async listen(): Promise<string> {
    await new Promise<void>((r) => this.server.listen(0, '127.0.0.1', r));
    this.base = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
    return this.base;
  }

  close(): Promise<void> {
    return new Promise((r) => this.server.close(() => r()));
  }

  url(n: number): string {
    return `https://github.com/${this.repository}/issues/${n}`;
  }

  /** An issue opened on GitHub by someone, not by the mirror. */
  seed(i: Partial<FakeIssue> & { title: string; author: string }): FakeIssue {
    const issue: FakeIssue = { number: this.next++, body: '', state: 'open', labels: [], comments: [], ...i };
    this.issues.push(issue);
    return issue;
  }

  private json(i: FakeIssue) {
    return {
      number: i.number,
      title: i.title,
      body: i.body,
      state: i.state,
      html_url: this.url(i.number),
      user: { login: i.author },
      labels: i.labels.map((name) => ({ name })),
      ...(i.pull ? { pull_request: { url: 'x' } } : {}),
    };
  }

  private async handle(req: IncomingMessage): Promise<[number, unknown]> {
    let body = '';
    for await (const c of req) body += c;
    const url = new URL(req.url ?? '/', 'http://x');
    this.seen.push({ method: req.method ?? '', path: url.pathname + url.search, authorization: String(req.headers.authorization ?? ''), body });
    // Refusing, it echoes what it was sent, so the test sees the token scrubbed from what is said.
    if (this.refuse) return [this.refuse, { message: `Bad credentials (${req.headers.authorization ?? ''})` }];
    if (req.headers.authorization !== `Bearer ${this.token}`) return [401, { message: 'Bad credentials' }];
    const input = body ? JSON.parse(body) : {};
    const repo = `/repos/${this.repository}`;
    const page = Number(url.searchParams.get('page') ?? '1');
    const per = Number(url.searchParams.get('per_page') ?? '30');
    const slice = <T>(xs: T[]) => xs.slice((page - 1) * per, page * per);
    const p = url.pathname;
    let m: RegExpExecArray | null;
    if (req.method === 'GET' && p === '/user') return [200, { login: this.login }];
    if (req.method === 'GET' && p === `${repo}/issues`) return [200, slice(this.issues).map((i) => this.json(i))];
    if (req.method === 'POST' && p === `${repo}/issues`) {
      const i: FakeIssue = { number: this.next++, title: input.title, body: input.body, state: 'open', author: this.login, labels: input.labels ?? [], comments: [] };
      for (const l of i.labels) if (!this.labels.has(l)) return [422, { message: `label ${l} does not exist` }];
      this.issues.push(i);
      return [201, this.json(i)];
    }
    if ((m = new RegExp(`^${repo}/issues/(\\d+)$`).exec(p))) {
      const i = this.issues.find((x) => x.number === Number(m![1]));
      if (!i) return [404, { message: 'Not Found' }];
      if (req.method === 'PATCH') {
        if (input.title !== undefined) i.title = input.title;
        if (input.body !== undefined) i.body = input.body;
      }
      return [200, this.json(i)];
    }
    if ((m = new RegExp(`^${repo}/issues/(\\d+)/comments$`).exec(p))) {
      const i = this.issues.find((x) => x.number === Number(m![1]));
      if (!i) return [404, { message: 'Not Found' }];
      if (req.method === 'POST') {
        const c = { id: this.nextComment++, body: input.body, author: this.login };
        i.comments.push(c);
        return [201, { id: c.id, body: c.body, user: { login: c.author } }];
      }
      return [200, slice(i.comments).map((c) => ({ id: c.id, body: c.body, user: { login: c.author } }))];
    }
    if (req.method === 'GET' && (m = new RegExp(`^${repo}/labels/(.+)$`).exec(p))) {
      const name = decodeURIComponent(m[1]);
      return this.labels.has(name) ? [200, { name }] : [404, { message: 'Not Found' }];
    }
    if (req.method === 'POST' && p === `${repo}/labels`) {
      this.labels.add(input.name);
      return [201, { name: input.name }];
    }
    return [404, { message: 'Not Found' }];
  }
}
