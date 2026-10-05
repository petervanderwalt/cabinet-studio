// LEGRABOX box system, transcribed from "Catalogue and technical manual 2024/2025", printed pages 196-249.
// Part numbers for the "colour" families are expanded per colour code so resolveParts() works on a colour choice.
// Symbols used by the catalogue: NL nominal length, LW internal cabinet width, KB cabinet width,
// FA front overlay, SPW internal cabinet width between the inner drawer sides.

import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025 (en)';

const D = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({
  value,
  unit,
  meaning,
  page,
});

const STEEL_COLOURS = ['SW-M', 'OG-M', 'CS-M'] as const;

// ---------------------------------------------------------------------------------------------------------------
// Part helpers
// ---------------------------------------------------------------------------------------------------------------

/** Cabinet profile pairs left/right (750 = 40 kg, 753 = 70 kg), BLUMOTION S. */
function profiles(page: number, kg40: number[], kg70: number[]): PartNumber[] {
  return [
    ...kg40.map<PartNumber>((nl) => ({
      role: 'cabinet-profile',
      partNo: `750.${nl}1S`,
      description: 'Cabinet profile left/right, BLUMOTION S, 40 kg',
      when: { nominalLength: nl, capacityKg: 40 },
      page,
    })),
    ...kg70.map<PartNumber>((nl) => ({
      role: 'cabinet-profile',
      partNo: `753.${nl}1S`,
      description: 'Cabinet profile left/right, BLUMOTION S, 70 kg',
      when: { nominalLength: nl, capacityKg: 70 },
      page,
    })),
  ];
}

interface SideSetOpts {
  /** Part number prefix up to and including the height letter, e.g. '770M' or '780C'. */
  prefix: string;
  /** Suffix for the steel colours (SW-M, OG-M, CS-M). */
  sufS?: string;
  /** Suffix for INGL. */
  sufI?: string;
  /** NLs available in steel colours. */
  s: number[];
  /** NLs available in INGL. */
  i?: number[];
  qty?: number;
  role?: string;
  description?: string;
}

/** Drawer side sets: one entry per colour code (SW-M, OG-M, CS-M share the S part number; INGL uses the I part number). */
function sideSets(page: number, o: SideSetOpts): PartNumber[] {
  const role = o.role ?? 'drawer-side-set';
  const desc = o.description ?? 'Drawer side set';
  const out: PartNumber[] = [];
  for (const nl of o.s) {
    for (const colour of STEEL_COLOURS) {
      out.push({
        role,
        partNo: `${o.prefix}${nl}${o.sufS ?? '2S'}`,
        description: desc,
        when: { nominalLength: nl, colour },
        ...(o.qty ? { qty: o.qty } : {}),
        page,
      });
    }
  }
  for (const nl of o.i ?? []) {
    out.push({
      role,
      partNo: `${o.prefix}${nl}${o.sufI ?? '2I'}`,
      description: `${desc}, stainless steel`,
      when: { nominalLength: nl, colour: 'INGL' },
      ...(o.qty ? { qty: o.qty } : {}),
      page,
    });
  }
  return out;
}

/** Chipboard back fixings left/right (one part number serves SW-M, OG-M, CS-M and NI). */
const backFixing = (page: number, partNo: string, qty?: number): PartNumber => ({
  role: 'back-fixing',
  partNo,
  description: 'Chipboard back fixings left/right, steel (SW-M/OG-M/CS-M/NI)',
  ...(qty ? { qty } : {}),
  page,
});

/** Front fixing brackets in the three fixing methods. `code` is the letter in ZF7<code>70E2. */
function frontBrackets(page: number, code: string, qty: number, role = 'front-fixing', label = 'Front fixing bracket'): PartNumber[] {
  return [
    { role, partNo: `ZF7${code}70E2`, description: `${label}, EXPANDO`, when: { frontFixing: 'EXPANDO' }, qty, page },
    { role, partNo: `ZF7${code}70T2`, description: `${label}, EXPANDO T (thin fronts)`, when: { frontFixing: 'EXPANDO T' }, qty, page },
    { role, partNo: `ZF7${code}7002`, description: `${label}, screw-on`, when: { frontFixing: 'Screw-on' }, qty, page },
  ];
}

/** Front fixing set (inner pull-outs / inner drawers). Steel part for SW-M/OG-M/CS-M, stainless for INGL. */
function frontSet(page: number, steel: string, inox?: string, label = 'Front fixing set'): PartNumber[] {
  const out: PartNumber[] = STEEL_COLOURS.map((colour) => ({
    role: 'front-fixing-set',
    partNo: steel,
    description: `${label}, steel`,
    when: { colour },
    page,
  }));
  if (inox) {
    out.push({ role: 'front-fixing-set', partNo: inox, description: `${label}, stainless steel`, when: { colour: 'INGL' }, page });
  }
  return out;
}

/** Screws listed under "Accessories" on each order page. */
function screws(page: number, with17: boolean): PartNumber[] {
  const out: PartNumber[] = [
    { role: 'accessory', partNo: '609.1500', description: 'Chipboard screw 3.5 x 15, front fixing', page },
  ];
  if (with17) out.push({ role: 'accessory', partNo: '609.1700', description: 'Chipboard screw 3.5 x 17, front fixing', page });
  out.push(
    { role: 'accessory', partNo: '61D.1500', description: 'Pan head fixing screw 4.0 x 15, back fixing/base', page },
    { role: 'accessory', partNo: '661.1450.HG', description: 'System screw 6.0 x 14.5, profile to cabinet', page },
  );
  return out;
}

const frontPiece = (page: number, partNo: string, grooved: boolean): PartNumber => ({
  role: 'front-piece',
  partNo,
  description: `Front piece ${grooved ? 'with' : 'without'} groove, length 1043, cut to size (SW-M/OG-M/CS-M/ELEO)`,
  page,
});

const latchSet = (page: number): PartNumber => ({
  role: 'latch-set',
  partNo: 'ZI7.0M07',
  description: 'Latch set, nylon, mounted on front piece (SW-M/OG-M/CS-M; CS-M also for INGL)',
  page,
});

const NL_STD = [270, 300, 350, 400, 450, 500, 550, 600, 650];

// ---------------------------------------------------------------------------------------------------------------
// Dimension helpers
// ---------------------------------------------------------------------------------------------------------------

/** Cutting and base drilling values printed on every planning page of a box variant. */
function cuttingDims(page: number, backHeight?: number): Record<string, DimSpec> {
  const d: Record<string, DimSpec> = {
    chipboardBackWidth: D('LW - 38', 'Chipboard back (B) width; LW = internal cabinet width', page),
    baseWidth: D('LW - 35', 'Drawer base (A) width; LW = internal cabinet width', page),
    baseLengthChipboardBack: D('NL - 10', 'Drawer base (A) length with a chipboard back; NL = nominal length', page),
    baseLengthSteelBack: D('NL - 21', 'Drawer base (A) length with a steel back; NL = nominal length', page),
    baseRebateWidth: D(38, 'unverified reading: rebate width along the base edge in the rebate drawing (shown as 38)', page),
    baseRebatePanelThickness: D(16, 'Base panel thickness in the rebate drawing (cutting is for 16 mm chipboard)', page),
    baseRebateRemaining: D(8, 'unverified reading: dimension 8 in the rebate drawing, taken as thickness left in the rebate', page),
    baseHoleSpacing: D(128, 'Base drilling: distance between the two holes along the base length (diagram "Drilling distances - base")', page),
    baseHoleFromEnd: D(24, 'Base drilling: dimension 24 from the base end to the first hole (end/edge not named on the page)', page),
    baseHoleFromSideEdge: D(48.5, 'Base drilling: dimension 48.5 from the base side edge to the hole line (edge not named on the page)', page),
  };
  if (backHeight !== undefined) {
    d.chipboardBackHeight = D(backHeight, 'Chipboard back (B) cut height, 16 mm chipboard', page);
  }
  return d;
}

interface BoxDimOpts {
  /** Order page (space requirement overview with total height). */
  orderPage: number;
  /** Planning page. */
  planPage: number;
  totalHeight: number;
  totalHeightMeaning: string;
  spaceAbove?: number;
  spaceAboveMeaning?: string;
  backHeight?: number;
  /** Page shows front drilling/installation (not for inner pull-outs). */
  frontPlanning?: boolean;
  frontHoleSpacing?: string;
  backHoleHeights?: number[];
  backHoleMeaning?: string;
}

/** Dimensions common to all LEGRABOX box variants (space requirement, installation, cutting). */
function boxDims(o: BoxDimOpts): Record<string, DimSpec> {
  const { orderPage: op, planPage: pp } = o;
  const d: Record<string, DimSpec> = {
    minInternalDepth: D('NL + 3', 'Space requirement in cabinet depth (front to back) for nominal length NL', op),
    spaceHeightOverview: D(o.totalHeight, o.totalHeightMeaning, op),
    spaceBelowProfile: D(38, 'Space requirement, lower part: "min 38*" measured from the cabinet bottom surface up to the profile level (spaceAboveProfile continues above it); +1 mm if the cabinet profile is installed before the cabinet is assembled', pp),
    spaceSideDistance: D(20.5, 'Space requirement diagram: horizontal dimension 20.5 at the cabinet base (unverified: exact start/end points are not named on the page)', pp),
    ...cuttingDims(pp, o.backHeight),
  };
  if (o.frontPlanning) {
    d.frontFixingAxisOffset = D(14, 'Installation dimensions, front: horizontal distance 14 shown between the front-fixing axis and the cabinet side (FA = front overlay is dimensioned next to it)', pp);
    d.frontMinThickness = D(12, 'Drilling distances, front: minimum front thickness, "min 12"; min 6 mm for EXPANDO T', pp);
  }
  if (o.spaceAbove !== undefined) {
    d.spaceAboveProfile = D(o.spaceAbove, o.spaceAboveMeaning ?? 'Space requirement: minimum clear height above the profile level (as dimensioned in the space-requirement diagram)', pp);
  }
  if (o.backHoleHeights) {
    d.backFixingHoleHeights = D(
      o.backHoleHeights,
      o.backHoleMeaning ??
        'Installation dimensions, back: hole positions of the back fixing measured upward from the lower edge, derived from the printed dimension chain (first value is the 19 mm dimension)',
      pp,
    );
    d.backFixingOffset = D(9, 'Installation dimensions, back: horizontal dimension 9 shown at the top of the back fixing (unverified: edges not named)', pp);
  }
  return d;
}

const baseDrillingNote =
  'unverified: base drilling diagram gives 24, 128 and 48.5 but no hole diameter, so no drilling rule is generated for the drawer base; see baseHole* dims.';

const frontHoleRef =
  'y measured upward from the datum line of the installation diagram (cabinet bottom level, front lower edge flush with it; the front drawing shows this as "min" to the front lower edge). x is not dimensioned: single column on the front-fixing axis.';

