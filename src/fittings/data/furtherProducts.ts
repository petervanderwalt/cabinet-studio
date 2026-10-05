import type { DimSpec, FittingFamily, FittingVariant, PartNumber } from '../types';

const d = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({ value, unit, meaning, page });
const p = (role: string, partNo: string, description: string, page: number, when?: PartNumber['when'], qty?: number): PartNumber => ({
  role,
  partNo,
  description,
  ...(when ? { when } : {}),
  ...(qty ? { qty } : {}),
  page,
});

// ---------------------------------------------------------------------------------------------
// SERVO-DRIVE single applications (printed pages 574-583)
// ---------------------------------------------------------------------------------------------

/** Plug-in power supply unit (one drive unit only), pages 576 and 582; all marked on request. */
const pluginPsu = (page: number): PartNumber[] => [
  p('power-supply', 'Z10NA40EA', 'Plug-in PSU, Europe, language pack A (DE EN FR IT NL), on request', page, { market: 'Europe', languagePackage: 'A' }),
  p('power-supply', 'Z10NA40EB', 'Plug-in PSU, Europe, language pack B (DA EN FI NO SV), on request', page, { market: 'Europe', languagePackage: 'B' }),
  p('power-supply', 'Z10NA40EC', 'Plug-in PSU, Europe, language pack C (EL EN HR SL SR TR), on request', page, { market: 'Europe', languagePackage: 'C' }),
  p('power-supply', 'Z10NA40ED', 'Plug-in PSU, Europe, language pack D (EN ES FR IT PT), on request', page, { market: 'Europe', languagePackage: 'D' }),
  p('power-supply', 'Z10NA40EE', 'Plug-in PSU, Europe, language pack E (CS HU PL SK), on request', page, { market: 'Europe', languagePackage: 'E' }),
  p('power-supply', 'Z10NA40EF', 'Plug-in PSU, Europe, language pack F (BG ET LT LV RO RU UK), on request', page, { market: 'Europe', languagePackage: 'F' }),
  p('power-supply', 'Z10NA40BA', 'Plug-in PSU, GB, language pack A (DE EN FR IT NL), on request', page, { market: 'GB', languagePackage: 'A' }),
  p('power-supply', 'Z10NA40KI', 'Plug-in PSU, AU, language pack I (EN), on request', page, { market: 'AU', languagePackage: 'I' }),
  p('power-supply', 'Z10NA40NH', 'Plug-in PSU, CN, language pack H (EN ZH KO), on request', page, { market: 'CN', languagePackage: 'H' }),
  p('power-supply', 'Z10NA40UG', 'Plug-in PSU, US/CA/JP, language pack G (EN ES FR), on request', page, { market: 'US|CA|JP', languagePackage: 'G' }),
];

/** Power supply unit and flex (two or more drive units), pages 578 and 580. */
const flexPsu = (page: number): PartNumber[] => {
  const rows: [string, string, string, string][] = [
    ['Z10NE04EA', 'Europe', 'A', 'DE EN FR IT NL'],
    ['Z10NE04EB', 'Europe', 'B', 'DA EN FI NO SV'],
    ['Z10NE04EC', 'Europe', 'C', 'EL EN HR SL SR TR'],
    ['Z10NE04ED', 'Europe', 'D', 'EN ES FR IT PT'],
    ['Z10NE04EE', 'Europe', 'E', 'CS HU PL SK'],
    ['Z10NE04EF', 'Europe', 'F', 'BG ET LT LV RO RU UK'],
    ['Z10NE04EI', 'Europe', 'I', 'EN'],
    ['Z10NE04BA', 'GB', 'A', 'DE EN FR IT NL'],
    ['Z10NE04BI', 'GB', 'I', 'EN'],
    ['Z10NE04HI', 'IN', 'I', 'EN'],
    ['Z10NE04IA', 'IL', 'A', 'DE EN FR IT NL'],
    ['Z10NE04KI', 'AU', 'I', 'EN'],
    ['Z10NE04NH', 'CN', 'H', 'EN ZH KO'],
    ['Z10NE04RH', 'KR', 'H', 'EN ZH KO'],
    ['Z10NE04SK', 'BR', 'K', 'EN ES PT'],
    ['Z10NE04TH', 'TW', 'H', 'EN ZH KO'],
    ['Z10NE04UG', 'US|CA', 'G', 'EN ES FR'],
    ['Z10NE04UJ', 'JP', 'J', 'JA'],
    ['Z10NE04ZI', 'ZA', 'I', 'EN'],
  ];
  return rows.map(([no, market, lang, langs]) =>
    p('power-supply', no, `PSU with flex, ${market}, language pack ${lang} (${langs})`, page, { market, languagePackage: lang }),
  );
};

const flexCommon = (page: number, setQty?: number): PartNumber[] => [
  p('drive-set', 'Z10C500A.01', 'SERVO-DRIVE flex set incl. drive unit', page, undefined, setQty),
  p('switch', '23P5020', 'SERVO-DRIVE switch (SW | HGR | TGR)', page, { colour: 'SW|HGR|TGR' }),
];

const flexMulti = (page: number): PartNumber[] => [
  ...flexCommon(page, 2),
  ...flexPsu(page),
  p('node-set', 'Z10V100E.01', 'Connecting node set (node + 2 cable end protectors)', page, undefined, 3),
  p('housing', 'Z10NG000', 'PSU housing, floor mounting, dark grey', page, { mounting: 'ground' }),
  p('housing', 'Z10NG120', 'PSU housing, wall fixing, white grey (alternative to floor housing)', page, { mounting: 'wall' }),
  p('cable', 'Z10K300A', 'SERVO-DRIVE distribution cable 3000 mm, cut to size', page),
  p('accessory', 'Z10K0009', 'Cable holder for distribution cable, white', page),
];

const plateDims = (page: number): Record<string, DimSpec> => ({
  driveUnitMinRecessHeightNH: d(60, 'Minimum recess height NH required for the drive unit', page),
  mountingPlateMinLength: d(320, 'Minimum mounting plate edge length (min 320 on the mounting-plate drawing)', page),
  driveUnitFrontHoleDiameter: d(25, 'Diameter of the large hole (Ø25) in the front/drive-unit drawing', page),
  mountingPlateHoleDiameter: d(2.5, 'Pilot hole diameter (Ø2.5) for mounting plate screws', page),
});

