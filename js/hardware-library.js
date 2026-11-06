import { frontLayout, rearInset } from './front-layout.js?v=20261105j';
import { runnerSettings } from './runner-layout.js?v=20261105g';
import { TANDEM_563H, TANDEM_563F, MOVENTO_763H, QUADRO_2D, QUADRO_5D, RICHELIEU_828 } from './blum-runner-layout.js?v=20261106aq';
import { splitStockAppearance } from './material-presets.js?v=20261106aq';

export const THIN_HINGE_SCREWS = [
  {sku:'9217435', diameter:3.6, depth:8},
  {sku:'9238321', diameter:5, depth:8},
];

export function isDenseHingeStock(stock, role) {
  const label = stock.stockSelections?.[role]?.material ||
    (role === 'front' ? stock.frontMaterial || stock.doorMaterial : stock.caseMaterial);
  return ['compact hpl', 'solid surface'].includes(splitStockAppearance(label).material.toLowerCase());
}

export function thinHingeScrew(config) {
  if (!isDenseHingeStock(config.materials, 'front')) return undefined;
  return THIN_HINGE_SCREWS.find(screw => screw.sku === config.hardware.thinHingeScrew);
}
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
  { name: 'HÃ¤fele Minifix 15', image: 'assets/hardware/minifix-15.png', source: 'https://hafelethailand.com/wp-content/uploads/2025/12/02-connector-technology-shelf-supports.pdf#page=14', note: 'Reference only. Cam depth depends on stock; 24/34 mm offset and edge drilling depend on the bolt.' },
  { name: 'HÃ¤fele Rafix 20', image: 'assets/hardware/rafix-20.png', source: 'https://hafelethailand.com/wp-content/uploads/2025/12/02-connector-technology-shelf-supports.pdf#page=37', note: 'Reference only. Ø20 open-edge pocket; housing, panel thickness and mating bolt must match.' },
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
  ...[{ id:'hinge-blum-71b3550',category:'hingeCup',label:'Blum 71B3550 + 173H7100 — 18 mm frameless preparation',status:'drilling',pairedPreset:'plate-blum-173h7100',
    source:'https://d2.blum.com/services/BEC003/concealedhinges_ep_dok_bus_%24sen-us_%24aof_%24v18.pdf#page=10',
    note:'Screw-on 110° overlay hinge with D0 plate: 18 mm frameless carcass/door, full overlay and 3 mm gap. Ø35 × 13 mm cup, 5.5 mm edge distance gives 16.5 mm overlay; two fixing pilots at 45 × 9.5 mm, away from the door edge. Blum CAM specifies Ø2.5 × 3 mm starter pilots for both parts. Verify supplied screws and stock.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':23,'hardware.hingeBoreDepth':13} },
  { id:'hinge-blum-71b3550-19mm',category:'hingeCup',label:'Blum 71B3550 + 173H7100 — 19 mm frameless preparation',status:'drilling',
    pairedPreset:'plate-blum-173h7100',blum19:true,
    source:'https://publications.blum.com/2024/catalogue/en/77/',
    note:'19 mm frameless carcass and door, full overlay and 4 mm reveal setting. A 6 mm cup-edge distance gives 17 mm actual overlay and preserves the closed CAD registration. Verify the supplied screws and stock.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':23.5,'hardware.hingeBoreDepth':13} },
  { id:'hinge-blum-71b3750',category:'hingeCup',label:'Blum 71B3750 + 173H7100 — 18 mm inset set',status:'drilling',
    pairedPreset:'plate-blum-173h7100',blumInset:true,source:'https://publications.blum.com/2024/catalogue/en/77/',
    note:'18 mm frameless carcass and door, inset with a 2 mm side gap (4 mm reveal setting). Ø35 × 13 mm cup with 3 mm edge distance, 56.5 mm plate setback and Ø2.5 × 3 mm starter pilots. Apply the R1 front-edge radius separately.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':20.5,'hardware.hingeBoreDepth':13} },
  ].flatMap(preset => {
    const note = `${preset.note} Lower Panel opacity with the door closed to inspect the full assembly when the CAD is available. The moving links are shown in the verified closed pose. Door motion is approximate.`;
    return [{...preset, note}, {
      ...preset, id:`${preset.id}-86`, label:`${preset.label} with 86° stop`,
      blumStop:true,
      note:`${note} Fit one 70T3553 stop per hinge. The preview uses the nominal 86° limit.`,
    }];
  }),
  { id:'plate-blum-173h7100',category:'hingePlate',label:'Blum 173H7100 — D0 / 37 × 32 mm screw-on plate',status:'drilling',
    source:'https://d2.blum.com/services/BEC003/concealedhinges_ep_dok_bus_%24sen-us_%24aof_%24v18.pdf#page=49',
    note:'0 mm cruciform plate, one fixing pair 32 mm apart. Setback is 37 mm for the matched 71B3550 overlay and 56.5 mm for the matched 71B3750 inset. Blum CAM specifies Ø2.5 × 3 mm starter pilots. Verify supplied screws and stock.',
    values:{'hardware.hingePlatePattern':'blum','hardware.hingePlateFrontHoleOffset':37,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':2.5,'hardware.hingePlateDepth':3} },
  { id:'hinge-hettich-9071205', category:'hingeCup', label:'Hettich Sensys 9071205 — 18 mm frameless set', status:'drilling',
    pairedPreset:'plate-hettich-9071575', cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/in_EN/Hinges/Sensys-hinge-series/Hinges/Sensys-110%C2%B0-hinge-with-integrated-silent-system-%28Sensys-8645i%29%2C-nickel-plated%2C-overlay%2C-Opening-angle-110%C2%B0%2C-TH-drilling-pattern-52-x-5-5-mm%2C-for-screwing-on-%28-%29/p/9071205',
    note:'Matched screw-on hinge and D0 plate. Initial assembly: 18 mm frameless carcass and door, full overlay, 3 mm gap. Ø35 × 12.8 mm cup, 4 mm cup edge distance; two Ø2.5 × 10 mm fixing pilots at 52 × 5.5 mm. Manufacturer hinge CAD shows with the door closed; articulated motion is pending. Trial fit required.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':21.5,'hardware.hingeBoreDepth':12.8} },
  ...[[9094270,'full-overlay','D1'],[9094280,'partial-overlay','D3'],[9094290,'inset','D4']].map(([sku,thinOverlay,section]) => ({
    id:`hinge-hettich-${sku}`,category:'hingeCup',label:`Hettich Sensys ${sku} — 10 mm ${thinOverlay} door (${section})`,status:'drilling',
    pairedPreset:thinOverlay==='inset'?'plate-hettich-9071576':'plate-hettich-9071575',
    source:`https://shop.hettich.com/us_EN/p/${sku}`,model:`hettich-${sku}`,thinOverlay,
    note:`19 mm frameless carcass, 10 mm door. ${thinOverlay==='inset'?'2 mm reveal setting and 48 mm plate row.':thinOverlay==='partial-overlay'?'9.5 mm partial overlay, 4 mm reveal setting and 37 mm plate row.':'4 mm reveal setting and 37 mm plate row.'} Ø35 × 7.8 mm cup. Select the actual fixing screw to export door pilots for Compact HPL or Solid Surface. Other stock requires manual fitting.`,
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':7.8},
  })),
  { id:'hinge-hettich-9094280-d2',category:'hingeCup',label:'Hettich Sensys 9094280 — 10 mm side and door (D2)',status:'drilling',
    pairedPreset:'plate-hettich-9071575-d2',source:'https://catalog.hettich.com/Hinges/Anwendungsbeispiele_Sensys/en_DE/catalogs/Anwendungsbeispiele_Sensys_en_DE/pdf/complete.pdf#page=9',
    model:'hettich-9094280',thinOverlay:'partial-overlay',thinCase:true,
    note:'Use a 10 mm Compact HPL or Solid Surface carcass and a 10 mm front. Set partial overlay to 10 mm and reveal to 2 mm for 9 mm actual overlay. The D0 plate uses Hettich 9238321 screws in Ø5 × 8 mm pilots.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':23.5,'hardware.hingeBoreDepth':7.8} },
  { id:'plate-hettich-9071575-d2',category:'hingePlate',label:'Hettich 9071575 — D0 thin cabinet side',status:'drilling',
    source:'https://www.hettich.com/fileadmin/Media_Center/Catalogue/Sensys_Brochure_1121__918941701_US_Pattern.pdf#page=68',
    note:'For the matched D2 hinge set. Ø5 × 8 mm on a 37 × 32 mm row with Hettich 9238321 screws.',
    values:{'hardware.hingePlatePattern':'hettich-sensys','hardware.hingePlateFrontHoleOffset':37,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':5,'hardware.hingePlateDepth':8} },
  { id:'hinge-hettich-9099540',category:'hingeCup',label:'Hettich Sensys 9099540 — 165° frameless set',status:'drilling',
    pairedPreset:'plate-hettich-9071575',source:'https://shop.hettich.com/us_EN/p/9099540',
    note:'18 mm frameless full overlay with 3 mm gap. Ø35 × 11.6 mm cup, 52 × 5.5 mm fixing pattern and D0 plate. Verify pilot sizes in your stock. Manufacturer CAD shows with the door closed; articulation remains pending.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':21.5,'hardware.hingeBoreDepth':11.6} },
  ...[[9071205,'A1',12.8],[9099540,'E1',11.6]].map(([sku,application,depth]) => ({
    id:`hinge-hettich-${sku}-${application.toLowerCase()}`,category:'hingeCup',
    label:`Hettich Sensys ${sku} — 19 mm full-overlay set (${application})`,status:'drilling',
    pairedPreset:'plate-hettich-9071575',
    source:`https://web2.hettich.com/hbh/addon/montage/Anwendungsbeispiele_Scharniere_EN.pdf#page=${application === 'A1' ? 8 : 12}`,
    note:'19 mm frameless carcass and door, full overlay and 4 mm reveal setting (2 mm per outer edge). 4.5 mm cup-edge distance and 37 mm plate row. Closed-pose CAD. Verify physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':depth},
  })),
  ...[
    [9071205,'9071205-a1',12.8,'full overlay'],
    [9071206,'9071206',12.8,'half overlay'],
    [9099540,'9099540-e1',11.6,'165° full overlay'],
    [9099550,'9099550-e2',11.6,'165° half overlay'],
    [9099590,'9099590',11.6,'165° half overlay, TS'],
  ].map(([sku,base,cupDepth,application]) => ({
    id:`hinge-hettich-${sku}-lr28`,category:'hingeCup',
    label:`Hettich Sensys ${sku} — 19 mm ${application} / 28 mm plate row`,status:'drilling',
    baseHinge:`hinge-hettich-${base}`,pairedPreset:'plate-hettich-9071570',source:'https://shop.hettich.com/pr_EN/p/9071570',
    note:`19 mm frameless case and door, 4 mm reveal setting. Use ${application.includes('half')?'9.5 mm partial overlay':'full overlay'}. The D0 plate shifts the screw row to 28 mm and preserves the nominal clip position. Trial-fit before machining.`,
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':cupDepth},
  })),
  { id:'plate-hettich-9071570',category:'hingePlate',label:'Hettich 9071570 — D0 / 28 × 32 mm screw-on plate',status:'drilling',
    source:'https://shop.hettich.com/pr_EN/p/9071570',
    note:'One fixing pair 32 mm apart at 28 mm setback. Verify Ø3 × 12 mm starter pilots in the supplied stock.',
    values:{'hardware.hingePlatePattern':'hettich-sensys','hardware.hingePlateFrontHoleOffset':28,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':3,'hardware.hingePlateDepth':12} },
  {id:'hinge-hettich-9090260-b1',category:'hingeCup',label:'Hettich Sensys 9090260 — 28 mm overlay door (B1)',status:'drilling',
    pairedPreset:'plate-hettich-9071575',application:'B1',thickDoor:28,angle:95,
    source:'https://shop.hettich.com/us_EN/p/9090260',
    note:'95° hinge. Use a 19 mm frameless carcass, 28 mm full-overlay door, 4 mm reveal setting and 37 mm plate row. Verify supplied screws and physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':12.8}},
  {id:'hinge-hettich-9090260-b2',category:'hingeCup',label:'Hettich Sensys 9090260 — 32 mm overlay door (B2)',status:'drilling',
    pairedPreset:'plate-hettich-9071576-a2',application:'B2',thickDoor:32,caseThickness:22,reveal:6,angle:95,
    source:'https://web2.hettich.com/hbh/addon/montage/Anwendungsbeispiele_Scharniere_EN.pdf#page=10',
    note:'95° hinge. Use a 22 mm frameless carcass, 32 mm full-overlay door, 6 mm reveal setting and the D1.5 plate at 37 mm. The cup edge distance is 8 mm. Verify supplied screws and physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':25.5,'hardware.hingeBoreDepth':12.8}},
  {id:'hinge-hettich-9090270-b3',category:'hingeCup',label:'Hettich Sensys 9090270 — 28 mm half-overlay door (B3)',status:'drilling',
    pairedPreset:'plate-hettich-9071575',application:'B3',thickDoor:28,angle:95,
    source:'https://shop.hettich.com/de_EN/p/9091410',
    note:'95° hinge. Use a 19 mm frameless carcass, 28 mm door, 9.5 mm partial overlay and 4 mm reveal setting. The D0 plate uses the 37 mm row. Verify supplied screws and physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':12.8}},
  {id:'hinge-hettich-9090280-b4',category:'hingeCup',label:'Hettich Sensys 9090280 — 22 mm inset door (B4)',status:'drilling',
    pairedPreset:'plate-hettich-9071576',application:'B4',thickDoor:22,reveal:2,angle:95,
    source:'https://shop.hettich.com/de_EN/p/9091420',
    note:'95° hinge. Use a 19 mm frameless carcass, 22 mm inset door and 2 mm reveal setting. The D1.5 plate uses a 60 mm row. Verify supplied screws and physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':12.8}},
  ...[['B5',28],['B6',30,120,'9090756'],['B7',32,105,'9090756'],['B8',34,90,'9090864']].map(([application,thickDoor,angle,limiter]) => ({
    id:`hinge-hettich-9099540-${application.toLowerCase()}`,category:'hingeCup',
    label:`Hettich Sensys 9099540 — ${thickDoor} mm overlay door (${application})`,status:'drilling',
    pairedPreset:'plate-hettich-9071575',application,thickDoor,limiter,angle,
    source:'https://catalog.hettich.com/Hinges/Anwendungsbeispiele_Sensys/en_DE/catalogs/Anwendungsbeispiele_Sensys_en_DE/pdf/complete.pdf#page=10',
    note:`19 mm frameless carcass, ${thickDoor} mm full-overlay door, 4 mm reveal setting and 37 mm plate row. Apply the R1 door-edge radius separately.${limiter ? ` Fit limiter ${limiter} in the ${angle}° position.` : ''}`,
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':11.6},
  })),
  { id:'hinge-hettich-9071205-a2',category:'hingeCup',label:'Hettich Sensys 9071205 — 16 mm carcass / 19 mm overlay door (A2)',status:'drilling',
    pairedPreset:'plate-hettich-9071576-a2',
    source:'https://catalog.hettich.com/Hinges/Anwendungsbeispiele_Sensys/en_DE/catalogs/Anwendungsbeispiele_Sensys_en_DE/pdf/complete.pdf#page=8',
    note:'Frameless full overlay with a 2 mm reveal setting. The D1.5 plate uses the 37 mm row. The cup has a 4 mm edge distance. Closed-pose CAD.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':21.5,'hardware.hingeBoreDepth':12.8} },
  { id:'plate-hettich-9071576-a2',category:'hingePlate',label:'Hettich 9071576 — D1.5 / 37 × 32 mm overlay plate',status:'drilling',
    source:'https://shop.hettich.com/gb_EN/p/9071576',
    note:'D1.5 screw-on plate with the 37 mm row for application A2. Verify pilot fit against the supplied screws and stock.',
    values:{'hardware.hingePlatePattern':'hettich-sensys','hardware.hingePlateFrontHoleOffset':37,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':3,'hardware.hingePlateDepth':12} },
  { id:'plate-hettich-9071575', category:'hingePlate', label:'Hettich 9071575 — D0 / 37 × 32 mm screw-on plate', status:'drilling',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/in_EN/Hinges/Intermat-hinge-series/Mounting-plates/Mounting-plates-for-Sensys-and-Intermat/Cross-mounting-plate-with-oblong-hole-height-adjustment%2C-nickel-plated%2C-Hole-line-37-x-32-mm%2C-for-screwing-on%2C-distance-0-0-mm/p/9071575',
    note:'0 mm plate; one pair 32 mm apart at 37 mm setback. Ø3 × 12 mm pilots are starting values for the specified Ø4.5 × 16 mm wood screws; verify pilot fit in your material. Select the matched Sensys hinge for assembly CAD and cup-fixing pilots.',
    values:{'hardware.hingePlatePattern':'hettich-sensys','hardware.hingePlateFrontHoleOffset':37,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':3,'hardware.hingePlateDepth':12} },
  { id:'hinge-hettich-9071206',category:'hingeCup',label:'Hettich Sensys 9071206 — 18 / 19 mm half-overlay set',status:'drilling',
    pairedPreset:'plate-hettich-9071575',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/us_EN/p/9071206',
    note:'For 18 mm stock, use 9 mm partial overlay and a 3 mm reveal setting. For 19 mm stock (A3), use 9.5 mm partial overlay and a 4 mm reveal setting. This gives 7.5 mm actual overlap with the B3 hinge, D0 plate and 4.5 mm cup edge distance. Closed CAD only; trial fit required.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':12.8} },
  { id:'hinge-hettich-9099590',category:'hingeCup',label:'Hettich Sensys 9099590 — 19 mm wide-angle half-overlay set (TS)',status:'drilling',
    pairedPreset:'plate-hettich-9071575',
    source:'https://shop.hettich.com/se_EN/p/9099590',
    note:'19 mm frameless carcass and door, 9.5 mm partial overlay and 4 mm reveal setting give 7.5 mm actual overlay. TS 48 × 6 mm fixing pattern. Closed CAD only.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':11.6} },
  { id:'hinge-hettich-9099550-e2',category:'hingeCup',label:'Hettich Sensys 9099550 — 19 mm wide-angle half-overlay set (E2)',status:'drilling',
    pairedPreset:'plate-hettich-9071575',
    source:'https://shop.hettich.com/ca_EN/p/9099550',
    note:'19 mm frameless carcass and door, 9.5 mm partial overlay and 4 mm reveal setting give 7.5 mm actual overlay. TH 52 × 5.5 mm fixing pattern. Closed CAD only.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':11.6} },
  { id:'hinge-hettich-9071207',category:'hingeCup',label:'Hettich Sensys 9071207 — 18 mm inset set',status:'drilling',pairedPreset:'plate-hettich-9071576',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/de_EN/Hinges/Sensys-hinge-series/Hinges/Sensys-110%C2%B0-hinge-with-integrated-silent-system-%28Sensys-8645i%29%2C-nickel-plated%2C-inset%2C-Opening-angle-110%C2%B0%2C-TH-drilling-pattern-52-x-5-5-mm%2C-for-screwing-on-%28-%29/p/9071207',
    note:'Select inset overlay, 18 mm frameless carcass/door and 3 mm gap. Matched B−4 hinge and D1.5 plate; Ø35 × 12.8 mm cup with 4 mm edge distance, two Ø2.5 × 10 mm pilots at 52 × 5.5 mm. Plate row = door thickness + 38 mm. Original CAD shows closed only; articulation and physical fitting remain pending.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':21.5,'hardware.hingeBoreDepth':12.8} },
  { id:'hinge-hettich-9071207-a5',category:'hingeCup',label:'Hettich Sensys 9071207 — 19 mm inset set (A5)',status:'drilling',
    pairedPreset:'plate-hettich-9071576',
    source:'https://web2.hettich.com/hbh/addon/montage/Anwendungsbeispiele_Scharniere_EN.pdf#page=8',
    note:'Hettich A5: 19 mm frameless carcass and inset door, 2 mm reveal setting (1 mm per edge), 4.5 mm cup-edge distance and 57 mm plate row. Closed-pose CAD. Verify physical fit.',
    values:{'hardware.hingeBoreDiameter':35,'hardware.hingeBoreInset':22,'hardware.hingeBoreDepth':12.8} },
  { id:'plate-hettich-9071576',category:'hingePlate',label:'Hettich 9071576 — D1.5 / inset screw-on plate',status:'drilling',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',source:'https://shop.hettich.com/gb_EN/Hinges/Intermat-hinge-series/Mounting-plates/Mounting-plates-for-Sensys-and-Intermat/Cross-mounting-plate-with-oblong-hole-height-adjustment%2C-nickel-plated%2C-Hole-line-37-x-32-mm%2C-for-screwing-on%2C-distance-1-5-mm/p/9071576',
    note:'Matched inset installation: 32 mm fixing pair, cabinet row = door thickness + 38 mm (37 mm hole line plus 1 mm depth setting). Plate distance 1.5 mm. Ø3 × 12 mm starter pilots for specified Ø4.5 × 16 mm countersunk screws; verify stock and trial fit. Select the matching 9071207 hinge for CAD.',
    values:{'hardware.hingePlatePattern':'hettich-sensys-inset','hardware.hingePlateFrontHoleOffset':38,'hardware.hingePlateRearHoleOffset':32,'hardware.hingePlateHoleSpacing':32,'hardware.hingePlateSecondRow':false,'hardware.hingePlateDiameter':3,'hardware.hingePlateDepth':12} },
  { id: 'cup-blum-inset', category: 'hingeCup', label: 'Blum 71B3750 — 110° inset hinge', status: 'drilling', source: 'https://www.blum.org.uk/pdf/HI71B3750-spec.pdf', note: 'Fully cranked inset hinge, frameless cabinets. Ø35 × 13 mm cup; 4.5 mm edge distance is an editable starting point (catalogue range 3–7 mm). Select the inset plate preset too. Fit cup screws by hand at the 45 × 9.5 mm pattern. Verify pilot diameter, depth and plate height on the supplied hardware.', values: { 'hardware.hingeBoreDiameter': 35, 'hardware.hingeBoreInset': 22, 'hardware.hingeBoreDepth': 13 } },
  { id: 'plate-blum-inset', category: 'hingePlate', label: 'Blum frameless inset — 37/32 + door setback', status: 'drilling', source: 'https://publications.blum.com/2024/catalogue/en/77/', note: 'For fully cranked inset hinges. One 32 mm pair, base setback 37 mm plus door thickness + 1.5 mm, updated automatically. Start with a 0 mm plate; verify the selected hinge/plate combination. Edit the base offset below to customize.', values: { 'hardware.hingePlatePattern': 'blum-inset', 'hardware.hingePlateFrontHoleOffset': 37, 'hardware.hingePlateRearHoleOffset': 32, 'hardware.hingePlateHoleSpacing': 32, 'hardware.hingePlateSecondRow': false } },
  { id: 'plate-sa', category: 'hingePlate', label: 'South Africa — existing 20/32 four-hole pattern', status: 'drilling', note: 'Existing shop pattern; confirm the actual plate. Cup settings remain independent.', values: { 'hardware.hingePlatePattern': 'south-africa', 'hardware.hingePlateFrontHoleOffset': 20, 'hardware.hingePlateRearHoleOffset': 32, 'hardware.hingePlateHoleSpacing': 32, 'hardware.hingePlateSecondRow': true } },
  { id: 'plate-37-32', category: 'hingePlate', label: 'Blum cruciform — 37/32 two-hole pattern', status: 'drilling', source: sources.blum, note: 'Plate pattern only, for frameless cabinets. Cup setback, plate height, hinge fixing and overlay depend on the selected hinge.', values: { 'hardware.hingePlatePattern': 'blum', 'hardware.hingePlateFrontHoleOffset': 37, 'hardware.hingePlateRearHoleOffset': 32, 'hardware.hingePlateHoleSpacing': 32, 'hardware.hingePlateSecondRow': false } },
  { id: 'shelf-5-system32', category: 'shelfPins', label: '5 mm pins — 32 mm pitch / 37 mm setback', status: 'drilling', source: sources.shelf, note: 'Front and rear rows use the chosen setback. Set bore depth to suit the actual pin.', values: { 'hardware.shelfPinDiameter': 5, 'hardware.shelfPinSpacing': 32, 'hardware.shelfPinSetback': 37, 'hardware.shelfPinDepth': 10 } },
  { id: 'shelf-quarter-system32', category: 'shelfPins', label: '¼-inch pins — 32 mm pitch / 37 mm setback', status: 'drilling', source: sources.shelfImperial, note: '¼ inch is exactly 6.35 mm. Confirm pin insertion depth.', values: { 'hardware.shelfPinDiameter': 6.35, 'hardware.shelfPinSpacing': 32, 'hardware.shelfPinSetback': 37, 'hardware.shelfPinDepth': 10 } },
  { id: 'handle-none', category: 'handles', label: 'No handle drilling', status: 'drilling', values: { 'hardware.handleType': 'none' } },
  { id: 'handle-knob', category: 'handles', label: 'Knob — one fixing hole', status: 'drilling', note: 'Choose clearance diameter for the actual fixing screw.', values: { 'hardware.handleType': 'knob', 'hardware.handleHoleDiameter': 5 } },
  { id:'handle-hettich-9086690',category:'handles',label:'Hettich Touch-in 9086690 — round recessed pull',status:'routing',
    model:'hettich-9086690',keepWithinFront:true,roundRecessDepth:16,roundPocketDiameter:90,
    source:'https://shop.hettich.com/us_EN/p/9086690',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'19 mm front, Ø90 × 16 mm blind pocket, 84 mm rear fixing pitch. Check screw engagement and test the fit.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':84,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070556',category:'handles',label:'Hettich Borgoa 9070556 — 41 mm recessed pull',status:'routing',
    model:'hettich-9070556',roundRecessDepth:8,
    source:'https://shop.hettich.com/dz_EN/p/9070556',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'Ø35 × 8 mm blind front pocket in fronts at least 16 mm thick. Check insertion fit on a test piece.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':35} },
  { id:'handle-hettich-9070537',category:'handles',label:'Hettich Scectis 9070537 — 28 mm knob / matt chrome',status:'drilling',
    model:'hettich-9070537',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf#page=12',
    note:'Ø28 mm, projection 24 mm. STEP shows one central Ø4 mm fixing feature, 8 mm deep. Verify Ø5 mm panel clearance and screw engagement against the supplied fixing.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070581',category:'handles',label:'Hettich Cirpi 9070581 — 30 mm knob / matt chrome',status:'drilling',
    model:'hettich-9070581',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/de_DE/p/9070581',
    note:'Ø30 mm, projection 27 mm. STEP shows one central Ø5 mm fixing feature, 8 mm deep. Verify Ø5.5 mm panel clearance and screw engagement against the supplied fixing.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9070580',category:'handles',label:'Hettich Spalatum 9070580 — 30 mm knob / stainless steel',status:'drilling',
    model:'hettich-9070580',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/de_EN/ProDecor-handle-collection/NEW-MODERN-style-world/Knob-Spalatum,-H-23-mm,-%C3%B8-30-mm,-brushed-stainless-steel/p/9070580',
    note:'Manufacturer CAD: Ø30 mm, projection 23 mm, one central fixing axis. Ø5.5 mm panel clearance is a starting value for the CAD’s nominal Ø5 mm fixing; verify supplied screw. Product thread depth 8 mm; select screw length for panel thickness. Physical fit remains untested.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  ...[[9070744,20,18],[9070740,25,22],[9070735,30,26]].map(([sku, diameter, projection]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Danum ${sku} — ${diameter} mm knob / stainless steel`,status:'drilling',
    model:`hettich-${sku}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:`https://shop.hettich.com/ni_EN/p/${sku}`,
    note:`Manufacturer CAD: Ø${diameter} mm, projection ${projection} mm, one central fixing axis. Check Ø5.5 mm panel clearance and screw length on the supplied knob. The STEP fixing cavity is 7 mm deep, while the catalogue lists 13 mm thread depth.`,
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} })),
  ...[[9070263,14,22],[9070264,18,26.09]].map(([sku,diameter,projection]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Agrinum ${sku} — ${diameter} mm knob / stainless steel`,status:'drilling',
    model:`hettich-${sku}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:`https://shop.hettich.com/gr_EN/p/${sku}`,threadDepth:8,
    note:`Manufacturer CAD: Ø${diameter} mm, projection ${projection} mm, one central Ø5 mm fixing feature. Verify Ø5.5 mm clearance and screw engagement against the supplied knob.`,
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5},
  })),
  { id:'handle-hettich-9070520',category:'handles',label:'Hettich Bona 9070520 — 30 mm knob / polished chrome',status:'drilling',
    model:'hettich-9070520',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/gb_EN/ProDecor-handle-collection/DELUXE-style-world/Knob-Bona%2C-H-41-mm%2C-%C3%B8-30-mm%2C-polished-chrome-plated/p/9070520',
    note:'Manufacturer CAD: Ø30 mm, projection 41 mm, one central fixing axis. Verify the Ø5.5 mm starting clearance against the supplied screw.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9070562',category:'handles',label:'Hettich Serbinum 9070562 — 25 mm knob / stainless steel',status:'drilling',
    model:'hettich-9070562',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/us_EN/p/9070562',
    note:'Nominal Ø25 mm, projection 28 mm. Manufacturer CAD has a 25.54 mm outer envelope and one central fixing axis. Verify Ø5.5 mm starting clearance against the supplied screw.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9070568',category:'handles',label:'Hettich Sipontum 9070568 — 25 mm knob / stainless steel',status:'drilling',
    model:'hettich-9070568',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/us_EN/p/9070568',
    note:'Manufacturer CAD: Ø25 mm, projection 22 mm, one central fixing axis. Verify the Ø5.5 mm starting clearance against the supplied screw.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9070575',category:'handles',label:'Hettich Solva 9070575 — 30 mm knob / polished brass look',status:'drilling',
    model:'hettich-9070575',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/by_EN/p/9070575',
    note:'Manufacturer CAD: Ø30 mm, projection 23 mm, central Ø4 mm fixing and 8 mm thread depth. Verify Ø5 mm panel clearance and screw engagement against the supplied fixings.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071080',category:'handles',label:'Hettich Pesaro 9071080 — 15 mm knob / anodised aluminium',status:'drilling',
    model:'hettich-9071080',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_connector_data_EN.pdf',
    note:'Manufacturer CAD: 15 × 15 mm, projection 23 mm, one central Ø4 mm fixing axis and 5 mm blind fixing depth. Some Hettich sheets list 20 × 20 mm under this article. Verify the supplied knob, Ø5 mm panel clearance and screw engagement.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071109',category:'handles',label:'Hettich Sala 9071109 — 25 mm knob / polished brass look',status:'drilling',
    model:'hettich-9071109',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    note:'Manufacturer CAD: Ø25 mm, projection 20 mm and a single centred Ø5 mm blind fixing, 9 mm deep. Verify Ø5.5 mm panel clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9080852',category:'handles',label:'Hettich Oka 9080852 — 40 × 20 mm knob / polished chrome',status:'drilling',
    model:'hettich-9080852',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    note:'Manufacturer CAD: 40 × 20 mm, projection 26 mm and one centred Ø4 mm fixing, 8 mm deep. Verify Ø5 mm panel clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9113635',category:'handles',label:'Hettich Alvito 9113635 — 21 mm square knob / polished chrome',status:'drilling',
    model:'hettich-9113635',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/us_EN/p/9113635',threadDepth:8,
    note:'Manufacturer CAD: 21 × 21 × 21 mm with one central Ø4 mm fixing. Verify Ø5 mm panel clearance and screw engagement. The STEP cavity is 9.5 mm deep.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9113224',category:'handles',label:'Hettich Fogo 9113224 — 25 mm knob',status:'drilling',
    model:'hettich-9113224',keepWithinFront:true,source:'https://shop.hettich.com/bo_EN/p/9113224',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    threadDepth:10,
    note:'25 × 25 mm footprint and one centred fixing. The STEP projects 23.6 mm and sets the preview envelope.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9113698',category:'handles',label:'Hettich Lodi 9113698 — 25 mm knob / matt chrome',status:'drilling',
    model:'hettich-9113698',keepWithinFront:true,source:'https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_connector_data_EN.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'25 mm diameter, 23 mm projection and one centred fixing. Check screw engagement on the supplied knob.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9069816',category:'handles',label:'Hettich Zante 9069816 — matt white glass knob',status:'drilling',
    model:'hettich-9069816',keepWithinFront:true,source:'https://www1.hettich.com/downloads/imos/Informationsblatt_Hettich_ProDecor_Griffkollektion_200125_V1.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'35 × 18 mm footprint, 39 mm projection and one centred fixing. Check screw engagement on the supplied knob.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5.5} },
  ...[[9071737,128],[9071742,232],[9071751,448],[9071752,482],[9071753,532],[9071755,640]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Lipsia ${sku} — ${spacing} mm`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:'https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_connector_data_EN.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'Two fixing axes and 35 mm projection. Check screw engagement on the supplied pull.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
  })),
  ...[[9070487,96],[9070485,128]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Bathia ${sku} — ${spacing} mm / matt chrome`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:'https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_connector_data_EN.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'Two fixing axes and 28 mm projection. Check screw engagement on the supplied pull.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5.5},
  })),
  ...[[9069953,192],[9069959,352]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Castra ${sku} — ${spacing} mm`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:`Manufacturer CAD: ${spacing+8} × 12 mm, 30 mm projection and two fixing axes. Check screw engagement on the supplied pull.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5.5},
  })),
  { id:'handle-hettich-9071869',category:'handles',label:'Hettich Pola 9071869 — 25 mm square knob',status:'drilling',
    model:'hettich-9071869',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/pl_PL/p/9071869',
    note:'Manufacturer CAD: 25 × 25 × 35 mm with one central Ø4 mm fixing. STEP cavity depth is 8 mm and the catalogue lists 10 mm thread depth. Check Ø5 mm panel clearance and screw engagement.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071860',category:'handles',label:'Hettich 9071860 — 25 mm knob',status:'drilling',
    model:'hettich-9071860',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www.ifurn.net/uploads/tx_dco/informationsblatt_hettich_v20_eng.pdf',
    note:'Archived ProDecor CAD: Ø25 × 23 mm, one central Ø4 mm fixing cavity, 8 mm deep. Verify Ø5 mm panel clearance and screw engagement on the supplied knob.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071857',category:'handles',label:'Hettich Padova 9071857 — 24 mm knob / brushed stainless steel',status:'drilling',
    model:'hettich-9071857',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_data_V40_EN_01.pdf',
    note:'Manufacturer CAD: 24 mm wide, 30 mm projection and one centred Ø4 mm fixing, 8 mm deep. Verify Ø5 mm panel clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070510',category:'handles',label:'Hettich Valentia 9070510 — pewter-effect knob',status:'drilling',
    model:'hettich-9070510',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://shop.hettich.com/am_EN/p/9070510',
    threadDepth:8,
    note:'Archived STEP spans 77.4 × 25.1 mm and projects 39.1 mm. Hettich lists 79 mm length, 41 mm height and 8 mm thread depth. Check the supplied body, Ø5 mm panel clearance and screw engagement before machining.',
    values:{'hardware.handleType':'knob','hardware.handleHoleDiameter':5} },
  ...[[9071060,96],[9071071,128],[9071073,160],[9071075,192],[9071079,256],[9071082,320]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Nidum ${sku} — ${spacing} mm recessed`,status:'routing',
    model:`hettich-${sku}`,keepWithinFront:true,recessed:true,
    source:'https://irp.cdn-website.com/76723d35/files/uploaded/Hettich_Handle_Collection.pdf#page=25',
    note:'Front pocket with four corner reliefs, plus rear clearance bores. Test the recess and confirm screw engagement before machining production fronts.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5} })),
  { id:'handle-hettich-1170155',category:'handles',label:'Hettich Salona 1170155 — 160 mm / brushed steel look',status:'drilling',
    model:'hettich-1170155',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/in_EN/p/1170155',
    note:'Manufacturer CAD: 179 × 19 mm envelope, 27 mm projection and 160 mm fixing centres. Verify Ø5 mm clearance and screw length against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':160,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9080833',category:'handles',label:'Hettich Regina 9080833 — 128 mm / stainless steel look',status:'drilling',
    model:'hettich-9080833',keepWithinFront:true,source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'Manufacturer CAD: 138 × 24 × 30 mm envelope and two Ø4 mm fixing axes, 128 mm apart. Check Ø5 mm panel clearance and screw engagement.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':128,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-115203',category:'handles',label:'Hettich Tolosa 115203 — 96 mm / matt nickel',status:'drilling',
    model:'hettich-115203',keepWithinFront:true,source:'https://shop.hettich.com/ma_EN/p/115203',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'126 × 10 × 28 mm body, 96 mm fixing centres. Verify Ø5 mm panel clearance and screw length against the 7 mm thread depth.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':96,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070102',category:'handles',label:'Hettich Asopus 9070102 — 96 mm / stainless steel',status:'drilling',
    model:'hettich-9070102',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/nl_EN/p/9070102',
    note:'Manufacturer CAD: 108 mm overall length, 40 mm projection, 96 mm fixing centres. Verify Ø5 mm clearance and screw length against supplied fixings and the 8 mm thread depth.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':96,'hardware.handleHoleDiameter':5} },
  ...[[9070103,128],[9070117,160],[9070105,192],[9070118,224],[9070119,320],[9070111,352],[9070120,480],[9070122,704],
    [9070096,64,8,27,32],[9069942,96,8,32],[9070101,128,8,32],[9069815,96,10,32],[9069818,128,10,32],
    [9070124,160,10,32],[9070420,192,10,32],
    [9069821,224,10,32],[9069865,320,10,32],[9070421,352,10,32]].map(([sku,spacing,diameter=12,projection=40,catalogueProjection]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Asopus ${sku} — ${spacing} mm / Ø${diameter} stainless steel`,status:'drilling',
    model:`hettich-${sku}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:`https://shop.hettich.com/nl_EN/p/${sku}`,threadDepth:8,
    note:`Manufacturer CAD: ${spacing+diameter} mm overall length, ${projection} mm projection, ${spacing} mm fixing centres.${catalogueProjection ? ` Allow ${catalogueProjection} mm projection per the catalogue.` : ''} Verify Ø5 mm clearance and screw engagement.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
  })),
  ...[['Torino',9071926,160,192],['Torino',9071929,224,256],['Capua',9064670,320,360]].flatMap(([name,sku,inner,outer]) =>
    [inner,outer].map(spacing => ({
      id:`handle-hettich-${sku}${spacing===inner ? '-inner' : ''}`,category:'handles',label:`Hettich ${name} ${sku} — ${spacing} mm`,status:'drilling',
      model:`hettich-${sku}${spacing===inner ? '-inner' : ''}`,keepWithinFront:true,source:`https://shop.hettich.com/de_EN/p/${sku}`,
      cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
      note:`Use the ${spacing} mm fixing pair. Check Ø5 mm panel clearance and screw engagement.`,
      values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
    }))),
  ...[[9118858,96],[9069890,128],[9069893,160],[9070104,192],[9070106,224],[9070107,256],[9070108,288],[9070109,352],[9070110,416],
    [9070112,448],[9070113,640]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Brema ${sku} — ${spacing} mm`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:`https://shop.hettich.com/de_EN/p/${sku}`,
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:`Manufacturer CAD: ${spacing+12} × 14 mm, 35 mm projection, ${spacing} mm fixing centres. Check Ø5 mm panel clearance and screw engagement with the supplied fixings.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
  })),
  ...[[9070440,64,78],[9070446,96,115],[9070501,128,152],[9070451,160,190],[9070457,192,228],
    [9070504,224,263],[9070466,256,300],[9070509,288,339],[9070481,320,376],[9070494,352,394]].map(([sku,spacing,overall]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Vada ${sku} — ${spacing} mm / stainless steel`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:`https://shop.hettich.com/by_EN/p/${sku}`,
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:`The archived STEP spans approximately ${overall} mm and sets the fit limit. Verify Ø5 mm panel clearance and screw engagement with the supplied fixings.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
  })),
  ...[[9070583,32],[9070588,50],[9070593,70]].map(([sku,spacing]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Ticinum ${sku} — ${spacing} mm / anodised aluminium`,status:'drilling',
    model:`hettich-${sku}`,keepWithinFront:true,source:`https://shop.hettich.com/bo_EN/p/${sku}`,
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'Two fixing axes on the front mounting face. Check Ø5 mm panel clearance and screw engagement in the shallow fixing features. The preview uses the full profile envelope.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5},
  })),
  { id:'handle-hettich-9070605',category:'handles',label:'Hettich Avenio 9070605 — 64 mm / polished chrome',status:'drilling',
    model:'hettich-9070605',keepWithinFront:true,source:'https://shop.hettich.com/de_EN/p/9070605',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'72 × 8 mm bar with 32 mm projection, two fixing axes at 64 mm centres and 7 mm thread depth. Verify panel clearance and screw length in the actual stock.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':64,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070552',category:'handles',label:'Hettich Avenio 9070552 — 160 mm / matt chrome',status:'drilling',
    model:'hettich-9070552',keepWithinFront:true,
    source:'https://shop.hettich.com/be_EN/p/9070552',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'170 × 10 mm bar, 32 mm projection. Two fixing axes at 160 mm centres and 7 mm blind fixing depth in the STEP. Verify Ø5 mm panel clearance and screw engagement.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':160,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9070572',category:'handles',label:'Hettich Avenio 9070572 — 192 mm / matt chrome',status:'drilling',
    model:'hettich-9070572',keepWithinFront:true,
    source:'https://shop.hettich.com/nl_NL/-/Avenio/bp/variant7556726439963',
    cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    note:'202 × 10 mm bar, 32 mm projection. Two fixing axes at 192 mm centres and 7 mm blind fixing depth in the STEP. Verify Ø5 mm panel clearance and screw engagement.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':192,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071096',category:'handles',label:'Hettich Rossa 9071096 — 96 mm / chrome and gold look',status:'drilling',
    model:'hettich-9071096',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    note:'Manufacturer CAD: 140 × 9 mm, 28 mm projection, 96 mm fixing centres and 9 mm blind fixing depth. Verify Ø5.5 mm panel clearance and screw length against the supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':96,'hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9071003',category:'handles',label:'Hettich Salvia 9071003 — 96 mm / stainless steel',status:'drilling',
    model:'hettich-9071003',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/at_EN/ProDecor-handle-collection/NEW-MODERN-style-world/Bar-handle-Salvia%2C-drill-hole-spacing-96-mm%2C-L-157-mm%2C-H-35-mm%2C-%C3%B8-12-mm%2C-brushed-stainless-steel/p/9071003',
    note:'Manufacturer CAD: 157 × 12 mm, projection 35 mm. Two fixing axes at 96 mm centres. Verify the Ø5 mm clearance and screw engagement against the supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':96,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071005',category:'handles',label:'Hettich Salvia 9071005 — 128 mm / stainless steel',status:'drilling',
    model:'hettich-9071005',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071005',
    note:'Manufacturer CAD: 188 × 12 mm, projection 35 mm. Two fixing axes at 128 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':128,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071008',category:'handles',label:'Hettich Salvia 9071008 — 160 mm / stainless steel',status:'drilling',
    model:'hettich-9071008',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071008',
    note:'Manufacturer CAD: 220 × 12 mm, projection 35 mm. Two fixing axes at 160 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':160,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071009',category:'handles',label:'Hettich Salvia 9071009 — 192 mm / stainless steel',status:'drilling',
    model:'hettich-9071009',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071009',
    note:'Manufacturer CAD: 252 × 12 mm, projection 35 mm. Two fixing axes at 192 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':192,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071012',category:'handles',label:'Hettich Salvia 9071012 — 224 mm / stainless steel',status:'drilling',
    model:'hettich-9071012',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071012',
    note:'Manufacturer CAD: 284 × 12 mm, projection 35 mm. Two fixing axes at 224 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':224,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071017',category:'handles',label:'Hettich Salvia 9071017 — 256 mm / stainless steel',status:'drilling',
    model:'hettich-9071017',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071017',
    note:'Manufacturer CAD: 316 × 12 mm, projection 35 mm. Two fixing axes at 256 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':256,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071020',category:'handles',label:'Hettich Salvia 9071020 — 288 mm / stainless steel',status:'drilling',
    model:'hettich-9071020',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071020',
    note:'Manufacturer CAD: 348 × 12 mm, projection 35 mm. Two fixing axes at 288 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':288,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071021',category:'handles',label:'Hettich Salvia 9071021 — 320 mm / stainless steel',status:'drilling',
    model:'hettich-9071021',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071021',
    note:'Manufacturer CAD: 380 × 12 mm, projection 35 mm. Two fixing axes at 320 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':320,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071023',category:'handles',label:'Hettich Salvia 9071023 — 352 mm / stainless steel',status:'drilling',
    model:'hettich-9071023',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071023',
    note:'Manufacturer CAD: 412 × 12 mm, projection 35 mm. Two fixing axes at 352 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':352,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071024',category:'handles',label:'Hettich Salvia 9071024 — 384 mm / stainless steel',status:'drilling',
    model:'hettich-9071024',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071024',
    note:'Manufacturer CAD: 444 × 12 mm, projection 35 mm. Two fixing axes at 384 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':384,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071026',category:'handles',label:'Hettich Salvia 9071026 — 448 mm / stainless steel',status:'drilling',
    model:'hettich-9071026',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071026',
    note:'Manufacturer CAD: 508 × 12 mm, projection 35 mm. Two fixing axes at 448 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':448,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071027',category:'handles',label:'Hettich Salvia 9071027 — 480 mm / stainless steel',status:'drilling',
    model:'hettich-9071027',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071027',
    note:'Manufacturer CAD: 540 × 12 mm, projection 35 mm. Two fixing axes at 480 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':480,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071030',category:'handles',label:'Hettich Salvia 9071030 — 640 mm / stainless steel',status:'drilling',
    model:'hettich-9071030',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071030',
    note:'Manufacturer CAD: 700 × 12 mm, projection 35 mm. Two fixing axes at 640 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':640,'hardware.handleHoleDiameter':5} },
  { id:'handle-hettich-9071038',category:'handles',label:'Hettich Salvia 9071038 — 736 mm / stainless steel',status:'drilling',
    model:'hettich-9071038',cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:'https://shop.hettich.com/us_EN/p/9071038',
    note:'Manufacturer CAD: 796 × 12 mm, projection 35 mm. Two fixing axes at 736 mm centres. Verify Ø5 mm clearance and screw engagement against supplied fixings.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':736,'hardware.handleHoleDiameter':5} },
  ...[[9070967,96,10],[9070972,128,10],[9070978,160,10],
    [9070982,192,10],[9070984,224,10],[9070988,256,10],[9070991,288,10],[9070993,320,10],[9070996,352,10],[9070999,384,10],
    [9071045,96],[9071046,128],[9071048,160],[9071050,192],[9071051,224],[9071052,256],[9071053,288],[9071054,320],[9071055,352],[9071056,384],[9071058,448],[9071111,480],[9071112,640],[9071115,736]].map(([sku,spacing,diameter=14]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Salvia ${sku} — ${spacing} mm centres / Ø${diameter} mm bar`,status:'drilling',
    model:`hettich-${sku}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:`https://shop.hettich.com/be_EN/p/${sku}`,
    note:'Two fixing axes. Check Ø5 mm panel clearance and screw engagement on the supplied pull.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5} })),
  { id:'handle-hettich-9069799',category:'handles',label:'Hettich Albona 9069799 — 684 mm / anodised aluminium',status:'drilling',
    model:'hettich-9069799',keepWithinFront:true,source:'https://www.hettich.com/fileadmin/Hettich_International/Planning/CAD-Files/Informationsblatt_Hettich_ProDecor_Griffkollektion_070322_V1.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'744 mm overall length, 35 mm projection and two fixing axes 684 mm apart. Check screw engagement on the supplied pull.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':684,'hardware.handleHoleDiameter':5.5} },
  { id:'handle-hettich-9070269',category:'handles',label:'Hettich Albona 9070269 — 2 × 540 mm / anodised aluminium',status:'drilling',
    model:'hettich-9070269',keepWithinFront:true,source:'https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf',
    cadSource:'https://www.hettich.com/en-de/services/hettich-cad/cad-downloads',
    note:'1140 mm overall length, 35 mm projection and three fixing axes at 540 mm pitch. Check screw engagement on the supplied pull.',
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':1080,'hardware.handleHoleDiameter':5.5} },
  ...[[9071041,480,12],[9071042,640,12],[9071043,720,12],[9071116,480,14],[9071118,640,14],[9071120,720,14]].map(([sku,pitch,diameter]) => ({
    id:`handle-hettich-${sku}`,category:'handles',label:`Hettich Salvia ${sku} — 2 × ${pitch} mm / Ø${diameter} mm bar`,status:'drilling',
    model:`hettich-${sku}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',keepWithinFront:true,
    source:`https://shop.hettich.com/de_EN/p/${sku}`,
    threadDepth:8,
    note:`Three fixing axes at ${pitch} mm pitch. The spacing field shows the ${pitch*2} mm outer span. Check Ø5 mm panel clearance and screw engagement on the supplied pull.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':pitch*2,'hardware.handleHoleDiameter':5} })),
  { id: 'handle-hettich-1160018', category: 'handles', label: 'Hettich Anzio 1160018 — 128 mm / stainless steel', status: 'drilling',
    model: 'hettich-1160018', cadSource: 'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source: 'https://shop.hettich.com/us_EN/ProDecor-handle-collection/NEW-MODERN-style-world/Handle-Anzio%2C-drill-hole-spacing-128-mm%2C-L-138-mm%2C-W-10-mm%2C-H-32-mm%2C-brushed-stainless-steel/p/1160018',
    note: 'Manufacturer CAD in the 3D view: 138 × 10 mm, projection 32 mm. Two fixing axes at 128 mm centres; Ø5 mm panel clearance for M4 fixings. Handle thread depth 10 mm; select screw length for panel thickness. Physical fit not yet tested.',
    values: { 'hardware.handleType': 'pull', 'hardware.handleHoleSpacing': 128, 'hardware.handleHoleDiameter': 5 } },
  ...[[1160019,160],[1160020,224],[1160021,288],[1160022,352],[1160023,480],[1160024,608],[1160025,736]].map(([part,spacing])=>({
    id:`handle-hettich-${part}`,category:'handles',label:`Hettich Anzio ${part} — ${spacing} mm / stainless steel`,status:'drilling',
    model:`hettich-${part}`,cadSource:'https://www.hettich.com/en-no/services/hettich-cad/cad-downloads',
    source:'https://www.hettich.com/fileadmin/Hettich_International/Planning/imos/Informationsblatt_Hettich_ProDecor_Griffkollektion.pdf',
    note:`Manufacturer CAD: ${spacing+10} × 10 × 32 mm, fixing centres ${spacing} mm. Ø5 mm clearance for M4 fixings; select screws for panel thickness. Physical fit untested.`,
    values:{'hardware.handleType':'pull','hardware.handleHoleSpacing':spacing,'hardware.handleHoleDiameter':5} })),
  ...[76.2, 96, 101.6, 128, 160, 192, 224, 256, 320].map(spacing => ({
    id: `pull-${spacing}`, category: 'handles', label: `Pull — ${spacing === 76.2 ? '3 in (76.2 mm)' : spacing === 101.6 ? '4 in (101.6 mm)' : `${spacing} mm`} centres`,
    status: 'drilling', source: sources.pulls, note: 'Centre spacing preset, not a specific pull model. Use the measured centres; nominal inch equivalents can be rounded in catalogues.',
    values: { 'hardware.handleType': 'pull', 'hardware.handleHoleSpacing': spacing, 'hardware.handleHoleDiameter': 5 },
  })),
  { id:'runner-hettich-quadro-5d',category:'runners',label:'Hettich Quadro 5D V6 — Silent System preparation',status:'drilling',
    source:'https://shop.hettich.com/us_EN/p/9374901',
    note:'Frameless overlay drawers with 13 or 16 mm sides. Exact inch box lengths and 5D mounting row. Fit the matching clips by hand. Preview travel uses the drawer box length.',
    values:{'hardware.runnerMode':'hettich-quadro-5d','hardware.runnerLength':457,'hardware.runnerPilotDiameter':3,'hardware.runnerPilotDepth':8},
    lengths:Object.keys(QUADRO_5D).map(Number)},
  { id:'runner-richelieu-828',category:'runners',label:'Richelieu 828 — box cuts / manual fitting',status:'fit',
    source:'https://modersy.ca/wp-content/uploads/2024/10/doc4.pdf#page=22',
    note:'Frameless overlay drawers. Includes the box and 37 × 12.7 mm rear notches. Verify the supplied runners and drill the cabinet, rear hooks and locking devices by hand.',
    values:{'hardware.runnerMode':'richelieu-828','hardware.runnerLength':450},lengths:Object.keys(RICHELIEU_828).map(Number) },
  { id:'runner-hettich-quadro-2d',category:'runners',label:'Hettich Quadro 2D V6 — January 2025 preparation',status:'drilling',
    source:'https://woodworkinstitute.com/wp-content/uploads/2025/02/Quadro-IW21-0125-930894300.pdf#page=23',
    note:'Frameless overlay drawers with 13 or 16 mm sides. Verify the 2025 mounting row against the supplied rail. Fit the matching clips by hand. Preview travel uses the drawer box length.',
    values:{'hardware.runnerMode':'hettich-quadro-2d','hardware.runnerLength':457,'hardware.runnerPilotDiameter':3,'hardware.runnerPilotDepth':8},
    lengths:Object.keys(QUADRO_2D).map(Number)},
  { id:'runner-blum-563h',category:'runners',label:'Blum TANDEM 563H — box + rear-hook preparation',status:'drilling',
    cadSource:'https://3dwarehouse.sketchup.com/catalog/a7c3a01e-6ba3-4b3b-8d19-85eac8da8314/section/8fda4e83-a008-4acf-93bc-953a7d078c40/TANDEM',
    source:'https://d2.blum.com/services/BEC003/tdm563h_ma_dok_bus_%24sen-us_%24aof_%24v4.pdf',
    note:'Frameless drawer sides from 15/32 inch to 16 mm. Inside box width = opening minus 42 mm; bottom recess 13 mm; rear hook bores Ø6 × 10 mm. Includes inner front, raised back and cabinet pilot centres (Ø3 × 8 mm starting pilots; verify screws/stock). Angled locking-device pilots require the Blum template. Hardware CAD and physical fit remain pending.',
    values:{'hardware.runnerMode':'blum-tandem-563h','hardware.runnerLength':457,'hardware.runnerPilotDiameter':3,'hardware.runnerPilotDepth':8},lengths:[229,305,381,457,533]},
  { id:'runner-blum-563f',category:'runners',label:'Blum TANDEM 563F — 5/8″–3/4″ drawer sides',status:'drilling',
    cadSource:'https://3dwarehouse.sketchup.com/catalog/a7c3a01e-6ba3-4b3b-8d19-85eac8da8314/section/8fda4e83-a008-4acf-93bc-953a7d078c40/TANDEM',
    source:'https://www.blum.com/file/tdm563f_ma_dok_bus?country=us&language=en',
    note:'Frameless drawers with 5/8 to 3/4 inch sides (15.875–19.05 mm). Inside width = opening minus 49 mm. Includes recessed bottom, rear-hook bores and cabinet pilot centres. Use the Blum template for angled locking-device pilots. Runner CAD and physical fitting remain pending.',
    values:{'hardware.runnerMode':'blum-tandem-563f','hardware.runnerLength':457,'hardware.runnerPilotDiameter':3,'hardware.runnerPilotDepth':8},lengths:[229,305,381,457,533]},
  { id:'runner-blum-763h',category:'runners',label:'Blum MOVENTO 763H — box + rear-hook preparation',status:'drilling',
    cadSource:'https://3dwarehouse.sketchup.com/catalog/a7c3a01e-6ba3-4b3b-8d19-85eac8da8314/section/71da752d-62a7-448f-8277-982c5c420667/MOVENTO',
    source:'https://d2.blum.com/services/BEC003/movento_ep_dok_bus_%24sen-us_%24aof_%24v7.pdf',
    note:'BLUMOTION soft-close, frameless. Inside width = opening minus 42 mm; bottom clearance 16 mm, top clearance 7 mm; rear hook bores Ø6 × 10 mm. Uses T51.7601L/R locks. Local lock CAD previews are available for fronts over 13 mm. Thinner inner fronts use T59.K010M spacers in the BOM. Cabinet starter pilots Ø3 × 8 mm. Fit lock pilots with the Blum template. Runner and spacer CAD, TIP-ON and physical fit remain pending.',
    values:{'hardware.runnerMode':'blum-movento-763h','hardware.runnerLength':457,'hardware.runnerPilotDiameter':3,'hardware.runnerPilotDepth':8},lengths:[305,381,457,533]},
  { id: 'runner-3832e', category: 'runners', label: 'Accuride 3832E — side mount + pilot centres', status: 'drilling', source: sources.accuride,
    cadSource: 'https://ws.3dexchange.net/ACCURIDE/catalog/65989/57832',
    note: 'All 250–700 mm lengths use exact manufacturer CAD and separate rail movement. 12.7 mm side space (+0.8 / −0). Pilots checked against the supplied STEP openings; 250/300 mm patterns differ from the older family drawing, and 450/550 mm omit its unsupported 259 mm pilot. Verify your supplied slide before machining, especially clones. Face frames need blocking or rear brackets.',
    values: { 'hardware.runnerMode': 'side-mount', 'drawers.sideClearance': 12.7, 'hardware.runnerLength': 500, 'hardware.runnerPattern': 'accuride-3832e', 'hardware.runnerPilotDiameter': 3, 'hardware.runnerPilotDepth': 8, 'hardware.runnerHoleHeight': 31.8 },
    lengths: [250, 300, 350, 400, 450, 500, 550, 600, 650, 700] },
  { id: 'outside-screws', category: 'joinery', label: 'Outside screws', status: 'drilling',
    note: 'Through-clearance holes from the exterior side faces. Drill mating pilots and any countersinks manually. A cap top sits above the sides and needs a separate fixing.',
    values: { 'hardware.joineryType': 'outside-screws', 'hardware.screwClearance': 5 } },
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
  const next = preset.pairedPreset ? applyHardwarePreset(config, preset.pairedPreset) : structuredClone(config);
  next.hardware ||= {};
  next.hardware.library = { ...next.hardware.library, [preset.category]: id };
  for (const [path, value] of Object.entries(preset.values)) {
    const [group, key] = path.split('.');
    next[group] ||= {};
    next[group][key] = value;
  }
  if (id === 'runner-3832e') delete next.hardware.runnerSetback;
  if (id === 'runner-hettich-quadro-2d') next.hardware.quadroManualMiddle ??= true;
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
  if (!drawers && config.doors?.count > 0 && config.overlay?.type === 'inset') {
    const selected = selectedHardware(config);
    if (!selected.some(p => p.blumInset || p.thinOverlay==='inset' || ['cup-blum-inset','hinge-hettich-9071207','hinge-hettich-9071207-a5','hinge-hettich-9090280-b4'].includes(p.id))) {
      warnings.push('Inset doors require fully cranked hinges. Use an inset hinge and matching mounting plate. Verify setback and trial fit.');
    }
  }
  if (!drawers && ['blum-inset','hettich-sensys-inset'].includes(hw.hingePlatePattern) && config.overlay?.type !== 'inset') warnings.push('The inset mounting plate pattern is selected for overlay doors; choose the matching overlay plate pattern.');
  if (!drawers && config.doors?.count > 0 && config.overlay?.type !== 'inset' && selectedHardware(config).some(p => p.id === 'cup-blum-inset')) {
    warnings.push('Blum 71B3750 requires inset doors. Cup and plate bores omitted; choose a matching overlay hinge and plate.');
  }
  if (!drawers && (['plate-37-32','plate-blum-173h7100','plate-hettich-9071575','plate-hettich-9071576','plate-hettich-9071576-a2'].includes(hw.library?.hingePlate) || ['blum-inset','hettich-sensys-inset'].includes(hw.hingePlatePattern)) && config.construction !== 'frameless') warnings.push('The selected 37/32 plate preset requires a frameless carcass; plate bores omitted. Use the actual face-frame hinge drawing.');
  if (!drawers && (config.shelves?.count ?? 0) > 0) {
    if (!(hw.shelfPinSpacing > 0) || config.height / hw.shelfPinSpacing >= 10000) warnings.push('Shelf pin pitch must be positive and produce fewer than 10000 rows; pin bores omitted.');
    if (!(hw.shelfPinDepth > 0 && hw.shelfPinDepth <= config.materials.caseThickness - 2) && hw.shelfPinDepth != null) warnings.push('Shelf pin depth must leave at least 2mm of material; pin bores omitted.');
  }
  if (drawers && hw.runnerMode === 'side-mount') {
    const depth = config.depth - (config.overlay.type === 'inset' ? 0 : config.materials.doorThickness)
      - rearInset(config) - frontLayout(config).boxFront;
    if (!(hw.runnerLength > 0 && hw.runnerLength + Math.max(3.2, runnerSettings(config).setback - frontLayout(config).boxFront) <= depth)) warnings.push('Selected runner is too long for the available cabinet depth; drawer boxes omitted.');
    if (!(hw.runnerPattern === 'custom' ? config.drawers.sideClearance >= 0 : config.drawers.sideClearance >= 12.7 && config.drawers.sideClearance <= 13.5)) warnings.push('Accuride 3832E side space must be 12.7–13.5mm per side; drawer boxes omitted.');
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
  const hinge = hardwarePreset(hw.library?.hingeCup);
  if (hinge?.pairedPreset) {
    const thin = hinge.thinOverlay;
    const screw = thin && thinHingeScrew(config);
    const matched = thin ? panels.flatMap(p => p.hardwareModels || []).filter(p => p.model === hinge.model).length
      : count('hinge-cup-fixing') / 2;
    if (matched) {
      rows.push({item:`${label('hingeCup')} + ${label('hingePlate')}`, quantity:matched, unit:'hinge / plate sets',
        note:thin && !screw ? 'Door fixing pilots are manual. Follow Hettich’s thin-door instructions.' : 'Cup fixing screws and plate height must match actual hinge.'});
      if (screw) rows.push({item:`Hettich ${screw.sku}`,quantity:count('hinge-cup-fixing'),unit:'hinge cup screws',
        note:`Ø${screw.diameter} × ${screw.depth} mm pilots. Verify screw engagement in the actual front stock.`});
      if (hinge.thinCase) rows.push({item:'Hettich 9238321',quantity:matched*2,unit:'hinge plate screws',
        note:'Ø5 × 8 mm pilots. Trial-fit in the actual cabinet side.'});
      if (hinge.limiter) rows.push({item:`Hettich ${hinge.limiter}`,quantity:matched,unit:'hinge opening limiters',
        note:`Fit one per hinge in the ${hinge.angle}° position.`});
      if (hinge.blumStop) rows.push({item:'Blum 70T3553',quantity:matched,unit:'hinge opening limiters',
        note:'Fit one 86° stop per hinge with the hinge closed and the door unclipped.'});
      if (hw.library.hingePlate === 'plate-blum-173h7100') {
        rows.push({item:'Blum 609.1500 or 609.1700',quantity:matched*2,unit:'hinge cup screws',
          note:'Ø3.5 × 15 or 17 mm for wood doors. Verify length and pilot in actual stock.'});
        rows.push({item:'#6 × 5/8-inch wood screws',quantity:matched*2,unit:'hinge plate screws',
          note:'Two per 173H7100 plate. Verify engagement and pilot in actual stock.'});
      }
    }
    if (hingeCount > matched) rows.push({item:'Custom / existing', quantity:hingeCount-matched, unit:'hinge / plate sets',
      note:'Cup bores without matched fixing pilots. Verify hinge, plate and drilling before ordering.'});
  } else if (hingeCount) rows.push({ item: label('hingePlate'), quantity: hingeCount, unit: 'hinge / plate sets', note: 'Cup fixing screws and plate height must match actual hinge.' });
  const fronts = panels.filter(p => p.type === 'door' || p.type === 'drawer');
  const handles = fronts.filter(p => p.holes.some(h => h.purpose === 'handle')).length;
  if (handles) {
    const handle = selectedHardware(config).find(p => p.category === 'handles');
    rows.push({ item: handle?.label || 'Custom / existing', quantity: handles,
      unit: hw.handleType === 'knob' && !hardwarePreset(hw.library?.handles)?.roundRecessDepth ? 'knobs' : 'pulls',
      ...(handle?.threadDepth ? {note:`Manufacturer thread depth ${handle.threadDepth} mm. Check screw engagement in the actual front stock.`} : {}) });
  }
  const shelves = panels.filter(p => p.type === 'shelf').length;
  if (shelves && count('shelf-pin')) rows.push({ item: label('shelfPins'), quantity: shelves * 4, unit: 'shelf pins' });
  const drawers = panels.filter(p => /(?:^|__)drawer-\d+-side-left$/.test(p.id)).length;
  const movento=hw.runnerMode==='blum-movento-763h';
  const thickTandem=hw.runnerMode==='blum-tandem-563f';
  const blumTable=movento?MOVENTO_763H:thickTandem?TANDEM_563F:hw.runnerMode==='blum-tandem-563h'?TANDEM_563H:null;
  const quadro5d=hw.runnerMode==='hettich-quadro-5d';
  const quadro=quadro5d || hw.runnerMode==='hettich-quadro-2d';
  const richelieu=hw.runnerMode==='richelieu-828';
  if(drawers && richelieu && RICHELIEU_828[hw.runnerLength]) {
    rows.push({item:`Richelieu ${RICHELIEU_828[hw.runnerLength].part}`,quantity:drawers,unit:'runner pairs',note:'Check the supplied cabinet mounting row and rear-hook bore diameter before drilling.'});
    rows.push({item:'Richelieu 8284102 + 8284103',quantity:drawers,unit:'locking-device pairs',note:'Four-way locks. Fit by hand using the manufacturer drawing.'});
  }
  if(drawers && quadro) {
    rows.push({item:`Hettich Quadro ${quadro5d?'5D':'2D'} V6 ${(quadro5d?QUADRO_5D:QUADRO_2D)[hw.runnerLength]?.part}`,quantity:drawers,unit:'runner pairs',
      note:quadro5d?'Silent System 5D. Verify physical fit and rear adjustment.'
        :hw.quadroManualMiddle===true?'Middle pilot omitted. Transfer the middle fixing from the supplied rail.'
          :'CAD-checked pilot pattern. The installation sheet shows a different middle fixing. Verify against the supplied rail.'});
    const thinSide=config.drawers.sideThickness<=13;
    const screwLength=thinSide?'3/4':'5/8';
    rows.push({item:thinSide?'Hettich 9306539':'Hettich 9306540',quantity:drawers,unit:'locking-device pairs',
      note:`${thinSide?'13':'16'} mm top-mount clips. Fit by hand with two #6 × ${screwLength}-inch flat-head screws per clip.`});
    rows.push({item:`#6 × ${screwLength}-inch flat-head screws`,quantity:drawers*4,unit:'locking-device screws',
      note:'Two per Quadro top-mount clip. Check screw engagement in the actual front stock.'});
  }
  if (drawers && !quadro && !richelieu) rows.push({ item: blumTable ? `Blum ${blumTable[hw.runnerLength]?.part || 'runner (verify length)'}` : label('runners'), quantity: drawers, unit: 'runner pairs', note: hw.runnerMode === 'side-mount' ? `Length ${hw.runnerLength} mm; pilot centres supplied; verify against the slide before drilling.` : blumTable ? `${movento?'MOVENTO 763H':thickTandem?'TANDEM 563F':'TANDEM 563H'} for ${hw.runnerLength} mm drawer; verify cabinet pilots against supplied runners.` : 'Existing reference holes are not a manufacturer mounting pattern.' });
  if(drawers && (thickTandem || hw.runnerMode==='blum-tandem-563h')) rows.push({item:'Blum T51.1901L + T51.1901R',quantity:drawers,unit:'locking-device pairs',note:'Use T65.1600.01 template for 75° Ø2.5 mm pilots; manual preparation, not included in CNC face drilling. Verify screws for stock.'});
  if(drawers && movento) {
    const thinFront=config.drawers.sideThickness<=13;
    rows.push({item:'Blum T51.7601L + T51.7601R',quantity:drawers,unit:'locking-device pairs',note:'MOVENTO only; TANDEM locks do not interchange. Use T65.1600.01 template for 75° Ø2.5 × 10 mm pilots; not included in CNC face drilling.'});
    if(thinFront) rows.push({item:'Blum T59.K010M',quantity:drawers*2,unit:'locking-device spacers',note:'One per locking device on 12/13 mm inner fronts. Setbacks assume spacers are fitted.'});
  }
  if(drawers && blumTable) {
    const railScrews = count(movento?'movento-runner-mount':'tandem-runner-mount');
    if (railScrews) rows.push({item:'Blum 606N or 606P',quantity:railScrews,unit:'runner mounting screws',
      note:'One #6 wood screw per cabinet pilot. Verify the supplied rails and cabinet stock before drilling.'});
    const spacerScrews = movento && config.drawers.sideThickness<=13;
    rows.push({item:spacerScrews?'Blum 6064N':'Blum 606N or 606P',
      quantity:drawers*4,unit:'locking-device screws',
      note:`Two ${spacerScrews?'#6 × 19 mm #2 Phillips':'#6 × 16 mm'} screws per locking device. Verify screw engagement in the actual stock.`});
  }
  const screws = count('outside-screw');
  if (screws) rows.push({ item: 'Carcass assembly screws', quantity: screws, unit: 'screws', note: 'Choose fasteners and mating pilots for the stock.' });
  const dowels = panels.reduce((n, p) => n + (p.edgeBores || []).filter(h => h.purpose === 'alignment-dowel').length, 0);
  const cams = count('cam-housing');
  const cabineos = count('cabineo-pilot');
  if (cabineos) rows.push({ item:`Lamello ${hw.joineryType === 'cabineo-8' ? 'Cabineo 8' : 'Cabineo 12'} (surface mounted)`, quantity:cabineos, unit:'connectors' });
  if (cams) rows.push({ item: 'Hettich Rastex 15 cam 13957 + Twister DU 232 T bolt 9047861', quantity: cams, unit: 'cam / bolt sets' });
  if (dowels) rows.push({ item: `Dowel ${hw.dowelDiameter} × ${hw.dowelLength} mm`, quantity: dowels, unit: 'dowels' });
  return rows;
}
