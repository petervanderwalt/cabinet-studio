import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset, selectedHardware, hardwareBom } from '../js/hardware-library.js';
import { HARDWARE_MODELS } from '../js/hardware-models.js';
import { panelBores } from '../js/panel-bores.js?v=20261103c';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
globalThis.window = {};
const { panelToDxf, machiningSchedule } = await import('../js/dxf-writer.js');

const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
assert.deepEqual(HARDWARE_MODELS['hettich-9071575'].bounds[2], [-28.4, 22.6]);
for(const id of ['hettich-9071205','hettich-9071575']) {
  const model=HARDWARE_MODELS[id];
  assert.ok(model.positions.length>0 && model.positions.length%9===0);
  assert.ok(model.positions.every(Number.isFinite));
  for(let axis=0;axis<3;axis++) {
    const values=model.positions.filter((_,i)=>i%3===axis);
    near(Math.min(...values),model.bounds[axis][0]);near(Math.max(...values),model.bounds[axis][1]);
  }
}
for(const height of [720,1350,1600]) for(const category of ['base','wall']) for(const side of ['both','left','right']) {
  let c=applyHardwarePreset(defaultCabinet(),'hinge-hettich-9071205');
  c.height=height;c.category=category;c.doors.count=side==='both'?2:1;c.doors.hingeSide=side;
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  assert.equal(selectedHardware(c).find(p=>p.category==='hingePlate').id,'plate-hettich-9071575');
  const panels=computePanels(c);
  const cups=panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-cup'));
  const fixings=panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-cup-fixing'));
  const plates=panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-mounting-plate'));
  assert.equal(fixings.length,cups.length*2);assert.equal(plates.length,cups.length*2);
  for(const door of panels.filter(p=>p.type==='door')) {
    const sign=door.hingeSide==='right'?-1:1;
    const cup=door.holes.find(h=>h.purpose==='hinge-cup');
    assert.ok(door.holes.filter(h=>h.purpose==='hinge-cup-fixing').every(h=>
      Math.abs((h.x-cup.x)*sign-5.5)<0.001),'TH52 fixing line must be away from the door edge');
  }
  assert.ok(panels.every(p=>!(p.hardwareWarnings || []).length));
  const bom=hardwareBom(c,panels).find(r=>r.unit==='hinge / plate sets');
  assert.equal(bom.quantity,cups.length);assert.match(bom.item,/9071205/);assert.match(bom.item,/9071575/);
  for(const panel of panels) for(const placement of panel.hardwareModels || []) {
    const model=HARDWARE_MODELS[placement.model];
    const purpose=panel.type==='door'?'hinge-cup-fixing':'hinge-mounting-plate';
    const bores=panelBores(panel).filter(b=>b.purpose===purpose);
    for(const [x,y,z] of model.mountingCentres) assert.ok(bores.some(b=>
      Math.abs(b.start[0]-(placement.x+x*placement.mirrorX))<0.001 &&
      Math.abs(b.start[1]-(placement.y+y))<0.001 &&
      Math.abs(b.start[2]-(placement.z+z))<0.001),'CAD fixing axes must coincide with the generated bores');
    if(panel.type==='door')assert.equal(placement.closedOnly,true);
  }
  c.materials.caseThickness=19.05;
  assert.ok(computePanels(c).every(p=>!p.hardwareModels));
  assert.ok(validateCabinet(c).some(w=>w.includes('Sensys CAD')));
  c.materials.caseThickness=18;c.overlay.type='inset';
  assert.ok(computePanels(c).every(p=>!p.hardwareModels));
  c.overlay.type='full-overlay';c.hardware.hingeBoreInset=24;
  assert.ok(computePanels(c).every(p=>!p.hardwareModels),'custom edits cannot retain a branded assembly');
}
const widePreset=applyHardwarePreset(defaultCabinet(),'hinge-hettich-9099540');
const wide=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(widePreset)))).cabinets[0].config;
const widePanels=computePanels(wide);
const wideHoles=widePanels.flatMap(p=>p.holes);
const wideCups=wideHoles.filter(h=>h.purpose==='hinge-cup');
assert.ok(wideCups.length>0 && wideCups.every(h=>h.diameter===35 && h.depth===11.6));
assert.equal(wideHoles.filter(h=>h.purpose==='hinge-cup-fixing').length,wideCups.length*2);
assert.equal(wideHoles.filter(h=>h.purpose==='hinge-mounting-plate').length,wideCups.length*2);
assert.match(hardwareBom(wide,widePanels).find(r=>r.unit==='hinge / plate sets').item,/9099540.*9071575/);
const wideModels=widePanels.flatMap(p=>p.hardwareModels || []);
assert.equal(wideModels.filter(p=>p.model==='hettich-9099540' && p.closedOnly).length,wideCups.length);
assert.equal(wideModels.filter(p=>p.model==='hettich-9071575').length,wideCups.length);
for (const preset of ['hinge-hettich-9099540','hinge-hettich-9071205','hinge-hettich-9071207']) {
  const edited=applyHardwarePreset(defaultCabinet(),preset);
  if (preset==='hinge-hettich-9071207') edited.overlay.type='inset';
  edited.hardware.hingePlateFrontHoleOffset=40;
  const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(edited)))).cabinets[0].config;
  const custom=computePanels(saved);
  assert.ok(custom.every(p=>!p.hardwareModels));
  const side=custom.find(p=>p.id==='side-left');
  const plates=side.holes.filter(h=>h.purpose==='hinge-mounting-plate');
  assert.ok(plates.length>0);
  assert.ok(plates.every(h=>h.x===(edited.overlay.type==='inset'?58:40)));
  assert.equal(hardwareBom(saved,custom).find(r=>r.unit==='hinge / plate sets').item,'Custom / existing');
}
// Plate counts must use actual door height, including for the existing generic pattern.
const tall=defaultCabinet();tall.height=1350;
const panels=computePanels(tall);
assert.equal(panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-mounting-plate')).length,
  panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-cup')).length*4);

const source=readFileSync(new URL('../js/three-viewport.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const body=source.match(/  _renderFrame\(\) \{([\s\S]*?)\n  \}\n/)[1];
const model={visible:true}, cup={visible:false};
const state={type:'door',current:0,target:1,closedHardware:[model],openHardware:[cup]};
const context={animStates:new Map([['door-1',state]]),_cadRevision:1,_readyRevision:0,
  _applyConcealedHingeMotion(){},_updateFog(){},renderer:{render(){}},_requestRender(){}};
const frame=()=>vm.runInNewContext(`(function(){${body}}).call(this)`,context);
frame();assert.equal(model.visible,false);assert.equal(cup.visible,true);
state.target=0;for(let i=0;i<60;i++)frame();
assert.equal(model.visible,true);assert.equal(cup.visible,false);

const hardwareView=readFileSync(new URL('../js/hardware-view.js', import.meta.url),'utf8');
const cupSource=hardwareView.split('function hettichCupPositions(positions) {')[1].split('\n}')[0];
const cupPositions=vm.runInNewContext(`(function(positions){${cupSource}})`);
for (const sku of [9071205,9071206,9071207,9090260,9090270,9090280,9094270,9094280,9094290,9099540,9099550,9099590]) {
  const {positions}=HARDWARE_MODELS[`hettich-${sku}`];
  const doorSide=cupPositions(positions);
  assert.ok(doorSide.length>0 && doorSide.length<positions.length);
  const depths=doorSide.filter((_,i)=>i%3===2);
  assert.equal(Math.min(...depths),HARDWARE_MODELS[`hettich-${sku}`].bounds[2][0]);
  assert.ok(Math.max(...depths)>=3);
}
for (const sku of [9090260,9090270,9090280]) {
  const cup=cupPositions(HARDWARE_MODELS[`hettich-${sku}`].positions);
  let flangeArea=0;
  for(let i=0;i<cup.length;i+=9) {
    const [ax,ay,az,bx,by,bz,cx,cy,cz]=cup.slice(i,i+9);
    if ([az,bz,cz].every(z=>Math.abs(z-3)<0.001)) {
      flangeArea+=Math.abs((bx-ax)*(cy-ay)-(cx-ax)*(by-ay))/2;
    }
  }
  assert.ok(flangeArea>1000,`Sensys ${sku} must retain its door-side flange`);
}

for (const [sku,overlay,reveal,cupOffset,setback,plateSku] of [
  [9094270,'full-overlay',4,5,37,9071575],
  [9094280,'partial-overlay',4,14.5,37,9071575],
  [9094290,'inset',2,23,48,9071576],
]) {
  const thinDraft = applyHardwarePreset(defaultCabinet(),`hinge-hettich-${sku}`);
  Object.assign(thinDraft.materials,{caseThickness:19,doorThickness:10});
  thinDraft.reveal = reveal;
  thinDraft.overlay = {type:overlay,amount:9.5};
  const thin = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(thinDraft)))).cabinets[0].config;
  const thinPanels = computePanels(thin);
  const thinDoors = thinPanels.filter(p => p.type === 'door');
  assert.equal(thinDoors.length,2);
  for (const door of thinDoors) {
    const cups = door.holes.filter(h => h.purpose === 'hinge-cup');
    assert.ok(cups.length && cups.every(h => h.diameter === 35 && h.depth === 7.8));
    assert.ok(!door.holes.some(h => h.purpose === 'hinge-cup-fixing'));
    assert.match(panelToDxf(door),/DRILL_BACK_D7\.8MM/);
    const side = thinPanels.find(p => p.id === `side-${door.hingeSide}`);
    assert.equal(side.holes.filter(h => h.purpose === 'hinge-mounting-plate').length,cups.length*2);
    near(door.posZ+door.sizeZ/2,overlay==='inset'?10:-1);
    for (const [index,model] of door.hardwareModels.entries()) {
      const plate = side.hardwareModels[index];
      assert.equal(model.model,`hettich-${sku}`);
      assert.equal(plate.model,`hettich-${plateSku}`);
      near((door.posX+model.x-side.posX-plate.x)*model.mirrorX,cupOffset);
      near(side.posZ+plate.z,setback);
    }
  }
  assert.ok(hardwareBom(thin,thinPanels).some(row => row.item.includes(String(sku)) && row.note.includes('manual')));
  assert.ok(machiningSchedule(thinPanels).panels.some(p => p.warnings.some(w => w.includes('door fixing manually'))));
  for (const [screw,diameter,material] of [['9217435',3.6,'Compact HPL'],['9238321',5,'Solid Surface']]) {
    thin.hardware.thinHingeScrew = screw;
    const wrongStock = computePanels(thin);
    assert.ok(!wrongStock.flatMap(p => p.holes).some(h => h.purpose === 'hinge-cup-fixing'));
    const suitable = structuredClone(thin);
    suitable.materials.stockSelections ||= {};
    suitable.materials.stockSelections.front = {material,colour:'Black',thickness:10,units:'metric'};
    const saved = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(suitable)))).cabinets[0].config;
    const fitted = computePanels(saved);
    const screws = fitted.flatMap(p => p.holes).filter(h => h.purpose === 'hinge-cup-fixing');
    const cupCount = fitted.flatMap(p => p.holes).filter(h => h.purpose === 'hinge-cup').length;
    assert.ok(screws.length > 0 && screws.every(h => h.diameter === diameter && h.depth === 8));
    assert.equal(screws.length,cupCount*2);
    assert.ok(hardwareBom(saved,fitted).some(row => row.item === `Hettich ${screw}` && row.quantity === screws.length));
    assert.ok(fitted.filter(p => p.type === 'door').every(p => panelToDxf(p).includes('DRILL_BACK_D8MM')));
  }
  thin.materials.doorThickness = 12;
  assert.ok(computePanels(thin).every(p => !p.hardwareModels));
}

