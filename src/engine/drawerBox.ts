// Drawer box parts for a catalogue metal-box system (LEGRABOX, MERIVOBOX, TANDEMBOX, METABOX):
// the cut parts are the wooden base and back; the metal sides are drawn but never cut.
import type { Panel } from '../types';
import type { DrawerFitting } from '../fittings/drawerModel';

interface Args {
  idPrefix: string;
  namePrefix: string;
  model: DrawerFitting;
  /** World x of the middle of the opening the drawer sits in. */
  centerX: number;
  /** z of the front of the drawer box. */
  zStart: number;
  /** y of the bottom of the drawer box. */
  yBottom: number;
  woodLabel: string;
  color?: number;
  leg?: Panel['leg'];
  noMarkers?: boolean;
}

const SIDE_THICKNESS = 13;

export function buildMetalBoxPanels(a: Args): Panel[] {
  const { model } = a;
  if (model.kind !== 'metal-box' || !model.base) return [];
  const color = a.color ?? 0xe4ecf8;
  const sideHeight = model.sideHeight ?? 70;
  const nl = model.nominalLength;
  const base = model.base;
  const noEdge = { top: false, bottom: false, left: false, right: false };
  const panels: Panel[] = [];

  panels.push({
    id: `${a.idPrefix}-bottom`, name: `${a.namePrefix} Base`, type: 'drawer-box', color, materialLabel: a.woodLabel,
    cutWidth: base.width, cutHeight: base.length, cutThickness: base.thickness,
    posX: a.centerX, posY: a.yBottom + base.thickness / 2, posZ: a.zStart + 2 + base.length / 2,
    sizeX: base.width, sizeY: base.thickness, sizeZ: base.length,
    holes: [], notches: [], grooves: [], edgeBanding: noEdge, leg: a.leg, noMarkers: true,
  });

  if (model.back) {
    panels.push({
      id: `${a.idPrefix}-back`, name: `${a.namePrefix} Back`, type: 'drawer-box', color, materialLabel: a.woodLabel,
      cutWidth: model.back.width, cutHeight: model.back.height, cutThickness: model.back.thickness,
      posX: a.centerX, posY: a.yBottom + model.back.height / 2 + 2, posZ: a.zStart + nl - model.back.thickness / 2,
      sizeX: model.back.width, sizeY: model.back.height, sizeZ: model.back.thickness,
      holes: [], notches: [], grooves: [], edgeBanding: { ...noEdge, top: true }, leg: a.leg, noMarkers: true,
    });
  }

  for (const side of ['left', 'right'] as const) {
    const offset = base.width / 2 + SIDE_THICKNESS / 2;
    panels.push({
      id: `${a.idPrefix}-side-${side}`, name: `${a.namePrefix} ${side === 'left' ? 'Left' : 'Right'} Side (metal)`, type: 'drawer-box',
      color: 0x9aa4b4, materialLabel: 'Metal drawer side',
      cutWidth: nl, cutHeight: sideHeight, cutThickness: SIDE_THICKNESS,
      posX: a.centerX + (side === 'left' ? -offset : offset), posY: a.yBottom + sideHeight / 2, posZ: a.zStart + nl / 2,
      sizeX: SIDE_THICKNESS, sizeY: sideHeight, sizeZ: nl,
      holes: [], notches: [], grooves: [], edgeBanding: noEdge, fabricate: false, noMarkers: true, leg: a.leg,
    });
  }
  return panels;
}
