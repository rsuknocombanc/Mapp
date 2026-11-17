'use strict';
// Minimal calculation tests independent of browser and real routing service.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('assets/app.js','utf8');
const h=source.match(/function haversine\(a,b\)\{[^\n]+\}/);
assert(h,'haversine definition missing');
const context={};vm.createContext(context);vm.runInContext(`${h[0]}; var result=haversine([0,0],[1,0]);`,context);
assert(Math.abs(context.result-111.2)<0.5);
assert(source.includes("geometries=geojson"));
assert(source.includes("result.code!=='Ok'"));
assert(source.includes('router.project-osrm.org'));
assert(!source.includes('new maplibregl.NavigationControl'));
console.log('Route math and explicit router contract OK');