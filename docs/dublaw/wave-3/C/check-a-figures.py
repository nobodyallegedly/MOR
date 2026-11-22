#!/usr/bin/env python3
"""check-a-figures.py: DubLaw wave 3, session C (Nobody, allegedly). Task 1: wave 2 A's scan, rerun, and its figures.

    python3 -I check-a-figures.py A_DIR RERUN_JSON RESEARCH_DIR INDEX_JSON OUT_JSON

1. SHA-256 of A's apps-inventory.json and of the rerun's; if they differ, every differing JSON path.
2. Every figure of A's summary (section 1), of the counts in section 2's "How it was built", and of section 3's table
   and list, compared with A's JSON (and, where this session's index counts the same thing, with it too).
3. Every file in _research newer (mtime) than A's apps-inventory.json.
"""
import hashlib, json, os, re, sys

A, RERUN, R, IDX, OUT = sys.argv[1:6]
AJ = os.path.join(A, 'apps-inventory.json')
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
a = json.load(open(AJ)); md = open(os.path.join(A, 'features-agreements.md')).read()
out = {'made': 'check-a-figures.py, DubLaw wave 3 session C', 'sha256': {'A': sha(AJ), 'rerun': sha(RERUN)}}
out['sha256']['equal'] = out['sha256']['A'] == out['sha256']['rerun']

def diff(x, y, p='$', acc=None):
    acc = [] if acc is None else acc
    if type(x) != type(y): acc.append(p); return acc
    if isinstance(x, dict):
        for k in sorted(set(x) | set(y)): diff(x.get(k), y.get(k), p + '.' + k, acc) if k in x and k in y else acc.append(p + '.' + k)
    elif isinstance(x, list):
        if len(x) != len(y): acc.append(p + ' (length)')
        for i, (u, v) in enumerate(zip(x, y)): diff(u, v, '%s[%d]' % (p, i), acc)
    elif x != y: acc.append(p)
    return acc
out['differences'] = [] if out['sha256']['equal'] else diff(a, json.load(open(RERUN)))

# ---- figures
st, F = a['stats'], a['features']
sec = lambda n: md.split('\n## %d.' % n)[1].split('\n## ')[0]
s1, s2, s3 = sec(1), sec(2), sec(3)
checks = []
def chk(where, text_value, json_value, what):
    checks.append({'where': where, 'what': what, 'document': text_value, 'json': json_value, 'agree': text_value == json_value})
num = lambda pat, s: int(re.search(pat, s).group(1))

chk('1', num(r'published (\d+) media hashes', s1), st['media_hashes'], 'media hashes published')
chk('1', num(r'plus (\d+) programs as text acts', s1), st['code_in_text_acts'], 'programs as text acts')
chk('1', num(r'(\d+) media are held', s1), st['media_held'], 'media held')
chk('1', num(r'(\d+) are not \(list in section 3\)', s1), st['media_to_fetch'], 'media not held')
chk('1', num(r'(\d+) are not \(list in section 3\)', s1), len(a['to_fetch']), 'media not held = entries of to_fetch')
media_apps = [x for x in a['apps'] if x.get('media_hash')]
chk('1', num(r'published (\d+) media hashes', s1), len({x['media_hash'] for x in media_apps}), 'media hashes = distinct media_hash in apps')
held_plus_not = st['media_held'] + st['media_to_fetch']
not_held_not_fetch = [x['media_hash'] for x in media_apps if not x.get('held') and not x.get('homes')]
checks.append({'where': '1', 'what': '130 = 26 + 103 + those neither held nor held by any home', 'document': None,
               'json': {'held+to_fetch': held_plus_not, 'neither (media hash, name, kind)': [[x['media_hash'], x['name'], x['kind']] for x in media_apps if not x.get('held') and not x.get('homes')]},
               'agree': held_plus_not + len(not_held_not_fetch) == st['media_hashes']})
chk('1', num(r'(\d+) features from players', s1), len(re.findall(r'\n### 4\.\d+ ', md)), 'features (sections 4.1 to 4.n)')
aw = F['award']
m = re.search(r'acts under it, (\d+) acts by (\d+) signers; Terms naming it, (\d+) acts by (\d+) signers', s1)
chk('1', [int(m.group(1)), int(m.group(3))], [aw['acts_under']['count'] if isinstance(aw['acts_under'], dict) else aw['acts_under'], aw['terms_naming']['count'] if isinstance(aw['terms_naming'], dict) else aw['terms_naming']], "award cMIP: acts under it, Terms naming it")
chk('1', num(r'(\w+) questions go to the MOR lead', s1.replace('Five', '5')), len(re.findall(r'\n\d+\. \*\*', sec(5))), 'questions to the MOR lead')
lo, hi = map(int, re.search(r'(\d+) to (\d+) acts each', s1).groups())
counts = []
for s in re.split(r'\n(?=### 4\.\d+ )', md.split('\n## 4. Features')[1].split('\n## 5.')[0])[1:]:
    part = s.split('- **Acts**')[1].split('- **Dubsar today')[0] if '- **Acts**' in s else ''
    c = [int(x) for x in re.findall(r'(\d+) acts by \d+ signers', part)]
    counts.append([s.split('\n')[0][4:9], c])
