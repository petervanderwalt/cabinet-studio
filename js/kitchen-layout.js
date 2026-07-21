import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { downloadProjectFile } from './dxf-writer.js';
import {
  autoArrangeProject,
  createProjectFromConfig,
  getPlacementWorldPosition,
  getProjectInstances,
  normalizeProject,
  updatePlacement,
  updateRoom,
} from './project-io.js?v=20260721a';

const LAYOUT_SEED_KEY = 'cabinet-studio-layout-seed';
const POSITION_SNAP = 10;
const EDGE_SNAP = 64;
const SNAP_ALIGNMENT_TOLERANCE = 140;
const REAR_ALIGN_SNAP = 220;

let currentProject = null;
let currentInstances = [];
let selectedInstanceId = null;
let viewport = null;
let currentSnapPreview = null;

function init() {
  currentProject = normalizeProject(createProjectFromConfig({}));
  viewport = new KitchenLayoutViewport(document.getElementById('layout-viewport'), {
    onSelect: handleSelectInstance,
    onMove: handleMoveInstance,
    onRotate: handleRotateInstance,
  });

  bindTopbarActions();
  bindRoomInputs();
  bindSelectedCabinetInputs();
  hydrateSeedProject();
  render();
}

function hydrateSeedProject() {
  try {
    const seed = window.localStorage.getItem(LAYOUT_SEED_KEY);
    if (!seed) return;
    const parsed = JSON.parse(seed);
    currentProject = normalizeProject(parsed);
  } catch {
    currentProject = normalizeProject(createProjectFromConfig({}));
  }
}

