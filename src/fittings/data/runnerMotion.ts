// Blum SERVO-DRIVE, TIP-ON BLUMOTION and TIP-ON for MOVENTO | TANDEM.
// Transcribed from "Catalogue and technical manual 2024/2025", printed pages 462-531.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

// ---------------------------------------------------------------- helpers

type When = Record<string, string | number>;

const part = (role: string, partNo: string, description: string, page: number, when?: When, qty?: number): PartNumber => ({
  role,
  partNo,
  description,
  page,
  ...(when ? { when } : {}),
  ...(qty !== undefined ? { qty } : {}),
});

const dim = (value: DimSpec['value'], meaning: string, page: number, unit?: DimSpec['unit']): DimSpec => ({
  value,
  meaning,
  page,
  ...(unit ? { unit } : {}),
});

// ---------------------------------------------------------------- SERVO-DRIVE shared parts

/** Blum distance bumper, Ø5 / Ø8, qty depends on front height (2 up to 300, 4 from 301). */
const bumperParts = (page: number): PartNumber[] => [
  part('distance-bumper', '993.0530', 'Blum distance bumper Ø5, dark grey', page, { frontHeightBand: 'upTo300' }, 2),
  part('distance-bumper', '993.0530', 'Blum distance bumper Ø5, dark grey', page, { frontHeightBand: 'from301' }, 4),
  part('distance-bumper', '993.0830.01', 'Blum distance bumper Ø8, dark grey', page, { frontHeightBand: 'upTo300' }, 2),
  part('distance-bumper', '993.0830.01', 'Blum distance bumper Ø8, dark grey', page, { frontHeightBand: 'from301' }, 4),
];

/** Adjustable bumpers for inner drawers / inset fronts (pages 484, 494). */
const insetBumperParts = (page: number): PartNumber[] => [
  part('distance-bumper', '993.2000', 'Adjustable bumper Ø10 for TANDEM inner drawer/inset', page, { runner: 'TANDEM' }),
  part('distance-bumper', '298.7600', 'Depth-adjust bumper, MOVENTO inset only, RAL 7037', page, { runner: 'MOVENTO' }),
];

const bracketProfileParts = (page: number): PartNumber[] => [
  part('bracket-profile', 'Z10T650AA', 'Bracket profile 650 mm, with cable', page, { lengthMm: 650 }),
  part('bracket-profile', 'Z10T700AA', 'Bracket profile 700 mm, with cable', page, { lengthMm: 700 }),
  part('bracket-profile', 'Z10T710AA', 'Bracket profile 710 mm, with cable', page, { lengthMm: 710 }),
  part('bracket-profile', 'Z10T750AA', 'Bracket profile 750 mm, with cable', page, { lengthMm: 750 }),
  part('bracket-profile', 'Z10T800AA', 'Bracket profile 800 mm, with cable', page, { lengthMm: 800 }),
  part('bracket-profile', 'Z10T1170A', 'Bracket profile 1170 mm, without cable', page, { lengthMm: 1170 }),
];

const profileAttachParts = (page: number): PartNumber[] => [
  part('bracket-profile-attachment', 'Z10D01E0.01', 'Profile attachment top/bottom, horizontal cross bar', page),
  part('bracket-profile-attachment', 'Z10D01EA.01', 'Profile attachment lower/back, vertical (alt. to above)', page),
];

const driveParts = (page: number): PartNumber[] => [
  part('drive-unit', 'Z10A3000.04', 'SERVO-DRIVE drive unit, incl. lever extension', page),
];

const cableParts = (page: number): PartNumber[] => [
  part('cable', 'Z10K800AE', 'Distribution cable set 8 m, 5 end protectors', page),
  part('cable', 'Z10V100E.01', 'Connecting node set, 2 end protectors', page),
];

/** Power supply unit + flex: part no. = Z10NE04 + mains plug letter + language package letter. */
const PSU: { plug: string; market: string; pkg: string; langs: string; partNo: string }[] = [
  { plug: 'E', market: 'Europe', pkg: 'A', langs: 'DE|EN|FR|IT|NL', partNo: 'Z10NE04EA' },
  { plug: 'E', market: 'Europe', pkg: 'B', langs: 'DA|EN|FI|NO|SV', partNo: 'Z10NE04EB' },
  { plug: 'E', market: 'Europe', pkg: 'C', langs: 'EL|EN|HR|SL|SR|TR', partNo: 'Z10NE04EC' },
  { plug: 'E', market: 'Europe', pkg: 'D', langs: 'EN|ES|FR|IT|PT', partNo: 'Z10NE04ED' },
  { plug: 'E', market: 'Europe', pkg: 'E', langs: 'CS|HU|PL|SK', partNo: 'Z10NE04EE' },
  { plug: 'E', market: 'Europe', pkg: 'F', langs: 'BG|ET|LT|LV|RO|RU|UK', partNo: 'Z10NE04EF' },
  { plug: 'E', market: 'Europe', pkg: 'I', langs: 'EN', partNo: 'Z10NE04EI' },
  { plug: 'B', market: 'GB', pkg: 'A', langs: 'DE|EN|FR|IT|NL', partNo: 'Z10NE04BA' },
  { plug: 'B', market: 'GB', pkg: 'I', langs: 'EN', partNo: 'Z10NE04BI' },
  { plug: 'H', market: 'IN', pkg: 'I', langs: 'EN', partNo: 'Z10NE04HI' },
  { plug: 'I', market: 'IL', pkg: 'A', langs: 'DE|EN|FR|IT|NL', partNo: 'Z10NE04IA' },
  { plug: 'K', market: 'AU', pkg: 'I', langs: 'EN', partNo: 'Z10NE04KI' },
  { plug: 'N', market: 'CN', pkg: 'H', langs: 'EN|ZH|KO', partNo: 'Z10NE04NH' },
  { plug: 'R', market: 'KR', pkg: 'H', langs: 'EN|ZH|KO', partNo: 'Z10NE04RH' },
  { plug: 'S', market: 'BR', pkg: 'K', langs: 'EN|ES|PT', partNo: 'Z10NE04SK' },
  { plug: 'T', market: 'TW', pkg: 'H', langs: 'EN|ZH|KO', partNo: 'Z10NE04TH' },
  { plug: 'U', market: 'US|CA', pkg: 'G', langs: 'EN|ES|FR', partNo: 'Z10NE04UG' },
  { plug: 'U', market: 'JP', pkg: 'J', langs: 'JA', partNo: 'Z10NE04UJ' },
  { plug: 'Z', market: 'ZA', pkg: 'I', langs: 'EN', partNo: 'Z10NE04ZI' },
];

const psuParts = (page: number): PartNumber[] => [
  ...PSU.map((p) =>
    part('power-supply', p.partNo, `PSU + 2 m output flex + mains flex, ${p.market}, ${p.langs}`, page, {
      mainsPlug: p.plug,
      market: p.market,
      languagePackage: p.pkg,
    }),
  ),
  part('power-supply-housing', 'Z10NG000', 'PSU housing, ground mounting, with cover, dark grey', page),
  part('power-supply-housing', 'Z10NG120', 'PSU housing, wall fixing, white grey (alt. to ground)', page),
];

const cableHolder = (page: number): PartNumber =>
  part('accessory', 'Z10K0009', 'Cable holder, white nylon', page);

const syncCables = (page: number, role = 'accessory'): PartNumber[] => [
  part(role, 'Z10K008S', 'Synchronisation cable 80 mm, white', page, { lengthMm: 80 }),
  part(role, 'Z10K050S', 'Synchronisation cable 500 mm, white', page, { lengthMm: 500 }),
  part(role, 'Z10K120S', 'Synchronisation cable 1200 mm, white', page, { lengthMm: 1200 }),
  part(role, 'Z10K160S', 'Synchronisation cable 1600 mm, white', page, { lengthMm: 1600 }),
];

// ---------------------------------------------------------------- SERVO-DRIVE shared dims

const psuSpaceDims = (page: number): Record<string, DimSpec> => ({
  psuGroundEnvelopeLength: dim(300, 'Ground-mounted PSU housing: space envelope, one plan dimension (diagram "Mounting on the ground")', page, 'mm'),
  psuGroundEnvelopeWidth: dim(150, 'Ground-mounted PSU housing: space envelope, other plan dimension', page, 'mm'),
  psuGroundEnvelopeHeight: dim(75, 'Ground-mounted PSU housing: space envelope height', page, 'mm'),
  psuGroundOpening: dim([260, 90], 'Rounded opening shown inside the ground-mount envelope: length 260 x width 90, corner radius R25', page, 'mm'),
  psuWallEnvelopeLength: dim(360, 'Wall-fixed PSU housing: space envelope length (diagram "Wall fixing")', page, 'mm'),
  psuWallEnvelopeHeight: dim(150, 'Wall-fixed PSU housing: space envelope height', page, 'mm'),
  psuWallEnvelopeDepth: dim(75, 'Wall-fixed PSU housing: space envelope depth from the wall', page, 'mm'),
  psuSafetyDistance: dim(30, 'Minimum distance from PSU housing bottom edge (base fixing) and/or front edge (wall fixing) and side edges to neighbouring elements; air must circulate', page, 'mm'),
});