const serviceDims = (page: number): Record<string, DimSpec> => ({
  distanceBumperTriggerPath: d(2, 'Trigger path created and maintained by the Blum distance bumper; the bumper is required on the refrigerator / freezer door', page),
  distanceBumperHoleDiameter: d('5 (8)', 'Hole diameter for distance bumper in the door, Ø5 (Ø8 alternative as printed)', page, undefined),
  switchHoleDiameter: d(35, 'Boring diameter Ø35 for the SERVO-DRIVE switch in the worktop area', page),
  switchHoleOffset: d('12 ±0.3', 'Switch drawing dimension 12 ±0.3 (position of Ø35 hole in the worktop area; reference edge not named in text)', page, undefined),
  switchSlot: d('11 +0.5/0', 'Switch drawing dimension 11 +0.5/0 (slot/recess width as drawn)', page, undefined),
});

const servoFlexFridge: FittingVariant = {
  id: 'servo-flex-fridge-nh-lt-1700',
  name: 'SERVO-DRIVE flex for refrigerators and freezers, recess height NH < 1700 mm',
  summary: 'Electric opening support for one built-in fridge or freezer with recess height under 1700 mm (web code DQBPDC).',
  choices: { recessHeightNH: ['<1700'], switchColour: ['SW', 'HGR', 'TGR'] },
  parts: [...flexCommon(576), ...pluginPsu(576)],
  dims: {
    ...plateDims(577),
    ...serviceDims(577),
    accessGapA: d(58.5, 'Access-gap drawing dimension 58.5 (see page 577 drawing)', 577),
    accessGapB: d(33, 'Access-gap drawing dimension 33 (see page 577 drawing)', 577),
    accessGapC: d(19, 'Access-gap drawing dimension 19 (see page 577 drawing)', 577),
    switchPlacementY: d('≥ 600', 'Switch must be placed where Y ≥ 600 (Y < 600 not permitted); Y is shown on the drawing as the front dimension, exact datum not defined in text', 577),
    switchCableLength: d(1120, 'Plug-in power supply cable length; extendible to max 2000 mm with SERVO-DRIVE distribution cable', 576),
    recessHeight: d('< 1700', 'Recess height NH of the fridge/freezer for this variant', 576),
  },
  drilling: [],
  notes: [
    'Plug-in power supply unit is only suitable for one drive unit; all plug-in power supply part numbers are marked on request.',
    'Not suitable for: refrigerators and freezers without own cabinet; freezers with base unit (recess height NH >= 1700 mm); refrigerated pull-outs.',
    'unverified: mounting plate hole positions (37 +1, 30, 32) and front/drive-unit dimensions (65, 16, 38, 14, 32, 16) on page 577 do not state their reference edge in the text; not transcribed as drilling.',
    'unverified: Blum distance bumper hole positions (8 mm edge distances, min 10) on page 577 not transcribed as drilling because the datum is not stated.',
  ],
  pages: [575, 576, 577],
};

const psuSpace: Record<string, DimSpec> = {
  psuSafetyDistance: d(30, 'Required safety distance from bottom edge (base fixing) and / or front edge (wall fixing) and side edges of the power supply unit housing to neighbouring elements; air must be able to circulate', 579),
};

const servoFlexFridgeTall: FittingVariant = {
  id: 'servo-flex-fridge-nh-ge-1700',
  name: 'SERVO-DRIVE flex for refrigerators and freezers, recess height NH >= 1700 mm',
  summary: 'Two drive units for tall built-in fridge or freezer (web code DQBQ2P).',
  choices: { recessHeightNH: ['>=1700'], switchColour: ['SW', 'HGR', 'TGR'] },
  parts: [...flexMulti(578)],
  dims: { ...plateDims(579), ...serviceDims(579), ...psuSpace, recessHeight: d('>= 1700', 'Recess height NH for this variant', 578),
    accessGapA: d(58.5, 'Access-gap drawing dimension 58.5 (page 579 drawing)', 579), accessGapB: d(33, 'Access-gap drawing dimension 33 (page 579 drawing)', 579), accessGapC: d(19, 'Access-gap drawing dimension 19 (page 579 drawing)', 579),
    flexLength: d('1.5–1.8 m', 'Length of the flex (incl. plug) of the PSU and flex unit; output flex length 2 m', 578, undefined) },
  drilling: [],
  notes: [
    'The flex set Z10C500A.01 is ordered 2 x (two drive units); connecting node set Z10V100E.01 is ordered 3 x as printed.',
    'PSU and flex is required for two or more drive units. Housing for PSU: 15a floor mounting or alternative 15b wall fixing.',
    'Not suitable for: refrigerators and freezers without own cabinet; freezers with base unit; refrigerated pull-outs.',
    'unverified: PSU housing outline dimensions on page 579 (e.g. 90, 150, 260, 360, R25, 75) are unlabelled in the text extraction; only the 30 mm safety distance is transcribed.',
    'unverified: mounting plate and front hole datums as on page 577.',
  ],
  pages: [575, 578, 579],
};

const servoFlexCombo: FittingVariant = {
  id: 'servo-flex-fridge-freezer-combination',
  name: 'SERVO-DRIVE flex for fridge/freezer combination, recess height NH >= 1700 mm',
  summary: 'Two drive units for built-in fridge/freezer combinations (web code DQBNYP).',
  choices: { recessHeightNH: ['>=1700'], switchColour: ['SW', 'HGR', 'TGR'] },
  parts: [...flexMulti(580)],
  dims: { ...plateDims(581), ...serviceDims(581), ...psuSpace, recessHeight: d('>= 1700', 'Recess height NH for this variant', 580),
    accessGapA: d(58.5, 'Access-gap drawing dimension 58.5 (page 581 drawing)', 581), accessGapB: d(33, 'Access-gap drawing dimension 33 (page 581 drawing)', 581), accessGapC: d(19, 'Access-gap drawing dimension 19 (page 581 drawing)', 581) },
  drilling: [],
  notes: [
    'Same part numbers as the NH >= 1700 fridge/freezer variant: flex set 2 x, connecting node set 3 x.',
    'Not suitable for: refrigerators and freezers without own cabinet; freezers with base unit; refrigerated pull-outs.',
    'unverified: drawing datums for mounting plate / front / bumper holes (page 581) as for page 577.',
  ],
  pages: [575, 580, 581],
};

