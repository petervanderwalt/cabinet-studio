// Presentation positions only; machining and exports retain the assembled panels.
export function explodedPanels(panels) {
  if (!panels.length) return [];
  const centre = list => ['X', 'Y', 'Z'].map(axis => (
    Math.min(...list.map(p => p[`pos${axis}`] - p[`size${axis}`] / 2))
    + Math.max(...list.map(p => p[`pos${axis}`] + p[`size${axis}`] / 2))
  ) / 2);
  const origin = centre(panels);
  const drawers = new Map();
  for (const p of panels) {
    const key = p.id.match(/^(.*?drawer-\d+)(?:-|$)/)?.[1];
    if (key) { if (!drawers.has(key)) drawers.set(key, []); drawers.get(key).push(p); }
  }
  return panels.map(p => {
    const drawer = drawers.get(p.id.match(/^(.*?drawer-\d+)(?:-|$)/)?.[1]);
    const local = drawer ? centre(drawer) : origin;
    const result = { ...p };
    for (const [i, axis] of ['X', 'Y', 'Z'].entries()) {
      const spread = drawer ? (local[i] - origin[i]) * 0.45 + (p[`pos${axis}`] - local[i]) * 0.65 : (p[`pos${axis}`] - origin[i]) * 0.7;
      result[`pos${axis}`] += spread - (drawer && axis === 'Z' ? 350 : 0);
    }
    return result;
  });
}
