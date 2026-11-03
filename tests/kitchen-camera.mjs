import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../js/kitchen-layout.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const updateBody = source.match(/  update\(project, instances, selectedInstanceId, snapPreview = null\) \{([\s\S]*?)\n  \}\n/)[1];
let fits = 0;
const target = { x:0,y:0,z:0 };
const context = {
  normalizeProject: x=>x, _rebuildRoom(){}, _rebuildCabinets(){}, requestRender(){},
  _fitCamera(){fits++;Object.assign(target,{x:0,y:600,z:0});},
};
const update = () => vm.runInNewContext(`(function(project,instances,selectedInstanceId,snapPreview=null){${updateBody}}).call(this,{},[],'a')`,context);
update();assert.equal(fits,1);
Object.assign(target,{x:300,y:420,z:-250});
update(); update();
assert.equal(fits,1,'cabinet changes do not reset the view');
assert.deepEqual(target,{x:300,y:420,z:-250});
const upBody = source.match(/  onPointerUp\(event\) \{([\s\S]*?)\n  \}\n/)[1];
let updates=0;
const upContext = { drag:null, controls:{enabled:true}, update(){updates++;}, selectedInstanceId:'a', currentSnapPreview:{}, renderInspectorOnly(){} };
const up = () => vm.runInNewContext(`(function(event){${upBody}}).call(this)`,upContext);
up();assert.equal(updates,0,'ending orbit/pan never runs cabinet drag cleanup');
upContext.drag={instanceId:'a'};upContext.controls.enabled=false;up();
assert.equal(updates,1);assert.equal(upContext.controls.enabled,true);assert.equal(upContext.drag,null);
console.log('PASS: camera target stays after updates; pan release does not trigger cabinet drag cleanup');

const downBody = source.match(/  onPointerDown\(event\) \{([\s\S]*?)\n  \}\n/)[1];
const moveBody = source.match(/  onPointerMove\(event\) \{([\s\S]*?)\n  \}\n/)[1];
let rotations = 0;
const gesture = { drag:null,controls:{},renderer:{domElement:{style:{}}},
  hitCabinet:()=>({object:{userData:{instanceId:'a'}}}),callbacks:{onSelect(){},onRotate(){rotations++;}} };
const eventCall = (body,event) => vm.runInNewContext(`(function(event){${body}}).call(this,event)`,Object.assign(gesture,{event}));
eventCall(downBody,{button:2,clientX:100,clientY:100});
eventCall(moveBody,{clientX:150,clientY:130});
eventCall(upBody,{button:2,clientX:150,clientY:130});
assert.equal(rotations,0,'right-button pan never rotates');
eventCall(downBody,{button:2,clientX:100,clientY:100});
eventCall(upBody,{button:2,clientX:101,clientY:101});
assert.equal(rotations,1,'stationary right click rotates cabinet under pointer');
gesture.hitCabinet=()=>null;
eventCall(downBody,{button:2,clientX:100,clientY:100});
eventCall(upBody,{button:2,clientX:100,clientY:100});
assert.equal(rotations,1,'right click on background never rotates selected cabinet');
console.log('PASS: right drag pans, stationary cabinet right click rotates, background right click is inert');
