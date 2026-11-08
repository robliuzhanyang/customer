import json, re, openpyxl, os

raw_p = '/workspace/11月搜索客户/资质新办_贵州_raw.json'
tz_p = '/workspace/通讯录输出/探迹CRM_客户通讯录_终版+.xlsx'
nov_p = '/workspace/手机号客户清单/11月整合_有手机号客户_17921条.xlsx'
oct_p = '/workspace/手机号客户清单/10-11月整合_有手机号客户_24722条.xlsx'
p110 = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'

for p in (raw_p, tz_p, nov_p, oct_p, p110):
    print(p, 'exists', os.path.exists(p))

# 11月客群原始
raw = json.load(open(raw_p, encoding='utf-8'))
print('raw type', type(raw), 'len', len(raw))
print('raw sample', raw[0] if raw else None)

# 通讯录
wb = openpyxl.load_workbook(tz_p, read_only=True)
ws = wb[wb.sheetnames[0]]
hdr = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
print('tz hdr', hdr)
ci = {h: i for i, h in enumerate(hdr)}
tz = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    name = r[ci.get('客户名称', 1)]
    if not name:
        continue
    phone = r[ci.get('手机', 5)]
    tz[str(name).strip()] = str(phone or '').strip()
print('通讯录条数', len(tz))
valid = {k: v for k, v in tz.items() if re.fullmatch(r'1[3-9]\d{9}', v)}
print('通讯录有效手机', len(valid))

# 已有清单名称
def load_names(p):
    wb = openpyxl.load_workbook(p, read_only=True)
    ws = wb[wb.sheetnames[0]]
    h = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    k = None
    for i, x in enumerate(h):
        if x in ('客户名称', '公司名称', '企业名称'):
            k = i
            break
    s = set()
    for r in ws.iter_rows(min_row=2, values_only=True):
        if k is not None and r[k]:
            s.add(str(r[k]).strip())
    return s

n_nov = load_names(nov_p)
n_oct = load_names(oct_p)
n_110 = load_names(p110)
print('11月整合', len(n_nov), '10-11月整合', len(n_oct), '110', len(n_110))

raw_names = set()
for x in raw:
    n = x.get('n') or x.get('name')
    if n:
        raw_names.add(str(n).strip())
print('11月客群企业名', len(raw_names))

hit = raw_names & set(valid.keys())
print('11月客群∩通讯录有效手机', len(hit))
new = hit - n_nov - n_oct - n_110
print('其中未出现在任何已交付清单', len(new))
for n in list(new)[:50]:
    print('NEW', n, valid.get(n))
