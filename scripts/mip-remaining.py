#!/usr/bin/env python3
"""Every "MIP" left in the repository, each with the reason it stays (F269).

    python3 scripts/mip-remaining.py            the summary, one line per reason
    python3 scripts/mip-remaining.py --all      every remaining line, with its reason

After the rename pass (docs/mir-rename-pass.md), a core text is a MIR and the six
together are the MICS; "MIP" means only a proposal toward MOR 2. This script
reads every file git tracks and finds the word MIP, MIPs, MIPS, Mips or mips,
alone or inside a name (`MIP-identity-draft-12.md`, `with_mips`), but never
inside cMIP or cmip, which keep their name. Each hit must match one reason
below. A hit no reason covers is printed as UNJUSTIFIED and the script fails,
so a "MIP" written later into a current text is caught.
"""
import re
import subprocess
import sys

# A MIP word, not inside cMIP or cmip, and not the CPU name mips64el.
WORD = re.compile(r'(?<![cC])(?<![A-Za-z])(MIPS|MIPs|MIP|Mips|mips|mip)(?![a-z0-9])|(?<=_)mips?\b|(?<![cC])MIP(?=-)')

# (path pattern, line pattern or None, reason). The first that matches wins.
REASONS = [
    # Records: never edited (CLAUDE.md; F212; F269, rule 5 of the pass).
    (r'^docs/findings/', None, 'record: the findings log'),
    (r'^docs/reviews/', None, 'record: a review'),
    (r'^docs/two-rounds/', None, 'record: an earlier round'),
    (r'^docs/marks/', None, 'record'),
    (r'^docs/(?!(README|roadmap-v1|build-brief-v1|07-MOR-in-one-page-v11|adversarial-test-plan-v4|project-lead-prompt-v3|mir-rename-pass)\.md$)[^/]+\.md$', None,
     'record: a dated report, or an earlier version of a document'),
    (r'^docs/mir-rename-pass\.md$', None, "this pass's own report, which names the old word"),
    (r'^scripts/mip-remaining\.py$', None, 'this script, which names the word it looks for'),
    # Superseded drafts keep their text under the new names (F269, rule 5).
    (r'^spec/(MIR-(identity-draft-11|text-draft-6|envelopes-draft-7|money-draft-6|agreements-draft-10|development-draft-6)|02-MOR-MICS-v21|03-MOR-freeze-test-suite-v21)\.md$', None,
     'superseded draft, its text kept as approved'),
    (r'^spec/(MIP-[a-z]+-draft-\d+|02-MOR-core-v\d+)\.md$', None, 'a one-line pointer at an old file name'),
    (r'^spec/README\.md$', r'renamed on 1[02] October 2026', "the rename notes: old file names, and the word's new meaning"),
    (r'^spec/02-MOR-MICS-v22\.md$', r'^\| MIP \| Reserved for proposals toward MOR 2', "the glossary's MIP: reserved for MOR 2's proposals"),
    (r'^spec/(02-MOR-MICS-v22|03-MOR-freeze-test-suite-v22)\.md$', r'^\*(Version|Revised)', 'a dated version note: a record inside a current text'),
    (r'^spec/MIR-text-draft-7\.md$', r'^\*Older texts mostly cite', "a quotation of older texts' citations"),
    (r'^docs/07-MOR-in-one-page-v11\.md$', r'^\*Companion document, version 11', 'its own version note, quoting the old word'),
    (r'^docs/roadmap-v1\.md$', r'^\*(Done|Built|Second pass|Human test|Onto main|Doors on the site)', 'roadmap: a dated entry of a step done (a record)'),
    (r'^docs/roadmap-v1\.md$', r'(This step writes X-Wing|Build \(the six MIPs|^\(g\) |After the first two Nostr|Where the acknowledgement guarantee|His rules do not outlive)',
     'roadmap: a step done or a decision taken, in the words of its day (a record)'),
    # Earlier versions of current documents keep their words.
    (r'^docs/case-studies/(04-.*-v3|08-.*-v[23]|09-.*-v[23]|10-.*-v[23]|11-.*-v1|15-.*-v2|16-.*-v[12]|19-.*-v2|20-.*-v[1-4])\.md$', None, 'an earlier version of a case study'),
    (r'^cmips/cmip-(conversion-draft-1|relay-transport-draft-2|release-manifest-draft-1|website-draft-[234])\.md$', None, 'an earlier draft of a cMIP'),
    (r'^cmips/cmip-website-draft-5\.md$', r'^\*Draft [1-4],', "a dated note of an earlier draft, kept in the latest one"),
    # Outside this pass's list: left as written, questions in the report.
    (r'^docs/paper/', None, "outside the pass's list: the paper (a question in the report)"),
    (r'^docs/adversarial-test-plan-v4\.md$', None, "outside the pass's list: the adversarial test plan (a question in the report)"),
    (r'^docs/project-lead-prompt-v3\.md$', None, "outside the pass's list: the project lead's prompt, which the author keeps (a question in the report)"),
    # Bytes that must not change.
    (r'^core/vectors/[^/]+\.json$', None, 'a published test vector: byte for byte unchanged'),
    (r'^core/examples/gen_vectors\.rs$', r'"description":', "the vector generator's description, written into a published vector"),
    (r'^clients/site/built/', None, 'the released display client: rebuilt and released after the merge, not by this pass'),
    (r'^core/tests/data/NormalizationTest-', r'HANGUL SYLLABLE MIP', "Unicode's own test data: a Korean syllable's name"),
]


def tracked():
    out = subprocess.run(['git', 'ls-files', '-z'], capture_output=True, check=True).stdout
    return [p for p in out.decode().split('\0') if p]


def main():
    show_all = '--all' in sys.argv[1:]
    counts, bad = {}, []
    for path in tracked():
        if path.endswith('package-lock.json'):
            continue
        try:
            text = open(path, 'rb').read().decode('latin-1')
        except (IsADirectoryError, FileNotFoundError):
            continue
        for n, line in enumerate(text.split('\n'), 1):
            if not WORD.search(line):
                continue
            reason = next((r for p, l, r in REASONS if re.search(p, path) and (l is None or re.search(l, line))), None)
            if reason is None:
                bad.append(f'{path}:{n}: {line.strip()[:160]}')
                continue
            counts[reason] = counts.get(reason, 0) + 1
            if show_all:
                print(f'{path}:{n}: [{reason}] {line.strip()[:160]}')
    for r, c in sorted(counts.items(), key=lambda x: -x[1]):
        print(f'{c:6d}  {r}')
    for b in bad:
        print('UNJUSTIFIED ' + b)
    print(f'{sum(counts.values())} lines justified, {len(bad)} unjustified')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
