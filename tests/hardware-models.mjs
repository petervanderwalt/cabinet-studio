import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { applyHardwarePreset, hardwareBom } from '../js/hardware-library.js';
import { HARDWARE_MODELS, ANZIO_MODELS, handleModelPlacement } from '../js/hardware-models.js';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
import { frontLayout } from '../js/front-layout.js';

globalThis.window={};
const {panelToDxf,machiningSchedule}=await import('../js/dxf-writer.js');
const model = HARDWARE_MODELS['hettich-1160018'];
assert.equal(model.positions.length % 9, 0);
assert.ok(model.positions.every(Number.isFinite));
assert.deepEqual(model.mountingCentres, [[-64, 0, 0], [64, 0, 0]]);
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.001, `${a} != ${b}`);
const touchIn=applyHardwarePreset(defaultCabinet(),'handle-hettich-9086690');
assert.ok(computePanels(touchIn).every(p=>!p.holes.some(h=>h.purpose==='handle-pocket')));
touchIn.materials.doorThickness=19;
const touchDoor=computePanels(touchIn).find(p=>p.type==='door');
const touchPocket=touchDoor.holes.find(h=>h.purpose==='handle-pocket');
assert.deepEqual([touchPocket.diameter,touchPocket.depth,touchPocket.face],[90,16,'front']);
const touchFixings=touchDoor.holes.filter(h=>h.purpose==='handle');
assert.deepEqual(touchFixings.map(h=>[h.diameter,h.depth,h.face]),[[5,3,'back'],[5,3,'back']]);
assert.match(panelToDxf(touchDoor),/HANDLE_POCKET_FRONT_D16MM/);
assert.match(panelToDxf(touchDoor),/DRILL_BACK_D3MM/);
assert.ok(touchDoor.hardwareModels.some(p=>p.model==='hettich-9086690'));
const albona684 = HARDWARE_MODELS['hettich-9069799'];
assert.deepEqual(albona684.mountingCentres,[[-342,0,0],[342,0,0]]);
assert.deepEqual(albona684.bounds[0],[-372,372]);
const albonaConfig=applyHardwarePreset(defaultCabinet(),'handle-hettich-9069799');
albonaConfig.front.mode='drawers';
albonaConfig.drawers.count=1;
albonaConfig.drawers.heights=[frontLayout(albonaConfig).height];
const albonaPanels=computePanels(albonaConfig);
const albonaFront=albonaPanels.find(p=>p.type==='drawer');
assert.equal(albonaFront.hardwareModels[0].model,'hettich-9069799');
assert.equal(panelToDxf(albonaFront).split('\n40\n2.75\n').length-1,2);
assert.ok(hardwareBom(albonaConfig,albonaPanels).some(row=>row.item.includes('9069799')));
for (const [sku, spacing] of [[9118858,96],[9069890,128],[9069893,160],[9070104,192],[9070106,224],[9070107,256],[9070108,288],
  [9070109,352],[9070110,416],[9070112,448],[9070113,640]]) {
  const model = HARDWARE_MODELS[`hettich-${sku}`];
  const step = readFileSync(new URL(`../assets/hardware/models/hettich-${sku}.step`, import.meta.url));
  assert.equal(model.sourceSha256, createHash('sha256').update(step).digest('hex'));
  assert.deepEqual(model.mountingCentres, [[-spacing/2,0,0],[spacing/2,0,0]]);
  assert.deepEqual(model.bounds[0], [-spacing/2-6,spacing/2+6]);
  assert.deepEqual(model.bounds[1], [-7,7]);
  assert.ok(Math.abs(model.bounds[2][0]+35) < 0.08);
  assert.equal(model.bounds[2][1], 0);
}
for (const [sku,pitch,diameter=5] of [[9070269,540,5.5],[9071041,480],[9071042,640],[9071043,720],[9071116,480],[9071118,640],[9071120,720]]) {
  const modelId=`hettich-${sku}`;
  assert.deepEqual(HARDWARE_MODELS[modelId].mountingCentres,[[-pitch,0,0],[0,0,0],[pitch,0,0]]);
  for (const mode of ['doors','drawers']) {
    const draft=applyHardwarePreset(defaultCabinet(),`handle-${modelId}`);
    draft.front.mode=mode;
    draft.width=2*pitch+100;
    draft.height=2*pitch+220;
    draft.doors.count=draft.drawers.count=1;
    draft.drawers.heights=[frontLayout(draft).height];
    const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
    const panels=computePanels(saved);
    const panel=panels.find(p=>['door','drawer'].includes(p.type));
    const holes=panel.holes.filter(h=>h.purpose==='handle');
    assert.equal(holes.length,3);
    const [placement]=panel.hardwareModels;
    assert.equal(placement.model,modelId);
    for(const [i,offset] of [-pitch,0,pitch].entries()) {
      near(holes[i].x,placement.x+panel.cutWidth/2+offset*Math.cos(placement.rotation));
      near(holes[i].y,placement.y+panel.cutHeight/2+offset*Math.sin(placement.rotation));
      near(holes[i].diameter,diameter);
    }
    assert.equal(panelToDxf(panel).split(`\n40\n${diameter/2}\n`).length-1,3);
    const bom=hardwareBom(saved,panels).find(row=>row.unit==='pulls');
    assert.equal(bom.quantity,1);
    if (sku!==9070269) assert.match(bom.note,/thread depth 8 mm/);
    holes[1].x+=1;
    assert.deepEqual(handleModelPlacement(panel,{model:modelId}),[]);
    saved.width=saved.height=2*pitch-1;
    const tooSmall=computePanels(saved);
    assert.ok(tooSmall.every(part=>!part.holes.some(h=>h.purpose==='handle')));
    assert.ok(!hardwareBom(saved,tooSmall).some(row=>row.unit==='pulls'));
  }
}
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
const salvia=HARDWARE_MODELS['hettich-9071003'];
const vadaSizes={
  '9070440':[78,30],'9070446':[115,30],'9070501':[152,30],'9070451':[190,32],'9070457':[228,32],
  '9070504':[263,32],'9070466':[300,32],'9070509':[339,32],'9070481':[376,34],'9070494':[394,41],
};
const salviaLengths={'9071003':157,'9071005':188,'9071008':220,'9071009':252,'9071012':284,'9071017':316,'9071020':348,'9071021':380,'9071023':412,'9071024':444,'9071026':508,'9071027':540,'9071030':700,'9071038':796};
const ticinumLengths={'9070583':50,'9070588':70,'9070593':90};
for(const model of [...ANZIO_MODELS,...['9070605','9070552','9070572',...Object.keys(vadaSizes),...Object.keys(salviaLengths),...Object.keys(ticinumLengths)].map(sku=>HARDWARE_MODELS[`hettich-${sku}`])]) for(const mode of ['doors','drawers']) {
  const spacing=model.mountingCentres[1][0]-model.mountingCentres[0][0];
  const salviaLength=salviaLengths[model.partNumber];
  const [vadaLength,vadaProjection]=vadaSizes[model.partNumber] ?? [];
  const ticinumLength=ticinumLengths[model.partNumber];
  const barWidth=model.partNumber==='9070605'?8:10;
  assert.ok(Math.abs(model.bounds[0][1]-model.bounds[0][0]-(ticinumLength ?? vadaLength ?? salviaLength ?? spacing+barWidth))<0.08);
  assert.ok(Math.abs(model.bounds[1][1]-model.bounds[1][0]-(ticinumLength?25:salviaLength?12:barWidth))<0.08);
  assert.ok(Math.abs(model.bounds[2][1]-model.bounds[2][0]-(vadaProjection ?? (ticinumLength?42:salviaLength?35:32)))<0.08);
  assert.equal(model.positions.length%9,0); assert.ok(model.positions.every(Number.isFinite));
  let c=applyHardwarePreset(defaultCabinet(),`handle-hettich-${model.partNumber}`);
  c.width=1600;c.height=1000;c.front.mode=mode;c.drawers.count=2;
  c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
  c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
  const panels=computePanels(c);
  if (ticinumLength || vadaLength || ['9070605','9070552','9070572'].includes(model.partNumber)) {
    const bores=machiningSchedule(panels).panels.flatMap(p=>p.faceBores).filter(h=>h.purpose==='handle');
    assert.equal(bores.length,4);
    assert.ok(bores.every(h=>h.diameter===5));
    assert.ok(hardwareBom(c,panels).some(row=>row.item.includes(model.partNumber) && row.quantity===2));
  }
  for(const panel of panels.filter(p=>['door','drawer'].includes(p.type))) {
    const placement=panel.hardwareModels[0],holes=panel.holes.filter(h=>h.purpose==='handle');
    assert.equal(placement.model,`hettich-${model.partNumber}`);
    model.mountingCentres.forEach(([x],i)=>{
      near(placement.x+x*Math.cos(placement.rotation),holes[i].x-panel.cutWidth/2);
      near(placement.y+x*Math.sin(placement.rotation),holes[i].y-panel.cutHeight/2);
    });
  }
  c.width=200;c.front.mode='drawers';
  if(spacing>200 || salviaLength>200 || vadaLength>200) {
    const fronts=computePanels(c).filter(p=>p.type==='drawer');
    assert.ok(fronts.every(p=>!p.hardwareModels),'oversized CAD must not stretch with adjusted drilling');
    if (vadaLength) assert.ok(fronts.every(p=>!p.holes.some(h=>h.purpose==='handle')));
  }
}
assert.deepEqual(salvia.mountingCentres,[[-48,0,0],[48,0,0]]);
const narrowFront={type:'drawer',cutWidth:120,cutHeight:100,sizeZ:18,
  holes:[{purpose:'handle',x:12,y:50},{purpose:'handle',x:108,y:50}]};
