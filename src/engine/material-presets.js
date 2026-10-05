// Stock catalogues and the rules that derive per-part materials from the global choices.
// Three global stocks (carcass, rear, fronts) drive everything unless a part group has an override.

export const CARCASS_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Melamine Storm Grey', thickness: 18 },
  { label: 'Melamine Oak', thickness: 18 },
  { label: 'Melamine Walnut', thickness: 18 },
  { label: 'Melamine Charcoal', thickness: 18 },
  { label: 'Birch Ply', thickness: 18 },
  { label: 'Melamine Heavy Duty', thickness: 22 },
];

export const REAR_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Birch Ply', thickness: 18 },
  { label: 'Hardboard White', thickness: 6 },
  { label: 'Hardboard Raw', thickness: 6 },
  { label: 'MDF White', thickness: 9 },
  { label: 'Ply Utility', thickness: 12 },
];

export const FRONT_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Melamine Charcoal', thickness: 18 },
  { label: 'Melamine Oak', thickness: 18 },
  { label: 'Birch Ply', thickness: 18 },
  { label: 'Oak Veneer', thickness: 18 },
  { label: 'Walnut Veneer', thickness: 18 },
  { label: 'Painted MDF', thickness: 22 },
  { label: 'Fluted MDF', thickness: 22 },
  { label: 'Super Gloss', thickness: 18 },
];

export const SHELF_STOCKS = [
  ...CARCASS_STOCKS,
  { label: 'Melamine White 25', thickness: 25 },
  { label: 'Birch Ply 25', thickness: 25 },
];

export const PLINTH_STOCKS = [
  ...CARCASS_STOCKS,
  { label: 'MR MDF Black', thickness: 18 },
  { label: 'Aluminium Plinth', thickness: 18 },
];

export const DIVIDER_STOCKS = CARCASS_STOCKS;

export const DRAWER_BOX_STOCKS = [
  { label: 'Melamine White', thickness: 16 },
  { label: 'Birch Ply', thickness: 12 },
  { label: 'Melamine Storm Grey', thickness: 16 },
  { label: 'Hardboard White', thickness: 6 },
];

export const SLIDING_STOCKS = [
  ...FRONT_STOCKS,
  { label: 'Smoked Glass', thickness: 6 },
  { label: 'Framed Aluminium Panel', thickness: 18 },
];

export const MIRROR_TYPES = [
  { label: 'Mirror 4mm Silver', thickness: 4 },
  { label: 'Mirror 4mm Bronze', thickness: 4 },
  { label: 'Mirror 4mm Grey', thickness: 4 },
];

export const EDGE_BAND_COLOURS = [
  { label: 'match', name: 'Match face material' },
  { label: 'white', name: 'White' },
  { label: 'black', name: 'Black' },
  { label: 'oak', name: 'Oak' },
  { label: 'grey', name: 'Grey' },
];

export const EDGE_BAND_THICKNESSES = [0.4, 1, 2];

/** Part groups that can override the stock inherited from a global choice. */
export const MATERIAL_GROUPS = {
  shelves: { label: 'Shelves', parent: 'carcass', stocks: SHELF_STOCKS },
  drawerBox: { label: 'Drawer boxes', parent: 'carcass', stocks: DRAWER_BOX_STOCKS },
  drawerFront: { label: 'Drawer fronts', parent: 'front', stocks: FRONT_STOCKS },
  plinth: { label: 'Toe kick / plinth', parent: 'carcass', stocks: PLINTH_STOCKS },
  divider: { label: 'Dividers', parent: 'carcass', stocks: DIVIDER_STOCKS },
  sliding: { label: 'Sliding doors', parent: 'front', stocks: SLIDING_STOCKS },
};

export function findStock(options, label, fallback = options[0]) {
  return options.find((option) => option.label === label) || fallback;
}

function resolveGroup(group, parentStock, overrides) {
  const { stocks } = MATERIAL_GROUPS[group];
  const override = overrides?.[group];
  const match = override ? stocks.find((stock) => stock.label === override) : null;
  return match || parentStock;
}

export function applyGlobalMaterialSelections(materials = {}) {
  const carcass = findStock(CARCASS_STOCKS, materials.caseMaterial);
  const rear = findStock(REAR_STOCKS, materials.backMaterial);
  const front = findStock(FRONT_STOCKS, materials.frontMaterial || materials.doorMaterial || materials.drawerFrontMaterial);

  const overrides = {};
  for (const group of Object.keys(MATERIAL_GROUPS)) {
    const label = materials.overrides?.[group];
    if (label && MATERIAL_GROUPS[group].stocks.some((stock) => stock.label === label)) overrides[group] = label;
  }

  const shelves = resolveGroup('shelves', carcass, overrides);
  const drawerBox = resolveGroup('drawerBox', carcass, overrides);
  const drawerFront = resolveGroup('drawerFront', front, overrides);
  const plinth = resolveGroup('plinth', carcass, overrides);
  const divider = resolveGroup('divider', carcass, overrides);
  const sliding = resolveGroup('sliding', front, overrides);

  return {
    ...materials,
    overrides,
    caseMaterial: carcass.label,
    caseThickness: carcass.thickness,
    shelfMaterial: shelves.label,
    shelfThickness: shelves.thickness,
    drawerBoxMaterial: drawerBox.label,
    backMaterial: rear.label,
    backThickness: rear.thickness,
    frontMaterial: front.label,
    doorMaterial: front.label,
    doorThickness: front.thickness,
    drawerFrontMaterial: drawerFront.label,
    drawerFrontThickness: drawerFront.thickness,
    plinthMaterial: plinth.label,
    plinthThickness: plinth.thickness,
    dividerMaterial: divider.label,
    dividerThickness: divider.thickness,
    slidingDoorMaterial: sliding.label,
    slidingDoorThickness: sliding.thickness,
  };
}