function frontHoles(ys: number[], note?: string) {
  return ys.map((y) => ({ x: 0, y, diameter: 10, ...(note ? { note } : {}) }));
}

function frontRule(
  id: string,
  label: string,
  ys: number[],
  page: number,
  extra: Partial<DrillingRule> = {},
): DrillingRule {
  return { id, target: 'front', label, reference: frontHoleRef, holes: frontHoles(ys), page, ...extra };
}

// ---------------------------------------------------------------------------------------------------------------
// STANDARD CABINET - LEGRABOX (pure and free)
// ---------------------------------------------------------------------------------------------------------------

const standardNL = {
  n: { s: [400, 450, 500, 550], i: [450, 500] },
  m: { s: NL_STD, i: NL_STD },
  k: { s: [300, 350, 400, 450, 500, 550, 600], i: [350, 400, 450, 500, 550] },
  c: { s: NL_STD, i: NL_STD },
  f: { s: [400, 450, 500, 550, 600, 650], i: [400, 450, 500, 550, 600, 650] },
};

const drawerN: FittingVariant = {
  id: 'drawer-n',
  name: 'Drawer N',
  summary: 'Standard cabinet drawer, drawer side height 66.5 mm, 40 kg, BLUMOTION S integrated',
  choices: {
    nominalLength: [400, 450, 500, 550],
    capacityKg: [40],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(200, [400, 450, 500, 550], []),
    ...sideSets(200, { prefix: '770N', s: standardNL.n.s, i: standardNL.n.i, description: 'Drawer side set, height 66.5' }),
    backFixing(200, 'ZB7N000S'),
    ...frontBrackets(200, 'N', 2),
    ...screws(200, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 200,
      frontPlanning: true,
      planPage: 201,
      totalHeight: 80,
      totalHeightMeaning: 'Space requirement height of the drawer in the cabinet (order page diagram)',
      spaceAbove: 42,
      spaceAboveMeaning: 'Space requirement: "min 42" clear height above the profile level in the space-requirement diagram',
      backHeight: 39,
      backHoleHeights: [19],
      backHoleMeaning: 'Installation dimensions, back: dimension 19 from the lower edge to the back-fixing hole (single hole shown)',
    }),
    drawerSideHeight: D(66.5, 'Drawer side height N', 200),
    frontHoleSpacing: D(16, 'Drilling distances, front: vertical distance between the two Ø10 front holes', 201),
    frontLowerHoleHeight: D(45.5, 'Drilling distances, front: "min 45.5*" from front lower edge/datum to the lower hole; +1 mm if cabinet profile is installed before the cabinet is assembled', 201),
    installFrontDimAtBase: D(23.4, 'Installation dimensions, front: dimension 23.4 shown at the base level (unverified: its start/end points are not named on the page)', 201),
  },
  drilling: [frontRule('n-front', 'Front, EXPANDO / EXPANDO T / screw-on', [45.5, 61.5], 201)],
  notes: [
    baseDrillingNote,
    'Front drilling distances apply to EXPANDO and EXPANDO T; EXPANDO T needs min front thickness 6 mm.',
    'unverified: drawer width, side clearance and the meaning of the 20.5 mm dimension are not stated in text on this page.',
  ],
  pages: [200, 201],
};

const drawerM: FittingVariant = {
  id: 'drawer-m',
  name: 'Drawer M',
  summary: 'Standard cabinet drawer, drawer side height 90.5 mm, 40/70 kg, BLUMOTION S integrated',
  choices: {
    nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(202, [270, 300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(202, { prefix: '770M', s: standardNL.m.s, i: standardNL.m.i, description: 'Drawer side set, height 90.5' }),
    backFixing(202, 'ZB7M000S'),
    ...frontBrackets(202, 'M', 2),
    ...screws(202, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 202,
      frontPlanning: true,
      planPage: 203,
      totalHeight: 106,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 106*)',
      spaceAbove: 68,
      spaceAboveMeaning: 'Space requirement: "min 68**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 63,
      backHoleHeights: [19, 51],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, then +32)',
    }),
    drawerSideHeight: D(90.5, 'Drawer side height M', 202),
    frontHoleSpacing: D(32, 'Drilling distances, front: vertical distance between the two Ø10 front holes', 203),
    frontLowerHoleHeight: D(51, 'Drilling distances, front: "min 51*" from front lower edge/datum to the lower hole; +1 mm if cabinet profile is installed before the cabinet is assembled', 203),
    installFrontDimAtBase: D(23.4, 'Installation dimensions, front: dimension 23.4 shown at the base level (unverified: its start/end points are not named on the page)', 203),
  },
  drilling: [frontRule('m-front', 'Front, EXPANDO / EXPANDO T / screw-on', [51, 83], 203)],
  notes: [baseDrillingNote, 'Three-dimensional front adjustment in the drawer side.'],
  pages: [202, 203],
};

const innerDrawerM: FittingVariant = {
  id: 'inner-drawer-m',
  name: 'Inner drawer M',
  summary: 'Inner drawer with solid front piece, drawer side height 90.5 mm, 40/70 kg',
  choices: {
    nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(204, [270, 300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(204, { prefix: '770M', s: standardNL.m.s, i: standardNL.m.i, description: 'Drawer side set, height 90.5' }),
    backFixing(204, 'ZB7M000S'),
    ...frontSet(204, 'ZI7.0MS0', 'ZI7.0MI0'),
    frontPiece(204, 'ZV7.1043C01', false),
    latchSet(204),
    ...screws(204, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 204,
      planPage: 205,
      totalHeight: 104,
      totalHeightMeaning: 'Space requirement height of the inner drawer (order page diagram); 109* when an inner drawer with latch set is used',
      spaceAbove: 66,
      spaceAboveMeaning: 'Space requirement: "min 66" clear height above the profile level; 71** with latch set (latch set possible from height 71 mm)',
      backHeight: 63,
      backHoleHeights: [19, 51],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, then +32)',
    }),
    drawerSideHeight: D(90.5, 'Drawer side height M', 204),
    spaceHeightWithLatchSet: D(109, 'Space requirement height of the inner drawer with latch set (order page, 109*)', 204),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) cut width; front piece length 1043 is for cutting to size, suitable for KB 1200', 204),
    latchHousingHoleDiameter: D(25, 'Drilling distances, front - latch housing: Ø25 hole, centred horizontally on the front', 205),
    latchHousingHoleFromTop: D(17, 'Drilling distances, front - latch housing: "min 17" dimension drawn from the Ø25 hole (unverified: the edge it is measured from is not named)', 205),
    latchHousingDim59: D(59, 'Drilling distances, front - latch housing: dimension 59 (unverified reference points)', 205),
    latchHousingDimXPlus46: D('x + 46', 'Drilling distances, front - latch housing: dimension x + 46 (unverified reference points; x not defined in text)', 205),
  },
  drilling: [],
  notes: [
    baseDrillingNote,
    'Latch set ZI7.0M07 cannot be used in combination with TIP-ON BLUMOTION; latch must be mounted on the front piece.',
    'unverified: front-fixing drilling for the inner drawer front is only given as latch-housing drawing; hole diameters for the front fixing set are not stated.',
  ],
  pages: [204, 205],
};

const drawerK: FittingVariant = {
  id: 'drawer-k',
  name: 'Drawer K',
  summary: 'Standard cabinet drawer, drawer side height 128.5 mm, 40/70 kg, BLUMOTION S integrated',
  choices: {
    nominalLength: [300, 350, 400, 450, 500, 550, 600],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(206, [300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600]),
    ...sideSets(206, { prefix: '770K', s: standardNL.k.s, i: standardNL.k.i, description: 'Drawer side set, height 128.5' }),
    backFixing(206, 'ZB7K000S'),
    ...frontBrackets(206, 'K', 2),
    ...screws(206, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 206,
      frontPlanning: true,
      planPage: 207,
      totalHeight: 144,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 144*)',
      spaceAbove: 106,
      spaceAboveMeaning: 'Space requirement: "min 106**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 101,
      backHoleHeights: [19, 51, 83],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +32)',
    }),
    drawerSideHeight: D(128.5, 'Drawer side height K', 206),
    frontHoleSpacing: D(32, 'Drilling distances, front: vertical distance between the two Ø10 front holes', 207),
    frontLowerHoleHeight: D(51, 'Drilling distances, front: "min 51*" from front lower edge/datum to the lower hole; +1 mm if cabinet profile is installed before the cabinet is assembled', 207),
    installFrontDimAtBase: D(23.4, 'Installation dimensions, front: dimension 23.4 shown at the base level (unverified: its start/end points are not named on the page)', 207),
  },
  drilling: [frontRule('k-front', 'Front, EXPANDO / EXPANDO T / screw-on', [51, 83], 207)],
  notes: [baseDrillingNote, 'Three-dimensional front adjustment in the drawer side.'],
  pages: [206, 207],
};

const innerDrawerK: FittingVariant = {
  id: 'inner-drawer-k',
  name: 'Inner drawer K',
  summary: 'Inner drawer with mid-height solid front piece, drawer side height 128.5 mm, 40/70 kg',
  choices: {
    nominalLength: [300, 350, 400, 450, 500, 550, 600],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(208, [300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600]),
    ...sideSets(208, { prefix: '770K', s: standardNL.k.s, i: [350, 400, 450, 500, 550], description: 'Drawer side set, height 128.5' }),
    backFixing(208, 'ZB7K000S'),
    ...frontSet(208, 'ZI7.0KS0', 'ZI7.0KI0'),
    frontPiece(208, 'ZV7.1043C01', false),
    latchSet(208),
    ...screws(208, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 208,
      planPage: 209,
      totalHeight: 142,
      totalHeightMeaning: 'Space requirement height of the inner drawer (order page diagram)',
      spaceAbove: 104,
      spaceAboveMeaning: 'Space requirement: clear height above the profile level, dimension 104 in the space-requirement diagram',
      backHeight: 101,
      backHoleHeights: [19, 51, 83],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +32)',
    }),
    drawerSideHeight: D(128.5, 'Drawer side height K', 208),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) cut width; front piece length 1043 is for cutting to size, suitable for KB 1200', 208),
    latchHousingHoleDiameter: D(25, 'Drilling distances, front - latch housing: Ø25 hole, centred horizontally on the front', 209),
    latchHousingHoleFromTop: D(17, 'Drilling distances, front - latch housing: "min 17" dimension drawn from the Ø25 hole (unverified: the edge it is measured from is not named)', 209),
    latchHousingDim59: D(59, 'Drilling distances, front - latch housing: dimension 59 (unverified reference points)', 209),
    latchHousingDimXPlus46: D('x + 46', 'Drilling distances, front - latch housing: dimension x + 46 (unverified reference points; x not defined in text)', 209),
  },
  drilling: [],
  notes: [
    baseDrillingNote,
    'Latch set ZI7.0M07 cannot be used in combination with TIP-ON BLUMOTION; latch must be mounted on the front piece.',
    'unverified: 209 shows no min-height footnote for the latch set on the inner drawer K.',
  ],
  pages: [208, 209],
};