const servoFlexDishwasher: FittingVariant = {
  id: 'servo-flex-dishwasher',
  name: 'SERVO-DRIVE flex for dishwashers',
  summary: 'Electric opening support for standard built-in dishwashers (web code DQE8UM).',
  choices: { frontThicknessBD: ['16-19'] },
  parts: [
    p('drive-set', 'Z10C500A.01', 'SERVO-DRIVE flex set incl. drive unit', 582),
    p('mounting-plate', 'Z10C5005', 'Mounting plate, RAL 7035 light grey (also required, alternative colour)', 582, { colour: 'R7035' }),
    ...pluginPsu(582),
  ],
  dims: {
    frontThicknessBD: d('16–19', 'Front thickness BD; maximum 19 mm', 583),
    driveUnitMinRecessHeightNH: d(60, 'Minimum recess height NH for drive unit', 583),
    mountingPlateMinLength: d(320, 'Minimum mounting plate length (min 320 on drawing)', 583),
    mountingPlateHoleDiameter: d(2.5, 'Pilot hole diameter Ø2.5 for mounting plate', 583),
    driveUnitFrontHoleDiameter: d(25, 'Ø25 hole in the front/drive-unit drawing', 583),
    frontDriveLengthA: d('SWD + 16', 'Front/drive-unit drawing length dimension SWD + 16; SWD = cabinet side panel thickness', 583, undefined),
    driveUnitSideOffset: d('1/2 – 65', 'Drive-unit drawing: half width minus 65 from the centre line as drawn', 583, undefined),
    worktopProtrusionAPU: d('0 | 20 | 30', 'Worktop protrusion APÜ values in the access-gap table', 583),
    accessGapZS: d('30 | 10 | 0', 'Access gap ZS for APÜ = 0 | 20 | 30 respectively (ZS decreases with thicker fronts; shown as 16* in drawing)', 583),
    accessGapAtApu0: d(30, 'Access gap ZS when worktop protrusion APÜ = 0', 583),
    accessGapAtApu20: d(10, 'Access gap ZS when worktop protrusion APÜ = 20', 583),
    accessGapAtApu30: d(0, 'Access gap ZS when worktop protrusion APÜ = 30', 583),
  },
  drilling: [],
  notes: [
    'Application depends on device type and worktop and plinth height; see Planning.',
    'Mounting plate 17a Z10C5005 (RAL 7035) is listed as "Also requires"; plug-in PSU is only suitable for one drive unit and is on request.',
    'The access gap ZS decreases with thicker fronts.',
    'unverified: mounting plate position dimensions (37 +1, 30, 32, BD+1) on page 583 have no stated datum; not transcribed as drilling.',
  ],
  pages: [575, 582, 583],
};

// SERVO-DRIVE uno single applications are on pages 22-46 (AVENTOS), 388-390 and 498 and are covered by other ranges; only the overview (575) is cited here.
const servoSingles: FittingFamily = {
  id: 'servo-drive-single',
  kind: 'motion',
  brand: 'Blum',
  name: 'SERVO-DRIVE single applications (flex)',
  summary: 'SERVO-DRIVE flex electric opening support for built-in refrigerators, freezers and dishwashers. SERVO-DRIVE uno single applications are listed in the overview but detailed on other pages.',
  variants: [servoFlexFridge, servoFlexFridgeTall, servoFlexCombo, servoFlexDishwasher],
  document: 'Catalogue and technical manual 2024/2025',
  pages: [574, 575, 576, 577, 578, 579, 580, 581, 582, 583],
};

// ---------------------------------------------------------------------------------------------
// SPACE STEP (586-592)
// ---------------------------------------------------------------------------------------------

const boxRow = (
  box: string,
  height: string,
  kh: number,
  upper: number,
  lower: number,
  page: number,
  spacer?: number,
): Record<string, DimSpec> => ({
  [`kh_${box}_${height}`]: d(kh, `Cabinet height KH required for ${box} height ${height} (21 mm pull-out shelf base, no anti-slip mat)${spacer ? `; ${spacer} with Blum spacer strip` : ''}`, page),
  [`upperMin_${box}_${height}`]: d(upper, `Minimum upper dimension in the space-requirement drawing for ${box} height ${height} (upper + lower = KH)`, page),
  [`lowerMin_${box}_${height}`]: d(lower, `Minimum lower dimension in the space-requirement drawing for ${box} height ${height} (upper + lower = KH)`, page),
});