checks.append({'where': '1', 'what': '"2 to 19 acts each": every "N acts by M signers" in section 4 (the reading of "each" is this session\'s)', 'document': [lo, hi],
               'json': counts, 'agree': None})
chk('2', num(r'\((\d+) distinct acts', s2), st['uniqueActs'], 'distinct acts')
chk('2', num(r'(\d+) text acts\)', s2), st['textActs'], 'text acts')
chk('2', num(r'every report line naming a hash \((\d+) lines\)', s2), st['report_lines_with_hashes'], 'report lines naming a hash')

# with this session's index
idx = json.load(open(IDX))['acts']
mine = {'distinct': len(idx), 'terms': sum(1 for x in idx if x.get('terms')), 'statements': sum(1 for x in idx if x.get('statement')),
        'textActs': sum(1 for x in idx if 'text' in x), 'textActsWithNonEmptyText': sum(1 for x in idx if x.get('text')),
        'textActsWithEmptyText': [x['id'] for x in idx if 'text' in x and not x['text']]}
out['againstThisIndex'] = {'A': {'distinct': st['uniqueActs'], 'terms': st['terms'], 'statements': st['statements'], 'textActs': st['textActs']}, 'mine': mine}

# section 3: the table, row by row, against to_fetch in order
rows = [r for r in s3.split('\n') if r.startswith('| `')]
tf = a['to_fetch']
row_checks = []
for i, r in enumerate(rows):
    c = [x.strip() for x in r.strip('|').split('|')]
    j = tf[i] if i < len(tf) else None
    exp = None if j is None else [j['media_hash'], j['name'], j['version'], j['kind'], str(j['bytes']), ', '.join(j['homes']), ', '.join(j['uploaded_by_tray'])]
    got = [c[0].strip('`'), c[1], c[2], c[3], c[4], c[5], c[6]]
    if exp != got:
        row_checks.append({'row': i + 1, 'document': got, 'json': exp, 'fieldsDiffering': [k for k, (u, v) in enumerate(zip(got, exp or [None] * 7)) if u != v]})
checks.append({'where': '3', 'what': 'table rows = to_fetch entries', 'document': len(rows), 'json': len(tf), 'agree': len(rows) == len(tf)})
checks.append({'where': '3', 'what': 'rows differing from to_fetch (hash, name, version, kind, bytes, homes, uploader), in order', 'document': len(row_checks), 'json': 0, 'agree': not row_checks, 'rows': row_checks})
# the list "The ones that matter for section 4"
lst = s3.split('**The ones that matter for section 4**')[1]
prefixes = re.findall(r'`([0-9a-f]{8})…`', lst)
tfp = {x['media_hash'][:8]: x for x in tf}
heldp = {x['media_hash'][:8]: x for x in media_apps if x.get('held')}
checks.append({'where': '3', 'what': '"ones that matter": each hash prefix is in to_fetch (the list says 0.3 and 0.6 of register are held, and names no hash for them)',
               'document': prefixes, 'json': {p: ('to_fetch: ' + tfp[p]['name'] + ' ' + tfp[p]['version']) if p in tfp else ('held: ' + heldp[p]['name']) if p in heldp else 'absent' for p in prefixes},
               'agree': all(p in tfp for p in prefixes)})
# names/versions given in that list against to_fetch
nv = re.findall(r'([A-Za-z][\w\- ]*?) (\d[\w.]*) `([0-9a-f]{8})…`', lst)
bad = [[n, v, p, tfp[p]['name'], tfp[p]['version']] for n, v, p in nv if p in tfp and (tfp[p]['version'] != v)]
checks.append({'where': '3', 'what': '"ones that matter": versions given match to_fetch', 'document': len(nv), 'json': bad, 'agree': not bad})
out['figures'] = checks

# ---- newer files
t0 = os.path.getmtime(AJ)
newer = []
for d, ds, fs in os.walk(R):
    ds[:] = [x for x in ds if x != 'keys']
    for f in fs:
        p = os.path.join(d, f)
        if os.path.getmtime(p) > t0: newer.append({'file': os.path.relpath(p, R), 'mtime': os.path.getmtime(p)})
out['newerThanAInventory'] = {'AInventoryMtime': t0, 'files': newer}
json.dump(out, open(OUT, 'w'), indent=1)
print('sha256 equal', out['sha256']['equal'], out['sha256']['A'])
for c in checks: print(c['where'], 'AGREE' if c['agree'] else ('n/a ' if c['agree'] is None else 'DIFF '), c['what'][:90], '|', c['document'] if not isinstance(c['document'], list) or len(str(c['document'])) < 80 else '…', '|', c['json'] if len(str(c['json'])) < 120 else '…')
print('newer files', [n['file'] for n in newer])
print('index', out['againstThisIndex'])
