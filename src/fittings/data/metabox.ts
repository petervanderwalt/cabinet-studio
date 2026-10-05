// Transcribed from Blum "Catalogue and technical manual 2024/2025", METABOX (printed pages 338-361).
// Page numbers are PRINTED page numbers.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

type Height = 'N' | 'M' | 'K' | 'H';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const mm = (value: DimSpec['value'], meaning: string, page: number): DimSpec => ({ value, unit: 'mm', meaning, page });

/** Cabinet profiles + drawer sides: part no. pattern is 320<height><NL*10>C (screw-on) / ...C15 (quick assembly). */
function sideSets(h: Height, nominalLengths: number[], page: number): PartNumber[] {
  const out: PartNumber[] = [];
  for (const nl of nominalLengths) {
    const base = `320${h}${String(nl * 10).padStart(4, '0')}C`;
    out.push({
      role: 'cabinet-profile-and-drawer-side-set',
      partNo: base,
      description: `Cabinet profile + drawer side ${h}, screw-on, left/right`,
      when: { nominalLength: nl, version: 'screw-on' },
      page,
    });
    out.push({
      role: 'cabinet-profile-and-drawer-side-set',
      partNo: `${base}15`,
      description: `Cabinet profile + drawer side ${h}, quick assembly, left/right`,
      when: { nominalLength: nl, version: 'quick-assembly' },
      page,
    });
  }
  return out;
}

const blumotionPart = (page: number): PartNumber => ({
  role: 'motion',
  partNo: 'Z70.0320',
  description: 'BLUMOTION for METABOX 320 (soft close), latch R9001 or WGR',
  page,
});

/** Front fixings shared by the M, K, H and gallery pages (CLIP bracket + standard bracket + cover caps). */
function frontFixings(page: number, withCaps = true): PartNumber[] {
  const p: PartNumber[] = [
    { role: 'front-fixing', partNo: 'ZSF.130E', description: 'CLIP front fixing bracket, EXPANDO, left/right', when: { fixingMethod: 'EXPANDO' }, page },
    { role: 'front-fixing', partNo: 'ZSF.1300', description: 'CLIP front fixing bracket, knock-in, left/right', when: { fixingMethod: 'knock-in' }, page },
    { role: 'front-fixing', partNo: 'ZSF.1200', description: 'CLIP front fixing bracket, screw-on, left/right', when: { fixingMethod: 'screw-on' }, page },
  ];
  if (withCaps) {
    p.push({ role: 'cover-cap', partNo: 'ZAA.3700', description: 'Cover cap for CLIP bracket (plain; custom print from 1000 pcs)', page });
  }
  p.push(
    { role: 'front-fixing', partNo: 'ZSF.1800', description: 'Standard front fixing bracket, knock-in, left/right (alternative to CLIP)', when: { fixingMethod: 'knock-in' }, page },
    { role: 'front-fixing', partNo: 'ZSF.1700', description: 'Standard front fixing bracket, screw-on, left/right (alternative to CLIP)', when: { fixingMethod: 'screw-on' }, page },
  );
  if (withCaps) {
    p.push({ role: 'cover-cap', partNo: 'ZAA.3500', description: 'Cover cap for standard bracket (plain or Blum logo)', qty: 2, page });
  }
  return p;
}

function frontDrilling(id: string, holes: { y: number }[], minBelow: number, page: number, label: string): DrillingRule {
  return {
    id,
    target: 'front',
    label,
    reference:
      'Front fixing holes for knock-in / EXPANDO bracket, all on one vertical axis. y is measured upward from the centre of the lowest hole; ' +
      `the lowest hole sits min ${minBelow} mm above the bottom edge of the front (+2 mm with BLUMOTION; +3 mm for inner drawer with BLUMOTION). ` +
      'Position of the axis across the front width is not dimensioned on the page, so x = 0 is a placeholder.',
    holes: holes.map((h) => ({ x: 0, y: h.y, diameter: 10, note: 'Ø10 +0.2/-0.1 as printed at the top hole' })),
    page,
  };
}

