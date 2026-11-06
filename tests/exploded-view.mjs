import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { frontLayout } from '../js/front-layout.js';
import { explodedPanels } from '../js/exploded-view.js';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
for (const mode of ['doors', 'drawers']) {
  const config = defaultCabinet(); config.front.mode = mode; config.drawers.count = 3; config.drawers.heights = Array(3).fill((frontLayout(config).height - 2 * config.reveal) / 3);
  const original = computePanels(config), snapshot = structuredClone(original);
  const spread = explodedPanels(original);
  assert.deepEqual(original, snapshot, 'assembled/export geometry must stay unchanged');
  assert.equal(spread.length, original.length);
  const left = spread.find(p => p.id === 'side-left'), right = spread.find(p => p.id === 'side-right');
  assert.ok(right.posX - left.posX > original.find(p => p.id === 'side-right').posX - original.find(p => p.id === 'side-left').posX);
  for (const p of spread) {
    assert.ok(['X','Y','Z'].every(a => Number.isFinite(p[`pos${a}`])));
    assert.equal(p.sizeX, original.find(q => q.id === p.id).sizeX);
  }
  if (mode === 'drawers') {
    const front = spread.find(p => p.id === 'drawer-1');
    assert.ok(front.posZ < original.find(p => p.id === front.id).posZ - 300);
    const sides = spread.filter(p => /^drawer-1-side-/.test(p.id));
    const oldSides = original.filter(p => /^drawer-1-side-/.test(p.id));
    assert.ok(Math.abs(sides[1].posX - sides[0].posX) > Math.abs(oldSides[1].posX - oldSides[0].posX));
  }
}
assert.deepEqual(explodedPanels([]), []);
console.log('PASS: exploded cabinet and drawer spacing, unchanged dimensions and assembled export positions');

const viewportSource = readFileSync(new URL('../js/three-viewport.js', import.meta.url), 'utf8');
const update = viewportSource.split('  update(panels, cabinetId = this._cabinetId) {')[1].split('\n  }')[0];
const viewport = {
  animStates:new Map(),
  controls:{target:{set(){}},update(){}},
  camera:{position:{set(){}}},
  _clearScene(){}, _updateFog(){}, _requestRender(){}, _loadMachinedGeometry(){},
  _addDoor(panel){ this.animStates.set(panel.id,{type:'door',current:0,target:0,max:2}); },
};
const rebuild = vm.runInNewContext(`(function(panels, cabinetId = this._cabinetId){${update}})`, {explodedPanels});
const doors = computePanels(defaultCabinet()).filter(panel => panel.type === 'door');
rebuild.call(viewport,doors,'first');
Object.assign(viewport.animStates.get('door-1'),{current:1.7,target:2});
rebuild.call(viewport,doors,'first');
assert.equal(viewport.animStates.get('door-1').current,1.7);
assert.equal(viewport.animStates.get('door-1').target,2);
assert.equal(viewport.animStates.get('door-2').target,0);
rebuild.call(viewport,doors,'second');
assert.equal(viewport.animStates.get('door-1').current,0);
console.log('PASS: a cabinet rebuild retains each door pose without sharing it across cabinets');

const links={userData:{closedOnly:true},visible:true};
const cup={userData:{openOnly:true},visible:false};
const fixed={userData:{isHardwareModel:true},visible:true};
Object.assign(viewport.animStates.get('door-1'),{current:1.2,target:2});
viewport.exploded=true;
viewport.panelGroup={add(){}};
viewport._buildPanelMesh=()=>({children:[links,cup,fixed]});
rebuild.call(viewport,doors,'second');
assert.deepEqual([links.visible,cup.visible,fixed.visible],[false,true,true]);
rebuild.call(viewport,doors,'second');
viewport.exploded=false;
rebuild.call(viewport,doors,'second');
assert.equal(viewport.animStates.get('door-1').current,1.2);
assert.equal(viewport.animStates.get('door-1').target,2);

