/* MAP-0007 — original, georeferenced illustrated trees for Mapp v0.5.
 * Symbols are generated once on canvas; locations use stable world-grid seeds.
 * This is illustrative land-cover, NOT a tree inventory or a vehicle-access layer.
 */
(function(root){
'use strict';
const SPRITES=8, SOURCE='mapp-tree-points', LAYER='mapp-tree-symbols';
const COLORS={
 acuarela:{dark:'#234231',body:'#31543A',leaf:'#436B45',light:'#829B68',trunk:'#5A4936'},
 bosque:{dark:'#1B3627',body:'#284732',leaf:'#365C3D',light:'#688453',trunk:'#51402E'},
 tinta:{dark:'#35483C',body:'#4B6150',leaf:'#667C62',light:'#91A187',trunk:'#645747'}
};
function hash(a,b,c){let n=(Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(c,1274126177))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function mercX(lon){return (lon+180)/360;}
function mercY(lat){const s=Math.sin(Math.max(-85,Math.min(85,lat))*Math.PI/180);return .5-Math.log((1+s)/(1-s))/(4*Math.PI);}
function fromWorld(x,y){return [((x%1+1)%1)*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y)))*180/Math.PI];}
function inRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
 const a=ring[i],b=ring[j];if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
}return inside;}
function classify(feature,layer){const p=feature?.properties||{};const type=String(p.class||p.subclass||'').toLowerCase();
 if(type==='wood'||type==='forest')return 0.91;
 if(layer==='landuse'&&(type==='park'||type==='nature_reserve'||type==='national_park'))return .30;
 if(layer==='landcover'&&(type==='grass'||type==='scrub'))return .12;
 return 0;
}
function shapesFromFeatures(features,layer){const out=[];
 for(const f of features||[]){const chance=classify(f,layer);if(!chance)continue;
  const g=f.geometry;if(!g||!Array.isArray(g.coordinates))continue;
  const polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  for(const rings of polys){if(!rings?.[0]||rings[0].length<4)continue;
   const outer=rings[0];let w=180,e=-180,s=90,n=-90;
   for(const pt of outer){if(pt[0]<w)w=pt[0];if(pt[0]>e)e=pt[0];if(pt[1]<s)s=pt[1];if(pt[1]>n)n=pt[1];}
   if(w<=e&&s<=n)out.push({w,e,s,n,rings,chance});
  }
 }
 return out;
}
function bestCover(lon,lat,shapes){let chance=0;
 for(const shape of shapes){if(lon<shape.w||lon>shape.e||lat<shape.s||lat>shape.n||shape.chance<=chance)continue;
  if(!inRing(lon,lat,shape.rings[0]))continue;
  if(shape.rings.slice(1).some(r=>inRing(lon,lat,r)))continue;
  chance=shape.chance;if(chance>=.91)break;
 }
 return chance;
}
function getGrid(bounds,zoom){const lod=Math.max(6,Math.min(17,Math.floor(zoom)));
 const step=72/(512*Math.pow(2,lod));let west=bounds.getWest(),east=bounds.getEast();if(east<west)east+=360;
 const top=mercY(bounds.getNorth()),bottom=mercY(bounds.getSouth());
 return {lod,step,minX:Math.floor(mercX(west)/step)-1,maxX:Math.ceil(mercX(east)/step)+1,
  minY:Math.floor(top/step)-1,maxY:Math.ceil(bottom/step)+1};
}
function generate(features,bounds,zoom,cap=240){const grid=getGrid(bounds,zoom),out=[];
 const spanX=grid.maxX-grid.minX,spanY=grid.maxY-grid.minY;
 // Hard bound prevents unexpectedly expensive scans at extreme views / malformed bounds.
 if(spanX<0||spanY<0||spanX*spanY>1500)return {type:'FeatureCollection',features:out};
 const shapes=shapesFromFeatures(features.filter(f=>f.__mappLayer==='landcover'),'landcover')
  .concat(shapesFromFeatures(features.filter(f=>f.__mappLayer==='landuse'),'landuse'));
 if(!shapes.length)return {type:'FeatureCollection',features:out};
 for(let iy=grid.minY;iy<=grid.maxY;iy++)for(let ix=grid.minX;ix<=grid.maxX;ix++){
  const dx=.16+hash(ix,iy,11)*.68,dy=.16+hash(ix,iy,19)*.68;
  const ll=fromWorld((ix+dx)*grid.step,(iy+dy)*grid.step);
  const coverage=bestCover(ll[0],ll[1],shapes);
  if(!coverage||hash(ix,iy,31)>coverage)continue;
  const variant=Math.floor(hash(ix,iy,37)*SPRITES);
  out.push({type:'Feature',id:`${grid.lod}:${ix}:${iy}`,properties:{sprite:`mapp-pine-${variant}`,scale:.77+hash(ix,iy,41)*.45},geometry:{type:'Point',coordinates:ll}});
  if(out.length>=cap)return {type:'FeatureCollection',features:out};
 }
 return {type:'FeatureCollection',features:out};
}
function branch(ctx,x,y,width,tone,twist){ctx.fillStyle=tone;ctx.beginPath();ctx.moveTo(x,y-24);
 ctx.lineTo(x-width*.30,y-9);ctx.lineTo(x-width*.48,y-7+twist);
 ctx.lineTo(x-width*.38,y-2);ctx.lineTo(x-width*.85,y+4+twist);
 ctx.lineTo(x-width*.57,y+7);ctx.lineTo(x-width,y+13);
 ctx.lineTo(x-width*.45,y+12);ctx.lineTo(x-width*.32,y+18);
 ctx.lineTo(x+width*.37,y+18);ctx.lineTo(x+width*.5,y+12);
 ctx.lineTo(x+width,y+12+twist);ctx.lineTo(x+width*.56,y+6);
 ctx.lineTo(x+width*.84,y+2);ctx.lineTo(x+width*.37,y-2);
 ctx.lineTo(x+width*.48,y-8);ctx.lineTo(x+width*.22,y-9);ctx.closePath();ctx.fill();}
