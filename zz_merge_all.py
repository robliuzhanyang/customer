import json, glob, os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

SRC = [
    ('资质延期·3月内到期·贵州', ['qcs_due_p*.json']),
    ('资质延期·贵州', ['qcs_delay_1.json', 'qcs_delay_2.json', 'qcs_delay_p*.json']),
    ('资质新办·贵州', ['qcs_new_1.json', 'qcs_new_2.json', 'qcs_new_p*.json']),
    ('资质升级·贵州', ['qcs_upg_p*.json']),
    ('动态核查·贵州', ['qcs_dyn_p*.json']),
    ('资质异常·贵州', ['qcs_abn_p*.json']),
    ('申请未过·全国', ['qcs_rej_p*.json']),
]

F = 'Arial'
thin = Side(style='thin', color='D9DEE7')
bd = Border(left=thin, right=thin, top=thin, bottom=thin)
hf = PatternFill('solid', fgColor='1F4E79')
z1 = PatternFill('solid', fgColor='FFFFFF')
z2 = PatternFill('solid', fgColor='F7F9FC')


def load(patterns):
    files = []
    for p in patterns:
        files += glob.glob('/workspace/' + p)
    files = sorted(set(files))
    rows, seen = [], set()
    for f in files:
        if 'non_gz' in f:
            continue
        try:
            data = json.load(open(f))
        except Exception:
            continue
        for r in data:
            n = (r.get('n') or '').strip()
            if not n or n in seen:
                continue
            seen.add(n)
            rows.append(r)
    return rows


def style_sheet(ws, header, widths, rows, keys):
    for i, h in enumerate(header, 1):
        c = ws.cell(1, i, h)
        c.font = Font(name=F, bold=True, color='FFFFFF', size=10)
        c.fill = hf; c.border = bd
        c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws.row_dimensions[1].height = 28
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for i, r in enumerate(rows, 1):
        vals = [i] + [r.get(k, '') for k in keys]
        fill = z1 if i % 2 else z2
        for j, v in enumerate(vals, 1):
            c = ws.cell(i + 1, j, v)
            c.font = Font(name=F, size=9); c.fill = fill; c.border = bd
            c.alignment = Alignment(vertical='center', wrap_text=(j in (2, 8, 11)))
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = 'A1:%s%d' % (get_column_letter(len(header)), len(rows) + 1)


merged = {}
order = []
stats = []
for label, pats in SRC:
    rows = load(pats)
    stats.append((label, len(rows)))
    for r in rows:
        n = r['n'].strip()
        rq = (r.get('rq') or '').strip()
        if n not in merged:
            merged[n] = {'n': n, 'l': r.get('l', ''), 'cap': r.get('cap', ''),
                         'f': r.get('f', ''), 'rg': r.get('rg', ''),
                         'tel': r.get('tel', ''), 'rq': rq, 'src': [label]}
            order.append(n)
        else:
            m = merged[n]
            if label not in m['src']:
                m['src'].append(label)
            for k in ('l', 'cap', 'f', 'rg', 'tel'):
                if not m.get(k) and r.get(k):
                    m[k] = r.get(k)
            if len(rq) > len(m['rq']):
                m['rq'] = rq

out_rows = []
for n in order:
    m = merged[n]
    m['srcs'] = '、'.join(m.pop('src'))
    out_rows.append(m)

wb = Workbook()
ws0 = wb.active
ws0.title = '汇总说明'
ws0['A1'] = '资质客群数据汇总（探迹拓客·资质版）'
ws0['A1'].font = Font(name=F, bold=True, size=14)
ws0['A2'] = '采集日期'
ws0['B2'] = '2026-10-30'
ws0['A3'] = '合并后企业总数（去重）'
ws0['B3'] = len(out_rows)
ws0['A5'] = '客群'
ws0['B5'] = '企业数'
for c in ('A5', 'B5'):
    ws0[c].font = Font(name=F, bold=True, color='FFFFFF')
    ws0[c].fill = hf
for i, (label, cnt) in enumerate(stats, 6):
    ws0.cell(i, 1, label).font = Font(name=F, size=10)
    ws0.cell(i, 2, cnt).font = Font(name=F, size=10)
ws0.column_dimensions['A'].width = 34
ws0.column_dimensions['B'].width = 14

H = ['序号', '企业名称', '法定代表人', '注册资本', '成立时间', '所在地区', '联系方式数', '数据来源(客群)', '资质/推荐信息']
W = [6, 42, 11, 16, 13, 26, 10, 34, 66]
keys = ['n', 'l', 'cap', 'f', 'rg', 'tel', 'srcs', 'rq']
ws = wb.create_sheet('全量汇总')
style_sheet(ws, H, W, out_rows, keys)

for label, pats in SRC:
    rows = load(pats)
    if not rows:
        continue
    name = label.replace('·', '-')[:31]
    s = wb.create_sheet(name)
    style_sheet(s, H[:-1], W[:-1], rows, keys[:-1])

path = '/workspace/通讯录输出/资质客群_全量汇总_%d条.xlsx' % len(out_rows)
wb.save(path)
print('unique', len(out_rows))
for label, cnt in stats:
    print(label, cnt)
print(path)
