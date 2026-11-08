import json, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

hits = json.load(open('/workspace/手机号客户清单/raw/fuzzy_hits.json', encoding='utf-8'))
out_p = '/workspace/手机号客户清单/11月客群_同法人关联手机_补充75条.xlsx'

wb = openpyxl.Workbook()
ws = wb.active
ws.title = '同法人关联'
cols = ['序号', '客户名称', '法定代表人', '注册资本', '成立时间', '所在地区',
        '关联手机', '手机号校验', '比对命中企业', '名称相似度', '关联企业地址', '数据说明']
ws.append(cols)

head_fill = PatternFill('solid', fgColor='C00000')
thin = Side(style='thin', color='BFBFBF')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
for c in ws[1]:
    c.font = Font(bold=True, color='FFFFFF', size=11)
    c.fill = head_fill
    c.alignment = Alignment(horizontal='center', vertical='center')
    c.border = border

for i, h in enumerate(hits, 1):
    ratio, raw_name, tz_name, phone, legal, region, addr, cap, ft = h
    ws.append([i, raw_name, legal, cap or '', ft or '', region or '', phone, '通过',
               tz_name, ratio, addr or '', '同一法定代表人名下企业，手机号真实，需人工确认为同一主体'])

for row in ws.iter_rows(min_row=2):
    for c in row:
        c.border = border
        c.alignment = Alignment(vertical='center', wrap_text=True)

widths = [6, 38, 12, 16, 13, 24, 15, 10, 38, 11, 55, 40]
for i, w in enumerate(widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'C2'
ws.auto_filter.ref = f'A1:L{ws.max_row}'

ws2 = wb.create_sheet('说明')
notes = [
    ['口径说明'],
    ['1. 本表为 11月客群 60,735 家中“无手机号”部分的补充尝试结果。'],
    ['2. 匹配方法：客户名称归一化后仍不匹配时，改按“法定代表人完全相同 + 名称相似度≥0.85”关联既有通讯录。'],
    ['3. 重要提示：命中企业与原企业多为同一法人注册的关联公司（建筑劳务行业常见），手机号真实有效，'],
    ['   但不保证与原企业为同一工商主体，使用前建议人工确认。'],
    ['4. 手机号校验规则：^1[3-9]\\d{9}$，固话/打码/空值已全部剔除。'],
    ['5. 数据来源：探迹CRM 客户通讯录（2026-10）+ 拓客 11月客群资质新办。'],
]
for r in notes:
    ws2.append(r)
ws2.column_dimensions['A'].width = 110
ws2['A1'].font = Font(bold=True, size=13)

wb.save(out_p)
print('saved', out_p, 'rows', ws.max_row - 1)
