#!/usr/bin/env python3
"""trace-a.py: DubLaw wave 3, session C (Nobody, allegedly). Traces six of wave 2 A's twelve features (4.1 to 4.12).

    python3 -I trace-a.py INDEX_JSON A_FEATURES_MD OUT_JSON

Choice: the six sections of A's section 4 citing the most distinct acts, an act being a 64-hex string in the section
that is an act id in this session's index (index.mjs); ties by section number.
For each claim of the form "LABEL: N acts by M signers (`id`, ...)" in those sections, and for each text act A names
for an app: every cited act is looked up in the index; the listed count and the distinct signers of the listed acts
are counted; the kind of each act is checked against the label; and, where the label defines a population that can
be recounted from the acts (a spec hash or K7 kind by prefix, the Terms of an agreement, their assents, a marker in
texts), the whole population is recounted and compared with A's N. Nothing is read by eye.
"""
import json, re, sys

IDX, MD, OUT = sys.argv[1:4]
acts = json.load(open(IDX))['acts']
I = {a['id']: a for a in acts}
md = open(MD).read()
sec4 = md.split('\n## 4. Features')[1].split('\n## 5.')[0]
sections = re.split(r'\n(?=### 4\.\d+ )', sec4)[1:]
HEX = re.compile(r'\b[0-9a-f]{64}\b')

def cited(s):
    return sorted(set(HEX.findall(s)) & set(I))

ranked = sorted(sections, key=lambda s: (-len(cited(s)), [int(x) for x in re.match(r'### 4\.(\d+)', s).group(1).split()]))
chosen = sorted(ranked[:6], key=lambda s: int(re.match(r'### 4\.(\d+)', s).group(1)))

def kind(a):
    if a.get('terms'): return 'terms'
    if a.get('statement'): return 'statement:' + a['statement']['kind'] + ((':' + a['statement']['k7']['cmip'][:8]) if a['statement'].get('k7') else '')
    if 'text' in a: return 'text'
    return 'spec:' + (a.get('spec') or '?')[:8] + '/' + str(a.get('type'))

terms = [a for a in acts if a.get('terms')]
stmts = [a for a in acts if a.get('statement')]
texts = [a for a in acts if isinstance(a.get('text'), str)]
root = lambda t: t['terms'].get('agreement') or t['id']

CLAIM = re.compile(r'(?P<label>[^:\n;]*?(?:\([^)]*\))?[^:\n;]*?)\s*:?\s*(?P<n>\d+) acts by (?P<m>\d+) signers(?: \((?P<ids>`[0-9a-f]{64}`(?:, `[0-9a-f]{64}`)*)\))?')

def population(label, ids, section_text, ctx):
    """Recount the whole population the label defines, where it can be defined from the acts alone. Returns (rule, ids) or None."""
    m = re.search(r'`([0-9a-f]{8})…`', label)
    if m and ('kind' in label.lower()):
        p = m.group(1)
        return ('Statements whose K7 kind cMIP begins ' + p, [s['id'] for s in stmts if s['statement'].get('k7') and s['statement']['k7']['cmip'].startswith(p)])
    if m and ('under' in label.lower()):
        p = m.group(1)
        return ('acts whose spec hash begins ' + p, [a['id'] for a in acts if (a.get('spec') or '').startswith(p)])
    if label.strip().startswith('Text records'):
        marks = re.findall(r'[A-Z]+-[A-Z]+', label)
        return ('text acts containing ' + ' or '.join(marks), [t['id'] for t in texts if any(k in t['text'] for k in marks)])
    if 'assents' in label.lower() and ctx.get('terms'):
        T = set(ctx['terms']); R = {root(I[t]) for t in T}
        return ('assent Statements whose agreement is the root of the Terms just listed', [s['id'] for s in stmts if s['statement']['kind'] == 'assent' and s['statement']['agreement'] in R])
    if label.strip().startswith('Statements in it') and ctx.get('root'):
        return ('Statements whose agreement is ' + ctx['root'][:8], [s['id'] for s in stmts if s['statement']['agreement'] == ctx['root']])
    if 'Terms' in label and 'root' in label:
        r = HEX.search(label).group(0); ctx['root'] = r
        return ('Terms acts whose id or agreement is ' + r[:8], [t['id'] for t in terms if root(t) == r])
    if 'Terms in those agreements' in label and ctx.get('statements'):
        R = {I[s]['statement']['agreement'] for s in ctx['statements']}
        return ('Terms acts whose root is the agreement of a Statement just listed', [t['id'] for t in terms if root(t) in R])
    if label.strip().startswith('Terms naming') and ids:
        common = set.intersection(*[{s['cmip'] for s in I[i]['terms']['sockets']} for i in ids if I.get(i, {}).get('terms')])
        # the cMIP named by all listed Terms and by the fewest Terms overall is the one the label names
        best = None
        for c in common:
            pop = [t['id'] for t in terms if any(s['cmip'] == c for s in t['terms']['sockets'])]
            if best is None or len(pop) < len(best[1]): best = (c, pop)
        if best: return ('Terms acts naming in a socket ' + best[0][:16] + ' (the socket cMIP common to the listed Terms that the fewest Terms name)', best[1])
    if re.search(r"Cercle's Terms|charter Terms", label) and ids:
        # Terms whose root is that of a listed Terms act
        R = {root(I[i]) for i in ids if I.get(i, {}).get('terms')}
        return ('Terms acts in the agreements of the listed Terms', [t['id'] for t in terms if root(t) in R])
    return None

