// TANDEMBOX antaro (printed pp. 290-335) and TANDEMBOX plus (pp. 336-337), transcribed from the
// Blum "Catalogue and technical manual 2024/2025". All page numbers are PRINTED page numbers.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const NL_ALL = [270, 300, 350, 400, 450, 500, 550, 600, 650];
const NL_30 = [270, 300, 350, 400, 450, 500, 550, 600];
const NL_65 = [450, 500, 550, 600, 650];

const dim = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({
  value,
  unit,
  meaning,
  page,
});
const fdim = (value: string, meaning: string, page: number): DimSpec => ({ value, unit: 'mm', meaning, page });

/** Cabinet profile left/right: 578.<NL>1M (30 kg) and 576.<NL>1M (65 kg). */
function profiles(page: number, nl30: number[], nl65: number[]): PartNumber[] {
  return [
    ...nl30.map((nl) => ({
      role: 'cabinet-profile',
      partNo: `578.${nl}1M`,
      description: 'Cabinet profile left/right, BLUMOTION, 30 kg',
      when: { nominalLength: nl, capacityKg: 30 },
      page,
    })),
    ...nl65.map((nl) => ({
      role: 'cabinet-profile',
      partNo: `576.${nl}1M`,
      description: 'Cabinet profile left/right, BLUMOTION, 65 kg',
      when: { nominalLength: nl, capacityKg: 65 },
      page,
    })),
  ];
}

/** Drawer side set: 378<H><NL>2SA, colours SW | R9006. */
function sideSets(page: number, letter: string, nls: number[], role = 'side-set', label = 'Drawer side set'): PartNumber[] {
  return nls.map((nl) => ({
    role,
    partNo: `378${letter}${nl}2SA`,
    description: `${label} (sides + cover caps)`,
    when: { nominalLength: nl },
    page,
  }));
}

/** Longside gallery rail left/right: ZRG.<NL-63>RSIC (listed as printed). */
function galleryRails(page: number, nls: number[]): PartNumber[] {
  return nls.map((nl) => ({
    role: 'gallery-rail',
    partNo: `ZRG.${nl - 63}RSIC`,
    description: 'Longside gallery rail left/right, steel',
    when: { nominalLength: nl },
    page,
  }));
}

function frontBrackets(page: number, qty = 2): PartNumber[] {
  return [
    { role: 'front-fixing', partNo: 'ZSF.36A2', description: 'Front fixing bracket, knock-in', when: { fixing: 'knock-in' }, qty, page },
    { role: 'front-fixing', partNo: 'ZSF.39A2', description: 'Front fixing bracket, INSERTA', when: { fixing: 'INSERTA' }, qty, page },
    { role: 'front-fixing', partNo: 'ZSF.35A2', description: 'Front fixing bracket, screw-on', when: { fixing: 'screw-on' }, qty, page },
  ];
}

const chipBack = (page: number, partNo: string, description = 'Chipboard back fixings left/right, steel'): PartNumber => ({
  role: 'back-fixing',
  partNo,
  description,
  page,
});

function frontFixingSet(page: number, partNo: string, withGalleryHead: boolean): PartNumber[] {
  const parts: PartNumber[] = [
    { role: 'front-fixing-set', partNo, description: 'Front fixing set left/right, nylon', page },
    { role: 'front-fixing-set', partNo: 'Z31A0008', description: 'Locking piece (in front fixing set)', qty: 1, page },
  ];
  if (withGalleryHead) parts.push({ role: 'gallery-head', partNo: 'ZRG.000R5F', description: 'Gallery head (in front fixing set)', qty: 2, page });
  return parts;
}

const frontPiece = (page: number): PartNumber => ({
  role: 'front-piece',
  partNo: 'Z31L1036A',
  description: 'Front piece without groove, 1036 mm, cut to size',
  page,
});
const crossGallery = (page: number): PartNumber => ({
  role: 'cross-gallery',
  partNo: 'ZRG.1046Z',
  description: 'Cross gallery, 1046 mm, cut to size',
  page,
});
const handleParts = (page: number): PartNumber[] => [
  { role: 'handle', partNo: 'ZIF.80M5', description: 'Handle, nylon (SW | WGR)', page },
  { role: 'handle-latch', partNo: 'ZIF.80M7', description: 'Handle and latch, nylon; not with TIP-ON BLUMOTION', page },
];

const COLOURS = ['SW', 'R9006'];
const FIXINGS = ['knock-in', 'INSERTA', 'screw-on'];

/** Chipboard-back fixing holes: y measured down from the top edge of the chipboard back, one rule per height. */
function backHoles(id: string, label: string, ys: number[], page: number, note?: string): DrillingRule {
  return {
    id,
    target: 'drawer-back',
    label,
    reference:
      'Chipboard back fixing (installation dimensions - back): y measured downward from the upper edge of the chipboard back panel; x (a 9 mm dimension is shown) not resolvable, set 0',
    holes: ys.map((y) => ({ x: 0, y, diameter: 0, note: note ?? 'hole diameter not stated on page' })),
    page,
  };
}

/** Front holes: y measured upward from the lower edge of the front. */
function frontHoles(id: string, label: string, ys: number[], page: number, extra?: string): DrillingRule {
  return {
    id,
    target: 'front',
    label,
    reference:
      'Front (INSERTA | knock-in drilling distances): y measured upward from the lower edge of the front; all holes on one vertical axis, x not dimensioned (set 0)',
    holes: ys.map((y, i) => ({
      x: 0,
      y,
      diameter: 10,
      depth: 12,
      note: i === 0 ? `lowest hole; ${extra ?? ''}`.trim() : 'dimension 12 shown in side view of front',
    })),
    page,
  };
}

const COMMON_UNVERIFIED = [
  'unverified: reference lines of the 37.5 (horizontal, installation dimensions - front), 15.5 and 9 mm dimensions are drawn but not named in the text; not used as drilling coordinates.',
  'unverified: screw-on front pilot-hole diameter is not printed; hole heights equal the dotted positions in the INSERTA/knock-in diagram.',
  'unverified: for cabinet profile screw positions see family notes (p.334).',
];

