// Resolves the hinge cup and mounting-plate drilling for a cabinet: either the generic hardware
// settings or a catalogued Blum fitting.
import type { CabinetConfig } from '../types';
import { CLIP_TOP_110, CRUCIFORM_PLATE_37_32 } from './blum-hinges';

export interface HingeDrilling {
  cupDiameter: number;
  /** Distance from the door edge to the cup centre. */
  cupInset: number;
  /** Extra door holes (INSERTA / knock-in dowels) relative to the cup centre: dx further from the edge, dy along the edge. */
  dowels: { dx: number; dy: number; diameter: number }[];
  /** Distances from the cabinet front edge to each column of plate holes. */
  plateOffsets: number[];
  plateSpacing: number;
}

export function resolveHingeDrilling(cfg: CabinetConfig): HingeDrilling {
  const hw = cfg.hardware;
  const hinge = hw.hinge;

  if (hinge?.fitting === 'blum-clip-top-110') {
    const { cupDiameter, edgeDistance, dowels } = CLIP_TOP_110;
    const tb = Math.min(edgeDistance.max, Math.max(edgeDistance.min, hinge.edgeDistance ?? edgeDistance.default));
    const hasDowels = hinge.boss !== 'screw-on';
    const usePlate = hinge.plate === 'cruciform-37-32';
    return {
      cupDiameter,
      cupInset: tb + cupDiameter / 2,
      dowels: hasDowels
        ? [-1, 1].map((side) => ({ dx: dowels.offsetFromCupCentre, dy: (side * dowels.spacing) / 2, diameter: dowels.diameter }))
        : [],
      plateOffsets: usePlate ? [CRUCIFORM_PLATE_37_32.frontOffset] : [hw.hingePlateFrontHoleOffset ?? 20, hw.hingePlateRearHoleOffset ?? 32],
      plateSpacing: usePlate ? CRUCIFORM_PLATE_37_32.holeSpacing : hw.hingePlateHoleSpacing ?? 32,
    };
  }

  return {
    cupDiameter: hw.hingeBoreDiameter ?? 35,
    cupInset: hw.hingeBoreInset ?? 22,
    dowels: [],
    plateOffsets: [hw.hingePlateFrontHoleOffset ?? 20, hw.hingePlateRearHoleOffset ?? 32],
    plateSpacing: hw.hingePlateHoleSpacing ?? 32,
  };
}
