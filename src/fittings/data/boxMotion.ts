// Transcribed from Blum "Catalogue and technical manual 2024/2025":
//   SERVO-DRIVE for LEGRABOX | MERIVOBOX | TANDEMBOX (printed pages 362-393)
//   TIP-ON BLUMOTION for LEGRABOX | MERIVOBOX | TANDEMBOX (printed pages 394-403)
//   TIP-ON for LEGRABOX (printed pages 404-407; 408 is the next chapter divider)
// Page numbers are PRINTED page numbers.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const mm = (value: DimSpec['value'], meaning: string, page: number): DimSpec => ({ value, unit: 'mm', meaning, page });
const txt = (value: DimSpec['value'], meaning: string, page: number): DimSpec => ({ value, meaning, page });

// ---------------------------------------------------------------------------------------------
// SERVO-DRIVE shared parts
// ---------------------------------------------------------------------------------------------

/** SERVO-DRIVE power supply unit and flex (item 13). Part no. = Z10NE04 + mains plug letter + language package letter. */
const POWER_SUPPLY_ROWS: [plug: string, market: string, pkg: string, languages: string][] = [
  ['E', 'Europe', 'A', 'DE|EN|FR|IT|NL'],
  ['E', 'Europe', 'B', 'DA|EN|FI|NO|SV'],
  ['E', 'Europe', 'C', 'EL|EN|HR|SL|SR|TR'],
  ['E', 'Europe', 'D', 'EN|ES|FR|IT|PT'],
  ['E', 'Europe', 'E', 'CS|HU|PL|SK'],
  ['E', 'Europe', 'F', 'BG|ET|LT|LV|RO|RU|UK'],
  ['E', 'Europe', 'I', 'EN'],
  ['B', 'GB', 'A', 'DE|EN|FR|IT|NL'],
  ['B', 'GB', 'I', 'EN'],
  ['H', 'IN', 'I', 'EN'],
  ['I', 'IL', 'A', 'DE|EN|FR|IT|NL'],
  ['K', 'AU', 'I', 'EN'],
  ['N', 'CN', 'H', 'EN|ZH|KO'],
  ['R', 'KR', 'H', 'EN|ZH|KO'],
  ['S', 'BR', 'K', 'EN|ES|PT'],
  ['T', 'TW', 'H', 'EN|ZH|KO'],
  ['U', 'US|CA', 'G', 'EN|ES|FR'],
  ['U', 'JP', 'J', 'JA'],
  ['Z', 'ZA', 'I', 'EN'],
];

function powerSupplyParts(page: number): PartNumber[] {
  return POWER_SUPPLY_ROWS.map(([plug, market, pkg, langs]) => ({
    role: 'power-supply',
    partNo: `Z10NE04${plug}${pkg}`,
    description: `Power supply unit + 2 m flex, ${market}, languages ${langs}`,
    when: { mainsPlug: plug, languagePackage: pkg },
    page,
  }));
}

const BUMPER_QTY_ROWS = [
  'Front height FH up to 300 mm: 2 pcs with 40 | 30 kg cabinet profile, 4 pcs with 70 | 65 kg cabinet profile',
  'Front height FH from 301 mm: 4 pcs with 40 | 30 kg cabinet profile, 4 pcs with 70 | 65 kg cabinet profile',
];

function bumperParts(page: number): PartNumber[] {
  return [
    { role: 'distance-bumper', partNo: '993.0530', description: 'Blum distance bumper Ø5.0, dark grey', when: { bumperDiameter: 5 }, page },
    { role: 'distance-bumper', partNo: '993.0830.01', description: 'Blum distance bumper Ø8.0, dark grey', when: { bumperDiameter: 8 }, page },
  ];
}

function commonElectricParts(page: number, opts: { housingGround: boolean; wallHousing: boolean; stabiliserAndSync?: boolean }, supplyPage: number = page): PartNumber[] {
  const parts: PartNumber[] = [
    { role: 'drive-unit', partNo: 'Z10A3000.04', description: 'Drive unit incl. pre-assembled lever extension, dark grey', page },
    { role: 'distribution-cable', partNo: 'Z10K800AE', description: 'Distribution cable set 8 m (cut to size) + 5 cable end protectors, black', page },
    { role: 'connecting-node', partNo: 'Z10V100E.01', description: 'Connecting node set + 2 cable end protectors, black', page },
    ...powerSupplyParts(supplyPage),
  ];
  if (opts.housingGround) parts.push({ role: 'power-supply-housing', partNo: 'Z10NG000', description: 'Power supply housing, ground mounting, incl. cover, dark grey', page: supplyPage });
  if (opts.wallHousing) parts.push({ role: 'power-supply-housing', partNo: 'Z10NG120', description: 'Power supply housing, wall fixing (alternative), white grey', page: supplyPage });
  parts.push({ role: 'accessory', partNo: 'Z10K0009', description: 'Cable holder, white nylon', page: supplyPage });
  if (opts.stabiliserAndSync) {
    parts.push({ role: 'accessory', partNo: 'Z96.10E1', description: 'Front/base stabiliser, nylon RAL 7037', page: supplyPage });
    for (const [len, pn] of [[80, 'Z10K008S'], [500, 'Z10K050S'], [1200, 'Z10K120S'], [1600, 'Z10K160S']] as [number, string][]) {
      parts.push({ role: 'accessory', partNo: pn, description: `Synchronisation cable ${len} mm, white`, when: { syncCableLength: len }, page: supplyPage });
    }
  }
  return parts;
}

function bracketProfileParts(page: number): PartNumber[] {
  const rows: [number, string, string][] = [
    [650, 'Z10T650AA', 'with cable'],
    [700, 'Z10T700AA', 'with cable'],
    [710, 'Z10T710AA', 'with cable'],
    [750, 'Z10T750AA', 'with cable'],
    [800, 'Z10T800AA', 'with cable'],
    [1170, 'Z10T1170A', 'without cable'],
  ];
  return rows.map(([len, pn, cable]) => ({
    role: 'bracket-profile',
    partNo: pn,
    description: `Aluminium bracket profile ${len} mm, ${cable}`,
    when: { bracketProfileLength: len },
    page,
  }));
}

const leverCap = (page: number): PartNumber => ({
  role: 'lever-cap',
  partNo: 'Z10A3006',
  description: 'Lever cap, LEGRABOX steel back, black',
  when: { boxSystem: 'LEGRABOX', back: 'steel' },
  page,
});
const triggerGuidance = (page: number): PartNumber => ({
  role: 'trigger-guidance',
  partNo: 'Z10A3H00',
  description: 'Trigger guidance, TANDEMBOX chipboard back, dark grey',
  when: { boxSystem: 'TANDEMBOX', back: 'chipboard' },
  page,
});

// Position - drive unit table (A, E min) shared by standard cabinet / SPACE TOWER pages.
type AE = [a: number | null, e: number | null];
const AE_ROWS: [system: string, back: string, heights: string, cells: AE[]][] = [
  ['LEGRABOX', 'chipboard', 'N', [[null, null], [45, 61], [45, 61], [45, 61]]],
  ['LEGRABOX', 'chipboard', 'M|K|C|F', [[null, null], [45, 69], [45, 69], [45, 69]]],
  ['LEGRABOX', 'steel', 'M|K|C|F', [[null, null], [45, 69], [45, 69], [45, 69]]],
  ['MERIVOBOX', 'chipboard', 'N', [[null, null], [28, 32], [28, 32], [28, 32]]],
  ['MERIVOBOX', 'chipboard', 'M|K|E', [[null, null], [45, 54], [45, 54], [45, 54]]],
  ['MERIVOBOX', 'steel', 'M|K|E', [[null, null], [45, 54], [45, 54], [45, 54]]],
  ['TANDEMBOX', 'chipboard', 'N', [[35, 56], [35, 56], [35, 56], [28, 49]]],
  ['TANDEMBOX', 'chipboard', 'M|K|B|C|D', [[35, 64], [35, 64], [35, 64], [35, 64]]],
  ['TANDEMBOX', 'steel', 'N', [[null, null], [null, null], [28, 49], [28, 49]]],
  ['TANDEMBOX', 'steel', 'M|K|B|C|D', [[null, null], [35, 64], [35, 64], [35, 64]]],
];
const LW_BANDS_4 = ['242-266', '267-286', '287-316', '>=317'];

function aeTable(): string[] {
  return AE_ROWS.map(([sys, back, h, cells]) => {
    const bands = cells.map((c, i) => `LW ${LW_BANDS_4[i]}: ${c[0] === null ? 'not possible' : `A=${c[0]}, Emin=${c[1]}`}`).join('; ');
    return `${sys} ${back} back, back height ${h}: ${bands}`;
  });
}

// Dimension of engagement Z table. Tokens are the symbols as printed: number or LW/2 = Z; filled circle = required;
// cross = remove; open circle = not required; dash = not possible.
const SYM: Record<string, string> = { '●': 'required', '✖': 'remove', '○': 'not required', '–': 'not possible / n.a.' };
type ZRow = [system: string, back: string, heights: string, tokens: string[][]];

function zTable(rows: ZRow[], bands: string[], fields: string[][]): string[] {
  return rows.map(([sys, back, h, tokens]) => {
    const bandText = tokens
      .map((tk, i) => {
        if (tk.every((t) => t === '–')) return `LW ${bands[i]}: not possible`;
        const f = fields[i];
        const parts = tk.map((t, j) => `${f[j]}=${j === 0 ? t : SYM[t] ?? t}`);
        return `LW ${bands[i]}: ${parts.join(', ')}`;
      })
      .join('; ');
    return `${sys} ${back} back, back height ${h}: ${bandText}`;
  });
}

