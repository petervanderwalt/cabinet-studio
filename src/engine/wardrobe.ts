// Wardrobe / bedroom cupboard geometry: sectioned runs (hanging rails, shelves, internal drawers)
// with hinged, sliding or open fronts, optionally as an L (corner) or U (walk-in) layout.
import type { CabinetConfig, Hole, Panel, Rect, WardrobeSection } from '../types';
import { resolveHingeDrilling } from '../fittings/hingeDrilling';
import { resolveDrawerFitting } from '../fittings/drawerModel';
import { buildMetalBoxPanels } from './drawerBox';
import { hingePositionsFor, resolveReveals, resolveToeKick } from './cabinet-math.js';

const CASE_COLOR = 0xb7c8e6;
const DOOR_COLOR = 0xf7faff;
const BACK_COLOR = 0x90a8cc;
const SHELF_COLOR = 0xd6e1f2;
const DRAWER_BOX_COLOR = 0xe4ecf8;
const SHEET_BACK_MAX = 1200;

type RunKind = 'A' | 'B' | 'C';

interface RunSpec {
  kind: RunKind;
  length: number;
  sections: WardrobeSection[];
}

interface Run {
  panels: Panel[];
  /** Furthest +z extent of the run (the outer face of the back). */
  zMax: number;
}

interface Result {
  panels: Panel[];
  warnings: string[];
}

