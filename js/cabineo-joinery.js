// Lamello Cabineo instructions 986320, 2024-02-26, p.2: surface mounting, drilling option 1.
// Three overlapping Ø15 bores at 3.6 / 14.8 / 26 mm from the joining edge, 11 mm deep.
export function addCabineoJoinery(panels, config) {
  const hw = config.hardware || {};
  if (!['cabineo-8', 'cabineo-12'].includes(hw.joineryType)) return [];
  const screwDepth = hw.joineryType === 'cabineo-8' ? 8 : 12;
  const name = `Cabineo ${screwDepth}`;
  const fail = reason => [`${name} omitted: ${reason}`];
  const T = config.materials.caseThickness;
  if (!Number.isFinite(T) || T < Math.max(12, screwDepth + 1)) return fail(`stock must be at least ${Math.max(12, screwDepth + 1)}mm thick for this corner-joint preset.`);
  const end = hw.connectorEndOffset, spacing = hw.connectorMaxSpacing;
  if (!Number.isFinite(end) || end < 20 || !Number.isFinite(spacing) || spacing < 17 || spacing > 300) return fail('end offset must be at least 20mm; maximum spacing must be 17–300mm.');
  const sides = panels.filter(p => ['side-left', 'side-right'].includes(p.id));
  if (sides.length !== 2) return fail('both carcass sides are required.');
  const cap = config.category !== 'wall' && config.hasTop;
  const pending = [];
  const put = (p, b) => pending.push({ p, b: { ...b, hardware: `Lamello ${name}` } });
  for (const p of panels.filter(p => ['bottom', 'top', 'stretcher-front', 'stretcher-back'].includes(p.id))) {
    const span = p.cutHeight - 2 * end;
    const intervals = Math.ceil(span / spacing);
    if (span < 17 || intervals < 1 || intervals > 1000 || span/intervals < 17 || p.cutWidth < 70) return fail(`${p.name} is too small for the pattern.`);
    for (const side of sides) for (let i = 0; i <= intervals; i++) {
      const right = side.id === 'side-right';
      const y = end + span*i/intervals;
      const sideX = p.posZ - p.sizeZ/2 + y - (side.posZ - side.sizeZ/2);
      const x = right ? side.cutWidth - sideX : sideX;
      const joint = `${p.id}:${side.id}:${hw.joineryType}-${i+1}`;
      if (cap && p.id === 'top') {
        for (const offset of [3.6,14.8,26]) put(side, { x, y: side.cutHeight-offset, diameter:15, depth:11, face:'inside', purpose:'cabineo-housing', joint, mate:p.id, openEdge:'y-max' });
        put(p, { x: right ? p.cutWidth-(T-5) : T-5, y, diameter:5, depth:screwDepth, face:'underside', purpose:'cabineo-pilot', joint, mate:side.id });
      } else {
        for (const offset of [3.6,14.8,26]) put(p, { x:right ? p.cutWidth-offset : offset, y, diameter:15, depth:11, face:p.id === 'bottom' ? 'top' : 'underside', purpose:'cabineo-housing', joint, mate:side.id, openEdge:right ? 'x-max' : 'x-min' });
        const axisY = p.posY + (p.id === 'bottom' ? 1 : -1) * (T/2-5);
        put(side, { x, y:axisY, diameter:5, depth:screwDepth, face:'inside', purpose:'cabineo-pilot', joint, mate:p.id });
      }
    }
  }
  for (let i = 0; i < pending.length; i++) {
    const {p,b} = pending[i];
    const r = b.diameter/2;
    // The housing's first bore intentionally opens 3.9 mm through the joining edge.
    if ((!b.openEdge && (b.x < r+1 || b.y < r+1 || b.x > p.cutWidth-r-1 || b.y > p.cutHeight-r-1)) ||
      (b.openEdge?.startsWith('x') && (b.y < r+1 || b.y > p.cutHeight-r-1)) ||
      (b.openEdge === 'x-min' && b.x > p.cutWidth-r-1) ||
      (b.openEdge === 'x-max' && b.x < r+1) ||
      (b.openEdge === 'y-max' && (b.x < r+1 || b.x > p.cutWidth-r-1 || b.y < r+1))) return fail(`bore outside ${p.name}.`);
    const clashes = h => h.x+h.diameter/2 > b.x-r && h.x-h.diameter/2 < b.x+r && h.y+h.diameter/2 > b.y-r && h.y-h.diameter/2 < b.y+r;
    if (p.holes.some(clashes) || pending.slice(0,i).some(a => a.p === p && a.b.joint !== b.joint && clashes(a.b))) return fail(`operation conflicts with drilling in ${p.name}.`);
    if ([...p.grooves,...p.notches].some(g => b.x+r > g.x && b.x-r < g.x+g.width && b.y+r > g.y && b.y-r < g.y+g.height)) return fail(`operation conflicts with a rebate/notch in ${p.name}.`);
  }
  for (const {p,b} of pending) {
    p.holes.push(b);
    if (b.openEdge) p.machiningMargin = 3.9;
  }
  return [];
}
