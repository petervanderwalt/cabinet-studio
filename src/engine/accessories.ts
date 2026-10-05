// Lighting, switches, push-to-open, ventilation and hanging rails: extra drilling / routing on the
// generated panels, non-fabricated 3D visuals (LEDs), and the hardware bill of materials.
import type { CabinetConfig, Hole, Panel, Rect } from '../types';
import { resolveReveals, resolveToeKick } from './cabinet-math.js';
import { getFamily, getVariant, partsForChoice, SLOT_LABELS, type FittingSlot } from '../fittings/registry';
import { hingePart, platePart, TIP_ON_DOOR_SHORT, type HingeAction, type HingeApplication } from '../fittings/blum-hinges';

export interface HardwareItem {
  group: string;
  item: string;
  qty: number;
  unit: 'pcs' | 'm' | 'm²' | 'sets' | 'W';
  note?: string;
  /** Manufacturer part number when the item comes from a catalogued fitting. */
  partNo?: string;
}

const CARCASS_BOUNDARY = /^(?:leg[BC]-)?(?:side-(?:left|right)|divider-\d+)$/;

const isFabricated = (panel: Panel) => panel.fabricate !== false;
const holesOf = (panel: Panel): Hole[] => (panel.holes ??= []);
const groovesOf = (panel: Panel): Rect[] => (panel.grooves ??= []);

function bottomOf(panel: Panel): number {
  return panel.posY - panel.sizeY / 2;
}

/** Add a hole to a side/divider using world-ish coords: x = distance from the front, y = height from the floor. */
function addBoundaryHole(panel: Panel, hole: Hole): void {
  const y = hole.y - bottomOf(panel);
  const mirrored = /side-right$/.test(panel.id);
  holesOf(panel).push({ ...hole, y, x: mirrored ? panel.cutWidth - hole.x : hole.x });
}

function led(id: string, x: number, y: number, z: number, sx: number, sy: number, sz: number): Panel {
  return {
    id, name: 'LED', type: 'led', color: 0xfff1c2, materialLabel: 'LED',
    cutWidth: 0, cutHeight: 0, cutThickness: 0, posX: x, posY: y, posZ: z, sizeX: sx, sizeY: sy, sizeZ: sz,
    fabricate: false, noMarkers: true, holes: [], notches: [], grooves: [],
    edgeBanding: { top: false, bottom: false, left: false, right: false },
  };
}

/** Closest side/divider panel to world x on this part's leg. */
function nearestBoundary(panels: Panel[], x: number, leg: Panel['leg']): Panel | null {
  let best: Panel | null = null;
  let dist = Infinity;
  for (const panel of panels) {
    if (!CARCASS_BOUNDARY.test(panel.id) || panel.leg !== leg) continue;
    const d = Math.abs(panel.posX - x);
    if (d < dist) { dist = d; best = panel; }
  }
  return best;
}

