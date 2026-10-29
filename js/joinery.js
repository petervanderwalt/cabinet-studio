// Face coordinates match panel DXFs. Edge bores use the same outline coordinates
// plus an offset through the stock thickness; they are never face-drill circles.
export function addDowelJoinery(panels, config) {
  const hw = config.hardware || {};
  if (hw.joineryType !== 'dowel') return [];
  const diameter = hw.dowelDiameter, faceDepth = hw.dowelFaceDepth, edgeDepth = hw.dowelEdgeDepth;
  const end = hw.dowelEndOffset, spacing = hw.dowelMaxSpacing, length = hw.dowelLength;
  const T = config.materials.caseThickness;
  const error = message => [`Dowel joinery omitted: ${message}`];
  if (![diameter, faceDepth, edgeDepth, end, spacing, length, T].every(n => Number.isFinite(n) && n > 0)) return error('dimensions must be positive finite numbers.');
  if (diameter + 4 > T || faceDepth > T - 2) return error('leave 2mm walls around edge bores and behind face bores.');
  if (faceDepth + edgeDepth < length + 1) return error('combined bore depths must exceed dowel length by at least 1mm.');
  if (end < diameter / 2 + 2 || spacing < diameter + 2) return error('offset or spacing leaves insufficient material.');

  const pending = [];
  const sides = panels.filter(p => p.id === 'side-left' || p.id === 'side-right');
  if (sides.length !== 2) return error('both carcass sides are required.');
  const cap = config.category !== 'wall' && config.hasTop;
  const horizontals = panels.filter(p => ['bottom', 'top', 'stretcher-front', 'stretcher-back'].includes(p.id));
  for (const p of horizontals) {
    const span = p.cutHeight - end * 2;
    if (span < diameter + 2 || edgeDepth * 2 + 2 > p.cutWidth) return error(`${p.name} is too small for this pattern.`);
    const intervals = Math.ceil(span / spacing);
    if (intervals > 1000) return error('pattern exceeds 1000 intervals per joint.');
    if (span / intervals < diameter + 2) return error(`${p.name} bore spacing leaves insufficient material.`);
    for (const side of sides) {
      const right = side.id === 'side-right';
      for (let i = 0; i <= intervals; i++) {
        const y = end + span * i / intervals;
        const z = p.posZ - p.sizeZ / 2 + y;
        const sideX = z - (side.posZ - side.sizeZ / 2);
        const joint = `${p.id}:${side.id}:${i + 1}`;
        const common = { diameter, purpose: 'alignment-dowel', joint };
        if (cap && p.id === 'top') {
          pending.push({ panel: p, kind: 'holes', bore: { ...common, x: right ? p.cutWidth - T / 2 : T / 2, y, depth: faceDepth, face: 'underside', mate: side.id } });
          pending.push({ panel: side, kind: 'edgeBores', bore: { ...common, x: right ? side.cutWidth - sideX : sideX, y: side.cutHeight, edge: 'y-max', offset: T / 2, depth: edgeDepth, mate: p.id } });
        } else {
          pending.push({ panel: side, kind: 'holes', bore: { ...common, x: right ? side.cutWidth - sideX : sideX, y: p.posY, depth: faceDepth, face: 'inside', mate: p.id } });
          pending.push({ panel: p, kind: 'edgeBores', bore: { ...common, x: right ? p.cutWidth : 0, y, edge: right ? 'x-max' : 'x-min', offset: T / 2, depth: edgeDepth, mate: side.id } });
        }
      }
    }
  }

  for (let i = 0; i < pending.length; i++) {
    const { panel: p, kind, bore: b } = pending[i];
    const radius = diameter / 2 + 1;
    if (kind === 'holes' && (b.x < radius || b.x > p.cutWidth - radius || b.y < radius || b.y > p.cutHeight - radius)) return error(`bore outside ${p.name}.`);
    // Test the full projected edge-bore path as well as face-bore footprints.
    const minX = b.x - (b.edge === 'x-max' ? edgeDepth : 0) - radius;
    const maxX = b.x + (b.edge === 'x-min' ? edgeDepth : 0) + radius;
    const minY = b.y - (b.edge === 'y-max' ? edgeDepth : 0) - radius;
    const maxY = b.y + (b.edge === 'y-min' ? edgeDepth : 0) + radius;
    const overlapsRect = r => minX < r.x + r.width && maxX > r.x && minY < r.y + r.height && maxY > r.y;
    if ([...(p.grooves || []), ...(p.notches || [])].some(overlapsRect)) return error(`bore conflicts with a rebate/notch in ${p.name}.`);
    const existing = (p.holes || []).concat(pending.slice(0, i).filter(a => a.panel === p && a.kind === 'holes').map(a => a.bore));
    if (existing.some(h => h.x + h.diameter / 2 > minX && h.x - h.diameter / 2 < maxX && h.y + h.diameter / 2 > minY && h.y - h.diameter / 2 < maxY)) return error(`bore conflicts with drilling in ${p.name}.`);
  }
  for (const { panel, kind, bore } of pending) (panel[kind] ||= []).push(bore);
  return [];
}