viewport.exploded=true;
rebuild.call(viewport,doors,'second');
rebuild.call(viewport,doors,'third');
viewport.exploded=false;
rebuild.call(viewport,doors,'third');
assert.equal(viewport.animStates.get('door-1').current,0);

const addDoorSource = viewportSource.split('  _addDoor(p) {')[1].split('\n  }')[0];
class PreviewObject {
  position = {set(){}};
  children = [];
  add(child) { this.children.push(child); }
}
const addDoor = vm.runInNewContext(`(function(p){${addDoorSource}})`, {
  THREE:{Object3D:PreviewObject,MathUtils:{degToRad:degrees=>degrees*Math.PI/180}},
});
viewport.panelGroup = new PreviewObject();
viewport._buildPanelMesh = () => new PreviewObject();
for (const [limit,previewAngle] of [[undefined,110],[120,110],[105,105],[90,90],[86,86]]) {
  addDoor.call(viewport,{...doors[0],hingeOpeningLimit:limit});
  assert.equal(viewport.animStates.get(doors[0].id).max,previewAngle*Math.PI/180);
}
console.log('PASS: door preview respects the fitted limiter within its generic travel range');

viewport._addDoor = addDoor;
viewport._buildPanelMesh = () => new PreviewObject();
for (const [base, thickness, reveal, overlay] of [
  ['hinge-blum-71b3550',18,3,'full-overlay'],
  ['hinge-blum-71b3550-19mm',19,4,'full-overlay'],
  ['hinge-blum-71b3750',18,4,'inset'],
]) {
  const config = applyHardwarePreset(defaultCabinet(),base);
  Object.assign(config.materials,{caseThickness:thickness,doorThickness:thickness});
  config.overlay.type = overlay;
  config.reveal = reveal;
  const doorPanels = cabinet => computePanels(cabinet).filter(panel => panel.type === 'door');
  rebuild.call(viewport,doorPanels(config),base);
  assert.equal(viewport.animStates.size,2);
  const [left,right] = viewport.animStates.values();
  assert.deepEqual([left.sign,right.sign],[1,-1]);
  for (const state of [left,right]) state.current = state.target = state.max;
  const stopped = applyHardwarePreset(config,`${base}-86`);
  rebuild.call(viewport,doorPanels(stopped),base);
  for (const state of viewport.animStates.values()) {
    assert.equal(state.current,86*Math.PI/180);
    assert.equal(state.target,state.current);
  }
  rebuild.call(viewport,doorPanels(config),base);
  for (const state of viewport.animStates.values()) {
    assert.equal(state.current,86*Math.PI/180);
    assert.equal(state.target,110*Math.PI/180);
  }
}
console.log('PASS: changing matched Blum hardware clamps already-open doors on both hands');

const opacityMethods = viewportSource.slice(viewportSource.indexOf('  setPanelOpacity('),
  viewportSource.indexOf('  _addDoor(p) {'));
const opacityView = vm.runInNewContext(`({${opacityMethods.replace('  _applyPanelOpacity(', ',  _applyPanelOpacity(')}})`);
const hardware = { material:{opacity:1,depthWrite:true} };
const panel = { material:{opacity:1,depthWrite:true}, children:[hardware] };
opacityView.interactiveMeshes = [{mesh:panel}];
opacityView._requestRender = () => {};
opacityView.setPanelOpacity(0);
assert.equal(panel.material.opacity,0);
assert.equal(panel.material.depthWrite,false);
assert.equal(hardware.material.opacity,1);
const rebuilt = { material:{} };
opacityView._applyPanelOpacity(rebuilt);
assert.equal(rebuilt.material.opacity,0);
opacityView.setPanelOpacity(1);
assert.equal(panel.material.transparent,false);
assert.equal(panel.material.depthWrite,true);
console.log('PASS: panel opacity survives rebuilds and leaves hardware opaque');
