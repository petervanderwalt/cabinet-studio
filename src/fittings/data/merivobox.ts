// MERIVOBOX box system, transcribed from the Blum catalogue 2024/2025, printed pages 250-289.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';
const COLOURS = ['SW-M', 'IG-M', 'OG-M'];
const NL_ALL = [270, 300, 350, 400, 450, 500, 550, 600];
const NL_K = [300, 350, 400, 450, 500, 550, 600];
const NL_N = [400, 450, 500, 550];
const NL_70 = [450, 500, 550, 600];

const d = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({ value, unit, meaning, page });

/** Cabinet profiles left/right, BLUMOTION. 40 kg = 450.<NL>1B, 70 kg = 453.<NL>1B. */
function profiles(page: number, nl40: number[], nl70: number[]): PartNumber[] {
  return [
    ...nl40.map((nl) => ({ role: 'cabinet-profile', partNo: `450.${nl}1B`, description: 'Cabinet profile L/R, BLUMOTION, 40 kg', when: { nominalLength: nl, capacityKg: 40 }, page })),
    ...nl70.map((nl) => ({ role: 'cabinet-profile', partNo: `453.${nl}1B`, description: 'Cabinet profile L/R, BLUMOTION, 70 kg', when: { nominalLength: nl, capacityKg: 70 }, page })),
  ];
}

/** Drawer side set; letter = side height code (N, M, K). */
function sides(page: number, letter: string, nls: number[], desc = 'Drawer side set (L/R sides, caps, branding)', role = 'side-set'): PartNumber[] {
  return nls.map((nl) => ({ role, partNo: `470${letter}${nl}2S`, description: desc, when: { nominalLength: nl }, page }));
}

const rails = (page: number, nls: number[]): PartNumber[] =>
  nls.map((nl) => ({ role: 'gallery-rail', partNo: `ZR4.${nl}RS.E`, description: 'Longside gallery rail left/right', when: { nominalLength: nl }, page }));
const boxcaps = (page: number, nls: number[]): PartNumber[] =>
  nls.map((nl) => ({ role: 'boxcap', partNo: `ZL4.${nl}S.E`, description: 'BOXCAP left/right', when: { nominalLength: nl }, page }));

const p = (page: number, role: string, partNo: string, description: string, extra: Partial<PartNumber> = {}): PartNumber => ({ role, partNo, description, page, ...extra });

/** Front fixing brackets, 2 pieces each (4 for centre piece variants). */
const frontBracket = (page: number, qty = 2): PartNumber[] => [
  p(page, 'front-fixing', 'ZF4.10I2', 'Front fixing bracket, INSERTA', { when: { fixing: 'INSERTA' }, qty }),
  p(page, 'front-fixing', 'ZF4.1002', 'Front fixing bracket, screw-on', { when: { fixing: 'Screw-on' }, qty }),
  p(page, 'front-fixing', 'ZF4.10T2', 'Front fixing bracket, EXPANDO T (thin fronts)', { when: { fixing: 'EXPANDO T' }, qty }),
];
const frontBracketTop = (page: number): PartNumber[] => [
  p(page, 'front-fixing-top', 'ZF4.50I2', 'Top front fixing bracket, INSERTA', { when: { fixing: 'INSERTA' }, qty: 2 }),
  p(page, 'front-fixing-top', 'ZF4.5002', 'Top bracket, screw-on, chipboard screws pre-assembled', { when: { fixing: 'Screw-on', topScrew: 'Chipboard screws 3.8 x 11.4' }, qty: 2 }),
  p(page, 'front-fixing-top', 'ZF4.5012', 'Top bracket, screw-on, countersunk screw', { when: { fixing: 'Screw-on', topScrew: 'Countersunk screw' }, qty: 2 }),
  p(page, 'front-fixing-top', 'ZF4.50T2', 'Top front fixing bracket, EXPANDO T', { when: { fixing: 'EXPANDO T' }, qty: 2 }),
];
const screws = (page: number, with17 = true, flat = true): PartNumber[] => [
  p(page, 'screw', '609.1500', 'Chipboard screw 3.5 x 15 mm, front fixing'),
  ...(with17 ? [p(page, 'screw', '609.1700', 'Chipboard screw 3.5 x 17 mm, front fixing')] : []),
  ...(flat ? [p(page, 'screw', '61R.1500', 'Flat head fixing screw 3.5 x 15 mm, back/drawer side')] : []),
  p(page, 'screw', '661.1450.HG', 'System screw 6.0 x 14.5 mm, profile to cabinet'),
];

/** Cabinet profile fixing screw note shared by all variants. */
const screwNotes = [
  'Chipboard screws and flat head screws are not included in the scope of delivery.',
  'Blum recommends chipboard screws 4 x 15 mm for connecting the cabinet profile to the cabinet.',
  'Flat head screws recommended for chipboard back and drawer side; also joins back fixings with drawer bases. Max screw head height 2 mm.',
];


const frontDrillCommon = (page: number): Record<string, DimSpec> => ({
  frontDrillDiameter: d(10, 'Front drilling diameter for INSERTA | EXPANDO T, tolerance +0.2/-0.1', page),
  frontDrillDepth: d(12, 'Front drilling depth (min. 6 mm when using EXPANDO T)', page),
  frontDrillMinFromBottom: d(33.5, 'Lower front fixing position from bottom edge of front, min. (+1 mm if cabinet profile is installed before the cabinet is assembled)', page),
  frontDrillPitch: d(32, 'Vertical distance between the two lower front fixing holes', page),
  frontBracketEdge: d(20, 'Installation dimension, screw-on front: 20 mm as shown at front bracket (front underside to bracket reference)', page),
  frontOverlayOffset: d('20.5 + FA', 'Installation dimension, screw-on front, from cabinet front edge to front rear face: 20.5 mm plus front overlay FA', page),
  baseChipboardBack: d('NL - 26', 'Drawer base length with chipboard back (NL = nominal length)', page),
  baseSteelBack: d('NL - 22', 'Drawer base length with steel back', page),
  baseWidth: d('LW - 51', 'Drawer base width and chipboard back width basis: LW = internal cabinet width', page),
  backFixingOffset10: d(10, 'Installation dimension, back: 10 mm as shown at top of chipboard back fixing', page),
  backFixingOffset11: d(11, 'Installation dimension, back: 11 mm as shown from chipboard back to cabinet back', page),
  baseDrillFromEdge16: d(16, 'Base drilling: 16 mm dimension as shown on the base drawing', page),
  baseDrillFromEdge9: d(9, 'Base drilling: 9 mm dimension as shown on the base drawing', page),
});

