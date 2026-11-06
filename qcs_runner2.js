window.__Q2={};
window.__Q2.S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
window.__Q2.rows=function(){return [].slice.call(document.querySelectorAll('tr.ant-table-row'))};
window.__Q2.name=function(i){var rs=window.__Q2.rows();if(!rs[i])return '';var t=(rs[i].innerText||'').split('\n');for(var j=1;j<t.length;j++){if(t[j].indexOf('联系方式')>=0)return (t[j-1]||'').trim()}return ''};
window.__Q2.sig=function(){var rs=window.__Q2.rows();return window.__Q2.name(0)+'#'+window.__Q2.name(rs.length-1)+'#'+rs.length};
window.__Q2.scrape=function(){
var rs=window.__Q2.rows();var out=[];
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
window.__RUN2=async function(G){
var S=window.__Q2.S;
var st=JSON.parse(localStorage.getItem('__ST2')||'{}');
if(!st[G])st[G]={page:1,recs:{}};
var g=st[G];
function save(){localStorage.setItem('__ST2',JSON.stringify(st))}
function rows(){return window.__Q2.rows()}
function pnum(){var m=location.href.match(/[?&]page=([0-9]+)/);return m?parseInt(m[1],10):1}
function dismiss(){[].slice.call(document.querySelectorAll('button')).forEach(function(b){if((b.innerText||'').trim()==='我知道了'&&b.getBoundingClientRect().width>0)b.click()})}
async function turn(prevSig){
var p=pnum();
var n=document.querySelector('.ant-pagination-next');
if(!n)return false;
var b=n.querySelector('button')||n;
if(b.disabled)return false;
['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ty){b.dispatchEvent(new MouseEvent(ty,{bubbles:true,cancelable:true,view:window}))});
for(var i=0;i<40;i++){
await S(350);
if(pnum()>p&&rows().length>100&&window.__Q2.sig()!==prevSig)return true;
}
return false}
var lim=g.limit||15;
var t=g.page||1;
var cur=pnum();
while(cur<t){var sg0=window.__Q2.sig();if(!await turn(sg0)){g.done=true;save();window.__PROG2=JSON.stringify({g:G,page:t,cnt:Object.keys(g.recs).length,stalled:true});return}cur++}
while(t<=lim){
if(t%5===1)dismiss();
var sg=window.__Q2.sig();
await S(200);
var a=window.__Q2.scrape();
if(a.length<50){g.done=true;break}
var add=0;
for(var j=0;j<a.length;j++){var r=a[j];if((r.rg||'').indexOf('贵州')>=0&&!g.recs[r.n]){g.recs[r.n]=r;add++}}
g.page=t+1;save();
window.__PROG2=JSON.stringify({g:G,page:t+1,cnt:Object.keys(g.recs).length,lastAdd:add,rows:a.length});
if(t>=lim){g.done=true;break}
if(!await turn(sg)){g.done=true;break}
t++}
save();
window.__PROG2=JSON.stringify({g:G,page:t,cnt:Object.keys(g.recs).length,done:true})
};
