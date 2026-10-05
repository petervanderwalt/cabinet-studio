import { getPlacementWorldPosition } from '../engine';
import type { CabinetInstance, Project, SnapPreview } from '../types';

export const POSITION_SNAP = 10;
const EDGE_SNAP = 64;
const SNAP_ALIGNMENT_TOLERANCE = 140;
const REAR_ALIGN_SNAP = 220;

interface SnapCandidate {
  target: number;
  label: string;
  targetInstanceId?: string;
  threshold?: number;
}

interface Bounds {
  left: number;
  right: number;
  front: number;
  back: number;
}

export function snap(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function maybeSnapAxis(value: number, candidates: SnapCandidate[]): { value: number; preview: SnapPreview | null } {
  let next = value;
  let bestDistance = Number.POSITIVE_INFINITY;
  let preview: SnapPreview | null = null;
  for (const candidate of candidates) {
    const threshold = candidate.threshold ?? EDGE_SNAP;
    const distance = Math.abs(candidate.target - value);
    if (distance <= threshold && distance < bestDistance) {
      next = candidate.target;
      bestDistance = distance;
      preview = { label: candidate.label, targetInstanceId: candidate.targetInstanceId || null, distance };
    }
  }
  return { value: next, preview };
}

function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number, tolerance = 0): boolean {
  return aMin <= bMax + tolerance && aMax >= bMin - tolerance;
}

function normalizeRotationQuarterTurns(rotation: number): number {
  const normalized = ((Math.round(Number(rotation) / 90) || 0) % 4 + 4) % 4;
  return normalized * 90;
}

function buildBounds(x: number, z: number, halfW: number, halfD: number): Bounds {
  return { left: x - halfW, right: x + halfW, front: z - halfD, back: z + halfD };
}

function pickPreview(current: SnapPreview | null, candidate: SnapPreview | null): SnapPreview | null {
  if (!candidate) return current;
  if (!current) return candidate;
  return candidate.distance < current.distance ? candidate : current;
}

interface RearAssistArgs {
  rotation: number;
  otherBounds: Bounds;
  halfW: number;
  halfD: number;
  otherLabel: string;
  otherInstanceId: string;
}

function getRearAlignmentAssist({ rotation, otherBounds, halfW, halfD, otherLabel, otherInstanceId }: RearAssistArgs) {
  const candidate = (target: number): SnapCandidate => ({
    target,
    label: `${otherLabel} rear aligned`,
    targetInstanceId: otherInstanceId,
    threshold: REAR_ALIGN_SNAP,
  });
  switch (normalizeRotationQuarterTurns(rotation)) {
    case 0: return { axis: 'z' as const, candidate: candidate(otherBounds.front + halfD) };
    case 90: return { axis: 'x' as const, candidate: candidate(otherBounds.left + halfW) };
    case 180: return { axis: 'z' as const, candidate: candidate(otherBounds.back - halfD) };
    case 270: return { axis: 'x' as const, candidate: candidate(otherBounds.right - halfW) };
    default: return null;
  }
}

interface SnapArgs {
  project: Project;
  instances: CabinetInstance[];
  instanceId: string;
  width: number;
  depth: number;
  x: number;
  z: number;
}

export function computeSnappedPlacement({ project, instances, instanceId, width, depth, x, z }: SnapArgs) {
  const room = project.layout.room;
  const halfW = width / 2;
  const halfD = depth / 2;
  const minX = -room.width / 2 + halfW;
  const maxX = room.width / 2 - halfW;
  const minZ = -room.depth / 2 + halfD;
  const maxZ = room.depth / 2 - halfD;

  let nextX = clamp(x, minX, maxX);
  let nextZ = clamp(z, minZ, maxZ);
  let preview: SnapPreview | null = null;

  const xSnap = maybeSnapAxis(nextX, [
    { target: -room.width / 2 + halfW, label: 'left wall' },
    { target: room.width / 2 - halfW, label: 'right wall' },
  ]);
  nextX = xSnap.value;
  preview = pickPreview(preview, xSnap.preview);

  const zSnap = maybeSnapAxis(nextZ, [
    { target: -room.depth / 2 + halfD, label: 'back wall' },
    { target: room.depth / 2 - halfD, label: 'front wall' },
  ]);
  nextZ = zSnap.value;
  preview = pickPreview(preview, zSnap.preview);

  const moving = instances.find((entry) => entry.instanceId === instanceId);
  const movingRotation = normalizeRotationQuarterTurns(moving?.placement.rotation || 0);

  for (const other of instances.filter((entry) => entry.instanceId !== instanceId)) {
    const pos = getPlacementWorldPosition(project, other);
    const sameRotation = normalizeRotationQuarterTurns(other.placement.rotation || 0) === movingRotation;
    const otherBounds: Bounds = {
      left: other.placement.x - pos.width / 2,
      right: other.placement.x + pos.width / 2,
      front: other.placement.z - pos.depth / 2,
      back: other.placement.z + pos.depth / 2,
    };
    const assistArgs = {
      rotation: other.placement.rotation || 0,
      otherBounds,
      halfW,
      halfD,
      otherLabel: other.label,
      otherInstanceId: other.instanceId,
    };
    const neighbour = (target: number, label: string): SnapCandidate => ({
      target,
      label: `${other.label} ${label}`,
      targetInstanceId: other.instanceId,
    });

    const candidate = buildBounds(nextX, nextZ, halfW, halfD);
    if (rangesOverlap(candidate.front, candidate.back, otherBounds.front, otherBounds.back, SNAP_ALIGNMENT_TOLERANCE)) {
      const xNeighborSnap = maybeSnapAxis(nextX, [
        neighbour(otherBounds.left - halfW, 'left face'),
        neighbour(otherBounds.right + halfW, 'right face'),
        neighbour(otherBounds.left + halfW, 'left aligned'),
        neighbour(otherBounds.right - halfW, 'right aligned'),
      ]);
      nextX = xNeighborSnap.value;
      preview = pickPreview(preview, xNeighborSnap.preview);

      if (sameRotation && xNeighborSnap.preview) {
        const rearAssist = getRearAlignmentAssist(assistArgs);
        if (rearAssist?.axis === 'z') {
          const rearSnap = maybeSnapAxis(nextZ, [rearAssist.candidate]);
          nextZ = rearSnap.value;
          preview = pickPreview(preview, rearSnap.preview);
        }
      }
    }

    const nextBounds = buildBounds(nextX, nextZ, halfW, halfD);
    if (rangesOverlap(nextBounds.left, nextBounds.right, otherBounds.left, otherBounds.right, SNAP_ALIGNMENT_TOLERANCE)) {
      const zNeighborSnap = maybeSnapAxis(nextZ, [
        neighbour(otherBounds.front - halfD, 'front face'),
        neighbour(otherBounds.back + halfD, 'back face'),
        neighbour(otherBounds.front + halfD, 'rear aligned'),
        neighbour(otherBounds.back - halfD, 'front aligned'),
      ]);
      nextZ = zNeighborSnap.value;
      preview = pickPreview(preview, zNeighborSnap.preview);

      if (sameRotation && zNeighborSnap.preview) {
        const rearAssist = getRearAlignmentAssist(assistArgs);
        if (rearAssist?.axis === 'x') {
          const rearSnap = maybeSnapAxis(nextX, [rearAssist.candidate]);
          nextX = rearSnap.value;
          preview = pickPreview(preview, rearSnap.preview);
        }
      }
    }
  }

  return { x: clamp(nextX, minX, maxX), z: clamp(nextZ, minZ, maxZ), preview };
}
