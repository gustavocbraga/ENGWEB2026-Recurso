import json

# Load all datasets
with open('operas.json') as f:
    operas = json.load(f)
with open('compositores.json') as f:
    compositores = json.load(f)
with open('teatros.json') as f:
    teatros = json.load(f)
with open('arias.json') as f:
    arias = json.load(f)
with open('cantores.json') as f:
    cantores = json.load(f)

# Build lookup maps
compositor_map = {}
for c in compositores:
    for opera_id in c['composedOperas']:
        compositor_map[opera_id] = {"id": c['id'], "name": c['name']}

teatro_map = {}
for t in teatros:
    for opera_id in t['premieredOperas']:
        teatro_map[opera_id] = {"id": t['id'], "name": t['name'], "country": t['country']}

arias_map = {}
for a in arias:
    opera_id = a['featuredInOpera']
    if opera_id not in arias_map:
        arias_map[opera_id] = []
    arias_map[opera_id].append({"id": a['id'], "name": a['name'], "voiceType": a['voiceType']})

cantores_map = {}
for c in cantores:
    for opera_id in c['sangIn']:
        if opera_id not in cantores_map:
            cantores_map[opera_id] = []
        cantores_map[opera_id].append(c['name'])

# Build unified dataset
result = []
for opera in operas:
    oid = opera['id']
    unified = {
        "_id": oid,
        "title": opera['title'],
        "genre": opera['genre'],
        "premiereYear": opera['premiereYear'],
        "runtimeMinutes": opera['runtimeMinutes'],
        "descriptionEN": opera['descriptionEN'],
        "compositor": compositor_map.get(oid, {}),
        "teatro": teatro_map.get(oid, {}),
        "arias": arias_map.get(oid, []),
        "cantores": cantores_map.get(oid, [])
    }
    result.append(unified)

with open('operas_normalized.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Done! {len(result)} operas written.")
for op in result:
    print(f"  {op['_id']}: compositor={op['compositor'].get('name','N/A')}, teatro={op['teatro'].get('name','N/A')}, arias={len(op['arias'])}, cantores={len(op['cantores'])}")
