import assert from 'node:assert/strict';
import {defaultCabinet,computePanels} from '../js/cabinet-math.js';
import {frontLayout,rearInset} from '../js/front-layout.js';
import {applyHardwarePreset,hardwareBom} from '../js/hardware-library.js';
import {createProjectFromConfig,normalizeProject} from '../js/project-io.js';
import {panelSolidData} from '../js/panel-solid.js';
import {buildNestingPlan} from '../js/nesting.js';
globalThis.window = {JSZip:(await import('../lib/jszip.min.js')).default};
const {downloadManufacturingZip,sheetToDxf}=await import('../js/dxf-writer.js');

for (const [nominal, boxLength] of [[270,270],[300,290],[350,340],[400,390],[450,440],[500,490],[550,540],[600,590],[650,640]]) {
  const draft = applyHardwarePreset(defaultCabinet(),'runner-richelieu-828');
  draft.front.mode='drawers';
  draft.depth=800;
  draft.hardware.runnerLength=nominal;
  draft.drawers.count=1;
  draft.drawers.sideThickness=16;
  draft.drawers.bottomThickness=6;
  draft.drawers.heights=[frontLayout(draft).height];
  const saved=normalizeProject(JSON.parse(JSON.stringify(createProjectFromConfig(draft)))).cabinets[0].config;
  const panels=computePanels(saved);
  const back=panels.find(p=>p.id==='drawer-1-back');
  const inner=panels.find(p=>p.id==='drawer-1-inner-front');
  assert.equal(panels.find(p=>p.id==='drawer-1-side-left').cutWidth,boxLength);
  assert.equal(back.cutWidth,saved.width-2*saved.materials.caseThickness-42);
  assert.deepEqual(back.notches,[0,back.cutWidth-37].map(x=>({x,y:0,width:37,height:12.7})));
  assert.ok(Math.abs(panelSolidData(back).volume-(back.cutWidth*back.cutHeight-2*37*12.7)*16)<0.001);
  assert.ok(panels.every(p=>p.holes.every(h=>!/runner|rear-hook/.test(h.purpose))));
  assert.match(inner.hardwareWarnings[0],/fit 8284102 \(right\) and 8284103 \(left\) by hand/);
  const bom=hardwareBom(saved,panels);
  assert.equal(bom.find(row=>row.unit==='runner pairs').item,`Richelieu 828${nominal}`);
  assert.equal(bom.find(row=>row.unit==='locking-device pairs').item,'Richelieu 8284102 + 8284103');
  const positions = nominal <= 300 ? '37, 69, 165, 197' : nominal <= 500 ? '37, 69, 165, 261' : '37, 69, 165, 293, 357';
  for (const id of ['side-left','side-right']) {
    const side=panels.find(p=>p.id===id);
    const drawerSide=panels.find(p=>p.id==='drawer-1-side-left');
    const y=Number((drawerSide.posY-drawerSide.sizeY/2+21.5-(side.posY-side.sizeY/2)).toFixed(3));
    assert.ok(side.hardwareWarnings.some(w=>w.includes(`2020-07-22 Richelieu drawing shows the Planit upper-row references: ${positions} mm from the cabinet front`)));
    assert.ok(side.hardwareWarnings.some(w=>w.includes(`Y=${y} mm from the bottom edge`)));
    assert.equal(side.hardwareWarnings.some(w=>w.includes('verify the 357 mm reference on the supplied rail')),nominal>=550);
  }
  if (nominal===450 || nominal>=550) {
    let downloaded;
    globalThis.URL.createObjectURL=b=>{downloaded=b;return 'blob:richelieu';};
    globalThis.URL.revokeObjectURL=()=>{};
    globalThis.document={createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}};
    const nestingPlan=buildNestingPlan(panels,saved.nesting);
    assert.equal(nestingPlan.unplaced.length,0);
    await downloadManufacturingZip({config:saved,panels,nestingPlan});
    const zip=await window.JSZip.loadAsync(await downloaded.arrayBuffer());
    const nestedFiles=Object.keys(zip.files)
      .filter(name=>name.startsWith('nested-sheets/') && name.endsWith('.dxf'));
    assert.ok(nestedFiles.length>0);
    const drillLayers=[];
    for (const file of nestedFiles) {
      const dxf=await zip.file(file).async('string');
      for (const [,layer] of dxf.matchAll(/\n0\nCIRCLE\n8\n([^\n]+)\n/g)) drillLayers.push(layer);
    }
    // Only the two drawer pull holes should reach the nested DXFs.
    assert.deepEqual(drillLayers,['DRILL_FRONT_D18MM','DRILL_FRONT_D18MM']);
    const backFile=Object.keys(zip.files).find(name=>name.endsWith('-drawer-1-back.dxf'));
    assert.ok(backFile);
    const backDxf=await zip.file(backFile).async('string');
    assert.ok(backDxf.includes('\n10\n37\n20\n12.7\n'));
    assert.ok(backDxf.includes(`\n10\n${back.cutWidth-37}\n20\n12.7\n`));
    const rotated=sheetToDxf({index:0,sheetWidth:2440,sheetHeight:1220,placements:[
      {panel:back,x:20,y:30,width:back.cutHeight,height:back.cutWidth,rotated:true},
    ]});
    const notchX=(20+back.cutHeight-12.7).toFixed(3).replace(/\.?0+$/,'');
    assert.ok(rotated.includes(`\n10\n${notchX}\n20\n67\n`));
    assert.ok(rotated.includes(`\n10\n${notchX}\n20\n${back.cutWidth-7}\n`));
    const schedule=JSON.parse(await zip.file('machining-schedule.json').async('string'));
    const backSetup=schedule.panels.find(p=>p.id==='drawer-1-back').warnings.join(' ');
    assert.match(backSetup,/7 mm inboard of the inner drawer-side face and 11 mm above the top of the notch/);
    assert.ok(backSetup.includes(`X=7 and ${back.cutWidth-7} mm, Y=23.7 mm`));
    assert.match(backSetup,/12 mm bore leaves 4 mm/);
    assert.match(backSetup,/each centre is 23 mm in from its outside side face/);
    for (const id of [back.id, inner.id]) {
      const warnings=schedule.panels.find(p=>p.id===id).warnings.join(' ');
      assert.ok(warnings.includes(`nominal inside drawer width is ${back.cutWidth} mm`));
      assert.match(warnings,/disagree on the tolerance direction/);
    }
    const thinBack=computePanels({...saved,drawers:{...saved.drawers,sideThickness:12}})
      .find(p=>p.id==='drawer-1-back');
    assert.match(thinBack.hardwareWarnings.join(' '),/12 mm bore would go through this 12 mm drawer back/);
    assert.match(thinBack.hardwareWarnings.join(' '),/each centre is 19 mm in from its outside side face/);

    for (const [id, warning] of [
      ['side-left',new RegExp(`${positions} mm from the cabinet front, at 21\\.5 mm above the drawer-side bottom`)],
      ['side-right',new RegExp(`${positions} mm from the cabinet front, at 21\\.5 mm above the drawer-side bottom`)],
      ['drawer-1-back',/Richelieu drawing shows Ø7 mm.*Planit package specifies Ø8 × 12 mm/],
      ['drawer-1-inner-front',/8284102 \(right\) and 8284103 \(left\).*23 mm apart.*6\.7 mm front reference.*16 and 24 mm corner references/],
    ]) {
      const part=schedule.panels.find(p=>p.id===id);
      assert.ok(part.warnings.some(w=>warning.test(w)),id);
      if (id.startsWith('side-')) {
        assert.ok(part.warnings.some(w=>/Y=[\d.]+ mm from the bottom edge/.test(w)),id);
        assert.equal(part.warnings.some(w=>/357 mm reference.*Planit rail mesh shows no opening/.test(w)),nominal>=550,id);
      }
      assert.ok(part.faceBores.every(b=>!/runner|rear-hook|locking/.test(b.purpose)),id);
    }
  }
  saved.backMount='grooved-in';
  saved.depth=boxLength+18+saved.materials.doorThickness+rearInset(saved);
  const atMinimum=computePanels(saved);
  assert.ok(atMinimum.some(p=>p.type==='drawer-box'), `828${nominal} fits at the published inside depth`);
  saved.depth-=0.1;
  const shallow=computePanels(saved);
  assert.ok(shallow.every(p=>p.type!=='drawer-box'));
  assert.ok(hardwareBom(saved,shallow).every(row=>!row.item.includes(`828${nominal}`)));
}
console.log('PASS: nine Richelieu 828 lengths, saved box dimensions, dual rear notches, manual fitting and exact BOM');