// ---------------------------------------------------------------- Standard cabinet: drawers
const drawerN: FittingVariant = {
  id: 'antaro-drawer-n',
  name: 'Drawer N',
  summary: 'Standard cabinet drawer, drawer side height 68.5 mm, 30 kg only.',
  choices: { nominalLength: [400, 450, 500, 550], capacityKg: [30], colour: COLOURS, fixing: FIXINGS },
  parts: [
    ...profiles(294, [400, 450, 500, 550], []),
    ...sideSets(294, 'N', [400, 450, 500, 550]),
    chipBack(294, 'Z30N000S.04'),
    ...frontBrackets(294),
  ],
  dims: {
    spaceRequirementHeight: dim(82.5, 'Overview: space requirement height in cabinet', 292),
    drawerSideHeight: dim(68.5, 'Drawer side height', 294),
    envelopeHeight: dim(79.5, 'Overall height of drawer envelope (drawer bottom to top of drawer side/profile) in space-requirement diagram', 295),
    minAboveProfileScrew: dim(49.5, 'Minimum clear height from the cabinet-profile fixing screw line up to the next panel/obstruction above', 295),
    minBelowProfileScrew: dim(33, 'Minimum distance from the cabinet-profile fixing screw line down to the underside of the drawer space (cabinet bottom/panel below)', 295),
    sideClearance: dim(37.5, 'Horizontal dimension 37.5 in space-requirement diagram (cabinet side face to drawer-side reference as drawn)', 295),
    chipboardBackHeight: dim(69, 'Cut height of 16 mm chipboard back', 295),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back (B); LW = internal cabinet width', 295),
    baseWidth: fdim('LW - 75', 'Cut width of 16 mm chipboard base (A)', 295),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back; NL = nominal length', 295),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 295),
    frontOverlay: dim('FA', 'Front overlay FA appears in the installation-dimension diagram; no numeric value printed', 295),
    backFixingHole22: dim(22, 'Back fixing diagram dimension 22 (from upper edge of back)', 295),
    backFixingHole38: dim(38, 'Back fixing diagram dimension 38 (from upper edge of back)', 295),
  },
  drilling: [
    {
      id: 'antaro-n-front',
      target: 'front',
      label: 'Front INSERTA | knock-in',
      reference: 'y measured upward from lower edge of front; two holes 32 apart on one vertical axis; x not dimensioned (set 0)',
      holes: [
        { x: 0, y: 32.5, diameter: 10, depth: 12, note: 'diagram gives "min 32.5" to lowest hole' },
        { x: 0, y: 64.5, diameter: 10, depth: 12, note: '32 above lowest hole' },
      ],
      page: 295,
    },
  ],
  notes: [
    ...COMMON_UNVERIFIED,
    'unverified: back fixing dimensions 22 and 38 are printed but whether both are measured from the upper edge of the chipboard back is not certain (p.295).',
    'Drilling dia. 10 +0.2/-0.1 for front holes (p.295).',
  ],
  pages: [294, 295],
};

const drawerM: FittingVariant = {
  id: 'antaro-drawer-m',
  name: 'Drawer M',
  summary: 'Standard cabinet drawer, side height 83.6 mm, 30 or 65 kg.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: [
    ...profiles(296, [270, 300, 350, 400, 450, 500, 550, 600], NL_65),
    ...sideSets(296, 'M', NL_ALL),
    chipBack(296, 'Z30M000S.04'),
    ...frontBrackets(296),
  ],
  dims: {
    spaceRequirementHeight: dim(98.5, 'Overview: space requirement height in cabinet', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 296),
    envelopeHeight: dim(95.5, 'Overall height of drawer envelope in space-requirement diagram', 297),
    minAboveProfileScrew: dim(65.5, 'Minimum clear height from cabinet-profile fixing screw line up to obstruction above', 297),
    minBelowProfileScrew: dim(33, 'Minimum distance from cabinet-profile fixing screw line down to underside of drawer space', 297),
    chipboardBackHeight: dim(84, 'Cut height of 16 mm chipboard back', 297),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back (B)', 297),
    baseWidth: fdim('LW - 75', 'Cut width of chipboard base (A)', 297),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 297),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 297),
  },
  drilling: [
    frontHoles('antaro-m-front', 'Front INSERTA | knock-in', [32.5, 64.5], 297, 'diagram gives "min 32.5" to lowest hole, second hole 32 above'),
    backHoles('antaro-m-back', 'Chipboard back fixing holes', [20, 52], 297),
  ],
  notes: [...COMMON_UNVERIFIED, 'Front dimensions 32.5/32 read from the p.297 diagram ("min 32.5" to lowest hole).'],
  pages: [296, 297],
};

const drawerK: FittingVariant = {
  id: 'antaro-drawer-k',
  name: 'Drawer K',
  summary: 'Standard cabinet drawer, side height 115.6 mm, 30 or 65 kg.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: [
    ...profiles(300, NL_30, NL_65),
    ...sideSets(300, 'K', NL_ALL),
    { role: 'dowel', partNo: 'positioning dowel (no part no. printed)', description: 'Positioning dowel x2, in side set', qty: 2, page: 300 },
    chipBack(300, 'Z30K000S'),
    ...frontBrackets(300),
  ],
  dims: {
    spaceRequirementHeight: dim(130.5, 'Overview: space requirement height in cabinet', 292),
    drawerSideHeight: dim(115.6, 'Drawer side height', 300),
    envelopeHeight: dim(127.5, 'Overall height of drawer envelope in space-requirement diagram', 301),
    minAboveProfileScrew: dim(97.5, 'Minimum clear height from cabinet-profile fixing screw line up to obstruction above', 301),
    minBelowProfileScrew: dim(33, 'Minimum distance from cabinet-profile fixing screw line down to underside of drawer space', 301),
    chipboardBackHeight: dim(116, 'Cut height of 16 mm chipboard back', 301),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back (B)', 301),
    baseWidth: fdim('LW - 75', 'Cut width of chipboard base (A)', 301),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 301),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 301),
  },
  drilling: [
    frontHoles('antaro-k-front', 'Front INSERTA | knock-in', [47.5, 79.5, 111.5], 301, 'diagram: min 47.5 to lowest hole, then 32, 32'),
    backHoles('antaro-k-back', 'Chipboard back fixing holes', [22, 54, 86], 301),
  ],
  notes: COMMON_UNVERIFIED,
  pages: [300, 301],
};