for(const [sku,spacing] of [['9071003',96],['9071005',128],['9071008',160],['9071009',192],['9071012',224],['9071017',256],['9071020',288],['9071021',320],['9071023',352],['9071024',384],['9071026',448],['9071027',480],['9071030',640],['9071038',736]]) {
  narrowFront.cutWidth=spacing+24;
  narrowFront.holes[1].x=12+spacing;
  assert.deepEqual(handleModelPlacement(narrowFront,{model:`hettich-${sku}`,keepWithinFront:true}),[]);
}
const salviaCabinet=applyHardwarePreset(defaultCabinet(),'handle-hettich-9071003');
salviaCabinet.front.mode='drawers';salviaCabinet.drawers.count=1;
salviaCabinet.drawers.heights=[frontLayout(salviaCabinet).height];
for(const [width,expected] of [[140,0],[200,1]]) {
  salviaCabinet.width=width;
  const panels=computePanels(salviaCabinet),front=panels.find(p=>p.type==='drawer');
  assert.equal(front.holes.filter(h=>h.purpose==='handle').length,expected*2);
  assert.equal(front.hardwareModels?.length ?? 0,expected);
  assert.equal(hardwareBom(salviaCabinet,panels).find(r=>r.unit==='pulls')?.quantity ?? 0,expected);
  if(!expected) assert.ok(front.hardwareWarnings.some(w=>w.includes('selected handle cannot fit')));
}
console.log('PASS: CAD dimensions, mounting axes coincide with door/drawer bores, save/load, generic/custom/no-handle fallback');

