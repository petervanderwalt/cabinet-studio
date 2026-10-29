import assert from 'node:assert/strict';
import { defaultCabinet, computePanels, validateCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset, hardwareBom } from '../js/hardware-library.js';
import { buildNestingPlan } from '../js/nesting.js';
import { addDados } from '../js/dado-joinery.js';
import { panelSolidData } from '../js/panel-solid.js';
import { createProjectFromConfig, normalizeProject, buildProjectPanels } from '../js/project-io.js';
globalThis.window = {};
const { panelToDxf, sheetToDxf, machiningSchedule } = await import('../js/dxf-writer.js');
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
for (const category of ['base','wall']) for (const hasTop of [false,true]) for (const backMount of ['grooved-in','applied-rear']) for (const construction of ['frameless','face-frame']) for (const T of [18,19.05]) {
  const c = applyHardwarePreset(defaultCabinet(),'dado');
  Object.assign(c,{category,hasTop,backMount,construction}); c.materials.caseThickness=T;
  const baseline = computePanels({...c, hardware:{...c.hardware, joineryType:'none'}});
  const parts = computePanels(c);
  assert.deepEqual(parts.flatMap(p=>p.hardwareWarnings||[]),[]);
  const mates = parts.filter(p=>p.id==='bottom');
  const sides = parts.filter(p=>p.id.startsWith('side-'));
  for (const p of mates) {
    near(p.cutWidth,c.width-2*T+12); near(p.sizeX,p.cutWidth);
    near(p.posX-p.sizeX/2,T-6);
    near(p.posX+p.sizeX/2,c.width-T+6);
    assert.equal(p.joinery.extensionPerSide,6);
    for (const side of sides) {
      const slot=side.grooves.find(g=>g.purpose==='dado'&&g.mate===p.id);
      assert.ok(slot); near(slot.y,p.posY-p.sizeY/2);
      near(slot.height,p.cutThickness+0.2); near(slot.depth,6);
      assert.equal(slot.width,side.cutWidth);
      const solid=panelSolidData(side);
      assert.ok(solid.volume < side.sizeX*side.sizeY*side.sizeZ);
      assert.ok(solid.positions.every(Number.isFinite));
    }
  }
  assert.deepEqual(parts.filter(p=>p.type==='shelf'),baseline.filter(p=>p.type==='shelf'),'carcass joinery leaves shelves unchanged');
  for (const side of sides) assert.deepEqual(side.holes,baseline.find(p=>p.id===side.id).holes,'retain all shelf-pin and other drilling');
  assert.ok(parts.flatMap(p=>p.holes).some(h=>h.purpose==='shelf-pin'));
  assert.deepEqual(hardwareBom(c,parts).filter(r=>r.unit==='shelf pins'),hardwareBom(c,baseline).filter(r=>r.unit==='shelf pins'));
  const side=sides[0]; assert.ok(panelToDxf(side).includes('DADO_INSIDE_D6MM'));
  assert.ok(sheetToDxf({index:0,sheetWidth:2440,sheetHeight:1220,placements:[{panel:side,x:10,y:20,width:side.cutHeight,height:side.cutWidth,rotated:true}]}).includes('DADO_INSIDE_D6MM'));
  const schedule=machiningSchedule(parts); assert.ok(schedule.panels.some(p=>p.joinery?.extensionPerSide===6));
  const restored=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c))));
  near(computePanels(restored.cabinets[0].config).find(p=>p.id==='bottom').cutWidth,c.width-2*T+12);
}
const badDado=applyHardwarePreset(defaultCabinet(),'dado');
badDado.hardware.dadoDepth=10;
assert.ok(validateCabinet(badDado).some(w=>w.includes('Dados omitted')));
assert.equal(computePanels(badDado).find(p=>p.id==='bottom').cutWidth,764);
badDado.hardware.dadoDepth=6;
const conflictParts=computePanels({...badDado,hardware:{...badDado.hardware,joineryType:'none'}});
const conflictBottom=conflictParts.find(p=>p.id==='bottom');
conflictParts.find(p=>p.id==='side-left').holes.push({x:100,y:conflictBottom.posY,diameter:5,purpose:'shelf-pin'});
assert.ok(addDados(conflictParts,badDado).some(w=>w.includes('conflicts with side drilling')));
assert.equal(conflictParts.filter(p=>p.joinery).length,0,'failed pattern cannot partially extend mates');

