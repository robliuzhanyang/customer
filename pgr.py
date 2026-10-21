import json
import os

recs = json.load(open('/workspace/recs.json'))
os.makedirs('/workspace/fill', exist_ok=True)
n = 0
pages = set()
for r in recs:
    p = int(r.get('pg') or 0)
    k = (r.get('k') or '').strip()
    if not p or not k:
        continue
    f = '/workspace/fill/p%04d.json' % p
    cur = {}
    if os.path.exists(f):
        for x in json.load(open(f)):
            cur[x.get('k')] = x
    cur[k] = r
    json.dump(list(cur.values()), open(f, 'w'), ensure_ascii=False)
    pages.add(p)
    n += 1
errs = [r for r in recs if r.get('err')]
print('recs', n, 'pages', len(pages), 'err', len(errs), [x.get('k') for x in errs][:5])
