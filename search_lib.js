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
C.missList=function(){
if(window.__ml)return window.__ml;
var s='';
for(var i=0;i<64;i++){var p=localStorage.getItem("__ml"+i);if(p){s+=(s?',':'')+p}}
var out=[];
try{out=JSON.parse('['+s+']')}catch(e){out=[]}
window.__ml=out;
return out;
};
C.readRow3=async function(tr,meta){
var r={k:meta.key,n:meta.n,c:meta.c,l:meta.l,h:meta.h,ch:meta.ch,st:meta.st,tl:meta.tl};
var t='';
for(var a=0;a<2;a++){
var vb=C.viewBtn(tr);
if(!vb){await S(300);tr=(C.rowEls()[meta.i]||tr);continue}
vb.click();
t=await C.waitDrawer(meta.n);
if(t){break}
C.close();
await S(450);
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
}
}
C.close();
await S(240+Math.random()*160);
return r;
};
C.doSearch=async function(name,key){
var i=document.querySelectorAll('input')[0];
if(!i){return {ok:0,why:'noinput'}}
var set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
set.call(i,name);
i.dispatchEvent(new Event('input',{bubbles:true}));
await S(120);
var g=i.closest('.ant-input-group');
var b=g?g.querySelector('button.ant-btn'):null;
if(!b){return {ok:0,why:'nobtn'}}
var prev=C.kstr();
b.click();
var rows=[];
for(var t=0;t<22;t++){
await S(300);
if(C.spin()){continue}
rows=C.rowEls();
if(!rows.length){continue}
for(var r=0;r<rows.length;r++){if(rows[r].getAttribute('data-row-key')===key){return {ok:1,pos:r}}}
if(C.kstr()!==prev){break}
}
for(var pg=0;pg<3;pg++){
var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');
if(!nx||nx.disabled){break}
var before=C.kstr();
nx.click();
await S(1200);
rows=C.rowEls();
for(var r2=0;r2<rows.length;r2++){if(rows[r2].getAttribute('data-row-key')===key){return {ok:1,pos:r2}}}
}
return {ok:0,why:'notfound'};
};
C.searchFill=async function(s,e){
var list=C.missList();
var W=window.__walk={mode:'search',st:'run',i:s,n:0,fail:[],lg:[],done:0,pause:0,total:list.length};
for(var idx=s;idx<e&&idx<list.length;idx++){
while(W.pause){await S(400)}
W.i=idx;
var it=list[idx];
var r=await C.doSearch(it.name,it.k);
if(!r.ok){W.lg.push(idx+':nf');W.fail.push(idx);await S(250);continue}
var tr=C.rowEls()[r.pos];
if(!tr){W.lg.push(idx+':nr');W.fail.push(idx);continue}
var meta=C.rows()[r.pos];
meta.i=r.pos;
var rec=await C.readRow3(tr,meta);
rec.pg='s'+idx;
rec.src=it.name;
localStorage.setItem('__pg'+idx,JSON.stringify([rec]));
W.n++;
if(W.lg.length>30){W.lg.shift()}
}
W.st='end';W.done=1;return W;
};
})();
