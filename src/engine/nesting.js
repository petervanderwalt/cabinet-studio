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
    sheetWidth: clampPositive(options.sheetWidth, 2440),
    sheetHeight: clampPositive(options.sheetHeight, 1220),
    gap: clampNonNegative(options.gap ?? options.kerf, 20),
    allowRotation: options.allowRotation !== false,
  };
}

// ---------------------------------------------------------------------------------------------
// Packing: MaxRects with several placement rules and part orders, searched until the time budget
// runs out. The best layout uses the fewest sheets, then packs as much as possible onto the earlier
// sheets (leaving the last sheet as a large reusable offcut), then occupies the smallest footprint.
// ---------------------------------------------------------------------------------------------

const HEURISTICS = ['bssf', 'baf', 'blsf', 'bl', 'cp'];
const ORDERS = ['area', 'max-side', 'height', 'width', 'perimeter'];
const TIME_BUDGET_MS = 140;
const MAX_RANDOM_ITERATIONS = 400;
const CACHE_LIMIT = 40;
const packCache = new Map();

function materialKey(panel) {
  const thickness = Number(panel.cutThickness || 0);
  const label = panel.materialLabel || `${thickness}mm stock`;
  return `${label}__${thickness}`;
}

function createSheet(group, index, options) {
  return {
    id: `${group.key}-sheet-${index + 1}`,
    index,
    key: group.key,
    title: group.title,
    materialLabel: group.materialLabel,
    thickness: group.thickness,
    sheetWidth: options.sheetWidth,
    sheetHeight: options.sheetHeight,
    placements: [],
    freeRects: [{ x: 0, y: 0, width: options.sheetWidth, height: options.sheetHeight }],
    usedArea: 0,
  };
}

function sortValue(part, orderId) {
  switch (orderId) {
    case 'area':
      return [part.area, part.sizeRank, part.height, part.width];
    case 'height':
      return [part.height, part.width, part.area, part.sizeRank];
    case 'width':
      return [part.width, part.height, part.area, part.sizeRank];
    case 'perimeter':
      return [part.width + part.height, part.area, part.sizeRank, part.height];
    case 'max-side':
    default:
      return [part.sizeRank, part.area, part.height, part.width];
  }
}

function compareParts(a, b, orderId) {
  const left = sortValue(a, orderId);
  const right = sortValue(b, orderId);
  for (let i = 0; i < left.length; i++) {
    if (right[i] !== left[i]) return right[i] - left[i];
  }
  return a.panel.name.localeCompare(b.panel.name);
}

/** Order parts by a base rule with random noise on its primary key (noise 0 = the plain rule). */
function noisyOrder(parts, orderId, rand, noise) {
  if (noise === 0) return [...parts].sort((a, b) => compareParts(a, b, orderId));
  const keyed = parts.map((part) => ({ part, key: sortValue(part, orderId)[0] * (1 + (rand() - 0.5) * 2 * noise) }));
  keyed.sort((a, b) => (b.key - a.key) || a.part.panel.name.localeCompare(b.part.panel.name));
  return keyed.map((entry) => entry.part);
}

function orientations(part, options) {
  const list = [{ width: part.width, height: part.height, rotated: false }];
  if (options.allowRotation && part.width !== part.height) {
    list.push({ width: part.height, height: part.width, rotated: true });
  }
  return list;
}