# "Named by others": this session's own patterns, one per app, from the app's name as A's section gives it; a text act
# names the app if its text matches the pattern or holds one of the full hashes the section's Apps bullet gives;
# "others" are signers who are not an author the Apps bullet names (by its prefix…suffix) nor a signer of an app text act.
NAMED = {
    '4.1': [('Named by others', r'shelf\.mjs|\bshelf 0\.1')],
    '4.2': [('Named by others', r'kept\.mjs')],
    '4.8': [('cercle-count', r'cercle-count'), ('mending.mjs', r'mending\.mjs')],
    '4.9': [('Named by others', r'credits-read')],
    '4.11': [('handover check named by others', r'(?i)handover check', 'b820fe4b'), ('turnstile-move', r'turnstile-move', '11e77c4b'), ('turnstile-census', r'turnstile-census', '11e77c4b')],
}
# where a section names apps by several authors, the third item gives the one app's author, by prefix
signers_all = {a['signer'] for a in acts if a.get('signer')}
def authors_of(apps_part, app_texts):
    out_ = {a['signer'] for a in app_texts if a['kind'] == 'text'}
    for pre, suf in re.findall(r'`([0-9a-f]{8})…([0-9a-f]{4})`', apps_part):
        out_ |= {x for x in signers_all if x.startswith(pre) and x.endswith(suf)}
    return out_
def named_by_others(pattern, apps_part, authors, by_hash=True):
    hashes = set(HEX.findall(apps_part))
    rx = re.compile(pattern)
    return [t['id'] for t in texts if t['signer'] not in authors and t['id'] not in hashes and (rx.search(t['text']) or (by_hash and any(h in t['text'] for h in hashes)))]

out = {'made': 'trace-a.py, DubLaw wave 3 session C', 'rule': 'six sections citing the most distinct acts in the index; ties by section number',
       'ranking': [[re.match(r'### (4\.\d+)', s).group(1), len(cited(s))] for s in ranked], 'features': []}
