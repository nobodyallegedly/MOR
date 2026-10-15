// The rehearsal's checklist: each check passes or fails with one plain sentence.

export interface Check {
  area: string;
  line: string;
  ok: boolean;
  /** Why it failed, or what was seen, in a few words. */
  detail?: string;
}

export class Checklist {
  checks: Check[] = [];

  add(area: string, line: string, ok: boolean, detail?: string): void {
    this.checks.push({ area, line, ok, detail });
  }

  /** Run a check; an error is a failure, its message the detail. */
  async run(area: string, line: string, f: () => Promise<true | string> | true | string): Promise<void> {
    try {
      const r = await f();
      this.add(area, line, r === true, r === true ? undefined : r);
    } catch (e) {
      this.add(area, line, false, e instanceof Error ? e.message : String(e));
    }
  }

  merge(o: { checks: Check[] }): void {
    this.checks.push(...o.checks);
  }

  allPassed(): boolean {
    return this.checks.length > 0 && this.checks.every((c) => c.ok);
  }

  print(stopped = false): void {
    console.log('\nChecklist\n');
    this.checks.forEach((c, i) => {
      console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${String(i + 1).padStart(2)}. ${c.line}`);
      if (!c.ok && c.detail) console.log(`              ${c.detail}`);
    });
    const failed = this.checks.filter((c) => !c.ok).length;
    if (stopped) console.log(`\nThe rehearsal STOPPED before its end: it does not pass (${failed} of the ${this.checks.length} checks made failed).`);
    else console.log(failed ? `\n${failed} of ${this.checks.length} checks FAILED.` : `\nAll ${this.checks.length} checks passed: the rehearsal passes end to end.`);
  }

  json(): string {
    return JSON.stringify({ checks: this.checks });
  }
}
