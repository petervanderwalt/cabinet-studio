// Dimensions are millimetres. Presets apply only on selection; stored dimensions remain authoritative.
const sources = {
  blum: 'https://publications.blum.com/2024/catalogue/en/150/',
  shelf: 'https://www.kregtool.com/en/products/cabinet-solutions/cabinet-drawer-and-shelf-jigs/shelf-pin-jig-5-mm/KMA3232.html',
  shelfImperial: 'https://www.kregtool.com/shop/cabinet-solutions/cabinet-drawer-shelf-jigs/shelf-pin-jig-14/KMA3225.html',
  pulls: 'https://www.amerock.com/pulls/',
  accuride: 'https://www.accuride.com/media/amasty/amfile/attach/516dd0135bf3d6a5f7d76cafd3f74da0.pdf',
  kreg: 'https://learn.kregtool.com/learn/how-to-build-a-wall-cabinet/',
};

export const HARDWARE_CATEGORIES = {
  hingeCup: 'Hinge cup', hingePlate: 'Hinge plate', shelfPins: 'Shelf supports', handles: 'Handles / knobs',
  runners: 'Drawer runners', joinery: 'Carcass joinery',
};

export const CONNECTOR_REFERENCES = [
  { name: 'Hettich Rastex 15', image: 'assets/hardware/rastex-15.png', source: 'https://web.hettich.com/fileadmin/media/Connecting_technology_2016_16359_HUS.pdf#page=10', note: '18 mm cam/bolt set implemented. Ø15 pocket plus edge passage and mating bolt pilot.' },
  { name: 'Häfele Minifix 15', image: 'assets/hardware/minifix-15.png', source: 'https://hafelethailand.com/wp-content/uploads/2025/12/02-connector-technology-shelf-supports.pdf#page=14', note: 'Reference only. Cam depth depends on stock; 24/34 mm offset and edge drilling depend on the bolt.' },
  { name: 'Häfele Rafix 20', image: 'assets/hardware/rafix-20.png', source: 'https://hafelethailand.com/wp-content/uploads/2025/12/02-connector-technology-shelf-supports.pdf#page=37', note: 'Reference only. Ø20 open-edge pocket; housing, panel thickness and mating bolt must match.' },
  { name: 'Lamello Cabineo', image: 'assets/hardware/cabineo.png', source: 'https://lamello.com/fileadmin/products/Operating_instructions_Cabineo.pdf#page=2', note: 'Cabineo 8/12 surface-mounted corner joints implemented. Flush, cover-cap and M6 variants differ and are not included.' },
];

