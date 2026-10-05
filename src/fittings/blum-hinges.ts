// Blum CLIP top 110° hinge and cruciform mounting plate data.
// Source: Blum "Catalogue and technical manual 2024/2025", printed pages 76 (order information),
// 77 (hinge planning / drilling) and 151-152 (mounting plates). Dimensions in mm.

export const BLUM_SOURCE = 'Blum Catalogue and technical manual 2024/2025';

export type HingeApplication = 'overlay' | 'dual' | 'inset';
export type BossType = 'screw-on' | 'inserta' | 'knock-in';
export type HingeAction = 'blumotion' | 'spring' | 'unsprung';
export type PlateFixing = 'screw' | 'inserta' | 'expando';

export interface PartRef {
  partNo: string;
  description: string;
}

/** CLIP top 110° standard hinge: cup, boss and edge-distance geometry (catalogue p.77). */
export const CLIP_TOP_110 = {
  id: 'blum-clip-top-110',
  name: 'Blum CLIP top 110° hinge',
  angle: 110,
  cupDiameter: 35,
  /** Distance from the door edge to the edge of the cup (drilling distance TB). */
  edgeDistance: { min: 3, max: 7, default: 5 },
  minFrontThickness: 13,
  /** INSERTA / knock-in dowel holes: Ø8, 45 apart, 9.5 further from the door edge than the cup centre. */
  dowels: { diameter: 8, spacing: 45, offsetFromCupCentre: 9.5 },
  source: { document: BLUM_SOURCE, pages: [76, 77] },
} as const;

type ActionParts = Partial<Record<HingeAction, string>>;

/** Part numbers by application → boss type → hinge action (colour: nickel plated). Catalogue p.76. */
const HINGE_PART_NUMBERS: Record<HingeApplication, Record<BossType, ActionParts>> = {
  overlay: {
    inserta: { blumotion: '71B3590', spring: '71T3590', unsprung: '70T3590.TL' },
    'screw-on': { blumotion: '71B3550', spring: '71T3550', unsprung: '70T3550.TL' },
    'knock-in': { blumotion: '71B3580', spring: '71T3580', unsprung: '70T3580.TL' },
  },
  dual: {
    inserta: { blumotion: '71B3690', spring: '71T3690', unsprung: '70T3690.TL' },
    'screw-on': { blumotion: '71B3650', spring: '71T3650', unsprung: '70T3650.TL' },
    'knock-in': { blumotion: '71B3680', spring: '71T3680' },
  },
  inset: {
    inserta: { blumotion: '71B3790', spring: '71T3790', unsprung: '70T3790.TL' },
    'screw-on': { blumotion: '71B3750', spring: '71T3750', unsprung: '70T3750.TL' },
    'knock-in': { blumotion: '71B3780', spring: '71T3780' },
  },
};

const ACTION_LABEL: Record<HingeAction, string> = {
  blumotion: 'CLIP top BLUMOTION (soft-close)',
  spring: 'CLIP top (sprung)',
  unsprung: 'CLIP top (unsprung, for TIP-ON)',
};

const APPLICATION_LABEL: Record<HingeApplication, string> = { overlay: 'overlay', dual: 'dual', inset: 'inset' };
const BOSS_LABEL: Record<BossType, string> = { 'screw-on': 'screw-on', inserta: 'INSERTA', 'knock-in': 'knock-in' };

export function hingePart(application: HingeApplication, boss: BossType, action: HingeAction): PartRef | null {
  const wanted = HINGE_PART_NUMBERS[application][boss][action];
  if (wanted) return { partNo: wanted, description: `${ACTION_LABEL[action]} 110°, ${APPLICATION_LABEL[application]} application, ${BOSS_LABEL[boss]} boss, nickel` };
  return null;
}

/**
 * Cruciform cam mounting plate 37/32 (catalogue p.152): one column of two Ø5 holes, 37 from the cabinet
 * front edge and 32 apart. Part numbers by fixing and plate spacing (0 mm = 8.5 high, 3 mm = 11.5 high).
 */
export const CRUCIFORM_PLATE_37_32 = {
  id: 'cruciform-37-32',
  name: 'Cruciform cam mounting plate 37/32',
  frontOffset: 37,
  holeSpacing: 32,
  holeDiameter: 5,
  source: { document: BLUM_SOURCE, pages: [152] },
  parts: {
    screw: { 0: '173H7100', 3: '173H7130' },
    inserta: { 0: '174H7100I', 3: '174H7130I' },
    expando: { 0: '174H7100E', 3: '174H7130E' },
  } satisfies Record<PlateFixing, Record<0 | 3, string>>,
} as const;

export const PLATE_FIXING_LABEL: Record<PlateFixing, string> = {
  screw: 'chipboard screws Ø3.5/4',
  inserta: 'INSERTA tool-free',
  expando: 'EXPANDO pre-mounted dowels',
};

export function platePart(fixing: PlateFixing, spacing: 0 | 3 = 0): PartRef {
  return {
    partNo: CRUCIFORM_PLATE_37_32.parts[fixing][spacing],
    description: `${CRUCIFORM_PLATE_37_32.name}, ${PLATE_FIXING_LABEL[fixing]}, ${spacing}mm spacing, nickel`,
  };
}

/** TIP-ON for doors, short version with standard spring; needs an unsprung hinge (catalogue p.76). */
export const TIP_ON_DOOR_SHORT: PartRef = { partNo: '956.1004', description: 'TIP-ON for doors, short version, standard spring' };