// ---------------------------------------------------------------- Inner drawers
function innerDrawerParts(page: number, letter: string, cbPart: string, ffSet: string, nl30: number[]): PartNumber[] {
  return [
    ...profiles(page, nl30, NL_65),
    ...sideSets(page, letter, NL_ALL),
    chipBack(page, cbPart),
    ...frontFixingSet(page, ffSet, false),
    frontPiece(page),
    ...handleParts(page),
  ];
}
const innerLatchNotes = [
  'unverified: latch drilling diagram (p.299/303) shows dia. 25 hole centred horizontally in the front, "min 17" from upper edge, plus dimensions 61.5, x, x+47 and 12 whose references are not resolvable from the text; only the dia. 25 hole and the min 17 are recorded.',
  'Inner drawer without handle: opening only possible from the bottom (p.299). Handle and latch not compatible with TIP-ON BLUMOTION (p.298).',
];
const latchRule = (id: string, page: number): DrillingRule => ({
  id,
  target: 'front',
  label: 'Front latch hole (inner drawer)',
  reference: 'Front, hole centred horizontally on the front width ("=" "=" dimensions); y measured down from the upper edge of the front, min 17 mm to hole edge/centre as drawn',
  holes: [{ x: 0, y: 17, diameter: 25, note: 'x = centred; "min 17" from upper edge as drawn (reference point unclear)' }],
  page,
});

const innerDrawerM: FittingVariant = {
  id: 'antaro-inner-drawer-m',
  name: 'Inner drawer M',
  summary: 'Inner drawer behind a door, side height 83.6 mm, with handle or handle and latch.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS },
  parts: innerDrawerParts(298, 'M', 'Z30M000S.04', 'ZIF.71M0', NL_30),
  dims: {
    spaceRequirementHeight: dim(106, 'Overview: space requirement height', 292),
    minSpaceWithOrWithoutHandle: dim(73, 'Min. space requirement above profile screw line for inner drawers with or without handles (*)', 299),
    minSpaceEasyAccessFromAbove: dim(103, 'Space above profile screw line for inner drawers with easy access from above (**)', 299),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 299),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 299),
    frontPieceWidth: fdim('LW - 132', 'Cut width of front piece 5; LW = internal cabinet width', 298),
    chipboardBackHeight: dim(84, 'Cut height of chipboard back', 299),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 299),
    baseWidth: fdim('LW - 75', 'Cut width of base', 299),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 299),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 299),
  },
  drilling: [backHoles('antaro-im-back', 'Chipboard back fixing holes', [20, 52], 299), latchRule('antaro-im-latch', 299)],
  notes: [...innerLatchNotes, 'Front fixing set ZIF.71M0 consists of front fixing left/right, locking piece Z31A0008 and 4 screws (p.298).'],
  pages: [298, 299],
};

const innerDrawerK: FittingVariant = {
  id: 'antaro-inner-drawer-k',
  name: 'Inner drawer K',
  summary: 'Inner drawer behind a door, side height 115.6 mm, with handle or handle and latch.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS },
  parts: innerDrawerParts(302, 'K', 'Z30K000S', 'ZIF.71K0', NL_30),
  dims: {
    spaceRequirementHeight: dim(136.5, 'Overview: space requirement height', 292),
    minSpaceWithOrWithoutHandle: dim(103.5, 'Min. space requirement above profile screw line (inner drawer)', 303),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 303),
    envelopeHeight: dim(127.5, 'Overall drawer envelope height in diagram', 303),
    frontPieceWidth: fdim('LW - 132', 'Cut width of front piece 5', 302),
    chipboardBackHeight: dim(116, 'Cut height of chipboard back', 303),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 303),
    baseWidth: fdim('LW - 75', 'Cut width of base', 303),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 303),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 303),
  },
  drilling: [backHoles('antaro-ik-back', 'Chipboard back fixing holes', [22, 54, 86], 303), latchRule('antaro-ik-latch', 303)],
  notes: [...innerLatchNotes, 'Positioning dowels (2c) not required for the inner drawer (p.302).'],
  pages: [302, 303],
};

// ---------------------------------------------------------------- High-fronted pull-outs and inner pull-outs
function hfpParts(page: number, letter: string, cb: string, nlSide: number[]): PartNumber[] {
  return [
    ...profiles(page, NL_30, NL_65),
    ...sideSets(page, letter, nlSide),
    ...galleryRails(page, NL_ALL),
    chipBack(page, cb),
    ...frontBrackets(page),
  ];
}
function ipoParts(page: number, letter: string, cb: string, ffSet: string): PartNumber[] {
  return [
    ...profiles(page, NL_30, NL_65),
    ...sideSets(page, letter, NL_ALL),
    ...galleryRails(page, NL_ALL),
    chipBack(page, cb),
    ...frontFixingSet(page, ffSet, true),
    frontPiece(page),
    crossGallery(page),
  ];
}

const hfpC: FittingVariant = {
  id: 'antaro-hfp-c',
  name: 'High fronted pull-out, gallery C',
  summary: 'Single gallery, side height 83.6 mm, space height 192 mm, 3-D front adjustment.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: hfpParts(304, 'M', 'Z30C000S', NL_ALL),
  dims: {
    spaceRequirementHeight: dim(192, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 304),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 305),
    minAboveProfileScrew: dim(159, 'Minimum clear height above cabinet-profile fixing screw line', 305),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 305),
    chipboardBackHeight: dim(167, 'Cut height of chipboard back', 305),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 305),
    baseWidth: fdim('LW - 75', 'Cut width of base', 305),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 305),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 305),
  },
  drilling: [
    frontHoles('antaro-hfpc-front', 'Front INSERTA | knock-in', [47.5, 79.5, 175.5], 305, 'diagram: 47.5, 32, then 96 to top hole'),
    backHoles('antaro-hfpc-back', 'Chipboard back fixing holes', [39, 71, 103, 135], 305),
  ],
  notes: [
    ...COMMON_UNVERIFIED,
    'unverified: the order-information text of p.304 lists no cross gallery (item 7) for this variant; cross gallery ZRG.1046Z appears on inner pull-out pages only.',
  ],
  pages: [304, 305],
};

