import json

rows = json.load(open('/workspace/手机号客户清单/raw/batch2_rest.json', encoding='utf-8'))
raw = json.load(open('/workspace/11月搜索客户/资质新办_贵州_raw.json', encoding='utf-8'))
d = {str(x.get('n') or '').strip(): x for x in raw}
miss = []
res = {}
for r in rows:
    x = d.get(r['n'])
    if x and x.get('l'):
        res[r['n']] = {'lg': x.get('l'), 'cap': x.get('cap'), 'ft': x.get('f'), 'rg': x.get('rg')}
        print('HIT ', r['n'], res[r['n']])
    else:
        miss.append(r['n'])
        print('MISS', r['n'])
print('命中', len(res), '缺失', len(miss))
json.dump(res, open('/workspace/手机号客户清单/raw/batch2_fields.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(miss, ensure_ascii=False))
