import assert from 'node:assert/strict';
import { distributeDrawerHeights as fill } from '../js/drawer-heights.js';
const a = fill([200,150,150],[true,false,false],3,608);
assert.deepEqual(a.heights,[200,204,204]);
assert.deepEqual(fill([200,150,100],[true,true,false],3,608).heights,[200,150,258]);
const inch = fill([6*25.4,200,200],[true,false,false],3,23.93701*25.4).heights;
assert.equal(inch[0],6*25.4);
assert.equal(inch[1],inch[2]);
assert.ok(Math.abs(inch.reduce((a,b)=>a+b,0)-23.93701*25.4)<1e-9);
assert.deepEqual(fill([200,150,150],[false,false,false],3,600).heights,[200,200,200]);
assert.ok(fill([200,200,200],[true,true,true],3,608).error);
assert.ok(fill([600,150,150],[true,false,false],3,608).error);
assert.deepEqual(fill([200,204,204],[true,false,false],4,608).heights,[200,136,136,136]);
assert.deepEqual(fill(a.heights,[true,false,false],3,608),a);
console.log('PASS: preserve entered fronts, equal remainder, released heights, count changes, repeat Auto, inch dimensions and impossible allocations');

// Exercise the form's debounce without waiting on wall-clock timing.
const { CabinetForm } = await import('../js/form-ui.js');
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const pending = new Map();
let nextTimer = 0;
globalThis.setTimeout = (callback, delay) => {
  assert.equal(delay, 2000);
  pending.set(++nextTimer, callback);
  return nextTimer;
};
globalThis.clearTimeout = id => pending.delete(id);
try {
  const form = Object.create(CabinetForm.prototype);
  form.config = { drawers: {count:3, heights:[200,200,214], manualHeights:[true,false,false]}, reveal:3 };
  form._frontMode = () => 'drawers';
  form._drawerHeightsDiv = {};
  form.getConfig = () => structuredClone(form.config);
  form._openingHeight = () => 620;
  let emitted = 0;
  form._emitChange = auto => { assert.equal(auto,false); emitted++; };
  const inputs = [200,200,214].map((n,i) => ({
    value:String(n), type:'number', dataset:{drawerIndex:String(i),mm:String(n),displayValue:String(n)},
    addEventListener() {}, setCustomValidity() {},
  }));
  form.form = {querySelectorAll: () => inputs};
  form._scheduleDrawerAuto();
  form.config.drawers.heights[0] = 300;
  inputs[0].value = '300';
  form._scheduleDrawerAuto();
  assert.equal(pending.size,1);
  assert.equal(emitted,0);
  [...pending.values()][0]();
  assert.deepEqual(form.config.drawers.heights,[300,157,157]);
  assert.equal(inputs[0].value,'300');
  assert.equal(inputs[1].value,'157');
  assert.equal(emitted,1);
  form._scheduleDrawerAuto();
  form.config.drawers.heights[0] = 250;
  form._runDrawerAuto();
  assert.equal(pending.size,0);
  assert.deepEqual(form.config.drawers.heights,[250,182,182]);
  assert.deepEqual(form.config.drawers.manualHeights,[true,false,false]);
  assert.equal(emitted,2);
  form._scheduleDrawerAuto();
  form._frontMode = () => 'doors';
  form._scheduleDrawerAuto();
  assert.equal(pending.size,0);
  console.log('PASS: 2000 ms debounce cancels earlier edits, preserves locked input and updates only automatic suggestions');
} finally {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
}

const { additionalDrawerHeight: extra } = await import('../js/drawer-heights.js');
assert.equal(extra([150,150,150],[true,true,true],3,608,3),155);
assert.equal(extra([200,200,200],[true,true,true],3,608,3),null);
assert.equal(extra([150,150,150],[true,false,true],3,608,3),null);
assert.equal(extra([200,200,300],[true,true,true],3,608,3),null);
assert.equal(extra(Array(10).fill(30),Array(10).fill(true),10,900,3),null);
console.log('PASS: extra drawer suggestion accounts for reveal, minimum height, locks and drawer limit');
