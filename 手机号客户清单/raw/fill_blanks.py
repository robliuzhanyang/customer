import openpyxl
from openpyxl.styles import Alignment

p = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'
wb = openpyxl.load_workbook(p)
ws = wb['11月新增_有手机号']
hdr = [c.value for c in ws[1]]
idx = {h: i for i, h in enumerate(hdr)}

tel_fill = email_fill = 0
for row in ws.iter_rows(min_row=2):
    if not row[idx['客户名称']].value:
        continue
    if row[idx['电话']].value in (None, '', '--'):
        row[idx['电话']].value = '无（CRM未提供座机）'
        tel_fill += 1
    if row[idx['邮箱']].value in (None, '', '--'):
        row[idx['邮箱']].value = '无（CRM未提供邮箱）'
        email_fill += 1
    for c in row:
        c.alignment = Alignment(vertical='center', wrap_text=True)

ws.freeze_panes = 'C2'
ws.auto_filter.ref = f'A1:{openpyxl.utils.get_column_letter(ws.max_column)}{ws.max_row}'
wb.save(p)
print('电话补标', tel_fill, '邮箱补标', email_fill)

# 复核
wb = openpyxl.load_workbook(p)
ws = wb['11月新增_有手机号']
empty = 0
for r in ws.iter_rows(min_row=2, values_only=True):
    if not r[1]:
        continue
    for i, h in enumerate(hdr):
        if r[i] in (None, '', '--'):
            empty += 1
            print('仍空', r[0], r[1], h)
print('剩余空格', empty, '总行', ws.max_row - 1)
