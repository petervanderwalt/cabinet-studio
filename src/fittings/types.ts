// Manufacturer fitting catalogue schema. Data files in src/fittings/data/ are transcribed from the
// manufacturer's printed catalogue; every value cites the printed page it came from.

export type FittingKind = 'hinge' | 'runner' | 'box' | 'lift' | 'motion' | 'divider' | 'pocket' | 'other';

/** A purchasable part. `when` narrows it to a selection (e.g. { nominalLength: 450, capacityKg: 40 }). */
export interface PartNumber {
  /** What the part is for: 'runner', 'side-set', 'front-fixing', 'back-fixing', 'plate', 'accessory', ... */
  role: string;
  partNo: string;
  description: string;
  when?: Record<string, string | number>;
  /** Pieces per application (e.g. 2 front fixing brackets per drawer). Defaults to 1. */
  qty?: number;
  page: number;
}

/** A published dimension or planning value, keyed by a stable name in `FittingVariant.dims`. */
export interface DimSpec {
  value: number | string | (number | string)[];
  unit?: 'mm' | 'kg' | 'deg' | 'mm/m';
  /** Plain-words meaning, including what it is measured from. */
  meaning: string;
  page: number;
}

export type DrillTarget =
  | 'carcass-side'
  | 'carcass-top'
  | 'carcass-bottom'
  | 'carcass-back'
  | 'divider'
  | 'front'
  | 'door'
  | 'drawer-side'
  | 'drawer-back'
  | 'drawer-bottom'
  | 'shelf'
  | 'other';

export interface DrillHole {
  x: number;
  y: number;
  diameter: number;
  depth?: number;
  note?: string;
}

/** A published drilling pattern. `reference` states what x and y are measured from, as the diagram shows. */
export interface DrillingRule {
  id: string;
  target: DrillTarget;
  label: string;
  reference: string;
  holes: DrillHole[];
  /** Restrict to part of the range, e.g. { nominalLength: [400, 450] }. */
  when?: Record<string, (string | number)[]>;
  page: number;
}

export interface FittingVariant {
  id: string;
  name: string;
  summary?: string;
  /** Selectable choices and their allowed values: nominalLength, capacityKg, colour, version, height, ... */
  choices: Record<string, (string | number)[]>;
  parts: PartNumber[];
  dims: Record<string, DimSpec>;
  drilling: DrillingRule[];
  /** Anything the generator or user should know that doesn't fit the fields above. */
  notes?: string[];
  pages: number[];
}

export interface FittingFamily {
  id: string;
  kind: FittingKind;
  brand: 'Blum';
  /** Range name as printed, e.g. LEGRABOX, MOVENTO, AVENTOS HF top. */
  name: string;
  summary: string;
  variants: FittingVariant[];
  document: string;
  pages: number[];
}

export type Selection = Record<string, string | number>;

/** Parts that apply to the chosen options (a part with no `when` always applies). */
export function resolveParts(variant: FittingVariant, selection: Selection): PartNumber[] {
  return variant.parts.filter((part) => {
    if (!part.when) return true;
    return Object.entries(part.when).every(([key, value]) => selection[key] === undefined || selection[key] === value);
  });
}
