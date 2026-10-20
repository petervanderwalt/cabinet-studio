import assert from 'node:assert/strict';
import { defaultCabinet, computePanels } from '../js/cabinet-math.js';
import { panelSolidData, panelVoids } from '../js/panel-solid.js';
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-6, `${a} != ${b}`);
const bounds = p => [p.posX,p.posY,p.posZ].map((c,i) => [c-[p.sizeX,p.sizeY,p.sizeZ][i]/2,c+[p.sizeX,p.sizeY,p.sizeZ][i]/2]);
const overlap = (a,b) => a.map((r,i) => [Math.max(r[0],b[i][0]), Math.min(r[1],b[i][1])]);
const volume = box => box.reduce((v,r) => v*Math.max(0,r[1]-r[0]),1);
for (const construction of ['frameless','face-frame']) for (const category of ['base','wall']) for (const hasTop of [true,false]) for (const thickness of [18,19.05,6.35]) for (const backThickness of [6,6.35,12.7]) {
 const c = defaultCabinet();
 Object.assign(c,{construction,category,hasTop,backMount:'grooved-in'});
 c.materials.caseThickness = thickness;
 c.materials.backThickness = backThickness;
 const panels = computePanels(c), back = panels.find(p=>p.id==='back');
 const bb = bounds(back), tk = category==='base' ? c.toeKick.height : 0;
 const engagement = Math.min(8,thickness/2);
 near(bb[0][0],thickness-engagement);
 near(bb[1][0],tk+thickness-engagement);
 near(bb[1][1],c.height-thickness+engagement);
 for (const p of panels.filter(p=>p.grooves.length)) {
   const pb = bounds(p), intersection = overlap(pb,bb);
   const removed = panelVoids(p).map(v=>v.map((r,i)=>r.map(n=>n+pb[i][0])));
   near(volume(intersection), removed.reduce((sum,v)=>sum+volume(overlap(v,intersection)),0));
   const solid = panelSolidData(p);
   const removedVolume = removed.reduce((sum,v)=>sum+volume(v),0);
   near(solid.volume, volume(pb)-removedVolume);
   assert.ok(solid.positions.every(Number.isFinite));
   assert.equal(solid.uvs.length,solid.positions.length/3*2);
 }
 for (const shelf of panels.filter(p=>p.type==='shelf')) near(bounds(shelf)[2][1],bb[2][0]-2);
 const legacyDepth = c.overlay.type==='inset' ? c.depth : c.depth-c.materials.doorThickness;
 c.front.mode='drawers'; c.drawers.count=3;
 const bankHeight = c.height - (construction === 'frameless' ? tk + 3 : tk) - 3;
 const each = (bankHeight-2*c.reveal)/3;
 c.drawers.heights = [each,each,each];
 const drawers = computePanels(c);
 const boxes = drawers.filter(p=>p.type==='drawer-box');
 assert.equal(boxes.length,12);
 for (const box of boxes) near(bounds(box)[2][1],bb[2][0]-20);
 const side = drawers.find(p=>p.id==='drawer-1-side-left');
 const wall = drawers.find(p=>p.id==='side-left');
 const refs = wall.holes.filter(h=>h.purpose==='drawer-runner-reference').slice(0,3);
 const slide = side.holes.filter(h=>h.purpose==='drawer-slide-reference');
 assert.deepEqual(refs.map(h=>h.x),slide.map(h=>h.x));
 c.front.mode='doors'; c.backMount='applied-rear';
 for (const shelf of computePanels(c).filter(p=>p.type==='shelf')) near(bounds(shelf)[2][1],legacyDepth);
}
console.log('PASS: 72 grooved-back configurations; four-edge engagement, real solid cutouts, shelf/drawer clearances, runner alignment and applied-back regression');
