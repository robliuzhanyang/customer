import json, glob, os, sys

pages = {}
for f in glob.glob('/workspace/scan2/p*.json'):
    p = int(os.path.basename(f)[1:5])
    try:
        pages[p] = json.load(open(f))
    except Exception as e:
        pages[p] = None

bad = []
for p in sorted(pages):
    k = pages[p]
    if not k:
        bad.append((p, 'empty'))
        continue
    if len(k) != 10:
        bad.append((p, 'len%d' % len(k)))
    for i in range(1, len(k)):
        if k[i] <= k[i - 1]:
            bad.append((p, 'mono@%d' % i))
            break

ps = sorted(pages)
gaps = []
for i in range(1, len(ps)):
    if ps[i] != ps[i - 1] + 1:
        gaps.append((ps[i - 1], ps[i]))
link = []
for i in range(1, len(ps)):
    a, b = pages[ps[i - 1]], pages[ps[i]]
    if ps[i] != ps[i - 1] + 1 or not a or not b:
        continue
    if b[0] <= a[-1]:
        link.append((ps[i], a[-1][-6:], b[0][-6:]))

print('pages', len(ps), 'min', ps[0] if ps else 0, 'max', ps[-1] if ps else 0)
print('bad', bad[:20], 'n', len(bad))
print('gaps', gaps[:30], 'n', len(gaps))
print('link', link[:20], 'n', len(link))
