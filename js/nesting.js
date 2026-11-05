import { dimension, formatLength, stockDimension, unitLabel } from './units.js?v=20261020h';
function clampPositive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function clampNonNegative(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function normalizeOptions(options = {}) {
  return {
    sheetWidth: clampPositive(options.sheetWidth, 1220),
    sheetHeight: clampPositive(options.sheetHeight, 2440),
    gap: clampNonNegative(options.gap ?? options.kerf, 20),
    edgeMargin: clampNonNegative(options.edgeMargin),
    groupByMachining: options.groupByMachining === true,
    allowRotation: options.allowRotation !== false,
  };
}

const PACKING_STRATEGIES = [
  { id: 'max-side', orientationBias: 'auto' },
  { id: 'area', orientationBias: 'auto' },
  { id: 'height', orientationBias: 'tall' },
];

function materialKey(panel) {
  const thickness = Number(panel.cutThickness || 0);
  const label = panel.materialLabel || `${dimension(thickness)} stock`;
  return panel.stockKey || `${label}__${thickness}`;
}

function machiningOperations(panel) {
  const operations = new Set();
  for (const hole of panel.holes || []) {
    operations.add(`Drill Ø${hole.diameter} mm, ${hole.face || 'face'}${hole.depth == null ? '' : ` at ${hole.depth} mm depth`}`);
  }
  for (const hole of panel.edgeBores || []) {
    operations.add(`Edge drill Ø${hole.diameter} mm at ${hole.depth} mm depth`);
  }
  for (const groove of panel.grooves || []) {
    operations.add(`Route ${groove.purpose || 'groove'} ${Math.min(groove.width, groove.height)} mm wide at ${groove.depth} mm depth (${groove.face || 'face'})`);
  }
  const detail = panel.detailMachining;
  if (detail) operations.add(`Decorative route: ${detail.tool === 'v-bit' ? `${detail.angle}° V-bit` : `Ø${detail.diameter} mm straight bit`} at ${detail.depth} mm depth`);
  else if (panel.detailPaths?.length) operations.add('Decorative routing path');
  return [...operations].sort();
}

function createSheet(group, index, options) {
  const margin = options.edgeMargin + group.machiningMargin;
  const width = options.sheetWidth - margin * 2;
  const height = options.sheetHeight - margin * 2;
  return {
    id: `${group.key}-sheet-${index + 1}`,
    index,
    key: group.key,
    title: group.title,
    materialLabel: group.materialLabel,
    material: group.material,
    materialColour: group.materialColour,
    stockUnits: group.stockUnits,
    thickness: group.thickness,
    sheetWidth: options.sheetWidth,
    sheetHeight: options.sheetHeight,
    placements: [],
    edgeMargin: margin,
    freeRects: width > 0 && height > 0 ? [{ x: margin, y: margin, width, height }] : [],
    usedArea: 0,
  };
}

function strategySortValue(part, strategyId) {
  switch (strategyId) {
    case 'area':
      return [part.area, part.sizeRank, part.height, part.width];
    case 'height':
      return [part.height, part.width, part.area, part.sizeRank];
    case 'width':
      return [part.width, part.height, part.area, part.sizeRank];
    case 'strip-tall':
    case 'strip-wide':
      return [Math.abs(part.width - part.height), part.sizeRank, part.area, Math.min(part.width, part.height)];
    case 'max-side':
    default:
      return [part.sizeRank, part.area, part.height, part.width];
  }
}

function compareParts(a, b, strategyId) {
  const left = strategySortValue(a, strategyId);
  const right = strategySortValue(b, strategyId);
  for (let i = 0; i < left.length; i++) {
    if (right[i] !== left[i]) return right[i] - left[i];
  }
  return a.panel.name.localeCompare(b.panel.name);
}

function orientationCandidates(part, options, orientationBias) {
  const choices = [{ width: part.width, height: part.height, rotated: false }];
  if (options.allowRotation && part.width !== part.height) {
    choices.push({ width: part.height, height: part.width, rotated: true });
  }

  const aspectRatio = Math.max(part.width, part.height) / Math.max(1, Math.min(part.width, part.height));

  if (orientationBias === 'tall') {
    choices.sort((a, b) => (b.height - a.height) || (a.width - b.width));
  } else if (orientationBias === 'wide') {
    choices.sort((a, b) => (b.width - a.width) || (a.height - b.height));
  } else if (aspectRatio >= 2) {
    choices.sort((a, b) => (b.height - a.height) || (a.width - b.width));
  }

  return choices;
}

function choosePlacement(sheet, part, options, orientationBias = 'auto') {
  let best = null;
  const partAspectRatio = Math.max(part.width, part.height) / Math.max(1, Math.min(part.width, part.height));
  const preferStripOrientation = (part.familyCount || 0) > 1 && partAspectRatio >= 2;

  for (let i = 0; i < sheet.freeRects.length; i++) {
    const rect = sheet.freeRects[i];
    let orientations = orientationCandidates(part, options, orientationBias);
    if (preferStripOrientation) {
      const tallOrientations = orientations.filter((orientation) => (
        orientation.height >= orientation.width &&
        orientation.width <= rect.width &&
        orientation.height <= rect.height
      ));
      if (tallOrientations.length > 0) {
        orientations = tallOrientations;
      }
    }

    for (const orientation of orientations) {
      if (orientation.width > rect.width || orientation.height > rect.height) continue;

      const shortSideWaste = Math.min(rect.width - orientation.width, rect.height - orientation.height);
      const longSideWaste = Math.max(rect.width - orientation.width, rect.height - orientation.height);
      const wasteArea = (rect.width * rect.height) - (orientation.width * orientation.height);
      const contactScore = (
        (orientation.width === rect.width ? 1 : 0) +
        (orientation.height === rect.height ? 1 : 0)
      );
      const stripOrientationScore = partAspectRatio >= 2 ? (orientation.height - orientation.width) : 0;
      const top = rect.y + orientation.height;
      const left = rect.x;

      if (
        !best ||
        (stripOrientationScore !== best.stripOrientationScore && stripOrientationScore > best.stripOrientationScore) ||
        shortSideWaste < best.shortSideWaste ||
        (shortSideWaste === best.shortSideWaste && stripOrientationScore === best.stripOrientationScore && longSideWaste < best.longSideWaste) ||
        (shortSideWaste === best.shortSideWaste && longSideWaste === best.longSideWaste && stripOrientationScore === best.stripOrientationScore && wasteArea < best.wasteArea) ||
        (shortSideWaste === best.shortSideWaste && longSideWaste === best.longSideWaste && stripOrientationScore === best.stripOrientationScore && wasteArea === best.wasteArea && contactScore > best.contactScore) ||
        (shortSideWaste === best.shortSideWaste && longSideWaste === best.longSideWaste && stripOrientationScore === best.stripOrientationScore && wasteArea === best.wasteArea && contactScore === best.contactScore && top < best.top) ||
        (shortSideWaste === best.shortSideWaste && longSideWaste === best.longSideWaste && stripOrientationScore === best.stripOrientationScore && wasteArea === best.wasteArea && contactScore === best.contactScore && top === best.top && left < best.left)
      ) {
        best = {
          rectIndex: i,
          rect,
          width: orientation.width,
          height: orientation.height,
          rotated: orientation.rotated,
          wasteArea,
          shortSideWaste,
          longSideWaste,
          contactScore,
          stripOrientationScore,
          top,
          left,
        };
      }
    }
  }

  return best;
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function splitFreeRect(rect, placed) {
  if (!intersects(rect, placed)) return [rect];

  const next = [];
  const rectRight = rect.x + rect.width;
  const rectTop = rect.y + rect.height;
  const placedRight = placed.x + placed.width;
  const placedTop = placed.y + placed.height;

  if (placed.x > rect.x) {
    next.push({
      x: rect.x,
      y: rect.y,
      width: placed.x - rect.x,
      height: rect.height,
    });
  }

  if (placedRight < rectRight) {
    next.push({
      x: placedRight,
      y: rect.y,
      width: rectRight - placedRight,
      height: rect.height,
    });
  }

  const overlapLeft = Math.max(rect.x, placed.x);
  const overlapRight = Math.min(rectRight, placedRight);

  if (overlapRight > overlapLeft) {
    if (placed.y > rect.y) {
      next.push({
        x: overlapLeft,
        y: rect.y,
        width: overlapRight - overlapLeft,
        height: placed.y - rect.y,
      });
    }

    if (placedTop < rectTop) {
      next.push({
        x: overlapLeft,
        y: placedTop,
        width: overlapRight - overlapLeft,
        height: rectTop - placedTop,
      });
    }
  }

  return next;
}

function pruneFreeRects(rects) {
  const filtered = rects
    .filter(rect => rect.width > 0.01 && rect.height > 0.01)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));

  return filtered.filter((rect, index) => (
    !filtered.some((other, otherIndex) => (
      otherIndex !== index &&
      rect.x >= other.x &&
      rect.y >= other.y &&
      rect.x + rect.width <= other.x + other.width &&
      rect.y + rect.height <= other.y + other.height
    ))
  ));
}