const HEIGHT_DATA: Record<Height, { side: number; space: number; innerSpace: number; back: number; innerFront: number; ziF: string }> = {
  N: { side: 54, space: 78, innerSpace: 81, back: 39, innerFront: 61, ziF: 'ZIF.3010' },
  M: { side: 86, space: 110, innerSpace: 113, back: 71, innerFront: 61, ziF: 'ZIF.3000' },
  K: { side: 118, space: 142, innerSpace: 145, back: 103, innerFront: 93, ziF: 'ZIF.3030' },
  H: { side: 150, space: 174, innerSpace: 177, back: 135, innerFront: 125, ziF: 'ZIF.3050' },
};

function drawerVariant(h: Height, orderPage: number, planPage: number, nls: number[], webCodes: [string, string]): FittingVariant {
  const d = HEIGHT_DATA[h];
  const parts: PartNumber[] = [
    ...sideSets(h, nls, orderPage),
    ...(h === 'N'
      ? ([
          { role: 'front-fixing', partNo: 'ZSF.1610', description: 'Standard front fixing bracket, knock-in, left/right', when: { fixingMethod: 'knock-in' }, page: orderPage },
          { role: 'front-fixing', partNo: 'ZSF.1510', description: 'Standard front fixing bracket, screw-on, left/right', when: { fixingMethod: 'screw-on' }, page: orderPage },
        ] as PartNumber[])
      : frontFixings(orderPage)),
    { role: 'inner-drawer-front-fixing', partNo: d.ziF, description: 'Front fixing for inner drawers, nylon R9001, left/right', when: { application: 'inner-drawer' }, page: orderPage },
    blumotionPart(orderPage),
  ];

  const dims: Record<string, DimSpec> = {
    drawerSideHeight: mm(d.side, `Height of drawer side ${h}`, orderPage),
    spaceRequirementDrawer: mm(
      d.space,
      'Vertical space requirement in cabinet for a drawer (overview table); = min 24 above the reference line + min drawer side height. +2 mm with BLUMOTION',
      340,
    ),
    spaceRequirementInnerDrawer: mm(
      d.innerSpace,
      'Vertical space requirement in cabinet for an inner drawer (overview table). +3 mm for inner drawer with BLUMOTION',
      340,
    ),
    spaceAboveMin: mm(24, 'Minimum clearance above the drawer reference line in the space-requirement section (printed "min 24")', planPage),
    spaceBelowMin: mm(
      d.side,
      `Minimum height below the reference line, printed "min ${d.side}*"; equals the side height. * +2 mm with BLUMOTION, +3 mm for inner drawer with BLUMOTION`,
      planPage,
    ),
    sideClearancePerSide: mm(15.5, 'Horizontal dimension 15.5 in the section view between the cabinet side and the drawer base edge; consistent with base width LW - 31', planPage),
    cuttingBackHeight: mm(d.back, 'Chipboard back panel (16 mm chipboard) height, part B', planPage),
    cuttingBackWidth: mm('LW - 31', 'Chipboard back panel width; LW = internal cabinet width', planPage),
    cuttingBaseWidth: mm('LW - 31', 'Base panel (part A) width; LW = internal cabinet width', planPage),
    cuttingBaseLengthDrawer: mm('NL - 2', 'Base panel (part A) length for a drawer; NL = nominal length', planPage),
    cuttingBaseLengthInnerDrawer: mm('NL - 18', 'Base panel (part A) length for an inner drawer; NL = nominal length', planPage),
    cuttingInnerFrontWidth: mm('LW - 64', 'Front panel (part C) width for inner drawer', planPage),
    cuttingInnerFrontHeight: mm(d.innerFront, 'Front panel (part C) height for inner drawer', planPage),
    baseHoleX: { value: [69, 53], unit: 'mm', meaning: 'Dimension X on "Base - quick assembly version" drawing: 69 for drawer, 53 for inner drawer. Hole pattern Ø5, 9 and 9 offsets and 32 as drawn; reference edge not legible', page: planPage },
    backFixingHoleSpacing: mm(32, 'Hole spacing along the drawer back fixing as dimensioned on "Installation dimensions - back"', planPage),
    backFixingLowestHoleFromBottom: mm(18.5, 'Lowest hole dimension 18.5 on "Installation dimensions - back" (from the underside of the back/base as drawn)', planPage),
    backFixingInset: mm(9, 'Horizontal dimension 9 on "Installation dimensions - back"', planPage),
    webCodeDrawer: { value: webCodes[0], meaning: 'Blum web code, drawer', page: orderPage },
    webCodeInnerDrawer: { value: webCodes[1], meaning: 'Blum web code, inner drawer', page: orderPage },
    maxDynamicLoad: { value: 25, unit: 'kg', meaning: 'Dynamic load bearing', page: orderPage },
    screwOnFrontSpan: mm(d.side - 5, `Overall vertical dimension on screw-on front diagram (${d.side - 5} = side height - 5); reference line not stated`, planPage),
    frontScrewOnHoleSpacing: mm(h === 'N' ? 32 : 64, 'Vertical spacing between the two front fixing screw positions in the screw-on diagram', planPage),
    frontBottomGapMin: mm(5, 'Printed "min 5*" below the front in the screw-on diagram. * +2 mm with BLUMOTION, +3 mm for inner drawer with BLUMOTION', planPage),
    frontBottomGapMinInnerDrawer: mm(8, 'Printed "min 8*" for inner drawer in the screw-on diagram. * +3 mm for inner drawer with BLUMOTION', planPage),
    frontHorizontalOffset: mm(8.5, 'Horizontal dimension 8.5 in screw-on diagram, next to front overlay FA', planPage),
    innerDrawerFrontHorizontalOffset: mm(9, 'Horizontal dimension 9 for inner drawer in the screw-on diagram', planPage),
  };

  const drilling: DrillingRule[] = [];
  if (h === 'N') {
    drilling.push(frontDrilling('metabox-n-front-knock-in', [{ y: 0 }, { y: 32 }], 13.5, planPage, 'Front, knock-in, height N'));
    delete dims.backFixingHoleSpacing;
  } else if (h === 'M') {
    drilling.push(frontDrilling('metabox-m-front-knock-in', [{ y: 0 }, { y: 64 }], 13.5, planPage, 'Front, EXPANDO | knock-in, height M'));
    dims.backFixingHoleSpacing = mm(32, 'Hole spacing on "Installation dimensions - back" (one 32 dimension shown)', planPage);
  } else if (h === 'K') {
    drilling.push(frontDrilling('metabox-k-front-knock-in', [{ y: 0 }, { y: 64 }], 45.5, planPage, 'Front, EXPANDO | knock-in, height K'));
  } else {
    drilling.push(frontDrilling('metabox-h-front-knock-in', [{ y: 0 }, { y: 64 }], 77.5, planPage, 'Front, EXPANDO | knock-in, height H'));
  }

  const notes = [
    'Parts marked "order left/right" are sold per side; quantity per drawer is not printed.',
    'Cabinet profile and drawer sides: other colours (white, grey) available on request.',
    'unverified: horizontal position of the front drilling axis and the dimension 12 beside the front drilling diagram are not clearly referenced on the page.',
    'unverified: diameter of the lower front hole is not printed separately; Ø10 shown only at the top hole.',
    'unverified: base quick-assembly hole pattern (Ø5, offsets 9 and 9, 32, X) has no clear reference edge.',
  ];
  if (h === 'N') {
    notes.push('Height N offers only the standard front fixing bracket (no CLIP / EXPANDO bracket on this page).');
    notes.push('Chipboard front (inner drawer) height prints 61 mm for both N and M.');
  }
  if (h === 'M') notes.push('Chipboard front (inner drawer) height prints 61 mm for both N and M.');

  return {
    id: `metabox-${h.toLowerCase()}`,
    name: `Drawer | inner drawer ${h} (single extension)`,
    summary: `Single extension, side height ${d.side} mm, 25 kg dynamic load, BLUMATIC self closing`,
    choices: {
      nominalLength: nls,
      version: ['screw-on', 'quick-assembly'],
      colour: ['R9001'],
      application: ['drawer', 'inner-drawer'],
      fixingMethod: h === 'N' ? ['knock-in', 'screw-on'] : ['EXPANDO', 'knock-in', 'screw-on'],
      blumotion: ['no', 'yes'],
    },
    parts,
    dims,
    drilling,
    notes,
    pages: [340, orderPage, planPage],
  };
}

