import json, os, re, glob
import openpyxl
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

BASE = '/workspace'
OUTDIR = '/workspace/10-11月整合'
os.makedirs(OUTDIR, exist_ok=True)

def norm(s):
    return re.sub(r'\s+', '', (s or '').strip())

def cnt(t):
    t = str(t or '')
    return t if t.isdigit() and 1 <= int(t) <= 20 else ''

# ---------- 10月：CRM 跟进中客户 25,744 ----------
crm = json.load(open(os.path.join(BASE, 'export_recs.json'), encoding='utf-8'))
OCT_CRM = {}
for x in crm:
    n = norm(x.get('n') or x.get('c'))
    if not n:
        continue
    OCT_CRM[n] = {
        'name': (x.get('n') or x.get('c') or '').strip(),
        'l': (x.get('l') or '').strip(),
        'tel': (x.get('tel') or '').strip(),
        'ch': (x.get('ch') or '').strip(),
        'st': (x.get('st') or '').strip(),
        'lf': (x.get('lf') or '').strip(),
        'ct': (x.get('ct') or '').strip(),
        'k': (x.get('k') or '').strip(),
    }

# ---------- 10月：已采集 3,220 ----------
wb0 = openpyxl.load_workbook(os.path.join(BASE, '探迹CRM_我的客户_已采集.xlsx'), read_only=True)
ws0 = wb0['客户数据']
OCT_COLL = {}
for r in ws0.iter_rows(min_row=2, values_only=True):
    n = norm(r[3])
    if not n:
        continue
    OCT_COLL[n] = {
        'name': (r[3] or '').strip(),
        'l': (r[5] or '').strip(),
        'mobile': (r[7] or '').strip(),
        'tel_real': ((r[9] or '').strip() if (r[9] or '').strip() not in ('--', '') else ''),
        'addr': (r[10] or '').strip(),
        'region': (r[11] or '').strip(),
        'note': (r[13] or '').strip(),
    }

# ---------- 10月：资质客群 3,953 ----------
wb1 = openpyxl.load_workbook(os.path.join(BASE, '通讯录输出/资质客群_全量汇总_3953条.xlsx'), read_only=True)
ws1 = wb1['全量汇总']
OCT_GROUP = {}
for r in ws1.iter_rows(min_row=2, values_only=True):
    n = norm(r[1])
    if not n:
        continue
    OCT_GROUP[n] = {
        'name': (r[1] or '').strip(), 'l': (r[2] or '').strip(), 'cap': (r[3] or '').strip(),
        'f': (r[4] or '').strip(), 'rg': (r[5] or '').strip(), 'telc': (r[6] or '').strip(),
        'gsrc': (r[7] or '').strip(), 'rq': (r[8] or '').strip(),
    }

# ---------- 11月：搜索客户 18,020 ----------
NOV_FILES = [('资质新办', '资质新办_贵州_raw.json'),
             ('资质延期', '资质延期_贵州_raw.json'),
             ('资质升级', '资质升级_贵州_raw.json'),
             ('动态核查', '动态核查_贵州_raw.json'),
             ('资质异常', '资质异常_贵州_raw.json'),
             ('申请未过', '申请未过_贵州_raw.json')]
NOV = {}
NOV_COUNTS = {}
for label, fn in NOV_FILES:
    d = json.load(open(os.path.join(BASE, '11月搜索客户', fn), encoding='utf-8'))
    NOV_COUNTS[label] = len(d)
    for x in d:
        n = norm(x.get('n'))
        if not n:
            continue
        if n in NOV:
            NOV[n]['src'].append(label)
            if len(x.get('rq') or '') > len(NOV[n]['rq']):
                NOV[n]['rq'] = x.get('rq') or ''
            for k in ('l', 'cap', 'f', 'rg'):
                if not NOV[n][k] and x.get(k):
                    NOV[n][k] = x[k]
            if not NOV[n]['telc'] and x.get('tel'):
                NOV[n]['telc'] = x['tel']
        else:
            NOV[n] = {'name': (x.get('n') or '').strip(), 'l': x.get('l', ''), 'cap': x.get('cap', ''),
                      'f': x.get('f', ''), 'rg': x.get('rg', ''), 'telc': x.get('tel', ''),
                      'rq': x.get('rq', ''), 'src': [label]}