const d2 = applyHardwarePreset(defaultCabinet(),'hinge-hettich-9094280-d2');
Object.assign(d2.materials,{caseThickness:10,doorThickness:10});
d2.overlay = {type:'partial-overlay',amount:10};
d2.reveal = 2;
assert.ok(computePanels(d2).every(p => !p.holes.some(h => h.purpose === 'hinge-mounting-plate')));
d2.materials.stockSelections = {
  carcass:{material:'Compact HPL',colour:'Black',thickness:10,units:'metric'},
  front:{material:'Compact HPL',colour:'Black',thickness:10,units:'metric'},
};
d2.hardware.thinHingeScrew = '9217435';
const savedD2 = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(d2)))).cabinets[0].config;
const d2Panels = computePanels(savedD2);
for (const hand of ['left','right']) {
  const side = d2Panels.find(p => p.id === `side-${hand}`);
  const pilots = side.holes.filter(h => h.purpose === 'hinge-mounting-plate');
  assert.equal(pilots.length,4);
  assert.ok(pilots.every(h => h.depth === 8 && h.diameter === 5 && h.x === (hand === 'left' ? 37 : side.cutWidth-37)));
  const door = d2Panels.find(p => p.hingeSide === hand);
  const [hinge] = door.hardwareModels, [plate] = side.hardwareModels;
  near((door.posX+hinge.x-side.posX-plate.x)*hinge.mirrorX,14.5);
  assert.match(panelToDxf(side),/DRILL_INSIDE_D8MM/);
}
assert.ok(hardwareBom(savedD2,d2Panels).some(r => r.item === 'Hettich 9238321' && r.unit === 'hinge plate screws' && r.quantity === 8));
savedD2.hardware.hingePlateDepth = 9;
assert.ok(computePanels(savedD2).every(p => !p.holes.some(h => h.purpose === 'hinge-mounting-plate')));

