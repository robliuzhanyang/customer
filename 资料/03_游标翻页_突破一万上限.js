/* ============================================================
 * 突破 ES 10000 条翻页上限（游标 search_after 试探脚本）
 *
 * 背景：
 *   /api/customers/following-up-tab 用 begin/end 做偏移翻页，
 *   服务端 Elasticsearch max_result_window = 10000，
 *   所以 begin+end > 10000 时直接报 err:10，最多只能取到前 10000 条。
 *
 * 思路：
 *   接口响应顶层会返回 prev_search_after / next_search_after 游标，
 *   前端翻"下一页"时通过 async-biz chunk 的 injectPayload HOC 把
 *     prev_search_after / next_search_after（JSON.stringify 后的字符串）
 *     page_offset（当前页号 - 上一页页号）
 *   一并带给服务端，由 ES search_after 取数，绕开 from+size 限制。
 *
 * 用法：在客户管理页面控制台逐个粘贴执行（每个探测之间隔几秒，
 *       模拟人工操作节奏），看 window.__probe 的 firstId 是否变了：
 *       全局第一条固定是 _id = 6a143b11c6939fe2aaedf7aa（石阡县程杰...）
 *       如果返回的第一条不是它，说明游标生效了。
 * ============================================================ */

(async function () {
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  window.__probe = {};

  /* 第 0 步：先取一次真实游标（begin=9980&end=10000 的响应自带 next_search_after），
     并确认游标值是数字还是字符串 —— 之前探测失败的一个可能原因就是
     把数字游标当字符串传了。 */
  var r0 = await fetch('/api/customers/following-up-tab?begin=9980&end=10000&return_just_id=0',
                      { credentials: 'include' });
  var j0 = await r0.json();
  var cur = j0.next_search_after || [];
  window.__cursorTypes = cur.map(function (x) { return typeof x; });
  window.__cursor = cur;
  console.log('游标原样:', JSON.stringify(cur), '类型:', window.__cursorTypes.join(','));

  await sleep(6000); /* 拟人化：探测之间停几秒 */

  /* 探测 A：游标用【原始类型】传（数字不带引号）+ page_offset=1，begin 归 0 */
  var curA = '[' + cur.join(',') + ']';
  var uA = '/api/customers/following-up-tab?begin=0&end=200&return_just_id=0' +
           '&next_search_after=' + encodeURIComponent(curA) + '&page_offset=1';
  var rA = await fetch(uA, { credentials: 'include' });
  var jA = await rA.json();
  var listA = Array.isArray(jA.data) ? jA.data : [];
  window.__probe.A = {
    err: jA.err || null,
    firstId: listA.length ? listA[0]._id : null,
    firstName: listA.length ? listA[0].name : null,
    total: jA.total
  };
  console.log('探测A:', JSON.stringify(window.__probe.A));

  await sleep(7000);

  /* 探测 B：游标字符串形式 + page_offset=50（前端页号语义） */
  var curB = encodeURIComponent(JSON.stringify(cur));
  var uB = '/api/customers/following-up-tab?begin=10000&end=10200&return_just_id=0' +
           '&next_search_after=' + curB + '&page_offset=50';
  var rB = await fetch(uB, { credentials: 'include' });
  var jB = await rB.json();
  var listB = Array.isArray(jB.data) ? jB.data : [];
  window.__probe.B = {
    err: jB.err || null,
    firstId: listB.length ? listB[0]._id : null,
    firstName: listB.length ? listB[0].name : null
  };
  console.log('探测B:', JSON.stringify(window.__probe.B));

  console.log('结果读取方式：JSON.stringify(window.__probe)');
})();