// ---------------------------------------------------------------------------------------------------------------
// STANDARD CABINET - LEGRABOX pure
// ---------------------------------------------------------------------------------------------------------------

const C_BACK_HOLES = [19, 51, 115, 131];
const C_FRONT_4 = [51, 83, 179];
const C_FRONT_4A = [51, 83, 147, 179];

const pureC: FittingVariant = {
  id: 'pure-high-fronted-pullout-c',
  name: 'LEGRABOX pure - High fronted pull-out C',
  summary: 'Standard cabinet high fronted pull-out, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: NL_STD,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    frontBracketOption: ['4 (2x ZF7C...)', '4a (4x ZF7M...)'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(210, [270, 300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(210, { prefix: '770C', s: NL_STD, i: NL_STD, description: 'Drawer side set, height 177' }),
    backFixing(210, 'ZB7C000S'),
    ...frontBrackets(210, 'C', 2).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (2x ZF7C...)' } })),
    ...frontBrackets(210, 'M', 4, 'front-fixing-alt', 'Front fixing bracket (alternative 4a)').map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4a (4x ZF7M...)' } })),
    ...screws(210, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 210,
      frontPlanning: true,
      planPage: 211,
      totalHeight: 193,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 193*)',
      spaceAbove: 155,
      spaceAboveMeaning: 'Space requirement: "min 155**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 210),
    installFrontDimAtBase: D(24.4, 'Installation dimensions, front: dimension 24.4 shown at the base level (unverified: its start/end points are not named on the page)', 211),
  },
  drilling: [
    frontRule('c-front-4', 'Front, bracket option 4 (EXPANDO / EXPANDO T)', C_FRONT_4, 211),
    frontRule('c-front-4a', 'Front, alternative option 4a (EXPANDO / EXPANDO T)', C_FRONT_4A, 211),
  ],
  notes: [
    baseDrillingNote,
    'Front hole rows: lowest hole min 51* above datum (+1 mm if profile is installed before the cabinet is assembled); option 4 gaps 32 then 96; option 4a gaps 32, 64, 32.',
    'Option 4a uses 4x ZF7M... brackets instead of 2x ZF7C... brackets.',
  ],
  pages: [210, 211],
};

const pureInnerDesignC: FittingVariant = {
  id: 'pure-inner-pullout-design-element-c',
  name: 'LEGRABOX pure - Inner pull-out design element C',
  summary: 'Inner pull-out with high or low glass design element, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: NL_STD,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    designElementHeight: ['Low', 'High'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(212, [270, 300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(212, { prefix: '770C', s: NL_STD, i: NL_STD, description: 'Drawer side set, height 177' }),
    backFixing(212, 'ZB7C000S'),
    ...frontSet(212, 'ZI7.2CS0', 'ZI7.2CI0'),
    { ...frontPiece(212, 'ZV7.1043MN1', true) },
    { role: 'glass-design-element', partNo: 'ZE7VxxxxG', description: 'Low glass design element for front (see p. 234)', when: { designElementHeight: 'Low' }, page: 212 },
    { role: 'glass-design-element', partNo: 'ZE7WxxxxG', description: 'High glass design element for front (see p. 234)', when: { designElementHeight: 'High' }, page: 212 },
    ...screws(212, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 212,
      planPage: 213,
      totalHeight: 191,
      totalHeightMeaning: 'Space requirement height of the inner pull-out (order page diagram)',
      spaceAbove: 153,
      spaceAboveMeaning: 'Space requirement: clear height above the profile level, dimension 153',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 212),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) with groove, cut width; length 1043 for cutting to size, suitable for KB 1200', 212),
    glassLowX: D('LW - 80', 'Glass design element, low: cutting dimension X (width)', 213),
    glassLowY: D(70, 'Glass design element, low: cutting dimension Y (height)', 213),
    glassHighX: D('LW - 80', 'Glass design element, high: cutting dimension X (width)', 213),
    glassHighY: D(138, 'Glass design element, high: cutting dimension Y (height)', 213),
  },
  drilling: [],
  notes: [
    baseDrillingNote,
    'Glass dimensions in combination with LEGRABOX need no impact testing per DIN EN 14749 (June 2016); edge polished flat-ended, 1 mm bevel +/-0.5 mm.',
    'Adapter piece for low design element is part of the front fixing set (4d).',
    'Front-fixing drilling for the inner pull-out front is not shown on page 213.',
  ],
  pages: [212, 213],
};

const pureInnerGalleryC: FittingVariant = {
  id: 'pure-inner-pullout-gallery-c',
  name: 'LEGRABOX pure - Inner pull-out gallery C',
  summary: 'Inner pull-out with cross gallery, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: NL_STD,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(214, [270, 300, 350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(214, { prefix: '770C', s: NL_STD, i: NL_STD, description: 'Drawer side set, height 177' }),
    backFixing(214, 'ZB7C000S'),
    ...frontSet(214, 'ZI7.3CS0', 'ZI7.3CI0'),
    frontPiece(214, 'ZV7.1043C01', false),
    { role: 'cross-gallery', partNo: 'ZR7.1080U', description: 'Cross gallery, length 1080, cut to size (SW-M/OG-M/CS-M/ELEO)', page: 214 },
    ...screws(214, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 214,
      planPage: 215,
      totalHeight: 191,
      totalHeightMeaning: 'Space requirement height of the inner pull-out (order page diagram)',
      spaceAbove: 153,
      spaceAboveMeaning: 'Space requirement: clear height above the profile level, dimension 153',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 214),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) cut width; length 1043 for cutting to size, suitable for KB 1200', 214),
    crossGalleryCutWidth: D('LW - 90', 'Cross gallery (7) cut width; length 1080 for cutting to size, suitable for KB 1200', 214),
  },
  drilling: [],
  notes: [baseDrillingNote],
  pages: [214, 215],
};

const pureF: FittingVariant = {
  id: 'pure-high-fronted-pullout-f',
  name: 'LEGRABOX pure - High fronted pull-out F',
  summary: 'Standard cabinet high fronted pull-out, drawer side height 241 mm, 40/70 kg',
  choices: {
    nominalLength: [400, 450, 500, 550, 600, 650],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    frontBracketOption: ['4 (2x ZF7M... + 2x ZF7C...)', '4a (6x ZF7M...)'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(216, [400, 450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(216, { prefix: '770F', s: standardNL.f.s, i: standardNL.f.i, description: 'Drawer side set, height 241' }),
    backFixing(216, 'ZB7F000S'),
    ...frontBrackets(216, 'M', 2).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (2x ZF7M... + 2x ZF7C...)' } })),
    ...frontBrackets(216, 'C', 2).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (2x ZF7M... + 2x ZF7C...)' } })),
    ...frontBrackets(216, 'M', 6, 'front-fixing-alt', 'Front fixing bracket (alternative 4a)').map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4a (6x ZF7M...)' } })),
    ...screws(216, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 216,
      frontPlanning: true,
      planPage: 217,
      totalHeight: 257,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 257*)',
      spaceAbove: 219,
      spaceAboveMeaning: 'Space requirement: "min 219**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 212,
      backHoleHeights: [19, 51, 147, 179],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +96, +32)',
    }),
    drawerSideHeight: D(241, 'Drawer side height F', 216),
    installFrontDimAtBase: D(24.4, 'Installation dimensions, front: dimension 24.4 shown at the base level (unverified: its start/end points are not named on the page)', 217),
  },
  drilling: [
    frontRule('f-front-4', 'Front, bracket option 4 (EXPANDO / EXPANDO T)', [51, 83, 179, 211, 243], 217),
    frontRule('f-front-4a', 'Front, alternative option 4a (EXPANDO / EXPANDO T)', [51, 83, 147, 179, 211, 243], 217),
  ],
  notes: [
    baseDrillingNote,
    'Front hole rows read from the drawing top to bottom: option 4 gaps 32, 32, 96, 32 then min 51*; option 4a gaps 32, 32, 32, 64, 32 then min 51*.',
    'unverified: the 96 gap in option 4 is drawn with a break symbol; value taken from the printed dimension.',
  ],
  pages: [216, 217],
};

// ---------------------------------------------------------------------------------------------------------------
// STANDARD CABINET - LEGRABOX free
// ---------------------------------------------------------------------------------------------------------------

const FREE_NL = [350, 400, 450, 500, 550, 600, 650];
const freeProfiles = (page: number) => profiles(page, [350, 400, 450, 500, 550, 600], [450, 500, 550, 600, 650]);

const freeSideSet = (page: number): PartNumber[] =>
  sideSets(page, { prefix: '780C', s: FREE_NL, description: 'Drawer side set with design element fixings, height 177' });

const transportLock = (page: number): PartNumber => ({
  role: 'accessory',
  partNo: '780C0009',
  description: 'Transportation lock for pre-assembled side design element, yellow nylon',
  page,
});

const glassSidePart = (page: number): PartNumber => ({
  role: 'glass-design-element',
  partNo: 'ZE7Sxx8G',
  description: 'Glass design element (side), see p. 234',
  page,
});

const freeC: FittingVariant = {
  id: 'free-high-fronted-pullout-c',
  name: 'LEGRABOX free - High fronted pull-out C',
  summary: 'Standard cabinet high fronted pull-out with glass side design element, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: FREE_NL,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    frontBracketOption: ['4 (2x ZF7C...)', '4a (4x ZF7M...)'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...freeProfiles(218),
    ...freeSideSet(218),
    backFixing(218, 'ZB7C000S'),
    ...frontBrackets(218, 'C', 2).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (2x ZF7C...)' } })),
    ...frontBrackets(218, 'M', 4, 'front-fixing-alt', 'Front fixing bracket (alternative 4a)').map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4a (4x ZF7M...)' } })),
    glassSidePart(218),
    transportLock(218),
    ...screws(218, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 218,
      frontPlanning: true,
      planPage: 219,
      totalHeight: 193,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 193*)',
      spaceAbove: 155,
      spaceAboveMeaning: 'Space requirement: "min 155**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 218),
    installFrontDimAtBase: D(24.4, 'Installation dimensions, front: dimension 24.4 shown at the base level (unverified: its start/end points are not named on the page)', 219),
    glassSideX: D('NL - 112', 'Glass design element (side): cutting dimension X (length)', 219),
    glassSideY: D(138, 'Glass design element (side): cutting dimension Y (height)', 219),
  },
  drilling: [
    frontRule('free-c-front-4', 'Front, bracket option 4 (EXPANDO / EXPANDO T)', C_FRONT_4, 219),
    frontRule('free-c-front-4a', 'Front, alternative option 4a (EXPANDO / EXPANDO T)', C_FRONT_4A, 219),
  ],
  notes: [
    baseDrillingNote,
    'Drawer side set consists of side, branding elements, BOXCOVER front (2x) and BOXCOVER back; side design element is ordered separately (9a).',
    'Glass dimensions in combination with LEGRABOX need no impact testing per DIN EN 14749 (June 2016); edge polished flat-ended, 1 mm bevel +/-0.5 mm.',
    'Colours for LEGRABOX free side sets: SW-M, OG-M, CS-M (no INGL column).',
  ],
  pages: [218, 219],
};

