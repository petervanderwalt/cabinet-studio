import Clipper from '../lib/cad/clipper.js?v=20261103c';

// Flat-bottom cutter footprints. Coordinates are quantised to 0.0001 mm;
// rounded joins/end caps have at most 0.005 mm chord error.
export function routingOutline(path,radius,closed) {
  const scale=10000;
  const offset=new Clipper.ClipperOffset(2,0.005*scale);
  offset.AddPath(path.map(p=>({X:Math.round(p[0]*scale),Y:Math.round(p[1]*scale)})),Clipper.JoinType.jtRound,
    closed ? Clipper.EndType.etClosedLine : Clipper.EndType.etOpenRound);
  const tree=new Clipper.PolyTree();
  offset.Execute(tree,radius*scale);
  const pointList=node=>node.Contour().map(p=>[p.X/scale,p.Y/scale]);
  const outlines=[];
  const visit=node=>{
    for (const child of node.Childs()) {
      if (!child.IsHole()) outlines.push({outer:pointList(child),holes:child.Childs().filter(n=>n.IsHole()).map(pointList)});
      visit(child);
    }
  };
  visit(tree);
  return outlines;
}
