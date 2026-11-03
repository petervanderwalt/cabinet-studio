import { addDetailCutters } from './detail-cutters.js?v=20261103c';
import { makeBox, makeCylinder, makeCompound } from '../lib/cad/replicad.js?v=20261103c';
import { panelVoids } from './panel-solid.js';
import { panelBores } from './panel-bores.js?v=20261103c';

export function buildCadPanel(p) {
  const size = [p.sizeX,p.sizeY,p.sizeZ];
  if (!size.every(n=>Number.isFinite(n) && n>0)) throw new Error(`Invalid panel dimensions: ${p.name}`);
  let solid = makeBox(size.map(n=>-n/2),size.map(n=>n/2));
  const tools = [];
  try {
    for (const v of panelVoids(p)) {
      tools.push(makeBox(v.map((r,i)=>r[0]-size[i]/2),v.map((r,i)=>r[1]-size[i]/2)));
    }
    for (const b of panelBores(p)) {
      // Start just outside the face; preserve the exact specified blind depth.
      tools.push(makeCylinder(b.radius,b.depth+0.001,b.start.map((n,i)=>n-b.direction[i]*0.001),b.direction));
    }
    addDetailCutters(p,tools);
    if (tools.length) {
      // Unite overlapping cutters first; overlapping compounds are not valid boolean tools.
      const bounds=tools.map(tool=>tool.boundingBox.bounds);
      const parent=tools.map((_,i)=>i);
      const root=i=>parent[i]===i ? i : (parent[i]=root(parent[i]));
      for (let i=0;i<bounds.length;i++) for (let j=0;j<i;j++) {
        if ([0,1,2].every(a=>bounds[i][0][a]<=bounds[j][1][a]+1e-7 && bounds[j][0][a]<=bounds[i][1][a]+1e-7)) parent[root(i)]=root(j);
      }
      const groups=new Map();
      for (let i=0;i<parent.length;i++) {
        const key=root(i);
        if (!groups.has(key)) groups.set(key,[]);
        groups.get(key).push(tools[i]);
      }
      const merged=[];
      for (const group of groups.values()) {
        let union=group[0];
        for (const tool of group.slice(1)) { union=union.fuse(tool);tools.push(union); }
        merged.push(union);
      }
      const compound=merged.length===1 ? merged[0] : makeCompound(merged);
      try {
        const cut = solid.cut(compound);
        solid.delete(); solid = cut;
      } finally { compound.delete(); }
    }
    return solid;
  } catch (error) { solid.delete(); throw error; }
  finally { for (const tool of tools) tool.delete(); }
}

// STEP/CAD uses Z-up; the interactive viewer uses Y-up. Keep this a rotation.
export function placeStepPart(solid, panel) {
  return solid.clone().translate([panel.posX,panel.posY,panel.posZ]).rotate(90,[0,0,0],[1,0,0]);
}
