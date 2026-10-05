// Blum CLIP top / CLIP top BLUMOTION hinge applications: printed catalogue pages 72-125.
// Source: Blum "Catalogue and technical manual 2024/2025". Dimensions in mm.
// Conventions: TB = drilling distance (door edge to cup edge), FA = front overlay, MD = mounting plate spacing,
// FD = front thickness, F = gap. Tables of TB versus FA follow FA = TB + k - MD (k read from the diagram; every
// published table row fits this relation where checked).

import type { DimSpec, DrillingRule, FittingFamily, FittingVariant, PartNumber } from '../types';

type App = 'overlay' | 'dual' | 'inset';
type Boss = 'inserta' | 'screw-on' | 'knock-in';
type Action = 'blumotion' | 'spring' | 'unsprung';
type Row = [App, Boss, Action, string, string]; // application, boss, action, colour(s), part no.

const ACTION_TEXT: Record<Action, string> = {
  blumotion: 'with BLUMOTION',
  spring: 'sprung',
  unsprung: 'unsprung',
};
const BOSS_TEXT: Record<Boss, string> = { inserta: 'INSERTA', 'screw-on': 'screw-on', 'knock-in': 'knock-in' };

/** Hinge part numbers. Colour in `when` only when the row lists a single colour. */
function hinges(page: number, name: string, rows: Row[], extraWhen: Record<string, string | number> = {}): PartNumber[] {
  return rows.map(([application, boss, action, colour, partNo]) => ({
    role: 'hinge',
    partNo,
    description: `${name} ${ACTION_TEXT[action]}, ${application}, ${BOSS_TEXT[boss]}, ${colour}`,
    when: { application, boss, action, ...(colour.includes('/') ? {} : { colour }), ...extraWhen },
    page,
  }));
}

function part(role: string, partNo: string, description: string, page: number, when?: Record<string, string | number>, qty?: number): PartNumber {
  const p: PartNumber = { role, partNo, description, page };
  if (when) p.when = when;
  if (qty) p.qty = qty;
  return p;
}

/** Hinge arm cover caps: [application or 'all', print, colour(s), part no.] */
function coverCaps(page: number, rows: [App | 'all', 'plain' | 'stamped', string, string][]): PartNumber[] {
  return rows.map(([app, print, colour, partNo]) =>
    part('arm-cover-cap', partNo, `Hinge arm cover cap, ${print === 'plain' ? 'plain' : 'Blum stamped'}, ${colour}`, page, {
      ...(app === 'all' ? {} : { application: app }),
      ...(colour.includes('/') ? {} : { colour }),
    }),
  );
}

const screws = (page: number): PartNumber[] => [
  part('screw', '609.1500', 'Chipboard screw 3.5 x 15 mm', page),
  part('screw', '609.1700', 'Chipboard screw 3.5 x 17 mm', page),
];
const ram = (page: number): PartNumber =>
  part('tool', 'MZM.0040', 'Insertion ram, orange nylon, for knock-in boss', page, { boss: 'knock-in' });
const tipOnAll = (page: number): PartNumber[] => [
  part('tip-on', '956.1004', 'TIP-ON short, standard spring, unsprung hinge', page, { action: 'unsprung' }),
  part('tip-on', '956A1004', 'TIP-ON extended, standard spring, unsprung hinge', page, { action: 'unsprung' }),
  part('tip-on', '956A1006', 'TIP-ON extended, standard spring, sprung hinge', page, { action: 'spring' }),
  part('tip-on', '956A1006F', 'TIP-ON extended, strong spring, sprung hinge', page, { action: 'spring' }),
];
const tipOnExtended = (page: number): PartNumber[] => tipOnAll(page).slice(2);

const d = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({ value, unit, meaning, page });
const txt = (value: DimSpec['value'], meaning: string, page: number): DimSpec => ({ value, meaning, page });

/** Minimum gap F table as readable rows. */
function gapRows(label: string, fds: number[], rows: Record<string, (number | 'trial')[]>): string[] {
  return Object.entries(rows).map(
    ([key, vals]) => `${label}${key}: ` + vals.map((v, i) => `FD${fds[i]}=${v}`).join(' '),
  );
}

/** Adjustment ranges as printed (height / side / depth) in one dim set. */
const adj = (page: number, height: string, side: string, depth: string): Record<string, DimSpec> => ({
  adjustHeight: txt(height, 'Height adjustment as printed', page),
  adjustSide: txt(side, 'Side (gap) adjustment as printed', page),
  adjustDepth: txt(depth, 'Depth (front) adjustment as printed', page),
});

/** Cup and (optionally) dowel drilling pattern for the door. x from the door hinge-side edge to the hole centre. */
function cupRules(page: number, idPrefix: string, o: { cup: number; tb: [number, number]; dowels?: boolean; cupTol?: string; boss?: Record<string, (string | number)[]> }): DrillingRule[] {
  const tbMid = (o.tb[0] + o.tb[1]) / 2;
  const x = tbMid + o.cup / 2;
  const rules: DrillingRule[] = [
    {
      id: `${idPrefix}-cup`,
      target: 'door',
      label: `Hinge cup hole, Ø${o.cup}${o.cupTol ?? ''}`,
      reference:
        `x from the door edge on the hinge side to the cup centre; y = 0 on the hinge centre line. x = TB + ${o.cup / 2} with TB ${o.tb[0]}-${o.tb[1]} (shown for TB ${tbMid}). Cup drilling depth is not printed on this page.`,
      holes: [{ x, y: 0, diameter: o.cup, note: `TB ${o.tb[0]}-${o.tb[1]} mm` }],
      page,
    },
  ];
  if (o.dowels) {
    rules.push({
      id: `${idPrefix}-dowels`,
      target: 'door',
      label: 'Boss dowel holes Ø8, INSERTA / knock-in',
      reference:
        'x as for the cup centre plus 9.5 (dowel axis 9.5 from the cup centre, further from the door edge); y = ±22.5 from the hinge centre line (holes 45 apart). Depth not printed.',
      holes: [
        { x: x + 9.5, y: -22.5, diameter: 8, note: '8 ±0.1' },
        { x: x + 9.5, y: 22.5, diameter: 8, note: '8 ±0.1' },
      ],
      when: { boss: ['inserta', 'knock-in'] },
      page,
    });
  }
  return rules;
}

const TB_NOTE = 'unverified: planning-diagram numbers (hinge reach, protrusion at full opening) are not transcribed because the measured edges are ambiguous in the extracted diagram; see the printed page.';
const TRIAL_NOTE = 'A trial application is recommended when combining CLIP top BLUMOTION hinges and CLIP top hinges with springs on small, light fronts up to 300 mm wide; not recommended for wider fronts.';
const NO_MIX_NOTE = 'CLIP top BLUMOTION and CLIP top hinges cannot be combined with each other on a door.';

const COLOUR_CHOICE = ['NI', 'ONS'];
const MD_CHOICE = [0, 3, 6, 9];

// ---------------------------------------------------------------------------------------------------------------

