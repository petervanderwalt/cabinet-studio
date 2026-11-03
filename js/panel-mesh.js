import * as THREE from 'three';
import { panelSolidData } from './panel-solid.js';

export function basicPanelGeometry(panel) {
  const solid = panelSolidData(panel, 0.02);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(solid.positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(solid.uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

export function machinedPanelGeometry(panel, model) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(model.vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(model.normals, 3));
  geometry.setIndex(model.triangles);
  const uv = [];
  for (let i = 0; i < model.vertices.length; i += 3) {
    const n = model.normals.slice(i, i + 3).map(Math.abs);
    const axes = n[0] > n[1] && n[0] > n[2] ? [2, 1] : n[1] > n[2] ? [0, 2] : [0, 1];
    for (const axis of axes) uv.push(model.vertices[i + axis] / [panel.sizeX, panel.sizeY, panel.sizeZ][axis] + 0.5);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geometry;
}