# ---------- 合并去重 ----------
ALL = {}
for src, d, tag in ((OCT_CRM, OCT_CRM, '10月·CRM跟进中'),
                    (OCT_COLL, OCT_COLL, '10月·已采集'),
                    (OCT_GROUP, OCT_GROUP, '10月·资质客群')):
    for n, v in d.items():
        if n not in ALL:
            ALL[n] = {'name': v['name'], 'l': v.get('l', ''), 'cap': v.get('cap', ''), 'f': v.get('f', ''),
                      'rg': v.get('rg', ''), 'telc': v.get('telc', ''), 'mobile': v.get('mobile', ''),
                      'tel_real': v.get('tel_real', ''), 'addr': v.get('addr', ''),
                      'ch': v.get('ch', ''), 'st': v.get('st', ''), 'lf': v.get('lf', ''),
                      'ct': v.get('ct', ''), 'rq': v.get('rq', ''), 'gsrc': v.get('gsrc', ''),
                      'src': [tag], 'oct': True, 'nov': False, 'novsrc': [], 'k': v.get('k', '')}
        else:
            r = ALL[n]
            if tag not in r['src']:
                r['src'].append(tag)
            for a, b in (('l', 'l'), ('cap', 'cap'), ('f', 'f'), ('rg', 'rg'), ('telc', 'telc'),
                         ('mobile', 'mobile'), ('tel_real', 'tel_real'), ('addr', 'addr'),
                         ('ch', 'ch'), ('st', 'st'), ('lf', 'lf'), ('ct', 'ct'), ('k', 'k'),
                         ('gsrc', 'gsrc')):
                if not r[a] and v.get(b):
                    r[a] = v[b]
            if len(v.get('rq') or '') > len(r['rq']):
                r['rq'] = v['rq']

for n, v in NOV.items():
    if n not in ALL:
        ALL[n] = {'name': v['name'], 'l': v.get('l', ''), 'cap': v.get('cap', ''), 'f': v.get('f', ''),
                  'rg': v.get('rg', ''), 'telc': v.get('telc', ''), 'mobile': '', 'tel_real': '',
                  'addr': '', 'ch': '', 'st': '', 'lf': '', 'ct': '', 'rq': v.get('rq', ''),
                  'gsrc': '', 'src': ['11月·搜索客户'], 'oct': False, 'nov': True,
                  'novsrc': list(v['src']), 'k': ''}
    else:
        r = ALL[n]
        if '11月·搜索客户' not in r['src']:
            r['src'].append('11月·搜索客户')
        r['nov'] = True
        r['novsrc'] = list(v['src'])
        for a, b in (('l', 'l'), ('cap', 'cap'), ('f', 'f'), ('rg', 'rg')):
            if not r[a] and v.get(b):
                r[a] = v[b]
        if not r['telc'] and v.get('telc'):
            r['telc'] = v['telc']
        if len(v.get('rq') or '') > len(r['rq']):
            r['rq'] = v['rq']

rows = list(ALL.values())
rows.sort(key=lambda r: (0 if r['nov'] else 1, r['name']))

# 统计
oct_set = set(OCT_CRM) | set(OCT_GROUP)
nov_set = set(NOV)
dup_nov_oct = nov_set & oct_set
nov_new = nov_set - oct_set
oct_internal = {
    'crm': len(OCT_CRM),
    'coll': len(OCT_COLL),
    'group': len(OCT_GROUP),
    'coll_in_crm': len(set(OCT_COLL) & set(OCT_CRM)),
    'group_in_crm': len(set(OCT_GROUP) & set(OCT_CRM)),
    'group_only': len(set(OCT_GROUP) - set(OCT_CRM)),
}

HEAD = ['序号', '企业名称', '法定代表人', '注册资本', '成立时间', '所在地区', '手机号',
        '固定/座机号', '联系方式数', '负责人', '跟进状态', '最后跟进时间', '首次建档时间',
        '数据来源', '10月历史', '11月新增', '11月客群', '企业地址', '资质/推荐信息']
WID = [6, 40, 12, 14, 12, 26, 14, 14, 10, 10, 10, 20, 20, 30, 8, 8, 20, 40, 70]

wb = Workbook(write_only=True)
ws = wb.create_sheet('汇总说明')

