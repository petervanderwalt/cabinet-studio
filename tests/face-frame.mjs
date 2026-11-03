import assert from 'node:assert/strict';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { frontLayout } from '../js/front-layout.js';
for (const mode of ['doors', 'drawers']) for (const category of ['base', 'wall']) for (const width of [38, 50]) {
  const config = defaultCabinet();
  Object.assign(config, { construction: 'face-frame', category });
  config.materials.faceFrameWidth = width;
  config.front.mode = mode;
  config.drawers.count = 3;
  config.drawers.heights = Array(3).fill((frontLayout(config).height - 2 * config.reveal) / 3);
  const panels = computePanels(config);
  const left = panels.find(p => p.id === 'stile-left'), right = panels.find(p => p.id === 'stile-right');
  for (const rail of panels.filter(p => p.id.startsWith('rail-'))) {
    assert.equal(rail.cutWidth, config.width - 2 * width);
    assert.equal(rail.sizeX, rail.cutWidth);
    assert.equal(rail.posX - rail.sizeX / 2, left.posX + left.sizeX / 2);
    assert.equal(rail.posX + rail.sizeX / 2, right.posX - right.sizeX / 2);
  }
}
console.log('PASS: face-frame rails meet stiles without overlap in door/drawer base/wall cabinets');
