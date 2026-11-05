window.__QCS={};
window.__QCS.S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
window.__QCS.rows=function(){return [].slice.call(document.querySelectorAll('tr.ant-table-row'))};
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
window.__RUN=async function(G){
var S=window.__QCS.S;
var st=JSON.parse(localStorage.getItem('__ST')||'{}');
if(!st[G])st[G]={page:1,recs:{}};
var g=st[G];
function save(){localStorage.setItem('__ST',JSON.stringify(st))}
function rows(){return window.__QCS.rows()}
function pnum(){var m=location.href.match(/[?&]page=([0-9]+)/);return m?parseInt(m[1],10):1}
function dismiss(){[].slice.call(document.querySelectorAll('button.ant-btn, button')).forEach(function(b){if((b.innerText||'').trim()==='我知道了'&&b.getBoundingClientRect().width>0)b.click()})}
function next(){var n=document.querySelector('.ant-pagination-next');if(!n)return false;var b=n.querySelector('button')||n;if(b.disabled)return false;['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ty){b.dispatchEvent(new MouseEvent(ty,{bubbles:true,cancelable:true,view:window}))});return true}
async function turn(){
var p=pnum();
if(!next())return false;
for(var i=0;i<30;i++){await S(300);if(pnum()>p&&rows().length>40)return true}
return false}
var t=g.page;var cur=pnum();
while(cur<t){if(!await turn()){g.done=true;save();window.__PROG=JSON.stringify({g:G,page:t,cnt:Object.keys(g.recs).length,stalled:true,nopage:true});return}cur++}
var lim=g.limit||60;
while(t<=lim){
if(t%5===1)dismiss();
await S(150);
var a=window.__QCS.scrape();
if(a.length<40){g.done=true;break}
var add=0;
for(var j=0;j<a.length;j++){var r=a[j];if((r.rg||'').indexOf('贵州')>=0&&!g.recs[r.n]){g.recs[r.n]=r;add++}}
g.page=t+1;save();
window.__PROG=JSON.stringify({g:G,page:t+1,cnt:Object.keys(g.recs).length,lastAdd:add,rows:a.length});
if(t>=60){g.done=true;break}
if(!await turn()){g.done=true;break}
t++}
save();
window.__PROG=JSON.stringify({g:G,page:t,cnt:Object.keys(g.recs).length,done:true})
};
