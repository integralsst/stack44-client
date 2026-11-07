import * as THREE from 'three';
import floatPacked from './lighting-data/campus-ltc-f32.bin.gz?url';
import halfPacked from './lighting-data/campus-ltc-f16.bin.gz?url';
import floatRaw from './lighting-data/campus-ltc-f32.bin?url';
import halfRaw from './lighting-data/campus-ltc-f16.bin?url';

// Same lookup tables as RectAreaLightUniformsLib, losslessly stored as binary.
// App-lifetime cache avoids rebuilding global LTC textures on StrictMode/remount.
// Attribution and MIT notice: /legal/three-ltc.txt. Regenerate with scripts/campus-generate-ltc.mjs.
const pending=new Map<boolean,Promise<void>>();
export function prepareAreaTables(floatLinear:boolean):Promise<void>{
  const previous=pending.get(floatLinear);if(previous)return previous;
  const task=(async()=>{
    const decompress=typeof DecompressionStream!=='undefined';
    const response=await fetch(decompress?(floatLinear?floatPacked:halfPacked):(floatLinear?floatRaw:halfRaw));
    if(!response.ok)throw new Error('No se pudieron cargar las tablas de iluminación.');
    let buffer=await response.arrayBuffer();const header=new Uint8Array(buffer,0,2);
    // Also tolerate a host that transparently decodes a .gz response.
    if(header[0]===31&&header[1]===139){buffer=await new Response(new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}
    const count=64*64*4,bytes=floatLinear?4:2;
    if(decompress){const packed=new Uint8Array(buffer),raw=new Uint8Array(buffer.byteLength),elements=packed.length/bytes;
      for(let byte=0;byte<bytes;byte++)for(let i=0;i<elements;i++)raw[i*bytes+byte]=packed[byte*elements+i];buffer=raw.buffer;
    }
    if(buffer.byteLength!==count*bytes*2)throw new Error('Formato de iluminación no válido.');
    const uniforms=THREE.UniformsLib as unknown as Record<string,THREE.Texture>;
    for(let i=0;i<2;i++){
      const data=floatLinear?new Float32Array(buffer,i*count*bytes,count):new Uint16Array(buffer,i*count*bytes,count);
      const texture=new THREE.DataTexture(data,64,64,THREE.RGBAFormat,floatLinear?THREE.FloatType:THREE.HalfFloatType);
      texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.NearestFilter;texture.needsUpdate=true;
      uniforms[(floatLinear?'LTC_FLOAT_':'LTC_HALF_')+(i+1)]=texture;
    }
  })();pending.set(floatLinear,task);task.catch(()=>pending.delete(floatLinear));return task;
}