for (const [sku,base,overlay] of [
  [9071206,'9071206','partial-overlay'], [9099540,'9099540-e1','full-overlay'],
  [9099550,'9099550-e2','partial-overlay'], [9099590,'9099590','partial-overlay'],
]) {
  const draft = applyHardwarePreset(defaultCabinet(),`hinge-hettich-${sku}-lr28`);
  Object.assign(draft.materials,{caseThickness:19,doorThickness:19});
  draft.reveal = 4;
  draft.overlay = {type:overlay,amount:9.5};
  const saved = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const fitted = computePanels(saved);
  const original = computePanels(applyHardwarePreset(saved,`hinge-hettich-${base}`));
  for (const door of fitted.filter(p => p.type === 'door')) {
    const oldDoor = original.find(p => p.id === door.id);
    assert.ok(door.hardwareModels.length > 0);
    assert.deepEqual(door.hardwareModels,oldDoor.hardwareModels);
    assert.deepEqual(door.holes,oldDoor.holes);
    near(door.posZ,oldDoor.posZ);
  }
  for (const side of fitted.filter(p => /^side-/.test(p.id))) {
    assert.ok(side.hardwareModels.length > 0);
    assert.ok(side.hardwareModels.every(p => p.model === 'hettich-9071570'));
    const bores = side.holes.filter(h => h.purpose === 'hinge-mounting-plate');
    assert.equal(bores.length,side.hardwareModels.length*2);
    assert.ok(bores.every(h => h.x === (side.id === 'side-left' ? 28 : side.cutWidth-28) && h.depth === 12));
    assert.match(panelToDxf(side),/DRILL_INSIDE_D12MM/);
  }
  assert.ok(hardwareBom(saved,fitted).some(r => r.item.includes('9071570') && r.item.includes(String(sku))));
}
console.log('PASS: manufacturer fixing axes, 18 matched hinge assemblies, handedness, saved pair, BOM, unsupported/custom guards, closed-only CAD and generic tall-door plate counts');