const spaceStep: FittingVariant = {
  id: 'space-step',
  name: 'SPACE STEP',
  summary: 'Step for reaching the next storage level in wall cabinets, with pull-out underneath (web code DQHKHA).',
  choices: { nominalLength: [410, 460], boxSystem: ['LEGRABOX', 'MERIVOBOX', 'TANDEMBOX', 'MOVENTO', 'TANDEM'], boxHeight: ['N', 'M', 'K'] },
  parts: [
    p('set', 'Z95.4100', 'SPACE STEP set, NL 410, orion grey matt', 586, { nominalLength: 410 }),
    p('set', 'Z95.4600', 'SPACE STEP set, NL 460, orion grey matt', 586, { nominalLength: 460 }),
    p('profile', 'Z95Q1040A', 'Horizontal profile 1040 mm aluminium, cut to size', 586),
    p('spacer-strip', 'Z95D4100', 'Blum spacer strip for mounting pull-out runners', 586, undefined, 2),
    p('runner', '561H4101B95', 'SPACE STEP runner TANDEM 561H4101B95 (NL 410)', 592, { nominalLength: 410 }),
    p('runner', '561H4601B95', 'SPACE STEP runner TANDEM 561H4601B95 (NL 460)', 592, { nominalLength: 460 }),
    p('screw', '661.1450.HG', 'System screw Ø6 x 14.5 mm', 592),
    p('screw', '661.1150.HG', 'System screw Ø6 x 11.5 mm', 592),
  ],
  dims: {
    possibleCabinetHeight: d('150–250', 'Possible cabinet heights KH for the SPACE STEP', 586),
    maxCabinetHeight: d(250, 'Maximum cabinet height KH shown in the plinth drawings', 590),
    minCabinetWidthKB: d(400, 'Minimum cabinet width KB', 587),
    minCabinetWidthKBServoDrive: d(450, 'Minimum cabinet width KB with SERVO-DRIVE (MOVENTO | TANDEM)', 590),
    nominalLengthSelection: d('NL <= 450 -> 410; NL > 450 -> 460', 'SPACE STEP set length for the box/runner nominal length NL', 591, undefined),
    stepBaseMinThickness: d(21, 'Pull-out shelf (step) base thickness TD, minimum; 3-ply panel at least 21 mm recommended for plinth step', 586),
    pulloutDynamicCapacity: d(20, 'Dynamic carrying capacity of the pull-out underneath the SPACE STEP; only 30 or 40 kg runners may be used', 586, 'kg'),
    maxLoadBearingCapacity: d(150, 'Max. load bearing capacity of the SPACE STEP (EN 14183)', 586, 'kg'),
    horizontalProfileCut: d('LW – 130', 'Cut length of horizontal profile; LW = internal cabinet width', 591),
    verticalSupportCut: d('KH – TD – 46', 'Cut length of vertical support; KH cabinet height, TD pull-out shelf base thickness', 591),
    horizontalProfileWidth2pcs: d('KB 1200: use 2 pcs', 'For cabinet width KB 1200 use 2 horizontal profiles to prevent excessive bending', 586, undefined),
    distanceBumpersOverKB900: d(4, 'Number of Blum distance bumpers when cabinet width KB > 900 mm', 586, undefined),
    shelfLengthFlushPlinth: d('NL + 15', 'Pull-out shelf length TL, recess / flush plinth front', 590),
    shelfLengthPlinthRecess: d('NL + SR + 15', 'Pull-out shelf length TL with low plinth recess; SR plinth recess (max 100 mm)', 590),
    shelfWidth: d('LW – 10', 'Pull-out shelf width; LW internal cabinet width', 590),
    plinthRecessMax: d(100, 'Maximum plinth recess SR', 590),
    sideRailLength: d('TL – 160 – SR', 'Side panel installation (left/right) rail length, in-house production; cross section 16 x 16', 591),
    sideRailSection: d('16 x 16', 'Side-panel rail cross section, in-house production', 591, undefined),
    runnerFixingDistance: d('TD + 3', 'Runner fixing drawing: dimension TD + 3 (TD pull-out shelf base thickness)', 592),
    spacerStripWood: d(['LEGRABOX 50', 'MERIVOBOX 65', 'TANDEMBOX 50', 'MOVENTO | TANDEM 50'], 'Dimension X (mm) for wood spacer strip by box/runner system', 591, undefined),
    spacerStripBlum: d(['LEGRABOX 53', 'MERIVOBOX 51', 'TANDEMBOX 51', 'MOVENTO | TANDEM 53'], 'Dimension X (mm) for Blum spacer strip by box/runner system', 591, undefined),
    blumSpacerStripScrews: d('Ø3.5 x 60 or Ø4 x 60 chipboard screws', 'Screws for fixing the spacer strip', 591, undefined),
    ...boxRow('LEGRABOX', 'N', 142, 89, 53, 587, 148),
    ...boxRow('LEGRABOX', 'M', 166, 113, 53, 587),
    ...boxRow('LEGRABOX', 'K', 204, 151, 53, 587),
    ...boxRow('MERIVOBOX', 'N', 145, 76, 69, 588, 146),
    ...boxRow('MERIVOBOX', 'M', 167, 98, 69, 588),
    ...boxRow('MERIVOBOX', 'K', 205, 136, 69, 588),
    ...boxRow('TANDEMBOX', 'N', 146, 95, 51, 589),
    ...boxRow('TANDEMBOX', 'M', 161, 110, 51, 589),
    ...boxRow('TANDEMBOX', 'K', 193, 142, 51, 589),
    ...boxRow('MOVENTO', 'all', 136, 83, 53, 590, 148),
    ...boxRow('TANDEM', 'all', 136, 84, 52, 590, 148),
    expandoHoleDiameter: d('10 +0.2/-0.1', 'Ø10 drilling in the front for EXPANDO, tolerance +0.2/-0.1', 587, undefined),
    expandoHoleSpacingLEGRABOX_N: d(16, 'Vertical hole spacing in the front, LEGRABOX N (two holes)', 587),
    expandoHoleSpacingLEGRABOX_MK: d(32, 'Vertical hole spacing in the front, LEGRABOX M and K', 587),
    expandoLowerHoleMinLEGRABOX: d('N: 50.5; M, K: 56', 'Minimum distance in the front drilling drawing (min 50.5 / min 56) as dimensioned from the lower front edge', 587, undefined),
    expandoHoleSpacingMERIVOBOX: d(32, 'Vertical hole spacing in the front, MERIVOBOX N, M and K', 588),
    expandoLowerHoleMinMERIVOBOX: d(38.5, 'Minimum distance (min 38.5) in the front drilling drawing, MERIVOBOX', 588),
    expandoHoleSpacingTANDEMBOX: d(32, 'Vertical hole spacing in the front, TANDEMBOX (K: two spacings of 32, three holes)', 589),
    expandoLowerHoleMinTANDEMBOX: d('N: 40.5; M, K: 55.5', 'Minimum distance in the front drilling drawing, TANDEMBOX N / M, K', 589, undefined),
    expandoHoleDepth: d(12, 'Dimension 12 shown beside the front drilling side view (hole depth / thickness as drawn)', 587),
  },
  drilling: [],
  notes: [
    'Cabinet above SPACE STEP: protect the cabinet base against sagging if items are stored on it; recommend an L5 unit with TIP-ON BLUMOTION.',
    'EN 14183: both enclosed stickers must be clearly displayed; manufacturer must state the actual load bearing capacity on the manufacturer information sticker.',
    'Step surface must be anti-slip (mat or anti-slip panel); subsurface and step surface must be clean and dry.',
    'Set contains: TANDEM 561Hxxx1B95 runner left/right, 2 vertical supports, 2 corner connectors, 2 support feet, 2 rear panel brackets, front connector, 4 distance bumpers, 2 stickers, 14 pan head screws Ø4 x 15.',
    'unverified: EXPANDO front drilling in 587-589 gives vertical hole spacings and minimum edge distances but the datum edge and horizontal position are not stated in text; shown as dims, not as drilling rules. TANDEMBOX K has three holes (2 x 32).',
    'unverified: runner fixing positions on page 592 (A/B/C/D screws with 32, 64, 75, 96, 192) have scrambled datums; not transcribed.',
    'unverified: wood and Blum spacer strip drawing values (40, 41, 37, 12, 69, 256, Ø5) on page 591 lack stated datums; only X per system is transcribed.',
    'Space-requirement upper/lower minimums are split so that upper + lower = KH as read from the drawings.',
  ],
  pages: [585, 586, 587, 588, 589, 590, 591, 592],
};

