import type { DimSpec, FittingFamily, FittingVariant } from '../types';

const d = (value: DimSpec['value'], meaning: string, page: number, unit: DimSpec['unit'] = 'mm'): DimSpec => ({ value, unit, meaning, page });

interface Spec {
  id: string;
  name: string;
  summary: string;
  page: number;
  webCode: string;
  fronts: number;
  eb: string;
  lwa: string;
  fb: string;
  lha: string;
  lta: string;
  pob: number | string;
}

const variant = (s: Spec): FittingVariant => ({
  id: s.id,
  name: s.name,
  summary: s.summary,
  choices: {},
  parts: [],
  dims: {
    mountingWidthEB: d(s.eb, 'Mounting width EB of the whole application (installation width); allowed range', s.page),
    installationHeightEH: d('1155–3012', 'Installation height EH; allowed range', s.page),
    installationDepthET: d('from 573', 'Installation depth ET; minimum value (starting at 573)', s.page),
    internalWidthLWA: d(s.lwa, 'Internal width LWA within the application; allowed range', s.page),
    internalHeightLHA: d(s.lha, 'Internal height LHA within the application; maximum', s.page),
    internalDepthLTA: d(s.lta, 'Internal depth LTA within the application; minimum (starting at)', s.page),
    pocketWidthPOB: d(s.pob, 'Fixed pocket width POB (per pocket)', s.page),
    pocketHeightPOH: d('1142–2999', 'Pocket height POH; allowed range', s.page),
    pocketDepthPOT: d('from 553', 'Pocket depth POT; minimum (starting at 553)', s.page),
    frontWidthFB: d(s.fb, 'Front width FB per front; allowed range', s.page),
    frontHeightFH: d('1130–2980', 'Front height FH; allowed range', s.page),
    frontThicknessFD: d('18–26', 'Front thickness FD; allowed range', s.page),
    frontWeightFG: d(35, 'Maximum front weight FG per front', s.page, 'kg'),
    numberOfFronts: d(s.fronts, 'Number of fronts in the application', 533, undefined),
  },
  drilling: [],
  notes: [
    `Web code ${s.webCode}; the catalogue gives no order-information table or part numbers for this application, parts and CAM drilling come from the Product Configurator.`,
    'Pocket systems can be built with or without plinth option or as a worktop mounted cabinet; TIP-ON mechanical opening support is part of the system.',
    'unverified: the drawings on this page only label EB, POB, FB, LWA, POH, EH, FH, ET, POT; no further drawing dimensions are transcribed.',
  ],
  pages: [533, s.page],
});

export const revego: FittingFamily[] = [
  {
    id: 'revego',
    kind: 'pocket',
    brand: 'Blum',
    name: 'REVEGO',
    summary: 'Slide-in pocket door systems; single (uno) and double (duo) doors and their combinations.',
    document: 'Catalogue and technical manual 2024/2025',
    pages: [533, 534, 535, 536, 537, 538],
    variants: [
      variant({ id: 'revego-uno', name: 'REVEGO uno', summary: 'Single door, right or left.', page: 534, webCode: 'DQIU7Y', fronts: 1, eb: '450–900', lwa: '350–800 (up to 800)', fb: '442–898', lha: 'up to 2999', lta: 'from 518', pob: 100 }),
      variant({ id: 'revego-uno-uno', name: 'REVEGO uno + uno', summary: 'Two single doors combined.', page: 535, webCode: 'DQDN1C', fronts: 2, eb: '900–1800', lwa: '700–1600 (up to 1600)', fb: '442–898', lha: 'up to 2999', lta: 'from 518', pob: '100 each' }),
      variant({ id: 'revego-duo', name: 'REVEGO duo', summary: 'Double door, right or left.', page: 536, webCode: 'DQITIM', fronts: 2, eb: '900–1500', lwa: '750–1350 (up to 1350)', fb: '442–748', lha: 'up to 2884', lta: 'from 483', pob: 150 }),
      variant({ id: 'revego-duo-duo', name: 'REVEGO duo + duo', summary: 'Two double doors combined.', page: 537, webCode: 'DQIVMM', fronts: 4, eb: '1800–3000', lwa: '1500–2700 (up to 2700)', fb: '442–748', lha: 'up to 2884', lta: 'from 483', pob: '150 each' }),
      variant({ id: 'revego-uno-duo', name: 'REVEGO uno + duo', summary: 'One single and one double door combined.', page: 538, webCode: 'DQIUXA', fronts: 3, eb: '1350–2400', lwa: '1100–2150 (up to 2150)', fb: '442–898 (single) | 442–748 (double)', lha: 'up to 2884', lta: 'from 483', pob: '100 | 150' }),
    ],
  },
];
