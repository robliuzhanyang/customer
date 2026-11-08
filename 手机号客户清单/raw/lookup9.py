import json

names = ["贵州瓮安星纬建筑劳务有限公司", "贵州毅诚建筑劳务有限公司", "贵州承坤火星建筑劳务有限公司",
         "贵州喻河建筑劳务有限公司", "贵州省叶凡建筑劳务有限责任公司", "贵州铸基建筑劳务有限公司",
         "贵州肖然建筑劳务有限公司", "贵州层达劳务有限公司", "贵州霖虹劳务有限公司"]

raw = json.load(open('/workspace/11月搜索客户/资质新办_贵州_raw.json', encoding='utf-8'))
d = {str(x.get('n') or '').strip(): x for x in raw}
for n in names:
    x = d.get(n)
    print(n, '->', x if x else 'NOT FOUND')
