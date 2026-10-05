import { inferFrontMode } from './cabinet-math.js';

import JSZip from 'jszip';

function pair(lines, code, value) {
  lines.push(`${code}\n${value}`);
}

function writeLayer(lines, name, color, ltype = 'CONTINUOUS') {
  pair(lines, 0, 'LAYER');
  pair(lines, 2, name);
  pair(lines, 70, 0);
  pair(lines, 62, color);
  pair(lines, 6, ltype);
}

function createDxfDocument(entitiesWriter) {
  const lines = [];

  pair(lines, 0, 'SECTION');
  pair(lines, 2, 'HEADER');
  pair(lines, 9, '$ACADVER');
  pair(lines, 1, 'AC1009');
  pair(lines, 9, '$INSUNITS');
  pair(lines, 70, 4);
  pair(lines, 0, 'ENDSEC');

  pair(lines, 0, 'SECTION');
  pair(lines, 2, 'TABLES');
  pair(lines, 0, 'TABLE');
  pair(lines, 2, 'LAYER');
  pair(lines, 70, 8);
  writeLayer(lines, '0', 7);
  writeLayer(lines, 'CUTLINE', 1);
  writeLayer(lines, 'DRILL', 3);
  writeLayer(lines, 'GROOVE', 5);
  writeLayer(lines, 'LABEL', 7);
  writeLayer(lines, 'SHEET', 8);
  writeLayer(lines, 'GAP', 2, 'DASHED');
  writeLayer(lines, 'OFFCUT', 9, 'DASHED');
  pair(lines, 0, 'ENDTAB');
  pair(lines, 0, 'ENDSEC');

  pair(lines, 0, 'SECTION');
  pair(lines, 2, 'ENTITIES');
  entitiesWriter({
    polyline: (points, layer = 'CUTLINE', closed = true) => writePolyline(lines, points, layer, closed),
    circle: (x, y, radius, layer = 'DRILL') => writeCircle(lines, x, y, radius, layer),
    text: (x, y, height, value, layer = 'LABEL', rotation = 0) => writeText(lines, x, y, height, value, layer, rotation),
    rect: (x, y, width, height, layer = 'CUTLINE') => writeRect(lines, x, y, width, height, layer),
  });
  pair(lines, 0, 'ENDSEC');
  pair(lines, 0, 'EOF');

  return lines.join('\n');
}

function writePolyline(lines, points, layer, closed = true) {
  pair(lines, 0, 'POLYLINE');
  pair(lines, 8, layer);
  pair(lines, 66, 1);
  pair(lines, 70, closed ? 1 : 0);
  pair(lines, 10, 0.0);
  pair(lines, 20, 0.0);
  pair(lines, 30, 0.0);

  for (const point of points) {
    pair(lines, 0, 'VERTEX');
    pair(lines, 8, layer);
    pair(lines, 10, point.x);
    pair(lines, 20, point.y);
    pair(lines, 30, 0.0);
  }

  pair(lines, 0, 'SEQEND');
  pair(lines, 8, layer);
}

function writeCircle(lines, x, y, radius, layer) {
  pair(lines, 0, 'CIRCLE');
  pair(lines, 8, layer);
  pair(lines, 10, x);
  pair(lines, 20, y);
  pair(lines, 30, 0.0);
  pair(lines, 40, radius);
}

function writeText(lines, x, y, height, value, layer, rotation = 0) {
  pair(lines, 0, 'TEXT');
  pair(lines, 8, layer);
  pair(lines, 10, x);
  pair(lines, 20, y);
  pair(lines, 30, 0.0);
  pair(lines, 40, height);
  pair(lines, 1, value);
  pair(lines, 50, rotation);
  pair(lines, 41, 0.8);
  pair(lines, 7, 'LABEL_STYLE');
}

function writeRect(lines, x, y, width, height, layer) {
  writePolyline(lines, [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ], layer, true);
}

function safeName(value) {
  return String(value || 'export').replace(/[^a-zA-Z0-9_\- ]/g, '_');
}

