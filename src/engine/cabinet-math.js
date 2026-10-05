// cabinet-math.js — Pure function: Cabinet config → Panel[]
// No UI, no three.js — unit-testable in isolation.

import { resolveHingeDrilling } from '../fittings/hingeDrilling';
import { resolveDrawerFitting } from '../fittings/drawerModel';
import { buildMetalBoxPanels } from './drawerBox';

export const DEFAULT_VALUES = {
  reveal: 3,
  overlayAmount: 18,
  hingeBoreDiameter: 35,
  hingeBoreInset: 22,
  shelfPinSpacing: 32,
  shelfPinSetback: 80,
  topClearance: 3,
  stretcherDepth: 100,
  backGrooveDepth: 8,
  hingePlateFrontHoleOffset: 20,
  hingePlateRearHoleOffset: 32,
  hingePlateHoleSpacing: 32,
  handleHoleSpacing: 96,
  handleEdgeOffset: 40,
  doorHandleHeight: 100,
  drawerHandleTopOffset: 50,
  tenonLength: 10,
  faceFrameOverhang: 0,
};

/** Toe kick follows the category (base cabinets) unless explicitly switched on/off. */
export function resolveToeKick(cabinet) {
  const toeKick = cabinet?.toeKick;
  if (!toeKick) return { height: 0, setback: 0 };
  const enabled = toeKick.enabled ?? cabinet.category === 'base';
  return enabled ? { height: toeKick.height ?? 0, setback: toeKick.setback ?? 0 } : { height: 0, setback: 0 };
}

/** Gaps around the front opening: top, bottom and each outer side. */
export function resolveReveals(cabinet) {
  const gap = cabinet?.reveal ?? DEFAULT_VALUES.reveal;
  const overlay = cabinet?.overlay || {};
  return {
    gap,
    top: overlay.topReveal ?? DEFAULT_VALUES.topClearance,
    bottom: overlay.bottomReveal ?? DEFAULT_VALUES.topClearance,
    side: overlay.sideReveal ?? gap / 2,
  };
}

/** Hinge centres (mm from the bottom of a door of height h). */
export function hingePositionsFor(cabinet, h) {
  const override = Number(cabinet?.doors?.hingesPerDoor) || 0;
  // Blum planning chart (catalogue p.718): 2 hinges up to 750mm, 3 up to 1500, 4 up to 2100, 5 up to 2500.
  const count = override >= 2 ? override : h <= 750 ? 2 : h <= 1500 ? 3 : h <= 2100 ? 4 : 5;
  if (count === 2) return [100, h - 100];
  if (count === 3) return [100, h / 2, h - 100];
  const span = Math.max(0, h - 200);
  return Array.from({ length: count }, (_, i) => 100 + (span * i) / (count - 1));
}

export function inferFrontMode(cabinet) {
  const explicitMode = cabinet?.front?.mode;
  if (explicitMode === 'doors' || explicitMode === 'drawers' || explicitMode === 'sliding' || explicitMode === 'open') return explicitMode;
  if ((cabinet?.drawers?.count ?? 0) > 0) return 'drawers';
  return 'doors';
}

export function defaultCabinet() {
  return {
    id: 'cabinet-1',
    category: 'base',
    usage: 'kitchen',
    front: { mode: 'doors' },
    construction: 'frameless',
    width: 800,
    height: 720,
    depth: 560,
    hasTop: false,
    backMount: 'applied-rear',
    toeKick: { height: 100, setback: 75, enabled: null, style: 'recessed', feet: 4 },
    doors: { count: 2, hingeSide: 'both', hingeType: 'standard', hingesPerDoor: 0, openAngle: 110, mirror: 'none' },
    drawers: { count: 0, heights: [], sideClearance: 10, sideThickness: 12, bottomThickness: 6, slideType: 'standard' },
    materials: {
      caseMaterial: 'Carcass Melamine White',
      caseThickness: 18,
      shelfMaterial: 'Carcass Melamine White',
      backThickness: 6,
      backMaterial: 'Hardboard White',
      frontMaterial: 'Door/Front Melamine White',
      doorMaterial: 'Door/Front Melamine White',
      drawerFrontMaterial: 'Door/Front Melamine White',
      drawerBoxMaterial: 'Carcass Melamine White',
      doorThickness: 18,
      faceFrameStock: 18,
      faceFrameWidth: 38,
      topRailWidth: 38,
      bottomRailWidth: 38,
      overrides: {},
      mirrorType: 'Mirror 4mm Silver',
      edgeBand: { colour: 'match', thickness: 1 },
    },
    shelves: { count: 2, thickness: null, inset: 0, fixed: false },
    interior: { rail: { enabled: false, drop: 60 } },
    jointing: 'cam-dowel',
    considerations: { wallFixing: 'none', ventilation: 'none', notes: '' },
    overlay: { type: 'full-overlay', amount: 18, topReveal: null, bottomReveal: null, sideReveal: null },
    reveal: 3,
    hardware: {
      hingeBoreDiameter: 35,
      hingeBoreInset: 22,
      shelfPinSpacing: 32,
      shelfPinSetback: 80,
      hingePlateFrontHoleOffset: 20,
      hingePlateRearHoleOffset: 32,
      hingePlateHoleSpacing: 32,
      handleHoleSpacing: 96,
      handleEdgeOffset: 40,
      doorHandleHeight: 100,
      drawerHandleTopOffset: 50,
      hinge: { fitting: 'generic', boss: 'screw-on', plate: 'generic', plateFixing: 'screw', plateSpacing: 0, edgeDistance: 5 },
      handleType: 'bar',
      pushOpen: { type: 'magnetic-latch', boreDiameter: 10, edgeOffset: 40 },
    },
    lighting: {
      enabled: false,
      type: 'led-strip',
      colourTemp: '3000K',
      voltage: 24,
      wattsPerMetre: 9.6,
      zones: { underside: false, interiorTop: false, shelfEdges: false, sides: false, rail: false, toeKick: false, drawers: false },
      channel: { width: 16, depth: 8, setback: 30 },
      driver: 'top-rear',
      cableHoleDiameter: 12,
      control: 'switch',
    },
    electrics: {
      drawerSwitch: { enabled: false, type: 'magnetic-reed', drawers: 'all', boreDiameter: 10, offsetFromFront: 40 },
      doorSwitch: { enabled: false, type: 'plunger', boreDiameter: 12 },
      wiring: 'rear-grommet',
    },
    fittings: {},
    wardrobe: {
      layout: 'single',
      fronts: 'hinged',
      sections: [
        { width: 0, rails: 1, shelves: 2, drawers: 0 },
        { width: 0, rails: 2, shelves: 0, drawers: 0 },
        { width: 0, rails: 0, shelves: 3, drawers: 3 },
      ],
      legB: { enabled: false, length: 1200, sections: [{ width: 0, rails: 1, shelves: 1, drawers: 0 }, { width: 0, rails: 0, shelves: 5, drawers: 0 }] },
      legC: { enabled: false, length: 1200, sections: [{ width: 0, rails: 1, shelves: 1, drawers: 0 }, { width: 0, rails: 0, shelves: 5, drawers: 0 }] },
      hangingHeight: 1700,
      halfHangHeight: 950,
      railDrop: 60,
      railDiameter: 25,
      drawerHeight: 180,
      sliding: { doorCount: 3, overlap: 25, track: 'top-hung', topTrack: 35, bottomTrack: 20, softClose: true },
    },
    nesting: {
      sheetWidth: 2440,
      sheetHeight: 1220,
      gap: 20,
      allowRotation: true,
    },
  };
}