for (const size of [8,12]) for (const category of ['base','wall']) for (const hasTop of [false,true]) for (const backMount of ['grooved-in','applied-rear']) for (const construction of ['frameless','face-frame']) {
  const c=applyHardwarePreset(defaultCabinet(),`cabineo-${size}`);
  Object.assign(c,{category,hasTop,backMount,construction});
  const parts=computePanels(c);
  assert.deepEqual(parts.flatMap(p=>p.hardwareWarnings||[]),[]);
  const housing=parts.flatMap(p=>p.holes.filter(h=>h.purpose==='cabineo-housing').map(b=>({p,b})));
  const pilots=parts.flatMap(p=>p.holes.filter(h=>h.purpose==='cabineo-pilot').map(b=>({p,b})));
  assert.equal(housing.length,48);assert.equal(pilots.length,16);
  assert.equal(hardwareBom(c,parts).find(r=>r.unit==='connectors').quantity,16);
  assert.equal(parts.flatMap(p=>p.edgeBores||[]).length,0,'Cabineo uses surface operations only');
  for (const pilot of pilots) {
    assert.equal(pilot.b.diameter,5);assert.equal(pilot.b.depth,size);
    const bores=housing.filter(h=>h.b.joint===pilot.b.joint);
    assert.equal(bores.length,3);
    assert.ok(bores.every(h=>h.b.diameter===15&&h.b.depth===11&&h.p.id===pilot.b.mate));
    const p=bores[0].p;
    const offsets=bores.map(({b})=>b.openEdge==='y-max'?p.cutHeight-b.y:b.openEdge==='x-max'?p.cutWidth-b.x:b.x).sort((a,b)=>a-b);
    offsets.forEach((v,i)=>near(v,[3.6,14.8,26][i]));
    let axis;
    if(p.id.startsWith('side-')) {
      const right=p.id==='side-right'; const realX=right?p.cutWidth-bores[0].b.x:bores[0].b.x;
      axis=[p.posX+(right?-1:1)*(p.cutThickness/2-5),p.cutHeight,p.posZ-p.sizeZ/2+realX];
    } else axis=[p.posX-p.sizeX/2+(bores[0].b.openEdge==='x-min'?0:p.cutWidth),p.posY+(p.id==='bottom'?1:-1)*(p.cutThickness/2-5),p.posZ-p.sizeZ/2+bores[0].b.y];
    const q=pilot.p,b=pilot.b;
    let target;
    if(q.id.startsWith('side-')) {
      const right=q.id==='side-right';target=[q.posX+(right?-1:1)*q.sizeX/2,b.y,q.posZ-q.sizeZ/2+(right?q.cutWidth-b.x:b.x)];
    } else target=[q.posX-q.sizeX/2+b.x,q.posY-q.sizeY/2,q.posZ-q.sizeZ/2+b.y];
    axis.forEach((v,i)=>near(v,target[i]));
  }
  const plan=buildNestingPlan(parts,{...c.nesting,gap:0});
  near(plan.options.gap,7.8);assert.equal(plan.machiningGapApplied,true);
  assert.ok(parts.filter(p=>p.machiningMargin).every(p=>p.machiningMargin===3.9));
  const project=createProjectFromConfig(c);project.cabinets[0].qty=2;
  const copied=buildProjectPanels(normalizeProject(JSON.parse(JSON.stringify(project))));
  assert.equal(new Set(copied.flatMap(p=>p.holes.filter(h=>h.purpose==='cabineo-pilot').map(h=>h.joint))).size,32);
}
const thin=applyHardwarePreset(defaultCabinet(),'cabineo-12');thin.materials.caseThickness=12;
assert.ok(validateCabinet(thin).some(w=>w.includes('at least 13mm')));
assert.equal(computePanels(thin).flatMap(p=>p.holes).filter(h=>h.purpose.startsWith('cabineo')).length,0);
console.log('PASS: 32 dado assemblies with extended mates, unchanged adjustable shelves and pin holes, fit/solid/export checks; 32 Cabineo assemblies with supplier offsets, 5 mm screw axis, open-edge nesting clearance and saved copies');