const freeInnerDesignC: FittingVariant = {
  id: 'free-inner-pullout-design-element-c',
  name: 'LEGRABOX free - Inner pull-out design element C',
  summary: 'Inner pull-out with glass front and side design elements, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: FREE_NL,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M'],
    designElementHeight: ['Low', 'High'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...freeProfiles(220),
    ...freeSideSet(220),
    backFixing(220, 'ZB7C000S'),
    ...frontSet(220, 'ZI7.2CS0'),
    frontPiece(220, 'ZV7.1043MN1', true),
    glassSidePart(220),
    { role: 'glass-design-element', partNo: 'ZE7VxxxxG', description: 'Low glass design element for front (see p. 234)', when: { designElementHeight: 'Low' }, page: 220 },
    { role: 'glass-design-element', partNo: 'ZE7WxxxxG', description: 'High glass design element for front (see p. 234)', when: { designElementHeight: 'High' }, page: 220 },
    transportLock(220),
    ...screws(220, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 220,
      planPage: 221,
      totalHeight: 191,
      totalHeightMeaning: 'Space requirement height of the inner pull-out (order page diagram)',
      spaceAbove: 153,
      spaceAboveMeaning: 'Space requirement: clear height above the profile level, dimension 153',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 220),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) with groove, cut width; length 1043 for cutting to size, suitable for KB 1200', 220),
    glassLowX: D('LW - 80', 'Glass design element, low: cutting dimension X (width)', 221),
    glassLowY: D(70, 'Glass design element, low: cutting dimension Y (height)', 221),
    glassHighX: D('LW - 80', 'Glass design element, high: cutting dimension X (width)', 221),
    glassHighY: D(138, 'Glass design element, high: cutting dimension Y (height)', 221),
    glassSideX: D('NL - 112', 'Glass design element (side): cutting dimension X (length)', 221),
    glassSideY: D(138, 'Glass design element (side): cutting dimension Y (height)', 221),
  },
  drilling: [],
  notes: [
    baseDrillingNote,
    'Base drilling refers back to page 210 ("Drilling distances - base 210").',
    'Glass dimensions in combination with LEGRABOX need no impact testing per DIN EN 14749 (June 2016).',
  ],
  pages: [220, 221],
};

const freeInnerGalleryC: FittingVariant = {
  id: 'free-inner-pullout-gallery-c',
  name: 'LEGRABOX free - Inner pull-out gallery C',
  summary: 'Inner pull-out with cross gallery and glass side design element, drawer side height 177 mm, 40/70 kg',
  choices: {
    nominalLength: FREE_NL,
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...freeProfiles(222),
    ...freeSideSet(222),
    backFixing(222, 'ZB7C000S'),
    ...frontSet(222, 'ZI7.3CS0'),
    frontPiece(222, 'ZV7.1043C01', false),
    { role: 'cross-gallery', partNo: 'ZR7.1080U', description: 'Cross gallery, length 1080, cut to size (SW-M/OG-M/CS-M)', page: 222 },
    glassSidePart(222),
    transportLock(222),
    ...screws(222, false),
  ],
  dims: {
    ...boxDims({
      orderPage: 222,
      planPage: 223,
      totalHeight: 191,
      totalHeightMeaning: 'Space requirement height of the inner pull-out (order page diagram)',
      spaceAbove: 153,
      spaceAboveMeaning: 'Space requirement: clear height above the profile level, dimension 153',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 222),
    frontPieceCutWidth: D('LW - 126', 'Front piece (5) cut width; length 1043 for cutting to size, suitable for KB 1200', 222),
    crossGalleryCutWidth: D('LW - 90', 'Cross gallery (7) cut width; length 1080 for cutting to size, suitable for KB 1200', 222),
    glassSideX: D('NL - 112', 'Glass design element (side): cutting dimension X (length)', 223),
    glassSideY: D(138, 'Glass design element (side): cutting dimension Y (height)', 223),
  },
  drilling: [],
  notes: [baseDrillingNote, 'Base drilling refers back to page 210 ("Drilling distances - base 210").'],
  pages: [222, 223],
};

// ---------------------------------------------------------------------------------------------------------------
// SINK CABINET
// ---------------------------------------------------------------------------------------------------------------

const SINK_NL = [350, 400, 450, 500, 550, 600];

const sinkCommonDims = (page: number): Record<string, DimSpec> => ({
  sinkBasePieceWidthMin: D(115, 'Sink cabinet base pieces A1/A2: Y min, width of each base piece (Y1, Y2)', page),
  sinkBasePieceWidthMax: D(155, 'Sink cabinet base pieces A1/A2: Y max, width of each base piece (Y1, Y2)', page),
  sinkBaseGap: D('SPW + 20', 'Dimension drawn between the two base pieces A1/A2 (unverified: which edges it spans; SPW = internal cabinet width between the inner drawer sides)', page),
  sinkBackPieceWidth: D('Y1 - 3 and Y2 - 3', 'Chipboard back pieces B1/B2 width, from Y1/Y2 of the matching base piece', page),
  sinkFrontHoleColumnSpacing: D('Y + 7', 'Drilling distances, front: horizontal spacing of the two hole columns (Y = base piece width; unverified: exact definition of Y not restated)', page),
});

const sinkM: FittingVariant = {
  id: 'sink-drawer-m',
  name: 'Sink cabinet - Drawer M',
  summary: 'Sink cabinet drawer for LEGRABOX pure and free, side height 90.5 mm, 40 kg, two side sets',
  choices: {
    nominalLength: SINK_NL,
    capacityKg: [40],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(224, SINK_NL, []),
    ...sideSets(224, { prefix: '770M', s: SINK_NL, i: SINK_NL, qty: 2, description: 'Drawer side set, height 90.5 (2 sets)' }),
    backFixing(224, 'ZB7M000S', 2),
    ...frontBrackets(224, 'M', 4),
    ...screws(224, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 224,
      frontPlanning: true,
      planPage: 225,
      totalHeight: 106,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 106*)',
      spaceAbove: 68,
      spaceAboveMeaning: 'Space requirement: "min 68**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 63,
      backHoleHeights: [19, 51],
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32)',
    }),
    drawerSideHeight: D(90.5, 'Drawer side height M', 224),
    frontHoleSpacing: D(32, 'Drilling distances, front: vertical distance between the hole rows', 225),
    frontLowerHoleHeight: D(51, 'Drilling distances, front: "min 51*" to the lower hole row; +1 mm if profile installed before cabinet assembly', 225),
    ...sinkCommonDims(225),
  },
  drilling: [frontRule('sink-m-front', 'Front, left hole column (second column at Y + 7)', [51, 83], 225)],
  notes: [
    'Sink cabinet uses two cabinet profile pairs, two drawer side sets, two back fixing sets and four front fixing brackets (quantities as printed on page 224).',
    baseDrillingNote,
    'Cutting: base is cut as two pieces A1/A2 and chipboard back as two pieces B1/B2 (rebate dimension drawing as for standard cabinet).',
  ],
  pages: [224, 225],
};

const sinkPureC: FittingVariant = {
  id: 'sink-pure-high-fronted-pullout-c',
  name: 'Sink cabinet LEGRABOX pure - High fronted pull-out C',
  summary: 'Sink cabinet high fronted pull-out, drawer side height 177 mm, 40 kg, two side sets',
  choices: {
    nominalLength: SINK_NL,
    capacityKg: [40],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    frontBracketOption: ['4 (4x ZF7C...)', '4a (8x ZF7M...)'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(226, SINK_NL, []),
    ...sideSets(226, { prefix: '770C', s: SINK_NL, i: SINK_NL, qty: 2, description: 'Drawer side set, height 177 (2 sets)' }),
    backFixing(226, 'ZB7C000S', 2),
    ...frontBrackets(226, 'C', 4).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (4x ZF7C...)' } })),
    ...frontBrackets(226, 'M', 8, 'front-fixing-alt', 'Front fixing bracket (alternative 4a)').map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4a (8x ZF7M...)' } })),
    ...screws(226, true),
  ],
  dims: {
    ...boxDims({
      orderPage: 226,
      frontPlanning: true,
      planPage: 227,
      totalHeight: 193,
      totalHeightMeaning: 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 193*)',
      spaceAbove: 155,
      spaceAboveMeaning: 'Space requirement: "min 155**" clear height above the profile level, incl. 2 mm tilt adjustment',
      backHeight: 148,
      backHoleHeights: C_BACK_HOLES,
      backHoleMeaning: 'Installation dimensions, back: hole positions from the lower edge (19, +32, +64, +16)',
    }),
    drawerSideHeight: D(177, 'Drawer side height C', 226),
    ...sinkCommonDims(227),
  },
  drilling: [
    frontRule('sink-c-front-4', 'Front, bracket option 4, left hole column (second column at Y + 7)', C_FRONT_4, 227),
    frontRule('sink-c-front-4a', 'Front, alternative 4a, left hole column (second column at Y + 7)', C_FRONT_4A, 227),
  ],
  notes: [
    'Sink cabinet uses two profile pairs, two side sets, two back fixing sets (quantities as printed on page 226).',
    baseDrillingNote,
    'Free variant of the sink high fronted pull-out is listed in the overview (p. 199, web code DQBN9C) but has no order page in this range.',
  ],
  pages: [226, 227],
};

