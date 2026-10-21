import glob
import json
import os
import re
import sys

CH = '/workspace/chunks'
OUT = '/workspace/通讯录输出'

COLS = [
    ('i', '序号'), ('n', '客户名称'), ('c', '公司名称'), ('l', '公司法人'),
    ('ch', '负责人'), ('m', '手机'), ('hot', 'Hot取号'), ('tel', '电话'),
    ('rg', '地区'), ('ad', '企业地址'), ('h', 'Hot联系方式(打码)'),
    ('st', '客户状态'), ('k', '客户ID'),
]

BAD = ('', '--', '-', 'None', 'null')


def clean(v):
    if v is None:
        return ''
    s = str(v).replace('\x00', '').replace('\r', ' ').replace('\n', ' ').strip()
    return '' if s in BAD else s


def load():
    rows = []
    seen = set()
    files = glob.glob(os.path.join(CH, 'p*.json'))
    files.sort(key=lambda x: int(re.search(r'p(\d+)\.json', x).group(1)))
    dup = 0
    for f in files:
        page = int(re.search(r'p(\d+)\.json', f).group(1))
        with open(f, encoding='utf-8') as fh:
            data = json.load(fh)
        for rec in data:
            if not isinstance(rec, dict):
                continue
            k = clean(rec.get('k') or rec.get('key'))
            if not k or k in seen:
                if k:
                    dup += 1
                continue
            seen.add(k)
            rows.append({
                'n': clean(rec.get('n') or rec.get('name')),
                'c': clean(rec.get('c') or rec.get('companyD')),
                'l': clean(rec.get('l') or rec.get('legal')),
                'ch': clean(rec.get('ch') or rec.get('charger')),
                'm': clean(rec.get('m') or rec.get('mobile')),
                'hot': clean(rec.get('hot') or rec.get('hotNum') or rec.get('hn')),
                'tel': clean(rec.get('tel')),
                'rg': clean(rec.get('rg') or rec.get('region')),
                'ad': clean(rec.get('ad') or rec.get('address')),
                'h': clean(rec.get('h') or rec.get('hotmask')),
                'st': clean(rec.get('st') or rec.get('status')),
                'k': k,
                '_p': page,
            })
    for i, r in enumerate(rows, 1):
        r['i'] = i
    return rows, dup, len(files)


