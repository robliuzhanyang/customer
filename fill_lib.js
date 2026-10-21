(function(){
if(!window.__crm){return}
var C=window.__crm;
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
C.fillKnown=function(){
var K=new Set();
for(var i=0;i<64;i++){var s=localStorage.getItem('__kn'+i);if(s){var a=s.split(',');for(var j=0;j<a.length;j++){if(a[j]){K.add(a[j])}}}}
return K;
};
C.cleanDom=function(){
var n=0;
try{
var ds=document.querySelectorAll('.ant-drawer,.ant4-drawer');
var open=document.querySelector('.ant-drawer-open,.ant4-drawer-open');
for(var i=0;i<ds.length;i++){
var d=ds[i];
if(d.classList&&(d.classList.contains('ant-drawer-open')||d.classList.contains('ant4-drawer-open'))){continue}
if(d.parentNode){d.parentNode.removeChild(d);n++}
}
if(!open){
var ms=document.querySelectorAll('.ant-drawer-mask,.ant4-drawer-mask');
for(var j=0;j<ms.length;j++){if(ms[j].parentNode){ms[j].parentNode.removeChild(ms[j]);n++}}
}
}catch(e){}
return n;
};
C.sortAsc=function(){
var ths=document.querySelectorAll('th');
for(var i=0;i<ths.length;i++){
var t=ths[i].textContent||'';
if(t.indexOf('创建时间')>=0){
var up=ths[i].querySelector('.ant4-table-column-sorter-up');
var dn=ths[i].querySelector('.ant4-table-column-sorter-down');
if(up&&up.className.indexOf('active')>=0){return 'already'}
if(up){up.click();return 'clicked'}
if(dn){dn.click();return 'dn'}
}
}
return 'notfound';
};
C.rowsL=function(){
var rs=C.rowEls(),o=[];
for(var i=0;i<rs.length;i++){
var td=rs[i].querySelectorAll('td');
o.push({key:rs[i].getAttribute('data-row-key'),n:td[2]?td[2].textContent.trim():''});
}
return o;
};
C.kstr=function(){
var rs=C.rowEls(),a=[];
for(var i=0;i<rs.length;i++){a.push(rs[i].getAttribute('data-row-key'))}
return a.join(',');
};
C.nw3=async function(prev,ms){
var n=Math.ceil(ms/400);
for(var i=0;i<n;i++){
await S(400);
if(C.spin()||C.rowEls().length<3){continue}
var k=C.kstr();
if(!k||k===prev){continue}
await S(550);
if(C.spin()){continue}
if(C.kstr()!==k){continue}
return {ok:1,k:k,act:C.active()};
}
return {ok:0,k:C.kstr(),act:C.active()};
};
C.fill=async function(end){
var K=C.fillKnown();
var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),need:0,fail:[],lg:[],skip:[],done:0,known:K.size,mode:'fill4',pause:0,dom:[0,0]};
var last='';
var prevStr='';
while(true){
while(W.pause){await S(400)}
var p=C.active();
C.cleanDom();
var g=0;
while(g<30){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}
var o=C.rowsL();
var cur=o.length?o[0].key+','+o[o.length-1].key:'';
if(!o.length||(last&&o[0].key<=last)||(prevStr&&cur===prevStr)){
W.lg.push(p+':stuck');
W.fail.push(p);
W.st='paused';
return W;
}
var ks=[];
for(var m=0;m<o.length;m++){ks.push({k:o[m].key,n:o[m].n})}
localStorage.setItem('__fl'+p,JSON.stringify(ks));
W.n+=ks.length;
last=ks[ks.length-1].k;
W.cur=p;
prevStr=cur;
var need=[];
for(var m2=0;m2<o.length;m2++){if(!K.has(o[m2].key)){need.push(m2)}}
if(need.length){
var full=C.rows();
var recs=[];
for(var j2=0;j2<need.length;j2++){
var i2=need[j2];
var tr=C.rowEls()[i2];
if(!tr){W.lg.push(p+':nr'+i2);continue}
var md=full[i2]||o[i2];
md.i=i2;
var r=await C.readRow(tr,md);
r.pg=p;
recs.push(r);
localStorage.setItem('__pg'+p,JSON.stringify(recs));
W.need+=1;
C.cleanDom();
await S(420+Math.random()*280);
}
}
W.dom=[C.rowEls().length,document.querySelectorAll('.ant-drawer,.ant4-drawer').length];
if(W.lg.length>40){W.lg.shift()}
if(p>=end){break}
var n2=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');
if(!n2||n2.disabled){W.fail.push(p+1);W.lg.push((p+1)+':nbtn');W.st='paused';return W}
var before=C.kstr();
n2.click();
var w=await C.nw3(before,14000);
if(!w.ok){W.fail.push(p+1);W.lg.push((p+1)+':nf@'+C.active());W.st='paused';return W}
await S(500+Math.random()*300);
}
W.st='end';W.done=1;return W;
};
})();
