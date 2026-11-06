import assert from 'node:assert/strict';
import {defaultCabinet,computePanels,validateCabinet} from '../js/cabinet-math.js';
import {applyHardwarePreset,selectedHardware,hardwareBom} from '../js/hardware-library.js';
import {createProjectFromConfig,normalizeProject} from '../js/project-io.js';
globalThis.window={};
const {panelToDxf,sheetToDxf,machiningSchedule}=await import('../js/dxf-writer.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.001,`${a} != ${b}`);
function drillCircles(dxf, layer) {
  const tags = dxf.trim().split(/\r?\n/);
  const circles = [];
  for (let i = 0; i < tags.length; i += 2) {
    if (Number(tags[i]) !== 0 || tags[i+1] !== 'CIRCLE') continue;
    const values = new Map();
    for (let j = i + 2; j < tags.length && Number(tags[j]) !== 0; j += 2) {
      values.set(Number(tags[j]), tags[j+1]);
    }
    if (values.get(8) === layer) circles.push({ x: Number(values.get(10)), y: Number(values.get(20)), r: Number(values.get(40)) });
  }
  return circles;
}
function checkNestedCircles(panel, layer, expected) {
  const {cutWidth,cutHeight}=panel;
  const sheet=sheetToDxf({index:0,sheetWidth:2440,sheetHeight:1220,placements:[
    {panel,x:20,y:30,width:cutHeight,height:cutWidth,rotated:true},
  ]});
  const actual=drillCircles(sheet,layer);
  assert.equal(actual.length,expected.length);
  for (const {x,y,r} of expected) {
    assert.ok(actual.some(circle=>Math.hypot(circle.x-(20+cutHeight-y),circle.y-(30+x))<0.001
      && circle.r===r), `${panel.id} ${layer}: missing rotated bore at ${x}, ${y}`);
  }
}
for (const [preset,thickness,reveal,cupInset] of [
  ['hinge-blum-71b3550',18,3,23],
  ['hinge-blum-71b3550-19mm',19,4,23.5],
]) for(const height of [720,1350,1600]) for(const category of ['base','wall']) for(const side of ['both','left','right']) {
  let c=applyHardwarePreset(defaultCabinet(),preset);
  c.materials.caseThickness=c.materials.doorThickness=thickness;c.reveal=reveal;
  c.height=height;c.category=category;c.doors.count=side==='both'?2:1;c.doors.hingeSide=side;
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  assert.equal(selectedHardware(c).find(p=>p.category==='hingePlate').id,'plate-blum-173h7100');
  const panels=computePanels(c),doors=panels.filter(p=>p.type==='door');
  let hingeCount=0;
  for(const door of doors) {
    const right=door.hingeSide==='right',sign=right?-1:1;
    const wall=panels.find(p=>p.id===(right?'side-right':'side-left'));
    near((wall.posZ-wall.sizeZ/2)-(door.posZ+door.sizeZ/2),1.5);
    const cups=door.holes.filter(h=>h.purpose==='hinge-cup');hingeCount+=cups.length;
    const cups3d=door.hardwareModels.filter(p=>p.model==='blum-71b3550-cup');
    const links=door.hardwareModels.filter(p=>p.model==='blum-71b3550');
    const arms=wall.hardwareModels.filter(p=>p.model==='blum-71b3550-arm');
    assert.equal(cups3d.length,cups.length);
    assert.equal(arms.length,cups.length);
    for (const [i,cup] of cups3d.entries()) {
      const arm=arms[i];
      assert.deepEqual(cup,{...links[i],model:'blum-71b3550-cup',closedOnly:false});
      assert.equal(links[i].closedOnly,true);
      assert.equal(arm.closedOnly,undefined);
      assert.equal(arm.openOnly,undefined);
      assert.equal(arm.mirrorX,cup.mirrorX);
      near(door.posX+cup.x-wall.posX-arm.x,sign*6.5);
      near(door.posY+cup.y-wall.posY-arm.y,0);
      near(wall.posZ+arm.z-door.posZ-cup.z,38.5);
    }
    const fixings=door.holes.filter(h=>h.purpose==='hinge-cup-fixing');
    const plate=wall.holes.filter(h=>h.purpose==='hinge-mounting-plate');
    const doorDxf=panelToDxf(door);
    const cupCircles=drillCircles(doorDxf,'DRILL_BACK_D13MM');
    const fixingCircles=drillCircles(doorDxf,'DRILL_BACK_D3MM');
    const plateCircles=drillCircles(panelToDxf(wall),'DRILL_INSIDE_D3MM');
    assert.equal(fixings.length,cups.length*2);assert.equal(plate.length,cups.length*2);
    assert.equal(cupCircles.length,cups.length);
    assert.equal(fixingCircles.length,cups.length*2);
    assert.equal(plateCircles.length,cups.length*2);
    for(const cup of cups) {
      const inset=right?door.cutWidth-cup.x:cup.x;
      near(inset,cupInset);near(inset-17.5+11,c.materials.caseThickness-c.reveal/2);
      assert.equal(cup.diameter,35);assert.equal(cup.depth,13);assert.equal(cup.face,'back');
      assert.ok(cupCircles.some(h=>Math.hypot(h.x-cup.x,h.y-cup.y)<0.001 && h.r===17.5));
      for(const dy of [-22.5,22.5]) assert.ok(fixings.some(h=>Math.abs(h.x-cup.x-sign*9.5)<0.001
        && Math.abs(h.y-cup.y-dy)<0.001 && h.diameter===2.5 && h.depth===3 && h.face==='back'));
      const y=door.posY+cup.y-door.cutHeight/2-wall.posY+wall.cutHeight/2;
      for(const dy of [-22.5,22.5]) assert.ok(fixingCircles.some(h=>Math.hypot(h.x-cup.x-sign*9.5,h.y-cup.y-dy)<0.001 && h.r===1.25));
      for(const dy of [-16,16]) assert.ok(plateCircles.some(h=>Math.hypot(h.x-(right?wall.cutWidth-37:37),h.y-y-dy)<0.001 && h.r===1.25));
      for(const dy of [-16,16]) assert.ok(plate.some(h=>Math.abs(h.x-(right?wall.cutWidth-37:37))<0.001
        && Math.abs(h.y-y-dy)<0.001 && h.diameter===2.5 && h.depth===3 && h.face==='inside'));
    }
    checkNestedCircles(door,'DRILL_BACK_D13MM',cupCircles);
    checkNestedCircles(door,'DRILL_BACK_D3MM',fixingCircles);
    checkNestedCircles(wall,'DRILL_INSIDE_D3MM',plateCircles);
    const [doorSetup, wallSetup] = machiningSchedule([door,wall]).panels;
    assert.deepEqual(doorSetup.faceBores.filter(op=>op.purpose==='hinge-cup'),cups);
    assert.deepEqual(doorSetup.faceBores.filter(op=>op.purpose==='hinge-cup-fixing'),fixings);
    assert.deepEqual(wallSetup.faceBores.filter(op=>op.purpose==='hinge-mounting-plate'),plate);
  }
  const rows=hardwareBom(c,panels);
  const bom=rows.find(r=>r.unit==='hinge / plate sets');
  assert.equal(bom.quantity,hingeCount);assert.match(bom.item,/71B3550/);assert.match(bom.item,/173H7100/);
  assert.equal(rows.find(r=>r.unit==='hinge cup screws').quantity,hingeCount*2);
  assert.equal(rows.find(r=>r.unit==='hinge plate screws').quantity,hingeCount*2);
  const placements = panels.flatMap(p=>p.hardwareModels || []);
  assert.equal(placements.filter(p=>p.model==='blum-71b3550').length, hingeCount);
  assert.equal(placements.filter(p=>p.model==='blum-173h7100').length, hingeCount);
  c.materials.caseThickness=19.05;
  assert.ok(computePanels(c).every(p=>!p.holes.some(h=>h.purpose==='hinge-cup-fixing')));
  assert.ok(validateCabinet(c).some(w=>w.includes(`${thickness} mm frameless`)));
  c.materials.caseThickness=thickness;c.hardware.hingeBoreInset=24;
  assert.ok(computePanels(c).every(p=>!p.holes.some(h=>h.purpose==='hinge-cup-fixing')),'custom cup must not claim matched fixing geometry');
}
let c=applyHardwarePreset(defaultCabinet(),'hinge-blum-71b3550');
const recessedKnob=applyHardwarePreset(c,'handle-hettich-9070556');
recessedKnob.doors.count=1;
recessedKnob.doors.hingeSide='left';
const recessedDoor=()=>computePanels(recessedKnob).find(p=>p.type==='door');
const cupDoor=recessedDoor();
const targetCup=cupDoor.holes.find(h=>h.purpose==='hinge-cup');
recessedKnob.hardware.doorHandleHeight=targetCup.y;
recessedKnob.hardware.handleEdgeOffset=cupDoor.cutWidth-targetCup.x-34;
assert.ok(recessedDoor().hardwareWarnings.some(w=>w.includes('intersect hinge drilling')));
recessedKnob.hardware.handleEdgeOffset=cupDoor.cutWidth-targetCup.x-36;
assert.ok(recessedDoor().holes.some(h=>h.purpose==='handle' && h.depth===8));
assert.ok(recessedDoor().hardwareModels.some(model=>model.model==='hettich-9070556'));
for (const hand of ['left','right']) {
  const withKnob=applyHardwarePreset(c,'handle-hettich-9070740');
  withKnob.doors.count=1;
  withKnob.doors.hingeSide=hand;
  const initial=computePanels(withKnob).find(p=>p.type==='door');
  assert.ok(initial.hardwareModels.some(model=>model.model==='hettich-9070740'));
  for (const purpose of ['hinge-cup','hinge-cup-fixing']) {
    const target=initial.holes.find(h=>h.purpose===purpose);
    withKnob.hardware.handleEdgeOffset=hand==='left'?initial.cutWidth-target.x:target.x;
    withKnob.hardware.doorHandleHeight=target.y;
    const panels=computePanels(withKnob);
    const door=panels.find(p=>p.type==='door');
    assert.ok(door.hardwareWarnings.some(w=>w.includes('Handle bores omitted because they intersect hinge drilling')));
    assert.ok(door.holes.some(h=>h.purpose===purpose));
    assert.ok(!machiningSchedule([door]).panels[0].faceBores.some(h=>h.purpose==='handle'));
    assert.ok(!door.hardwareModels.some(model=>model.model==='hettich-9070740'));
    assert.ok(!hardwareBom(withKnob,panels).some(row=>row.unit==='knobs'));
  }
}
for (const type of ['inset','partial-overlay']) {
  const changed=structuredClone(c);
  changed.overlay.type=type;
  const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(changed)))).cabinets[0].config;
  const panels=computePanels(saved);
  assert.ok(panels.some(p=>p.type==='door'));
  assert.ok(machiningSchedule(panels).panels.every(p=>p.faceBores.every(b=>!b.purpose.startsWith('hinge-'))));
  assert.ok(!hardwareBom(saved,panels).some(row=>row.unit==='hinge / plate sets'));
  assert.ok(validateCabinet(saved).some(w=>w.includes('requires full overlay')));
}
c.hardware.hingePlateDiameter=3;
c.hardware.hingePlateDepth=12;
const savedPlatePilots=computePanels(c).flatMap(p=>p.holes).filter(h=>h.purpose==='hinge-mounting-plate');
assert.ok(savedPlatePilots.length>0);
assert.ok(savedPlatePilots.every(h=>h.diameter===3 && h.depth===12));
c=applyHardwarePreset(c,'plate-hettich-9071575');
assert.ok(validateCabinet(c).some(w=>w.includes('matching D0 plate')));
const unmatchedPanels=computePanels(c);
assert.ok(unmatchedPanels.every(p=>!p.holes.some(h=>h.purpose==='hinge-cup-fixing')));
const unmatchedDoor=unmatchedPanels.find(p=>p.type==='door');
near(unmatchedDoor.posZ+unmatchedDoor.sizeZ/2,0);
const unmatchedBom=hardwareBom(c,unmatchedPanels).find(r=>r.unit==='hinge / plate sets');
assert.ok(hardwareBom(c,unmatchedPanels).every(r=>!r.unit.startsWith('hinge ') || r.unit==='hinge / plate sets'));
assert.equal(unmatchedBom.item,'Custom / existing');
assert.equal(unmatchedBom.quantity,unmatchedPanels.flatMap(p=>p.holes).filter(h=>h.purpose==='hinge-cup').length);
c=applyHardwarePreset(defaultCabinet(),'hinge-blum-71b3550');
c.depth=40;
const shallow=computePanels(c);
assert.ok(shallow.some(p=>p.type==='door' && p.holes.some(h=>h.purpose==='hinge-cup')));
assert.ok(shallow.every(p=>!p.holes.some(h=>['hinge-cup-fixing','hinge-mounting-plate'].includes(h.purpose))));
assert.ok(shallow[0].hardwareWarnings.some(w=>w.includes('plate pilots do not fit')));
assert.equal(hardwareBom(c,shallow).find(r=>r.unit==='hinge / plate sets').item,'Custom / existing');
for(const id of ['hinge-blum-71b3550','hinge-hettich-9071205']) {
  c=applyHardwarePreset(defaultCabinet(),id);c.construction='face-frame';
  assert.ok(computePanels(c).every(p=>!p.holes.some(h=>h.purpose==='hinge-mounting-plate')));
}
for (const [base,thickness,reveal,overlay='full-overlay'] of [
  ['hinge-blum-71b3550',18,3],
  ['hinge-blum-71b3550-19mm',19,4],
  ['hinge-blum-71b3750',18,4,'inset'],
]) {
  const draft=applyHardwarePreset(defaultCabinet(),`${base}-86`);
  Object.assign(draft.materials,{caseThickness:thickness,doorThickness:thickness});
  draft.reveal=reveal;
  draft.overlay.type=overlay;
  const stopped=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(stopped);
  const doors=panels.filter(p=>p.type==='door');
  const cups=doors.flatMap(p=>p.holes).filter(h=>h.purpose==='hinge-cup');
  assert.ok(cups.length>0 && doors.every(p=>p.hingeOpeningLimit===86));
  const limiter=hardwareBom(stopped,panels).find(row=>row.item==='Blum 70T3553');
  assert.equal(limiter.quantity,cups.length);
  assert.ok(machiningSchedule(panels).panels.filter(p=>p.id.startsWith('door-')).every(p=>
    p.warnings.some(w=>w.includes('70T3553'))));
  const standard=applyHardwarePreset(stopped,base);
  const standardPanels=computePanels(standard);
  assert.deepEqual(panels.map(p=>p.holes),standardPanels.map(p=>p.holes));
  assert.ok(standardPanels.every(p=>p.hingeOpeningLimit===undefined));
  assert.ok(!hardwareBom(standard,standardPanels).some(row=>row.item==='Blum 70T3553'));
}
console.log('PASS: 36 Blum 71B3550/173H7100 assemblies, exact cup/fixing/plate axes, overlay, saved pair, BOM, machining output and unsupported/custom guards');

