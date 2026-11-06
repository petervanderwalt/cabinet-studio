import assert from 'node:assert/strict';
import {defaultCabinet,computePanels,validateCabinet} from '../js/cabinet-math.js';
import {applyHardwarePreset,hardwareBom,selectedHardware} from '../js/hardware-library.js';
import {HARDWARE_MODELS} from '../js/hardware-models.js';
import {panelBores} from '../js/panel-bores.js';
import {createProjectFromConfig,normalizeProject} from '../js/project-io.js';
globalThis.window={};
const {panelToDxf,machiningSchedule}=await import('../js/dxf-writer.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
assert.deepEqual(HARDWARE_MODELS['hettich-9071576'].bounds[2], [-28.4, 22.6]);
for(const id of ['hettich-9071207','hettich-9071576']) {
  const model=HARDWARE_MODELS[id];
  assert.ok(model.positions.length>0 && model.positions.length%9===0 && model.positions.every(Number.isFinite));
  for(let axis=0;axis<3;axis++) {
    const values=model.positions.filter((_,i)=>i%3===axis);
    near(Math.min(...values),model.bounds[axis][0]);near(Math.max(...values),model.bounds[axis][1]);
  }
}
for (const [preset,thickness,reveal,cupInset,plateRow] of [
  ['hinge-hettich-9071207',18,3,21.5,56],
  ['hinge-hettich-9071207-a5',19,2,22,57],
]) for(const height of [720,1350,1600]) for(const category of ['base','wall']) for(const side of ['left','right','both']) {
  let c=applyHardwarePreset(defaultCabinet(),preset);
  c.materials.caseThickness=thickness;c.materials.doorThickness=thickness;c.reveal=reveal;
  c.overlay.type='inset';c.category=category;c.height=height;c.doors.count=side==='both'?2:1;c.doors.hingeSide=side;
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  assert.equal(selectedHardware(c).find(p=>p.category==='hingePlate').id,'plate-hettich-9071576');
  const panels=computePanels(c),doors=panels.filter(p=>p.type==='door');
  assert.ok(validateCabinet(c).every(w=>!w.includes('hinge') && !w.includes('Sensys')));
  for(const door of doors) {
    const sign=door.hingeSide==='right'?-1:1,wall=panels.find(p=>p.id===(sign===1?'side-left':'side-right'));
    const cups=door.holes.filter(h=>h.purpose==='hinge-cup'),fixings=door.holes.filter(h=>h.purpose==='hinge-cup-fixing');
    assert.equal(fixings.length,cups.length*2);
    for(const cup of cups) {
      near(sign===1?cup.x:door.cutWidth-cup.x,cupInset);
      near(cupInset-17.5-4+c.reveal/2,1.5,'D = C + B + F');
      for(const dy of [-26,26]) assert.ok(fixings.some(h=>Math.abs(h.x-cup.x-sign*5.5)<0.001 && Math.abs(h.y-cup.y-dy)<0.001));
      const globalY=door.posY+cup.y-door.cutHeight/2;
      const plate=wall.holes.filter(h=>h.purpose==='hinge-mounting-plate');
      for(const dy of [-16,16]) assert.ok(plate.some(h=>Math.abs((sign===1?h.x:wall.cutWidth-h.x)-plateRow)<0.001
        && Math.abs(wall.posY+h.y-wall.cutHeight/2-globalY-dy)<0.001));
    }
    assert.match(panelToDxf(door),/DRILL_BACK_D12\.8MM/);
    assert.ok(machiningSchedule([door]).panels[0].faceBores.some(h=>h.purpose==='hinge-cup-fixing'));
  }
  for(const p of panels) for(const placement of p.hardwareModels||[]) {
    const model=HARDWARE_MODELS[placement.model];
    assert.equal(model.partNumber,p.type==='door'?'9071207':'9071576');
    const bores=panelBores(p).filter(b=>b.purpose===(p.type==='door'?'hinge-cup-fixing':'hinge-mounting-plate'));
    for(const [x,y,z] of model.mountingCentres) assert.ok(bores.some(b=>
      Math.abs(b.start[0]-placement.x-x*placement.mirrorX)<0.001
      && Math.abs(b.start[1]-placement.y-y)<0.001 && Math.abs(b.start[2]-placement.z-z)<0.001));
    if(p.type==='door') assert.equal(placement.closedOnly,true);
  }
  const bom=hardwareBom(c,panels).find(r=>r.unit==='hinge / plate sets');
  assert.match(bom.item,/9071207/);assert.match(bom.item,/9071576/);
  assert.equal(bom.quantity,doors.reduce((n,p)=>n+p.holes.filter(h=>h.purpose==='hinge-cup').length,0));
  c.overlay.type='full-overlay';assert.ok(computePanels(c).every(p=>!p.hardwareModels));
  c.overlay.type='inset';c=applyHardwarePreset(c,'plate-hettich-9071575');
  assert.ok(computePanels(c).every(p=>!p.hardwareModels));
  assert.ok(validateCabinet(c).some(w=>w.includes('matching D1.5')));
}
let c=applyHardwarePreset(defaultCabinet(),'hinge-hettich-9071207');c.overlay.type='inset';
for(const edit of [x=>x.materials.doorThickness=19,x=>x.reveal=2,x=>x.hardware.hingeBoreInset=22,x=>x.construction='face-frame']) {
  const changed=structuredClone(c);edit(changed);assert.ok(computePanels(changed).every(p=>!p.hardwareModels));
}
c.hardware.hingeBoreInset=22;
assert.ok(!selectedHardware(c).some(p=>p.id==='hinge-hettich-9071207'));
console.log('PASS: 36 inset Sensys assemblies, D1.5 identity, 56 and 57 mm rows, mirrored CAD-to-bore alignment, saved presets, BOM, DXFs and custom/unsupported guards');

for (const [thickness,reveal,amount,sku='9071206',standOff=1.5] of [[18,3,9],[19,4,9.5],[19,4,9.5,'9099550',1],[19,4,9.5,'9099590',1]]) for (const category of ['base','wall']) for (const side of ['left','right']) {
  const config=applyHardwarePreset(defaultCabinet(),`hinge-hettich-${sku}${sku==='9099550'?'-e2':''}`);
  config.category=category;config.overlay.type='partial-overlay';config.overlay.amount=amount;
  config.materials.caseThickness=config.materials.doorThickness=thickness;config.reveal=reveal;
  config.doors.count=1;config.doors.hingeSide=side;
  const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config)))).cabinets[0].config;
  const panels=computePanels(saved);
  const door=panels.find(p=>p.type==='door'),wall=panels.find(p=>p.id===`side-${side}`);
  assert.equal(door.hingeSide,side);
  const wallInner=wall.posX+(side==='left'?1:-1)*wall.sizeX/2;
  const doorEdge=door.posX+(side==='left'?-1:1)*door.sizeX/2;
  near(Math.abs(wallInner-doorEdge),7.5);
  if (sku==='9099590') {
    assert.deepEqual(HARDWARE_MODELS['hettich-9099590'].mountingCentres,[[6,-24,0],[6,24,0]]);
    assert.ok(door.holes.filter(h=>h.purpose==='hinge-cup').every(h=>h.depth===11.6));
  }
  for (const model of door.hardwareModels) {
    near(Math.abs(door.posX+model.x-wallInner),14.5);
    near(door.posZ+model.z,-standOff);
  }
  for (const plate of wall.hardwareModels) near(wall.posZ+plate.z,37);
  for(const [panel,part,purpose] of [[door,sku,'hinge-cup-fixing'],[wall,'9071575','hinge-mounting-plate']]) {
    const bores=panelBores(panel).filter(b=>b.purpose===purpose);
    assert.equal(bores.length,4);
    assert.equal(panel.hardwareModels.length,2);
    for(const placement of panel.hardwareModels) {
      assert.equal(placement.model,`hettich-${part}`);
      for(const [x,y,z] of HARDWARE_MODELS[placement.model].mountingCentres) {
        assert.ok(bores.some(b=>Math.hypot(b.start[0]-placement.x-x*placement.mirrorX,
          b.start[1]-placement.y-y,b.start[2]-placement.z-z)<0.001));
      }
    }
  }
  assert.match(hardwareBom(saved,panels).find(r=>r.unit==='hinge / plate sets').item,new RegExp(`${sku}.*9071575`));
  assert.match(panelToDxf(door),/DRILL_BACK_D10MM/);
  saved.overlay.amount=8;
  const unsupported=computePanels(saved);
  assert.ok(unsupported.every(p=>!p.hardwareModels));
  assert.equal(hardwareBom(saved,unsupported).find(r=>r.unit==='hinge / plate sets').item,'Custom / existing');
}
console.log('PASS: half-overlay Sensys hand, 7.5 mm overlap, matched CAD/drilling, saved pair, BOM and override guard');
