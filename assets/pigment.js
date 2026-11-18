/* MAP-0013 — deterministic organic watercolor stamps over real OSM vegetation */
(function(root){'use strict';
const SOURCE='mapp-pigment-points',LAYER='mapp-pigment-stamps',W=128,H=128,COLS=4,ROWS=3;
const hash=(a,b,c)=>root.MappForest.hash(a,b,c);
function coverAt(lon,lat,shapes){
 let val=0;
 for(const s of shapes){if(lon<s.w||lon>s.e||lat<s.s||lat>s.n||val>=s.density)continue;
  if(!root.MappForest.inRing(lon,lat,s.rings[0]))continue;
  if(s.rings.slice(1).some(r=>root.MappForest.inRing(lon,lat,r)))continue;
  val=Math.max(val,s.density);
 }
 return val;
}
function generate(features,bounds,zoom,cap=160){
 const f=root.MappForest;if(!f)return {type:'FeatureCollection',features:[]};
 const lod=Math.max(6,Math.min(17,Math.floor(zoom))),step=98/(512*Math.pow(2,lod));
 const west=f.mercX(bounds.getWest()),east=f.mercX(bounds.getEast()),top=f.mercY(bounds.getNorth()),bottom=f.mercY(bounds.getSouth());
 const minX=Math.floor(west/step)-1,maxX=Math.ceil(east/step)+1,minY=Math.floor(top/step)-1,maxY=Math.ceil(bottom/step)+1;
 let candidates=[];const shapes=[];
 for(const group of ['landcover','landuse','park']){
  shapes.push(...f.shapesFromFeatures(features.filter(t=>t.__mappLayer===group),group));
 }
 if(!shapes.length)return {type:'FeatureCollection',features:[]};
 const total=(maxX-minX+1)*(maxY-minY+1),stride=Math.max(1,Math.ceil(Math.sqrt(total/2800)));
 for(let y=minY;y<=maxY;y+=stride)for(let x=minX;x<=maxX;x+=stride){
  const p=f.fromWorld((x+.18+.64*hash(x,y,21))*step,(y+.18+.64*hash(x,y,22))*step);
  const density=coverAt(p[0],p[1],shapes);
  if(density<.001||hash(x,y,30)>Math.min(.95,density*.92))continue;
  const tone=Math.min(ROWS-1,Math.floor(hash(x,y,43)*ROWS));
  const variant=Math.min(COLS-1,Math.floor(hash(x,y,44)*COLS));
  candidates.push({type:'Feature',id:'pigment-'+lod+'-'+x+'-'+y,geometry:{type:'Point',coordinates:p},
   properties:{stamp:'mapp-pigment-'+variant+'-'+tone,scale:.74+hash(x,y,45)*.82,rotation:hash(x,y,46)*360,rank:hash(x,y,47)}});
 }
 if(candidates.length>cap)candidates=candidates.sort((a,b)=>a.properties.rank-b.properties.rank).slice(0,cap);
 return {type:'FeatureCollection',features:candidates};
}
function stampSizeExpression(){
 const sized=n=>['*',['get','scale'],n];
 return ['interpolate',['linear'],['zoom'],6,sized(.48),10,sized(.78),14,sized(1.14),18,sized(1.42)];
}
function install(map,{maxDesktop=160,maxMobile=80}={}){
 if(!map?.getSource?.('openmaptiles')||!root.MappForest)return {enabled:false,reason:'Missing OSM source or canopy module'};
 let disposed=false,ready=false,last='',timer=null,version=0;
 const cap=()=>Math.min(maxDesktop,(map.getCanvas().clientWidth||800)<650?maxMobile:maxDesktop);
 function refresh(){
  if(!ready||disposed)return;
  try{
   const b=map.getBounds(),zoom=map.getZoom(),lod=Math.floor(zoom);
   const key=String(lod)+'/'+b.getWest().toFixed(3)+'/'+b.getSouth().toFixed(3)+'/'+version;
   if(key===last)return;
   const items=[];
   for(const layer of ['landcover','landuse','park']){
    let found=[];try{found=map.querySourceFeatures('openmaptiles',{sourceLayer:layer})||[]}catch(_){}
    for(const f of found){if(root.MappForest.classify(f,layer))items.push({...f,__mappLayer:layer});}
   }
   map.getSource(SOURCE)?.setData(generate(items,b,zoom,cap()));last=key;
  }catch(err){console.warn('Mapp pigment:',err?.message||err);}
 }
 function schedule(delay=100){clearTimeout(timer);timer=setTimeout(refresh,delay);}
 function readyImage(img){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Missing canvas');
  for(let tone=0;tone<ROWS;tone++)for(let v=0;v<COLS;v++){
   ctx.clearRect(0,0,W,H);ctx.drawImage(img,v*W,tone*H,W,H,0,0,W,H);
   map.addImage('mapp-pigment-'+v+'-'+tone,ctx.getImageData(0,0,W,H),{pixelRatio:2});
  }
  map.addSource(SOURCE,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
  const layers=map.getStyle().layers;
  const before=map.getLayer('mapp-tree-symbols')?'mapp-tree-symbols':
   layers.find(l=>l.type==='line'&&l['source-layer']==='transportation'&&l.layout?.visibility!=='none')?.id||
   layers.find(l=>l.type==='symbol'&&!l.id.startsWith('mapp-'))?.id;
  map.addLayer({id:LAYER,type:'symbol',source:SOURCE,minzoom:6,layout:{
   'icon-image':['get','stamp'],'icon-anchor':'center','icon-size':stampSizeExpression(),
   'icon-rotate':['get','rotation'],'icon-rotation-alignment':'map',
   'icon-allow-overlap':true,'icon-ignore-placement':true
  },paint:{'icon-opacity':.72}},before);
  ready=true;schedule(20);
 }
 const img=new Image();img.decoding='async';
 img.onload=()=>{if(disposed)return;try{readyImage(img)}catch(e){console.warn('Mapp pigment art:',e)}};
 img.onerror=()=>console.warn('Mapp: pigment atlas could not load');
 img.src=new URL('./assets/trees/pigment-atlas.png',document.baseURI).href;
 map.on('moveend',()=>schedule());map.on('idle',()=>schedule(150));
 map.on('sourcedata',e=>{if(e?.sourceId==='openmaptiles'&&e.isSourceLoaded){version++;schedule(160)}});
 return {enabled:true,refresh:()=>{last='';schedule(0)},dispose(){disposed=true;clearTimeout(timer)}};
}
const api={generate,coverAt,stampSizeExpression,install};root.MappPigment=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
