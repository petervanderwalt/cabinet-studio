import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const viewport = readFileSync(new URL('../js/three-viewport.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const click = viewport.match(/  _onClick\(event\) \{([\s\S]*?)\n  _toggleAnim/)[1];
let selected, animated;
const panel = { id: 'side-left' }, mesh = {};
const context = {
  Math, event: { clientX: 10, clientY: 10 },
  _pointerDown: { x: 10, y: 10 },
  _hitTest: () => mesh,
  interactiveMeshes: [{ mesh, panel }],
  onPanelSelect: p => { selected = p; },
  _toggleAnim: p => { animated = p; },
};
vm.runInNewContext(`(function () {${click.slice(0, click.lastIndexOf('}'))}}).call(this)`, context);
assert.equal(selected, panel);
assert.equal(animated, panel);
selected = null;
context.event.clientX = 40;
vm.runInNewContext(`(function () {${click.slice(0, click.lastIndexOf('}'))}}).call(this)`, context);
assert.equal(selected, null, 'Orbit dragging must not select a panel');

const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const select = main.match(/function selectPanelPreview\(panel\) \{([\s\S]*?)\n\}\n/)[1];
let activated = false, scrolled = false;
const rows = ['top', 'side-left'].map(id => ({
  dataset: { panelId: id },
  classList: { toggle: (_, selected) => { rows.find(row => row.dataset.panelId === id).selected = selected; } },
  scrollIntoView: options => { assert.equal(options.block, 'nearest'); scrolled = id; },
}));
vm.runInNewContext(`(function(panel) {${select}})(panel)`, {
  panel,
  document: {
    querySelectorAll: () => rows,
    getElementById: () => ({ click: () => { activated = true; } }),
  },
});
assert.equal(rows[0].selected, false);
assert.equal(rows[1].selected, true);
assert.equal(activated, true);
assert.equal(scrolled, 'side-left');
console.log('PASS: viewer selection, drag guard, matching row highlight, parts tab and scrolling');
