import json, glob, os
keys = set()
for f in glob.glob('/workspace/chunks/p*.json'):
    for r in json.load(open(f)):
        k = (r.get('k') or r.get('key') or '').strip()
        if k:
            keys.add(k)
for f in glob.glob('/workspace/scan2/p*.json'):
    for k in json.load(open(f)):
        if k:
            keys.add(k)
keys = sorted(keys)
os.makedirs('/workspace/kn', exist_ok=True)
for f in glob.glob('/workspace/kn/*.txt'):
    os.remove(f)
CH = 17000
parts = []
buf = ''
for k in keys:
    if len(buf) + len(k) + 1 > CH:
        parts.append(buf)
        buf = ''
    buf += (',' if buf else '') + k
if buf:
    parts.append(buf)
for i, s in enumerate(parts):
    open('/workspace/kn/p%d.txt' % i, 'w').write(s)
print('keys', len(keys), 'parts', len(parts), 'maxlen', max(len(s) for s in parts))
print('missing_vs_25743', 25743 - len(keys))
