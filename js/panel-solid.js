// Axis-aligned panel solids with real rebates and toe-kick notches.
// Coordinates use the assembled panel axes, with the mesh centred at zero.
export function panelVoids(panel) {
  const p = panel;
  const right = p.id === 'side-right';
  const side = right || p.id === 'side-left';
  const voids = [];
  if (side) {
    for (const n of p.notches || []) {
      const z = right ? p.cutWidth - n.x - n.width : n.x;
      voids.push([[0, p.sizeX], [n.y, n.y + n.height], [z, z + n.width]]);
    }
  }
  for (const g of p.grooves || []) {
    if (!(g.depth > 0)) continue;
    if (side) {
      const z = right ? p.cutWidth - g.x - g.width : g.x;
      voids.push([right ? [0, g.depth] : [p.sizeX - g.depth, p.sizeX],
        [g.y, g.y + g.height], [z, z + g.width]]);
    } else {
      const bottom = p.id === 'bottom';
      voids.push([[g.x, g.x + g.width],
        bottom ? [p.sizeY - g.depth, p.sizeY] : [0, g.depth],
        [g.y, g.y + g.height]]);
    }
  }
  return voids;
}

export function panelSolidData(p, renderClearance = 0) {
  const size = [p.sizeX, p.sizeY, p.sizeZ];
  const voids = panelVoids(p).map(v => v.map(([lo, hi]) => [lo - renderClearance, hi + renderClearance]));
  const axes = size.map((length, axis) => [...new Set([0, length,
    ...voids.flatMap(v => v[axis].map(n => Math.max(0, Math.min(length, n))))])].sort((a, b) => a - b));
  const counts = axes.map(a => a.length - 1);
  const occupied = new Set();
  const key = (x, y, z) => `${x},${y},${z}`;
  let volume = 0;
  for (let x = 0; x < counts[0]; x++) for (let y = 0; y < counts[1]; y++) for (let z = 0; z < counts[2]; z++) {
    const index = [x, y, z];
    const mid = axes.map((a, i) => (a[index[i]] + a[index[i] + 1]) / 2);
    if (voids.some(v => v.every((range, i) => mid[i] > range[0] && mid[i] < range[1]))) continue;
    occupied.add(key(x, y, z));
    volume += axes.reduce((v, a, i) => v * (a[index[i] + 1] - a[index[i]]), 1);
  }
  const faces = [
    { offset: [-1,0,0], corners: [0,1,3,2], uvAxes: [2,1] },
    { offset: [1,0,0], corners: [4,6,7,5], uvAxes: [2,1] },
    { offset: [0,-1,0], corners: [0,4,5,1], uvAxes: [0,2] },
    { offset: [0,1,0], corners: [2,3,7,6], uvAxes: [0,2] },
    { offset: [0,0,-1], corners: [0,2,6,4], uvAxes: [0,1] },
    { offset: [0,0,1], corners: [1,5,7,3], uvAxes: [0,1] },
  ];
  const positions = [], uvs = [];
  for (const cell of occupied) {
    const index = cell.split(',').map(Number);
    const corners = Array.from({length: 8}, (_, c) => axes.map((a, i) => a[index[i] + ((c >> (2 - i)) & 1)]));
    for (const face of faces) {
      if (occupied.has(key(...index.map((n, i) => n + face.offset[i])))) continue;
      for (const corner of [0,1,2,0,2,3]) {
        const point = corners[face.corners[corner]];
        positions.push(...point.map((n, i) => n - size[i] / 2));
        uvs.push(...face.uvAxes.map(i => point[i] / size[i]));
      }
    }
  }
  return { positions, uvs, volume };
}
