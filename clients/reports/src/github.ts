// The GitHub side of the mirror: the token, found as the desk finds its
// Anthropic key (an environment variable, or a file in the home folder,
// never a file inside the repository), and the few calls of GitHub's REST
// API the mirror makes. The token is sent as a header and nowhere else; every
// error is said plainly with the token scrubbed from it, and it is never
// printed.

import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The environment variable read first. */
export const TOKEN_ENV = 'MOR_GITHUB_TOKEN';
/** Where the token is looked for otherwise, under the user's home. */
export const TOKEN_FILE = join('.config', 'mor', 'github-token');
/** GitHub's API, unless MOR_GITHUB_API names another (the tests' fake). */
export const API = 'https://api.github.com';

const REPO = fileURLToPath(new URL('../../..', import.meta.url));

export class GitHubError extends Error {}

/** Whether a path lies inside the repository, where it could be committed. */
export function insideRepository(path: string): boolean {
  let real = resolve(path);
  let repo = resolve(REPO);
  try {
    real = realpathSync(real);
    repo = realpathSync(repo);
  } catch {
    // not there yet: compare as given
  }
  const r = relative(repo, real);
  return r === '' || (!r.startsWith('..') && !isAbsolute(r));
}

/** The token and where it was found (never the token itself, which is not to be shown). */
export interface Token {
  token: string;
  from: string;
  warning: string | null;
}

/** The token: the environment variable, else the file in the home folder. Throws plainly if there is none. */
export function findToken(env: NodeJS.ProcessEnv = process.env, home = env.HOME || homedir()): Token {
  const fromEnv = env[TOKEN_ENV]?.trim();
  if (fromEnv) return { token: fromEnv, from: TOKEN_ENV, warning: null };
  const file = join(home, TOKEN_FILE);
  if (insideRepository(file)) throw new GitHubError(`The token file ${file} is inside the repository, where it could be committed. Move it out of the repository; nothing was sent.`);
  if (!existsSync(file)) {
    throw new GitHubError(`No GitHub token, so nothing was sent. Set ${TOKEN_ENV}, or put the token alone in ${join('~', TOKEN_FILE)} (clients/reports/README.md says how).`);
  }
  const token = readFileSync(file, 'utf8').trim();
  if (!token) throw new GitHubError(`The token file ${file} is empty, so nothing was sent.`);
  let warning: string | null = null;
  if (process.platform !== 'win32' && (statSync(file).mode & 0o077) !== 0) warning = `The token file ${file} can be read by other users of this computer; “chmod 600 ${file}” makes it yours alone.`;
  return { token, from: file, warning };
}

/** The text with every occurrence of the token replaced. */
export function redact(text: string, token: string): string {
  return token ? text.split(token).join('[the GitHub token]') : text;
}

export interface Issue {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
  author: string;
}

export interface Comment {
  id: number;
  body: string;
  author: string;
}

type Json = Record<string, unknown>;

/** The calls the mirror makes, for one repository ("owner/name"). */
export class GitHub {
  private login: string | null = null;
  constructor(
    private token: string,
    readonly repository: string,
    private api: string = process.env.MOR_GITHUB_API || API,
  ) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new GitHubError(`“${repository}” is not a repository's name (owner/name).`);
  }

  private async call(method: string, path: string, body?: Json): Promise<{ status: number; json: unknown }> {
    let r: Response;
    try {
      r = await fetch(this.api + path, {
        method,
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${this.token}`,
          'x-github-api-version': '2022-11-28',
          'user-agent': 'mor-reports',
          ...(body ? { 'content-type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new GitHubError(redact(`GitHub could not be reached (${e instanceof Error ? e.message : String(e)}).`, this.token));
    }
    const text = await r.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    if (!r.ok && r.status !== 404) {
      const said = json && typeof json === 'object' && typeof (json as Json).message === 'string' ? (json as Json).message : text.slice(0, 200);
      const why = r.status === 401 ? 'it refused the token (is it whole, and still valid?)' : r.status === 403 ? 'it refused this token permission, or a limit was reached' : `it answered ${r.status}`;
      throw new GitHubError(redact(`GitHub: ${method} ${path}: ${why}: ${said}`, this.token));
    }
    return { status: r.status, json };
  }

  /** The account the token belongs to: the mirror's own issues and comments are those it wrote. */
  async me(): Promise<string> {
    if (this.login) return this.login;
    const { status, json } = await this.call('GET', '/user');
    const login = status === 200 && json && typeof (json as Json).login === 'string' ? ((json as Json).login as string) : null;
    if (!login) throw new GitHubError('GitHub did not say whose token this is.');
    this.login = login;
    return login;
  }

  private async pages<T>(path: string, read: (x: Json) => T | null): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; ; page++) {
      const sep = path.includes('?') ? '&' : '?';
      const { status, json } = await this.call('GET', `${path}${sep}per_page=100&page=${page}`);
      if (status === 404) throw new GitHubError(`GitHub: ${path}: not found (is the repository's name right, and can the token see it?).`);
      if (!Array.isArray(json)) break;
      for (const x of json) {
        const r = read(x as Json);
        if (r) out.push(r);
      }
      if (json.length < 100) break;
    }
    return out;
  }

  /** Every issue of the repository, open or closed; pull requests left out. */
  issues(): Promise<Issue[]> {
    return this.pages(`/repos/${this.repository}/issues?state=all`, (x) =>
      x.pull_request
        ? null
        : {
            number: x.number as number,
            title: String(x.title ?? ''),
            body: String(x.body ?? ''),
            state: String(x.state ?? ''),
            url: String(x.html_url ?? ''),
            author: String((x.user as Json | null)?.login ?? ''),
          },
    );
  }

  comments(issue: number): Promise<Comment[]> {
    return this.pages(`/repos/${this.repository}/issues/${issue}/comments`, (x) => ({
      id: x.id as number,
      body: String(x.body ?? ''),
      author: String((x.user as Json | null)?.login ?? ''),
    }));
  }

  /** The label exists, made if not. */
  async label(name: string, description: string): Promise<void> {
    const { status } = await this.call('GET', `/repos/${this.repository}/labels/${encodeURIComponent(name)}`);
    if (status === 404) await this.call('POST', `/repos/${this.repository}/labels`, { name, color: '5b4636', description });
  }

  async open(title: string, body: string, labels: string[]): Promise<Issue> {
    const { json } = await this.call('POST', `/repos/${this.repository}/issues`, { title, body, labels });
    const x = json as Json;
    return { number: x.number as number, title, body, state: 'open', url: String(x.html_url ?? ''), author: await this.me() };
  }

  async update(issue: number, title: string, body: string): Promise<void> {
    await this.call('PATCH', `/repos/${this.repository}/issues/${issue}`, { title, body });
  }

  async comment(issue: number, body: string): Promise<void> {
    await this.call('POST', `/repos/${this.repository}/issues/${issue}/comments`, { body });
  }
}
