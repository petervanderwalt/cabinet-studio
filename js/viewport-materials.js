import * as THREE from 'three';

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let n = Math.imul(t ^ (t >>> 15), t | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function mixHex(a, b, amount) {
  const c1 = new THREE.Color(a);
  const c2 = new THREE.Color(b);
  return c1.lerp(c2, amount).getHex();
}

function classifyMaterial(label = '') {
  const value = label.toLowerCase();
  if (value.includes('hardboard') && value.includes('white')) return 'white-hardboard';
  if (value.includes('oak')) return 'oak';
  if (value.includes('ply') || value.includes('birch')) return 'ply';
  if (value.includes('hardboard')) return 'hardboard';
  if (value.includes('mdf')) return value.includes('paint') ? 'painted-mdf' : 'mdf';
  if (value.includes('gloss')) return 'gloss';
  if (value.includes('storm grey') || value.includes('gray') || value.includes('grey')) return 'grey-melamine';
  if (value.includes('white')) return 'white-melamine';
  return 'wood-default';
}

function defaultGrainDirection(panel) {
  if (panel.type === 'drawer') return 'horizontal';
  if (panel.type === 'door' || panel.type === 'back' || panel.type === 'face-frame') return 'vertical';
  return 'vertical';
}

function createCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function drawWhiteMelamine(ctx, rand, size) {
  ctx.fillStyle = '#fcfcfc';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 140; i++) {
    const shade = Math.floor(244 + rand() * 6);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.035)`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 1.2, 1 + rand() * 1.2);
  }
}

function drawGreyMelamine(ctx, rand, size) {
  ctx.fillStyle = '#d8dde5';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 360; i++) {
    const shade = Math.floor(172 + rand() * 34);
    ctx.fillStyle = `rgba(${shade}, ${shade + 4}, ${shade + 10}, 0.14)`;
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2);
  }
}

function drawWood(ctx, rand, size, palette) {
  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 26; i++) {
    const y = (i / 26) * size;
    ctx.fillStyle = i % 2 === 0 ? palette.bandA : palette.bandB;
    ctx.fillRect(0, y, size, size / 26 + 1);
  }

  ctx.lineWidth = 1.2;
  for (let i = 0; i < 38; i++) {
    ctx.strokeStyle = rand() > 0.82 ? palette.accent : palette.line;
    ctx.beginPath();
    const startY = rand() * size;
    ctx.moveTo(0, startY);
    for (let x = 0; x <= size; x += 24) {
      const offset = (rand() - 0.5) * 18;
      ctx.lineTo(x, startY + Math.sin((x / size) * Math.PI * 2 + rand() * Math.PI) * 6 + offset);
    }
    ctx.stroke();
  }
}

function drawHardboard(ctx, rand, size) {
  ctx.fillStyle = '#b68458';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(111, 70, 41, 0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    const y = rand() * size;
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 18) {
      ctx.lineTo(x, y + (rand() - 0.5) * 8);
    }
    ctx.stroke();
  }
}

function drawSolid(ctx, size, base, overlay = null) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  if (overlay) {
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, size, size);
  }
}

function baseColorForKind(kind, fallback) {
  switch (kind) {
    case 'white-melamine':
      return 0xfcfcfc;
    case 'white-hardboard':
      return 0xf8f8f7;
    case 'painted-mdf':
      return 0xfbfbfa;
    case 'gloss':
      return 0xfdfdfd;
    case 'grey-melamine':
      return 0xd7dbe2;
    case 'oak':
      return 0xd8bf97;
    case 'ply':
      return 0xc9ad84;
    case 'hardboard':
      return 0xb68458;
    case 'mdf':
      return 0xc7ab8f;
    default:
      return fallback;
  }
}

function createTextureForPanel(panel) {
  const size = 256;
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  const label = panel.materialLabel || panel.name || 'panel';
  const rand = mulberry32(hashString(`${label}:${panel.id || panel.type}`));
  const kind = classifyMaterial(label);

  switch (kind) {
    case 'white-melamine':
      drawWhiteMelamine(ctx, rand, size);
      break;
    case 'grey-melamine':
      drawGreyMelamine(ctx, rand, size);
      break;
    case 'oak':
      drawWood(ctx, rand, size, {
        base: '#d8bf97',
        bandA: 'rgba(182, 145, 98, 0.16)',
        bandB: 'rgba(236, 214, 181, 0.12)',
        line: 'rgba(122, 89, 52, 0.38)',
        accent: 'rgba(152, 111, 63, 0.48)',
      });
      break;
    case 'ply':
      drawWood(ctx, rand, size, {
        base: '#c9ad84',
        bandA: 'rgba(172, 137, 96, 0.16)',
        bandB: 'rgba(235, 214, 188, 0.12)',
        line: 'rgba(105, 77, 48, 0.3)',
        accent: 'rgba(147, 112, 70, 0.42)',
      });
      break;
    case 'hardboard':
      drawHardboard(ctx, rand, size);
      break;
    case 'white-hardboard':
      drawSolid(ctx, size, '#f8f8f7');
      ctx.strokeStyle = 'rgba(198, 198, 198, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        const y = rand() * size;
        ctx.moveTo(0, y);
        for (let x = 0; x <= size; x += 20) {
          ctx.lineTo(x, y + (rand() - 0.5) * 4);
        }
        ctx.stroke();
      }
      break;
    case 'painted-mdf':
      drawSolid(ctx, size, '#fbfbfa', 'rgba(255,255,255,0.05)');
      break;
    case 'mdf':
      drawSolid(ctx, size, '#c7ab8f');
      break;
    case 'gloss':
      drawSolid(ctx, size, '#f8f8f7');
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(0, 0, size, size * 0.35);
      break;
    default:
      drawWood(ctx, rand, size, {
        base: '#cfb188',
        bandA: 'rgba(178, 145, 104, 0.14)',
        bandB: 'rgba(238, 220, 194, 0.1)',
        line: 'rgba(107, 78, 49, 0.28)',
        accent: 'rgba(149, 114, 72, 0.36)',
      });
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.center.set(0.5, 0.5);
  texture.rotation = defaultGrainDirection(panel) === 'vertical' ? Math.PI / 2 : 0;
  texture.repeat.set(
    Math.max(1, (panel.cutWidth || panel.sizeX || 300) / 500),
    Math.max(1, (panel.cutHeight || panel.sizeY || 300) / 500),
  );
  texture.needsUpdate = true;
  return texture;
}

export function createPanelMaterial(panel) {
  const texture = createTextureForPanel(panel);
  const kind = classifyMaterial(panel.materialLabel);
  const base = baseColorForKind(kind, panel.color || 0xd8c29f);
  const mixTarget = (
    kind === 'white-melamine' ||
    kind === 'white-hardboard' ||
    kind === 'painted-mdf' ||
    kind === 'gloss'
  ) ? 0xffffff : 0xffffff;
  const mixAmount = (
    kind === 'white-melamine' ||
    kind === 'white-hardboard' ||
    kind === 'painted-mdf' ||
    kind === 'gloss'
  ) ? 0.58 : 0.14;
  const material = new THREE.MeshStandardMaterial({
    color: mixHex(base, mixTarget, mixAmount),
    map: texture,
    roughness: kind.includes('gloss') ? 0.18 : 0.72,
    metalness: 0.0,
  });
  material.userData.generatedTexture = texture;
  return material;
}

export function disposePanelMaterial(material) {
  if (Array.isArray(material)) {
    for (const entry of material) disposePanelMaterial(entry);
    return;
  }
  if (!material) return;
  if (material.userData?.generatedTexture) {
    material.userData.generatedTexture.dispose();
  }
  material.dispose();
}