// ---------------------------------------------------------------------------------------------
// CABLOXX (594-595)
// ---------------------------------------------------------------------------------------------

const cabloxx: FittingVariant = {
  id: 'cabloxx',
  name: 'CABLOXX locking system',
  summary: 'Locking bar with locking units; up to five pull-outs per locking bar; combinable with all Blum box and runner systems and motion technologies.',
  choices: { cabinetHeightKH: ['<=600', '<=800', '<=1300'], version: ['right', 'left'] },
  parts: [
    p('locking-bar-set', 'Z80S0560', 'Locking bar set, steel, cabinet height up to 600', 594, { cabinetHeightKH: '<=600' }),
    p('locking-bar-set', 'Z80S0760', 'Locking bar set, steel, cabinet height up to 800', 594, { cabinetHeightKH: '<=800' }),
    p('locking-bar-set', 'Z80S1260', 'Locking bar set, steel, cabinet height up to 1300', 594, { cabinetHeightKH: '<=1300' }),
    p('locking-unit', 'Z80.000V', 'Locking unit, right (as printed; cylinder not included)', 594, { version: 'right', colour: 'SZ' }),
    p('locking-unit', 'Z80.000V', 'Locking unit, left (as printed; cylinder not included)', 594, { version: 'left', colour: 'SZ' }),
    p('locking-bar-set', 'Z80S0542CA', 'Locking bar set right, ready-made, 3 drawers M | M | M, 542 mm', 594, { configuration: 'M|M|M' }),
    p('locking-bar-set', 'Z80S0542BA', 'Locking bar set right, ready-made, C | M, 542 mm', 594, { configuration: 'C|M' }),
    p('front-bracket', 'Z80.000S', 'Front locking bracket set (SW-M | WGR | OG-M | TS-M)', 594),
    p('synchronisation', 'Z80V000A', 'Synchronisation set', 594),
    p('synchronisation', 'Z80V1163W', 'Synchronisation linkage 1163 mm aluminium, cut to size', 594),
  ],
  dims: {
    lockingBarCut: d('LH – 2', 'Cut length of locking bar 1a; LH = internal cabinet height', 594),
    synchronisationLinkageCut: d('LW – 7', 'Cut length of synchronisation linkage; LW = internal cabinet width', 594),
    readyMadeBarLength: d(542, 'Length of the ready-made locking bar sets; for LEGRABOX and TANDEMBOX in tier system 32, internal cabinet height LH of 544 mm', 594),
    synchronisationRecommendedFromKB: d('> 600', 'Synchronisation recommended for cabinet widths KB > 600 mm in combination with closing function (two locking bar sets then necessary)', 594),
    maxPulloutsPerBar: d(5, 'Maximum pull-outs per locking bar', 594, undefined),
    lockingBarSpaceA: d(105, 'Space requirement drawing: overall dimension 105 (locking bar and synchronisation)', 595),
    lockingBarSpaceB: d(76, 'Space requirement drawing dimension 76', 595),
    lockingBarSpaceC: d(53, 'Space requirement drawing dimension 53', 595),
    minSpaceHeight1: d(71, 'Space requirement drawing: min 71', 595),
    minSpaceHeight2: d(46, 'Space requirement drawing: min 46', 595),
    minSpace3: d(37, 'Space requirement drawing: min 37', 595),
    grooveDepth: d(45, 'Groove dimension drawing: 45', 595),
    grooveWidth: d('4 +0.5/0', 'Groove width in the panel for the locking bar', 595, undefined),
    grooveEdgeDistance: d(16, 'Groove dimension drawing: 16', 595),
    lockingBarDrillingA: d(32, 'Locking bar drilling drawing: 32', 595),
    lockingBarDrillingB: d(37, 'Locking bar drilling drawing: 37', 595),
    lockingBarHoleDiameter: d(2.5, 'Pilot hole Ø2.5 for locking bar fixing', 595),
    cylinderBodyDiameter: d('16.5–22', 'Cylinder diameter range (cylinder not included)', 595, undefined),
    cylinderLength: d('28–48', 'Cylinder length range', 595, undefined),
    cylinderStemDiameter: d('4–6', 'Cylinder stem diameter range', 595, undefined),
    cylinderCamLength: d('11–13', 'Cylinder dimension 11-13 as drawn', 595, undefined),
    cylinderProtrusionMax: d(15, 'Cylinder maximum dimension 15', 595),
    cylinderHoleFromFrontEdge: d(19, 'Cylinder drilling drawing: 19 (from front edge as drawn) and 19 from the side; FAo upper front overlay, SFA front overlay of side panel', 595),
    syncAttachmentA: d(20, 'Attachment for synchronisation drilling: 20', 595),
    syncAttachmentB: d(81, 'Attachment for synchronisation drilling: 81', 595),
    syncAttachmentC: d(32, 'Attachment for synchronisation drilling: 32', 595),
    frontPieceHoleDiameter: d(2.5, 'Front piece for front locking bracket is to be pre-drilled Ø2.5 mm', 595),
    frontPieceDrill14: d(14, 'Front piece drilling drawing dimension 14 from the front edge as drawn', 595),
    frontPieceDrill9: d(9, 'Front piece drilling drawing dimension 9', 595),
    frontPieceDrillX_runner: d('SKH + 10', 'Dimension X for MOVENTO | TANDEM front piece drilling; SKH = drawer height', 595),
    frontPieceGap: d(2, 'Gap F shown in the front height drawing', 595),
    frontPieceMin7: d(7, 'Front height drawing: min 7', 595),
    frontPieceX_LEGRABOX_N: d(40, 'Dimension X, LEGRABOX N', 595), frontPieceX_LEGRABOX_M: d(59, 'Dimension X, LEGRABOX M', 595), frontPieceX_LEGRABOX_K: d(97, 'Dimension X, LEGRABOX K', 595),
    frontPieceX_LEGRABOX_C: d(148, 'Dimension X, LEGRABOX C (+4 with AMBIA-LINE cross gallery)', 595), frontPieceX_LEGRABOX_F: d(212, 'Dimension X, LEGRABOX F (+4 with AMBIA-LINE cross gallery)', 595),
    frontPieceX_MERIVOBOX_N: d(57, 'Dimension X, MERIVOBOX N', 595), frontPieceX_MERIVOBOX_M: d(80, 'Dimension X, MERIVOBOX M', 595), frontPieceX_MERIVOBOX_K: d(116, 'Dimension X, MERIVOBOX K', 595), frontPieceX_MERIVOBOX_E: d(181, 'Dimension X, MERIVOBOX E (+4 with AMBIA-LINE cross gallery)', 595),
    frontPieceX_TANDEMBOX_N: d(57, 'Dimension X, TANDEMBOX antaro N', 595), frontPieceX_TANDEMBOX_M: d(57, 'Dimension X, TANDEMBOX antaro M', 595), frontPieceX_TANDEMBOX_K: d(87, 'Dimension X, TANDEMBOX antaro K', 595),
    frontPieceX_TANDEMBOX_B: d(114, 'Dimension X, TANDEMBOX antaro B', 595), frontPieceX_TANDEMBOX_C: d(146, 'Dimension X, TANDEMBOX antaro C', 595), frontPieceX_TANDEMBOX_D: d(178, 'Dimension X, TANDEMBOX antaro D', 595),
    minFH_LEGRABOX_N: d(107, 'Minimum front height FH, LEGRABOX N (BLUMOTION runners)', 595), minFH_LEGRABOX_M: d(132, 'Minimum FH, LEGRABOX M', 595), minFH_LEGRABOX_K: d(170, 'Minimum FH, LEGRABOX K', 595),
    minFH_LEGRABOX_C: d(221, 'Minimum FH, LEGRABOX C (+4 with AMBIA-LINE cross gallery)', 595), minFH_LEGRABOX_F: d(285, 'Minimum FH, LEGRABOX F (+4 with AMBIA-LINE cross gallery)', 595),
    minFH_MERIVOBOX_N: d(113, 'Minimum FH, MERIVOBOX N', 595), minFH_MERIVOBOX_M: d(136, 'Minimum FH, MERIVOBOX M', 595), minFH_MERIVOBOX_K: d(173, 'Minimum FH, MERIVOBOX K', 595), minFH_MERIVOBOX_E: d(236, 'Minimum FH, MERIVOBOX E (+4 with AMBIA-LINE cross gallery)', 595),
    minFH_TANDEMBOX_N: d(111, 'Minimum FH, TANDEMBOX antaro N', 595), minFH_TANDEMBOX_M: d(126, 'Minimum FH, TANDEMBOX antaro M', 595), minFH_TANDEMBOX_K: d(156, 'Minimum FH, TANDEMBOX antaro K', 595),
    minFH_TANDEMBOX_B: d(183, 'Minimum FH, TANDEMBOX antaro B', 595), minFH_TANDEMBOX_C: d(215, 'Minimum FH, TANDEMBOX antaro C', 595), minFH_TANDEMBOX_D: d(247, 'Minimum FH, TANDEMBOX antaro D', 595),
    ameliaCrossGalleryMinFromFront: d(80, 'AMBIA-LINE: minimum distance of cross gallery from the front so the cross gallery connector does not collide with the front locking bracket', 595),
  },
  drilling: [],
  notes: [
    'Cylinder is not part of the scope of delivery. Locking unit right and left are both printed as Z80.000V in the extracted text; unverified: whether a suffix distinguishes right and left.',
    'Synchronisation set is recommended for KB > 600 mm in combination with closing function; when synchronisation is used, two locking bar sets are necessary.',
    'Ready-made locking bar sets: M|M|M for three M drawers; C|M for one drawer M and one high fronted pull-out C; for LEGRABOX and TANDEMBOX in tier system 32 with LH 544 mm.',
    'Colours: locking unit SZ black; front locking bracket SW-M | WGR | OG-M | TS-M (nylon/zinc).',
    'unverified: space-requirement, groove, locking-bar and cylinder drilling distances on page 595 (105, 76, 53, 71, 46, 37, 45, 16, 32, 37, 20, 81, 19) are given as drawn values; datums not stated, so no drilling rules are produced.',
  ],
  pages: [594, 595],
};

