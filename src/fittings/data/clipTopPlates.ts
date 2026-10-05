// CLIP top / CLIP top BLUMOTION: angled applications (printed pp. 126-149), mounting plates (pp. 150-155),
// angled spacers (p. 156) and hinge accessories (pp. 157-161). Transcribed from the Blum catalogue 2024/2025.
import type {
  DimSpec,
  DrillingRule,
  FittingFamily,
  FittingVariant,
  PartNumber,
} from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';

function part(
  role: string,
  partNo: string,
  description: string,
  page: number,
  when?: Record<string, string | number>,
  qty?: number,
): PartNumber {
  const p: PartNumber = { role, partNo, description, page };
  if (when) p.when = when;
  if (qty !== undefined) p.qty = qty;
  return p;
}

function dim(value: DimSpec['value'], meaning: string, page: number, unit?: DimSpec['unit']): DimSpec {
  const d: DimSpec = { value, meaning, page };
  if (unit) d.unit = unit;
  return d;
}

/** Plate part number by spacing, as printed on pp. 150-155 (the height H is 8.5 + spacing). */
type PlateRef = readonly [spacingMm: number, partNo: string];
type SpacerRef = readonly [partNo: string, spacingMm: number, wedgeDeg: 5 | -5, qty?: number];

interface AngledConfig {
  no: number;
  /** Angle WA printed in the Nº tag. */
  wa: number;
  plate: PlateRef;
  spacer?: SpacerRef;
}

const TIP_ON_NOTE = 'TIP-ON for doors: ■ standard spring, ■■ strong spring; ● hinge with spring, ○ unsprung hinge.';

function tipOn(page: number, includeShort = true): PartNumber[] {
  const out: PartNumber[] = [];
  if (includeShort) {
    out.push(
      part('tip-on', '956.1004', 'TIP-ON short, standard spring, unsprung hinge', page, { tipOn: 'short', hingeSpring: 'unsprung' }),
      part('tip-on', '956A1004', 'TIP-ON extended, standard spring, unsprung hinge', page, { tipOn: 'extended', hingeSpring: 'unsprung' }),
    );
  }
  out.push(
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring, sprung hinge', page, { tipOn: 'extended', hingeSpring: 'sprung' }),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring, sprung hinge', page, { tipOn: 'extended-strong', hingeSpring: 'sprung' }),
  );
  return out;
}

function screws(page: number): PartNumber[] {
  return [
    part('screw', '609.1500', 'Chipboard screw Ø3.5 x 15 mm', page),
    part('screw', '609.1700', 'Chipboard screw Ø3.5 x 17 mm', page),
  ];
}

function configParts(configs: AngledConfig[], page: (no: number) => number): PartNumber[] {
  const out: PartNumber[] = [];
  for (const c of configs) {
    out.push(part('plate', c.plate[1], `Mounting plate, spacing ${c.plate[0]} mm`, page(c.no), { config: c.no }));
    if (c.spacer) {
      out.push(
        part(
          'angled-spacer',
          c.spacer[0],
          `Angled spacer ${c.spacer[1]} mm, ${c.spacer[2] > 0 ? '+5' : '-5'} deg`,
          page(c.no),
          { config: c.no },
          c.spacer[3] ?? 1,
        ),
      );
    }
  }
  return out;
}

function configDims(configs: AngledConfig[], page: (no: number) => number): Record<string, DimSpec> {
  const out: Record<string, DimSpec> = {};
  for (const c of configs) {
    const sp = c.spacer
      ? `; angled spacer ${c.spacer[0]} (${c.spacer[1]} mm, ${c.spacer[2] > 0 ? '+5' : '-5'} deg${c.spacer[3] ? `, ${c.spacer[3]}x` : ''})`
      : '; no angled spacer';
    out[`config${c.no}`] = dim(
      `WA ${c.wa} deg: plate ${c.plate[1]} (spacing ${c.plate[0]} mm)${sp}`,
      `Nº ${c.no}: wall angle WA and the mounting plate / angled spacer combination printed for it`,
      page(c.no),
    );
  }
  return out;
}

const bossDrilling = (page: number): DrillingRule[] => [
  {
    id: 'door-cup-screw-on',
    target: 'door',
    label: 'Hinge cup hole, screw-on boss',
    reference:
      'Hole centre; drawn at 3-7 mm clear distance from the door edge (edge of the hole to the edge of the door), as printed on the "Screw-on" plan view',
    holes: [{ x: 0, y: 0, diameter: 35, note: 'cup hole; the two + marks beside it are screw positions with no dimensions printed' }],
    page,
  },
  {
    id: 'door-cup-inserta',
    target: 'door',
    label: 'Hinge cup hole and two dowel holes, INSERTA boss',
    reference:
      'Origin at the cup hole centre. Both Ø8 holes lie 9.5 mm from the cup centre line (on the side drawn below the cup, direction not otherwise labelled) and 45 mm apart (centre to centre, symmetric about the cup centre as drawn)',
    holes: [
      { x: 0, y: 0, diameter: 35, note: 'tolerance +0.2 / 0' },
      { x: -22.5, y: 9.5, diameter: 8, note: 'Ø8 ±0.1; x symmetric about cup centre is read from the drawing, 45 mm spacing printed; y direction unverified' },
      { x: 22.5, y: 9.5, diameter: 8, note: 'Ø8 ±0.1' },
    ],
    page,
  },
];

function bossDims(page: number, bt: boolean, depthPage = page): Record<string, DimSpec> {
  const o: Record<string, DimSpec> = {
    cupDiameter: dim(35, 'Hinge cup hole diameter in the front (screw-on and INSERTA; INSERTA tolerance +0.2/0)', page, 'mm'),
    cupEdgeDistance: dim('3-7', 'Clear distance from the edge of the cup hole to the door edge (printed as 3-7)', page, 'mm'),
    insertaDowelDiameter: dim('8 +-0.1', 'INSERTA additional dowel holes in the front', page, 'mm'),
    insertaDowelSpacing: dim(45, 'INSERTA: spacing between the two Ø8 holes', page, 'mm'),
    insertaDowelOffset: dim(9.5, 'INSERTA: offset of the Ø8 hole line from the cup hole centre line', page, 'mm'),
  };
  if (bt) {
    o.cupDepthBlumotion = dim('min 13', 'Cup hole depth dimension printed on the plan/section of the screw-on drawing, B = CLIP top BLUMOTION (read as depth)', depthPage, 'mm');
    o.cupDepthClipTop = dim('min 12.3', 'Same dimension for T = CLIP top', depthPage, 'mm');
  } else {
    o.cupDepth = dim('min 13', 'Cup hole depth dimension printed on the screw-on and INSERTA section views (read as depth)', depthPage, 'mm');
  }
  return o;
}

interface StdOpts {
  id: string;
  name: string;
  summary: string;
  webCode: string;
  opening: number;
  hinges: { boss: 'INSERTA' | 'screw-on'; type: 'CLIP top BLUMOTION' | 'CLIP top'; spring: boolean; partNo: string; colour: string }[];
  caps: [string, string][]; // [partNo, description]
  bossCaps: [string, string, string][]; // [partNo, hingeType, colours]
  configs: AngledConfig[];
  adjust: [string, string, string];
  pages: number[];
  configPage: (no: number) => number;
  /** Page carrying the order information and accessories. */
  orderPage: number;
  bossPage: number;
  withBT: boolean;
  tipShort: boolean;
  extra?: Record<string, DimSpec>;
  notes?: string[];
}