def build_xlsx(rows, dup, nfiles):
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter

    FONT = 'Arial'
    thin = Side(style='thin', color='D9DEE7')
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    head_fill = PatternFill('solid', fgColor='1F4E79')
    z1 = PatternFill('solid', fgColor='FFFFFF')
    z2 = PatternFill('solid', fgColor='F7F9FC')

    wb = Workbook()
    ws = wb.active
    ws.title = '客户通讯录'
    widths = [6, 34, 34, 11, 9, 14, 14, 15, 30, 52, 19, 9, 26]
    for c, (key, name) in enumerate(COLS, 1):
        cell = ws.cell(row=1, column=c, value=name)
        cell.font = Font(name=FONT, bold=True, color='FFFFFF', size=10)
        cell.fill = head_fill
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = border
        ws.column_dimensions[get_column_letter(c)].width = widths[c - 1]
    ws.row_dimensions[1].height = 28

    for idx, r in enumerate(rows, start=2):
        fill = z1 if idx % 2 == 0 else z2
        for c, (key, _) in enumerate(COLS, 1):
            cell = ws.cell(row=idx, column=c, value=r[key])
            cell.font = Font(name=FONT, size=10)
            cell.fill = fill
            cell.border = border
            wrap = c in (2, 3, 9, 10, 11)
            cell.alignment = Alignment(vertical='center', wrap_text=wrap)
            if key in ('m', 'hot', 'tel', 'k'):
                cell.number_format = '@'
            elif key == 'i':
                cell.alignment = Alignment(horizontal='center', vertical='center')
    last = len(rows) + 1
    ws.freeze_panes = 'A2'
    ws.auto_filter.ref = 'A1:M%d' % last
    ws.print_title_rows = '1:1'
    ws.page_setup.orientation = 'landscape'
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0

    s = wb.create_sheet('采集概览')
    A = '客户通讯录!'
    s['A1'] = '探迹CRM 我的客户 · 客户通讯录概览'
    s['A1'].font = Font(name=FONT, bold=True, size=14, color='1F4E79')
    s.merge_cells('A1:C1')
    s['A2'], s['B2'], s['C2'] = '指标', '数值', '说明'
    for c in ('A2', 'B2', 'C2'):
        s[c].font = Font(name=FONT, bold=True, size=10, color='FFFFFF')
        s[c].fill = head_fill
        s[c].border = border
    kpi = [
        ('通讯录条数', '=COUNTA(%sM2:M%d)' % (A, last), '0', '按客户ID去重后的记录数'),
        ('手机号条数', '=COUNTA(%sF2:F%d)' % (A, last), '0', '手机字段非空条数'),
        ('手机号覆盖率', '=B4/B3', '0.0%', '手机号条数 / 通讯录条数'),
        ('Hot取号条数', '=COUNTA(%sG2:G%d)' % (A, last), '0', '成功解锁完整号码的条数'),
        ('Hot解锁覆盖率', '=B6/B3', '0.0%', 'Hot取号条数 / 通讯录条数'),
        ('固定电话条数', '=COUNTA(%sH2:H%d)' % (A, last), '0', '电话字段非空条数'),
        ('覆盖页数', '=COUNTA(%sM2:M%d)/10' % (A, last), '0', '采集页数（每页10条）'),
    ]
    for i, (label, formula, fmt, desc) in enumerate(kpi):
        row = 3 + i
        c1 = s.cell(row, 1, label)
        c1.font = Font(name=FONT, size=10)
        c2 = s.cell(row, 2, formula)
        c2.font = Font(name=FONT, size=10, bold=True, color='1F2937')
        c2.number_format = fmt
        c2.alignment = Alignment(horizontal='center')
        c3 = s.cell(row, 3, desc)
        c3.font = Font(name=FONT, size=9, color='6B7280')
        for c in range(1, 4):
            s.cell(row, c).border = border
            if i % 2 == 1:
                s.cell(row, c).fill = z2

    s['A11'] = '数据口径'
    s['A11'].font = Font(name=FONT, bold=True, size=11, color='1F4E79')
    docs = [
        ('数据来源', 'chunks 目录全量分页 JSON（%d 个分页文件，每页 10 条）' % nfiles),
        ('去重规则', '按客户ID去重，原始 %d 条，重复 %d 条已剔除' % (len(rows) + dup, dup)),
        ('手机', '详情抽屉「手机」字段，平台已解密展示'),
        ('Hot取号', '列表 Hot 单元格点击后解锁出的完整号码'),
        ('电话', '详情抽屉「电话」字段，多数为空'),
        ('空值', '原始占位符 "--" 已统一置空'),
    ]
    for i, (k, v) in enumerate(docs, 1):
        s.cell(11 + i, 1, k).font = Font(name=FONT, size=10, bold=True)
        s.cell(11 + i, 2, v).font = Font(name=FONT, size=9, color='374151')
        s.merge_cells(start_row=11 + i, start_column=2, end_row=11 + i, end_column=3)
    s.column_dimensions['A'].width = 18
    s.column_dimensions['B'].width = 52
    s.column_dimensions['C'].width = 34

    path = os.path.join(OUT, '探迹CRM_客户通讯录_全量.xlsx')
    wb.save(path)
    return path


def esc(s):
    return s.replace('|', '\\|')


