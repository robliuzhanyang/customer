import json
import os

recs = json.load(open('/workspace/recs.json'))
os.makedirs('/workspace/fill2', exist_ok=True)
n = 0
for r in recs:
    k = (r.get('k') or '').strip()
    if not k:
        continue
    r.pop('pg', None)
    json.dump(r, open('/workspace/fill2/%s.json' % k, 'w'), ensure_ascii=False)
    n += 1
print('ok', n)
