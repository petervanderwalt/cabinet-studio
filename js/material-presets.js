export const CARCASS_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Melamine Storm Grey', thickness: 18 },
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
  { label: 'Birch Ply', thickness: 18 },
  { label: 'Oak Veneer', thickness: 18 },
  { label: 'Painted MDF', thickness: 22 },
  { label: 'Super Gloss', thickness: 18 },
];

export function findStock(options, label, fallback = options[0]) {
  return options.find((option) => option.label === label) || fallback;
}

export function applyGlobalMaterialSelections(materials = {}, drawers = {}) {
  const carcass = findStock(CARCASS_STOCKS, materials.caseMaterial);
  const rear = findStock(REAR_STOCKS, materials.backMaterial);
  const front = findStock(FRONT_STOCKS, materials.frontMaterial || materials.doorMaterial || materials.drawerFrontMaterial);

  const legacySide = `${materials.drawerBoxMaterial || carcass.label} (${drawers.sideThickness ?? 12} mm existing)`;
  const legacyBottom = `${materials.drawerBoxMaterial || carcass.label} (${drawers.bottomThickness ?? 6} mm existing)`;
  const side = DRAWER_SIDE_STOCKS.find(s => s.label === materials.drawerSideMaterial);
  const bottom = DRAWER_BOTTOM_STOCKS.find(s => s.label === materials.drawerBottomMaterial);
  const result = {
    ...materials,
    drawerSideMaterial: side?.label || materials.drawerSideMaterial || legacySide,
    drawerSideThickness: side?.thickness ?? materials.drawerSideThickness ?? drawers.sideThickness ?? 12,
    drawerBottomMaterial: bottom?.label || materials.drawerBottomMaterial || legacyBottom,
    drawerBottomThickness: bottom?.thickness ?? materials.drawerBottomThickness ?? drawers.bottomThickness ?? 6,
    caseMaterial: carcass.label,
    shelfMaterial: carcass.label,
    drawerBoxMaterial: side?.label || materials.drawerSideMaterial || legacySide,
    caseThickness: carcass.thickness,
    backMaterial: rear.label,
    backThickness: rear.thickness,
    frontMaterial: front.label,
    doorMaterial: front.label,
    drawerFrontMaterial: front.label,
    doorThickness: front.thickness,
  };
  for (const [type, fields] of Object.entries(STOCK_FIELDS)) {
    const selected = materials.stockSelections?.[type];
    if (selected?.material && Number.isFinite(selected.thickness) && selected.thickness > 0) {
      result[fields.material] = selected.material;
      result[fields.thickness] = selected.thickness;
    }
  }
  result.stockSelections = { ...materials.stockSelections };
  for (const [type, fields] of Object.entries(STOCK_FIELDS)) {
    const selected = materials.stockSelections?.[type];
    const appearance = splitStockAppearance(selected?.material || result[fields.material]);
    const colour = selected?.colour || appearance.colour;
    result.stockSelections[type] = { ...selected, material:appearance.material, colour, thickness:result[fields.thickness], units:selected?.units || (String(result[fields.material]).includes(' inch') ? 'imperial' : 'metric') };
    result[fields.material] = colour === 'Unspecified' ? appearance.material : `${appearance.material} ${colour}`;
    result[`${type}Colour`] = colour;
  }
  result.shelfMaterial = result.caseMaterial;
  result.doorMaterial = result.frontMaterial;
  result.drawerFrontMaterial = result.frontMaterial;
  result.drawerBoxMaterial = result.drawerSideMaterial;
  return result;
}

// Exact nominal sizes. Confirm actual sheet thickness before machining.
for (const stocks of [CARCASS_STOCKS, REAR_STOCKS, FRONT_STOCKS]) {
 for (const [fraction, thickness] of [['3/4', 19.05], ['1/2', 12.7], ['1/4', 6.35]]) stocks.push({ label: `Plywood ${fraction} inch`, thickness, units: 'imperial', nominal: fraction });
}

// North American nominal sheet products; keep separate identities from metric stock.
const inchStock = (material, fraction, thickness) => ({ label: `${material} ${fraction} inch`, thickness, units: 'imperial', nominal: fraction });
const melamine = inchStock('Melamine White', '3/4', 19.05);
const mdfThreeQuarter = inchStock('MDF', '3/4', 19.05);
const mdfHalf = inchStock('MDF', '1/2', 12.7);
const mdfQuarter = inchStock('MDF', '1/4', 6.35);
CARCASS_STOCKS.push(melamine, mdfThreeQuarter, mdfHalf);
REAR_STOCKS.push(melamine, mdfThreeQuarter, mdfHalf, mdfQuarter);
FRONT_STOCKS.push(melamine, mdfThreeQuarter, mdfHalf, mdfQuarter);

