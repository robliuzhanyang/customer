import json, glob, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

BASE = '/workspace/11月搜索客户'

FILES = [('资质新办·贵州', '资质新办_贵州_raw.json'),
         ('资质延期·贵州', '资质延期_贵州_raw.json'),
         ('资质升级·贵州', '资质升级_贵州_raw.json'),
         ('动态核查·贵州', '动态核查_贵州_raw.json'),
         ('资质异常·贵州', '资质异常_贵州_raw.json'),
         ('申请未过·贵州', '申请未过_贵州_raw.json')]

prior = set()
for p in glob.glob('/workspace/qcs_*.json'):
    try:
        d = json.load(open(p, encoding='utf-8'))
        if isinstance(d, list):
            for x in d:
                if isinstance(x, dict) and x.get('n'):
                    prior.add(x['n'])
    except Exception:
        pass

rows = []
by_group = {}
seen = {}
for src, fn in FILES:
    d = json.load(open(os.path.join(BASE, fn), encoding='utf-8'))
    recs = []
    for x in d:
        n = (x.get('n') or '').strip()
        if not n:
            continue
        if n in seen:
            r = seen[n]
            if src not in r['src']:
                r['src'].append(src)
            for k, v in (('l', 'l'), ('cap', 'cap'), ('f', 'f'), ('rg', 'rg')):
                if not r[k] and x.get(k):
                    r[k] = x[k]
            if len(x.get('rq') or '') > len(r['rq']):
                r['rq'] = x['rq']
        else:
            r = {'n': n, 'l': x.get('l', ''), 'cap': x.get('cap', ''), 'f': x.get('f', ''),
                 'rg': x.get('rg', ''), 'tel': x.get('tel', ''), 'rq': x.get('rq', ''), 'src': [src]}
            seen[n] = r
            rows.append(r)
        recs.append(x)
    by_group[src] = d

def cnt(t):
    t = str(t or '')
    return t if t.isdigit() and 1 <= int(t) <= 20 else ''

wb = Workbook()
ws = wb.active
ws.title = '汇总说明'
info = [
    ['11月搜索客户 · 贵州资质客群采集汇总', ''],
    ['', ''],
    ['采集时间', '2026-11'],
    ['数据来源', '探迹拓客·资质版（qcs.tungee.com）'],
    ['筛选地区', '贵州省（客群自带地区筛选状态；资质新办/申请未过为全国列表内过滤贵州）'],
    ['采集方式', '页面列表逐页抓取（200条/页，最多15页/客群）'],
    ['', ''],
    ['客群', '去重后条数'],
]
for src, _ in FILES:
    info.append([src, len(by_group[src])])
info += [['', ''],
         ['本月全量（跨客群去重）', len(rows)],
         ['其中：历史未采集的新客户', len([r for r in rows if r['n'] not in prior])],
         ['其中：历史已采集（重复）', len([r for r in rows if r['n'] in prior])],
         ['', ''],
         ['字段说明', '序号/企业名称/法定代表人/注册资本/成立时间/所在地区/联系方式数/数据来源(客群)/是否历史已采/资质推荐信息']]
for i, (a, b) in enumerate(info, 1):
    ws.cell(row=i, column=1, value=a)
    ws.cell(row=i, column=2, value=b)
ws['A1'].font = Font(size=14, bold=True)
ws['A8'].font = Font(bold=True)
ws.column_dimensions['A'].width = 34
ws.column_dimensions['B'].width = 60
ws['B5'].alignment = Alignment(wrap_text=True, vertical='top')

HEAD = ['序号', '企业名称', '法定代表人', '注册资本', '成立时间', '所在地区', '联系方式数', '数据来源(客群)', '是否历史已采', '资质/推荐信息']
WID = [6, 40, 12, 14, 12, 26, 10, 24, 12, 70]

def write_sheet(name, data):
    s = wb.create_sheet(name)
    s.append(HEAD)
    for c in range(1, len(HEAD) + 1):
        cell = s.cell(row=1, column=c)
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor='305496')
        cell.alignment = Alignment(horizontal='center', vertical='center')
    for i, r in enumerate(data, 1):
        s.append([i, r['n'], r['l'], r['cap'], r['f'], r['rg'], cnt(r['tel']),
                  '、'.join(r['src']), '是' if r['n'] in prior else '否', r['rq']])
    for i, w in enumerate(WID, 1):
        s.column_dimensions[get_column_letter(i)].width = w
    s.freeze_panes = 'A2'
    s.auto_filter.ref = 'A1:J%d' % (len(data) + 1)
    for row in s.iter_rows(min_row=2, max_row=len(data) + 1, max_col=10):
        row[9].alignment = Alignment(wrap_text=True, vertical='top')
        row[5].alignment = Alignment(wrap_text=True, vertical='top')

write_sheet('全量汇总', rows)
write_sheet('本月新增', [r for r in rows if r['n'] not in prior])
for src, fn in FILES:
    d = by_group[src]
    tmp = []
    seen2 = set()
    for x in d:
        n = (x.get('n') or '').strip()
        if not n or n in seen2:
            continue
        seen2.add(n)
        tmp.append({'n': n, 'l': x.get('l', ''), 'cap': x.get('cap', ''), 'f': x.get('f', ''),
                    'rg': x.get('rg', ''), 'tel': x.get('tel', ''), 'rq': x.get('rq', ''), 'src': [src]})
    write_sheet(src, tmp)

OUT = os.path.join(BASE, '11月搜索客户_贵州_资质客群_%d条.xlsx' % len(rows))
wb.save(OUT)
print('saved', OUT, 'rows', len(rows), 'new', len([r for r in rows if r['n'] not in prior]))