/**
 * @param {import('./cabinet-math.js').Cabinet} cabinet
 * @returns {import('./cabinet-math.js').Panel[]}
 */
export function computePanels(cabinet) {
  const panels = [];

  const T = cabinet.materials.caseThickness;
  const Td = cabinet.materials.doorThickness;
  const Tb = cabinet.materials.backThickness;
  const Tdf = cabinet.materials.drawerFrontThickness ?? Td;
  const g = cabinet.reveal ?? DEFAULT_VALUES.reveal;
  const O = cabinet.overlay.type === 'inset' ? 0 : cabinet.overlay.amount;
  const isFrameless = cabinet.construction === 'frameless';
  const isInset = cabinet.overlay.type === 'inset';

  const resolvedToeKick = resolveToeKick(cabinet);
  const tkHeight = resolvedToeKick.height;
  const tkSetback = resolvedToeKick.setback;
  const bottomY = tkHeight;

  const hw = cabinet.hardware;
  const hingeDrilling = resolveHingeDrilling(cabinet);
  const hingeBoreDia = hingeDrilling.cupDiameter;
  const hingeBoreInset = hingeDrilling.cupInset;
  const pinSpacing = hw.shelfPinSpacing ?? DEFAULT_VALUES.shelfPinSpacing;
  const pinSetback = hw.shelfPinSetback ?? DEFAULT_VALUES.shelfPinSetback;
  const hingePlateFrontHoleOffset = hw.hingePlateFrontHoleOffset ?? DEFAULT_VALUES.hingePlateFrontHoleOffset;
  const hingePlateRearHoleOffset = hw.hingePlateRearHoleOffset ?? DEFAULT_VALUES.hingePlateRearHoleOffset;
  const hingePlateHoleSpacing = hw.hingePlateHoleSpacing ?? DEFAULT_VALUES.hingePlateHoleSpacing;
  const handleHoleSpacing = hw.handleHoleSpacing ?? DEFAULT_VALUES.handleHoleSpacing;
  const handleEdgeOffset = hw.handleEdgeOffset ?? DEFAULT_VALUES.handleEdgeOffset;
  const doorHandleHeight = hw.doorHandleHeight ?? DEFAULT_VALUES.doorHandleHeight;
  const drawerHandleTopOffset = hw.drawerHandleTopOffset ?? DEFAULT_VALUES.drawerHandleTopOffset;
  const reveals = resolveReveals(cabinet);
  const topClearance = reveals.top;
  const bottomClearance = reveals.bottom;
  const handleType = hw.handleType ?? 'bar';
  const fixedShelves = Boolean(cabinet.shelves?.fixed);
  const shelfInset = Math.max(0, Number(cabinet.shelves?.inset) || 0);
  const stretcherDepth = DEFAULT_VALUES.stretcherDepth;
  const grooveDepth = DEFAULT_VALUES.backGrooveDepth;

  const W = cabinet.width;
  const H = cabinet.height;
  const D = cabinet.depth;
  const frontMode = inferFrontMode(cabinet);
  const drawerCount = frontMode === 'drawers' ? (cabinet.drawers?.count ?? 0) : 0;
  // A catalogue lift system replaces the hinged doors with one lift-up front.
  const hasLift = frontMode === 'doors' && Boolean(cabinet.fittings?.lift);
  const doorCount = frontMode === 'doors' ? (hasLift ? 1 : Math.min(2, cabinet.doors?.count ?? 0)) : 0;
  const shelfCount = frontMode === 'doors' ? (cabinet.shelves?.count ?? 0) : 0;

  const sideDepth = isInset ? D : Math.max(0, D - (drawerCount > 0 ? Tdf : Td));
  // A catalogue drawer system (runner or metal box) overrides the generic drawer sizes.
  const drawerFitting = drawerCount > 0
    ? resolveDrawerFitting(cabinet.fittings?.drawerSystem, { LW: W - 2 * T, availableDepth: sideDepth })
    : null;
  const fittedDrawerDepth = drawerFitting ? (drawerFitting.kind === 'wood-runner' ? drawerFitting.boxLength : drawerFitting.nominalLength) : null;
  const ffDepthOff = isFrameless ? 0 : T; // face frame occupies front T mm
  const gHalf = g / 2;

  // ---- Helper to create panel objects ----
  function makePanel(opts) {
    const {
      id, name, type, color,
      materialLabel,
      cutWidth, cutHeight, cutThickness,
      posX, posY, posZ,
      sizeX, sizeY, sizeZ,
      holes = [], notches = [], grooves = [],
      edgeBanding = { top: false, bottom: false, left: false, right: false },
    } = opts;
    return {
      id, name, type, color, materialLabel,
      cutWidth, cutHeight, cutThickness,
      posX, posY, posZ,
      sizeX, sizeY, sizeZ,
      holes, notches, grooves, edgeBanding,
    };
  }

  function addHorizontalHandleHoles(panel, centerX, centerY) {
    if (handleType === 'knob') {
      panel.holes.push({ x: centerX, y: centerY, diameter: 5, purpose: 'handle' });
      return;
    }
    if (handleType !== 'bar' || handleHoleSpacing <= 0) return;
    const halfSpacing = handleHoleSpacing / 2;
    panel.holes.push(
      { x: centerX - halfSpacing, y: centerY, diameter: 5, purpose: 'handle' },
      { x: centerX + halfSpacing, y: centerY, diameter: 5, purpose: 'handle' },
    );
  }

  function addVerticalHandleHoles(panel, centerX, centerY) {
    if (handleType === 'knob') {
      panel.holes.push({ x: centerX, y: centerY, diameter: 5, purpose: 'handle' });
      return;
    }
    if (handleType !== 'bar' || handleHoleSpacing <= 0) return;
    const halfSpacing = handleHoleSpacing / 2;
    panel.holes.push(
      { x: centerX, y: centerY - halfSpacing, diameter: 5, purpose: 'handle' },
      { x: centerX, y: centerY + halfSpacing, diameter: 5, purpose: 'handle' },
    );
  }

  const caseColor = 0xB7C8E6;
  const doorColor = 0xF7FAFF;
  const faceFrameColor = 0xD7E2F5;
  const backColor = 0x90A8CC;
  const stretcherColor = 0xA5B9DA;
  const caseMaterialLabel = cabinet.materials.caseMaterial || 'Carcass';
  const shelfMaterialLabel = cabinet.materials.shelfMaterial || caseMaterialLabel;
  const backMaterialLabel = cabinet.materials.backMaterial || 'Back Panel';
  const doorMaterialLabel = cabinet.materials.doorMaterial || 'Door Material';
  const plinthMaterialLabel = cabinet.materials.plinthMaterial || caseMaterialLabel;
  const plinthThickness = cabinet.materials.plinthThickness ?? T;
  const drawerFrontMaterialLabel = cabinet.materials.drawerFrontMaterial || doorMaterialLabel;
  const drawerBoxMaterialLabel = cabinet.materials.drawerBoxMaterial || 'Drawer Box Material';

  // ============================================================
  // SIDE PANELS
  // ============================================================
  // Both side panels computed with same feature layout (x=0 = front edge),
  // then the right side panel is mirrored (x → cutWidth - x) so its
  // inside-face layout matches the real part.
  const sideCutDepth = sideDepth - ffDepthOff;
  for (const side of ['left', 'right']) {
    const isLeft = side === 'left';
    const notchArr = [];
    if (tkHeight > 0) {
      notchArr.push({
        x: 0,
        y: 0,
        width: Math.max(0, tkSetback - ffDepthOff),
        height: tkHeight,
      });
    }
    const panel = makePanel({
      id: `side-${side}`,
      name: side === 'left' ? 'Left Side' : 'Right Side',
      type: 'case',
      color: caseColor,
      materialLabel: caseMaterialLabel,
      cutWidth: sideCutDepth,
      cutHeight: H,
      cutThickness: T,
      posX: isLeft ? T / 2 : W - T / 2,
      posY: H / 2,
      posZ: ffDepthOff + sideCutDepth / 2,
      sizeX: T,
      sizeY: H,
      sizeZ: sideCutDepth,
      notches: notchArr,
      grooves: cabinet.backMount === 'grooved-in' ? [{
        x: Math.max(0, sideCutDepth - grooveDepth),
        y: bottomY + T,
        width: grooveDepth,
        height: Math.max(0, H - bottomY - T),
        purpose: 'back-panel-groove',
      }] : [],
      edgeBanding: { top: false, bottom: false, left: false, right: true },
    });

    // Drawer cabinets use runner reference holes instead of shelf pin rows.
    if (drawerCount > 0 && cabinet.drawers.heights.length === drawerCount && sideCutDepth > 80) {
      const drawerBoxTopInset = 24;
      const drawerBoxBottomInset = 12;
      const drawerDepth = fittedDrawerDepth ?? Math.max(50, sideDepth - ffDepthOff - 20);
      const slideHoleInset = Math.min(64, Math.max(20, drawerDepth * 0.18));
      const slideHoleXs = [slideHoleInset, drawerDepth / 2, drawerDepth - slideHoleInset];
      let drawerYOffset = isFrameless || tkHeight > 0 ? tkHeight + bottomClearance : 0;
      for (let i = 0; i < drawerCount; i++) {
        const dh = cabinet.drawers.heights[i];
        const boxH = Math.max(30, dh - drawerBoxTopInset - drawerBoxBottomInset);
        const slideCenterY = drawerYOffset + drawerBoxBottomInset + boxH / 2;
        for (const x of slideHoleXs) {
          panel.holes.push({ x, y: slideCenterY, diameter: 3, purpose: 'drawer-runner-reference' });
        }
        drawerYOffset += dh + g;
      }
    } else if (shelfCount > 0 && !fixedShelves && sideCutDepth > pinSetback * 2) {
      const frontPinX = pinSetback;
      const backPinX = sideCutDepth - pinSetback;
      const shelfPinBaseY = tkHeight > 0 ? tkHeight : T;
      const firstPinY = shelfPinBaseY + pinSpacing * 2;
      const lastPinY = H - T - pinSpacing;
      for (let y = firstPinY; y <= lastPinY + 0.001; y += pinSpacing) {
        panel.holes.push({ x: frontPinX, y, diameter: 5, purpose: 'shelf-pin' });
        panel.holes.push({ x: backPinX, y, diameter: 5, purpose: 'shelf-pin' });
      }
    }

    // Hinge mounting plate holes (on the 32mm line near the front edge)
    if (doorCount > 0 && drawerCount === 0 && !hasLift) {
      const hingeSide = cabinet.doors.hingeSide ?? 'both';
      const needsHingePlates = hingeSide === 'both' || hingeSide === side;
      if (needsHingePlates) {
        const doorBottomY = isFrameless || tkHeight > 0 ? tkHeight + bottomClearance : 0;
        const doorH = H - (isFrameless ? tkHeight + bottomClearance : tkHeight) - topClearance;
        const hingeVertPositions = hingePositionsFor(cabinet, doorH);
        const hingePlateDepths = hingeDrilling.plateOffsets;
        const hingePlateVerticalOffset = hingeDrilling.plateSpacing / 2;
        for (const hy of hingeVertPositions) {
          for (const x of hingePlateDepths) {
            panel.holes.push({ x, y: doorBottomY + hy - hingePlateVerticalOffset, diameter: 5, purpose: 'hinge-mounting-plate' });
            panel.holes.push({ x, y: doorBottomY + hy + hingePlateVerticalOffset, diameter: 5, purpose: 'hinge-mounting-plate' });
          }
        }
      }
    }

    // Mirror right side panel: flip all x-coordinates so the inside face
    // has front edge at x=cutWidth, back edge at x=0.
    if (!isLeft) {
      for (const h of panel.holes) { h.x = sideCutDepth - h.x; }
      for (const n of panel.notches) { n.x = sideCutDepth - n.x - n.width; }
    }

    panels.push(panel);
  }

  // ============================================================
  // BOTTOM PANEL
  // ============================================================
  const bottomW = W - 2 * T;
  const bottomD = sideDepth - ffDepthOff;
  if (bottomW > 0 && bottomD > 0) {
    panels.push(makePanel({
      id: 'bottom',
      name: 'Bottom',
      type: 'case',
      color: caseColor,
      materialLabel: caseMaterialLabel,
      cutWidth: bottomW,
      cutHeight: bottomD,
      cutThickness: T,
      posX: W / 2,
      posY: bottomY + T / 2,
      posZ: ffDepthOff + bottomD / 2,
      sizeX: bottomW,
      sizeY: T,
      sizeZ: bottomD,
      grooves: cabinet.backMount === 'grooved-in' ? [{
        x: 0,
        y: Math.max(0, bottomD - grooveDepth),
        width: bottomW,
        height: grooveDepth,
        purpose: 'back-panel-groove',
      }] : [],
      edgeBanding: { top: false, bottom: false, left: false, right: true },
    }));
  }

  // ============================================================
  // TOP PANEL or STRETCHERS
  // ============================================================
  const topOrStretcherW = W - 2 * T;
  const topOrStretcherD = cabinet.hasTop ? sideDepth : stretcherDepth;

  if (cabinet.hasTop) {
    const topDepth = sideDepth - ffDepthOff;
    if (topOrStretcherW > 0 && topDepth > 0) {
      panels.push(makePanel({
        id: 'top',
        name: 'Top',
        type: 'case',
        color: caseColor,
        materialLabel: caseMaterialLabel,
        cutWidth: topOrStretcherW,
        cutHeight: topDepth,
        cutThickness: T,
        posX: W / 2,
        posY: H - T / 2,
        posZ: ffDepthOff + topDepth / 2,
        sizeX: topOrStretcherW,
        sizeY: T,
        sizeZ: topDepth,
        grooves: cabinet.backMount === 'grooved-in' ? [{
          x: 0,
          y: Math.max(0, topDepth - grooveDepth),
          width: topOrStretcherW,
          height: grooveDepth,
          purpose: 'back-panel-groove',
        }] : [],
        edgeBanding: { top: false, bottom: false, left: false, right: true },
      }));
    }
  } else {
    // Front and back stretchers
    if (topOrStretcherW > 0) {
      panels.push(makePanel({
        id: 'stretcher-front',
        name: 'Stretcher Front',
        type: 'case',
        color: stretcherColor,
        materialLabel: caseMaterialLabel,
        cutWidth: topOrStretcherW,
        cutHeight: topOrStretcherD,
        cutThickness: T,
        posX: W / 2,
        posY: H - T / 2,
        posZ: ffDepthOff + topOrStretcherD / 2,
        sizeX: topOrStretcherW,
        sizeY: T,
        sizeZ: topOrStretcherD,
        edgeBanding: { top: false, bottom: false, left: false, right: true },
      }));
      panels.push(makePanel({
        id: 'stretcher-back',
        name: 'Stretcher Back',
        type: 'case',
        color: stretcherColor,
        materialLabel: caseMaterialLabel,
        cutWidth: topOrStretcherW,
        cutHeight: topOrStretcherD,
        cutThickness: T,
        posX: W / 2,
        posY: H - T / 2,
        posZ: sideDepth - topOrStretcherD / 2,
        sizeX: topOrStretcherW,
        sizeY: T,
        sizeZ: topOrStretcherD,
        grooves: cabinet.backMount === 'grooved-in' ? [{
          x: 0,
          y: Math.max(0, topOrStretcherD - grooveDepth),
          width: topOrStretcherW,
          height: grooveDepth,
          purpose: 'back-panel-groove',
        }] : [],
        edgeBanding: { top: false, bottom: false, left: false, right: true },
      }));
    }
  }

  // ============================================================
  // BACK PANEL
  // ============================================================
  if (cabinet.backMount === 'grooved-in') {
    const backW = W - 2 * T + 2 * grooveDepth;
    const backH = H - T - bottomY;
    if (backW > 0 && backH > 0) {
      panels.push(makePanel({
        id: 'back',
        name: 'Back Panel',
        type: 'back',
        color: backColor,
        materialLabel: backMaterialLabel,
        cutWidth: backW,
        cutHeight: backH,
        cutThickness: Tb,
        posX: W / 2,
        posY: bottomY + T + (backH) / 2,
        posZ: sideDepth - grooveDepth + Tb / 2,
        sizeX: backW,
        sizeY: backH,
        sizeZ: Tb,
        edgeBanding: { top: false, bottom: false, left: false, right: false },
      }));
    }
  } else {
    // Applied-rear
    const backH = tkHeight > 0 ? H - tkHeight : H;
    if (W > 0 && backH > 0) {
      panels.push(makePanel({
        id: 'back',
        name: 'Back Panel',
        type: 'back',
        color: backColor,
        materialLabel: backMaterialLabel,
        cutWidth: W,
        cutHeight: backH,
        cutThickness: Tb,
        posX: W / 2,
        posY: tkHeight + backH / 2,
        posZ: sideDepth + Tb / 2,
        sizeX: W,
        sizeY: backH,
        sizeZ: Tb,
        edgeBanding: { top: false, bottom: false, left: false, right: false },
      }));
    }
  }

  // ============================================================
  // SHELVES (adjustable)
  // ============================================================
  if (shelfCount > 0) {
    const shelfThk = cabinet.shelves?.thickness ?? cabinet.materials.shelfThickness ?? T;
    const shelfW = W - 2 * T;
    const shelfD = sideDepth - ffDepthOff - shelfInset;
    if (shelfW > 0 && shelfD > 0) {
      // Available interior height between bottom panel top and top/stretcher bottom
      const shelfTopY = cabinet.hasTop ? H - T : H - T; // bottom of top panel/stretchers
      const shelfBottomY = bottomY + T; // top of bottom panel
      const availableH = shelfTopY - shelfBottomY;
      if (availableH > 0 && shelfCount > 0) {
        const spacing = availableH / (shelfCount + 1);
        for (let i = 0; i < shelfCount; i++) {
          const sy = shelfBottomY + spacing * (i + 1);
          panels.push(makePanel({
            id: `shelf-${i + 1}`,
            name: `Shelf ${i + 1}`,
            type: 'shelf',
            color: 0xD6E1F2,
            materialLabel: shelfMaterialLabel,
            cutWidth: shelfW,
            cutHeight: shelfD,
            cutThickness: shelfThk,
            posX: W / 2,
            posY: sy,
            posZ: ffDepthOff + shelfInset + shelfD / 2,
            sizeX: shelfW,
            sizeY: shelfThk,
            sizeZ: shelfD,
            edgeBanding: { top: false, bottom: false, left: false, right: true },
          }));
        }
      }
    }
  }

  // ============================================================
  // TOE KICK BOARD
  // ============================================================
  if (tkHeight > 0) {
    const kickW = W - 2 * T;
    if (kickW > 0) {
      panels.push(makePanel({
        id: 'toe-kick',
        name: 'Toe Kick',
        type: 'toe-kick',
        color: caseColor,
        materialLabel: plinthMaterialLabel,
        cutWidth: kickW,
        cutHeight: tkHeight,
        cutThickness: plinthThickness,
        posX: W / 2,
        posY: tkHeight / 2,
        posZ: tkSetback + plinthThickness / 2,
        sizeX: kickW,
        sizeY: tkHeight,
        sizeZ: plinthThickness,
        edgeBanding: { top: false, bottom: false, left: false, right: true },
      }));
    }
  }

  // ============================================================
  // FACE FRAME (stiles + rails)
  // ============================================================
  if (!isFrameless) {
    const ffw = cabinet.materials.faceFrameWidth;
    const ffo = DEFAULT_VALUES.faceFrameOverhang;
    const tenonLen = DEFAULT_VALUES.tenonLength;
    const topRailW = cabinet.materials.topRailWidth ?? ffw;
    const bottomRailW = cabinet.materials.bottomRailWidth ?? ffw;

    // Stiles (stop above the toe kick for base cabinets)
    const stileH = H - tkHeight;
    for (const side of ['left', 'right']) {
      const isLeft = side === 'left';
      panels.push(makePanel({
        id: `stile-${side}`,
        name: side === 'left' ? 'Stile Left' : 'Stile Right',
        type: 'face-frame',
        color: faceFrameColor,
        materialLabel: caseMaterialLabel,
        cutWidth: ffw,
        cutHeight: stileH,
        cutThickness: T,
        posX: isLeft ? ffo + ffw / 2 : W - ffo - ffw / 2,
        posY: tkHeight + stileH / 2,
        posZ: T / 2,
        // Face frame sits at the front
        sizeX: ffw,
        sizeY: stileH,
        sizeZ: T,
        edgeBanding: { top: false, bottom: false, left: false, right: false },
      }));
    }

    // Top rail
    const railLen = W - 2 * ffw + 2 * tenonLen;
    if (railLen > 0) {
      panels.push(makePanel({
        id: 'rail-top',
        name: 'Rail Top',
        type: 'face-frame',
        color: faceFrameColor,
        materialLabel: caseMaterialLabel,
        cutWidth: railLen,
        cutHeight: topRailW,
        cutThickness: T,
        posX: W / 2,
        posY: H - topRailW / 2,
        posZ: T / 2,
        sizeX: railLen,
        sizeY: topRailW,
        sizeZ: T,
        edgeBanding: { top: false, bottom: false, left: false, right: false },
      }));
    }

    // Bottom rail
    const bottomRailY = tkHeight > 0 ? tkHeight + bottomRailW / 2 : bottomRailW / 2;
    if (railLen > 0) {
      panels.push(makePanel({
        id: 'rail-bottom',
        name: 'Rail Bottom',
        type: 'face-frame',
        color: faceFrameColor,
        materialLabel: caseMaterialLabel,
        cutWidth: railLen,
        cutHeight: bottomRailW,
        cutThickness: T,
        posX: W / 2,
        posY: bottomRailY,
        posZ: T / 2,
        sizeX: railLen,
        sizeY: bottomRailW,
        sizeZ: T,
        edgeBanding: { top: false, bottom: false, left: false, right: false },
      }));
    }
  }

  // ============================================================
  // DOORS  (skip if drawers fill the front)
  // ============================================================
  if (doorCount > 0 && drawerCount === 0) {
    const doorH = H - (isFrameless ? tkHeight + bottomClearance : tkHeight) - topClearance;

    const centerGap = g;
    const sideRev = reveals.side;

    let doorWidths = [];
    if (doorCount === 1) {
      doorWidths.push(W - 2 * sideRev);
    } else {
      const eachDoor = (W - 2 * sideRev - centerGap) / 2;
      doorWidths.push(eachDoor, eachDoor);
    }

    let doorHingeSides;
    if (doorCount === 1) {
      doorHingeSides = [cabinet.doors.hingeSide === 'both' ? 'left' : cabinet.doors.hingeSide];
    } else {
      doorHingeSides = ['left', 'right'];
    }

    for (let i = 0; i < doorCount; i++) {
      const dw = doorWidths[i];
      const dh = doorH;
      if (dw <= 0 || dh <= 0) continue;

      const hingeSide = doorHingeSides[i];

      // Position doors at front of cabinet
      const isLeftDoor = i === 0;
      let doorPosX;
      if (doorCount === 1) {
        doorPosX = W / 2;
      } else {
        const leftDoorX = sideRev + doorWidths[0] / 2;
        const rightDoorX = W - sideRev - doorWidths[1] / 2;
        doorPosX = isLeftDoor ? leftDoorX : rightDoorX;
      }

      // For frameless: door front face is flush with front of box
      // For overlay: door sits at Z = -Td (door thickness extends forward from front)
      // Actually, the door is mounted ON the front of the box
      // The door's back face is at Z = 0 (front of box)
      // The door extends from Z = -Td to Z = 0
      const doorPosZ = -Td / 2;

      const doorY = (isFrameless || tkHeight > 0 ? tkHeight + bottomClearance : 0) + dh / 2;

      const panel = makePanel({
        id: `door-${i + 1}`,
        name: `Door ${i + 1}`,
        type: 'door',
        color: doorColor,
        materialLabel: doorMaterialLabel,
        cutWidth: dw,
        cutHeight: dh,
        cutThickness: Td,
        posX: doorPosX,
        posY: doorY,
        posZ: doorPosZ,
        sizeX: dw,
        sizeY: dh,
        sizeZ: Td,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      });

      // Hinge cup bores (a lift front has none)
      const hingePositions = hingePositionsFor(cabinet, dh);

      for (const hy of hasLift ? [] : hingePositions) {
        let hx;
        if (hingeSide === 'left') {
          hx = hingeBoreInset;
        } else {
          hx = dw - hingeBoreInset;
        }
        panel.holes.push({
          x: hx, y: hy,
          diameter: hingeBoreDia,
          purpose: 'hinge-cup',
        });
        for (const dowel of hingeDrilling.dowels) {
          panel.holes.push({
            x: hingeSide === 'left' ? hx + dowel.dx : hx - dowel.dx,
            y: hy + dowel.dy,
            diameter: dowel.diameter,
            purpose: 'hinge-dowel',
          });
        }
      }

      const handleCenterX = hingeSide === 'left' ? dw - handleEdgeOffset : handleEdgeOffset;
      addVerticalHandleHoles(panel, handleCenterX, doorHandleHeight);

      panels.push(panel);
      panel.hingeSide = hingeSide;
      if (hasLift) {
        panel.liftFront = true;
        panel.hingeCount = 0;
      }
    }
  }

  // ============================================================
  // DRAWER FRONTS
  // ============================================================
  if (drawerCount > 0 && cabinet.drawers.heights.length === drawerCount) {
    // Drawer bank sits below the top clearance, above the bottom
    // Opening height for drawer bank = same as door opening height
    const drawerBankH = H - (isFrameless ? tkHeight + bottomClearance : tkHeight) - topClearance;
    const sumHeights = cabinet.drawers.heights.reduce((a, b) => a + b, 0);
    const interDrawerGaps = (drawerCount - 1) * g;

    if (Math.abs(sumHeights + interDrawerGaps - drawerBankH) < 1) {
      const drawerW = W - g;

      const drawerBoxColor = 0xE4ECF8;
      const drawerSideThk = cabinet.drawers.sideThickness ?? 12;
      const drawerBackThk = cabinet.drawers.sideThickness ?? 12;
      const drawerBottomThk = cabinet.drawers.bottomThickness ?? 6;
      const drawerClr = drawerFitting?.kind === 'wood-runner'
        ? drawerFitting.clearancePerSide(drawerSideThk)
        : (cabinet.drawers.sideClearance ?? 10);
      const drawerBoxTopInset = 24;
      const drawerBoxBottomInset = 12;
      const drawerDepth = fittedDrawerDepth ?? Math.max(50, sideDepth - ffDepthOff - 20);
      const interW = W - 2 * T;

      let yOffset = isFrameless || tkHeight > 0 ? tkHeight + bottomClearance : 0;
      for (let i = 0; i < drawerCount; i++) {
        const dh = cabinet.drawers.heights[i];
        const dy = yOffset + dh / 2;
        const boxH = Math.max(30, dh - drawerBoxTopInset - drawerBoxBottomInset);
        const boxY = yOffset + drawerBoxBottomInset + boxH / 2;
        const drawerFrontZ = -Tdf / 2;
        const boxStartZ = ffDepthOff;
        const boxCenterZ = boxStartZ + drawerDepth / 2;
        const slideHoleInset = Math.min(64, Math.max(20, drawerDepth * 0.18));
        const slideHoleXs = [slideHoleInset, drawerDepth / 2, drawerDepth - slideHoleInset];
        const slideCenterY = boxH / 2;
        const makeSlideReferenceHoles = () => slideHoleXs.map(x => ({
          x,
          y: slideCenterY,
          diameter: 3,
          purpose: 'drawer-slide-reference',
        }));

        // Drawer front
        panels.push(makePanel({
          id: `drawer-${i + 1}`,
          name: `Drawer Front ${i + 1}`,
          type: 'drawer',
          color: doorColor,
          materialLabel: drawerFrontMaterialLabel,
          cutWidth: drawerW,
          cutHeight: dh,
          cutThickness: Tdf,
          posX: W / 2,
          posY: dy,
          posZ: drawerFrontZ,
          sizeX: drawerW,
          sizeY: dh,
          sizeZ: Tdf,
          edgeBanding: { top: true, bottom: true, left: true, right: true },
        }));
        const drawerFrontPanel = panels[panels.length - 1];
        addHorizontalHandleHoles(drawerFrontPanel, drawerW / 2, dh - drawerHandleTopOffset);
        drawerFrontPanel.drawDepth = drawerDepth;

        if (drawerFitting?.kind === 'metal-box') {
          panels.push(...buildMetalBoxPanels({
            idPrefix: `drawer-${i + 1}`,
            namePrefix: `Drawer ${i + 1}`,
            model: drawerFitting,
            centerX: W / 2,
            zStart: boxStartZ,
            yBottom: boxY - boxH / 2,
            woodLabel: drawerBoxMaterialLabel,
            color: drawerBoxColor,
          }));
        }

        // Drawer left side
        const sideW = drawerFitting?.kind === 'metal-box' ? 0 : interW - 2 * drawerClr - 2 * drawerSideThk;
        if (sideW > 0) {
          panels.push(makePanel({
            id: `drawer-${i + 1}-side-left`,
            name: `Drawer ${i + 1} Left Side`,
            type: 'drawer-box',
            color: drawerBoxColor,
            materialLabel: drawerBoxMaterialLabel,
            cutWidth: drawerDepth,
            cutHeight: boxH,
            cutThickness: drawerSideThk,
            posX: T + drawerClr + drawerSideThk / 2,
            posY: boxY,
            posZ: boxCenterZ,
            sizeX: drawerSideThk,
            sizeY: boxH,
            sizeZ: drawerDepth,
            holes: makeSlideReferenceHoles(),
            edgeBanding: { top: true, bottom: false, left: false, right: false },
          }));

          // Drawer right side
          panels.push(makePanel({
            id: `drawer-${i + 1}-side-right`,
            name: `Drawer ${i + 1} Right Side`,
            type: 'drawer-box',
            color: drawerBoxColor,
            materialLabel: drawerBoxMaterialLabel,
            cutWidth: drawerDepth,
            cutHeight: boxH,
            cutThickness: drawerSideThk,
            posX: W - T - drawerClr - drawerSideThk / 2,
            posY: boxY,
            posZ: boxCenterZ,
            sizeX: drawerSideThk,
            sizeY: boxH,
            sizeZ: drawerDepth,
            holes: makeSlideReferenceHoles(),
            edgeBanding: { top: true, bottom: false, left: false, right: false },
          }));

          // Drawer back
          const backW = interW - 2 * drawerClr - 2 * drawerSideThk;
          if (backW > 0) {
            panels.push(makePanel({
              id: `drawer-${i + 1}-back`,
              name: `Drawer ${i + 1} Back`,
              type: 'drawer-box',
              color: drawerBoxColor,
              materialLabel: drawerBoxMaterialLabel,
              cutWidth: backW,
              cutHeight: boxH,
              cutThickness: drawerBackThk,
              posX: W / 2,
              posY: boxY,
              posZ: boxStartZ + drawerDepth - drawerBackThk / 2,
              sizeX: backW,
              sizeY: boxH,
              sizeZ: drawerBackThk,
              edgeBanding: { top: false, bottom: false, left: false, right: false },
            }));
          }

          // Drawer bottom
          const bottomW = interW - 2 * drawerClr - 2 * drawerSideThk;
          if (bottomW > 0 && drawerDepth > 0) {
            panels.push(makePanel({
              id: `drawer-${i + 1}-bottom`,
              name: `Drawer ${i + 1} Bottom`,
              type: 'drawer-box',
              color: drawerBoxColor,
              materialLabel: drawerBoxMaterialLabel,
              cutWidth: bottomW,
              cutHeight: drawerDepth,
              cutThickness: drawerBottomThk,
              posX: W / 2,
              posY: boxY - boxH / 2 + drawerBottomThk / 2,
              posZ: boxCenterZ,
              sizeX: bottomW,
              sizeY: drawerBottomThk,
              sizeZ: drawerDepth,
              edgeBanding: { top: false, bottom: false, left: false, right: false },
            }));
          }
        }

        yOffset += dh + g;
      }
    }
  }

  return panels;
}

