window.__STEP = async function (key, n) {
  var S = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var Q = window.__Q2;
  if (!Q) return 'noQ2';
  var st = JSON.parse(localStorage.getItem('__ST2') || '{}');
  if (!st[key]) st[key] = { page: 1, recs: {} };
  var g = st[key];
  function pnum() { var m = location.href.match(/[?&]page=([0-9]+)/); return m ? parseInt(m[1], 10) : 1; }
  function save() { localStorage.setItem('__ST2', JSON.stringify(st)); }
  var log = [];
  for (var k = 0; k < n; k++) {
    var a = Q.scrape();
    var nn = 0;
    for (var j = 0; j < a.length; j++) {
      var r = a[j];
      if ((r.rg || '').indexOf('贵州') >= 0 && !g.recs[r.n]) { g.recs[r.n] = r; nn++; }
    }
    log.push([pnum(), a.length, nn]);
    g.page = pnum();
    save();
    if (a.length < 50) { log.push(['short']); break; }
    var p = pnum();
    var nx = document.querySelector('.ant-pagination-next');
    var b = nx ? (nx.querySelector('button') || nx) : null;
    if (!b || b.disabled) { log.push(['end']); break; }
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (ty) {
      b.dispatchEvent(new MouseEvent(ty, { bubbles: true, cancelable: true, view: window }));
    });
    var ok = false;
    for (var i = 0; i < 20; i++) { await S(280); if (pnum() > p) { ok = true; break; } }
    if (!ok) { log.push(['stuck']); break; }
    await S(2200);
  }
  return JSON.stringify({ key: key, page: g.page, cnt: Object.keys(g.recs).length, log: log });
};

window.__APPLY = async function (val, targetPage) {
  var S = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function ck(t) {
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (ty) {
      t.dispatchEvent(new MouseEvent(ty, { bubbles: true, cancelable: true, view: window }));
    });
  }
  function setV(el, v) {
    var d = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    d.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  await S(800);
  var more = document.querySelector('div.rLyyhguE5p4JnT7I5spzJ a');
  if (more && (more.innerText || '').trim() === '展开选项') { ck(more); await S(1200); }
  var clr = null;
  var all = document.querySelectorAll('a,span,div');
  for (var i = 0; i < all.length; i++) {
    if ((all[i].innerText || '').trim() === '清空' && all[i].children.length === 0) { clr = all[i]; }
  }
  if (clr) { ck(clr); await S(2500); }
  var el = document.querySelector('[data-key="addressValue"]');
  if (!el) return 'noAddrRow';
  var box = el.querySelector('input');
  setV(box, val);
  await S(500);
  box.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13, which: 13 }));
  box.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', keyCode: 13, which: 13 }));
  await S(3500);
  var sc = document.querySelector('.ant-pagination-options-size-changer');
  if (sc) {
    ck(sc); await S(800);
    var opts = [].slice.call(document.querySelectorAll('.ant-select-dropdown-menu-item,li[role=option]'));
    var o = opts.filter(function (x) { return (x.innerText || '').indexOf('200') >= 0; })[0];
    if (o) {
      var k = Object.keys(o).filter(function (x) { return x.indexOf('reactProps') >= 0; })[0];
      if (o[k] && o[k].onClick) o[k].onClick({});
    }
  }
  await S(4500);
  if (targetPage && targetPage > 1) {
    function pnum() { var m = location.href.match(/[?&]page=([0-9]+)/); return m ? parseInt(m[1], 10) : 1; }
    var guard = 0;
    while (pnum() < targetPage && guard < 10) {
      var p = pnum();
      var j = document.querySelector('.ant-pagination-jump-next');
      var nx = document.querySelector('.ant-pagination-next');
      var b = nx ? (nx.querySelector('button') || nx) : null;
      if (j && p + 5 <= targetPage) { ck(j); }
      else if (b && !b.disabled) { ck(b); }
      else { break; }
      for (var q = 0; q < 20; q++) { await S(280); if (pnum() > p) break; }
      await S(2000);
      guard++;
    }
  }
  var chip = el.innerText.split(String.fromCharCode(10)).join('|');
  return JSON.stringify({ val: val, chip: chip, rows: document.querySelectorAll('tr.ant-table-row').length, url: location.href });
};

window.__DUMP = async function (key) {
  var st = JSON.parse(localStorage.getItem('__ST2') || '{}');
  var g = st[key];
  if (!g) return 'nokey';
  var arr = Object.keys(g.recs).map(function (n) { return g.recs[n]; });
  var json = JSON.stringify(arr);
  var cs = new CompressionStream('gzip');
  var w = cs.writable.getWriter();
  w.write(new TextEncoder().encode(json));
  w.close();
  var buf = await new Response(cs.readable).arrayBuffer();
  var u8 = new Uint8Array(buf);
  var bin = '';
  for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  window.__B64 = btoa(bin);
  return JSON.stringify({ key: key, n: arr.length, b64: window.__B64.length });
};