const baseDrillingNotes = (page: number): string[] => [
  `unverified: reference edges of the 16 mm and 9 mm base hole dimensions are only shown in an isometric drawing (page ${page}); X is the hole distance along the base.`,
  'Base drilling: pre-drilling possible when using a flat head screw.',
];

const frontRule = (page: number, holes: number[], id = 'front-fixing'): DrillingRule => ({
  id,
  target: 'front',
  label: 'Front drilling for INSERTA | EXPANDO T',
  reference: 'y measured upward from bottom edge of the front; x not dimensioned on the page (unverified), set to 0 as placeholder',
  holes: holes.map((y, i) => ({ x: 0, y, diameter: 10, depth: 12, note: i === 0 ? 'Lower position y = min 33.5 (+1 mm if profile installed before cabinet assembly); diameter of this position not stated (unverified), Ø10 shown on upper holes' : 'Ø 10 +0.2/-0.1; depth 12 (min 6 for EXPANDO T)' })),
  page,
});

const REF_COMMON = 'Reference pages: EXPANDO T 596, liability EXPANDO T 597, SERVO-DRIVE 362, TIP-ON BLUMOTION 394, AMBIA-LINE 542, CABLOXX 594, accessories 285, fixing positions 289.';

interface Cfg {
  id: string; name: string; summary: string; pages: number[]; page: number; planPage: number;
  nl40: number[]; nl70: number[]; sideLetter: string; sideHeight: number;
  spaceHeight: number | string; webCode: string;
  parts: PartNumber[]; dims?: Record<string, DimSpec>; drilling?: DrillingRule[]; notes?: string[];
  choices?: Record<string, (string | number)[]>;
}

function build(c: Cfg): FittingVariant {
  const nls = Array.from(new Set([...c.nl40, ...c.nl70])).sort((a, b) => a - b);
  return {
    id: c.id,
    name: c.name,
    summary: c.summary,
    choices: { nominalLength: nls, capacityKg: [...(c.nl40.length ? [40] : []), ...(c.nl70.length ? [70] : [])], colour: COLOURS, ...c.choices },
    parts: c.parts,
    dims: {
      webCode: d(c.webCode, 'Blum Product Configurator web code', c.page, undefined),
      spaceHeight: d(c.spaceHeight, 'Space requirement in cabinet, height (mm)', c.page),
      spaceDepth: d('NL + 3', 'Space requirement in cabinet, depth: nominal length NL plus 3 mm', c.page),
      drawerSideHeight: d(c.sideHeight, 'Drawer side height', c.page),
      ...c.dims,
    },
    drilling: c.drilling ?? [],
    notes: [...(c.notes ?? []), ...screwNotes, REF_COMMON],
    pages: c.pages,
  };
}

const standardBackDims = (page: number, minA: number | string, chipBack: number | string, drillLarge: boolean, extra: Record<string, DimSpec> = {}): Record<string, DimSpec> => ({
  ...frontDrillCommon(page),
  minSpaceBelow: d(minA, 'Space requirement drawing: min. dimension marked at cabinet bottom (+1 mm if cabinet profile is installed before the cabinet is assembled)', page),
  chipboardBackHeight: d(chipBack, 'Chipboard back height (16 mm chipboard)', page),
  chipboardBackWidth: d('LW - 51', 'Chipboard back width; LW = internal cabinet width', page),
  baseDrillX: d(drillLarge ? '128 (NL 270, 300) | 256 (NL 350-600)' : '256', 'Base drilling distance X (mm) by nominal length NL; see page table', page, undefined),
  ...extra,
});

// --------------------------------------------------------------------- variants
const drawerN = build({
  id: 'drawer-n', name: 'Drawer N', summary: 'Standard cabinet drawer, side height 68.5 mm, 40 kg', pages: [250, 251, 252, 254, 255], page: 254, planPage: 255,
  nl40: NL_N, nl70: [], sideLetter: 'N', sideHeight: 68.5, spaceHeight: 85.5, webCode: 'DQJ0JY',
  parts: [
    ...profiles(254, NL_N, []), ...sides(254, 'N', NL_N),
    p(254, 'back-fixing', 'ZB4N000S', 'Chipboard back fixings left/right, steel'),
    ...frontBracket(254), ...screws(254),
  ],
  dims: {
    ...standardBackDims(255, '33.5', 60.5, false),
    spaceHeightNote: d('85.5 incl. 2 mm tilt adjustment', 'Space requirement height includes 2 mm tilt adjustment', 254, undefined),
    minInnerSpaceHigh: d('31.5', 'Min. dimension above drawer side in space-requirement drawing (incl. 2 mm tilt adjustment); shown as min. 31.5**', 255),
    minBelow: d(54, 'Min. 54 mm dimension in space requirement drawing (+1 mm if profile installed before cabinet assembly)', 255),
  },
  drilling: [frontRule(255, [33.5, 65.5])],
  notes: ['Drawer side with drawer side height 68.5 mm; only 40 kg dynamic load offered.', 'EXPANDO T front fixing suits thin fronts (see page 596).', ...baseDrillingNotes(255)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], backType: ['Chipboard', 'Steel'] },
});

const drawerM = build({
  id: 'drawer-m', name: 'Drawer M', summary: 'Standard cabinet drawer, side height 91 mm, 40/70 kg', pages: [250, 251, 252, 256, 257], page: 256, planPage: 257,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 108, webCode: 'DQJ19A',
  parts: [
    ...profiles(256, NL_ALL, NL_70), ...sides(256, 'M', NL_ALL),
    p(256, 'back-fixing', 'ZB4M000S', 'Chipboard back fixings left/right, steel'),
    ...frontBracket(256), ...screws(256),
  ],
  dims: {
    ...standardBackDims(257, '103', 83, true),
    spaceHeightClear: d(103, 'Space requirement drawing: 103 mm dimension (height without tilt adjustment)', 257),
    minAbove: d(54, 'Min. 54 mm dimensions in space requirement drawing (+1 mm if profile installed before cabinet assembly)', 257),
  },
  drilling: [frontRule(257, [33.5, 65.5])],
  notes: ['Space requirement 108 mm includes 2 mm tilt adjustment.', ...baseDrillingNotes(257)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], backType: ['Chipboard', 'Steel'] },
});

const latchSet = (page: number): PartNumber => p(page, 'latch-set', 'ZI7.0M07', 'Latch set (latch + housing), nylon', { when: { latchSet: 'yes' } });

