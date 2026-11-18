'use strict';
const assert=require('node:assert/strict');
const canopy=require('../assets/forest.js');
const p=require('../assets/pigment.js');
const bounds=(w,e,s,n)=>({getWest:()=>w,getEast:()=>e,getSouth:()=>s,getNorth:()=>n});
const box=[[-70.5,-33.6],[-70.1,-33.6],[-70.1,-33.2],[-70.5,-33.2],[-70.5,-33.6]];
const hole=[[-70.32,-33.43],[-70.26,-33.43],[-70.26,-33.38],[-70.32,-33.38],[-70.32,-33.43]];
const f={type:'Feature',__mappLayer:'landcover',properties:{class:'wood'},geometry:{type:'Polygon',coordinates:[box,hole]}};
const view=bounds(-70.45,-70.14,-33.55,-33.22);
const a=p.generate([f],view,12.4,150),b=p.generate([f],view,12.4,150);
assert.deepEqual(a,b,'pigment stamp sampling must be deterministic');
assert(a.features.length>2 && a.features.length<=150,'pigment budget');
for(const t of a.features){
 assert(canopy.inRing(...t.geometry.coordinates,box));
 assert(!canopy.inRing(...t.geometry.coordinates,hole));
 assert(/^mapp-pigment-[0-3]-[0-2]$/.test(t.properties.stamp));
 assert(t.properties.scale>.7 && t.properties.scale<1.6);
}
assert.equal(p.generate([],view,12,40).features.length,0);
const size=p.stampSizeExpression();
assert.equal(size[0],'interpolate');assert.deepEqual(size[2],['zoom']);
console.log('MAP-0013: organic world-anchored pigment sampling, holes, 12 sprites and budgets OK');
