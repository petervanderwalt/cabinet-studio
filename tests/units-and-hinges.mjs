import assert from 'node:assert/strict';
import { setUnits, parseLength, formatLength, readLength } from '../js/units.js?v=20261020h';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { applyGlobalMaterialSelections } from '../js/material-presets.js';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
globalThis.window = {};
const { panelToDxf, sheetToDxf } = await import('../js/dxf-writer.js');
setUnits('imperial');
assert.ok(Math.abs(parseLength('3/4') - 19.05) < 1e-10);
assert.equal(parseLength('23 3/4'), 603.25);
assert.ok(Math.abs(parseLength('-1 1/2') + 38.1) < 1e-10);
assert.ok(Number.isNaN(parseLength('1/0')));
assert.ok(Number.isNaN(parseLength('12junk')));
assert.equal(formatLength(19.05), '0.75');
assert.equal(readLength({ value: '1.25984', dataset: { displayValue: '1.25984', mm: '32' } }), 32);
for (const [fraction, thickness] of [['3/4', 19.05], ['1/2', 12.7], ['1/4', 6.35]]) {
 const materials = applyGlobalMaterialSelections({ caseMaterial: `Plywood ${fraction} inch`, backMaterial: `Plywood ${fraction} inch`, frontMaterial: `Plywood ${fraction} inch` });
 assert.equal(materials.caseThickness, thickness);
 assert.equal(materials.backThickness, thickness);
 assert.equal(materials.doorThickness, thickness);
}
const config = defaultCabinet();
const plates = () => computePanels(config).filter(p => p.id.includes('side')).flatMap(p => p.holes.filter(h => h.purpose === 'hinge-mounting-plate'));
const original = plates().length;
config.hardware.hingePlateSecondRow = false;
config.hardware.hingePlateFrontHoleOffset = 37;
const holes = plates();
assert.equal(holes.length, original / 2);
for (const panel of computePanels(config).filter(p => p.id.includes('side'))) {
 const expectedX = panel.id === 'side-right' ? panel.cutWidth - 37 : 37;
 assert.ok(panel.holes.filter(h => h.purpose === 'hinge-mounting-plate').every(h => h.x === expectedX));
}
assert.equal(holes[1].y - holes[0].y, 32);
config.units = 'imperial';
const restored = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config))));
assert.equal(restored.cabinets[0].config.hardware.hingePlateSecondRow, false);
assert.equal(restored.cabinets[0].config.units, 'imperial');
const panel = { name: 'Scale check', cutWidth: 254, cutHeight: 127, cutThickness: 19.05, holes: [{x:25.4,y:50.8,diameter:12.7}] };
const inchDxf = panelToDxf(panel);
assert.ok(inchDxf.includes('$INSUNITS\n70\n1'));
assert.ok(inchDxf.includes('10\n10\n20\n5'));
assert.ok(inchDxf.includes('10\n1\n20\n2\n30\n0\n40\n0.25'));
const sheet = { index: 0, sheetWidth: 2438.4, sheetHeight: 1219.2, thickness: 19.05, placements: [], offcuts: [] };
assert.ok(sheetToDxf(sheet).includes('96 x 48 in'));
setUnits('metric');
assert.equal(parseLength('19.05'), 19.05);
assert.ok(panelToDxf(panel).includes('$INSUNITS\n70\n4'));
assert.equal(computePanels(config).length, 11);
console.log('PASS: fractional entry, exact stock, hinge rows, saved projects, inch/metric DXF geometry and sheet labels');

const { CARCASS_STOCKS, REAR_STOCKS, FRONT_STOCKS, stocksForUnits, defaultStockMaterials } = await import('../js/material-presets.js');
const na = defaultStockMaterials('imperial');
assert.equal(na.caseThickness,19.05);
assert.equal(na.doorThickness,19.05);
assert.equal(na.backThickness,6.35);
for (const stocks of [CARCASS_STOCKS,REAR_STOCKS,FRONT_STOCKS]) {
 assert.ok(stocksForUnits(stocks,'imperial').every(s=>s.units==='imperial'));
 assert.ok(stocksForUnits(stocks,'metric').every(s=>s.units!=='imperial'));
 assert.ok(stocksForUnits(stocks,'imperial','Melamine White').some(s=>s.label==='Melamine White' && s.thickness===18));
 assert.ok(stocksForUnits(stocks,'imperial').some(s=>s.label==='Melamine White 3/4 inch' && s.thickness===19.05));
}
assert.equal(applyGlobalMaterialSelections({caseMaterial:'Melamine White'}).caseThickness,18);
console.log('PASS: North American stock choices, exact nominal defaults, metric selection preservation and catalogue filtering');

const { CabinetForm } = await import('../js/form-ui.js');
const form = Object.create(CabinetForm.prototype);
let dc = defaultCabinet();
dc.front.mode = 'drawers';
dc.drawers.count = 3;
dc.materials.drawerSideMaterial = 'Plywood 1/2 inch';
dc.materials.drawerBottomMaterial = 'Plywood 1/4 inch';
dc = form._normalizeConfig(dc);
assert.equal(dc.drawers.sideThickness,12.7);
assert.equal(dc.drawers.bottomThickness,6.35);
dc.materials.caseMaterial = 'Melamine Heavy Duty';
dc = form._normalizeConfig(dc);
assert.equal(dc.drawers.sideThickness,12.7);
assert.equal(dc.drawers.bottomThickness,6.35);
const drawerPanels = computePanels(dc).filter(p=>p.type==='drawer-box');
assert.ok(drawerPanels.length>0);
assert.ok(drawerPanels.filter(p=>p.id.endsWith('-bottom')).every(p=>p.materialLabel==='Plywood' && p.cutThickness===6.35));
assert.ok(drawerPanels.filter(p=>!p.id.endsWith('-bottom')).every(p=>p.materialLabel==='Plywood' && p.cutThickness===12.7));
const old = defaultCabinet();
old.materials.drawerBoxMaterial = 'Melamine White';
old.drawers.sideThickness = 11.5;
old.drawers.bottomThickness = 5.5;
const migrated = form._normalizeConfig(form._normalizeConfig(old));
assert.equal(migrated.drawers.sideThickness,11.5);
assert.equal(migrated.drawers.bottomThickness,5.5);
console.log('PASS: independent drawer stock labels/thicknesses, carcass changes and legacy project dimensions');

