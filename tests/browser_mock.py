from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import subprocess
ROOT=Path(__file__).resolve().parents[1]
FAKE=r'''
window.__routeCalls=0;
window.__testMaps=[];
class FakeMap{
 constructor(args){this._style={layers:[
 {id:'background',type:'background'},
 {id:'landuse',type:'fill'},
 {id:'landcover-wood',type:'fill'},
 {id:'water',type:'fill'},
 {id:'road_motorway',type:'line'},
 {id:'road_minor',type:'line'},
 {id:'road_major_rail',type:'line'},
 {id:'road_path',type:'line'},
 {id:'poi_label',type:'symbol'},
 {id:'road_name',type:'symbol'},
 {id:'building-3d',type:'fill-extrusion'}]};
 this._sources={openmaptiles:{}};this.paint={};this.layout={};this._listeners={};this._zoom=12;
 this.touchZoomRotate={disableRotation:()=>{}};window.__testMap=this;window.__testMaps.push(this);
 setTimeout(()=>this._emit('load'),0);
 }
 on(e,fn){(this._listeners[e]??=[]).push(fn)}
 _emit(e,data){(this._listeners[e]||[]).forEach(f=>f(data))}
 getCanvas(){return document.getElementById('map')}
 getStyle(){return this._style}
 isStyleLoaded(){return true}
 getSource(id){return this._sources[id]}
 addSource(id,o){this._sources[id]={setData:d=>{this._sources[id].data=d},data:o.data}}
 getLayer(id){return this._style.layers.find(l=>l.id===id)}
 addLayer(o,before){this._style.layers.push(o)}
 setPaintProperty(i,p,v){this.paint[i+':'+p]=v}
 setLayoutProperty(i,p,v){this.layout[i+':'+p]=v}
 getCenter(){return {lat:-33.33,lng:-70.32}}
 getZoom(){return this._zoom}
 flyTo(o){this.flyToLast=o}
 fitBounds(b,o){this.fitBoundsLast=o}
 zoomIn(){this._zoom++}
 zoomOut(){this._zoom--}
 easeTo(o){}
 resize(){}
}
class FakeMarker{
 constructor(o){this.element=o?.element;this.point=null}
 setLngLat(p){this.point=p;return this}
 addTo(map){this.map=map;return this}
 remove(){this.removed=true}
}
class FakeBounds{constructor(){this.points=[]}extend(p){this.points.push(p)}}
window.maplibregl={Map:FakeMap,Marker:FakeMarker,LngLatBounds:FakeBounds};
'''
def main():
 run_test()
def run_test():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  fake_fetch=r"""
  window.fetch=async function(url){
    if(String(url).includes('router.project-osrm.org'))return {ok:true,json:async()=>({code:'Ok',routes:[{distance:18000,duration:2000,geometry:{type:'LineString',coordinates:[[-70.32,-33.34],[-70.24,-33.51],[-70.18,-33.55]]}}]})};
    if(String(url).includes('photon.komoot.io'))return {ok:true,json:async()=>({features:[{properties:{name:'Embalse El Yeso',city:'San José de Maipo',country:'Chile'},geometry:{type:'Point',coordinates:[-70.07,-33.65]}}]})};
    throw Error('Unexpected fetch '+url);
  };
  """
  html=(ROOT/'index.html').read_text().replace('<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.css" />','')
  html=html.replace('<link rel="stylesheet" href="./assets/app.css" />','<style>'+ (ROOT/'assets/app.css').read_text()+'</style>')
  html=html.replace('<script src="https://unpkg.com/maplibre-gl@5.7.1/dist/maplibre-gl.js"></script>','<script>'+FAKE+fake_fetch+'</script>')
  html=html.replace('<script src="./assets/app.js" defer></script>','<script>'+ (ROOT/'assets/app.js').read_text()+'</script>')
  page.set_content(html,wait_until='load')
  page.wait_for_function('window.__testMap && window.__testMap.getSource("mapp-route")')
  assert page.locator('#statusText').inner_text().startswith('Mapa listo')
  assert page.evaluate('!Object.keys(window.__testMap._sources).some(k=>k.includes("elevation"))')
  assert page.evaluate('window.__testMap.layout["building-3d:visibility"]')=='none'
  # layered botanical wash and textured water, without DEM
  assert page.evaluate('window.__testMap.getLayer("mapp-water-wash") && window.__testMap.getLayer("mapp-forest-wash")')
  assert page.evaluate('window.__testMap.getLayer("mapp-forest-pastel") && window.__testMap.getLayer("mapp-water-pastel")')
  assert page.evaluate('window.__testMap.getLayer("mapp-route-pastel")')
  # A hand-drawn double contour, with no repeated polygon wallpaper texture.
  assert page.evaluate('window.__testMap.getLayer("mapp-water-pastel").paint["line-dasharray"].length')==6
  assert page.evaluate('window.__testMap.paint["water:fill-color"]')=='#5F7E80'
  assert page.evaluate('window.__testMap.paint["landcover-wood:fill-opacity"]')==.65
  assert page.evaluate('window.__testMap.getLayer("mapp-forest-wash").paint["fill-opacity"]')==.53

  page.get_by_role('button',name='Bosque',exact=True).click()
  assert page.get_by_role('button',name='Bosque',exact=True).get_attribute('aria-pressed')=='true'
  assert page.evaluate('window.__testMap.paint["water:fill-color"]')=='#547479'
  assert page.evaluate('window.__testMap.paint["mapp-forest-pastel:line-color"]')=='#45583E'
  assert page.evaluate('window.__testMap.paint["mapp-water-pastel:line-color"]')=='#385D64'
  page.locator('#tabRoute').click()
  assert not page.locator('#routePane').is_hidden()
  page.evaluate('window.__testMap._emit("click",{lngLat:{lng:-70.32,lat:-33.34}})')
  page.evaluate('window.__testMap._emit("click",{lngLat:{lng:-70.18,lat:-33.55}})')
  assert page.locator('#routeCalculate').is_enabled()
  page.locator('#routeCalculate').click()
  page.wait_for_function('document.getElementById("routeSummary").textContent.includes("18 km")')
  assert page.evaluate('window.__testMap.getSource("mapp-route").data.geometry.coordinates.length')==3
  # no road request when manual route mode
  page.locator('#modeManual').click()
  assert page.locator('#routeCalculate').is_hidden()
  page.evaluate('window.__testMap._emit("click",{lngLat:{lng:-70.3,lat:-33.3}})')
  page.evaluate('window.__testMap._emit("click",{lngLat:{lng:-70.1,lat:-33.4}})')
  assert 'Trazado libre' in page.locator('#routeSummary').inner_text()
  page.locator('#routeUndo').click()
  assert page.evaluate('window.__testMap.getSource("mapp-route").data.geometry.coordinates.length')==0
  page.locator('#modeAutomatic').click()
  page.locator('#searchInput').fill('Embalse del Yeso')
  page.locator('#searchSubmit').click()
  page.wait_for_function('document.getElementById("searchResults").textContent.includes("Embalse El Yeso")')
  page.locator('.searchRow button.routeTarget').click()
  assert page.evaluate('window.__testMap.getSource("mapp-route-points").data.features.length')==1
  page.screenshot(path=str(ROOT/'tests/mobile_mock.png'),full_page=True)
  assert not errors,errors
  print('CHROMIUM MOCK: style, art, auto route, manual route, undo, Photon destination OK')
  browser.close()
if __name__=='__main__':main()