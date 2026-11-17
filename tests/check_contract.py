from pathlib import Path
from html.parser import HTMLParser
html=Path('index.html').read_text()
js=Path('assets/app.js').read_text()
css=Path('assets/app.css').read_text()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
p=Parser();p.feed(html)
for key in ['map','buildStamp','buildVersion','buildContext','searchInput','searchResults','searchForm','tabStyle','tabRoute','stylePane','routePane','routeCalculate','routeClear','routeUndo','routeFromGps','routeAddStop','modeAutomatic','modeManual','routeSummary','routeHelp','statusText','locate','mapAreaLabel']:
 assert key in p.ids,key
for s in ['maplibregl.Map','mapp-route-dashed','mapp-route-halo','road_minor','line-dasharray','mapp-forest-wash','mapp-water-wash','mapp-forest-edge','mapp-water-edge','photon.komoot.io/api/','router.project-osrm.org/route/v1/driving/','AbortController','getCurrentPosition','modeRoute','autoRoute','addWaypoint']:
 assert s in js,s
for s in ["type:'raster-dem'", "type:'color-relief'", "type:'hillshade'"]:
 assert s not in js, f'Found DEM dependency {s}'
assert 'mapp-forest-texture' not in js and "'fill-pattern':" not in js
for layer in ['mapp-forest-pastel','mapp-water-pastel','mapp-forest-lift','mapp-water-lift','mapp-route-pastel']:
 assert layer in js,layer
assert "water:'#5F7E80'" in js and "wood:'#70835A'" in js
assert 'EDICIÓN 0.5.1' in html
assert '#paperTexture' in css
assert len(js)<45000,'JS too big for lean prototype'
print('v0.4 interface, routing and 2D contract OK')

# MAP-0007: Original geographic trees; no repeating fill-pattern or terrain.
forest=Path('assets/forest.js').read_text()
assert '<script src="./assets/forest.js" defer></script>' in html
assert 'illustratedForest=window.MappForest?.install' in js
assert 'illustratedForest?.setTheme(theme)' in js
for token in ['querySourceFeatures', 'sourceLayer:layer', 'mapp-tree-symbols', 'mapp-tree-points', 'icon-ignore-placement', 'hash(ix,iy', 'inRing', 'pixelRatio:2', 'setTimeout(refresh', 'map.getBounds()', 'map.addImage', 'map.updateImage']:
 assert token in forest, token
assert 'Math.random' not in forest and 'fill-pattern' not in forest
assert forest.count('querySourceFeatures')<=2, 'avoid repeated tile queries'
assert len(forest)<18000, 'heavy symbols module'

assert "const APP_VERSION='0.5.1'" in js
assert 'onStats:count=>' in js
assert 'if(onStats)onStats(result.features.length)' in Path('assets/forest.js').read_text()