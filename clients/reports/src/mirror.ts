// The mirror (F287, decided by Nobody, allegedly, 13 October 2026: "Ideally
// A"; both ways, F289's question 6: "If we can have it bidirectional yes
// please"): bugs and attacks are reported on MOR, to a public reporting
// identity, each report a signed act kept and answered in the open; GitHub
// issues are a mirror for those not on MOR yet.
//
// MOR to GitHub: each public report, checked, has one issue, its body the
// report's words with its act id and signer; each public answer of the
// reporting identity is added to the issue it answers as a comment, once.
//
// GitHub to MOR: an issue opened on GitHub, not by the mirror, is published
// again on MOR by the reporting identity, its first line "Reported on GitHub
// by @" its author's handle, its last line the issue's address. Nothing is
// signed here: the tool holds no key. It prepares the act as a draft for the
// desk (`prepare.ts`), only for the issues the author names after reading the
// dry run, and the author signs it there, as the desk signs every draft. Once
// it is on MOR, the issue is told by a comment, and every answer naming the
// re-publication is added to the issue. An answer carrying an issue's address
// in its words still answers that issue.
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
const REPUBLISHED_MARK = /^<!-- mor-republished ([0-9a-f]{64}) -->$/;
/** The label a re-publication's first line starts with, before its author's handle. */
export const REPORTED_ON_GITHUB = 'Reported on GitHub by @';
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

/**
 * The words the reporting identity publishes again on MOR for an issue
 * opened on GitHub: "Reported on GitHub by @handle: title", the issue's
 * words, and its address as the last line. Composed as canonical text by the
 * draft (Text rule 6), which says what composing changed.
 */
export function republicationText(i: Issue): string {
  const title = i.title.replace(/\s+/g, ' ').trim();
  const body = i.body.trim();
  return [`${REPORTED_ON_GITHUB}${i.author}: ${title}`, ...(body ? ['', body] : []), '', i.url].join('\n');
}

/** Whether the reporting identity's words publish this issue again: the label first, the issue's address alone as the last line. */
export function republishes(text: string, i: Issue): boolean {
  if (!i.url) return false;
  const lines = text.split('\n');
  return lines[0].startsWith(REPORTED_ON_GITHUB) && lines.at(-1)?.trim() === i.url;
}

export function republishedBody(a: Signed, i: Issue): string {
  return [
    `Published again on MOR by the reporting identity, labelled “Reported on GitHub by @${i.author}”, with this issue's words as they were when it was signed. It is answered there; each answer is added here as a comment.`,
    '',
    `- **Act:** \`${a.id}\` (on the web reader: ${READER}${a.id})`,
    `- **Signed by:** \`${a.signer}\`, the reporting identity; valid through its identity chain when it was mirrored.`,
    '',
    `<!-- mor-republished ${a.id} -->`,
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
  /** Issues opened on GitHub, not by the mirror, still open, not yet published again nor answered on MOR: for the reporting identity to publish there. */
  waiting: Issue[];
  /** Issues published again on MOR by the reporting identity, by issue number: the re-publication's act id. */
  republished: Map<number, string>;
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
      s = new Set(
        (await gh.comments(n))
          .filter((c) => c.author === me)
          .flatMap((c) => {
            const l = lastLine(c.body);
            return ANSWER_MARK.exec(l)?.[1] ?? REPUBLISHED_MARK.exec(l)?.[1] ?? [];
          }),
      );
      answered.set(n, s);
    }
    return s;
  };
  const onMor = new Set<number>();
  // First the re-publications of issues opened on GitHub, so that answers naming them find their issue.
  const republished = new Map<number, string>();
  const issueOf = new Map<string, Issue>();
  for (const a of held.answers) {
    const i = others.find((x) => !republished.has(x.number) && republishes(a.text, x));
    if (!i) continue;
    republished.set(i.number, a.id);
    issueOf.set(a.id, i);
    onMor.add(i.number);
    if (!(await done(i.number)).has(a.id)) steps.push({ do: 'comment', answer: a, issue: i.number, body: republishedBody(a, i) });
  }
  let unplaced = 0;
  for (const a of held.answers) {
    if (issueOf.has(a.id)) continue;
    let placed = false;
    for (const ref of a.refs) {
      const from = issueOf.get(ref);
      if (from) {
        placed = true;
        if (!(await done(from.number)).has(a.id)) steps.push({ do: 'comment', answer: a, issue: from.number, body: answerBody(a, `this issue, published again on MOR as \`${ref}\``) });
        continue;
      }
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
  return { steps, kept, waiting, republished, unplaced };
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
      say(REPUBLISHED_MARK.test(lastLine(s.body)) ? `Told issue #${n} that it is published again on MOR as ${s.answer.id.slice(0, 12)}….` : `Added the answer ${s.answer.id.slice(0, 12)}… to issue #${n}.`);
    }
  }
}
