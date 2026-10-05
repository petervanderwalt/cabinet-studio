// Collects every FittingFamily exported from src/fittings/data/*.ts and groups them into the slots a
// cabinet can choose from.
import type { FittingFamily, FittingVariant, PartNumber, Selection } from './types';
import { resolveParts } from './types';

export type FittingSlot = 'hinge' | 'hingePlate' | 'drawerSystem' | 'drawerMotion' | 'doorMotion' | 'lift' | 'divider' | 'pocket';

export const SLOT_LABELS: Record<FittingSlot, string> = {
  hinge: 'Hinge',
  hingePlate: 'Hinge mounting plate',
  drawerSystem: 'Drawer system',
  drawerMotion: 'Drawer motion (soft-close / push-open)',
  doorMotion: 'Door motion (soft-close / push-open)',
  lift: 'Lift system (replaces hinged doors)',
  divider: 'Inner dividing system',
  pocket: 'Pocket door system',
};

interface Tagged {
  family: FittingFamily;
  /** Data file the family came from, used to tell door motion from drawer motion. */
  file: string;
}

const modules = import.meta.glob('./data/*.ts', { eager: true }) as Record<string, Record<string, unknown>>;

function isFamily(value: unknown): value is FittingFamily {
  const f = value as FittingFamily;
  return Boolean(f && typeof f === 'object' && typeof f.id === 'string' && Array.isArray(f.variants) && typeof f.name === 'string');
}

const tagged: Tagged[] = [];
for (const [path, mod] of Object.entries(modules)) {
  const file = path.replace(/^.*\//, '').replace(/\.ts$/, '');
  for (const value of Object.values(mod)) {
    if (Array.isArray(value)) for (const entry of value) if (isFamily(entry)) tagged.push({ family: entry, file });
  }
}

export const ALL_FAMILIES: FittingFamily[] = tagged.map((t) => t.family);

export function getFamily(id: string | undefined): FittingFamily | undefined {
  return ALL_FAMILIES.find((family) => family.id === id);
}

export function getVariant(familyId: string | undefined, variantId: string | undefined): FittingVariant | undefined {
  return getFamily(familyId)?.variants.find((variant) => variant.id === variantId);
}

function slotOf(entry: Tagged): FittingSlot | null {
  const { family, file } = entry;
  if (file === 'doorMotion') return 'doorMotion';
  if (file === 'boxMotion' || file === 'runnerMotion') return 'drawerMotion';
  if (family.kind === 'runner' || family.kind === 'box') return 'drawerSystem';
  if (family.kind === 'hinge') {
    if (/mounting-plates/.test(family.id)) return 'hingePlate';
    if (/accessories/.test(family.id)) return null;
    return 'hinge';
  }
  if (family.kind === 'lift') return 'lift';
  if (family.kind === 'divider') return 'divider';
  if (family.kind === 'pocket') return 'pocket';
  if (family.kind === 'motion') return /door/i.test(family.name) ? 'doorMotion' : 'drawerMotion';
  return null;
}

/** Variants worth choosing: they carry parts, and aren't overview or accessory-only pages. */
export function usableVariants(family: FittingFamily): FittingVariant[] {
  const usable = family.variants.filter((variant) => variant.parts.length > 0 && !/overview|accessor|fixing-positions|centre-piece-only/.test(variant.id));
  return usable.length > 0 ? usable : family.variants;
}

export function familiesForSlot(slot: FittingSlot): FittingFamily[] {
  return tagged.filter((entry) => slotOf(entry) === slot).map((entry) => entry.family);
}

/** Default selection: the first allowed value of each choice. */
export function defaultSelection(variant: FittingVariant): Selection {
  const selection: Selection = {};
  for (const [key, values] of Object.entries(variant.choices)) {
    if (values.length > 0) selection[key] = values[0];
  }
  return selection;
}

export interface FittingChoice {
  familyId: string;
  variantId: string;
  selection: Selection;
  includeAccessories?: boolean;
}

/** Roles that make up the fitting itself; everything else is optional and only listed when accessories are included. */
const CORE_ROLES: Record<FittingSlot, RegExp> = {
  hinge: /^(hinge|plate|angled-spacer)$/,
  hingePlate: /^(plate|angled-spacer)$/,
  drawerSystem: /^(runner|cabinet-profile|cabinet-profile-and-drawer-side-set|drawer-side-set(-exterior|-interior)?|side-set(-exterior|-interior)?|front-fixing(-set)?|back-fixing|locking-device)$/,
  drawerMotion: /^(tip-on-set|tip-on-blumotion-set(-sink)?|runner-pair|cabinet-profile|drive-unit|servo-drive-set|drive-set|uno-set)$/,
  doorMotion: /^(motion|tip-on)$/,
  lift: /^(lift-mechanism(-set)?|lever-arm-set|front-fixing(-bracket)?|cover-cap-set|opening-angle-stop|servo-drive-set|tip-on)$/,
  divider: /^(set|frame-\d+|cross-divider|cutlery-insert)$/,
  pocket: /^$/,
};

/**
 * Parts for a choice. By default only the fitting's core parts whose options all match the selection;
 * with `includeAccessories`, every role is listed (still limited to options that match).
 */
export function partsForChoice(choice: FittingChoice | null | undefined, slot?: FittingSlot): PartNumber[] {
  if (!choice) return [];
  const variant = getVariant(choice.familyId, choice.variantId);
  if (!variant) return [];
  const matching = resolveParts(variant, choice.selection);
  if (choice.includeAccessories || !slot) return matching;
  return matching.filter((part) => CORE_ROLES[slot].test(part.role) && Object.keys(part.when ?? {}).every((key) => choice.selection[key] !== undefined));
}