const hinge110: FittingVariant = {
  id: 'clip-top-110',
  name: 'CLIP top / BLUMOTION 110° hinge',
  summary: 'Standard 110° hinge, overlay, dual and inset applications (also covered in blum-hinges.ts).',
  choices: {
    application: ['overlay', 'dual', 'inset'],
    boss: ['inserta', 'screw-on', 'knock-in'],
    action: ['blumotion', 'spring', 'unsprung'],
    colour: COLOUR_CHOICE,
    mountingPlateSpacing: MD_CHOICE,
  },
  parts: [
    ...hinges(76, 'CLIP top 110°', [
      ['overlay', 'inserta', 'blumotion', 'NI/ONS', '71B3590'],
      ['overlay', 'inserta', 'spring', 'NI', '71T3590'],
      ['overlay', 'inserta', 'unsprung', 'NI/ONS', '70T3590.TL'],
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '71B3550'],
      ['overlay', 'screw-on', 'spring', 'NI', '71T3550'],
      ['overlay', 'screw-on', 'unsprung', 'NI/ONS', '70T3550.TL'],
      ['overlay', 'knock-in', 'blumotion', 'NI/ONS', '71B3580'],
      ['overlay', 'knock-in', 'spring', 'NI', '71T3580'],
      ['overlay', 'knock-in', 'unsprung', 'NI/ONS', '70T3580.TL'],
      ['dual', 'inserta', 'blumotion', 'NI/ONS', '71B3690'],
      ['dual', 'inserta', 'spring', 'NI', '71T3690'],
      ['dual', 'inserta', 'unsprung', 'NI/ONS', '70T3690.TL'],
      ['dual', 'screw-on', 'blumotion', 'NI/ONS', '71B3650'],
      ['dual', 'screw-on', 'spring', 'NI', '71T3650'],
      ['dual', 'screw-on', 'unsprung', 'NI/ONS', '70T3650.TL'],
      ['dual', 'knock-in', 'blumotion', 'NI', '71B3680'],
      ['dual', 'knock-in', 'spring', 'NI', '71T3680'],
      ['inset', 'inserta', 'blumotion', 'NI/ONS', '71B3790'],
      ['inset', 'inserta', 'spring', 'NI', '71T3790'],
      ['inset', 'inserta', 'unsprung', 'NI/ONS', '70T3790.TL'],
      ['inset', 'screw-on', 'blumotion', 'NI/ONS', '71B3750'],
      ['inset', 'screw-on', 'spring', 'NI', '71T3750'],
      ['inset', 'screw-on', 'unsprung', 'NI/ONS', '70T3750.TL'],
      ['inset', 'knock-in', 'blumotion', 'NI', '71B3780'],
      ['inset', 'knock-in', 'spring', 'NI', '71T3780'],
    ]),
    ...coverCaps(76, [
      ['overlay', 'plain', 'NI/ONS', '70.1503'],
      ['overlay', 'stamped', 'NI/ONS', '70.1503.BP'],
      ['dual', 'plain', 'NI/ONS', '70.1663'],
      ['dual', 'stamped', 'NI', '70.1663.BP'],
      ['inset', 'plain', 'NI/ONS', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    part('opening-angle-stop', '70T3553', 'Opening angle stop 86°, black', 76),
    ...tipOnAll(76),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 76, { action: 'blumotion' }),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, CLIP top, NI or ONS', 76, { action: 'spring' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm', 76, undefined),
    ...screws(76),
    ram(76),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (+0.2/0 for INSERTA / knock-in)', 77),
    drillingDistanceTB: d('3-7', 'Drilling distance TB: door edge to cup edge', 77),
    minFrontThickness: d(13, 'Minimum front thickness for screw-on and INSERTA / knock-in boss ("min 13" on drilling diagram)', 77),
    dowelDiameter: d(8, 'Boss dowel hole diameter, INSERTA / knock-in (8 ±0.1)', 77),
    dowelSpacing: d(45, 'Distance between the two dowel holes, INSERTA / knock-in', 77),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre, INSERTA / knock-in', 77),
    bossLength: d(57, 'Hinge boss body length', 77),
    bossWidth: d('37.5 (INSERTA 43)', 'Hinge boss body width; INSERTA value in brackets', 77),
    bossHeight: d('3.2 (INSERTA 6.4)', 'Hinge boss height above the plate/door face; INSERTA value in brackets', 77),
    faRangeOverlay: txt('5 to 18', 'Overlay FA covered by the TB table across MD 0/3/6/9', 77),
    faRangeDual: txt('-4.5 to 8.5', 'Dual FA covered by the TB table', 77),
    faRangeInset: txt('-7 to 0', 'Inset FA covered by the TB table', 77),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay: front overlay from drilling distance and plate spacing (TB 3-7)', 77),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual: front overlay from drilling distance and plate spacing (TB 3-7)', 77),
    tbFormulaInset: txt('FA = TB - 7 - MD', 'Inset: front overlay (negative = door set back) from TB and MD (TB 3-7)', 77),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back the fixing position of the mounting plate by this much (front thickness FD + 1.5)', 77),
    minGapTable: txt(
      [
        ...gapRows('TB', [16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 30], {
          '3': [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.5, 4.3, 'trial', 'trial'],
          '4': [0.5, 0.8, 1.0, 1.2, 1.4, 1.7, 2.0, 2.5, 3.1, 3.8, 'trial', 'trial'],
          '5': [0.5, 0.8, 0.9, 1.2, 1.4, 1.7, 2.0, 2.4, 2.9, 3.4, 'trial', 'trial'],
          '6': [0.5, 0.8, 0.9, 1.2, 1.3, 1.6, 1.9, 2.3, 2.7, 3.2, 'trial', 'trial'],
          '7': [0.5, 0.8, 0.9, 1.1, 1.3, 1.6, 1.9, 2.2, 2.6, 3.0, 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, FD16..FD25: +0.2 +0.4 +0.4 +0.5 +0.5 +0.5 +0.5 +0.5 +0.5 +0.5',
      ],
      'Minimum gap F (mm) by TB (rows) and front thickness FD, front radius R = 1 mm, factory setting; trial = trial recommended',
      77,
    ),
    ...adj(77, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
    hingeCount2: txt('FG 4-6 kg', 'Number of hinges chart: 2 hinges for front weight FG (front width FB 600 mm)', 75),
    hingeCount3: txt('FG 6-12 kg', 'Number of hinges chart: 3 hinges', 75),
    hingeCount4: txt('FG 12-17 kg', 'Number of hinges chart: 4 hinges', 75),
    hingeCount5: txt('FG 17-22 kg', 'Number of hinges chart: 5 hinges', 75),
  },
  drilling: cupRules(77, 'ct110', { cup: 35, tb: [3, 7], dowels: true }),
  notes: [
    TRIAL_NOTE,
    TB_NOTE,
    'unverified: maximum front height per hinge count (chart p.75 gives approx. 750, 1500, 2100, 2500 mm for 2-5 hinges, read from a bar chart).',
    'Cross-check with blum-hinges.ts: TB 3-7, min front thickness 13, dowels Ø8 / 45 / 9.5 and part numbers agree with this page.',
  ],
  pages: [72, 73, 74, 75, 76, 77],
};

const hinge110Special: FittingVariant = {
  id: 'clip-top-110-special',
  name: 'CLIP top / BLUMOTION 110° special hinge',
  summary: 'Larger overlay capacity for thick cabinet sides; overlay application only.',
  choices: { application: ['overlay'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: MD_CHOICE },
  parts: [
    ...hinges(78, 'CLIP top 110° special', [
      ['overlay', 'inserta', 'blumotion', 'NI/ONS', '73B3590'],
      ['overlay', 'inserta', 'spring', 'NI', '73T3590'],
      ['overlay', 'inserta', 'unsprung', 'NI', '72T3590.TL'],
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '73B3550'],
      ['overlay', 'screw-on', 'spring', 'NI', '73T3550'],
      ['overlay', 'screw-on', 'unsprung', 'NI', '72T3550.TL'],
      ['overlay', 'knock-in', 'blumotion', 'NI', '73B3580'],
      ['overlay', 'knock-in', 'spring', 'NI', '73T3580'],
    ]),
    ...coverCaps(78, [
      ['overlay', 'plain', 'NI/ONS', '70.1503'],
      ['overlay', 'stamped', 'NI/ONS', '70.1503.BP'],
    ]),
    part('opening-angle-stop', '70T3553', 'Opening angle stop 86°, black', 78),
    ...tipOnAll(78),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 78, { action: 'blumotion' }),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, CLIP top, NI', 78, { action: 'spring', colour: 'NI' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm', 78),
    ...screws(78),
    ram(78),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter', 79),
    drillingDistanceTB: d('3-7', 'Drilling distance TB: door edge to cup edge', 79),
    minFrontThickness: d(13, 'Minimum front thickness ("min 13" on drilling diagram)', 79),
    dowelDiameter: d(8, 'Boss dowel hole diameter, INSERTA / knock-in', 79),
    dowelSpacing: d(45, 'Distance between the two dowel holes', 79),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 79),
    bossLength: d(57, 'Hinge boss body length', 79),
    bossWidth: d('37.5 (INSERTA 43)', 'Hinge boss body width; INSERTA value in brackets', 79),
    bossHeight: d('3.2 (INSERTA 6.4)', 'Hinge boss height; INSERTA value in brackets', 79),
    faRangeOverlay: txt('7 to 20', 'Overlay FA covered by the TB table across MD 0/3/6/9', 79),
    tbFormulaOverlay: txt('FA = TB + 13 - MD', 'Overlay: front overlay from drilling distance and plate spacing (TB 3-7)', 79),
    minGapTable: txt(
      [
        ...gapRows('TB', [16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 30], {
          '3': [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.5, 4.3, 'trial', 'trial'],
          '4': [0.5, 0.8, 1.0, 1.2, 1.4, 1.7, 2.0, 2.5, 3.1, 3.8, 'trial', 'trial'],
          '5': [0.5, 0.8, 0.9, 1.2, 1.4, 1.7, 2.0, 2.4, 2.9, 3.4, 'trial', 'trial'],
          '6': [0.5, 0.8, 0.9, 1.2, 1.3, 1.6, 1.9, 2.3, 2.7, 3.2, 'trial', 'trial'],
          '7': [0.5, 0.8, 0.9, 1.1, 1.3, 1.6, 1.9, 2.2, 2.6, 3.0, 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, FD16..FD25: +0.2 +0.4 +0.4 +0.5 +0.5 +0.5 +0.5 +0.5 +0.5 +0.5',
      ],
      'Minimum gap F (mm) by TB (rows) and front thickness FD, R = 1 mm, factory setting',
      79,
    ),
    ...adj(79, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: cupRules(79, 'ct110sp', { cup: 35, tb: [3, 7], dowels: true }),
  notes: [TRIAL_NOTE, TB_NOTE, 'Knock-in boss is listed for BLUMOTION and CLIP top (sprung) only on p.78; no unsprung knock-in part is printed.'],
  pages: [78, 79],
};

const hinge107: FittingVariant = {
  id: 'clip-top-107',
  name: 'CLIP top / BLUMOTION 107° hinge',
  summary: 'For front thicknesses FD from 15 mm; overlay, dual and inset. Parts marked with a phone symbol on p.80 are available on request.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: MD_CHOICE },
  parts: [
    ...hinges(80, 'CLIP top 107°', [
      ['overlay', 'inserta', 'spring', 'NI', '75T1590B'],
      ['overlay', 'inserta', 'unsprung', 'NI', '74T1590BTL'],
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '75B1550'],
      ['overlay', 'screw-on', 'spring', 'NI', '75T1550'],
      ['overlay', 'screw-on', 'unsprung', 'NI', '74T1550.TL'],
      ['overlay', 'knock-in', 'blumotion', 'NI', '75B1580'],
      ['overlay', 'knock-in', 'spring', 'NI', '75T1580'],
      ['dual', 'inserta', 'spring', 'NI', '75T1690B'],
      ['dual', 'screw-on', 'blumotion', 'NI/ONS', '75B1650'],
      ['dual', 'screw-on', 'spring', 'NI', '75T1650'],
      ['dual', 'screw-on', 'unsprung', 'NI', '74T1650.TL'],
      ['dual', 'knock-in', 'blumotion', 'NI', '75B1680'],
      ['dual', 'knock-in', 'spring', 'NI', '75T1680'],
      ['inset', 'inserta', 'spring', 'NI', '75T1790B'],
      ['inset', 'screw-on', 'blumotion', 'NI/ONS', '75B1750'],
      ['inset', 'screw-on', 'spring', 'NI', '75T1750'],
      ['inset', 'screw-on', 'unsprung', 'NI', '74T1750.TL'],
      ['inset', 'knock-in', 'blumotion', 'NI', '75B1780'],
      ['inset', 'knock-in', 'spring', 'NI', '75T1780'],
    ]),
    ...coverCaps(80, [
      ['overlay', 'plain', 'NI/ONS', '70.1503'],
      ['overlay', 'stamped', 'NI/ONS', '70.1503.BP'],
      ['dual', 'plain', 'NI/ONS', '70.1663'],
      ['dual', 'stamped', 'NI', '70.1663.BP'],
      ['inset', 'plain', 'NI/ONS', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    part('opening-angle-stop', '74.1103', 'Opening angle stop 86°, black (on request)', 80),
    ...tipOnAll(80),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 80, { action: 'blumotion' }),
    part('boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI', 80, { action: 'spring' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm, BLUMOTION', 80, { action: 'blumotion' }),
    ...screws(80),
    ram(80),
  ],
  dims: {
    minFrontThicknessFD: d(15, 'Hinge is for front thicknesses FD starting from 15 mm', 80),
    cupDiameter: d(35, 'Hinge cup hole diameter (see drilling diagram, p.81 boss section)', 81),
    drillingDistanceTB: d('3-6', 'Drilling distance TB: door edge to cup edge', 81),
    faRangeOverlay: txt('5 to 17', 'Overlay FA covered by the TB table across MD 0/3/6/9', 81),
    faRangeDual: txt('-4.5 to 7.5', 'Dual FA covered by the TB table', 81),
    faRangeInset: txt('-7 to -1', 'Inset FA covered by the TB table', 81),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay: front overlay from drilling distance and plate spacing (TB 3-6)', 81),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual: front overlay (TB 3-6)', 81),
    tbFormulaInset: txt('FA = TB - 7 - MD', 'Inset: front overlay (TB 3-6)', 81),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back the mounting plate fixing position by this much', 81),
    minGapTable: txt(
      [
        ...gapRows('TB', [15, 16, 18, 19, 20, 21, 22, 24, 26, 28, 30, 32], {
          '3': [0.4, 0.5, 1.0, 1.3, 1.6, 2.1, 2.7, 4.3, 'trial', 'trial', 'trial', 'trial'],
          '4': [0.4, 0.5, 0.9, 1.2, 1.5, 2.0, 2.5, 3.9, 'trial', 'trial', 'trial', 'trial'],
          '5': [0.3, 0.5, 0.9, 1.2, 1.4, 1.8, 2.3, 3.6, 'trial', 'trial', 'trial', 'trial'],
          '6': [0.3, 0.5, 0.8, 1.1, 1.4, 1.7, 2.2, 3.3, 'trial', 'trial', 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, FD15..FD24: +0.1 +0.1 +0.2 +0.2 +0.3 +0.3 +0.3 +0.3',
      ],
      'Minimum gap F (mm) by TB (rows) and front thickness FD, R = 1 mm, factory setting',
      81,
    ),
    ...adj(81, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: cupRules(81, 'ct107', { cup: 35, tb: [3, 6], dowels: true }),
  notes: [
    TRIAL_NOTE,
    TB_NOTE,
    'unverified: boss min front thickness and dowel dimensions are not rendered on p.81 in the text layer; cup/dowel pattern shown is the same Ø35 / Ø8 / 45 / 9.5 pattern used by the other CLIP top bosses (not read from p.81 itself). Boss dimension block shows B (BLUMOTION) and T (CLIP top) variants.',
    'Many 107° part numbers carry a phone symbol (available on request).',
  ],
  pages: [80, 81],
};

const clip100: FittingVariant = {
  id: 'clip-100',
  name: 'CLIP 100° hinge',
  summary: 'CLIP (not CLIP top) 100° hinge, screw-on and knock-in boss only; BLUMOTION via clip-on 973A.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['screw-on', 'knock-in'], action: ['spring', 'unsprung'], colour: ['NI'], mountingPlateSpacing: MD_CHOICE },
  parts: [
    ...hinges(82, 'CLIP 100°', [
      ['overlay', 'screw-on', 'spring', 'NI', '71M2550'],
      ['overlay', 'screw-on', 'unsprung', 'NI', '70M2550.TL'],
      ['overlay', 'knock-in', 'spring', 'NI', '71M2580'],
      ['overlay', 'knock-in', 'unsprung', 'NI', '70M2580.TL'],
      ['dual', 'screw-on', 'spring', 'NI', '71M2650'],
      ['dual', 'screw-on', 'unsprung', 'NI', '70M2650.TL'],
      ['dual', 'knock-in', 'spring', 'NI', '71M2680'],
      ['dual', 'knock-in', 'unsprung', 'NI', '70M2680.TL'],
      ['inset', 'screw-on', 'spring', 'NI', '71M2750'],
      ['inset', 'screw-on', 'unsprung', 'NI', '70M2750.TL'],
      ['inset', 'knock-in', 'spring', 'NI', '71M2780'],
    ]),
    part('blumotion-clip-on', '973A0500.01', 'BLUMOTION 973A clip-on, overlay', 82, { application: 'overlay' }),
    part('blumotion-clip-on', '973A0600', 'BLUMOTION 973A clip-on, dual', 82, { application: 'dual' }),
    part('blumotion-clip-on', '973A0700', 'BLUMOTION 973A clip-on, inset', 82, { application: 'inset' }),
    part('arm-cover-cap', '90M2503', 'Hinge arm cover cap, plain, NI', 82, { application: 'overlay' }),
    part('arm-cover-cap', '90M2503.BP', 'Hinge arm cover cap, Blum stamped, NI', 82, { application: 'overlay' }),
    part('arm-cover-cap', '94M3603', 'Hinge arm cover cap, plain, NI', 82, { application: 'dual' }),
    part('arm-cover-cap', '94M3603.BP', 'Hinge arm cover cap, Blum stamped, NI', 82, { application: 'dual' }),
    part('arm-cover-cap', '94M3603', 'Hinge arm cover cap, plain, NI', 82, { application: 'inset' }),
    part('arm-cover-cap', '94M3603.BP', 'Hinge arm cover cap, Blum stamped, NI', 82, { application: 'inset' }),
    ...tipOnAll(82),
    ...screws(82),
    ram(82),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (knock-in +0.2/0)', 83),
    drillingDistanceTB: d('3-6', 'Drilling distance TB: door edge to cup edge', 83),
    minFrontThickness: d(10.5, 'Minimum front thickness ("min 10.5" on drilling diagram)', 83),
    dowelDiameter: d(8, 'Knock-in dowel hole diameter (8 ±0.1)', 83),
    dowelSpacing: d(45, 'Distance between the two knock-in dowel holes', 83),
    dowelOffsetFromCupCentre: d(9.5, 'Knock-in dowel axis to cup centre', 83),
    bossLength: d(57, 'Hinge boss body length', 83),
    bossWidth: d(37, 'Hinge boss body width', 83),
    bossHeight: d(3.2, 'Hinge boss height', 83),
    faRangeOverlay: txt('5 to 17', 'Overlay FA covered by the TB table', 83),
    faRangeDual: txt('-4.5 to 7.5', 'Dual FA covered by the TB table', 83),
    faRangeInset: txt('-7 to -1', 'Inset FA covered by the TB table', 83),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay front overlay (TB 3-6)', 83),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual front overlay (TB 3-6)', 83),
    tbFormulaInset: txt('FA = TB - 7 - MD', 'Inset front overlay (TB 3-6)', 83),
    insetPlateSetBack: txt('FD + 1.2', 'Inset: move back the mounting plate fixing position by this much', 83),
    minGapTable: txt(
      [
        ...gapRows('TB', [16, 18, 19, 20, 21, 22, 24, 26, 28, 30, 31, 32], {
          '3': [0.3, 0.5, 0.7, 1.0, 1.3, 1.6, 3.3, 'trial', 'trial', 'trial', 'trial', 'trial'],
          '4': [0.3, 0.5, 0.7, 1.0, 1.2, 1.6, 3.2, 'trial', 'trial', 'trial', 'trial', 'trial'],
          '5': [0.3, 0.5, 0.7, 0.9, 1.2, 1.5, 2.6, 'trial', 'trial', 'trial', 'trial', 'trial'],
          '6': [0.3, 0.5, 0.7, 0.9, 1.1, 1.4, 2.4, 'trial', 'trial', 'trial', 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, FD16..FD24: +0.1 +0.3 +0.3 +0.4 +0.4 +0.5 +0.4',
      ],
      'Minimum gap F (mm) by TB (rows) and front thickness FD, R = 1 mm, factory setting',
      83,
    ),
    ...adj(83, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -1.0 mm'),
  },
  drilling: cupRules(83, 'clip100', { cup: 35, tb: [3, 6], dowels: true }).map((r) =>
    r.id.endsWith('dowels') ? { ...r, when: { boss: ['knock-in'] } } : r,
  ),
  notes: [TB_NOTE, 'No INSERTA boss for the CLIP 100° hinge; dowel holes apply to knock-in only.'],
  pages: [82, 83],
};

// ---------------------------------------------------------------------------------------------------------------

const hinge155: FittingVariant = {
  id: 'clip-top-155',
  name: 'CLIP top / BLUMOTION 155° hinge, 0-protrusion',
  summary: '155° hinge for overlay (0-protrusion), dual; inset via half-overlay hinge with 9 mm plate. Includes mitred and rebated special applications.',
  choices: { application: ['overlay', 'dual'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: [0, 9] },
  parts: [
    ...hinges(84, 'CLIP top 155°', [
      ['overlay', 'inserta', 'blumotion', 'NI/ONS', '71B7590'],
      ['overlay', 'inserta', 'spring', 'NI', '71T7590'],
      ['overlay', 'inserta', 'unsprung', 'NI/ONS', '70T7590.TL'],
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '71B7550'],
      ['overlay', 'screw-on', 'spring', 'NI', '71T7550'],
      ['overlay', 'screw-on', 'unsprung', 'NI/ONS', '70T7550.TL'],
      ['overlay', 'knock-in', 'blumotion', 'NI/ONS', '71B7580'],
      ['overlay', 'knock-in', 'spring', 'NI', '71T7580'],
      ['dual', 'inserta', 'blumotion', 'NI/ONS', '71B7690'],
      ['dual', 'inserta', 'unsprung', 'NI', '70T7690.TL'],
      ['dual', 'screw-on', 'blumotion', 'NI/ONS', '71B7650'],
      ['dual', 'screw-on', 'spring', 'NI', '71T7650'],
      ['dual', 'screw-on', 'unsprung', 'NI', '70T7650.TL'],
    ]),
    part('arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI or ONS', 84),
    part('arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 84, { colour: 'NI' }),
    part('opening-angle-stop', '70T7553.09', 'Opening angle stop 92°, dark grey', 84),
    part('opening-angle-stop', '70T7553', 'Opening angle stop 110°, RAL 7037 dust grey', 84),
    ...tipOnAll(84),
    part('boss-cover-cap', '70T7504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 84, { action: 'blumotion' }),
    part('boss-cover-cap', '70T7504', 'Hinge boss cover cap, CLIP top, NI or ONS', 84, { action: 'spring' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm', 84),
    ...screws(84),
    ram(84),
    part('mounting-plate', '175H9160', 'Mounting plate 6 mm spacing, rebated dual application', 87, { application: 'dual' }),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 85),
    drillingDistanceTB: d('3-8 (overlay, dual), 3-7 (inset)', 'Drilling distance TB: door edge to cup edge', 85),
    minFrontThickness: d(11.7, 'Minimum front thickness ("min 11.7" on drilling diagram)', 85),
    dowelDiameter: d(8, 'Boss dowel hole diameter, INSERTA / knock-in', 85),
    dowelSpacing: d(45, 'Distance between the two dowel holes', 85),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 85),
    bossLength: d(57, 'Hinge boss body length', 85),
    bossWidth: d('37.5 (INSERTA 43)', 'Hinge boss body width', 85),
    bossHeight: d('3.2 (INSERTA 6.4)', 'Hinge boss height', 85),
    faRangeOverlay: txt('5 to 19', 'Overlay FA covered by TB table (0-protrusion)', 85),
    faRangeDual: txt('-4.5 to 9.5', 'Dual FA covered by TB table', 85),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay front overlay (TB 3-8)', 85),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual front overlay (TB 3-8)', 85),
    insetTable: txt('MD 9 only: FA -4.5..-0.5 gives TB 3..7', 'Inset table printed only for MD = 9 (use half-overlay hinge with 9 mm plate)', 85),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position by this much', 85),
    protrusionOverlayMax: d(62, 'Hinge reach at 90° opening, overlay (diagram "max 62")', 85),
    protrusionDualMax: d(72, 'Hinge reach at 90° opening, dual (diagram "max 72")', 85),
    protrusionInsetMax: d(81, 'Hinge reach at 90° opening, inset (diagram "max 81")', 85),
    minGapTable: txt(
      gapRows('TB', [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], {
        '3': [0, 0, 0, 0, 0, 0.5, 0.5, 1.0, 2.0, 2.0, 3.0, 4.5],
        '4': [0, 0, 0, 0, 0, 0.5, 1.0, 2.0, 2.0, 2.5, 4.0],
        '5': [0, 0, 0, 0, 0, 0.5, 1.0, 2.0, 2.0, 3.5],
        '6': [0, 0, 0, 0, 0, 1.0, 1.5, 2.0, 3.0],
        '7': [0, 0, 0, 0, 0, 1.0, 1.5, 2.5],
        '8': [0, 0, 0, 0, 0, 1.0, 1.5],
      }),
      'Minimum gap F (mm) by TB and FD (FD 20 upward), R = 1 mm, factory setting; shorter rows end where the table ends. Trial recommended for overlay against a wall.',
      85,
    ),
    ...adj(85, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
    mitreAllEdges19: txt('FD 19 mm: see p.86', 'Mitred application, all 4 edges, FD 19 / 22 / 24 mm and side mitres 19 / 22 / 24 mm shown with dual hinge and 0 mm standard plate (plate dimension A = 37)', 86),
    mitreLargeOverlay: txt('FD 16/19, 19/19; front overlay max 34', 'Mitred side application with large overlay (hinge for overlay, 0 mm plate, opening angle stop 110° 70T7553)', 87),
    rebatedFronts: txt('FD 10, 13, 16 mm; plate 175H9160 (6 mm); X max / Y max by cabinet situation', 'Rebated applications with dual hinge; stop 110° 70T7553. X max / Y max pairs per situation are in the p.87 table (not fully transcribed).', 87),
  },
  drilling: cupRules(85, 'ct155', { cup: 35, tb: [3, 8], dowels: true }),
  notes: [
    TRIAL_NOTE,
    TB_NOTE,
    'Safety information: where young children have access to furniture with wide angle hinges, the 155° 0-protrusion hinges should be used (p.88).',
    'Inset: no inset hinge; use half-overlay hinge and 9 mm spaced mounting plate.',
    'unverified: mitred-door dimensions on pp.86-87 (R radii, 45° mitre offsets) and the rebated X max / Y max table are not transcribed; see the printed pages.',
  ],
  pages: [84, 85, 86, 87],
};

const hinge170: FittingVariant = {
  id: 'clip-top-170',
  name: 'CLIP top 170° hinge',
  summary: '170° hinge, overlay and dual; inset via half-overlay hinge with 9 mm plate. CLIP top only (no BLUMOTION version); BLUMOTION via 973A clip-on.',
  choices: { application: ['overlay', 'dual'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['spring', 'unsprung'], colour: ['NI'], mountingPlateSpacing: [0, 9] },
  parts: [
    ...hinges(88, 'CLIP top 170°', [
      ['overlay', 'inserta', 'spring', 'NI', '71T6540B'],
      ['overlay', 'inserta', 'unsprung', 'NI', '70T6540BTL'],
      ['overlay', 'screw-on', 'spring', 'NI', '71T6550'],
      ['overlay', 'screw-on', 'unsprung', 'NI', '70T6550.TL'],
      ['overlay', 'knock-in', 'spring', 'NI', '71T6580'],
      ['dual', 'inserta', 'spring', 'NI', '71T6640B'],
      ['dual', 'screw-on', 'spring', 'NI', '71T6650'],
      ['dual', 'screw-on', 'unsprung', 'NI', '70T6650.TL'],
      ['dual', 'knock-in', 'spring', 'NI', '71T6680'],
    ]),
    part('blumotion-clip-on', '973A6000', 'BLUMOTION 973A clip-on', 88),
    part('arm-cover-cap', '80.6507', 'Hinge arm cover cap, plain, NI', 88),
    part('arm-cover-cap', '80.6507.BP', 'Hinge arm cover cap, Blum stamped, NI', 88),
    part('opening-angle-stop', '70.6103', 'Opening angle stop 130°, black (on request)', 88),
    ...tipOnAll(88),
    ...screws(88),
    ram(88),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 89),
    drillingDistanceTB: d('3-8 (overlay, dual), 3-7 (inset)', 'Drilling distance TB: door edge to cup edge', 89),
    minFrontThickness: d('11 (INSERTA 11.2)', 'Minimum front thickness: screw-on min 11, INSERTA / knock-in min 11 (11.2 in brackets)', 89),
    dowelDiameter: d(8, 'Boss dowel hole diameter', 89),
    dowelSpacing: d(45, 'Distance between the two dowel holes', 89),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 89),
    bossLength: d('57 (65)', 'Hinge boss body length; INSERTA value in brackets', 89),
    bossWidth: d(47, 'Hinge boss body width', 89),
    bossHeight: d('2.2 (7.5)', 'Hinge boss height; INSERTA value in brackets', 89),
    faRangeOverlay: txt('5 to 19', 'Overlay FA covered by TB table', 89),
    faRangeDual: txt('-4.5 to 9.5', 'Dual FA covered by TB table', 89),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay front overlay (TB 3-8)', 89),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual front overlay (TB 3-8)', 89),
    insetTable: txt('MD 9 only: FA -4.5..-0.5 gives TB 3..7', 'Inset table printed only for MD = 9', 89),
    protrusionOverlayMax: d(65, 'Hinge reach at 90° opening, overlay (diagram)', 89),
    protrusionDualMax: d(75, 'Hinge reach at 90° opening, dual (diagram)', 89),
    protrusionInsetMax: d(84, 'Hinge reach at 90° opening, inset (diagram)', 89),
    minGapRule: txt('FD up to 21: no gap F needed; FD above 22: trial recommended', 'Minimum gap F rule at 90° opening', 89),
    ...adj(89, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: cupRules(89, 'ct170', { cup: 35, tb: [3, 8], dowels: true }),
  notes: [
    TB_NOTE,
    'Safety information p.711: see catalogue p.711 for wide-angle hinges and young children; p.88 recommends the 155° 0-protrusion hinge where children can reach.',
    'Mitred application: see 155° variant (p.86).',
  ],
  pages: [88, 89],
};

// ---------------------------------------------------------------------------------------------------------------

const profile95: FittingVariant = {
  id: 'profile-door-95',
  name: 'Profile / thick door hinge 95°',
  summary: 'Hinge for thick doors and doors with profile.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: MD_CHOICE },
  parts: [
    ...hinges(90, 'CLIP top 95° profile', [
      ['overlay', 'inserta', 'blumotion', 'NI/ONS', '71B9590'],
      ['overlay', 'inserta', 'spring', 'NI', '71T9590B'],
      ['overlay', 'inserta', 'unsprung', 'NI/ONS', '70T9590BTL'],
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '71B9550'],
      ['overlay', 'screw-on', 'spring', 'NI', '71T9550'],
      ['overlay', 'screw-on', 'unsprung', 'NI/ONS', '70T9550.TL'],
      ['overlay', 'knock-in', 'blumotion', 'NI/ONS', '71B9580'],
      ['overlay', 'knock-in', 'spring', 'NI', '71T9580'],
      ['overlay', 'knock-in', 'unsprung', 'ONS', '70T9580.TL'],
      ['dual', 'inserta', 'blumotion', 'NI/ONS', '71B9690'],
      ['dual', 'screw-on', 'blumotion', 'NI/ONS', '71B9650'],
      ['dual', 'screw-on', 'spring', 'NI', '71T9650'],
      ['dual', 'screw-on', 'unsprung', 'NI/ONS', '70T9650.TL'],
      ['dual', 'knock-in', 'blumotion', 'NI', '71B9680'],
      ['inset', 'inserta', 'blumotion', 'NI/ONS', '71B9790'],
      ['inset', 'screw-on', 'blumotion', 'NI/ONS', '71B9750'],
      ['inset', 'screw-on', 'spring', 'NI', '71T9750'],
      ['inset', 'screw-on', 'unsprung', 'NI/ONS', '70T9750.TL'],
      ['inset', 'knock-in', 'blumotion', 'NI', '71B9780'],
    ]),
    ...coverCaps(90, [
      ['overlay', 'plain', 'NI/ONS', '70.1553'],
      ['overlay', 'stamped', 'NI', '70.1553.BP'],
      ['dual', 'plain', 'NI/ONS', '70.1663'],
      ['dual', 'stamped', 'NI', '70.1663.BP'],
      ['inset', 'plain', 'NI/ONS', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    ...tipOnAll(90),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 90, { action: 'blumotion' }),
    part('boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI or ONS', 90, { action: 'spring' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm, BLUMOTION', 90, { action: 'blumotion' }),
    ...screws(90),
    ram(90),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 91),
    drillingDistanceTB: d('3-7', 'Drilling distance TB: door edge to cup edge', 91),
    minFrontThickness: d('B 13, T 12.3 (INSERTA T 12.6)', 'Minimum front thickness: B = BLUMOTION, T = CLIP top; INSERTA / knock-in T in brackets', 91),
    dowelDiameter: d(8, 'Boss dowel hole diameter', 91),
    dowelSpacing: d(45, 'Distance between the two dowel holes', 91),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 91),
    bossLength: d('B 57, T 57 (INSERTA 65)', 'Boss body length', 91),
    bossWidth: d('B 37.5 (43), T 37 (40.5)', 'Boss body width; INSERTA in brackets', 91),
    bossHeight: d('B 3.2 (6.4), T 3.2 (7)', 'Boss height; INSERTA in brackets', 91),
    faRangeOverlay: txt('5 to 18', 'Overlay FA covered by TB table', 91),
    faRangeDual: txt('-4.5 to 8.5', 'Dual FA covered by TB table', 91),
    faRangeInset: txt('-7 to 0', 'Inset FA covered by TB table', 91),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay front overlay (TB 3-7)', 91),
    tbFormulaDual: txt('FA = TB + 1.5 - MD', 'Dual front overlay (TB 3-7)', 91),
    tbFormulaInset: txt('FA = TB - 7 - MD', 'Inset front overlay (TB 3-7)', 91),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position by this much', 91),
    minGapTable: txt(
      [
        ...gapRows('TB', [16, 18, 19, 20, 22, 24, 26, 28, 29, 30, 31, 32], {
          '3': [0.2, 0.3, 0.4, 0.5, 0.8, 1.0, 1.5, 1.9, 2.8, 3.6, 4.5, 5.4],
          '4': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 2.5, 3.1, 4.0, 4.8],
          '5': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 2.3, 2.7, 3.5, 4.3],
          '6': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 2.2, 2.5, 3.2, 3.8],
          '7': [0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.4, 1.7, 2.1, 2.4, 3.0, 3.5],
        }),
        'Additional for +2 mm side adjustment, FD16..FD32: +0.1 +0.2 +0.2 +0.2 +0.3 +0.4 +0.4 +0.5 +0.4 +0.4 +0.4 +0.3',
      ],
      'Minimum gap F (mm) by TB and FD, R = 1 mm, factory setting',
      91,
    ),
    ...adj(91, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: cupRules(91, 'profile95', { cup: 35, tb: [3, 7], dowels: true }),
  notes: [NO_MIX_NOTE, TB_NOTE],
  pages: [90, 91],
};

const profile125: FittingVariant = {
  id: 'profile-125',
  name: 'Profile / thick door hinge 125°, 0-protrusion',
  summary: '125° hinge for thick doors and profile doors; overlay (0-protrusion) with screw-on or knock-in boss; dual/inset via plate spacing.',
  choices: { application: ['overlay'], boss: ['screw-on', 'knock-in'], action: ['blumotion'], colour: COLOUR_CHOICE, mountingPlateSpacing: [0, 9, 18] },
  parts: [
    ...hinges(92, 'CLIP top BLUMOTION 125°', [
      ['overlay', 'screw-on', 'blumotion', 'NI/ONS', '71B7550D'],
      ['overlay', 'knock-in', 'blumotion', 'NI', '71B7580D'],
    ]),
    part('arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI or ONS', 92),
    part('arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 92),
    part('opening-angle-stop', '70T7553', 'Opening angle stop 92°, RAL 7037', 92),
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring', 92),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring', 92),
    part('boss-cover-cap', '70T7504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 92),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm', 92),
    ...screws(92),
    ram(92),
    part('mounting-plate', '175H7190', 'Mounting plate 9 mm spacing (mitred applications)', 94),
  ],
  dims: {
    cupDiameter: d(35, 'Hinge cup hole diameter (knock-in +0.2/0)', 93),
    drillingDistanceTB: d('3-8', 'Drilling distance TB: door edge to cup edge (inset 3-6)', 93),
    minFrontThickness: d(11.7, 'Minimum front thickness ("min 11.7" on drilling diagram)', 93),
    dowelDiameter: d(8, 'Knock-in dowel hole diameter', 93),
    dowelSpacing: d(45, 'Distance between the two dowel holes', 93),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 93),
    bossLength: d(57, 'Boss body length', 93),
    bossWidth: d(37.5, 'Boss body width', 93),
    bossHeight: d(3.2, 'Boss height', 93),
    faRangeOverlay: txt('5 to 19', 'Overlay FA covered by TB table', 93),
    tbFormulaOverlay: txt('FA = TB + 11 - MD', 'Overlay front overlay (TB 3-8)', 93),
    protrusionOverlayMax: d(62, 'Hinge reach at 90° opening, overlay (diagram)', 93),
    protrusionDualMax: d(71, 'Hinge reach at 90° opening, dual (diagram)', 93),
    protrusionInsetMax: d(80, 'Hinge reach at 90° opening, inset (diagram)', 93),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position', 93),
    minGapTable: txt(
      gapRows('TB', [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], {
        '3': [0, 0, 0, 0.1, 0.3, 0.7, 1.2, 2.0, 2.8, 4.1, 5.7],
        '4': [0, 0, 0, 0.1, 0.4, 0.8, 1.5, 2.3, 3.4, 4.9],
        '5': [0, 0, 0, 0.1, 0.4, 1.0, 1.7, 2.8, 4.2],
        '6': [0, 0, 0, 0.1, 0.6, 1.2, 2.1, 3.5],
        '7': [0, 0, 0, 0.2, 0.7, 1.6, 2.8],
        '8': [0, 0, 0, 0.3, 1.0, 2.0],
      }),
      'Minimum gap F (mm) by TB and FD (FD 29 upward), R = 1 mm, factory setting; rows end where the table ends. Trial recommended for overlay against a wall.',
      93,
    ),
    ...adj(93, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
    mitreAllEdges: txt('FD 22 / 25 / 28 mm, plate 175H7190 (9 mm), 125° hinge for overlay', 'Mitred application, all 4 edges (p.94); side mitres FD 22 / 25 / 30 mm with 175H7190', 94),
    mitreLargeOverlay: txt('FD 19/24, 19/19; front overlay max 39', 'Mitred with large overlay on standard 0 mm plate; stop 92° 70T7553 (p.95)', 95),
    thinProtruding: txt('16 + 6 mm, 125° or 92°', 'Thin materials, protruding (16 mm + 6 mm), standard 0 mm plate (p.95)', 95),
  },
  drilling: cupRules(93, 'profile125', { cup: 35, tb: [3, 8], dowels: true }).map((r) =>
    r.id.endsWith('dowels') ? { ...r, when: { boss: ['knock-in'] } } : r,
  ),
  notes: [
    TRIAL_NOTE,
    TB_NOTE,
    'Dual application: use hinge for overlay with 9 mm spaced mounting plate; inset: use hinge for overlay with 18 mm spaced mounting plate (p.92).',
    'unverified: p.93 dual and inset TB-to-FA table rows could not be read reliably (inconsistent offsets in the layout); only the overlay table is transcribed.',
    'unverified: mitre / thin-material dimension callouts on pp.94-95 not transcribed.',
  ],
  pages: [92, 93, 94, 95],
};

// ---------------------------------------------------------------------------------------------------------------

const blindInset: FittingVariant = {
  id: 'blind-corner-inset',
  name: 'Blind corner hinge, inset application',
  summary: '95° (and 83° on request) hinge for blind corner cabinets, inset door beside a muntin.',
  choices: { application: ['inset'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'unsprung'], openingAngle: [95, 83], colour: COLOUR_CHOICE, mountingPlateSpacing: [3] },
  parts: [
    part('hinge', '79B9590', 'CLIP top BLUMOTION 95°, INSERTA, NI or ONS', 96, { boss: 'inserta', action: 'blumotion', openingAngle: 95 }),
    part('hinge', '79B9550', 'CLIP top BLUMOTION 95°, screw-on, NI or ONS', 96, { boss: 'screw-on', action: 'blumotion', openingAngle: 95 }),
    part('hinge', '78T9550.TL', 'CLIP top unsprung 95°, screw-on, NI', 96, { boss: 'screw-on', action: 'unsprung', openingAngle: 95, colour: 'NI' }),
    part('hinge', '79B9580', 'CLIP top BLUMOTION 95°, knock-in, NI or ONS', 96, { boss: 'knock-in', action: 'blumotion', openingAngle: 95 }),
    part('hinge', '79B9550.83', 'CLIP top BLUMOTION 83°, screw-on, NI (on request)', 96, { boss: 'screw-on', action: 'blumotion', openingAngle: 83, colour: 'NI' }),
    part('hinge', '78T9550.83', 'CLIP top unsprung 83°, screw-on, NI (on request)', 96, { boss: 'screw-on', action: 'unsprung', openingAngle: 83, colour: 'NI' }),
    ...coverCaps(96, [
      ['all', 'plain', 'NI/ONS', '70.1503'],
      ['all', 'stamped', 'NI/ONS', '70.1503.BP'],
    ]),
    ...tipOnAll(96).slice(0, 4),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 96, { action: 'blumotion' }),
    part('boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI', 96, { action: 'unsprung' }),
    ...screws(96),
    ram(96),
  ],
  dims: {
    mountingPlateSpacing: d(3, 'Factory-setting mounting plate spacing; use 3 mm standard plates only so door and muntin are flush inside', 97),
    plateSetBack: d(21.5, 'Move standard plate fixing positions 15.5 mm nearer the muntin edge, i.e. set back 21.5 mm (diagram 21.5)', 97),
    gapFormula: txt('F = 8 - TB', 'Gap F from drilling distance TB (F = 8 mm - TB)', 97),
    drillingDistanceTB: d('3-7', 'Drilling distance TB: door edge to cup edge', 97),
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 97),
    minFrontThickness: d('B 13, T 12.3', 'Minimum front thickness, B = BLUMOTION, T = CLIP top', 97),
    dowelDiameter: d(8, 'Boss dowel hole diameter (INSERTA / knock-in)', 97),
    dowelSpacing: d(45, 'Distance between the dowel holes', 97),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 97),
    bossLength: d(57, 'Boss body length', 97),
    bossWidth: d('B 37.5 (43), T 37', 'Boss body width; INSERTA in brackets', 97),
    bossHeight: d('3.2 (6.4)', 'Boss height; INSERTA in brackets', 97),
    minDistanceToMuntin: d(70, 'Hinge reach diagram "min 70"; dimension 51 and 23, 33.5 also on diagram', 97),
    minGapTable: txt(
      gapRows('TB', [16, 18, 19, 20, 22, 24, 26, 28, 29, 30, 31, 32], {
        '3': [0.2, 0.3, 0.4, 0.5, 0.8, 1.0, 1.5, 1.9, 'trial', 'trial', 'trial', 'trial'],
        '4': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '5': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '6': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '7': [0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.4, 1.7, 'trial', 'trial', 'trial', 'trial'],
      }),
      'Minimum gap F (mm) by TB and FD, R = 1 mm, factory setting',
      97,
    ),
    ...adj(97, 'Max. ±3.0 mm (see mounting plates)', '±2.5 mm', '±1.0 mm'),
  },
  drilling: cupRules(97, 'blindinset', { cup: 35, tb: [3, 7], dowels: true }),
  notes: [NO_MIX_NOTE, TB_NOTE, 'unverified: meaning of diagram dimensions 23, 33.5, 51 and "min 70" on p.97 (reference edges not distinguishable).'],
  pages: [96, 97],
};

const blindOverlay: FittingVariant = {
  id: 'blind-corner-overlay',
  name: 'Blind corner hinge, overlay application',
  summary: '95° BLUMOTION hinge for blind corner overlay application; plate spacing depends on frame thickness RD.',
  choices: { application: ['overlay'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion'], colour: ['NI'], frameThickness: [16, 19, 22], mountingPlateSpacing: [6, 3, 0] },
  parts: [
    part('hinge', '79B9990', 'CLIP top BLUMOTION 95°, INSERTA, NI (on request)', 98, { boss: 'inserta' }),
    part('hinge', '79B9950', 'CLIP top BLUMOTION 95°, screw-on, NI', 98, { boss: 'screw-on' }),
    part('hinge', '79B9980', 'CLIP top BLUMOTION 95°, knock-in, NI (on request)', 98, { boss: 'knock-in' }),
    part('arm-cover-cap', '70.1503', 'Hinge arm cover cap, plain, NI', 98),
    part('arm-cover-cap', '70.1503.BP', 'Hinge arm cover cap, Blum stamped, NI', 98),
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring', 98),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring', 98),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI', 98),
    ...screws(98),
    ram(98),
  ],
  dims: {
    plateSpacingByFrameThickness: txt(['RD 16 -> MD 6', 'RD 19 -> MD 3', 'RD 22 -> MD 0'], 'Mounting plate spacing MD required for frame (muntin) thickness RD', 99),
    drillingDistanceTB: d('3-7', 'Drilling distance TB: door edge to cup edge', 99),
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 99),
    minFrontThickness: d(13, 'Minimum front thickness ("min 13")', 99),
    dowelDiameter: d(8, 'Dowel hole diameter', 99),
    dowelSpacing: d(45, 'Distance between dowel holes', 99),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 99),
    bossLength: d(57, 'Boss body length', 99),
    bossWidth: d('37.5 (43)', 'Boss body width; INSERTA in brackets', 99),
    bossHeight: d('3.2 (6.4)', 'Boss height; INSERTA in brackets', 99),
    minReach: d(86, 'Diagram "min 86"', 99),
    minGapTable: txt(
      gapRows('TB', [16, 18, 19, 20, 22, 24, 26, 28, 29, 30, 31, 32], {
        '3': [0.2, 0.3, 0.4, 0.5, 0.8, 1.0, 1.5, 1.9, 'trial', 'trial', 'trial', 'trial'],
        '4': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '5': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '6': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 1.4, 1.8, 'trial', 'trial', 'trial', 'trial'],
        '7': [0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.4, 1.7, 'trial', 'trial', 'trial', 'trial'],
      }),
      'Minimum gap F (mm) by TB and FD, R = 1 mm, factory setting',
      99,
    ),
    ...adj(99, 'Max. ±3.0 mm (see mounting plates)', '±2.5 mm', '±1.0 mm'),
  },
  drilling: cupRules(99, 'blindoverlay', { cup: 35, tb: [3, 7], dowels: true }),
  notes: [TB_NOTE, 'unverified: diagram dimensions 67, 37, 19 (RD), 16.5, 9, 1 on p.99 are not individually assigned to reference edges.', 'Parts marked with a phone symbol on p.98 (INSERTA, knock-in) are available on request.'],
  pages: [98, 99],
};

// ---------------------------------------------------------------------------------------------------------------

const aluBlumotion: FittingVariant = {
  id: 'alu-frame-blumotion-95',
  name: 'CLIP top BLUMOTION 95° aluminium frame door hinge',
  summary: 'Hinge for narrow aluminium frame doors; screw-on boss, boss fixing screws included.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['screw-on'], action: ['blumotion'], colour: ['NI'], sideFrameWidth: [18, 19, 20, 21, 22] },
  parts: [
    ...hinges(100, 'CLIP top BLUMOTION 95° alu frame', [
      ['overlay', 'screw-on', 'blumotion', 'NI', '71B950A'],
      ['dual', 'screw-on', 'blumotion', 'NI', '71B960A'],
      ['inset', 'screw-on', 'blumotion', 'NI', '71B970A'],
    ]),
    ...coverCaps(100, [
      ['overlay', 'plain', 'NI', '70.1553'],
      ['overlay', 'stamped', 'NI', '70.1553.BP'],
      ['dual', 'plain', 'NI', '70.1663'],
      ['dual', 'stamped', 'NI', '70.1663.BP'],
      ['inset', 'plain', 'NI', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring', 100),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring', 100),
  ],
  dims: {
    sideFrameWidthRB: d('18-22', 'Side frame width RB of the aluminium frame', 101),
    bossRoutWidth: d(14.1, 'Boss routing dimension as drawn (14.1 with 3.5 step); see page', 101),
    bossHoleDiameter: d(6, 'Boss hole diameter Ø6 ±0.05', 101),
    bossHolePitch: d(44, 'Boss dimension 44 with 52.5 on the routing drawing (reference not distinguishable)', 101),
    minFrameDepth: d(13.3, 'Diagram "min 13.3"', 101),
    minRoutDepth: d(12.2, 'Diagram "min 12.2"', 101),
    insetPlateSetBack: txt('frame width + 2.5', 'Inset: set mounting plate back by frame width + 2.5 mm', 101),
    minGapTable: txt(
      [
        ...gapRows('RB', [18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32], {
          '18': [0.2, 0.3, 0.4, 0.6, 0.7, 1.2, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '19': [0.2, 0.3, 0.4, 0.6, 0.7, 1.2, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '20': [0.2, 0.3, 0.4, 0.5, 0.7, 1.1, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '21': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '22': [0.2, 0.3, 0.4, 0.5, 0.7, 1.1, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, RD18..RD24: +0.1 +0.2 +0.3 +0.3 +0.3 +0.4',
      ],
      'Minimum gap F (mm) by side frame width RB (rows) and frame thickness RD (columns, labelled FD here), R = 1 mm',
      101,
    ),
    ...adj(101, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: [],
  notes: [
    TRIAL_NOTE,
    'Boss fixing screws are included. No INSERTA or knock-in boss.',
    'unverified: boss routing drawing on p.101 (11.9 ±0.1, 2, R3, 14.1, 3.5, 44, 52.5, 6.5, R17.6) is not assigned to hole positions; drilling rule omitted.',
    TB_NOTE,
  ],
  pages: [100, 101],
};

const aluClipTop: FittingVariant = {
  id: 'alu-frame-clip-top-95',
  name: 'CLIP top 95° aluminium frame door hinge',
  summary: 'Hinge for narrow aluminium frame doors, CLIP top; boss fixing screws included.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['screw-on'], action: ['spring', 'unsprung'], colour: COLOUR_CHOICE, sideFrameWidth: [19, 20, 21, 22] },
  parts: [
    part('hinge', '71T950AB', 'CLIP top 95° alu frame for 973A, overlay, NI', 102, { application: 'overlay', action: 'spring', colour: 'NI' }),
    part('hinge', '71T950A', 'CLIP top 95° alu frame sprung, overlay, NI or ONS', 102, { application: 'overlay', action: 'spring' }),
    part('hinge', '70T950A.TL', 'CLIP top 95° alu frame unsprung, overlay, NI or ONS', 102, { application: 'overlay', action: 'unsprung' }),
    part('hinge', '71T960A', 'CLIP top 95° alu frame sprung, dual, NI or ONS', 102, { application: 'dual', action: 'spring' }),
    part('hinge', '71T970A', 'CLIP top 95° alu frame sprung, inset, NI or ONS', 102, { application: 'inset', action: 'spring' }),
    part('blumotion-clip-on', '973A0500.01', 'BLUMOTION 973A clip-on', 102),
    ...coverCaps(102, [
      ['overlay', 'plain', 'NI/ONS', '70.1553'],
      ['overlay', 'stamped', 'NI', '70.1553.BP'],
      ['dual', 'plain', 'NI/ONS', '70.1663'],
      ['dual', 'stamped', 'NI', '70.1663.BP'],
      ['inset', 'plain', 'NI/ONS', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    ...tipOnAll(102),
  ],
  dims: {
    sideFrameWidthRB: d('19-22', 'Side frame width RB of the aluminium frame', 103),
    bossHoleDiameter: d(7, 'Boss hole Ø7 ±0.1, 90° countersink', 103),
    bossHoleDepthRef: d(11, 'Dimension 11 ±0.1 on the boss drawing', 103),
    insetPlateSetBack: txt('frame width + 1.7', 'Inset: set mounting plate back by frame width + 1.7 mm', 103),
    minGapTable: txt(
      [
        ...gapRows('RB', [18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32], {
          '19': [0.2, 0.3, 0.4, 0.6, 0.7, 1.2, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '20': [0.2, 0.3, 0.4, 0.5, 0.7, 1.1, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '21': [0.2, 0.3, 0.4, 0.5, 0.7, 1.0, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
          '22': [0.2, 0.3, 0.4, 0.5, 0.7, 1.1, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
        }),
        'Additional for +2 mm side adjustment, RD18..RD24: +0.1 +0.2 +0.3 +0.3 +0.3 +0.4',
      ],
      'Minimum gap F (mm) by side frame width RB (rows) and frame thickness RD (columns), R = 1 mm',
      103,
    ),
    ...adj(103, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: [],
  notes: [
    'The hinge boss should be able to support itself in the routing (p.103).',
    'unverified: boss routing drawing dimensions on p.103 (10, 1.2, 16.5, 32.1, 14, 28, 6.9, 17.7, 15.6) are not assigned to hole positions; drilling rule omitted.',
    TB_NOTE,
  ],
  pages: [102, 103],
};

// ---------------------------------------------------------------------------------------------------------------

const thinDoor: FittingVariant = {
  id: 'thin-door-110',
  name: 'Hinge for thin doors (EXPANDO T)',
  summary: 'Thin fronts from 8-14 mm, EXPANDO T fixing, 110°, 0-protrusion; applications set by fixing position B.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['EXPANDO T'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: MD_CHOICE, frontThickness: [8, 9, 10, 11, 12, 13, 14] },
  parts: [
    part('hinge', '71B453T', 'CLIP top BLUMOTION thin door, EXPANDO T, NI or ONS', 104, { action: 'blumotion' }),
    part('hinge', '71T453T', 'CLIP top sprung thin door, EXPANDO T, NI', 104, { action: 'spring', colour: 'NI' }),
    part('hinge', '70T453T.TL', 'CLIP top unsprung thin door, EXPANDO T, NI or ONS', 104, { action: 'unsprung' }),
    part('arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI or ONS', 104),
    part('arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 104),
    part('opening-angle-stop', '70T4503', 'Opening angle stop 85°, dark grey', 104),
    part('opening-angle-stop', '70T4503.09', 'Opening angle stop 92°, RAL 7037', 104),
    ...tipOnAll(104),
    part('boss-cover-cap', '70T4504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 104, { action: 'blumotion' }),
    part('boss-cover-cap', '70T4504', 'Hinge boss cover cap, CLIP top, NI', 104, { action: 'spring', colour: 'NI' }),
  ],
  dims: {
    frontThicknessRange: d('8-14', 'Thin front thickness range; 8 mm and above with sufficient stability and strength', 104),
    fixingPositionFormula: txt('B = FA + 27 + MD', 'Fixing position B (hole centre distance as drawn) from front overlay FA and plate spacing MD', 105),
    fixingPositionRange: d('23.5 to 46', 'Allowed B range: min 23.5, max 46', 105),
    holeDiameter: d('10 ±0.1', 'EXPANDO T hole diameter (stone and ceramic +0.2/-0.1)', 105),
    holePitch: d(32, 'Distance between the two EXPANDO T holes (diagram 32; 44 overall, 34.5, 3.5 also shown)', 105),
    drillingDepthBT: d('min 6', 'Drilling depth BT for the EXPANDO T hole', 105),
    minTighteningTorqueChipboard: d('1.5 Nm (transverse tensile > 0.40 N/mm²)', 'Chipboard', 104, undefined),
    minTighteningTorqueMDF: d('1.5 Nm (transverse tensile > 0.60 N/mm²)', 'MDF', 104, undefined),
    minTighteningTorqueHDF_HPL_Mineral: d('2 Nm', 'HDF, HPL, mineral composites', 104, undefined),
    minTighteningTorqueStone: d('3 Nm', 'Nero Assoluto natural granite, quartz composite artificial stone, ceramic plates', 104, undefined),
    fixingPositionTable: txt(
      [
        'MD0: FA-3.5..-1 step 0.5 -> B 23.5..26; FA 2.5 -> 29.5, then +1.5 FA = +1.5 B up to FA 19 -> 46',
        'Each +3 mm of MD adds +3 to B (MD3: 26.5..., MD6: 29.5..., MD9: 32.5...) with B max 46',
      ],
      'Fixing position B (mm) table summary; the relation is B = FA + 27 + MD. FA columns: -3.5 -3 -2.5 -2 -1.5 -1 2.5 4 5.5 7 8.5 10 11.5 13 14.5 16 17.5 19.',
      105,
    ),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position by this much', 105),
    protrusionMax: d(56.5, 'Hinge reach at 90° opening (diagram "max 56.5")', 105),
    ...adj(105, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: [
    {
      id: 'thin-expando',
      target: 'door',
      label: 'EXPANDO T holes Ø10 (two holes, 32 apart)',
      reference:
        'x = fixing position B, from the front edge as drawn on p.105 (B = FA + 27 + MD; 23.5 is the minimum shown, max 46); y = 0 and 32 along the edge. Reference edge for B follows the p.105 diagram.',
      holes: [
        { x: 23.5, y: 0, diameter: 10, depth: 6, note: 'min depth 6; x = B (23.5..46)' },
        { x: 23.5, y: 32, diameter: 10, depth: 6, note: 'min depth 6; x = B (23.5..46)' },
      ],
      page: 105,
    },
  ],
  notes: [
    TRIAL_NOTE,
    'Drilling depth versus cabinet side thickness SWD (12-20 mm) and front thickness FD (8-14 mm) decides whether MD 0, 3 or 6 mm is required (colour-coded table on p.105). unverified: the individual cells of that colour-coded table are not transcribed.',
    'Blum accepts no liability for EXPANDO T with materials not listed; assembly by an experienced furniture manufacturer is recommended (p.104).',
    'Opening angle stop 85° or 92° available; see also EXPANDO T pp.596-597.',
  ],
  pages: [104, 105],
};

const cristallo: FittingVariant = {
  id: 'cristallo-110',
  name: 'CRISTALLO hinge, glass and mirror doors',
  summary: 'Adhesion plate glued to glass or mirror (no glass drilling); 110°, 0-protrusion.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['self-adhesive'], action: ['blumotion', 'spring', 'unsprung'], colour: COLOUR_CHOICE, mountingPlateSpacing: MD_CHOICE, frontMaterial: ['glass', 'mirror'] },
  parts: [
    part('hinge', '71B4500C', 'CLIP top BLUMOTION CRISTALLO, NI or ONS', 106, { action: 'blumotion' }),
    part('hinge', '71T4500C', 'CLIP top sprung CRISTALLO, NI', 106, { action: 'spring', colour: 'NI' }),
    part('hinge', '70T4500CTL', 'CLIP top unsprung CRISTALLO, NI', 106, { action: 'unsprung', colour: 'NI' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, glass or mirror, matt nickel NI-M', 106, { frontMaterial: 'glass' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, mirror, special nickel NI-S', 106, { frontMaterial: 'mirror' }),
    part('arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI or ONS', 106),
    part('arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 106),
    part('opening-angle-stop', '70T4503', 'Opening angle stop 85°, dark grey', 106),
    part('opening-angle-stop', '70T4503.09', 'Opening angle stop 92°, RAL 7037', 106),
    ...tipOnAll(106),
  ],
  dims: {
    adhesionPlateDistanceFormula: txt('KT = FA + 3.5 + MD', 'Distance of adhesion plate KT from front overlay FA and plate spacing MD', 107),
    adhesionPlateDistanceRange: d('0 to 22.5', 'KT table range: min 0, max 22.5 (MD 0: FA -3.5 -> 0 ... FA 19 -> 22.5)', 107),
    minSurroundingGap: d(2, 'Recommended minimum surrounding gap for glass / mirror doors (risk of breakage)', 107),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position by this much', 107),
    protrusionMax: d(56.5, 'Hinge reach at full opening (diagram "max 56.5")', 107),
    overlayRange: txt('3-8', 'Front overlay / gap range figure on the overlay diagram (3-8)', 107),
    ...adj(107, 'Max. ±3.0 mm (see mounting plates)', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: [],
  notes: [
    'Contact the glass or front supplier for the right adhesive and use; adhesive applied by an experienced glass manufacturer is recommended (pp.106-107).',
    'Blum accepts no liability for adhesive or adhesive-process failures (p.106).',
    TRIAL_NOTE,
  ],
  pages: [106, 107],
};

const cristalloDisplay: FittingVariant = {
  id: 'cristallo-display-110',
  name: 'CRISTALLO hinge, glass display cabinets',
  summary: 'Adhesion plate on door and mounting plate glued to glass cabinet side; overlay and inset.',
  choices: { application: ['overlay', 'inset'], boss: ['self-adhesive'], action: ['blumotion', 'spring', 'unsprung'], colour: ['NI'] },
  parts: [
    part('hinge', '71B4500C', 'CLIP top BLUMOTION CRISTALLO, NI', 108, { action: 'blumotion' }),
    part('hinge', '71T4500C', 'CLIP top sprung CRISTALLO, NI', 108, { action: 'spring' }),
    part('hinge', '70T4500CTL', 'CLIP top unsprung CRISTALLO, NI', 108, { action: 'unsprung' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, glass or mirror, NI-M', 108, { frontMaterial: 'glass' }),
    part('adhesion-plate', '70T4568C', 'CRISTALLO adhesion plate, mirror, NI-S', 108, { frontMaterial: 'mirror' }),
    part('mounting-plate', '175M4C20N', 'CRISTALLO mounting plate, self-adhesive, glass or mirror, NI-M', 108),
    part('arm-cover-cap', '70.4503', 'Hinge arm cover cap, plain, NI', 108),
    part('arm-cover-cap', '70.4503.BP', 'Hinge arm cover cap, Blum stamped, NI', 108),
    part('opening-angle-stop', '70T4503', 'Opening angle stop 85°, dark grey', 108),
    part('opening-angle-stop', '70T4503.09', 'Opening angle stop 92°, RAL 7037', 108),
  ],
  dims: {
    mountingPlateDistanceInset: txt('KM = FD + 4.5', 'Distance KM of the mounting plate for inset (FD = front thickness)', 109),
    mountingPlateDistanceOverlay: d(3, 'Distance KM of the mounting plate for overlay (KM = 3 mm)', 109),
    adhesionPlateDistanceOverlay: txt('KT = FA + 5.5', 'Distance KT of the adhesion plate, overlay', 109),
    adhesionPlateDistanceInset: txt('KT = 5.5 - F', 'Distance KT of the adhesion plate, inset (F = gap)', 109),
    protrusionMax: d(58.5, 'Hinge reach at full opening (diagram "max 58.5")', 109),
    minSurroundingGap: d(2, 'Recommended minimum surrounding gap (risk of glass breakage)', 109),
    overlayRange: txt('3-8', 'Front overlay range shown on the overlay diagram', 109),
    ...adj(109, 'Max. ±2.0 mm', '±2.0 mm', '+3.0 mm / -2.0 mm'),
  },
  drilling: [],
  notes: [
    'Contact the glass or front supplier for the right adhesive; adhesion by an experienced glass manufacturer recommended (pp.108-109).',
    'unverified: p.109 diagram constants 77, 5.5, 64, 52, 30.2, 4.5 not assigned to reference edges. The adjustment row order (height, side, depth) is read from the layout.',
    TRIAL_NOTE,
  ],
  pages: [108, 109],
};

const bathroomMirror: FittingVariant = {
  id: 'bathroom-mirror-95',
  name: 'Hinge for bathroom mirror cabinets (fronts protruding all round)',
  summary: 'Double cranked hinge arm, mounting plate glued onto the front, boss drilling on the cabinet; wall cabinets only.',
  choices: { application: ['overlay'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'unsprung'], colour: ['NI'] },
  parts: [
    part('hinge', '71B9790', 'CLIP top BLUMOTION 95° double cranked, INSERTA, NI', 110, { boss: 'inserta', action: 'blumotion' }),
    part('hinge', '71B9750', 'CLIP top BLUMOTION 95° double cranked, screw-on, NI', 110, { boss: 'screw-on', action: 'blumotion' }),
    part('hinge', '70T9750.TL', 'CLIP top unsprung 95° double cranked, screw-on, NI', 110, { boss: 'screw-on', action: 'unsprung' }),
    part('mounting-plate', '175M4C20N', 'CRISTALLO mounting plate, self-adhesive, glass or mirror, NI-M', 110),
    part('arm-cover-cap', '70.1663', 'Hinge arm cover cap, plain, NI', 110),
    part('arm-cover-cap', '70.1663.BP', 'Hinge arm cover cap, Blum stamped, NI', 110),
    ...tipOnAll(110),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI', 110, { action: 'blumotion' }),
    part('boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI', 110, { action: 'unsprung' }),
    ...screws(110),
  ],
  dims: {
    mountingPlateDistance: txt('KM = FA + 4.5', 'Distance KM of the mounting plate from front overlay FA', 111),
    maxFrontOverlay: d(70, 'Maximum front overlay FA ("Max. 70 mm")', 111),
    frontOverlayRange: d('3-8', 'Range printed on diagram', 111),
    minFrontThickness: d('B 13, T 12.3', 'Minimum front thickness for the boss drilling (B = BLUMOTION, T = CLIP top)', 111),
    dowelRef: d(8, 'Dowel hole Ø8 +0.2/0 as printed, boss drilling pattern as per standard INSERTA / knock-in', 111),
    ...adj(111, 'Max. ±2.0 mm', '+2.0 mm / -3.0 mm', '±2.0 mm'),
  },
  drilling: [],
  notes: [
    'Only recommended for wall cabinets due to lower load bearing limits (p.110).',
    'unverified: boss drilling pattern and diagram constants 68.5, 46.5 (52), 19, 7, FA+5, 64, 30.2 on p.111; adjustment column order is read from layout.',
    'Hinge has CLIP top without closing mechanism in the unsprung option; BLUMOTION option available.',
  ],
  pages: [110, 111],
};

const glassHinge: FittingVariant = {
  id: 'glass-door-94',
  name: 'Glass door hinge 94°',
  summary: 'Screw-on glass door hinge for front thickness 4.5-7 mm, sprung; boss fixing screws included.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['screw-on'], action: ['spring'], colour: ['NI'], frontThickness: [4.5, 5, 5.5, 6, 6.5, 7], mountingPlateSpacing: MD_CHOICE },
  parts: [
    part('hinge', '75T4100', 'CLIP top 94° glass door, overlay, screw-on, NI', 112, { application: 'overlay' }),
    part('hinge', '75T4200', 'CLIP top 94° glass door, dual, screw-on, NI', 112, { application: 'dual' }),
    part('hinge', '75T4300', 'CLIP top 94° glass door, inset, screw-on, NI', 112, { application: 'inset' }),
    part('boss-cover-cap', '84.4120', 'Hinge boss cover cap, round, SZ / CR / NI-M', 112),
    part('boss-cover-cap', '84.4140', 'Hinge boss cover cap, long, SZ / CR / NI-M', 112),
    part('blumotion-clip-on', '971Axxxx', 'BLUMOTION 971A in adapter plate (overlay), type code incomplete in catalogue', 112, { application: 'overlay' }),
    part('blumotion-clip-on', '970A1002', 'BLUMOTION 970A for drilling, dual', 112, { application: 'dual' }),
    part('blumotion-clip-on', '970A1002', 'BLUMOTION 970A for drilling, inset', 112, { application: 'inset' }),
    part('arm-cover-cap', '70.1553', 'Hinge arm cover cap, plain, NI', 112),
    part('arm-cover-cap', '70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI', 112),
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring', 112),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring', 112),
  ],
  dims: {
    frontThickness: d('4.5-7', 'Front thickness FD range for the glass door hinge', 112),
    cupDiameter: d(26, 'Boss hole diameter Ø26 -0.2/0', 113),
    drillingDistanceTB: d('5.5-7', 'Drilling distance TB: door edge to hole edge', 113),
    bossWidth: d(31, 'Hinge boss / cover cap width 31', 113),
    faRangeOverlay: txt('7 to 17', 'Overlay FA covered by TB table', 113),
    faRangeDual: txt('-2.5 to 7.5', 'Dual FA covered by TB table', 113),
    tbFormulaOverlay: txt('FA = TB + 10 - MD', 'Overlay front overlay (TB 6-7 in table; TB 5.5-7 allowed)', 113),
    tbFormulaDual: txt('FA = TB + 0.5 - MD', 'Dual front overlay', 113),
    tbFormulaInset: txt('FA = TB - 8 - MD', 'Inset front overlay (diagram dimension 8)', 113),
    insetPlateSetBack: txt('FD + boss cover height + 3', 'Inset: move back mounting plate fixing position by front thickness FD and height of boss cover + 3 mm', 113),
    minGapRule: txt('FD 4.5-7: no gap F required', 'Minimum gap F', 113),
    ...adj(113, 'Max. ±3.0 mm (see mounting plates)', '+0.5 mm / -3.5 mm', '±2.0 mm'),
  },
  drilling: [
    {
      id: 'glass-boss',
      target: 'door',
      label: 'Boss hole Ø26 in glass door',
      reference: 'x from the door edge on the hinge side to the hole edge is TB 5.5-7, so centre x = TB + 13 (shown for TB 6.25); y = 0 on hinge centre line. Depth: not printed.',
      holes: [{ x: 19.25, y: 0, diameter: 26, note: 'TB 5.5-7; Ø26 -0.2/0' }],
      page: 113,
    },
  ],
  notes: [
    'Boss fixing screws are included.',
    'unverified: p.113 states a 5.5/7 front-edge distance dimension next to the Ø26 hole; whether this is TB or the front thickness FD is read from the layout (TB 5.5-7 in table header).',
    'Part 971Axxxx is printed with placeholder letters in the catalogue; not a complete part number.',
  ],
  pages: [112, 113],
};

const miniHinge: FittingVariant = {
  id: 'frame-door-mini-94',
  name: 'Mini-hinge 94°',
  summary: 'Hinge for small doors and doors with narrow frames; screw-on boss, sprung.',
  choices: { application: ['overlay', 'dual', 'inset'], boss: ['screw-on'], action: ['spring'], colour: ['NI'], mountingPlateSpacing: MD_CHOICE },
  parts: [
    part('hinge', '71T0550', 'CLIP top 94° mini-hinge, overlay, screw-on, NI', 114, { application: 'overlay' }),
    part('hinge', '71T0650', 'CLIP top 94° mini-hinge, dual, screw-on, NI', 114, { application: 'dual' }),
    part('hinge', '71T0750', 'CLIP top 94° mini-hinge, inset, screw-on, NI', 114, { application: 'inset' }),
    part('blumotion-clip-on', '971Axxxx', 'BLUMOTION 971A in adapter plate (overlay), type code incomplete in catalogue', 114, { application: 'overlay' }),
    part('blumotion-clip-on', '970A1002', 'BLUMOTION 970A for drilling, dual', 114, { application: 'dual' }),
    part('blumotion-clip-on', '970A1002', 'BLUMOTION 970A for drilling, inset', 114, { application: 'inset' }),
    part('arm-cover-cap', '70.1553', 'Hinge arm cover cap, plain, NI', 114),
    part('arm-cover-cap', '70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI', 114),
    part('tip-on', '956A1006', 'TIP-ON extended, standard spring', 114),
    part('tip-on', '956A1006F', 'TIP-ON extended, strong spring', 114),
    ...screws(114),
  ],
  dims: {
    cupDiameter: d(26, 'Boss hole diameter Ø26 +0.2/0', 115),
    drillingDistanceTB: d('3-5', 'Drilling distance TB: door edge to hole edge', 115),
    minFrontThickness: d(12.5, 'Minimum front thickness ("min 12.5" on drilling diagram)', 115),
    bossLength: d(50, 'Boss body length', 115),
    bossWidth: d(28, 'Boss body width', 115),
    bossHeight: d(3.5, 'Boss height', 115),
    faRangeOverlay: txt('4 to 15', 'Overlay FA covered by TB table', 115),
    faRangeDual: txt('-5.5 to 5.5', 'Dual FA covered by TB table', 115),
    faRangeInset: txt('-8 to -3', 'Inset FA covered by TB table', 115),
    tbFormulaOverlay: txt('FA = TB + 10 - MD', 'Overlay front overlay (TB 3-5)', 115),
    tbFormulaDual: txt('FA = TB + 0.5 - MD', 'Dual front overlay (TB 3-5)', 115),
    tbFormulaInset: txt('FA = TB - 8 - MD', 'Inset front overlay (TB 3-5)', 115),
    insetPlateSetBack: txt('FD + 1.5', 'Inset: move back mounting plate fixing position', 115),
    minGapTable: txt(
      gapRows('TB', [16, 18, 19, 20, 22, 23, 24, 26, 28, 30, 31, 32], {
        '3': [1.1, 2.2, 3.0, 3.8, 5.5, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
        '4': [1.1, 2.0, 2.7, 3.5, 5.0, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
        '5': [1.1, 1.8, 2.4, 3.0, 4.6, 'trial', 'trial', 'trial', 'trial', 'trial', 'trial', 'trial'],
      }),
      'Minimum gap F (mm) by TB and FD, R = 1 mm, factory setting',
      115,
    ),
    ...adj(115, 'Max. ±3.0 mm (see mounting plates)', '+0.5 mm / -3.5 mm', '+3.0 mm / -1.0 mm'),
  },
  drilling: [
    {
      id: 'mini-boss',
      target: 'door',
      label: 'Boss hole Ø26',
      reference: 'x from the door edge on the hinge side to the hole edge is TB 3-5, so centre x = TB + 13 (shown for TB 4); y = 0 on hinge centre line. Depth not printed.',
      holes: [{ x: 17, y: 0, diameter: 26, note: 'TB 3-5; Ø26 +0.2/0' }],
      page: 115,
    },
  ],
  notes: [
    'unverified: p.115 drilling diagram also shows 7.5 and 38; their reference points are ambiguous in the layout.',
    'Part 971Axxxx is printed with placeholder letters in the catalogue; not a complete part number.',
  ],
  pages: [114, 115],
};

// ---------------------------------------------------------------------------------------------------------------

const biFold: FittingVariant = {
  id: 'bi-fold-corner-60',
  name: 'Corner cabinet bi-fold hinge 60°',
  summary: 'Special 60° hinge for corner cabinets with bi-fold doors; used with a 155° or 170° hinge. FD 15-23 mm, factory setting for 19 mm.',
  choices: { application: ['bi-fold corner'], boss: ['screw-on', 'knock-in'], action: ['spring'], colour: COLOUR_CHOICE, frontThickness: [15, 16, 17, 18, 19, 20, 21, 22, 23], mountingPlateSpacing: [0, 3] },
  parts: [
    part('hinge', '79T8500', 'CLIP top 60° bi-fold hinge, screw-on, NI or ONS', 116, { boss: 'screw-on' }),
    part('hinge', '79T8530', 'CLIP top 60° bi-fold hinge, knock-in, NI', 116, { boss: 'knock-in' }),
    part('blumotion-clip-on', '970.1002', 'BLUMOTION 970 for drilling', 116),
    part('arm-cover-cap', '70.1503', 'Hinge arm cover cap, plain, NI or ONS', 116),
    part('arm-cover-cap', '70.1503.BP', 'Hinge arm cover cap, Blum stamped, NI or ONS', 116),
    part('companion-hinge', '155°', 'Also requires CLIP top 155° hinge (see 155° variant, p.84)', 116),
    part('companion-hinge', '170°', 'Also requires CLIP top 170° hinge (see 170° variant, p.88)', 116),
    ...screws(116),
    ram(116),
  ],
  dims: {
    frontThicknessRange: d('15-23', 'Front thickness FD range; factory setting for FD 19', 116),
    cupDiameter: d(35, 'Hinge cup hole diameter (knock-in +0.2/0)', 117),
    minFrontThickness: d(11, 'Minimum front thickness ("min 11" on drilling diagram)', 117),
    cupEdgeDistance: d(12.5, 'Distance from the door edge to the cup centre ... shown as 12.5 on the drilling diagram (reference as drawn; not a TB range)', 117),
    dowelDiameter: d(8, 'Knock-in dowel hole diameter', 117),
    dowelSpacing: d(45, 'Distance between the dowel holes', 117),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 117),
    bossLength: d(57, 'Boss body length', 117),
    bossWidth: d(33.5, 'Boss body width', 117),
    bossHeight: d(3.2, 'Boss height', 117),
    mountingPlateSpacingFD19: txt('0 mm plate: diagram 21, 14, 37, 65; 3 mm plate: diagram 24, 14, 40, 68', 'Application types for FD 19 with 0 mm or 3 mm spaced standard mounting plate (p.117)', 117),
    bossSameFrontRule: txt('same front as boss of the 170° / 155° hinge', 'The bi-fold hinge boss should be fixed to the same front as the hinge boss of the 170° and 155° hinge', 117),
    openingAngle: d(60, 'Opening angle', 117, 'deg'),
    adjustHeight: txt('Max. ±3.0 mm (see mounting plates)', 'Height adjustment', 117),
    adjustSide: txt('+3.0 mm / -2.0 mm', 'Side adjustment', 117),
    adjustDepth: txt('±2.0 mm', 'Depth adjustment', 117),
    adjustGapF: txt('+7.2 mm / -4.2 mm', 'Gap F adjustment', 117),
  },
  drilling: [
    {
      id: 'bifold-cup',
      target: 'door',
      label: 'Hinge cup hole Ø35',
      reference: 'Hinge centre line y = 0; distance of cup centre from the door edge is 12.5 as printed on the drilling diagram (reference edge assumed to be the door edge; verify on p.117).',
      holes: [{ x: 12.5, y: 0, diameter: 35 }],
      page: 117,
    },
    {
      id: 'bifold-dowels',
      target: 'door',
      label: 'Knock-in dowel holes Ø8',
      reference: 'Dowel axis 9.5 from the cup centre; holes 45 apart along the door edge (y = ±22.5).',
      holes: [
        { x: 22, y: -22.5, diameter: 8, note: '8 ±0.1' },
        { x: 22, y: 22.5, diameter: 8, note: '8 ±0.1' },
      ],
      when: { boss: ['knock-in'] },
      page: 117,
    },
  ],
  notes: [
    'unverified: the 12.5 cup dimension on p.117 replaces the TB range of other hinges; its reference point is read from the layout and the dowel x positions are derived from it (12.5 + 9.5).',
    'Requires a 155° or 170° hinge on the neighbouring door.',
  ],
  pages: [116, 117],
};

const inward110: FittingVariant = {
  id: 'inward-opening-110',
  name: 'CLIP top 110° hinge, inward opening furniture door',
  summary: 'Inset application, boss drilling on the cabinet, approx. 90° opening, front widths up to 900 mm.',
  choices: { application: ['inset'], boss: ['inserta', 'screw-on', 'knock-in'], action: ['blumotion', 'spring'], colour: COLOUR_CHOICE, mountingPlate: ['horizontal 20/32', 'cruciform 37/32'] },
  parts: [
    ...hinges(118, 'CLIP top 110° inward opening', [
      ['inset', 'inserta', 'blumotion', 'NI/ONS', '71B3790'],
      ['inset', 'inserta', 'spring', 'NI', '71T3790'],
      ['inset', 'screw-on', 'blumotion', 'NI/ONS', '71B3750'],
      ['inset', 'screw-on', 'spring', 'NI', '71T3750'],
      ['inset', 'knock-in', 'blumotion', 'NI', '71B3780'],
      ['inset', 'knock-in', 'spring', 'NI', '71T3780'],
    ]),
    ...coverCaps(118, [
      ['inset', 'plain', 'NI/ONS', '70.1663'],
      ['inset', 'stamped', 'NI', '70.1663.BP'],
    ]),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 118, { action: 'blumotion' }),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, CLIP top, NI', 118, { action: 'spring' }),
    part('boss-spacing', '70T3507.21', 'Hinge boss spacing 1.5 mm', 118),
    ...screws(118),
    ram(118),
  ],
  dims: {
    maxFrontWidthFB: d(900, 'Maximum front width FB', 118),
    maxFrontWeightHinges: txt(['FG up to 22 kg: 5 hinges', 'FG up to 27 kg: 6 hinges', 'FG up to 32 kg: 7 hinges'], 'Number of hinges by front weight FG (tested with 80,000 opening and closing cycles)', 119),
    minGapAllEdges: d(2, 'Reference value for gap F on all 4 edges (door size)', 119),
    cupBossDrillingTB: d(5, 'Cup edge distance from the cabinet edge: 5 mm printed on the drilling diagram', 119),
    cupDiameter: d(35, 'Hinge cup hole diameter (INSERTA / knock-in +0.2/0)', 119),
    minDepthCabinet: d(13, 'Drilling diagram "min 13"', 119),
    dowelDiameter: d(8, 'Dowel hole diameter', 119),
    dowelSpacing: d(45, 'Distance between the dowel holes', 119),
    dowelOffsetFromCupCentre: d(9.5, 'Dowel axis to cup centre', 119),
    bossSize: txt('57 x 37.5 (INSERTA 43), height 3.2 (6.4)', 'Hinge boss dimensions', 119),
    fixingPositionHorizontalPlate: txt('X = FU - 53.5', 'Horizontal mounting plate 20/32: X = FU - 53.5; FU = front protrusion', 119),
    fixingPositionCruciformPlate: txt('X = FU - 38.5', 'Cruciform mounting plate 37/32: X = FU - 38.5; FU = front protrusion', 119),
    inwardDoorProjection: txt('FR = FB - FU - 3', 'Inward door projection FR from front width FB and front protrusion FU', 119),
    maxProtrusion: d(22, 'Diagram "max 22" (front protrusion limit, reference as drawn)', 119),
    maxProjection: d(700, 'Diagram "max 700" (inward door projection)', 119),
    hingeReachDiagram: txt('69.5, 44, 5, 2', 'Planning diagram constants (reference edges not distinguishable)', 119),
    adjustHeight: txt('Max. ±3.0 mm (see mounting plates)', 'Height adjustment', 119),
    adjustSide: txt('+2.0 mm / -3.0 mm', 'Side adjustment', 119),
    adjustDepth: txt('±2.0 mm', 'Depth adjustment', 119),
  },
  drilling: cupRules(119, 'inward110', { cup: 35, tb: [5, 5], dowels: true }),
  notes: [
    'Fit a door stop on the side opposite the hinges (by the furniture manufacturer) so the door cannot be opened outwards (p.119).',
    'Boss drilling is on the cabinet; the printed edge distance is 5 (not a 3-7 range).',
    'unverified: which element is "FU" in the fixing-position formulas relies on the diagram text; check p.119.',
  ],
  pages: [118, 119],
};

const compact107: FittingVariant = {
  id: 'compact-107-38b',
  name: 'COMPACT 107° hinge 38B, inward opening',
  summary: 'One-piece hinge incl. mounting plate; approx. 90° opening, front widths up to 800 mm, 2-dimensional adjustment.',
  choices: { application: ['overlay'], boss: ['screw-on'], action: ['spring'], colour: ['NI'] },
  parts: [part('hinge', '38B355AF22', 'COMPACT 107° 38B, one-piece, screw-on, NI', 120), ...screws(120)],
  dims: {
    maxFrontWidthFB: d(800, 'Maximum front width FB', 120),
    maxFrontWeightHinges: txt(['FG up to 22 kg: 5 hinges', 'FG up to 27 kg: 6 hinges', 'FG up to 32 kg: 7 hinges'], 'Number of hinges by front weight FG (tested with 80,000 cycles)', 121),
    inwardDoorProjection: txt('FR = FB - 48', 'Inward door projection FR from front width FB', 121),
    minGapAllEdges: d(2, 'Reference value for gap F on all 4 edges', 121),
    cupDiameter: d(35, 'Hinge cup hole diameter shown as Ø35 on the drilling diagram', 121),
    cupDistances: txt('5, 9.5, 40, 45', 'Cup positions printed on p.121 (reference edges ambiguous)', 121),
    minCupDepthRef: d(11.2, 'Diagram "min 11.2"', 121),
    bossSize: txt('57 x 38.5, height 2.5', 'Hinge boss dimensions', 121),
    planningDiagramConstants: txt('9.4, 5.3, min 1, 5, 27, FB max 800', 'Planning diagram constants', 121),
    adjustHeight: txt('Max. ±2.0 mm', 'Height adjustment', 121),
    adjustSide: txt('±1.6 mm', 'Side adjustment', 121),
  },
  drilling: [],
  notes: [
    'Note p.120: if used where small children can reach, an inward-opening door with CLIP top BLUMOTION / CLIP top 110° hinge is recommended.',
    'A door stop must be fitted opposite the hinges (p.121).',
    'unverified: COMPACT drilling diagram (Ø35, 5, 9.5, 40, 45, Ø2, min 11.2) reference points are ambiguous; no drilling rule created.',
  ],
  pages: [120, 121],
};

const angled45I: FittingVariant = {
  id: 'angled-plus45-I',
  name: '+45° I angled hinge, half overlay (partial: first page of angled series)',
  summary: 'Order information and mounting-plate / spacer combinations for angled applications Nº 8, 9, 10, 23, 24, 25, 43-45, 53, 54, 60, 61, 108, 109 (p.124-125). Other angled hinges are outside this assignment.',
  choices: { application: ['angled half overlay'], boss: ['inserta', 'screw-on'], action: ['blumotion', 'unsprung'], colour: COLOUR_CHOICE },
  parts: [
    part('hinge', '79B9698', 'CLIP top BLUMOTION +45° I, INSERTA, NI', 124, { boss: 'inserta', action: 'blumotion' }),
    part('hinge', '79B9658', 'CLIP top BLUMOTION +45° I, screw-on, NI or ONS', 124, { boss: 'screw-on', action: 'blumotion' }),
    part('hinge', '78A9658.T', 'CLIP top unsprung +45° I, screw-on, NI', 124, { boss: 'screw-on', action: 'unsprung' }),
    part('arm-cover-cap', '70.1553', 'Hinge arm cover cap, plain, NI or ONS', 124),
    part('arm-cover-cap', '70.1553.BP', 'Hinge arm cover cap, Blum stamped, NI', 124),
    part('boss-cover-cap', '70T3504', 'Hinge boss cover cap, BLUMOTION, NI or ONS', 124, { action: 'blumotion' }),
    part('boss-cover-cap', '70T1504', 'Hinge boss cover cap, CLIP top, NI', 124, { action: 'unsprung' }),
    ...tipOnAll(124),
    ...screws(124),
    part('mounting-plate', '175H7190', 'Mounting plate 9 mm spacing', 125, { angledApplication: 'Nº 23, 25' }),
    part('mounting-plate', '173H7100', 'Mounting plate 0 mm spacing', 125, { angledApplication: 'Nº 53, 54, 60, 61' }),
    part('angled-spacer', '171A5500', 'Angled spacer 6 mm, -5° wedge', 125, { angledApplication: 'Nº 23' }),
    part('angled-spacer', '171A5070', 'Angled spacer 6 mm, +5° wedge', 125, { angledApplication: 'Nº 25' }),
    part('angled-spacer', '171A5010', 'Angled spacer 0.8 mm, +5° wedge', 125, { angledApplication: 'Nº 54, 61' }),
  ],
  dims: {
    adjustHeight: txt('Max. ±3.0 mm (see mounting plates)', 'Height adjustment', 125),
    adjustSide: txt('±1.8 mm', 'Side adjustment', 125),
    adjustDepth: txt('±2.0 mm', 'Depth adjustment', 125),
  },
  drilling: [],
  notes: [
    NO_MIX_NOTE,
    'Scope note: only the order information and plate/spacer table of pp.124-125 are captured; the planning geometry for angled applications is not transcribed.',
  ],
  pages: [124, 125],
};

// ---------------------------------------------------------------------------------------------------------------

export const clipTopApplications: FittingFamily[] = [
  {
    id: 'blum-clip-top-hinge-applications',
    kind: 'hinge',
    brand: 'Blum',
    name: 'CLIP top / CLIP top BLUMOTION hinges: applications',
    summary:
      'Hinge applications (standard, wide angle, profile door, blind corner, aluminium frame, thin door, glass door, frame door, bi-fold corner, inward-opening). Colours: NI nickel plated, ONS onyx black; spring and BLUMOTION options.',
    variants: [
      hinge110,
      hinge110Special,
      hinge107,
      clip100,
      hinge155,
      hinge170,
      profile95,
      profile125,
      blindInset,
      blindOverlay,
      aluBlumotion,
      aluClipTop,
      thinDoor,
      cristallo,
      cristalloDisplay,
      bathroomMirror,
      glassHinge,
      miniHinge,
      biFold,
      inward110,
      compact107,
      angled45I,
    ],
    document: 'Blum Catalogue and technical manual 2024/2025',
    pages: [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 124, 125],
  },
];
