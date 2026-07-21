import { defaultCabinet } from './cabinet-math.js';

const PROJECT_VERSION = 2;
const LAYOUT_SPACING = 40;

function defaultRoom() {
  return {
    width: 4200,
    depth: 3600,
    height: 2400,
    wallCabinetBottom: 1400,
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix = 'cabinet') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextCabinetName(cabinets) {
  let index = 1;
  while (cabinets.some((cabinet) => cabinet.name === `Cabinet ${index}`)) index += 1;
  return `Cabinet ${index}`;
}

function normalizeRoom(room = {}) {
  const base = defaultRoom();
  return {
    width: Number.isFinite(Number(room.width)) && Number(room.width) > 0 ? Number(room.width) : base.width,
    depth: Number.isFinite(Number(room.depth)) && Number(room.depth) > 0 ? Number(room.depth) : base.depth,
    height: Number.isFinite(Number(room.height)) && Number(room.height) > 0 ? Number(room.height) : base.height,
    wallCabinetBottom: Number.isFinite(Number(room.wallCabinetBottom)) && Number(room.wallCabinetBottom) >= 0
      ? Number(room.wallCabinetBottom)
      : base.wallCabinetBottom,
  };
}

function normalizeRotation(rotation) {
  const turns = Math.round(Number(rotation) / 90) || 0;
  const normalized = ((turns % 4) + 4) % 4;
  return normalized * 90;
}

function layoutFootprint(config = {}) {
  const width = Math.max(1, Number(config.width) || 1);
  const depth = Math.max(1, Number(config.depth) || 1);
  const height = Math.max(1, Number(config.height) || 1);
  return { width, depth, height };
}

function rotatedFootprint(config = {}, rotation = 0) {
  const { width, depth, height } = layoutFootprint(config);
  const quarterTurn = Math.abs(normalizeRotation(rotation) % 180) === 90;
  return {
    width: quarterTurn ? depth : width,
    depth: quarterTurn ? width : depth,
    height,
  };
}

function expandCabinetInstances(cabinets = []) {
  const instances = [];
  cabinets.forEach((cabinet) => {
    const qty = Math.max(1, Number(cabinet.qty) || 1);
    for (let copyIndex = 1; copyIndex <= qty; copyIndex += 1) {
      instances.push({
        instanceId: `${cabinet.id}__${copyIndex}`,
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        copyIndex,
        qty,
        label: qty > 1 ? `${cabinet.name} #${copyIndex}` : cabinet.name,
        config: cabinet.config,
      });
    }
  });
  return instances;
}

function autoArrangePlacements(instances, room, existingPlacements = new Map()) {
  const placements = [];
  const floorRow = { x: -room.width / 2 + 120, z: -room.depth / 2 + 120, rowDepth: 0 };
  const wallRow = { x: -room.width / 2 + 120, z: -room.depth / 2 + 120, rowDepth: 0 };
  const wrapLimit = room.width / 2 - 120;

  for (const instance of instances) {
    const saved = existingPlacements.get(instance.instanceId);
    if (saved) {
      placements.push({
        instanceId: instance.instanceId,
        cabinetId: instance.cabinetId,
        copyIndex: instance.copyIndex,
        x: Number(saved.x) || 0,
        z: Number(saved.z) || 0,
        rotation: normalizeRotation(saved.rotation),
      });
      continue;
    }

    const isWall = instance.config.category === 'wall';
    const row = isWall ? wallRow : floorRow;
    const footprint = rotatedFootprint(instance.config, 0);
    if (row.x + footprint.width > wrapLimit) {
      row.x = -room.width / 2 + 120;
      row.z += row.rowDepth + 220;
      row.rowDepth = 0;
    }

    placements.push({
      instanceId: instance.instanceId,
      cabinetId: instance.cabinetId,
      copyIndex: instance.copyIndex,
      x: row.x + (footprint.width / 2),
      z: row.z + (footprint.depth / 2),
      rotation: 0,
    });

    row.x += footprint.width + LAYOUT_SPACING;
    row.rowDepth = Math.max(row.rowDepth, footprint.depth);
  }

  return placements;
}

function normalizeLayout(layout = {}, cabinets = []) {
  const room = normalizeRoom(layout.room);
  const instances = expandCabinetInstances(cabinets);
  const placementMap = new Map(
    Array.isArray(layout.placements)
      ? layout.placements
          .filter((placement) => placement && typeof placement.instanceId === 'string')
          .map((placement) => [placement.instanceId, placement])
      : []
  );

  return {
    room,
    placements: autoArrangePlacements(instances, room, placementMap),
  };
}

export function createCabinetEntry(config = {}, meta = {}) {
  const base = clone(defaultCabinet());
  const mergedConfig = { ...base, ...clone(config) };
  const id = meta.id || mergedConfig.id || makeId();
  mergedConfig.id = id;

  return {
    id,
    name: meta.name || mergedConfig.name || 'Cabinet 1',
    qty: Number.isFinite(Number(meta.qty ?? config.qty)) && Number(meta.qty ?? config.qty) > 0
      ? Math.floor(Number(meta.qty ?? config.qty))
      : 1,
    config: mergedConfig,
  };
}

export function createProjectFromConfig(config = {}) {
  const cabinet = createCabinetEntry(config, { name: 'Cabinet 1' });
  return normalizeProject({
    version: PROJECT_VERSION,
    name: 'Kitchen Project',
    activeCabinetId: cabinet.id,
    cabinets: [cabinet],
  });
}

export function normalizeProject(data) {
  if (data && Array.isArray(data.cabinets) && data.cabinets.length > 0) {
    const cabinets = data.cabinets.map((cabinet, index) => {
      const entry = createCabinetEntry(cabinet?.config || cabinet || {}, {
        id: cabinet?.id || `cabinet-${index + 1}`,
        name: cabinet?.name || `Cabinet ${index + 1}`,
        qty: cabinet?.qty ?? 1,
      });
      entry.config.id = entry.id;
      return entry;
    });

    return {
      version: Number.isFinite(Number(data.version)) ? Number(data.version) : PROJECT_VERSION,
      name: data.name || 'Kitchen Project',
      activeCabinetId: cabinets.some((cabinet) => cabinet.id === data.activeCabinetId) ? data.activeCabinetId : cabinets[0].id,
      cabinets,
      layout: normalizeLayout(data.layout, cabinets),
    };
  }

  return createProjectFromConfig(data || {});
}

export function getActiveCabinet(project) {
  const normalized = normalizeProject(project);
  return normalized.cabinets.find((cabinet) => cabinet.id === normalized.activeCabinetId) || normalized.cabinets[0];
}

export function setActiveCabinet(project, cabinetId) {
  const normalized = normalizeProject(project);
  if (!normalized.cabinets.some((cabinet) => cabinet.id === cabinetId)) return normalized;
  return {
    ...normalized,
    activeCabinetId: cabinetId,
  };
}

export function updateActiveCabinetConfig(project, config) {
  const normalized = normalizeProject(project);
  const active = getActiveCabinet(normalized);
  return {
    ...normalized,
    cabinets: normalized.cabinets.map((cabinet) => (
      cabinet.id === active.id
        ? {
            ...cabinet,
            config: {
              ...clone(config),
              id: cabinet.id,
            },
          }
        : cabinet
    )),
  };
}

export function updateCabinetMeta(project, cabinetId, updates = {}) {
  const normalized = normalizeProject(project);
  return {
    ...normalized,
    cabinets: normalized.cabinets.map((cabinet) => (
      cabinet.id === cabinetId
        ? {
            ...cabinet,
            name: typeof updates.name === 'string' && updates.name.trim() ? updates.name.trim() : cabinet.name,
            qty: Number.isFinite(Number(updates.qty)) && Number(updates.qty) > 0 ? Math.floor(Number(updates.qty)) : cabinet.qty,
          }
        : cabinet
    )),
  };
}

export function addCabinet(project, seedConfig = null) {
  const normalized = normalizeProject(project);
  const entry = createCabinetEntry(seedConfig || defaultCabinet(), {
    id: makeId(),
    name: nextCabinetName(normalized.cabinets),
    qty: 1,
  });
  return {
    ...normalized,
    activeCabinetId: entry.id,
    cabinets: [...normalized.cabinets, entry],
  };
}

export function duplicateCabinet(project, cabinetId) {
  const normalized = normalizeProject(project);
  const source = normalized.cabinets.find((cabinet) => cabinet.id === cabinetId) || getActiveCabinet(normalized);
  const duplicateNameBase = `${source.name} Copy`;
  let duplicateName = duplicateNameBase;
  let suffix = 2;
  while (normalized.cabinets.some((cabinet) => cabinet.name === duplicateName)) {
    duplicateName = `${duplicateNameBase} ${suffix}`;
    suffix += 1;
  }
  const entry = createCabinetEntry(source.config, {
    id: makeId(),
    name: duplicateName,
    qty: source.qty,
  });
  return {
    ...normalized,
    activeCabinetId: entry.id,
    cabinets: [...normalized.cabinets, entry],
  };
}

export function removeCabinet(project, cabinetId) {
  const normalized = normalizeProject(project);
  if (normalized.cabinets.length <= 1) return normalized;
  const cabinets = normalized.cabinets.filter((cabinet) => cabinet.id !== cabinetId);
  const nextActiveId = normalized.activeCabinetId === cabinetId ? cabinets[0].id : normalized.activeCabinetId;
  return {
    ...normalized,
    activeCabinetId: nextActiveId,
    cabinets,
  };
}

export function serializeProject(project) {
  return JSON.stringify(normalizeProject(project), null, 2);
}

export function getProjectInstances(project) {
  const normalized = normalizeProject(project);
  const placementMap = new Map(normalized.layout.placements.map((placement) => [placement.instanceId, placement]));
  return expandCabinetInstances(normalized.cabinets).map((instance) => ({
    ...instance,
    placement: placementMap.get(instance.instanceId) || {
      instanceId: instance.instanceId,
      cabinetId: instance.cabinetId,
      copyIndex: instance.copyIndex,
      x: 0,
      z: 0,
      rotation: 0,
    },
  }));
}

export function updateRoom(project, roomUpdates = {}) {
  const normalized = normalizeProject(project);
  return {
    ...normalized,
    layout: normalizeLayout({
      ...normalized.layout,
      room: {
        ...normalized.layout.room,
        ...clone(roomUpdates),
      },
      placements: normalized.layout.placements,
    }, normalized.cabinets),
  };
}

export function updatePlacement(project, instanceId, updates = {}) {
  const normalized = normalizeProject(project);
  const placements = normalized.layout.placements.map((placement) => (
    placement.instanceId === instanceId
      ? {
          ...placement,
          x: Number.isFinite(Number(updates.x)) ? Number(updates.x) : placement.x,
          z: Number.isFinite(Number(updates.z)) ? Number(updates.z) : placement.z,
          rotation: updates.rotation == null ? placement.rotation : normalizeRotation(updates.rotation),
        }
      : placement
  ));
  return {
    ...normalized,
    layout: normalizeLayout({
      ...normalized.layout,
      placements,
    }, normalized.cabinets),
  };
}

export function autoArrangeProject(project) {
  const normalized = normalizeProject(project);
  return {
    ...normalized,
    layout: normalizeLayout({
      ...normalized.layout,
      placements: [],
    }, normalized.cabinets),
  };
}

export function getPlacementWorldPosition(project, instance) {
  const normalized = normalizeProject(project);
  const room = normalized.layout.room;
  const placement = instance.placement || {};
  const footprint = rotatedFootprint(instance.config, placement.rotation || 0);
  const isWall = instance.config.category === 'wall';
  return {
    x: placement.x || 0,
    y: isWall ? room.wallCabinetBottom + footprint.height / 2 : footprint.height / 2,
    z: placement.z || 0,
    width: footprint.width,
    depth: footprint.depth,
    height: footprint.height,
  };
}
