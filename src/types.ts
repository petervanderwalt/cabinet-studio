export type Category = 'base' | 'wall' | 'tall' | 'wardrobe';
export type FrontMode = 'doors' | 'drawers' | 'sliding' | 'open';
export type Usage = 'kitchen' | 'bedroom' | 'bathroom' | 'laundry' | 'office' | 'living';
export type HandleType = 'bar' | 'knob' | 'edge-pull' | 'finger-pull' | 'push-open' | 'none';
export type HingeType = 'standard' | 'soft-close' | 'push-open';
export type SlideType = 'standard' | 'soft-close' | 'push-open';
export type PushOpenType = 'magnetic-latch' | 'mechanical-latch' | 'tip-on' | 'servo-drive';
export type MaterialGroup = 'shelves' | 'drawerBox' | 'drawerFront' | 'plinth' | 'divider' | 'sliding';
export type WardrobeLayout = 'single' | 'corner' | 'walk-in';
export type WardrobeFronts = 'hinged' | 'sliding' | 'open';

export interface WardrobeSection {
  /** Interior width in mm; 0 shares the remaining width equally. */
  width: number;
  rails: number;
  shelves: number;
  drawers: number;
}

export interface WardrobeLeg {
  enabled: boolean;
  length: number;
  sections: WardrobeSection[];
}

export interface WardrobeConfig {
  layout: WardrobeLayout;
  fronts: WardrobeFronts;
  sections: WardrobeSection[];
  legB: WardrobeLeg;
  legC: WardrobeLeg;
  hangingHeight: number;
  halfHangHeight: number;
  railDrop: number;
  railDiameter: number;
  drawerHeight: number;
  sliding: {
    doorCount: number;
    overlap: number;
    track: 'top-hung' | 'bottom-rolling';
    topTrack: number;
    bottomTrack: number;
    softClose: boolean;
  };
}

export interface LightingConfig {
  enabled: boolean;
  type: 'led-strip' | 'led-profile' | 'puck';
  colourTemp: '2700K' | '3000K' | '4000K' | 'RGB';
  voltage: 12 | 24;
  wattsPerMetre: number;
  zones: {
    underside: boolean;
    interiorTop: boolean;
    shelfEdges: boolean;
    sides: boolean;
    rail: boolean;
    toeKick: boolean;
    drawers: boolean;
  };
  channel: { width: number; depth: number; setback: number };
  driver: 'top-rear' | 'side' | 'plinth' | 'external';
  cableHoleDiameter: number;
  control: 'switch' | 'door-sensor' | 'drawer-switch' | 'pir' | 'touch' | 'none';
}

export interface ElectricsConfig {
  drawerSwitch: {
    enabled: boolean;
    type: 'magnetic-reed' | 'plunger';
    drawers: 'all' | 'top' | 'bottom';
    boreDiameter: number;
    offsetFromFront: number;
  };
  doorSwitch: { enabled: boolean; type: 'plunger' | 'magnetic-reed'; boreDiameter: number };
  wiring: 'rear-grommet' | 'top-grommet' | 'side-grommet';
}
export type HingeSide = 'left' | 'right' | 'both';

export interface Materials {
  caseMaterial: string;
  caseThickness: number;
  shelfMaterial: string;
  backThickness: number;
  backMaterial: string;
  frontMaterial: string;
  doorMaterial: string;
  drawerFrontMaterial: string;
  drawerFrontThickness: number;
  drawerBoxMaterial: string;
  shelfThickness: number;
  plinthMaterial: string;
  plinthThickness: number;
  dividerMaterial: string;
  dividerThickness: number;
  slidingDoorMaterial: string;
  slidingDoorThickness: number;
  overrides: Partial<Record<MaterialGroup, string>>;
  mirrorType: string;
  edgeBand: { colour: 'match' | 'white' | 'black' | 'oak' | 'grey'; thickness: number };
  doorThickness: number;
  faceFrameStock: number;
  faceFrameWidth: number;
  topRailWidth: number;
  bottomRailWidth: number;
}

export interface Hardware {
  hingeBoreDiameter: number;
  hingeBoreInset: number;
  shelfPinSpacing: number;
  shelfPinSetback: number;
  hingePlateFrontHoleOffset: number;
  hingePlateRearHoleOffset: number;
  hingePlateHoleSpacing: number;
  handleHoleSpacing: number;
  handleEdgeOffset: number;
  doorHandleHeight: number;
  drawerHandleTopOffset: number;
  hinge: {
    /** 'generic' uses the bore settings above; a catalogued fitting overrides them with its published drilling. */
    fitting: 'generic' | 'blum-clip-top-110';
    boss: 'screw-on' | 'inserta' | 'knock-in';
    plate: 'generic' | 'cruciform-37-32';
    plateFixing: 'screw' | 'inserta' | 'expando';
    plateSpacing: 0 | 3;
    /** Distance from the door edge to the edge of the cup (Blum "TB", 3-7mm). */
    edgeDistance: number;
  };
  handleType: HandleType;
  pushOpen: { type: PushOpenType; boreDiameter: number; edgeOffset: number };
}

export interface NestingSettings {
  sheetWidth: number;
  sheetHeight: number;
  gap: number;
  allowRotation: boolean;
}

