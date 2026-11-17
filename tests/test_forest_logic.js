'use strict';
const assert=require('node:assert/strict');
const f=require('../assets/forest.js');
const bounds=(w,e,s,n)=>({getWest:()=>w,getEast:()=>e,getSouth:()=>s,getNorth:()=>n});
const polygon=[[-70.55,-33.65],[-70.10,-33.65],[-70.10,-33.20],[-70.55,-33.20],[-70.55,-33.65]];
const hole=[[-70.33,-33.47],[-70.23,-33.47],[-70.23,-33.38],[-70.33,-33.38],[-70.33,-33.47]];
const feature={type:'Feature',properties:{class:'wood'},__mappLayer:'landcover',geometry:{type:'Polygon',coordinates:[polygon,hole]}};
const b=bounds(-70.48,-70.15,-33.59,-33.25);
const x=f.generate([feature],b,10,260),y=f.generate([feature],b,10,260);
assert.deepEqual(x,y,'same scene and zoom should produce identical points');
assert(x.features.length>2,'sampled woodland should contain painted trees');
assert(x.features.length<=260);
for(const t of x.features){const [lon,lat]=t.geometry.coordinates;
 assert(f.inRing(lon,lat,polygon),'all trees must be inside wood polygon');
 assert(!f.inRing(lon,lat,hole),'no trees in lakes/clearings represented as polygon holes');
 assert(t.properties.sprite.startsWith('mapp-pine-'));
 assert(t.properties.scale>.7&&t.properties.scale<1.3);
}
const noForest=f.generate([{...feature,properties:{class:'water'}}],b,10,260);
assert.equal(noForest.features.length,0,'no trees on unrecognized class');
const noSource=f.generate([],b,10,260);assert.equal(noSource.features.length,0);
const bounded=f.generate([feature],b,10,8);assert(bounded.features.length<=8);
// Geographic anchors remain fixed when the viewport slides but zoom bucket is unchanged.
const b2=bounds(-70.43,-70.12,-33.56,-33.23);
const z=f.generate([feature],b2,10,260);
const common=x.features.filter(a=>z.features.some(b=>b.id===a.id));
assert(common.length>0);
for(const a of common){const other=z.features.find(b=>b.id===a.id);assert.deepEqual(a.geometry.coordinates,other.geometry.coordinates);}
assert.equal(f.classify({properties:{class:'park'}},'landuse'),.30);
assert.equal(f.classify({properties:{class:'wood'}},'landcover'),.91);
assert.equal(f.classify({properties:{class:'water'}},'landcover'),0);
console.log(`Forest geometry, determinism, holes and stable-world anchoring OK (${x.features.length} sample symbols)`);