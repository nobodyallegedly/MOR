// The mirror (F287, decided by Nobody, allegedly, 13 October 2026: "Ideally
// A"): bugs and attacks are reported on MOR, to a public reporting identity,
// each report a signed act kept and answered in the open; GitHub issues are a
// mirror for those not on MOR yet.
//
// One way, MOR to GitHub: each public report, checked, has one issue, its
// body the report's words with its act id and signer; each public answer of
// the reporting identity is added to the issue it answers as a comment, once.
// The other way, GitHub to MOR: an issue opened on GitHub, not by the mirror,
// and not yet answered on MOR, is listed for the reporting identity to answer
// there. Nothing is ever signed here: the tool holds no key.
//
// What the mirror has done is read back from GitHub each time (its own
// issues and comments, each ending with the act id it carries), so a run
// interrupted half-way, or run from another computer, never mirrors twice.

import type { GitHub, Issue } from './github.ts';
import type { Held, Signed } from './read.ts';

export const LABEL = 'reported on MOR';
export const LABEL_DESCRIPTION = 'A report made on MOR to the reporting identity, mirrored here';
export const READER = 'https://reader.dubsar.org/#';

const REPORT_MARK = /^<!-- mor-report ([0-9a-f]{64}) -->$/;
const ANSWER_MARK = /^<!-- mor-answer ([0-9a-f]{64}) -->$/;
const lastLine = (body: string) => body.trimEnd().split('\n').at(-1) ?? '';

/** The words in a fenced block GitHub shows as they are: no link, mention, picture or markup of the writer's is acted on. */
export function fenced(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((r) => r.length));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}text\n${text}\n${fence}`;
}

/** An issue's title: the report's first line of words, at most 80 characters. */
export function titleOf(r: Signed): string {
  const first = r.text.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).find((l) => l) ?? '';
  if (!first) return `A report on MOR, ${r.id.slice(0, 12)}`;
  return first.length > 80 ? `${first.slice(0, 79)}…` : first;
}

export function reportBody(r: Signed, reporting: string): string {
  return [
    'A report made on MOR to the reporting identity, mirrored here. Its words are below, exactly as signed. It is kept, and answered, on MOR; each answer there is added here as a comment.',
    '',
    `- **Act:** \`${r.id}\` (on the web reader: ${READER}${r.id})`,
    `- **Signed by:** \`${r.signer}\``,
    `- **To:** \`${reporting}\`, the reporting identity`,
    "- **Checked:** valid through its signer's identity chain, by MOR's core library, when it was mirrored.",
    '',
    fenced(r.text),
    '',
    `<!-- mor-report ${r.id} -->`,
  ].join('\n');
}

export function answerBody(a: Signed, answers: string): string {
  return [
    'Answered on MOR by the reporting identity. Its words, exactly as signed:',
    '',
    `- **Act:** \`${a.id}\` (on the web reader: ${READER}${a.id})`,
    `- **Signed by:** \`${a.signer}\`, the reporting identity; valid through its identity chain when it was mirrored.`,
    `- **Answers:** ${answers}`,
    '',
    fenced(a.text),
    '',
    `<!-- mor-answer ${a.id} -->`,
  ].join('\n');
}