function bindTopbarActions() {
  document.getElementById('layout-import-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          currentProject = normalizeProject(JSON.parse(String(reader.result || '{}')));
          selectedInstanceId = null;
          persistSeedProject();
          render();
        } catch (error) {
          window.alert(`Invalid project JSON: ${error.message}`);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  document.getElementById('layout-save-btn')?.addEventListener('click', () => {
    downloadProjectFile(normalizeProject(currentProject));
  });

  document.getElementById('layout-auto-btn')?.addEventListener('click', () => {
    currentProject = autoArrangeProject(currentProject);
    persistSeedProject();
    render();
  });

  document.getElementById('back-to-studio-btn')?.addEventListener('click', () => {
    persistSeedProject();
    window.location.href = 'index.html?v=20260721a';
  });
}

function bindRoomInputs() {
  const pairs = [
    ['room-width-input', 'width'],
    ['room-depth-input', 'depth'],
    ['room-height-input', 'height'],
    ['wall-bottom-input', 'wallCabinetBottom'],
  ];

  pairs.forEach(([id, key]) => {
    document.getElementById(id)?.addEventListener('change', (event) => {
      currentProject = updateRoom(currentProject, {
        [key]: Number.parseFloat(event.target.value) || 0,
      });
      persistSeedProject();
      render();
    });
  });
}

function bindSelectedCabinetInputs() {
  document.getElementById('selected-x-input')?.addEventListener('change', (event) => {
    if (!selectedInstanceId) return;
    currentProject = updatePlacement(currentProject, selectedInstanceId, { x: Number.parseFloat(event.target.value) || 0 });
    persistSeedProject();
    render();
  });

  document.getElementById('selected-z-input')?.addEventListener('change', (event) => {
    if (!selectedInstanceId) return;
    currentProject = updatePlacement(currentProject, selectedInstanceId, { z: Number.parseFloat(event.target.value) || 0 });
    persistSeedProject();
    render();
  });

  document.getElementById('selected-rotation-input')?.addEventListener('change', (event) => {
    if (!selectedInstanceId) return;
    currentProject = updatePlacement(currentProject, selectedInstanceId, { rotation: Number.parseInt(event.target.value, 10) || 0 });
    persistSeedProject();
    render();
  });

  document.getElementById('rotate-selected-btn')?.addEventListener('click', () => {
    if (!selectedInstanceId) return;
    handleRotateInstance(selectedInstanceId);
  });
}

function handleSelectInstance(instanceId) {
  selectedInstanceId = instanceId;
  currentSnapPreview = null;
  renderInspectorOnly();
  renderInstanceList();
  viewport.setSelection(selectedInstanceId);
}

function handleMoveInstance(instanceId, position) {
  currentProject = updatePlacement(currentProject, instanceId, position);
  currentSnapPreview = position.preview || null;
  persistSeedProject();
  currentInstances = getProjectInstances(currentProject);
  selectedInstanceId = instanceId;
  renderInspectorOnly();
  renderInstanceList();
  viewport.update(currentProject, currentInstances, selectedInstanceId, currentSnapPreview);
}

function handleRotateInstance(instanceId) {
  const instance = currentInstances.find((entry) => entry.instanceId === instanceId);
  if (!instance) return;
  currentProject = updatePlacement(currentProject, instanceId, {
    rotation: ((instance.placement.rotation || 0) + 90) % 360,
  });
  currentSnapPreview = null;
  persistSeedProject();
  render();
}

function persistSeedProject() {
  try {
    window.localStorage.setItem(LAYOUT_SEED_KEY, JSON.stringify(normalizeProject(currentProject)));
  } catch {
    // Ignore local storage failures.
  }
}

function render() {
  currentProject = normalizeProject(currentProject);
  currentInstances = getProjectInstances(currentProject);
  if (!currentInstances.length) {
    selectedInstanceId = null;
  } else if (!currentInstances.some((instance) => instance.instanceId === selectedInstanceId)) {
    selectedInstanceId = currentInstances[0].instanceId;
  }

  renderRoomInputs();
  renderSummary();
  renderInstanceList();
  renderInspectorOnly();
  viewport.update(currentProject, currentInstances, selectedInstanceId, currentSnapPreview);
}

function renderRoomInputs() {
  const room = currentProject.layout.room;
  setInputValue('room-width-input', room.width);
  setInputValue('room-depth-input', room.depth);
  setInputValue('room-height-input', room.height);
  setInputValue('wall-bottom-input', room.wallCabinetBottom);
  document.getElementById('layout-project-name').textContent = currentProject.name || 'Kitchen Project';
  document.getElementById('layout-subtitle').textContent = `${currentProject.name || 'Kitchen Project'} · drag cabinets to rearrange the room.`;
}

function renderSummary() {
  document.getElementById('metric-cabinets').textContent = String(currentProject.cabinets.length);
  document.getElementById('metric-instances').textContent = String(currentInstances.length);
  document.getElementById('layout-instance-count').textContent = `${currentInstances.length} ${currentInstances.length === 1 ? 'unit' : 'units'}`;
}

function renderInstanceList() {
  const root = document.getElementById('layout-list-body');
  if (!root) return;

  if (!currentInstances.length) {
    root.innerHTML = '<div class="empty-state">Import a project JSON or start with a saved project from Cabinet Studio.</div>';
    return;
  }

  root.innerHTML = currentInstances.map((instance) => {
    const placement = instance.placement;
    const pos = getPlacementWorldPosition(currentProject, instance);
    return `
      <button class="cabinet-row${instance.instanceId === selectedInstanceId ? ' active' : ''}" type="button" data-instance-id="${escapeHtml(instance.instanceId)}">
        <div class="cabinet-row-top">
          <span class="cabinet-row-name">${escapeHtml(instance.label)}</span>
          <span class="cabinet-badge">${escapeHtml(instance.config.category)}</span>
        </div>
        <div class="cabinet-row-meta">
          <span>${formatMm(pos.width)} × ${formatMm(pos.depth)} × ${formatMm(pos.height)} mm</span>
          <span>Rot ${formatMm(placement.rotation || 0)}°</span>
          <span>X ${formatMm(placement.x)}</span>
          <span>Z ${formatMm(placement.z)}</span>
        </div>
      </button>
    `;
  }).join('');

  root.querySelectorAll('[data-instance-id]').forEach((button) => {
    button.addEventListener('click', () => handleSelectInstance(button.getAttribute('data-instance-id')));
  });
}

function renderInspectorOnly() {
  const selected = currentInstances.find((instance) => instance.instanceId === selectedInstanceId);
  const empty = document.getElementById('selected-cabinet-card');
  const fields = document.getElementById('selected-cabinet-fields');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayCopy = document.getElementById('overlay-copy');

  if (!selected) {
    empty.hidden = false;
    fields.hidden = true;
    empty.textContent = 'Select a cabinet in the scene or list to adjust its placement. Right click a cabinet in the viewport to rotate it 90°.';
    overlayTitle.textContent = 'No cabinet selected';
    overlayCopy.textContent = 'Base and tall cabinets auto-start on the floor. Wall cabinets auto-start on the wall row at the configured wall height.';
    return;
  }

  const world = getPlacementWorldPosition(currentProject, selected);
  const placement = selected.placement;
  empty.hidden = true;
  fields.hidden = false;

  setInputValue('selected-name', selected.label);
  setInputValue('selected-category', selected.config.category);
  setInputValue('selected-x-input', placement.x);
  setInputValue('selected-z-input', placement.z);
  setInputValue('selected-rotation-input', placement.rotation || 0);
  setInputValue('selected-size', `${formatMm(world.width)} x ${formatMm(world.depth)} x ${formatMm(world.height)} mm`);

  overlayTitle.textContent = selected.label;
  overlayCopy.textContent = `${capitalize(selected.config.category)} cabinet · X ${formatMm(placement.x)} mm · Z ${formatMm(placement.z)} mm · rotation ${formatMm(placement.rotation || 0)}°${currentSnapPreview?.label ? ` · snap: ${currentSnapPreview.label}` : ''}`;
}

function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (!input) return;
  input.value = String(value);
}

