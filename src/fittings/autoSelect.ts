// Picks sensible default options for a catalogue fitting from the cabinet it is going into.
import type { CabinetConfig, FittingChoiceConfig } from '../types';
import { defaultSelection, type FittingSlot } from './registry';
import type { FittingVariant, Selection } from './types';

/** Internal depth available to a drawer, measured from the front of the carcass. */
export function availableDrawerDepth(cfg: CabinetConfig): number {
  const Td = cfg.materials.doorThickness;
  const Tdf = cfg.materials.drawerFrontThickness ?? Td;
  if (cfg.category === 'wardrobe') {
    const fronts = cfg.wardrobe.fronts;
    const frontZone = fronts === 'hinged' ? Td : fronts === 'sliding' ? 2 * (cfg.materials.slidingDoorThickness ?? Td) + 6 : 0;
    // Wardrobe drawers sit behind doors, so their front is inside the carcass.
    return cfg.depth - frontZone - (fronts === 'open' ? 0 : 2 + Tdf);
  }
  return cfg.overlay.type === 'inset' ? cfg.depth : cfg.depth - Tdf;
}

function parseBand(band: string | number): [number, number] | null {
  const match = /^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/.exec(String(band).trim());
  return match ? [Number(match[1]), Number(match[2])] : null;
}

/** The band containing `value`, else the first band that reaches it, else the last. */
export function pickBand(bands: (string | number)[], value: number): string | number {
  const parsed = bands.map((band) => ({ band, range: parseBand(band) })).filter((entry) => entry.range !== null) as { band: string | number; range: [number, number] }[];
  if (parsed.length === 0) return bands[0];
  const inside = parsed.find((entry) => value >= entry.range[0] && value <= entry.range[1]);
  if (inside) return inside.band;
  const above = parsed.filter((entry) => entry.range[1] >= value).sort((a, b) => a.range[1] - b.range[1])[0];
  return (above ?? parsed[parsed.length - 1]).band;
}

const DENSITY = { board: 680, mdf: 760, heavy: 2500 };

/** Rough weight of the single front a lift system carries, in kg. */
export function liftFrontWeight(cfg: CabinetConfig): { weightKg: number; heightMm: number; widthMm: number } {
  const rv = { top: cfg.overlay.topReveal ?? 3, bottom: cfg.overlay.bottomReveal ?? 3, side: cfg.overlay.sideReveal ?? (cfg.reveal ?? 3) / 2 };
  const widthMm = cfg.width - 2 * rv.side;
  const heightMm = cfg.height - rv.top - rv.bottom;
  const label = cfg.materials.doorMaterial.toLowerCase();
  const density = /glass|alu/.test(label) ? DENSITY.heavy : /mdf/.test(label) ? DENSITY.mdf : DENSITY.board;
  const volumeM3 = (widthMm * heightMm * cfg.materials.doorThickness) / 1e9;
  return { weightKg: volumeM3 * density, heightMm, widthMm };
}

export function autoSelection(slot: FittingSlot, variant: FittingVariant, cfg: CabinetConfig): Selection {
  const selection = defaultSelection(variant);
  const choices = variant.choices;

  if ((slot === 'drawerSystem' || slot === 'drawerMotion') && choices.nominalLength) {
    const allowed = choices.nominalLength as number[];
    const chosen = Number(cfg.fittings?.drawerSystem?.selection.nominalLength);
    // Motion units follow the nominal length of the drawer system when it is available for them.
    if (slot === 'drawerMotion' && allowed.includes(chosen)) {
      selection.nominalLength = chosen;
    } else {
      const fitting = allowed.filter((nl) => nl + 3 <= availableDrawerDepth(cfg)).sort((x, y) => y - x)[0];
      if (fitting !== undefined) selection.nominalLength = fitting;
    }
  }

  if (slot === 'hinge') {
    const application = cfg.overlay.type === 'inset' ? 'inset' : cfg.overlay.type === 'partial-overlay' ? 'dual' : 'overlay';
    if (choices.application?.includes(application)) selection.application = application;
    const action = cfg.doors.hingeType === 'soft-close' ? 'blumotion' : cfg.doors.hingeType === 'push-open' ? 'unsprung' : 'spring';
    if (choices.action?.includes(action)) selection.action = action;
  }

  if (slot === 'lift') {
    const { weightKg } = liftFrontWeight(cfg);
    const kh = cfg.height;
    if (choices.cabinetHeightKH) selection.cabinetHeightKH = pickBand(choices.cabinetHeightKH, kh);
    if (choices.frontWeightFG) selection.frontWeightFG = pickBand(choices.frontWeightFG, weightKg);
    if (choices.powerFactorLF) selection.powerFactorLF = pickBand(choices.powerFactorLF, kh * weightKg);
  }
  return selection;
}

export function choiceFor(familyId: string, variantId: string, selection: Selection): FittingChoiceConfig {
  return { familyId, variantId, selection, includeAccessories: false };
}