const innerDrawerM = build({
  id: 'inner-drawer-m', name: 'Inner drawer M', summary: 'Inner drawer with solid front piece, side height 91 mm', pages: [250, 251, 252, 258, 259], page: 258, planPage: 259,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: '106 (111 with latch set)', webCode: 'DQJ2NY',
  parts: [
    ...profiles(258, NL_ALL, NL_70), ...sides(258, 'M', NL_ALL),
    p(258, 'back-fixing', 'ZB4M000S', 'Chipboard back fixings left/right, steel'),
    p(258, 'front-fixing', 'ZI4.0MS1', 'Front fixing set (fixing, caps, locking piece, screws)'),
    p(258, 'front-piece', 'ZV4.1042M', 'Front piece without groove, 1042 mm, cut to size'),
    latchSet(258), ...screws(258, false),
  ],
  dims: {
    ...standardBackDims(259, 54, 83, true),
    spaceHeightWithLatch: d(111, 'Space requirement height with latch set', 258),
    frontPieceLength: d('LW - 126', 'Cutting length of front piece (ZV4.1042M, 1042 mm for KB 1200); LW = internal cabinet width', 258),
    minAboveInnerDrawer: d('52 (57 with latch set)', 'Min. space above inner drawer; inner drawer with latch set possible from height 57 mm', 259, undefined),
    latchHoleDiameter: d(25, 'Latch housing drilling diameter in front', 259),
    latchHoleDepthOrThickness: d(12, 'Dimension 12 mm shown at front thickness in latch housing drilling drawing (meaning unverified)', 259),
    latchHoleMinEdge: d(17, 'Latch housing hole: min. distance 17 mm (edge reference unverified)', 259),
    latchSpacing45: d(45, 'Latch housing drawing dimension 45 mm (reference unverified)', 259),
    latchPitch: d('65', 'Distance between upper and lower latch drilling positions: x to x + 65 (x not stated)', 259),
  },
  notes: ['SERVO-DRIVE is only triggered by pulling for inner drawers.', 'Latch set ZI7.0M07 cannot be used with TIP-ON BLUMOTION. Latch must be mounted on the front piece. Latch housing RAL 7037 dust grey; latch set colours listed SW-M | OG-M | CS-M (CS-M not defined in legend).',
    'unverified: latch housing drilling x/y reference points are not clearly dimensioned (page 259).', ...baseDrillingNotes(259)],
  choices: { latchSet: ['yes', 'no'], backType: ['Chipboard', 'Steel'] },
});

const drawerK = build({
  id: 'drawer-k', name: 'Drawer K', summary: 'Standard cabinet drawer, side height 129 mm, 40/70 kg', pages: [250, 251, 252, 260, 261], page: 260, planPage: 261,
  nl40: NL_K, nl70: NL_70, sideLetter: 'K', sideHeight: 129, spaceHeight: 146, webCode: 'DQJ1YM',
  parts: [
    ...profiles(260, NL_K, NL_70), ...sides(260, 'K', NL_K),
    p(260, 'back-fixing', 'ZB4K000S', 'Chipboard back fixings left/right, steel'),
    ...frontBracket(260), ...screws(260),
  ],
  dims: {
    ...standardBackDims(261, 141, 121, true),
    spaceHeightClear: d(141, 'Space requirement drawing: 141 mm dimension (height without tilt adjustment)', 261),
    minAbove: d(92, 'Min. 92 mm above in space requirement drawing (incl. 2 mm tilt adjustment)', 261),
    minBelow: d(54, 'Min. 54 mm dimension (+1 mm if profile installed before cabinet assembly)', 261),
  },
  drilling: [frontRule(261, [33.5, 65.5])],
  notes: ['Space requirement 146 mm includes 2 mm tilt adjustment.', 'Base drilling X: 128 for NL 300; 256 for NL 350-600.', ...baseDrillingNotes(261)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], backType: ['Chipboard', 'Steel'] },
});

const innerDrawerK = build({
  id: 'inner-drawer-k', name: 'Inner drawer K', summary: 'Inner drawer with mid-height solid front piece, side height 129 mm', pages: [250, 251, 252, 262, 263], page: 262, planPage: 263,
  nl40: NL_K, nl70: NL_70, sideLetter: 'K', sideHeight: 129, spaceHeight: 144, webCode: 'DQJ3DA',
  parts: [
    ...profiles(262, NL_K, NL_70), ...sides(262, 'K', NL_K),
    p(262, 'back-fixing', 'ZB4K000S', 'Chipboard back fixings left/right, steel'),
    p(262, 'front-fixing', 'ZI4.1KS1', 'Front fixing set (fixing, caps, locking piece, screws)'),
    p(262, 'front-piece', 'ZV4.1042M', 'Front piece without groove, 1042 mm, cut to size'),
    latchSet(262), ...screws(262, false),
  ],
  dims: {
    ...standardBackDims(263, 54, 121, true),
    spaceHeightClear: d(141, 'Space requirement drawing: 141 mm dimension', 263),
    minAbove: d(90, 'Min. 90 mm above in space requirement drawing', 263),
    frontPieceLength: d('LW - 126', 'Cutting length of front piece; LW = internal cabinet width (1042 mm piece suits KB 1200)', 262),
    latchHoleDiameter: d(25, 'Latch housing drilling diameter in front', 263),
    latchPitch: d('65', 'Distance between upper and lower latch drilling positions: x to x + 65 (x not stated)', 263),
  },
  notes: ['SERVO-DRIVE is only triggered by pulling for inner drawers.', 'Latch set ZI7.0M07 cannot be used with TIP-ON BLUMOTION.',
    'unverified: latch housing drilling reference points (min 17, 45, 12) not clearly dimensioned (page 263).', ...baseDrillingNotes(263)],
  choices: { latchSet: ['yes', 'no'], backType: ['Chipboard', 'Steel'] },
});

const hfpoDims = (page: number): Record<string, DimSpec> => ({
  ...standardBackDims(page, 54, 184, true),
  spaceHeightClear: d(204, 'Space requirement drawing: 204 mm dimension (height without tilt adjustment)', page),
  minAbove: d(155, 'Min. 155 mm above in space requirement drawing (incl. 2 mm tilt adjustment)', page),
  frontFixingSpan: d(128, 'Vertical distance between middle and upper front fixing positions (front drilling and screw-on installation)', page),
  backFixingPitch64: d(64, 'Installation dimensions back: 64 mm between the two fixing zones', page),
  backFixingPitch32: d(32, 'Installation dimensions back: 32 mm module spacing', page),
});
const hfpoRule = (page: number): DrillingRule => frontRule(page, [33.5, 65.5, 193.5]);

