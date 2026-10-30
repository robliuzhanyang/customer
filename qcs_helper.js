window.__QCS={};
window.__QCS.S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
window.__QCS.rows=function(){return [].slice.call(document.querySelectorAll('tr.ant-table-row'))};
window.__QCS.P=function(){var m=location.href.match(/[?&]page=([0-9]+)/);return m?parseInt(m[1],10):1};
window.__QCS.scrape=function(){
var rs=window.__QCS.rows();var out=[];
for(var i=0;i<rs.length;i++){
var t=(rs[i].innerText||'').split(String.fromCharCode(10)).map(function(x){return x.trim()}).filter(function(x){return x.length>0});
var r={};var ci=-1;
for(var j=1;j<t.length;j++){if(t[j].indexOf('联系方式')>=0){ci=j;r.n=t[j-1];r.tel=(t[j].match(/[0-9]+/)||[''])[0];break}}
if(!r.n){for(var q=0;q<t.length&&q<5;q++){if((t[q].indexOf('公司')>=0||t[q].indexOf('集团')>=0)&&t[q].indexOf('法定代表人')<0){r.n=t[q];break}}}
for(var k=0;k<t.length;k++){var s=t[k];if(s.indexOf('法定代表人：')===0)r.l=s.slice(6);else if(s.indexOf('注册资本：')===0)r.cap=s.slice(5);else if(s.indexOf('成立时间：')===0)r.f=s.slice(5);else if(s.indexOf('所在地区：')===0)r.rg=s.slice(5);}
var idx=-1;for(var m=0;m<t.length;m++){if(t[m].indexOf('四库项目')>=0){idx=m;break}}
if(idx<0){for(var m2=0;m2<t.length;m2++){if(t[m2].indexOf('所在地区：')===0){idx=m2;break}}if(ci>0&&idx<0)idx=ci}
if(idx>=0){var tail=t.slice(idx+1).filter(function(x){return ['更多推荐理由','收藏','添加到CRM'].indexOf(x)<0});r.rq=tail.join(String.fromCharCode(10))}
if(r.n)out.push(r)}
return out};
//---STEP---
(async function(){
var S=window.__QCS.S;
var nx=document.querySelector('.ant-pagination-next');
if(!nx)return 'nonx';
var before=(document.querySelector('tr.ant-table-row')||{innerText:''}).innerText.slice(0,20);
(nx.querySelector('button')||nx).click();
for(var i=0;i<25;i++){await S(400);var r0=document.querySelector('tr.ant-table-row');if(r0&&r0.innerText.slice(0,20)!==before&&window.__QCS.rows().length>=45)break}
var rs=window.__QCS.rows();var gz=0;
for(var j=0;j<rs.length;j++){if((rs[j].innerText||'').indexOf('所在地区：贵州省')>=0)gz++}
return window.__QCS.P()+':'+rs.length+':gz'+gz;
})()
//---ADD---
(async function(){
var S=window.__QCS.S;
var cb=document.querySelector('thead input[type=checkbox]');
if(!cb)return 'nocb';
if(cb.checked)cb.click();await S(300);if(!cb.checked)cb.click();await S(700);
var sel=(document.body.innerText.match(/已勾选\s*([0-9]+)\s*家/)||[])[1]||'';
var btns=[].slice.call(document.querySelectorAll('button')).filter(function(b){return (b.innerText||'').replace(/[ \r\n]/g,'')==='添加到CRM'});
if(!btns.length)return 'nobt:'+sel;
['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ty){btns[0].dispatchEvent(new MouseEvent(ty,{bubbles:true,cancelable:true,view:window}))});
await S(1800);
var d=document.querySelector('.ant-drawer-content');if(!d)return 'nodrawer:'+sel;
var lab=[].slice.call(d.querySelectorAll('label.ant-radio-wrapper')).filter(function(x){return (x.innerText||'').indexOf('添加到客户')>=0})[0];
if(lab&&!lab.querySelector('input').checked)lab.click();await S(400);
var t=[].slice.call(d.querySelectorAll('[role=button]')).filter(function(x){return (x.innerText||'').trim()==='添加给我'})[0];
if(t){['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ty){t.dispatchEvent(new MouseEvent(ty,{bubbles:true,cancelable:true,view:window}))})}
await S(700);
var sb=[].slice.call(d.querySelectorAll('button')).filter(function(x){return (x.innerText||'').replace(/[ \r\n]/g,'')==='提交';})[0];
if(!sb)return 'nosub:'+sel;if(sb.disabled)return 'dis:'+sel;
['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ty){sb.dispatchEvent(new MouseEvent(ty,{bubbles:true,cancelable:true,view:window}))});
var ok=false;for(var i=0;i<12;i++){await S(600);if(document.body.innerText.indexOf('添加任务已经开始')>=0){ok=true;break}}
var c=[].slice.call(document.querySelectorAll('button')).filter(function(x){return (x.innerText||'').replace(/[ \r\n]/g,'')==='关闭'})[0];
if(c&&ok)c.click();await S(500);
return 'sel='+sel+',ok='+ok;
})()
