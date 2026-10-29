// Through dados for the carcass bottom. Clearance is above the mating panel.
export function addDados(panels, config) {
  const hw = config.hardware || {};
  if (hw.joineryType !== 'dado') return [];
  const depth = hw.dadoDepth, clearance = hw.dadoClearance, T = config.materials.caseThickness;
  const fail = reason => [`Dados omitted: ${reason}`];
  if (!Number.isFinite(depth) || depth <= 0 || depth > T / 2 || T - depth < 3) return fail('engagement must be positive, no more than half the carcass thickness, and leave at least 3mm of stock.');
  if (!Number.isFinite(clearance) || clearance < 0 || clearance > 1) return fail('fit clearance must be between 0 and 1mm.');
  const sides = panels.filter(p => ['side-left', 'side-right'].includes(p.id));
  const mates = panels.filter(p => p.id === 'bottom');
  if (sides.length !== 2 || !mates.some(p => p.id === 'bottom')) return fail('both sides and the bottom are required.');
  const slots = mates.map(p => ({ p, y: p.posY - p.sizeY / 2, height: p.cutThickness + clearance })).sort((a,b) => a.y-b.y);
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (i && slot.y < slots[i-1].y + slots[i-1].height + 2) return fail('mating panels are too close together.');
    for (const side of sides) {
      if (slot.y < 0 || slot.y + slot.height > side.cutHeight) return fail(`${slot.p.name} dado falls outside a side panel.`);
      if (side.holes.some(h => h.y + h.diameter/2 > slot.y && h.y - h.diameter/2 < slot.y + slot.height)) return fail(`${slot.p.name} dado conflicts with side drilling.`);
      if (side.notches.some(n => n.y < slot.y + slot.height && n.y + n.height > slot.y)) return fail(`${slot.p.name} dado conflicts with the toe-kick notch.`);
    }
  }
  for (const { p, y, height } of slots) {
    const originalWidth = p.cutWidth;
    p.cutWidth += 2 * depth;
    p.sizeX += 2 * depth;
    p.joinery = { type: 'dado', engagement: depth, originalWidth, extensionPerSide: depth, fixed: true };
    // Keep the existing rear rebate continuous across the newly extended bottom.
    for (const g of p.grooves) {
      if (g.x === 0 && g.width === originalWidth) g.width = p.cutWidth;
      else g.x += depth;
    }
    for (const side of sides) side.grooves.push({ x: 0, y, width: side.cutWidth, height, depth, face: 'inside', purpose: 'dado', mate: p.id });
  }
  return [];
}
