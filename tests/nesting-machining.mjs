import assert from 'node:assert/strict';
import { buildNestingPlan } from '../js/nesting.js';
import { defaultCabinet } from '../js/cabinet-math.js';

const defaults = defaultCabinet().nesting;
assert.deepEqual([defaults.sheetWidth, defaults.sheetHeight], [1220, 2440]);
const stock = { materialLabel: 'Ply', cutWidth: 80, cutHeight: 60, cutThickness: 18 };
const bore = { diameter: 5, depth: 12, face: 'inside' };
const panels = [
  { ...stock, id: 'plain', name: 'Plain' },
  { ...stock, id: 'one', name: 'One bore', holes: [bore] },
  { ...stock, id: 'two', name: 'Two bores', holes: [bore, { ...bore, x: 20 }] },
  { ...stock, id: 'deep', name: 'Deep bore', holes: [{ ...bore, depth: 14 }] },
  { ...stock, id: 'open', name: 'Open-edge bore', holes: [bore], machiningMargin: 3.9 },
];
const options = { sheetWidth: 240, sheetHeight: 180, edgeMargin: 10, gap: 8 };
const plan = buildNestingPlan(panels, { ...options, groupByMachining: true });
assert.deepEqual(plan.groups.map(group => group.partCount), [1, 3, 1]);
const sheets = plan.groups.flatMap(group => group.sheets);
assert.equal(new Set(sheets.map(sheet => sheet.id)).size, sheets.length);
for (const sheet of sheets) for (const part of sheet.placements) {
  const margin = options.edgeMargin + (part.panel.machiningMargin || 0);
  assert.ok(part.x >= margin && part.y >= margin);
  assert.ok(part.x + part.width <= sheet.sheetWidth - margin);
  assert.ok(part.y + part.height <= sheet.sheetHeight - margin);
}
assert.equal(buildNestingPlan(panels, options).groups.length, 1);
assert.equal(buildNestingPlan([panels[0]], { sheetWidth: 80, sheetHeight: 60, edgeMargin: 1 }).unplaced.length, 1);
assert.equal(buildNestingPlan([panels[0]], { sheetWidth: 80, sheetHeight: 60 }).unplaced.length, 0);
console.log('PASS: stock axes, operation groups, unique sheet IDs, machining overhang and sheet-edge margins');