const ipoC: FittingVariant = {
  id: 'antaro-ipo-c',
  name: 'Inner pull-out, gallery C',
  summary: 'Inner pull-out with single gallery, space height 192 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS },
  parts: ipoParts(306, 'M', 'Z30C000S', 'ZIF.76C0'),
  dims: {
    spaceRequirementHeight: dim(192, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 306),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 307),
    minAboveProfileScrew: dim(159, 'Minimum clear height above cabinet-profile fixing screw line', 307),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 307),
    frontPieceWidth: fdim('LW - 132', 'Cut width of front piece 5', 306),
    crossGalleryWidth: fdim('LW - 122', 'Cut width of cross gallery 7', 306),
    chipboardBackHeight: dim(167, 'Cut height of chipboard back', 307),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 307),
    baseWidth: fdim('LW - 75', 'Cut width of base', 307),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 307),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 307),
  },
  drilling: [backHoles('antaro-ipoc-back', 'Chipboard back fixing holes', [39, 71, 103, 135], 307)],
  notes: ['Gallery heads 2 x ZRG.000R5F are part of the front fixing set (p.306).', 'Inner pull-out: TIP-ON BLUMOTION possible; no handle parts listed.'],
  pages: [306, 307],
};

const hfpD: FittingVariant = {
  id: 'antaro-hfp-d',
  name: 'High fronted pull-out, gallery D',
  summary: 'Single gallery, side height 83.6 mm, space height 224 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: hfpParts(308, 'M', 'Z30D000SL', NL_ALL),
  dims: {
    spaceRequirementHeight: dim(224, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 308),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 309),
    minAboveProfileScrew: dim(191, 'Minimum clear height above cabinet-profile fixing screw line', 309),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 309),
    chipboardBackHeight: dim(199, 'Cut height of chipboard back', 309),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 309),
    baseWidth: fdim('LW - 75', 'Cut width of base', 309),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 309),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 309),
  },
  drilling: [
    frontHoles('antaro-hfpd-front', 'Front INSERTA | knock-in', [47.5, 79.5, 207.5], 309, 'diagram: 47.5, 32, then 128 to top hole'),
    backHoles('antaro-hfpd-back', 'Chipboard back fixing holes', [8, 40, 104, 136, 168], 309),
  ],
  notes: COMMON_UNVERIFIED,
  pages: [308, 309],
};

const ipoD: FittingVariant = {
  id: 'antaro-ipo-d',
  name: 'Inner pull-out, gallery D',
  summary: 'Inner pull-out with single gallery, space height 224 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS },
  parts: ipoParts(310, 'M', 'Z30D000SL', 'ZIF.76D0'),
  dims: {
    spaceRequirementHeight: dim(224, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 310),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 311),
    minAboveProfileScrew: dim(191, 'Minimum clear height above cabinet-profile fixing screw line', 311),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 311),
    frontPieceWidth: fdim('LW - 132', 'Cut width of front piece 5', 310),
    crossGalleryWidth: fdim('LW - 122', 'Cut width of cross gallery 7', 310),
    chipboardBackHeight: dim(199, 'Cut height of chipboard back', 311),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 311),
    baseWidth: fdim('LW - 75', 'Cut width of base', 311),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 311),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 311),
  },
  drilling: [backHoles('antaro-ipod-back', 'Chipboard back fixing holes', [8, 40, 104, 136, 168], 311)],
  notes: ['Gallery heads 2 x ZRG.000R5F are part of the front fixing set (p.310).'],
  pages: [310, 311],
};

const hfpDk: FittingVariant = {
  id: 'antaro-hfp-d-k',
  name: 'High fronted pull-out, gallery D, k drawer side',
  summary: 'Single gallery on K drawer side (115.6 mm), space height 224 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: [
    ...hfpParts(312, 'K', 'Z30D000SL', NL_ALL),
    { role: 'dowel', partNo: 'positioning dowel (no part no. printed)', description: 'Positioning dowel x2, in side set', qty: 2, page: 312 },
  ],
  dims: {
    spaceRequirementHeight: dim(224, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(115.6, 'Drawer side height', 312),
    envelopeHeight: dim(127.5, 'Overall drawer envelope height in diagram', 313),
    minAboveProfileScrew: dim(191, 'Minimum clear height above cabinet-profile fixing screw line', 313),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 313),
    chipboardBackHeight: dim(199, 'Cut height of chipboard back', 313),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 313),
    baseWidth: fdim('LW - 75', 'Cut width of base', 313),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 313),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 313),
  },
  drilling: [
    frontHoles('antaro-hfpdk-front', 'Front INSERTA | knock-in', [47.5, 79.5, 111.5, 207.5], 313, 'diagram: 47.5, 32, 32, then 96 to top hole'),
    backHoles('antaro-hfpdk-back', 'Chipboard back fixing holes', [8, 40, 104, 136, 168], 313),
  ],
  notes: COMMON_UNVERIFIED,
  pages: [312, 313],
};

