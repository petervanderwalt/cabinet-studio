export function rearInset(config) {
  if (config.backMount === 'grooved-in') return config.materials.backThickness;
  if (['rear-strip', 'rear-strips'].includes(config.backMount)) return config.materials.caseThickness;
  return 0;
}

// Front bounds and usable drawer space, in assembled millimetres.
export function frontLayout(c) {
  const t = c.materials.caseThickness, td = c.materials.doorThickness;
  const framed = c.construction !== 'frameless';
  const toe = c.category !== 'wall' ? c.toeKick?.height || 0 : 0;
  const gap = c.reveal ?? 3;
  const side = framed ? c.materials.faceFrameWidth : t;
  const lower = framed ? c.materials.bottomRailWidth ?? side : t;
  const upper = framed ? c.materials.topRailWidth ?? side : t;
  let left = gap / 2, bottom = !framed || toe > 0 ? toe + 3 : 0, top = c.height - 3;
  if (c.overlay.type !== 'full-overlay') {
    const overlay = c.overlay.type === 'inset' ? 0 : Math.max(0, c.overlay.amount ?? t / 2);
    left = side - overlay + gap / 2;
    bottom = toe + lower - overlay + gap;
    top = c.height - upper + overlay - gap;
  }
  return { left, bottom, top, width: c.width - 2 * left, height: top - bottom,
    z: c.overlay.type === 'inset' ? td / 2 : -td / 2,
    boxFront: (framed ? t : 0) + (c.overlay.type === 'inset' ? td : 0),
    boxBottom: toe + Math.max(t, lower) + 3,
    boxTop: c.height - Math.max(t, upper) - 3 };
}

export function drawerBoxBounds(c, y, height) {
  const layout = frontLayout(c);
  const bottom = Math.max(y + 12, layout.boxBottom);
  const top = Math.min(y + height - 24, layout.boxTop);
  return { bottom, height: Math.max(0, top - bottom), center: (top + bottom) / 2 };
}
