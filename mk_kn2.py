import json, glob, os
keys = set()
for f in glob.glob('/workspace/chunks/p*.json'):
    for r in json.load(open(f)):
        k = (r.get('k') or r.get('key') or '').strip()
        if k:
            keys.add(k)
for f in glob.glob('/workspace/fill/p*.json'):
    for r in json.load(open(f)):
        k = (r.get('k') or '').strip()
        if k:
            keys.add(k)
keys = sorted(keys)
os.makedirs('/workspace/kn2', exist_ok=True)
for f in glob.glob('/workspace/kn2/*.txt'):
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
    open('/workspace/kn2/p%d.txt' % i, 'w').write(s)
print('have_fields', len(keys), 'parts', len(parts))