function std(o: StdOpts): FittingVariant {
  const parts: PartNumber[] = [];
  for (const h of o.hinges) {
    parts.push(
      part(
        'hinge',
        h.partNo,
        `${h.type} ${h.spring ? 'sprung' : 'unsprung'}, ${h.boss}, ${h.colour}`,
        o.orderPage,
        { boss: h.boss, hingeType: h.type, hingeSpring: h.spring ? 'sprung' : 'unsprung' },
      ),
    );
  }
  for (const c of o.caps) parts.push(part('hinge-arm-cover-cap', c[0], c[1], o.orderPage));
  for (const b of o.bossCaps) parts.push(part('hinge-boss-cover-cap', b[0], `Hinge boss cover cap for ${b[1]}, ${b[2]}`, o.orderPage, { hingeType: b[1] }));
  parts.push(...tipOn(o.orderPage, o.tipShort));
  parts.push(...screws(o.orderPage));
  parts.push(...configParts(o.configs, o.configPage));
  const was = Array.from(new Set(o.configs.map((c) => c.wa)));
  const dims: Record<string, DimSpec> = {
    openingAngle: dim(o.opening, 'Hinge opening angle', o.pages[0], 'deg'),
    adjustmentHeight: dim(o.adjust[0], 'First adjustment icon (height, see mounting plates for the actual range), maximum', o.bossPage, 'mm'),
    adjustmentIcon2: dim(o.adjust[1], 'Second adjustment icon (arrow direction as printed; axis name not printed in text)', o.bossPage, 'mm'),
    adjustmentIcon3: dim(o.adjust[2], 'Third adjustment icon (arrow direction as printed; axis name not printed in text)', o.bossPage, 'mm'),
    ...bossDims(o.bossPage, o.withBT),
    ...configDims(o.configs, o.configPage),
    ...(o.extra ?? {}),
  };
  return {
    id: o.id,
    name: o.name,
    summary: o.summary,
    choices: {
      boss: ['INSERTA', 'screw-on'],
      hingeType: ['CLIP top BLUMOTION', 'CLIP top'],
      wallAngleDeg: was,
      config: o.configs.map((c) => c.no),
      colour: ['NI'],
    },
    parts,
    dims,
    drilling: bossDrilling(o.bossPage),
    notes: [
      `Web code ${o.webCode}.`,
      'CLIP top BLUMOTION and CLIP top hinges cannot be combined with each other on a door.',
      'Dimensions are for the factory setting; with deviations a trial is recommended and some applications require the mounting plate to be moved from the standard fixing positions.',
      TIP_ON_NOTE,
      'Each Nº tag identifies one hinge arm / angle application; choose the configuration (Nº) that matches the hinge arm and wall angle WA. Per-Nº geometry callouts in the diagrams (hinge extents, door offsets) are not transcribed. unverified: those callouts and the min. screw length icons (min. 20/25/30) shown beside each Nº.',
      ...(o.notes ?? []),
    ],
    pages: o.pages,
  };
}

const ADJ_STD: [string, string, string] = ['±3.0', '±2.0', '±2.0'];

// ---------------------------------------------------------------------------------------------
// Angled application - standard (pp. 126-145)
// ---------------------------------------------------------------------------------------------

const plus45II = std({
  id: 'clip-top-angled-plus45-ii',
  name: '+45° II angled hinge, overlay application (110°)',
  summary: 'Angled hinge for corner cabinets with flush fronts; Nº 24 (45 deg), Nº 9 (45 deg), Nº 10 (50 deg).',
  webCode: 'DQDRYM',
  opening: 110,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3598', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3558', colour: 'NI or ONS' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78T3558', colour: 'NI' },
  ],
  caps: [
    ['70.1503', 'Hinge arm cover cap, plain, NI or ONS'],
    ['70.1503.BP', 'Hinge arm cover cap, Blum stamped, NI or ONS'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI or ONS'],
    ['70T3504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 24, wa: 45, plate: [18, '175H7190.22'] },
    { no: 9, wa: 45, plate: [0, '173H7100'] },
    { no: 10, wa: 50, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  ],
  adjust: ['±3.0', '±1.8', '±2.0'],
  pages: [126, 127],
  configPage: () => 127,
  orderPage: 126,
  bossPage: 127,
  withBT: false,
  tipShort: true,
  extra: {
    frontWidthFB: dim('LW - 5.4', 'Corner cabinet: front width FB from internal cabinet width LW (p. 126 plan view)', 126, 'mm'),
    cornerCabinetCallouts: dim(
      [19, 32.5, 66.5, 37, 5, 3, 2.5, 14, 7.1, 5, 2.7],
      'Unlabelled callouts of the corner cabinet section drawing (19 = panel thickness drawn; others not resolved to a named meaning)',
      126,
    ),
    hingeBossBoss: dim('57 x 37.5 (43 INSERTA) x 3.2 (6.4 INSERTA)', 'Hinge boss dimensions: width x length x height of the boss recess; value in brackets for INSERTA', 127, 'mm'),
  },
  notes: ['unverified: meaning of the numeric callouts on the corner cabinet drawing (p. 126); the page names only FB and LW.'],
});

const plus45III = std({
  id: 'clip-top-angled-plus45-iii',
  name: '+45° III angled hinge, maximum overlay application (95°)',
  summary: 'Nº 108/8/43/109 at 40 deg, Nº 44 at 45 deg, Nº 45 at 50 deg.',
  webCode: 'DQDSNY',
  opening: 95,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9498', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9458', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78A9458.T', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T1504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 108, wa: 40, plate: [9, '175H7190'], spacer: ['171A5040', 3, 5] },
    { no: 8, wa: 40, plate: [6, '175H9160'], spacer: ['171A5500', 6, -5] },
    { no: 43, wa: 40, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 109, wa: 40, plate: [9, '175H7190'], spacer: ['171A5010', 0.8, 5] },
    { no: 44, wa: 45, plate: [6, '175H9160'] },
    { no: 45, wa: 50, plate: [0, '173H7100'], spacer: ['171A5070', 6, 5] },
  ],
  adjust: ADJ_STD,
  pages: [128, 129],
  configPage: (n) => (n === 108 || n === 8 || n === 43 ? 128 : 129),
  orderPage: 128,
  bossPage: 129,
  withBT: true,
  tipShort: true,
  extra: {
    hingeBossBoss: dim('B 57 x 37.5 (43 INSERTA) x 3.2 (6.4 INSERTA); T 57 x 37 x 3.2', 'Hinge boss dimensions: width x length x height; B = CLIP top BLUMOTION, T = CLIP top', 129, 'mm'),
  },
  notes: [
    'Nº 108 and Nº 109: the angle wedge is installed rotated by 180 deg (arrow points to the cabinet).',
  ],
});

const plus30II = std({
  id: 'clip-top-angled-plus30-ii',
  name: '+30° II angled hinge, overlay application (95°)',
  summary: 'Wall angles 25, 30 and 35 deg.',
  webCode: 'DQDTDA',
  opening: 95,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9596', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9556', colour: 'NI or ONS' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78A9556.T', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI or ONS'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI or ONS'],
    ['70T1504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 20, wa: 25, plate: [9, '175H7190'], spacer: ['171A5500', 6, -5] },
    { no: 50, wa: 25, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 57, wa: 25, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 21, wa: 30, plate: [18, '175H7190.22'] },
    { no: 51, wa: 30, plate: [9, '175H7190'] },
    { no: 6, wa: 30, plate: [0, '173H7100'] },
    { no: 58, wa: 30, plate: [3, '173H7130'] },
    { no: 22, wa: 35, plate: [18, '175H7190.22'], spacer: ['171A5010', 0.8, 5] },
    { no: 52, wa: 35, plate: [0, '173H7100'], spacer: ['171A5070', 6, 5] },
    { no: 7, wa: 35, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
    { no: 59, wa: 35, plate: [0, '173H7100'], spacer: ['171A5040', 3, 5] },
  ],
  adjust: ['±3.0', '±1.8', '±2.0'],
  pages: [130, 131, 133],
  configPage: (n) => (n === 20 || n === 50 || n === 57 ? 130 : 131),
  orderPage: 130,
  bossPage: 133,
  withBT: false,
  tipShort: true,
  notes: ['Hinge boss fixing details are referenced to p. 133 on p. 131.', 'unverified: p. 131 has no hinge boss strip of its own; boss dimensions here are those of the +30 III page (p. 133) to which p. 131 refers.'],
});

const plus30III = std({
  id: 'clip-top-angled-plus30-iii',
  name: '+30° III angled hinge, maximum overlay application (95°)',
  summary: 'Nº 40 (25 deg), Nº 41 (30 deg), Nº 42 (35 deg).',
  webCode: 'DQDU2M',
  opening: 95,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9496', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9456', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78A9456.T', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T1504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 40, wa: 25, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 41, wa: 30, plate: [6, '175H9160'] },
    { no: 42, wa: 35, plate: [0, '173H7100'], spacer: ['171A5070', 6, 5] },
  ],
  adjust: ADJ_STD,
  pages: [132, 133],
  configPage: () => 132,
  orderPage: 132,
  bossPage: 133,
  withBT: true,
  tipShort: true,
  extra: {
    hingeBossBoss: dim('B 57 x 37.5 (43 INSERTA) x 3.2 (6.4 INSERTA); T 57 x 37 x 3.2', 'Hinge boss dimensions: width x length x height; B = CLIP top BLUMOTION, T = CLIP top', 133, 'mm'),
  },
});

const plus20II = std({
  id: 'clip-top-angled-plus20-ii',
  name: '+20° II angled hinge, overlay application (95°)',
  summary: 'Wall angles 15, 20 and 25 deg.',
  webCode: 'DQDURY',
  opening: 95,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9595', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9555', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78A9555.T', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T1504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 18, wa: 15, plate: [9, '175H7190'], spacer: ['171A5500', 6, -5] },
    { no: 48, wa: 15, plate: [3, '173H7130'], spacer: ['171A5500', 6, -5] },
    { no: 55, wa: 15, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 19, wa: 20, plate: [18, '175H7190.22'] },
    { no: 49, wa: 20, plate: [9, '175H7190'] },
    { no: 4, wa: 20, plate: [0, '173H7100'] },
    { no: 56, wa: 20, plate: [6, '175H9160'] },
    { no: 5, wa: 25, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  ],
  adjust: ['±3.0', '±1.8', '±2.0'],
  pages: [134, 135],
  configPage: (n) => (n === 18 || n === 48 || n === 55 ? 134 : 135),
  orderPage: 134,
  bossPage: 135,
  withBT: true,
  tipShort: true,
});

const plus15III = std({
  id: 'clip-top-angled-plus15-iii',
  name: '+15° III angled hinge, maximum overlay application (95°)',
  summary: 'Wall angles 10, 15 and 20 deg.',
  webCode: 'DQDVHA',
  opening: 95,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9494', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B9454', colour: 'NI or ONS' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78A9454.T', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI or ONS'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI or ONS'],
    ['70T1504', 'CLIP top', 'NI or ONS'],
  ],
  configs: [
    { no: 17, wa: 10, plate: [18, '175H7190.22'], spacer: ['171A5500', 6, -5] },
    { no: 47, wa: 10, plate: [18, '175H7190.22'], spacer: ['171A5500', 6, -5] },
    { no: 2, wa: 10, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 37, wa: 10, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 3, wa: 15, plate: [9, '175H7190'] },
    { no: 38, wa: 15, plate: [6, '175H9160'] },
    { no: 39, wa: 20, plate: [0, '173H7100'], spacer: ['171A5070', 6, 5] },
  ],
  adjust: ADJ_STD,
  pages: [136, 137],
  configPage: (n) => (n === 17 || n === 47 || n === 2 ? 136 : 137),
  orderPage: 136,
  bossPage: 137,
  withBT: true,
  tipShort: true,
  notes: ['Nº 55 and Nº 56 (15/20 deg) of the +20 II variant are cross-referenced on p. 136 overview; their plates are on pp. 134-135.'],
});