/** Whether an answer's words carry this issue's address (and not a longer number). */
export function namesIssue(text: string, issue: Issue): boolean {
  if (!issue.url) return false;
  const url = issue.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${url}(?![0-9])`, 'i').test(text);
}

export type Step =
  | { do: 'open'; report: Signed; title: string; body: string }
  | { do: 'update'; report: Signed; issue: number; title: string; body: string }
  | { do: 'comment'; answer: Signed; issue: number | { report: string }; body: string };

export interface Plan {
  steps: Step[];
  /** Reports already mirrored and unchanged. */
  kept: number;
  /** Issues opened on GitHub, not by the mirror, still open and not answered on MOR: for the reporting identity to answer there. */
  waiting: Issue[];
  /** Answers naming no report or issue the mirror knows (a post of its own, or an answer to a private report). */
  unplaced: number;
}

/**
 * What the mirror would do, from what MOR holds and what GitHub shows.
 * Only issues and comments written by the mirror's own account, ending with
 * an act id, count as mirrored: anyone else's carrying the same line is an
 * issue like any other.
 */
export async function plan(held: Held, reporting: string, gh: GitHub): Promise<Plan> {
  const me = await gh.me();
  const issues = await gh.issues();
  const byReport = new Map<string, Issue>();
  const others: Issue[] = [];
  for (const i of issues) {
    const m = i.author === me ? REPORT_MARK.exec(lastLine(i.body)) : null;
    if (m && !byReport.has(m[1])) byReport.set(m[1], i);
    else if (!m) others.push(i);
  }
  const steps: Step[] = [];
  let kept = 0;
  for (const r of held.reports) {
    const title = titleOf(r);
    const body = reportBody(r, reporting);
    const i = byReport.get(r.id);
    if (!i) steps.push({ do: 'open', report: r, title, body });
    else if (i.title !== title || i.body.trimEnd() !== body) steps.push({ do: 'update', report: r, issue: i.number, title, body });
    else kept++;
  }

  // Answers already added, per issue, read once per issue that may get one.
  const reports = new Set(held.reports.map((r) => r.id));
  const answered = new Map<number, Set<string>>();
  const done = async (n: number) => {
    let s = answered.get(n);
    if (!s) {
      s = new Set((await gh.comments(n)).filter((c) => c.author === me).flatMap((c) => ANSWER_MARK.exec(lastLine(c.body))?.[1] ?? []));
      answered.set(n, s);
    }
    return s;
  };
  const onMor = new Set<number>();
  let unplaced = 0;
  for (const a of held.answers) {
    let placed = false;
    for (const ref of a.refs) {
      if (!reports.has(ref)) continue;
      placed = true;
      const i = byReport.get(ref);
      const body = answerBody(a, `the report \`${ref}\` above`);
      if (!i) steps.push({ do: 'comment', answer: a, issue: { report: ref }, body });
      else if (!(await done(i.number)).has(a.id)) steps.push({ do: 'comment', answer: a, issue: i.number, body });
    }
    for (const i of others) {
      if (!namesIssue(a.text, i)) continue;
      placed = true;
      onMor.add(i.number);
      if (!(await done(i.number)).has(a.id)) steps.push({ do: 'comment', answer: a, issue: i.number, body: answerBody(a, 'this issue, by its address') });
    }
    if (!placed) unplaced++;
  }
  const waiting = others.filter((i) => i.state === 'open' && !onMor.has(i.number));
  return { steps, kept, waiting, unplaced };
}

/** Carry the plan out on GitHub, in order; each line said as it is done. */
export async function apply(p: Plan, gh: GitHub, say: (line: string) => void): Promise<void> {
  if (p.steps.some((s) => s.do === 'open')) await gh.label(LABEL, LABEL_DESCRIPTION);
  const opened = new Map<string, number>();
  for (const s of p.steps) {
    if (s.do === 'open') {
      const i = await gh.open(s.title, s.body, [LABEL]);
      opened.set(s.report.id, i.number);
      say(`Opened issue #${i.number} for the report ${s.report.id.slice(0, 12)}…: ${i.url}`);
    } else if (s.do === 'update') {
      await gh.update(s.issue, s.title, s.body);
      say(`Updated issue #${s.issue} to the report ${s.report.id.slice(0, 12)}… as signed.`);
    } else {
      const n = typeof s.issue === 'number' ? s.issue : opened.get(s.issue.report);
      if (n === undefined) continue; // its report's issue was not opened
      await gh.comment(n, s.body);
      say(`Added the answer ${s.answer.id.slice(0, 12)}… to issue #${n}.`);
    }
  }
}