function placePart(sheet, part, options, orientationBias) {
  const choice = choosePlacement(sheet, part, options, orientationBias);
  if (!choice) return null;

  const gap = Math.max(0, options.gap || 0);
  const placement = {
    panel: part.panel,
    x: choice.rect.x,
    y: choice.rect.y,
    width: choice.width,
    height: choice.height,
    rotated: choice.rotated,
  };

  const occupied = {
    x: Math.max(0, placement.x - gap),
    y: Math.max(0, placement.y - gap),
    width: placement.width + (gap * 2),
    height: placement.height + (gap * 2),
  };
  const maxWidth = sheet.sheetWidth;
  const maxHeight = sheet.sheetHeight;
  if (occupied.x + occupied.width > maxWidth) {
    occupied.width = Math.max(0, maxWidth - occupied.x);
  }
  if (occupied.y + occupied.height > maxHeight) {
    occupied.height = Math.max(0, maxHeight - occupied.y);
  }

  const freeRects = [];
  for (const rect of sheet.freeRects) {
    freeRects.push(...splitFreeRect(rect, occupied));
  }
  sheet.freeRects = pruneFreeRects(freeRects);
  sheet.placements.push(placement);
  sheet.usedArea += part.width * part.height;

  return placement;
}

function buildGroup(key, title, thickness, panels) {
  const materialLabel = panels[0]?.materialLabel || `${dimension(thickness)} stock`;
  const familyCounts = new Map();
  for (const panel of panels) {
    const width = Number(panel.cutWidth);
    const height = Number(panel.cutHeight);
    const familyKey = [Math.min(width, height), Math.max(width, height)].join('x');
    familyCounts.set(familyKey, (familyCounts.get(familyKey) || 0) + 1);
  }

  const parts = panels
    .filter(panel => (panel.cutWidth ?? 0) > 0 && (panel.cutHeight ?? 0) > 0)
    .map(panel => ({
      id: panel.id,
      panel,
      width: Number(panel.cutWidth),
      height: Number(panel.cutHeight),
      area: Number(panel.cutWidth) * Number(panel.cutHeight),
      sizeRank: Math.max(Number(panel.cutWidth), Number(panel.cutHeight)),
      familyCount: familyCounts.get([Math.min(Number(panel.cutWidth), Number(panel.cutHeight)), Math.max(Number(panel.cutWidth), Number(panel.cutHeight))].join('x')) || 1,
    }));

  return {
    key,
    machiningMargin: panels.reduce((margin, panel) => Math.max(margin, Number(panel.machiningMargin) || 0), 0),
    material: panels[0]?.material,
    materialColour: panels[0]?.materialColour,
    stockUnits: panels[0]?.stockUnits,
    title,
    materialLabel,
    thickness,
    parts,
  };
}

