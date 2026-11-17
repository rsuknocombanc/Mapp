'use strict';
// Validate all new zoom/class expressions using real MapLibre style specification.
const assert=require('node:assert/strict');
const {validateStyleMin:validateStyle}=require('@maplibre/maplibre-gl-style-spec');
const policy=require('../assets/layer-policy.js');
const sources={openmaptiles:{type:'vector',url:'https://example.com/vector.json'}};
const layer=(id,type,sourceLayer,paint,filter)=>({
 id,type,source:'openmaptiles','source-layer':sourceLayer,paint, ...(filter?{filter}:{})
});
const layers=[
 layer('water','fill','water',{'fill-color':'#265D65','fill-opacity':.97},['!=',['get','brunnel'],'tunnel']),
 layer('mapp-water-wash','fill','water',{'fill-color':'#174B54','fill-opacity':.34}),
 layer('mapp-water-lift','fill','water',{'fill-color':'#719A93','fill-opacity':.065}),
 layer('mapp-water-edge','line','water',{'line-color':'#174B54','line-opacity':.42,'line-width':4,'line-blur':2.3}),
 layer('mapp-water-pastel','line','water',{'line-color':'#174B54','line-opacity':.58,'line-width':1.35}),
 layer('road_service_track','line','transportation',{'line-color':'#9b5737','line-width':2},['match',['get','class'],['service','track'],true,false]),
 layer('bridge_service_track','line','transportation',{'line-color':'#9b5737','line-width':2},['all',['==',['get','brunnel'],'bridge'],['match',['get','class'],['service','track'],true,false]]),
 layer('tunnel_service_track','line','transportation',{'line-color':'#9b5737','line-width':2},['all',['==',['get','brunnel'],'tunnel'],['match',['get','class'],['service','track'],true,false]]),
 layer('road_path_pedestrian','line','transportation',{'line-color':'#9b5737','line-width':1},['match',['get','class'],['path','pedestrian'],true,false]),
 layer('bridge_path_pedestrian','line','transportation',{'line-color':'#9b5737','line-width':1}),
 layer('tunnel_path_pedestrian','line','transportation',{'line-color':'#9b5737','line-width':1}),
 layer('boundary_2','line','boundary',{'line-color':'#806349','line-width':1})
];
const m={style:{version:8,sources,layers},getStyle(){return this.style},getSource(id){return sources[id]},
 getLayer(id){return layers.find(l=>l.id===id)},
 setFilter(id,v){this.getLayer(id).filter=v},
 setLayoutProperty(id,k,v){this.getLayer(id).layout??={};this.getLayer(id).layout[k]=v},
 setPaintProperty(id,k,v){this.getLayer(id).paint??={};this.getLayer(id).paint[k]=v},
 setLayerZoomRange(id,a,b){this.getLayer(id).minzoom=a;this.getLayer(id).maxzoom=b},
 addLayer(l,before){const i=layers.findIndex(t=>t.id===before);i<0?layers.push(l):layers.splice(i,0,l)},
 removeLayer(id){const i=layers.findIndex(t=>t.id===id);if(i>=0)layers.splice(i,1)},
 querySourceFeatures(){return []}
};
policy.applyPolicy(m);
const checked=validateStyle(m.style);
assert.equal(checked.length,0,checked.map(e=>e.message).join('\n'));
const water=m.getLayer('water');
const bad=JSON.parse(JSON.stringify(m.style));
bad.layers.find(l=>l.id==='water').paint['fill-opacity']=['*',['get','opacity'],water.paint['fill-opacity']];
assert(validateStyle(bad).length>0,'negative zoom nesting must be rejected');
console.log('MAP-0012 D1 official MapLibre spec: all policy expressions accepted; invalid zoom nesting rejected');
