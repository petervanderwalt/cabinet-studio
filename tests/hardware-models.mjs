import assert from 'node:assert/strict';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { HARDWARE_MODELS, ANZIO_MODELS, handleModelPlacement } from '../js/hardware-models.js';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
import { frontLayout } from '../js/front-layout.js';

const model = HARDWARE_MODELS['hettich-1160018'];
assert.equal(model.positions.length % 9, 0);
assert.ok(model.positions.every(Number.isFinite));
assert.deepEqual(model.mountingCentres, [[-64, 0, 0], [64, 0, 0]]);
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.001, `${a} != ${b}`);
for (let axis = 0; axis < 3; axis++) {
  const values = model.positions.filter((_, i) => i % 3 === axis);
  near(Math.min(...values), model.bounds[axis][0]);
  near(Math.max(...values), model.bounds[axis][1]);
}
for (const mode of ['doors', 'drawers']) for (const width of [400, 800]) {
  let c = applyHardwarePreset(defaultCabinet(), 'handle-hettich-1160018');
  c.width = width;
  c.front.mode = mode;
  c.doors.count = width === 400 ? 1 : 2;
  c.drawers.count = mode === 'drawers' ? 2 : 0;
  c.drawers.heights = Array(2).fill((frontLayout(c).height - c.reveal) / 2);
  const restored = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  const panels = computePanels(restored);
  const fronts = panels.filter(p => p.type === 'door' || p.type === 'drawer');
  assert.ok(fronts.length > 0);
  for (const p of fronts) {
    assert.equal(p.hardwareModels.length, 1);
    const placement = p.hardwareModels[0];
    const holes = p.holes.filter(h => h.purpose === 'handle');
    for (let i = 0; i < 2; i++) {
      const x = model.mountingCentres[i][0];
      near(placement.x + x * Math.cos(placement.rotation), holes[i].x - p.cutWidth / 2);
      near(placement.y + x * Math.sin(placement.rotation), holes[i].y - p.cutHeight / 2);
      near(placement.z, -p.sizeZ / 2);
    }
  }
  c.hardware.handleHoleSpacing = 96;
  assert.ok(computePanels(c).every(p => !p.hardwareModels), 'edited spacing must not stretch a manufacturer model');
  c = applyHardwarePreset(c, 'pull-128');
  assert.ok(computePanels(c).every(p => !p.hardwareModels), 'generic pulls must not claim manufacturer geometry');
  c = applyHardwarePreset(c, 'handle-none');
  assert.ok(computePanels(c).every(p => !p.hardwareModels));
}
assert.deepEqual(handleModelPlacement({type:'door',holes:[]}, {model:'hettich-1160018'}), []);
assert.equal(ANZIO_MODELS.length,8);
for(const model of ANZIO_MODELS) for(const mode of ['doors','drawers']) {
  const spacing=model.mountingCentres[1][0]-model.mountingCentres[0][0];
  near(model.bounds[0][1]-model.bounds[0][0],spacing+10);
  near(model.bounds[1][1]-model.bounds[1][0],10);
  near(model.bounds[2][1]-model.bounds[2][0],32);
  assert.equal(model.positions.length%9,0); assert.ok(model.positions.every(Number.isFinite));
  let c=applyHardwarePreset(defaultCabinet(),`handle-hettich-${model.partNumber}`);
  c.width=1600;c.height=1000;c.front.mode=mode;c.drawers.count=2;
  c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  for(const panel of computePanels(c).filter(p=>['door','drawer'].includes(p.type))) {
    const placement=panel.hardwareModels[0],holes=panel.holes.filter(h=>h.purpose==='handle');
    assert.equal(placement.model,`hettich-${model.partNumber}`);
    model.mountingCentres.forEach(([x],i)=>{
      near(placement.x+x*Math.cos(placement.rotation),holes[i].x-panel.cutWidth/2);
      near(placement.y+x*Math.sin(placement.rotation),holes[i].y-panel.cutHeight/2);
    });
  }
  c.width=200;c.front.mode='drawers';
  if(spacing>200) assert.ok(computePanels(c).filter(p=>p.type==='drawer').every(p=>!p.hardwareModels),'oversized CAD must not stretch with adjusted drilling');
}
console.log('PASS: CAD dimensions, mounting axes coincide with door/drawer bores, save/load, generic/custom/no-handle fallback');
