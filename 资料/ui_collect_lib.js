/* 探迹客户管理 逐条点击采集库（纯页面方式，不使用接口）
 * 用法（Exec 沙箱内）：
 *   const f = await tools.Read({file_path:'g:/1/探迹客户数据/工作目录/ui_collect_lib.js'});
 *   const src = f.content.split('\n').map(l=>{const i=l.indexOf('\t');return i>=0?l.slice(i+1):l}).join('\n');
 *   eval(src);
 *   const out = await collectRange(LIST_VIEW_ID, 16, 18, 10);
 *   text('done='+JSON.stringify(out));
 * 说明：每页条数需设为 10（表格只渲染前 20 行，10 条/页才能 100% 覆盖）。
 * 采用「语句块 + window 变量中转」两段式读取（本引擎对单表达式脚本不稳定）。
 */
globalThis.collectRange = async function (LIST, startPage, endPage, size) {
  const unwrap = (t) => { if (typeof t !== 'string') return String(t); if (t.charCodeAt(0) === 34) { try { return JSON.parse(t); } catch (e) {} } return t; };
  const ev = async (script) => { const r = await tools.browser_evaluate({ viewId: LIST, script: script }); return unwrap(r.content ? r.content[0].text : ''); };
  const wait = (s) => tools.browser_wait_for({ time: s });
  const seg = (t, a, b) => { const i = t.indexOf(a); if (i < 0) return ''; const j = t.indexOf(b, i + a.length); return t.slice(i + a.length, j < 0 ? i + a.length + 200 : j).trim(); };
  const parseDrawer = (t) => ({ company: seg(t, '公司名称', '客户标签'), tel: seg(t, '电话', '手机').split('手机')[0], mobile: seg(t, '手机', 'Hot联系方式'), hot: seg(t, 'Hot联系方式', '微信号'), region: seg(t, '地区', '地址'), address: seg(t, '地址', '跟进状态'), charger: seg(t, '负责人：', '修改') });

  const activePage = async () => {
    await ev("var ap=document.querySelector('li.ant-pagination-item-active');window.__apx=ap?ap.textContent.trim():'';'ok'");
    return await ev("window.__apx || ''");
  };
  const step = async (dir) => {
    const sel = dir < 0 ? 'li.ant-pagination-prev' : 'li.ant-pagination-next';
    try { await tools.browser_snapshot({ viewId: LIST, selector: '.ant-pagination', interactive: true, compact: true, maxNodes: 60 }); } catch (e) { return false; }
    await ev("var li=document.querySelector('" + sel + "');window.__np=li?li.getAttribute('data-trae-ref'):null;'ok'");
    await wait(0.6);
    const ref = await ev("window.__np || 'NONE'");
    if (!ref || ref === 'NONE') return false;
    try { await tools.browser_click({ ref: ref, viewId: LIST }); } catch (e) { return false; }
    await wait(3.0);
    return true;
  };
  const gotoPage = async (t) => {
    for (let k = 0; k < 25; k++) {
      const cur = parseInt(await activePage(), 10);
      if (cur === t) return true;
      if (!cur) return false;
      if (!(await step(cur < t ? 1 : -1))) return false;
    }
    return false;
  };
  const getRows = async () => {
    await tools.browser_snapshot({ viewId: LIST, selector: '.ant4-table-body', strategy: 'dom', interactive: true, compact: true, maxNodes: 600 });
    await ev("var rows=document.querySelectorAll('tr.ant4-table-row-level-0');var out=[];for(var i=0;i<rows.length;i++){var tds=rows[i].querySelectorAll('td');var g=function(n){return tds[n]?tds[n].textContent.trim():''};var hotTd=tds[5];var hb=hotTd?hotTd.querySelector('a[role=button]'):null;var v=null;var cs=rows[i].querySelectorAll('a,button');for(var j=0;j<cs.length;j++){if(cs[j].textContent.trim()==='查看'){v=cs[j];break}}out.push([rows[i].getAttribute('data-row-key'),g(2),g(3),g(4),g(5),g(6),g(13),v?v.getAttribute('data-trae-ref'):null,hb?hb.getAttribute('data-trae-ref'):null])}window.__kx=JSON.stringify(out);'ok'");
    await wait(0.6);
    return JSON.parse(await ev("window.__kx"));
  };
  const drawerText = async () => {
    await ev("var ds=document.querySelectorAll('.ant-drawer,.ant4-drawer');var v='';for(var i=0;i<ds.length;i++){if(getComputedStyle(ds[i]).display!=='none'){v+=ds[i].textContent.replace(/\\s+/g,' ')}}window.__dv=v;'ok'");
    return await ev("window.__dv || ''");
  };

  const results = [];
  for (let pg = startPage; pg <= endPage; pg++) {
    const g = await gotoPage(pg);
    if (!g) { results.push([pg, -1, 'goto-failed@' + (await activePage())]); break; }
    const rows = await getRows();
    const recs = []; let fail = 0; const base = (pg - 1) * size;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]; let d = {}; let ok = false; let hotNum = '';
      for (let att = 0; att < 2; att++) {
        try { await tools.browser_scroll({ ref: r[7], scrollIntoView: true, viewId: LIST }); } catch (e) {}
        await wait(0.5);
        try { await tools.browser_click({ ref: r[7], viewId: LIST }); } catch (e) { try { await tools.browser_snapshot({ viewId: LIST, selector: '.ant4-table-body', strategy: 'dom', interactive: true, compact: true, maxNodes: 600 }); } catch (e2) {} continue; }
        await wait(2.0);
        d = parseDrawer(await drawerText());
        ok = !!(d.company && d.company.length > 2 && d.company.indexOf(r[1].slice(0, 5)) >= 0);
        try { await tools.browser_press_key({ key: 'Escape', viewId: LIST }); } catch (e) {}
        await wait(0.9);
        if (ok) break;
      }
      if (!ok) fail++;
      if (r[8]) {
        try {
          await tools.browser_scroll({ ref: r[8], scrollIntoView: true, viewId: LIST });
          await wait(0.5);
          await tools.browser_click({ ref: r[8], viewId: LIST });
          await wait(2.0);
          const ht = await drawerText();
          const nums = Array.from(new Set((ht.match(/1[0-9]{10}/g) || []).concat(ht.match(/0[0-9]{2,3}-?[0-9]{7,8}/g) || [])));
          hotNum = nums.join('；');
          await tools.browser_press_key({ key: 'Escape', viewId: LIST });
          await wait(0.9);
        } catch (e) {}
      }
      recs.push({ no: base + i + 1, page: pg, key: r[0], name: r[1], company: d.company || r[2], legal: r[3], charger: d.charger || r[5], mobile: d.mobile || '', hotRevealed: hotNum, tel: d.tel || r[6] || '', region: d.region || '', address: d.address || '', hot: d.hot || r[4] || '', src: 'drawer', ok: ok ? 1 : 0 });
    }
    await tools.Write({ file_path: 'g:/1/探迹客户数据/工作目录/ui_pages/pg' + String(pg).padStart(4, '0') + '.json', content: JSON.stringify(recs) });
    results.push([pg, recs.length, fail, recs.filter(x => x.mobile && x.mobile !== '--').length, recs[0] ? recs[0].name : '']);
  }
  return results;
};
