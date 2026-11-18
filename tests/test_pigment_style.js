'use strict';
const assert=require('node:assert/strict');
const {validateStyleMin:validateStyle}=require('@maplibre/maplibre-gl-style-spec');
const pigment=require('../assets/pigment.js');
const size=pigment.stampSizeExpression();
const style={version:8,sources:{pigment:{type:'geojson',data:{type:'FeatureCollection',features:[]}}},
 layers:[{id:'mapp-pigment-stamps',type:'symbol',source:'pigment',minzoom:6,
 layout:{'icon-image':['get','stamp'],'icon-anchor':'center','icon-size':size,'icon-rotate':['get','rotation'],
 'icon-rotation-alignment':'map','icon-allow-overlap':true,'icon-ignore-placement':true},
 paint:{'icon-opacity':.72}}]};
const errors=validateStyle(style);
assert.equal(errors.length,0,errors.map(x=>x.message).join(' / '));
assert.equal(style.layers[0].layout['icon-size'][0],'interpolate');
const broken=JSON.parse(JSON.stringify(style));
broken.layers[0].layout['icon-size']=['*',['get','scale'],['interpolate',['linear'],['zoom'],6,.48,18,1.42]];
assert(validateStyle(broken).length>0,'regression guard for invalid zoom nesting');
console.log('MAP-0013 official MapLibre Style Spec validates pigment layer and rejects nested zoom');