const bumperDims = (page: number): Record<string, DimSpec> => ({
  bumpersFrontHeightUpTo300: dim(2, 'Number of Blum distance bumpers for front height FH up to 300 mm', page),
  bumpersFrontHeightFrom301: dim(4, 'Number of Blum distance bumpers for front height FH from 301 mm', page),
  triggerPath: dim(2, 'Trigger path created and maintained by the Blum distance bumper', page, 'mm'),
  bumperHoleDiameter: dim([5, 8], 'Front hole for Blum distance bumper: Ø5 (Ø8 alternative bumper)', page, 'mm'),
  bumperHoleOffsetFromFrontEdge: dim('FA / 2', 'Bumper hole centre measured from the front edge on the cabinet side; FA = front overlay', page),
  bumperHoleHeightFHunder300: dim('FH / 2', 'FH below 300 mm: single bumper hole position at half of front height FH', page),
  bumperHoleHeightFHover300: dim('20 +/-12', 'FH above 300 mm: bumper hole centre measured from top edge and from bottom edge of front (two holes per side)', page, 'mm'),
});

const baseDrilling = (page: number, opts: { back: boolean }): DrillingRule[] => {
  const rules: DrillingRule[] = [
    {
      id: `base-lower-cabling-${page}`,
      target: 'carcass-bottom',
      label: 'Base drilling pattern, lower cabling',
      reference:
        'x along the hole row from the first (left) Ø10 hole centre; y = offset of that first hole from the dotted row line of the other two holes (diagram, drawn above the row line). Row direction/orientation to cabinet front not stated in text.',
      holes: [
        { x: 0, y: 6, diameter: 10, note: 'depth BT not stated for this hole' },
        { x: 35.5, y: 0, diameter: 10, depth: 8, note: '96 mm before the third hole' },
        { x: 131.5, y: 0, diameter: 10, depth: 8, note: '131.5 from first hole' },
      ],
      page,
    },
    {
      id: `base-minipress-${page}`,
      target: 'carcass-bottom',
      label: 'Alternative base pattern for MINIPRESS top | MINIPRESS',
      reference: 'x along the hole row from the Ø25 hole centre (diagram); all holes on one row line',
      holes: [
        { x: 0, y: 0, diameter: 25, note: 'depth not stated' },
        { x: 32, y: 0, diameter: 10, depth: 8, note: '96 mm before the last hole' },
        { x: 128, y: 0, diameter: 10, depth: 8, note: '128 from Ø25 hole' },
      ],
      page,
    },
  ];
  if (opts.back) {
    rules.splice(1, 0, {
      id: `base-back-cabling-${page}`,
      target: 'carcass-bottom',
      label: 'Base drilling pattern, back cabling',
      reference: 'x along the hole row from the first Ø10 hole centre (diagram)',
      holes: [
        { x: 0, y: 0, diameter: 10, depth: 8 },
        { x: 96, y: 0, diameter: 10, depth: 8 },
      ],
      page,
    });
  }
  return rules;
};

const frontBumperDrilling = (page: number): DrillingRule[] => [
  {
    id: `front-bumper-fh-under-300-${page}`,
    target: 'front',
    label: 'Blum distance bumper hole, FH up to 300 mm (2 bumpers)',
    reference:
      'x = FA / 2 from the front edge on the cabinet-side (FA = front overlay); y = FH / 2 from top edge. Formulas, not fixed numbers: x and y below are placeholders (0).',
    holes: [{ x: 0, y: 0, diameter: 5, note: 'Ø5 (Ø8 alternative); x = FA/2, y = FH/2; one at each side of front' }],
    page,
  },
  {
    id: `front-bumper-fh-over-300-${page}`,
    target: 'front',
    label: 'Blum distance bumper holes, FH from 301 mm (4 bumpers)',
    reference:
      'x = FA / 2 from the front edge on the cabinet-side (FA = front overlay); y = 20 +/-12 from top edge and from bottom edge. x is a formula, placeholder 0.',
    holes: [
      { x: 0, y: 20, diameter: 5, note: 'Ø5 (Ø8 alternative); x = FA/2; y 20 +/-12 from top edge' },
      { x: 0, y: 20, diameter: 5, note: 'same, measured from bottom edge of front' },
    ],
    page,
  },
];

type Row = { runner: 'movento' | 'tandem'; band: string; A?: number; Emin?: number; Emax?: number };
const posDims = (page: number, rows: Row[]): Record<string, DimSpec> => {
  const out: Record<string, DimSpec> = {};
  for (const r of rows) {
    const k = `${r.runner}_${r.band}`;
    if (r.A !== undefined)
      out[`driveUnitA_${k}`] = dim(r.A, `${r.runner.toUpperCase()}, SKH >= 79, ${r.band}: A = distance bottom edge of cabinet profile to bottom edge of drive unit`, page, 'mm');
    if (r.Emin !== undefined)
      out[`driveUnitEmin_${k}`] = dim(r.Emin, `${r.runner.toUpperCase()}, ${r.band}: E min = distance bottom edge of cabinet top panel to fixing position of the runner (minimum)`, page, 'mm');
    if (r.Emax !== undefined)
      out[`driveUnitEmax_${k}`] = dim(r.Emax, `${r.runner.toUpperCase()}, ${r.band}: E max = same distance, maximum`, page, 'mm');
  }
  return out;
};

const zDims = (page: number, z: { m: (number | string | null)[]; t: (number | string | null)[] }): Record<string, DimSpec> => {
  const bands = ['lw224to234', 'lw235to388', 'lw389to428', 'lwGE429'];
  const out: Record<string, DimSpec> = {};
  (['m', 't'] as const).forEach((r) => {
    const name = r === 'm' ? 'movento' : 'tandem';
    z[r].forEach((v, i) => {
      if (v === null) return;
      const lever = i === 0 ? 'lever extension: not applicable ("–" in table)' : 'lever extension required';
      out[`engagementZ_${name}_${bands[i]}`] = dim(v, `${name.toUpperCase()}, SKH >= 79, internal cabinet width LW band ${bands[i]}: Z = dimension of engagement; ${lever}`, page, 'mm');
    });
  });
  return out;
};

const hdr = (page: number): Record<string, DimSpec> => ({
  skhMin: dim(79, 'Drawer height SKH: all SERVO-DRIVE planning tables apply to SKH >= 79', page, 'mm'),
});

const PLNOTE = 'PL = LH - 10 mm, rounded down to the nearest tenth (as printed); LH = internal cabinet height, PL = bracket profile length';

// ---------------------------------------------------------------- SERVO-DRIVE variants

const servoStandard: FittingVariant = {
  id: 'servo-standard-cabinet',
  name: 'Standard cabinet (bracket profile)',
  summary: 'Electrical opening support with vertical bracket profile; cross bar horizontal or vertical',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    crossBar: ['horizontal', 'vertical'],
    bracketProfileLengthMm: [650, 700, 710, 750, 800, 1170],
    frontHeightBand: ['upTo300', 'from301'],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bumperParts(464),
    ...bracketProfileParts(464),
    ...profileAttachParts(464),
    ...driveParts(464),
    ...cableParts(464),
    ...psuParts(465),
    cableHolder(465),
    ...syncCables(465),
  ],
  dims: {
    ...hdr(466),
    bracketProfileLength: dim('LH - 10', 'Bracket profile length PL; LH = internal cabinet height; round down to nearest tenth', 466, 'mm'),
    bracketProfileCutting: dim('LH - 10', 'Bracket profile is cut to size: internal cabinet height LH minus 10 mm (profile 1170 mm "for cutting to size")', 464, 'mm'),
    ...posDims(466, [
      { runner: 'movento', band: 'lw235to428', A: 60, Emin: 74 },
      { runner: 'movento', band: 'lwGE429', A: 35, Emin: 49 },
      { runner: 'tandem', band: 'lw224to234', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lw235to428', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lwGE429', A: 35, Emin: 51 },
    ]),
    ...Object.fromEntries(
      Object.entries(
        posDims(468, [
          { runner: 'movento', band: 'lw235to428', A: 60, Emin: 84 },
          { runner: 'movento', band: 'lwGE429', A: 35, Emin: 54 },
          { runner: 'tandem', band: 'lw224to234', A: 55, Emin: 81 },
          { runner: 'tandem', band: 'lw235to428', A: 55, Emin: 81 },
          { runner: 'tandem', band: 'lwGE429', A: 35, Emin: 61 },
        ]),
      ).map(([k, v]) => [`vertical_${k}`, { ...v, meaning: `Vertical cross bar construction. ${v.meaning}` }]),
    ),
    driveUnitTopOffset: dim(52, 'Dimension 52 at the top of the drive-unit position diagram (reference edges not stated in text)', 466, 'mm'),
    horizontalCrossBarDrillX: dim('NL + 16', 'Horizontal cross bar: drilling position X in base/cross bar (SKH >= 79); NL = nominal length', 467),
    horizontalCrossBarMinSpaceY: dim('NL + 30', 'Horizontal cross bar: minimum space requirement Y', 467),
    horizontalCrossBarHoleSpacing: dim(96, 'Horizontal cross bar: spacing shown on the drilling-distance diagram (96)', 467, 'mm'),
    verticalCrossBarDrillX: dim('NL + 16', 'Vertical cross bar: drilling position X (SKH >= 79)', 469),
    verticalCrossBarFrontEdgeT: dim('NL + 31', 'Vertical cross bar: T = position front edge to cross member', 469),
    verticalCrossBarSpacings: dim([192, 36.5], 'Vertical cross bar diagram dimensions (192 and 36.5; reference not stated in text)', 469, 'mm'),
    ...zDims(467, { m: [null, 164, 164, 'LW / 2'], t: [164, 164, 'LW / 2', 'LW / 2'] }),
    ...bumperDims(466),
    ...psuSpaceDims(467),
  },
  drilling: [...baseDrilling(466, { back: true }), ...frontBumperDrilling(466)],
  notes: [
    PLNOTE,
    'MOVENTO is not possible for internal cabinet width LW 224-234 (table shows "–").',
    'Engagement Z table (LW 224-234 | 235-388 | 389-428 | >=429): MOVENTO not possible | 164 | 164 | LW / 2; TANDEM 164 | 164 | LW / 2 | LW / 2. Lever extension required in every band except TANDEM LW 224-234 (shown as "–").',
    'The drive unit includes a pre-assembled lever extension.',
    'Accessories heading footnote 4 "Required for two or more drive units" is printed on page 465 (attached to the Accessories block; assumed to refer to the synchronisation cable).',
    'Bracket profiles 650-800 are supplied with cable, 1170 without; cable can serve as distribution, bracket profile and communications cable.',
    'unverified: the "min 10" dimension in the bumper front section view (page 466) - meaning not stated in text.',
    'unverified: purpose of the "6" offset reference and which axis of the base hole row points to the cabinet front (page 466).',
    'unverified: horizontal cross bar page 467 text gives Y only; diagram X/Z reference edges follow the figure, not stated in words.',
  ],
  pages: [464, 465, 466, 467, 468, 469],
};

