const fs=require('fs'),path=require('path'),sharp=require('../../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp');
const photos=[
['PXL_20260912_211636605.MP.jpg','event-daylight','Restroom trailer beside a white event tent and mature tree in daylight','Exterior'],
['PXL_20260913_040959978.jpg','event-lights-on','The same outdoor event setting at night, with trailer entrance lights and an illuminated tent','Exterior'],
['PXL_20260913_040801671.jpg','trailer-night-detail','Three trailer entrances with exterior lights illuminating the steps and grass at night','Exterior'],
['PXL_20260926_185454389.MP.jpg','msu-tailgate','Restroom trailer beside guests and white tents at a Michigan State University tailgate','Events'],
['Photos-1-001/PXL_20260611_165740785.jpg','interior-room','Restroom interior with toilet, urinal, sink, mirror and wood-look floor','Interior'],
['Photos-1-001/PXL_20260611_165502756.jpg','interior-vanity','Trailer vanity with stainless steel sink, mirror and wall-mounted towel dispenser','Interior'],
['Photos-1-001/PXL_20260611_165517674.MP.jpg','interior-sink','Close view of the trailer sink, mirror and towel dispenser','Interior'],
['Photos-1-001/PXL_20260611_165523927.jpg','interior-stall','Private restroom stall with toilet and wood-look flooring','Interior']];
(async()=>{const manifest=[];for(const [file,name,alt,category] of photos){const source=path.join('C:/Users/wende/Downloads',file),dest='public/images/live-events/'+name+'.webp';const out=await sharp(source).rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(dest);manifest.push({source,src:'/images/live-events/'+name+'.webp',id:'live-'+name,alt,category,width:out.width,height:out.height,bytes:out.size});}fs.writeFileSync('output/live-photos/asset-manifest.json',JSON.stringify(manifest,null,2));console.log(manifest.map(p=>({image:p.id,bytes:p.bytes})));})();
