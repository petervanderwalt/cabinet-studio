// AVENTOS HKi, HF top, HS top, HL top - transcribed from Blum "Catalogue and technical manual 2024/2025".
// All page numbers are PRINTED catalogue pages.
import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

const part = (
  role: string,
  partNo: string,
  description: string,
  page: number,
  when?: PartNumber['when'],
  qty?: number,
): PartNumber => {
  const p: PartNumber = { role, partNo, description, page };
  if (when) p.when = when;
  if (qty !== undefined) p.qty = qty;
  return p;
};

const dim = (value: DimSpec['value'], meaning: string, page: number, unit?: DimSpec['unit']): DimSpec => {
  const d: DimSpec = { value, meaning, page };
  if (unit) d.unit = unit;
  return d;
};

// ---- SERVO-DRIVE power supplies (identical tables on pp. 23, 27, 35, 41) -------------------------------------
// [mains plug letter, market, language package letter, languages, suffix]
const PSU_ROWS: [string, string, string, string][] = [
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
const PLUGIN_ROWS: [string, string, string, string][] = [
  ['E', 'Europe', 'A', 'DE|EN|FR|IT|NL'],
  ['E', 'Europe', 'B', 'DA|EN|FI|NO|SV'],
  ['E', 'Europe', 'C', 'EL|EN|HR|SL|SR|TR'],
  ['E', 'Europe', 'D', 'EN|ES|FR|IT|PT'],
  ['E', 'Europe', 'E', 'CS|HU|PL|SK'],
  ['E', 'Europe', 'F', 'BG|ET|LT|LV|RO|RU|UK'],
  ['B', 'GB', 'A', 'DE|EN|FR|IT|NL'],
  ['K', 'AU', 'I', 'EN'],
  ['N', 'CN', 'H', 'EN|ZH|KO'],
  ['U', 'US|CA|JP', 'G', 'EN|ES|FR'],
];

/** Parts shared by every SERVO-DRIVE application: power supply (item 7/8), accessories. */
function servoDriveCommonParts(pg: number, includeSet: boolean): PartNumber[] {
  const out: PartNumber[] = [];
  if (includeSet) out.push(part('servo-drive-set', '23.A000', 'SERVO-DRIVE set: drive unit, distribution cable 1500 mm, connecting node, 2 cable end protectors', pg, { colour: 'TGR' }));
  out.push(part('power-supply-housing', 'Z10NG120', 'Power supply unit housing, wall fixing (colour WGR)', pg));
  for (const [plug, market, pkg, langs] of PSU_ROWS) {
    out.push(
      part('power-supply', `Z10NE04${plug}${pkg}`, `SERVO-DRIVE power supply unit + 2 m flex, mains plug ${plug}, market ${market}, language package ${pkg} (${langs})`, pg, { mainsPlug: plug, market, languagePackage: pkg }),
    );
  }
  for (const [plug, market, pkg, langs] of PLUGIN_ROWS) {
    out.push(
      part('power-supply-plug-in', `Z10NA40${plug}${pkg}`, `SERVO-DRIVE plug-in power supply (one drive unit only), network adapter ${plug}, market ${market}, language package ${pkg} (${langs}); on request`, pg, { networkAdapter: plug, market, languagePackage: pkg }),
    );
  }
  out.push(
    part('accessory', 'Z10K800AE', 'SERVO-DRIVE distribution cable set, 8 m, black (1 cable + 5 cable end protectors)', pg, { colour: 'SZ' }),
    part('accessory', 'Z10V100E.01', 'Connecting node set (1 node + 2 cable end protectors), black', pg, { colour: 'SZ' }),
    part('accessory', 'Z10K0009', 'Cable holder, white, for fixing distribution cable', pg, { colour: 'WS' }),
  );
  return out;
}

const SERVO_NOTES = [
  'SERVO-DRIVE: for three lift mechanisms or more (HF top) a two-drive-unit synchronised set is recommended; for two or more drive units the language-package power supply unit (item 7) is required; plug-in power supply suits one drive unit only (pp. 22-23).',
  'Blum distance bumper (6 x Ø5 mm in the SERVO-DRIVE cover cap set) is for SERVO-DRIVE applications only; insert, do not glue.',
];

const commonServoDims = (pagePlan: number): Record<string, DimSpec> => ({
  servoSwitchHoleDiameter: dim(35, 'SERVO-DRIVE switch hole diameter in the panel', pagePlan, 'mm'),
  servoSwitchHoleDepth: dim('11 +0.5/-0', 'depth of the SERVO-DRIVE switch hole (as drawn in the side-section view)', pagePlan, 'mm'),
  servoSwitchEdgeOffset: dim('12 ±0.3', 'offset of the switch hole edge as drawn in the SERVO-DRIVE switch diagram; the reference edge is not labelled in the text (unverified)', pagePlan, 'mm'),
  servoSwitchHeightRange: dim('30-90', 'switch hole centre height, min 30 to max 90, measured from the lower panel edge as drawn', pagePlan, 'mm'),
  distanceBumperHoleDiameter: dim(5, 'Blum distance bumper hole diameter', pagePlan, 'mm'),
  distanceBumperEdgeOffset: dim(8, 'bumper hole offset from the edges of the front (8 mm from top and bottom edge as drawn; bottom one 8* from the cabinet bottom edge for fronts that protrude below)', pagePlan, 'mm'),
  distanceBumperMinEdge: dim('min 10', 'minimum dimension shown at the bumper side-section drawing (reference unclear, unverified)', pagePlan, 'mm'),
});

// ==========================================================================================================
// AVENTOS HKi
// ==========================================================================================================
const hkiLF = ['420-1610', '930-2800', '1730-5200', '2600-7800'];
const hkiStd = ['24K2300', '24K2500', '24K2700', '24K2800'];
const hkiTip = ['24K2300T', '24K2500T', '24K2700T', '24K2800T'];

const hkiVariant: FittingVariant = {
  id: 'aventos-hki-standard-tip-on',
  name: 'AVENTOS HKi - Standard | TIP-ON (wooden fronts, wide and narrow alu frames)',
  summary: 'Integrated stay lift fitted inside a routed recess in the cabinet side; fully or semi-integrated.',
  choices: {
    version: ['Standard', 'TIP-ON'],
    powerFactorLF: hkiLF,
    colour: ['ONS'],
    frontType: ['Wooden fronts', 'Wide and narrow alu frames'],
    cabinetSidePanelThicknessSWD: ['16-25'],
  },
  parts: [
    ...hkiLF.flatMap((lf, i) => [
      part('lift-mechanism-set', hkiStd[i], `Lift mechanism set (2 symmetrical), LF ${lf}, 107 deg, onyx black`, 14, { version: 'Standard', powerFactorLF: lf }),
      part('lift-mechanism-set', hkiTip[i], `Lift mechanism set TIP-ON (2 symmetrical), LF ${lf}, 107 deg, onyx black`, 14, { version: 'TIP-ON', powerFactorLF: lf }),
    ]),
    part('cover-cap-set', '24K8000', 'Cover cap set (left, right, 2 branding elements); semi-integrated only; nylon; SW | HGR | TGR | CS | IN-G listed', 14),
    part('front-fixing-bracket', '24K42E1', 'Front fixing bracket, EXPANDO, wooden fronts, onyx black', 14, { frontType: 'Wooden fronts' }, 2),
    part('front-fixing-bracket', '24K4201A', 'Front fixing bracket, screw-on, wide/narrow alu frames, onyx black', 14, { frontType: 'Wide and narrow alu frames' }, 2),
    part('tip-on', '956.1004', 'TIP-ON 956. short version with magnet, KH up to 600; SW | R7036 | CS', 14),
    part('tip-on', '956.1004', 'TIP-ON short version (1 TIP-ON, 1 screw-on catch plate, 1 self-adhesive catch plate)', 16, { version: 'TIP-ON' }),
    part('screw', '609.1500', 'Chipboard screws Ø3.5 x 15 mm supplied with TIP-ON 956.1004', 14, { version: 'TIP-ON' }),
    part('adapter-plate', '956.1201', 'Straight adapter plate, short version (20/17), nylon; SW | R7036 | CS', 14, { version: 'TIP-ON' }),
    part('adapter-plate', '956.1201', 'Straight adapter plate, short version, for TIP-ON (order TIP-ON separately)', 17, { version: 'TIP-ON' }),
    part('adapter-plate', '956A1501', 'Cruciform adapter plate, extended version (37/32), nylon; R7036', 14, { version: 'TIP-ON' }),
    part('adapter-plate', '956A1501', 'Cruciform adapter plate, extended version, for TIP-ON (order TIP-ON separately)', 17, { version: 'TIP-ON' }),
    part('accessory', '24K7100', 'Raw boards set: 2 pre-routed MDF raw boards 600 x 450 x 19 mm incl. 2 spacers', 18),
    part('accessory', 'M45.1010', 'Spacer set (2 spacers), transport and assembly protection', 18),
    part('accessory', 'M45.ZF04', 'Recess drill Ø4.0 to expose central recess after facing', 18),
    part('accessory', '65.5840', 'Routing template set (lift mechanism, insert panel, 5 mm base plate)', 18),
    part('accessory', 'M45.ZF19', 'Copy router Ø19.0 for routing template set', 18),
    part('accessory', 'M34.ZW50', 'Cutting insert set, 10 replaceable inserts for copy router', 18),
  ],
  dims: {
    cabinetHeightKHMax: dim(600, 'maximum cabinet height KH', 14, 'mm'),
    cabinetWidthKBMax: dim(1800, 'maximum cabinet width KB', 14, 'mm'),
    sideThicknessSWD: dim([16, 25], 'cabinet side panel thickness SWD range', 14, 'mm'),
    internalDepthLTMin: dim(271, 'minimum internal cabinet depth LT (recess drawings)', 15, 'mm'),
    maxFrontWeightTwoMechanisms: dim(18, 'maximum front weight for two lift mechanisms', 14, 'kg'),
    powerFactorLF: dim('KH x FG', 'power factor LF = cabinet height KH (mm) x front weight FG incl. double handle weight (kg); a third lift mechanism raises LF by up to 50 % (trial application recommended)', 14),
    recessLength: dim('265 ±1', 'length of the routed recess in the side panel as drawn (fully and semi-integrated)', 15, 'mm'),
    recessHeight: dim('120 +1/-0', 'height of the routed recess in the side panel as drawn', 15, 'mm'),
    recessDepth: dim('12 +0.5/-0', 'depth of the routed recess into the side panel, with min 16 panel thickness shown in the detail', 15, 'mm'),
    recessCornerRadius: dim('R25', 'corner radius of the recess as drawn', 15),
    minSidePanelThicknessAtRecess: dim('min 16', 'minimum side panel thickness shown in the recess detail', 15, 'mm'),
    semiIntegratedSpace: dim('268 x 128', 'two dimensions shown in the semi-integrated space-requirement view (268 and 128); exact reference edges not labelled (unverified)', 15, 'mm'),
    minimumGapMF: dim(2, 'minimum gap MF at the front', 15, 'mm'),
    maxOpeningAngle: dim(107, 'opening angle OW of the lift mechanism sets', 14, 'deg'),
    yMaxNoStop: dim('FH x 0.29 - 32 + FD', 'Y max (space requirement above the cabinet at maximum opening angle) without opening angle stop; FH front height, FD front thickness', 15),
    aWithStop: dim('FH x 0.26 + 28 - FD', 'dimension A with opening angle stop; FH front height, FD front thickness', 15),
    zByFrontThickness: dim(['16: 70', '18: 63', '19: 59', '20: 57', '22: 49', '26: 35'], 'Z (mm) by front thickness FD (mm) in the opening-angle-stop table; Z is not defined in the legend (unverified)', 15),
    frontFixingHoleSpacing: dim('32 / 32', 'front fixing bracket hole spacing: two 32 mm spacings along the front edge', 15, 'mm'),
    frontFixingFromTopEdge: dim('53.5 - Fo', 'front fixing position as drawn; Fo top gap', 15, 'mm'),
    frontFixingFromSideEdge: dim('SFA - SWD/2 (*) | SFA - 6 (**)', 'front fixing position from the front side edge for the two drawn cases; SFA front overlay of side panel, SWD side panel thickness', 15, 'mm'),
    frontFixingHoleWood: dim(5, 'front fixing hole Ø for wooden fronts, depth 12', 15, 'mm'),
    frontFixingHoleAluSmall: dim(2.0, 'pilot hole Ø in alu frame for wall thickness x <= 1.8 mm', 15, 'mm'),
    frontFixingHoleAluLarge: dim(2.2, 'pilot hole Ø in alu frame for wall thickness x > 1.8 mm', 15, 'mm'),
    tipOnStroke: dim(17, 'TIP-ON 956. short version output path (approx.)', 16, 'mm'),
    tipOnAdapterStraightPlanning: dim('20/17', 'straight adapter plate short version designation', 17),
    tipOnAdapterCruciformPlanning: dim('37/32', 'cruciform adapter plate extended version designation', 17),
    adapterPlateFrontGap: dim('8 / 3*', 'dimensions shown on the adapter plate front gap drawings; 3 mm offset installation (*); FAu bottom front overlay', 17, 'mm'),
  },
  drilling: [],
  notes: [
    'Wide cabinets: add an extra lift mechanism on the centre panel to prevent sagging of the front when open (p. 14).',
    'Cornice | crown: space-requirement formulas Y max and A depend on opening angle stop (p. 15).',
    'Concealed wall hanging brackets only can be combined with HKi (p. 15).',
    'TIP-ON catch plate not suitable for powder-coated, waxed or oiled surfaces (p. 14, 16).',
    'Cover cap set 24K8000 is required for semi-integrated lift mechanisms only (p. 14).',
    'unverified: dimension "21" (vertical, top right of recess drawings) and the Z table origin on p. 15 are not defined by the legend.',
    'unverified: hole positions for front fixing brackets are only given as formulas along the diagram (p. 15); no numeric drilling rule produced.',
    'Power factor LF bands per part number are in choices.powerFactorLF; lift mechanism set order: 24K2300 / 24K2500 / 24K2700 / 24K2800 (Standard) and the same with suffix T (TIP-ON).',
  ],
  pages: [12, 13, 14, 15, 16, 17, 18],
};

// ==========================================================================================================
// AVENTOS HF top
// ==========================================================================================================
const hfLF = ['2700-13500', '10000-19300'];

const hfSystemRule = (id: string, kh: string, h: number, page: number): DrillingRule => ({
  id,
  target: 'carcass-side',
  label: `Lift mechanism fixing, system screws, KH ${kh}`,
  reference:
    'x measured from the front edge of the cabinet side panel (dimension lines start at the front edge as drawn); y measured down from the top edge of the side panel inside the cabinet (dimension H starts at the top edge as drawn). Two rows 64 mm apart, two columns 101 mm then 128 mm further. Ø5 holes, depth min 11.5 mm. Reference edges read from the perspective drawing.',
  holes: [
    { x: 101, y: h, diameter: 5, depth: 11.5 },
    { x: 229, y: h, diameter: 5, depth: 11.5 },
    { x: 101, y: h + 64, diameter: 5, depth: 11.5 },
    { x: 229, y: h + 64, diameter: 5, depth: 11.5 },
  ],
  when: { cabinetHeightKH: [kh] },
  page,
});
const hfChipRule = (id: string, kh: string, h: number, page: number): DrillingRule => ({
  id,
  target: 'carcass-side',
  label: `Lift mechanism fixing, chipboard screws with positioning system, KH ${kh}`,
  reference:
    'x from the front edge of the side panel, y down from the top edge of the side panel inside the cabinet, as drawn. Upper row y = H: pair at x 91.5 and 91.5+11; lower row y = H+63: pair at x 91.5+124 and 91.5+124+11. Chipboard screws Ø4 x 35 mm (drill diameter not published).',
  holes: [
    { x: 91.5, y: h, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 102.5, y: h, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 215.5, y: h + 63, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 226.5, y: h + 63, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
  ],
  when: { cabinetHeightKH: [kh] },
  page,
});

function hfDims(variant: 'wood' | 'narrow'): Record<string, DimSpec> {
  const pl = variant === 'wood' ? 24 : 28;
  const ph = variant === 'wood' ? 25 : 29;
  const base: Record<string, DimSpec> = {
    cabinetHeightKH: dim([480, 1200], 'cabinet height KH range', pl - 2, 'mm'),
    cabinetWidthKBMax: dim(1800, 'maximum cabinet width KB', pl - 2, 'mm'),
    internalDepthLTMin: dim(264, 'minimum internal cabinet depth LT', pl, 'mm'),
    openingAngleOW2: dim([81, 116], 'opening angle range OW2 of the lift mechanism sets (multi-stage adjustment)', pl - 2, 'deg'),
    powerFactorSymmetrical: dim('KH x FG', 'LF for symmetrical fronts = cabinet height KH (mm) x combined weight of top and bottom fronts FG incl. handle (kg)', pl - 2),
    powerFactorAsymmetrical: dim('TKH x FG', 'LF for asymmetrical fronts = theoretical cabinet height TKH (mm) x combined front weight FG incl. handle (kg)', pl - 2),
    theoreticalCabinetHeightTKH: dim('FHo x 2 + Fo + Fm + Fu', 'TKH for asymmetrical fronts; FHo upper front height, Fo top gap, Fm middle gap, Fu bottom gap; taller front must be at the top', pl),
    cabinetHeightSymmetrical: dim('FHo x 2 + Fo + Fm + Fu', 'KH for symmetrical fronts; FHo upper front height, Fo top gap, Fm middle gap, Fu bottom gap', pl),
    thirdLiftMechanismLFIncrease: dim(50, 'power factor LF can be increased by 50 % with a third lift mechanism; 1 pc covers LF 1350-3000 at KB up to 600 mm', pl - 2),
    xMax: dim('FH x 0.9 + FD x 1.5 + 35', 'X max, horizontal space in front of the cabinet at full opening; FH front height, FD front thickness', pl),
    yAngle116: dim('FH x 0.44 + 38', 'Y (mm) with opening angle stop set to 116 deg', pl),
    yAngle107: dim('FH x 0.29 + 35', 'Y (mm) with opening angle stop set to 107 deg', pl),
    yAngle97: dim('FH x 0.12 + 31', 'Y (mm) with opening angle stop set to 97 deg', pl),
    yAngle88: dim(28, 'Y (mm) with opening angle stop set to 88 deg', pl, 'mm'),
    yAngle81: dim(0, 'Y (mm) with opening angle stop set to 81 deg', pl, 'mm'),
    minLH_22F3200: dim(443, 'minimum internal cabinet height LH with lever arm set 22F3200', pl, 'mm'),
    minLH_22F3500: dim(512, 'minimum internal cabinet height LH with lever arm set 22F3500', pl, 'mm'),
    minLH_22F3900: dim(632, 'minimum internal cabinet height LH with lever arm set 22F3900', pl, 'mm'),
    A_KH480_519: dim(66.5, 'dimension A for KH 480-519 (side view, measured from the cabinet top as drawn)', pl, 'mm'),
    B_KH480_519: dim(171.5, 'dimension B for KH 480-519', pl, 'mm'),
    Cmin_KH480_519: dim(172, 'dimension C min for KH 480-519', pl, 'mm'),
    A_KH520_1200: dim(89, 'dimension A for KH 520-1200', pl, 'mm'),
    B_KH520_1200: dim(194, 'dimension B for KH 520-1200', pl, 'mm'),
    Cmin_KH520_1200: dim(195, 'dimension C min for KH 520-1200', pl, 'mm'),
    lowerSpaceMin: dim('min 22', 'minimum dimension shown below the lift mechanism in the space-requirement side view (reference not labelled, unverified)', pl, 'mm'),
    sideClearances: dim('30 / 66 / 30', 'dimensions shown in the front space-requirement view: 30 and 30 either side and 66 for the SERVO-DRIVE unit as drawn', pl, 'mm'),
    frontFixingFromEdge: dim(12.5, 'front fixing dimension shown on the front assembly view (from front side edge as drawn)', pl, 'mm'),
    frontBottomMin: dim('min 17 (32) + FAu', 'bottom of front: min 17 and 32 hole spacing plus bottom front overlay FAu as drawn', pl, 'mm'),
    hingesPerFront: dim('3 hinges at KB 1200 mm and/or from 12 kg FG; 4 hinges at KB 1800 mm and/or from 20 kg FG', 'number of door hinges and centre hinges per front', 23),
  };
  if (variant === 'wood') {
    Object.assign(base, {
      Z_KH480_519: dim(170, 'Z for KH 480-519 (front assembly view, mounting plate position measured as drawn)', pl, 'mm'),
      Z_KH520_1200: dim(189, 'Z for KH 520-1200', pl, 'mm'),
      hingeBossHole: dim(35, 'hinge cup hole diameter in front; TB 3-6 mm from front edge; depth min 12.6 (INSERTA 12.8)', ph, 'mm'),
      hingeCupDepthMin: dim(12.6, 'minimum hinge cup hole depth, INSERTA 12.8', ph, 'mm'),
      hingeBossTB: dim([3, 6], 'drilling distance TB (hole edge to front edge) range', ph, 'mm'),
      hinge120Overlay: dim('20.5 (19)', 'CLIP top 120 deg hinge overall height dimension as drawn (value in brackets for 120 special hinge)', ph, 'mm'),
      hinge120Length: dim(66.5, 'CLIP top 120 deg hinge length dimension as drawn', ph, 'mm'),
      hinge120Side: dim('11 (13)', 'hinge dimension as drawn (bracket value for special hinge)', ph, 'mm'),
        centreHingeMinGap: dim(1.5, 'centre hinge minimum gap F', ph, 'mm'),
      centreHingeDims: dim('21 / 66 / 20*', 'centre hinge dimensions as drawn; 20* is 37 mm for cruciform mounting plates (37/32)', ph, 'mm'),
      insertaBossHole: dim('Ø35 +0.2/0; 9.5; 45; Ø8 dowels', 'INSERTA | EXPANDO boss drilling: cup hole Ø35, dowel hole pattern 45 apart, 9.5 offset, Ø8; depth min 12.6 (12.8)', ph),
      hingeBossSize: dim('57 (65) x 37 (40.5), 3.2 (7)', 'hinge boss dimensions; values in brackets for INSERTA', ph, 'mm'),
      TB_table_MD0: dim(['FA14: 3', 'FA15: 4', 'FA16: 5', 'FA17: 6'], 'CLIP top 120 deg hinge drilling distance TB (mm) by front overlay FA (mm) at mounting plate spacing MD 0', ph),
      TB_table_MD3: dim(['FA11: 3', 'FA12: 4', 'FA13: 5', 'FA14: 6'], 'drilling distance TB by FA at MD 3', ph),
      TB_table_MD6: dim(['FA8: 3', 'FA9: 4', 'FA10: 5', 'FA11: 6'], 'drilling distance TB by FA at MD 6', ph),
      TB_table_MD9: dim(['FA5: 3', 'FA6: 4', 'FA7: 5', 'FA8: 6'], 'drilling distance TB by FA at MD 9', ph),
      TB_centre_MD0: dim(['F3: 6', 'F4: 5', 'F5: 4', 'F6: 3'], 'centre hinge drilling distance TB (mm) by horizontal gap F (mm) between fronts at MD 0', ph),
      specialHingeNote: dim(2, 'with the CLIP top 120 deg special hinge the front overlay FA is always 2 mm larger', ph, 'mm'),
    });
  } else {
    Object.assign(base, {
      Z_KH480_519: dim(188, 'Z for KH printed as "480-549" in the narrow alu table (printed range likely meant 480-519) (unverified)', pl, 'mm'),
      Z_KH520_1200: dim(207, 'Z for KH 520-1200', pl, 'mm'),
      aluFrameFrontMaxThickness: dim(20.5, 'gap F must be adjusted for frame thicknesses over 20.5 mm', ph, 'mm'),
      centreHingeMinGap: dim(1.5, 'centre hinge minimum gap F', ph, 'mm'),
      aluHinge120Dims: dim('66.5 / 19.5 / 15.5 / 1.7', 'CLIP top 120 deg aluminium frame door hinge dimensions as drawn', ph, 'mm'),
      aluCentreHingeDims: dim('21 / 66 / 19.5 / 19.5', 'CLIP top aluminium frame centre hinge dimensions as drawn', ph, 'mm'),
      aluFrameProfileWidth: dim([19, 21], 'alu frame width range shown in screw-on drawing (19-21)', ph, 'mm'),
      aluFrameCutout: dim('31 / 22 / 38 / 44 / 42 / R4 / Ø7 ±0.1 / 1.1*', 'milling/drilling dimensions of the narrow alu frame for screw-on hinge and adapter plate as drawn; reference edges not stated (unverified)', ph, 'mm'),
    });
  }
  Object.assign(base, commonServoDims(31));
  return base;
}

function hfParts(variant: 'wood' | 'narrow'): PartNumber[] {
  const w = variant === 'wood';
  const p1 = w ? 22 : 26;
  const p2 = w ? 23 : 27;
  const out: PartNumber[] = [];
  const sys = w ? ['22F2510', '22F2810'] : ['22F2510', '22F2810'];
  const chip = ['22F2500', '22F2800'];
  hfLF.forEach((lf, i) => {
    out.push(
      part('lift-mechanism-set', sys[i], `Lift mechanism set (2 symmetrical), pre-mounted system screws, LF ${lf}`, p1, { fixing: 'systemScrews', powerFactorLF: lf }),
      part('lift-mechanism-set', chip[i], `Lift mechanism set (2 symmetrical) with positioning system, 8 chipboard screws Ø4x35, LF ${lf}`, p1, { fixing: 'chipboardScrews', powerFactorLF: lf }),
    );
  });
  out.push(
    part('lever-arm-set', '22F3200', 'Lever arm set (2 symmetrical), KH 480-610', p1, { leverArmKH: '480-610' }),
    part('lever-arm-set', '22F3500', 'Lever arm set (2 symmetrical), KH 600-910', p1, { leverArmKH: '600-910' }),
    part('lever-arm-set', '22F3900', 'Lever arm set (2 symmetrical), KH 840-1200', p1, { leverArmKH: '840-1200' }),
    part('cover-cap-set', '22.8000', 'Cover cap set (left, right, 2 branding elements), nylon; SW | HGR | TGR | IN-G', p1, { drive: 'Standard' }),
    part('cover-cap-set', '23.8000', 'Cover cap set for SERVO-DRIVE: caps, 2 switches, 6 distance bumpers Ø5; SW | HGR | TGR | IN-G', p1, { drive: 'SERVO-DRIVE' }),
  );
  if (w) {
    out.push(
      part('mounting-plate-lever-arm', '175H3100', 'Mounting plate for lever arm, screw-on, spacing 1 (horizontal steel)', 22, { mountingPlateFixing: 'screw-on' }),
      part('mounting-plate-lever-arm', '177H3100E', 'Mounting plate for lever arm, EXPANDO, spacing 0', 22, { mountingPlateFixing: 'EXPANDO' }),
      part('mounting-plate-lever-arm', '177H3100', 'Mounting plate for lever arm, knock-in', 22, { mountingPlateFixing: 'knock-in' }),
      part('hinge', '70T5590BTL', 'CLIP top 120 deg hinge, unsprung, INSERTA', 23, { hingeBoss: 'INSERTA', hingeType: '120' }),
      part('hinge', '70T5550.TL', 'CLIP top 120 deg hinge, unsprung, screw-on', 23, { hingeBoss: 'screw-on', hingeType: '120' }),
      part('hinge', '72T5590BTL', 'CLIP top 120 deg special hinge, unsprung, INSERTA (for larger FA)', 23, { hingeBoss: 'INSERTA', hingeType: '120 special' }),
      part('hinge', '72T5550.TL', 'CLIP top 120 deg special hinge, unsprung, screw-on (for larger FA)', 23, { hingeBoss: 'screw-on', hingeType: '120 special' }),
      part('mounting-plate-hinge', '175H3100', 'Hinge mounting plate, screw-on, spacing 1 (depends on upper front overlay FAo)', 23, { mountingPlateFixing: 'screw-on' }),
      part('mounting-plate-hinge', '177H3100E', 'Hinge mounting plate, EXPANDO, spacing 0', 23, { mountingPlateFixing: 'EXPANDO' }),
      part('mounting-plate-hinge', '177H3100', 'Hinge mounting plate, knock-in', 23, { mountingPlateFixing: 'knock-in' }),
      part('centre-hinge', '78Z553ET', 'CLIP top centre hinge, unsprung, EXPANDO', 23, { hingeBoss: 'EXPANDO', hingeType: 'centre' }),
      part('centre-hinge', '78Z5500T', 'CLIP top centre hinge, unsprung, screw-on', 23, { hingeBoss: 'screw-on', hingeType: 'centre' }),
      part('mounting-plate-centre-hinge', '175H3100', 'Centre hinge mounting plate, screw-on, spacing 1', 23, { mountingPlateFixing: 'screw-on' }),
      part('mounting-plate-centre-hinge', '177H3100E', 'Centre hinge mounting plate, EXPANDO, spacing 0', 23, { mountingPlateFixing: 'EXPANDO' }),
      part('mounting-plate-centre-hinge', '177H3100', 'Centre hinge mounting plate, knock-in', 23, { mountingPlateFixing: 'knock-in' }),
      part('hinge-set', '78Z5530T11', 'Hinge set wooden fronts: 2 x 70T5590BTL, 2 x 78Z5530T, 6 x 177H3100; INSERTA | knock-in | EXPANDO; NI | ONS; on request', 30, { hingeSet: 'wooden fronts' }),
      part('hinge-set', '78Z5500T12', 'Hinge set wooden/wide alu: 2 x 70T5550.TL, 2 x 78Z5500T, 6 x 175H3100; screw-on; NI | ONS; on request', 30, { hingeSet: 'wooden fronts and wide alu frames' }),
      part('hinge-component', '78Z5530T', 'CLIP top centre hinge unsprung (as listed inside hinge set 78Z5530T11)', 30),
      part('hinge-component', '78Z5500T', 'CLIP top centre hinge unsprung screw-on (inside hinge set)', 30),
      part('screw', '609.1x00', 'Chipboard screws for wooden fronts (2 per side for lever arm plate / hinge fixing)', 22),
      part('screw', '660.0950', 'Countersunk self-tapping screws for wide alu frames', 22),
    );
  } else {
    out.push(
      part('adapter-plate-lever-arm', '175H5B00', 'CLIP adapter plate for lever arms, left | right, spacing 0', 26),
      part('hinge', '72T550A.TL', 'CLIP top 120 deg aluminium frame door hinge, unsprung, screw-on', 27),
      part('mounting-plate-hinge', '175H3100', 'Hinge mounting plate, screw-on, spacing 1 (depends on top gap F)', 27, { mountingPlateFixing: 'screw-on' }),
      part('mounting-plate-hinge', '177H3100E', 'Hinge mounting plate, EXPANDO, spacing 0', 27, { mountingPlateFixing: 'EXPANDO' }),
      part('mounting-plate-hinge', '177H3100', 'Hinge mounting plate, knock-in', 27, { mountingPlateFixing: 'knock-in' }),
      part('centre-hinge', '78Z550AT', 'CLIP top aluminium frame centre hinge, unsprung, screw-on', 27),
      part('adapter-plate-centre-hinge', '175H5A00', 'CLIP adapter plate for centre hinges, symmetrical, spacing 0, incl. screws', 27),
      part('hinge-set', '78Z550AT11', 'Hinge set narrow alu: 2 x 72T550A.TL, 2 x 78Z550AT, 2 x 175H5400, 2 x 175H5A00, 2 x 175H5B00; screw-on; NI | ONS; on request', 30),
      part('hinge-component', '175H5400', 'Horizontal cam mounting plate (inside narrow alu hinge set)', 30, undefined, 2),
      part('screw', '660.0950', 'Countersunk self-tapping screws, 2 per side for narrow alu frames', 27),
    );
  }
  out.push(...servoDriveCommonParts(p2, true).filter((x) => x.partNo !== '23.A000'));
  out.push(part('servo-drive-set', '23.A000', 'SERVO-DRIVE set: drive unit, 1500 mm distribution cable, connecting node, 2 end protectors; TGR', p1, { drive: 'SERVO-DRIVE' }));
  return out;
}

const hfDrilling: DrillingRule[] = [
  hfSystemRule('hf-lift-system-kh480-519', '480-519', 93.5, 24),
  hfSystemRule('hf-lift-system-kh520-1200', '520-1200', 116, 24),
  hfChipRule('hf-lift-chip-kh480-519', '480-519', 93, 24),
  hfChipRule('hf-lift-chip-kh520-1200', '520-1200', 115.5, 24),
];

const hfWood: FittingVariant = {
  id: 'aventos-hf-top-wood-wide-alu',
  name: 'AVENTOS HF top - wooden fronts and wide alu frames',
  summary: 'Bi-fold lift system; Standard or SERVO-DRIVE; symmetrical or asymmetrical fronts.',
  choices: {
    drive: ['Standard', 'SERVO-DRIVE'],
    fixing: ['systemScrews', 'chipboardScrews'],
    powerFactorLF: hfLF,
    cabinetHeightKH: ['480-519', '520-1200'],
    leverArmKH: ['480-610', '600-910', '840-1200'],
    mountingPlateFixing: ['screw-on', 'EXPANDO', 'knock-in'],
    hingeBoss: ['INSERTA', 'screw-on', 'EXPANDO'],
  },
  parts: hfParts('wood'),
  dims: hfDims('wood'),
  drilling: hfDrilling.map((d) => ({ ...d })),
  notes: [
    'Power factor LF bands: 2700-13500 (22F2510 / 22F2500) and 10000-19300 (22F2810 / 22F2800); overlap region - pick the more powerful one for overlapping areas and trial-apply at borderlines (p. 22).',
    'Lever arm set by KH: 480-610 -> 22F3200, 600-910 -> 22F3500, 840-1200 -> 22F3900; ranges overlap on the catalogue page.',
    'Wide alu frames: an additional cruciform mounting plate is required for the CLIP top centre hinge; only cruciform plates under a 57 mm frame frieze width (p. 23).',
    'Hinges: 3 hinges at KB 1200 mm and/or from 12 kg FG; 4 hinges at KB 1800 mm and/or from 20 kg FG (p. 23).',
    'Standard mounting plate spacing depends on upper front overlay FAo (p. 23).',
    'Power-supply part numbers: Z10NE04 + mains plug letter + language package letter (see parts).',
    'unverified: SERVO-DRIVE switch hole Ø10 position X 38.5 / Y 102 (KH 480-519) or 124 (KH 520-1200); chipboard variant Y 102 / 124 - origin of X and Y not clear from drawing (p. 24).',
    'unverified: hinge cup, TB and boss values on p. 25 not mapped to drilling rules because front edge reference is not tied to a hole centre.',
    ...SERVO_NOTES,
  ],
  pages: [20, 21, 22, 23, 24, 25, 30, 31],
};

const hfNarrow: FittingVariant = {
  id: 'aventos-hf-top-narrow-alu',
  name: 'AVENTOS HF top - narrow alu frames',
  summary: 'Bi-fold lift system for narrow aluminium frames; hinges and adapter plates screw-on.',
  choices: {
    drive: ['Standard', 'SERVO-DRIVE'],
    fixing: ['systemScrews', 'chipboardScrews'],
    powerFactorLF: hfLF,
    cabinetHeightKH: ['480-519', '520-1200'],
    leverArmKH: ['480-610', '600-910', '840-1200'],
    mountingPlateFixing: ['screw-on', 'EXPANDO', 'knock-in'],
  },
  parts: hfParts('narrow'),
  dims: hfDims('narrow'),
  drilling: hfDrilling.map((d) => ({ ...d, page: 28 })),
  notes: [
    'Planning drilling and space-requirement values are the same as the wooden-front pages except Z (p. 28).',
    'Boss fixing screws are included with the aluminium frame hinge (p. 27).',
    'Frame width 19-21 mm; gap F must be adjusted for frame thickness over 20.5 mm (p. 29).',
    'Three hinges at KB 1200 mm and/or from 12 kg FG; four at KB 1800 mm and/or 20 kg (p. 27).',
    'unverified: p. 28 Z table prints "480-549" for the first row; probably 480-519.',
    'unverified: SERVO-DRIVE switch hole X/Y origin (p. 28).',
    ...SERVO_NOTES,
  ],
  pages: [26, 27, 28, 29, 30, 31],
};

// ==========================================================================================================
// AVENTOS HS top
// ==========================================================================================================
const hsRanges: [string, string, string, string, string][] = [
  // KH, FG, systemScrews partNo, chipboard partNo
  ['350-450', '2.00-11.50', '22S2210', '22S2200', ''],
  ['450-540', '2.50-12.50', '22S2210', '22S2200', ''],
  ['480-660', '2.75-15.25', '22S2510', '22S2500', ''],
  ['650-800', '3.50-18.50', '22S2810', '22S2800', ''],
];

const hsSystemRule: DrillingRule = {
  id: 'hs-lift-system-screws',
  target: 'carcass-side',
  label: 'Lift mechanism fixing, system screws',
  reference:
    'x from the front edge of the cabinet side panel; y down from the top edge of the side panel inside the cabinet (127 total = 63 + 64 as drawn). Ø5 holes, depth min 11.5.',
  holes: [
    { x: 101, y: 63, diameter: 5, depth: 11.5 },
    { x: 229, y: 63, diameter: 5, depth: 11.5 },
    { x: 101, y: 127, diameter: 5, depth: 11.5 },
    { x: 229, y: 127, diameter: 5, depth: 11.5 },
  ],
  page: 36,
};
const hsChipRule: DrillingRule = {
  id: 'hs-lift-chipboard-screws',
  target: 'carcass-side',
  label: 'Lift mechanism fixing, chipboard screws with positioning system',
  reference:
    'x from the front edge of the side panel; y down from the top edge of the side panel inside the cabinet (121.5 total = 69 + 52.5). Upper row y = 69 pair at x 215.5 and 226.5 (104.5 + 111, +11); lower row y = 121.5 pair at x 104.5 and 115.5. Chipboard screws Ø4 x 35 (pilot Ø not published).',
  holes: [
    { x: 215.5, y: 69, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 226.5, y: 69, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 104.5, y: 121.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
    { x: 115.5, y: 121.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
  ],
  page: 36,
};

const hsVariant: FittingVariant = {
  id: 'aventos-hs-top-standard-servo-drive',
  name: 'AVENTOS HS top - wooden fronts, wide and narrow alu frames',
  summary: 'Up and over lift system; Standard or SERVO-DRIVE; lift mechanism chosen by KH and front weight FG.',
  choices: {
    drive: ['Standard', 'SERVO-DRIVE'],
    fixing: ['systemScrews', 'chipboardScrews'],
    cabinetHeightKH: hsRanges.map((r) => r[0]),
    frontWeightFG: hsRanges.map((r) => r[1]),
    frontType: ['Wooden fronts and wide alu frames', 'Narrow alu frames', 'Thin fronts (EXPANDO T)'],
  },
  parts: [
    ...hsRanges.flatMap(([kh, fg, sys, chip]) => [
      part('lift-mechanism-set', sys, `Lift mechanism set (2 symmetrical), system screws, KH ${kh}, FG ${fg} kg`, 34, { fixing: 'systemScrews', cabinetHeightKH: kh, frontWeightFG: fg }),
      part('lift-mechanism-set', chip, `Lift mechanism set (2 symmetrical), positioning system + 8 chipboard screws Ø4x35, KH ${kh}, FG ${fg} kg`, 34, { fixing: 'chipboardScrews', cabinetHeightKH: kh, frontWeightFG: fg }),
    ]),
    part('lever-arm-set', '22S3500', 'Lever arm set, 2 symmetrical lever arms, steel, nickel plated', 34),
    part('cover-cap-set', '22.8000', 'Cover cap set (left, right, 2 branding elements); SW | HGR | TGR | IN-G', 34, { drive: 'Standard' }),
    part('cover-cap-set', '23.8000', 'Cover cap set for SERVO-DRIVE: 2 switches, 6 distance bumpers Ø5; SW | HGR | TGR | IN-G', 34, { drive: 'SERVO-DRIVE' }),
    part('front-fixing-bracket', '20S4200', 'Front fixing bracket set, screw-on, wooden fronts and wide alu frames (2 brackets)', 34, { frontType: 'Wooden fronts and wide alu frames' }),
    part('front-fixing-bracket', '20S4200A', 'Front fixing bracket set, screw-on, narrow alu frames, incl. 8 x 660.0950', 34, { frontType: 'Narrow alu frames' }),
    part('front-fixing-bracket', '20S42T1', 'Front fixing bracket EXPANDO T, thin fronts (2x)', 34, { frontType: 'Thin fronts (EXPANDO T)' }, 2),
    part('screw', '609.1x00', 'Chipboard screws, 4 per side for wooden fronts', 34),
    part('screw', '660.0950', 'Countersunk self-tapping screws, 4 per side for wide alu frames', 34),
    ...servoDriveCommonParts(35, true).filter((x) => x.partNo !== '23.A000'),
    part('servo-drive-set', '23.A000', 'SERVO-DRIVE set: drive unit, 1500 mm distribution cable, connecting node, 2 end protectors; TGR', 34, { drive: 'SERVO-DRIVE' }),
  ],
  dims: {
    cabinetHeightKH: dim([350, 800], 'cabinet height KH range', 34, 'mm'),
    cabinetWidthKBMax: dim(1800, 'maximum cabinet width KB', 34, 'mm'),
    internalDepthLTMin: dim(264, 'minimum internal cabinet depth LT', 36, 'mm'),
    minLH: dim(307, 'minimum internal cabinet height LH', 36, 'mm'),
    minInternalHeightShown: dim('min 232', 'dimension shown in the side space-requirement drawing (reference unlabelled, unverified)', 36, 'mm'),
    frontWeightFGSelection: dim('KH and FG (incl. twice handle weight)', 'select lift mechanism from KH and front weight FG including twice the handle weight; example KH 600 mm, FG 10 kg -> 22S25x0', 34),
    thirdLiftMechanismFGIncrease: dim(50, 'front weight FG can be increased by 50 % with a third lift mechanism; recommended for wide cabinets to prevent sagging', 34),
    frontFixingBracketFixing: dim('4 screws per side', 'chipboard 609.1x00 (wooden) or countersunk 660.0950 (wide alu) per side', 34),
    zWooden: dim('195 + FAo', 'Z for wooden fronts and wide alu frames; FAo upper front overlay', 36),
    zNarrowAlu: dim('195.5 + FAo', 'Z for narrow alu frames; FAo upper front overlay', 36),
    frontAssembly32: dim('32 / 32 / 32', 'front fixing hole spacings shown on the wooden-front assembly view', 36, 'mm'),
    frontAssembly12_5: dim(12.5, 'front assembly dimension from the front edge as drawn', 36, 'mm'),
    narrowAluFixing: dim('31 / 33 / 31', 'front fixing spacings shown on the narrow alu front assembly', 36, 'mm'),
    cornice_F3_X: dim(31, 'X max with gap F = 3.0 mm (cornice | crown)', 36, 'mm'),
    cornice_F3_Y: dim(117, 'Y max with gap F = 3.0 mm', 36, 'mm'),
    cornice_F2_X: dim(29, 'X max with gap F = 2.0 mm', 36, 'mm'),
    cornice_F2_Y: dim(118, 'Y max with gap F = 2.0 mm', 36, 'mm'),
    cornice_F15_X: dim(27, 'X max with gap F = 1.5 mm', 36, 'mm'),
    cornice_F15_Y: dim(119, 'Y max with gap F = 1.5 mm', 36, 'mm'),
    wallApplicationMinGap: dim(5, 'minimum gap required in wall application', 36, 'mm'),
    sideFrontOverlayAlu19: dim([11, 18], 'side front overlay SFA possible for 19 mm frame width (narrow alu)', 36, 'mm'),
    narrowAluHingeDims: dim('R4 / 4.6 / 7.5 / 1.1* / Ø7 ±0.1 / 11.4 / 19-22 / max 7.5 / min 1.4 / 12.5', 'narrow alu frame machining dimensions as drawn on p. 36; reference edges not stated (unverified)', 36, 'mm'),
    systemHoleDepth: dim(11.5, 'minimum drilling depth of system-screw holes (Ø5)', 36, 'mm'),
    ...commonServoDims(37),
    servoSwitchPositionX: dim(38.5, 'SERVO-DRIVE Ø10 hole: X 38.5 (system and chipboard drawings); origin not clear (unverified)', 36, 'mm'),
    servoSwitchPositionY: dim(45, 'SERVO-DRIVE Ø10 hole: Y 45; origin not clear (unverified)', 36, 'mm'),
    spaceRequirementArc: dim('350 / 600 / 800', 'KH values 350, 600, 800 shown with the lift mechanism arc (140, 57, 277, 516, 707, 36, 39, 99 also drawn; their meaning is not stated in text - unverified)', 36, 'mm'),
  },
  drilling: [hsSystemRule, hsChipRule],
  notes: [
    'KH and FG ranges overlap (450-540 vs 480-660 vs 650-800); recommended: more powerful lift mechanism for overlapping areas, trial application at borderlines (p. 34).',
    'Part 22S2210 / 22S2200 covers both KH 350-450 and KH 450-540 (merged cell in the order table, p. 34).',
    'Lever arm set 22S3500 is the single printed lever arm set; one drive unit per set recommended for connected fronts (p. 34).',
    'EXPANDO T front fixing bracket suits thin fronts of 8 mm or more (p. 32).',
    'Thin-front details: see reference pages 596, 597 of the catalogue (outside this extraction).',
    ...SERVO_NOTES,
  ],
  pages: [32, 33, 34, 35, 36, 37],
};

// ==========================================================================================================
// AVENTOS HL top
// ==========================================================================================================
const hlLever: [string, string, string, string, number, number, number, number, number][] = [
  // set, KH, FG, LHmin, a, b, c, Y
  ['22L3200', '300-339', '1.50-9.00', '255', 112, 272.5, 155.5, 272.5, 113],
  ['22L3500', '340-389', '1.75-10.00', '295', 140.5, 340, 195, 340, 153],
  ['22L3800', '390-540', '2.00-12.25', '345', 176, 425, 245, 425, 203],
  ['22L3900', '480-580', '2.50-14.00', '399', 214.5, 517, 297.5, 517, 256],
];

const hlVariant: FittingVariant = {
  id: 'aventos-hl-top-standard-servo-drive',
  name: 'AVENTOS HL top - wooden fronts, wide and narrow alu frames',
  summary: 'Lift-up system for small one-part fronts; lift mechanism by KH, lever arm by KH and front weight FG.',
  choices: {
    drive: ['Standard', 'SERVO-DRIVE'],
    fixing: ['systemScrews', 'chipboardScrews'],
    cabinetHeightKH: ['300-389', '390-580'],
    leverArmSet: hlLever.map((l) => l[0]),
    frontType: ['Wooden fronts and wide alu frames', 'Narrow alu frames', 'Thin fronts (EXPANDO T)'],
  },
  parts: [
    part('lift-mechanism-set', '22L2210', 'Lift mechanism set (2 symmetrical), system screws, KH 300-389', 40, { fixing: 'systemScrews', cabinetHeightKH: '300-389' }),
    part('lift-mechanism-set', '22L2510', 'Lift mechanism set (2 symmetrical), system screws, KH 390-580', 40, { fixing: 'systemScrews', cabinetHeightKH: '390-580' }),
    part('lift-mechanism-set', '22L2200', 'Lift mechanism set (2 symmetrical), positioning system + 8 chipboard screws Ø4x35, KH 300-389', 40, { fixing: 'chipboardScrews', cabinetHeightKH: '300-389' }),
    part('lift-mechanism-set', '22L2500', 'Lift mechanism set (2 symmetrical), positioning system + 8 chipboard screws Ø4x35, KH 390-580', 40, { fixing: 'chipboardScrews', cabinetHeightKH: '390-580' }),
    ...hlLever.map(([set, kh, fg]) =>
      part('lever-arm-set', set, `Lever arm set steel: 2 lever arms, 2 cross stabiliser caps, adapter, length adapter; KH ${kh}, FG ${fg} kg incl. handle`, 40, { leverArmSet: set }),
    ),
    part('cover-cap-set', '22.8000', 'Cover cap set (left, right, 2 branding elements); SW | HGR | TGR | IN-G', 40, { drive: 'Standard' }),
    part('cover-cap-set', '23.8000', 'Cover cap set for SERVO-DRIVE: 2 switches, 6 distance bumpers Ø5; SW | HGR | TGR | IN-G', 40, { drive: 'SERVO-DRIVE' }),
    part('front-fixing-bracket', '20S4200', 'Front fixing bracket set, screw-on, wooden fronts and wide alu frames (2 brackets)', 40, { frontType: 'Wooden fronts and wide alu frames' }),
    part('front-fixing-bracket', '20S4200A', 'Front fixing bracket set, screw-on, narrow alu frames, incl. 8 x 660.0950', 40, { frontType: 'Narrow alu frames' }),
    part('front-fixing-bracket', '20S42T1', 'Front fixing bracket EXPANDO T, thin fronts (2x)', 40, { frontType: 'Thin fronts (EXPANDO T)' }, 2),
    part('cross-stabiliser-rod', '22Q1076U', 'Cross stabiliser rod, round, 1076 mm; cutting length = LW - 113 mm', 40),
    part('cross-stabiliser-connecting-set', '22Q080Z', 'Connecting piece set for cross stabiliser Ø20 zinc; cut length = LW/2 - 105; from LW >= 1190 and KB >= 1228', 40),
    part('screw', '609.1x00', 'Chipboard screws, 4 per side for wooden fronts', 40),
    part('screw', '660.0950', 'Countersunk self-tapping screws, 4 per side for wide alu frames', 40),
    ...servoDriveCommonParts(41, true).filter((x) => x.partNo !== '23.A000'),
    part('servo-drive-set', '23.A000', 'SERVO-DRIVE set: drive unit, 1500 mm distribution cable, connecting node, 2 end protectors; TGR', 40, { drive: 'SERVO-DRIVE' }),
  ],
  dims: {
    cabinetHeightKH: dim([300, 580], 'cabinet height KH range', 40, 'mm'),
    cabinetWidthKBMax: dim(1800, 'maximum cabinet width KB', 40, 'mm'),
    internalDepthLTMin: dim(264, 'minimum internal cabinet depth LT', 42, 'mm'),
    lever22L3200_FG: dim('1.50-9.00', 'front weight FG (kg incl. handle) for lever arm 22L3200, KH 300-339', 40, 'kg'),
    lever22L3500_FG: dim('1.75-10.00', 'front weight FG (kg) for lever arm 22L3500, KH 340-389', 40, 'kg'),
    lever22L3800_FG: dim('2.00-12.25', 'front weight FG (kg) for lever arm 22L3800, KH 390-540', 40, 'kg'),
    lever22L3900_FG: dim('2.50-14.00', 'front weight FG (kg) for lever arm 22L3900, KH 480-580', 40, 'kg'),
    ...Object.fromEntries(
      hlLever.flatMap(([set, , , lh, a, b, c, y, z]) => [
        [`minLH_${set}`, dim(Number(lh), `minimum internal cabinet height LH with lever arm ${set} (based on lower gap F = 0 mm)`, 42, 'mm')],
        [`a_${set}`, dim(a, `dimension a for ${set} (based on lower gap F = 0 mm)`, 42, 'mm')],
        [`b_${set}`, dim(b, `dimension b for ${set} (based on lower gap F = 0 mm)`, 42, 'mm')],
        [`c_${set}`, dim(c, `dimension c for ${set}`, 42, 'mm')],
        [`Ymax_${set}`, dim(y, `Y for ${set} (based on top gap F = 0 mm)`, 42, 'mm')],
        [`Z_wood_${set}`, dim(`${z} + FAo`, `Z for wooden fronts and wide alu, lever arm ${set}; FAo upper front overlay`, 42)],
        [`Z_narrowAlu_${set}`, dim(`${z + 0.5} + FAo`, `Z for narrow alu frames, lever arm ${set}`, 42)],
      ]),
    ),
    cornice_SOB16_X: dim(25, 'X for top panel thickness SOB 16 (cornice | crown)', 42, 'mm'),
    cornice_SOB17_X: dim(26, 'X for SOB 17', 42, 'mm'),
    cornice_SOB18_X: dim(27, 'X for SOB 18', 42, 'mm'),
    cornice_SOB19_X: dim(28, 'X for SOB 19', 42, 'mm'),
    cornice_SOB20_X: dim(29, 'X for SOB 20', 42, 'mm'),
    frontAssembly32: dim('32 / 32 / 32', 'front fixing spacings on the wooden front assembly view', 42, 'mm'),
    frontAssembly12_5: dim(12.5, 'front assembly dimension from the front edge as drawn', 42, 'mm'),
    narrowAluFixing: dim('31 / 33 / 31', 'front fixing spacings shown on the narrow alu front assembly', 42, 'mm'),
    wallApplicationMinGap: dim(5, 'minimum gap required in wall application', 42, 'mm'),
    sideFrontOverlayAlu19: dim([11, 18], 'side front overlay SFA possible for 19 mm frame width', 42, 'mm'),
    spaceRequirementSide: dim('141 / 4 / 36 / 30 / 66 / min 56 / min 264', 'dimensions shown on the space-requirement drawing (141, 4, 36, 30, 66, min 56, min 264); reference edges not stated in text (unverified except min 264 = internal depth)', 42, 'mm'),
    crossStabiliserRodLength: dim('LW - 113', 'cross stabiliser rod cutting length; LW internal cabinet width (22Q1076U)', 40, 'mm'),
    crossStabiliserRodCatalogLength: dim(1076, 'length of 22Q1076U rod before cutting', 40, 'mm'),
    connectingPieceRodLength: dim('LW / 2 - 105', 'rod cutting length with connecting piece set 22Q080Z; required from LW >= 1190 and KB >= 1228', 40, 'mm'),
    connectingPieceMinLW: dim(1190, 'internal cabinet width LW from which a connecting piece is used', 40, 'mm'),
    connectingPieceMinKB: dim(1228, 'cabinet width KB from which a connecting piece is used', 40, 'mm'),
    connectingPieceHole: dim('min Ø22; 54.5; 22.5', 'connecting piece hole in the cabinet centre: min Ø22, positions 54.5 and 22.5 as drawn (references not stated, unverified); 75 and LW/2, KB/2 positions', 43, 'mm'),
    systemHoleDepth: dim(11.5, 'minimum drilling depth of system-screw holes (Ø5)', 42, 'mm'),
    ...commonServoDims(43),
    servoSwitchPositionX: dim(38.5, 'SERVO-DRIVE Ø10 hole: X 38.5; origin not clear (unverified)', 42, 'mm'),
    servoSwitchPositionY: dim(71, 'SERVO-DRIVE Ø10 hole: Y 71; origin not clear (unverified)', 42, 'mm'),
  },
  drilling: [
    {
      id: 'hl-lift-system-screws',
      target: 'carcass-side',
      label: 'Lift mechanism fixing, system screws',
      reference:
        'x from the front edge of the cabinet side panel; y down from the top edge of the side panel inside the cabinet (127 total = 63 + 64). Ø5 holes, depth min 11.5.',
      holes: [
        { x: 101, y: 63, diameter: 5, depth: 11.5 },
        { x: 229, y: 63, diameter: 5, depth: 11.5 },
        { x: 101, y: 127, diameter: 5, depth: 11.5 },
        { x: 229, y: 127, diameter: 5, depth: 11.5 },
      ],
      page: 42,
    },
    {
      id: 'hl-lift-chipboard-screws',
      target: 'carcass-side',
      label: 'Lift mechanism fixing, chipboard screws with positioning system',
      reference:
        'x from the front edge of the side panel; y down from the top edge of the side panel inside the cabinet (125.5 total = 62.5 + 63). Upper row y = 62.5 pair at x 91.5 and 102.5; lower row y = 125.5 pair at x 215.5 (91.5 + 124) and 226.5. Chipboard screws Ø4 x 35 (pilot Ø not published).',
      holes: [
        { x: 91.5, y: 62.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
        { x: 102.5, y: 62.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
        { x: 215.5, y: 125.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
        { x: 226.5, y: 125.5, diameter: 4, note: 'screw Ø4; pilot Ø not published' },
      ],
      page: 42,
    },
  ],
  notes: [
    'Lift mechanism is selected by KH only (22L2x10 / 22L2x00); the lever arm set is chosen by KH and front weight FG incl. handle (p. 40).',
    'Cross stabiliser required; rod length = LW - 113 mm, or with connecting piece set LW/2 - 105 mm from LW >= 1190 mm and KB >= 1228 mm (p. 40).',
    'Lever arm set KH ranges overlap (22L3800 390-540 and 22L3900 480-580).',
    'Lever arm set contents: 2 symmetrical lever arms, 2 cross stabiliser cover caps, adapter for rod, length adapter (p. 40).',
    'EXPANDO T front fixing bracket suits thin fronts of 8 mm or more (p. 38).',
    ...SERVO_NOTES,
  ],
  pages: [38, 39, 40, 41, 42, 43],
};

// ==========================================================================================================
export const aventosA: FittingFamily[] = [
  {
    id: 'aventos-hki',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HKi',
    summary: 'Integrated stay lift in the cabinet side; BLUMOTION, optional TIP-ON; KH max 600 mm.',
    variants: [hkiVariant],
    document: DOC,
    pages: [12, 13, 14, 15, 16, 17, 18],
  },
  {
    id: 'aventos-hf-top',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HF top',
    summary: 'Bi-fold lift system, KH 480-1200 mm, Standard or SERVO-DRIVE.',
    variants: [hfWood, hfNarrow],
    document: DOC,
    pages: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
  },
  {
    id: 'aventos-hs-top',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HS top',
    summary: 'Up and over lift system, KH 350-800 mm, Standard or SERVO-DRIVE.',
    variants: [hsVariant],
    document: DOC,
    pages: [32, 33, 34, 35, 36, 37],
  },
  {
    id: 'aventos-hl-top',
    kind: 'lift',
    brand: 'Blum',
    name: 'AVENTOS HL top',
    summary: 'Lift up system, KH 300-580 mm, Standard or SERVO-DRIVE.',
    variants: [hlVariant],
    document: DOC,
    pages: [38, 39, 40, 41, 42, 43],
  },
];
