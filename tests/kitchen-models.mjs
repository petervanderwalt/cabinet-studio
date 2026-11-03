import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { frontLayout } from '../js/front-layout.js';
const source = readFileSync(new URL('../js/kitchen-layout.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const placement = source.match(/function layoutPanelPosition\(panel, size\) \{([\s\S]*?)\n\}/)[1];
for (const mode of ['doors','drawers']) for (const category of ['base','wall']) for (const rotation of [0,90,180,270]) {
  const c = defaultCabinet(); c.front.mode = mode; c.category = category;
  c.drawers.count = 3; c.drawers.heights = Array(3).fill((frontLayout(c).height - 2*c.reveal)/3);
  const size = { width:c.width, height:c.height, depth:c.depth };
  const angle = rotation*Math.PI/180;
  for (const panel of computePanels(c)) {
    const position = vm.runInNewContext(`(function(panel,size){${placement}})(panel,size)`, {panel,size});
    assert.equal(position.y + size.height/2, panel.posY, 'correct floor/wall elevation');
    assert.equal(position.x + panel.posX, size.width/2);
    assert.equal(position.z + panel.posZ, size.depth/2);
    const x = position.x*Math.cos(angle)+position.z*Math.sin(angle);
    const z = -position.x*Math.sin(angle)+position.z*Math.cos(angle);
    assert.ok(Number.isFinite(x+z));
    if (panel.type === 'door' || panel.type === 'drawer') assert.ok(position.z > 0, 'fronts face into room at zero rotation');
  }
}
const rebuild = source.match(/  _rebuildCabinets\(\) \{([\s\S]*?)\n  \}\n/)[1];
let created = 0, disposed = 0;
const c = defaultCabinet();
const context = {
  instances:[{ instanceId:'a',config:c,placement:{rotation:0}}], project:{},
  meshByInstanceId:new Map(), cadModels:new Map(), cabinetGroup:{add(){},remove(){}},
  _createCabinet(instance,key){ created++; return {userData:{configKey:key},position:{set(){}},rotation:{}}; },
  _applySelectionStyles(){},_updateModelStatus(){},
  getPlacementWorldPosition:()=>({x:0,y:360,z:0}), THREE:{MathUtils:{degToRad:n=>n*Math.PI/180}},
  disposeObject(){disposed++;},
};
const run = () => vm.runInNewContext(`(function(){${rebuild}}).call(this)`,context);
run(); const first=context.meshByInstanceId.get('a');
context.instances[0].placement.rotation=90;run();
assert.equal(context.meshByInstanceId.get('a'),first);
assert.equal(created,1,'moving/rotating keeps geometry');
context.instances[0].config={...c,width:900};run();
assert.equal(created,2);assert.equal(disposed,1,'config change replaces and disposes previous model');
context.instances=[];run();assert.equal(disposed,2,'removed cabinets release geometry');
console.log('PASS: actual panel placement for door/drawer base/wall cabinets, front orientation, rotation reuse and disposal');