function faceFrameOpenings(cabinet) {
  const ffw = cabinet.materials.faceFrameWidth;
  const innerW = cabinet.width - 2 * ffw;
  return { innerW };
}

/**
 * Validate a cabinet config, returning array of warning strings.
 */
export function validateCabinet(cabinet) {
  const warnings = [];
  const T = cabinet.materials.caseThickness;
  const Td = cabinet.materials.doorThickness;
  const nesting = cabinet.nesting || {};
  const frontMode = inferFrontMode(cabinet);
  const doorCount = frontMode === 'doors' ? (cabinet.doors?.count ?? 0) : 0;
  const drawerCount = frontMode === 'drawers' ? (cabinet.drawers?.count ?? 0) : 0;

  if (cabinet.width < 100) warnings.push('Width too small (min ~100mm)');
  if (cabinet.height < 100) warnings.push('Height too small (min ~100mm)');
  if (cabinet.depth < 50) warnings.push('Depth too small (min ~50mm)');
  if (T <= 0) warnings.push('Case thickness must be positive');
  if (Td <= 0) warnings.push('Door thickness must be positive');
  if ((nesting.sheetWidth ?? 0) <= 0) warnings.push('Sheet width must be positive');
  if ((nesting.sheetHeight ?? 0) <= 0) warnings.push('Sheet height must be positive');
  if (((nesting.gap ?? nesting.kerf) ?? 0) < 0) warnings.push('Nesting gap cannot be negative');

  if (cabinet.construction === 'frameless') {
    if (cabinet.depth - Td < 0) warnings.push('Depth minus door thickness is negative — adjust depth or door thickness');
  }

  if (doorCount === 2 && cabinet.width < 500) {
    warnings.push('Cabinet width may be too narrow for double doors (min ~500mm recommended)');
  }

  if (drawerCount > 0) {
    const dh = cabinet.drawers.heights;
    if (dh.length !== drawerCount) {
      warnings.push('Number of drawer heights must match drawer count');
    } else {
      const g = cabinet.reveal ?? DEFAULT_VALUES.reveal;
      const sumH = dh.reduce((a, b) => a + b, 0);
      const interGaps = (drawerCount - 1) * g;
      const rv = resolveReveals(cabinet);
      const expectedH = cabinet.height - resolveToeKick(cabinet).height - rv.top - rv.bottom;
      if (Math.abs(sumH + interGaps - expectedH) > 2) {
        warnings.push(`Drawer heights sum to ${sumH + interGaps}mm but opening height is ${expectedH}mm (diff ${Math.abs(sumH + interGaps - expectedH).toFixed(1)}mm)`);
      }
    }
  }

  return warnings;
}
