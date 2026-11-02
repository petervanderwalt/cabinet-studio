import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/three-viewport.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const method = source.match(/  setView\(view\) \{([\s\S]*?)\n  \}\n/)[1];
class Vector3 {
  constructor(x, y, z) { Object.assign(this, { x, y, z }); }
  normalize() {
    const length = Math.hypot(this.x, this.y, this.z);
    this.x /= length; this.y /= length; this.z /= length;
    return this;
  }
  distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z); }
  copy(v) { Object.assign(this, v); return this; }
  addScaledVector(v, scale) {
    this.x += v.x * scale; this.y += v.y * scale; this.z += v.z * scale;
    return this;
  }
}
const target = new Vector3(300, 400, 250);
const camera = { position: new Vector3(800, 900, -500), isPerspectiveCamera: true, fov: 35 };
let updates = 0, renders = 0;
const context = {
  camera, controls: { target, update() { updates++; } },
  _requestRender() { renders++; }, THREE: { Vector3 },
};
const distance = camera.position.distanceTo(target);
for (const view of ['front', 'back', 'left', 'right', 'top', 'bottom', 'home']) {
  vm.runInNewContext(`(function(view) {${method}}).call(this, '${view}')`, context);
  assert.ok(Math.abs(camera.position.distanceTo(target) - distance) < 1e-8);
  assert.equal(camera.isPerspectiveCamera, true);
  assert.equal(camera.fov, 35);
  const p = camera.position;
  if (view === 'front') assert.ok(p.z < target.z && p.x === target.x && p.y === target.y);
  if (view === 'back') assert.ok(p.z > target.z);
  if (view === 'left') assert.ok(p.x > target.x);
  if (view === 'right') assert.ok(p.x < target.x);
  if (view === 'top') assert.ok(p.y > target.y);
  if (view === 'bottom') assert.ok(p.y < target.y);
  if (view === 'home') assert.ok(p.x > target.x && p.y > target.y && p.z < target.z);
}
vm.runInNewContext(`(function(view) {${method}}).call(this, 'invalid')`, context);
assert.equal(updates, 7);
assert.equal(renders, 7);
assert.deepEqual(target, new Vector3(300, 400, 250));
console.log('PASS: six camera faces and Home preserve perspective, zoom and orbit target');