const servoSpaceTower: FittingVariant = {
  id: 'servo-space-tower',
  name: 'SPACE TOWER (top or bottom bracket profile)',
  summary: 'SERVO-DRIVE for SPACE TOWER with vertical bracket profile fixed at top or at bottom',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    profilePosition: ['top', 'bottom'],
    bracketProfileLengthMm: [650, 700, 710, 750, 800, 1170],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bracketProfileParts(470),
    ...profileAttachParts(470),
    ...driveParts(470),
    ...cableParts(470),
    ...psuParts(471),
    cableHolder(471),
  ],
  dims: {
    ...hdr(472),
    bracketProfileLength: dim('LH - 10', 'Bracket profile length PL; LH = internal cabinet height; round down to nearest tenth', 472, 'mm'),
    ...posDims(472, [
      { runner: 'movento', band: 'lw235to428', A: 60, Emin: 74 },
      { runner: 'movento', band: 'lwGE429', A: 35, Emin: 49 },
      { runner: 'tandem', band: 'lw224to234', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lw235to428', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lwGE429', A: 35, Emin: 51 },
    ]),
    topProfileDrillX: dim('NL + 16', 'Top bracket profile: drilling position X in base/cross bar', 473),
    topProfileFrontEdgeT: dim('NL + 31', 'Top bracket profile: T = position front edge to cross member', 473),
    topProfileSpacings: dim([192, 36.5], 'Top bracket profile diagram dimensions (192 and 36.5; reference not stated in text)', 473, 'mm'),
    bottomProfileDrillX: dim('NL + 16', 'Bottom bracket profile: drilling position X in base/cross bar', 475),
    bottomProfileMinSpaceY: dim('NL + 30', 'Bottom bracket profile: minimum space requirement Y', 475),
    ...zDims(473, { m: [null, 164, 164, 'LW / 2'], t: [164, 164, 'LW / 2', 'LW / 2'] }),
    ...psuSpaceDims(473),
  },
  drilling: [...baseDrilling(472, { back: true })],
  notes: [
    PLNOTE,
    'Page 470 order information lists no Blum distance bumper or synchronisation cable for SPACE TOWER.',
    'MOVENTO is not possible for internal cabinet width LW 224-234.',
    'Position tables are identical for top (p.472) and bottom (p.474) bracket profile; the bottom-profile base drilling pattern (p.474) is the same as p.472.',
  ],
  pages: [470, 471, 472, 473, 474, 475],
};

const servoSink: FittingVariant = {
  id: 'servo-sink-cabinet',
  name: 'Sink cabinet (attachment bracket 1 tier)',
  summary: 'SERVO-DRIVE with attachment bracket and drip protection; pull-outs with cut-out around centre piece',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    frontHeightBand: ['upTo300', 'from301'],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bumperParts(476),
    part('attachment-bracket', 'Z10D0311', 'Attachment bracket 1 tier, nylon', 476),
    ...driveParts(476),
    part('accessory', 'Z10D0316', 'Drip protection feature, dark grey', 476),
    ...cableParts(476),
    ...psuParts(477),
    cableHolder(477),
  ],
  dims: {
    ...hdr(478),
    ...posDims(478, [
      { runner: 'movento', band: 'lwGE429', A: 35 },
      { runner: 'tandem', band: 'lwGE429', A: 35 },
    ]),
    centrePieceDistanceWMin: dim(100, 'W = distance between front edge of drawer base and back edge of centre piece; minimum', 478, 'mm'),
    crossMemberDrillX: dim('W + 24', 'Cross member attachment bracket: drilling position X measured from cabinet front edge (LW >= 429)', 478),
    crossMemberEngagementZ: dim('LW / 2', 'Cross member: dimension of engagement Z (LW >= 429)', 478),
    crossMemberHole: dim(10, 'Cross member drilling Ø10, depth BT = 8', 478, 'mm'),
    baseDrillX: dim('NL + 16', 'Base attachment bracket: drilling position X (SKH >= 79)', 479),
    baseMinSpaceY: dim('NL + 30', 'Base attachment bracket: minimum space requirement Y', 479),
    baseEngagementZ: dim('LW / 2', 'Base attachment bracket: dimension of engagement Z', 479),
    ...bumperDims(478),
    ...psuSpaceDims(479),
  },
  drilling: [...baseDrilling(478, { back: false }), ...frontBumperDrilling(478)],
  notes: [
    'Planning values shown only for internal cabinet width LW >= 429 mm.',
    'unverified: cross-member diagram values "min 14", "min 81" and "96" (page 478) - reference edges not readable as text.',
    'Sink variant lists only the lower-cabling base pattern plus MINIPRESS alternative.',
  ],
  pages: [476, 477, 478, 479],
};

const servoTwoDrawers: FittingVariant = {
  id: 'servo-two-drawers-continuous-front',
  name: 'Two drawers with a continuous front',
  summary: 'Synchronised triggering of two drive units; attachment bracket 1 tier',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    frontHeightBand: ['upTo300', 'from301'],
    synchronisationCableMm: [80, 500, 1200, 1600],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bumperParts(480),
    part('attachment-bracket', 'Z10D0311', 'Attachment bracket 1 tier, nylon', 480),
    ...driveParts(480),
    ...cableParts(480),
    ...psuParts(481),
    cableHolder(481),
    ...syncCables(481, 'synchronisation-cable'),
  ],
  dims: {
    ...hdr(482),
    ...posDims(482, [
      { runner: 'movento', band: 'lwGE429', A: 35 },
      { runner: 'tandem', band: 'lwGE429', A: 35 },
    ]),
    baseDrillX: dim('NL + 16', 'Base attachment bracket: drilling position X (SKH >= 79)', 482),
    baseMinSpaceY: dim('NL + 30', 'Base attachment bracket: minimum space requirement Y', 482),
    baseEngagementZ: dim('LW / 2', 'Base attachment bracket: dimension of engagement Z', 482),
    ...bumperDims(482),
    ...psuSpaceDims(483),
  },
  drilling: [...baseDrilling(482, { back: true }), ...frontBumperDrilling(482)],
  notes: [
    'Synchronisation cable connects two drive units that need to activate simultaneously.',
    'Planning values shown only for internal cabinet width LW >= 429 mm.',
  ],
  pages: [480, 481, 482, 483],
};