const pm5: AngledConfig[] = [
  { no: 15, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 35, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 16, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 46, wa: 5, plate: [0, '173H7100'], spacer: ['171A5070', 6, 5] },
  { no: 1, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 36, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
];

const pm5Parts: PartNumber[] = [];
const pm5Apps: [string, string, string, string, string, string, string][] = [
  // application, INSERTA BLUMOTION, INSERTA CLIP top sprung, INSERTA unsprung, screw BLUMOTION, screw CLIP sprung, screw CLIP unsprung
  ['overlay', '71B9590', '71T9590B', '70T9590BTL', '71B9550', '71T9550', '70T9550.TL'],
  ['dual', '71B9690', '71T9690B', '', '71B9650', '71T9650', '70T9650.TL'],
  ['inset', '71B9790', '71T9790B', '', '71B9750', '71T9750', '70T9750.TL'],
];
for (const [app, ib, ic, iu, sb, sc, su] of pm5Apps) {
  pm5Parts.push(part('hinge', ib, `CLIP top BLUMOTION sprung, INSERTA, ${app}, NI`, 138, { application: app, boss: 'INSERTA', hingeType: 'CLIP top BLUMOTION' }));
  pm5Parts.push(part('hinge', ic, `CLIP top sprung, INSERTA, ${app}, NI`, 138, { application: app, boss: 'INSERTA', hingeType: 'CLIP top', hingeSpring: 'sprung' }));
  if (iu) pm5Parts.push(part('hinge', iu, `CLIP top unsprung, INSERTA, ${app}, NI`, 138, { application: app, boss: 'INSERTA', hingeType: 'CLIP top', hingeSpring: 'unsprung' }));
  pm5Parts.push(part('hinge', sb, `CLIP top BLUMOTION sprung, screw-on, ${app}, NI`, 138, { application: app, boss: 'screw-on', hingeType: 'CLIP top BLUMOTION' }));
  pm5Parts.push(part('hinge', sc, `CLIP top sprung, screw-on, ${app}, NI`, 138, { application: app, boss: 'screw-on', hingeType: 'CLIP top', hingeSpring: 'sprung' }));
  pm5Parts.push(part('hinge', su, `CLIP top unsprung, screw-on, ${app}, NI`, 138, { application: app, boss: 'screw-on', hingeType: 'CLIP top', hingeSpring: 'unsprung' }));
}
pm5Parts.push(
  part('hinge-arm-cover-cap', '70.1553', 'Cover cap, plain, NI (overlay application)', 138, { application: 'overlay' }),
  part('hinge-arm-cover-cap', '70.1553.BP', 'Cover cap, Blum stamped, NI (overlay application)', 138, { application: 'overlay' }),
  part('hinge-arm-cover-cap', '70.1663', 'Cover cap, plain, NI (dual and inset application)', 138, { application: 'dual' }),
  part('hinge-arm-cover-cap', '70.1663.BP', 'Cover cap, Blum stamped, NI (dual and inset application)', 138, { application: 'dual' }),
  part('hinge-arm-cover-cap', '70.1663', 'Cover cap, plain, NI (inset application)', 138, { application: 'inset' }),
  part('hinge-arm-cover-cap', '70.1663.BP', 'Cover cap, Blum stamped, NI (inset application)', 138, { application: 'inset' }),
  part('hinge-boss-cover-cap', '70T3504', 'Hinge boss cover cap, CLIP top BLUMOTION, NI', 138, { hingeType: 'CLIP top BLUMOTION' }),
  part('hinge-boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI', 138, { hingeType: 'CLIP top' }),
  ...tipOn(138),
  ...screws(138),
  ...configParts(pm5, () => 139),
);

const pm5Variant: FittingVariant = {
  id: 'clip-top-angled-plusminus5',
  name: '±5° angled application (95°)',
  summary: 'Overlay, dual and inset applications with -5 and +5 deg wall angles.',
  choices: {
    application: ['overlay', 'dual', 'inset'],
    boss: ['INSERTA', 'screw-on'],
    hingeType: ['CLIP top BLUMOTION', 'CLIP top'],
    wallAngleDeg: [-5, 5],
    config: [15, 35, 16, 46, 1, 36],
  },
  parts: pm5Parts,
  dims: {
    openingAngle: dim(95, 'Hinge opening angle', 138, 'deg'),
    adjustmentHeight: dim('±3.0', 'First adjustment icon (height, see mounting plates), maximum', 139, 'mm'),
    adjustmentIcon2: dim('±2.0', 'Second adjustment icon', 139, 'mm'),
    adjustmentIcon3: dim('+3.0 / -2.0', 'Third adjustment icon (plus and minus directions as printed)', 139, 'mm'),
    ...bossDims(139, true),
    hingeBossBossB: dim('57 x 37.5 (43 INSERTA) x 3.2 (6.4 INSERTA)', 'Hinge boss dimensions for B = CLIP top BLUMOTION: width x length x height', 139, 'mm'),
    hingeBossBossT: dim('57 (65) x 37 (40.5) x 3.2 (7)', 'Hinge boss dimensions for T = CLIP top: width x length x height; values in brackets as printed in the bracketed (INSERTA) column', 139, 'mm'),
    ...configDims(pm5, () => 139),
    arm15: dim('cranked hinge arm', 'Nº 15 uses the cranked arm', 139),
    arm35: dim('straight hinge arm', 'Nº 35 uses the straight arm', 139),
    arm16: dim('double cranked hinge arm', 'Nº 16 uses the double cranked arm', 139),
    arm46: dim('cranked hinge arm', 'Nº 46 uses the cranked arm', 139),
    arm1: dim('straight hinge arm', 'Nº 1 uses the straight arm', 139),
    arm36: dim('straight hinge arm', 'Nº 36 uses the straight arm', 139),
  },
  drilling: bossDrilling(139),
  notes: [
    'Web code DQDW6M.',
    'Overlay application: cover cap 70.1553 series; dual and inset: 70.1663 series (double cranked arm).',
    'CLIP top BLUMOTION and CLIP top hinges cannot be combined with each other on a door.',
    'BLUMOTION for doors is referenced to p. 176.',
    TIP_ON_NOTE,
    'unverified: which of the ±5 diagrams use B versus T values beyond the legend; per-Nº geometry callouts not transcribed.',
  ],
  pages: [138, 139],
};

const minus15III = std({
  id: 'clip-top-angled-minus15-iii',
  name: '-15° III angled hinge, maximum overlay application (110°)',
  summary: 'Wall angles -20, -15, -10 deg.',
  webCode: 'DQDWVY',
  opening: 110,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3493', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3453', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78T3453', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T3504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 12, wa: -20, plate: [6, '175H9160'], spacer: ['171A5500', 6, -5] },
    { no: 32, wa: -20, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 13, wa: -15, plate: [18, '175H7190.22'] },
    { no: 33, wa: -15, plate: [0, '173H7100'] },
    { no: 14, wa: -10, plate: [9, '175H7190'], spacer: ['171A5070', 6, 5] },
    { no: 34, wa: -10, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  ],
  adjust: ADJ_STD,
  pages: [140, 141],
  configPage: (n) => (n === 12 || n === 32 || n === 13 ? 140 : 141),
  orderPage: 140,
  bossPage: 141,
  withBT: false,
  tipShort: true,
});

const minus30III = std({
  id: 'clip-top-angled-minus30-iii',
  name: '-30° III angled hinge, maximum overlay application (110°)',
  summary: 'Wall angles -35, -30, -25 deg.',
  webCode: 'DQDXLA',
  opening: 110,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3491', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3451', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78T3451', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T3504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 29, wa: -35, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 30, wa: -30, plate: [3, '173H7130'] },
    { no: 11, wa: -25, plate: [9, '175H7190'], spacer: ['171A5070', 6, 5] },
    { no: 31, wa: -25, plate: [0, '173H7100'], spacer: ['171A5040', 3, 5] },
  ],
  adjust: ADJ_STD,
  pages: [142, 143],
  configPage: (n) => (n === 31 ? 143 : 142),
  orderPage: 142,
  bossPage: 143,
  withBT: false,
  tipShort: true,
});

