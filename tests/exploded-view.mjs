import assert from 'node:assert/strict';
import { frontLayout } from '../js/front-layout.js';
import { explodedPanels } from '../js/exploded-view.js';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
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
