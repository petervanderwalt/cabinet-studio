import assert from 'node:assert/strict';
import { initTabletViews } from '../js/tablet-ui.js';

const app = { dataset: {} };
const buttons = ['settings', 'preview', 'parts'].map(view => ({
  dataset: { tabletView: view },
  addEventListener(event, callback) { assert.equal(event, 'click'); this.click = callback; },
  setAttribute(name, value) { this[name] = value; },
}));
globalThis.document = {
  getElementById: () => app,
  querySelectorAll: () => buttons,
};
initTabletViews();
assert.equal(app.dataset.tabletView, 'preview');
for (const button of [...buttons, buttons[0]]) {
  button.click();
  assert.equal(app.dataset.tabletView, button.dataset.tabletView);
  assert.equal(buttons.filter(item => item['aria-pressed'] === 'true').length, 1);
  assert.equal(button['aria-pressed'], 'true');
}
delete globalThis.document;
console.log('PASS: tablet starts in preview, switches views and marks exactly one active button');