export function stocksForUnits(options, units, currentValue) {
  const preferred = options.filter(stock => (stock.units === 'imperial') === (units === 'imperial'));
  const current = options.find(stock => stock.label === currentValue);
  return current && !preferred.includes(current) ? [current, ...preferred] : preferred;
}

export function defaultStockMaterials(units) {
  return units === 'imperial' ? applyGlobalMaterialSelections({
    caseMaterial: 'Melamine White 3/4 inch',
    backMaterial: 'Plywood 1/4 inch',
    frontMaterial: 'Melamine White 3/4 inch',
    drawerSideMaterial: 'Plywood 1/2 inch',
    drawerBottomMaterial: 'Plywood 1/4 inch',
  }) : { drawerSideMaterial: 'Birch Ply 12 mm', drawerBottomMaterial: 'Ply 6 mm' };
}

export const DRAWER_SIDE_STOCKS = [
  {label: 'Birch Ply 12 mm', thickness: 12},
  ...CARCASS_STOCKS.filter(s => !s.units),
  ...CARCASS_STOCKS.filter(s => s.units === 'imperial' && s.nominal !== '1/4'),
];
export const DRAWER_BOTTOM_STOCKS = [
  {label: 'Ply 6 mm', thickness: 6},
  ...REAR_STOCKS.filter(s => !s.units && s.thickness <= 12),
  ...REAR_STOCKS.filter(s => s.units === 'imperial' && ['1/4','1/2'].includes(s.nominal)),
];

export const STOCK_FIELDS = {
  carcass: {material:'caseMaterial', thickness:'caseThickness'},
  rear: {material:'backMaterial', thickness:'backThickness'},
  front: {material:'frontMaterial', thickness:'doorThickness'},
  'drawer-side': {material:'drawerSideMaterial', thickness:'drawerSideThickness'},
  'drawer-bottom': {material:'drawerBottomMaterial', thickness:'drawerBottomThickness'},
};
export const STOCK_THICKNESSES = [
  ...[6,9,12,18,22].map(mm=>({value:`metric:${mm}`,label:`${mm} mm`,thickness:mm,units:'metric'})),
  ...[['1/4',6.35],['1/2',12.7],['3/4',19.05]].map(([fraction,mm])=>({value:`imperial:${fraction}`,label:`${fraction}″`,thickness:mm,units:'imperial'})),
];
export const stockMaterialName = label => String(label || '').replace(/ \([^)]*existing\)$/, '').replace(/ \d+(?:\.\d+)? mm$/, '').replace(/ \d+\/\d+ inch$/, '');

export const STOCK_COLOURS = ['White', 'Storm Grey', 'Black', 'Natural', 'Raw', 'Unspecified'];
export function splitStockAppearance(label) {
  const name = stockMaterialName(label);
  const separated = name.match(/^(.*) (Storm Grey|White|Black|Natural|Raw)$/i);
  if (!separated) return {material:name, colour:'Unspecified'};
  const colour = STOCK_COLOURS.find(c=>c.toLowerCase()===separated[2].toLowerCase());
  return {material:separated[1], colour};
}

// Every stock role uses the same catalogue, including imported stock choices.
export function sharedStockChoices(materialSets = []) {
  const catalogues = [CARCASS_STOCKS, REAR_STOCKS, FRONT_STOCKS, DRAWER_SIDE_STOCKS, DRAWER_BOTTOM_STOCKS];
  const materials = new Set(catalogues.flat().map(s => splitStockAppearance(s.label).material));
  const colours = new Set(STOCK_COLOURS);
  const thicknesses = [...STOCK_THICKNESSES];
  for (const set of materialSets) for (const [type, fields] of Object.entries(STOCK_FIELDS)) {
    const selection = set.stockSelections?.[type];
    const appearance = splitStockAppearance(selection?.material || set[fields.material]);
    if (appearance.material) materials.add(appearance.material);
    colours.add(selection?.colour || appearance.colour);
    const thickness = selection?.thickness ?? set[fields.thickness];
    if (Number.isFinite(thickness) && thickness > 0 && !thicknesses.some(t => Math.abs(t.thickness - thickness) < 1e-8)) {
      thicknesses.push({value:`metric:${thickness}`,label:`${thickness} mm`,thickness,units:'metric'});
    }
  }
  return {materials:[...materials].sort(), colours:[...colours], thicknesses};
}
