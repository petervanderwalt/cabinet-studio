import { routingOutline } from './routing-outline.js?v=20261103c';
import { makePolygon, addHolesInFace, basicFaceExtrusion, Vector, genericSweep, assembleWire, makeLine, makeBSplineApproximation, makeThreePointArc, revolution, makeCylinder } from '../lib/cad/replicad.js?v=20261103c';

// Sweep the cutter profile along the same centrelines used in the DXF.
export function addDetailCutters(panel, tools) {
  const cut = panel.detailMachining;
  if (!cut) return;
  const vbit = cut.tool === 'v-bit';
  const extra = 0.001;
  const top = -panel.sizeZ/2-extra;
  const bottom = -panel.sizeZ/2+cut.depth;
  const radius = vbit ? (cut.depth+extra)*Math.tan(cut.angle*Math.PI/360) : cut.diameter/2;
  for (const path of panel.detailPaths || []) {
    if (!vbit) {
      const footprint=routingOutline(path.map(p=>[p.x-panel.cutWidth/2,p.y-panel.cutHeight/2]),radius,panel.detailPathsClosed !== false);
      for (const region of footprint) {
        const face=makePolygon(region.outer.map(p=>[...p,top]));
        const holes=region.holes.map(points=>{
          const hole=makePolygon(points.map(p=>[...p,top]));
          try { return hole.outerWire(); } finally { hole.delete(); }
        });
        const withHoles=holes.length ? addHolesInFace(face,holes) : face;
        const vector=new Vector([0,0,cut.depth+extra]);
        try { tools.push(basicFaceExtrusion(withHoles,vector)); }
        finally {
          if (withHoles!==face) withHoles.delete();
          face.delete();vector.delete();for (const hole of holes) hole.delete();
        }
      }
      continue;
    }
    const points = path.map(p=>[p.x-panel.cutWidth/2,p.y-panel.cutHeight/2,bottom]);
    if (points.length < 2) continue;
    if (points.length > 10000) throw new Error('Routing path exceeds 10000 points.');
    const edges=[];
    let wire,face,profile;
    try {
      const closed = panel.detailPathsClosed !== false;
      const clean=points.filter((p,i)=>!i || Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>1e-7);
      const n=clean.length;
      const breaks=[];
      for (let i=0;i<n;i++) {
        if (!closed && (i===0 || i===n-1)) { breaks.push(i);continue; }
        const a=clean[(i+n-1)%n],b=clean[i],c=clean[(i+1)%n];
        const ux=b[0]-a[0],uy=b[1]-a[1],vx=c[0]-b[0],vy=c[1]-b[1];
        const turn=Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/(Math.hypot(ux,uy)*Math.hypot(vx,vy)))));
        if (turn>0.15 || Math.max(Math.hypot(ux,uy),Math.hypot(vx,vy))>3*Math.min(Math.hypot(ux,uy),Math.hypot(vx,vy))) breaks.push(i);
      }
      if (closed && breaks.length<2) {
        if (!breaks.length) breaks.push(0);
        breaks.push((breaks[0]+Math.floor(n/2))%n);breaks.sort((a,b)=>a-b);
      }
      const runs=closed ? breaks.length : breaks.length-1;
      for (let i=0;i<runs;i++) {
        const first=breaks[i],last=breaks[(i+1)%breaks.length];
        const run=[];
        for (let j=first;;j=(j+1)%n) { run.push(clean[j]);if (j===last) break; }
        if (run.length===2) { edges.push(makeLine(run[0],run[1]));continue; }
        const a=run[0],b=run[Math.floor(run.length/2)],c=run.at(-1);
        const determinant=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
        let circular=false;
        if (Math.abs(determinant)>1e-7) {
          const squared=p=>p[0]**2+p[1]**2;
          const cx=(squared(a)*(b[1]-c[1])+squared(b)*(c[1]-a[1])+squared(c)*(a[1]-b[1]))/determinant;
          const cy=(squared(a)*(c[0]-b[0])+squared(b)*(a[0]-c[0])+squared(c)*(b[0]-a[0]))/determinant;
          const radius=Math.hypot(a[0]-cx,a[1]-cy);
          circular=run.every(p=>Math.abs(Math.hypot(p[0]-cx,p[1]-cy)-radius)<1e-5);
        }
        edges.push(circular ? makeThreePointArc(a,b,c) : makeBSplineApproximation(run,{tolerance:0.01,degMax:5}));
      }
      if (!edges.length) continue;
      wire=assembleWire(edges);
      const a=points[0],b=points.find(p=>Math.hypot(p[0]-a[0],p[1]-a[1])>1e-7);
      const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*radius,ny=dx/length*radius;
      const section = vbit
        ? [[a[0]-nx,a[1]-ny,top],[a[0]+nx,a[1]+ny,top],a]
        : [[a[0]-nx,a[1]-ny,top],[a[0]+nx,a[1]+ny,top],[a[0]+nx,a[1]+ny,bottom],[a[0]-nx,a[1]-ny,bottom]];
      face=makePolygon(section);profile=face.outerWire();
      tools.push(genericSweep(profile,wire,{transitionMode:'round'}));
      if (!closed) for (const [x,y] of [points[0],points.at(-1)]) {
        if (vbit) {
          const cap=makePolygon([[x,y,bottom],[x+radius,y,top],[x,y,top]]);
          try { tools.push(revolution(cap,[x,y,bottom],[0,0,1],360)); }
          finally { cap.delete(); }
        } else tools.push(makeCylinder(radius,cut.depth+extra,[x,y,top],[0,0,1]));
      }
    } finally {
      profile?.delete();face?.delete();wire?.delete();
      for (const edge of edges) edge.delete();
    }
  }
}
