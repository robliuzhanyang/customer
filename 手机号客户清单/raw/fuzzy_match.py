import json, re, openpyxl

tz_p = '/workspace/通讯录输出/探迹CRM_客户通讯录_终版+.xlsx'
raw_p = '/workspace/11月搜索客户/资质新办_贵州_raw.json'
nov_p = '/workspace/手机号客户清单/11月整合_有手机号客户_17921条.xlsx'
oct_p = '/workspace/手机号客户清单/10-11月整合_有手机号客户_24722条.xlsx'
p110 = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'

def norm(s):
    s = str(s or '').strip()
    s = s.translate(str.maketrans('（）【】［］　', '()[][] '))
    s = re.sub(r'[\s\(\)\[\]\-·、,，.。]', '', s)
    s = s.replace('（', '').replace('）', '')
    return s

wb = openpyxl.load_workbook(tz_p, read_only=True)
ws = wb[wb.sheetnames[0]]
hdr = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
ci = {h: i for i, h in enumerate(hdr)}
tz = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    name = r[ci['客户名称']]
    phone = str(r[ci['手机']] or '').strip()
    if not name:
        continue
    if re.fullmatch(r'1[3-9]\d{9}', phone):
        tz[str(name).strip()] = phone
tz_norm = {}
for k, v in tz.items():
    tz_norm.setdefault(norm(k), v)
print('通讯录有效', len(tz), '归一后', len(tz_norm))

raw = json.load(open(raw_p, encoding='utf-8'))
raw_names = [str(x.get('n') or '').strip() for x in raw if x.get('n')]

def load_names(p):
    wb = openpyxl.load_workbook(p, read_only=True)
    ws = wb[wb.sheetnames[0]]
    h = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    k = next(i for i, x in enumerate(h) if x in ('客户名称', '公司名称', '企业名称'))
    return {str(r[k]).strip() for r in ws.iter_rows(min_row=2, values_only=True) if r[k]}

delivered = load_names(nov_p) | load_names(oct_p) | load_names(p110)
print('已交付名称数', len(delivered))

# 1) 归一后精确匹配
hit = []
seen = set()
for n in raw_names:
    k = norm(n)
    if k in tz_norm:
        hit.append((n, tz_norm[k]))
        seen.add(n)
print('归一精确命中', len(hit))

new = [(n, p) for n, p in hit if n not in delivered]
print('归一命中中未出现在已交付清单', len(new))
for n, p in new[:40]:
    print('NEW', n, p)

json.dump(new, open('/workspace/手机号客户清单/raw/fuzzy_new.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