function galleryVariant(kind: 'B' | 'D'): FittingVariant {
  const order = kind === 'B' ? 350 : 352;
  const plan = kind === 'B' ? 351 : 353;
  const nls = [350, 400, 450, 500, 550];
  const parts: PartNumber[] = [
    ...sideSets('M', nls, order),
    ...frontFixings(order),
    blumotionPart(order),
    ...nls.map((nl, i) => ({
      role: 'gallery-rail',
      partNo: ['ZRE.321S.ID', 'ZRE.371S.ID', 'ZRE.421S.ID', 'ZRE.471S.ID', 'ZRE.521S.ID'][i],
      description: 'Longside gallery rail with chipboard back fixing, aluminium R9001, left/right',
      when: { nominalLength: nl },
      page: order,
    })),
  ];
  if (kind === 'D') {
    const boxside: [number, string][] = [
      [400, 'Z36H367SE01'],
      [450, 'Z36H417SE01'],
      [500, 'Z36H467SE01'],
      [550, 'Z36H517SE01'],
    ];
    for (const [nl, pn] of boxside) {
      parts.push({ role: 'boxside', partNo: pn, description: 'Single-wall BOXSIDE, steel R9001', when: { nominalLength: nl }, qty: 2, page: order });
    }
  }
  const dims: Record<string, DimSpec> = {
    drawerSideHeight: mm(86, 'Height of drawer side M used for this gallery variant', order),
    spaceRequirementOverview: mm(kind === 'B' ? 175 : 239, `Space requirement in cabinet (overview table), high fronted pull-out gallery ${kind}`, 340),
    spaceBelowMin: mm(86, 'Printed "min 86*" below the reference line in the section view. * +2 mm with BLUMOTION', plan),
    spaceAboveMin: mm(kind === 'B' ? 89 : 153, `Printed "min ${kind === 'B' ? 89 : 153}" above the reference line in the section view${kind === 'D' ? ' (with double gallery)' : ''}`, plan),
    sideClearancePerSide: mm(15.5, 'Horizontal dimension 15.5 in section view; consistent with base width LW - 31', plan),
    cuttingBackHeight: mm(kind === 'B' ? 127 : 191, 'Chipboard back panel (16 mm chipboard) height, part B', plan),
    cuttingBackWidth: mm('LW - 31', 'Chipboard back panel width; LW = internal cabinet width', plan),
    cuttingBaseWidth: mm('LW - 31', 'Base panel (part A) width', plan),
    cuttingBaseLength: mm('NL - 2', 'Base panel (part A) length; NL = nominal length', plan),
    baseHoleX: { value: 69, unit: 'mm', meaning: 'Dimension X on "Base - quick assembly version" drawing for high fronted pull-out; reference edge not legible', page: plan },
    frontHoleSpacing: mm(64, 'Spacing between successive front fixing holes (64 each)', plan),
    maxDynamicLoad: { value: 25, unit: 'kg', meaning: 'Dynamic load bearing', page: order },
  };
  const holeYs = kind === 'B' ? [0, 64, 128] : [0, 64, 128, 192];
  const drilling: DrillingRule[] = [
    frontDrilling(`metabox-gallery-${kind.toLowerCase()}-front`, holeYs.map((y) => ({ y })), 13.5, plan, `Front, EXPANDO | knock-in, gallery ${kind}`),
  ];
  return {
    id: `metabox-gallery-${kind.toLowerCase()}`,
    name: `High fronted pull-out - gallery ${kind}`,
    summary: `Single extension, side height M, single gallery${kind === 'D' ? ', single BOXSIDE possible' : ''}, 3-dimensional front adjustment`,
    choices: {
      nominalLength: nls,
      version: ['screw-on', 'quick-assembly'],
      colour: ['R9001'],
      fixingMethod: ['EXPANDO', 'knock-in', 'screw-on'],
      blumotion: ['no', 'yes'],
    },
    parts,
    dims,
    drilling,
    notes: [
      `Web code ${kind === 'B' ? 'DQCPYM' : 'DQCQNY'}.`,
      'unverified: front holes are all taken as Ø10 and spaced 64 mm as dimensioned; the page labels Ø10 on only some holes and gives no x position.',
      'unverified: width/position references of the base quick-assembly holes and back installation dimensions are not clear.',
      ...(kind === 'D' ? ['Double gallery changes the clearance above and the number of front holes (items marked ** on page 353); the "min 153" figure is the double gallery case.'] : []),
    ],
    pages: [340, order, plan],
  };
}