class KitchenLayoutViewport {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7faff);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(42, 1, 1, 40000);
    this.camera.position.set(2600, 2200, 2600);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 600, 0);
    this.controls.addEventListener('change', () => this.requestRender());

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pickMeshes = [];
    this.meshByInstanceId = new Map();
    this.drag = null;

    this.roomGroup = new THREE.Group();
    this.cabinetGroup = new THREE.Group();
    this.scene.add(this.roomGroup, this.cabinetGroup);

    this.scene.add(new THREE.AmbientLight(0xffffff, 1.12));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(1800, 2600, 1400);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf4f8ff, 0.5);
    fillLight.position.set(-1800, 1600, -1200);
    this.scene.add(fillLight);

    this._bindEvents();
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(container);
    this._onResize();
  }

  _bindEvents() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    dom.addEventListener('pointermove', (event) => this.onPointerMove(event));
    dom.addEventListener('pointerup', () => this.onPointerUp());
    dom.addEventListener('pointerleave', () => this.onPointerUp());
    dom.addEventListener('contextmenu', (event) => this.onContextMenu(event));
  }

  update(project, instances, selectedInstanceId, snapPreview = null) {
    this.project = normalizeProject(project);
    this.instances = instances;
    this.selectedInstanceId = selectedInstanceId;
    this.snapPreview = snapPreview;
    this._rebuildRoom();
    this._rebuildCabinets();
    this._fitCamera();
    this.requestRender();
  }

  setSelection(instanceId) {
    this.selectedInstanceId = instanceId;
    this._applySelectionStyles();
    this.requestRender();
  }

  _rebuildRoom() {
    disposeChildren(this.roomGroup);
    const room = this.project.layout.room;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(room.width, room.depth),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.roomGroup.add(floor);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xeaf1ff,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(room.width, room.height), wallMaterial.clone());
    backWall.position.set(0, room.height / 2, -room.depth / 2);
    this.roomGroup.add(backWall);

    const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(room.depth, room.height), wallMaterial.clone());
    sideWall.rotation.y = Math.PI / 2;
    sideWall.position.set(-room.width / 2, room.height / 2, 0);
    this.roomGroup.add(sideWall);

    const grid = new THREE.GridHelper(Math.max(room.width, room.depth), Math.max(10, Math.round(Math.max(room.width, room.depth) / 200)), 0xd8e1f0, 0xe8eef8);
    grid.position.y = 1;
    grid.material.opacity = 0.58;
    grid.material.transparent = true;
    this.roomGroup.add(grid);

    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(room.width, room.height, room.depth)),
      new THREE.LineBasicMaterial({ color: 0xc3d0e8 })
    );
    outline.position.y = room.height / 2;
    this.roomGroup.add(outline);

    const wallGuide = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-room.width / 2, 0, -room.depth / 2 + 1),
        new THREE.Vector3(room.width / 2, 0, -room.depth / 2 + 1),
      ]),
      new THREE.LineDashedMaterial({ color: 0x7a90b8, dashSize: 80, gapSize: 40 })
    );
    wallGuide.computeLineDistances();
    wallGuide.position.y = room.wallCabinetBottom;
    this.roomGroup.add(wallGuide);
  }

  _rebuildCabinets() {
    disposeChildren(this.cabinetGroup);
    this.pickMeshes = [];
    this.meshByInstanceId.clear();

    this.instances.forEach((instance) => {
      const placement = instance.placement;
      const pos = getPlacementWorldPosition(this.project, instance);
      const geometrySize = getCabinetGeometrySize(instance);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(geometrySize.width, geometrySize.height, geometrySize.depth),
        new THREE.MeshStandardMaterial({
          color: categoryColor(instance.config.category),
          roughness: 0.82,
          metalness: 0.02,
        })
      );
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.rotation.y = THREE.MathUtils.degToRad(placement.rotation || 0);
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.userData.instanceId = instance.instanceId;
      mesh.userData.baseColor = categoryColor(instance.config.category);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(geometrySize.width, geometrySize.height, geometrySize.depth)),
        new THREE.LineBasicMaterial({ color: 0x6f85ad })
      );
      edges.userData.isEdgeHelper = true;
      mesh.add(edges);

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(geometrySize.width, geometrySize.depth),
        new THREE.MeshBasicMaterial({ color: 0x7d94ba, transparent: true, opacity: 0.08 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -pos.height / 2 + 1;
      mesh.add(shadow);

      this.cabinetGroup.add(mesh);
      this.pickMeshes.push(mesh);
      this.meshByInstanceId.set(instance.instanceId, mesh);
    });

    this._applySelectionStyles();
  }

  _applySelectionStyles() {
    this.meshByInstanceId.forEach((mesh, instanceId) => {
      const material = mesh.material;
      const isSelected = instanceId === this.selectedInstanceId;
      const isSnapTarget = this.snapPreview?.targetInstanceId === instanceId;
      material.color.setHex(mesh.userData.baseColor);
      material.emissive.setHex(isSnapTarget ? 0xd48c13 : isSelected ? 0x1738b8 : 0x000000);
      material.emissiveIntensity = isSnapTarget ? 0.2 : isSelected ? 0.14 : 0;
      mesh.children.forEach((child) => {
        if (child.userData.isEdgeHelper && child.material) {
          child.material.color.setHex(isSnapTarget ? 0xd48c13 : isSelected ? 0x2754ff : 0x6f85ad);
        }
      });
    });
  }

  _fitCamera() {
    if (!this.project) return;
    const room = this.project.layout.room;
    const targetY = Math.max(500, room.height * 0.35);
    this.controls.target.set(0, targetY, 0);
    this.requestRender();
  }

  _onResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  };

  requestRender() {
    if (this._frameRequested) return;
    this._frameRequested = true;
    requestAnimationFrame(() => {
      this._frameRequested = false;
      this.renderer.render(this.scene, this.camera);
    });
  }

  toPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  hitCabinet(event) {
    this.toPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pickMeshes, false);
    return hits[0] || null;
  }

  onPointerDown(event) {
    if (event.button !== 0) return;
    const hit = this.hitCabinet(event);
    if (!hit?.object) return;

    const mesh = hit.object;
    const instanceId = mesh.userData.instanceId;
    this.callbacks.onSelect(instanceId);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -mesh.position.y);
    const point = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, point);

    this.drag = {
      instanceId,
      plane,
      offsetX: point.x - mesh.position.x,
      offsetZ: point.z - mesh.position.z,
    };
    this.controls.enabled = false;
  }

  onPointerMove(event) {
    const hit = this.hitCabinet(event);
    this.renderer.domElement.style.cursor = hit ? 'grab' : 'default';
    if (!this.drag) return;

    this.toPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const point = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, point)) return;

    const instance = this.instances.find((entry) => entry.instanceId === this.drag.instanceId);
    if (!instance) return;

    const room = this.project.layout.room;
    const rotation = instance.placement.rotation || 0;
    const size = getPlacementWorldPosition(this.project, {
      ...instance,
      placement: { ...instance.placement, rotation },
    });

    const snapped = computeSnappedPlacement({
      project: this.project,
      instances: this.instances,
      instanceId: this.drag.instanceId,
      width: size.width,
      depth: size.depth,
      x: clamp(
        snap(point.x - this.drag.offsetX, POSITION_SNAP),
        -room.width / 2 + size.width / 2,
        room.width / 2 - size.width / 2
      ),
      z: clamp(
        snap(point.z - this.drag.offsetZ, POSITION_SNAP),
        -room.depth / 2 + size.depth / 2,
        room.depth / 2 - size.depth / 2
      ),
    });

    this.callbacks.onMove(this.drag.instanceId, snapped);
  }

  onPointerUp() {
    this.drag = null;
    this.controls.enabled = true;
    currentSnapPreview = null;
    if (selectedInstanceId) {
      renderInspectorOnly();
      this.update(this.project, this.instances, this.selectedInstanceId, null);
    }
  }

  onContextMenu(event) {
    event.preventDefault();
    const hit = this.hitCabinet(event);
    const instanceId = hit?.object?.userData?.instanceId || this.selectedInstanceId;
    if (!instanceId) return;
    this.callbacks.onSelect(instanceId);
    this.callbacks.onRotate(instanceId);
  }
}