function computeSheetFootprint(sheet) {
  if (sheet.placements.length === 0) return 0;
  let maxX = 0;
  let maxY = 0;
  for (const placement of sheet.placements) {
    maxX = Math.max(maxX, placement.x + placement.width);
    maxY = Math.max(maxY, placement.y + placement.height);
  }
  return maxX * maxY;
}

function packGroup(group, options, strategy) {
  const sheets = [];
  const unplaced = [];
  const parts = [...group.parts].sort((a, b) => compareParts(a, b, strategy.id));

  for (const part of parts) {
    let placed = false;

    for (const sheet of sheets) {
      if (placePart(sheet, part, options, strategy.orientationBias)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      const sheet = createSheet(group, sheets.length, options);
      if (placePart(sheet, part, options, strategy.orientationBias)) {
        sheets.push(sheet);
        placed = true;
      }
    }

    if (!placed) {
      unplaced.push({
        panel: part.panel,
        reason: `Part does not fit within the usable area of a ${formatLength(options.sheetWidth)} x ${dimension(options.sheetHeight)} sheet`,
      });
    }
  }

  const totalPartArea = sheets.reduce((sum, sheet) => sum + sheet.usedArea, 0);
  const totalSheetArea = sheets.length * options.sheetWidth * options.sheetHeight;
  const totalFootprintArea = sheets.reduce((sum, sheet) => sum + computeSheetFootprint(sheet), 0);

  return {
    sheets,
    unplaced,
    totalPartArea,
    totalSheetArea,
    totalFootprintArea,
  };
}

function chooseBestPackedGroup(group, options) {
  let best = null;

  for (const strategy of PACKING_STRATEGIES) {
    const candidate = packGroup(group, options, strategy);
    if (
      !best ||
      candidate.unplaced.length < best.unplaced.length ||
      (candidate.unplaced.length === best.unplaced.length && candidate.sheets.length < best.sheets.length) ||
      (candidate.unplaced.length === best.unplaced.length && candidate.sheets.length === best.sheets.length && candidate.totalFootprintArea < best.totalFootprintArea) ||
      (candidate.unplaced.length === best.unplaced.length && candidate.sheets.length === best.sheets.length && candidate.totalFootprintArea === best.totalFootprintArea && candidate.totalPartArea > best.totalPartArea)
    ) {
      best = candidate;
    }
  }

  return best;
}

export function buildNestingPlan(panels, nestingOptions = {}) {
  const options = normalizeOptions(nestingOptions);
  const requestedGap = options.gap;
  // Cabineo's first housing bore runs 3.9 mm past its joining edge.
  const machiningGap = panels.reduce((gap,p) => Math.max(gap, 2 * (Number(p.machiningMargin) || 0)), 0);
  options.gap = Math.max(options.gap, machiningGap);
  const groupsByKey = new Map();

  for (const panel of panels) {
    const operations = options.groupByMachining ? machiningOperations(panel) : [];
    const stock = materialKey(panel);
    const key = options.groupByMachining ? JSON.stringify([stock, operations]) : stock;
    if (!groupsByKey.has(key)) groupsByKey.set(key, { panels: [], operations });
    groupsByKey.get(key).panels.push(panel);
  }

  const groups = [];
  const unplaced = [];

  for (const [key, { panels: groupedPanels, operations }] of groupsByKey) {
    const thickness = Number(groupedPanels[0]?.cutThickness || 0);
    const materialLabel = groupedPanels[0]?.materialLabel || `${dimension(thickness)} stock`;
    const stockTitle = `${materialLabel} · ${stockDimension(groupedPanels[0])}`;
    const setup = options.groupByMachining ? groups.length + 1 : null;
    const group = buildGroup(setup === null ? key : `setup-${setup}`,
      setup === null ? stockTitle : `${stockTitle} · Setup ${setup}`, thickness, groupedPanels);
    const packed = chooseBestPackedGroup(group, options);
    const sheets = packed.sheets;
    const totalPartArea = packed.totalPartArea;
    const totalSheetArea = packed.totalSheetArea;
    unplaced.push(...packed.unplaced);

    groups.push({
      key: group.key,
      operations,
      title: group.title,
      materialLabel: group.materialLabel,
      material: group.material,
      materialColour: group.materialColour,
      stockUnits: group.stockUnits,
      thickness: group.thickness,
      sheets,
      partCount: group.parts.length,
      totalPartArea,
      totalSheetArea,
      utilization: totalSheetArea > 0 ? totalPartArea / totalSheetArea : 0,
    });
  }

  const totalSheets = groups.reduce((sum, group) => sum + group.sheets.length, 0);
  const totalPartArea = groups.reduce((sum, group) => sum + group.totalPartArea, 0);
  const totalSheetArea = groups.reduce((sum, group) => sum + group.totalSheetArea, 0);

  return {
    options,
    machiningGapApplied: options.gap > requestedGap,
    groups,
    unplaced,
    totalSheets,
    totalPartArea,
    totalSheetArea,
    utilization: totalSheetArea > 0 ? totalPartArea / totalSheetArea : 0,
  };
}
