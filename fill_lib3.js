(function(){
if(!window.__crm){return}
var C=window.__crm;
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
C.fillKnown=function(){
var K=new Set();
for(var i=0;i<64;i++){var s=localStorage.getItem('__kn'+i);if(s){var a=s.split(',');for(var j=0;j<a.length;j++){if(a[j]){K.add(a[j])}}}}
return K;
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
C.readRow2=async function(tr,meta){
var r={k:meta.key,n:meta.n,c:meta.c,l:meta.l,h:meta.h,ch:meta.ch,st:meta.st,tl:meta.tl};
var t='';
for(var a=0;a<2;a++){
var vb=C.viewBtn(tr);
if(!vb){await S(400);tr=(C.rowEls()[meta.i]||tr);continue}
vb.click();
t=await C.waitDrawer(meta.n);
if(t){break}
C.close();
await S(650);
}
if(!t){r.err='dt';return r}
var p=C.parse(t);
if(p.c&&meta.n&&p.c.slice(0,4)!==meta.n.slice(0,4)){r.err='mm'}
r.c=p.c||r.c;
r.ct=p.ct||'--';
r.tel=p.tel||r.tl||'--';
r.m=p.m||'';
r.hot=p.hot||r.h||'--';
r.rg=p.rg||'';
r.ad=p.ad||'';
r.ch=p.ch||r.ch;
C.close();
await S(550+Math.random()*300);
if(r.h&&r.h.indexOf('@')>=0){
var hb=C.hotBtn(tr);
if(hb){
hb.click();
var ht=await C.waitHot();
if(ht){
var nums=(ht.match(/1[0-9]{10}/g)||[]).concat(ht.match(/0[0-9]{2,3}-?[0-9]{7,8}/g)||[]);
var u=[];
for(var i=0;i<nums.length;i++){if(u.indexOf(nums[i])<0){u.push(nums[i])}}
r.hn=u.join('；');
}
C.close();
await S(450+Math.random()*300);
}
}
return r;
};
C.fill=async function(end){
var K=C.fillKnown();
var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),need:0,fail:[],lg:[],skip:[],done:0,known:K.size,mode:'fill5',pause:0,dom:[0,0]};
var last='';
var prevStr='';
while(true){
while(W.pause){await S(400)}
var p=C.active();
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
var r=await C.readRow2(tr,md);
r.pg=p;
recs.push(r);
localStorage.setItem('__pg'+p,JSON.stringify(recs));
W.need+=1;
await S(400+Math.random()*250);
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
