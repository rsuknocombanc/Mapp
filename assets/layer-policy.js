/* MAP-0012 (D1 approved): visibility decisions only; never mutate OSM/OSRM data.
 * Adapt Liberty after artwork is applied. Rendered boundaries depend on vector tile coverage.
 */
(function(root){
'use strict';
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const state=new WeakMap();
const SOURCE='openmaptiles',COMMUNE='mapp-commune-boundary';
const WATER_IDS=['water','mapp-water-wash','mapp-water-lift','mapp-water-edge','mapp-water-pastel'];
const HIDE_IDS=[
 'park_outline',
 'landuse_residential','landuse_pitch','landuse_track','landuse_cemetery','landuse_hospital','landuse_school',
 'aeroway_fill','aeroway_runway','aeroway_taxiway','airport',
 'building','building-3d','boundary_3',
 'poi_r20','poi_r7','poi_r1','poi_transit',
 'road_area_pattern',
 'tunnel_motorway_link_casing','tunnel_service_track_casing','tunnel_link_casing','tunnel_street_casing',
 'tunnel_secondary_tertiary_casing','tunnel_trunk_primary_casing','tunnel_motorway_casing',
 'road_motorway_link_casing','road_service_track_casing','road_link_casing','road_minor_casing',
 'road_secondary_tertiary_casing','road_trunk_primary_casing','road_motorway_casing',
 'bridge_motorway_link_casing','bridge_service_track_casing','bridge_link_casing','bridge_street_casing',
 'bridge_path_pedestrian_casing','bridge_secondary_tertiary_casing','bridge_trunk_primary_casing','bridge_motorway_casing',
 'road_major_rail','road_major_rail_hatching','road_transit_rail','road_transit_rail_hatching',
 'tunnel_major_rail','tunnel_major_rail_hatching','tunnel_transit_rail','tunnel_transit_rail_hatching',
 'bridge_major_rail','bridge_major_rail_hatching','bridge_transit_rail','bridge_transit_rail_hatching',
 'waterway_tunnel'
];
const MIN_ZOOMS={
 waterway_other:12,waterway_line_label:12,
 road_minor:14,tunnel_minor:14,bridge_street:14,
 road_motorway_link:13,road_link:13,tunnel_motorway_link:13,tunnel_link:13,
 bridge_motorway_link:13,bridge_link:13,
 'highway-name-minor':15,'highway-name-path':16,
 road_one_way_arrow:17,road_one_way_arrow_opposite:17
};
const SERVICE_TRACK=['road_service_track','bridge_service_track','tunnel_service_track'];
const PATH_PEDESTRIAN=['road_path_pedestrian','bridge_path_pedestrian','tunnel_path_pedestrian'];
const ROAD_CLASSES=Object.freeze({track:11,service:15,path:12});
function getLayer(map,id){return map.getLayer?.(id)||null;}
function save(map,st,id){
 if(st.original.has(id))return;
 const layer=getLayer(map,id);
 if(!layer){st.missing.add(id);return;}
 st.original.set(id,{
  filter:clone(layer.filter),minzoom:layer.minzoom??0,maxzoom:layer.maxzoom??24,
  visibility:layer.layout?.visibility,
  fillOpacity:clone(layer.paint?.['fill-opacity']),lineOpacity:clone(layer.paint?.['line-opacity'])
 });
}
function appendFilter(map,st,id,condition){
 if(!getLayer(map,id))return false;
 save(map,st,id);
 const original=st.original.get(id).filter;
 map.setFilter(id,original?['all',clone(original),clone(condition)]:clone(condition));
 st.updated.add(id);return true;
}
function hide(map,st,id){
 const l=getLayer(map,id);if(!l){st.missing.add(id);return;}
 save(map,st,id);map.setLayoutProperty(id,'visibility','none');st.updated.add(id);
}
function range(map,st,id,min){
 const l=getLayer(map,id);if(!l){st.missing.add(id);return;}
 save(map,st,id);
 const max=st.original.get(id).maxzoom;
 if(min>=max){st.warnings.push('No compatible zoom range for '+id);return;}
 map.setLayerZoomRange(id,min,max);st.updated.add(id);
}
function paintWater(map,st,id){
 const layer=getLayer(map,id);if(!layer){st.missing.add(id);return;}
 const isFill=layer.type==='fill',prop=isFill?'fill-opacity':'line-opacity';
 if(!isFill&&layer.type!=='line'){st.warnings.push('Unexpected water type '+id);return;}
 appendFilter(map,st,id,['!=',['get','class'],'swimming_pool']);
 const original=clone(layer.paint?.[prop])??1;
 // Camera expression must be top-level; feature-dependent branch belongs in stop output.
 const opacity=['step',['zoom'],['case',['==',['get','class'],'pond'],0,original],14,original];
 map.setPaintProperty(id,prop,opacity);
 st.updated.add(id);
}
function splitMixed(map,st,id,keptClass,secondaryClass,firstZoom,secondZoom){
 const layer=getLayer(map,id);if(!layer){st.missing.add(id);return;}
 save(map,st,id);const original=st.original.get(id).filter;
 const match=k=>original?['all',clone(original),['==',['get','class'],k]]:['==',['get','class'],k];
 // Preserve provider filters (including bridge/tunnel) and all original paints.
 const derived=clone(layer),derivedId='mapp-policy-'+secondaryClass+'-'+id;
 if(!getLayer(map,derivedId)){
  derived.id=derivedId;derived.filter=match(secondaryClass);
  derived.minzoom=secondZoom;delete derived.maxzoom;
  if(st.original.get(id).maxzoom!==24)derived.maxzoom=st.original.get(id).maxzoom;
  const layers=map.getStyle().layers;
  const index=layers.findIndex(l=>l.id===id);
  const before=index>=0?layers[index+1]?.id:undefined;
  map.addLayer(derived,before);st.added.push(derivedId);
 }
 map.setFilter(id,match(keptClass));range(map,st,id,firstZoom);
 st.updated.add(id);
}
function addCommunes(map,st){
 if(!map.getSource?.(SOURCE)){st.warnings.push('OpenMapTiles source missing: communal boundary not installed');return;}
 if(getLayer(map,COMMUNE))return;
 const layers=map.getStyle().layers;
 const before=layers.find(x=>x.type==='line'&&x.source===SOURCE&&x['source-layer']==='transportation')?.id
           ||layers.find(x=>x.type==='symbol'&&!x.id.startsWith('mapp-'))?.id;
 map.addLayer({id:COMMUNE,type:'line',source:SOURCE,'source-layer':'boundary',minzoom:11,
  filter:['all',['==',['get','admin_level'],8],['!=',['get','maritime'],1],
   ['!=',['get','disputed'],1],['!', ['has','claimed_by']]],
  layout:{'line-join':'round'},
  paint:{'line-color':'#806349','line-opacity':.38,'line-width':1,'line-dasharray':[2,3],'line-blur':.2}
 },before);st.added.push(COMMUNE);
}
function applyPolicy(map){
 if(!map?.getStyle||!map.getLayer||!map.setFilter||!map.setLayerZoomRange)throw Error('MapLibre API insufficient');
 const previous=state.get(map);
 if(previous&&getLayer(map,COMMUNE))return getPolicySummary(map);
 const st={original:new Map(),updated:new Set(),added:[],missing:new Set(),warnings:[]};
 state.set(map,st);
 for(const id of HIDE_IDS)hide(map,st,id);
 for(const [id,min] of Object.entries(MIN_ZOOMS))range(map,st,id,min);
 for(const id of WATER_IDS)paintWater(map,st,id);
 for(const id of SERVICE_TRACK)splitMixed(map,st,id,'track','service',11,15);
 for(const id of PATH_PEDESTRIAN){
  appendFilter(map,st,id,['==',['get','class'],'path']);
  range(map,st,id,12);
 }
 addCommunes(map,st);
 return getPolicySummary(map);
}
function inspectCommuneCoverage(map){
 if(!map.querySourceFeatures)return {status:'not-observed',reason:'source inspection unavailable'};
 try{
  const features=map.querySourceFeatures(SOURCE,{sourceLayer:'boundary'})||[];
  const n=features.filter(x=>Number(x?.properties?.admin_level)===8).length;
  return {status:n?'observed-in-loaded-tiles':'not-observed-in-current-tiles',
   boundaryFeatures:features.length,communalFeatures:n};
 }catch(e){return {status:'not-observed',reason:'boundary source unavailable'};}
}
function getPolicySummary(map){
 const st=state.get(map);
 if(!st)return {applied:false};
 return {applied:true,updated:st.updated.size,added:st.added.slice(),
   missing:[...st.missing],warnings:st.warnings.slice(),
   communeLayerExists:!!getLayer(map,COMMUNE),coverage:inspectCommuneCoverage(map)};
}
function verifyPolicy(map){
 const s=getPolicySummary(map),issues=[];
 if(!s.applied)return {ok:false,issues:['Policy not applied'],summary:s};
 for(const id of WATER_IDS){
  const l=getLayer(map,id);if(!l){issues.push('Missing '+id);continue;}
  if(!JSON.stringify(l.filter).includes('swimming_pool'))issues.push('Pool filter missing in '+id);
  const prop=l.type==='fill'?'fill-opacity':'line-opacity';
  if(l.paint?.[prop]?.[0]!=='step')issues.push('Pond zoom step missing in '+id);
 }
 for(const id of PATH_PEDESTRIAN){
  const l=getLayer(map,id);if(l&&!JSON.stringify(l.filter).includes('"path"'))issues.push('Path split missing '+id);
 }
 if(!s.communeLayerExists)issues.push('Commune layer unavailable');
 return {ok:!issues.length,issues,summary:s};
}
function restorePolicy(map){
 const st=state.get(map);if(!st)return false;
 for(const id of st.added.slice().reverse()){if(getLayer(map,id))map.removeLayer(id);}
 for(const [id,old] of st.original){
  if(!getLayer(map,id))continue;
  map.setFilter(id,old.filter===undefined?undefined:clone(old.filter));
  map.setLayerZoomRange(id,old.minzoom,old.maxzoom);
  map.setLayoutProperty(id,'visibility',old.visibility);
  map.setPaintProperty(id,'fill-opacity',clone(old.fillOpacity));
  map.setPaintProperty(id,'line-opacity',clone(old.lineOpacity));
 }
 state.delete(map);return true;
}
function validatePolicyAgainstStyle(style){
 const ids=new Set((style?.layers||[]).map(x=>x.id));
 const critical=['water','road_service_track','road_path_pedestrian','boundary_2'];
 return {compatible:critical.every(x=>ids.has(x)),missingCritical:critical.filter(x=>!ids.has(x)),
  detectedLayers:ids.size,hasOpenMaptiles:!!style?.sources?.[SOURCE]};
}
const api={HIDE_IDS,MIN_ZOOMS,WATER_IDS,SERVICE_TRACK,PATH_PEDESTRIAN,ROAD_CLASSES,
 applyPolicy,verifyPolicy,getPolicySummary,restorePolicy,inspectCommuneCoverage,validatePolicyAgainstStyle};
root.MappLayerPolicy=api;
if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
