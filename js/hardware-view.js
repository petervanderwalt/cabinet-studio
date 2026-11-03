import * as THREE from 'three';
import { HARDWARE_MODELS } from './hardware-models.js?v=20261103c';

export function addHardwareModels(mesh, panel) {
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
    if (!data) continue;
    const hardware = manufacturerMesh(data);
    hardware.userData.isHardwareModel = true;
    hardware.userData.closedOnly = Boolean(placement.closedOnly);
    hardware.position.set(placement.x, placement.y, placement.z);
    hardware.rotation.z = placement.rotation;
    hardware.scale.x = placement.mirrorX || 1;
    mesh.add(hardware);
  }
}

function manufacturerMesh(data) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color:0xb8bdc3,metalness:0.35,roughness:0.4,
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