function computeSnappedPlacement({ project, instances, instanceId, width, depth, x, z }) {
  const room = project.layout.room;
  const halfW = width / 2;
  const halfD = depth / 2;
  const minX = -room.width / 2 + halfW;
  const maxX = room.width / 2 - halfW;
  const minZ = -room.depth / 2 + halfD;
  const maxZ = room.depth / 2 - halfD;

  let nextX = clamp(x, minX, maxX);
  let nextZ = clamp(z, minZ, maxZ);
  let preview = null;

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

  const others = instances.filter((entry) => entry.instanceId !== instanceId);
  for (const other of others) {
    const pos = getPlacementWorldPosition(project, other);
    const sameRotation = normalizeRotationQuarterTurns(other.placement.rotation || 0) === normalizeRotationQuarterTurns((instances.find((entry) => entry.instanceId === instanceId)?.placement.rotation) || 0);
    const otherBounds = {
      left: other.placement.x - pos.width / 2,
      right: other.placement.x + pos.width / 2,
      front: other.placement.z - pos.depth / 2,
      back: other.placement.z + pos.depth / 2,
    };
    const candidate = buildBounds(nextX, nextZ, halfW, halfD);

    if (rangesOverlap(candidate.front, candidate.back, otherBounds.front, otherBounds.back, SNAP_ALIGNMENT_TOLERANCE)) {
      const xNeighborSnap = maybeSnapAxis(nextX, [
        { target: otherBounds.left - halfW, label: `${other.label} left face`, targetInstanceId: other.instanceId },
        { target: otherBounds.right + halfW, label: `${other.label} right face`, targetInstanceId: other.instanceId },
        { target: otherBounds.left + halfW, label: `${other.label} left aligned`, targetInstanceId: other.instanceId },
        { target: otherBounds.right - halfW, label: `${other.label} right aligned`, targetInstanceId: other.instanceId },
      ]);
      nextX = xNeighborSnap.value;
      preview = pickPreview(preview, xNeighborSnap.preview);

      if (sameRotation && xNeighborSnap.preview) {
        const rearAssist = getRearAlignmentAssist({
          rotation: other.placement.rotation || 0,
          otherBounds,
          halfW,
          halfD,
          otherLabel: other.label,
          otherInstanceId: other.instanceId,
        });
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
        { target: otherBounds.front - halfD, label: `${other.label} front face`, targetInstanceId: other.instanceId },
        { target: otherBounds.back + halfD, label: `${other.label} back face`, targetInstanceId: other.instanceId },
        { target: otherBounds.front + halfD, label: `${other.label} rear aligned`, targetInstanceId: other.instanceId },
        { target: otherBounds.back - halfD, label: `${other.label} front aligned`, targetInstanceId: other.instanceId },
      ]);
      nextZ = zNeighborSnap.value;
      preview = pickPreview(preview, zNeighborSnap.preview);

      if (sameRotation && zNeighborSnap.preview) {
        const rearAssist = getRearAlignmentAssist({
          rotation: other.placement.rotation || 0,
          otherBounds,
          halfW,
          halfD,
          otherLabel: other.label,
          otherInstanceId: other.instanceId,
        });
        if (rearAssist?.axis === 'x') {
          const rearSnap = maybeSnapAxis(nextX, [rearAssist.candidate]);
          nextX = rearSnap.value;
          preview = pickPreview(preview, rearSnap.preview);
        }
      }
    }
  }

  return {
    x: clamp(nextX, minX, maxX),
    z: clamp(nextZ, minZ, maxZ),
    preview,
  };
}