export interface CabinetConfig {
  id: string;
  category: Category;
  usage: Usage;
  front: { mode: FrontMode };
  construction: 'frameless' | 'face-frame';
  width: number;
  height: number;
  depth: number;
  hasTop: boolean;
  backMount: 'grooved-in' | 'applied-rear';
  toeKick: { height: number; setback: number; enabled: boolean | null; style: 'recessed' | 'flush'; feet: number };
  doors: {
    count: number;
    hingeSide: HingeSide;
    hingeType: HingeType;
    /** 0 picks the count from the door height. */
    hingesPerDoor: number;
    openAngle: number;
    mirror: 'none' | 'first' | 'last' | 'all';
  };
  drawers: {
    count: number;
    heights: number[];
    sideClearance: number;
    sideThickness: number;
    bottomThickness: number;
    slideType: SlideType;
  };
  materials: Materials;
  shelves: { count: number; thickness: number | null; inset: number; fixed: boolean };
  interior: { rail: { enabled: boolean; drop: number } };
  jointing: 'cam-dowel' | 'confirmat' | 'dowel' | 'screw';
  considerations: {
    wallFixing: 'none' | 'anti-tip' | 'hanging-rail';
    ventilation: 'none' | 'back-slots';
    notes: string;
  };
  overlay: {
    type: 'full-overlay' | 'partial-overlay' | 'inset';
    amount: number;
    topReveal: number | null;
    bottomReveal: number | null;
    sideReveal: number | null;
  };
  reveal: number;
  hardware: Hardware;
  lighting: LightingConfig;
  electrics: ElectricsConfig;
  wardrobe: WardrobeConfig;
  /** Catalogue fittings chosen per slot; empty slots keep the generic hardware settings. */
  fittings: Partial<Record<FittingSlotKey, FittingChoiceConfig | null>>;
  nesting: NestingSettings;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  purpose?: string;
}

/** A catalogue fitting chosen for a slot (see src/fittings). */
export interface FittingChoiceConfig {
  familyId: string;
  variantId: string;
  selection: Record<string, string | number>;
  includeAccessories?: boolean;
}

export type FittingSlotKey = 'hinge' | 'hingePlate' | 'drawerSystem' | 'drawerMotion' | 'doorMotion' | 'lift' | 'divider' | 'pocket';

export interface Hole {
  x: number;
  y: number;
  diameter?: number;
  purpose?: string;
}

export interface Panel {
  id: string;
  name: string;
  type: string;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  posX: number;
  posY: number;
  posZ: number;
  cutWidth: number;
  cutHeight: number;
  cutThickness: number;
  materialLabel?: string;
  hingeSide?: 'left' | 'right';
  drawDepth?: number;
  holes?: Hole[];
  notches?: Rect[];
  grooves?: Rect[];
  edgeBanding?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
  /** Parts that are drawn in 3D (rails, LEDs) but never cut, nested or exported. */
  fabricate?: boolean;
  /** Skip hole markers in 3D (dividers, rotated legs). */
  noMarkers?: boolean;
  /** Which way the front of this part faces in world space; defaults to -Z. */
  frontDir?: { x: number; z: number };
  /** Set on parts of a rotated wardrobe leg: the rotation applied to the leg, in degrees. */
  legRotation?: number;
  /** Sliding door travel in world X when clicked. */
  slideDx?: number;
  /** Door opening angle in degrees. */
  openAngle?: number;
  hingeCount?: number;
  /** One-piece front that lifts up on a lift system instead of swinging on hinges. */
  liftFront?: boolean;
  mirrored?: boolean;
  /** Rail length etc. for non-fabricated hardware visuals. */
  railLength?: number;
  leg?: 'A' | 'B' | 'C';
  color?: number;
  sourceCabinetId?: string;
  sourceCabinetName?: string;
  sourceCopyIndex?: number;
}

export interface CabinetEntry {
  id: string;
  name: string;
  qty: number;
  config: CabinetConfig;
}

export interface Room {
  width: number;
  depth: number;
  height: number;
  wallCabinetBottom: number;
}

export interface Placement {
  instanceId: string;
  cabinetId: string;
  copyIndex: number;
  x: number;
  z: number;
  rotation: number;
}

export interface Project {
  version: number;
  name: string;
  activeCabinetId: string;
  cabinets: CabinetEntry[];
  layout: { room: Room; placements: Placement[] };
}

export interface CabinetInstance {
  instanceId: string;
  cabinetId: string;
  cabinetName: string;
  copyIndex: number;
  qty: number;
  label: string;
  config: CabinetConfig;
  placement: Placement;
}

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
}

export interface SheetPlacement {
  panel: Panel;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface Sheet {
  id: string;
  index: number;
  materialLabel?: string;
  thickness: number;
  sheetWidth: number;
  sheetHeight: number;
  usedArea: number;
  placements: SheetPlacement[];
  freeRects: Rect[];
}

export interface NestingGroup {
  key: string;
  title: string;
  thickness: number;
  sheets: Sheet[];
  partCount: number;
  totalPartArea: number;
  totalSheetArea: number;
  utilization: number;
}

export interface NestingPlan {
  options: NestingSettings & { kerf?: number };
  groups: NestingGroup[];
  unplaced: { panel: Panel; reason: string }[];
  totalSheets: number;
  totalPartArea: number;
  totalSheetArea: number;
  utilization: number;
}

export interface StockOption {
  label: string;
  thickness: number;
}

export interface SnapPreview {
  label: string;
  targetInstanceId: string | null;
  distance: number;
}