// ---------------------------------------------------------------------------------------------
// EXPANDO T (596-597)
// ---------------------------------------------------------------------------------------------

const expando: FittingVariant = {
  id: 'expando-t',
  name: 'EXPANDO T fixing system for thin fronts',
  summary: 'Pre-assembled fixing for fronts from 8 mm thickness on lift systems, hinge systems and box systems.',
  choices: { application: ['lift', 'hinge', 'LEGRABOX', 'MERIVOBOX'] },
  parts: [
    p('front-fixing-bracket', '20S42T1', 'Front fixing bracket, thin fronts, AVENTOS HS/HL/HK top', 596, { application: 'lift' }),
    p('hinge', '71B453T', 'CLIP top BLUMOTION hinge for thin doors, with spring (NI | ONS)', 596, { application: 'hinge', spring: 'with', colour: 'NI|ONS' }),
    p('hinge', '71T453T', 'CLIP top hinge for thin doors, with spring (NI)', 596, { application: 'hinge', spring: 'with', colour: 'NI' }),
    p('hinge', '70T453T.TL', 'CLIP top hinge for thin doors, unsprung (NI)', 596, { application: 'hinge', spring: 'unsprung', colour: 'NI' }),
    p('front-fixing-bracket', 'ZF7N70T2', 'LEGRABOX front fixing bracket, height N', 596, { application: 'LEGRABOX', height: 'N' }),
    p('front-fixing-bracket', 'ZF7M70T2', 'LEGRABOX front fixing bracket, height M', 596, { application: 'LEGRABOX', height: 'M' }),
    p('front-fixing-bracket', 'ZF7K70T2', 'LEGRABOX front fixing bracket, height K', 596, { application: 'LEGRABOX', height: 'K' }),
    p('front-fixing-bracket', 'ZF7C70T2', 'LEGRABOX front fixing bracket, height C (height F: see LEGRABOX section)', 596, { application: 'LEGRABOX', height: 'C' }),
    p('front-fixing-bracket', 'ZF4.10T2', 'MERIVOBOX front fixing bracket, N | M | K | E', 596, { application: 'MERIVOBOX', height: 'N|M|K|E' }),
    p('front-fixing-bracket-top', 'ZF4.50T2', 'MERIVOBOX front fixing bracket, top, height E', 596, { application: 'MERIVOBOX', height: 'E' }),
    p('stabiliser', 'Z96.00T1', 'Front/base stabiliser for thin fronts, RAL 7037', 596, { application: 'LEGRABOX|MERIVOBOX' }),
    p('single-dowel', '70T4532T', 'EXPANDO T single, dark grey', 596),
  ],
  dims: {
    minFrontThickness: d(8, 'Minimum front thickness for EXPANDO T (front materials of 8 mm and above, with sufficient stability and strength)', 597),
    holeDiameter: d('10 +0.1/-0.1', 'Drilling diameter Ø10 +0.1/-0.1 (stone and ceramic: +0.2/-0.1)', 597, undefined),
    screwPenetrationMin: d(4, 'Minimum screw penetration depth ES', 597),
    screwPenetrationMax: d('BT – 0.5', 'Maximum screw penetration depth ES; BT = drilling depth', 597),
    singleDowelScrewThread: d('M4', 'Screws with M4 thread have to be used for EXPANDO T single', 597, undefined),
    torqueChipboard: d(1.5, 'Minimum tightening torque for chipboard (transverse tensile strength > 0.40 N/mm2)', 597, undefined),
    torqueMDF: d(1.5, 'Minimum tightening torque for MDF (transverse tensile strength > 0.60 N/mm2)', 597, undefined),
    torqueHDFHPLMineral: d(2, 'Minimum tightening torque for HDF, HPL and mineral composites', 597, undefined),
    torqueStoneCeramic: d(3, 'Minimum tightening torque for natural granite, quartz composite artificial stone and ceramic plates', 597, undefined),
    stabiliserRecommendation: d(['KB > 600 mm: 1 pc', 'KB > 900 mm: 2 pc', 'FH > 380 mm: 1 pc'], 'Recommended number of front/base stabilisers (KB cabinet width, FH front height)', 596, undefined),
  },
  drilling: [],
  notes: [
    'Fixing positions follow the instructions in the sections on lift systems, hinge systems (overlay applications achieved by the fixing positions), LEGRABOX and MERIVOBOX box systems; EXPANDO T single also requires M4 screws.',
    'Materials tested by Blum: chipboard, MDF, HDF, HPL, mineral composites, Nero Assoluto natural granite, quartz composite artificial stone, ceramic plates; Blum accepts no liability for untested materials or fittings from other manufacturers.',
    'Torque in Nm (minimum): chipboard 1.5, MDF 1.5, HDF 2, HPL 2, mineral composites 2, granite 3, quartz composite 3, ceramic 3.',
    'Hinge colours: NI nickel plated, ONS onyx black. Stabiliser colour R7037 RAL 7037 dust grey, EXPANDO T single TGR dark grey.',
  ],
  pages: [596, 597],
};

