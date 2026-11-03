// Convert machining coordinates to local assembled axes. Reference marks are not cuts.
export function panelBores(p) {
  const bores = [];
  const side = ['side-left', 'side-right'].includes(p.id);
  const drawerSide = p.type === 'drawer-box' && p.id.includes('-side-');
  const right = p.id.endsWith('side-right');
  const flat = !side && !drawerSide && p.sizeY === p.cutThickness && p.sizeZ === p.cutHeight;
  for (const h of p.holes || []) {
    if (h.purpose?.includes('reference')) continue;
    const depth = h.depth ?? (h.purpose === 'handle' ? p.cutThickness : null);
    if (!(depth > 0 && h.diameter > 0)) continue;
    let start, direction;
    if (side || drawerSide) {
      let sign = right ? -1 : 1;
      if (h.face === 'outside') sign *= -1;
      start = [sign*p.sizeX/2, h.y-p.sizeY/2, (side && right ? p.cutWidth-h.x : h.x)-p.sizeZ/2];
      direction = [-sign,0,0];
    } else if (flat) {
      const sign = h.face === 'top' ? 1 : -1;
      start = [h.x-p.sizeX/2,sign*p.sizeY/2,h.y-p.sizeZ/2];
      direction = [0,-sign,0];
    } else {
      const sign = h.face === 'back' || h.purpose === 'hinge-cup' ? 1 : -1;
      start = [h.x-p.sizeX/2,h.y-p.sizeY/2,sign*p.sizeZ/2];
      direction = [0,0,-sign];
    }
    bores.push({ start, direction, depth, radius:h.diameter/2, purpose:h.purpose, source:h });
  }
  for (const h of p.edgeBores || []) {
    if (!(h.depth > 0 && h.diameter > 0)) continue;
    let start, direction;
    if (side && h.edge === 'y-max') {
      start = [(right ? -1 : 1)*(p.sizeX/2-h.offset),p.sizeY/2,(right ? p.cutWidth-h.x : h.x)-p.sizeZ/2];
      direction = [0,-1,0];
    } else if (flat && ['x-min','x-max'].includes(h.edge)) {
      const sign = h.edge === 'x-min' ? -1 : 1;
      start = [sign*p.sizeX/2,(p.id === 'bottom' ? 1 : -1)*(p.sizeY/2-h.offset),h.y-p.sizeZ/2];
      direction = [-sign,0,0];
    } else continue;
    bores.push({ start, direction, depth:h.depth, radius:h.diameter/2, purpose:h.purpose, source:h });
  }
  return bores;
}