const servoInnerDrawer: FittingVariant = {
  id: 'servo-different-depths-inner-drawer',
  name: 'Different drawer depths | inner drawer',
  summary: 'SERVO-DRIVE with attachment bracket and horizontal bracket profile',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    frontHeightBand: ['upTo300', 'from301'],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bumperParts(484),
    ...insetBumperParts(484),
    part('attachment-bracket', 'Z10D0311', 'Attachment bracket 1 tier, nylon', 484),
    part('bracket-profile', 'Z10T1143B', 'Horizontal bracket profile 1143 mm, aluminium', 484),
    part('bracket-profile-attachment', 'Z10D5210', 'Horizontal profile attachment left/right + drive adapter', 484),
    ...driveParts(484),
    ...cableParts(484),
    ...psuParts(485),
    cableHolder(485),
  ],
  dims: {
    ...hdr(486),
    horizontalProfileLength: dim('LW - 19', 'Horizontal bracket profile cut length; LW = internal cabinet width (profile 1143 mm for cabinet width KB 275-1200 mm)', 484, 'mm'),
    horizontalProfileCabinetWidthKB: dim([275, 1200], 'Cabinet width KB range for horizontal bracket profile Z10T1143B', 484, 'mm'),
    ...zDims(486, { m: [167, 167, 167, 'LW / 2'], t: [167, 167, 'LW / 2', 'LW / 2'] }),
    profileDrillX: dim('NL + FD + 26', 'Horizontal bracket profile: drilling position X; FD = front thickness, NL = nominal length', 487),
    profileMinSpaceY: dim('NL + FD + 36', 'Horizontal bracket profile: minimum space requirement Y', 487),
    profileFixingOffsetD_LW224to428: dim(-5, 'D = distance from cabinet profile fixing position to bracket profile attachment fixing position, LW 224-428 (MOVENTO and TANDEM)', 487, 'mm'),
    profileFixingOffsetD_LWge429: dim(19, 'D, LW >= 429 (MOVENTO and TANDEM)', 487, 'mm'),
    profileAttachmentDimension64: dim(64, 'Dimension 64 shown beside the bracket profile attachment in the drilling-distance diagram (reference not stated in text)', 487, 'mm'),
    attachmentBracketA: dim(35, 'Attachment bracket 1 tier: A = bottom edge of bracket to bottom edge of drive unit (LW >= 429)', 488, 'mm'),
    baseDrillX: dim('NL + 16', 'Base attachment bracket: drilling position X', 488),
    baseMinSpaceY: dim('NL + 30', 'Base attachment bracket: minimum space requirement Y', 488),
    baseEngagementZ: dim('LW / 2', 'Base attachment bracket: dimension of engagement Z', 488),
    innerBumperB_fullExt: dim('16.5 +/-1', 'TANDEM inner drawer, full extension (56xH | 56xF): bumper position B', 486, 'mm'),
    innerBumperC_fullExt: dim('12.0 +/-1', 'TANDEM inner drawer, full extension (56xH | 56xF): bumper position C', 486, 'mm'),
    innerBumperB_singleExt: dim('18.5 +/-0.5', 'TANDEM inner drawer, single extension (55xH | 55xF): bumper position B', 486, 'mm'),
    innerBumperC_singleExt: dim('13.5 +/-0.5', 'TANDEM inner drawer, single extension (55xH | 55xF): bumper position C', 486, 'mm'),
    innerBumperDepthFD13: dim(10.0, 'Drilling depth BT for front thickness FD 13.0 mm', 486, 'mm'),
    innerBumperAdjustFD13: dim('+1.75 / -0.25', 'Adjustment range for FD 13.0 mm', 486, 'mm'),
    innerBumperDepthFD14_5: dim(11.5, 'Drilling depth BT for front thickness FD starting at 14.5 mm', 486, 'mm'),
    innerBumperAdjustFD14_5: dim('+/-1.75', 'Adjustment range for FD starting at 14.5 mm', 486, 'mm'),
    innerBumperDimension10: dim('10 +/-0.1', 'Dimension "10 +/-0.1" shown in the inner-drawer bumper front section (reference not stated in text)', 486, 'mm'),
    ...bumperDims(484),
    ...psuSpaceDims(489),
  },
  drilling: [...baseDrilling(488, { back: false }), ...frontBumperDrilling(484)],
  notes: [
    'Lever extension marked "–" in MOVENTO/TANDEM LW 224-234 columns (not applicable); required in wider bands.',
    'Adjustable bumper 298.7600 (MOVENTO) is for inset applications only; integrated bumper suitable for locking device T51.7601; 993.2000 is adjustable for TANDEM inner drawers and inset fronts.',
    'Horizontal profile attachment accepts chipboard screws and system screws; set = left/right attachment + adapter for drive unit.',
    'Page 488 shows only the lower-cabling base pattern and MINIPRESS alternative.',
    'unverified: which hole of the 6/Ø10 pattern is referenced from the cabinet front (page 488).',
  ],
  pages: [484, 485, 486, 487, 488, 489],
};

const servoIndividual: FittingVariant = {
  id: 'servo-individual-drawer',
  name: 'Cabinet with individual drawer (upper attachment bracket)',
  summary: 'SERVO-DRIVE with upper attachment bracket for a single drawer',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    frontHeightBand: ['upTo300', 'from301'],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...bumperParts(490),
    part('attachment-bracket', 'Z10D6252', 'Upper attachment bracket, steel, drive adapter fitted', 490),
    ...driveParts(490),
    ...cableParts(490),
    ...psuParts(491),
    cableHolder(491),
  ],
  dims: {
    ...hdr(492),
    ...posDims(492, [
      { runner: 'movento', band: 'lw235to428', A: 60, Emin: 100, Emax: 190 },
      { runner: 'movento', band: 'lwGE429', A: 35, Emin: 75, Emax: 165 },
      { runner: 'tandem', band: 'lw224to234', A: 55, Emin: 96, Emax: 187 },
      { runner: 'tandem', band: 'lw235to428', A: 55, Emin: 96, Emax: 187 },
      { runner: 'tandem', band: 'lwGE429', A: 35, Emin: 75, Emax: 167 },
    ]),
    driveUnitDimension170: dim(170, 'Dimension 170 in the position diagram (reference edges not stated in text)', 492, 'mm'),
    bracketHolePositions: dim([0, 32, 64, 96], 'Four fixing holes of the upper attachment bracket, positions along the bracket row from the first hole; diameter not published', 492, 'mm'),
    drillX: dim('NL - 5', 'Drilling position X (SKH >= 79); the diagram also shows "min 11"', 493),
    minSpaceY: dim('NL + 30', 'Minimum space requirement Y', 493),
    drillXMin: dim(11, 'Dimension "min 11" printed with X in drilling-distance diagram', 493, 'mm'),
    ...zDims(493, { m: [null, 164, 164, 'LW / 2'], t: [164, 164, 'LW / 2', 'LW / 2'] }),
    ...bumperDims(492),
    ...psuSpaceDims(493),
  },
  drilling: [...frontBumperDrilling(492)],
  notes: [
    'The cross bar must be connected to the work plate to make it secure (page 492).',
    'MOVENTO is not possible for LW 224-234.',
    'unverified: base drilling X reference edge for "NL - 5" and "min 11" (page 493); diameter of the four bracket holes is not published.',
  ],
  pages: [490, 491, 492, 493],
};

const servoInset: FittingVariant = {
  id: 'servo-inset-fronts',
  name: 'Cabinet with inset fronts',
  summary: 'SERVO-DRIVE with vertical bracket profile for inset fronts',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    bracketProfileLengthMm: [650, 700, 710, 750, 800, 1170],
    mainsPlug: ['E', 'B', 'H', 'I', 'K', 'N', 'R', 'S', 'T', 'U', 'Z'],
  },
  parts: [
    ...insetBumperParts(494),
    ...bracketProfileParts(494),
    ...profileAttachParts(494),
    ...driveParts(494),
    ...cableParts(494),
    ...psuParts(495),
    cableHolder(495),
  ],
  dims: {
    ...hdr(496),
    bracketProfileLength: dim('LH - 10', 'Bracket profile length PL; LH = internal cabinet height; round down to nearest tenth', 496, 'mm'),
    ...posDims(496, [
      { runner: 'movento', band: 'lw235to428', A: 60, Emin: 74 },
      { runner: 'movento', band: 'lwGE429', A: 35, Emin: 49 },
      { runner: 'tandem', band: 'lw224to234', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lw235to428', A: 55, Emin: 71 },
      { runner: 'tandem', band: 'lwGE429', A: 35, Emin: 51 },
    ]),
    drillX: dim('NL + FD + 18', 'Base/cross bar drilling position X; FD = front thickness, NL = nominal length (SKH >= 79)', 497),
    minSpaceY: dim('NL + FD + 34', 'Minimum space requirement Y', 497),
    ...zDims(497, { m: [null, 164, 164, 'LW / 2'], t: [164, 164, 'LW / 2', 'LW / 2'] }),
    innerBumperB_fullExt: dim('16.5 +/-1', 'TANDEM inner drawer, full extension (56xH | 56xF): bumper position B', 496, 'mm'),
    innerBumperC_fullExt: dim('12.0 +/-1', 'TANDEM full extension: bumper position C', 496, 'mm'),
    innerBumperB_singleExt: dim('18.5 +/-0.5', 'TANDEM single extension (55xH | 55xF): bumper position B', 496, 'mm'),
    innerBumperC_singleExt: dim('13.5 +/-0.5', 'TANDEM single extension: bumper position C', 496, 'mm'),
    innerBumperDepthFD13: dim(10.0, 'Drilling depth BT for front thickness FD 13.0 mm', 496, 'mm'),
    innerBumperAdjustFD13: dim('+1.75 / -0.25', 'Adjustment range for FD 13.0 mm', 496, 'mm'),
    innerBumperDepthFD14_5: dim(11.5, 'Drilling depth BT for FD starting at 14.5 mm', 496, 'mm'),
    innerBumperAdjustFD14_5: dim('+/-1.75', 'Adjustment range for FD starting at 14.5 mm', 496, 'mm'),
    triggerPath: dim(2, 'Trigger path created and maintained by the Blum distance bumper', 496, 'mm'),
    ...psuSpaceDims(497),
  },
  drilling: [...baseDrilling(496, { back: true })],
  notes: [
    PLNOTE,
    '993.2000 is the adjustable bumper for TANDEM inner drawers and inset fronts; 298.7600 (MOVENTO) is for inset applications only and suits locking device T51.7601.',
    'MOVENTO is not possible for LW 224-234.',
  ],
  pages: [494, 495, 496, 497],
};