export function applyAccessories(cfg: CabinetConfig, input: Panel[]): Panel[] {
  const panels = input;
  const extras: Panel[] = [];
  const reveals = resolveReveals(cfg);
  const tk = resolveToeKick(cfg);
  const mainPanels = panels.filter((p) => isFabricated(p));
  const byId = (id: string) => panels.find((p) => p.id === id);
  const lighting = cfg.lighting;
  const electrics = cfg.electrics;
  const hw = cfg.hardware;

  // ---- Generic hanging rail (non-wardrobe) ----
  if (cfg.category !== 'wardrobe' && cfg.interior?.rail?.enabled) {
    const left = byId('side-left');
    const right = byId('side-right');
    if (left && right) {
      const T = left.sizeX;
      const railY = cfg.height - T - (cfg.interior.rail.drop ?? 60);
      const length = cfg.width - 2 * T;
      const rail: Panel = {
        id: 'rail-1', name: 'Hanging rail', type: 'rail', color: 0xb9bfc8, materialLabel: 'Aluminium rail',
        cutWidth: length, cutHeight: 25, cutThickness: 25, posX: cfg.width / 2, posY: railY, posZ: left.sizeZ / 2,
        sizeX: length, sizeY: 25, sizeZ: 25, fabricate: false, noMarkers: true, railLength: length,
        holes: [], notches: [], grooves: [], edgeBanding: { top: false, bottom: false, left: false, right: false },
      };
      extras.push(rail);
      for (const side of [left, right]) {
        addBoundaryHole(side, { x: left.sizeZ / 2, y: railY - 16, diameter: 3, purpose: 'rail-bracket' });
        addBoundaryHole(side, { x: left.sizeZ / 2, y: railY + 16, diameter: 3, purpose: 'rail-bracket' });
      }
    }
  }

  // ---- Ventilation slots in the back ----
  if (cfg.considerations?.ventilation === 'back-slots') {
    for (const back of panels.filter((p) => p.type === 'back')) {
      const count = Math.max(1, Math.min(6, Math.floor((back.cutWidth - 100) / 200)));
      const slotW = 120;
      const slotH = 10;
      const pitch = (back.cutWidth - 2 * 60 - slotW) / Math.max(1, count - 1);
      for (const y of [60, back.cutHeight - 60 - slotH]) {
        for (let i = 0; i < count; i += 1) {
          groovesOf(back).push({ x: count === 1 ? (back.cutWidth - slotW) / 2 : 60 + i * pitch, y, width: slotW, height: slotH, purpose: 'vent-slot' });
        }
      }
    }
  }

  // ---- Lighting ----
  if (lighting?.enabled) {
    const { width: cw, depth: cd, setback } = lighting.channel;
    const zones = lighting.zones;
    const margin = 20;
    const topPanels = panels.filter((p) => /(^|-)top$/.test(p.id) || /stretcher-front$/.test(p.id));
    const bottomPanels = panels.filter((p) => /(^|-)bottom$/.test(p.id) && p.type === 'case');
    const cable = lighting.cableHoleDiameter;

    const frontGroove = (panel: Panel, y: number, purpose: string) => {
      const rect: Rect = { x: margin, y, width: Math.max(0, panel.cutWidth - 2 * margin), height: cw, purpose };
      groovesOf(panel).push(rect);
      return rect;
    };
    const plainWorld = (panel: Panel) => panel.legRotation === undefined;

    if (zones.underside) {
      for (const panel of bottomPanels) {
        const rect = frontGroove(panel, setback, 'led-channel-underside');
        if (plainWorld(panel)) {
          extras.push(led(`led-under-${panel.id}`, panel.posX, panel.posY - panel.sizeY / 2 - 1, panel.posZ - panel.sizeZ / 2 + rect.y + cw / 2, rect.width, 3, 10));
        }
      }
    }
    if (zones.interiorTop) {
      for (const panel of topPanels) {
        const rect = frontGroove(panel, setback, 'led-channel-top');
        if (plainWorld(panel)) {
          extras.push(led(`led-top-${panel.id}`, panel.posX, panel.posY - panel.sizeY / 2 - 1, panel.posZ - panel.sizeZ / 2 + rect.y + cw / 2, rect.width, 3, 10));
        }
      }
    }
    if (zones.rail) {
      for (const panel of topPanels.filter((p) => p.type === 'case')) {
        const rect: Rect = { x: margin, y: Math.max(0, panel.cutHeight / 2 - cw / 2), width: Math.max(0, panel.cutWidth - 2 * margin), height: cw, purpose: 'led-channel-rail' };
        groovesOf(panel).push(rect);
        if (plainWorld(panel)) {
          extras.push(led(`led-rail-${panel.id}`, panel.posX, panel.posY - panel.sizeY / 2 - 1, panel.posZ - panel.sizeZ / 2 + rect.y + cw / 2, rect.width, 3, 10));
        }
      }
    }
    if (zones.shelfEdges) {
      for (const panel of panels.filter((p) => p.type === 'shelf')) {
        const rect: Rect = { x: margin, y: 20, width: Math.max(0, panel.cutWidth - 2 * margin), height: cw, purpose: 'led-channel-shelf' };
        groovesOf(panel).push(rect);
        if (plainWorld(panel)) {
          extras.push(led(`led-${panel.id}`, panel.posX, panel.posY - panel.sizeY / 2 - 1, panel.posZ - panel.sizeZ / 2 + rect.y + cw / 2, rect.width, 3, 10));
        }
      }
    }
    if (zones.sides) {
      for (const panel of panels.filter((p) => CARCASS_BOUNDARY.test(p.id))) {
        const mirrored = /side-right$/.test(panel.id);
        const length = Math.max(0, panel.cutHeight - (panel.id.includes('side-') ? tk.height + 2 * panel.sizeX : 0) - 2 * margin);
        const x = mirrored ? panel.cutWidth - setback - cw : setback;
        const y = panel.id.includes('side-') ? tk.height + panel.sizeX + margin : margin;
        groovesOf(panel).push({ x, y, width: cw, height: length, purpose: 'led-channel-side' });
        if (plainWorld(panel) && length > 0) {
          const zWorld = panel.posZ - panel.sizeZ / 2 + setback + cw / 2;
          const yWorld = bottomOf(panel) + y + length / 2;
          const faces = panel.id.includes('divider') ? [-1, 1] : [/side-right$/.test(panel.id) ? -1 : 1];
          for (const face of faces) {
            extras.push(led(`led-side-${panel.id}-${face}`, panel.posX + face * (panel.sizeX / 2 + 1.5), yWorld, zWorld, 3, length, 10));
          }
        }
      }
    }
    if (zones.toeKick && tk.height > 0) {
      for (const panel of bottomPanels) {
        const rect: Rect = { x: margin, y: tk.setback + 10, width: Math.max(0, panel.cutWidth - 2 * margin), height: cw, purpose: 'led-channel-kick' };
        groovesOf(panel).push(rect);
        if (plainWorld(panel)) {
          extras.push(led(`led-kick-${panel.id}`, panel.posX, panel.posY - panel.sizeY / 2 - 1, panel.posZ - panel.sizeZ / 2 + rect.y + cw / 2, rect.width, 3, 10));
        }
      }
    }
    if (zones.drawers) {
      for (const panel of panels.filter((p) => p.type === 'drawer')) {
        groovesOf(panel).push({ x: margin, y: Math.max(0, panel.cutHeight - 40 - cw), width: Math.max(0, panel.cutWidth - 2 * margin), height: cw, purpose: 'led-channel-drawer' });
        if (plainWorld(panel)) {
          extras.push(led(`led-drawer-${panel.id}`, panel.posX, panel.posY + panel.sizeY / 2 - 40 - cw / 2, panel.posZ + panel.sizeZ / 2 + 3, Math.max(0, panel.cutWidth - 2 * margin), 10, 3));
        }
      }
    }

    // Cable route
    const wiring = electrics?.wiring ?? 'rear-grommet';
    const cableAt = (panel: Panel | undefined, x: number, y: number) => {
      if (panel) holesOf(panel).push({ x, y, diameter: cable, purpose: 'cable-hole' });
    };
    if (wiring === 'rear-grommet') {
      const back = panels.find((p) => p.type === 'back' && p.leg === 'A');
      if (back) cableAt(back, 60, back.cutHeight - 60);
      else cableAt(topPanels[0], 60, topPanels[0] ? topPanels[0].cutHeight - 40 : 0);
    } else if (wiring === 'top-grommet') {
      const top = topPanels[0];
      if (top) cableAt(top, 60, top.cutHeight - 40);
    } else {
      const side = byId('side-left');
      if (side) cableAt(side, side.cutWidth - 40, cfg.height - 60);
    }
    // Pass the cable through dividers so every section can be wired from one driver.
    for (const divider of panels.filter((p) => /divider-\d+$/.test(p.id))) {
      holesOf(divider).push({ x: divider.cutWidth - 40, y: divider.cutHeight - 40, diameter: cable, purpose: 'cable-hole' });
    }
  }

  // ---- Drawer switch (reed / plunger) ----
  const drawerFronts = panels.filter((p) => p.type === 'drawer');
  if (electrics?.drawerSwitch?.enabled && drawerFronts.length > 0) {
    const cfgSwitch = electrics.drawerSwitch;
    const sorted = [...drawerFronts].sort((a, b) => a.posY - b.posY);
    const picked = cfgSwitch.drawers === 'top' ? [sorted[sorted.length - 1]] : cfgSwitch.drawers === 'bottom' ? [sorted[0]] : sorted;
    for (const front of picked) {
      const boundaries = panels
        .filter((p) => CARCASS_BOUNDARY.test(p.id) && p.leg === front.leg)
        .sort((a, b) => a.posX - b.posX);
      const left = [...boundaries].reverse().find((p) => p.posX < front.posX);
      const right = boundaries.find((p) => p.posX > front.posX);
      for (const boundary of [left, right]) {
        if (boundary) addBoundaryHole(boundary, { x: cfgSwitch.offsetFromFront, y: front.posY, diameter: cfgSwitch.boreDiameter, purpose: 'drawer-switch' });
      }
      if (cfgSwitch.type === 'magnetic-reed') {
        const boxSide = panels.find((p) => p.id === `${front.id}-side-left`);
        if (boxSide) holesOf(boxSide).push({ x: cfgSwitch.offsetFromFront, y: boxSide.cutHeight / 2, diameter: 8, purpose: 'magnet-pocket' });
      }
    }
  }

  // ---- Door switch ----
  const doors = panels.filter((p) => p.type === 'door');
  if (electrics?.doorSwitch?.enabled && doors.length > 0) {
    const used = new Set<string>();
    for (const door of doors) {
      const closingX = door.hingeSide === 'left' ? door.posX + door.sizeX / 2 : door.posX - door.sizeX / 2;
      const boundary = nearestBoundary(panels, closingX, door.leg);
      if (boundary && !used.has(boundary.id)) {
        used.add(boundary.id);
        addBoundaryHole(boundary, { x: 14, y: door.posY + door.sizeY / 2 - 120, diameter: electrics.doorSwitch.boreDiameter, purpose: 'door-switch' });
      }
    }
  }

  // ---- Push-to-open ----
  if ((hw.handleType ?? 'bar') === 'push-open') {
    const push = hw.pushOpen;
    const latch = push.type === 'magnetic-latch' || push.type === 'mechanical-latch';
    if (latch) {
      const used = new Set<string>();
      for (const door of doors) {
        const closingX = door.hingeSide === 'left' ? door.posX + door.sizeX / 2 : door.posX - door.sizeX / 2;
        const boundary = nearestBoundary(panels, closingX, door.leg);
        if (boundary && !used.has(boundary.id)) {
          used.add(boundary.id);
          addBoundaryHole(boundary, { x: push.edgeOffset, y: door.posY, diameter: push.boreDiameter, purpose: 'push-latch' });
        }
      }
      for (const front of drawerFronts) {
        const back = panels.find((p) => p.id === `${front.id}-back`);
        if (back) holesOf(back).push({ x: back.cutWidth / 2, y: back.cutHeight / 2, diameter: push.boreDiameter, purpose: 'push-latch' });
      }
    } else if (push.type === 'servo-drive') {
      const side = byId('side-left') || panels.find((p) => CARCASS_BOUNDARY.test(p.id));
      if (side) addBoundaryHole(side, { x: side.cutWidth - 40, y: cfg.height - 80, diameter: cfg.lighting?.cableHoleDiameter ?? 12, purpose: 'cable-hole' });
    }
    if (reveals.gap < 3) {
      // surfaced in validation
    }
  }

  return [...panels, ...extras];
}

