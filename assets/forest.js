/* MAP-0009 — watercolor illustrations approved by user, placed on OSM vegetation.
 * No wallpaper patterns: deterministic georeferenced samples in loaded polygon data.
 * Copyright: original user-approved generated watercolor artwork, reworked as a sprite atlas.
 */
(function(root){
'use strict';
const COUNT=8, TONES=3, W=176,H=216, SOURCE='mapp-tree-points',LAYER='mapp-tree-symbols';
function hash(a,b,c){let n=(Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(c,1274126177))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function mercX(lon){return (lon+180)/360;}
function mercY(lat){const s=Math.sin(Math.max(-85,Math.min(85,lat))*Math.PI/180);return .5-Math.log((1+s)/(1-s))/(4*Math.PI);}
function fromWorld(x,y){return [((x%1+1)%1)*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y)))*180/Math.PI];}
function inRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
 const a=ring[i],b=ring[j];if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
}return inside;}
function classify(feature,layer){const p=feature?.properties||{};
 const cls=String(p.class||'').toLowerCase(),sub=String(p.subclass||'').toLowerCase(),kind=String(p.type||'').toLowerCase();
 // OpenMapTiles landcover often represents forest with class=wood (not 'forest').
 if(cls==='wood'||cls==='forest'||sub==='wood'||sub==='forest'||sub==='trees')return .95;
 if(layer==='landcover'){
  if(cls==='grass'||sub==='grass'||sub==='grassland'||sub==='meadow')return .28;
  if(cls==='scrub'||sub==='scrub'||sub==='shrubbery'||sub==='heath')return .19;
 }
 if(layer==='landuse'){
  if(['forest','wood','orchard'].includes(cls)||['forest','wood'].includes(kind))return .83;
  if(['park','nature_reserve','national_park','protected_area','recreation_ground'].includes(cls))return .47;
  if(cls==='grass'||cls==='meadow')return .23;
 }
 // OpenMapTiles park is a separate vector source-layer: large reserves are illustrative
 // (not a claim that every hillside is forested). They use sparser mixed clusters.
 if(layer==='park'&&['park','national_park','nature_reserve','protected_area',''].includes(cls))return .42;
 return 0;
}
function shapesFromFeatures(features,layer){const shapes=[];
 for(const f of features||[]){const density=classify(f,layer);if(density===0)continue;
  const g=f.geometry;if(!g||!Array.isArray(g.coordinates))continue;
  const polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  for(const rings of polys){if(!rings?.[0]||rings[0].length<4)continue;
   let w=180,e=-180,s=90,n=-90;
   for(const pt of rings[0]){w=Math.min(w,pt[0]);e=Math.max(e,pt[0]);s=Math.min(s,pt[1]);n=Math.max(n,pt[1]);}
   if(w<=e&&s<=n)shapes.push({w,e,s,n,rings,density});
  }
 }
 return shapes;
}
function bestCover(lon,lat,shapes){let coverage=0;
 for(const sh of shapes){if(sh.density<=coverage||lon<sh.w||lon>sh.e||lat<sh.s||lat>sh.n)continue;
  if(!inRing(lon,lat,sh.rings[0])||sh.rings.slice(1).some(r=>inRing(lon,lat,r)))continue;
  coverage=sh.density;if(coverage>=.95)break;
 }
 return coverage;
}
// Zoom-adaptive, world-anchored canopy composition, without repeated wallpapers.
function forestLevel(z){return z<12?'regional':z<14?'middle':'close';}
function cellSpacing(lod){return lod<12?23:lod<14?32:53;}
function smoothNoise(x,y,seed){
 const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy;
 const fx=dx*dx*(3-2*dx),fy=dy*dy*(3-2*dy);
 const a=hash(ix,iy,seed)*(1-fx)+hash(ix+1,iy,seed)*fx;
 const b=hash(ix,iy+1,seed)*(1-fx)+hash(ix+1,iy+1,seed)*fx;
 return a*(1-fy)+b*fy;
}
function canopyCluster(ix,iy){
 return .44*smoothNoise(ix/5.4,iy/5.4,79)+.56*smoothNoise(ix/16.3,iy/16.3,101);
}
function getGrid(bounds,zoom){
 const lod=Math.max(6,Math.min(17,Math.floor(zoom)));
 // Previous 72px spacing plus low coverage yielded only 4 trees at Z12.3.
 // This is screen-space ~32px spacing at integer zoom, anchored in world coordinates.
 const step=cellSpacing(lod)/(512*Math.pow(2,lod));let west=bounds.getWest(),east=bounds.getEast();if(east<west)east+=360;
 const top=mercY(bounds.getNorth()),bottom=mercY(bounds.getSouth());
 return {lod,step,minX:Math.floor(mercX(west)/step)-1,maxX:Math.ceil(mercX(east)/step)+1,
  minY:Math.floor(top/step)-1,maxY:Math.ceil(bottom/step)+1};
}
function generate(features,bounds,zoom,cap=420){
 const grid=getGrid(bounds,zoom),out=[],stepX=grid.maxX-grid.minX+1,stepY=grid.maxY-grid.minY+1;
 if(stepX<=0||stepY<=0)return {type:'FeatureCollection',features:out};
 const shapes=[];
 for(const layer of ['landcover','landuse','park'])shapes.push(...shapesFromFeatures(features.filter(f=>f.__mappLayer===layer),layer));
 if(!shapes.length)return {type:'FeatureCollection',features:out};
 // Never return an empty forest merely because the desktop viewport is wide.
 const stride=Math.max(1,Math.ceil(Math.sqrt(stepX*stepY/6500)));
 for(let iy=grid.minY;iy<=grid.maxY;iy+=stride){for(let ix=grid.minX;ix<=grid.maxX;ix+=stride){
  const dx=.12+hash(ix,iy,11)*.76,dy=.12+hash(ix,iy,19)*.76;
  const pt=fromWorld((ix+dx)*grid.step,(iy+dy)*grid.step);
  const coverage=bestCover(pt[0],pt[1],shapes);
  if(coverage===0)continue;
  const cluster=canopyCluster(ix,iy);
  const occupancy=Math.min(.99,coverage*(.23+1.70*cluster));
  if(hash(ix,iy,31)>occupancy)continue;
  const variant=Math.min(COUNT-1,Math.floor(hash(ix,iy,37)*COUNT));
  const tone=Math.min(TONES-1,Math.floor(hash(ix,iy,39)*TONES));
  const rank=hash(ix,iy,67);
  const level=forestLevel(zoom);
  const base=level==='regional'?.53:level==='middle'?.61:.69;
  const range=level==='regional'?.48:level==='middle'?.67:.91;
  const scale=base+range*hash(ix,iy,41)+.11*(cluster-.5);
  out.push({type:'Feature',id:`${grid.lod}:${ix}:${iy}`,properties:{sprite:`mapp-pine-${variant}-${tone}`,scale,rotation:(hash(ix,iy,53)-.5)*9,rank},geometry:{type:'Point',coordinates:pt}});
 }}
 // Spatially unbiased selection when too many symbols, unlike the previous
 // row-order early cutoff that overloaded only the left edge of the viewport.
 if(out.length>cap)out.sort((a,b)=>a.properties.rank-b.properties.rank).splice(cap);
 return {type:'FeatureCollection',features:out};
}
// The camera expression MUST be top-level: MapLibre rejects zoom nested in multiplication.
// Feature-specific scale is evaluated at each zoom stop to retain individual tree variation.
function treeIconSizeExpression(){
 const sized=factor=>['*',['get','scale'],factor];
 return ['interpolate',['linear'],['zoom'],
  6,sized(.17),9,sized(.26),12,sized(.40),14,sized(.57),16,sized(.78),18,sized(.94)];
}
function install(map,{maxDesktop=600,maxMobile=320,onStats=null}={}){
 if(!map?.getSource?.('openmaptiles'))return {enabled:false,reason:'Vector tile source not loaded'};
 const notify=(count)=>{try{if(typeof onStats==='function')onStats(count);}catch(_){}};
 let disposed=false,timer=null,lastKey='',version=0,ready=false;
 const limit=()=>{const small=(map.getCanvas().clientWidth||800)<650;
   const max=small?maxMobile:maxDesktop;
   return Math.max(80,Math.floor(max*(forestLevel(map.getZoom())==='close'?.8:1)));};
 function refresh(){if(disposed||!ready)return;
  try{
   const b=map.getBounds(),zoom=map.getZoom(),grid=getGrid(b,zoom);
   const key=[grid.lod,grid.minX,grid.maxX,grid.minY,grid.maxY,version].join('/');
   if(key===lastKey)return;
   const cover=[];
   for(const layer of ['landcover','landuse','park']){
    let items=[];try{items=map.querySourceFeatures('openmaptiles',{sourceLayer:layer})||[]}catch(_){}
    for(const item of items){if(classify(item,layer))cover.push({type:'Feature',properties:item.properties,geometry:item.geometry,__mappLayer:layer});}
   }
   const result=generate(cover,b,zoom,limit());
   map.getSource(SOURCE)?.setData(result);
   lastKey=key;notify(result.features.length);
  }catch(err){console.warn('Mapp bosque ilustrado:',err?.message||err);}
 }
 function schedule(ms=100){if(disposed)return;clearTimeout(timer);timer=setTimeout(refresh,ms);}
 function registerSprites(img){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas not available');
  for(let tone=0;tone<TONES;tone++)for(let variant=0;variant<COUNT;variant++){
   ctx.clearRect(0,0,W,H);ctx.drawImage(img,variant*W,tone*H,W,H,0,0,W,H);
   map.addImage(`mapp-pine-${variant}-${tone}`,ctx.getImageData(0,0,W,H),{pixelRatio:2});
  }
 }
 function init(){
  if(disposed)return;
  try{
   map.addSource(SOURCE,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   const firstRoad=map.getStyle().layers.find(l=>l.type==='line'&&!l.id.startsWith('mapp-')&&/road|motorway|trunk|primary/.test(l.id.toLowerCase()))?.id;
   const before=map.getLayer('mapp-commune-boundary')?'mapp-commune-boundary':firstRoad||map.getStyle().layers.find(l=>l.type==='symbol'&&!l.id.startsWith('mapp-'))?.id;
   map.addLayer({id:LAYER,type:'symbol',source:SOURCE,minzoom:6,layout:{
    'icon-image':['get','sprite'],'icon-anchor':'bottom',
    'icon-size':treeIconSizeExpression(),
    'icon-rotate':['get','rotation'], 'icon-allow-overlap':true,'icon-ignore-placement':true,
    'icon-rotation-alignment':'map','icon-pitch-alignment':'map'
   },paint:{'icon-opacity':.97}},before);
   if(!map.getLayer(LAYER))throw Error('MapLibre rechazó la capa ilustrada de pinos');
   ready=true;schedule(10);
  }catch(e){console.warn('Mapp árboles: no se pudo instalar',e);notify(0);}
 }
 // One same-origin PNG request instead of 24 downloads. Original approved watercolor art.
 const img=new Image();img.decoding='async';
 img.onload=()=>{if(disposed)return;try{registerSprites(img);init()}catch(e){console.warn('Mapp acuarela no disponible:',e);notify(0)}};
 img.onerror=()=>{console.warn('Mapp: no se pudo cargar acuarela transparente');notify(0)};
 img.src=new URL('./assets/trees/watercolor-atlas.png',document.baseURI).href;
 map.on('moveend',()=>schedule(100));map.on('idle',()=>schedule(130));
 map.on('sourcedata',e=>{if(e?.sourceId==='openmaptiles'&&e.isSourceLoaded){version++;schedule(140)}});
 return {enabled:true,refresh:()=>{lastKey='';schedule(0)},dispose(){disposed=true;clearTimeout(timer)}};
}
const api={hash,mercX,mercY,fromWorld,inRing,classify,shapesFromFeatures,getGrid,generate,forestLevel,cellSpacing,canopyCluster,treeIconSizeExpression,install};
root.MappForest=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);