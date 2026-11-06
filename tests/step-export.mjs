import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import initOC from '../lib/cad/opencascade.js';
import { setOC,exportSTEP,measureVolume } from '../lib/cad/replicad.js?v=20261103c';
import { buildCadPanel, placeStepPart } from '../js/cad-solids.js?v=20261103d';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { panelBores } from '../js/panel-bores.js?v=20261103c';
import { computePanels,defaultCabinet } from '../js/cabinet-math.js';
import { frontLayout } from '../js/front-layout.js';

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
const recessed=computePanels(applyHardwarePreset(defaultCabinet(),'handle-hettich-9071060')).find(p=>p.type==='door');
const pocket=recessed.grooves.find(g=>g.purpose==='handle-recess');
assert.deepEqual([pocket.width,pocket.height,pocket.depth,pocket.face],[30.5,107.2,11.2,'front']);
const handleBores=panelBores(recessed).filter(b=>b.purpose.startsWith('handle'));
assert.equal(handleBores.filter(b=>b.radius===1.5 && b.direction[2]===1).length,4);
assert.equal(handleBores.filter(b=>b.radius===2.5 && b.direction[2]===-1).length,2);
const recessedOnly={...recessed,holes:handleBores.map(b=>b.source)};
const recessedSolid=buildCadPanel(recessedOnly);
const removedPocket=(pocket.width*pocket.height+3*Math.PI*1.5**2)*pocket.depth;
const removedScrewHoles=2*Math.PI*2.5**2*(recessed.sizeZ-pocket.depth);
near(recessed.sizeX*recessed.sizeY*recessed.sizeZ-measureVolume(recessedSolid),removedPocket+removedScrewHoles);
recessedSolid.delete();
const touchConfig=applyHardwarePreset(defaultCabinet(),'handle-hettich-9086690');
touchConfig.materials.doorThickness=19;
const touchDoor=computePanels(touchConfig).find(p=>p.type==='door');
const touchBores=panelBores(touchDoor).filter(b=>b.purpose.startsWith('handle'));
assert.deepEqual(touchBores.map(b=>b.start[2]+b.direction[2]*b.depth),[6.5,6.5,6.5]);
const touchSolid=buildCadPanel({...touchDoor,holes:touchBores.map(b=>b.source)});
near(touchDoor.sizeX*touchDoor.sizeY*19-measureVolume(touchSolid),
  Math.PI*45**2*16+2*Math.PI*2.5**2*3);
