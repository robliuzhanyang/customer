(function(){
if(window.__crm&&window.__crm.v===10){return}
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var A=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var C={v:10};
C.ls=function(pg,v){try{if(v===undefined){var s=localStorage.getItem('__pg'+pg);return s?JSON.parse(s):null}localStorage.setItem('__pg'+pg,JSON.stringify(v));return 1}catch(e){return null}};
C.lslist=function(){var o=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('__pg')===0){o.push(parseInt(k.slice(4),10))}}}catch(e){}return o.sort(function(a,b){return a-b})};
C.active=function(){var li=document.querySelector('li.ant-pagination-item-active');return li?parseInt(li.textContent.trim(),10):0};
C.rowEls=function(){return A('tr.ant4-table-row-level-0')};
C.spin=function(){return A('.ant-spin-spinning').length>0};
C.dtext=function(){var ds=A('.ant-drawer,.ant4-drawer'),v='';for(var i=0;i<ds.length;i++){var s=getComputedStyle(ds[i]);if(s.display!=='none'&&s.visibility!=='hidden'){v+=ds[i].innerText.replace(/\s+/g,' ')}}return v};
C.close=function(){var cb=document.querySelector('.ant-drawer-open .ant-drawer-close,.ant4-drawer-open .ant4-drawer-close');if(cb){cb.click();return 1}return 0};
C.purge=function(){var n=0;try{var ds=A('.ant-drawer,.ant4-drawer');for(var i=0;i<ds.length;i++){var d=ds[i];if(d.classList&&(d.classList.contains('ant-drawer-open')||d.classList.contains('ant4-drawer-open'))){continue}if(d.parentNode){d.parentNode.removeChild(d);n++}}if(!document.querySelector('.ant-drawer-open,.ant4-drawer-open')){var ms=A('.ant-drawer-mask,.ant4-drawer-mask');for(var j=0;j<ms.length;j++){if(ms[j].parentNode){ms[j].parentNode.removeChild(ms[j]);n++}}}}catch(e){}return n};
C.seg=function(t,a,b){var i=t.indexOf(a);if(i<0){return ''}var j=t.indexOf(b,i+a.length);return (j<0?t.slice(i+a.length,i+a.length+180):t.slice(i+a.length,j)).trim()};
C.parse=function(t){return {c:C.seg(t,'公司名称','客户标签'),ct:C.seg(t,'客户类型','电话'),tel:C.seg(t,'电话','手机'),m:C.seg(t,'手机','Hot联系方式'),hot:C.seg(t,'Hot联系方式','微信号'),rg:C.seg(t,'地区','地址'),ad:C.seg(t,'地址','跟进状态'),ch:C.seg(t,'负责人：','修改')}};
C.viewBtn=function(tr){var b=A('a,button',tr);for(var i=0;i<b.length;i++){if(b[i].textContent.trim()==='查看'){return b[i]}}return null};
C.hotBtn=function(tr){var td=tr.querySelectorAll('td')[5];return td?td.querySelector('a[role=button],button'):null};
C.rows=function(){var rs=C.rowEls(),o=[];for(var i=0;i<rs.length;i++){var td=rs[i].querySelectorAll('td');var g=function(k){return td[k]?td[k].textContent.trim():''};o.push({key:rs[i].getAttribute('data-row-key'),n:g(2),c:g(3),l:g(4),h:g(5),ch:g(6),st:g(7),tl:g(13)})}return o};
C.keysStr=function(){return C.rows().map(function(x){return x.key}).join(',')};
C.settle=async function(prev,ms){var n=Math.ceil(ms/250);for(var i=0;i<n;i++){if(!C.spin()&&C.rowEls().length===10&&C.keysStr()!==prev){return 1}await S(250)}return 0};
C.refetch=async function(pg){var c=C.active();if(c<=1){C.clickEl('li.ant-pagination-next');await S(2600);C.clickEl('li.ant-pagination-prev')}else{C.clickEl('li.ant-pagination-prev');await S(2600);C.clickEl('li.ant-pagination-next')}await S(4200);for(var i=0;i<20;i++){if(C.active()===pg&&!C.spin()&&C.rowEls().length===10){return 1}await S(250)}return 0};
C.waitDrawer=async function(name){var key=name?name.slice(0,4):'';for(var i=0;i<16;i++){var t=C.dtext();if(t.indexOf('公司名称')>=0&&(!key||t.indexOf(key)>=0)){return t}await S(250)}return ''};
C.waitHot=async function(){for(var i=0;i<16;i++){var t=C.dtext();if(/1[0-9]{10}/.test(t)){return t}await S(250)}return C.dtext()};
C.readRow=async function(tr,meta){
var r={k:meta.key,n:meta.n,c:meta.c,l:meta.l,h:meta.h,ch:meta.ch,st:meta.st,tl:meta.tl};
var t='';
for(var a=0;a<2;a++){
var vb=C.viewBtn(tr);
if(!vb){await S(350);tr=(C.rowEls()[meta.i]||tr);continue}
vb.click();
t=await C.waitDrawer(meta.n);
if(t){break}
C.close();await S(450);C.purge();
}
if(!t){r.err='dt';return r}
var p=C.parse(t);
if(p.c&&meta.n&&p.c.slice(0,4)!==meta.n.slice(0,4)){r.err='mm'}
r.c=p.c||r.c;r.ct=p.ct||'--';r.tel=p.tel||r.tl||'--';r.m=p.m||'';r.hot=p.hot||r.h||'--';r.rg=p.rg||'';r.ad=p.ad||'';r.ch=p.ch||r.ch;
C.close();await S(220);C.purge();
if(r.h&&r.h.indexOf('@')>=0){
var hb=C.hotBtn(tr);
if(hb){hb.click();var ht=await C.waitHot();if(ht){var nums=(ht.match(/1[0-9]{10}/g)||[]).concat(ht.match(/0[0-9]{2,3}-?[0-9]{7,8}/g)||[]);var u=[];for(var i=0;i<nums.length;i++){if(u.indexOf(nums[i])<0){u.push(nums[i])}}r.hn=u.join('；')}C.close();await S(220);C.purge()}
}
return r;
};
C.clickEl=function(sel){var e=document.querySelector(sel);if(e){e.click();return 1}return 0};
C.waitNav=async function(prev){for(var i=0;i<24;i++){await S(250);var a=C.active();if(a&&a!==prev){for(var j=0;j<24;j++){if(!C.spin()&&C.rowEls().length>0){return a}await S(250)}return a}}return C.active()};
C.jp=function(){var i=document.querySelector('.ant-pagination-options-quick-jumper input');if(!i){return 0}var set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,String(C.active()+19));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13,bubbles:true}));return 1};
C.ride=async function(t){
var cur=C.active(),g=0;
while(cur<t-6&&g<150){
g++;
var p=cur;
if(!C.jp()){break}
for(var k=0;k<20;k++){await S(250);var n=C.active();if(n&&n!==p){cur=n;break}}
if(cur===p){break}
await S(450+Math.random()*450)
}
var w=await C.walk(t);
if(w.ok){return w}
return {ok:0,cur:cur,why:'ride'};
};
C.walk=async function(t){
var cur=C.active();if(!cur){return {ok:0,cur:0,why:'noactive'}};
var guard=0;
while(cur!==t&&guard<90){
guard++;
var d=t-cur,sel;
if(d>5){sel='li.ant-pagination-jump-next'}else if(d<-5){sel='li.ant-pagination-jump-prev'}else{sel=d>0?'li.ant-pagination-next':'li.ant-pagination-prev'}
if(!C.clickEl(sel)){return {ok:0,cur:cur,why:'nobtn'}}
var nxt=await C.waitNav(cur);
if(!nxt||nxt===cur){return {ok:0,cur:cur,why:'stuck'}}
cur=nxt;
}
if(cur!==t){return {ok:0,cur:cur,why:'guard'}}
for(var k=0;k<12;k++){if(!C.spin()&&C.rowEls().length===10){break}await S(250)}
return {ok:1,cur:cur,rows:C.rowEls().length};
};
C.job=async function(a,z){
var J=window.__job={a:a,z:z,cur:a-1,run:1,st:'start',log:[],res:{}};
var prev='';
for(var pg=a;pg<=z;pg++){
J.cur=pg;J.st='nav';
var w=await C.ride(pg);
if(!w.ok){J.log.push(pg+':nf@'+w.cur+':'+w.why);J.st='fail';J.run=0;return J}
if(prev){
var ok=await C.settle(prev,30000);
if(!ok){ok=await C.settle(prev,15000)}
if(!ok){J.log.push(pg+':stale');J.st='stale';J.run=0;return J}
}
prev=C.keysStr();
J.st='read';
var pre=C.ls(pg);
if(pre&&pre.length===10){J.res[pg]=pre;J.log.push(pg+':ls');await S(300);continue}
var recs=[];
for(var i=0;i<10;i++){
var tr=C.rowEls()[i];if(!tr){recs.push({k:'',n:'',err:'nr'});continue}
var meta=C.rows()[i];meta.i=i;
var r=await C.readRow(tr,meta);r.pg=pg;recs.push(r);
await S(120+Math.random()*180);
}
J.res[pg]=recs;
C.ls(pg,recs);
var e=recs.filter(function(x){return x.err}).length;
J.log.push(pg+':'+recs.length+(e?':e'+e:''));
await S(900+Math.random()*700);
}
J.st='end';J.run=0;J.done=1;return J;
};
C.ensure10=async function(){var el=document.querySelector('.ant-pagination-options');var txt=el?el.innerText:'';if(txt.indexOf('10 条/页')>=0){return 1}var sel=document.querySelector('.ant-pagination-options .ant-select');if(!sel){return 0}sel.click();await S(600);var os=A('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');for(var i=0;i<os.length;i++){if(os[i].innerText.trim()==='10 条/页'){os[i].click();await S(1000);return 1}}return 0};
window.__crm=C;window.__job={run:0,cur:0,st:'none'};
})();