const Z_BANDS = ['242-266', '267-286', '287-316', '317-386', '>=387'];
const Z_FIELDS = [
  ['Z', 'leverExtension', 'triggerGuidance'],
  ['Z', 'leverExtension', 'triggerGuidance', 'leverCap'],
  ['Z', 'leverExtension', 'triggerGuidance'],
  ['Z', 'leverExtension', 'triggerGuidance'],
  ['Z', 'leverExtension', 'triggerGuidance'],
];
const D = '–';
const STANDARD_Z_ROWS: ZRow[] = [
  ['LEGRABOX', 'chipboard', 'N', [[D, D, D], ['184', '●', D, D], ['184', '●', D], ['184', '●', D], ['LW/2', '●', D]]],
  ['LEGRABOX', 'chipboard', 'M|K|C|F', [[D, D, D], ['184', '●', D, D], ['184', '●', D], ['184', '●', D], ['LW/2', '●', D]]],
  ['LEGRABOX', 'steel', 'M|K|C|F', [[D, D, D], ['184', '✖', D, '●'], ['184', '●', D], ['184', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'chipboard', 'N', [[D, D, D], ['174', '✖', D, D], ['174', '●', D], ['174', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'chipboard', 'M|K|E', [[D, D, D], ['174', '✖', D, D], ['174', '●', D], ['174', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'steel', 'M|K|E', [[D, D, D], ['174', '●', D, D], ['174', '●', D], ['174', '●', D], ['LW/2', '●', D]]],
  ['TANDEMBOX', 'chipboard', 'N', [['179', '✖', '●'], ['179', '●', '●', D], ['179', '●', '●'], ['179', '●', '○'], ['LW/2', '●', '○']]],
  ['TANDEMBOX', 'chipboard', 'M|K|B|C|D', [['179', '✖', '●'], ['179', '●', '●', D], ['179', '●', '●'], ['179', '●', '○'], ['LW/2', '●', '○']]],
  ['TANDEMBOX', 'steel', 'N', [[D, D, D], [D, D, D, D], ['190', '✖', D], ['190', '●', D], ['LW/2', '●', D]]],
  ['TANDEMBOX', 'steel', 'M|K|B|C|D', [[D, D, D], ['179', '✖', D, D], ['179', '●', D], ['179', '●', D], ['LW/2', '●', D]]],
];
const HORIZONTAL_Z_ROWS: ZRow[] = [
  ['LEGRABOX', 'chipboard', 'N', [[D, D, D], [D, D, D, D], ['193', '✖', D], ['193', '●', D], ['LW/2', '●', D]]],
  ['LEGRABOX', 'chipboard', 'M|K|C|F', [[D, D, D], ['182', '●', D, '○'], ['182', '●', D], ['182', '●', D], ['LW/2', '●', D]]],
  ['LEGRABOX', 'steel', 'M|K|C|F', [[D, D, D], ['182', '●', D, '○'], ['182', '●', D], ['182', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'chipboard', 'N', [[D, D, D], ['177', '✖', D, D], ['177', '●', D], ['177', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'chipboard', 'M|K|E', [[D, D, D], ['177', '✖', D, D], ['177', '●', D], ['177', '●', D], ['LW/2', '●', D]]],
  ['MERIVOBOX', 'steel', 'M|K|E', [[D, D, D], ['177', '●', D, D], ['177', '●', D], ['177', '●', D], ['LW/2', '●', D]]],
  ['TANDEMBOX', 'chipboard', 'N', [[D, D, D], [D, D, D, D], ['193', '✖', '○'], ['193', '●', '○'], ['LW/2', '●', '○']]],
  ['TANDEMBOX', 'chipboard', 'M|K|B|C|D', [['182', '✖', '●'], ['182', '✖', '●', '○'], ['182', '●', '●'], ['182', '●', '○'], ['LW/2', '●', '○']]],
  ['TANDEMBOX', 'steel', 'N', [[D, D, D], ['193', '✖', '○', '○'], ['193', '●', '○'], ['193', '●', '○'], ['LW/2', '●', '○']]],
  ['TANDEMBOX', 'steel', 'M|K|B|C|D', [[D, D, D], ['182', '✖', '○', '○'], ['182', '●', '○'], ['182', '●', '○'], ['LW/2', '●', '○']]],
];
const zSymbolLegend = 'Symbols: required, remove, not required, not possible. Z = dimension of engagement; LW = internal cabinet width';

// Drilling pattern shared by all cross bar / bracket applications (base drilling pattern drawings).
function baseCablingDrilling(prefix: string, page: number): DrillingRule[] {
  return [
    {
      id: `${prefix}-lower-cabling`,
      target: 'carcass-bottom',
      label: 'Base drilling pattern, lower cabling',
      reference:
        'Pattern relative to its left-most hole. x measured along the line of holes: three Ø10 holes, 131.5 between outer holes, 96 between middle and right hole. ' +
        'The drawing shows the left hole offset 6 mm in the other direction (left hole y direction not legible, so y=0 is a placeholder). Pattern position in the cabinet comes from the X/Y tables.',
      holes: [
        { x: 0, y: 0, diameter: 10, depth: 8, note: 'BT = 8; offset 6 mm in y relative to the other two holes (direction unverified)' },
        { x: 35.5, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
        { x: 131.5, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
      ],
      page,
    },
    {
      id: `${prefix}-back-cabling`,
      target: 'carcass-bottom',
      label: 'Base drilling pattern, back cabling',
      reference: 'Pattern relative to its left hole: two Ø10 holes 96 apart. Pattern position in the cabinet comes from the X/Y tables.',
      holes: [
        { x: 0, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
        { x: 96, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
      ],
      page,
    },
    {
      id: `${prefix}-minipress`,
      target: 'carcass-bottom',
      label: 'Alternative base drilling pattern, MINIPRESS top | MINIPRESS',
      reference: 'Pattern relative to the Ø25 hole: 128 to the right-hand Ø10 hole, 96 between the two Ø10 holes. Pattern position in the cabinet comes from the X/Y tables.',
      holes: [
        { x: 0, y: 0, diameter: 25, depth: 8, note: 'BT = 8' },
        { x: 32, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
        { x: 128, y: 0, diameter: 10, depth: 8, note: 'BT = 8' },
      ],
      page,
    },
  ];
}

const frontBumperDims = (page: number): Record<string, DimSpec> => ({
  distanceBumperQty: txt(BUMPER_QTY_ROWS, 'Number of Blum distance bumpers by front height FH and cabinet profile capacity', page),
  distanceBumperTriggerPath: mm(2, 'The Blum distance bumper creates and maintains this trigger path', page),
  distanceBumperDrillDiameter: txt('Ø5 (Ø8)', 'Bumper hole diameter in the front, Ø5 or Ø8 per bumper part chosen', page),
  distanceBumperPositionFHUnder300: txt('1/2 FH vertically (centre of front height), FA / 2 horizontally, min 10 to the front edge', 'Front assembly, Blum distance bumper position for FH < 300 mm, as labelled; FA = front overlay', page),
  distanceBumperPositionFHOver300: txt('20 +/-12 from top and bottom edge of front, FA / 2 horizontally, min 10 to the front edge', 'Front assembly, Blum distance bumper position for FH > 300 mm, as labelled; FA = front overlay', page),
});

const housingDims = (page: number): Record<string, DimSpec> => ({
  powerSupplyHousingSafetyDistance: mm(30, 'Keep this safety distance from the bottom edge (base fixing) and/or front edge (wall fixing) and side edges of the power supply housing to neighbouring elements; air must circulate', page),
});

const housingNote =
  'unverified: power supply housing envelope drawing (values 90, 260, 300, 150, 75, R25 for ground mounting; 360, 150, 75 for wall fixing) is not transcribed because axis assignment is not clear; only the 30 mm safety distance is.';

const commonChoices = {
  boxSystem: ['LEGRABOX', 'MERIVOBOX', 'TANDEMBOX'],
  back: ['chipboard', 'steel'],
  internalCabinetWidthLW: ['242-266', '267-286', '287-316', '317-386', '>=387'],
  cabinetProfileKg: ['40 | 30', '70 | 65'],
  mainsPlug: [...new Set(POWER_SUPPLY_ROWS.map((r) => r[0]))],
  languagePackage: [...new Set(POWER_SUPPLY_ROWS.map((r) => r[2]))],
};

// ---------------------------------------------------------------------------------------------
// SERVO-DRIVE variants
// ---------------------------------------------------------------------------------------------

function standardCabinet(): FittingVariant {
  return {
    id: 'servo-drive-standard-cabinet',
    name: 'SERVO-DRIVE - standard cabinet (vertical bracket profile)',
    summary: 'Electrical opening support with BLUMOTION; bracket profile on cross bars (horizontal or vertical)',
    choices: { ...commonChoices, bracketProfileLength: [650, 700, 710, 750, 800, 1170], bracketAttachment: ['top/bottom (cross bar horizontal)', 'lower/back (cross bar vertical)'], bumperDiameter: [5, 8] },
    parts: [
      ...bumperParts(364),
      ...bracketProfileParts(364),
      { role: 'bracket-attachment', partNo: 'Z10D01E0.01', description: 'Bracket profile attachment top/bottom, cross bar horizontal', when: { bracketAttachment: 'top/bottom (cross bar horizontal)' }, page: 364 },
      { role: 'bracket-attachment', partNo: 'Z10D01EA.01', description: 'Bracket profile attachment lower/back + cover cap, cross bar vertical', when: { bracketAttachment: 'lower/back (cross bar vertical)' }, page: 364 },
      leverCap(364),
      triggerGuidance(364),
      ...commonElectricParts(364, { housingGround: true, wallHousing: true, stabiliserAndSync: true }, 365),
    ],
    dims: {
      bracketProfileLength: txt('LH - 10 (round down to the nearest tenth)', 'Bracket profile length PL; LH = internal cabinet height; cut to size', 366),
      bracketProfileCut: mm('LH - 10', 'Bracket profile cutting length, LH = internal cabinet height', 364),
      driveUnitPositionTable: txt(aeTable(), 'Position of drive unit. A = distance between bottom edge of the cabinet profile and bottom edge of the drive unit; Emin = distance between bottom edge of the cabinet top panel and the fixing position of the cabinet profile; mm. Same table for horizontal and vertical cross bar', 366),
      driveUnitTopOffset: mm(52, 'Dimension 52 shown at the top of the cabinet position drawing (top drive unit); reference as drawn, unverified', 366),
      crossBarHorizontalBaseXChipboard: mm('NL + 19', 'Cross bar horizontal, chipboard back: drilling position X; NL = nominal length', 367),
      crossBarHorizontalBaseXSteel: mm('NL + 2', 'Cross bar horizontal, steel back: drilling position X', 367),
      crossBarHorizontalMinSpaceYChipboard: mm('NL + 33', 'Cross bar horizontal, chipboard back: min space requirement Y', 367),
      crossBarHorizontalMinSpaceYSteel: mm('NL + 16', 'Cross bar horizontal, steel back: min space requirement Y', 367),
      crossBarVerticalBaseXChipboard: mm('NL + 19', 'Cross bar vertical, chipboard back: drilling position X', 369),
      crossBarVerticalBaseXSteel: mm('NL + 2', 'Cross bar vertical, steel back: drilling position X', 369),
      crossBarVerticalFrontEdgeTChipboard: mm('NL + 34', 'Cross bar vertical, chipboard back: T = position front edge - cross member', 369),
      crossBarVerticalFrontEdgeTSteel: mm('NL + 17', 'Cross bar vertical, steel back: T = position front edge - cross member', 369),
      engagementTable: txt(zTable(STANDARD_Z_ROWS, Z_BANDS, Z_FIELDS), `Dimension of engagement Z with lever extension / trigger guidance / lever cap by box system. ${zSymbolLegend}`, 367),
      leverCapRule: txt('Lever cap required for LEGRABOX height M and internal cabinet widths LW of 267-286 mm (steel back)', 'Lever cap part Z10A3006', 364),
      triggerGuidanceRule: txt('Trigger guidance required for TANDEMBOX chipboard back and internal cabinet widths LW of 242-316 mm', 'Trigger guidance part Z10A3H00', 364),
      ...frontBumperDims(366),
      ...housingDims(367),
    },
    drilling: baseCablingDrilling('servo-standard', 366),
    notes: [
      'Bracket profile 650-800 mm supplied with cable; 1170 mm supplied without cable and cut to size (LH - 10 mm).',
      'For optimal trigger function with front height FH > 300 mm use front stabilisation (front/base stabiliser Z96.10E1).',
      'Footnote "required for two or more drive units" is attached to the power supply / accessories block in the extracted page; unverified which items it applies to.',
      'Same planning tables are printed for the horizontal cross bar (page 366-367) and the vertical cross bar (368-369).',
      housingNote,
      'unverified: base drilling pattern placement (reference edge) is given only through X/Y table values; hole y direction for the offset 6 mm hole is not legible.',
    ],
    pages: [364, 365, 366, 367, 368, 369],
  };
}

function spaceTower(): FittingVariant {
  return {
    id: 'servo-drive-space-tower',
    name: 'SERVO-DRIVE - SPACE TOWER',
    summary: 'Vertical bracket profile; top or bottom bracket profile attachment',
    choices: { ...commonChoices, bracketProfileLength: [650, 700, 710, 750, 800, 1170], bracketAttachment: ['top/bottom (cross bar horizontal)', 'lower/back (cross bar vertical)'] },
    parts: [
      ...bracketProfileParts(370),
      { role: 'bracket-attachment', partNo: 'Z10D01E0.01', description: 'Bracket profile attachment top/bottom, cross bar horizontal', when: { bracketAttachment: 'top/bottom (cross bar horizontal)' }, page: 370 },
      { role: 'bracket-attachment', partNo: 'Z10D01EA.01', description: 'Bracket profile attachment lower/back + cover cap, cross bar vertical', when: { bracketAttachment: 'lower/back (cross bar vertical)' }, page: 370 },
      leverCap(370),
      triggerGuidance(370),
      ...commonElectricParts(370, { housingGround: true, wallHousing: true }, 371),
    ],
    dims: {
      bracketProfileCut: mm('LH - 10', 'Bracket profile cutting length, LH = internal cabinet height; PL round down to the nearest tenth', 370),
      driveUnitPositionTable: txt(aeTable(), 'Position of drive unit, same table for top (p372) and bottom (p374) bracket profile. A = bottom edge of cabinet profile to bottom edge of drive unit; Emin = bottom edge of cabinet top panel to fixing position of cabinet profile; mm', 372),
      topBracketBaseXChipboard: mm('NL + 19', 'Top bracket profile, chipboard back: drilling position X; NL = nominal length', 373),
      topBracketBaseXSteel: mm('NL + 2', 'Top bracket profile, steel back: drilling position X', 373),
      topBracketFrontEdgeTChipboard: mm('NL + 34', 'Top bracket profile, chipboard back: T = position front edge - cross member', 373),
      topBracketFrontEdgeTSteel: mm('NL + 17', 'Top bracket profile, steel back: T', 373),
      bottomBracketBaseXChipboard: mm('NL + 19', 'Bottom bracket profile, chipboard back: drilling position X', 375),
      bottomBracketBaseXSteel: mm('NL + 2', 'Bottom bracket profile, steel back: drilling position X', 375),
      bottomBracketMinSpaceYChipboard: mm('NL + 33', 'Bottom bracket profile, chipboard back: min space requirement Y', 375),
      bottomBracketMinSpaceYSteel: mm('NL + 16', 'Bottom bracket profile, steel back: min space requirement Y', 375),
      engagementTable: txt(zTable(STANDARD_Z_ROWS, Z_BANDS, Z_FIELDS), `Dimension of engagement Z with lever extension / trigger guidance / lever cap by box system. ${zSymbolLegend}`, 373),
      ...housingDims(373),
    },
    drilling: baseCablingDrilling('servo-space-tower', 372),
    notes: [
      'SERVO-DRIVE for MERIVOBOX is only triggered by pulling for inset application pull-outs.',
      'Order page lists no Blum distance bumper for SPACE TOWER.',
      housingNote,
    ],
    pages: [370, 371, 372, 373, 374, 375],
  };
}

function sinkCabinet(): FittingVariant {
  return {
    id: 'servo-drive-sink-cabinet',
    name: 'SERVO-DRIVE - sink cabinet (attachment bracket 1 tier)',
    summary: 'Attachment bracket with drip protection, quick assembly of pre-mounted parts',
    choices: { ...commonChoices, bumperDiameter: [5, 8], internalCabinetWidthLW: ['>=387'] },
    parts: [
      ...bumperParts(376),
      { role: 'attachment-bracket', partNo: 'Z10D0311', description: 'Attachment bracket 1 tier, nylon dark grey', page: 376 },
      { role: 'drip-protection', partNo: 'Z10D0316', description: 'Drip protection feature for drive unit', page: 376 },
      ...commonElectricParts(376, { housingGround: true, wallHousing: true }, 377),
      { role: 'accessory', partNo: 'Z96.10E1', description: 'Front/base stabiliser, nylon RAL 7037', page: 377 },
    ],
    dims: {
      attachmentBracketATable: txt(
        [
          'LEGRABOX centre piece, back heights N|M|K|C|F: A = 45',
          'MERIVOBOX centre piece, back height N: A = 28; M|K|E: A = 45',
          'TANDEMBOX centre piece, back height N: A = 28; M|K|B|C|D: A = 35',
        ],
        'Cross member - attachment bracket 1 tier: A in mm (distance between bottom edge of attachment bracket and bottom edge of drive unit)',
        378,
      ),
      baseAttachmentATable: txt(
        [
          'LEGRABOX chipboard back N|M|K|C|F: A = 45; steel back M|K|C|F: A = 45',
          'MERIVOBOX chipboard back N: A = 28, M|K|E: A = 45; steel back M|K|E: A = 45',
          'TANDEMBOX chipboard back N: A = 28, M|K|B|C|D: A = 35; steel back N: A = 28, M|K|B|C|D: A = 35',
        ],
        'Base - attachment bracket 1 tier: A in mm, internal cabinet width LW >= 387 mm',
        379,
      ),
      centrePieceW: txt('NL drawer side exterior - NL drawer side interior', 'W = distance between front edge of drawer base and back edge of centre piece (cross member application)', 378),
      centrePieceWMin: txt(['LEGRABOX: min 150', 'MERIVOBOX: min 150', 'TANDEMBOX: min 100'], 'Minimum W in mm per box system', 378),
      crossMemberNominalLengthRange: txt('450-650', 'Nominal length exterior NL (mm) for cross member application, LW >= 387', 378),
      crossMemberX: mm('W + 27', 'Cross member - attachment bracket: drilling position X (all three box systems, centre piece); W as defined above', 378),
      crossMemberZ: mm('LW / 2', 'Dimension of engagement Z; LW = internal cabinet width', 378),
      crossMemberMin: mm([14, 81], 'Printed "min 14" and "min 81" in the cross member drilling drawing; reference not legible', 378),
      baseXChipboard: mm('NL + 19', 'Base - attachment bracket 1 tier, LEGRABOX | MERIVOBOX | TANDEMBOX chipboard back: X', 379),
      baseYChipboard: mm('NL + 35', 'Same, min space requirement Y', 379),
      baseXChipboardOverExtension: mm('NL - 31', 'MERIVOBOX with over extension cabinet profile, chipboard back: X', 379),
      baseYChipboardOverExtension: mm('NL + 3', 'MERIVOBOX with over extension cabinet profile, chipboard back: Y', 379),
      baseXSteel: mm('NL + 2', 'Steel back: X', 379),
      baseYSteel: mm('NL + 18', 'Steel back: Y', 379),
      baseXSteelOverExtension: mm('NL - 48', 'MERIVOBOX with over extension cabinet profile, steel back: X', 379),
      baseYSteelOverExtension: mm('NL + 3', 'MERIVOBOX with over extension cabinet profile, steel back: Y', 379),
      baseZ: mm('LW / 2', 'Dimension of engagement Z for base attachment bracket', 379),
      crossMemberDrillSpacing: mm(96, 'Hole spacing in the cross member drilling pattern (Ø10, BT = 8)', 378),
      ...frontBumperDims(378),
      ...housingDims(379),
    },
    drilling: baseCablingDrilling('servo-sink', 378).filter((r) => !r.id.endsWith('back-cabling')),
    notes: [
      'Only internal cabinet widths LW >= 387 mm are tabulated for the sink cabinet attachment.',
      'Cross member drilling detail (Ø10, BT = 8, 96, min 14, min 81) is recorded in dims only; its reference edges are not clear.',
      housingNote,
    ],
    pages: [376, 377, 378, 379],
  };
}

function pulloutHorizontal(): FittingVariant {
  return {
    id: 'servo-drive-pullout-bracket-horizontal',
    name: 'SERVO-DRIVE - cabinet with pull-out element, horizontal bracket profile',
    summary: 'Horizontal bracket profile, quick assembly of pre-mounted parts',
    choices: { ...commonChoices, bumperDiameter: [5, 8], cabinetWidthKB: ['275-1200'] },
    parts: [
      ...bumperParts(380),
      { role: 'bracket-profile', partNo: 'Z10T1143B', description: 'Horizontal bracket profile 1143 mm, aluminium, cut to size', page: 380 },
      { role: 'bracket-attachment', partNo: 'Z10D5210', description: 'Horizontal bracket profile attachment left/right + adapter for drive unit', page: 380 },
      leverCap(380),
      triggerGuidance(380),
      ...commonElectricParts(380, { housingGround: true, wallHousing: true, stabiliserAndSync: true }, 381),
    ],
    dims: {
      bracketProfileLength: mm(1143, 'Horizontal bracket profile stock length, cut to size; for cabinet width KB 275-1200 mm', 380),
      bracketProfileCut: mm('LW - 19', 'Horizontal bracket profile cutting length; LW = internal cabinet width', 380),
      baseXChipboard: mm('NL - 9', 'Drilling distances, chipboard back: X; NL = nominal length', 383),
      baseYChipboard: mm('NL + 37', 'Chipboard back: min space requirement Y', 383),
      baseXSteel: mm('NL - 26', 'Steel back: X', 383),
      baseYSteel: mm('NL + 20', 'Steel back: Y', 383),
      bracketOffset: mm(37, 'Dimension 37 in the drilling drawings, measured from the cabinet front edge to the bracket (as drawn)', 383),
      bracketVerticalSpacing: mm(64, 'Vertical dimension 64 in the drilling drawings (all three box systems)', 383),
      legraboxMin: mm([68.5, 12], 'LEGRABOX drawing: min 68.5 and 12 as printed; reference not legible', 383),
      merivoboxMin: mm(54, 'MERIVOBOX drawing: min 54* (32 mm for back height N) and 30** (45 mm for back height N)', 383),
      merivoboxLower: mm(30, 'MERIVOBOX drawing: 30** (45 mm for back height N)', 383),
      tandemboxMin: mm(63.5, 'TANDEMBOX drawing: min 63.5* (55 mm for back height N)', 383),
      tandemboxLower: mm(16, 'TANDEMBOX drawing: 16** (24 mm for back height N)', 383),
      engagementTable: txt(zTable(HORIZONTAL_Z_ROWS, Z_BANDS, Z_FIELDS), `Dimension of engagement Z (horizontal bracket profile) with lever extension / trigger guidance / lever cap. ${zSymbolLegend}`, 382),
      ...frontBumperDims(382),
      ...housingDims(383),
    },
    drilling: [],
    notes: [
      'Quick assembly of pre-mounted parts; chipboard screws and system screws can be used for the bracket attachment.',
      'unverified: min 68.5 / 54 / 63.5 and 12 / 30 / 16 on the drilling distances page 383 are printed without a clear reference line and are recorded as printed only.',
      housingNote,
    ],
    pages: [380, 381, 382, 383],
  };
}

function pulloutUpper(): FittingVariant {
  return {
    id: 'servo-drive-pullout-upper-bracket',
    name: 'SERVO-DRIVE - cabinet with pull-out element, upper attachment bracket',
    summary: 'Steel upper attachment bracket with pre-mounted drive unit adapter',
    choices: { ...commonChoices, bumperDiameter: [5, 8], internalCabinetWidthLW: ['242-266', '267-286', '287-316', '>=317'] },
    parts: [
      ...bumperParts(384),
      { role: 'attachment-bracket', partNo: 'Z10D6252', description: 'Upper attachment bracket, steel, incl. adapter for drive unit', page: 384 },
      leverCap(384),
      triggerGuidance(384),
      ...commonElectricParts(384, { housingGround: true, wallHousing: true, stabiliserAndSync: true }, 385),
    ],
    dims: {
      driveUnitPositionTable: txt(
        [
          'LEGRABOX chipboard N: LW 287-316 and >=317: A=45, Emin=84, Emax=174 (not possible below 287)',
          'LEGRABOX chipboard M|K|C|F: LW 267-286, 287-316, >=317: A=45, Emin=84, Emax=174',
          'LEGRABOX steel M|K|C|F: LW 267-286, 287-316, >=317: A=45, Emin=84, Emax=174',
          'MERIVOBOX chipboard N: LW 267-286, 287-316, >=317: A=28, Emin=50, Emax=139',
          'MERIVOBOX chipboard M|K|E: LW 267-286, 287-316, >=317: A=45, Emin=67, Emax=157',
          'MERIVOBOX steel M|K|E: LW 267-286, 287-316, >=317: A=45, Emin=67, Emax=157',
          'TANDEMBOX chipboard N: LW 242-266, 267-286, 287-316: A=35, Emin=79, Emax=180; >=317: A=28, Emin=79, Emax=180',
          'TANDEMBOX chipboard M|K|B|C|D: LW 242-266, 267-286, 287-316, >=317: A=35, Emin=79, Emax=180',
          'TANDEMBOX steel N: LW 287-316, >=317: A=28, Emin=79, Emax=180',
          'TANDEMBOX steel M|K|B|C|D: LW 267-286, 287-316, >=317: A=35, Emin=79, Emax=180',
        ],
        'A = bottom edge of cabinet profile to bottom edge of drive unit; Emin/Emax = distance from bottom edge of cabinet top panel to the fixing position of the cabinet profile; mm. Not listed = not possible',
        386,
      ),
      crossBarNote: txt('The cross bar must be connected to the work plate to make it secure', 'Installation requirement printed with the cabinet position drawing', 386),
      baseXChipboard: mm('NL - 1', 'Drilling distances, chipboard back: X; NL = nominal length', 387),
      baseYChipboard: mm('NL + 34', 'Chipboard back: min space requirement Y', 387),
      baseXSteel: mm('NL - 18', 'Steel back: X', 387),
      baseYSteel: mm('NL + 17', 'Steel back: Y', 387),
      baseDrillingSpacing: mm(96, 'Dimension 96 shown in the drilling drawing', 387),
      baseMin: mm(11, 'Printed "min 11" in the drilling drawing; reference not legible', 387),
      engagementTable: txt(zTable(STANDARD_Z_ROWS, Z_BANDS, Z_FIELDS), `Dimension of engagement Z with lever extension / trigger guidance / lever cap. ${zSymbolLegend}`, 387),
      ...frontBumperDims(386),
      ...housingDims(387),
    },
    drilling: [],
    notes: [
      'Cabinet drawing on page 386 shows additional dimensions 96, 32, 170, X, E, A that are not clearly referenced and are not transcribed.',
      'unverified: min 11 and 96 on the drilling distances drawing (page 387) have no clear reference edge.',
      housingNote,
    ],
    pages: [384, 385, 386, 387],
  };
}

const unoMarketRowsBottom: [string, string, string, string][] = [
  ['E', 'Europe', 'A', 'DE|EN|FR|IT|NL'],
  ['E', 'Europe', 'B', 'DA|EN|FI|NO|SV'],
  ['E', 'Europe', 'C', 'EL|EN|HR|SL|SR|TR'],
  ['E', 'Europe', 'D', 'EN|ES|FR|IT|PT'],
  ['E', 'Europe', 'E', 'CS|HU|PL|SK'],
  ['E', 'Europe', 'F', 'RU|UK'],
  ['B', 'GB', 'A', 'DE|EN|FR|IT|NL'],
  ['B', 'GB', 'I', 'EN'],
  ['K', 'AU', 'I', 'EN'],
  ['N', 'CN', 'H', 'EN|ZH|KO'],
  ['U', 'US|CA', 'G', 'EN|ES|FR'],
  ['U', 'JP', 'J', 'JA'],
];

function unoBottom(): FittingVariant {
  return {
    id: 'servo-drive-uno-bottom-waste-bin',
    name: 'SERVO-DRIVE uno - bottom mount waste bin solutions',
    summary: 'Pre-mounted set with plug-in power supply; also for retrofitting',
    choices: { boxSystem: ['LEGRABOX', 'MERIVOBOX', 'TANDEMBOX'], back: ['chipboard', 'steel'], internalCabinetWidthLW: ['>=387'], networkAdapter: ['E', 'B', 'K', 'N', 'U'] },
    parts: [
      ...unoMarketRowsBottom.map(([adapter, market, pkg, langs]) => ({
        role: 'uno-set',
        // part no. pattern as printed: Z10UB00 + network adapter letter + language package letter
        partNo: `Z10UB00${adapter}${pkg}`,
        description: `SERVO-DRIVE uno set, ${market}, languages ${langs}`,
        when: { networkAdapter: adapter, languagePackage: pkg },
        page: 388,
      })),
    ],
    dims: {
      webCode: txt('DQE61A', 'Blum web code', 388),
      setContents: txt(
        ['2 x Blum distance bumper', '1 x Attachment bracket 1 tier', '1 x Drive unit', '1 x Drip protection feature', '1 x Transport protection', '1 x SERVO-DRIVE plug-in power supply unit', '1 x Assembly device', '7 x Screws for Blum distance bumper and attachment bracket'],
        'Consisting of (set is delivered pre-mounted)',
        388,
      ),
      driveUnitAMinLEGRABOX: mm(45, 'LEGRABOX, LW >= 387: A min', 389),
      driveUnitAMaxLEGRABOX: mm(47, 'LEGRABOX, LW >= 387: A max', 389),
      driveUnitAMinMERIVOBOX: mm(28, 'MERIVOBOX, LW >= 387: A min', 389),
      driveUnitAMaxMERIVOBOX: mm(45, 'MERIVOBOX, LW >= 387: A max', 389),
      driveUnitAMinTANDEMBOX: mm(28, 'TANDEMBOX, LW >= 387: A min', 389),
      driveUnitAMaxTANDEMBOX: mm(43, 'TANDEMBOX, LW >= 387: A max', 389),
      baseXChipboard: mm('NL - 45', 'Chipboard back, LEGRABOX | MERIVOBOX | TANDEMBOX: drilling position X; NL = nominal length', 389),
      baseYChipboard: mm('NL + 35', 'Chipboard back: Y min space requirement', 389),
      baseXChipboardOverExtension: mm('NL - 95', 'Chipboard back, MERIVOBOX cabinet profile with over extension: X', 389),
      baseYChipboardOverExtension: mm('NL + 3', 'Chipboard back, MERIVOBOX over extension: Y', 389),
      baseXSteel: mm('NL - 62', 'Steel back, LEGRABOX | MERIVOBOX | TANDEMBOX: X', 389),
      baseYSteel: mm('NL + 18', 'Steel back: Y', 389),
      baseXSteelOverExtension: mm('NL - 112', 'Steel back, MERIVOBOX over extension: X', 389),
      baseYSteelOverExtension: mm('NL + 3', 'Steel back, MERIVOBOX over extension: Y', 389),
      baseZ: mm('LW / 2', 'Dimension of engagement Z; LW = internal cabinet width', 389),
      baseHoleSpacing: mm(96, 'Hole spacing shown in the base drilling drawing', 389),
      baseHoleDiameter: mm(2.5, 'Drill diameter Ø2.5 shown in the base drilling drawing', 389),
    },
    drilling: [],
    notes: [
      'Market list for SERVO-DRIVE uno is in the Information chapter, page 732 (outside this range).',
      'Blum distance bumper position drawing on page 389 has no dimensions.',
    ],
    pages: [388, 389],
  };
}

function unoTop(): FittingVariant {
  const rows: [number, string, string, string][] = [
    [450, 'EA', 'Europe', 'DE|EN|FR|IT|NL'],
    [450, 'KI', 'AU', 'EN'],
    [450, 'UG', 'US|CA', 'EN|ES|FR'],
    [500, 'EA', 'Europe', 'DE|EN|FR|IT|NL'],
    [500, 'BI', 'GB', 'EN'],
    [600, 'EA', 'Europe', 'DE|EN|FR|IT|NL'],
    [600, 'EB', 'Europe', 'DA|EN|FI|NO|SV'],
    [600, 'EE', 'Europe', 'CS|HU|PL|SK'],
    [600, 'BI', 'GB', 'EN'],
    [600, 'KI', 'AU', 'EN'],
    [600, 'UG', 'US|CA', 'EN|ES|FR'],
    [850, 'EB', 'Europe', 'DA|EN|FI|NO|SV'],
    [900, 'EA', 'Europe', 'DE|EN|FR|IT|NL'],
  ];
  const backs: [number, string | null, string | null][] = [
    [450, 'Z30M389S0W', 'Z30M383S0W'],
    [500, 'Z30M439S0W', 'Z30M433S0W'],
    [550, 'Z30M489S0W', 'Z30M483S0W'],
    [600, 'Z30M539S0W', 'Z30M533S0W'],
    [800, null, 'Z30M733S0W'],
    [900, 'Z30M839S0W', 'Z30M833S0W'],
  ];
  const parts: PartNumber[] = rows.map(([kb, code, market, langs]) => ({
    role: 'uno-set',
    partNo: `Z10UT${kb === 850 ? '85' : String(kb / 10).padStart(2, '0')}${code}`,
    description: `SERVO-DRIVE uno set (top mount), KB ${kb}, ${market}, languages ${langs}; available on request`,
    when: { cabinetWidthKB: kb, networkAdapter: code[0], languagePackage: code[1] },
    page: 390,
  }));
  for (const [kb, thin, thick] of backs) {
    if (thin) parts.push({ role: 'special-back-set', partNo: thin, description: 'Special back set, steel, R9006, NL 500, side panel 15/16 mm', when: { cabinetWidthKB: kb, sidePanelThickness: '15/16' }, page: 390 });
    if (thick) parts.push({ role: 'special-back-set', partNo: thick, description: 'Special back set, steel, R9006, NL 500, side panel 18/19 mm', when: { cabinetWidthKB: kb, sidePanelThickness: '18/19' }, page: 390 });
  }
  return {
    id: 'servo-drive-uno-top-waste-bin-tandembox',
    name: 'SERVO-DRIVE uno - top mount waste bin solutions (TANDEMBOX)',
    summary: 'Set with bracket profile and plug-in power supply for top mount waste bin; special back set',
    choices: { cabinetWidthKB: [450, 500, 550, 600, 800, 850, 900], nominalLength: [500], sidePanelThickness: ['15/16', '18/19'], colourBackSet: ['R9006'] },
    parts,
    dims: {
      webCode: txt('DQE6QM', 'Blum web code', 390),
      setContents: txt(
        ['2 x Blum distance bumper', '1 x Bracket profile horizontal', '1 x Bracket profile adapter for drive unit', '1 x Drive unit', '1 x Drip protection feature', '1 x SERVO-DRIVE plug-in power supply unit', '1 x Bracket profile attachment left/right'],
        'SERVO-DRIVE uno set (top mount) consisting of',
        390,
      ),
      specialBackSetContents: txt(['1 x Steel back height M', '1 x Steel back for waste bin pull-out', '1 x Attachment left/right', '1 x Longside gallery rail left/right'], 'Special back set consisting of', 390),
      cabinetWidthKBRange: txt('450-900', 'Cabinet width KB range for bracket profile attachment positions', 391),
      bracketAttachmentX: mm('NL - 96', 'TANDEMBOX, KB 450-900: bracket profile attachment drilling position X', 391),
      bracketAttachmentY: mm('NL + 3', 'TANDEMBOX, KB 450-900: Y min space requirement', 391),
      bracketAttachmentLayout: mm([50, 32, 128, 73, 64, 37], 'Dimensions in the cabinet drawing: NL - 50 overall, 32, 128, 73, 64, 37 (x from the front); individual references not legible', 391),
      distanceBumperRule: txt('When using a 65 kg TANDEMBOX runner, attach four Blum distance bumpers', 'Blum distance bumper quantity rule', 391),
      distanceBumperTriggerPath: mm(2, 'The Blum distance bumper creates and maintains this trigger path', 391),
    },
    drilling: [],
    notes: [
      'Set items are marked available on request (telephone pictograph) on page 390.',
      'Special back set: only 18/19 mm side panel version exists for KB 800.',
      'Part numbers Z10UT45EA ... Z10UT90EA follow the pattern Z10UT + KB/10 + adapter letter + language package letter as printed; KB 850 is printed Z10UT85EB.',
      'unverified: bracket profile attachment drawing numbers (NL - 50, 32, 128, 73, 64, 37) have no explicit reference edges.',
    ],
    pages: [390, 391],
  };
}

function servoAccessories(): FittingVariant {
  return {
    id: 'servo-drive-accessories',
    name: 'SERVO-DRIVE accessories',
    summary: 'Cable holder, synchronisation cable, front/base stabiliser',
    choices: { syncCableLength: [80, 500, 1200, 1600] },
    parts: [
      { role: 'accessory', partNo: 'Z10K0009', description: 'Cable holder, white nylon', page: 392 },
      { role: 'accessory', partNo: 'Z10K008S', description: 'Synchronisation cable 80 mm, white', when: { syncCableLength: 80 }, page: 392 },
      { role: 'accessory', partNo: 'Z10K050S', description: 'Synchronisation cable 500 mm, white', when: { syncCableLength: 500 }, page: 392 },
      { role: 'accessory', partNo: 'Z10K120S', description: 'Synchronisation cable 1200 mm, white', when: { syncCableLength: 1200 }, page: 392 },
      { role: 'accessory', partNo: 'Z10K160S', description: 'Synchronisation cable 1600 mm, white', when: { syncCableLength: 1600 }, page: 392 },
      { role: 'accessory', partNo: 'Z96.10E1', description: 'Front/base stabiliser, EXPANDO, RAL 7037', page: 393 },
    ],
    dims: {
      stabiliserLegraboxX: mm('14 + FA', 'Front/base stabiliser, LEGRABOX drilling distances: X; FA = front overlay', 393),
      stabiliserMerivoboxX: mm('20.5 + FA', 'Front/base stabiliser, MERIVOBOX drilling distances: X', 393),
      stabiliserMinSpaceLegrabox: mm(72, 'LEGRABOX: min 72 mm (* position dimension marked on the drawing)', 393),
      stabiliserMinSpaceMerivobox: mm(105, 'MERIVOBOX: min 105 mm (* position dimension marked on the drawing)', 393),
      stabiliserHoleSpacing: mm(32, 'Hole spacing 32 mm between the two inner holes, LEGRABOX and MERIVOBOX drawings', 393),
      stabiliserDrill: mm(10, 'Hole diameter Ø10 (front) as printed on the LEGRABOX/MERIVOBOX drawings', 393),
      stabiliserLegraboxVertical: mm([51, 28], 'LEGRABOX drawing vertical dimensions: min 51 and 28', 393),
      stabiliserMerivoboxVertical: mm([33.5, 15], 'MERIVOBOX drawing vertical dimensions: min 33.5 and 15', 393),
      stabiliserTandemboxAntaroVertical: mm([47.5, 39.5, 32, 64, 64], 'TANDEMBOX antaro drawing vertical dimensions (min 47.5, 39.5, 32, 64, 64)', 393),
      stabiliserTandemboxAntaroHorizontal: mm([32, 105], 'TANDEMBOX antaro drawing horizontal dimensions: 32 and min 105', 393),
      stabiliserSideEdge: mm(12, 'Dimension 12 at the front thickness side of the drawings', 393),
      stabiliserFrontEdgeMin: mm(10, 'LEGRABOX/MERIVOBOX drawing: min 10', 393),
      stabiliserSectionDims: mm([9, 6, 10], 'Space requirement section dimensions: min 9, 6, Ø10', 393),
    },
    drilling: [],
    notes: ['unverified: reference edges of stabiliser drilling dimensions (page 393) are not clearly legible; see TIP-ON BLUMOTION accessories for the same part with a clearer drawing.'],
    pages: [392, 393],
  };
}

const servoDrive: FittingFamily = {
  id: 'servo-drive',
  kind: 'motion',
  brand: 'Blum',
  name: 'SERVO-DRIVE for LEGRABOX | MERIVOBOX | TANDEMBOX',
  summary: 'Electrical opening support system combined with BLUMOTION',
  variants: [standardCabinet(), spaceTower(), sinkCabinet(), pulloutHorizontal(), pulloutUpper(), unoBottom(), unoTop(), servoAccessories()],
  document: DOC,
  pages: [362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393],
};

// ---------------------------------------------------------------------------------------------
// TIP-ON BLUMOTION
// ---------------------------------------------------------------------------------------------

function profileParts(prefix: string, suffix: string, kgLabel: number, nls: number[], page: number): PartNumber[] {
  return nls.map((nl) => ({
    role: 'cabinet-profile',
    partNo: `${prefix}.${nl * 10 + 1}${suffix}`,
    description: `Cabinet profile left/right, ${kgLabel} kg, NL ${nl}`,
    when: { nominalLength: nl, capacityKg: kgLabel },
    page,
  }));
}

type SetRow = [unit: string, partNo: string, nlRange: string, kg: number, weight: string, note?: string];

function setParts(rows: SetRow[], page: number, contents: string): PartNumber[] {
  return rows.map(([unit, pn, nlr, kg, weight, note]) => ({
    role: 'tip-on-blumotion-set',
    partNo: pn,
    description: `TIP-ON BLUMOTION set unit ${unit}, NL ${nlr}, ${kg} kg profile, pull-out weight ${weight} kg${note ? `, ${note}` : ''}`,
    when: { unit, capacityKg: kg },
    page,
  }));
}

const tipOnBlumotionGlobalDims = (page: number): Record<string, DimSpec> => ({
  frontGapMin: mm(2.5, 'Front gap FS min. for TIP-ON BLUMOTION (trigger range diagram)', page),
});

function tipOnBlumotionLegrabox(): FittingVariant {
  return {
    id: 'tip-on-blumotion-legrabox',
    name: 'TIP-ON BLUMOTION for LEGRABOX',
    summary: 'Mechanical opening support combined with soft close; cabinet profile 750 (40 kg) / 753 (70 kg) BLUMOTION S',
    choices: {
      nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650],
      capacityKg: [40, 70],
      unit: ['S0', 'S1', 'L1', 'L3', 'L5'],
      internalCabinetWidthLW: ['245-293', '>=294'],
    },
    parts: [
      ...profileParts('750', 'S', 40, [270, 300, 350, 400, 450, 500, 550, 600], 396),
      ...profileParts('753', 'S', 70, [450, 500, 550, 600, 650], 396),
      ...setParts(
        [
          ['S0', 'T60L7040', '270-300', 40, '<= 10'],
          ['S1', 'T60L7140', '270-300', 40, '> 10-20'],
          ['L1', 'T60L7340', '350-600', 40, '<= 20', '40 kg profile only'],
          ['L3', 'T60L7540', '350-600', 40, '15-40', '40 kg profile only'],
          ['L5', 'T60L7570', '450-650', 70, '35-70', 'only with 70 kg profile'],
        ],
        396,
        '6a unit, 6b latch left/right, 6e 2x sync adapter',
      ),
      { role: 'tip-on-blumotion-set-sink', partNo: 'T60L9340', description: 'TIP-ON BLUMOTION set sink pull-out unit L1, NL 350-600, 40 kg profile, weight <= 20 kg', when: { unit: 'L1', application: 'sink pull-out', capacityKg: 40 }, page: 396 },
      { role: 'tip-on-blumotion-set-sink', partNo: 'T60L9540', description: 'TIP-ON BLUMOTION set sink pull-out unit L3, NL 350-600, 40 kg profile, weight 15-40 kg', when: { unit: 'L3', application: 'sink pull-out', capacityKg: 40 }, page: 396 },
      { role: 'synchronisation', partNo: 'T60.300D', description: 'Synchronisation, square, RAL 7035, LW 245-293 mm', when: { internalCabinetWidthLW: '245-293' }, page: 396 },
      { role: 'synchronisation-adapter', partNo: 'T60.000D', description: 'Synchronisation adapter, symmetrical, RAL 7035, 2 per set', qty: 2, when: { internalCabinetWidthLW: '>=294' }, page: 396 },
      { role: 'synchronisation', partNo: 'T60.1125W', description: 'Synchronisation linkage, round, grey, cut to size (use with 2 x T60.000D)', when: { internalCabinetWidthLW: '>=294' }, page: 396 },
      { role: 'template', partNo: '65.5631', description: 'Front gap template 2.5 mm for LEGRABOX | MOVENTO, orange', page: 396 },
    ],
    dims: {
      spaceDrawerLength: mm('NL + 3', 'Space requirement in cabinet, drawer / high fronted pull-out: depth requirement; NL = nominal length', 397),
      spaceInnerDrawerLength: mm('NL + 12', 'Space requirement in cabinet, inner drawer / inner pull-out; NL = nominal length', 397),
      heightMDrawerAbove: mm(68, 'Height M drawer: min 68** above reference line (** incl. 2 mm tilt adjustment)', 397),
      heightMDrawerBelow: mm(38, 'Height M drawer: min 38* below reference line (* +1 mm if cabinet profile is installed before the cabinet is assembled)', 397),
      heightMInnerDrawerAbove: mm(66, 'Height M inner drawer: min 66 above reference line', 397),
      heightMInnerDrawerBelow: mm(38, 'Height M inner drawer: min 38* below reference line (* +1 mm if cabinet profile is installed before assembly)', 397),
      sideClearance: mm(20.5, 'Horizontal dimension 20.5 in the space-requirement sections (cabinet side to drawer side, as drawn)', 397),
      screwPositionInnerDrawerVariant1: mm(44, 'Screw position, inner drawer / inner pull-out, variant 1 (dimension from the rear edge as drawn)', 397),
      screwPositionInnerDrawerVariant2: mm(37, 'Screw position, inner drawer / inner pull-out, variant 2', 397),
      linkageCut61: mm('LW - 221', 'Cutting 6.1: square synchronisation (T60.300D), LW 245-293 mm; LW = internal cabinet width', 396),
      linkageCutRound: mm('LW - 247', 'Cutting 6.1: round linkage T60.1125W, LW >= 294 mm (set 6.1)', 396),
      linkageCutRoundSink: mm('LW - 267', 'Cutting 6.2: round linkage T60.1125W for sink pull-out set', 396),
      linkageMaxLW: mm(1372, 'Round linkage suitable up to internal cabinet width LW', 396),
      sinkSetMinLW: mm(314, 'Sink pull-out set 6.2: min internal cabinet width LW for the sync adapter', 396),
      syncMinLW: mm(245, 'Synchronisation for internal cabinet widths LW of 245 mm and wider', 396),
      weightRanges: txt(['S0: pull-out weight <= 10 kg', 'S1: > 10-20 kg', 'L1: <= 20 kg', 'L3: 15-40 kg', 'L5: 35-70 kg'], 'Recommended total weight of the pull-out per unit for optimum opening and closing function', 396),
      ...tipOnBlumotionGlobalDims(397),
    },
    drilling: [],
    notes: [
      'L1 and L3 can only be combined with a 40 kg cabinet profile; L5: only use with 70 kg cabinet profile.',
      'Latch set ZI7.0M07 cannot be used in combination with TIP-ON BLUMOTION.',
      'Front gap template 65.5631 recommended.',
      'To optimise function and increase trigger range, synchronisation is generally recommended; plinth legs must not be placed in the area marked as not permitted on page 397.',
      'Cabinet profile fixing positions: see LEGRABOX pages 248 (outside this range).',
      'unverified: set table assigns NL ranges 270-300 to S0/S1, 350-600 to L1/L3 and 450-650 to L5 by layout; confirm on page 396.',
    ],
    pages: [394, 395, 396, 397],
  };
}

function tipOnBlumotionMerivobox(): FittingVariant {
  return {
    id: 'tip-on-blumotion-merivobox',
    name: 'TIP-ON BLUMOTION for MERIVOBOX',
    summary: 'Cabinet profile 450 (40 kg) / 453 (70 kg) with TIP-ON BLUMOTION',
    choices: {
      nominalLength: [270, 300, 350, 400, 450, 500, 550, 600],
      capacityKg: [40, 70],
      unit: ['S0', 'S1', 'L1', 'L3', 'L5'],
      internalCabinetWidthLW: ['243-296', '>=297'],
    },
    parts: [
      ...profileParts('450', 'B', 40, [270, 300, 350, 400, 450, 500, 550, 600], 398),
      ...profileParts('453', 'B', 70, [450, 500, 550, 600], 398),
      ...setParts(
        [
          ['S0', 'T60H4040', '270-300', 40, '<= 10'],
          ['S1', 'T60H4140', '270-300', 40, '> 10-20'],
          ['L1', 'T60H4340', '350-600', 40, '<= 20', '40 kg profile only'],
          ['L3', 'T60H4540', '350-600', 40, '15-40', '40 kg profile only'],
          ['L5', 'T60H4570', '450-600', 70, '35-70', 'only with 70 kg profile'],
        ],
        398,
        '6a unit, 6b 2x latch symmetrical, 6e 2x sync adapter',
      ),
      { role: 'synchronisation-adapter', partNo: 'T60.000D', description: 'Synchronisation adapter, symmetrical, RAL 7035, 2 per set', qty: 2, when: { internalCabinetWidthLW: '>=297' }, page: 398 },
      { role: 'synchronisation', partNo: 'T60.1125W', description: 'Synchronisation linkage, round, grey, cut to size (use with 2 x T60.000D)', when: { internalCabinetWidthLW: '>=297' }, page: 398 },
      { role: 'synchronisation', partNo: 'T60.300D', description: 'Synchronisation, square, RAL 7035, LW 243-296 mm', when: { internalCabinetWidthLW: '243-296' }, page: 398 },
      { role: 'template', partNo: '65.5627', description: 'Front gap template 2.5 mm for MERIVOBOX | TANDEMBOX, orange', page: 398 },
    ],
    dims: {
      spaceDrawerLength: mm('NL + 3', 'Space requirement in cabinet, drawer / high fronted pull-out; NL = nominal length', 399),
      spaceInnerDrawerLength: mm('NL + 12', 'Space requirement in cabinet, inner drawer / inner pull-out', 399),
      heightMDrawerAbove: mm(54, 'Height M drawer: min 54** above reference line (** incl. 2 mm tilt adjustment)', 399),
      heightMDrawerBelow: mm(54, 'Height M drawer: min 54* below reference line (* +1 mm if cabinet profile is installed before the cabinet is assembled)', 399),
      heightMInnerDrawerAbove: mm(52, 'Height M inner drawer: min 52 above reference line', 399),
      heightMInnerDrawerBelow: mm(54, 'Height M inner drawer: min 54* below reference line (* +1 mm if profile installed before assembly)', 399),
      totalHeightM: mm(103, 'Dimension 103 in the height M section drawings (drawer and inner drawer), reference as drawn', 399),
      sideClearance: mm(28, 'Horizontal dimension 28 in the section drawings (cabinet side to drawer side, as drawn)', 399),
      screwPositionInnerDrawerVariant1: mm(42, 'Screw position, inner drawer / inner pull-out, variant 1', 399),
      screwPositionInnerDrawerVariant2: mm(37, 'Screw position, inner drawer / inner pull-out, variant 2', 399),
      linkageCutRound: mm('LW - 250', 'Cutting 6f: round linkage T60.1125W, LW >= 297 mm; LW = internal cabinet width', 398),
      linkageCutSquare: mm('LW - 224', 'Cutting 6g: square synchronisation T60.300D, LW 243-296 mm', 398),
      linkageMaxLW: mm(1375, 'Round linkage suitable up to internal cabinet width LW', 398),
      syncMinLW: mm(243, 'Synchronisation for internal cabinet widths LW of 243 mm and wider', 398),
      weightRanges: txt(['S0: pull-out weight <= 10 kg', 'S1: > 10-20 kg', 'L1: <= 20 kg', 'L3: 15-40 kg', 'L5: 35-70 kg'], 'Recommended total weight of the pull-out per unit', 398),
      ...tipOnBlumotionGlobalDims(399),
    },
    drilling: [],
    notes: [
      'L1 and L3 can only be combined with a 40 kg cabinet profile; L5: only use with 70 kg cabinet profile.',
      'Latch set ZI7.0M07 cannot be used in combination with TIP-ON BLUMOTION.',
      'Cabinet profile fixing positions: see MERIVOBOX page 289 (outside this range).',
      'unverified: which section drawing the vertical numbers (54**, 54*, 103) belong to is read from the layout.',
    ],
    pages: [398, 399],
  };
}

function tipOnBlumotionTandembox(): FittingVariant {
  return {
    id: 'tip-on-blumotion-tandembox',
    name: 'TIP-ON BLUMOTION for TANDEMBOX',
    summary: 'Cabinet profile 578 (30 kg) / 576 (65 kg) with TIP-ON BLUMOTION; accessories for wide cabinets and high fronts',
    choices: {
      nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650],
      capacityKg: [30, 65],
      unit: ['S0', 'S1', 'L1', 'L3', 'L5'],
      internalCabinetWidthLW: ['238-286', '>=287'],
      cabinetWidthKB: ['<750', '>=750'],
      backHeight: ['N', 'M', 'K', 'B', 'C', 'D'],
    },
    parts: [
      ...profileParts('578', 'M', 30, [270, 300, 350, 400, 450, 500, 550, 600], 400),
      ...profileParts('576', 'M', 65, [450, 500, 550, 600, 650], 400),
      ...setParts(
        [
          ['S0', 'T60B3030', '270-300', 30, '<= 10'],
          ['S1', 'T60B3130', '270-300', 30, '> 10-20'],
          ['L1', 'T60B3330', '350-600', 30, '<= 20', '30 kg profile only'],
          ['L3', 'T60B3530', '350-600', 30, '15-30', '30 kg profile only'],
          ['L5', 'T60B3560', '450-650', 65, '> 30-65', 'only with 65 kg profile'],
        ],
        400,
        '6a unit, 6b latch left/right, 6e 2x sync adapter',
      ),
      { role: 'synchronisation-adapter', partNo: 'T60.000D', description: 'Synchronisation adapter, symmetrical, RAL 7035, 2 per set', qty: 2, when: { internalCabinetWidthLW: '>=287' }, page: 400 },
      { role: 'synchronisation', partNo: 'T60.1125W', description: 'Synchronisation linkage, round, grey, cut to size (use with 2 x T60.000D)', when: { internalCabinetWidthLW: '>=287' }, page: 400 },
      { role: 'synchronisation', partNo: 'T60.300D', description: 'Synchronisation, square, RAL 7035, LW 238-286 mm', when: { internalCabinetWidthLW: '238-286' }, page: 400 },
      { role: 'synchronisation-fixing', partNo: 'T60B000H', description: 'Synchronisation linkage fixing, steel, for KB >= 750 mm', when: { cabinetWidthKB: '>=750' }, page: 400 },
      { role: 'base-support-bracket', partNo: 'Z96.2011', description: 'Base support bracket, nylon RAL 7037, for KB >= 750 mm', when: { cabinetWidthKB: '>=750' }, page: 400 },
      { role: 'front-base-stabiliser', partNo: 'Z96.10E1', description: 'Front/base stabiliser, nylon RAL 7037, EXPANDO', qty: 2, when: { cabinetWidthKB: '>=750' }, page: 400 },
      { role: 'template', partNo: '65.5627', description: 'Front gap template 2.5 mm for MERIVOBOX | TANDEMBOX, orange', page: 400 },
    ],
    dims: {
      spaceDrawerLength: mm('NL + 3', 'Space requirement in cabinet, drawer / high fronted pull-out; NL = nominal length', 401),
      spaceInnerDrawerLength: mm('NL + 12', 'Space requirement in cabinet, inner drawer / inner pull-out', 401),
      spaceYDrawerList: txt(['N 85.5', 'M 101.5', 'K 133.5', 'B 161', 'C 195', 'D 227'], 'Y (mm) by back height for drawer / high fronted pull-out', 401),
      spaceYInnerDrawerList: txt(['M 109', 'K 139.5', 'B 161', 'C 195', 'D 227'], 'Y (mm) by back height for inner drawer / inner pull-out', 401),
      heightMDrawerAbove: mm(65.5, 'Height M drawer: min 65.5 above reference line', 401),
      heightMDrawerBelow: mm(36, 'Height M drawer: min 36* below reference line', 401),
      heightMInnerDrawerAbove: mm(73, 'Height M inner drawer: min 73 above reference line', 401),
      heightMInnerDrawerBelow: mm(36, 'Height M inner drawer: min 36* below reference line', 401),
      sideClearance: mm(37.5, 'Horizontal dimension 37.5 in the section drawings (as drawn)', 401),
      screwPositionInnerDrawerVariant1: mm(42, 'Screw position, inner drawer / inner pull-out, variant 1', 401),
      screwPositionInnerDrawerVariant2: mm(37, 'Screw position, inner drawer / inner pull-out, variant 2', 401),
      linkageCutRound: mm('LW - 240', 'Cutting 6f: round linkage T60.1125W, LW >= 287 mm; LW = internal cabinet width', 400),
      linkageCutSquare: mm('LW - 214', 'Cutting 6g: square synchronisation T60.300D, LW 238-286 mm', 400),
      linkageMaxLW: mm(1365, 'Round linkage suitable up to internal cabinet width LW', 400),
      syncMinLW: mm(238, 'Synchronisation for internal cabinet widths LW of 238 mm and wider', 400),
      linkageFixingMinKB: mm(750, 'Linkage fixing (T60B000H) and base support bracket (Z96.2011) required for cabinet width KB >= 750 mm (pull-outs over a cabinet bottom or cross member)', 402),
      linkageFixingCondition: txt('At 36-39 mm below and with KB >= 750 mm, a TIP-ON BLUMOTION synchronisation fixing and a base support bracket are required to avoid the linkage colliding with the cabinet bottom or cross member; a trial is recommended', 'Note under height M space requirement drawing', 401),
      stabiliserRequired: txt('Front height FH > 300 mm and cabinet width KB >= 750 mm: 2 pcs required', 'Front/base stabiliser Z96.10E1', 403),
      stabiliserRecommended: txt('Front height FH > 300 mm and cabinet width KB < 750 mm: 1 pc recommended', 'Front/base stabiliser Z96.10E1', 403),
      baseDrillLinkageFixingS0S1: mm([108.5, 32], 'Linkage fixing drilling in base, NL 270-300 (units S0 | S1): 108.5 and 32 as dimensioned; reference not legible', 402),
      baseDrillLinkageFixingL: mm([104, 32], 'Linkage fixing drilling in base, NL 350-650 (units L1 | L3 | L5): 104 and 32', 402),
      baseDrillLinkageFixingSink: mm([23, 32, 40], 'Linkage fixing drilling in base, sink cabinet, NL 350-650 (units L1 | L3 | L5): 23, 32 and 40', 402),
      baseSupportBracketFront: txt(['min 50.5 + FA', '39.5', '32', '32', '1/2 of width', 'min 12', 'Ø10'], 'Base support bracket drilling distances - front (values as dimensioned); FA = front overlay', 402),
      stabiliserFrontVertical: txt(['min 50.5 + FA', '39.5', '32'], 'Front/base stabiliser, drilling distances - front, vertical dimensions; FA = front overlay', 403),
      stabiliserFrontHorizontalRequired: txt(['105', '32', '32', '105', '15.5 + FA', '15.5 + FA', 'min 12'], 'Front/base stabiliser (2 pcs, required case): horizontal dimensions as printed; FA = front overlay', 403),
      stabiliserFrontHorizontalRecommended: txt(['1/2', '1/2', '32', 'min 12'], 'Front/base stabiliser (1 pc, recommended case): horizontal dimensions as printed', 403),
      stabiliserSection: mm([12, 6, 10], 'Stabiliser section: min 12, 6, Ø10', 403),
      weightRanges: txt(['S0: pull-out weight <= 10 kg', 'S1: > 10-20 kg', 'L1: <= 20 kg', 'L3: 15-30 kg', 'L5: > 30-65 kg'], 'Recommended total weight of the pull-out per unit', 400),
      ...tipOnBlumotionGlobalDims(401),
    },
    drilling: [],
    notes: [
      'L1 and L3 can only be combined with a 30 kg cabinet profile; L5: only use with 65 kg cabinet profile.',
      'Linkage fixing and base support bracket are for pull-outs over a cabinet bottom or cross member and prevent sagging of the linkage.',
      'Cabinet profile fixing positions: see TANDEMBOX page 334 (outside this range).',
      'unverified: references of the drilling distance numbers on pages 402-403 (108.5, 104, 23, 32, 40, 50.5, 39.5, 105, 15.5) are not clearly stated; recorded as printed in dims only.',
      'unverified: Y by back height table meaning (page 401) is shown against the 3D drawing; exact measured line is not legible.',
    ],
    pages: [400, 401, 402, 403],
  };
}

const tipOnBlumotion: FittingFamily = {
  id: 'tip-on-blumotion',
  kind: 'motion',
  brand: 'Blum',
  name: 'TIP-ON BLUMOTION for LEGRABOX | MERIVOBOX | TANDEMBOX',
  summary: 'Mechanical opening support combined with BLUMOTION soft close; front gap 2.5 mm; synchronisation recommended',
  variants: [tipOnBlumotionLegrabox(), tipOnBlumotionMerivobox(), tipOnBlumotionTandembox()],
  document: DOC,
  pages: [394, 395, 396, 397, 398, 399, 400, 401, 402, 403],
};

// ---------------------------------------------------------------------------------------------
// TIP-ON for LEGRABOX
// ---------------------------------------------------------------------------------------------

const tipOnLegrabox: FittingFamily = {
  id: 'tip-on-legrabox',
  kind: 'motion',
  brand: 'Blum',
  name: 'TIP-ON for LEGRABOX',
  summary: 'Mechanical opening support integrated in the cabinet profile for handle-less fronts',
  variants: [
    {
      id: 'tip-on-legrabox',
      name: 'TIP-ON for LEGRABOX',
      summary: 'Cabinet profile 750 (40 kg) / 753 (70 kg) TIP-ON, optional synchronisation',
      choices: {
        nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650],
        capacityKg: [40, 70],
      },
      parts: [
        ...profileParts('750', 'T', 40, [270, 300, 350, 400, 450, 500, 550, 600], 406),
        ...profileParts('753', 'T', 70, [450, 500, 550, 600, 650], 406),
        { role: 'synchronisation', partNo: 'T57.7400.01', description: 'TIP-ON synchronisation pinion set (locking device, overload locking device, 2 attachments), RAL 7037', page: 406 },
        { role: 'synchronisation', partNo: 'ZST.1160W', description: 'TIP-ON synchronisation linkage, round aluminium, cut to size', page: 406 },
      ],
      dims: {
        spaceDrawerLength: mm('NL + 3', 'Space requirement in cabinet, drawer / high fronted pull-out; NL = nominal length', 407),
        spaceInnerDrawerLength: mm('NL + 12', 'Space requirement in cabinet, inner drawer / inner pull-out', 407),
        heightMDrawerAbove: mm(68, 'Height M drawer: min 68** above reference line (** incl. 2 mm tilt adjustment)', 407),
        heightMDrawerBelow: mm(38, 'Height M drawer: min 38* below reference line (* +1 mm if cabinet profile installed before the cabinet is assembled)', 407),
        heightMInnerDrawerAbove: mm(66, 'Height M inner drawer: min 66 above reference line', 407),
        heightMInnerDrawerBelow: mm(38, 'Height M inner drawer: min 38* below reference line (* +1 mm if cabinet profile installed before assembly)', 407),
        sideClearance: mm(20.5, 'Horizontal dimension 20.5 in the section drawings (as drawn)', 407),
        screwPositionInnerDrawerVariant1: mm(44, 'Screw position, inner drawer / inner pull-out, variant 1', 407),
        screwPositionInnerDrawerVariant2: mm(37, 'Screw position, inner drawer / inner pull-out, variant 2', 407),
        linkageCut: mm('LW - 229', 'Cutting 6f: TIP-ON synchronisation linkage ZST.1160W; LW = internal cabinet width', 406),
        linkageMaxLW: mm(1389, 'Linkage suitable up to internal cabinet width LW', 406),
        frontGapRecommended: mm(3.5, 'Recommended front gap FS for TIP-ON for LEGRABOX', 407),
        syncMinKB: mm(400, 'Synchronisation can be applied for cabinet widths KB of 400 mm and above', 406),
        syncRecommendedKB: mm(600, 'Synchronisation recommended for cabinet widths KB of 600 mm and above', 406),
      },
      drilling: [],
      notes: [
        'Recommended front gap FS 3.5 mm; front stabilisation also recommended for higher and wider fronts.',
        'Cabinet profile fixing positions: see LEGRABOX page 248 (outside this range).',
        'Accessories for TIP-ON for LEGRABOX (steel back, stabilisers, support angle bracket, screws, centre bit, screwdriver) are on LEGRABOX pages 244-247, outside this range.',
        'Page 408 is the Runner systems chapter divider with no product data.',
      ],
      pages: [404, 405, 406, 407],
    },
  ],
  document: DOC,
  pages: [404, 405, 406, 407],
};

export const boxMotion: FittingFamily[] = [servoDrive, tipOnBlumotion, tipOnLegrabox];