const minus45III = std({
  id: 'clip-top-angled-minus45-iii',
  name: '-45° III angled hinge, maximum overlay application (110°)',
  summary: 'Wall angles -50, -45, -40 deg.',
  webCode: 'DQDYAM',
  opening: 110,
  hinges: [
    { boss: 'INSERTA', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3490', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top BLUMOTION', spring: true, partNo: '79B3450', colour: 'NI' },
    { boss: 'screw-on', type: 'CLIP top', spring: false, partNo: '78T3450', colour: 'NI' },
  ],
  caps: [
    ['70.1553', 'Hinge arm cover cap, plain, NI'],
    ['70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI'],
  ],
  bossCaps: [
    ['70T3504', 'CLIP top BLUMOTION', 'NI'],
    ['70T3504', 'CLIP top', 'NI'],
  ],
  configs: [
    { no: 26, wa: -50, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
    { no: 27, wa: -45, plate: [3, '173H7130'] },
    { no: 28, wa: -40, plate: [0, '173H7100'], spacer: ['171A5040', 3, 5] },
  ],
  adjust: ADJ_STD,
  pages: [144, 145],
  configPage: () => 144,
  orderPage: 144,
  bossPage: 145,
  withBT: false,
  tipShort: true,
});

// ---------------------------------------------------------------------------------------------
// Thin doors and CRISTALLO (pp. 146-149)
// ---------------------------------------------------------------------------------------------

const thinConfigs: AngledConfig[] = [
  { no: 114, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 110, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 115, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 111, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 116, wa: 10, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 2] },
  { no: 112, wa: 10, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 2] },
  { no: 117, wa: 15, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 3] },
  { no: 113, wa: 15, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 3] },
];
const thinPage = (n: number): number => (n === 114 || n === 110 || n === 115 ? 146 : 147);

const thinVariant: FittingVariant = {
  id: 'clip-top-angled-thin-door',
  name: 'Hinge for thin doors, angled application (110°, EXPANDO T)',
  summary: 'Fronts 8-14 mm; Nº 114-117 standard arm, Nº 110-113 0-protrusion arm.',
  choices: {
    hingeType: ['CLIP top BLUMOTION', 'CLIP top'],
    wallAngleDeg: [-5, 5, 10, 15],
    config: thinConfigs.map((c) => c.no),
    colour: ['NI'],
  },
  parts: [
    part('hinge', '71B453T', 'CLIP top BLUMOTION sprung, EXPANDO T, NI', 146, { hingeType: 'CLIP top BLUMOTION' }),
    part('hinge', '71T453T', 'CLIP top sprung, EXPANDO T, NI', 146, { hingeType: 'CLIP top', hingeSpring: 'sprung' }),
    part('hinge', '70T453T.TL', 'CLIP top unsprung, EXPANDO T, NI', 146, { hingeType: 'CLIP top', hingeSpring: 'unsprung' }),
    part('hinge-arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI', 146),
    part('hinge-arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 146),
    part('hinge-boss-cover-cap', '70T4504', 'Hinge boss cover cap, CLIP top BLUMOTION, NI', 146, { hingeType: 'CLIP top BLUMOTION' }),
    part('hinge-boss-cover-cap', '70T4504', 'Hinge boss cover cap, CLIP top, NI', 146, { hingeType: 'CLIP top' }),
    ...tipOn(146),
    ...configParts(thinConfigs, thinPage),
  ],
  dims: {
    openingAngle: dim(110, 'Hinge opening angle', 146, 'deg'),
    frontThickness: dim('8-14', 'Thin front thickness range', 146, 'mm'),
    factoryFrontThickness: dim(12, 'Front thickness the printed dimensions are based on', 146, 'mm'),
    factorySidePanelThickness: dim(19, 'Cabinet side panel thickness the printed dimensions are based on', 146, 'mm'),
    fixingPositionB: dim('FA + 27', 'Fixing position B of the EXPANDO T holes; FA = front overlay', 147, 'mm'),
    hingeFixingPositionBRange: dim('23.5 to 46', 'Fixing position B printed on the isometric hinge drawing (min / max)', 147, 'mm'),
    expandoHoleDiameter: dim('10 +-0.1', 'EXPANDO T hole in the front; stone and ceramic +0.2 / -0.1', 147, 'mm'),
    expandoHoleSpacing: dim(32, 'Distance between the two EXPANDO T holes', 147, 'mm'),
    expandoDrillingDepthBT: dim('min 6', 'Drilling depth BT for EXPANDO T', 147, 'mm'),
    fixingPlanCallouts: dim([44, 34.5, 3.5], 'Further callouts of the EXPANDO T fixing plan (44 overall, 34.5, 3.5); reference points not resolved', 147, 'mm'),
    adjustmentHeight: dim('±3.0', 'First adjustment icon (height, see mounting plates), maximum', 147, 'mm'),
    adjustmentIcon2: dim('±2.0', 'Second adjustment icon', 147, 'mm'),
    adjustmentIcon3: dim('+3.0 / -2.0', 'Third adjustment icon', 147, 'mm'),
    ...configDims(thinConfigs, thinPage),
  },
  drilling: [
    {
      id: 'thin-front-expando-t',
      target: 'front',
      label: 'EXPANDO T holes for thin front (hinge fixing position)',
      reference:
        'x = 0 at the hole centre line; the two holes are 32 mm apart along the front edge direction (y = 0 and 32). Their distance B from the front edge is given in dims.fixingPositionB (FA + 27); 34.5, 44 and 3.5 callouts are not resolved',
      holes: [
        { x: 0, y: 0, diameter: 10, depth: 6, note: 'Ø10 ±0.1; drilling depth BT min 6' },
        { x: 0, y: 32, diameter: 10, depth: 6, note: 'Ø10 ±0.1; drilling depth BT min 6' },
      ],
      page: 147,
    },
  ],
  notes: [
    'Trial application recommended when combining CLIP top BLUMOTION and CLIP top with springs on small, light fronts up to 300 mm wide; not recommended for wider fronts FB.',
    'Dimensions are based on factory setting, 12 mm front and 19 mm side panel.',
    'No chipboard screws are listed on these pages.',
    TIP_ON_NOTE,
    'unverified: reference edge for fixing position B and the x offsets of the EXPANDO T holes (p. 147).',
    'unverified: min. screw length icons (20/25/30) beside Nº diagrams.',
  ],
  pages: [146, 147],
};

const glassConfigs: AngledConfig[] = [
  { no: 106, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 107, wa: -5, plate: [0, '173H7100'], spacer: ['171A5500', 6, -5] },
  { no: 103, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 100, wa: 5, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5] },
  { no: 104, wa: 10, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 2] },
  { no: 101, wa: 10, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 2] },
  { no: 105, wa: 15, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 3] },
  { no: 102, wa: 15, plate: [0, '173H7100'], spacer: ['171A5010', 0.8, 5, 3] },
];

