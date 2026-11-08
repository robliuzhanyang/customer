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

by_legal = defaultdict(list)
tz_norm = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    name, phone = r[ci['客户名称']], str(r[ci['手机']] or '').strip()
    if not (name and re.fullmatch(r'1[3-9]\d{9}', phone)):
        continue
    nm = str(name).strip()
    info = {'phone': phone, 'legal': str(r[ci.get('公司法人', 3)] or '').strip(),
            'addr': r[ci.get('企业地址', 9)] or '', 'region': r[ci.get('地区', 8)] or ''}
    tz_norm.setdefault(norm(nm), (nm, info))
    if info['legal']:
        by_legal[info['legal']].append((norm(nm), nm, info))

def load_names(p):
    w = openpyxl.load_workbook(p, read_only=True)
    s = w[w.sheetnames[0]]
    h = [c.value for c in next(s.iter_rows(min_row=1, max_row=1))]
    k = next(i for i, x in enumerate(h) if x in ('客户名称', '公司名称', '企业名称'))
    return {str(r[k]).strip() for r in s.iter_rows(min_row=2, values_only=True) if r[k]}

delivered_norm = {norm(x) for x in (load_names(nov_p) | load_names(oct_p) | load_names(p110))}
raw = {str(x.get('n') or '').strip(): x for x in json.load(open(raw_p, encoding='utf-8')) if x.get('n')}

todo = [(n, x) for n, x in raw.items() if norm(n) not in delivered_norm and norm(n) not in tz_norm]
print('待模糊匹配', len(todo))

hits = []
for n, x in todo:
    k = norm(n)
    legal = str(x.get('l') or '').strip()
    if not legal:
        continue
    for cn, tzname, info in by_legal.get(legal, []):
        ratio = difflib.SequenceMatcher(None, k, cn).ratio()
        if ratio >= 0.85:
            hits.append((round(ratio, 3), n, tzname, info['phone'], legal, info['region'],
                         info['addr'], x.get('cap'), x.get('f')))

hits.sort(reverse=True)
print('命中', len(hits))
for h in hits[:80]:
    print(h[0], h[1], '<=>', h[2], h[3], h[4])

json.dump(hits, open('/workspace/手机号客户清单/raw/fuzzy_hits.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
