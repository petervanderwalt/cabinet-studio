// Hettich Connecting Technology 2016, pp. 8, 10–11: 13957 + DU 232 T (9047861).
// The 34 mm edge passage ends at the cam centre; its intersection with the pocket is intentional.
export function addCamJoinery(panels, config) {
  if (config.hardware?.joineryType !== 'rastex-18') return [];
  const error = message => [`Rastex joinery omitted: ${message}`];
  const T = config.materials.caseThickness;
  if (Math.abs(T - 18) > 1e-6) return error('this cam set requires 18mm carcass stock; select the matching thickness-specific fitting.');
  const end = config.hardware.connectorEndOffset, spacing = config.hardware.connectorMaxSpacing;
  if (![end, spacing].every(Number.isFinite) || end < 10 || spacing < 20) return error('end offset must be at least 10mm and maximum spacing at least 20mm.');
  const sides = panels.filter(p => ['side-left', 'side-right'].includes(p.id));
  if (sides.length !== 2) return error('both carcass sides are required.');
  const cap = config.category !== 'wall' && config.hasTop;
  const pending = [];
  for (const p of panels.filter(p => ['bottom', 'top', 'stretcher-front', 'stretcher-back'].includes(p.id))) {
    const span = p.cutHeight - 2 * end;
    const intervals = Math.ceil(span / spacing);
    if (span < 20 || intervals > 1000 || intervals < 1 || span / intervals < 20 || p.cutWidth < 85) return error(`${p.name} is too small for this pattern.`);
    for (const side of sides) for (let i = 0; i <= intervals; i++) {
      const right = side.id === 'side-right';
      const y = end + span * i / intervals;
      const sideX = p.posZ - p.sizeZ / 2 + y - (side.posZ - side.sizeZ / 2);
      const x = right ? side.cutWidth - sideX : sideX;
      const joint = `${p.id}:${side.id}:cam-${i + 1}`;
      const common = { joint, hardware: 'Hettich 13957 + 9047861' };
      if (cap && p.id === 'top') {
        pending.push({ p: side, kind: 'holes', b: { ...common, x, y: side.cutHeight - 34, diameter: 15, depth: 13.4, face: 'inside', purpose: 'cam-housing', mate: p.id } });
        pending.push({ p: side, kind: 'edgeBores', b: { ...common, x, y: side.cutHeight, diameter: 8, depth: 34, offset: 9, edge: 'y-max', purpose: 'cam-passage', mate: p.id } });
        pending.push({ p, kind: 'holes', b: { ...common, x: right ? p.cutWidth - 9 : 9, y, diameter: 5, depth: 11.5, face: 'underside', purpose: 'cam-bolt-pilot', mate: side.id } });
      } else {
        pending.push({ p, kind: 'holes', b: { ...common, x: right ? p.cutWidth - 34 : 34, y, diameter: 15, depth: 13.4, face: p.id === 'bottom' ? 'top' : 'underside', purpose: 'cam-housing', mate: side.id } });
        pending.push({ p, kind: 'edgeBores', b: { ...common, x: right ? p.cutWidth : 0, y, diameter: 8, depth: 34, offset: 9, edge: right ? 'x-max' : 'x-min', purpose: 'cam-passage', mate: side.id } });
        pending.push({ p: side, kind: 'holes', b: { ...common, x, y: p.posY, diameter: 5, depth: 11.5, face: 'inside', purpose: 'cam-bolt-pilot', mate: p.id } });
      }
    }
  }
  for (let i = 0; i < pending.length; i++) {
    const { p, b, kind } = pending[i];
    const r = b.diameter / 2 + 1;
    if (kind === 'holes' && (b.x < r || b.y < r || b.x > p.cutWidth - r || b.y > p.cutHeight - r)) return error(`bore outside ${p.name}.`);
    const minX = b.x - (b.edge === 'x-max' ? b.depth : 0) - r;
    const maxX = b.x + (b.edge === 'x-min' ? b.depth : 0) + r;
    const minY = b.y - (b.edge === 'y-max' ? b.depth : 0) - r;
    const maxY = b.y + r;
    if ([...(p.grooves || []), ...(p.notches || [])].some(g => minX < g.x + g.width && maxX > g.x && minY < g.y + g.height && maxY > g.y)) return error(`operation conflicts with a rebate/notch in ${p.name}.`);
    const existing = (p.holes || []).concat(pending.slice(0, i).filter(a => a.p === p && a.b.joint !== b.joint).map(a => a.b));
    if (existing.some(h => h.x + h.diameter / 2 > minX && h.x - h.diameter / 2 < maxX && h.y + h.diameter / 2 > minY && h.y - h.diameter / 2 < maxY)) return error(`operation conflicts with drilling in ${p.name}.`);
  }
  for (const { p, kind, b } of pending) (p[kind] ||= []).push(b);
  return [];
}
