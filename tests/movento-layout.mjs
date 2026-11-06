import assert from 'node:assert/strict';
import {defaultCabinet,computePanels} from '../js/cabinet-math.js';
import {applyHardwarePreset,hardwareBom,selectedHardware} from '../js/hardware-library.js';
import {frontLayout,rearInset} from '../js/front-layout.js';
import {panelBores} from '../js/panel-bores.js';
import {panelSolidData} from '../js/panel-solid.js';
import {MOVENTO_763H} from '../js/blum-runner-layout.js';
import {createProjectFromConfig,normalizeProject,buildProjectPanels} from '../js/project-io.js';
import {applyGlobalMaterialSelections,sharedStockChoices} from '../js/material-presets.js';
globalThis.window = { JSZip: (await import('../lib/jszip.min.js')).default };
const {downloadManufacturingZip}=await import('../js/dxf-writer.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
function config(length=457,t=12.7,overlay='full-overlay') {
  const c=applyHardwarePreset(defaultCabinet(),'runner-blum-763h');
  c.depth=800;c.height=1000;c.front.mode='drawers';c.drawers.count=2;
  c.hardware.runnerLength=length;c.drawers.sideThickness=t;c.overlay.type=overlay;
  c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
  return c;
}
assert.deepEqual(Object.keys(MOVENTO_763H),['305','381','457','533']);
assert.deepEqual(Object.values(MOVENTO_763H).map(s=>[s.minimumDepth,s.runnerLength]),[[328,319],[404,395],[480,471],[557,548]]);
for (const [length, minimumDepth] of [[305,328],[381,404],[457,480],[533,557]]) {
  const draft=config(length);
  draft.backMount='grooved-in';
  draft.depth=minimumDepth+draft.materials.doorThickness+rearInset(draft);
  assert.ok(computePanels(draft).some(panel=>panel.type==='drawer-box'), `${length} mm at the minimum depth`);
  draft.depth-=0.1;
  const shallow=computePanels(draft);
  assert.ok(shallow.every(panel=>panel.type!=='drawer-box'));
  assert.ok(shallow.every(panel=>panel.holes.every(hole=>hole.purpose!=='movento-runner-mount')));
  assert.ok(hardwareBom(draft,shallow).every(row=>row.unit!=='runner pairs'));
}
// Blum MOVENTO 2026, p. 13. Upper fixing row, measured from the cabinet front.
const publishedMounts = {
  305: [10,37,69,165,261],
  381: [10,37,69,165,357],
  457: [10,37,69,261,453],
  533: [10,37,69,261,517],
};
const travelByLength = {305:288,381:374.3,457:457,533:533};
for (const [fraction, mm] of [['15/32',11.90625],['5/8',15.875]]) {
  const stock = sharedStockChoices().thicknesses.find(choice => choice.value === `imperial:${fraction}`);
  assert.equal(stock.thickness, mm);
  const draft = config();
  draft.materials.stockSelections = {'drawer-side':{...stock,material:'Birch Ply'}};
  draft.materials = applyGlobalMaterialSelections(draft.materials,draft.drawers);
  draft.drawers.sideThickness = draft.materials.drawerSideThickness;
  const saved = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  assert.equal(saved.drawers.sideThickness, mm);
  const panels = computePanels(saved);
  assert.equal(panels.find(panel => panel.id === 'drawer-1-back').cutThickness, mm);
  assert.equal(hardwareBom(saved,panels).some(row => row.item === 'Blum T59.K010M'), mm <= 13);
}
for(const length of [305,381,457,533]) for(const t of [11.90625,12,12.7,13,15,16]) for(const overlay of ['full-overlay','inset']) {
  let c=config(length,t,overlay);
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  assert.ok(selectedHardware(c).some(p=>p.id==='runner-blum-763h'));
  const panels=computePanels(c),layout=frontLayout(c),opening=c.width-2*c.materials.caseThickness;
  assert.equal(panels[0].hardwareWarnings.some(w=>w.includes('Actual stroke is unverified')),length===457);
  const articleDepth = {305:323,381:399,533:551}[length];
  assert.equal(panels[0].hardwareWarnings.some(w=>w.includes('article sheet gives')),Boolean(articleDepth && overlay==='full-overlay'));
  if (articleDepth && overlay==='full-overlay') {
    assert.ok(panels[0].hardwareWarnings.some(w=>w.includes(`${articleDepth} mm minimum internal depth`)
      && w.includes(`overlay installation layout uses ${MOVENTO_763H[length].minimumDepth} mm`)));
  }
  assert.equal(panels.filter(p=>p.type==='drawer-box').length,10);
  assert.ok(!panels.flatMap(p=>p.holes).some(h=>/reference|tandem-/.test(h.purpose)));
  for(let i=1;i<=2;i++) {
    const left=panels.find(p=>p.id===`drawer-${i}-side-left`),right=panels.find(p=>p.id===`drawer-${i}-side-right`);
    const back=panels.find(p=>p.id===`drawer-${i}-back`),bottom=panels.find(p=>p.id===`drawer-${i}-bottom`);
    const front=panels.find(p=>p.id===`drawer-${i}`),inner=panels.find(p=>p.id===`drawer-${i}-inner-front`);
    near(front.drawDepth,length);
    near(front.runnerTravel,travelByLength[length]);
    near(front.posZ+front.sizeZ/2,c.overlay.type==='inset'?c.materials.doorThickness:0);
    near(inner.posZ-inner.sizeZ/2,front.posZ+front.sizeZ/2);
    const lower=left.posY-left.sizeY/2;
    near(back.cutWidth,opening-42);
    near(right.posX-right.sizeX/2-left.posX-left.sizeX/2,opening-42);
    near(bottom.posY-bottom.sizeY/2-lower,13);
    const locks = inner.hardwareModels ?? [];
    assert.deepEqual(locks.map(p => p.model), t>13 ? ['blum-t51.7601l','blum-t51.7601r'] : []);
    for (const [index, lock] of locks.entries()) {
      near(inner.posX+lock.x, index===0 ? left.posX+left.sizeX/2 : right.posX-right.sizeX/2);
      near(inner.posY+lock.y,bottom.posY-bottom.sizeY/2);
      near(inner.posZ+lock.z,inner.posZ+inner.sizeZ/2);
    }
    if(i===1) assert.ok(lower-(c.toeKick.height+c.materials.caseThickness)>=16-0.001);
    if(i===2) assert.ok(c.height-c.materials.caseThickness-left.posY-left.sizeY/2>=7-0.001);
    const bores=panelBores(back);
    assert.equal(bores.length,2);
    bores.forEach(b=>{assert.equal(b.purpose,'movento-rear-hook');near(b.radius,3);near(b.depth,10);near(back.posY+b.start[1]-lower,24);});
    near(panelSolidData(left).volume,left.sizeX*left.sizeY*left.sizeZ-(length-2*t)*bottom.sizeY*3);
    for(const side of panels.filter(p=>['side-left','side-right'].includes(p.id))) {
      const mounts=panelBores(side).filter(b=>b.purpose==='movento-runner-mount' && Math.abs(side.posY+b.start[1]-lower-22)<0.001);
      assert.equal(mounts.length,5);
      const insetOffset=c.overlay.type==='inset'?t-16:0;
      mounts.forEach((b,j)=>near(side.posZ+b.start[2],layout.boxFront+publishedMounts[length][j]+insetOffset));
    }
  }
  const bom=hardwareBom(c,panels);
  assert.equal(bom.find(r=>r.unit==='runner pairs').item,`Blum ${MOVENTO_763H[length].part}`);
  assert.equal(bom.find(r=>r.unit==='locking-device pairs').item,'Blum T51.7601L + T51.7601R');
  assert.ok(!bom.some(r=>r.item.includes('T51.1901')));
  assert.equal(bom.filter(r=>r.item==='Blum T59.K010M').length,t<=13?1:0);
  if(t<=13) assert.equal(bom.find(r=>r.item==='Blum T59.K010M').quantity,4);
  const lockScrews=bom.find(r=>r.unit==='locking-device screws');
  assert.equal(bom.find(r=>r.unit==='runner mounting screws').quantity,20);
  assert.equal(lockScrews.item,t<=13?'Blum 6064N':'Blum 606N or 606P');
  assert.equal(lockScrews.quantity,8);
  assert.ok(lockScrews.note.includes(t<=13?'#6 × 19 mm #2 Phillips':'#6 × 16 mm'));
  for (const front of panels.filter(p=>p.id.endsWith('-inner-front'))) {
    const setup=front.hardwareWarnings.join(' ');
    assert.match(setup,/flush (against|with) the drawer bottom/);
    assert.ok(setup.includes(t<=13?'Blum 6064N':'two Blum 606N or 606P screws'));
  }
}
const inset=config(457,12,'inset');
inset.depth=471+inset.materials.doorThickness+12-13+6;
assert.ok(computePanels(inset).some(p=>p.type==='drawer-box'));
inset.depth-=1;
assert.ok(!computePanels(inset).some(p=>p.type==='drawer-box'));
// Flush-bottom reference changes by exactly 1 mm, while drawer-bottom clearance changes by 2 mm.
const c=config(),movento=computePanels(c);
c.hardware.runnerMode='blum-tandem-563h';const tandem=computePanels(c);
near(movento.find(p=>p.id==='drawer-1-side-left').posY-movento.find(p=>p.id==='drawer-1-side-left').sizeY/2
  -tandem.find(p=>p.id==='drawer-1-side-left').posY+tandem.find(p=>p.id==='drawer-1-side-left').sizeY/2,2);
near(movento.find(p=>p.id==='side-left').holes.find(h=>h.purpose==='movento-runner-mount').y
  -tandem.find(p=>p.id==='side-left').holes.find(h=>h.purpose==='tandem-runner-mount').y,1);
for(const mutate of [c=>c.construction='face-frame',c=>c.hardware.runnerLength=229,c=>c.drawers.sideThickness=18,c=>c.drawers.sideThickness=11.9,c=>c.width=200,c=>c.depth=400]) {
  const c=config();mutate(c);const panels=computePanels(c);
  assert.equal(panels.filter(p=>p.type==='drawer-box').length,0);
  assert.ok(panels[0].hardwareWarnings.some(w=>w.includes('MOVENTO 763H boxes omitted')));
}
let downloaded;globalThis.URL.createObjectURL=b=>{downloaded=b;return 'blob:movento';};globalThis.URL.revokeObjectURL=()=>{};
globalThis.document={createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}};
const project=createProjectFromConfig(config());project.cabinets[0].qty=2;
project.cabinets.push({id:'standard-movento',name:'Standard MOVENTO',qty:1,config:config(533,16)});
await downloadManufacturingZip({config:project.cabinets[0].config,project,panels:buildProjectPanels(project)});
const zip=await window.JSZip.loadAsync(await downloaded.arrayBuffer()),manifest=await zip.file('manifest.txt').async('string');
assert.ok(manifest.includes('763H4570S'));assert.ok(manifest.includes('T51.7601L + T51.7601R'));assert.ok(manifest.includes('T59.K010M'));
assert.ok(manifest.includes('8 locking-device screws: Blum 6064N'));
assert.match(manifest,/20 runner mounting screws: Blum 606N or 606P/);
const projectManifest=await zip.file('project-manifest.txt').async('string');
assert.ok(projectManifest.includes('Hardware per cabinet (multiply by 2)'));
assert.ok(projectManifest.includes('8 locking-device screws: Blum 6064N'));
assert.match(projectManifest,/20 runner mounting screws: Blum 606N or 606P/);
const standardManifest=projectManifest.split('Hardware per cabinet (multiply by 1):')[1];
assert.match(standardManifest,/8 locking-device screws: Blum 606N or 606P/);
assert.doesNotMatch(standardManifest,/6064N|locking-device spacers:/);
const schedule=JSON.parse(await zip.file('machining-schedule.json').async('string'));
const runnerSides=schedule.panels.filter(p=>p.faceBores.some(h=>h.purpose==='movento-runner-mount'));
assert.equal(runnerSides.length,6);
assert.ok(runnerSides.every(p=>p.warnings.some(w=>/763H(4570|5330)S.*five specified fixing centres.*±4\.5 mm depth adjustment/.test(w))));
const innerFronts=schedule.panels.filter(p=>p.id.endsWith('-inner-front'));
assert.equal(innerFronts.length,6);
assert.ok(innerFronts.every(p=>p.faceBores.length===0 &&
  p.warnings.some(w=>/T65\.1600\.01.*Ø2\.5 × 10 mm.*T51\.7601L\/R.*75°/.test(w))));
