// TANDEM runner system (11-16 mm and 17-19 mm), transcribed from Blum "Catalogue and technical manual 2024/2025",
// printed pages 430-461.
import type { DimSpec, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const part = (
  role: string,
  partNo: string,
  description: string,
  page: number,
  extra: Partial<Pick<PartNumber, 'when' | 'qty'>> = {},
): PartNumber => ({ role, partNo, description, page, ...extra });

const dim = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({
  value,
  unit,
  meaning,
  page,
});

/** Runner pair part numbers: [NL, partNo] built from the catalogue pattern; every number is listed on the cited page. */
const runners = (prefix: string, lengths: number[], suffixDigit: '0' | '1', page: number, label: string): PartNumber[] =>
  lengths.map((nl) =>
    part('runner', `${prefix}${nl}${suffixDigit}B`, `${label} runner pair, NL ${nl}, 30 kg (order left/right)`, page, {
      when: { nominalLength: nl, capacityKg: 30 },
    }),
  );

const REQ = 'Item available on request (telephone symbol on the page).';

const unverifiedAssembly = (page: number): string =>
  `unverified: reference edges of the drawer-assembly drilling dimensions on p${page} are not readable from the text; template T65.1000.02 is required.`;

const LOCKING_DRAWER_ASSEMBLY = (page: number): Record<string, DimSpec> => ({
  lockingDeviceOffsetFromRear: dim(55, 'Dimension 55 on the locking-device drawer-assembly drawing (position of the locking device on the drawer side); reference edge unverified.', page),
  hole6Diameter: dim(6, 'Diameter of the hole shown on the drawer-assembly drawing (hole depth 10).', page),
  hole6Depth: dim(10, 'Depth dimension beside the 6 mm hole on the drawer-assembly drawing.', page),
  holeOtherDims: dim([11, 33, 7], 'Further dimensions 11, 33 and 7 on the hole drawing (reference edges unverified).', page),
});

const HOOK_DRAWER_ASSEMBLY = (page: number): Record<string, DimSpec> => ({
  hookPegDims: dim([13, 5, 9, 6], 'Drawer-assembly drawing for hook and peg variant: dimensions 13, 5, 9, 6 with dia 6 and dia 8 holes; reference edges unverified.', page),
  hookPegDiameters: dim([6, 8], 'Hole diameters (6 and 8 mm) shown on the hook-and-peg drawer-assembly drawing.', page),
  liftOffDims: dim([11, 10, 7], 'Dimensions 11, 10, 7 with dia 6 hole on the second drawer-assembly drawing; reference edges unverified.', page),
});

const sideStabFull = (page: number): PartNumber[] => [
  part('side-stabiliser', 'ZST.410TV', 'Side stabilisation set full extension, NL up to 410', page),
  part('side-stabiliser', 'ZST.600TV', 'Side stabilisation set full extension, NL up to 600', page),
  part('side-stabiliser', 'ZST.750TV', 'Side stabilisation set full extension, NL up to 750', page),
];
const sideStabSingle = (page: number): PartNumber[] => [
  part('side-stabiliser', 'ZST.410TT', 'Side stabilisation set single extension, NL up to 410', page),
  part('side-stabiliser', 'ZST.650TT', 'Side stabilisation set single extension, NL up to 650', page),
];

const L_560H = [250, 270, 300, 320, 350, 380, 400, 420, 450, 480, 500, 520, 550, 600];
const L_550H = [270, 300, 350, 400, 450, 500, 550, 600, 650];
const L_HOOK_H = [260, 285, 310, 335, 360, 385, 410, 435, 460, 485, 510, 535, 560];
const L_560F = [250, 270, 300, 350, 400, 450, 500, 550, 600];
const L_550F = [270, 300, 350, 400, 450, 500, 550, 600, 650];
const L_HOOK_F = [260, 310, 360, 410, 460, 510, 560];

const PEGS_H = [205, 220, 230, 245, 275, 285, 300, 310, 335, 350, 360, 375, 405];
const LIFT_561H = [185, 200, 242, 257, 287, 297, 344, 354, 379, 394, 436, 451, 481];
const LIFT_551H = [185, 200, 210, 225, 255, 265, 280, 290, 315, 330, 340, 355, 385];
const PEGS_F = [205, 230, 275, 300, 335, 360, 405];
const LIFT_561F = [185, 242, 287, 344, 379, 436, 481];
const LIFT_551F = [185, 210, 255, 280, 315, 340, 385];

const base = (v: Omit<FittingVariant, 'drilling'> & { drilling?: FittingVariant['drilling'] }): FittingVariant => ({
  drilling: [],
  ...v,
});

// ---- common dims builders -------------------------------------------------------------------------------------------
const fullExtLocking = (page: number, thick: '11-16' | '17-19'): Record<string, DimSpec> => {
  const w = thick === '11-16' ? 42 : 49;
  const sideMin = 27.5;
  return {
    drawerSidePanelThickness: dim(thick, `Drawer side panel thickness range the runner is made for (${thick} mm).`, page),
    drawerInternalWidth: dim(`LW - ${w}`, `SKW = internal drawer width = internal cabinet width LW minus ${w} (tolerance +0.0 / -1.5).`, page),
    drawerInternalWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW.', page),
    drawerLength: dim('NL - 10', 'SKL = drawer length from nominal length NL.', page),
    innerDrawerLength: dim('SKL + X', 'ISKL = inner drawer length; X = front thickness.', page),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement depth in cabinet for a drawer (additional +12 mm with side stabilisation).', page),
    innerDrawerSpaceRequirementDepth: dim('NL + X + 3', 'Space requirement depth for inner drawer; X = front thickness (additional +2 mm with POSISTOP, +12 mm with side stabilisation).', page),
    sideStabilisationExtraDepth: dim(12, 'Additional depth with side stabilisation.', page),
    posistopExtraDepth: dim(2, 'Additional +2 mm depth when POSISTOP is used.', page),
    topClearance: dim(7, 'Labelled "min 7" vertical clearance in front section (above drawer side panel).', page),
    verticalFixing: dim(37, 'Vertical dimension 37 in front section (runner fixing position height); reference edge unverified from text, see p460 attachment.', page),
    sideClearanceMin: dim(sideMin, 'Labelled "min 27.5" horizontal dimension in front section (+3 mm with side stabilisation).', page),
    sideClearanceMinSideStabExtra: dim(3, 'Additional +3 mm on the min 27.5 / 37 dimension with side stabilisation.', page),
    runnerToCabinetSide: dim(thick === '11-16' ? 21 : 24.5, 'Horizontal dimension shown at the lower left of the front section (cabinet side to runner/drawer reference).', page),
    drawerSideRange: dim('12-15', 'Range labelled 12-15 on the drawer front section (left); reference edge unverified.', page),
    innerDrawerFrontOffset: dim('X + 19', 'Dimension X + 19 on inner-drawer drawing; X = front thickness (+2 mm with POSISTOP).', page),
    dimBetween: dim([32, 10, 18], 'Further numbers on the drawer drawings (37, 32, 10, 18); reference edges unverified.', page),
  };
};

const singleExtLocking = (page: number, thick: '11-16' | '17-19'): Record<string, DimSpec> => {
  const w = thick === '11-16' ? 42 : 49;
  return {
    drawerSidePanelThickness: dim(thick, `Drawer side panel thickness range (${thick} mm).`, page),
    drawerInternalWidth: dim(`LW - ${w}`, `SKW = internal drawer width = LW minus ${w} (tolerance +0.0 / -1.5).`, page),
    drawerInternalWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW.', page),
    drawerLength: dim('NL - 10', 'SKL = drawer length.', page),
    innerDrawerLength: dim('SKL + X', 'ISKL = inner drawer length; X = front thickness.', page),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement depth (additional +12 mm with side stabilisation).', page),
    innerDrawerSpaceRequirementDepth: dim('NL + X + 3', 'Inner drawer space requirement depth (+2 mm with POSISTOP, +12 mm with side stabilisation).', page),
    sideStabilisationExtraDepth: dim(12, 'Additional depth with side stabilisation.', page),
    posistopExtraDepth: dim(2, 'Additional +2 mm depth when POSISTOP is used.', page),
    topClearance: dim(7, 'Labelled "min 7" vertical clearance in front section.', page),
    verticalFixing: dim(34, 'Vertical dimension 34 in front section for single extension (runner fixing height); reference edge unverified.', page),
    sideClearanceMin: dim(24.5, 'Labelled "min 24.5" horizontal dimension in front section (+3 mm with side stabilisation in the 11-16 variant).', page),
    runnerToCabinetSide: dim(thick === '11-16' ? 21 : 24.5, 'Horizontal dimension at lower left of front section.', page),
    maxDimension: dim(13, 'Labelled "max 13" in front section; exact reference unverified.', page),
    distanceToInterchangeWithFullExtension: dim(3, 'Marked A: 3 mm distance to interchange with full extension.', page),
    innerDrawerFrontOffset: dim('X + 19', 'Dimension X + 19 on inner-drawer drawing; X = front thickness (+2 mm with POSISTOP).', page),
  };
};

const fullExtHook = (page: number, thick: '11-16' | '17-19'): Record<string, DimSpec> => {
  const w = thick === '11-16' ? 42 : 49;
  return {
    drawerSidePanelThickness: dim(thick, `Drawer side panel thickness range (${thick} mm).`, page),
    drawerInternalWidth: dim(`LW - ${w}`, `SKW = internal drawer width = LW minus ${w} (tolerance +0.0 / -1.5).`, page),
    drawerInternalWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW.', page),
    drawerLength: dim('NL - 10', 'SKL = drawer length.', page),
    innerDrawerLength: dim('SKL + X', 'ISKL = inner drawer length; X = front thickness.', page),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement depth in cabinet for a drawer (additional +12 mm with side stabilisation in the 11-16 variant).', page),
    innerDrawerSpaceRequirementDepth: dim('NL + X + 3', 'Inner drawer space requirement depth.', page),
    topClearance: dim(7, 'Labelled "min 7" vertical clearance.', page),
    verticalFixing: dim(37, 'Vertical dimension 37 in front section (runner fixing height); reference edge unverified.', page),
    sideClearanceMin: dim(27.5, 'Labelled "min 27.5" horizontal dimension (+3 mm with side stabilisation in the 11-16 variant).', page),
    hookPegRange: dim('11-13', 'Range labelled 11-13 on the drawer front section; reference edge unverified.', page),
    runnerToCabinetSide: dim(thick === '11-16' ? 21 : 24.5, 'Horizontal dimension at lower left of front section.', page),
    innerDrawerFrontOffset: dim('X + 17', 'Dimension X + 17 on inner-drawer drawing; X = front thickness.', page),
  };
};

const singleExtHook = (page: number, thick: '11-16' | '17-19'): Record<string, DimSpec> => {
  const w = thick === '11-16' ? 42 : 49;
  return {
    drawerSidePanelThickness: dim(thick, `Drawer side panel thickness range (${thick} mm).`, page),
    drawerInternalWidth: dim(`LW - ${w}`, `SKW = internal drawer width = LW minus ${w} (tolerance +0.0 / -1.5).`, page),
    drawerInternalWidthTolerance: dim('+0.0 / -1.5', 'Tolerance on SKW.', page),
    drawerLength: dim('NL - 10', 'SKL = drawer length.', page),
    innerDrawerLength: dim('SKL + X', 'ISKL = inner drawer length; X = front thickness.', page),
    spaceRequirementDepth: dim('NL + 3', 'Space requirement depth.', page),
    innerDrawerSpaceRequirementDepth: dim('NL + X + 3', 'Inner drawer space requirement depth.', page),
    topClearance: dim(7, 'Labelled "min 7" vertical clearance.', page),
    verticalFixing: dim(34, 'Vertical dimension 34 in front section (single extension runner fixing height); reference edge unverified.', page),
    sideClearanceMin: dim(24.5, 'Labelled "min 24.5" horizontal dimension (+3 mm with side stabilisation in the 11-16 variant).', page),
    hookPegRange: dim('11-13', 'Range labelled 11-13 on the drawer front section; reference edge unverified.', page),
    runnerToCabinetSide: dim(thick === '11-16' ? 21 : 24.5, 'Horizontal dimension at lower left of front section.', page),
    distanceToInterchangeWithFullExtension: dim(3, 'Marked A: 3 mm distance to interchange with full extension.', page),
    innerDrawerFrontOffset: dim('X + 17', 'Dimension X + 17 on inner-drawer drawing; X = front thickness.', page),
  };
};

const pegTables = (
  lengths: number[],
  pegs: number[],
  lift: number[],
  liftName: 'X3' | 'X1',
  page: number,
): Record<string, DimSpec> => ({
  nominalLengthsForPegTable: dim(lengths, 'Nominal lengths NL (mm) of the pegs / lift-off stop table, in table order.', page),
  pegPositionX2: dim(pegs, `Pegs dimension X2 (mm) for each NL in nominalLengthsForPegTable (same order). Measuring reference of X2 on the drawer drawing is unverified.`, page),
  liftOffStopPosition: dim(lift, `Lift-off stop dimension ${liftName} (mm) for each NL in nominalLengthsForPegTable (same order). Measuring reference unverified.`, page),
});

const fixingNote =
  'unverified: the attachment-of-runners tables (p460/461) are graphical; the mapping of each NL band to specific fixing positions and screw type A (chipboard 4 x 15) or B (system 6 x 14.5) is not transcribed, only the position columns.';

export const tandem: FittingFamily[] = [
  {
    id: 'blum-tandem',
    kind: 'runner',
    brand: 'Blum',
    name: 'TANDEM',
    summary:
      'Concealed 30 kg runner for wooden drawers: 11-16 mm (560H/550H/561H/551H) and 17-19 mm (560F/550F/561F/551F), full or single extension, integrated BLUMOTION.',
    document: DOC,
    pages: Array.from({ length: 32 }, (_, i) => 430 + i),
    variants: [
      base({
        id: 'tandem-560h',
        name: 'TANDEM full extension with BLUMOTION - 560H (11-16 mm, locking device)',
        choices: { nominalLength: L_560H, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('560H', L_560H.map((n) => n), '0', 434, '560H').map((p) => ({ ...p, partNo: p.partNo })),
          part('locking-device', 'T51.1700.04', 'Locking device, orange nylon/zinc (order left/right)', 434),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 434, { qty: 2 }),
          part('depth-stop', '298.5500', 'POSISTOP depth stop, RAL 7037 nylon', 434, { qty: 2 }),
          ...sideStabFull(434),
        ],
        dims: {
          ...fullExtLocking(435, '11-16'),
          ...LOCKING_DRAWER_ASSEMBLY(435),
          sideStabiliserMaxCabinetWidth: dim(1400, 'Side stabilisation set suitable for cabinet width KB 1400 mm.', 434),
        },
        notes: [
          'Suitable for SERVO-DRIVE; integrated tool-free front tilt adjustment.',
          'Side stabiliser recommended with wide pull-outs having a short nominal length.',
          unverifiedAssembly(435),
        ],
        pages: [434, 435],
      }),
      base({
        id: 'tandem-550h',
        name: 'TANDEM single extension with BLUMOTION - 550H (11-16 mm, locking device)',
        choices: { nominalLength: L_550H, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('550H', L_550H, '0', 436, '550H'),
          part('locking-device', 'T51.1700.04', 'Locking device, orange nylon/zinc (order left/right)', 436),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 436, { qty: 2 }),
          part('depth-stop', '298.5500', 'POSISTOP depth stop, RAL 7037 nylon', 436, { qty: 2 }),
          ...sideStabSingle(436),
        ],
        dims: {
          ...singleExtLocking(437, '11-16'),
          ...LOCKING_DRAWER_ASSEMBLY(437),
          sideStabiliserMaxCabinetWidth: dim(1400, 'Side stabilisation set suitable for cabinet width KB 1400 mm.', 436),
        },
        notes: ['Soft end stop when opening; suitable for SERVO-DRIVE.', unverifiedAssembly(437)],
        pages: [436, 437],
      }),
      base({
        id: 'tandem-561h',
        name: 'TANDEM full extension with BLUMOTION - 561H (11-16 mm, hook and peg)',
        choices: { nominalLength: L_HOOK_H, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('561H', L_HOOK_H, '1', 438, '561H').map((p) => ({ ...p, partNo: `561H${(p.when!.nominalLength as number) * 10 + 1}B` })),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 438, { qty: 2 }),
          ...[
            ['ZST.410TV', 'NL up to 410'],
            ['ZST.600TV', 'NL up to 600'],
          ].map(([no, d]) => part('side-stabiliser', no, `Side stabilisation set full extension, ${d}`, 438)),
        ],
        dims: {
          ...fullExtHook(439, '11-16'),
          ...HOOK_DRAWER_ASSEMBLY(439),
          ...pegTables(L_HOOK_H, PEGS_H, LIFT_561H, 'X3', 439),
        },
        notes: [REQ + ' All 561H runners are marked available on request.', unverifiedAssembly(439)],
        pages: [438, 439],
      }),
      base({
        id: 'tandem-551h',
        name: 'TANDEM single extension with BLUMOTION - 551H (11-16 mm, hook and peg)',
        choices: { nominalLength: L_HOOK_H, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('551H', L_HOOK_H, '1', 440, '551H').map((p) => ({ ...p, partNo: `551H${(p.when!.nominalLength as number) * 10 + 1}B` })),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 440, { qty: 2 }),
          ...sideStabSingle(440),
        ],
        dims: {
          ...singleExtHook(441, '11-16'),
          ...HOOK_DRAWER_ASSEMBLY(441),
          ...pegTables(L_HOOK_H, PEGS_H, LIFT_551H, 'X1', 441),
        },
        notes: [REQ + ' All 551H runners are marked available on request.', unverifiedAssembly(441)],
        pages: [440, 441],
      }),
      base({
        id: 'tandem-560f',
        name: 'TANDEM full extension with BLUMOTION - 560F (17-19 mm, locking device)',
        choices: { nominalLength: L_560F, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('560F', L_560F, '0', 442, '560F'),
          part('locking-device', 'T51.1700.04', 'Locking device, orange nylon/zinc (order left/right)', 442),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 442, { qty: 2 }),
          part('depth-stop', '298.5500', 'POSISTOP depth stop, RAL 7037 nylon', 442, { qty: 2 }),
        ],
        dims: { ...fullExtLocking(443, '17-19'), ...LOCKING_DRAWER_ASSEMBLY(443) },
        notes: [REQ + ' All 560F runners are marked available on request.', 'No side stabilisation set is listed for 17-19 mm runners on pages 442-443.', unverifiedAssembly(443)],
        pages: [442, 443],
      }),
      base({
        id: 'tandem-550f',
        name: 'TANDEM single extension with BLUMOTION - 550F (17-19 mm, locking device)',
        choices: { nominalLength: L_550F, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('550F', L_550F, '0', 444, '550F'),
          part('locking-device', 'T51.1700.04', 'Locking device, orange nylon/zinc (order left/right)', 444),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 444, { qty: 2 }),
          part('depth-stop', '298.5500', 'POSISTOP depth stop, RAL 7037 nylon', 444, { qty: 2 }),
        ],
        dims: { ...singleExtLocking(445, '17-19'), ...LOCKING_DRAWER_ASSEMBLY(445) },
        notes: [REQ + ' All 550F runners are marked available on request.', unverifiedAssembly(445)],
        pages: [444, 445],
      }),
      base({
        id: 'tandem-561f',
        name: 'TANDEM full extension with BLUMOTION - 561F (17-19 mm, hook and peg)',
        choices: { nominalLength: L_HOOK_F, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('561F', L_HOOK_F, '1', 446, '561F').map((p) => ({ ...p, partNo: `561F${(p.when!.nominalLength as number) * 10 + 1}B` })),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 446, { qty: 2 }),
        ],
        dims: {
          ...fullExtHook(447, '17-19'),
          ...HOOK_DRAWER_ASSEMBLY(447),
          ...pegTables(L_HOOK_F, PEGS_F, LIFT_561F, 'X3', 447),
        },
        notes: [REQ + ' All 561F runners are marked available on request.', unverifiedAssembly(447)],
        pages: [446, 447],
      }),
      base({
        id: 'tandem-551f',
        name: 'TANDEM single extension with BLUMOTION - 551F (17-19 mm, hook and peg)',
        choices: { nominalLength: L_HOOK_F, capacityKg: [30], version: ['BLUMOTION'] },
        parts: [
          ...runners('551F', L_HOOK_F, '1', 448, '551F').map((p) => ({ ...p, partNo: `551F${(p.when!.nominalLength as number) * 10 + 1}B` })),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon', 448, { qty: 2 }),
        ],
        dims: {
          ...singleExtHook(449, '17-19'),
          ...HOOK_DRAWER_ASSEMBLY(449),
          ...pegTables(L_HOOK_F, PEGS_F, LIFT_551F, 'X1', 449),
        },
        notes: [REQ + ' All 551F runners are marked available on request.', unverifiedAssembly(449)],
        pages: [448, 449],
      }),
      base({
        id: 'tandem-space-tower',
        name: 'TANDEM SPACE TOWER (larder unit)',
        summary: 'Larder unit with inner pull-outs, cabinet width KB 275-1200 mm; usable with all eight TANDEM runner types.',
        choices: { cabinetWidthKB: ['275-1200'], runner: ['560H', '550H', '561H', '551H', '560F', '550F', '561F', '551F'], capacityKg: [30] },
        parts: [],
        dims: {
          cabinetWidthRange: dim('275-1200', 'Recommended cabinet width KB range in mm.', 450),
          runnerFixingHeights: dim([56, 436, 756, 1108, 1428, 1684], 'Runner fixing heights measured upwards from 0 = underside of cabinet bottom panel (19 mm panel + 37 fixing position = 56).', 451),
          runnerHeightSteps: dim([383, 320, 352, 320, 256], 'Printed vertical steps between successive fixing heights from bottom to top (note 56 + 383 = 439, whereas the printed height is 436; as printed).', 451),
          bottomPanelThickness: dim(19, 'Cabinet bottom panel thickness shown below the 0 reference.', 451),
          lowestFixingAboveBottomPanel: dim(37, 'Fixing position above bottom panel (+1 mm if cabinet profile installed before cabinet assembly).', 451),
          hingeHeightsFrontThree: dim([280, 1025], 'Front drilling with three hinges: hinge heights above the bottom edge of the front; top hinge is 80 from top edge.', 451),
          hingeHeightsFrontFour: dim([280, 670, 1340], 'Front drilling with four hinges: hinge heights above the bottom edge of the front; top hinge is 80 from top edge.', 451),
          hingeTopOffset: dim(80, 'Distance of the top hinge from the top edge of the front.', 451),
        },
        notes: [
          'Hinge recommendation: CLIP top BLUMOTION 155 degree hinge (p84); number of hinges see p718.',
          'unverified: printed step 383 (bottom) does not add up with 56 and 436 on p451; both numbers recorded as printed.',
        ],
        pages: [450, 451],
      }),
      base({
        id: 'tandem-accessories',
        name: 'TANDEM accessories',
        summary: 'Pull-out shelf lock, side stabilisation, gallery rail, front adjuster, POSISTOP, screws and tools.',
        choices: { runner: ['560H', '561H', '560F', '561F', '550H', '551H', '550F', '551F'] },
        parts: [
          part('pull-out-shelf-lock', '295H5700', 'Pull-out shelf lock set, Orion grey matt (560H | 561H)', 452, { when: { runner: '560H' } }),
          part('pull-out-shelf-lock', '295H5700', 'Pull-out shelf lock set, Orion grey matt (560H | 561H)', 452, { when: { runner: '561H' } }),
          part('pull-out-shelf-lock', '295F5700', 'Pull-out shelf lock set, Orion grey matt (560F | 561F)', 452, { when: { runner: '560F' } }),
          part('pull-out-shelf-lock', '295F5700', 'Pull-out shelf lock set, Orion grey matt (560F | 561F)', 452, { when: { runner: '561F' } }),
          part('synchronisation-linkage', 'ZST.1089W', 'Round synchronisation linkage 1089 mm, cut to size', 452),
          part('synchronisation-linkage', 'ZST.1160W', 'Round synchronisation linkage 1160 mm, cut to size', 452),
          part('screw', '609.1500', 'Chipboard screw 3.5 x 15 mm', 452),
          part('screw', '661.1450.HG', 'System screw 6 x 14.5 mm', 452),
          ...sideStabFull(455),
          ...sideStabSingle(455),
          part('gallery-rail', 'ZRE.363A.ID', 'Longside gallery rail, NL 400', 456, { when: { nominalLength: 400 } }),
          part('gallery-rail', 'ZRE.413A.ID', 'Longside gallery rail, NL 450', 456, { when: { nominalLength: 450 } }),
          part('gallery-rail', 'ZRE.443A.ID', 'Longside gallery rail, NL 480', 456, { when: { nominalLength: 480 } }),
          part('gallery-rail', 'ZRE.463A.ID', 'Longside gallery rail, NL 500', 456, { when: { nominalLength: 500 } }),
          part('gallery-rail', 'ZRE.483A.ID', 'Longside gallery rail, NL 520', 456, { when: { nominalLength: 520 } }),
          part('gallery-rail', 'ZRE.513A.ID', 'Longside gallery rail, NL 550', 456, { when: { nominalLength: 550 } }),
          part('gallery-rail', 'ZRE.543A.ID', 'Longside gallery rail, NL 580', 456, { when: { nominalLength: 580 } }),
          part('gallery-rail', 'ZRE.563A.ID', 'Longside gallery rail, NL 600', 456, { when: { nominalLength: 600 } }),
          part('gallery-rail', 'ZRE.613A.ID', 'Longside gallery rail, NL 650', 456, { when: { nominalLength: 650 } }),
          part('front-adjuster', '295.1000', 'Front adjuster, natural nylon, for 4-sided drawers', 456),
          part('tool', 'MZM.0095', 'Insertion ram for front adjuster (MINIPRESS)', 456),
          part('depth-stop', '298.5500', 'POSISTOP depth stop, RAL 7037 nylon, inset only', 457),
          part('screw', '609.1700', 'Chipboard screw 3.5 x 17 mm', 457),
          part('screw', '661.1000.HG', 'System screw 6 x 10 mm', 457),
          part('screw', '661.1150.HG', 'System screw 6 x 11.5 mm', 457),
          part('screw', '661.1300.HG', 'System screw 6 x 13 mm', 457),
          part('screw', '661.2000.HG', 'System screw 6 x 20 mm', 457),
          part('tool', 'M01.ZZ03.01', 'Centre bit 2.7 mm, pre-drill for 3.5 mm screws', 457),
          part('tool', 'M01.ZZB3', 'Replacement bit for centre bit', 457),
          part('door-buffer', '993.710', 'Stick-on door buffer 8 mm, natural', 457),
          part('door-buffer', '993.706', 'Door buffer 8 mm, two-part, grey RAL 9006', 457),
          part('tool', '303.756.1', 'Pozidriv PZ 2 screwdriver, 210 mm', 458),
          part('tool', '314.928.1', 'Slotted screwdriver size 1, 200 mm', 458),
        ],
        dims: {
          shelfLockApplicability: dim('full extension only', 'Pull-out shelf lock can be used with TANDEM full extensions (560H/561H/560F/561F), not single extensions.', 452, undefined),
          shelfLockMaxCabinetWidth: dim(1200, 'Maximum cabinet width for the pull-out shelf lock.', 452),
          syncLinkageCut560H561H: dim('LW - 87 +/- 1', 'Synchronisation linkage cut length for 560H | 561H: internal cabinet width LW minus 87, +/-1 mm.', 452),
          syncLinkageCut560F561F: dim('LW - 94 +/- 1', 'Synchronisation linkage cut length for 560F | 561F: internal cabinet width LW minus 94, +/-1 mm.', 452),
          shelfRunnerOffsetA_560: dim('12-15', 'Dimension A in single/double pull-out shelf base drawing for 560H | 560F.', 452),
          shelfRunnerOffsetA_561: dim('11-13', 'Dimension A in single/double pull-out shelf base drawing for 561H | 561F.', 452),
          shelfWidth560H: dim('LW - 22', 'TB = shelf width with pull-out shelf lock for 560H and 561H (+0.0 / -1.5).', 453),
          shelfWidth560F: dim('LW - 29', 'TB = shelf width with pull-out shelf lock for 560F and 561F (+0.0 / -1.5).', 454),
          shelfBaseLength: dim('NL - 38', 'TBL = pull-out shelf base length (all lock variants).', 453),
          insetShelfLength: dim('NL - 38 + X', 'TL = inset pull-out shelf length; X = front piece thickness.', 453),
          shelfSpaceDepth: dim('NL + 3', 'Space requirement depth with pull-out shelf lock (additional +12 mm with side stabilisation; +2 mm POSISTOP or +4 mm TIP-ON on inset).', 453),
          insetShelfSpaceDepth: dim('NL + X + 3', 'Inset pull-out shelf space requirement depth.', 453),
          insetFrontOffset560H: dim('X + 19', 'Inset drawing dimension for 560H / 560F lock variants (+2 mm POSISTOP or +4 mm TIP-ON).', 453),
          insetFrontOffset561: dim('X + 17', 'Inset drawing dimension for 561H / 561F lock variants (+4 mm TIP-ON).', 453),
          shelfMinCompartmentHeight: dim(25, 'Min 25 mm when installed in a compartment (16 mm dimension in drawing).', 453),
          shelfRearOffset: dim(28, 'Dimension 28 at the rear end of TBL/TL in the lock drawings; reference edge unverified.', 453),
          shelfLockOther: dim([3, 37, 32, 10, 12, 15, 27.5], 'Other lock drawing values (min 3, 37, 32, 10, 12-15, min 27.5, 21 / 24.5); reference edges unverified.', 453),
          sideStabFullCutWidth: dim('LW - 254', 'Cut length (item 1) of full-extension side stabilisation set: internal cabinet width LW minus 254.', 455),
          sideStabFullCutLength: dim('NL + 12', 'Cut length (item 2) of full-extension set: NL plus 12.', 455),
          sideStabSingleCutWidth: dim('LW - 222', 'Cut length (item 1) of single-extension set: internal cabinet width LW minus 222.', 455),
          sideStabSingleCutLength: dim('NL + 12', 'Cut length (item 2) of single-extension set: NL plus 12.', 455),
          sideStabMaxCabinetWidth: dim(1400, 'Sets suitable for cabinet width KB 1400 mm.', 455),
          sideStabExtraDepth: dim(12, 'Additional depth with side stabilisation.', 455),
          sideStabExtraClearance: dim(3, '+3 mm on the 27.5 / 37 dimensions with side stabilisation (full extension).', 455),
          frontAdjusterRange: dim(2, 'Front adjuster gives 2-dimensional front adjustment of +/-2 mm.', 456),
          galleryRailBackOffsetTipOn: dim(1, '+1 mm on marked dimensions of the gallery rail installation drawing with TIP-ON.', 456),
          systemScrewDrillDiameter: dim(5, 'Drilling diameter for 6 mm system screws.', 457),
          centreBitDrillDepth: dim(8, 'Maximum drilling depth of centre bit (bit diameter 2.7 mm).', 457),
        },
        notes: [
          'Pull-out shelf lock: not compatible with single extensions; max cabinet width 1200 mm; leave tilt adjustment at factory setting; locking unit only with chipboard screws, latching element with chipboard or system screws.',
          'Pull-out shelf lock set consists of 2 x locking mechanism unit, 2 x latching element and installation instructions; synchronisation linkage ordered separately.',
          'Side stabilisation sets are not compatible with TIP-ON; recommended with wide pull-outs having a short nominal length.',
          'unverified: gallery-rail installation dimensions on p456 are not readable from text and not transcribed.',
          'The fixing bracket for pull-out shelf T51.7000.01 is shown on p423 as compatible with MOVENTO | TANDEM (not required with the pull-out shelf lock).',
        ],
        pages: [452, 453, 454, 455, 456, 457, 458],
      }),
      base({
        id: 'tandem-attachment',
        name: 'TANDEM attachment of runners',
        summary: 'Fixing positions for runners 560H/550H/561H/551H and 560F/550F/561F/551F.',
        choices: { runner: ['560H', '550H', '561H', '551H', '560F', '550F', '561F', '551F'] },
        parts: [
          part('screw', '661.1450.HG', 'System screw 6 x 14.5 mm (type B)', 460),
        ],
        dims: {
          fixing560H: dim([19, 37, 69, 133, 165, 229, 243, 261, 284, 325], 'Candidate fixing position columns for 560H (mm from runner front end; per-NL usage unverified).', 460),
          fixing550H: dim([19, 37, 133, 147, 165, 261, 284, 325, 389], 'Candidate fixing position columns for 550H; 19 can be replaced by chipboard screw 4 x 15.', 460),
          fixing561H: dim([19, 37, 69, 133, 165, 229, 243, 261, 284, 325], 'Candidate fixing position columns for 561H.', 460),
          fixing551H: dim([19, 37, 133, 147, 165, 261, 284, 325], 'Candidate fixing position columns for 551H; 19 can be replaced by chipboard screw 4 x 15.', 460),
          fixing560F: dim([19, 37, 69, 133, 165, 197, 229, 243, 261, 284, 325], 'Candidate fixing position columns for 560F.', 461),
          fixing550F: dim([19, 37, 133, 147, 165, 261, 284, 325, 389], 'Candidate fixing position columns for 550F; 19 can be replaced by chipboard screw 4 x 15.', 461),
          fixing561F: dim([19, 37, 69, 133, 165, 229, 243, 261, 284, 325], 'Candidate fixing position columns for 561F.', 461),
          fixing551F: dim([19, 37, 133, 147, 165, 261, 284, 325], 'Candidate fixing position columns for 551F; 19 can be replaced by chipboard screw 4 x 15.', 461),
          nlBands560H: dim(['250-270', '300-380', '400-420', '450-480', '500-550', '600'], 'NL rows in 560H attachment table.', 460),
          nlBands550H: dim(['270', '300-450', '500-550', '600', '650'], 'NL rows in 550H attachment table.', 460),
          nlBands561H: dim(['260', '285', '310-335', '360-385', '410', '435-485', '510-535', '560'], 'NL rows in 561H attachment table.', 460),
          nlBands551H: dim(['260-285', '310-435', '460-485', '510-535', '560'], 'NL rows in 551H attachment table.', 460),
          nlBands560F: dim(['250-270', '300-350', '400', '450', '500-550', '600'], 'NL rows in 560F attachment table.', 461),
          nlBands550F: dim(['270', '300-450', '500-550', '600', '650'], 'NL rows in 550F attachment table.', 461),
          nlBands561F: dim(['260', '310', '360', '410', '460', '510', '560'], 'NL rows in 561F attachment table.', 461),
          nlBands551F: dim(['260', '310-410', '460', '510', '560'], 'NL rows in 551F attachment table.', 461),
        },
        notes: [
          'A = chipboard screws 4 x 15 mm; B = system screws 6 x 14.5 mm (661.1450.HG).',
          fixingNote,
        ],
        pages: [460, 461],
      }),
    ],
  },
];
