'use strict';
// Validate the EXACT expression used to install the forest layer with MapLibre's official style spec.
// Prevent the previous mock-only CI false green: zoom inside multiplication was rejected in Edge.
const assert=require('node:assert/strict');
const forest=require('../assets/forest.js');
const {validateStyleMin:validateStyle}=require('@maplibre/maplibre-gl-style-spec');
assert.equal(typeof validateStyle,'function','MapLibre official validator must be available');

const iconSize=forest.treeIconSizeExpression();
assert.equal(iconSize[0],'interpolate','zoom must be on the top-level interpolate');
assert.deepEqual(iconSize[2],['zoom']);
const expected=[6,9,12,14,16,18],multipliers=[.17,.26,.40,.57,.78,.94];
for(let i=0;i<expected.length;i++){
  assert.equal(iconSize[3+i*2],expected[i]);
  assert.deepEqual(iconSize[4+i*2],['*',['get','scale'],multipliers[i]]);
}
const style={
  version:8,
  sources:{trees:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},
  layers:[{id:'mapp-tree-symbols',type:'symbol',source:'trees',minzoom:6,
    layout:{
      'icon-image':['get','sprite'],'icon-anchor':'center',
      'icon-size':iconSize,'icon-rotate':['get','rotation'],
      'icon-allow-overlap':true,'icon-ignore-placement':true,
      'icon-rotation-alignment':'map','icon-pitch-alignment':'map'
    },
    paint:{'icon-opacity':1}
  }]
};
const valid=validateStyle(style);
assert.equal(valid.length,0,'Official MapLibre style validation errors: '+valid.map(e=>e.message).join('; '));
// Negative control: reproduce exactly the zoom nesting that broke v0.6.0.
const broken=JSON.parse(JSON.stringify(style));
broken.layers[0].layout['icon-size']=['*',['get','scale'],['interpolate',['linear'],['zoom'],6,.34,18,.82]];
const invalid=validateStyle(broken);
assert(invalid.length>0,'Validator MUST reject the previous invalid zoom-nesting expression');
assert(invalid.some(e=>/zoom|interpolate|step|expression/i.test(e.message)),'Validator rejection should identify invalid camera expression');
console.log('Official MapLibre style-spec: valid tree icon-size accepted; previous v0.6 nesting rejected');