// ---------------------------------------------------------------------------------------------
// Wall hanging brackets (598) and cabinet connectors (599-601)
// ---------------------------------------------------------------------------------------------

const wallBrackets: FittingVariant = {
  id: 'wall-hanging-bracket',
  name: 'Wall hanging brackets',
  summary: 'Screw-on and knock-in wall hanging brackets with 3-dimensional adjustment; 130 kg per pair (DIN EN 15939, test frame A).',
  choices: { type: ['screw-on', 'knock-in'], side: ['right', 'left'], colour: ['WS', 'BR', 'R9001'] },
  parts: [
    p('bracket', '48N0510.02', 'Screw-on wall hanging bracket, right (WS | BR | R9001)', 598, { type: 'screw-on', side: 'right' }),
    p('bracket', '48N0510.03', 'Screw-on wall hanging bracket, left (WS | BR | R9001)', 598, { type: 'screw-on', side: 'left' }),
    p('bracket', '48N0610.02', 'Knock-in wall hanging bracket, right (WS)', 598, { type: 'knock-in', side: 'right' }),
    p('bracket', '48N0610.03', 'Knock-in wall hanging bracket, left (WS)', 598, { type: 'knock-in', side: 'left' }),
    p('insertion-ram', 'MZM.0078', 'Insertion ram for knock-in bracket 48N0610.02 / .03 (MINIPRESS)', 598, { type: 'knock-in' }),
  ],
  dims: {
    loadPerPair: d(130, 'Load bearing per pair of brackets in accordance with DIN EN 15939 (test frame A)', 598, 'kg'),
    cabinetSideCutoutA: d(18, 'Space-requirement drawing dimension 18 (width of back cut-out as drawn)', 598),
    bracketDepth: d(57, 'Space-requirement drawing dimension 57 (bracket depth on cabinet side as drawn)', 598),
    cutoutHeight: d(41, 'Space-requirement drawing dimension 41', 598),
    wallOffset: d(18, 'Space-requirement drawing dimension 18 (wall side)', 598),
    fixingPositionFromBack: d('31–45', 'Fixing position drawing: 31-45 from the back edge as drawn (range)', 598, undefined),
    fixingPositionB: d(32, 'Fixing position drawing dimension 32 (hole spacing as drawn)', 598),
    fixingPositionC: d(22, 'Fixing position drawing dimension 22', 598),
    fixingPositionD: d(33, 'Fixing position drawing dimension 33', 598),
    fixingPositionE: d(14, 'Fixing position drawing dimension 14', 598),
    knockInHoleDiameter: d(10, 'Knock-in bracket dowel hole diameter Ø10', 598),
    knockInHoleSpacing: d(24, 'Knock-in bracket fixing position drawing dimension 24 (vertical hole spacing as drawn)', 598),
    knockInMinEdge: d(11.5, 'Knock-in bracket fixing position drawing: min 11.5', 598),
  },
  drilling: [],
  notes: [
    'unverified: space-requirement and fixing-position drawings on page 598 give dimensions (18, 57, 41, 31-45, 32, 33, 14, 22, 24, min 11.5, Ø10) without clearly stated datums; transcribed as dims only, no drilling rules.',
    'Testing standards are referenced on page 712.',
    'Colours: WS white, BR brown, R9001 RAL 9001 cream (screw-on); WS white only (knock-in).',
  ],
  pages: [598],
};