// ---------------------------------------------------------------------------------------------
// Bill of materials
// ---------------------------------------------------------------------------------------------

function grooveLength(rect: Rect): number {
  return Math.max(rect.width, rect.height);
}

const DRIVER_SIZES = [15, 30, 60, 100, 150, 240, 320];

function pick(items: HardwareItem[], group: string, item: string, qty: number, unit: HardwareItem['unit'] = 'pcs', note?: string, partNo?: string) {
  if (qty > 0) items.push({ group, item, qty: Math.round(qty * 100) / 100, unit, note, partNo });
}

export function buildHardwareList(cfg: CabinetConfig, panels: Panel[]): HardwareItem[] {
  const items: HardwareItem[] = [];
  const fab = panels.filter(isFabricated);
  const handleType = cfg.hardware.handleType ?? 'bar';
  const doors = panels.filter((p) => p.type === 'door');
  const slidingDoors = panels.filter((p) => p.type === 'sliding-door');
  const drawerFronts = panels.filter((p) => p.type === 'drawer');
  const rails = panels.filter((p) => p.type === 'rail');
  const dividerCount = panels.filter((p) => /divider-\d+$/.test(p.id)).length;
  const shelves = panels.filter((p) => p.type === 'shelf');
  const runs = new Set(panels.map((p) => p.leg ?? 'A')).size;

  // Joinery
  const perJoint = cfg.depth > 400 ? 3 : 2;
  const joints = 4 + 4 * dividerCount + (cfg.shelves?.fixed ? shelves.length * 2 : 0);
  const connectors = joints * perJoint * runs;
  const jointNames: Record<string, [string, string]> = {
    'cam-dowel': ['Cam lock + bolt + dowel set', 'Estimate for carcass joints'],
    confirmat: ['Confirmat screw 7×50', 'Estimate for carcass joints'],
    dowel: ['Wood dowel 8×30 (glued)', 'Estimate for carcass joints'],
    screw: ['Chipboard screw 4×50', 'Estimate for carcass joints'],
  };
  const [jointName, jointNote] = jointNames[cfg.jointing ?? 'cam-dowel'] ?? jointNames['cam-dowel'];
  pick(items, 'Joinery', jointName, connectors, 'pcs', jointNote);
  const backs = panels.filter((p) => p.type === 'back');
  const backPerimeter = backs.reduce((sum, p) => sum + 2 * (p.cutWidth + p.cutHeight), 0);
  pick(items, 'Joinery', 'Back panel pin / screw', Math.ceil(backPerimeter / 150), 'pcs', 'About one per 150mm of back perimeter');

  // Hinges & doors
  const hingeTotal = doors.reduce((sum, d) => sum + (d.hingeCount ?? 2), 0);
  const hingeType = cfg.doors?.hingeType ?? 'standard';
  const hingeLabel = hingeType === 'soft-close' ? 'Soft-close concealed hinge' : hingeType === 'push-open' ? 'Spring-open concealed hinge (no damper)' : 'Concealed hinge';
  const hingeFit = cfg.hardware.hinge;
  const catalogueHinge = Boolean(cfg.fittings?.hinge || cfg.fittings?.hingePlate);
  if (catalogueHinge) {
    // Hinge and plate part numbers come from the catalogue picker below.
  } else if (hingeFit?.fitting === 'blum-clip-top-110') {
    const application: HingeApplication = cfg.overlay.type === 'inset' ? 'inset' : cfg.overlay.type === 'partial-overlay' ? 'dual' : 'overlay';
    const action: HingeAction = hingeType === 'soft-close' ? 'blumotion' : hingeType === 'push-open' ? 'unsprung' : 'spring';
    const hinge = hingePart(application, hingeFit.boss, action) ?? hingePart(application, hingeFit.boss, 'spring');
    if (hinge) pick(items, 'Hinges & doors', `Blum ${hinge.description}`, hingeTotal, 'pcs', 'Blum catalogue 2024/2025, p.76', hinge.partNo);
    if (hingeFit.plate === 'cruciform-37-32') {
      const plate = platePart(hingeFit.plateFixing, hingeFit.plateSpacing ?? 0);
      pick(items, 'Hinges & doors', `Blum ${plate.description}`, hingeTotal, 'pcs', 'Blum catalogue 2024/2025, p.152', plate.partNo);
    } else {
      pick(items, 'Hinges & doors', 'Hinge mounting plate (choose a Blum plate to get its part number)', hingeTotal);
    }
  } else {
    pick(items, 'Hinges & doors', `${hingeLabel} ${cfg.doors?.openAngle ?? 110}°`, hingeTotal);
    pick(items, 'Hinges & doors', 'Hinge mounting plate', hingeTotal);
  }
  const mirrored = [...doors, ...slidingDoors].filter((d) => d.mirrored);
  const mirrorArea = mirrored.reduce((sum, d) => sum + (d.cutWidth * d.cutHeight) / 1e6, 0);
  pick(items, 'Mirror & glass', `${cfg.materials.mirrorType} (glued to door face)`, mirrorArea, 'm²', `${mirrored.length} door(s)`);
  pick(items, 'Mirror & glass', 'Safety backing film for mirror', mirrorArea, 'm²');

  // Handles / push-to-open
  const fronts = doors.length + drawerFronts.length + slidingDoors.length;
  const spacing = cfg.hardware.handleHoleSpacing;
  if (handleType === 'bar') pick(items, 'Handles & push-to-open', `Bar handle (${spacing}mm centres)`, doors.length + drawerFronts.length);
  if (handleType === 'knob') pick(items, 'Handles & push-to-open', 'Knob', doors.length + drawerFronts.length);
  if (handleType === 'edge-pull') pick(items, 'Handles & push-to-open', 'Edge pull profile (cut to length)', doors.length + drawerFronts.length);
  if (handleType === 'finger-pull') pick(items, 'Handles & push-to-open', 'Finger-pull profile (cut to length)', doors.length + drawerFronts.length);
  if (handleType === 'push-open') {
    const type = cfg.hardware.pushOpen.type;
    if (type === 'magnetic-latch') pick(items, 'Handles & push-to-open', 'Magnetic touch latch + catch plate', doors.length + drawerFronts.length);
    if (type === 'mechanical-latch') pick(items, 'Handles & push-to-open', 'Mechanical push latch', doors.length + drawerFronts.length);
    if (type === 'tip-on') {
      if (hingeFit?.fitting === 'blum-clip-top-110' && doors.length > 0) {
        pick(items, 'Handles & push-to-open', `Blum ${TIP_ON_DOOR_SHORT.description}`, doors.length, 'pcs', 'Needs unsprung hinges; Blum catalogue p.76', TIP_ON_DOOR_SHORT.partNo);
        pick(items, 'Handles & push-to-open', 'Tip-on mechanical push-open unit (drawers)', drawerFronts.length);
      } else {
        pick(items, 'Handles & push-to-open', 'Tip-on mechanical push-open unit', doors.length + drawerFronts.length);
      }
    }
    if (type === 'servo-drive') {
      pick(items, 'Handles & push-to-open', 'Electric servo drive unit', doors.length + drawerFronts.length);
      pick(items, 'Handles & push-to-open', 'Servo drive power supply + cable set', 1, 'sets');
    }
  }
  pick(items, 'Handles & push-to-open', 'Sliding door recessed pull', slidingDoors.length * 1);
  void fronts;

  // Drawers
  if (drawerFronts.length > 0) {
    const slide = cfg.drawers?.slideType ?? 'standard';
    const label = slide === 'soft-close' ? 'Soft-close full-extension runner pair' : slide === 'push-open' ? 'Push-open (tip-on) runner pair' : 'Full-extension runner pair';
    const length = Math.floor(Math.max(...drawerFronts.map((d) => d.drawDepth ?? 400)) / 50) * 50;
    pick(items, 'Drawers', label, drawerFronts.length, 'pcs', `Up to ${length}mm`);
  }

  // Shelving & hanging
  const adjustable = !cfg.shelves?.fixed;
  if (adjustable) pick(items, 'Shelving & hanging', 'Shelf pin (5mm)', shelves.length * 4);
  const railLength = rails.reduce((sum, r) => sum + (r.railLength ?? r.sizeX), 0) / 1000;
  pick(items, 'Shelving & hanging', `Hanging rail tube Ø${cfg.wardrobe?.railDiameter ?? 25}`, railLength, 'm', `${rails.length} rail(s)`);
  const brackets = rails.reduce((sum, r) => sum + 2 + Math.max(0, Math.ceil((r.railLength ?? r.sizeX) / 1000) - 1), 0);
  pick(items, 'Shelving & hanging', 'Rail end bracket', rails.length * 2);
  pick(items, 'Shelving & hanging', 'Rail centre support bracket', brackets - rails.length * 2);

  // Sliding system
  if (slidingDoors.length > 0) {
    const sl = cfg.wardrobe.sliding;
    const trackLengthM = (cfg.width + (cfg.wardrobe.legB.enabled && cfg.wardrobe.layout !== 'single' ? cfg.wardrobe.legB.length : 0)) / 1000;
    pick(items, 'Sliding system', sl.track === 'top-hung' ? 'Top-hung track (2-channel)' : 'Top guide track (2-channel)', trackLengthM, 'm');
    pick(items, 'Sliding system', sl.track === 'top-hung' ? 'Bottom guide track (floor channel)' : 'Bottom rolling track (2-channel)', trackLengthM, 'm');
    pick(items, 'Sliding system', sl.track === 'top-hung' ? 'Hanger roller (top)' : 'Roller wheel (bottom)', slidingDoors.length * 2);
    pick(items, 'Sliding system', 'Door guide / stabiliser', slidingDoors.length * 2);
    if (sl.softClose) pick(items, 'Sliding system', 'Soft-close damper', slidingDoors.length * 2);
  }

  // Lighting & electrics
  const lighting = cfg.lighting;
  if (lighting?.enabled) {
    const grooves = fab.flatMap((p) => groovesOf(p)).filter((g) => g.purpose?.startsWith('led-channel'));
    const lengthM = grooves.reduce((sum, g) => sum + grooveLength(g), 0) / 1000;
    if (lengthM > 0) {
      const type = lighting.type;
      if (type === 'puck') {
        pick(items, 'Lighting', `Recessed puck light (${lighting.colourTemp})`, Math.max(1, Math.ceil(lengthM / 0.4)), 'pcs', 'About one per 400mm of route');
      } else {
        pick(items, 'Lighting', `LED strip ${lighting.voltage}V ${lighting.colourTemp}`, lengthM * 1.05, 'm', 'Routed channels, +5% waste');
        if (type === 'led-profile') pick(items, 'Lighting', 'Aluminium LED profile + diffuser', lengthM, 'm');
      }
      const watts = lengthM * lighting.wattsPerMetre * 1.25;
      const driver = DRIVER_SIZES.find((size) => size >= watts) ?? Math.ceil(watts / 100) * 100;
      pick(items, 'Lighting', `LED driver ${lighting.voltage}V ${driver}W`, 1, 'pcs', `Load ≈ ${watts.toFixed(0)}W incl. 25% headroom; mount ${lighting.driver}`);
      pick(items, 'Lighting', `Low-voltage cable (2-core)`, lengthM * 1.5 + 2, 'm');
      pick(items, 'Lighting', 'Strip / puck connector', Math.max(2, grooves.length * 2));
    }
    const controls: Record<string, string> = {
      switch: 'Inline rocker switch',
      'door-sensor': 'Door-activated sensor switch',
      'drawer-switch': 'Drawer-activated switch (see electrics)',
      pir: 'PIR motion sensor',
      touch: 'Touch dimmer switch',
    };
    if (lighting.control !== 'none') pick(items, 'Lighting', controls[lighting.control], 1);
    const cableHoles = fab.reduce((sum, p) => sum + holesOf(p).filter((h) => h.purpose === 'cable-hole').length, 0);
    pick(items, 'Lighting', `Cable grommet Ø${lighting.cableHoleDiameter}`, cableHoles);
  }
  const electrics = cfg.electrics;
  if (electrics?.drawerSwitch?.enabled) {
    const count = fab.reduce((sum, p) => sum + holesOf(p).filter((h) => h.purpose === 'drawer-switch').length, 0);
    const switches = Math.max(1, Math.ceil(count / 2));
    if (electrics.drawerSwitch.type === 'magnetic-reed') {
      pick(items, 'Electrics', 'Magnetic reed switch (drawer-activated)', switches);
      pick(items, 'Electrics', 'Neodymium magnet 8mm', switches);
    } else {
      pick(items, 'Electrics', 'Plunger switch (drawer-activated)', switches);
    }
  }
  if (electrics?.doorSwitch?.enabled) {
    const count = fab.reduce((sum, p) => sum + holesOf(p).filter((h) => h.purpose === 'door-switch').length, 0);
    pick(items, 'Electrics', electrics.doorSwitch.type === 'plunger' ? 'Door plunger switch' : 'Door reed switch + magnet', count);
  }

  // Catalogue fittings chosen per slot
  const slotCounts: Record<FittingSlot, number> = {
    hinge: hingeTotal,
    hingePlate: hingeTotal,
    drawerSystem: drawerFronts.length,
    drawerMotion: drawerFronts.length,
    divider: drawerFronts.length,
    doorMotion: doors.length,
    lift: doors.length,
    pocket: doors.length,
  };
  for (const slot of Object.keys(slotCounts) as FittingSlot[]) {
    const choice = cfg.fittings?.[slot];
    if (!choice) continue;
    const family = getFamily(choice.familyId);
    const variant = getVariant(choice.familyId, choice.variantId);
    if (!family || !variant) continue;
    const count = Math.max(1, slotCounts[slot]);
    for (const part of partsForChoice(choice, slot)) {
      pick(items, SLOT_LABELS[slot].replace(/ \(.*\)$/, ''), `${family.name} ${variant.name}: ${part.description}`, (part.qty ?? 1) * count, 'pcs', `Blum catalogue p.${part.page}`, part.partNo);
    }
  }

  // Edge banding
  let edgeMm = 0;
  for (const p of fab) {
    const eb = p.edgeBanding;
    if (!eb) continue;
    if (eb.top) edgeMm += p.cutWidth;
    if (eb.bottom) edgeMm += p.cutWidth;
    if (eb.left) edgeMm += p.cutHeight;
    if (eb.right) edgeMm += p.cutHeight;
  }
  const band = cfg.materials.edgeBand;
  pick(items, 'Edge banding', `PVC edge band ${band?.thickness ?? 1}mm (${band?.colour === 'match' ? 'matching' : band?.colour ?? 'matching'})`, (edgeMm / 1000) * 1.1, 'm', '+10% waste');

  // Feet & fixings
  const tk = resolveToeKick(cfg);
  if (tk.height > 0 && (cfg.toeKick.feet ?? 0) > 0) {
    const feet = ((cfg.toeKick.feet ?? 4) + (cfg.width > 1000 ? 2 : 0)) * runs;
    pick(items, 'Fixings & feet', 'Adjustable leg', feet);
    pick(items, 'Fixings & feet', 'Plinth clip', Math.ceil(feet / 2));
  }
  const wall = cfg.considerations?.wallFixing ?? 'none';
  if (wall === 'anti-tip') pick(items, 'Fixings & feet', 'Anti-tip wall bracket', 2 * runs);
  if (wall === 'hanging-rail') pick(items, 'Fixings & feet', 'Hanging rail / cleat set', runs);

  return items;
}

