/* ============================================================
 * 探迹CRM Hot联系方式 解密算法（链式差值加密）
 * 来源：前端 main.*.chunk.js 中 webpack 模块 "qkKj" 导出的 t.decode
 * 用法：整段粘进 crm.tungee.com 页面控制台，或 Node 环境直接运行
 *
 * 算法原理：
 *   密文第 0 个字符就是明文第 0 个字符；
 *   从第 1 个字符起，对每个密文字符 c：
 *     prev = 上一个密文字符的字符码（初始为密文首字符的字符码）
 *     u = prev >= c的字符码 ? (prev - c的字符码) : (prev + 90 - c的字符码)
 *     明文字符 = String.fromCharCode(u + 32)
 *   即：明文字符码 = 相邻密文字符码的"环形差值" + 32（环形模 90）
 *
 * 已验证样本（与页面点击显示的电话完全一致）：
 *   dec("1rYI1v`H6!c")    => "19908568258"      （手机号）
 *   dec("0sZI<$hR<#l\\I") => "0791-86669103"    （座机带区号）
 * ============================================================ */

function dec(e) {
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
}

/* 在浏览器控制台安装为全局函数（采集脚本 02 依赖 window.__dec） */
if (typeof window !== 'undefined') {
  window.__dec = dec;
  console.log('[dec] 电话解密函数已安装，自测:',
    dec('1rYI1v`H6!c'), '/', dec('0sZI<$hR<#l\\I'));
} else if (typeof console !== 'undefined') {
  console.log('[dec] 自测:', dec('1rYI1v`H6!c'), '/', dec('0sZI<$hR<#l\\I'));
}