for (const hand of ['left','right']) {
  const draft=applyHardwarePreset(defaultCabinet(),'hinge-blum-71b3750');
  draft.doors.count=1;
  draft.doors.hingeSide=hand;
  draft.overlay.type='inset';
  draft.reveal=4;
  const config=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(config);
  const door=panels.find(p=>p.type==='door');
  const wall=panels.find(p=>p.id===`side-${hand}`);
  const sign=hand==='left'?1:-1;
  const cup=door.hardwareModels.find(p=>p.model==='blum-71b3750-cup');
  const arm=wall.hardwareModels.find(p=>p.model==='blum-71b3750-arm');
  assert.ok(machiningSchedule([door]).panels[0].warnings.some(w=>w.includes('R1 front-edge radius')));
  assert.ok(machiningSchedule([door]).panels[0].warnings.some(w=>w.includes('3 mm cup-edge distance') && w.includes('5 mm at a −2 mm front overlay')));
  assert.equal(door.posZ-door.sizeZ/2,0);
  near(door.posX+cup.x-wall.posX-arm.x,sign*22.5);
  near(door.posY+cup.y-wall.posY-arm.y,0);
  near(wall.posZ+arm.z-door.posZ-cup.z,38.5);
  assert.equal(wall.hardwareModels.filter(p=>p.model==='blum-173h7100-inset').length,2);
  const fixing=drillCircles(panelToDxf(door),'DRILL_BACK_D3MM');
  const plates=drillCircles(panelToDxf(wall),'DRILL_INSIDE_D3MM');
  assert.equal(fixing.length,4);
  assert.equal(plates.length,4);
  assert.ok(plates.every(h=>h.r===1.25 && h.x===(hand==='left'?56.5:wall.cutWidth-56.5)));
  assert.ok(fixing.every(h=>h.r===1.25 && h.x===(hand==='left'?30:door.cutWidth-30)));
  assert.match(hardwareBom(config,panels).find(r=>r.unit==='hinge / plate sets').item,/71B3750.*173H7100/);
  config.reveal=3;
  assert.ok(computePanels(config).every(p=>!p.holes.some(h=>h.purpose==='hinge-mounting-plate')));
}
console.log('PASS: exact inset Blum 71B3750/173H7100, both hands, mirrored pilots, closed CAD, save/load and unsupported reveal guard');