const ipoDk: FittingVariant = {
  id: 'antaro-ipo-d-k',
  name: 'Inner pull-out, gallery D, k drawer side',
  summary: 'Inner pull-out, K drawer side (115.6 mm), space height 224 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS },
  parts: ipoParts(314, 'K', 'Z30D000SL', 'ZIF.76D0'),
  dims: {
    spaceRequirementHeight: dim(224, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(115.6, 'Drawer side height', 314),
    envelopeHeight: dim(127.5, 'Overall drawer envelope height in diagram', 315),
    minAboveProfileScrew: dim(191, 'Minimum clear height above cabinet-profile fixing screw line', 315),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 315),
    frontPieceWidth: fdim('LW - 132', 'Cut width of front piece 5', 314),
    crossGalleryWidth: fdim('LW - 122', 'Cut width of cross gallery 7', 314),
    chipboardBackHeight: dim(199, 'Cut height of chipboard back', 315),
    chipboardBackWidth: fdim('LW - 87', 'Cut width of chipboard back', 315),
    baseWidth: fdim('LW - 75', 'Cut width of base', 315),
    baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', 315),
    baseLengthSteelBack: fdim('NL - 22', 'Cut length of base with steel back', 315),
  },
  drilling: [backHoles('antaro-ipodk-back', 'Chipboard back fixing holes', [8, 40, 104, 136, 168], 315)],
  notes: ['Positioning dowels (2c) not required for the inner pull-out (p.314).'],
  pages: [314, 315],
};

// ---------------------------------------------------------------- Aluminium frames
function aluParts(page: number, letter: string, cb: string): PartNumber[] {
  return [
    ...profiles(page, NL_30, NL_65),
    ...sideSets(page, letter, NL_ALL),
    ...galleryRails(page, NL_ALL),
    chipBack(page, cb),
    { role: 'front-fixing', partNo: 'ZSF.35A2', description: 'Front fixing bracket, screw-on', qty: 2, page },
    { role: 'adapter', partNo: 'ZRF.2210', description: 'Adapter for aluminium frames, nylon NA', qty: 2, page },
    { role: 'gallery-head', partNo: 'ZRG.000R5F', description: 'Gallery head, nylon NA', qty: 2, page },
  ];
}
const aluNotes = [
  'Adapter for aluminium frames: use countersunk screw dia. 3.5 mm (head dia. 7 mm) (p.316/318).',
  'Colours for adapter and gallery head: NA natural; side set / back fixing / rails SW | R9006.',
  'unverified: screw-on pilot hole positions other than the dia. 2.5 hole are plain dots in the diagram; diameter not printed.',
];
const hfpCAlu: FittingVariant = {
  id: 'antaro-hfp-c-alu',
  name: 'High fronted pull-out, gallery C, alu frames',
  summary: 'Gallery C for aluminium-frame fronts, space height 192 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: ['screw-on'] },
  parts: aluParts(316, 'M', 'Z30C000S'),
  dims: {
    spaceRequirementHeight: dim(192, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 316),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 317),
    minAboveProfileScrew: dim(159, 'Minimum clear height above cabinet-profile fixing screw line', 317),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 317),
    minBelowDrawerBase: dim(9, 'Diagram shows "min 9" below the lower edge of the drawer space (reference as drawn)', 317),
  },
  drilling: [
    {
      id: 'antaro-hfpcalu-front',
      target: 'front',
      label: 'Alu frame front, screw-on / pilot',
      reference: 'y measured upward from lower edge of the front profile; x not dimensioned (set 0)',
      holes: [
        { x: 0, y: 47.5, diameter: 0, note: 'dot; diameter not printed' },
        { x: 0, y: 79.5, diameter: 0, note: 'dot; diameter not printed' },
        { x: 0, y: 175.5, diameter: 2.5, note: '96 above upper dot' },
      ],
      page: 317,
    },
    backHoles('antaro-hfpcalu-back', 'Chipboard back fixing holes', [39, 71, 103, 135], 317),
  ],
  notes: aluNotes,
  pages: [316, 317],
};
const hfpDAlu: FittingVariant = {
  id: 'antaro-hfp-d-alu',
  name: 'High fronted pull-out, gallery D, alu frames',
  summary: 'Gallery D for aluminium-frame fronts, space height 224 mm.',
  choices: { nominalLength: NL_ALL, capacityKg: [30, 65], colour: COLOURS, fixing: ['screw-on'] },
  parts: aluParts(318, 'M', 'Z30D000SL'),
  dims: {
    spaceRequirementHeight: dim(224, 'Overview: space requirement height', 292),
    drawerSideHeight: dim(83.6, 'Drawer side height', 318),
    envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', 319),
    minAboveProfileScrew: dim(191, 'Minimum clear height above cabinet-profile fixing screw line', 319),
    minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', 319),
  },
  drilling: [
    {
      id: 'antaro-hfpdalu-front',
      target: 'front',
      label: 'Alu frame front, screw-on / pilot',
      reference: 'y measured upward from lower edge of the front profile; x not dimensioned (set 0)',
      holes: [
        { x: 0, y: 47.5, diameter: 0, note: 'dot; diameter not printed' },
        { x: 0, y: 79.5, diameter: 0, note: 'dot; diameter not printed' },
        { x: 0, y: 207.5, diameter: 2.5, note: '128 above upper dot' },
      ],
      page: 319,
    },
    backHoles('antaro-hfpdalu-back', 'Chipboard back fixing holes', [8, 40, 104, 136, 168], 319),
  ],
  notes: aluNotes,
  pages: [318, 319],
};