for s in chosen:
    title = s.split('\n')[0][4:]
    f = {'section': title, 'citedActs': len(cited(s)), 'citedHexNotActs': sorted(set(HEX.findall(s)) - set(I)), 'claims': [], 'appTexts': []}
    # app text acts named as "text act `id`" or a version followed by `id` in the Apps bullet
    apps = s.split('- **Acts**')[0]
    for i in HEX.findall(apps):
        if i in I: f['appTexts'].append({'act': i, 'kind': kind(I[i]), 'signer': I[i]['signer'], 'firstLine': (I[i].get('text') or '').split('\n')[0][:100]})
    acts_part = '- **Acts**' + s.split('- **Acts**', 1)[1].split('- **Dubsar today')[0] if '- **Acts**' in s else ''
    ctx = {}
    for m in CLAIM.finditer(acts_part):
        label = m.group('label').strip(' -*;,').replace('(counted)', '').strip()
        n, mm = int(m.group('n')), int(m.group('m'))
        ids = re.findall(r'[0-9a-f]{64}', m.group('ids') or '')
        found = [i for i in ids if i in I]
        signers = {I[i]['signer'] for i in found}
        kinds = {}
        for i in found: kinds[kind(I[i])] = kinds.get(kind(I[i]), 0) + 1
        c = {'label': label, 'A': {'acts': n, 'signers': mm, 'listed': len(ids)}, 'mine': {'listedFound': len(found), 'listedMissing': [i for i in ids if i not in I], 'signersOfListed': len(signers), 'kinds': kinds}}
        if ids and all(I[i].get('terms') for i in found): ctx['terms'] = found
        if ids and all(I[i].get('statement') for i in found) and 'kind' in label.lower(): ctx['statements'] = found
        pop = population(label, ids, s, ctx)
        if pop:
            rule, pids = pop
            c['mine']['population'] = {'rule': rule, 'acts': len(pids), 'signers': len({I[p]['signer'] for p in pids}), 'notListedByA': sorted(set(pids) - set(ids)) if ids else None, 'listedNotInPopulation': sorted(set(ids) - set(pids)) if ids else None}
        if not ids and pop is None and 'standing.mjs' in label:
            pass
        c['agree'] = {
            'listedEqualsN': (len(ids) == n) if ids or n == 0 else None,
            'allListedExist': len(found) == len(ids),
            'signersEqualM': (len(signers) == mm) if ids or n == 0 else None,
            'populationEqualsN': (c['mine']['population']['acts'] == n) if pop else None,
        }
        f['claims'].append(c)
    # 4.10's count with no list: text acts naming standing.mjs, by signers other than the app's authors
    if 'standing.mjs' in s:
        authors = {I[a['act']]['signer'] for a in f['appTexts'] if a['kind'] == 'text'}
        pop = [t for t in texts if 'standing.mjs' in t['text'] and t['signer'] not in authors]
        pop1 = [t for t in texts if 'standing.mjs' in t['text'] and t['signer'] != I['22fae0ff6316322f49aa54c6120217f9d2773da11a9227191dfdb6108fc13eac']['signer']]
        f['claims'].append({'label': 'Text acts naming standing.mjs by others (no list given by A)', 'A': {'acts': 27, 'signers': 6},
                            'mine': {'byOthersThanAllItsAuthors': {'acts': len(pop), 'signers': len({t['signer'] for t in pop}), 'ids': [t['id'] for t in pop]},
                                     'byOthersThanTheFirstAuthor': {'acts': len(pop1), 'signers': len({t['signer'] for t in pop1}), 'ids': [t['id'] for t in pop1]}},
                            'agree': {'populationEqualsN': len(pop) == 27 or len(pop1) == 27}})
    num = re.match(r'(4\.\d+)', title).group(1)
    authors = authors_of(apps, f['appTexts'])
    f['authorsTaken'] = sorted(authors)
    f['namedByOthersRecount'] = []
    for entry in NAMED.get(num, []):
        label, pat = entry[0], entry[1]
        au = {x for x in authors if x.startswith(entry[2])} if len(entry) > 2 else authors
        ids_ = named_by_others(pat, apps, au)
        ids_p = named_by_others(pat, apps, au, by_hash=False)
        claimA = next((c for c in f['claims'] if c['label'].startswith(label) or (label in ('turnstile-move', 'turnstile-census') and 'turnstile' in c['label'])), None)
        listed = set()
        if claimA:
            mtxt = re.search(re.escape(claimA['label']) + r'[^(]*?(\([^)]*\))?', acts_part)
        for c in f['claims']:
            if c['label'] == (claimA or {}).get('label'):
                pass
        f['namedByOthersRecount'].append({'app': label, 'pattern': pat, 'authors': sorted(au), 'acts': len(ids_), 'signers': len({I[i]['signer'] for i in ids_}), 'ids': ids_,
                                          'patternOnly': {'acts': len(ids_p), 'signers': len({I[i]['signer'] for i in ids_p}), 'ids': ids_p},
                                          'A': claimA['A'] if claimA else None})
        r_ = f['namedByOthersRecount'][-1]
        lab_ = re.escape(claimA['label']) if claimA else None
        mt = re.search(lab_ + r'[^(]*?\d+ acts by \d+ signers(?: \(([^)]*)\))?', acts_part) if lab_ else None
        a_ids = set(re.findall(r'[0-9a-f]{64}', (mt.group(1) or '') if mt else ''))
        r_['patternOnly']['sameIdsAsA'] = (set(ids_p) == a_ids) if claimA and claimA['A']['listed'] == claimA['A']['acts'] else None
    out['features'].append(f)

json.dump(out, open(OUT, 'w'), indent=1)
for f in out['features']:
    print(f['section'][:60], 'cited', f['citedActs'])
    for r in f['namedByOthersRecount']: print('   named-by-others recount', r['app'], r['acts'], '/', r['signers'], 'pattern only', r['patternOnly']['acts'], '/', r['patternOnly']['signers'], 'A', r['A'] and (r['A']['acts'], r['A']['signers']))
    for a in f['appTexts']: print('   app act', a['act'][:8], a['kind'], a['signer'][:8], a['firstLine'][:60])
    for c in f['claims']:
        p = c['mine'].get('population')
        print('   ', c['label'][:60].ljust(60), 'A', c['A']['acts'], '/', c['A']['signers'], '| listed', c['A'].get('listed'), 'found', c['mine'].get('listedFound'), 'signers', c['mine'].get('signersOfListed'),
              '| pop', (p['acts'], p['signers']) if p else c['mine'].get('byOthersThanAllItsAuthors'), '|', c['mine'].get('kinds') or '', '|', {k: v for k, v in c['agree'].items() if v is False} or 'ok')
