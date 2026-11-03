export function setDetailMachining(panel, options) {
  delete panel.detailMachining;
  if (!panel.detailPaths?.length) return;
  const tool = options.detailTool || 'v-bit';
  if (tool === 'annotation') return;
  const depth = options.detailDepth ?? 2;
  const angle = options.detailAngle ?? 90;
  const diameter = options.detailDiameter ?? 6;
  let error;
  if (!['v-bit','straight'].includes(tool)) error = 'Choose a V-bit or straight cutter.';
  else if (!Number.isFinite(depth) || depth <= 0 || depth > panel.cutThickness - 3) error = 'Routing depth must be positive and leave at least 3 mm of front material.';
  else if (tool === 'v-bit' && (!Number.isFinite(angle) || angle < 10 || angle > 170)) error = 'V-bit included angle must be between 10 and 170 degrees.';
  else if (tool === 'straight' && (!Number.isFinite(diameter) || diameter <= 0)) error = 'Straight cutter diameter must be positive.';
  if (error) {
    (panel.hardwareWarnings ||= []).push(`${panel.name}: ${error} Decorative routing is shown as a reference line only.`);
    return;
  }
  panel.detailMachining = { tool, depth, ...(tool === 'v-bit' ? { angle } : { diameter }) };
}
