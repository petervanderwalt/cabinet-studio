import assert from 'node:assert/strict';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset, hardwareBom } from '../js/hardware-library.js';
import { panelBores } from '../js/panel-bores.js';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
globalThis.window = {};
const { panelToDxf, sheetToDxf } = await import('../js/dxf-writer.js');

for (const backMount of ['rear-strip', 'rear-strips']) {
  const config = applyHardwarePreset(defaultCabinet(), 'outside-screws');
  Object.assign(config, { category: 'wall', backMount, rearStripHeight: 75, hasTop: true });
  const restored = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config)))).cabinets[0].config;
  const panels = computePanels(restored);
  const strips = panels.filter(p => p.id.startsWith('rear-strip-'));
  assert.equal(strips.length, backMount === 'rear-strip' ? 1 : 2);
  assert.ok(!panels.some(p => p.id === 'back'));
  for (const strip of strips) {
    assert.equal(strip.cutHeight, 75);
    assert.equal(strip.cutWidth, config.width - 2 * config.materials.caseThickness);
    assert.equal(strip.cutThickness, config.materials.caseThickness);
    assert.ok(panels.filter(p => p.type === 'shelf').every(p => p.posZ + p.sizeZ / 2 < strip.posZ - strip.sizeZ / 2));
  }
  let total = 0;
  for (const side of panels.filter(p => p.id.startsWith('side-'))) {
    const bores = panelBores(side).filter(b => b.purpose === 'outside-screw');
    assert.equal(bores.length, 4 + strips.length * 2);
    total += bores.length;
    for (const bore of bores) {
      const left = side.id === 'side-left';
      assert.equal(bore.start[0], (left ? -1 : 1) * side.cutThickness / 2);
      assert.equal(bore.direction[0], left ? 1 : -1);
      assert.equal(bore.depth, side.cutThickness);
      const mate = panels.find(p => p.id === bore.source.mate);
      const y = side.posY + bore.start[1], z = side.posZ + bore.start[2];
      assert.ok(Math.abs(y - mate.posY) + bore.radius <= mate.sizeY / 2);
      assert.ok(Math.abs(z - mate.posZ) + bore.radius <= mate.sizeZ / 2);
    }
    assert.ok(panelToDxf(side).includes('DRILL_OUTSIDE_D18MM'));
    const sheet = { sheetWidth: 1220, sheetHeight: 2440, index: 0,
      placements: [{ panel: side, x: 10, y: 10, width: side.cutHeight, height: side.cutWidth, rotated: true }] };
    assert.ok(sheetToDxf(sheet).includes('DRILL_OUTSIDE_D18MM'));
  }
  assert.equal(hardwareBom(restored, panels).find(row => row.unit === 'screws').quantity, total);
  config.rearStripHeight = config.height;
  assert.ok(validateCabinet(config).some(message => message.includes('Rear mounting strips omitted')));
}
console.log('PASS: mounting strips, shelf clearance, exterior screw bore alignment, saved settings, BOM and DXF layers');
