import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../js/three-viewport.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const body = source.match(/  _renderFrame\(\) \{([\s\S]*?)\n  \}\n/)[1];
const callbacks = [], calls = [];
const context = {
  animStates: new Map(), _cadRevision: 2, _readyRevision: 2,
  _updateFog() {}, renderer: { render() { calls.push('render'); } },
  _setCadStatus(text) { calls.push(text); }, requestAnimationFrame(fn) { callbacks.push(fn); },
};
const render = () => vm.runInNewContext(`(function() {${body}}).call(this)`, context);
render();
assert.deepEqual(calls, ['render'], 'Ready must wait until after render and the following frame');
callbacks.shift()();
assert.deepEqual(calls, ['render', 'Ready']);
context._readyRevision = 2;
render();
context._cadRevision = 3;
callbacks.shift()();
assert.equal(calls.filter(c => c === 'Ready').length, 1, 'old render cannot complete a newer build');
context._readyRevision = 3;
render();
context._isDisposed = true;
callbacks.shift()();
assert.equal(calls.filter(c => c === 'Ready').length, 1);
console.log('PASS: Ready waits for rendered frame, ignores superseded builds and disposed viewports');

const setter = source.match(/  _setCadStatus\(text, busy = false\) \{([\s\S]*?)\n  \}\n/)[1];
const status = { classList: { toggle(name, value) { status.busy = value; } }, setAttribute(name, value) { status[name] = value; } };
vm.runInNewContext(`(function(text, busy = false) {${setter}})('Building', true)`, { document: { getElementById: () => status } });
assert.equal(status.textContent, 'Building');
assert.equal(status.busy, true);
assert.equal(status['aria-busy'], 'true');
// Progress must not resolve/remove the CAD request before its final model arrives.
let fakeWorker;
class WorkerMock {
  constructor() { fakeWorker = this; }
  postMessage(message) { this.message = message; }
}
const client = readFileSync(new URL('../js/cad-client.js', import.meta.url), 'utf8').replace('export function', 'function').replaceAll('import.meta.url', "'file:///js/cad-client.js'");
const clientContext = vm.createContext({ Worker: WorkerMock, URL });
vm.runInContext(client, clientContext);
const progress = [];
clientContext.progress = progress;
const pendingModel = vm.runInContext("requestCad('mesh', [], p => progress.push(p))", clientContext);
let completed = false;
pendingModel.then(() => completed = true);
fakeWorker.onmessage({ data: { id: fakeWorker.message.id, progress: { phase: 'Meshing', done: 1, total: 2 } } });
await Promise.resolve();
assert.equal(completed, false);
assert.equal(progress[0].done, 1);
fakeWorker.onmessage({ data: { id: fakeWorker.message.id, result: [] } });
assert.deepEqual(await pendingModel, []);
console.log('PASS: CAD progress leaves the request pending until the final mesh result');
