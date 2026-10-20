import assert from 'node:assert/strict';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { doorDetailPath, DOOR_DETAIL_STYLES } from '../js/door-detail.js';
globalThis.window = {};
const { panelToDxf, sheetToDxf } = await import('../js/dxf-writer.js');
for (const style of DOOR_DETAIL_STYLES) {
 const c = defaultCabinet(); c.doors.detailStyle = style; c.doors.detailInset = 60;
 const doors = computePanels(c).filter(p=>p.type==='door');
 for (const door of doors) {
  assert.equal(door.detailPaths.length, style==='none'?0:1);
  for (const path of door.detailPaths) {
   assert.ok(path.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=59.99&&p.x<=door.cutWidth-59.99&&p.y>=59.99&&p.y<=door.cutHeight-59.99));
   const dxf = panelToDxf(door);
   assert.equal(dxf.split('0\nPOLYLINE\n8\nDOOR_DETAIL').length-1,1);
   for (const rotated of [false,true]) {
    const width = rotated ? door.cutHeight : door.cutWidth;
    const sheet = sheetToDxf({sheetWidth:2440,sheetHeight:1220,index:0,placements:[{panel:door,x:100,y:50,width,height:rotated?door.cutWidth:door.cutHeight,rotated}]});
    assert.equal(sheet.split('0\nPOLYLINE\n8\nDOOR_DETAIL').length-1,1);
    const first = path[0];
    const x=100+(rotated?width-first.y:first.x), y=50+(rotated?first.x:first.y);
    assert.ok(sheet.includes(`10\n${x}\n20\n${y}`));
   }
  }
 }
}
assert.deepEqual(doorDetailPath(100,100,{detailStyle:'arch',detailInset:60}),[]);
assert.deepEqual(doorDetailPath(500,700,{detailStyle:'rounded',detailSize:0}),[]);
console.log('PASS: six styles, door bounds, single centreline exports and nested rotation');

// Inward arcs are centred on the inset rectangle corners, not inside it.
const inward = doorDetailPath(500,700,{detailStyle:'inward-rounded',detailInset:60,detailSize:40});
const firstArc = inward.filter(p=>p.x<=100.001&&p.y<=100.001);
assert.ok(firstArc.length>4);
for (const p of firstArc) assert.ok(Math.abs(Math.hypot(p.x-60,p.y-60)-40)<1e-8);
const { readFileSync } = await import('node:fs');
const { runInNewContext } = await import('node:vm');
const source = readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
const preview = source.slice(source.indexOf('function buildPanelPreviewSvg('), source.indexOf('\nfunction buildEdgeBandingLines('));
const render = runInNewContext(`(${preview})`, {escapeHtml:s=>s,buildEdgeBandingLines:()=>''});
for (const style of DOOR_DETAIL_STYLES) {
 const path = doorDetailPath(500,700,{detailStyle:style});
 const svg = render({name:'Door',cutWidth:500,cutHeight:700,detailPaths:path.length?[path]:[]});
 assert.equal((svg.match(/<polygon /g)||[]).length,style==='none'?0:1);
 if (path.length) assert.ok(svg.includes(`points="${path.map(p=>`${p.x},${p.y}`).join(' ')}"`));
}
console.log('PASS: inward arc radius and panel preview renders every detail as one closed path');

const placementPreview = source.slice(source.indexOf('function buildPlacementDetailSvg('),source.indexOf('\nfunction buildPlacementNotchSvg('));
const renderPlacement = runInNewContext(`(${placementPreview})`);
for (const rotated of [false,true]) {
 const path = [{x:60,y:80},{x:240,y:620},{x:90,y:500}];
 const panel = {cutWidth:300,cutHeight:700,detailPaths:[path]};
 const svg = renderPlacement({panel,x:100,y:50,rotated},2440);
 assert.ok(svg.includes(rotated?'points="720,110 180,290 300,140"':'points="160,130 340,670 190,550"'));
 assert.equal((svg.match(/<polygon /g)||[]).length,1);
}
assert.equal(renderPlacement({panel:{},x:0,y:0},2440),'');
assert.ok(source.replace(/\r/g, '').includes('${notchCutouts}\n        ${details}'));
console.log('PASS: nesting preview detail placement, including rotation and plain panels');

const { doorSlatPaths } = await import('../js/door-detail.js');
for (const [width,spacing,count] of [[500,50,8],[520,50,9],[150,100,1]]) {
 const paths=doorSlatPaths(width,700,{detailInset:60,detailSpacing:spacing});
 assert.equal(paths.length,count);
 assert.equal(paths[0][0].x,width-paths.at(-1)[0].x);
 for (let i=0;i<paths.length;i++) {
  assert.equal(paths[i].length,2);
  assert.equal(paths[i][0].y,60); assert.equal(paths[i][1].y,640);
  if(i) assert.equal(paths[i][0].x-paths[i-1][0].x,spacing);
 }
}
for (const spacing of [0,-10,NaN,0.1]) assert.deepEqual(doorSlatPaths(500,700,{detailSpacing:spacing}),[]);
assert.deepEqual(doorSlatPaths(100,700,{detailInset:60}),[]);
const slatConfig=defaultCabinet();
Object.assign(slatConfig.doors,{detailStyle:'slats',detailSpacing:50});
const slatDoor=computePanels(slatConfig).find(p=>p.type==='door');
assert.equal(slatDoor.detailPathsClosed,false);
const lineCount=slatDoor.detailPaths.length;
assert.ok(lineCount>0);
for (const dxf of [panelToDxf(slatDoor),sheetToDxf({sheetWidth:2440,sheetHeight:1220,index:0,placements:[{panel:slatDoor,x:20,y:30,width:slatDoor.cutHeight,height:slatDoor.cutWidth,rotated:true}]})]) {
 assert.equal(dxf.split('0\nPOLYLINE\n8\nDOOR_DETAIL\n66\n1\n70\n0').length-1,lineCount);
}
assert.equal((render(slatDoor).match(/<polyline /g)||[]).length,lineCount);
assert.equal((renderPlacement({panel:slatDoor,x:20,y:30,rotated:true},2440).match(/<polyline /g)||[]).length,lineCount);
console.log('PASS: exact slat spacing, centred margins, automatic counts, open DXF paths and both previews');


