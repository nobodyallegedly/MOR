// Stopping what a test started, whatever the outcome (round 8, Part 4): each
// step is tried in turn, and one that fails or hangs does not leave the
// others running. The first error is reported once every step has run.

export async function stopAll(...steps: (() => unknown)[]): Promise<void> {
  let first: unknown = null;
  for (const step of steps) {
    try {
      // A step that hangs is given ten seconds, then left: the next ones still run.
      await Promise.race([Promise.resolve().then(step), new Promise((r) => setTimeout(r, 10_000).unref())]);
    } catch (e) {
      first ??= e;
    }
  }
  if (first) throw first;
}
