import openpyxl, re
from collections import Counter

p = '/workspace/手机号客户清单/11月新增_有手机号客户_141条.xlsx'
wb = openpyxl.load_workbook(p)
print('sheets', wb.sheetnames)
ws = wb['11月新增_有手机号']
hdr = [c.value for c in ws[1]]
idx = {h: i for i, h in enumerate(hdr)}

names, bad, empty = [], [], 0
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[1]:
        continue
    names.append(r[1])
    if not re.fullmatch(r'1[3-9]\d{9}', str(r[idx['手机']] or '')):
        bad.append((r[1], r[idx['手机']]))
    for i, h in enumerate(hdr):
        if r[i] in (None, '', '--'):
            empty += 1
dup = [k for k, v in Counter(names).items() if v > 1]
print('行数', len(names), '无效手机', bad, '重复', dup, '空格', empty)

if '采集说明' in wb.sheetnames:
    s = wb['采集说明']
    found = False
    for row in s.iter_rows():
        for c in row:
            if isinstance(c.value, str) and '109' in c.value:
                c.value = c.value.replace('109', '141')
                found = True
            if isinstance(c.value, str) and '110' in c.value:
                c.value = c.value.replace('110', '141')
                found = True
    print('采集说明已更新' if found else '采集说明未含条数')
    wb.save(p)