export const HARDWARE_LIBRARY = [
  ...[8,12].map(size => ({ id:`cabineo-${size}`, category:'joinery', label:`Lamello Cabineo ${size} — surface mounted`, status:'drilling', image:'assets/hardware/cabineo.png', source:'https://lamello.com/fileadmin/products/Operating_instructions_Cabineo.pdf#page=2',
    note:`Corner joints: 3 overlapping Ø15 × 11 mm housing bores; Ø5 × ${size} mm mating pilot. Bore pattern, not profile cuts. Screw axis 5 mm from mounting face. Nesting leaves at least 7.8 mm between parts for the open-edge bores.`,
    values:{'hardware.joineryType':`cabineo-${size}`,'hardware.connectorEndOffset':37,'hardware.connectorMaxSpacing':160} })),
  { id:'dado', category:'joinery', label:'Through dados — carcass bottom', status:'routing', image:'assets/hardware/dado.svg',
    note:'Through dados in both sides. The mating bottom extends by twice the engagement. Shelves remain adjustable on pins. Top joints remain unchanged.',
    values:{'hardware.joineryType':'dado','hardware.dadoDepth':6,'hardware.dadoClearance':0.2} },
  { id: 'rastex-18', category: 'joinery', label: 'Hettich Rastex 15 + Twister — 18 mm stock', status: 'drilling', image: 'assets/hardware/rastex-15.png', drawing: 'assets/hardware/rastex-18-machining.png', source: 'https://web.hettich.com/fileadmin/media/Connecting_technology_2016_16359_HUS.pdf#page=10',
    note: 'Cam 13957 + bolt 9047861: Ø15 × 13.4 mm pocket, 34 mm centre offset, Ø8 edge passage, Ø5 × 11.5 mm bolt pilot. 18 mm stock only. Separate edge setup; test fit required.',
    values: { 'hardware.joineryType': 'rastex-18', 'hardware.connectorEndOffset': 37, 'hardware.connectorMaxSpacing': 160 } },
  { id: 'cup-35', category: 'hingeCup', label: '35 mm concealed cup — custom fixing', status: 'drilling', source: sources.blum, note: 'Cup only: 4.5 mm edge distance and 13 mm depth are editable starting values. Verify hinge SKU; screw/dowel fixing holes are not generated.', values: { 'hardware.hingeBoreDiameter': 35, 'hardware.hingeBoreInset': 22, 'hardware.hingeBoreDepth': 13 } },
  { id: 'plate-sa', category: 'hingePlate', label: 'South Africa — existing 20/32 four-hole pattern', status: 'drilling', note: 'Existing shop pattern; confirm the actual plate. Cup settings remain independent.', values: { 'hardware.hingePlatePattern': 'south-africa', 'hardware.hingePlateFrontHoleOffset': 20, 'hardware.hingePlateRearHoleOffset': 32, 'hardware.hingePlateHoleSpacing': 32, 'hardware.hingePlateSecondRow': true } },
  { id: 'plate-37-32', category: 'hingePlate', label: 'Blum cruciform — 37/32 two-hole pattern', status: 'drilling', source: sources.blum, note: 'Plate pattern only, for frameless cabinets. Cup setback, plate height, hinge fixing and overlay depend on the selected hinge.', values: { 'hardware.hingePlatePattern': 'blum', 'hardware.hingePlateFrontHoleOffset': 37, 'hardware.hingePlateRearHoleOffset': 32, 'hardware.hingePlateHoleSpacing': 32, 'hardware.hingePlateSecondRow': false } },
  { id: 'shelf-5-system32', category: 'shelfPins', label: '5 mm pins — 32 mm pitch / 37 mm setback', status: 'drilling', source: sources.shelf, note: 'Front and rear rows use the chosen setback. Set bore depth to suit the actual pin.', values: { 'hardware.shelfPinDiameter': 5, 'hardware.shelfPinSpacing': 32, 'hardware.shelfPinSetback': 37, 'hardware.shelfPinDepth': 10 } },
  { id: 'shelf-quarter-system32', category: 'shelfPins', label: '¼-inch pins — 32 mm pitch / 37 mm setback', status: 'drilling', source: sources.shelfImperial, note: '¼ inch is exactly 6.35 mm. Confirm pin insertion depth.', values: { 'hardware.shelfPinDiameter': 6.35, 'hardware.shelfPinSpacing': 32, 'hardware.shelfPinSetback': 37, 'hardware.shelfPinDepth': 10 } },
  { id: 'handle-none', category: 'handles', label: 'No handle drilling', status: 'drilling', values: { 'hardware.handleType': 'none' } },
  { id: 'handle-knob', category: 'handles', label: 'Knob — one fixing hole', status: 'drilling', note: 'Choose clearance diameter for the actual fixing screw.', values: { 'hardware.handleType': 'knob', 'hardware.handleHoleDiameter': 5 } },
  ...[76.2, 96, 101.6, 128, 160, 192, 224, 256, 320].map(spacing => ({
    id: `pull-${spacing}`, category: 'handles', label: `Pull — ${spacing === 76.2 ? '3 in (76.2 mm)' : spacing === 101.6 ? '4 in (101.6 mm)' : `${spacing} mm`} centres`,
    status: 'drilling', source: sources.pulls, note: 'Centre spacing preset, not a specific pull model. Use the measured centres; nominal inch equivalents can be rounded in catalogues.',
    values: { 'hardware.handleType': 'pull', 'hardware.handleHoleSpacing': spacing, 'hardware.handleHoleDiameter': 5 },
  })),
  { id: 'runner-3832e', category: 'runners', label: 'Accuride 3832E — side-mount fit', status: 'fit', source: sources.accuride,
    note: '12.7 mm side space (+0.8 / −0); select an actual length. Fit only: use the manufacturer jig/drawing for mounting holes. Face frames need blocking or rear brackets.',
    values: { 'hardware.runnerMode': 'side-mount', 'drawers.sideClearance': 12.7, 'hardware.runnerLength': 500 },
    lengths: [250, 300, 350, 400, 450, 500, 550, 600, 650, 700] },
  { id: 'joinery-none', category: 'joinery', label: 'None', status: 'drilling', values: { 'hardware.joineryType': 'none' } },
  { id: 'dowel-8x30', category: 'joinery', image: 'assets/hardware/dowels.jpg', imageNote: 'TIMCO 8 × 30 mm dowels shown as a type reference; use the size selected above.', imageSource: 'https://timco.co.uk/WDOWEL830P-wooden-dowels', label: 'Dowels — 8 × 30 mm', status: 'drilling', note: 'Bottom, top and stretchers only. Matched face bores and a separate edge-boring schedule; 2 mm total glue allowance. Physical trial required.',
    values: { 'hardware.joineryType': 'dowel', 'hardware.dowelDiameter': 8, 'hardware.dowelLength': 30, 'hardware.dowelFaceDepth': 12, 'hardware.dowelEdgeDepth': 20, 'hardware.dowelEndOffset': 37, 'hardware.dowelMaxSpacing': 160 } },
  { id: 'dowel-quarter', category: 'joinery', image: 'assets/hardware/dowels.jpg', imageNote: 'TIMCO 8 × 30 mm dowels shown as a type reference; use the size selected above.', imageSource: 'https://timco.co.uk/WDOWEL830P-wooden-dowels', label: 'Dowels — ¼ × 1 inch', status: 'drilling', note: 'Bottom, top and stretchers only. Face/edge depth totals include glue allowance. Physical trial required.',
    values: { 'hardware.joineryType': 'dowel', 'hardware.dowelDiameter': 6.35, 'hardware.dowelLength': 25.4, 'hardware.dowelFaceDepth': 10, 'hardware.dowelEdgeDepth': 17.4, 'hardware.dowelEndOffset': 37, 'hardware.dowelMaxSpacing': 160 } },
  { id: 'pocket-manual', category: 'joinery', image: 'assets/hardware/pocket-screws.jpg', imageNote: 'Kreg screw shown as a type reference; choose screw length and thread for your stock.', imageSource: 'https://www.kregtool.com/shop/pocket-hole-joinery/pocket-hole-screws-plugs/zinc-pocket-hole-screws/SML-F125-100.html', label: 'Pocket screws — manual jig assembly', status: 'manual', source: sources.kreg, note: 'Assembly note only; no angled bores in face DXFs. Set the jig and screw length for measured stock.', values: { 'hardware.joineryType': 'pocket-manual' } },
];

