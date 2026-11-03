import assert from 'node:assert/strict';
import { computePanels, defaultCabinet, validateCabinet } from '../js/cabinet-math.js';
import { frontLayout } from '../js/front-layout.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { runnerPattern } from '../js/runner-layout.js';
import { CabinetForm } from '../js/form-ui.js';
globalThis.window = {};
const { panelToDxf } = await import('../js/dxf-writer.js');

const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-7, `${a} != ${b}`);
for (const construction of ['frameless', 'face-frame']) for (const overlay of ['full-overlay', 'partial-overlay', 'inset']) {
  for (const toe of [0,100]) for (const thickness of [18,19.05,25]) {
    const c = defaultCabinet();
    c.construction = construction; c.toeKick.height = toe;
    c.materials.caseThickness = thickness;
    c.overlay = { type: overlay, amount: 9 };
    c.hasTop = true;
    const layout = frontLayout(c);
    near(CabinetForm.prototype._openingHeight.call({}, c), layout.height);
    const doors = computePanels(c).filter(p => p.type === 'door');
    near(doors[0].posX - doors[0].sizeX / 2, layout.left);
    near(doors[1].posX + doors[1].sizeX / 2, c.width - layout.left);
    near(doors[0].posY - doors[0].sizeY / 2, layout.bottom);
    near(doors[0].posZ, layout.z);
    near(doors[1].posX - doors[1].sizeX / 2 - doors[0].posX - doors[0].sizeX / 2, c.reveal);
    if (overlay === 'inset') {
      const frame = construction === 'frameless' ? thickness : c.materials.faceFrameWidth;
      assert.ok(layout.left > frame);
      near(doors[0].posZ - doors[0].sizeZ / 2, 0);
    }
    c.front.mode = 'drawers'; c.drawers.count = 3;
    c.drawers.heights = Array(3).fill((layout.height - 2*c.reveal)/3);
    c.hardware.drawerHandlePosition = 'center';
    const panels = computePanels(c);
    const boxes = panels.filter(p => p.type === 'drawer-box');
    assert.equal(boxes.length, 12);
    for (const box of boxes) {
      assert.ok(box.posY - box.sizeY / 2 >= layout.boxBottom - 1e-7);
      assert.ok(box.posY + box.sizeY / 2 <= layout.boxTop + 1e-7);
    }
    for (const p of panels.filter(p => p.type === 'drawer')) {
      for (const h of p.holes.filter(h => h.purpose === 'handle')) near(h.y, p.cutHeight / 2);
    }
  }
}
for (const length of [250,300,350,400,450,500,550,600,650,700]) for (const inset of [false,true]) {
  const c = applyHardwarePreset(defaultCabinet(), 'runner-3832e');
  c.depth = 800; c.hardware.runnerLength = length;
  c.overlay.type = inset ? 'inset' : 'full-overlay';
  c.front.mode = 'drawers'; c.drawers.count = 2;
  c.drawers.heights = Array(2).fill((frontLayout(c).height - c.reveal)/2);
  const panels = computePanels(c), pattern = runnerPattern(length);
  const left = panels.find(p => p.id === 'side-left');
  const right = panels.find(p => p.id === 'side-right');
  const box = panels.find(p => p.id === 'drawer-1-side-left');
  near(box.cutWidth, length);
  const holes = left.holes.filter(h => h.purpose === 'drawer-runner-mount');
  assert.equal(holes.length, 2 * pattern.cabinet.length);
  const mirrored = right.holes.filter(h => h.purpose === 'drawer-runner-mount');
  holes.forEach((h,i) => { near(h.x + mirrored[i].x, left.cutWidth); near(h.y,mirrored[i].y); });
  near(holes[0].x, 35 + (inset ? c.materials.doorThickness + 3.2 : 2));
  const boxHoles = box.holes.filter(h => h.purpose === 'drawer-slide-mount');
  assert.equal(boxHoles.length, pattern.drawer.length);
  near(box.posY - box.sizeY/2 + boxHoles[0].y, holes[0].y);
  assert.ok(panelToDxf(left).includes('CIRCLE'));
  assert.ok(!validateCabinet(c).some(w => /runner|pilot/.test(w)));
  c.hardware.runnerPattern = 'custom';
  c.hardware.runnerCabinetHoles = [30,150]; c.hardware.runnerDrawerHoles = [20,120];
  c.hardware.runnerHoleHeight = 25; c.hardware.runnerPilotDepth = 6;
  c.drawers.sideClearance = 15;
  let custom = computePanels(c);
  assert.equal(custom.find(p=>p.id==='side-left').holes.filter(h=>h.purpose==='drawer-runner-mount').length,4);
  c.hardware.runnerPilotDepth = 50;
  custom = computePanels(c);
  assert.equal(custom.flatMap(p=>p.holes).filter(h=>/-(runner|slide)-mount/.test(h.purpose)).length,0);
  assert.ok(validateCabinet(c).some(w=>w.includes('runner pilot')));
}
const tiny = defaultCabinet(); tiny.front.mode = 'drawers'; tiny.drawers.count = 2;
tiny.drawers.heights = [30, frontLayout(tiny).height - 33];
assert.ok(!computePanels(tiny).some(p=>p.id==='drawer-1-side-left'));
assert.ok(validateCabinet(tiny).some(w=>w.includes('insufficient box clearance')));
console.log('PASS: overlay bounds, 72 clear drawer assemblies, centred pulls, 20 Accuride patterns, custom pilots and invalid-fit guards');