/** Merge item lists (e.g. several cabinets × copies) into one summed list. */
export function mergeHardware(lists: { items: HardwareItem[]; multiplier: number }[]): HardwareItem[] {
  const merged = new Map<string, HardwareItem>();
  for (const { items, multiplier } of lists) {
    for (const item of items) {
      const key = `${item.group}|${item.item}|${item.unit}|${item.partNo ?? ''}`;
      const existing = merged.get(key);
      if (existing) {
        existing.qty = Math.round((existing.qty + item.qty * multiplier) * 100) / 100;
      } else {
        merged.set(key, { ...item, qty: Math.round(item.qty * multiplier * 100) / 100 });
      }
    }
  }
  const order = ['Joinery', 'Hinges & doors', 'Hinge', 'Hinge mounting plate', 'Mirror & glass', 'Handles & push-to-open', 'Drawers', 'Drawer system', 'Drawer motion', 'Door motion', 'Lift system', 'Inner dividing system', 'Pocket door system', 'Shelving & hanging', 'Sliding system', 'Lighting', 'Electrics', 'Edge banding', 'Fixings & feet'];
  const rank = (group: string) => (order.indexOf(group) === -1 ? order.length : order.indexOf(group));
  return [...merged.values()].sort((a, b) => rank(a.group) - rank(b.group));
}
