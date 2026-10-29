import assert from 'node:assert/strict';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset, hardwareBom } from '../js/hardware-library.js';
import { buildProjectPanels, createProjectFromConfig, normalizeProject } from '../js/project-io.js';
globalThis.window = {};
const { panelToDxf, machiningSchedule, sheetToDxf } = await import('../js/dxf-writer.js');
const config = applyHardwarePreset(defaultCabinet(), 'pull-320');
const door = computePanels(config).find(p => p.type === 'door');
assert.equal(door.handlePlacement.requestedY, 100);
assert.equal(door.handlePlacement.y, 164.5);
assert.equal(config.hardware.doorHandleHeight, 100, 'requested offset remains unchanged');
assert.equal(door.holes.filter(h => h.purpose === 'handle').length, 2);
assert.ok(door.holes.filter(h => h.purpose === 'handle').every(h => h.y >= 4.5 && h.y <= door.cutHeight - 4.5));
assert.ok(validateCabinet(config).some(w => w.includes('handle centre adjusted')));
config.hardware.handleHoleSpacing = 700;
assert.equal(computePanels(config).flatMap(p => p.holes).filter(h => h.purpose === 'handle').length, 0);
assert.ok(validateCabinet(config).some(w => w.includes('cannot fit')));
config.hardware.handleHoleSpacing = 128;
assert.equal(computePanels(config).find(p => p.type === 'door').handlePlacement.y, 100);

const worldEntry = (p, b, edge) => {
  if (p.id.startsWith('side-')) {
    const z = p.id === 'side-right' ? p.cutWidth - b.x : b.x;
    return [edge ? p.posX : p.posX + (p.id === 'side-left' ? 1 : -1) * p.sizeX / 2, b.y, p.posZ - p.sizeZ / 2 + z];
  }
  return [p.posX - p.sizeX / 2 + b.x, edge ? p.posY : p.posY - p.sizeY / 2, p.posZ - p.sizeZ / 2 + b.y];
};
for (const category of ['base', 'wall']) for (const hasTop of [true, false]) for (const backMount of ['applied-rear', 'grooved-in']) for (const construction of ['frameless', 'face-frame']) {
  const c = applyHardwarePreset(defaultCabinet(), 'rastex-18');
  Object.assign(c, { category, hasTop, backMount, construction });
  const parts = computePanels(c);
  assert.deepEqual(parts.flatMap(p => p.hardwareWarnings || []), []);
  const cams = parts.flatMap(p => p.holes.filter(h => h.purpose === 'cam-housing').map(b => ({ p, b })));
  const pilots = parts.flatMap(p => p.holes.filter(h => h.purpose === 'cam-bolt-pilot').map(b => ({ p, b })));
  const passages = parts.flatMap(p => (p.edgeBores || []).map(b => ({ p, b })));
  assert.equal(cams.length, 16);
  assert.equal(pilots.length, cams.length); assert.equal(passages.length, cams.length);
  for (const { p, b } of passages) {
    const cam = cams.find(c => c.b.joint === b.joint);
    const pilot = pilots.find(c => c.b.joint === b.joint);
    assert.equal(cam.p.id, p.id);
    assert.equal(b.diameter, 8); assert.equal(b.depth, 34); assert.equal(b.offset, 9);
    assert.equal(cam.b.diameter, 15); assert.equal(cam.b.depth, 13.4);
    assert.equal(pilot.b.diameter, 5); assert.equal(pilot.b.depth, 11.5);
    assert.equal(pilot.p.id, b.mate);
    const a = worldEntry(p, b, true), v = worldEntry(pilot.p, pilot.b, false);
    assert.ok(a.every((n, i) => Math.abs(n - v[i]) < 1e-8));
  }
  assert.equal(hardwareBom(c, parts).find(r => r.unit === 'cam / bolt sets').quantity, 16);
  const bottom = parts.find(p => p.id === 'bottom');
  assert.ok(panelToDxf(bottom).includes('DRILL_TOP_D13.4MM'));
  assert.equal((panelToDxf(bottom).match(/0\nCIRCLE\n/g) || []).length, 8, 'edge passages must not become face circles');
  assert.ok(sheetToDxf({index:0, sheetWidth:2440, sheetHeight:1220, placements:[{panel:bottom,x:10,y:20,width:bottom.cutHeight,height:bottom.cutWidth,rotated:true}]}).includes('DRILL_TOP_D13.4MM'));
  assert.equal(machiningSchedule(parts).panels.flatMap(p => p.edgeBores).length, 16);
}
const c = applyHardwarePreset(defaultCabinet(), 'rastex-18');
c.materials.caseThickness = 19.05;
assert.ok(validateCabinet(c).some(w => w.includes('18mm carcass stock')));
assert.equal(computePanels(c).flatMap(p => p.edgeBores || []).length, 0);
c.materials.caseThickness = 18; c.hardware.connectorEndOffset = 2;
assert.equal(computePanels(c).flatMap(p => p.holes).filter(h => h.purpose === 'cam-housing').length, 0);
c.hardware.connectorEndOffset = 37;
const project = createProjectFromConfig(c); project.cabinets[0].qty = 2;
const restored = normalizeProject(JSON.parse(JSON.stringify(project)));
const parts = buildProjectPanels(restored);
const joints = parts.flatMap(p => p.edgeBores || []).map(b => b.joint);
assert.equal(new Set(joints).size, 32);
assert.equal(parts.flatMap(p => p.holes).filter(h => h.purpose === 'cam-housing').length, 32);
console.log('PASS: large-pull adjustment/impossible-fit warnings and exact Rastex cam/pilot/passage geometry across 16 constructions, DXFs, nesting, stock guards and saved copies');
