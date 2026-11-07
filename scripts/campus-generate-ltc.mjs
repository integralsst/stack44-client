// Extract Three.js' exact FP32/FP16 LUTs; data, filters and area-light model stay unchanged.
import {RectAreaLightTexturesLib} from 'three/addons/lights/RectAreaLightTexturesLib.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
RectAreaLightTexturesLib.init();
const metadata={source:'three 0.187.0 / RectAreaLightTexturesLib',dimensions:[64,64,4],encoding:'lossless byte-plane shuffle + gzip',tables:{}};
for(const [name,prefix] of [['f32','LTC_FLOAT'],['f16','LTC_HALF']]){
 const tables=[1,2].map(i=>RectAreaLightTexturesLib[prefix+'_'+i].image.data);
 const binary=Buffer.concat(tables.map(array=>Buffer.from(array.buffer,array.byteOffset,array.byteLength)));
 const width=name==='f32'?4:2,count=binary.length/width,shuffled=Buffer.alloc(binary.length);
 for(let byte=0;byte<width;byte++)for(let i=0;i<count;i++)shuffled[byte*count+i]=binary[i*width+byte];
 const compressed=gzipSync(shuffled,{level:9});
 const stem='src/features/landing/mini-office/lighting-data/campus-ltc-'+name+'.bin';
 writeFileSync(stem,binary);writeFileSync(stem+'.gz',compressed);
 metadata.tables[name]={bytes:binary.length,gzipBytes:compressed.length,sha256:createHash('sha256').update(binary).digest('hex')};
}
writeFileSync('src/features/landing/mini-office/lighting-data/metadata.json',JSON.stringify(metadata,null,2)+'\n');
writeFileSync('public/legal/three-ltc.txt','Losslessly extracted LTC lighting tables from Three.js 0.187.0 RectAreaLightTexturesLib.\nSource: https://github.com/mrdoob/three.js/blob/r187/examples/jsm/lights/RectAreaLightTexturesLib.js\nOriginal table reference: https://github.com/selfshadow/ltc_code/tree/master/fit/results/ltc.js\n\n'+readFileSync('node_modules/three/LICENSE','utf8'));
console.log(JSON.stringify(metadata,null,2));
