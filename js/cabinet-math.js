// cabinet-math.js — Pure function: Cabinet config → Panel[]
// No UI, no three.js — unit-testable in isolation.

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

export function inferFrontMode(cabinet) {
  const explicitMode = cabinet?.front?.mode;
  if (explicitMode === 'doors' || explicitMode === 'drawers') return explicitMode;
  if ((cabinet?.drawers?.count ?? 0) > 0) return 'drawers';
  return 'doors';
}

export function defaultCabinet() {
  return {
    id: 'cabinet-1',
    category: 'base',
    front: { mode: 'doors' },
    construction: 'frameless',
    width: 800,
    height: 720,
    depth: 560,
    hasTop: false,
    backMount: 'grooved-in',
    toeKick: { height: 100, setback: 75 },
    doors: { count: 2, hingeSide: 'both' },
    drawers: { count: 0, heights: [], sideClearance: 10, sideThickness: 12, bottomThickness: 6 },
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
    },
    shelves: { count: 1, thickness: null },
    overlay: { type: 'full-overlay', amount: 18 },
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
    },
    nesting: {
      sheetWidth: 2440,
      sheetHeight: 1220,
      gap: 3.2,
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
  const g = cabinet.reveal ?? DEFAULT_VALUES.reveal;
  const O = cabinet.overlay.type === 'inset' ? 0 : cabinet.overlay.amount;
  const isFrameless = cabinet.construction === 'frameless';
  const isInset = cabinet.overlay.type === 'inset';

  const tkHeight = cabinet.category === 'base' && cabinet.toeKick ? cabinet.toeKick.height : 0;
  const tkSetback = cabinet.category === 'base' && cabinet.toeKick ? cabinet.toeKick.setback : 0;
  const bottomY = tkHeight;

  const hw = cabinet.hardware;
  const hingeBoreDia = hw.hingeBoreDiameter ?? DEFAULT_VALUES.hingeBoreDiameter;
  const hingeBoreInset = hw.hingeBoreInset ?? DEFAULT_VALUES.hingeBoreInset;
  const pinSpacing = hw.shelfPinSpacing ?? DEFAULT_VALUES.shelfPinSpacing;
  const pinSetback = hw.shelfPinSetback ?? DEFAULT_VALUES.shelfPinSetback;
  const hingePlateFrontHoleOffset = hw.hingePlateFrontHoleOffset ?? DEFAULT_VALUES.hingePlateFrontHoleOffset;
  const hingePlateRearHoleOffset = hw.hingePlateRearHoleOffset ?? DEFAULT_VALUES.hingePlateRearHoleOffset;
  const hingePlateHoleSpacing = hw.hingePlateHoleSpacing ?? DEFAULT_VALUES.hingePlateHoleSpacing;
  const handleHoleSpacing = hw.handleHoleSpacing ?? DEFAULT_VALUES.handleHoleSpacing;
  const handleEdgeOffset = hw.handleEdgeOffset ?? DEFAULT_VALUES.handleEdgeOffset;
  const doorHandleHeight = hw.doorHandleHeight ?? DEFAULT_VALUES.doorHandleHeight;
  const drawerHandleTopOffset = hw.drawerHandleTopOffset ?? DEFAULT_VALUES.drawerHandleTopOffset;
  const topClearance = DEFAULT_VALUES.topClearance;
  const stretcherDepth = DEFAULT_VALUES.stretcherDepth;
  const grooveDepth = DEFAULT_VALUES.backGrooveDepth;

  const W = cabinet.width;
  const H = cabinet.height;
  const D = cabinet.depth;
  const frontMode = inferFrontMode(cabinet);
  const drawerCount = frontMode === 'drawers' ? (cabinet.drawers?.count ?? 0) : 0;
  const doorCount = frontMode === 'doors' ? (cabinet.doors?.count ?? 0) : 0;
  const shelfCount = frontMode === 'doors' ? (cabinet.shelves?.count ?? 0) : 0;

  const sideDepth = isInset ? D : Math.max(0, D - Td);
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
    if (handleHoleSpacing <= 0) return;
    const halfSpacing = handleHoleSpacing / 2;
    panel.holes.push(
      { x: centerX - halfSpacing, y: centerY, diameter: 5, purpose: 'handle' },
      { x: centerX + halfSpacing, y: centerY, diameter: 5, purpose: 'handle' },
    );
  }

  function addVerticalHandleHoles(panel, centerX, centerY) {
    if (handleHoleSpacing <= 0) return;
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
      const drawerDepth = Math.max(50, sideDepth - ffDepthOff - 20);
      const slideHoleInset = Math.min(64, Math.max(20, drawerDepth * 0.18));
      const slideHoleXs = [slideHoleInset, drawerDepth / 2, drawerDepth - slideHoleInset];
      let drawerYOffset = isFrameless || tkHeight > 0 ? tkHeight + topClearance : 0;
      for (let i = 0; i < drawerCount; i++) {
        const dh = cabinet.drawers.heights[i];
        const boxH = Math.max(30, dh - drawerBoxTopInset - drawerBoxBottomInset);
        const slideCenterY = drawerYOffset + drawerBoxBottomInset + boxH / 2;
        for (const x of slideHoleXs) {
          panel.holes.push({ x, y: slideCenterY, diameter: 3, purpose: 'drawer-runner-reference' });
        }
        drawerYOffset += dh + g;
      }
    } else if (shelfCount > 0 && sideCutDepth > pinSetback * 2) {
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
    if (doorCount > 0 && drawerCount === 0) {
      const hingeSide = cabinet.doors.hingeSide ?? 'both';
      const needsHingePlates = hingeSide === 'both' || hingeSide === side;
      if (needsHingePlates) {
        const doorBottomY = isFrameless || tkHeight > 0 ? tkHeight + topClearance : 0;
        const doorH = H - (isFrameless ? tkHeight + topClearance : tkHeight) - topClearance;
        const hingeCount = H > 1300 ? 3 : 2;
        const hingeVertPositions = hingeCount === 2 ? [100, doorH - 100] : [100, doorH / 2, doorH - 100];
        const hingePlateDepths = [hingePlateFrontHoleOffset, hingePlateRearHoleOffset];
        const hingePlateVerticalOffset = hingePlateHoleSpacing / 2;
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
    const shelfThk = cabinet.shelves?.thickness ?? T;
    const shelfW = W - 2 * T;
    const shelfD = sideDepth - ffDepthOff;
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
            posZ: ffDepthOff + shelfD / 2,
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
        materialLabel: caseMaterialLabel,
        cutWidth: kickW,
        cutHeight: tkHeight,
        cutThickness: T,
        posX: W / 2,
        posY: tkHeight / 2,
        posZ: tkSetback + T / 2,
        sizeX: kickW,
        sizeY: tkHeight,
        sizeZ: T,
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
    const bottomRailY = cabinet.category === 'base' ? tkHeight + bottomRailW / 2 : bottomRailW / 2;
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
    const doorH = H - (isFrameless ? tkHeight + topClearance : tkHeight) - topClearance;

    const centerGap = g;

    let doorWidths = [];
    if (doorCount === 1) {
      doorWidths.push(W - g);
    } else {
      const eachDoor = (W - g - centerGap) / 2;
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
        const leftDoorX = g / 2 + doorWidths[0] / 2;
        const rightDoorX = W - g / 2 - doorWidths[1] / 2;
        doorPosX = isLeftDoor ? leftDoorX : rightDoorX;
      }

      // For frameless: door front face is flush with front of box
      // For overlay: door sits at Z = -Td (door thickness extends forward from front)
      // Actually, the door is mounted ON the front of the box
      // The door's back face is at Z = 0 (front of box)
      // The door extends from Z = -Td to Z = 0
      const doorPosZ = -Td / 2;

      const doorY = (isFrameless || tkHeight > 0 ? tkHeight + topClearance : 0) + dh / 2;

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

      // Hinge cup bores
      const hingeCount = dh > 1300 ? 3 : 2;
      const hingePositions = hingeCount === 2
        ? [100, dh - 100]
        : [100, dh / 2, dh - 100];

      for (const hy of hingePositions) {
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
      }

      const handleCenterX = hingeSide === 'left' ? dw - handleEdgeOffset : handleEdgeOffset;
      addVerticalHandleHoles(panel, handleCenterX, doorHandleHeight);

      panels.push(panel);
      panel.hingeSide = hingeSide;
    }
  }

  // ============================================================
  // DRAWER FRONTS
  // ============================================================
  if (drawerCount > 0 && cabinet.drawers.heights.length === drawerCount) {
    // Drawer bank sits below the top clearance, above the bottom
    // Opening height for drawer bank = same as door opening height
    const drawerBankH = H - (isFrameless ? tkHeight + topClearance : tkHeight) - topClearance;
    const sumHeights = cabinet.drawers.heights.reduce((a, b) => a + b, 0);
    const interDrawerGaps = (drawerCount - 1) * g;

    if (Math.abs(sumHeights + interDrawerGaps - drawerBankH) < 1) {
      const drawerW = W - g;

      const drawerBoxColor = 0xE4ECF8;
      const drawerSideThk = cabinet.drawers.sideThickness ?? 12;
      const drawerBackThk = cabinet.drawers.sideThickness ?? 12;
      const drawerBottomThk = cabinet.drawers.bottomThickness ?? 6;
      const drawerClr = cabinet.drawers.sideClearance ?? 10;
      const drawerBoxTopInset = 24;
      const drawerBoxBottomInset = 12;
      const drawerDepth = Math.max(50, sideDepth - ffDepthOff - 20);
      const interW = W - 2 * T;

      let yOffset = isFrameless || tkHeight > 0 ? tkHeight + topClearance : 0;
      for (let i = 0; i < drawerCount; i++) {
        const dh = cabinet.drawers.heights[i];
        const dy = yOffset + dh / 2;
        const boxH = Math.max(30, dh - drawerBoxTopInset - drawerBoxBottomInset);
        const boxY = yOffset + drawerBoxBottomInset + boxH / 2;
        const drawerFrontZ = -Td / 2;
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
          cutThickness: Td,
          posX: W / 2,
          posY: dy,
          posZ: drawerFrontZ,
          sizeX: drawerW,
          sizeY: dh,
          sizeZ: Td,
          edgeBanding: { top: true, bottom: true, left: true, right: true },
        }));
        const drawerFrontPanel = panels[panels.length - 1];
        addHorizontalHandleHoles(drawerFrontPanel, drawerW / 2, dh - drawerHandleTopOffset);
        drawerFrontPanel.drawDepth = drawerDepth;

        // Drawer left side
        const sideW = interW - 2 * drawerClr - 2 * drawerSideThk;
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
      const expectedH = cabinet.height - (cabinet.category === 'base' && cabinet.toeKick ? cabinet.toeKick.height : 0) - DEFAULT_VALUES.topClearance - DEFAULT_VALUES.topClearance;
      if (Math.abs(sumH + interGaps - expectedH) > 2) {
        warnings.push(`Drawer heights sum to ${sumH + interGaps}mm but opening height is ${expectedH}mm (diff ${Math.abs(sumH + interGaps - expectedH).toFixed(1)}mm)`);
      }
    }
  }

  return warnings;
}
