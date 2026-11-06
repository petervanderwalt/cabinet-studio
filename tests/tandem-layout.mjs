import assert from 'node:assert/strict';
import {defaultCabinet,computePanels} from '../js/cabinet-math.js';
import {applyHardwarePreset,hardwareBom,selectedHardware} from '../js/hardware-library.js';
import {frontLayout} from '../js/front-layout.js';
import {panelBores} from '../js/panel-bores.js';
import {panelSolidData} from '../js/panel-solid.js';
import {TANDEM_563H} from '../js/blum-runner-layout.js';
import {createProjectFromConfig,normalizeProject,buildProjectPanels} from '../js/project-io.js';
globalThis.window = { JSZip: (await import('../lib/jszip.min.js')).default };
const {panelToDxf,downloadManufacturingZip,machiningSchedule}=await import('../js/dxf-writer.js');

const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
assert.deepEqual(Object.values(TANDEM_563H).map(s=>s.mounts),[
  [10,37,133,229],[10,37,69,165,261],[10,37,69,165,357],[10,37,69,261,453],[10,37,69,261,517],
]);
function config(length=457,t=12,overlay='full-overlay',preset='runner-blum-563h') {
  const c=applyHardwarePreset(defaultCabinet(),preset);
  c.depth=800;c.height=1000;c.front.mode='drawers';c.drawers.count=2;
  c.hardware.runnerLength=length;c.drawers.sideThickness=t;c.overlay.type=overlay;
  c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
  return c;
}
for(const thick of [false,true]) for(const length of Object.keys(TANDEM_563H).map(Number)) for(const t of (thick?[15.875,16,18,19,19.05]:[11.90625,12,12.7,16])) for(const overlay of ['full-overlay','inset']) {
  const preset=thick?'runner-blum-563f':'runner-blum-563h';
  const deduction=thick?49:42;
  const insetOffset=overlay==='inset'?t-(thick?17.5:14.5):0;
  let c=config(length,t,overlay,preset);
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  assert.ok(selectedHardware(c).some(p=>p.id===preset));
  const panels=computePanels(c),parts=panels.filter(p=>p.type==='drawer-box');
  assert.equal(parts.length,10);
  const runnerSide = panels.find(p=>p.id==='side-left');
  assert.ok(runnerSide.hardwareWarnings.some(w=>w.includes(`${length===229 ? 'four' : 'five'} specified fixing centres`)
    && w.includes('±4.5 mm depth adjustment')));
  const depthNote = panels[0].hardwareWarnings.find(warning => warning.includes('article sheet gives'));
  const expectedDepthNote = overlay === 'inset' ? undefined
    : length === 533 ? [555,557]
    : thick && length === 457 ? [479,480] : undefined;
  if (expectedDepthNote) {
    const [articleDepth, layoutDepth] = expectedDepthNote;
    assert.ok(depthNote.includes(`${articleDepth} mm minimum internal depth`));
    assert.ok(depthNote.includes(`overlay installation layout uses ${layoutDepth} mm`));
    const sides=machiningSchedule(panels).panels.filter(p=>p.faceBores.some(b=>b.purpose==='tandem-runner-mount'));
    assert.equal(sides.length,2);
    assert.ok(sides.every(p=>p.warnings.includes(depthNote)));
  } else assert.equal(depthNote, undefined);
  assert.ok(panels.flatMap(p=>p.holes).every(h=>!h.purpose?.includes('reference')));
  const opening=c.width-2*c.materials.caseThickness;
  for(let i=1;i<=2;i++) {
    const left=panels.find(p=>p.id===`drawer-${i}-side-left`),right=panels.find(p=>p.id===`drawer-${i}-side-right`);
    const back=panels.find(p=>p.id===`drawer-${i}-back`),bottom=panels.find(p=>p.id===`drawer-${i}-bottom`);
    const innerFront=panels.find(p=>p.id===`drawer-${i}-inner-front`),front=panels.find(p=>p.id===`drawer-${i}`);
    const lower=left.posY-left.sizeY/2;
    for(const side of panels.filter(p=>['side-left','side-right'].includes(p.id))) {
      const bores=panelBores(side).filter(b=>b.purpose==='tandem-runner-mount' && Math.abs(side.posY+b.start[1]-lower-23)<0.001);
      assert.equal(bores.length,TANDEM_563H[length].mounts.length);
      bores.forEach((b,j)=>{
        near(side.posZ+b.start[2],frontLayout(c).boxFront+TANDEM_563H[length].mounts[j]+insetOffset);
        near(b.depth,8);near(b.radius,1.5);
      });
    }
    near(back.cutWidth,opening-deduction);
    near(right.posX-right.sizeX/2-left.posX-left.sizeX/2,opening-deduction);
    near(left.posX-left.sizeX/2-c.materials.caseThickness,deduction/2-t);
    near(bottom.posY-bottom.sizeY/2-lower,13);
    near(back.posY-back.sizeY/2-lower,13);
    near(innerFront.posY+innerFront.sizeY/2,left.posY+left.sizeY/2);
    const travel = {229:thick?213:205,305:thick?281:276,381:362,457:451,533:530};
    near(bottom.sizeZ,length-2*t);near(front.drawDepth,length);near(front.runnerTravel,travel[length]);
    for(const side of [left,right]) {
      const expected=side.sizeX*side.sizeY*side.sizeZ-(length-2*t)*bottom.sizeY*3;
      near(panelSolidData(side).volume,expected);
      assert.ok(panelToDxf(side).includes('DRAWER_GROOVE_INSIDE_D3MM'));
    }
    const bores=panelBores(back);
    assert.equal(bores.length,2);
    bores.forEach((b,j)=>{
      assert.equal(b.purpose,'tandem-rear-hook');near(b.radius,3);near(b.depth,10);
      near(back.posY+b.start[1]-lower,24);near(b.start[2],t/2);
      assert.deepEqual(b.direction,[0,0,-1]);
      near(b.start[0]+back.sizeX/2,j?back.sizeX-7:7);
    });
    assert.ok(panelToDxf(back).includes('CIRCLE'));
    // Butt joints at the inner front/back; the bottom enters only the side grooves.
    near(bottom.posZ-bottom.sizeZ/2,innerFront.posZ+innerFront.sizeZ/2);
    near(front.posZ+front.sizeZ/2,innerFront.posZ-innerFront.sizeZ/2);
    near(front.posZ+front.sizeZ/2,overlay==='inset'?c.materials.doorThickness:-1.5);
    near(bottom.posZ+bottom.sizeZ/2,back.posZ-back.sizeZ/2);
  }
  if (length===229) {
    const exported=machiningSchedule(panels).panels.flatMap(p=>p.faceBores)
      .filter(h=>h.purpose==='tandem-runner-mount');
    assert.equal(exported.length,16,'four cabinet pilots per rail on both drawers');
  }
  const bom=hardwareBom(c,panels);
  assert.equal(bom.find(r=>r.unit==='runner pairs').item,`Blum ${TANDEM_563H[length].part.replace('563H',thick?'563F':'563H')}`);
  assert.equal(bom.find(r=>r.unit==='locking-device pairs').quantity,2);
  assert.ok(bom.find(r=>r.unit==='locking-device pairs').note.includes('75°'));
  const lockScrews=bom.find(r=>r.unit==='locking-device screws');
  assert.equal(bom.find(r=>r.unit==='runner mounting screws').quantity,length===229?16:20);
  assert.equal(lockScrews.item,'Blum 606N or 606P');
  assert.equal(lockScrews.quantity,8);
  assert.ok(panels[0].hardwareWarnings.some(w=>w.includes('not exported as face bores')));
}
for(const mutate of [c=>c.construction='face-frame',c=>c.drawers.sideThickness=18,c=>c.drawers.bottomThickness=0,
  c=>c.hardware.runnerLength=500,c=>c.depth=400,c=>c.hardware.runnerPilotDepth=100,c=>c.width=200]) {
  const c=config();mutate(c);const panels=computePanels(c);
  assert.equal(panels.filter(p=>p.type==='drawer-box').length,0);
  assert.ok(panels[0].hardwareWarnings.some(w=>w.includes('TANDEM 563H boxes omitted')));
}
for(const thickness of [15.8,19.1]) {
  const invalid=config(457,thickness,'full-overlay','runner-blum-563f');
  assert.ok(!computePanels(invalid).some(p=>p.type==='drawer-box'));
}
for(const [length,minimumDepth] of [[229,266],[305,328],[381,404],[457,480],[533,557]]) {
  for(const [preset,thickness] of [['runner-blum-563h',12],['runner-blum-563f',18]]) {
    const cabinet=config(length,thickness,'full-overlay',preset);
    cabinet.depth=minimumDepth+cabinet.materials.doorThickness;
    assert.ok(computePanels(cabinet).some(p=>p.type==='drawer-box'));
    cabinet.depth-=1;
    assert.ok(computePanels(cabinet).every(p=>p.type!=='drawer-box' && !p.holes.some(h=>h.purpose==='tandem-runner-mount')));
  }
}
const c=config();c.hardware.runnerMode='reference';
assert.ok(!computePanels(c).some(p=>p.id.includes('inner-front')),'custom reference drawers retain their original construction');
for(const [preset,thickness,offset] of [['runner-blum-563h',16,11.5],['runner-blum-563f',18,14.5]]) {
  const inset=config(457,thickness,'inset',preset);
  inset.depth=471+inset.materials.doorThickness+thickness-offset+6;
  assert.ok(computePanels(inset).some(p=>p.type==='drawer-box'));
  inset.depth-=1;
  assert.ok(!computePanels(inset).some(p=>p.type==='drawer-box'));
}
for(const preset of ['runner-blum-563h','runner-blum-563f','runner-blum-763h']) {
  for(const backMount of ['rear-strip','rear-strips','grooved-in']) {
    const cabinet=config(457,preset==='runner-blum-563f'?18:12,'full-overlay',preset);
    cabinet.backMount=backMount;
    const rear=backMount==='grooved-in'?cabinet.materials.backThickness:cabinet.materials.caseThickness;
    cabinet.depth=480+cabinet.materials.doorThickness+rear;
    assert.ok(computePanels(cabinet).some(p=>p.type==='drawer-box'));
    cabinet.depth-=1;
    const panels=computePanels(cabinet);
    assert.ok(panels.every(p=>p.type!=='drawer-box' && !p.holes.some(h=>h.purpose.endsWith('-runner-mount'))));
    assert.ok(!hardwareBom(cabinet,panels).some(r=>r.unit==='runner pairs'));
  }
}
let downloaded;
globalThis.URL.createObjectURL=blob=>{downloaded=blob;return 'blob:tandem-test';};
globalThis.URL.revokeObjectURL=()=>{};
globalThis.document={createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}};
for (const [family,stock] of [['563h',11.90625],['563f',19.05]]) {
  const project=createProjectFromConfig(config(457,stock,'full-overlay',`runner-blum-${family}`));project.cabinets[0].qty=2;
  await downloadManufacturingZip({config:project.cabinets[0].config,project,panels:buildProjectPanels(project)});
  const zip=await window.JSZip.loadAsync(await downloaded.arrayBuffer());
  const schedule=JSON.parse(await zip.file('machining-schedule.json').async('string'));
  const innerFronts=schedule.panels.filter(p=>p.id.endsWith('-inner-front'));
  assert.equal(innerFronts.length,4);
  assert.ok(innerFronts.every(p=>p.faceBores.length===0 &&
    p.warnings.some(w=>/T65\.1600\.01.*Ø2\.5 × 10 mm.*T51\.1901L\/R.*75°/.test(w))));
  assert.ok(innerFronts.every(p=>p.warnings.some(w=>/flush against the drawer bottom.*two Blum 606N or 606P screws/.test(w))));
  const drawerBacks=schedule.panels.filter(p=>p.faceBores.some(h=>h.purpose==='tandem-rear-hook'));
  assert.equal(drawerBacks.length,4);
  for (const back of drawerBacks) {
    assert.equal(back.thickness,stock);
    const hooks=back.faceBores.filter(h=>h.purpose==='tandem-rear-hook');
    assert.equal(hooks.length,2);
    assert.ok(hooks.every(h=>h.face==='back' && h.depth===10 && h.diameter===6));
    const path=Object.keys(zip.files).find(name=>name.startsWith('parts/') && name.endsWith(`-${back.id}.dxf`));
    assert.ok(path,back.id);
    const dxf=await zip.file(path).async('string');
    assert.equal((dxf.match(/CIRCLE\r?\n8\r?\nDRILL_BACK_D10MM/g) || []).length,2);
  }
  assert.equal(schedule.panels.flatMap(p=>p.faceBores).filter(h=>h.purpose==='tandem-runner-mount').length,40);
  const railSides=schedule.panels.filter(p=>p.faceBores.some(h=>h.purpose==='tandem-runner-mount'));
  assert.equal(railSides.length,4);
  assert.ok(railSides.every(p=>p.warnings.some(w=>w.includes(`${family.toUpperCase()}4570B`) &&
    /five specified fixing centres.*±4\.5 mm depth adjustment/.test(w))));
  const projectManifest=await zip.file('project-manifest.txt').async('string');
  assert.match(projectManifest,/Hardware per cabinet \(multiply by 2\)/);
  assert.match(projectManifest,/20 runner mounting screws: Blum 606N or 606P/);
  assert.match(await zip.file('manifest.txt').async('string'),/20 runner mounting screws: Blum 606N or 606P/);
  assert.ok((await zip.file('manifest.txt').async('string')).includes('T51.1901L + T51.1901R'));
  assert.ok((await zip.file('manifest.txt').async('string')).includes('75°'));
}
console.log('PASS: 90 TANDEM 563H/563F assemblies, five lengths, stock-dependent width, recessed bottoms, real side grooves, hook axes, saved presets, manual locking-device BOM and invalid-fit guards');