function drawPine(ctx,x,y,size,variation,color){ctx.save();ctx.translate(x,y);ctx.scale(size,size);
 ctx.fillStyle='#1C2F2B';ctx.globalAlpha=.13;ctx.beginPath();ctx.ellipse(4,0,22,5,-.07,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle=color.trunk;ctx.fillRect(-2.4,-29,4.8,32);
 const height=57+(variation%3)*5;
 for(let k=3;k>=0;k--){const pos=-height+13+k*14;const wd=10+k*5+(variation%2)*2;
   branch(ctx,0,pos,wd,color.dark,(variation+k)%3-1);
   ctx.save();ctx.globalAlpha=.85;branch(ctx,-2,pos-4,wd*.71,k%2?color.body:color.leaf,-.6);ctx.restore();
 }
 // Dry-pastel glints and broken directional strokes, not a wallpaper pattern.
 ctx.strokeStyle=color.light;ctx.lineWidth=1.4;ctx.globalAlpha=.7;ctx.lineCap='round';
 for(let k=0;k<5;k++){const yy=-height+15+k*12;ctx.beginPath();ctx.moveTo(-4-k*1.9,yy+4);ctx.lineTo(-12-k*1.7,yy+8+(variation%2));ctx.stroke();}
 ctx.restore();}
function sprite(index,theme){const c=document.createElement('canvas');c.width=112;c.height=152;const ctx=c.getContext('2d');
 if(!ctx)throw Error('2D Canvas unavailable');ctx.translate(56,142);
 const colors=COLORS[theme]||COLORS.acuarela;
 if(index===6||index===7){drawPine(ctx,-21,0,index===6?.71:.85,index+2,colors);drawPine(ctx,20,1,index===6?.83:.7,index+4,colors);}
 else drawPine(ctx,0,0,.89+(index%4)*.06,index,colors);
 return ctx.getImageData(0,0,112,152);
}
function install(map,{theme='acuarela',maxDesktop=240,maxMobile=130}={}){
 if(!map?.getSource?.('openmaptiles'))return {enabled:false,reason:'No OpenMapTiles source'};
 let registered=0;
 try{for(let i=0;i<SPRITES;i++){const name=`mapp-pine-${i}`;if(!map.hasImage?.(name))map.addImage(name,sprite(i,theme),{pixelRatio:2});registered++;}}
 catch(err){console.warn('Mapp ilustraciones no disponibles:',err);return {enabled:false,reason:String(err)};}
 try{
  map.addSource(SOURCE,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  const firstRoad=map.getStyle().layers.find(l=>l.type==='line'&&!l.id.startsWith('mapp-')&&/road/.test(l.id.toLowerCase()))?.id;
  const before=firstRoad||map.getStyle().layers.find(l=>l.type==='symbol'&&!l.id.startsWith('mapp-'))?.id;
  map.addLayer({id:LAYER,type:'symbol',source:SOURCE,minzoom:5,layout:{
   'icon-image':['get','sprite'],'icon-anchor':'bottom',
   'icon-size':['*',['get','scale'],['interpolate',['linear'],['zoom'],6,.48,9,.63,12,.72,15,.88,18,1.04]],
   'icon-allow-overlap':true,'icon-ignore-placement':true,'icon-rotation-alignment':'map','icon-pitch-alignment':'map'
  },paint:{'icon-opacity':theme==='tinta'?.81:.96}},before);
 }catch(err){console.warn('No se pudo añadir bosque ilustrado:',err);return {enabled:false,reason:String(err)};}
 let version=0,lastKey='',timer=null,disposed=false;
 const ceiling=()=>Math.max(70,Math.min(maxDesktop,(map.getCanvas().clientWidth||800)<650?maxMobile:maxDesktop));
 function refresh(){if(disposed)return;
  try{
   const bounds=map.getBounds(),zoom=map.getZoom(),grid=getGrid(bounds,zoom);
   const key=[grid.lod,grid.minX,grid.maxX,grid.minY,grid.maxY,version].join('/');
   if(key===lastKey)return;
   const cover=[];
   for(const layer of ['landcover','landuse']){
    let items=[];try{items=map.querySourceFeatures('openmaptiles',{sourceLayer:layer})||[];}catch(_){}
    for(const item of items){if(classify(item,layer))cover.push({type:'Feature',geometry:item.geometry,properties:item.properties,__mappLayer:layer});}
   }
   // Waiting for remote tiles: retry on next source loaded / idle.
   if(!cover.length)return;
   const result=generate(cover,bounds,zoom,ceiling());
   map.getSource(SOURCE)?.setData(result);lastKey=key;
  }catch(err){console.warn('Bosque ilustrado:',err?.message||err);}
 }
 function schedule(ms=110){if(disposed)return;clearTimeout(timer);timer=setTimeout(refresh,ms);}
 map.on('moveend',()=>schedule(110));map.on('idle',()=>schedule(70));
 map.on('sourcedata',e=>{if(e?.sourceId==='openmaptiles'&&e.isSourceLoaded){version++;schedule(120);}});
 schedule(250);
 return {enabled:registered===SPRITES,refresh:()=>{lastKey='';schedule(0)},setTheme(next){
   if(disposed)return;
   for(let i=0;i<SPRITES;i++){try{map.updateImage(`mapp-pine-${i}`,sprite(i,next));}catch(err){console.warn('Paleta de árboles:',err?.message||err);}}
   if(map.getLayer(LAYER))map.setPaintProperty(LAYER,'icon-opacity',next==='tinta'?.81:.96);
  },dispose(){disposed=true;clearTimeout(timer);}};
}
const api={hash,mercX,mercY,fromWorld,inRing,classify,generate,install,sprite};
root.MappForest=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);