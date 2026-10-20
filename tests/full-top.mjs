import assert from 'node:assert/strict';
import {defaultCabinet,computePanels} from '../js/cabinet-math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const category of ['base','wall']) for(const hasTop of [false,true]) for(const construction of ['frameless','face-frame']) for(const backMount of ['grooved-in','applied-rear']) for(const t of [18,19.05]) {
 const c=defaultCabinet();Object.assign(c,{category,hasTop,construction,backMount});c.materials.caseThickness=t;
 const panels=computePanels(c),cap=category==='base'&&hasTop;
 const sides=panels.filter(p=>p.id==='side-left'||p.id==='side-right');
 for(const side of sides) {
  near(side.cutHeight,c.height-(cap?t:0));near(side.sizeY,side.cutHeight);
  near(side.posY-side.sizeY/2,0);
  for(const groove of side.grooves) assert.ok(groove.y+groove.height<=side.cutHeight+1e-8);
 }
 const top=panels.find(p=>p.id==='top');
 if(hasTop) {
  near(top.cutWidth,cap?c.width:c.width-2*t);near(top.sizeX,top.cutWidth);
  near(top.posY+top.sizeY/2,c.height);
  if(cap) {
   near(top.posX-top.sizeX/2,0);near(top.posX+top.sizeX/2,c.width);
   near(top.posY-top.sizeY/2,sides[0].posY+sides[0].sizeY/2);
  }
 }else {
  assert.equal(top,undefined);
  for(const p of panels.filter(p=>p.id.startsWith('stretcher-'))) near(p.cutWidth,c.width-2*t);
 }
}
console.log('PASS: 64 full-top/stretcher configurations; cap contact, fixed overall height, bounded rebates and wall regression');
