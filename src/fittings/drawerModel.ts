// Turns a chosen catalogue drawer system (runner or box) into the sizes the cabinet generator needs.
import { evalFormula } from './formula';
import { getFamily, getVariant, type FittingChoice } from './registry';
import type { DimSpec } from './types';

export interface DrawerFitting {
  /** 'wood-runner': wooden drawer on runners. 'metal-box': metal sides with a wooden base and back. */
  kind: 'wood-runner' | 'metal-box';
  label: string;
  nominalLength: number;
  /** Depth the drawer needs from the cabinet front (NL + offset). */
  spaceDepth: number | null;
  spaceHeight: number | null;
  sideHeight: number | null;
  /** Wood runner: gap between cabinet side and drawer outside, per side, for a given wooden side thickness. */
  clearancePerSide?: (sideThickness: number) => number;
  /** Wood runner: length of the wooden drawer sides. */
  boxLength?: number;
  base?: { width: number; length: number; thickness: number };
  back?: { width: number; height: number; thickness: number };
  warnings: string[];
}

interface Context {
  /** Internal cabinet width between the sides (Blum "LW"). */
  LW: number;
  /** Internal depth available from the front of the carcass. */
  availableDepth: number;
}

function firstDim(dims: Record<string, DimSpec>, keys: string[]): DimSpec | undefined {
  for (const key of keys) if (dims[key]) return dims[key];
  return undefined;
}

const DEFAULT_SPACE_DEPTH_OFFSET: Record<string, number> = { legrabox: 3 };

export function resolveDrawerFitting(choice: FittingChoice | null | undefined, ctx: Context): DrawerFitting | null {
  if (!choice) return null;
  const family = getFamily(choice.familyId);
  const variant = getVariant(choice.familyId, choice.variantId);
  const nl = Number(choice.selection.nominalLength);
  if (!family || !variant || !Number.isFinite(nl)) return null;
  const vars = { LW: ctx.LW, NL: nl, KB: ctx.LW };
  const dims = variant.dims;
  const num = (keys: string[]) => {
    const spec = firstDim(dims, keys);
    return spec ? evalFormula(spec.value, vars) : null;
  };

  const depthSpec = firstDim(dims, ['spaceDepth', 'spaceRequirementDepth']);
  const spaceDepth = depthSpec ? evalFormula(depthSpec.value, vars) : DEFAULT_SPACE_DEPTH_OFFSET[family.id] !== undefined ? nl + DEFAULT_SPACE_DEPTH_OFFSET[family.id] : null;
  const spaceHeight = num(['spaceHeight', 'spaceRequirementHeight', 'spaceRequirementDrawer', 'spaceHeightOverview']);
  const sideHeight = num(['drawerSideHeight']);
  const label = `${family.name} ${variant.name} NL ${nl}`;
  const warnings: string[] = [];
  if (spaceDepth !== null && spaceDepth > ctx.availableDepth + 0.01) {
    warnings.push(`${label} needs ${spaceDepth.toFixed(0)}mm of internal depth but the cabinet has ${ctx.availableDepth.toFixed(0)}mm; pick a shorter nominal length`);
  }

  const widthSpec = dims.drawerInternalWidth;
  if (widthSpec) {
    // Wooden drawer on runners: SKW (inside width of the wooden box) = LW - k.
    const innerWidth = evalFormula(widthSpec.value, vars);
    const boxLength = num(['drawerLength']);
    if (innerWidth === null || boxLength === null) return null;
    const k = ctx.LW - innerWidth;
    return {
      kind: 'wood-runner',
      label,
      nominalLength: nl,
      spaceDepth,
      spaceHeight,
      sideHeight,
      clearancePerSide: (sideThickness) => (k - 2 * sideThickness) / 2,
      boxLength,
      warnings,
    };
  }

  const baseWidth = num(['baseWidth', 'cuttingBaseWidth']);
  const baseLength = num(['baseLengthChipboardBack', 'baseChipboardBack', 'cuttingBaseLengthDrawer', 'baseLength']);
  const backWidth = num(['chipboardBackWidth', 'cuttingBackWidth']);
  const backHeight = num(['chipboardBackHeight', 'cuttingBackHeight']);
  if (baseWidth === null || baseLength === null) return null;
  const baseThickness = num(['baseRebatePanelThickness']) ?? 16;
  return {
    kind: 'metal-box',
    label,
    nominalLength: nl,
    spaceDepth,
    spaceHeight,
    sideHeight,
    base: { width: baseWidth, length: baseLength, thickness: baseThickness },
    back: backWidth !== null && backHeight !== null ? { width: backWidth, height: backHeight, thickness: 16 } : undefined,
    warnings,
  };
}