const hfpoGallery = build({
  id: 'hfpo-gallery-e', name: 'High fronted pull-out - gallery - E', summary: 'High fronted pull-out with longside gallery rails, back height E', pages: [250, 251, 252, 264, 265], page: 264, planPage: 265,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 209, webCode: 'DQJ42M',
  parts: [
    ...profiles(264, NL_ALL, NL_70), ...sides(264, 'M', NL_ALL),
    p(264, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel'),
    p(264, 'back-fixing-cap', 'ZB4E00AK', 'Back fixing cover cap, symmetrical', { qty: 2 }),
    ...frontBracket(264), ...frontBracketTop(264), ...rails(264, NL_ALL), ...screws(264),
  ],
  dims: { ...hfpoDims(265), chipboardBackHeight: d(184, 'Chipboard back height (16 mm chipboard) for back height E', 265) },
  drilling: [hfpoRule(265)],
  notes: ['Top front fixing bracket: screw-on version offered with pre-assembled chipboard screws 3.8 x 11.4 or with countersunk screw (head max 7 mm, thread max 4 mm, not supplied).', 'Front drilling heights derived from the page: lower 33.5, +32 = 65.5, +128 = 193.5 (unverified: 128 is shown between the two Ø10 holes).', ...baseDrillingNotes(265)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], topScrew: ['Chipboard screws 3.8 x 11.4', 'Countersunk screw'] },
});

const hfpoBoxcover = build({
  id: 'hfpo-boxcover-e', name: 'High fronted pull-out - BOXCOVER - E', summary: 'High fronted pull-out with BOXCOVER and glass side design elements', pages: [250, 251, 252, 266, 267], page: 266, planPage: 267,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 209, webCode: 'DQJ4RY',
  parts: [
    ...profiles(266, NL_ALL, NL_70), ...sides(266, 'M', NL_ALL),
    p(266, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel'),
    ...frontBracket(266), ...frontBracketTop(266),
    p(266, 'boxcover', 'ZL4M00808', 'BOXCOVER left/right, nylon/steel, with clamp jaws'),
    p(266, 'glass-side', 'ZE4Mxx0G', 'Glass design element (side), see page 284'),
    ...screws(266),
  ],
  dims: {
    ...hfpoDims(267), chipboardBackHeight: d(184, 'Chipboard back height (16 mm chipboard)', 267),
    glassSideX: d('NL - 90', 'Side glass design element cut size X; NL = nominal length', 267),
    glassSideY: d(95, 'Side glass design element cut size Y', 267),
    clampTorque: d('1.5-2', 'BOXCOVER clamping screw tightening torque, Nm, required from front height FH > 455 mm', 266, undefined),
  },
  drilling: [hfpoRule(267)],
  notes: ['Tighten BOXCOVER clamping screw to 1.5-2 Nm from front heights FH > 455 mm.', 'With INSERTA front fixing bracket, it must be folded up or down.', 'Clean glass side parts before assembly (required from FH > 455 mm).', 'Glass dimensions with MERIVOBOX need no impact testing per DIN EN 14749 (June 2016); polished flat edge with 1 mm +/-0.5 bevel.', ...baseDrillingNotes(267)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], topScrew: ['Chipboard screws 3.8 x 11.4', 'Countersunk screw'] },
});

