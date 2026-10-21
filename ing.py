import json,sys
d=json.load(open(sys.argv[1]))
n=0
for p,v in d.items():
    p=int(p)
    if not v: continue
    json.dump(v,open('/workspace/scan2/p%04d.json'%p,'w'))
    n+=1
print('ing',n)