const accessories: FittingVariant = {
  id: 'metabox-accessories',
  name: 'METABOX accessories',
  summary: 'Child safety latch, anti-tilt, spacers, stops, METAFILE, screws, tools, ORGA-LINE gallery parts',
  choices: {
    spacerFrontProtrusionFE: [4, 8],
    posistopFrontGap: [1.5, 3],
  },
  parts: [
    { role: 'accessory', partNo: '295.5501', description: 'Child safety latch 320', page: 354 },
    { role: 'accessory', partNo: '320M0009.01', description: 'Pull-out stop 320, natural nylon', page: 354 },
    { role: 'accessory', partNo: '295.5300', description: 'Anti-tilt device (locking systems), RAL 9001', page: 354 },
    { role: 'spacer', partNo: '320M0048', description: 'Spacer FE 4.0 mm, screw-on', when: { frontProtrusionFE: 4 }, page: 355 },
    { role: 'spacer', partNo: '320M0088', description: 'Spacer FE 8.0 mm, screw-on', when: { frontProtrusionFE: 8, fixingMethod: 'screw-on' }, page: 355 },
    { role: 'spacer', partNo: '320M0188', description: 'Spacer FE 8.0 mm, dowel Ø5 mm', when: { frontProtrusionFE: 8, fixingMethod: 'dowel' }, page: 355 },
    { role: 'profile', partNo: 'ZSD.1200S', description: 'Contoured profile 1200 mm, for 16 mm base, nylon RAL 9001', page: 355 },
    { role: 'accessory', partNo: '298.3210.01', description: 'POSISTOP 320, front gap 1.5 mm', when: { frontGap: 1.5 }, page: 355 },
    { role: 'accessory', partNo: '298.3230.01', description: 'POSISTOP 320, front gap 3.0 mm', when: { frontGap: 3 }, page: 355 },
    { role: 'accessory', partNo: 'ZRM.5500', description: 'METAFILE file drawer set, nylon/steel RAL 9001', page: 356 },
    { role: 'motion', partNo: 'Z70.0320', description: 'BLUMOTION for METABOX 320, 25 kg', page: 357 },
    { role: 'screw', partNo: '609.1500', description: 'Chipboard screw Ø3.5 x 15.0', page: 357 },
    { role: 'screw', partNo: '609.1700', description: 'Chipboard screw Ø3.5 x 17.0', page: 357 },
    { role: 'screw', partNo: '661.1000.HG', description: 'System screw Ø6 x 10.0', page: 357 },
    { role: 'screw', partNo: '661.1150.HG', description: 'System screw Ø6 x 11.5', page: 357 },
    { role: 'screw', partNo: '661.1300.HG', description: 'System screw Ø6 x 13.0', page: 357 },
    { role: 'screw', partNo: '661.1450.HG', description: 'System screw Ø6 x 14.5', page: 357 },
    { role: 'screw', partNo: '661.2000.HG', description: 'System screw Ø6 x 20.0', page: 357 },
    { role: 'screw', partNo: '662.1150.HG', description: 'Special system screw Ø6 x 11.5', page: 357 },
    { role: 'screw', partNo: '662.1300.HG', description: 'Special system screw Ø6 x 13.0', page: 357 },
    { role: 'screw', partNo: '662.1450.HG', description: 'Special system screw Ø6 x 14.5', page: 357 },
    { role: 'tool', partNo: 'M01.ZZ03.01', description: 'Centre bit Ø2.7 for Ø3.5 screws, drilling depth to 8 mm', page: 357 },
    { role: 'tool', partNo: 'M01.ZZB3', description: 'Replacement bit for centre bit', page: 357 },
    { role: 'accessory', partNo: '993.710', description: 'Stick-on door buffer Ø8.0', page: 357 },
    { role: 'accessory', partNo: '993.706', description: 'Door buffer Ø8.0, two-part, RAL 9006', page: 358 },
    { role: 'tool', partNo: '303.756.1', description: 'Pozidriv PZ 2 screwdriver, 210 mm', page: 358 },
    { role: 'tool', partNo: '314.928.1', description: 'Slotted screwdriver size 1, 200 mm', page: 358 },
    { role: 'gallery', partNo: 'ZRG.1104U', description: 'Cross gallery rail 1104 mm, aluminium, cut to size (gallery)', when: { gallery: 'gallery' }, page: 359 },
    { role: 'gallery', partNo: 'ZRU.00Z0', description: 'Cross gallery connector, nylon', page: 359 },
    { role: 'gallery', partNo: 'ZRU.00F0', description: 'Lateral divider, clip-on to gallery, nylon', page: 359 },
    { role: 'gallery', partNo: 'ZRG.1104U', description: 'Cross gallery rail 1104 mm, aluminium, cut to size (BOXSIDE)', when: { gallery: 'boxside' }, page: 360 },
    { role: 'gallery', partNo: 'ZRU.10B1E', description: 'Gallery connector to BOXSIDE, nylon/steel', page: 360 },
  ],
  dims: {
    spacerStacking: { value: 24, unit: 'mm', meaning: 'Maximum spacing by stacking spacers (front protrusion FE)', page: 355 },
    spacerCombos: {
      value: [
        'FE 8 (170 deg hinge, screw Ø4x20): screw-on 1x 320M0088 | dowel 1x 320M0188',
        'FE 12 (100/107/110 deg hinge, screw Ø4x25): screw-on 320M0048 + 320M0088 | dowel 320M0048 + 320M0188',
        'FE 16 (profile/thick door hinge, screw Ø4x30): screw-on 2x 320M0088 | dowel 320M0088 + 320M0188',
        'FE 24 (maximum, screw Ø4x40): screw-on 3x 320M0088 | dowel 2x 320M0088 + 320M0188',
      ],
      meaning: 'Spacer stack for each hinge front protrusion FE, from the planning table',
      page: 355,
    },
    contouredProfileLength: mm(1200, 'Contoured profile stock length, cut to size', 355),
    contouredProfileCutDrawer: mm('NL - 2 - RD', 'Contoured profile length, drawer / high fronted pull-out; NL nominal length, RD cabinet back thickness', 355),
    contouredProfileCutInnerDrawer: mm('NL - 2 - RD - FD', 'Contoured profile length, inner drawer / inner pull-out; FD front thickness', 355),
    contouredBaseWidth: mm('LW - 34', 'Base width with contoured profile (16 mm base); LW internal cabinet width', 355),
    contouredBaseLengthDrawer: mm('NL - 2', 'Base length with contoured profile, drawer / high fronted pull-out', 355),
    contouredBaseLengthInnerDrawer: mm('NL - 2 - FD', 'Base length with contoured profile, inner drawer / inner pull-out', 355),
    childLatchOffsetFromCabinetFront: mm(37, 'Installation dimension 37 in the cabinet view for the child safety latch / pull-out stop 320 (reference: as drawn)', 354),
    childLatchHeightOffset: mm(14.4, 'Dimension 14.4 shown in cabinet and front views for the child safety latch', 354),
    childLatchFrontDims: mm([16, 28], 'Dimensions 16 and 28 in the front installation view of the child safety latch', 354),
    antiTiltHeightA: { value: ['N 56', 'M 88', 'K 120', 'H 152'], unit: 'mm', meaning: 'Anti-tilt device planning table, dimension A for METABOX 320 by drawer side height', page: 354 },
    antiTiltHeightB: { value: ['N 48.5', 'M 80.5', 'K 112.5', 'H 144.5'], unit: 'mm', meaning: 'Anti-tilt device planning table, dimension B for METABOX 320 by drawer side height', page: 354 },
    metafileCabinetWidthKB: { value: [275, 600], unit: 'mm', meaning: 'METAFILE: allowed cabinet width KB range (min, max)', page: 356 },
    metafileDinA4AcrossMinLW: mm(376, 'METAFILE, DIN-A4 across: minimum internal cabinet width LW', 356),
    metafileDinA4AcrossRail1: mm('NL - 28', 'METAFILE, DIN-A4 across: cut length 1', 356),
    metafileDinA4AcrossRail2: mm('NL - 53', 'METAFILE, DIN-A4 across: cut length 2', 356),
    metafileDinA4LengthwiseMinNL: mm(500, 'METAFILE, DIN-A4 lengthwise: minimum nominal length NL', 356),
    metafileLengthwise1: mm('NL - 28', 'METAFILE, DIN-A4 lengthwise: cut length 1', 356),
    metafileLengthwise2: mm(305, 'METAFILE, DIN-A4 lengthwise: cut length 2', 356),
    metafileLengthwise3: mm('NL - 406', 'METAFILE, DIN-A4 lengthwise: cut length 3', 356),
    metafileLengthwise4: mm('LW - 82', 'METAFILE, DIN-A4 lengthwise: cut length 4', 356),
    metafileLengthwise5: mm('LW - 59', 'METAFILE, DIN-A4 lengthwise: cut length 5', 356),
    blumotionMaxCabinetWidth: mm(900, 'One BLUMOTION unit is enough up to cabinet width KB 900 mm', 357),
    crossGalleryRailLength: mm(1104, 'Cross gallery rail stock length (gallery), cut to size; suitable for cabinet width KB 1200 mm', 359),
    crossGalleryRailCutGallery: mm('LW - 58', 'Cross gallery rail cut length with gallery; LW internal cabinet width', 359),
    crossGalleryRailCutBoxside: mm('LW - 65', 'Cross gallery rail cut length with BOXSIDE; LW internal cabinet width', 360),
  },
  drilling: [],
  notes: [
    'Spacers: screw-on version suits pre-drilled Ø5 mm holes; stacking up to 24 mm.',
    'POSISTOP 320 produces a 1.5 or 3 mm front gap, single extension only.',
    'METAFILE is for tilt adjustment, high fronted pull-out height B with gallery.',
    'unverified: METAFILE drilling/installation diagram numbers on page 356 (e.g. min 213, 160, 166, 32, 18.5) are not clearly referenced and are not transcribed.',
    'unverified: anti-tilt device and child safety latch drawing dimensions other than those listed have unclear references.',
    'unverified: the spacer combination table (page 355) was read from the table layout; verify the column assignment against the page before relying on spacerCombos.',
  ],
  pages: [354, 355, 356, 357, 358, 359, 360],
};

