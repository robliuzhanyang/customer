import openpyxl
from collections import Counter

wb = openpyxl.load_workbook('/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx')
ws = wb['11月新增_有手机号']
hdr = [c.value for c in ws[1]]
cnt = Counter()
rows = 0
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[1]:
        continue
    rows += 1
    for i, h in enumerate(hdr):
        v = r[i]
        if v in (None, '', '--') or (isinstance(v, str) and '待补' in v):
            cnt[h] += 1
print('数据行', rows)
for h in hdr:
    print(h, '空/占位:', cnt[h])