for (const [sku,spacing] of [[9070967,96],[9070972,128],[9070978,160],[9070982,192],[9070984,224],[9070988,256],[9070991,288],[9070993,320],[9070996,352],[9070999,384],[9071045,96],[9071046,128],[9071048,160],[9071050,192],[9071051,224],[9071052,256],[9071053,288],[9071054,320],[9071055,352],[9071056,384],[9071058,448],[9071111,480],[9071112,640],[9071115,736]]) {
  const draft=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
  draft.height=1000;
  const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panel=computePanels(saved).find(p=>p.type==='door');
  const holes=panel.holes.filter(h=>h.purpose==='handle');
  assert.equal(holes.length,2);
  near(Math.hypot(holes[1].x-holes[0].x,holes[1].y-holes[0].y),spacing);
  assert.equal(panel.hardwareModels[0].model,`hettich-${sku}`);
  assert.equal((panelToDxf(panel).match(/\n40\n2\.5\n/g) || []).length,2);
}

for (const [sku,length,centre] of [[9070102,108,53],[9070103,140,70],[9070117,172,86],
  [9070105,204,102],[9070118,236,118],[9070111,364,182],[9070101,137,68.5],[9070420,202,101],[9070421,362,181],
  ['9064670-inner',372,166],[9064670,372,186]]) {
  const c=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
  c.front.mode='drawers';
  c.drawers.count=1;
  c.drawers.heights=[frontLayout(c).height];
  c.width+=length-computePanels(c).find(p=>p.type==='drawer').cutWidth;
  const exactFit=computePanels(c).find(p=>p.type==='drawer');
  near(exactFit.cutWidth,length);
  near(exactFit.handlePlacement.x,centre);
  assert.equal(exactFit.hardwareModels[0].model,`hettich-${sku}`);
  c.width-=0.1;
  const panels=computePanels(c);
  const narrow=panels.find(p=>p.type==='drawer');
  assert.ok(narrow.hardwareWarnings.some(w=>w.includes('Handle bores omitted')));
  assert.ok(!narrow.hardwareModels?.length);
  assert.ok(!machiningSchedule([narrow]).panels[0].faceBores.some(h=>h.purpose==='handle'));
  assert.ok(!hardwareBom(c,panels).some(row=>row.unit==='pulls'));
}