function maybeSnapAxis(value, candidates) {
  let next = value;
  let bestDistance = Number.POSITIVE_INFINITY;
  let preview = null;
  for (const candidate of candidates) {
    const threshold = candidate.threshold ?? EDGE_SNAP;
    const distance = Math.abs(candidate.target - value);
    if (distance <= threshold && distance < bestDistance) {
      next = candidate.target;
      bestDistance = distance;
      preview = {
        label: candidate.label,
        targetInstanceId: candidate.targetInstanceId || null,
        distance,
      };
    }
  }
  return { value: next, preview };
}

function rangesOverlap(aMin, aMax, bMin, bMax, tolerance = 0) {
  return aMin <= bMax + tolerance && aMax >= bMin - tolerance;
}

function getRearAlignmentAssist({ rotation, otherBounds, halfW, halfD, otherLabel, otherInstanceId }) {
  switch (normalizeRotationQuarterTurns(rotation)) {
    case 0:
      return {
        axis: 'z',
        candidate: {
          target: otherBounds.front + halfD,
          label: `${otherLabel} rear aligned`,
          targetInstanceId: otherInstanceId,
          threshold: REAR_ALIGN_SNAP,
        },
      };
    case 90:
      return {
        axis: 'x',
        candidate: {
          target: otherBounds.left + halfW,
          label: `${otherLabel} rear aligned`,
          targetInstanceId: otherInstanceId,
          threshold: REAR_ALIGN_SNAP,
        },
      };
    case 180:
      return {
        axis: 'z',
        candidate: {
          target: otherBounds.back - halfD,
          label: `${otherLabel} rear aligned`,
          targetInstanceId: otherInstanceId,
          threshold: REAR_ALIGN_SNAP,
        },
      };
    case 270:
      return {
        axis: 'x',
        candidate: {
          target: otherBounds.right - halfW,
          label: `${otherLabel} rear aligned`,
          targetInstanceId: otherInstanceId,
          threshold: REAR_ALIGN_SNAP,
        },
      };
    default:
      return null;
  }
}

function normalizeRotationQuarterTurns(rotation) {
  const normalized = ((Math.round(Number(rotation) / 90) || 0) % 4 + 4) % 4;
  return normalized * 90;
}

function buildBounds(x, z, halfW, halfD) {
  return {
    left: x - halfW,
    right: x + halfW,
    front: z - halfD,
    back: z + halfD,
  };
}

function pickPreview(current, candidate) {
  if (!candidate) return current;
  if (!current) return candidate;
  return candidate.distance < current.distance ? candidate : current;
}

function categoryColor(category) {
  switch (category) {
    case 'wall': return 0xe7f0ff;
    case 'tall': return 0xf2f6ff;
    default: return 0xf8fbff;
  }
}

function getCabinetGeometrySize(instance) {
  return {
    width: Math.max(1, Number(instance.config.width) || 1),
    height: Math.max(1, Number(instance.config.height) || 1),
    depth: Math.max(1, Number(instance.config.depth) || 1),
  };
}

function disposeChildren(group) {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose());
        else node.material.dispose();
      }
    });
  }
}

function snap(value, increment) {
  return Math.round(value / increment) * increment;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMm(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
