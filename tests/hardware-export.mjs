import assert from 'node:assert/strict';
import { defaultCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { frontLayout } from '../js/front-layout.js';
import { createProjectFromConfig, buildProjectPanels, normalizeProject } from '../js/project-io.js';
import { setUnits } from '../js/units.js?v=20261020h';
globalThis.window = { JSZip: (await import('../lib/jszip.min.js')).default };
const { downloadManufacturingZip } = await import('../js/dxf-writer.js');
let downloaded;
globalThis.URL.createObjectURL = blob => { downloaded = blob; return 'blob:test'; };
globalThis.URL.revokeObjectURL = () => {};
globalThis.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
const config = applyHardwarePreset(applyHardwarePreset(defaultCabinet(), 'handle-knob'), 'dowel-8x30');
const project = createProjectFromConfig(config);
project.cabinets[0].qty = 2;
const panels = buildProjectPanels(project);
setUnits('imperial');
await downloadManufacturingZip({ config: project.cabinets[0].config, panels, project });
const zip = await window.JSZip.loadAsync(await downloaded.arrayBuffer());
const schedule = JSON.parse(await zip.file('machining-schedule.json').async('string'));
assert.equal(schedule.panels.length, panels.length);
assert.equal(schedule.units, 'mm');
const edges = schedule.panels.flatMap(p => p.edgeBores);
assert.equal(new Set(edges.map(b => b.joint)).size, edges.length);
for (const b of edges) assert.ok(schedule.panels.some(p => p.id === b.mate && p.faceBores.some(f => f.joint === b.joint)));
const manifest = await zip.file('manifest.txt').async('string');
assert.ok(manifest.includes('2 knobs:'), 'active cabinet manifest counts one copy');
assert.ok(!manifest.includes('4 knobs:'));
const projectManifest = await zip.file('project-manifest.txt').async('string');
assert.ok(projectManifest.includes('Hardware per cabinet (multiply by 2)'));
assert.ok(projectManifest.includes('31.496 x 28.346 x 22.047 in'));
assert.ok(projectManifest.includes('2 knobs:'));
assert.equal(Object.keys(zip.files).filter(name => name.startsWith('parts/') && name.endsWith('.dxf')).length, panels.length);
const quadro = applyHardwarePreset(defaultCabinet(), 'runner-hettich-quadro-2d');
quadro.front.mode = 'drawers';
quadro.depth = 680;
quadro.drawers.count = 2;
quadro.drawers.heights = Array(2).fill((frontLayout(quadro).height - quadro.reveal) / 2);
quadro.drawers.sideThickness = 13;
const quadroProject = createProjectFromConfig(quadro);
await downloadManufacturingZip({config:quadroProject.cabinets[0].config,panels:buildProjectPanels(quadroProject),project:quadroProject});
const quadroZip = await window.JSZip.loadAsync(await downloaded.arrayBuffer());
assert.match(await quadroZip.file('manifest.txt').async('string'),/8 locking-device screws: #6 × 3\/4-inch flat-head screws/);
console.log('PASS: real ZIP generation, two-copy hardware counts, unique mating schedules, per-part DXFs and consistent imperial manifest dimensions');

const overlay = applyHardwarePreset(applyHardwarePreset(defaultCabinet(), 'hinge-blum-71b3550-86'), 'handle-hettich-9064670-inner');
const inset = applyHardwarePreset(applyHardwarePreset(defaultCabinet(), 'hinge-blum-71b3750'), 'handle-hettich-9064670');
inset.overlay.type = 'inset';
inset.reveal = 4;
for (const hingeConfig of [overlay, inset]) {
  hingeConfig.doors.count = 1;
  hingeConfig.doors.hingeSide = 'left';
}
const tandem=applyHardwarePreset(defaultCabinet(),'runner-blum-563f');
const movento=applyHardwarePreset(defaultCabinet(),'runner-blum-763h');
for (const runnerConfig of [tandem,movento]) {
  runnerConfig.front.mode='drawers';
  runnerConfig.depth=600;
  runnerConfig.hardware.runnerLength=457;
  runnerConfig.drawers.count=1;
  runnerConfig.drawers.heights=[frontLayout(runnerConfig).height];
}
tandem.drawers.sideThickness=19;
movento.drawers.sideThickness=13;
const mixedProject = normalizeProject(JSON.parse(JSON.stringify({
  cabinets: [
    { id: 'overlay', name: 'Overlay cabinet', config: overlay },
    { id: 'inset', name: 'Inset cabinet', config: inset },
    { id: 'tandem', name: 'TANDEM cabinet', config: tandem },
    { id: 'movento', name: 'MOVENTO cabinet', config: movento },
  ],
})));
setUnits('metric');
await downloadManufacturingZip({
  config: mixedProject.cabinets[0].config,
  panels: buildProjectPanels(mixedProject),
  project: mixedProject,
});
const mixedZip = await window.JSZip.loadAsync(await downloaded.arrayBuffer());
const mixedSchedule = JSON.parse(await mixedZip.file('machining-schedule.json').async('string'));
for (const [cabinet, setback, pullPitch] of [['overlay', 37, 320], ['inset', 56.5, 360]]) {
  const cabinetPanels = mixedSchedule.panels.filter(panel => panel.id.startsWith(cabinet + '__'));
  const plateBores = cabinetPanels.flatMap(panel => panel.faceBores)
    .filter(bore => bore.purpose === 'hinge-mounting-plate');
  assert.equal(plateBores.length, 4, cabinet);
  for (const bore of plateBores) {
    assert.equal(bore.x, setback, cabinet);
    assert.equal(bore.face, 'inside');
    assert.equal(bore.diameter, 2.5);
    assert.equal(bore.depth, 3);
  }
  const radiusPanels = cabinetPanels.filter(panel => panel.warnings.some(warning => /R1 front-edge/.test(warning)));
  assert.equal(radiusPanels.length, cabinet === 'inset' ? 1 : 0);
  if (radiusPanels.length) assert.ok(radiusPanels[0].faceBores.some(bore => bore.purpose === 'hinge-cup'));
  const door = cabinetPanels.find(panel => panel.faceBores.some(bore => bore.purpose === 'hinge-cup'));
  assert.equal(door.warnings.some(warning=>/70T3553.*hinge closed.*door unclipped/.test(warning)),cabinet==='overlay');
  const pullBores = door.faceBores.filter(bore => bore.purpose === 'handle');
  assert.equal(pullBores.length, 2);
  assert.ok(Math.abs(Math.hypot(pullBores[1].x-pullBores[0].x, pullBores[1].y-pullBores[0].y)-pullPitch) < 0.001);
  const dxfName = Object.keys(mixedZip.files).find(name => name.startsWith('parts/') && name.endsWith(`-${door.id}.dxf`));
  assert.ok(dxfName, door.id);
  const dxf = await mixedZip.file(dxfName).async('string');
  assert.equal((dxf.match(/CIRCLE\r?\n8\r?\nDRILL_FRONT_D18MM/g) || []).length, 2);
}
const mixedManifest = await mixedZip.file('project-manifest.txt').async('string');
for (const family of ['tandem','movento']) {
  const runnerBores=mixedSchedule.panels.filter(panel=>panel.id.startsWith(family+'__'))
    .flatMap(panel=>panel.faceBores).filter(bore=>bore.purpose.endsWith('-runner-mount'));
  assert.equal(runnerBores.length,10);
  assert.ok(runnerBores.every(bore=>bore.purpose===family+'-runner-mount'));
}
assert.match(mixedManifest,/TANDEM cabinet[\s\S]*563F4570B[\s\S]*T51\.1901L \+ T51\.1901R[\s\S]*MOVENTO cabinet/);
assert.match(mixedManifest,/MOVENTO cabinet[\s\S]*763H4570S[\s\S]*T51\.7601L \+ T51\.7601R[\s\S]*T59\.K010M/);
assert.match(mixedManifest, /71B3550/);
assert.match(mixedManifest, /71B3750/);
assert.match(mixedManifest, /173H7100/);
assert.equal((mixedManifest.match(/2 hinge opening limiters: Blum 70T3553/g) || []).length,1);
assert.match(mixedManifest, /Capua 9064670 — 320 mm/);
assert.match(mixedManifest, /Capua 9064670 — 360 mm/);
console.log('PASS: mixed manufacturing ZIP keeps Blum hinge setbacks and Capua fixing pairs separate');
