// Decorative routing centrelines in door-local millimetres (front face).
export const DOOR_DETAIL_STYLES = ['none', 'rectangle', 'clipped', 'rounded', 'inward-rounded', 'arch', 'cathedral'];

export function doorDetailPath(width, height, options = {}) {
  const style = options.detailStyle || 'none';
  if (!DOOR_DETAIL_STYLES.includes(style) || style === 'none') return [];
  const inset = Number(options.detailInset ?? 60);
  const requested = Number(options.detailSize ?? 40);
  if (!Number.isFinite(inset) || inset <= 0 || !Number.isFinite(requested) || requested <= 0) return [];
  const w = width - 2 * inset, h = height - 2 * inset;
  if (w <= 0 || h <= 0) return [];
  const r = Math.min(requested, w / 2, h / 2);
  const points = [];
  const add = (x, y) => points.push({ x: x + inset, y: y + inset });
  const curve = (cx, cy, radius, start, end) => {
    // <= 0.02 mm chord error for smooth routing, without doubled outlines.
    const steps = Math.max(4, Math.ceil(Math.abs(end-start) / (2 * Math.acos(Math.max(-1, 1 - 0.02 / radius)))));
    for (let i = 0; i <= steps; i++) {
      const a = start + (end-start) * i / steps;
      add(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    }
  };
  if (style === 'rectangle') {
    add(0,0); add(w,0); add(w,h); add(0,h);
  } else if (style === 'clipped') {
    [[r,0],[w-r,0],[w,r],[w,h-r],[w-r,h],[r,h],[0,h-r],[0,r]].forEach(([x,y])=>add(x,y));
  } else if (style === 'inward-rounded') {
    curve(0,0,r,Math.PI/2,0);
    curve(w,0,r,Math.PI,Math.PI/2);
    curve(w,h,r,-Math.PI/2,-Math.PI);
    curve(0,h,r,0,-Math.PI/2);
  } else if (style === 'rounded') {
    curve(r,r,r,Math.PI,1.5*Math.PI);
    curve(w-r,r,r,1.5*Math.PI,2*Math.PI);
    curve(w-r,h-r,r,0,Math.PI/2);
    curve(r,h-r,r,Math.PI/2,Math.PI);
  } else {
    add(0,0); add(w,0); add(w,h-r);
    // Arch or a soft central cathedral crest, joined to straight stiles.
    const steps = Math.max(64, Math.ceil(w / 2));
    for (let i=1;i<=steps;i++) {
      const t=i/steps;
      const rise = style === 'arch' ? Math.sin(Math.PI*t) : Math.pow(Math.sin(Math.PI*t), 3);
      add(w*(1-t),h-r+r*rise);
    }
  }
  return points;
}

// Exact centre-to-centre spacing, centred across the available inset area.
export function doorSlatPaths(width, height, options = {}) {
  const inset = Number(options.detailInset ?? 0);
  const spacing = Number(options.detailSpacing ?? 50);
  const available = width - 2 * inset;
  if (![width, height, inset, spacing].every(Number.isFinite) || inset < 0 || spacing < 1 || available <= 0 || height <= 2 * inset) return [];
  const count = Math.floor((available + 1e-8) / spacing) + 1;
  const start = (width - (count - 1) * spacing) / 2;
  return Array.from({ length: count }, (_, i) => [
    { x: start + i * spacing, y: inset },
    { x: start + i * spacing, y: height - inset },
  ]);
}