for(const [sku,spacing] of [[9071060,96],[9071071,128],[9071073,160],[9071075,192],[9071079,256],[9071082,320]]) for(const mode of ['doors','drawers']) {
  const draft=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
  draft.front.mode=mode;
  draft.drawers.count=1;
  draft.drawers.heights=[frontLayout(draft).height];
  const config=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(config);
  const front=panels.find(p=>p.type===(mode==='doors'?'door':'drawer'));
  assert.equal(front.hardwareModels[0].model,`hettich-${sku}`);
  const schedule=machiningSchedule([front]).panels[0];
  const pocket=schedule.grooves.find(g=>g.purpose==='handle-recess');
  assert.equal(pocket.face,'front');
  near(Math.max(pocket.width,pocket.height),spacing+11.2);
  assert.equal(schedule.faceBores.filter(h=>h.purpose==='handle-corner-relief' && h.face==='front').length,4);
  assert.equal(schedule.faceBores.filter(h=>h.purpose==='handle' && h.face==='back' && h.depth===7).length,2);
  const dxf=panelToDxf(front);
  assert.match(dxf,/HANDLE_POCKET_FRONT_D11.2MM/);
  assert.match(dxf,/DRILL_FRONT_D11.2MM/);
  assert.match(dxf,/DRILL_BACK_D7MM/);
  assert.ok(hardwareBom(config,panels).some(r=>r.unit==='pulls' && r.item.includes(sku)));
  config.materials.doorThickness=15;
  assert.ok(computePanels(config).every(p=>!p.grooves.some(g=>g.purpose==='handle-recess')));
}
const routedNidum=applyHardwarePreset(defaultCabinet(),'handle-hettich-9071060');
routedNidum.doors.detailStyle='slats';
routedNidum.hardware.handleEdgeOffset=73.5;
let conflict=computePanels(routedNidum);
assert.ok(conflict.flatMap(p=>p.hardwareWarnings || []).some(w=>w.includes('Recessed pull machining omitted') && w.includes('decorative routing')));
routedNidum.doors.detailStyle='none';
routedNidum.hardware.handleEdgeOffset=375;
conflict=computePanels(routedNidum);
assert.ok(conflict.flatMap(p=>p.hardwareWarnings || []).some(w=>w.includes('Recessed pull machining omitted') && w.includes('hinge cup')));
for(const [sku,spacing,diameter=5] of [['115203',96],['9071737',128],['9071742',232],['9071751',448],['9071752',482],['9071753',532],['9071755',640],['9070487',96,5.5],['9070485',128,5.5],['9069953',192,5.5],['9069959',352,5.5],['1170155',160],['9080833',128],['9070096',64],['9071926-inner',160],['9071926',192],['9071929-inner',224],['9071929',256],['9064670-inner',320],['9064670',360],['9069942',96],['9070124',160],['9069815',96],['9069818',128],['9069821',224],['9069865',320],['9070102',96],['9070103',128],['9118858',96],['9069890',128],['9069893',160],['9070104',192],['9070106',224],['9070107',256],['9070108',288],['9070109',352],['9070110',416],['9070112',448],['9070113',640],['9070105',192],['9070117',160],['9070118',224],['9070119',320],['9070111',352],['9070120',480],['9070122',704],['9070101',128],['9070420',192],['9070421',352],['9071005',128],['9071008',160],['9071009',192],['9071012',224],['9071017',256],['9071020',288],['9071021',320],['9071023',352],['9071024',384],['9071026',448],['9071027',480],['9071030',640],['9071038',736]]) {
  const preset=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
  if (spacing >= 640) preset.height=1000;
  const c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(preset)))).cabinets[0].config;
  const panels=computePanels(c),door=panels.find(p=>p.type==='door');
  assert.equal(door.hardwareModels[0].model,`hettich-${sku}`);
  const bores=machiningSchedule([door]).panels[0].faceBores.filter(h=>h.purpose==='handle');
  assert.equal(bores.length,2);
  assert.ok(bores.every(h=>h.face==='front' && h.diameter===diameter && h.depth===door.cutThickness));
  near(Math.hypot(bores[1].x-bores[0].x,bores[1].y-bores[0].y),spacing);
  const placement=door.hardwareModels[0];
  for (const [x,y] of HARDWARE_MODELS[placement.model].mountingCentres) {
    const boreX=placement.x+door.cutWidth/2+x*Math.cos(placement.rotation)-y*Math.sin(placement.rotation);
    const boreY=placement.y+door.cutHeight/2+x*Math.sin(placement.rotation)+y*Math.cos(placement.rotation);
    assert.ok(bores.some(bore=>Math.hypot(bore.x-boreX,bore.y-boreY)<0.001), sku);
  }
  assert.match(panelToDxf(door),/CIRCLE\r?\n8\r?\nDRILL_FRONT_D18MM/);
  const bom=hardwareBom(c,panels).find(r=>r.unit==='pulls');
  assert.ok(bom.item.includes(sku.replace(/-inner$/,'')));
  assert.equal(bom.quantity,panels.filter(p=>p.type==='door').length);
}
for(const [sku,diameter,projection,pilot=5.5,width=diameter] of [['9070537',28,24,5],['9070581',30,27],['9070580',30,23],['9070740',25,22],['9070744',20,18],['9070735',30,26],['9070520',30,41],['9070263',14,22],['9070264',18,26.0868],['9070568',25,22],['9070562',25.5431,28],['9070575',30,23,5],['9071080',15,23,5],['9071109',25,20],['9080852',40,26,5,20],['9071857',24,30,5,19.778],['9071860',25,23,5],['9113224',25,23.6,5],['9113698',25,23,5],['9069816',35,39,5.5,18],['9071869',25,35,5],['9113635',21,21,5],['9070510',77.4,39.1,5,25.1]]) {
  const knob=HARDWARE_MODELS[`hettich-${sku}`];
  assert.deepEqual(knob.mountingCentres,[[0,0,0]]);
  assert.equal(knob.positions.length%9,0);
  assert.ok(knob.positions.every(Number.isFinite));
  for(let axis=0;axis<3;axis++) {
    const values=knob.positions.filter((_,i)=>i%3===axis);
    near(Math.min(...values),knob.bounds[axis][0]);
    near(Math.max(...values),knob.bounds[axis][1]);
  }
  [diameter,width].forEach((size,axis)=>{
    const [low,high]=knob.bounds[axis];
    assert.ok(Math.abs(high-low-size)<0.08);
  });
  assert.ok(Math.abs(knob.bounds[2][1]-knob.bounds[2][0]-projection)<0.08);
  for(const mode of ['doors','drawers']) for(const overlay of ['full-overlay','inset']) for(const thickness of [16,18,22]) {
    let c=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
    c.front.mode=mode;c.overlay.type=overlay;c.width=800;c.materials.doorThickness=thickness;
    c.drawers.count=2;c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
    c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
    const panels=computePanels(c),fronts=panels.filter(p=>['door','drawer'].includes(p.type));
    assert.equal(fronts.length,2);
    for(const p of fronts) {
      const holes=p.holes.filter(h=>h.purpose==='handle');
      assert.equal(holes.length,1);assert.equal(holes[0].diameter,pilot);
      assert.equal(holes[0].depth,thickness);
      const placement=p.hardwareModels[0];
      assert.equal(placement.model,`hettich-${sku}`);
      near(placement.x,holes[0].x-p.cutWidth/2);
      near(placement.y,holes[0].y-p.cutHeight/2);
      near(placement.z,-thickness/2);
      assert.ok(panelToDxf(p).includes(`\n40\n${pilot/2}\n`));
    }
    const bom=hardwareBom(c,panels).find(r=>r.unit==='knobs');
    assert.equal(bom.quantity,2);assert.ok(bom.item.includes(sku));
    if(sku==='9070510') assert.match(bom.note,/thread depth 8 mm/);
    c.hardware.handleHoleDiameter=6;
    assert.ok(computePanels(c).every(p=>!p.hardwareModels),'edited preset becomes custom');
  }
  const narrow=applyHardwarePreset(defaultCabinet(),`handle-hettich-${sku}`);
  narrow.width=diameter-1;
  narrow.doors.count=1;
  const panels=computePanels(narrow),door=panels.find(p=>p.type==='door');
  assert.ok(door.hardwareWarnings.some(w=>w.includes('selected knob cannot fit')));
  assert.ok(!door.holes.some(h=>h.purpose==='handle'));
  assert.ok(!hardwareBom(narrow,panels).some(r=>r.unit==='knobs'));
}
const tiny={type:'door',cutWidth:20,cutHeight:20,sizeZ:18,holes:[{purpose:'handle',x:10,y:10}]};
assert.deepEqual(handleModelPlacement(tiny,{model:'hettich-9070580'}),[],'do not display a scaled or overhanging knob');
tiny.cutWidth=100;tiny.cutHeight=100;tiny.holes[0].x=NaN;
assert.deepEqual(handleModelPlacement(tiny,{model:'hettich-9070580'}),[]);
console.log('PASS: exact knob models, saved door/drawer assemblies, single fixing axis, DXF, exact BOM and invalid/custom guards');

for (const mode of ['doors','drawers']) {
  const draft=applyHardwarePreset(defaultCabinet(),'handle-hettich-9070556');
  draft.front.mode=mode;
  draft.drawers.count=1;
  draft.drawers.heights=[frontLayout(draft).height];
  const config=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(config);
  const front=panels.find(p=>p.type===(mode==='doors'?'door':'drawer'));
  const [operation]=machiningSchedule([front]).panels[0].faceBores.filter(h=>h.purpose==='handle');
  assert.equal(operation.diameter,35);
  assert.equal(operation.depth,8);
  assert.equal(operation.face,'front');
  assert.match(panelToDxf(front),/DRILL_FRONT_D8MM/);
  assert.ok(hardwareBom(config,panels).some(row=>row.item.includes('9070556') && row.unit==='pulls'));
  config.materials.doorThickness=15;
  config.materials.drawerFrontThickness=15;
  assert.ok(computePanels(config).every(p=>!p.holes.some(h=>h.purpose==='handle')));
}