const UNO: { plug: string; market: string; pkg: string; langs: string; partNo: string }[] = [
  { plug: 'E', market: 'Europe', pkg: 'A', langs: 'DE|EN|FR|IT|NL', partNo: 'Z10UB00EA' },
  { plug: 'E', market: 'Europe', pkg: 'B', langs: 'DA|EN|FI|NO|SV', partNo: 'Z10UB00EB' },
  { plug: 'E', market: 'Europe', pkg: 'C', langs: 'EL|EN|HR|SL|SR|TR', partNo: 'Z10UB00EC' },
  { plug: 'E', market: 'Europe', pkg: 'D', langs: 'EN|ES|FR|IT|PT', partNo: 'Z10UB00ED' },
  { plug: 'E', market: 'Europe', pkg: 'E', langs: 'CS|HU|PL|SK', partNo: 'Z10UB00EE' },
  { plug: 'E', market: 'Europe', pkg: 'F', langs: 'BG|ET|LT|LV|RO|RU|UK', partNo: 'Z10UB00EF' },
  { plug: 'B', market: 'GB', pkg: 'A', langs: 'DE|EN|FR|IT|NL', partNo: 'Z10UB00BA' },
  { plug: 'B', market: 'GB', pkg: 'I', langs: 'EN', partNo: 'Z10UB00BI' },
  { plug: 'K', market: 'AU', pkg: 'I', langs: 'EN', partNo: 'Z10UB00KI' },
  { plug: 'N', market: 'CN', pkg: 'H', langs: 'EN|ZH|KO', partNo: 'Z10UB00NH' },
  { plug: 'U', market: 'US|CA', pkg: 'G', langs: 'EN|ES|FR', partNo: 'Z10UB00UG' },
  { plug: 'U', market: 'JP', pkg: 'J', langs: 'JA', partNo: 'Z10UB00UJ' },
];

const servoUno: FittingVariant = {
  id: 'servo-drive-uno',
  name: 'SERVO-DRIVE uno (bottom mount waste bin)',
  summary: 'Pre-mounted set for individual bottom mount waste bin pull-outs; plug-in power supply',
  choices: {
    runner: ['MOVENTO', 'TANDEM'],
    networkAdapter: ['E', 'B', 'K', 'N', 'U'],
    colour: ['TGR'],
  },
  parts: UNO.map((u) =>
    part('set', u.partNo, `SERVO-DRIVE uno set, ${u.market}, ${u.langs}`, 498, {
      networkAdapter: u.plug,
      market: u.market,
      languagePackage: u.pkg,
    }),
  ),
  dims: {
    setContents: dim(
      ['2 x Blum distance bumper', '1 x attachment bracket 1 tier', '1 x drive unit', '1 x drip protection feature', '1 x transport protection', '1 x plug-in power supply unit', '1 x assembly device', '7 x screws for bumper and bracket'],
      'Contents of the SERVO-DRIVE uno set (set pre-mounted)',
      498,
    ),
    minAttachmentBracketA: dim(35, 'A = distance bottom edge of attachment bracket to bottom edge of drive unit; shown as "min A" (LW >= 429; MOVENTO and TANDEM)', 499, 'mm'),
    drillX: dim('NL - 48', 'Base drilling position X (LW >= 429; MOVENTO and TANDEM)', 499),
    minSpaceY: dim('NL + 30', 'Minimum space requirement Y', 499),
    engagementZ: dim('LW / 2', 'Dimension of engagement Z', 499),
    pilotHoleDiameter: dim(2.5, 'Pilot hole Ø in base drilling diagram', 499, 'mm'),
    pilotHoleSpacing: dim(96, 'Spacing shown between the pilot holes in base drilling diagram', 499, 'mm'),
    triggerPath: dim(2, 'Trigger path created and maintained by the Blum distance bumper', 499, 'mm'),
  },
  drilling: [],
  notes: [
    'Planning values shown only for internal cabinet width LW >= 429 mm.',
    'Other market/language combinations available upon request; detailed market list on page 732 (outside range).',
    'unverified: number of Ø2.5 pilot holes and their orientation relative to X and Z (page 499) - only 96 spacing and Ø2.5 are labelled.',
  ],
  pages: [498, 499],
};

const servoAccessories: FittingVariant = {
  id: 'servo-accessories',
  name: 'Accessories',
  choices: { synchronisationCableMm: [80, 500, 1200, 1600] },
  parts: [cableHolder(500), ...syncCables(500, 'synchronisation-cable')],
  dims: {},
  drilling: [],
  notes: ['Cable holder e.g. for fixing the SERVO-DRIVE distribution cable; synchronisation cable connects two drive units that need to activate simultaneously.'],
  pages: [500],
};

export const servoDrive: FittingFamily = {
  id: 'servo-drive-movento-tandem',
  kind: 'motion',
  brand: 'Blum',
  name: 'SERVO-DRIVE for MOVENTO | TANDEM',
  summary: 'Electrical opening support for MOVENTO and TANDEM pull-outs, combined with BLUMOTION',
  variants: [servoStandard, servoSpaceTower, servoSink, servoTwoDrawers, servoInnerDrawer, servoIndividual, servoInset, servoUno, servoAccessories],
  document: DOC,
  pages: Array.from({ length: 40 }, (_, i) => 462 + i),
};

// ---------------------------------------------------------------- TIP-ON BLUMOTION for MOVENTO

const nl760 = [270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600];
const nl766_70 = [450, 500, 520, 550, 580, 600, 650];
const nl766_60 = [700, 750];

const runnerParts = (prefix: string, suffix: string, nls: number[], when: (nl: number) => When, page: number, descr: string): PartNumber[] =>
  nls.map((nl) => part('runner-pair', `${prefix}${String(nl).padStart(4, '0')}${suffix}`, `${descr} NL ${nl} left/right pair`, page, when(nl)));

