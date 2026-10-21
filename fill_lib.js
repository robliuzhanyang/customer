(function(){
if(!window.__crm){return}
var C=window.__crm;
var S=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
C.fillKnown=function(){
var K=new Set();
for(var i=0;i<64;i++){var s=localStorage.getItem('__kn'+i);if(s){var a=s.split(',');for(var j=0;j<a.length;j++){if(a[j]){K.add(a[j])}}}}
return K;
};
C.fill=async function(end){
var K=C.fillKnown();
var W=window.__walk={end:end,st:'run',n:0,cur:C.active(),need:0,fail:[],lg:[],skip:[],done:0,known:K.size,mode:'fill'};
var last='';
while(true){
var p=C.active();
var tries=0,o=null,ok=0;
while(tries<4){
var g=0;
while(g<30){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g++}
o=C.rows();
if(o.length&&(!last||o[0].key>last)){ok=1;break}
var nx=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');
if(!nx||nx.disabled){break}
nx.click();await C.nextWait(last,9000);
tries++;
}
if(!ok||!o||!o.length){W.lg.push(p+':stuck');W.fail.push(p);W.st='paused';return W}
var ks=[];
for(var m=0;m<o.length;m++){ks.push({k:o[m].key,n:o[m].n})}
localStorage.setItem('__fl'+p,JSON.stringify(ks));
W.n+=ks.length;
last=ks[ks.length-1].k;
W.cur=p;
var need=[];
for(var m2=0;m2<o.length;m2++){if(!K.has(o[m2].key)){need.push(m2)}}
if(need.length){
var recs=[];
for(var j2=0;j2<need.length;j2++){
var i2=need[j2];
var tr=C.rowEls()[i2];
if(!tr){W.lg.push(p+':nr'+i2);continue}
var md=o[i2];
md.i=i2;
var r=await C.readRow(tr,md);
r.pg=p;
recs.push(r);
localStorage.setItem('__pg'+p,JSON.stringify(recs));
W.need+=1;
await S(180+Math.random()*220);
}
}
if(W.lg.length>40){W.lg.shift()}
if(p>=end){break}
var g2=0;
while(g2<30){if(!C.spin()&&C.rowEls().length>=3){break}await S(250);g2++}
var ok2=0;
for(var t=0;t<3;t++){
var n2=document.querySelector('.ant-pagination-next button')||document.querySelector('.ant-pagination-next');
if(!n2||n2.disabled){break}
n2.click();
var w=await C.nextWait(last,11000);
if(w.ok){ok2=1;break}
}
if(!ok2){W.fail.push(p+1);W.lg.push((p+1)+':nf@'+C.active());W.st='paused';return W}
await S(120+Math.random()*120);
}
W.st='end';W.done=1;return W;
};
})();