function traceOutlineWithNotches(width, height, notches) {
  const points = [];
  const bottomLeftNotch = notches.find((notch) => notch.x === 0 && notch.y === 0);
  const bottomRightNotch = notches.find((notch) => notch.x + notch.width === width && notch.y === 0);

  if (bottomLeftNotch) {
    points.push({ x: 0, y: bottomLeftNotch.height });
    points.push({ x: 0, y: height });
    points.push({ x: width, y: height });
    points.push({ x: width, y: 0 });
    points.push({ x: bottomLeftNotch.width, y: 0 });
    points.push({ x: bottomLeftNotch.width, y: bottomLeftNotch.height });
  } else if (bottomRightNotch) {
    const startX = width - bottomRightNotch.width;
    points.push({ x: startX, y: 0 });
    points.push({ x: startX, y: bottomRightNotch.height });
    points.push({ x: width, y: bottomRightNotch.height });
    points.push({ x: width, y: height });
    points.push({ x: 0, y: height });
    points.push({ x: 0, y: 0 });
  } else {
    points.push({ x: 0, y: 0 });
    points.push({ x: width, y: 0 });
    points.push({ x: width, y: height });
    points.push({ x: 0, y: height });
  }

  return points;
}

function getPanelOutline(panel) {
  const width = Number(panel.cutWidth || 0);
  const height = Number(panel.cutHeight || 0);
  const notches = panel.notches || [];
  if (notches.length > 0) {
    return traceOutlineWithNotches(width, height, notches);
  }
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

function transformPoint(point, placement) {
  if (!placement.rotated) {
    return {
      x: placement.x + point.x,
      y: placement.y + point.y,
    };
  }

  return {
    x: placement.x + (placement.width - point.y),
    y: placement.y + point.x,
  };
}

function transformRect(rect, placement) {
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  return corners.map((corner) => transformPoint(corner, placement));
}

function transformHole(hole, placement) {
  const point = transformPoint({ x: hole.x, y: hole.y }, placement);
  return {
    ...hole,
    x: point.x,
    y: point.y,
  };
}

function panelLabel(panel) {
  return `${panel.name}  ${Number(panel.cutWidth).toFixed(1)} x ${Number(panel.cutHeight).toFixed(1)} x ${Number(panel.cutThickness).toFixed(1)}`;
}

export function panelToDxf(panel) {
  return createDxfDocument((writer) => {
    writer.polyline(getPanelOutline(panel), 'CUTLINE', true);

    for (const hole of panel.holes || []) {
      writer.circle(hole.x, hole.y, Number(hole.diameter || 0) / 2, 'DRILL');
    }

    for (const groove of panel.grooves || []) {
      writer.rect(groove.x, groove.y, groove.width, groove.height, 'GROOVE');
    }

    writer.text(5, Math.max(5, Number(panel.cutHeight || 0) - 5), 3, panelLabel(panel), 'LABEL', 0);
  });
}

export function sheetToDxf(sheet, options = {}) {
  const gap = Math.max(0, Number(options.gap ?? options.kerf) || 0);
  return createDxfDocument((writer) => {
    writer.rect(0, 0, sheet.sheetWidth, sheet.sheetHeight, 'SHEET');

    for (const rect of sheet.freeRects || []) {
      writer.rect(rect.x, rect.y, rect.width, rect.height, 'OFFCUT');
    }

    for (let index = 0; index < sheet.placements.length; index += 1) {
      const placement = sheet.placements[index];
      const panel = placement.panel;

      if (gap > 0) {
        const gapInset = gap / 2;
        const gapX = Math.max(0, placement.x - gapInset);
        const gapY = Math.max(0, placement.y - gapInset);
        const gapWidth = Math.min(sheet.sheetWidth, placement.x + placement.width + gapInset) - gapX;
        const gapHeight = Math.min(sheet.sheetHeight, placement.y + placement.height + gapInset) - gapY;
        writer.rect(gapX, gapY, gapWidth, gapHeight, 'GAP');
      }

      const outline = getPanelOutline(panel).map((point) => transformPoint(point, placement));
      writer.polyline(outline, 'CUTLINE', true);

      for (const hole of panel.holes || []) {
        const transformed = transformHole(hole, placement);
        writer.circle(transformed.x, transformed.y, Number(hole.diameter || 0) / 2, 'DRILL');
      }

      for (const groove of panel.grooves || []) {
        const transformedCorners = transformRect(groove, placement);
        writer.polyline(transformedCorners, 'GROOVE', true);
      }

      // Keep the label inside the part: size it to the shorter side and the length of the text.
      const labelText = `${index + 1}. ${panel.name}`;
      const along = Math.max(placement.width, placement.height);
      const across = Math.min(placement.width, placement.height);
      const labelHeight = Math.max(3, Math.min(24, across * 0.4, (along - 20) / (labelText.length * 0.62)));
      const vertical = placement.height > placement.width;
      const labelX = placement.x + (vertical ? Math.min(across - 4, labelHeight + 6) : Math.max(6, along * 0.04));
      const labelY = placement.y + (vertical ? Math.max(6, along * 0.04) : Math.max(6, (across - labelHeight) / 2));
      writer.text(labelX, labelY, labelHeight, labelText, 'LABEL', vertical ? 90 : 0);
    }

    writer.text(20, sheet.sheetHeight + 20, 8, `Sheet ${sheet.index + 1} - ${sheet.materialLabel || 'Sheet Stock'} - ${Number(sheet.thickness || 0).toFixed(1)}mm`, 'LABEL', 0);
    writer.text(Math.max(20, sheet.sheetWidth - 160), sheet.sheetHeight + 20, 8, `${Number(sheet.sheetWidth).toFixed(0)} x ${Number(sheet.sheetHeight).toFixed(0)} mm`, 'LABEL', 0);
  });
}

function generateCabinetManifest(config, panels) {
  const lines = [];
  const date = new Date().toISOString().split('T')[0];
  const frontMode = inferFrontMode(config);
  lines.push(`Cabinet Export - ${date}`);
  lines.push('='.repeat(50));
  lines.push('');
  lines.push('CONFIGURATION');
  lines.push(`  Category:         ${config.category}${config.usage ? ` (${config.usage})` : ''}`);
  if (config.category === 'wardrobe' && config.wardrobe) {
    lines.push(`  Wardrobe layout:  ${config.wardrobe.layout}, ${config.wardrobe.fronts} fronts`);
    const describe = (sections) => sections.map((s, i) => `#${i + 1}: ${s.width > 0 ? `${s.width}mm` : 'auto'}, ${s.rails} rail(s), ${s.shelves} shelves, ${s.drawers} drawers`).join('; ');
    lines.push(`  Main sections:    ${describe(config.wardrobe.sections)}`);
    if (config.wardrobe.layout !== 'single' && config.wardrobe.legB.enabled) lines.push(`  Left return:      ${config.wardrobe.legB.length}mm - ${describe(config.wardrobe.legB.sections)}`);
    if (config.wardrobe.layout === 'walk-in' && config.wardrobe.legC.enabled) lines.push(`  Right return:     ${config.wardrobe.legC.length}mm - ${describe(config.wardrobe.legC.sections)}`);
  }
  lines.push(`  Front mode:       ${frontMode}`);
  lines.push(`  Width:            ${config.width} mm`);
  lines.push(`  Height:           ${config.height} mm`);
  lines.push(`  Depth:            ${config.depth} mm`);
  lines.push(`  Construction:     ${config.construction}`);
  lines.push(`  Back mount:       ${config.backMount}`);
  lines.push(`  Has top:          ${config.hasTop}`);
  lines.push(`  Overlay type:     ${config.overlay?.type}`);
  lines.push(`  Overlay amount:   ${config.overlay?.amount} mm`);
  lines.push(`  Reveal/gap:       ${config.reveal} mm`);
  lines.push('');
  lines.push('TOE KICK');
  if (config.toeKick) {
    lines.push(`  Height:           ${config.toeKick.height} mm`);
    lines.push(`  Setback:          ${config.toeKick.setback} mm`);
  } else {
    lines.push('  None');
  }
  lines.push('');
  lines.push('DOORS');
  lines.push(`  Count:            ${config.doors?.count ?? 0}`);
  lines.push(`  Hinge side:       ${config.doors?.hingeSide ?? '-'}`);
  lines.push('');
  lines.push('DRAWERS');
  lines.push(`  Count:            ${config.drawers?.count ?? 0}`);
  if (config.drawers?.count > 0) {
    lines.push(`  Heights (top->):  ${config.drawers.heights?.join(', ') ?? '-'}`);
    lines.push(`  Side thickness:   ${config.drawers.sideThickness ?? '-'} mm`);
    lines.push(`  Bottom thickness: ${config.drawers.bottomThickness ?? '-'} mm`);
    lines.push(`  Side clearance:   ${config.drawers.sideClearance ?? '-'} mm`);
  }
  lines.push('');
  lines.push('SHELVES');
  lines.push(`  Count:            ${config.shelves?.count ?? 0}`);
  if (config.shelves?.count > 0) {
    lines.push(`  Thickness:        ${config.shelves?.thickness ?? '-'} mm`);
  }
  lines.push('');
  lines.push('HANDLES & PUSH-TO-OPEN');
  lines.push(`  Handle type:      ${config.hardware?.handleType ?? 'bar'}`);
  if (config.hardware?.handleType === 'push-open') lines.push(`  Mechanism:        ${config.hardware.pushOpen?.type}`);
  lines.push('');
  if (config.lighting?.enabled || config.electrics?.drawerSwitch?.enabled || config.electrics?.doorSwitch?.enabled) {
    lines.push('LIGHTING & ELECTRICS');
    if (config.lighting?.enabled) {
      const zones = Object.entries(config.lighting.zones).filter(([, on]) => on).map(([name]) => name).join(', ') || 'none';
      lines.push(`  Lighting:         ${config.lighting.type}, ${config.lighting.colourTemp}, ${config.lighting.voltage}V`);
      lines.push(`  Zones:            ${zones}`);
      lines.push(`  Channel:          ${config.lighting.channel.width} x ${config.lighting.channel.depth} mm, ${config.lighting.channel.setback} mm from front`);
      lines.push(`  Driver / control: ${config.lighting.driver} / ${config.lighting.control}`);
    }
    if (config.electrics?.drawerSwitch?.enabled) lines.push(`  Drawer switches:  ${config.electrics.drawerSwitch.type} (${config.electrics.drawerSwitch.drawers})`);
    if (config.electrics?.doorSwitch?.enabled) lines.push(`  Door switches:    ${config.electrics.doorSwitch.type}`);
    lines.push(`  Cable route:      ${config.electrics?.wiring}`);
    lines.push('  Mains wiring must be done by a qualified person.');
    lines.push('');
  }
  if (config.considerations) {
    lines.push('CONSIDERATIONS');
    lines.push(`  Wall fixing:      ${config.considerations.wallFixing}`);
    lines.push(`  Ventilation:      ${config.considerations.ventilation}`);
    if (config.considerations.notes) lines.push(`  Notes:            ${config.considerations.notes}`);
    lines.push('');
  }
  lines.push('MATERIALS');
  lines.push(`  Case thickness:   ${config.materials.caseThickness} mm`);
  lines.push(`  Back thickness:   ${config.materials.backThickness} mm`);
  lines.push(`  Door thickness:   ${config.materials.doorThickness} mm`);
  lines.push(`  Carcass:          ${config.materials.caseMaterial}`);
  lines.push(`  Rear:             ${config.materials.backMaterial}`);
  lines.push(`  Fronts:           ${config.materials.frontMaterial}`);
  for (const [group, label] of Object.entries(config.materials.overrides || {})) lines.push(`  ${group}: ${label}`);
  if (config.materials.edgeBand) lines.push(`  Edge band:        ${config.materials.edgeBand.thickness}mm ${config.materials.edgeBand.colour}`);
  if (config.construction === 'face-frame') {
    lines.push(`  Face frame width: ${config.materials.faceFrameWidth} mm`);
    lines.push(`  Face frame stock: ${config.materials.faceFrameStock ?? '-'} mm`);
  }
  lines.push('');
  lines.push('PANELS');
  lines.push(`  Total:            ${panels.length} parts`);
  lines.push('');
  lines.push('  Name'.padEnd(24) + 'Dimensions (mm)'.padEnd(24) + 'Edge banding');
  lines.push('  ' + '-'.repeat(70));
  for (const panel of panels) {
    const dims = `${panel.cutWidth.toFixed(0)} x ${panel.cutHeight.toFixed(0)} x ${panel.cutThickness.toFixed(0)}`.padEnd(23);
    const edgeBanding = panel.edgeBanding || {};
    const edgeParts = [edgeBanding.top ? 'top' : '', edgeBanding.bottom ? 'bottom' : '', edgeBanding.left ? 'left' : '', edgeBanding.right ? 'right' : ''].filter(Boolean);
    lines.push(`    ${panel.name.padEnd(22)}${dims}${edgeParts.length > 0 ? edgeParts.join('/') : '-'}`);
  }
  lines.push('');
  lines.push('--- End of manifest ---');
  return lines.join('\n');
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function hardwareToCsv(hardware = []) {
  const rows = [['Group', 'Item', 'Part no.', 'Quantity', 'Unit', 'Note'].join(',')];
  for (const item of hardware) rows.push([item.group, item.item, item.partNo || '', item.qty, item.unit, item.note || ''].map(csvCell).join(','));
  return rows.join('\n');
}

function generateProjectManifest(project, panels, nestingPlan, hardware = []) {
  const lines = [];
  const date = new Date().toISOString().split('T')[0];
  lines.push(`Project Export - ${date}`);
  lines.push('='.repeat(50));
  lines.push('');
  lines.push(`Project name: ${project?.name || 'Kitchen Project'}`);
  lines.push(`Cabinets:     ${project?.cabinets?.length || 0}`);
  lines.push(`Parts:        ${panels.length}`);
  lines.push(`Sheets:       ${nestingPlan?.totalSheets || 0}`);
  lines.push(`Utilization:  ${nestingPlan ? `${(nestingPlan.utilization * 100).toFixed(1)}%` : '0.0%'}`);
  lines.push('');
  lines.push('CABINETS');
  for (const cabinet of project?.cabinets || []) {
    lines.push(`  ${cabinet.name}  x${cabinet.qty}`);
    lines.push(`    ${cabinet.config.width} x ${cabinet.config.height} x ${cabinet.config.depth} mm`);
  }
  lines.push('');
  lines.push('MATERIAL GROUPS');
  for (const group of nestingPlan?.groups || []) {
    lines.push(`  ${group.title}: ${group.sheets.length} ${group.sheets.length === 1 ? 'sheet' : 'sheets'}, ${group.partCount} parts`);
  }
  lines.push('');
  if (hardware.length > 0) {
    lines.push('HARDWARE & ACCESSORIES');
    let currentGroup = '';
    for (const item of hardware) {
      if (item.group !== currentGroup) {
        currentGroup = item.group;
        lines.push(`  ${currentGroup}`);
      }
      lines.push(`    ${String(item.qty).padStart(7)} ${item.unit.padEnd(5)} ${item.partNo ? `[${item.partNo}] ` : ''}${item.item}${item.note ? `  (${item.note})` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPanelDxf(panel) {
  const filename = `${safeName(panel.name)}.dxf`;
  triggerDownload(new Blob([panelToDxf(panel)], { type: 'application/dxf' }), filename);
}

export function downloadProjectFile(project) {
  const name = safeName(project?.name || 'kitchen-project');
  triggerDownload(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${name}.json`);
}

export async function downloadManufacturingZip({ panels, config, project, nestingPlan, hardware = [], cabinetHardware = [] }) {
  const zip = new JSZip();

  for (const panel of panels) {
    zip.file(`parts/${safeName(panel.name)}-${safeName(panel.id)}.dxf`, panelToDxf(panel));
  }

  if (nestingPlan?.groups?.length) {
    for (const group of nestingPlan.groups) {
      for (const sheet of group.sheets) {
        const filename = `nested-sheets/${safeName(group.title)}-sheet-${sheet.index + 1}.dxf`;
        zip.file(filename, sheetToDxf(sheet, nestingPlan.options));
      }
    }
  }

  zip.file('manifest.txt', generateCabinetManifest(config, panels));
  zip.file('project-manifest.txt', generateProjectManifest(project, panels, nestingPlan, hardware));
  if (hardware.length > 0) zip.file('hardware.csv', hardwareToCsv(hardware));
  void cabinetHardware;
  zip.file('project.json', JSON.stringify(project, null, 2));
  zip.file('cabinet.json', JSON.stringify(config, null, 2));

  const filename = `${safeName(project?.name || 'kitchen-project')}-manufacturing.zip`;
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, filename);
}
