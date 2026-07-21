export const CARCASS_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Melamine Storm Grey', thickness: 18 },
  { label: 'Birch Ply', thickness: 18 },
  { label: 'Melamine Heavy Duty', thickness: 22 },
];

export const REAR_STOCKS = [
  { label: 'Hardboard White', thickness: 6 },
  { label: 'Hardboard Raw', thickness: 6 },
  { label: 'MDF White', thickness: 9 },
  { label: 'Ply Utility', thickness: 12 },
];

export const FRONT_STOCKS = [
  { label: 'Melamine White', thickness: 18 },
  { label: 'Oak Veneer', thickness: 18 },
  { label: 'Painted MDF', thickness: 22 },
  { label: 'Super Gloss', thickness: 18 },
];

export function findStock(options, label, fallback = options[0]) {
  return options.find((option) => option.label === label) || fallback;
}

export function applyGlobalMaterialSelections(materials = {}) {
  const carcass = findStock(CARCASS_STOCKS, materials.caseMaterial);
  const rear = findStock(REAR_STOCKS, materials.backMaterial);
  const front = findStock(FRONT_STOCKS, materials.frontMaterial || materials.doorMaterial || materials.drawerFrontMaterial);

  return {
    ...materials,
    caseMaterial: carcass.label,
    shelfMaterial: carcass.label,
    drawerBoxMaterial: carcass.label,
    caseThickness: carcass.thickness,
    backMaterial: rear.label,
    backThickness: rear.thickness,
    frontMaterial: front.label,
    doorMaterial: front.label,
    drawerFrontMaterial: front.label,
    doorThickness: front.thickness,
  };
}
