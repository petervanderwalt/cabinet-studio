import { applyGlobalMaterialSelections, defaultCabinet, inferFrontMode, resolveReveals, resolveToeKick } from '../engine';
import type { CabinetConfig, Category } from '../types';

export const CATEGORY_DIMENSIONS: Record<Category, { width: number; height: number; depth: number }> = {
  base: { width: 800, height: 720, depth: 560 },
  wall: { width: 800, height: 720, depth: 320 },
  tall: { width: 600, height: 2100, depth: 600 },
  wardrobe: { width: 1800, height: 2400, depth: 600 },
};

type Dict = Record<string, unknown>;

function deepMerge(target: Dict, source: Dict): Dict {
  const result: Dict = Array.isArray(target) ? ([...target] as unknown as Dict) : { ...target };
  for (const key of Object.keys(source || {})) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge((target[key] as Dict) || {}, value as Dict);
    } else if (Array.isArray(value)) {
      result[key] = [...value];
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function openingHeight(config: CabinetConfig): number {
  const reveals = resolveReveals(config);
  return config.height - resolveToeKick(config).height - reveals.top - reveals.bottom;
}

export function buildAutoDrawerHeights(config: CabinetConfig, count: number): number[] {
  const openingH = openingHeight(config);
  const reveal = config.reveal ?? 3;
  const gaps = count > 0 ? (count - 1) * reveal : 0;
  const eachH = count > 0 ? Math.floor((openingH - gaps) / count) : 0;
  const heights: number[] = [];
  let remaining = openingH - gaps;
  for (let i = 0; i < count; i++) {
    const h = i < count - 1 ? eachH : remaining;
    heights.push(h);
    remaining -= h;
  }
  return heights;
}

/** Fill any missing fields with defaults and keep derived fields (materials, drawer heights) consistent. */
export function normalizeConfig(data?: Partial<CabinetConfig> | null): CabinetConfig {
  const defaults = defaultCabinet();
  const merged = deepMerge(defaults as unknown as Dict, (data || {}) as Dict) as unknown as CabinetConfig;
  merged.front = { ...(merged.front || {}), mode: inferFrontMode(merged) };
  merged.doors = { ...defaults.doors, ...(merged.doors || {}) };
  merged.drawers = { ...defaults.drawers, ...(merged.drawers || {}) };
  merged.shelves = { ...defaults.shelves, ...(merged.shelves || {}) };
  merged.hardware = { ...defaults.hardware, ...(merged.hardware || {}) };
  merged.materials = { ...defaults.materials, ...(merged.materials || {}) };
  merged.nesting = { ...defaults.nesting, ...(merged.nesting || {}) };
  merged.overlay = { ...defaults.overlay, ...(merged.overlay || {}) };
  merged.toeKick = { ...defaults.toeKick, ...(merged.toeKick || {}) };
  merged.drawers.heights = Array.isArray(merged.drawers.heights) ? [...merged.drawers.heights] : [];
  merged.materials = applyGlobalMaterialSelections(merged.materials);

  if (merged.front.mode === 'drawers' && merged.drawers.count > 0 && merged.drawers.heights.length !== merged.drawers.count) {
    merged.drawers.heights = buildAutoDrawerHeights(merged, merged.drawers.count);
  }

  return merged;
}

/** When the cabinet still has one of the stock category sizes, swap it for the new category's stock size. */
export function applyCategoryDimensions(config: CabinetConfig, nextCategory: Category): CabinetConfig {
  const nextPreset = CATEGORY_DIMENSIONS[nextCategory];
  const matched = Object.values(CATEGORY_DIMENSIONS).find(
    (preset) => config.width === preset.width && config.height === preset.height && config.depth === preset.depth,
  );
  if (!matched) return config;
  return { ...config, ...nextPreset };
}