for (const [preset,sku,cupDepth,standOff,caseThickness=19,reveal=4,plateSku='9071575',cupOffset=5,doorThickness=19,setback=37,overlay='full-overlay'] of [
  ['hinge-hettich-9071205-a1','9071205',12.8,1.5],
  ['hinge-hettich-9071205-lr28','9071205',12.8,1.5,19,4,'9071570',5,19,28],
  ['hinge-hettich-9071205-a2','9071205',12.8,1.5,16,2,'9071576',6.5],
  ['hinge-hettich-9099540-e1','9099540',11.6,1],
  ['hinge-hettich-9090260-b1','9090260',12.8,1,19,4,'9071575',5,28],
  ['hinge-hettich-9090260-b2','9090260',12.8,1,22,6,'9071576',6.5,32],
  ['hinge-hettich-9090270-b3','9090270',12.8,1,19,4,'9071575',14.5,28,37,'partial-overlay'],
  ['hinge-hettich-9090280-b4','9090280',12.8,0,19,2,'9071576',23,22,60,'inset'],
  ...[28,30,32,34].map((stock,index)=>[`hinge-hettich-9099540-b${index+5}`,'9099540',11.6,1,19,4,'9071575',5,stock]),
]) {
  const draft=applyHardwarePreset(defaultCabinet(),preset);
  draft.overlay.type=overlay;
  if(overlay==='partial-overlay') draft.overlay.amount=9.5;
  draft.materials.caseThickness=caseThickness;
  draft.materials.doorThickness=doorThickness;
  draft.reveal=reveal;
  const config=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const fitted=computePanels(config);
  for (const door of fitted.filter(p=>p.type==='door')) {
    const hand=door.hingeSide;
    const sign=hand==='left'?1:-1;
    const side=fitted.find(p=>p.id===`side-${hand}`);
    const cups=door.holes.filter(h=>h.purpose==='hinge-cup');
    assert.ok(cups.every(h=>h.depth===cupDepth));
    if(['9090260','9090270','9090280'].includes(sku)) assert.equal(door.hingeOpeningLimit,95);
    assert.equal(door.hardwareModels.length,cups.length);
    near(door.posZ+door.sizeZ/2,overlay==='inset'?doorThickness:-standOff);
    if (sku==='9099540' && doorThickness>=28) assert.ok(door.hardwareWarnings.some(w=>w.includes("R1 door-edge radius")));
    for (const [i,model] of door.hardwareModels.entries()) {
      const plate=side.hardwareModels[i];
      assert.equal(model.model,`hettich-${sku}`);
      assert.equal(plate.model,`hettich-${plateSku}`);
      near((door.posX+model.x-side.posX-plate.x)*sign,cupOffset);
      near(side.posZ+plate.z,setback);
    }
    assert.equal(panelBores(door).filter(h=>h.purpose==='hinge-cup-fixing').length,cups.length*2);
    assert.equal(panelBores(side).filter(h=>h.purpose==='hinge-mounting-plate').length,cups.length*2);
    if (setback===28) {
      assert.ok(side.holes.filter(h=>h.purpose==='hinge-mounting-plate').every(h=>
        h.x===(hand==='left'?28:side.cutWidth-28) && h.diameter===3 && h.depth===12));
      assert.match(panelToDxf(side),/DRILL_INSIDE_D12MM/);
    }
  }
  const bom=hardwareBom(config,fitted);
  assert.ok(bom.some(row=>row.item.includes(sku) && row.item.includes(plateSku)));
  const limiter=bom.find(row=>row.unit==='hinge opening limiters');
  if (sku==='9099540' && doorThickness>=30) {
    const angle={30:120,32:105,34:90}[doorThickness];
    assert.equal(limiter.item,doorThickness===34?'Hettich 9090864':'Hettich 9090756');
    assert.match(limiter.note,new RegExp(`${angle}°`));
    assert.equal(limiter.quantity,fitted.flatMap(p=>p.holes).filter(h=>h.purpose==='hinge-cup').length);
    assert.ok(fitted.filter(p=>p.type==='door').every(p=>p.hardwareWarnings.some(w=>w.includes(limiter.item))
      && p.hingeOpeningLimit===angle));
  } else assert.equal(limiter,undefined);
}
