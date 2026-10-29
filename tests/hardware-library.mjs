import assert from 'node:assert/strict';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { HARDWARE_LIBRARY, applyHardwarePreset, hardwareBom, selectedHardware } from '../js/hardware-library.js';
import { createProjectFromConfig, normalizeProject, buildProjectPanels } from '../js/project-io.js';
import { setUnits } from '../js/units.js?v=20261020h';
globalThis.window = {};
const { panelToDxf, sheetToDxf, machiningSchedule } = await import('../js/dxf-writer.js');
const base = defaultCabinet();
assert.equal(new Set(HARDWARE_LIBRARY.map(p => p.id)).size, HARDWARE_LIBRARY.length);
assert.throws(() => applyHardwarePreset(base, 'missing'));
for (const p of HARDWARE_LIBRARY) {
  const config = applyHardwarePreset(base, p.id);
  assert.equal(selectedHardware(config).find(s => s.category === p.category).id, p.id);
  const restored = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config)))).cabinets[0].config;
  assert.deepEqual(restored.hardware, config.hardware);
}
assert.equal(base.hardware.library, undefined, 'selection must not mutate saved config');

const knob = applyHardwarePreset(base, 'handle-knob');
assert.equal(computePanels(knob).flatMap(p => p.holes).filter(h => h.purpose === 'handle').length, 2);
assert.equal(hardwareBom(knob, computePanels(knob)).find(r => r.unit === 'knobs').quantity, 2);
const none = applyHardwarePreset(knob, 'handle-none');
assert.equal(computePanels(none).flatMap(p => p.holes).filter(h => h.purpose === 'handle').length, 0);
const pull = applyHardwarePreset(base, 'pull-76.2');
for (const p of computePanels(pull).filter(p => p.type === 'door')) {
  const holes = p.holes.filter(h => h.purpose === 'handle');
  assert.ok(Math.abs(holes[1].y - holes[0].y - 76.2) < 1e-8);
}
pull.hardware.handleHoleSpacing = 90;
assert.equal(selectedHardware(pull).find(p => p.category === 'handles').status, 'custom');
pull.hardware.handleHoleSpacing = 320;
assert.equal(computePanels(pull).flatMap(p => p.holes).filter(h => h.purpose === 'handle').length, 4, 'large centres move up to fit');
assert.ok(validateCabinet(pull).some(w => w.includes('handle centre adjusted')));
const pins = applyHardwarePreset(base, 'shelf-quarter-system32');
for (const p of computePanels(pins).filter(p => p.id.startsWith('side-'))) {
  assert.ok(p.holes.filter(h => h.purpose === 'shelf-pin').every(h => h.diameter === 6.35 && h.depth === 10));
  assert.ok(p.holes.some(h => h.purpose === 'shelf-pin' && h.x === (p.id === 'side-right' ? p.cutWidth - 37 : 37)));
}
pins.hardware.shelfPinSpacing = 0;
assert.equal(computePanels(pins).flatMap(p => p.holes).filter(h => h.purpose === 'shelf-pin').length, 0);
assert.ok(validateCabinet(pins).some(w => w.includes('pitch')));
pins.hardware.shelfPinSpacing = 32; pins.hardware.shelfPinDiameter = -1;
assert.equal(computePanels(pins).flatMap(p => p.holes).filter(h => h.purpose === 'shelf-pin').length, 0);