const tipOnBlumotion: FittingVariant = {
  id: 'tip-on-blumotion-movento-760h-766h',
  name: 'MOVENTO with TIP-ON BLUMOTION - 760H | 766H',
  summary: 'Concealed full extension, switchable BLUMOTION S, mechanical TIP-ON BLUMOTION opening support',
  choices: {
    nominalLength: [270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 580, 600, 650, 700, 750],
    capacityKg: [40, 60, 70],
    version: ['BLUMOTION S'],
    tipOnSet: ['S0', 'S1', 'L1', 'L3', 'L5'],
  },
  parts: [
    ...runnerParts('760H', 'S', nl760, (nl) => ({ nominalLength: nl, capacityKg: 40 }), 504, 'MOVENTO 760H 40 kg BLUMOTION S'),
    ...runnerParts('766H', 'S', nl766_70, (nl) => ({ nominalLength: nl, capacityKg: 70 }), 504, 'MOVENTO 766H 70 kg BLUMOTION S'),
    ...runnerParts('766H', 'S', nl766_60, (nl) => ({ nominalLength: nl, capacityKg: 60 }), 504, 'MOVENTO 766H 60 kg BLUMOTION S'),
    part('locking-device', 'T51.7601', 'Locking device, orange, order left/right', 504),
    part('tip-on-set', 'T60L7040', 'TIP-ON BLUMOTION set S0, pull-out weight up to 10 kg', 504, { tipOnSet: 'S0', capacityKg: 40 }),
    part('tip-on-set', 'T60L7140', 'TIP-ON BLUMOTION set S1, weight over 10 to 20 kg', 504, { tipOnSet: 'S1', capacityKg: 40 }),
    part('tip-on-set', 'T60L7340', 'TIP-ON BLUMOTION set L1, up to 20 kg, 40 kg runner only', 504, { tipOnSet: 'L1', capacityKg: 40 }),
    part('tip-on-set', 'T60L7540', 'TIP-ON BLUMOTION set L3, 15 to 40 kg, 40 kg runner only', 504, { tipOnSet: 'L3', capacityKg: 40 }),
    part('tip-on-set', 'T60L7570', 'TIP-ON BLUMOTION set L5, 35 to 70 kg, 60|70 kg runner', 504, { tipOnSet: 'L5' }),
    part('synchronisation', 'T60.300D', 'Synchronisation, square, RAL 7035, LW 265-313', 504, { lwBand: '265-313' }),
    part('synchronisation', 'T60.000D', 'Synchronisation adapter, symmetrical, RAL 7035', 504, { lwBand: 'ge314' }, 2),
    part('synchronisation', 'T60.1125W', 'Synchronisation linkage, round, grey, cut to size', 504, { lwBand: 'ge314' }),
    part('accessory', '65.5631', 'Front gap template 2.5 mm for LEGRABOX | MOVENTO', 504),
  ],
  dims: {
    nominalLength760: dim(nl760, 'Nominal lengths NL available for 760H (40 kg)', 504, 'mm'),
    nominalLength766_70kg: dim(nl766_70, 'Nominal lengths NL available for 766H at 70 kg dynamic carrying capacity', 504, 'mm'),
    nominalLength766_60kg: dim(nl766_60, 'Nominal lengths NL available for 766H at 60 kg dynamic carrying capacity', 504, 'mm'),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement in cabinet depth for the drawer (drawer view)', 505),
    internalDrawerWidth: dim('LW - 42', 'Internal drawer width SKW; LW = internal cabinet width; tolerance +0.0 / -1.5 mm', 505),
    internalDrawerWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW = LW - 42', 505, 'mm'),
    drawerLength: dim('NL - 10', 'Drawer length SKL; NL = nominal length', 505),
    innerDrawerLength: dim('SKL + X', 'Inner drawer length ISKL; X = front thickness', 505),
    innerDrawerSpaceDepth: dim('NL + X + 7', 'Inner drawer: space requirement depth (X = front thickness)', 505),
    drawerSidePanelThicknessMax: dim(16, 'Drawer side panel thickness "max 16*" (limited side adjustment at 16 mm, but full tolerance use of SKW)', 505, 'mm'),
    sideClearance21: dim(21, 'Cross-section value 21 (cabinet-side clearance; reference edges not stated in text)', 505, 'mm'),
    sideClearanceMin28_5: dim(28.5, 'Cross-section "min 28.5" (reference edges not stated in text)', 505, 'mm'),
    heightMin38: dim(38, 'Cross-section "min 38*"; +1 mm for assembly of runners before cabinet assembly', 505, 'mm'),
    clearanceMin7: dim(7, 'Cross-section "min 7" above drawer (reference edges not stated in text)', 505, 'mm'),
    drawerSideToRunnerRange: dim([12, 15], 'Cross-section value 12-15 (reference edges not stated in text)', 505, 'mm'),
    drawerHoleSpacing: dim([37, 32, 18, 10], 'Drawer view dimensions 37, 32, 10 and (inner drawer) 18, X + 23 (reference edges not stated in text)', 505, 'mm'),
    synchronisationMinLW: dim(265, 'Synchronisation for internal cabinet widths LW of 265 mm and wider', 504, 'mm'),
    synchronisationAdapterLWmin: dim(314, 'Adapters 6e + linkage 6f used for LW >= 314 mm; 6g square synchronisation for LW 265-313', 504, 'mm'),
    synchronisationSquareCut: dim('LW - 241', 'Cut length of synchronisation 6g (T60.300D), LW 265-313', 504, 'mm'),
    synchronisationLinkageCut: dim('LW - 267', 'Cut length of synchronisation linkage 6f (T60.1125W)', 504, 'mm'),
    synchronisationLinkageMaxLW: dim(1392, 'Linkage suitable up to internal cabinet width LW', 504, 'mm'),
    frontGap: dim(2.5, 'Front gap FS achievable with TIP-ON BLUMOTION (front gap template 65.5631)', 504, 'mm'),
    weightRangeS0: dim('<= 10', 'Recommended total pull-out weight for set S0 (270-320 mm, 40 kg runner)', 504, 'kg'),
    weightRangeS1: dim('> 10-20', 'Recommended weight for set S1 (270-320 mm)', 504, 'kg'),
    weightRangeL1: dim('<= 20', 'Recommended weight for set L1 (350-600 mm; only with 40 kg cabinet profile)', 504, 'kg'),
    weightRangeL3: dim('15-40', 'Recommended weight for set L3 (350-600 mm; only with 40 kg cabinet profile)', 504, 'kg'),
    weightRangeL5: dim('35-70', 'Recommended weight for set L5 (450-750 mm; use with 60|70 kg runner)', 504, 'kg'),
    lockingDeviceDrilling: dim([75, 12.5, 11, 10, 7, 6], 'Drawer assembly diagram values (75; 12.5; 11; drill depth 10; 7; Ø6) - use drilling template T65.1000.02; reference edges not stated in text', 505, 'mm'),
  },
  drilling: [],
  notes: [
    'To optimise function and increase trigger range, synchronisation is generally recommended.',
    'TIP-ON BLUMOTION set contents: 6a unit left/right, 6b latch left/right, 6e 2 x synchronisation adapter (for LW >= 314).',
    'Use drilling template T65.1000.02 for the drawer assembly.',
    'Runner attachment: see MOVENTO attachment pages 428 (outside this range).',
    'unverified: drawer-assembly dimensions 75, 12.5, 11, 7 (page 505) have no stated reference edges; not entered as drilling rules.',
    'unverified: 40 kg 760H column also lists lengths 270-320 only for sets S0/S1; sets L1/L3 350-600 per page 504.',
  ],
  pages: [504, 505],
};

export const tipOnBlumotionMovento: FittingFamily = {
  id: 'tip-on-blumotion-movento',
  kind: 'motion',
  brand: 'Blum',
  name: 'TIP-ON BLUMOTION for MOVENTO',
  summary: 'Mechanical opening support combined with BLUMOTION soft close for MOVENTO',
  variants: [tipOnBlumotion],
  document: DOC,
  pages: [502, 503, 504, 505],
};

// ---------------------------------------------------------------- TIP-ON for MOVENTO | TANDEM

const SCREW = (page: number): PartNumber =>
  part('screw', '661.1450.HG', 'System screw Ø6 x 14.5 mm (screw type B)', page);

const frontAdjuster = (page: number): PartNumber => part('accessory', '295.1000', 'Front adjuster, natural nylon', page, undefined, 2);
const tandemLockingDevice = (page: number): PartNumber => part('locking-device', 'T51.1700.04', 'Locking device, orange, order left/right', page);
const syncLinkage = (page: number): PartNumber => part('synchronisation', 'T57.1140S', 'TIP-ON synchronisation linkage, grey, cut to size', page);

const tandemPlanDims = (page: number, o: { f: boolean; single: boolean; hookPeg: boolean }): Record<string, DimSpec> => ({
  internalDrawerWidth: dim(o.f ? 'LW - 49' : 'LW - 42', 'Internal drawer width SKW; LW = internal cabinet width; tolerance +0.0 / -1.5 mm', page),
  internalDrawerWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW', page, 'mm'),
  drawerLength: dim('NL - 10', 'Drawer length SKL; NL = nominal length', page),
  innerDrawerLength: dim('SKL + X', 'Inner drawer length ISKL; X = front thickness', page),
  spaceRequirementDepth: dim('NL + 3', 'Space requirement depth for the drawer', page),
  innerDrawerSpaceDepth: dim('NL + X + 7', 'Inner drawer space requirement depth (X = front thickness)', page),
  drawerSideThickness: dim(o.f ? [17, 19] : [11, 16], 'Drawer side panel thickness range for this runner', page, 'mm'),
  cabinetSideClearance: dim(o.f ? 24.5 : 21, 'Cross-section value (cabinet-side clearance; reference edges not stated in text)', page, 'mm'),
  clearanceMin7: dim(7, 'Cross-section "min 7" (reference edges not stated in text)', page, 'mm'),
  sideClearanceMin: dim(o.single ? 24.5 : 28.5, 'Cross-section "min" side clearance (reference edges not stated in text)', page, 'mm'),
  heightDimension: dim(o.single ? 34 : 38, 'Cross-section vertical dimension (reference edges not stated in text)', page, 'mm'),
  drawerViewDimensions: dim(o.single ? [37, 10] : [37, 32, 18, 10], 'Drawer view dimensions (37, 32, 18, 10; inner drawer X + 23) - reference edges not stated in text', page, 'mm'),
  ...(o.hookPeg
    ? { sideRange11_13: dim([11, 13], 'Cross-section range 11-13 for hook-and-peg variant (reference edges not stated in text)', page, 'mm') }
    : o.single
      ? { sideMax13: dim(13, 'Cross-section "max 13" for single extension (reference edges not stated in text)', page, 'mm') }
      : { sideRange12_15: dim([12, 15], 'Cross-section range 12-15 (reference edges not stated in text)', page, 'mm') }),
  ...(o.single ? { interchangeDistanceA: dim(3, 'A = 3 mm distance to interchange with full extension', page, 'mm') } : {}),
  triggerFrontGap: dim(3.5, 'Front gap shown in trigger-range diagram', page, 'mm'),
});

const tandemAssemblyDims = (page: number, hookPeg: boolean): Record<string, DimSpec> =>
  hookPeg
    ? {
        pegHoleDiameter: dim([8, 6], 'Hook-and-peg drawer assembly: Ø8 (side peg hole) and Ø6 (peg hole, dimensions 9, 5, 13, 6 in diagram); use drilling template T65.1000.02', page, 'mm'),
        pegAssemblyDims: dim([9, 5, 13, 6], 'Peg drilling diagram values (9, 5, 13, 6) - reference edges not stated in text', page, 'mm'),
        backHoleDims: dim([11, 10, 7, 6], 'Back-panel hole diagram values 11, 10 (depth), 7, Ø6 - reference edges not stated in text', page, 'mm'),
      }
    : {
        lockingDeviceDims: dim([55, 33, 11, 10, 7, 6], 'Drawer assembly diagram values (55, 33, 11, 10 depth, 7, Ø6) - use drilling template T65.1000.02; reference edges not stated in text', page, 'mm'),
      };

