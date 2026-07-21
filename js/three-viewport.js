import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPanelMaterial, disposePanelMaterial } from './viewport-materials.js';

export class CabinetViewport {
  constructor(container) {
    this.container = container;
    this.panelGroup = new THREE.Group();
    this.interactiveMeshes = [];
    this.animStates = new Map();
    this.showEdges = false;
    this._renderRequested = false;
    this._isDisposed = false;
    this._lastHoverMesh = null;
    this._initScene();
    this._setupPicker();
  }

  _initScene() {
    const { container } = this;
    this.fogColor = 0xf8f9fb;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(this.fogColor);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(this.fogColor, 4000, 14000);

    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(35, aspect, 1, 20000);
    this.camera.position.set(1500, 1200, -1500);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(400, 360, 280);
    this.controls.addEventListener('change', () => {
      this._updateFog();
      this._requestRender();
    });
    this.controls.update();

    const ambient = new THREE.AmbientLight(0xffffff, 1.12);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.14);
    dirLight.position.set(1000, 2000, 1500);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xfafcff, 0.34);
    fillLight.position.set(-800, 1000, -1000);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.14);
    rimLight.position.set(0, -500, 1500);
    this.scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(3000, 30, 0xd8dde6, 0xeff2f7);
    gridHelper.position.y = -0.5;
    gridHelper.material.opacity = 0.48;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    this.scene.add(this.panelGroup);

    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(container);

    this._requestRender();
  }

  _updateFog() {
    const dist = this.camera.position.distanceTo(this.controls.target);
    this.scene.fog.near = Math.max(4000, dist * 2.4);
    this.scene.fog.far = Math.max(14000, dist * 6.5);
  }

  _onResize() {
    const { container, renderer, camera } = this;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    this._requestRender();
  }

  _setupPicker() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    const dom = this.renderer.domElement;
    dom.addEventListener('click', (e) => this._onClick(e));
    dom.addEventListener('pointermove', (e) => this._onPointerMove(e));
  }

  _hitTest(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = this.interactiveMeshes.map(e => e.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  _onPointerMove(event) {
    const hit = this._hitTest(event.clientX, event.clientY);
    if (hit !== this._lastHoverMesh) {
      this._lastHoverMesh = hit;
      this.renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
    }
  }

  _onClick(event) {
    const hit = this._hitTest(event.clientX, event.clientY);
    if (hit) {
      const entry = this.interactiveMeshes.find(e => e.mesh === hit);
      if (entry) this._toggleAnim(entry.panel);
    }
  }

  _toggleAnim(panel) {
    const state = this.animStates.get(panel.id);
    if (!state) return;
    state.target = state.target === 0 ? state.max : 0;
    this._requestRender();
  }

  _disposeNode(node) {
    if (node.geometry) node.geometry.dispose();
    if (node.material) disposePanelMaterial(node.material);
    for (let i = node.children.length - 1; i >= 0; i--) {
      this._disposeNode(node.children[i]);
    }
  }

  _clearScene() {
    while (this.panelGroup.children.length > 0) {
      const child = this.panelGroup.children[0];
      this._disposeNode(child);
      this.panelGroup.remove(child);
    }
  }

  update(panels) {
    this._clearScene();

    this.animStates.clear();
    this.interactiveMeshes = [];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const p of panels) {
      const hx = p.sizeX / 2;
      const hy = p.sizeY / 2;
      const hz = p.sizeZ / 2;
      minX = Math.min(minX, p.posX - hx);
      maxX = Math.max(maxX, p.posX + hx);
      minY = Math.min(minY, p.posY - hy);
      maxY = Math.max(maxY, p.posY + hy);
      minZ = Math.min(minZ, p.posZ - hz);
      maxZ = Math.max(maxZ, p.posZ + hz);
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 300);

    this.controls.target.set(cx, cy, cz);

    if (!this._lastSize || Math.abs(this._lastSize - size) > 50) {
      const dist = size * 1.8;
      this.camera.position.set(cx + dist * 0.7, cy + dist * 0.6, cz - dist);
      this._lastSize = size;
    }
    this.controls.update();
    this._updateFog();

    // Group drawer panels by drawer index
    const drawerPanelsByIndex = new Map();
    for (const p of panels) {
      const m = p.id.match(/^drawer-(\d+)/);
      if (m) {
        const idx = m[1];
        if (!drawerPanelsByIndex.has(idx)) drawerPanelsByIndex.set(idx, []);
        drawerPanelsByIndex.get(idx).push(p);
      }
    }

    for (const p of panels) {
      if (p.type === 'door') {
        this._addDoor(p);
      } else if (p.type === 'drawer' || p.type === 'drawer-box') {
        // handled via drawer groups below
      } else {
        const mesh = this._buildPanelMesh(p);
        if (mesh) this.panelGroup.add(mesh);
      }
    }

    for (const [, drawerPanels] of drawerPanelsByIndex) {
      this._addDrawerGroup(drawerPanels);
    }

    this._requestRender();
  }

  setShowEdges(showEdges) {
    this.showEdges = Boolean(showEdges);
    this.panelGroup.traverse((node) => {
      if (node.userData?.isPanelEdgeHelper) {
        node.visible = this.showEdges;
      }
    });
    this._requestRender();
  }

  _addDoor(p) {
    const mesh = this._buildPanelMesh(p);
    const hingeSide = p.hingeSide || 'left';
    const pivotX = hingeSide === 'left' ? p.posX - p.sizeX / 2 : p.posX + p.sizeX / 2;
    const sign = hingeSide === 'left' ? 1 : -1;
    const doorThickness = p.sizeZ || 18;

    const pivot = new THREE.Object3D();
    pivot.position.set(pivotX, p.posY, 0);
    this.panelGroup.add(pivot);

    const offsetX = hingeSide === 'left' ? p.sizeX / 2 : -p.sizeX / 2;
    mesh.position.set(offsetX, 0, p.posZ);
    pivot.add(mesh);

    this.interactiveMeshes.push({ mesh, panel: p });
    this.animStates.set(p.id, {
      type: 'door',
      pivotGroup: pivot,
      sign,
      pivotBaseX: pivotX,
      pivotBaseZ: 0,
      doorThickness,
      hingeClearance: 1.5,
      hingeForwardTravel: Math.max(25, doorThickness * 1.4),
      current: 0,
      target: 0,
      max: THREE.MathUtils.degToRad(110),
    });
  }

  _applyConcealedHingeMotion(state) {
    const theta = state.current;
    const inward = (state.doorThickness + state.hingeClearance) * Math.sin(theta);
    const forward = state.hingeForwardTravel * Math.sin(theta / 2) ** 2;
    state.pivotGroup.position.x = state.pivotBaseX + state.sign * inward;
    state.pivotGroup.position.z = state.pivotBaseZ - forward;
    state.pivotGroup.rotation.y = state.sign * theta;
  }

  _addDrawerGroup(panels) {
    const group = new THREE.Group();
    let frontPanel = null;
    let frontMesh = null;

    for (const p of panels) {
      const mesh = this._buildPanelMesh(p);
      mesh.position.set(p.posX, p.posY, p.posZ);
      group.add(mesh);
      if (p.type === 'drawer') {
        frontPanel = p;
        frontMesh = mesh;
      }
    }

    this.panelGroup.add(group);

    if (frontMesh) {
      this.interactiveMeshes.push({ mesh: frontMesh, panel: frontPanel });
    }

    const drawDepth = frontPanel?.drawDepth || 400;
    this.animStates.set(frontPanel?.id || `drawer-${Date.now()}`, {
      type: 'drawer',
      group,
      current: 0,
      target: 0,
      max: drawDepth * 0.8,
    });
  }

  _buildPanelMesh(p) {
    const hasNotch = p.notches && p.notches.length > 0;
    let geometry;

    if (hasNotch) {
      geometry = this._buildNotchedGeometry(p);
    } else {
      geometry = new THREE.BoxGeometry(p.sizeX, p.sizeY, p.sizeZ);
    }

    const material = createPanelMaterial(p);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this._addEdgeHelper(mesh, geometry);
    this._addHoleMarkers(mesh, p);
    mesh.position.set(p.posX, p.posY, p.posZ);
    return mesh;
  }

  _addEdgeHelper(mesh, geometry) {
    const edgeGeometry = new THREE.EdgesGeometry(geometry, 18);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x28456f,
      transparent: true,
      opacity: 0.42,
      depthTest: true,
      depthWrite: false,
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.userData.isPanelEdgeHelper = true;
    edges.visible = this.showEdges;
    edges.renderOrder = 12;
    mesh.add(edges);
  }

  _addHoleMarkers(mesh, p) {
    if (!p.holes || p.holes.length === 0) return;

    for (const hole of p.holes) {
      const marker = this._buildHoleMarker(hole, p);
      if (marker) mesh.add(marker);
    }

    this._addDrawerRunnerReferenceLines(mesh, p);
  }

  _addDrawerRunnerReferenceLines(mesh, p) {
    if (p.id !== 'side-left' && p.id !== 'side-right') return;

    const runnerHoles = p.holes.filter((hole) => hole.purpose === 'drawer-runner-reference');
    if (runnerHoles.length < 2) return;

    const holesByY = new Map();
    for (const hole of runnerHoles) {
      const key = Math.round(hole.y * 10) / 10;
      if (!holesByY.has(key)) holesByY.set(key, []);
      holesByY.get(key).push(hole);
    }

    const offset = 0.7;
    const faceX = p.id === 'side-left' ? p.sizeX / 2 + offset : -p.sizeX / 2 - offset;
    const material = new THREE.MeshBasicMaterial({
      color: this._holeMarkerColor('drawer-runner-reference'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });

    for (const holes of holesByY.values()) {
      if (holes.length < 2) continue;

      const minX = Math.min(...holes.map((hole) => hole.x));
      const maxX = Math.max(...holes.map((hole) => hole.x));
      const lineLength = Math.max(12, maxX - minX + 18);
      const lineHeight = 4;
      const geometry = new THREE.PlaneGeometry(lineLength, lineHeight);
      const line = new THREE.Mesh(geometry, material);
      line.rotation.y = Math.PI / 2;
      line.position.set(
        faceX,
        holes[0].y - p.cutHeight / 2,
        ((minX + maxX) / 2) - p.cutWidth / 2,
      );
      line.renderOrder = 9;
      mesh.add(line);
    }
  }

  _buildHoleMarker(hole, p) {
    const radius = hole.purpose === 'hinge-cup'
      ? (hole.diameter || 35) / 2
      : Math.max(3, (hole.diameter || 5) * 0.9);
    const geometry = new THREE.CircleGeometry(radius, 24);
    const material = new THREE.MeshBasicMaterial({
      color: this._holeMarkerColor(hole.purpose),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const marker = new THREE.Mesh(geometry, material);
    const offset = 0.8;

    if (p.type === 'door' || p.type === 'drawer') {
      const faceZ = hole.purpose === 'hinge-cup'
        ? p.sizeZ / 2 + offset
        : -p.sizeZ / 2 - offset;
      marker.position.set(hole.x - p.cutWidth / 2, hole.y - p.cutHeight / 2, faceZ);
    } else if (p.type === 'drawer-box' && p.id.includes('-side-')) {
      marker.position.set(0, hole.y - p.cutHeight / 2, hole.x - p.cutWidth / 2);
      marker.rotation.y = Math.PI / 2;
      marker.position.x = p.id.includes('side-left') ? -p.sizeX / 2 - offset : p.sizeX / 2 + offset;
    } else if (p.id === 'side-left' || p.id === 'side-right') {
      marker.position.set(0, hole.y - p.cutHeight / 2, hole.x - p.cutWidth / 2);
      marker.rotation.y = Math.PI / 2;
      marker.position.x = p.id === 'side-left' ? p.sizeX / 2 + offset : -p.sizeX / 2 - offset;
    } else {
      marker.position.set(hole.x - p.cutWidth / 2, hole.y - p.cutHeight / 2, p.sizeZ / 2 + offset);
    }

    marker.renderOrder = 10;
    return marker;
  }

  _holeMarkerColor(purpose) {
    switch (purpose) {
      case 'handle': return 0x3c61ff;
      case 'hinge-cup':
      case 'hinge-mounting-plate': return 0x5a84d8;
      case 'shelf-pin': return 0x63a3b0;
      case 'drawer-runner-reference':
      case 'drawer-slide-reference': return 0x2747d9;
      default: return 0x28456f;
    }
  }

  _buildNotchedGeometry(p) {
    const notch = p.notches[0];
    const pw = p.cutWidth;
    const ph = p.cutHeight;
    const pt = p.cutThickness;
    const nw = notch.width;
    const nh = notch.height;

    const shape = new THREE.Shape();
    shape.moveTo(pw, 0);
    shape.lineTo(pw, ph);
    shape.lineTo(0, ph);
    shape.lineTo(0, nh);
    shape.lineTo(nw, nh);
    shape.lineTo(nw, 0);
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: pt,
      bevelEnabled: false,
    });

    geom.translate(-pw / 2, -ph / 2, -pt / 2);
    geom.rotateY(-Math.PI / 2);

    return geom;
  }

  _requestRender() {
    if (this._renderRequested || this._isDisposed) return;
    this._renderRequested = true;
    requestAnimationFrame(() => {
      this._renderRequested = false;
      this._renderFrame();
    });
  }

  _renderFrame() {
    const speed = 0.25;
    let hasActiveAnimation = false;
    for (const state of this.animStates.values()) {
      state.current += (state.target - state.current) * speed;
      if (Math.abs(state.current - state.target) < 0.001) {
        state.current = state.target;
      } else {
        hasActiveAnimation = true;
      }
      if (state.type === 'door') {
        this._applyConcealedHingeMotion(state);
      } else if (state.type === 'drawer') {
        state.group.position.z = -state.current;
      }
    }

    this._updateFog();
    this.renderer.render(this.scene, this.camera);

    if (hasActiveAnimation) {
      this._requestRender();
    }
  }

  dispose() {
    this._isDisposed = true;
    window.removeEventListener('resize', this._onResize);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._clearScene();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