function world(p, b, edge) {
  if (p.id.startsWith('side-')) {
    const z = p.id === 'side-right' ? p.cutWidth - b.x : b.x;
    return [edge ? p.posX : p.posX + (p.id === 'side-left' ? 1 : -1) * p.sizeX / 2,
      b.y, p.posZ - p.sizeZ / 2 + z];
  }
  return [p.posX - p.sizeX / 2 + b.x,
    edge ? p.posY : p.posY - p.sizeY / 2, p.posZ - p.sizeZ / 2 + b.y];
}
for (const category of ['base', 'wall']) for (const hasTop of [true, false]) for (const backMount of ['applied-rear', 'grooved-in']) for (const construction of ['frameless', 'face-frame']) {
  const config = applyHardwarePreset(base, 'dowel-8x30');
  Object.assign(config, { category, hasTop, backMount, construction });
  const parts = computePanels(config);
  assert.deepEqual(parts[0].hardwareWarnings, [], JSON.stringify({ category, hasTop, backMount, construction }));
  const faces = parts.flatMap(p => p.holes.filter(h => h.joint).map(b => ({ p, b })));
  const edges = parts.flatMap(p => (p.edgeBores || []).map(b => ({ p, b })));
  assert.ok(edges.length >= 8);
  assert.equal(faces.length, edges.length);
  for (const e of edges) {
    const f = faces.find(f => f.b.joint === e.b.joint);
    assert.ok(f);
    assert.equal(f.b.mate, e.p.id);
    assert.equal(e.b.mate, f.p.id);
    const a = world(f.p, f.b, false), b = world(e.p, e.b, true);
    assert.ok(a.every((n, i) => Math.abs(n - b[i]) < 1e-8), `${e.b.joint}: ${a} != ${b}`);
  }
  assert.equal(hardwareBom(config, parts).find(r => r.unit === 'dowels').quantity, edges.length);
  const schedule = machiningSchedule(parts);
  assert.equal(schedule.units, 'mm');
  assert.equal(schedule.panels.flatMap(p => p.edgeBores).length, edges.length);
  const bottom = parts.find(p => p.id === 'bottom');
  assert.ok(panelToDxf(bottom).includes('EDGE SETUP'));
  assert.ok(!panelToDxf(bottom).includes('0\nCIRCLE'), 'edge bores must not become face circles');
  const side = parts.find(p => p.id === 'side-left');
  assert.ok(panelToDxf(side).includes('DRILL_INSIDE_D12MM'));
  const nested = sheetToDxf({ index: 0, sheetWidth: 2440, sheetHeight: 1220, placements: [{ panel: side, x: 20, y: 30, width: side.cutHeight, height: side.cutWidth, rotated: true }] });
  assert.ok(nested.includes('DRILL_INSIDE_D12MM'));
}
const invalid = applyHardwarePreset(base, 'dowel-8x30');
invalid.materials.caseThickness = 12;
assert.ok(validateCabinet(invalid).some(w => w.includes('Dowel joinery omitted')));
assert.equal(computePanels(invalid).flatMap(p => p.edgeBores || []).length, 0);
invalid.materials.caseThickness = 18;
invalid.hardware.dowelEndOffset = 2;
assert.equal(computePanels(invalid).flatMap(p => p.edgeBores || []).length, 0);
invalid.hardware.dowelEndOffset = 80;
assert.ok(validateCabinet(invalid).some(w => w.includes('too small')));

const drawer = applyHardwarePreset(base, 'runner-3832e');
drawer.front.mode = 'drawers'; drawer.drawers.count = 2; drawer.drawers.heights = [305.5, 305.5];
const drawerParts = computePanels(drawer);
assert.ok(drawerParts.some(p => p.id === 'drawer-1-side-left' && p.cutWidth === 500));
const left = drawerParts.find(p => p.id === 'drawer-1-side-left');
assert.ok(Math.abs(left.posX - left.cutThickness / 2 - 18 - 12.7) < 1e-8);
assert.equal(drawerParts.flatMap(p => p.holes).filter(h => h.purpose.includes('reference')).length, 0);
assert.equal(hardwareBom(drawer, drawerParts).find(r => r.unit === 'runner pairs').quantity, 2);
drawer.depth = 400;
assert.ok(validateCabinet(drawer).some(w => w.includes('runner is too long')));
assert.equal(computePanels(drawer).filter(p => p.type === 'drawer-box').length, 0);
setUnits('imperial');
assert.ok(panelToDxf(computePanels(knob).find(p => p.type === 'door')).includes('$INSUNITS\n70\n1'));
assert.ok(panelToDxf(computePanels(knob).find(p => p.type === 'door')).includes('DRILL_FRONT_D18MM'));
setUnits('metric');
console.log('PASS: library selection, custom overrides, saved projects, exact imperial patterns, knobs, matched dowels in 16 constructions, separate edge setups, depth layers and runner fit');

const project = createProjectFromConfig(applyHardwarePreset(base, 'dowel-8x30'));
project.cabinets[0].qty = 3;
const projectParts = buildProjectPanels(project);
const projectEdges = projectParts.flatMap(p => p.edgeBores || []);
assert.equal(new Set(projectEdges.map(b => b.joint)).size, projectEdges.length, 'joint IDs must be unique per copy');
for (const bore of projectEdges) assert.ok(projectParts.some(p => p.id === bore.mate && p.holes.some(h => h.joint === bore.joint)));
assert.equal(projectEdges.length, 3 * computePanels(project.cabinets[0].config).flatMap(p => p.edgeBores || []).length);
const framed = applyHardwarePreset(base, 'plate-37-32');
framed.construction = 'face-frame';
assert.ok(validateCabinet(framed).some(w => w.includes('frameless carcass')));
assert.equal(computePanels(framed).flatMap(p => p.holes).filter(h => h.purpose === 'hinge-mounting-plate').length, 0);
console.log('PASS: unique mating joint IDs across cabinet copies and unsupported face-frame plate guard');
