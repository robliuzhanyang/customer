(function(){
if(window.__crm&&window.__crm.v===21){return}
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var A=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var C={v:21};
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
C.waitDrawer=async function(name){var key=name?name.slice(0,4):'';for(var i=0;i<16;i++){var t=C.dtext();if(t.indexOf('公司名称')>=0&&(!key||t.indexOf(key)>=0)){return t}await S(250)}return ''};
C.waitHot=async function(){for(var i=0;i<16;i++){var t=C.dtext();if(/1[0-9]{10}/.test(t)){return t}await S(250)}return C.dtext()};
C.readRow=async function(tr,meta){
var r={k:meta.key,n:meta.n,c:meta.c,l:meta.l,h:meta.h,ch:meta.ch,st:meta.st,tl:meta.tl};
var t='';
for(var a=0;a<2;a++){
var vb=C.viewBtn(tr);
if(!vb){await S(400);tr=(C.rowEls()[meta.i]||tr);continue}
vb.click();
t=await C.waitDrawer(meta.n);
if(t){break}
C.close();await S(500);C.purge();
}
if(!t){r.err='dt';return r}
var p=C.parse(t);
if(p.c&&meta.n&&p.c.slice(0,4)!==meta.n.slice(0,4)){r.err='mm'}
r.c=p.c||r.c;r.ct=p.ct||'--';r.tel=p.tel||r.tl||'--';r.m=p.m||'';r.hot=p.hot||r.h||'--';r.rg=p.rg||'';r.ad=p.ad||'';r.ch=p.ch||r.ch;
C.close();await S(300+Math.random()*200);C.purge();
if(r.h&&r.h.indexOf('@')>=0){
var hb=C.hotBtn(tr);
if(hb){hb.click();var ht=await C.waitHot();if(ht){var nums=(ht.match(/1[0-9]{10}/g)||[]).concat(ht.match(/0[0-9]{2,3}-?[0-9]{7,8}/g)||[]);var u=[];for(var i=0;i<nums.length;i++){if(u.indexOf(nums[i])<0){u.push(nums[i])}}r.hn=u.join('；')}C.close();await S(300+Math.random()*200);C.purge()}
}
return r;
};
C.clickEl=function(sel){var e=document.querySelector(sel);if(e){e.click();return 1}return 0};
C.waitNav=async function(prev){for(var i=0;i<24;i++){await S(250);var a=C.active();if(a&&a!==prev){for(var j=0;j<24;j++){if(!C.spin()&&C.rowEls().length>0){return a}await S(250)}return a}}return C.active()};
C.jp=function(){var i=document.querySelector('.ant-pagination-options-quick-jumper input');if(!i){return 0}var set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(i,String(C.active()+19));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',keyCode:13,which:13,bubbles:true}));return 1};
C.ride=async function(t){
var cur=C.active();
if(!cur){return {ok:0,cur:0,why:'noactive'}};
if(cur===t){
for(var q=0;q<16;q++){if(!C.spin()&&C.rowEls().length===10){break}await S(300)}
return {ok:1,cur:t,rows:C.rowEls().length}
}
var g=0;
while(cur<t-6&&g<170){
g++;
var p=cur;
if(!C.jp()){break}
for(var k=0;k<12;k++){await S(300);var n=C.active();if(n&&n!==p){cur=n;break}}
if(cur===p){break}
await S(500+Math.random()*400)
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
if(pre&&pre.length===10){J.res[pg]=pre;J.log.push(pg+':ls');await S(400);continue}
var recs=[];
for(var i=0;i<10;i++){
var tr=C.rowEls()[i];if(!tr){recs.push({k:'',n:'',err:'nr'});continue}
var meta=C.rows()[i];meta.i=i;
var r=await C.readRow(tr,meta);r.pg=pg;recs.push(r);
await S(180+Math.random()*220);
}
J.res[pg]=recs;
C.ls(pg,recs);
var e=recs.filter(function(x){return x.err}).length;
J.log.push(pg+':'+recs.length+(e?':e'+e:''));
await S(1100+Math.random()*700);
}
J.st='end';J.run=0;J.done=1;return J;
};
C.ensure10=async function(){var el=document.querySelector('.ant-pagination-options');var txt=el?el.innerText:'';if(txt.indexOf('10 条/页')>=0){return 1}var sel=document.querySelector('.ant-pagination-options .ant-select');if(!sel){return 0}sel.click();await S(600);var os=A('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');for(var i=0;i<os.length;i++){if(os[i].innerText.trim()==='10 条/页'){os[i].click();await S(1000);return 1}}return 0};
C.jump=async function(t){
if(C.active()===t){for(var q=0;q<10;q++){if(!C.spin()&&C.rowEls().length===10){break}await S(200)}return {ok:1,cur:t}}
for(var a=0;a<3;a++){
var i=document.querySelector('.ant-pagination-options-quick-jumper input');
if(!i){await S(600);continue}
try{i.focus();i.select()}catch(e){}
try{document.execCommand('insertText',false,String(t))}catch(e){}
if(!i.value||i.value!==String(t)){
var set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
set.call(i,String(t));i.dispatchEvent(new Event('input',{bubbles:true}))
}
await S(140);
var ev=new KeyboardEvent('keydown',{key:'Enter',bubbles:true});
Object.defineProperty(ev,'keyCode',{get:function(){return 13}});
Object.defineProperty(ev,'which',{get:function(){return 13}});
i.dispatchEvent(ev);
for(var k=0;k<16;k++){await S(250);if(C.active()===t){for(var j=0;j<12;j++){if(!C.spin()&&C.rowEls().length===10){return {ok:1,cur:t}}await S(200)}break}}
await S(300)
}
return {ok:0,cur:C.active(),why:'jump'};
};
C.nextWait=async function(prev,ms){var n=Math.ceil(ms/250);for(var i=0;i<n;i++){await S(250);if(C.spin()||C.rowEls().length!==10){continue}var k=C.keysStr();if(!k||k===prev){continue}await S(700);if(C.spin()||C.keysStr()!==k){continue}await S(850);if(C.spin()||C.keysStr()!==k){continue}return {ok:1,k:k,act:C.active()}}return {ok:0,k:C.keysStr(),act:C.active()}};
C.walk2=async function(a,b){var W=window.__walk={a:a,b:b,cur:a,st:'run',n:0,fail:[],lg:[],done:0};for(var p=a;p<=b;p++){W.cur=p;var g=0;while(g<24){if(!C.spin()&&C.rowEls().length===10){break}await S(250);g++}var k=C.keysStr();if(!k){W.fail.push(p);W.lg.push(p+':empty');if(W.lg.length>40){W.lg.shift()}await S(900);continue}var rs=C.rows(),o=[];for(var m=0;m<rs.length;m++){o.push({k:rs[m].key,n:rs[m].n})}localStorage.setItem('__sc'+p,JSON.stringify(o));W.n+=o.length;if(C.active()!==p){W.lg.push(p+':lab'+C.active());if(W.lg.length>40){W.lg.shift()}}if(p>=b){break}var w=null;for(var t=0;t<3;t++){var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');if(!nx){break}if(nx.disabled){break}nx.click();w=await C.nextWait(k,11000);if(w.ok){break}}if(!w||!w.ok){W.fail.push(p+1);W.lg.push((p+1)+':nf@'+C.active());W.st='paused';return W}await S(150+Math.random()*150)}W.st='end';W.done=1;return W};
C.walk3=async function(end){var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),fail:[],lg:[],skip:[],done:0,dir:'f'};var last='';while(true){var p=C.active();var g=0;while(g<24){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}var rs=C.rows(),o=[];for(var m=0;m<rs.length;m++){o.push({k:rs[m].key,n:rs[m].n})}if(o.length){localStorage.setItem('__sc'+p,JSON.stringify(o));W.n+=o.length;if(last&&o[0].k<=last){W.lg.push(p+':ord');if(W.lg.length>30){W.lg.shift()}}last=o[o.length-1].k}W.cur=p;if(p>=end){break}var ok=0;for(var t=0;t<3;t++){var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');if(!nx||nx.disabled){break}nx.click();var w=await C.nextWait(last,11000);if(w.ok){ok=1;break}}if(!ok){W.fail.push(p);W.lg.push(p+':nf');W.st='paused';return W}var nb=C.active();if(nb!==p+1){W.lg.push(p+'>'+nb);if(W.lg.length>30){W.lg.shift()}if(nb>p+1){for(var s=p+1;s<nb&&W.skip.length<300;s++){W.skip.push(s)}}}await S(120+Math.random()*120)}W.st='end';W.done=1;return W};
C.walkB=async function(start){var W=window.__walk={start:start,st:'run',n:0,cur:C.active(),fail:[],lg:[],skip:[],done:0,dir:'b'};var last='';while(true){var p=C.active();var g=0;while(g<24){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}var rs=C.rows(),o=[];for(var m=0;m<rs.length;m++){o.push({k:rs[m].key,n:rs[m].n})}if(o.length){localStorage.setItem('__sc'+p,JSON.stringify(o));W.n+=o.length;last=o[0].k}W.cur=p;if(p<=start){break}var ok=0;for(var t=0;t<3;t++){var pv=document.querySelector('.ant-pagination-prev button')||document.querySelector('.ant-pagination-prev');if(!pv||pv.disabled){break}pv.click();var w=await C.nextWait(last,11000);if(w.ok){ok=1;break}}if(!ok){W.fail.push(p);W.lg.push(p+':nf');W.st='paused';return W}var nb=C.active();if(nb!==p-1){W.lg.push(p+'>'+nb);if(W.lg.length>30){W.lg.shift()}}await S(120+Math.random()*120)}W.st='end';W.done=1;return W};
C.jump3=async function(t){var w=await C.jump(t);if(!w.ok){return {ok:0,act:C.active()}}var g=0;while(g<20){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}var exp=localStorage.getItem('__sc'+t);var cur=C.keysStr();if(exp){var arr=JSON.parse(exp),ks=arr.map(function(x){return x.k}).join(',');if(ks===cur){return {ok:1,act:t,ver:1}}}return {ok:1,act:C.active(),ver:0}};
C.walk4=async function(end){var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),fail:[],lg:[],skip:[],done:0,mode:'count'};var p=C.active();var last='';while(true){var tries=0,o=null;while(tries<4){var g=0;while(g<24){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}var rs=C.rows();o=[];for(var m=0;m<rs.length;m++){o.push({k:rs[m].key,n:rs[m].n})}if(o.length&&(!last||o[0].k>last)){break}var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');if(!nx||nx.disabled){break}nx.click();await C.nextWait(last,9000);tries++}if(!o||!o.length||(last&&o[0].k<=last)){W.lg.push(p+':stuck');W.fail.push(p);W.st='paused';return W}localStorage.setItem('__sc'+p,JSON.stringify(o));W.n+=o.length;last=o[o.length-1].k;W.cur=p;if(p>=end){break}var ok=0;for(var t=0;t<3;t++){var n2=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');if(!n2||n2.disabled){break}n2.click();var w=await C.nextWait(last,11000);if(w.ok){ok=1;break}}if(!ok){W.fail.push(p+1);W.lg.push((p+1)+':nf');W.st='paused';return W}var nb=C.active();if(nb!==p+1){W.lg.push(p+'>'+nb);if(W.lg.length>30){W.lg.shift()}if(nb>p+1){for(var s2=p+1;s2<nb&&W.skip.length<300;s2++){W.skip.push(s2)}}}p=p+1;await S(120+Math.random()*120)}W.st='end';W.done=1;return W};
C.stable=async function(prev,ms){
var n=Math.ceil(ms/300);
for(var i=0;i<n;i++){
if(!C.spin()&&C.rowEls().length===10){
var k=C.keysStr();
if(k&&k!==prev){await S(1100);if(!C.spin()&&C.keysStr()===k){await S(1100);if(!C.spin()&&C.keysStr()===k){return k}}}
}
await S(300)
}
return ''
};
C.scan2=async function(list){
var J=window.__scan={list:list,cur:0,st:'start',log:[],n:0,fail:[]};
var prev='';
for(var i=0;i<list.length;i++){
var pg=list[i];J.cur=pg;J.st='nav';
var w=await C.jump(pg);
if(!w.ok){J.fail.push(pg);J.log.push(pg+':jf@'+w.cur);prev='';await S(900);continue}
var ks=await C.stable(prev,12000);
if(!ks){var w2=await C.jump(pg);if(w2.ok){ks=await C.stable('',9000)}}
if(!ks){J.fail.push(pg);J.log.push(pg+':stale');prev='';await S(900);continue}
var rs=C.rows(),o=[];
for(var m=0;m<rs.length;m++){o.push({k:rs[m].key,n:rs[m].n})}
localStorage.setItem('__sc'+pg,JSON.stringify(o));
J.n+=o.length;prev=ks;
await S(260+Math.random()*240);
}
J.st='end';J.done=1;return J;
};
C.readAll=async function(a,z,need){
var J=window.__job2={a:a,z:z,cur:a-1,st:'start',log:[],n:0,miss:[]};
for(var pg=a;pg<=z;pg++){
var keys=(need&&need[pg])||null;
if(!keys||!keys.length){continue}
J.cur=pg;J.st='nav';
var w=await C.jump(pg);
if(!w.ok){J.log.push(pg+':jf@'+w.cur);for(var q=0;q<keys.length;q++){J.miss.push(keys[q])}continue}
var sk=await C.stable('',20000);
if(!sk){J.log.push(pg+':stale');for(var q2=0;q2<keys.length;q2++){J.miss.push(keys[q2])}continue}
var meta=C.rows(),pos={};
for(var i=0;i<meta.length;i++){pos[meta[i].key]=i}
J.st='read';var got=0;
for(var j=0;j<keys.length;j++){
var i=pos[keys[j]];
if(i===undefined){J.miss.push(keys[j]);continue}
var tr=C.rowEls()[i];
if(!tr){J.miss.push(keys[j]);continue}
var m=meta[i];m.i=i;
var r=await C.readRow(tr,m);r.pg=pg;
var pre=JSON.parse(localStorage.getItem('__pg'+pg)||'[]');
pre.push(r);localStorage.setItem('__pg'+pg,JSON.stringify(pre));
got++;
await S(180+Math.random()*220);
}
J.n+=got;
J.log.push(pg+':'+got);
await S(700+Math.random()*400);
}
J.st='end';J.done=1;return J;
};
window.__crm=C;window.__job={run:0,cur:0,st:'none'};
})();
