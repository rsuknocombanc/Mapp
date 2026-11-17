/* Mapp v0.5 · georeferenced illustrated forest over pigment-rich flat atlas.
 * MAP-0004/5/6/7. No DEM, extrusions, tracking, implicit routing or forest wallpaper.
 */
'use strict';
const START=[-70.323,-33.348]; // punto de demostración, NO posición GPS del usuario
const $=id=>document.getElementById(id);
// Restrained but saturated palette from the user's hand-painted atlas reference.
// Separate pigment, edge and lightwash colors produce layered pastel strokes, not tiled images.
const THEMES={
 acuarela:{paper:'#ECE3CE',wood:'#70835A',woodInk:'#526B49',woodLight:'#9EA984',grass:'#A8B58E',park:'#B4C19B',water:'#5F7E80',waterEdge:'#45666A',waterLight:'#91ACAA',road:'#8A715E',primary:'#846754',minor:'#A99A80',labels:'#564936',halo:'#F1E7D2',lines:'#8F826D'},
 bosque:{paper:'#E8DFC9',wood:'#596E4D',woodInk:'#45583E',woodLight:'#90A078',grass:'#98AC7C',park:'#A4B78F',water:'#547479',waterEdge:'#385D64',waterLight:'#85A2A5',road:'#856C56',primary:'#795F49',minor:'#A0957A',labels:'#48523E',halo:'#EEE4D0',lines:'#8D8069'},
 tinta:{paper:'#EEE5D3',wood:'#76826C',woodInk:'#565F50',woodLight:'#9BA78D',grass:'#AFBA9D',park:'#B7C1A8',water:'#657D7F',waterEdge:'#4C6668',waterLight:'#A4B5B0',road:'#8D7865',primary:'#766250',minor:'#A39A86',labels:'#565046',halo:'#F3E9D8',lines:'#9B907E'}
};
let map,carMarker,searchMarker,selected='acuarela',panel='style',baseReady=false;
let illustratedForest=null; // MAP-0007: georeferenced illustration module
let searchTimer=null,searchRequest=null,searchSeq=0;
const searchCache=new Map();
let routeMode='auto',routePoints=[],routeGeometry=[],routeSummary='',routeRequest=null,routeSeq=0,addingStop=false,routeAutoCalculated=false;
const emptyLine=()=>({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[]}});
const pointFeatures=()=>({type:'FeatureCollection',features:routePoints.map((p,i)=>({type:'Feature',properties:{label:i===0?'A':i===routePoints.length-1?'B':String(i)},geometry:{type:'Point',coordinates:p}}))});
function msg(text,ok=false){$('statusText').textContent=text;$('statusDot').classList.toggle('ok',ok)}
function paint(id,key,value){try{map.setPaintProperty(id,key,value)}catch(e){console.warn('Pintura opcional',id,key,e.message)}}
function layout(id,key,value){try{map.setLayoutProperty(id,key,value)}catch(e){console.warn('Capa opcional',id,key,e.message)}}
function rampZoom(min,mid,high){return ['interpolate',['linear'],['zoom'],10,min,14,mid,18,high]}
function artStyle(theme){
 selected=theme;const p=THEMES[theme];
 document.documentElement.style.setProperty('--paper',p.paper);
 document.querySelectorAll('.styleChoice').forEach(b=>{const is=b.dataset.style===theme;b.classList.toggle('active',is);b.setAttribute('aria-pressed',String(is))});
 if(!map||!map.isStyleLoaded())return;
 for(const lyr of map.getStyle().layers){
  if(lyr.id.startsWith('mapp-'))continue;
  const id=lyr.id,k=lyr.type,n=id.toLowerCase();
  if(k==='fill-extrusion'){layout(id,'visibility','none');continue}
  if(k==='raster'){layout(id,'visibility','none');continue} // remove prefabricated hillshade from base style
  if(k==='hillshade'||k==='color-relief'){layout(id,'visibility','none');continue}
  if(k==='background'){paint(id,'background-color',p.paper);continue}
  if(k==='fill'){
    let color=p.paper,opacity=.03;
    if(/water|lake|ocean|river|wetland/.test(n)){color=p.water;opacity=.97}
    else if(/wood|forest|tree/.test(n)){color=p.wood;opacity=.65}
    else if(/landcover/.test(n)){
      // Landcover may be one mixed class layer; preserve actual geography.
      color=['match',['get','class'],'wood',p.wood,'forest',p.wood,'grass',p.grass,'scrub',p.grass,p.paper];
      opacity=['match',['get','class'],'wood',.68,'forest',.68,'grass',.28,'scrub',.25,.03];
    }
    else if(/grass|scrub|meadow/.test(n)){color=p.grass;opacity=.31}
    else if(/park|landuse|protected|national/.test(n)){color=p.park;opacity=.24}
    else if(/building/.test(n)){color=p.lines;opacity=.05}
    paint(id,'fill-color',color);paint(id,'fill-opacity',opacity);
  }
  if(k==='line'){
    if(/road.+casing|road.+bridge|road.+tunnel|road.+link/.test(n)&&!/water/.test(n)){layout(id,'visibility','none');continue}
    if(/motorway|trunk|primary|secondary|tertiary|road_major/.test(n)){
      paint(id,'line-color',p.primary);paint(id,'line-opacity',.83);paint(id,'line-width',rampZoom(1.25,2,3.8));
      paint(id,'line-dasharray',[7.2,1.3,1.05,1.65,.6,2]);paint(id,'line-blur',.23);
    }else if(/road_minor|residential|service|road_path|pedestrian|road_track|footway/.test(n)){
      // Remote tracks retain visibility before city passages, but both appear on close zoom.
      const remote=/track|path|footway/.test(n);
      paint(id,'line-color',remote?p.road:p.minor);
      paint(id,'line-opacity',['interpolate',['linear'],['zoom'],remote?11:13,0,remote?12.5:14.5,remote?.62:.29,17,.57]);
      paint(id,'line-width',rampZoom(.5,1,1.9));paint(id,'line-dasharray',remote?[2.1,2.7,.6,2]:[1.2,2.3,.6,1.6]);paint(id,'line-blur',.18);
    }else if(/water|river|stream/.test(n)){
      paint(id,'line-color',p.waterEdge);paint(id,'line-opacity',.72);paint(id,'line-width',rampZoom(.75,1.6,3));
    }else if(/boundary|admin/.test(n)){
      paint(id,'line-opacity',.12);paint(id,'line-color',p.lines);
    }else if(/rail|ferry/.test(n)){
      paint(id,'line-opacity',.10);
    }else{paint(id,'line-color',p.lines);paint(id,'line-opacity',.35)}
  }
  if(k==='symbol'){
    if(/housenumber|poi_|poi-|airport|transit|bus|rail_station/.test(n)){layout(id,'visibility','none');continue}
    paint(id,'text-color',p.labels);paint(id,'text-halo-color',p.halo);paint(id,'text-halo-width',1.4);
    if(/road.*label|road.*name/.test(n))paint(id,'text-opacity',['interpolate',['linear'],['zoom'],11,0,14,.22,16,.68]);
  }
 }
 // A concentrated underpainting with restrained second wash. No periodic texture fills.
 for(const [id,color,opacity] of [
  ['mapp-forest-wash',p.wood,.53],['mapp-forest-lift',p.woodLight,.105],
  ['mapp-grass-wash',p.grass,.25],['mapp-water-wash',p.waterEdge,.34],
  ['mapp-water-lift',p.waterLight,.065]
 ]){if(map.getLayer(id)){paint(id,'fill-color',color);paint(id,'fill-opacity',opacity)}}
 for(const [id,color,width,blur,opacity] of [
  ['mapp-forest-edge',p.woodInk,5.2,3.5,.34],
  ['mapp-forest-pastel',p.woodInk,1.5,.25,.47],
  ['mapp-water-edge',p.waterEdge,4,2.3,.42],
  ['mapp-water-pastel',p.waterEdge,1.35,.18,.58],
  ['mapp-road-pastel',p.primary,1.15,.18,.32]
 ]){if(map.getLayer(id)){paint(id,'line-color',color);paint(id,'line-width',width);paint(id,'line-blur',blur);paint(id,'line-opacity',opacity)}}
 illustratedForest?.setTheme(theme);
 msg('Atlas ilustrado · árboles por cobertura · rutas disponibles',true);
}
function addArtWashes(){
 // Low-opacity, non-repeating geographical washes; no tiled tree icons or DEM.
 // Based on the exact OSM polygons, keeping water and forest coordinates correct.
 const source=map.getSource('openmaptiles')?'openmaptiles':null;if(!source)return;
 const road=map.getStyle().layers.find(l=>l.type==='line'&&/road/.test(l.id))?.id;
 const before=road||map.getStyle().layers.find(l=>l.type==='symbol')?.id;
 const woodFilter=['in',['get','class'],['literal',['wood','forest']]];
 const layers=[
  {id:'mapp-forest-wash',type:'fill',source,'source-layer':'landcover',filter:woodFilter,paint:{'fill-color':THEMES[selected].wood,'fill-opacity':.53}},
  {id:'mapp-forest-lift',type:'fill',source,'source-layer':'landcover',filter:woodFilter,paint:{'fill-color':THEMES[selected].woodLight,'fill-opacity':.105}},
  {id:'mapp-grass-wash',type:'fill',source,'source-layer':'landcover',filter:['in',['get','class'],['literal',['grass','scrub']]],paint:{'fill-color':THEMES[selected].grass,'fill-opacity':.25}},
  {id:'mapp-forest-edge',type:'line',source,'source-layer':'landcover',filter:woodFilter,paint:{'line-color':THEMES[selected].woodInk,'line-width':5.2,'line-opacity':.34,'line-blur':3.5}},
  // Dry-pastel edge: broken dark pigment on real forest boundaries; no fill-pattern wallpaper.
  {id:'mapp-forest-pastel',type:'line',source,'source-layer':'landcover',filter:woodFilter,paint:{'line-color':THEMES[selected].woodInk,'line-width':1.5,'line-opacity':.47,'line-blur':.25,'line-dasharray':[11,1.4,2.4,1.7,.9,2.3]}},
  {id:'mapp-water-wash',type:'fill',source,'source-layer':'water',paint:{'fill-color':THEMES[selected].waterEdge,'fill-opacity':.34}},
  {id:'mapp-water-lift',type:'fill',source,'source-layer':'water',paint:{'fill-color':THEMES[selected].waterLight,'fill-opacity':.065}},
  {id:'mapp-water-edge',type:'line',source,'source-layer':'water',paint:{'line-color':THEMES[selected].waterEdge,'line-width':4,'line-opacity':.42,'line-blur':2.3}},
  {id:'mapp-water-pastel',type:'line',source,'source-layer':'water',paint:{'line-color':THEMES[selected].waterEdge,'line-width':1.35,'line-opacity':.58,'line-blur':.18,'line-dasharray':[9.6,1.2,1.9,1.9,.7,2.6]}}
 ];
 for(const layer of layers){try{if(!map.getLayer(layer.id))map.addLayer(layer,before)}catch(e){console.warn('Acuarela opcional',layer.id,e.message)}}
 // Retain the line's native source/filter. The light broken overprint creates pencil grain.
 const major=map.getStyle().layers.find(l=>l.type==='line'&&!l.id.startsWith('mapp-')&&/road.*major|motorway|trunk|primary|secondary/.test(l.id.toLowerCase())&&l.source&&l['source-layer']);
 if(major&&!map.getLayer('mapp-road-pastel')){
  try{map.addLayer({id:'mapp-road-pastel',type:'line',source:major.source,'source-layer':major['source-layer'],...(major.filter?{filter:major.filter}:{}),minzoom:major.minzoom||0,maxzoom:major.maxzoom||24,paint:{'line-color':THEMES[selected].primary,'line-width':1.15,'line-opacity':.32,'line-blur':.18,'line-offset':.55,'line-dasharray':[1.3,1.5,.45,2.4,2.1,1.8]}},before)}catch(e){console.warn('Pastel vial opcional',e.message)}
 }

}
function addRouteLayers(){
 map.addSource('mapp-route',{type:'geojson',data:emptyLine()});
 map.addSource('mapp-route-points',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 map.addLayer({id:'mapp-route-halo',type:'line',source:'mapp-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#f7edd7','line-width':['interpolate',['linear'],['zoom'],8,6,14,9,18,13],'line-opacity':.96}});
 map.addLayer({id:'mapp-route-dashed',type:'line',source:'mapp-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#8B4238','line-width':['interpolate',['linear'],['zoom'],8,3,14,4.8,18,7],'line-dasharray':[2.7,1.4],'line-opacity':1}});
 // Very subtle carbon pencil flecks, never replacing the clear high-priority route.
 map.addLayer({id:'mapp-route-pastel',type:'line',source:'mapp-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#683B32','line-width':['interpolate',['linear'],['zoom'],8,.85,14,1.35,18,2],'line-offset':.35,'line-dasharray':[.6,1.4,2.5,1.9],'line-opacity':.45}});
 map.addLayer({id:'mapp-route-points-circles',type:'circle',source:'mapp-route-points',paint:{'circle-radius':7,'circle-color':'#a34a3c','circle-stroke-color':'#f7ecce','circle-stroke-width':2}});
 map.addLayer({id:'mapp-route-points-label',type:'symbol',source:'mapp-route-points',layout:{'text-field':['get','label'],'text-size':10,'text-font':['Open Sans Bold'],'text-allow-overlap':true},paint:{'text-color':'#fff6e8'}});
}
const vehicle=`<div class="car" id="vehicle"><svg viewBox="0 0 58 86" xmlns="http://www.w3.org/2000/svg"><g stroke="#202520" stroke-linejoin="round"><rect x="8" y="5" width="42" height="76" rx="10" fill="#333a2f" stroke-width="2"/><rect x="4" y="14" width="8" height="18" rx="3" fill="#171c19" stroke-width="2"/><rect x="46" y="14" width="8" height="18" rx="3" fill="#171c19" stroke-width="2"/><rect x="4" y="53" width="8" height="18" rx="3" fill="#171c19" stroke-width="2"/><rect x="46" y="53" width="8" height="18" rx="3" fill="#171c19" stroke-width="2"/><rect x="10" y="5" width="38" height="75" rx="8" fill="#b85d27" stroke-width="1.7"/><path d="M13 19L45 19L42 32L16 32Z" fill="#627b7b" stroke-width="1.3"/><path d="M15 56L43 56L44 68L14 68Z" fill="#5b7170" stroke-width="1.3"/><path d="M14 34H44V53H14Z" fill="#a54c21" stroke-width="1.3"/><path d="M19 36V51M39 36V51M15 42H43" stroke="#44392b" stroke-width="1.4"/><rect x="14" y="9" width="30" height="6" rx="2" fill="#d48a43" stroke-width="1"/><path d="M14 73H44" stroke="#3d3026" stroke-width="3"/><circle cx="29" cy="75" r="8.2" fill="#1b2423" stroke-width="2"/><circle cx="29" cy="75" r="4" fill="#686c63" stroke-width="1"/></g><path d="M29 0L23 8H35Z" fill="#f4e5bf" stroke="#492f1c" stroke-width="1"/></svg></div>`;
async function start(){
 if(typeof maplibregl==='undefined'){msg('No se pudo cargar el motor del mapa. Comprueba tu conexión.');return}
 try{
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:START,zoom:12.3,bearing:0,pitch:0,maxPitch:0,dragRotate:false,touchPitch:false,attributionControl:false,renderWorldCopies:false});
  map.touchZoomRotate?.disableRotation();
  const el=document.createElement('div');el.innerHTML=vehicle;
  carMarker=new maplibregl.Marker({element:el,anchor:'center',rotationAlignment:'map'}).setLngLat(START).addTo(map);
  map.on('load',()=>{
    baseReady=true;artStyle(selected);addArtWashes();
    illustratedForest=window.MappForest?.install(map,{theme:selected,maxDesktop:260,maxMobile:130})||null;
    addRouteLayers();refreshRoute();
    const att=document.createElement('div');att.className='attribution';att.textContent='© OpenStreetMap contributors · OpenFreeMap';att.style.cssText='position:absolute;bottom:0;left:0;z-index:3;background:#f2e9d4db;color:#84755d;font:9px system-ui;padding:3px 6px';$('map').append(att);
    msg(illustratedForest?.enabled?'Mapa listo · árboles ilustrados activos':'Mapa listo · capa de árboles no disponible',true);
  });
  map.on('click',e=>{if(panel!=='route'||!baseReady)return;addWaypoint([e.lngLat.lng,e.lngLat.lat])});
  map.on('error',e=>{if(!baseReady)msg('El mapa está tardando en cargar. Revisa conexión.');console.warn('MapLibre',e.error?.message||e)});
  setTimeout(()=>{if(!baseReady)msg('La cartografía no terminó de cargar. Revisa tu conexión.')},20000);
 }catch(err){msg('No se pudo iniciar el mapa: '+err.message)}
}
function setPanel(next){
 panel=next;
 $('stylePane').hidden=next!=='style';$('routePane').hidden=next!=='route';
 for(const [name,button] of [['style','tabStyle'],['route','tabRoute']]){$(button).classList.toggle('active',name===next);$(button).setAttribute('aria-selected',String(name===next))}
 $('routeLegend').hidden=routeGeometry.length===0;
 if(map){map.getCanvas().style.cursor=next==='route'?'crosshair':'';setTimeout(()=>map.resize(),0)}
}
function updateActions(){
 const n=routePoints.length;
 $('routeUndo').disabled=!n;$('routeClear').disabled=!n;
 $('routeCalculate').disabled=routeMode!=='auto'||n<2||!!routeRequest;
 $('routeCalculate').hidden=routeMode!=='auto';$('routeFromGps').hidden=routeMode!=='auto';$('routeAddStop').hidden=routeMode!=='auto';
 $('routeAddStop').disabled=n<2||n>=8;$('routeAddStop').classList.toggle('active',addingStop);
 $('routeHelp').textContent=routeMode==='auto'
   ? n===0?'Toca el mapa para marcar A (origen) y B (destino).':n===1?'Ahora toca B, tu destino.':addingStop?'Toca el mapa para colocar una parada intermedia.':'Toca Calcular para seguir caminos. Puedes añadir paradas.'
   :n===0?'Toca el mapa para dibujar una huella libre, punto por punto.':'Sigue tocando el mapa para extender el trazado sin ajustarlo a calles.';
 $('routeSummary').textContent=routeSummary||(n?`${n} punto${n===1?'':'s'} seleccionado${n===1?'':'s'}`:'Sin ruta seleccionada.');
}
function haversine(a,b){const R=6371,rad=Math.PI/180,dLat=(b[1]-a[1])*rad,dLon=(b[0]-a[0])*rad;const h=Math.sin(dLat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(h)))}
function lengthKm(points){let d=0;for(let i=1;i<points.length;i++)d+=haversine(points[i-1],points[i]);return d}
const fmtKm=km=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(km);
function refreshRoute(){
 if(routeMode==='manual'){routeGeometry=[...routePoints];if(routeGeometry.length>1)routeSummary=`Trazado libre · ${fmtKm(lengthKm(routeGeometry))} km aprox. (segmentos rectos)`;else routeSummary='';}
 if(routeMode==='auto'&&!routeAutoCalculated)routeGeometry=[...routePoints];
 if(map?.getSource('mapp-route'))map.getSource('mapp-route').setData(routeGeometry.length>=2?{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:routeGeometry}}:emptyLine());
 if(map?.getSource('mapp-route-points'))map.getSource('mapp-route-points').setData(pointFeatures());
 $('routeLegend').hidden=routeGeometry.length<2;updateActions();
}
function abortRoute(){routeSeq++;if(routeRequest){routeRequest.abort();routeRequest=null}}
function addWaypoint(p){
 if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))return;
 if(routeMode==='manual'){
  if(routePoints.length>=40){msg('Máximo 40 puntos por trazado.');return}
  routePoints.push(p);
 }else if(routePoints.length<2){routePoints.push(p)}else if(addingStop){
  if(routePoints.length>=8){msg('Máximo 8 puntos por ruta automática.');return}
  routePoints.splice(routePoints.length-1,0,p);addingStop=false;
 }else{routePoints[routePoints.length-1]=p}
 abortRoute();routeAutoCalculated=false;routeSummary='';refreshRoute();
}
function clearRoute(){abortRoute();addingStop=false;routePoints=[];routeGeometry=[];routeAutoCalculated=false;routeSummary='';refreshRoute();msg('Ruta borrada',true)}
function modeRoute(next){clearRoute();routeMode=next;for(const [id,name] of [['modeAutomatic','auto'],['modeManual','manual']]){$(id).classList.toggle('active',name===next);$(id).setAttribute('aria-pressed',String(name===next))}refreshRoute()}
async function autoRoute(){
 if(routeMode!=='auto'||routePoints.length<2||routeRequest)return;
 // Sends only points explicitly selected by the user to the public demo router.
 const seq=++routeSeq,controller=new AbortController();routeRequest=controller;updateActions();
 routeSummary='Calculando ruta por caminos registrados…';updateActions();
 const timeout=setTimeout(()=>controller.abort(),16000);
 try{
  const pts=routePoints.map(([lon,lat])=>`${lon.toFixed(6)},${lat.toFixed(6)}`).join(';');
  const url=`https://router.project-osrm.org/route/v1/driving/${pts}?overview=full&geometries=geojson&steps=false`;
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const result=await response.json();if(seq!==routeSeq)return;
  const best=result.routes?.[0],coords=best?.geometry?.coordinates;
  if(result.code!=='Ok'||!Array.isArray(coords)||coords.length<2)throw new Error('No se encontró una ruta vial conectada');
  routeGeometry=coords;routeAutoCalculated=true;
  const km=best.distance/1000,min=Math.round(best.duration/60);
  routeSummary=`Por caminos · ${fmtKm(km)} km · ${min} min estimados (tráfico no incluido)`;
  if(map?.getSource('mapp-route'))map.getSource('mapp-route').setData({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:routeGeometry}});
  const bounds=new maplibregl.LngLatBounds();routeGeometry.forEach(pt=>bounds.extend(pt));map.fitBounds(bounds,{padding:65,maxZoom:15,duration:700});
  msg('Ruta vial calculada · verifica accesos reales',true);
 }catch(e){if(seq===routeSeq){routeAutoCalculated=false;routeGeometry=[...routePoints];routeSummary=e.name==='AbortError'?'Servicio de rutas sin respuesta. Reintenta.':'No se pudo calcular: '+e.message;refreshRoute();msg('Ruta automática no disponible. Puedes usar trazado libre.')}}
 finally{clearTimeout(timeout);if(seq===routeSeq){routeRequest=null;updateActions()}}
}
function requestGPS(callback){
 if(!navigator.geolocation){msg('GPS no disponible en este navegador');return}
 msg('Solicitando acceso a ubicación…');
 navigator.geolocation.getCurrentPosition(position=>{
  const pos=[position.coords.longitude,position.coords.latitude];
  if(carMarker)carMarker.setLngLat(pos);
  $('mapAreaLabel').textContent='✦ MI UBICACIÓN · GPS';
  if(typeof callback==='function')callback(pos);else map?.flyTo({center:pos,zoom:15});
  msg('GPS actualizado · precisión ±'+Math.round(position.coords.accuracy)+' m',true);
 },e=>msg('GPS no disponible: '+e.message),{enableHighAccuracy:true,timeout:16000,maximumAge:0});
}
// Photon search: lightweight autocomplete, only on explicit user text.
const searchInput=$('searchInput'),searchResults=$('searchResults');
function searchShow(open){searchResults.classList.toggle('open',open);searchInput.setAttribute('aria-expanded',String(open))}
function searchMessage(s){searchResults.replaceChildren();const d=document.createElement('div');d.className='searchInfo';d.textContent=s;searchResults.append(d);searchShow(true)}
function searchReset(){clearTimeout(searchTimer);searchSeq++;searchRequest?.abort();searchRequest=null;searchResults.replaceChildren();searchShow(false)}
function formatPlace(f){const a=f.properties||{};const title=a.name||a.street||a.city||a.county||'Lugar sin nombre';const where=[a.city&&a.city!==title?a.city:null,a.state,a.country].filter(Boolean).join(' · ');return {title,where}}
function showResults(list){searchResults.replaceChildren();if(!list.length){searchMessage('Sin resultados. Prueba otro nombre.');return}
 for(const f of list){const pt=f.geometry?.coordinates;if(!Array.isArray(pt)||pt.length<2||!pt.slice(0,2).every(Number.isFinite))continue;
  const {title,where}=formatPlace(f),row=document.createElement('div');row.className='searchRow';
  const pick=document.createElement('button');pick.className='searchRow';pick.type='button';pick.textContent=title;const sub=document.createElement('small');sub.textContent=where||'Lugar cartográfico';pick.append(sub);
  pick.onclick=()=>{
    if(searchMarker)searchMarker.remove();const el=document.createElement('div');el.style.cssText='width:15px;height:15px;background:#9d4639;border:3px solid #fff1d7;border-radius:50%;box-shadow:0 0 0 2px #8e5a42';
    searchMarker=new maplibregl.Marker({element:el}).setLngLat(pt).addTo(map);
    map.flyTo({center:pt,zoom:Math.max(map.getZoom(),13)});searchInput.value=title;searchShow(false);msg('Lugar encontrado · '+title,true);
  };row.append(pick);
  if(panel==='route'&&routeMode==='auto'){
    const action=document.createElement('button');action.type='button';action.className='routeTarget';action.textContent='Usar como '+(routePoints.length?'destino B':'origen A');
    action.onclick=()=>{addWaypoint([pt[0],pt[1]]);searchShow(false);searchInput.value=title;map.flyTo({center:pt,zoom:Math.max(map.getZoom(),12.5)});msg('Punto de ruta añadido',true)};row.append(action);
  }
  searchResults.append(row);
 }searchShow(!!searchResults.children.length);
}
async function searchPlaces(){const term=searchInput.value.trim();if(term.length<3){searchReset();return}
 const id=++searchSeq;searchRequest?.abort();searchRequest=new AbortController();
 const key=term.toLocaleLowerCase('es');if(searchCache.has(key)){showResults(searchCache.get(key));return}
 searchMessage('Buscando lugares…');
 try{const center=map?.getCenter?.()||{lat:START[1],lng:START[0]};const qs=new URLSearchParams({q:term,limit:'5',lang:'es',lat:String(center.lat),lon:String(center.lng)});
  const r=await fetch('https://photon.komoot.io/api/?'+qs,{signal:searchRequest.signal,headers:{Accept:'application/json'}});if(!r.ok)throw Error(String(r.status));const json=await r.json();if(id!==searchSeq)return;
  const list=Array.isArray(json.features)?json.features:[];searchCache.set(key,list);if(searchCache.size>20)searchCache.delete(searchCache.keys().next().value);showResults(list);
 }catch(e){if(e.name!=='AbortError'&&id===searchSeq)searchMessage('El buscador no responde. Reintenta.')}finally{if(id===searchSeq)searchRequest=null}
}
$('tabStyle').addEventListener('click',()=>setPanel('style'));$('tabRoute').addEventListener('click',()=>setPanel('route'));
document.querySelectorAll('.styleChoice').forEach(b=>b.addEventListener('click',()=>artStyle(b.dataset.style)));
$('modeAutomatic').onclick=()=>modeRoute('auto');$('modeManual').onclick=()=>modeRoute('manual');
$('routeCalculate').onclick=autoRoute;$('routeClear').onclick=clearRoute;
$('routeUndo').onclick=()=>{if(!routePoints.length)return;abortRoute();routePoints.pop();addingStop=false;routeAutoCalculated=false;routeSummary='';refreshRoute()};
$('routeAddStop').onclick=()=>{if(routePoints.length>=2&&routePoints.length<8){addingStop=!addingStop;updateActions()}};
$('routeFromGps').onclick=()=>requestGPS(p=>{abortRoute();routePoints[0]=p;routeAutoCalculated=false;routeSummary='';refreshRoute()});
$('zoomIn').onclick=()=>map?.zoomIn();$('zoomOut').onclick=()=>map?.zoomOut();$('compass').onclick=()=>map?.easeTo({bearing:0,pitch:0});$('locate').onclick=()=>requestGPS();
searchInput.addEventListener('input',()=>{clearTimeout(searchTimer);searchSeq++;searchRequest?.abort();searchRequest=null;if(searchInput.value.trim().length<3){searchShow(false);return}searchTimer=setTimeout(searchPlaces,750)});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();clearTimeout(searchTimer);searchPlaces();searchInput.blur()});
$('searchClear').onclick=()=>{searchInput.value='';searchReset();searchInput.focus()};
searchInput.addEventListener('keydown',e=>{if(e.key==='Escape'){searchReset();searchInput.blur()}});
document.addEventListener('pointerdown',e=>{if(!$('searchShell').contains(e.target))searchShow(false)});
setPanel('style');updateActions();start();