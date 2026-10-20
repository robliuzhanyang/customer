/* ============================================================
 * 探迹CRM 全量客户数据采集脚本（浏览器控制台注入版）
 *
 * 使用方法：
 *   1. 登录 https://crm.tungee.com/customers/following（客户管理页面）
 *   2. 按 F12 打开控制台，整段粘贴本脚本并回车（只安装，不自动狂跑）
 *   3. 手动启动：
 *        首次采集：        await __runBatch(0, 10000)
 *        续传（游标模式）： await __runBatch(10000, 25743)
 *   4. 随时查看进度：  window.__all.length  /  window.__batchState
 *   5. 导出：          __exportAll()   （JSON 下载到本地下载目录）
 *
 * 内置伪装（拟人化）策略：
 *   - 每页之间随机停 4~9 秒（模拟人翻页节奏）
 *   - 每采 10 页左右额外长休息 15~30 秒
 *   - 请求失败退避 60 秒再重试，最多 3 次
 *   - 每页 200 条（与前端页面实际分页大小一致）
 *   - 每 20 页自动把已采数据 JSON 落盘一次（防会话丢失丢数据）
 *
 * 接口说明（GET，页面同源自带 Cookie）：
 *   /api/customers/following-up-tab?begin={偏移}&end={偏移+条数}&return_just_id=0
 *   响应顶层：{ total, server_time, fields[], prev_search_after, next_search_after, data[] }
 *   data[] 每条记录的取值字段：
 *     客户名称   -> name
 *     公司名称   -> company_name.name（对象）
 *     公司法人   -> legal_representative
 *     Hot联系方式-> kp_contact[].contact（加密串，用 __dec 解密），contact_name 是脱敏名"任**"
 *     负责人     -> charger_name
 * 限制：服务端 ES max_result_window=10000，begin+end>10000 报 err:10，
 *       超过 10000 的部分需用游标（next_search_after）或日期切分，见 03 号脚本。
 * ============================================================ */

(function () {
  /* ---------- 0) 安装电话解密函数（来自 01_电话解密算法.js） ---------- */
  if (typeof window.__dec !== 'function') {
    window.__dec = function (e) {
      if (!e) return '';
      var t = String(e);
      var n = t[0];
      var o = t.charCodeAt(0);
      for (var a = 1; a < t.length; a++) {
        var u0 = t.charCodeAt(a);
        var u = o >= u0 ? o - u0 : o + 90 - u0;
        n += String.fromCharCode(u + 32);
        o = u0;
      }
      return n;
    };
  }

  /* ---------- 工具 ---------- */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---------- 1) 单页拉取 + 解析 + 追加进 window.__all ---------- */
  window.__fetchPage = async function (begin, count) {
    var url = '/api/customers/following-up-tab?begin=' + begin +
              '&end=' + (begin + count) + '&return_just_id=0';
    var r = await fetch(url, { credentials: 'include' });
    var j = await r.json();
    if (j && j.err) { window.__err = j.err; return -1; }
    var list = Array.isArray(j.data) ? j.data : [];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var hot = '--';
      try {
        var kc = it.kp_contact || [];
        var arr = [];
        for (var k = 0; k < kc.length; k++) {
          var v = kc[k] && kc[k].contact ? window.__dec(kc[k].contact) : '';
          if (v) arr.push(v);
        }
        if (arr.length) hot = arr.join('；');
      } catch (e) {}
      window.__all.push({
        no: window.__all.length + 1,
        name: it.name || '',
        company: (it.company_name && it.company_name.name) || it.name || '',
        legal: it.legal_representative || '--',
        hot: hot,
        charger: it.charger_name || '--'
      });
    }
    /* 记录服务端游标（突破 10000 上限时用） */
    if (j.next_search_after) window.__lastCursor = j.next_search_after;
    window.__nextBegin = begin + list.length;
    return list.length;
  };

  /* ---------- 2) 拟人化批量循环（默认已经装好的是慢速版） ---------- */
  window.__runBatch = async function (from, to) {
    window.__batchState = { running: true, from: from, to: to,
                            lastBegin: from, pages: 0, lastErr: '', startedAt: Date.now() };
    var page = 200, i = from;
    var errCount = 0;
    while (i < to) {
      var n = await window.__fetchPage(i, page);
      if (n === -1) {
        errCount++;
        window.__batchState.lastErr = window.__err;
        console.warn('[batch] 出错', window.__err, '第', errCount, '次，退避 60 秒');
        if (errCount >= 3) { window.__batchState.running = false; return; }
        await sleep(60000);
        n = await window.__fetchPage(i, page);
        if (n === -1) { window.__batchState.running = false; return; }
      }
      errCount = 0;
      if (n === 0) { console.log('[batch] 没有更多数据了'); break; }
      window.__batchState.lastBegin = window.__nextBegin;
      window.__batchState.pages++;
      console.log('[batch] 已采集', window.__all.length, '条，下一个 begin =', window.__nextBegin);

      /* 每 20 页自动落盘一次 */
      if (window.__batchState.pages % 20 === 0) window.__exportAll(true);

      var wait = rand(4000, 9000);
      if (window.__batchState.pages % 10 === 0) {
        wait = rand(15000, 30000);
        console.log('[batch] 长休息一下...');
      }
      await sleep(wait);
      i = window.__nextBegin;
    }
    window.__batchState.running = false;
    window.__batchState.finishedAt = Date.now();
    window.__exportAll(true);
    console.log('[batch] 完成，共', window.__all.length, '条');
  };

  /* ---------- 3) 导出：JSON 下载到浏览器下载目录（本机 = G:\1） ---------- */
  window.__exportAll = function (silent) {
    var stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    var name = 'tungee_progress_' + stamp + '.json';
    var b = new Blob([JSON.stringify(window.__all)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    if (!silent) console.log('[export] 已触发下载', name, '共', window.__all.length, '条');
  };

  console.log('[init] 采集脚本已安装：__fetchPage / __runBatch / __exportAll / __dec');
  console.log('[init] 当前已有', (window.__all || []).length, '条');
})();