info = [
    ['10-11月 贵州资质客户数据整合（完整版）', ''],
    ['', ''],
    ['生成日期', '2026-11-06'],
    ['数据来源', '探迹拓客·资质版 / 探迹CRM'],
    ['', ''],
    ['一、数据源规模', '原始条数'],
    ['10月·CRM跟进中客户（导出 2026-10-22）', oct_internal['crm']],
    ['10月·已采集客户（探迹CRM我的客户）', oct_internal['coll']],
    ['10月·资质客群库（探迹拓客·资质版）', oct_internal['group']],
    ['11月·搜索客户（本轮新增采集）', len(NOV)],
    ['其中：11月资质新办', NOV_COUNTS['资质新办']],
    ['其中：11月资质延期', NOV_COUNTS['资质延期']],
    ['其中：11月资质升级', NOV_COUNTS['资质升级']],
    ['其中：11月动态核查', NOV_COUNTS['动态核查']],
    ['其中：11月资质异常', NOV_COUNTS['资质异常']],
    ['其中：11月申请未过', NOV_COUNTS['申请未过']],
    ['', ''],
    ['二、重复情况梳理（按企业名称去重）', '条数'],
    ['10月已采集 3,220 条 中，与 CRM跟进中重复', oct_internal['coll_in_crm']],
    ['10月资质客群 3,953 条 中，与 CRM跟进中重复', oct_internal['group_in_crm']],
    ['10月资质客群 中，CRM跟进中未覆盖（独有）', oct_internal['group_only']],
    ['11月搜索 18,020 条 中，与10月历史重复', len(dup_nov_oct)],
    ['11月搜索 中，10月历史未覆盖（纯新增）', len(nov_new)],
    ['', ''],
    ['三、整合结果', '条数'],
    ['10-11月全量去重后总客户数', len(rows)],
    ['其中：10月历史客户', sum(1 for r in rows if r['oct'])],
    ['其中：11月新增客户（含与10月重复的跟进）', sum(1 for r in rows if r['nov'])],
    ['其中：仅10月、11月未再采集', sum(1 for r in rows if r['oct'] and not r['nov'])],
    ['其中：10月+11月均有（重复跟进）', sum(1 for r in rows if r['oct'] and r['nov'])],
    ['其中：仅11月新增', sum(1 for r in rows if r['nov'] and not r['oct'])],
    ['', ''],
    ['四、工作表说明', ''],
    ['全量整合', '10-11月全部客户，按企业名称去重，字段合并'],
    ['10月历史', '10月三个来源合并去重'],
    ['11月搜索', '11月采集客户（含与10月重复的）'],
    ['11月与10月重复', '11月采集到但10月历史已存在的客户'],
    ['11月纯新增', '11月采集且10月历史完全没有的客户'],
]
ws.append(['提示：本工作簿为完整整合版，所有行按企业名称去重，同一条数据可能来自多个来源。'])
ws.append([])
for a, b in info:
    ws.append([a, b])
ws.column_dimensions['A'].width = 44
ws.column_dimensions['B'].width = 60

def add_sheet(name, data):
    s = wb.create_sheet(name)
    s.append(HEAD)
    for i, r in enumerate(data, 1):
        s.append([i, r['name'], r['l'], r['cap'], r['f'], r['rg'],
                  r['mobile'], r['tel_real'] or r['telc'], cnt(r['telc']),
                  r['ch'], r['st'], r['lf'], r['ct'], '、'.join(r['src']),
                  '是' if r['oct'] else '否', '是' if r['nov'] else '否',
                  '、'.join(r['novsrc']), r['addr'], r['rq']])
    for i, w in enumerate(WID, 1):
        s.column_dimensions[get_column_letter(i)].width = w
    s.freeze_panes = 'A2'
    s.auto_filter.ref = 'A1:S%d' % (len(data) + 1)

add_sheet('全量整合', rows)
add_sheet('10月历史', [r for r in rows if r['oct']])
add_sheet('11月搜索', [r for r in rows if r['nov']])
add_sheet('11月与10月重复', [r for r in rows if r['nov'] and r['oct']])
add_sheet('11月纯新增', [r for r in rows if r['nov'] and not r['oct']])

OUT = os.path.join(OUTDIR, '10-11月贵州资质客户_全量整合_%d条.xlsx' % len(rows))
wb.save(OUT)
print('saved', OUT)
print('total', len(rows), 'oct', sum(1 for r in rows if r['oct']), 'nov', sum(1 for r in rows if r['nov']))
print('nov_dup_oct', len(dup_nov_oct), 'nov_new', len(nov_new))
