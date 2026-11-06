import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { frontLayout } from '../js/front-layout.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
import { createProjectFromConfig, normalizeProject } from '../js/project-io.js';
import { HARDWARE_MODELS, loadLocalBlumPreview } from '../js/hardware-models.js';
import { panelBores } from '../js/panel-bores.js';
import { panelSolidData } from '../js/panel-solid.js';
const source = readFileSync(new URL('../js/kitchen-layout.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const placement = source.match(/function layoutPanelPosition\(panel, size\) \{([\s\S]*?)\n\}/)[1];
const place = (panel,size) => vm.runInNewContext(`(function(panel,size){${placement}})(panel,size)`, {panel,size});
for (const mode of ['doors','drawers']) for (const category of ['base','wall']) for (const rotation of [0,90,180,270]) {
  const c = defaultCabinet(); c.front.mode = mode; c.category = category;
  c.drawers.count = 3; c.drawers.heights = Array(3).fill((frontLayout(c).height - 2*c.reveal)/3);
  const size = { width:c.width, height:c.height, depth:c.depth };
  const angle = rotation*Math.PI/180;
  for (const panel of computePanels(c)) {
    const position = place(panel,size);
    assert.equal(position.y + size.height/2, panel.posY, 'correct floor/wall elevation');
    assert.equal(position.x + panel.posX, size.width/2);
    assert.equal(position.z + panel.posZ, size.depth/2);
    const x = position.x*Math.cos(angle)+position.z*Math.sin(angle);
    const z = -position.x*Math.sin(angle)+position.z*Math.cos(angle);
    assert.ok(Number.isFinite(x+z));
    if (panel.type === 'door' || panel.type === 'drawer') assert.ok(position.z > 0, 'fronts face into room at zero rotation');
  }
}
const createCabinet = source.match(/  _createCabinet\(instance, key\) \{([\s\S]*?)\n  \}\n/)[1];
const hardwareSource=readFileSync(new URL('../js/hardware-view.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const addHardware=hardwareSource.match(/export function (addHardwareModels\([^\n]+\{[\s\S]*?\n\})/)[1];
class Mesh {
  children=[];rotation={};scale={};userData={};
  position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};
  constructor(geometry){this.geometry=geometry;}
  add(child){this.children.push(child);}
}
for (const [part, file, sourceSha256] of [
  ['T51.7601L', 'movento-lock-left', '275a727f96fd0f318ea1dd45757160ce6672264070e8947f8580b51b62a7d8ca'],
  ['T51.7601R', 'movento-lock-right', '90d7a46237f0fff4ef297e935b90f7352e6d1a1ceb3f12a506f260263dc04d5c'],
]) {
  const data={sourceSha256, models:{[part]:[0,0,0,1,0,0,0,1,0]}};
  assert.throws(()=>loadLocalBlumPreview(data,'clip-top'),/Wrong Blum CAD source/);
  loadLocalBlumPreview(data,file);
}
for(const [preset,hand,mode='doors',gap=2,length,sideThickness=16] of [
  ['hinge-hettich-9071206','left'],
  ['hinge-hettich-9071206','right'],
  ['hinge-hettich-9099540','left'],
  ['hinge-hettich-9099540','right'],
  ['handle-hettich-9071008','left'],
  ['handle-hettich-1170155','right'],
  ['handle-hettich-1170155','left','drawers'],
  ['handle-hettich-115203','left'],
  ['handle-hettich-115203','right','drawers'],
  ['handle-hettich-9086690','left'],
  ['handle-hettich-9086690','right','drawers'],
  ['handle-hettich-9070103','left','drawers'],
  ['handle-hettich-9070103','right'],
  ['handle-hettich-9080833','right'],
  ['handle-hettich-9080833','left','drawers'],
  ['handle-hettich-9113224','left'],
  ['handle-hettich-9113698','right','drawers'],
  ['handle-hettich-9069816','right'],
  ['handle-hettich-9071737','left'],
  ['handle-hettich-9071755','right','drawers'],
  ['handle-hettich-9070487','left'],
  ['handle-hettich-9070485','right','drawers'],
  ['handle-hettich-9069953','left'],
  ['handle-hettich-9069959','right','drawers'],
  ['handle-hettich-9070104','left','drawers'],
  ['handle-hettich-9118858','left','drawers'],
  ['handle-hettich-9069890','right'],
  ['handle-hettich-9069893','left'],
  ['handle-hettich-9070104','right'],
  ['handle-hettich-9070112','left','drawers'],
  ['handle-hettich-9070105','left','drawers'],
  ['handle-hettich-9070105','right'],
  ['handle-hettich-9070117','left','drawers'],
  ['handle-hettich-9070118','right'],
  ['handle-hettich-9070119','right','drawers'],
  ['handle-hettich-9070120','left'],
  ['handle-hettich-9070111','left','drawers'],
  ['handle-hettich-9070420','right'],
  ['handle-hettich-9070101','right','drawers'],
  ['handle-hettich-9070421','left','drawers'],
  ['handle-hettich-9070096','left','drawers'],
  ['handle-hettich-9070096','right'],
  ['handle-hettich-9069815','right','drawers'],
  ['handle-hettich-9069865','left'],
  ['handle-hettich-9069942','right'],
  ['handle-hettich-9070124','left','drawers'],
  ['handle-hettich-9071926-inner','left','drawers'],
  ['handle-hettich-9071929','right'],
  ['handle-hettich-9064670-inner','left','drawers'],
  ['handle-hettich-9064670-inner','left'],
  ['handle-hettich-9064670-inner','right'],
  ['handle-hettich-9064670','right'],
  ['handle-hettich-9070264','left','drawers'],
  ['handle-hettich-9070264','right'],
  ['handle-hettich-9070263','left','drawers'],
  ['handle-hettich-9070263','right'],
  ['handle-hettich-9071860','left','drawers'],
  ['handle-hettich-9071860','right'],
  ['handle-hettich-9071869','left','drawers'],
  ['handle-hettich-9071869','right'],
  ['handle-hettich-9113635','left','drawers'],
  ['handle-hettich-9113635','right'],
  ['handle-hettich-9071096','left','drawers'],
  ['handle-hettich-9071096','right'],
  ['handle-hettich-9070556','left'],
  ['handle-hettich-9070556','right','drawers'],
  ['handle-hettich-9070537','left'],
  ['handle-hettich-9070537','right','drawers'],
  ['handle-hettich-9070581','left'],
  ['handle-hettich-9070581','right','drawers'],
  ['handle-hettich-9070501','left'],
  ['handle-hettich-9070504','right','drawers'],
  ['handle-hettich-9070509','right'],
  ['handle-hettich-9070552','left'],
  ['handle-hettich-9070552','right','drawers'],
  ['handle-hettich-9070572','left'],
  ['handle-hettich-9070572','right','drawers'],
  ['handle-hettich-9071080','left','drawers'],
  ['handle-hettich-9071080','right'],
  ['handle-hettich-9071109','left','drawers'],
  ['handle-hettich-9071109','right'],
  ['handle-hettich-9080852','left','drawers'],
  ['handle-hettich-9080852','right'],
  ['handle-hettich-9071857','left','drawers'],
  ['handle-hettich-9071857','right'],
  ['handle-hettich-9071060','left'],
  ['handle-hettich-9071060','right'],
  ['handle-hettich-9071060','left','drawers'],
  ['handle-hettich-9071082','right'],
  ['handle-hettich-9071082','left','drawers'],
  ['handle-hettich-9071012','left'],
  ['handle-hettich-9071017','right'],
  ['handle-hettich-9071021','right'],
  ['handle-hettich-9071027','right'],
  ['handle-hettich-9071041','right','drawers'],
  ['handle-hettich-9070269','right','drawers'],
  ['handle-hettich-9069799','right','drawers'],
  ['handle-hettich-9071048','left'],
  ['handle-hettich-9070978','right','drawers'],
  ['handle-hettich-9070440','left'],
  ['handle-hettich-9070494','right','drawers'],
  ['handle-hettich-9070562','left'],
  ['handle-hettich-9070562','left','drawers'],
  ['handle-hettich-9070568','right'],
  ['handle-hettich-9070568','right','drawers'],
  ['handle-hettich-9070575','left','drawers'],
  ['handle-hettich-9070510','right'],
  ['handle-hettich-9070744','left'],
  ['handle-hettich-9070735','right','drawers'],
  ['handle-hettich-9070605','right'],
  ['handle-hettich-9070593','right','drawers'],
  ...['runner-hettich-quadro-2d','runner-hettich-quadro-5d'].flatMap(preset =>
    [229,305,381,457,533,610].flatMap(length =>
      [0,2].flatMap(gap=>[13,16].map(thickness=>[preset,'left','drawers',gap,length,thickness])))),
  ...[250,300,350,400,450,500,550,600,650,700].map(length =>
    ['runner-3832e','left','drawers',2,length]),
  ['runner-blum-763h','left','drawers'],
  ['runner-richelieu-828','left','drawers'],
]) {
  const usesHandle = preset.startsWith('handle-');
  const usesQuadro = preset.startsWith('runner-hettich-quadro-');
  const usesAccuride = preset === 'runner-3832e';
  const usesMovento = preset === 'runner-blum-763h';
  const usesRichelieu = preset === 'runner-richelieu-828';
  const draft=applyHardwarePreset(defaultCabinet(),preset);
  if (preset==='handle-hettich-9086690') {
    draft.materials.doorThickness=19;
    draft.materials.drawerFrontThickness=19;
  }
  if (preset==='handle-hettich-9071041') draft.width=1100;
  if (preset==='handle-hettich-9070269') draft.width=1180;
  if (preset==='hinge-hettich-9071206' || usesQuadro) draft.overlay={type:'partial-overlay',amount:9};
  draft.front.mode=mode;draft.doors.count=1;draft.doors.hingeSide=hand;
  if (usesQuadro || usesMovento || usesRichelieu) draft.drawers.sideThickness=sideThickness;
  if (usesQuadro) {
    draft.depth=700;
    draft.hardware.runnerLength=length;
    draft.hardware.quadroFrontGap=gap;
  }
  if (usesAccuride) {
    draft.depth=800;
    draft.hardware.runnerLength=length;
  }
  draft.drawers.count=1;draft.drawers.heights=[frontLayout(draft).height];
  const config=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(config);
  const size={width:config.width,height:config.height,depth:config.depth};
  const instance={instanceId:hand,config};
  const context={
    THREE:{Mesh,BoxGeometry:class {},MeshBasicMaterial:class {}},
    getCabinetGeometrySize:()=>size,computePanels:()=>panels,layoutPanelPosition:place,
    basicPanelGeometry:panelSolidData,createPanelMaterial:()=>null,
    addHardwareModels:(mesh,panel)=>vm.runInNewContext(`(function ${addHardware})(mesh,panel)`,
      {mesh,panel,HARDWARE_MODELS,manufacturerMesh:()=>new Mesh()}),
    requestCad:()=>Promise.resolve([]),cadModels:new Map(),meshByInstanceId:new Map(),_addPanelEdges(){},
  };
  const cabinet=vm.runInNewContext(`(function(instance,key){${createCabinet}}).call(context,instance,'test')`,
    {...context,context,instance});
  for(const [i,panel] of panels.entries()) {
    const part=cabinet.children[i];
    if (usesRichelieu && panel.id==='drawer-1-back') {
      assert.equal(part.rotation.y,Math.PI);
      const bottom=panels.find(p=>p.id==='drawer-1-bottom');
      const near=(a,b)=>Math.abs(a-b)<0.001;
      const notchVertices=[];
      for (let k=0;k<part.geometry.positions.length;k+=3) {
        const [x,y,z]=part.geometry.positions.slice(k,k+3);
        if (near(y,12.7-panel.sizeY/2) && near(Math.abs(x),panel.sizeX/2-37)) {
          notchVertices.push([part.position.x-x,part.position.y+y,part.position.z-z]);
        }
      }
      assert.equal(new Set(notchVertices.map(p=>p[0])).size,2);
      for (const [x,y,z] of notchVertices) {
        const [rotatedX,rotatedZ]=[z,-x];
        assert.ok(near(y,place(bottom,size).y-bottom.sizeY/2));
        assert.ok(near(Math.abs(rotatedZ+part.position.x),panel.sizeX/2-37));
        assert.ok(near(Math.abs(rotatedX-part.position.z),panel.sizeZ/2));
      }
    }
    const hardware=part.children.filter(child=>child.userData.isHardwareModel);
    if (!panel.hardwareModels) continue;
    assert.equal(hardware.length,usesHandle || (usesAccuride && panel.type==='drawer-box')?1:2);
    assert.equal(part.rotation.y,Math.PI);
    const toKitchen=([x,y,z])=>[part.position.x-x,part.position.y+y,part.position.z-z];
    if (usesAccuride) {
      for (const [j, mesh] of hardware.entries()) {
        const rail=panel.hardwareModels[j];
        assert.ok(HARDWARE_MODELS[rail.model]?.positions.length, `${length} mm ${rail.stage} CAD`);
        assert.equal(mesh.userData.runnerStage,rail.stage);
        assert.equal(mesh.scale.x,rail.direction);
        const purpose=rail.stage==='fixed'?'drawer-runner-mount':'drawer-slide-mount';
        const pilots=panelBores(panel).filter(b=>b.purpose===purpose);
        for (const {y,z} of rail.mounts) {
          const centre=toKitchen([mesh.position.x,mesh.position.y+y,mesh.position.z+z]);
          assert.ok(pilots.some(b=>Math.hypot(...toKitchen(b.start).map((v,k)=>v-centre[k]))<0.001));
        }
      }
      continue;
    }
    if (usesMovento) {
      const bottom = panels.find(p => p.id === 'drawer-1-bottom');
      assert.equal(panel.id,'drawer-1-inner-front');
      for (const [j, hand] of ['left','right'].entries()) {
        const side = panels.find(p => p.id === `drawer-1-side-${hand}`);
        const mesh = hardware[j];
        const [x,y,z] = toKitchen([mesh.position.x,mesh.position.y,mesh.position.z]);
        const insideX = place(side,size).x + (hand==='left' ? -1 : 1)*side.sizeX/2;
        assert.ok(Math.abs(x-insideX)<0.001);
        assert.ok(Math.abs(y-(place(bottom,size).y-bottom.sizeY/2))<0.001);
        assert.ok(Math.abs(z-(part.position.z-panel.sizeZ/2))<0.001);
        assert.equal(panel.hardwareModels[j].model,`blum-t51.7601${hand[0]}`);
      }
    }
    const bores=panelBores(panel).filter(b=>['handle','hinge-cup-fixing','hinge-mounting-plate','quadro-runner-mount'].includes(b.purpose));
    if (preset==='runner-hettich-quadro-2d' && panel.id==='drawer-1-back') {
      const hooks=panelBores(panel).filter(b=>b.purpose==='quadro-rear-hook');
      assert.equal(hooks.length,2);
      for (const [index,mesh] of hardware.entries()) {
        const hook=hooks[index];
        const positions=HARDWARE_MODELS[panel.hardwareModels[index].model].positions;
        const entersBore=positions.some((x,i)=>i%3===0
          && Math.hypot(mesh.position.x+x-hook.start[0],mesh.position.y+positions[i+1]-hook.start[1])<hook.radius
          && mesh.position.z+positions[i+2]<hook.start[2]
          && mesh.position.z+positions[i+2]>hook.start[2]-hook.depth);
        assert.ok(entersBore,`Quadro 2D ${length} mm, ${sideThickness} mm stock, ${gap} mm gap, rail ${index+1}`);
      }
    }
    if (preset==='runner-hettich-quadro-5d' && panel.id==='drawer-1-back') {
      const hooks=panelBores(panel).filter(b=>b.purpose==='quadro-rear-hook');
      assert.equal(hooks.length,2);
      for (const [index,mesh] of hardware.entries()) {
        // The manufacturer's handed STEP pin is 28 mm inboard and 1.5 mm above the fixing row.
        const [x,y]=toKitchen([mesh.position.x+(index===0?28:-28),mesh.position.y+1.5,mesh.position.z]);
        const hook=hooks.find(b=>{
          const [hookX,hookY]=toKitchen(b.start);
          return Math.hypot(hookX-x,hookY-y)<0.001;
        });
        const label=`Quadro 5D ${length} mm, ${sideThickness} mm stock, ${gap} mm front gap, rail ${index+1}`;
        assert.ok(hook,label);
        const positions=HARDWARE_MODELS[panel.hardwareModels[index].model].positions;
        let insertion=0;
        for (let i=0;i<positions.length;i+=3) {
          const radial=Math.hypot(positions[i]-(index===0?28:-28),positions[i+1]-1.5);
          if (Math.abs(radial-2.925)>0.001) continue;
          const depth=hook.start[2]-mesh.position.z-positions[i+2];
          if (depth>0 && depth<=hook.depth) insertion=Math.max(insertion,depth);
        }
        assert.ok(Math.abs(insertion-8.5)<0.01,`${label}: ${insertion} mm pin insertion`);
      }
    }
    for(const [j,mesh] of hardware.entries()) {
      const model=HARDWARE_MODELS[panel.hardwareModels[j].model];
      for(const [index,[x,y,z]] of (model.mountingCentres || []).entries()) {
        const angle=mesh.rotation.z;
        const mount=toKitchen([mesh.position.x+x*mesh.scale.x*Math.cos(angle)-y*Math.sin(angle),
          mesh.position.y+x*mesh.scale.x*Math.sin(angle)+y*Math.cos(angle),mesh.position.z+z]);
        const omittedMiddle = preset==='runner-hettich-quadro-2d' && panel.id.startsWith('side-') && index===2;
        assert.equal(bores.some(b=>{
          const start=toKitchen(b.start);
          if (b.source.face==='back' && b.purpose==='handle') {
            return Math.hypot(start[0]-mount[0],start[1]-mount[1])<0.001
              && mount[2]>start[2] && Math.abs(mount[2]-start[2]-b.depth)<0.001;
          }
          return Math.hypot(...start.map((value,k)=>value-mount[k]))<0.001;
        }),!omittedMiddle);
      }
    }
  }
  assert.equal(cabinet.children.flatMap(part=>part.children).filter(child=>child.userData.isHardwareModel).length,usesRichelieu?0:usesHandle?1:usesMovento?2:usesQuadro || usesAccuride?6:4);
}
for (const category of ['base','wall']) for (const [preset,overlay,gap,thickness=18,reveal=3,amount=9,doorThickness=thickness] of [
  ['hinge-blum-71b3550','full-overlay',1.5],
  ['hinge-blum-71b3550-19mm','full-overlay',1.5,19,4],
  ['hinge-blum-71b3550-19mm-86','full-overlay',1.5,19,4],
  ['hinge-blum-71b3750','inset',0,18,4],
  ['hinge-hettich-9071205','full-overlay',1.5],
  ['hinge-hettich-9071206','partial-overlay',1.5],
  ['hinge-hettich-9071206','partial-overlay',1.5,19,4,9.5],
  ['hinge-hettich-9099550-e2','partial-overlay',1,19,4,9.5],
  ['hinge-hettich-9099590','partial-overlay',1,19,4,9.5],
  ['hinge-hettich-9071207','inset',0],
  ['hinge-hettich-9071207-a5','inset',0,19,2],
  ['hinge-hettich-9071205-a1','full-overlay',1.5,19,4],
  ['hinge-hettich-9071205-lr28','full-overlay',1.5,19,4],
  ['hinge-hettich-9071206-lr28','partial-overlay',1.5,19,4,9.5],
  ['hinge-hettich-9099540-lr28','full-overlay',1,19,4],
  ['hinge-hettich-9099550-lr28','partial-overlay',1,19,4,9.5],
  ['hinge-hettich-9099590-lr28','partial-overlay',1,19,4,9.5],
  ['hinge-hettich-9094270','full-overlay',1,19,4,9,10],
  ['hinge-hettich-9094280','partial-overlay',1,19,4,9.5,10],
  ['hinge-hettich-9094280-d2','partial-overlay',1,10,2,10,10],
  ['hinge-hettich-9094290','inset',0,19,2,9,10],
  ['hinge-hettich-9071205-a2','full-overlay',1.5,16,2,9,19],
  ['hinge-hettich-9099540-e1','full-overlay',1,19,4],
  ['hinge-hettich-9090260-b1','full-overlay',1,19,4,9,28],
  ['hinge-hettich-9090260-b2','full-overlay',1,22,6,9,32],
  ['hinge-hettich-9090270-b3','partial-overlay',1,19,4,9.5,28],
  ['hinge-hettich-9090280-b4','inset',0,19,2,9,22],
  ...[28,30,32,34].map((stock,index)=>[`hinge-hettich-9099540-b${index+5}`,'full-overlay',1,19,4,9,stock]),
  ['hinge-hettich-9099540','full-overlay',1],
]) {
  const config = applyHardwarePreset(defaultCabinet(),preset);
  config.category = category;
  config.overlay.type = overlay;
  config.overlay.amount = amount;
  config.materials.caseThickness = thickness;
  config.materials.doorThickness = doorThickness;
  if (preset === 'hinge-hettich-9094280-d2') config.materials.caseMaterial = 'Compact HPL';
  config.reveal = reveal;
  config.doors.count = 2;
  const saved = normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(config))));
  const cabinet = saved.cabinets[0].config;
  const size = {width:cabinet.width,height:cabinet.height,depth:cabinet.depth};
  const panels = computePanels(cabinet);
  const doors = panels.filter(panel => panel.type === 'door');
  assert.deepEqual(doors.map(door => door.hingeSide).sort(),['left','right']);
  for (const door of doors) {
    const side = panels.find(panel => panel.id === `side-${door.hingeSide}`);
    const front = place(door,size), wall = place(side,size);
    const doorFront = overlay === 'inset' ? front.z+door.sizeZ/2 : front.z-door.sizeZ/2;
    assert.equal(doorFront-(wall.z+side.sizeZ/2),gap);
    const cups = door.holes.filter(hole => hole.purpose === 'hinge-cup');
    assert.equal(cups.length,2);
    for (const cup of cups) {
      const y = front.y + cup.y - door.cutHeight/2;
      const plateBores = side.holes.filter(hole => hole.purpose === 'hinge-mounting-plate'
        && Math.abs(Math.abs(wall.y + hole.y - side.cutHeight/2 - y)-16)<0.001);
      assert.equal(plateBores.length,2);
    }
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
assert.equal(first.rotation.y,Math.PI/2);
assert.equal(created,1,'moving/rotating keeps geometry');
context.instances[0].config={...c,width:900};run();
assert.equal(created,2);assert.equal(disposed,1,'config change replaces and disposes previous model');
context.instances=[];run();assert.equal(disposed,2,'removed cabinets release geometry');
console.log('PASS: base/wall placement, saved Blum and Richelieu geometry, front orientation, rotation reuse and disposal');

class Group extends Mesh {
  visible=true;
  add(child) { super.add(child); child.parent=this; }
}
const blumConfig=applyHardwarePreset(defaultCabinet(),'hinge-blum-71b3550');
blumConfig.doors.count=2;
const blumPanels=computePanels(blumConfig);
const scene=new Group();
scene.isScene=true;
const modelFiles=Object.fromEntries(['71b3550','71b3550-cup','71b3550-arm','173h7100'].map(part=>[`blum-${part}`,'clip-top']));
let renders=0;
for (const [side, mirror] of [['left',1],['right',-1]]) {
  const door=blumPanels.find(p=>p.type==='door' && p.hingeSide===side);
  const carcass=blumPanels.find(p=>p.id===`side-${side}`);
  for (const panel of [door,carcass]) {
    const mesh=new Group();
    scene.add(mesh);
    vm.runInNewContext(`(function ${addHardware})(mesh,panel,requestRender)`, {
      mesh,panel,requestRender:()=>renders++,HARDWARE_MODELS:{},blumPreviewFiles:modelFiles,
      loadBlumModel:async model=>({model}),manufacturerMesh:data=>Object.assign(new Mesh(),data),THREE:{Group},
    });
    assert.equal(mesh.children.length,4);
    for (const group of mesh.children) {
      assert.equal(group.scale.x,mirror);
      if (group.userData.closedOnly) group.visible=false;
    }
    await Promise.resolve();
    for (const [index, group] of mesh.children.entries()) {
      assert.equal(group.children[0].model,panel.hardwareModels[index].model);
      assert.equal(group.visible,group.children[0].model!=='blum-71b3550');
    }
  }
}
assert.equal(renders,16);

const moventoConfig=applyHardwarePreset(defaultCabinet(),'runner-blum-763h');
moventoConfig.front.mode='drawers';
moventoConfig.drawers.count=1;
moventoConfig.drawers.heights=[frontLayout(moventoConfig).height];
moventoConfig.drawers.sideThickness=16;
moventoConfig.depth=800;
const moventoPanels=computePanels(moventoConfig);
const lockPanel=moventoPanels.find(p=>p.id==='drawer-1-inner-front');
const lockMesh=new Group();
scene.add(lockMesh);
const lockFiles={'blum-t51.7601l':'movento-lock-left','blum-t51.7601r':'movento-lock-right'};
const resolveLocks=new Map();
let lockRenders=0;
vm.runInNewContext(`(function ${addHardware})(mesh,panel,requestRender)`,{
  mesh:lockMesh,panel:lockPanel,requestRender:()=>lockRenders++,HARDWARE_MODELS:{},blumPreviewFiles:lockFiles,
  loadBlumModel:model=>new Promise(resolve=>resolveLocks.set(model,resolve)),
  manufacturerMesh:data=>Object.assign(new Mesh(),data),THREE:{Group},
});
assert.equal(lockMesh.children.length,2);
// The parent can move while the models download. Resolve the right lock first.
lockMesh.position.set(0,0,-200);
for (const index of [1,0]) {
  const {model,x,y,z}=lockPanel.hardwareModels[index];
  resolveLocks.get(model)({model});
  await Promise.resolve();
  const group=lockMesh.children[index];
  assert.equal(group.parent,lockMesh);
  assert.equal(group.children[0].model,model);
  assert.deepEqual([group.position.x,group.position.y,group.position.z],[x,y,z]);
}
assert.equal(lockMesh.position.z,-200);
assert.equal(lockRenders,2);

const clipHash='ff0556711165fe0511f2b8925923f0bdbf28e45a7a783684f15cb8bbf371b9d9';
const triangle=[0,0,0,1,0,0,0,1,0];
const splitClipModels={'71B3550':triangle,'173H7100':triangle,'71B3550-cup':triangle,'71B3550-arm':triangle};
assert.throws(()=>loadLocalBlumPreview({
  sourceSha256:clipHash,models:{'71B3550':triangle,'173H7100':triangle},
},'clip-top'),/Invalid preview geometry for Blum 71B3550-cup/);
for (const invalidArm of [undefined,[...triangle,0],triangle.map(()=>Infinity)]) {
  assert.throws(()=>loadLocalBlumPreview({
    sourceSha256:clipHash,models:{...splitClipModels,'71B3550-arm':invalidArm},
  },'clip-top'),/Invalid preview geometry for Blum 71B3550-arm/);
  for (const sku of Object.keys(splitClipModels)) assert.equal(HARDWARE_MODELS[`blum-${sku.toLowerCase()}`],undefined);
}
loadLocalBlumPreview({sourceSha256:clipHash,models:splitClipModels},'clip-top');
for (const sku of Object.keys(splitClipModels)) assert.equal(HARDWARE_MODELS[`blum-${sku.toLowerCase()}`].partNumber,sku);

const loadSource = hardwareSource.match(/function (loadBlumModel\([^\n]+\{[\s\S]*?\n\})/)[1]
  .replace('import.meta.url', '"http://localhost/js/hardware-view.js"');
const retryModels = {};
let fetches = 0;
const failures = [];
const loadModel = vm.runInNewContext(`(function ${loadSource})`, {
  URL,HARDWARE_MODELS:retryModels,previewRequests:new Map(),blumPreviewFiles:{cup:'clip-top',arm:'clip-top'},
  console:{warn:(_, error)=>failures.push(error.message)},
  fetch:async (_, options) => {
    assert.equal(options.cache,'no-cache');
    const response = ++fetches;
    if (response===4) throw new TypeError('Network unavailable');
    return {ok:response!==1,json:async () => {
      if (response===3) throw new SyntaxError('Invalid JSON');
      return response===2 ? null : {cup:{},arm:{}};
    }};
  },
  loadLocalBlumPreview:data=>{
    if (data===null) throw new Error('Empty CAD');
    Object.assign(retryModels,data);
  },
});
for (const attempt of [1,2,3,4]) {
  assert.deepEqual(await Promise.all([loadModel('cup'),loadModel('arm')]),[undefined,undefined]);
  assert.equal(fetches,attempt,'one shared request for each failed attempt');
}
assert.deepEqual(failures,['Empty CAD','Invalid JSON','Network unavailable']);
assert.deepEqual(await Promise.all([loadModel('cup'),loadModel('arm')]),[{},{}]);
assert.deepEqual(await Promise.all([loadModel('cup'),loadModel('arm')]),[{},{}]);
assert.equal(fetches,5,'reuse the recovered asset');

let finishLoad;
const detached = new Group();
detached.parent = new Mesh();
detached.parent.parent = {isScene:true};
vm.runInNewContext(`(function ${addHardware})(mesh,panel,requestRender)`, {
  mesh:detached,panel:{hardwareModels:[{model:'cup',x:0,y:0,z:0,rotation:0}]},
  requestRender:()=>assert.fail('detached cabinet rendered'),
  HARDWARE_MODELS:{},blumPreviewFiles:{cup:'clip-top'},
  loadBlumModel:()=>new Promise(resolve=>{ finishLoad=resolve; }),
  manufacturerMesh:()=>new Mesh(),THREE:{Group:Mesh},
});
detached.parent.parent = null;
finishLoad({});
await Promise.resolve();
assert.equal(detached.children[0].children.length,0,'do not attach a late CAD result to a removed cabinet');

const status = {setAttribute(_name, value) { this.busy = value; }};
const updateStatusSource = source.match(/  (_updateModelStatus\(\) \{[\s\S]*?\n  \})/)[1];
const updateStatus = vm.runInNewContext(`(function ${updateStatusSource})`, {
  document:{getElementById:()=>status},
});
const loadingCabinet = {userData:{detailed:true,pendingHardware:1}};
const statusViewport = {meshByInstanceId:new Map([['cabinet',loadingCabinet]])};
updateStatus.call(statusViewport);
assert.deepEqual([status.textContent,status.busy],['Loading hardware…','true']);
loadingCabinet.userData.pendingHardware = 0;
updateStatus.call(statusViewport);
assert.deepEqual([status.textContent,status.busy],['Ready','false']);
loadingCabinet.userData.hardwareUnavailable = true;
updateStatus.call(statusViewport);
assert.deepEqual([status.textContent,status.busy],['Some hardware models unavailable.','false']);

for (const [file, parts] of [
  ['clip-top', ['71b3550','71b3550-cup','71b3550-arm','173h7100']],
  ['clip-top-inset', ['71b3750','71b3750-cup','71b3750-arm','173h7100-inset']],
  ['movento-lock-left', ['t51.7601l']],
  ['movento-lock-right', ['t51.7601r']],
]) {
  const url = new URL(`../assets/hardware/private/${file}.json`, import.meta.url);
  if (!existsSync(url)) continue;
  const data = JSON.parse(readFileSync(url, 'utf8'));
  for (const part of parts) delete HARDWARE_MODELS[`blum-${part}`];
  loadLocalBlumPreview(data, file);
  for (const part of parts) assert.ok(HARDWARE_MODELS[`blum-${part}`]?.positions.length > 9, part);
  if (file==='clip-top' || file==='clip-top-inset') {
    const inset=file==='clip-top-inset';
    const config=applyHardwarePreset(defaultCabinet(),inset?'hinge-blum-71b3750':'hinge-blum-71b3550');
    config.doors.count=2;
    if (inset) {
      config.overlay.type='inset';
      config.reveal=4;
    }
    const panels=computePanels(config);
    for (const side of ['left','right']) {
      const door=panels.find(p=>p.type==='door' && p.hingeSide===side);
      const carcass=panels.find(p=>p.id===`side-${side}`);
      const cup=door.hardwareModels.find(p=>p.model===`blum-${parts[1]}`);
      const plate=carcass.hardwareModels.find(p=>p.model===`blum-${parts[3]}`);
      assert.ok(Math.abs(plate.z+carcass.sizeZ/2-(inset?56.5:37))<0.001);
      const inside=side==='left' ? 1 : -1;
      const plateMesh=HARDWARE_MODELS[plate.model].positions;
      const plateOffsets=plateMesh.filter((_,i)=>i%3===0)
        .map(x=>inside*(plate.x+x*plate.mirrorX)-carcass.sizeX/2);
      assert.ok(Math.abs(Math.min(...plateOffsets))<0.001,`${side} plate seats on the cabinet interior`);
      const cupMesh=HARDWARE_MODELS[cup.model].positions;
      const cupDepth=cupMesh.reduce((depth,value,i)=>i%3===2
        ? Math.max(depth,door.sizeZ/2-cup.z-value) : depth,0);
      assert.ok(Math.abs(cupDepth-12.8)<0.001,`${side} cup reaches 12.8 mm into the door bore`);
    }
  }
  if (file.startsWith('movento-lock-')) {
    const hand=file.endsWith('left') ? 'left' : 'right';
    const [part]=parts;
    const placement=lockPanel.hardwareModels.find(p=>p.model===`blum-${part}`);
    const side=moventoPanels.find(p=>p.id===`drawer-1-side-${hand}`);
    const bottom=moventoPanels.find(p=>p.id==='drawer-1-bottom');
    const inward=hand==='left' ? 1 : -1;
    const insideX=side.posX+inward*side.sizeX/2;
    const underside=bottom.posY-bottom.sizeY/2;
    const frontBack=lockPanel.posZ+lockPanel.sizeZ/2;
    const positions=HARDWARE_MODELS[placement.model].positions;
    const minInward=Math.min(...positions.filter((_,i)=>i%3===0)
      .map(x=>inward*(lockPanel.posX+placement.x+x-insideX)));
    const maxY=Math.max(...positions.filter((_,i)=>i%3===1))+lockPanel.posY+placement.y;
    const minZ=Math.min(...positions.filter((_,i)=>i%3===2))+lockPanel.posZ+placement.z;
    assert.ok(Math.abs(minInward)<0.001,`${hand} lock seats on its drawer side`);
    assert.ok(Math.abs(maxY-underside)<0.001,`${hand} lock seats below the drawer bottom`);
    assert.ok(Math.abs(minZ-frontBack)<0.001,`${hand} lock seats behind the inner front`);
  }
  console.log(`PASS: local Blum CAD asset ${file}`);
}
