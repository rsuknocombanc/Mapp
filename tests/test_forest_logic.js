'use strict';
const assert=require('node:assert/strict');
const f=require('../assets/forest.js');
const bounds=(w,e,s,n)=>({getWest:()=>w,getEast:()=>e,getSouth:()=>s,getNorth:()=>n});
const forest=[[-70.55,-33.65],[-70.10,-33.65],[-70.10,-33.20],[-70.55,-33.20],[-70.55,-33.65]];
const lake=[[-70.33,-33.47],[-70.23,-33.47],[-70.23,-33.38],[-70.33,-33.38],[-70.33,-33.47]];
const feature={type:'Feature',properties:{class:'wood'},__mappLayer:'landcover',geometry:{type:'Polygon',coordinates:[forest,lake]}};
const b=bounds(-70.48,-70.15,-33.59,-33.25), x=f.generate([feature],b,12.3,480),y=f.generate([feature],b,12.3,480);
assert.deepEqual(x,y,'deterministic samples');
assert(x.features.length>30,`strong forest must contain visible symbols, got ${x.features.length}`);
assert(x.features.length<=480,'budget');
for(const t of x.features){const [lon,lat]=t.geometry.coordinates;
 assert(f.inRing(lon,lat,forest));assert(!f.inRing(lon,lat,lake));
 assert(/^mapp-canopy-broadleaf-[0-7]-[0-2]$/.test(t.properties.sprite));
 assert(t.properties.scale>=.45&&t.properties.scale<=1.7);
}
const b2=bounds(-70.43,-70.12,-33.56,-33.23);
const z=f.generate([feature],b2,12.3,480);
const matching=x.features.filter(a=>z.features.some(b=>b.id===a.id));
assert(matching.length>10,'world anchoring overlap');
for(const a of matching)assert.deepEqual(a.geometry.coordinates,z.features.find(b=>b.id===a.id).geometry.coordinates);
assert.equal(f.generate([],b,12.3,480).features.length,0);
assert.equal(f.generate([{...feature,properties:{class:'water'}}],b,12.3,480).features.length,0);
assert.equal(f.classify({properties:{class:'wood'}},'landcover'),.95);
assert.equal(f.classify({properties:{class:'park'}},'landuse'),.47);
assert.equal(f.classify({properties:{class:'national_park'}},'park'),.42);
assert.equal(f.classify({properties:{class:'grass'}},'landcover'),.28);
assert.equal(f.classify({properties:{class:'water'}},'park'),0);
const parkFeature={...feature,properties:{class:'national_park'},__mappLayer:'park'};
assert(f.generate([parkFeature],b,12.3,480).features.length>12,'parks must receive sparse artistic trees');
assert(f.generate([feature],b,12.3,7).features.length<=7,'cap works');
// A wide desktop view cannot go empty just because candidate grid exceeds 1500 points.
const wide=f.generate([feature],bounds(-70.60,-70.03,-33.76,-33.05),12.3,480);
assert(wide.features.length>25,'large viewport retains trees');
console.log('Watercolor forest geometry, density, holes, park coverage, world anchors and caps OK',x.features.length);
assert.equal(f.forestLevel(9.5),'regional');
assert.equal(f.forestLevel(12.3),'middle');
assert.equal(f.forestLevel(15.4),'close');
assert(f.cellSpacing(9)<f.cellSpacing(15),'smaller, denser pines at regional zoom');
const regional=f.generate([feature],b,9.7,480);
const close=f.generate([feature],b,15.2,480);
assert(regional.features.length&&close.features.length,'both zoom compositions produce trees');
const mean=fc=>fc.features.reduce((s,t)=>s+t.properties.scale,0)/fc.features.length;
assert(mean(close)>mean(regional)+.2,'larger trees at close zoom');
assert.equal(f.canopyCluster(123,45),f.canopyCluster(123,45));
const patches=new Set(Array.from({length:25},(_,i)=>f.canopyCluster(i,10).toFixed(3)));
assert(patches.size>8,'natural variation must not be uniform');
console.log('Zoom-dependent groves, clustering, scales and geometry OK');

const conifer=f.generate([feature],b,12.3,480,'conifer');
assert.equal(conifer.features.length,x.features.length);
for(let i=0;i<conifer.features.length;i++){
 assert.deepEqual(conifer.features[i].geometry,x.features[i].geometry);
 assert(/^mapp-canopy-conifer-[0-7]-[0-2]$/.test(conifer.features[i].properties.sprite));
}
assert.equal(f.spriteFor(1,2,'broadleaf'),'mapp-canopy-broadleaf-1-2');
assert.equal(f.spriteFor(1,2,'conifer'),'mapp-canopy-conifer-1-2');
assert.throws(()=>f.generate([feature],b,12.3,480,'pine-profile'));
console.log('MAP-0013: both top-down families preserve world coordinates and density');
