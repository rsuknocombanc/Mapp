from pathlib import Path
from html.parser import HTMLParser
h=Path('index.html').read_text()
a=Path('assets/app.js').read_text()
f=Path('assets/forest.js').read_text()
c=Path('assets/app.css').read_text()
class Parser(HTMLParser):
 def __init__(self): super().__init__(); self.ids=set()
 def handle_starttag(self, tag, attrs):
  d=dict(attrs)
  if d.get('id'):self.ids.add(d['id'])
p=Parser();p.feed(h)
for key in ['map','searchInput','searchResults','searchForm','tabStyle','tabRoute','stylePane','routePane','routeCalculate','routeClear','routeUndo','routeFromGps','routeAddStop','modeAutomatic','modeManual','routeSummary','routeHelp','statusText','locate','mapAreaLabel','buildStamp','buildVersion','buildContext']:
 assert key in p.ids,key
assert 'styleChoice' not in h,'Three incompatible style buttons must be removed'
for t in ['Acuarela · Bosque · Tinta','Atlas ilustrado','EDICIÓN 0.9.0']:
 assert t in h,t
for t in ["const APP_VERSION='0.9.0'",'mapp-park-wash','mapp-forest-wash','mapp-water-wash','mapp-route-dashed','photon.komoot.io/api/','router.project-osrm.org/route/v1/driving/','AbortController','getCurrentPosition','modeRoute','autoRoute','addWaypoint']:
 assert t in a,t
for t in ['mapp-tree-symbols','landcover','landuse','park','new Image()','getImageData','maxDesktop=600','maxMobile=320','sprite:spriteFor(variant,tone,family)','ATLAS']:
 assert t in f+a,t
assert "'fill-pattern':" not in a and "type:'hillshade'" not in a
assert '#paperTexture' in c
assert Path('assets/trees/watercolor-atlas.png').exists()
assert 150000 < Path('assets/trees/watercolor-atlas.png').stat().st_size < 3_500_000
assert len(a)<49000 and len(f)<30000
print('Mapp v0.6 single-art atlas, watercolor sprites, routing and UI contract OK')
assert 'treeIconSizeExpression' in f
assert "'icon-size':treeIconSizeExpression()" in f
assert "'icon-size':['*',['get','scale'],['interpolate'" not in f
assert '<strong id="buildVersion">v0.9.0</strong>' in h

for obsolete in ['mapp-forest-bleed','mapp-grass-bleed','mapp-park-bleed','mapp-forest-pastel']:
 assert obsolete not in a,'obsolete triangulated wash '+obsolete
for watercolor in ['mapp-forest-wash','mapp-grass-wash','mapp-park-wash']:
 assert watercolor in a
assert 'canopyCluster' in f and 'forestLevel' in f

p=Path('assets/layer-policy.js').read_text()
assert 'src="./assets/layer-policy.js" defer' in h
assert h.index('assets/layer-policy.js') < h.index('assets/app.js')
for key in ['applyPolicy','restorePolicy','verifyPolicy','mapp-commune-boundary','swimming_pool','road_service_track','road_path_pedestrian']:
 assert key in p,key
assert 'MappLayerPolicy.applyPolicy(map)' in a
print('MAP-0012 approved D1 visibility layer contract OK')

for tree_id in ['treeBroadleaf','treeConifer']:
 assert f'id="{tree_id}"' in h,tree_id
assert 'Frondoso cenital' in h and 'Conífera cenital' in h
assert h.count('aria-pressed="true"')>=1
assert "initialFamily:'broadleaf'" in a
assert 'setTreeFamily' in a and 'illustratedPigments' in a
assert 'icon-anchor\':\'center' in f
assert 'assets/pigment.js' in h
assert 'assets/trees/canopy-atlas.png' in f
assert 'assets/trees/pigment-atlas.png' in Path('assets/pigment.js').read_text()
print('MAP-0013: top-down-only selector, pigment and order contract OK')
