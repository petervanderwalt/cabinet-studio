import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import initOC from '../lib/cad/opencascade.js';
import {setOC,measureVolume,exportSTEP} from '../lib/cad/replicad.js?v=20261103c';
import {buildCadPanel} from '../js/cad-solids.js?v=20261103d';
import {setDetailMachining} from '../js/detail-machining.js?v=20261103c';
import {defaultCabinet,computePanels,validateCabinet} from '../js/cabinet-math.js';
import {panelBores} from '../js/panel-bores.js?v=20261103c';
import {panelSolidData} from '../js/panel-solid.js';
globalThis.window ??= {};
const {panelToDxf} = await import('../js/dxf-writer.js');

setOC(await initOC({print:()=>{},wasmBinary:readFileSync(new URL('../lib/cad/replicad_single.wasm',import.meta.url))}));
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.002,`${a} != ${b}`);
const drawerBack = {
  id:'drawer-1-back', type:'drawer-box', name:'Drawer back', sizeX:300, sizeY:100, sizeZ:16,
  cutWidth:300, cutHeight:100, cutThickness:16, notches:[
    {x:0,y:0,width:37,height:12.7}, {x:263,y:0,width:37,height:12.7},
  ],
};
const backVolume = (300*100 - 2*37*12.7)*16;
near(panelSolidData(drawerBack).volume, backVolume);
const backSolid = buildCadPanel(drawerBack);
near(measureVolume(backSolid), backVolume);
backSolid.delete();
const backDxf = panelToDxf(drawerBack);
assert.match(backDxf, /\n10\n37\n20\n12\.7\n/);
assert.match(backDxf, /\n10\n263\n20\n12\.7\n/);
const panel={id:'door-1',name:'Test',type:'door',sizeX:100,sizeY:150,sizeZ:18,cutWidth:100,cutHeight:150,cutThickness:18,
  grooves:[],notches:[],holes:[],detailPaths:[[{x:50,y:25},{x:50,y:125}]],detailPathsClosed:false};
for(const angle of [60,90,120]) {
  setDetailMachining(panel,{detailTool:'v-bit',detailAngle:angle,detailDepth:2});
  const solid=buildCadPanel(panel),r=2*Math.tan(angle*Math.PI/360);
  near(270000-measureVolume(solid),100*2*r+Math.PI*r*r*2/3);
  solid.delete();
}
setDetailMachining(panel,{detailTool:'straight',detailDiameter:6,detailDepth:3});
let solid=buildCadPanel(panel);
assert.ok(Math.abs(270000-measureVolume(solid)-(100*6+Math.PI*9)*3)<0.5);solid.delete();

// Intersecting tools must be united, not passed as overlapping compound solids.
const overlapping={...panel,detailMachining:undefined,holes:[40,50].map(x=>({x,y:75,depth:5,diameter:15,face:'back',purpose:'hinge-cup'}))};
solid=buildCadPanel(overlapping);
const intersection=2*7.5**2*Math.acos(10/15)-5*Math.sqrt(4*7.5**2-100);
near(270000-measureVolume(solid),(2*Math.PI*7.5**2-intersection)*5);solid.delete();
const bores=panelBores(overlapping);
assert.equal(bores.length,2);assert.equal(bores[0].source,overlapping.holes[0]);

for(const tool of ['v-bit','straight']) for(const style of ['slats','rectangle','clipped','rounded','inward-rounded','arch','cathedral']) {
  const c=defaultCabinet();c.doors.count=1;
  Object.assign(c.doors,{detailTool:tool,detailStyle:style,detailInset:50,detailDepth:2,detailAngle:90,detailDiameter:6,detailSpacing:100});
  const p=computePanels(c).find(p=>p.type==='door');
  const base=buildCadPanel({...p,detailMachining:undefined}),baseVolume=measureVolume(base);base.delete();
  const shape=buildCadPanel(p),volume=measureVolume(shape);
  assert.ok(volume<baseVolume-1 && volume>baseVolume*.85,`${style}/${tool}: unexpected removed volume ${baseVolume-volume}`);
  if(process.argv.includes('--fixtures')) {
    mkdirSync('tmp/routing-fixtures',{recursive:true});
    const name=`${style}-${tool}`;
    const placed=shape.clone().translate([p.posX,p.posY,p.posZ]);
    const step=await exportSTEP([{shape:placed,name:p.name}],{unit:'MM',modelUnit:'MM'}).text();
    writeFileSync(`tmp/routing-fixtures/${name}.step`,step);
    writeFileSync(`tmp/routing-fixtures/${name}.json`,JSON.stringify({name:p.name,volume}));
    placed.delete();
  }
  shape.delete();
}
// Reported disappearance: two inward-rounded doors, 50 mm inset, 40 mm corners,
// 90-degree V-bit at 6 mm depth. Check front-facing mesh triangles, not just solids.
for (const depth of [2,6]) {
  const config=defaultCabinet();config.backMount='grooved-in';
  Object.assign(config.doors,{detailStyle:'inward-rounded',detailInset:50,detailSize:40,detailTool:'v-bit',detailDepth:depth,detailAngle:90});
  for (const p of computePanels(config).filter(p=>p.type==='door')) {
    const shape=buildCadPanel(p),mesh=shape.mesh({tolerance:0.08,angularTolerance:0.15});
    assert.ok(mesh.vertices.length>0 && mesh.triangles.length>0);
    assert.ok(mesh.vertices.every(Number.isFinite));
    let frontArea=0;
    for(let i=0;i<mesh.triangles.length;i+=3) {
      const tri=mesh.triangles.slice(i,i+3).map(index=>mesh.vertices.slice(index*3,index*3+3));
      if(tri.every(v=>Math.abs(v[2]+p.sizeZ/2)<1e-5)) {
        const [a,b,c]=tri;
        frontArea+=((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
      }
    }
    assert.ok(frontArea < -p.cutWidth*p.cutHeight*0.8,`${p.id} has no correctly oriented front face at depth ${depth}`);
    shape.delete();
  }
}
const c=defaultCabinet();c.doors.detailStyle='rectangle';c.doors.detailDepth=16;
assert.ok(validateCabinet(c).some(w=>w.includes('leave at least 3 mm')));
assert.ok(computePanels(c).filter(p=>p.type==='door').every(p=>!p.detailMachining));
const ref={...panel,detailMachining:undefined};setDetailMachining(ref,{detailTool:'annotation'});assert.equal(ref.detailMachining,undefined);
console.log('PASS: cutter angle/diameter/depth, exact slot volumes, overlapping cuts, 14 routed solids and minimum remaining thickness');
