import type { FittingFamily, PartNumber, DimSpec } from '../types';

const DOC = 'Blum Catalogue and technical manual 2024/2025';
const p = (role: string, partNo: string, description: string, page: number, extra: Partial<PartNumber> = {}): PartNumber => ({
  role, partNo, description, page, ...extra,
});
const d = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({ value, unit, meaning, page });

export const doorMotion: FittingFamily[] = [
  {
    id: 'blumotion-doors',
    kind: 'motion',
    brand: 'Blum',
    name: 'BLUMOTION for doors',
    summary: 'Adaptive soft-close dampers for hinged doors: clip-on 973A, in adapter plate 971A, drilled 970A / 970.',
    document: DOC,
    pages: [176, 177, 178, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189],
    variants: [
      {
        id: 'blumotion-973a',
        name: 'BLUMOTION 973A clip-on',
        choices: { hingeArm: ['straight', 'cranked', 'double cranked', '170 deg'] },
        parts: [
          p('motion', '973A0500.01', 'BLUMOTION 973A, straight arm, steel NI', 180, { when: { hingeArm: 'straight' } }),
          p('motion', '973A0600', 'BLUMOTION 973A, cranked arm, steel NI', 180, { when: { hingeArm: 'cranked' } }),
          p('motion', '973A0700', 'BLUMOTION 973A, double cranked arm, steel NI', 180, { when: { hingeArm: 'double cranked' } }),
          p('motion', '973A6000', 'BLUMOTION 973A for 170 deg hinge, zinc NI', 180, { when: { hingeArm: '170 deg' } }),
        ],
        dims: {
          quantityPerHinge: d(1, 'One BLUMOTION 973A per hinge for normal door sizes; fewer allowed for smaller, lighter doors', 181, undefined),
        },
        drilling: [],
        notes: [
          'Application overview (page 178): 973A0500.01 is listed for 110, 110 special, 107, CLIP 100, profile door, CLIP top 95 aluminium frame (for 973A) and +-5 deg angled hinges; 973A0600 / 973A0700 for 110, 107, CLIP 100, profile door, +-5 deg angled; 973A6000 for 170 deg hinge. Columns 1/2/3 on page 178 correspond to arm types as on page 180.',
        ],
        pages: [177, 178, 180, 181],
      },
      {
        id: 'blumotion-971a',
        name: 'BLUMOTION 971A in adapter plate (overlay)',
        choices: { plate: ['37/32', '9.5/32'], constructionHeight: [25, 33] },
        parts: [
          p('motion', '971A0500', 'BLUMOTION 971A in cruciform plate 37/32, height 25', 182, { when: { plate: '37/32', constructionHeight: 25 } }),
          p('motion', '971A2500', 'BLUMOTION 971A in cruciform plate 37/32, height 33', 182, { when: { plate: '37/32', constructionHeight: 33 } }),
          p('motion', '971A0700', 'BLUMOTION 971A in cruciform plate 9.5/32, height 25', 182, { when: { plate: '9.5/32', constructionHeight: 25 } }),
        ],
        dims: {
          height25Use: d('straight hinge arm with 0 mm raised mounting plate (except 95 deg profile door hinge)', 'When to choose construction height 25 mm', 183, undefined),
          height33Use: d('straight hinge with 3 mm spaced plate; also 95 deg profile door hinge with 0 mm plate', 'When to choose construction height 33 mm', 183, undefined),
          position: d('centre between the hinges', 'Assembly position of 971A; add one more between an extra hinge pair for high/heavy doors', 183, undefined),
          depthAdjust: d('+3 to -7', 'Spiral screw depth adjustment range; mirror hinge arm depth adjustment', 183),
        },
        drilling: [],
        notes: ['Fixing with chipboard screws 3.5 or 4 mm; zinc, nickel plated.'],
        pages: [182, 183],
      },
      {
        id: 'blumotion-970a',
        name: 'BLUMOTION 970A for drilling, hinge side',
        choices: { mountingPlateSpacingMD: [0, 3, 6, 9] },
        parts: [p('motion', '970A1002', 'BLUMOTION 970A nylon RAL 7037', 184)],
        dims: {
          baMD0: d('32 | 41 | 50 | 34', 'Drilling distance BA at MD 0 for the five application icons in printed order (columns 1,2,3,5)', 185),
          baMD3: d('35 | 44 | 53 | 51 | 34', 'BA at MD 3, five application columns in printed order', 185),
          baMD6: d('38 | 47', 'BA at MD 6, first two columns only', 185),
          baMD9: d('41 | 50', 'BA at MD 9, first two columns only', 185),
        },
        drilling: [],
        notes: [
          'Hole is drilled into the cabinet top at drilling distance BA; add a second 970A in the bottom if the effect is insufficient.',
          'Column 3 (BA 50/53): for narrow top rails or larger front gaps use an adapter plate.',
          'unverified: which application icon belongs to each BA column (page 185 icons not identifiable); hole diameter/depth not read.',
        ],
        pages: [184, 185],
      },
      {
        id: 'blumotion-970',
        name: 'BLUMOTION 970. for drilling, handle side',
        choices: {},
        parts: [p('motion', '970.1002', 'BLUMOTION 970. nylon RAL 7037', 186)],
        dims: {
          maxDistanceFromHinge: d(600, 'Maximum distance of BLUMOTION from hinge', 187),
          glassMiniHingePosition: d('FB/2', 'Position for glass door / mini-hinges: half front width FB', 187, undefined),
          cabinetWidthSingle: d(600, 'Up to this cabinet width KB one BLUMOTION per front is shown; applicable for all CLIP top hinges', 187),
        },
        drilling: [],
        notes: ['Normally one per front; a second is needed for high front weights FG or unstable fronts (frames, fixed fronts, large aluminium frames).'],
        pages: [186, 187],
      },
      {
        id: 'blumotion-adapter-plates',
        name: 'BLUMOTION adapter plates',
        choices: { type: ['straight 20/32', 'cruciform 37/32', 'cruciform 9.5/32', 'cruciform double 9.5/32'] },
        parts: [
          p('adapter-plate', '970.1201', 'Straight adapter plate 20/32, nylon R7036', 188, { when: { type: 'straight 20/32' } }),
          p('adapter-plate', '970.5201', 'Straight adapter plate 20/32, zinc NI', 188, { when: { type: 'straight 20/32' } }),
          p('adapter-plate', '970.1501', 'Cruciform adapter plate 37/32, nylon R7036', 188, { when: { type: 'cruciform 37/32' } }),
          p('adapter-plate', '970.1701', 'Cruciform adapter plate 9.5/32, nylon R7036', 188, { when: { type: 'cruciform 9.5/32' } }),
          p('adapter-plate', '970.5701', 'Cruciform adapter plate 9.5/32, zinc NI', 188, { when: { type: 'cruciform 9.5/32' } }),
          p('adapter-plate', '970.6701', 'Cruciform double adapter plate 9.5/32, zinc NI', 189, { when: { type: 'cruciform double 9.5/32' } }),
        ],
        dims: {},
        drilling: [],
        notes: ['BLUMOTION unit must be ordered separately. Fixing with chipboard screws 3.5 or 4 mm. Double plate is for cabinets with double doors.'],
        pages: [188, 189],
      },
    ],
  },
  {
    id: 'tipon-doors',
    kind: 'motion',
    brand: 'Blum',
    name: 'TIP-ON for doors',
    summary: 'Mechanical opening support for handle-less fronts, with adapter plates.',
    document: DOC,
    pages: [190, 191, 192, 193],
    variants: [
      {
        id: 'tipon-956',
        name: 'TIP-ON 956x',
        choices: { version: ['short magnet', 'long magnet', 'long bumper'], colour: ['SW', 'CS', 'R7036'], spring: ['standard', 'strong'] },
        parts: [
          p('tip-on', '956.1004', 'TIP-ON short, magnet, standard spring', 192, { when: { version: 'short magnet' } }),
          p('tip-on', '956A1004', 'TIP-ON long, magnet, standard spring', 192, { when: { version: 'long magnet' } }),
          p('tip-on', '956A1006', 'TIP-ON long, bumper, standard spring', 192, { when: { version: 'long bumper', spring: 'standard' } }),
          p('tip-on', '956A1006F', 'TIP-ON long, bumper, strong spring', 192, { when: { version: 'long bumper', spring: 'strong' } }),
          p('accessory', '609.1500', 'Chipboard screw 3.5 x 15 mm (supplied with magnet versions)', 192),
        ],
        dims: {
          outputPathShort: d(17, 'Output path of short version, approx.', 192),
          outputPathLong: d(38, 'Output path of long version, approx.', 192),
          shortMaxFrontHeight: d(1300, 'Short version for overlay fronts up to approx. this height', 192),
          longMinFrontHeight: d(1300, 'Long version for overlay fronts from approx. this height and all inset applications', 192),
        },
        drilling: [],
        notes: [
          'Magnet versions are for unsprung hinges; each set includes TIP-ON, self-adhesive catch plate, screw-on catch plate and screw 609.1500.',
          'Self-adhesive plate not suitable for powder-coated, waxed or oiled surfaces.',
          'Bumper version is for sprung hinges; no catch plate needed. Strong spring for narrow fronts with many hinges.',
          'Colours: SW silk white, CS carbon black, R7036 platinum grey. FA front overlay; 3 mm offset installation marked * on diagrams.',
          'unverified: separate part numbers of catch plates (not listed on page 192).',
        ],
        pages: [190, 191, 192],
      },
      {
        id: 'tipon-adapter-plates',
        name: 'TIP-ON adapter plates',
        choices: { type: ['straight short 20/17', 'straight extended 20/32', 'cruciform extended 37/32'] },
        parts: [
          p('adapter-plate', '956.1201', 'Straight adapter plate short 20/17, nylon', 193, { when: { type: 'straight short 20/17' } }),
          p('adapter-plate', '956A1201', 'Straight adapter plate extended 20/32, nylon', 193, { when: { type: 'straight extended 20/32' } }),
          p('adapter-plate', '956A1501', 'Cruciform adapter plate extended 37/32, R7036', 193, { when: { type: 'cruciform extended 37/32' } }),
        ],
        dims: {},
        drilling: [],
        notes: ['Colours: 956.1201 and 956A1201 SW, CS or R7036; 956A1501 R7036 only. TIP-ON ordered separately. Chipboard screws 3.5 or 4 mm.'],
        pages: [193],
      },
    ],
  },
];
