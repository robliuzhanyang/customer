import json, sys

s = open('/workspace/raw.txt').read().strip()
n = 0
bad = []
for part in s.split('|'):
    part = part.strip()
    if not part:
        continue
    p, _, ks = part.partition(':')
    if not p.isdigit():
        continue
    keys = [k for k in ks.split(',') if k]
    if len(keys) != 10:
        bad.append((p, len(keys)))
        continue
    json.dump(keys, open('/workspace/scan2/p%04d.json' % int(p), 'w'))
    n += 1
print('ing', n, 'bad', bad[:10])