function overlapLength(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

/** Length of edge a candidate shares with the sheet border or its neighbours (a gap apart). */
function contactScore(sheet, x, y, w, h, gap) {
  let score = 0;
  if (x <= 0.01) score += h;
  if (y <= 0.01) score += w;
  if (x + w >= sheet.sheetWidth - 0.01) score += h;
  if (y + h >= sheet.sheetHeight - 0.01) score += w;
  for (const p of sheet.placements) {
    if (Math.abs(p.x + p.width + gap - x) < 0.5 || Math.abs(x + w + gap - p.x) < 0.5) {
      score += overlapLength(y, y + h, p.y, p.y + p.height);
    }
    if (Math.abs(p.y + p.height + gap - y) < 0.5 || Math.abs(y + h + gap - p.y) < 0.5) {
      score += overlapLength(x, x + w, p.x, p.x + p.width);
    }
  }
  return score;
}

function scoreFit(heuristic, sheet, rect, orientation, gap) {
  const leftoverW = rect.width - orientation.width;
  const leftoverH = rect.height - orientation.height;
  const short = Math.min(leftoverW, leftoverH);
  const long = Math.max(leftoverW, leftoverH);
  switch (heuristic) {
    case 'blsf':
      return [long, short, rect.y, rect.x];
    case 'baf':
      return [rect.width * rect.height - orientation.width * orientation.height, short, rect.y, rect.x];
    case 'bl':
      return [rect.y + orientation.height, rect.x, short, long];
    case 'cp':
      return [-contactScore(sheet, rect.x, rect.y, orientation.width, orientation.height, gap), short, rect.y, rect.x];
    case 'bssf':
    default:
      return [short, long, rect.y, rect.x];
  }
}

function lowerScore(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}

function choosePlacement(sheet, part, options, heuristic) {
  const gap = Math.max(0, options.gap || 0);
  let best = null;
  for (let i = 0; i < sheet.freeRects.length; i++) {
    const rect = sheet.freeRects[i];
    for (const orientation of orientations(part, options)) {
      if (orientation.width > rect.width + 0.001 || orientation.height > rect.height + 0.001) continue;
      const score = scoreFit(heuristic, sheet, rect, orientation, gap);
      if (!best || lowerScore(score, best.score)) {
        best = { rect, width: orientation.width, height: orientation.height, rotated: orientation.rotated, score };
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
    next.push({ x: rect.x, y: rect.y, width: placed.x - rect.x, height: rect.height });
  }
  if (placedRight < rectRight) {
    next.push({ x: placedRight, y: rect.y, width: rectRight - placedRight, height: rect.height });
  }

  const overlapLeft = Math.max(rect.x, placed.x);
  const overlapRight = Math.min(rectRight, placedRight);
  if (overlapRight > overlapLeft) {
    if (placed.y > rect.y) {
      next.push({ x: overlapLeft, y: rect.y, width: overlapRight - overlapLeft, height: placed.y - rect.y });
    }
    if (placedTop < rectTop) {
      next.push({ x: overlapLeft, y: placedTop, width: overlapRight - overlapLeft, height: rectTop - placedTop });
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

function placePart(sheet, part, options, heuristic) {
  const choice = choosePlacement(sheet, part, options, heuristic);
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

  // Reserve the part plus the machining gap around it so neighbours keep their distance.
  const occupied = {
    x: Math.max(0, placement.x - gap),
    y: Math.max(0, placement.y - gap),
    width: placement.width + (gap * 2),
    height: placement.height + (gap * 2),
  };
  if (occupied.x + occupied.width > sheet.sheetWidth) occupied.width = Math.max(0, sheet.sheetWidth - occupied.x);
  if (occupied.y + occupied.height > sheet.sheetHeight) occupied.height = Math.max(0, sheet.sheetHeight - occupied.y);

  const freeRects = [];
  for (const rect of sheet.freeRects) {
    freeRects.push(...splitFreeRect(rect, occupied));
  }
  sheet.freeRects = pruneFreeRects(freeRects);
  sheet.placements.push(placement);
  sheet.usedArea += part.width * part.height;

  return placement;
}

function buildGroup(title, thickness, panels) {
  const materialLabel = panels[0]?.materialLabel || `${thickness}mm stock`;
  const parts = panels
    .filter(panel => (panel.cutWidth ?? 0) > 0 && (panel.cutHeight ?? 0) > 0)
    .map(panel => ({
      id: panel.id,
      panel,
      width: Number(panel.cutWidth),
      height: Number(panel.cutHeight),
      area: Number(panel.cutWidth) * Number(panel.cutHeight),
      sizeRank: Math.max(Number(panel.cutWidth), Number(panel.cutHeight)),
    }));

  return {
    key: `${materialLabel}__${thickness}`,
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

/** First-fit over the sheets in order, so earlier sheets fill up before a new one is opened. */
function packOrdered(group, options, orderedParts, heuristic) {
  const sheets = [];
  const unplaced = [];

  for (const part of orderedParts) {
    let placed = false;
    for (const sheet of sheets) {
      if (placePart(sheet, part, options, heuristic)) {
        placed = true;
        break;
      }
    }
    if (!placed) {
      const sheet = createSheet(group, sheets.length, options);
      if (placePart(sheet, part, options, heuristic)) {
        sheets.push(sheet);
        placed = true;
      }
    }
    if (!placed) {
      unplaced.push({
        panel: part.panel,
        reason: `Part does not fit on a ${options.sheetWidth} x ${options.sheetHeight}mm sheet`,
      });
    }
  }

  const totalPartArea = sheets.reduce((sum, sheet) => sum + sheet.usedArea, 0);
  const totalSheetArea = sheets.length * options.sheetWidth * options.sheetHeight;
  const totalFootprintArea = sheets.reduce((sum, sheet) => sum + computeSheetFootprint(sheet), 0);
  // Higher means parts are concentrated on fewer sheets, leaving a larger offcut on the last one.
  const concentration = sheets.reduce((sum, sheet) => sum + sheet.usedArea * sheet.usedArea, 0);

  return { sheets, unplaced, totalPartArea, totalSheetArea, totalFootprintArea, concentration };
}

function isBetter(candidate, best) {
  if (!best) return true;
  if (candidate.unplaced.length !== best.unplaced.length) return candidate.unplaced.length < best.unplaced.length;
  if (candidate.sheets.length !== best.sheets.length) return candidate.sheets.length < best.sheets.length;
  if (Math.abs(candidate.concentration - best.concentration) > 1) return candidate.concentration > best.concentration;
  return candidate.totalFootprintArea < best.totalFootprintArea - 1;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let n = Math.imul(t ^ (t >>> 15), t | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function groupSignature(group, options) {
  const parts = group.parts.map((part) => `${part.id}:${part.width}x${part.height}`).join('|');
  return `${options.sheetWidth}x${options.sheetHeight}/${options.gap}/${options.allowRotation}/${group.key}/${parts}`;
}

function chooseBestPackedGroup(group, options) {
  const signature = groupSignature(group, options);
  const cached = packCache.get(signature);
  if (cached) return cached;

  let best = null;
  const consider = (candidate) => {
    if (isBetter(candidate, best)) best = candidate;
  };

  // Pass 1: every plain order with every placement rule.
  for (const orderId of ORDERS) {
    const ordered = noisyOrder(group.parts, orderId, () => 0, 0);
    for (const heuristic of HEURISTICS) {
      consider(packOrdered(group, options, ordered, heuristic));
    }
  }

  // Pass 2: random restarts with perturbed orders, until the budget is spent. Not needed for tiny jobs.
  const partCount = group.parts.length;
  const areaBound = Math.ceil(group.parts.reduce((sum, part) => sum + part.area, 0) / (options.sheetWidth * options.sheetHeight));
  const canImprove = partCount > 3 && (best.sheets.length > 1 || best.sheets.length > areaBound);
  if (canImprove) {
    const rand = seededRandom(hashString(signature));
    const deadline = Date.now() + TIME_BUDGET_MS;
    for (let i = 0; i < MAX_RANDOM_ITERATIONS && Date.now() < deadline; i++) {
      const orderId = ORDERS[Math.floor(rand() * ORDERS.length)];
      const heuristic = HEURISTICS[Math.floor(rand() * HEURISTICS.length)];
      const noise = 0.1 + rand() * 0.5;
      consider(packOrdered(group, options, noisyOrder(group.parts, orderId, rand, noise), heuristic));
    }
  }

  if (packCache.size >= CACHE_LIMIT) packCache.delete(packCache.keys().next().value);
  packCache.set(signature, best);
  return best;
}

export function buildNestingPlan(panels, nestingOptions = {}) {
  const options = normalizeOptions(nestingOptions);
  const groupsByKey = new Map();

  for (const panel of panels) {
    const key = materialKey(panel);
    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, []);
    }
    groupsByKey.get(key).push(panel);
  }

  const groups = [];
  const unplaced = [];

  for (const [key, groupedPanels] of groupsByKey.entries()) {
    const thickness = Number(groupedPanels[0]?.cutThickness || 0);
    const materialLabel = groupedPanels[0]?.materialLabel || `${thickness}mm stock`;
    const group = buildGroup(`${materialLabel} · ${thickness}mm`, thickness, groupedPanels);
    const packed = chooseBestPackedGroup(group, options);
    const sheets = packed.sheets;
    const totalPartArea = packed.totalPartArea;
    const totalSheetArea = packed.totalSheetArea;
    unplaced.push(...packed.unplaced);

    groups.push({
      key,
      title: group.title,
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
    groups,
    unplaced,
    totalSheets,
    totalPartArea,
    totalSheetArea,
    utilization: totalSheetArea > 0 ? totalPartArea / totalSheetArea : 0,
  };
}
