import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import initOC from '../lib/cad/opencascade.js';
import { setOC,exportSTEP,measureVolume } from '../lib/cad/replicad.js?v=20261103c';
import { buildCadPanel, placeStepPart } from '../js/cad-solids.js?v=20261103d';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { panelBores } from '../js/panel-bores.js?v=20261103c';
import { computePanels,defaultCabinet } from '../js/cabinet-math.js';

setOC(await initOC({print:()=>{},wasmBinary:readFileSync(new URL('../lib/cad/replicad_single.wasm',import.meta.url))}));
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
const cube={id:'door-1',name:'Bored door',type:'door',sizeX:400,sizeY:600,sizeZ:18,cutWidth:400,cutHeight:600,cutThickness:18,posX:200,posY:300,posZ:-9,grooves:[],notches:[],holes:[
 {x:22,y:100,diameter:35,depth:13,face:'back',purpose:'hinge-cup'},
 {x:200,y:300,diameter:5,depth:18,face:'front',purpose:'handle'},
 {x:300,y:300,diameter:3,purpose:'drawer-slide-reference'},
]};
const solid=buildCadPanel(cube);
near(measureVolume(solid),400*600*18-Math.PI*17.5**2*13-Math.PI*2.5**2*18);
assert.equal(panelBores(cube).length,2);
solid.delete();
for (const type of ['doors','drawers','grooves','dados','dowels','cams','cabineo']) {
 let c=defaultCabinet();
 if(type==='dowels')c=applyHardwarePreset(c,'dowel-8x30');
 if(type==='cams')c=applyHardwarePreset(c,'rastex-18');
 if(type==='cabineo')c=applyHardwarePreset(c,'cabineo-8');
 if(type==='drawers'){c.front.mode='drawers';c.drawers.count=2;c.drawers.heights=[305.5,305.5];}
 if(type==='grooves')c.backMount='grooved-in';
 if(type==='dados'){c.hardware.joineryType='dado';c.hardware.dadoDepth=6;c.hardware.dadoClearance=0.2;}
 const panels=computePanels(c);
 const parts=panels.map(p=>{
  const local=buildCadPanel(p);
  try {
   const shape=placeStepPart(local,p),[lo,hi]=shape.boundingBox.bounds;
   const expected=[p.posX-p.sizeX/2,-p.posZ-p.sizeZ/2,p.posY-p.sizeY/2];
   const extent=[p.sizeX,p.sizeZ,p.sizeY];
   for(let i=0;i<3;i++){near(lo[i],expected[i]);near(hi[i],expected[i]+extent[i]);}
   // Export placement must leave cached viewer geometry in its original axes.
   const [originalLo,originalHi]=local.boundingBox.bounds;
   near(originalLo[1],-p.sizeY/2);near(originalHi[1],p.sizeY/2);
   return {shape,name:p.name};
  } finally{local.delete();}
 });
 try {
  const step=await exportSTEP(parts,{unit:'MM',modelUnit:'MM'}).text();
  assert.ok(step.startsWith('ISO-10303-21;'));
  assert.ok(step.includes('CYLINDRICAL_SURFACE'));
  assert.ok(step.includes('SI_UNIT(.MILLI.,.METRE.)'));
  for(const p of panels)assert.ok(step.includes(p.name));
  if(process.argv.includes('--fixtures')){
   mkdirSync('tmp/step-fixtures',{recursive:true});
   writeFileSync(`tmp/step-fixtures/${type}.step`,step);
   writeFileSync(`tmp/step-fixtures/${type}.json`,JSON.stringify(panels.map((p,i)=>({name:p.name,volume:measureVolume(parts[i].shape),bounds:[p.posX-p.sizeX/2,p.posX+p.sizeX/2,-p.posZ-p.sizeZ/2,-p.posZ+p.sizeZ/2,p.posY-p.sizeY/2,p.posY+p.sizeY/2]}))));
  }
 } finally{for(const p of parts)p.shape.delete();}
}
assert.throws(()=>buildCadPanel({name:'invalid',sizeX:NaN}),/Invalid panel/);
console.log('PASS: exact blind and through-bore volumes, reference marks excluded, STEP named solids with analytical cylindrical surfaces and mm units; Z-up placement preserves cached viewer solids');
