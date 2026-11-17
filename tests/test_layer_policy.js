'use strict';
const assert=require('node:assert/strict');
const policy=require('../assets/layer-policy.js');
function mapFixture(){
 const ids=['background','water','mapp-water-wash','mapp-water-lift','mapp-water-edge','mapp-water-pastel',
  'road_service_track','bridge_service_track','tunnel_service_track',
  'road_path_pedestrian','bridge_path_pedestrian','tunnel_path_pedestrian',
  'road_minor','road_motorway','road_major_rail','boundary_2','boundary_3',
  'poi_r1','park_outline','landuse_pitch','road_one_way_arrow'];
 const l=ids.map(id=>({
   id,type:id==='background'?'background':/water-edge|water-pastel|road_|bridge_|tunnel_|boundary_|park_outline/.test(id)?'line':'fill',
   source:id==='background'?undefined:'openmaptiles',
   'source-layer':id.startsWith('mapp-water')||id==='water'?'water':id.startsWith('boundary')?'boundary':'transportation',
   filter:id==='water'?['!=',['get','brunnel'],'tunnel']:id.includes('service_track')?['==',['get','brunnel'],id.startsWith('bridge')?'bridge':id.startsWith('tunnel')?'tunnel':'none']:undefined,
   minzoom:id.includes('path_pedestrian')?14:0,maxzoom:24,
   layout:{visibility:'visible'},
   paint:{'fill-opacity':.42,'line-opacity':.8}
 }));
 // Make the aquatic layers reflect true type.
 for(const l0 of l)if(l0.id==='water'||l0.id==='mapp-water-wash'||l0.id==='mapp-water-lift')l0.type='fill';
 for(const l0 of l)if(l0.id==='mapp-water-edge'||l0.id==='mapp-water-pastel')l0.type='line';
 const o={sources:{openmaptiles:{type:'vector',url:'https://example.com'}} ,layers:l};
 const map={
  style:o,
  getStyle(){return this.style},getSource(id){return this.style.sources[id]},
  getLayer(id){return this.style.layers.find(l=>l.id===id)},
  setFilter(id,v){const layer=this.getLayer(id);if(v===undefined||v===null)delete layer.filter;else layer.filter=v},
  setLayoutProperty(id,k,v){const l=this.getLayer(id);l.layout??={};if(v===undefined)delete l.layout[k];else l.layout[k]=v},
  setPaintProperty(id,k,v){const l=this.getLayer(id);l.paint??={};if(v===undefined)delete l.paint[k];else l.paint[k]=v},
  setLayerZoomRange(id,a,b){const l=this.getLayer(id);l.minzoom=a;l.maxzoom=b},
  addLayer(layer,before){const idx=this.style.layers.findIndex(l=>l.id===before);if(idx<0)this.style.layers.push(layer);else this.style.layers.splice(idx,0,layer)},
  removeLayer(id){this.style.layers=this.style.layers.filter(l=>l.id!==id)},
  querySourceFeatures(src,opt){return opt.sourceLayer==='boundary'?[{properties:{admin_level:8}}]:[]}
 };
 return map;
}
const m=mapFixture(),before=JSON.stringify(m.getStyle());
assert.equal(policy.validatePolicyAgainstStyle(m.getStyle()).compatible,true);
const summary=policy.applyPolicy(m);
assert(summary.applied);
assert(m.getLayer('mapp-commune-boundary'));
assert.equal(m.getLayer('mapp-commune-boundary').minzoom,11);
assert.equal(m.getLayer('mapp-commune-boundary').paint['line-opacity'],.38);
assert.equal(policy.inspectCommuneCoverage(m).status,'observed-in-loaded-tiles');
for(const id of policy.WATER_IDS){
 const l=m.getLayer(id);
 assert(JSON.stringify(l.filter).includes('swimming_pool'),id+' pool exclusion');
 const expr=l.paint[l.type==='line'?'line-opacity':'fill-opacity'];
 assert.equal(expr[0],'step');assert.equal(expr[2][0],'case');assert.equal(expr[3],14);
}
for(const id of policy.PATH_PEDESTRIAN){
 assert(JSON.stringify(m.getLayer(id).filter).includes('"path"'));
 assert(!JSON.stringify(m.getLayer(id).filter).includes('"pedestrian"'));
 assert.equal(m.getLayer(id).minzoom,12);
}
for(const id of policy.SERVICE_TRACK){
 assert.equal(m.getLayer(id).minzoom,11);
 assert.equal(m.getLayer('mapp-policy-service-'+id).minzoom,15);
 assert(JSON.stringify(m.getLayer(id).filter).includes('"track"'));
 assert(JSON.stringify(m.getLayer('mapp-policy-service-'+id).filter).includes('"service"'));
}
assert.equal(m.getLayer('road_minor').minzoom,14);
assert.equal(m.getLayer('road_one_way_arrow').minzoom,17);
assert.equal(m.getLayer('landuse_pitch').layout.visibility,'none');
assert.equal(m.getLayer('road_major_rail').layout.visibility,'none');
assert.equal(policy.verifyPolicy(m).ok,true,policy.verifyPolicy(m).issues.join(','));
const after=JSON.stringify(m.getStyle());
policy.applyPolicy(m);assert.equal(JSON.stringify(m.getStyle()),after,'idempotence');
assert(policy.restorePolicy(m));
assert.equal(JSON.stringify(m.getStyle()),before,'round-trip rollback');
assert.equal(policy.getPolicySummary(m).applied,false);
policy.applyPolicy(m);assert(policy.verifyPolicy(m).ok);
console.log('MAP-0012 D1 policy: pools, pond LOD, rural routes, pedestrian exclusion, communes, rollback and idempotence OK');