let split = form._normalizeConfig({ ...defaultCabinet(), materials: { ...defaultCabinet().materials, stockSelections: {
  carcass: {material:'Melamine White',thickness:19.05,units:'imperial'},
  rear: {material:'Plywood',thickness:6,units:'metric'},
  front: {material:'MDF',thickness:18,units:'metric'},
  'drawer-side': {material:'Birch Ply',thickness:12.7,units:'imperial'},
  'drawer-bottom': {material:'Plywood',thickness:6.35,units:'imperial'},
} } });
split = form._normalizeConfig(JSON.parse(JSON.stringify(split)));
assert.equal(split.materials.caseThickness,19.05);
assert.equal(split.materials.backThickness,6);
assert.equal(split.materials.doorThickness,18);
assert.equal(split.drawers.sideThickness,12.7);
assert.equal(split.drawers.bottomThickness,6.35);
assert.equal(split.materials.drawerBottomMaterial,'Plywood');
assert.equal(split.materials.drawerFrontMaterial,'MDF');
assert.equal(split.materials.shelfMaterial,'Melamine White');
console.log('PASS: separate material/thickness selections preserve mixed metric and imperial sizes through saved projects');

const { buildNestingPlan } = await import('../js/nesting.js');
const colours = form._normalizeConfig({ ...defaultCabinet(), materials: { ...defaultCabinet().materials, stockSelections: {
 carcass:{material:'Melamine',colour:'White',thickness:18,units:'metric'},
 front:{material:'Melamine',colour:'Storm Grey',thickness:18,units:'metric'},
} } });
const colouredPanels = computePanels(colours);
const plan = buildNestingPlan(colouredPanels,colours.nesting);
const whites = colouredPanels.filter(p=>p.material==='Melamine' && p.materialColour==='White');
const greys = colouredPanels.filter(p=>p.material==='Melamine' && p.materialColour==='Storm Grey');
assert.ok(whites.length && greys.length);
assert.notEqual(whites[0].stockKey,greys[0].stockKey);
assert.equal(new Set(whites.map(p=>p.stockKey)).size,1);
assert.ok(plan.groups.some(g=>g.materialLabel==='Melamine White'));
assert.ok(plan.groups.some(g=>g.materialLabel==='Melamine Storm Grey'));
const colourRestored = form._normalizeConfig(JSON.parse(JSON.stringify(colours)));
assert.equal(colourRestored.materials.stockSelections.front.colour,'Storm Grey');
assert.equal(colourRestored.materials.doorThickness,18);
let nominal = form._normalizeConfig({...defaultCabinet(),materials:{...defaultCabinet().materials,...defaultStockMaterials('imperial')}});
nominal = form._normalizeConfig(nominal);
assert.equal(nominal.materials.caseThickness,19.05);
assert.equal(nominal.drawers.sideThickness,12.7);
console.log('PASS: colour-aware stock identity, separate nesting groups, saved colours and nominal thickness migration');

const { sharedStockChoices, STOCK_FIELDS } = await import('../js/material-presets.js');
const shared = sharedStockChoices([{stockSelections:{rear:{material:'Custom board',colour:'Blue',thickness:15.5}}}]);
assert.ok(shared.materials.includes('Custom board'));
assert.ok(shared.colours.includes('Blue'));
assert.ok(shared.thicknesses.some(t=>t.thickness===15.5));
for (const material of shared.materials) {
 const selections = Object.fromEntries(Object.keys(STOCK_FIELDS).map(type=>[type,{material,colour:'White',thickness:19.05,units:'imperial'}]));
 const unified = form._normalizeConfig({...defaultCabinet(),materials:{...defaultCabinet().materials,stockSelections:selections}});
 for (const fields of Object.values(STOCK_FIELDS)) {
   assert.equal(unified.materials[fields.thickness],19.05);
   assert.equal(unified.materials[fields.material],`${material} White`);
 }
 const groups = buildNestingPlan(computePanels(unified),unified.nesting).groups;
 assert.equal(groups.length,1);
}
console.log('PASS: all stock roles accept every shared material, colour and thickness; matching parts nest together');

const {stockDimension} = await import('../js/units.js?v=20261020h');
setUnits('imperial');
assert.equal(stockDimension({thickness:18,stockUnits:'metric'}),'18 mm');
assert.equal(stockDimension({thickness:19.05,stockUnits:'imperial'}),'3/4 in');
assert.equal(formatLength(1220),'48.031');
assert.equal(formatLength(18),'0.709');
const exactScale = panelToDxf({name:'Precision',cutWidth:18,cutHeight:25.4,cutThickness:6});
assert.ok(exactScale.includes(`10\n${18/25.4}\n`));
console.log('PASS: selected stock units, fractional thickness labels, three-decimal display and full-precision DXF coordinates');
