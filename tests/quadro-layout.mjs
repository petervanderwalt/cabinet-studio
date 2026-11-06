import assert from 'node:assert/strict';
import { computePanels, defaultCabinet } from '../js/cabinet-math.js';
import { frontLayout, rearInset } from '../js/front-layout.js';
import { HARDWARE_MODELS } from '../js/hardware-models.js';
import { panelBores } from '../js/panel-bores.js';
import { buildNestingPlan } from '../js/nesting.js';
import { applyHardwarePreset, hardwareBom } from '../js/hardware-library.js';
import { normalizeProject, createProjectFromConfig, buildProjectPanels } from '../js/project-io.js';
globalThis.window = { JSZip: (await import('../lib/jszip.min.js')).default };
const { downloadManufacturingZip, machiningSchedule } = await import('../js/dxf-writer.js');
let downloaded;
globalThis.URL.createObjectURL = blob => { downloaded = blob; return 'blob:quadro'; };
globalThis.URL.revokeObjectURL = () => {};
globalThis.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };

const minimumDepths = {
  '2d': [242.5, 318.5, 395, 471, 547, 623.5],
  '5d': [242.5, 318.5, 395, 471, 547.1, 623.5],
};

for (const [length, part, middle, rear, boxLength = length, family = '2d'] of [
  [229, '9304257', 133, 229, 228.6],
  [305, '9304260', 165, 261],
  [381, '9304266', 165, 357],
  [457, '9304274', 261, 453],
  [533, '9304282', 261, 517],
  [610, '9304286', 261, 453, 609.6],
  [229, '9375480', 165, 229, 228.6, '5d'],
  [305, '9375481', 197, 261, 304.8, '5d'],
  [381, '9375482', 197, 357, 381, '5d'],
  [457, '9375483', 293, 453, 457.2, '5d'],
  [533, '9375484', 293, 517, 533.4, '5d'],
  [610, '9375485', 293, 453, 609.6, '5d'],
]) {
  const config = applyHardwarePreset(defaultCabinet(), `runner-hettich-quadro-${family}`);
  if (family === '2d') {
    assert.equal(config.hardware.quadroManualMiddle,true);
    config.hardware.quadroManualMiddle=false;
    assert.equal(applyHardwarePreset(config,'runner-hettich-quadro-2d').hardware.quadroManualMiddle,false);
  }
  config.front.mode = 'drawers';
  config.drawers.count = 1;
  config.drawers.heights = [frontLayout(config).height];
  config.drawers.sideThickness = 16;
  config.hardware.runnerLength = length;
  config.depth = 750;
  const project = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config))));
  const saved = project.cabinets[0].config;
  assert.equal(saved.hardware.runnerMode, `hettich-quadro-${family}`);
  assert.equal(saved.hardware.runnerLength, length);
  const panels = computePanels(saved);
  const bottom = panels.find(p => p.id === 'bottom');
  const back = panels.find(p => p.id === 'drawer-1-back');
  for (const [index, side] of ['left', 'right'].entries()) {
    const panel = panels.find(p => p.id === 'side-' + side);
    const mounts = panel.holes.filter(h => h.purpose === 'quadro-runner-mount');
    assert.deepEqual(mounts.map(h => side === 'left' ? h.x : panel.cutWidth - h.x), [10, 37, middle, rear]);
    const [placement, closed] = panel.hardwareModels;
    assert.deepEqual(closed, {...placement, model:placement.model + '-closed', closedOnly:true, drawerId:'drawer-1'});
    assert.ok(HARDWARE_MODELS[closed.model].positions.length > 0);
    const moving = back.hardwareModels[index];
    assert.equal(moving.model, placement.model + '-moving');
    assert.ok(!moving.closedOnly && HARDWARE_MODELS[moving.model].positions.length > 0);
    for (const [axis, position] of [['x','posX'], ['y','posY'], ['z','posZ']]) {
      assert.ok(Math.abs(back[position] + moving[axis] - panel[position] - placement[axis]) < 0.001);
    }
    const model = HARDWARE_MODELS[placement.model];
    assert.equal(Math.sign(model.positions.find((x, i) => i % 3 === 0 && Math.abs(x) > 1)), side === 'left' ? 1 : -1);
    const axes = model.mountingCentres.map(([x, y, z]) => [x + placement.x, y + placement.y, z + placement.z]);
    const starts = panelBores(panel).filter(b => b.purpose === 'quadro-runner-mount').map(b => b.start);
    assert.deepEqual(axes, starts);
    assert.ok(panel.posY + placement.y - bottom.posY - bottom.sizeY / 2 >= 38 - 0.001);
  }
  const hookHeight = family === '5d' ? 10.9 : 11;
  assert.deepEqual(back.holes.map(h => [h.x, h.y, h.diameter, h.depth]), [[7, hookHeight, 6, 10], [back.cutWidth - 7, hookHeight, 6, 10]]);
  const side = panels.find(p => p.id === 'drawer-1-side-left');
  assert.equal(side.cutWidth, boxLength);
  assert.equal(panels.find(p => p.id === 'drawer-1').runnerTravel, boxLength);
  assert.ok(Math.abs(back.posZ + back.sizeZ / 2 - (boxLength - 2)) < 0.001);
  assert.equal(side.posZ - side.sizeZ / 2, -2);
  assert.equal(side.grooves[0].y, 12.7);
  const recess = back.posY - back.sizeY / 2 - (side.posY - side.sizeY / 2);
  assert.ok(Math.abs(recess - (family === '5d' ? 12.8 : 12.7)) < 0.001);
  assert.ok(Math.abs(recess + hookHeight - 23.7) < 0.001);
  assert.ok(buildProjectPanels(project).some(p => p.holes.some(h => h.purpose === 'quadro-runner-mount')));
  const bores = machiningSchedule(panels).panels.flatMap(p => p.faceBores);
  assert.equal(bores.filter(h => h.purpose === 'quadro-runner-mount').length, 8);
  assert.equal(bores.filter(h => h.purpose === 'quadro-rear-hook').length, 2);
  assert.ok(hardwareBom(saved, panels).some(row => row.item.includes(part)));
  assert.ok(hardwareBom(saved, panels).some(row => row.item === 'Hettich 9306540'));
  {
    const flushConfig=structuredClone(saved);
    flushConfig.hardware.quadroFrontGap=0;
    const flushSaved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(flushConfig)))).cabinets[0].config;
    assert.equal(flushSaved.hardware.quadroFrontGap,0);
    const flush=computePanels(flushSaved);
    for (const p of flush.filter(p=>p.type==='drawer' || p.type==='drawer-box')) {
      const gapped=panels.find(q=>q.id===p.id);
      assert.ok(Math.abs(p.posZ-gapped.posZ-2)<0.001);
      assert.equal(p.cutWidth,gapped.cutWidth);
    }
    for (const side of ['left','right']) {
      const panel=flush.find(p=>p.id==='side-'+side);
      const bores=panelBores(panel).filter(b=>b.purpose==='quadro-runner-mount');
      assert.deepEqual(bores.map(b=>Math.round(b.start[2]+panel.sizeZ/2)),[12,39,middle+2,rear+2]);
      const [fixed,closed]=panel.hardwareModels;
      assert.equal(closed.drawerId,'drawer-1');
      assert.deepEqual(HARDWARE_MODELS[fixed.model].mountingCentres.map(([x,y,z])=>[x+fixed.x,y+fixed.y,z+fixed.z]),bores.map(b=>b.start));
    }
  }
  const lengthIndex = [229, 305, 381, 457, 533, 610].indexOf(length);
  if (family === '2d') {
    for (const gap of [0,2]) {
      const manual = structuredClone(saved);
      Object.assign(manual.hardware,{quadroManualMiddle:true,quadroFrontGap:gap});
      const project = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(manual))));
      const config = project.cabinets[0].config;
      const panels = computePanels(config);
      assert.match(hardwareBom(config,panels).find(row=>row.unit==='runner pairs').note,/Middle pilot omitted/);
      const shift = 2-gap;
      for (const hand of ['left','right']) {
        const side = panels.find(p=>p.id===`side-${hand}`);
        const depths = side.holes.filter(h=>h.purpose==='quadro-runner-mount').map(h=>hand==='left'?h.x:side.cutWidth-h.x);
        assert.deepEqual(depths,[10+shift,37+shift,rear+shift]);
        assert.equal(side.hardwareModels.length,2);
        assert.ok(side.hardwareWarnings.some(w=>w.includes('Middle pilot omitted')));
        assert.ok(side.hardwareWarnings.some(w=>w.includes(`middle fixing is ${middle+shift} mm from the cabinet front in the January 2025 pattern and ${middle+shift+32} mm`)));
      }
      if (length===533 && gap===0) {
        const nestingPlan=buildNestingPlan(panels,config.nesting);
        assert.equal(nestingPlan.unplaced.length,0);
        await downloadManufacturingZip({config,panels,project,nestingPlan});
        const zip = await window.JSZip.loadAsync(await downloaded.arrayBuffer());
        const schedule = JSON.parse(await zip.file('machining-schedule.json').async('string'));
        assert.equal(schedule.panels.flatMap(p=>p.faceBores).filter(h=>h.purpose==='quadro-runner-mount').length,6);
        assert.match(await zip.file('manifest.txt').async('string'),/Middle pilot omitted/);
        const sheets=zip.file(/^nested-sheets\/.*\.dxf$/);
        assert.ok(sheets.length>0);
        const drawings=await Promise.all(sheets.map(file=>file.async('string')));
        assert.equal(drawings.flatMap(dxf=>dxf.match(/\n0\nCIRCLE\n8\nDRILL_INSIDE_D8MM\n/g) || []).length,6);
      }
    }
  }
  for (const gap of [2, 0]) {
    const tight = structuredClone(saved);
    tight.backMount = 'grooved-in';
    tight.hardware.quadroFrontGap = gap;
    tight.depth = minimumDepths[family][lengthIndex] + 2 - gap
      + tight.materials.doorThickness + rearInset(tight);
    const fitted = computePanels(tight);
    const sideSetups = machiningSchedule(fitted).panels.filter(p =>
      p.faceBores.some(h=>h.purpose==='quadro-runner-mount'));
    assert.equal(sideSetups.length,2);
    for (const setup of sideSetups) {
      assert.equal(setup.warnings.filter(w=>w.includes('uses the 12 mm first fixing')).length,gap===0?1:0);
      assert.equal(setup.warnings.filter(w=>w.includes('blocks access to the rear cabinet fixing')).length,
        length===229 || length===457 ? 1 : 0);
    }
    const cabinetBack = fitted.find(panel => panel.id === 'back');
    const backFace = cabinetBack.posZ - cabinetBack.sizeZ / 2;
    const drawerBack = fitted.find(panel => panel.id === 'drawer-1-back');
    assert.equal(drawerBack.hardwareModels?.length, 2);
    for (const sideId of ['side-left', 'side-right', drawerBack.id]) {
      const caseSide = fitted.find(panel => panel.id === sideId);
      assert.equal(caseSide.hardwareModels?.length, 2, `${part} at its minimum depth, gap ${gap}`);
      for (const placement of caseSide.hardwareModels) {
        const { positions } = HARDWARE_MODELS[placement.model];
        let rear = -Infinity;
        for (let i = 2; i < positions.length; i += 3) rear = Math.max(rear, positions[i]);
        assert.ok(caseSide.posZ + placement.z + rear <= backFace + 0.0001,
          `${placement.model} must clear the inside back face`);
      }
    }
    tight.depth -= 0.01;
    const tooShallow = computePanels(tight);
    assert.ok(tooShallow.every(panel => panel.type !== 'drawer-box'
      && !panel.hardwareModels?.length
      && !panel.holes.some(hole => hole.purpose === 'quadro-runner-mount')));
  }
  if (length === 533) {
    project.cabinets[0].qty = 2;
    await downloadManufacturingZip({ config: saved, project, panels: buildProjectPanels(project) });
    const zip = await window.JSZip.loadAsync(await downloaded.arrayBuffer());
    for (const filename of ['manifest.txt', 'project-manifest.txt']) {
      const manifest = await zip.file(filename).async('string');
      assert.match(manifest, new RegExp(`1 runner pairs: Hettich Quadro ${family.toUpperCase()} V6 ${part}`));
      assert.match(manifest, family === '5d' ? /WARNING: Quadro 5D V6:.*0\.1 mm clearance/ : /WARNING: Quadro 2D V6 9304282:.*middle fixing is 261 mm.*293 mm/);
    }
    const schedule = JSON.parse(await zip.file('machining-schedule.json').async('string'));
    assert.equal(schedule.panels.flatMap(p => p.faceBores).filter(h => h.purpose === 'quadro-runner-mount').length, 16);
    const warning = family === '5d' ? /0\.1 mm clearance/ : /middle fixing is 261 mm.*293 mm/;
    assert.ok(schedule.panels.some(p => p.warnings.some(w => warning.test(w))));
    const innerFronts = schedule.panels.filter(p => p.warnings.some(w => /fit Hettich 9306540 clips.*5\/8-inch/.test(w)));
    assert.equal(innerFronts.length, 2);
    assert.ok(innerFronts.every(p => p.faceBores.length === 0));
    if (family === '2d') {
      const sides=schedule.panels.filter(p=>p.faceBores.some(h=>h.purpose==='quadro-runner-mount'));
      assert.equal(sides.length,4);
      assert.ok(sides.every(p=>p.warnings.filter(w=>warning.test(w)).length===1));
    }
  }
  for (const thickness of [12.7, 13, 15.875]) {
    saved.drawers.sideThickness = thickness;
    const thinPanels = computePanels(saved);
    const thinSide = thinPanels.find(p => p.id === 'drawer-1-side-left');
    assert.equal(thinSide.cutThickness, thickness);
    assert.ok(Math.abs(thinSide.grooves[0].y - (family === '5d' && thickness <= 13 ? 12.8 : 12.7)) < 0.001);
    const thinBottom = thinPanels.find(p => p.id === 'drawer-1-bottom');
    assert.ok(Math.abs(thinBottom.posY - thinBottom.sizeY / 2 - (thinSide.posY - thinSide.sizeY / 2) - thinSide.grooves[0].y) < 0.001);
    assert.ok(Math.abs(thinSide.posX - thinSide.sizeX / 2 - saved.materials.caseThickness - (21 - thickness)) < 0.001);
    assert.ok(thinPanels.find(p => p.id === 'side-left').hardwareModels.length === 2);
    const bom = hardwareBom(saved, thinPanels);
    const clip = bom.find(row => row.unit === 'locking-device pairs');
    assert.equal(clip.item, thickness <= 13 ? 'Hettich 9306539' : 'Hettich 9306540');
    assert.match(clip.note, thickness <= 13 ? /3\/4-inch/ : /5\/8-inch/);
    const screws = bom.find(row => row.unit === 'locking-device screws');
    assert.match(screws.item, thickness <= 13 ? /3\/4-inch/ : /5\/8-inch/);
    assert.equal(screws.quantity, clip.quantity*4);
    const innerFront = thinPanels.find(p => p.id === 'drawer-1-inner-front');
    const setup = innerFront.hardwareWarnings.join(' ');
    assert.match(setup, thickness <= 13 ? /9306539 clips.*3\/4-inch/ : /9306540 clips.*5\/8-inch/);
    assert.match(setup, /31 and 55 mm inboard/);
    assert.ok(setup.includes(`and ${thickness <= 13 ? 6.4 : 8} mm from the inner front's rear face`));
    assert.ok(setup.includes(`mark 31, 55, ${innerFront.cutWidth-55}, ${innerFront.cutWidth-31} mm`));
    assert.equal(setup.includes('about 3.1 mm farther back'),thickness <= 13);
  }
  saved.drawers.sideThickness = 14;
  const unsupported = computePanels(saved);
  assert.ok(unsupported.every(p => p.type !== 'drawer-box' && !p.holes.some(h => h.purpose === 'quadro-runner-mount')));
  assert.ok(!hardwareBom(saved, unsupported).some(row => row.unit === 'locking-device screws'));

  for (const thickness of [13, 16]) {
    saved.drawers.sideThickness = thickness;
    saved.width = 130 + 42 + 2 * saved.materials.caseThickness;
    const minimum = computePanels(saved);
    assert.equal(minimum.find(p => p.id === 'drawer-1-inner-front').cutWidth, 130);
    assert.ok(hardwareBom(saved, minimum).some(row => row.unit === 'locking-device pairs'));

    saved.width -= 0.1;
    const undersize = computePanels(saved);
    assert.ok(undersize.some(p => p.hardwareWarnings?.some(w => w.includes('at least 130 mm inside drawer width'))));
    assert.ok(undersize.every(p => p.type !== 'drawer-box' && !p.holes.some(h => h.purpose === 'quadro-runner-mount')));
    assert.ok(!hardwareBom(saved, undersize).some(row => ['runner pairs', 'locking-device pairs', 'locking-device screws'].includes(row.unit)));
  }
}
console.log('PASS: six lengths each for Quadro 2D and 5D, mirrored cabinet holes, hook bores, drawer fit, saved presets and BOM');