const posTable = (page: number, label: string, rows: [number, number, number][], third: string): Record<string, DimSpec> => {
  const out: Record<string, DimSpec> = {};
  for (const [nl, x2, x3] of rows) {
    out[`pegX2_NL${nl}`] = dim(x2, `${label}: pegs X2 for NL ${nl}; measured along drawer side (diagram arrows from drawer front end)`, page, 'mm');
    out[`${third}_NL${nl}`] = dim(x3, `${label}: lift-off stop ${third} for NL ${nl}; measured along drawer side from drawer front end`, page, 'mm');
  }
  return out;
};

const attachDims = (page: number, positions: (number | string)[], runner: string): Record<string, DimSpec> => ({
  runnerAttachmentPositions: dim(
    positions,
    `${runner}: screw hole positions along cabinet side measured from the cabinet front edge (columns of the attachment table); which positions apply to each NL is shown only by symbols in the table`,
    page,
    'mm',
  ),
  runnerAttachmentScrews: dim(
    ['A: chipboard screws Ø4 x 15', 'B: system screws Ø6 x 14.5, 661.1450.HG'],
    'Screw types used in the attachment table (A chipboard, B system)',
    page,
  ),
});

const tandemSync = (page: number, cut: number, max: number): Record<string, DimSpec> => ({
  synchronisationLinkageCut: dim(`LW - ${cut}`, 'Cut length of TIP-ON synchronisation linkage 6f (LW = internal cabinet width)', page, 'mm'),
  synchronisationLinkageMaxLW: dim(max, 'Linkage suitable up to internal cabinet width LW', page, 'mm'),
});

const nlRunnerParts = (series: string, nls: number[], page: number, descr: string, opts: { hook?: boolean; request?: boolean; kg?: number } = {}): PartNumber[] =>
  nls.map((nl) =>
    part('runner-pair', `${series}${opts.hook ? `${String(nl).padStart(3, '0')}1T` : `${String(nl).padStart(4, '0')}T`}`, `${descr} NL ${nl}${opts.request ? ', on request' : ''}`, page, {
      nominalLength: nl,
      capacityKg: opts.kg ?? 30,
    }),
  );

const onRequest = 'Runner lengths marked on request (telephone symbol) in the catalogue; availability not guaranteed.';

const movento760Tip: FittingVariant = {
  id: 'tip-on-movento-760h-766h',
  name: 'MOVENTO with TIP-ON - 760H | 766H',
  summary: 'Concealed full extension with integrated TIP-ON mechanical opening support',
  choices: {
    nominalLength: [250, 270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 580, 600, 650, 700, 750],
    capacityKg: [40, 60, 70],
    version: ['TIP-ON'],
  },
  parts: [
    ...runnerParts('760H', 'T', [250, 270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600], (nl) => ({ nominalLength: nl, capacityKg: 40 }), 510, 'MOVENTO 760H 40 kg TIP-ON'),
    ...runnerParts('766H', 'T', nl766_70, (nl) => ({ nominalLength: nl, capacityKg: 70 }), 510, 'MOVENTO 766H 70 kg TIP-ON'),
    ...runnerParts('766H', 'T', nl766_60, (nl) => ({ nominalLength: nl, capacityKg: 60 }), 510, 'MOVENTO 766H 60 kg TIP-ON'),
    part('locking-device', 'T51.7601', 'Locking device, orange, order left/right', 510),
    part('synchronisation', 'T57.7400.01', 'TIP-ON synchronisation pinion set, RAL 7037', 510),
    part('synchronisation', 'ZST.1160W', 'TIP-ON synchronisation linkage, aluminium, cut to size', 510),
    part('side-stabilisation', 'ZS7M400MU', 'Side stabilisation set up to NL 400, cut to size', 510, { nlUpTo: 400 }),
    part('side-stabilisation', 'ZS7M600MU', 'Side stabilisation set up to NL 600, cut to size', 510, { nlUpTo: 600 }),
    part('side-stabilisation', 'ZS7M750MU', 'Side stabilisation set up to NL 750, cut to size', 510, { nlUpTo: 750 }),
  ],
  dims: {
    nominalLength760: dim([250, 270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600], 'Nominal lengths NL available for 760H (40 kg)', 510, 'mm'),
    nominalLength766_70kg: dim(nl766_70, 'Nominal lengths NL for 766H at 70 kg', 510, 'mm'),
    nominalLength766_60kg: dim(nl766_60, 'Nominal lengths NL for 766H at 60 kg', 510, 'mm'),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement depth for the drawer (NL + 3*; * additional +12 mm with side stabilisation)', 511),
    sideStabilisationExtraDepth: dim(12, 'Additional depth required with side stabilisation (footnote on NL + 3*)', 511, 'mm'),
    internalDrawerWidth: dim('LW - 42', 'Internal drawer width SKW; tolerance +0.0 / -1.5 mm', 511),
    drawerLength: dim('NL - 10', 'Drawer length SKL', 511),
    innerDrawerLength: dim('SKL + X', 'Inner drawer length ISKL; X = front thickness', 511),
    innerDrawerSpaceDepth: dim('NL + X + 7', 'Inner drawer space requirement depth', 511),
    drawerSidePanelThicknessMax: dim(16, 'Drawer side panel thickness "max 16*" (limited side adjustment at 16 mm)', 511, 'mm'),
    crossSection: dim([7, 21, 28.5, 38, 12, 15], 'Cross-section values (min 7; 21; min 28.5; min 38* (+1 mm for runner assembly before cabinet assembly); 12-15) - reference edges not stated in text', 511, 'mm'),
    drawerViewDimensions: dim([37, 32, 18, 10], 'Drawer view dimensions 37, 32, 10 and inner drawer 18, X + 23 - reference edges not stated in text', 511, 'mm'),
    synchronisationLinkageCut: dim('LW - 249', 'Cut length of TIP-ON synchronisation linkage 6f (ZST.1160W)', 510, 'mm'),
    synchronisationLinkageMaxLW: dim(1409, 'Linkage suitable up to internal cabinet width LW', 510, 'mm'),
    sideStabilisationMaxCabinetWidthKB: dim(1400, 'Side stabilisation set suitable for cabinet width KB', 510, 'mm'),
    triggerFrontGap: dim(3.5, 'Front gap shown in trigger-range diagram', 511, 'mm'),
    lockingDeviceDims: dim([75, 12.5, 11, 10, 7, 6], 'Drawer assembly diagram values - use drilling template T65.1000.02; reference edges not stated in text', 511, 'mm'),
  },
  drilling: [],
  notes: [
    'The output path can vary depending on the load or the adjustment.',
    'Synchronisation generally recommended to increase trigger range; side stabilisation recommended for wide pull-outs with a short nominal length.',
    'Runner attachment: see MOVENTO page 428 (outside this range). Use drilling template T65.1000.02.',
    'unverified: drawer-assembly values 75, 12.5, 11, 7 and the cross-section values on page 511 lack stated reference edges.',
  ],
  pages: [510, 511],
};

const nl560h = [250, 270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600];
const nl550h = [270, 300, 350, 400, 450, 500, 550, 600, 650];
const nl56x1h = [260, 285, 310, 335, 360, 385, 410, 435, 460, 485, 510, 535, 560];
const nl560f = [250, 270, 300, 350, 400, 450, 500, 550, 600];
const nl550f = [270, 300, 350, 400, 450, 500, 550, 600, 650];
const nl56x1f = [260, 310, 360, 410, 460, 510, 560];

const t560H: FittingVariant = {
  id: 'tip-on-tandem-560h',
  name: 'TANDEM full extension with TIP-ON - 560H (11-16 mm sides)',
  choices: { nominalLength: nl560h, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['11-16'] },
  parts: [
    ...nlRunnerParts('560H', nl560h, 512, 'TANDEM 560H TIP-ON'),
    tandemLockingDevice(512),
    frontAdjuster(512),
    syncLinkage(512),
    SCREW(528),
  ],
  dims: {
    ...tandemPlanDims(513, { f: false, single: false, hookPeg: false }),
    ...tandemAssemblyDims(513, false),
    ...tandemSync(512, 31, 1171),
    ...attachDims(528, [19, 37, 69, 133, 165, 197, 229, 243, 261, 284, 325, 357, 389, 421, 453, 485, 517, 549], '560H'),
  },
  drilling: [],
  notes: [
    'Runner for wooden drawers with 11-16 mm panel thickness; tool-free height adjustment via locking device; integrated front tilt adjustment.',
    'Synchronisation generally recommended; use drilling template T65.1000.02.',
    'unverified: which attachment positions apply to which NL band (page 528 matrix symbols not transcribed); rows: NL 250-270, 300-320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600.',
    'unverified: cross-section values and drawer-assembly diagram references (pages 513).',
  ],
  pages: [512, 513, 528],
};

const t550H: FittingVariant = {
  id: 'tip-on-tandem-550h',
  name: 'TANDEM single extension with TIP-ON - 550H (11-16 mm sides)',
  choices: { nominalLength: nl550h, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['11-16'] },
  parts: [
    ...nlRunnerParts('550H', nl550h, 514, 'TANDEM 550H TIP-ON'),
    tandemLockingDevice(514),
    frontAdjuster(514),
    syncLinkage(514),
    SCREW(528),
  ],
  dims: {
    ...tandemPlanDims(515, { f: false, single: true, hookPeg: false }),
    ...tandemAssemblyDims(515, false),
    ...tandemSync(514, 31, 1171),
    ...attachDims(528, ['19*', 37, 133, 147, 165, 261, 284, 325, 389], '550H'),
  },
  drilling: [],
  notes: [
    '* position 19 can be replaced with a chipboard screw Ø4 x 15 mm.',
    'unverified: which attachment positions apply to which NL band (page 528 matrix symbols not transcribed); rows: NL 270, 300-450, 500-550, 600, 650.',
    'unverified: cross-section values and drawer-assembly diagram references (page 515).',
  ],
  pages: [514, 515, 528],
};

