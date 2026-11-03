import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset, selectedHardware, hardwareBom } from '../js/hardware-library.js';
import { HARDWARE_MODELS } from '../js/hardware-models.js';
import { panelBores } from '../js/panel-bores.js?v=20261103c';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
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
// Plate counts must use actual door height, including for the existing generic pattern.
const tall=defaultCabinet();tall.height=1350;
const panels=computePanels(tall);
assert.equal(panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-mounting-plate')).length,
  panels.flatMap(p=>p.holes.filter(h=>h.purpose==='hinge-cup')).length*4);

const source=readFileSync(new URL('../js/three-viewport.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const body=source.match(/  _renderFrame\(\) \{([\s\S]*?)\n  \}\n/)[1];
const model={visible:true};
const state={type:'door',current:0,target:1,closedHardware:[model]};
const context={animStates:new Map([['door-1',state]]),_cadRevision:1,_readyRevision:0,
  _applyConcealedHingeMotion(){},_updateFog(){},renderer:{render(){}},_requestRender(){}};
const frame=()=>vm.runInNewContext(`(function(){${body}}).call(this)`,context);
frame();assert.equal(model.visible,false);
state.target=0;for(let i=0;i<60;i++)frame();assert.equal(model.visible,true);
console.log('PASS: manufacturer fixing axes, 18 matched hinge assemblies, handedness, saved pair, BOM, unsupported/custom guards, closed-only CAD and generic tall-door plate counts');
