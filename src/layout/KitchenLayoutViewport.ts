import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getPlacementWorldPosition, layoutFootprint, normalizeProject } from '../engine';
import type { CabinetInstance, Project, SnapPreview } from '../types';
import { clamp, computeSnappedPlacement, POSITION_SNAP, snap } from './snapping';

export interface ViewportCallbacks {
  onSelect: (instanceId: string) => void;
  onMove: (instanceId: string, position: { x: number; z: number; preview: SnapPreview | null }) => void;
  onRotate: (instanceId: string) => void;
  onDragEnd: () => void;
}

interface DragState {
  instanceId: string;
  plane: THREE.Plane;
  offsetX: number;
  offsetZ: number;
}

type CabinetMesh = THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;

const PALETTES = {
  light: {
    background: 0xf7faff, floor: 0xffffff, wall: 0xeaf1ff, grid: [0xd8e1f0, 0xe8eef8], outline: 0xc3d0e8,
    cabinet: { wall: 0xe7f0ff, tall: 0xf2f6ff, base: 0xf8fbff }, edge: 0x6f85ad,
  },
  dark: {
    background: 0x131b2e, floor: 0x1b263e, wall: 0x24324f, grid: [0x3a4766, 0x27324d], outline: 0x4a5a80,
    cabinet: { wall: 0x7d8fb8, tall: 0x8c9dc4, base: 0x95a6cc }, edge: 0x2a3552,
  },
} as const;

type Palette = (typeof PALETTES)[keyof typeof PALETTES];

function categoryColor(palette: Palette, category: string): number {
  return category === 'wall' ? palette.cabinet.wall : category === 'tall' || category === 'wardrobe' ? palette.cabinet.tall : palette.cabinet.base;
}