const connectors: FittingVariant = {
  id: 'cabinet-connectors',
  name: 'Cabinet connectors',
  summary: 'Screw-on, knock-in and connector-screw/dowel cabinet connectors with nylon housing and integral die-cast cam.',
  choices: { type: ['screw-on', 'knock-in', 'connector screw', 'dowel and expansion pin', 'connecting piece system 32'] },
  parts: [
    p('connector', '40.2000', 'Screw-on cabinet connector, white', 599, { type: 'screw-on' }),
    p('housing', '40.2110', 'Knock-in connector housing, white', 599, { type: 'knock-in' }),
    p('base-connector', '40.2120.02', 'Knock-in base connector, natural', 599, { type: 'knock-in' }),
    p('connector', '42.0700.01', 'Cabinet connector with connector screw, white or brown', 600, { type: 'connector screw (base)' }),
    p('insertion-ram', 'MZM.0077', 'Insertion ram for base connector 42.0700.01 (MINIPRESS)', 600, { type: 'connector screw (base)' }),
    p('housing', '40.0110N', 'Connector housing, white or brown', 600, { type: 'connector screw' }),
    p('connector-screw', '40.0720', 'Zinc connector screw', 600, { type: 'connector screw' }),
    p('insertion-ram', 'MZM.0070', 'Insertion ram for housing 40.0110N / 40.0200N (MINIPRESS)', 600),
    p('connector', '40.0200N', 'Connector with dowel and expansion pin, white', 601, { type: 'dowel and expansion pin' }),
    p('base-connector', '40.0620', 'Base connector, system 32 connecting piece', 601, { type: 'connecting piece system 32' }),
    p('insertion-ram', 'MZM.0071', 'Insertion ram for base connector 40.0620 (MINIPRESS)', 601, { type: 'connecting piece system 32' }),
  ],
  dims: {
    screwOnBaseA: d(19.5, 'Screw-on connector, base drawing: 19.5', 599),
    screwOnBaseB: d(13, 'Screw-on connector, base drawing: 13', 599),
    screwOnBaseC: d(32, 'Screw-on connector, base drawing: 32', 599),
    screwOnBaseD: d(47, 'Screw-on connector, base drawing: 47', 599),
    screwOnSideWidth: d(32, 'Screw-on connector, cabinet side drawing: 32', 599),
    screwOnSideDepth: d(7.5, 'Screw-on connector, cabinet side drawing: 7.5', 599),
    knockInDowelHole: d(10, 'Knock-in connector, base dowel hole Ø10', 599),
    knockInDowelDepthMin: d(11.5, 'Knock-in connector, min 11.5 (dowel hole depth as drawn)', 599),
    knockInSideWidth: d(32, 'Knock-in connector, cabinet side drawing: 32', 599),
    knockInSideDepth: d(7.5, 'Knock-in connector, cabinet side drawing: 7.5', 599),
    screwEdgeFormula42_0700: d('E = W – X + 8', 'Connector screw 42.0700.01: E from W and X as in the drawing; X max 9.5 mm', 600, undefined),
    screwXmax42_0700: d(9.5, 'Maximum X for connector 42.0700.01', 600),
    screwBaseHole42_0700: d(5, 'Base hole diameter Ø5 for connector 42.0700.01', 600),
    screwBaseDistance42_0700: d(27, 'Base drawing dimension 27 for connector 42.0700.01', 600),
    screwEdgeFormula40_0110: d('E = W – X + 5.8', 'Connector housing 40.0110N with screw 40.0720: E from W and X; X max 8 mm', 600, undefined),
    screwXmax40_0110: d(8, 'Maximum X for 40.0110N / 40.0720', 600),
    screwBaseHole40_0110: d(5, 'Base hole diameter Ø5 for 40.0720', 600),
    screwBaseDistance40_0110: d(33, 'Base drawing dimension 33 for 40.0720', 600),
    housingHoleDiameter: d(25, 'Housing boring diameter Ø25 in the cabinet side for connector housings', 600),
    housingMinDistance: d(12, 'Cabinet side drawing: min 12 (distance as drawn)', 600),
    dowelEdgeFormula: d('E = W – X + 7.4', 'Connector with dowel and expansion pin 40.0200N: E from W and X; X max 9 mm', 601, undefined),
    dowelXmax: d(9, 'Maximum X for 40.0200N', 601),
    dowelBaseHole: d(8, 'Base hole diameter Ø8 for the dowel of 40.0200N', 601),
    dowelBaseDistance: d(25, 'Base drawing dimension 25 for 40.0200N', 601),
    system32EdgeFormula: d('E = W + 1.5', 'Connector with connecting piece system 32 (40.0110N + 40.0620): E from W', 601, undefined),
    system32HoleDistance: d(32, 'Connecting piece system 32 drawing dimension 32', 601),
    system32EdgeDistance: d(10, 'Connecting piece system 32 drawing dimension 10', 601),
    system32BaseHole: d(10, 'Base hole diameter Ø10', 601),
    system32MinDepth: d(10.5, 'Base drawing min 10.5', 601),
  },
  drilling: [],
  notes: [
    'In the E formulas W and X are dimensions drawn on the base/cabinet assembly sketches; E is the resulting setting dimension shown on the sketch (symbols not defined in text).',
    'unverified: the cabinet-side and base drawings on pages 599-601 do not state datums for the numeric values in text; only formulas, maxima and diameters are firm. No drilling rules produced.',
    'Colours: WS white, BR brown, NA natural, ZN zinc (connector screw). Insertion rams are MINIPRESS accessories.',
  ],
  pages: [599, 600, 601],
};

export const furtherProducts: FittingFamily[] = [
  servoSingles,
  {
    id: 'space-step',
    kind: 'other',
    brand: 'Blum',
    name: 'SPACE STEP',
    summary: 'Step system for wall cabinets, combinable with all Blum box and runner systems.',
    variants: [spaceStep],
    document: 'Catalogue and technical manual 2024/2025',
    pages: [585, 586, 587, 588, 589, 590, 591, 592],
  },
  {
    id: 'cabloxx',
    kind: 'other',
    brand: 'Blum',
    name: 'CABLOXX',
    summary: 'Locking system for pull-outs.',
    variants: [cabloxx],
    document: 'Catalogue and technical manual 2024/2025',
    pages: [594, 595],
  },
  {
    id: 'expando-t',
    kind: 'other',
    brand: 'Blum',
    name: 'EXPANDO T',
    summary: 'Fixing system for thin fronts.',
    variants: [expando],
    document: 'Catalogue and technical manual 2024/2025',
    pages: [596, 597],
  },
  {
    id: 'wall-hanging-bracket',
    kind: 'other',
    brand: 'Blum',
    name: 'Wall hanging bracket',
    summary: 'Screw-on and knock-in wall hanging brackets.',
    variants: [wallBrackets],
    document: 'Catalogue and technical manual 2024/2025',
    pages: [598],
  },
  {
    id: 'cabinet-connectors',
    kind: 'other',
    brand: 'Blum',
    name: 'Cabinet connectors',
    summary: 'Cabinet connectors for carcass assembly.',
    variants: [connectors],
    document: 'Catalogue and technical manual 2024/2025',
    pages: [599, 600, 601],
  },
];
