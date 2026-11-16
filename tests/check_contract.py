from html.parser import HTMLParser
from pathlib import Path
s=Path('index.html').read_text(encoding='utf-8')
class Ids(HTMLParser):
 def __init__(self): super().__init__();self.ids=set()
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if d.get('id'): self.ids.add(d['id'])
p=Ids();p.feed(s)
for id in ['map','choices','searchInput','searchResults','searchClear','searchForm','elevationLegend','locate','compass','panel','demoTag']:
 assert id in p.ids,f'Missing {id}'
for token in ['color-relief','mapp-elevation-bands',"['step',['elevation']","kind==='fill-extrusion'","setLayout(id,'visibility','none')",'photon.komoot.io/api/','AbortController()','searchCache','new maplibregl.Marker','tiles.mapterhorn.com/tilejson.json']:
 assert token in s,f'Missing {token}'
assert 'fill-pattern' not in s and 'mapp-forest-texture' not in s
print('HTML, DEM, 2D and geocoding contract OK')