def build_md(rows, dup, nfiles):
    lines = []
    lines.append('# 探迹CRM 客户通讯录（全量）')
    lines.append('')
    lines.append('- 数据来源：chunks 全量分页 JSON（%d 个分页文件，每页 10 条）' % nfiles)
    lines.append('- 记录条数：%d 条（按客户ID去重，剔除重复 %d 条）' % (len(rows), dup))
    lines.append('- 排序方式：按采集页序（创建时间升序）')
    lines.append('- 说明：原始占位符 `--` 已统一置空；`Hot取号` 为解锁后的完整号码，`Hot联系方式(打码)` 为列表原样文本')
    lines.append('')
    lines.append('| ' + ' | '.join(n for _, n in COLS) + ' |')
    lines.append('|' + '|'.join(['---'] * len(COLS)) + '|')
    for r in rows:
        lines.append('| ' + ' | '.join(esc(str(r[k])) for k, _ in COLS) + ' |')
    path = os.path.join(OUT, '探迹CRM_客户通讯录_全量.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    return path


def build_pdf(rows, dup, nfiles):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A3, landscape
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Table, TableStyle

    pdfmetrics.registerFont(TTFont('CN', '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc', subfontIndex=0))

    W, H = landscape(A3)
    LM = RM = 14 * mm
    TM = 16 * mm
    BM = 14 * mm

    hdr = ParagraphStyle('h', fontName='CN', fontSize=7.2, leading=9,
                         textColor=colors.white, alignment=1, wordWrap='CJK')
    cell = ParagraphStyle('c', fontName='CN', fontSize=6.4, leading=8.2, wordWrap='CJK')
    cellc = ParagraphStyle('cc', parent=cell, alignment=1)
    title = ParagraphStyle('t', fontName='CN', fontSize=14, leading=20,
                           textColor=colors.HexColor('#1F4E79'))

    head = '探迹CRM 客户通讯录（全量）'
    sub = ('记录 %d 条（按客户ID去重，剔除重复 %d 条） ｜ 数据来源：chunks 全量分页 JSON（%d 个分页文件，每页 10 条）'
           ' ｜ 排序：采集页序（创建时间升序）' % (len(rows), dup, nfiles))

    widths = [22, 150, 150, 38, 34, 60, 60, 58, 108, 210, 64, 30, 118]

    def on_page(canv, doc):
        canv.saveState()
        canv.setFont('CN', 7)
        canv.setFillColor(colors.HexColor('#6B7280'))
        canv.drawString(LM, 8 * mm, head)
        canv.drawRightString(W - RM, 8 * mm, '第 %d 页' % doc.page)
        canv.setStrokeColor(colors.HexColor('#D9DEE7'))
        canv.setLineWidth(0.4)
        canv.line(LM, 11 * mm, W - RM, 11 * mm)
        canv.restoreState()

    path = os.path.join(OUT, '探迹CRM_客户通讯录_全量.pdf')
    doc = BaseDocTemplate(path, pagesize=(W, H), leftMargin=LM, rightMargin=RM,
                          topMargin=TM, bottomMargin=BM,
                          title=head, author='TRAE')
    frame = Frame(LM, BM, W - LM - RM, H - TM - BM, id='f', showBoundary=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[frame], onPage=on_page)])

    story = [Paragraph(head, title), Paragraph(sub, ParagraphStyle(
        's', fontName='CN', fontSize=7.5, leading=11, textColor=colors.HexColor('#6B7280'))), None]

    data = [[Paragraph(n, hdr) for _, n in COLS]]
    for r in rows:
        data.append([
            Paragraph(str(r['i']), cellc),
            Paragraph(esc(r['n']), cell), Paragraph(esc(r['c']), cell),
            Paragraph(esc(r['l']), cellc), Paragraph(esc(r['ch']), cellc),
            Paragraph(esc(r['m']), cellc), Paragraph(esc(r['hot']), cellc),
            Paragraph(esc(r['tel']), cellc), Paragraph(esc(r['rg']), cell),
            Paragraph(esc(r['ad']), cell), Paragraph(esc(r['h']), cell),
            Paragraph(esc(r['st']), cellc), Paragraph(esc(r['k']), cellc),
        ])
    tbl = Table(data, colWidths=widths, repeatRows=1)
    st = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#D9DEE7')),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 1.6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7F9FC')]),
    ]
    tbl.setStyle(TableStyle(st))
    story.append(tbl)
    doc.build(story)
    return path


def main():
    os.makedirs(OUT, exist_ok=True)
    rows, dup, nfiles = load()
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    res = {'rows': len(rows), 'dup': dup, 'files': nfiles}
    if what in ('all', 'xlsx'):
        res['xlsx'] = build_xlsx(rows, dup, nfiles)
    if what in ('all', 'md'):
        res['md'] = build_md(rows, dup, nfiles)
    if what in ('all', 'pdf'):
        res['pdf'] = build_pdf(rows, dup, nfiles)
    for k, v in res.items():
        if isinstance(v, str):
            print(k, os.path.basename(v), '%.1f MB' % (os.path.getsize(v) / 1048576.0))
        else:
            print(k, v)


main()
