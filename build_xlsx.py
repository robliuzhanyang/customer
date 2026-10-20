import glob
import json
import os
import re

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

CHUNK_DIR = '/workspace/chunks'
OUT = '/workspace/探迹CRM_我的客户_已采集.xlsx'

MAP_LONG = {
    'key': 'key', 'name': 'name', 'companyD': 'company', 'legal': 'legal',
    'hotmask': 'hotmask', 'charger': 'charger', 'telList': 'telList',
    'tel': 'tel', 'mobile': 'mobile', 'region': 'region', 'address': 'address',
    'status': 'status', 'ctype': 'ctype', 'hotNum': 'hotNum', 'hotBtn': 'hotBtn',
    'err': 'err',
}
MAP_SHORT = {
    'k': 'key', 'n': 'name', 'c': 'company', 'l': 'legal', 'h': 'hotmask',
    'ch': 'charger', 'tl': 'telList', 'tel': 'tel', 'm': 'mobile', 'rg': 'region',
    'ad': 'address', 'st': 'status', 'ct': 'ctype', 'hn': 'hotNum', 'err': 'err',
}


def norm(rec):
    table = MAP_LONG if 'key' in rec else MAP_SHORT
    out = {}
    for src, dst in table.items():
        val = rec.get(src)
        out[dst] = '' if val is None else val
    out['hotBtn'] = int(rec.get('hotBtn') or 0)
    return out


def txt(v):
    if v is None:
        return ''
    if isinstance(v, str):
        return v.replace('\x00', '').strip()
    return str(v)


rows = []
seen = set()
skipped = []
for path in sorted(glob.glob(os.path.join(CHUNK_DIR, 'p*.json'))):
    m = re.search(r'p(\d+)\.json$', path)
    if not m:
        continue
    page = int(m.group(1))
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
    except Exception as exc:
        skipped.append((page, 'read:' + str(exc)))
        continue
    if not isinstance(data, list):
        skipped.append((page, 'not-list'))
        continue
    for rec in data:
        item = norm(rec)
        if not item['key']:
            skipped.append((page, 'no-key'))
            continue
        if item['key'] in seen:
            continue
        seen.add(item['key'])
        item['page'] = page
        rows.append(item)

rows.sort(key=lambda r: r['page'])

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

last = len(rows) + 1
for i, r in enumerate(rows, start=2):
    note = []
    if r['err']:
        note.append('采集异常(%s)，待补采' % r['err'])
    if r['hotNum']:
        note.append('Hot已解锁')
    elif r['hotmask'] in ('', '--'):
        note.append('无Hot联系方式')
    elif r['hotBtn'] == 1:
        note.append('Hot已解锁')
    else:
        note.append('Hot仅显示姓名，无解锁按钮')
    if r['mobile'] in ('', '--'):
        note.append('平台无手机号')
    if r['tel'] in ('', '--'):
        note.append('无固定电话')

    vals = [i - 1, r['page'], r['key'], txt(r['name']), txt(r['company']), txt(r['legal']),
            txt(r['charger']), txt(r['mobile']), txt(r['hotNum']), txt(r['tel']),
            txt(r['address']), txt(r['region']), txt(r['hotmask']), '；'.join(note)]
    fill = z1 if i % 2 == 0 else z2
    for c, v in enumerate(vals, 1):
        cell = ws.cell(row=i, column=c, value=v)
        cell.font = Font(name=FONT, size=10)
        cell.fill = fill
        cell.border = border
        cell.alignment = Alignment(vertical='center', wrap_text=(c in (5, 11, 13, 14)))

for i, w in enumerate([6, 6, 26, 34, 34, 11, 9, 14, 14, 15, 55, 30, 19, 34], 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'A2'
ws.auto_filter.ref = 'A1:N%d' % last

s = wb.create_sheet('采集概览')
s['A1'] = '探迹CRM 我的客户 · 采集概览'
s['A1'].font = Font(name=FONT, bold=True, size=14, color='1F4E79')
s.merge_cells('A1:C1')

A = '客户数据!'
kpi = [
    ('采集条数', '=COUNTA(%sC2:C%d)' % (A, last), '0', '已去重的客户记录数'),
    ('手机号数量', '=COUNTA(%sH2:H%d)-COUNTIF(%sH2:H%d,"--")' % (A, last, A, last), '0', '手机号非空条数'),
    ('手机号覆盖率', '=B4/B3', '0.0%', '手机号数量 / 采集条数'),
    ('Hot 解锁条数', '=COUNTA(%sI2:I%d)' % (A, last), '0', '成功取到完整号码的条数'),
    ('固定电话条数', '=COUNTA(%sJ2:J%d)-COUNTIF(%sJ2:J%d,"--")' % (A, last, A, last), '0', '电话字段非 "--" 的条数'),
    ('已采集页数', '=MAX(%sB2:B%d)' % (A, last), '0', '当前最大页码'),
    ('平均每页条数', '=B3/B8', '0.0', '采集条数 / 已采集页数'),
]
s['A2'] = '指标'
s['B2'] = '数值'
s['C2'] = '说明'
for c in ('A2', 'B2', 'C2'):
    s[c].font = Font(name=FONT, bold=True, size=10, color='FFFFFF')
    s[c].fill = head_fill
    s[c].border = border
for idx, (label, formula, fmt, desc) in enumerate(kpi):
    r = 3 + idx
    s.cell(r, 1, label).font = Font(name=FONT, size=10)
    bc = s.cell(r, 2, formula)
    bc.font = Font(name=FONT, size=10, bold=True, color='1F2937')
    bc.number_format = fmt
    bc.alignment = Alignment(horizontal='center')
    s.cell(r, 3, desc).font = Font(name=FONT, size=9, color='6B7280')
    for c in range(1, 4):
        s.cell(r, c).border = border
        if idx % 2 == 1:
            s.cell(r, c).fill = z2

s['A11'] = '字段口径'
s['A11'].font = Font(name=FONT, bold=True, size=11, color='1F4E79')
docs = [
    ('客户ID', '列表行 data-row-key，即客户唯一标识'),
    ('手机', '详情抽屉「手机」字段，平台已解密展示'),
    ('Hot取号', '仅列表 Hot 单元格带 @@@ 遮罩时点开抽屉取得的完整号码'),
    ('电话', '详情抽屉「电话」字段（多为 "--"，少数为固话）'),
    ('Hot联系方式(打码)', '列表原样文本，未做加工'),
    ('备注', '数据缺失或采集异常原因说明，便于后续复核'),
]
for i, (k, v) in enumerate(docs, 1):
    s.cell(11 + i, 1, k).font = Font(name=FONT, size=10, bold=True)
    s.cell(11 + i, 2, v).font = Font(name=FONT, size=9, color='374151')
    s.merge_cells(start_row=11 + i, start_column=2, end_row=11 + i, end_column=3)

s['A20'] = '采集方式：页面逐条点击「查看」读取右侧抽屉，未调用任何数据接口；每页 10 条。'
s['A20'].font = Font(name=FONT, size=9, italic=True, color='6B7280')
s.column_dimensions['A'].width = 18
s.column_dimensions['B'].width = 46
s.column_dimensions['C'].width = 30

wb.save(OUT)
print('saved', OUT)
print('rows', len(rows), 'pages', rows[-1]['page'] if rows else 0, 'skipped', skipped[:10])
