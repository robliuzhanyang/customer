import json, re, openpyxl, difflib
from collections import defaultdict

tz_p = '/workspace/通讯录输出/探迹CRM_客户通讯录_终版+.xlsx'
raw_p = '/workspace/11月搜索客户/资质新办_贵州_raw.json'
nov_p = '/workspace/手机号客户清单/11月整合_有手机号客户_17921条.xlsx'
oct_p = '/workspace/手机号客户清单/10-11月整合_有手机号客户_24722条.xlsx'
p110 = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'

def norm(s):
    s = str(s or '').strip().translate(str.maketrans('（）【】［］　', '()[][] '))
    return re.sub(r'[\s\(\)\[\]\-·、,，.。]', '', s)

wb = openpyxl.load_workbook(tz_p, read_only=True)
ws = wb[wb.sheetnames[0]]
hdr = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
ci = {h: i for i, h in enumerate(hdr)}
tz = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    name, phone = r[ci['客户名称']], str(r[ci['手机']] or '').strip()
    if name and re.fullmatch(r'1[3-9]\d{9}', phone):
        tz[str(name).strip()] = {'phone': phone, 'legal': str(r[ci.get('公司法人', 3)] or '').strip(),
                                 'addr': r[ci.get('企业地址', 9)] or '', 'region': r[ci.get('地区', 8)] or ''}
tz_norm = {}
for k, v in tz.items():
    tz_norm.setdefault(norm(k), (k, v))

def load_names(p):
    wb = openpyxl.load_workbook(p, read_only=True)
    ws = wb[wb.sheetnames[0]]
    h = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    k = next(i for i, x in enumerate(h) if x in ('客户名称', '公司名称', '企业名称'))
    return {str(r[k]).strip() for r in ws.iter_rows(min_row=2, values_only=True) if r[k]}

delivered_norm = {norm(x) for x in (load_names(nov_p) | load_names(oct_p) | load_names(p110))}
raw = {str(x.get('n') or '').strip(): x for x in json.load(open(raw_p, encoding='utf-8')) if x.get('n')}

# 未命中且未交付的
todo = [(n, x) for n, x in raw.items() if norm(n) not in delivered_norm and norm(n) not in tz_norm]
print('待模糊匹配', len(todo))

# 用 4-gram 建索引
idx4 = defaultdict(set)
for k in tz_norm:
    for i in range(len(k) - 3):
        idx4[k[i:i+4]].add(k)

hits = []
for n, x in todo:
    k = norm(n)
    legal = str(x.get('l') or '').strip()
    cand = set()
    for i in range(len(k) - 3):
        cand |= idx4.get(k[i:i+4], set())
    best = None
    for c in cand:
        ratio = difflib.SequenceMatcher(None, k, c).ratio()
        if ratio < 0.9:
            continue
        tzname, info = tz_norm[c]
        if legal and info['legal'] and legal == info['legal']:
            if best is None or ratio > best[1]:
                best = (tzname, ratio, info)
    if best:
        hits.append((n, best[0], best[1], best[2]['phone'], best[2]['legal'],
                     best[2]['region'], best[2]['addr'], x.get('cap'), x.get('f')))

print('高置信模糊命中(名称≥0.90 且法人一致)', len(hits))
for h in hits[:60]:
    print(round(h[2], 3), h[0], '<=>', h[1], h[3])

json.dump(hits, open('/workspace/手机号客户清单/raw/fuzzy_hits.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
