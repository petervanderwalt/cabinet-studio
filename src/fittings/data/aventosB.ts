// AVENTOS HK top, HK-S, HK-XS stay lifts and shared lift accessories.
// Source: Blum Catalogue and technical manual 2024/2025, printed pages 44-69 (printed pages 70-73 are hinge
// system pages, not lift accessories, so nothing was taken from them).
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const part = (
  role: string,
  partNo: string,
  description: string,
  page: number,
  when?: Record<string, string | number>,
  qty?: number,
): PartNumber => ({ role, partNo, description, page, ...(when ? { when } : {}), ...(qty ? { qty } : {}) });

const dim = (value: DimSpec['value'], meaning: string, page: number, unit?: DimSpec['unit']): DimSpec => ({
  value,
  meaning,
  page,
  ...(unit ? { unit } : {}),
});

// ---------------------------------------------------------------------------------------------------------
// Shared colour legend (pages 46, 50, 56, 62)
// SW silk white, HGR light grey, TGR dark grey, IN-G in-mould brushed stainless, SZ black, WS white,
// WGR white grey, CS carbon black, R7036 RAL 7036 platinum grey, R7037 RAL 7037 dust grey.
// ---------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------
// AVENTOS HK top
// ---------------------------------------------------------------------------------------------------------
const hkTopLF = [
  { lf: '420-1610', std: '22K2310', chip: '22K2300', ow: '75-107' },
  { lf: '930-2800', std: '22K2510', chip: '22K2500', ow: '75-107' },
  { lf: '1730-5200', std: '22K2710', chip: '22K2700', ow: '75-107' },
  { lf: '3200-9000', std: '22K2910', chip: '22K2900', ow: '75-107' },
];
const hkTopTipOn = [
  { lf: '420-1610', std: '22K2310T', chip: '22K2300T', ow: '75-107' },
  { lf: '930-2800', std: '22K2510T', chip: '22K2500T', ow: '75-107' },
  { lf: '1730-5200', std: '22K2710T', chip: '22K2700T', ow: '75-100' },
  { lf: '3200-9000', std: '22K2910T', chip: '22K2900T', ow: '75-100' },
];

const hkTopSpaceDims = (pg: number): Record<string, DimSpec> => ({
  minInternalHeightLH: dim(173, 'Minimum internal cabinet height LH (drawing label "min 173 = min LH").', pg, 'mm'),
  minDimWithVisibleBracket: dim(
    261,
    'Dimension "min 261*" shown horizontally in the side-view space-requirement drawing; footnote: min. 261 mm with visible wall hanging bracket (footnote text names LH, drawing shows it horizontal).',
    pg,
    'mm',
  ),
  spaceReqDrawing187: dim(187, 'Horizontal dimension in the space-requirement drawing, not labelled in the catalogue.', pg, 'mm'),
  spaceReqDrawing30: dim(30, 'Dimension in the side-view space-requirement drawing, not labelled.', pg, 'mm'),
  spaceReqDrawing3: dim(3, 'Dimension shown at the top of the space-requirement drawing, not labelled.', pg, 'mm'),
  spaceReqDrawing1_5: dim(1.5, 'Dimension shown at the front edge of the space-requirement drawing, not labelled.', pg, 'mm'),
  cornicespaceY: dim(
    'FH x 0.29 + FD - SOB',
    'Space requirement Y at max opening angle (cornice/crown); FH front height, FD front thickness, SOB top panel thickness.',
    pg,
  ),
  cornicespaceXByFD: dim(
    ['FD16:X68', 'FD19:X57', 'FD22:X47', 'FD26:X33', 'FD28:X27'],
    'Space requirement X (mm) at max opening angle for front thickness FD (mm), cornice/crown.',
    pg,
  ),
  minGapMF: dim(2, 'Minimum gap MF between front and cabinet.', pg, 'mm'),
  frontOverlayUpperMax: dim(25.4, 'Maximum upper front overlay FAo.', pg, 'mm'),
  frontBracketFirstRowFromTop: dim(
    '62 + FAo',
    'Front assembly, wooden/wide alu fronts: distance from the top edge reference in the drawing to the first front-bracket screw row (FAo upper front overlay). Exact start line read from drawing, see notes.',
    pg,
  ),
  frontBracketRowSpacing: dim([32, 32, 32], 'Front assembly, wooden/wide alu fronts: successive spacings of the four screw rows.', pg, 'mm'),
  frontBracketFromSideEdge: dim(12.5, 'Front assembly, wooden/wide alu fronts: horizontal offset shown next to SFA (side front overlay).', pg, 'mm'),
  narrowAluFirstBracketFromTop: dim(15.5, 'Front assembly, narrow alu frames: distance from top of front (gap F) to first bracket.', pg, 'mm'),
  narrowAluBracketSpacing: dim(64, 'Front assembly, narrow alu frames: distance between the two front fixing brackets.', pg, 'mm'),
  narrowAluOffsetFAo: dim('62.5 + FAo', 'Front assembly, narrow alu frames: dimension shown at top of the frame, with FAo upper front overlay.', pg),
  sideOverlayNarrowAlu19: dim('11-18', 'Possible side front overlay SFA for a 19 mm wide narrow alu frame.', pg, 'mm'),
  aluFrameWidthRange: dim('19-22', 'Alu frame width range shown in narrow alu frame detail.', pg, 'mm'),
});