touchSolid.delete();
const undermountPresets={
 tandem:'runner-blum-563h',tandemThick:'runner-blum-563f',movento:'runner-blum-763h',
 quadro2d:'runner-hettich-quadro-2d',quadro5d:'runner-hettich-quadro-5d',richelieu:'runner-richelieu-828',
 quadroHandFit:'runner-hettich-quadro-2d',
};
const runnerPilotCounts={tandem:5,tandemThick:5,movento:5,quadro2d:4,quadro5d:4,quadroHandFit:3,richelieu:0};
const sensys95={
 b1:['9090260',19,28,4,'full-overlay',37],
 b2:['9090260',22,32,6,'full-overlay',37],
 b3:['9090270',19,28,4,'partial-overlay',37],
 b4:['9090280',19,22,2,'inset',60],
};
for (const type of ['doors','drawers','grooves','dados','dowels','cams','cabineo','blum','blum19','blumInset',...Object.keys(sensys95),...Object.keys(undermountPresets)]) {
 let c=defaultCabinet();
 if(type==='dowels')c=applyHardwarePreset(c,'dowel-8x30');
 if(type==='cams')c=applyHardwarePreset(c,'rastex-18');
 if(type==='cabineo')c=applyHardwarePreset(c,'cabineo-8');
 if(type==='blum')c=applyHardwarePreset(c,'hinge-blum-71b3550');
 if(type==='blum19'){
  c=applyHardwarePreset(c,'hinge-blum-71b3550-19mm');
  c.materials.caseThickness=c.materials.doorThickness=19;
  c.reveal=4;
 }
 if(type==='blumInset'){
  c=applyHardwarePreset(c,'hinge-blum-71b3750');
  c.overlay.type='inset';
  c.reveal=4;
 }
 if(type.startsWith('blum')) c.shelves.count=0;
 const sensys=sensys95[type];
 if(sensys) {
  const [sku,caseThickness,doorThickness,reveal,overlay]=sensys;
  c=applyHardwarePreset(c,`hinge-hettich-${sku}-${type}`);
  Object.assign(c.materials,{caseThickness,doorThickness});
  c.reveal=reveal;
  c.overlay={type:overlay,amount:9.5};
 }
 const undermount=undermountPresets[type];
 if(undermount) {
  c=applyHardwarePreset(c,undermount);
  c.front.mode='drawers';c.drawers.count=1;c.drawers.heights=[frontLayout(c).height];
  c.hardware.runnerLength=457;c.drawers.sideThickness=type==='tandemThick'?18:12;
  if(type.startsWith('quadro') || type==='richelieu')c.drawers.sideThickness=16;
  if(type==='quadro2d')c.hardware.quadroManualMiddle=false;
  if(type==='richelieu')c.hardware.runnerLength=450;
 }
 if(type==='drawers'){c.front.mode='drawers';c.drawers.count=2;c.drawers.heights=[305.5,305.5];}
 if(type==='grooves')c.backMount='grooved-in';
 if(type==='dados'){c.hardware.joineryType='dado';c.hardware.dadoDepth=6;c.hardware.dadoClearance=0.2;}
 const panels=computePanels(c);
 if(undermount) {
  assert.equal(panels.flatMap(p=>p.grooves).filter(g=>g.purpose==='drawer-bottom-groove').length,2);
  assert.equal(panels.flatMap(p=>p.holes).filter(h=>h.purpose.endsWith('-rear-hook')).length,type==='richelieu'?0:2);
  if(type==='richelieu') {
   const back=panels.find(p=>p.id==='drawer-1-back');
   assert.deepEqual(back.notches.map(n=>[n.width,n.height]),[[37,12.7],[37,12.7]]);
   assert.ok(panels.every(p=>p.holes.every(h=>!h.purpose.startsWith('richelieu-'))));
  }
 }
 const parts=panels.map(p=>{
  const local=buildCadPanel(p);
  try {
   if(undermount && p.type==='drawer-box') {
    const grooves=p.grooves.filter(g=>g.purpose==='drawer-bottom-groove');
    const hooks=p.holes.filter(h=>h.purpose.endsWith('-rear-hook'));
    const reference=buildCadPanel({...p,grooves:[],holes:[],notches:[]});
    try {
     const removed=grooves.reduce((sum,g)=>sum+g.width*g.height*g.depth,0)
       + hooks.reduce((sum,h)=>sum+Math.PI*(h.diameter/2)**2*h.depth,0)
       + (p.notches || []).reduce((sum,n)=>sum+n.width*n.height*p.cutThickness,0);
     near(measureVolume(reference)-measureVolume(local),removed);
    } finally {reference.delete();}
   }
   const cabinetSide=/^side-(left|right)$/.test(p.id);
   const blum=type.startsWith('blum');
   const matchedHinge=blum || Boolean(sensys);
   if ((matchedHinge && (p.type==='door' || cabinetSide)) || (undermount && cabinetSide)) {
    const isCheckedHole=h=>matchedHinge?h.purpose.startsWith('hinge-'):h.purpose.endsWith('-runner-mount');
    const holes=p.holes.filter(isCheckedHole);
    const expectedCount=matchedHinge?(p.type==='door'?6:4):runnerPilotCounts[type];
    assert.equal(holes.length,expectedCount,`${type} ${p.id}`);
    if (blum) {
     const axis=cabinetSide ? 0 : 2;
     const inside=p.id==='side-right' ? -1 : 1;
     const opening=inside*(cabinetSide ? p.sizeX : p.sizeZ)/2;
     const expectedDepths=cabinetSide ? [3,3,3,3] : [3,3,3,3,13,13];
     const depths=[];
     for (const face of local.faces) {
      try {
       if (face.geomType!=='CYLINDRE') continue;
       const bounds=face.boundingBox;
       try {
        const [lo,hi]=bounds.bounds;
        // Handle through-bores are outside this blind-bore check.
        const depth=hi[axis]-lo[axis];
        if (depth>=p.cutThickness-0.001) continue;
        near(inside>0 ? hi[axis] : lo[axis],opening);
        depths.push(Math.round(depth*1000)/1000);
       } finally {bounds.delete();}
      } finally {face.delete();}
     }
     assert.deepEqual(depths.sort((a,b)=>a-b),expectedDepths,`${type} ${p.id}`);
    }
    if(sensys && cabinetSide) {
     const row=sensys[5];
     assert.ok(holes.every(h=>h.x===(p.id==='side-left'?row:p.cutWidth-row) && h.depth===12));
    }
    const reference=buildCadPanel({...p,holes:p.holes.filter(h=>!isCheckedHole(h))});
    try {
     // Blum woodWOP specifies a Ø35 × 13 cup and Ø2.5 × 3 starter pilots.
     const removed=blum
      ? Math.PI*(p.type==='door' ? 2*17.5**2*13+4*1.25**2*3 : 4*1.25**2*3)
      : holes.reduce((sum,h)=>sum+Math.PI*(h.diameter/2)**2*h.depth,0);
     near(measureVolume(reference)-measureVolume(local),removed);
    } finally {reference.delete();}
   }
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