export function hardwarePreset(id) { return HARDWARE_LIBRARY.find(p => p.id === id); }

export function applyHardwarePreset(config, id) {
  const preset = hardwarePreset(id);
  if (!preset) throw new Error(`Unknown hardware preset: ${id}`);
  const next = structuredClone(config);
  next.hardware ||= {};
  next.hardware.library = { ...next.hardware.library, [preset.category]: id };
  for (const [path, value] of Object.entries(preset.values)) {
    const [group, key] = path.split('.');
    next[group] ||= {};
    next[group][key] = value;
  }
  return next;
}

export function selectedHardware(config) {
  return Object.entries(config.hardware?.library || {}).map(([category, id]) => {
    const preset = hardwarePreset(id);
    if (!preset || preset.category !== category) return { category, label: 'Custom / existing dimensions', status: 'custom' };
    // Preserve imported/edited dimensions without reporting them as the original preset.
    const matches = Object.entries(preset.values).every(([path, value]) => {
      const [group, key] = path.split('.');
      return path === 'hardware.runnerLength' || config[group]?.[key] === value;
    });
    return matches ? preset : { category, label: 'Custom / existing dimensions', status: 'custom' };
  });
}

export function hardwareWarnings(config) {
  const hw = config.hardware || {};
  const warnings = [];
  const drawers = config.front?.mode === 'drawers' || (!config.front?.mode && config.drawers?.count > 0);
  if (!drawers && hw.library?.hingePlate === 'plate-37-32' && config.construction !== 'frameless') warnings.push('The 37/32 cruciform preset requires a frameless carcass; plate bores omitted. Use the actual face-frame hinge drawing.');
  if (!drawers && (config.shelves?.count ?? 0) > 0) {
    if (!(hw.shelfPinSpacing > 0) || config.height / hw.shelfPinSpacing >= 10000) warnings.push('Shelf pin pitch must be positive and produce fewer than 10000 rows; pin bores omitted.');
    if (!(hw.shelfPinDepth > 0 && hw.shelfPinDepth <= config.materials.caseThickness - 2) && hw.shelfPinDepth != null) warnings.push('Shelf pin depth must leave at least 2mm of material; pin bores omitted.');
  }
  if (drawers && hw.runnerMode === 'side-mount') {
    const depth = config.depth - (config.overlay.type === 'inset' ? 0 : config.materials.doorThickness)
      - (config.backMount === 'grooved-in' ? config.materials.backThickness : 0) - (config.construction === 'frameless' ? 0 : config.materials.caseThickness);
    if (!(hw.runnerLength > 0 && hw.runnerLength + 3.2 <= depth)) warnings.push('Selected runner is too long for the available cabinet depth; drawer boxes omitted.');
    if (!(config.drawers.sideClearance >= 12.7 && config.drawers.sideClearance <= 13.5)) warnings.push('Accuride 3832E side space must be 12.7–13.5mm per side; drawer boxes omitted.');
    if (config.construction !== 'frameless') warnings.push('Side-mount runner fit currently requires a frameless carcass; drawer boxes omitted.');
  }
  return warnings;
}