const sinkPureCentre: FittingVariant = {
  id: 'sink-pure-high-fronted-pullout-c-centre-piece',
  name: 'Sink cabinet LEGRABOX pure - High fronted pull-out C with centre piece',
  summary: 'Sink cabinet pull-out C with exterior sides, interior sides (M height) and steel back L shape, 40/70 kg',
  choices: {
    nominalLength: [450, 500, 550, 600, 650],
    capacityKg: [40, 70],
    colour: ['SW-M', 'OG-M', 'CS-M', 'INGL'],
    interiorNominalLength: [300, 350, 400, 450, 500],
    frontFixing: ['EXPANDO', 'EXPANDO T', 'Screw-on'],
    frontBracketOption: ['4 (2x ZF7C...)', '4a (4x ZF7M...)'],
    version: ['BLUMOTION S'],
  },
  parts: [
    ...profiles(228, [450, 500, 550, 600], [450, 500, 550, 600, 650]),
    ...sideSets(228, { prefix: '770C', s: [450, 500, 550, 600, 650], i: [450, 500, 550, 600, 650], role: 'drawer-side-set-exterior', description: 'Drawer side set exterior, height 177' }),
    ...[300, 350, 400, 450, 500].flatMap((nl) => [
      ...STEEL_COLOURS.map<PartNumber>((colour) => ({
        role: 'drawer-side-set-interior',
        partNo: `770M${nl}2S`,
        description: 'Drawer side set interior, height 90.5',
        when: { interiorNominalLength: nl, colour },
        page: 228,
      })),
      {
        role: 'drawer-side-set-interior',
        partNo: `770M${nl}2I`,
        description: 'Drawer side set interior, height 90.5, stainless steel',
        when: { interiorNominalLength: nl, colour: 'INGL' },
        page: 228,
      } as PartNumber,
    ]),
    {
      role: 'steel-back',
      partNo: 'ZB7C129S.6S',
      description: 'Steel back L shape left/right (SW-M/OG-M/CS-M)',
      page: 228,
    },
    ...frontBrackets(228, 'C', 2).map((p) => ({ ...p, when: { ...p.when, frontBracketOption: '4 (2x ZF7C...)' } })),
    { role: 'front-fixing-alt', partNo: 'ZF7M70E2', description: 'Front fixing bracket (alternative 4a), EXPANDO', when: { frontFixing: 'EXPANDO', frontBracketOption: '4a (4x ZF7M...)' }, qty: 4, page: 228 },
    { role: 'front-fixing-alt', partNo: 'ZF7M70T2', description: 'Front fixing bracket (alternative 4a), EXPANDO T', when: { frontFixing: 'EXPANDO T', frontBracketOption: '4a (4x ZF7M...)' }, qty: 4, page: 228 },
    { role: 'front-fixing-alt', partNo: 'ZF7M7002', description: 'Front fixing bracket (alternative 4a), screw-on', when: { frontFixing: 'Screw-on', frontBracketOption: '4a (4x ZF7M...)' }, qty: 4, page: 228 },
    { role: 'front-fixing-centre', partNo: 'ZF7M70E2', description: 'Front fixing bracket 4b for centre piece, EXPANDO', when: { frontFixing: 'EXPANDO' }, qty: 2, page: 228 },
    { role: 'front-fixing-centre', partNo: 'ZF7M7002', description: 'Front fixing bracket 4b for centre piece, screw-on', when: { frontFixing: 'Screw-on' }, qty: 2, page: 228 },
    ...screws(228, true),
  ],
  dims: {
    minInternalDepth: D('NL + 3', 'Space requirement in cabinet depth for nominal length NL (exterior drawer sides)', 228),
    spaceHeightOverview: D(193, 'Space requirement height incl. 2 mm tilt adjustment (order page diagram, 193*)', 228),
    spaceAboveProfile: D(155, 'Space requirement: "min 155**" clear height above the profile level, incl. 2 mm tilt adjustment', 229),
    spaceBelowProfile: D(38, 'Space requirement, lower part: "min 38*" from the cabinet bottom surface up to the profile level; +1 mm if profile installed before cabinet assembly', 229),
    drawerSideHeightExterior: D(177, 'Drawer side height of exterior sides (C)', 228),
    drawerSideHeightInterior: D(90.5, 'Drawer side height of interior sides (M)', 228),
    minNLDifferenceExteriorInterior: D(150, 'Recommended minimum: NL of exterior sides (no. 2) minus NL of interior sides (no. 11), for effective use of storage space', 228),
    frontMinThickness: D(12, 'Drilling distances, front: minimum front thickness, "min 12"; min 6 mm for EXPANDO T', 229),
    frontFixingAxisOffset: D(14, 'Installation dimensions, front: horizontal distance 14 between the front-fixing axis and the cabinet side', 229),
    baseLengthSteelBack: D('NL - 21', 'Drawer base (A) length with the steel back L shape; NL = nominal length of exterior sides', 229),
    baseWidth: D('LW - 35', 'Drawer base (A) width; LW = internal cabinet width', 229),
    baseUCutoutWidth: D('SPW + 20', 'Base (A) U-shaped cut-out width; SPW = internal cabinet width between the inner drawer sides', 229),
    baseUCutoutDepth: D(138, 'Base (A) U-shaped cut-out depth (cutting drawing)', 229),
    baseSidePieceWidth: D(125, 'Base (A) side leg width, each side (cutting drawing shows 125 on both legs)', 229),
    centrePieceWidth: D('SPW + 27', 'Centre piece (C) width; +3 mm with ZF7M70E2 (i.e. SPW + 30)', 229),
    centrePieceHeight: D(62.5, 'Centre piece (C) height, 16 mm chipboard', 229),
    centrePieceInstallDims: D([7, 32, 11.5, 62.5], 'Installation dimensions - centre piece: values 7*, 32, 11.5 and 62.5 read from the drawing (62.5 = piece height; +1.5 mm with ZF7M70E2; other references not named)', 229),
    baseDrillingCutout: D([128, 36, 48.5, 24, 128], 'Base drilling diagram values for the U-cutout base (128, 36, 48.5, 24, 128) and radius R10 at the inner corners; hole diameters and reference edges are not stated', 229),
    baseCutoutCornerRadius: D(10, 'Base cut-out inner corner radius R10', 229),
  },
  drilling: [
    frontRule('sink-centre-front-4', 'Front, bracket option 4', C_FRONT_4, 229),
    frontRule('sink-centre-front-4a', 'Front, alternative option 4a', C_FRONT_4A, 229),
  ],
  notes: [
    'unverified: drawing at p. 229 gives hole-position values for the U-cutout base without diameters; kept as dims only.',
    'Recommended: NL of exterior sides minus NL of interior sides at least 150 mm.',
    'Brackets ZF7M70E2 / ZF7M7002 for the centre piece (4b) are offered in EXPANDO and screw-on only (no EXPANDO T entry).',
  ],
  pages: [228, 229],
};

// ---------------------------------------------------------------------------------------------------------------
// LARDER UNIT and NARROW CABINETS
// ---------------------------------------------------------------------------------------------------------------

const spaceTower: FittingVariant = {
  id: 'larder-space-tower',
  name: 'SPACE TOWER larder unit',
  summary: 'Larder unit with inner pull-outs; 40/70 kg; cabinet width KB 275-1200 mm',
  choices: { capacityKg: [40, 70], cabinetWidthKB: ['275-1200'] },
  parts: [],
  dims: {
    cabinetWidthRange: D('275-1200', 'Recommended cabinet width KB', 230),
    pulloutLevelHeights: D(
      [57, 436, 756, 1108, 1428, 1684],
      'Positioning in the cabinet: height levels read from the cabinet bottom (0). 57* is the lowest pull-out level, the others follow upward; 1684 is the top line (shelf level). +1 mm for 57 if cabinet profile is installed before the cabinet is assembled',
      231,
    ),
    pulloutLevelSteps: D([379, 320, 352, 320, 256], 'Vertical distances between consecutive levels, from the lowest upward (57 to 436 = 379, then 320, 352, 320, 256)', 231),
    spaceBelowLowest: D(38, 'Min 38* below the lowest pull-out level (+1 mm if profile installed before cabinet assembly)', 231),
    bottomPanelOffset: D(19, 'Dimension 19 shown at the cabinet bottom, left of the profile (unverified: which part it measures)', 231),
    hingeDistanceFromTopOfFront: D(80, 'Drilling distances, front: top hinge distance 80 from the top of the front (hinge axis to front top edge)', 231),
    hingesOptionA: D([280, 1025], 'Drilling distances, front (first option, hinges besides the 80 mm top hinge): hinge positions 280 and 1025 measured from the front lower edge', 231),
    hingesOptionB: D([280, 670, 1340], 'Drilling distances, front (second option, hinges besides the 80 mm top hinge): hinge positions 280, 670 and 1340 measured from the front lower edge', 231),
  },
  drilling: [],
  notes: [
    'Application recommendation: Inner drawer M (p. 204) at the top; Inner pull-out design element C (p. 212); AMBIA-LINE inner dividing system (p. 547); CLIP top BLUMOTION 155 deg hinge (p. 84).',
    'Hinge counts and which front height each option belongs to: see p. 718 (number of hinges).',
    'unverified: hinge cup diameter and exact front height for the two hinge layouts are not stated on page 231.',
    'It is practical to have a shelf at the highest level instead of an inner drawer in high cabinets.',
  ],
  pages: [230, 231],
};

const spaceTwin: FittingVariant = {
  id: 'narrow-space-twin',
  name: 'SPACE TWIN narrow cabinets',
  summary: 'Narrow cabinets, diagonally offset cabinet profiles, 20 kg per base cabinet, KB 185-250 mm',
  choices: { cabinetWidthKB: ['185-250'], drawerHeight: ['M', 'K', 'C'], capacityKg: [20] },
  parts: [],
  dims: {
    cabinetWidthRange: D('185-250', 'Cabinet width KB', 232),
    capacityPerBaseCabinet: D(20, 'Dynamic carrying capacity per base cabinet', 232, 'kg'),
    minInternalWidth: D(147, 'Space requirement: "min 147" horizontal dimension in the plan drawing', 233),
    spaceBelowProfile: D(38, 'Space requirement: "min 38*"; +1 mm if profile installed before cabinet assembly', 233),
    spaceSideDistance: D(20.5, 'Space requirement: horizontal dimension 20.5 (unverified: exact points not named)', 233),
    installHeightX_M: D(68, 'Installation height X for drawer height M', 233),
    installHeightX_K: D(106, 'Installation height X for drawer height K', 233),
    installHeightX_C: D(155, 'Installation height X for drawer height C', 233),
    frontHoleSpacing: D(32, 'Installation dimensions, front: spacing between the two front holes', 233),
    frontLowerHoleHeight: D(51, 'Installation dimensions, front: 51* to the lower hole; +1 mm if profile installed before cabinet assembly', 233),
    frontFixingAxisOffset: D(14, 'Installation dimensions, front: 14 on each side (FA front overlay beyond)', 233),
    drawerSideHeightY_C: D(96, 'Table "Height of drawer side Y": value for C (M and K show a dash)', 233),
  },
  drilling: [],
  notes: [
    'Application recommendation: Drawer M (p. 202), Drawer K (p. 206), High fronted pull-out C (p. 210).',
    'Stable solution through diagonally offset cabinet profiles; includes integrated, switchable BLUMOTION S.',
    'unverified: the Y dimension on the installation-dimension drawing is only tabulated for C (96); its start/end points are not named.',
  ],
  pages: [232, 233],
};

// ---------------------------------------------------------------------------------------------------------------
// DESIGN ELEMENT (glass)
// ---------------------------------------------------------------------------------------------------------------