const fixingPositions: FittingVariant = {
  id: 'metabox-cabinet-profile-fixing',
  name: 'Cabinet profile fixing positions - 320 - 25 kg',
  choices: { nominalLength: [270, 300, 350, 400, 450, 500, 550] },
  parts: [
    { role: 'screw', partNo: '661.1450.HG', description: 'System screw Ø6 x 14.5 (fixing type B)', page: 361 },
    { role: 'screw', partNo: '609.1500', description: 'Chipboard screw Ø3.5 x 15 (fixing type C)', page: 361 },
  ],
  dims: {
    holePositionsFromFront: {
      value: [37, 165, 229, 261, 357, 389, 453, 517],
      unit: 'mm',
      meaning: 'Column headings on the fixing-position table: hole distances from the front end of the cabinet profile, measured as printed above the NL rows (not every position applies to each NL)',
      page: 361,
    },
  },
  drilling: [],
  notes: [
    'Fixing types: A = chipboard screws Ø4 x 15 mm (plus system screw hole); B = system screws Ø6 x 14.5 mm, part 661.1450.HG; C = chipboard screws Ø3.5 x 15 mm, part 609.1500.',
    'unverified: which positions (37, 165, 229, 261, 357, 389, 453, 517) are used for each NL and which fixing type (A, B, C) goes in each hole is shown only by symbols in the drawing and is not transcribed.',
  ],
  pages: [361],
};

export const metabox: FittingFamily[] = [
  {
    id: 'metabox',
    kind: 'box',
    brand: 'Blum',
    name: 'METABOX',
    summary: 'Single-extension box system, drawer sides N 54 / M 86 / K 118 / H 150 mm, 25 kg dynamic load, optional BLUMOTION',
    variants: [
      drawerVariant('N', 342, 343, [270, 350, 400, 450, 500, 550], ['DQCKBY', 'DQCN5A']),
      drawerVariant('M', 344, 345, [270, 350, 400, 450, 500, 550], ['DQCL1A', 'DQCNUM']),
      drawerVariant('K', 346, 347, [350, 400, 450, 500, 550], ['DQCLQM', 'DQCOJY']),
      drawerVariant('H', 348, 349, [350, 400, 450, 500, 550], ['DQCMFY', 'DQCP9A']),
      galleryVariant('B'),
      galleryVariant('D'),
      accessories,
      fixingPositions,
    ],
    document: DOC,
    pages: [338, 339, 340, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361],
  },
];