const hfpoBoxcap = build({
  id: 'hfpo-boxcap-e', name: 'High fronted pull-out - BOXCAP - E', summary: 'High fronted pull-out with clip-on BOXCAP metal sides', pages: [250, 251, 252, 268, 269], page: 268, planPage: 269,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 209, webCode: 'DQJ5HA',
  parts: [
    ...profiles(268, NL_ALL, NL_70), ...sides(268, 'M', NL_ALL),
    p(268, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel'),
    ...frontBracket(268), ...frontBracketTop(268), ...boxcaps(268, NL_ALL), ...screws(268),
  ],
  dims: { ...hfpoDims(269), chipboardBackHeight: d(184, 'Chipboard back height (16 mm chipboard)', 269) },
  drilling: [hfpoRule(269)],
  notes: [...baseDrillingNotes(269)],
  choices: { fixing: ['INSERTA', 'Screw-on', 'EXPANDO T'], topScrew: ['Chipboard screws 3.8 x 11.4', 'Countersunk screw'] },
});

const innerDims = (page: number): Record<string, DimSpec> => ({
  ...standardBackDims(page, 54, 184, true),
  spaceHeightClear: d(204, 'Space requirement drawing: 204 mm dimension', page),
  minAbove: d(153, 'Min. 153 mm above in space requirement drawing', page),
  backFixingPitch64: d(64, 'Installation dimensions back: 64 mm between fixing zones', page),
  backFixingPitch32: d(32, 'Installation dimensions back: 32 mm module spacing', page),
});

const innerBoxcapGallery = build({
  id: 'inner-pullout-boxcap-gallery-e', name: 'Inner pull-out - BOXCAP - gallery - E', summary: 'Inner pull-out with BOXCAP and cross gallery, back height E', pages: [250, 251, 252, 270, 271], page: 270, planPage: 271,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 207, webCode: 'DQJ9PA',
  parts: [
    ...profiles(270, NL_ALL, NL_70), ...sides(270, 'M', NL_ALL),
    p(270, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel'),
    p(270, 'front-fixing', 'ZI4.2ES1', 'Front fixing set (fixing, caps, locking piece, screws)'),
    p(270, 'front-piece', 'ZV4.1042M', 'Front piece without groove, 1042 mm, cut to size'),
    p(270, 'cross-gallery', 'ZR4.1059U', 'Cross gallery, 1059 mm, cut to size'),
    ...boxcaps(270, NL_ALL), ...screws(270, false),
  ],
  dims: {
    ...innerDims(271),
    frontPieceLength: d('LW - 126', 'Cutting length of front piece (1042 mm suits KB 1200); LW = internal cabinet width', 270),
    crossGalleryLength: d('LW - 111', 'Cutting length of cross gallery (1059 mm suits KB 1200); LW = internal cabinet width', 270),
  },
  notes: ['SERVO-DRIVE is only triggered by pulling for inner pull-outs.', ...baseDrillingNotes(271)],
  choices: { backType: ['Chipboard', 'Steel'] },
});

const innerBoxcapDesign = build({
  id: 'inner-pullout-boxcap-design-e', name: 'Inner pull-out - BOXCAP - design element - E', summary: 'Inner pull-out with BOXCAP and low or high glass design element', pages: [250, 251, 252, 272, 273], page: 272, planPage: 273,
  nl40: NL_ALL, nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 207, webCode: 'DQJAEM',
  parts: [
    ...profiles(272, NL_ALL, NL_70), ...sides(272, 'M', NL_ALL),
    p(272, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel'),
    p(272, 'front-fixing', 'ZI4.4ES1', 'Front fixing set incl. glass fixing and adapters'),
    p(272, 'front-piece', 'ZV4.1042NN', 'Front piece with groove, 1042 mm, cut to size'),
    p(272, 'glass-front', 'ZE4LxxxxG', 'Low glass design element, see page 284', { when: { designElement: 'Low' } }),
    p(272, 'glass-front', 'ZE4HxxxxG', 'High glass design element, see page 284', { when: { designElement: 'High' } }),
    ...boxcaps(272, NL_ALL), ...screws(272, false),
  ],
  dims: {
    ...innerDims(273),
    frontPieceLength: d('LW - 126', 'Cutting length of front piece with groove; LW = internal cabinet width', 272),
    glassLowX: d('LW - 104', 'Low design element cut size X', 273), glassLowY: d(75, 'Low design element cut size Y', 273),
    glassHighX: d('LW - 104', 'High design element cut size X', 273), glassHighY: d(142.5, 'High design element cut size Y', 273),
  },
  notes: ['SERVO-DRIVE is only triggered by pulling for inner pull-outs.', 'Glass dimensions with MERIVOBOX need no impact testing per DIN EN 14749 (June 2016); polished flat edge with 1 mm +/-0.5 bevel.', ...baseDrillingNotes(273)],
  choices: { designElement: ['Low', 'High'], backType: ['Chipboard', 'Steel'] },
});

const wasteBin = build({
  id: 'waste-bin-over-extension', name: 'Cabinet profile with over extension for waste bin applications', summary: 'Cabinet profile with forward-set hook, 70 kg, for high fronted pull-outs E', pages: [250, 251, 252, 274, 275], page: 274, planPage: 275,
  nl40: [], nl70: [450, 500, 550], sideLetter: 'M', sideHeight: 91, spaceHeight: 209, webCode: 'DQJ66M',
  parts: [
    ...[450, 500, 550].map((nl) => p(274, 'cabinet-profile', `453.${nl}1BZ`, 'Cabinet profile L/R, over extension, 70 kg', { when: { nominalLength: nl, capacityKg: 70 } })),
    ...[400, 450, 500].map((nl) => p(274, 'side-set', `470M${nl}2S`, 'Drawer side set (drawer side NL = profile NL - 50)', { when: { drawerSideLength: nl } })),
  ],
  dims: {
    ...hfpoDims(275),
    drawerSideLength: d('NL - 50', 'Drawer side nominal length = cabinet profile nominal length minus 50 mm (e.g. 450 - 50 = 400)', 274),
    baseDrillX: d(256, 'Base drilling distance X (mm), NL 400 | 450 | 500', 275),
  },
  drilling: [hfpoRule(275)],
  notes: ['Drawer side set NL is cabinet profile NL - 50 mm, so profile 450/500/550 uses side set 400/450/500.', 'Can be combined with all high fronted pull-outs in height E; additional components: gallery page 264, BOXCOVER page 266, BOXCAP page 268 (the page text calls the gallery version "C", presumably E).', ...baseDrillingNotes(275)],
  choices: { drawerSideLength: [400, 450, 500] },
});

const centreBase = [
  'W = NL drawer sides exterior - NL drawer sides interior - 10 mm.',
  'INSERTA fixing is not possible with a centre piece; front fixing bracket must be installed turned through 180 degrees.',
  'For effective use of storage space: NL exterior sides - NL interior sides = min. 150 mm.',
  'unverified: centre piece drilling dimensions (32, 11.5, 7.5, R10, 26, 9, 16, Xa, Xi) have no unambiguous reference points on the page.',
];

const drawerMCentre = build({
  id: 'drawer-m-centre-piece', name: 'Drawer M - centre piece (sink cabinet)', summary: 'Drawer M with centre piece around a sink trap, 40/70 kg', pages: [250, 251, 253, 276, 277], page: 276, planPage: 277,
  nl40: NL_ALL.filter((n) => n >= 450), nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 108, webCode: 'DQJB3Y',
  parts: [
    ...profiles(276, [450, 500, 550, 600], NL_70),
    ...[450, 500, 550, 600].map((nl) => p(276, 'side-set', `470M${nl}2S`, 'Drawer side set exterior', { when: { sideSet: 'exterior', nominalLength: nl } })),
    ...[300, 350, 400, 450].map((nl) => p(276, 'side-set', `470M${nl}2S`, 'Drawer side set interior', { when: { sideSet: 'interior', nominalLength: nl } })),
    p(276, 'back-fixing', 'ZB4M000S', 'Chipboard back fixings left/right, steel', { qty: 2 }),
    p(276, 'front-fixing', 'ZF4.1002', 'Front fixing bracket, screw-on', { when: { fixing: 'Screw-on' }, qty: 4 }),
    p(276, 'front-fixing', 'ZF4.10T2', 'Front fixing bracket, EXPANDO T', { when: { fixing: 'EXPANDO T' }, qty: 4 }),
    ...screws(276),
  ],
  dims: {
    ...standardBackDims(277, 103, 83, false),
    spaceHeightClear: d(103, 'Space requirement drawing: 103 mm', 277),
    centrePieceHeight: d(67, 'Centre piece chipboard height (16 mm chipboard)', 277),
    centrePieceWidth: d('SPW + 42', 'Centre piece width; SPW = internal cabinet width between inner drawer sides', 277),
    baseCutoutWidth: d('SPW + 37', 'Base cut-out width (A) between inner drawer sides', 277),
    baseWidth: d('LW - 51', 'Base width', 277),
    yMinBlumotion: d(40, 'Y min. for BLUMOTION (cut-out position, Y1/Y2 in cutting drawing)', 277),
    yMinTipOn: d(99, 'Y min. for TIP-ON BLUMOTION', 277),
    yMax: d(225, 'Y max. for BLUMOTION and TIP-ON BLUMOTION', 277),
    baseDrillXaExterior: d(256, 'Xa for exterior drawer side set, NL 450 | 500 | 550 | 600', 277),
    baseDrillXiInterior: d('128 (NL 300) | 256 (NL 350, 400, 450)', 'Xi for interior drawer side set', 277, undefined),
  },
  notes: [...centreBase, 'Cutting drawing shows B1, B2 chipboard back parts at 83 mm and Y1/Y2 offsets.', ...baseDrillingNotes(277)],
  choices: { sideSet: ['exterior', 'interior'], fixing: ['Screw-on', 'EXPANDO T'] },
});

const hfpoBoxcapCentre = build({
  id: 'hfpo-boxcap-e-centre-piece', name: 'High fronted pull-out - BOXCAP - E - centre piece (sink cabinet)', summary: 'BOXCAP high fronted pull-out with centre piece, 40/70 kg', pages: [250, 251, 253, 278, 279], page: 278, planPage: 279,
  nl40: [450, 500, 550, 600], nl70: NL_70, sideLetter: 'M', sideHeight: 91, spaceHeight: 209, webCode: 'DQJD7Y',
  parts: [
    ...profiles(278, [450, 500, 550, 600], NL_70),
    ...[450, 500, 550, 600].map((nl) => p(278, 'side-set', `470M${nl}2S`, 'Drawer side set exterior', { when: { sideSet: 'exterior', nominalLength: nl } })),
    ...[300, 350, 400, 450].map((nl) => p(278, 'side-set', `470M${nl}2S`, 'Drawer side set interior', { when: { sideSet: 'interior', nominalLength: nl } })),
    p(278, 'back-fixing', 'ZB4E000S', 'Chipboard back fixings left/right, steel (3.1)'),
    p(278, 'back-fixing', 'ZB4M000S', 'Chipboard back fixings left/right, steel (3.2)'),
    p(278, 'back-fixing-cap', 'ZB4M00AK', 'Back fixing cover cap, symmetrical', { qty: 2 }),
    p(278, 'front-fixing', 'ZF4.1002', 'Front fixing bracket, screw-on', { when: { fixing: 'Screw-on' }, qty: 4 }),
    p(278, 'front-fixing', 'ZF4.10T2', 'Front fixing bracket, EXPANDO T', { when: { fixing: 'EXPANDO T' }, qty: 4 }),
    ...frontBracketTop(278),
    ...[450, 500, 550, 600].map((nl) => p(278, 'boxcap', `ZL4.${nl}S.E`, 'BOXCAP left/right', { when: { nominalLength: nl } })),
    ...screws(278, true, false),
  ],
  dims: {
    ...hfpoDims(279),
    centrePieceHeight: d(67, 'Centre piece chipboard height (16 mm chipboard)', 279),
    centrePieceWidth: d('SPW + 42', 'Centre piece width; SPW = internal cabinet width between inner drawer sides', 279),
    baseCutoutWidth: d('SPW + 37', 'Base cut-out width between inner drawer sides', 279),
    yMinBlumotion: d(40, 'Y min. for BLUMOTION', 279), yMinTipOn: d(99, 'Y min. for TIP-ON BLUMOTION', 279), yMax: d(225, 'Y max.', 279),
    baseDrillXaExterior: d(256, 'Xa for exterior drawer side set, NL 450-600', 279),
    baseDrillXiInterior: d('128 (NL 300) | 256 (NL 350, 400, 450)', 'Xi for interior drawer side set', 279, undefined),
  },
  drilling: [hfpoRule(279)],
  notes: [...centreBase, 'Interior drawer side set 3.2 back fixing ZB4M000S; exterior uses ZB4E000S.', 'unverified: page lists drawer side sets only as generic 470M... codes; exact pairing of 3.1/3.2 back fixings to exterior/interior side sets inferred from numbering.', ...baseDrillingNotes(279)],
  choices: { sideSet: ['exterior', 'interior'], fixing: ['Screw-on', 'EXPANDO T'], topScrew: ['Chipboard screws 3.8 x 11.4', 'Countersunk screw'] },
});

const spaceTower: FittingVariant = {
  id: 'space-tower', name: 'SPACE TOWER', summary: 'Larder unit with inner pull-outs; cabinet width KB 275-1200 mm', 
  choices: { capacityKg: [40, 70] },
  parts: [],
  dims: {
    webCode: d('DQJDXA', 'Product Configurator web code', 280, undefined),
    cabinetWidthKB: d('275-1200', 'Recommended cabinet width KB range', 280),
    highestFrontHeightDemo: d(1684, 'Positioning example: top height shown (mm from cabinet bottom, planning drawing)', 281),
    positionExample: d([74, 54, 460, 847, 1234, 1622], 'Heights in positioning drawing, mm (reference points unverified); lowest 54 (+1 mm if profile installed before cabinet assembly)', 281),
    frontDrillPitch80: d(80, 'Front drilling distance 80 mm shown twice (reference unverified)', 281),
    hingeSpacing: d([280, 280], 'Hinge distances shown at left of drawing (unverified)', 281),
  },
  drilling: [],
  notes: ['Components are the inner drawer / inner pull-out variants: Inner drawer M p.258, Inner drawer K p.262, inner pull-outs gallery/BOXCOVER p.252, BOXCAP p.270 and p.272; AMBIA-LINE p.544; CLIP top BLUMOTION 155 hinge p.84.',
    'The page has no part numbers of its own.', 'In high cabinets a shelf at the highest level rather than an inner drawer is recommended.', 'Use CLIP top BLUMOTION 155 degree hinge without front protrusion to optimise KB; hinge mounted above the pull-out lets the lowest pull-out sit at the bottom.',
    'unverified: positioning drawing heights (1684, 1622, 1424, 1234, 1035, 847, 670, 460, 388/387/386, 74, 54, 19) lack legible reference labels (page 281).'],
  pages: [250, 251, 253, 280, 281],
};

const spaceTwin: FittingVariant = {
  id: 'space-twin', name: 'SPACE TWIN', summary: 'Narrow cabinet solution with diagonally offset cabinet profiles; KB 150-250 mm', 
  choices: { capacityKg: [20], installationHeight: ['M', 'K', 'E'] },
  parts: [],
  dims: {
    webCode: d('DQJEMM', 'Product Configurator web code', 282, undefined),
    cabinetWidthKB: d('150-250', 'Cabinet width KB range', 282),
    capacityPerBaseCabinet: d(20, 'Dynamic carrying capacity per base cabinet', 282, 'kg'),
    spaceDepth: d('NL + 3', 'Space requirement depth', 282),
    xHeightM: d(54, 'X for installation height M (min.)', 283), xHeightK: d(92, 'X for installation height K (min.; 112 with SERVO-DRIVE, 142 with TIP-ON BLUMOTION)', 283), xHeightE: d(155, 'X for installation height E (min.)', 283),
    yMK: d('-', 'Y not applicable for M and K installation height', 283, undefined),
    yE: d(128, 'Y for installation height E with M side height and gallery, BOXCOVER or BOXCAP', 283),
    frontDrillLower: d(33.5, 'Front installation dimensions: lower fixing from bottom edge of front (+1 mm if profile installed before assembly)', 283),
    frontDrillPitch: d(32, 'Front installation dimensions: 32 mm', 283),
    profileSetback: d(28, 'Space requirement: 28 mm dimension from cabinet side', 283),
    frontOffset: d('20.5 + FA', 'Front installation: 20.5 mm plus front overlay FA on each side', 283),
  },
  drilling: [],
  notes: ['Combine with: Drawer M p.256, Drawer K p.260, High fronted pull-out gallery p.264, BOXCOVER p.266, BOXCAP p.268.', 'Includes integrated BLUMOTION.', 'The page has no part numbers of its own.', 'unverified: meaning of installation-height letters vs side-height rows beyond table on page 283 inferred from table.'],
  pages: [250, 251, 253, 282, 283],
};

const glass: FittingVariant = {
  id: 'glass-design-element', name: 'Glass design element', summary: 'Clear glass design elements for inner pull-out fronts and BOXCOVER sides',
  choices: { kind: ['Low front', 'High front', 'Side'], cabinetWidthKB: [600, 1200], sideThickness: ['15/16', '18/19'], nominalLength: [450, 500, 550, 600] },
  parts: [
    p(284, 'glass-front', 'ZE4L464G', 'Low glass element, KB 600, side 15/16', { when: { kind: 'Low front', cabinetWidthKB: 600, sideThickness: '15/16' } }),
    p(284, 'glass-front', 'ZE4L458G', 'Low glass element, KB 600, side 18/19', { when: { kind: 'Low front', cabinetWidthKB: 600, sideThickness: '18/19' } }),
    p(284, 'glass-front', 'ZE4L1064G', 'Low glass element, KB 1200, side 15/16', { when: { kind: 'Low front', cabinetWidthKB: 1200, sideThickness: '15/16' } }),
    p(284, 'glass-front', 'ZE4L1058G', 'Low glass element, KB 1200, side 18/19', { when: { kind: 'Low front', cabinetWidthKB: 1200, sideThickness: '18/19' } }),
    p(284, 'glass-front', 'ZE4H464G', 'High glass element, KB 600, side 15/16', { when: { kind: 'High front', cabinetWidthKB: 600, sideThickness: '15/16' } }),
    p(284, 'glass-front', 'ZE4H458G', 'High glass element, KB 600, side 18/19', { when: { kind: 'High front', cabinetWidthKB: 600, sideThickness: '18/19' } }),
    p(284, 'glass-front', 'ZE4H1064G', 'High glass element, KB 1200, side 15/16', { when: { kind: 'High front', cabinetWidthKB: 1200, sideThickness: '15/16' } }),
    p(284, 'glass-front', 'ZE4H1058G', 'High glass element, KB 1200, side 18/19', { when: { kind: 'High front', cabinetWidthKB: 1200, sideThickness: '18/19' } }),
    p(284, 'glass-side', 'ZE4M360G', 'Side glass element pair, NL 450', { when: { kind: 'Side', nominalLength: 450 }, qty: 2 }),
    p(284, 'glass-side', 'ZE4M410G', 'Side glass element pair, NL 500', { when: { kind: 'Side', nominalLength: 500 }, qty: 2 }),
    p(284, 'glass-side', 'ZE4M460G', 'Side glass element pair, NL 550', { when: { kind: 'Side', nominalLength: 550 }, qty: 2 }),
    p(284, 'glass-side', 'ZE4M510G', 'Side glass element pair, NL 600', { when: { kind: 'Side', nominalLength: 600 }, qty: 2 }),
  ],
  dims: {
    lowX: d('LW - 104', 'Low design element cut size X; LW = internal cabinet width', 284), lowY: d(75, 'Low design element cut size Y', 284),
    highX: d('LW - 104', 'High design element cut size X', 284), highY: d(142.5, 'High design element cut size Y', 284),
    sideX: d('NL - 90', 'Side design element cut size X; NL = nominal length', 284), sideY: d(95, 'Side design element cut size Y', 284),
    colour: d('clear', 'Colour: clear; material: glass; for cutting to size', 284, undefined),
  },
  drilling: [],
  notes: ['For other cabinet widths KB or nominal lengths NL cut the next longer element to size.', 'Side parts of the glass must be cleaned before BOXCOVER assembly (required from FH > 455 mm).', 'Dimensions in combination with MERIVOBOX need no impact testing per DIN EN 14749 (June 2016); polished flat edge with 1 mm +/-0.5 mm bevel.', 'ZE4Mxx0G / ZE4LxxxxG / ZE4HxxxxG on application pages are ordering patterns for these items.'],
  pages: [284],
};

const accessories: FittingVariant = {
  id: 'accessories', name: 'Accessories', summary: 'Steel back, stabilisers, gallery fixing, screws, tools',
  choices: { backHeight: ['N1', 'M', 'K', 'E'] },
  parts: [
    p(285, 'steel-back', 'ZB4NxxxS.6', 'Steel back height N1, xxx = LW - 38 (on request)', { when: { backHeight: 'N1' } }),
    p(285, 'steel-back', 'ZB4MxxxS.6', 'Steel back height M, xxx = LW - 38 (on request)', { when: { backHeight: 'M' } }),
    p(285, 'steel-back', 'ZB4KxxxS.6', 'Steel back height K, xxx = LW - 38 (on request)', { when: { backHeight: 'K' } }),
    p(285, 'steel-back', 'ZB4ExxxS.6', 'Steel back height E, xxx = LW - 38 (on request)', { when: { backHeight: 'E' } }),
    p(285, 'stabiliser', 'Z96.10E1', 'Front/base stabiliser, EXPANDO, dust grey'),
    p(286, 'stabiliser', 'Z96.00T1', 'Front/base stabiliser for thin fronts, EXPANDO T'),
    p(286, 'side-stabilisation', 'ZS4.400MU', 'Side stabilisation rod, NL 270-400', { when: { nominalLength: '270-400' } }),
    p(286, 'side-stabilisation', 'ZS4.650MU', 'Side stabilisation rod, NL 450-650', { when: { nominalLength: '450-650' } }),
    p(287, 'gallery-fixing', 'ZRR.4000', 'Flexible gallery fixing left/right'),
    p(287, 'screw', '61R.1500', 'Flat head screw 3.5 x 15 mm, zinc plated'),
    p(287, 'screw', '609.1500', 'Chipboard screw 3.5 x 15 mm'),
    p(287, 'screw', '609.1700', 'Chipboard screw 3.5 x 17 mm'),
    p(287, 'screw', '661.1000.HG', 'System screw 6.0 x 10.0 mm'),
    p(287, 'screw', '661.1150.HG', 'System screw 6.0 x 11.5 mm'),
    p(287, 'screw', '661.1300.HG', 'System screw 6.0 x 13.0 mm'),
    p(287, 'screw', '661.1450.HG', 'System screw 6.0 x 14.5 mm'),
    p(287, 'screw', '661.2000.HG', 'System screw 6.0 x 20.0 mm'),
    p(288, 'tool', 'M01.ZZ03.01', 'Centre bit, drilling diameter 2.7 mm'),
    p(288, 'tool', 'M01.ZZB3', 'Replacement bit for centre bit'),
    p(288, 'door-buffer', '993.710', 'Stick-on door buffer, 8 mm'),
    p(288, 'door-buffer', '993.706', 'Two-part door buffer, 8 mm, RAL 9006'),
    p(288, 'tool', '303.756.1', 'Pozidriv PZ 2 screwdriver, 210 mm'),
    p(288, 'tool', '314.928.1', 'Slotted screwdriver size 1, 200 mm'),
    p(288, 'tool', '623.882.2', 'TORX T20 screwdriver, 100 mm', { when: { torxLength: 100 } }),
    p(288, 'tool', '209.093.7', 'TORX T20 screwdriver, 210 mm', { when: { torxLength: 210 } }),
  ],
  dims: {
    steelBackWidth: d('LW - 38', 'Steel back width xxx; LW = internal cabinet width (example LW 567 gives 529, order ZB4M529S.6)', 285),
    steelBackBase: d('NL - 22', 'Base length with steel back', 285), steelBackBaseWidth: d('LW - 51', 'Base width', 285),
    steelBackNote: d(16, 'Steel back drawing: 16 mm dimension (16 mm chipboard base, reference unverified)', 285),
    baseStabiliserFrontX: d('20.5 + FA', 'Front/base stabiliser drilling X from front edge reference: 20.5 mm + front overlay FA', 285),
    baseStabiliserMinHeight: d(105, 'Front/base stabiliser (EXPANDO) min. dimension marked * in space requirement', 285),
    thinStabiliserX: d('14 + FA', 'Stabiliser for thin fronts drilling X: 14 mm + front overlay FA', 286),
    thinStabiliserMin: d(80, 'Stabiliser for thin fronts min. dimension marked *', 286),
    thinStabiliser13: d(13, 'Thin-front stabiliser drawing dimension 13 (reference unverified)', 286), thinStabiliser20: d(20, 'Thin-front stabiliser drawing dimension 20 (reference unverified)', 286), thinStabiliser22: d(22, 'Thin-front stabiliser drawing dimension 22 (reference unverified)', 286), thinStabiliserMinDepth: d(6, 'Min. drilling depth 6 mm for thin-front stabiliser', 286),
    sideStabilisationCut1: d('LW - 231', 'Side stabilisation rod cutting length 1; LW = internal cabinet width', 286),
    sideStabilisationCut2: d('NL + 10', 'Side stabilisation rod cutting length 2; NL = nominal length', 286),
    galleryFixingY: d('X - 29', 'Flexible gallery fixing dimension Y; X = back height', 287),
    galleryFixingZ: d('X - 55.5', 'Flexible gallery fixing dimension Z; X = back height', 287),
    galleryFixingW: d('X - 115', 'Flexible gallery fixing dimension W; X = back height', 287),
    galleryFixingMin: d(54, 'Min. 54 mm in space requirement (+1 mm if profile installed before cabinet assembly)', 287),
    systemScrewDrill: d(5, 'System screw drilling diameter', 287),
    centreBitDrillDepth: d(8, 'Centre bit: drilling depth up to 8 mm; diameter 2.7', 288),
  },
  drilling: [],
  notes: ['Steel back not compatible with SERVO-DRIVE.', 'Steel back, ZB4xxxxS.6 marked as available on request.', 'Stabiliser recommendation: front/base stabiliser (EXPANDO) 1 pc for KB > 900 mm. Thin-front stabiliser: KB > 600: 1 pc; KB > 900: 2 pc; FH > 380: 1 pc.', 'Side stabilisation: recommended for KB 900-1400 mm; aluminium rod suitable up to KB 1400, for cutting to size; no extra space at bottom; suits BLUMOTION | SERVO-DRIVE | TIP-ON BLUMOTION.', 'Flexible gallery fixing: for high fronted pull-outs taller than E (> 184 mm).', 'unverified: stabiliser drilling positions beyond X formulas are not legible (pages 285-286).'],
  pages: [285, 286, 287, 288],
};

const fixingPositions: FittingVariant = {
  id: 'cabinet-profile-fixing-positions', name: 'Cabinet profile fixing positions', summary: 'Screw positions along the cabinet profile for 450 (40 kg) and 453 (70 kg)',
  choices: { profile: ['450 40 kg', '453 70 kg'], nominalLength: [270, 300, 350, 400, 450, 500, 550, 600] },
  parts: [],
  dims: {
    positions450_270to350: d([19, 37, 69, 197, 229], 'Fixing hole positions, mm along profile (reference end unverified), cabinet profile 450 40 kg, NL 270-350; further holes by the 261/293 columns apply to NL 400-600 only', 289),
    positions450_400to600: d([19, 37, 69, 261, 293], 'Fixing hole positions, mm along profile (reference end unverified), cabinet profile 450 40 kg, NL 400-600', 289),
    positions453_450to550: d([19, 28, 37, 69, 261, 275, 293], 'Fixing hole positions, mm along profile (reference end unverified), cabinet profile 453 70 kg, NL 450-550', 289),
    positions453_600: d([19, 28, 37, 69, 261, 275, 293, 389, 403, 421], 'Fixing hole positions, mm along profile (reference end unverified), cabinet profile 453 70 kg, NL 600', 289),
  },
  drilling: [],
  notes: ['A = chipboard screws 4 x 15 mm; B = system screws 6 x 14.5 mm, part no. 661.1450.HG.',
    '* = positions for greater lateral stability (chipboard screws 4 x 15 mm); ** = positions for greater vertical stability (chipboard screws 4 x 15 mm; on the 453 profile may be replaced with chipboard screw 4 x 15 mm).',
    'unverified: which individual positions take screw A and which take screw B, and the reference end of the profile, are shown only by small symbols (page 289); the dimension lists are the printed header values per row.',
    'unverified: 450 profile NL 270-350 row shows positions 19, 37, 69, 197, 229; NL 400-600 row shows 19, 37, 69, 261, 293 (read from symbol alignment).'],
  pages: [289],
};

export const merivobox: FittingFamily[] = [
  {
    id: 'merivobox', kind: 'box', brand: 'Blum', name: 'MERIVOBOX',
    summary: 'Modular box system with cabinet profiles, colours SW-M, IG-M, OG-M; BLUMOTION integrated; combinable with SERVO-DRIVE and TIP-ON BLUMOTION',
    variants: [
      drawerN, drawerM, innerDrawerM, drawerK, innerDrawerK,
      hfpoGallery, hfpoBoxcover, hfpoBoxcap, innerBoxcapGallery, innerBoxcapDesign, wasteBin,
      drawerMCentre, hfpoBoxcapCentre, spaceTower, spaceTwin, glass, accessories, fixingPositions,
    ],
    document: DOC,
    pages: [250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289],
  },
];