// ---------------------------------------------------------------- Sink cabinet
function sinkParts(page: number, cb: string): PartNumber[] {
  const ext = [450, 500, 550, 600, 650];
  return [
    ...profiles(page, [450, 500, 550, 600], [600, 650]),
    ...sideSets(page, 'M', ext, 'side-set-exterior', 'Drawer side set exterior'),
    ...sideSets(page, 'M', [300, 350, 400, 450, 500], 'side-set-interior', 'Drawer side set interior'),
    { role: 'back-fixing', partNo: cb + '.22', description: 'Sink chipboard back fixing left/right, steel', page },
    { role: 'back-fixing-interior', partNo: 'Z30M000S.04', description: 'Chipboard back fixings left/right, interior drawer', page },
    ...frontBrackets(page, 4),
    ...galleryRails(page, ext),
  ];
}
const sinkDims = (p: number, plan: number, min: number, space: number): Record<string, DimSpec> => ({
  spaceRequirementHeight: dim(space, 'Overview: space requirement height', 293),
  drawerSideHeight: dim(83.6, 'Drawer side height (exterior and interior sets)', p),
  envelopeHeight: dim(95.5, 'Overall drawer envelope height in diagram', plan),
  minAboveProfileScrew: dim(min, 'Minimum clear height above cabinet-profile fixing screw line', plan),
  minBelowProfileScrew: dim(33, 'Minimum below cabinet-profile fixing screw line', plan),
  minBelowDrawer: dim(9, 'Diagram shows "min 9" below the drawer space (reference as drawn)', plan),
  minNlDifferenceExteriorInterior: dim(150, 'Recommended minimum: NL exterior drawer sides minus NL interior drawer sides', p),
  chipboardBackHeight: dim(84, 'Cut height of chipboard backs B1/B2', plan),
  baseWidth: fdim('LW - 75', 'Cut overall width of drawer base (A)', plan),
  baseCutoutWidth: fdim('SPW + 63', 'Width of cut-out in drawer base; SPW = internal cabinet width between inner drawer sides', plan),
  baseLengthChipboardBack: fdim('NL - 24', 'Cut length of base with chipboard back', plan),
  chipboardBackWidth1: fdim('Y1 - 12', 'Width of chipboard back B1; Y1 = side distance', plan),
  chipboardBackWidth2: fdim('Y2 - 12', 'Width of chipboard back B2; Y2 = side distance', plan),
  centrePieceWidth: fdim('SPW + 75', 'Cut width of centre piece C', plan),
  centrePieceHeight: dim(71, 'Cut height of centre piece C', plan),
  cutoutDepthW: fdim('NL exterior - NL interior - 10', 'W: depth of the base cut-out = NL drawer sides exterior - NL drawer sides interior - 10 mm', plan),
  yMinBlumotion: dim(48, 'Y min. (side distance) with BLUMOTION', plan),
  yMaxBlumotion: dim(225, 'Y max. (side distance) with BLUMOTION', plan),
  yMinTipOn: dim(75, 'Y min. (side distance) with TIP-ON BLUMOTION', plan),
  yMaxTipOn: dim(225, 'Y max. (side distance) with TIP-ON BLUMOTION', plan),
});
const centrePiece = (id: string, page: number): DrillingRule => ({
  id,
  target: 'other',
  label: 'Centre piece C',
  reference:
    'Centre piece C (71 mm high): y upward from its lower edge; x measured from the vertical edge on the side the 28 dimension is drawn (right edge as drawn)',
  holes: [
    { x: 28, y: 22.5, diameter: 0, note: 'diameter not printed' },
    { x: 28, y: 54.5, diameter: 0, note: '32 above lower hole; diameter not printed' },
  ],
  page,
});
const sinkBack = (id: string, page: number): DrillingRule =>
  backHoles(id, 'Chipboard back fixing holes (84 mm backs, exterior and interior)', [20, 52], page, 'dimension 20 then 32 as drawn; applies to both back fixings');

