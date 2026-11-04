import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { frontLayout } from '../js/front-layout.js';
import { runnerPattern, runnerTravel } from '../js/runner-layout.js';
import { panelBores } from '../js/panel-bores.js?v=20261103c';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
import { ACCURIDE_3832_E20, ACCURIDE_MODELS, HARDWARE_MODELS } from '../js/hardware-models.js';

const near = (a,b) => assert.ok(Math.abs(a-b)<0.001, `${a} != ${b}`);
const rails = panels => panels.flatMap(panel => (panel.hardwareModels || [])
  .filter(p => p.kind === 'runner-preview').map(rail => ({panel,rail})));
for (const length of [250,300,350,400,450,500,550,600,650,700]) {
  for (const overlay of ['full-overlay','inset']) {
    let c = applyHardwarePreset(defaultCabinet(),'runner-3832e');
    c.front.mode='drawers'; c.drawers.count=2; c.depth=length+100;
    c.hardware.runnerLength=length; c.overlay.type=overlay;
    c.drawers.heights=Array(2).fill((frontLayout(c).height-c.reveal)/2);
    c=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(c)))).cabinets[0].config;
    const panels=computePanels(c), items=rails(panels);
    assert.equal(items.length,12,'three stages on both sides of two drawers');
    const cad=ACCURIDE_MODELS[length];
    assert.ok(panels.filter(p=>p.type==='drawer').every(p=>p.runnerTravel===(cad?.travel || runnerTravel(length))));
    assert.ok(items.every(({rail})=>Boolean(rail.model)===Boolean(cad)),'only verified lengths receive CAD');
    for (const {panel,rail} of items) {
      assert.ok(['x','y','z','length','height','depth','travel'].every(k=>Number.isFinite(rail[k])));
      if (rail.stage==='intermediate') { assert.equal(rail.mounts.length,0); continue; }
      if(cad) {
        const model=HARDWARE_MODELS[rail.model];
        assert.equal(model.mountingCentres.length,rail.mounts.length);
        model.mountingCentres.forEach((point,i)=>near(point[2],rail.mounts[i].z));
      }
      const purpose=rail.stage==='fixed'?'drawer-runner-mount':'drawer-slide-mount';
      const bores=panelBores(panel).filter(b=>b.purpose===purpose && Math.abs(b.start[1]-rail.y)<0.001);
      assert.equal(rail.mounts.length,bores.length);
      for (let i=0;i<bores.length;i++) {
        near(rail.x,bores[i].start[0]);
        near(rail.y+rail.mounts[i].y,bores[i].start[1]);
        near(rail.z+rail.mounts[i].z,bores[i].start[2]);
      }
      assert.equal(rail.mounts.length,runnerPattern(length)[rail.stage==='fixed'?'cabinet':'drawer'].length);
    }
    for (const side of ['left','right']) {
      const fixed=items.filter(({panel,rail})=>panel.id===`side-${side}` && rail.stage==='fixed');
      for (const {panel,rail} of fixed) {
        const moving=items.find(item=>item.panel.id===`${rail.drawerId}-side-${side}`);
        near(panel.posY+rail.y,moving.panel.posY+moving.rail.y);
        near(Math.abs(panel.posX+rail.x-moving.panel.posX-moving.rail.x),12.7);
      }
    }
    c.hardware.runnerPilotDepth=100;
    assert.equal(rails(computePanels(c)).length,0,'invalid drilling has no hardware preview');
    c.hardware.runnerPilotDepth=8;
    c.drawers.sideClearance=20;
    assert.equal(rails(computePanels(c)).length,0,'impossible fit has no hardware preview');
    c.drawers.sideClearance=12.7; c.hardware.runnerPattern='custom';
    assert.equal(rails(computePanels(c)).length,0,'custom patterns are not assumed compatible');
  }
}
assert.equal(runnerTravel(333),null);
assert.equal(runnerTravel(500),508);
assert.deepEqual(Object.keys(ACCURIDE_MODELS),['250','300','350','400','450','500','550','600','650','700']);
assert.deepEqual(runnerPattern(250),{cabinet:[35,195],drawer:[17.8,35,131,227]});
assert.deepEqual(runnerPattern(300),{cabinet:[35,259],drawer:[17.8,35,131,277]});
assert.deepEqual(runnerPattern(450).cabinet,[35,163,387]);
assert.deepEqual(runnerPattern(550).cabinet,[35,163,483]);
for(const [length,cad] of Object.entries(ACCURIDE_MODELS)) {
  assert.equal(cad.length,Number(length));
  assert.ok(Math.abs(cad.travel-runnerTravel(length))<Number(length)*0.05);
  assert.ok(cad.intermediateTravel>0 && cad.intermediateTravel<cad.travel);
  for(const model of Object.values(cad.stages)) {
    assert.equal(model.positions.length%9,0);
    assert.ok(model.positions.every(Number.isFinite));
    for(let a=0;a<3;a++) {
      const values=model.positions.filter((_,i)=>i%3===a);
      near(Math.min(...values),model.bounds[a][0]); near(Math.max(...values),model.bounds[a][1]);
    }
  }
}

const source=readFileSync(new URL('../js/three-viewport.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const body=source.match(/  _renderFrame\(\) \{([\s\S]*?)\n  \}\n/)[1];
const middle={position:{z:0},userData:{baseZ:252}};
const fixed={position:{z:252}};
const state={type:'drawer',current:0,target:508,group:{position:{z:0}},runnerRails:[middle]};
const context={animStates:new Map([['drawer-1',state]]),_cadRevision:1,_readyRevision:0,
  _updateFog(){},renderer:{render(){}},_requestRender(){}};
const frame=()=>vm.runInNewContext(`(function(){${body}}).call(this)`,context);
for(let i=0;i<60;i++)frame();
near(state.group.position.z,-508); near(middle.position.z,252-254);near(fixed.position.z,252);
state.target=0;
for(let i=0;i<60;i++)frame();
near(state.group.position.z,0); near(middle.position.z,252);
middle.userData.travelFactor=ACCURIDE_3832_E20.intermediateTravel/ACCURIDE_3832_E20.travel;
state.target=ACCURIDE_3832_E20.travel;
for(let i=0;i<60;i++)frame();
near(middle.position.z,252-ACCURIDE_3832_E20.intermediateTravel);
for(const cad of Object.values(ACCURIDE_MODELS)) {
  state.current=0; state.target=cad.travel;
  middle.userData.travelFactor=cad.intermediateTravel/cad.travel;
  for(let i=0;i<60;i++)frame();
  near(state.group.position.z,-cad.travel); near(middle.position.z,252-cad.intermediateTravel);
  state.target=0;
  for(let i=0;i<60;i++)frame();
  near(state.group.position.z,0);near(middle.position.z,252);
}
console.log('PASS: 20 runner configurations, mounting-axis alignment on both sides, exact travel, save/load, invalid/custom guards, extend/retract animation');
