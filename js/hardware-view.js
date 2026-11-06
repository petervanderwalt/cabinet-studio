import * as THREE from 'three';
import { HARDWARE_MODELS, loadLocalBlumPreview } from './hardware-models.js?v=20261106aq';

const blumPreviewFiles = {
  'blum-71b3550': 'clip-top',
  'blum-71b3550-arm': 'clip-top',
  'blum-71b3550-cup': 'clip-top',
  'blum-173h7100': 'clip-top',
  'blum-71b3750': 'clip-top-inset',
  'blum-71b3750-cup': 'clip-top-inset',
  'blum-71b3750-arm': 'clip-top-inset',
  'blum-173h7100-inset': 'clip-top-inset',
  'blum-t51.7601l': 'movento-lock-left',
  'blum-t51.7601r': 'movento-lock-right',
};
const previewRequests = new Map();

function loadBlumModel(model) {
  const file = blumPreviewFiles[model];
  if (!previewRequests.has(file)) {
    const url = new URL(`../assets/hardware/private/${file}.json?v=20261106ao`, import.meta.url);
    const request = fetch(url, { cache:'no-cache' })
      .then(async response => {
        if (!response.ok) {
          previewRequests.delete(file);
          return;
        }
        loadLocalBlumPreview(await response.json(), file);
      })
      .catch(error => {
        previewRequests.delete(file);
        console.warn('Could not load Blum hardware model', error);
      });
    previewRequests.set(file, request);
  }
  return previewRequests.get(file).then(() => HARDWARE_MODELS[model]);
}

export function addHardwareModels(mesh, panel, requestRender, animateHinges = false) {
  let pending = 0;
  for (const placement of panel.hardwareModels || []) {
    if (placement.kind === 'runner-preview') {
      const data = HARDWARE_MODELS[placement.model];
      const rail = data ? manufacturerMesh(data) : buildRunnerPreview(placement);
      rail.position.set(placement.x, placement.y, placement.z);
      rail.scale.x = placement.direction;
      rail.userData = { isHardwareModel:true, runnerStage:placement.stage,
        drawerId:placement.drawerId, baseZ:placement.z, travelFactor:placement.travelFactor ?? 0.5 };
      mesh.add(rail);
      continue;
    }
    const data = HARDWARE_MODELS[placement.model];
    if (!data && !Object.hasOwn(blumPreviewFiles, placement.model)) continue;
    const hardware = data ? manufacturerMesh(data) : new THREE.Group();
    if (!data) {
      pending++;
      loadBlumModel(placement.model).then(model => {
        let root = hardware;
        while (root.parent) root = root.parent;
        if (!root.isScene) return;
        if (model) hardware.add(manufacturerMesh(model));
        requestRender?.(Boolean(model));
      });
    }
    hardware.userData.isHardwareModel = true;
    hardware.userData.closedOnly = Boolean(placement.closedOnly);
    if (placement.drawerId) hardware.userData.drawerId = placement.drawerId;
    hardware.position.set(placement.x, placement.y, placement.z);
    hardware.rotation.z = placement.rotation;
    hardware.scale.x = placement.mirrorX || 1;
    mesh.add(hardware);
    if (animateHinges && data?.manufacturer === 'Hettich' && panel.type === 'door' && placement.closedOnly) {
      const cup = manufacturerMesh({ ...data, positions:hettichCupPositions(data.positions) });
      cup.position.copy(hardware.position);
      cup.rotation.copy(hardware.rotation);
      cup.scale.copy(hardware.scale);
      cup.userData = { isHardwareModel:true, openOnly:true };
      cup.visible = false;
      mesh.add(cup);
    }
  }
  return pending;
}

function hettichCupPositions(positions) {
  // These fused STEP models put the cup flange 3 mm above the door mounting face.
  const cup = [];
  for (let i = 0; i < positions.length; i += 9) {
    if (Math.max(positions[i + 2], positions[i + 5], positions[i + 8]) <= 3.001) {
      cup.push(...positions.slice(i, i + 9));
    }
  }
  return cup;
}

function manufacturerMesh(data) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color:data.previewColor ?? 0xb8bdc3,metalness:0.35,roughness:0.4,
  }));
  mesh.name = `${data.manufacturer} ${data.partNumber}`;
  return mesh;
}

function buildRunnerPreview(p) {
  const rail = new THREE.Group();
  rail.name = `Accuride 3832E — ${p.stage} (simplified)`;
  const shape = new THREE.Shape();
  shape.moveTo(-p.length/2,-p.height/2); shape.lineTo(p.length/2,-p.height/2);
  shape.lineTo(p.length/2,p.height/2); shape.lineTo(-p.length/2,p.height/2); shape.closePath();
  for (const mount of p.mounts) {
    const hole = new THREE.Path();
    hole.absarc(-mount.z, mount.y, 2.3, 0, Math.PI*2, true);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {depth:1.2,bevelEnabled:false,curveSegments:12});
  geometry.rotateY(Math.PI/2);
  const material = () => new THREE.MeshStandardMaterial({color:0xb8bdc3,metalness:0.35,roughness:0.4});
  rail.add(new THREE.Mesh(geometry,material()));
  for (const sign of [-1,1]) {
    const lip = new THREE.Mesh(new THREE.BoxGeometry(p.depth,1.2,p.length),material());
    lip.position.set(p.depth/2, sign*(p.height/2-0.6),0);
    rail.add(lip);
  }
  return rail;
}
