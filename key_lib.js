(function(){
if(!window.__crm){return}
var C=window.__crm;
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
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
C.ensure10=async function(){
var v=document.querySelector('.ant-pagination-options .ant-select-selection-selected-value');
if(v&&(v.innerText||'').indexOf('10 \u6761/\u9875')>=0){return 'ok'}
var sel=document.querySelector('.ant-pagination-options .ant-select');
if(!sel){return 'nosel'}
sel.click();
await S(700);
var os=document.querySelectorAll('.ant-select-dropdown-menu-item, .ant-select-item-option, .ant-dropdown-menu-item');
for(var i=0;i<os.length;i++){
var tx=(os[i].innerText||'').trim();
if(tx==='10 \u6761/\u9875'||tx==='10\u6761/\u9875'){os[i].click();await S(1800);return 'set'}
}
return 'notfound';
};
C.sortBy=async function(label,dir){
var ths=document.querySelectorAll('th');
for(var i=0;i<ths.length;i++){
var t=(ths[i].textContent||'').trim();
if(t.indexOf(label)>=0){
var sc=ths[i].querySelector('.ant4-table-column-sorter');
if(!sc){continue}
var up=ths[i].querySelector('.ant4-table-column-sorter-up');
var dn=ths[i].querySelector('.ant4-table-column-sorter-down');
var want=dir==='asc'?up:dn;
var have=dir==='asc'?dn:up;
if(want&&(want.className||'').toString().indexOf('active')>=0){return 'already'}
if(have&&(have.className||'').toString().indexOf('active')>=0){have.click();await S(1200)}
var target=want||sc;
['mousedown','mouseup','click'].forEach(function(x){target.dispatchEvent(new MouseEvent(x,{bubbles:true,cancelable:true}))});
var g=0;
while(g<20){
await S(300);
if(want&&(want.className||'').toString().indexOf('active')>=0){return 'ok:'+i}
g++;
}
return 'fail:'+i;
}
}
return 'notfound';
};
C.keyWalk=async function(end){
var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),lg:[],done:0,mode:'key',pause:0,rows:0};
var prevStr='';
while(true){
while(W.pause){await S(400)}
var p=C.active();
var g=0;
while(g<30){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}
var o=C.rowsL();
var cur=o.length?o[0].key+','+o[o.length-1].key:'';
if(!o.length||(prevStr&&cur===prevStr)){
W.lg.push(p+':stuck');
W.st='paused';
return W;
}
var ks=[];
for(var m=0;m<o.length;m++){ks.push({k:o[m].key,n:o[m].n})}
localStorage.setItem('__fl'+p,JSON.stringify(ks));
W.n+=ks.length;
W.rows=ks.length;
W.cur=p;
prevStr=cur;
if(p>=end){break}
var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');
if(!nx||nx.disabled){W.lg.push((p+1)+':nbtn');W.st='paused';W.cur=p;return W}
var before=C.kstr();
nx.click();
var w=await C.nw3(before,14000);
if(!w.ok){W.lg.push((p+1)+':nf@'+C.active());W.st='paused';return W}
await S(300+Math.random()*200);
}
W.st='end';W.done=1;return W;
};
})();