function disposeChildren(group: THREE.Group): void {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse((node) => {
      const mesh = node as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
  }
}

export class KitchenLayoutViewport {
  private scene = new THREE.Scene();
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  private camera = new THREE.PerspectiveCamera(42, 1, 1, 40000);
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private roomGroup = new THREE.Group();
  private cabinetGroup = new THREE.Group();
  private pickMeshes: CabinetMesh[] = [];
  private meshByInstanceId = new Map<string, CabinetMesh>();
  private drag: DragState | null = null;
  private resizeObserver: ResizeObserver;
  private frameRequested = false;
  private disposed = false;

  private project: Project | null = null;
  private instances: CabinetInstance[] = [];
  private selectedInstanceId: string | null = null;
  private snapPreview: SnapPreview | null = null;
  private palette: Palette = PALETTES.light;

  constructor(private container: HTMLElement, private callbacks: ViewportCallbacks) {
    this.scene.background = new THREE.Color(0xf7faff);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(2600, 2200, 2600);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 600, 0);
    this.controls.addEventListener('change', () => this.requestRender());

    this.scene.add(this.roomGroup, this.cabinetGroup);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.12));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(1800, 2600, 1400);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf4f8ff, 0.5);
    fillLight.position.set(-1800, 1600, -1200);
    this.scene.add(fillLight);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointerleave', this.onPointerUp);
    dom.addEventListener('contextmenu', this.onContextMenu);

    window.addEventListener('resize', this.onResize);
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(container);
    this.onResize();
  }

  update(project: Project, instances: CabinetInstance[], selectedInstanceId: string | null, snapPreview: SnapPreview | null = null): void {
    this.project = normalizeProject(project);
    this.instances = instances;
    this.selectedInstanceId = selectedInstanceId;
    this.snapPreview = snapPreview;
    this.rebuildRoom();
    this.rebuildCabinets();
    this.fitCamera();
    this.requestRender();
  }

  setDark(dark: boolean): void {
    this.palette = dark ? PALETTES.dark : PALETTES.light;
    this.scene.background = new THREE.Color(this.palette.background);
    if (this.project) {
      this.rebuildRoom();
      this.rebuildCabinets();
    }
    this.requestRender();
  }

  setSelection(instanceId: string | null, snapPreview: SnapPreview | null = this.snapPreview): void {
    this.selectedInstanceId = instanceId;
    this.snapPreview = snapPreview;
    this.applySelectionStyles();
    this.requestRender();
  }

  dispose(): void {
    this.disposed = true;
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointerleave', this.onPointerUp);
    dom.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('resize', this.onResize);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    disposeChildren(this.roomGroup);
    disposeChildren(this.cabinetGroup);
    this.renderer.dispose();
    dom.remove();
  }

  private rebuildRoom(): void {
    if (!this.project) return;
    disposeChildren(this.roomGroup);
    const room = this.project.layout.room;

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(room.width, room.depth),
      new THREE.MeshStandardMaterial({ color: this.palette.floor, transparent: true, opacity: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.roomGroup.add(floor);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: this.palette.wall,
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
    wallMaterial.dispose();

    const grid = new THREE.GridHelper(
      Math.max(room.width, room.depth),
      Math.max(10, Math.round(Math.max(room.width, room.depth) / 200)),
      this.palette.grid[0],
      this.palette.grid[1],
    );
    grid.position.y = 1;
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.opacity = 0.58;
    gridMaterial.transparent = true;
    this.roomGroup.add(grid);

    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(room.width, room.height, room.depth)),
      new THREE.LineBasicMaterial({ color: this.palette.outline }),
    );
    outline.position.y = room.height / 2;
    this.roomGroup.add(outline);

    const wallGuide = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-room.width / 2, 0, -room.depth / 2 + 1),
        new THREE.Vector3(room.width / 2, 0, -room.depth / 2 + 1),
      ]),
      new THREE.LineDashedMaterial({ color: 0x7a90b8, dashSize: 80, gapSize: 40 }),
    );
    wallGuide.computeLineDistances();
    wallGuide.position.y = room.wallCabinetBottom;
    this.roomGroup.add(wallGuide);
  }

  private rebuildCabinets(): void {
    const project = this.project;
    if (!project) return;
    disposeChildren(this.cabinetGroup);
    this.pickMeshes = [];
    this.meshByInstanceId.clear();

    for (const instance of this.instances) {
      const pos = getPlacementWorldPosition(project, instance);
      const size = layoutFootprint(instance.config);
      const color = categoryColor(this.palette, instance.config.category);
      const mesh: CabinetMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.width, size.height, size.depth),
        new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02 }),
      );
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.rotation.y = THREE.MathUtils.degToRad(instance.placement.rotation || 0);
      mesh.receiveShadow = true;
      mesh.userData.instanceId = instance.instanceId;
      mesh.userData.baseColor = color;

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size.width, size.height, size.depth)),
        new THREE.LineBasicMaterial({ color: this.palette.edge }),
      );
      edges.userData.isEdgeHelper = true;
      mesh.add(edges);

      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(size.width, size.depth),
        new THREE.MeshBasicMaterial({ color: 0x7d94ba, transparent: true, opacity: 0.08 }),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -pos.height / 2 + 1;
      mesh.add(shadow);

      this.cabinetGroup.add(mesh);
      this.pickMeshes.push(mesh);
      this.meshByInstanceId.set(instance.instanceId, mesh);
    }

    this.applySelectionStyles();
  }

  private applySelectionStyles(): void {
    this.meshByInstanceId.forEach((mesh, instanceId) => {
      const material = mesh.material;
      const isSelected = instanceId === this.selectedInstanceId;
      const isSnapTarget = this.snapPreview?.targetInstanceId === instanceId;
      material.color.setHex(mesh.userData.baseColor);
      material.emissive.setHex(isSnapTarget ? 0xd48c13 : isSelected ? 0x1738b8 : 0x000000);
      material.emissiveIntensity = isSnapTarget ? 0.2 : isSelected ? 0.14 : 0;
      for (const child of mesh.children) {
        const line = child as THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
        if (line.userData.isEdgeHelper && line.material) {
          line.material.color.setHex(isSnapTarget ? 0xd48c13 : isSelected ? 0x2754ff : this.palette.edge);
        }
      }
    });
  }

  private fitCamera(): void {
    if (!this.project) return;
    const room = this.project.layout.room;
    this.controls.target.set(0, Math.max(500, room.height * 0.35), 0);
    this.requestRender();
  }

  private onResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  };

  private requestRender(): void {
    if (this.frameRequested || this.disposed) return;
    this.frameRequested = true;
    requestAnimationFrame(() => {
      this.frameRequested = false;
      if (!this.disposed) this.renderer.render(this.scene, this.camera);
    });
  }

  private toPointer(event: PointerEvent | MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private hitCabinet(event: PointerEvent | MouseEvent): THREE.Intersection | null {
    this.toPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.pickMeshes, false)[0] ?? null;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const hit = this.hitCabinet(event);
    if (!hit?.object) return;

    const mesh = hit.object;
    const instanceId = mesh.userData.instanceId as string;
    this.callbacks.onSelect(instanceId);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -mesh.position.y);
    const point = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, point);

    this.drag = { instanceId, plane, offsetX: point.x - mesh.position.x, offsetZ: point.z - mesh.position.z };
    this.controls.enabled = false;
  };

  private onPointerMove = (event: PointerEvent): void => {
    const hit = this.hitCabinet(event);
    this.renderer.domElement.style.cursor = hit ? 'grab' : 'default';
    if (!this.drag || !this.project) return;

    this.toPointer(event);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const point = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, point)) return;

    const instance = this.instances.find((entry) => entry.instanceId === this.drag?.instanceId);
    if (!instance) return;

    const room = this.project.layout.room;
    const size = getPlacementWorldPosition(this.project, instance);
    const snapped = computeSnappedPlacement({
      project: this.project,
      instances: this.instances,
      instanceId: this.drag.instanceId,
      width: size.width,
      depth: size.depth,
      x: clamp(snap(point.x - this.drag.offsetX, POSITION_SNAP), -room.width / 2 + size.width / 2, room.width / 2 - size.width / 2),
      z: clamp(snap(point.z - this.drag.offsetZ, POSITION_SNAP), -room.depth / 2 + size.depth / 2, room.depth / 2 - size.depth / 2),
    });

    this.callbacks.onMove(this.drag.instanceId, snapped);
  };

  private onPointerUp = (): void => {
    const wasDragging = this.drag !== null;
    this.drag = null;
    this.controls.enabled = true;
    if (wasDragging) this.callbacks.onDragEnd();
  };

  private onContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    const hit = this.hitCabinet(event);
    const instanceId = (hit?.object?.userData?.instanceId as string | undefined) || this.selectedInstanceId;
    if (!instanceId) return;
    this.callbacks.onSelect(instanceId);
    this.callbacks.onRotate(instanceId);
  };
}
