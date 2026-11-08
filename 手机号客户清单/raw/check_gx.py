import json, re, openpyxl

p110 = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'
wb = openpyxl.load_workbook(p110)
ws = wb['11月新增_有手机号']
hdr = [c.value for c in ws[1]]
idx = {h: i for i, h in enumerate(hdr)}

print('=== 广西相关行 ===')
wx = []
for row in ws.iter_rows(min_row=2):
    name = row[idx['客户名称']].value
    if not name:
        continue
    text = f"{row[idx['所在地区']].value or ''}{row[idx['企业详细地址']].value or ''}"
    if '广西' in text or str(name).startswith('广西'):
        wx.append((row[0].row, name, row[idx['手机']].value, row[idx['所在地区']].value))
for x in wx:
    print(x)
print('广西行数', len(wx))