interface PanelInit extends Partial<Panel> {
  id: string;
  name: string;
  type: string;
  cutWidth: number;
  cutHeight: number;
  cutThickness: number;
  posX: number;
  posY: number;
  posZ: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

function makePanel(init: PanelInit): Panel {
  return {
    color: CASE_COLOR,
    holes: [],
    notches: [],
    grooves: [],
    edgeBanding: { top: false, bottom: false, left: false, right: false },
    ...init,
  };
}

const frontEdge = { top: false, bottom: false, left: false, right: true };
const allEdges = { top: true, bottom: true, left: true, right: true };

/** Interior x-ranges (between the side panels / dividers) for each section. */
function layoutSections(length: number, T: number, dividerT: number, sections: WardrobeSection[], warnings: string[], label: string) {
  const count = sections.length;
  const available = length - 2 * T - Math.max(0, count - 1) * dividerT;
  const fixed = sections.reduce((sum, s) => sum + (s.width > 0 ? s.width : 0), 0);
  const autoCount = sections.filter((s) => !(s.width > 0)).length;
  let widths: number[];
  if (autoCount === 0 && Math.abs(fixed - available) > 1) {
    warnings.push(`${label}section widths total ${fixed}mm but the interior is ${available.toFixed(0)}mm wide; they were scaled to fit`);
    widths = sections.map((s) => (s.width / fixed) * available);
  } else if (fixed > available) {
    warnings.push(`${label}fixed section widths (${fixed}mm) exceed the interior width (${available.toFixed(0)}mm)`);
    widths = sections.map((s) => (s.width > 0 ? (s.width / fixed) * available : 0));
  } else {
    const auto = autoCount > 0 ? (available - fixed) / autoCount : 0;
    widths = sections.map((s) => (s.width > 0 ? s.width : auto));
  }
  const ranges: { x0: number; x1: number }[] = [];
  let x = T;
  widths.forEach((w, i) => {
    ranges.push({ x0: x, x1: x + w });
    x += w + (i < count - 1 ? dividerT : 0);
  });
  return ranges;
}

function buildRun(cfg: CabinetConfig, spec: RunSpec, warnings: string[]): Run {
  const w = cfg.wardrobe;
  const m = cfg.materials;
  const hw = cfg.hardware;
  const L = spec.length;
  const H = cfg.height;
  const D = cfg.depth;
  const T = m.caseThickness;
  const Tb = m.backThickness;
  const Td = m.doorThickness;
  const Tdf = m.drawerFrontThickness ?? Td;
  const Tdiv = m.dividerThickness ?? T;
  const Tsh = cfg.shelves?.thickness ?? m.shelfThickness ?? T;
  const Tsl = m.slidingDoorThickness ?? Td;
  const fronts = w.fronts;
  const rv = resolveReveals(cfg);
  const g = rv.gap;
  const tk = resolveToeKick(cfg);
  const tkH = tk.height;
  const prefix = spec.kind === 'A' ? '' : `leg${spec.kind}-`;
  const namePrefix = spec.kind === 'A' ? '' : `Leg ${spec.kind} `;
  const label = spec.kind === 'A' ? '' : `Leg ${spec.kind}: `;
  const walkIn = w.layout === 'walk-in';
  const slidingGap = 6;
  const frontZone = fronts === 'hinged' ? Td : fronts === 'sliding' ? 2 * Tsl + slidingGap : 0;
  const sideDepth = Math.max(0, D - frontZone);
  const hasBack = !walkIn;
  const hasTop = !walkIn;
  const handleType = hw.handleType ?? 'bar';
  const pinSpacing = hw.shelfPinSpacing ?? 32;
  const pinSetback = hw.shelfPinSetback ?? 80;
  const fixedShelves = Boolean(cfg.shelves?.fixed);
  const shelfInset = Math.max(0, Number(cfg.shelves?.inset) || 0);
  const caseLabel = m.caseMaterial;
  const dividerLabel = m.dividerMaterial || caseLabel;
  const shelfLabel = m.shelfMaterial || caseLabel;
  const plinthLabel = m.plinthMaterial || caseLabel;
  const plinthT = m.plinthThickness ?? T;

  const panels: Panel[] = [];
  const yIn0 = tkH + T;
  const yIn1 = H - T;
  const interiorH = yIn1 - yIn0;
  const ranges = layoutSections(L, T, Tdiv, spec.sections, warnings, label);

  // Boundary panels hold the pin / rail / runner holes for the sections next to them.
  const boundaries: Panel[] = [];

  // ---- Sides ----
  for (const side of ['left', 'right'] as const) {
    const isLeft = side === 'left';
    const notches: Rect[] = tkH > 0 ? [{ x: 0, y: 0, width: Math.max(0, tk.setback), height: tkH }] : [];
    const panel = makePanel({
      id: `${prefix}side-${side}`,
      name: `${namePrefix}${isLeft ? 'Left Side' : 'Right Side'}`,
      type: 'case',
      materialLabel: caseLabel,
      cutWidth: sideDepth,
      cutHeight: H,
      cutThickness: T,
      posX: isLeft ? T / 2 : L - T / 2,
      posY: H / 2,
      posZ: sideDepth / 2,
      sizeX: T,
      sizeY: H,
      sizeZ: sideDepth,
      notches,
      edgeBanding: frontEdge,
      leg: spec.kind,
    });
    boundaries.push(panel);
    panels.push(panel);
  }
  const [leftSide, rightSide] = boundaries;

  // ---- Bottom / top ----
  const innerW = L - 2 * T;
  if (innerW > 0 && sideDepth > 0) {
    panels.push(makePanel({
      id: `${prefix}bottom`, name: `${namePrefix}Bottom`, type: 'case', materialLabel: caseLabel,
      cutWidth: innerW, cutHeight: sideDepth, cutThickness: T,
      posX: L / 2, posY: tkH + T / 2, posZ: sideDepth / 2, sizeX: innerW, sizeY: T, sizeZ: sideDepth,
      edgeBanding: frontEdge, leg: spec.kind,
    }));
    if (hasTop) {
      panels.push(makePanel({
        id: `${prefix}top`, name: `${namePrefix}Top`, type: 'case', materialLabel: caseLabel,
        cutWidth: innerW, cutHeight: sideDepth, cutThickness: T,
        posX: L / 2, posY: H - T / 2, posZ: sideDepth / 2, sizeX: innerW, sizeY: T, sizeZ: sideDepth,
        edgeBanding: frontEdge, leg: spec.kind,
      }));
    }
  }

  // ---- Toe kick ----
  if (tkH > 0 && innerW > 0) {
    panels.push(makePanel({
      id: `${prefix}toe-kick`, name: `${namePrefix}Toe Kick`, type: 'toe-kick', materialLabel: plinthLabel,
      cutWidth: innerW, cutHeight: tkH, cutThickness: plinthT,
      posX: L / 2, posY: tkH / 2, posZ: tk.setback + plinthT / 2, sizeX: innerW, sizeY: tkH, sizeZ: plinthT,
      edgeBanding: frontEdge, leg: spec.kind,
    }));
  }

  // ---- Back (split to suit sheet width) ----
  if (hasBack) {
    const backH = H - tkH;
    const parts = Math.max(1, Math.ceil(L / SHEET_BACK_MAX));
    const partW = L / parts;
    for (let i = 0; i < parts; i += 1) {
      panels.push(makePanel({
        id: `${prefix}back${parts > 1 ? `-${i + 1}` : ''}`,
        name: `${namePrefix}Back Panel${parts > 1 ? ` ${i + 1}` : ''}`,
        type: 'back', color: BACK_COLOR, materialLabel: m.backMaterial,
        cutWidth: partW, cutHeight: backH, cutThickness: Tb,
        posX: partW * (i + 0.5), posY: tkH + backH / 2, posZ: sideDepth + Tb / 2,
        sizeX: partW, sizeY: backH, sizeZ: Tb, leg: spec.kind,
      }));
    }
  }

  // ---- Dividers ----
  for (let i = 0; i < ranges.length - 1; i += 1) {
    const x = ranges[i].x1 + Tdiv / 2;
    const divider = makePanel({
      id: `${prefix}divider-${i + 1}`, name: `${namePrefix}Divider ${i + 1}`, type: 'case', materialLabel: dividerLabel,
      cutWidth: sideDepth, cutHeight: interiorH, cutThickness: Tdiv,
      posX: x, posY: yIn0 + interiorH / 2, posZ: sideDepth / 2, sizeX: Tdiv, sizeY: interiorH, sizeZ: sideDepth,
      edgeBanding: frontEdge, noMarkers: true, leg: spec.kind,
    });
    panels.push(divider);
    boundaries.push(divider);
  }
  // boundary of section i: left = i===0 ? leftSide : divider i-1; right = i===last ? rightSide : divider i
  const dividerPanels = boundaries.slice(2);
  const leftOf = (i: number) => (i === 0 ? leftSide : dividerPanels[i - 1]);
  const rightOf = (i: number) => (i === ranges.length - 1 ? rightSide : dividerPanels[i]);
  const addHole = (panel: Panel, hole: Hole) => {
    // Right side panels are mirrored so their inside face reads front-to-back like the left one.
    const y = hole.y - (panel.posY - panel.sizeY / 2);
    panel.holes!.push(panel === rightSide ? { ...hole, y, x: sideDepth - hole.x } : { ...hole, y });
  };

  // ---- Section contents ----
  let drawerNumber = 0;
  const hasFrontCover = fronts !== 'open';
  const hangZone = (rails: number) => (rails >= 2 ? 2 * w.halfHangHeight : rails === 1 ? w.hangingHeight : 0);

  spec.sections.forEach((section, i) => {
    const { x0, x1 } = ranges[i];
    const secW = x1 - x0;
    if (secW <= 0) return;
    const left = leftOf(i);
    const right = rightOf(i);
    const sectionLabel = `${label}section ${i + 1} `;

    // Drawers (stack from the bottom)
    const drawerH = w.drawerHeight;
    const drawerCount = Math.max(0, Math.trunc(section.drawers));
    let drawersTop = yIn0;
    if (drawerCount > 0) {
      const sideT = cfg.drawers.sideThickness ?? 12;
      const bottomT = cfg.drawers.bottomThickness ?? 6;
      const frontZ = hasFrontCover ? 2 + Tdf / 2 : -Tdf / 2;
      const boxStartZ = hasFrontCover ? 2 + Tdf : 0;
      const drawerFitting = resolveDrawerFitting(cfg.fittings?.drawerSystem, { LW: secW, availableDepth: sideDepth - boxStartZ });
      const slideClr = drawerFitting?.kind === 'wood-runner' ? drawerFitting.clearancePerSide!(sideT) : cfg.drawers.sideClearance ?? 10;
      const fittedDepth = drawerFitting ? (drawerFitting.kind === 'wood-runner' ? drawerFitting.boxLength : drawerFitting.nominalLength) : null;
      const boxDepth = fittedDepth ?? Math.max(50, sideDepth - boxStartZ - 20);
      const boxTopInset = 24;
      const boxBottomInset = 12;
      const slideInset = Math.min(64, Math.max(20, boxDepth * 0.18));
      const slideXs = [boxStartZ + slideInset, boxStartZ + boxDepth / 2, boxStartZ + boxDepth - slideInset];
      for (let d = 0; d < drawerCount; d += 1) {
        drawerNumber += 1;
        const n = drawerNumber;
        const y0 = yIn0 + d * (drawerH + g);
        const boxH = Math.max(30, drawerH - boxTopInset - boxBottomInset);
        const boxY = y0 + boxBottomInset + boxH / 2;
        const frontW = secW - g;
        const front = makePanel({
          id: `${prefix}drawer-${n}`, name: `${namePrefix}Drawer Front ${n}`, type: 'drawer', color: DOOR_COLOR,
          materialLabel: m.drawerFrontMaterial, cutWidth: frontW, cutHeight: drawerH, cutThickness: Tdf,
          posX: (x0 + x1) / 2, posY: y0 + drawerH / 2, posZ: frontZ, sizeX: frontW, sizeY: drawerH, sizeZ: Tdf,
          edgeBanding: allEdges, leg: spec.kind, noMarkers: spec.kind !== 'A',
        });
        front.drawDepth = boxDepth;
        if (handleType === 'bar' && (hw.handleHoleSpacing ?? 96) > 0) {
          const half = (hw.handleHoleSpacing ?? 96) / 2;
          const hy = drawerH - (hw.drawerHandleTopOffset ?? 50);
          front.holes!.push(
            { x: frontW / 2 - half, y: hy, diameter: 5, purpose: 'handle' },
            { x: frontW / 2 + half, y: hy, diameter: 5, purpose: 'handle' },
          );
        } else if (handleType === 'knob') {
          front.holes!.push({ x: frontW / 2, y: drawerH - (hw.drawerHandleTopOffset ?? 50), diameter: 5, purpose: 'handle' });
        }
        panels.push(front);

        if (drawerFitting?.kind === 'metal-box') {
          panels.push(...buildMetalBoxPanels({
            idPrefix: `${prefix}drawer-${n}`,
            namePrefix: `${namePrefix}Drawer ${n}`,
            model: drawerFitting,
            centerX: (x0 + x1) / 2,
            zStart: boxStartZ,
            yBottom: boxY - boxH / 2,
            woodLabel: m.drawerBoxMaterial,
            leg: spec.kind,
          }));
        }
        const boxInnerW = drawerFitting?.kind === 'metal-box' ? 0 : secW - 2 * slideClr - 2 * sideT;
        if (boxInnerW > 0) {
          const slideHoles = () => slideXs.map((x): Hole => ({ x: x - boxStartZ, y: boxH / 2, diameter: 3, purpose: 'drawer-slide-reference' }));
          for (const side of ['left', 'right'] as const) {
            panels.push(makePanel({
              id: `${prefix}drawer-${n}-side-${side}`, name: `${namePrefix}Drawer ${n} ${side === 'left' ? 'Left' : 'Right'} Side`,
              type: 'drawer-box', color: DRAWER_BOX_COLOR, materialLabel: m.drawerBoxMaterial,
              cutWidth: boxDepth, cutHeight: boxH, cutThickness: sideT,
              posX: side === 'left' ? x0 + slideClr + sideT / 2 : x1 - slideClr - sideT / 2,
              posY: boxY, posZ: boxStartZ + boxDepth / 2, sizeX: sideT, sizeY: boxH, sizeZ: boxDepth,
              holes: slideHoles(), edgeBanding: { top: true, bottom: false, left: false, right: false },
              noMarkers: true, leg: spec.kind,
            }));
          }
          panels.push(makePanel({
            id: `${prefix}drawer-${n}-back`, name: `${namePrefix}Drawer ${n} Back`, type: 'drawer-box', color: DRAWER_BOX_COLOR,
            materialLabel: m.drawerBoxMaterial, cutWidth: boxInnerW, cutHeight: boxH, cutThickness: sideT,
            posX: (x0 + x1) / 2, posY: boxY, posZ: boxStartZ + boxDepth - sideT / 2,
            sizeX: boxInnerW, sizeY: boxH, sizeZ: sideT, leg: spec.kind,
          }));
          panels.push(makePanel({
            id: `${prefix}drawer-${n}-bottom`, name: `${namePrefix}Drawer ${n} Bottom`, type: 'drawer-box', color: DRAWER_BOX_COLOR,
            materialLabel: m.drawerBoxMaterial, cutWidth: boxInnerW, cutHeight: boxDepth, cutThickness: bottomT,
            posX: (x0 + x1) / 2, posY: boxY - boxH / 2 + bottomT / 2, posZ: boxStartZ + boxDepth / 2,
            sizeX: boxInnerW, sizeY: bottomT, sizeZ: boxDepth, leg: spec.kind,
          }));
        }
        // Runner reference holes on the section's side faces
        for (const x of slideXs) {
          const hole: Hole = { x, y: y0 + boxBottomInset + boxH / 2, diameter: 3, purpose: 'drawer-runner-reference' };
          addHole(left, hole);
          addHole(right, hole);
        }
      }
      drawersTop = yIn0 + drawerCount * drawerH + (drawerCount - 1) * g + g;
    }

    // Hanging zone (top of the section)
    const zoneH = hangZone(section.rails);
    const zoneBottom = yIn1 - zoneH;
    if (section.rails > 0) {
      if (zoneBottom < drawersTop) {
        warnings.push(`${sectionLabel}hanging space (${zoneH}mm) does not fit above its drawers; reduce the hanging height or drawers`);
      }
      const railCount = Math.min(2, section.rails);
      for (let r = 0; r < railCount; r += 1) {
        const railY = yIn1 - w.railDrop - r * w.halfHangHeight;
        const rail = makePanel({
          id: `${prefix}rail-${i + 1}-${r + 1}`, name: `${namePrefix}Rail ${i + 1}.${r + 1}`, type: 'rail',
          color: 0xb9bfc8, materialLabel: 'Aluminium rail', cutWidth: secW, cutHeight: w.railDiameter, cutThickness: w.railDiameter,
          posX: (x0 + x1) / 2, posY: railY, posZ: sideDepth / 2, sizeX: secW, sizeY: w.railDiameter, sizeZ: w.railDiameter,
          fabricate: false, noMarkers: true, leg: spec.kind,
        });
        rail.railLength = secW;
        panels.push(rail);
        for (const boundary of [left, right]) {
          addHole(boundary, { x: sideDepth / 2, y: railY - 16, diameter: 3, purpose: 'rail-bracket' });
          addHole(boundary, { x: sideDepth / 2, y: railY + 16, diameter: 3, purpose: 'rail-bracket' });
        }
      }
    }

    // Shelves between the drawers and the hanging zone
    const shelfCount = Math.max(0, Math.trunc(section.shelves));
    if (shelfCount > 0) {
      const base = drawersTop;
      const top = section.rails > 0 ? zoneBottom : yIn1;
      if (top - base < 80) {
        warnings.push(`${sectionLabel}has no room for its ${shelfCount} shelves`);
      } else {
        const spacing = (top - base) / (shelfCount + 1);
        const shelfD = sideDepth - shelfInset;
        for (let s = 0; s < shelfCount; s += 1) {
          const y = base + spacing * (s + 1);
          panels.push(makePanel({
            id: `${prefix}shelf-${i + 1}-${s + 1}`, name: `${namePrefix}Section ${i + 1} Shelf ${s + 1}`, type: 'shelf', color: SHELF_COLOR,
            materialLabel: shelfLabel, cutWidth: secW, cutHeight: shelfD, cutThickness: Tsh,
            posX: (x0 + x1) / 2, posY: y, posZ: shelfInset + shelfD / 2, sizeX: secW, sizeY: Tsh, sizeZ: shelfD,
            edgeBanding: frontEdge, leg: spec.kind,
          }));
        }
        if (!fixedShelves && sideDepth > pinSetback * 2) {
          const first = base + pinSpacing * 2;
          const last = top - pinSpacing;
          for (let y = first; y <= last + 0.001; y += pinSpacing) {
            for (const boundary of [left, right]) {
              addHole(boundary, { x: pinSetback, y, diameter: 5, purpose: 'shelf-pin' });
              addHole(boundary, { x: sideDepth - pinSetback, y, diameter: 5, purpose: 'shelf-pin' });
            }
          }
        }
      }
    }
  });

  // ---- Fronts ----
  const doorBottom = tkH + rv.bottom;
  const doorH = H - tkH - rv.top - rv.bottom;

  if (fronts === 'hinged' && doorH > 0) {
    // Returns get as many doors as they need to stay under ~600mm each.
    const count = spec.kind === 'A' ? Math.max(1, Math.min(8, Math.trunc(cfg.doors.count) || 2)) : Math.max(1, Math.ceil(L / 600));
    const doorW = (L - 2 * rv.side - (count - 1) * g) / count;
    if (doorW > 650) warnings.push(`${label}doors are ${doorW.toFixed(0)}mm wide; hinged doors over ~600mm tend to sag (use more doors)`);
    const hingeSides = Array.from({ length: count }, (_, i) =>
      count === 1 ? (cfg.doors.hingeSide === 'right' ? 'right' : 'left') : i % 2 === 0 ? (count % 2 === 1 && i === count - 1 ? 'right' : 'left') : 'right',
    );
    const dividerXs = dividerPanels.map((d) => d.posX);
    const plateXs = [leftSide.posX, ...dividerXs, rightSide.posX];
    const plateTargets = [leftSide, ...dividerPanels, rightSide];
    const hingeDrilling = resolveHingeDrilling(cfg);
    const plateSpacing = hingeDrilling.plateSpacing / 2;

    for (let i = 0; i < count; i += 1) {
      const x0 = rv.side + i * (doorW + g);
      const hingeSide = hingeSides[i];
      const mirror = cfg.doors.mirror;
      const mirrored = mirror === 'all' || (mirror === 'first' && i === 0) || (mirror === 'last' && i === count - 1);
      const door = makePanel({
        id: `${prefix}door-${i + 1}`, name: `${namePrefix}Door ${i + 1}`, type: 'door', color: DOOR_COLOR,
        materialLabel: m.doorMaterial, cutWidth: doorW, cutHeight: doorH, cutThickness: Td,
        posX: x0 + doorW / 2, posY: doorBottom + doorH / 2, posZ: -Td / 2, sizeX: doorW, sizeY: doorH, sizeZ: Td,
        edgeBanding: allEdges, leg: spec.kind, noMarkers: spec.kind !== 'A',
      });
      door.hingeSide = hingeSide as 'left' | 'right';
      door.openAngle = cfg.doors.openAngle;
      door.mirrored = mirrored;
      const positions = hingePositionsFor(cfg, doorH) as number[];
      door.hingeCount = positions.length;
      for (const hy of positions) {
        const cupX = hingeSide === 'left' ? hingeDrilling.cupInset : doorW - hingeDrilling.cupInset;
        door.holes!.push({ x: cupX, y: hy, diameter: hingeDrilling.cupDiameter, purpose: 'hinge-cup' });
        for (const dowel of hingeDrilling.dowels) {
          door.holes!.push({
            x: hingeSide === 'left' ? cupX + dowel.dx : cupX - dowel.dx,
            y: hy + dowel.dy,
            diameter: dowel.diameter,
            purpose: 'hinge-dowel',
          });
        }
      }
      const handleX = hingeSide === 'left' ? doorW - hw.handleEdgeOffset : hw.handleEdgeOffset;
      if (handleType === 'bar' && hw.handleHoleSpacing > 0) {
        const half = hw.handleHoleSpacing / 2;
        door.holes!.push(
          { x: handleX, y: hw.doorHandleHeight - half, diameter: 5, purpose: 'handle' },
          { x: handleX, y: hw.doorHandleHeight + half, diameter: 5, purpose: 'handle' },
        );
      } else if (handleType === 'knob') {
        door.holes!.push({ x: handleX, y: hw.doorHandleHeight, diameter: 5, purpose: 'handle' });
      }
      panels.push(door);

      // Hinge plates on the nearest side / divider
      const hingeEdge = hingeSide === 'left' ? x0 : x0 + doorW;
      let best = -1;
      let bestDist = Infinity;
      plateXs.forEach((px, idx) => {
        const dist = Math.abs(px - hingeEdge);
        if (dist < bestDist) { bestDist = dist; best = idx; }
      });
      if (best >= 0 && bestDist <= Math.max(T, 40) + 20) {
        const target = plateTargets[best];
        for (const hy of positions) {
          for (const depthOffset of hingeDrilling.plateOffsets) {
            addHole(target, { x: depthOffset, y: doorBottom + hy - plateSpacing, diameter: 5, purpose: 'hinge-mounting-plate' });
            addHole(target, { x: depthOffset, y: doorBottom + hy + plateSpacing, diameter: 5, purpose: 'hinge-mounting-plate' });
          }
        }
      } else {
        warnings.push(`${label}door ${i + 1} hinges are not over a side or divider; align section widths with the doors`);
      }
    }
  }

  if (fronts === 'sliding') {
    const sl = w.sliding;
    const count = Math.max(2, Math.min(5, Math.trunc(sl.doorCount) || 3));
    const slidingH = H - tkH - sl.topTrack - sl.bottomTrack;
    const doorW = (L + (count - 1) * sl.overlap) / count;
    const travel = doorW - sl.overlap;
    for (let i = 0; i < count; i += 1) {
      const x0 = i * (doorW - sl.overlap);
      const inner = i % 2 === 0;
      const mirror = cfg.doors.mirror;
      const mirrored = mirror === 'all' || (mirror === 'first' && i === 0) || (mirror === 'last' && i === count - 1);
      const door = makePanel({
        id: `${prefix}sliding-${i + 1}`, name: `${namePrefix}Sliding Door ${i + 1}`, type: 'sliding-door', color: DOOR_COLOR,
        materialLabel: m.slidingDoorMaterial || m.doorMaterial, cutWidth: doorW, cutHeight: slidingH, cutThickness: Tsl,
        posX: x0 + doorW / 2, posY: tkH + sl.bottomTrack + slidingH / 2,
        posZ: inner ? -Tsl / 2 : -(Tsl * 1.5 + slidingGap), sizeX: doorW, sizeY: slidingH, sizeZ: Tsl,
        edgeBanding: allEdges, leg: spec.kind, noMarkers: true,
      });
      door.mirrored = mirrored;
      if (spec.kind === 'A') door.slideDx = i < count / 2 ? travel : -travel;
      panels.push(door);
    }
    if (doorBottom <= 0) warnings.push('Sliding doors need room for the bottom track');
  }

  const zMax = sideDepth + (hasBack ? Tb : 0);
  return { panels, zMax };
}

function transformLeg(run: Run, kind: 'B' | 'C', mainWidth: number, frontZone: number, length: number): Panel[] {
  return run.panels.map((panel) => {
    const lx = panel.posX;
    const lz = panel.posZ;
    const sizeX = panel.sizeX;
    const sizeZ = panel.sizeZ;
    let posX: number;
    let posZ: number;
    if (kind === 'B') {
      posX = run.zMax - lz;
      posZ = -frontZone - length + lx;
    } else {
      posX = mainWidth - run.zMax + lz;
      posZ = -frontZone - lx;
    }
    return {
      ...panel,
      posX,
      posZ,
      sizeX: sizeZ,
      sizeZ: sizeX,
      legRotation: kind === 'B' ? -90 : 90,
      frontDir: kind === 'B' ? { x: 1, z: 0 } : { x: -1, z: 0 },
      noMarkers: true,
      slideDx: undefined,
    };
  });
}

export function computeWardrobe(cfg: CabinetConfig): Result {
  const warnings: string[] = [];
  const w = cfg.wardrobe;
  const main = buildRun(cfg, { kind: 'A', length: cfg.width, sections: w.sections }, warnings);
  const panels = [...main.panels];

  const Td = cfg.materials.doorThickness;
  const Tsl = cfg.materials.slidingDoorThickness ?? Td;
  const frontZone = w.fronts === 'hinged' ? Td : w.fronts === 'sliding' ? 2 * Tsl + 6 : 0;

  const legs: { kind: 'B' | 'C'; enabled: boolean; length: number; sections: WardrobeSection[] }[] = [
    { kind: 'B', enabled: w.layout !== 'single' && w.legB.enabled, length: w.legB.length, sections: w.legB.sections },
    { kind: 'C', enabled: w.layout === 'walk-in' && w.legC.enabled, length: w.legC.length, sections: w.legC.sections },
  ];
  for (const leg of legs) {
    if (!leg.enabled) continue;
    const run = buildRun(cfg, { kind: leg.kind, length: leg.length, sections: leg.sections }, warnings);
    panels.push(...transformLeg(run, leg.kind, cfg.width, frontZone, leg.length));
  }

  if (cfg.construction === 'face-frame') warnings.push('Wardrobes are built frameless; the face-frame setting is ignored');
  if (cfg.backMount === 'grooved-in') warnings.push('Wardrobe backs are applied to the rear; the grooved-in setting is ignored');
  if (cfg.height > 2440) warnings.push('Height exceeds a standard 2440mm sheet; sides will need a joint');
  return { panels, warnings };
}