const glassVariant: FittingVariant = {
  id: 'clip-top-angled-cristallo',
  name: 'CRISTALLO angled application (110°, glued adhesion plate)',
  summary: 'Hinge for glass and mirror doors; adhesion plate glued on, no glass drilling.',
  choices: {
    hingeType: ['CLIP top BLUMOTION', 'CLIP top'],
    wallAngleDeg: [-5, 5, 10, 15],
    config: glassConfigs.map((c) => c.no),
    frontMaterial: ['Glass | mirror', 'Mirror'],
  },
  parts: [
    part('hinge', '71B4500C', 'CLIP top BLUMOTION sprung, self-adhesive, NI', 148, { hingeType: 'CLIP top BLUMOTION' }),
    part('hinge', '71T4500C', 'CLIP top sprung, self-adhesive, NI', 148, { hingeType: 'CLIP top', hingeSpring: 'sprung' }),
    part('hinge', '70T4500CTL', 'CLIP top unsprung, self-adhesive, NI', 148, { hingeType: 'CLIP top', hingeSpring: 'unsprung' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, glass or mirror, NI-M (matt nickel)', 148, { frontMaterial: 'Glass | mirror' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, mirror, NI-S (special nickel)', 148, { frontMaterial: 'Mirror' }),
    part('hinge-arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI', 148),
    part('hinge-arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 148),
    ...tipOn(148),
    ...configParts(glassConfigs, () => 149),
  ],
  dims: {
    openingAngle: dim(110, 'Hinge opening angle', 148, 'deg'),
    factoryFrontThickness: dim(6, 'Front thickness the printed dimensions are based on', 148, 'mm'),
    factorySidePanelThickness: dim(19, 'Cabinet side panel thickness the printed dimensions are based on', 148, 'mm'),
    adjustmentHeight: dim('±3.0', 'First adjustment icon (height, see mounting plates), maximum', 149, 'mm'),
    adjustmentIcon2: dim('±2.0', 'Second adjustment icon', 149, 'mm'),
    adjustmentIcon3: dim('+3.0 / -2.0', 'Third adjustment icon', 149, 'mm'),
    ...configDims(glassConfigs, () => 149),
  },
  drilling: [],
  notes: [
    'The adhesion plate is glued to the glass; the catalogue recommends that an experienced glass manufacturer applies the adhesive. Blum limits liability for the adhesive and its process (p. 148, 106).',
    'Trial application recommended when combining CLIP top BLUMOTION and CLIP top with springs on small, light fronts up to 300 mm wide.',
    'Distance reference given as p. 107; mounting plates p. 150.',
    TIP_ON_NOTE,
    'unverified: gluing position / distance dimensions (refer to p. 107, outside this range).',
  ],
  pages: [148, 149],
};

export const clipTopAngled: FittingFamily = {
  id: 'clip-top-angled',
  kind: 'hinge',
  brand: 'Blum',
  name: 'CLIP top / CLIP top BLUMOTION angled applications',
  summary: 'Angled hinges for non-90-degree cabinet corners, thin doors and glass doors.',
  variants: [
    plus45II, plus45III, plus30II, plus30III, plus20II, plus15III, pm5Variant,
    minus15III, minus30III, minus45III, thinVariant, glassVariant,
  ],
  document: DOC,
  pages: [126, 149],
};

// ---------------------------------------------------------------------------------------------
// Mounting plates (pp. 150-155) and angled spacers (p. 156)
// ---------------------------------------------------------------------------------------------

type Fix = 'chipboard' | 'expando' | 'system-screw' | 'knock-in' | 'inserta';

interface PlateOpts {
  id: string;
  name: string;
  layout: 'horizontal' | 'cruciform' | 'cruciform-28' | 'cruciform-zinc';
  page: number;
  fix: Fix;
  material: string;
  adjustMm: number;
  adjustment: string;
  parts: { spacing: number; height: number; partNo: string; colour: string; onRequest?: boolean }[];
  holeDia?: number | null;
  holeTol?: boolean;
  minDepth?: number | string;
  screwNote?: string;
  accessories?: [string, string][];
  dual?: boolean;
  footprint?: [number, number];
  notes?: string[];
}

function plate(o: PlateOpts): FittingVariant {
  const parts: PartNumber[] = o.parts.map((p) =>
    part(
      'plate',
      p.partNo,
      `Mounting plate, spacing ${p.spacing} mm, height ${p.height} mm, ${p.colour}${p.onRequest ? ', on request' : ''}`,
      o.page,
      { spacing: p.spacing },
    ),
  );
  for (const [no, desc] of o.accessories ?? []) parts.push(part('accessory', no, desc, o.page));

  const holes: { x: number; y: number }[] = [];
  let reference: string;
  let dims: Record<string, DimSpec> = {};
  const dia = o.holeDia ?? 3.5;
  const diaNote = o.holeDia
    ? `Ø${o.holeDia}${o.holeTol ? ' ±0.1' : ''} hole; dimension lines are drawn tangent to the hole circle on the plan`
    : 'screw diameter Ø3.5 (chipboard screw); pilot hole diameter not printed on this page';
  const extra: { x: number; y: number; note: string }[] = [];

  if (o.layout === 'horizontal') {
    reference =
      'Plan view of the side panel as drawn: x from the front edge of the cabinet side panel to the hole centre (20 mm to the front hole, then 32 mm to the second); both holes on one line (y = 0, the plate centre line). The unlabelled centre mark is the additional screw position';
    holes.push({ x: 20, y: 0 }, { x: 52, y: 0 });
    dims = {
      holeSpacing: dim(32, 'Distance between the two plate fixing holes along the depth direction', o.page, 'mm'),
      frontEdgeToHole: dim(20, 'Distance from the front edge of the side panel to the nearer fixing hole centre', o.page, 'mm'),
      isometricDepth: dim(58.3, 'Isometric view: overall dimension from the front edge of the side panel to the far end of the plate (as drawn)', o.page, 'mm'),
      isometricWidth: dim(18.7, 'Isometric view: plate width across the screw row (as drawn)', o.page, 'mm'),
    };
  } else {
    const edge = o.layout === 'cruciform-28' ? 28 : 37;
    reference =
      `Plan view of the side panel as drawn: x from the front edge of the cabinet side panel to the hole line (${edge} mm); y along the edge, origin at the midpoint between the two holes (additional screw position, marked *), holes 32 mm apart`;
    holes.push({ x: edge, y: -16 }, { x: edge, y: 16 });
    dims = {
      holeSpacing: dim(32, 'Distance between the two plate fixing holes along the front edge direction', o.page, 'mm'),
      frontEdgeToHoleLine: dim(edge, 'Distance from the front edge of the side panel to the hole line', o.page, 'mm'),
    };
    if (o.layout === 'cruciform-zinc') {
      extra.push({ x: 37 + 26, y: 0, note: 'additional screw position marked * (26 mm further from the front edge than the hole line, at the middle between the holes); only for wide-angle and 0-protrusion hinges' });
      dims.additionalScrewOffset = dim(26, 'Zinc 37/32 plates: additional screw (*) lies 26 mm from the hole line away from the front edge', o.page, 'mm');
    }
    if (o.footprint) {
      dims.isometricDepth = dim(o.footprint[0], 'Isometric view: overall dimension from the front edge of the side panel to the far end of the plate (as drawn)', o.page, 'mm');
      dims.isometricLength = dim(o.footprint[1], 'Isometric view: overall plate length along the front edge (as drawn)', o.page, 'mm');
    }
  }
  if (o.holeDia) {
    dims.holeDiameter = dim(o.holeTol ? `${o.holeDia} +-0.1` : o.holeDia, 'Fixing hole diameter in the side panel', o.page, 'mm');
  }
  if (o.minDepth !== undefined) {
    dims.holeDepth = dim(`min ${o.minDepth}`, 'Minimum drilling depth in the side panel, as printed beside the section', o.page, 'mm');
  }
  dims.adjustment = dim(`±${o.adjustMm}`, `Height adjustment by ${o.adjustment}`, o.page, 'mm');
  dims.spacingHeight = dim('8.5 + spacing', 'Plate height H = 8.5 mm at spacing 0 (see part table); each part row gives its height', o.page, 'mm');

  const drillHoles = [
    ...holes.map((h) => ({ x: h.x, y: h.y, diameter: dia, ...(o.minDepth !== undefined && typeof o.minDepth === 'number' ? { depth: o.minDepth } : {}), note: diaNote })),
    ...extra.map((h) => ({ x: h.x, y: h.y, diameter: 3.5, note: h.note })),
  ];

  const drilling: DrillingRule[] = [
    {
      id: `${o.id}-side`,
      target: 'carcass-side',
      label: `Plate fixing holes - ${o.name}`,
      reference,
      holes: drillHoles,
      page: o.page,
    },
  ];

  const notes: string[] = [
    `Material: ${o.material}; fixing: ${o.fix}.`,
    o.screwNote ?? '',
    o.dual ? 'Dual application: plates on both sides of one panel; the additional screw is required as standard.' : '',
    'The additional screw position (*) is shown but not dimensioned except where stated; use it with wide angle and 0-protrusion hinges.',
    ...(o.notes ?? []),
  ].filter((n) => n.length > 0);

  return {
    id: o.id,
    name: o.name,
    choices: { spacing: o.parts.map((p) => p.spacing), colour: Array.from(new Set(o.parts.flatMap((p) => p.colour.split(' | ')))) },
    parts,
    dims,
    drilling,
    notes,
    pages: [o.page],
  };
}

const platesVariants: FittingVariant[] = [
  plate({
    id: 'plate-horizontal-cam-20-32-chipboard',
    name: 'Horizontal cam mounting plate 20/32, chipboard screws',
    layout: 'horizontal', page: 150, fix: 'chipboard', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '175H3100', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '175H3130', colour: 'NI | ONS' },
    ],
    screwNote: 'Chipboard screws Ø3.5 mm, recommended screw length 17 mm.',
  }),
  plate({
    id: 'plate-horizontal-cam-20-32-expando-5',
    name: 'Horizontal cam mounting plate 20/32, EXPANDO (Ø5 hole)',
    layout: 'horizontal', page: 150, fix: 'expando', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '177H3100E', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '177H3130E', colour: 'NI | ONS' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5,
    screwNote: 'Pre-mounted special screws with split dowels (EXPANDO).',
  }),
  plate({
    id: 'plate-horizontal-cam-20-32-expando-10',
    name: 'Horizontal cam mounting plate 20/32, EXPANDO (Ø10 hole, on request)',
    layout: 'horizontal', page: 151, fix: 'expando', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '177H3100E10', colour: 'NI', onRequest: true },
      { spacing: 3, height: 11.5, partNo: '177H3130E10', colour: 'NI', onRequest: true },
    ],
    holeDia: 10, holeTol: true, minDepth: 11.5,
    screwNote: 'Pre-mounted special screws with split dowels (EXPANDO); item available on request.',
  }),
  plate({
    id: 'plate-horizontal-cam-20-32-system-screw',
    name: 'Horizontal cam mounting plate 20/32, system screws Ø6 x 12.9 (66B.134)',
    layout: 'horizontal', page: 151, fix: 'system-screw', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '175H4100', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '175H4130', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5,
    screwNote: 'Pre-mounted system screws Ø6 x 12.9 mm (66B.134).',
  }),
  plate({
    id: 'plate-horizontal-cam-20-32-dual-system-screw',
    name: 'Horizontal cam mounting plate 20/32, dual application, system screws Ø6 x 8.9 (66B.094)',
    layout: 'horizontal', page: 151, fix: 'system-screw', material: 'steel', adjustMm: 2, adjustment: 'cam', dual: true,
    parts: [{ spacing: 0, height: 8.5, partNo: '175H410Z', colour: 'NI' }],
    holeDia: 5, holeTol: true, minDepth: 7,
    screwNote: 'Pre-mounted system screws Ø6 x 8.9 mm (66B.094).',
  }),
  plate({
    id: 'plate-horizontal-cam-20-32-knock-in',
    name: 'Horizontal cam mounting plate 20/32, knock-in dowels',
    layout: 'horizontal', page: 151, fix: 'knock-in', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '177H3100', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '177H3130', colour: 'NI | ONS' },
    ],
    holeDia: 10, holeTol: true, minDepth: 11.5,
    accessories: [['MZM.0053', 'Insertion ram, horizontal steel plate 177H31x0']],
    screwNote: 'Knock-in assembly with pre-fixed dowels, using insertion ram or insertion tool pressing directly on the screw.',
  }),
  plate({
    id: 'plate-cruciform-cam-37-32-chipboard',
    name: 'Cruciform cam mounting plate 37/32, chipboard screws',
    layout: 'cruciform', page: 152, fix: 'chipboard', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '173H7100', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '173H7130', colour: 'NI | ONS' },
    ],
    footprint: [57, 56],
    screwNote: 'Chipboard screws Ø3.5 or Ø4 mm. Additional screw min. 20 mm for wide angle and 0-protrusion hinges.',
  }),
  plate({
    id: 'plate-cruciform-inserta-37-32',
    name: 'Cruciform mounting plate 37/32, INSERTA',
    layout: 'cruciform', page: 152, fix: 'inserta', material: 'steel, closing lever zinc die-cast', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '174H7100I', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '174H7130I', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [68, 56],
    screwNote: 'Tool-free assembly with self-anchoring feature. Additional screw min. 20 mm for wide angle and 0-protrusion hinges.',
  }),
  plate({
    id: 'plate-cruciform-cam-37-32-expando',
    name: 'Cruciform cam mounting plate 37/32, EXPANDO',
    layout: 'cruciform', page: 152, fix: 'expando', material: 'steel', adjustMm: 2, adjustment: 'cam',
    parts: [
      { spacing: 0, height: 8.5, partNo: '174H7100E', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '174H7130E', colour: 'NI | ONS' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [57, 56],
    screwNote: 'Pre-mounted special screws with split dowels (EXPANDO). Additional screw min. 20 mm for wide angle and 0-protrusion hinges.',
  }),
  plate({
    id: 'plate-cruciform-cam-37-32-dual-expando',
    name: 'Cruciform cam mounting plate 37/32, dual application, EXPANDO',
    layout: 'cruciform', page: 152, fix: 'expando', material: 'steel', adjustMm: 2, adjustment: 'cam', dual: true,
    parts: [
      { spacing: 0, height: 8.5, partNo: '174H710ZE', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '174H713ZE', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 7.5, footprint: [57, 56],
    screwNote: 'Pre-mounted special screws with split dowels (EXPANDO).',
  }),
  plate({
    id: 'plate-cruciform-37-32-zinc-chipboard',
    name: 'Cruciform mounting plate 37/32, zinc, chipboard screws',
    layout: 'cruciform-zinc', page: 153, fix: 'chipboard', material: 'zinc', adjustMm: 2, adjustment: 'height adjustment',
    parts: [
      { spacing: 0, height: 8.5, partNo: '175H7100', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '175H7130', colour: 'NI' },
      { spacing: 9, height: 17.5, partNo: '175H7190', colour: 'NI' },
      { spacing: 18, height: 26.5, partNo: '175H7190.22', colour: 'NI' },
    ],
    footprint: [68, 44],
    screwNote: 'Chipboard screws Ø3.5 or Ø4 mm, recommended length 17 mm.',
  }),
  plate({
    id: 'plate-cruciform-37-32-zinc-system-screw',
    name: 'Cruciform mounting plate 37/32, zinc, system screws Ø6 x 14.5 (661.1450.HG)',
    layout: 'cruciform-zinc', page: 153, fix: 'system-screw', material: 'zinc', adjustMm: 2, adjustment: 'height adjustment (two-part screws)',
    parts: [
      { spacing: 0, height: 8.5, partNo: '175H9100', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '175H9130', colour: 'NI' },
      { spacing: 6, height: 14.5, partNo: '175H9160', colour: 'NI | ONS' },
      { spacing: 9, height: 17.5, partNo: '175H9190', colour: 'NI | ONS' },
      { spacing: 18, height: 26.5, partNo: '175H9190.22', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [68, 44],
    screwNote: 'System screws Ø6 x 14.5 mm, part no. 661.1450.HG.',
  }),
  plate({
    id: 'plate-cruciform-37-32-steel-chipboard-3mm',
    name: 'Cruciform mounting plate 37/32, steel, elongated hole, chipboard screws',
    layout: 'cruciform', page: 153, fix: 'chipboard', material: 'steel', adjustMm: 3, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '173L6100', colour: 'NI | ONS' },
      { spacing: 3, height: 11.5, partNo: '173L6130', colour: 'NI | ONS' },
    ],
    footprint: [57, 53],
    screwNote: 'Chipboard screws Ø3.5 or Ø4 mm, recommended length 17 mm. Additional screw min. 20 mm for wide angle and 0-protrusion hinges.',
  }),
  plate({
    id: 'plate-cruciform-37-32-steel-expando-2mm',
    name: 'Cruciform mounting plate 37/32, steel, EXPANDO, elongated hole',
    layout: 'cruciform', page: 153, fix: 'expando', material: 'steel', adjustMm: 2, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '174E6100.01', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '174E6130.01', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [57, 53],
    screwNote: 'Pre-mounted special screws with split dowels (EXPANDO). Additional screw min. 20 mm for wide angle and 0-protrusion hinges.',
  }),
  plate({
    id: 'plate-cruciform-37-32-steel-system-screw',
    name: 'Cruciform mounting plate 37/32, steel, system screws Ø6, elongated hole',
    layout: 'cruciform', page: 154, fix: 'system-screw', material: 'steel', adjustMm: 3, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '173L8100', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '173L8130', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [57, 53],
    screwNote: 'Pre-mounted system screws Ø6 mm.',
  }),
  plate({
    id: 'plate-cruciform-37-32-dual-system-screw',
    name: 'Cruciform mounting plate 37/32, dual application, system screws Ø6 (668.1150)',
    layout: 'cruciform', page: 154, fix: 'system-screw', material: 'steel', adjustMm: 3, adjustment: 'elongated hole', dual: true,
    parts: [{ spacing: 0, height: 8.5, partNo: '173L8100.21', colour: 'NI' }],
    holeDia: 5, holeTol: true, minDepth: 8.5, footprint: [57, 53],
    screwNote: 'Pre-mounted special system screws Ø6 mm (668.1150).',
  }),
  plate({
    id: 'plate-cruciform-37-32-knock-in',
    name: 'Cruciform mounting plate 37/32, steel, knock-in dowels',
    layout: 'cruciform', page: 154, fix: 'knock-in', material: 'steel', adjustMm: 3, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '174L6100.05', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '174L6130.05', colour: 'NI' },
    ],
    holeDia: 10, holeTol: true, minDepth: 11.5, footprint: [57, 53],
    accessories: [['MZM.0061.01', 'Insertion ram, cruciform plate 174H71xx']],
    screwNote: 'Knock-in assembly with pre-fixed dowels.',
  }),
  plate({
    id: 'plate-cruciform-28-32-system-screw',
    name: 'Cruciform mounting plate 28/32, steel, system screws Ø6',
    layout: 'cruciform-28', page: 154, fix: 'system-screw', material: 'steel', adjustMm: 3, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '173L8300', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '173L8330', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [57, 53],
    screwNote: 'Pre-mounted system screws Ø6 mm; hole line 28 mm from the front edge.',
  }),
  plate({
    id: 'plate-cruciform-37-32-zinc-system-screw-3mm',
    name: 'Cruciform mounting plate 37/32, zinc, system screws Ø6, elongated hole',
    layout: 'cruciform', page: 155, fix: 'system-screw', material: 'zinc', adjustMm: 3, adjustment: 'elongated hole',
    parts: [
      { spacing: 0, height: 8.5, partNo: '175L8100', colour: 'NI' },
      { spacing: 3, height: 11.5, partNo: '175L8130', colour: 'NI' },
      { spacing: 9, height: 17.5, partNo: '175L8190', colour: 'NI' },
      { spacing: 11, height: 19.5, partNo: '175L8190.21', colour: 'NI' },
    ],
    holeDia: 5, holeTol: true, minDepth: 11.5, footprint: [56, 51],
    screwNote: 'Pre-mounted system screws Ø6 mm.',
  }),
];

const spacerVariants: FittingVariant[] = [
  {
    id: 'angled-spacer-plus5',
    name: '+5° obtuse angled spacer 37/32',
    choices: { spacing: [0.8, 3, 6], colour: ['NI'] },
    parts: [
      part('angled-spacer', '171A5010', 'Angled spacer +5 deg, spacing 0.8 mm, NI', 156, { spacing: 0.8 }),
      part('angled-spacer', '171A5040', 'Angled spacer +5 deg, spacing 3 mm, NI', 156, { spacing: 3 }),
      part('angled-spacer', '171A5070', 'Angled spacer +5 deg, spacing 6 mm, NI', 156, { spacing: 6 }),
    ],
    dims: {
      wedge: dim(5, 'Wedge angle, obtuse (positive)', 156, 'deg'),
      suitablePlates: dim('173H71X0 | 175H71X0 | 175H91X0', 'Mounting plate part numbers this spacer is suitable for', 156),
    },
    drilling: [],
    notes: ['Material: zinc; fixed with chipboard screws Ø3.5 or Ø4 mm. Spacing D printed on the drawing; spacer holes not dimensioned. unverified: spacer hole positions (not printed as numbers).'],
    pages: [156],
  },
  {
    id: 'angled-spacer-minus5',
    name: '-5° acute angled spacer 37/32',
    choices: { spacing: [6], colour: ['NI'] },
    parts: [part('angled-spacer', '171A5500', 'Angled spacer -5 deg, spacing 6 mm, NI', 156, { spacing: 6 })],
    dims: {
      wedge: dim(-5, 'Wedge angle, acute (negative)', 156, 'deg'),
      suitablePlates: dim('173H71X0 | 175H71X0 | 175H91X0', 'Mounting plate part numbers this spacer is suitable for', 156),
    },
    drilling: [],
    notes: ['Material: zinc; fixed with chipboard screws Ø3.5 or Ø4 mm.'],
    pages: [156],
  },
];

export const clipTopMountingPlates: FittingFamily = {
  id: 'clip-top-mounting-plates',
  kind: 'hinge',
  brand: 'Blum',
  name: 'CLIP top mounting plates and angled spacers',
  summary: 'Horizontal 20/32, cruciform 37/32 and 28/32 mounting plates with fixing options, and +5 / -5 degree angled spacers.',
  variants: [...platesVariants, ...spacerVariants],
  document: DOC,
  pages: [150, 156],
};

// ---------------------------------------------------------------------------------------------
// Accessories (pp. 157-161)
// ---------------------------------------------------------------------------------------------

const capGroups: [string, string, [string, string][]][] = [
  ['110/107 deg hinges', 'straight arm', [['70.1503', 'plain NI or ONS'], ['70.1503.BP', 'Blum stamped NI or ONS']]],
  ['110/107 deg hinges', 'cranked or double cranked arm', [['70.1663', 'plain NI or ONS'], ['70.1663.BP', 'Blum stamped NI']]],
  ['110 deg special, blind corner inset/overlay, corner cabinet bi-fold, +45 II angled overlay', 'standard', [['70.1503', 'plain NI or ONS'], ['70.1503.BP', 'Blum stamped NI or ONS']]],
  ['CLIP 100 deg hinge', 'straight arm', [['90M2503', 'plain NI'], ['90M2503.BP', 'Blum stamped NI']]],
  ['CLIP 100 deg hinge', 'cranked or double cranked arm', [['94M3603', 'plain NI'], ['94M3603.BP', 'Blum stamped NI']]],
  ['155, 125 deg, thin doors, CRISTALLO, CRISTALLO display cabinets, thin door and CRISTALLO angled', 'straight arm', [['70.4503', 'plain NI or ONS'], ['70.4503.BP', 'Blum stamped NI']]],
  ['155, 125 deg, thin doors, CRISTALLO, CRISTALLO display cabinets, thin door and CRISTALLO angled', 'cranked or double cranked arm', [['70.4503', 'plain NI or ONS'], ['70.4503.BP', 'Blum stamped NI']]],
  ['170 deg hinge', 'straight arm', [['80.6507', 'plain NI'], ['80.6507.BP', 'Blum stamped NI']]],
  ['170 deg hinge', 'cranked or double cranked arm', [['80.6507', 'plain NI'], ['80.6507.BP', 'Blum stamped NI']]],
  ['Profile/thick door, 95 deg aluminium frame (BLUMOTION and CLIP top), bathroom mirror cabinets, incl. ±5 angled', 'straight arm', [['70.1553', 'plain NI or ONS'], ['70.1553.BP', 'Blum stamped NI']]],
  ['Profile/thick door, 95 deg aluminium frame (BLUMOTION and CLIP top), bathroom mirror cabinets, incl. ±5 angled', 'cranked or double cranked arm', [['70.1663', 'plain NI or ONS'], ['70.1663.BP', 'Blum stamped NI']]],
  ['Glass door hinge, mini-hinge', 'straight arm', [['70.1553', 'plain NI'], ['70.1553.BP', 'Blum stamped NI']]],
  ['Glass door hinge, mini-hinge', 'cranked or double cranked arm', [['70.1553', 'plain NI'], ['70.1553.BP', 'Blum stamped NI']]],
  ['Remaining angled hinges / angled applications', 'all arms', [['70.1553', 'plain NI or ONS'], ['70.1553.BP', 'Blum stamped NI']]],
];

const accParts: PartNumber[] = [];
capGroups.forEach(([app, arm, caps], i) => {
  const page = i >= 11 ? 158 : 157;
  for (const [no, d] of caps) {
    accParts.push(part('hinge-arm-cover-cap', no, `Cover cap ${d}; ${app}; ${arm}`, page, { capGroup: i + 1 }));
  }
});
accParts.push(
  part('hinge-boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm, nylon, RAL 7037', 158),
  part('hinge-boss-cover-cap', '70T3504', 'Hinge boss cover cap: 110, 110 special, 107, profile door, blind corner, mirror cabinets, angled apps (BLUMOTION NI|ONS; CLIP top NI|ONS for 110/107)', 159, { bossCapGroup: 'standard' }),
  part('hinge-boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, angled applications, NI or ONS', 159, { bossCapGroup: 'angled-clip-top' }),
  part('hinge-boss-cover-cap', '70T7504', 'Hinge boss cover cap, 155 and 125 degree hinges, NI or ONS', 159, { bossCapGroup: '155-125' }),
  part('hinge-boss-cover-cap', '70T4504', 'Hinge boss cover cap, thin door hinges (angled: NI only for CLIP top), NI or ONS', 159, { bossCapGroup: 'thin-door' }),
  part('screw', '609.1500', 'Chipboard screw Ø3.5 x 15.0 mm, nickel', 160),
  part('screw', '609.1700', 'Chipboard screw Ø3.5 x 17.0 mm, nickel', 160),
  part('screw', '660.0950', 'Countersunk self-tapping screw Ø3.5 x 9.5 mm, for wide alu frame brackets', 160),
  part('screw', '661.1000.HG', 'System screw Ø6 x 10.0 mm', 160),
  part('screw', '661.1150.HG', 'System screw Ø6 x 11.5 mm', 160),
  part('screw', '661.1300.HG', 'System screw Ø6 x 13.0 mm', 160),
  part('screw', '661.1450.HG', 'System screw Ø6 x 14.5 mm', 160),
  part('screw', '661.2000.HG', 'System screw Ø6 x 20.0 mm', 160),
  part('tool', 'M01.ZZ03.01', 'Centre bit Ø2.7 mm', 160),
  part('tool', 'M01.ZZB3', 'Replacement bit for centre bit', 160),
  part('door-buffer', '993.710', 'Stick-on door buffer Ø8.0 mm, natural nylon', 160),
  part('door-buffer', '993.706', 'Door buffer Ø8 mm, two-part, RAL 9006 grey', 160),
  part('tool', '303.756.1', 'Pozidriv PZ 2 screwdriver, 210 mm', 161),
  part('tool', '314.928.1', 'Slotted screwdriver size 1, 200 mm', 161),
);

export const clipTopHingeAccessories: FittingFamily = {
  id: 'clip-top-hinge-accessories',
  kind: 'hinge',
  brand: 'Blum',
  name: 'CLIP top hinge accessories',
  summary: 'Hinge arm and boss cover caps, boss spacing, screws, centre bit, door buffers, screwdrivers.',
  variants: [
    {
      id: 'clip-top-accessories',
      name: 'Cover caps, screws and tools',
      choices: { colour: ['NI', 'ONS'], print: ['plain', 'stamped Blum'] },
      parts: accParts,
      dims: {
        centreBitDrillDiameter: dim(2.7, 'Centre bit pre-drill for Ø3.5 chipboard screws, drilling depth up to 8 mm', 160, 'mm'),
        centreBitMaxDepth: dim(8, 'Maximum drilling depth of the centre bit', 160, 'mm'),
        selfTappingScrewPilot: dim(2.8, 'Drilling diameter for countersunk self-tapping screw 660.0950', 160, 'mm'),
        systemScrewPilot: dim(5, 'Drilling diameter for Ø6 system screws', 160, 'mm'),
        hingeBossSpacing: dim(1.5, 'Hinge boss spacing thickness (70T3507.21)', 158, 'mm'),
      },
      drilling: [],
      notes: [
        'Cover cap groups (capGroup 1-14 in `when`) follow the application blocks of pp. 157-158: 1-2 110/107 deg hinges; 3 special/blind corner/bi-fold/+45 II; 4-5 CLIP 100; 6-7 155/125/thin/CRISTALLO; 8-9 170; 10-11 profile door/alu frame/mirror cabinet/±5; 12-13 glass door and mini-hinge; 14 remaining angled.',
        'Boss spacing 70T3507.21 applies to 110, 110 special, 155 (BLUMOTION and CLIP top) and to 107, profile/thick door, 125 (one hinge family column each); exact column mapping of the two 70T3507.21 rows is unverified.',
        'Hinge boss cover cap rows: 70T3504 for 110, 110 special, 107, profile/thick, blind corner, mirror cabinets and angled applications (CLIP top angled uses 70T1504); 70T7504 for 155 and 125; 70T4504 for thin door hinges. unverified: which of the BLUMOTION / CLIP top columns carries which part number for the rows other than the angled ones.',
        'Colour NI nickel plated, ONS onyx black. Custom printed cover caps are available from 1000 pcs.',
        'MODUL hinge pages (162-165) are outside this assignment and are not transcribed.',
      ],
      pages: [157, 158, 159, 160, 161],
    },
  ],
  document: DOC,
  pages: [157, 161],
};

export const clipTopPlates: FittingFamily[] = [clipTopAngled, clipTopMountingPlates, clipTopHingeAccessories];
