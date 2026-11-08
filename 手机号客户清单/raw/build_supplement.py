import json, re, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

tz_p = '/workspace/通讯录输出/探迹CRM_客户通讯录_终版+.xlsx'
raw_p = '/workspace/11月搜索客户/资质新办_贵州_raw.json'
nov_p = '/workspace/手机号客户清单/11月整合_有手机号客户_17921条.xlsx'
oct_p = '/workspace/手机号客户清单/10-11月整合_有手机号客户_24722条.xlsx'
p110 = '/workspace/手机号客户清单/11月新增_有手机号客户_第一批110条.xlsx'
out_p = '/workspace/手机号客户清单/11月整合_补漏_归一匹配_77条.xlsx'

def norm(s):
    s = str(s or '').strip().translate(str.maketrans('（）【】［］　', '()[][] '))
    return re.sub(r'[\s\(\)\[\]\-·、,，.。]', '', s)

# 通讯录
wb = openpyxl.load_workbook(tz_p, read_only=True)
ws = wb[wb.sheetnames[0]]
hdr = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
ci = {h: i for i, h in enumerate(hdr)}
tz = {}
for r in ws.iter_rows(min_row=2, values_only=True):
    name, phone = r[ci['客户名称']], str(r[ci['手机']] or '').strip()
    if name and re.fullmatch(r'1[3-9]\d{9}', phone):
        tz[str(name).strip()] = {
            'phone': phone,
            'legal': r[ci.get('公司法人', 3)] or '',
            'addr': r[ci.get('企业地址', 9)] or '',
            'region': r[ci.get('地区', 8)] or '',
            'status': r[ci.get('客户状态', 11)] or '',
        }
tz_norm = {}
for k, v in tz.items():
    tz_norm.setdefault(norm(k), (k, v))

def load_names(p):
    wb = openpyxl.load_workbook(p, read_only=True)
    ws = wb[wb.sheetnames[0]]
    h = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    k = next(i for i, x in enumerate(h) if x in ('客户名称', '公司名称', '企业名称'))
    return {str(r[k]).strip() for r in ws.iter_rows(min_row=2, values_only=True) if r[k]}

delivered = load_names(nov_p) | load_names(oct_p) | load_names(p110)
delivered_norm = {norm(x) for x in delivered}

raw = {str(x.get('n') or '').strip(): x for x in json.load(open(raw_p, encoding='utf-8')) if x.get('n')}

rows = []
for n, x in raw.items():
    k = norm(n)
    if k in delivered_norm or k not in tz_norm:
        continue
    tzname, info = tz_norm[k]
    rows.append({
        '客户名称': n,
        '公司法人': info['legal'] or x.get('l') or '',
        '注册资本': x.get('cap') or '',
        '成立时间': x.get('f') or '',
        '所在地区': info['region'] or x.get('rg') or '',
        '手机': info['phone'],
        '企业详细地址': info['addr'] or '',
        '客户状态': info['status'] or '',
        '数据来源': '11月客群×通讯录（名称归一匹配补漏）',
    })

print('补漏条数', len(rows))

wb2 = openpyxl.Workbook()
ws2 = wb2.active
ws2.title = '补漏_有手机号'
cols = ['序号', '客户名称', '公司法人', '注册资本', '成立时间', '所在地区',
        '手机', '手机号校验', '企业详细地址', '客户状态', '数据来源']
ws2.append(cols)

head_fill = PatternFill('solid', fgColor='1F4E79')
thin = Side(style='thin', color='BFBFBF')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
for c in ws2[1]:
    c.font = Font(bold=True, color='FFFFFF', size=11)
    c.fill = head_fill
    c.alignment = Alignment(horizontal='center', vertical='center')
    c.border = border

for i, r in enumerate(rows, 1):
    ws2.append([i, r['客户名称'], r['公司法人'], r['注册资本'], r['成立时间'], r['所在地区'],
                r['手机'], '通过', r['企业详细地址'], r['客户状态'], r['数据来源']])

for row in ws2.iter_rows(min_row=2):
    for c in row:
        c.border = border
        c.alignment = Alignment(vertical='center', wrap_text=True)

widths = [6, 42, 12, 16, 13, 22, 15, 10, 55, 10, 34]
for i, w in enumerate(widths, 1):
    ws2.column_dimensions[get_column_letter(i)].width = w
ws2.freeze_panes = 'C2'
ws2.auto_filter.ref = f'A1:K{ws2.max_row}'

wb2.save(out_p)
print('已保存', out_p)