const fullSlats=doorSlatPaths(500,700,{detailInset:0,detailSpacing:50});
assert.equal(fullSlats.length,11);
assert.deepEqual(fullSlats[0],[{x:0,y:0},{x:0,y:700}]);
assert.deepEqual(fullSlats.at(-1),[{x:500,y:0},{x:500,y:700}]);
assert.deepEqual(doorSlatPaths(500,700,{detailInset:-1}),[]);
const { lengthInput, readLength, setUnits, getUnits }=await import('../js/units.js?v=20261020h');
const formSource=readFileSync(new URL('../js/form-ui.js',import.meta.url),'utf8');
const method=formSource.slice(formSource.indexOf('  _routedDetailFields(group) {'),formSource.indexOf('  _drawerDetailFields() {'));
const buildFields=runInNewContext(`({${method}})._routedDetailFields`,{lengthInput,getUnits});
for(const units of ['metric','imperial']) {
 setUnits(units);
 const controls=new Map(), fields=new Map();
 const input=attrs=>{
  const element={...attrs,dataset:{},listeners:{},addEventListener(event,fn){this.listeners[event]=fn;},removeAttribute(key){delete this[key];}};
  controls.set(attrs['data-key'],element); return element;
 };
 const ctx={config:{doors:{count:2,hingeSide:'both',detailStyle:'none',detailInset:50,detailSize:40,detailSpacing:50}},
 _createSelect:(options,attrs)=>input(attrs),_createInput:(type,attrs)=>input({...attrs,type}),_makeBlurb:s=>s,
 _makeField:(label,element,opts={})=>{
  if(opts.unit==='mm') lengthInput(element);
  const field={hidden:false,classList:{toggle(name,value){field.hidden=value;}}};
  fields.set(label,field);return field;
 }};
 buildFields.call(ctx, 'doors');
 const style=controls.get('doors.detailStyle'),inset=controls.get('doors.detailInset');
 const hidden=label=>fields.get(label).hidden;
 assert.ok(hidden('Detail inset from edges'));
 style.value='slats';style.listeners.input();style.listeners.change();
 assert.equal(readLength(inset),0);
 assert.equal(hidden('Slat line spacing (centre to centre)'),false);
 assert.ok(hidden('Corner size / arch rise'));
 style.value='rounded';style.listeners.input();style.listeners.change();
 assert.equal(readLength(inset),units==='imperial'?50.8:50);
 assert.ok(hidden('Slat line spacing (centre to centre)'));
 assert.equal(hidden('Corner size / arch rise'),false);
 style.value='rectangle';style.listeners.change();
 assert.ok(hidden('Corner size / arch rise'));
}
setUnits('metric');
assert.ok(!formSource.includes('Slat lines are centred across the door'));
assert.ok(!formSource.includes('Detail exports on DOOR_DETAIL:'));
console.log('PASS: zero-inset full-height slats, style-specific fields and metric/imperial switching defaults');

for (const style of [...DOOR_DETAIL_STYLES,'slats']) {
 const c=defaultCabinet(); c.front.mode='drawers';
 Object.assign(c.drawers,{count:2,heights:[305.5,305.5],detailStyle:style,detailInset:style==='slats'?0:50});
 const panels=computePanels(c), fronts=panels.filter(p=>p.type==='drawer');
 assert.equal(fronts.length,2);
 assert.ok(panels.filter(p=>p.type==='drawer-box').every(p=>!p.detailPaths?.length));
 for (const front of fronts) {
  const expected=style==='slats'?doorSlatPaths(front.cutWidth,front.cutHeight,c.drawers):style==='none'?[]:[doorDetailPath(front.cutWidth,front.cutHeight,c.drawers)];
  assert.deepEqual(front.detailPaths,expected);
  const tag=style==='slats'?'polyline':'polygon';
  assert.equal((render(front).match(new RegExp(`<${tag} `,'g'))||[]).length,expected.length);
  assert.equal((renderPlacement({panel:front,x:10,y:20,rotated:true},2440).match(new RegExp(`<${tag} `,'g'))||[]).length,expected.length);
  const dxf=panelToDxf(front);
  assert.equal(dxf.split('0\nPOLYLINE\n8\nDOOR_DETAIL').length-1,expected.length);
 }
}
console.log('PASS: every detail style on drawer fronts, full-height slats, previews, DXF and undecorated drawer boxes');
