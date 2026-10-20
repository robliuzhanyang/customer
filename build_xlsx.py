import json
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

rows = []
with open('/workspace/data_page1.json', encoding='utf-8') as f:
    rows += [(1, r) for r in json.load(f)]
with open('/workspace/data_page2.json', encoding='utf-8') as f:
    rows += [(2, r) for r in json.load(f)]

headers = ['序号', '页码', '客户ID', '客户名称', '公司名称', '公司法人', '负责人',
           '手机', 'Hot取号', '电话', '企业地址', '地区', 'Hot联系方式(打码)', '备注']
FONT = 'Arial'
thin = Side(style='thin', color='D9DEE7')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
head_fill = PatternFill('solid', fgColor='1F4E79')
z1 = PatternFill('solid', fgColor='FFFFFF')
z2 = PatternFill('solid', fgColor='F7F9FC')

wb = Workbook()
ws = wb.active
ws.title = '客户数据'

for c, h in enumerate(headers, 1):
    cell = ws.cell(row=1, column=c, value=h)
    cell.font = Font(name=FONT, bold=True, color='FFFFFF', size=10)
    cell.fill = head_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border
ws.row_dimensions[1].height = 30

for i, (page, r) in enumerate(rows, start=2):
    note = []
    if r.get('hotBtn') == 1:
        note.append('Hot已解锁')
    elif r.get('hotmask') in ('', '--'):
        note.append('无Hot联系方式')
    else:
        note.append('Hot仅显示姓名，无解锁按钮')
    if r.get('mobile') in ('', '--'):
        note.append('平台无手机号')
    if r.get('tel') in ('', '--'):
        note.append('无固定电话')

    vals = [i - 1, page, r['key'], r['name'], r['companyD'], r['legal'], r['charger'],
            r['mobile'], r.get('hotNum', ''), r['tel'], r['address'], r['region'],
            r['hotmask'], '；'.join(note)]
    fill = z1 if (i % 2 == 0) else z2
    for c, v in enumerate(vals, 1):
        cell = ws.cell(row=i, column=c, value=v)
        cell.font = Font(name=FONT, size=10)
        cell.fill = fill
        cell.border = border
        cell.alignment = Alignment(vertical='center', wrap_text=(c in (5, 11, 13, 14)))

for i, w in enumerate([6, 6, 26, 32, 32, 11, 9, 14, 14, 15, 55, 30, 19, 30], 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'A2'
ws.auto_filter.ref = f'A1:N{len(rows) + 1}'

s = wb.create_sheet('采集概览')
s['A1'] = '探迹CRM 我的客户 · 采集概览'
s['A1'].font = Font(name=FONT, bold=True, size=14, color='1F4E79')
s.merge_cells('A1:C1')

kpi = [
    ('采集条数', '=COUNTA(客户数据!C2:C101)', '0'),
    ('手机号数量', '=COUNTA(客户数据!H2:H101)-COUNTIF(客户数据!H2:H101,"--")', '0'),
    ('手机号覆盖率', '=B4/B3', '0.0%'),
    ('Hot 解锁条数', '=COUNTA(客户数据!I2:I101)', '0'),
    ('固定电话条数', '=COUNTA(客户数据!J2:J101)-COUNTIF(客户数据!J2:J101,"--")', '0'),
    ('已采集页数', '=MAX(客户数据!B2:B101)', '0'),
]
r0 = 3
s['A2'] = '指标'; s['B2'] = '数值'; s['C2'] = '说明'
for c in ('A2', 'B2', 'C2'):
    s[c].font = Font(name=FONT, bold=True, size=10, color='FFFFFF')
    s[c].fill = head_fill
    s[c].border = border

notes = ['', '', '', '手机号非空条数 / 采集条数', '带 @@@ 遮罩成功点开的条数', '电话字段非"--"的条数', '']
for idx, (label, formula, fmt) in enumerate(kpi):
    r = r0 + idx
    s.cell(r, 1, label).font = Font(name=FONT, size=10)
    bc = s.cell(r, 2, formula)
    bc.font = Font(name=FONT, size=10, bold=True, color='1F2937')
    bc.number_format = fmt
    bc.alignment = Alignment(horizontal='center')
    s.cell(r, 3, notes[idx]).font = Font(name=FONT, size=9, color='6B7280')
    for c in range(1, 4):
        s.cell(r, c).border = border
        if (r - r0) % 2 == 1:
            s.cell(r, c).fill = z2

s['A10'] = '字段口径'
s['A10'].font = Font(name=FONT, bold=True, size=11, color='1F4E79')
docs = [
    ('客户ID', '列表行 data-row-key，即客户唯一标识'),
    ('手机', '详情抽屉「手机」字段，平台已解密展示'),
    ('Hot取号', '仅列表 Hot 单元格带 @@@ 遮罩时点开抽屉取得的完整号码'),
    ('电话', '详情抽屉「电话」字段（多为 "--"，少数为固话）'),
    ('Hot联系方式(打码)', '列表原样文本，未做加工'),
    ('备注', '数据缺失原因说明，便于后续复核'),
]
for i, (k, v) in enumerate(docs, 1):
    s.cell(10 + i, 1, k).font = Font(name=FONT, size=10, bold=True)
    s.cell(10 + i, 2, v).font = Font(name=FONT, size=9, color='374151')
    s.merge_cells(start_row=10 + i, start_column=2, end_row=10 + i, end_column=3)

s['A19'] = '采集方式：页面逐条点击「查看」读取右侧抽屉，未调用任何数据接口；每页 10 条。'
s['A19'].font = Font(name=FONT, size=9, italic=True, color='6B7280')
s.column_dimensions['A'].width = 18
s.column_dimensions['B'].width = 46
s.column_dimensions['C'].width = 30

out = '/workspace/探迹CRM_我的客户_前20条.xlsx'
wb.save(out)
print('saved', out, len(rows))