const t561H: FittingVariant = {
  id: 'tip-on-tandem-561h',
  name: 'TANDEM full extension with TIP-ON - 561H hook and peg (11-16 mm sides)',
  choices: { nominalLength: nl56x1h, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['11-16'] },
  parts: [...nlRunnerParts('561H', nl56x1h, 516, 'TANDEM 561H TIP-ON', { hook: true, request: true }), frontAdjuster(516), syncLinkage(516), SCREW(529)],
  dims: {
    ...tandemPlanDims(517, { f: false, single: false, hookPeg: true }),
    ...tandemAssemblyDims(517, true),
    ...posTable(517, '561H', [[260, 205, 185], [285, 220, 200], [310, 230, 242], [335, 245, 257], [360, 275, 287], [385, 285, 297], [410, 300, 344], [435, 310, 354], [460, 335, 379], [485, 350, 394], [510, 360, 436], [535, 375, 451], [560, 405, 481]], 'liftOffStopX3'),
    ...tandemSync(516, 31, 1171),
    ...attachDims(529, [19, 37, 69, 133, 165, 229, 243, 261, 284, 293, 325, 357, 389, 421, 453, 485, 517], '561H'),
  },
  drilling: [],
  notes: [
    onRequest,
    'Lift-off stop and height adjustment integrated into runner; part numbers follow the pattern 561H{NL}1T (e.g. NL 260 -> 561H2601T).',
    'unverified: which attachment positions apply to which NL (page 529 matrix symbols not transcribed).',
  ],
  pages: [516, 517, 529],
};

const t551H: FittingVariant = {
  id: 'tip-on-tandem-551h',
  name: 'TANDEM single extension with TIP-ON - 551H hook and peg (11-16 mm sides)',
  choices: { nominalLength: nl56x1h, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['11-16'] },
  parts: [
    ...nlRunnerParts('551H', nl56x1h, 518, 'TANDEM 551H TIP-ON', { hook: true, request: true }),
    frontAdjuster(518),
    syncLinkage(518),
    SCREW(529),
  ],
  dims: {
    ...tandemPlanDims(519, { f: false, single: true, hookPeg: true }),
    ...tandemAssemblyDims(519, true),
    ...posTable(519, '551H', [[260, 205, 185], [285, 220, 200], [310, 230, 210], [335, 245, 225], [360, 275, 255], [385, 285, 265], [410, 300, 280], [435, 310, 290], [460, 335, 315], [485, 350, 330], [510, 360, 340], [535, 375, 355], [560, 405, 385]], 'liftOffStopX1'),
    ...tandemSync(518, 31, 1171),
    ...attachDims(529, ['19*', 37, 133, 147, 165, 261, 284, 325], '551H'),
  },
  drilling: [],
  notes: [
    onRequest,
    'unverified: page 518 order table prints the first nominal length as 250 while its part number is 551H2601T (all other rows: NL N -> 551H{NL}1T); entered as NL 260 = 551H2601T.',
    '* position 19 can be replaced with a chipboard screw Ø4 x 15 mm.',
    'unverified: which attachment positions apply to which NL (page 529 matrix symbols not transcribed).',
  ],
  pages: [518, 519, 529],
};

const t560F: FittingVariant = {
  id: 'tip-on-tandem-560f',
  name: 'TANDEM 19 mm full extension with TIP-ON - 560F (17-19 mm sides)',
  choices: { nominalLength: nl560f, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['17-19'] },
  parts: [
    ...nlRunnerParts('560F', nl560f, 520, 'TANDEM 560F TIP-ON', { request: true }),
    tandemLockingDevice(520),
    frontAdjuster(520),
    syncLinkage(520),
    SCREW(530),
  ],
  dims: {
    ...tandemPlanDims(521, { f: true, single: false, hookPeg: false }),
    ...tandemAssemblyDims(521, false),
    ...tandemSync(520, 39, 1179),
    ...attachDims(530, [19, 37, 69, 133, 165, 197, 229, 243, 261, 284, 325, 357, 421, 453, 517, 549], '560F'),
  },
  drilling: [],
  notes: [
    onRequest,
    'unverified: which attachment positions apply to which NL (page 530 matrix symbols not transcribed); rows: NL 250-270, 300, 350, 400, 450, 500, 550, 600.',
    'unverified: cross-section values and drawer-assembly diagram references (page 521).',
  ],
  pages: [520, 521, 530],
};

const t550F: FittingVariant = {
  id: 'tip-on-tandem-550f',
  name: 'TANDEM 19 mm single extension with TIP-ON - 550F (17-19 mm sides)',
  choices: { nominalLength: nl550f, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['17-19'] },
  parts: [
    ...nlRunnerParts('550F', nl550f, 522, 'TANDEM 550F TIP-ON', { request: true }),
    tandemLockingDevice(522),
    frontAdjuster(522),
    syncLinkage(522),
    SCREW(530),
  ],
  dims: {
    ...tandemPlanDims(523, { f: true, single: true, hookPeg: false }),
    ...tandemAssemblyDims(523, false),
    ...tandemSync(522, 39, 1179),
    ...attachDims(530, ['19*', 37, 133, 147, 165, 261, 284, 325, 389], '550F'),
  },
  drilling: [],
  notes: [
    onRequest,
    '* position 19 can be replaced with a chipboard screw Ø4 x 15 mm.',
    'unverified: which attachment positions apply to which NL (page 530 matrix symbols not transcribed).',
  ],
  pages: [522, 523, 530],
};

const t561F: FittingVariant = {
  id: 'tip-on-tandem-561f',
  name: 'TANDEM 19 mm full extension with TIP-ON - 561F hook and peg (17-19 mm sides)',
  choices: { nominalLength: nl56x1f, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['17-19'] },
  parts: [
    ...nlRunnerParts('561F', nl56x1f, 524, 'TANDEM 561F TIP-ON', { hook: true, request: true }),
    frontAdjuster(524),
    syncLinkage(524),
    SCREW(530),
  ],
  dims: {
    ...tandemPlanDims(525, { f: true, single: false, hookPeg: true }),
    ...tandemAssemblyDims(525, true),
    ...posTable(525, '561F', [[260, 205, 185], [310, 230, 242], [360, 275, 287], [410, 300, 344], [460, 335, 379], [510, 360, 436], [560, 405, 481]], 'liftOffStopX3'),
    ...tandemSync(524, 39, 1179),
    ...attachDims(530, [19, 37, 69, 133, 165, 229, 243, 261, 284, 325, 357, 421, 453, 517], '561F'),
  },
  drilling: [],
  notes: [onRequest, 'unverified: which attachment positions apply to which NL (page 530 matrix symbols not transcribed).'],
  pages: [524, 525, 530],
};

const t551F: FittingVariant = {
  id: 'tip-on-tandem-551f',
  name: 'TANDEM 19 mm single extension with TIP-ON - 551F hook and peg (17-19 mm sides)',
  choices: { nominalLength: nl56x1f, capacityKg: [30], version: ['TIP-ON'], drawerSideThicknessMm: ['17-19'] },
  parts: [
    ...nlRunnerParts('551F', nl56x1f, 526, 'TANDEM 551F TIP-ON', { hook: true, request: true }),
    frontAdjuster(526),
    syncLinkage(526),
    SCREW(530),
  ],
  dims: {
    ...tandemPlanDims(527, { f: true, single: true, hookPeg: true }),
    ...tandemAssemblyDims(527, true),
    ...posTable(527, '551F', [[260, 205, 185], [310, 230, 210], [360, 275, 255], [410, 300, 280], [460, 335, 315], [510, 360, 340], [560, 405, 385]], 'liftOffStopX1'),
    ...tandemSync(526, 39, 1179),
    ...attachDims(530, ['19*', 37, 133, 147, 165, 261, 284, 325], '551F'),
  },
  drilling: [],
  notes: [
    onRequest,
    '* position 19 can be replaced with a chipboard screw Ø4 x 15 mm.',
    'unverified: which attachment positions apply to which NL (page 530 matrix symbols not transcribed).',
  ],
  pages: [526, 527, 530],
};

export const tipOnMoventoTandem: FittingFamily = {
  id: 'tip-on-movento-tandem',
  kind: 'motion',
  brand: 'Blum',
  name: 'TIP-ON for MOVENTO | TANDEM',
  summary: 'Mechanical opening support integrated in MOVENTO and TANDEM runners for handle-less fronts',
  variants: [movento760Tip, t560H, t550H, t561H, t551H, t560F, t550F, t561F, t551F],
  document: DOC,
  pages: Array.from({ length: 26 }, (_, i) => 506 + i),
};

export const runnerMotion: FittingFamily[] = [servoDrive, tipOnBlumotionMovento, tipOnMoventoTandem];