const sinkC: FittingVariant = {
  id: 'antaro-sink-hfp-c',
  name: 'Sink cabinet: High fronted pull-out, gallery C',
  summary: 'Sink cabinet drawer with U-shaped base around the siphon; exterior + interior drawer sides.',
  choices: { nominalLength: [450, 500, 550, 600, 650], capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: sinkParts(320, 'Z30C000S'),
  dims: sinkDims(320, 321, 159, 192),
  drilling: [
    frontHoles('antaro-sinkc-front', 'Front INSERTA | knock-in', [47.5, 79.5, 175.5], 321, 'diagram: 47.5, 32, then 96 to top hole'),
    sinkBack('antaro-sinkc-back', 321),
    centrePiece('antaro-sinkc-centre', 321),
  ],
  notes: [
    ...COMMON_UNVERIFIED,
    'Interior drawer side set NL options: 300, 350, 400, 450, 500 (p.320).',
    'Capacity pairing by NL read from column position: 30 kg at 450-600, 65 kg at 600-650 (p.320).',
  ],
  pages: [320, 321],
};
const sinkD: FittingVariant = {
  id: 'antaro-sink-hfp-d',
  name: 'Sink cabinet: High fronted pull-out, gallery D',
  summary: 'Sink cabinet drawer with U-shaped base around the siphon; space height 224 mm.',
  choices: { nominalLength: [450, 500, 550, 600, 650], capacityKg: [30, 65], colour: COLOURS, fixing: FIXINGS },
  parts: sinkParts(322, 'Z30D000S'),
  dims: sinkDims(322, 323, 191, 224),
  drilling: [
    frontHoles('antaro-sinkd-front', 'Front INSERTA | knock-in', [47.5, 79.5, 207.5], 323, 'diagram: 47.5, 32, then 128 to top hole'),
    sinkBack('antaro-sinkd-back', 323),
    centrePiece('antaro-sinkd-centre', 323),
  ],
  notes: [...COMMON_UNVERIFIED, 'Interior drawer side set NL options: 300, 350, 400, 450, 500 (p.322).'],
  pages: [322, 323],
};

// ---------------------------------------------------------------- Larder / narrow cabinets
const spaceTower: FittingVariant = {
  id: 'antaro-space-tower',
  name: 'SPACE TOWER (larder unit)',
  summary: 'Larder unit built from inner drawers and inner pull-outs; no own part numbers.',
  choices: { cabinetWidthKB: ['275-1200'], capacityKg: [30, 65] },
  parts: [
    { role: 'reference', partNo: 'see p.298', description: 'Inner drawer M (application)', page: 324 },
    { role: 'reference', partNo: 'see p.306', description: 'Inner pull-out gallery C (application)', page: 324 },
    { role: 'reference', partNo: 'see p.310', description: 'Inner pull-out gallery D (application)', page: 324 },
    { role: 'reference', partNo: 'see p.84', description: 'CLIP top BLUMOTION 155 deg hinge', page: 324 },
  ],
  dims: { cabinetWidthKB: dim('275-1200', 'Recommended cabinet width KB range', 324) },
  drilling: [],
  notes: [
    'Application recommendation: inner drawer M, inner pull-out gallery C / D, ORGA-LINE cross divider (p.562) and cross gallery (p.563), CLIP top BLUMOTION 155 deg hinge (p.84).',
    'unverified: p.325 positioning-in-cabinet and front drilling dimensions (e.g. 1684, 1428, 1108, 1340, 756 ...) are scrambled in the text and not transcribed.',
    'Hinge without front protrusion allows optimal use of cabinet width KB; at higher cabinets a shelf at the top rather than an inner drawer is practical (p.325).',
  ],
  pages: [324, 325],
};
const spaceTwin: FittingVariant = {
  id: 'antaro-space-twin',
  name: 'SPACE TWIN (narrow cabinets)',
  summary: 'Narrow-cabinet drawers with diagonally offset cabinet profiles, 20 kg per base cabinet.',
  choices: { cabinetWidthKB: ['165-250'], capacityKg: [20], drawerSideHeight: ['M', 'K'], galleryHeight: ['C', 'D'] },
  parts: [
    { role: 'reference', partNo: 'see p.296', description: 'Drawer M (application)', page: 326 },
    { role: 'reference', partNo: 'see p.300', description: 'Drawer K (application)', page: 326 },
    { role: 'reference', partNo: 'see p.304', description: 'High fronted pull-out gallery C', page: 326 },
    { role: 'reference', partNo: 'see p.308', description: 'High fronted pull-out gallery D', page: 326 },
    { role: 'reference', partNo: 'see p.312', description: 'High fronted pull-out gallery D, k drawer side', page: 326 },
  ],
  dims: {
    cabinetWidthKB: dim('165-250', 'Cabinet width KB range', 326),
    installationHeightX_M: dim(65.5, 'Installation height X for drawer M', 327),
    installationHeightX_K: dim(97.5, 'Installation height X for drawer K', 327),
    installationHeightX_C: dim(159, 'Installation height X for gallery C', 327),
    installationHeightX_D: dim(191, 'Installation height X for gallery D', 327),
    minBelow: dim(33, 'Minimum below profile screw line', 327),
    minSpaceHeight: dim(127, 'Min space height shown in diagram (147 mm with SERVO-DRIVE)', 327),
    minSpaceHeightServoDrive: dim(147, 'Min space height with SERVO-DRIVE', 327),
    sidePanelY_KK: dim(32, 'Y for drawer side K with side panel K', 327),
    sidePanelY_CM: dim(96, 'Y for gallery C with side panel M (gallery)', 327),
    sidePanelY_DM: dim(128, 'Y for gallery D with side panel M (gallery)', 327),
    sidePanelY_DK: dim('32 + 96', 'Y for gallery D with side panel K (gallery)', 327),
  },
  drilling: [
    {
      id: 'antaro-twin-front',
      target: 'front',
      label: 'Front, INSERTA/screw-on holes (SPACE TWIN)',
      reference: 'y upward from lower edge of front; two holes shown with dimensions 47.5 and 32',
      holes: [
        { x: 0, y: 47.5, diameter: 0, note: 'diameter not printed on p.327' },
        { x: 0, y: 79.5, diameter: 0, note: 'diameter not printed on p.327' },
      ],
      page: 327,
    },
  ],
  notes: [
    'Includes integrated BLUMOTION; stable solution thanks to diagonally offset cabinet profiles (p.326).',
    'unverified: the Y table on p.327 is a flattened table; row/column pairing of "Height of drawer side" and "Side panel" is inferred (M-M: dash, K-K: 32, C-M gallery: 96, D-M gallery: 128, D-K gallery: 32 + 96).',
  ],
  pages: [326, 327],
};

// ---------------------------------------------------------------- Accessories
const accessories: FittingVariant = {
  id: 'antaro-accessories',
  name: 'TANDEMBOX antaro accessories',
  summary: 'Steel backs, stabilisers, flexible gallery fixing, screws, tools, cabinet profile fixing positions.',
  choices: { backHeight: ['N', 'M', 'K', 'C', 'D'], nominalLength: [450, 500, 550, 600, 650] },
  parts: [
    ...['N', 'M', 'K', 'C', 'D'].map((h) => ({
      role: 'steel-back',
      partNo: `Z30${h}xxxS.6`,
      description: `Steel back height ${h}, xxx = LW - 28 (on request)`,
      when: { backHeight: h },
      page: 328,
    })),
    { role: 'front-stabiliser', partNo: 'Z96.10E1', description: 'Front/base stabiliser EXPANDO, RAL 7037', page: 328 },
    ...[450, 500, 550, 600, 650].map((nl) => ({
      role: 'side-stabilisation',
      partNo: `ZST.${nl}BA`,
      description: 'Side stabilisation top mounted, aluminium rod',
      when: { nominalLength: nl },
      page: 329,
    })),
    { role: 'gallery-fixing', partNo: 'ZRR.5200', description: 'Flexible gallery fixing left/right', page: 330 },
    { role: 'back-fixing', partNo: 'Z30B000S.04', description: 'Chipboard back fixing height B', page: 331 },
    { role: 'screw', partNo: '609.1500', description: 'Chipboard screw dia 3.5 x 15 mm', page: 332 },
    { role: 'screw', partNo: '609.1700', description: 'Chipboard screw dia 3.5 x 17 mm', page: 332 },
    { role: 'screw', partNo: '661.1000.HG', description: 'System screw dia 6 x 10 mm', page: 332 },
    { role: 'screw', partNo: '661.1150.HG', description: 'System screw dia 6 x 11.5 mm', page: 332 },
    { role: 'screw', partNo: '661.1300.HG', description: 'System screw dia 6 x 13 mm', page: 332 },
    { role: 'screw', partNo: '661.1450.HG', description: 'System screw dia 6 x 14.5 mm', page: 332 },
    { role: 'screw', partNo: '661.2000.HG', description: 'System screw dia 6 x 20 mm', page: 332 },
    { role: 'tool', partNo: 'M01.ZZ03.01', description: 'Centre bit dia 2.7 mm', page: 332 },
    { role: 'tool', partNo: 'M01.ZZB3', description: 'Replacement bit for centre bit', page: 332 },
    { role: 'buffer', partNo: '993.710', description: 'Stick-on door buffer dia 8 mm, natural', page: 332 },
    { role: 'buffer', partNo: '993.706', description: 'Door buffer dia 8 mm, two-part, RAL 9006', page: 332 },
    { role: 'tool', partNo: '303.756.1', description: 'Pozidriv PZ 2 screwdriver, 210 mm', page: 333 },
    { role: 'tool', partNo: '314.928.1', description: 'Slotted screwdriver size 1, 200 mm', page: 333 },
  ],
  dims: {
    steelBackWidthXxx: fdim('LW - 28', 'xxx in steel back part number = LW - 28 (e.g. LW 567 -> Z30M539S.6)', 328),
    steelBackBaseLength: fdim('NL - 22', 'Base length with steel back; LW - 75 base width', 328),
    stabiliserFH_lt300: dim('KB > 900: 1 pc', 'Front/base stabiliser quantity for front height FH < 300 mm', 328),
    stabiliserFH_ge300: dim('KB < 450: 1 pc; 450-900: 2 pc; > 900: 3 pc', 'Front/base stabiliser quantity for front height FH >= 300 mm (KB = cabinet width)', 328),
    sideStabilisationRodCut: fdim('LW - 86', 'Cut length of aluminium rod (item 1)', 329),
    sideStabilisationRecommendedKB: dim('900-1200', 'Recommended cabinet width KB for side stabilisation', 329),
    minInternalDepthSideStabilisation: fdim('NL + 3', 'Minimum internal cabinet depth LT with side stabilisation', 329),
    sideStabSpaceM: dim(106, 'Min space height M with side stabilisation (min 4 above rod, 33 below profile line)', 329),
    sideStabSpaceK: dim(138, 'Min space height K with side stabilisation', 329),
    sideStabSpaceC: dim(189, 'Min space height C with side stabilisation', 329),
    sideStabSpaceD: dim(221, 'Min space height D with side stabilisation', 329),
    sideStabHoleSpacing: dim([96, 128, 128, 128, 96], 'Hole spacing sequence for NL 650 (64 shown at NL 500)', 329),
    flexibleGalleryFixingY: fdim('X - 4', 'Y = X - 4 mm, free placement; X = back height', 330),
    flexibleGalleryFixingZ: fdim('X - 71', 'Z = X - 71 mm', 330),
    flexibleGalleryFixingW: fdim('X - 103', 'W = X - 103 mm', 330),
    chipboardBackHeightB: dim(135, 'Cut height of chipboard back for fixing height B', 331),
    chipboardBackWidthB: fdim('LW - 87', 'Cut width of chipboard back for fixing height B', 331),
    profile578FixingPositions: dim([19, 37, 115, 133, 165, 229, 261, 293], 'Fixing positions along 578 (30 kg) cabinet profile from front, mm; 19 optional for greater stability', 334),
    profile576FixingPositions: dim([19, 28, 37, 115, 165, 261, 293, 357, 453, 517, 549], 'Fixing positions along 576 (65 kg) cabinet profile from front, mm; 19 and 28 shown at front', 334),
  },
  drilling: [],
  notes: [
    'Steel back, flexible gallery fixing and others marked on request in places (symbol on p.328).',
    'unverified: p.334 cabinet profile fixing matrix (which positions get screw A vs system screw B per NL) uses half-filled symbols that could not be read reliably; only the position columns are recorded. A = chipboard screw dia 4 x 15; B = system screw dia 6 x 14.5 (661.1450.HG).',
    'unverified: p.330 flexible gallery fixing diagrams and p.331 diagrams not resolved beyond the printed formulas.',
  ],
  pages: [328, 329, 330, 331, 332, 333, 334],
};

export const tandembox: FittingFamily[] = [
  {
    id: 'tandembox-antaro',
    kind: 'box',
    brand: 'Blum',
    name: 'TANDEMBOX antaro',
    summary: 'Rectangular-gallery drawer system with integrated BLUMOTION; 30/65 kg dynamic capacity.',
    variants: [
      drawerN, drawerM, drawerK, innerDrawerM, innerDrawerK,
      hfpC, ipoC, hfpD, ipoD, hfpDk, ipoDk, hfpCAlu, hfpDAlu,
      sinkC, sinkD, spaceTower, spaceTwin, accessories,
    ],
    document: DOC,
    pages: [290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334],
  },
  {
    id: 'tandembox-plus',
    kind: 'box',
    brand: 'Blum',
    name: 'TANDEMBOX plus',
    summary: 'Overview page only in this catalogue range: round gallery or BOXSIDE closed box.',
    variants: [
      {
        id: 'plus-overview',
        name: 'TANDEMBOX plus applications (overview)',
        choices: { capacityKg: [30, 65] },
        parts: [],
        dims: {
          spaceN: dim(81.5, 'Drawer N space requirement height', 337),
          spaceM: dim(96.5, 'Drawer M space requirement height', 337),
          spaceInnerM: dim(105, 'Inner drawer M space requirement height', 337),
          spaceGalleryB: dim(160, 'High fronted / inner pull-out gallery B space requirement height', 337),
          spaceGalleryD: dim(224, 'High fronted / inner pull-out gallery D space requirement height (BOXSIDE possible)', 337),
          spaceTwinKB: dim('165-250', 'SPACE TWIN cabinet width KB', 337),
          spaceTowerKB: dim('275-1200', 'SPACE TOWER cabinet width KB', 337),
        },
        drilling: [],
        notes: [
          'Web codes: N DQCCLA, M DQCDAM, inner M DQCFEM, gallery B DQCGTA, gallery D DQCHIM, inner B DQCIXA, inner D DQCJMM, sink D DQCI7Y, SPACE TOWER DQGSBY, SPACE TWIN DQGVUM.',
          'unverified: no order-information tables or planning pages for TANDEMBOX plus exist in printed pp.336-337; part numbers, drilling and detailed dimensions not available in this range. Capacity 30 kg for N; 30/65 for others; SPACE TWIN 20 kg.',
        ],
        pages: [336, 337],
      },
    ],
    document: DOC,
    pages: [336, 337],
  },
];