export function hardwareBom(config, panels) {
  const hw = config.hardware || {};
  const rows = [];
  const label = category => selectedHardware(config).find(p => p.category === category)?.label || 'Custom / existing';
  const count = purpose => panels.reduce((sum, p) => sum + (p.holes || []).filter(h => h.purpose === purpose).length, 0);
  const hingeCount = count('hinge-cup');
  if (hingeCount) rows.push({ item: label('hingePlate'), quantity: hingeCount, unit: 'hinge / plate sets', note: 'Cup fixing screws and plate height must match actual hinge.' });
  const fronts = panels.filter(p => p.type === 'door' || p.type === 'drawer');
  const handles = fronts.filter(p => p.holes.some(h => h.purpose === 'handle')).length;
  if (handles) rows.push({ item: label('handles'), quantity: handles, unit: hw.handleType === 'knob' ? 'knobs' : 'pulls' });
  const shelves = panels.filter(p => p.type === 'shelf').length;
  if (shelves && count('shelf-pin')) rows.push({ item: label('shelfPins'), quantity: shelves * 4, unit: 'shelf pins' });
  const drawers = panels.filter(p => /(?:^|__)drawer-\d+-side-left$/.test(p.id)).length;
  if (drawers) rows.push({ item: label('runners'), quantity: drawers, unit: 'runner pairs', note: hw.runnerMode === 'side-mount' ? `Length ${hw.runnerLength} mm; mounting by manufacturer drawing/jig.` : 'Existing reference holes are not a manufacturer mounting pattern.' });
  const dowels = panels.reduce((n, p) => n + (p.edgeBores || []).filter(h => h.purpose === 'alignment-dowel').length, 0);
  const cams = count('cam-housing');
  const cabineos = count('cabineo-pilot');
  if (cabineos) rows.push({ item:`Lamello ${hw.joineryType === 'cabineo-8' ? 'Cabineo 8' : 'Cabineo 12'} (surface mounted)`, quantity:cabineos, unit:'connectors' });
  if (cams) rows.push({ item: 'Hettich Rastex 15 cam 13957 + Twister DU 232 T bolt 9047861', quantity: cams, unit: 'cam / bolt sets' });
  if (dowels) rows.push({ item: `Dowel ${hw.dowelDiameter} × ${hw.dowelLength} mm`, quantity: dowels, unit: 'dowels' });
  return rows;
}