const glassDesign: FittingVariant = {
  id: 'glass-design-element',
  name: 'Glass design element',
  summary: 'Clear glass design elements for inner pull-out fronts (pure/free) and side elements (free)',
  choices: {
    cabinetWidthKB: [600, 1200],
    sidePanelThickness: ['15/16', '18/19'],
    designElementHeight: ['Low', 'High', 'Side'],
    nominalLength: [450, 500, 550, 600, 650],
    colour: ['Clear'],
  },
  parts: [
    { role: 'glass-design-element', partNo: 'ZE7V488G', description: 'Low glass element, front, KB 600', when: { designElementHeight: 'Low', cabinetWidthKB: 600, sidePanelThickness: '15/16' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7V482G', description: 'Low glass element, front, KB 600', when: { designElementHeight: 'Low', cabinetWidthKB: 600, sidePanelThickness: '18/19' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7V1088G', description: 'Low glass element, front, KB 1200', when: { designElementHeight: 'Low', cabinetWidthKB: 1200, sidePanelThickness: '15/16' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7V1082G', description: 'Low glass element, front, KB 1200', when: { designElementHeight: 'Low', cabinetWidthKB: 1200, sidePanelThickness: '18/19' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7W488G', description: 'High glass element, front, KB 600', when: { designElementHeight: 'High', cabinetWidthKB: 600, sidePanelThickness: '15/16' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7W482G', description: 'High glass element, front, KB 600', when: { designElementHeight: 'High', cabinetWidthKB: 600, sidePanelThickness: '18/19' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7W1088G', description: 'High glass element, front, KB 1200', when: { designElementHeight: 'High', cabinetWidthKB: 1200, sidePanelThickness: '15/16' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7W1082G', description: 'High glass element, front, KB 1200', when: { designElementHeight: 'High', cabinetWidthKB: 1200, sidePanelThickness: '18/19' }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7S338G', description: 'Glass side element pair (2x), LEGRABOX free', when: { designElementHeight: 'Side', nominalLength: 450 }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7S388G', description: 'Glass side element pair (2x), LEGRABOX free', when: { designElementHeight: 'Side', nominalLength: 500 }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7S438G', description: 'Glass side element pair (2x), LEGRABOX free', when: { designElementHeight: 'Side', nominalLength: 550 }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7S488G', description: 'Glass side element pair (2x), LEGRABOX free', when: { designElementHeight: 'Side', nominalLength: 600 }, page: 234 },
    { role: 'glass-design-element', partNo: 'ZE7S538G', description: 'Glass side element pair (2x), LEGRABOX free', when: { designElementHeight: 'Side', nominalLength: 650 }, page: 234 },
    { role: 'accessory', partNo: '780C0009', description: 'Transportation lock for pre-assembled side element, yellow nylon', page: 234 },
  ],
  dims: {
    lowX: D('LW - 80', 'Cutting - design element, low: X (width); LW = internal cabinet width', 234),
    lowY: D(70, 'Cutting - design element, low: Y (height)', 234),
    highX: D('LW - 80', 'Cutting - design element, high: X (width)', 234),
    highY: D(138, 'Cutting - design element, high: Y (height)', 234),
    sideX: D('NL - 112', 'Cutting - design element, side: X (length); NL = nominal length', 234),
    sideY: D(138, 'Cutting - design element, side: Y (height)', 234),
    glassEdgeBevel: D(1, 'Polished flat-ended edge with 1 mm bevel, tolerance +/-0.5 mm', 234),
  },
  drilling: [],
  notes: [
    'Front elements (7): for other cabinet widths KB, cut the next longer element to size. Side elements (9a): for other NL, cut the next longer to size.',
    'Front element KB 600 / 1200 columns: 15/16 mm and 18/19 mm cabinet side panel thickness SWD.',
    'Side element (9a) is a pair (consisting of 2x glass design element).',
    'Dimensions given with LEGRABOX do not require impact testing per DIN EN 14749 (June 2016); no safety glass required.',
  ],
  pages: [234],
};

// ---------------------------------------------------------------------------------------------------------------
// DESIGN OPTIONS
// ---------------------------------------------------------------------------------------------------------------

const SPECIAL_SIDE: Record<string, number[]> = {
  M: [270, 300, 350, 400, 450, 500, 550, 600, 650],
  K: [300, 350, 400, 450, 500, 550, 600],
  C: [270, 300, 350, 400, 450, 500, 550, 600, 650],
  F: [400, 450, 500, 550, 600, 650],
};

const specialInterior: PartNumber[] = Object.entries(SPECIAL_SIDE).flatMap(([h, nls]) =>
  nls.map<PartNumber>((nl) => ({
    role: 'drawer-side-set-interior',
    partNo: `770${h}${nl}1S`,
    description: `Interior drawer side set, CS-M, height ${h}`,
    when: { drawerSideHeight: h, nominalLength: nl },
    page: 238,
  })),
);

const specialDecor: PartNumber[] = Object.keys(SPECIAL_SIDE).flatMap((h) => {
  const mk = (colour: string, suffix: string): PartNumber => ({
    role: 'decorative-element-exterior',
    partNo: `770${h}xxx${suffix}`,
    description: `Decorative element exterior left/right, ${colour}, height ${h} (xxx = NL)`,
    when: { drawerSideHeight: h, decorColour: colour },
    page: 239,
  });
  return [mk('CS-M', 'AS'), mk('INGL', 'AI'), mk('CSCL', 'ASGC'), mk('NR', 'AS')];
});

const insulating = (['M', 'K', 'C', 'F'] as const).map<PartNumber>((h) => ({
  role: 'accessory',
  partNo: `770${h}0009`,
  description: `Insulating piece, black foam, height ${h} (on request)`,
  when: { drawerSideHeight: h },
  page: 239,
}));

const brandingParts = (page: number): PartNumber[] => [
  { role: 'branding-element', partNo: 'ZA7.0700xxxABD', description: 'Branding element individual, SW-M/OG-M/CS-M, nylon (on request)', qty: 2, when: { brandingColour: 'SW-M/OG-M/CS-M' }, page },
  { role: 'branding-element', partNo: 'ZA7.0709xxxAB', description: 'Branding element individual, IN-G/KU-G/GO-G in-mould brushed, nylon (on request)', qty: 2, when: { brandingColour: 'IN-G/KU-G/GO-G' }, page },
];

const specialEdition: FittingVariant = {
  id: 'design-special-edition',
  name: 'LEGRABOX special edition',
  summary: 'Final assembly on site: interior drawer side CS-M plus separate decorative element (exterior)',
  choices: {
    drawerSideHeight: ['M', 'K', 'C', 'F'],
    nominalLength: NL_STD,
    decorColour: ['CS-M', 'INGL', 'CSCL', 'NR'],
  },
  parts: [
    ...specialInterior,
    ...specialDecor,
    ...brandingParts(239),
    ...insulating,
    { role: 'accessory', partNo: '770.0008', description: 'LEGRABOX decorative element fixing (2f), dark grey nylon (see p. 242)', page: 242 },
  ],
  dims: {},
  drilling: [],
  notes: [
    'Interior side set (CS-M) consists of left/right drawer sides, 2 cover caps, 2 branding elements (stamped with Blum logo) and 2 decorative element fixings.',
    'Interior side set NL by height: M 270-650, K 300-600, C 270-650, F 400-650 (no K at 650).',
    'Decorative element NL ranges per height as printed on p. 239: M 270-650, K 300-600, C 270-650, F 400-650; CSCL has no design line; NR and CS-M share the printed number 770<h>xxxAS.',
    'xxx in part numbers is the nominal length NL as stated on p. 239; the drawer side height N is not part of the design options (use an N side that matches the customised interior side).',
    'Insulating piece: for NL 270-300 the piece is halved at the perforation; items marked "on request" in the catalogue.',
    'Branding element xxx code is not explained on pages 239/243; kept as printed.',
  ],
  pages: [238, 239],
};

const individualPatterns = (page: number, incl: { i: boolean; l?: boolean }): PartNumber[] => {
  const out: PartNumber[] = [
    { role: 'drawer-side-set-interior', partNo: '770Xxxx1S', description: 'Drawer side interior, left (X = height M/K/C/F, xxx = NL), SW-M/OG-M/CS-M (on request)', when: { version: 'Left' }, page },
    { role: 'drawer-side-set-interior', partNo: '770Xxxx1S', description: 'Drawer side interior, right (order left/right separately), SW-M/OG-M/CS-M (on request)', when: { version: 'Right' }, page },
  ];
  if (incl.i) {
    out.push(
      { role: 'drawer-side-set-interior', partNo: '770Xxxx1I', description: 'Drawer side interior, left, INGL (on request)', when: { version: 'Left', colour: 'INGL' }, page },
      { role: 'drawer-side-set-interior', partNo: '770Xxxx1I', description: 'Drawer side interior, right, INGL (on request)', when: { version: 'Right', colour: 'INGL' }, page },
    );
  }
  return out;
};

const individual: FittingVariant = {
  id: 'design-individual',
  name: 'LEGRABOX individual',
  summary: 'Colour/material mix, printing, laser engraving, embossing; interior side plus decorative element',
  choices: {
    drawerSideHeight: ['M', 'K', 'C', 'F'],
    nominalLength: NL_STD,
    designOption: ['colour mix', 'material mix', 'printing', 'laser engraving', 'embossing'],
    version: ['Left', 'Right'],
  },
  parts: [
    ...individualPatterns(240, { i: false }).map((p) => ({ ...p, when: { ...p.when, designOption: 'colour mix' } })),
    { role: 'decorative-element-exterior', partNo: '770XxxxAS', description: 'Decorative element exterior with design line, SW-M/OG-M/CS-M (on request)', when: { designOption: 'colour mix' }, page: 240 },
    { role: 'decorative-element-exterior', partNo: '770XxxxASR', description: 'Decorative element exterior without design line, SW-M/OG-M/CS-M (on request)', when: { designOption: 'colour mix' }, page: 240 },
    ...individualPatterns(240, { i: false }).map((p) => ({ ...p, when: { ...p.when, designOption: 'material mix' } })),
    { role: 'decorative-element-exterior', partNo: '770XxxxAI', description: 'Decorative element exterior with design line, INGL (on request)', when: { designOption: 'material mix' }, page: 240 },
    { role: 'decorative-element-exterior', partNo: '770XxxxAIR', description: 'Decorative element exterior without design line, INGL (on request)', when: { designOption: 'material mix' }, page: 240 },
    ...individualPatterns(241, { i: true }).map((p) => ({ ...p, when: { ...p.when, designOption: 'printing' } })),
    { role: 'decorative-element-exterior', partNo: '770XxxxASR', description: 'Decorative element exterior without design line, SW-M/OG-M/CS-M (on request)', when: { designOption: 'printing' }, page: 241 },
    { role: 'decorative-element-exterior', partNo: '770XxxxAIR', description: 'Decorative element exterior without design line, INGL (on request)', when: { designOption: 'printing' }, page: 241 },
    ...individualPatterns(241, { i: true }).map((p) => ({ ...p, when: { ...p.when, designOption: 'laser engraving' } })),
    { role: 'decorative-element-exterior', partNo: '770XxxxAIL', description: 'Decorative element exterior without design line, laser, INGL (on request)', when: { designOption: 'laser engraving' }, page: 241 },
    ...individualPatterns(242, { i: false }).map((p) => ({ ...p, when: { ...p.when, designOption: 'embossing' } })),
    { role: 'decorative-element-exterior', partNo: '770XxxxASR', description: 'Decorative element exterior without design line, SW-M/OG-M/CS-M (on request)', when: { designOption: 'embossing' }, page: 242 },
    { role: 'cover-cap-internal', partNo: 'ZA7.5700.BT', description: 'Internal cover cap, nylon, SW-M/OG-M/CS-M, min order 1000 (Blum print)', page: 242 },
    { role: 'cover-cap-internal', partNo: 'ZA7.5709.BT', description: 'Internal cover cap, nylon, INGL, min order 1000 (Blum print)', page: 242 },
    { role: 'accessory', partNo: '770.0008', description: 'LEGRABOX decorative element fixing (2f), dark grey nylon', page: 242 },
    ...insulating.map((p) => ({ ...p, page: 242 })),
  ],
  dims: {},
  drilling: [],
  notes: [
    'In "Xxxx": X = drawer side height (M, K, C, F) and xxx = nominal length NL (270-650); drawer sides left and right are ordered separately.',
    'Individual designs start from an increased minimum order quantity; contact the Blum representative.',
    'Items marked with the telephone pictograph are available on request.',
    'Without design line: printed or embossed with custom logo (colour mix), lasered (material mix/laser engraving, decor INGL).',
  ],
  pages: [240, 241, 242],
};

const brandingIndividual: FittingVariant = {
  id: 'branding-element-individual',
  name: 'Branding element individual',
  summary: 'Customised branding element for all LEGRABOX design options, 2 pieces per set',
  choices: {
    brandingColour: ['SW-M/OG-M/CS-M', 'IN-G/KU-G/GO-G'],
    process: ['Custom printed (min 1000)', 'Individual recessed embossed (min 5000)'],
  },
  parts: brandingParts(243),
  dims: {
    minOrderCustomPrinted: { value: 1000, meaning: 'Minimum order quantity in pieces, custom printed', page: 243 },
    minOrderEmbossed: { value: 5000, meaning: 'Minimum order quantity in pieces, individual recessed embossed', page: 243 },
  },
  drilling: [],
  notes: [
    'Colours: SW-M silk white matt, OG-M orion grey matt, CS-M carbon black matt; IN-G in-mould brushed stainless, KU-G in-mould brushed copper, GO-G in-mould brushed gold.',
    'The xxx code in the part number is not explained on page 243.',
  ],
  pages: [243],
};

// ---------------------------------------------------------------------------------------------------------------
// ACCESSORIES
// ---------------------------------------------------------------------------------------------------------------

const steelBack: FittingVariant = {
  id: 'accessory-steel-back',
  name: 'Steel back',
  summary: 'Steel back for LEGRABOX in SW-M / OG-M / CS-M; xxx = LW - 31',
  choices: { backHeight: ['N', 'M', 'K', 'C', 'F'], colour: ['SW-M', 'OG-M', 'CS-M'] },
  parts: (['N', 'M', 'K', 'C', 'F'] as const).map<PartNumber>((h) => ({
    role: 'steel-back',
    partNo: `ZB7${h}xxxS.6`,
    description: `Steel back, height ${h} (xxx = LW - 31), on request${h === 'N' ? '; not compatible with SERVO-DRIVE' : ''}`,
    when: { backHeight: h },
    page: 244,
  })),
  dims: {
    backWidthCode: D('LW - 31', 'Back width "xxx" in the part number; LW = internal cabinet width (example: LW 567 gives ZB7M536S.6)', 244),
    baseLengthSteelBack: D('NL - 21', 'Drawer base (A) length with steel back; NL = nominal length', 244),
    baseWidth: D('LW - 35', 'Drawer base (A) width', 244),
    baseRebateWidth: D(38, 'unverified reading: rebate width in the rebate drawing (shown as 38)', 244),
    baseRebatePanelThickness: D(16, 'Panel thickness in the rebate drawing', 244),
    baseRebateRemaining: D(8, 'unverified reading: dimension 8 in the rebate drawing', 244),
    steelBackFlange: D(16, 'Calculation-of-width detail: dimension 16 at the steel back top fold (unverified reference)', 244),
  },
  drilling: [],
  notes: ['Back height N is not compatible with SERVO-DRIVE.', 'Items marked on request (telephone pictograph).'],
  pages: [244],
};

const stabilisers: FittingVariant = {
  id: 'accessory-stabilisers',
  name: 'Front/base stabiliser, thin-front stabiliser and side stabilisation',
  summary: 'Stabilisers for wide drawer bases/fronts and extra wide high fronted pull-outs',
  choices: { stabiliser: ['Front/base (EXPANDO)', 'Thin fronts (EXPANDO T)', 'Side stabilisation'], nominalLength: [270, 300, 350, 400, 450, 500, 550, 600, 650] },
  parts: [
    { role: 'stabiliser', partNo: 'Z96.10E1', description: 'Front/base stabiliser, EXPANDO, RAL 7037 dust grey', when: { stabiliser: 'Front/base (EXPANDO)' }, page: 244 },
    { role: 'stabiliser', partNo: 'Z96.00T1', description: 'Front/base stabiliser for thin fronts, EXPANDO T, RAL 7037', when: { stabiliser: 'Thin fronts (EXPANDO T)' }, page: 245 },
    ...[270, 300, 350, 400].map<PartNumber>((nl) => ({
      role: 'stabiliser',
      partNo: 'ZS7M400LU',
      description: 'Side stabilisation set, aluminium rod, NL 270-400',
      when: { stabiliser: 'Side stabilisation', nominalLength: nl },
      page: 245,
    })),
    ...[450, 500, 550, 600, 650].map<PartNumber>((nl) => ({
      role: 'stabiliser',
      partNo: 'ZS7M650LU',
      description: 'Side stabilisation set, aluminium rod, NL 450-650',
      when: { stabiliser: 'Side stabilisation', nominalLength: nl },
      page: 245,
    })),
  ],
  dims: {
    recommendFrontBaseKB: D('> 900', 'Front/base stabiliser (EXPANDO): recommended 1 pc for cabinet width KB above 900 mm', 244),
    thinRecommendKB600: D('> 600', 'Thin-front stabiliser: 1 pc recommended for cabinet width KB above 600 mm', 245),
    thinRecommendKB900: D('> 900', 'Thin-front stabiliser: 2 pc recommended for cabinet width KB above 900 mm', 245),
    thinRecommendFH: D('> 380', 'Thin-front stabiliser: 1 pc recommended for front height FH above 380 mm', 245),
    sideStabRecommendKB: D('900-1400', 'Side stabilisation: recommended for cabinet width KB 900-1400 mm; rod suits KB up to 1400', 245),
    sideStabRodLength: D('LW - 295', 'Side stabilisation cutting 1: aluminium rod length; LW = internal cabinet width', 245),
    sideStabPartLength: D('NL + 10', 'Side stabilisation cutting 2: length; NL = nominal length', 245),
    sideStabDepth: D('NL + 15', 'Side stabilisation: space requirement in cabinet depth', 245),
    stabFrontX: D('14 + FA', 'Front/base stabiliser, drilling distances front: X = 14 mm + FA (FA = front overlay), from the front edge to the outer hole column (as drawn)', 244),
    stabFrontMinBetween: D(72, 'Front/base stabiliser: min distance "=*" between the outer holes and the centre hole pair, as drawn (min 72)', 244),
    stabFrontCentreHoleSpacing: D(32, 'Front/base stabiliser: spacing between the two lower holes', 244),
    stabFrontUpperRowHeight: D(51, 'Front/base stabiliser: "min 51" from the front lower edge to the upper hole row', 244),
    stabFrontRowGap: D(28, 'Front/base stabiliser: vertical gap between upper and lower hole rows', 244),
    stabFrontMinThickness: D(10, 'Front/base stabiliser: front thickness dimension "min 10" at the bottom of the drawing (unverified reference)', 244),
    stabFrontDepthDims: D([9, 6, 10], 'Front/base stabiliser space requirement drawing: values min 9, 6, Ø10 (unverified references)', 244),
    thinStabFrontX: D('14 + FA', 'Thin-front stabiliser, drilling distances front: X = 14 mm + FA', 245),
    thinStabFrontMinBetween: D(80, 'Thin-front stabiliser: min distance "=*" between the hole columns (min 80)', 245),
    thinStabRowGap: D(35, 'Thin-front stabiliser: vertical gap between upper and lower hole rows', 245),
    thinStabUpperRowHeight: D(51, 'Thin-front stabiliser: "min 51" from the front lower edge to the upper hole row', 245),
    thinStabHoleTolerance: D('+0.1/-0.1', 'Thin-front stabiliser: Ø10 hole tolerance; stone and ceramic +0.2/-0.1 mm', 245),
    thinStabFrontMinThickness: D(6, 'Thin-front stabiliser: "min 6" front thickness', 245),
    thinStabDepthDims: D([24.4, 13, 10, 6], 'Thin-front stabiliser space requirement drawing: values 24.4, 13, Ø10, min 6 (unverified references)', 245),
  },
  drilling: [
    {
      id: 'stab-front',
      target: 'front',
      label: 'Front/base stabiliser (EXPANDO): two upper holes and two lower holes',
      reference:
        'y measured upward from the lower edge of the front (upper row "min 51", lower row 28 below it = 23). x not given as an absolute number: upper holes at X = 14 mm + FA from the front edges, lower holes 32 apart, symmetrical on the centre line.',
      holes: [
        { x: 0, y: 51, diameter: 10, note: 'upper row, left (x = X from edge)' },
        { x: 0, y: 51, diameter: 10, note: 'upper row, right (x = X from edge)' },
        { x: 0, y: 23, diameter: 10, note: 'lower row, left of centre (32 mm between the two lower holes)' },
        { x: 0, y: 23, diameter: 10, note: 'lower row, right of centre' },
      ],
      page: 244,
    },
    {
      id: 'stab-thin-front',
      target: 'front',
      label: 'Thin-front stabiliser (EXPANDO T): two upper holes and one lower centre hole',
      reference:
        'y measured upward from the lower edge of the front (upper row "min 51", lower row 35 below it = 16). x not given as an absolute number: upper holes at X = 14 mm + FA from the front edges, lower hole on the centre line.',
      holes: [
        { x: 0, y: 51, diameter: 10, note: 'upper row, left; tolerance +0.1/-0.1 (stone, ceramic +0.2/-0.1)' },
        { x: 0, y: 51, diameter: 10, note: 'upper row, right' },
        { x: 0, y: 16, diameter: 10, note: 'lower row, centre' },
      ],
      page: 245,
    },
  ],
  notes: [
    'unverified: stabiliser drilling x positions are dimensioned relative to FA (front overlay) and the front width, so x is stored as 0 with the formula in the note/reference.',
    'Side stabilisation is suitable for use with BLUMOTION, SERVO-DRIVE, TIP-ON BLUMOTION and TIP-ON; no additional space requirement at the bottom.',
    'Thin-front stabiliser references: fixing system for thin fronts EXPANDO T (p. 596), assembly recommendation and limitation of liability (p. 597).',
  ],
  pages: [244, 245],
};

const supportAndFixings: FittingVariant = {
  id: 'accessory-support-screws-tools',
  name: 'Support angle bracket, screws, centre bit, door buffers and screwdrivers',
  summary: 'Small accessories listed for LEGRABOX',
  choices: {},
  parts: [
    { role: 'accessory', partNo: 'ZB7A0008', description: 'Support angle bracket, steel', page: 246 },
    { role: 'accessory', partNo: '61D.1500', description: 'Pan head fixing screw 4.0 x 15, nickel plated steel', page: 246 },
    { role: 'accessory', partNo: '609.1500', description: 'Chipboard screw 3.5 x 15, nickel plated steel', page: 246 },
    { role: 'accessory', partNo: '609.1700', description: 'Chipboard screw 3.5 x 17, nickel plated steel', page: 246 },
    { role: 'accessory', partNo: '661.1000.HG', description: 'System screw 6.0 x 10 (drill Ø5)', page: 246 },
    { role: 'accessory', partNo: '661.1150.HG', description: 'System screw 6.0 x 11.5 (drill Ø5)', page: 246 },
    { role: 'accessory', partNo: '661.1300.HG', description: 'System screw 6.0 x 13 (drill Ø5)', page: 246 },
    { role: 'accessory', partNo: '661.1450.HG', description: 'System screw 6.0 x 14.5 (drill Ø5)', page: 246 },
    { role: 'accessory', partNo: '661.2000.HG', description: 'System screw 6.0 x 20 (drill Ø5)', page: 246 },
    { role: 'tool', partNo: 'M01.ZZ03.01', description: 'Centre bit Ø2.7 for 3.5 chipboard screws', page: 246 },
    { role: 'tool', partNo: 'M01.ZZB3', description: 'Replacement bit for centre bit', page: 246 },
    { role: 'accessory', partNo: '993.710', description: 'Stick-on door buffer Ø8, natural nylon', page: 246 },
    { role: 'accessory', partNo: '993.706', description: 'Door buffer Ø8, two-part, RAL 9006 grey', page: 247 },
    { role: 'tool', partNo: '303.756.1', description: 'Pozidriv PZ 2 screwdriver, 210 mm', page: 247 },
    { role: 'tool', partNo: '314.928.1', description: 'Slotted size 1 screwdriver, 200 mm', page: 247 },
    { role: 'tool', partNo: '623.882.2', description: 'TORX T20 screwdriver, 100 mm', page: 247 },
    { role: 'tool', partNo: '209.093.7', description: 'TORX T20 screwdriver, 210 mm', page: 247 },
  ],
  dims: {
    systemScrewDrillDiameter: D(5, 'Drilling diameter for the Ø6.0 system screw', 246),
    centreBitDepth: D(8, 'Centre bit: drilling depth up to 8 mm for Ø3.5 chipboard screws', 246),
    doorBufferStickOnDiameter: D(8, 'Stick-on door buffer diameter', 246),
    doorBufferTwoPartDiameter: D(8, '8 mm Ø two-part door buffer diameter', 247),
    doorBufferMinDim: D(10, 'Two-part door buffer drawing: "min 10" (unverified: exact meaning, probably drilling depth)', 247),
  },
  drilling: [],
  notes: [
    'The support angle bracket makes it possible to combine a drawer base for steel backs with a chipboard back (uniform cutting dimension) and connects chipboard back/centre piece to the base.',
    'Pan head screw 61D.1500 is recommended for connecting chipboard back fixings with chipboard back and drawer side with drawer bases.',
  ],
  pages: [246, 247],
};

// ---------------------------------------------------------------------------------------------------------------
// CABINET PROFILE FIXING POSITIONS (p. 248)
// ---------------------------------------------------------------------------------------------------------------

const profileFixing: FittingVariant = {
  id: 'cabinet-profile-fixing-positions',
  name: 'Cabinet profile fixing positions',
  summary: 'Screw positions along cabinet profile 750 (40 kg) and 753 (70 kg) by nominal length',
  choices: { capacityKg: [40, 70], nominalLength: NL_STD },
  parts: [
    { role: 'accessory', partNo: '661.1450.HG', description: 'System screw 6 x 14.5 (symbol B)', page: 248 },
  ],
  dims: {
    fixing750NL270: D([19, 37, 69, 197], 'Profile 750, NL 270: fixing positions along the profile in mm (column header values with a symbol in the 270 row); 19 can be replaced with chipboard screw 4 x 15', 248),
    fixing750NL300to350: D([19, 37, 69, 229, 261], 'Profile 750, NL 300-350: fixing positions in mm; 243 is also on the header and its symbol in this row is not clearly readable (unverified)', 248),
    fixing750NL400to500: D([19, 37, 69, 243, 261, 293], 'Profile 750, NL 400-500: fixing positions in mm', 248),
    fixing750NL550to600: D([19, 37, 69, 243, 261, 293, 357], 'Profile 750, NL 550-600: fixing positions in mm', 248),
    fixing753NL450: D([19, 28, 37, 69, 243, 261, 293], 'Profile 753, NL 450: fixing positions in mm, plus one optional extra position (**) for greater stability, position not readable (unverified)', 248),
    fixing753NL500to600: D([19, 28, 37, 69, 243, 261, 293, 357], 'Profile 753, NL 500-600: fixing positions in mm, plus one optional extra position (**) for greater stability, position not readable (unverified)', 248),
    fixing753NL650: D([19, 28, 37, 69, 243, 261, 293, 357, 453], 'Profile 753, NL 650: fixing positions in mm, plus one optional extra position (**) for greater stability, position not readable (unverified)', 248),
  },
  drilling: [],
  notes: [
    'Legend: A = chipboard screws 4 x 15 mm, B = system screws 6 x 14.5 mm (part no. 661.1450.HG). The row symbols (white/half-black circles) are not decoded here: unverified which positions take A and which take B.',
    'unverified: the reference point for the positions (assumed measured along the profile length from its front end) is not stated on the page.',
    'Position 19* can be replaced with a chipboard screw 4 x 15 mm; ** = optional for greater stability (753 profile).',
  ],
  pages: [248],
};

// ---------------------------------------------------------------------------------------------------------------
// OVERVIEW values (p. 198-199) attached to a lightweight variant
// ---------------------------------------------------------------------------------------------------------------

const overview: FittingVariant = {
  id: 'overview',
  name: 'LEGRABOX overview - applications and space requirement heights',
  summary: 'Applications with dynamic carrying capacity, space requirement height and page, from the overview tables',
  choices: {
    application: [
      'Drawer N',
      'Drawer M',
      'Inner drawer M',
      'Drawer K',
      'Inner drawer K',
      'High fronted pull-out C (pure)',
      'Inner pull-out design element C (pure)',
      'Inner pull-out gallery C (pure)',
      'High fronted pull-out F (pure)',
      'High fronted pull-out C (free)',
      'Inner pull-out design element C (free)',
      'Inner pull-out gallery C (free)',
      'Sink drawer M',
      'Sink high fronted pull-out C (pure)',
      'Sink high fronted pull-out C centre piece (pure)',
      'SPACE TOWER',
      'SPACE TWIN',
    ],
  },
  parts: [],
  dims: {
    heightN: D(80, 'Space requirement height, Drawer N (p. 200)', 198),
    heightM: D(106, 'Space requirement height, Drawer M (p. 202)', 198),
    heightInnerM: D(104, 'Space requirement height, Inner drawer M (p. 204)', 198),
    heightK: D(144, 'Space requirement height, Drawer K (p. 206)', 198),
    heightInnerK: D(142, 'Space requirement height, Inner drawer K (p. 208)', 198),
    heightHighFrontedC: D(193, 'Space requirement height, High fronted pull-out C pure/free (pp. 210, 218) and sink C (pp. 226, 228)', 198),
    heightInnerPulloutC: D(191, 'Space requirement height, Inner pull-out C design element/gallery pure/free (pp. 212, 214, 220, 222)', 198),
    heightHighFrontedF: D(257, 'Space requirement height, High fronted pull-out F pure (p. 216)', 198),
    capacityN: D(40, 'Dynamic carrying capacity N', 198, 'kg'),
    capacityStandardMaxKg: D(70, 'Dynamic carrying capacity for M, K, C and F (40 or 70 kg selectable); N is 40 kg only', 198, 'kg'),
    capacitySinkKg: D(40, 'Sink cabinet entries in the overview list 40 kg (the centre-piece order page, p. 228, lists both 750 40 kg and 753 70 kg profiles)', 199, 'kg'),
    spaceTowerCapacity: D([40, 70], 'SPACE TOWER dynamic carrying capacity', 199, 'kg'),
    spaceTowerKB: D('275-1200', 'SPACE TOWER cabinet width KB', 199),
    spaceTwinCapacity: D(20, 'SPACE TWIN dynamic carrying capacity per base cabinet', 199, 'kg'),
    spaceTwinKB: D('185-250', 'SPACE TWIN cabinet width KB', 199),
  },
  drilling: [],
  notes: [
    'Colour combination recommendation (p. 199): drawer side set, back fixings, front fixing set, front pieces and latch set are recommended in matching colour; SW-M, OG-M, CS-M pair with INGL side sets/front fixing sets, nickel (NI) or CS-M back fixings, ELEO front pieces.',
    'Colour codes: CS-M carbon black matt, ELEO anodised stainless steel appearance, INGL stainless steel anti-fingerprint, NI nickel plated, OG-M orion grey matt, SW-M silk white matt.',
    'The Sink cabinet - LEGRABOX free high fronted pull-out C centre piece (web code DQBN9C, p. 199) has no page number in the overview.',
  ],
  pages: [196, 197, 198, 199],
};

// ---------------------------------------------------------------------------------------------------------------

export const legrabox: FittingFamily[] = [
  {
    id: 'legrabox',
    kind: 'box',
    brand: 'Blum',
    name: 'LEGRABOX',
    summary:
      'Steel box system with 12.8 mm drawer sides, integrated switchable BLUMOTION S, synchronised glide; 40/70 kg; pure and free styles; drawer heights N, M, K, C, F',
    variants: [
      overview,
      drawerN,
      drawerM,
      innerDrawerM,
      drawerK,
      innerDrawerK,
      pureC,
      pureInnerDesignC,
      pureInnerGalleryC,
      pureF,
      freeC,
      freeInnerDesignC,
      freeInnerGalleryC,
      sinkM,
      sinkPureC,
      sinkPureCentre,
      spaceTower,
      spaceTwin,
      glassDesign,
      specialEdition,
      individual,
      brandingIndividual,
      steelBack,
      stabilisers,
      supportAndFixings,
      profileFixing,
    ],
    document: DOC,
    pages: Array.from({ length: 249 - 196 + 1 }, (_, i) => 196 + i),
  },
];