const hkTopDrilling = (pg: number): DrillingRule[] => [
  {
    id: 'hk-top-system-screws',
    target: 'carcass-side',
    label: 'Lift mechanism, pre-mounted system screws (4 x dia 5, depth 11.5)',
    reference:
      'Cabinet side panel. x from the front edge of the side panel; y downward from the top edge of the side panel (dimension 36 to the hole line). Hole spacing 37 / 32 / 64 / 32 from drawing.',
    holes: [
      { x: 37, y: 36, diameter: 5, depth: 11.5 },
      { x: 69, y: 36, diameter: 5, depth: 11.5 },
      { x: 133, y: 36, diameter: 5, depth: 11.5 },
      { x: 165, y: 36, diameter: 5, depth: 11.5 },
    ],
    page: pg,
  },
  {
    id: 'hk-top-chipboard-screws',
    target: 'carcass-side',
    label: 'Lift mechanism, chipboard screws dia 4 x 35 (4 screws, positioning system)',
    reference:
      'Cabinet side panel. x from the front edge of the side panel; y downward from the top edge of the side panel. Upper pair on y=33, lower pair on y=33+42. x positions 28, 28+11, 28+91, 28+91+11 read from the isometric drawing.',
    holes: [
      { x: 28, y: 33, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
      { x: 39, y: 33, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
      { x: 119, y: 75, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
      { x: 130, y: 75, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
    ],
    page: pg,
  },
];

const hkTopSharedNotes = [
  'Max. front weight FG 18 kg for two lift mechanisms.',
  'Power factor LF = cabinet height KH (mm) x front weight FG (kg) including double handle weight.',
  'Recommend the more powerful lift mechanism for overlapping areas; trial application recommended in borderline areas of a lift mechanism.',
  'Opening angle stop is integrated and infinitely variable.',
  'Use 4 chipboard screws (609.1x00) per side for wooden fronts; 4 counter sunk self tapping screws (660.0950) per side for wide alu frames.',
  'unverified: start line of the "62 + FAo" dimension in the front assembly drawing (underside of top panel vs front top edge) is not clear (page 48/51).',
  'unverified: the Dia 10 hole with dimensions 82 and 38.5 (orange, SERVO-DRIVE system-screw drawing, page 48) has an unclear reference point and is not transcribed as a drilling hole.',
  'unverified: meaning of 187, 235, 30, 67, 3 and 1.5 in the space-requirement drawing is not labelled; 235 and 67 (orange) apply to the SERVO-DRIVE drawing.',
  'Reference values for front weight FG are on printed page 716 (outside the extracted range).',
];

const hkTopStandardServo: FittingVariant = {
  id: 'aventos-hk-top-standard-servo-drive',
  name: 'AVENTOS HK top - Standard | SERVO-DRIVE (wooden fronts, wide and narrow alu frames)',
  summary: 'Stay lift, cabinet height KH 205-600 mm, width up to 1800 mm; Standard with BLUMOTION or electric SERVO-DRIVE.',
  choices: {
    powerFactorLF: hkTopLF.map((r) => r.lf),
    fixing: ['system-screws', 'chipboard-screws'],
    drive: ['standard', 'servo-drive'],
    frontType: ['wooden-or-wide-alu', 'narrow-alu', 'thin-EXPANDO-T'],
    coverCapColour: ['SW', 'HGR', 'TGR', 'IN-G'],
  },
  parts: [
    ...hkTopLF.flatMap((r) => [
      part('lift-mechanism-set', r.std, 'Lift mechanism set, system screws, 2 mechanisms', 46, { powerFactorLF: r.lf, fixing: 'system-screws' }),
      part('lift-mechanism-set', r.chip, 'Lift mechanism set, chipboard screws, 2 mechanisms', 46, { powerFactorLF: r.lf, fixing: 'chipboard-screws' }),
    ]),
    part('cover-cap-set', '22K8000', 'Cover cap set (SW, HGR, TGR), nylon', 46, { drive: 'standard' }),
    part('cover-cap-set', '23K8000', 'Cover cap set for SERVO-DRIVE (SW, HGR, TGR), nylon', 46, { drive: 'servo-drive' }),
    part('front-fixing', '20S4200', 'Front fixing bracket set, wooden/wide alu, screw-on', 46, { frontType: 'wooden-or-wide-alu' }),
    part('front-fixing', '20S4200A', 'Front fixing bracket set, narrow alu, incl. 8 screws 660.0950', 46, { frontType: 'narrow-alu' }),
    part('front-fixing', '20S42T1', 'Front fixing bracket, thin fronts, EXPANDO T', 46, { frontType: 'thin-EXPANDO-T' }, 2),
    part('servo-drive-set', '23KA000', 'SERVO-DRIVE set (drive unit, cable, node), TGR, nylon', 46, { drive: 'servo-drive' }),
    part('power-supply-housing', 'Z10NG120', 'Power supply unit housing, wall fixing, WGR', 46, { drive: 'servo-drive' }),
    // SERVO-DRIVE power supply unit and flex (page 47): Z10NE04 + market letter + language package letter
    part('power-supply', 'Z10NE04EA', 'PSU+flex, plug E Europe, lang. pkg A (DE EN FR IT NL)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'A' }),
    part('power-supply', 'Z10NE04EB', 'PSU+flex, plug E Europe, lang. pkg B (DA EN FI NO SV)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'B' }),
    part('power-supply', 'Z10NE04EC', 'PSU+flex, plug E Europe, lang. pkg C (EL EN HR SL SR TR)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'C' }),
    part('power-supply', 'Z10NE04ED', 'PSU+flex, plug E Europe, lang. pkg D (EN ES FR IT PT)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'D' }),
    part('power-supply', 'Z10NE04EE', 'PSU+flex, plug E Europe, lang. pkg E (CS HU PL SK)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'E' }),
    part('power-supply', 'Z10NE04EF', 'PSU+flex, plug E Europe, lang. pkg F (BG ET LT LV RO RU UK)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'F' }),
    part('power-supply', 'Z10NE04EI', 'PSU+flex, plug E Europe, lang. pkg I (EN)', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'I' }),
    part('power-supply', 'Z10NE04BA', 'PSU+flex, plug B (GB), lang. pkg A', 47, { drive: 'servo-drive', plug: 'B', languagePackage: 'A' }),
    part('power-supply', 'Z10NE04BI', 'PSU+flex, plug B (GB), lang. pkg I (EN)', 47, { drive: 'servo-drive', plug: 'B', languagePackage: 'I' }),
    part('power-supply', 'Z10NE04HI', 'PSU+flex, plug H (IN), lang. pkg I (EN)', 47, { drive: 'servo-drive', plug: 'H', languagePackage: 'I' }),
    part('power-supply', 'Z10NE04IA', 'PSU+flex, plug I (IL), lang. pkg A', 47, { drive: 'servo-drive', plug: 'I', languagePackage: 'A' }),
    part('power-supply', 'Z10NE04KI', 'PSU+flex, plug K (AU), lang. pkg I (EN)', 47, { drive: 'servo-drive', plug: 'K', languagePackage: 'I' }),
    part('power-supply', 'Z10NE04NH', 'PSU+flex, plug N (CN), lang. pkg H (EN ZH KO)', 47, { drive: 'servo-drive', plug: 'N', languagePackage: 'H' }),
    part('power-supply', 'Z10NE04RH', 'PSU+flex, plug R (KR), lang. pkg H (EN ZH KO)', 47, { drive: 'servo-drive', plug: 'R', languagePackage: 'H' }),
    part('power-supply', 'Z10NE04SK', 'PSU+flex, plug S (BR), lang. pkg K (EN ES PT)', 47, { drive: 'servo-drive', plug: 'S', languagePackage: 'K' }),
    part('power-supply', 'Z10NE04TH', 'PSU+flex, plug T (TW), lang. pkg H (EN ZH KO)', 47, { drive: 'servo-drive', plug: 'T', languagePackage: 'H' }),
    part('power-supply', 'Z10NE04UG', 'PSU+flex, plug U (US, CA), lang. pkg G (EN ES FR)', 47, { drive: 'servo-drive', plug: 'U', languagePackage: 'G' }),
    part('power-supply', 'Z10NE04UJ', 'PSU+flex, plug U (JP), lang. pkg J (JA)', 47, { drive: 'servo-drive', plug: 'U', languagePackage: 'J' }),
    part('power-supply', 'Z10NE04ZI', 'PSU+flex, plug Z (ZA), lang. pkg I (EN)', 47, { drive: 'servo-drive', plug: 'Z', languagePackage: 'I' }),
    // Alternative plug-in power supply (one drive unit only), on request
    part('power-supply-plug-in', 'Z10NA40EA', 'Plug-in PSU, Europe, lang. pkg A; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'A' }),
    part('power-supply-plug-in', 'Z10NA40EB', 'Plug-in PSU, Europe, lang. pkg B; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'B' }),
    part('power-supply-plug-in', 'Z10NA40EC', 'Plug-in PSU, Europe, lang. pkg C; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'C' }),
    part('power-supply-plug-in', 'Z10NA40ED', 'Plug-in PSU, Europe, lang. pkg D; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'D' }),
    part('power-supply-plug-in', 'Z10NA40EE', 'Plug-in PSU, Europe, lang. pkg E; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'E' }),
    part('power-supply-plug-in', 'Z10NA40EF', 'Plug-in PSU, Europe, lang. pkg F; one drive unit only', 47, { drive: 'servo-drive', plug: 'E', languagePackage: 'F' }),
    part('power-supply-plug-in', 'Z10NA40BA', 'Plug-in PSU, GB, lang. pkg A; one drive unit only', 47, { drive: 'servo-drive', plug: 'B', languagePackage: 'A' }),
    part('power-supply-plug-in', 'Z10NA40KI', 'Plug-in PSU, AU, lang. pkg I; one drive unit only', 47, { drive: 'servo-drive', plug: 'K', languagePackage: 'I' }),
    part('power-supply-plug-in', 'Z10NA40NH', 'Plug-in PSU, CN, lang. pkg H; one drive unit only', 47, { drive: 'servo-drive', plug: 'N', languagePackage: 'H' }),
    part('power-supply-plug-in', 'Z10NA40UG', 'Plug-in PSU, US/CA/JP, lang. pkg G; one drive unit only', 47, { drive: 'servo-drive', plug: 'U', languagePackage: 'G' }),
    part('accessory', 'Z10K800AE', 'SERVO-DRIVE distribution cable set, 8 m, SZ', 47, { drive: 'servo-drive' }),
    part('accessory', 'Z10V100E.01', 'Connecting node set, SZ, nylon', 47, { drive: 'servo-drive' }),
    part('accessory', 'Z10K0009', 'Cable holder, WS, nylon', 47, { drive: 'servo-drive' }),
    part('accessory', '993.0530', 'Blum distance bumper dia 5 (SERVO-DRIVE)', 69, { drive: 'servo-drive' }),
    part('accessory', '993.0830.01', 'Blum distance bumper dia 8 (SERVO-DRIVE)', 69, { drive: 'servo-drive' }),
  ],
  dims: {
    cabinetHeightKH: dim('205-600', 'Cabinet height KH range for AVENTOS HK top.', 44, 'mm'),
    cabinetWidthKBMax: dim(1800, 'Maximum cabinet width KB.', 44, 'mm'),
    maxFrontWeightTwoMechanisms: dim(18, 'Maximum front weight FG for a set of two lift mechanisms.', 46, 'kg'),
    powerFactorLF: dim('KH x FG', 'Power factor LF = cabinet height KH (mm) x front weight FG (kg) incl. double handle weight.', 46),
    openingAngleStd: dim('75-107', 'Opening angle OW range (degrees) for all four Standard/SERVO-DRIVE lift mechanism sets.', 46, 'deg'),
    thinFrontMinThickness: dim(8, 'Minimum front thickness for HK top with EXPANDO T (thin fronts, 8 mm or more).', 44, 'mm'),
    servoDriveDriveUnitsRecommendation: dim('2 synchronised drive units from 3 lift mechanisms', 'For three lift mechanisms or more two synchronised drive units are recommended.', 46),
    ...hkTopSpaceDims(48),
    drillDepthSystemScrews: dim(11.5, 'Drilling depth for dia 5 system screw holes.', 48, 'mm'),
    bumperHoleDia: dim(5, 'Blum distance bumper hole diameter in the cabinet side (SERVO-DRIVE only).', 49, 'mm'),
    bumperHoleDepthMin: dim(10, 'Drawing label "min 10" next to the bumper bore (depth).', 49, 'mm'),
    bumperHoleOffset8: dim(8, 'Offset 8 shown on the bumper drawing (horizontal from edge) and 8* from cabinet bottom edge for fronts that protrude below.', 49, 'mm'),
    switchHoleDia: dim(35, 'SERVO-DRIVE switch hole diameter in the front.', 49, 'mm'),
    switchHoleDepth: dim('11 (+0.5/0)', 'SERVO-DRIVE switch hole depth.', 49),
    switchHoleEdgeOffset: dim('12 (+/-0.3)', 'SERVO-DRIVE switch hole centre offset from the edge shown in the drawing.', 49),
    switchHoleDistanceFromBottom: dim('30-90', 'SERVO-DRIVE switch hole distance range (min 30, max 90) from the edge shown in the drawing.', 49, 'mm'),
  },
  drilling: hkTopDrilling(48),
  notes: [
    ...hkTopSharedNotes,
    'Standard order information: items 1 (lift mechanism set), 3 (cover cap set), 4 (front fixing) apply to Standard; SERVO-DRIVE adds 3 (cover cap set for SERVO-DRIVE), 6, 7/8 and accessories.',
    'Power supply: item 7 (PSU + flex) or alternative plug-in PSU (one drive unit only); plug-in PSU numbers are marked on request. Z10NE04 + market letter + language package letter. The distribution cable set Z10K800AE is required for two or more drive units (footnote page 47).',
    'Do not use bumpers in the upper third of the front. Insert Blum distance bumper without glue. Aluminium frames: allow for bumper drilling in cabinet side; trial application needed when fixing to front.',
    'unverified: references for bumper hole offsets 8 and 8* and for the SERVO-DRIVE switch hole dimensions (page 49) are not transcribed as drilling holes.',
  ],
  pages: [44, 45, 46, 47, 48, 49],
};

const hkTopTipOnVariant: FittingVariant = {
  id: 'aventos-hk-top-tip-on',
  name: 'AVENTOS HK top - TIP-ON (wooden fronts, wide and narrow alu frames)',
  summary: 'Stay lift with TIP-ON mechanical opening support; cabinet height KH 205-600 mm.',
  choices: {
    powerFactorLF: hkTopTipOn.map((r) => r.lf),
    fixing: ['system-screws', 'chipboard-screws'],
    frontType: ['wooden-or-wide-alu', 'narrow-alu', 'thin-EXPANDO-T'],
    tipOnColour: ['SW', 'R7036', 'CS'],
    adapterPlate: ['straight-short', 'cruciform-extended'],
  },
  parts: [
    ...hkTopTipOn.flatMap((r) => [
      part('lift-mechanism-set', r.std, 'Lift mechanism set TIP-ON, system screws', 50, { powerFactorLF: r.lf, fixing: 'system-screws' }),
      part('lift-mechanism-set', r.chip, 'Lift mechanism set TIP-ON, chipboard screws', 50, { powerFactorLF: r.lf, fixing: 'chipboard-screws' }),
    ]),
    part('cover-cap-set', '22K8000', 'Cover cap set (SW, HGR, TGR), nylon', 50),
    part('front-fixing', '20S4200', 'Front fixing bracket set, wooden/wide alu, screw-on', 50, { frontType: 'wooden-or-wide-alu' }),
    part('front-fixing', '20S4200A', 'Front fixing bracket set, narrow alu, incl. 8 screws 660.0950', 50, { frontType: 'narrow-alu' }),
    part('front-fixing', '20S42T1', 'Front fixing bracket, thin fronts, EXPANDO T', 50, { frontType: 'thin-EXPANDO-T' }, 2),
    part('tip-on', '956.1004', 'TIP-ON 956. short version with magnet (SW, R7036, CS)', 50, undefined),
    part('screw', '609.1500', 'Chipboard screw dia 3.5 x 15 (in TIP-ON pack)', 50),
    part('adapter-plate', '956.1201', 'Straight adapter plate, short (SW, R7036, CS)', 50, { adapterPlate: 'straight-short' }),
    part('adapter-plate', '956A1501', 'Cruciform adapter plate, extended (R7036)', 50, { adapterPlate: 'cruciform-extended' }),
  ],
  dims: {
    cabinetHeightKH: dim('205-600', 'Cabinet height KH range (TIP-ON page lists KH 205-600 mm).', 50, 'mm'),
    cabinetWidthKBMax: dim(1800, 'Maximum cabinet width KB.', 50, 'mm'),
    maxFrontWeightTwoMechanisms: dim(18, 'Maximum front weight FG for a set of two lift mechanisms.', 50, 'kg'),
    openingAngleLF1to2: dim('75-107', 'Opening angle OW (degrees) for LF 420-1610 and 930-2800.', 50, 'deg'),
    openingAngleLF3to4: dim('75-100', 'Opening angle OW (degrees) for LF 1730-5200 and 3200-9000.', 50, 'deg'),
    tipOnMaxKH: dim(600, 'TIP-ON 956. short version is for stay lifts up to this cabinet height.', 52, 'mm'),
    tipOnOutputPath: dim('approx. 17', 'TIP-ON output path.', 52, 'mm'),
    adapterFrontGapOffset: dim(3, 'Adapter plates: 3 mm offset installation of the front gap.', 53, 'mm'),
    adapterCatchPlateOffset: dim(8, 'Dimension 8 shown beside the catch plate in the adapter plate drawings (two positions); reference not clear.', 53, 'mm'),
    ...hkTopSpaceDims(51),
    drillDepthSystemScrews: dim(11.5, 'Drilling depth for dia 5 system screw holes.', 51, 'mm'),
  },
  drilling: hkTopDrilling(51),
  notes: [
    ...hkTopSharedNotes,
    'TIP-ON is for drilling or in combination with adapter plates (adapter plate ordered separately; TIP-ON ordered separately). Catch plate not suitable for powder-coated, waxed or oiled surfaces.',
    'Adapter plate designations: straight short 20/17, cruciform extended 37/32. Fixing with chipboard screws dia 3.5 or 4 mm, alternatively system screws. FAu = bottom front overlay.',
    'unverified: the dimension 8 in the adapter plate drawings (page 53) has no clear reference.',
  ],
  pages: [44, 45, 50, 51, 52, 53],
};

// ---------------------------------------------------------------------------------------------------------
// AVENTOS HK-S
// ---------------------------------------------------------------------------------------------------------
const hkSLF = [
  { lf: '220-500', std: '20K2B00.06', tip: '20K2B00T06' },
  { lf: '400-1000', std: '20K2C00.06', tip: '20K2C00T06' },
  { lf: '960-2215', std: '20K2E00.06', tip: '20K2E00T06' },
];

const hkS: FittingVariant = {
  id: 'aventos-hk-s-standard-tip-on',
  name: 'AVENTOS HK-S - Standard | TIP-ON (wooden fronts, wide and narrow alu frames)',
  summary: 'Small stay lift, cabinet height KH max. 600 mm, opening angle 107 deg, BLUMOTION.',
  choices: {
    powerFactorLF: hkSLF.map((r) => r.lf),
    version: ['standard', 'tip-on'],
    frontType: ['wooden-screw-on', 'wooden-EXPANDO', 'wide-alu', 'narrow-alu'],
    openingAngleStop: [75, 100],
    adapterPlate: ['straight-short', 'cruciform-extended'],
  },
  parts: [
    ...hkSLF.flatMap((r) => [
      part('lift-mechanism-set', r.std, 'Lift mechanism set (2 mech, 2 cover caps, 6 screws)', 56, { powerFactorLF: r.lf, version: 'standard' }),
      part('lift-mechanism-set', r.tip, 'Lift mechanism set TIP-ON (2 mech, caps, 6 screws)', 56, { powerFactorLF: r.lf, version: 'tip-on' }),
    ]),
    part('opening-angle-stop', '20K7A41', 'Opening angle stop 100 deg, TGR', 56, { openingAngleStop: 100 }),
    part('opening-angle-stop', '20K7A11', 'Opening angle stop 75 deg, R7037', 56, { openingAngleStop: 75 }),
    part('front-fixing', '175H3100', 'Front fixing bracket, wooden/wide alu, screw-on, spacing 0', 56, { frontType: 'wooden-screw-on' }, 2),
    part('front-fixing', '177H3100E', 'Front fixing bracket, wooden, EXPANDO, spacing 0', 56, { frontType: 'wooden-EXPANDO' }, 2),
    part('front-fixing', '177H3100', 'Front fixing bracket, wooden, knock-in, spacing 0', 56, { frontType: 'wooden-EXPANDO' }, 2),
    part('front-fixing', '20K4A00A02', 'Front fixing bracket set, narrow alu, screw-on', 56, { frontType: 'narrow-alu' }),
    part('tip-on', '956.1004', 'TIP-ON 956. short version with magnet (SW, R7036, CS)', 56, { version: 'tip-on' }),
    part('screw', '609.1500', 'Chipboard screw dia 3.5 x 15 (in TIP-ON pack)', 56, { version: 'tip-on' }),
    part('adapter-plate', '956.1201', 'Straight adapter plate, short (SW, R7036, CS)', 56, { adapterPlate: 'straight-short' }),
    part('adapter-plate', '956A1501', 'Cruciform adapter plate, extended (R7036)', 56, { adapterPlate: 'cruciform-extended' }),
  ],
  dims: {
    cabinetHeightKHMax: dim(600, 'Maximum cabinet height KH for AVENTOS HK-S.', 54, 'mm'),
    openingAngle: dim(107, 'Opening angle OW of the lift mechanism.', 56, 'deg'),
    thirdMechanismFactor: dim('+50%', 'Power factor LF can be increased by 50 % when a third lift mechanism is used.', 56),
    powerFactorLF: dim('KH x FG', 'Power factor LF = cabinet height KH (mm) x front weight FG (kg) incl. double handle weight.', 56),
    minInternalHeightLH: dim(150, 'Minimum internal cabinet height LH (drawing "min LH = 150").', 57, 'mm'),
    minInternalDepthVisibleBracket: dim(
      240,
      'Dimension "min 240" shown horizontally in the front-view space drawing; footnote: min. 240 mm with visible wall hanging bracket (footnote text names LH).',
      57,
      'mm',
    ),
    spaceReq163Horizontal: dim(163, 'Horizontal dimension 163 in the space-requirement drawing, not labelled in text.', 57, 'mm'),
    spaceReq163Vertical: dim('min 163', 'Vertical dimension "min 163" shown beside the lift mechanism in the space-requirement drawing, not labelled in text.', 57, 'mm'),
    spaceReqSide29: dim(29, 'Dimension 29 in the side view of the space-requirement drawing, not labelled in text.', 57, 'mm'),
    sobMax: dim(22, 'Maximum top panel thickness SOB ("SOB max 22" in peg position drawing).', 57, 'mm'),
    pegHoleDia: dim(5, 'Peg hole diameter, dia 5 in the peg position detail.', 57, 'mm'),
    pegMin5: dim(5, 'Detail label "min 5" next to the peg hole (peg depth/length); meaning not stated.', 57, 'mm'),
    cornicespaceYWithoutStop: dim('FH x 0.29 - 15 + FD', 'Space requirement Y, without opening angle stop.', 57),
    cornicespaceY100: dim('FH x 0.17 - 15 + FD', 'Space requirement Y with 100 deg opening angle stop.', 57),
    cornicespaceA75: dim('FH x 0.26 + 15 - FD', 'Space requirement A with 75 deg opening angle stop.', 57),
    cornicespaceXByFD: dim(['FD16:X70', 'FD19:X59', 'FD22:X49', 'FD26:X35'], 'Space requirement X (mm) for front thickness FD (mm).', 57),
    minGapMF: dim(2, 'Minimum gap MF.', 57, 'mm'),
    frontBracketFromTop: dim('78 - F', 'Front assembly: dimension from the top edge of the front region to the bracket reference, F = gap. Start line read from drawing.', 57),
    frontBracketHoleSpacing: dim(32, 'Front assembly, wooden/wide alu: vertical dimension 32 between the two screws of the bracket.', 57, 'mm'),
    frontBracketFromSideEdge: dim(12.5, 'Front assembly: horizontal offset 12.5 next to SFA (side front overlay).', 57, 'mm'),
    sideOverlayNarrowAlu19: dim('11-18', 'Possible side front overlay SFA for a 19 mm wide narrow alu frame.', 57, 'mm'),
    aluFrameWidthRange: dim('19-22', 'Alu frame width range shown in narrow alu frame detail.', 57, 'mm'),
  },
  drilling: [
    {
      id: 'hk-s-peg-position',
      target: 'carcass-side',
      label: 'Lift mechanism pegs (2 x dia 5)',
      reference:
        'Cabinet side panel. x from the front edge of the side panel; y downward from the top edge of the side panel (dimension 74 to the peg line). Pegs 37 and 37+64 from the front edge.',
      holes: [
        { x: 37, y: 74, diameter: 5 },
        { x: 101, y: 74, diameter: 5 },
      ],
      page: 57,
    },
    {
      id: 'hk-s-fixing-position',
      target: 'carcass-side',
      label: 'Lift mechanism fixing, 3 x chipboard screws dia 4 x 35',
      reference:
        'Cabinet side panel seen from inside. x from the front edge of the side panel; y downward from the top edge of the side panel (37 for the two upper screws, 106 for the lower screw). Positions 125, 53 and 35.5 from the front edge.',
      holes: [
        { x: 125, y: 37, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
        { x: 53, y: 37, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
        { x: 35.5, y: 106, diameter: 4, note: 'screw diameter; no pilot hole size is published' },
      ],
      page: 57,
    },
  ],
  notes: [
    'Use 2 chipboard screws (609.1x00) per side for wooden fronts; 2 counter sunk self tapping screws (660.0950) per side for wide alu frames.',
    'All horizontal steel mounting plates with 0 mm spacing are possible for the front fixing brackets.',
    'Recommend the more powerful lift mechanism for overlapping areas; trial application recommended in borderline areas.',
    'TIP-ON: for drilling or in combination with adapter plates; catch plate not suitable for powder-coated, waxed or oiled surfaces.',
    'unverified: catalogue footnote under the space-requirement drawing names the starred "min 240" mm as LH, but the drawing shows it horizontally (page 57).',
    'unverified: reference of "min 5" at the peg detail and start line of "78 - F" in front assembly drawings (page 57).',
    'unverified: footnote "Lift mechanisms are unsprung" on the order table (page 56) - which row it refers to is not clear.',
    'Reference values for front weight FG are on printed page 716 (outside the extracted range).',
  ],
  pages: [54, 55, 56, 57, 58, 59],
};

// ---------------------------------------------------------------------------------------------------------
// AVENTOS HK-XS
// ---------------------------------------------------------------------------------------------------------
const hkXsStd = [
  { lf: '200-1000', no: '20K1101' },
  { lf: '500-1500', no: '20K1301' },
  { lf: '800-1800', no: '20K1501' },
];
const hkXsTip = [
  { lf: '180-800', no: '20K1101T' },
  { lf: '500-1200', no: '20K1301T' },
  { lf: '800-1600', no: '20K1501T' },
];

const hkXs: FittingVariant = {
  id: 'aventos-hk-xs-standard-tip-on',
  name: 'AVENTOS HK-XS - Standard | TIP-ON (wooden fronts, wide and narrow alu frames)',
  summary: 'Slim stay lift, KH 240-600 mm, internal depth LT min. 125 mm (100 mm with special drilling), symmetrical, used with CLIP top hinges.',
  choices: {
    powerFactorLF: [...hkXsStd.map((r) => r.lf), ...hkXsTip.map((r) => r.lf)],
    version: ['standard', 'tip-on'],
    cabinetFixing: ['screw-on', 'EXPANDO'],
    frontType: ['wooden-screw-on', 'wooden-EXPANDO', 'narrow-alu'],
    hingeBoss: ['INSERTA', 'screw-on'],
    mountingPlate: ['screw-on', 'EXPANDO'],
    adapterPlate: ['straight-short', 'cruciform-extended'],
  },
  parts: [
    ...hkXsStd.map((r) => part('lift-mechanism', r.no, 'Lift mechanism (symmetrical), 105 deg', 62, { powerFactorLF: r.lf, version: 'standard' })),
    ...hkXsTip.map((r) => part('lift-mechanism', r.no, 'Lift mechanism (symmetrical) TIP-ON, 105 deg', 62, { powerFactorLF: r.lf, version: 'tip-on' })),
    part('cabinet-fixing', '20K5101', 'Cabinet fixing, screw-on', 62, { cabinetFixing: 'screw-on' }),
    part('cabinet-fixing', '20K51E1', 'Cabinet fixing, EXPANDO', 62, { cabinetFixing: 'EXPANDO' }),
    part('front-fixing', '20K4101', 'Front fixing bracket, wooden/wide alu, screw-on', 62, { frontType: 'wooden-screw-on' }),
    part('front-fixing', '20K41E1', 'Front fixing bracket, wooden, EXPANDO', 62, { frontType: 'wooden-EXPANDO' }),
    part('front-fixing', '20K4101A', 'Front fixing bracket, narrow alu, screw-on', 62, { frontType: 'narrow-alu' }),
    part('tip-on', '956.1004', 'TIP-ON 956. short version with magnet (SW, R7036, CS)', 62, { version: 'tip-on' }),
    part('screw', '609.1500', 'Chipboard screw dia 3.5 x 15 (in TIP-ON pack)', 62, { version: 'tip-on' }),
    part('hinge', '71B3590', 'CLIP top BLUMOTION 110 deg hinge, INSERTA, with spring', 62, { version: 'standard', hingeBoss: 'INSERTA' }),
    part('hinge', '71B3550', 'CLIP top BLUMOTION 110 deg hinge, screw-on, with spring', 62, { version: 'standard', hingeBoss: 'screw-on' }),
    part('hinge', '70T3590.TL', 'CLIP top 110 deg hinge, INSERTA, unsprung', 62, { version: 'tip-on', hingeBoss: 'INSERTA' }),
    part('hinge', '70T3550.TL', 'CLIP top 110 deg hinge, screw-on, unsprung', 62, { version: 'tip-on', hingeBoss: 'screw-on' }),
    part('mounting-plate', '175H3100', 'Mounting plate, screw-on, spacing 0', 62, { mountingPlate: 'screw-on' }),
    part('mounting-plate', '177H3100E', 'Mounting plate, EXPANDO, spacing 0', 62, { mountingPlate: 'EXPANDO' }),
    part('opening-angle-stop', '70T3553', 'Opening angle stop 86 deg (SZ) for CLIP top 110 hinges', 63),
    part('adapter-plate', '956.1201', 'Straight adapter plate, short (SW, R7036, CS)', 63, { adapterPlate: 'straight-short' }),
    part('adapter-plate', '956A1501', 'Cruciform adapter plate, extended (R7036)', 63, { adapterPlate: 'cruciform-extended' }),
  ],
  dims: {
    cabinetHeightKH: dim('240-600', 'Cabinet height KH range for AVENTOS HK-XS.', 60, 'mm'),
    internalDepthLTMin: dim(125, 'Minimum internal cabinet depth LT.', 60, 'mm'),
    internalDepthLTSpecial: dim(100, 'Internal cabinet depth LT possible with the special (bracketed) drilling position.', 62, 'mm'),
    openingAngle: dim(105, 'Opening angle OW of the lift mechanism; hinges with a smaller opening angle limit the opening.', 62, 'deg'),
    powerFactorTwoSides: dim('x2', 'Power factor LF is doubled when the lift mechanism is used on two sides.', 62),
    powerFactorLF: dim('KH x FG', 'Power factor LF = cabinet height KH (mm) x front weight FG (kg) incl. double handle weight.', 62),
    hingesThreeFromKB: dim(900, '3 hinges recommended starting at cabinet width KB 900 mm and/or LF 1800.', 62, 'mm'),
    hingesFourFromKB: dim(1200, '4 hinges recommended starting at cabinet width KB 1200 mm and/or LF 2700.', 62, 'mm'),
    drillingHeightH: dim('137 + MD + K + SOB', 'Mounting position H from the top edge of the cabinet side; MD mounting plate spacing, K hinge arm cranking (0 / 9.5 / 18 mm), SOB top panel thickness.', 64),
    drillingHeightBelowTopPanel: dim('137 + MD + K', 'Position of the upper fixing hole below the underside of the top panel (excl. SOB).', 64),
    drillingHoleSpacing: dim(32, 'Vertical distance between the two fixing holes (dimension 32).', 64, 'mm'),
    drillingFromFrontEdge: dim(37, 'Horizontal distance of the fixing holes from the front edge of the cabinet side.', 64, 'mm'),
    drillingFromFrontEdgeLT100: dim(45, 'Same as above for internal cabinet depth LT 100 mm (value shown in brackets).', 64, 'mm'),
    hingeArmCrankingK: dim([0, 9.5, 18], 'K cranking of hinge arm: straight 0, cranked 9.5, double cranked 18 mm.', 64, 'mm'),
    minInternalHeightLH: dim(200, 'Minimum internal cabinet height LH (drawing "min LH = 200").', 64, 'mm'),
    minInternalDepth125: dim(125, 'Drawing label "min 125*" (and min 100 in brackets) shown horizontally; footnote text says Min. 200 mm with visible wall hanging bracket.', 64, 'mm'),
    spaceReqSide27: dim(27, 'Dimension 27 in the side view of the space-requirement drawing, not labelled.', 64, 'mm'),
    spaceRequirementY: dim('(FH - X) x 0.3', 'Space requirement Y; FH front height, X by front thickness FD (CLIP top BLUMOTION 110 deg hinge).', 64),
    spaceRequirementXByFD: dim(['FD16:X45', 'FD19:X34', 'FD22:X23', 'FD24:X15'], 'X (mm) for front thickness FD (mm), CLIP top BLUMOTION 110 deg hinge.', 64),
    minGapMFu: dim(1.5, 'Minimum gap at the bottom MFu.', 64, 'mm'),
    minGapMFo: dim('depends on hinge used', 'Minimum gap at the top MFo depends on the hinge used.', 64),
    frontHoleFromTopWooden: dim('125.5 + MD + K', 'Front assembly wooden/wide alu: distance to hole (131.5 + MD + K for LT 100 mm), FAo upper front overlay. Start line read from drawing.', 64),
    frontHoleFromTopWoodenLT100: dim('131.5 + MD + K', 'Same for internal cabinet depth LT 100 mm.', 64),
    frontHoleSpacingWooden: dim(32, 'Front assembly wooden/wide alu: spacing 32 between the two screws.', 64, 'mm'),
    frontHoleFromSideEdge: dim(15.5, 'Front assembly: horizontal dimension 15.5 next to SFA (side front overlay).', 64, 'mm'),
    frontHoleFromTopNarrowAlu: dim('126 + MD + K', 'Front assembly narrow alu: distance to bracket (132 + MD + K for LT 100 mm).', 64),
    frontHoleFromTopNarrowAluLT100: dim('132 + MD + K', 'Same for internal cabinet depth LT 100 mm.', 64),
    sideOverlayNarrowAlu19: dim('11-18', 'Possible side front overlay SFA for a 19 mm wide narrow alu frame.', 64, 'mm'),
    aluFrameWidthRange: dim('19-22', 'Alu frame width range shown in narrow alu frame detail.', 64, 'mm'),
    hingeDrillingDistanceTB: dim('3-7', 'Hinge drilling distance TB range (mm) used for gap calculation.', 65, 'mm'),
    minGapFTableTB3: dim(['FD16:0.5', 'FD18:0.8', 'FD19:1.0', 'FD20:1.2', 'FD21:1.5', 'FD22:1.8', 'FD23:2.2', 'FD24:2.7', 'FD25:3.5', 'FD26:4.3', 'FD28:trial', 'FD30:trial'], 'Minimum gap F (mm) for fronts with radius R=1 mm at drilling distance TB 3 (factory setting, MD 0).', 65),
    minGapFTableTB4: dim(['FD16:0.5', 'FD18:0.8', 'FD19:1.0', 'FD20:1.2', 'FD21:1.4', 'FD22:1.7', 'FD23:2.0', 'FD24:2.5', 'FD25:3.1', 'FD26:3.8', 'FD28:trial', 'FD30:trial'], 'Minimum gap F (mm), TB 4.', 65),
    minGapFTableTB5: dim(['FD16:0.5', 'FD18:0.8', 'FD19:0.9', 'FD20:1.2', 'FD21:1.4', 'FD22:1.7', 'FD23:2.0', 'FD24:2.4', 'FD25:2.9', 'FD26:3.4', 'FD28:trial', 'FD30:trial'], 'Minimum gap F (mm), TB 5.', 65),
    minGapFTableTB6: dim(['FD16:0.5', 'FD18:0.8', 'FD19:0.9', 'FD20:1.2', 'FD21:1.3', 'FD22:1.6', 'FD23:1.9', 'FD24:2.3', 'FD25:2.7', 'FD26:3.2', 'FD28:trial', 'FD30:trial'], 'Minimum gap F (mm), TB 6.', 65),
    minGapFTableTB7: dim(['FD16:0.5', 'FD18:0.8', 'FD19:0.9', 'FD20:1.1', 'FD21:1.3', 'FD22:1.6', 'FD23:1.9', 'FD24:2.2', 'FD25:2.6', 'FD26:3.0', 'FD28:trial', 'FD30:trial'], 'Minimum gap F (mm), TB 7.', 65),
    minGapFAdditionalHeightAdjust: dim(['FD16:+0.2', 'FD18:+0.4', 'FD19:+0.4', 'FD20:+0.5', 'FD21:+0.5', 'FD22:+0.5', 'FD23:+0.5', 'FD24:+0.5', 'FD25:+0.5', 'FD26:+0.5'], 'Additional gap F (mm) for +2 mm height adjustment, by front thickness FD.', 65),
  },
  drilling: [
    {
      id: 'hk-xs-cabinet-fixing-K0-MD0',
      target: 'carcass-side',
      label: 'Cabinet fixing holes, straight hinge arm K=0, mounting plate spacing MD=0',
      reference:
        'Cabinet side panel. x from the front edge of the side panel (37 mm; 45 mm for LT 100); y downward from the underside of the top panel (137 + MD + K). Second hole 32 mm further down. Hole diameter not published.',
      holes: [
        { x: 37, y: 137, diameter: 0, note: 'hole diameter not published (unverified)' },
        { x: 37, y: 169, diameter: 0, note: 'hole diameter not published (unverified)' },
      ],
      when: { MD: [0], K: [0], internalDepthLT: ['125+'] },
      page: 64,
    },
    {
      id: 'hk-xs-cabinet-fixing-K0-MD0-LT100',
      target: 'carcass-side',
      label: 'Cabinet fixing holes for internal depth LT 100, K=0, MD=0',
      reference:
        'Cabinet side panel. x from the front edge of the side panel (45 mm shown in brackets for LT 100); y downward from the underside of the top panel.',
      holes: [
        { x: 45, y: 137, diameter: 0, note: 'hole diameter not published (unverified)' },
        { x: 45, y: 169, diameter: 0, note: 'hole diameter not published (unverified)' },
      ],
      when: { MD: [0], K: [0], internalDepthLT: [100] },
      page: 64,
    },
  ],
  notes: [
    'Closes softly in conjunction with CLIP top BLUMOTION hinges; TIP-ON versions are for handle-less fronts with CLIP top unsprung hinges (70T35xx.TL).',
    'Hinges are recommended items: 3 hinges from KB 900 mm and/or LF 1800; 4 hinges from KB 1200 mm and/or LF 2700. Alternatives: CLIP top BLUMOTION 107 deg, profile/thick door, 95 deg alu frame door hinge; CLIP top hinges 107 deg etc. (page 62).',
    'Use 2 chipboard screws (609.1x00) per side for wooden fronts; 2 counter sunk self tapping screws (660.0950) per side for wide alu frames.',
    'Mounting plates (175H3100 / 177H3100E) are standard plates; plate spacing depends on top gap F.',
    'Lift mechanism symmetrical, can be used on one or both sides; for wide/heavy fronts fit a mechanism both sides (LF doubles).',
    'unverified: drilling hole diameters for the cabinet-fixing holes are not published on page 64; diameter 0 is a placeholder. Lift mechanism fixing screw positions are not dimensioned.',
    'unverified: footnote on page 64 says "Min. 200 mm with visible wall hanging bracket" while the drawing shows "min LH = 200" and "min 125*"; which dimension carries the asterisk is unclear.',
    'unverified: drilling distance TB versus front overlay FA / MD table (page 65) is not legibly transcribable (row/column alignment is scrambled).',
    'unverified: overlay application dimensions 21.5, 12, 66.5 in the hinge protrusion drawing (page 65) are not labelled.',
    'Reference values for front weight FG are on printed page 716 (outside the extracted range).',
  ],
  pages: [60, 61, 62, 63, 64, 65, 66, 67],
};

// ---------------------------------------------------------------------------------------------------------
// Shared lift accessories (pages 68-69)
// ---------------------------------------------------------------------------------------------------------
const accessories: FittingVariant = {
  id: 'lift-accessories',
  name: 'Lift systems - shared accessories',
  summary: 'Screws, centre bit, door buffers, distance bumpers and tools for AVENTOS lift systems.',
  choices: {
    screwLength: [9.5, 10, 11.5, 13, 14.5, 15, 17, 20, 35],
  },
  parts: [
    part('screw', '609.1500', 'Chipboard screw dia 3.5 x 15, nickel plated', 68, { screwLength: 15 }),
    part('screw', '609.1700', 'Chipboard screw dia 3.5 x 17, nickel plated', 68, { screwLength: 17 }),
    part('screw', '664.3500', 'Chipboard screw dia 4.0 x 35, for lift mechanisms', 68, { screwLength: 35 }),
    part('screw', '660.0950', 'Countersunk self-tapping screw dia 3.5 x 9.5, alu frames', 68, { screwLength: 9.5 }),
    part('screw', '661.1000.HG', 'System screw dia 6 x 10', 68, { screwLength: 10 }),
    part('screw', '661.1150.HG', 'System screw dia 6 x 11.5', 68, { screwLength: 11.5 }),
    part('screw', '661.1300.HG', 'System screw dia 6 x 13', 68, { screwLength: 13 }),
    part('screw', '661.1450.HG', 'System screw dia 6 x 14.5', 68, { screwLength: 14.5 }),
    part('screw', '661.2000.HG', 'System screw dia 6 x 20', 68, { screwLength: 20 }),
    part('tool', 'M01.ZZ03.01', 'Centre bit dia 2.7 for dia 3.5 chipboard screws', 68),
    part('tool', 'M01.ZZB3', 'Replacement bit for centre bit', 68),
    part('door-buffer', '993.710', 'Stick-on door buffer dia 8, nylon', 68),
    part('door-buffer', '993.706', 'Door buffer dia 8, two-part, RAL 9006', 69),
    part('distance-bumper', '993.0530', 'Blum distance bumper dia 5 (SERVO-DRIVE)', 69),
    part('distance-bumper', '993.0830.01', 'Blum distance bumper dia 8 (SERVO-DRIVE)', 69),
    part('tool', '623.882.2', 'TORX T20 screwdriver, 100 mm', 69),
    part('tool', '209.093.7', 'TORX T20 screwdriver, 210 mm', 69),
    part('tool', '771.843.5', 'TORX T8 screwdriver, 200 mm', 69),
    part('tool', '303.756.1', 'Pozidriv PZ 2 screwdriver, 210 mm', 69),
    part('tool', '314.928.1', 'Slotted screwdriver size 1, 200 mm', 69),
    part('tool', '740.749.1', 'Cross slot bit, Pozidriv PZ 2', 69),
  ],
  dims: {
    selfTappingScrewPilotDia: dim(2.8, 'Drilling diameter for countersunk self-tapping screw 660.0950.', 68, 'mm'),
    systemScrewDrillDia: dim(5, 'Drilling diameter for dia 6 system screws.', 68, 'mm'),
    centreBitDia: dim(2.7, 'Centre bit diameter (pre-drill for dia 3.5 chipboard screws).', 68, 'mm'),
    centreBitDepthMax: dim(8, 'Centre bit drilling depth up to 8 mm.', 68, 'mm'),
    doorBufferDia: dim(8, 'Door buffer diameter (993.710 and 993.706).', 68, 'mm'),
    distanceBumperDia: dim([5, 8], 'Blum distance bumper diameters available.', 69, 'mm'),
    distanceBumperMin10: dim(10, 'Drawing label "min 10" on the distance bumper (hole depth).', 69, 'mm'),
  },
  drilling: [],
  notes: ['Printed pages 70-73 of the requested range are hinge system pages and contain no lift accessories.'],
  pages: [68, 69],
};

export const aventosB: FittingFamily[] = [
  {
    id: 'aventos-hk-top',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HK top',
    summary: 'Stay lift for small to large wall and tall cabinets, KH 205-600 mm, KB up to 1800 mm, optional SERVO-DRIVE or TIP-ON.',
    variants: [hkTopStandardServo, hkTopTipOnVariant],
    document: DOC,
    pages: [44, 45, 46, 47, 48, 49, 50, 51, 52, 53],
  },
  {
    id: 'aventos-hk-s',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HK-S',
    summary: 'Small stay lift for wall cabinets up to KH 600 mm, BLUMOTION, optional TIP-ON.',
    variants: [hkS],
    document: DOC,
    pages: [54, 55, 56, 57, 58, 59],
  },
  {
    id: 'aventos-hk-xs',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HK-XS',
    summary: 'Slim stay lift for small and shallow wall cabinets, KH 240-600 mm, LT min 125 mm, with CLIP top hinges.',
    variants: [hkXs],
    document: DOC,
    pages: [60, 61, 62, 63, 64, 65, 66, 67],
  },
  {
    id: 'aventos-lift-accessories',
    kind: 'lift',
    brand: 'Blum',
    name: 'Lift systems accessories',
    summary: 'Shared screws, bits, buffers, bumpers and tools for lift systems.',
    variants: [accessories],
    document: DOC,
    pages: [68, 69],
  },
];