assert.equal(innerFronts.filter(p=>p.warnings.some(w=>/T59\.K010M.*6064N/.test(w))).length,4);
assert.equal(innerFronts.filter(p=>p.warnings.some(w=>/reduce the runner setback and screw positions by 3 mm/.test(w))).length,4);
const standardFronts=innerFronts.filter(p=>p.id.startsWith('standard-movento__'));
assert.equal(standardFronts.length,2);
assert.ok(standardFronts.every(p=>
  p.warnings.some(w=>w.includes('two Blum 606N or 606P screws')) && p.warnings.every(w=>!w.includes('6064N'))));
assert.equal(schedule.panels.flatMap(p=>p.faceBores).filter(h=>h.purpose==='movento-rear-hook').length,12);
assert.equal(schedule.panels.flatMap(p=>p.faceBores).filter(h=>h.purpose==='movento-runner-mount').length,60);
for (const part of [...runnerSides,...innerFronts,
  ...schedule.panels.filter(p=>p.faceBores.some(h=>h.purpose==='movento-rear-hook'))]) {
  const path=Object.keys(zip.files).find(name=>name.startsWith('parts/') && name.endsWith(`-${part.id}.dxf`));
  assert.ok(path,part.id);
  const dxf=await zip.file(path).async('string');
  const drillLayers=[...dxf.matchAll(/\n0\nCIRCLE\n8\n([^\n]+)/g)].map(match=>match[1]);
  if (innerFronts.includes(part)) assert.deepEqual(drillLayers,[],part.id);
  else if (runnerSides.includes(part)) {
    assert.equal(drillLayers.filter(layer=>layer==='DRILL_INSIDE_D8MM').length,10,part.id);
  } else assert.deepEqual(drillLayers,['DRILL_BACK_D10MM','DRILL_BACK_D10MM'],part.id);
}
console.log('PASS: 48 MOVENTO assemblies, exact 15/32-inch stock, mounting rows, spacers, saved presets, ZIP output and invalid-fit guards');
